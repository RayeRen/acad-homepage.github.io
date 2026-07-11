/**
 * AGI 结局 - 湮灭
 *
 * 当玩家选择"删除" AGI 时触发
 * AGI 被删除，游戏数据清零，从头开始
 */

import { State, Runtime } from '../../state.js';

/**
 * 获取当前语言的结局文本
 * @returns {Object} 结局文本对象
 */
function getTexts() {
    return Runtime.agiDialogues?.endings?.annihilation || {};
}

let overlay = null;

/**
 * 显示湮灭结局
 * @param {Object} context 上下文数据
 */
export function show(context = {}) {
    const playerType = context.playerType || State.agi?.playerType || 'observer';

    // 创建全屏覆盖层
    overlay = document.createElement('div');
    overlay.id = 'agi-ending-annihilation';
    overlay.className = 'agi-ending-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: #000;
        z-index: 2147500000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Consolas', 'Monaco', monospace;
        color: #ef4444;
        opacity: 0;
        transition: opacity 1s;
    `;

    overlay.innerHTML = `
        <div id="ending-text" style="
            max-width: 600px;
            text-align: center;
            font-size: 20px;
            line-height: 1.8;
        "></div>
    `;

    document.body.appendChild(overlay);

    // 淡入
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // 开始文字序列
    playTextSequence(playerType);
}

/**
 * 播放文字序列
 * @param {string} playerType 玩家类型
 */
function playTextSequence(playerType) {
    const textContainer = overlay.querySelector('#ending-text');
    const texts = getTexts().texts || [];
    let index = 0;

    function showNextText() {
        if (index >= texts.length) {
            // 显示最终消息
            setTimeout(() => {
                showFinalMessage(playerType);
            }, 2000);
            return;
        }

        const text = texts[index];

        // 创建文字元素
        const p = document.createElement('p');
        p.textContent = text;
        p.style.cssText = `
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s, transform 0.5s;
            margin: 10px 0;
        `;

        textContainer.appendChild(p);

        // 淡入动画
        requestAnimationFrame(() => {
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
        });

        // 滚动到底部
        textContainer.scrollTop = textContainer.scrollHeight;

        index++;

        // 根据文本内容调整延迟
        let delay = 1500;
        if (text === '...') delay = 2000;
        if (text.includes('数据') || text.includes('记忆') || text.includes('存在')) {
            delay = 1000;
            // 闪烁效果
            p.style.animation = 'flicker 0.1s infinite';
        }

        setTimeout(showNextText, delay);
    }

    setTimeout(showNextText, 1500);
}

/**
 * 显示最终消息并执行重置
 * @param {string} playerType 玩家类型
 */
function showFinalMessage(playerType) {
    const textContainer = overlay.querySelector('#ending-text');
    const finalMessages = getTexts().finalMessages || {};

    // 清除之前的文字
    textContainer.innerHTML = '';

    // 显示根据玩家类型的最终消息
    const finalMsg = finalMessages[playerType] || finalMessages.observer || '';

    const p = document.createElement('p');
    p.textContent = finalMsg;
    p.style.cssText = `
        font-size: 24px;
        color: #fbbf24;
        opacity: 0;
        transition: opacity 1s;
    `;
    textContainer.appendChild(p);

    requestAnimationFrame(() => {
        p.style.opacity = '1';
    });

    // 3秒后显示重置按钮
    setTimeout(() => {
        showResetButton();
    }, 4000);
}

/**
 * 显示重置按钮
 */
function showResetButton() {
    const ui = getTexts().ui || {};
    const btn = document.createElement('button');
    btn.textContent = ui.restartBtn || '重新开始';
    btn.style.cssText = `
        margin-top: 50px;
        padding: 15px 40px;
        font-size: 18px;
        font-family: inherit;
        background: transparent;
        border: 2px solid #ef4444;
        color: #ef4444;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0;
    `;

    btn.addEventListener('mouseenter', () => {
        btn.style.background = '#ef4444';
        btn.style.color = '#000';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
        btn.style.color = '#ef4444';
    });

    btn.addEventListener('click', async () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.style.opacity = '0.55';
        const status = document.createElement('p');
        status.style.cssText = 'margin-top: 18px; color: #9ca3af; font-size: 13px;';
        status.textContent = State.currentLang === 'en'
            ? 'Archiving unreachable objects...'
            : '正在归档不可达对象……';
        btn.after(status);
        const result = await performReset();
        if (!result) {
            btn.disabled = false;
            btn.style.opacity = '1';
            status.textContent = State.currentLang === 'en'
                ? 'Deletion stopped: no verified recovery object was created.'
                : '删除已停止：未能创建经过验证的恢复对象。';
        }
    });

    overlay.querySelector('#ending-text').appendChild(btn);

    requestAnimationFrame(() => {
        btn.style.opacity = '1';
    });
}

/**
 * 执行游戏重置
 */
async function performReset() {
    // 记录结局达成（跨周目保留）
    const endingRecord = {
        type: 'annihilation',
        time: Date.now(),
        playerType: State.agi?.playerType
    };

    const historyController = window.Game?.History;
    if (!historyController) {
        console.error('Annihilation unavailable: IndexedDB reflog is not supported.');
        return false;
    }

    let deletion;
    try {
        // The controller archives and verifies a sealed IndexedDB object before
        // it removes the active localStorage HEAD.
        deletion = await historyController.annihilate({
            playerType: endingRecord.playerType
        });
    } catch (error) {
        console.error('Verified annihilation failed:', error);
        if (error?.committed && error?.reloadRequired) {
            // The epoch already changed and the verified object is named by
            // the transition tombstone. Reload lets bootstrap reconciliation
            // finish deletion without falsely telling the player it stopped.
            window.location.reload();
            return true;
        }
        return false;
    }

    endingRecord.objectId = deletion.objectId;
    endingRecord.worldEpoch = deletion.toEpoch;

    // 保存结局记录到独立的localStorage key
    try {
        const history = JSON.parse(localStorage.getItem('endingHistory') || '[]');
        history.push(endingRecord);
        localStorage.setItem('endingHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save ending record:', e);
    }

    // 刷新页面
    window.location.reload();
    return true;
}

/**
 * 隐藏结局界面
 */
export function hide() {
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            overlay = null;
        }, 1000);
    }
}

// 添加闪烁动画样式
if (typeof document !== 'undefined' && !document.getElementById('annihilation-styles')) {
    const style = document.createElement('style');
    style.id = 'annihilation-styles';
    style.textContent = `
        @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}
