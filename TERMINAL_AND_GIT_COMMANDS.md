# Exact terminal + git commands for Phases 0–3

## Prerequisites

- Local clone of [NutriVibe-app repository](https://github.com/parulgupta-afk/NutriVibe-app)
- Node 18+
- This zip extracted (or its folders copied into the repo root)

---

### 1. Create the branch

```bash
cd /path/to/NutriVibe-app
git fetch origin
git ls-remote origin refs/heads/main
git switch -c feature/nutrivibe-production-readiness origin/main
```

### 2. Copy assets from this zip into the repo

```bash
# From the extracted phases-0-3 folder:
cp -r server/tests/eval /path/to/NutriVibe-app/server/tests/
cp -r server/src/validators /path/to/NutriVibe-app/server/src/
cp -r server/scripts /path/to/NutriVibe-app/server/   # if scripts/ already exists, merge
cp docs/PHASE_0_AUDIT.md docs/APPLY_PHASES_0_3.md /path/to/NutriVibe-app/docs/
cp -r ui-prototype /path/to/NutriVibe-app/
cp -r patches/nutrivibe-patches /path/to/NutriVibe-app/   # optional re-verify only
```

### 3. Install Zod

```bash
cd /path/to/NutriVibe-app/server
npm install zod
```

### 4. Add eval script to package.json

Add under `"scripts"`:

```json
"eval": "node tests/eval/evaluate.js"
```

### 5. Run baseline + eval

```bash
cd /path/to/NutriVibe-app/server
npm test
npm run eval

cd ../client
npm run lint
npm test
npm run build
```

### 6. First commits

```bash
cd /path/to/NutriVibe-app
git add server/tests/eval docs/PHASE_0_AUDIT.md docs/APPLY_PHASES_0_3.md
git commit -m "test(safety): add labeled evaluation corpus and eval runner"

git add server/src/validators
git commit -m "feat(validation): add shared Zod validate middleware and route schemas"

git add server/scripts/migrations
git commit -m "feat(safety): add verdict enum migration script (dry-run default)"

git add ui-prototype
git commit -m "chore(ui): add NutriVibe 2.0 UI prototype for incremental merge"
```

### 7. Continue implementation

Follow `docs/APPLY_PHASES_0_3.md` for wiring validators into routes and the remaining Phase 3 auth work (tokenVersion, refresh tokens, password policy).

### 8. Push branch (do not push to main)

```bash
git push -u origin feature/nutrivibe-production-readiness
```

Then open a PR against `main`.
