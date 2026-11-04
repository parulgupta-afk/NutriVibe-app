const { generatePlan, getActivePlan, buildFallbackDay } = require('../services/dietPlannerService');
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
    res.json({ success: true, data: plan || null });
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

/** Regenerate a single meal without rebuilding the whole plan */
async function regenerateMeal(req, res, next) {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const dayIndex = Number(req.body.dayIndex ?? 0);
    const mealType = req.body.mealType || 'lunch';
    const day = plan.days.find((d) => d.dayIndex === dayIndex);
    if (!day) return res.status(400).json({ message: 'Invalid dayIndex' });

    const prefs = plan.preferences || {};
    prefs.allergies = prefs.allergies || req.user.preferences?.allergies || [];
    prefs.restrictions = prefs.restrictions || req.user.preferences?.dietaryRestrictions || [];
    prefs.medications = req.user.preferences?.medications || [];
    prefs.dietType = plan.dietType;

    const fresh = await buildFallbackDay(prefs);
    const replacement = (fresh.meals || []).find((m) => m.mealType === mealType) || fresh.meals?.[0];
    if (!replacement) return res.status(400).json({ message: 'Could not generate replacement' });

    const idx = day.meals.findIndex((m) => m.mealType === mealType);
    if (idx >= 0) day.meals[idx] = replacement;
    else day.meals.push(replacement);

    plan.markModified('days');
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

/** Grocery list from plan ingredients */
async function groceryList(req, res, next) {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const counts = {};
    for (const day of plan.days || []) {
      for (const meal of day.meals || []) {
        for (const ing of meal.ingredients || [meal.mealName]) {
          const key = (ing || '').trim();
          if (!key) continue;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }

    const items = Object.entries(counts)
      .map(([name, qty]) => ({
        name,
        quantity: qty,
        unit: 'servings',
        category: /dal|paneer|chicken|egg|yogurt|milk/i.test(name)
          ? 'protein'
          : /rice|roti|oat|bread/i.test(name)
            ? 'grain'
            : /banana|fruit|veg/i.test(name)
              ? 'produce'
              : 'other',
        purchased: false,
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    res.json({ success: true, data: { planId: plan._id, items } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlan,
  getCurrent,
  getHistory,
  regenerateMeal,
  groceryList,
};
