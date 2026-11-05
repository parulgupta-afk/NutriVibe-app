# ADR 006: Dual Frontend Coexistence (client and client-v2)

## Context
A redesigned NutriVibe 2.0 user interface (`client-v2`) was introduced while preserving the existing working `client` application.

## Decision
- Maintain both `client/` and `client-v2/` side-by-side in the repository.
- Assign `client/` to port 5173 and `client-v2/` to port 5174.
- Configure server CORS to allow both origins in development.
- Provide an API adapter layer in `client-v2` supporting both mock preview and live `/api` proxying.

## Consequences
- Developers can test the new UI without breaking existing features.
- No regression risk to existing client routes and users.
