const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { applyMedicationRules } = require('../src/safety/rules/medicationRule');

describe('medicationRule unit tests', () => {
  it('returns state unchanged when medications list is empty or null', () => {
    const product = { name: 'Grapefruit Juice', ingredients_text: 'Grapefruit juice' };
    const initialState = {
      level: 'Safe',
      score: 100,
      factors: [],
      recommendations: []
    };

    const state = applyMedicationRules(product, [], initialState);
    assert.equal(state.level, 'Safe');
    assert.equal(state.score, 100);
    assert.equal(state.factors.length, 0);
  });

  it('escalates to Unsafe with reduced score when high severity interaction occurs', () => {
    const product = { name: 'Fresh Grapefruit', ingredients_text: '100% grapefruit' };
    const initialState = {
      level: 'Safe',
      score: 95,
      factors: [],
      recommendations: []
    };

    const state = applyMedicationRules(product, ['atorvastatin'], initialState);
    assert.equal(state.level, 'Unsafe');
    assert.ok(state.score <= 15);
    assert.ok(state.factors.length > 0);
    assert.ok(state.factors[0].name.includes('atorvastatin'));
    assert.equal(state.factors[0].severity, 95);
    assert.match(state.recommendations[0], /⚕️/);
  });

  it('keeps Unsafe level even if second interaction is medium severity', () => {
    const product = { name: 'Grapefruit Drink', ingredients_text: 'Grapefruit juice, potassium sorbate' };
    const initialState = {
      level: 'Unsafe',
      score: 10,
      factors: [{ name: 'Previous allergen', severity: 90 }],
      recommendations: []
    };

    const state = applyMedicationRules(product, ['lisinopril'], initialState);
    assert.equal(state.level, 'Unsafe');
    assert.equal(state.score, 10);
  });
});
