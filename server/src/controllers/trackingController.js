const Tracking = require('../models/Tracking');
const Product = require('../models/Product');
const { computeSafetyVerdict } = require('../services/safetyEngine');
const { resolveEffectiveUser } = require('../services/profileResolver');

// @desc    Log a product
// @route   POST /api/tracking/log
// @access  Private
exports.logProduct = async (req, res, next) => {
  try {
    const { productId, quantity = 1, action = 'log', notes } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Snapshot the personalized verdict at the moment of logging —
    // for whichever profile (owner or dependent) this log is for
    const { effectiveUser, profileId, profileName } = await resolveEffectiveUser(req);
    const verdict = computeSafetyVerdict(product, effectiveUser);

    // Create tracking entry
    const log = await Tracking.create({
      user: req.user.id,
      product: productId,
      action,
      metrics: {
        interactions: 1,
        duration: 0,
      },
      notes,
      riskLevel: verdict.level,
      profile: profileId,
      profileName,
      createdAt: new Date(),
    });

    // Populate product details for response
    await log.populate('product');

    res.status(201).json({
      success: true,
      data: log,
      message: 'Product logged successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily tracking
// @route   GET /api/tracking/daily
// @access  Private
exports.getDailyTracking = async (req, res, next) => {
  try {
    const { date, profileId } = req.query;
    let startDate, endDate;

    if (date) {
      // Treat the given date string as an explicit UTC calendar day —
      // no dependency on the server's local timezone setting at all.
      startDate = new Date(`${date}T00:00:00.000Z`);
      endDate = new Date(`${date}T23:59:59.999Z`);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      startDate = new Date(`${todayStr}T00:00:00.000Z`);
      endDate = new Date(`${todayStr}T23:59:59.999Z`);
    }

    // Get tracking logs for the day
    const filter = {
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate },
    };
    // profileId=null (as a string) means "just the account owner, no dependent"
    if (profileId === 'null') {
      filter.profile = null;
    } else if (profileId) {
      filter.profile = profileId;
    }

    const logs = await Tracking.find(filter).populate('product');

    // Calculate stats
    const totalScans = logs.length;
    let safeCount = 0;
    let cautionCount = 0;
    let unsafeCount = 0;
    let unknownCount = 0;

    const recentLogs = logs.slice(-5).reverse().map(log => ({
      id: log._id,
      productName: log.product?.name || 'Unknown Product',
      productId: log.product?._id,
      productImage: log.product?.images?.[0] || null,
      riskLevel: log.riskLevel || log.product?.safetyInfo?.riskLevel || 'Unknown',
      profileName: log.profileName || null,
      action: log.action,
      createdAt: log.createdAt,
    }));

    logs.forEach(log => {
      const riskLevel = log.riskLevel || log.product?.safetyInfo?.riskLevel || 'Unknown';
      if (riskLevel === 'Safe') safeCount++;
      else if (riskLevel === 'Caution') cautionCount++;
      else if (riskLevel === 'Unsafe') unsafeCount++;
      else unknownCount++;
    });

    res.status(200).json({
      success: true,
      data: {
        date: startDate,
        totalScans,
        safeCount,
        cautionCount,
        unsafeCount,
        unknownCount,
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking history
// @route   GET /api/tracking/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const { 
      limit = 20, 
      skip = 0, 
      startDate, 
      endDate,
      action,
      riskLevel,
      profileId,
    } = req.query;

    // Build filter
    const filter = { user: req.user.id };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (action) filter.action = action;

    if (profileId === 'null') {
      filter.profile = null;
    } else if (profileId) {
      filter.profile = profileId;
    }

    // Get logs with product filtering
    let logs = await Tracking.find(filter)
      .populate('product')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Filter by risk level if specified
    if (riskLevel) {
      logs = logs.filter(log => 
        (log.riskLevel || log.product?.safetyInfo?.riskLevel) === riskLevel
      );
    }

    const total = await Tracking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs.map(log => ({
        id: log._id,
        productName: log.product?.name || 'Unknown Product',
        productId: log.product?._id,
        riskLevel: log.riskLevel || log.product?.safetyInfo?.riskLevel || 'Unknown',
        profileName: log.profileName || null,
        action: log.action,
        createdAt: log.createdAt,
        notes: log.notes,
        product: log.product,
      })),
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

// @desc    Delete a single tracking log entry
// @route   DELETE /api/tracking/:id
// @access  Private
exports.deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Scope to req.user.id so a user can only ever delete their own logs
    const log = await Tracking.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Log entry deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear tracking logs (optionally scoped to a single day)
// @route   DELETE /api/tracking/clear
// @access  Private
exports.clearLogs = async (req, res, next) => {
  try {
    const { date } = req.query;
    const filter = { user: req.user.id };

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const result = await Tracking.deleteMany(filter);

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: date
        ? 'Logs for this day cleared'
        : 'All logs cleared',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking statistics
// @route   GET /api/tracking/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const logs = await Tracking.find({
      user: req.user.id,
      createdAt: { $gte: startDate },
    }).populate('product');

    // Calculate stats by day
    const statsByDay = {};
    const riskCounts = { Safe: 0, Caution: 0, Unsafe: 0, Unknown: 0 };

    logs.forEach(log => {
      const day = log.createdAt.toISOString().split('T')[0];
      if (!statsByDay[day]) {
        statsByDay[day] = { total: 0, safe: 0, caution: 0, unsafe: 0, unknown: 0 };
      }
      
      statsByDay[day].total++;
      
      const riskLevel = log.riskLevel || log.product?.safetyInfo?.riskLevel || 'Unknown';
      if (riskLevel === 'Safe') {
        statsByDay[day].safe++;
        riskCounts.Safe++;
      } else if (riskLevel === 'Caution') {
        statsByDay[day].caution++;
        riskCounts.Caution++;
      } else if (riskLevel === 'Unsafe') {
        statsByDay[day].unsafe++;
        riskCounts.Unsafe++;
      } else {
        statsByDay[day].unknown++;
        riskCounts.Unknown++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        totalScans: logs.length,
        riskCounts,
        dailyStats: Object.keys(statsByDay).map(date => ({
          date,
          ...statsByDay[date],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};