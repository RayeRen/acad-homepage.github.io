import test from 'node:test';
import assert from 'node:assert/strict';

import {
    GameSaveController,
    SaveRepository,
    createDefaultGameState,
    createDefaultMetaState
} from '../../js/store/index.js';

class MemoryStorage {
    constructor() {
        this.entries = new Map();
    }
    getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
    setItem(key, value) { this.entries.set(key, String(value)); }
    removeItem(key) { this.entries.delete(key); }
}

const checksumAdapter = {
    algorithm: 'TEST',
    async digest(text) { return `${text.length}:${text.charCodeAt(0) || 0}`; }
};

function setup() {
    let now = 100;
    const storage = new MemoryStorage();
    const repository = new SaveRepository({
        storage,
        clock: () => now++,
        checksumAdapter
    });
    const controller = new GameSaveController({ repository, writerId: 'test-tab' });
    return { storage, controller };
}

test('queued saves form a monotonic revision chain', async () => {
    const { controller } = setup();
    const state = createDefaultGameState({ now: () => 1 });

    state.rp = 1;
    const firstPromise = controller.save(state, { reason: 'first' });
    state.rp = 2;
    const secondPromise = controller.save(state, { reason: 'second' });
    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    assert.equal(first.envelope.revision, 1);
    assert.equal(first.envelope.parentRevision, null);
    assert.equal(first.envelope.gameState.rp, 1);
    assert.equal(second.envelope.revision, 2);
    assert.equal(second.envelope.parentRevision, 1);
    assert.equal(second.envelope.gameState.rp, 2);
    assert.equal(second.envelope.reason, 'second');
    assert.equal(second.envelope.writerTabId, 'test-tab');
});

test('a rejected save does not poison the following queue', async () => {
    const { controller } = setup();
    const state = createDefaultGameState({ now: () => 1 });
    const original = controller.repository.save.bind(controller.repository);
    let shouldFail = true;

    controller.repository.save = async (...args) => {
        if (shouldFail) {
            shouldFail = false;
            throw new Error('planned failure');
        }
        return original(...args);
    };

    await assert.rejects(controller.save(state));
    const recovered = await controller.save(state, { reason: 'retry' });
    assert.equal(recovered.envelope.reason, 'retry');
});

test('replaceWorld waits for older writes and starts a new active history', async () => {
    const { controller, storage } = setup();
    const oldWorld = createDefaultGameState({ now: () => 1 });
    oldWorld.rp = 999;
    await controller.save(oldWorld);

    const newWorld = createDefaultGameState({ now: () => 2 });
    const result = await controller.replaceWorld(newWorld);
    const stored = JSON.parse(storage.getItem('phd-clicker-save'));

    assert.equal(result.envelope.gameState.rp, 0);
    assert.equal(result.envelope.revision, 1);
    assert.equal(stored.gameState.rp, 0);
    assert.equal(storage.getItem('phd-clicker-save:prev'), null);
});

test('replaceWorld write failure preserves old HEAD, active envelope, and meta', async () => {
    const { controller, storage } = setup();
    const oldWorld = createDefaultGameState({ now: () => 1 });
    oldWorld.rp = 321;
    await controller.save(oldWorld, { reason: 'old-world' });
    const oldRaw = storage.getItem('phd-clicker-save');
    const oldEnvelope = controller.getActiveEnvelope();
    const oldMeta = controller.getMetaState();
    const originalSave = controller.repository.save.bind(controller.repository);
    controller.repository.save = async (state, options) => {
        if (options?.envelopeExtensions?.reason === 'failed-reset') {
            throw new Error('planned replacement failure');
        }
        return originalSave(state, options);
    };

    const replacement = createDefaultGameState({ now: () => 2 });
    await assert.rejects(controller.replaceWorld(replacement, {
        reason: 'failed-reset',
        metaState: { ...createDefaultMetaState(), worldEpoch: 1 }
    }), /planned replacement failure/);

    assert.equal(storage.getItem('phd-clicker-save'), oldRaw);
    assert.equal(controller.getActiveEnvelope().checksum.value, oldEnvelope.checksum.value);
    assert.deepEqual(controller.getMetaState(), oldMeta);
    assert.equal(storage.getItem('phd-clicker-save:prev'), null);
});

