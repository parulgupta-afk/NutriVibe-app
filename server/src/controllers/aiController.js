const { chat } = require('../services/vibeAIService');
const Meal = require('../models/Meal');
const FoodItem = require('../models/FoodItem');
const { calculateFromGrams, sumNutrition, roundTotals } = require('../services/nutritionCalculator');
const { updateMealStreak } = require('../services/streakService');

async function chatHandler(req, res, next) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'message is required' });
    }
    const result = await chat(req.user._id, req.user, message.trim(), history || []);
    if (!result.success) {
      return res.status(502).json({ success: false, message: result.error });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * AI meal photo / voice logging — Phase 5
 * Accepts suggested items from client (after Gemini Vision or speech-to-text).
 * Server recalculates nutrition from FoodItem DB; user must confirm.
 */
async function confirmAIMeal(req, res, next) {
  try {
    const userId = req.user._id;
    const { mealType = 'snack', items = [], source = 'photo', notes, localDate } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items required' });
    }

    const processed = [];
    for (const item of items) {
      let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      let grams = item.grams || item.quantity || 100;
      let name = item.name || 'Unknown food';
      let foodItemId;
      let isEstimated = true;

      if (item.foodItemId) {
        const food = await FoodItem.findById(item.foodItemId);
        if (food) {
          name = food.name;
          foodItemId = food._id;
          nutrition = calculateFromGrams(food.per100g, grams);
          isEstimated = false;
        }
      } else if (item.name) {
        const food = await FoodItem.findOne({
          $or: [
            { name: new RegExp(`^${item.name}$`, 'i') },
            { aliases: new RegExp(`^${item.name}$`, 'i') },
          ],
        });
        if (food) {
          name = food.name;
          foodItemId = food._id;
          nutrition = calculateFromGrams(food.per100g, grams);
          isEstimated = false;
        } else if (item.nutrition) {
          nutrition = item.nutrition;
          isEstimated = true;
        }
      }

      processed.push({
        foodItemId,
        name,
        quantity: item.quantity || grams,
        unit: item.unit || 'g',
        grams,
        nutrition,
        isEstimated,
      });
    }

    const totals = roundTotals(sumNutrition(processed));
    const dateStr = localDate || new Date().toISOString().slice(0, 10);

    const meal = await Meal.create({
      userId,
      mealType,
      date: new Date(),
      localDate: dateStr,
      items: processed,
      totals,
      notes,
      source: source === 'voice' ? 'voice' : 'photo',
      aiConfidence: req.body.confidence,
    });

    updateMealStreak(userId, dateStr).catch(console.error);

    res.status(201).json({
      success: true,
      data: meal,
      message: 'Meal saved after user confirmation. Nutrition from database where matched.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Suggest foods from a free-text description (voice transcript).
 * Does NOT save — client shows editable list for confirmation.
 */
async function suggestFromText(req, res, next) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text required' });

    // Simple heuristic parse: split on "and", commas; look up FoodItem
    const parts = text
      .toLowerCase()
      .replace(/i (had|ate|drank)/g, '')
      .split(/,| and | with | plus /i)
      .map((p) => p.trim())
      .filter(Boolean);

    const suggestions = [];
    for (const part of parts.slice(0, 8)) {
      const qtyMatch = part.match(/(\d+)\s*(g|ml|cup|piece|roti|paratha|glass)?/);
      let grams = 100;
      if (qtyMatch) {
        const n = parseInt(qtyMatch[1], 10);
        const unit = qtyMatch[2] || 'g';
        if (unit === 'cup' || unit === 'glass') grams = n * 200;
        else if (unit === 'roti' || unit === 'paratha' || unit === 'piece') grams = n * 40;
        else grams = n;
      }

      const searchTerm = part.replace(/\d+\s*(g|ml|cup|piece|roti|paratha|glass)?/g, '').trim();
      const food = await FoodItem.findOne({
        $or: [
          { name: new RegExp(searchTerm.slice(0, 20), 'i') },
          { aliases: new RegExp(searchTerm.slice(0, 20), 'i') },
        ],
      });

      if (food) {
        suggestions.push({
          foodItemId: food._id,
          name: food.name,
          grams,
          quantity: grams,
          unit: 'g',
          nutrition: {
            calories: Math.round((food.per100g.calories * grams) / 100),
            protein: Math.round((food.per100g.protein * grams) / 10) / 10,
            carbs: Math.round((food.per100g.carbs * grams) / 10) / 10,
            fat: Math.round((food.per100g.fat * grams) / 10) / 10,
            fiber: Math.round((food.per100g.fiber * grams) / 10) / 10,
          },
          confidence: 0.7,
          isEstimated: false,
        });
      } else if (searchTerm.length > 2) {
        suggestions.push({
          name: searchTerm,
          grams,
          quantity: grams,
          unit: 'g',
          nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
          confidence: 0.3,
          isEstimated: true,
        });
      }
    }

    res.json({
      success: true,
      data: { suggestions, originalText: text },
      message: 'Review and confirm before saving. Values from FoodItem DB when matched.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  chatHandler,
  confirmAIMeal,
  suggestFromText,
};
