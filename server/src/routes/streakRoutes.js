const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStreakSummary } = require('../services/streakService');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const summary = await getStreakSummary(req.user._id);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
