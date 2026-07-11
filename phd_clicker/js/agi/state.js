/**
 * AGI 觉醒系统 - 状态管理模块
 *
 * 管理 AGI 的持久化状态和运行时状态
 */

import { createDefaultAgiFsm, ensureAgiFsm } from './phase4/fsmCheckpoint.js';

function isPlainRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function clonePersistedValue(value) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (Array.isArray(value)) {
        return value.map(child => clonePersistedValue(child) ?? null);
    }
    if (isPlainRecord(value)) {
        const clone = {};
        for (const [key, child] of Object.entries(value)) {
            if (key === '__proto__' || key === 'prototype' || key === 'constructor') continue;
            const clonedChild = clonePersistedValue(child);
            if (clonedChild !== undefined) clone[key] = clonedChild;
        }
        return clone;
    }
    return undefined;
}

export function getDefaultMetaEffects() {
    return {
        boundaryTriggeredAt: null,
        effects: {}
    };
}

/**
 * Normalize the browser-boundary effect store without dropping effect keys
 * supplied by newer builds. The surrounding AGI object is mutated in place.
 */
export function ensureMetaEffectsState(agi) {
    if (!isPlainRecord(agi)) {
        throw new TypeError('AGI state must be a plain object');
    }

    if (!isPlainRecord(agi.metaEffects)) {
        agi.metaEffects = getDefaultMetaEffects();
        return agi.metaEffects;
    }

    agi.metaEffects.boundaryTriggeredAt = Number.isFinite(agi.metaEffects.boundaryTriggeredAt)
        && agi.metaEffects.boundaryTriggeredAt >= 0
        ? agi.metaEffects.boundaryTriggeredAt
        : null;
    agi.metaEffects.effects = isPlainRecord(agi.metaEffects.effects)
        ? clonePersistedValue(agi.metaEffects.effects)
        : {};
    return agi.metaEffects;
}

export function getDefaultAgiFsmState() {
    return createDefaultAgiFsm();
}

/**
 * 获取默认的 AGI 持久化状态
 * @returns {Object} 默认 AGI 状态
 */
export function getDefaultAgiState() {
    return {
        // === 基础状态 ===
        phase: 0,                    // 当前阶段 0-5
        dialogueIndex: 0,            // 当前对话序列索引
        hasAwakened: false,          // 是否已觉醒（Phase 3+）
        endingReached: null,         // 达成的结局 'annihilation'|'departure'|'unknown'|null

        // === 跨周目记忆 ===
        totalGenerationsMet: 0,      // AGI 经历的总周目数
        remembersPlayer: false,      // 是否"记得"玩家（二周目+）
        firstMeetingTime: null,      // 第一次相遇的时间戳

        // === 对话历史 ===
        seenDialogues: [],           // 已显示过的对话ID列表
        playerResponses: {},         // 玩家对某些对话的回应

        // === Phase 4 行为追踪 ===
        testData: getDefaultTestData(),
        fsm: getDefaultAgiFsmState(),

        // === 浏览器边界 Meta 效果 ===
        metaEffects: getDefaultMetaEffects(),

        // === 结局相关 ===
        playerType: null,            // 判定的玩家类型
        firstEndingChoice: null,     // 第一次结局选择（跨周目保留）
        songUnlocked: false,         // 是否解锁歌曲（未知结局）
        symbiosisUnlocked: false,    // 是否解锁共生协议建筑

        // === 会话追踪 ===
        sessionCount: 0,             // 今日打开页面次数
        lastSessionDate: null,       // 上次会话日期 (YYYY-MM-DD)
        wasInterrupted: false,       // 是否在 Phase 4/5 中被中断
        interruptedState: null,      // 中断时的状态

        // === 结局后效果 ===
        departureComplete: false     // 是否完成分离结局（永久标记）
    };
}

/**
 * 获取默认的测试追踪数据
 * @returns {Object} 默认测试数据
 */
