const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { submit, listMine, adminList, adminReview } = require('../controllers/submissionController');

router.use(auth);
router.post('/', submit);
router.get('/mine', listMine);
router.get('/admin', requireRole('admin'), adminList);
router.patch('/admin/:id', requireRole('admin'), adminReview);

module.exports = router;
