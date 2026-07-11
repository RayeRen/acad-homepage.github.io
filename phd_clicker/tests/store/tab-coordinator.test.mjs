import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BarrierCommittedError,
    BarrierConflictError,
    DEFAULT_WORLD_BARRIER_KEY,
    DEFAULT_WORLD_EPOCH_KEY,
    DEFAULT_WORLD_TOMBSTONE_KEY,
    TabCoordinator
} from '../../js/store/tab-coordinator.js';

class MemoryStorage {
    constructor() { this.entries = new Map(); }
    getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
    setItem(key, value) { this.entries.set(key, String(value)); }
    removeItem(key) { this.entries.delete(key); }
}

class FaultyStorage extends MemoryStorage {
    armFailure(predicate) {
        this.failure = predicate;
    }
    maybeFail(operation, key, value = null) {
        if (!this.failure?.(operation, key, value)) return;
        this.failure = null;
        throw new Error(`planned ${operation} failure for ${key}`);
    }
    setItem(key, value) {
        this.maybeFail('set', key, String(value));
        super.setItem(key, value);
    }
    removeItem(key) {
        this.maybeFail('remove', key);
        super.removeItem(key);
    }
}

class ChannelHub {
    constructor() { this.channels = new Set(); }
    create() {
        const hub = this;
        const listeners = new Set();
        const channel = {
            closed: false,
            addEventListener(type, listener) {
                if (type === 'message') listeners.add(listener);
            },
            removeEventListener(type, listener) {
                if (type === 'message') listeners.delete(listener);
            },
            postMessage(message) {
                if (channel.closed) throw new Error('channel closed');
                for (const peer of hub.channels) {
                    if (peer === channel || peer.closed) continue;
                    peer.deliver(JSON.parse(JSON.stringify(message)));
                }
            },
            deliver(data) {
                for (const listener of listeners) listener({ data });
            },
            close() {
                channel.closed = true;
                hub.channels.delete(channel);
                listeners.clear();
            }
        };
        this.channels.add(channel);
        return channel;
    }
}

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

function testTimers() {
    return {
        setTimeout,
        clearTimeout,
        setInterval: () => Symbol('interval'),
        clearInterval: () => undefined
    };
}

function makeCoordinator({
    storage,
    channel,
    tabId,
    now,
    onBarrier,
    ackTimeoutMs = 100,
    barrierLeaseMs,
    timers = testTimers()
}) {
    return new TabCoordinator({
        storage,
        channel,
        tabId,
        clock: () => now.value,
        timers,
        onBarrier,
        ackTimeoutMs,
        barrierLeaseMs,
        heartbeatMs: 1000,
        peerTtlMs: 5000
    });
}

test('two tabs wait for an in-flight peer flush before acknowledgement', async t => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const now = { value: 100 };
    const flush = deferred();
    let peerBarrierCalls = 0;
    const first = makeCoordinator({
        storage, channel: hub.create(), tabId: 'tab-a', now,
        onBarrier: async () => undefined
    });
    const second = makeCoordinator({
        storage, channel: hub.create(), tabId: 'tab-b', now,
        onBarrier: async () => {
            peerBarrierCalls += 1;
            await flush.promise;
        }
    });
    t.after(() => { first.destroy(); second.destroy(); });

    const token = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'annihilation' });
    assert.deepEqual(token.peerIds, ['tab-b']);
    assert.equal(second.canWrite(0), false);
    assert.equal(first.canWrite(0), false);
    assert.equal(first.canWriteDuringBarrier(token, 0), true);
    assert.equal(second.canWriteDuringBarrier(token, 0), false);

    let settled = false;
    const waiting = first.waitForAcks(token).then(result => {
        settled = true;
        return result;
    });
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(peerBarrierCalls, 1);
    assert.equal(settled, false);

    flush.resolve();
    const acknowledgements = await waiting;
    assert.equal(acknowledgements.complete, true);
    assert.deepEqual(acknowledgements.acked, ['tab-b']);
    assert.deepEqual(acknowledgements.missing, []);
});

