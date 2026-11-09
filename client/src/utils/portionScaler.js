/**
 * Portion scaler for dynamic nutritional calculations on custom servings.
 */

/**
 * Dynamically scale base 100g nutritional macros to custom portion weight.
 * @param {Record<string, number>} [base100g={}]
 * @param {number} [targetGrams=100]
 * @returns {object}
 */
export function scaleNutrition(base100g = {}, targetGrams = 100) {
  // Rounds calories to nearest integer and macros to 1 decimal place
  const target = Math.max(0, Number(targetGrams) || 0);
  const factor = target / 100;

  const calories = base100g.calories != null ? Math.round(Number(base100g.calories) * factor) : 0;
  const protein = base100g.protein != null ? Math.round(Number(base100g.protein) * factor * 10) / 10 : 0;
  const carbs = base100g.carbs != null ? Math.round(Number(base100g.carbs) * factor * 10) / 10 : 0;
  const fat = base100g.fat != null ? Math.round(Number(base100g.fat) * factor * 10) / 10 : 0;
  const sugar = base100g.sugar != null ? Math.round(Number(base100g.sugar) * factor * 10) / 10 : 0;
  const fiber = base100g.fiber != null ? Math.round(Number(base100g.fiber) * factor * 10) / 10 : 0;
  const sodium = base100g.sodium != null ? Math.round(Number(base100g.sodium) * factor * 100) / 100 : 0;

  return {
    grams: target,
    calories,
    protein,
    carbs,
    fat,
    sugar,
    fiber,
    sodium,
  };
}

