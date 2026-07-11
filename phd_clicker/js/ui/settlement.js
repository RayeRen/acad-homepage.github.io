/**
 * Settlement (Prestige) UI Module
 * Handles the prestige flow including confirmation, transition animation,
 * and statistics display.
 * Extracted from Game.UI.Settlement in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime, mergeState, resetState } from '../state.js';
import { cloneJsonValue } from '../store/index.js';
import { t, formatNumber } from '../data.js';
import { updateI18n, renderLists, renderPublications, updateNews } from './render.js';
import * as Advisor from './advisor.js';
import * as Submission from './submission.js';
import * as AGI from '../agi/index.js';
import * as AGIFarewell from '../agi/prestige/farewell.js';

/**
 * Show the prestige confirmation modal.
 * @param {Object} Logic - Logic module for reputation calculation
 */
export function showConfirmation(Logic) {
    // Force update UI strings
    updateI18n();

    const requirements = Logic.Prestige.checkPrestigeRequirements();
    if (!requirements.canPrestige) {
        const message = State.currentLang === 'en'
            ? `Thesis defense requires ${requirements.required} top-tier papers (${requirements.topTierCount}/${requirements.required}).`
            : `毕业答辩需要 ${requirements.required} 篇顶会论文（${requirements.topTierCount}/${requirements.required}）。`;
        alert(message);
        return;
    }

    const repGain = Logic.Prestige.calculateReputationGain();

    if (DOM.confirmGeneration) DOM.confirmGeneration.textContent = State.generation;
    if (DOM.confirmRepGain) DOM.confirmRepGain.textContent = `+${formatNumber(repGain)}`;

    // Bind events
    if (DOM.prestigeConfirmCancel) {
        DOM.prestigeConfirmCancel.onclick = () => {
            if (DOM.prestigeConfirmationModal) DOM.prestigeConfirmationModal.classList.add('hidden');
        };
    }

    if (DOM.prestigeConfirmAccept) {
        DOM.prestigeConfirmAccept.onclick = () => {
            if (DOM.prestigeConfirmationModal) DOM.prestigeConfirmationModal.classList.add('hidden');
            const stats = Logic.Prestige.collectStatistics();
            showStats(stats, Logic);
        };
    }

    if (DOM.prestigeConfirmationModal) DOM.prestigeConfirmationModal.classList.remove('hidden');
}

/**
 * Show detailed statistics modal.
 * @param {Object} stats - Collected statistics object
 * @param {Object} Logic - Logic module (unused but kept for consistency)
 */
