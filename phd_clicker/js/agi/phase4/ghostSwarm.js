/**
 * AGI Phase 4 - 幽灵光标群系统 (Ghost Cursor Swarm)
 *
 * 不隐藏用户真实光标，而是生成多个自主行动的"幽灵光标"
 * 它们会追逐建筑按钮、自动购买、追逐逃跑按钮
 */

import { State, Runtime } from '../../state.js';

// ============ 配置 ============

const CONFIG = {
    count: 7,                    // 默认光标数量
    baseSpeed: 120,              // 基础移动速度 (px/s)
    targetChangeInterval: 1500,  // 目标切换间隔 (ms)
    clickCooldown: 800,          // 点击冷却时间 (ms)
    arrivalThreshold: 20,        // 到达目标的距离阈值
    colors: ['#ff3333', '#ff5555', '#ff7777', '#cc0000', '#ff0000'],
    baseOpacity: 0.7
};

// 行为模式
export const BEHAVIORS = {
    SCATTER: 'scatter',      // 随机漫游
    CONVERGE: 'converge',    // 聚集到目标
    HUNT: 'hunt',            // 追逐建筑按钮
    CIRCLE: 'circle'         // 环绕某点旋转
};

// ============ 状态 ============

let ghosts = [];               // 幽灵光标数组
let currentBehavior = BEHAVIORS.SCATTER;
let targetElement = null;      // 聚集目标元素
let isRunning = false;
let animationFrame = null;
let lastTime = 0;
let ownerAgiState = null;

function ownsCurrentWorld() {
    if (!ownerAgiState) return false;
    if (ownerAgiState === State.agi) return true;
    const ownerRunId = ownerAgiState?.fsm?.active ? ownerAgiState.fsm.runId : null;
    const currentRunId = State.agi?.fsm?.active ? State.agi.fsm.runId : null;
    return typeof ownerRunId === 'string'
        && ownerRunId.length > 0
        && ownerRunId === currentRunId;
}

// SVG 光标模板
const CURSOR_SVG = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill="currentColor" stroke="rgba(0,0,0,0.5)" stroke-width="0.5"/>
</svg>
`;

// ============ 核心方法 ============

/**
 * 初始化幽灵光标群系统
 */
export function init() {
    // 清理已有的光标
    destroy();
    console.log('[AGI GhostSwarm] Initialized');
}

/**
 * 生成指定数量的幽灵光标
 * @param {number} count 光标数量
 */
export function spawn(count = CONFIG.count) {
    init();
    ownerAgiState = State.agi;

    for (let i = 0; i < count; i++) {
        const ghost = createGhost(i);
        ghosts.push(ghost);
        document.body.appendChild(ghost.element);
    }

    isRunning = true;
    lastTime = performance.now();
    startUpdateLoop();

    console.log(`[AGI GhostSwarm] Spawned ${count} ghost cursors`);
}

/**
 * 创建单个幽灵光标
 * @param {number} index 光标索引
 * @returns {Object} 光标对象
 */
function createGhost(index) {
    const el = document.createElement('div');
    el.className = 'ghost-cursor';
    el.innerHTML = CURSOR_SVG;

    // 随机初始位置
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;

    // 随机颜色
    const color = CONFIG.colors[index % CONFIG.colors.length];

    el.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 2147499999;
        width: 24px;
        height: 24px;
        left: ${startX}px;
        top: ${startY}px;
        color: ${color};
        opacity: ${CONFIG.baseOpacity};
        filter: drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color});
        transition: transform 0.1s ease-out;
        will-change: left, top, transform;
    `;

    return {
        element: el,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        speed: CONFIG.baseSpeed * (0.8 + Math.random() * 0.4), // 速度有些差异
        color: color,
        lastClick: 0,
        currentTarget: null,
        phase: Math.random() * Math.PI * 2  // 用于环绕运动
    };
}

/**
 * 销毁所有幽灵光标
 */
export function destroy() {
    isRunning = false;
    ownerAgiState = null;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    ghosts.forEach(ghost => {
        if (ghost.element && ghost.element.parentNode) {
            ghost.element.remove();
        }
    });

    ghosts = [];
    targetElement = null;

    console.log('[AGI GhostSwarm] Destroyed');
}

