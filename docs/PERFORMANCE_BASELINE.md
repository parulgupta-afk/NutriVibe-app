# Performance baseline worksheet (Phase 10)

Run server with `npm run dev`. Hit endpoints, copy `request_timing` lines from the console.

| Endpoint | Sample durationMs | Notes |
|----------|-------------------|--------|
| GET /api/health | | |
| GET /api/products/barcode/:code (cached in Mongo) | | |
| GET /api/products/barcode/:code (OFF miss) | | cold / network |
| GET /api/products/:id/alternatives | | |
| GET /api/tracking/daily | | |
| GET /api/products/:id/explain | | Gemini; expect slower |

**Baseline date:** ________  
**Machine / hosting:** ________  

After Redis (optional):

| Endpoint | Before Redis | After Redis |
|----------|--------------|-------------|
| barcode (warm) | | |

Only claim improvement when these numbers improve.
