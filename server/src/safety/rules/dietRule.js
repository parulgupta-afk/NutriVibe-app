/**
 * Dietary restriction rule (Engineering Phase 7).
 * Soft-escalates to Caution only — never forces Unsafe alone.
 */
const { checkDietaryRestrictions } = require('../../data/dietaryRules');

/**
 * Applies dietary restriction rules against product ingredients.
 * Soft-escalates to Caution only — never forces Unsafe alone.
 *
 * @param {Object} product Product data object.
 * @param {string[]} userRestrictions Array of declared user dietary restrictions.
 * @param {Object} state Mutable safety evaluation state.
 * @returns {Object} Updated evaluation state.
 */
function applyDietRules(product, userRestrictions, state) {
  // Evaluates declared dietary restrictions against known animal and prohibited derivatives
  const dietConflicts = checkDietaryRestrictions(userRestrictions || [], product);
  for (const conflict of dietConflicts) {
    state.factors.push({
      name: 'Dietary restriction concern',
      impact: conflict.message,
      severity: conflict.severity || 30
    });
    state.recommendations.push(conflict.message);

    if (state.level === 'Safe' && (conflict.severity || 0) >= 35) {
      state.level = 'Caution';
      state.score = Math.min(state.score, 65);
    } else if (state.level === 'Safe') {
      state.score = Math.min(state.score, 75);
    }
  }
  return state;
}

module.exports = { applyDietRules };
