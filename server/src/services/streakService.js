/**
 * Server-side streak calculation (Phase 3).
 * Uses localDate (YYYY-MM-DD) in the user's timezone.
 */
const Streak = require('../models/Streak');
const Meal = require('../models/Meal');
const HydrationLog = require('../models/HydrationLog');
const NutritionGoal = require('../models/NutritionGoal');

const ACHIEVEMENTS = {
  FIRST_MEAL: { id: 'first_meal', label: 'First Meal' },
  HYDRATION_HERO: { id: 'hydration_hero', label: 'Hydration Hero' },
  SEVEN_DAY: { id: '7_day_consistency', label: '7-Day Consistency' },
  BALANCED_WEEK: { id: 'balanced_week', label: 'Balanced Week' },
  WELLNESS_30: { id: 'wellness_journey_30', label: 'Wellness Journey' },
};

function dayDiff(dateA, dateB) {
  // Both YYYY-MM-DD
  const a = new Date(dateA + 'T00:00:00Z');
  const b = new Date(dateB + 'T00:00:00Z');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

async function getOrCreateStreak(userId) {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId });
  }
  return streak;
}

/**
 * Update meal logging streak after a meal is saved.
 */
async function updateMealStreak(userId, localDate) {
  const streak = await getOrCreateStreak(userId);
  const last = streak.mealLogging.lastDate;

  if (last === localDate) {
    // already counted today
    return streak;
  }

  if (!last) {
    streak.mealLogging.current = 1;
  } else {
    const diff = dayDiff(last, localDate);
    if (diff === 1) {
      streak.mealLogging.current += 1;
    } else if (diff > 1) {
      streak.mealLogging.current = 1; // reset, no shaming
    }
    // diff === 0 already handled
  }

  if (streak.mealLogging.current > streak.mealLogging.longest) {
    streak.mealLogging.longest = streak.mealLogging.current;
  }
  streak.mealLogging.lastDate = localDate;

  // Achievements
  if (streak.mealLogging.current === 1 && !hasAchievement(streak, ACHIEVEMENTS.FIRST_MEAL.id)) {
    streak.achievements.push({ id: ACHIEVEMENTS.FIRST_MEAL.id, unlockedAt: new Date() });
  }
  if (streak.mealLogging.current >= 7 && !hasAchievement(streak, ACHIEVEMENTS.SEVEN_DAY.id)) {
    streak.achievements.push({ id: ACHIEVEMENTS.SEVEN_DAY.id, unlockedAt: new Date() });
  }

  await streak.save();
  return streak;
}

/**
 * Update hydration streak when daily goal is met.
 */
async function updateHydrationStreak(userId, localDate, totalMl, goalMl) {
  if (totalMl < goalMl) return null;

  const streak = await getOrCreateStreak(userId);
  const last = streak.hydration.lastDate;

  if (last === localDate) return streak;

  if (!last) {
    streak.hydration.current = 1;
  } else {
    const diff = dayDiff(last, localDate);
    if (diff === 1) {
      streak.hydration.current += 1;
    } else if (diff > 1) {
      streak.hydration.current = 1;
    }
  }

  if (streak.hydration.current > streak.hydration.longest) {
    streak.hydration.longest = streak.hydration.current;
  }
  streak.hydration.lastDate = localDate;

  if (!hasAchievement(streak, ACHIEVEMENTS.HYDRATION_HERO.id)) {
    streak.achievements.push({ id: ACHIEVEMENTS.HYDRATION_HERO.id, unlockedAt: new Date() });
  }

  await streak.save();
  return streak;
}

function hasAchievement(streak, id) {
  return (streak.achievements || []).some((a) => a.id === id);
}

async function getStreakSummary(userId) {
  const streak = await getOrCreateStreak(userId);
  return {
    mealLogging: streak.mealLogging,
    hydration: streak.hydration,
    wellness: streak.wellness,
    totalActiveDays: streak.totalActiveDays,
    achievements: streak.achievements,
  };
}

module.exports = {
  updateMealStreak,
  updateHydrationStreak,
  getStreakSummary,
  ACHIEVEMENTS,
  dayDiff,
  hasAchievement,
};
