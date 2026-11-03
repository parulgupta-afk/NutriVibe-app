const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { submit, adminList, adminReview } = require('../src/controllers/submissionController');

describe('submissionController unit tests', () => {
  it('submit returns 400 when product name is missing', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      body: {
        barcode: '1234567890123',
      },
      user: { _id: 'user_123' },
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

    await submit(req, res, () => {});
    assert.equal(statusCode, 400);
    assert.match(responseData.message, /name is required/i);
  });

  it('adminList rejects non-admin users with 403', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      user: { role: 'user' },
      query: {},
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

    await adminList(req, res, () => {});
    assert.equal(statusCode, 403);
    assert.match(responseData.message, /Admin only/i);
  });

  it('adminReview rejects non-admin users with 403', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      user: { role: 'user' },
      params: { id: 'sub_123' },
      body: { status: 'approved' },
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

    await adminReview(req, res, () => {});
    assert.equal(statusCode, 403);
    assert.match(responseData.message, /Admin only/i);
  });

  it('adminReview rejects invalid status values with 400', async () => {
    let statusCode = null;
    let responseData = null;

    const req = {
      user: { role: 'admin' },
      params: { id: 'sub_123' },
      body: { status: 'pending' }, // only approved or rejected permitted
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

    await adminReview(req, res, () => {});
    assert.equal(statusCode, 400);
    assert.match(responseData.message, /status must be approved or rejected/i);
  });
});

