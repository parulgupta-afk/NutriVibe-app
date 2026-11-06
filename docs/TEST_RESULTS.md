# NutriVibe — Comprehensive Test Results & Quality Report

**Date**: November 2026  
**Test Framework**: Native Node.js Test Runner (`node --test`)  
**Overall Status**: **207 / 207 TESTS PASSING (100% SUCCESS RATE)**  

---

## 1. Test Execution Summary

| Test Domain | Tests Run | Tests Passed | Tests Failed | Suites | Execution Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Service Suites** | 114 | 114 | 0 | 40 | 3.17s |
| **Food Safety Canonical Modes** | 14 | 14 | 0 | 1 | 0.96s |
| **Frontend Unit & Utility Suites** | 79 | 79 | 0 | 19 | 0.65s |
| **TOTALS** | **207** | **207** | **0** | **60** | **4.78s** |

---

## 2. Food Safety Engine Verification (14 Mandatory Modes)

Executed via `server/tests/safetyEngineCanonical.test.js`:

```text
TAP version 13
# Subtest: Phase 2 — Canonical Food Safety Engine Verification (14 Mandatory Modes)
    # Subtest: Mode 1: Complete product with no detected allergens returns SAFE
    ok 1 - Mode 1: Complete product with no detected allergens returns SAFE
    # Subtest: Mode 2: Missing ingredients list returns CANNOT_VERIFY
    ok 2 - Mode 2: Missing ingredients list returns CANNOT_VERIFY
    # Subtest: Mode 3: Missing allergen information when user has declared allergies returns CANNOT_VERIFY
    ok 3 - Mode 3: Missing allergen information when user has declared allergies returns CANNOT_VERIFY
    # Subtest: Mode 4: Empty product record {} returns CANNOT_VERIFY
    ok 4 - Mode 4: Empty product record {} returns CANNOT_VERIFY
    # Subtest: Mode 5: OCR extraction failure returns CANNOT_VERIFY
    ok 5 - Mode 5: OCR extraction failure returns CANNOT_VERIFY
    # Subtest: Mode 6: Unreadable ingredient list returns CANNOT_VERIFY
    ok 6 - Mode 6: Unreadable ingredient list returns CANNOT_VERIFY
    # Subtest: Mode 7: Known direct allergen match returns UNSAFE
    ok 7 - Mode 7: Known direct allergen match returns UNSAFE
    # Subtest: Mode 8: Cross-contamination warning relevant to user allergies returns CAUTION
    ok 8 - Mode 8: Cross-contamination warning relevant to user allergies returns CAUTION
    # Subtest: Mode 9: Contradictory product packaging returns CAUTION (or UNSAFE if allergic)
    ok 9 - Mode 9: Contradictory product packaging returns CAUTION (or UNSAFE if allergic)
    # Subtest: Mode 10: Unknown risk level with empty ingredients returns CANNOT_VERIFY
    ok 10 - Mode 10: Unknown risk level with empty ingredients returns CANNOT_VERIFY
    # Subtest: Mode 11: Invalid or unowned dependent profile ID fails closed with 404
    ok 11 - Mode 11: Invalid or unowned dependent profile ID fails closed with 404
    # Subtest: Mode 12: Valid dependent profile ID evaluates safety against dependent preferences
    ok 12 - Mode 12: Valid dependent profile ID evaluates safety against dependent preferences
    # Subtest: Mode 13: Gemini API error or missing key delivers safety verdict without failure
    ok 13 - Mode 13: Gemini API error or missing key delivers safety verdict without failure
    # Subtest: Mode 14: Gemini API malformed response falls back gracefully without crashing
    ok 14 - Mode 14: Gemini API malformed response falls back gracefully without crashing
    1..14
ok 1 - Phase 2 — Canonical Food Safety Engine Verification (14 Mandatory Modes)
```

---

## 3. Backend Test Suites Breakdown

Executed via `cd server; npm test`:

