const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateFromGrams,
  sumNutrition,
  roundTotals,
} = require('../src/services/nutritionCalculator');

describe('nutritionCalculator', () => {
  it('scales per100g correctly', () => {
    const n = calculateFromGrams(
      { calories: 265, protein: 18, carbs: 3, fat: 20, fiber: 0 },
      50
    );
    assert.equal(n.calories, 132.5);
    assert.equal(n.protein, 9);
  });

  it('returns zeros for invalid input', () => {
    assert.deepEqual(calculateFromGrams(null, 100), {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    });
  });

  it('sums and rounds totals', () => {
    const sum = sumNutrition([
      { nutrition: { calories: 100.15, protein: 10.15, carbs: 1, fat: 1, fiber: 1 } },
      { nutrition: { calories: 50.15, protein: 5.15, carbs: 1, fat: 1, fiber: 1 } },
    ]);
    const r = roundTotals(sum);
    assert.equal(r.calories, 150.3);
    assert.equal(r.protein, 15.3);
  });
});
