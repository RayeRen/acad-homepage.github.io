/**
 * Game Data Module
 * Contains data loading, translation, and utility functions.
 * Extracted from Game.Data in game.js
 */

import { Constants } from './constants.js';
import { State, Runtime } from './state.js';
import { GAME_DATA_ZH } from '../data/zh.js';
import { GAME_DATA_EN } from '../data/en.js';
import { TRAITS_ZH } from '../data/traits_zh.js';
import { TRAITS_EN } from '../data/traits_en.js';
import { LEGEND_ADVISORS_ZH } from '../data/legend_advisors_zh.js';
import { LEGEND_ADVISORS_EN } from '../data/legend_advisors_en.js';
import { AGI_DIALOGUES as AGI_DIALOGUES_ZH } from '../data/agi_dialogues_zh.js';
import { AGI_DIALOGUES as AGI_DIALOGUES_EN } from '../data/agi_dialogues_en.js';

/**
 * Load locale data based on language selection.
 * Populates Runtime with configuration from the selected language's data file.
 * @param {string} lang - Language code ('en' or 'zh')
 */
export function loadLocale(lang) {
    const normalizedLang = lang === 'en' ? 'en' : 'zh';
    const data = (normalizedLang === 'en')
        ? (GAME_DATA_EN || GAME_DATA_ZH || {})
        : (GAME_DATA_ZH || GAME_DATA_EN || {});

    Runtime.locale = data;
    Runtime.activeNews = data.news || [];
    Runtime.activeClickPhrases = data.clickPhrases || [];

    // Filter buildings based on unlock conditions
    Runtime.buildingsConfig = (data.buildings || []).filter(b => {
        // Hide symbiosis_protocol unless unlocked through AGI Unknown ending
        if (b.requiresSymbiosis && !State.agi?.symbiosisUnlocked) {
            return false;
        }
        // After departure ending: hide agi_proto and show empty_server
        if (State.agi?.departureComplete) {
            if (b.id === 'agi_proto') return false; // Hide AGI proto
            // Keep empty_server visible
        } else {
            // Before departure: hide empty_server
            if (b.replacesAgiProto) return false;
        }
        return true;
    });

    Runtime.upgradesConfig = data.upgrades || [];
    Runtime.connectionsConfig = data.connections || [];
    Runtime.clickUpgradesConfig = data.clickUpgrades || [];
    Runtime.submissionConfig = data.submission || { tiers: [], flavorText: { accepted: [], rejected: [] }, questionPool: { funny: [], technical: [] } };

    // Load advisor system data
    Runtime.traitsConfig = (normalizedLang === 'en') ? TRAITS_EN : TRAITS_ZH;
    Runtime.legendAdvisorsConfig = (normalizedLang === 'en') ? LEGEND_ADVISORS_EN : LEGEND_ADVISORS_ZH;

    // Load AGI dialogue data
    Runtime.agiDialogues = (normalizedLang === 'en') ? AGI_DIALOGUES_EN : AGI_DIALOGUES_ZH;

    State.currentLang = normalizedLang;
    try {
        globalThis.localStorage?.setItem(Constants.LANG_KEY, normalizedLang);
        Runtime.localeStorageUnavailable = false;
    } catch {
        // Language still works for this in-memory session when storage is
        // blocked (privacy mode, SecurityError, quota policy, etc.).
        Runtime.localeStorageUnavailable = true;
    }
}

/**
 * Get translated string by key.
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback value if key not found
 * @returns {string} Translated string or fallback
 */
export function t(key, fallback = '') {
    const ui = Runtime.locale.ui || {};
    return (key in ui) ? ui[key] : fallback;
}

/**
 * Format large numbers for display.
 * Uses K, M, B, T suffixes for large numbers.
 * @param {number} n - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(n) {
    if (n === 0) return '0';
    if (n < 1000) {
        // Show 1 decimal place if needed, remove trailing .0
        return parseFloat(n.toFixed(1)).toLocaleString('en-US');
    }
    if (n < 1e6) return (n/1e3).toFixed(2)+'K'; // 12.34K
    if (n < 1e9) return (n/1e6).toFixed(2)+'M'; // 12.34M
    if (n < 1e12) return (n/1e9).toFixed(2)+'B';
    return (n/1e12).toFixed(2)+'T';
}

/**
 * Replace template placeholders with values.
 * @param {string} tpl - Template string with {key} placeholders
 * @param {Object} rep - Object with key-value replacements
 * @returns {string} Formatted string
 */
export function formatTemplate(tpl, rep = {}) {
    return Object.entries(rep).reduce((s, [k, v]) => s.replace(`{${k}}`, v), tpl || '');
}

/**
 * Pick a random element from an array.
 * @param {Array} arr - Array to pick from
 * @returns {*} Random element or null if array is empty
 */
export function pickRandom(arr) {
    return (arr && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : null;
}