- `allergenRule.test.js`: Direct allergen detection, exclusion phrases (oat milk != dairy), cross-contamination logic.
- `AppError.test.js`: Machine-readable error codes and HTTP mapping.
- `dietPlannerService.test.js`: Meal plan allergen filtering and vegetarian constraint enforcement.
- `dietRule.test.js`: Dietary preference conflict factors and score degradation.
- `dietaryRules.test.js`: Diet datasets (vegan, vegetarian, gluten-free, keto, halal, kosher).
- `errorHandler.test.js`: JWT expiration, CastError, duplicate key (11000), and validation error formatting.
- `favoritesController.test.js`: Bookmark creation, deduplication, and removal.
- `foodController.test.js`: Custom food item ingestion and nutritional calculations.
- `geminiExplainerService.test.js`: AI context building, caching, and fallback behavior.
- `googleAuth.test.js`: Google token verification and account auto-linking.
- `hydrationController.test.js`: Water intake logging, daily goal increments, and historical stats.
- `mealController.test.js`: Food logging, daily calorie rollup, and macro sums.
- `medicationInteractions.test.js`: Severe vs medium contraindications (grapefruit + statins, MAOIs).
- `medicationRule.test.js`: Medication severity impact on overall verdict.
- `openFoodFactsService.test.js`: OFF API payload normalization and timeout resilience.
- `passwordReset.test.js`: Password reset token generation, hashing, and expiration.
- `processingLevel.test.js`: NOVA 1-4 classification and ultra-processed food flags.
- `processingRule.test.js`: Additive penalty calculations and NOVA factors.
- `productController.test.js`: Barcode lookup, search, safe swaps, and error handling.
- `productModel.test.js`: Product schema constraints and field defaults.
- `productService.test.js`: Safety report generation and alternative candidate ranking.
- `profileResolver.test.js`: Fail-closed dependent profile resolution and ownership checks.
- `publicApiController.test.js`: Public API key authentication, rate limits, and `/v1/check`.
- `publicApiShape.test.js`: Public API payload contract verification.
- `reactionController.test.js`: Adverse symptom logging and linked scan association.
- `recommendationService.test.js`: Alternative food ranking algorithm and Unsafe candidate filtering.
- `redisConfig.test.js`: In-memory cache fallback when Redis is absent.
- `safetyBadgeProps.test.js`: Verdict mapping for frontend badges.
- `safetyController.test.js`: `/api/safety/check` controller endpoints.
- `safetyEngine.test.js`: Core deterministic engine rules and score bounds.
- `safetyEngineCanonical.test.js`: 14 mandatory safety and uncertainty modes.
- `safetyReportModel.test.js`: SafetyReport Mongoose model validation.
- `safetyStructure.test.js`: Dual-structure support (legacy flat + Phase 8 nested).
- `streakService.test.js`: Daily engagement streaks and milestone achievements.
- `submissionController.test.js`: Crowdsourced food submission and admin review.
- `trackingController.test.js`: Activity audit trail logging and statistics aggregation.
- `validateEnv.test.js`: Secret masking and environment validation.
- `validationMiddleware.test.js`: Request payload validation and error responses.
- `vibeAIService.test.js`: Safety query detection and AI chat response formatting.

---

## 4. Frontend Test Suites Breakdown

Executed via `cd client; npm test`:

- `allergenHelper.test.js`: Allergen name normalization, color tagging, and badges.
- `barcodeValidator.test.js`: EAN-13 check digit calculation and format validation.
- `bmiCalculator.test.js`: Metric/imperial BMI calculation and risk categorization.
- `dateFormatter.test.js`: ISO-8601 formatting, relative times, and fallback formatting.
- `debounce.test.js`: Input debounce and cancellation timers.
- `exportCsv.test.js`: RFC 4180 CSV escaping, column mapping, and field sanitization.
- `ingredientParser.test.js`: Raw ingredient string splitting, parenthetical grouping, and cleaning.
- `macroCalculator.test.js`: Calorie/carb/protein/fat total sums and percentages.
- `novaHelper.test.js`: NOVA group 1-4 colors, icons, and descriptions.
- `nutritionScore.test.js`: Nutri-Score calculation (grades A through E).
- `offlineQueue.test.js`: LocalStorage offline mutation queue and sync retry logic.
- `passwordStrength.test.js`: Entropy calculation, length checks, and feedback messages.
- `productValidator.test.js`: Product creation form validation and constraints.
- `profileValidator.test.js`: Dependent profile input sanitation.
- `safeStorage.test.js`: Safe localStorage wrapper with in-memory fallback.
- `textTruncate.test.js`: Safe word/character boundary truncation.
- `apiError.test.js`: Axios error unwrapping and status extraction.
- `lastScanCache.test.js`: Local scan history caching and retrieval.
- `verdictRing.test.js`: Verdict ring styling, SVG stroke percentages, and ARIA labels.

---

## 5. Performance Benchmarks

- **Backend Test Runner**: ~3.3s total wall-clock time for 128 tests across 41 suites.
- **Canonical Safety Modes**: ~0.96s for all 14 boundary and uncertainty test modes.
- **Frontend Test Runner**: ~0.65s for 79 tests across 19 suites.
- **Total Test Execution**: < 5 seconds total runtime across all test domains.

---

## 6. Verification Commands

To reproduce the complete test runs:

```bash
# Backend test suite (128 tests)
cd server
npm test

# Dedicated canonical safety modes test
node --test tests/safetyEngineCanonical.test.js

# Frontend test suite (79 tests)
cd ../client
npm test

# Client static analysis & linting
npm run lint

# Production build verification
npm run build
```
