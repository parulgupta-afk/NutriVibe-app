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

  it('flags pickle, pickles, and achar with MAOI medications as high severity', () => {
    const limePickleMatches = checkMedicationInteractions(
      ['tranylcypromine'],
      productWith(['Lime Pieces', 'Salt', 'Mustard Oil', 'Spices'], 'Lime Pickle')
    );
    assert.ok(limePickleMatches.length >= 1);
    assert.ok(limePickleMatches.some((m) => m.severity === 'high'));

    const mixedPicklesMatches = checkMedicationInteractions(
      ['phenelzine'],
      productWith(['mixed pickles', 'oil', 'salt'], 'Mixed Pickles')
    );
    assert.ok(mixedPicklesMatches.length >= 1);
    assert.ok(mixedPicklesMatches.some((m) => m.severity === 'high'));

    const mangoAcharMatches = checkMedicationInteractions(
      ['selegiline'],
      productWith(['raw mango', 'achar masala', 'mustard oil'], 'Mango Achar')
    );
    assert.ok(mangoAcharMatches.length >= 1);
    assert.ok(mangoAcharMatches.some((m) => m.severity === 'high'));
  });
});
