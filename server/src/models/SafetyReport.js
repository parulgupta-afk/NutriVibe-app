const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['Safe', 'Caution', 'Unsafe', 'Unknown'],
      required: true,
      default: 'Unknown'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    factors: [{
      name: {
        type: String,
        required: true
      },
      impact: {
        type: String,
        required: true
      },
      severity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      }
    }]
  },
  healthImpacts: [{
    condition: {
      type: String,
      required: true
    },
    likelihood: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      default: 'Mild'
    }
  }],
  recommendations: [{
    type: String,
    trim: true
  }],
  userFeedback: {
    helpful: {
      type: Boolean
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [200, 'Comment cannot exceed 200 characters']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'updated'],
    default: 'pending'
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique user-product reports
safetyReportSchema.index({ product: 1, user: 1 }, { unique: true });

// Pre-save middleware
safetyReportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'reviewed') {
    this.reviewedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('SafetyReport', safetyReportSchema);