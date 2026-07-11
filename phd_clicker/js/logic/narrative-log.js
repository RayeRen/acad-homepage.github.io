import { State } from '../state.js';

export const DEFAULT_MAX_ENTRIES = 200;

export const NarrativeImportance = Object.freeze({
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical'
});

const IMPORTANCE_VALUES = new Set(Object.values(NarrativeImportance));
const LEGACY_IMPORTANCE = ['low', 'normal', 'high', 'critical'];
const MAX_TEXT_LENGTH = 512;
const MAX_CONTEXT_DEPTH = 8;
const MAX_CONTEXT_ITEMS = 100;
const listeners = new Set();

function notify(change) {
    listeners.forEach(listener => {
        try {
            listener(change);
        } catch (error) {
            console.warn('[NarrativeLog] listener failed:', error);
        }
    });
}

export function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function');
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function safeText(value, fallback = '', maxLength = MAX_TEXT_LENGTH) {
    if (typeof value !== 'string') return fallback;
    const text = value.trim();
    return text ? text.slice(0, maxLength) : fallback;
}

function normalizeImportance(value) {
    if (IMPORTANCE_VALUES.has(value)) return value;
    if (Number.isInteger(value) && value >= 0 && value < LEGACY_IMPORTANCE.length) {
        return LEGACY_IMPORTANCE[value];
    }
    return NarrativeImportance.NORMAL;
}

function normalizeTimestamp(value, fallback = 0) {
    if (typeof value === 'string' && value.trim()) {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric >= 0) return numeric;
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }

    return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function sanitizeJson(value, depth = 0, seen = new WeakSet()) {
    if (value === null || typeof value === 'boolean' || typeof value === 'string') {
        return typeof value === 'string' ? value.slice(0, 4096) : value;
    }
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        return undefined;
    }
    if (typeof value === 'bigint') return String(value);
    if (depth >= MAX_CONTEXT_DEPTH || typeof value !== 'object') return null;
    if (seen.has(value)) return null;

    seen.add(value);
    try {
        if (Array.isArray(value)) {
            return value
                .slice(0, MAX_CONTEXT_ITEMS)
                .map(item => sanitizeJson(item, depth + 1, seen) ?? null);
        }

        const result = {};
        for (const key of Object.keys(value).slice(0, MAX_CONTEXT_ITEMS)) {
            if (key === '__proto__' || key === 'prototype' || key === 'constructor') continue;
            const sanitized = sanitizeJson(value[key], depth + 1, seen);
            if (sanitized !== undefined) result[key.slice(0, 128)] = sanitized;
        }
        return result;
    } finally {
        seen.delete(value);
    }
}

function normalizeContext(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return sanitizeJson(value) || {};
}

function stableSerialize(value) {
    if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
    if (value && typeof value === 'object') {
        return `{${Object.keys(value).sort().map(key =>
            `${JSON.stringify(key)}:${stableSerialize(value[key])}`
        ).join(',')}}`;
    }
    return JSON.stringify(value);
}

function hashString(value) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36).padStart(7, '0');
}

function defaultIdFactory(entry, { legacyIndex = null } = {}) {
    const seed = stableSerialize({
        type: entry.type,
        messageKey: entry.messageKey,
        context: entry.context,
        importance: entry.importance,
        source: entry.source,
        dedupeKey: entry.dedupeKey,
        timestamp: entry.timestamp,
        legacyIndex
    });
    return `nlog_${Math.trunc(entry.timestamp).toString(36)}_${hashString(seed)}`;
}

function uniqueId(preferredId, entry, existingIds, idFactory, metadata) {
    const requested = safeText(preferredId, '', 160);
    const base = requested || safeText(idFactory(entry, metadata), '', 160)
        || defaultIdFactory(entry, metadata);
    let id = base;
    let suffix = 2;
    while (existingIds.has(id)) id = `${base}_${suffix++}`;
    existingIds.add(id);
    return id;
}

function normalizeMaxEntries(value) {
    if (!Number.isFinite(value)) return DEFAULT_MAX_ENTRIES;
    return Math.max(1, Math.min(5000, Math.floor(value)));
}

function cloneEntry(entry) {
    return {
        ...entry,
        context: sanitizeJson(entry.context) || {}
    };
}

function normalizeLegacyEntry(value, index, existingIds, idFactory) {
    const legacy = typeof value === 'string'
        ? { messageKey: value, type: 'legacy', source: 'legacy' }
        : value;
    if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) return null;

    const messageKey = safeText(
        legacy.messageKey ?? legacy.key ?? legacy.message,
        '',
        MAX_TEXT_LENGTH
    );
    if (!messageKey) return null;

    const type = safeText(legacy.type ?? legacy.category, 'event', 80);
    const source = safeText(legacy.source, 'legacy', 80);
    const dedupeKey = safeText(legacy.dedupeKey ?? legacy.uniqueKey, '', 256) || null;
    const timestamp = normalizeTimestamp(
        legacy.timestamp ?? legacy.createdAt ?? legacy.time,
        0
    );
    const entry = {
        id: '',
        type,
        messageKey,
        context: normalizeContext(legacy.context ?? legacy.data),
        importance: normalizeImportance(legacy.importance),
        source,
        timestamp,
        read: typeof legacy.read === 'boolean'
            ? legacy.read
            : Boolean(legacy.seen ?? legacy.isRead),
        dedupeKey
    };
    entry.id = uniqueId(legacy.id, entry, existingIds, idFactory, { legacyIndex: index });
    return entry;
}

/**
 * Safely normalize persisted or hand-edited narrative log data.
 * Missing legacy ids are deterministic, so repeatedly normalizing the same raw
 * data does not generate a new identity or timestamp.
 */
