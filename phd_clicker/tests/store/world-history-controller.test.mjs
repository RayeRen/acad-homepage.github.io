import test from 'node:test';
import assert from 'node:assert/strict';

import {
    GameSaveController,
    SaveRepository,
    createDefaultGameState,
    createDefaultMetaState
} from '../../js/store/index.js';
import { WorldHistoryController } from '../../js/store/world-history-controller.js';

function fixtures({
    archiveFails = false,
    deleteFails = false,
    installFails = false,
    markFails = false,
    ackComplete = true,
    recordRecovered = false
} = {}) {
    const calls = [];
    let epoch = 0;
    let writerEpoch = 0;
    const envelope = {
        gameState: { rp: 42, agi: {}, narrativeLog: [] },
        metaState: { worldEpoch: 0 },
        checksum: { algorithm: 'test', value: 'abc' }
    };
    const record = {
        objectId: 'obj:test:abc',
        archivedAt: 10,
        reason: 'annihilation',
        reasons: ['annihilation'],
        recoveredAt: recordRecovered ? 5 : null,
        envelope
    };
    let exclusiveToken = null;
    const saveController = {
        flush: async () => calls.push('flush'),
        save: async (_state, options) => {
            calls.push(['save', options]);
            return { envelope };
        },
        deleteHead: async options => {
            calls.push(['delete', options]);
            if (deleteFails) throw new Error('delete failed');
        },
        getMetaState: () => ({ worldEpoch: epoch }),
        beginExclusiveTransition: token => {
            calls.push('exclusive-begin');
            exclusiveToken = token.id;
        },
        endExclusiveTransition: (token, options) => {
            calls.push(['exclusive-end', options]);
            if (exclusiveToken === token.id) exclusiveToken = null;
        },
        installWorld: async (state, options) => {
            calls.push(['install', state, options]);
            if (installFails) throw new Error('install failed');
            return { envelope: { gameState: state, metaState: options.metaState } };
        }
    };
    const reflog = {
        archive: async () => {
            calls.push('archive');
            if (archiveFails) throw new Error('idb failed');
            return { objectId: record.objectId };
        },
        get: async objectId => {
            calls.push(['verify', objectId]);
            return objectId === record.objectId ? record : null;
        },
        findLatest: async () => record,
        markRecovered: async () => {
            calls.push('mark-recovered');
            if (markFails) throw new Error('mark failed');
            return { ...record, recoveredAt: 99 };
        }
    };
    const coordinator = {
        getCurrentEpoch: () => epoch,
        getWriterEpoch: () => writerEpoch,
        beginBarrier: ({ fromEpoch, toEpoch, reason }) => {
            calls.push('begin');
            return { id: 'barrier', fromEpoch, toEpoch, reason, peerIds: [] };
        },
        waitForAcks: async () => {
            calls.push('acks');
            return { complete: ackComplete, missing: ackComplete ? [] : ['peer'] };
        },
        commitBarrier: (token, metadata) => {
            calls.push(['commit', metadata]);
            epoch = token.toEpoch;
            return { status: 'committed', toEpoch: epoch };
        },
        abortBarrier: () => { calls.push('abort'); return true; },
        claimEpoch: value => { writerEpoch = value; return value === epoch; }
    };
    const controller = new WorldHistoryController({
        saveController,
        reflog,
        coordinator,
        getState: () => ({ rp: 42 }),
        decorateRecoveredState: state => ({ ...state, decorated: true }),
        applyRecoveredState: async () => calls.push('apply'),
        clock: () => 99
    });
    return { controller, calls };
}

test('annihilation verifies archive before commit and delete', async () => {
    const { controller, calls } = fixtures();
    const result = await controller.annihilate({ playerType: 'hacker' });
    assert.equal(result.objectId, 'obj:test:abc');
    const verifyIndex = calls.findIndex(call => Array.isArray(call) && call[0] === 'verify');
    const commitIndex = calls.findIndex(call => Array.isArray(call) && call[0] === 'commit');
    const deleteIndex = calls.findIndex(call => Array.isArray(call) && call[0] === 'delete');
    assert.ok(calls.indexOf('archive') < verifyIndex);
    assert.ok(verifyIndex < commitIndex);
    assert.ok(commitIndex < deleteIndex);
    const saveCall = calls.find(call => Array.isArray(call) && call[0] === 'save');
    assert.equal(saveCall[1].transitionToken.id, 'barrier');
    assert.equal(calls[commitIndex][1].objectId, 'obj:test:abc');
    assert.equal(result.committed, true);
    assert.equal(result.headDeleted, true);
});

