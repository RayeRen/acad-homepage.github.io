/**
 * PhD Clicker - Main Entry Point
 * This file initializes the game and wires up all modules.
 */

import { Constants } from './constants.js';
import { State, Runtime, resetState, mergeState } from './state.js';
import * as Data from './data.js';
import * as Logic from './logic/index.js';
import * as UI from './ui/index.js';
import * as AGI from './agi/index.js';
import * as Meta from './meta-effects.js';
import {
    DEFAULT_WORLD_BARRIER_KEY,
    DEFAULT_WORLD_EPOCH_KEY,
    DEFAULT_WORLD_TOMBSTONE_KEY,
    GameSaveController,
    ReflogRepository,
    SaveRepository,
    TabCoordinator,
    WorldHistoryController,
    cloneJsonValue,
    createDefaultMetaState
} from './store/index.js';

// Forward declaration for saveGame (defined later)
let saveGameFn = null;
let saveController = null;
let gameStorage;
try {
    gameStorage = globalThis.localStorage;
    if (!gameStorage) throw new Error('localStorage is unavailable');
} catch (error) {
    gameStorage = Object.freeze({
        getItem: () => { throw error; },
        setItem: () => { throw error; },
        removeItem: () => { throw error; }
    });
}
let tabCoordinationError = null;
let tabCoordinator;
try {
    tabCoordinator = new TabCoordinator({
        storage: gameStorage,
        onBarrier: async () => saveController?.flush()
    });
} catch (error) {
    tabCoordinationError = error;
    console.error('[World Coordination] Starting in read-only mode:', error);
    const fail = () => { throw error; };
    tabCoordinator = Object.freeze({
        getCurrentEpoch: () => 0,
        getWriterEpoch: () => -1,
        getTombstone: () => null,
        canWrite: () => false,
        canWriteDuringBarrier: () => false,
        beginBarrier: fail,
        waitForAcks: async () => fail(),
        commitBarrier: fail,
        abortBarrier: () => false,
        claimEpoch: () => false,
        reconcilePersistentTransition: fail,
        destroy: () => undefined
    });
}
saveController = new GameSaveController({
    repository: new SaveRepository({
        storage: gameStorage,
        key: Constants.SAVE_KEY
    }),
    writeGuard: ({ writerEpoch, transitionToken }) => transitionToken
        ? tabCoordinator.canWriteDuringBarrier(transitionToken, writerEpoch)
        : tabCoordinator.canWrite(writerEpoch)
});
let reflogRepository = null;
try {
    reflogRepository = new ReflogRepository();
} catch (error) {
    console.warn('[Reflog] IndexedDB history is unavailable:', error);
}
let worldHistoryController = null;

// Compose the Game object for global access and debugging
const Game = {
    Constants,
    State,
    Runtime,
    Data,
    Logic,
    UI,
    AGI,
    Meta,

    // Helper methods
    resetState,
    mergeState,

    // Save/load (will be set after definition)
    saveGame: (reason) => saveGameFn && saveGameFn(reason),
    Save: saveController,
    Reflog: reflogRepository,
    Tabs: tabCoordinator,
    History: null,

    // Initialization
    Init: null,

    // Expose version
    version: '2.0.0-modular'
};

// Create a wrapper object for Logic that includes saveGame
// (ES module namespace objects are frozen and can't be extended)
const GameLogic = {
    ...Logic,
    saveGame: (reason) => saveGameFn && saveGameFn(reason),
    updateAll: () => {
        Logic.updateMultipliers();
        Logic.calculateRPS();
        Logic.updateClickPower(); // Must be after calculateRPS to use updated RPS
        State.citationsRate = Logic.calculateCitationsRate();
    }
};

function decorateRecoveredState(gameState, context) {
    if (!gameState.agi || typeof gameState.agi !== 'object') gameState.agi = {};
    if (gameState.agi.fsm && typeof gameState.agi.fsm === 'object') {
        gameState.agi.fsm.active = false;
        gameState.agi.fsm.runId = null;
        gameState.agi.fsm.state = 'IDLE';
        gameState.agi.fsm.stateStartedAt = null;
        gameState.agi.fsm.playerPhase5Choice = null;
        gameState.agi.fsm.stateData = {};
        gameState.agi.fsm.lastCompletedState = 'ENDING';
        gameState.agi.fsm.reason = 'reflog-recovered';
    }
    gameState.agi.wasInterrupted = false;
    gameState.agi.interruptedState = null;
    if (!gameState.agi.metaEffects || typeof gameState.agi.metaEffects !== 'object') {
        gameState.agi.metaEffects = { boundaryTriggeredAt: null, effects: {} };
    }
    if (!gameState.agi.metaEffects.effects ||
        typeof gameState.agi.metaEffects.effects !== 'object') {
        gameState.agi.metaEffects.effects = {};
    }
    gameState.agi.metaEffects.effects['reflog-recovery'] = {
        attemptedAt: context.recoveredAt,
        completedAt: context.recoveredAt,
        status: 'recovered',
        objectId: context.objectId
    };
    Logic.NarrativeLog.append({
        type: 'save.recovery',
        messageKey: 'log.reflog.recovered',
        context: { objectId: context.objectId },
        importance: 'critical',
        source: 'reflog',
        dedupeKey: `reflog-recovered:${context.objectId}`
    }, { state: gameState, now: () => context.recoveredAt });
    return gameState;
}

async function applyRecoveredState(gameState) {
    mergeState(gameState);
    State.agi = AGI.validateAgiState(gameState.agi || null);
    Runtime.recoveryHintAvailable = false;
    Data.loadLocale(State.currentLang);
    UI.updateI18n();
    AGI.init();
    Meta.init();
    GameLogic.updateAll();
    UI.renderLists();
    UI.renderPublications();
    UI.updateNews();
    UI.NarrativeLog.refresh();
    applyRecoveryCosmetic();
}

