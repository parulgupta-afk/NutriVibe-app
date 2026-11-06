# Phase 7 — API contracts / OpenAPI

## Goal

Complete `server/src/docs/openapi.json` (or `server/openapi.json`) so every registered route is documented with request/response shapes aligned to Zod schemas.

## Contract test idea

```js
// server/tests/openapi.contract.test.js
const documented = new Set(Object.keys(openapi.paths || {}));
const registered = listExpressRoutes(app); // implement via app._router stack walk
for (const r of registered) {
  expect(documented.has(r.path) || documented.has(normalize(r.path))).toBe(true);
}
```

Fail CI when a route exists without a documentation entry.

## Steps

1. Inventory all routes (print from Express or from route files).
2. Ensure each path+method exists in openapi.json.
3. Prefer generating requestBody schemas from the Zod validators in `server/src/validators/`.
4. Validate the OpenAPI file (swagger-cli or similar) if available; else mark NOT VERIFIED.
