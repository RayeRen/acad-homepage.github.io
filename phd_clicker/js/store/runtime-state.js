/**
 * Runtime-only state. Nothing returned by this factory belongs in a save
 * envelope.
 */

export function createDefaultAgiRuntimeState() {
    return {
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
        isTyping: false,
        phaseJustEntered: false,
        skipPhase1Dialogues: false
    };
}

/**
 * Create runtime/configuration state matching the current Runtime singleton.
 *
 * @param {{ now?: () => number }} [options]
 */
export function createDefaultRuntimeState({ now = Date.now } = {}) {
    return {
        buildingsConfig: [],
        upgradesConfig: [],
        connectionsConfig: [],
        submissionConfig: {
            tiers: [],
            flavorText: { accepted: [], rejected: [] }
        },
        traitsConfig: { green: [], blue: [], purple: [], gold: [], red: [] },
        legendAdvisorsConfig: {},
        locale: {},
        clickUpgradesConfig: [],

        rps: 0,
        rpsCompute: 0,
        rpsAcademic: 0,
        clickPower: 1,
        totalFixedClickBonus: 1,
        totalClickRpsPercent: 0,
        globalMultiplier: 1,

        lastTickTime: now(),
        isGameStarted: false,
        transitionTimers: [],
        intervalIds: {},
        activeClickPhrases: [],
        lastGeneratedTitle: 'Untitled Paper',
        submissionSession: null,

        agi: createDefaultAgiRuntimeState()
    };
}
