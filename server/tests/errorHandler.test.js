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

  it('maps TokenExpiredError to 401 with Token expired message', () => {
    const req = { path: '/api/auth/me', method: 'GET' };
    const res = mockRes();
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
    assert.equal(res.body.message, 'Token expired');
  });

  it('maps Mongoose CastError to 404', () => {
    const req = { path: '/api/products/bad-id', method: 'GET' };
    const res = mockRes();
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.equal(res.body.message, 'Resource not found');
  });

  it('maps Mongo 11000 duplicate key error to 400 CONFLICT', () => {
    const req = { path: '/api/auth/register', method: 'POST' };
    const res = mockRes();
    const err = new Error('E11000 duplicate key error');
    err.code = 11000;
    err.keyPattern = { email: 1 };

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, 'CONFLICT');
    assert.match(res.body.message, /Duplicate value for email/i);
  });

  it('maps Mongoose ValidationError to 400 VALIDATION_ERROR', () => {
    const req = { path: '/api/auth/register', method: 'POST' };
    const res = mockRes();
    const err = new Error('User validation failed');
    err.name = 'ValidationError';
    err.errors = {
      email: { message: 'Please provide a valid email' },
      name: { message: 'Name is required' },
    };

    errorHandler(err, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.match(res.body.message, /Please provide a valid email/);
  });
});
