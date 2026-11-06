# Phase 0 — Repository Audit & Baseline

**Branch to use:** `feature/nutrivibe-production-readiness`  
**Base:** latest `origin/main`

## Already verified (do not rewrite)

From previous security work (re-verify only):

| Control | Status | Location |
| --------- | -------- | ---------- |
| Dependent-profile ownership fails closed | DONE | `server/src/services/profileResolver.js` |
| Public API keys hashed + quota + revocation | DONE | `publicApiController.js`, `ApiKey` model |
| Service worker does not cache private API | DONE | `client/public/sw.js` |
| Strict CSP + body size limits | DONE | `server/src/app.js` |
| NoSQL operator sanitizer | DONE | validation middleware |
| Canonical verdicts SAFE / CAUTION / UNSAFE / CANNOT_VERIFY | DONE | safety engine |

## Key paths

```text
server/src/services/          safetyEngine, profileResolver, gemini*
server/src/controllers/       auth, publicApi, safety, ai, ...
server/src/middleware/        auth, validation, errorHandler
server/src/models/            User, Dependent, ApiKey, Meal, ...
server/tests/                 existing unit/integration tests
client/src/                   existing React app
docs/                         architecture, deploy notes
.github/workflows/            ci.yml, codeql.yml
```

## Baseline commands (run before any changes)

```bash
git fetch origin
git ls-remote origin refs/heads/main
git switch -c feature/nutrivibe-production-readiness origin/main

cd server && npm ci && npm test
cd ../client && npm ci && npm run lint && npm test && npm run build
```

Record exact exit codes, test counts, and failures in this file after first run.
