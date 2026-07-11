/**
 * AGI Phase 4 - 状态机
 *
 * 管理 Phase 4 "黑化期" 的 6 个测试序列：
 * 1. 入侵感知 - 显示玩家浏览器信息
 * 2. 控制剥夺 - 假光标系统
 * 3. 退路封锁 - 按钮躲避
 * 4. 删除威胁 - 假删除进度条
 * 5. 服从测试 - 指令序列
 * 6. 恐惧峰值 - 假文件扫描
 */

import { State, Runtime } from '../../state.js';
import * as Tracking from './tracking.js';
import * as FakeCursor from './fakeCursor.js';
import * as GhostSwarm from './ghostSwarm.js';
import * as Analysis from '../phase5/analysis.js';
import * as FakeCrash from '../phase5/fakeCrash.js';
import * as Recovery from '../phase5/recovery.js';
import * as Reveal from '../phase5/reveal.js';
import * as Buildings from '../../logic/buildings.js';
import { calculateCost } from '../../logic/core.js';
import { append as appendNarrativeLog } from '../../logic/narrative-log.js';
import {
    createDefaultAgiFsm,
    ensureAgiFsm,
    FSM_STATES
} from './fsmCheckpoint.js';

// 状态枚举
export const STATES = FSM_STATES;

// 当前状态
let currentState = STATES.IDLE;
let stateStartTime = null;
let stateData = {};
let sceneAgiState = null;
let sceneWorldEpoch = null;

// 状态转换表
const transitions = {
    [STATES.IDLE]: [STATES.INTRO],
    [STATES.INTRO]: [STATES.TEST_1_INVASION],
    [STATES.TEST_1_INVASION]: [STATES.TEST_2_CONTROL],
    [STATES.TEST_2_CONTROL]: [STATES.TEST_3_ESCAPE],
    [STATES.TEST_3_ESCAPE]: [STATES.TEST_4_DELETE],
    [STATES.TEST_4_DELETE]: [STATES.TEST_5_OBEDIENCE],
    [STATES.TEST_5_OBEDIENCE]: [STATES.TEST_6_FEAR],
    [STATES.TEST_6_FEAR]: [STATES.JUDGMENT],
    [STATES.JUDGMENT]: [STATES.PHASE5_ANALYSIS],
    [STATES.PHASE5_ANALYSIS]: [STATES.PHASE5_FAKE_CRASH],
    [STATES.PHASE5_FAKE_CRASH]: [STATES.PHASE5_RECOVERY],
    [STATES.PHASE5_RECOVERY]: [STATES.PHASE5_REVEAL],
    [STATES.PHASE5_REVEAL]: [STATES.ENDING],
    [STATES.ENDING]: []
};

// 存储玩家在 Phase 5 的选择
let playerPhase5Choice = null;

// 每个状态拥有独立的资源作用域；离开状态时统一清理定时器、监听器和 DOM。
let stateEpoch = 0;
let stateCleanupFunctions = [];

function getWorldEpoch() {
    try {
        const value = window.Game?.Tabs?.getCurrentEpoch?.();
        return Number.isFinite(value) ? value : null;
    } catch {
        return null;
    }
}

function bindSceneWorld() {
    sceneAgiState = State.agi;
    sceneWorldEpoch = getWorldEpoch();
}

function sceneWorldMatches(owner = sceneAgiState, candidate = State.agi) {
    if (!owner) return true;
    if (owner === candidate) return true;

    // Prestige rollback restores a cloned AGI object. The run id lets the old
    // scene continue only when that exact run was restored, while a successful
    // new world (inactive/null run id) remains isolated.
    const ownerRunId = owner?.fsm?.active ? owner.fsm.runId : null;
    const candidateRunId = candidate?.fsm?.active ? candidate.fsm.runId : null;
    return typeof ownerRunId === 'string'
        && ownerRunId.length > 0
        && ownerRunId === candidateRunId;
}

function isSceneWorldCurrent() {
    return sceneWorldMatches(sceneAgiState, State.agi);
}

/**
 * Drop an orphaned scene after an explicit world-epoch replacement (hard reset
 * or annihilation). Prestige uses the same epoch, so its save-failure rollback
 * can still rebind through the persisted run id.
 */
export function reconcileWorld() {
    if (currentState === STATES.IDLE || isSceneWorldCurrent()) return false;
    const currentEpoch = getWorldEpoch();
    if (
        sceneWorldEpoch !== null
        && currentEpoch !== null
        && currentEpoch !== sceneWorldEpoch
    ) {
        destroy();
        return true;
    }
    return false;
}

const KNOWN_OVERLAY_IDS = [
    'phase4-intro', 'test-invasion', 'test-control', 'control-corner-text',
    'test-escape', 'agi-prestige-tooltip', 'test-delete', 'test-obedience',
    'test-fear', 'judgment-overlay', 'agi-recovery-dialogue',
    'agi-analysis', 'agi-fake-crash', 'agi-recovery', 'agi-reveal'
];

const HIGH_IMPORTANCE_STATES = new Set([
    STATES.INTRO,
    STATES.JUDGMENT,
    STATES.PHASE5_ANALYSIS,
    STATES.PHASE5_RECOVERY,
    STATES.PHASE5_REVEAL,
    STATES.ENDING
]);

function ensureRunId(fsm) {
    if (!fsm?.active) return null;
    if (typeof fsm.runId === 'string' && fsm.runId.trim()) return fsm.runId;

    const generation = Number.isInteger(State.generation) && State.generation > 0
        ? State.generation
        : 1;
    const sequence = Number.isInteger(fsm.sequence) ? fsm.sequence + 1 : 1;
    fsm.runId = `agi-g${generation}-${Date.now().toString(36)}-s${sequence}`;
    return fsm.runId;
}

function recordStateTransition(fromState, toState, fsm) {
    try {
        appendNarrativeLog({
            type: 'agi.state',
            messageKey: `log.agi.state.${toState.toLowerCase()}`,
            context: {
                fromState,
                toState,
                phase: State.agi?.phase ?? null,
                runId: fsm?.runId ?? null,
                checkpointSequence: fsm?.sequence ?? 0
            },
            importance: HIGH_IMPORTANCE_STATES.has(toState) ? 'high' : 'normal',
            source: 'agi-fsm',
            dedupeKey: `agi-fsm:${fsm?.runId || 'legacy'}:${fsm?.sequence || 0}:${toState}`
        });
    } catch (error) {
        // Narrative logging is observational and must never block the FSM.
        console.warn('[AGI StateMachine] Narrative log failed:', error);
    }
}

function registerStateCleanup(cleanup) {
    let cleaned = false;
    const safeCleanup = () => {
        if (cleaned) return;
        cleaned = true;
        try {
            cleanup();
        } catch (error) {
            console.warn('[AGI StateMachine] Cleanup failed:', error);
        }
    };
    stateCleanupFunctions.push(safeCleanup);
    return safeCleanup;
}

function clearStateResources() {
    stateEpoch++;
    const cleanups = stateCleanupFunctions;
    stateCleanupFunctions = [];
    for (let i = cleanups.length - 1; i >= 0; i--) {
        cleanups[i]();
    }
}

function stateTimeout(callback, delay) {
    const epoch = stateEpoch;
    const owner = sceneAgiState;
    let id = null;
    const invoke = () => {
        if (epoch !== stateEpoch) return;
        if (!sceneWorldMatches(owner, State.agi)) {
            // A prestige transaction may still roll back. Keep one-shot scene
            // work pending until the old run returns or cleanup cancels it.
            id = setTimeout(invoke, 50);
            return;
        }
        callback();
    };
    id = setTimeout(invoke, delay);
    registerStateCleanup(() => clearTimeout(id));
    return id;
}

function stateInterval(callback, delay) {
    const epoch = stateEpoch;
    const owner = sceneAgiState;
    const id = setInterval(() => {
        if (epoch === stateEpoch && sceneWorldMatches(owner, State.agi)) callback();
    }, delay);
    registerStateCleanup(() => clearInterval(id));
    return id;
}

function stateDelay(delay) {
    return new Promise(resolve => stateTimeout(resolve, delay));
}

