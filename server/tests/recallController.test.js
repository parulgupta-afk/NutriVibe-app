const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { matchesForUser, seedDemo } = require('../src/controllers/recallController');

describe('recallController unit tests', () => {
  it('returns empty array when neither barcode nor productId is supplied', async () => {
    let responseData = null;
    const req = { query: {} };
    const res = {
      json: (data) => {
        responseData = data;
        return res;
      },
    };

    await matchesForUser(req, res, () => {});
    assert.ok(responseData);
    assert.equal(responseData.success, true);
    assert.deepEqual(responseData.data, []);
    assert.match(responseData.note, /Provide barcode or productId/i);
  });

  it('rejects seedDemo request from non-admin user with 403', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      user: { role: 'user' },
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

    await seedDemo(req, res, () => {});
    assert.equal(statusCode, 403);
    assert.match(responseData.message, /Admin only/i);
  });
});

