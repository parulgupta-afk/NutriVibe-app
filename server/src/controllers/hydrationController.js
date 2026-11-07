/**
 * Hydration tracker controller (Phase 3).
 */
const HydrationLog = require('../models/HydrationLog');
const NutritionGoal = require('../models/NutritionGoal');
const { updateHydrationStreak } = require('../services/streakService');
const { updateGoalsSchema } = require('../validators/hydration.validator');

function getLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function logWater(req, res, next) {
  try {
    const userId = req.user._id;
    const { amountMl, source = 'quick', localDate: clientDate } = req.body;

    if (!amountMl || amountMl < 1) {
      return res.status(400).json({ message: 'amountMl is required and must be positive' });
    }

    const localDate = clientDate || getLocalDate();
    const log = await HydrationLog.create({
      userId,
      amountMl: Math.round(amountMl),
      localDate,
      source,
    });

    // Check daily total vs goal
    const goal = await NutritionGoal.findOne({ userId }) || { waterMl: 2000 };
    const todayLogs = await HydrationLog.find({ userId, localDate });
    const totalMl = todayLogs.reduce((s, l) => s + l.amountMl, 0);

    updateHydrationStreak(userId, localDate, totalMl, goal.waterMl).catch(console.error);

    res.status(201).json({
      success: true,
      data: log,
      todayTotalMl: totalMl,
      goalMl: goal.waterMl,
      progress: Math.min(100, Math.round((totalMl / goal.waterMl) * 100)),
    });
  } catch (err) {
    next(err);
  }
}

async function getTodayHydration(req, res, next) {
  try {
    const userId = req.user._id;
    const localDate = req.query.date || getLocalDate();
    const logs = await HydrationLog.find({ userId, localDate }).sort({ loggedAt: 1 });
    const totalMl = logs.reduce((s, l) => s + l.amountMl, 0);
    const goal = await NutritionGoal.findOne({ userId }) || { waterMl: 2000 };

    res.json({
      success: true,
      data: {
        logs,
        totalMl,
        goalMl: goal.waterMl,
        progress: Math.min(100, Math.round((totalMl / goal.waterMl) * 100)),
        localDate,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyHydration(req, res, next) {
  try {
    const userId = req.user._id;
    // Last 7 days of aggregated totals
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const logs = await HydrationLog.find({
      userId,
      loggedAt: { $gte: sevenDaysAgo },
    });

    const byDate = {};
    logs.forEach((l) => {
      byDate[l.localDate] = (byDate[l.localDate] || 0) + l.amountMl;
    });

    res.json({ success: true, data: byDate });
  } catch (err) {
    next(err);
  }
}

async function getOrUpdateGoals(req, res, next) {
  try {
    const userId = req.user._id;
    if (req.method === 'GET') {
      let goal = await NutritionGoal.findOne({ userId });
      if (!goal) {
        goal = await NutritionGoal.create({ userId });
      }
      return res.json({ success: true, data: goal });
    }

    // PUT
    const parsed = updateGoalsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: { details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) },
      });
    }

    const updates = { ...parsed.data };
    delete updates.userId;
    delete updates._id;

    const goal = await NutritionGoal.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  logWater,
  getTodayHydration,
  getWeeklyHydration,
  getOrUpdateGoals,
};
