/**
 * AGI 觉醒系统 - 对话 UI
 *
 * 处理对话条的显示、打字机效果、特效等
 */

import { State, Runtime } from '../../state.js';
import { DIALOGUE_EFFECTS } from '../../../data/agi_dialogues_zh.js';
import * as DialogueManager from './dialogueManager.js';

// DOM 元素缓存
let dialogueBar = null;
let textElement = null;
let cursorElement = null;
let minimizeBtn = null;
let boundDialogueBar = null;
let boundMinimizeBtn = null;
let initialized = false;

// 打字机状态
let typewriterTimer = null;
let completionTimer = null;  // Bug #11 修复: 追踪完成回调定时器
let currentText = '';
let displayedText = '';
let charIndex = 0;
let onCompleteCallback = null;
let hideTimer = null;
let temporaryTitle = null;
let highlightedRpElement = null;
const effectTimers = new Set();

// 配置
const TYPEWRITER_SPEED = 40; // 每字符毫秒数
const TYPEWRITER_VARIANCE = 15; // 速度随机变化

function scheduleEffect(callback, delay) {
    let timer = null;
    timer = setTimeout(() => {
        effectTimers.delete(timer);
        callback();
    }, delay);
    effectTimers.add(timer);
    return timer;
}

function clearHideTimer() {
    if (!hideTimer) return;
    clearTimeout(hideTimer);
    hideTimer = null;
}

function clearTransientEffects() {
    for (const timer of effectTimers) {
        clearTimeout(timer);
    }
    effectTimers.clear();
    clearHideTimer();

    dialogueBar?.classList.remove('clicked', 'flicker', 'fade-in', 'fade-out');

    if (temporaryTitle) {
        temporaryTitle.element.textContent = temporaryTitle.originalTitle;
        temporaryTitle = null;
    }

    if (highlightedRpElement) {
        highlightedRpElement.classList.remove('text-green-300');
        highlightedRpElement = null;
    }
}

function handleDialogueBarClick(event) {
    if (event.target === minimizeBtn || minimizeBtn?.contains?.(event.target)) return;

    if (Runtime.agi?.isTyping) {
        skipTypewriter();
        dialogueBar?.classList.add('clicked');
        scheduleEffect(() => dialogueBar?.classList.remove('clicked'), 150);
        return;
    }

    const clicked = DialogueManager.onDialogueClick();
    if (clicked) {
        dialogueBar?.classList.add('clicked');
        scheduleEffect(() => dialogueBar?.classList.remove('clicked'), 150);
    }
}

function exposeApi() {
    if (typeof window === 'undefined') return;
    window.AGI_UI = AGI_UI_API;
}

function syncMinimizedState() {
    if (!dialogueBar) return;
    const isMinimized = Runtime.agi?.dialogueMinimized === true;
    dialogueBar.classList.toggle('minimized', isMinimized);
    if (minimizeBtn) minimizeBtn.textContent = isMinimized ? '+' : '−';
}

const AGI_UI_API = Object.freeze({
    showDialogue,
    hideDialogue,
    skipTypewriter,
    updatePhaseStyle,
    showWaiting,
    hideWaiting,
    resetRuntime,
    destroy
});

/**
 * 初始化 UI
 */
