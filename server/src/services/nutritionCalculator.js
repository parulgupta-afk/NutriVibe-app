/**
 * Deterministic nutrition calculation service (Phase 2).
 * Never trusts AI-generated calorie/macro numbers.
 */

/**
 * Calculate nutrition for a given quantity from per-100g values.
 * Pro-rates calories, macronutrients, and fiber proportionally to grams consumed.
 * @param {Record<string, number>} per100g Nutritional components per 100 grams
 * @param {number} grams Actual weight consumed in grams
 * @returns {{ calories: number, protein: number, carbs: number, fat: number, fiber: number }}
 */
function calculateFromGrams(per100g, grams) {
  if (!per100g || !grams || grams <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }
  const factor = grams / 100;
  return {
    calories: Math.round((per100g.calories || 0) * factor * 10) / 10,
    protein: Math.round((per100g.protein || 0) * factor * 10) / 10,
    carbs: Math.round((per100g.carbs || 0) * factor * 10) / 10,
    fat: Math.round((per100g.fat || 0) * factor * 10) / 10,
    fiber: Math.round((per100g.fiber || 0) * factor * 10) / 10,
  };
}

/**
 * Sum nutrition across multiple meal items.
 * Computes aggregate total calories, protein, carbs, fat, and fiber safely handling missing values.
 * @param {Array<{nutrition?: object}>} items Meal items containing nutrition objects
 * @returns {{ calories: number, protein: number, carbs: number, fat: number, fiber: number }} Aggregated nutritional totals
 */
function sumNutrition(items) {
  return items.reduce(
    (acc, item) => {
      const n = item.nutrition || {};
      acc.calories += n.calories || 0;
      acc.protein += n.protein || 0;
      acc.carbs += n.carbs || 0;
      acc.fat += n.fat || 0;
      acc.fiber += n.fiber || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/**
 * Rounds nutritional totals to 1 decimal place for consistent UI display.
 * @param {Record<string, number>} totals Raw accumulated nutrition totals
 * @returns {{ calories: number, protein: number, carbs: number, fat: number, fiber: number }} Rounded totals
 */
function roundTotals(totals) {
  return {
    calories: Math.round((totals.calories || 0) * 10) / 10,
    protein: Math.round((totals.protein || 0) * 10) / 10,
    carbs: Math.round((totals.carbs || 0) * 10) / 10,
    fat: Math.round((totals.fat || 0) * 10) / 10,
    fiber: Math.round((totals.fiber || 0) * 10) / 10,
  };
}

module.exports = {
  calculateFromGrams,
  sumNutrition,
  roundTotals,
};
