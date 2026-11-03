/**
 * External API keys for public safety endpoint / MCP (Phase 7 Option C)
 * Store only hashes.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  keyHash: { type: String, required: true, unique: true },
  keyPrefix: { type: String, required: true }, // first 8 chars for display
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rateLimitPerHour: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true });

apiKeySchema.statics.hashKey = function (raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

apiKeySchema.statics.generateRawKey = function () {
  return `nv_${crypto.randomBytes(24).toString('hex')}`;
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
