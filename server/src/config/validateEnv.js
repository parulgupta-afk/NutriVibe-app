/**
 * Production-aware env validation.
 * - Always require MONGO_URI + JWT_SECRET
 * - Production: CLIENT_URL required; JWT_SECRET must be >= 32 chars and not a known example
 */
function validateEnv() {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Add them to server/.env (see server/.env.example).');
    process.exit(1);
  }

  const secret = String(process.env.JWT_SECRET);
  const exampleSecrets = new Set([
    'change-me-to-a-long-random-string',
    'secret',
    'jwt_secret',
    'your_jwt_secret',
  ]);
  const isProd = process.env.NODE_ENV === 'production';

  if (secret.length < 16) {
    console.warn('JWT_SECRET is short; use at least 32 random characters in production.');
  }

  if (isProd) {
    if (secret.length < 32 || exampleSecrets.has(secret)) {
      console.error('Production refuses to start: JWT_SECRET must be a random string of at least 32 characters (not an example value).');
      process.exit(1);
    }
    if (!process.env.CLIENT_URL) {
      console.error('CLIENT_URL is required in production (used for CORS).');
      process.exit(1);
    }
  }

  const optional = ['GEMINI_API_KEY', 'GOOGLE_CLIENT_ID', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const unsetOptional = optional.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (isProd && unsetOptional.length) {
    console.warn(`Optional env not set (some features disabled): ${unsetOptional.join(', ')}`);
  }

  return {
    isProd,
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    hasGoogleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID),
  };
}

function envSummary() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGO_URI ? 'set' : 'missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing',
    CLIENT_URL: process.env.CLIENT_URL || '(default localhost:5173)',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'set' : 'missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing',
  };
}

module.exports = { validateEnv, envSummary };