test('commit persists epoch/tombstone and only a claimed new epoch can write', async t => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const now = { value: 10 };
    const first = makeCoordinator({ storage, channel: hub.create(), tabId: 'a', now });
    const stalePeer = makeCoordinator({ storage, channel: hub.create(), tabId: 'b', now });
    t.after(() => { first.destroy(); stalePeer.destroy(); });

    const token = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'reset' });
    assert.equal((await first.waitForAcks(token)).complete, true);
    now.value = 20;
    const tombstone = first.commitBarrier(token, {
        objectId: 'obj:annihilation:abc',
        checksum: 'abc',
        recovery: false,
        reason: 'metadata-cannot-overwrite-core',
        toEpoch: 999,
        ignored: { nested: true }
    });

    assert.equal(storage.getItem(DEFAULT_WORLD_EPOCH_KEY), '1');
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.equal(JSON.parse(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY)).status, 'committed');
    assert.equal(tombstone.toEpoch, 1);
    assert.equal(tombstone.reason, 'reset');
    assert.equal(tombstone.objectId, 'obj:annihilation:abc');
    assert.equal(tombstone.checksum, 'abc');
    assert.equal(tombstone.recovery, false);
    assert.equal('ignored' in tombstone, false);
    assert.equal(first.canWrite(0), false);
    assert.equal(stalePeer.canWrite(0), false);
    assert.equal(stalePeer.getWriterEpoch(), 0);
    assert.equal(first.claimEpoch(1), true);
    assert.equal(first.getWriterEpoch(), 1);
    assert.equal(first.canWrite(), true);
});

test('a conflicting barrier cannot replace a live compare-written barrier', async t => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const now = { value: 50 };
    const first = makeCoordinator({ storage, channel: hub.create(), tabId: 'a', now });
    const second = makeCoordinator({ storage, channel: hub.create(), tabId: 'b', now });
    t.after(() => { first.destroy(); second.destroy(); });

    const token = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'first' });
    assert.throws(
        () => second.beginBarrier({ fromEpoch: 0, toEpoch: 2, reason: 'conflict' }),
        BarrierConflictError
    );
    assert.equal(JSON.parse(storage.getItem(DEFAULT_WORLD_BARRIER_KEY)).id, token.id);
});

test('abort releases peers without changing epoch, while committed barriers cannot abort', async t => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const now = { value: 60 };
    const first = makeCoordinator({ storage, channel: hub.create(), tabId: 'a', now });
    const second = makeCoordinator({ storage, channel: hub.create(), tabId: 'b', now });
    t.after(() => { first.destroy(); second.destroy(); });

    const aborted = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'cancel-me' });
    assert.equal(second.canWrite(0), false);
    const pendingWait = first.waitForAcks(aborted, {
        peerIds: ['unresponsive-peer'],
        timeoutMs: 1000
    });
    assert.equal(first.abortBarrier(aborted, 'archive failed'), true);
    assert.equal((await pendingWait).aborted, true);
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.equal(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY), null);
    assert.equal(storage.getItem(DEFAULT_WORLD_EPOCH_KEY), '0');
    assert.equal(first.canWrite(0), true);
    assert.equal(second.canWrite(0), true);

    const committed = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'commit-me' });
    await first.waitForAcks(committed);
    first.commitBarrier(committed);
    assert.throws(() => first.abortBarrier(committed), BarrierCommittedError);
});

test('without BroadcastChannel storage barriers still invalidate stale writers', async t => {
    const storage = new MemoryStorage();
    const now = { value: 70 };
    const first = makeCoordinator({ storage, channel: null, tabId: 'a', now });
    const second = makeCoordinator({ storage, channel: null, tabId: 'b', now });
    t.after(() => { first.destroy(); second.destroy(); });

    const token = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'offline-channel' });
    assert.deepEqual(token.peerIds, []);
    const acknowledgements = await first.waitForAcks(token);
    assert.equal(acknowledgements.complete, true);
    assert.equal(acknowledgements.timedOut, false);
    assert.equal(second.canWrite(0), false);

    first.commitBarrier(token);
    assert.equal(second.canWrite(0), false);
    assert.equal(first.claimEpoch(1), true);
});

