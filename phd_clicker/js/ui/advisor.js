/**
 * Advisor Selection UI Module
 * Handles the advisor selection interface shown after prestige.
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';
import { t, formatNumber } from '../data.js';
import * as Intro from './intro.js';

// Module state
let currentCandidate = null;  // Current advisor candidate
let lockedIndices = [];       // Indices of locked traits
let LogicModule = null;       // Reference to Logic module
let isViewMode = false;       // True when viewing existing advisor info (read-only)

// Rarity color classes
const RARITY_COLORS = {
    green: { bg: 'bg-green-900/50', border: 'border-green-500', text: 'text-green-400' },
    blue: { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-400' },
    gold: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-400' },
    red: { bg: 'bg-red-900/50', border: 'border-red-500', text: 'text-red-400' }
};

const RARITY_LABELS = {
    green: { zh: '普通', en: 'Common' },
    blue: { zh: '稀有', en: 'Rare' },
    purple: { zh: '史诗', en: 'Epic' },
    gold: { zh: '传说', en: 'Legendary' },
    red: { zh: '独特', en: 'Unique' }
};

/**
 * Open the advisor selection interface.
 * For generation 1, auto-assign default advisor.
 * For generation 2+, show selection UI.
 * @param {Object} Logic - Logic module reference
 */
export function open(Logic) {
    LogicModule = Logic;
    isViewMode = false;  // Selection mode

    if (State.generation <= 1) {
        // First generation: auto-assign default advisor
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.ADVISOR_SELECT,
            { advisor: Logic.Advisor.getDefaultAdvisor() },
            { actor: 'player', source: 'ui' }
        );
        if (outcome.ok) {
            Logic.updateAll();
            Logic.saveGame('advisor-default');
        }
        return;
    }

    // Reset state
    lockedIndices = [];

    // Generate initial candidate
    reroll(Logic);

    // Show modal
    if (DOM.advisorModal) {
        DOM.advisorModal.classList.remove('hidden');
    }
}

/**
 * Show current advisor info in view-only mode.
 * @param {Object} Logic - Logic module reference
 */
export function showInfo(Logic) {
    if (!State.currentAdvisor) {
        // No advisor selected yet
        return;
    }

    LogicModule = Logic;
    isViewMode = true;  // View mode (read-only)
    currentCandidate = State.currentAdvisor;
    lockedIndices = [];  // No locks in view mode

    // Render advisor info
    render();

    // Show modal
    if (DOM.advisorModal) {
        DOM.advisorModal.classList.remove('hidden');
    }
}

/**
 * Reroll traits (keeping locked ones).
 * @param {Object} Logic - Logic module reference
 */
export function reroll(Logic) {
    Logic = Logic || LogicModule;
    if (!Logic) return;

    // Save current name (reroll should only change traits, not name)
    const currentName = currentCandidate?.name;

    // Get locked traits from current candidate
    const lockedTraits = lockedIndices
        .map(i => currentCandidate?.traits[i])
        .filter(Boolean);

    // Generate new candidate with locked traits preserved
    currentCandidate = Logic.Advisor.generateRandomAdvisor(lockedTraits);

    // Restore the name (reroll keeps the same advisor)
    if (currentName && currentCandidate) {
        currentCandidate.name = currentName;
    }

    // Rebuild locked indices based on new trait array
    lockedIndices = [];
    currentCandidate.traits.forEach((trait, i) => {
        if (trait.locked) {
            lockedIndices.push(i);
        }
    });

    render();
}

/**
 * Switch to a completely new advisor (reset all locks).
 * @param {Object} Logic - Logic module reference
 */
export function switchAdvisor(Logic) {
    Logic = Logic || LogicModule;
    if (!Logic) return;

    lockedIndices = [];
    currentCandidate = Logic.Advisor.generateRandomAdvisor([]);
    render();
}

/**
 * Select a legend advisor.
 * @param {string} legendId - Legend advisor ID
 * @param {Object} Logic - Logic module reference
 */
export function selectLegend(legendId, Logic) {
    Logic = Logic || LogicModule;
    if (!Logic) return;

    currentCandidate = Logic.Advisor.getLegendAdvisor(legendId);
    lockedIndices = [];  // Legend advisors don't use locks
    render();
}

/**
 * Toggle lock on a trait.
 * @param {number} index - Trait index
 * @param {Object} Logic - Logic module reference
 */
export function toggleLock(index, Logic) {
    Logic = Logic || LogicModule;
    if (!Logic) return;

    // Legend advisors can't lock traits
    if (currentCandidate?.isLegend) return;

    const maxLocks = Logic.Advisor.getMaxLockSlots();

    if (lockedIndices.includes(index)) {
        // Unlock
        lockedIndices = lockedIndices.filter(i => i !== index);
    } else if (lockedIndices.length < maxLocks) {
        // Lock (if we have slots available)
        lockedIndices.push(index);
    }

    render();
}

/**
 * Confirm advisor selection.
 * @param {Object} Logic - Logic module reference
 */
