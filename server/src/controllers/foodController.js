/**
 * Food database controller (Phase 2 — verified composition)
 */
const FoodItem = require('../models/FoodItem');
const sampleFoods = require('../data/seedFoodItems');

async function searchFoods(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    let foods;
    if (!q) {
      foods = await FoodItem.find().sort({ name: 1 }).limit(limit);
    } else {
      foods = await FoodItem.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);

      // Fallback to regex if text index returns nothing (e.g. short query)
      if (foods.length === 0) {
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        foods = await FoodItem.find({
          $or: [{ name: re }, { aliases: re }],
        })
          .limit(limit);
      }
    }

    res.json({ success: true, data: foods });
  } catch (err) {
    next(err);
  }
}

async function getFoodById(req, res, next) {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
}

/**
 * One-time / admin seed of sample foods.
 * In production protect with admin role.
 */
async function seedFoods(req, res, next) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    let inserted = 0;
    for (const item of sampleFoods) {
      const exists = await FoodItem.findOne({ name: item.name });
      if (!exists) {
        await FoodItem.create(item);
        inserted += 1;
      }
    }
    const total = await FoodItem.countDocuments();
    res.json({
      success: true,
      message: `Seeded ${inserted} new foods. Total foods: ${total}`,
      data: { inserted, total },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchFoods,
  getFoodById,
  seedFoods,
};
