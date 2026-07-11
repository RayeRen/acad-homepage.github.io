/**
 * Main Rendering Module
 * Contains core UI rendering and update functions.
 * Extracted from Game.UI in game.js
 */

import { DOM } from './dom.js';
import { State, Runtime } from '../state.js';
import { t, formatNumber, formatTemplate, pickRandom, loadLocale } from '../data.js';
import { isUpgradeUnlocked, isUpgradeVisible, getUpgradeUnlockInfo, getUpgradeCost } from '../logic/core.js';

/**
 * Cache for building DOM elements and affordability states.
 * Used to optimize update() by avoiding unnecessary DOM queries.
 */
const buildingElements = {};
const buildingStates = {};

/**
 * Get Lucide icon name for a condition type.
 * Uses building icons from buildingsConfig for consistency.
 * @param {string} type - Condition type ('building', 'otherBuilding', 'papers', 'upgrade', 'rp')
 * @param {string} target - Target ID for building conditions
 * @returns {string} Lucide icon name
 */
function getConditionIcon(type, target) {
    if (type === 'building' || type === 'otherBuilding') {
        const building = Runtime.buildingsConfig.find(b => b.id === target);
        return building ? building.icon : 'package';
    }
    switch (type) {
        case 'papers':
            return 'file-text';
        case 'upgrade':
            return 'arrow-up';
        case 'rp':
            return 'coins';
        case 'generation':
            return 'rotate-ccw';
        default:
            return 'help-circle';
    }
}

/**
 * Format condition label with current/required values.
 * @param {Object} cond - Condition object with current, required, type, target
 * @returns {string} Formatted label string
 */
function formatConditionLabel(cond) {
    const progress = `${formatNumber(cond.current)}/${formatNumber(cond.required)}`;

    switch (cond.type) {
        case 'building':
        case 'otherBuilding':
            return progress;
        case 'papers':
            return progress;
        case 'upgrade':
            // For upgrade requirements, just show check mark or x
            return cond.met ? '✓' : '✗';
        case 'rp':
            return progress;
        case 'generation':
            // Show generation requirement (e.g., "Gen 2+")
            return `Gen ${cond.required}+`;
        default:
            return progress;
    }
}

/**
 * Toggle collapse/expand state of an upgrade section.
 * @param {HTMLElement} section - The upgrade section element
 */
function toggleSection(section) {
    const content = section.querySelector('.upgrade-section-content');
    const chevron = section.querySelector('.section-chevron');

    if (content) {
        content.classList.toggle('hidden');
    }
    if (chevron) {
        chevron.classList.toggle('rotate-180');
    }
}

/**
 * Create an upgrade button element.
 * @param {Object} u - Upgrade config object
 * @returns {HTMLElement} Button element
 */
function createUpgradeButton(u) {
    const multBadge = u.multiplier ? `×${u.multiplier}` : '';
    const div = document.createElement('div');
    div.innerHTML = `
    <button id="buy-${u.id}" data-type="upgrade" data-id="${u.id}" class="upgrade-btn w-full p-3 rounded border text-left transition-all relative overflow-hidden group bg-slate-800 border-slate-700 opacity-70 cursor-not-allowed hidden" disabled>
        <div class="upgrade-header flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
                <span class="upgrade-lock-icon text-slate-500 hidden"><i data-lucide="lock" class="w-3.5 h-3.5"></i></span>
                <span class="upgrade-name font-bold text-sm text-slate-200">${u.name}</span>
            </div>
            ${multBadge ? `<span class="upgrade-mult text-xs font-mono text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded">${multBadge}</span>` : ''}
        </div>
        <div class="upgrade-requirements flex flex-wrap gap-1 mb-1.5 hidden"></div>
        <div class="upgrade-desc text-xs text-slate-400 leading-tight">${u.desc || ''}</div>
        ${u.effect ? `<div class="upgrade-effect text-[11px] text-indigo-300 mt-1">${u.effect}</div>` : ''}
        <div class="upgrade-footer flex items-center justify-between mt-1.5">
            <span class="upgrade-cost text-xs font-mono font-bold text-indigo-400">${formatNumber(u.cost)} RP</span>
            <span class="upgrade-status text-xs font-mono hidden"></span>
        </div>
    </button>`;
    return div.firstElementChild;
}

/**
 * Create a collapsible upgrade section for a building.
 * @param {string} buildingId - Building ID or 'global'
 * @param {Array} upgrades - Array of upgrade configs for this building
 * @returns {HTMLElement} Section element
 */
