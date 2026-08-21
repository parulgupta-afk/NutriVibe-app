# Phase 0 — Repository forensics

**Repo:** `parulgupta-afk/NutriVibe-app`  
**Inspected:** main branch (as of Phase 19 commits)  
**Rule:** report only — no architecture rewrite in this phase.

---

## CURRENT ARCHITECTURE

```
client/ (React 18 + Vite + Tailwind)
  pages, contexts (Auth, Profile, Theme), api/*.js
       │  HTTP /api/*  (Vite proxy in dev; VITE_API_BASE_URL in prod)
       ▼
server/ (Express 5 + Mongoose 9)
  server.js → validateEnv → connectDB → app.js
  routes → controllers → services + models
  data/ (allergenKeywords, dietaryRules, medicationInteractions)
  middleware (auth, validation, errorHandler)
       ▼
MongoDB Atlas
External: Open Food Facts, Google Gemini, Google OAuth, Tesseract (client)
```

**Not present (correct for current scale):** Redis, BullMQ, GraphQL, microservices, TypeScript, Docker, OpenAPI.

---

## CURRENT STARTUP FLOW

| Side | Command | Entry |
|------|---------|--------|
| Backend | `cd server && npm install && npm run dev` | `nodemon server.js` |
| Backend prod | `npm start` | `node server.js` |
| Frontend | `cd client && npm install && npm run dev` | Vite `:5173`, proxies `/api` → `:5000` |
| Tests | `cd server && npm test` | Node built-in test runner |

**Required env (server):** `MONGO_URI`, `JWT_SECRET`  
**Prod also:** `CLIENT_URL`  
**Optional:** `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, SMTP_*  
**Client optional:** `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`

---

## CURRENT ERRORS / KNOWN RISKS

| Item | Severity | Notes |
|------|----------|--------|
| App runs after recovery | — | User confirmed server + Mongo connected |
| Controllers hold some business logic | Medium | productController is large (seed, OFF, safety) |
| Safety engine is modular data + one service | Low | Not yet `safety/rules/*` folders |
| Error responses use `message` only | Low | Not structured `{ error: { code } }` yet |
| Tests cover safety + meds only | Medium | Not full API regression suite |
| No Redis/Docker/TS | — | By design until later phases |
| Free-tier API cold starts | Ops | Deploy concern, not code bug |

---

## LIKELY ROOT CAUSES (historical breakage)

1. AI-assisted edits that diverged from working Aug 2 tree  
2. Git history lost locally after zip restore (`.git` missing) — recovered via `origin/main`  
3. Mongo `bad auth` was env password mismatch, not app logic  
4. Incomplete theme push (ThemeContext without full Tailwind wiring) — fixed in later commits  

---

## RECENT CHANGES (high level)

Feature track commits on main include: safety matching, dietary rules, OFF reliability, SafetyBadge, production limits, favorites, a11y, dark/light theme, CI unit tests, deploy docs.

---

## RECOVERY PLAN (this engineering roadmap)

| Order | Phase | Goal |
|------:|-------|------|
| 1 | 0–1 | Forensics + confirm app runs (this doc + verify checklist) |
| 2 | 2 | `docs/current-architecture.md` |
| 3 | 3 | Regression tests for critical paths |
| 4 | 5–6 | Structured errors + validation consistency |
| 5 | 4, 7–8 | Thin controllers, safety rule modules (behavior preserved) |
| 6 | 9–10 | Indexes/pagination + measure before cache |
| 7 | 11+ | Redis, queues, TS, Docker **only after** above is green |

**Stability first:** do not introduce Redis/BullMQ/TS/Docker while recovering or before regression tests exist.
