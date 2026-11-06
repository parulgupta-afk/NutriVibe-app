# Security hardening notes (NoSQL injection)

**Finding (HIGH):** `POST /api/auth/forgot-password` with `{"email":{"$ne":null}}` reached
`User.findOne`, matching an arbitrary account and setting a reset token on it. There was no
app-level input sanitizer.

**Fix:** global `sanitizeInput` middleware (removes `$`-prefixed and dotted keys from
`req.body`, `req.query`, `req.params`), plus a string/length check and email normalisation in
`forgotPassword`. Verified by replaying the exploit before and after (200 reaching the DB ->
400, zero queries) and by `tests/sanitizeInput.test.js`.

**Still open (not fixed here):** only ~10 of ~69 routes are in the OpenAPI document; request
validation is inconsistent (3 of 17 route files); reset-password minimum is 6 characters; JWT
(7 days) lives in `localStorage` with no revocation; `JWT_SECRET` shorter than 16 characters
only warns; rate limiting is per-process memory.
