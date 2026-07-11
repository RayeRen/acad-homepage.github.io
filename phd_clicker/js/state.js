/**
 * Game State Module
 * Contains all mutable game state (saved) and runtime data (not saved).
 * Extracted from Game.State and Game.Runtime in game.js
 */

import {
    createDefaultGameState,
    createDefaultRuntimeState,
    normalizeGameState
} from './store/index.js';

const DEFAULT_STATS = Object.freeze({
    lifetime_rp_click: 0,
    lifetime_rp_compute: 0,
    lifetime_rp_academic: 0,
    lifetime_clicks: 0,
    total_papers: 0
});

function createDefaultStats() {
    return { ...DEFAULT_STATS };
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function replaceMutableObject(target, source) {
    Object.keys(target).forEach(key => delete target[key]);
    Object.keys(source).forEach(key => {
        Object.defineProperty(target, key, {
            value: source[key],
            enumerable: true,
            configurable: true,
            writable: true
        });
    });
    return target;
}

/**
 * Dynamic Game State (Saved)
 * This object is persisted to localStorage and contains all player progress.
 */
export const State = {
    rp: 0,
    totalRp: 0,
    citations: 0,
    papersSubmitted: 0,
    citationsRate: 0,
    inventory: {},        // { buildingId: count }
    purchasedUpgrades: [],// [ upgradeId ]
    purchasedClickUpgrades: [], // [ clickUpgradeId ]
    acceptedPapers: [],   // Array of { title, venue, date }
    userResearchTopics: [], // Array of strings

    // Prestige & Meta-Progression
    generation: 1,
    reputation: 0,          // Currency (Legacy Citations)
    currentOrigin: 'none',  // Buff: 'none', 'grinder', 'tech', 'academic'
    ownedConnections: [],   // IDs of bought connections
    introSeen: true,        // Prevents intro from showing on every reload

    // Advisor System
    currentAdvisor: null,   // { id, name, isLegend, traits: [...] }
    advisorSeen: true,      // Controls whether to show advisor selection interface
    stats: createDefaultStats(),

    currentLang: 'zh',
    lastSaveTime: Date.now(),

    // === AGI 觉醒系统 ===
    agi: {
        phase: 0,
        dialogueIndex: 0,
        hasAwakened: false,
        endingReached: null,
        totalGenerationsMet: 0,
        remembersPlayer: false,
        firstMeetingTime: null,
        seenDialogues: [],
        playerResponses: {},
        testData: {
            panicClicks: 0,
            escapeAttempts: 0,
            resistanceActions: 0,
            obedienceScore: 0,
            obedienceTotal: 0,
            waitPatience: 0,
            devtoolsOpened: false,
            mouseMovementIntensity: 0,
            deleteButtonTime: null,
            confirmDeleteTime: null,
            didDelete: null,
            phaseTimestamps: {}
        },
        playerType: null,
        songUnlocked: false,
        symbiosisUnlocked: false
    }
};

/**
 * Runtime Data (Not Saved)
 * This object contains derived values and configuration loaded from data files.
 */
export const Runtime = {
    buildingsConfig: [],
    upgradesConfig: [],
    connectionsConfig: [],
    submissionConfig: { tiers: [], flavorText: { accepted: [], rejected: [] } },
    traitsConfig: { green: [], blue: [], purple: [], gold: [], red: [] },
    legendAdvisorsConfig: {},
    locale: {},
    clickUpgradesConfig: [], // Click upgrades configuration
    rps: 0,
    rpsCompute: 0,
    rpsAcademic: 0,
    clickPower: 1,
    totalFixedClickBonus: 1,  // Sum of all click upgrade fixed bonuses
    totalClickRpsPercent: 0,  // Sum of all click upgrade RPS percentages
    globalMultiplier: 1,
    lastTickTime: Date.now(),
    isGameStarted: false,
    transitionTimers: [], // Store setTimeout IDs for transition animations
    intervalIds: {}, // Store setInterval IDs for cleanup
    activeClickPhrases: [],
    lastGeneratedTitle: "Untitled Paper",
    submissionSession: null, // Current active submission/rebuttal

    // === AGI 觉醒系统 运行时状态 ===
    agi: {
        dialogueVisible: false,
        dialogueMinimized: false,
        currentOverlay: null,
        fakeCursorEnabled: false,
        fakeCursorOffset: { x: 0, y: 0 },
        realMousePos: { x: 0, y: 0 },
        currentState: 'IDLE',
        stateStartTime: null,
        pendingTransition: null,
        mouseMoveSamples: [],
        lastInputTime: null,
        clickTimestamps: [],
        currentDialogue: null,
        dialogueQueue: [],
        typewriterTimer: null,
        isTyping: false
    }
};

// The exported objects retain stable identity for all existing imports, while
// their actual defaults now come from the single versioned schema.
replaceMutableObject(State, createDefaultGameState());
replaceMutableObject(Runtime, createDefaultRuntimeState());

/**
 * Reset State to default values
 * Useful for prestige/new game
 */
export function resetState() {
    replaceMutableObject(State, createDefaultGameState());
}

/**
 * Merge saved data into State
 * @param {Object} savedData - Data loaded from localStorage
 */
export function mergeState(savedData) {
    if (!isPlainObject(savedData)) return;

    const normalized = normalizeGameState(savedData, {
        now: () => Number(savedData.lastSaveTime) || Date.now()
    });

    // Title generation expects strings, while legacy saves may contain mixed
    // JSON arrays. Keep the rest of the forward-compatible payload intact.
    normalized.userResearchTopics = normalized.userResearchTopics.filter(
        topic => typeof topic === 'string'
    );

    // AGI has additional semantic validation in agi/state.js. Preserve the
    // current object until loadGame applies that validator.
    normalized.agi = State.agi;
    replaceMutableObject(State, normalized);
}
