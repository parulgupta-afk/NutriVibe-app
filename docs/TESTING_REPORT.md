# NutriVibe QA & Automated Testing Report

**Date:** 2026-11-09  
**Status:** Automated suites expected to pass after these fixes · **Not production-ready for real clinical use**

## Known limitations

| Area | Limitation |
| --- | --- |
| Clinical safety | Informational only; no medical validation. |
| Sessions | JWT still often stored in `localStorage`; full httpOnly refresh rotation is roadmap. Default expiry remains configurable via `JWT_EXPIRE` (default 7d) — prefer shorter in production. |
| Validation | Not every route uses identical Zod coverage. |
| OpenAPI | Subset of routes documented (~10 paths). |
| Rate limits | May be in-memory per process. |
| E2E | Full Playwright vs real Mongo may be partial. |

## Medical disclaimer

NutriVibe provides informational food and nutrition insights only. It is not a substitute for professional medical advice.
