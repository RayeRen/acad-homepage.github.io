/**
 * AGI 觉醒系统 - 对话模块入口
 *
 * 统一导出对话管理器和 UI 功能
 */

import * as DialogueManager from './dialogueManager.js';
import * as DialogueUI from './dialogueUI.js';

export { DialogueManager, DialogueUI };

/**
 * 初始化对话系统
 */
export function init() {
    DialogueManager.init();
    DialogueUI.init();
    console.log('[AGI Dialogue] System initialized');
}

/**
 * 更新对话系统
 * @param {number} delta 时间增量（秒）
 * @param {Object} context 上下文数据
 */
export function update(delta, context = {}) {
    DialogueManager.update(delta, context);
}

/**
 * 显示对话条
 */
export function show() {
    DialogueUI.show();
}

/**
 * 隐藏对话条
 */
export function hide() {
    DialogueManager.resetRuntime();
    DialogueUI.hide();
}

/**
 * Clear all scene-local dialogue work while keeping the DOM bindings alive.
 * A later show/trigger call can start a fresh sequence normally.
 */
export function resetRuntime({ hide = true } = {}) {
    DialogueManager.resetRuntime();
    DialogueUI.resetRuntime({ hideBar: hide, clearText: true });
}

/**
 * Fully detach the dialogue surface. init() can bind it again later.
 */
export function destroy() {
    DialogueManager.destroy();
    DialogueUI.destroy();
}

/**
 * 显示单条对话
 * @param {string} text 对话文本
 * @param {string} effect 特效
 * @param {Function} onComplete 完成回调
 */
export function showDialogue(text, effect, onComplete) {
    DialogueUI.showDialogue(text, effect, onComplete);
}

/**
 * 记录玩家输入
 */
export function recordInput() {
    DialogueManager.recordInput();
}

/**
 * 记录点击
 */
export function recordClick() {
    DialogueManager.recordClick();
}

/**
 * 手动触发序列
 * @param {string} sequenceId 序列 ID
 */
export function triggerSequence(sequenceId) {
    return DialogueManager.triggerSequence(sequenceId);
}

/**
 * 跳过当前对话
 */
export function skipCurrent() {
    DialogueManager.skipCurrent();
}

/**
 * 跳过整个序列
 */
export function skipSequence() {
    DialogueManager.skipSequence();
}

/**
 * 跳到当前序列的最后一条对话
 */
export function skipToLastDialogue() {
    DialogueManager.skipToLastDialogue();
}

/**
 * 获取对话系统状态
 */
export function getState() {
    return DialogueManager.getState();
}
