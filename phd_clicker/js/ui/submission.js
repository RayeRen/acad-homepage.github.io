/**
 * Submission Modal UI Module
 * Handles the paper submission flow including tier selection,
 * investment, rebuttal questions, and result display.
 * Extracted from Game.UI.Submission in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';
import { renderPublications } from './render.js';
import { t, formatNumber, formatTemplate, pickRandom } from '../data.js';

/**
 * Pending submission data (tier, baseCost, invested).
 */
let pending = null;

/**
 * Result typing animation timer.
 */
let resultTypingTimer = null;

/**
 * Show a specific stage of the submission flow.
 * @param {string} stageName - 'tier', 'detail', 'question', or 'result'
 */
export function showStage(stageName) {
    ['tierStage', 'tierDetailView', 'questionStage', 'resultStage', 'resultSettlement'].forEach(k => {
        if (DOM[k]) DOM[k].classList.add('hidden');
    });

    if (stageName === 'tier' && DOM.tierStage) DOM.tierStage.classList.remove('hidden');
    if (stageName === 'detail' && DOM.tierDetailView) DOM.tierDetailView.classList.remove('hidden');
    if (stageName === 'question' && DOM.questionStage) DOM.questionStage.classList.remove('hidden');
    if (stageName === 'result' && DOM.resultStage) DOM.resultStage.classList.remove('hidden');
}

/**
 * Render the tier selection list.
 * @param {Object} Logic - Logic module for cost calculations
 */
export function renderTiers(Logic) {
    const list = DOM.tierList;
    if (!list) return;
    list.innerHTML = '';

    (Runtime.submissionConfig.tiers || []).forEach(tier => {
        const cost = Logic.Submission.getCurrentBaseCost(tier);
        const canAfford = State.rp >= cost;

        const div = document.createElement('div');
        div.innerHTML = `
        <div class="rounded-xl border ${canAfford ? 'border-indigo-500/60 bg-slate-800/60' : 'border-slate-800 bg-slate-900/40'} p-4 shadow relative overflow-hidden transition-all hover:bg-slate-800/80">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <div class="text-sm font-bold text-white">${tier.name}</div>
              <div class="text-xs text-slate-400 leading-snug">${tier.description || ''}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400" data-i18n="costLabel">${t('costLabel')}</div>
              <div class="text-sm font-mono font-semibold ${canAfford ? 'text-indigo-200' : 'text-slate-500'}">${formatNumber(cost)} RP</div>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>${Math.round(tier.baseRate * 100)}% -> ${Math.round(tier.maxBaseChance * 100)}%</span>
            <span>+/-${Math.round(tier.rebuttalSwing * 100)}%</span>
          </div>
          <button data-tier-id="${tier.id}" class="w-full mt-1 py-2 rounded-lg text-sm font-bold border transition-colors ${canAfford ? 'border-indigo-500 text-indigo-100 bg-indigo-900/40 hover:bg-indigo-800/60' : 'border-slate-800 text-slate-500 bg-slate-800/40 cursor-not-allowed'}" ${canAfford ? '' : 'disabled'}>${t('submitVenue')}</button>
        </div>`;
        list.appendChild(div.firstElementChild);
    });
}

/**
 * Open the detail view for a specific tier.
 * @param {string} tierId - The tier ID to open
 * @param {Object} Logic - Logic module for cost calculations
 */
