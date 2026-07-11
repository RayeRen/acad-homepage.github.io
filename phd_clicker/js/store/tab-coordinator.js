export const DEFAULT_WORLD_EPOCH_KEY = 'phd-clicker-world-epoch';
export const DEFAULT_WORLD_BARRIER_KEY = 'phd-clicker-world-barrier';
export const DEFAULT_WORLD_TOMBSTONE_KEY = 'phd-clicker-world-tombstone';
export const DEFAULT_COORDINATION_CHANNEL = 'phd-clicker-world-coordination';
export const MAX_ACK_TIMEOUT_MS = 1500;
export const DEFAULT_BARRIER_LEASE_MS = 15000;

export class TabCoordinationStorageError extends Error {
    constructor(operation, cause) {
        super(`Tab coordination storage operation failed: ${operation}`, { cause });
        this.name = 'TabCoordinationStorageError';
        this.code = 'TAB_COORDINATION_STORAGE_ERROR';
        this.operation = operation;
    }
}

export class BarrierConflictError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'BarrierConflictError';
        this.code = 'WORLD_BARRIER_CONFLICT';
        Object.assign(this, details);
    }
}

export class BarrierCommittedError extends Error {
    constructor(tokenId) {
        super(`World barrier ${tokenId} has already committed and cannot be aborted`);
        this.name = 'BarrierCommittedError';
        this.code = 'WORLD_BARRIER_ALREADY_COMMITTED';
        this.tokenId = tokenId;
    }
}

function createTabId(cryptoImpl = globalThis.crypto) {
    if (typeof cryptoImpl?.randomUUID === 'function') return cryptoImpl.randomUUID();
    return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function requireStorage(storage) {
    const methods = ['getItem', 'setItem', 'removeItem'];
    if (!storage || methods.some(method => typeof storage[method] !== 'function')) {
        throw new TypeError('TabCoordinator requires a localStorage-compatible adapter');
    }
    return storage;
}

function defaultTimers() {
    return {
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis)
    };
}

function requireTimers(timers) {
    const methods = ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'];
    if (!timers || methods.some(method => typeof timers[method] !== 'function')) {
        throw new TypeError('timers must provide timeout and interval functions');
    }
    return timers;
}

function createDefaultChannel(name, BroadcastChannelImpl = globalThis.BroadcastChannel) {
    if (typeof BroadcastChannelImpl !== 'function') return null;
    try {
        return new BroadcastChannelImpl(name);
    } catch {
        return null;
    }
}

function normalizeEpoch(value) {
    if (value === '' || value === null || typeof value === 'boolean') return null;
    const epoch = Number(value);
    return Number.isSafeInteger(epoch) && epoch >= 0 ? epoch : null;
}

function normalizeTimeout(value, fallback = MAX_ACK_TIMEOUT_MS) {
    const timeout = Number(value);
    if (!Number.isFinite(timeout)) return fallback;
    return Math.max(0, Math.min(MAX_ACK_TIMEOUT_MS, Math.floor(timeout)));
}

function normalizeLease(value, heartbeatMs) {
    const lease = Number(value);
    const fallback = Math.max(DEFAULT_BARRIER_LEASE_MS, heartbeatMs * 3);
    if (!Number.isFinite(lease)) return fallback;
    return Math.max(heartbeatMs * 3, Math.floor(lease));
}

function normalizeReason(value, fallback = 'world-transition') {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    return value.trim().slice(0, 256);
}

function tokenId(token) {
    if (typeof token === 'string') return token;
    return typeof token?.id === 'string' ? token.id : '';
}

