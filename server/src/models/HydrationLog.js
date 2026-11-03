/**
 * Hydration tracking (Phase 3).
 */
const mongoose = require('mongoose');

const hydrationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amountMl: {
    type: Number,
    required: true,
    min: 1,
    max: 5000,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
  localDate: {
    type: String, // YYYY-MM-DD in user timezone
    required: true,
    index: true,
  },
  source: {
    type: String,
    enum: ['quick', 'custom', 'reminder'],
    default: 'quick',
  },
}, { timestamps: true });

hydrationLogSchema.index({ userId: 1, localDate: 1 });

module.exports = mongoose.model('HydrationLog', hydrationLogSchema);
