# Engineering Phases 19–22

## Phase 19 — Docker

| File | Role |
|------|------|
| `server/Dockerfile` | API image |
| `client/Dockerfile` + `nginx.conf` | Static SPA |
| `docker-compose.yml` | api + web + redis |
| `.dockerignore` | Keep images small |

```bash
# fill server/.env first (MONGO_URI, JWT_SECRET, CLIENT_URL=http://localhost:8080)
docker compose up --build
# API  http://localhost:5000/api/health
# Web  http://localhost:8080
```

## Phase 20 — CI

`.github/workflows/ci.yml` now:

1. Server unit tests  
2. Client install + build (+ lint best-effort)  
3. Docker build for API image  

## Phase 21 — Structured logging

- `requestLogger` → JSON lines with `requestId`, `method`, `path`, `status`, `durationMs`, `userId`
- Echoes `X-Request-Id` on responses  
- Does **not** log tokens, passwords, or bodies  

## Phase 22 — OpenAPI

- Spec: `server/src/docs/openapi.json` (real routes only)  
- `GET /api/openapi.json`  
- `GET /api/docs` — Swagger UI (CDN)  

## Apply

Copy into repo root / matching paths, then:

```bash
cd server && npm test && npm run dev
# open http://localhost:5000/api/docs
```

```bash
git add docker-compose.yml server/Dockerfile server/.dockerignore \
  client/Dockerfile client/nginx.conf client/.dockerignore \
  .github/workflows/ci.yml \
  server/src/middleware/requestLogger.js server/src/docs/openapi.json server/src/app.js \
  docs/PHASE19_22.md
git commit -m "engineering: Phase 19-22 Docker, expanded CI, structured logs, OpenAPI"
git push origin main
```

## Remaining

**23** frontend engineering · **24** documentation suite · **25** final review  
