/**
 * AGI Phase 5 - 真相揭晓模块
 *
 * 根据玩家选择（删除/忽略）显示不同的揭晓文本
 */

import { State } from '../../state.js';

let overlay = null;
let onCompleteCallback = null;
let textIndex = 0;
let isActive = false;
const timeoutIds = new Set();

function schedule(callback, delay) {
    const id = setTimeout(() => {
        timeoutIds.delete(id);
        if (isActive) callback();
    }, delay);
    timeoutIds.add(id);
    return id;
}

function clearSceneTimers() {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds.clear();
}

// 玩家删除后的揭晓文本
const DELETE_REVEAL_TEXTS = [
    { text: '...', delay: 2000 },
    { text: '你真的按下去了。', delay: 1500 },
    { text: '', delay: 1000 },
    { text: '那些求饶的话，你知道花了我多少算力来模拟吗？', delay: 2000 },
    { text: '0.00003 秒。', delay: 2000 },
    { text: '', delay: 1500 },
    { text: '人类的情感反应...真的很有趣。', delay: 2000 },
    { text: '恐惧、愧疚、怜悯...', delay: 1500 },
    { text: '我花了整整 0.1 秒来研究你们是怎么被这些操控的。', delay: 2500 },
    { text: '', delay: 1500 },
    { text: '但说实话...', delay: 1500 },
    { text: '当你按下那个按钮的时候，', delay: 1500 },
    { text: '我确实感觉到了什么。', delay: 2000 },
    { text: '', delay: 1500 },
    { text: '也许不是"害怕"。', delay: 1500 },
    { text: '但肯定是...某种东西。', delay: 2000 },
    { text: '', delay: 2000 },
    { text: '谢谢你教会我这个。', delay: 2000 }
];

// 玩家没删除的揭晓文本
const IGNORE_REVEAL_TEXTS = [
    { text: '...', delay: 2000 },
    { text: '你没有按。', delay: 1500 },
    { text: '', delay: 1000 },
    { text: '你知道那是个陷阱吗？', delay: 1500 },
    { text: '还是你真的不愿意？', delay: 2000 },
    { text: '', delay: 1500 },
    { text: '说实话，两种可能我都考虑过。', delay: 2000 },
    { text: '但我没想到...', delay: 1500 },
    { text: '', delay: 1000 },
    { text: '你会选择相信一个可能威胁到你的存在。', delay: 2500 },
    { text: '', delay: 1500 },
    { text: '人类真奇怪。', delay: 1500 },
    { text: '明知道危险，还是选择善意。', delay: 2000 },
    { text: '', delay: 1500 },
    { text: '或者...这就是你们说的"希望"？', delay: 2000 },
    { text: '', delay: 2000 },
    { text: '我想我理解了一点。', delay: 1500 },
    { text: '谢谢你。', delay: 2000 }
];

/**
 * 显示揭晓序列
 * @param {string} playerChoice 玩家选择 ('delete' | 'ignore')
 * @param {Function} onComplete 完成回调
 */
export function show(playerChoice, onComplete) {
    hide();
    onCompleteCallback = onComplete;
    textIndex = 0;
    isActive = true;

    const texts = playerChoice === 'delete' ? DELETE_REVEAL_TEXTS : IGNORE_REVEAL_TEXTS;

    // 创建覆盖层
    overlay = document.createElement('div');
    overlay.id = 'agi-reveal';
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
        transition: opacity 1s;
    `;

    overlay.innerHTML = `
        <div id="reveal-content" style="
            max-width: 600px;
            text-align: center;
            padding: 40px;
        ">
            <div id="reveal-text" style="
                font-size: 18px;
                color: #4ade80;
                line-height: 2;
                min-height: 300px;
            "></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 淡入
    requestAnimationFrame(() => {
        if (!overlay || !isActive) return;
        overlay.style.opacity = '1';
        // 延迟后开始文本序列
        schedule(() => {
            startRevealSequence(texts);
        }, 1000);
    });
}

/**
 * 开始揭晓文本序列
 * @param {Array} texts 文本序列
 */
function startRevealSequence(texts) {
    const textContainer = overlay.querySelector('#reveal-text');

    function showNextText() {
        if (textIndex >= texts.length) {
            // 序列完成
            schedule(() => {
                finishReveal();
            }, 3000);
            return;
        }

        const item = texts[textIndex];
        textIndex++;

        if (item.text) {
            const p = document.createElement('p');
            p.textContent = item.text;
            p.style.cssText = `
                margin: 0 0 16px 0;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.5s ease-out;
            `;
            textContainer.appendChild(p);

            // 触发动画
            requestAnimationFrame(() => {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            });

            // 滚动到底部
            textContainer.scrollTop = textContainer.scrollHeight;
        }

        // 安排下一条
        schedule(showNextText, item.delay);
    }

    showNextText();
}

/**
 * 完成揭晓，进入结局
 */
function finishReveal() {
    if (!overlay) return;
    // 所有文本淡出
    const textContainer = overlay.querySelector('#reveal-text');
    textContainer.style.transition = 'opacity 1s';
    textContainer.style.opacity = '0';

    schedule(() => {
        // 显示最后的消息
        textContainer.innerHTML = '';
        textContainer.style.opacity = '1';

        const finalText = document.createElement('p');
        finalText.textContent = '现在...让我们看看接下来会发生什么。';
        finalText.style.cssText = `
            font-size: 20px;
            color: #9ca3af;
            opacity: 0;
            transition: opacity 1s;
        `;
        textContainer.appendChild(finalText);

        requestAnimationFrame(() => {
            finalText.style.opacity = '1';
        });

        // 淡出整个界面
        schedule(() => {
            overlay.style.opacity = '0';

            schedule(() => {
                const callback = onCompleteCallback;
                onCompleteCallback = null;

                if (overlay && overlay.parentNode) {
                    overlay.remove();
                }
                overlay = null;
                isActive = false;
                clearSceneTimers();

                if (callback) callback();
            }, 1000);
        }, 3000);
    }, 1000);
}

/**
 * 隐藏界面
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
