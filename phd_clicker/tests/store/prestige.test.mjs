import test from 'node:test';
import assert from 'node:assert/strict';

import { State, resetState } from '../../js/state.js';
import { executePrestige } from '../../js/logic/prestige.js';

function stats() {
    return {
        networking: { repEarned: 250 },
        raw: { nextOriginId: 'academic' }
    };
}

function addTopPapers(count) {
    State.acceptedPapers = Array.from({ length: count }, (_, index) => ({
        title: `Paper ${index}`,
        venue: 'NeurIPS',
        date: index
    }));
}

test('prestige cannot execute before the canonical requirement', () => {
    resetState();
    addTopPapers(2);
    State.rp = 500;

    const result = executePrestige({ stats: stats() });

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'requirements');
    assert.equal(State.rp, 500);
    assert.equal(State.generation, 1);
});

test('prestige is one atomic reset with explicit preserved fields', () => {
    resetState();
    addTopPapers(3);
    State.rp = 1000;
    State.totalRp = 5000;
    State.reputation = 100;
    State.ownedConnections = ['hinton'];
    State.purchasedUpgrades = ['upgrade'];
    State.purchasedClickUpgrades = ['click-upgrade'];
    State.submission.status = 'rebuttal';
    State.narrativeLog.push({ id: 'memory' });
    State.agi.phase = 2;
    State.agi.seenDialogues = ['hello'];

    const result = executePrestige({ stats: stats() });

    assert.equal(result.ok, true);
    assert.equal(State.rp, 50);
    assert.equal(State.totalRp, 50);
    assert.equal(State.reputation, 350);
    assert.equal(State.generation, 2);
    assert.equal(State.currentOrigin, 'academic');
    assert.deepEqual(State.ownedConnections, ['hinton']);
    assert.deepEqual(State.purchasedUpgrades, []);
    assert.deepEqual(State.purchasedClickUpgrades, []);
    assert.deepEqual(State.acceptedPapers, []);
    assert.equal(State.submission.status, 'idle');
    assert.deepEqual(State.narrativeLog, [{ id: 'memory' }]);
    assert.equal(State.agi.phase, 0);
    assert.equal(State.agi.remembersPlayer, true);
    assert.deepEqual(State.agi.seenDialogues, ['hello']);
});
