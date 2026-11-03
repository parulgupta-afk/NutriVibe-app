const express = require('express');
const router = express.Router();
const { lookupIns, listIns } = require('../controllers/indianFoodController');

router.get('/ins', listIns);
router.post('/ins/lookup', lookupIns);
router.get('/ins/lookup', lookupIns);

module.exports = router;
