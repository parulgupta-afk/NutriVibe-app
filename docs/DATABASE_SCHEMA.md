# Phase 9 — Database schema notes

## Models to review (fill from real code)

| Model | Owner field | Suggested indexes | Notes |
| ------- | ------------- | ------------------- | ------- |
| User | — | email unique | tokenVersion, password hash |
| Dependent | owner | owner + createdAt | fail-closed resolver |
| Meal | owner | owner + createdAt | |
| HydrationLog | owner | owner + createdAt | |
| TrackingLog / ScanReport | owner | owner + createdAt, barcode | verdict + ruleVersion |
| Favorite | owner | owner + productId | |
| ApiKey | ownerId | hash unique, ownerId | never store raw key |
| PasswordResetToken | userId | TTL on expiresAt | |

## Commands to run locally

```bash
# After connecting to Mongo
# db.trackinglogs.createIndex({ owner: 1, createdAt: -1 })
# db.meals.createIndex({ owner: 1, createdAt: -1 })
# db.apikeys.createIndex({ hash: 1 }, { unique: true })
# db.passwordresettokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

## Explain plans

Run `.explain("executionStats")` on the two slowest real queries and paste results here. Mark NOT VERIFIED until run.
