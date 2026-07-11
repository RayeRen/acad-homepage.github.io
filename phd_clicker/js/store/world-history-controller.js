import { ANNIHILATION_REASON } from './reflog-repository.js';
import { cloneJsonValue, normalizeMetaState } from './normalize.js';

export class WorldHistoryError extends Error {
    constructor(stage, message, options = {}) {
        super(message, options.cause ? { cause: options.cause } : undefined);
        this.name = 'WorldHistoryError';
        this.code = options.code || 'WORLD_HISTORY_ERROR';
        this.stage = stage;
        this.committed = options.committed === true;
        this.reloadRequired = options.reloadRequired === true;
        this.details = options.details || null;
    }
}

function requireMethod(target, method, label) {
    if (typeof target?.[method] !== 'function') {
        throw new TypeError(`${label} must provide ${method}()`);
    }
}

/**
 * Orchestrates destructive world changes. The local HEAD is never deleted
 * until an IndexedDB object was checksummed, written and read back.
 */
export class WorldHistoryController {
    constructor({
        saveController,
        reflog,
        coordinator,
        getState,
        applyRecoveredState = () => {},
        decorateRecoveredState = state => state,
        clock = Date.now
    } = {}) {
        [
            'save', 'flush', 'deleteHead', 'installWorld', 'getMetaState',
            'beginExclusiveTransition', 'endExclusiveTransition'
        ]
            .forEach(method => requireMethod(saveController, method, 'saveController'));
        ['archive', 'get', 'findLatest', 'markRecovered']
            .forEach(method => requireMethod(reflog, method, 'reflog'));
        [
            'getCurrentEpoch', 'getWriterEpoch', 'beginBarrier', 'waitForAcks',
            'commitBarrier', 'abortBarrier', 'claimEpoch'
        ].forEach(method => requireMethod(coordinator, method, 'coordinator'));
        if (typeof getState !== 'function') throw new TypeError('getState must be a function');
        if (typeof clock !== 'function') throw new TypeError('clock must be a function');
        this.saveController = saveController;
        this.reflog = reflog;
        this.coordinator = coordinator;
        this.getState = getState;
        this.applyRecoveredState = applyRecoveredState;
        this.decorateRecoveredState = decorateRecoveredState;
        this.clock = clock;
    }

