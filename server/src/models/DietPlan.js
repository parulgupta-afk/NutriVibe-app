/**
 * VibeDiet plan storage (Phase 4 scaffold)
 * Every meal MUST pass the deterministic safety engine before display.
 */
const mongoose = require('mongoose');

const planMealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  mealName: { type: String, required: true },
  ingredients: [String],
  servingSize: String,
  estimatedCost: Number,
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  // Safety assessment from deterministic engine
  safety: {
    verdict: {
      type: String,
      enum: ['SAFE', 'CAUTION', 'UNSAFE', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    reasons: [String],
  },
  foodItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
}, { _id: true });

const daySchema = new mongoose.Schema({
  dayIndex: { type: Number, required: true }, // 0–6
  date: String, // optional YYYY-MM-DD
  meals: [planMealSchema],
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dependent',
  },
  goal: String, // weight management, muscle, etc.
  dietType: String, // vegetarian, vegan, ...
  cuisine: String,
  days: [daySchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },
  // Preferences snapshot used for generation
  preferences: {
    allergies: [String],
    restrictions: [String],
    likes: [String],
    dislikes: [String],
    mealsPerDay: { type: Number, default: 3 },
    budget: Number,
  },
  rulesVersion: String,
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
