/**
 * Hydration goal calculations and progress helpers.
 */

export function calculateDailyWaterGoal({ weightKg = 70, activityMinutes = 0 } = {}) {
  const baseMl = Math.max(30, Number(weightKg) || 70) * 35; // 35ml per kg base
  const activityMl = (Math.max(0, Number(activityMinutes) || 0) / 30) * 350; // 350ml per 30 mins exercise
  return Math.round(baseMl + activityMl);
}

export function calculateHydrationProgress(currentMl, targetMl = 2500) {
  const current = Math.max(0, Number(currentMl) || 0);
  const target = Math.max(1, Number(targetMl) || 2500);
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const remainingMl = Math.max(0, target - current);

  return {
    percentage,
    remainingMl,
    glassesRemaining: Math.ceil(remainingMl / 250), // 250ml per glass
    isGoalMet: current >= target,
  };
}
