import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

/**
 * Loads service worker in a sandboxed vm context with mock caches and fetch.
 * Verifies caching isolation and offline 503 fallback behavior.
 */
function load() {
  const handlers = {};
  const puts = [];
  const cache = { put: (...a) => puts.push(a), addAll: async () => {} };
  const sandbox = {
    URL,
    Response,
    self: { addEventListener: (t, h) => (handlers[t] = h), skipWaiting() {}, clients: { claim() {} } },
    caches: { open: async () => cache, match: async () => undefined, keys: async () => [], delete: async () => true },
    fetch: async () => new Response('{"data":"private"}', { status: 200 }),
  };
  vm.runInNewContext(fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), sandbox);
  return { handlers, puts, sandbox };
}

const run = (h, url, mode = 'cors') => {
  let p;
  h.fetch({ request: { url, method: 'GET', mode }, respondWith: (x) => (p = x) });
  return p;
};

describe('service worker privacy', () => {
  it('never writes API responses to Cache Storage', async () => {
    const { handlers, puts } = load();
    const res = await run(handlers, 'https://app.test/api/dependents');
    assert.equal(res.status, 200);
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(puts.length, 0);
  });

  it('returns a JSON 503 (not undefined) when the API is offline', async () => {
    const { handlers, sandbox } = load();
    sandbox.fetch = async () => { throw new TypeError('offline'); };
    const res = await run(handlers, 'https://app.test/v1/check');
    assert.equal(res.status, 503);
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
  });

  it('initializes service worker handlers without error', () => {
    const { handlers } = load();
    assert.ok(typeof handlers.fetch === 'function');
  });
});
