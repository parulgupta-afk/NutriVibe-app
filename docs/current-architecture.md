# Current architecture (Phase 2 baseline)

Documented from the **actual** repository. Do not invent endpoints.

## Request flow

```
Frontend (React)
  → axios (/api/...)
  → Express app.js (helmet, cors, compression, rate limits)
  → route modules
  → auth middleware (when required)
  → controller
  → service / data helpers / Mongoose models
  → MongoDB or external API
  → JSON response
  → errorHandler on thrown/next(err)
```

## Route map

### Auth — `/api/auth`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register` | No | Email/password register |
| POST | `/login` | No | Login, returns JWT |
| POST | `/google` | No | Google credential login |
| POST | `/forgot-password` | No | Reset email |
| POST | `/reset-password/:token` | No | Set new password |
| GET | `/me` | Yes | Current user |
| PUT | `/preferences` | Yes | Allergies, diet, meds, goals |

### Products — `/api/products`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/barcode/:barcode` | Yes | Lookup/cache product + safety report |
| POST | `/scan-label` | Yes | OCR text → synthetic product |
| GET | `/search` | Yes | Search products |
| GET | `/:id` | Yes | Product by Mongo id |
| GET | `/:id/alternatives` | Yes | Safer swaps for active profile |
| GET | `/:id/explain` | Yes | Gemini explanation (rate limited) |
| POST | `/:id/refresh-image` | Yes | Re-fetch OFF images |

### Tracking — `/api/tracking`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/log` | Yes | Log consumption |
| GET | `/daily` | Yes | Day summary |
| GET | `/history` | Yes | History / filters |
| GET | `/stats` | Yes | Stats |
| DELETE | `/clear` | Yes | Clear logs |
| DELETE | `/:id` | Yes | Delete one log |

### Safety — `/api/safety`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| (see `safetyRoutes.js`) | product safety report helpers | Yes | Report generation |

### Dependents — `/api/dependents`

CRUD for family profiles under one account.

### Favorites — `/api/favorites`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | Yes | List saved products |
| POST | `/:productId` | Yes | Save |
| DELETE | `/:productId` | Yes | Unsave |

### Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | No | API + Mongo readyState |

## Major models

- **User** — auth, preferences, savedProducts  
- **Dependent** — family profiles  
- **Product** — barcode unique, ingredients, safetyInfo, images  
- **Tracking** — scan/log history  
- **SafetyReport** — persisted reports where used  

## Core services

| Module | Role |
|--------|------|
| `safetyEngine.js` | Deterministic Safe/Caution/Unsafe verdict |
| `openFoodFactsService.js` | OFF fetch with timeout + structured result |
| `geminiExplainerService.js` | Explanation only (not medical decision) |
| `profileResolver.js` | Owner vs dependent effective user |
| `emailService.js` | Password reset mail |

## Frontend API layer

- `client/src/api/products.js`  
- `client/src/api/dependents.js`  
- `client/src/api/favorites.js`  
- Auth via `AuthContext` + axios defaults  

## Auth contract

- Bearer JWT in `Authorization` header  
- Private routes use `middleware/auth.js`  

## Error contract (current)

```json
{ "success": false, "message": "Human readable text" }
```

Structured `error.code` is introduced in Engineering Phase 5 **while keeping `message`** for frontend compatibility.
