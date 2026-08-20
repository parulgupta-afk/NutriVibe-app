/**
 * Phase 2: unit tests for safety verdict logic.
 * Run from server/:  npm test
 * Uses Node's built-in test runner (no extra packages).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { computeSafetyVerdict } = require('../src/services/safetyEngine');
const { normalizeAllergy, detectAllergensInText } = require('../src/data/allergenKeywords');
const { checkDietaryRestrictions } = require('../src/data/dietaryRules');

const baseUser = (overrides = {}) => ({
  preferences: {
    allergies: [],
    dietaryRestrictions: [],
    medications: [],
    healthGoals: [],
    ...overrides
  }
});

const baseProduct = (overrides = {}) => ({
  name: 'Test Product',
  brand: 'Test',
  ingredients: [],
  safetyInfo: {
    allergens: [],
    warnings: [],
    certifications: [],
    riskLevel: 'Unknown'
  },
  processingLevel: 'Processed',
  ...overrides
});

describe('normalizeAllergy', () => {
  it('maps peanut variants to Peanuts', () => {
    assert.deepEqual(normalizeAllergy('peanut'), ['Peanuts']);
    assert.ok(normalizeAllergy('I have a peanut allergy').includes('Peanuts'));
  });

  it('maps dairy', () => {
    assert.deepEqual(normalizeAllergy('dairy'), ['Dairy']);
  });
});

describe('detectAllergensInText', () => {
  it('detects dairy in yogurt ingredients', () => {
    const found = detectAllergensInText('Cultured skim milk, cream');
    assert.ok(found.includes('Dairy'));
  });

  it('does not treat oat milk as Dairy', () => {
    const found = detectAllergensInText('oat milk water oats salt');
    assert.ok(!found.includes('Dairy'));
  });
});

describe('computeSafetyVerdict', () => {
  it('marks Unsafe when allergen matches', () => {
    const product = baseProduct({
      safetyInfo: {
        allergens: ['Dairy'],
        warnings: [],
        certifications: [],
        riskLevel: 'Caution'
      },
      ingredients: ['Skim milk']
    });
    const user = baseUser({ allergies: ['dairy'] });
    const v = computeSafetyVerdict(product, user);
    assert.equal(v.level, 'Unsafe');
    assert.ok(v.score <= 30);
  });

  it('returns Unknown for empty product data', () => {
    const product = baseProduct();
    const user = baseUser({ allergies: ['peanuts'] });
    const v = computeSafetyVerdict(product, user);
    assert.equal(v.level, 'Unknown');
  });

  it('flags high medication interaction as Unsafe', () => {
    const product = baseProduct({
      name: 'Grapefruit Juice',
      ingredients: ['Grapefruit juice'],
      safetyInfo: { allergens: [], warnings: [], certifications: [], riskLevel: 'Unknown' }
    });
    const user = baseUser({ medications: ['atorvastatin'] });
    const v = computeSafetyVerdict(product, user);
    assert.equal(v.level, 'Unsafe');
  });

  it('keeps oat milk Safe for dairy allergy', () => {
    const product = baseProduct({
      name: 'Oat Milk',
      ingredients: ['Water', 'Oats', 'Salt'],
      safetyInfo: {
        allergens: [],
        warnings: [],
        certifications: ['Vegan'],
        riskLevel: 'Unknown'
      }
    });
    const user = baseUser({ allergies: ['dairy'], dietaryRestrictions: ['vegan'] });
    const v = computeSafetyVerdict(product, user);
    assert.equal(v.level, 'Safe');
  });
});

describe('checkDietaryRestrictions', () => {
  it('flags milk product for vegan user', () => {
    const product = baseProduct({
      ingredients: ['Skim milk', 'Cultures'],
      safetyInfo: { allergens: ['Dairy'], warnings: [], certifications: [], riskLevel: 'Caution' }
    });
    const conflicts = checkDietaryRestrictions(['vegan'], product);
    assert.ok(conflicts.length > 0);
  });

  it('accepts vegan-certified product', () => {
    const product = baseProduct({
      ingredients: ['Water', 'Oats'],
      safetyInfo: {
        allergens: [],
        warnings: [],
        certifications: ['Vegan'],
        riskLevel: 'Unknown'
      }
    });
    const conflicts = checkDietaryRestrictions(['vegan'], product);
    assert.equal(conflicts.length, 0);
  });
});
