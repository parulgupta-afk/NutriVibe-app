# Phase 6 — Rate limiting

## Required

1. Use existing `redis` client when `REDIS_URL` is set.
2. Fall back to in-memory only in development.
3. Apply both IP and per-user limits on:
   - Auth (login/register/reset)
   - Scan / OCR
   - Gemini / VibeAI / meal photo
4. Multi-instance: limits must be shared via Redis. Test with two app processes against one Redis, or mark **NOT VERIFIED**.

## Suggested limits (tune with real traffic)

| Route group | Window | Max (IP) | Max (user) |
| ------------- | -------- | ---------- | ------------ |
| Auth | 15 min | 30 | 20 |
| Scan | 1 min | 40 | 20 |
| AI | 1 hour | 100 | 50 |

## Install if needed

```bash
cd server
npm install express-rate-limit
# optional: rate-limit-redis  – or implement INCR/EXPIRE with existing client
```

Wire limiters in `app.js` / route files **before** the handlers.
