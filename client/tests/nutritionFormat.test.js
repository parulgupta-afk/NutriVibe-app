import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGrams,
  formatCalories,
  sodiumToSalt,
  calculateMacroPercentages,
} from '../src/utils/nutritionFormat.js';

describe('client nutritionFormat utility tests', () => {
  it('formats grams rounded to one decimal place', () => {
    assert.equal(formatGrams(12.456), '12.5g');
    assert.equal(formatGrams('8.2'), '8.2g');
    assert.equal(formatGrams(null), '0g');
    assert.equal(formatGrams(undefined, '-'), '-');
  });

  it('formats calories rounded to nearest whole number', () => {
    assert.equal(formatCalories(250.6), '251 kcal');
    assert.equal(formatCalories('180'), '180 kcal');
    assert.equal(formatCalories(null), '0 kcal');
  });

  it('converts sodium grams to salt grams (2.5 multiplier)', () => {
    assert.equal(sodiumToSalt(1), 2.5);
    assert.equal(sodiumToSalt(0.4), 1);
    assert.equal(sodiumToSalt(null), 0);
  });

  it('calculates macro percentage distribution accurately', () => {
    const macros = calculateMacroPercentages({ protein: 25, carbs: 50, fat: 25 });
    assert.equal(macros.protein, 25);
    assert.equal(macros.carbs, 50);
    assert.equal(macros.fat, 25);
  });

  it('handles zero total macros gracefully without division by zero', () => {
    const empty = calculateMacroPercentages({ protein: 0, carbs: 0, fat: 0 });
    assert.deepEqual(empty, { protein: 0, carbs: 0, fat: 0 });
  });
});

