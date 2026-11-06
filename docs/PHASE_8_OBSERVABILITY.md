# Phase 8 — Observability, monitoring & privacy

## Deliverables in this package

- `server/src/middleware/logger.js` — Pino + redaction + request id
- `server/src/routes/healthRoutes.js` — `/api/health`, `/api/ready`
- `server/src/controllers/meController.js` — export + delete stubs

## Wire-up

1. `npm install pino pino-http` in server
2. Mount health routes early in `app.js`
3. Mount `GET /api/me/export` and `DELETE /api/me` behind auth
4. Replace `console.*` / morgan with `logger` and `requestLogger`
5. Add medical disclaimer in client UI + README
6. Add privacy policy page stub in client

## Medical disclaimer text

NutriVibe provides informational food and nutrition insights only. It is not a substitute for professional medical advice. Always verify important dietary, allergy, and medication-related decisions with a qualified healthcare professional.