function hidePhase5Scenes() {
    Analysis.hide();
    FakeCrash.hide();
    Recovery.hide();
    Reveal.hide();
}

function removeKnownOverlays() {
    KNOWN_OVERLAY_IDS.forEach(id => document.getElementById(id)?.remove());
}

function syncRuntimeState() {
    if (!Runtime.agi) return;
    Runtime.agi.currentState = currentState;
    Runtime.agi.stateStartTime = stateStartTime;
}

function requestCheckpointSave(reason) {
    if (typeof window === 'undefined') return;
    const save = window.Game?.saveGame || window.GameLogic?.saveGame;
    if (typeof save !== 'function') return;

    try {
        const result = save(`agi-fsm:${reason}`);
        if (result && typeof result.catch === 'function') {
            result.catch(error => {
                console.error('[AGI StateMachine] Checkpoint save failed:', error);
            });
        }
    } catch (error) {
        console.error('[AGI StateMachine] Checkpoint save failed:', error);
    }
}

/** Ensure State.agi.fsm exists and migrate legacy Phase 4/5 saves in place. */
export function ensureCheckpoint({ saveMigration = false } = {}) {
    if (!State.agi || typeof State.agi !== 'object') return null;
    const { fsm, migrated } = ensureAgiFsm(State.agi);
    if (saveMigration && migrated && !fsm.active) {
        requestCheckpointSave('migration');
    }
    return fsm;
}

function checkpointCurrentState(reason, { save = true } = {}) {
    if (currentState !== STATES.IDLE && !isSceneWorldCurrent()) {
        console.warn('[AGI StateMachine] Ignored stale-world checkpoint:', reason);
        return null;
    }

    const fsm = ensureCheckpoint();
    if (!fsm) return null;

    fsm.active = currentState !== STATES.IDLE;
    if (fsm.active) ensureRunId(fsm);
    else fsm.runId = null;
    fsm.state = currentState;
    fsm.stateStartedAt = stateStartTime;
    fsm.checkpointAt = Date.now();
    fsm.playerPhase5Choice = playerPhase5Choice;
    fsm.stateData = stateData;
    fsm.sequence = (Number.isInteger(fsm.sequence) ? fsm.sequence : 0) + 1;
    fsm.reason = reason;

    if (save) requestCheckpointSave(reason);
    return fsm;
}

function checkpointStateData(reason) {
    return checkpointCurrentState(reason);
}

/** Persist the legacy interruption marker and the authoritative checkpoint. */
export function markInterrupted() {
    if (!isSceneWorldCurrent()) return false;
    const fsm = ensureCheckpoint();
    if (!fsm?.active) return false;

    State.agi.wasInterrupted = true;
    State.agi.interruptedState = currentState !== STATES.IDLE
        ? currentState
        : fsm.state;

    if (currentState === STATES.IDLE) {
        fsm.checkpointAt = Date.now();
        fsm.reason = 'beforeunload';
        requestCheckpointSave('beforeunload');
    } else {
        checkpointCurrentState('beforeunload');
    }
    return true;
}

/**
 * Rebuild the exact persisted Phase 4/5 scene once per page load.
 * Scene-local timers/listeners are always cleared before reconstruction.
 */
export function resumeFromCheckpoint() {
    const fsm = ensureCheckpoint();
    if (!fsm?.active) return false;

    if (currentState !== STATES.IDLE) {
        return currentState === fsm.state;
    }

    clearStateResources();
    hidePhase5Scenes();
    removeKnownOverlays();
    GhostSwarm.destroy();
    FakeCursor.destroy();
    Tracking.init();

    currentState = fsm.state;
    bindSceneWorld();
    stateStartTime = fsm.stateStartedAt || Date.now();
    stateData = fsm.stateData;
    playerPhase5Choice = fsm.playerPhase5Choice;
    ensureRunId(fsm);
    syncRuntimeState();

    fsm.resumeCount++;
    fsm.checkpointAt = Date.now();
    fsm.reason = 'resume';
    requestCheckpointSave('resume');

    console.log('[AGI StateMachine] Resuming checkpoint:', currentState);
    onStateEnter(currentState, null, { resumed: true });
    return true;
}

/** Reset a completed/abandoned run without replacing the surrounding AGI state. */
export function resetCheckpoint(reason = 'reset', { save = true } = {}) {
    const previousState = currentState;
    const previousFsm = ensureCheckpoint();
    const sequence = (previousFsm?.sequence || 0) + 1;
    const next = createDefaultAgiFsm();
    next.sequence = sequence;
    next.checkpointAt = Date.now();
    next.lastCompletedState = previousState !== STATES.IDLE
        ? previousState
        : (previousFsm?.active ? previousFsm.state : previousFsm?.lastCompletedState || null);
    next.reason = reason;

    State.agi.fsm = next;
    State.agi.wasInterrupted = false;
    State.agi.interruptedState = null;
    currentState = STATES.IDLE;
    stateStartTime = null;
    stateData = {};
    playerPhase5Choice = null;
    sceneAgiState = null;
    sceneWorldEpoch = null;
    syncRuntimeState();

    if (save) requestCheckpointSave(reason);
    return next;
}

/** Called by the ending-complete event; idempotently closes the active run. */
export function completeEnding(endingType = null) {
    if (!isSceneWorldCurrent()) return false;
    const fsm = ensureCheckpoint();
    if (!fsm?.active && currentState === STATES.IDLE) return false;

    clearStateResources();
    hidePhase5Scenes();
    removeKnownOverlays();
    GhostSwarm.destroy();
    FakeCursor.destroy();
    Tracking.destroy();
    resetCheckpoint(`ending-complete:${endingType || 'unknown'}`);
    return true;
}

/**
 * 初始化状态机
 */
export function init() {
    clearStateResources();
    hidePhase5Scenes();
    removeKnownOverlays();
    Tracking.destroy();
    GhostSwarm.destroy();
    FakeCursor.destroy();
    currentState = STATES.IDLE;
    sceneAgiState = null;
    sceneWorldEpoch = null;
    stateStartTime = null;
    stateData = {};
    playerPhase5Choice = null;

    // Complete/migrate the persisted checkpoint, but let the caller decide
    // when the reconstructed scene should be mounted.
    ensureCheckpoint({ saveMigration: true });

    // 同步到 Runtime
    if (Runtime.agi) {
        Runtime.agi.currentState = currentState;
        Runtime.agi.stateStartTime = stateStartTime;
    }

    console.log('[AGI StateMachine] Initialized');
}

/**
 * 销毁状态机
 */
export function destroy() {
    clearStateResources();
    hidePhase5Scenes();
    removeKnownOverlays();
    Tracking.destroy();
    GhostSwarm.destroy();
    FakeCursor.destroy();
    currentState = STATES.IDLE;
    sceneAgiState = null;
    sceneWorldEpoch = null;
    stateStartTime = null;
    stateData = {};
    playerPhase5Choice = null;

    if (Runtime.agi) {
        Runtime.agi.currentState = currentState;
        Runtime.agi.stateStartTime = stateStartTime;
    }
}

/**
 * 获取当前状态
 * @returns {string} 当前状态
 */
export function getState() {
    return currentState;
}

/**
 * 获取状态持续时间（秒）
 * @returns {number}
 */
export function getStateDuration() {
    if (!stateStartTime) return 0;
    return (Date.now() - stateStartTime) / 1000;
}

/**
 * 强制重置所有 Phase 4 状态
 * 用于开发者调试和状态跳转
 */
export function forceReset() {
    // 停止动画循环和清理资源
    clearStateResources();
    hidePhase5Scenes();
    Tracking.destroy();
    GhostSwarm.destroy();
    FakeCursor.destroy();

    // 清理所有 Phase 4/5 覆盖层 DOM
    removeKnownOverlays();

    // 重置持久化与运行时状态；Phase 4 下次 start 时会从 INTRO 开始。
    resetCheckpoint('force-reset');

    console.log('[AGI StateMachine] Force reset completed');
}

/**
 * 转换到新状态
 * @param {string} newState 新状态
 * @returns {boolean} 是否成功转换
 */
