/**
 * Community product submissions schema (Phase 6).
 * Submissions remain pending review and are never automatically trusted in safety checks.
 */
const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barcode: String,
  name: { type: String, required: true, trim: true },
  brand: String,
  ingredients: [String],
  imageUrl: String,
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  reviewedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('ProductSubmission', productSubmissionSchema);
