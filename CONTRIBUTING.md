# Contributing to NutriVibe

Thanks for interest in improving NutriVibe. This is primarily a portfolio / learning project; small, focused PRs are welcome.

## Setup

1. Fork and clone the repo  
2. Copy `server/.env.example` → `server/.env` and fill in values  
3. Client: create `client/.env` with `VITE_GOOGLE_CLIENT_ID` if using Google sign-in  

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Tests

```bash
cd server && npm test
```

## Guidelines

- Do not commit `.env` or secrets  
- Prefer small PRs with a clear description  
- Safety / allergy logic changes should include or update unit tests under `server/tests/`  
- This app provides **decision-support information only**, not medical advice — keep messaging that way  

## Branching

- `main` — stable demo  
- Feature branches: `feature/short-name` or `fix/short-name`  