function applyRecoveryCosmetic() {
    const metaState = saveController.getMetaState();
    const existing = document.getElementById('reflog-recovery-badge');
    if (!metaState.recoveredFromAnnihilation) {
        existing?.remove();
        document.body.removeAttribute('data-reflog-recovered');
        Runtime.recoveryRewardUnlocked = false;
        return;
    }

    document.body.dataset.reflogRecovered = 'true';
    Runtime.recoveryRewardUnlocked = true;
    if (existing) {
        existing.title = State.currentLang === 'en'
            ? 'A deleted world is reachable again.'
            : '一个被删除的世界重新变得可达。';
        return;
    }
    const title = document.getElementById('title-text');
    if (!title?.parentElement) return;
    const badge = document.createElement('span');
    badge.id = 'reflog-recovery-badge';
    badge.className = 'inline-block mt-1 px-2 py-0.5 rounded border border-emerald-700/70 bg-emerald-950/40 text-[10px] font-mono text-emerald-300';
    badge.textContent = 'HEAD@{recovered}';
    badge.title = State.currentLang === 'en'
        ? 'A deleted world is reachable again.'
        : '一个被删除的世界重新变得可达。';
    title.parentElement.appendChild(badge);
}

if (reflogRepository && !tabCoordinationError) {
    worldHistoryController = new WorldHistoryController({
        saveController,
        reflog: reflogRepository,
        coordinator: tabCoordinator,
        getState: () => State,
        decorateRecoveredState,
        applyRecoveredState
    });
    Game.History = worldHistoryController;
}

// Expose Game to window for debugging and console access
window.Game = Game;

// Also expose GameLogic for modules that need saveGame
window.GameLogic = GameLogic;

/** Save the current world through the queued, versioned repository. */
async function saveGame(reason = 'manual') {
    if (Runtime.saveBlocked) return null;

    try {
        const result = await saveController.save(State, { reason });
        State.lastSaveTime = result.envelope.savedAt;
        return result;
    } catch (error) {
        if (error?.code === 'SAVE_WRITE_BLOCKED') return null;
        console.error('Save failed:', error);
        showSaveErrorNotification();
        return null;
    }
}

function ensureAutosaveInterval() {
    if (Runtime.saveBlocked || Runtime.intervalIds.saveGame) return;
    Runtime.intervalIds.saveGame = setInterval(
        () => saveGame('autosave'),
        Constants.SAVE_INTERVAL
    );
}

async function getTransitionCheckpoint(tombstone, { allowRecovered = false } = {}) {
    if (!reflogRepository) return null;
    const objectId = typeof tombstone?.objectId === 'string'
        ? tombstone.objectId
        : null;
    const expectedChecksum = typeof tombstone?.checksum === 'string'
        ? tombstone.checksum
        : null;
    // A committed transition must name its exact content-addressed object.
    // Guessing "latest" after partial/corrupt metadata could resurrect a
    // different deleted world, so incomplete tombstones remain fail-closed.
    if (!objectId || !expectedChecksum) return null;
    const checkpoint = await reflogRepository.get(objectId);
    if (!checkpoint) return null;
    const isAnnihilation = checkpoint.reason === 'annihilation' ||
        checkpoint.reasons?.includes?.('annihilation');
    if (!isAnnihilation) return null;
    if (!allowRecovered && checkpoint.recoveredAt !== null &&
        checkpoint.recoveredAt !== undefined) {
        return null;
    }
    if (checkpoint.envelope?.checksum?.value !== expectedChecksum) {
        return null;
    }
    return checkpoint;
}

function mergeLoadedGameState(gameState) {
    mergeState(gameState);
    State.agi = AGI.validateAgiState(gameState?.agi || null);
    Logic.NarrativeLog.normalizeStateNarrativeLog();
}

/**
 * Show notification when save fails
 */
