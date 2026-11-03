const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPlan, getCurrent, getHistory } = require('../controllers/dietController');

router.use(auth);

router.post('/generate', createPlan);
router.get('/current', getCurrent);
router.get('/history', getHistory);

module.exports = router;
