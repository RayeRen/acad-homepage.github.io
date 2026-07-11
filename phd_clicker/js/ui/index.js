/**
 * UI Module Index
 * Re-exports all UI modules for convenient importing.
 */

// DOM caching
export { DOM, cacheDOM, getElement, cacheElement } from './dom.js';

// Main rendering functions
export {
    update,
    updateI18n,
    renderLists,
    renderPublications,
    updateNews,
    toggleLang,
    playFloatingText,
    hideGame,
    showGame
} from './render.js';

// Submission modal
export * as Submission from './submission.js';

// Settlement (prestige) UI
export * as Settlement from './settlement.js';

// Connections shop
export * as Connections from './connections.js';

// Heritage intro
export * as Intro from './intro.js';

// Stealth terminal mode
export * as Stealth from './stealth.js';

// Advisor selection
export * as Advisor from './advisor.js';

// Lightweight narrative/anomaly log
export * as NarrativeLog from './narrative-log.js';
