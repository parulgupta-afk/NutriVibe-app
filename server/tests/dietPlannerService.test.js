const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { filterFoodsByPreferences } = require('../src/services/dietPlannerService');

describe('dietPlannerService unit tests', () => {
  const sampleFoods = [
    { name: 'Rolled Oats', aliases: ['oatmeal'] },
    { name: 'Paneer Bhurji', aliases: ['cottage cheese'] },
    { name: 'Chicken Breast', aliases: ['poultry'] },
    { name: 'Peanut Butter Toast', aliases: ['groundnut spread'] },
    { name: 'Yellow Moong Dal', aliases: ['lentils'] },
    { name: 'Hard Boiled Egg', aliases: ['anda'] },
    { name: 'Greek Yogurt', aliases: ['curd', 'dahi'] },
  ];

  it('keeps all items when no preferences or allergies are provided', () => {
    const result = filterFoodsByPreferences(sampleFoods, {});
    assert.equal(result.length, sampleFoods.length);
  });

  it('filters out dairy items when milk allergy is specified', () => {
    const result = filterFoodsByPreferences(sampleFoods, {
      allergies: ['milk'],
    });
    const names = result.map((f) => f.name);
    assert.ok(!names.includes('Paneer Bhurji'));
    assert.ok(!names.includes('Greek Yogurt'));
    assert.ok(names.includes('Rolled Oats'));
    assert.ok(names.includes('Yellow Moong Dal'));
  });

  it('filters out peanut items when peanut allergy is specified', () => {
    const result = filterFoodsByPreferences(sampleFoods, {
      allergies: ['peanut'],
    });
    const names = result.map((f) => f.name);
    assert.ok(!names.includes('Peanut Butter Toast'));
    assert.ok(names.includes('Yellow Moong Dal'));
  });

  it('filters out non-vegetarian foods for vegetarian dietType', () => {
    const result = filterFoodsByPreferences(sampleFoods, {
      dietType: 'Vegetarian',
    });
    const names = result.map((f) => f.name);
    assert.ok(!names.includes('Chicken Breast'));
    assert.ok(!names.includes('Hard Boiled Egg'));
    assert.ok(names.includes('Paneer Bhurji'));
    assert.ok(names.includes('Rolled Oats'));
  });

  it('combines allergy and vegetarian filters correctly', () => {
    const result = filterFoodsByPreferences(sampleFoods, {
      dietType: 'Vegetarian',
      allergies: ['milk', 'peanut'],
    });
    const names = result.map((f) => f.name);
    assert.deepEqual(names, ['Rolled Oats', 'Yellow Moong Dal']);
  });
});