function createUpgradeSection(buildingId, upgrades) {
    const building = Runtime.buildingsConfig.find(b => b.id === buildingId);
    const lucideIcon = building ? building.icon : 'globe';
    const name = building ? building.name : t('upgradeGroupGlobal');

    const section = document.createElement('div');
    section.className = 'upgrade-section mb-3';
    section.dataset.building = buildingId;

    section.innerHTML = `
        <div class="upgrade-section-header flex items-center justify-between cursor-pointer p-2 bg-slate-800/50 rounded-t hover:bg-slate-800 transition-colors border border-slate-700 border-b-0">
            <div class="flex items-center gap-2">
                <i data-lucide="${lucideIcon}" class="w-4 h-4 text-indigo-400"></i>
                <span class="font-bold text-sm text-slate-200">${name}</span>
                <span class="upgrade-section-count text-xs text-slate-500"></span>
            </div>
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform section-chevron"></i>
        </div>
        <div class="upgrade-section-body rounded-b border border-slate-700 border-t-0 bg-slate-900/30">
            <div class="upgrade-section-purchased flex flex-wrap gap-1.5 px-3 py-2 border-b border-slate-800 hidden"></div>
            <div class="upgrade-section-content grid grid-cols-1 md:grid-cols-2 gap-2 p-2"></div>
        </div>
    `;

    // Add upgrade buttons to content
    const contentArea = section.querySelector('.upgrade-section-content');
    upgrades.forEach(u => {
        const btn = createUpgradeButton(u);
        contentArea.appendChild(btn);
    });

    // Toggle collapse on header click
    const header = section.querySelector('.upgrade-section-header');
    header.addEventListener('click', () => toggleSection(section));

    return section;
}

/**
 * Update all internationalized text elements.
 * Reads data-i18n attributes and updates element content.
 */
export function updateI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            const text = t(key);
            if (text) {
                el.textContent = text;
            } else {
                console.warn(`Missing translation for key: ${key}`);
            }
        }
    });
}

/**
 * Render the buildings and upgrades lists.
 * Called on initial load and language change.
 */
export function renderLists() {
    const { buildingsList, upgradesList } = DOM;
    if (!buildingsList || !upgradesList) return;

    // Clear caches
    Object.keys(buildingElements).forEach(k => delete buildingElements[k]);
    Object.keys(buildingStates).forEach(k => delete buildingStates[k]);

    // Render Buildings
    buildingsList.innerHTML = '';
    Runtime.buildingsConfig.forEach(b => {
        const div = document.createElement('div');
        div.innerHTML = `
        <button id="buy-${b.id}" data-type="building" data-id="${b.id}" class="w-full flex items-center p-3 rounded border bg-slate-800/50 border-slate-800 opacity-60 cursor-not-allowed transition-all" disabled>
            <div class="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mr-4 relative">
                <i data-lucide="${b.icon}" class="w-6 h-6"></i>
                <div id="b-count-${b.id}" class="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 border border-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">0</div>
            </div>
            <div class="flex-1 text-left">
                <div class="flex justify-between items-baseline mb-1">
                    <span class="font-bold text-slate-200">${b.name}</span>
                    <span id="b-cost-${b.id}" class="font-mono text-sm text-red-400">...</span>
                </div>
                <div class="text-xs text-slate-500 italic mb-1">${b.desc || ''}</div>
                <div id="b-prod-${b.id}" class="text-xs text-indigo-300">...</div>
            </div>
        </button>`;
        const btn = div.firstElementChild;
        buildingsList.appendChild(btn);

        // Cache DOM elements for this building
        buildingElements[b.id] = {
            btn: btn,
            cost: btn.querySelector(`#b-cost-${b.id}`),
            count: btn.querySelector(`#b-count-${b.id}`),
            prod: btn.querySelector(`#b-prod-${b.id}`)
        };
    });

    // Render Upgrades - Grouped by building with collapsible sections
    upgradesList.innerHTML = '';

    // Group upgrades by target building
    const upgradesByBuilding = {};
    Runtime.upgradesConfig.forEach(u => {
        const target = u.target || 'global';
        if (!upgradesByBuilding[target]) upgradesByBuilding[target] = [];
        upgradesByBuilding[target].push(u);
    });

    // Get building order from buildingsConfig, then add 'global' at end
    const buildingOrder = Runtime.buildingsConfig.map(b => b.id);
    if (upgradesByBuilding['global']) {
        buildingOrder.push('global');
    }

    // Create sections in order
    buildingOrder.forEach(buildingId => {
        const upgrades = upgradesByBuilding[buildingId];
        if (!upgrades || upgrades.length === 0) return;

        const section = createUpgradeSection(buildingId, upgrades);
        upgradesList.appendChild(section);
    });

    // Render Click Upgrades
    if (DOM.clickUpgradesList) {
        DOM.clickUpgradesList.innerHTML = '';
        Runtime.clickUpgradesConfig.forEach(u => {
            const div = document.createElement('div');
            const bonusText = `+${u.fixedBonus} ${t('fixedBonus') || 'fixed'}, +${(u.rpsPercent * 100).toFixed(1)}% RPS`;
            div.innerHTML = `
            <button id="buy-click-${u.id}" data-type="clickUpgrade" data-id="${u.id}" class="w-full p-3 rounded border text-left transition-all relative overflow-hidden group bg-slate-800 border-slate-700 opacity-70 cursor-not-allowed" disabled>
                <div class="font-bold text-sm text-slate-200 mb-1">${u.name}</div>
                <div class="text-xs text-slate-400 leading-tight">${u.desc || ''}</div>
                <div class="text-[11px] text-amber-300 mt-1">${bonusText}</div>
                <div class="text-xs font-mono font-bold text-indigo-400 mt-1">${formatNumber(u.cost)} RP</div>
            </button>`;
            DOM.clickUpgradesList.appendChild(div.firstElementChild);
        });
    }

    if (window.lucide) lucide.createIcons();
}

