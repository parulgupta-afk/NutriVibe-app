/**
 * Maps common ingredient keywords to standardized allergen names.
 * Used when:
 *  1. Parsing raw OCR'd label text (no OFF allergen tags)
 *  2. Expanding / normalizing user-declared allergies for matching
 *  3. Scanning product ingredients text as a secondary signal
 *
 * Phase 0/1 improvements:
 *  - More synonyms per allergen (whey, casein, lecithin variants, etc.)
 *  - normalizeAllergy() so "peanut allergy" / "Peanuts" / "peanut" all match
 *  - containsKeyword() uses word-boundary style matching to cut false positives
 *    (e.g. "nut" alone won't fire Tree Nuts; "peanut" still will)
 */

const ALLERGEN_KEYWORDS = [
  {
    name: 'Peanuts',
    keywords: [
      'peanut', 'peanuts', 'groundnut', 'arachis', 'arachis hypogaea'
    ]
  },
  {
    name: 'Tree Nuts',
    keywords: [
      'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut',
      'macadamia', 'brazil nut', 'brazilnut', 'chestnut', 'pine nut',
      'pinenut', 'tree nut', 'tree nuts'
    ]
  },
  {
    name: 'Dairy',
    keywords: [
      'milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'caseinate',
      'lactose', 'yogurt', 'yoghurt', 'ghee', 'curd', 'buttermilk',
      'milk solids', 'milk powder', 'skim milk', 'whole milk',
      'lactoglobulin', 'lactalbumin'
    ],
    // Phrases that look like dairy but are plant-based — do not treat as Dairy
    excludePhrases: [
      'coconut milk', 'almond milk', 'soy milk', 'oat milk', 'rice milk',
      'cashew milk', 'hemp milk', 'pea milk', 'plant milk', 'non-dairy',
      'dairy-free', 'dairy free'
    ]
  },
  {
    name: 'Eggs',
    keywords: [
      'egg', 'eggs', 'albumin', 'albumen', 'egg white', 'egg yolk',
      'ovalbumin', 'ovomucoid', 'lysozyme'
    ]
  },
  {
    name: 'Soy',
    keywords: [
      'soy', 'soya', 'soybean', 'soybeans', 'edamame', 'tofu', 'tempeh',
      'miso', 'soy lecithin', 'soya lecithin', 'soy protein', 'textured vegetable protein'
    ]
  },
  {
    name: 'Gluten',
    keywords: [
      'wheat', 'barley', 'rye', 'gluten', 'malt', 'semolina', 'spelt',
      'kamut', 'triticale', 'farina', 'durum', 'bulgur', 'couscous',
      'seitan', 'graham flour'
    ]
  },
  {
    name: 'Fish',
    keywords: [
      'fish', 'anchovy', 'anchovies', 'salmon', 'tuna', 'cod', 'sardine',
      'sardines', 'mackerel', 'haddock', 'trout', 'bass', 'halibut',
      'fish oil', 'fish sauce'
    ]
  },
  {
    name: 'Shellfish',
    keywords: [
      'shrimp', 'crab', 'lobster', 'shellfish', 'prawn', 'prawns',
      'clam', 'clams', 'mussel', 'mussels', 'oyster', 'oysters',
      'scallop', 'scallops', 'crayfish', 'crawfish', 'langoustine'
    ]
  },
  {
    name: 'Sesame',
    keywords: [
      'sesame', 'tahini', 'sesame oil', 'sesame seed', 'sesame seeds',
      'benne', 'gingelly'
    ]
  },
  {
    name: 'Corn',
    keywords: [
      'corn', 'maize', 'cornstarch', 'corn starch', 'corn syrup',
      'high fructose corn syrup', 'corn flour', 'masa'
    ]
  },
  {
    name: 'Mustard',
    keywords: ['mustard', 'mustard seed', 'mustard seeds', 'mustard flour']
  },
  {
    name: 'Celery',
    keywords: ['celery', 'celeriac', 'celery seed']
  },
  {
    name: 'Lupin',
    keywords: ['lupin', 'lupine', 'lupini']
  },
  {
    name: 'Molluscs',
    keywords: ['mollusc', 'mollusk', 'snail', 'squid', 'octopus', 'cuttlefish']
  },
  {
    name: 'Sulphites',
    keywords: [
      'sulphite', 'sulfite', 'sulphites', 'sulfites', 'sulphur dioxide',
      'sulfur dioxide', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'
    ]
  }
];

