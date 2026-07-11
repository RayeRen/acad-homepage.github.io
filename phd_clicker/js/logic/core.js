/**
 * Core Game Logic Module
 * Contains core calculation logic: RPS, multipliers, costs, manual click, offline earnings.
 * Extracted from Game.Logic in game.js
 */

import { Constants } from '../constants.js';
import { State, Runtime } from '../state.js';
import { formatNumber } from '../data.js';
import { GAME_DATA_EN } from '../../data/en.js';
import * as Advisor from './advisor.js';

/**
 * Check if player owns a connection.
 * @param {string} id - Connection ID
 * @returns {boolean} True if connection is owned
 */
export function hasConnection(id) {
    return State.ownedConnections.includes(id);
}

export function setResearchTopics(topics) {
    if (!Array.isArray(topics)) return false;
    State.userResearchTopics = topics
        .filter(topic => typeof topic === 'string')
        .map(topic => topic.trim().slice(0, 160))
        .filter(Boolean)
        .slice(0, 30);
    return [...State.userResearchTopics];
}

export function completeIntro() {
    if (State.introSeen) return false;
    State.introSeen = true;
    return true;
}

export function grantResearchPoints(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return false;
    State.rp += value;
    State.totalRp += value;
    return value;
}

/**
 * Calculate building cost with inflation.
 * Applies Sam Altman connection discount, Tech Heir origin discount, and advisor effects.
 * @param {number} base - Base cost of building
 * @param {number} count - Current count of buildings owned
 * @returns {number} Inflated cost
 */
export function calculateCost(base, count) {
    const advisorMod = Advisor.getAdvisorModifiers();

    // Buff: Sam Altman (Funding Secured) - Reduces inflation
    // Advisor trait can also reduce inflation
    let inflation = hasConnection('altman') ? 1.13 : Constants.INFLATION_BASE;
    inflation += advisorMod.inflationReduction;
    inflation = Math.max(inflation, 1.01); // Minimum 1% inflation

    let cost = Math.floor(base * Math.pow(inflation, count));

    // Origin: Tech Heir - 20% discount (simulated refund)
    if (State.currentOrigin === 'tech') {
        cost = Math.floor(cost * 0.8);
    }

    // Advisor facility cost multiplier
    cost = Math.floor(cost * advisorMod.facilityCostMultiplier);

    return cost;
}

/**
 * Get building cost for a specific building.
 * @param {string} id - Building ID
 * @returns {number} Current cost of the building
 */
export function getBuildingCost(id) {
    const building = Runtime.buildingsConfig.find(b => b.id === id);
    if (!building) return Infinity;
    return calculateCost(building.baseCost, State.inventory[id] || 0);
}

/**
 * Get upgrade cost with Kaiming He connection discount and advisor effects.
 * @param {string} id - Upgrade ID
 * @returns {number} Cost of the upgrade
 */
export function getUpgradeCost(id) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === id);
    if (!upgrade) return Infinity;

    const advisorMod = Advisor.getAdvisorModifiers();
    let cost = upgrade.cost;

    // Buff: Kaiming He (Deep Residual) - 30% discount
    if (hasConnection('kaiming')) {
        cost = Math.floor(cost * 0.7);
    }

    // Advisor upgrade cost multiplier
    cost = Math.floor(cost * advisorMod.upgradeCostMultiplier);

    return cost;
}

/**
 * Get multiplier for a specific building from upgrades and advisor effects.
 * @param {string} id - Building ID
 * @returns {number} Total multiplier for the building
 */
export function getBuildingMultiplier(id) {
    // Base multiplier from upgrades
    let multiplier = Runtime.upgradesConfig.reduce((m, u) =>
        m * (State.purchasedUpgrades.includes(u.id) && u.type === 'building' && u.target === id ? u.multiplier : 1),
        1);

    // Advisor-specific building multiplier
    const advisorMod = Advisor.getAdvisorModifiers();
    if (advisorMod.buildingMultipliers[id]) {
        multiplier *= advisorMod.buildingMultipliers[id];
    }

    return multiplier;
}

/**
 * Update global multipliers based on upgrades, origins, connections, and advisor effects.
 */