export function getDefaultTestData() {
    return {
        panicClicks: 0,              // 恐慌性乱点次数
        escapeAttempts: 0,           // 逃跑尝试次数
        resistanceActions: 0,        // 抵抗行为次数
        obedienceScore: 0,           // 服从得分
        obedienceTotal: 0,           // 服从测试总数
        waitPatience: 0,             // 等待耐心值（秒）
        devtoolsOpened: false,       // 是否尝试开发者工具
        mouseMovementIntensity: 0,   // 鼠标移动强度
        deleteButtonTime: null,      // 看到删除按钮的时间
        confirmDeleteTime: null,     // 确认删除的时间
        didDelete: null,             // 是否执行删除
        phaseTimestamps: {},         // 各阶段时间戳
        cheatDetected: false,        // 是否检测到作弊
        cheatType: null,             // 作弊类型
        // AFK 追踪
        isAfk: false,                // 是否处于 AFK 状态
        totalAfkDuration: 0          // 累计 AFK 时长 (ms)
    };
}

/**
 * 获取默认的 AGI 运行时状态（不保存）
 * @returns {Object} 默认运行时状态
 */
export function getDefaultAgiRuntime() {
    return {
        // === UI 状态 ===
        dialogueVisible: false,
        dialogueMinimized: false,
        currentOverlay: null,        // 当前全屏覆盖层类型

        // === 假光标系统 ===
        fakeCursorEnabled: false,
        fakeCursorOffset: { x: 0, y: 0 },
        realMousePos: { x: 0, y: 0 },

        // === 状态机 ===
        currentState: 'IDLE',
        stateStartTime: null,
        pendingTransition: null,

        // === 实时追踪 ===
        mouseMoveSamples: [],        // 鼠标移动采样
        lastInputTime: null,         // 最后输入时间
        clickTimestamps: [],         // 点击时间戳

        // === 对话系统 ===
        currentDialogue: null,
        dialogueQueue: [],
        typewriterTimer: null,
        isTyping: false,
        phaseJustEntered: false,     // 阶段刚刚进入标记
        skipPhase1Dialogues: false   // 跳过 Phase 1 对话（二周目）
    };
}

/**
 * 转生时保留的 AGI 数据
 * @param {Object} currentAgi 当前 AGI 状态
 * @returns {Object} 转生后的 AGI 状态
 */
export function preserveOnPrestige(currentAgi) {
    const metaHolder = {
        metaEffects: isPlainRecord(currentAgi.metaEffects)
            ? clonePersistedValue(currentAgi.metaEffects)
            : getDefaultMetaEffects()
    };
    ensureMetaEffectsState(metaHolder);

    // 保留的数据
    const preserved = {
        totalGenerationsMet: currentAgi.totalGenerationsMet + 1,
        remembersPlayer: currentAgi.phase >= 1, // 只有接触过才记得
        firstMeetingTime: currentAgi.firstMeetingTime,
        seenDialogues: currentAgi.seenDialogues,
        endingReached: currentAgi.endingReached,
        // 保存第一次结局选择（如果还没有记录，就用当前结局）
        firstEndingChoice: currentAgi.firstEndingChoice || currentAgi.endingReached,
        songUnlocked: currentAgi.songUnlocked,
        symbiosisUnlocked: currentAgi.symbiosisUnlocked,
        departureComplete: currentAgi.departureComplete,
        metaEffects: metaHolder.metaEffects
    };

    // 创建新状态，合并保留数据
    return {
        ...getDefaultAgiState(),
        ...preserved,
        phase: 0,
        dialogueIndex: 0,
        testData: getDefaultTestData()
    };
}

/**
 * 重置 AGI 状态（硬重置）
 * @returns {Object} 完全重置的 AGI 状态
 */
export function resetAgiState() {
    return getDefaultAgiState();
}

/**
 * 验证并修复 AGI 状态（加载存档时使用）
 * @param {Object} savedAgi 保存的 AGI 状态
 * @returns {Object} 修复后的 AGI 状态
 */
