const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createMeal,
  getTodayMeals,
  getMealHistory,
  updateMeal,
  deleteMeal,
} = require('../controllers/mealController');

router.use(auth);

router.post('/', createMeal);
router.get('/today', getTodayMeals);
router.get('/history', getMealHistory);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
