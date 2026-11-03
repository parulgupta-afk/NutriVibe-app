const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { lookupIns, listIns } = require('../src/controllers/indianFoodController');
const { matchInsInText, INS_ADDITIVES } = require('../src/data/insAdditives');

describe('indianFoodController and INS additives tests', () => {
  it('listIns returns complete array of defined INS additives', async () => {
    let result = null;
    const req = {};
    const res = {
      json: (data) => {
        result = data;
        return res;
      },
    };

    await listIns(req, res);
    assert.ok(result);
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length >= 15);
  });

  it('lookupIns handles GET query safely without crashing when body is undefined', async () => {
    let result = null;
    const req = {
      query: { q: 'tartrazine' },
    };
    const res = {
      json: (data) => {
        result = data;
        return res;
      },
    };

    await lookupIns(req, res);
    assert.ok(result);
    assert.equal(result.success, true);
    assert.ok(result.data.matches.length > 0);
    assert.equal(result.data.matches[0].code, 'INS 102');
  });

  it('lookupIns returns empty matches on unrecognized or empty input', async () => {
    let result = null;
    const req = { query: {} };
    const res = {
      json: (data) => {
        result = data;
        return res;
      },
    };

    await lookupIns(req, res);
    assert.ok(result);
    assert.equal(result.success, true);
    assert.equal(result.data.matches.length, 0);
  });

  it('matchInsInText identifies multiple additives in complex ingredient text', () => {
    const ingredientList = 'Water, Sugar, Acidity Regulator (INS 330), Preservative (INS 211), Synthetic Food Colour (INS 110)';
    const matches = matchInsInText(ingredientList);

    assert.ok(matches.length >= 3);
    const codes = matches.map((m) => m.code);
    assert.ok(codes.includes('INS 330'));
    assert.ok(codes.includes('INS 211'));
    assert.ok(codes.includes('INS 110'));
  });
});

