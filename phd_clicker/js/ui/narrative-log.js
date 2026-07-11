import { State } from '../state.js';
import * as NarrativeLog from '../logic/narrative-log.js';

let button = null;
let badge = null;
let panel = null;
let list = null;
let titleElement = null;
let closeButtonElement = null;
let unsubscribe = null;
let keydownHandler = null;

const labels = {
    en: {
        title: 'Narrative Log', empty: 'Nothing unusual has been recorded.', close: 'Close',
        'log.upgrade.purchased': c => `Upgrade installed: ${c.id || 'unknown'}`,
        'log.submission.started': c => `Submission opened at ${c.venue || 'unknown venue'} (${c.questions || 0} rebuttal question(s)).`,
        'log.submission.accepted': c => `Paper accepted by ${c.venue || 'unknown venue'}.`,
        'log.submission.rejected': c => `Paper rejected by ${c.venue || 'unknown venue'}.`,
        'log.prestige.completed': c => `Generation ${c.generation || '?'} began.`,
        'log.advisor.selected': c => `Advisor selected: ${c.name || 'unknown'}.`,
        'log.connection.purchased': c => `New connection established: ${c.id || 'unknown'}.`,
        'log.meta.camera-probe.completed': c => `Video input request: ${c.status || 'completed'}.`,
        'log.meta.camera-probe.failed': c => `Video input request failed: ${c.status || 'unknown'}.`,
        'log.meta.evidence-download.completed': () => 'A local artifact left the sandbox.',
        'log.meta.debugger-gap.completed': c => `Debugger timing probe: ${c.status || 'completed'}.`,
        'log.save.integrity-mismatch': () => 'The save checksum changed outside the game. The edit was retained.',
        'log.save.previous-recovered': () => 'The active save was corrupt; its verified parent became HEAD.',
        'log.reflog.recovered': () => 'An unreachable world became HEAD again.'
    },
    zh: {
        title: '叙事日志', empty: '目前没有记录到异常事件。', close: '关闭',
        'log.upgrade.purchased': c => `已安装升级：${c.id || 'unknown'}`,
        'log.submission.started': c => `已向 ${c.venue || '未知会场'} 投稿（${c.questions || 0} 个 Rebuttal 问题）。`,
        'log.submission.accepted': c => `论文被 ${c.venue || '未知会场'} 接收。`,
        'log.submission.rejected': c => `论文被 ${c.venue || '未知会场'} 拒绝。`,
        'log.prestige.completed': c => `第 ${c.generation || '?'} 周目开始。`,
        'log.advisor.selected': c => `已选择导师：${c.name || '未知'}。`,
        'log.connection.purchased': c => `已建立新关系：${c.id || '未知'}。`,
        'log.meta.camera-probe.completed': c => `视频输入请求：${c.status || '已完成'}。`,
        'log.meta.camera-probe.failed': c => `视频输入请求失败：${c.status || '未知'}。`,
        'log.meta.evidence-download.completed': () => '沙箱之外留下了一个本地文件。',
        'log.meta.debugger-gap.completed': c => `调试器时间差探针：${c.status || '已完成'}。`,
        'log.save.integrity-mismatch': () => '存档校验和在游戏外发生变化；修改被保留。',
        'log.save.previous-recovered': () => '当前存档已损坏；经过验证的父版本重新成为 HEAD。',
        'log.reflog.recovered': () => '一个不可达的世界重新成为了 HEAD。'
    }
};

function language() {
    return State.currentLang === 'en' ? 'en' : 'zh';
}

function formatEntry(entry) {
    const table = labels[language()];
    const formatter = table[entry.messageKey];
    if (typeof formatter === 'function') return formatter(entry.context || {});
    if (entry.messageKey?.startsWith('log.agi.state.')) {
        const state = entry.messageKey.slice('log.agi.state.'.length).replaceAll('_', ' ');
        return language() === 'en' ? `AGI state: ${state}` : `AGI 状态：${state}`;
    }
    return entry.messageKey;
}

