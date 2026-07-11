/**
 * Building Logic Module
 * Contains building purchase and production logic.
 * Extracted from Game.Logic in game.js
 */

import { State, Runtime } from '../state.js';
import { calculateCost, getBuildingMultiplier, updateAll, hasConnection, getUpgradeCost, isUpgradeUnlocked } from './core.js';
import * as AGI from '../agi/index.js';

/**
 * Get production per building (before global multiplier).
 * @param {string} id - Building ID
 * @returns {number} Production value per building instance
 */
export function getBuildingProduction(id) {
    const building = Runtime.buildingsConfig.find(b => b.id === id);
    if (!building) return 0;
    return building.baseProd * getBuildingMultiplier(id);
}

/**
 * Get total production from a building type.
 * @param {string} id - Building ID
 * @returns {number} Total production from all instances of building
 */
export function getBuildingTotalProduction(id) {
    const count = State.inventory[id] || 0;
    return getBuildingProduction(id) * count * Runtime.globalMultiplier;
}

/**
 * Check if player can afford a building.
 * @param {string} id - Building ID
 * @returns {boolean} True if player can afford the building
 */
export function canAffordBuilding(id) {
    const building = Runtime.buildingsConfig.find(b => b.id === id);
    if (!building) return false;
    const cost = calculateCost(building.baseCost, State.inventory[id] || 0);
    return State.rp >= cost;
}

/**
 * Purchase a building.
 * Deducts cost and increments inventory.
 * @param {string} id - Building ID
 * @returns {boolean} True if purchase was successful
 */
export function buyBuilding(id) {
    const building = Runtime.buildingsConfig.find(b => b.id === id);
    if (!building) return false;

    const cost = calculateCost(building.baseCost, State.inventory[id] || 0);
    if (State.rp < cost) return false;

    State.rp -= cost;
    State.inventory[id] = (State.inventory[id] || 0) + 1;
    updateAll();

    // Notify AGI system if agi_proto was purchased
    if (id === 'agi_proto') {
        AGI.onAgiProtoPurchased(State.inventory['agi_proto']);
    }

    return true;
}

/**
 * Purchase multiple buildings at once.
 * @param {string} id - Building ID
 * @param {number} count - Number to purchase
 * @returns {number} Number of buildings actually purchased
 */
export function buyMultipleBuildings(id, count) {
    const building = Runtime.buildingsConfig.find(b => b.id === id);
    if (!building) return 0;

    let bought = 0;
    for (let i = 0; i < count; i++) {
        const cost = calculateCost(building.baseCost, State.inventory[id] || 0);
        if (State.rp < cost) break;

        State.rp -= cost;
        State.inventory[id] = (State.inventory[id] || 0) + 1;
        bought++;
    }

    if (bought > 0) {
        updateAll();

        // Notify AGI system if agi_proto was purchased
        if (id === 'agi_proto') {
            AGI.onAgiProtoPurchased(State.inventory['agi_proto']);
        }
    }

    return bought;
}

/**
 * Get count of a specific building.
 * @param {string} id - Building ID
 * @returns {number} Count of buildings owned
 */
export function getBuildingCount(id) {
    return State.inventory[id] || 0;
}

/**
 * Get total count of all buildings.
 * @returns {number} Total count of all buildings
 */
export function getTotalBuildingCount() {
    return Object.values(State.inventory).reduce((sum, count) => sum + count, 0);
}

/**
 * Purchase an upgrade.
 * Deducts cost and adds to purchased upgrades.
 * Checks unlock conditions before allowing purchase.
 * @param {string} id - Upgrade ID
 * @returns {boolean} True if purchase was successful
 */
export function buyUpgrade(id) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === id);
    if (!upgrade || State.purchasedUpgrades.includes(id)) return false;

    // Check unlock conditions first
    if (!isUpgradeUnlocked(id)) return false;

    // Calculate real cost with Kaiming He discount
    const realCost = getUpgradeCost(id);
    if (State.rp < realCost) return false;

    State.rp -= realCost;
    State.purchasedUpgrades.push(id);
    updateAll();

    // Every successful purchase goes through the same event outlet. The AGI
    // system ignores unrelated upgrades, while phase-driving upgrades such as
    // agi_alignment and agi_conscious can no longer be skipped by the GUI.
    AGI.onUpgradePurchased(id);

    return true;
}

/**
 * Check if an upgrade is purchased.
 * @param {string} id - Upgrade ID
 * @returns {boolean} True if upgrade is owned
 */
export function hasUpgrade(id) {
    return State.purchasedUpgrades.includes(id);
}

/**
 * Check if player can afford an upgrade.
 * Also checks if upgrade is unlocked.
 * @param {string} id - Upgrade ID
 * @returns {boolean} True if player can afford the upgrade and it's unlocked
 */
export function canAffordUpgrade(id) {
    const upgrade = Runtime.upgradesConfig.find(u => u.id === id);
    if (!upgrade || State.purchasedUpgrades.includes(id)) return false;

    // Must be unlocked first
    if (!isUpgradeUnlocked(id)) return false;

    const realCost = getUpgradeCost(id);
    return State.rp >= realCost;
}

// ==================== Click Upgrades ====================

/**
 * Get the cost of a click upgrade with Kaiming He discount.
 * @param {string} id - Click upgrade ID
 * @returns {number} Cost of the click upgrade
 */
export function getClickUpgradeCost(id) {
    const upgrade = Runtime.clickUpgradesConfig.find(u => u.id === id);
    if (!upgrade) return Infinity;

    let realCost = upgrade.cost;
    if (hasConnection('kaiming')) {
        realCost = Math.floor(realCost * 0.7);
    }

    return realCost;
}

/**
 * Purchase a click upgrade.
 * @param {string} id - Click upgrade ID
 * @returns {boolean} True if purchase was successful
 */
export function buyClickUpgrade(id) {
    const upgrade = Runtime.clickUpgradesConfig.find(u => u.id === id);
    if (!upgrade || State.purchasedClickUpgrades.includes(id)) return false;

    const realCost = getClickUpgradeCost(id);
    if (State.rp < realCost) return false;

    State.rp -= realCost;
    State.purchasedClickUpgrades.push(id);
    updateAll();

    return true;
}

/**
 * Check if a click upgrade is purchased.
 * @param {string} id - Click upgrade ID
 * @returns {boolean} True if click upgrade is owned
 */
export function hasClickUpgrade(id) {
    return State.purchasedClickUpgrades.includes(id);
}

/**
 * Check if player can afford a click upgrade.
 * @param {string} id - Click upgrade ID
 * @returns {boolean} True if player can afford the click upgrade
 */
export function canAffordClickUpgrade(id) {
    const upgrade = Runtime.clickUpgradesConfig.find(u => u.id === id);
    if (!upgrade || State.purchasedClickUpgrades.includes(id)) return false;

    const realCost = getClickUpgradeCost(id);
    return State.rp >= realCost;
}
