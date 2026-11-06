# NutriVibe Authorization Matrix

## 1. Overview

This document specifies the authorization model, access boundaries, role requirements, and cross-tenant (cross-user) IDOR protections implemented across all API endpoints in NutriVibe.

All endpoints adhere to the **Principle of Least Privilege**:

- **Public Endpoints**: Open to unauthenticated callers (subject to public rate limiting).
- **User-Owned Endpoints**: Require authenticated JWT Bearer authentication. All read, update, and delete operations strictly query against `req.user._id` (or `owner: req.user.id`). Cross-user access attempts return `404 Not Found` (never exposing resource existence).
- **Admin-Only Endpoints**: Require authenticated JWT Bearer token with `req.user.role === 'admin'`. Non-admin callers receive `403 Forbidden`.

---

## 2. Authorization Matrix Table

| Method | Route Path | Access Level | Ownership Check Mechanism | Cross-User Status | Verification Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | None (New user registration) | N/A | `authRoutes.test.js` |
| `POST` | `/api/auth/login` | Public | Credential verification | 401 | `authRoutes.test.js` |
| `GET` | `/api/auth/me` | User | Reads `req.user` | 401 unauth | `ownership.test.js` |
| `PUT` | `/api/auth/profile` | User | Updates `req.user._id` only | 401 unauth | `authRoutes.test.js` |
| `GET` | `/api/me/export` | User | Exports all records scoped to `req.user._id` | 401 unauth | `meController.test.js` |
| `DELETE` | `/api/me` | User | Password-verified cascade delete of `req.user._id` | 401 unauth / 400 bad pw | `meController.test.js` |
| `GET` | `/api/meals/today` | User | Queries `{ userId: req.user._id, localDate }` | Scoped (empty) | `ownership.test.js` |
| `POST` | `/api/meals` | User | Sets `userId: req.user._id` on creation | N/A | `ownership.test.js` |
| `PUT` | `/api/meals/:id` | User | Queries `{ _id: id, userId: req.user._id }` | 404 Not Found | `ownership.test.js` |
| `DELETE` | `/api/meals/:id` | User | `findOneAndDelete({ _id: id, userId: req.user._id })` | 404 Not Found | `ownership.test.js` |
| `GET` | `/api/dependents` | User | Queries `{ owner: req.user.id }` | Scoped (empty) | `ownership.test.js` |
| `POST` | `/api/dependents` | User | Sets `owner: req.user.id` on creation | N/A | `ownership.test.js` |
| `PUT` | `/api/dependents/:id` | User | Queries `{ _id: id, owner: req.user.id }` | 404 Not Found | `ownership.test.js` |
| `DELETE` | `/api/dependents/:id` | User | `findOneAndDelete({ _id: id, owner: req.user.id })` | 404 Not Found | `ownership.test.js` |
| `POST` | `/api/hydration` | User | Sets `userId: req.user._id` on creation | N/A | `ownership.test.js` |
| `GET` | `/api/hydration/today` | User | Queries `{ userId: req.user._id, localDate }` | Scoped (empty) | `ownership.test.js` |
| `GET` | `/api/hydration/weekly` | User | Queries `{ userId: req.user._id }` | Scoped (empty) | `ownership.test.js` |
| `GET` | `/api/favorites` | User | Queries `User.findById(req.user.id).savedProducts` | Scoped (empty) | `ownership.test.js` |
| `POST` | `/api/favorites/:id` | User | Appends to `req.user.id` saved products | 401 unauth | `ownership.test.js` |
| `DELETE` | `/api/favorites/:id` | User | Removes from `req.user.id` saved products | 401 unauth | `ownership.test.js` |
| `POST` | `/api/tracking/log` | User | Scoped to `req.user.id` | 401 unauth | `ownership.test.js` |
| `GET` | `/api/tracking/daily` | User | Queries `{ user: req.user.id }` | Scoped (empty) | `ownership.test.js` |
| `GET` | `/api/tracking/stats` | User | Queries `{ user: req.user.id }` | Scoped (empty) | `ownership.test.js` |
| `POST` | `/api/reactions` | User | Sets `userId: req.user._id` on creation | N/A | `reactionInsights.test.js` |
| `GET` | `/api/reactions` | User | Queries `{ userId: req.user._id }` | Scoped (empty) | `reactionInsights.test.js` |
| `GET` | `/api/reactions/insights` | User | Queries `{ userId: req.user._id }` | Scoped (empty) | `reactionInsights.test.js` |
| `POST` | `/v1/keys` | User | Scoped to `ownerId: req.user._id` | 401 unauth | `publicApiController.test.js` |
| `GET` | `/v1/keys` | User | Queries `{ ownerId: req.user._id }` | Scoped (empty) | `publicApiController.test.js` |
| `DELETE` | `/v1/keys/:id` | User | `findOneAndUpdate({ _id: id, ownerId: req.user._id })` | 404 Not Found | `ownership.test.js` |
| `POST` | `/v1/check` | API Key | Validates `X-API-Key` SHA-256 hash & hourly rate limit | 401 / 429 | `publicApiController.test.js` |
| `GET` | `/api/submissions/admin` | Admin | Checks `req.user.role === 'admin'` | 403 Forbidden | `ownership.test.js` |
| `PATCH` | `/api/submissions/admin/:id` | Admin | Checks `req.user.role === 'admin'` | 403 Forbidden | `ownership.test.js` |
| `GET` | `/api/health` | Public | None (Liveness probe) | N/A | `health.test.js` |
| `GET` | `/api/ready` | Public | None (Readiness probe with Mongo/Redis checks) | N/A | `health.test.js` |

---

## 3. IDOR Defense Details

1. **Uniform 404 Responses**:
   When an authenticated user attempts to mutate or access an entity belonging to another user, all database lookups compound `_id` and the user identifier in the exact same filter (e.g. `{ _id: id, userId: req.user._id }`). If no matching document is found, the response is `404 Not Found`. This prevents an attacker from determining whether an ID exists in another tenant's account.

2. **JWT Algorithm Pinning**:
   Authentication middleware explicitly enforces `{ algorithms: ['HS256'] }`. Tokens signed with `none` or unauthorized asymmetric keys are rejected immediately with `401 Unauthorized`.

3. **Strict Bearer Format**:
   Authorization headers are parsed using the strict regex `/^Bearer\s+([A-Za-z0-9\-_.]+)$/`. Malformed headers or unexpected schemes (such as `Basic`) are rejected with `401 Unauthorized`.