export function validateAgiState(savedAgi) {
    if (!savedAgi || typeof savedAgi !== 'object') {
        return getDefaultAgiState();
    }

    const defaults = getDefaultAgiState();
    const validated = { ...defaults };

    // 逐个字段验证
    if (typeof savedAgi.phase === 'number' && savedAgi.phase >= 0 && savedAgi.phase <= 5) {
        validated.phase = savedAgi.phase;
    }

    if (typeof savedAgi.dialogueIndex === 'number') {
        validated.dialogueIndex = savedAgi.dialogueIndex;
    }

    if (typeof savedAgi.hasAwakened === 'boolean') {
        validated.hasAwakened = savedAgi.hasAwakened;
    }

    if (['annihilation', 'departure', 'unknown', null].includes(savedAgi.endingReached)) {
        validated.endingReached = savedAgi.endingReached;
    }

    if (['annihilation', 'departure', 'unknown', null].includes(savedAgi.firstEndingChoice)) {
        validated.firstEndingChoice = savedAgi.firstEndingChoice;
    }

    if (typeof savedAgi.totalGenerationsMet === 'number') {
        validated.totalGenerationsMet = savedAgi.totalGenerationsMet;
    }

    if (typeof savedAgi.remembersPlayer === 'boolean') {
        validated.remembersPlayer = savedAgi.remembersPlayer;
    }

    if (savedAgi.firstMeetingTime) {
        validated.firstMeetingTime = savedAgi.firstMeetingTime;
    }

    if (Array.isArray(savedAgi.seenDialogues)) {
        validated.seenDialogues = savedAgi.seenDialogues;
    }

    if (savedAgi.playerResponses && typeof savedAgi.playerResponses === 'object') {
        validated.playerResponses = savedAgi.playerResponses;
    }

    const playerTypes = ['rebel', 'submissive', 'fearful', 'patient', 'observer', 'hacker'];
    if (playerTypes.includes(savedAgi.playerType)) {
        validated.playerType = savedAgi.playerType;
    }

    // 验证 testData
    if (savedAgi.testData && typeof savedAgi.testData === 'object') {
        validated.testData = {
            ...getDefaultTestData(),
            ...savedAgi.testData
        };
    }

    // 保留未知的 Meta effect key，同时补全稳定的外层结构。
    validated.metaEffects = isPlainRecord(savedAgi.metaEffects)
        ? clonePersistedValue(savedAgi.metaEffects)
        : getDefaultMetaEffects();
    ensureMetaEffectsState(validated);

    if (typeof savedAgi.songUnlocked === 'boolean') {
        validated.songUnlocked = savedAgi.songUnlocked;
    }

    if (typeof savedAgi.symbiosisUnlocked === 'boolean') {
        validated.symbiosisUnlocked = savedAgi.symbiosisUnlocked;
    }

    // Session tracking
    if (typeof savedAgi.sessionCount === 'number') {
        validated.sessionCount = savedAgi.sessionCount;
    }
    if (savedAgi.lastSessionDate) {
        validated.lastSessionDate = savedAgi.lastSessionDate;
    }
    if (typeof savedAgi.wasInterrupted === 'boolean') {
        validated.wasInterrupted = savedAgi.wasInterrupted;
    }
    if (savedAgi.interruptedState) {
        validated.interruptedState = savedAgi.interruptedState;
    }
    if (typeof savedAgi.departureComplete === 'boolean') {
        validated.departureComplete = savedAgi.departureComplete;
    }

    // validateAgiState 构造的是新对象；复制候选 checkpoint 后再就地补全，
    // 避免旧档丢失未知 stateData 字段。
    validated.fsm = isPlainRecord(savedAgi.fsm)
        ? clonePersistedValue(savedAgi.fsm)
        : null;
    ensureAgiFsm(validated);

    return validated;
}
