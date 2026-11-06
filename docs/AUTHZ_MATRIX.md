# Authorization Matrix (Phase 4)

Fill this table from the real route inventory. Every owned resource must have a matching test.

| Route | Method | Auth | Ownership check | Test name | Status |
| ------- | -------- | ------ | ----------------- | ----------- | -------- |
| /api/dependents/:id | GET | Required | owner | dependent-owner-read | TODO |
| /api/dependents/:id | PATCH | Required | owner | dependent-owner-update | TODO |
| /api/dependents/:id | DELETE | Required | owner | dependent-owner-delete | TODO |
| /api/meals/:id | GET | Required | owner | meal-owner-read | TODO |
| /api/meals/:id | PATCH | Required | owner | meal-owner-update | TODO |
| /api/meals/:id | DELETE | Required | owner | meal-owner-delete | TODO |
| /api/hydration/:id | GET | Required | owner | hydration-owner-read | TODO |
| /api/hydration/:id | DELETE | Required | owner | hydration-owner-delete | TODO |
| /api/favorites/:id | DELETE | Required | owner | favorite-owner-delete | TODO |
| /api/tracking/:id | GET | Required | owner | tracking-owner-read | TODO |
| /api/reactions/:id | DELETE | Required | owner | reaction-owner-delete | TODO |
| /api/v1/keys/:id | DELETE | Required | ownerId | apikey-owner-revoke | TODO |
| /api/submissions/:id/approve | POST | Required | Admin role | submission-admin-approve | TODO |
| * (any with profileId) | * | Required | resolveEffectiveUser fail-closed | profile-resolver-ownership | RE-VERIFY |

Update Status to PASS after the corresponding test is green.