test('archive failure aborts barrier and never deletes HEAD', async () => {
    const { controller, calls } = fixtures({ archiveFails: true });
    await assert.rejects(controller.annihilate(), { code: 'WORLD_HISTORY_ERROR' });
    assert.ok(calls.includes('abort'));
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'commit'), false);
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'delete'), false);
});

test('incomplete peer flush aborts annihilation before archive or commit', async () => {
    const { controller, calls } = fixtures({ ackComplete: false });
    await assert.rejects(controller.annihilate(), { code: 'PEER_FLUSH_TIMEOUT' });
    assert.ok(calls.includes('abort'));
    assert.equal(calls.includes('archive'), false);
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'commit'), false);
});

test('delete failure after commit returns reload-required success', async () => {
    const { controller, calls } = fixtures({ deleteFails: true });
    const result = await controller.annihilate();
    assert.equal(result.committed, true);
    assert.equal(result.headDeleted, false);
    assert.equal(result.reloadRequired, true);
    assert.ok(result.deleteError);
    assert.equal(calls.includes('abort'), false);
});

test('recovery installs decorated state in a new epoch then marks object recovered', async () => {
    const { controller, calls } = fixtures();
    const result = await controller.recoverLatest();
    assert.equal(result.gameState.decorated, true);
    assert.equal(result.metaState.worldEpoch, 1);
    assert.equal(result.metaState.recoveredFromAnnihilation, true);
    const commitIndex = calls.findIndex(call => Array.isArray(call) && call[0] === 'commit');
    const installIndex = calls.findIndex(call => Array.isArray(call) && call[0] === 'install');
    assert.ok(commitIndex < installIndex);
    assert.ok(installIndex < calls.indexOf('apply'));
    assert.ok(calls.indexOf('apply') < calls.indexOf('mark-recovered'));
    assert.equal(result.finalizationPending, false);
});

test('incomplete peer flush aborts recovery before epoch commit', async () => {
    const { controller, calls } = fixtures({ ackComplete: false });
    await assert.rejects(controller.recoverLatest(), { code: 'PEER_FLUSH_TIMEOUT' });
    assert.ok(calls.includes('abort'));
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'commit'), false);
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'install'), false);
});

test('markRecovered failure is a retryable tail after runtime apply', async () => {
    const { controller, calls } = fixtures({ markFails: true });
    const result = await controller.recoverLatest();
    assert.equal(result.finalizationPending, true);
    assert.ok(result.finalizationError);
    assert.ok(calls.indexOf('apply') < calls.indexOf('mark-recovered'));
});

test('explicit recovery selects exact object and rejects recovered objects', async () => {
    const exact = fixtures();
    const result = await exact.controller.recoverLatest({ objectId: 'obj:test:abc' });
    assert.equal(result.objectId, 'obj:test:abc');
    assert.ok(exact.calls.some(call => Array.isArray(call) &&
        call[0] === 'verify' && call[1] === 'obj:test:abc'));

    const recovered = fixtures({ recordRecovered: true });
    await assert.rejects(
        recovered.controller.recoverLatest({ objectId: 'obj:test:abc' }),
        { code: 'REFLOG_OBJECT_ALREADY_RECOVERED' }
    );
    assert.equal(recovered.calls.includes('begin'), false);
});

class MemoryStorage {
    constructor() { this.entries = new Map(); }
    getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
    setItem(key, value) { this.entries.set(key, String(value)); }
    removeItem(key) { this.entries.delete(key); }
}

const checksumAdapter = {
    algorithm: 'TEST',
    async digest(text) { return `${text.length}:${text.charCodeAt(0) || 0}`; }
};

