const { generatePlan, getActivePlan } = require('../services/dietPlannerService');
const DietPlan = require('../models/DietPlan');

async function createPlan(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      days = 1,
      goal,
      dietType,
      cuisine,
      allergies,
      restrictions,
      likes,
      dislikes,
      mealsPerDay,
      budget,
      profileId,
    } = req.body;

    const plan = await generatePlan(userId, {
      profileId,
      days: Math.min(Number(days) || 1, 7),
      goal,
      dietType,
      cuisine,
      preferences: {
        allergies: allergies || req.user.preferences?.allergies || [],
        restrictions: restrictions || req.user.preferences?.dietaryRestrictions || [],
        medications: req.user.preferences?.medications || [],
        likes: likes || [],
        dislikes: dislikes || [],
        mealsPerDay: mealsPerDay || 3,
        budget,
        dietType,
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

async function getCurrent(req, res, next) {
  try {
    const plan = await getActivePlan(req.user._id);
    if (!plan) return res.status(404).json({ message: 'No active diet plan' });
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const plans = await DietPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlan,
  getCurrent,
  getHistory,
};
