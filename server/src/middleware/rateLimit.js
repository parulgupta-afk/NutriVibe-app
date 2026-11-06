/**
 * Rate limiting: Redis store when REDIS_URL is set, memory fallback in dev.
 * Per-IP + per-user limits for expensive routes.
 *
 * Requires: express-rate-limit (already used or install), and existing redis client.
 */

// Example wiring (adapt to your app.js and redis config):

/*
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis'); // only if you add this dep, or use a simple Redis INCR wrapper
const redis = require('../config/redis');

function createLimiter({ windowMs, max, keyPrefix, useUser = false }) {
  const opts = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests' },
    keyGenerator: (req) => {
      if (useUser && req.user?._id) return `${keyPrefix}:user:${req.user._id}`;
      return `${keyPrefix}:ip:${req.ip}`;
    },
  };
  if (process.env.REDIS_URL && redis?.client) {
    // Prefer a Redis-backed store for multi-instance. If rate-limit-redis is not installed,
    // implement a minimal store with INCR + EXPIRE on your existing client.
    // opts.store = new RedisStore({ sendCommand: (...args) => redis.client.call(...args) });
  }
  return rateLimit(opts);
}

const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: 'auth' });
const scanLimiter = createLimiter({ windowMs: 60 * 1000, max: 20, keyPrefix: 'scan', useUser: true });
const aiLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 50, keyPrefix: 'ai', useUser: true });

module.exports = { authLimiter, scanLimiter, aiLimiter, createLimiter };
*/

// Scaffold export so imports do not crash until wired:
module.exports = {
  authLimiter: (req, res, next) => next(),
  scanLimiter: (req, res, next) => next(),
  aiLimiter: (req, res, next) => next(),
  createLimiter: () => (req, res, next) => next(),
  NOTE: 'Replace no-op limiters with real express-rate-limit + Redis store when ready',
};
