/**
 * Dietary restriction rule (Engineering Phase 7).
 * Soft-escalates to Caution only — never forces Unsafe alone.
 */
const { checkDietaryRestrictions } = require('../../data/dietaryRules');

function applyDietRules(product, userRestrictions, state) {
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
