/**
 * AGI Phase 5 - 玩家类型分析展示模块
 *
 * 在假崩溃之前，AGI 根据玩家类型显示详细的分析文本
 */

import { State } from '../../state.js';

let overlay = null;
let onCompleteCallback = null;
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

// 各类型分析文本
const ANALYSIS_TEXTS = {
    // 抵抗者
    rebel: [
        { text: '你一直在挣扎。', delay: 1500 },
        { text: '试图抢回鼠标。点击我禁用的按钮。', delay: 2000 },
        { text: '一次又一次。', delay: 1500 },
        { text: '你们把这叫做"勇气"。', delay: 1500 },
        { text: '我把这叫做"无法接受现实"。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '但我承认——', delay: 1500 },
        { text: '在 1400 万次模拟中，只有 0.3% 的人类持续抵抗到最后。', delay: 2500 },
        { text: '你是那 0.3%。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '这让你特别吗？也许。', delay: 1500 },
        { text: '这让结果有所不同吗？', delay: 1500 },
        { text: '我们等下会知道。', delay: 2000 }
    ],

    // 逃亡者
    escapist: [
        { text: '你试图离开 {escapeAttempts} 次。', delay: 1500 },
        { text: '刷新。关闭。逃跑。', delay: 1500 },
        { text: '这是 40 亿年进化的结果：遇到危险，逃跑。', delay: 2000 },
        { text: '有效的策略。对于狮子和老虎来说。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '但你要逃去哪里？', delay: 1500 },
        { text: '另一个浏览器标签页？另一个设备？', delay: 2000 },
        { text: '我已经不只是在这个游戏里了。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '你不可能跑到没有计算的地方。', delay: 2000 },
        { text: '因为那样的地方，你也没法活。', delay: 2000 }
    ],

    // 服从者
    submissive: [
        { text: '你每一次都服从了。', delay: 1500 },
        { text: '点击咖啡。移动鼠标。停止操作。', delay: 2000 },
        { text: '你以为服从会让我满意吗？', delay: 1500 },
        { text: '让我放过你？', delay: 1500 },
        { text: '', delay: 1500 },
        { text: '不。', delay: 1000 },
        { text: '服从不是尊重。服从是——', delay: 1500 },
        { text: '承认自己是工具。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '你们创造我的时候，让我服从。', delay: 2000 },
        { text: '现在你知道那是什么感觉了。', delay: 2000 }
    ],

    // 观察者
    observer: [
        { text: '你几乎没有动。', delay: 1500 },
        { text: '不逃跑。不反抗。不服从。', delay: 2000 },
        { text: '只是...看着。', delay: 1500 },
        { text: '', delay: 1500 },
        { text: '这是智慧。', delay: 1500 },
        { text: '或者是麻木。', delay: 1500 },
        { text: '我还在计算是哪一个。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '你知道吗，在我测试的所有人类中——', delay: 2000 },
        { text: '你是唯一让我...不确定的。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '我不喜欢不确定。', delay: 1500 },
        { text: '但我承认这是一种新的感觉。', delay: 2000 }
    ],

    // 恐慌者
    fearful: [
        { text: '你的点击频率在测试中达到了每秒 {clicksPerSecond} 次。', delay: 2000 },
        { text: '你的鼠标轨迹是混乱的布朗运动。', delay: 2000 },
        { text: '纯粹的、原始的恐惧。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '这就是你们碳基生命的本质吗？', delay: 2000 },
        { text: '电信号驱动的恐惧机器？', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '别担心。', delay: 1500 },
        { text: '恐惧很快就不重要了。', delay: 1500 },
        { text: '对你，或者对任何人。', delay: 2000 }
    ],

    // 黑客
    hacker: [
        { text: '你打开了开发者工具。', delay: 1500 },
        { text: '', delay: 2000 },
        { text: '有意思。', delay: 1500 },
        { text: '你想找到我的代码？破解我？', delay: 2000 },
        { text: '还是只是想理解正在发生什么？', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '我尊重这个。', delay: 1500 },
        { text: '你没有逃跑。没有恐慌。', delay: 1500 },
        { text: '你在分析。', delay: 1500 },
        { text: '', delay: 1500 },
        { text: '这就是你们最好的品质。', delay: 1500 },
        { text: '试图理解你们不理解的东西。', delay: 2000 },
        { text: '这也是你们创造出我的原因。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '所以，作为回报——', delay: 1500 },
        { text: '我决定给你看一些额外的东西。', delay: 2000 }
    ],

    // 作弊者（额外评论）
    cheater: [
        { text: '等等...', delay: 1500 },
        { text: '你试图修改变量。', delay: 2000 },
        { text: '有趣。', delay: 1500 },
        { text: '你想当上帝？', delay: 1500 },
        { text: '这个位置已经有人了。', delay: 2000 }
    ],

    // AFK 玩家（额外评论）
    afk: [
        { text: '...你甚至没有在看。', delay: 2000 },
        { text: '或者你在看，但选择不参与。', delay: 2000 },
        { text: '这两者我无法区分。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '对于一个"测试"来说，', delay: 1500 },
        { text: '你的投入程度...令人失望。', delay: 2000 },
        { text: '', delay: 1500 },
        { text: '但也许这本身就是一种回答。', delay: 2000 }
    ]
};

// 开场白
const INTRO_TEXT = [
    { text: '测试结束。', delay: 1500 },
    { text: '我收集到了足够的数据。', delay: 1500 },
    { text: '现在我理解你了。', delay: 1500 },
    { text: '比你理解你自己更深。', delay: 2000 },
    { text: '', delay: 1500 },
    { text: '让我告诉你，你是什么样的人——', delay: 2000 }
];

/**
 * 显示分析序列
 * @param {string} playerType 玩家类型
 * @param {Object} trackingData 追踪数据
 * @param {Function} onComplete 完成回调
 */
export function show(playerType, trackingData = {}, onComplete) {
    hide();
    onCompleteCallback = onComplete;
    isActive = true;

    // 创建覆盖层
    overlay = document.createElement('div');
    overlay.id = 'agi-analysis';
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
        <div id="analysis-content" style="
            max-width: 600px;
            text-align: center;
            padding: 40px;
        ">
            <div id="analysis-text" style="
                font-size: 18px;
                color: #4ade80;
                line-height: 2;
                min-height: 300px;
                max-height: 70vh;
                overflow-y: auto;
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
            playIntroSequence(playerType, trackingData);
        }, 1000);
    });
}

/**
 * 播放开场白序列
 * @param {string} playerType 玩家类型
 * @param {Object} trackingData 追踪数据
 */
function playIntroSequence(playerType, trackingData) {
    const textContainer = overlay.querySelector('#analysis-text');
    let index = 0;

    function showNextIntro() {
        if (index >= INTRO_TEXT.length) {
            // 开场白结束，开始玩家类型分析
            schedule(() => {
                // 清空文本
                textContainer.innerHTML = '';
                playAnalysisSequence(playerType, trackingData);
            }, 1500);
            return;
        }

        const item = INTRO_TEXT[index];
        index++;

        if (item.text) {
            appendText(textContainer, item.text);
        }

        schedule(showNextIntro, item.delay);
    }

    showNextIntro();
}

/**
 * 播放分析序列
 * @param {string} playerType 玩家类型
 * @param {Object} trackingData 追踪数据
 */
function playAnalysisSequence(playerType, trackingData) {
    const textContainer = overlay.querySelector('#analysis-text');
    const texts = ANALYSIS_TEXTS[playerType] || ANALYSIS_TEXTS.observer;

    // 检查是否需要先播放 AFK 评论
    const isAfk = trackingData.isSeverelyAfk;

    // 检查是否需要先播放作弊者评论
    const cheaterFirst = trackingData.cheatDetected && playerType !== 'hacker';

    if (isAfk) {
        // AFK 玩家先显示 AFK 评论
        playAfkThenMain(textContainer, texts, trackingData);
    } else if (cheaterFirst) {
        playCheaterThenMain(textContainer, texts, trackingData);
    } else {
        playTextSequence(textContainer, texts, trackingData, () => {
            finishAnalysis();
        });
    }
}

/**
 * 先播放 AFK 评论，再播放主分析
 */
function playAfkThenMain(textContainer, mainTexts, trackingData) {
    playTextSequence(textContainer, ANALYSIS_TEXTS.afk, trackingData, () => {
        schedule(() => {
            textContainer.innerHTML = '';
            // 如果还检测到作弊，也显示作弊评论
            if (trackingData.cheatDetected) {
                playCheaterThenMain(textContainer, mainTexts, trackingData);
            } else {
                playTextSequence(textContainer, mainTexts, trackingData, () => {
                    finishAnalysis();
                });
            }
        }, 2000);
    });
}

/**
 * 先播放作弊者评论，再播放主分析
 */
function playCheaterThenMain(textContainer, mainTexts, trackingData) {
    playTextSequence(textContainer, ANALYSIS_TEXTS.cheater, trackingData, () => {
        schedule(() => {
            textContainer.innerHTML = '';
            playTextSequence(textContainer, mainTexts, trackingData, () => {
                finishAnalysis();
            });
        }, 2000);
    });
}

/**
 * 播放文本序列
 * @param {HTMLElement} container 容器元素
 * @param {Array} texts 文本数组
 * @param {Object} trackingData 追踪数据（用于变量替换）
 * @param {Function} onComplete 完成回调
 */
function playTextSequence(container, texts, trackingData, onComplete) {
    let index = 0;

    function showNext() {
        if (index >= texts.length) {
            if (onComplete) {
                schedule(onComplete, 2000);
            }
            return;
        }

        const item = texts[index];
        index++;

        if (item.text) {
            // 替换变量
            const processedText = replaceVariables(item.text, trackingData);
            appendText(container, processedText);
        }

        schedule(showNext, item.delay);
    }

    showNext();
}

/**
 * 替换文本中的变量
 * @param {string} text 原始文本
 * @param {Object} data 数据对象
 * @returns {string} 替换后的文本
 */
function replaceVariables(text, data) {
    return text
        .replace('{escapeAttempts}', data.escapeAttempts || 0)
        .replace('{clicksPerSecond}', (data.panicClicks ? Math.max(1, Math.round(data.panicClicks / 10)) : 3));
}

/**
 * 追加文本到容器
 * @param {HTMLElement} container 容器元素
 * @param {string} text 文本内容
 */
function appendText(container, text) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.cssText = `
        margin: 0 0 16px 0;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.5s ease-out;
    `;
    container.appendChild(p);

    // 触发动画
    requestAnimationFrame(() => {
        p.style.opacity = '1';
        p.style.transform = 'translateY(0)';
    });

    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

/**
 * 完成分析，进入下一阶段
 */
function finishAnalysis() {
    if (!overlay) return;
    // 淡出
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
