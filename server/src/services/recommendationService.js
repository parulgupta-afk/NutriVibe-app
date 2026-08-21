/**
 * Phase 12: explainable alternative ranking.
 *
 * recommendationScore =
 *   safetyScore * 1.0
 *   + levelBoost (Safe=100, Caution=40, Unsafe=0)
 *   + processingBoost (0–20)
 *   + brandBoost (0 or 3)
 *
 * Weights chosen so Safe always outranks Caution when scores are similar,
 * and processing/brand only fine-tune within the same safety level.
 * Deterministic — no ML.
 */

const { computeSafetyVerdict } = require('./safetyEngine');

const WEIGHTS = {
  safetyScore: 1.0,
  levelSafe: 100,
  levelCaution: 40,
  levelUnsafe: 0,
  processingPerStep: 5, // Unprocessed=4 → +20 max
  sameBrand: 3
};

const PROCESSING_RANK = {
  Unprocessed: 4,
  'Processed Culinary Ingredient': 3,
  Processed: 2,
  'Ultra-Processed': 1,
  Unknown: 0
};

function levelBoost(level) {
  if (level === 'Safe') return WEIGHTS.levelSafe;
  if (level === 'Caution') return WEIGHTS.levelCaution;
  return WEIGHTS.levelUnsafe;
}

/**
 * Rank candidates for a base product + user profile.
 * Returns at most `limit` Safe/Caution items (never Unsafe).
 */
function rankRecommendations(product, candidates, user, limit = 5) {
  const evaluated = candidates.map((candidate) => {
    const plain =
      typeof candidate.toObject === 'function' ? candidate.toObject() : { ...candidate };
    const verdict = computeSafetyVerdict(candidate, user);
    const processBoost =
      (PROCESSING_RANK[candidate.processingLevel] || 0) * WEIGHTS.processingPerStep;
    const brandBoost =
      candidate.brand && product.brand && candidate.brand === product.brand
        ? WEIGHTS.sameBrand
        : 0;
    const rankScore =
      (verdict.score || 0) * WEIGHTS.safetyScore +
      levelBoost(verdict.level) +
      processBoost +
      brandBoost;

    let swapReason;
    if (verdict.level === 'Safe' && verdict.factors.length === 0) {
      swapReason = 'No allergen or medication conflicts for your profile';
    } else if (verdict.level === 'Safe') {
      swapReason = verdict.recommendations[0] || 'Safer match for your profile';
    } else {
      swapReason =
        verdict.recommendations[0] ||
        'Lower risk than the current product for your profile';
    }

    return {
      ...plain,
      safetyLevel: verdict.level,
      safetyScore: verdict.score,
      rankScore,
      barcode: candidate.barcode,
      swapReason,
      scoreBreakdown: {
        safetyScore: verdict.score || 0,
        levelBoost: levelBoost(verdict.level),
        processBoost,
        brandBoost
      }
    };
  });

  return evaluated
    .filter((c) => c.safetyLevel === 'Safe' || c.safetyLevel === 'Caution')
    .sort((a, b) => {
      if (a.safetyLevel !== b.safetyLevel) {
        return a.safetyLevel === 'Safe' ? -1 : 1;
      }
      return b.rankScore - a.rankScore;
    })
    .slice(0, limit);
}

module.exports = {
  rankRecommendations,
  WEIGHTS,
  PROCESSING_RANK
};
