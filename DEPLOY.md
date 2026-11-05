# NutriVibe — Deploy guide (Phase 7)

Deploy **backend** and **frontend** separately. The client calls the API via `VITE_API_BASE_URL`.

---

## 1. MongoDB Atlas

1. Create a cluster (free M0 is fine for demo).
2. Database Access → user with password.
3. Network Access → allow your host IPs, or `0.0.0.0/0` for a public demo only.
4. Copy connection string → `MONGO_URI`.

---

## 2. Backend (Render example)

1. New **Web Service** → connect this GitHub repo.
2. **Root Directory:** `server`
3. **Build:** `npm install`
4. **Start:** `npm start`
5. **Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or Render’s default) |
| `MONGO_URI` | Atlas URI |
| `JWT_SECRET` | long random string (16+) |
| `CLIENT_URL` | `https://your-frontend.vercel.app` (no trailing slash) |
| `GEMINI_API_KEY` | optional |
| `GOOGLE_CLIENT_ID` | optional (same as client) |

6. After deploy, open `https://YOUR-API.onrender.com/api/health`  
   Expect: `"status":"OK"` and `"mongo":{"connected":true}`.

### Railway / Fly.io

Same env vars. Start command: `npm start` from `server/`.

---

## 3. Frontend (Vercel)

1. New project → same repo.
2. **Root Directory:** `client`
3. Framework: Vite
4. Build: `npm run build` · Output: `dist`
5. **Environment:**

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://YOUR-API.onrender.com` (no trailing slash) |
| `VITE_GOOGLE_CLIENT_ID` | same as server `GOOGLE_CLIENT_ID` if using Google login |

6. Deploy. Copy the Vercel URL into server `CLIENT_URL`, then **redeploy the backend**.

### Google Sign-In

In Google Cloud Console → OAuth client → **Authorized JavaScript origins**:

- `http://localhost:5173`
- `https://your-frontend.vercel.app`

---

## 4. Smoke test

1. Open the live site → Register / Login  
2. Set allergy “Dairy” → scan barcode `4567890123456`  
3. Check Safe / Unsafe badge  
4. Dashboard → log appears  

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS errors | `CLIENT_URL` must match the exact frontend origin |
| `ECONNREFUSED` / network errors | `VITE_API_BASE_URL` wrong or backend asleep (Render free tier cold starts) |
| Mongo auth failed | Rotate Atlas password; update `MONGO_URI` |
| Google button broken | Origins + client ID mismatch |

---

## Local production-like check

```bash
# terminal 1
cd server
set NODE_ENV=production
npm start

# terminal 2 — after build
cd client
set VITE_API_BASE_URL=http://localhost:5000
npm run build
npx serve dist
```
