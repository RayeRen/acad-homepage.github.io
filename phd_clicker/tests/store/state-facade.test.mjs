import test from 'node:test';
import assert from 'node:assert/strict';

import { Runtime, State, mergeState, resetState } from '../../js/state.js';

test('state facade is initialized from the canonical schema', () => {
    assert.equal(State.submission.status, 'idle');
    assert.deepEqual(State.narrativeLog, []);
    assert.equal(State.agi.departureComplete, false);
    assert.equal(State.agi.testData.totalAfkDuration, 0);
    assert.equal(Runtime.agi.currentState, 'IDLE');
});

test('reset preserves exported object identity and restores deep defaults', () => {
    const reference = State;
    State.rp = 100;
    State.submission.status = 'rebuttal';
    State.agi.testData.panicClicks = 8;

    resetState();

    assert.equal(State, reference);
    assert.equal(State.rp, 0);
    assert.equal(State.submission.status, 'idle');
    assert.equal(State.agi.testData.panicClicks, 0);
});

test('merge deeply completes legacy state and leaves AGI to semantic validation', () => {
    resetState();
    const originalAgi = State.agi;

    mergeState({
        rp: '55',
        stats: { lifetime_clicks: 4 },
        userResearchTopics: ['safe', 12],
        agi: { phase: 5 },
        futureWorldField: { value: 1 }
    });

    assert.equal(State.rp, 55);
    assert.equal(State.stats.lifetime_clicks, 4);
    assert.equal(State.stats.total_papers, 0);
    assert.deepEqual(State.userResearchTopics, ['safe']);
    assert.equal(State.agi, originalAgi);
    assert.deepEqual(State.futureWorldField, { value: 1 });
});
