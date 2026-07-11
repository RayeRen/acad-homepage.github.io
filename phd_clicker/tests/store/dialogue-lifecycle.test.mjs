import test from 'node:test';
import assert from 'node:assert/strict';

class FakeClassList {
    constructor(initial = []) {
        this.values = new Set(initial);
    }

    add(...names) {
        names.forEach(name => this.values.add(name));
    }

    remove(...names) {
        names.forEach(name => this.values.delete(name));
    }

    contains(name) {
        return this.values.has(name);
    }

    toggle(name, force) {
        if (force !== undefined) {
            if (force) this.values.add(name);
            else this.values.delete(name);
            return force;
        }
        if (this.values.has(name)) {
            this.values.delete(name);
            return false;
        }
        this.values.add(name);
        return true;
    }
}

class FakeElement {
    constructor({ classes = [] } = {}) {
        this.classList = new FakeClassList(classes);
        this.listeners = new Map();
        this.style = {};
        this.textContent = '';
        this.parent = null;
    }

    addEventListener(type, listener) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type).add(listener);
    }

    removeEventListener(type, listener) {
        this.listeners.get(type)?.delete(listener);
    }

    contains(target) {
        for (let node = target; node; node = node.parent) {
            if (node === this) return true;
        }
        return false;
    }

    emit(type, event = {}) {
        const normalized = { target: this, ...event };
        for (const listener of [...(this.listeners.get(type) || [])]) {
            listener.call(this, normalized);
        }
    }

    listenerCount(type) {
        return this.listeners.get(type)?.size || 0;
    }
}

test('dialogue lifecycle is idempotent and clears stale UI/queue timers', async t => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;

    let nextTimerId = 1;
    const timers = new Map();
    globalThis.setTimeout = (callback, delay = 0) => {
        const id = nextTimerId++;
        timers.set(id, { callback, delay });
        return id;
    };
    globalThis.clearTimeout = id => timers.delete(id);

    const runAllTimers = () => {
        let iterations = 0;
        while (timers.size > 0) {
            assert.ok(iterations++ < 100, 'timer queue should settle');
            const [id, timer] = timers.entries().next().value;
            timers.delete(id);
            timer.callback();
        }
    };

    const bar = new FakeElement({ classes: ['hidden'] });
    const text = new FakeElement();
    const cursor = new FakeElement();
    const minimize = new FakeElement();
    minimize.parent = bar;
    const elements = new Map([
        ['agi-dialogue-bar', bar],
        ['agi-text', text],
        ['agi-cursor', cursor],
        ['agi-minimize-btn', minimize]
    ]);

    globalThis.window = {};
    globalThis.document = {
        getElementById(id) {
            return elements.get(id) || null;
        }
    };

    t.after(() => {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
        globalThis.setTimeout = originalSetTimeout;
        globalThis.clearTimeout = originalClearTimeout;
    });

    const [{ State, Runtime, resetState }, Dialogue] = await Promise.all([
        import('../../js/state.js'),
        import('../../js/agi/dialogue/index.js')
    ]);
    resetState();
    Runtime.agi.isTyping = false;
    Runtime.agi.dialogueMinimized = false;

    Dialogue.init();
    Dialogue.init();
    assert.equal(minimize.listenerCount('click'), 1);
    assert.equal(bar.listenerCount('click'), 1);

    const minimizedBeforeClick = bar.classList.contains('minimized');
    minimize.emit('click');
    bar.emit('click', { target: minimize });
    assert.equal(bar.classList.contains('minimized'), !minimizedBeforeClick,
        'one physical click must toggle exactly once after repeated init');

    Dialogue.show();
    assert.equal(bar.classList.contains('hidden'), false);
    Dialogue.hide();
    Dialogue.show();
    runAllTimers();
    assert.equal(bar.classList.contains('hidden'), false,
        'show must cancel a pending hide animation');

    State.inventory.agi_proto = 1;
    let completions = 0;
    Dialogue.showDialogue('stale text', null, () => { completions += 1; });
    assert.equal(Runtime.agi.isTyping, true);
    Dialogue.hide();
    runAllTimers();
    assert.equal(completions, 0, 'hide must discard the old completion callback');
    assert.equal(Runtime.agi.isTyping, false);

    Dialogue.DialogueManager.startSequence({
        id: 'old-world-sequence',
        dialogues: [{ text: 'must not render', delay: 100 }]
    });
    assert.equal(Dialogue.getState().isPlaying, true);
    Dialogue.init();
    runAllTimers();
    assert.equal(Dialogue.getState().isPlaying, false);
    assert.equal(Dialogue.getState().queueLength, 0);
    assert.equal(text.textContent, '', 'old-world delayed dialogue must be cancelled');
    assert.equal(minimize.listenerCount('click'), 1);
    assert.equal(bar.listenerCount('click'), 1);

    Dialogue.destroy();
    assert.equal(minimize.listenerCount('click'), 0);
    assert.equal(bar.listenerCount('click'), 0);
    assert.equal(window.AGI_UI, undefined);
    assert.equal(timers.size, 0);

    Dialogue.init();
    Dialogue.show();
    assert.equal(minimize.listenerCount('click'), 1);
    assert.equal(bar.classList.contains('hidden'), false,
        'destroy followed by init/show must remain reusable');
    Dialogue.destroy();
});