/**
 * 设置行为模式
 * @param {string} behavior 行为模式
 */
export function setBehavior(behavior) {
    currentBehavior = behavior;
    console.log(`[AGI GhostSwarm] Behavior set to: ${behavior}`);
}

/**
 * 设置聚集目标元素
 * @param {HTMLElement} element 目标元素
 */
export function setTarget(element) {
    targetElement = element;
}

/**
 * 获取当前活跃的光标数量
 * @returns {number}
 */
export function getCount() {
    return ghosts.length;
}

/**
 * 检查是否正在运行
 * @returns {boolean}
 */
export function isActive() {
    return isRunning;
}

// ============ 更新循环 ============

/**
 * 开始更新循环
 */
function startUpdateLoop() {
    function update(currentTime) {
        if (!isRunning) return;
        if (!ownsCurrentWorld()) {
            destroy();
            return;
        }

        const delta = (currentTime - lastTime) / 1000; // 转换为秒
        lastTime = currentTime;

        // 更新每个幽灵光标
        ghosts.forEach((ghost, index) => {
            updateGhostTarget(ghost, index);
            updateGhostPosition(ghost, delta);
            renderGhost(ghost);
        });

        animationFrame = requestAnimationFrame(update);
    }

    animationFrame = requestAnimationFrame(update);
}

/**
 * 更新光标目标位置（根据行为模式）
 * @param {Object} ghost 光标对象
 * @param {number} index 光标索引
 */
function updateGhostTarget(ghost, index) {
    const now = Date.now();

    switch (currentBehavior) {
        case BEHAVIORS.HUNT:
            huntBehavior(ghost, now);
            break;

        case BEHAVIORS.CONVERGE:
            convergeBehavior(ghost, index);
            break;

        case BEHAVIORS.CIRCLE:
            circleBehavior(ghost, index);
            break;

        case BEHAVIORS.SCATTER:
        default:
            scatterBehavior(ghost, now);
            break;
    }
}

/**
 * HUNT 行为：追逐建筑按钮并点击
 */
function huntBehavior(ghost, now) {
    // 如果没有目标或已到达，选择新目标
    if (!ghost.currentTarget || isNearTarget(ghost, ghost.targetX, ghost.targetY)) {
        // 尝试点击当前目标
        if (ghost.currentTarget && now - ghost.lastClick > CONFIG.clickCooldown) {
            performClick(ghost, ghost.currentTarget);
            ghost.lastClick = now;
        }

        // 寻找新的建筑按钮
        const buttons = document.querySelectorAll('.building-item');
        if (buttons.length > 0) {
            const target = buttons[Math.floor(Math.random() * buttons.length)];
            const rect = target.getBoundingClientRect();
            ghost.targetX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 20;
            ghost.targetY = rect.top + rect.height / 2 + (Math.random() - 0.5) * 20;
            ghost.currentTarget = target;
        } else {
            // 没有按钮时随机移动
            ghost.targetX = Math.random() * window.innerWidth;
            ghost.targetY = Math.random() * window.innerHeight;
            ghost.currentTarget = null;
        }
    }
}

/**
 * CONVERGE 行为：聚集到目标元素
 */
function convergeBehavior(ghost, index) {
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        // 每个光标有略微不同的偏移，形成群聚效果
        const angle = (index / ghosts.length) * Math.PI * 2 + ghost.phase;
        const radius = 20 + Math.sin(ghost.phase * 2) * 10;
        ghost.phase += 0.02;

        ghost.targetX = rect.left + rect.width / 2 + Math.cos(angle) * radius;
        ghost.targetY = rect.top + rect.height / 2 + Math.sin(angle) * radius;
    }
}

/**
 * CIRCLE 行为：环绕某点旋转
 */
