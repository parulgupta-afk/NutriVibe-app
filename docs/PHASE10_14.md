# Engineering Phases 10–12 & 14

## Phase 10 — Performance baseline

- `requestTiming` middleware logs JSON lines:
  `{ type, method, path, status, durationMs }`
- Capture 10–20 real requests (barcode, alternatives, dashboard) and note p50/p95 manually.
- **Do not claim speedups** without before/after numbers.

## Phase 11 — Optional Redis

- `server/src/config/redis.js`
- Used only if `REDIS_URL` is set
- Caches barcode → product id for 1 hour
- **If Redis is missing or down, the app still works** (Mongo only)
- Install when you want it: `cd server && npm install redis`
- Add to `server/.env`: `REDIS_URL=redis://127.0.0.1:6379`

## Phase 12 — Recommendation engine

- `recommendationService.js` with **documented weights**
- `productService.rankAlternatives` delegates here
- Adds optional `scoreBreakdown` on each alternative (frontend can ignore)

## Phase 13 — BullMQ

**Deferred.** No background queue until Gemini/OCR load justifies workers. Putting simple CRUD in a queue would only add failure modes.

## Phase 14 — External API reliability

- Open Food Facts: **1 retry** on timeout / network / 5xx (not on not_found)
- Existing timeouts kept (OFF 8s, Gemini already timed out)

## Apply

```
server/src/app.js
server/src/middleware/requestTiming.js
server/src/config/redis.js
server/src/services/recommendationService.js
server/src/services/productService.js
server/src/services/openFoodFactsService.js
server/tests/recommendationService.test.js
docs/PHASE10_14.md
docs/PERFORMANCE_BASELINE.md
```

```bash
cd server
npm test
npm run dev
# optional: npm install redis && REDIS_URL=...
```

```bash
git add server/src server/tests docs/PHASE10_14.md docs/PERFORMANCE_BASELINE.md
git commit -m "engineering: Phase 10-12/14 timing, optional Redis, recommendations, OFF retry"
git push origin main
```
