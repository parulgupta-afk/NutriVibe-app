const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { matchInsInText } = require('../src/data/insAdditives');

describe('INS additives', () => {
  it('detects INS code and common name', () => {
    const hits = matchInsInText('Contains INS 621 (MSG) and aspartame');
    const codes = hits.map((h) => h.code);
    assert.ok(codes.includes('INS 621'));
    assert.ok(codes.includes('INS 951'));
  });

  it('returns empty for clean text', () => {
    assert.equal(matchInsInText('fresh tomato and salt').length, 0);
  });

  it('returns empty array when text input is null or empty', () => {
    assert.deepEqual(matchInsInText(''), []);
    assert.deepEqual(matchInsInText(null), []);
  });
});
