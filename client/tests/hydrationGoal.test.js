import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDailyWaterGoal,
  calculateHydrationProgress,
} from '../src/utils/hydrationGoal.js';

describe('client hydrationGoal utility tests', () => {
  it('calculates water goal based on body weight and physical activity', () => {
    // 70kg * 35 = 2450ml; 60 mins activity = 700ml; total = 3150ml
    const goal = calculateDailyWaterGoal({ weightKg: 70, activityMinutes: 60 });
    assert.equal(goal, 3150);
  });

  it('provides default fallback water goal when inputs are omitted', () => {
    const goal = calculateDailyWaterGoal({});
    assert.equal(goal, 2450);
  });

  it('calculates progress percentage and remaining glasses accurately', () => {
    const progress = calculateHydrationProgress(1500, 2500);
    assert.equal(progress.percentage, 60);
    assert.equal(progress.remainingMl, 1000);
    assert.equal(progress.glassesRemaining, 4);
    assert.equal(progress.isGoalMet, false);
  });

  it('marks isGoalMet as true and caps percentage at 100 when goal is reached or exceeded', () => {
    const progress = calculateHydrationProgress(3000, 2500);
    assert.equal(progress.percentage, 100);
    assert.equal(progress.remainingMl, 0);
    assert.equal(progress.glassesRemaining, 0);
    assert.equal(progress.isGoalMet, true);
  });
});
