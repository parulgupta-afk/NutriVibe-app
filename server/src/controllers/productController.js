const Product = require('../models/Product');
const { fetchProductFromOpenFoodFacts } = require('../services/openFoodFactsService');
const { computeSafetyVerdict } = require('../services/safetyEngine');
const { parseIngredientText } = require('../data/allergenKeywords');
const { resolveEffectiveUser } = require('../services/profileResolver');
const { explainIngredients } = require('../services/geminiExplainerService');

// Seed some demo products
const demoProducts = [
  {
    barcode: '1234567890123',
    name: 'Organic Almond Milk',
    brand: 'PureLife',
    category: 'Beverage',
    description: 'Unsweetened organic almond milk, perfect for smoothies and cereal',
    ingredients: ['Filtered Water', 'Organic Almonds', 'Sea Salt', 'Sunflower Lecithin'],
    nutritionalInfo: {
      servingSize: '240ml',
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
      fiber: 0.5,
      sugar: 0,
      sodium: 160
    },
    safetyInfo: {
      riskLevel: 'Safe',
      warnings: ['Contains tree nuts'],
      allergens: ['Tree Nuts'],
      certifications: ['Organic', 'Non-GMO', 'Vegan']
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.5,
    totalReviews: 127
  },
  {
    barcode: '9876543210987',
    name: 'Wheat Bread Whole Grain',
    brand: 'HealthyBake',
    category: 'Food',
    description: '100% whole wheat bread with sunflower and flax seeds',
    ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Salt', 'Sunflower Seeds', 'Flax Seeds'],
    nutritionalInfo: {
      servingSize: '2 slices (60g)',
      calories: 160,
      protein: 6,
      carbs: 30,
      fat: 2,
      fiber: 4,
      sugar: 2,
      sodium: 200
    },
    safetyInfo: {
      riskLevel: 'Caution',
      warnings: ['Contains gluten', 'May contain traces of sesame', 'Shared facility with nuts'],
      allergens: ['Gluten', 'Sesame'],
      certifications: ['Whole Grain', 'Non-GMO']
    },
    processingLevel: 'Processed Culinary Ingredient',
    isVerified: true,
    averageRating: 4.2,
    totalReviews: 89
  },
  {
    barcode: '4567890123456',
    name: 'Premium Greek Yogurt',
    brand: 'DairyFresh',
    category: 'Food',
    description: 'Plain Greek yogurt, high protein, perfect for breakfast',
    ingredients: ['Cultured Pasteurized Skim Milk', 'Milk Protein Concentrate', 'Live Active Cultures'],
    nutritionalInfo: {
      servingSize: '170g',
      calories: 120,
      protein: 18,
      carbs: 5,
      fat: 1,
      fiber: 0,
      sugar: 3,
      sodium: 75
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains dairy'],
      allergens: ['Dairy'],
      certifications: ['High Protein', 'Gluten-Free']
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 234
  },
  {
    barcode: '1111111111111',
    name: 'Classic Peanut Butter',
    brand: 'NuttyGood',
    category: 'Food',
    description: 'Creamy peanut butter made with roasted peanuts',
    ingredients: ['Roasted Peanuts', 'Salt'],
    nutritionalInfo: {
      servingSize: '2 tbsp (32g)',
      calories: 190,
      protein: 7,
      carbs: 6,
      fat: 16,
      fiber: 2,
      sugar: 1,
      sodium: 140
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains peanuts'],
      allergens: ['Peanuts'],
      certifications: ['Non-GMO', 'Gluten-Free']
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.6,
    totalReviews: 312
  },
  {
    barcode: '2222222222222',
    name: 'Soy Milk Original',
    brand: 'GreenHarvest',
    category: 'Beverage',
    description: 'Fortified soy milk, rich in calcium and vitamin D',
    ingredients: ['Filtered Water', 'Organic Soybeans', 'Cane Sugar', 'Sea Salt', 'Calcium Carbonate', 'Vitamin D2'],
    nutritionalInfo: {
      servingSize: '240ml',
      calories: 80,
      protein: 7,
      carbs: 4,
      fat: 4,
      fiber: 1,
      sugar: 4,
      sodium: 90
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains soy'],
      allergens: ['Soy'],
      certifications: ['Organic', 'Non-GMO', 'Vegan']
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.3,
    totalReviews: 156
  },
  {
    barcode: '3333333333333',
    name: 'Gluten-Free Oatmeal',
    brand: 'PureOats',
    category: 'Food',
    description: 'Rolled oats, certified gluten-free',
    ingredients: ['Gluten-Free Rolled Oats'],
    nutritionalInfo: {
      servingSize: '1/2 cup (40g)',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      fiber: 4,
      sugar: 1,
      sodium: 0
    },
    safetyInfo: {
      riskLevel: 'Safe',
      warnings: ['May contain traces of gluten from processing'],
      allergens: ['None'],
      certifications: ['Gluten-Free', 'Non-GMO', 'Vegan']
    },
    processingLevel: 'Unprocessed',
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 198
  }
];

// Seed products on startup
const seedProducts = async () => {
  try {
    // Use updateOne with upsert instead of findOneAndUpdate
    for (const product of demoProducts) {
      await Product.updateOne(
        { barcode: product.barcode },
        { $set: product },
        { upsert: true }
      );
    }
    console.log('✅ Demo products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error.message);
  }
};

// Call seed on module load (but wait for connection)
setTimeout(() => {
  seedProducts();
}, 2000);

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    let product = await Product.findOne({ barcode });

    // Not in our DB yet — try Open Food Facts before giving up
    if (!product) {
      const offResult = await fetchProductFromOpenFoodFacts(barcode);

      if (!offResult.ok) {
        const messages = {
          not_found:
            'Product not found in our database or Open Food Facts. Try scanning the ingredient label instead, or check the barcode.',
          timeout:
            'Open Food Facts took too long to respond. Please try again in a moment.',
          upstream:
            'Open Food Facts is temporarily unavailable. Please try again shortly.',
          network:
            'Could not reach Open Food Facts. Check your internet connection and try again.'
        };
        const status = offResult.reason === 'not_found' ? 404 : 503;
        return res.status(status).json({
          success: false,
          reason: offResult.reason,
          message: messages[offResult.reason] || messages.not_found
        });
      }

      // Cache it so future scans of this barcode are instant and don't
      // depend on Open Food Facts being reachable
      try {
        product = await Product.create({ ...offResult.product, imageCheckedAt: new Date() });
      } catch (createError) {
        // Race condition: another request cached it a moment ago
        if (createError.code === 11000) {
          product = await Product.findOne({ barcode });
        } else {
          throw createError;
        }
      }
    } else if (
      product.images.length === 0 &&
      product.dataSource !== 'OCR Scan' &&
      (!product.imageCheckedAt || Date.now() - product.imageCheckedAt.getTime() > 7 * 24 * 60 * 60 * 1000)
    ) {
      // Self-healing image recovery from Open Food Facts
      const offResult = await fetchProductFromOpenFoodFacts(barcode);
      product.imageCheckedAt = new Date();
      if (offResult.ok && offResult.product?.images?.length > 0) {
        product.images = offResult.product.images;
      }
      await product.save();
    }

    // Generate safety report for whichever profile this scan is for —
    // the account owner themself, or a dependent they've selected
    const { effectiveUser, profileId, profileName } = await resolveEffectiveUser(req);
    const safetyReport = generateSafetyReport(product, effectiveUser);

    res.status(200).json({
      success: true,
      data: product,
      safetyReport,
      profile: profileId ? { id: profileId, name: profileName } : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product from a scanned/OCR'd label when no barcode
//          is available (or the barcode wasn't found anywhere)
// @route   POST /api/products/scan-label
// @access  Private
exports.scanLabel = async (req, res, next) => {
  try {
    const { rawText, productName } = req.body;

    if (!rawText || rawText.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'No readable ingredient text was provided. Try retaking the photo with better lighting.'
      });
    }

    const { ingredients, detectedAllergens } = parseIngredientText(rawText);

    if (ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not find any ingredients in that text. Try retaking the photo.'
      });
    }

    // Synthetic barcode so this fits the existing Product schema (which
    // requires a unique barcode) and can be viewed/logged/deleted exactly
    // like a normal scanned product via the same /product/:barcode route.
    const syntheticBarcode = `label-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const product = await Product.create({
      barcode: syntheticBarcode,
      name: productName?.trim() || 'Scanned Label',
      brand: 'Unknown (scanned label)',
      category: 'Food',
      description: 'Added from a photographed ingredient label',
      ingredients,
      safetyInfo: {
        riskLevel: detectedAllergens.length > 0 ? 'Caution' : 'Unknown',
        warnings: detectedAllergens.length > 0
          ? [`Contains: ${detectedAllergens.join(', ')}`]
          : [],
        allergens: detectedAllergens,
        certifications: []
      },
      images: [],
      processingLevel: 'Unknown',
      isVerified: false,
      dataSource: 'OCR Scan'
    });

    const { effectiveUser, profileId, profileName } = await resolveEffectiveUser(req);
    const safetyReport = generateSafetyReport(product, effectiveUser);

    res.status(201).json({
      success: true,
      data: product,
      safetyReport,
      profile: profileId ? { id: profileId, name: profileName } : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Force-refresh a product's image from Open Food Facts,
//          bypassing the 7-day self-heal throttle. Always reports back
//          whether a photo was actually found, so it's clear when a
//          product (like a fictional demo barcode) genuinely has none.
// @route   POST /api/products/:id/refresh-image
// @access  Private
exports.refreshImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.dataSource === 'OCR Scan') {
      return res.status(400).json({
        success: false,
        message: 'Scanned-label products have no external source to fetch a photo from.'
      });
    }

    const offResult = await fetchProductFromOpenFoodFacts(product.barcode);
    product.imageCheckedAt = new Date();

    if (offResult.ok && offResult.product?.images?.length > 0) {
      product.images = offResult.product.images;
      await product.save();
      return res.status(200).json({
        success: true,
        found: true,
        images: product.images,
        message: 'Found a photo on Open Food Facts.'
      });
    }

    await product.save();
    return res.status(200).json({
      success: true,
      found: false,
      message: 'Open Food Facts has no photo on record for this barcode. This is common for fictional/demo barcodes, or real products that simply haven\'t had a photo uploaded there yet.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product details
// @route   GET /api/products/:id
// @access  Private
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product alternatives — personalized safe swaps for THIS user
// @route   GET /api/products/:id/alternatives
// @access  Private
exports.getAlternatives = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Pull a decent-sized pool of same-category candidates. We can't
    // filter by riskLevel in the DB query anymore because that field is
    // a generic baseline, not personalized — we need to compute each
    // candidate's verdict against THIS user before we know if it's
    // actually safe for them.
    const candidates = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(25);

    const { effectiveUser } = await resolveEffectiveUser(req);

    const processingRank = {
      Unprocessed: 4,
      'Processed Culinary Ingredient': 3,
      Processed: 2,
      'Ultra-Processed': 1,
      Unknown: 0
    };

    const evaluated = candidates.map((candidate) => {
      const verdict = computeSafetyVerdict(candidate, effectiveUser);
      const levelBoost = verdict.level === 'Safe' ? 100 : verdict.level === 'Caution' ? 40 : 0;
      const processBoost = (processingRank[candidate.processingLevel] || 0) * 5;
      const brandBoost = candidate.brand && product.brand && candidate.brand === product.brand ? 3 : 0;
      const rankScore = (verdict.score || 0) + levelBoost + processBoost + brandBoost;

      let swapReason;
      if (verdict.level === 'Safe' && verdict.factors.length === 0) {
        swapReason = 'No allergen or medication conflicts for your profile';
      } else if (verdict.level === 'Safe') {
        swapReason = verdict.recommendations[0] || 'Safer match for your profile';
      } else {
        swapReason = verdict.recommendations[0] || 'Lower risk than the current product for your profile';
      }

      return {
        ...candidate.toObject(),
        safetyLevel: verdict.level,
        safetyScore: verdict.score,
        rankScore,
        barcode: candidate.barcode,
        swapReason
      };
    });

    // Prefer Safe over Caution; never suggest Unsafe. Rank by composite score.
    const safeSwaps = evaluated
      .filter((c) => c.safetyLevel === 'Safe' || c.safetyLevel === 'Caution')
      .sort((a, b) => {
        if (a.safetyLevel !== b.safetyLevel) {
          return a.safetyLevel === 'Safe' ? -1 : 1;
        }
        return b.rankScore - a.rankScore;
      })
      .slice(0, 5);

    res.status(200).json({
      success: true,
      alternatives: safeSwaps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get an AI-generated, plain-English explanation of a
//          product's ingredients, personalized to the active profile
// @route   GET /api/products/:id/explain
// @access  Private
exports.explainProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { effectiveUser, profileName } = await resolveEffectiveUser(req);
    const result = await explainIngredients(product, effectiveUser);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      explanation: result.explanation,
      cached: result.cached || false,
      profileName: profileName || 'you'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Private
exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const products = await Product.find({
      $text: { $search: query }
    }).limit(10);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate safety report based on user preferences
function generateSafetyReport(product, user) {
  const verdict = computeSafetyVerdict(product, user);

  return {
    product: product._id,
    user: user._id,
    riskAssessment: {
      level: verdict.level,
      score: verdict.score,
      factors: verdict.factors
    },
    recommendations: verdict.recommendations,
    reviewedAt: new Date()
  };
}