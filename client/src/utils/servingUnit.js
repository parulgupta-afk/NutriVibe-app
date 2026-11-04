/**
 * Serving unit normalization & measurement conversion utility.
 */

const CONVERSION_FACTORS = {
  g: 1,
  gram: 1,
  grams: 1,
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  oz: 28.3495, // 1 ounce = ~28.35 grams
  ounce: 28.3495,
  ounces: 28.3495,
  'fl oz': 29.5735, // 1 fluid ounce = ~29.57 ml
  cup: 240, // Standard culinary cup = 240ml
  cups: 240,
  tbsp: 15, // Tablespoon = ~15ml
  tablespoon: 15,
  tsp: 5, // Teaspoon = ~5ml
  teaspoon: 5,
};

export function convertToMetricGrams(quantity, unit = 'g') {
  const q = Number(quantity);
  if (!q || q <= 0 || Number.isNaN(q)) return 0;

  const normalizedUnit = (unit || 'g').trim().toLowerCase();
  const factor = CONVERSION_FACTORS[normalizedUnit];

  if (!factor) {
    return Math.round(q * 10) / 10;
  }

  return Math.round(q * factor * 10) / 10;
}

export function parseServingString(servingStr) {
  if (!servingStr || typeof servingStr !== 'string') {
    return { quantity: 100, unit: 'g' };
  }

  const match = servingStr.trim().match(/^([\d.]+)\s*([a-zA-Z\s]+)$/);
  if (!match) {
    return { quantity: 100, unit: 'g' };
  }

  const quantity = Number.parseFloat(match[1]) || 100;
  const unit = match[2].trim().toLowerCase() || 'g';

  return { quantity, unit };
}

