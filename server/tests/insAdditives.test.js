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

  it('returns empty array when text input is undefined', () => {
    assert.deepEqual(matchInsInText(undefined), []);
  });

  it('detects tartrazine colour additive by code INS 102', () => {
    const hits = matchInsInText('Food colouring INS 102');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].code, 'INS 102');
    assert.equal(hits[0].category, 'colour');
  });

  it('detects citric acid acidity regulator by name', () => {
    const hits = matchInsInText('Contains citric acid');
    assert.ok(hits.some((h) => h.code === 'INS 330'));
  });

  it('detects acesulfame k sweetener by name', () => {
    const hits = matchInsInText('Contains acesulfame k');
    assert.ok(hits.some((h) => h.code === 'INS 950'));
  });
});
