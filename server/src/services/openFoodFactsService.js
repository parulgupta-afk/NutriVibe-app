const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_TIMEOUT_MS = 8000;
const OFF_MAX_ATTEMPTS = 2; // Phase 14: one retry on timeout/network
const OFF_RETRY_DELAY_MS = 400;

// Map Open Food Facts category tags to our schema's enum
const mapCategory = (categoriesTags = []) => {
  const tags = categoriesTags.join(' ').toLowerCase();

  if (tags.includes('beverage') || tags.includes('drink') || tags.includes('juice') || tags.includes('soda')) {
    return 'Beverage';
  }
  if (tags.includes('supplement') || tags.includes('vitamin')) {
    return 'Supplement';
  }
  if (tags.includes('cosmetic') || tags.includes('skin-care') || tags.includes('hygiene')) {
    return 'Cosmetic';
  }
  if (tags.includes('food') || tags.includes('snack') || tags.includes('meal') || tags.includes('bread') || tags.includes('dairy')) {
    return 'Food';
  }
  return 'Other';
};

const mapProcessingLevel = (novaGroup) => {
  switch (novaGroup) {
    case 1: return 'Unprocessed';
    case 2: return 'Processed Culinary Ingredient';
    case 3: return 'Processed';
    case 4: return 'Ultra-Processed';
    default: return 'Unknown';
  }
};

const cleanTag = (tag) =>
  tag
    .replace(/^[a-z]{2,3}:/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const buildWarnings = (allergensTags = [], tracesTags = []) => {
  const warnings = [];
  if (tracesTags.length > 0) {
    warnings.push(`May contain traces of: ${tracesTags.map(cleanTag).join(', ')}`);
  }
  if (allergensTags.length > 0) {
    warnings.push(`Contains: ${allergensTags.map(cleanTag).join(', ')}`);
  }
  return warnings;
};

const estimateBaselineRisk = (allergensTags = [], tracesTags = []) => {
  if (allergensTags.length > 0) return 'Caution';
  if (tracesTags.length > 0) return 'Caution';
  return 'Unknown';
};

/**
 * Phase 2: fetch with timeout + structured outcome so callers can show
 * better errors (not found vs timeout vs upstream down).
 *
 * Returns:
 *   { ok: true, product }
 *   { ok: false, reason: 'not_found' | 'timeout' | 'upstream' | 'network', status?: number }
 */
async function fetchProductFromOpenFoodFactsOnce(barcode) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OFF_TIMEOUT_MS);

  try {
    const response = await fetch(`${OFF_BASE_URL}/${barcode}.json`, {
      headers: {
        'User-Agent': 'NutriVibe/1.0 (https://github.com/parulgupta-afk/NutriVibe-app)'
      },
      signal: controller.signal
    });

    if (response.status === 404) {
      return { ok: false, reason: 'not_found', status: 404 };
    }

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Open Food Facts status ${response.status} for barcode ${barcode}`);
      }
      return { ok: false, reason: 'upstream', status: response.status };
    }

    const json = await response.json();

    if (json.status !== 1 || !json.product) {
      return { ok: false, reason: 'not_found' };
    }

    const p = json.product;
    const allergensTags = p.allergens_tags || [];
    const tracesTags = p.traces_tags || [];
    const nutriments = p.nutriments || {};

    const ingredients = (p.ingredients_text || '')
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const product = {
      barcode,
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: (p.brands || 'Unknown Brand').split(',')[0].trim(),
      category: mapCategory(p.categories_tags || []),
      description: p.generic_name || p.categories || '',
      ingredients,
      nutritionalInfo: {
        servingSize: p.serving_size || undefined,
        calories: nutriments['energy-kcal_100g'],
        protein: nutriments['proteins_100g'],
        carbs: nutriments['carbohydrates_100g'],
        fat: nutriments['fat_100g'],
        fiber: nutriments['fiber_100g'],
        sugar: nutriments['sugars_100g'],
        sodium: nutriments['sodium_100g']
      },
      safetyInfo: {
        riskLevel: estimateBaselineRisk(allergensTags, tracesTags),
        warnings: buildWarnings(allergensTags, tracesTags),
        allergens: allergensTags.map(cleanTag),
        certifications: (p.labels_tags || []).map(cleanTag)
      },
      images: [p.image_url, p.image_front_url].filter(Boolean),
      processingLevel: mapProcessingLevel(p.nova_group),
      isVerified: false,
      dataSource: 'Open Food Facts'
    };

    return { ok: true, product };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    if (process.env.NODE_ENV === 'development') {
      console.error(`OFF fetch error for ${barcode}:`, error.message);
    }
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** Back-compat helper: returns product or null (old callers). */

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Phase 14: retry once on timeout/network only (not on not_found).
 */
async function fetchProductFromOpenFoodFacts(barcode) {
  let last = null;
  for (let attempt = 1; attempt <= OFF_MAX_ATTEMPTS; attempt++) {
    last = await fetchProductFromOpenFoodFactsOnce(barcode);
    if (last.ok) return last;
    if (last.reason === 'not_found') return last;
    if (last.reason === 'upstream' && last.status && last.status < 500) return last;
    if (attempt < OFF_MAX_ATTEMPTS && (last.reason === 'timeout' || last.reason === 'network' || last.reason === 'upstream')) {
      await sleep(OFF_RETRY_DELAY_MS * attempt);
      continue;
    }
    return last;
  }
  return last;
}

async function fetchProductOrNull(barcode) {
  const result = await fetchProductFromOpenFoodFacts(barcode);
  return result.ok ? result.product : null;
}

module.exports = {
  fetchProductFromOpenFoodFacts,
  fetchProductOrNull
};
