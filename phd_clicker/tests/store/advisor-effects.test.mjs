import test from 'node:test';
import assert from 'node:assert/strict';

import { GAME_DATA_EN } from '../../data/en.js';
import { LEGEND_ADVISORS_EN } from '../../data/legend_advisors_en.js';
import { LEGEND_ADVISORS_ZH } from '../../data/legend_advisors_zh.js';
import { TRAITS_EN } from '../../data/traits_en.js';
import { TRAITS_ZH } from '../../data/traits_zh.js';
import { Runtime, State, resetState } from '../../js/state.js';
import {
    getAdvisorModifiers,
    localizeCurrentAdvisor,
    selectAdvisor,
    validateConfiguration
} from '../../js/logic/advisor.js';

test('legacy effect targets map to real buildings and red penalties apply', () => {
    resetState();
    State.currentAdvisor = {
        traits: [
            { effect: { type: 'multiplier', target: 'claude_code', value: 1.5 } },
            { effect: { type: 'multiplier', target: 'arxiv', value: 1.4 } },
            { effect: { type: 'multiplier', target: 'collaborator', value: 1.2 } },
            { effect: { type: 'starting_bonus', target: '3090', value: 1 } },
            {
                effect: {
                    positive: { type: 'multiplier', target: 'manual_click', value: 1.55 },
                    negative: { type: 'multiplier', target: 'offline_cap', value: 0.5 }
                }
            },
            { effect: { type: 'additive', target: 'rebuttal_questions', value: 2 } },
            { effect: { type: 'additive', target: 'inflation_increase', value: 0.02 } }
        ]
    };

    const modifiers = getAdvisorModifiers();

    assert.equal(modifiers.buildingMultipliers.claude, 1.5);
    assert.equal(modifiers.buildingMultipliers.paper_mill, 1.4);
    assert.equal(modifiers.buildingMultipliers.big_name, 1.2);
    assert.deepEqual(modifiers.startingBonuses, [{ target: 'used3090', value: 1 }]);
    assert.equal(modifiers.manualClickMultiplier, 1.55);
    assert.equal(modifiers.offlineCapMultiplier, 0.5);
    assert.equal(modifiers.rebuttalQuestionAdditive, 2);
    assert.equal(modifiers.inflationReduction, 0.02);
});

test('the shipped English advisor data has no dead effect targets', () => {
    Runtime.buildingsConfig = GAME_DATA_EN.buildings;
    Runtime.traitsConfig = TRAITS_EN;
    Runtime.legendAdvisorsConfig = LEGEND_ADVISORS_EN;
    assert.deepEqual(validateConfiguration(), []);
});

test('advisor starting bonuses are applied once per generation', () => {
    resetState();
    const candidate = {
        id: 'starter',
        name: 'Starter Advisor',
        isLegend: false,
        traits: [{
            id: 'start-rp',
            effect: { type: 'starting_bonus', target: 'rp', value: 500 }
        }]
    };

    const first = selectAdvisor(candidate);
    const second = selectAdvisor(candidate);
    assert.equal(first.bonuses[0].value, 500);
    assert.equal(second, false);
    assert.equal(State.rp, 500);
    assert.equal(State.totalRp, 500);
    assert.equal(State.advisorBonusAppliedGeneration, State.generation);
});

test('locale changes rehydrate advisor display data without changing identity', () => {
    resetState();
    Runtime.traitsConfig = TRAITS_EN;
    Runtime.legendAdvisorsConfig = LEGEND_ADVISORS_EN;
    State.currentAdvisor = {
        id: 'hinton',
        name: LEGEND_ADVISORS_EN.hinton.name,
        title: LEGEND_ADVISORS_EN.hinton.title,
        desc: LEGEND_ADVISORS_EN.hinton.desc,
        isLegend: true,
        traits: LEGEND_ADVISORS_EN.hinton.traits.map(trait => ({
            ...trait,
            locked: trait.id === 'hinton_001'
        }))
    };

    State.currentLang = 'zh';
    Runtime.traitsConfig = TRAITS_ZH;
    Runtime.legendAdvisorsConfig = LEGEND_ADVISORS_ZH;
    const localized = localizeCurrentAdvisor();

    assert.equal(localized.id, 'hinton');
    assert.equal(localized.title, LEGEND_ADVISORS_ZH.hinton.title);
    assert.equal(localized.traits[0].name, LEGEND_ADVISORS_ZH.hinton.traits[0].name);
    assert.equal(localized.traits[0].locked, true);
});
