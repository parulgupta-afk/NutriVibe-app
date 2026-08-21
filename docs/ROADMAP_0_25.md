# Engineering roadmap status (Phases 0–25)

| Phase | Title | Status | Notes |
|------:|-------|--------|-------|
| 0 | Forensics | **Done (this pack)** | `docs/PHASE0_FORENSICS.md` |
| 1 | Recover app | **Done / verify** | App runs; use `VERIFY_CHECKLIST.md` |
| 2 | Baseline architecture | **Done (this pack)** | `docs/current-architecture.md` |
| 3 | Regression tests | **In progress** | Safety + meds + errorHandler tests |
| 4 | Controller→service→repo | **Not started** | Only after 1–3 green |
| 5 | Structured errors | **Partial (this pack)** | AppError + errorHandler |
| 6 | Validation standard | **Partial** | express-validator on auth; expand later |
| 7 | Safety rule modules | **Not started** | Keep deterministic; no AI decisions |
| 8 | Safety vs nutrition split | **Not started** | Keep API compatible |
| 9 | DB indexes/pagination | **Partial** | barcode unique exists |
| 10 | Performance baseline | **Not started** | Measure before Redis |
| 11 | Redis | **Not started** | After Mongo stable |
| 12 | Recommendation engine | **Partial** | Ranking exists; formalize later |
| 13 | BullMQ | **Not started** | Only if real async need |
| 14 | External API reliability | **Partial** | OFF + Gemini timeouts exist |
| 15 | Idempotency | **Not started** | Where useful only |
| 16 | TypeScript | **Not started** | After architecture stable |
| 17 | Broader testing | **Partial** | Expand API tests |
| 18 | Security | **Partial** | Helmet, JWT, rates, SECURITY.md |
| 19 | Docker | **Not started** | After local works |
| 20 | CI/CD | **Partial** | Unit tests in Actions |
| 21 | Logging | **Not started** | Structured logs |
| 22 | OpenAPI | **Not started** | Match real routes |
| 23 | Frontend engineering | **Partial** | Loading/errors/theme |
| 24 | Documentation | **Partial** | README + docs growing |
| 25 | Final review | **Not started** | End checklist |

## What “do all these” means in practice

Completing **0–25 fully** is weeks of careful work. This package completes **0–2**, advances **3 and 5**, and locks the order so we do **not** jump to Redis/Docker/TS while the app is only partially documented and tested.

**Next package after you verify checklist:** Phase 3 more API tests → Phase 4 thin productService (no behavior change) → Phase 7 safety rules folders.
