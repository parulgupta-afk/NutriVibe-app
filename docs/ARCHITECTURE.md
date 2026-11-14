# NutriVibe System Architecture

**Document Version:** 2.0.0  
**Classification:** Core System Architecture  
**Tagline:** "Eat Smart. Stay Safe. Live Better."

---

## 1. High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (React 18 + Vite)                │
│                                                                         │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │   AppShell /     │  │   Context Layer   │  │   Hardware Layer     │  │
│  │ Navigation Rail  │  │ (Auth + Profile)  │  │ (html5-qrcode + OCR) │  │
│  └────────┬─────────┘  └─────────┬─────────┘  └──────────┬───────────┘  │
│           │                      │                       │              │
│           └──────────────────────┼───────────────────────┘              │
│                                  ▼                                      │
│                       Axios HTTP Client Layer                           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTPS / REST JSON
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVER TIER (Node.js + Express)               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Security Gateway: Helmet CSP, CORS, Rate Limiters, Body Limits    │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Auth & Validation: JWT Verify, Fail-Closed Profile Resolver        │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Deterministic Safety Engine (Allergen, Diet, Medication, Nova)     │  │
│  └─────────┬─────────────────────────┼───────────────────────────────┘  │
│            │                         │                                  │
│            ▼                         ▼                                  │
│   ┌─────────────────┐       ┌─────────────────┐                         │
│   │  OpenFoodFacts  │       │  Google Gemini  │                         │
│   │   Integration   │       │   (Explainer)   │                         │
│   └─────────────────┘       └─────────────────┘                         │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │ Mongoose ODM
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA TIER (MongoDB + Redis)                   │
│                                                                         │
│   ┌─────────────────┐       ┌─────────────────┐       ┌──────────────┐  │
│   │      Users      │       │    Products     │       │  Scan Logs   │  │
│   │ (Auth/Profiles) │       │ (Catalog/Cache) │       │ (History)    │  │
│   └─────────────────┘       └─────────────────┘       └──────────────┘  │
│   ┌─────────────────┐       ┌─────────────────┐                         │
│   │   NutriLogs     │       │   Redis Cache   │                         │
│   │ (Daily Meals)   │       │   (Rate Limits) │                         │
│   └─────────────────┘       └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Single Unified Frontend (`client/`)

