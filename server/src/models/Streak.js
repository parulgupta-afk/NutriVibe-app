/**
 * Server-side streak engine (Phase 3).
 * All calculations happen on the server using the user's timezone.
 */
const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  mealLogging: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastDate: String, // YYYY-MM-DD
  },
  hydration: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastDate: String,
  },
  wellness: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastDate: String,
  },
  totalActiveDays: { type: Number, default: 0 },
  achievements: [{
    id: String,
    unlockedAt: Date,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Streak', streakSchema);
