# Contributing to NutriVibe

Thank you for your interest in improving NutriVibe! This guide outlines how to set up your local development environment, run test suites, and submit contributions.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: MongoDB Atlas cluster or a local instance (`mongodb://localhost:27017/nutrivibe`)
- **Docker** (optional): For running MongoDB, Redis, and full-stack services via docker-compose
- **Git**

---

## 2. Project Architecture

NutriVibe is organized into a modular monorepo:

- **`client/`**: Official unified React 18 + Vite SPA styled with Tailwind CSS, utilizing React Router, AppShell, and Axios (Port 5173).
- **`server/`**: Node.js + Express backend with MongoDB (Mongoose), strict rate limiting, deterministic food safety engine, and JWT authentication (Port 5000).
- **`docs/`**: Architecture diagrams, security reviews, audit logs, and developer guides.

---

## 3. Local Development Setup

### 1. Clone & Configure

```bash
git clone https://github.com/parulgupta-afk/NutriVibe-app.git
cd NutriVibe-app
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Start Development Servers

- Backend API server (runs on `http://localhost:5000`):

  ```bash
  cd server && npm run dev
  ```

- Frontend client (runs on `http://localhost:5173`):

  ```bash
  cd client && npm run dev
  ```

---

## 4. Running Tests

- Safety Evaluation Suite: `cd server && npm run eval`
- Client Code Quality & Lint: `cd client && npm run lint`

### Backend Unit Tests

Runs the built-in Node.js test runner across all unit tests in `server/tests/`:

```bash
cd server
npm test
```

### Backend End-to-End Tests

Validates all authenticated and public REST API routes against the running server:

```bash
cd server
npm run test:e2e
```

### Frontend Tests & Linting

```bash
cd client
npm test
npm run lint
```

---

## 5. Development Guidelines

- **Deterministic Safety**: Always route allergen, medication, and dietary evaluations through the deterministic safety engine (`server/src/services/safetyEngine.js`). Never allow an LLM to override safety evaluations.
- **Rate Limiting**: Health checks (`/api/health`) must remain outside general rate limiters so monitoring probes function reliably.
- **Conventional Commits**: Format commit messages clearly using conventional prefixes:
  - `feat: <feature description>`
  - `fix: <bug fix description>`
  - `test: <test suite addition>`
  - `docs: <documentation updates>`
  - `chore: <maintenance tasks>`
- **Security**: Never commit `.env` files or secrets.