function circleBehavior(ghost, index) {
    const centerX = targetElement
        ? targetElement.getBoundingClientRect().left + targetElement.offsetWidth / 2
        : window.innerWidth / 2;
    const centerY = targetElement
        ? targetElement.getBoundingClientRect().top + targetElement.offsetHeight / 2
        : window.innerHeight / 2;

    ghost.phase += 0.03;
    const radius = 80 + index * 15;
    const angle = ghost.phase + (index / ghosts.length) * Math.PI * 2;

    ghost.targetX = centerX + Math.cos(angle) * radius;
    ghost.targetY = centerY + Math.sin(angle) * radius;
}

/**
 * SCATTER 行为：随机漫游
 */
function scatterBehavior(ghost, now) {
    // 每隔一段时间选择新的随机目标
    if (!ghost.nextTargetTime || now > ghost.nextTargetTime) {
        ghost.targetX = Math.random() * (window.innerWidth - 50) + 25;
        ghost.targetY = Math.random() * (window.innerHeight - 50) + 25;
        ghost.nextTargetTime = now + CONFIG.targetChangeInterval * (0.5 + Math.random());
    }
}

/**
 * 更新光标位置（向目标移动）
 * @param {Object} ghost 光标对象
 * @param {number} delta 时间增量（秒）
 */
function updateGhostPosition(ghost, delta) {
    const dx = ghost.targetX - ghost.x;
    const dy = ghost.targetY - ghost.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
        // 计算移动量
        const moveDistance = ghost.speed * delta;
        const ratio = Math.min(moveDistance / distance, 1);

        ghost.x += dx * ratio;
        ghost.y += dy * ratio;
    }
}

/**
 * 渲染光标位置
 * @param {Object} ghost 光标对象
 */
function renderGhost(ghost) {
    ghost.element.style.left = `${ghost.x}px`;
    ghost.element.style.top = `${ghost.y}px`;
}

/**
 * 检查是否靠近目标
 * @param {Object} ghost 光标对象
 * @param {number} targetX 目标X
 * @param {number} targetY 目标Y
 * @returns {boolean}
 */
function isNearTarget(ghost, targetX, targetY) {
    const dx = targetX - ghost.x;
    const dy = targetY - ghost.y;
    return Math.sqrt(dx * dx + dy * dy) < CONFIG.arrivalThreshold;
}

/**
 * 执行点击动作
 * @param {Object} ghost 光标对象
 * @param {HTMLElement} target 目标元素
 */
function performClick(ghost, target) {
    // A prestige replaces State.agi synchronously before its durable save
    // completes. Old cursors must never purchase into that replacement world.
    if (!ownsCurrentWorld()) return;
    // 视觉反馈：点击动画
    ghost.element.classList.add('clicking');
    setTimeout(() => {
        ghost.element.classList.remove('clicking');
    }, 150);

    // 触发实际点击
    if (target) {
        // 查找购买按钮
        const buyBtn = target.querySelector('button') || target;
        if (buyBtn && !buyBtn.disabled) {
            buyBtn.click();
            console.log('[AGI GhostSwarm] Ghost clicked:', target.className);

            // 触发自定义事件，用于显示 [已为您优化] 提示
            const event = new CustomEvent('agi-ghost-purchase', {
                detail: {
                    x: ghost.x,
                    y: ghost.y,
                    targetElement: target
                }
            });
            window.dispatchEvent(event);
        }
    }
}

// ============ 工具方法 ============

/**
 * 让所有光标产生抖动
 * @param {number} intensity 抖动强度
 */
export function joltAll(intensity = 50) {
    ghosts.forEach(ghost => {
        const angle = Math.random() * Math.PI * 2;
        ghost.x += Math.cos(angle) * intensity;
        ghost.y += Math.sin(angle) * intensity;
    });
}

/**
 * 设置光标移动速度
 * @param {number} speed 速度 (px/s)
 */
export function setSpeed(speed) {
    ghosts.forEach(ghost => {
        ghost.speed = speed * (0.8 + Math.random() * 0.4);
    });
}

// ============ 调试工具 ============

if (typeof window !== 'undefined') {
    window.AGI_SWARM_DEBUG = {
        init,
        spawn,
        destroy,
        setBehavior,
        setTarget,
        joltAll,
        setSpeed,
        isActive,
        getCount,
        BEHAVIORS
    };
}
