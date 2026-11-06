# Phase 10 — Testing & CI

## Tasks

1. Delete `server/tests/scratch_e2e_test.js` if still present.
2. Add Playwright E2E: register → dependent + allergy → mocked scan → UNSAFE → log → export.
3. Mongo service container in GitHub Actions for E2E.
4. `c8` coverage threshold 70% on safety/, middleware/, services/.
5. Server `npm run lint` (ESLint).
6. Pin GitHub Actions to full commit SHAs (`gh api` to look up — never invent).
7. Gitleaks secret scanning.
8. No `continue-on-error` on mandatory jobs.

## Playwright sketch

```javascript
// e2e/safety-journey.spec.ts
// mock barcode API; assert verdict text includes UNSAFE + icon/word/colour
```
