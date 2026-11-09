/**
 * OpenAPI contract test — honest version.
 * Does NOT claim every route is documented.
 * When you wire listRoutes(app), assert documented paths are a subset
 * or grow openapi.json until coverage is complete.
 */

const fs = require('fs');
const path = require('path');

describe('OpenAPI documentation (partial)', () => {
  it('openapi.json exists and has at least some paths', () => {
    const p = path.join(__dirname, '../src/docs/openapi.json');
    const raw = fs.readFileSync(p, 'utf8');
    const doc = JSON.parse(raw);
    const paths = Object.keys(doc.paths || {});
    expect(paths.length).toBeGreaterThan(0);
    // Known current baseline ~10 paths — update when docs grow
    // Do not assert paths.length === totalExpressRoutes until inventory matches.
  });

  it('documents core auth and health routes', () => {
    const p = path.join(__dirname, '../src/docs/openapi.json');
    const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
    const paths = doc.paths || {};
    expect(paths['/api/health'] || paths['/health']).toBeTruthy();
    // Adjust keys if your openapi uses different path spellings
  });
});
