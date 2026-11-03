/**
 * VibeDiet generation service (Phase 4 scaffold)
 *
 * Architecture (must not change):
 *   User prefs → Backend validation → Gemini suggestions (optional)
 *   → Structured JSON → FoodItem lookup → Nutrition calc
 *   → Deterministic safety engine → Final plan
 *
 * Gemini must never decide safety or invent calorie numbers.
 */
const FoodItem = require('../models/FoodItem');
const DietPlan = require('../models/DietPlan');
const { calculateFromGrams, sumNutrition, roundTotals } = require('./nutritionCalculator');
const { computeSafetyVerdict } = require('./safetyEngine');

/**
 * Pure filter: drop foods whose name/aliases match allergy keywords or vegetarian preferences.
 */
function filterFoodsByPreferences(foods, preferences = {}) {
  const allergies = (preferences.allergies || []).map((a) => a.toLowerCase());
  const isVeg =
    (preferences.dietType || '').toLowerCase().includes('veg') ||
    (preferences.restrictions || []).some((r) => /veg/i.test(r));

  const allergyHints = {
    milk: ['milk', 'paneer', 'yogurt', 'curd', 'ghee', 'cheese', 'whey', 'casein'],
    peanut: ['peanut', 'groundnut'],
    soy: ['soy', 'soya'],
    gluten: ['wheat', 'roti', 'chapati', 'bread', 'oats'],
    egg: ['egg'],
  };

  return (foods || []).filter((f) => {
    const name = `${f.name} ${(f.aliases || []).join(' ')}`.toLowerCase();
    for (const a of allergies) {
      const hints = allergyHints[a] || [a];
      if (hints.some((h) => name.includes(h))) return false;
    }
    if (isVeg && /chicken|egg|fish|mutton|meat/i.test(name)) return false;
    return true;
  });
}

/**
 * Build a minimal safe daily plan from the verified FoodItem collection.
 * This is the non-AI fallback so the feature works even without Gemini.
 */
async function buildFallbackDay(preferences = {}) {
  let foods = await FoodItem.find().limit(50);
  if (foods.length === 0) {
    // No seeded foods — return empty safe structure
    return { meals: [] };
  }

  foods = filterFoodsByPreferences(foods, preferences);

  const pick = (pred) => foods.find(pred) || foods[0];

  const breakfastFood = pick((f) => /oat|yogurt|banana|egg/i.test(f.name));
  const lunchFood = pick((f) => /dal|rice|roti|paneer|chicken/i.test(f.name));
  const dinnerFood = pick((f) => /roti|dal|paneer|rice/i.test(f.name) && f !== lunchFood);
  const snackFood = pick((f) => /banana|yogurt/i.test(f.name));

  const buildMeal = (mealType, food, grams) => {
    if (!food) {
      return {
        mealType,
        mealName: 'Unavailable',
        ingredients: [],
        servingSize: `${grams}g`,
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        safety: { verdict: 'UNKNOWN', reasons: ['No matching food in database'] },
        foodItemIds: [],
      };
    }
    const nutrition = calculateFromGrams(food.per100g, grams);
    // Build a minimal product-like object for the existing safety engine
    const productLike = {
      name: food.name,
      ingredients: [food.name, ...(food.aliases || [])],
      allergens: [],
    };
    const userLike = {
      preferences: {
        allergies: preferences.allergies || [],
        dietaryRestrictions: preferences.restrictions || [],
        medications: preferences.medications || [],
      },
    };
    let verdict = 'SAFE';
    let reasons = [];
    try {
      const result = computeSafetyVerdict(productLike, userLike);
      const level = (result.level || result.safety?.level || 'Safe').toUpperCase();
      if (level.includes('UNSAFE')) verdict = 'UNSAFE';
      else if (level.includes('CAUTION') || level.includes('WARN')) verdict = 'CAUTION';
      else verdict = 'SAFE';
      reasons = (result.factors || []).map((f) => (typeof f === 'string' ? f : f.message || f.factor || JSON.stringify(f)));
    } catch {
      verdict = 'UNKNOWN';
      reasons = ['Safety check unavailable'];
    }

    return {
      mealType,
      mealName: food.name,
      ingredients: [food.name],
      servingSize: `${grams}g`,
      nutrition: roundTotals(nutrition),
      safety: { verdict, reasons },
      foodItemIds: [food._id],
    };
  };

  return {
    meals: [
      buildMeal('breakfast', breakfastFood, 40),
      buildMeal('lunch', lunchFood, 200),
      buildMeal('dinner', dinnerFood, 180),
      buildMeal('snack', snackFood, 120),
    ].filter((m) => m.safety.verdict !== 'UNSAFE'), // never show UNSAFE meals
  };
}

/**
 * Generate a 1-day or 7-day plan.
 * Currently uses the deterministic fallback; Gemini can be plugged in later
 * behind the same validation pipeline.
 */
async function generatePlan(userId, options = {}) {
  const {
    profileId,
    days = 1,
    goal,
    dietType,
    cuisine,
    preferences = {},
  } = options;

  const planDays = [];
  for (let i = 0; i < Math.min(days, 7); i += 1) {
    const day = await buildFallbackDay({
      ...preferences,
      dietType: dietType || preferences.dietType,
    });
    planDays.push({
      dayIndex: i,
      meals: day.meals,
    });
  }

  const plan = await DietPlan.create({
    userId,
    profileId,
    goal,
    dietType,
    cuisine,
    days: planDays,
    status: 'active',
    preferences,
    rulesVersion: 'v2.0-fallback',
  });

  return plan;
}

async function getActivePlan(userId) {
  return DietPlan.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
}

module.exports = {
  generatePlan,
  getActivePlan,
  buildFallbackDay,
  filterFoodsByPreferences,
};