export function openDetail(tierId, Logic) {
    const tier = (Runtime.submissionConfig.tiers || []).find(t => t.id === tierId);
    if (!tier) return;

    let domainPending = Logic.Submission.getPending();
    if (!domainPending || domainPending.tierId !== tierId) {
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_PREPARE,
            { tierId },
            { actor: 'player', source: 'ui' }
        );
        if (!outcome.ok) return;
        domainPending = Logic.Submission.getPending();
    }
    const baseCost = domainPending.baseCost;
    pending = { ...domainPending, tier };

    if (DOM.detailTitle) DOM.detailTitle.textContent = tier.name;
    if (DOM.detailBaseCost) DOM.detailBaseCost.textContent = `${formatNumber(baseCost)} RP`;
    if (DOM.detailWarning) DOM.detailWarning.classList.toggle('hidden', tier.rebuttalSwing < 0.15);

    // Setup Slider
    // Limit max investment to effective max (where 95% of bonus is achieved)
    // Formula: bonus = (max - base) * (invested / (invested + K))
    // At invested = 19*K, bonus reaches 95% of maximum
    const K = Logic.Submission.getCurrentK(tier);
    const effectiveMax = Math.floor(19 * K); // 95% of max bonus
    const availableRP = Math.floor(State.rp - baseCost);
    const maxInvest = Math.min(availableRP, effectiveMax);

    if (DOM.detailInvestSlider) {
        DOM.detailInvestSlider.max = maxInvest;
        DOM.detailInvestSlider.value = Math.min(domainPending.invested || 0, maxInvest);
    }
    if (DOM.detailInvestInput) {
        DOM.detailInvestInput.value = Math.min(domainPending.invested || 0, maxInvest);
    }
    if (DOM.detailMaxInvest) DOM.detailMaxInvest.textContent = formatTemplate('{max}', { max: formatNumber(maxInvest) });

    updateDetailPreview(Logic);
    showStage('detail');
}

/**
 * Update the detail preview with current investment values.
 * @param {Object} Logic - Logic module for chance calculations
 */
export function updateDetailPreview(Logic) {
    const domainPending = Logic.Submission.getPending();
    if (!domainPending) return;
    const tier = (Runtime.submissionConfig.tiers || []).find(t => t.id === domainPending.tierId);
    if (!tier) return;
    pending = { ...domainPending, tier };

    if (!DOM.detailInvestSlider || !DOM.detailInvestInput) return;

    let val = parseInt(DOM.detailInvestSlider.value) || 0;
    if (document.activeElement === DOM.detailInvestInput) {
        val = parseInt(DOM.detailInvestInput.value) || 0;
    }

    // Use same effective max calculation as openDetail
    const K = Logic.Submission.getCurrentK(tier);
    const effectiveMax = Math.floor(19 * K);
    const availableRP = Math.floor(State.rp - pending.baseCost);
    const max = Math.min(availableRP, effectiveMax);

    if (val > max) val = max;
    if (val < 0) val = 0;

    const investmentOutcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_INVEST,
        { amount: val },
        { actor: 'player', source: 'ui' }
    );
    if (!investmentOutcome.ok) return;
    val = investmentOutcome.result;
    pending = { ...Logic.Submission.getPending(), tier };

    if (DOM.detailInvestSlider.value != val) DOM.detailInvestSlider.value = val;
    if (DOM.detailInvestInput.value != val && document.activeElement !== DOM.detailInvestInput) {
        DOM.detailInvestInput.value = val;
    }

    const chance = Logic.Submission.calculateChance(tier, val);
    const bonus = chance - tier.baseRate;

    if (DOM.detailTotalChance) DOM.detailTotalChance.textContent = `${(chance * 100).toFixed(1)}%`;
    if (DOM.detailChanceBar) DOM.detailChanceBar.style.width = `${chance * 100}%`;
    if (DOM.detailChanceBreakdown) {
        DOM.detailChanceBreakdown.textContent = formatTemplate(t('detailBaseChanceBreakdown'), {
            base: Math.round(tier.baseRate * 100),
            bonus: (bonus * 100).toFixed(1)
        });
    }
}

/**
 * Start the submission process (deduct cost, generate questions).
 * @param {Object} Logic - Logic module for calculations and state updates
 */
export function startSubmission(Logic) {
    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_START,
        {},
        { actor: 'player', source: 'ui' }
    );
    if (!outcome.ok) return;
    pending = null;
    Logic.updateAll();
    Logic.saveGame('submission-start');
    showQuestion(Logic);
}

/**
 * Show the current rebuttal question.
 * @param {Object} Logic - Logic module (unused but kept for consistency)
 */
