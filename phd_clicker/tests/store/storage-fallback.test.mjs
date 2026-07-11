import test from 'node:test';
import assert from 'node:assert/strict';

import { loadLocale } from '../../js/data.js';
import { Runtime, State, resetState } from '../../js/state.js';

test('locale loading remains usable when localStorage access throws SecurityError', () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
            throw Object.assign(new Error('storage denied'), { name: 'SecurityError' });
        }
    });

    try {
        resetState();
        assert.doesNotThrow(() => loadLocale('en'));
        assert.equal(State.currentLang, 'en');
        assert.equal(Runtime.localeStorageUnavailable, true);
    } finally {
        if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
        else delete globalThis.localStorage;
    }
});
