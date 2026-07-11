/**
 * Canonical, persistent paper-submission rules.
 *
 * UI and terminal adapters must delegate here. A paid submission, its selected
 * questions and its random resolution roll all live in GameState, so closing
 * the modal or refreshing cannot charge twice or reroll the result.
 */

import { Constants } from '../constants.js';
import { State, Runtime } from '../state.js';
import { hasConnection } from './core.js';
import * as Advisor from './advisor.js';

export const SubmissionStatus = Object.freeze({
    IDLE: 'idle',
    PREPARED: 'prepared',
    REBUTTAL: 'rebuttal',
    ANSWERED: 'answered',
    RESOLVED: 'resolved'
});

const VALID_STATUSES = new Set(Object.values(SubmissionStatus));
let randomSource = Math.random;

function createEmptyState() {
    return {
        status: SubmissionStatus.IDLE,
        pending: null,
        session: null,
        revisionBonuses: {}
    };
}

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizePending(pending) {
    if (!pending || typeof pending !== 'object' || typeof pending.tierId !== 'string') {
        return null;
    }
    return {
        tierId: pending.tierId,
        baseCost: Math.max(0, Math.floor(finiteNumber(pending.baseCost))),
        invested: Math.max(0, Math.floor(finiteNumber(pending.invested))),
        paperTitle: String(pending.paperTitle || 'Untitled Paper').slice(0, 500)
    };
}

function normalizeSession(session) {
    if (!session || typeof session !== 'object') return null;
    const questions = Array.isArray(session.questions)
        ? session.questions.filter(question =>
            question && typeof question === 'object' &&
            Array.isArray(question.options || question.answers) &&
            (question.options || question.answers).length > 0
        )
        : [];
    if (!questions.length || typeof session.tierId !== 'string') return null;

    const index = Math.min(
        questions.length - 1,
        Math.max(0, Math.floor(finiteNumber(session.index)))
    );
    const resultCandidate = session.result && typeof session.result === 'object' &&
        typeof session.result.success === 'boolean'
        ? session.result
        : null;
    const normalizedResult = resultCandidate
        ? Object.assign(resultCandidate, {
            success: session.result.success,
            roll: Math.max(0, Math.min(1, finiteNumber(session.result.roll, 1))),
            chance: Math.max(0.01, Math.min(0.99, finiteNumber(session.result.chance, 0.01))),
            venue: String(session.result.venue || session.targetVenue || ''),
            rewards: {
                citations: Math.max(0, finiteNumber(session.result.rewards?.citations)),
                rp: Math.max(0, finiteNumber(session.result.rewards?.rp)),
                refund: Math.max(0, finiteNumber(session.result.rewards?.refund)),
                venue: String(session.result.rewards?.venue || session.result.venue || '')
            },
            correct: Math.max(0, Math.floor(finiteNumber(session.result.correct))),
            totalQuestions: Math.max(1, Math.floor(finiteNumber(
                session.result.totalQuestions,
                questions.length
            ))),
            initialChance: Math.max(0.01, Math.min(
                0.99,
                finiteNumber(
                    session.result.initialChance,
                    finiteNumber(session.initialChance, 0.01)
                )
            ))
        })
        : null;
    let status = VALID_STATUSES.has(session.status)
        ? session.status
        : SubmissionStatus.REBUTTAL;
    const rewardApplied = session.rewardApplied === true ||
        status === SubmissionStatus.RESOLVED || Boolean(normalizedResult);
    const settledRewards = {
        citations: Math.max(0, finiteNumber(
            session.settledRewards?.citations,
            normalizedResult?.rewards?.citations || 0
        )),
        rp: Math.max(0, finiteNumber(
            session.settledRewards?.rp,
            normalizedResult?.rewards?.rp || 0
        )),
        refund: Math.max(0, finiteNumber(
            session.settledRewards?.refund,
            normalizedResult?.rewards?.refund || 0
        )),
        venue: String(
            session.settledRewards?.venue || normalizedResult?.venue || session.targetVenue || ''
        )
    };
    const safeResult = normalizedResult || (rewardApplied ? {
        success: typeof session.settlementSuccess === 'boolean'
            ? session.settlementSuccess
            : false,
        roll: Math.max(0, Math.min(1, finiteNumber(session.resolutionRoll, 1))),
        chance: Math.max(0.01, Math.min(0.99, finiteNumber(session.currentChance, 0.01))),
        venue: String(session.targetVenue || settledRewards.venue || ''),
        rewards: settledRewards,
        correct: Math.max(0, Math.floor(finiteNumber(session.correct))),
        totalQuestions: questions.length,
        initialChance: Math.max(0.01, Math.min(0.99, finiteNumber(session.initialChance, 0.01))),
        completedAt: Math.max(0, finiteNumber(session.settledAt)),
        recoveredFromMalformedResult: true
    } : null);
    if (rewardApplied) {
        status = SubmissionStatus.RESOLVED;
    }
    return Object.assign(session, {
        id: String(session.id || `legacy-submission-${finiteNumber(session.startedAt, 0)}`),
        status,
        tierId: session.tierId,
        paperTitle: String(session.paperTitle || 'Untitled Paper').slice(0, 500),
        targetVenue: String(session.targetVenue || ''),
        questions,
        index,
        answers: Array.isArray(session.answers) ? session.answers : [],
        currentAnswer: session.currentAnswer && typeof session.currentAnswer === 'object'
            ? session.currentAnswer
            : null,
        correct: Math.max(0, Math.floor(finiteNumber(session.correct))),
        initialChance: Math.max(0.01, Math.min(0.99, finiteNumber(session.initialChance, 0.01))),
        currentChance: Math.max(0.01, Math.min(0.99, finiteNumber(session.currentChance, 0.01))),
        invested: Math.max(0, Math.floor(finiteNumber(session.invested))),
        baseCost: Math.max(0, Math.floor(finiteNumber(session.baseCost))),
        totalCost: Math.max(0, Math.floor(finiteNumber(session.totalCost))),
        seed: Math.max(0, Math.floor(finiteNumber(session.seed))) >>> 0,
        resolutionRoll: Math.max(0, Math.min(1, finiteNumber(session.resolutionRoll, 1))),
        rewardApplied,
        settlementSuccess: typeof session.settlementSuccess === 'boolean'
            ? session.settlementSuccess
            : safeResult?.success ?? null,
        settledAt: Math.max(0, finiteNumber(session.settledAt, safeResult?.completedAt || 0)),
        settledRewards,
        result: safeResult
    });
}

