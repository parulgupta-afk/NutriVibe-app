const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

// Map Open Food Facts category tags to our schema's enum
const mapCategory = (categoriesTags = [], productNameTags = []) => {
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

// NOVA group (1-4) -> our processingLevel enum
const mapProcessingLevel = (novaGroup) => {
  switch (novaGroup) {
    case 1: return 'Unprocessed';
    case 2: return 'Processed Culinary Ingredient';
    case 3: return 'Processed';
    case 4: return 'Ultra-Processed';
    default: return 'Unknown';
  }
};

// "en:milk", "en:gluten" -> "Milk", "Gluten"
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

// Best-effort baseline risk level. This is just a starting point —
// the real, personalized verdict is computed later against the user's
// own allergy/diet profile in productController.generateSafetyReport.
const estimateBaselineRisk = (allergensTags = [], tracesTags = []) => {
  if (allergensTags.length > 0) return 'Caution';
  if (tracesTags.length > 0) return 'Caution';
  return 'Unknown';
};

/**
 * Fetch a product from Open Food Facts by barcode and map it into
 * our internal Product schema shape. Returns null if not found or
 * if the API call fails for any reason (network, rate limit, etc.)
 * so the caller can fall back to a clean 404 instead of crashing.
 */
async function fetchProductFromOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`${OFF_BASE_URL}/${barcode}.json`, {
      headers: {
        // OFF asks API consumers to identify themselves
        'User-Agent': 'NutriVibe/1.0 (https://github.com/nutrivibe)'
      }
    });

    if (!response.ok) {
      console.error(`Open Food Facts responded with status ${response.status} for barcode ${barcode}`);
      return null;
    }

    const json = await response.json();

    // status === 0 means "product not found" in OFF's API
    if (json.status !== 1 || !json.product) {
      return null;
    }

    const p = json.product;
    const allergensTags = p.allergens_tags || [];
    const tracesTags = p.traces_tags || [];
    const nutriments = p.nutriments || {};

    // ingredients_text is a comma-separated string; OFF also exposes a
    // structured `ingredients` array but text is more consistently present
    const ingredients = (p.ingredients_text || '')
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const mapped = {
      barcode,
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: (p.brands || 'Unknown Brand').split(',')[0].trim(),
      category: mapCategory(p.categories_tags),
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

    return mapped;
  } catch (error) {
    console.error(`Error fetching from Open Food Facts for barcode ${barcode}:`, error.message);
    return null;
  }
}

module.exports = { fetchProductFromOpenFoodFacts };