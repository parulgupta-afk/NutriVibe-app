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
- `/dashboard` — home nutrition ring, hydration, meals
- `/vibe-ai` — assistant + “VibeAI can use” rail
- `/scan-result` — CAUTION verdict pattern (demo)
- `/product/:barcode` — live product (same shell)

Backend APIs unchanged; UI is presentation only.
