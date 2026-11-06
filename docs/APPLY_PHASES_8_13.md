# Applying Phases 8–13

Copy into repo root (merge with existing folders):

```bash
cp -r server/src/middleware/logger.js /path/to/NutriVibe-app/server/src/middleware/
cp server/src/controllers/meController.js /path/to/NutriVibe-app/server/src/controllers/
cp server/src/routes/healthRoutes.js /path/to/NutriVibe-app/server/src/routes/
cp -r docs/* /path/to/NutriVibe-app/docs/
cp scripts/smoke.sh /path/to/NutriVibe-app/scripts/
cp client/src/pages/PrivacyPolicy.jsx /path/to/NutriVibe-app/client/src/pages/
```

Then:

1. `cd server && npm install pino pino-http`
2. Mount health + me routes; wire real Mongo/Redis checks and cascade delete
3. Implement Playwright E2E, coverage, CI pins (Phase 10)
4. Merge ui-prototype screen-by-screen (Phase 11)
5. Run smoke.sh against Docker; fill DEPLOYMENT_VERIFICATION.md with real results
6. Complete interview doc and release report from actual evidence
