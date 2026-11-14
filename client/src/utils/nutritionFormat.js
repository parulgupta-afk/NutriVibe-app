/**
 * Nutrition and macro formatting helpers for product detail & meal tracker.
 */

/**
 * Format numeric weight in grams rounded to 1 decimal place.
 * Returns provided fallback string when input is nullish or non-numeric.
 * @param {number|string|null} value Input weight in grams
 * @param {string} [fallback='0g'] Fallback string for invalid inputs
 * @returns {string} Formatted gram string (e.g. '12.5g')
 */
export function formatGrams(value, fallback = '0g') {
  if (value == null || value === '' || Number.isNaN(Number(value))) return fallback;
  const num = Number(value);
  return `${Math.round(num * 10) / 10}g`;
}

// Formats integer calorie value with unit suffix
export function formatCalories(value, fallback = '0 kcal') {
  if (value == null || value === '' || Number.isNaN(Number(value))) return fallback;
  const num = Math.round(Number(value));
  return `${num} kcal`;
}

/**
 * Converts sodium in grams to table salt equivalent (sodium * 2.5).
 * @param {number|string|null} sodiumGrams
 * @returns {number}
 */
export function sodiumToSalt(sodiumGrams) {
  if (sodiumGrams == null || Number.isNaN(Number(sodiumGrams))) return 0;
  return Math.round(Number(sodiumGrams) * 2.5 * 100) / 100;
}

/**
 * Calculate macro caloric and weight distribution percentages.
 * @param {{ protein?: number, carbs?: number, fat?: number }} macros
 * @returns {{ protein: number, carbs: number, fat: number }}
 */
export function calculateMacroPercentages({ protein = 0, carbs = 0, fat = 0 }) {
  const p = Math.max(0, Number(protein) || 0);
  const c = Math.max(0, Number(carbs) || 0);
  const f = Math.max(0, Number(fat) || 0);
  const totalGrams = p + c + f;

  if (totalGrams === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: Math.round((p / totalGrams) * 100),
    carbs: Math.round((c / totalGrams) * 100),
    fat: Math.round((f / totalGrams) * 100),
  };
}

