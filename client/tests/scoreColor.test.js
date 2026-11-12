import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getScoreColor } from '../src/utils/scoreColor.js';

describe('client scoreColor utility tests', () => {
  it('returns Excellent green styling for scores >= 80', () => {
    const res = getScoreColor(92);
    assert.equal(res.label, 'Excellent');
    assert.match(res.bar, /bg-green-500/);
  });

  it('returns Good emerald styling for scores between 60 and 79', () => {
    const res = getScoreColor(70);
    assert.equal(res.label, 'Good');
    assert.match(res.bar, /bg-emerald-500/);
  });

  it('returns Fair amber styling for scores between 40 and 59', () => {
    const res = getScoreColor(45);
    assert.equal(res.label, 'Fair');
    assert.match(res.bar, /bg-amber-500/);
  });

  it('returns Poor red styling for scores < 40', () => {
    const res = getScoreColor(25);
    assert.equal(res.label, 'Poor');
    assert.match(res.bar, /bg-red-500/);
  });

  it('returns Unknown gray styling for null or NaN inputs', () => {
    const res1 = getScoreColor(null);
    assert.equal(res1.label, 'Unknown');
    assert.match(res1.bar, /bg-gray-400/);

    const res2 = getScoreColor(undefined);
    assert.equal(res2.label, 'Unknown');
  });

  it('verifies boundary limits at exactly 0 and 100', () => {
    assert.equal(getScoreColor(0).label, 'Poor');
    assert.equal(getScoreColor(100).label, 'Excellent');
  });

  it('returns Fair styling at score 59 boundary', () => {
    assert.equal(getScoreColor(59).label, 'Fair');
  });

  it('returns Excellent styling at score 80 boundary', () => {
    assert.equal(getScoreColor(80).label, 'Excellent');
  });
});

