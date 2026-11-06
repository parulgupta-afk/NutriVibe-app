/**
 * Phase 8 — /api/health (liveness) and /api/ready (Mongo + Redis)
 */

const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
});

router.get('/ready', async (req, res) => {
  const checks = { mongo: false, redis: false };
  try {
    // const mongoose = require('mongoose');
    // checks.mongo = mongoose.connection.readyState === 1;
    checks.mongo = true; // replace with real check
  } catch {
    checks.mongo = false;
  }
  try {
    // const redis = require('../config/redis');
    // await redis.ping();
    checks.redis = !!process.env.REDIS_URL; // replace with real ping
  } catch {
    checks.redis = false;
  }
  const ready = checks.mongo; // redis optional depending on deploy
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', checks });
});

module.exports = router;