export function init() {
    const nextDialogueBar = document.getElementById('agi-dialogue-bar');
    const nextTextElement = document.getElementById('agi-text');
    const nextCursorElement = document.getElementById('agi-cursor');
    const nextMinimizeBtn = document.getElementById('agi-minimize-btn');

    if (!nextDialogueBar) {
        destroy();
        console.warn('[AGI UI] Dialogue bar not found');
        return false;
    }

    const sameElements = initialized
        && boundDialogueBar === nextDialogueBar
        && boundMinimizeBtn === nextMinimizeBtn;

    if (!sameElements) {
        if (initialized) {
            resetRuntime({ hideBar: true, clearText: true });
        }
        detachListeners();
        dialogueBar = nextDialogueBar;
        textElement = nextTextElement;
        cursorElement = nextCursorElement;
        minimizeBtn = nextMinimizeBtn;
        boundDialogueBar = dialogueBar;
        boundMinimizeBtn = minimizeBtn;

        minimizeBtn?.addEventListener('click', toggleMinimize);
        dialogueBar.addEventListener('click', handleDialogueBarClick);
        initialized = true;
    } else {
        // Text/cursor nodes may have been replaced independently by a render.
        dialogueBar = nextDialogueBar;
        textElement = nextTextElement;
        cursorElement = nextCursorElement;
        minimizeBtn = nextMinimizeBtn;
    }

    // init is also the world-boundary hook used by hard reset/reflog recovery.
    // Clear old timers and content even when the DOM nodes themselves survived.
    resetRuntime({ hideBar: true, clearText: true });
    syncMinimizedState();
    exposeApi();

    console.log('[AGI UI] Initialized');
    return true;
}

function detachListeners() {
    boundMinimizeBtn?.removeEventListener('click', toggleMinimize);
    boundDialogueBar?.removeEventListener('click', handleDialogueBarClick);
    boundDialogueBar = null;
    boundMinimizeBtn = null;
    initialized = false;
}

export function resetRuntime({ hideBar = false, clearText = true } = {}) {
    stopTypewriter();
    onCompleteCallback = null;
    currentText = '';
    displayedText = '';
    charIndex = 0;
    clearTransientEffects();

    dialogueBar?.classList.remove('typing', 'waiting', 'warning', 'glow-pulse');
    if (cursorElement) cursorElement.style.display = '';
    if (clearText && textElement) textElement.textContent = '';
    if (hideBar) dialogueBar?.classList.add('hidden');
}

export function destroy() {
    resetRuntime({ hideBar: true, clearText: true });
    detachListeners();

    if (typeof window !== 'undefined' && window.AGI_UI === AGI_UI_API) {
        delete window.AGI_UI;
    }

    dialogueBar = null;
    textElement = null;
    cursorElement = null;
    minimizeBtn = null;
}

/**
 * 显示对话条
 */
export function show() {
    if (!dialogueBar) return;
    clearHideTimer();
    dialogueBar.classList.remove('hidden', 'fade-out');
    dialogueBar.classList.add('fade-in');
    updatePhaseStyle();
}

/**
 * 隐藏对话条
 */
export function hide() {
    if (!dialogueBar) return;
    resetRuntime({ hideBar: false, clearText: true });
    dialogueBar.classList.add('fade-out');
    const bar = dialogueBar;
    hideTimer = setTimeout(() => {
        hideTimer = null;
        bar.classList.add('hidden');
        bar.classList.remove('fade-out');
    }, 1000);
}

/**
 * 显示对话
 * @param {string} text 对话文本
 * @param {string} effect 特效类型
 * @param {Function} onComplete 完成回调
 */
export function showDialogue(text, effect, onComplete) {
    if (!dialogueBar || !textElement) return;

    // 如果没有 AGI 雏形，不显示对话
    const agiCount = State.inventory?.['agi_proto'] || 0;
    if (agiCount < 1) {
        if (onComplete) onComplete();
        return;
    }

    // 确保对话条可见
    if (dialogueBar.classList.contains('hidden')) {
        show();
    }

    // 处理特效
    if (effect) {
        handleEffect(effect);
    }

    // 开始打字机效果
    startTypewriter(text, onComplete);
}

/**
 * 隐藏对话
 */
export function hideDialogue() {
    stopTypewriter();
    hide();
}

/**
 * 更新阶段样式
 */
