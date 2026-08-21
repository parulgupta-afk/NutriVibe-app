const express = require('express');
const {
  logProduct,
  getDailyTracking,
  getHistory,
  getStats,
  clearLogs,
  deleteLog
} = require('../controllers/trackingController');
const auth = require('../middleware/auth');
const { validateTracking, validate } = require('../middleware/validation');
const { idempotency } = require('../middleware/idempotency');

const router = express.Router();

router.use(auth);

// Phase 15: optional Idempotency-Key prevents double-log on retries
router.post('/log', validate(validateTracking), idempotency, logProduct);

router.get('/daily', getDailyTracking);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.delete('/clear', clearLogs);
router.delete('/:id', deleteLog);

module.exports = router;
