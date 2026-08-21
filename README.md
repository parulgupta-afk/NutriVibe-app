# NutriVibe — Personalized Food Intelligence App

## 🚀 Overview

NutriVibe turns a barcode scan, live camera scan, or photographed ingredient label into an instant, personalized food safety verdict — not a generic nutrition score, but one that's actually checked against **your own** allergies, dietary restrictions, health goals, and medications (or a family member's, if you're managing food safety for someone else).


## 📸 Demo

Live demo: [nutri-vibe-app-iota.vercel.app](https://nutri-vibe-app-iota.vercel.app/)

> Tip for portfolio visitors: register, set an allergy (e.g. Dairy), then try demo barcode `4567890123456` (Greek Yogurt) to see an **Unsafe** verdict.

## 📐 Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a system diagram and the safety-verdict data path.

## 🧪 Tests

```bash
cd server
npm test
```


## 🚀 Deploy

Step-by-step: [DEPLOY.md](DEPLOY.md)

- Frontend: Vercel (`client/`) with `VITE_API_BASE_URL`
- Backend: Render/Railway (`server/`) with `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
- Optional Blueprint: [render.yaml](render.yaml)

## 🎥 Demo script

[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — 90-second Loom outline  
[docs/PORTFOLIO.md](docs/PORTFOLIO.md) — interview talking points  

## 🔒 Security

See [SECURITY.md](SECURITY.md).

## ✨ Features

### Scanning
- **Live camera barcode scanning** — point your camera at a real product barcode and get an instant read, no manual entry needed
- **OCR label scanning** — for products without a scannable barcode, photograph the ingredients list directly; extracted text is editable before submitting, since OCR isn't perfect
- **Real product data** via the [Open Food Facts](https://world.openfoodfacts.org/) open database, with automatic caching and self-healing image recovery for previously-scanned products

### Personalized Safety Intelligence
- **One unified safety verdict engine** — every scan is checked against the active profile's allergies, dietary restrictions, and medications through a single shared rules engine (not duplicated logic scattered across the app)
- **Medication–food interaction warnings** — flags real, well-documented interactions (e.g. grapefruit + statins, vitamin K–rich foods + blood thinners, tyramine + MAOIs)
- **AI-powered ingredient explainer** — uses Google Gemini to explain, in plain English, what's actually in a product and why it might matter to *this specific person* — never giving medical advice or telling the user whether to eat something
- **Safe swap suggestions** — when a product isn't a great fit, see personalized alternative products that actually are, based on the same real-time verdict check (not a generic "similar products" list)

### Family Profiles
- Manage allergy, diet, and medication data for multiple people under one account (e.g. a parent tracking a child's allergies)
- A "Scanning for: [Me / Name]" selector applies the right profile's rules to every scan and log
- Dashboard can show combined family stats or filter to one person

### Tracking & Dashboard
- Daily/date-based tracking dashboard with Safe/Caution/Unsafe breakdowns
- Click any safety category to see every matching item logged that day
- Per-entry delete, and bulk "Clear Log" for a given day
- Product photos throughout, with a manual "Check for photo" refresh and a polished default icon for products with no image on record
- Search recent logs and **export the day as CSV**
- Last successful scan remembered on-device for quick re-open

### Authentication
- Email/password registration and login
- **Google Sign-In**, with automatic account linking if the same email was already registered manually
- Full **forgot password** flow with hashed, time-limited reset tokens

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- **html5-qrcode** — live camera barcode/QR detection
- **Tesseract.js** — client-side OCR for label scanning
- Axios, React Hot Toast, Chart.js, date-fns

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + **Google OAuth** (`google-auth-library`)
- **Nodemailer** for password-reset emails (Ethereal for dev, real SMTP-ready for production)
- bcryptjs, express-validator, helmet, express-rate-limit

### External Services
- **Open Food Facts API** — real product/ingredient/allergen data
- **Google Gemini API** — personalized ingredient explanations
- **Google OAuth** — social sign-in

## 📁 Project Structure

\`\`\`
nutrivibe-app/
├── client/                        # React frontend
│   └── src/
│       ├── api/                   # Axios calls to the backend
│       ├── components/common/     # Reusable UI (Navbar, ProfileSelector, ProductImage, etc.)
│       ├── contexts/               # AuthContext, ProfileContext
│       └── pages/                  # Scanner, Product, Dashboard, Profiles, auth pages, etc.
├── server/                        # Express backend
│   └── src/
│       ├── config/                 # Database connection
│       ├── controllers/            # Route handlers
│       ├── data/                   # Allergen keyword lists, medication interaction rules
│       ├── middleware/             # Auth, validation, error handling
│       ├── models/                 # Mongoose schemas
│       ├── routes/                 # API route definitions
│       └── services/               # Open Food Facts, Gemini, email, safety engine, profile resolver
└── README.md
\`\`\`

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### Backend setup
\`\`\`bash
cd server
npm install
\`\`\`

Create a \`.env\` file in \`server/\` with:
\`\`\`
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
\`\`\`
*(SMTP_HOST/SMTP_USER/SMTP_PASS are optional — omit them and password reset emails will use a free Ethereal test inbox automatically, with a preview link logged to your console.)*

\`\`\`bash
npm run dev
\`\`\`

### Frontend setup
\`\`\`bash
cd client
npm install
\`\`\`

Create a \`.env\` file in \`client/\` with:
\`\`\`
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
\`\`\`

\`\`\`bash
npm run dev
\`\`\`

Visit **http://localhost:5173**.

## 🧩 Challenges & Fixes

A few real issues found and resolved during development, since they're a fair reflection of how this project actually came together:

- **Duplicated safety logic**: the personalized allergy/diet verdict was originally implemented three separate times across different controllers, and could silently disagree with itself. Consolidated into a single shared `safetyEngine.js` used everywhere.
- **Timezone bugs in the dashboard**: date-range filtering relied on the server's local timezone via `setHours()`, which could misattribute logs to the wrong calendar day for non-UTC users. Rewrote date handling to use explicit UTC boundaries throughout.
- **Leaked database credentials**: an early scratch file had a real MongoDB connection string hardcoded in plaintext, with no `.gitignore` in place to prevent it from ever reaching version control. Removed the file, added a proper `.gitignore`, and rotated all exposed credentials.
- **Production-breaking dependency misconfiguration**: all backend runtime dependencies were listed under `devDependencies`, which would have caused the app to fail to start under a production install.

## 📄 License

This project was built as a personal learning/portfolio project.

MIT — see [LICENSE](LICENSE).

See also [CONTRIBUTING.md](CONTRIBUTING.md) and [DEPLOY.md](DEPLOY.md) if present.

## 🔗 Live Demo
[https://nutri-vibe-app-iota.vercel.app](https://nutri-vibe-app-iota.vercel.app/)