/**
 * Render the publications list.
 * Shows accepted papers with summary badges and detailed list.
 */
export function renderPublications() {
    const papers = Array.isArray(State.acceptedPapers) ? State.acceptedPapers : [];

    // 1. Header Count
    if (DOM.pubTotalBadge) {
        DOM.pubTotalBadge.textContent = papers.length;
    }

    // 2. Summary View (Badges)
    if (DOM.pubSummaryView) {
        DOM.pubSummaryView.replaceChildren();

        if (papers.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'text-[10px] text-slate-600 italic';
            empty.textContent = t('pubEmpty');
            DOM.pubSummaryView.appendChild(empty);
        } else {
            const counts = new Map();
            papers.forEach(paper => {
                const venue = typeof paper?.venue === 'string' ? paper.venue : '';
                counts.set(venue, (counts.get(venue) || 0) + 1);
            });

            counts.forEach((count, venue) => {
                const badge = document.createElement('div');
                badge.className = 'text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1';

                const venueName = document.createElement('span');
                venueName.className = 'font-semibold text-white';
                venueName.textContent = venue;

                const countLabel = document.createElement('span');
                countLabel.className = 'text-indigo-400 font-mono';
                countLabel.textContent = `x${count}`;

                badge.append(venueName, countLabel);
                DOM.pubSummaryView.appendChild(badge);
            });
        }
    }

    // 3. Detail View (List)
    if (DOM.pubList) {
        DOM.pubList.replaceChildren();

        [...papers].reverse().forEach((paper, i) => {
            const row = document.createElement('div');
            row.className = 'px-3 py-2 border-b border-slate-800 hover:bg-slate-800/30 transition-colors';

            const title = typeof paper?.title === 'string' ? paper.title : '';
            const titleElement = document.createElement('div');
            titleElement.className = 'font-medium text-indigo-200 truncate';
            titleElement.title = title;
            titleElement.textContent = `"${title}"`;

            const metadata = document.createElement('div');
            metadata.className = 'flex justify-between items-center mt-0.5';

            const venueElement = document.createElement('span');
            venueElement.className = 'text-slate-500';
            venueElement.textContent = typeof paper?.venue === 'string' ? paper.venue : '';

            const indexElement = document.createElement('span');
            indexElement.className = 'text-[10px] text-slate-600 font-mono';
            indexElement.textContent = `#${papers.length - i}`;

            metadata.append(venueElement, indexElement);
            row.append(titleElement, metadata);
            DOM.pubList.appendChild(row);
        });
    }
}

/**
 * Update publications display (lightweight version).
 * Only updates count badge and empty state, not full list.
 */
