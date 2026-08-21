# Engineering Phases 6–9

## Phase 6 — Validation

- Expanded `server/src/middleware/validation.js`
  - barcode params, Mongo ids, scan-label body, search query, pagination
- `productRoutes.js` applies validators on product endpoints
- Validation errors include `error.code: VALIDATION_ERROR` while keeping useful field errors

## Phase 7 — Safety rule modules

```
server/src/safety/rules/
  allergenRule.js
  dietRule.js
  medicationRule.js
  processingRule.js
server/src/services/safetyEngine.js   ← orchestrator only
```

Deterministic. Gemini still does **not** decide safety.

## Phase 8 — Safety vs nutrition (additive)

`computeSafetyVerdict` still returns:

- `level`, `score`, `factors`, `recommendations` (legacy)

Plus:

- `safety: { level, score, factors }`
- `nutrition: { score, calories, protein, sugar, fiber }`
- `processing: { level }`

`generateSafetyReport` passes these through. Old frontend can ignore new fields.

## Phase 9 — Database

- `Tracking` index: `{ user: 1, profile: 1, createdAt: -1 }` for profile-filtered history
- Existing user/product indexes kept

## Apply

Copy:

```
server/src/middleware/validation.js
server/src/routes/productRoutes.js
server/src/models/Tracking.js
server/src/services/safetyEngine.js
server/src/services/productService.js
server/src/safety/rules/*
server/tests/safetyStructure.test.js
```

```bash
cd server && npm test && npm run dev
```

Smoke-test: dairy allergy + yogurt barcode, vegan product, alternatives.

```bash
git add server/src/middleware/validation.js server/src/routes/productRoutes.js \
  server/src/models/Tracking.js server/src/services/safetyEngine.js \
  server/src/services/productService.js server/src/safety server/tests/safetyStructure.test.js docs/PHASE6_9.md
git commit -m "engineering: Phase 6-9 validation, modular safety rules, safety/nutrition split, tracking index"
git push origin main
```

## Still deferred

10 performance baseline · 11 Redis · 13 BullMQ · 16 TypeScript · 19 Docker