export function showQuestion(Logic) {
    const session = Logic.Submission.getSession();
    if (!session) return;
    const tier = (Runtime.submissionConfig.tiers || []).find(t => t.id === session.tierId)
        || session.tierSnapshot;

    showStage('question');

    const q = session.questions[session.index];
    if (!q) {
        console.error("Question data missing");
        finish(Logic);
        return;
    }

    if (DOM.questionTierLabel) DOM.questionTierLabel.textContent = `${tier?.name || ''} - Rebuttal`;
    if (DOM.questionProgress) DOM.questionProgress.textContent = `Q ${session.index + 1}/${session.questions.length}`;

    const displayChance = Math.max(0, Math.min(100, session.currentChance * 100));
    if (DOM.questionChance) DOM.questionChance.textContent = `${displayChance.toFixed(1)}%`;
    if (DOM.rebuttalGaugeFill) {
        DOM.rebuttalGaugeFill.style.width = `${displayChance}%`;
        DOM.rebuttalGaugeFill.className = 'absolute top-0 left-0 h-full transition-all duration-500 bg-emerald-500';
    }

    const revNum = q.reviewer || ((session.index % 3) + 1);
    if (DOM.questionReviewerName) DOM.questionReviewerName.textContent = t('questionReviewerName').replace('{num}', revNum);
    if (DOM.questionReviewerBadge) DOM.questionReviewerBadge.textContent = `#${revNum}`;
    if (DOM.questionText) DOM.questionText.textContent = q.q || q.question;

    if (DOM.optionsContainer) {
        DOM.optionsContainer.innerHTML = '';
        (q.options || []).forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:border-indigo-400 hover:bg-slate-700 transition-colors text-sm text-slate-200';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(idx, btn, Logic));
            DOM.optionsContainer.appendChild(btn);
        });
    }

    if (DOM.questionFeedback) DOM.questionFeedback.classList.add('hidden');
    if (DOM.questionNextBtn) DOM.questionNextBtn.classList.add('hidden');

    if (session.currentAnswer) {
        renderAnsweredQuestion(session, q, session.currentAnswer);
    }
}

function renderAnsweredQuestion(session, question, answer) {
    const displayChance = session.currentChance * 100;
    if (DOM.questionChance) DOM.questionChance.textContent = `${displayChance.toFixed(1)}%`;

    if (DOM.rebuttalGaugeFill) {
        DOM.rebuttalGaugeFill.style.width = `${displayChance}%`;
        DOM.rebuttalGaugeFill.className = `absolute top-0 left-0 h-full transition-all duration-500 ${answer.correct ? 'bg-emerald-400' : 'bg-rose-400'}`;
    }

    if (DOM.questionFeedback) {
        DOM.questionFeedback.textContent = answer.correct
            ? (question.comment || 'Correct!')
            : t('incorrectAnswer');
        DOM.questionFeedback.classList.remove('hidden', 'text-emerald-300', 'text-rose-300');
        DOM.questionFeedback.classList.add(answer.correct ? 'text-emerald-300' : 'text-rose-300');
    }

    if (DOM.optionsContainer) {
        const buttons = DOM.optionsContainer.querySelectorAll('button');
        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === answer.correctIndex) {
                button.classList.add('border-emerald-400', 'bg-emerald-900/40');
            } else if (index === answer.optionIndex) {
                button.classList.add('border-rose-400', 'bg-rose-900/40');
            }
        });
    }

    if (DOM.questionNextBtn) {
        const isLast = session.index >= session.questions.length - 1;
        DOM.questionNextBtn.textContent = isLast
            ? t('resultButton', 'View Result')
            : t('questionNext', 'Next');
        DOM.questionNextBtn.classList.remove('hidden');
    }
}

/**
 * Handle answer selection for a rebuttal question.
 * @param {number} idx - Selected answer index
 * @param {HTMLElement} btnElem - The clicked button element
 * @param {Object} Logic - Logic module for connection checks
 */
export function handleAnswer(idx, btnElem, Logic) {
    try {
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_ANSWER,
            { optionIndex: idx },
            { actor: 'player', source: 'ui' }
        );
        const answer = outcome.ok ? outcome.result : null;
        const session = Logic.Submission.getSession();
        const question = session?.questions?.[session.index];
        if (!answer || !session || !question) return;

        renderAnsweredQuestion(session, question, answer);
        Logic.saveGame('submission-answer');
    } catch (e) {
        console.error("Handle Answer Error", e);
    }
}

/**
 * Go to the next question or finish.
 * @param {Object} Logic - Logic module for finish handling
 */
