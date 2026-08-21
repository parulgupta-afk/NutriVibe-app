# Portfolio talking points (Phase 8)

## One-liner

Personalized food-safety scanner: barcode/OCR + allergy/diet/med profile → Safe / Caution / Unsafe, with family profiles and AI explanations.

## What to emphasize in interviews

1. **Single safety engine** — one `computeSafetyVerdict` path so Scanner, Product, and Tracking never disagree.  
2. **Real matching problems** — plant milks vs dairy, cross-contamination, medication–food interactions.  
3. **Family profiles** — dependents with their own prefs under one account.  
4. **Production habits** — rate limits, env validation, health check with Mongo status, no secrets in git.  
5. **Tests** — `npm test` on the safety engine.

## Repo polish checklist

- [ ] Pin the repo on your GitHub profile  
- [ ] Add topics: `react`, `nodejs`, `mongodb`, `food-safety`, `vite`  
- [ ] Live demo link in README (and keep backend awake or note cold starts)  
- [ ] 1–2 screenshots in README (Scanner + Product verdict)  
- [ ] Optional Loom link under Demo  

## Screenshot ideas

1. Scanner with camera or barcode field  
2. Product page with SafetyBadge (Unsafe for dairy + yogurt)  
3. Dashboard with Safe/Caution/Unsafe cards  

Save images under `docs/screenshots/` and link them from README when ready.
