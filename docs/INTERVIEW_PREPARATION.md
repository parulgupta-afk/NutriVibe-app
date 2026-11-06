# Phase 13 — Interview preparation (outline)

## Architecture

- MERN; client via Vite; server Express + MongoDB; optional Redis
- Safety path: scan/OCR → product data → **deterministic rules engine** → verdict; Gemini explains only

## Why rules-engine-first

- Allergen false negatives are unacceptable; LLMs can hallucinate
- Missing data → CANNOT_VERIFY / never silent SAFE
- Evaluated with labeled cases + FNR gate in CI

## Security highlights

- JWT HS256 only; tokenVersion; rotating refresh (when fully wired)
- Ownership queries for IDOR; fail-closed profileId
- Zod validation; Gemini output validation; prompt delimiting
- Rate limits; redacted Pino logs; export + delete

## Ten likely questions (answer from *your* implementation)

1. How does a barcode become a verdict?
2. What happens when ingredients are missing?
3. How do you stop Gemini from deciding SAFE?
4. How is dependent profile isolation enforced?
5. How do you test allergen false negatives?
6. Refresh token reuse — what happens?
7. How do you prevent IDOR on meals?
8. What is ruleVersion for?
9. What is still NOT VERIFIED in deployment?
10. Biggest remaining production risk?

Fill answers only after the code matches reality.