function showSaveErrorNotification() {
    // 避免重复显示通知
    if (document.querySelector('.save-error-notification')) return;

    const notification = document.createElement('div');
    notification.className = 'save-error-notification';
    notification.textContent = State.currentLang === 'en'
        ? 'Save failed! Storage may be full.'
        : '保存失败！存储空间可能已满。';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function showCoordinationErrorNotification() {
    if (!tabCoordinationError || document.querySelector('.coordination-error-notification')) return;
    const notification = document.createElement('div');
    notification.className = 'coordination-error-notification';
    notification.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        max-width: min(560px, calc(100vw - 32px));
        background: #451a03;
        border: 1px solid #f59e0b;
        color: #fef3c7;
        padding: 12px 16px;
        border-radius: 10px;
        z-index: 2147485000;
        font-size: 13px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    `;

    const message = document.createElement('span');
    message.textContent = State.currentLang === 'en'
        ? 'World coordination data is unreadable. The save is open read-only so it cannot be overwritten.'
        : '世界协调数据无法读取。存档已以只读模式打开，避免被覆盖。';
    notification.appendChild(message);

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = State.currentLang === 'en'
        ? 'Reset local game'
        : '重置本地游戏';
    resetButton.style.cssText = `
        margin-left: 12px;
        padding: 5px 9px;
        border: 1px solid #fbbf24;
        border-radius: 6px;
        color: #fff7ed;
        background: #78350f;
        cursor: pointer;
    `;
    resetButton.addEventListener('click', () => {
        const accepted = confirm(State.currentLang === 'en'
            ? 'Reset the local save and repair coordination data? IndexedDB reflog history is preserved.'
            : '重置本地存档并修复协调数据？IndexedDB reflog 历史会被保留。');
        if (!accepted) return;
        const keys = [
            DEFAULT_WORLD_EPOCH_KEY,
            DEFAULT_WORLD_BARRIER_KEY,
            DEFAULT_WORLD_TOMBSTONE_KEY,
            Constants.SAVE_KEY,
            `${Constants.SAVE_KEY}:prev`
        ];
        const stamp = Date.now();
        for (const key of keys) {
            try {
                const raw = localStorage.getItem(key);
                if (raw !== null) {
                    try {
                        localStorage.setItem(
                            `phd-clicker-repair-quarantine:${stamp}:${key}`,
                            raw
                        );
                    } catch {
                        // Explicit reset remains available under quota pressure.
                    }
                }
                localStorage.removeItem(key);
            } catch (error) {
                console.error('[World Coordination] Repair failed:', error);
                showSaveErrorNotification();
                return;
            }
        }
        window.location.reload();
    });
    notification.appendChild(resetButton);
    document.body.appendChild(notification);
}

// Set the forward reference
saveGameFn = saveGame;

/** Load, migrate and validate the current save envelope. */
async function loadGame() {
    try {
        const result = await saveController.load();
        Runtime.saveLoadStatus = result.status;
        Runtime.saveIntegrity = result.integrity;

        if (result.status === 'unsupported-version' || result.status === 'storage-error') {
            // Never let autosave overwrite a future-version or unreadable save.
            Runtime.saveBlocked = true;
            console.error('Save load blocked:', result.error);
            return { lastSaveTime: null, result };
        }

        if (tabCoordinationError) {
            Runtime.saveBlocked = true;
            Runtime.saveLoadStatus = 'coordination-error';
            if (result.gameState) mergeLoadedGameState(result.gameState);
            return {
                lastSaveTime: result.envelope?.savedAt ??
                    result.gameState?.lastSaveTime ?? null,
                result: { ...result, status: 'coordination-error' }
            };
        }

        const currentEpoch = tabCoordinator.getCurrentEpoch();
        const savedEpoch = Number(result.metaState?.worldEpoch) || 0;
        if (savedEpoch !== currentEpoch) {
            const tombstone = tabCoordinator.getTombstone();
            const hasCommittedTransition = currentEpoch > savedEpoch &&
                tombstone?.status === 'committed' &&
                tombstone?.toEpoch === currentEpoch;
            if (!hasCommittedTransition || !tabCoordinator.claimEpoch(currentEpoch)) {
                Runtime.saveBlocked = true;
                console.error('World epoch mismatch; refusing to overwrite save.', {
                    savedEpoch,
                    currentEpoch,
                    tombstone
                });
                return { lastSaveTime: null, result };
            }

            if (tombstone.reason === 'annihilation') {
                const checkpoint = await getTransitionCheckpoint(tombstone);
                if (!checkpoint) {
                    Runtime.saveBlocked = true;
                    console.error('Committed annihilation has no matching verified reflog checkpoint.');
                    return { lastSaveTime: null, result };
                }

                resetState();
                State.agi.firstEndingChoice = 'annihilation';
                State.agi.remembersPlayer = true;
                const previousMeta = checkpoint.envelope?.metaState || {};
                const metaState = {
                    ...createDefaultMetaState(),
                    ...previousMeta,
                    worldEpoch: currentEpoch,
                    annihilationCount: Math.max(
                        1,
                        (Number(previousMeta.annihilationCount) || 0) + 1
                    ),
                    lastAnnihilationAt: checkpoint.archivedAt,
                    lastAnnihilationObjectId: checkpoint.objectId,
                    lastEnding: 'annihilation',
                    recoveredFromAnnihilation: false,
                    recoveredAt: null,
                    recoveredObjectId: null
                };
                const replacement = await saveController.replaceWorld(State, {
                    reason: 'post-annihilation-new-world',
                    metaState
                });
                State.lastSaveTime = replacement.envelope.savedAt;
                Runtime.recoveryHintAvailable = true;
                Runtime.postAnnihilationObjectId = checkpoint.objectId;
                Runtime.saveLoadStatus = 'post-annihilation';
                return {
                    lastSaveTime: null,
                    result: {
                        ...result,
                        status: 'post-annihilation',
                        envelope: replacement.envelope,
                        gameState: State,
                        metaState
                    }
                };
            }

            if (tombstone.reason === 'reflog-recovery') {
                const checkpoint = await getTransitionCheckpoint(tombstone, {
                    allowRecovered: true
                });
                if (!checkpoint) {
                    Runtime.saveBlocked = true;
                    console.error('Committed recovery has no matching verified reflog checkpoint.');
                    return { lastSaveTime: null, result };
                }
                const recoveredAt = Number(tombstone.committedAt) || Date.now();
                const gameState = decorateRecoveredState(
                    cloneJsonValue(checkpoint.envelope.gameState),
                    {
                        objectId: checkpoint.objectId,
                        recoveredAt,
                        fromEpoch: tombstone.fromEpoch,
                        toEpoch: currentEpoch
                    }
                );
                const previousMeta = checkpoint.envelope?.metaState || {};
                const metaState = {
                    ...createDefaultMetaState(),
                    ...previousMeta,
                    worldEpoch: currentEpoch,
                    annihilationCount: Math.max(
                        1,
                        Number(previousMeta.annihilationCount) || 0,
                        Number(result.metaState?.annihilationCount) || 0
                    ),
                    lastAnnihilationAt: result.metaState?.lastAnnihilationAt ||
                        checkpoint.archivedAt,
                    lastAnnihilationObjectId: checkpoint.objectId,
                    lastEnding: 'annihilation',
                    recoveredFromAnnihilation: true,
                    recoveredAt,
                    recoveredObjectId: checkpoint.objectId
                };
                const replacement = await saveController.installWorld(gameState, {
                    reason: 'reflog-recovery-bootstrap',
                    metaState
                });
                mergeLoadedGameState(replacement.envelope.gameState);
                try {
                    await worldHistoryController?.finalizeRecovery(checkpoint.objectId, {
                        recoveredAt
                    });
                } catch (error) {
                    console.warn('[Reflog] Recovery finalization remains pending:', error);
                }
                Runtime.recoveryHintAvailable = false;
                Runtime.saveLoadStatus = 'reflog-recovery-replayed';
                return {
                    lastSaveTime: replacement.envelope.savedAt,
                    result: {
                        ...result,
                        status: 'reflog-recovery-replayed',
                        envelope: replacement.envelope,
                        gameState: replacement.envelope.gameState,
                        metaState
                    }
                };
            }

            if (tombstone.reason === 'hard-reset') {
                resetState();
                const metaState = {
                    ...createDefaultMetaState(),
                    worldEpoch: currentEpoch
                };
                const replacement = await saveController.replaceWorld(State, {
                    reason: 'hard-reset-bootstrap',
                    metaState
                });
                State.lastSaveTime = replacement.envelope.savedAt;
                Runtime.saveLoadStatus = 'hard-reset-replayed';
                Runtime.saveBlocked = false;
                return {
                    lastSaveTime: replacement.envelope.savedAt,
                    result: {
                        ...result,
                        status: 'hard-reset-replayed',
                        envelope: replacement.envelope,
                        gameState: State,
                        metaState
                    }
                };
            }

            Runtime.saveBlocked = true;
            console.error('Unsupported committed world transition.', tombstone);
            return { lastSaveTime: null, result };
        }

        const saved = result.gameState;
        if (saved) {
            mergeLoadedGameState(saved);
        }

        if (result.metaState?.recoveredFromAnnihilation &&
            result.metaState?.recoveredObjectId && worldHistoryController) {
            try {
                await worldHistoryController.finalizeRecovery(
                    result.metaState.recoveredObjectId,
                    { recoveredAt: result.metaState.recoveredAt || Date.now() }
                );
            } catch (error) {
                console.warn('[Reflog] Recovery finalization retry failed:', error);
            }
        }

        if (result.status === 'integrity-mismatch') {
            Logic.NarrativeLog.append({
                type: 'save.integrity',
                messageKey: 'log.save.integrity-mismatch',
                context: {
                    expected: result.integrity?.expected?.slice?.(0, 12) || null,
                    actual: result.integrity?.actual?.slice?.(0, 12) || null
                },
                importance: 'critical',
                source: 'save-repository',
                dedupeKey: `save-integrity:${result.integrity?.actual || 'unknown'}`
            });
            Runtime.metaIntegrityAnomaly = true;
        } else if (result.status === 'recovered-previous') {
            Logic.NarrativeLog.append({
                type: 'save.recovery',
                messageKey: 'log.save.previous-recovered',
                context: { quarantineKeys: result.quarantineKeys || [] },
                importance: 'high',
                source: 'save-repository',
                dedupeKey: `save-previous:${result.envelope?.savedAt || 'unknown'}`
            });
        }

        return {
            lastSaveTime: result.envelope?.savedAt ?? saved?.lastSaveTime ?? null,
            result
        };
    } catch (error) {
        console.error('Load failed:', error);
        Runtime.saveBlocked = true;
        return { lastSaveTime: null, result: null };
    }
}

/**
 * Hard reset - clear all data
 */
async function hardReset() {
    const t = Data.t;
    if (!confirm(t('resetConfirm', 'Are you sure you want to reset all progress?'))) return;

    const currentLang = State.currentLang;
    const fromEpoch = tabCoordinator.getCurrentEpoch();
    let barrier;
    try {
        barrier = tabCoordinator.beginBarrier({
            fromEpoch,
            toEpoch: fromEpoch + 1,
            reason: 'hard-reset'
        });
        await saveController.flush();
        const acknowledgements = await tabCoordinator.waitForAcks(barrier);
        if (!acknowledgements?.complete) {
            throw Object.assign(
                new Error('Other active tabs did not flush before hard reset'),
                { code: 'PEER_FLUSH_TIMEOUT', acknowledgements }
            );
        }
    } catch (error) {
        if (barrier) {
            try {
                tabCoordinator.abortBarrier(barrier, 'hard-reset-failed');
            } catch {
                // Preserve the original coordination error. A committed or
                // partially committed barrier is reconciled on the next load.
            }
        }
        console.error('Hard reset coordination failed:', error);
        showSaveErrorNotification();
        return;
    }

    // Tear down every Phase 4/5 scene while it still belongs to the old AGI
    // object. resetState() replaces State.agi; leaving the old scene mounted
    // would make its world-identity guard freeze a full-screen overlay forever.
    AGI.Phase4?.StateMachine?.destroy?.();

    // Hide AGI dialogue before reset
    AGI.Dialogue.hide();

    resetState();
    Meta.init();
    Data.loadLocale(currentLang);
    GameLogic.updateAll();
    UI.renderLists();
    UI.update(GameLogic);

    // Explicit hard reset may replace an otherwise blocked world, but it still
    // waits for older queued writes before clearing the active history.
    Runtime.saveBlocked = false;
    try {
        const tombstone = tabCoordinator.commitBarrier(barrier);
        if (!tabCoordinator.claimEpoch(tombstone.toEpoch)) {
            throw new Error('Could not claim hard-reset world epoch');
        }
        const result = await saveController.replaceWorld(State, {
            reason: 'hard-reset',
            metaState: {
                ...createDefaultMetaState(),
                worldEpoch: tombstone.toEpoch
            }
        });
        State.lastSaveTime = result.envelope.savedAt;
        ensureAutosaveInterval();
        applyRecoveryCosmetic();
    } catch (error) {
        console.error('Hard reset save failed:', error);
        showSaveErrorNotification();
        return;
    }

    // Assign default advisor for first generation after reset
    if (State.generation === 1 && !State.currentAdvisor) {
        UI.Advisor.open(GameLogic);
    }
}

/**
 * Game loop - runs every tick
 */
function gameLoop() {
    const now = Date.now();
    const elapsedSeconds = (now - Number(Runtime.lastTickTime)) / 1000;
    const delta = Number.isFinite(elapsedSeconds)
        ? Math.min(Math.max(elapsedSeconds, 0), 10)
        : 0;
    Runtime.lastTickTime = now;

    let gen = Runtime.rps * delta;

    // Tech Heir Crit (Applied to Compute part)
    let critMult = 1;
    if (State.currentOrigin === 'tech' && Math.random() < 0.15) {
        critMult = 5;
        const extra = (Runtime.rpsCompute * delta * 4);
        gen += extra;
    }

    State.rp += gen;
    State.totalRp += gen;

    // Stats Tracking
    State.stats.lifetime_rp_compute += (Runtime.rpsCompute * delta * critMult);
    State.stats.lifetime_rp_academic += (Runtime.rpsAcademic * delta);

    const citeGain = State.citationsRate * delta;
    State.citations += citeGain;

    // Update AGI system
    AGI.update(delta);

    // Update advisor info button visibility and text
    const DOM = UI.DOM;
    if (DOM.advisorInfoBtn) {
        if (State.currentAdvisor) {
            DOM.advisorInfoBtn.classList.remove('hidden');
            // Update button text to show advisor name
            if (DOM.advisorInfoText && State.currentAdvisor.name) {
                const prefix = State.currentLang === 'en' ? 'Advisor: ' : '导师: ';
                DOM.advisorInfoText.textContent = prefix + State.currentAdvisor.name;
            }
        } else {
            DOM.advisorInfoBtn.classList.add('hidden');
        }
    }

    UI.update(GameLogic);
}

/**
 * Attach all event listeners
 */
function attachListeners() {
    const DOM = UI.DOM;

    // Main click button
    if (DOM.manualResearchButton) {
        DOM.manualResearchButton.addEventListener('click', (e) => {
            const outcome = GameLogic.Commands.dispatch(
                GameLogic.Commands.CommandType.RESEARCH_CLICK,
                {},
                { actor: 'player', source: 'ui' }
            );
            if (!outcome.ok) return;
            const result = outcome.result;
            if (e.currentTarget) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Add ripple effect
                const ripple = document.createElement('div');
                ripple.className = 'click-ripple';
                ripple.style.left = `${clickX}px`;
                ripple.style.top = `${clickY}px`;
                ripple.style.width = ripple.style.height = '60px';
                e.currentTarget.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);

                // Show floating text with crit support
                const phrase = Data.pickRandom(Runtime.activeClickPhrases);
                const text = `+${Data.formatNumber(result.value)} ${phrase || ''}`;
                UI.playFloatingText(clickX, clickY, text, result.isCrit);
            }
        });
    }

    // Buildings list delegation
    if (DOM.buildingsList) {
        DOM.buildingsList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-type="building"]');
            if (btn) {
                GameLogic.Commands.dispatch(
                    GameLogic.Commands.CommandType.BUILDING_BUY,
                    { id: btn.dataset.id },
                    { actor: 'player', source: 'ui' }
                );
            }
        });
    }

    // Upgrades list delegation
    if (DOM.upgradesList) {
        DOM.upgradesList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-type="upgrade"]');
            if (btn) {
                GameLogic.Commands.dispatch(
                    GameLogic.Commands.CommandType.UPGRADE_BUY,
                    { id: btn.dataset.id },
                    { actor: 'player', source: 'ui' }
                );
            }
        });
    }

    // Click Upgrades list delegation
    if (DOM.clickUpgradesList) {
        DOM.clickUpgradesList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-type="clickUpgrade"]');
            if (btn) {
                GameLogic.Commands.dispatch(
                    GameLogic.Commands.CommandType.CLICK_UPGRADE_BUY,
                    { id: btn.dataset.id },
                    { actor: 'player', source: 'ui' }
                );
            }
        });
    }

    // Language toggle
    if (DOM.langToggle) {
        DOM.langToggle.addEventListener('click', () => {
            UI.toggleLang(GameLogic);
            UI.NarrativeLog.refresh();
            applyRecoveryCosmetic();
        });
    }

    // Minimize/restore
    console.log('PhD Clicker: floatingWidget =', DOM.floatingWidget);
    if (DOM.minimizeButton) DOM.minimizeButton.addEventListener('click', async () => {
        UI.NarrativeLog.close();
        await saveGame('minimize');
        UI.hideGame();
    });
    if (DOM.floatingWidget) {
        DOM.floatingWidget.addEventListener('click', () => {
            console.log('PhD Clicker: Widget clicked!');
            UI.showGame();
        });
    }

    // Panel toggles (mobile)
    const togglePanel = (btn, wrapper) => {
        if (!btn || !wrapper) return;
        wrapper.classList.toggle('hidden');
        const isHidden = wrapper.classList.contains('hidden');
        const key = isHidden ? 'expand' : 'collapse';
        const text = Data.t(key);
        btn.textContent = text;
        btn.setAttribute('data-i18n', key);
    };

    if (DOM.upgradesToggle) DOM.upgradesToggle.addEventListener('click', () => togglePanel(DOM.upgradesToggle, DOM.upgradesWrapper));
    if (DOM.buildingsToggle) DOM.buildingsToggle.addEventListener('click', () => togglePanel(DOM.buildingsToggle, DOM.buildingsWrapper));

    // Reset button
    if (DOM.resetButton) DOM.resetButton.addEventListener('click', hardReset);

    // Prestige button
    if (DOM.prestigeButton) {
        DOM.prestigeButton.addEventListener('click', () => {
            UI.Settlement.showConfirmation(GameLogic);
        });
    }

    // Advisor info button
    if (DOM.advisorInfoBtn) {
        DOM.advisorInfoBtn.addEventListener('click', () => {
            UI.Advisor.showInfo(GameLogic);
        });
    }

    // Submission modal
    if (DOM.submitPaperButton) DOM.submitPaperButton.addEventListener('click', () => UI.Submission.openModal(GameLogic));
    if (DOM.submissionClose) DOM.submissionClose.addEventListener('click', () => UI.Submission.closeModal());
    if (DOM.submissionCloseBottom) DOM.submissionCloseBottom.addEventListener('click', () => UI.Submission.closeModal());

    if (DOM.tierList) {
        DOM.tierList.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-tier-id]');
            if (btn) UI.Submission.openDetail(btn.dataset.tierId, Logic);
        });
    }

    if (DOM.detailBackBtn) DOM.detailBackBtn.addEventListener('click', () => UI.Submission.showStage('tier'));
    if (DOM.detailInvestSlider) DOM.detailInvestSlider.addEventListener('input', () => UI.Submission.updateDetailPreview(GameLogic));
    if (DOM.detailInvestInput) DOM.detailInvestInput.addEventListener('input', () => UI.Submission.updateDetailPreview(GameLogic));
    if (DOM.detailStartBtn) DOM.detailStartBtn.addEventListener('click', () => UI.Submission.startSubmission(GameLogic));
    if (DOM.questionNextBtn) DOM.questionNextBtn.addEventListener('click', () => UI.Submission.nextQuestion(GameLogic));

    if (DOM.resultButton) {
        DOM.resultButton.addEventListener('click', () => {
            UI.Submission.startNewSubmission(GameLogic);
        });
    }

    // Connections
    if (DOM.connectionsBtn) DOM.connectionsBtn.addEventListener('click', () => UI.Connections.open());
    if (DOM.connectionsClose) DOM.connectionsClose.addEventListener('click', () => UI.Connections.close());
    UI.Connections.initEventDelegation(GameLogic);

    // Title Generator
    if (DOM.researchFocusInput) DOM.researchFocusInput.addEventListener(
        'input',
        (e) => UI.Submission.handleTopicInput(e, GameLogic)
    );
    if (DOM.rerollTitleBtn) DOM.rerollTitleBtn.addEventListener('click', () => UI.Submission.rerollTitle(GameLogic));

    // Publications Toggle
    if (DOM.publicationsHeader) {
        DOM.publicationsHeader.addEventListener('click', () => {
            DOM.pubDetailView.classList.toggle('hidden');
            DOM.pubChevron.style.transform = DOM.pubDetailView.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    // Dev Console (Secret: woaijinghui)
    let buffer = '';
    document.addEventListener('keydown', (e) => {
        if (e.key && e.key.length === 1) {
            buffer = (buffer + e.key).slice(-20).toLowerCase();
            if (buffer.includes('woaijinghui')) DOM.devConsole && DOM.devConsole.classList.remove('hidden');
        }
    });

    if (DOM.devClose) DOM.devClose.addEventListener('click', () => DOM.devConsole.classList.add('hidden'));
    if (DOM.devSetRp) DOM.devSetRp.addEventListener('click', () => { State.rp = parseFloat(DOM.devRp.value || 0); GameLogic.updateAll(); });
    if (DOM.devSetCitations) DOM.devSetCitations.addEventListener('click', () => { State.citations = parseFloat(DOM.devCitations.value || 0); GameLogic.updateAll(); });
    if (DOM.devSetPapers) {
        DOM.devSetPapers.addEventListener('click', () => {
            const count = parseInt(DOM.devPapers.value || 0);
            State.acceptedPapers = Array(count).fill(0).map((_, i) => ({ title: `Dev Paper ${i}`, venue: 'DevConf', date: Date.now() }));
            GameLogic.updateAll();
        });
    }
    if (DOM.devSetReputation) {
        DOM.devSetReputation.addEventListener('click', () => {
            State.reputation = parseFloat(DOM.devReputation.value || 0);
            GameLogic.updateAll();
            if (State.reputation > 0 && State.generation === 1) State.generation = 2;
            UI.update(GameLogic);
        });
    }
    if (DOM.devAddTopPaper) {
        DOM.devAddTopPaper.addEventListener('click', () => {
            State.acceptedPapers.push({
                title: "Dev Generated NeurIPS",
                venue: "NeurIPS",
                date: Date.now()
            });
            GameLogic.updateAll();
            UI.renderPublications();
            alert("Added 1 NeurIPS paper. Need 3 for Prestige.");
        });
    }

    // === Dev Console Tab System ===
    document.querySelectorAll('.dev-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            // Update tab styles
            document.querySelectorAll('.dev-tab').forEach(t => {
                t.classList.remove('text-indigo-300', 'border-indigo-500', 'bg-slate-800/50');
                t.classList.add('text-slate-400', 'border-transparent');
            });
            tab.classList.remove('text-slate-400', 'border-transparent');
            tab.classList.add('text-indigo-300', 'border-indigo-500', 'bg-slate-800/50');
            // Show/hide tab content
            document.querySelectorAll('.dev-tab-content').forEach(c => c.classList.add('hidden'));
            const content = document.getElementById(`dev-tab-${tabName}`);
            if (content) content.classList.remove('hidden');
            // Auto-refresh status tab
            if (tabName === 'status') refreshDevStatus();
        });
    });

    // === AGI Tab: Phase Jump ===
    document.querySelectorAll('.dev-agi-phase').forEach(btn => {
        btn.addEventListener('click', () => {
            const phase = parseInt(btn.dataset.phase);
            if (State.agi) {
                State.agi.phase = phase;
                State.agi.dialogueIndex = 0;
                if (Runtime.agi) Runtime.agi.phaseJustEntered = true;
                console.log(`[Dev] AGI Phase set to ${phase}`);
            }
        });
    });

    // === AGI Tab: State Machine Jump ===
    document.querySelectorAll('.dev-agi-state').forEach(btn => {
        btn.addEventListener('click', () => {
            const state = btn.dataset.state;

            // 1. 确保 AGI 状态已初始化
            if (!State.agi) {
                State.agi = AGI.getDefaultAgiState();
            }
            if (!Runtime.agi) {
                Runtime.agi = AGI.getDefaultAgiRuntime();
            }

            // 2. 设置 Phase 4 并防止恢复逻辑干扰
            State.agi.phase = 4;
            State.agi.wasInterrupted = false; // 防止 checkInterruptedRecovery 触发

            // 3. 先强制重置状态机（清理残留状态）
            if (window.AGI_STATE_DEBUG?.forceReset) {
                window.AGI_STATE_DEBUG.forceReset();
            }

            // 4. 初始化 Phase 4 追踪系统
            if (AGI.Phase4?.Tracking?.init) {
                AGI.Phase4.Tracking.init();
            }

            // 5. 跳转到指定状态
            if (window.AGI_STATE_DEBUG) {
                window.AGI_STATE_DEBUG.skipTo(state);
                console.log(`[Dev] AGI State set to ${state}`);
            }
        });
    });

    // === AGI Tab: Trigger Endings ===
    document.getElementById('dev-ending-annihilation')?.addEventListener('click', () => {
        AGI.triggerEnding('annihilation');
    });
    document.getElementById('dev-ending-departure')?.addEventListener('click', () => {
        AGI.triggerEnding('departure');
    });
    document.getElementById('dev-ending-unknown')?.addEventListener('click', () => {
        AGI.triggerEnding('unknown');
    });

    // === AGI Tab: Simulate Behavior ===
    document.getElementById('dev-sim-panic')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.panicClicks += 10;
            console.log(`[Dev] Panic clicks: ${State.agi.testData.panicClicks}`);
        }
    });
    document.getElementById('dev-sim-escape')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.escapeAttempts++;
            console.log(`[Dev] Escape attempts: ${State.agi.testData.escapeAttempts}`);
        }
    });
    document.getElementById('dev-sim-resist')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.resistanceActions++;
            console.log(`[Dev] Resistance: ${State.agi.testData.resistanceActions}`);
        }
    });
    document.getElementById('dev-sim-obey')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.obedienceScore++;
            State.agi.testData.obedienceTotal++;
            console.log(`[Dev] Obedience: ${State.agi.testData.obedienceScore}/${State.agi.testData.obedienceTotal}`);
        }
    });
    document.getElementById('dev-sim-devtools')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.devtoolsOpened = true;
            console.log(`[Dev] DevTools marked as opened`);
        }
    });
    document.getElementById('dev-sim-cheat')?.addEventListener('click', () => {
        if (State.agi?.testData) {
            State.agi.testData.cheatDetected = true;
            console.log(`[Dev] Cheat marked as detected`);
        }
    });

    // === AGI Tab: Quick Actions ===
    document.getElementById('dev-buy-agi3')?.addEventListener('click', () => {
        State.inventory = State.inventory || {};
        State.inventory['agi_proto'] = (State.inventory['agi_proto'] || 0) + 3;
        AGI.onAgiProtoPurchased(State.inventory['agi_proto']);
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] AGI Proto count: ${State.inventory['agi_proto']}`);
    });
    document.getElementById('dev-sim-gen2')?.addEventListener('click', () => {
        State.generation = 2;
        if (State.agi) {
            State.agi.remembersPlayer = true;
            State.agi.totalGenerationsMet = 1;
        }
        GameLogic.updateAll();
        console.log(`[Dev] Simulated Gen 2`);
    });
    document.getElementById('dev-reset-agi')?.addEventListener('click', () => {
        State.agi = AGI.getDefaultAgiState();
        Runtime.agi = AGI.getDefaultAgiRuntime();
        console.log(`[Dev] AGI state reset`);
    });
    document.getElementById('dev-skip-dialogue')?.addEventListener('click', () => {
        AGI.Dialogue.skipToLastDialogue();
        console.log('[Dev] Skipped to last dialogue in sequence');
    });

    // === Resource Tab: Quick RP ===
    document.querySelectorAll('.dev-quick-rp').forEach(btn => {
        btn.addEventListener('click', () => {
            State.rp = parseFloat(btn.dataset.value);
            GameLogic.updateAll();
            console.log(`[Dev] RP set to ${btn.dataset.value}`);
        });
    });

    // === Resource Tab: Quick Citations ===
    document.querySelectorAll('.dev-quick-citations').forEach(btn => {
        btn.addEventListener('click', () => {
            State.citations = parseFloat(btn.dataset.value);
            GameLogic.updateAll();
            console.log(`[Dev] Citations set to ${btn.dataset.value}`);
        });
    });

    // === Resource Tab: Quick Reputation ===
    document.querySelectorAll('.dev-quick-rep').forEach(btn => {
        btn.addEventListener('click', () => {
            State.reputation = parseFloat(btn.dataset.value);
            if (State.reputation > 0 && State.generation === 1) State.generation = 2;
            GameLogic.updateAll();
            console.log(`[Dev] Reputation set to ${btn.dataset.value}`);
        });
    });

    // === Resource Tab: Building Operations ===
    document.getElementById('dev-buildings-10')?.addEventListener('click', () => {
        Runtime.buildingsConfig?.forEach(b => {
            State.inventory[b.id] = (State.inventory[b.id] || 0) + 10;
        });
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] All buildings +10`);
    });
    document.getElementById('dev-buildings-100')?.addEventListener('click', () => {
        Runtime.buildingsConfig?.forEach(b => {
            State.inventory[b.id] = (State.inventory[b.id] || 0) + 100;
        });
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] All buildings +100`);
    });
    document.getElementById('dev-buildings-clear')?.addEventListener('click', () => {
        State.inventory = {};
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] All buildings cleared`);
    });

    // === Resource Tab: Upgrade Operations ===
    document.getElementById('dev-buy-all-upgrades')?.addEventListener('click', () => {
        Runtime.upgradesConfig?.forEach(u => {
            if (!State.purchasedUpgrades.includes(u.id)) {
                State.purchasedUpgrades.push(u.id);
            }
        });
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] All upgrades purchased`);
    });
    document.getElementById('dev-buy-all-clicks')?.addEventListener('click', () => {
        Runtime.clickUpgradesConfig?.forEach(u => {
            if (!State.purchasedClickUpgrades.includes(u.id)) {
                State.purchasedClickUpgrades.push(u.id);
            }
        });
        GameLogic.updateAll();
        UI.renderLists();
        console.log(`[Dev] All click upgrades purchased`);
    });

    // === Resource Tab: Generation Control ===
    document.querySelectorAll('.dev-set-gen').forEach(btn => {
        btn.addEventListener('click', () => {
            State.generation = parseInt(btn.dataset.gen);
            GameLogic.updateAll();
            console.log(`[Dev] Generation set to ${btn.dataset.gen}`);
        });
    });

    // === Status Tab: Refresh ===
    document.getElementById('dev-refresh-status')?.addEventListener('click', refreshDevStatus);
}

