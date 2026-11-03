/**
 * Community product submissions (Phase 6) — never auto-trusted
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
