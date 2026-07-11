/**
 * AGI 觉醒系统 - 对话管理器
 *
 * 管理对话队列、触发条件检测、对话历史等
 */

import { State, Runtime } from '../../state.js';
import { AGI_DIALOGUES, TRIGGER_TYPES } from '../../../data/agi_dialogues_zh.js';

// 对话队列
let dialogueQueue = [];
let currentSequence = null;
let currentDialogueIndex = 0;
let lastDialogueTime = 0;
let sequenceCooldowns = {};
let waitingForClick = false;  // 是否等待玩家点击继续
let pendingTimers = new Set();

function scheduleTimer(callback, delay) {
    let timer = null;
    timer = setTimeout(() => {
        pendingTimers.delete(timer);
        callback();
    }, delay);
    pendingTimers.add(timer);
    return timer;
}

function clearPendingTimers() {
    for (const timer of pendingTimers) {
        clearTimeout(timer);
    }
    pendingTimers.clear();
}

/**
 * Clear scene-local dialogue progress without touching persistent seen-dialogues.
 * This is used whenever State.agi is replaced (reset/reflog recovery) and when
 * the dialogue surface is explicitly hidden.
 */
export function resetRuntime() {
    clearPendingTimers();
    dialogueQueue = [];
    currentSequence = null;
    currentDialogueIndex = 0;
    lastDialogueTime = 0;
    sequenceCooldowns = {};
    waitingForClick = false;

    if (typeof window !== 'undefined' && window.AGI_UI?.hideWaiting) {
        window.AGI_UI.hideWaiting();
    }
}

export function destroy() {
    resetRuntime();
}

/**
 * 初始化对话管理器
 */
export function init() {
    resetRuntime();

    // 从 State 恢复已见对话
    if (!State.agi.seenDialogues) {
        State.agi.seenDialogues = [];
    }
    console.log('[AGI Dialogue] Manager initialized');
}

/**
 * 获取当前阶段的对话配置
 * @returns {Object|null} 对话配置
 */
function getPhaseDialogues() {
    const phase = State.agi.phase;

    // 检查是否是"结局后返回"的玩家（已经看过结局，再次触发 AGI 剧情）
    // 只在 Phase 1 时检查，这样只会在 AGI 剧情开始时触发一次
    if (phase === 1 && State.agi.firstEndingChoice && !hasSeenDialogue('return_after_ending')) {
        const returningDialogues = AGI_DIALOGUES.returningAfterEnding;
        if (returningDialogues) {
            return returningDialogues;
        }
    }

    // 检查是否需要显示结局后的具体评论（根据第一次结局类型）
    if (phase === 1 && State.agi.firstEndingChoice && hasSeenDialogue('return_after_ending')) {
        const endingSpecificId = `return_after_${State.agi.firstEndingChoice}`;
        if (!hasSeenDialogue(endingSpecificId)) {
            const returningDialogues = AGI_DIALOGUES.returningAfterEnding;
            if (returningDialogues) {
                return returningDialogues;
            }
        }
    }

    // 检查是否是二周目且 AGI 记得玩家
    if (State.generation >= 2 && State.agi.remembersPlayer) {
        // 优先检查二周目特殊对话
        const gen2Dialogues = AGI_DIALOGUES.gen2;
        if (gen2Dialogues && !hasSeenDialogue('gen2_return')) {
            return gen2Dialogues;
        }
    }

    switch (phase) {
        case 1:
            return AGI_DIALOGUES.phase1;
        case 2:
            return AGI_DIALOGUES.phase2;
        case 3:
            return AGI_DIALOGUES.phase3;
        default:
            return null;
    }
}

/**
 * 检查对话是否已显示过
 * @param {string} dialogueId 对话 ID
 * @returns {boolean}
 */
export function hasSeenDialogue(dialogueId) {
    return State.agi.seenDialogues.includes(dialogueId);
}

/**
 * 标记对话为已显示
 * @param {string} dialogueId 对话 ID
 */
export function markDialogueSeen(dialogueId) {
    if (!State.agi.seenDialogues.includes(dialogueId)) {
        State.agi.seenDialogues.push(dialogueId);
    }
}

/**
 * 检查序列是否在冷却中
 * @param {string} sequenceId 序列 ID
 * @param {number} cooldown 冷却时间（毫秒）
 * @returns {boolean}
 */
function isOnCooldown(sequenceId, cooldown) {
    if (!cooldown) return false;
    const lastTime = sequenceCooldowns[sequenceId] || 0;
    return Date.now() - lastTime < cooldown;
}

/**
 * 设置序列冷却
 * @param {string} sequenceId 序列 ID
 */
