import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBmi } from '../src/utils/bmiCalculator.js';

describe('client bmiCalculator utility tests', () => {
  it('calculates Normal BMI accurately for standard proportions', () => {
    // 70kg, 175cm -> BMI = 70 / (1.75 * 1.75) = 22.9
    const res = calculateBmi(70, 175);
    assert.equal(res.bmi, 22.9);
    assert.equal(res.category, 'Normal');
    assert.ok(res.healthyWeightRange.min > 50);
    assert.ok(res.healthyWeightRange.max < 80);
  });

  it('categorizes Underweight for BMI < 18.5', () => {
    const res = calculateBmi(45, 170);
    assert.equal(res.category, 'Underweight');
  });

  it('categorizes Overweight for BMI between 25 and 29.9', () => {
    const res = calculateBmi(85, 175);
    assert.equal(res.category, 'Overweight');
  });

  it('categorizes Obese for BMI >= 30', () => {
    const res = calculateBmi(105, 175);
    assert.equal(res.category, 'Obese');
  });

  it('categorizes Obese for extreme high body weight', () => {
    const res = calculateBmi(150, 160);
    assert.equal(res.category, 'Obese');
    assert.ok(res.bmi > 50);
  });

  it('handles zero, negative, or missing inputs safely', () => {
    const res1 = calculateBmi(0, 175);
    assert.equal(res1.bmi, null);
    assert.equal(res1.category, 'Unknown');

    const res2 = calculateBmi(null, null);
    assert.equal(res2.bmi, null);

    const res3 = calculateBmi(-70, 175);
    assert.equal(res3.bmi, null);
    assert.equal(res3.category, 'Unknown');

    const res4 = calculateBmi('invalid', 'height');
    assert.equal(res4.bmi, null);
    assert.equal(res4.category, 'Unknown');
  });

  it('handles NaN and non-finite numbers safely', () => {
    const res = calculateBmi(Number.NaN, 175);
    assert.equal(res.category, 'Unknown');
  });

  it('handles negative height values returning Unknown', () => {
    const result = calculateBmi(70, -175);
    assert.equal(result.bmi, null);
    assert.equal(result.category, 'Unknown');
  });
});

