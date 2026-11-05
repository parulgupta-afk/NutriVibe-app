# NutriVibe API Documentation & Developer Guide

NutriVibe provides a RESTful API powering food intelligence, safety evaluations, meal and hydration tracking, and grounded nutritional intelligence.

---

## 1. Base URL & Common Conventions

- **Base URL**: `http://localhost:5000/api` (or proxied via Vite at `/api`)
- **Public API Base URL**: `http://localhost:5000/v1`
- **Interactive OpenAPI Documentation**: `GET /api/docs` (Swagger UI) & `GET /api/openapi.json`
- **Health Check**: `GET /api/health`

### Headers
| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for all POST/PUT/PATCH requests with JSON payloads |
| `Authorization` | `Bearer <token>` | JWT token returned on login or registration |
| `X-API-Key` | `<key>` | Required for external API endpoints under `/v1/*` |
| `Idempotency-Key` | `<uuid>` | Optional header for safe request retries |

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account with personal health goals and dietary restrictions.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "preferences": {
        "allergies": [],
        "dietaryRestrictions": [],
        "healthGoals": []
      }
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials and returns a signed JWT.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```

### `GET /api/auth/me`
Fetches authenticated user profile, preferences, and account metadata.

### `PUT /api/auth/preferences`
Updates dietary restrictions, allergies, and health goals.
- **Request Body**:
  ```json
  {
    "allergies": ["Dairy", "Peanuts"],
    "dietaryRestrictions": ["Vegetarian"],
    "healthGoals": ["Weight Loss"]
  }
  ```

---

## 3. Product Intelligence (`/api/products`)

### `GET /api/products/barcode/:barcode`
Retrieves product details and performs an on-the-fly personalized safety evaluation.
- **Query Parameters**:
  - `profileId` *(optional)*: Dependent ID to evaluate safety for a family profile.

### `GET /api/products/search?query=:term`
Searches product catalogue by keyword, brand, or ingredients.

### `GET /api/products/:id/alternatives`
Retrieves safer or healthier food alternatives personalized to the active user's restrictions.

---

## 4. Nutrition & Hydration Tracking

### `POST /api/meals`
Logs consumed meals and computes nutrient totals.
- **Endpoint**: `/api/meals`
- **Request Body**:
  ```json
  {
    "mealType": "breakfast",
    "mealName": "Oatmeal with fruit",
    "items": [
      {
        "name": "Rolled Oats",
        "grams": 50,
        "nutrition": { "calories": 180, "protein": 6, "carbs": 32, "fat": 3, "fiber": 5 }
      }
    ],
    "totals": { "calories": 180, "protein": 6, "carbs": 32, "fat": 3, "fiber": 5 },
    "localDate": "2026-11-03"
  }
  ```

### `POST /api/hydration/log`
Logs water intake and advances daily hydration goals.
- **Request Body**:
  ```json
  {
    "amountMl": 350,
    "source": "quick"
  }
  ```

---

## 5. Indian Food Intelligence (`/api/indian`)

### `GET /api/indian/ins`
Returns the full master catalog of FSSAI/INS food additives, categories, and sensitivities.

### `GET /api/indian/ins/lookup?q=:term`
Looks up an additive by code (e.g., `INS 102`) or common name (e.g., `tartrazine`).

---

## 6. Public V1 Food Safety Check (`/v1/check`)

Designed for third-party integrations, mobile clients, and agents.
- **Header**: `X-API-Key: <your-key>`
- **Request Body**:
  ```json
  {
    "productName": "Greek Yogurt",
    "ingredients": ["Pasteurized Skim Milk", "Live Cultures"],
    "allergies": ["Dairy"]
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "level": "Unsafe",
      "score": 20,
      "factors": [
        {
          "name": "Allergen match",
          "impact": "Contains or likely contains: Dairy",
          "severity": 90
        }
      ]
    }
  }
  ```

---

## 8. Frontend Integration (Client v1 & Client v2)

Both frontend clients connect to the same Express backend:
- **Client v1 (`/client`)**: Uses Axios with default base path `/api` mapped via Vite proxy on port 5173.
- **Client v2 (`/client-v2`)**: Includes an API adapter layer in `src/api/index.js` supporting mock fallback and live backend mode via `VITE_API_URL=/api` on port 5174.
- **Authentication Token Sharing**: Both clients share the standard `localStorage.getItem('token')` convention for JWT bearer authorization.


