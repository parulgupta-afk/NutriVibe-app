/**
 * Verified food composition data (Phase 2).
 * Gemini must NEVER invent nutritional values — all calculations
 * come from this collection or Open Food Facts when available.
 */
const mongoose = require('mongoose');

const nutrientSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }, // mg
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  aliases: [{ type: String, trim: true }],
  region: {
    type: String,
    enum: ['India', 'Global', 'US', 'Other'],
    default: 'Global',
  },
  category: {
    type: String,
    enum: ['dairy', 'grain', 'protein', 'vegetable', 'fruit', 'snack', 'beverage', 'other'],
    default: 'other',
  },
  // Nutrition per 100g (or per 100ml for liquids)
  per100g: {
    type: nutrientSchema,
    required: true,
  },
  // Common serving sizes
  servings: [{
    label: String,        // e.g. "1 cup", "1 medium", "100g"
    grams: Number,        // weight in grams
  }],
  source: {
    type: String,
    default: 'verified-internal',
  },
  sourceUrl: String,
  isCustom: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [String],
}, { timestamps: true });

// Text search index
foodItemSchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
