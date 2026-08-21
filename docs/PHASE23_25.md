# Engineering Phases 23–25

## Phase 23 — Frontend engineering

- `ErrorBoundary` around routes
- Lazy-loaded pages (`React.lazy` + `Suspense`) — same UI, smaller initial JS
- `utils/apiError.js` — consistent API error messages for toasts

**Not done:** full visual redesign (by design).

## Phase 24 — Documentation

- `docs/api.md`
- `docs/database.md`
- `docs/development.md`
- `docs/decisions/README.md`
- README links updated

## Phase 25 — Final review

- `docs/FINAL_REVIEW.md` — sign-off checklist

## Apply

```
client/src/App.jsx
client/src/components/common/ErrorBoundary.jsx
client/src/utils/apiError.js
README.md
docs/api.md
docs/database.md
docs/development.md
docs/FINAL_REVIEW.md
docs/decisions/README.md
docs/PHASE23_25.md
```

```bash
cd client
npm run build
npm run dev
```

```cmd
cd C:\Users\parul\NutriVibe-app
git add client\src\App.jsx client\src\components\common\ErrorBoundary.jsx client\src\utils\apiError.js README.md docs\api.md docs\database.md docs\development.md docs\FINAL_REVIEW.md docs\decisions docs\PHASE23_25.md
git commit -m "engineering: Phase 23-25 frontend polish, docs suite, final review checklist"
git push origin main
```

## Engineering roadmap complete

Phases **0–25** of the recovery/upgrade plan now have deliverables.  
Optional later: full TypeScript migration, BullMQ, stricter CSP.
