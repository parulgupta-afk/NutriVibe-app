const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateFromGrams,
  sumNutrition,
  roundTotals,
} = require('../src/services/nutritionCalculator');

describe('nutritionCalculator edge cases and boundary conditions', () => {
  it('handles zero, negative, and null grams safely', () => {
    const per100g = { calories: 250, protein: 10, carbs: 30, fat: 5, fiber: 2 };
    const expectedZero = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    assert.deepEqual(calculateFromGrams(per100g, 0), expectedZero);
    assert.deepEqual(calculateFromGrams(per100g, -50), expectedZero);
    assert.deepEqual(calculateFromGrams(per100g, null), expectedZero);
    assert.deepEqual(calculateFromGrams(null, 100), expectedZero);
    assert.deepEqual(calculateFromGrams(undefined, undefined), expectedZero);
  });

  it('handles partial macro objects without NaN', () => {
    const partial = { calories: 100 }; // missing protein, carbs, fat, fiber
    const scaled = calculateFromGrams(partial, 200);

    assert.equal(scaled.calories, 200);
    assert.equal(scaled.protein, 0);
    assert.equal(scaled.carbs, 0);
    assert.equal(scaled.fat, 0);
    assert.equal(scaled.fiber, 0);
  });

  it('scales fractions and avoids floating point expansion', () => {
    const per100g = { calories: 155.33, protein: 8.67, carbs: 22.45, fat: 4.11, fiber: 3.33 };
    const scaled = calculateFromGrams(per100g, 33.33);

    assert.equal(typeof scaled.calories, 'number');
    assert.equal(scaled.calories, 51.8);
    assert.equal(scaled.protein, 2.9);
  });

  it('sums multiple items even when items contain undefined nutrition', () => {
    const items = [
      { name: 'Item 1', nutrition: { calories: 150, protein: 10, carbs: 20, fat: 2, fiber: 1 } },
      { name: 'Item 2', nutrition: null },
      { name: 'Item 3' },
      { name: 'Item 4', nutrition: { calories: 50, protein: 2, carbs: 10, fat: 1, fiber: 0 } },
    ];

    const sum = sumNutrition(items);
    assert.equal(sum.calories, 200);
    assert.equal(sum.protein, 12);
    assert.equal(sum.carbs, 30);
    assert.equal(sum.fat, 3);
    assert.equal(sum.fiber, 1);
  });

  it('correctly rounds totals to 1 decimal place', () => {
    const rawTotals = {
      calories: 333.333333,
      protein: 25.456,
      carbs: 45.12,
      fat: 10.04,
      fiber: 5.67,
    };

    const rounded = roundTotals(rawTotals);
    assert.equal(rounded.calories, 333.3);
    assert.equal(rounded.protein, 25.5);
    assert.equal(rounded.carbs, 45.1);
    assert.equal(rounded.fat, 10.0);
    assert.equal(rounded.fiber, 5.7);
  });

  it('handles empty items array in sumNutrition safely', () => {
    const sum = sumNutrition([]);
    assert.deepEqual(sum, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  });
});

