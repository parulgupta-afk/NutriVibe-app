const express = require('express');
const { 
  logProduct, 
  getDailyTracking, 
  getHistory,
  getStats,
  clearLogs,
  deleteLog,
} = require('../controllers/trackingController');
const auth = require('../middleware/auth');
const { validateTracking, validate } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Log a product
router.post('/log', validate(validateTracking), logProduct);

// Get daily tracking
router.get('/daily', getDailyTracking);

// Get tracking history
router.get('/history', getHistory);

// Get tracking statistics
router.get('/stats', getStats);

// Clear logs (optionally scoped to a single day via ?date=)
// IMPORTANT: this must stay registered before the /:id route below,
// otherwise Express would try to treat "clear" as an :id value.
router.delete('/clear', clearLogs);

// Delete a single log entry by its ID
router.delete('/:id', deleteLog);

module.exports = router;