- **Framework & Tooling:** React 18, Vite 6.4.5, Tailwind CSS, React Router v7.
- **Entry Point:** [client/src/main.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/main.jsx) mounts `AuthProvider` and `ProfileProvider` wrapping [client/src/App.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/App.jsx).
- **Layout:** [client/src/components/layout/AppShell.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/components/layout/AppShell.jsx) provides a unified desktop sidebar navigation rail and mobile bottom bar navigation.
- **Core Visual Primitives:**
  - `VerdictRing` ([client/src/components/common/VerdictRing.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/components/common/VerdictRing.jsx)): Animated SVG circular verdict with accessible color and icon indicators.
  - `Ring` ([client/src/components/common/Ring.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/components/common/Ring.jsx)): Reusable circular progress component.
  - `SafetyBadge` ([client/src/components/common/SafetyBadge.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/components/common/SafetyBadge.jsx)): Semantic status badge with ARIA support.
  - `ProfileSelector` ([client/src/components/common/ProfileSelector.jsx](file:///c:/Users/parul/NutriVibe-app/client/src/components/common/ProfileSelector.jsx)): Switch active family profile on the fly.
- **Primary Pages:**
  - `Dashboard`: Consolidated daily safety breakdown, calorie progress, water tracker, and streak tracker.
  - `Scanner`: Dual-mode live camera barcode scanning (`html5-qrcode`) and OCR image label extraction (`tesseract.js`).
  - `Product`: Full product intelligence, food safety verdicts, allergen matches, nutrition breakdowns, Nova processing level, and safe alternatives.
  - `Profiles`: Family dependent management (allergies, dietary restrictions, medications).
  - `Nutrition`: Meal logging and macronutrient analysis.
  - `Hydration`: Water intake logging with streak tracking.
  - `VibeDiet`: Personalized meal planning.
  - `VibeAI`: Contextual nutrition assistant.
  - `Reactions`: Symptom and adverse reaction journal.
  - `Favorites`: Saved verified food products.

### 2.2 Backend API Services (`server/`)

- **Runtime:** Node.js 20+ with Express 5.
- **Data Persistence:** MongoDB via Mongoose 9 schemas with compound indexes.
- **Fail-Closed Profile Resolver:**
  - [server/src/services/profileResolver.js](file:///c:/Users/parul/NutriVibe-app/server/src/services/profileResolver.js): Resolves active user or dependent profile. Rejects foreign, malformed, or non-existent profile IDs with 404/403.
- **Deterministic Food Safety Engine:**
  - [server/src/services/safetyEngine.js](file:///c:/Users/parul/NutriVibe-app/server/src/services/safetyEngine.js): Modular rule engine:
    - `allergenRule.js`: Tokenizes and canonicalizes user allergies; evaluates structured tags and ingredient text.
    - `dietRule.js`: Validates restrictions (vegan, vegetarian, gluten-free, halal, kosher, etc.).
    - `medicationRule.js`: Evaluates known food-drug contraindications (grapefruit, MAOIs, potassium-sparing diuretics, vitamin K).
    - `processingRule.js`: Evaluates NOVA processing grades and additive thresholds.
    - `verdictSynthesis`: Synthesizes findings into canonical `SAFE`, `CAUTION`, `UNSAFE`, or `CANNOT_VERIFY`.
- **External API Clients:**
  - `openFoodFactsService.js`: Queries Open Food Facts with local caching and self-healing image recovery.
  - `geminiService.js`: Delivers plain-language ingredient explanations using prompt guardrails.
  - `emailService.js`: Transports password reset tokens via SMTP or Ethereal test inboxes.

---

## 3. Data Flow & Security Pipeline

1. **Client Request:** Client issues an authenticated HTTP request carrying JWT in `Authorization: Bearer <token>`.
2. **Security Gateway:**
   - Helmet sets strict Content-Security-Policy, anti-clickjacking, and HSTS headers.
   - CORS restricts origin to verified `CLIENT_URL`.
   - Global input sanitization recursively strips keys starting with `$` or containing `.` to eliminate NoSQL operator injection.
   - General and route-specific rate limiters mitigate abuse.
3. **Authentication & Profile Attribution:**
   - JWT verified with secret; user record retrieved.
   - Profile resolver extracts `profileId` query param and validates ownership against user's dependent list.
4. **Safety Verdict Generation:**
   - Barcode looked up in local database cache or queried from Open Food Facts.
   - Product payload passed to `computeSafetyVerdict(product, effectiveUser)`.
   - Deterministic rule evaluation produces `SAFE`, `CAUTION`, `UNSAFE`, or `CANNOT_VERIFY`.
5. **Client Rendering:**
   - Verdict displayed using `VerdictRing` and `SafetyBadge`.
   - Result persisted in local cache (`lastScanCache`) for offline glanceability.

---

## 4. Key Module Directory

| Purpose | Source File |
| --- | --- |
| Safety Engine Orchestrator | `server/src/services/safetyEngine.js` |
| Allergen Matching Rules | `server/src/safety/rules/allergenRule.js` |
| Dietary Restriction Rules | `server/src/safety/rules/dietRule.js` |
| Medication Interaction Rules | `server/src/safety/rules/medicationRule.js` |
| Fail-Closed Profile Resolver | `server/src/services/profileResolver.js` |
| Unified App Shell Navigation | `client/src/components/layout/AppShell.jsx` |
| Animated Verdict Ring | `client/src/components/common/VerdictRing.jsx` |
| SVG Progress Ring | `client/src/components/common/Ring.jsx` |
| Semantic Safety Badge | `client/src/components/common/SafetyBadge.jsx` |
| Barcode & OCR Scanner | `client/src/pages/Scanner.jsx` |

---

## 5. Architectural Invariants

1. **Deterministic Safety Authority:** Product safety verdicts (`SAFE`, `CAUTION`, `UNSAFE`, `CANNOT_VERIFY`) are calculated solely through deterministic rules in `server/src/safety/rules/`. AI or LLM models are NEVER authorized to grant product clearance.
2. **Fail-Closed Default:** Unparseable, corrupted, or missing ingredient records resolve to `CANNOT_VERIFY` or `UNSAFE`, never defaulting to `SAFE`.
3. **Multi-Profile Isolation:** Dependent safety assessments strictly inherit individual allergen and medication constraints without leakage into other profiles.
