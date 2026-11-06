# Applying Phases 0–3 (Safety Eval + Validation + Auth scaffolding)

## 1. Copy these folders into your local NutriVibe-app clone

From this zip, copy into the **repo root**:

- `server/tests/eval/`          → `server/tests/eval/`
- `server/src/validators/`      → `server/src/validators/`
- `server/scripts/migrations/`  → `server/scripts/migrations/`
- `docs/PHASE_0_AUDIT.md`       → `docs/PHASE_0_AUDIT.md`
- `docs/APPLY_PHASES_0_3.md`    → `docs/` (this file)

Also keep `ui-prototype/` and `nutrivibe-patches/` from the previous assets zip if not already present.

## 2. Git setup

```bash
cd /path/to/NutriVibe-app
git fetch origin
git ls-remote origin refs/heads/main
git switch -c feature/nutrivibe-production-readiness origin/main
```

## 3. Install Zod (Phase 2)

```bash
cd server
npm install zod
```

## 4. Wire eval script (Phase 1)

In `server/package.json` add:

```json
"scripts": {
  "eval": "node tests/eval/evaluate.js"
}
```

Then run:

```bash
npm run eval
```

Replace the stub in `evaluate.js` with a real call to `computeSafetyVerdict` once you confirm the engine export path.

Expand `cases.json` to 150–200 reviewed cases (template structure is already there).

## 5. Wire validation middleware (Phase 2)

In route files, e.g.:

```js
const { validate } = require('../validators/validate');
const { register, login } = require('../validators/auth.validator');

router.post('/register', validate({ body: register }), authController.register);
router.post('/login', validate({ body: login }), authController.login);
```

Repeat for dependents, meals, hydration, favorites, etc.

## 6. Auth hardening (Phase 3) – manual steps still required

- Add `tokenVersion` to User model (default 0).
- On password change / reset / logout-all: `user.tokenVersion += 1; await user.save()`.
- In JWT middleware: `jwt.verify(token, secret, { algorithms: ['HS256'] })` and check `payload.tokenVersion === user.tokenVersion`.
- Implement short-lived access + rotating refresh (hashed, httpOnly cookie).
- Remove token from client localStorage; update AuthContext + axios interceptor.
- Password min length 10 + small common-password deny list.
- Production: refuse start if `JWT_SECRET` length < 32 or equals example value.

## 7. Commit after each logical change

```bash
git add server/tests/eval server/src/validators server/scripts/migrations docs
git commit -m "test(safety): add labeled evaluation corpus and eval runner"
git commit -m "feat(validation): add shared Zod validate middleware and schemas"
# etc.
```

## 8. Baseline tests

```bash
cd server && npm test
cd ../client && npm run lint && npm test && npm run build
```

Record real output. Anything not run = NOT VERIFIED.
