const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { envSummary, validateEnv } = require('../src/config/validateEnv');

describe('validateEnv and envSummary unit tests', () => {
  it('envSummary masks secrets and returns status strings', () => {
    const summary = envSummary();
    assert.equal(typeof summary.NODE_ENV, 'string');
    assert.ok(summary.MONGO_URI === 'set' || summary.MONGO_URI === 'missing');
    assert.ok(summary.JWT_SECRET === 'set' || summary.JWT_SECRET === 'missing');
    // Ensure raw secrets are NEVER exposed in summary
    assert.notEqual(summary.JWT_SECRET, process.env.JWT_SECRET);
  });

  it('validateEnv returns boolean capability flags without crashing when required keys are set', () => {
    const originalMongo = process.env.MONGO_URI;
    const originalJwt = process.env.JWT_SECRET;

    process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
    process.env.JWT_SECRET = 'super-secret-random-key-12345';

    try {
      const result = validateEnv();
      assert.equal(typeof result.isProd, 'boolean');
      assert.equal(typeof result.hasGemini, 'boolean');
      assert.equal(typeof result.hasGoogleOAuth, 'boolean');
    } finally {
      process.env.MONGO_URI = originalMongo;
      process.env.JWT_SECRET = originalJwt;
    }
  });
});
