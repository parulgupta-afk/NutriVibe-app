/**
 * Processing-level rule (Engineering Phase 7).
 * Informational; does not override Unsafe.
 */
function applyProcessingRules(product, state) {
  if (product.processingLevel === 'Ultra-Processed' && state.level !== 'Unsafe') {
    state.factors.push({
      name: 'High processing level',
      impact: 'Ultra-processed food',
      severity: 40
    });
    if (state.level === 'Safe') {
      state.recommendations.push('Consider less processed alternatives');
    }
  }
  return state;
}

/**
 * Nutrition snapshot for Phase 8 separation (not a medical score).
 */
function buildNutritionSnapshot(product) {
  const n = product.nutritionalInfo || {};
  const sugar = Number(n.sugar);
  const fiber = Number(n.fiber);
  const protein = Number(n.protein);
  const calories = Number(n.calories);

  // Simple 0–100 heuristic for display only — NOT safety
  let score = 70;
  if (!Number.isNaN(sugar) && sugar > 15) score -= 15;
  if (!Number.isNaN(fiber) && fiber >= 3) score += 10;
  if (!Number.isNaN(protein) && protein >= 5) score += 5;
  if (!Number.isNaN(calories) && calories > 400) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    calories: Number.isNaN(calories) ? null : calories,
    protein: Number.isNaN(protein) ? null : protein,
    sugar: Number.isNaN(sugar) ? null : sugar,
    fiber: Number.isNaN(fiber) ? null : fiber
  };
}

module.exports = { applyProcessingRules, buildNutritionSnapshot };
