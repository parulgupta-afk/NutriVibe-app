const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chatHandler, confirmAIMeal, suggestFromText } = require('../controllers/aiController');

router.use(auth);

router.post('/chat', chatHandler);
router.post('/meals/confirm', confirmAIMeal);
router.post('/meals/suggest-text', suggestFromText);

module.exports = router;
