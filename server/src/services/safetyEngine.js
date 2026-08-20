/**
 * Single source of truth for computing a personalized safety verdict.
 *
 * Phase 0/1 improvements:
 *  - Normalize user allergies via allergenKeywords helpers
 *  - Match against structured allergens AND free-text ingredients
 *  - Cross-contamination only escalates when relevant to the user's allergies
 *  - Dietary restrictions use certification + ingredient rules (dietaryRules)
 *  - Medication interactions still escalate (never downgrade)
 *  - Honest "Unknown" when data is thin
 */

const { checkMedicationInteractions } = require('../data/medicationInteractions');
const {
  normalizeAllergy,
  expandAllergiesForMatching,
  detectAllergensInText,
  containsKeyword
} = require('../data/allergenKeywords');
const { checkDietaryRestrictions } = require('../data/dietaryRules');

/**
 * Build a searchable blob of product text (ingredients + allergens + warnings + name).
 */
function productTextBlob(product) {
  return [
    ...(product.ingredients || []),
    ...(product.safetyInfo?.allergens || []),
    ...(product.safetyInfo?.warnings || []),
    product.name || '',
    product.description || '',
    product.brand || ''
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Find which of the user's allergies appear in this product.
 * Uses structured allergen tags first, then free-text ingredients.
 */
function findMatchingAllergens(product, userAllergies = []) {
  if (!userAllergies.length) return [];

  // Canonicalize user allergies
  const canonicalUser = [];
  for (const a of userAllergies) {
    const norms = normalizeAllergy(a);
    canonicalUser.push(...(norms.length ? norms : [a]));
  }
  const uniqueUser = [...new Set(canonicalUser.map((x) => x.trim()).filter(Boolean))];

  const productAllergens = (product.safetyInfo?.allergens || []).map((a) =>
    String(a).toLowerCase()
  );
  const blob = productTextBlob(product);

  // Detect from free text with exclude-phrase awareness (e.g. plant milks).
  // Do NOT also run raw expanded keywords against the blob — that would
  // match the word "milk" inside "oat milk" and false-positive Dairy.
  const detectedFromText = detectAllergensInText(blob).map((a) => a.toLowerCase());

  const found = [];

  for (const allergy of uniqueUser) {
    const aLower = allergy.toLowerCase();
    const expanded = expandAllergiesForMatching([allergy]);

    // 1) Structured allergen list match (OFF tags / OCR list)
    const structuredHit = productAllergens.some((pa) => {
      if (!pa || pa === 'none' || pa === 'n/a' || pa === 'unknown') return false;
      return (
        pa.includes(aLower) ||
        aLower.includes(pa) ||
        expanded.some((t) => pa.includes(t) || t.includes(pa))
      );
    });

    // 2) Free-text match only via the shared detector (handles exclusions)
    const textHit = detectedFromText.some(
      (d) => d === aLower || d.includes(aLower) || aLower.includes(d)
    );

    if (structuredHit || textHit) {
      found.push(allergy);
    }
  }

  return [...new Set(found)];
}

/**
 * Cross-contamination / "may contain" warnings only matter if they
 * relate to something the user is actually allergic to.
 */
function hasRelevantCrossContamination(product, userAllergies = []) {
  const warnings = product.safetyInfo?.warnings || [];
  const crossWarnings = warnings.filter((w) => {
    const wl = String(w).toLowerCase();
    return (
      wl.includes('may contain') ||
      wl.includes('traces') ||
      wl.includes('shared facility') ||
      wl.includes('produced in a facility')
    );
  });

  if (crossWarnings.length === 0) return false;
  if (!userAllergies.length) {
    // User listed no allergies — still surface a soft caution if product has may-contain
    return true;
  }

  const expanded = expandAllergiesForMatching(userAllergies);
  const warningText = crossWarnings.join(' ').toLowerCase();

  return expanded.some((term) => warningText.includes(term));
}

/**
 * True when we essentially have no useful allergen/ingredient data.
 */
function hasInsufficientData(product) {
  const allergens = product.safetyInfo?.allergens || [];
  const ingredients = product.ingredients || [];
  const risk = product.safetyInfo?.riskLevel || 'Unknown';

  const emptyAllergens =
    allergens.length === 0 ||
    (allergens.length === 1 &&
      ['none', 'unknown', 'n/a', ''].includes(String(allergens[0]).toLowerCase()));

  return emptyAllergens && ingredients.length === 0 && risk === 'Unknown';
}

function computeSafetyVerdict(product, user) {
  const userAllergies = user.preferences?.allergies || [];
  const userRestrictions = user.preferences?.dietaryRestrictions || [];
  const medications = user.preferences?.medications || [];

  const foundAllergens = findMatchingAllergens(product, userAllergies);

  let level = 'Safe';
  let score = 90;
  const factors = [];
  const recommendations = [];

  // --- Allergen direct match → Unsafe ---
  if (foundAllergens.length > 0) {
    level = 'Unsafe';
    score = 20;
    factors.push({
      name: 'Contains flagged allergens',
      impact: `Direct match: ${foundAllergens.join(', ')}`,
      severity: 90
    });
    recommendations.push(`Contains: ${foundAllergens.join(', ')}`);
    recommendations.push('Avoid this product — it contains allergens you flagged');
  }
  // --- Relevant cross-contamination → Caution ---
  else if (hasRelevantCrossContamination(product, userAllergies)) {
    level = 'Caution';
    score = 60;
    factors.push({
      name: 'Cross-contamination risk',
      impact: 'May contain traces of allergens relevant to your profile',
      severity: 60
    });
    recommendations.push(
      'Check the physical packaging for cross-contamination / shared-facility warnings'
    );
  }
  // --- Thin data → Unknown (honest) ---
  else if (hasInsufficientData(product)) {
    level = 'Unknown';
    score = 50;
    factors.push({
      name: 'Insufficient data',
      impact: 'Not enough ingredient/allergen data to fully assess this product',
      severity: 20
    });
    recommendations.push(
      'No allergens matched your profile, but this product has limited data — check the label yourself if you have concerns'
    );
  }

  // --- Ultra-processed (informational, does not override Unsafe) ---
  if (product.processingLevel === 'Ultra-Processed' && level !== 'Unsafe') {
    factors.push({
      name: 'High processing level',
      impact: 'Ultra-processed food',
      severity: 40
    });
    if (level === 'Safe') {
      recommendations.push('Consider less processed alternatives');
    }
  }

  // --- Dietary restrictions (Phase 1: certs + ingredients) ---
  const dietConflicts = checkDietaryRestrictions(userRestrictions, product);
  for (const conflict of dietConflicts) {
    factors.push({
      name: 'Dietary restriction concern',
      impact: conflict.message,
      severity: conflict.severity || 30
    });
    recommendations.push(conflict.message);

    // Soft escalate: only to Caution if currently Safe, never force Unsafe
    // for diet preference alone (allergies/meds own that path)
    if (level === 'Safe' && (conflict.severity || 0) >= 35) {
      level = 'Caution';
      score = Math.min(score, 65);
    } else if (level === 'Safe') {
      score = Math.min(score, 75);
    }
  }

  // --- Medication–food interactions (can escalate, never downgrade) ---
  const interactionMatches = checkMedicationInteractions(medications, product);

  for (const match of interactionMatches) {
    factors.push({
      name: `Interaction with ${match.medication}`,
      impact: match.message,
      severity: match.severity === 'high' ? 95 : 65
    });
    recommendations.push(
      `⚕️ ${match.message} (relevant to: ${match.medication})`
    );

    if (match.severity === 'high') {
      level = 'Unsafe';
      score = Math.min(score, 15);
    } else if (match.severity === 'medium' && level !== 'Unsafe') {
      level = 'Caution';
      score = Math.min(score, 55);
    }
  }

  return {
    level,
    score,
    factors,
    recommendations
  };
}

module.exports = {
  computeSafetyVerdict,
  // Exported for tests / debugging
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData
};
