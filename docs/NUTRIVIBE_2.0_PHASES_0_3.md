# NutriVibe 2.0 — Combined Phases 0–3 Implementation Notes

## What was added on top of the existing codebase

This expansion implements the core of **Phases 0–3** from the NutriVibe 2.0 roadmap while preserving every existing feature (auth, barcode/OCR scanning, deterministic safety engine, family profiles, favorites, etc.).

### New Models
| Collection | File | Purpose |
|---|---|---|
| FoodItem | `models/FoodItem.js` | Verified nutrition database (per-100g). Gemini never invents numbers. |
| Meal | `models/Meal.js` | Meal logs with calculated macros & localDate for streaks. |
| HydrationLog | `models/HydrationLog.js` | Water intake entries. |
| NutritionGoal | `models/NutritionGoal.js` | Configurable calorie/macro/water targets + timezone. |
| Streak | `models/Streak.js` | Server-side meal & hydration streaks + achievements. |

### New Services
- `services/nutritionCalculator.js` — pure deterministic math (`per100g × grams / 100`)
- `services/streakService.js` — timezone-aware streak updates, achievement unlocks (no shaming on missed days)

### New API Routes (all protected)
```
POST   /api/meals
GET    /api/meals/today?date=YYYY-MM-DD
GET    /api/meals/history
PUT    /api/meals/:id
DELETE /api/meals/:id

POST   /api/hydration/log
GET    /api/hydration/today
GET    /api/hydration/weekly
GET    /api/hydration/goals
PUT    /api/hydration/goals

GET    /api/streaks
```

### Architecture principles still enforced
1. **Gemini** only extracts / explains / suggests.
2. **Backend calculation services** own calories, macros, totals, streaks.
3. **Deterministic safety engine** (already present) decides SAFE / CAUTION / UNSAFE.

### Seed data
`server/src/data/seedFoodItems.js` contains 10 sample Indian + global foods (Paneer, Roti, Dal, Rice, Banana, Milk, Greek Yogurt, Egg, Oats, Chicken).  
Run a one-off seeder that inserts them into `FoodItem` when you are ready.

### Next steps (Phase 4+)
- Wire frontend pages for Meal Tracker, Nutrition Dashboard (Recharts), Hydration UI, Streaks/Achievements.
- Expand FoodItem with full IFCT/USDA import.
- Add Zod validation on the new endpoints.
- Unit tests for nutritionCalculator and streak day-boundary logic.
- VibeDiet (Phase 4) will consume FoodItem + safety engine.

### How to run locally
```bash
cd server
npm install
# ensure MONGO_URI and JWT_SECRET are set
npm run dev
```

Existing safety evaluation, CI, and auth continue to work unchanged.
