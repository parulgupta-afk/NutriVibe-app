# NutriVibe Bug Fix & Root-Cause Analysis Report

**Date:** 2026-11-05  
**Engineer:** Principal Software Engineer & QA Automation Engineer  
**Status:** All Issues Resolved & Verified

---

## 1. CI Pipeline Test Runner Failure

### Symptom
GitHub Actions CI pipeline failed during `npm test` step with:
```text
Server: Could not find: tests/**/*.test.js
Client: Could not find: tests/**/*.test.js
```

### Root Cause
Both `server/package.json` and `client/package.json` configured their `"test"` scripts as:
```json
"test": "node --test tests/**/*.test.js"
```
On Linux systems (e.g. Ubuntu runner in GitHub Actions) without `shopt -s globstar`, bash does not expand `**` into current directory files unless subdirectories exist. Since all test suites reside directly in `tests/*.test.js`, bash passed the unexpanded string `tests/**/*.test.js` to Node.js, which resulted in a `Could not find` error.

### Solution
Updated both `server/package.json` and `client/package.json` to quote patterns and explicitly search both root and nested test directories:
```json
"test": "node --test \"tests/*.test.js\" \"tests/**/*.test.js\""
```
### Verification
- `server`: 114 tests across 40 suites pass.
- `client`: 73 tests across 18 suites pass.

---

## 2. Food Safety Engine Fail-Closed Verdicts

### Symptom
Prior implementations risked defaulting to `Safe` when product records lacked ingredient lists or allergen data, presenting a potential health risk to allergic individuals.

### Root Cause
Incomplete Open Food Facts records or unparsed OCR scans lacked explicit allergen tags, allowing products to bypass allergen checks without negative matches.

### Solution
Implemented `hasInsufficientData(product)` in `server/src/safety/rules/allergenRule.js`:
- If ingredient array is empty, allergen array is missing or empty, and risk level is `Unknown`, the safety level is set to `Unknown` / `CANNOT_VERIFY`.
- UI renders `CANNOT_VERIFY` with neutral status indicators, prompting users to inspect physical product labels.

---

## 3. Dependent Profile Resolution Security Vulnerability

### Symptom
If a request passed an invalid, unowned, or deleted `profileId`, `profileResolver` previously fell back to the account owner's profile.

### Root Cause
A missing defensive check in `resolveEffectiveUser()` allowed silent fallback, which could cause a dependent's peanut allergy to be ignored if their profile ID failed to resolve.

### Solution
Updated `server/src/services/profileResolver.js` to fail closed:
- Validates MongoDB ObjectId format.
- Searches exclusively within the authenticated user's dependent profiles.
- Throws an `AppError(404, 'Dependent profile not found')` if the profile ID is invalid or does not belong to the user.

---

## 4. Service Worker Health Data Privacy Leak

### Symptom
The Service Worker cached all GET requests into Cache Storage, including private authenticated API routes (`/api/products`, `/api/profile`, `/api/tracking`).

### Root Cause
A broad caching rule captured `/api/*` responses in offline storage, persisting medical conditions and dietary logs across logout sessions.

### Solution
Restricted the Service Worker to only cache static assets (HTML, CSS, JS, fonts). All `/api/*` routes are handled with a strict network-only strategy, bypassing local Cache Storage entirely.

---

## 5. Public API Key Hardening & Log Leakage

### Symptom
API keys accepted via URL query parameter (`?api_key=...`), exposing secrets in access logs and HTTP referrer headers.

### Root Cause
Flexible authentication parsing permitted query-based authentication tokens.

### Solution
- Removed query parameter parsing for API keys in `server/src/middleware/apiKeyAuth.js`.
- Restricted API keys to `X-API-Key` or `Authorization: Bearer` headers.
- Implemented rate limiting and input length limits on `/api/v1/check`.

---

## 6. Content Security Policy (CSP) & Body Size Limits

### Symptom
CSP was disabled by default, and global body parsers allowed 8MB JSON payloads on all endpoints.

### Root Cause
Overly permissive global middleware configuration intended to support OCR image uploads.

### Solution
- Configured Helmet with explicit CSP directives (`script-src 'self'`, `img-src 'self' data: https:`, `frame-ancestors 'none'`).
- Restructured body parsers: global JSON parser set to 100KB; 10MB limit restricted exclusively to multipart meal photo and OCR routes.

