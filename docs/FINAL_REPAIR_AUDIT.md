# NutriVibe Final Repair Audit

This document records the comprehensive engineering audit of the NutriVibe codebase conducted prior to implementation, in accordance with the release verification protocol.

---

## 1. Executive Summary & Existing Functionality

The repository contains a full-stack MERN application with a React + Vite client and an Express.js backend.

### Active Components Identified

- **Backend (`server/`)**: Express 5.x server with MongoDB / Mongoose models, JWT authentication, deterministic safety engine (`safetyEngine.js`), modular rules (`allergenRule.js`, `dietRule.js`, `medicationRule.js`, `processingRule.js`), rate limiting, Gemini AI safety layer, and 44 Node test runner test suites.
- **Frontend (`client/`)**: React 18 SPA built with Vite, Tailwind CSS, React Router, Framer Motion, and Lucide React.
- **Rules Engine**: Modular, deterministic evaluation covering allergens, cross-contamination, medication interactions, and dietary preferences.

---

## 2. Defects & Deficiencies Discovered

### A. Safety Engine & Evaluation Runner (Critical)

1. **Scaffold Evaluation Runner (`server/tests/eval/evaluate.js`)**:
   - The test script `server/tests/eval/evaluate.js` defined a synthetic `runVerdict(product, profile)` helper with hardcoded regex and mock logic instead of importing and exercising the production `computeSafetyVerdict(product, user)` engine.
2. **Evaluation Dataset Incompleteness (`server/tests/eval/cases.json`)**:
   - Contains only 18 cases. It lacks full coverage of all 14 major allergens, hidden derivatives (lecithins, albumins, caseins), Jain root-vegetable restrictions, multilingual Indian food terms, diverse INS additives, and edge-case OCR noise.
3. **Data Ingestion Shape Discrepancy in `allergenRule.js`**:
   - `productTextBlob` and `findMatchingAllergens` spread `product.ingredients` directly with `...(product.ingredients || [])`. If `ingredients` is supplied as a single string (as in text exports or raw OCR), it spreads characters with spaces, corrupting token matching. Top-level `allergens`, `warnings`, and `mayContain` are ignored if `safetyInfo` is omitted.
4. **Missing Jain Diet Rule**:
   - `server/src/data/dietaryRules.js` defines Vegan, Vegetarian, Halal, etc., but lacks Jain dietary restrictions (root vegetables such as onion, garlic, potato, radish, ginger).

### B. Authorization & IDOR Verification

1. **Commented-Out Ownership Tests (`server/tests/authz/ownership.test.js`)**:
   - The test suite contains empty test cases with all assertions commented out.
2. **Unimplemented Authz Helpers (`server/tests/authz/authz.helpers.js`)**:
   - `createUser` and `createOwnedResource` throw `'Wire to your test register helper'`.
3. **Strict JWT Parsing & Algorithm Pinning (`server/src/middleware/auth.js`)**:
   - `jwt.verify` does not explicitly specify `algorithms: ['HS256']`. Bearer extraction uses `.startsWith('Bearer')` without strict whitespace/token pattern matching.

### C. Account Export & Deletion (`server/src/controllers/meController.js`)

1. **Empty Placeholders**:
   - `exportMe` returns empty arrays for dependents, meals, hydration, tracking, favorites.
   - `deleteMe` contains commented-out password checks and cascade deletions.
2. **Unmounted Routes**:
   - `meController` is not mounted to any active route in `server/src/app.js` or `authRoutes.js`.

### D. Health & Readiness Probes (`server/src/routes/healthRoutes.js`)

1. **Hardcoded Health Stubs**:
   - `healthRoutes.js` contains `checks.mongo = true;` and reports Redis healthy based merely on `!!process.env.REDIS_URL` without performing a ping.
2. **Duplicate Route Definitions**:
   - `server/src/app.js` declared inline `/api/health` and `/api/ready`, while `healthRoutes.js` was unmounted or conflicting.

### E. Frontend API Alignment & Mock Data (`client/src/api/index.js`, `client/src/pages/Scanner.jsx`)

1. **Mismatched Endpoints in Prototype API**:
   - `client/src/api/index.js` references `/scanner/barcode`, `/scanner/label`, `/nutrition/daily`, `/meals/today`.
   - Real backend endpoints are `GET /api/products/barcode/:barcode`, `POST /api/products/scan-label`, `GET /api/meals/today`, etc.
2. **Mock-Only Scanner Screen (`client/src/pages/Scanner.jsx`)**:
   - The UI prototype replaced camera/OCR scanning with a static list of mock items. Camera and barcode scanning logic must be restored with production API connectivity while preserving the refined UI design.

### F. Documentation Accuracy

1. **Unverified Badges in `README.md`**:
   - Claims 207/207 tests passed and deployment verified, which must reflect actual verified test counts.

---

## 3. Files Requiring Implementation & Repair

| Component | Target File | Actions Required |
| --- | --- | --- |
| Safety Engine | `server/src/safety/rules/allergenRule.js` | Fix product text/ingredient parsing, handle string/array normalization, fail-closed OCR checks |
| Dietary Rules | `server/src/data/dietaryRules.js` | Add Jain dietary rules (root vegetables, onions, garlic) |
| Evaluation Suite | `server/tests/eval/evaluate.js` | Wire directly to production `computeSafetyVerdict`, calculate confusion matrix & category metrics |
| Evaluation Cases | `server/tests/eval/cases.json` | Expand to >= 150 meticulously labeled test cases across all 14 allergens, interactions, and edge cases |
| Authz & IDOR | `server/tests/authz/ownership.test.js`, `authz.helpers.js` | Implement executable cross-user isolation tests against live endpoints |
| Auth Middleware | `server/src/middleware/auth.js` | Add algorithm pinning, strict Bearer regex, and production secret checks |
| Account Privacy | `server/src/controllers/meController.js`, `server/src/routes/meRoutes.js` | Implement real owned-data export and password-confirmed cascade deletion |
| Probes | `server/src/routes/healthRoutes.js`, `server/src/app.js` | Single authoritative health/ready check with real Mongo `readyState` and Redis `ping` |
| AI Safety | `server/src/services/aiSafety.js`, `server/tests/aiSafety.test.js` | Add adversarial prompt-injection tests, distributed Redis quota support with memory fallback |
| Frontend API | `client/src/api/index.js` | Map every call to verified backend routes (`/api/products/barcode/:barcode`, `/api/products/scan-label`, etc.) |
| Frontend Scanner | `client/src/pages/Scanner.jsx` | Support live camera scanning, manual barcode entry, and OCR label upload wired to real backend |
| Documentation | `README.md`, `docs/AUTHZ_MATRIX.md`, `docs/FINAL_RELEASE_REPORT.md` | Align badges, authorization matrix, and verified test results |

---

## 4. Potential Breaking Changes & Safeguards

- **Strict Bearer Authorization**: Malformed headers without single-space `Bearer <token>` will correctly receive 401.
- **Account Cascade Deletion**: Permanent and destructive; secured by required password validation and atomic deletion sequence.
- **Canonical Verdicts**: Responses standardize on `SAFE`, `CAUTION`, `UNSAFE`, and `CANNOT_VERIFY`, while maintaining backward-compatible `level` and `score` fields.
