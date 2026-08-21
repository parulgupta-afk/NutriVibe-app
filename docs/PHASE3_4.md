# Engineering Phases 3–4

## Phase 3 — Regression tests

- `server/tests/productService.test.js` — safety report shape, OFF error mapping, alternative ranking (no Mongo required for these cases)

Run:

```bash
cd server && npm test
```

## Phase 4 — Product service extraction (behavior preserved)

New: `server/src/services/productService.js`

| Function | Role |
|----------|------|
| `generateSafetyReport` | Same client payload as before |
| `findOrFetchByBarcode` | Mongo → OFF → cache |
| `rankAlternatives` | Scoring (testable pure logic) |
| `getAlternativesForProduct` | Load candidates + rank |
| `searchByText` | `$text` search |
| `mapOffFailure` | Status/message for OFF errors |

Updated: `server/src/controllers/productController.js`

- Barcode / alternatives / search call the service
- scanLabel, refreshImage, explain still in controller (thin HTTP + create)
- **No API response shape changes**
- **No schema changes**

## Verify

1. `npm test`  
2. `npm run dev` — barcode scan still works  
3. Alternatives still appear on unsafe products  
4. Search still works  

## Commit

```bash
git add server/src/services/productService.js server/src/controllers/productController.js server/tests/productService.test.js docs/PHASE3_4.md
git commit -m "engineering: Phase 3-4 product service extraction + ranking tests"
git push origin main
```

## Next (when green)

- Phase 6: expand validation on barcode param  
- Phase 7: split safety rules into `safety/rules/*` without changing verdicts  
- Still no Redis / TS / Docker until later  
