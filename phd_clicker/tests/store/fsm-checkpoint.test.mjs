import test from 'node:test';
import assert from 'node:assert/strict';

import {
    FSM_STATES,
    createDefaultAgiFsm,
    ensureAgiFsm
} from '../../js/agi/phase4/fsmCheckpoint.js';
import { createDefaultAgiState } from '../../js/store/schema.js';

test('schema and AGI checkpoint helper share one complete default shape', () => {
    assert.deepEqual(createDefaultAgiState().fsm, createDefaultAgiFsm());
});
test('legacy phase 4 interruption resumes its explicit scene', () => {
    const agi = {
        phase: 4,
        interruptedState: FSM_STATES.TEST_4_DELETE,
        endingReached: null
    };
    const { fsm, migrated } = ensureAgiFsm(agi, { now: () => 100 });
    assert.equal(migrated, true);
    assert.equal(fsm.active, true);
    assert.equal(fsm.state, FSM_STATES.TEST_4_DELETE);
    assert.equal(fsm.checkpointAt, 100);
});

test('phase 5 missing choice fails safe to ignore rather than delete', () => {
    const agi = {
        phase: 5,
        interruptedState: FSM_STATES.PHASE5_REVEAL,
        endingReached: null
    };
    const { fsm } = ensureAgiFsm(agi, { now: () => 200 });
    assert.equal(fsm.state, FSM_STATES.PHASE5_REVEAL);
    assert.equal(fsm.playerPhase5Choice, 'ignore');
});

test('deep-filled pristine checkpoint is recognized as a legacy phase 5 save', () => {
    const agi = {
        phase: 5,
        endingReached: null,
        interruptedState: null,
        fsm: createDefaultAgiFsm()
    };
    const { fsm, migrated } = ensureAgiFsm(agi, { now: () => 300 });
    assert.equal(migrated, true);
    assert.equal(fsm.active, true);
    assert.equal(fsm.state, FSM_STATES.PHASE5_ANALYSIS);
});

test('an impossible active checkpoint before phase 4 is neutralized', () => {
    const agi = {
        phase: 2,
        fsm: {
            ...createDefaultAgiFsm(),
            active: true,
            runId: 'tampered',
            state: FSM_STATES.TEST_6_FEAR
        }
    };
    const { fsm } = ensureAgiFsm(agi, { now: () => 400 });
    assert.equal(fsm.active, false);
    assert.equal(fsm.runId, null);
    assert.equal(fsm.state, FSM_STATES.IDLE);
});
