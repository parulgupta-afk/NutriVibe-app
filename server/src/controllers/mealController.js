/**
 * Meal tracking controller (Phase 2).
 */
const Meal = require('../models/Meal');
const FoodItem = require('../models/FoodItem');
const NutritionGoal = require('../models/NutritionGoal');
const { calculateFromGrams, sumNutrition, roundTotals } = require('../services/nutritionCalculator');
const { updateMealStreak } = require('../services/streakService');

/**
 * Helper: get YYYY-MM-DD in a timezone (simple UTC offset approximation for demo;
 * production should use a proper library like luxon or date-fns-tz).
 */
function getLocalDate(date = new Date(), timezone = 'Asia/Kolkata') {
  // For portfolio demo we use ISO date; real app should respect user timezone fully.
  return date.toISOString().slice(0, 10);
}

async function createMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const { mealType, items, notes, source = 'manual', localDate: clientDate } = req.body;

    if (!mealType || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'mealType and items are required' });
    }

    const processedItems = [];
    for (const item of items) {
      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      let grams = item.grams || item.quantity || 0;
      let name = item.name;
      let isEstimated = !!item.isEstimated;

      if (item.foodItemId) {
        const food = await FoodItem.findById(item.foodItemId);
        if (food) {
          name = food.name;
          nutrition = calculateFromGrams(food.per100g, grams);
          isEstimated = false;
        }
      } else if (item.nutrition) {
        // Custom / estimated values provided by user
        nutrition = item.nutrition;
        isEstimated = true;
      }

      processedItems.push({
        foodItemId: item.foodItemId || undefined,
        name,
        quantity: item.quantity || grams,
        unit: item.unit || 'g',
        grams,
        nutrition,
        isEstimated,
      });
    }

    const totals = roundTotals(sumNutrition(processedItems));
    const localDate = clientDate || getLocalDate();

    const meal = await Meal.create({
      userId,
      mealType,
      date: new Date(),
      localDate,
      items: processedItems,
      totals,
      notes,
      source,
    });

    // Update streak (non-blocking for response)
    updateMealStreak(userId, localDate).catch(console.error);

    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
}

async function getTodayMeals(req, res, next) {
  try {
    const userId = req.user._id;
    const localDate = req.query.date || getLocalDate();
    const meals = await Meal.find({ userId, localDate }).sort({ createdAt: 1 });
    const dailyTotals = roundTotals(
      meals.reduce(
        (acc, m) => {
          acc.calories += m.totals.calories || 0;
          acc.protein += m.totals.protein || 0;
          acc.carbs += m.totals.carbs || 0;
          acc.fat += m.totals.fat || 0;
          acc.fiber += m.totals.fiber || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      )
    );
    res.json({ success: true, data: { meals, dailyTotals, localDate } });
  } catch (err) {
    next(err);
  }
}

async function getMealHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const meals = await Meal.find({ userId }).sort({ date: -1 }).limit(limit);
    res.json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
}

async function updateMeal(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    // Simplified: allow notes / mealType update; full item re-calc can be expanded
    if (req.body.notes !== undefined) meal.notes = req.body.notes;
    if (req.body.mealType) meal.mealType = req.body.mealType;
    await meal.save();
    res.json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
}

async function deleteMeal(req, res, next) {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMeal,
  getTodayMeals,
  getMealHistory,
  updateMeal,
  deleteMeal,
};