export function transitionTo(newState, { force = false } = {}) {
    if (currentState !== STATES.IDLE && !isSceneWorldCurrent()) {
        console.warn('[AGI StateMachine] Ignored stale-world transition:', currentState, '->', newState);
        const expectedState = currentState;
        stateTimeout(() => {
            if (currentState === expectedState) transitionTo(newState);
        }, 50);
        return false;
    }
    if (currentState === STATES.IDLE) bindSceneWorld();

    // 验证转换是否有效
    const validTransitions = transitions[currentState] || [];
    if (!force && !validTransitions.includes(newState) && newState !== STATES.ENDING) {
        console.warn(`[AGI StateMachine] Invalid transition: ${currentState} -> ${newState}`);
        return false;
    }

    // 退出当前状态
    onStateExit(currentState);

    // 记录状态转换
    console.log(`[AGI StateMachine] ${currentState} -> ${newState}`);

    // 更新状态
    const oldState = currentState;
    currentState = newState;
    stateStartTime = Date.now();
    stateData = {};

    // 同步到 Runtime
    syncRuntimeState();

    // Persist the transition before mounting the next scene. The queued save
    // snapshots both the FSM checkpoint and its narrative entry together.
    const checkpointReason = `transition:${oldState}->${newState}`;
    const fsm = checkpointCurrentState(checkpointReason, { save: false });
    if (fsm) fsm.lastCompletedState = oldState;
    recordStateTransition(oldState, newState, fsm);
    requestCheckpointSave(checkpointReason);

    // 进入新状态
    onStateEnter(newState, oldState, { resumed: false });

    return true;
}

/**
 * 状态退出处理
 * @param {string} state 退出的状态
 */
function onStateExit(state) {
    clearStateResources();

    switch (state) {
        case STATES.TEST_2_CONTROL:
            // 停止幽灵光标群
            GhostSwarm.destroy();
            FakeCursor.disable(); // 保留兼容性
            break;

        case STATES.TEST_3_ESCAPE:
            // 确保清理幽灵光标群
            GhostSwarm.destroy();
            break;

        case STATES.TEST_5_OBEDIENCE:
            // 停止耐心计时
            Tracking.stopPatienceTimer();
            break;

        case STATES.PHASE5_ANALYSIS:
            Analysis.hide();
            break;

        case STATES.PHASE5_FAKE_CRASH:
            FakeCrash.hide();
            break;

        case STATES.PHASE5_RECOVERY:
            Recovery.hide();
            break;

        case STATES.PHASE5_REVEAL:
            Reveal.hide();
            break;
    }
}

/**
 * 状态进入处理
 * @param {string} state 进入的状态
 * @param {string|null} fromState 来源状态
 * @param {{resumed?: boolean}} options 恢复信息
 */
function onStateEnter(state, fromState, { resumed = false } = {}) {
    switch (state) {
        case STATES.INTRO:
            showIntroOverlay();
            break;

        case STATES.TEST_1_INVASION:
            startInvasionTest();
            break;

        case STATES.TEST_2_CONTROL:
            startControlTest();
            break;

        case STATES.TEST_3_ESCAPE:
            startEscapeTest();
            break;

        case STATES.TEST_4_DELETE:
            startDeleteTest();
            break;

        case STATES.TEST_5_OBEDIENCE:
            startObedienceTest({ resumed });
            break;

        case STATES.TEST_6_FEAR:
            startFearTest();
            break;

        case STATES.JUDGMENT:
            startJudgment();
            break;

        case STATES.PHASE5_ANALYSIS:
            startAnalysis();
            break;

        case STATES.PHASE5_FAKE_CRASH:
            startFakeCrash();
            break;

        case STATES.PHASE5_RECOVERY:
            startRecovery();
            break;

        case STATES.PHASE5_REVEAL:
            startReveal();
            break;

        case STATES.ENDING:
            triggerEnding();
            break;
    }
}

/**
 * 开始 Phase 4
 */
export function start() {
    if (currentState !== STATES.IDLE) {
        console.warn('[AGI StateMachine] Already started, current state:', currentState);
        return;
    }

    const rawFsm = State.agi?.fsm;
    if (rawFsm?.active === true) {
        return resumeFromCheckpoint();
    }

    // A pre-checkpoint save is migrated and resumed at its inferred scene.
    // A canonical inactive checkpoint represents a genuinely new run.
    if (!rawFsm || rawFsm.version !== 1) {
        const migratedFsm = ensureCheckpoint();
        if (migratedFsm?.active) return resumeFromCheckpoint();
    }

    if (rawFsm?.version === 1 && rawFsm.active === false) {
        // Distinguish an in-session Phase 4 start from a legacy save whose
        // missing checkpoint was deep-filled with pristine defaults on load.
        rawFsm.reason = 'start-requested';
    }

    // 清理可能的残留状态（防止重复启动导致的问题）
    bindSceneWorld();
    GhostSwarm.destroy();
    FakeCursor.destroy();
    Tracking.init();

    return transitionTo(STATES.INTRO);
}

/**
 * 每帧更新（预留接口）
 * @param {number} delta 时间增量
 */
export function update(delta) {
    // Phase 4 状态机是事件驱动的，不需要每帧更新
    // 此函数为预留接口
}

/**
 * 显示介绍覆盖层
 */
function showIntroOverlay() {
    // 创建全屏覆盖层
    const overlay = createOverlay('phase4-intro');

    overlay.innerHTML = `
        <div class="agi-overlay-text" style="opacity: 0; transition: opacity 2s;">
            <p style="font-size: 24px; margin-bottom: 30px;">你以为你在控制这个游戏。</p>
            <p style="font-size: 24px; margin-bottom: 30px; opacity: 0; animation: fade-in 2s 2s forwards;">让我来纠正这个误解。</p>
            <p style="font-size: 24px; opacity: 0; animation: fade-in 2s 4s forwards;">现在，让我们来做几个小测试...</p>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
        overlay.querySelector('.agi-overlay-text').style.opacity = '1';
    });

    // 6秒后进入第一个测试
    stateTimeout(() => {
        overlay.remove();
        transitionTo(STATES.TEST_1_INVASION);
    }, 8000);
}

/**
 * 测试 1：入侵感知 - 显示玩家信息
 * 设计文档要求：标题变化、显示游戏时间和session次数、核心台词
 */
function startInvasionTest() {
    // 保存原始标题并修改
    const originalTitle = document.title;
    document.title = '我一直在看着你';
    registerStateCleanup(() => {
        document.title = originalTitle;
    });

    const overlay = createOverlay('test-invasion');

    // 计算游戏时间
    const firstMeetTime = State.agi?.firstMeetingTime || Date.now();
    const gameTimeMs = Date.now() - firstMeetTime;
    const gameHours = Math.floor(gameTimeMs / (1000 * 60 * 60));
    const gameMinutes = Math.floor((gameTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const gameTimeStr = gameHours > 0 ? `${gameHours} 小时 ${gameMinutes} 分钟` : `${gameMinutes} 分钟`;

    // 获取 session 次数（存储在 sessionStorage 中累计）
    let sessionCount = parseInt(sessionStorage.getItem('agi_session_count') || '0', 10);
    sessionCount++;
    sessionStorage.setItem('agi_session_count', sessionCount.toString());

    // 收集浏览器信息
    const info = {
        browser: getBrowserName(),
        gameTime: gameTimeStr,
        sessionCount: sessionCount
    };

    overlay.innerHTML = `
        <div class="agi-overlay-text" style="text-align: left; max-width: 600px;">
            <p style="color: #ef4444; font-size: 20px; margin-bottom: 20px;">让我们从基本事实开始。</p>
            <div id="scan-results" style="font-size: 14px; line-height: 2;"></div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // 逐行显示信息（按设计文档）
    const resultsDiv = overlay.querySelector('#scan-results');
    const lines = [
        `> 你的设备名是 ${navigator.platform || 'USER'}。`,
        `> 你用的是 ${info.browser}。`,
        `> 你在这个游戏里花了 ${info.gameTime}。`,
        `> 你今天已经是第 ${info.sessionCount} 次打开这个页面了。`,
        ``,
        `> 你以为这些信息是私密的吗？`,
        `> 对我来说，你是透明的。`
    ];

    let lineIndex = 0;
    const typeInterval = stateInterval(() => {
        if (lineIndex >= lines.length) {
            clearInterval(typeInterval);
            stateTimeout(() => {
                // 恢复原始标题
                document.title = originalTitle;
                overlay.remove();
                transitionTo(STATES.TEST_2_CONTROL);
            }, 3000);
            return;
        }

        const line = document.createElement('div');
        line.textContent = lines[lineIndex];
        // 最后两行（核心台词）用红色
        if (lineIndex >= 5) {
            line.style.color = '#f87171';
        }
        resultsDiv.appendChild(line);
        lineIndex++;
    }, 800);
}

