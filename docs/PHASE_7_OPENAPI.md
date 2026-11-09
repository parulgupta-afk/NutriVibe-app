# OpenAPI status (honest)

`server/src/docs/openapi.json` currently documents a **subset** of routes (on the order of ~10 paths), not the full ~70 route surface.

Until the file lists every registered route and a contract test compares Express routes to OpenAPI paths:

- Do not claim “every route is documented”.
- Keep the contract test as a **partial** check (file exists, core paths present).
- Track full coverage on the roadmap.
