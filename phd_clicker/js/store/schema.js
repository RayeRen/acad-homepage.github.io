/**
 * Versioned save schema for PhD Clicker.
 *
 * This module deliberately has no dependency on the current mutable State
 * singleton. It is the canonical source for persisted defaults going forward.
 */

export const SAVE_FORMAT = 'phd-clicker-save';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Create the complete default AGI test record used by the current game.
 * A factory is used so callers never share nested mutable objects.
 */
export function createDefaultAgiTestData() {
    return {
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
        phaseTimestamps: {},
        cheatDetected: false,
        cheatType: null,
        isAfk: false,
        totalAfkDuration: 0
    };
}

/**
 * Create the complete persisted AGI state currently used across state.js and
 * agi/state.js. Fields that existed only in the latter are included here so a
 * legacy save is deeply completed instead of receiving two different defaults.
 */
export function createDefaultAgiState() {
    return {
        phase: 0,
        dialogueIndex: 0,
        hasAwakened: false,
        endingReached: null,

        totalGenerationsMet: 0,
        remembersPlayer: false,
        firstMeetingTime: null,

        seenDialogues: [],
        playerResponses: {},
        testData: createDefaultAgiTestData(),

        playerType: null,
        firstEndingChoice: null,
        songUnlocked: false,
        symbiosisUnlocked: false,

        sessionCount: 0,
        lastSessionDate: null,
        wasInterrupted: false,
        interruptedState: null,

        fsm: {
            version: 1,
            active: false,
            runId: null,
            state: 'IDLE',
            stateStartedAt: null,
            checkpointAt: null,
            playerPhase5Choice: null,
            stateData: {},
            sequence: 0,
            resumeCount: 0,
            lastCompletedState: null,
            reason: null
        },
        metaEffects: {
            boundaryTriggeredAt: null,
            effects: {}
        },

        departureComplete: false
    };
}

/**
 * Canonical persisted game defaults.
 *
 * @param {{ now?: () => number }} [options]
 */
export function createDefaultGameState({ now = Date.now } = {}) {
    return {
        rp: 0,
        totalRp: 0,
        citations: 0,
        papersSubmitted: 0,
        citationsRate: 0,
        inventory: {},
        purchasedUpgrades: [],
        purchasedClickUpgrades: [],
        acceptedPapers: [],
        userResearchTopics: [],
        submission: {
            status: 'idle',
            pending: null,
            session: null,
            revisionBonuses: {}
        },
        narrativeLog: [],

        generation: 1,
        reputation: 0,
        currentOrigin: 'none',
        ownedConnections: [],
        introSeen: true,

        currentAdvisor: null,
        advisorSeen: true,
        advisorBonusAppliedGeneration: 0,
        stats: {
            lifetime_rp_click: 0,
            lifetime_rp_compute: 0,
            lifetime_rp_academic: 0,
            lifetime_clicks: 0,
            total_papers: 0
        },

        currentLang: 'zh',
        lastSaveTime: now(),
        agi: createDefaultAgiState()
    };
}

/**
 * Meta progress is intentionally separate from the current world. A future
 * IndexedDB-backed reflog can persist this record even when the HEAD save is
 * removed. For now the envelope gives consumers a stable shape to migrate.
 */
export function createDefaultMetaState() {
    return {
        worldEpoch: 0,
        annihilationCount: 0,
        lastAnnihilationAt: null,
        lastAnnihilationObjectId: null,
        lastEnding: null,
        recoveredFromAnnihilation: false,
        recoveredAt: null,
        recoveredObjectId: null
    };
}

/**
 * Create an unsealed current-version envelope. SaveRepository adds a checksum
 * before it writes the envelope.
 *
 * @param {{ now?: () => number }} [options]
 */
export function createDefaultSaveEnvelope({ now = Date.now } = {}) {
    const savedAt = now();

    return {
        format: SAVE_FORMAT,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt,
        gameState: createDefaultGameState({ now: () => savedAt }),
        metaState: createDefaultMetaState(),
        checksum: null
    };
}
