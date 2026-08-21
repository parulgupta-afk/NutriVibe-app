const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
  {
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
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dependent',
      default: null
    },
    profileName: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
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
  },
  {
    timestamps: true
  }
);

// Query patterns: daily/history by user, product history, profile-scoped history
trackingSchema.index({ user: 1, createdAt: -1 });
trackingSchema.index({ product: 1, createdAt: -1 });
trackingSchema.index({ user: 1, product: 1 });
// Phase 9: filter logs by dependent profile
trackingSchema.index({ user: 1, profile: 1, createdAt: -1 });

module.exports = mongoose.model('Tracking', trackingSchema);
