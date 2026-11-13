/**
 * Medication–food interaction rule.
 * Can escalate to Unsafe; never downgrades a worse level.
 *
 * @param {Object} product Evaluated product details.
 * @param {string[]} medications Array of declared user medications.
 * @param {Object} state Mutable safety evaluation state.
 * @returns {Object} Updated evaluation state.
 */
const { checkMedicationInteractions } = require('../../data/medicationInteractions');

function applyMedicationRules(product, medications, state) {
  // Evaluates high and medium risk drug-food interactions (e.g., grapefruit, MAOIs)
  const interactionMatches = checkMedicationInteractions(medications || [], product);

  for (const match of interactionMatches) {
    state.factors.push({
      name: `Interaction with ${match.medication}`,
      impact: match.message,
      severity: match.severity === 'high' ? 95 : 65
    });
    state.recommendations.push(
      `⚕️ ${match.message} (relevant to: ${match.medication})`
    );

    // High-severity interaction forces Unsafe and reduces safety score to 15
    if (match.severity === 'high') {
      state.level = 'Unsafe';
      state.score = Math.min(state.score, 15);
    } else if (match.severity === 'medium' && state.level !== 'Unsafe') {
      state.level = 'Caution';
      state.score = Math.min(state.score, 55);
    }
  }
  return state;
}

module.exports = { applyMedicationRules };