export function ensureSubmissionState() {
    const candidate = State.submission && typeof State.submission === 'object'
        ? State.submission
        : {};
    const state = {
        ...createEmptyState(),
        ...candidate,
        revisionBonuses: {
            ...(candidate.revisionBonuses || {})
        }
    };

    if (!VALID_STATUSES.has(state.status)) state.status = SubmissionStatus.IDLE;
    state.pending = normalizePending(state.pending);
    state.session = normalizeSession(state.session);

    if (state.session) {
        if (state.session.result) {
            state.session.status = SubmissionStatus.RESOLVED;
            state.status = SubmissionStatus.RESOLVED;
        } else if ([SubmissionStatus.REBUTTAL, SubmissionStatus.ANSWERED].includes(
            state.session.status
        )) {
            state.status = state.session.status;
            state.pending = null;
        }
    } else if (state.pending) {
        state.status = SubmissionStatus.PREPARED;
    } else {
        if ([SubmissionStatus.REBUTTAL, SubmissionStatus.ANSWERED].includes(state.status)) {
            state.revisionBonuses.corruptSessionRecovered = true;
        }
        state.status = SubmissionStatus.IDLE;
    }
    State.submission = state;
    Runtime.submissionSession = state.session || null;
    return state;
}

/** Deterministic test hook. */
export function setRandomSource(source = Math.random) {
    randomSource = typeof source === 'function' ? source : Math.random;
}

function createSeed() {
    return Math.floor(randomSource() * 0x100000000) >>> 0;
}

