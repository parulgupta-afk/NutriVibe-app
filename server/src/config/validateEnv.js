/**
 * Phase 4: production-aware env validation.
 * - Always require MONGO_URI + JWT_SECRET
 * - In production, also require CLIENT_URL (CORS) and warn on missing optional keys
 * - Never print secret values
 */
function validateEnv() {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Add them to server/.env (see server/.env.example).');
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('JWT_SECRET is short; use at least 16 random characters in production.');
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !process.env.CLIENT_URL) {
    console.error('CLIENT_URL is required in production (used for CORS).');
    process.exit(1);
  }

  const optional = ['GEMINI_API_KEY', 'GOOGLE_CLIENT_ID', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const unsetOptional = optional.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (isProd && unsetOptional.length) {
    console.warn(`Optional env not set (some features disabled): ${unsetOptional.join(', ')}`);
  }

  return {
    isProd,
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    hasGoogleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID)
  };
}

/** Safe summary for startup logs — never includes secret values */
function envSummary() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGO_URI ? 'set' : 'missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing',
    CLIENT_URL: process.env.CLIENT_URL || '(default localhost:5173)',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'set' : 'missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing'
  };
}

module.exports = { validateEnv, envSummary };