export function showStats(stats, Logic) {
    updateI18n();

    const modal = DOM.prestigeStatisticsModal;

    // Fill Headers
    if (DOM.statsGeneration) DOM.statsGeneration.textContent = stats.generation;
    if (DOM.statsDateRange) DOM.statsDateRange.textContent = `${stats.startDate} ~ ${stats.endDate}`;

    // Fill Academic
    if (DOM.statTotalPapers) DOM.statTotalPapers.textContent = stats.academic.totalPapers;
    if (DOM.statTopPapers) DOM.statTopPapers.textContent = stats.academic.topTierPapers;
    if (DOM.statCitations) DOM.statCitations.textContent = formatNumber(stats.academic.totalCitations);
    if (DOM.statHIndex) DOM.statHIndex.textContent = stats.academic.hIndex;
    if (DOM.statRejections) DOM.statRejections.textContent = stats.academic.rejections;
    if (DOM.statRebuttalAcc) DOM.statRebuttalAcc.textContent = Math.round(stats.academic.rebuttalAccuracy * 100) + '%';

    // Fill Intensity
    if (DOM.statClicks) DOM.statClicks.textContent = formatNumber(stats.intensity.manualClicks);
    if (DOM.statTotalRp) DOM.statTotalRp.textContent = formatNumber(stats.intensity.totalRPEarned);
    if (DOM.statCoffee) DOM.statCoffee.textContent = stats.intensity.coffeeConsumed;
    if (DOM.statBuildings) DOM.statBuildings.textContent = stats.intensity.buildingsPurchased;
    if (DOM.statUpgrades) DOM.statUpgrades.textContent = stats.intensity.upgradesBought;

    // Fill RP Source
    if (DOM.statRpClickPct) DOM.statRpClickPct.textContent = stats.rpBreakdown.click.pct + '%';
    if (DOM.statRpClickAmt) DOM.statRpClickAmt.textContent = formatNumber(stats.rpBreakdown.click.amount) + ' RP';

    if (DOM.statRpComputePct) DOM.statRpComputePct.textContent = stats.rpBreakdown.compute.pct + '%';
    if (DOM.statRpComputeAmt) DOM.statRpComputeAmt.textContent = formatNumber(stats.rpBreakdown.compute.amount) + ' RP';

    if (DOM.statRpAcademicPct) DOM.statRpAcademicPct.textContent = stats.rpBreakdown.academic.pct + '%';
    if (DOM.statRpAcademicAmt) DOM.statRpAcademicAmt.textContent = formatNumber(stats.rpBreakdown.academic.amount) + ' RP';

    // Fill Social
    if (DOM.statConnectionsCount) DOM.statConnectionsCount.textContent = stats.networking.owned.length;
    if (DOM.statRepEarned) DOM.statRepEarned.textContent = '+' + formatNumber(stats.networking.repEarned);
    if (DOM.statSocialInflation) DOM.statSocialInflation.textContent = 'x' + stats.networking.inflation;

    // Fill Playstyle
    if (DOM.statPlaystyleType) DOM.statPlaystyleType.textContent = stats.playstyle.type;
    if (DOM.statPlaystyleDesc) DOM.statPlaystyleDesc.textContent = stats.playstyle.desc;
    if (DOM.statPrimaryStrategy) DOM.statPrimaryStrategy.textContent = stats.playstyle.strategy;

    // Fill Advisor
    if (DOM.statAdvisorComment) DOM.statAdvisorComment.textContent = `"${stats.advisor.text}"`;
    if (DOM.statAdvisorReason) DOM.statAdvisorReason.textContent = `- ${stats.advisor.reason}`;

    if (modal) modal.classList.remove('hidden');

    // Bind Start New Button
    if (DOM.statsStartNewBtn) {
        DOM.statsStartNewBtn.onclick = () => {
            if (modal) modal.classList.add('hidden');

            // Check if AGI farewell should be shown
            if (AGIFarewell.shouldShowFarewell()) {
                AGIFarewell.show(() => {
                    showTransition(stats, Logic);
                });
            } else {
                showTransition(stats, Logic);
            }
        };
    }
}

/**
 * Show the prestige transition animation.
 * @param {Object} stats - Collected statistics object
 * @param {Object} Logic - Logic module for prestige execution
 */
export function showTransition(stats, Logic) {
    const screen = DOM.prestigeTransitionScreen;

    // Clear any pending transition timers
    Runtime.transitionTimers.forEach(id => clearTimeout(id));
    Runtime.transitionTimers = [];

    // Restore every animated property so a second prestige does not inherit
    // the completed visual state of the previous generation.
    if (screen) {
        screen.style.opacity = '1';
        screen.style.transition = '';
    }
    if (DOM.transitionProgress) DOM.transitionProgress.style.width = '0%';
    if (DOM.transitionComment) DOM.transitionComment.style.opacity = '0';
    if (DOM.transitionCurrent) {
        DOM.transitionCurrent.style.opacity = '1';
        DOM.transitionCurrent.style.transform = 'translateY(0)';
    }
    if (DOM.transitionNext) {
        DOM.transitionNext.style.opacity = '0';
        DOM.transitionNext.style.transform = 'translateY(20px)';
    }

    // Fill Data
    if (DOM.transitionGenOld) DOM.transitionGenOld.textContent = stats.generation;
    if (DOM.transitionGenNew) DOM.transitionGenNew.textContent = stats.nextGen.gen;
    if (DOM.transitionCommentText) DOM.transitionCommentText.textContent = stats.advisor.text;

    // Update Icon
    const currentIcon = document.getElementById('transition-origin-icon');
    if (currentIcon && stats.nextGen.origin.icon) {
        const parent = currentIcon.parentNode;
        const newI = document.createElement('i');
        newI.id = 'transition-origin-icon';
        newI.setAttribute('data-lucide', stats.nextGen.origin.icon);
        newI.className = 'w-16 h-16 text-amber-500 mx-auto';
        parent.replaceChild(newI, currentIcon);
        if (window.lucide) lucide.createIcons({ root: parent });
    }

    if (screen) screen.classList.remove('hidden');

    // Animation Sequence
    const timers = Runtime.transitionTimers;
    timers.push(setTimeout(() => {
        if (DOM.transitionProgress) DOM.transitionProgress.style.width = '100%';
    }, 100));

    timers.push(setTimeout(() => {
        if (DOM.transitionComment) DOM.transitionComment.style.opacity = '1';
    }, 1000));

    timers.push(setTimeout(() => {
        if (DOM.transitionCurrent) {
            DOM.transitionCurrent.style.opacity = '0';
            DOM.transitionCurrent.style.transform = 'translateY(-20px)';
        }
    }, 1500));

    timers.push(setTimeout(() => {
        if (DOM.transitionNext) {
            DOM.transitionNext.style.opacity = '1';
            DOM.transitionNext.style.transform = 'translateY(0)';
        }
    }, 2000));

    timers.push(setTimeout(() => {
        if (screen) {
            screen.style.opacity = '0';
            screen.style.transition = 'opacity 0.5s';
        }
    }, 3500));

    timers.push(setTimeout(() => {
        if (screen) {
            screen.classList.add('hidden');
            screen.style.opacity = '1'; // Reset for next time
        }
        Runtime.transitionTimers = [];
        executePrestigeReset(stats, Logic);
    }, 4000));
}

