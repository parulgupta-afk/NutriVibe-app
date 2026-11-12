// Visual representation and hex color schemes across canonical safety verdicts
// Canonical verdict palette mapping for gauge rings and visual indicators
export const VERDICT_STYLES = {
  SAFE: {
    stroke: '#10B981',
    text: '#065F46',
    label: 'SAFE',
    pct: 1
  },
  Safe: {
    stroke: '#10B981',
    text: '#065F46',
    label: 'SAFE',
    pct: 1
  },
  CAUTION: {
    stroke: '#F59E0B',
    text: '#92400E',
    label: 'CAUTION',
    pct: 0.65
  },
  Caution: {
    stroke: '#F59E0B',
    text: '#92400E',
    label: 'CAUTION',
    pct: 0.65
  },
  UNSAFE: {
    stroke: '#EF4444',
    text: '#991B1B',
    label: 'UNSAFE',
    pct: 0.25
  },
  Unsafe: {
    stroke: '#EF4444',
    text: '#991B1B',
    label: 'UNSAFE',
    pct: 0.25
  },
  UNKNOWN: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    pct: 0.5
  },
  Unknown: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    pct: 0.5
  },
  CANNOT_VERIFY: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    pct: 0.5
  }
};

/**
 * Resolves visual configuration (colors, percentage, aria label) for safety verdicts.
 * @param {string} verdict Canonical or title-case verdict string.
 * @param {number} [score] Optional risk or safety score (0-100).
 * @returns {Object} Verdict display configuration.
 */
export function getVerdictConfig(verdict = 'Unknown', score) {
  const v = VERDICT_STYLES[verdict] || VERDICT_STYLES.Unknown;
  const pct = score != null ? Math.max(0, Math.min(100, score)) / 100 : v.pct;
  const ariaLabel = `Safety verdict: ${v.label}${score != null ? `, score ${score}` : ''}`;
  return { ...v, pct, ariaLabel };
}

