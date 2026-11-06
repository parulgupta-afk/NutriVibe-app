# ADR 008: Service Worker Cache Privacy Hardening

## Context

The PWA service worker previously cached all successful GET responses under `/api` and `/v1`. This meant private health data (allergies, medications, meal tracking, reactions) was stored in browser Cache Storage, which survived account logout and was vulnerable on shared devices.

## Decision

- The service worker only caches the application shell and static assets (`/`, `/index.html`, `/manifest.json`, `/favicon.svg`).
- API requests under `/api` and `/v1` are strictly network-only and never cached.
- Offline API requests return an explicit JSON 503 response (`{ success: false, message: "You appear to be offline." }`).
- Cache name bumped to `nutrivibe-v4` to purge all stale caches upon worker activation.

## Consequences

- Private user health information is never persisted in plain cache storage.
- Tested using VM-based unit test in `client/tests/serviceWorker.test.js`.