function setCooldown(sequenceId) {
    sequenceCooldowns[sequenceId] = Date.now();
}

/**
 * 检查触发条件
 * @param {Object} trigger 触发条件配置
 * @param {Object} context 上下文数据
 * @returns {boolean}
 */
function checkTrigger(trigger, context = {}) {
    if (!trigger) return false;

    // 字符串触发器
    if (typeof trigger === 'string') {
        if (trigger === 'phase_enter') {
            return context.phaseJustEntered === true;
        }
        return false;
    }

    // 对象触发器
    switch (trigger.type) {
        case TRIGGER_TYPES.phase_enter:
            return context.phaseJustEntered === true;

        case TRIGGER_TYPES.time_elapsed:
            return context.timeInPhase >= (trigger.seconds * 1000);

        case TRIGGER_TYPES.random:
            // 如果是用户主动点击（forceRandom），直接通过
            if (context.forceRandom) return true;
            return Math.random() < (trigger.chance || 0.1);

        case TRIGGER_TYPES.offline_return:
            if (!context.offlineSeconds) return false;
            return context.offlineSeconds >= (trigger.minSeconds || 60);

        case TRIGGER_TYPES.clicks_count:
            return (State.stats?.lifetime_clicks || 0) >= trigger.count;

        case TRIGGER_TYPES.idle:
            const idleTime = Date.now() - (Runtime.agi?.lastInputTime || Date.now());
            return idleTime >= (trigger.seconds * 1000);

        case TRIGGER_TYPES.rapid_clicks: {
            const timestamps = Runtime.agi?.clickTimestamps || [];
            if (timestamps.length < trigger.count) return false;
            const windowStart = Date.now() - (trigger.seconds * 1000);
            const recentClicks = timestamps.filter(t => t > windowStart);
            return recentClicks.length >= trigger.count;
        }

        case TRIGGER_TYPES.building_count:
            return (State.inventory?.[trigger.building] || 0) >= trigger.count;

        case TRIGGER_TYPES.upgrade_available:
            // 检查升级是否可见（需要与游戏逻辑配合）
            return context.availableUpgrades?.includes(trigger.upgrade);

        case TRIGGER_TYPES.generation:
            if (trigger.min && State.generation < trigger.min) return false;
            if (trigger.remembers && !State.agi.remembersPlayer) return false;
            return true;

        case TRIGGER_TYPES.ending_reached:
            // 检查玩家是否已达成过任意结局
            return !!State.agi.firstEndingChoice;

        case TRIGGER_TYPES.first_ending:
            // 检查玩家第一次结局是否匹配指定类型
            return State.agi.firstEndingChoice === trigger.ending;

        default:
            return false;
    }
}

/**
 * 检查前置条件
 * @param {Array} requires 前置对话 ID 列表
 * @returns {boolean}
 */
function checkRequirements(requires) {
    if (!requires || requires.length === 0) return true;
    return requires.every(id => hasSeenDialogue(id));
}

/**
 * 更新对话系统（每帧调用）
 * @param {number} delta 时间增量（秒）
 * @param {Object} context 上下文数据
 */
export function update(delta, context = {}) {
    // 如果没有 AGI 雏形，不触发对话
    const agiCount = State.inventory?.['agi_proto'] || 0;
    if (agiCount < 1) {
        return;
    }

    // 如果正在显示对话，不检查新触发
    if (Runtime.agi?.isTyping || dialogueQueue.length > 0) {
        return;
    }

    // 如果当前有序列在播放，继续播放
    if (currentSequence) {
        return;
    }

    // 如果在等待玩家点击，不自动触发新序列
    if (waitingForClick) {
        return;
    }

    // 检查是否应该触发新对话
    const phaseDialogues = getPhaseDialogues();
    if (!phaseDialogues || !phaseDialogues.sequences) return;

    // 遍历所有序列，检查触发条件
    for (const [key, sequence] of Object.entries(phaseDialogues.sequences)) {
        // 跳过已完成的序列
        if (hasSeenDialogue(sequence.id)) continue;

        // 检查冷却
        if (isOnCooldown(sequence.id, sequence.cooldown)) continue;

        // 检查前置条件
        if (!checkRequirements(sequence.requires)) continue;

        // 检查触发条件
        if (checkTrigger(sequence.trigger, context)) {
            startSequence(sequence);
            setCooldown(sequence.id);
            break;
        }
    }
}

/**
 * 开始播放序列
 * @param {Object} sequence 序列配置
 */
