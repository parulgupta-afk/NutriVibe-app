# Architecture decisions

Short records of important choices.

| ID | Decision |
|----|----------|
| 001 | Deterministic safety engine; Gemini only explains |
| 002 | Redis optional — app must run without it |
| 003 | No BullMQ until real async load justifies workers |
| 004 | Keep legacy API fields when adding structured safety/nutrition |
| 005 | Stability-first engineering phases; no big-bang rewrite |
| 006 | Dual frontend coexistence (client :5173 and client-v2 :5174) |
| 007 | Fail-closed dependent profile resolution |
| 008 | Service worker cache privacy hardening |
| 009 | Content-Security-Policy & request body size limits |
