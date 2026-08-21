/**
 * Product domain service (Engineering Phase 4).
 * Controllers should call these helpers instead of embedding algorithms.
 * Behavior matches the previous productController implementation.
 */
const { computeSafetyVerdict } = require('./safetyEngine');
const { rankRecommendations } = require('./recommendationService');
const { cacheGet, cacheSet } = require('../config/redis');

function getProductModel() {
  return require('../models/Product');
}

function getOffService() {
  return require('./openFoodFactsService');
}

const OFF_ERROR_MESSAGES = {
  not_found:
    'Product not found in our database or Open Food Facts. Try scanning the ingredient label instead, or check the barcode.',
  timeout: 'Open Food Facts took too long to respond. Please try again in a moment.',
  upstream: 'Open Food Facts is temporarily unavailable. Please try again shortly.',
  network: 'Could not reach Open Food Facts. Check your internet connection and try again.'
};

const PROCESSING_RANK = {
  Unprocessed: 4,
  'Processed Culinary Ingredient': 3,
  Processed: 2,
  'Ultra-Processed': 1,
  Unknown: 0
};

/**
 * Build the safety report object returned to the client (same shape as before).
 */
function generateSafetyReport(product, user) {
  const verdict = computeSafetyVerdict(product, user);

  return {
    product: product._id,
    user: user._id,
    // Existing shape (frontend)
    riskAssessment: {
      level: verdict.level,
      score: verdict.score,
      factors: verdict.factors
    },
    recommendations: verdict.recommendations,
    reviewedAt: new Date(),
    // Phase 8 additive fields — safe for old clients to ignore
    safety: verdict.safety || {
      level: verdict.level,
      score: verdict.score,
      factors: verdict.factors
    },
    nutrition: verdict.nutrition || null,
    processing: verdict.processing || {
      level: product.processingLevel || 'Unknown'
    }
  };
}

/**
 * Map OFF failure reason → HTTP status + message (unchanged copy).
 */
function mapOffFailure(reason) {
  return {
    status: reason === 'not_found' ? 404 : 503,
    reason,
    message: OFF_ERROR_MESSAGES[reason] || OFF_ERROR_MESSAGES.not_found
  };
}

/**
 * Load product by barcode from Mongo, or fetch+cache from Open Food Facts.
 * Optionally refreshes missing images (same rules as before).
 *
 * @returns {{ ok: true, product } | { ok: false, status, reason, message }}
 */
async function findOrFetchByBarcode(barcode) {
  // Phase 11: optional Redis hot cache (barcode → lean product JSON)
  const cacheKey = `product:barcode:${barcode}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached && cached._id) {
      // Re-hydrate as mongoose doc for downstream code
      const Product = getProductModel();
      const existing = await Product.findById(cached._id);
      if (existing) return { ok: true, product: existing, cache: 'hit' };
    }
  } catch {
    // ignore cache errors
  }

  let product = await getProductModel().findOne({ barcode });

  if (!product) {
    const { fetchProductFromOpenFoodFacts } = getOffService();
    const offResult = await fetchProductFromOpenFoodFacts(barcode);

    if (!offResult.ok) {
      return { ok: false, ...mapOffFailure(offResult.reason) };
    }

    try {
      product = await getProductModel().create({
        ...offResult.product,
        imageCheckedAt: new Date()
      });
    } catch (createError) {
      if (createError.code === 11000) {
        product = await getProductModel().findOne({ barcode });
      } else {
        throw createError;
      }
    }
  } else if (
    product.images.length === 0 &&
    product.dataSource !== 'OCR Scan' &&
    (!product.imageCheckedAt ||
      Date.now() - product.imageCheckedAt.getTime() > 7 * 24 * 60 * 60 * 1000)
  ) {
    const { fetchProductFromOpenFoodFacts } = getOffService();
    const offResult = await fetchProductFromOpenFoodFacts(barcode);
    product.imageCheckedAt = new Date();
    if (offResult.ok && offResult.product?.images?.length > 0) {
      product.images = offResult.product.images;
    }
    await product.save();
  }

  try {
    await cacheSet(cacheKey, {
      _id: product._id.toString(),
      barcode: product.barcode
    }, 3600);
  } catch {
    // ignore
  }

  return { ok: true, product };

}

/**
 * Rank alternative products for a user (pure ranking over an in-memory list).
 * Exported for unit tests — same scoring as previous controller.
 */
function rankAlternatives(product, candidates, user, limit = 5) {
  return rankRecommendations(product, candidates, user, limit);
}

async function getAlternativesForProduct(productId, user) {
  const product = await getProductModel().findById(productId);
  if (!product) {
    return { ok: false, status: 404, message: 'Product not found' };
  }

  const candidates = await getProductModel().find({
    category: product.category,
    _id: { $ne: product._id }
  }).limit(25);

  const alternatives = rankAlternatives(product, candidates, user);
  return { ok: true, alternatives };
}

/**
 * Text search (same query as before).
 */
async function searchByText(query, limit = 10) {
  return getProductModel().find({ $text: { $search: query } }).limit(limit);
}

module.exports = {
  generateSafetyReport,
  mapOffFailure,
  findOrFetchByBarcode,
  rankAlternatives,
  getAlternativesForProduct,
  searchByText,
  OFF_ERROR_MESSAGES,
  PROCESSING_RANK
};
