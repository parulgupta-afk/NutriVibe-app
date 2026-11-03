/**
 * Meal logging model (Phase 2).
 * Nutrition is always calculated server-side from FoodItem data.
 */
const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
  },
  name: { type: String, required: true }, // denormalized for history
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'g' }, // g, ml, serving, piece
  grams: { type: Number }, // normalized weight used for calculation
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  isEstimated: { type: Boolean, default: false },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dependent', // or User if self
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  // Stored in user's timezone date string YYYY-MM-DD for streak calc
  localDate: {
    type: String,
    required: true,
    index: true,
  },
  items: [mealItemSchema],
  totals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  notes: String,
  source: {
    type: String,
    enum: ['manual', 'photo', 'voice', 'diet-plan'],
    default: 'manual',
  },
  photoUrl: String,
  aiConfidence: Number,
}, { timestamps: true });

mealSchema.index({ userId: 1, localDate: 1 });
mealSchema.index({ userId: 1, mealType: 1, localDate: 1 });

module.exports = mongoose.model('Meal', mealSchema);
