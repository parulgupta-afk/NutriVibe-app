# NutriVibe 2.0 UI

Design tokens match the interactive desktop prototype:

| Token | Value |
|-------|-------|
| bg | `#EEF0E7` |
| panel | `#F8F9F3` |
| panel2 | `#F1F3EA` |
| ink | `#1D2926` |
| mute | `#56655F` |
| teal | `#3A6B63` |
| warn | `#B7791F` |
| safe | `#2F7D4F` |

Fonts: **Fraunces** (titles), **Inter** (UI).

## Layout
- **Desktop:** left sidebar (264px) + main, profile card bottom-left
- **Mobile:** top bar + bottom nav (Home / Meals / Scan FAB / Water / VibeAI)

## Key screens
- `/dashboard` (client) / `/` (client-v2) — home nutrition ring, hydration, meals
- `/vibe-ai` (client) / `/ai` (client-v2) — assistant + “VibeAI can use” rail
- `/scan` (client-v2) / `/scanner` (client) — food scanner & verdict ring
- `/scan-result` — CAUTION verdict pattern (demo)
- `/product/:barcode` — live product (same shell)

## Client v2 Architecture
- Built with React 18, Vite 6, Tailwind CSS 3, Framer Motion, and Recharts
- Configured to run on port 5174 with mock fallback and live `/api` proxy
- Motion-reduced accessibility support for animated verdict rings

## Client v2 Component Inventory
- `VerdictRing`: Animated sweep ring showing score, risk verdict, and primary hazard icon
- `Ring`: SVG progress ring for calories, hydration, and macro goals
- `Sidebar` / `MobileNav`: Responsive navigation with raised FAB scan action on mobile
- `Card`, `Chip`, `Button`, `Bar`, `Segmented`, `Toggle`: Accessible core UI primitives in `ui.jsx`

Backend APIs unchanged; UI is presentation only.
