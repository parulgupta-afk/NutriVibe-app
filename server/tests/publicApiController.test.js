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


describe('publicApiController hardening', () => {
  const mk = () => {
    const r = { code: null, body: null, headers: {} };
    r.status = (c) => { r.code = c; return r; };
    r.json = (b) => { r.body = b; return r; };
    r.set = (k, v) => { r.headers[k] = v; return r; };
    return r;
  };

  it('ignores api_key in the query string', async () => {
    const res = mk();
    let nextCalled = false;
    await authenticateApiKey({ headers: {}, query: { api_key: 'nv_abc' } }, res, () => { nextCalled = true; });
    assert.equal(res.code, 401);
    assert.equal(nextCalled, false);
  });

  it('checkFood rejects oversized or non-string inputs', async () => {
    for (const body of [
      { ingredients: Array(201).fill('salt') },
      { ingredients: [{ $ne: 1 }] },
      { ingredients: ['salt'], allergies: 'peanut' },
      { ingredients: ['salt'], medications: Array(51).fill('x') },
      { ingredients: ['salt'], productName: 'x'.repeat(121) },
    ]) {
      const res = mk();
      await checkFood({ body }, res, () => {});
      assert.equal(res.code, 400, JSON.stringify(body).slice(0, 60));
    }
  });

  it('createKey rejects unbounded rate limits and bad names', async () => {
    const { createKey } = require('../src/controllers/publicApiController');
    for (const body of [{ rateLimitPerHour: 1e9 }, { rateLimitPerHour: 0 }, { rateLimitPerHour: '5' }, { name: '' }, { name: 'x'.repeat(61) }, { name: {} }]) {
      const res = mk();
      await createKey({ body, user: { _id: 'u1' } }, res, () => {});
      assert.equal(res.code, 400, JSON.stringify(body));
    }
  });
});
