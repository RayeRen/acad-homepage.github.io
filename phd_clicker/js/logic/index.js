/**
 * Logic Module Index
 * Re-exports all logic module functions for convenient importing.
 */

// Core calculation logic
export * from './core.js';

// Building purchase logic
export * from './buildings.js';

// Canonical paper submission engine shared by all adapters.
export * as Submission from './submission-engine.js';

// Prestige/rebirth logic - export as namespace for UI compatibility
export * as Prestige from './prestige.js';

// Connection system logic - export as namespace for UI compatibility
export * as Connections from './connections.js';

// Advisor system logic - export as namespace
export * as Advisor from './advisor.js';

// Shared command adapter used by regular UI, terminal and developer tools.
export * as Commands from './commands.js';
export * as NarrativeLog from './narrative-log.js';
