# Phase 9 — Hardening checklist

Use this after deploy works.

## App

- [ ] `/api/health` returns OK with `mongo.connected: true` on live API  
- [ ] Login / register / logout on live site  
- [ ] Scan works with real or demo barcode  
- [ ] Google login works only if origins are configured  
- [ ] AI explain fails gracefully if `GEMINI_API_KEY` missing  

## Ops

- [ ] Render/Railway auto-deploys from `main` (optional)  
- [ ] Vercel auto-deploys from `main`  
- [ ] Cold start: first request after idle may be slow on free tiers — expected  
- [ ] Monitor Atlas free tier storage  

## Code hygiene

- [ ] `cd server && npm test` still passes  
- [ ] `git status` shows no `.env`  
- [ ] No API keys in README or screenshots  
