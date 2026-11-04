/**
 * Body Mass Index (BMI) and health category calculation utility.
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

  // Normal weight range: 18.5 <= BMI <= 24.9
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
