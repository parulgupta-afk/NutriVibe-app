/**
 * Body Mass Index (BMI) and health category calculation utility.
 */

/**
 * Calculate BMI and return categorization with healthy weight boundaries.
 * @param {number|string} weightKg
 * @param {number|string} heightCm
 * @returns {{ bmi: number|null, category: string, healthyWeightRange: { min: number, max: number }|null }}
 */
export function calculateBmi(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);

  if (!w || !h || w <= 0 || h <= 0) {
    return {
      bmi: null,
      category: 'Unknown',
      healthyWeightRange: null,
    };
  }

  const heightMeters = h / 100;
  const bmi = Math.round((w / (heightMeters * heightMeters)) * 10) / 10;

  // Canonical BMI thresholds: Underweight < 18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese >= 30
  const minNormalWeight = Math.round(18.5 * heightMeters * heightMeters * 10) / 10;
  const maxNormalWeight = Math.round(24.9 * heightMeters * heightMeters * 10) / 10;

  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';

  return {
    bmi,
    category,
    healthyWeightRange: { min: minNormalWeight, max: maxNormalWeight },
  };
}

