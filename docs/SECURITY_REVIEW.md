# Phase 18 — Security review (checklist)

## Already in place

- [x] Passwords hashed (bcrypt)  
- [x] JWT on private routes  
- [x] Helmet  
- [x] CORS tied to `CLIENT_URL`  
- [x] Rate limits (general, auth, scan, AI)  
- [x] Body size limit 1mb  
- [x] `.env` gitignored; `.env.example` placeholders only  
- [x] Production error handler hides stacks  
- [x] Gemini is explanation-only (not medical decisions)  

## This pack

- [x] Auth middleware does not log tokens  
- [x] Auth errors include stable `error.code`  
- [x] Idempotency keys capped at 128 chars  
- [x] `.env.example` documents Redis as optional  

## Deploy checklist

- [ ] Unique strong `JWT_SECRET` in production  
- [ ] Atlas network rules tightened when possible  
- [ ] No secrets in GitHub Actions logs  
- [ ] `CLIENT_URL` exact match to frontend origin  
- [ ] Google OAuth origins list production domain only as needed  

## Out of scope (later)

- Full RBAC admin roles  
- Content-Security-Policy strict mode (camera SPA needs care)  
- Redis AUTH password when Redis is enabled  
