import test from 'node:test';
import assert from 'node:assert/strict';

import { Runtime, State, resetState } from '../../js/state.js';
import {
    CommandType,
    clearSubscribers,
    dispatch,
    subscribe
} from '../../js/logic/commands.js';

test('command bus returns a standard outcome and emits one domain event', () => {
    resetState();
    Runtime.clickPower = 2;
    const events = [];
    const unsubscribe = subscribe(event => events.push(event));

    const outcome = dispatch(
        CommandType.RESEARCH_CLICK,
        {},
        { actor: 'player', source: 'test' }
    );

    unsubscribe();
    assert.equal(outcome.ok, true);
    assert.equal(outcome.result.value, 2);
    assert.equal(State.rp, 2);
    assert.equal(events.length, 1);
    assert.equal(events[0].command, CommandType.RESEARCH_CLICK);
    assert.equal(events[0].source, 'test');
});

test('failed and unknown commands never emit completion events', () => {
    resetState();
    clearSubscribers();
    const events = [];
    const unsubscribe = subscribe(event => events.push(event));

    const failedPurchase = dispatch(CommandType.BUILDING_BUY, { id: 'missing' });
    const unknown = dispatch('does.not.exist');

    unsubscribe();
    assert.equal(failedPurchase.ok, false);
    assert.equal(unknown.ok, false);
    assert.equal(events.length, 0);
});
