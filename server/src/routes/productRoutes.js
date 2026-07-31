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

const router = express.Router();

// Get product by barcode
router.get('/barcode/:barcode', auth, getProductByBarcode);

// Create a product from a scanned/OCR'd ingredient label
router.post('/scan-label', auth, scanLabel);

// Search products — must stay registered BEFORE '/:id' below, otherwise
// Express treats "search" itself as an :id value and this route never matches.
router.get('/search', auth, searchProducts);

// Get product details by ID
router.get('/:id', auth, getProductDetails);

// Get product alternatives
router.get('/:id/alternatives', auth, getAlternatives);

// AI-generated plain-English ingredient explanation
router.get('/:id/explain', auth, explainProduct);

// Force-refresh a product's image from Open Food Facts
router.post('/:id/refresh-image', auth, refreshImage);

module.exports = router;