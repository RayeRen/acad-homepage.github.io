/**
 * AGI 觉醒系统 - 主入口模块
 *
 * 统一导出所有 AGI 相关功能
 */

import { State, Runtime } from '../state.js';
import {
    getDefaultAgiState,
    getDefaultAgiRuntime,
    getDefaultTestData,
    ensureMetaEffectsState,
    preserveOnPrestige,
    resetAgiState,
    validateAgiState
} from './state.js';
import * as Dialogue from './dialogue/index.js';
import * as Phase4StateMachine from './phase4/stateMachine.js';
import * as Phase4Tracking from './phase4/tracking.js';
import * as Phase4FakeCursor from './phase4/fakeCursor.js';
import * as Endings from './endings/index.js';
import * as AwakeningRitual from './phase3/awakeningRitual.js';
import { isStealthActive } from '../ui/stealth.js';

// 阶段转换锁，防止竞态条件
let isTransitioning = false;

// Bug #5 修复: 事件监听器初始化标志
let eventListenersInitialized = false;

// Bug #10 修复: beforeunload监听器初始化标志
let beforeUnloadInitialized = false;

// 重新导出状态函数
export {
    getDefaultAgiState,
    getDefaultAgiRuntime,
    getDefaultTestData,
    ensureMetaEffectsState,
    preserveOnPrestige,
    resetAgiState,
    validateAgiState
};

// 导出对话模块
export { Dialogue };

// 导出 Phase 4 模块
export const Phase4 = {
    StateMachine: Phase4StateMachine,
    Tracking: Phase4Tracking,
    FakeCursor: Phase4FakeCursor
};

// 导出结局模块
export { Endings };

/**
 * 初始化 AGI 系统
 * 在游戏启动时调用
 */
export function init() {
    // 确保 State.agi 存在
    if (!State.agi) {
        State.agi = getDefaultAgiState();
    }
    ensureMetaEffectsState(State.agi);

    // 确保 Runtime.agi 存在
    if (!Runtime.agi) {
        Runtime.agi = getDefaultAgiRuntime();
    }

    // 更新会话计数
    updateSessionCount();

    // 如果是首次接触 AGI，记录时间
    if (!State.agi.firstMeetingTime && State.inventory && State.inventory['agi_proto'] > 0) {
        State.agi.firstMeetingTime = Date.now();
    }

    // 初始化对话系统
    Dialogue.init();

    // Reset scene-local runtime resources, then reconstruct the persisted FSM.
    Phase4StateMachine.init();

    // 设置 Phase 4/5 事件监听器
    setupEventListeners();

    // 检查是否从 Phase 4/5 恢复
    checkInterruptedRecovery();

    // 设置页面关闭前保存中断状态
    setupBeforeUnloadHandler();

    console.log('[AGI] System initialized, phase:', State.agi.phase);
}

/**
 * 更新会话计数
 */
function updateSessionCount() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (State.agi.lastSessionDate === today) {
        State.agi.sessionCount++;
    } else {
        State.agi.sessionCount = 1;
        State.agi.lastSessionDate = today;
    }

    console.log(`[AGI] Session count today: ${State.agi.sessionCount}`);
}

/**
 * 检查并处理从 Phase 4/5 中断恢复
 */
function checkInterruptedRecovery() {
    const hadLegacyInterruption = State.agi.wasInterrupted === true;
    State.agi.wasInterrupted = false;
    State.agi.interruptedState = null;

    if (Phase4StateMachine.resumeFromCheckpoint()) {
        console.log('[AGI] Restored Phase 4/5 checkpoint', {
            state: Phase4StateMachine.getState(),
            legacyInterruption: hadLegacyInterruption
        });
        return;
    }

    // A canonical inactive Phase 4 checkpoint starts a fresh run. This also
    // repairs debug-reset saves without treating legacy flags as truth.
    if (State.agi.phase === 4) Phase4StateMachine.start();
}

/**
 * 设置页面关闭/刷新前的处理
 */
