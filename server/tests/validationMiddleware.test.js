const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validate, validateBarcodeParam } = require('../src/middleware/validation');

describe('validation middleware unit tests', () => {
  it('calls next() when validations pass with no errors', async () => {
    const middleware = validate(validateBarcodeParam);

    const req = { params: { barcode: '1234567890123' } };
    const res = {};
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  it('responds with 400 and VALIDATION_ERROR code on invalid input', async () => {
    const middleware = validate(validateBarcodeParam);

    const req = { params: { barcode: '' } };
    let capturedStatus = 0;
    let capturedBody = null;

    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        capturedBody = data;
        return this;
      }
    };

    await middleware(req, res, () => {});

    assert.equal(capturedStatus, 400);
    assert.equal(capturedBody.success, false);
    assert.equal(capturedBody.error.code, 'VALIDATION_ERROR');
    assert.ok(capturedBody.errors.length > 0);
  });

  it('calls next() when middleware called with empty config', async () => {
    const middleware = validate({});
    let nextCalled = false;
    await middleware({}, {}, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });
});
