# NutriVibe 2.0 UI

React + Vite + Tailwind CSS implementation of the NutriVibe 2.0 UI design.
It runs on mock data out of the box, so you can see every screen without a backend.

Tagline: *Eat Smart. Stay Safe. Live Better.*

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Needs Node 18 or newer.

## What is inside

| Screen | Route | Highlights |
| --- | --- | --- |
| Dashboard | `/` | Quick actions, calorie ring, macro bars, hydration ring, meals, streak, insight |
| Food Scanner | `/scan` | Barcode, label and voice modes, animated Verdict Ring, explainable verdicts |
| VibeDiet | `/diet` | 7-day plan, tap a meal to swap it with the next day, grocery checklist |
| My Meals | `/meals` | Manual, photo (confirm AI items) and voice entry |
| Hydration | `/hydration` | Water ring, adjustable goal, Recharts weekly chart, reminders |
| Wellness Journey | `/wellness` | Weekly habit score, streaks, report, achievements |
| VibeAI | `/ai` | Grounded chat with suggestion cards and the data it can use |

On phones the sidebar becomes a bottom tab bar with a raised Scan button.

## Stack

React 18, Vite, Tailwind CSS 3, React Router 6, Framer Motion (ring sweeps, staggered
entrances, shared nav pill, spring toggles), Recharts (hydration chart), Lucide icons,
Axios (API layer).

## Design tokens

Defined in `tailwind.config.js`: sage canvas `#EEF0E7`, forest-teal `#3A6B63`,
traffic-light verdict colours, Fraunces for headings, Inter for body, IBM Plex Mono
for numbers. Verdicts always pair colour with an icon and a word.
Animations switch off for users who prefer reduced motion.

## Connect it to your backend

All data currently comes from `src/data/mock.js`. The API layer in `src/api/index.js`
maps each call to an endpoint from the plan. Set the base URL and the calls go live:

```bash
# .env
VITE_API_URL=http://localhost:5000/api
```

Then replace the mock imports in a page with calls to `api.*` (for example with
`useEffect` or a data-fetching hook). Shared state such as water intake lives in
`src/context/AppContext.jsx`.

## Structure

```text
src/
  api/          Axios client and endpoint helpers
  components/   ui.jsx (Card, Chip, Button, Bar, Segmented, Toggle), Ring, VerdictRing, Layout
  context/      AppContext (water and goal)
  data/         mock.js sample data
  pages/        One file per screen
```

## Notes

- Numbers are sample data, not medical recommendations.
- The safety verdict shown in the scanner is meant to come from your rules engine;
  Gemini should only explain it.
- This project is a UI layer. Authentication, authorization and validation belong on the
  server and must not rely on anything in this front end.