export function confirm(Logic) {
    Logic = Logic || LogicModule;
    if (!Logic) return;

    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.ADVISOR_SELECT,
        { advisor: currentCandidate },
        { actor: 'player', source: 'ui' }
    );
    if (!outcome.ok) return;

    // Hide modal
    if (DOM.advisorModal) {
        DOM.advisorModal.classList.add('hidden');
    }

    // Save and update UI
    Logic.saveGame('advisor-selected');
    Logic.updateAll();

    // Show heritage intro for subsequent generations (after prestige)
    if (State.generation > 1 && !State.introSeen) {
        Intro.checkAndShow(Logic);
    }
}

/**
 * Render the advisor selection UI.
 */
function render() {
    if (!currentCandidate) return;

    // Update advisor name
    if (DOM.advisorNameInput) {
        DOM.advisorNameInput.value = currentCandidate.name;

        // Disable input in view mode or for legend advisors
        if (isViewMode || currentCandidate.isLegend) {
            DOM.advisorNameInput.disabled = true;
            DOM.advisorNameInput.classList.add('bg-slate-900', 'cursor-not-allowed', 'text-slate-300');
        } else {
            DOM.advisorNameInput.disabled = false;
            DOM.advisorNameInput.classList.remove('bg-slate-900', 'cursor-not-allowed', 'text-slate-300');
        }
    }

    // Update advisor title (for legend advisors)
    if (DOM.advisorTitle) {
        if (currentCandidate.isLegend && currentCandidate.title) {
            DOM.advisorTitle.textContent = currentCandidate.title;
            DOM.advisorTitle.classList.remove('hidden');
        } else {
            DOM.advisorTitle.classList.add('hidden');
        }
    }

    // Update advisor description (for legend advisors)
    if (DOM.advisorDesc) {
        if (currentCandidate.isLegend && currentCandidate.desc) {
            DOM.advisorDesc.textContent = currentCandidate.desc;
            DOM.advisorDesc.classList.remove('hidden');
        } else {
            DOM.advisorDesc.classList.add('hidden');
        }
    }

    // Render traits
    renderTraits();

    // Render legend advisor options
    renderLegendOptions();

    // Update button states
    updateButtonStates();
}

/**
 * Render trait cards.
 */
function renderTraits() {
    if (!DOM.advisorTraits) return;

    const maxLocks = LogicModule?.Advisor?.getMaxLockSlots() || 0;
    const lang = State.currentLang;

    let html = '';
    currentCandidate.traits.forEach((trait, i) => {
        const rarity = trait.rarity || 'green';
        const colors = RARITY_COLORS[rarity];
        const isLocked = lockedIndices.includes(i);
        // In view mode, no locking allowed
        const canLock = !isViewMode && !currentCandidate.isLegend && (isLocked || lockedIndices.length < maxLocks);
        const rarityLabel = RARITY_LABELS[rarity][lang] || RARITY_LABELS[rarity].en;

        html += `
            <div class="relative ${colors.bg} ${colors.border} border rounded-lg p-3 transition-all ${canLock ? 'cursor-pointer hover:border-opacity-100' : ''}"
                 data-trait-index="${i}" ${canLock ? 'onclick="window.AdvisorUI.toggleLock(' + i + ')"' : ''}>
                <!-- Rarity badge -->
                <span class="absolute -top-2 left-2 px-2 py-0.5 text-xs rounded ${colors.bg} ${colors.text} border ${colors.border}">
                    ${rarityLabel}
                </span>

                <!-- Lock indicator (only show in selection mode) -->
                ${!isViewMode && maxLocks > 0 && !currentCandidate.isLegend ? `
                    <span class="absolute -top-2 right-2 px-2 py-0.5 text-xs rounded bg-slate-800 ${isLocked ? 'text-amber-400' : 'text-slate-500'}">
                        ${isLocked ? '🔒' : '🔓'}
                    </span>
                ` : ''}

                <!-- Trait name -->
                <h4 class="font-bold ${colors.text} mt-1">${trait.name}</h4>

                <!-- Description -->
                <p class="text-sm text-slate-300 mt-1">${trait.description}</p>

                <!-- Effect text -->
                <p class="text-xs ${colors.text} mt-2 font-mono">${trait.effect_text}</p>
            </div>
        `;
    });

    DOM.advisorTraits.innerHTML = html;
}

/**
 * Render legend advisor options.
 */
function renderLegendOptions() {
    if (!DOM.legendAdvisors) return;

    // Hide legend options in view mode
    if (isViewMode) {
        DOM.legendAdvisors.classList.add('hidden');
        return;
    }

    const availableLegends = LogicModule?.Advisor?.getAvailableLegendAdvisors() || [];

    if (availableLegends.length === 0) {
        DOM.legendAdvisors.classList.add('hidden');
        return;
    }

    DOM.legendAdvisors.classList.remove('hidden');

    let html = `<h3 class="text-sm font-bold text-amber-400 mb-2">${State.currentLang === 'en' ? 'Legend Advisors Available:' : '可选大佬导师：'}</h3><div class="flex flex-wrap gap-2">`;

    availableLegends.forEach(legend => {
        const isSelected = currentCandidate?.id === legend.id;
        html += `
            <button class="px-3 py-1 rounded text-sm ${isSelected ? 'bg-amber-600 text-white' : 'bg-slate-700 text-amber-400 hover:bg-slate-600'}"
                    onclick="window.AdvisorUI.selectLegend('${legend.id}')">
                ${legend.name}
            </button>
        `;
    });

    html += '</div>';
    DOM.legendAdvisors.innerHTML = html;
}