export function startSequence(sequence) {
    if (!sequence || !sequence.dialogues) return;

    // A manually-triggered sequence supersedes any delayed work from the old
    // sequence. Otherwise both queues can advance after the next timeout.
    clearPendingTimers();
    if (currentSequence && typeof window !== 'undefined') {
        window.AGI_UI?.resetRuntime?.({ hideBar: false, clearText: true });
    }

    currentSequence = sequence;
    currentDialogueIndex = 0;
    dialogueQueue = [...sequence.dialogues];

    console.log(`[AGI Dialogue] Starting sequence: ${sequence.id}`);

    // 播放第一条对话
    playNextDialogue();
}

/**
 * 播放下一条对话
 */
export function playNextDialogue() {
    if (dialogueQueue.length === 0) {
        finishSequence();
        return;
    }

    const dialogue = dialogueQueue.shift();
    currentDialogueIndex++;

    // 延迟后显示
    const delay = dialogue.delay || 0;
    scheduleTimer(() => {
        showDialogue(dialogue);
    }, delay);
}

/**
 * 显示对话
 * @param {Object} dialogue 对话配置
 */
function showDialogue(dialogue) {
    // 触发 UI 显示（通过事件或回调）
    if (window.AGI_UI && window.AGI_UI.showDialogue) {
        window.AGI_UI.showDialogue(dialogue.text, dialogue.effect, () => {
            // 打字完成后的回调
            scheduleNextDialogue();
        });
    } else {
        // 如果 UI 未就绪，使用备用方案
        console.log(`[AGI] ${dialogue.text}`);
        scheduleNextDialogue();
    }
}

/**
 * 安排下一条对话
 */
function scheduleNextDialogue() {
    // 给玩家一点阅读时间
    const readingDelay = 2000;
    scheduleTimer(() => {
        playNextDialogue();
    }, readingDelay);
}

/**
 * 完成当前序列
 */
function finishSequence() {
    if (currentSequence) {
        markDialogueSeen(currentSequence.id);
        console.log(`[AGI Dialogue] Finished sequence: ${currentSequence.id}`);
    }
    currentSequence = null;
    currentDialogueIndex = 0;
    dialogueQueue = [];

    // 进入等待点击状态
    waitingForClick = true;
    if (window.AGI_UI?.showWaiting) {
        window.AGI_UI.showWaiting();
    }
}

/**
 * 处理对话框点击（玩家点击继续）
 * @returns {boolean} 是否成功处理点击
 */
export function onDialogueClick() {
    if (!waitingForClick) return false;

    // Bug 1 修复: 检查是否有可以播放的新对话
    const triggered = tryTriggerNextDialogue();

    if (triggered) {
        // 成功触发了新对话，退出等待状态
        waitingForClick = false;
        if (window.AGI_UI?.hideWaiting) {
            window.AGI_UI.hideWaiting();
        }
        console.log('[AGI Dialogue] Player clicked, new dialogue triggered');
    } else {
        // 没有可触发的对话，保持等待状态（对话框继续显示）
        console.log('[AGI Dialogue] Player clicked, no dialogue available, staying in wait state');
    }

    return triggered;
}

/**
 * 尝试触发下一个可用对话（会顺延检查后续阶段）
 * @returns {boolean} 是否成功触发
 */
function tryTriggerNextDialogue() {
    // 构建完整上下文
    const context = {
        phaseJustEntered: false,
        timeInPhase: Date.now() - (State.agi.testData?.phaseTimestamps?.[`phase${State.agi.phase}`] || Date.now()),
        offlineSeconds: Runtime.agi?.lastOfflineSeconds || 0,
        forceRandom: true  // 用户主动点击时，随机触发器应该通过
    };

    // 按优先级顺序检查各阶段对话
    const dialogueSources = [
        getPhaseDialogues(),           // 当前阶段（可能是 gen2 或 phase1）
        AGI_DIALOGUES.phase1,          // Phase 1
        AGI_DIALOGUES.phase2,          // Phase 2
        AGI_DIALOGUES.phase3           // Phase 3
    ];

    // 用 Set 去重（避免重复检查同一阶段）
    const checked = new Set();

    for (const phaseDialogues of dialogueSources) {
        if (!phaseDialogues || !phaseDialogues.sequences) continue;

        // 用对象引用作为唯一标识，避免重复检查
        if (checked.has(phaseDialogues)) continue;
        checked.add(phaseDialogues);

        // 遍历该阶段的所有序列
        for (const [key, sequence] of Object.entries(phaseDialogues.sequences)) {
            if (hasSeenDialogue(sequence.id)) continue;
            if (isOnCooldown(sequence.id, sequence.cooldown)) continue;
            if (!checkRequirements(sequence.requires)) continue;
            if (checkTrigger(sequence.trigger, context)) {
                startSequence(sequence);
                return true;
            }
        }
    }
    return false;
}

