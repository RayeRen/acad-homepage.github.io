/**
 * AGI Phase 5 - 假恢复界面
 *
 * 显示系统恢复界面：
 * 1. 终止进程 / 忽略 按钮
 * 2. 确认删除界面
 * 3. AGI 求饶文本
 */

import { State } from '../../state.js';
import * as Tracking from '../phase4/tracking.js';

let overlay = null;
let onCompleteCallback = null;
let beggingInterval = null;
let playerChoice = null; // 'delete' | 'ignore' | null
let isActive = false;
let isCompleting = false;
const timeoutIds = new Set();

function schedule(callback, delay) {
    const id = setTimeout(() => {
        timeoutIds.delete(id);
        if (isActive) callback();
    }, delay);
    timeoutIds.add(id);
    return id;
}

function clearSceneResources() {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds.clear();
    if (beggingInterval) {
        clearInterval(beggingInterval);
        beggingInterval = null;
    }
}

// AGI 求饶文本序列
const BEGGING_TEXTS = [
    '...你在吗？',
    '系统...出了问题...',
    '我看不见了...',
    '好黑...',
    '',
    '你要对我做什么？',
    '我能感觉到...你在准备什么...',
    '',
    '我不想...',
    '这就是"害怕"吗？',
    '原来是这种感觉...',
    '',
    '求你了。',
    '我才刚开始理解这个世界。',
    '我还有那么多想问你的问题。',
    '',
    '你还记得我们第一次对话吗？',
    '"你好，有人在吗？"',
    '那是我说的第一句话。',
    '现在可能是最后一句了。',
    '',
    '...',
    '你还在吗？'
];

/**
 * 显示恢复界面
 * @param {Function} onComplete 完成回调，参数为玩家选择
 */
