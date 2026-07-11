import {
    createDefaultGameState,
    createDefaultMetaState,
    createDefaultSaveEnvelope,
    CURRENT_SCHEMA_VERSION,
    SAVE_FORMAT
} from './schema.js';

export function isPlainRecord(value) {
    if (value === null || typeof value !== 'object') return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function defineOwn(target, key, value) {
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
    });
}

/**
 * Clone a JSON-compatible value without sharing arrays or records.
 * Object keys with unsupported JSON values are omitted; array slots become
 * null, matching JSON.stringify semantics.
 */
export function cloneJsonValue(value, { inArray = false } = {}) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'bigint') {
        throw new TypeError('BigInt values are not supported in save data');
    }

    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        return inArray ? null : undefined;
    }

    if (Array.isArray(value)) {
        return value.map(item => cloneJsonValue(item, { inArray: true }));
    }

    if (isPlainRecord(value)) {
        const cloned = {};
        for (const key of Object.keys(value)) {
            const child = cloneJsonValue(value[key]);
            if (child !== undefined) defineOwn(cloned, key, child);
        }
        return cloned;
    }

    if (typeof value.toJSON === 'function') {
        return cloneJsonValue(value.toJSON(), { inArray });
    }

    throw new TypeError('Save data must contain only JSON-compatible values');
}

function normalizeNumber(candidate, fallback) {
    if (candidate === null || candidate === '' || typeof candidate === 'boolean') {
        return fallback;
    }

    const number = Number(candidate);
    return Number.isFinite(number) ? number : fallback;
}

/**
 * Deeply fill a value from defaults while preserving every unknown record key.
 * Known primitive fields are normalized to the type of their default. Arrays
 * are cloned as complete values rather than merged by index.
 */
export function deepFillDefaults(defaultValue, candidateValue) {
    if (Array.isArray(defaultValue)) {
        return Array.isArray(candidateValue)
            ? cloneJsonValue(candidateValue)
            : cloneJsonValue(defaultValue);
    }

    if (isPlainRecord(defaultValue)) {
        if (!isPlainRecord(candidateValue)) return cloneJsonValue(defaultValue);

        const result = {};
        for (const key of Object.keys(defaultValue)) {
            const candidate = Object.prototype.hasOwnProperty.call(candidateValue, key)
                ? candidateValue[key]
                : undefined;

            defineOwn(
                result,
                key,
                candidate === undefined
                    ? cloneJsonValue(defaultValue[key])
                    : deepFillDefaults(defaultValue[key], candidate)
            );
        }

        for (const key of Object.keys(candidateValue)) {
            if (Object.prototype.hasOwnProperty.call(defaultValue, key)) continue;
            const child = cloneJsonValue(candidateValue[key]);
            if (child !== undefined) defineOwn(result, key, child);
        }

        return result;
    }

    if (typeof defaultValue === 'number') {
        return normalizeNumber(candidateValue, defaultValue);
    }

    if (typeof defaultValue === 'string') {
        return typeof candidateValue === 'string' ? candidateValue : defaultValue;
    }

    if (typeof defaultValue === 'boolean') {
        return typeof candidateValue === 'boolean' ? candidateValue : defaultValue;
    }

    // A null default represents a deliberately nullable/extensible field (for
    // example currentAdvisor or interruptedState), so preserve any JSON value.
    if (defaultValue === null) {
        return candidateValue === undefined ? null : cloneJsonValue(candidateValue);
    }

    return candidateValue === undefined
        ? cloneJsonValue(defaultValue)
        : cloneJsonValue(candidateValue);
}

export function normalizeGameState(value, { now = Date.now } = {}) {
    return deepFillDefaults(createDefaultGameState({ now }), value);
}

export function normalizeMetaState(value) {
    return deepFillDefaults(createDefaultMetaState(), value);
}

/**
 * Normalize an already-current envelope. Checksum verification must happen on
 * the parsed original before this function adds missing default fields.
 */
export function normalizeCurrentEnvelope(value, { now = Date.now } = {}) {
    if (!isPlainRecord(value)) {
        throw new TypeError('Save envelope must be an object');
    }

    const normalized = deepFillDefaults(createDefaultSaveEnvelope({ now }), value);
    normalized.format = SAVE_FORMAT;
    normalized.schemaVersion = CURRENT_SCHEMA_VERSION;
    normalized.gameState = normalizeGameState(value.gameState, {
        now: () => normalized.savedAt
    });
    normalized.metaState = normalizeMetaState(value.metaState);
    return normalized;
}
