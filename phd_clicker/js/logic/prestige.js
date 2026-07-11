/**
 * Prestige Logic Module
 * Contains prestige/rebirth system logic: requirements, reputation gain, origin determination.
 * Extracted from Game.Logic.Prestige and Game.UI.Settlement in game.js
 *
 * Note: UI parts (modals, transitions) are handled by the UI module.
 * This module only contains pure logic functions.
 */

import { State, Runtime } from '../state.js';
import { hasConnection, calculateHIndex } from './core.js';
import { formatNumber, formatTemplate, t } from '../data.js';
import { preserveOnPrestige } from '../agi/state.js';
import * as Advisor from './advisor.js';

/**
 * Top tier venue names for prestige requirements.
 */
const TOP_TIER_VENUES = ['NeurIPS', 'ICML', 'CVPR', 'ICLR', 'AAAI'];

/**
 * Check if player meets prestige requirements.
 * Requires 3 top tier papers.
 * @returns {{ canPrestige: boolean, topTierCount: number, required: number }} Prestige status
 */
export function checkPrestigeRequirements() {
    const topTierCount = State.acceptedPapers.filter(
        p => TOP_TIER_VENUES.includes(p.venue)
    ).length;

    return {
        canPrestige: topTierCount >= 3,
        topTierCount: topTierCount,
        required: 3
    };
}

/**
 * Calculate reputation gain from prestige.
 * Based on total RP, papers, citations, and top tier count.
 * @returns {number} Reputation points to gain
 */
export function calculateReputationGain() {
    const totalRP = State.totalRp;
    const papers = State.acceptedPapers.length;
    const citations = State.citations;
    const topTierCount = State.acceptedPapers.filter(
        p => TOP_TIER_VENUES.includes(p.venue)
    ).length;

    // Formula: sqrt(totalRP / 1000) + papers * 100 + sqrt(citations) + topTier * 200
    return Math.floor(
        Math.sqrt(totalRP / 1000) +
        papers * 100 +
        Math.sqrt(citations) +
        topTierCount * 200
    );
}

/**
 * Determine next origin based on player stats.
 * Analyzes RP sources to determine playstyle.
 * @returns {string} Origin ID: 'grinder', 'tech', or 'academic'
 */
export function determineNextOrigin() {
    const stats = State.stats;

    // Tech Heir: Compute RP is highest
    if (stats.lifetime_rp_compute > stats.lifetime_rp_academic &&
        stats.lifetime_rp_compute > stats.lifetime_rp_click) {
        return 'tech';
    }

    // Nepo Baby: Academic RP is highest
    if (stats.lifetime_rp_academic > stats.lifetime_rp_compute &&
        stats.lifetime_rp_academic > stats.lifetime_rp_click) {
        return 'academic';
    }

    // Grinder: Click RP is highest, or fallback
    return 'grinder';
}

/**
 * Collect comprehensive statistics for prestige screen.
 * @returns {Object} Statistics object for UI display
 */
