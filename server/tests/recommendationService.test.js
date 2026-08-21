const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { rankRecommendations, WEIGHTS } = require('../src/services/recommendationService');

const user = (prefs = {}) => ({
  preferences: { allergies: [], dietaryRestrictions: [], medications: [], ...prefs }
});

const product = (over = {}) => ({
  _id: 'base',
  name: 'Base',
  brand: 'A',
  barcode: 'b',
  category: 'Food',
  ingredients: [],
  processingLevel: 'Processed',
  safetyInfo: { allergens: [], warnings: [], certifications: [] },
  ...over
});

describe('rankRecommendations', () => {
  it('documents weights', () => {
    assert.equal(WEIGHTS.levelSafe, 100);
    assert.equal(WEIGHTS.levelCaution, 40);
  });

  it('excludes Unsafe and prefers Safe', () => {
    const base = product();
    const candidates = [
      product({
        _id: 'u',
        barcode: 'u',
        name: 'Milk',
        ingredients: ['Milk'],
        safetyInfo: { allergens: ['Dairy'], warnings: [], certifications: [] }
      }),
      product({
        _id: 's',
        barcode: 's',
        name: 'Oats',
        ingredients: ['Oats'],
        safetyInfo: { allergens: [], warnings: [], certifications: [] }
      })
    ];
    const ranked = rankRecommendations(base, candidates, user({ allergies: ['dairy'] }));
    assert.ok(ranked.every((c) => c.safetyLevel !== 'Unsafe'));
    assert.ok(ranked.some((c) => c.barcode === 's'));
    assert.ok(ranked[0].scoreBreakdown);
  });
});
