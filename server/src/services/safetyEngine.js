/**
 * Safety engine orchestrator.
 * Rules are modular; verdict remains deterministic. AI never decides safety.
 *
 * Canonical verdicts: SAFE, CAUTION, UNSAFE, CANNOT_VERIFY.
 * Top-level keeps level, score, factors, recommendations, and verdict.
 */

const {
  applyAllergenRules,
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData,
  hasContradictoryInformation,
  isMissingOrEmptyProduct,
  isUnreadableOrFailedOcr
} = require('../safety/rules/allergenRule');
const { applyDietRules } = require('../safety/rules/dietRule');
const { applyMedicationRules } = require('../safety/rules/medicationRule');
const { applyProcessingRules, buildNutritionSnapshot } = require('../safety/rules/processingRule');

const CANONICAL_VERDICTS = {
  SAFE: 'SAFE',
  CAUTION: 'CAUTION',
  UNSAFE: 'UNSAFE',
  CANNOT_VERIFY: 'CANNOT_VERIFY'
};

/**
 * Map raw rule status or legacy level string to canonical verdict.
 * @param {string} level Legacy or raw level name.
 * @returns {'SAFE'|'CAUTION'|'UNSAFE'|'CANNOT_VERIFY'}
 */
function normalizeVerdict(level) {
  switch (level) {
    case 'Unsafe':
    case 'UNSAFE':
      return CANONICAL_VERDICTS.UNSAFE;
    case 'Caution':
    case 'CAUTION':
      return CANONICAL_VERDICTS.CAUTION;
    case 'Unknown':
    case 'Cannot Verify':
    case 'CANNOT_VERIFY':
      return CANONICAL_VERDICTS.CANNOT_VERIFY;
    case 'Safe':
    case 'SAFE':
    default:
      return CANONICAL_VERDICTS.SAFE;
  }
}

/**
 * Computes deterministic safety assessment against user preferences.
 * @param {Object} product Product document or barcode lookup result.
 * @param {Object} user User profile or effective dependent profile.
 * @returns {Object} Canonical safety evaluation report.
 */
function computeSafetyVerdict(product, user) {
  const preferences = user?.preferences || user || {};
  const userAllergies = preferences.allergies || user?.allergies || [];
  const userRestrictions = preferences.dietaryRestrictions || user?.dietaryRestrictions || [];
  const medications = preferences.medications || user?.medications || [];

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

  // If state ended up as Unknown or has insufficient data, ensure score/level is Unknown
  if (state.level === 'Unknown' || state.level === 'Cannot Verify') {
    state.score = Math.min(state.score, 50);
  }

  const canonicalVerdict = normalizeVerdict(state.level);
  const nutrition = buildNutritionSnapshot(product || {});
  const processing = { level: product?.processingLevel || 'Unknown' };

  const reasons = state.factors.map((f) => f.impact || f.name);
  const ruleVersion = '2.2.0';

  const missingInputInformation = [];
  const hasIngredients = Boolean(
    product &&
    ((Array.isArray(product.ingredients) && product.ingredients.length > 0) ||
      (typeof product.ingredients === 'string' && product.ingredients.trim().length > 0))
  );
  const hasAllergens = Boolean(
    product &&
    ((Array.isArray(product.safetyInfo?.allergens) && product.safetyInfo.allergens.length > 0) ||
      (Array.isArray(product.allergens) && product.allergens.length > 0))
  );

  if (!hasIngredients) missingInputInformation.push('ingredients');
  if (!hasAllergens) missingInputInformation.push('allergens');

  const insufficient = hasInsufficientData(product, userAllergies);
  const dataCompleteness = insufficient
    ? 'INSUFFICIENT'
    : missingInputInformation.length > 0
      ? 'PARTIAL'
      : 'COMPLETE';

  return {
    // Canonical 4-verdict system
    verdict: canonicalVerdict,
    reasons,
    ruleVersion,
    dataCompleteness,
    missingInputInformation,
    // Backward-compatible top-level fields
    level: state.level,
    score: state.score,
    factors: state.factors,
    recommendations: state.recommendations,
    // Additive nested structures
    safety: {
      verdict: canonicalVerdict,
      level: state.level,
      score: state.score,
      factors: state.factors
    },
    nutrition,
    processing
  };
}

module.exports = {
  CANONICAL_VERDICTS,
  computeSafetyVerdict,
  normalizeVerdict,
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData,
  hasContradictoryInformation,
  isMissingOrEmptyProduct,
  isUnreadableOrFailedOcr
};