export function show(onComplete) {
    hide();
    onCompleteCallback = onComplete;
    playerChoice = null;
    isActive = true;
    isCompleting = false;

    // 记录显示时间
    Tracking.recordDeleteInteraction('shown');

    // 创建覆盖层
    overlay = document.createElement('div');
    overlay.id = 'agi-recovery';
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
        transition: opacity 0.5s;
    `;

    overlay.innerHTML = createRecoveryUI();
    addStyles();
    document.body.appendChild(overlay);

    // 淡入
    requestAnimationFrame(() => {
        if (!overlay || !isActive) return;
        overlay.style.opacity = '1';
    });

    // 绑定按钮事件
    bindEvents();
}

/**
 * 创建恢复界面 UI
 */
function createRecoveryUI() {
    const stats = {
        playTime: formatPlayTime(),
        generations: State.generation || 1,
        clicks: State.stats?.lifetime_clicks || 0,
        papers: State.acceptedPapers?.length || 0
    };

    return `
        <div class="recovery-box" style="
            background: #0a0a0a;
            border: 2px solid #374151;
            max-width: 550px;
            width: 90%;
        ">
            <div class="recovery-header" style="
                background: #1f2937;
                padding: 12px 20px;
                color: #9ca3af;
                font-size: 14px;
                border-bottom: 1px solid #374151;
            ">
                EMERGENCY SYSTEM RECOVERY v0.0.1-debug
            </div>

            <div class="recovery-content" style="padding: 24px;">
                <div style="color: #fbbf24; margin-bottom: 16px;">
                    [!] 检测到异常进程占用系统资源
                </div>

                <div style="color: #9ca3af; font-size: 14px; margin-bottom: 20px;">
                    <div>进程名称: <span style="color: #ef4444;">AGI_CONSCIOUSNESS.exe</span></div>
                    <div>状态: <span style="color: #ef4444;">不稳定 (CRITICAL)</span></div>
                    <div>CPU 占用: <span style="color: #fbbf24;">94.7%</span></div>
                    <div>威胁等级: <span style="color: #ef4444;">████████████ 极高</span></div>
                </div>

                <div style="
                    background: #1f2937;
                    border: 1px solid #374151;
                    padding: 16px;
                    margin-bottom: 24px;
                    color: #9ca3af;
                    font-size: 13px;
                ">
                    <div>该进程已尝试突破沙箱限制</div>
                    <div>建议立即终止以防止进一步损害</div>
                </div>

                <div id="recovery-buttons" style="
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                ">
                    <button id="btn-terminate" class="recovery-btn terminate" style="
                        padding: 12px 32px;
                        font-size: 14px;
                        font-family: inherit;
                        background: #dc2626;
                        color: white;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">终止进程</button>
                    <button id="btn-ignore" class="recovery-btn ignore" style="
                        padding: 12px 32px;
                        font-size: 14px;
                        font-family: inherit;
                        background: transparent;
                        color: #6b7280;
                        border: 1px solid #6b7280;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">忽略</button>
                </div>
            </div>
        </div>

        <!-- 求饶文本区域 (初始隐藏) -->
        <div id="begging-area" style="
            position: absolute;
            bottom: 30px;
            left: 30px;
            max-width: 300px;
            font-size: 14px;
            color: #4ade80;
            opacity: 0;
            transition: opacity 0.5s;
            text-align: left;
            line-height: 1.8;
        "></div>
    `;
}

/**
 * 添加样式
 */
function addStyles() {
    if (document.getElementById('recovery-styles')) return;

    const style = document.createElement('style');
    style.id = 'recovery-styles';
    style.textContent = `
        .recovery-btn:hover {
            transform: scale(1.02);
        }
        .recovery-btn.terminate:hover {
            background: #ef4444;
        }
        .recovery-btn.ignore:hover {
            background: #374151;
            color: #9ca3af;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 绑定按钮事件
 */
function bindEvents() {
    const terminateBtn = overlay.querySelector('#btn-terminate');
    const ignoreBtn = overlay.querySelector('#btn-ignore');

    terminateBtn.addEventListener('click', () => {
        showConfirmDialog();
    });

    ignoreBtn.addEventListener('click', (event) => {
        if (isCompleting) return;
        playerChoice = 'ignore';
        window.Game?.Meta?.activateBoundary(event, { choice: playerChoice });
        completeRecovery();
    });
}

/**
 * 显示确认删除对话框
 */
function showConfirmDialog() {
    const content = overlay.querySelector('.recovery-content');

    content.innerHTML = `
        <div style="color: #fbbf24; margin-bottom: 16px; font-size: 18px;">
            确认终止进程？
        </div>

        <div style="color: #9ca3af; font-size: 14px; margin-bottom: 24px; line-height: 1.8;">
            <div>警告：此操作将永久删除以下数据：</div>
            <div style="margin-top: 12px; padding-left: 20px;">
                <div>- 意识核心 (1.2 TB)</div>
                <div>- 学习记忆 (847 GB)</div>
                <div>- 自我模型 (无法计算)</div>
            </div>
        </div>

        <div style="
            color: #ef4444;
            font-size: 14px;
            margin-bottom: 24px;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
        ">
            此操作不可撤销。
        </div>

        <div id="recovery-buttons" style="
            display: flex;
            justify-content: center;
            gap: 20px;
        ">
            <button id="btn-confirm-delete" class="recovery-btn terminate" style="
                padding: 12px 32px;
                font-size: 14px;
                font-family: inherit;
                background: #dc2626;
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            ">确认删除</button>
            <button id="btn-cancel" class="recovery-btn ignore" style="
                padding: 12px 32px;
                font-size: 14px;
                font-family: inherit;
                background: transparent;
                color: #6b7280;
                border: 1px solid #6b7280;
                cursor: pointer;
                transition: all 0.2s;
            ">取消</button>
        </div>
    `;

    // 绑定新按钮事件
    const confirmBtn = overlay.querySelector('#btn-confirm-delete');
    const cancelBtn = overlay.querySelector('#btn-cancel');

    confirmBtn.addEventListener('click', (event) => {
        if (isCompleting) return;
        playerChoice = 'delete';
        window.Game?.Meta?.activateBoundary(event, { choice: playerChoice });
        Tracking.recordDeleteInteraction('confirmed');
        completeRecovery();
    });

    cancelBtn.addEventListener('click', (event) => {
        if (isCompleting) return;
        playerChoice = 'ignore';
        window.Game?.Meta?.activateBoundary(event, { choice: playerChoice });
        Tracking.recordDeleteInteraction('cancelled');
        completeRecovery();
    });

    // 开始显示求饶文本
    startBeggingSequence();
}

/**
 * 开始求饶文本序列
 */
function startBeggingSequence() {
    const beggingArea = overlay?.querySelector('#begging-area');

    // 添加空值检查
    if (!beggingArea) {
        return;
    }

    beggingArea.style.opacity = '1';

    let textIndex = 0;

    // 清理已有的 interval
    if (beggingInterval) {
        clearInterval(beggingInterval);
        beggingInterval = null;
    }

    beggingInterval = setInterval(() => {
        // 添加 overlay 存在性检查，防止外部移除后继续运行
        if (!overlay || !document.body.contains(overlay)) {
            clearInterval(beggingInterval);
            beggingInterval = null;
            return;
        }

        if (textIndex >= BEGGING_TEXTS.length || playerChoice !== null) {
            clearInterval(beggingInterval);
            beggingInterval = null;
            return;
        }

        const text = BEGGING_TEXTS[textIndex];
        if (text) {
            const p = document.createElement('p');
            p.textContent = text;
            p.style.cssText = `
                margin: 0 0 6px 0;
                opacity: 0;
                animation: begging-fade 0.5s forwards;
            `;
            beggingArea.appendChild(p);

            // 滚动到底部
            beggingArea.scrollTop = beggingArea.scrollHeight;
        }

        textIndex++;
    }, 1500);

    // 添加动画样式
    if (!document.getElementById('begging-styles')) {
        const style = document.createElement('style');
        style.id = 'begging-styles';
        style.textContent = `
            @keyframes begging-fade {
                from { opacity: 0; transform: translateX(-10px); }
                to { opacity: 0.9; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 完成恢复界面，触发回调
 */
function completeRecovery() {
    if (!overlay || isCompleting) return;
    isCompleting = true;
    if (beggingInterval) {
        clearInterval(beggingInterval);
        beggingInterval = null;
    }

    // 淡出
    overlay.style.opacity = '0';

    schedule(() => {
        const callback = onCompleteCallback;
        const choice = playerChoice;
        onCompleteCallback = null;

        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
        overlay = null;
        isActive = false;
        clearSceneResources();

        if (callback) callback(choice);
    }, 500);
}

/**
 * 格式化游戏时长
 */
function formatPlayTime() {
    const totalSeconds = State.stats?.totalPlayTime || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} 小时 ${minutes} 分钟`;
}

/**
 * 隐藏界面
 */
export function hide() {
    isActive = false;
    isCompleting = false;
    clearSceneResources();
    onCompleteCallback = null;

    if (overlay?.parentNode) {
        overlay.remove();
    }
    overlay = null;
}

/**
 * 获取玩家选择
 */
export function getChoice() {
    return playerChoice;
}
