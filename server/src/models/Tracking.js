const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  action: {
    type: String,
    enum: ['scan', 'view', 'save', 'compare', 'alternative', 'log'],
    required: true,
    default: 'view'
  },
  metrics: {
    duration: {
      type: Number,
      default: 0
    },
    interactions: {
      type: Number,
      default: 1
    }
  },
  // Which profile (account owner or a dependent) this log was for.
  // Null means it was for the account owner themself.
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dependent',
    default: null
  },
  // Snapshot of the profile's name at log time, so history stays
  // meaningful even if the dependent profile is later renamed/deleted.
  profileName: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Snapshot of the personalized risk verdict at the moment this was
  // logged, so history reflects what the user actually saw — not
  // today's product data or today's user preferences, which may
  // have since changed.
  riskLevel: {
    type: String,
    enum: ['Safe', 'Caution', 'Unsafe', 'Unknown'],
    default: 'Unknown'
  },
  context: {
    device: String,
    browser: String,
    location: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [200, 'Comment cannot exceed 200 characters']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
trackingSchema.index({ user: 1, createdAt: -1 });
trackingSchema.index({ product: 1, createdAt: -1 });
trackingSchema.index({ user: 1, product: 1 });

module.exports = mongoose.model('Tracking', trackingSchema);