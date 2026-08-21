# Engineering Phases 15–18

## Phase 15 — Idempotency

- Middleware: `server/src/middleware/idempotency.js`
- Applied to `POST /api/tracking/log`
- Client header (optional): `Idempotency-Key: <unique string>`
- Replay header: `Idempotency-Replayed: true`
- In-memory TTL 24h (single server). No behavior change if header omitted.

## Phase 16 — Types (incremental)

- `server/src/types/domain.js` — JSDoc typedefs for Product, SafetyVerdict, etc.
- **Not** a full TypeScript migration (that stays later / optional)

## Phase 17 — Tests

- `server/tests/idempotency.test.js`

## Phase 18 — Security

- Hardened auth messages + no token logging  
- Updated `.env.example`  
- `docs/SECURITY_REVIEW.md`

## Apply

```
server/src/middleware/idempotency.js
server/src/middleware/auth.js
server/src/routes/trackingRoutes.js
server/src/types/domain.js
server/.env.example
server/tests/idempotency.test.js
docs/PHASE15_18.md
docs/SECURITY_REVIEW.md
```

```bash
cd server && npm test && npm run dev
```

```bash
git add server/src/middleware/idempotency.js server/src/middleware/auth.js \
  server/src/routes/trackingRoutes.js server/src/types server/.env.example \
  server/tests/idempotency.test.js docs/PHASE15_18.md docs/SECURITY_REVIEW.md
git commit -m "engineering: Phase 15-18 idempotency, domain types, security pass"
git push origin main
```

## Still left

19 Docker · 20 fuller CI · 21 structured logging · 22 OpenAPI · 23 frontend · 24 docs · 25 final review
