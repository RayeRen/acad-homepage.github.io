import {
    canonicalStringify,
    createWebCryptoChecksumAdapter,
    verifyEnvelopeChecksum
} from './checksum.js';
import { cloneJsonValue, isPlainRecord } from './normalize.js';

export const DEFAULT_REFLOG_DATABASE = 'phd-clicker-reflog';
export const DEFAULT_REFLOG_STORE = 'objects';
export const DEFAULT_REFLOG_CAPACITY = 32;
export const ANNIHILATION_REASON = 'annihilation';

export class ReflogCapabilityError extends Error {
    constructor(message = 'IndexedDB is unavailable in this browser context') {
        super(message);
        this.name = 'ReflogCapabilityError';
        this.code = 'REFLOG_INDEXEDDB_UNAVAILABLE';
    }
}

export class ReflogIntegrityError extends Error {
    constructor(stage, integrity, options) {
        super(`Reflog envelope failed integrity verification during ${stage}`, options);
        this.name = 'ReflogIntegrityError';
        this.code = 'REFLOG_INTEGRITY_ERROR';
        this.stage = stage;
        this.integrity = integrity;
    }
}

export class ReflogWriteVerificationError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'ReflogWriteVerificationError';
        this.code = 'REFLOG_WRITE_VERIFICATION_FAILED';
    }
}

export class ReflogStorageError extends Error {
    constructor(operation, cause) {
        super(`Reflog storage operation failed: ${operation}`, { cause });
        this.name = 'ReflogStorageError';
        this.code = 'REFLOG_STORAGE_ERROR';
        this.operation = operation;
    }
}

export function isIndexedDbAvailable(indexedDB = globalThis.indexedDB) {
    return Boolean(indexedDB && typeof indexedDB.open === 'function');
}

function requestError(request, operation) {
    return new ReflogStorageError(
        operation,
        request?.error || new Error(`IndexedDB request failed: ${operation}`)
    );
}

/** Minimal production backend; tests inject an in-memory implementation. */
export class IndexedDbReflogBackend {
    constructor({
        indexedDB = globalThis.indexedDB,
        databaseName = DEFAULT_REFLOG_DATABASE,
        storeName = DEFAULT_REFLOG_STORE,
        version = 1
    } = {}) {
        if (!isIndexedDbAvailable(indexedDB)) throw new ReflogCapabilityError();
        this.indexedDB = indexedDB;
        this.databaseName = databaseName;
        this.storeName = storeName;
        this.version = version;
        this.databasePromise = null;
    }

    async #open() {
        if (this.databasePromise) return this.databasePromise;

