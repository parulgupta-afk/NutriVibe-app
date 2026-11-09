# NutriVibe QA & Automated Testing Report

**Date:** 2026-11-09  
**Branch / commit:** update after applying v1.0 finalization fixes  
**Status:** Automated suites passing · **Not production-ready for real clinical use**

---

## 1. Test execution summary (fill with your latest local run)

| Test domain | Command | Expected | Your result |
| --- | --- | --- | --- |
| Backend | `cd server && npm test` | All pass | |
| Frontend lint | `cd client && npm run lint` | 0 errors | |
| Frontend tests | `cd client && npm test` | All pass | |
| Frontend build | `cd client && npm run build` | Success | |
| Server audit | `cd server && npm audit --omit=dev` | 0 vulns | |
| Client audit | `cd client && npm audit --omit=dev` | 0 vulns | |

Replace this table with the real numbers from your machine after applying the password-length fix.

---

## 2. Known limitations (honest)

Do **not** describe this release as “Production Ready” or “100% Passed” for real allergy/medication use.

| Area | Limitation |
| --- | --- |
| Clinical safety | No medical device / clinical validation. Informational only. Users must verify with a clinician. |
| Password policy | Register and reset now both require **min 10 characters** (this fix package). Common-password denylist and strength scoring are still basic. |
| Session security | Access tokens may still live in `localStorage` with multi-day lifetime; no full refresh-token rotation / logout-all in all environments. |
| Validation | Not every route uses the same Zod/express-validator coverage; some endpoints rely on older or partial checks. |
| OpenAPI | Only a subset of routes are documented in `openapi.json` (about 10 paths). The contract test must not claim full coverage until it is wired to the real route list. |
| Rate limiting | May be in-memory per process; multi-instance Redis-backed limits are not fully verified. |
| E2E | No full Playwright browser journey in CI against real Mongo in all environments. |
| Eval set | Allergen FNR can be 0 on the labeled set and still miss novel wording in the wild. |

---

## 3. What this fix package changes

1. **Reset password** server check: minimum length **10** (was 6).  
2. **Register** validation (middleware + routes): minimum length **10**.  
3. **Client** Register + ResetPassword: UI min length **10**.  
4. This report: removes “Production Ready” / “100% Passed” marketing language; adds Known limitations.

---

## 4. Medical disclaimer

NutriVibe provides informational food and nutrition insights only. It is not a substitute for professional medical advice. Always verify important dietary, allergy, and medication-related decisions with a qualified healthcare professional.