function formatTime(timestamp) {
    if (!Number.isFinite(timestamp) || timestamp <= 0) return '--:--:--';
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

function render() {
    if (!list) return;
    const entries = NarrativeLog.query({ limit: 60 });
    list.replaceChildren();
    if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'px-4 py-6 text-sm text-slate-500 italic';
        empty.textContent = labels[language()].empty;
        list.appendChild(empty);
        return;
    }

    entries.forEach(entry => {
        const row = document.createElement('article');
        row.className = `px-4 py-3 border-b border-slate-800 ${entry.read ? 'opacity-70' : 'bg-indigo-950/20'}`;
        const header = document.createElement('div');
        header.className = 'flex justify-between gap-3 text-[10px] uppercase tracking-wider text-slate-500';
        const source = document.createElement('span');
        source.textContent = entry.source || entry.type;
        const time = document.createElement('time');
        time.dateTime = new Date(entry.timestamp || 0).toISOString();
        time.textContent = formatTime(entry.timestamp);
        header.append(source, time);
        const message = document.createElement('p');
        message.className = entry.importance === 'critical'
            ? 'mt-1 text-sm text-rose-300'
            : entry.importance === 'high'
                ? 'mt-1 text-sm text-amber-200'
                : 'mt-1 text-sm text-slate-300';
        message.textContent = formatEntry(entry);
        row.append(header, message);
        list.appendChild(row);
    });
}

export function refresh() {
    if (!button || !badge) return;
    if (titleElement) titleElement.textContent = labels[language()].title;
    if (closeButtonElement) closeButtonElement.setAttribute('aria-label', labels[language()].close);
    const unread = NarrativeLog.query({ read: false }).length;
    badge.textContent = String(Math.min(unread, 99));
    badge.classList.toggle('hidden', unread === 0);
    if (panel && !panel.classList.contains('hidden')) render();
}

export function open() {
    if (!panel) return;
    panel.classList.remove('hidden');
    button?.setAttribute('aria-expanded', 'true');
    NarrativeLog.query({ read: false }).forEach(entry => NarrativeLog.markRead(entry.id));
    render();
    refresh();
}

export function close() {
    panel?.classList.add('hidden');
    button?.setAttribute('aria-expanded', 'false');
}

export function init() {
    if (button) {
        refresh();
        return;
    }
    const ticker = document.getElementById('news-ticker');
    const header = ticker?.parentElement;
    if (!header) return;

    button = document.createElement('button');
    button.id = 'narrative-log-button';
    button.type = 'button';
    button.className = 'relative shrink-0 px-2 py-0.5 border border-green-800/70 rounded text-[10px] text-green-400 hover:text-green-200 hover:border-green-500 font-mono';
    button.textContent = 'LOG';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'narrative-log-panel');
    badge = document.createElement('span');
    badge.className = 'hidden absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] leading-4';
    button.appendChild(badge);
    header.appendChild(button);

    panel = document.createElement('aside');
    panel.id = 'narrative-log-panel';
    panel.className = 'hidden fixed top-8 right-0 w-full sm:w-96 max-h-[70vh] bg-slate-950/95 border-l border-b border-slate-700 shadow-2xl font-sans';
    panel.style.zIndex = '2147484200';
    const panelHeader = document.createElement('div');
    panelHeader.className = 'flex items-center justify-between px-4 py-3 border-b border-slate-700';
    titleElement = document.createElement('h2');
    titleElement.className = 'text-sm font-bold text-slate-200';
    titleElement.textContent = labels[language()].title;
    closeButtonElement = document.createElement('button');
    closeButtonElement.type = 'button';
    closeButtonElement.className = 'text-slate-400 hover:text-white text-lg';
    closeButtonElement.textContent = '×';
    closeButtonElement.setAttribute('aria-label', labels[language()].close);
    panelHeader.append(titleElement, closeButtonElement);
    list = document.createElement('div');
    list.className = 'max-h-[calc(70vh-3rem)] overflow-y-auto custom-scrollbar';
    panel.append(panelHeader, list);
    document.body.appendChild(panel);

    button.addEventListener('click', () => {
        if (panel.classList.contains('hidden')) open();
        else close();
    });
    closeButtonElement.addEventListener('click', close);
    keydownHandler = event => {
        if (event.key === 'Escape' && !panel.classList.contains('hidden')) close();
    };
    document.addEventListener('keydown', keydownHandler);
    unsubscribe = NarrativeLog.subscribe(refresh);
    refresh();
}

export function destroy() {
    unsubscribe?.();
    unsubscribe = null;
    if (keydownHandler) document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
    button?.remove();
    panel?.remove();
    button = badge = panel = list = titleElement = closeButtonElement = null;
}
