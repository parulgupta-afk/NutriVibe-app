# Phase 1 — Recovery verification checklist

Run locally after pulling. Check each box only when verified.

## Start

- [ ] `cd server && npm install && npm run dev` — starts without crash  
- [ ] `GET http://localhost:5000/api/health` — `status: OK`, `mongo.connected: true`  
- [ ] `cd client && npm install && npm run dev` — Vite on `:5173`  

## Auth

- [ ] Register new user  
- [ ] Login  
- [ ] `/api/auth/me` returns user  
- [ ] Logout  

## Profiles

- [ ] Update preferences (allergy e.g. Dairy)  
- [ ] Create dependent (if used)  
- [ ] Profile selector works on Scanner  

## Products / safety

- [ ] Barcode `4567890123456` (demo yogurt) with Dairy allergy → Unsafe/Caution as expected  
- [ ] Barcode `1234567890123` almond milk with Dairy allergy → not falsely Unsafe for dairy  
- [ ] Product page loads SafetyBadge  
- [ ] Alternatives load when unsafe  

## Tracking / dashboard

- [ ] Log product  
- [ ] Dashboard shows counts  
- [ ] Search / export CSV if present  

## Optional integrations

- [ ] Gemini explain (needs `GEMINI_API_KEY`) — fails gracefully if missing  
- [ ] Google login (needs client IDs) — optional  
- [ ] OCR label scan — optional  

## Tests

- [ ] `cd server && npm test` — all pass  

**Do not start Phase 4 architecture refactor until this checklist is green.**
