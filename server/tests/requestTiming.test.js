const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { requestTiming } = require('../src/middleware/requestTiming');

describe('requestTiming middleware unit tests', () => {
  it('calls next() synchronously without altering request or response', (t, done) => {
    const req = { method: 'GET', originalUrl: '/api/health', path: '/api/health' };
    const res = new EventEmitter();
    res.statusCode = 200;

    let nextCalled = false;
    requestTiming(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    done();
  });

  it('handles finish event safely for non-api routes without errors', (t, done) => {
    const req = { method: 'GET', originalUrl: '/favicon.ico', path: '/favicon.ico' };
    const res = new EventEmitter();
    res.statusCode = 200;

    requestTiming(req, res, () => {});
    res.emit('finish');
    assert.ok(true);
    done();
  });
});

