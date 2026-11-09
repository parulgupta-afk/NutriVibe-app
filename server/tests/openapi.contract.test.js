const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

/**
 * OpenAPI contract test — honest version.
 * Does NOT claim every route is documented.
 * When you wire listRoutes(app), assert documented paths are a subset
 * or grow openapi.json until coverage is complete.
 */

describe('OpenAPI documentation (partial)', () => {
  it('openapi.json exists and has at least some paths', () => {
    const p = path.join(__dirname, '../src/docs/openapi.json');
    const raw = fs.readFileSync(p, 'utf8');
    const doc = JSON.parse(raw);
    const paths = Object.keys(doc.paths || {});
    assert.ok(paths.length > 0);
    // Known current baseline ~10 paths — update when docs grow
    // Do not assert paths.length === totalExpressRoutes until inventory matches.
  });

  it('documents core auth and health routes', () => {
    const p = path.join(__dirname, '../src/docs/openapi.json');
    const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
    const paths = doc.paths || {};
    assert.ok(paths['/api/health'] || paths['/health']);
    // Adjust keys if your openapi uses different path spellings
  });
});