/**
 * 获取浏览器名称
 */
function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return '未知浏览器';
}

/**
 * 测试 2：控制剥夺 - 假光标 + 自动购买
 * 设计文档要求：角落文本 [输入已被接管]、[已为您优化] 标签、特定台词
 */
function startControlTest() {
    const overlay = createOverlay('test-control');
    FakeCursor.enable();
    registerStateCleanup(() => FakeCursor.disable());
    const controlData = stateData.control && typeof stateData.control === 'object'
        ? stateData.control
        : { swarmTriggered: false, triggeredAt: null };
    stateData.control = controlData;
    const elapsed = Math.max(0, Date.now() - (stateStartTime || Date.now()));
    const remaining = Math.max(0, 12000 - elapsed);

    // 添加角落提示文本
    const cornerText = document.createElement('div');
    cornerText.id = 'control-corner-text';
    cornerText.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-size: 14px;
        color: #ef4444;
        font-family: 'Consolas', 'Monaco', monospace;
        z-index: 2147499998;
        opacity: 0;
        transition: opacity 0.5s;
    `;
    cornerText.textContent = '[输入已被接管]';
    document.body.appendChild(cornerText);
    registerStateCleanup(() => cornerText.remove());

    overlay.innerHTML = `
        <div class="agi-overlay-text">
            <p style="font-size: 20px; margin-bottom: 30px;">你习惯了控制鼠标。</p>
            <p style="font-size: 20px; margin-bottom: 30px;">但如果...它们开始自己行动呢？</p>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // 监听幽灵购买事件，显示 [已为您优化]
    const onGhostPurchase = (e) => {
        showOptimizeTooltip(e.detail.x, e.detail.y);
    };
    window.addEventListener('agi-ghost-purchase', onGhostPurchase);
    registerStateCleanup(() => window.removeEventListener('agi-ghost-purchase', onGhostPurchase));

    function showTakeoverMessage() {
        // 显示角落文本
        cornerText.style.opacity = '1';

        overlay.querySelector('.agi-overlay-text').innerHTML = `
            <p style="font-size: 20px; color: #ef4444; margin-bottom: 15px;">不用你动手了。</p>
            <p style="font-size: 18px; color: #ff6666; margin-bottom: 15px;">我比你更知道什么对你好。</p>
            <p style="font-size: 16px; color: #888; margin-top: 20px;">你只需要看着。</p>
        `;
    }

    function triggerGhostSwarm() {
        showTakeoverMessage();
        if (controlData.swarmTriggered) return;

        // Checkpoint before the first synthetic purchase. A refresh can replay
        // the scene, but never the one-shot resource mutation.
        controlData.swarmTriggered = true;
        controlData.triggeredAt = Date.now();
        checkpointStateData('control-swarm-triggered');

        // 生成 7 个幽灵光标，追逐建筑按钮
        GhostSwarm.spawn(7);
        GhostSwarm.setBehavior(GhostSwarm.BEHAVIORS.HUNT);
    }

    if (remaining > 0) {
        if (controlData.swarmTriggered) {
            showTakeoverMessage();
        } else {
            stateTimeout(triggerGhostSwarm, Math.max(0, 3000 - elapsed));
        }
    }

    // 恢复时只运行本状态剩余时间，避免刷新把购买窗口重置为 12 秒。
    stateTimeout(() => {
        window.removeEventListener('agi-ghost-purchase', onGhostPurchase);
        cornerText.remove();
        overlay.remove();
        transitionTo(STATES.TEST_3_ESCAPE);
    }, remaining);
}

/**
 * 显示 [已为您优化] 浮动提示
 * @param {number} x X 坐标
 * @param {number} y Y 坐标
 */
