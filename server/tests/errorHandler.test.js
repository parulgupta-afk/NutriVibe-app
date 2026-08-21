/**
 * Phase 3/5 regression: structured error shape preserves `message`.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { AppError, Codes } = require('../src/errors/AppError');
const { errorHandler } = require('../src/middleware/errorHandler');

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('errorHandler', () => {
  it('returns message and error.code for AppError', () => {
    const req = { path: '/api/test', method: 'GET' };
    const res = mockRes();
    const err = new AppError('Product was not found', 404, Codes.PRODUCT_NOT_FOUND);

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Product was not found');
    assert.equal(res.body.error.code, 'PRODUCT_NOT_FOUND');
    assert.equal(res.body.error.message, 'Product was not found');
  });

  it('maps JWT errors to 401', () => {
    const req = { path: '/api/auth/me', method: 'GET' };
    const res = mockRes();
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });
});