export function updateMultipliers() {
    const advisorMod = Advisor.getAdvisorModifiers();

    // Global Multiplier Base: 5% per paper + advisor paper bonus
    const paperBonus = 0.05 + advisorMod.paperBonusAdditive;
    let gm = 1 + (State.acceptedPapers.length * paperBonus);

    // Origin: Nepo Baby (Academic) - Extra +10% per paper
    if (State.currentOrigin === 'academic') {
        gm += (State.acceptedPapers.length * 0.10);
    }

    // Connection: Yann LeCun (+20% Independent)
    if (hasConnection('lecun')) {
        gm *= 1.2;
    }

    // Global Upgrades
    Runtime.upgradesConfig.forEach(u => {
        if (State.purchasedUpgrades.includes(u.id) && u.type === 'global') {
            gm *= u.multiplier;
        }
    });

    // Advisor global RP multiplier
    gm *= advisorMod.globalRpMultiplier;

    Runtime.globalMultiplier = gm;

    // Click Power from old-style click upgrades (if any)
    let cp = 1;
    Runtime.upgradesConfig.forEach(u => {
        if (State.purchasedUpgrades.includes(u.id) && u.type === 'click') {
            cp *= u.multiplier;
        }
    });

    // New Click Upgrade System: fixedBonus + rpsPercent
    let fixedBonus = 1;
    let rpsPercent = 0;
    Runtime.clickUpgradesConfig.forEach(u => {
        if (State.purchasedClickUpgrades.includes(u.id)) {
            fixedBonus += u.fixedBonus;
            rpsPercent += u.rpsPercent;
        }
    });
    Runtime.totalFixedClickBonus = fixedBonus;
    Runtime.totalClickRpsPercent = rpsPercent;

    // Store old-style multiplier for later use
    Runtime._oldClickMultiplier = cp;
}

/**
 * Update click power based on current RPS.
 * Should be called after calculateRPS().
 */
export function updateClickPower() {
    const cp = Runtime._oldClickMultiplier || 1;
    // Final click power = (fixedBonus + RPS * rpsPercent) * old multiplier
    Runtime.clickPower = (Runtime.totalFixedClickBonus + Runtime.rps * Runtime.totalClickRpsPercent) * cp;
}

/**
 * Calculate Research Points per Second (RPS).
 * Updates Runtime.rps, Runtime.rpsCompute, Runtime.rpsAcademic.
 * Applies connection buffs and advisor effects.
 */
export function calculateRPS() {
    const advisorMod = Advisor.getAdvisorModifiers();

    let raw = 0;
    let rawCompute = 0;
    let rawAcademic = 0;

    // Connection Buffs
    const buffJensen = hasConnection('jensen') ? 2 : 1;
    const buffKarpathy = hasConnection('karpathy') ? 3 : 1;

    Runtime.buildingsConfig.forEach(b => {
        const count = State.inventory[b.id] || 0;
        let prod = count * b.baseProd * getBuildingMultiplier(b.id);

        if (b.category === 'compute') {
            prod *= buffJensen;
            // Advisor compute facilities multiplier
            prod *= advisorMod.computeFacilitiesMultiplier;
            rawCompute += prod;
        } else {
            prod *= buffKarpathy;
            // Advisor academic facilities multiplier
            prod *= advisorMod.academicFacilitiesMultiplier;
            rawAcademic += prod;
        }
        raw += prod;
    });

    const gm = Runtime.globalMultiplier;
    Runtime.rps = raw * gm;
    Runtime.rpsCompute = rawCompute * gm;
    Runtime.rpsAcademic = rawAcademic * gm;
}

/**
 * Calculate citations rate based on accepted papers.
 * @returns {number} Citations rate per second
 */
export function calculateCitationsRate() {
    const count = State.acceptedPapers.length;
    // Formula: Base 0.1 per paper + Synergy 2% per paper pair (quadratic scaling)
    return count * 0.1 + 0.02 * count * (count - 1);
}

/**
 * Calculate h-index approximation.
 * Uses sqrt(total_citations) as approximation.
 * @param {Array} papers - Array of accepted papers
 * @returns {number} Approximate h-index
 */
export function calculateHIndex(papers) {
    if (!papers || !papers.length) return 0;
    return Math.floor(Math.sqrt(State.citations));
}

/**
 * Update all derived values: multipliers, RPS, citations rate.
 * Should be called after any state change.
 * Note: UI update should be called separately by the caller.
 */
export function updateAll() {
    updateMultipliers();
    calculateRPS();
    updateClickPower(); // Must be after calculateRPS to use updated RPS
    State.citationsRate = calculateCitationsRate();
    // UI update is handled by the caller or UI module
}

/**
 * Handle manual click action.
 * Applies click power, origin bonuses, advisor effects, and crit chance.
 * @returns {{ value: number, isCrit: boolean }} Click result
 */
