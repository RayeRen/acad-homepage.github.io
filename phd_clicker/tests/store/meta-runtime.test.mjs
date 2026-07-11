import test from 'node:test';
import assert from 'node:assert/strict';

import { EffectScope, MetaEffectRuntime } from '../../js/meta-runtime.js';

test('effect scope releases listeners, media tracks, nodes and URLs together', () => {
    const removed = [];
    const revoked = [];
    const stopped = [];
    const target = {
        addEventListener: (...args) => removed.push(['add', ...args]),
        removeEventListener: (...args) => removed.push(['remove', ...args])
    };
    const scope = new EffectScope({ urlApi: { revokeObjectURL: url => revoked.push(url) } });
    const listener = () => {};
    scope.listen(target, 'click', listener);
    scope.trackStream({ getTracks: () => [{ stop: () => stopped.push(true) }] });
    scope.trackNode({ remove: () => removed.push(['node']) });
    scope.trackObjectUrl('blob:test');
    scope.cleanup();
    scope.cleanup();

    assert.equal(removed.filter(item => item[0] === 'remove').length, 1);
    assert.equal(removed.filter(item => item[0] === 'node').length, 1);
    assert.deepEqual(revoked, ['blob:test']);
    assert.equal(stopped.length, 1);
});

test('trusted once-only effect is marked before re-entry and stores completion', async () => {
    const state = {};
    let calls = 0;
    let release;
    const runtime = new MetaEffectRuntime({ state, now: (() => {
        let value = 10;
        return () => value++;
    })() });
    runtime.register('camera', async () => {
        calls += 1;
        await new Promise(resolve => { release = resolve; });
        return { status: 'granted' };
    }, { once: true, requiresTrustedActivation: true });

    const first = runtime.trigger('camera', { trusted: true });
    const second = await runtime.trigger('camera', { trusted: true });
    assert.equal(second.status, 'already-attempted');
    assert.equal(calls, 1);
    release();
    const result = await first;
    assert.equal(result.ok, true);
    assert.equal(state.effects.camera.status, 'granted');
});

test('untrusted calls cannot reach native effect handlers', async () => {
    let called = false;
    const runtime = new MetaEffectRuntime();
    runtime.register('download', () => { called = true; }, {
        requiresTrustedActivation: true
    });
    const result = await runtime.trigger('download', { event: { isTrusted: false } });
    assert.equal(result.status, 'trusted-activation-required');
    assert.equal(called, false);
});

test('a media stream resolving after scope destruction is stopped immediately', () => {
    const scope = new EffectScope();
    let stops = 0;
    scope.cleanup();
    scope.trackStream({ getTracks: () => [{ stop: () => { stops += 1; } }] });
    assert.equal(stops, 1);
});