function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value += 0x6D2B79F5;
        let mixed = value;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
}

function findTier(tierId) {
    return (Runtime.submissionConfig.tiers || []).find(tier => tier.id === tierId) || null;
}

function sessionTier(session) {
    // A paid submission is a closed contract. Live locale/config reloads may
    // change future tiers, but must never change this session's odds/rewards.
    return session?.tierSnapshot || findTier(session?.tierId) || null;
}

function snapshotTier(tier) {
    return {
        ...tier,
        targets: Array.isArray(tier.targets) ? [...tier.targets] : [],
        questionConfig: tier.questionConfig && typeof tier.questionConfig === 'object'
            ? { ...tier.questionConfig }
            : null
    };
}

function takeRandom(items, rng) {
    if (!items.length) return null;
    return items.splice(Math.floor(rng() * items.length), 1)[0] || null;
}

function selectQuestions(tier, rng) {
    const config = tier.questionConfig || { total: 1, funny: 1, tech: 0 };
    const pool = Runtime.submissionConfig.questionPool || {};
    const funny = (pool.funny || []).map(question => ({ ...question }));
    const technical = (pool.technical || []).map(question => ({ ...question }));
    const selected = [];

    const take = (items, count) => {
        for (let index = 0; index < count && items.length; index++) {
            const question = takeRandom(items, rng);
            if (question) selected.push(question);
        }
    };

    take(funny, Math.max(0, Number(config.funny) || 0));
    take(technical, Math.max(0, Number(config.tech) || 0));

    const remaining = [...funny, ...technical];
    const extraQuestions = Math.max(
        0,
        Math.round(Advisor.getAdvisorModifiers().rebuttalQuestionAdditive || 0)
    );
    const targetCount = Math.max(1, (Number(config.total) || 1) + extraQuestions);
    while (selected.length < targetCount && remaining.length) {
        const question = takeRandom(remaining, rng);
        if (question) selected.push(question);
    }
    return selected;
}

export function getInflationMult() {
    return Math.pow(Constants.INFLATION_BASE, Math.max(0, State.papersSubmitted || 0));
}

export function getCurrentBaseCost(tier) {
    if (!tier) return Infinity;
    const modifiers = Advisor.getAdvisorModifiers();
    const inflated = Math.floor((Number(tier.baseCost) || 1000) * getInflationMult());
    return Math.max(0, Math.floor(inflated * modifiers.submissionCostMultiplier));
}

export function getCurrentK(tier) {
    if (!tier) return Infinity;
    return Math.max(1, Math.floor((Number(tier.kFactor) || 1000) * getInflationMult()));
}

export function calculateChance(tier, investedRP = 0) {
    if (!tier) return 0;
    const modifiers = Advisor.getAdvisorModifiers();
    const investment = Math.max(0, Number(investedRP) || 0);
    const k = getCurrentK(tier);
    const base = Math.max(0, Number(tier.baseRate) || 0);
    const maximum = Math.max(base, Number(tier.maxBaseChance) || base);
    let chance = base + ((maximum - base) * investment / (investment + k));

    if (hasConnection('ilya') && tier.id === 'tier_3') chance += 0.10;
    if (tier.id === 'tier_3') chance += modifiers.tier3SubmissionRateAdditive;
    chance += modifiers.submissionRateAdditive;
    chance = Math.max(chance, modifiers.submissionRateFloor || 0);
    return Math.max(0.01, Math.min(chance, 0.99));
}

export function openModal() {
    return ensureSubmissionState();
}

/** Closing a view never abandons a paid submission. */
export function closeModal() {
    return ensureSubmissionState();
}

export function canAffordTier(tier) {
    return State.rp >= getCurrentBaseCost(tier);
}

export function prepareTier(tierId) {
    const state = ensureSubmissionState();
    if (![SubmissionStatus.IDLE, SubmissionStatus.PREPARED].includes(state.status)) {
        return false;
    }

    const tier = findTier(tierId);
    if (!tier) return false;
    const baseCost = getCurrentBaseCost(tier);
    if (State.rp < baseCost) return false;

    state.status = SubmissionStatus.PREPARED;
    state.pending = {
        tierId,
        baseCost,
        invested: 0,
        paperTitle: String(Runtime.lastGeneratedTitle || 'Untitled Paper').slice(0, 500)
    };
    state.session = null;
    Runtime.submissionSession = null;
    return true;
}

