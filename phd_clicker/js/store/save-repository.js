import {
    CURRENT_SCHEMA_VERSION,
    SAVE_FORMAT,
    createDefaultMetaState,
    createDefaultSaveEnvelope
} from './schema.js';
import {
    cloneJsonValue,
    isPlainRecord,
    normalizeGameState,
    normalizeMetaState
} from './normalize.js';
import {
    InvalidSaveError,
    UnsupportedSchemaVersionError,
    isVersionedSaveEnvelope,
    migrateSave
} from './migrations.js';
import {
    createWebCryptoChecksumAdapter,
    sealEnvelope,
    verifyEnvelopeChecksum
} from './checksum.js';

export const DEFAULT_SAVE_KEY = 'phd-clicker-save';

export class SaveStorageError extends Error {
    constructor(operation, cause) {
        super(`Save storage operation failed: ${operation}`, { cause });
        this.name = 'SaveStorageError';
        this.code = 'SAVE_STORAGE_ERROR';
        this.operation = operation;
    }
}

function requireStorage(storage) {
    const methods = ['getItem', 'setItem', 'removeItem'];
    if (!storage || methods.some(method => typeof storage[method] !== 'function')) {
        throw new TypeError('SaveRepository requires a localStorage-compatible adapter');
    }
    return storage;
}

function safeReason(reason) {
    return String(reason || 'invalid')
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'invalid';
}

function resultFromEnvelope({
    status,
    source,
    envelope,
    migrated = false,
    migratedFrom = null,
    integrity = null,
    recoveredFromPrevious = false,
    quarantineKeys = [],
    error = null
}) {
    return {
        status,
        source,
        envelope,
        gameState: envelope?.gameState ?? null,
        metaState: envelope?.metaState ?? null,
        migrated,
        migratedFrom,
        integrity,
        recoveredFromPrevious,
        quarantineKeys,
        error
    };
}

/**
 * Async save facade over synchronous localStorage. The async boundary comes
 * from Web Crypto and leaves room for a future IndexedDB implementation.
 */
export class SaveRepository {
    constructor({
        storage = globalThis.localStorage,
        key = DEFAULT_SAVE_KEY,
        previousKey = `${key}:prev`,
        quarantinePrefix = `${key}:quarantine:`,
        clock = Date.now,
        checksumAdapter = createWebCryptoChecksumAdapter()
    } = {}) {
        this.storage = requireStorage(storage);
        this.key = key;
        this.previousKey = previousKey;
        this.quarantinePrefix = quarantinePrefix;
        this.clock = clock;
        this.checksumAdapter = checksumAdapter;
    }

    /** Build, seal, and persist a save from domain state. */
    async save(gameState, {
        metaState = createDefaultMetaState(),
        envelopeExtensions = {},
        beforeWrite = null
    } = {}) {
        if (!isPlainRecord(envelopeExtensions)) {
            throw new TypeError('envelopeExtensions must be an object');
        }

        const savedAt = this.clock();
        const envelope = cloneJsonValue(envelopeExtensions);
        envelope.format = SAVE_FORMAT;
        envelope.schemaVersion = CURRENT_SCHEMA_VERSION;
        envelope.savedAt = savedAt;
        envelope.gameState = normalizeGameState(gameState, { now: () => savedAt });
        envelope.gameState.lastSaveTime = savedAt;
        envelope.metaState = normalizeMetaState(metaState);
        envelope.checksum = null;

        return this.#sealAndWrite(envelope, { beforeWrite });
    }

    /**
     * Re-save a loaded envelope while retaining unknown top-level extensions.
     * This is the preferred API after load() when forward-compatible fields
     * must survive a read/write round trip.
     */
    async saveEnvelope(envelope, { touchSavedAt = true, beforeWrite = null } = {}) {
        const migrated = migrateSave(envelope, { now: this.clock });
        const normalized = migrated.envelope;

        if (touchSavedAt) {
            const savedAt = this.clock();
            normalized.savedAt = savedAt;
            normalized.gameState.lastSaveTime = savedAt;
        }
        normalized.checksum = null;
        return this.#sealAndWrite(normalized, { beforeWrite });
    }

    async #sealAndWrite(envelope, { beforeWrite = null } = {}) {
        const sealed = await sealEnvelope(envelope, this.checksumAdapter);
        const raw = JSON.stringify(sealed);

        let previousRaw;
        try {
            previousRaw = this.storage.getItem(this.key);
        } catch (error) {
            throw new SaveStorageError('read-current-before-save', error);
        }

        try {
            // Re-check after asynchronous checksum work and immediately before
            // the first localStorage mutation. The callback must stay sync so
            // no new cross-tab epoch can slip through another await boundary.
            if (beforeWrite !== null) {
                if (typeof beforeWrite !== 'function') {
                    throw new TypeError('beforeWrite must be a function');
                }
                if (beforeWrite(sealed) === false) {
                    throw new Error('Save write rejected by beforeWrite guard');
                }
            }
            if (previousRaw !== null) {
                this.storage.setItem(this.previousKey, previousRaw);
            }
            this.storage.setItem(this.key, raw);
        } catch (error) {
            if (error?.code === 'SAVE_WRITE_BLOCKED') throw error;
            throw new SaveStorageError('write', error);
        }

