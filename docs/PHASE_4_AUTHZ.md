# Phase 4 — Authorization & IDOR Protection

## Goal

Every owned resource is only accessible by its owner (or authorized admin). Cross-user access returns 404 (no ownership oracle).

## Inventory checklist (fill from real routes)

| Resource | Model | Owner field | Routes to audit |
| ---------- | ------- | ------------- | ----------------- |
| Dependent | Dependent | owner / userId | GET/PATCH/DELETE /api/dependents/:id |
| Meal | Meal | owner | /api/meals/* |
| Hydration | HydrationLog | owner | /api/hydration/* |
| Favorite | Favorite | owner | /api/favorites/* |
| Tracking / Scan log | TrackingLog / ScanReport | owner | /api/tracking/* |
| Reaction | Reaction | owner | /api/reactions/* |
| Submission | Submission | owner + admin approve | /api/submissions/* |
| API key | ApiKey | ownerId | /api/v1/keys/* |
| Profile (dependent) | via profileId | must resolve to owner | any ?profileId= |

## Rule

Always query with ownership constraint:

```js
const doc = await Model.findOne({ _id: id, owner: req.user._id });
if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
```

Never: fetch by id only, then check owner in JS (race + info leak).

## profileId

Must go through the fail-closed `resolveEffectiveUser` (already done). Re-verify no other path bypasses it.

## Admin routes

Any approve/moderate route must check `req.user.role === 'admin'` (or equivalent) and be covered by tests.
