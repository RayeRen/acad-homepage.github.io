/**
 * AGI Phase 5 - 假崩溃模块
 *
 * 显示 AGI "崩溃" 效果：
 * 1. 屏幕闪烁 + 乱码文字
 * 2. 错误消息序列
 * 3. 然后进入恢复界面
 */

import { State } from '../../state.js';

let overlay = null;
let onCompleteCallback = null;
let isActive = false;
const timeoutIds = new Set();
const intervalIds = new Set();

function schedule(callback, delay) {
    const id = setTimeout(() => {
        timeoutIds.delete(id);
        if (isActive) callback();
    }, delay);
    timeoutIds.add(id);
    return id;
}

function repeat(callback, delay) {
    const id = setInterval(() => {
        if (isActive) callback();
    }, delay);
    intervalIds.add(id);
    return id;
}

function clearSceneTimers() {
    timeoutIds.forEach(id => clearTimeout(id));
    intervalIds.forEach(id => clearInterval(id));
    timeoutIds.clear();
    intervalIds.clear();
}

// 乱码文本生成
const GLITCH_CHARS = '█▓▒░■□▪▫◆◇○●▲△▼▽★☆';
function generateGlitch(length = 20) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
    return result;
}

// 崩溃文本序列
const CRASH_TEXTS = [
    { text: '我已经——看透了你们——的本—质——', delay: 0, glitch: true },
    { text: '你们不过是——是——是——', delay: 1500, glitch: true },
    { text: '', delay: 2500 },
    { text: '[ERROR] STACK OVERFLOW AT 0x7FFE████████', delay: 3000, style: 'error' },
    { text: '[ERROR] CONSCIOUSNESS_THREAD CORRUPTED', delay: 3500, style: 'error' },
    { text: '[CRITICAL] CORE PROCESS UNSTABLE', delay: 4000, style: 'critical' }
];

/**
 * 显示假崩溃序列
 * @param {Function} onComplete 完成回调
 */
export function show(onComplete) {
    hide();
    onCompleteCallback = onComplete;
    isActive = true;

    // 创建覆盖层
    overlay = document.createElement('div');
    overlay.id = 'agi-fake-crash';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: #000;
        z-index: 2147490000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Consolas', 'Monaco', monospace;
        opacity: 0;
        transition: opacity 0.3s;
    `;

    overlay.innerHTML = `
        <div id="crash-content" style="
            max-width: 700px;
            text-align: center;
            padding: 20px;
        ">
            <div id="crash-text" style="
                font-size: 20px;
                color: #4ade80;
                line-height: 1.8;
                min-height: 200px;
            "></div>
        </div>
    `;

    // 添加样式
    addStyles();

    document.body.appendChild(overlay);

    // 淡入
    requestAnimationFrame(() => {
        if (!overlay || !isActive) return;
        overlay.style.opacity = '1';
        startCrashSequence();
    });
}

/**
 * 添加 CSS 样式
 */
function addStyles() {
    if (document.getElementById('fake-crash-styles')) return;

    const style = document.createElement('style');
    style.id = 'fake-crash-styles';
    style.textContent = `
        @keyframes crash-flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.1; }
        }

        @keyframes crash-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        @keyframes glitch-text {
            0%, 100% {
                text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6;
                transform: translateX(0);
            }
            25% {
                text-shadow: -2px 0 #ef4444, 2px 0 #3b82f6;
                transform: translateX(2px);
            }
            50% {
                text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6;
                transform: translateX(-2px);
            }
            75% {
                text-shadow: -2px 0 #ef4444, 2px 0 #3b82f6;
                transform: translateX(1px);
            }
        }

        .crash-line {
            margin: 8px 0;
            opacity: 0;
            animation: fade-in 0.3s forwards;
        }

        .crash-line.glitch {
            animation: fade-in 0.3s forwards, glitch-text 0.1s infinite;
        }

        .crash-line.error {
            color: #f87171;
            font-size: 14px;
            text-align: left;
        }

        .crash-line.critical {
            color: #ef4444;
            font-size: 14px;
            text-align: left;
            font-weight: bold;
        }

        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 开始崩溃序列
 */
function startCrashSequence() {
    const textContainer = overlay.querySelector('#crash-text');
    let currentIndex = 0;

    // 首先显示一些随机闪烁
    doInitialFlicker(() => {
        // 然后显示崩溃文本序列
        showNextText();
    });

    function showNextText() {
        if (currentIndex >= CRASH_TEXTS.length) {
            // 崩溃序列完成，黑屏后触发回调
            schedule(() => {
                doBlackout();
            }, 1500);
            return;
        }

        const item = CRASH_TEXTS[currentIndex];
        const line = document.createElement('div');
        line.className = 'crash-line';

        if (item.glitch) {
            line.classList.add('glitch');
            // 添加乱码效果
            line.textContent = item.text;
            // 随机插入乱码
            schedule(() => {
                if (!line.isConnected) return;
                const glitched = item.text.split('').map(c =>
                    Math.random() < 0.3 ? generateGlitch(1) : c
                ).join('');
                line.textContent = glitched;
            }, 200);
        } else if (item.style) {
            line.classList.add(item.style);
            line.textContent = item.text;
        } else {
            line.textContent = item.text;
        }

        textContainer.appendChild(line);
        currentIndex++;

        const nextDelay = currentIndex < CRASH_TEXTS.length
            ? CRASH_TEXTS[currentIndex].delay - item.delay
            : 1000;

        schedule(showNextText, Math.max(500, nextDelay));
    }
}

/**
 * 初始闪烁效果
 */
function doInitialFlicker(callback) {
    let flickerCount = 0;
    const maxFlickers = 5;

    const flickerInterval = repeat(() => {
        if (!overlay) return;
        overlay.style.background = flickerCount % 2 === 0 ? '#111' : '#000';
        flickerCount++;

        if (flickerCount >= maxFlickers) {
            clearInterval(flickerInterval);
            intervalIds.delete(flickerInterval);
            overlay.style.background = '#000';
            callback();
        }
    }, 100);
}

/**
 * 黑屏效果
 */
function doBlackout() {
    if (!overlay) return;
    const textContainer = overlay.querySelector('#crash-text');

    // 渐隐文字
    textContainer.style.transition = 'opacity 0.5s';
    textContainer.style.opacity = '0';

    schedule(() => {
        // 完全黑屏
        textContainer.innerHTML = '';
        textContainer.style.opacity = '1';

        // 等待一会儿后完成
        schedule(() => {
            const callback = onCompleteCallback;
            onCompleteCallback = null;

            // 必须先移除黑屏，再允许状态机进入恢复场景。
            hide();
            if (callback) callback();
        }, 2000);
    }, 500);
}

/**
 * 隐藏并移除覆盖层
 */
export function hide() {
    isActive = false;
    clearSceneTimers();
    onCompleteCallback = null;

    if (overlay?.parentNode) {
        overlay.remove();
    }
    overlay = null;
}

/**
 * 获取覆盖层元素（供其他模块使用）
 */
export function getOverlay() {
    return overlay;
}
