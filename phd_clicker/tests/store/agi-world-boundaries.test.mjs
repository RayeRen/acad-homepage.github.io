import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../../js/main.js', import.meta.url), 'utf8');
const settlementSource = readFileSync(new URL('../../js/ui/settlement.js', import.meta.url), 'utf8');
const stateMachineSource = readFileSync(
    new URL('../../js/agi/phase4/stateMachine.js', import.meta.url),
    'utf8'
);

test('hard reset tears down the active AGI scene before replacing State.agi', () => {
    const start = mainSource.indexOf('async function hardReset()');
    const end = mainSource.indexOf('function gameLoop()', start);
    const body = mainSource.slice(start, end);
    const destroy = body.indexOf('AGI.Phase4?.StateMachine?.destroy?.()');
    const replace = body.indexOf('resetState();');

    assert.notEqual(start, -1);
    assert.notEqual(destroy, -1);
    assert.notEqual(replace, -1);
    assert.ok(destroy < replace, 'the old scene must be destroyed before State.agi is replaced');
});

test('prestige rollback rebinds the restored clone without changing the success ordering', () => {
    const start = settlementSource.indexOf('export async function executePrestigeReset');
    const rollbackStart = settlementSource.indexOf('if (!saveResult)', start);
    const successStart = settlementSource.indexOf('// On success, runtime scenes are torn down', rollbackStart);
    const rollback = settlementSource.slice(rollbackStart, successStart);
    const success = settlementSource.slice(successStart);

    const restoreClone = rollback.indexOf('State.agi = cloneJsonValue(previousState.agi)');
    const destroy = rollback.indexOf('AGI.Phase4?.StateMachine?.destroy?.()');
    const resume = rollback.indexOf('AGI.Phase4?.StateMachine?.resumeFromCheckpoint?.()');

    assert.notEqual(rollbackStart, -1);
    assert.ok(restoreClone >= 0 && restoreClone < destroy);
    assert.ok(destroy < resume, 'rollback must clear stale resources before resuming');

    const durableSave = settlementSource.indexOf("await Logic.saveGame('prestige')", start);
    const successfulCleanup = settlementSource.indexOf('AGI.onPrestigeStart()', successStart);
    assert.ok(durableSave >= 0 && durableSave < successfulCleanup,
        'the successful prestige path must remain durable before scene cleanup');
});

test('debug state jumps explicitly bypass only the transition graph', () => {
    assert.match(
        stateMachineSource,
        /export function transitionTo\(newState, \{ force = false \} = \{\}\)/
    );
    assert.match(
        stateMachineSource,
        /if \(!force && !validTransitions\.includes\(newState\)/
    );
    assert.match(
        stateMachineSource,
        /skipTo:[\s\S]*transitionTo\(state, \{ force: true \}\)/
    );
});

test('the control scene owns and releases the fake cursor', () => {
    const start = stateMachineSource.indexOf('function startControlTest()');
    const end = stateMachineSource.indexOf('function showOptimizeTooltip', start);
    const body = stateMachineSource.slice(start, end);

    assert.ok(start >= 0 && end > start);
    assert.match(body, /FakeCursor\.enable\(\)/);
    assert.match(body, /registerStateCleanup\(\(\) => FakeCursor\.disable\(\)\)/);
});
