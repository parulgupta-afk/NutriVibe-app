const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  dayDiff,
  hasAchievement,
  ACHIEVEMENTS,
} = require('../src/services/streakService');

describe('streakService unit tests', () => {
  describe('dayDiff', () => {
    it('returns 0 for the same date', () => {
      assert.equal(dayDiff('2026-11-01', '2026-11-01'), 0);
    });

    it('returns 1 for consecutive days', () => {
      assert.equal(dayDiff('2026-11-01', '2026-11-02'), 1);
    });

    it('returns positive delta for multiple days apart', () => {
      assert.equal(dayDiff('2026-11-01', '2026-11-05'), 4);
    });

    it('returns negative delta when earlier date is passed second', () => {
      assert.equal(dayDiff('2026-11-05', '2026-11-01'), -4);
    });

    it('handles month and year boundaries correctly', () => {
      assert.equal(dayDiff('2026-10-31', '2026-11-01'), 1);
      assert.equal(dayDiff('2026-12-31', '2027-01-01'), 1);
    });
  });

  describe('hasAchievement', () => {
    it('returns false when streak has no achievements', () => {
      const streak = { achievements: [] };
      assert.equal(hasAchievement(streak, ACHIEVEMENTS.FIRST_MEAL.id), false);
    });

    it('returns true when achievement exists in list', () => {
      const streak = {
        achievements: [{ id: ACHIEVEMENTS.FIRST_MEAL.id, unlockedAt: new Date() }],
      };
      assert.equal(hasAchievement(streak, ACHIEVEMENTS.FIRST_MEAL.id), true);
    });

    it('returns false if achievements array is undefined', () => {
      const streak = {};
      assert.equal(hasAchievement(streak, ACHIEVEMENTS.HYDRATION_HERO.id), false);
    });
  });

  describe('ACHIEVEMENTS definitions', () => {
    it('defines standard milestones', () => {
      assert.ok(ACHIEVEMENTS.FIRST_MEAL);
      assert.ok(ACHIEVEMENTS.HYDRATION_HERO);
      assert.ok(ACHIEVEMENTS.SEVEN_DAY);
      assert.equal(ACHIEVEMENTS.SEVEN_DAY.id, '7_day_consistency');
    });
  });
});