function cloneJson(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeCommitMetadata(value) {
    if (value === undefined || value === null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('commit metadata must be an object');
    }
    let cloned;
    try {
        cloned = cloneJson(value);
    } catch (cause) {
        throw new TypeError('commit metadata must be JSON-serializable', { cause });
    }
    const metadata = {};
    if (typeof cloned.objectId === 'string' && cloned.objectId.trim()) {
        metadata.objectId = cloned.objectId.trim().slice(0, 1024);
    } else if (cloned.objectId === null) {
        metadata.objectId = null;
    }
    if (typeof cloned.checksum === 'string') {
        metadata.checksum = cloned.checksum.slice(0, 1024);
    } else if (cloned.checksum === null) {
        metadata.checksum = null;
    }
    if (typeof cloned.recovery === 'boolean') {
        metadata.recovery = cloned.recovery;
    }
    return metadata;
}

function activeBarrier(barrier) {
    // Expiry is intentionally not decided here. The reconciler may release an
    // expired lease only after the persisted epoch proves it is still safe to
    // abort; all ordinary readers continue to treat pending as a hard barrier.
    return barrier?.status === 'pending';
}

/**
 * Coordinates destructive world transitions while keeping localStorage epoch
 * checks as the authority. BroadcastChannel is only a best-effort flush/ack
 * optimization; stale writers remain invalid even when messaging is absent.
 */
export class TabCoordinator {
    constructor(options = {}) {
        const {
            storage = globalThis.localStorage,
            clock = Date.now,
            timers = defaultTimers(),
            tabId = createTabId(),
            epochKey = DEFAULT_WORLD_EPOCH_KEY,
            barrierKey = DEFAULT_WORLD_BARRIER_KEY,
            tombstoneKey = DEFAULT_WORLD_TOMBSTONE_KEY,
            channelName = DEFAULT_COORDINATION_CHANNEL,
            ackTimeoutMs = MAX_ACK_TIMEOUT_MS,
            heartbeatMs = 1000,
            peerTtlMs = 4000,
            barrierLeaseMs = DEFAULT_BARRIER_LEASE_MS,
            onBarrier = async () => undefined
        } = options;

        this.storage = requireStorage(storage);
        if (typeof clock !== 'function') throw new TypeError('clock must be a function');
        if (typeof onBarrier !== 'function') throw new TypeError('onBarrier must be a function');
        this.clock = clock;
        this.timers = requireTimers(timers);
        this.tabId = String(tabId);
        this.epochKey = epochKey;
        this.barrierKey = barrierKey;
        this.tombstoneKey = tombstoneKey;
        this.ackTimeoutMs = normalizeTimeout(ackTimeoutMs);
        this.heartbeatMs = Math.max(250, Number(heartbeatMs) || 1000);
        this.peerTtlMs = Math.max(this.heartbeatMs * 2, Number(peerTtlMs) || 4000);
        this.barrierLeaseMs = normalizeLease(barrierLeaseMs, this.heartbeatMs);
        this.onBarrier = onBarrier;
        this.sequence = 0;
        this.destroyed = false;
        this.peers = new Map();
        this.acknowledgements = new Map();
        this.waiters = new Map();
        this.handledBarriers = new Map();
        this.localBarriers = new Map();
        this.blockedBarrier = null;

        this.#ensureEpochKey();
        this.writerEpoch = this.getCurrentEpoch();
        // A browser can be terminated between any two localStorage mutations
        // in commitBarrier(). Repair only transitions whose epoch/tombstone
        // combination proves the safe outcome; ambiguous state stays blocked.
        this.reconcilePersistentTransition();

        const hasInjectedChannel = Object.prototype.hasOwnProperty.call(options, 'channel');
        this.channel = hasInjectedChannel
            ? options.channel
            : createDefaultChannel(channelName, options.BroadcastChannelImpl);
        this.messageHandler = event => this.#handleMessage(event?.data ?? event);
        this.usesEventListener = false;
        if (this.channel) {
            if (typeof this.channel.addEventListener === 'function') {
                this.channel.addEventListener('message', this.messageHandler);
                this.usesEventListener = true;
            } else {
                this.channel.onmessage = this.messageHandler;
            }
            this.#post('hello');
        }
        // Lease renewal is required even without BroadcastChannel. Messaging
        // is only an optimization, while the persisted lease is authoritative.
        this.heartbeatId = this.timers.setInterval(() => {
            this.#renewOwnedBarrierLeases();
            this.#post('heartbeat');
        }, this.heartbeatMs);
    }

    #getRaw(key) {
        try {
            return this.storage.getItem(key);
        } catch (error) {
            throw new TabCoordinationStorageError(`read:${key}`, error);
        }
    }

    #setRaw(key, value) {
        try {
            this.storage.setItem(key, value);
        } catch (error) {
            throw new TabCoordinationStorageError(`write:${key}`, error);
        }
    }

    #remove(key) {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            throw new TabCoordinationStorageError(`remove:${key}`, error);
        }
    }

    #readJson(key) {
        const raw = this.#getRaw(key);
        if (raw === null) return null;
        try {
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new TypeError('record is not an object');
            }
            return parsed;
        } catch (error) {
            throw new TabCoordinationStorageError(`parse:${key}`, error);
        }
    }

    #writeJson(key, value) {
        this.#setRaw(key, JSON.stringify(value));
    }

    #ensureEpochKey() {
        const raw = this.#getRaw(this.epochKey);
        if (raw === null) {
            this.#setRaw(this.epochKey, '0');
            return;
        }
        if (normalizeEpoch(raw) === null) {
            throw new TabCoordinationStorageError(
                `parse:${this.epochKey}`,
                new Error('Persisted world epoch is invalid')
            );
        }
    }

    getCurrentEpoch() {
        const epoch = normalizeEpoch(this.#getRaw(this.epochKey));
        if (epoch === null) {
            throw new TabCoordinationStorageError(
                `parse:${this.epochKey}`,
                new Error('Persisted world epoch is invalid')
            );
        }
        return epoch;
    }

    getWriterEpoch() {
        return this.writerEpoch;
    }

    #barrierLeaseDeadline(barrier) {
        const rawExplicit = barrier?.leaseUntil;
        const explicit = rawExplicit === null || rawExplicit === '' ||
            typeof rawExplicit === 'boolean'
            ? Number.NaN
            : Number(rawExplicit);
        if (Number.isFinite(explicit) && explicit >= 0) return explicit;
        const rawStartedAt = barrier?.startedAt;
        const startedAt = rawStartedAt === null || rawStartedAt === '' ||
            typeof rawStartedAt === 'boolean'
            ? Number.NaN
            : Number(rawStartedAt);
        if (!Number.isFinite(startedAt) || startedAt < 0) return null;
        // Legacy pending records did not carry leaseUntil. Giving them one
        // deterministic lease window makes old crash debris recoverable.
        return startedAt + this.barrierLeaseMs;
    }

    #isBarrierExpired(barrier, now = this.clock()) {
        const deadline = this.#barrierLeaseDeadline(barrier);
        return deadline !== null && Number(now) >= deadline;
    }

    #tombstoneMatchesBarrier(tombstone, barrier) {
        return Boolean(
            tombstone && barrier &&
            tombstone.barrierId === barrier.id &&
            normalizeEpoch(tombstone.fromEpoch) === normalizeEpoch(barrier.fromEpoch) &&
            normalizeEpoch(tombstone.toEpoch) === normalizeEpoch(barrier.toEpoch)
        );
    }

    #settleLocalBarrier(id, {
        committed = false,
        aborted = false,
        tombstone = null,
        reason = 'aborted'
    } = {}) {
        if (this.blockedBarrier?.id === id) this.blockedBarrier = null;
        for (const waiter of [...(this.waiters.get(id) || [])]) {
            waiter.finish({ committed, aborted });
        }
        this.acknowledgements.delete(id);
        this.localBarriers.delete(id);
        this.handledBarriers.delete(id);
        if (committed) this.#post('commit', { tombstone });
        else if (aborted) {
            this.#post('abort', {
                barrierId: id,
                reason: normalizeReason(reason, 'aborted')
            });
        }
    }

    #renewOwnedBarrierLeases() {
        if (this.destroyed || this.localBarriers.size === 0) return;
        const now = this.clock();
        for (const token of this.localBarriers.values()) {
            try {
                const barrier = this.#readJson(this.barrierKey);
                if (
                    !activeBarrier(barrier) || barrier.id !== token.id ||
                    barrier.ownerId !== this.tabId ||
                    this.getCurrentEpoch() !== barrier.fromEpoch ||
                    this.#isBarrierExpired(barrier, now)
                ) {
                    continue;
                }
                const renewed = {
                    ...barrier,
                    heartbeatAt: now,
                    leaseUntil: now + this.barrierLeaseMs
                };
                this.#writeJson(this.barrierKey, renewed);
                const persisted = this.#readJson(this.barrierKey);
                if (persisted?.id === token.id && persisted.ownerId === this.tabId) {
                    this.blockedBarrier = renewed;
                }
            } catch {
                // A failed renewal simply lets the existing lease expire. The
                // owner must revalidate persistence before it can commit.
            }
        }
    }

    /**
     * Idempotently repair a transition interrupted between localStorage writes.
     * Only epoch-proven commits or expired source-epoch barriers are mutated;
     * every inconsistent combination remains fail-closed for manual recovery.
     */
    reconcilePersistentTransition() {
        const epoch = this.getCurrentEpoch();
        const barrier = this.#readJson(this.barrierKey);
        const tombstone = this.#readJson(this.tombstoneKey);

        if (!activeBarrier(barrier)) {
            if (
                tombstone?.status === 'committing' &&
                typeof tombstone.barrierId === 'string' && tombstone.barrierId &&
                normalizeEpoch(tombstone.fromEpoch) !== null &&
                normalizeEpoch(tombstone.toEpoch) > normalizeEpoch(tombstone.fromEpoch) &&
                normalizeEpoch(tombstone.toEpoch) === epoch
            ) {
                const committed = {
                    ...tombstone,
                    status: 'committed',
                    committedAt: Number.isFinite(tombstone.committedAt)
                        ? tombstone.committedAt
                        : this.clock()
                };
                this.#writeJson(this.tombstoneKey, committed);
                this.#settleLocalBarrier(committed.barrierId, {
                    committed: true,
                    tombstone: committed
                });
                return {
                    status: 'commit-completed',
                    epoch,
                    tombstone: cloneJson(committed)
                };
            }
            return { status: barrier ? 'inconsistent' : 'none', epoch };
        }

        const fromEpoch = normalizeEpoch(barrier.fromEpoch);
        const toEpoch = normalizeEpoch(barrier.toEpoch);
        if (
            typeof barrier.id !== 'string' || !barrier.id ||
            fromEpoch === null || toEpoch === null || toEpoch <= fromEpoch
        ) {
            return { status: 'inconsistent', epoch, barrier: cloneJson(barrier) };
        }

        const matchingTombstone = this.#tombstoneMatchesBarrier(tombstone, barrier);
        if (epoch === toEpoch && matchingTombstone) {
            let committed = tombstone;
            if (tombstone.status === 'committing') {
                committed = {
                    ...tombstone,
                    status: 'committed',
                    committedAt: Number.isFinite(tombstone.committedAt)
                        ? tombstone.committedAt
                        : this.clock()
                };
                this.#writeJson(this.tombstoneKey, committed);
            } else if (tombstone.status !== 'committed') {
                return { status: 'inconsistent', epoch, barrier: cloneJson(barrier) };
            }

            this.#remove(this.barrierKey);
            this.#settleLocalBarrier(barrier.id, {
                committed: true,
                tombstone: committed
            });
            return {
                status: tombstone.status === 'committing'
                    ? 'commit-completed'
                    : 'committed-barrier-cleared',
                epoch,
                tombstone: cloneJson(committed)
            };
        }

        if (epoch === fromEpoch && this.#isBarrierExpired(barrier)) {
            // A different in-flight tombstone is not evidence that this barrier
            // may be discarded. A prior committed tombstone is expected and is
            // deliberately retained as history.
            if (tombstone?.status === 'committing' && !matchingTombstone) {
                return { status: 'inconsistent', epoch, barrier: cloneJson(barrier) };
            }
            if (matchingTombstone && tombstone.status === 'committed') {
                return { status: 'inconsistent', epoch, barrier: cloneJson(barrier) };
            }
            if (matchingTombstone && tombstone.status !== 'committing') {
                return { status: 'inconsistent', epoch, barrier: cloneJson(barrier) };
            }
            if (matchingTombstone && tombstone.status === 'committing') {
                this.#remove(this.tombstoneKey);
            }
            this.#remove(this.barrierKey);
            this.#settleLocalBarrier(barrier.id, {
                aborted: true,
                reason: 'expired-lease'
            });
            return {
                status: 'expired-barrier-aborted',
                epoch,
                barrierId: barrier.id
            };
        }

        return {
            status: epoch === fromEpoch ? 'pending' : 'inconsistent',
            epoch,
            barrier: cloneJson(barrier)
        };
    }

    /** Always re-read storage; callers must invoke this immediately before a write. */
    canWrite(writerEpoch = this.writerEpoch) {
        try {
            this.reconcilePersistentTransition();
            const normalizedWriterEpoch = normalizeEpoch(writerEpoch);
            if (normalizedWriterEpoch === null || this.getCurrentEpoch() !== normalizedWriterEpoch) {
                return false;
            }
            const barrier = this.#readJson(this.barrierKey);
            if (activeBarrier(barrier) && barrier.fromEpoch === normalizedWriterEpoch) {
                return false;
            }
            const tombstone = this.#readJson(this.tombstoneKey);
            if (tombstone?.status === 'committing' &&
                tombstone.toEpoch === normalizedWriterEpoch) {
                return false;
            }
            return true;
        } catch {
            // Storage uncertainty must fail closed; otherwise a stale tab could
            // overwrite a world while the transition record is unreadable.
            return false;
        }
    }

    /** Owner-only write used to create the final checkpoint behind a barrier. */
    canWriteDuringBarrier(token, writerEpoch = this.writerEpoch) {
        try {
            const id = tokenId(token);
            const owned = this.localBarriers.get(id);
            const epoch = normalizeEpoch(writerEpoch);
            const barrier = this.#readJson(this.barrierKey);
            return Boolean(
                owned && barrier && barrier.status === 'pending' &&
                barrier.id === id && barrier.ownerId === this.tabId &&
                epoch === barrier.fromEpoch && this.getCurrentEpoch() === epoch &&
                !this.#isBarrierExpired(barrier)
            );
        } catch {
            return false;
        }
    }

    getTombstone() {
        try {
            return cloneJson(this.#readJson(this.tombstoneKey));
        } catch {
            return null;
        }
    }

    #activePeerIds() {
        const now = this.clock();
        return [...this.peers.entries()]
            .filter(([peerId, lastSeen]) => peerId !== this.tabId && now - lastSeen <= this.peerTtlMs)
            .map(([peerId]) => peerId)
            .sort();
    }

    #newBarrierId(fromEpoch, toEpoch) {
        this.sequence += 1;
        return `${this.tabId}:${fromEpoch}->${toEpoch}:${this.clock()}:${this.sequence}`;
    }

    beginBarrier({ fromEpoch, toEpoch, reason = 'world-transition' }) {
        if (this.destroyed) throw new Error('TabCoordinator is destroyed');
        this.reconcilePersistentTransition();
        const from = normalizeEpoch(fromEpoch);
        const to = normalizeEpoch(toEpoch);
        if (from === null || to === null || to <= from) {
            throw new TypeError('beginBarrier requires integer epochs with toEpoch > fromEpoch');
        }
        const currentEpoch = this.getCurrentEpoch();
        if (currentEpoch !== from) {
            throw new BarrierConflictError('World epoch changed before barrier acquisition', {
                expectedEpoch: from,
                actualEpoch: currentEpoch
            });
        }
        if (this.writerEpoch !== from) {
            throw new BarrierConflictError('This tab has not claimed the source world epoch', {
                expectedEpoch: from,
                writerEpoch: this.writerEpoch
            });
        }

        const now = this.clock();
        const existing = this.#readJson(this.barrierKey);
        if (activeBarrier(existing)) {
            throw new BarrierConflictError('Another world barrier is already active', {
                existingBarrierId: existing.id
            });
        }
        if (!this.canWrite(from)) {
            throw new BarrierConflictError('Persistent transition state currently blocks writes', {
                expectedEpoch: from
            });
        }

        const peerIds = this.#activePeerIds();
        const barrier = {
            id: this.#newBarrierId(from, to),
            ownerId: this.tabId,
            fromEpoch: from,
            toEpoch: to,
            reason: normalizeReason(reason),
            status: 'pending',
            startedAt: now,
            heartbeatAt: now,
            leaseUntil: now + this.barrierLeaseMs
        };
        this.#writeJson(this.barrierKey, barrier);

        // localStorage has no compare-and-swap primitive. Immediate ownership
        // verification plus commit-time revalidation makes this a safe
        // compare-write: a loser can neither report ownership nor commit.
        const persisted = this.#readJson(this.barrierKey);
        if (persisted?.id !== barrier.id || persisted.ownerId !== this.tabId) {
            throw new BarrierConflictError('World barrier compare-write lost ownership', {
                attemptedBarrierId: barrier.id,
                existingBarrierId: persisted?.id ?? null
            });
        }

        const token = Object.freeze({
            id: barrier.id,
            ownerId: this.tabId,
            fromEpoch: from,
            toEpoch: to,
            reason: barrier.reason,
            peerIds: Object.freeze([...peerIds])
        });
        this.localBarriers.set(token.id, token);
        this.acknowledgements.set(token.id, new Map());
        this.blockedBarrier = barrier;
        this.#post('barrier', { barrier });
        return token;
    }

    #buildAckResult(token, peerIds, {
        timedOut = false,
        destroyed = false,
        aborted = false,
        committed = false
    } = {}) {
        const acknowledgements = this.acknowledgements.get(token.id) || new Map();
        const acked = [];
        const failed = [];
        const missing = [];
        for (const peerId of peerIds) {
            const acknowledgement = acknowledgements.get(peerId);
            if (!acknowledgement) missing.push(peerId);
            else if (acknowledgement.ok) acked.push(peerId);
            else failed.push({ peerId, error: acknowledgement.error || 'barrier callback failed' });
        }
        return {
            barrierId: token.id,
            complete: missing.length === 0 && failed.length === 0,
            allResponded: missing.length === 0,
            timedOut,
            destroyed,
            aborted,
            committed,
            acked,
            failed,
            missing
        };
    }

    waitForAcks(token, {
        peerIds = token?.peerIds,
        timeoutMs = this.ackTimeoutMs
    } = {}) {
        const id = tokenId(token);
        const owned = this.localBarriers.get(id);
        if (!owned) return Promise.reject(new BarrierConflictError('Unknown barrier token'));
        const snapshot = Array.isArray(peerIds)
            ? [...new Set(peerIds.filter(peerId => peerId !== this.tabId))]
            : [...owned.peerIds];
        const boundedTimeout = normalizeTimeout(timeoutMs, this.ackTimeoutMs);

        return new Promise(resolve => {
            let timeoutId = null;
            const waiter = {
                finish: ({
                    timedOut = false,
                    destroyed = false,
                    aborted = false,
                    committed = false
                } = {}) => {
                    if (!this.waiters.get(id)?.has(waiter)) return;
                    const activeWaiters = this.waiters.get(id);
                    activeWaiters.delete(waiter);
                    if (activeWaiters.size === 0) this.waiters.delete(id);
                    if (timeoutId !== null) this.timers.clearTimeout(timeoutId);
                    resolve(this.#buildAckResult(owned, snapshot, {
                        timedOut, destroyed, aborted, committed
                    }));
                },
                evaluate: () => {
                    const result = this.#buildAckResult(owned, snapshot);
                    if (result.allResponded) waiter.finish();
                }
            };
            if (!this.waiters.has(id)) this.waiters.set(id, new Set());
            this.waiters.get(id).add(waiter);
            timeoutId = this.timers.setTimeout(
                () => waiter.finish({ timedOut: true }),
                boundedTimeout
            );
            waiter.evaluate();
        });
    }

    commitBarrier(token, metadata = {}) {
        const id = tokenId(token);
        const commitMetadata = normalizeCommitMetadata(metadata);
        const owned = this.localBarriers.get(id);
        const barrier = this.#readJson(this.barrierKey);
        if (
            !owned || !activeBarrier(barrier) || barrier.id !== id ||
            barrier.ownerId !== this.tabId
        ) {
            throw new BarrierConflictError('Barrier token no longer owns the persisted barrier', {
                barrierId: id
            });
        }
        const epoch = this.getCurrentEpoch();
        if (epoch !== barrier.fromEpoch) {
            throw new BarrierConflictError('World epoch changed before barrier commit', {
                expectedEpoch: barrier.fromEpoch,
                actualEpoch: epoch
            });
        }
        if (this.#isBarrierExpired(barrier)) {
            try {
                this.abortBarrier(token, 'owner-lease-expired');
            } catch {
                // The conflict below remains the useful caller diagnostic.
            }
            throw new BarrierConflictError('World barrier lease expired before commit', {
                barrierId: id,
                leaseUntil: this.#barrierLeaseDeadline(barrier)
            });
        }

        const committing = {
            ...commitMetadata,
            barrierId: id,
            ownerId: this.tabId,
            fromEpoch: barrier.fromEpoch,
            toEpoch: barrier.toEpoch,
            reason: barrier.reason,
            status: 'committing',
            startedAt: barrier.startedAt,
            committedAt: null
        };
        try {
            this.#writeJson(this.tombstoneKey, committing);
            this.#setRaw(this.epochKey, String(barrier.toEpoch));
            const committed = {
                ...committing,
                status: 'committed',
                committedAt: this.clock()
            };
            this.#writeJson(this.tombstoneKey, committed);
            this.#remove(this.barrierKey);
            this.#settleLocalBarrier(id, {
                committed: true,
                tombstone: committed
            });
            return cloneJson(committed);
        } catch (error) {
            // A one-shot failure after the epoch advanced is a committed
            // transition, not an abort. Finish it idempotently and let the
            // caller continue. Before the epoch advances, the owner can safely
            // roll its own barrier back immediately.
            try {
                const repaired = this.reconcilePersistentTransition();
                if (
                    repaired?.tombstone?.status === 'committed' &&
                    repaired.tombstone.barrierId === id &&
                    repaired.tombstone.toEpoch === barrier.toEpoch
                ) {
                    return cloneJson(repaired.tombstone);
                }
            } catch {
                // A later refresh/lease takeover will retry the same repair.
            }
            try {
                if (this.getCurrentEpoch() === barrier.fromEpoch) {
                    this.abortBarrier(token, 'commit-failed-before-epoch');
                }
            } catch {
                // Preserve the original storage failure.
            }
            throw error;
        }
    }

    abortBarrier(token, reason = 'aborted') {
        const id = tokenId(token);
        const tombstone = this.#readJson(this.tombstoneKey);
        if (tombstone?.barrierId === id && tombstone.status === 'committed') {
            throw new BarrierCommittedError(id);
        }

        const owned = this.localBarriers.get(id);
        const barrier = this.#readJson(this.barrierKey);
        if (!owned || !barrier || barrier.id !== id || barrier.ownerId !== this.tabId) {
            return false;
        }
        if (this.getCurrentEpoch() !== barrier.fromEpoch) {
            throw new BarrierCommittedError(id);
        }

        this.#remove(this.barrierKey);
        if (tombstone?.barrierId === id && tombstone.status !== 'committed') {
            this.#remove(this.tombstoneKey);
        }
        this.#settleLocalBarrier(id, { aborted: true, reason });
        return true;
    }

    /** Claim the current committed epoch after the caller has installed its world. */
    claimEpoch(toEpoch) {
        this.reconcilePersistentTransition();
        const epoch = normalizeEpoch(toEpoch);
        if (epoch === null || this.getCurrentEpoch() !== epoch) return false;
        if (this.#readJson(this.barrierKey)) return false;
        const tombstone = this.#readJson(this.tombstoneKey);
        if (epoch !== 0 && !(tombstone?.status === 'committed' && tombstone.toEpoch === epoch)) {
            return false;
        }
        this.writerEpoch = epoch;
        this.#post('claim', { epoch });
        return this.canWrite(epoch);
    }

    #post(type, payload = {}) {
        if (!this.channel || this.destroyed) return false;
        try {
            this.channel.postMessage({
                type,
                senderId: this.tabId,
                timestamp: this.clock(),
                epoch: this.writerEpoch,
                ...payload
            });
            return true;
        } catch {
            // Messaging is optional. Persistent epoch checks remain authoritative.
            return false;
        }
    }

    #touchPeer(message) {
        if (typeof message.senderId !== 'string' || message.senderId === this.tabId) return;
        // Peer clocks can be skewed. Liveness is based on local receipt time,
        // while the sender timestamp remains diagnostic metadata only.
        this.peers.set(message.senderId, this.clock());
    }

    #handleMessage(message) {
        if (this.destroyed || !message || typeof message !== 'object' ||
            message.senderId === this.tabId) return;
        this.#touchPeer(message);
        switch (message.type) {
            case 'hello':
                this.#post('presence');
                break;
            case 'barrier':
                void this.#handlePeerBarrier(message);
                break;
            case 'ack':
                this.#recordAck(message);
                break;
            case 'commit':
                if (this.blockedBarrier?.id === message.tombstone?.barrierId) {
                    this.blockedBarrier = null;
                }
                break;
            case 'abort':
                if (this.blockedBarrier?.id === message.barrierId) {
                    this.blockedBarrier = null;
                }
                break;
            default:
                break;
        }
    }

    async #handlePeerBarrier(message) {
        const barrier = message.barrier;
        if (!barrier || typeof barrier.id !== 'string') return;
        let persisted;
        try {
            persisted = this.#readJson(this.barrierKey);
        } catch {
            return;
        }
        if (persisted?.id !== barrier.id || persisted.ownerId !== message.senderId) return;
        this.blockedBarrier = cloneJson(persisted);

        let handling = this.handledBarriers.get(barrier.id);
        if (!handling) {
            handling = Promise.resolve()
                .then(() => this.onBarrier(cloneJson(persisted), this))
                .then(
                    () => ({ ok: true, error: null }),
                    error => ({ ok: false, error: String(error?.message || error).slice(0, 256) })
                );
            this.handledBarriers.set(barrier.id, handling);
        }
        const result = await handling;
        this.#post('ack', {
            barrierId: barrier.id,
            targetId: message.senderId,
            ok: result.ok,
            error: result.error
        });
    }

    #recordAck(message) {
        if (message.targetId !== this.tabId || typeof message.barrierId !== 'string') return;
        const acknowledgements = this.acknowledgements.get(message.barrierId);
        if (!acknowledgements) return;
        acknowledgements.set(message.senderId, {
            ok: message.ok === true,
            error: typeof message.error === 'string' ? message.error : null,
            timestamp: normalizeTimeForPeer(message.timestamp, this.clock())
        });
        for (const waiter of this.waiters.get(message.barrierId) || []) waiter.evaluate();
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        if (this.heartbeatId !== null) this.timers.clearInterval(this.heartbeatId);
        for (const waiters of this.waiters.values()) {
            for (const waiter of [...waiters]) waiter.finish({ destroyed: true });
        }
        this.waiters.clear();
        if (this.channel) {
            if (this.usesEventListener && typeof this.channel.removeEventListener === 'function') {
                this.channel.removeEventListener('message', this.messageHandler);
            } else if (this.channel.onmessage === this.messageHandler) {
                this.channel.onmessage = null;
            }
            if (typeof this.channel.close === 'function') this.channel.close();
        }
        this.channel = null;
        this.peers.clear();
        this.acknowledgements.clear();
        this.handledBarriers.clear();
        this.localBarriers.clear();
        this.blockedBarrier = null;
    }
}

function normalizeTimeForPeer(value, fallback) {
    return Number.isFinite(value) && value >= 0 ? value : fallback;
}