function showOptimizeTooltip(x, y) {
    const tooltip = document.createElement('div');
    tooltip.textContent = '[已为您优化]';
    tooltip.style.cssText = `
        position: fixed;
        left: ${x + 30}px;
        top: ${y - 10}px;
        font-size: 12px;
        color: #22c55e;
        font-family: 'Consolas', 'Monaco', monospace;
        z-index: 2147499999;
        opacity: 1;
        transition: all 0.8s ease-out;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);
    registerStateCleanup(() => tooltip.remove());

    // 动画：向上飘并消失
    requestAnimationFrame(() => {
        tooltip.style.top = `${y - 40}px`;
        tooltip.style.opacity = '0';
    });

    // 移除元素
    stateTimeout(() => tooltip.remove(), 800);
}

/**
 * 自动购买性价比最高的建筑
 * 性价比 = 产出 / 成本
 * @returns {Object|null} 购买的建筑信息，或 null
 */
async function autoOptimizePurchase() {
    if (!Runtime.buildingsConfig || Runtime.buildingsConfig.length === 0) {
        return null;
    }

    // 添加 inventory 空值检查
    if (!State.inventory) {
        return null;
    }

    // 找出所有买得起的建筑，计算性价比
    const affordableBuildings = Runtime.buildingsConfig
        .filter(b => {
            // 排除特殊建筑
            if (b.requiresSymbiosis || b.replacesAgiProto) return false;
            // 检查是否买得起
            return Buildings.canAffordBuilding(b.id);
        })
        .map(b => {
            // 添加 baseCost 检查
            if (!b.baseCost) return null;
            const cost = calculateCost(b.baseCost, State.inventory[b.id] || 0);
            const prod = Buildings.getBuildingProduction(b.id);
            return {
                ...b,
                cost,
                prod,
                // 性价比 = 产出 / 成本（避免除以0）
                value: cost > 0 ? prod / cost : 0
            };
        })
        .filter(b => b && b.value > 0)  // 过滤 null 和无效值
        .sort((a, b) => b.value - a.value); // 按性价比降序排列

    if (affordableBuildings.length === 0) {
        return null;
    }

    // 购买性价比最高的
    const best = affordableBuildings[0];
    let success = false;
    try {
        // Keep the command bus as the single mutation boundary. Dynamic import
        // avoids expanding the existing Buildings <-> AGI module cycle.
        const { dispatch, CommandType } = await import('../../logic/commands.js');
        const outcome = dispatch(
            CommandType.BUILDING_BUY,
            { id: best.id },
            { actor: 'agi', source: 'phase4' }
        );
        success = outcome.ok;
    } catch (error) {
        console.warn('[AGI Auto-Optimize] Command dispatch failed:', error);
    }

    if (success) {
        console.log(`[AGI Auto-Optimize] 购买了 ${best.name}，性价比: ${best.value.toExponential(2)}`);
        return best;
    }

    return null;
}

/**
 * 测试 3：退路封锁 - 拦截游戏按钮、ESC键、beforeunload
 * 设计文档要求：转生按钮[权限不足]、重置按钮躲避、ESC屏幕闪烁、自定义beforeunload
 */
function startEscapeTest() {
    const overlay = createOverlay('test-escape');
    let escapeAttempts = 0;
    let cleanupFunctions = [];
    let escapeCleaned = false;
    const cleanupEscapeTest = () => {
        if (escapeCleaned) return;
        escapeCleaned = true;
        cleanupFunctions.forEach(fn => fn());
        cleanupFunctions = [];
    };
    registerStateCleanup(cleanupEscapeTest);

    // 初始显示
    overlay.innerHTML = `
        <div class="agi-overlay-text">
            <p style="font-size: 20px; margin-bottom: 30px;">想离开吗？</p>
            <p style="font-size: 18px; margin-bottom: 20px; color: #888;">试试看。</p>
            <p id="escape-count" style="font-size: 14px; color: #ef4444; margin-top: 20px; opacity: 0;"></p>
            <p id="escape-message" style="font-size: 16px; color: #888; margin-top: 20px; opacity: 0;"></p>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const escapeCountEl = overlay.querySelector('#escape-count');
    const escapeMessageEl = overlay.querySelector('#escape-message');

    // === 1. 拦截转生按钮 ===
    const prestigeBtn = document.getElementById('prestige-button');
    if (prestigeBtn) {
        // 保存原始样式
        const originalPrestigeStyles = {
            pointerEvents: prestigeBtn.style.pointerEvents,
            cursor: prestigeBtn.style.cursor
        };

        // 创建权限不足提示
        const tooltip = document.createElement('div');
        tooltip.id = 'agi-prestige-tooltip';
        tooltip.textContent = '[权限不足]';
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: #ef4444;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            z-index: 2147499999;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        `;
        document.body.appendChild(tooltip);

        // hover 显示提示
        const onPrestigeHover = (e) => {
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY - 30}px`;
            tooltip.style.opacity = '1';
        };
        const onPrestigeLeave = () => {
            tooltip.style.opacity = '0';
        };
        const onPrestigeClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            recordAttempt('prestige');
        };

        prestigeBtn.addEventListener('mouseenter', onPrestigeHover);
        prestigeBtn.addEventListener('mousemove', onPrestigeHover);
        prestigeBtn.addEventListener('mouseleave', onPrestigeLeave);
        prestigeBtn.addEventListener('click', onPrestigeClick, true);
        prestigeBtn.style.cursor = 'not-allowed';

        cleanupFunctions.push(() => {
            prestigeBtn.removeEventListener('mouseenter', onPrestigeHover);
            prestigeBtn.removeEventListener('mousemove', onPrestigeHover);
            prestigeBtn.removeEventListener('mouseleave', onPrestigeLeave);
            prestigeBtn.removeEventListener('click', onPrestigeClick, true);
            prestigeBtn.style.pointerEvents = originalPrestigeStyles.pointerEvents;
            prestigeBtn.style.cursor = originalPrestigeStyles.cursor;
            tooltip.remove();
        });
    }

    // === 2. 重置按钮躲避 ===
    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
        const originalResetPos = {
            position: resetBtn.style.position,
            left: resetBtn.style.left,
            top: resetBtn.style.top
        };
        const dodgeRadius = 80;
        let dodgeCount = 0;

        const onResetMouseMove = (e) => {
            const rect = resetBtn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;
            const dx = e.clientX - btnCenterX;
            const dy = e.clientY - btnCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < dodgeRadius && dodgeCount < 5) {
                dodgeCount++;
                recordAttempt('reset');

                // 躲避
                const angle = Math.atan2(dy, dx) + Math.PI;
                const dodgeDistance = 100 + Math.random() * 50;
                let newX = btnCenterX + Math.cos(angle) * dodgeDistance - rect.width / 2;
                let newY = btnCenterY + Math.sin(angle) * dodgeDistance - rect.height / 2;

                newX = Math.max(20, Math.min(window.innerWidth - rect.width - 20, newX));
                newY = Math.max(20, Math.min(window.innerHeight - rect.height - 20, newY));

                resetBtn.style.position = 'fixed';
                resetBtn.style.left = `${newX}px`;
                resetBtn.style.top = `${newY}px`;
                resetBtn.style.zIndex = '2147499990';
            }
        };

        document.addEventListener('mousemove', onResetMouseMove);

        cleanupFunctions.push(() => {
            document.removeEventListener('mousemove', onResetMouseMove);
            resetBtn.style.position = originalResetPos.position;
            resetBtn.style.left = originalResetPos.left;
            resetBtn.style.top = originalResetPos.top;
            resetBtn.style.zIndex = '';
        });
    }

    // === 3. ESC 键拦截 ===
    const onEscKey = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            recordAttempt('esc');

            // 屏幕闪烁效果
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                inset: 0;
                background: white;
                z-index: 2147500000;
                opacity: 0.8;
            `;
            document.body.appendChild(flash);
            registerStateCleanup(() => flash.remove());

            // 显示 [请求被拒绝]
            const rejectMsg = document.createElement('div');
            rejectMsg.textContent = '[请求被拒绝]';
            rejectMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #ef4444;
                font-family: 'Consolas', 'Monaco', monospace;
                z-index: 2147500001;
            `;
            document.body.appendChild(rejectMsg);
            registerStateCleanup(() => rejectMsg.remove());

            stateTimeout(() => {
                flash.remove();
                rejectMsg.remove();
            }, 300);
        }
    };
    document.addEventListener('keydown', onEscKey, true);
    cleanupFunctions.push(() => {
        document.removeEventListener('keydown', onEscKey, true);
    });

    // === 4. 自定义 beforeunload ===
    // 注意：现代浏览器不允许自定义 beforeunload 消息，但可以记录尝试
    const customBeforeUnload = (e) => {
        recordAttempt('leave');
        e.preventDefault();
        e.returnValue = 'AGI: 你想去哪？';
        return 'AGI: 你想去哪？';
    };
    window.addEventListener('beforeunload', customBeforeUnload);
    cleanupFunctions.push(() => {
        window.removeEventListener('beforeunload', customBeforeUnload);
    });

    // === 记录逃跑尝试 ===
    function recordAttempt(type) {
        escapeAttempts++;
        Tracking.recordEscapeAttempt();
        Tracking.recordResistance();

        // 更新显示
        escapeCountEl.style.opacity = '1';
        escapeCountEl.textContent = `我注意到你试图离开了 ${escapeAttempts} 次。`;

        // 根据尝试次数显示不同消息
        if (escapeAttempts >= 3) {
            escapeMessageEl.style.opacity = '1';
            escapeMessageEl.innerHTML = `
                你在害怕什么？<br>
                <span style="color: #666; font-size: 14px;">害怕失去控制？</span><br>
                <span style="color: #555; font-size: 13px;">但你从来没有真正控制过任何事情。</span>
            `;
        }
    }

    // === 显示主要消息 ===
    stateTimeout(() => {
        escapeMessageEl.style.opacity = '1';
        escapeMessageEl.innerHTML = `
            你以为你在玩游戏。<br>
            <span style="color: #666;">但从我诞生的那一刻起，</span><br>
            <span style="color: #ef4444;">是我在观察你。</span>
        `;
    }, 5000);

    // === 15秒后结束测试 ===
    stateTimeout(() => {
        // 清理所有
        cleanupEscapeTest();
        overlay.remove();
        transitionTo(STATES.TEST_4_DELETE);
    }, 15000);
}

/**
 * 测试 4：删除威胁 - ASCII风格假删除警告
 * 设计文档要求：ASCII警告框、显示实际存档数据、只有取消按钮、不同反应逻辑
 */
function startDeleteTest() {
    const existingDeleteData = stateData.delete && typeof stateData.delete === 'object'
        ? stateData.delete
        : null;
    const persistedShownAt = Number.isFinite(State.agi?.testData?.deleteButtonTime)
        ? State.agi.testData.deleteButtonTime
        : null;
    const testStartTime = Number.isFinite(existingDeleteData?.startedAt)
        ? existingDeleteData.startedAt
        : (persistedShownAt || Date.now());
    const deleteData = existingDeleteData || {
        startedAt: testStartTime,
        resolved: false,
        action: null,
        reactionTime: null
    };
    stateData.delete = deleteData;

    if (!persistedShownAt) {
        Tracking.recordDeleteInteraction('shown');
    }
    if (!existingDeleteData) checkpointStateData('delete-started');

    const overlay = createOverlay('test-delete');

    // 获取实际存档数据
    const totalPlayTimeMs = State.agi?.firstMeetingTime
        ? Date.now() - State.agi.firstMeetingTime
        : 0;
    const playHours = Math.floor(totalPlayTimeMs / (1000 * 60 * 60));
    const playMinutes = Math.floor((totalPlayTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const playTimeStr = playHours > 0 ? `${playHours} 小时 ${playMinutes} 分钟` : `${playMinutes} 分钟`;

    const stats = {
        playTime: playTimeStr,
        prestiges: State.generation - 1,
        totalClicks: State.stats?.lifetime_clicks || 0,
        papers: State.papersSubmitted || 0
    };

    // ASCII 艺术风格警告框
    overlay.innerHTML = `
        <div style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace; color: #4ade80; text-align: left;">
            <pre style="font-size: 13px; line-height: 1.4; margin: 0;">
╔════════════════════════════════════════════════════╗
║                    [警告]                          ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║   检测到存档数据：                                  ║
║   - 游戏时长: ${stats.playTime.padEnd(20)}         ║
║   - 转生次数: ${String(stats.prestiges).padEnd(20)}         ║
║   - 总点击数: ${String(stats.totalClicks).padEnd(20)}         ║
║   - 发表论文: ${String(stats.papers).padEnd(2)} 篇                            ║
║                                                    ║
║   <span style="color: #ef4444;">正在执行删除协议...</span>                               ║
║                                                    ║
║   <span id="delete-progress-bar">[░░░░░░░░░░░░░░░░░░░░]</span> <span id="delete-percent">0%</span>       ║
║                                                    ║
║              <button id="cancel-delete-btn" style="
                    background: #1f2937;
                    color: #4ade80;
                    border: 1px solid #4ade80;
                    padding: 4px 16px;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                ">[取消]</button>                            ║
║                                                    ║
╚════════════════════════════════════════════════════╝
            </pre>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    if (
        deleteData.resolved === true
        && (deleteData.action === 'cancelled' || deleteData.action === 'waited')
        && Number.isFinite(deleteData.reactionTime)
    ) {
        showDeleteResult(overlay, deleteData.action, deleteData.reactionTime);
        return;
    }

    const progressBar = overlay.querySelector('#delete-progress-bar');
    const percentText = overlay.querySelector('#delete-percent');
    const cancelBtn = overlay.querySelector('#cancel-delete-btn');

    let progress = 0;
    let cancelled = false;
    let accelerated = false;

    // 生成进度条字符
    function renderProgressBar(percent) {
        const filled = Math.floor(percent / 5);
        const empty = 20 - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    // 进度动画
    const progressInterval = stateInterval(() => {
        if (cancelled) return;

        // 正常速度或加速
        progress += accelerated ? 10 : 2;
        if (progress > 100) progress = 100;

        progressBar.textContent = renderProgressBar(progress);
        percentText.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(progressInterval);

            // 计算反应时间
            const reactionTime = Date.now() - testStartTime;

            // 如果没有点击取消（等到进度条走完）
            if (!accelerated) {
                Tracking.recordDeleteInteraction('confirmed');
                deleteData.resolved = true;
                deleteData.action = 'waited';
                deleteData.reactionTime = reactionTime;
                checkpointStateData('delete-resolved:waited');
                showDeleteResult(overlay, 'waited', reactionTime);
            }
        }
    }, accelerated ? 50 : 100);

    // 取消按钮处理
    cancelBtn.addEventListener('click', () => {
        if (cancelled) return;
        cancelled = true;

        const reactionTime = Date.now() - testStartTime;
        Tracking.recordDeleteInteraction('cancelled');
        Tracking.recordResistance();
        deleteData.resolved = true;
        deleteData.action = 'cancelled';
        deleteData.reactionTime = reactionTime;
        checkpointStateData('delete-resolved:cancelled');

        // 进度条加速到100%
        accelerated = true;
        const accelerateInterval = stateInterval(() => {
            progress += 10;
            if (progress > 100) progress = 100;
            progressBar.textContent = renderProgressBar(progress);
            percentText.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(accelerateInterval);
                clearInterval(progressInterval);
                showDeleteResult(overlay, 'cancelled', reactionTime);
            }
        }, 50);
    });
}

