import test from 'node:test';
import assert from 'node:assert/strict';

import { Runtime, State, resetState } from '../../js/state.js';
import * as Submission from '../../js/logic/submission-engine.js';

const tiers = [
    {
        id: 'tier_1', name: 'Workshop', baseCost: 100, kFactor: 100,
        baseRate: 0.5, maxBaseChance: 0.9, rebuttalSwing: 0.1,
        questionConfig: { total: 1, funny: 1, tech: 0 },
        rewardCitations: 50, rewardMultiplier: 2, targets: ['Venue A']
    },
    {
        id: 'tier_3', name: 'Top', baseCost: 1000, kFactor: 1000,
        baseRate: 0.1, maxBaseChance: 0.75, rebuttalSwing: 0.15,
        questionConfig: { total: 3, funny: 2, tech: 1 },
        rewardCitations: 15000, rewardMultiplier: 20,
        targets: ['NeurIPS', 'ICML']
    }
];

const funnyQuestions = [
    { q: 'F1', options: ['A', 'B'], correct: 0, comment: 'ok' },
    { q: 'F2', options: ['A', 'B'], correct: 1, comment: 'ok' },
    { q: 'F3', options: ['A', 'B'], correct: 0, comment: 'ok' }
];

const technicalQuestions = [
    { q: 'T1', options: ['A', 'B'], correct: 1, comment: 'ok' },
    { q: 'T2', options: ['A', 'B'], correct: 0, comment: 'ok' }
];

function setup() {
    resetState();
    Runtime.submissionConfig = {
        tiers,
        questionPool: { funny: funnyQuestions, technical: technicalQuestions },
        flavorText: { accepted: [], rejected: [] }
    };
    Runtime.lastGeneratedTitle = 'Persisted Title';
    State.rp = 100000;
    State.totalRp = 100000;
    Submission.setRandomSource(() => 0.25);
    Submission.clearSession();
}

test('starting is atomic, persistent and cannot charge twice', () => {
    setup();
    assert.equal(Submission.prepareTier('tier_1'), true);
    Submission.setInvestment(50);
    const before = State.rp;
    const session = Submission.startSubmission();

    assert.ok(session);
    assert.equal(State.rp, before - 150);
    assert.equal(State.papersSubmitted, 1);
    assert.equal(State.stats.total_papers, 1);
    assert.equal(session.paperTitle, 'Persisted Title');
    assert.equal(Submission.startSubmission(), null);
    assert.equal(State.rp, before - 150);

    State.submission = JSON.parse(JSON.stringify(State.submission));
    assert.equal(Submission.getSession().id, session.id);
    assert.equal(Submission.getSession().resolutionRoll, session.resolutionRoll);
});

test('prepared draft title survives runtime changes and refresh-style normalization', () => {
    setup();
    Submission.prepareTier('tier_1');
    Runtime.lastGeneratedTitle = 'A Different Runtime Title';
    State.submission = JSON.parse(JSON.stringify(State.submission));
    const session = Submission.startSubmission();
    assert.equal(session.paperTitle, 'Persisted Title');
});

test('question selection honors the light 1/2/3 count contract', () => {
    setup();
    Submission.prepareTier('tier_3');
    const session = Submission.startSubmission();
    assert.equal(session.questions.length, 3);
});

test('answers update one canonical chance and acceptance rewards once', () => {
    setup();
    Submission.prepareTier('tier_1');
    const session = Submission.startSubmission();
    const question = Submission.getCurrentQuestion();
    const answer = Submission.answerCurrentQuestion(question.correct);

    assert.equal(answer.correct, true);
    assert.ok(answer.newChance > session.initialChance);
    session.resolutionRoll = 0;
    const result = Submission.advanceSubmission();

    assert.equal(result.success, true);
    assert.equal(result.rewards.citations, 50);
    assert.equal(result.rewards.rp, 10);
    assert.equal(State.acceptedPapers.length, 1);
    assert.equal(State.acceptedPapers[0].title, 'Persisted Title');

    const citations = State.citations;
    assert.equal(Submission.finalizeSubmission(), result);
    assert.equal(State.citations, citations);
    assert.equal(State.acceptedPapers.length, 1);
});

