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

  it('attaches operational flag and stack trace correctly', () => {
    const err = new AppError('Sample operational issue', 400, Codes.VALIDATION_ERROR);
    assert.equal(err.isOperational, true);
    assert.ok(typeof err.stack === 'string');
  });

  it('defaults statusCode to 500 when called with single argument', () => {
    const err = new AppError('Internal unexpected error');
    assert.equal(err.statusCode, 500);
  });

  it('correctly sets isOperational property to true on instances', () => {
    const err = new AppError('Operational notice', 400);
    assert.strictEqual(err.isOperational, true);
  });
});

