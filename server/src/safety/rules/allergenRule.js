/**
 * Allergen + cross-contamination + thin-data rules (Engineering Phase 7).
 * Deterministic — never uses AI.
 */
const {
  normalizeAllergy,
  expandAllergiesForMatching,
  detectAllergensInText,
  containsKeyword
} = require('../../data/allergenKeywords');

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


/**
 * Apply allergen-related rules. Mutates state { level, score, factors, recommendations }.
 */
function applyAllergenRules(product, userAllergies, state) {
  const matchingAllergens = findMatchingAllergens(product, userAllergies);

  if (matchingAllergens.length > 0) {
    state.level = 'Unsafe';
    state.score = Math.min(state.score, 20);
    state.factors.push({
      name: 'Allergen match',
      impact: `Contains or likely contains: ${matchingAllergens.join(', ')}`,
      severity: 90
    });
    state.recommendations.push(
      `Avoid — matches your allergy profile: ${matchingAllergens.join(', ')}`
    );
    return state;
  }

  if (hasRelevantCrossContamination(product, userAllergies)) {
    if (state.level !== 'Unsafe') {
      state.level = 'Caution';
      state.score = Math.min(state.score, 55);
    }
    state.factors.push({
      name: 'Cross-contamination risk',
      impact: 'May be processed in a facility with allergens relevant to your profile',
      severity: 50
    });
    state.recommendations.push(
      'Exercise caution — possible cross-contamination from shared-facility warnings'
    );
  } else if (hasInsufficientData(product)) {
    state.level = 'Unknown';
    state.score = 50;
    state.factors.push({
      name: 'Insufficient data',
      impact: 'Not enough ingredient/allergen data to fully assess this product',
      severity: 20
    });
    state.recommendations.push(
      'No allergens matched your profile, but this product has limited data — check the label yourself if you have concerns'
    );
  }

  return state;
}

module.exports = {
  applyAllergenRules,
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData,
  productTextBlob
};