export function nextQuestion(Logic) {
    const commandOutcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_ADVANCE,
        {},
        { actor: 'player', source: 'ui' }
    );
    if (!commandOutcome.ok) return;
    if (typeof commandOutcome.result?.success === 'boolean') {
        finish(Logic, null, commandOutcome.result);
    } else {
        showQuestion(Logic);
        Logic.saveGame('submission-next-question');
    }
}

/**
 * Finish the submission and show result.
 * @param {Object} Logic - Logic module for state updates
 * @param {Function} renderPublicationsCallback - Callback to re-render publications
 */
export function finish(Logic, renderPublicationsCallback, resolvedResult = null) {
    const session = Logic.Submission.getSession();
    let result = resolvedResult || session?.result || null;
    if (!result && session?.status === Logic.Submission.SubmissionStatus.ANSWERED) {
        const outcome = Logic.Commands.dispatch(
            Logic.Commands.CommandType.SUBMISSION_ADVANCE,
            {},
            { actor: 'player', source: 'ui' }
        );
        result = outcome.ok ? outcome.result : null;
    }
    if (!session || !result) return;

    const accepted = result.success;
    const rewards = result.rewards;
    const target = result.venue;
    const finalTitle = session.paperTitle || 'Untitled Paper';

    Logic.updateAll();
    renderPublications();
    if (typeof renderPublicationsCallback === 'function') renderPublicationsCallback();

    if (DOM.resultIcon) {
        DOM.resultIcon.textContent = accepted ? 'A' : 'R';
        DOM.resultIcon.className = accepted
            ? 'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/60'
            : 'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-rose-500/20 text-rose-200 border border-rose-400/60';
    }
    if (DOM.resultTitle) DOM.resultTitle.textContent = accepted ? t('resultAccept') : t('resultReject');
    if (DOM.resultTier) DOM.resultTier.textContent = target;

    let detailText = formatTemplate(
        t(accepted ? 'resultPaperAccepted' : 'resultPaperRejected'),
        { target }
    );
    if (!accepted && rewards.refund > 0) {
        detailText += ` (Git Revert: +${formatNumber(rewards.refund)} RP)`;
    }
    if (DOM.resultDetail) DOM.resultDetail.textContent = detailText;

    const letterText = formatTemplate(
        t(accepted ? 'letterAcceptBody' : 'letterRejectBody'),
        { target, title: finalTitle }
    );
    typeLetter(letterText);

    const flavorPool = accepted
        ? Runtime.submissionConfig.flavorText.accepted
        : Runtime.submissionConfig.flavorText.rejected;
    if (DOM.resultFlavor) DOM.resultFlavor.textContent = pickRandom(flavorPool);
    if (DOM.resultChance) DOM.resultChance.textContent = `${(result.chance * 100).toFixed(1)}%`;
    if (DOM.resultRoll) DOM.resultRoll.textContent = `${t('resultRollLabel')} ${result.roll.toFixed(2)}`;

    const counts = new Map();
    State.acceptedPapers.forEach(paper => {
        const venue = typeof paper?.venue === 'string' ? paper.venue : '';
        counts.set(venue, (counts.get(venue) || 0) + 1);
    });
    const acceptedList = [...counts.entries()]
        .map(([venue, count]) => `[${venue}: ${count}]`)
        .join(' ');

    if (DOM.resultRewards) {
        DOM.resultRewards.replaceChildren();
        const addRow = (text, small = false) => {
            const row = document.createElement('div');
            row.className = `p-3 rounded-lg border border-slate-800 bg-slate-800/60 text-sm text-slate-200${small ? ' text-xs' : ''}`;
            row.textContent = text;
            DOM.resultRewards.appendChild(row);
        };
        addRow(`${t('resultRpReward')}: ${formatNumber(rewards.rp)}`);
        addRow(`${t('resultCitationReward')}: ${formatNumber(rewards.citations)}`);
        addRow(formatTemplate(t('resultAnswerSummary'), {
            correct: result.correct,
            total: result.totalQuestions,
            chance: Math.round(result.chance * 100),
            base: Math.round(result.initialChance * 100)
        }), true);
        addRow(`${t('resultAcceptedList')}: ${acceptedList}`, true);
    }

    Logic.saveGame('submission-resolved');
    showStage('result');
}