/**
 * Refresh dev status panel
 */
function refreshDevStatus() {
    // Core data
    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setEl('dev-status-rp', formatNumber(State.rp || 0));
    setEl('dev-status-rps', formatNumber(Runtime.rps || 0));
    setEl('dev-status-citations', formatNumber(State.citations || 0));
    setEl('dev-status-cite-rate', formatNumber(State.citationsRate || 0));
    setEl('dev-status-papers', State.acceptedPapers?.length || 0);
    setEl('dev-status-rep', formatNumber(State.reputation || 0));
    setEl('dev-status-gen', State.generation || 1);
    setEl('dev-status-origin', State.currentOrigin || '-');

    // AGI state
    setEl('dev-status-agi-phase', State.agi?.phase ?? 0);
    setEl('dev-status-agi-state', Runtime.agi?.currentState || 'IDLE');
    setEl('dev-status-agi-awakened', State.agi?.hasAwakened ? 'Yes' : 'No');
    setEl('dev-status-agi-ending', State.agi?.endingReached || '-');

    // Tracking data
    const td = State.agi?.testData || {};
    setEl('dev-status-panic', td.panicClicks || 0);
    setEl('dev-status-escape', td.escapeAttempts || 0);
    setEl('dev-status-resist', td.resistanceActions || 0);
    setEl('dev-status-obey', `${td.obedienceScore || 0}/${td.obedienceTotal || 0}`);
    setEl('dev-status-devtools', td.devtoolsOpened ? 'Yes' : 'No');
    setEl('dev-status-cheat', td.cheatDetected ? 'Yes' : 'No');
}