export function manualClick() {
    const advisorMod = Advisor.getAdvisorModifiers();

    let val = Runtime.clickPower;
    let isCrit = false;

    // Origin: Grinder (+300% RPS added to click)
    if (State.currentOrigin === 'grinder') {
        val += (Runtime.rps * 3);
    }

    // Advisor manual click multiplier
    val *= advisorMod.manualClickMultiplier;

    // Connection: Ashish Vaswani (10% chance for 10x crit)
    // Advisor crit chance stacks with connection
    const baseCritChance = hasConnection('vaswani') ? 0.1 : 0;
    const totalCritChance = Math.min(baseCritChance + advisorMod.critChance, 0.5); // Cap at 50%
    const critMultiplier = advisorMod.critMultiplier > 1 ? advisorMod.critMultiplier : 10;

    if (totalCritChance > 0 && Math.random() < totalCritChance) {
        val *= critMultiplier;
        isCrit = true;
    }

    State.rp += val;
    State.totalRp += val;

    // Stats Tracking
    State.stats.lifetime_clicks++;
    State.stats.lifetime_rp_click += val;

    return { value: val, isCrit: isCrit };
}

/**
 * Apply offline earnings based on time since last save.
 * Capped by OFFLINE_LIMIT_SECONDS.
 * Applies advisor offline multiplier and respects disable offline effect.
 * @param {number} savedTime - Timestamp of last save
 * @returns {{ rp: number, citations: number, seconds: number } | null} Offline earnings or null if no time passed
 */
export function applyOfflineEarnings(savedTime) {
    if (!savedTime) return null;

    const advisorMod = Advisor.getAdvisorModifiers();

    // Check if offline earnings are disabled by advisor trait
    if (advisorMod.disableOffline) {
        return null;
    }

    const now = Date.now();
    const offlineLimit = Constants.OFFLINE_LIMIT_SECONDS * Math.max(
        0,
        advisorMod.offlineCapMultiplier || 0
    );
    const deltaSec = Math.min(
        Math.max((now - savedTime) / 1000, 0),
        offlineLimit
    );

    if (deltaSec > 0) {
        // Apply offline multiplier from advisor
        let gainedRp = Runtime.rps * deltaSec * advisorMod.offlineMultiplier;
        const gainedCitations = State.citationsRate * deltaSec;

        State.rp += gainedRp;
        State.totalRp += gainedRp;
        State.citations += gainedCitations;

        console.log(`Offline: +${formatNumber(gainedRp)} RP, +${formatNumber(gainedCitations)} Citations`);

        return {
            rp: gainedRp,
            citations: gainedCitations,
            seconds: deltaSec
        };
    }

    return null;
}

// ==================== Upgrade Unlock System ====================

/**
 * Count top-tier papers (NeurIPS, ICML, CVPR, ICLR, AAAI).
 * @returns {number} Count of top-tier papers
 */
export function countTopTierPapers() {
    const topTierVenues = ['NeurIPS', 'ICML', 'CVPR', 'ICLR', 'AAAI'];
    return (State.acceptedPapers || []).filter(p => topTierVenues.includes(p.venue)).length;
}

/**
 * Check if an upgrade is unlocked based on all unlock conditions.
 * @param {string} upgradeId - Upgrade ID to check
 * @returns {boolean} True if upgrade is unlocked
 */
export function isUpgradeUnlocked(upgradeId) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    // Already purchased = unlocked
    if (State.purchasedUpgrades.includes(upgradeId)) return true;

    // Check generation requirement (for multi-playthrough upgrades)
    if (upgrade.requireGeneration && (State.generation || 1) < upgrade.requireGeneration) {
        return false;
    }

    // Check RP trigger (total RP earned, not current)
    if (upgrade.trigger && State.totalRp < upgrade.trigger) return false;

    // Check target building count requirement
    if (upgrade.requireBuilding) {
        const count = State.inventory[upgrade.target] || 0;
        if (count < upgrade.requireBuilding) return false;
    }

    // Check other building requirement
    if (upgrade.requireOther) {
        const count = State.inventory[upgrade.requireOther.id] || 0;
        if (count < upgrade.requireOther.count) return false;
    }

    // Check paper count (top-tier papers)
    if (upgrade.requirePapers) {
        const topTierCount = countTopTierPapers();
        if (topTierCount < upgrade.requirePapers) return false;
    }

    // Check prerequisite upgrade
    if (upgrade.requireUpgrade) {
        if (!State.purchasedUpgrades.includes(upgrade.requireUpgrade)) return false;
    }

    return true;
}

/**
 * Get detailed unlock info for UI display.
 * @param {string} upgradeId - Upgrade ID
 * @returns {Array<{type: string, target: string, current: number, required: number, met: boolean}>}
 */
