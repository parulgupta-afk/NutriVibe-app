/**
 * Reaction Journal (Phase 7 Option A)
 * Records symptoms vs foods — NEVER diagnoses causation.
 */
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
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
  foods: [{ type: String, trim: true }],
  productName: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
  symptoms: [{ type: String, trim: true }],
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild',
  },
  occurredAt: { type: Date, default: Date.now },
  notes: String,
}, { timestamps: true });

reactionSchema.index({ userId: 1, occurredAt: -1 });

module.exports = mongoose.model('Reaction', reactionSchema);
