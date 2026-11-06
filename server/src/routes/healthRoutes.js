/**
 * Authoritative Health & Readiness Endpoints
 * - GET /health -> Liveness probe (returns 200 if process is responsive)
 * - GET /ready  -> Readiness probe (checks real MongoDB connection and Redis ping if configured)
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'NutriVibe API process is alive',
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoOk = mongoState === 1;

  let redisOk = false;
  const redisConfigured = Boolean(process.env.REDIS_URL);

  if (redisConfigured) {
    try {
      const { getRedis } = require('../config/redis');
      const client = await getRedis();
      if (client) {
        await client.ping();
        redisOk = true;
      }
    } catch {
      redisOk = false;
    }
  } else {
    // Redis is optional when REDIS_URL is not configured
    redisOk = true;
  }

  // System is ready to accept traffic if primary database is connected
  // and Redis (if configured) is responsive.
  const isReady = mongoOk && (!redisConfigured || redisOk);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks: {
      mongo: {
        connected: mongoOk,
        readyState: mongoState
      },
      redis: {
        configured: redisConfigured,
        connected: redisConfigured ? redisOk : 'optional_not_configured'
      }
    }
  });
});

module.exports = router;
