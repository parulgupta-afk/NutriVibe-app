const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createReaction, listReactions, insights } = require('../controllers/reactionController');

router.use(auth);
router.post('/', createReaction);
router.get('/', listReactions);
router.get('/insights', insights);

module.exports = router;
