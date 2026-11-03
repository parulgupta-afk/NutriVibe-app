const Recall = require('../models/Recall');
const Product = require('../models/Product');

/** Conservative match: barcode exact OR (normalized name + brand) */
async function matchesForUser(req, res, next) {
  try {
    const barcode = req.query.barcode;
    const productId = req.query.productId;
    let productName;
    let brand;
    let code = barcode;

    if (productId) {
      const p = await Product.findById(productId);
      if (p) {
        productName = p.name;
        brand = p.brand;
        code = code || p.barcode;
      }
    }

    const query = { active: true };
    const or = [];
    if (code) or.push({ barcode: code });
    if (productName && brand) {
      or.push({
        productName: new RegExp(`^${escapeRe(productName)}$`, 'i'),
        brand: new RegExp(`^${escapeRe(brand)}$`, 'i'),
      });
    }
    if (or.length === 0) {
      return res.json({ success: true, data: [], note: 'Provide barcode or productId for conservative matching' });
    }
    query.$or = or;

    const hits = await Recall.find(query).sort({ publishedAt: -1 }).limit(20);
    res.json({
      success: true,
      data: hits,
      note: 'Only exact barcode or exact product+brand matches are returned. Vague name-only matches are never used.',
    });
  } catch (err) {
    next(err);
  }
}

async function seedDemo(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const demo = await Recall.findOneAndUpdate(
      { barcode: 'DEMO-RECALL-001' },
      {
        source: 'demo',
        title: 'Demo recall — do not use in production',
        productName: 'Demo Contaminated Snack',
        brand: 'DemoBrand',
        barcode: 'DEMO-RECALL-001',
        reason: 'Illustrative seed data only',
        publishedAt: new Date(),
        active: true,
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: demo });
  } catch (err) {
    next(err);
  }
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { matchesForUser, seedDemo };
