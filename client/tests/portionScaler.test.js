import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scaleNutrition } from '../src/utils/portionScaler.js';

describe('client portionScaler utility tests', () => {
  const base100g = {
    calories: 200,
    protein: 10,
    carbs: 25,
    fat: 5,
    sugar: 4,
    fiber: 3,
    sodium: 0.2,
  };

  it('returns identical values for standard 100g portion', () => {
    const scaled = scaleNutrition(base100g, 100);
    assert.equal(scaled.calories, 200);
    assert.equal(scaled.protein, 10);
    assert.equal(scaled.carbs, 25);
    assert.equal(scaled.fat, 5);
    assert.equal(scaled.sodium, 0.2);
  });

  it('scales values proportionally for 250g serving', () => {
    const scaled = scaleNutrition(base100g, 250);
    assert.equal(scaled.calories, 500);
    assert.equal(scaled.protein, 25);
    assert.equal(scaled.carbs, 62.5);
    assert.equal(scaled.fat, 12.5);
    assert.equal(scaled.sodium, 0.5);
  });

  it('scales values down for 50g small snack portion', () => {
    const scaled = scaleNutrition(base100g, 50);
    assert.equal(scaled.calories, 100);
    assert.equal(scaled.protein, 5);
    assert.equal(scaled.carbs, 12.5);
  });

  it('handles empty or missing nutrition data safely with zero defaults', () => {
    const scaled = scaleNutrition({}, 150);
    assert.equal(scaled.calories, 0);
    assert.equal(scaled.protein, 0);
    assert.equal(scaled.carbs, 0);
  });

  it('clamps negative target grams safely to zero', () => {
    const scaled = scaleNutrition(base100g, -50);
    assert.equal(scaled.grams, 0);
    assert.equal(scaled.calories, 0);
    assert.equal(scaled.protein, 0);
  });

  it('handles zero target grams resulting in zero macros', () => {
    const scaled = scaleNutrition(base100g, 0);
    assert.equal(scaled.grams, 0);
    assert.equal(scaled.calories, 0);
  });

  it('handles fractional gram servings with precision', () => {
    const scaled = scaleNutrition(base100g, 150.5);
    assert.ok(scaled.calories > 0);
    assert.equal(scaled.grams, 150.5);
  });

  it('handles non-numeric target grams by falling back to zero', () => {
    const scaled = scaleNutrition(base100g, 'invalid');
    assert.equal(scaled.grams, 0);
    assert.equal(scaled.calories, 0);
  });

  it('handles empty base nutrition object returning zeros', () => {
    const scaled = scaleNutrition({}, 150);
    assert.equal(scaled.calories, 0);
    assert.equal(scaled.protein, 0);
  });

  it('defaults to 100g portion when targetGrams is omitted', () => {
    const scaled = scaleNutrition(base100g);
    assert.equal(scaled.grams, 100);
    assert.equal(scaled.calories, 200);
  });

  it('handles invocation with no arguments returning 100g zero macros', () => {
    const scaled = scaleNutrition();
    assert.equal(scaled.grams, 100);
    assert.equal(scaled.calories, 0);
  });

  it('handles undefined base nutrition parameter with custom target grams', () => {
    const scaled = scaleNutrition(undefined, 200);
    assert.equal(scaled.grams, 200);
    assert.equal(scaled.calories, 0);
  });

  it('scaleNutrition scales 100g portion exactly to 1x multiplier', () => {
    const base = { calories: 300 };
    const scaled = scaleNutrition(base, 100);
    assert.equal(scaled.calories, 300);
  });

  it('scaleNutrition scales 50g portion to half of base calories', () => {
    const base = { calories: 200 };
    const scaled = scaleNutrition(base, 50);
    assert.equal(scaled.calories, 100);
  });

  it('scaleNutrition scales 200g portion to double base calories', () => {
    const base = { calories: 150 };
    const scaled = scaleNutrition(base, 200);
    assert.equal(scaled.calories, 300);
  });
});

