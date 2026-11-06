# ADR 009: Content-Security-Policy & Request Body Size Limits

## Context

Earlier backend configurations allowed up to 8MB JSON payloads on all API endpoints and had Content-Security-Policy (CSP) disabled in Helmet. This increased denial-of-service risk from oversized request bodies.

## Decision

- Enforce a strict 100kb JSON body limit by default across all routes.
- Elevate body size to 8MB only on routes that accept base64-encoded images (`/api/ai/*` and `/api/meals/*`).
- Enforce deny-by-default CSP headers via Helmet (`default-src 'none'`, `frame-ancestors 'none'`, `base-uri 'none'`).
- Scope relaxed CSP strictly to the interactive documentation route (`GET /api/docs`).

## Consequences

- Protects API memory from exhaustion while still supporting photo meal logging.
- Conforms to OWASP secure headers standards.
