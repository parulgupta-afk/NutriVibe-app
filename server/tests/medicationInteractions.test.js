/**
 * Phase 11: medication–food interaction unit tests
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { checkMedicationInteractions } = require('../src/data/medicationInteractions');

const productWith = (ingredients, name = 'Test') => ({
  name,
  ingredients,
  safetyInfo: { allergens: [], warnings: [], certifications: [] }
});

describe('checkMedicationInteractions', () => {
  it('flags grapefruit with atorvastatin as high', () => {
    const matches = checkMedicationInteractions(
      ['atorvastatin'],
      productWith(['Grapefruit juice'], 'Grapefruit Juice')
    );
    assert.ok(matches.length >= 1);
    assert.ok(matches.some((m) => m.severity === 'high'));
  });

  it('returns empty for unrelated product', () => {
    const matches = checkMedicationInteractions(
      ['atorvastatin'],
      productWith(['Water', 'Oats'], 'Oat Milk')
    );
    assert.equal(matches.length, 0);
  });

  it('handles empty medications', () => {
    const matches = checkMedicationInteractions([], productWith(['Grapefruit']));
    assert.equal(matches.length, 0);
  });

  it('is case-insensitive on medication names', () => {
    const matches = checkMedicationInteractions(
      ['ATORVASTATIN'],
      productWith(['grapefruit juice'])
    );
    assert.ok(matches.length >= 1);
  });
});
