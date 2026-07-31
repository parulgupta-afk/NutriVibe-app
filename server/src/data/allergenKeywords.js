/**
 * Maps common ingredient keywords to standardized allergen names.
 * Used when parsing raw OCR'd label text, which won't have Open Food
 * Facts' clean allergen tags — we have to infer from ingredient words.
 */
const ALLERGEN_KEYWORDS = [
  { name: 'Peanuts', keywords: ['peanut'] },
  { name: 'Tree Nuts', keywords: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'] },
  { name: 'Dairy', keywords: ['milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'lactose', 'yogurt', 'ghee'] },
  { name: 'Eggs', keywords: ['egg'] },
  { name: 'Soy', keywords: ['soy', 'soya', 'edamame'] },
  { name: 'Gluten', keywords: ['wheat', 'barley', 'rye', 'gluten', 'malt', 'semolina'] },
  { name: 'Fish', keywords: ['fish', 'anchovy', 'salmon', 'tuna', 'cod', 'sardine'] },
  { name: 'Shellfish', keywords: ['shrimp', 'crab', 'lobster', 'shellfish', 'prawn', 'clam', 'mussel', 'oyster'] },
  { name: 'Sesame', keywords: ['sesame', 'tahini'] },
  { name: 'Corn', keywords: ['corn', 'maize'] }
];

/**
 * Parse raw OCR/pasted ingredient text into a clean ingredients array
 * and a list of detected allergens.
 */
function parseIngredientText(rawText) {
  // OCR output is messy — split on commas, semicolons, or newlines,
  // trim whitespace, drop empty/garbage fragments
  const ingredients = rawText
    .split(/[,;\n]/)
    .map((i) => i.trim())
    .filter((i) => i.length > 1 && i.length < 100);

  const textLower = rawText.toLowerCase();
  const detectedAllergens = [];

  for (const rule of ALLERGEN_KEYWORDS) {
    const matched = rule.keywords.some((kw) => textLower.includes(kw));
    if (matched) {
      detectedAllergens.push(rule.name);
    }
  }

  return { ingredients, detectedAllergens };
}

module.exports = { parseIngredientText, ALLERGEN_KEYWORDS };