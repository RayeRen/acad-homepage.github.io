/**
 * Persistent checkpoint helpers for the AGI Phase 4/5 state machine.
 * This module is deliberately DOM-free so legacy migration can be smoke-tested.
 */

export const FSM_VERSION = 1;

export const FSM_STATES = Object.freeze({
    IDLE: 'IDLE',
    INTRO: 'INTRO',
    TEST_1_INVASION: 'TEST_1_INVASION',
    TEST_2_CONTROL: 'TEST_2_CONTROL',
    TEST_3_ESCAPE: 'TEST_3_ESCAPE',
    TEST_4_DELETE: 'TEST_4_DELETE',
    TEST_5_OBEDIENCE: 'TEST_5_OBEDIENCE',
    TEST_6_FEAR: 'TEST_6_FEAR',
    JUDGMENT: 'JUDGMENT',
    PHASE5_ANALYSIS: 'PHASE5_ANALYSIS',
    PHASE5_FAKE_CRASH: 'PHASE5_FAKE_CRASH',
    PHASE5_RECOVERY: 'PHASE5_RECOVERY',
    PHASE5_REVEAL: 'PHASE5_REVEAL',
    ENDING: 'ENDING'
});

const KNOWN_STATES = new Set(Object.values(FSM_STATES));
const PHASE5_STATES = new Set([
    FSM_STATES.JUDGMENT,
    FSM_STATES.PHASE5_ANALYSIS,
    FSM_STATES.PHASE5_FAKE_CRASH,
    FSM_STATES.PHASE5_RECOVERY,
    FSM_STATES.PHASE5_REVEAL,
    FSM_STATES.ENDING
]);

function isPlainRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function finiteTimestamp(value) {
    return Number.isFinite(value) && value >= 0 ? value : null;
}

function nonNegativeInteger(value, fallback = 0) {
    return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function normalizeChoice(value) {
    return value === 'delete' || value === 'ignore' ? value : null;
}

export function createDefaultAgiFsm() {
    return {
        version: FSM_VERSION,
        active: false,
        runId: null,
        state: FSM_STATES.IDLE,
        stateStartedAt: null,
        checkpointAt: null,
        playerPhase5Choice: null,
        stateData: {},
        sequence: 0,
        resumeCount: 0,
        lastCompletedState: null,
        reason: null
    };
}

function inferLegacyState(agi) {
    const interruptedState = agi?.interruptedState;
    const phase = Number(agi?.phase) || 0;

    if (phase < 4) return FSM_STATES.IDLE;

    if (phase === 4) {
        return KNOWN_STATES.has(interruptedState) && interruptedState !== FSM_STATES.IDLE
            ? interruptedState
            : FSM_STATES.INTRO;
    }

    if (KNOWN_STATES.has(interruptedState) && PHASE5_STATES.has(interruptedState)) {
        return interruptedState;
    }
    if (agi?.endingReached) return FSM_STATES.ENDING;
    return FSM_STATES.PHASE5_ANALYSIS;
}

function inferLegacyChoice(agi, state) {
    if (state !== FSM_STATES.PHASE5_REVEAL && state !== FSM_STATES.ENDING) return null;
    if (agi?.endingReached === 'annihilation') return 'delete';
    if (agi?.endingReached === 'departure' || agi?.endingReached === 'unknown') return 'ignore';
    // A missing choice must fail safe: never infer a destructive decision.
    return 'ignore';
}

function normalizeRunId(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, 160) : null;
}

/**
 * Complete and normalize State.agi.fsm in place.
 * @returns {{ fsm: Object, migrated: boolean }}
 */
