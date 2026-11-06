const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeInput, clean } = require('../src/middleware/sanitizeInput');

describe('sanitizeInput (NoSQL operator injection)', () => {
  it('removes $-operators and dotted keys recursively', () => {
    const body = { email: { $ne: null }, a: { b: { $gt: '' }, ok: 1 }, 'x.y': 2, list: [{ $where: '1' }, 'k'] };
    clean(body);
    assert.deepEqual(body, { email: {}, a: { b: {}, ok: 1 }, list: [{}, 'k'] });
  });

  it('leaves normal input untouched and calls next', () => {
    const req = { body: { email: 'a@b.co', n: 5 }, query: { q: 'oats' }, params: { id: '1' } };
    let called = false;
    sanitizeInput(req, {}, () => { called = true; });
    assert.ok(called);
    assert.deepEqual(req.body, { email: 'a@b.co', n: 5 });
  });

  it('handles missing body/query safely', () => {
    let called = false;
    sanitizeInput({}, {}, () => { called = true; });
    assert.ok(called);
  });
});
