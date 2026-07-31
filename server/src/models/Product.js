const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: [true, 'Please provide a barcode'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Food', 'Beverage', 'Supplement', 'Cosmetic', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  nutritionalInfo: {
    servingSize: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    vitamins: [String],
    minerals: [String]
  },
  safetyInfo: {
    riskLevel: {
      type: String,
      enum: ['Safe', 'Caution', 'Unsafe', 'Unknown'],
      default: 'Unknown'
    },
    warnings: [String],
    allergens: [String],
    certifications: [String]
  },
  alternatives: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    reason: String,
    score: Number
  }],
  images: [String],
  processingLevel: {
    type: String,
    enum: ['Unprocessed', 'Processed Culinary Ingredient', 'Processed', 'Ultra-Processed', 'Unknown'],
    default: 'Unknown'
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: String,
    default: 'Open Food Facts'
  },
  // Tracks the last time we tried to (re)fetch missing image data from
  // Open Food Facts for this product, so we don't hammer their API on
  // every single page view if a product genuinely has no photo there.
  imageCheckedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', brand: 'text', category: 'text' });
productSchema.index({ barcode: 1 });

module.exports = mongoose.model('Product', productSchema);