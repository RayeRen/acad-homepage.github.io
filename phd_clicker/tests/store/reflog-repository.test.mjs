import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ANNIHILATION_REASON,
    IndexedDbReflogBackend,
    ReflogCapabilityError,
    ReflogIntegrityError,
    ReflogRepository,
    ReflogWriteVerificationError,
    getReflogObjectId
} from '../../js/store/reflog-repository.js';
import {
    createDefaultSaveEnvelope,
    sealEnvelope
} from '../../js/store/index.js';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

class MemoryReflogBackend {
    constructor({ transformOnPut = null } = {}) {
        this.records = new Map();
        this.transformOnPut = transformOnPut;
    }

    async put(record) {
        let stored = clone(record);
        if (this.transformOnPut) stored = this.transformOnPut(stored) ?? stored;
        this.records.set(stored.objectId, stored);
    }

    async get(objectId) {
        return this.records.has(objectId) ? clone(this.records.get(objectId)) : null;
    }

    async getAll() {
        return [...this.records.values()].map(clone);
    }

    async delete(objectId) {
        this.records.delete(objectId);
    }
}

const checksumAdapter = {
    algorithm: 'TEST-FNV',
    async digest(text) {
        let hash = 2166136261;
        for (const character of text) {
            hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, '0');
    }
};

async function envelope(rp, savedAt = rp) {
    const value = createDefaultSaveEnvelope({ now: () => savedAt });
    value.gameState.rp = rp;
    return sealEnvelope(value, checksumAdapter);
}

function clockSequence(...times) {
    let index = 0;
    return () => times[Math.min(index++, times.length - 1)];
}

test('the production backend reports an explicit capability error without IndexedDB', () => {
    assert.throws(
        () => new IndexedDbReflogBackend({ indexedDB: null }),
        ReflogCapabilityError
    );
});

test('archive verifies, reads back, and exposes stable content-addressed objects', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(100, 200),
        maxEntries: 10
    });
    const sealed = await envelope(10);

    const first = await repository.archive(sealed, {
        reason: 'manual',
        metadata: { label: 'before experiment' }
    });
    const second = await repository.archive(sealed, { reason: 'autosave' });

    assert.equal(first.integrity.valid, true);
    assert.equal(first.objectId, getReflogObjectId(sealed));
    assert.equal(second.objectId, first.objectId);
    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal((await repository.list()).length, 1);

    const stored = await repository.get(first.objectId);
    assert.equal(stored.createdAt, 100);
    assert.equal(stored.archivedAt, 200);
    assert.deepEqual(stored.reasons, ['manual', 'autosave']);
    assert.equal(stored.metadata.label, 'before experiment');
});

test('tampered or unsealed input is rejected before the backend is written', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({ backend, checksumAdapter });
    const tampered = await envelope(5);
    tampered.gameState.rp = 999;

    await assert.rejects(
        repository.archive(tampered),
        error => error instanceof ReflogIntegrityError && error.stage === 'before-write'
    );
    assert.equal(backend.records.size, 0);

    const unsealed = createDefaultSaveEnvelope({ now: () => 1 });
    await assert.rejects(repository.archive(unsealed), ReflogIntegrityError);
    assert.equal(backend.records.size, 0);
});

test('a backend that mutates writes fails read-back verification and is cleaned up', async () => {
    let shouldTamper = true;
    const backend = new MemoryReflogBackend({
        transformOnPut(record) {
            if (shouldTamper) record.envelope.gameState.rp += 1;
            return record;
        }
    });
    const repository = new ReflogRepository({ backend, checksumAdapter });

    await assert.rejects(
        repository.archive(await envelope(20)),
        error => error instanceof ReflogIntegrityError ||
            error instanceof ReflogWriteVerificationError
    );
    assert.equal(backend.records.size, 0);

    shouldTamper = false;
    const archived = await repository.archive(await envelope(21));
    assert.ok(await repository.get(archived.objectId));
});