export function getPending() {
    return ensureSubmissionState().pending;
}

export function setPending(value) {
    const state = ensureSubmissionState();
    state.pending = value && typeof value === 'object' ? { ...value } : null;
    state.status = state.pending ? SubmissionStatus.PREPARED : SubmissionStatus.IDLE;
    return state.pending;
}

export function getMaxInvestment(pendingOverride = null) {
    const pending = pendingOverride || getPending();
    if (!pending) return 0;
    const tier = findTier(pending.tierId);
    if (!tier) return 0;
    const effectiveMaximum = Math.floor(19 * getCurrentK(tier));
    const available = Math.max(0, Math.floor(State.rp - pending.baseCost));
    return Math.min(available, effectiveMaximum);
}

export function setInvestment(amount) {
    const pending = getPending();
    if (!pending) return null;
    const numeric = Number(amount);
    pending.invested = Math.floor(Math.max(
        0,
        Math.min(Number.isFinite(numeric) ? numeric : 0, getMaxInvestment(pending))
    ));
    return pending.invested;
}

export function setDraftTitle(title) {
    const value = String(title || 'Untitled Paper').slice(0, 500);
    Runtime.lastGeneratedTitle = value;
    const pending = getPending();
    if (pending) pending.paperTitle = value;
    return value;
}

export function startSubmission() {
    const state = ensureSubmissionState();
    const pending = state.pending;
    if (state.status !== SubmissionStatus.PREPARED || !pending) return null;

    const tier = findTier(pending.tierId);
    if (!tier) return null;
    const totalCost = pending.baseCost + pending.invested;
    if (!Number.isFinite(totalCost) || totalCost < 0 || State.rp < totalCost) return null;

    const seed = createSeed();
    const rng = seededRandom(seed);
    const questions = selectQuestions(tier, rng);
    if (!questions.length) return null;
    const targets = Array.isArray(tier.targets) && tier.targets.length ? tier.targets : [tier.name];

    const session = {
        id: `submission-${Date.now()}-${seed.toString(16)}`,
        status: SubmissionStatus.REBUTTAL,
        tierId: tier.id,
        tierSnapshot: snapshotTier(tier),
        paperTitle: String(pending.paperTitle || Runtime.lastGeneratedTitle || 'Untitled Paper'),
        targetVenue: targets[Math.floor(rng() * targets.length)] || tier.name,
        questions,
        index: 0,
        answers: [],
        currentAnswer: null,
        correct: 0,
        initialChance: calculateChance(tier, pending.invested),
        currentChance: calculateChance(tier, pending.invested),
        invested: pending.invested,
        baseCost: pending.baseCost,
        totalCost,
        seed,
        resolutionRoll: rng(),
        startedAt: Date.now(),
        rewardApplied: false,
        settlementSuccess: null,
        settledAt: null,
        settledRewards: null,
        result: null
    };

    // Mutate only after every part of the session was created successfully.
    State.rp -= totalCost;
    State.papersSubmitted = Math.max(0, State.papersSubmitted || 0) + 1;
    State.stats.total_papers = Math.max(0, State.stats.total_papers || 0) + 1;
    state.status = SubmissionStatus.REBUTTAL;
    state.pending = null;
    state.session = session;
    Runtime.submissionSession = session;
    return session;
}

export function getSession() {
    const state = ensureSubmissionState();
    Runtime.submissionSession = state.session || null;
    return state.session;
}

export function getCurrentQuestion() {
    const session = getSession();
    return session?.questions?.[session.index] || null;
}

