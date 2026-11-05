# NutriVibe — Production Deployment & Operational Verification Guide

**Application**: NutriVibe  
**Target Environments**:  

- **Frontend SPA**: Vercel (or Netlify/Cloudflare Pages)  
- **Backend API**: Render (or Railway/AWS ECS)  
- **Database**: MongoDB Atlas (v6.0+)  
- **Cache**: Redis Cloud (optional, graceful in-memory fallback enabled)  

---

## 1. Environment Variable Checklist

### Backend Configuration (`server/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Node execution environment | `production` |
| `PORT` | Yes | HTTP listening port | `5000` (assigned dynamically by Render) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/nutrivibe` |
| `JWT_SECRET` | Yes | Secret key for signing auth tokens (min 32 chars) | `super_secure_random_string_min_32_characters` |
| `CLIENT_URL` | Yes | Whitelisted frontend origin for CORS | `https://nutri-vibe-app-iota.vercel.app` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for plain-language ingredient explanations | `AIzaSy...` (from Google AI Studio) |
| `REDIS_URL` | Optional | Redis connection string for response caching | `rediss://default:pass@redis-host:6379` |
| `SMTP_HOST` | Optional | SMTP mail host for password resets | `smtp.sendgrid.net` |
| `SMTP_PORT` | Optional | SMTP port | `587` |
| `SMTP_USER` | Optional | SMTP username | `apikey` |
| `SMTP_PASS` | Optional | SMTP password | `SG.secret` |
| `FROM_EMAIL` | Optional | Sender address for system emails | `no-reply@nutrivibe.app` |

### Frontend Configuration (`client/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | Full URL pointing to backend API | `https://nutrivibe-server.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Web Client ID for Google Sign-In | `123456789-abc.apps.googleusercontent.com` |

---

## 2. Production Deployment Steps

### Frontend (Vercel)

1. Link your GitHub repository in the Vercel dashboard.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Configure Build & Output Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com`
6. Deploy.

### Backend (Render)

1. Create a new **Web Service** linked to the GitHub repository.
2. Set **Root Directory** to `server`.
3. Set Environment to `Node`.
4. Configure Build & Start Commands:
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
5. Configure Environment Variables as specified in Section 1.
6. Configure health check path: `/api/health`.
7. Deploy.

---

## 3. Health Check & Monitoring

### Endpoint: `GET /api/health`

A zero-downtime, unauthenticated health check endpoint is provided at `/api/health`.

#### Sample Response

```json
{
  "status": "ok",
  "service": "NutriVibe API",
  "timestamp": "2026-11-05T12:30:00.000Z",
  "uptime": 1420.55,
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 4. Smoke Test Matrix (Post-Deploy Verification)

| Test ID | Action | Expected Output | Verification Method |
| :--- | :--- | :--- | :--- |
| **ST-01** | `GET /api/health` | HTTP 200, `status: "ok"` | `curl -f https://backend/api/health` |
| **ST-02** | User Registration | HTTP 201, token returned | `POST /api/auth/register` |
| **ST-03** | Product Scan: `4567890123456` | HTTP 200, returns Greek Yogurt | `GET /api/products/4567890123456` |
| **ST-04** | Dairy Allergic Safety Check | HTTP 200, `verdict: "UNSAFE"` | `GET /api/products/4567890123456` |
| **ST-05** | Public API Key Check | HTTP 200, deterministic evaluation | `POST /v1/check` with `X-API-Key` |
| **ST-06** | UI Dashboard Load | Loads cards without JS errors | Browser automated smoke test |

---

## 5. Rollback & Disaster Recovery Procedures

1. **Frontend Instant Rollback**: Vercel maintains instant deployment snapshots. In the Vercel dashboard, navigate to Deployments, select the previous stable deployment, and click **Promote to Production**.
2. **Backend Rollback**: In Render, select the previous successful build from the Events/Deploy history and trigger a rollback.
3. **Database Point-In-Time Restore**: MongoDB Atlas maintains continuous automated snapshots. If a data corruption event occurs, use the Atlas console to trigger a Point-in-Time Restore (PITR) to a timestamp preceding the event.
