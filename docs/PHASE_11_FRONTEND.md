# Phase 11 — Frontend UI, a11y, reliability

## UI prototype

Source: `ui-prototype/` already in the previous zip.
Merge **one screen at a time** into real `client/`, wire to real API, keep parity tests. Do not wholesale replace.

## Required

- Loading / error / empty / retry states on every API page
- Offline screen that shows **no private data**
- Verdicts: icon + word + colour (never colour alone)
- `prefers-reduced-motion`
- Labels, focus order, keyboard scanner use, contrast AA
- axe via Playwright; fix serious/critical issues
