/**
 * Public safety check API (Phase 7 Option C) — for external apps / MCP
 * POST /v1/check  with X-API-Key header
 */
const ApiKey = require('../models/ApiKey');
const { computeSafetyVerdict } = require('../services/safetyEngine');

const MAX_KEYS_PER_USER = 10;
const MAX_RATE_PER_HOUR = 1000;
const HOUR_MS = 60 * 60 * 1000;
const LIMITS = { ingredients: 200, list: 50, item: 200 };

async function createKey(req, res, next) {
  try {
    const name = req.body?.name === undefined ? 'default' : req.body.name;
    if (typeof name !== 'string' || !name.trim() || name.length > 60) {
      return res.status(400).json({ success: false, message: 'name must be a non-empty string up to 60 characters' });
    }
    let rate = req.body?.rateLimitPerHour;
    if (rate === undefined) rate = 100;
    if (!Number.isInteger(rate) || rate < 1 || rate > MAX_RATE_PER_HOUR) {
      return res.status(400).json({ success: false, message: `rateLimitPerHour must be an integer between 1 and ${MAX_RATE_PER_HOUR}` });
    }
    const active = await ApiKey.countDocuments({ ownerId: req.user._id, active: true });
    if (active >= MAX_KEYS_PER_USER) {
      return res.status(409).json({ success: false, message: `Active key limit (${MAX_KEYS_PER_USER}) reached. Revoke a key first.` });
    }

    const raw = ApiKey.generateRawKey();
    const doc = await ApiKey.create({
      name: name.trim(),
      keyHash: ApiKey.hashKey(raw),
      keyPrefix: raw.slice(0, 11),
      ownerId: req.user._id,
      rateLimitPerHour: rate,
    });
    // Raw key shown ONCE
    res.status(201).json({
      success: true,
      data: {
        id: doc._id,
        name: doc.name,
        keyPrefix: doc.keyPrefix,
        rateLimitPerHour: doc.rateLimitPerHour,
        apiKey: raw,
        warning: 'Store this key securely. It will not be shown again.',
      },
    });
  } catch (err) {
    next(err);
  }
}

// List the caller's own keys (never returns hashes or raw keys).
async function listKeys(req, res, next) {
  try {
    const keys = await ApiKey.find({ ownerId: req.user._id })
      .select('name keyPrefix rateLimitPerHour usageCount lastUsedAt active revokedAt createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: keys });
  } catch (err) {
    next(err);
  }
}

// Revoke one of the caller's own keys. Other users' ids look identical to missing ones.
async function revokeKey(req, res, next) {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Key not found' });
    }
    const doc = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      { active: false, revokedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Key not found' });
    res.json({ success: true, message: 'Key revoked' });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate via X-API-Key header ONLY (query-string keys leak into logs,
 * proxies and browser history). Enforces the key's own hourly quota atomically.
 * @param {object} req Express request containing headers
 * @param {object} res Express response object
 * @param {Function} next Express next middleware callback
 */
async function authenticateApiKey(req, res, next) {
  try {
    const raw = req.headers['x-api-key'];
    if (!raw || typeof raw !== 'string') {
      return res.status(401).json({ error: 'Missing X-API-Key' });
    }
    const keyHash = ApiKey.hashKey(raw);
    const now = new Date();
    const windowFloor = new Date(now.getTime() - HOUR_MS);

    // 1) Inside the current window and under quota: atomic increment.
    let doc = await ApiKey.findOneAndUpdate(
      {
        keyHash,
        active: true,
        windowStart: { $gt: windowFloor },
        $expr: { $lt: ['$windowCount', '$rateLimitPerHour'] },
      },
      { $inc: { windowCount: 1, usageCount: 1 }, $set: { lastUsedAt: now } },
      { new: true }
    );

    // 2) Window expired or never started: open a new window.
    if (!doc) {
      doc = await ApiKey.findOneAndUpdate(
        {
          keyHash,
          active: true,
          $or: [{ windowStart: { $exists: false } }, { windowStart: null }, { windowStart: { $lte: windowFloor } }],
        },
        { $set: { windowStart: now, windowCount: 1, lastUsedAt: now }, $inc: { usageCount: 1 } },
        { new: true }
      );
    }

    if (!doc) {
      const exists = await ApiKey.exists({ keyHash, active: true });
      if (!exists) return res.status(401).json({ error: 'Invalid API key' });
      res.set('Retry-After', '3600');
      return res.status(429).json({ error: 'API key hourly quota exceeded' });
    }
    req.apiKey = doc;
    next();
  } catch (err) {
    next(err);
  }
}

function validStringList(v, max = LIMITS.list) {
  return (
    Array.isArray(v) &&
    v.length <= max &&
    v.every((x) => typeof x === 'string' && x.length > 0 && x.length <= LIMITS.item)
  );
}

/**
 * Body: { ingredients: string[], allergies?: string[], medications?: string[], dietaryRestrictions?: string[] }
 */
async function checkFood(req, res, next) {
  try {
    const { ingredients = [], allergies = [], medications = [], dietaryRestrictions = [], productName } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients array required' });
    }
    if (!validStringList(ingredients, LIMITS.ingredients)) {
      return res.status(400).json({ error: `ingredients must be up to ${LIMITS.ingredients} non-empty strings (max ${LIMITS.item} chars each)` });
    }
    for (const [k, v] of Object.entries({ allergies, medications, dietaryRestrictions })) {
      if (!validStringList(v)) {
        return res.status(400).json({ error: `${k} must be an array of up to ${LIMITS.list} strings (max ${LIMITS.item} chars each)` });
      }
    }
    if (productName !== undefined && (typeof productName !== 'string' || productName.length > 120)) {
      return res.status(400).json({ error: 'productName must be a string up to 120 characters' });
    }

    const productLike = {
      name: productName || 'external-check',
      ingredients,
      allergens: [],
    };
    const userLike = {
      preferences: {
        allergies,
        medications,
        dietaryRestrictions,
      },
    };

    const verdict = computeSafetyVerdict(productLike, userLike);

    res.json({
      success: true,
      data: {
        level: verdict.level,
        score: verdict.score,
        factors: verdict.factors,
        recommendations: verdict.recommendations,
        safety: verdict.safety,
      },
      disclaimer: 'Not medical advice. Deterministic rules only. Verify with a clinician for medication decisions.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createKey, listKeys, revokeKey, authenticateApiKey, checkFood };