test('rejection increments attempts and applies Linus refund in the same engine', () => {
    setup();
    State.ownedConnections.push('linus');
    Submission.prepareTier('tier_1');
    const session = Submission.startSubmission();
    const afterCharge = State.rp;
    const question = Submission.getCurrentQuestion();
    Submission.answerCurrentQuestion(question.correct);
    session.resolutionRoll = 0.999;
    session.currentChance = 0.01;

    const result = Submission.advanceSubmission();
    assert.equal(result.success, false);
    assert.equal(result.rewards.refund, 30);
    assert.equal(State.rp, afterCharge + 30);
    assert.equal(State.papersSubmitted, 1);
    assert.equal(State.stats.total_papers, 1);
    assert.equal(State.acceptedPapers.length, 0);
});

test('a paid rebuttal cannot be cleared and investment without pending fails', () => {
    setup();
    assert.equal(Submission.setInvestment(10), null);
    Submission.prepareTier('tier_1');
    Submission.startSubmission();
    assert.equal(Submission.clearSession(), false);
    assert.equal(Submission.getStatus(), Submission.SubmissionStatus.REBUTTAL);
});

test('invalid answer indices never become option zero', () => {
    setup();
    Submission.prepareTier('tier_1');
    Submission.startSubmission();
    assert.equal(Submission.answerCurrentQuestion(-1), null);
    assert.equal(Submission.answerCurrentQuestion(Number.NaN), null);
    assert.equal(Submission.getStatus(), Submission.SubmissionStatus.REBUTTAL);
});

test('malformed persisted sessions recover without throwing into an idle state', () => {
    setup();
    State.submission = {
        status: 'rebuttal',
        pending: null,
        session: { tierId: 'tier_1', questions: null },
        revisionBonuses: {}
    };
    assert.doesNotThrow(() => Submission.ensureSubmissionState());
    assert.equal(Submission.getStatus(), Submission.SubmissionStatus.IDLE);
    assert.equal(State.submission.revisionBonuses.corruptSessionRecovered, true);
});

test('malformed resolved results cannot crash result rendering paths', () => {
    setup();
    Submission.prepareTier('tier_1');
    const session = Submission.startSubmission();
    session.status = Submission.SubmissionStatus.RESOLVED;
    session.result = {};
    State.submission.status = Submission.SubmissionStatus.RESOLVED;

    const normalized = Submission.ensureSubmissionState();
    assert.equal(normalized.session.result.recoveredFromMalformedResult, true);
    assert.equal(normalized.status, Submission.SubmissionStatus.RESOLVED);
    const papers = State.acceptedPapers.length;
    const citations = State.citations;
    assert.equal(Submission.advanceSubmission(), null);
    assert.equal(Submission.finalizeSubmission(), normalized.session.result);
    assert.equal(State.acceptedPapers.length, papers);
    assert.equal(State.citations, citations);
});

test('resolved proof must be cleared explicitly before preparing another tier', () => {
    setup();
    Submission.prepareTier('tier_1');
    const session = Submission.startSubmission();
    Submission.answerCurrentQuestion(Submission.getCurrentQuestion().correct);
    session.resolutionRoll = 0;
    Submission.advanceSubmission();
    assert.equal(Submission.prepareTier('tier_1'), false);
    assert.equal(Submission.getStatus(), Submission.SubmissionStatus.RESOLVED);
});

test('paid session rewards use its snapshot instead of later config edits', () => {
    setup();
    Submission.prepareTier('tier_1');
    const session = Submission.startSubmission();
    Submission.answerCurrentQuestion(Submission.getCurrentQuestion().correct);
    session.resolutionRoll = 0;
    tiers[0].rewardCitations = 999;
    const result = Submission.advanceSubmission();
    tiers[0].rewardCitations = 50;

    assert.equal(result.rewards.citations, 50);
    assert.equal(result.rewards.rp, 10);
});