/**
 * Typewriter effect for result letter.
 * @param {string} text - Text to type out
 */
export function typeLetter(text) {
    const el = DOM.resultLetterBody;
    if (!el) return;
    el.textContent = '';

    // Hide buttons initially
    if (DOM.resultSettlement) {
        DOM.resultSettlement.classList.add('hidden');
        DOM.resultSettlement.classList.remove('result-settlement-anim');
    }

    if (resultTypingTimer) clearInterval(resultTypingTimer);

    const chars = text.split('');
    let idx = 0;

    resultTypingTimer = setInterval(() => {
        if (idx >= chars.length) {
            clearInterval(resultTypingTimer);
            resultTypingTimer = null;

            // Show buttons after pause
            setTimeout(() => {
                if (DOM.resultSettlement) {
                    DOM.resultSettlement.classList.remove('hidden');
                    DOM.resultSettlement.classList.add('result-settlement-anim');
                }
            }, 600);
            return;
        }

        el.textContent += chars[idx];
        idx++;
    }, 30);
}

/**
 * Handle research topic input change.
 * @param {Event} e - Input event
 */
export function handleTopicInput(e, Logic) {
    const raw = e.target.value;
    Logic.Commands.dispatch(
        Logic.Commands.CommandType.RESEARCH_TOPICS_SET,
        { topics: raw.split(/[,]/) },
        { actor: 'player', source: 'ui' }
    );
}

/**
 * Reroll the generated paper title.
 * @param {Object} Logic - Logic module for title generation
 */
export function rerollTitle(Logic) {
    const title = Logic.generatePaperTitle();
    Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_DRAFT_TITLE_SET,
        { title },
        { actor: 'player', source: 'ui' }
    );
    const el = DOM.generatedTitleDisplay;
    if (el) {
        el.textContent = `"${title}"`;
        el.classList.remove('animate-pulse');
        void el.offsetWidth;
        el.classList.add('animate-pulse');
    }
}

/**
 * Open the submission modal.
 * @param {Object} Logic - Logic module for initialization
 */
export function openModal(Logic) {
    const submission = Logic.Submission.openModal();
    pending = submission.pending;

    // Title Gen Init
    if (DOM.researchFocusInput) {
        DOM.researchFocusInput.value = (State.userResearchTopics || []).join(', ');
    }
    if (DOM.submissionModal) DOM.submissionModal.classList.remove('hidden');

    if (submission.status === Logic.Submission.SubmissionStatus.RESOLVED) {
        finish(Logic);
        return;
    }
    if ([
        Logic.Submission.SubmissionStatus.REBUTTAL,
        Logic.Submission.SubmissionStatus.ANSWERED
    ].includes(submission.status)) {
        showQuestion(Logic);
        return;
    }
    if (submission.status === Logic.Submission.SubmissionStatus.PREPARED && pending) {
        const restoredTitle = String(pending.paperTitle || Runtime.lastGeneratedTitle || 'Untitled Paper');
        Runtime.lastGeneratedTitle = restoredTitle;
        if (DOM.generatedTitleDisplay) DOM.generatedTitleDisplay.textContent = `"${restoredTitle}"`;
        openDetail(pending.tierId, Logic);
        return;
    }

    rerollTitle(Logic);
    renderTiers(Logic);
    showStage('tier');
}

/**
 * Close the submission modal.
 */
export function closeModal() {
    if (DOM.submissionModal) DOM.submissionModal.classList.add('hidden');
    if (resultTypingTimer) {
        clearInterval(resultTypingTimer);
        resultTypingTimer = null;
    }
}

export function startNewSubmission(Logic) {
    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.SUBMISSION_CLEAR,
        {},
        { actor: 'player', source: 'ui' }
    );
    if (!outcome.ok) return;
    pending = null;
    rerollTitle(Logic);
    renderTiers(Logic);
    showStage('tier');
    Logic.saveGame('submission-cleared');
}

/**
 * Get the pending submission data.
 * @returns {Object|null} Pending submission or null
 */
export function getPending() {
    return pending;
}

/**
 * Set the pending submission data.
 * @param {Object} data - Pending submission data
 */
export function setPending(data) {
    pending = data;
}
