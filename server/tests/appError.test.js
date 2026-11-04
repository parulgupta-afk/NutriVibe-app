const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { AppError, Codes } = require('../src/errors/AppError');

describe('AppError class and Codes dictionary tests', () => {
  it('instantiates AppError with default status 500 and INTERNAL_ERROR code', () => {
    const err = new AppError('Something crashed');
    assert.equal(err.message, 'Something crashed');
    assert.equal(err.statusCode, 500);
    assert.equal(err.code, 'INTERNAL_ERROR');
    assert.equal(err.isOperational, true);
    assert.ok(err instanceof Error);
    assert.ok(err instanceof AppError);
  });

  it('accepts custom statusCode and machine-readable code', () => {
    const err = new AppError('Product not found', 404, Codes.PRODUCT_NOT_FOUND);
    assert.equal(err.statusCode, 404);
    assert.equal(err.code, 'PRODUCT_NOT_FOUND');
    assert.equal(err.message, 'Product not found');
  });

  it('exports standard Codes mapping for API error responses', () => {
    assert.equal(Codes.UNAUTHORIZED, 'UNAUTHORIZED');
    assert.equal(Codes.FORBIDDEN, 'FORBIDDEN');
    assert.equal(Codes.CONFLICT, 'CONFLICT');
    assert.equal(Codes.RATE_LIMITED, 'RATE_LIMITED');
    assert.equal(Codes.UPSTREAM_TIMEOUT, 'UPSTREAM_TIMEOUT');
  });
});

