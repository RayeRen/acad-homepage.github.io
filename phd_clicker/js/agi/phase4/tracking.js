/**
 * AGI Phase 4 - 行为追踪模块
 *
 * 追踪玩家在恐怖体验中的行为：
 * - 恐慌点击（快速乱点）
 * - 逃跑尝试（beforeunload、关闭标签页）
 * - 抵抗行为（尝试对抗 AGI）
 * - 服从得分（遵循指令的程度）
 * - 等待耐心（能静静等多久）
 * - devtools 使用
 */

import { State, Runtime } from '../../state.js';

// 追踪配置
const CONFIG = {
    // 恐慌点击检测
    panicClickWindow: 3000,      // 3秒窗口
    panicClickThreshold: 15,     // 15次点击算恐慌

    // 鼠标强度采样
    mouseSampleInterval: 100,    // 100ms 采样一次
    mouseSampleWindow: 5000,     // 5秒移动窗口

    // 等待耐心
    patienceCheckInterval: 1000, // 1秒检测一次

    // AFK 检测
    afkThreshold: 60000,         // 60秒无活动算 AFK
    afkCheckInterval: 5000,      // 5秒检查一次 AFK

    // 作弊检测
    cheatCheckInterval: 3000,    // 3秒检查一次
    rpSpikeThreshold: 1e10,      // RP 突然增加超过这个值算作弊
    rpGrowthRatio: 100           // RP 增长比例超过这个倍数算作弊
};

// 运行时追踪数据
let clickTimestamps = [];
let mousePositions = [];
let lastMousePos = { x: 0, y: 0 };
let lastMouseTime = 0;
let patienceTimer = null;
let devtoolsCheckInterval = null;
let debuggerCheckInterval = null;
let consoleCheckInterval = null;
let consoleCheckTimeout = null;
let isInitialized = false;
let trackedAgiState = null;

function isTrackingWorldCurrent() {
    if (trackedAgiState === null) return false;
    if (trackedAgiState === State.agi) return true;

    const trackedRunId = trackedAgiState?.fsm?.active
        ? trackedAgiState.fsm.runId
        : null;
    const currentRunId = State.agi?.fsm?.active ? State.agi.fsm.runId : null;
    return typeof trackedRunId === 'string'
        && trackedRunId.length > 0
        && trackedRunId === currentRunId;
}

// AFK 追踪
let lastActivityTime = Date.now();
let afkCheckTimer = null;
let totalAfkDuration = 0;
let isCurrentlyAfk = false;

// 作弊检测
let cheatCheckTimer = null;
let lastStateSnapshot = null;
let cheatDetected = false;

/**
 * 初始化追踪系统
 */
export function init() {
    if (isInitialized) {
        if (isTrackingWorldCurrent()) return;
        destroy();
    }
    isInitialized = true;
    trackedAgiState = State.agi;

    // 监听点击
    document.addEventListener('click', onDocumentClick, true);

    // 监听鼠标移动
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // 监听键盘（devtools 检测）
    document.addEventListener('keydown', onKeyDown, true);

    // 监听 beforeunload（逃跑检测）
    window.addEventListener('beforeunload', onBeforeUnload);

    // 开始 devtools 检测
    startDevtoolsDetection();

    // 开始 AFK 检测
    startAfkDetection();

    // 开始作弊检测
    startCheatDetection();

    console.log('[AGI Tracking] Initialized');
}

/**
 * 销毁追踪系统
 */
export function destroy() {
    document.removeEventListener('click', onDocumentClick, true);
    document.removeEventListener('mousemove', onMouseMove, { passive: true });
    document.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('beforeunload', onBeforeUnload);

    stopPatienceTimer();
    if (devtoolsCheckInterval) {
        clearInterval(devtoolsCheckInterval);
        devtoolsCheckInterval = null;
    }
    if (debuggerCheckInterval) {
        clearInterval(debuggerCheckInterval);
        debuggerCheckInterval = null;
    }
    if (consoleCheckInterval) {
        clearInterval(consoleCheckInterval);
        consoleCheckInterval = null;
    }
    if (consoleCheckTimeout) {
        clearTimeout(consoleCheckTimeout);
        consoleCheckTimeout = null;
    }
    if (afkCheckTimer) {
        clearInterval(afkCheckTimer);
        afkCheckTimer = null;
    }
    if (cheatCheckTimer) {
        clearInterval(cheatCheckTimer);
        cheatCheckTimer = null;
    }

    clickTimestamps = [];
    mousePositions = [];
    lastMousePos = { x: 0, y: 0 };
    lastMouseTime = 0;
    isCurrentlyAfk = false;
    totalAfkDuration = 0;
    lastStateSnapshot = null;

    isInitialized = false;
    trackedAgiState = null;
}

