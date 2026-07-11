import {
    CURRENT_SCHEMA_VERSION,
    SAVE_FORMAT,
    createDefaultMetaState
} from './schema.js';
import {
    cloneJsonValue,
    isPlainRecord,
    normalizeCurrentEnvelope,
    normalizeGameState,
    normalizeMetaState
} from './normalize.js';

export class InvalidSaveError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'InvalidSaveError';
        this.code = 'INVALID_SAVE';
    }
}

export class UnsupportedSchemaVersionError extends Error {
    constructor(version) {
        super(`Unsupported save schema version: ${version}`);
        this.name = 'UnsupportedSchemaVersionError';
        this.code = 'UNSUPPORTED_SCHEMA_VERSION';
        this.version = version;
    }
}

export function isVersionedSaveEnvelope(value) {
    return isPlainRecord(value) && (
        value.format === SAVE_FORMAT ||
        (
            Object.prototype.hasOwnProperty.call(value, 'schemaVersion') &&
            Object.prototype.hasOwnProperty.call(value, 'gameState')
        )
    );
}

function coerceSchemaVersion(value) {
    if (value === '' || value === null || typeof value === 'boolean') return NaN;
    const version = Number(value);
    return Number.isInteger(version) && version >= 0 ? version : NaN;
}

function copyEnvelopeExtensions(source, target, excludedKeys) {
    for (const key of Object.keys(source)) {
        if (excludedKeys.has(key)) continue;
        target[key] = cloneJsonValue(source[key]);
    }
    return target;
}

function migrateVersion0Envelope(value, { now }) {
    const legacyState = value.gameState ?? value.state ?? value.data;
    if (!isPlainRecord(legacyState)) {
        throw new InvalidSaveError('Version 0 save envelope has no game state object');
    }

    const savedAtCandidate = Number(value.savedAt ?? legacyState.lastSaveTime);
    const savedAt = Number.isFinite(savedAtCandidate) ? savedAtCandidate : now();
    const migrated = {
        format: SAVE_FORMAT,
        schemaVersion: 1,
        savedAt,
        gameState: normalizeGameState(legacyState, { now: () => savedAt }),
        metaState: normalizeMetaState(value.metaState ?? value.meta ?? createDefaultMetaState()),
        checksum: null
    };

    return copyEnvelopeExtensions(
        value,
        migrated,
        new Set([
            'format', 'schemaVersion', 'savedAt', 'gameState', 'state', 'data',
            'metaState', 'meta', 'checksum'
        ])
    );
}

const VERSION_MIGRATIONS = new Map([
    [0, migrateVersion0Envelope]
]);

function migrateLegacyRoot(value, { now }) {
    if (!isPlainRecord(value)) {
        throw new InvalidSaveError('Legacy save must be an object');
    }

    const savedAtCandidate = Number(value.lastSaveTime);
    const savedAt = Number.isFinite(savedAtCandidate) ? savedAtCandidate : now();
    return {
        format: SAVE_FORMAT,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt,
        gameState: normalizeGameState(value, { now: () => savedAt }),
        metaState: createDefaultMetaState(),
        checksum: null
    };
}

/**
 * Normalize a legacy root save or migrate a versioned envelope to the current
 * schema. Unknown game, AGI, meta, and envelope fields are preserved.
 *
 * @returns {{ envelope: object, migrated: boolean, migratedFrom: 'legacy'|number|null }}
 */
export function migrateSave(value, { now = Date.now } = {}) {
    if (!isPlainRecord(value)) {
        throw new InvalidSaveError('Save root must be an object');
    }

    if (!isVersionedSaveEnvelope(value)) {
        return {
            envelope: migrateLegacyRoot(value, { now }),
            migrated: true,
            migratedFrom: 'legacy'
        };
    }

    const initialVersion = coerceSchemaVersion(value.schemaVersion);
    if (!Number.isInteger(initialVersion)) {
        throw new InvalidSaveError('Save envelope has an invalid schemaVersion');
    }
    if (initialVersion > CURRENT_SCHEMA_VERSION) {
        throw new UnsupportedSchemaVersionError(initialVersion);
    }

    // A current-version envelope without a world payload is corrupt, not an
    // empty save. Silently filling it with defaults would allow autosave to
    // overwrite the only evidence of the damaged save.
    if (initialVersion === CURRENT_SCHEMA_VERSION && !isPlainRecord(value.gameState)) {
        throw new InvalidSaveError('Current save envelope has no gameState object');
    }

    let envelope = cloneJsonValue(value);
    let version = initialVersion;
    while (version < CURRENT_SCHEMA_VERSION) {
        const migrate = VERSION_MIGRATIONS.get(version);
        if (!migrate) throw new UnsupportedSchemaVersionError(version);
        envelope = migrate(envelope, { now });
        version = coerceSchemaVersion(envelope.schemaVersion);
    }

    return {
        envelope: normalizeCurrentEnvelope(envelope, { now }),
        migrated: initialVersion !== CURRENT_SCHEMA_VERSION,
        migratedFrom: initialVersion === CURRENT_SCHEMA_VERSION ? null : initialVersion
    };
}
