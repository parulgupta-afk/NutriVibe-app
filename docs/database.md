# Database

**Engine:** MongoDB (Atlas or local) via Mongoose.

## Collections (models)

| Model | Role |
|-------|------|
| User | Auth, preferences, savedProducts |
| Dependent | Family profiles under a user |
| Product | Barcode-unique catalog + OFF/OCR cache |
| Tracking | Scan/log history with risk snapshot |
| SafetyReport | Stored reports where used |
| ApiKey | External API keys with SHA-256 hash and hourly window counters |
| Meal | Meal tracking with nutrition and food items |
| DietPlan | Generated multi-day diet plans and meal schedules |

## Important indexes

- `Product.barcode` — unique  
- `Tracking { user, createdAt }`  
- `Tracking { user, profile, createdAt }`  
- `Dependent { owner, createdAt }`  
- `ApiKey.keyHash` — unique index for O(1) authentication
- `ApiKey { ownerId, active }` — user key lookup and limit enforcement  

## Relationships

```
User 1──* Dependent
User 1──* Tracking
Product 1──* Tracking
User *──* Product (savedProducts)
```

## Env

`MONGO_URI` — required. App refuses to start without it (validateEnv).