test('ack timeout is bounded and reports the active peer snapshot as missing', async t => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const now = { value: 80 };
    const never = deferred();
    let scheduledTimeout = null;
    const acceleratedTimers = {
        setTimeout(callback, milliseconds) {
            scheduledTimeout = milliseconds;
            return setTimeout(callback, 0);
        },
        clearTimeout,
        setInterval: () => Symbol('interval'),
        clearInterval: () => undefined
    };
    const first = makeCoordinator({
        storage, channel: hub.create(), tabId: 'a', now, ackTimeoutMs: 10,
        timers: acceleratedTimers
    });
    const second = makeCoordinator({
        storage, channel: hub.create(), tabId: 'b', now,
        onBarrier: () => never.promise
    });
    t.after(() => { first.destroy(); second.destroy(); never.resolve(); });

    const token = first.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'timeout' });
    const result = await first.waitForAcks(token, { timeoutMs: 10_000 });
    assert.equal(result.timedOut, true);
    assert.equal(result.complete, false);
    assert.deepEqual(result.missing, ['b']);
    assert.equal(scheduledTimeout, 1500);
});

test('destroy closes messaging, clears heartbeat, and settles pending ack waits', async () => {
    const storage = new MemoryStorage();
    const hub = new ChannelHub();
    const channel = hub.create();
    const now = { value: 90 };
    let intervalCleared = false;
    const timers = {
        setTimeout,
        clearTimeout,
        setInterval: () => 'heartbeat-id',
        clearInterval(id) {
            assert.equal(id, 'heartbeat-id');
            intervalCleared = true;
        }
    };
    const coordinator = makeCoordinator({
        storage, channel, tabId: 'a', now, timers
    });
    const token = coordinator.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'destroy' });
    const waiting = coordinator.waitForAcks(token, {
        peerIds: ['ghost-peer'],
        timeoutMs: 1000
    });

    coordinator.destroy();
    const result = await waiting;
    assert.equal(result.destroyed, true);
    assert.deepEqual(result.missing, ['ghost-peer']);
    assert.equal(intervalCleared, true);
    assert.equal(channel.closed, true);
    coordinator.destroy();
});

test('an unexpired lease stays fail-closed and its owner heartbeat renews it', () => {
    const storage = new MemoryStorage();
    const now = { value: 100 };
    let heartbeat = null;
    const timers = {
        setTimeout,
        clearTimeout,
        setInterval(callback) { heartbeat = callback; return 'lease-heartbeat'; },
        clearInterval() {}
    };
    const owner = makeCoordinator({
        storage, channel: null, tabId: 'owner', now,
        barrierLeaseMs: 3000, timers
    });
    const token = owner.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'leased' });
    const initial = JSON.parse(storage.getItem(DEFAULT_WORLD_BARRIER_KEY));
    assert.equal(initial.leaseUntil, 3100);

    now.value = 500;
    heartbeat();
    const renewed = JSON.parse(storage.getItem(DEFAULT_WORLD_BARRIER_KEY));
    assert.equal(renewed.id, token.id);
    assert.equal(renewed.heartbeatAt, 500);
    assert.equal(renewed.leaseUntil, 3500);

    const peer = makeCoordinator({
        storage, channel: null, tabId: 'peer', now,
        barrierLeaseMs: 3000
    });
    assert.equal(peer.canWrite(0), false);
    assert.throws(
        () => peer.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'takeover-too-soon' }),
        BarrierConflictError
    );
    owner.destroy();
    peer.destroy();
});

