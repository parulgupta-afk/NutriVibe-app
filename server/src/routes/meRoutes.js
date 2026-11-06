const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { exportMe, deleteMe } = require('../controllers/meController');

// All /api/me routes require valid JWT authentication
router.use(auth);

router.get('/export', exportMe);
router.delete('/', deleteMe);

module.exports = router;

