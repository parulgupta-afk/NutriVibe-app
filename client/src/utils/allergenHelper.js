/**
 * Allergen badge and chip normalization helper for client pages.
 */

const ALLERGEN_COLOR_MAP = {
  dairy: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  milk: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  peanuts: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'tree nuts': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  gluten: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  wheat: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  soy: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  eggs: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  fish: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  shellfish: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
};

const DEFAULT_COLOR =
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';

/**
 * Normalizes allergen name token to trimmed lowercase string.
 * @param {string} allergen Raw allergen label.
 * @returns {string} Lowercase token.
 */
export function normalizeAllergenName(allergen) {
  if (!allergen || typeof allergen !== 'string') return '';
  return allergen.trim().toLowerCase();
}

export function getAllergenBadgeStyle(allergen) {
  const normalized = normalizeAllergenName(allergen);
  return ALLERGEN_COLOR_MAP[normalized] || DEFAULT_COLOR;
}

export function formatAllergenTitle(allergen) {
  if (!allergen || typeof allergen !== 'string') return '';
  const trimmed = allergen.trim();
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

