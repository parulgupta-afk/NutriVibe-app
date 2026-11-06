const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/**
 * Contract test: every Express route should appear in OpenAPI.
 * Wire listRoutes(app) to your real app export once available.
 */

// const openapi = require('../src/docs/openapi.json');
// const { listRoutes } = require('./helpers/listRoutes');

describe('OpenAPI contract', () => {
  it('placeholder – wire app and openapi paths', () => {
    // const routes = listRoutes(app);
    // const paths = new Set(Object.keys(openapi.paths || {}));
    // const missing = routes.filter((r) => !paths.has(r.path) && !paths.has(r.path.replace(/:([^/]+)/g, '{$1}')));
    // expect(missing).toEqual([]);
    assert.strictEqual(true, true);
  });
});
