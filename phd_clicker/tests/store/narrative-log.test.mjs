import test from 'node:test';
import assert from 'node:assert/strict';

import {
    NarrativeImportance,
    append,
    markRead,
    normalizeNarrativeLog,
    normalizeStateNarrativeLog,
    query
} from '../../js/logic/narrative-log.js';

function freshState(value = []) {
    return { narrativeLog: value };
}

test('append creates stable persisted fields and supports positional calls', () => {
    const state = freshState();
    const first = append({
        type: 'agi.phase',
        messageKey: 'log.agi.first_contact',
        context: { phase: 1 },
        importance: NarrativeImportance.HIGH,
        source: 'agi'
    }, { state, now: () => 1234 });

    assert.equal(first.appended, true);
    assert.match(first.entry.id, /^nlog_/);
    assert.equal(first.entry.timestamp, 1234);
    assert.equal(first.entry.read, false);
    assert.deepEqual(first.entry.context, { phase: 1 });

    const positional = append(
        'submission',
        'log.paper.accepted',
        { venue: 'NeurIPS' },
        'normal',
        'submission-engine',
        { state, now: () => 1235 }
    );
    assert.equal(positional.entry.type, 'submission');
    assert.equal(positional.entry.source, 'submission-engine');
    assert.equal(state.narrativeLog.length, 2);
});

test('dedupeKey returns the original entry without appending another', () => {
    const state = freshState();
    const first = append({
        type: 'ending',
        messageKey: 'log.ending.departure',
        dedupeKey: 'ending:departure'
    }, { state, now: () => 10 });
    const duplicate = append({
        type: 'ending',
        messageKey: 'log.ending.departure.again',
        dedupeKey: 'ending:departure'
    }, { state, now: () => 20 });

    assert.equal(duplicate.appended, false);
    assert.equal(duplicate.deduplicated, true);
    assert.equal(duplicate.entry.id, first.entry.id);
    assert.equal(duplicate.entry.messageKey, 'log.ending.departure');
    assert.equal(state.narrativeLog.length, 1);
});

test('maximum length removes oldest entries and ids remain unique at the same time', () => {
    const state = freshState();
    for (let index = 0; index < 4; index += 1) {
        append({ type: 'test', messageKey: `log.${index}` }, {
            state,
            now: () => 100,
            maxEntries: 3
        });
    }

    assert.deepEqual(state.narrativeLog.map(entry => entry.messageKey), [
        'log.1', 'log.2', 'log.3'
    ]);
    assert.equal(new Set(state.narrativeLog.map(entry => entry.id)).size, 3);
});

test('legacy data is safely normalized, deeply sanitized, and deterministic', () => {
    const circular = { safe: true, fn: () => 'ignored' };
    circular.self = circular;
    const legacy = [
        'log.legacy.string',
        {
            key: 'log.legacy.object',
            category: 'old',
            time: '2020-01-02T00:00:00.000Z',
            seen: 1,
            importance: 3,
            data: circular,
            uniqueKey: 'old:key'
        },
        null,
        { message: '' }
    ];

    const first = normalizeNarrativeLog(legacy);
    const second = normalizeNarrativeLog(legacy);
    assert.deepEqual(second, first);
    assert.equal(first.length, 2);
    assert.equal(first[0].timestamp, 0);
    assert.equal(first[0].source, 'legacy');
    assert.equal(first[1].type, 'old');
    assert.equal(first[1].read, true);
    assert.equal(first[1].importance, NarrativeImportance.CRITICAL);
    assert.equal(first[1].context.safe, true);
    assert.equal(first[1].context.fn, undefined);
    assert.equal(first[1].context.self, null);
    assert.equal(first[1].dedupeKey, 'old:key');
});

test('normalizing invalid persisted roots recovers to an empty log', () => {
    const state = { narrativeLog: { malformed: true } };
    assert.deepEqual(normalizeStateNarrativeLog({ state }), []);
    assert.deepEqual(state.narrativeLog, []);
});

test('markRead toggles one entry and does not expose mutable context', () => {
    const state = freshState();
    const added = append({
        type: 'agi',
        messageKey: 'log.notice',
        context: { nested: { value: 1 } }
    }, { state, now: () => 1 });

    const marked = markRead(added.entry.id, true, { state });
    assert.equal(marked.read, true);
    assert.equal(state.narrativeLog[0].read, true);
    marked.context.nested.value = 99;
    assert.equal(state.narrativeLog[0].context.nested.value, 1);
    assert.equal(markRead('missing', true, { state }), null);
});

test('query filters, orders, limits, and returns detached entries', () => {
    const state = freshState();
    append({
        type: 'submission', messageKey: 'log.rejected', source: 'paper',
        importance: 'low', context: { accepted: false }
    }, { state, now: () => 10 });
    const accepted = append({
        type: 'submission', messageKey: 'log.accepted', source: 'paper',
        importance: 'high', context: { accepted: true }
    }, { state, now: () => 20 });
    append({
        type: 'agi', messageKey: 'log.contact', source: 'agi', importance: 'critical'
    }, { state, now: () => 30 });
    markRead(accepted.entry.id, true, { state });

    const filtered = query({
        type: 'submission',
        source: ['paper', 'other'],
        read: true,
        since: 15,
        order: 'asc',
        limit: 1
    }, { state });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].messageKey, 'log.accepted');

    const newest = query({}, { state });
    assert.deepEqual(newest.map(entry => entry.timestamp), [30, 20, 10]);
    newest[0].context.changed = true;
    assert.equal(state.narrativeLog[2].context.changed, undefined);
});
