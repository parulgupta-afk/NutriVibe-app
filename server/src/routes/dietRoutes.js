const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPlan,
  getCurrent,
  getHistory,
  regenerateMeal,
  groceryList,
} = require('../controllers/dietController');

router.use(auth);

router.post('/generate', createPlan);
router.get('/current', getCurrent);
router.get('/history', getHistory);
router.post('/:id/regenerate-meal', regenerateMeal);
router.post('/:id/swap-meal', regenerateMeal);
router.post('/:id/grocery-list', groceryList);

module.exports = router;
