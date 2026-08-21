# Security notes (Phase 9)

## What we do

- Passwords hashed with bcrypt  
- JWT auth on private API routes  
- Helmet, CORS locked to `CLIENT_URL` in production  
- Rate limits on general API, auth, scans, and AI explain  
- Body size limits (1mb)  
- `.env` gitignored; `.env.example` has placeholders only  
- Production error handler does not send stack traces to clients  
- Gemini timeouts; AI responses are never treated as medical advice  

## What you should do when deploying

1. Use a strong unique `JWT_SECRET`  
2. Restrict MongoDB Atlas network access when possible  
3. Rotate any secret that was ever committed or pasted in chat  
4. Keep `CLIENT_URL` exact (scheme + host, no path)  
5. Do not enable CORS `*` in production  

## Reporting

This is a portfolio project. If you find a serious issue, open a private note to the maintainer via GitHub.
