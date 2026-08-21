# Phase 25 — Final engineering review

Check only when verified on your machine / deploy.

## Functionality

- [ ] Frontend starts (`client` npm run dev / Docker web)
- [ ] Backend starts + `/api/health` OK + Mongo connected
- [ ] Register / login / logout
- [ ] Preferences (allergy) save
- [ ] Barcode lookup + safety badge
- [ ] Alternatives
- [ ] Log + dashboard
- [ ] Favorites (if used)
- [ ] OCR / Gemini fail gracefully if keys missing

## Architecture

- [ ] Controllers stay thin where refactored (product service)
- [ ] Safety rules modular under `server/src/safety/rules`
- [ ] AI does not decide medical safety

## Reliability

- [ ] OFF timeout + retry
- [ ] Gemini timeout
- [ ] Structured errors with `message` for UI

## Security

- [ ] No `.env` in git
- [ ] JWT + helmet + rate limits
- [ ] Production secrets unique

## Quality

- [ ] `cd server && npm test` passes
- [ ] Client build: `cd client && npm run build`
- [ ] CI green on GitHub Actions

## Docs

- [ ] README links work
- [ ] `/api/docs` opens
- [ ] DEPLOY.md followed at least once

**Sign-off date:** ________  
**Commit:** ________  
