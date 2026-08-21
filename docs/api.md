# API overview

Interactive docs (when server is running): [http://localhost:5000/api/docs](http://localhost:5000/api/docs)  
Machine-readable: `GET /api/openapi.json`

## Auth

All private routes need:

```http
Authorization: Bearer <jwt>
```

## Main groups

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, me, preferences, password reset, Google |
| `/api/products` | Barcode, search, alternatives, explain, OCR label |
| `/api/tracking` | Log, daily, history, stats |
| `/api/dependents` | Family profiles |
| `/api/favorites` | Saved products |
| `/api/safety` | Safety reports |
| `/api/health` | Liveness + Mongo |

## Error shape

```json
{
  "success": false,
  "message": "Human readable",
  "error": { "code": "PRODUCT_NOT_FOUND", "message": "Human readable" }
}
```

## Idempotency

`POST /api/tracking/log` accepts optional header:

```http
Idempotency-Key: <client-unique-string>
```

Full route list: [current-architecture.md](./current-architecture.md) and OpenAPI.