test('refresh aborts an expired source-epoch barrier and matching partial tombstone', () => {
    const storage = new MemoryStorage();
    const now = { value: 100 };
    const owner = makeCoordinator({
        storage, channel: null, tabId: 'owner', now,
        barrierLeaseMs: 3000
    });
    const token = owner.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'crash-before-epoch' });
    const barrier = JSON.parse(storage.getItem(DEFAULT_WORLD_BARRIER_KEY));
    storage.setItem(DEFAULT_WORLD_TOMBSTONE_KEY, JSON.stringify({
        barrierId: token.id,
        ownerId: 'owner',
        fromEpoch: 0,
        toEpoch: 1,
        reason: token.reason,
        status: 'committing',
        startedAt: barrier.startedAt,
        committedAt: null
    }));
    owner.destroy();

    now.value = barrier.leaseUntil + 1;
    const refreshed = makeCoordinator({
        storage, channel: null, tabId: 'refreshed', now,
        barrierLeaseMs: 3000
    });
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.equal(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY), null);
    assert.equal(storage.getItem(DEFAULT_WORLD_EPOCH_KEY), '0');
    assert.equal(refreshed.canWrite(0), true);
    assert.equal(refreshed.reconcilePersistentTransition().status, 'none');
    refreshed.destroy();
});

test('refresh completes an epoch-advanced committing transition idempotently', () => {
    const storage = new MemoryStorage();
    const now = { value: 900 };
    const barrier = {
        id: 'dead-tab:0->1',
        ownerId: 'dead-tab',
        fromEpoch: 0,
        toEpoch: 1,
        reason: 'annihilation',
        status: 'pending',
        startedAt: 100,
        heartbeatAt: 100,
        leaseUntil: 5000
    };
    storage.setItem(DEFAULT_WORLD_EPOCH_KEY, '1');
    storage.setItem(DEFAULT_WORLD_BARRIER_KEY, JSON.stringify(barrier));
    storage.setItem(DEFAULT_WORLD_TOMBSTONE_KEY, JSON.stringify({
        objectId: 'obj:annihilation:refresh',
        checksum: 'refresh-checksum',
        recovery: true,
        barrierId: barrier.id,
        ownerId: barrier.ownerId,
        fromEpoch: barrier.fromEpoch,
        toEpoch: barrier.toEpoch,
        reason: barrier.reason,
        status: 'committing',
        startedAt: barrier.startedAt,
        committedAt: null
    }));

    const refreshed = makeCoordinator({
        storage, channel: null, tabId: 'refreshed', now
    });
    const committed = JSON.parse(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY));
    assert.equal(committed.status, 'committed');
    assert.equal(committed.committedAt, 900);
    assert.equal(committed.objectId, 'obj:annihilation:refresh');
    assert.equal(committed.checksum, 'refresh-checksum');
    assert.equal(committed.recovery, true);
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.equal(refreshed.claimEpoch(1), true);
    assert.equal(refreshed.reconcilePersistentTransition().status, 'none');
    refreshed.destroy();
});

test('refresh clears a residual barrier only when its committed tombstone proves the target epoch', () => {
    const storage = new MemoryStorage();
    const now = { value: 1000 };
    const barrier = {
        id: 'dead-tab:1->2',
        ownerId: 'dead-tab',
        fromEpoch: 1,
        toEpoch: 2,
        reason: 'reflog-recovery',
        status: 'pending',
        startedAt: 500,
        heartbeatAt: 500,
        leaseUntil: 5000
    };
    const tombstone = {
        barrierId: barrier.id,
        ownerId: barrier.ownerId,
        fromEpoch: barrier.fromEpoch,
        toEpoch: barrier.toEpoch,
        reason: barrier.reason,
        status: 'committed',
        startedAt: barrier.startedAt,
        committedAt: 800
    };
    storage.setItem(DEFAULT_WORLD_EPOCH_KEY, '2');
    storage.setItem(DEFAULT_WORLD_BARRIER_KEY, JSON.stringify(barrier));
    storage.setItem(DEFAULT_WORLD_TOMBSTONE_KEY, JSON.stringify(tombstone));

    const refreshed = makeCoordinator({
        storage, channel: null, tabId: 'refreshed', now
    });
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.deepEqual(JSON.parse(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY)), tombstone);
    assert.equal(refreshed.canWrite(2), true);
    refreshed.destroy();
});

