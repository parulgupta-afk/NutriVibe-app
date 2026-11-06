# Phases 8–13 — copy into NutriVibe-app root

```bash
cp server/src/middleware/logger.js /path/to/NutriVibe-app/server/src/middleware/
cp server/src/controllers/meController.js /path/to/NutriVibe-app/server/src/controllers/
cp server/src/routes/healthRoutes.js /path/to/NutriVibe-app/server/src/routes/
mkdir -p /path/to/NutriVibe-app/scripts
cp scripts/smoke.sh /path/to/NutriVibe-app/scripts/
chmod +x /path/to/NutriVibe-app/scripts/smoke.sh
cp docs/*.md /path/to/NutriVibe-app/docs/
cp client/src/pages/PrivacyPolicy.jsx /path/to/NutriVibe-app/client/src/pages/
```

See docs/APPLY_PHASES_8_13.md for wiring steps.
