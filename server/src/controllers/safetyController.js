const SafetyReport = require('../models/SafetyReport');
const Product = require('../models/Product');
const { computeSafetyVerdict } = require('../services/safetyEngine');
const { resolveEffectiveUser } = require('../services/profileResolver');

// @desc    Get safety report for a product
// @route   GET /api/safety/product/:productId
// @access  Private
exports.getSafetyReport = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Resolve profile (rejects unknown or foreign profileId with 404)
    const { effectiveUser, profileId, profileName } = await resolveEffectiveUser(req);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Always recompute fresh safety verdict using the deterministic rules engine
    const verdict = computeSafetyVerdict(product, effectiveUser);

    let report = null;

    // Upsert the stored report only for the account owner
    if (!profileId) {
      const query = SafetyReport.findOneAndUpdate(
        { product: productId, user: req.user.id || req.user._id },
        {
          product: productId,
          user: req.user.id || req.user._id,
          riskAssessment: {
            level: verdict.level,
            verdict: verdict.verdict || verdict.level,
            score: verdict.score,
            ruleVersion: verdict.ruleVersion,
            dataCompleteness: verdict.dataCompleteness,
            factors: verdict.factors,
          },
          healthImpacts: [],
          recommendations: verdict.recommendations,
          status: 'reviewed',
          reviewedAt: new Date(),
        },
        { new: true, upsert: true, runValidators: true }
      );
      report = query && typeof query.populate === 'function' ? await query.populate('product') : await query;
    } else {
      report = {
        product,
        user: req.user.id || req.user._id,
        profileId,
        profileName,
        riskAssessment: {
          level: verdict.level,
          verdict: verdict.verdict || verdict.level,
          score: verdict.score,
          ruleVersion: verdict.ruleVersion,
          dataCompleteness: verdict.dataCompleteness,
          factors: verdict.factors,
        },
        healthImpacts: [],
        recommendations: verdict.recommendations,
        status: 'reviewed',
        reviewedAt: new Date(),
      };
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: { code: error.code || 'ERROR' }
      });
    }
    next(error);
  }
};

// @desc    Update safety report
// @route   PUT /api/safety/report/:reportId
// @access  Private
exports.updateSafetyReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, feedback } = req.body;

    const report = await SafetyReport.findOneAndUpdate(
      { _id: reportId, user: req.user.id },
      { 
        status: status || 'reviewed',
        'userFeedback': feedback,
      },
      { new: true, runValidators: true }
    ).populate('product');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Safety report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all safety reports for user
// @route   GET /api/safety/reports
// @access  Private
exports.getUserReports = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0, status } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const reports = await SafetyReport.find(filter)
      .populate('product')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SafetyReport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};