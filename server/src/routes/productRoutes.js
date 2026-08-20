const express = require('express');
const {
  getProductByBarcode,
  getProductDetails,
  getAlternatives,
  searchProducts,
  scanLabel,
  explainProduct,
  refreshImage,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Phase 4: AI explain gets its own tight limit (also set on app.locals)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI explanation requests. Please try again in a few minutes.'
  }
});

router.get('/barcode/:barcode', auth, getProductByBarcode);
router.post('/scan-label', auth, scanLabel);

// Search must stay before '/:id'
router.get('/search', auth, searchProducts);

router.get('/:id', auth, getProductDetails);
router.get('/:id/alternatives', auth, getAlternatives);

// AI explanation — rate limited
router.get('/:id/explain', auth, aiLimiter, explainProduct);

router.post('/:id/refresh-image', auth, refreshImage);

module.exports = router;