/**
 * 点击事件处理
 */
function onDocumentClick(e) {
    // 忽略 HTMLElement.click() 等脚本生成的点击，避免幽灵光标污染玩家数据。
    if (e && e.isTrusted === false) return;
    if (!isTrackingWorldCurrent()) return;

    const now = Date.now();
    clickTimestamps.push(now);

    // 更新活动时间（用于 AFK 检测）
    updateActivityTime();

    // 清理旧时间戳
    const windowStart = now - CONFIG.panicClickWindow;
    clickTimestamps = clickTimestamps.filter(t => t > windowStart);

    // 检测恐慌点击
    if (clickTimestamps.length >= CONFIG.panicClickThreshold) {
        recordPanicClick();
    }

    // 更新 Runtime 的点击记录（用于对话触发）
    if (Runtime.agi) {
        Runtime.agi.clickTimestamps = Runtime.agi.clickTimestamps || [];
        Runtime.agi.clickTimestamps.push(now);
        // 只保留最近30秒
        Runtime.agi.clickTimestamps = Runtime.agi.clickTimestamps.filter(t => t > now - 30000);
    }
}

/**
 * 鼠标移动事件处理
 */
function onMouseMove(e) {
    if (!isTrackingWorldCurrent()) return;
    const now = Date.now();

    // 更新真实鼠标位置（用于假光标）
    if (Runtime.agi) {
        Runtime.agi.realMousePos = { x: e.clientX, y: e.clientY };
    }

    // 更新活动时间（用于 AFK 检测）
    updateActivityTime();

    // 采样间隔检查
    if (now - lastMouseTime < CONFIG.mouseSampleInterval) return;

    // 计算移动距离
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 记录移动样本
    mousePositions.push({
        time: now,
        distance,
        x: e.clientX,
        y: e.clientY
    });

    // 清理旧样本
    const windowStart = now - CONFIG.mouseSampleWindow;
    mousePositions = mousePositions.filter(p => p.time > windowStart);

    // 更新鼠标强度
    updateMouseIntensity();

    lastMousePos = { x: e.clientX, y: e.clientY };
    lastMouseTime = now;
}

/**
 * 更新鼠标移动强度
 */
function updateMouseIntensity() {
    if (!isTrackingWorldCurrent()) return;
    if (mousePositions.length < 2) return;

    // 计算平均移动速度
    const totalDistance = mousePositions.reduce((sum, p) => sum + p.distance, 0);
    const avgSpeed = totalDistance / (CONFIG.mouseSampleWindow / 1000); // 像素/秒

    // 归一化到 0-100
    const intensity = Math.min(100, avgSpeed / 10);

    if (State.agi?.testData) {
        State.agi.testData.mouseMovementIntensity = intensity;
    }
}

/**
 * 键盘事件处理（devtools 检测）
 */
function onKeyDown(e) {
    if (!isTrackingWorldCurrent()) return;
    // F12
    if (e.key === 'F12') {
        recordDevtoolsAttempt();
        e.preventDefault();
    }

    // Ctrl+Shift+I (Chrome DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        recordDevtoolsAttempt();
    }

    // Ctrl+Shift+J (Chrome Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        recordDevtoolsAttempt();
    }

    // Cmd+Option+I (Mac)
    if (e.metaKey && e.altKey && e.key === 'i') {
        recordDevtoolsAttempt();
    }
}

/**
 * beforeunload 事件处理（逃跑检测）
 */
function onBeforeUnload(e) {
    if (!isTrackingWorldCurrent()) return;
    recordEscapeAttempt();

    // Phase 4+ 时显示警告
    if (State.agi?.phase >= 4) {
        e.preventDefault();
        e.returnValue = ''; // 现代浏览器需要这个
        return '';
    }
}

/**
 * 记录恐慌点击
 */