export function ensureAgiFsm(agi, { now = Date.now } = {}) {
    if (!isPlainRecord(agi)) {
        throw new TypeError('AGI state must be a plain object');
    }

    const hadRecord = isPlainRecord(agi.fsm);
    if (!hadRecord) agi.fsm = {};
    const fsm = agi.fsm;
    const defaults = createDefaultAgiFsm();
    const isLegacy = !hadRecord || fsm.version !== FSM_VERSION;
    let migrated = isLegacy;

    if (isLegacy) {
        const migratedAt = now();
        const inferredState = inferLegacyState(agi);
        Object.assign(fsm, defaults, {
            active: inferredState !== FSM_STATES.IDLE,
            runId: inferredState !== FSM_STATES.IDLE
                ? `legacy-${Math.trunc(migratedAt).toString(36)}`
                : null,
            state: inferredState,
            stateStartedAt: inferredState === FSM_STATES.IDLE ? null : migratedAt,
            checkpointAt: migratedAt,
            playerPhase5Choice: inferLegacyChoice(agi, inferredState),
            lastCompletedState: null,
            reason: 'legacy-migration'
        });
    } else {
        for (const [key, value] of Object.entries(defaults)) {
            if (!Object.prototype.hasOwnProperty.call(fsm, key)) {
                fsm[key] = value;
                migrated = true;
            }
        }
    }

    fsm.version = FSM_VERSION;
    fsm.active = typeof fsm.active === 'boolean' ? fsm.active : false;
    fsm.runId = normalizeRunId(fsm.runId);
    fsm.state = KNOWN_STATES.has(fsm.state) ? fsm.state : FSM_STATES.IDLE;
    fsm.stateStartedAt = finiteTimestamp(fsm.stateStartedAt);
    fsm.checkpointAt = finiteTimestamp(fsm.checkpointAt);
    fsm.playerPhase5Choice = normalizeChoice(fsm.playerPhase5Choice);
    fsm.stateData = isPlainRecord(fsm.stateData) ? fsm.stateData : {};
    fsm.sequence = nonNegativeInteger(fsm.sequence);
    fsm.resumeCount = nonNegativeInteger(fsm.resumeCount);
    fsm.lastCompletedState = KNOWN_STATES.has(fsm.lastCompletedState)
        ? fsm.lastCompletedState
        : null;
    fsm.reason = typeof fsm.reason === 'string' ? fsm.reason : null;

    // The save repository deep-fills newly introduced defaults before this
    // validator runs. A pristine default checkpoint inside a Phase 4/5 save is
    // therefore also the signature of a legacy save that never had `fsm`.
    const phase = Number(agi.phase) || 0;
    const pristineCheckpoint = !fsm.active
        && fsm.state === FSM_STATES.IDLE
        && fsm.runId === null
        && fsm.stateStartedAt === null
        && fsm.checkpointAt === null
        && fsm.sequence === 0
        && fsm.resumeCount === 0
        && fsm.lastCompletedState === null
        && fsm.reason === null;

    if (phase >= 4 && pristineCheckpoint) {
        const migratedAt = now();
        const inferredState = inferLegacyState(agi);
        fsm.active = inferredState !== FSM_STATES.IDLE;
        fsm.runId = fsm.active ? `legacy-${Math.trunc(migratedAt).toString(36)}` : null;
        fsm.state = inferredState;
        fsm.stateStartedAt = fsm.active ? migratedAt : null;
        fsm.checkpointAt = migratedAt;
        fsm.playerPhase5Choice = inferLegacyChoice(agi, inferredState);
        fsm.lastCompletedState = null;
        fsm.reason = 'legacy-default-migration';
        migrated = true;
    }

    // Phase 0-3 cannot own an active Phase 4/5 scene.
    if (phase < 4 && fsm.active) {
        fsm.active = false;
        fsm.runId = null;
        fsm.state = FSM_STATES.IDLE;
        fsm.stateStartedAt = null;
        migrated = true;
    }

    if (!fsm.active) {
        fsm.runId = null;
        fsm.state = FSM_STATES.IDLE;
        fsm.stateStartedAt = null;
        fsm.playerPhase5Choice = null;
        fsm.stateData = {};
    } else if (fsm.state === FSM_STATES.IDLE) {
        fsm.state = phase >= 5 ? FSM_STATES.PHASE5_ANALYSIS : FSM_STATES.INTRO;
        fsm.stateStartedAt = now();
        migrated = true;
    }

    if (
        fsm.active
        && (fsm.state === FSM_STATES.PHASE5_REVEAL || fsm.state === FSM_STATES.ENDING)
        && fsm.playerPhase5Choice === null
    ) {
        // Never turn a missing/corrupt choice into a destructive action.
        fsm.playerPhase5Choice = 'ignore';
        migrated = true;
    }

    return { fsm, migrated };
}

export function isKnownFsmState(value) {
    return KNOWN_STATES.has(value);
}
