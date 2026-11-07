const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validate } = require('../validators/validate');
const { updateGoalsSchema } = require('../validators/hydration.validator');
const {
  logWater,
  getTodayHydration,
  getWeeklyHydration,
  getOrUpdateGoals,
} = require('../controllers/hydrationController');

router.use(auth);

router.post('/log', logWater);
router.get('/today', getTodayHydration);
router.get('/weekly', getWeeklyHydration);
router.get('/goals', getOrUpdateGoals);
router.put('/goals', validate({ body: updateGoalsSchema }), getOrUpdateGoals);

module.exports = router;
