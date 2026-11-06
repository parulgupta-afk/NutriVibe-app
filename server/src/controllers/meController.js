/**
 * Account Management Controller (GDPR / Privacy Compliance)
 * - GET /api/me/export  -> Complete data export for the authenticated user
 * - DELETE /api/me      -> Password-confirmed permanent deletion with full cascade
 */
const User = require('../models/User');
const Dependent = require('../models/Dependent');
const Meal = require('../models/Meal');
const HydrationLog = require('../models/HydrationLog');
const Tracking = require('../models/Tracking');
const Reaction = require('../models/Reaction');
const DietPlan = require('../models/DietPlan');
const NutritionGoal = require('../models/NutritionGoal');
const Streak = require('../models/Streak');
const ApiKey = require('../models/ApiKey');

/**
 * Export all personal data belonging to the authenticated user.
 */
async function exportMe(req, res, next) {
  try {
    const userId = req.user._id;

    const [
      user,
      dependents,
      meals,
      hydration,
      tracking,
      reactions,
      dietPlans,
      nutritionGoals,
      streaks,
      apiKeys
    ] = await Promise.all([
      User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire -googleId'),
      Dependent.find({ owner: userId }),
      Meal.find({ userId }),
      HydrationLog.find({ userId }),
      Tracking.find({ user: userId }),
      Reaction.find({ userId }),
      DietPlan.find({ userId }),
      NutritionGoal.find({ userId }),
      Streak.find({ userId }),
      ApiKey.find({ ownerId: userId }).select('name keyPrefix rateLimitPerHour usageCount lastUsedAt active revokedAt createdAt')
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      user: user || {
        _id: userId,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        preferences: req.user.preferences
      },
      dependents: dependents || [],
      meals: meals || [],
      hydration: hydration || [],
      tracking: tracking || [],
      reactions: reactions || [],
      dietPlans: dietPlans || [],
      nutritionGoals: nutritionGoals || [],
      streaks: streaks || [],
      apiKeys: apiKeys || []
    };

    res.status(200).json({
      success: true,
      data: payload
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permanently delete the authenticated user's account and all associated data.
 * Requires explicit password confirmation.
 */
async function deleteMe(req, res, next) {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete your account'
      });
    }

    const userId = req.user._id;
    const userWithPassword = await User.findById(userId).select('+password');
    if (!userWithPassword) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Verify password if user has a local password set
    if (userWithPassword.password) {
      const isMatch = await userWithPassword.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. Account deletion aborted.'
        });
      }
    }

    // Cascade delete all user-owned data across all collections
    await Promise.all([
      Dependent.deleteMany({ owner: userId }),
      Meal.deleteMany({ userId }),
      HydrationLog.deleteMany({ userId }),
      Tracking.deleteMany({ user: userId }),
      Reaction.deleteMany({ userId }),
      DietPlan.deleteMany({ userId }),
      NutritionGoal.deleteMany({ userId }),
      Streak.deleteMany({ userId }),
      ApiKey.deleteMany({ ownerId: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated personal data have been permanently deleted.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { exportMe, deleteMe };
