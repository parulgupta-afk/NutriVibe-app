const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchFoods, getFoodById, seedFoods } = require('../controllers/foodController');

// Public search is fine for food composition; seed should be protected
router.get('/', searchFoods);
router.get('/:id', getFoodById);
router.post('/seed', auth, seedFoods);

module.exports = router;
