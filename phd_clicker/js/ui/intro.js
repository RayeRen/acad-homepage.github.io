/**
 * Heritage Intro UI Module
 * Handles the intro screen shown after prestige with origin info.
 * Extracted from Game.UI.Intro in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';

/**
 * Check if intro should be shown and display it.
 */
export function checkAndShow(Logic) {
    if (State.generation > 1 && !State.introSeen) {
        render(Logic);
    }
}

/**
 * Show the intro modal for a specific origin.
 * @param {string} originKey - The origin key to display (optional, uses currentOrigin if not provided)
 * @param {Object} Logic - Logic module for saving state (optional)
 */
export function show(originKey, Logic) {
    const origins = Runtime.locale.origins;
    if (!origins) return;

    const myOrigin = origins[originKey || State.currentOrigin] || origins['grinder'];

    if (DOM.introGenTitle) DOM.introGenTitle.textContent = `GENERATION ${State.generation}`;
    if (DOM.introOriginName) DOM.introOriginName.textContent = myOrigin.name;
    if (DOM.introBuffDesc) DOM.introBuffDesc.textContent = myOrigin.effectDesc;

    updateOriginIcon(myOrigin);

    if (DOM.introStartBtn) {
        DOM.introStartBtn.onclick = () => {
            const outcome = Logic?.Commands?.dispatch(
                Logic.Commands.CommandType.INTRO_COMPLETE,
                {},
                { actor: 'player', source: 'ui' }
            );
            if (outcome?.ok) Logic.saveGame('intro-complete');
            if (DOM.heritageIntroModal) DOM.heritageIntroModal.classList.add('hidden');
        };
    }

    if (DOM.heritageIntroModal) DOM.heritageIntroModal.classList.remove('hidden');
}

/**
 * Render the intro modal using current origin.
 * @param {Object} Logic - Logic module for saving state (optional)
 */
export function render(Logic) {
    const origins = Runtime.locale.origins;
    if (!origins) return;

    const myOrigin = origins[State.currentOrigin] || origins['grinder'];

    if (DOM.introGenTitle) DOM.introGenTitle.textContent = `GENERATION ${State.generation}`;
    if (DOM.introOriginName) DOM.introOriginName.textContent = myOrigin.name;
    if (DOM.introBuffDesc) DOM.introBuffDesc.textContent = myOrigin.effectDesc;

    updateOriginIcon(myOrigin);

    if (DOM.introStartBtn) {
        DOM.introStartBtn.onclick = () => {
            const outcome = Logic?.Commands?.dispatch(
                Logic.Commands.CommandType.INTRO_COMPLETE,
                {},
                { actor: 'player', source: 'ui' }
            );
            if (outcome?.ok) Logic.saveGame('intro-complete');
            if (DOM.heritageIntroModal) DOM.heritageIntroModal.classList.add('hidden');
        };
    }

    if (DOM.heritageIntroModal) DOM.heritageIntroModal.classList.remove('hidden');
}

/**
 * Update the origin icon with Lucide icon.
 * @param {Object} origin - Origin data with icon property
 */
function updateOriginIcon(origin) {
    if (DOM.introOriginIcon && origin.icon) {
        const currentIcon = document.getElementById('intro-origin-icon');
        if (currentIcon) {
            const parent = currentIcon.parentNode;
            const newI = document.createElement('i');
            newI.id = 'intro-origin-icon';
            newI.setAttribute('data-lucide', origin.icon);
            newI.className = 'w-16 h-16 text-slate-600';
            parent.replaceChild(newI, currentIcon);
            if (window.lucide) lucide.createIcons({ root: parent });
        }
    }
}

/**
 * Hide the intro modal.
 */
export function hide() {
    if (DOM.heritageIntroModal) DOM.heritageIntroModal.classList.add('hidden');
}