export function answerCurrentQuestion(optionIndex) {
    const state = ensureSubmissionState();
    const session = state.session;
    if (!session || session.status !== SubmissionStatus.REBUTTAL || session.currentAnswer) {
        return null;
    }

    const question = session.questions[session.index];
    const tier = sessionTier(session);
    if (!question || !tier) return null;

    const selected = Number(optionIndex);
    const options = question.options || question.answers || [];
    if (!Number.isInteger(selected) || selected < 0 || selected >= options.length) {
        return null;
    }
    const correctIndex = typeof question.correct === 'number'
        ? question.correct
        : question.correctIndex;
    const correct = selected === correctIndex;
    const modifiers = Advisor.getAdvisorModifiers();
    const baseSwing = (Number(tier.rebuttalSwing) || 0) / Math.max(1, session.questions.length);
    const connectionMultiplier = !correct && hasConnection('jinghui') ? 0.5 : 1;
    const delta = correct
        ? baseSwing * modifiers.rebuttalBonusMultiplier
        : -baseSwing * modifiers.rebuttalPenaltyMultiplier * connectionMultiplier;
    const floor = hasConnection('jinghui') ? 0.20 : 0.01;

    session.currentChance = Math.min(0.99, Math.max(floor, session.currentChance + delta));
    session.currentAnswer = {
        questionIndex: session.index,
        optionIndex: selected,
        correctIndex,
        correct,
        delta
    };
    session.answers.push(session.currentAnswer);
    if (correct) session.correct += 1;
    session.status = SubmissionStatus.ANSWERED;
    state.status = SubmissionStatus.ANSWERED;

    return {
        ...session.currentAnswer,
        newChance: session.currentChance,
        isLast: session.index >= session.questions.length - 1
    };
}

export function advanceSubmission() {
    const state = ensureSubmissionState();
    const session = state.session;
    if (!session || session.status !== SubmissionStatus.ANSWERED) return null;

    if (session.index >= session.questions.length - 1) return finalizeSubmission();

    session.index += 1;
    session.currentAnswer = null;
    session.status = SubmissionStatus.REBUTTAL;
    state.status = SubmissionStatus.REBUTTAL;
    return session;
}

export function finalizeSubmission() {
    const state = ensureSubmissionState();
    const session = state.session;
    if (!session) return null;
    if (session.result || session.rewardApplied) return session.result;
    if (session.status !== SubmissionStatus.ANSWERED ||
        session.index < session.questions.length - 1) return null;

    const tier = sessionTier(session);
    if (!tier) return null;
    const success = session.resolutionRoll < session.currentChance;
    const citationReward = Math.max(0, Number(tier.rewardCitations) || 0);
    const rewards = {
        citations: success ? Math.floor(citationReward) : 0,
        rp: success
            ? Math.round(citationReward * 0.1 * (Number(tier.rewardMultiplier) || 1))
            : 0,
        refund: 0,
        venue: session.targetVenue
    };

    if (success) {
        State.acceptedPapers.push({
            title: session.paperTitle,
            venue: session.targetVenue,
            date: Date.now()
        });
        State.citations += rewards.citations;
        State.rp += rewards.rp;
        State.totalRp += rewards.rp;
    } else if (hasConnection('linus') && session.totalCost) {
        rewards.refund = Math.floor(session.totalCost * 0.3);
        State.rp += rewards.refund;
    }

    session.status = SubmissionStatus.RESOLVED;
    session.rewardApplied = true;
    session.settlementSuccess = success;
    session.settledAt = Date.now();
    session.settledRewards = { ...rewards };
    session.result = {
        success,
        roll: session.resolutionRoll,
        chance: session.currentChance,
        venue: session.targetVenue,
        rewards,
        correct: session.correct,
        totalQuestions: session.questions.length,
        initialChance: session.initialChance,
        completedAt: session.settledAt
    };
    state.status = SubmissionStatus.RESOLVED;
    return session.result;
}

export function getStatus() {
    return ensureSubmissionState().status;
}

export function clearSession() {
    const current = ensureSubmissionState();
    if ([SubmissionStatus.REBUTTAL, SubmissionStatus.ANSWERED].includes(current.status)) {
        return false;
    }
    State.submission = createEmptyState();
    Runtime.submissionSession = null;
    return true;
}