    #begin(reason) {
        const fromEpoch = this.coordinator.getCurrentEpoch();
        if (this.coordinator.getWriterEpoch() !== fromEpoch) {
            throw new WorldHistoryError(
                'stale-writer',
                'This tab belongs to an older world and cannot change HEAD'
            );
        }
        const toEpoch = fromEpoch + 1;
        const token = this.coordinator.beginBarrier({ fromEpoch, toEpoch, reason });
        return { token, fromEpoch, toEpoch };
    }

    async hasUnrecoveredAnnihilation() {
        return Boolean(await this.reflog.findLatest({
            reason: ANNIHILATION_REASON,
            recovered: false
        }));
    }

    #assertPeerFlush(acknowledgements) {
        if (acknowledgements?.complete === true) return;
        throw new WorldHistoryError(
            'peer-flush',
            'A peer tab did not finish its pending save before the world transition',
            {
                code: 'PEER_FLUSH_TIMEOUT',
                details: acknowledgements || null
            }
        );
    }

    #epochWasCommitted(transition) {
        try {
            return this.coordinator.getCurrentEpoch() === transition.toEpoch;
        } catch {
            return false;
        }
    }

    async #selectRecoveryRecord(objectId) {
        const explicit = typeof objectId === 'string' && objectId.length > 0;
        const record = explicit
            ? await this.reflog.get(objectId)
            : await this.reflog.findLatest({
                reason: ANNIHILATION_REASON,
                recovered: false
            });
        if (!record) {
            if (explicit) {
                throw new WorldHistoryError(
                    'select-recovery',
                    `Reflog object ${objectId} does not exist`,
                    { code: 'REFLOG_OBJECT_NOT_FOUND' }
                );
            }
            return null;
        }
        const isAnnihilation = record.reason === ANNIHILATION_REASON ||
            record.reasons?.includes?.(ANNIHILATION_REASON);
        if (!isAnnihilation) {
            throw new WorldHistoryError(
                'select-recovery',
                `Reflog object ${record.objectId} is not an annihilation checkpoint`,
                { code: 'REFLOG_OBJECT_NOT_ANNIHILATION' }
            );
        }
        if (record.recoveredAt !== null && record.recoveredAt !== undefined) {
            throw new WorldHistoryError(
                'select-recovery',
                `Reflog object ${record.objectId} was already recovered`,
                { code: 'REFLOG_OBJECT_ALREADY_RECOVERED' }
            );
        }
        return record;
    }

    async annihilate({ playerType = null } = {}) {
        const transition = this.#begin(ANNIHILATION_REASON);
        let committed = false;
        let exclusive = false;
        try {
            this.saveController.beginExclusiveTransition(transition.token, {
                reason: ANNIHILATION_REASON
            });
            exclusive = true;
            await this.saveController.flush();
            const acknowledgements = await this.coordinator.waitForAcks(transition.token);
            this.#assertPeerFlush(acknowledgements);

            // This owner-only write occurs behind the active barrier after peer
            // queues drained. Ordinary autosaves remain blocked.
            const checkpoint = await this.saveController.save(this.getState(), {
                reason: 'annihilation-checkpoint',
                transitionToken: transition.token
            });
            const archive = await this.reflog.archive(checkpoint.envelope, {
                reason: ANNIHILATION_REASON,
                metadata: {
                    worldEpoch: transition.fromEpoch,
                    playerType,
                    generation: checkpoint.envelope.gameState?.generation ?? null
                }
            });
            const verified = await this.reflog.get(archive.objectId);
            if (!verified || verified.objectId !== archive.objectId) {
                throw new WorldHistoryError(
                    'archive-readback',
                    'The annihilation checkpoint could not be read back'
                );
            }

            const tombstone = this.coordinator.commitBarrier(transition.token, {
                objectId: archive.objectId,
                checksum: checkpoint.envelope.checksum?.value || null
            });
            committed = true;
            let headDeleted = true;
            let deleteError = null;
            try {
                await this.saveController.deleteHead({
                    includePrevious: true,
                    transitionToken: transition.token
                });
            } catch (error) {
                // The epoch and recovery object are already durable. Returning a
                // committed result lets the ending reload into bootstrap recovery
                // instead of falsely claiming that annihilation was cancelled.
                headDeleted = false;
                deleteError = error;
            }
            return {
                objectId: archive.objectId,
                record: verified,
                acknowledgements,
                tombstone,
                fromEpoch: transition.fromEpoch,
                toEpoch: transition.toEpoch,
                committed: true,
                headDeleted,
                reloadRequired: !headDeleted,
                deleteError
            };
        } catch (error) {
            const persistedCommit = committed || this.#epochWasCommitted(transition);
            if (!persistedCommit) {
                try {
                    this.coordinator.abortBarrier(transition.token, 'annihilation-failed');
                } catch {
                    // Keep the original stage error.
                }
            }
            if (error instanceof WorldHistoryError) {
                if (persistedCommit) {
                    error.committed = true;
                    error.reloadRequired = true;
                }
                throw error;
            }
            throw new WorldHistoryError(
                persistedCommit ? 'committed-transition' : 'archive',
                persistedCommit
                    ? 'Annihilation committed and requires a reload to finish'
                    : 'Annihilation was stopped before a verified recovery path was available',
                {
                    cause: error,
                    committed: persistedCommit,
                    reloadRequired: persistedCommit
                }
            );
        } finally {
            if (exclusive) this.saveController.endExclusiveTransition(transition.token);
        }
    }

    async recoverLatest({ objectId = null } = {}) {
        const record = await this.#selectRecoveryRecord(objectId);
        if (!record) return null;

        const transition = this.#begin('reflog-recovery');
        let committed = false;
        let exclusive = false;
        let installed = false;
        let runtimeApplied = false;
        let failureStage = 'prepare-recovery';
        try {
            this.saveController.beginExclusiveTransition(transition.token, {
                reason: 'reflog-recovery'
            });
            exclusive = true;
            await this.saveController.flush();
            const acknowledgements = await this.coordinator.waitForAcks(transition.token);
            this.#assertPeerFlush(acknowledgements);
            const recoveredAt = this.clock();
            let gameState = cloneJsonValue(record.envelope.gameState);
            gameState = this.decorateRecoveredState(gameState, {
                objectId: record.objectId,
                recoveredAt,
                fromEpoch: transition.fromEpoch,
                toEpoch: transition.toEpoch
            }) || gameState;
            const previousMeta = normalizeMetaState(record.envelope.metaState);
            const currentMeta = normalizeMetaState(this.saveController.getMetaState());
            const metaState = normalizeMetaState({
                ...previousMeta,
                worldEpoch: transition.toEpoch,
                annihilationCount: Math.max(
                    1,
                    Number(previousMeta.annihilationCount) || 0,
                    Number(currentMeta.annihilationCount) || 0
                ),
                lastAnnihilationAt: currentMeta.lastAnnihilationAt || record.archivedAt,
                lastAnnihilationObjectId: record.objectId,
                lastEnding: ANNIHILATION_REASON,
                recoveredFromAnnihilation: true,
                recoveredAt,
                recoveredObjectId: record.objectId
            });

            const tombstone = this.coordinator.commitBarrier(transition.token, {
                objectId: record.objectId,
                checksum: record.envelope.checksum?.value || null,
                recovery: true
            });
            committed = true;
            failureStage = 'claim-epoch';
            if (!this.coordinator.claimEpoch(transition.toEpoch)) {
                throw new WorldHistoryError('claim-epoch', 'Could not claim recovered world epoch');
            }
            failureStage = 'install-recovered-world';
            const saveResult = await this.saveController.installWorld(gameState, {
                reason: 'reflog-recovery',
                metaState,
                transitionToken: transition.token
            });
            installed = true;
            failureStage = 'apply-recovered-state';
            await this.applyRecoveredState(saveResult.envelope.gameState, metaState);
            runtimeApplied = true;

            let finalizedRecord = null;
            let finalizationError = null;
            try {
                finalizedRecord = await this.reflog.markRecovered(record.objectId, { recoveredAt });
            } catch (error) {
                // The recovered world is already durable and active. Reflog
                // finalization is deliberately retryable and cannot roll back or
                // prevent runtime installation.
                finalizationError = error;
            }
            return {
                objectId: record.objectId,
                gameState,
                metaState,
                saveResult,
                acknowledgements,
                tombstone,
                finalizedRecord,
                finalizationPending: !finalizedRecord,
                finalizationError
            };
        } catch (error) {
            const persistedCommit = committed || this.#epochWasCommitted(transition);
            if (!persistedCommit) {
                try {
                    this.coordinator.abortBarrier(transition.token, 'recovery-failed');
                } catch {
                    // Keep original failure.
                }
            }
            if (error instanceof WorldHistoryError) {
                if (persistedCommit) {
                    error.committed = true;
                    error.reloadRequired = true;
                }
                throw error;
            }
            throw new WorldHistoryError(
                persistedCommit ? failureStage : 'prepare-recovery',
                persistedCommit
                    ? 'Recovery committed and requires a reload or retry to finish'
                    : 'The reflog object could not become HEAD',
                {
                    cause: error,
                    committed: persistedCommit,
                    reloadRequired: persistedCommit
                }
            );
        } finally {
            if (exclusive) {
                this.saveController.endExclusiveTransition(transition.token, {
                    freezeWrites: committed && (!installed || !runtimeApplied),
                    reason: 'recovered-head-not-applied'
                });
            }
        }
    }

    /** Retry only the non-destructive reflog finalization tail. */
    async finalizeRecovery(objectId, { recoveredAt = this.clock() } = {}) {
        const record = await this.reflog.get(objectId);
        if (!record) return null;
        if (record.recoveredAt !== null && record.recoveredAt !== undefined) return record;
        return this.reflog.markRecovered(objectId, { recoveredAt });
    }
}
