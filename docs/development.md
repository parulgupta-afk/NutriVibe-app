# Development

## Prerequisites

- Node 20+
- MongoDB Atlas (or local Mongo)
- Optional: Redis, Docker Desktop

## Quick start

```bash
# server
cd server
cp .env.example .env   # set MONGO_URI, JWT_SECRET
npm install
npm run dev

# client (Option A: Classic UI)
cd client
npm install
npm run dev

# client-v2 (Option B: NutriVibe 2.0 UI)
cd client-v2
npm install
npm run dev
```

- Web (Client v1): <http://localhost:5173>  
- Web (Client v2): <http://localhost:5174>  
- API: <http://localhost:5000/api/health>  
- OpenAPI: <http://localhost:5000/api/docs>  

## Tests

```bash
cd server
npm test
```

## Docker

From repo root (with `server/.env` filled):

```bash
docker compose up --build
```

## Env cheat sheet

| Variable | Where | Required |
| ---------- | -------- | ---------- |
| MONGO_URI | server | Yes |
| JWT_SECRET | server | Yes |
| CLIENT_URL | server (prod) | Yes in prod |
| GEMINI_API_KEY | server | No |
| GOOGLE_CLIENT_ID | server | No |
| REDIS_URL | server | No |
| VITE_API_BASE_URL | client (prod build) | Yes in prod |
| VITE_GOOGLE_CLIENT_ID | client | No |

## Project layout

```text
client/     Unified React + Vite UI (:5173)
server/     Express API (:5000)
docs/       Architecture, API, deploy notes
```

## Troubleshooting Local Ports & Dev Servers

- **Port in use**: If port 5173 or 5174 is locked, check running Node processes:
  - Windows: `netstat -ano | findstr ":5173 :5174"` then `taskkill /PID <pid> /F`
  - Linux/Mac: `lsof -i :5173` or `lsof -i :5174` then `kill -9 <pid>`
- **CORS errors**: The server allows both `http://localhost:5173` and `http://localhost:5174` out of the box.
- **Service Worker Stale Cache**: In development, `client/src/main.jsx` automatically unregisters old service workers to prevent HMR and port conflicts.
