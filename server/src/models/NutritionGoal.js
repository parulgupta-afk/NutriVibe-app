/**
 * Configurable nutrition & hydration goals (Phase 2/3).
 */
const mongoose = require('mongoose');

const nutritionGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  calories: { type: Number, default: 2000 },
  protein: { type: Number, default: 50 },   // g
  carbs: { type: Number, default: 250 },    // g
  fat: { type: Number, default: 65 },       // g
  fiber: { type: Number, default: 25 },     // g
  waterMl: { type: Number, default: 2000 },
  // Timezone for streak & daily boundary calculations
  timezone: { type: String, default: 'Asia/Kolkata' },
}, { timestamps: true });

module.exports = mongoose.model('NutritionGoal', nutritionGoalSchema);
