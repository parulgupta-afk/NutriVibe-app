/**
 * Text formatting, ellipsis truncation, and title normalization utilities.
 */

/**
 * Truncate long strings at character boundary with ellipsis.
 * @param {string} text
 * @param {number} [maxLength=100]
 * @param {string} [suffix='...']
 * @returns {string}
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}${suffix}`;
}

export function truncateWords(text, maxWords = 15, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}${suffix}`;
}

export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

