const mongoose = require('mongoose');

/**
 * Dependent family member profile schema for managing family-specific allergies and diets.
 */
const dependentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  relationship: {
    type: String,
    trim: true,
    maxlength: [30, 'Relationship cannot be more than 30 characters'],
    default: ''
  },
  preferences: {
    dietaryRestrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    healthGoals: { type: [String], default: [] },
    medications: { type: [String], default: [] }
  }
}, { timestamps: true });

dependentSchema.index({ owner: 1, createdAt: 1 });

module.exports = mongoose.model('Dependent', dependentSchema);