/**
 * Update button states based on current candidate and mode.
 */
function updateButtonStates() {
    const lang = State.currentLang;

    // In view mode, hide selection buttons and show close button
    if (isViewMode) {
        if (DOM.advisorRerollBtn) DOM.advisorRerollBtn.classList.add('hidden');
        if (DOM.advisorSwitchBtn) DOM.advisorSwitchBtn.classList.add('hidden');
        if (DOM.advisorLockInfo) DOM.advisorLockInfo.classList.add('hidden');

        // Change confirm button to close button
        if (DOM.advisorConfirmBtn) {
            DOM.advisorConfirmBtn.onclick = () => hide();
            const btnText = DOM.advisorConfirmBtn.querySelector('span');
            if (btnText) {
                btnText.textContent = lang === 'en' ? 'Close' : '关闭';
                btnText.setAttribute('data-i18n', 'advisorCloseBtn');
            }
            // Change icon to X
            const btnIcon = DOM.advisorConfirmBtn.querySelector('i');
            if (btnIcon) {
                btnIcon.setAttribute('data-lucide', 'x');
                if (window.lucide) lucide.createIcons({ icons: { x: true }, root: DOM.advisorConfirmBtn });
            }
        }
        return;
    }

    // Selection mode - show all buttons
    if (DOM.advisorRerollBtn) DOM.advisorRerollBtn.classList.remove('hidden');
    if (DOM.advisorSwitchBtn) DOM.advisorSwitchBtn.classList.remove('hidden');

    // Reset confirm button to original state
    if (DOM.advisorConfirmBtn) {
        DOM.advisorConfirmBtn.onclick = () => confirm(LogicModule);
        const btnText = DOM.advisorConfirmBtn.querySelector('span');
        if (btnText) {
            btnText.textContent = lang === 'en' ? 'Confirm' : '确认选择';
            btnText.setAttribute('data-i18n', 'advisorConfirmBtn');
        }
        // Change icon back to check
        const btnIcon = DOM.advisorConfirmBtn.querySelector('i');
        if (btnIcon) {
            btnIcon.setAttribute('data-lucide', 'check');
            if (window.lucide) lucide.createIcons({ icons: { check: true }, root: DOM.advisorConfirmBtn });
        }
    }

    // Reroll button - disabled for legend advisors
    if (DOM.advisorRerollBtn) {
        if (currentCandidate?.isLegend) {
            DOM.advisorRerollBtn.disabled = true;
            DOM.advisorRerollBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            DOM.advisorRerollBtn.disabled = false;
            DOM.advisorRerollBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Switch button - disabled for legend advisors
    if (DOM.advisorSwitchBtn) {
        if (currentCandidate?.isLegend) {
            DOM.advisorSwitchBtn.disabled = true;
            DOM.advisorSwitchBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            DOM.advisorSwitchBtn.disabled = false;
            DOM.advisorSwitchBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Lock slots info
    if (DOM.advisorLockInfo) {
        const maxLocks = LogicModule?.Advisor?.getMaxLockSlots() || 0;
        if (maxLocks > 0 && !currentCandidate?.isLegend) {
            DOM.advisorLockInfo.textContent = lang === 'en'
                ? `Lock slots: ${lockedIndices.length}/${maxLocks}`
                : `锁定槽位: ${lockedIndices.length}/${maxLocks}`;
            DOM.advisorLockInfo.classList.remove('hidden');
        } else {
            DOM.advisorLockInfo.classList.add('hidden');
        }
    }
}

/**
 * Update advisor name from input.
 * @param {string} newName - New advisor name
 */
export function updateName(newName) {
    if (currentCandidate && !currentCandidate.isLegend) {
        currentCandidate.name = newName.trim() || currentCandidate.name;
    }
}

/**
 * Hide the advisor modal.
 */
export function hide() {
    if (DOM.advisorModal) {
        DOM.advisorModal.classList.add('hidden');
    }
}

/**
 * Check if advisor selection should be shown.
 * @returns {boolean} True if should show selection
 */
export function shouldShow() {
    return State.generation > 1 && !State.advisorSeen;
}

// Expose functions to window for onclick handlers
if (typeof window !== 'undefined') {
    window.AdvisorUI = {
        reroll: () => reroll(LogicModule),
        switchAdvisor: () => switchAdvisor(LogicModule),
        selectLegend: (id) => selectLegend(id, LogicModule),
        toggleLock: (index) => toggleLock(index, LogicModule),
        confirm: () => confirm(LogicModule),
        updateName: updateName
    };
}
