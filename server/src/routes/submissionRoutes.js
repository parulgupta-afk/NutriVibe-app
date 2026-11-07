const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { submit, listMine, adminList, adminReview } = require('../controllers/submissionController');

router.use(auth);
router.post('/', submit);
router.get('/mine', listMine);
router.get('/admin', adminList);
router.patch('/admin/:id', adminReview);

module.exports = router;
