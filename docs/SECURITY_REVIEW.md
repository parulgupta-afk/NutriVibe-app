# NutriVibe Application Security Review

**Date:** 2026-11-05  
**Auditor:** Application Security Engineer & Backend Architect  
**Classification:** Production Security Assessment

---

## 1. Security Architecture Overview

NutriVibe processes personal health, dietary, and allergy data. The security posture is built upon defense-in-depth principles across transport, authentication, authorization, data validation, and third-party integrations.

---

## 2. Security Controls & Implementation Details

### 2.1 Content Security Policy (CSP) & HTTP Headers

- **Implementation:** Configured via `helmet` in `server/src/middleware/security.js`.
- **Directives:**
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' 'unsafe-inline'` (for dynamic theme and tailwind styling)
  - `img-src 'self' data: https: blob:` (Open Food Facts product imagery)
  - `connect-src 'self' https://world.openfoodfacts.org`
  - `frame-ancestors 'none'` (anti-clickjacking protection)
- **Headers Enforced:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 2.2 Cross-Origin Resource Sharing (CORS)

- **Implementation:** Configured via `cors` middleware in `server/server.js`.
- **Access Control:** Restricted to origins specified in `CLIENT_URL` (defaulting to `http://localhost:5173` in development, verified Vercel production origin in production).
- **Credentials:** `credentials: true` enabled only for authorized origins; wildcard origins (`*`) are disallowed.

### 2.3 Authentication & Session Management

- **JWT Authentication:** Tokens signed with HMAC-SHA256 using `JWT_SECRET`. Tokens expire in 7 days (`JWT_EXPIRE`).
- **Password Hashing:** Passwords hashed with `bcryptjs` using 12 salt rounds before storage.
- **Google OAuth:** Verified server-side via `google-auth-library` `verifyIdToken()`. Client ID matches `GOOGLE_CLIENT_ID`. Accounts are securely linked by verified email address.
- **Password Reset:** Generates cryptographically secure random tokens (`crypto.randomBytes(32)`), hashes them with SHA-256 before persisting to MongoDB, and sets a 1-hour expiration timestamp.

### 2.4 Authorization & Fail-Closed Access Control

- **Profile Resolution:** `resolveEffectiveUser()` validates dependent profile access against `user.dependents`. If `profileId` is invalid, not an ObjectId, or belongs to another user account, the system throws an HTTP 404/403. Silent fallback to the account owner is blocked to prevent false "Safe" verdicts when a dependent has critical allergies.
- **Resource Ownership:** Meal logs, hydration logs, favorites, and reaction records enforce user ownership filters on every database query (`{ _id: req.params.id, userId: req.user._id }`).

### 2.5 Input Validation & Injection Defense

- **Validation:** Uses `express-validator` on all mutation endpoints (registration, login, profile updates, manual meal logs, feedback submissions).
- **NoSQL Injection:** Mongoose strict schema casting prevents operator injection (`$gt`, `$ne`). Query parameters are sanitized.
- **Body Size Caps:** Global JSON payloads capped at 100KB to prevent memory exhaustion (DoS). Multipart routes for OCR and meal photos are isolated with dedicated 10MB limits.

### 2.6 Rate Limiting

- **Global API Limiter:** 100 requests per 15 minutes per IP.
- **Authentication Limiter:** 10 attempts per 15 minutes per IP on `/api/auth/login` and `/api/auth/register`.
- **Public API Limiter:** Rate limited per API key; usage tracked against hourly allowances.
- **Health Check Exemption:** `/api/health` is exempt from general rate limiters so monitoring probes function reliably.

### 2.7 Sensitive Data Protection & Third-Party APIs

- **Google Gemini API:** API keys stored server-side only in environment variables; keys are never transmitted to clients. Prompts sanitize and delimit product text.
- **Open Food Facts API:** Uses custom User-Agent strings adhering to Open Food Facts terms of service. Responses cached to reduce external traffic.
- **Service Worker Privacy:** Service Worker excludes `/api/*` from Cache Storage, preventing local persistence of private medical and allergen data.

---

## 3. Dependency Vulnerability Audit

Audited via `npm audit --omit=dev`:

- **Server:** 0 vulnerabilities.
- **Client:** 0 vulnerabilities.
- **Overrides:** Fixed nested dependencies via explicit npm overrides where needed (`minimatch: ^11.0.1`, `esbuild: ^0.25.0`).
