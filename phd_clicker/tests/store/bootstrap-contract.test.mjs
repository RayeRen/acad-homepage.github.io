import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mainSource = readFileSync(new URL('../../js/main.js', import.meta.url), 'utf8');
const annihilationSource = readFileSync(
    new URL('../../js/agi/endings/annihilation.js', import.meta.url),
    'utf8'
);

test('bootstrap requires the exact tombstone object and checksum with no latest fallback', () => {
    const start = mainSource.indexOf('async function getTransitionCheckpoint');
    const end = mainSource.indexOf('function mergeLoadedGameState', start);
    const body = mainSource.slice(start, end);

    assert.ok(start >= 0);
    assert.match(body, /if \(!objectId \|\| !expectedChecksum\) return null/);
    assert.match(body, /await reflogRepository\.get\(objectId\)/);
    assert.doesNotMatch(body, /findLatest/);
    assert.match(body, /checkpoint\.envelope\?\.checksum\?\.value !== expectedChecksum/);
});

test('bootstrap replays every committed world transition with the safe installer', () => {
    const start = mainSource.indexOf('async function loadGame()');
    const end = mainSource.indexOf('/**\n * Hard reset', start);
    const body = mainSource.slice(start, end);

    assert.match(body, /tombstone\.reason === 'annihilation'/);
    assert.match(body, /reason: 'post-annihilation-new-world'/);
    assert.match(body, /tombstone\.reason === 'reflog-recovery'/);
    assert.match(body, /saveController\.installWorld\(gameState/);
    assert.match(body, /tombstone\.reason === 'hard-reset'/);
    assert.match(body, /reason: 'hard-reset-bootstrap'/);
    assert.match(body, /worldHistoryController\.finalizeRecovery/);
});

test('a committed annihilation error reloads instead of claiming deletion stopped', () => {
    const committedCheck = annihilationSource.indexOf(
        'error?.committed && error?.reloadRequired'
    );
    const reload = annihilationSource.indexOf('window.location.reload()', committedCheck);
    const failureReturn = annihilationSource.indexOf('return false', committedCheck);

    assert.ok(committedCheck >= 0 && reload > committedCheck);
    assert.ok(failureReturn < 0 || reload < failureReturn);
});

test('offline earnings use the envelope timestamp rather than a stale state snapshot', () => {
    const start = mainSource.indexOf('async function loadGame()');
    const end = mainSource.indexOf('/**\n * Hard reset', start);
    const body = mainSource.slice(start, end);

    assert.match(
        body,
        /lastSaveTime: result\.envelope\?\.savedAt \?\? saved\?\.lastSaveTime \?\? null/
    );
});
