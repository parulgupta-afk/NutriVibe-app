const express = require('express');
const {
  getProductByBarcode,
  getProductDetails,
  getAlternatives,
  searchProducts,
  scanLabel,
  explainProduct,
  refreshImage
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  validate,
  validateBarcodeParam,
  validateMongoIdParam,
  validateScanLabel,
  validateProductSearch
} = require('../middleware/validation');

const router = express.Router();

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

router.get(
  '/barcode/:barcode',
  auth,
  validate(validateBarcodeParam),
  getProductByBarcode
);

router.post('/scan-label', auth, validate(validateScanLabel), scanLabel);

router.get('/search', auth, validate(validateProductSearch), searchProducts);

router.get('/:id', auth, validate(validateMongoIdParam('id')), getProductDetails);
router.get(
  '/:id/alternatives',
  auth,
  validate(validateMongoIdParam('id')),
  getAlternatives
);
router.get(
  '/:id/explain',
  auth,
  validate(validateMongoIdParam('id')),
  aiLimiter,
  explainProduct
);
router.post(
  '/:id/refresh-image',
  auth,
  validate(validateMongoIdParam('id')),
  refreshImage
);

module.exports = router;
