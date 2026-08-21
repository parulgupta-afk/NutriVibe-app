const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  buildStoreKey,
  idempotency,
  _resetIdempotencyStore
} = require('../src/middleware/idempotency');

describe('idempotency helpers', () => {
  it('buildStoreKey is stable for same user+key', () => {
    const a = buildStoreKey('user1', 'abc-123');
    const b = buildStoreKey('user1', 'abc-123');
    assert.equal(a, b);
  });

  it('different users do not share keys', () => {
    const a = buildStoreKey('user1', 'same');
    const b = buildStoreKey('user2', 'same');
    assert.notEqual(a, b);
  });

  it('replays second response for same key', () => {
    _resetIdempotencyStore();
    const req = {
      get: (h) => (h.toLowerCase() === 'idempotency-key' ? 'k1' : undefined),
      user: { id: 'u1' }
    };
    let status1;
    let body1;
    const res1 = {
      statusCode: 201,
      set() {},
      json(b) {
        body1 = b;
        return b;
      }
    };
    // first pass — install capture then simulate handler
    idempotency(req, res1, () => {
      res1.statusCode = 201;
      res1.json({ success: true, data: { id: 'log1' } });
    });

    let replayed = false;
    let body2;
    const res2 = {
      statusCode: 200,
      set(k) {
        if (k === 'Idempotency-Replayed') replayed = true;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(b) {
        body2 = b;
        return b;
      }
    };
    idempotency(req, res2, () => {
      assert.fail('handler should not run on replay');
    });

    assert.equal(replayed, true);
    assert.deepEqual(body2, { success: true, data: { id: 'log1' } });
    assert.equal(res2.statusCode, 201);
  });
});