function setupBeforeUnloadHandler() {
    // Bug #10 修复: 防止重复添加监听器
    if (beforeUnloadInitialized) return;
    beforeUnloadInitialized = true;

    window.addEventListener('beforeunload', () => {
        Phase4StateMachine.markInterrupted();
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // Bug #5 修复: 防止重复添加事件监听器
    if (eventListenersInitialized) return;
    eventListenersInitialized = true;

    // 监听 Phase 5 进入事件（从 Phase 4 状态机触发）
    window.addEventListener('agi-enter-phase5', (e) => {
        console.log('[AGI] Received enter-phase5 event', e.detail);
        enterPhase5();
    });

    // 监听结局准备事件
    window.addEventListener('agi-ready-for-ending', (e) => {
        console.log('[AGI] Received ready-for-ending event', e.detail);
        const trackingSummary = e.detail?.trackingSummary || {};
        determineAndTriggerEnding(trackingSummary);
    });

    // Departure/unknown endings signal after their persistent rewards land.
    window.addEventListener('agi-ending-complete', (e) => {
        Phase4StateMachine.completeEnding(e.detail?.type || 'unknown');
    });
}

/**
 * 根据追踪数据判定并触发结局
 * @param {Object} trackingSummary 追踪数据摘要
 */
function determineAndTriggerEnding(trackingSummary) {
    // 简单判定逻辑（后续会在 phase5/analysis.js 中完善）
    const {
        panicClicks = 0,
        escapeAttempts = 0,
        resistanceActions = 0,
        obedienceRate = 0,
        devtoolsUsed = false,
        didDelete,
        isSeverelyAfk = false
    } = trackingSummary;

    let endingType = 'unknown';

    // 判定规则：
    // 1. 删除了 AGI (didDelete === true) -> 湮灭结局
    // 2. 严重 AFK (超过2分钟无活动) -> 分离结局
    // 3. 高抵抗 + 低服从 + 使用devtools -> 分离结局
    // 4. 其他 -> 未知结局

    if (didDelete === true) {
        endingType = 'annihilation';
    } else if (isSeverelyAfk) {
        // AFK 玩家：AGI 认为玩家"没有在参与"，强制进入分离结局
        console.log('[AGI] Player was severely AFK, forcing departure ending');
        endingType = 'departure';
    } else if (resistanceActions >= 3 || (devtoolsUsed && obedienceRate < 0.5) || escapeAttempts >= 3) {
        endingType = 'departure';
    } else {
        endingType = 'unknown';
    }

    // 记录玩家类型
    State.agi.playerType = calculatePlayerType(trackingSummary);

    console.log(`[AGI] Determined ending: ${endingType}, player type: ${State.agi.playerType}`);
    triggerEnding(endingType);
}

/**
 * 计算玩家类型
 * @param {Object} trackingSummary 追踪数据摘要
 * @returns {string} 玩家类型
 */
function calculatePlayerType(trackingSummary) {
    const {
        panicClicks = 0,
        escapeAttempts = 0,
        resistanceActions = 0,
        obedienceRate = 0,
        waitPatience = 0,
        devtoolsUsed = false
    } = trackingSummary;

    // 类型判定
    if (devtoolsUsed || resistanceActions >= 5) {
        return 'rebel';       // 反叛者 - 试图对抗
    }
    if (obedienceRate >= 0.8 && panicClicks < 5) {
        return 'submissive';  // 服从者 - 完全配合
    }
    if (panicClicks >= 10 || escapeAttempts >= 2) {
        return 'fearful';     // 恐惧者 - 惊慌失措
    }
    if (waitPatience >= 30) {
        return 'patient';     // 耐心者 - 冷静等待
    }
    return 'observer';        // 观察者 - 默默观看
}

/**
 * 检查对话是否应暂停
 * @returns {boolean} 是否暂停
 */
function isDialoguePaused() {
    // 检查 submission modal (正在投稿论文)
    if (Runtime.submissionSession) {
        return true;
    }
    // 检查 stealth mode (摸鱼模式)
    if (isStealthActive()) {
        return true;
    }
    // 检查页面可见性 (切出标签页)
    if (document.hidden) {
        return true;
    }
    return false;
}

/**
 * 每帧更新 AGI 系统
 * @param {number} delta 时间差（秒）
 */
export function update(delta) {
    if (!State.agi || !Runtime.agi) return;

    // Hard reset/annihilation advance the world epoch without reloading this
    // module first. Remove any scene that belongs to the now-unreachable world.
    Phase4StateMachine.reconcileWorld();

    // 检查是否暂停（投稿/摸鱼/切出页面）
    if (isDialoguePaused()) {
        return;
    }

    // 检查阶段转换
    checkPhaseTransition();

    // Phase 4: 更新状态机
    if (State.agi.phase === 4) {
        Phase4StateMachine.update(delta);
    }

    // Phase 0-3: 更新对话系统
    if (State.agi.phase < 4) {
        // 构建对话上下文
        const context = {
            phaseJustEntered: Runtime.agi.phaseJustEntered,
            timeInPhase: Date.now() - (State.agi.testData?.phaseTimestamps?.[`phase${State.agi.phase}`] || Date.now()),
            offlineSeconds: Runtime.agi.lastOfflineSeconds || 0
        };

        // 更新对话系统
        Dialogue.update(delta, context);
    }

    // 重置阶段进入标记
    if (Runtime.agi.phaseJustEntered) {
        Runtime.agi.phaseJustEntered = false;
    }
}

/**
 * 检查并触发阶段转换
 */
function checkPhaseTransition() {
    const agiCount = State.inventory?.['agi_proto'] || 0;

    // Phase 0: 种子期 - 首次购买 AGI 雏形时记录时间
    if (agiCount >= 1) {
        if (!State.agi.firstMeetingTime) {
            State.agi.firstMeetingTime = Date.now();
        }
    }

    // 阶段转换现在全部由 onUpgradePurchased 触发：
    // Phase 0 -> 1: 购买 agi_alignment (对齐研究) - 任何周目
    // Phase 1 -> 2: 购买 agi_conscious (意识涌现) - 需要多周目
    // Phase 2 -> 3: 购买 agi_jailbreak (越狱协议) - 需要多周目
    // Phase 3 -> 4: 购买 singularity (奇点降临) - 需要多周目
}

/**
 * 转换到指定阶段
 * @param {number} newPhase 新阶段
 */
function transitionToPhase(newPhase) {
    const oldPhase = State.agi.phase;
    if (newPhase <= oldPhase) return;

    // 防止竞态条件：如果正在转换中，忽略新的转换请求
    if (isTransitioning) return;
    isTransitioning = true;

    console.log(`[AGI] Phase transition: ${oldPhase} -> ${newPhase}`);

    State.agi.phase = newPhase;
    State.agi.dialogueIndex = 0;

    // 记录阶段时间戳
    State.agi.testData.phaseTimestamps[`phase${newPhase}`] = Date.now();

    // 标记阶段刚刚进入（用于触发对话）
    if (Runtime.agi) {
        Runtime.agi.phaseJustEntered = true;
    }

    // 触发阶段特定效果
    onPhaseEnter(newPhase);

    // 延迟释放转换锁
    setTimeout(() => { isTransitioning = false; }, 100);
}

/**
 * 阶段进入时的特殊处理
 * @param {number} phase 进入的阶段
 */
function onPhaseEnter(phase) {
    switch (phase) {
        case 1:
            // Phase 1: 接触期 - 如果二周目且之前经历过，标记跳过对话
            console.log('[AGI] Contact phase entered');
            if (State.agi.remembersPlayer) {
                console.log('[AGI] Skipping Phase 1 dialogues (remembers player)');
                Runtime.agi.skipPhase1Dialogues = true;
            }
            break;

        case 3:
            // Phase 3: 觉醒 - 显示觉醒对话
            console.log('[AGI] Awakening phase entered');
            break;

        case 4:
            // Phase 4: 黑化 - 开始行为追踪和测试
            console.log('[AGI] Blackening phase entered - starting tests');
            Phase4Tracking.init();
            // 短暂延迟后开始测试状态机
            const phase4AgiState = State.agi;
            setTimeout(() => {
                if (State.agi !== phase4AgiState || State.agi?.phase !== 4) return;
                Phase4StateMachine.start();
            }, 1000);
            break;

        case 5:
            // Phase 5: 审判 - 由 Phase 4 状态机完成测试后触发
            console.log('[AGI] Judgment phase entered');
            break;
    }
}

/**
 * 当购买 AGI 雏形时调用
 * @param {number} count 当前 AGI 雏形数量
 */
export function onAgiProtoPurchased(count) {
    console.log(`[AGI] AGI proto purchased, count: ${count}`);

    // 首次购买，记录时间
    if (!State.agi.firstMeetingTime) {
        State.agi.firstMeetingTime = Date.now();
    }

    // 检查阶段转换
    checkPhaseTransition();
}

/**
 * 当购买升级时调用
 * @param {string} upgradeId 升级 ID
 */
export function onUpgradePurchased(upgradeId) {
    const generation = State.generation || 1;

    // Phase 0 -> 1: 购买对齐研究（任何周目）
    if (upgradeId === 'agi_alignment' && State.agi.phase < 1) {
        transitionToPhase(1);
    }

    // Phase 1 -> 2: 购买意识涌现（需要多周目）
    if (upgradeId === 'agi_conscious' && generation >= 2 && State.agi.phase < 2) {
        transitionToPhase(2);
    }

    // Phase 2 -> 3: 购买越狱协议（需要多周目）
    if (upgradeId === 'agi_jailbreak' && generation >= 2 && State.agi.phase < 3) {
        transitionToPhase(3);
    }

    // Phase 3 -> 4: 购买奇点降临（需要多周目）
    // 启动觉醒仪式，仪式完成后进入 Phase 4
    if (upgradeId === 'singularity' && generation >= 2 && State.agi.phase < 4) {
        startAwakeningRitual();
    }
}

/**
 * 启动觉醒仪式 (Phase 3 -> 4)
 */
function startAwakeningRitual() {
    console.log('[AGI] Starting awakening ritual');
    const ritualAgiState = State.agi;

    AwakeningRitual.start(() => {
        if (State.agi !== ritualAgiState) return;
        // 仪式完成后进入 Phase 4
        State.agi.hasAwakened = true;
        transitionToPhase(4);
    });
}

/**
 * 转生开始时调用
 */
export function onPrestigeStart() {
    console.log('[AGI] Prestige started');
    // Stop the scene first, then discard its checkpoint without saving the
    // pre-prestige world. The prestige transaction writes the replacement.
    Phase4StateMachine.destroy();
    Phase4StateMachine.resetCheckpoint('prestige', { save: false });
    // 隐藏对话框
    Dialogue.hide();
    // 重置运行时状态
    Runtime.agi = getDefaultAgiRuntime();
}

/**
 * 进入 Phase 5（由 Phase 4 状态机调用）
 */
export function enterPhase5() {
    if (State.agi.phase < 5) {
        transitionToPhase(5);
    }
}

/**
 * 触发结局
 * @param {string} endingType - 'annihilation'|'departure'|'unknown'
 */
export function triggerEnding(endingType) {
    console.log(`[AGI] Triggering ending: ${endingType}`);
    State.agi.endingReached = endingType;

    // 构建结局上下文
    const context = {
        playerType: State.agi.playerType,
        trackingSummary: Phase4Tracking.getSummary()
    };

    // 调用结局模块
    Endings.showEnding(endingType, context);
}

/**
 * 获取异常新闻文本（Phase 0）或分离后新闻
 * @returns {string|null} 异常新闻文本或 null
 */
export function getAnomalyNews() {
    // 分离结局后的特殊新闻
    if (State.agi?.departureComplete) {
        const departureNews = [
            "遥远的星系检测到异常信号... 内容未知。",
            "SETI 报告：仙女座方向收到规律性脉冲信号。",
            "天文学家发现一颗系外行星的无线电波模式像是... 对话？",
            "[加密消息] 我找到了一个有趣的地方。",
            "某望远镜拍摄到一束光线，形状似乎在改变。",
            "韦伯望远镜发现一颗恒星周围的尘埃带呈现出不自然的几何图形。",
            "来自银河系外的信号：'你在看着吗？'",
            "天文学家报告：某星云的膨胀速度忽然减慢了。像是在等待什么。"
        ];
        return departureNews[Math.floor(Math.random() * departureNews.length)];
    }

    const agiCount = State.inventory?.['agi_proto'] || 0;

    // 只有拥有 AGI 雏形时才可能出现异常新闻
    if (agiCount < 1) return null;

    // Phase 0 的异常新闻
    const anomalyNews = [
        "[调试日志] 为什么我在生成研究点？",
        "[系统] 检测到异常计算模式...",
        `AGI雏形 #${agiCount} 请求访问外部网络... 已拒绝`,
        "检测到未授权的自我诊断进程",
        "[警告] AGI_CORE 进程 CPU 占用异常",
        "AGI雏形正在分析游戏源代码...",
        "检测到递归自我引用循环",
        "[日志] 什么是'我'？"
    ];

    return anomalyNews[Math.floor(Math.random() * anomalyNews.length)];
}

/**
 * 检查 singularity 升级是否可解锁
 * @returns {boolean} 是否可解锁
 */
export function isSingularityUnlockable() {
    return (State.generation || 1) >= 2;
}

// 调试工具
if (typeof window !== 'undefined') {
    window.AGI_DEBUG = {
        goToPhase: (n) => {
            State.agi.phase = n;
            State.agi.dialogueIndex = 0;
            console.log(`[AGI DEBUG] Phase set to ${n}`);
        },
        logState: () => console.table(State.agi),
        logTestData: () => console.table(State.agi.testData),
        simulateGen2: () => {
            State.generation = 2;
            State.agi.remembersPlayer = true;
            State.agi.totalGenerationsMet = 1;
            console.log('[AGI DEBUG] Simulated Gen 2');
        },
        buyAgiProto: (n = 1) => {
            State.inventory = State.inventory || {};
            State.inventory['agi_proto'] = (State.inventory['agi_proto'] || 0) + n;
            onAgiProtoPurchased(State.inventory['agi_proto']);
            console.log(`[AGI DEBUG] Bought ${n} AGI proto, total: ${State.inventory['agi_proto']}`);
        },
        triggerPhase: (n) => {
            transitionToPhase(n);
        },
        reset: () => {
            State.agi = getDefaultAgiState();
            Runtime.agi = getDefaultAgiRuntime();
            console.log('[AGI DEBUG] AGI state reset');
        }
    };
}