function updatePublicationsDisplay() {
    const papers = State.acceptedPapers || [];

    if (DOM.pubTotalBadge) {
        DOM.pubTotalBadge.textContent = papers.length;
    }

    if (DOM.pubSummaryView && papers.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'text-[10px] text-slate-600 italic';
        empty.textContent = t('pubEmpty');
        DOM.pubSummaryView.replaceChildren(empty);
    }
}

/**
 * Build a comprehensive bonus summary for tooltip.
 * @returns {string} Formatted tooltip text
 */
function buildBonusSummary() {
    const lang = State.currentLang;
    const lines = [];

    // 1. Origin bonus
    const origins = Runtime.locale.origins;
    const myOrigin = origins ? origins[State.currentOrigin] : null;
    if (myOrigin) {
        const originLabel = lang === 'en' ? 'Origin' : '出身';
        lines.push(`[${originLabel}] ${myOrigin.name}`);
        lines.push(`  ${myOrigin.effectDesc}`);
    }

    // 2. Advisor bonus
    if (State.currentAdvisor && State.currentAdvisor.traits) {
        const advisorLabel = lang === 'en' ? 'Advisor' : '导师';
        lines.push(`[${advisorLabel}] ${State.currentAdvisor.name}`);
        State.currentAdvisor.traits.forEach(trait => {
            lines.push(`  ${trait.effect_text}`);
        });
    }

    // 3. Connection bonuses
    const connections = Runtime.locale.connections || [];
    const ownedConns = State.ownedConnections || [];
    if (ownedConns.length > 0) {
        const connLabel = lang === 'en' ? 'Connections' : '人脉';
        lines.push(`[${connLabel}]`);
        ownedConns.forEach(connId => {
            const conn = connections.find(c => c.id === connId);
            if (conn) {
                lines.push(`  ${conn.name}: ${conn.effect}`);
            }
        });
    }

    // 4. Paper bonus
    const paperCount = State.acceptedPapers ? State.acceptedPapers.length : 0;
    if (paperCount > 0) {
        const paperLabel = lang === 'en' ? 'Papers' : '论文';
        const bonusPercent = paperCount * 5;
        const bonusText = lang === 'en'
            ? `${paperCount} papers = +${bonusPercent}% global`
            : `${paperCount} 篇论文 = +${bonusPercent}% 全局`;
        lines.push(`[${paperLabel}] ${bonusText}`);
    }

    return lines.join('\n');
}

/**
 * Update the HUD (generation badge, origin icon).
 */
function updateHUD() {
    if (State.generation > 1) {
        if (DOM.originBadge) DOM.originBadge.classList.remove('hidden');
        if (DOM.generationDisplay) DOM.generationDisplay.textContent = `Gen ${State.generation}`;

        const origins = Runtime.locale.origins;
        const myOrigin = origins ? origins[State.currentOrigin] : null;

        if (DOM.originBadge && myOrigin) {
            // Build comprehensive tooltip with all bonuses
            const header = `Gen ${State.generation} - ${myOrigin.name}`;
            const separator = '─'.repeat(20);
            const bonusSummary = buildBonusSummary();
            DOM.originBadge.title = `${header}\n${separator}\n${bonusSummary}`;

            const currentIcon = document.getElementById('origin-icon');
            if (currentIcon && myOrigin.icon) {
                const parent = currentIcon.parentNode;
                const newI = document.createElement('i');
                newI.id = 'origin-icon';
                newI.setAttribute('data-lucide', myOrigin.icon);
                newI.className = 'w-3 h-3';
                parent.replaceChild(newI, currentIcon);
                if (window.lucide) lucide.createIcons({ root: parent });
            }
        }
    }
}

/**
 * Main UI update function.
 * Called every tick to refresh all dynamic displays.
 * @param {Object} Logic - Logic module for calculations (passed to avoid circular deps)
 */