/**
 * Execute the actual prestige reset.
 * @param {Object} stats - Collected statistics object
 * @param {Object} Logic - Logic module for state reset
 */
export async function executePrestigeReset(stats, Logic) {
    const previousState = cloneJsonValue(State);
    const preservedAgi = State.agi ? AGI.preserveOnPrestige(State.agi) : null;

    const outcome = Logic.Commands.dispatch(
        Logic.Commands.CommandType.PRESTIGE_EXECUTE,
        { stats, preservedAgi },
        { actor: 'player', source: 'ui' }
    );
    if (!outcome.ok) {
        console.error('Prestige execution failed:', outcome.error || outcome.result);
        return;
    }

    // Critical reset: wait for its versioned save before opening the new world.
    const saveResult = typeof Logic.saveGame === 'function'
        ? await Logic.saveGame('prestige')
        : null;
    if (!saveResult) {
        // The reset is only complete once it is durable. Restore the prior
        // in-memory world so a storage failure cannot create a split reality
        // where the UI shows a new generation but reload returns to the old one.
        resetState();
        mergeState(previousState);
        State.agi = cloneJsonValue(previousState.agi);
        Runtime.submissionSession = State.submission?.session || null;

        // State.agi was restored as a clone, so scene-local resources still
        // belong to the pre-transaction object. Rebuild the active checkpoint
        // against the restored object before returning control to the player.
        // Keep this isolated from the rollback itself: UI/state restoration and
        // its error notice must still complete if scene reconstruction fails.
        try {
            AGI.Phase4?.StateMachine?.destroy?.();
            AGI.Phase4?.StateMachine?.resumeFromCheckpoint?.();
        } catch (error) {
            console.error('Failed to restore AGI scene after prestige rollback:', error);
        }

        Logic.updateAll();
        renderLists();
        renderPublications();
        updateNews();
        alert(State.currentLang === 'en'
            ? 'The new generation could not be saved. Your previous world was restored.'
            : '新周目保存失败，已恢复到转生前的状态。');
        return;
    }

    // On success, runtime scenes are torn down only after the new world is
    // durable. The failure branch above reconstructs them only after restoring
    // the previous world.
    AGI.onPrestigeStart();
    window.Game?.Meta?.init?.();

    // Refresh UI
    try {
        Runtime.submissionSession = null;
        Submission.closeModal();
        renderLists();
        renderPublications();
        updateNews();
        Logic.updateAll();
    } catch (e) {
        console.error("UI Refresh Error after prestige:", e);
    }

    // Show advisor selection (this will also apply starting bonuses)
    // After advisor is confirmed, intro will be shown
    Advisor.open(Logic);
}

/**
 * Close the settlement/statistics modal.
 */
export function close() {
    if (DOM.prestigeConfirmationModal) DOM.prestigeConfirmationModal.classList.add('hidden');
    if (DOM.prestigeStatisticsModal) DOM.prestigeStatisticsModal.classList.add('hidden');
    if (DOM.prestigeTransitionScreen) DOM.prestigeTransitionScreen.classList.add('hidden');
}
