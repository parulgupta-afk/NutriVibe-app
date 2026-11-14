import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const STYLES = {
  Safe: {
    wrap: 'bg-green-50 border-green-200 text-green-800',
    label: 'Safe'
  },
  Caution: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    label: 'Caution'
  },
  Unsafe: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    label: 'Unsafe'
  },
  Unknown: {
    wrap: 'bg-gray-50 border-gray-200 text-gray-700',
    label: 'Unknown'
  }
};

/**
 * Resolves styling and accessibility labels for safety badges.
 * @param {string} [level='Unknown'] Safety verdict level
 * @param {number|null} [score] Optional numeric safety score
 * @param {'sm'|'md'|'lg'} [size='md'] Badge sizing preset
 * @returns {{key: string, style: object, sizeClass: string, ariaLabel: string}}
 */
function getBadgeConfig(level = 'Unknown', score, size = 'md') {
  const key = STYLES[level] ? level : 'Unknown';
  const style = STYLES[key];
  const sizeClass =
    size === 'lg'
      ? 'px-4 py-2 text-base gap-2'
      : size === 'sm'
        ? 'px-2 py-0.5 text-xs gap-1'
        : 'px-3 py-1 text-sm gap-1.5';

  const ariaLabel = `Safety level: ${style.label}${score != null ? `, score ${score}` : ''}`;
  return { key, style, sizeClass, ariaLabel };
}

describe('client SafetyBadge logic tests', () => {
  it('correctly returns Safe configuration', () => {
    const config = getBadgeConfig('Safe', 95, 'md');
    assert.equal(config.key, 'Safe');
    assert.equal(config.style.label, 'Safe');
    assert.match(config.style.wrap, /bg-green-50/);
    assert.equal(config.ariaLabel, 'Safety level: Safe, score 95');
    assert.equal(config.sizeClass, 'px-3 py-1 text-sm gap-1.5');
  });

  it('correctly returns Caution configuration', () => {
    const config = getBadgeConfig('Caution', 60, 'sm');
    assert.equal(config.key, 'Caution');
    assert.equal(config.style.label, 'Caution');
    assert.match(config.style.wrap, /bg-amber-50/);
    assert.equal(config.ariaLabel, 'Safety level: Caution, score 60');
    assert.equal(config.sizeClass, 'px-2 py-0.5 text-xs gap-1');
  });

  it('correctly returns Unsafe configuration', () => {
    const config = getBadgeConfig('Unsafe', 20, 'lg');
    assert.equal(config.key, 'Unsafe');
    assert.equal(config.style.label, 'Unsafe');
    assert.match(config.style.wrap, /bg-red-50/);
    assert.equal(config.ariaLabel, 'Safety level: Unsafe, score 20');
    assert.equal(config.sizeClass, 'px-4 py-2 text-base gap-2');
  });

  it('falls back to Unknown for unrecognized or missing level', () => {
    const fallback1 = getBadgeConfig('InvalidLevel');
    assert.equal(fallback1.key, 'Unknown');
    assert.equal(fallback1.style.label, 'Unknown');
    assert.equal(fallback1.ariaLabel, 'Safety level: Unknown');

    const fallback2 = getBadgeConfig(undefined);
    assert.equal(fallback2.key, 'Unknown');
  });

  it('formats aria-label without score when score is omitted', () => {
    const config = getBadgeConfig('Safe');
    assert.equal(config.ariaLabel, 'Safety level: Safe');
  });

  it('formats aria-label without score when score is explicitly null', () => {
    const config = getBadgeConfig('Safe', null);
    assert.equal(config.ariaLabel, 'Safety level: Safe');
  });
});