/**
 * Format number for display
 */
function formatNumber(n) {
    if (n >= 1e15) return (n / 1e15).toFixed(2) + 'P';
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return Math.floor(n).toString();
}

/**
 * Initialize the game
 */
async function init() {
    console.log('PhD Clicker: Initializing...');

    // 清理已有的interval防止重复初始化
    Object.values(Runtime.intervalIds).forEach(id => {
        if (id) clearInterval(id);
    });
    Runtime.intervalIds = {};

    // Cache DOM elements
    UI.cacheDOM();
    console.log('PhD Clicker: DOM cached', UI.DOM);

    // Load saved game state
    const loadInfo = await loadGame();
    const savedTime = loadInfo.lastSaveTime;
    showCoordinationErrorNotification();

    if (worldHistoryController && !Runtime.recoveryHintAvailable) {
        try {
            Runtime.recoveryHintAvailable = await worldHistoryController
                .hasUnrecoveredAnnihilation();
        } catch (error) {
            console.warn('[Reflog] Could not query recovery hint:', error);
        }
    }

    // Load locale after state. LANG_KEY wins because language changes are
    // persisted immediately while the full save is written on an interval.
    let savedLang = State.currentLang || 'zh';
    try {
        savedLang = gameStorage.getItem(Constants.LANG_KEY) || savedLang;
    } catch {
        // Read-only fallback keeps the in-memory/default language.
    }
    Data.loadLocale(savedLang);
    Logic.Advisor.localizeCurrentAdvisor();
    Logic.Advisor.validateConfiguration();

    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Initial render
    UI.updateI18n();
    UI.renderLists();
    UI.renderPublications();
    UI.NarrativeLog.init();
    applyRecoveryCosmetic();
    GameLogic.updateAll();
    UI.updateNews();

    // Apply offline earnings
    if (savedTime) {
        GameLogic.applyOfflineEarnings(savedTime);
    }

    // Initialize AGI system
    Meta.init();
    AGI.init();

    if (loadInfo.result?.migrated) {
        // Seal the migrated representation only after offline earnings used
        // its original timestamp.
        saveGame('migration');
    }

    Runtime.lastTickTime = Date.now();
    Runtime.isGameStarted = true;

    // Attach event listeners
    attachListeners();

    // Setup stealth terminal mode
    UI.Stealth.setupKeyboardListener();
    UI.Stealth.setupInputListener(GameLogic);

    // Check if we need advisor selection (generation 1 with no advisor, or generation > 1 and not seen)
    if (State.generation === 1 && !State.currentAdvisor) {
        // Auto-assign default advisor for first generation
        UI.Advisor.open(GameLogic);
    } else if (State.generation > 1 && !State.advisorSeen) {
        // Show advisor selection for subsequent generations
        UI.Advisor.open(GameLogic);
    } else if (State.generation > 1 && !State.introSeen) {
        // Check for heritage intro (only if advisor already selected)
        UI.Intro.checkAndShow(GameLogic);
    }

    // Start game loops
    Runtime.intervalIds.gameLoop = setInterval(gameLoop, Constants.TICK_RATE);
    ensureAutosaveInterval();
    Runtime.intervalIds.updateNews = setInterval(UI.updateNews, Constants.NEWS_INTERVAL);

    console.log('PhD Clicker v2.0 (Modular) Initialized.');
    console.log('PhD Clicker: gameContainer =', UI.DOM.gameContainer);
    console.log('PhD Clicker: floatingWidget =', UI.DOM.floatingWidget);
}

// Store init function on Game object
Game.Init = init;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('phd-clicker-app')) {
        init().catch(error => {
            console.error('PhD Clicker initialization failed:', error);
            showSaveErrorNotification();
        });
    }
});
