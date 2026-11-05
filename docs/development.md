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

- Web (Client v1): http://localhost:5173  
- Web (Client v2): http://localhost:5174  
- API: http://localhost:5000/api/health  
- OpenAPI: http://localhost:5000/api/docs  

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
|----------|--------|----------|
| MONGO_URI | server | Yes |
| JWT_SECRET | server | Yes |
| CLIENT_URL | server (prod) | Yes in prod |
| GEMINI_API_KEY | server | No |
| GOOGLE_CLIENT_ID | server | No |
| REDIS_URL | server | No |
| VITE_API_BASE_URL | client (prod build) | Yes in prod |
| VITE_GOOGLE_CLIENT_ID | client | No |

## Project layout

```
client/   React + Vite
server/   Express + Mongoose
docs/     Architecture, API, deploy notes
```
