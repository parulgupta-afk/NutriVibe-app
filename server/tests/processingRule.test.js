const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { applyProcessingRules, buildNutritionSnapshot } = require('../src/safety/rules/processingRule');

describe('processingRule unit tests', () => {
  it('adds factor for ultra-processed food when state is Safe', () => {
    const product = { processingLevel: 'Ultra-Processed' };
    const initialState = {
      level: 'Safe',
      score: 90,
      factors: [],
      recommendations: []
    };

    const state = applyProcessingRules(product, initialState);
    assert.equal(state.factors.length, 1);
    assert.equal(state.factors[0].name, 'High processing level');
    assert.equal(state.recommendations[0], 'Consider less processed alternatives');
  });

  it('does not add recommendation if state is Unsafe', () => {
    const product = { processingLevel: 'Ultra-Processed' };
    const initialState = {
      level: 'Unsafe',
      score: 10,
      factors: [],
      recommendations: []
    };

    const state = applyProcessingRules(product, initialState);
    assert.equal(state.factors.length, 0);
    assert.equal(state.recommendations.length, 0);
  });

  it('buildNutritionSnapshot computes score and scales bounded between 0 and 100', () => {
    const healthy = {
      nutritionalInfo: {
        sugar: 2,
        fiber: 5,
        protein: 10,
        calories: 150
      }
    };
    const snap = buildNutritionSnapshot(healthy);
    assert.equal(snap.calories, 150);
    assert.equal(snap.fiber, 5);
    assert.equal(snap.protein, 10);
    assert.equal(snap.sugar, 2);
    assert.ok(snap.score >= 70);
  });

  it('buildNutritionSnapshot handles missing and invalid nutrition values safely', () => {
    const emptyProduct = {};
    const snap = buildNutritionSnapshot(emptyProduct);
    assert.equal(snap.calories, null);
    assert.equal(snap.protein, null);
    assert.equal(snap.sugar, null);
    assert.equal(snap.fiber, null);
    assert.equal(snap.score, 70);
  });
});
