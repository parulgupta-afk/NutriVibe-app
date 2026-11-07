const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { matchesForUser, seedDemo } = require('../controllers/recallController');

router.use(auth);
router.get('/matches', matchesForUser);
router.post('/seed-demo', requireRole('admin'), seedDemo);

module.exports = router;