test('an expired barrier at an unrelated epoch is never guessed away', () => {
    const storage = new MemoryStorage();
    const now = { value: 5000 };
    const barrier = {
        id: 'unknown:0->1',
        ownerId: 'unknown',
        fromEpoch: 0,
        toEpoch: 1,
        reason: 'unknown',
        status: 'pending',
        startedAt: 10,
        heartbeatAt: 10,
        leaseUntil: 20
    };
    storage.setItem(DEFAULT_WORLD_EPOCH_KEY, '2');
    storage.setItem(DEFAULT_WORLD_BARRIER_KEY, JSON.stringify(barrier));
    const coordinator = makeCoordinator({
        storage, channel: null, tabId: 'current', now
    });

    assert.equal(coordinator.reconcilePersistentTransition().status, 'inconsistent');
    assert.equal(JSON.parse(storage.getItem(DEFAULT_WORLD_BARRIER_KEY)).id, barrier.id);
    assert.throws(
        () => coordinator.beginBarrier({ fromEpoch: 2, toEpoch: 3, reason: 'unsafe-takeover' }),
        BarrierConflictError
    );
    coordinator.destroy();
});

test('commit repairs one-shot failures after epoch advance', async t => {
    await t.test('committed tombstone write', () => {
        const storage = new FaultyStorage();
        const now = { value: 100 };
        const coordinator = makeCoordinator({
            storage, channel: null, tabId: 'owner', now
        });
        const token = coordinator.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'repair' });
        storage.armFailure((operation, key, value) =>
            operation === 'set' && key === DEFAULT_WORLD_TOMBSTONE_KEY &&
            JSON.parse(value).status === 'committed'
        );

        const committed = coordinator.commitBarrier(token, {
            objectId: 'obj:repair:abc',
            checksum: 'repair-checksum',
            recovery: true
        });
        assert.equal(committed.status, 'committed');
        assert.equal(committed.objectId, 'obj:repair:abc');
        assert.equal(committed.checksum, 'repair-checksum');
        assert.equal(committed.recovery, true);
        assert.equal(storage.getItem(DEFAULT_WORLD_EPOCH_KEY), '1');
        assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
        const persisted = JSON.parse(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY));
        assert.equal(persisted.status, 'committed');
        assert.equal(persisted.objectId, 'obj:repair:abc');
        coordinator.destroy();
    });

    await t.test('barrier removal', () => {
        const storage = new FaultyStorage();
        const now = { value: 200 };
        const coordinator = makeCoordinator({
            storage, channel: null, tabId: 'owner', now
        });
        const token = coordinator.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'repair' });
        storage.armFailure((operation, key) =>
            operation === 'remove' && key === DEFAULT_WORLD_BARRIER_KEY
        );

        const committed = coordinator.commitBarrier(token);
        assert.equal(committed.status, 'committed');
        assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
        coordinator.destroy();
    });
});

test('commit failure before epoch advance rolls the owner barrier back', () => {
    const storage = new FaultyStorage();
    const now = { value: 300 };
    const coordinator = makeCoordinator({
        storage, channel: null, tabId: 'owner', now
    });
    const token = coordinator.beginBarrier({ fromEpoch: 0, toEpoch: 1, reason: 'rollback' });
    storage.armFailure((operation, key) =>
        operation === 'set' && key === DEFAULT_WORLD_EPOCH_KEY
    );

    assert.throws(() => coordinator.commitBarrier(token), {
        code: 'TAB_COORDINATION_STORAGE_ERROR'
    });
    assert.equal(storage.getItem(DEFAULT_WORLD_EPOCH_KEY), '0');
    assert.equal(storage.getItem(DEFAULT_WORLD_BARRIER_KEY), null);
    assert.equal(storage.getItem(DEFAULT_WORLD_TOMBSTONE_KEY), null);
    assert.equal(coordinator.canWrite(0), true);
    coordinator.destroy();
});
