/**
 * Phase 7–8: modular rules still export the same verdict + additive structure.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeSafetyVerdict } = require('../src/services/safetyEngine');

const user = (prefs = {}) => ({
  preferences: {
    allergies: [],
    dietaryRestrictions: [],
    medications: [],
    ...prefs
  }
});

const product = (over = {}) => ({
  name: 'Test',
  ingredients: [],
  nutritionalInfo: { calories: 100, protein: 2, sugar: 5, fiber: 1 },
  processingLevel: 'Processed',
  safetyInfo: { allergens: [], warnings: [], certifications: [] },
  ...over
});

describe('Phase 8 structure', () => {
  it('keeps legacy level/score and adds safety/nutrition/processing', () => {
    const v = computeSafetyVerdict(product(), user());
    assert.ok(['Safe', 'Caution', 'Unsafe', 'Unknown'].includes(v.level));
    assert.equal(typeof v.score, 'number');
    assert.ok(Array.isArray(v.factors));
    assert.ok(Array.isArray(v.recommendations));
    assert.equal(v.safety.level, v.level);
    assert.equal(v.safety.score, v.score);
    assert.ok(v.nutrition);
    assert.equal(typeof v.nutrition.score, 'number');
    assert.equal(v.processing.level, 'Processed');
  });

  it('still marks dairy product Unsafe for dairy allergy', () => {
    const v = computeSafetyVerdict(
      product({
        ingredients: ['Skim milk'],
        safetyInfo: { allergens: ['Dairy'], warnings: [], certifications: [] }
      }),
      user({ allergies: ['dairy'] })
    );
    assert.equal(v.level, 'Unsafe');
    assert.equal(v.safety.level, 'Unsafe');
  });
});