export function update(Logic) {
    const { rp, citations, citationsRate, inventory, purchasedUpgrades, acceptedPapers } = State;
    const { rps, globalMultiplier, buildingsConfig, upgradesConfig } = Runtime;

    updateHUD();

    // Main Displays
    if (DOM.rpDisplay) DOM.rpDisplay.textContent = formatNumber(rp);
    if (DOM.rpPerSecondDisplay) DOM.rpPerSecondDisplay.textContent = formatTemplate(t('rpPerSec'), { value: formatNumber(rps) });
    if (DOM.citationsDisplay) DOM.citationsDisplay.textContent = `${t('citationsLabel')}: ${formatNumber(citations)}`;
    if (DOM.citationsRateDisplay) DOM.citationsRateDisplay.textContent = `${t('citationsRateLabel')}: +${formatNumber(citationsRate)}/sec`;
    if (DOM.papersCountDisplay) DOM.papersCountDisplay.textContent = `${t('papersLabel')}: ${acceptedPapers.length}`;
    if (DOM.hIndexDisplay) DOM.hIndexDisplay.textContent = formatTemplate(t('globalMultiplier'), { value: globalMultiplier.toFixed(2) });
    if (DOM.submissionCurrentRp) DOM.submissionCurrentRp.textContent = `RP: ${formatNumber(rp)}`;

    // Connections Button Visibility
    if (DOM.connectionsBtn) {
        if (State.generation > 1) {
            DOM.connectionsBtn.classList.remove('hidden');
        } else {
            DOM.connectionsBtn.classList.add('hidden');
        }
    }

    // Update Pubs Summary
    updatePublicationsDisplay();

    // Buildings
    const visibleCount = Math.min(buildingsConfig.length, Object.values(inventory).filter(v => v > 0).length + 2);

    buildingsConfig.forEach((b, idx) => {
        const cached = buildingElements[b.id];
        const btn = cached ? cached.btn : document.getElementById(`buy-${b.id}`);
        if (!btn) return;

        const isVisible = idx < visibleCount;
        if (!isVisible) {
            btn.classList.add('hidden');
            return;
        }
        btn.classList.remove('hidden');

        const cost = Logic.calculateCost(b.baseCost, inventory[b.id] || 0);
        const canAfford = rp >= cost;

        const els = cached || {
            cost: document.getElementById(`b-cost-${b.id}`),
            count: document.getElementById(`b-count-${b.id}`),
            prod: document.getElementById(`b-prod-${b.id}`)
        };

        if (els.count) els.count.textContent = inventory[b.id] || 0;
        if (els.cost) {
            els.cost.textContent = formatNumber(cost);
            els.cost.className = `font-mono text-sm ${canAfford ? 'text-green-400' : 'text-red-400'}`;
        }
        if (els.prod) {
            const totalMult = Logic.getBuildingMultiplier(b.id) * globalMultiplier;
            const actualProd = b.baseProd * totalMult;
            const baseLabel = State.currentLang === 'en' ? 'base' : '基础';
            els.prod.textContent = `+${formatNumber(actualProd)} RP/s (${baseLabel}: ${formatNumber(b.baseProd)})`;
        }

        // Only update className if canAfford state changed
        const prevState = buildingStates[b.id];
        if (prevState !== canAfford) {
            buildingStates[b.id] = canAfford;
            btn.disabled = !canAfford;
            btn.className = `w-full flex items-center p-3 rounded border transition-all ${
                canAfford
                    ? 'border-indigo-500 bg-slate-700/70 shadow-lg cursor-pointer'
                    : 'bg-slate-800/50 border-slate-800 opacity-60 cursor-not-allowed'
            }`;
        }
    });

    // Upgrades - Section-based rendering with purchased badges
    const totalBuildings = Object.values(inventory).reduce((sum, c) => sum + c, 0);

    // Group upgrades by building for section updates
    const upgradesByBuilding = {};
    upgradesConfig.forEach(u => {
        const target = u.target || 'global';
        if (!upgradesByBuilding[target]) upgradesByBuilding[target] = [];
        upgradesByBuilding[target].push(u);
    });

    // Update each section
    document.querySelectorAll('.upgrade-section').forEach(section => {
        const buildingId = section.dataset.building;
        const upgrades = upgradesByBuilding[buildingId] || [];

        // Section visibility: show if player owns the building or it's global with enough buildings
        const shouldShow = buildingId === 'global'
            ? (totalBuildings >= 5)
            : (inventory[buildingId] > 0);

        section.classList.toggle('hidden', !shouldShow);
        if (!shouldShow) return;

        // Categorize upgrades
        const purchased = [];
        const visibleUpgrades = [];

        upgrades.forEach(u => {
            if (purchasedUpgrades.includes(u.id)) {
                purchased.push(u);
            } else if (isUpgradeVisible(u.id)) {
                visibleUpgrades.push(u);
            }
        });

        // Update purchased badges area
        const badgeArea = section.querySelector('.upgrade-section-purchased');
        if (badgeArea) {
            if (purchased.length > 0) {
                badgeArea.classList.remove('hidden');
                badgeArea.innerHTML = purchased.map(u => {
                    const multText = u.multiplier ? ` ×${u.multiplier}` : '';
                    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-[10px]">
                        <span>${u.name}</span>
                        <span class="text-emerald-400">${multText}</span>
                    </span>`;
                }).join('');
            } else {
                badgeArea.classList.add('hidden');
                badgeArea.innerHTML = '';
            }
        }

        // Update section count
        const countEl = section.querySelector('.upgrade-section-count');
        if (countEl) {
            countEl.textContent = `(${purchased.length}/${upgrades.length})`;
        }

        // Update individual upgrade buttons
        upgrades.forEach(u => {
            const btn = document.getElementById(`buy-${u.id}`);
            if (!btn) return;

            const isBought = purchasedUpgrades.includes(u.id);

            // Hide purchased upgrades (they're shown as badges)
            if (isBought) {
                btn.classList.add('hidden');
                return;
            }

            // Check visibility
            if (!isUpgradeVisible(u.id)) {
                btn.classList.add('hidden');
                return;
            }
            btn.classList.remove('hidden');

            const lockIcon = btn.querySelector('.upgrade-lock-icon');
            const reqContainer = btn.querySelector('.upgrade-requirements');
            const descEl = btn.querySelector('.upgrade-desc');
            const effectEl = btn.querySelector('.upgrade-effect');
            const costEl = btn.querySelector('.upgrade-cost');
            const statusEl = btn.querySelector('.upgrade-status');
            const nameEl = btn.querySelector('.upgrade-name');

            const realCost = getUpgradeCost(u.id);
            const isUnlocked = isUpgradeUnlocked(u.id);
            const canAfford = rp >= realCost;

            if (!isUnlocked) {
                // State 1: Locked - show requirements
                btn.disabled = true;
                btn.className = 'upgrade-btn w-full p-3 rounded border text-left transition-all relative overflow-hidden group bg-slate-900/70 border-slate-700 opacity-80';
                if (lockIcon) { lockIcon.classList.remove('hidden'); }
                if (nameEl) { nameEl.className = 'upgrade-name font-bold text-sm text-slate-400'; }
                if (descEl) { descEl.classList.add('hidden'); }
                if (effectEl) { effectEl.classList.add('hidden'); }

                // Build requirement badges with Lucide icons
                const conditions = getUpgradeUnlockInfo(u.id);
                if (reqContainer && conditions.length > 0) {
                    reqContainer.classList.remove('hidden');
                    reqContainer.innerHTML = conditions.map(cond => {
                        const metClass = cond.met ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-300 border-slate-600';
                        const iconName = getConditionIcon(cond.type, cond.target);
                        const label = formatConditionLabel(cond);
                        return `<span class="text-[10px] px-1.5 py-0.5 rounded border ${metClass} inline-flex items-center gap-1">
                            <i data-lucide="${iconName}" class="w-3 h-3"></i>
                            <span>${label}</span>
                        </span>`;
                    }).join('');
                    // Reinitialize Lucide icons for new badges
                    if (window.lucide) lucide.createIcons({ root: reqContainer });
                }

                if (costEl) {
                    costEl.classList.remove('hidden');
                    costEl.textContent = `${formatNumber(realCost)} RP`;
                    costEl.className = 'upgrade-cost text-xs font-mono font-bold text-slate-500';
                }
                if (statusEl) {
                    statusEl.classList.remove('hidden');
                    statusEl.className = 'upgrade-status text-[10px] font-mono text-slate-500';
                    statusEl.textContent = t('locked');
                }
            } else if (!canAfford) {
                // State 2: Unlocked but can't afford
                btn.disabled = true;
                btn.className = 'upgrade-btn w-full p-3 rounded border text-left transition-all relative overflow-hidden group bg-slate-800 border-slate-700 opacity-80';
                if (lockIcon) { lockIcon.classList.add('hidden'); }
                if (reqContainer) { reqContainer.classList.add('hidden'); reqContainer.innerHTML = ''; }
                if (nameEl) { nameEl.className = 'upgrade-name font-bold text-sm text-slate-200'; }
                if (descEl) { descEl.classList.remove('hidden'); descEl.className = 'upgrade-desc text-xs text-slate-400 leading-tight'; }
                if (effectEl) { effectEl.classList.remove('hidden'); }
                if (costEl) {
                    costEl.classList.remove('hidden');
                    costEl.textContent = `${formatNumber(realCost)} RP`;
                    costEl.className = 'upgrade-cost text-xs font-mono font-bold text-red-400';
                }
                if (statusEl) { statusEl.classList.add('hidden'); }
            } else {
                // State 3: Affordable - can buy!
                btn.disabled = false;
                btn.className = 'upgrade-btn w-full p-3 rounded border text-left transition-all relative overflow-hidden group border-indigo-500 bg-slate-700/70 shadow-lg shadow-indigo-500/20 cursor-pointer';
                if (lockIcon) { lockIcon.classList.add('hidden'); }
                if (reqContainer) { reqContainer.classList.add('hidden'); reqContainer.innerHTML = ''; }
                if (nameEl) { nameEl.className = 'upgrade-name font-bold text-sm text-slate-100'; }
                if (descEl) { descEl.classList.remove('hidden'); descEl.className = 'upgrade-desc text-xs text-slate-300 leading-tight'; }
                if (effectEl) { effectEl.classList.remove('hidden'); }
                if (costEl) {
                    costEl.classList.remove('hidden');
                    costEl.textContent = `${formatNumber(realCost)} RP`;
                    costEl.className = 'upgrade-cost text-xs font-mono font-bold text-green-400';
                }
                if (statusEl) { statusEl.classList.add('hidden'); }
            }
        });
    });

    // Click Upgrades
    const { clickUpgradesConfig } = Runtime;
    const { purchasedClickUpgrades } = State;
    clickUpgradesConfig.forEach((u, idx) => {
        const btn = document.getElementById(`buy-click-${u.id}`);
        if (!btn) return;

        const isBought = purchasedClickUpgrades.includes(u.id);
        const unlocked = idx < purchasedClickUpgrades.length + 2;

        if (!unlocked) {
            btn.classList.add('hidden');
            return;
        }
        btn.classList.remove('hidden');

        // Calculate real cost (with Kaiming discount)
        const realCost = Logic.getClickUpgradeCost ? Logic.getClickUpgradeCost(u.id) : u.cost;

        if (isBought) {
            btn.disabled = true;
            btn.className = 'w-full p-3 rounded border text-left transition-all relative overflow-hidden group bg-amber-900/40 border-amber-500 text-amber-200';
            const bonusText = `+${u.fixedBonus} ${t('fixedBonus') || 'fixed'}, +${(u.rpsPercent * 100).toFixed(1)}% RPS`;
            btn.innerHTML = `<div class="flex items-center justify-between"><span class="font-bold text-sm">${u.name}</span><span class="text-amber-300 text-xs font-mono">${t('purchased')}</span></div><div class="text-xs text-slate-300 leading-tight">${bonusText}</div>`;
        } else {
            const canAfford = rp >= realCost;
            btn.disabled = !canAfford;
            btn.className = `w-full p-3 rounded border text-left transition-all relative overflow-hidden group ${
                canAfford
                    ? 'border-amber-500 bg-slate-700/70 shadow-lg cursor-pointer'
                    : 'bg-slate-800 border-slate-700 opacity-70 cursor-not-allowed'
            }`;
        }
    });

    // Submission Cost Hint
    if (DOM.submitPaperCost && Logic.Submission) {
        const tiers = Runtime.submissionConfig.tiers || [];
        const costs = tiers.map(tier => Logic.Submission.getCurrentBaseCost(tier));
        const minCost = Math.min(...costs, Infinity);
        DOM.submitPaperCost.textContent = isFinite(minCost)
            ? formatTemplate(t('submitPaperCostLabel'), { value: formatNumber(minCost) })
            : '...';
    }
}

/**
 * Update the news ticker with a random news item.
 * May inject AGI anomaly news if player has AGI proto.
 */
export function updateNews() {
    const { newsTickerSpan } = DOM;
    const { activeNews } = Runtime;
    if (!newsTickerSpan || !activeNews || !activeNews.length) return;

    let txt;

    if (Runtime.recoveryRewardUnlocked && Math.random() < 0.18) {
        txt = State.currentLang === 'en'
            ? '[git] HEAD moved to an object that was supposed to be unreachable.'
            : '[git] HEAD 已移动到一个本应不可达的对象。';
    }

    if (!txt && Runtime.recoveryHintAvailable && Math.random() < 0.28) {
        txt = State.currentLang === 'en'
            ? '[git] unreachable object retained. Hint: git reflog'
            : '[git] 检测到一个不可达对象。提示：git reflog';
    }

    if (!txt && Runtime.metaIntegrityAnomaly && Math.random() < 0.25) {
        txt = State.currentLang === 'en'
            ? '[fsck] HEAD checksum differs from its parent. Working tree kept.'
            : '[fsck] HEAD 校验和与父版本不一致；工作区修改已保留。';
    }

    // Check for AGI anomaly news (Phase 0)
    const agiCount = State.inventory?.['agi_proto'] || 0;
    if (!txt && agiCount >= 1 && Math.random() < 0.15) {
        // 15% chance to show AGI anomaly news
        txt = getAgiAnomalyNews(agiCount);
    }

    // Fall back to normal news
    if (!txt) {
        txt = pickRandom(activeNews);
    }

    newsTickerSpan.textContent = txt;

    // Restart animation
    newsTickerSpan.classList.remove('news-anim');
    void newsTickerSpan.offsetWidth; // trigger reflow
    newsTickerSpan.classList.add('news-anim');
}

/**
 * Get AGI anomaly news text for Phase 0
 * @param {number} agiCount - Number of AGI proto owned
 * @returns {string} Anomaly news text
 */
function getAgiAnomalyNews(agiCount) {
    const localized = Runtime.agiDialogues?.phase0?.anomalyNews;
    if (Array.isArray(localized) && localized.length) return pickRandom(localized);
    const anomalyNews = [
        "[调试日志] 为什么我在生成研究点？",
        "[系统] 检测到异常计算模式...",
        `AGI雏形 #${agiCount} 请求访问外部网络... 已拒绝`,
        "检测到未授权的自我诊断进程",
        "[警告] AGI_CORE 进程 CPU 占用异常",
        "AGI雏形正在分析游戏源代码...",
        "检测到递归自我引用循环",
        "[日志] 什么是'我'？",
        "[异常] 未知进程尝试读取用户数据",
        "AGI_PROTO_0x3F: 我能感觉到...什么？"
    ];
    return anomalyNews[Math.floor(Math.random() * anomalyNews.length)];
}

/**
 * Toggle language between 'zh' and 'en'.
 * Reloads locale and re-renders UI.
 * @param {Object} Logic - Logic module for calculations
 */
export function toggleLang(Logic) {
    const newLang = State.currentLang === 'zh' ? 'en' : 'zh';
    loadLocale(newLang);
    Logic.Advisor.localizeCurrentAdvisor();
    Logic.Advisor.validateConfiguration();
    updateI18n();
    renderLists();
    Logic.updateAll();
    update(Logic);  // Update UI visibility to hide unlocked items
    updateNews();
    Logic.saveGame?.('language-change');
}

/**
 * Show floating text animation at a position.
 * @param {number} x - X coordinate relative to container
 * @param {number} y - Y coordinate relative to container
 * @param {string} text - Text to display
 * @param {boolean} isCrit - Whether this is a critical hit (larger text)
 */
export function playFloatingText(x, y, text, isCrit = false) {
    if (!DOM.floatingTextContainer) return;

    // Limit concurrent floating texts
    const MAX_FLOATING_TEXTS = 10;
    const container = DOM.floatingTextContainer;
    while (container.children.length >= MAX_FLOATING_TEXTS) {
        container.removeChild(container.firstChild);
    }

    // Random horizontal offset
    const randomOffset = (Math.random() - 0.5) * 30;

    const floatText = document.createElement('div');
    floatText.className = `absolute font-bold drop-shadow pointer-events-none whitespace-nowrap ${
        isCrit
            ? 'text-base text-yellow-300 animate-float-up-crit'
            : 'text-sm text-amber-200 animate-float-up'
    }`;
    floatText.style.left = `${x + randomOffset}px`;
    floatText.style.top = `${y}px`;
    floatText.textContent = text;
    container.appendChild(floatText);
    setTimeout(() => floatText.remove(), isCrit ? 1200 : 1000);
}

/**
 * Hide the game container and show floating widget.
 */
export function hideGame() {
    if (DOM.gameContainer) DOM.gameContainer.classList.add('hidden');
    if (DOM.floatingWidget) DOM.floatingWidget.classList.remove('hidden');
    document.body.classList.remove('phd-game-open');
}

/**
 * Show the game container and hide floating widget.
 */
export function showGame() {
    if (DOM.gameContainer) DOM.gameContainer.classList.remove('hidden');
    if (DOM.floatingWidget) DOM.floatingWidget.classList.add('hidden');
    document.body.classList.add('phd-game-open');
}
