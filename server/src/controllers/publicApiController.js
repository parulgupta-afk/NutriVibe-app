/**
 * Public safety check API (Phase 7 Option C) — for external apps / MCP
 * POST /v1/check  with X-API-Key header
 */
const ApiKey = require('../models/ApiKey');
const { computeSafetyVerdict } = require('../services/safetyEngine');

async function createKey(req, res, next) {
  try {
    const raw = ApiKey.generateRawKey();
    const keyHash = ApiKey.hashKey(raw);
    const doc = await ApiKey.create({
      name: req.body.name || 'default',
      keyHash,
      keyPrefix: raw.slice(0, 11),
      ownerId: req.user._id,
      rateLimitPerHour: req.body.rateLimitPerHour || 100,
    });
    // Raw key shown ONCE
    res.status(201).json({
      success: true,
      data: {
        id: doc._id,
        name: doc.name,
        keyPrefix: doc.keyPrefix,
        apiKey: raw,
        warning: 'Store this key securely. It will not be shown again.',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function authenticateApiKey(req, res, next) {
  try {
    const raw = req.headers['x-api-key'] || req.query.api_key;
    if (!raw) {
      return res.status(401).json({ error: 'Missing X-API-Key' });
    }
    const keyHash = ApiKey.hashKey(raw);
    const doc = await ApiKey.findOne({ keyHash, active: true });
    if (!doc) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    doc.usageCount += 1;
    doc.lastUsedAt = new Date();
    await doc.save();
    req.apiKey = doc;
    next();
  } catch (err) {
    next(err);
  }
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

module.exports = { createKey, authenticateApiKey, checkFood };
