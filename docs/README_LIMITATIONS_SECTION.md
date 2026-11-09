# Paste into README.md (near the top or before License)

## Important limitations

NutriVibe is a **portfolio / demo** food-intelligence application.

- **Not medical advice.** Results are informational only. Always verify allergy, diet, and medication decisions with a qualified clinician.
- Safety verdicts come from a **deterministic rules engine**. Gemini (when configured) explains; it does not decide SAFE/UNSAFE.
- Incomplete product data yields **CANNOT_VERIFY**, not SAFE.
- Automated tests and a labeled allergen set can show **0 false negatives on that set**; that does not guarantee real-world perfection.
- Sessions may use JWTs in the browser; prefer short `JWT_EXPIRE` and strong `JWT_SECRET` (≥32 chars) in production.
- OpenAPI documents a **subset** of routes; rate limits may be per-process unless Redis is configured.

See `docs/TESTING_REPORT.md` and `SECURITY.md` for more detail.
