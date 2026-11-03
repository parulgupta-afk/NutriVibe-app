/**
 * Food recall records (Phase 7 Option B)
 * Alerts only on conservative matches (barcode or exact product+brand).
 */
const mongoose = require('mongoose');

const recallSchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g. FSSAI, FDA
  sourceUrl: String,
  title: { type: String, required: true },
  productName: { type: String, required: true, index: true },
  brand: String,
  barcode: { type: String, index: true },
  batchOrLot: String,
  reason: String,
  publishedAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Recall', recallSchema);