export function getUpgradeUnlockInfo(upgradeId) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === upgradeId);
    if (!upgrade) return [];

    const conditions = [];

    // Generation requirement
    if (upgrade.requireGeneration) {
        const currentGen = State.generation || 1;
        conditions.push({
            type: 'generation',
            target: null,
            current: currentGen,
            required: upgrade.requireGeneration,
            met: currentGen >= upgrade.requireGeneration
        });
    }

    // RP trigger condition
    if (upgrade.trigger) {
        conditions.push({
            type: 'rp',
            target: null,
            current: State.totalRp,
            required: upgrade.trigger,
            met: State.totalRp >= upgrade.trigger
        });
    }

    // Target building count
    if (upgrade.requireBuilding) {
        const count = State.inventory[upgrade.target] || 0;
        conditions.push({
            type: 'building',
            target: upgrade.target,
            current: count,
            required: upgrade.requireBuilding,
            met: count >= upgrade.requireBuilding
        });
    }

    // Other building requirement
    if (upgrade.requireOther) {
        const count = State.inventory[upgrade.requireOther.id] || 0;
        conditions.push({
            type: 'otherBuilding',
            target: upgrade.requireOther.id,
            current: count,
            required: upgrade.requireOther.count,
            met: count >= upgrade.requireOther.count
        });
    }

    // Paper count requirement
    if (upgrade.requirePapers) {
        const topTierCount = countTopTierPapers();
        conditions.push({
            type: 'papers',
            target: null,
            current: topTierCount,
            required: upgrade.requirePapers,
            met: topTierCount >= upgrade.requirePapers
        });
    }

    // Prerequisite upgrade
    if (upgrade.requireUpgrade) {
        const hasPre = State.purchasedUpgrades.includes(upgrade.requireUpgrade);
        conditions.push({
            type: 'upgrade',
            target: upgrade.requireUpgrade,
            current: hasPre ? 1 : 0,
            required: 1,
            met: hasPre
        });
    }

    return conditions;
}

/**
 * Check if an upgrade should be visible in the UI.
 * Shows upgrades if:
 * 1. Target building is owned (count >= 1)
 * 2. It's a global upgrade (no target) and player has some progress
 * 3. It's the next few upgrades ahead for that building
 * @param {string} upgradeId - Upgrade ID
 * @returns {boolean} True if upgrade should be visible
 */
export function isUpgradeVisible(upgradeId) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    // Already purchased = always visible
    if (State.purchasedUpgrades.includes(upgradeId)) return true;

    // Global upgrades: show if player has some buildings
    if (!upgrade.target || upgrade.type === 'global') {
        const totalBuildings = Object.values(State.inventory).reduce((sum, c) => sum + c, 0);
        return totalBuildings >= 5; // Show global upgrades after 5 buildings
    }

    // Building-specific: show if player owns at least 1 of target building
    const targetCount = State.inventory[upgrade.target] || 0;
    if (targetCount < 1) return false;

    // Show up to 3 upgrades ahead for this building
    const buildingUpgrades = Runtime.upgradesConfig.filter(u => u.target === upgrade.target);
    const purchasedForBuilding = buildingUpgrades.filter(u => State.purchasedUpgrades.includes(u.id)).length;
    const upgradeIndex = buildingUpgrades.findIndex(u => u.id === upgradeId);

    return upgradeIndex < purchasedForBuilding + 3;
}

/**
 * Generate a random paper title using templates and vocabulary.
 * Uses English paper generator data (academic papers are typically in English).
 * @returns {string} Generated paper title
 */
export function generatePaperTitle() {
    // Always use English paper generator (academic standard)
    const genData = GAME_DATA_EN.paperGenerator || {};

    if (!genData || !genData.templates) {
        Runtime.lastGeneratedTitle = "Untitled Paper";
        return "Untitled Paper";
    }

    const pick = (arr) => arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '';
    let template = pick(genData.templates);

    // Get user topic or fallback to vocabulary
    let topic = "";
    if (State.userResearchTopics && State.userResearchTopics.length > 0) {
        const validTopics = State.userResearchTopics.filter(t => t.trim() !== "");
        if (validTopics.length > 0) {
            topic = pick(validTopics);
        }
    }
    if (!topic && genData.vocabulary && genData.vocabulary.nouns) {
        topic = pick(genData.vocabulary.nouns);
    }

    // Replace template placeholders
    if (genData.vocabulary) {
        const v = genData.vocabulary;
        let title = template
            .replace('{UserTopic}', topic)
            .replace('{Adjective}', pick(v.adjectives))
            .replace('{Noun}', pick(v.nouns))
            .replace('{Method}', pick(v.methods))
            .replace('{Verb}', pick(v.verbs));

        Runtime.lastGeneratedTitle = title;
        return title;
    }

    Runtime.lastGeneratedTitle = template;
    return template;
}
