# NutriVibe – Assets for Master Fix Prompt

Place the contents of this zip in the root of the NutriVibe-app repository before running the Master Fix Prompt.

## Structure

```
ui-prototype/          ← NutriVibe 2.0 UI (React + Vite + Tailwind)
                        Use this for Task 11: merge into real client/ one screen at a time.

nutrivibe-patches/     ← 6 sequential security patches (already applied upstream in some cases)
                        Re-verify only; do not re-apply blindly.
```

## How the agent should use these

### Task 11 (Frontend)
- Source of the new UI is `ui-prototype/`
- Merge screens one at a time into the existing `client/`
- Do **not** wholesale replace working pages
- Wire each screen to the real API
- Keep parity tests

### Patches
These patches were previously generated. Before applying any:
1. Check whether the change already exists on `origin/main`
2. Only apply what is still missing
3. Re-run the relevant tests after each one

## Contents of ui-prototype

- Dashboard, Scanner (with VerdictRing), VibeDiet, Meals, Hydration, Wellness, VibeAI
- Shared components: Layout, Ring, VerdictRing, ui primitives
- Mock data layer + API helper stubs
- Tailwind design tokens (sage / forest-teal, traffic-light verdicts)
- Framer Motion + Recharts

## Suggested agent workflow

1. `git fetch origin && git checkout -b fix/master-hardening origin/main`
2. Copy `ui-prototype/` into the repo root
3. Follow the Master Fix Prompt tasks in order
4. For Task 11, treat `ui-prototype/` as the design source of truth