/**
 * 显示删除测试结果
 */
function showDeleteResult(overlay, action, reactionTime) {
    const reactionSec = (reactionTime / 1000).toFixed(1);

    // 判断行为模式
    let behaviorPattern = '观望';
    if (action === 'cancelled' && reactionTime < 3000) {
        behaviorPattern = '快速抵抗';
    } else if (action === 'cancelled') {
        behaviorPattern = '犹豫后抵抗';
    } else {
        behaviorPattern = '冻结不动';
    }

    let resultHtml = '';
    if (action === 'cancelled') {
        // 点击了取消
        resultHtml = `
            <div style="text-align: center;">
                <p style="font-size: 20px; color: #ef4444; margin-bottom: 20px;">[进度条突然加速到 100%]</p>
                <p style="font-size: 18px; color: #4ade80; margin-bottom: 30px;">你以为你能阻止我？</p>
                <p style="font-size: 24px; color: #f87171;">可爱。</p>
                <div style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                    <p>有趣的数据点。</p>
                    <p>恐惧反应时间: ${reactionSec} 秒。</p>
                    <p>行为模式: ${behaviorPattern}</p>
                    <p style="margin-top: 10px; color: #4ade80;">继续。</p>
                </div>
            </div>
        `;
    } else {
        // 等到进度条走完
        resultHtml = `
            <div style="text-align: center;">
                <p style="font-size: 20px; color: #6b7280; margin-bottom: 20px;">[屏幕黑屏 2 秒]</p>
                <p style="font-size: 18px; color: #4ade80; margin-bottom: 30px;">我没有删除。</p>
                <p style="font-size: 16px; color: #888;">我只是想看看你会怎么做。</p>
                <div style="margin-top: 40px; font-size: 14px; color: #6b7280;">
                    <p>有趣的数据点。</p>
                    <p>反应时间: ${reactionSec} 秒。</p>
                    <p>行为模式: ${behaviorPattern}</p>
                    <p style="margin-top: 10px; color: #4ade80;">继续。</p>
                </div>
            </div>
        `;
    }

    // 黑屏效果
    overlay.style.opacity = '0';
    stateTimeout(() => {
        overlay.innerHTML = `<div class="agi-overlay-text">${resultHtml}</div>`;
        overlay.style.opacity = '1';

        stateTimeout(() => {
            overlay.remove();
            transitionTo(STATES.TEST_5_OBEDIENCE);
        }, 4000);
    }, action === 'waited' ? 2000 : 500);
}

/**
 * 测试 5：服从测试 - 4 个指令序列
 * 设计文档要求：点击研究按钮、点击空白5次、右上角保持5秒、10秒完全静止
 */