test('deleteHead waits for queued writes and leaves no active local save', async () => {
    const { controller, storage } = setup();
    const pending = controller.save({ rp: 11 }, { reason: 'before-delete' });
    await controller.deleteHead();
    await pending;

    assert.equal(storage.getItem('phd-clicker-save'), null);
    assert.equal(storage.getItem('phd-clicker-save:prev'), null);
    assert.equal(controller.getActiveEnvelope(), null);
});

test('write guard is checked at execution time and a later save can recover', async () => {
    let allowed = false;
    let now = 500;
    const storage = new MemoryStorage();
    const repository = new SaveRepository({
        storage,
        key: 'test-save',
        checksumAdapter,
        clock: () => now++
    });
    const controller = new GameSaveController({
        repository,
        writerId: 'guarded-tab',
        writeGuard: () => allowed
    });

    await assert.rejects(controller.save({ rp: 1 }, { reason: 'blocked' }), {
        code: 'SAVE_WRITE_BLOCKED'
    });
    allowed = true;
    const result = await controller.save({ rp: 2 }, { reason: 'allowed' });
    assert.equal(result.envelope.gameState.rp, 2);
});

test('write guard is rechecked after async checksum work before storage mutation', async () => {
    let checks = 0;
    const storage = new MemoryStorage();
    const repository = new SaveRepository({ storage, checksumAdapter });
    const controller = new GameSaveController({
        repository,
        writeGuard: () => ++checks === 1
    });

    await assert.rejects(controller.save({ rp: 3 }, { reason: 'epoch-race' }), {
        code: 'SAVE_WRITE_BLOCKED'
    });
    assert.equal(storage.getItem('phd-clicker-save'), null);
    assert.equal(checks, 2);
});

test('exclusive transition blocks autosaves and installWorld preserves old HEAD as prev', async () => {
    const { controller, storage } = setup();
    const oldWorld = createDefaultGameState({ now: () => 1 });
    oldWorld.rp = 12;
    await controller.save(oldWorld, { reason: 'old-head' });
    const oldRaw = storage.getItem('phd-clicker-save');
    const token = { id: 'recovery-1' };
    controller.beginExclusiveTransition(token, { reason: 'recovery' });

    await assert.rejects(
        controller.save({ ...oldWorld, rp: 999 }, { reason: 'autosave-during-recovery' }),
        { code: 'SAVE_WRITE_BLOCKED' }
    );

    const recovered = createDefaultGameState({ now: () => 2 });
    recovered.rp = 777;
    const result = await controller.installWorld(recovered, {
        reason: 'reflog-recovery',
        metaState: { ...createDefaultMetaState(), worldEpoch: 1 },
        transitionToken: token
    });

    assert.equal(result.envelope.gameState.rp, 777);
    assert.equal(result.envelope.revision, 1);
    assert.equal(storage.getItem('phd-clicker-save:prev'), oldRaw);
    assert.equal(JSON.parse(storage.getItem('phd-clicker-save')).gameState.rp, 777);
    await assert.rejects(
        controller.save(oldWorld, { reason: 'autosave-before-apply' }),
        { code: 'SAVE_WRITE_BLOCKED' }
    );
    controller.endExclusiveTransition(token);
});

test('failed installWorld keeps active HEAD and meta unchanged', async () => {
    const { controller, storage } = setup();
    const oldWorld = createDefaultGameState({ now: () => 1 });
    oldWorld.rp = 5;
    await controller.save(oldWorld, { reason: 'old-head' });
    const oldRaw = storage.getItem('phd-clicker-save');
    const oldEnvelope = controller.getActiveEnvelope();
    const originalSave = controller.repository.save.bind(controller.repository);
    controller.repository.save = async (state, options) => {
        if (options?.envelopeExtensions?.reason === 'reflog-recovery') {
            throw new Error('planned install failure');
        }
        return originalSave(state, options);
    };
    const token = { id: 'recovery-failure' };
    controller.beginExclusiveTransition(token, { reason: 'recovery' });

    await assert.rejects(controller.installWorld(
        { ...oldWorld, rp: 777 },
        {
            reason: 'reflog-recovery',
            metaState: { ...createDefaultMetaState(), worldEpoch: 1 },
            transitionToken: token
        }
    ), /planned install failure/);

    assert.equal(storage.getItem('phd-clicker-save'), oldRaw);
    assert.equal(controller.getActiveEnvelope().checksum.value, oldEnvelope.checksum.value);
    assert.equal(controller.getMetaState().worldEpoch, 0);
    assert.equal(storage.getItem('phd-clicker-save:prev'), null);
    controller.endExclusiveTransition(token);
});
