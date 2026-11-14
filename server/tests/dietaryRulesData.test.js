const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { DIETARY_RULES, checkDietaryRestrictions } = require('../src/data/dietaryRules');

describe('dietaryRules dataset and checker tests', () => {
  it('exports rules for standard diet classifications', () => {
    assert.ok(Array.isArray(DIETARY_RULES));
    assert.ok(DIETARY_RULES.length >= 5);
    const vegan = DIETARY_RULES.find((r) => r.matchNames.includes('vegan'));
    assert.ok(vegan);
    assert.ok(vegan.forbiddenKeywords.includes('meat'));
  });

  it('detects forbidden non-vegan ingredients in product text', () => {
    const product = {
      name: 'Milk Chocolate Bar',
      ingredients_text: 'Sugar, milk powder, cocoa butter, milk fat',
      ingredients: [{ text: 'milk powder' }]
    };
    const conflicts = checkDietaryRestrictions(['vegan'], product);
    assert.ok(conflicts.length > 0);
    const hit = conflicts.find((c) => c.restriction.toLowerCase() === 'vegan');
    assert.ok(hit);
    assert.match(hit.message, /May contain animal-derived ingredients/);
  });

  it('allows plant milk exemptions for vegan rule', () => {
    const product = {
      name: 'Almond Breeze',
      ingredients_text: 'Almond milk (water, almonds), calcium carbonate',
      ingredients: [{ text: 'almond milk' }]
    };
    const conflicts = checkDietaryRestrictions(['vegan'], product);
    const directHit = conflicts.find((c) => c.matchedIngredients?.includes('milk'));
    assert.equal(directHit, undefined);
  });

  it('returns empty array when user specifies no restrictions', () => {
    const product = { name: 'Apple', ingredients_text: 'Fresh apple' };
    assert.deepEqual(checkDietaryRestrictions([], product), []);
  });

  it('returns uncertified advisory for custom unrecognized restriction', () => {
    const product = { name: 'Apple', ingredients_text: 'Fresh apple' };
    const conflicts = checkDietaryRestrictions(['SpaceDiet'], product);
    assert.equal(conflicts.length, 1);
    assert.match(conflicts[0].message, /No clear "SpaceDiet" certification/);
    assert.equal(conflicts[0].severity, 20);
  });

  it('returns no conflicts when product has preferred certification', () => {
    const product = {
      name: 'Vegan Bar',
      ingredients_text: 'Oats, nuts',
      safetyInfo: { certifications: ['vegan'] }
    };
    assert.deepEqual(checkDietaryRestrictions(['vegan'], product), []);
  });
});