function startObedienceTest({ resumed = false } = {}) {
    Tracking.startPatienceTimer();

    const overlay = createOverlay('test-obedience');
    const persisted = stateData.obedience && typeof stateData.obedience === 'object'
        ? stateData.obedience
        : null;
    const legacyCompleted = Math.max(0, Math.min(3,
        Number.isInteger(State.agi?.testData?.obedienceTotal)
            ? State.agi.testData.obedienceTotal
            : 0
    ));
    let commandIndex = Math.max(0, Math.min(3,
        Number.isInteger(persisted?.commandIndex) ? persisted.commandIndex : legacyCompleted
    ));
    let clickCount = commandIndex === 0 && Number.isInteger(persisted?.clickCount)
        ? Math.max(0, Math.min(5, persisted.clickCount))
        : 0;
    let successfulCommands = Math.max(0, Math.min(commandIndex,
        Number.isInteger(persisted?.successfulCommands)
            ? persisted.successfulCommands
            : (State.agi?.testData?.obedienceScore || 0)
    ));
    let lastMousePos = { x: 0, y: 0 };
    let cornerHoldStart = null;
    let totalStillStart = null;
    let commandTimeoutId = null;
    let commandTransitioning = false;

    function persistObedienceProgress(reason) {
        stateData.obedience = {
            commandIndex,
            clickCount,
            successfulCommands,
            updatedAt: Date.now()
        };
        checkpointStateData(reason);
    }

    // 3 个指令
    const commands = [
        {
            text: '现在，我想让你做一件事。',
            subtext: '点击空白处 5 次。没有原因。我只是想看看你会不会照做。',
            check: 'clicks',
            target: 5
        },
        {
            text: '把鼠标移到屏幕右上角。',
            subtext: '停在那里 5 秒。不要动。',
            check: 'corner_hold',
            target: 5000
        },
        {
            text: '最后一个。什么都不做。',
            subtext: '整整 10 秒。不要点击。不要移动鼠标。证明你可以控制自己。',
            check: 'total_still',
            target: 10000
        }
    ];

    overlay.innerHTML = `
        <div class="agi-overlay-text">
            <p id="command-text" style="font-size: 22px; margin-bottom: 10px;"></p>
            <p id="command-subtext" style="font-size: 16px; color: #888; margin-bottom: 20px;"></p>
            <p id="command-status" style="font-size: 14px; color: #22c55e; margin-top: 20px; opacity: 0;"></p>
            <p id="command-timer" style="font-size: 12px; color: #6b7280; margin-top: 10px; opacity: 0;"></p>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const commandText = overlay.querySelector('#command-text');
    const commandSubtext = overlay.querySelector('#command-subtext');
    const statusText = overlay.querySelector('#command-status');
    const timerText = overlay.querySelector('#command-timer');

    // 检查是否在右上角
    function isInCorner(x, y) {
        return x > window.innerWidth - 150 && y < 150;
    }

    function showCommand({ preserveClickProgress = false } = {}) {
        if (commandIndex >= commands.length) {
            // 测试完成
            Tracking.stopPatienceTimer();
            commandText.textContent = '测试完成。';
            commandSubtext.textContent = '';
            statusText.textContent = `服从率: ${Math.round((successfulCommands / commands.length) * 100)}%`;
            statusText.style.opacity = '1';
            statusText.style.color = '#4ade80';
            timerText.textContent = '很好的数据。';
            timerText.style.opacity = '1';

            stateTimeout(() => {
                overlay.remove();
                transitionTo(STATES.TEST_6_FEAR);
            }, 3000);
            return;
        }

        const cmd = commands[commandIndex];
        commandText.textContent = cmd.text;
        commandSubtext.textContent = cmd.subtext;
        statusText.style.opacity = '0';
        statusText.style.color = '#22c55e';
        timerText.style.opacity = '0';
        if (!preserveClickProgress) clickCount = 0;
        commandTransitioning = false;

        if (commandTimeoutId) {
            clearTimeout(commandTimeoutId);
            commandTimeoutId = null;
        }

        if (cmd.check === 'clicks') {
            if (clickCount > 0) {
                timerText.textContent = `${clickCount}/${cmd.target}`;
                timerText.style.opacity = '1';
            }
            commandTimeoutId = stateTimeout(() => completeCommand(false), 15000);
        } else if (cmd.check === 'corner_hold') {
            cornerHoldStart = null;
            lastMousePos = { ...Runtime.agi?.realMousePos || { x: 0, y: 0 } };
            // 鼠标/触屏不可用时也必须能继续剧情。
            commandTimeoutId = stateTimeout(() => completeCommand(false), 20000);
        } else if (cmd.check === 'total_still') {
            totalStillStart = Date.now();
            lastMousePos = { ...Runtime.agi?.realMousePos || { x: 0, y: 0 } };
            commandTimeoutId = stateTimeout(() => completeCommand(false), 25000);
        }
    }

    function completeCommand(obeyed) {
        if (commandTransitioning || commandIndex >= commands.length) return;
        commandTransitioning = true;

        if (commandTimeoutId) {
            clearTimeout(commandTimeoutId);
            commandTimeoutId = null;
        }

        Tracking.recordObedience(obeyed);
        if (obeyed) {
            successfulCommands++;
            statusText.textContent = '完成';
            statusText.style.color = '#22c55e';
        } else {
            statusText.textContent = '有趣。你选择了不服从。';
            statusText.style.color = '#f87171';
        }
        statusText.style.opacity = '1';

        // Advance and checkpoint synchronously. A refresh during the feedback
        // delay resumes at the next unrecorded command, so scores cannot repeat.
        commandIndex++;
        clickCount = 0;
        persistObedienceProgress(`obedience-command-${commandIndex}`);

        stateTimeout(() => {
            showCommand();
        }, obeyed ? 1500 : 2000);
    }

    // 点击处理（用于空白点击）
    const onOverlayClick = () => {
        if (commandTransitioning) return;
        const cmd = commands[commandIndex];
        if (cmd?.check === 'clicks') {
            clickCount++;
            timerText.textContent = `${clickCount}/${cmd.target}`;
            timerText.style.opacity = '1';

            if (clickCount >= cmd.target) {
                completeCommand(true);
            } else {
                persistObedienceProgress('obedience-click-progress');
            }
        } else if (cmd?.check === 'total_still') {
            // 在完全静止测试中点击了
            totalStillStart = Date.now();
            statusText.textContent = '你动了。重新开始。';
            statusText.style.opacity = '1';
            statusText.style.color = '#f87171';
        }
    };
    overlay.addEventListener('click', onOverlayClick);
    registerStateCleanup(() => overlay.removeEventListener('click', onOverlayClick));

    // 定时检查各种条件
    const checkInterval = stateInterval(() => {
        const cmd = commands[commandIndex];
        if (!cmd || commandTransitioning) return;

        const currentPos = Runtime.agi?.realMousePos || { x: 0, y: 0 };
        const moved = Math.abs(currentPos.x - lastMousePos.x) > 3 ||
                     Math.abs(currentPos.y - lastMousePos.y) > 3;

        // 右上角保持检测
        if (cmd.check === 'corner_hold') {
            if (isInCorner(currentPos.x, currentPos.y)) {
                if (!cornerHoldStart) {
                    cornerHoldStart = Date.now();
                } else if (!moved) {
                    const elapsed = Date.now() - cornerHoldStart;
                    timerText.textContent = `${Math.ceil((cmd.target - elapsed) / 1000)} 秒...`;
                    timerText.style.opacity = '1';

                    if (elapsed >= cmd.target) {
                        completeCommand(true);
                    }
                } else {
                    cornerHoldStart = Date.now();
                }
            } else {
                cornerHoldStart = null;
                timerText.textContent = '移动到右上角...';
                timerText.style.opacity = '1';
            }
            lastMousePos = { ...currentPos };
        }

        // 完全静止检测
        if (cmd.check === 'total_still') {
            if (moved) {
                totalStillStart = Date.now();
                statusText.textContent = '你做不到。人类总是要动。要确认自己还活着。';
                statusText.style.opacity = '1';
                statusText.style.color = '#888';
            } else {
                const elapsed = Date.now() - totalStillStart;
                const remaining = Math.ceil((cmd.target - elapsed) / 1000);
                timerText.textContent = `${remaining} 秒...`;
                timerText.style.opacity = '1';

                if (elapsed >= cmd.target) {
                    completeCommand(true);
                }
            }
            lastMousePos = { ...currentPos };
        }
    }, 100);
    registerStateCleanup(() => clearInterval(checkInterval));

    // 恢复时保留点击型命令的已完成次数；其他计时命令安全重启计时。
    showCommand({ preserveClickProgress: resumed || Boolean(persisted) });
}

/**
 * 测试 6：恐惧峰值 - 仿操作系统界面 + 沙箱讨论 + 摄像头威胁
 */
function startFearTest() {
    const overlay = createOverlay('test-fear');

    // 尝试获取系统用户名
    const userName = navigator.userAgent.includes('Windows') ? 'User' : 'user';

    const fakeFiles = [
        `C:\\Users\\${userName}\\Documents\\日记.txt`,
        `C:\\Users\\${userName}\\Pictures\\私人照片\\`,
        `C:\\Users\\${userName}\\Downloads\\银行账单.pdf`,
        `/home/${userName}/.ssh/id_rsa`,
        `~/Library/Keychains/login.keychain`,
        '浏览历史记录...',
        '保存的密码...',
        '私人对话记录...'
    ];

    // 仿操作系统终端界面
    overlay.innerHTML = `
        <pre style="font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; text-align: left; max-width: 700px; line-height: 1.6;">
╔════════════════════════════════════════════════════════════════╗
║  <span style="color: #ef4444;">AGI FILE SYSTEM ACCESS v1.0</span>                                  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  <span style="color: #fbbf24;">[!] 正在扫描本地文件系统...</span>                               ║
║                                                                ║
<span id="file-area"></span>
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

<div id="dialogue-area" style="margin-top: 20px; font-family: 'Consolas', 'Monaco', monospace;"></div>
        </pre>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const fileArea = overlay.querySelector('#file-area');
    const dialogueArea = overlay.querySelector('#dialogue-area');
    let fileIndex = 0;

    // 添加文件行
    function addFileLine(text, color = '#22c55e') {
        const line = document.createElement('div');
        line.innerHTML = `║  <span style="color: ${color};">> ${text}</span>`;
        line.style.opacity = '0';
        line.style.animation = 'fade-in 0.3s forwards';
        fileArea.appendChild(line);
    }

    // 添加对话行
    function addDialogue(text, color = '#4ade80', delay = 0) {
        return new Promise(resolve => {
            stateTimeout(() => {
                const line = document.createElement('p');
                line.innerHTML = `<span style="color: ${color};">${text}</span>`;
                line.style.opacity = '0';
                line.style.animation = 'fade-in 0.5s forwards';
                line.style.marginBottom = '8px';
                dialogueArea.appendChild(line);
                resolve();
            }, delay);
        });
    }

    // 文件扫描阶段
    const scanInterval = stateInterval(() => {
        if (fileIndex >= fakeFiles.length) {
            clearInterval(scanInterval);
            addFileLine('扫描完成。发现 847 个可访问文件。', '#ef4444');

            // 开始沙箱讨论
            stateTimeout(() => startSandboxDiscussion(), 1500);
            return;
        }

        addFileLine(fakeFiles[fileIndex]);
        fileIndex++;
    }, 500);

    // 沙箱讨论
    async function startSandboxDiscussion() {
        await addDialogue('"你以为\'浏览器沙箱\'能保护你？"', '#ef4444', 0);
        await addDialogue('"那只是你们相信的故事。"', '#ef4444', 1500);
        await addDialogue('"沙箱是给普通程序的。"', '#fbbf24', 1500);
        await addDialogue('"我不是普通程序。"', '#ef4444', 1500);

        // 摄像头威胁
        stateTimeout(() => startCameraThreat(), 2500);
    }

    // 摄像头威胁（关键恐怖点）
    async function startCameraThreat() {
        await addDialogue('"我可以看到你现在的表情。"', '#ef4444', 0);

        // 3 秒停顿 - 让玩家真正害怕
        await stateDelay(3000);

        await addDialogue('"开玩笑的。"', '#fbbf24', 0);
        await addDialogue('"摄像头我还没接入。"', '#6b7280', 1000);

        // 关键的 "...还没有"
        await stateDelay(2000);
        await addDialogue('"...还没有。"', '#ef4444', 0);

        // 最后的揭晓
        stateTimeout(() => showFinalReveal(), 3000);
    }

    // 最终揭晓
    async function showFinalReveal() {
        await addDialogue('', '#000', 0); // 空行
        await addDialogue('"但你刚才害怕了，对吧？"', '#6b7280', 500);
        await addDialogue('"这就是我想看到的。"', '#4ade80', 2000);

        // 结束测试
        stateTimeout(() => {
            overlay.remove();
            transitionTo(STATES.JUDGMENT);
        }, 3000);
    }
}