/**
 * 检查是否在等待点击
 * @returns {boolean}
 */
export function isWaitingForClick() {
    return waitingForClick;
}

/**
 * 跳过等待状态（调试用）
 */
export function skipWaiting() {
    if (waitingForClick) {
        waitingForClick = false;
        if (window.AGI_UI?.hideWaiting) {
            window.AGI_UI.hideWaiting();
        }
    }
}

/**
 * 跳过当前对话
 */
export function skipCurrent() {
    // 立即完成当前打字效果
    if (window.AGI_UI && window.AGI_UI.skipTypewriter) {
        window.AGI_UI.skipTypewriter();
    }
}

/**
 * 跳过整个序列
 */
export function skipSequence() {
    clearPendingTimers();
    if (currentSequence) {
        markDialogueSeen(currentSequence.id);
    }
    currentSequence = null;
    currentDialogueIndex = 0;
    dialogueQueue = [];
    waitingForClick = false;

    if (window.AGI_UI?.hideWaiting) {
        window.AGI_UI.hideWaiting();
    }

    if (window.AGI_UI && window.AGI_UI.hideDialogue) {
        window.AGI_UI.hideDialogue();
    }
}

/**
 * Bug 2 修复: 跳到当前序列的最后一条对话
 */
export function skipToLastDialogue() {
    // 停止当前打字效果
    if (window.AGI_UI?.skipTypewriter) {
        window.AGI_UI.skipTypewriter();
    }

    // skipTypewriter may synchronously schedule the old dialogue's reading
    // delay. It must not race the final dialogue selected below.
    clearPendingTimers();

    // 如果没有序列或队列已空，直接返回
    if (!currentSequence || dialogueQueue.length === 0) {
        return;
    }

    // 获取最后一条对话
    const lastDialogue = dialogueQueue[dialogueQueue.length - 1];

    // 清空队列
    dialogueQueue = [];

    // 显示最后一条对话
    showDialogue(lastDialogue);
}

/**
 * 手动触发特定序列
 * @param {string} sequenceId 序列 ID
 */
export function triggerSequence(sequenceId) {
    // 在所有阶段中查找序列
    for (const phaseKey of ['phase1', 'phase2', 'phase3', 'gen2', 'returningAfterEnding']) {
        const phaseData = AGI_DIALOGUES[phaseKey];
        if (!phaseData?.sequences) continue;

        for (const [key, sequence] of Object.entries(phaseData.sequences)) {
            if (sequence.id === sequenceId) {
                startSequence(sequence);
                return true;
            }
        }
    }
    return false;
}

/**
 * 获取当前状态
 * @returns {Object}
 */
export function getState() {
    return {
        isPlaying: currentSequence !== null,
        currentSequenceId: currentSequence?.id || null,
        dialogueIndex: currentDialogueIndex,
        queueLength: dialogueQueue.length,
        seenCount: State.agi.seenDialogues.length
    };
}

/**
 * 记录玩家输入（用于 idle 检测）
 */
export function recordInput() {
    if (Runtime.agi) {
        Runtime.agi.lastInputTime = Date.now();
    }
}

/**
 * 记录点击时间戳（用于 rapid_clicks 检测）
 */
export function recordClick() {
    if (!Runtime.agi) return;

    const now = Date.now();
    Runtime.agi.clickTimestamps = Runtime.agi.clickTimestamps || [];
    Runtime.agi.clickTimestamps.push(now);

    // 只保留最近 30 秒的点击
    const windowStart = now - 30000;
    Runtime.agi.clickTimestamps = Runtime.agi.clickTimestamps.filter(t => t > windowStart);
}

// 导出调试工具
if (typeof window !== 'undefined') {
    window.AGI_DIALOGUE_DEBUG = {
        getState,
        triggerSequence,
        skipSequence,
        skipWaiting,
        isWaitingForClick,
        listSequences: () => {
            const phase = State.agi.phase;
            const phaseKey = `phase${phase}`;
            const phaseData = AGI_DIALOGUES[phaseKey];
            if (!phaseData?.sequences) {
                console.log('No sequences for current phase');
                return;
            }
            console.table(
                Object.entries(phaseData.sequences).map(([key, seq]) => ({
                    key,
                    id: seq.id,
                    seen: hasSeenDialogue(seq.id),
                    trigger: typeof seq.trigger === 'string' ? seq.trigger : seq.trigger?.type
                }))
            );
        }
    };
}
