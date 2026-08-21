# Phases 10–12

## Phase 10 — Accessibility
- Skip-to-main link
- Real `NotFound` page (no silent redirect)
- Navbar: `aria-label`, `aria-expanded`, focus-visible rings
- Loading spinner announces to screen readers

## Phase 11 — More tests
- `server/tests/medicationInteractions.test.js`
- Run: `cd server && npm test`

## Phase 12 — Dark mode
- `ThemeContext` + localStorage + system preference
- Toggle in navbar (sun/moon)
- Tailwind `darkMode: 'class'`
- Base card/input/body dark styles

## Files to copy

```
client/src/App.jsx
client/src/main.jsx
client/src/index.css
client/src/pages/NotFound.jsx
client/src/components/common/Navbar.jsx
client/src/contexts/ThemeContext.jsx
client/tailwind.config.js
server/tests/medicationInteractions.test.js
docs/PHASE10-12.md
```

## Apply & test

```bash
cd client && npm run dev
# Toggle dark mode in navbar
# Visit /this-does-not-exist → 404 page

cd ../server && npm test
```

```bash
git add client/src client/tailwind.config.js server/tests docs/PHASE10-12.md
git commit -m "Phase 10/11/12: a11y + NotFound, med interaction tests, dark mode"
git push origin main
```
