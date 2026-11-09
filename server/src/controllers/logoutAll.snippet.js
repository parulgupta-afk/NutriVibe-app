
// --- ADD to authController.js exports ---
// @desc    Invalidate all JWTs for this user (increment tokenVersion)
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'All sessions revoked. Please sign in again.',
    });
  } catch (error) {
    next(error);
  }
};
