/**
 * Small lifecycle boundary for fourth-wall effects.
 *
 * Effects receive an isolated scope. Every timer, listener, DOM node, object
 * URL and media stream registered in that scope is released together, so a
 * scene cannot leak into the normal clicker after it ends or the page resumes.
 */

export class EffectScope {
    constructor({
        setTimeoutImpl = globalThis.setTimeout?.bind(globalThis),
        clearTimeoutImpl = globalThis.clearTimeout?.bind(globalThis),
        setIntervalImpl = globalThis.setInterval?.bind(globalThis),
        clearIntervalImpl = globalThis.clearInterval?.bind(globalThis),
        urlApi = globalThis.URL
    } = {}) {
        this.setTimeoutImpl = setTimeoutImpl;
        this.clearTimeoutImpl = clearTimeoutImpl;
        this.setIntervalImpl = setIntervalImpl;
        this.clearIntervalImpl = clearIntervalImpl;
        this.urlApi = urlApi;
        this.active = true;
        this.timeouts = new Set();
        this.intervals = new Set();
        this.listeners = new Set();
        this.nodes = new Set();
        this.streams = new Set();
        this.objectUrls = new Set();
        this.disposers = [];
    }

    guard(callback) {
        return (...args) => {
            if (!this.active) return undefined;
            return callback(...args);
        };
    }

    timeout(callback, delay = 0) {
        if (!this.active || !this.setTimeoutImpl) return null;
        const id = this.setTimeoutImpl(() => {
            this.timeouts.delete(id);
            if (this.active) callback();
        }, delay);
        this.timeouts.add(id);
        return id;
    }

    interval(callback, delay = 0) {
        if (!this.active || !this.setIntervalImpl) return null;
        const id = this.setIntervalImpl(this.guard(callback), delay);
        this.intervals.add(id);
        return id;
    }

    delay(delay = 0) {
        return new Promise(resolve => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                resolve();
            };
            this.timeout(finish, delay);
            // Destroying an effect must not leave its handler promise pending.
            this.addDisposer(finish);
        });
    }

    listen(target, type, listener, options) {
        if (!this.active || !target?.addEventListener) return () => {};
        target.addEventListener(type, listener, options);
        const record = { target, type, listener, options };
        this.listeners.add(record);
        return () => {
            if (!this.listeners.delete(record)) return;
            target.removeEventListener(type, listener, options);
        };
    }

    trackNode(node) {
        if (!node) return node;
        if (!this.active) node.remove?.();
        else this.nodes.add(node);
        return node;
    }

    trackStream(stream) {
        if (!stream) return stream;
        if (!this.active) {
            try {
                stream.getTracks?.().forEach(track => track.stop?.());
            } catch {
                // Best effort for a stream resolving after scene destruction.
            }
        } else {
            this.streams.add(stream);
        }
        return stream;
    }

    trackObjectUrl(url) {
        if (typeof url === 'string' && url) {
            if (!this.active) this.urlApi?.revokeObjectURL?.(url);
            else this.objectUrls.add(url);
        }
        return url;
    }

    addDisposer(disposer) {
        if (typeof disposer === 'function') this.disposers.push(disposer);
        return disposer;
    }

    cleanup() {
        if (!this.active) return;
        this.active = false;

        this.timeouts.forEach(id => this.clearTimeoutImpl?.(id));
        this.intervals.forEach(id => this.clearIntervalImpl?.(id));
        this.timeouts.clear();
        this.intervals.clear();

        this.listeners.forEach(({ target, type, listener, options }) => {
            target.removeEventListener?.(type, listener, options);
        });
        this.listeners.clear();

        this.streams.forEach(stream => {
            try {
                stream.getTracks?.().forEach(track => track.stop?.());
            } catch {
                // A device disappearing during cleanup is harmless.
            }
        });
        this.streams.clear();

        this.objectUrls.forEach(url => {
            try {
                this.urlApi?.revokeObjectURL?.(url);
            } catch {
                // Revocation is best effort on browser shutdown.
            }
        });
        this.objectUrls.clear();

        this.nodes.forEach(node => node?.remove?.());
        this.nodes.clear();

        for (const disposer of this.disposers.splice(0).reverse()) {
            try {
                disposer();
            } catch (error) {
                console.warn('[MetaEffect] cleanup failed:', error);
            }
        }
    }
}

function isTrustedActivation(context) {
    return context?.trusted === true || context?.event?.isTrusted === true;
}

/**
 * Registry that enforces trusted-activation and once-only contracts.
 */
export class MetaEffectRuntime {
    constructor({
        state = {},
        scopeFactory = () => new EffectScope(),
        onEvent = () => {},
        now = Date.now
    } = {}) {
        this.state = state && typeof state === 'object' ? state : {};
        this.scopeFactory = scopeFactory;
        this.onEvent = onEvent;
        this.now = now;
        this.effects = new Map();
        this.activeScopes = new Map();
        if (!this.state.effects || typeof this.state.effects !== 'object') {
            this.state.effects = {};
        }
    }

    register(name, handler, {
        requiresTrustedActivation = false,
        once = false,
        keepAlive = false
    } = {}) {
        if (typeof name !== 'string' || !name) throw new TypeError('effect name is required');
        if (typeof handler !== 'function') throw new TypeError('effect handler must be a function');
        this.effects.set(name, { handler, requiresTrustedActivation, once, keepAlive });
        return this;
    }

    getRecord(name) {
        return this.state.effects[name] || null;
    }

    async trigger(name, context = {}) {
        const definition = this.effects.get(name);
        if (!definition) return { ok: false, status: 'unknown-effect', name };

        const prior = this.getRecord(name);
        if (definition.once && prior?.attemptedAt) {
            return { ok: false, status: 'already-attempted', name, prior };
        }
        if (definition.requiresTrustedActivation && !isTrustedActivation(context)) {
            return { ok: false, status: 'trusted-activation-required', name };
        }

        const startedAt = this.now();
        const scope = this.scopeFactory(name, context);
        this.activeScopes.set(name, scope);
        // Mark before invoking the handler: re-entrant clicks cannot prompt or
        // download twice while the first native operation is still pending.
        this.state.effects[name] = {
            attemptedAt: startedAt,
            completedAt: null,
            status: 'running'
        };
        this.onEvent({ type: 'started', name, timestamp: startedAt });

        try {
            // The handler is invoked before the first await. Native APIs that
            // require transient user activation therefore run in the click's
            // original task rather than after an artificial confirmation.
            const result = await definition.handler({ scope, context, name });
            const completedAt = this.now();
            const status = result?.status || 'completed';
            const record = { attemptedAt: startedAt, completedAt, status };
            this.state.effects[name] = record;
            this.onEvent({ type: 'completed', name, timestamp: completedAt, result });
            return { ok: true, status, name, result, record };
        } catch (error) {
            const completedAt = this.now();
            const status = error?.name || 'error';
            const record = { attemptedAt: startedAt, completedAt, status };
            this.state.effects[name] = record;
            this.onEvent({ type: 'failed', name, timestamp: completedAt, error });
            return { ok: false, status, name, error, record };
        } finally {
            if (!definition.keepAlive) {
                scope.cleanup();
                this.activeScopes.delete(name);
            }
        }
    }

    stop(name) {
        const scope = this.activeScopes.get(name);
        if (!scope) return false;
        scope.cleanup();
        this.activeScopes.delete(name);
        return true;
    }

    destroy() {
        [...this.activeScopes.keys()].forEach(name => this.stop(name));
        this.effects.clear();
    }
}