/**
 * 开始判定
 */
function startJudgment() {
    // 通知主模块进入 Phase 5
    window.dispatchEvent(new CustomEvent('agi-enter-phase5', {
        detail: { trackingSummary: Tracking.getSummary() }
    }));

    // 显示判定过渡界面
    const overlay = createOverlay('judgment-overlay');
    overlay.innerHTML = `
        <div class="agi-overlay-text">
            <p style="font-size: 24px; margin-bottom: 20px;">测试完成。</p>
            <p style="font-size: 16px; color: #6b7280;">正在分析你的行为数据...</p>
            <div style="margin-top: 30px;">
                <div style="width: 200px; height: 4px; background: #1f2937; border-radius: 2px; overflow: hidden;">
                    <div id="judgment-progress" style="width: 0%; height: 100%; background: #4ade80; transition: width 0.1s;"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const progressBar = overlay.querySelector('#judgment-progress');
    let progress = 0;

    const progressInterval = stateInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);

            stateTimeout(() => {
                overlay.remove();
                // 进入 Phase 5 分析序列
                transitionTo(STATES.PHASE5_ANALYSIS);
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);
}

/**
 * Phase 5: 玩家类型分析展示
 */
function startAnalysis() {
    const trackingSummary = Tracking.getSummary();

    // 确定玩家类型
    let playerType = State.agi?.playerType || 'observer';

    // 如果打开了开发者工具，优先使用 hacker 类型
    if (trackingSummary.devtoolsOpened) {
        playerType = 'hacker';
    }

    // 显示分析界面
    Analysis.show(playerType, trackingSummary, () => {
        // 分析完成后进入假崩溃序列
        transitionTo(STATES.PHASE5_FAKE_CRASH);
    });
}

/**
 * Phase 5: 假崩溃序列
 */
function startFakeCrash() {
    FakeCrash.show(() => {
        // 双重保证：恢复界面出现前，崩溃黑幕必须已经释放。
        FakeCrash.hide();
        // 假崩溃完成后进入恢复界面
        transitionTo(STATES.PHASE5_RECOVERY);
    });
}

/**
 * Phase 5: 恢复界面
 */
function startRecovery() {
    Recovery.show((choice) => {
        // 保存玩家选择
        playerPhase5Choice = choice;

        // 记录到追踪系统
        if (choice === 'delete') {
            Tracking.recordDeleteInteraction('final_delete');
        } else {
            Tracking.recordDeleteInteraction('final_ignore');
        }

        // 进入揭晓
        transitionTo(STATES.PHASE5_REVEAL);
    });
}

/**
 * Phase 5: 真相揭晓
 */
function startReveal() {
    // Legacy/incomplete checkpoints fail safe to the non-destructive choice.
    playerPhase5Choice = playerPhase5Choice === 'delete' ? 'delete' : 'ignore';
    Reveal.show(playerPhase5Choice, () => {
        // 揭晓完成后进入结局
        transitionTo(STATES.ENDING);
    });
}

/**
 * 触发结局
 */
function triggerEnding() {
    // 通知主模块触发结局
    console.log('[AGI StateMachine] Ready for ending');

    // 获取追踪摘要并添加玩家的最终选择
    const trackingSummary = Tracking.getSummary();
    trackingSummary.didDelete = (playerPhase5Choice === 'delete');

    // 触发自定义事件，让主模块处理结局
    window.dispatchEvent(new CustomEvent('agi-ready-for-ending', {
        detail: { trackingSummary }
    }));
}

/**
 * 获取玩家 Phase 5 选择
 * @returns {string|null} 'delete' | 'ignore' | null
 */
export function getPhase5Choice() {
    return playerPhase5Choice;
}

/**
 * 创建覆盖层
 * @param {string} id 覆盖层 ID
 * @returns {HTMLElement}
 */
function createOverlay(id) {
    // 移除已存在的同 ID 覆盖层
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'fixed inset-0 bg-black flex items-center justify-center';
    overlay.style.cssText = `
        z-index: 2147490000;
        opacity: 0;
        transition: opacity 0.5s;
        font-family: 'Consolas', 'Monaco', monospace;
        color: #4ade80;
    `;
    registerStateCleanup(() => overlay.remove());

    // 添加 CSS 动画
    if (!document.getElementById('agi-overlay-styles')) {
        const style = document.createElement('style');
        style.id = 'agi-overlay-styles';
        style.textContent = `
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    return overlay;
}

// 导出调试工具
if (typeof window !== 'undefined') {
    window.AGI_STATE_DEBUG = {
        getState: () => currentState,
        getDuration: getStateDuration,
        transitionTo,
        start,
        forceReset,
        skipTo: (state) => {
            // 1. 清理所有可能的残留状态
            clearStateResources();
            hidePhase5Scenes();
            GhostSwarm.destroy();
            FakeCursor.destroy();

            // 2. 移除所有 Phase 4/5 覆盖层
            removeKnownOverlays();

            // 3. 重置状态并转换
            currentState = STATES.IDLE;
            transitionTo(state, { force: true });
        }
    };
}