export function collectStatistics() {
    const s = State;
    const stats = s.stats;
    const accepted = s.acceptedPapers;

    // Basic Calculations
    const repGain = calculateReputationGain();
    const nextOriginId = determineNextOrigin();
    const nextOrigin = Runtime.locale.origins[nextOriginId];

    // Analysis
    const topTierCount = accepted.filter(
        p => TOP_TIER_VENUES.includes(p.venue)
    ).length;
    const rejections = stats.total_papers - accepted.length;

    // RP Breakdown
    const totalRP = Math.max(1, s.totalRp);
    const rpClickPct = Math.round((stats.lifetime_rp_click / totalRP) * 100);
    const rpComputePct = Math.round((stats.lifetime_rp_compute / totalRP) * 100);
    const rpAcademicPct = Math.round((stats.lifetime_rp_academic / totalRP) * 100);

    // Advisor Comment Logic
    let comment = t('advComment_default');
    let reason = t('advReason_default');
    let playstyleType = t('playstyle_balanced');
    let playstyleDesc = t('playstyle_desc_balanced');

    if (stats.lifetime_clicks < 50 && totalRP > 100000) {
        comment = t('advComment_idle');
        reason = t('advReason_idle');
        playstyleType = t('playstyle_idle');
        playstyleDesc = t('playstyle_desc_idle');
    } else if (rejections === 0 && accepted.length > 5) {
        comment = t('advComment_genius');
        reason = t('advReason_genius');
    } else if (s.inventory['coffee'] > 200) {
        comment = t('advComment_coffee');
        reason = formatTemplate(t('advReason_coffee'), { count: s.inventory['coffee'] });
    } else if (topTierCount >= 3) {
        comment = t('advComment_rich');
        reason = t('advReason_rich');
    }

    if (stats.lifetime_clicks > 2000) {
        playstyleType = t('playstyle_clicker');
        playstyleDesc = t('playstyle_desc_clicker');
    }

    return {
        generation: s.generation,
        startDate: new Date(s.lastSaveTime).toLocaleDateString(),
        endDate: new Date().toLocaleDateString(),

        academic: {
            totalPapers: accepted.length,
            topTierPapers: topTierCount,
            totalCitations: Math.floor(s.citations),
            hIndex: calculateHIndex(accepted),
            rejections: rejections,
            rebuttalAccuracy: 0.75 + (Math.random() * 0.2)
        },

        intensity: {
            manualClicks: stats.lifetime_clicks,
            totalRPEarned: Math.floor(s.totalRp),
            coffeeConsumed: s.inventory['coffee'] || 0,
            playtimeSeconds: 0,
            peakRPPerSec: 0,
            avgRPPerSec: Math.floor(s.totalRp / 3600),
            buildingsPurchased: Object.values(s.inventory).reduce((a, b) => a + b, 0),
            upgradesBought: s.purchasedUpgrades.length
        },

        rpBreakdown: {
            click: { amount: Math.floor(stats.lifetime_rp_click), pct: rpClickPct },
            compute: { amount: Math.floor(stats.lifetime_rp_compute), pct: rpComputePct },
            academic: { amount: Math.floor(stats.lifetime_rp_academic), pct: rpAcademicPct },
            topBuilding: { name: 'Unknown', val: 0 }
        },

        fun: {
            oom: Math.floor(Math.random() * 20),
            lucky: 0,
            unlucky: 0,
            closest: 0
        },

        networking: {
            owned: s.ownedConnections,
            repEarned: repGain,
            inflation: Math.pow(2, s.ownedConnections.length),
            mvc: { name: '-', val: 0 }
        },

        playstyle: {
            type: playstyleType,
            desc: playstyleDesc,
            strategy: nextOrigin ? nextOrigin.name : 'Unknown'
        },

        advisor: {
            text: comment,
            reason: reason
        },

        nextGen: {
            gen: s.generation + 1,
            origin: nextOrigin
        },

        raw: {
            repGain: repGain,
            nextOriginId: nextOriginId
        }
    };
}

/**
 * Execute the prestige reset.
 * Resets progress while keeping connections and adding reputation.
 * @param {Object} stats - Statistics object from collectStatistics()
 * @returns {Object} New state configuration
 */
export function executePrestige({ stats = null, preservedAgi = null } = {}) {
    const requirements = checkPrestigeRequirements();
    if (!requirements.canPrestige) {
        return { ok: false, reason: 'requirements', requirements };
    }

    const settlementStats = stats || collectStatistics();
    const nextAgi = preservedAgi || preserveOnPrestige(State.agi);
    const keptConnections = [...State.ownedConnections];
    const keptNarrativeLog = Array.isArray(State.narrativeLog)
        ? [...State.narrativeLog]
        : [];
    const advisorRetain = Math.max(0, Advisor.getAdvisorModifiers().rebirthRpRetain || 0);
    const retainRate = Math.max(hasConnection('hinton') ? 0.05 : 0, advisorRetain);
    const startRP = State.rp * retainRate;

    Object.assign(State, {
        rp: startRP,
        totalRp: startRP,
        citations: 0,
        citationsRate: 0,
        inventory: {},
        purchasedUpgrades: [],
        purchasedClickUpgrades: [],
        acceptedPapers: [],
        userResearchTopics: [],
        submission: {
            status: 'idle',
            pending: null,
            session: null,
            revisionBonuses: {}
        },
        narrativeLog: keptNarrativeLog,
        papersSubmitted: 0,

        generation: State.generation + 1,
        reputation: State.reputation + settlementStats.networking.repEarned,
        currentOrigin: settlementStats.raw.nextOriginId,
        ownedConnections: keptConnections,
        introSeen: false,
        advisorSeen: false,
        currentAdvisor: null,

        stats: {
            lifetime_rp_click: 0,
            lifetime_rp_compute: 0,
            lifetime_rp_academic: 0,
            lifetime_clicks: 0,
            total_papers: 0
        },

        lastSaveTime: Date.now(),
        agi: nextAgi
    });

    Runtime.rps = 0;
    Runtime.rpsCompute = 0;
    Runtime.rpsAcademic = 0;
    Runtime.globalMultiplier = 1;
    Runtime.submissionSession = null;

    return {
        ok: true,
        newState: State,
        stats: settlementStats,
        requirements
    };
}

/** Backward-compatible wrapper for older callers. */
export function doPrestige(stats) {
    const result = executePrestige({ stats });
    return result.ok ? result.newState : null;
}

/**
 * Get origin configuration by ID.
 * @param {string} originId - Origin ID
 * @returns {Object|null} Origin configuration object
 */
export function getOriginConfig(originId) {
    const origins = Runtime.locale.origins || {};
    return origins[originId] || null;
}

/**
 * Get current origin configuration.
 * @returns {Object|null} Current origin configuration
 */
export function getCurrentOrigin() {
    return getOriginConfig(State.currentOrigin);
}