export function normalizeNarrativeLog(value, {
    maxEntries = DEFAULT_MAX_ENTRIES,
    idFactory = defaultIdFactory
} = {}) {
    if (!Array.isArray(value)) return [];

    const existingIds = new Set();
    const seenDedupeKeys = new Set();
    const normalized = [];
    value.forEach((rawEntry, index) => {
        const entry = normalizeLegacyEntry(rawEntry, index, existingIds, idFactory);
        if (!entry) return;
        if (entry.dedupeKey && seenDedupeKeys.has(entry.dedupeKey)) return;
        if (entry.dedupeKey) seenDedupeKeys.add(entry.dedupeKey);
        normalized.push(entry);
    });

    return normalized.slice(-normalizeMaxEntries(maxEntries));
}

/** Normalize State.narrativeLog in place and return the canonical array. */
export function normalizeStateNarrativeLog({
    state = State,
    maxEntries = DEFAULT_MAX_ENTRIES,
    idFactory = defaultIdFactory
} = {}) {
    if (!state || typeof state !== 'object') throw new TypeError('state must be an object');
    state.narrativeLog = normalizeNarrativeLog(state.narrativeLog, { maxEntries, idFactory });
    return state.narrativeLog;
}

function parseAppendArguments(input, args) {
    if (input && typeof input === 'object' && !Array.isArray(input)) {
        return { data: input, options: args[0] || {} };
    }

    const [messageKey, context = {}, importance = 'normal', source = 'game', options = {}] = args;
    return {
        data: { type: input, messageKey, context, importance, source },
        options
    };
}

/**
 * Append an entry. Preferred form:
 * append({ type, messageKey, context, importance, source, dedupeKey }, options)
 *
 * A positional compatibility form is also supported:
 * append(type, messageKey, context, importance, source, options)
 */
export function append(input, ...args) {
    const { data, options } = parseAppendArguments(input, args);
    const {
        state = State,
        maxEntries = DEFAULT_MAX_ENTRIES,
        now = Date.now,
        idFactory = defaultIdFactory
    } = options;
    if (typeof now !== 'function') throw new TypeError('now must be a function');
    if (typeof idFactory !== 'function') throw new TypeError('idFactory must be a function');

    const messageKey = safeText(data.messageKey, '', MAX_TEXT_LENGTH);
    if (!messageKey) throw new TypeError('messageKey must be a non-empty string');

    const log = normalizeStateNarrativeLog({ state, maxEntries, idFactory });
    const dedupeKey = safeText(data.dedupeKey, '', 256) || null;
    if (dedupeKey) {
        const existing = log.find(entry => entry.dedupeKey === dedupeKey);
        if (existing) return { appended: false, deduplicated: true, entry: cloneEntry(existing) };
    }

    const timestamp = normalizeTimestamp(now(), 0);
    const entry = {
        id: '',
        type: safeText(data.type, 'event', 80),
        messageKey,
        context: normalizeContext(data.context),
        importance: normalizeImportance(data.importance),
        source: safeText(data.source, 'game', 80),
        timestamp,
        read: Boolean(data.read),
        dedupeKey
    };
    const ids = new Set(log.map(item => item.id));
    entry.id = uniqueId(data.id, entry, ids, idFactory, { legacyIndex: null });
    log.push(entry);
    if (log.length > normalizeMaxEntries(maxEntries)) {
        log.splice(0, log.length - normalizeMaxEntries(maxEntries));
    }
    const detached = cloneEntry(entry);
    notify({ type: 'appended', entry: detached });
    return { appended: true, deduplicated: false, entry: detached };
}

export function markRead(id, read = true, {
    state = State,
    maxEntries = DEFAULT_MAX_ENTRIES
} = {}) {
    const normalizedId = safeText(id, '', 160);
    if (!normalizedId) return null;
    const log = normalizeStateNarrativeLog({ state, maxEntries });
    const entry = log.find(item => item.id === normalizedId);
    if (!entry) return null;
    entry.read = Boolean(read);
    const detached = cloneEntry(entry);
    notify({ type: 'read-changed', entry: detached });
    return detached;
}

function matchesFilter(value, filter) {
    if (filter === undefined) return true;
    return Array.isArray(filter) ? filter.includes(value) : value === filter;
}

/** Query returns detached entries, newest first by default. */
export function query(filters = {}, {
    state = State,
    maxEntries = DEFAULT_MAX_ENTRIES
} = {}) {
    const log = normalizeStateNarrativeLog({ state, maxEntries });
    const since = normalizeTimestamp(filters.since, -1);
    const until = normalizeTimestamp(filters.until, Number.POSITIVE_INFINITY);
    const order = filters.order === 'asc' ? 'asc' : 'desc';
    const indexed = log.map((entry, index) => ({ entry, index }));

    const filtered = indexed.filter(({ entry }) =>
        matchesFilter(entry.type, filters.type) &&
        matchesFilter(entry.messageKey, filters.messageKey) &&
        matchesFilter(entry.importance, filters.importance) &&
        matchesFilter(entry.source, filters.source) &&
        matchesFilter(entry.read, filters.read) &&
        matchesFilter(entry.dedupeKey, filters.dedupeKey) &&
        entry.timestamp >= since &&
        entry.timestamp <= until
    );

    filtered.sort((left, right) => {
        const byTime = left.entry.timestamp - right.entry.timestamp;
        const stable = byTime || left.index - right.index;
        return order === 'asc' ? stable : -stable;
    });

    const requestedLimit = Number(filters.limit);
    const limit = Number.isFinite(requestedLimit)
        ? Math.max(0, Math.floor(requestedLimit))
        : filtered.length;
    return filtered.slice(0, limit).map(({ entry }) => cloneEntry(entry));
}
