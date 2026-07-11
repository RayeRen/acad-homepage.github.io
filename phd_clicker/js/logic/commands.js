import * as Core from './core.js';
import { State } from '../state.js';
import * as Buildings from './buildings.js';
import * as Submission from './submission-engine.js';
import * as Prestige from './prestige.js';
import * as Advisor from './advisor.js';
import * as Connections from './connections.js';
import * as NarrativeLog from './narrative-log.js';

export const CommandType = Object.freeze({
    RESEARCH_CLICK: 'research.click',
    BUILDING_BUY: 'building.buy',
    BUILDING_BUY_MULTIPLE: 'building.buyMultiple',
    UPGRADE_BUY: 'upgrade.buy',
    CLICK_UPGRADE_BUY: 'clickUpgrade.buy',
    RESEARCH_TOPICS_SET: 'research.topics.set',
    INTRO_COMPLETE: 'intro.complete',
    ADVISOR_SELECT: 'advisor.select',
    CONNECTION_BUY: 'connection.buy',
    RP_GRANT: 'rp.grant',
    SUBMISSION_PREPARE: 'submission.prepare',
    SUBMISSION_INVEST: 'submission.invest',
    SUBMISSION_DRAFT_TITLE_SET: 'submission.draftTitle.set',
    SUBMISSION_START: 'submission.start',
    SUBMISSION_ANSWER: 'submission.answer',
    SUBMISSION_ADVANCE: 'submission.advance',
    SUBMISSION_CLEAR: 'submission.clear',
    PRESTIGE_EXECUTE: 'prestige.execute'
});

const listeners = new Set();

const handlers = new Map([
    [CommandType.RESEARCH_CLICK, () => Core.manualClick()],
    [CommandType.BUILDING_BUY, payload => Buildings.buyBuilding(payload.id)],
    [CommandType.BUILDING_BUY_MULTIPLE, payload => {
        const bought = Buildings.buyMultipleBuildings(payload.id, payload.count);
        return bought > 0 ? bought : false;
    }],
    [CommandType.UPGRADE_BUY, payload => Buildings.buyUpgrade(payload.id)],
    [CommandType.CLICK_UPGRADE_BUY, payload => Buildings.buyClickUpgrade(payload.id)],
    [CommandType.RESEARCH_TOPICS_SET, payload => Core.setResearchTopics(payload.topics)],
    [CommandType.INTRO_COMPLETE, () => Core.completeIntro()],
    [CommandType.ADVISOR_SELECT, payload => Advisor.selectAdvisor(payload.advisor)],
    [CommandType.CONNECTION_BUY, payload => Connections.buyConnection(payload.id)],
    [CommandType.RP_GRANT, payload => Core.grantResearchPoints(payload.amount)],
    [CommandType.SUBMISSION_PREPARE, payload => Submission.prepareTier(payload.tierId)],
    [CommandType.SUBMISSION_INVEST, payload => Submission.setInvestment(payload.amount)],
    [CommandType.SUBMISSION_DRAFT_TITLE_SET, payload => Submission.setDraftTitle(payload.title)],
    [CommandType.SUBMISSION_START, () => Submission.startSubmission()],
    [CommandType.SUBMISSION_ANSWER, payload => Submission.answerCurrentQuestion(payload.optionIndex)],
    [CommandType.SUBMISSION_ADVANCE, () => Submission.advanceSubmission()],
    [CommandType.SUBMISSION_CLEAR, () => Submission.clearSession()],
    [CommandType.PRESTIGE_EXECUTE, payload => Prestige.executePrestige(payload)]
]);

function commandSucceeded(result) {
    if (result && typeof result === 'object' && Object.hasOwn(result, 'ok')) {
        return result.ok !== false;
    }
    return result !== false && result !== null && result !== undefined;
}

function emit(event) {
    listeners.forEach(listener => {
        try {
            listener(event);
        } catch (error) {
            console.error('[CommandBus] Event listener failed:', error);
        }
    });
}

function recordNarrativeEvent(event) {
    try {
        if (event.command === CommandType.UPGRADE_BUY) {
            NarrativeLog.append({
                type: 'upgrade',
                messageKey: 'log.upgrade.purchased',
                context: { id: event.payload.id },
                source: event.source,
                dedupeKey: `upgrade:${event.payload.id}`
            });
        } else if (event.command === CommandType.SUBMISSION_START) {
            NarrativeLog.append({
                type: 'submission',
                messageKey: 'log.submission.started',
                context: {
                    id: event.result?.id,
                    venue: event.result?.targetVenue,
                    questions: event.result?.questions?.length || 0
                },
                source: event.source,
                dedupeKey: event.result?.id ? `submission:start:${event.result.id}` : null
            });
        } else if (
            event.command === CommandType.SUBMISSION_ADVANCE &&
            typeof event.result?.success === 'boolean'
        ) {
            const session = Submission.getSession();
            NarrativeLog.append({
                type: 'submission',
                messageKey: event.result.success
                    ? 'log.submission.accepted'
                    : 'log.submission.rejected',
                context: {
                    id: session?.id,
                    venue: event.result.venue,
                    chance: event.result.chance,
                    correct: event.result.correct,
                    questions: event.result.totalQuestions
                },
                importance: event.result.success ? 'high' : 'normal',
                source: event.source,
                dedupeKey: session?.id ? `submission:result:${session.id}` : null
            });
        } else if (event.command === CommandType.PRESTIGE_EXECUTE) {
            NarrativeLog.append({
                type: 'prestige',
                messageKey: 'log.prestige.completed',
                context: { generation: event.result?.newState?.generation },
                importance: 'high',
                source: event.source,
                dedupeKey: `prestige:generation:${event.result?.newState?.generation}`
            });
        } else if (event.command === CommandType.ADVISOR_SELECT) {
            NarrativeLog.append({
                type: 'advisor',
                messageKey: 'log.advisor.selected',
                context: { name: event.result?.advisor?.name },
                source: event.source,
                dedupeKey: `advisor:generation:${State.generation}`
            });
        } else if (event.command === CommandType.CONNECTION_BUY) {
            NarrativeLog.append({
                type: 'connection',
                messageKey: 'log.connection.purchased',
                context: { id: event.payload.id },
                importance: 'high',
                source: event.source,
                dedupeKey: `connection:${event.payload.id}`
            });
        }
    } catch (error) {
        // Logging is observational; it must never turn a successful mutation
        // into a reported command failure.
        console.warn('[NarrativeLog] Failed to record command event:', error);
    }
}

/**
 * Execute one domain command. Adapters never receive mutable implementation
 * details; they receive a standard outcome and the domain result.
 */
export function dispatch(type, payload = {}, metadata = {}) {
    const handler = handlers.get(type);
    if (!handler) {
        return {
            ok: false,
            result: null,
            error: `Unknown command: ${type}`,
            event: null
        };
    }

    try {
        const result = handler(payload || {});
        const ok = commandSucceeded(result);
        const event = ok ? {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: `${type}.completed`,
            command: type,
            actor: metadata.actor || 'player',
            source: metadata.source || 'unknown',
            timestamp: Date.now(),
            payload: payload || {},
            result
        } : null;

        if (event) {
            recordNarrativeEvent(event);
            emit(event);
        }
        return { ok, result, error: null, event };
    } catch (error) {
        console.error(`[CommandBus] ${type} failed:`, error);
        return { ok: false, result: null, error, event: null };
    }
}

export function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('Command listener must be a function');
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function clearSubscribers() {
    listeners.clear();
}
