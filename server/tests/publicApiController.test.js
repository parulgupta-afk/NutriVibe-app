const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { authenticateApiKey, checkFood } = require('../src/controllers/publicApiController');

describe('publicApiController unit tests', () => {
  it('authenticateApiKey returns 401 if X-API-Key is missing', async () => {
    let statusCode = null;
    let responseData = null;

    const req = { headers: {}, query: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    let nextCalled = false;
    await authenticateApiKey(req, res, () => {
      nextCalled = true;
    });

    assert.equal(statusCode, 401);
    assert.equal(responseData.error, 'Missing X-API-Key');
    assert.equal(nextCalled, false);
  });

  it('checkFood returns 400 when ingredients array is missing or empty', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      body: {
        ingredients: [],
      },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    let nextCalled = false;
    await checkFood(req, res, () => {
      nextCalled = true;
    });

    assert.equal(statusCode, 400);
    assert.equal(responseData.error, 'ingredients array required');
    assert.equal(nextCalled, false);
  });

  it('checkFood evaluates ingredients against allergies deterministically', async () => {
    let responseData = null;

    const req = {
      body: {
        productName: 'Cream Soup',
        ingredients: ['Water', 'Heavy Cream', 'Salt'],
        allergies: ['Dairy'],
      },
    };
    const res = {
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    await checkFood(req, res, () => {});

    assert.ok(responseData);
    assert.equal(responseData.success, true);
    assert.ok(responseData.data);
    assert.equal(responseData.data.level, 'Unsafe');
    assert.ok(responseData.data.factors.some((f) => /Dairy/i.test(f.impact)));
    assert.ok(responseData.disclaimer);
  });
});
