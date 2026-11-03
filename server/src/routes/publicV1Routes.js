const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateApiKey, checkFood, createKey } = require('../controllers/publicApiController');
const auth = require('../middleware/auth');

const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded' },
});

// Authenticated users create keys
router.post('/keys', auth, createKey);

// Public check
router.post('/check', publicLimiter, authenticateApiKey, checkFood);

module.exports = router;