async function recoveryHarness({
    installFails = false,
    applyFails = false,
    markFails = false
} = {}) {
    const storage = new MemoryStorage();
    let epoch = 1;
    let writerEpoch = 1;
    const repository = new SaveRepository({ storage, checksumAdapter, clock: () => 50 });
    const saveController = new GameSaveController({
        repository,
        writerId: 'recovery-tab',
        writeGuard: ({ writerEpoch: writeEpoch }) => writeEpoch === epoch
    });
    const runtimeState = createDefaultGameState({ now: () => 1 });
    runtimeState.rp = 1;
    await saveController.replaceWorld(runtimeState, {
        reason: 'post-annihilation',
        metaState: { ...createDefaultMetaState(), worldEpoch: 1 }
    });
    const oldRaw = storage.getItem('phd-clicker-save');
    const record = {
        objectId: 'obj:old-world',
        archivedAt: 5,
        reason: 'annihilation',
        reasons: ['annihilation'],
        recoveredAt: null,
        envelope: {
            gameState: { ...createDefaultGameState({ now: () => 2 }), rp: 777 },
            metaState: { ...createDefaultMetaState(), worldEpoch: 0 },
            checksum: { algorithm: 'TEST', value: 'old' }
        }
    };
    let markCalls = 0;
    let remainingMarkFailures = markFails ? 1 : 0;
    const reflog = {
        findLatest: async () => record,
        get: async id => id === record.objectId ? record : null,
        archive: async () => ({ objectId: record.objectId }),
        markRecovered: async () => {
            markCalls += 1;
            if (remainingMarkFailures > 0) {
                remainingMarkFailures -= 1;
                throw new Error('planned mark failure');
            }
            record.recoveredAt = 90;
            return record;
        }
    };
    const coordinator = {
        getCurrentEpoch: () => epoch,
        getWriterEpoch: () => writerEpoch,
        beginBarrier: ({ fromEpoch, toEpoch, reason }) => ({
            id: `barrier-${toEpoch}`, fromEpoch, toEpoch, reason, peerIds: []
        }),
        waitForAcks: async () => ({ complete: true }),
        commitBarrier: token => {
            epoch = token.toEpoch;
            return { status: 'committed', toEpoch: epoch };
        },
        abortBarrier: () => true,
        claimEpoch: value => {
            writerEpoch = value;
            return value === epoch;
        }
    };
    const originalSave = repository.save.bind(repository);
    if (installFails) {
        repository.save = async (state, options) => {
            if (options?.envelopeExtensions?.reason === 'reflog-recovery') {
                throw new Error('planned install failure');
            }
            return originalSave(state, options);
        };
    }
    const controller = new WorldHistoryController({
        saveController,
        reflog,
        coordinator,
        getState: () => runtimeState,
        applyRecoveredState: async state => {
            if (applyFails) throw new Error('planned runtime apply failure');
            Object.assign(runtimeState, state);
        },
        clock: () => 80
    });
    return {
        controller, saveController, storage, runtimeState, record,
        oldRaw, getEpoch: () => epoch, getMarkCalls: () => markCalls
    };
}

test('failed recovered-world install keeps old HEAD and later autosave is blocked', async () => {
    const harness = await recoveryHarness({ installFails: true });
    await assert.rejects(harness.controller.recoverLatest(), error =>
        error.stage === 'install-recovered-world' &&
        error.committed === true && error.reloadRequired === true
    );
    assert.equal(harness.storage.getItem('phd-clicker-save'), harness.oldRaw);
    await assert.rejects(
        harness.saveController.save(harness.runtimeState, { reason: 'autosave-after-failure' }),
        { code: 'SAVE_WRITE_BLOCKED' }
    );
    assert.equal(harness.storage.getItem('phd-clicker-save'), harness.oldRaw);
    assert.equal(harness.record.recoveredAt, null);
});

test('mark failure cannot prevent apply or let autosave overwrite recovered candidate', async () => {
    const harness = await recoveryHarness({ markFails: true });
    const result = await harness.controller.recoverLatest();
    assert.equal(result.finalizationPending, true);
    assert.equal(harness.runtimeState.rp, 777);
    assert.equal(harness.record.recoveredAt, null);

    await harness.saveController.save(harness.runtimeState, {
        reason: 'autosave-after-mark-failure'
    });
    const stored = JSON.parse(harness.storage.getItem('phd-clicker-save'));
    assert.equal(stored.gameState.rp, 777);
    assert.equal(stored.metaState.worldEpoch, 2);
    assert.equal(harness.getMarkCalls(), 1);

    const finalized = await harness.controller.finalizeRecovery(
        harness.record.objectId,
        { recoveredAt: 91 }
    );
    assert.equal(finalized.recoveredAt, 90);
    assert.equal(harness.getMarkCalls(), 2);
});

test('runtime apply failure freezes autosave after candidate became HEAD', async () => {
    const harness = await recoveryHarness({ applyFails: true });
    await assert.rejects(harness.controller.recoverLatest(), error =>
        error.stage === 'apply-recovered-state' &&
        error.committed === true && error.reloadRequired === true
    );
    const candidateRaw = harness.storage.getItem('phd-clicker-save');
    assert.equal(JSON.parse(candidateRaw).gameState.rp, 777);
    assert.equal(harness.saveController.isWriteFrozen(), true);
    await assert.rejects(
        harness.saveController.save(harness.runtimeState, { reason: 'unsafe-autosave' }),
        { code: 'SAVE_WRITE_BLOCKED' }
    );
    assert.equal(harness.storage.getItem('phd-clicker-save'), candidateRaw);
    assert.equal(harness.record.recoveredAt, null);
});