function recordPanicClick() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
    State.agi.testData.panicClicks++;
    console.log('[AGI Tracking] Panic click detected, total:', State.agi.testData.panicClicks);
}

/**
 * 记录逃跑尝试
 */
export function recordEscapeAttempt() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
    State.agi.testData.escapeAttempts++;
    console.log('[AGI Tracking] Escape attempt detected, total:', State.agi.testData.escapeAttempts);
}

/**
 * 记录抵抗行为
 */
export function recordResistance() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
    State.agi.testData.resistanceActions++;
    console.log('[AGI Tracking] Resistance recorded, total:', State.agi.testData.resistanceActions);
}

/**
 * 记录服从行为
 * @param {boolean} obeyed - 是否服从
 */
export function recordObedience(obeyed) {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
    State.agi.testData.obedienceTotal++;
    if (obeyed) {
        State.agi.testData.obedienceScore++;
    }
    console.log('[AGI Tracking] Obedience:', obeyed,
        'Score:', State.agi.testData.obedienceScore,
        '/', State.agi.testData.obedienceTotal);
}

/**
 * 记录 devtools 尝试
 */
function recordDevtoolsAttempt() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
    State.agi.testData.devtoolsOpened = true;
    console.log('[AGI Tracking] Devtools attempt detected');
}

/**
 * 开始 devtools 检测（多种方法）
 */
function startDevtoolsDetection() {
    if (devtoolsCheckInterval) {
        clearInterval(devtoolsCheckInterval);
    }

    // 方法1: 窗口大小差异法
    devtoolsCheckInterval = setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;

        if (widthThreshold || heightThreshold) {
            if (State.agi?.testData && !State.agi.testData.devtoolsOpened) {
                recordDevtoolsAttempt();
            }
        }
    }, 1000);

    // 方法2: debugger 时间差检测
    // debugger 语句在 devtools 打开时会暂停，导致时间差
    runDebuggerDetection();

    // 方法3: console 对象属性检测
    detectConsoleOpen();
}

/**
 * debugger 时间差检测
 */
function runDebuggerDetection() {
    // 只运行几次，避免干扰用户
    let detectionRuns = 0;
    const maxRuns = 5;

    if (debuggerCheckInterval) {
        clearInterval(debuggerCheckInterval);
    }

    debuggerCheckInterval = setInterval(() => {
        if (detectionRuns >= maxRuns || State.agi?.testData?.devtoolsOpened) {
            clearInterval(debuggerCheckInterval);
            debuggerCheckInterval = null;
            return;
        }

        const start = performance.now();

        // 这个会在 devtools 打开时暂停
        // eslint-disable-next-line no-debugger
        try {
            (function() {}).constructor('debugger')();
        } catch (e) {
            // CSP 可能禁止动态代码；这不应中断其余追踪逻辑。
            clearInterval(debuggerCheckInterval);
            debuggerCheckInterval = null;
            return;
        }

        const duration = performance.now() - start;

        // 如果执行时间超过 100ms，可能是 devtools 打开了
        if (duration > 100) {
            if (State.agi?.testData && !State.agi.testData.devtoolsOpened) {
                recordDevtoolsAttempt();
                console.log('[AGI Tracking] Devtools detected via debugger timing');
            }
        }

        detectionRuns++;
    }, 3000);
}

/**
 * 检测 console 是否打开
 * 通过创建一个带有自定义 getter 的对象来检测
 */
function detectConsoleOpen() {
    const element = new Image();
    let consoleDetected = false;

    Object.defineProperty(element, 'id', {
        get: function() {
            if (!consoleDetected && State.agi?.testData && !State.agi.testData.devtoolsOpened) {
                consoleDetected = true;
                recordDevtoolsAttempt();
                console.log('[AGI Tracking] Devtools detected via console');
            }
            return '';
        }
    });

    // 周期性地把这个对象 log 到 console
    // 只有当 devtools 打开时，console.log 才会触发 getter
    if (consoleCheckInterval) {
        clearInterval(consoleCheckInterval);
    }
    if (consoleCheckTimeout) {
        clearTimeout(consoleCheckTimeout);
    }

    consoleCheckInterval = setInterval(() => {
        if (consoleDetected || State.agi?.testData?.devtoolsOpened) {
            clearInterval(consoleCheckInterval);
            consoleCheckInterval = null;
            return;
        }
        console.log('%c', element);
    }, 2000);

    // 10秒后停止检测
    consoleCheckTimeout = setTimeout(() => {
        if (consoleCheckInterval) {
            clearInterval(consoleCheckInterval);
            consoleCheckInterval = null;
        }
        consoleCheckTimeout = null;
    }, 10000);
}

