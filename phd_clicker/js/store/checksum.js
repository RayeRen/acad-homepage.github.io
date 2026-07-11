import { cloneJsonValue, isPlainRecord } from './normalize.js';

export const DEFAULT_CHECKSUM_ALGORITHM = 'SHA-256';

function canonicalize(value, { inArray = false } = {}) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        return inArray ? null : undefined;
    }

    if (typeof value === 'bigint') {
        throw new TypeError('BigInt values are not supported in checksummed data');
    }

    if (Array.isArray(value)) {
        return value.map(item => canonicalize(item, { inArray: true }));
    }

    if (isPlainRecord(value)) {
        const canonical = {};
        for (const key of Object.keys(value).sort()) {
            const child = canonicalize(value[key]);
            if (child !== undefined) canonical[key] = child;
        }
        return canonical;
    }

    if (typeof value.toJSON === 'function') {
        return canonicalize(value.toJSON(), { inArray });
    }

    throw new TypeError('Checksummed data must be JSON-compatible');
}

/** Stable JSON representation independent of object insertion order. */
export function canonicalStringify(value) {
    return JSON.stringify(canonicalize(value));
}

/** Return the part of an envelope covered by its checksum. */
export function getChecksumPayload(envelope) {
    if (!isPlainRecord(envelope)) {
        throw new TypeError('Save envelope must be an object');
    }

    const payload = {};
    for (const key of Object.keys(envelope)) {
        if (key === 'checksum') continue;
        payload[key] = cloneJsonValue(envelope[key]);
    }
    return payload;
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create the production checksum adapter from browser-native Web Crypto.
 * Dependencies are injectable so the same pure modules work under node:test.
 */
export function createWebCryptoChecksumAdapter({
    crypto = globalThis.crypto,
    TextEncoderImpl = globalThis.TextEncoder
} = {}) {
    return {
        algorithm: DEFAULT_CHECKSUM_ALGORITHM,

        async digest(text) {
            if (!crypto?.subtle?.digest) {
                throw new Error('Web Crypto subtle.digest is unavailable');
            }
            if (!TextEncoderImpl) {
                throw new Error('TextEncoder is unavailable');
            }

            const bytes = new TextEncoderImpl().encode(text);
            const result = await crypto.subtle.digest(DEFAULT_CHECKSUM_ALGORITHM, bytes);
            return bytesToHex(new Uint8Array(result));
        }
    };
}

export async function calculateEnvelopeChecksum(
    envelope,
    adapter = createWebCryptoChecksumAdapter()
) {
    return adapter.digest(canonicalStringify(getChecksumPayload(envelope)));
}

/** Return a detached envelope with a fresh checksum. */
export async function sealEnvelope(
    envelope,
    adapter = createWebCryptoChecksumAdapter()
) {
    const sealed = cloneJsonValue(envelope);
    const value = await calculateEnvelopeChecksum(sealed, adapter);
    sealed.checksum = {
        algorithm: adapter.algorithm,
        value
    };
    return sealed;
}

/**
 * Verify without throwing for expected integrity states. This distinction lets
 * callers react to localStorage edits as a Meta event instead of automatically
 * punishing the player by discarding a parseable save.
 */
export async function verifyEnvelopeChecksum(
    envelope,
    adapter = createWebCryptoChecksumAdapter()
) {
    const checksum = envelope?.checksum;
    if (!isPlainRecord(checksum) || typeof checksum.value !== 'string') {
        return {
            valid: false,
            reason: 'missing',
            expected: null,
            actual: null,
            algorithm: null
        };
    }

    if (checksum.algorithm !== adapter.algorithm) {
        return {
            valid: false,
            reason: 'unsupported-algorithm',
            expected: checksum.value,
            actual: null,
            algorithm: checksum.algorithm
        };
    }

    const actual = await calculateEnvelopeChecksum(envelope, adapter);
    return {
        valid: actual === checksum.value,
        reason: actual === checksum.value ? null : 'mismatch',
        expected: checksum.value,
        actual,
        algorithm: checksum.algorithm
    };
}
