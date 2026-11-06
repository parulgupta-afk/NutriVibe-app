# ADR 007: Fail-Closed Dependent Profile Resolution

## Context

When scanning or logging on behalf of a dependent profile, if `profileId` was invalid, deleted, or belonged to another user, `resolveEffectiveUser` previously fell back to the account owner's allergies and medications. If a child has a peanut allergy but the parent does not, a typo in `profileId` could evaluate the product as "Safe".

## Decision

- Fail closed: If a `profileId` is provided, it MUST resolve to a profile owned by the authenticated user.
- Malformed strings, non-string types, deleted IDs, and foreign IDs uniformly throw HTTP 404 (`NOT_FOUND`), preventing an ownership oracle and operator injection.
- Never fall back to the owner's preferences when an explicit `profileId` fails to resolve.

## Consequences

- Guaranteed safe: A scan never produces a false "Safe" verdict due to profile resolution failure.
- Unit tested under `server/tests/profileResolver.test.js`.
