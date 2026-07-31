const mongoose = require('mongoose');

// A "Dependent" is a person the account owner scans/tracks food for —
// e.g. a parent managing a child's allergies, or someone managing a
// family member's diet. It reuses the exact same preferences shape as
// User so it can be dropped straight into computeSafetyVerdict.
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