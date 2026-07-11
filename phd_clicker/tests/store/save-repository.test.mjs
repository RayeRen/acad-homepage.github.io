import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SaveRepository,
    createDefaultGameState,
    createDefaultSaveEnvelope,
    sealEnvelope,
    verifyEnvelopeChecksum
} from '../../js/store/index.js';

class MemoryStorage {
    constructor(entries = {}) {
        this.entries = new Map(Object.entries(entries));
    }

    getItem(key) {
        return this.entries.has(key) ? this.entries.get(key) : null;
    }

    setItem(key, value) {
        this.entries.set(key, String(value));
    }

    removeItem(key) {
        this.entries.delete(key);
    }

    keys() {
        return [...this.entries.keys()];
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

function createRepository(storage, clock = () => 1000) {
    return new SaveRepository({ storage, clock, checksumAdapter });
}

test('checksum is stable and reports tampering without discarding data', async () => {
    const envelope = await sealEnvelope(
        createDefaultSaveEnvelope({ now: () => 10 }),
        checksumAdapter
    );

    assert.equal((await verifyEnvelopeChecksum(envelope, checksumAdapter)).valid, true);

    envelope.gameState.rp = 99;
    const integrity = await verifyEnvelopeChecksum(envelope, checksumAdapter);
    assert.equal(integrity.valid, false);
    assert.equal(integrity.reason, 'mismatch');
});

test('save and load round-trip a versioned envelope', async () => {
    const storage = new MemoryStorage();
    const repository = createRepository(storage);
    const state = createDefaultGameState({ now: () => 1 });
    state.rp = 123;
    state.agi.phase = 2;

    await repository.save(state);
    const loaded = await repository.load();

    assert.equal(loaded.status, 'ok');
    assert.equal(loaded.integrity.valid, true);
    assert.equal(loaded.gameState.rp, 123);
    assert.equal(loaded.gameState.agi.phase, 2);
});

test('every successful save preserves the prior raw revision', async () => {
    let timestamp = 10;
    const storage = new MemoryStorage();
    const repository = createRepository(storage, () => timestamp++);
    const state = createDefaultGameState({ now: () => 1 });

    state.rp = 1;
    const first = await repository.save(state);
    state.rp = 2;
    const second = await repository.save(state);

    assert.equal(second.previousBackedUp, true);
    assert.equal(storage.getItem('phd-clicker-save:prev'), first.raw);
});

test('corrupt primary data is quarantined and the previous revision recovers', async () => {
    let timestamp = 20;
    const storage = new MemoryStorage();
    const repository = createRepository(storage, () => timestamp++);
    const state = createDefaultGameState({ now: () => 1 });

    state.rp = 10;
    await repository.save(state);
    state.rp = 20;
    await repository.save(state);
    storage.setItem('phd-clicker-save', '{invalid json');

    const loaded = await repository.load();

    assert.equal(loaded.status, 'recovered-previous');
    assert.equal(loaded.gameState.rp, 10);
    assert.equal(loaded.recoveredFromPrevious, true);
    assert.ok(loaded.quarantineKeys.length >= 1);
    assert.ok(storage.keys().some(key => key.includes(':quarantine:')));
});

test('parseable checksum edits are surfaced and retained for Meta reactions', async () => {
    const storage = new MemoryStorage();
    const repository = createRepository(storage);
    const state = createDefaultGameState({ now: () => 1 });

    await repository.save(state);
    const edited = JSON.parse(storage.getItem('phd-clicker-save'));
    edited.gameState.rp = 1e100;
    storage.setItem('phd-clicker-save', JSON.stringify(edited));

    const loaded = await repository.load();

    assert.equal(loaded.status, 'integrity-mismatch');
    assert.equal(loaded.gameState.rp, 1e100);
});

test('missing current gameState quarantines instead of silently resetting', async () => {
    const storage = new MemoryStorage({
        'phd-clicker-save': JSON.stringify({
            format: 'phd-clicker-save',
            schemaVersion: 1,
            savedAt: 1,
            checksum: null
        })
    });
    const repository = createRepository(storage);

    const loaded = await repository.load();

    assert.equal(loaded.status, 'corrupt');
    assert.equal(loaded.source, 'defaults');
    assert.ok(loaded.quarantineKeys.length >= 1);
});
