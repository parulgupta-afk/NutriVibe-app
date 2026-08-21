const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Phase 14: list / add / remove saved products for the logged-in user.
 */

// GET /api/favorites
exports.listFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedProducts',
      select: 'name brand barcode category images safetyInfo processingLevel'
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      count: (user.savedProducts || []).length,
      data: user.savedProducts || []
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/favorites/:productId
exports.addFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const idStr = product._id.toString();
    const already = (user.savedProducts || []).some((id) => id.toString() === idStr);
    if (!already) {
      user.savedProducts = user.savedProducts || [];
      user.savedProducts.push(product._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: already ? 'Already saved' : 'Saved',
      productId: product._id
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/favorites/:productId
exports.removeFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.savedProducts = (user.savedProducts || []).filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Removed from saved',
      productId
    });
  } catch (error) {
    next(error);
  }
};
