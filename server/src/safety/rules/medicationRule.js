/**
 * Medication–food interaction rule (Engineering Phase 7).
 * Can escalate to Unsafe; never downgrades a worse level.
 */
const { checkMedicationInteractions } = require('../../data/medicationInteractions');

function applyMedicationRules(product, medications, state) {
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
