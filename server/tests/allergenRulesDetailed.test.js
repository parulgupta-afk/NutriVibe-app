const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData,
} = require('../src/safety/rules/allergenRule');

describe('allergenRule detailed unit tests', () => {
  it('detects direct allergen match for dairy allergy in milk products', () => {
    const product = {
      name: 'Whole Milk Yogurt',
      ingredients: ['Cultured Pasteurized Grade A Milk', 'Cream'],
      safetyInfo: { allergens: ['Milk'] },
    };

    const matches = findMatchingAllergens(product, ['Dairy']);
    assert.ok(matches.length > 0);
  });

  it('avoids false positive on plant milks for dairy allergic users', () => {
    const product = {
      name: 'Organic Oat Milk',
      ingredients: ['Oat Base (Water, Oats)', 'Sunflower Oil', 'Sea Salt'],
      safetyInfo: { allergens: [] },
    };

    const matches = findMatchingAllergens(product, ['Dairy']);
    assert.equal(matches.length, 0);
  });

  it('identifies cross-contamination traces matching user allergies', () => {
    const product = {
      name: 'Dark Chocolate Bar',
      ingredients: ['Cocoa Beans', 'Cane Sugar', 'Cocoa Butter'],
      safetyInfo: {
        allergens: [],
        warnings: ['May contain traces of peanuts and tree nuts'],
      },
    };

    const hasTraces = hasRelevantCrossContamination(product, ['Peanuts']);
    assert.equal(hasTraces, true);

    const hasNoTraces = hasRelevantCrossContamination(product, ['Shellfish']);
    assert.equal(hasNoTraces, false);
  });

  it('detects insufficient data when product has no ingredients or safety info', () => {
    const thinProduct = {
      name: 'Unbranded Item',
      ingredients: [],
      safetyInfo: { allergens: [], warnings: [] },
    };

    assert.equal(hasInsufficientData(thinProduct), true);

    const completeProduct = {
      name: 'Granola',
      ingredients: ['Rolled Oats', 'Honey', 'Raisins'],
      safetyInfo: { allergens: [] },
    };

    assert.equal(hasInsufficientData(completeProduct), false);
  });

  it('returns empty array when user allergies list is empty', () => {
    const product = { name: 'Peanut Butter', ingredients: ['Peanuts', 'Salt'] };
    assert.deepEqual(findMatchingAllergens(product, []), []);
  });

  it('returns false for hasRelevantCrossContamination when product is null', () => {
    assert.equal(hasRelevantCrossContamination(null, ['Peanuts']), false);
  });
});

