/**
 * Phase 2: fail fast on missing critical env vars in production.
 * In development, warn but still allow start (except MONGO_URI which DB needs).
 */
function validateEnv() {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const recommended = ['CLIENT_URL', 'GEMINI_API_KEY', 'GOOGLE_CLIENT_ID'];

  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Add them to server/.env before starting.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    const weak = recommended.filter((key) => !process.env[key] || !String(process.env[key]).trim());
    if (weak.length) {
      console.warn(`⚠️  Recommended env vars not set: ${weak.join(', ')}`);
    }
  }
}

module.exports = { validateEnv };
