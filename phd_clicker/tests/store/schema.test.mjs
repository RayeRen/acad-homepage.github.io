import test from 'node:test';
import assert from 'node:assert/strict';

import {
    InvalidSaveError,
    createDefaultGameState,
    deepFillDefaults,
    migrateSave
} from '../../js/store/index.js';

test('default factories never share nested mutable values', () => {
    const first = createDefaultGameState({ now: () => 100 });
    const second = createDefaultGameState({ now: () => 100 });

    first.stats.total_papers = 9;
    first.agi.testData.panicClicks = 4;
    first.submission.revisionBonuses.tier_1 = 0.05;
    first.narrativeLog.push({ id: 'changed' });

    assert.equal(second.stats.total_papers, 0);
    assert.equal(second.agi.testData.panicClicks, 0);
    assert.deepEqual(second.submission.revisionBonuses, {});
    assert.deepEqual(second.narrativeLog, []);
});

test('legacy saves are deeply completed while unknown fields survive', () => {
    const legacy = {
        rp: '42',
        stats: { lifetime_clicks: 3 },
        agi: { phase: 2, testData: { panicClicks: 7 } },
        futureField: { enabled: true }
    };

    const result = migrateSave(legacy, { now: () => 200 });

    assert.equal(result.migratedFrom, 'legacy');
    assert.equal(result.envelope.gameState.rp, 42);
    assert.equal(result.envelope.gameState.stats.lifetime_clicks, 3);
    assert.equal(result.envelope.gameState.stats.total_papers, 0);
    assert.equal(result.envelope.gameState.agi.phase, 2);
    assert.equal(result.envelope.gameState.agi.testData.panicClicks, 7);
    assert.equal(result.envelope.gameState.agi.testData.totalAfkDuration, 0);
    assert.deepEqual(result.envelope.gameState.futureField, { enabled: true });
});

test('deep fill blocks prototype keys from changing object prototypes', () => {
    const candidate = JSON.parse('{"safe":2,"__proto__":{"polluted":true}}');
    const result = deepFillDefaults({ safe: 1 }, candidate);

    assert.equal(result.safe, 2);
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal({}.polluted, undefined);
});

test('a current envelope without gameState is rejected as corrupt', () => {
    assert.throws(
        () => migrateSave({
            format: 'phd-clicker-save',
            schemaVersion: 1,
            savedAt: 123,
            checksum: null
        }),
        InvalidSaveError
    );
});