        return {
            envelope: sealed,
            raw,
            previousBackedUp: previousRaw !== null
        };
    }

    /** Load, verify, normalize, and (when necessary) migrate a save. */
    async load() {
        let raw;
        try {
            raw = this.storage.getItem(this.key);
        } catch (error) {
            return resultFromEnvelope({
                status: 'storage-error',
                source: 'none',
                envelope: null,
                error: new SaveStorageError('read', error)
            });
        }

        if (raw === null) {
            return resultFromEnvelope({
                status: 'empty',
                source: 'defaults',
                envelope: createDefaultSaveEnvelope({ now: this.clock })
            });
        }

        try {
            return await this.#decode(raw, 'primary');
        } catch (error) {
            if (error instanceof UnsupportedSchemaVersionError) {
                return resultFromEnvelope({
                    status: 'unsupported-version',
                    source: 'primary',
                    envelope: null,
                    error
                });
            }

            return this.#recoverFromInvalidPrimary(raw, error);
        }
    }

    async #decode(raw, source) {
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            throw new InvalidSaveError('Save is not valid JSON', { cause: error });
        }

        let integrity = {
            valid: null,
            reason: 'legacy-unsealed',
            expected: null,
            actual: null,
            algorithm: null
        };

        if (isVersionedSaveEnvelope(parsed)) {
            const version = Number(parsed.schemaVersion);
            if (Number.isInteger(version) && version === CURRENT_SCHEMA_VERSION) {
                integrity = await verifyEnvelopeChecksum(parsed, this.checksumAdapter);
            }
        }

        const migrated = migrateSave(parsed, { now: this.clock });
        let status = migrated.migrated ? 'migrated' : 'ok';
        if (!migrated.migrated && integrity.valid === false) {
            status = integrity.reason === 'unsupported-algorithm'
                ? 'unsupported-checksum'
                : 'integrity-mismatch';
        }

        return resultFromEnvelope({
            status,
            source,
            envelope: migrated.envelope,
            migrated: migrated.migrated,
            migratedFrom: migrated.migratedFrom,
            integrity
        });
    }

    async #recoverFromInvalidPrimary(raw, primaryError) {
        const quarantineKeys = [];
        const primaryQuarantine = this.#quarantine(this.key, raw, primaryError.code);
        if (primaryQuarantine) quarantineKeys.push(primaryQuarantine);

        let previousRaw = null;
        try {
            previousRaw = this.storage.getItem(this.previousKey);
        } catch {
            // The primary error remains the useful diagnostic.
        }

        if (previousRaw !== null) {
            try {
                const recovered = await this.#decode(previousRaw, 'previous');
                try {
                    this.storage.setItem(this.key, previousRaw);
                } catch {
                    // Returning the valid previous state is still useful; a later
                    // autosave can promote it if this write was transiently blocked.
                }

                return {
                    ...recovered,
                    status: 'recovered-previous',
                    recoveredFromPrevious: true,
                    quarantineKeys,
                    error: primaryError
                };
            } catch (previousError) {
                const previousQuarantine = this.#quarantine(
                    this.previousKey,
                    previousRaw,
                    previousError.code
                );
                if (previousQuarantine) quarantineKeys.push(previousQuarantine);
            }
        }

        return resultFromEnvelope({
            status: 'corrupt',
            source: 'defaults',
            envelope: createDefaultSaveEnvelope({ now: this.clock }),
            quarantineKeys,
            error: primaryError
        });
    }

    /** Preserve the exact invalid raw string before removing its active key. */
    #quarantine(sourceKey, raw, reason) {
        const base = `${this.quarantinePrefix}${this.clock()}:${safeReason(reason)}`;
        let quarantineKey = base;

        try {
            let suffix = 1;
            while (this.storage.getItem(quarantineKey) !== null) {
                quarantineKey = `${base}:${suffix++}`;
            }
            this.storage.setItem(quarantineKey, raw);
            this.storage.removeItem(sourceKey);
            return quarantineKey;
        } catch {
            // Never remove the only copy if quarantine itself cannot be written.
            return null;
        }
    }

    getRaw() {
        try {
            return this.storage.getItem(this.key);
        } catch (error) {
            throw new SaveStorageError('read-raw', error);
        }
    }

    clearPrevious() {
        try {
            this.storage.removeItem(this.previousKey);
        } catch (error) {
            throw new SaveStorageError('clear-previous', error);
        }
    }

    clear({ includePrevious = true } = {}) {
        try {
            this.storage.removeItem(this.key);
            if (includePrevious) this.storage.removeItem(this.previousKey);
        } catch (error) {
            throw new SaveStorageError('clear', error);
        }
    }
}
