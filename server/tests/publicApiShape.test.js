const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeSafetyVerdict } = require('../src/services/safetyEngine');

describe('public check shape', () => {
  it('returns structured verdict for ingredients + allergy', () => {
    const product = { name: 'test', ingredients: ['whey protein', 'sugar'], allergens: [] };
    const user = { preferences: { allergies: ['Dairy'], medications: [], dietaryRestrictions: [] } };
    const v = computeSafetyVerdict(product, user);
    assert.ok(v.level);
    assert.ok(typeof v.score === 'number');
    assert.ok(Array.isArray(v.factors));
  });

  it('returns CANNOT_VERIFY when product has empty ingredients and no metadata', () => {
    const product = { name: '', ingredients: [] };
    const user = { preferences: { allergies: ['Dairy'], medications: [], dietaryRestrictions: [] } };
    const v = computeSafetyVerdict(product, user);
    assert.equal(v.verdict, 'CANNOT_VERIFY');
  });
});
