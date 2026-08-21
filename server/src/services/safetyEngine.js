/**
 * Safety engine orchestrator (Engineering Phase 7).
 * Rules are modular; verdict remains deterministic. AI never decides safety.
 *
 * Phase 8: returns nested safety / nutrition / processing while keeping
 * top-level level, score, factors, recommendations for existing clients.
 */

const { applyAllergenRules, findMatchingAllergens, hasRelevantCrossContamination, hasInsufficientData } = require('../safety/rules/allergenRule');
const { applyDietRules } = require('../safety/rules/dietRule');
const { applyMedicationRules } = require('../safety/rules/medicationRule');
const { applyProcessingRules, buildNutritionSnapshot } = require('../safety/rules/processingRule');

function computeSafetyVerdict(product, user) {
  const preferences = user?.preferences || {};
  const userAllergies = preferences.allergies || [];
  const userRestrictions = preferences.dietaryRestrictions || [];
  const medications = preferences.medications || [];

  const state = {
    level: 'Safe',
    score: 100,
    factors: [],
    recommendations: []
  };

  applyAllergenRules(product, userAllergies, state);
  applyProcessingRules(product, state);
  applyDietRules(product, userRestrictions, state);
  applyMedicationRules(product, medications, state);

  const nutrition = buildNutritionSnapshot(product);
  const processing = { level: product.processingLevel || 'Unknown' };

  return {
    // Legacy top-level (frontend / generateSafetyReport)
    level: state.level,
    score: state.score,
    factors: state.factors,
    recommendations: state.recommendations,
    // Phase 8 structured split (additive)
    safety: {
      level: state.level,
      score: state.score,
      factors: state.factors
    },
    nutrition,
    processing
  };
}

module.exports = {
  computeSafetyVerdict,
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData
};