        this.databasePromise = new Promise((resolve, reject) => {
            let request;
            try {
                request = this.indexedDB.open(this.databaseName, this.version);
            } catch (error) {
                reject(new ReflogStorageError('open', error));
                return;
            }

            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains(this.storeName)) {
                    const store = database.createObjectStore(this.storeName, {
                        keyPath: 'objectId'
                    });
                    store.createIndex('archivedAt', 'archivedAt', { unique: false });
                    store.createIndex('recoveredAt', 'recoveredAt', { unique: false });
                }
            };
            request.onsuccess = () => {
                const database = request.result;
                database.onversionchange = () => database.close();
                resolve(database);
            };
            request.onerror = () => reject(requestError(request, 'open'));
            request.onblocked = () => reject(new ReflogStorageError(
                'open-blocked',
                new Error('IndexedDB upgrade is blocked by another page')
            ));
        });

        try {
            return await this.databasePromise;
        } catch (error) {
            this.databasePromise = null;
            throw error;
        }
    }

    async #run(mode, operation, makeRequest) {
        const database = await this.#open();
        return new Promise((resolve, reject) => {
            let transaction;
            let request;
            let result;
            let settled = false;

            const fail = error => {
                if (settled) return;
                settled = true;
                reject(error instanceof ReflogStorageError
                    ? error
                    : new ReflogStorageError(operation, error));
            };

            try {
                transaction = database.transaction(this.storeName, mode);
                request = makeRequest(transaction.objectStore(this.storeName));
            } catch (error) {
                fail(error);
                return;
            }

            request.onsuccess = () => { result = request.result; };
            request.onerror = () => fail(requestError(request, operation));
            transaction.onabort = () => fail(new ReflogStorageError(
                operation,
                transaction.error || new Error('IndexedDB transaction aborted')
            ));
            transaction.onerror = () => {
                // onabort/request.onerror carries the actionable result.
            };
            transaction.oncomplete = () => {
                if (settled) return;
                settled = true;
                resolve(result);
            };
        });
    }

    async put(record) {
        await this.#run('readwrite', 'put', store => store.put(record));
    }

    async get(objectId) {
        return (await this.#run('readonly', 'get', store => store.get(objectId))) ?? null;
    }

    async getAll() {
        return (await this.#run('readonly', 'getAll', store => store.getAll())) || [];
    }

    async delete(objectId) {
        await this.#run('readwrite', 'delete', store => store.delete(objectId));
    }

    async close() {
        if (!this.databasePromise) return;
        try {
            const database = await this.databasePromise;
            database.close();
        } finally {
            this.databasePromise = null;
        }
    }
}

function requireBackend(backend) {
    const methods = ['put', 'get', 'getAll', 'delete'];
    if (!backend || methods.some(method => typeof backend[method] !== 'function')) {
        throw new TypeError('ReflogRepository requires an async reflog backend');
    }
    return backend;
}

function normalizeCapacity(value) {
    if (!Number.isFinite(value)) return DEFAULT_REFLOG_CAPACITY;
    return Math.max(1, Math.min(5000, Math.floor(value)));
}

function normalizeTime(value, fallback) {
    return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeReason(value) {
    if (typeof value !== 'string' || !value.trim()) return 'checkpoint';
    return value.trim().slice(0, 128);
}

function normalizeMetadata(value) {
    if (value === undefined || value === null) return {};
    if (!isPlainRecord(value)) throw new TypeError('reflog metadata must be an object');
    return cloneJsonValue(value);
}

function cloneRecord(record) {
    return cloneJsonValue(record);
}

function hasReason(record, reason) {
    return record.reason === reason || (
        Array.isArray(record.reasons) && record.reasons.includes(reason)
    );
}

function isRecovered(record) {
    return record.recoveredAt !== null && record.recoveredAt !== undefined;
}

function isProtectedAnnihilation(record) {
    return hasReason(record, ANNIHILATION_REASON) && !isRecovered(record);
}

/** Content-addressed identity derived from the already-verified envelope. */
export function getReflogObjectId(envelope) {
    const algorithm = envelope?.checksum?.algorithm;
    const value = envelope?.checksum?.value;
    if (typeof algorithm !== 'string' || !algorithm || typeof value !== 'string' || !value) {
        throw new ReflogIntegrityError('object-id', {
            valid: false,
            reason: 'missing',
            algorithm: algorithm ?? null,
            expected: value ?? null,
            actual: null
        });
    }
    if (algorithm.length > 128 || value.length > 1024) {
        throw new ReflogIntegrityError('object-id', {
            valid: false,
            reason: 'invalid-checksum-identifier',
            algorithm,
            expected: null,
            actual: null
        });
    }
    return `obj:${encodeURIComponent(algorithm)}:${encodeURIComponent(value)}`;
}

export class ReflogRepository {
    constructor({
        backend = new IndexedDbReflogBackend(),
        checksumAdapter = createWebCryptoChecksumAdapter(),
        clock = Date.now,
        maxEntries = DEFAULT_REFLOG_CAPACITY
    } = {}) {
        this.backend = requireBackend(backend);
        if (!checksumAdapter || typeof checksumAdapter.digest !== 'function') {
            throw new TypeError('checksumAdapter must provide digest(text)');
        }
        if (typeof clock !== 'function') throw new TypeError('clock must be a function');
        this.checksumAdapter = checksumAdapter;
        this.clock = clock;
        this.maxEntries = normalizeCapacity(maxEntries);
    }

    async #verifyEnvelope(envelope, stage) {
        let integrity;
        try {
            integrity = await verifyEnvelopeChecksum(envelope, this.checksumAdapter);
        } catch (error) {
            throw new ReflogIntegrityError(stage, {
                valid: false,
                reason: 'verification-error',
                expected: null,
                actual: null,
                algorithm: envelope?.checksum?.algorithm ?? null
            }, { cause: error });
        }
        if (!integrity.valid) throw new ReflogIntegrityError(stage, integrity);
        return integrity;
    }

    async #verifyRecord(record, stage = 'read') {
        if (!isPlainRecord(record) || typeof record.objectId !== 'string' ||
            !isPlainRecord(record.envelope)) {
            throw new ReflogIntegrityError(stage, {
                valid: false,
                reason: 'invalid-record',
                expected: null,
                actual: null,
                algorithm: null
            });
        }
        const integrity = await this.#verifyEnvelope(record.envelope, stage);
        const expectedObjectId = getReflogObjectId(record.envelope);
        if (expectedObjectId !== record.objectId) {
            throw new ReflogIntegrityError(stage, {
                valid: false,
                reason: 'object-id-mismatch',
                expected: expectedObjectId,
                actual: record.objectId,
                algorithm: record.envelope.checksum.algorithm
            });
        }
        return integrity;
    }

    async #restoreAfterFailedWrite(objectId, previous) {
        try {
            if (previous) await this.backend.put(previous);
            else await this.backend.delete(objectId);
        } catch {
            // Preserve the original verification error; callers must treat the
            // archive as failed regardless of cleanup success.
        }
    }

    async #putAndVerify(record, previous = null) {
        try {
            await this.backend.put(cloneRecord(record));
            const stored = await this.backend.get(record.objectId);
            if (!stored) {
                throw new ReflogWriteVerificationError(
                    `Reflog object ${record.objectId} was not readable after write`
                );
            }
            await this.#verifyRecord(stored, 'after-write');
            if (canonicalStringify(stored) !== canonicalStringify(record)) {
                throw new ReflogWriteVerificationError(
                    `Reflog object ${record.objectId} changed during persistence`
                );
            }
            return cloneRecord(stored);
        } catch (error) {
            await this.#restoreAfterFailedWrite(record.objectId, previous);
            throw error;
        }
    }

    /**
     * Archive one sealed envelope. The same content always receives the same
     * objectId; re-archiving updates its latest reflog time and accumulated
     * reasons without duplicating the object.
     */
    async archive(envelope, {
        reason = 'checkpoint',
        metadata = {},
        prune = true
    } = {}) {
        const snapshot = cloneJsonValue(envelope);
        const integrityBefore = await this.#verifyEnvelope(snapshot, 'before-write');
        const objectId = getReflogObjectId(snapshot);
        const previous = await this.backend.get(objectId);
        if (previous) await this.#verifyRecord(previous, 'existing-record');

        const archivedAt = normalizeTime(this.clock(), 0);
        const normalizedReason = normalizeReason(reason);
        const reasons = new Set(Array.isArray(previous?.reasons) ? previous.reasons : []);
        if (previous?.reason) reasons.add(previous.reason);
        reasons.add(normalizedReason);
        const record = {
            objectId,
            createdAt: normalizeTime(previous?.createdAt, archivedAt),
            archivedAt,
            reason: normalizedReason,
            reasons: [...reasons],
            recoveredAt: normalizedReason === ANNIHILATION_REASON
                ? null
                : (previous?.recoveredAt ?? null),
            envelope: snapshot,
            metadata: {
                ...(isPlainRecord(previous?.metadata) ? cloneJsonValue(previous.metadata) : {}),
                ...normalizeMetadata(metadata)
            }
        };

        const stored = await this.#putAndVerify(record, previous);
        let pruneResult = null;
        let pruneError = null;
        if (prune) {
            try {
                pruneResult = await this.prune();
            } catch (error) {
                // The content-addressed object is already durable and verified.
                // Capacity maintenance must never turn that successful archive
                // into a failed annihilation transaction or a ghost checkpoint.
                pruneError = {
                    name: error?.name || 'Error',
                    code: error?.code || null,
                    message: error?.message || String(error)
                };
            }
        }
        return {
            objectId,
            created: !previous,
            record: stored,
            integrity: integrityBefore,
            prune: pruneResult,
            pruneError
        };
    }

    async get(objectId) {
        if (typeof objectId !== 'string' || !objectId) return null;
        const record = await this.backend.get(objectId);
        if (!record) return null;
        await this.#verifyRecord(record, 'get');
        return cloneRecord(record);
    }

    async list({
        reason,
        recovered,
        protectedOnly = false,
        order = 'desc',
        limit = Number.POSITIVE_INFINITY,
        verify = true
    } = {}) {
        const records = await this.backend.getAll();
        const verified = [];
        for (const record of records) {
            if (verify) await this.#verifyRecord(record, 'list');
            verified.push(record);
        }

        const filtered = verified.filter(record =>
            (reason === undefined || hasReason(record, reason)) &&
            (recovered === undefined || isRecovered(record) === Boolean(recovered)) &&
            (!protectedOnly || isProtectedAnnihilation(record))
        );
        filtered.sort((left, right) => {
            const difference = normalizeTime(left.archivedAt, 0) -
                normalizeTime(right.archivedAt, 0);
            const stable = difference || String(left.objectId).localeCompare(String(right.objectId));
            return order === 'asc' ? stable : -stable;
        });

        const normalizedLimit = Number.isFinite(limit)
            ? Math.max(0, Math.floor(limit))
            : filtered.length;
        return filtered.slice(0, normalizedLimit).map(cloneRecord);
    }

    async findLatest(filters = {}) {
        const [latest] = await this.list({ ...filters, order: 'desc', limit: 1 });
        return latest || null;
    }

    async markRecovered(objectId, { recoveredAt = this.clock() } = {}) {
        const previous = await this.get(objectId);
        if (!previous) return null;
        const updated = {
            ...previous,
            recoveredAt: normalizeTime(recoveredAt, normalizeTime(this.clock(), 0))
        };
        return this.#putAndVerify(updated, previous);
    }

    /**
     * Remove oldest eligible objects until capacity is met. An unrecovered
     * annihilation checkpoint is never an eligible automatic-prune candidate;
     * protected checkpoints may therefore intentionally leave an overflow.
     */
    async prune({ maxEntries = this.maxEntries } = {}) {
        const capacity = normalizeCapacity(maxEntries);
        const records = await this.list({ order: 'asc' });
        let remaining = records.length;
        const removedIds = [];

        for (const record of records) {
            if (remaining <= capacity) break;
            if (isProtectedAnnihilation(record)) continue;
            await this.backend.delete(record.objectId);
            removedIds.push(record.objectId);
            remaining -= 1;
        }

        return {
            capacity,
            initialCount: records.length,
            retainedCount: remaining,
            removedIds,
            overflow: Math.max(0, remaining - capacity),
            protectedCount: records.filter(isProtectedAnnihilation).length
        };
    }

    async close() {
        if (typeof this.backend.close === 'function') await this.backend.close();
    }
}
