const SafetyReport = require('../models/SafetyReport');
const Product = require('../models/Product');
const { computeSafetyVerdict } = require('../services/safetyEngine');

// @desc    Get safety report for a product
// @route   GET /api/safety/product/:productId
// @access  Private
exports.getSafetyReport = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if report exists
    let report = await SafetyReport.findOne({
      product: productId,
      user: req.user.id,
    }).populate('product');

    if (!report) {
      // Generate a new report
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Generate safety report based on user preferences
      const verdict = computeSafetyVerdict(product, req.user);

      // Create report
      report = await SafetyReport.create({
        product: productId,
        user: req.user.id,
        riskAssessment: {
          level: verdict.level,
          score: verdict.score,
          factors: verdict.factors,
        },
        healthImpacts: [],
        recommendations: verdict.recommendations,
        status: 'reviewed',
        reviewedAt: new Date(),
      });

      await report.populate('product');
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
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