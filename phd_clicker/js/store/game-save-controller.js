import { SaveRepository } from './save-repository.js';
import { createDefaultMetaState } from './schema.js';
import { cloneJsonValue, normalizeMetaState } from './normalize.js';

function createWriterId(cryptoImpl = globalThis.crypto) {
    if (typeof cryptoImpl?.randomUUID === 'function') return cryptoImpl.randomUUID();
    return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getTransitionId(token) {
    if (typeof token === 'string') return token;
    return typeof token?.id === 'string' ? token.id : '';
}

export class SaveWriteBlockedError extends Error {
    constructor(writerEpoch, reason) {
        super(`Save write blocked for world epoch ${writerEpoch}: ${reason}`);
        this.name = 'SaveWriteBlockedError';
        this.code = 'SAVE_WRITE_BLOCKED';
        this.writerEpoch = writerEpoch;
        this.reason = reason;
    }
}

/**
 * Serializes async checksum writes and retains forward-compatible envelope
 * fields across the lifetime of a page. UI code only sees save()/load().
 */
export class GameSaveController {
    constructor({
        repository = new SaveRepository(),
        writerId = createWriterId(),
        writeGuard = () => true
    } = {}) {
        this.repository = repository;
        this.writerId = writerId;
        if (typeof writeGuard !== 'function') throw new TypeError('writeGuard must be a function');
        this.writeGuard = writeGuard;
        this.activeEnvelope = null;
        this.metaState = createDefaultMetaState();
        this.queue = Promise.resolve();
        this.lastLoadResult = null;
        this.exclusiveTransition = null;
    }

    async load() {
        await this.flush();
        const result = await this.repository.load();
        this.lastLoadResult = result;
        this.activeEnvelope = result.envelope;
        this.metaState = normalizeMetaState(result.metaState);
        return result;
    }

    save(gameState, { reason = 'manual', transitionToken = null } = {}) {
        try {
            this.#assertTransitionAccess(transitionToken, reason);
        } catch (error) {
            return Promise.reject(error);
        }
        const snapshot = cloneJsonValue(gameState);
        return this.#enqueue(() => this.#write(snapshot, { reason, transitionToken }));
    }

    /**
     * Block ordinary saves for the lifetime of a destructive world transition.
     * A frozen failed transition may be superseded by a later explicit retry,
     * while autosaves remain blocked in the meantime.
     */
    beginExclusiveTransition(token, { reason = 'world-transition' } = {}) {
        const id = getTransitionId(token);
        if (!id) throw new TypeError('Exclusive world transition requires a token');
        if (this.exclusiveTransition && !this.exclusiveTransition.frozen &&
            this.exclusiveTransition.id !== id) {
            throw new SaveWriteBlockedError(
                Number(this.metaState.worldEpoch) || 0,
                `exclusive:${this.exclusiveTransition.reason}`
            );
        }
        this.exclusiveTransition = {
            id,
            reason,
            frozen: false
        };
        return id;
    }

    endExclusiveTransition(token, {
        freezeWrites = false,
        reason = 'world-transition-incomplete'
    } = {}) {
        const id = getTransitionId(token);
        if (!this.exclusiveTransition || this.exclusiveTransition.id !== id) return false;
        if (freezeWrites) {
            this.exclusiveTransition = { id, reason, frozen: true };
        } else {
            this.exclusiveTransition = null;
        }
        return true;
    }

    isWriteFrozen() {
        return Boolean(this.exclusiveTransition);
    }

    /**
     * Install a new world without deleting the current HEAD first. SaveRepository
     * writes the old HEAD to :prev before replacing it. Controller state changes
     * only after the candidate was successfully persisted.
     */
    installWorld(gameState, {
        reason = 'world-install',
        metaState = createDefaultMetaState(),
        transitionToken
    } = {}) {
        try {
            this.#assertTransitionAccess(transitionToken, reason);
        } catch (error) {
            return Promise.reject(error);
        }
        const snapshot = cloneJsonValue(gameState);
        const candidateMeta = normalizeMetaState(metaState);
        return this.#enqueue(() => this.#installWorld(snapshot, {
            reason,
            metaState: candidateMeta,
            transitionToken
        }));
    }

    async replaceWorld(gameState, {
        reason = 'hard-reset',
        metaState = createDefaultMetaState()
    } = {}) {
        this.#assertTransitionAccess(null, reason);
        await this.flush();
        this.#assertTransitionAccess(null, reason);
        const snapshot = cloneJsonValue(gameState);
        const candidateMeta = normalizeMetaState(metaState);
        return this.#enqueue(() => this.#replaceWorld(snapshot, {
            reason,
            metaState: candidateMeta
        }));
    }

    setMetaState(metaState) {
        this.metaState = normalizeMetaState(metaState);
    }

    getMetaState() {
        return normalizeMetaState(this.metaState);
    }

    getActiveEnvelope() {
        return this.activeEnvelope ? cloneJsonValue(this.activeEnvelope) : null;
    }

    /**
     * Remove only the local HEAD after all queued writes have settled.
     * Callers must create and verify any durable reflog checkpoint first.
     */
    async deleteHead({ includePrevious = true, transitionToken = null } = {}) {
        this.#assertTransitionAccess(transitionToken, 'delete-head');
        await this.flush();
        this.#assertTransitionAccess(transitionToken, 'delete-head');
        this.repository.clear({ includePrevious });
        this.activeEnvelope = null;
        this.lastLoadResult = null;
        return true;
    }

    flush() {
        return this.queue;
    }

    #enqueue(operation) {
        const task = this.queue.then(operation, operation);
        // A failed save is reported to its caller but must not poison every
        // future autosave attempt.
        this.queue = task.catch(() => undefined);
        return task;
    }

    #assertTransitionAccess(transitionToken, reason) {
        if (!this.exclusiveTransition) return true;
        const id = getTransitionId(transitionToken);
        if (!this.exclusiveTransition.frozen && id && id === this.exclusiveTransition.id) {
            return true;
        }
        throw new SaveWriteBlockedError(
            Number(this.metaState.worldEpoch) || 0,
            reason || this.exclusiveTransition.reason
        );
    }

    async #write(gameState, { reason, transitionToken = null }) {
        this.#assertTransitionAccess(transitionToken, reason);
        const previousRevision = Number(this.activeEnvelope?.revision) || 0;
        const writerEpoch = Number(this.metaState.worldEpoch) || 0;
        const assertCanWrite = () => {
            this.#assertTransitionAccess(transitionToken, reason);
            if (!this.writeGuard({ writerEpoch, reason, transitionToken })) {
                throw new SaveWriteBlockedError(writerEpoch, reason);
            }
            return true;
        };
        assertCanWrite();
        const extensions = {
            ...(this.activeEnvelope || {}),
            revision: previousRevision + 1,
            parentRevision: previousRevision || null,
            writerTabId: this.writerId,
            writerEpoch,
            reason
        };

        let result;
        if (this.activeEnvelope) {
            result = await this.repository.saveEnvelope({
                ...extensions,
                gameState,
                metaState: this.metaState,
                checksum: null
            }, { beforeWrite: assertCanWrite });
        } else {
            result = await this.repository.save(gameState, {
                metaState: this.metaState,
                envelopeExtensions: extensions,
                beforeWrite: assertCanWrite
            });
        }

        this.activeEnvelope = result.envelope;
        this.metaState = normalizeMetaState(result.envelope.metaState);
        return result;
    }

    async #installWorld(gameState, { reason, metaState, transitionToken }) {
        this.#assertTransitionAccess(transitionToken, reason);
        const writerEpoch = Number(metaState.worldEpoch) || 0;
        const transitionId = getTransitionId(transitionToken);
        const assertCanWrite = () => {
            this.#assertTransitionAccess(transitionToken, reason);
            // The barrier is already committed when a recovery candidate is
            // installed, so the ordinary current-epoch guard is appropriate.
            if (!this.writeGuard({
                writerEpoch,
                reason,
                transitionToken: null,
                worldInstall: true
            })) {
                throw new SaveWriteBlockedError(writerEpoch, reason);
            }
            return true;
        };
        assertCanWrite();

        const result = await this.repository.save(gameState, {
            metaState,
            envelopeExtensions: {
                revision: 1,
                parentRevision: null,
                writerTabId: this.writerId,
                writerEpoch,
                reason,
                worldTransitionId: transitionId
            },
            beforeWrite: assertCanWrite
        });

        this.activeEnvelope = result.envelope;
        this.metaState = normalizeMetaState(result.envelope.metaState);
        this.lastLoadResult = null;
        return result;
    }

    async #replaceWorld(gameState, { reason, metaState }) {
        this.#assertTransitionAccess(null, reason);
        const writerEpoch = Number(metaState.worldEpoch) || 0;
        const assertCanWrite = () => {
            this.#assertTransitionAccess(null, reason);
            if (!this.writeGuard({
                writerEpoch,
                reason,
                transitionToken: null,
                worldInstall: true
            })) {
                throw new SaveWriteBlockedError(writerEpoch, reason);
            }
            return true;
        };
        assertCanWrite();

        // SaveRepository first backs up the current HEAD to :prev and only then
        // replaces it. Controller identity/meta remain untouched if this write
        // fails, so callers can retry without losing their sole durable world.
        const result = await this.repository.save(gameState, {
            metaState,
            envelopeExtensions: {
                revision: 1,
                parentRevision: null,
                writerTabId: this.writerId,
                writerEpoch,
                reason
            },
            beforeWrite: assertCanWrite
        });

        this.activeEnvelope = result.envelope;
        this.metaState = normalizeMetaState(result.envelope.metaState);
        this.lastLoadResult = null;
        try {
            this.repository.clearPrevious();
            result.previousCleared = true;
        } catch (error) {
            // A redundant old backup is safer than reporting that the already
            // durable new HEAD failed to install.
            result.previousCleared = false;
            result.previousCleanupError = error;
        }
        return result;
    }
}
