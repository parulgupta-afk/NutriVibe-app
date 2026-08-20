# NutriVibe architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────────┐
│  React + Vite   │ ─────────────► │  Express API (Node)      │
│  Tailwind UI    │ ◄───────────── │  JWT + Google OAuth      │
│  html5-qrcode   │                │  rate limits + helmet    │
│  Tesseract OCR  │                └───────────┬──────────────┘
└─────────────────┘                            │
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     ▼                         ▼                         ▼
              ┌────────────┐          ┌────────────────┐        ┌──────────────┐
              │  MongoDB   │          │ Open Food Facts│        │ Google Gemini│
              │  users,    │          │ product data   │        │ explanations │
              │  products, │          │ + images       │        └──────────────┘
              │  tracking  │          └────────────────┘
              └────────────┘
```

## Safety path

1. User scans barcode (camera) or label (OCR)  
2. API loads product from cache or Open Food Facts  
3. `resolveEffectiveUser` picks account owner or dependent profile  
4. `computeSafetyVerdict` (single rules engine) checks:
   - allergens (structured + ingredient text)
   - cross-contamination relevant to user allergies
   - dietary rules
   - medication–food interactions  
5. Response includes product + personalized safety report  
6. Optional: Gemini explains ingredients in plain language (not medical advice)  

## Key modules

| Area | Location |
|------|----------|
| Verdict engine | `server/src/services/safetyEngine.js` |
| Allergen keywords | `server/src/data/allergenKeywords.js` |
| Dietary rules | `server/src/data/dietaryRules.js` |
| Med interactions | `server/src/data/medicationInteractions.js` |
| OFF client | `server/src/services/openFoodFactsService.js` |
| Scanner UI | `client/src/pages/Scanner.jsx` |
