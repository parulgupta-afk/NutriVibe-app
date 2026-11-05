# Changelog

## NutriVibe 2.0 (Dual Frontend & Security Hardening)

- Added `client-v2` (NutriVibe 2.0 UI) with Framer Motion, Recharts, and Lucide icons running on port 5174
- Applied fail-closed security patches for dependent profile resolution (no silent owner fallback)
- Hardened public API keys with hourly rate limiting and X-API-Key header requirement
- Enforced Content-Security-Policy (CSP) and scoped request body size limits
- Hardened PWA service worker to ensure private health data is never stored in browser cache
- Upgraded Vite to 6.4.5 across both frontends resolving all audit vulnerabilities

## Phase 16–18 (final polish)

- Demo product auto-seed runs only in development (not production)
- Scroll-to-top on route change
- GitHub Actions CI runs `server` unit tests on push/PR to `main`

## Phase 13–15

- Fixed duplicate Mongo index on product barcode
- Saved products (favorites) API + UI

## Phase 10–12

- Accessibility (skip link, 404, ARIA)
- Medication interaction tests
- Dark mode

## Phase 7–9

- Deploy guide, portfolio docs, security notes

## Phase 4–6

- Production readiness, safer swaps, log search/CSV, last-scan cache, MIT license

## Phase 0–3

- Safety engine improvements, dietary rules, OFF reliability, SafetyBadge, tests