/**
 * Escape special regex chars, then match as whole word / phrase.
 * "nut" alone won't match inside "nutrition"; "peanut" will match "peanuts".
 */
function containsKeyword(text, keyword) {
  if (!text || !keyword) return false;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Allow plural/suffix loosely after the keyword (peanut / peanuts)
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:s|es)?(?:[^a-z0-9]|$)`, 'i');
  return re.test(text);
}

/**
 * Normalize a free-form allergy string from the user into our canonical names.
 * "I'm allergic to peanuts" / "Peanut" / "tree nut allergy" -> ["Peanuts"] or ["Tree Nuts"]
 */
function normalizeAllergy(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const lower = raw.toLowerCase().trim();
  const matched = [];

  for (const rule of ALLERGEN_KEYWORDS) {
    // Direct name match
    if (lower === rule.name.toLowerCase() || lower.includes(rule.name.toLowerCase())) {
      matched.push(rule.name);
      continue;
    }
    // Keyword match
    if (rule.keywords.some((kw) => containsKeyword(lower, kw) || lower.includes(kw))) {
      matched.push(rule.name);
    }
  }

  // If nothing mapped, keep the original trimmed string so custom entries still work
  if (matched.length === 0 && lower.length > 0) {
    return [raw.trim()];
  }
  return [...new Set(matched)];
}

/**
 * Expand a list of user allergies into a flat set of searchable terms
 * (canonical name + all keywords) for matching against product data.
 */
function expandAllergiesForMatching(userAllergies = []) {
  const terms = new Set();
  for (const allergy of userAllergies) {
    const canonical = normalizeAllergy(allergy);
    for (const name of canonical) {
      terms.add(name.toLowerCase());
      const rule = ALLERGEN_KEYWORDS.find((r) => r.name === name);
      if (rule) {
        rule.keywords.forEach((kw) => terms.add(kw.toLowerCase()));
      } else {
        // Custom allergy — keep the raw string
        terms.add(String(allergy).toLowerCase());
      }
    }
  }
  return [...terms];
}

/**
 * Detect allergens present in a blob of product text (ingredients + warnings + allergens list).
 * Respects Dairy excludePhrases so plant milks don't false-positive.
 */
function detectAllergensInText(text) {
  if (!text || typeof text !== 'string') return [];
  const textLower = text.toLowerCase();
  const detected = [];

  for (const rule of ALLERGEN_KEYWORDS) {
    // Skip if an exclude phrase is present (mainly Dairy plant milks)
    if (rule.excludePhrases && rule.excludePhrases.some((p) => textLower.includes(p))) {
      // Still allow if a clear animal-dairy keyword exists alongside
      const hasRealDairy = rule.keywords.some(
        (kw) =>
          !['milk'].includes(kw) && // "milk" alone is ambiguous when plant milk present
          containsKeyword(textLower, kw)
      );
      if (!hasRealDairy) continue;
    }

    const matched = rule.keywords.some((kw) => containsKeyword(textLower, kw));
    if (matched) {
      detected.push(rule.name);
    }
  }

  return [...new Set(detected)];
}

/**
 * Parse raw OCR/pasted ingredient text into a clean ingredients array
 * and a list of detected allergens.
 */
function parseIngredientText(rawText) {
  const ingredients = String(rawText || '')
    .split(/[,;\n]+/)
    .map((i) => i.trim())
    .filter((i) => i.length > 1 && i.length < 120);

  const detectedAllergens = detectAllergensInText(rawText);

  return { ingredients, detectedAllergens };
}

module.exports = {
  parseIngredientText,
  ALLERGEN_KEYWORDS,
  normalizeAllergy,
  expandAllergiesForMatching,
  detectAllergensInText,
  containsKeyword
};
