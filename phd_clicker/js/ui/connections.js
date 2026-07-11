/**
 * Connections Shop UI Module
 * Handles the connections modal for purchasing research connections.
 * Extracted from Game.UI.Connections in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';
import { t } from '../data.js';

/**
 * Initialize event delegation for connection purchases.
 * Should be called once during app initialization.
 * @param {Object} Logic - Logic module for connection purchases
 */
export function initEventDelegation(Logic) {
    const list = DOM.connectionsList;
    if (!list || list.dataset.delegated) return;

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-conn-id]');
        if (btn && !btn.disabled) {
            const outcome = Logic.Commands.dispatch(
                Logic.Commands.CommandType.CONNECTION_BUY,
                { id: btn.dataset.connId },
                { actor: 'player', source: 'ui' }
            );
            if (outcome.ok) {
                Logic.updateAll();
                Logic.saveGame('connection-purchased');
                render();
            }
        }
    });
    list.dataset.delegated = 'true';
}

/**
 * Open the connections modal.
 */
export function open() {
    render();
    if (DOM.connectionsModal) DOM.connectionsModal.classList.remove('hidden');
}

/**
 * Close the connections modal.
 */
export function close() {
    if (DOM.connectionsModal) DOM.connectionsModal.classList.add('hidden');
}

/**
 * Render the connections list.
 */
export function render() {
    const list = DOM.connectionsList;
    if (!list) return;
    list.innerHTML = '';

    const rep = State.reputation;
    if (DOM.repDisplay) DOM.repDisplay.textContent = rep;

    // Calculate cost multiplier based on owned count
    const costMult = Math.pow(2, State.ownedConnections.length);

    const connections = Runtime.locale.connections || [];

    connections.forEach(conn => {
        const owned = State.ownedConnections.includes(conn.id);
        const cost = owned ? 0 : conn.basePrice * costMult;
        const canAfford = rep >= cost;

        const div = document.createElement('div');
        div.className = `p-5 rounded-xl border ${owned ? 'border-amber-500/50 bg-amber-900/20' : 'border-slate-800 bg-slate-900/60'} relative group overflow-hidden transition-all hover:border-slate-600`;

        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-bold text-lg text-slate-200">${conn.name}</h3>
                    <div class="text-xs text-amber-400 uppercase tracking-wider font-semibold">${conn.title}</div>
                </div>
                ${owned ? '<i data-lucide="check-circle-2" class="text-amber-500 w-6 h-6"></i>' : ''}
            </div>
            <p class="text-sm text-slate-400 italic mb-4 min-h-[3rem]">"${conn.desc}"</p>
            <div class="text-xs text-indigo-300 bg-indigo-900/30 p-2 rounded mb-4 border border-indigo-500/30">
                ${conn.effect}
            </div>
            <button data-conn-id="${conn.id}" class="w-full py-2 rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                owned
                    ? 'bg-transparent text-amber-500 cursor-default border border-amber-500/30'
                    : (canAfford ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700')
            }" ${owned || !canAfford ? 'disabled' : ''}>
                ${owned ? t('ownedConnection') : `${t('buyConnection')} (${cost} Rep)`}
            </button>
        `;

        list.appendChild(div);
    });

    if (window.lucide) lucide.createIcons();
}
