# Authentication changes in this package

1. **Password minimum 10** on register (middleware, routes, User schema, client) and reset (controller, routes, client).
2. **JWT** signed and verified with `algorithms: ['HS256']` only.
3. **Strict Bearer** parsing (`Bearer <token>`).
4. **tokenVersion** on User; included in JWT payload; middleware rejects mismatched versions.
5. **Password reset** increments `tokenVersion` so older access tokens are revoked.

Still roadmap: rotating refresh cookies, removing localStorage, logout-all endpoint wired in UI, 15-minute access tokens by default.