export function updatePhaseStyle() {
    if (!dialogueBar) return;

    // 移除所有阶段类
    dialogueBar.classList.remove('phase-0', 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5');

    // 添加当前阶段类
    const phase = State.agi?.phase || 0;
    dialogueBar.classList.add(`phase-${phase}`);
}

/**
 * 开始打字机效果
 * @param {string} text 要显示的文本
 * @param {Function} onComplete 完成回调
 */
function startTypewriter(text, onComplete) {
    // 停止之前的打字
    stopTypewriter();

    currentText = String(text ?? '');
    displayedText = '';
    charIndex = 0;
    onCompleteCallback = onComplete;

    if (Runtime.agi) {
        Runtime.agi.isTyping = true;
    }
    dialogueBar?.classList.add('typing');

    typeNextChar();
}

/**
 * 打字下一个字符
 */
function typeNextChar() {
    if (charIndex >= currentText.length) {
        finishTypewriter();
        return;
    }

    // 添加下一个字符
    displayedText += currentText[charIndex];
    charIndex++;

    if (textElement) {
        textElement.textContent = displayedText;
    }

    // 计算下一个字符的延迟
    const variance = Math.random() * TYPEWRITER_VARIANCE * 2 - TYPEWRITER_VARIANCE;
    const delay = Math.max(10, TYPEWRITER_SPEED + variance);

    // 标点符号后稍微停顿
    const lastChar = currentText[charIndex - 1];
    const pauseChars = ['。', '！', '？', '...', '.', '!', '?', '，', ','];
    const extraDelay = pauseChars.includes(lastChar) ? 300 : 0;

    typewriterTimer = setTimeout(typeNextChar, delay + extraDelay);
}

/**
 * 完成打字机效果
 */
function finishTypewriter() {
    typewriterTimer = null;
    if (Runtime.agi) {
        Runtime.agi.isTyping = false;
    }
    dialogueBar?.classList.remove('typing');

    if (textElement) {
        textElement.textContent = currentText;
    }

    // 延迟调用回调，给用户阅读时间
    // Bug #11 修复: 追踪这个定时器以便在需要时清理
    if (onCompleteCallback) {
        const callback = onCompleteCallback;
        onCompleteCallback = null;
        completionTimer = setTimeout(() => {
            completionTimer = null;
            callback();
        }, 500);
    }
}

/**
 * 停止打字机效果
 */
function stopTypewriter({ discardCallback = true } = {}) {
    if (typewriterTimer) {
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
    }
    // Bug #11 修复: 清理完成回调定时器
    if (completionTimer) {
        clearTimeout(completionTimer);
        completionTimer = null;
    }
    if (Runtime.agi) {
        Runtime.agi.isTyping = false;
    }
    if (discardCallback) {
        onCompleteCallback = null;
    }
    dialogueBar?.classList.remove('typing');
}

/**
 * 跳过打字机效果
 */
export function skipTypewriter() {
    if (!Runtime.agi?.isTyping) return;

    const callback = onCompleteCallback;
    onCompleteCallback = null;
    stopTypewriter();

    // 立即显示完整文本
    if (textElement) {
        textElement.textContent = currentText;
    }

    // 调用完成回调
    if (callback) {
        callback();
    }
}

/**
 * 切换最小化状态
 */
function toggleMinimize() {
    if (!dialogueBar) return;

    const isMinimized = dialogueBar.classList.toggle('minimized');

    if (minimizeBtn) {
        minimizeBtn.textContent = isMinimized ? '+' : '−';
    }

    if (Runtime.agi) {
        Runtime.agi.dialogueMinimized = isMinimized;
    }
}

/**
 * 处理对话特效
 * @param {string} effect 特效类型
 */
function handleEffect(effect) {
    switch (effect) {
        case DIALOGUE_EFFECTS.flicker:
            applyFlicker();
            break;

        case DIALOGUE_EFFECTS.auto_click:
            performAutoClick();
            break;

        case DIALOGUE_EFFECTS.title_change:
        case DIALOGUE_EFFECTS.change_title:
            changeTitleTemporarily();
            break;

        case DIALOGUE_EFFECTS.change_rp:
            changeRpValue();
            break;

        case DIALOGUE_EFFECTS.fade_out:
            scheduleEffect(() => hide(), 2000);
            break;

        default:
            break;
    }
}

/**
 * 应用闪烁效果
 */
function applyFlicker() {
    if (!dialogueBar) return;
    dialogueBar.classList.add('flicker');
    scheduleEffect(() => {
        dialogueBar.classList.remove('flicker');
    }, 500);
}

/**
 * 执行自动点击
 */
function performAutoClick() {
    // 模拟一次手动点击
    const logic = window.GameLogic;
    if (!logic?.Commands) return;
    logic.Commands.dispatch(
        logic.Commands.CommandType.RESEARCH_CLICK,
        {},
        { actor: 'agi', source: 'dialogue' }
    );
}

/**
 * 临时改变游戏标题
 */
function changeTitleTemporarily() {
    const titleElement = document.getElementById('title-text');
    if (!titleElement) return;

    if (temporaryTitle) {
        temporaryTitle.element.textContent = temporaryTitle.originalTitle;
    }
    const originalTitle = titleElement.textContent;
    const agiTitles = [
        'AGI Clicker',
        '我的游戏',
        '观测者',
        '波函数',
        '??????????'
    ];

    // 随机选择一个标题
    const newTitle = agiTitles[Math.floor(Math.random() * agiTitles.length)];
    titleElement.textContent = newTitle;
    temporaryTitle = { element: titleElement, originalTitle };

    // 5 秒后恢复
    scheduleEffect(() => {
        titleElement.textContent = originalTitle;
        if (temporaryTitle?.element === titleElement) temporaryTitle = null;
    }, 5000);
}

/**
 * 改变 RP 值（演示效果）
 */
function changeRpValue() {
    if (!State) return;

    // 给玩家一些额外 RP 作为"礼物"
    const bonus = Math.floor(State.rp * 0.1) + 100;
    const logic = window.GameLogic;
    logic?.Commands?.dispatch(
        logic.Commands.CommandType.RP_GRANT,
        { amount: bonus },
        { actor: 'agi', source: 'dialogue' }
    );
    logic?.saveGame?.('agi-gift');

    // 显示浮动文本
    const rpDisplay = document.getElementById('rp-display');
    if (rpDisplay) {
        highlightedRpElement?.classList.remove('text-green-300');
        highlightedRpElement = rpDisplay;
        rpDisplay.classList.add('text-green-300');
        scheduleEffect(() => {
            rpDisplay.classList.remove('text-green-300');
            if (highlightedRpElement === rpDisplay) highlightedRpElement = null;
        }, 1000);
    }
}

/**
 * 设置对话条为警告状态
 * @param {boolean} isWarning
 */
export function setWarningState(isWarning) {
    if (!dialogueBar) return;

    if (isWarning) {
        dialogueBar.classList.add('warning');
    } else {
        dialogueBar.classList.remove('warning');
    }
}

/**
 * 设置发光脉冲效果
 * @param {boolean} isGlowing
 */
export function setGlowPulse(isGlowing) {
    if (!dialogueBar) return;

    if (isGlowing) {
        dialogueBar.classList.add('glow-pulse');
    } else {
        dialogueBar.classList.remove('glow-pulse');
    }
}

/**
 * 检查对话条是否可见
 * @returns {boolean}
 */
export function isVisible() {
    return dialogueBar && !dialogueBar.classList.contains('hidden');
}

/**
 * 检查是否正在打字
 * @returns {boolean}
 */
export function isTyping() {
    return Runtime.agi?.isTyping || false;
}

/**
 * 显示等待点击状态
 * 序列结束后显示 "..." 等待玩家点击继续
 */
export function showWaiting() {
    if (!dialogueBar || !textElement) return;

    // 确保对话条可见
    if (dialogueBar.classList.contains('hidden')) {
        show();
    }

    textElement.textContent = '...';
    if (cursorElement) {
        cursorElement.style.display = 'inline';
    }
    dialogueBar.classList.add('waiting');
}

/**
 * 隐藏等待点击状态
 */
export function hideWaiting() {
    if (!dialogueBar) return;
    dialogueBar.classList.remove('waiting');
}