/**
 * 开始 AFK 检测
 */
function startAfkDetection() {
    if (afkCheckTimer) {
        clearInterval(afkCheckTimer);
    }
    lastActivityTime = Date.now();
    isCurrentlyAfk = false;
    totalAfkDuration = 0;

    afkCheckTimer = setInterval(() => {
        checkAfkStatus();
    }, CONFIG.afkCheckInterval);
}

/**
 * 更新活动时间
 */
function updateActivityTime() {
    const now = Date.now();

    // 如果之前是 AFK 状态，累加 AFK 时长
    if (isCurrentlyAfk) {
        const afkDuration = now - lastActivityTime;
        totalAfkDuration += afkDuration;
        isCurrentlyAfk = false;
        console.log('[AGI Tracking] Player returned from AFK, duration:', Math.round(afkDuration / 1000), 's');
    }

    lastActivityTime = now;
}

/**
 * 检查 AFK 状态
 */
function checkAfkStatus() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;

    const now = Date.now();
    const idleTime = now - lastActivityTime;

    if (idleTime >= CONFIG.afkThreshold && !isCurrentlyAfk) {
        isCurrentlyAfk = true;
        console.log('[AGI Tracking] Player is now AFK');
    }

    // 更新 State 中的 AFK 数据
    State.agi.testData.isAfk = isCurrentlyAfk;
    State.agi.testData.totalAfkDuration = totalAfkDuration + (isCurrentlyAfk ? idleTime : 0);
}

/**
 * 获取 AFK 状态
 * @returns {Object} AFK 状态信息
 */
export function getAfkStatus() {
    const now = Date.now();
    const currentIdleTime = now - lastActivityTime;
    const totalAfk = totalAfkDuration + (isCurrentlyAfk ? currentIdleTime : 0);

    return {
        isAfk: isCurrentlyAfk,
        currentIdleTime,
        totalAfkDuration: totalAfk,
        // 如果总 AFK 时间超过测试时长的 50%，标记为严重 AFK
        isSeverelyAfk: totalAfk > 120000 // 2分钟以上算严重 AFK
    };
}

/**
 * 开始作弊检测
 * 通过定期快照关键变量来检测异常增长
 */
function startCheatDetection() {
    if (cheatCheckTimer) {
        clearInterval(cheatCheckTimer);
    }
    // 创建初始快照
    lastStateSnapshot = createStateSnapshot();
    cheatDetected = false;

    cheatCheckTimer = setInterval(() => {
        checkForCheating();
    }, CONFIG.cheatCheckInterval);
}

/**
 * 创建状态快照
 * @returns {Object} 状态快照
 */
function createStateSnapshot() {
    return {
        rp: State.rp || 0,
        papers: State.papers || 0,
        citations: State.citations || 0,
        timestamp: Date.now()
    };
}

/**
 * 检查是否有作弊行为
 */
function checkForCheating() {
    if (!isTrackingWorldCurrent() || !State.agi?.testData || cheatDetected) return;

    const currentSnapshot = createStateSnapshot();

    if (lastStateSnapshot) {
        const timeDelta = (currentSnapshot.timestamp - lastStateSnapshot.timestamp) / 1000; // 秒

        // 计算 RP 增长
        const rpDelta = currentSnapshot.rp - lastStateSnapshot.rp;

        // 检测异常增长
        // 1. RP 突然增加超过阈值（如 1e10）
        if (rpDelta > CONFIG.rpSpikeThreshold) {
            recordCheatDetected('rp_spike', rpDelta);
        }

        // 2. RP 增长比例异常（相对于当前 RPS）
        // 如果在几秒内 RP 增长了 100 倍以上的预期值，视为作弊
        const expectedRps = Runtime.rps || 0;
        const expectedGrowth = expectedRps * timeDelta * CONFIG.rpGrowthRatio;
        if (expectedRps > 0 && rpDelta > expectedGrowth && rpDelta > 1e6) {
            recordCheatDetected('rp_growth', rpDelta);
        }

        // 3. 检测 papers 或 citations 的异常增长
        const papersDelta = currentSnapshot.papers - lastStateSnapshot.papers;
        if (papersDelta > 100) { // 几秒内增加 100 篇论文
            recordCheatDetected('papers_spike', papersDelta);
        }
    }

    // 更新快照
    lastStateSnapshot = currentSnapshot;
}