test('prune failure is reported without invalidating a durable archive', async () => {
    const backend = new MemoryReflogBackend();
    const originalGetAll = backend.getAll.bind(backend);
    let failGetAll = true;
    backend.getAll = async () => {
        if (failGetAll) throw Object.assign(new Error('prune unavailable'), { code: 'PRUNE_FAIL' });
        return originalGetAll();
    };
    const repository = new ReflogRepository({ backend, checksumAdapter });

    const archived = await repository.archive(await envelope(22), {
        reason: ANNIHILATION_REASON
    });

    assert.equal(archived.prune, null);
    assert.equal(archived.pruneError.code, 'PRUNE_FAIL');
    failGetAll = false;
    assert.equal((await repository.get(archived.objectId)).objectId, archived.objectId);
});

test('list, findLatest, get, and markRecovered retain verified records', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(10, 20, 30, 40),
        maxEntries: 10
    });
    const manual = await repository.archive(await envelope(1), { reason: 'manual' });
    const annihilation = await repository.archive(await envelope(2), {
        reason: ANNIHILATION_REASON
    });

    assert.equal((await repository.findLatest()).objectId, annihilation.objectId);
    assert.equal(
        (await repository.findLatest({ reason: 'manual' })).objectId,
        manual.objectId
    );
    assert.equal((await repository.list({ recovered: false })).length, 2);
    assert.equal((await repository.list({ protectedOnly: true })).length, 1);

    const recovered = await repository.markRecovered(annihilation.objectId, {
        recoveredAt: 40
    });
    assert.equal(recovered.recoveredAt, 40);
    assert.equal((await repository.get(annihilation.objectId)).recoveredAt, 40);
    assert.equal((await repository.list({ recovered: true })).length, 1);
    assert.equal(await repository.markRecovered('missing'), null);
});

test('capacity pruning removes the oldest eligible records', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(10, 20, 30),
        maxEntries: 2
    });
    const oldest = await repository.archive(await envelope(1), { reason: 'manual' });
    const middle = await repository.archive(await envelope(2), { reason: 'manual' });
    const newest = await repository.archive(await envelope(3), { reason: 'manual' });

    assert.equal(await repository.get(oldest.objectId), null);
    assert.ok(await repository.get(middle.objectId));
    assert.ok(await repository.get(newest.objectId));
    assert.equal((await repository.list()).length, 2);
    assert.deepEqual(newest.prune.removedIds, [oldest.objectId]);
});

test('automatic pruning never deletes an unrecovered annihilation checkpoint', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(10, 20, 30),
        maxEntries: 2
    });
    const protectedCheckpoint = await repository.archive(await envelope(1), {
        reason: ANNIHILATION_REASON
    });
    const expendable = await repository.archive(await envelope(2), { reason: 'autosave' });
    const newest = await repository.archive(await envelope(3), { reason: 'manual' });

    assert.ok(await repository.get(protectedCheckpoint.objectId));
    assert.equal(await repository.get(expendable.objectId), null);
    assert.ok(await repository.get(newest.objectId));
    assert.equal(newest.prune.protectedCount, 1);
    assert.equal(newest.prune.overflow, 0);
});

test('protected checkpoints may exceed capacity rather than being destroyed', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(10, 20, 30),
        maxEntries: 2
    });

    await repository.archive(await envelope(1), { reason: ANNIHILATION_REASON });
    await repository.archive(await envelope(2), { reason: ANNIHILATION_REASON });
    const third = await repository.archive(await envelope(3), {
        reason: ANNIHILATION_REASON
    });

    assert.equal((await repository.list()).length, 3);
    assert.equal(third.prune.removedIds.length, 0);
    assert.equal(third.prune.overflow, 1);
    assert.equal(third.prune.protectedCount, 3);
});

test('legacy annihilation records without recoveredAt are treated as unrecovered', async () => {
    const backend = new MemoryReflogBackend();
    const repository = new ReflogRepository({
        backend,
        checksumAdapter,
        clock: clockSequence(10, 20),
        maxEntries: 1
    });
    const protectedCheckpoint = await repository.archive(await envelope(1), {
        reason: ANNIHILATION_REASON,
        prune: false
    });
    const legacyRecord = backend.records.get(protectedCheckpoint.objectId);
    delete legacyRecord.recoveredAt;
    backend.records.set(protectedCheckpoint.objectId, legacyRecord);

    const newest = await repository.archive(await envelope(2), { reason: 'manual' });
    assert.ok(await repository.get(protectedCheckpoint.objectId));
    assert.equal(await repository.get(newest.objectId), null);
    assert.equal(newest.prune.protectedCount, 1);
});
