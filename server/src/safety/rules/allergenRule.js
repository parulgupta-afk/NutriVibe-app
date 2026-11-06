/**
 * Allergen + cross-contamination + thin-data rules.
 * Deterministic — never uses AI.
 */
const {
  ALLERGEN_KEYWORDS,
  normalizeAllergy,
  expandAllergiesForMatching,
  detectAllergensInText,
  containsKeyword
} = require('../../data/allergenKeywords');

/**
 * Safely extracts ingredient array from string, array, or nested fields.
 */
function extractIngredientList(product) {
  if (!product) return [];
  if (Array.isArray(product.ingredients)) {
    return product.ingredients.flatMap((i) =>
      typeof i === 'string' ? i.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : []
    );
  }
  if (typeof product.ingredients === 'string') {
    return product.ingredients.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Safely extracts allergens list from structured safetyInfo or top-level allergens.
 */
function extractAllergenList(product) {
  if (!product) return [];
  const raw = [
    ...(Array.isArray(product.safetyInfo?.allergens) ? product.safetyInfo.allergens : []),
    ...(Array.isArray(product.allergens) ? product.allergens : typeof product.allergens === 'string' ? [product.allergens] : [])
  ];
  return raw.flatMap((a) =>
    typeof a === 'string' ? a.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : []
  );
}

/**
 * Safely extracts warnings / may-contain declarations.
 */
function extractWarningList(product) {
  if (!product) return [];
  const raw = [
    ...(Array.isArray(product.safetyInfo?.warnings) ? product.safetyInfo.warnings : typeof product.safetyInfo?.warnings === 'string' ? [product.safetyInfo.warnings] : []),
    ...(Array.isArray(product.warnings) ? product.warnings : typeof product.warnings === 'string' ? [product.warnings] : []),
    ...(product.mayContain ? (Array.isArray(product.mayContain) ? product.mayContain : [product.mayContain]) : [])
  ];
  return raw.flatMap((w) =>
    typeof w === 'string' ? [w.trim()] : []
  ).filter(Boolean);
}

/**
 * Normalizes common OCR digit/symbol substitutions into characters.
 * Emits original text along with candidate digit substitutions (e.g. 1 -> i, 1 -> l).
 */
function normalizeOcrSubstitutions(text) {
  if (!text) return '';
  const s = text.toLowerCase();
  const common = s
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
  const withI = common.replace(/[1!]/g, 'i').replace(/\|/g, 'l');
  const withL = common.replace(/[1!|]/g, 'l');
  return `${s} ${withI} ${withL}`;
}

/**
 * Builds normalized lowercase text representation of ingredients & allergens for direct presence checks.
 * Does NOT include facility/cross-contamination warnings so warnings don't falsely trigger direct UNSAFE.
 */
function ingredientTextBlob(product) {
  if (!product || typeof product !== 'object') return '';
  const ingredients = extractIngredientList(product);
  const allergens = extractAllergenList(product);

  return [
    ...ingredients,
    ...allergens,
    product.name || '',
    product.description || '',
    product.brand || '',
    typeof product.ingredients === 'string' ? product.ingredients : ''
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Builds normalized lowercase text representation of warnings/may-contain lines.
 */
function warningsTextBlob(product) {
  if (!product || typeof product !== 'object') return '';
  const warnings = extractWarningList(product);
  return warnings.join(' ').toLowerCase();
}

/**
 * Combined product text blob for generic search & OCR checks.
 */
function productTextBlob(product) {
  if (!product || typeof product !== 'object') return '';
  return [ingredientTextBlob(product), warningsTextBlob(product)].join(' ').trim();
}

/**
 * Detect empty or completely missing product record.
 */
function isMissingOrEmptyProduct(product) {
  if (!product || typeof product !== 'object') return true;
  const keys = Object.keys(product);
  if (keys.length === 0) return true;
  const hasName = Boolean(product.name && String(product.name).trim());
  const hasBarcode = Boolean(product.barcode && String(product.barcode).trim());
  const ingredients = extractIngredientList(product);
  const allergens = extractAllergenList(product);
  const hasIngredients = ingredients.length > 0;
  const hasAllergens = allergens.length > 0;
  return !hasName && !hasBarcode && !hasIngredients && !hasAllergens;
}

/**
 * Detect OCR extraction failure or unreadable label text.
 */
function isUnreadableOrFailedOcr(product) {
  if (!product) return false;
  if (product.ocrStatus === 'failed' || product.ocrError || product.extractionFailed) return true;
  if (typeof product.extractionConfidence === 'number' && product.extractionConfidence < 0.4) return true;

  const patterns = [
    'ocr extraction failed',
    'extraction failed',
    'unreadable',
    'unreadable label',
    'failed to extract',
    '*** unreadable ***',
    'cannot read',
    'blurry image',
    'blurry label',
    'blurry photo',
    'illegible',
    'unreadable ocr',
    'ocr failed'
  ];

  const blob = productTextBlob(product);
  return patterns.some((p) => blob.includes(p));
}

/**
 * Check for contradictory product packaging/claims (e.g. claims "dairy-free" but contains milk).
 */
function hasContradictoryInformation(product) {
  if (!product) return null;
  const blob = productTextBlob(product);
  const rawIngredients = extractIngredientList(product).map((i) => String(i).toLowerCase());

  const freeClaims = [
    { claim: 'dairy-free', conflictTerms: ['milk', 'whey', 'casein', 'cheese', 'butter', 'cream', 'dairy'], allergy: 'Dairy' },
    { claim: 'milk-free', conflictTerms: ['milk', 'whey', 'casein', 'butter', 'cream'], allergy: 'Dairy' },
    { claim: 'gluten-free', conflictTerms: ['wheat', 'barley', 'rye', 'spelt', 'gluten'], allergy: 'Gluten' },
    { claim: 'peanut-free', conflictTerms: ['peanut', 'peanuts', 'arachis'], allergy: 'Peanuts' },
    { claim: 'nut-free', conflictTerms: ['peanut', 'almond', 'cashew', 'walnut', 'hazelnut', 'pecan', 'pistachio'], allergy: 'Tree Nuts' },
    { claim: 'egg-free', conflictTerms: ['egg', 'eggs', 'albumin', 'egg white', 'egg yolk'], allergy: 'Eggs' },
    { claim: 'soy-free', conflictTerms: ['soy', 'soya', 'soybean', 'tofu', 'edamame'], allergy: 'Soy' },
    { claim: 'vegan', conflictTerms: ['milk', 'egg', 'beef', 'chicken', 'pork', 'fish', 'gelatin', 'honey', 'whey'], allergy: 'Animal Products' }
  ];

  for (const item of freeClaims) {
    if (blob.includes(item.claim)) {
      const hasConflict = rawIngredients.some((ing) => {
        const ingClean = ing.replace(new RegExp(item.claim, 'g'), '');
        return item.conflictTerms.some((term) => {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          return regex.test(ingClean);
        });
      });
      if (hasConflict) {
        return {
          claim: item.claim,
          allergy: item.allergy
        };
      }
    }
  }

  return null;
}

/**
 * Find which of the user's allergies appear in this product.
 * Uses structured allergen tags first, then free-text ingredients.
 */
function findMatchingAllergens(product, userAllergies = []) {
  if (!product || !userAllergies.length) return [];

  // Canonicalize user allergies
  const canonicalUser = [];
  for (const a of userAllergies) {
    const norms = normalizeAllergy(a);
    canonicalUser.push(...(norms.length ? norms : [a]));
  }
  const uniqueUser = [...new Set(canonicalUser.map((x) => x.trim()).filter(Boolean))];

  const productAllergens = extractAllergenList(product).map((a) =>
    String(a).toLowerCase()
  );
  const blob = ingredientTextBlob(product);
  const ocrNormalizedBlob = normalizeOcrSubstitutions(blob);

  // Detect from free text with exclude-phrase awareness (e.g. plant milks).
  const detectedFromText = [
    ...detectAllergensInText(blob),
    ...detectAllergensInText(ocrNormalizedBlob)
  ].map((a) => a.toLowerCase());

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

    // 3) Hidden allergen keywords directly in blob or OCR-normalized blob
    const matchingRule = ALLERGEN_KEYWORDS.find(
      (r) =>
        r.name.toLowerCase() === aLower ||
        normalizeAllergy(r.name)
          .map((x) => x.toLowerCase())
          .includes(aLower)
    );
    let targetBlob = blob;
    let targetOcrBlob = ocrNormalizedBlob;
    if (matchingRule && matchingRule.excludePhrases) {
      for (const phrase of matchingRule.excludePhrases) {
        if (targetBlob.includes(phrase)) targetBlob = targetBlob.split(phrase).join(' ');
        if (targetOcrBlob.includes(phrase)) targetOcrBlob = targetOcrBlob.split(phrase).join(' ');
      }
    }

    const hiddenHit = expanded.some((kw) => {
      return containsKeyword(targetBlob, kw) || containsKeyword(targetOcrBlob, kw);
    });

    if (structuredHit || textHit || hiddenHit) {
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
  if (!product) return false;
  const warnBlob = warningsTextBlob(product);

  const crossPhrases = [
    'may contain',
    'traces of',
    'traces',
    'shared facility',
    'produced in a facility',
    'manufactured in a facility',
    'shared equipment',
    'processed on equipment',
    'facility that processes'
  ];

  const hasCrossText = crossPhrases.some((cp) => warnBlob.includes(cp));

  if (!hasCrossText) return false;
  if (!userAllergies.length) {
    return true;
  }

  const expanded = expandAllergiesForMatching(userAllergies);
  return expanded.some((term) => warnBlob.includes(term));
}

/**
 * True when we essentially have no useful allergen/ingredient data.
 * Safety-critical fail-safe: Incomplete information must NEVER default to SAFE.
 */
function hasInsufficientData(product, userAllergies = []) {
  if (isMissingOrEmptyProduct(product)) return true;
  if (isUnreadableOrFailedOcr(product)) return true;

  const allergens = extractAllergenList(product);
  const ingredients = extractIngredientList(product);

  const emptyIngredients = !ingredients || ingredients.length === 0;
  const emptyAllergens =
    !allergens ||
    allergens.length === 0 ||
    (allergens.length === 1 &&
      ['none', 'unknown', 'n/a', ''].includes(String(allergens[0]).toLowerCase()));

  // If ingredients are missing or empty:
  if (emptyIngredients) {
    // If user has declared allergies and no ingredients list is present -> cannot verify
    if (userAllergies && userAllergies.length > 0) return true;
    // If both ingredients and allergens are empty -> cannot verify
    if (emptyAllergens) return true;
  }

  const blob = productTextBlob(product);
  if (
    blob.includes('ingredients unavailable') ||
    blob.includes('missing ingredient information') ||
    blob.includes('no ingredient list available')
  ) {
    return true;
  }

  return false;
}

/**
 * Apply allergen-related rules. Mutates state { level, score, factors, recommendations }.
 */
function applyAllergenRules(product, userAllergies = [], state) {
  // 1. Fail-safe: Incomplete, unreadable, or missing data cannot be verified
  if (hasInsufficientData(product, userAllergies)) {
    state.level = 'Unknown';
    state.score = 50;
    const isOcrIssue = isUnreadableOrFailedOcr(product);
    state.factors.push({
      name: 'Insufficient data',
      impact: isOcrIssue
        ? 'OCR extraction failed or ingredient label is unreadable'
        : 'Incomplete product data (missing ingredients or allergen declarations)',
      severity: 20
    });
    state.recommendations.push(
      isOcrIssue
        ? 'Cannot verify safety due to unreadable label or failed OCR extraction — check physical packaging.'
        : 'Safety cannot be verified due to missing ingredients/allergen data — verify the label directly.'
    );
    return state;
  }

  // 2. Direct allergen match
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

  // 3. Contradictory product packaging
  const contradiction = hasContradictoryInformation(product);
  if (contradiction) {
    const isUserAllergicToContradiction = userAllergies.some((a) => {
      const norms = normalizeAllergy(a);
      return norms.includes(contradiction.allergy) || a.toLowerCase().includes(contradiction.allergy.toLowerCase());
    });

    if (isUserAllergicToContradiction) {
      state.level = 'Unsafe';
      state.score = Math.min(state.score, 15);
      state.factors.push({
        name: 'Contradictory packaging hazard',
        impact: `Packaging claims ${contradiction.claim} but ingredients contain ${contradiction.allergy}`,
        severity: 95
      });
      state.recommendations.push(
        `Avoid — packaging claims ${contradiction.claim} but ingredients list conflicting allergen (${contradiction.allergy}).`
      );
      return state;
    } else {
      if (state.level !== 'Unsafe') {
        state.level = 'Caution';
        state.score = Math.min(state.score, 50);
      }
      state.factors.push({
        name: 'Contradictory packaging warning',
        impact: `Packaging claims ${contradiction.claim} but ingredients contradict this claim`,
        severity: 50
      });
      state.recommendations.push(
        'Exercise caution — packaging claims contradict listed ingredients.'
      );
    }
  }

  // 4. Cross-contamination / Facility warnings
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
  }

  return state;
}

module.exports = {
  applyAllergenRules,
  findMatchingAllergens,
  hasRelevantCrossContamination,
  hasInsufficientData,
  hasContradictoryInformation,
  isMissingOrEmptyProduct,
  isUnreadableOrFailedOcr,
  productTextBlob
};
