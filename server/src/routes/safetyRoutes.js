const express = require('express');
const { 
  getSafetyReport,
  updateSafetyReport,
  getUserReports,
} = require('../controllers/safetyController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get safety report for a product
router.get('/product/:productId', getSafetyReport);

// Update safety report
router.put('/report/:reportId', updateSafetyReport);

// Get all user safety reports
router.get('/reports', getUserReports);

module.exports = router;