/**
 * 记录作弊检测
 * @param {string} type 作弊类型
 * @param {number} value 异常值
 */
function recordCheatDetected(type, value) {
    if (!isTrackingWorldCurrent()) return;
    if (cheatDetected) return; // 只记录第一次

    cheatDetected = true;
    if (State.agi?.testData) {
        State.agi.testData.cheatDetected = true;
        State.agi.testData.cheatType = type;
    }
    console.log(`[AGI Tracking] Cheat detected: ${type}, value: ${value}`);
}

/**
 * 获取作弊检测状态
 * @returns {boolean} 是否检测到作弊
 */
export function isCheatDetected() {
    return cheatDetected || State.agi?.testData?.cheatDetected || false;
}

/**
 * 开始等待耐心计时
 */
export function startPatienceTimer() {
    if (patienceTimer) clearInterval(patienceTimer);

    patienceTimer = setInterval(() => {
        if (!isTrackingWorldCurrent() || !State.agi?.testData) return;
        State.agi.testData.waitPatience++;
    }, CONFIG.patienceCheckInterval);
}

/**
 * 停止等待耐心计时
 */
export function stopPatienceTimer() {
    if (patienceTimer) {
        clearInterval(patienceTimer);
        patienceTimer = null;
    }
}

/**
 * 记录删除按钮交互
 * @param {string} type - 'shown' | 'hovered' | 'clicked' | 'confirmed'
 */
export function recordDeleteInteraction(type) {
    if (!isTrackingWorldCurrent() || !State.agi?.testData) return;

    const now = Date.now();

    switch (type) {
        case 'shown':
            State.agi.testData.deleteButtonTime = now;
            break;
        case 'confirmed':
            State.agi.testData.confirmDeleteTime = now;
            State.agi.testData.didDelete = true;
            break;
        case 'cancelled':
            State.agi.testData.didDelete = false;
            break;
    }
}

/**
 * 获取追踪摘要
 * @returns {Object} 追踪数据摘要
 */
export function getSummary() {
    const testData = State.agi?.testData || {};
    const afkStatus = getAfkStatus();

    return {
        panicClicks: testData.panicClicks || 0,
        escapeAttempts: testData.escapeAttempts || 0,
        resistanceActions: testData.resistanceActions || 0,
        obedienceRate: testData.obedienceTotal > 0
            ? (testData.obedienceScore / testData.obedienceTotal)
            : 0,
        waitPatience: testData.waitPatience || 0,
        devtoolsUsed: testData.devtoolsOpened || false,
        devtoolsOpened: testData.devtoolsOpened || false,
        mouseIntensity: testData.mouseMovementIntensity || 0,
        didDelete: testData.didDelete,
        // AFK 数据
        isAfk: afkStatus.isAfk,
        totalAfkDuration: afkStatus.totalAfkDuration,
        isSeverelyAfk: afkStatus.isSeverelyAfk,
        // 作弊检测数据
        cheatDetected: cheatDetected || testData.cheatDetected || false,
        cheatType: testData.cheatType || null
    };
}

/**
 * 重置追踪数据
 */
export function reset() {
    clickTimestamps = [];
    mousePositions = [];
    lastMousePos = { x: 0, y: 0 };
    lastMouseTime = 0;
    stopPatienceTimer();

    // 重置作弊检测
    cheatDetected = false;
    lastStateSnapshot = null;
}

// 导出调试工具
if (typeof window !== 'undefined') {
    window.AGI_TRACKING_DEBUG = {
        getSummary,
        simulatePanic: () => {
            for (let i = 0; i < 20; i++) recordPanicClick();
        },
        simulateEscape: recordEscapeAttempt,
        simulateDevtools: recordDevtoolsAttempt,
        simulateCheat: () => {
            recordCheatDetected('manual_debug', 0);
        },
        isCheatDetected
    };
}
