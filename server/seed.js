const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

const demoProducts = [
  {
    barcode: '1234567890123',
    name: 'Organic Almond Milk',
    brand: 'PureLife',
    category: 'Beverage',
    description: 'Unsweetened organic almond milk, perfect for smoothies and cereal',
    ingredients: ['Filtered Water', 'Organic Almonds', 'Sea Salt', 'Sunflower Lecithin'],
    nutritionalInfo: {
      servingSize: '240ml',
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
      fiber: 0.5,
      sugar: 0,
      sodium: 160,
    },
    safetyInfo: {
      riskLevel: 'Safe',
      warnings: ['Contains tree nuts'],
      allergens: ['Tree Nuts'],
      certifications: ['Organic', 'Non-GMO', 'Vegan'],
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.5,
    totalReviews: 127,
  },
  {
    barcode: '9876543210987',
    name: 'Wheat Bread Whole Grain',
    brand: 'HealthyBake',
    category: 'Food',
    description: '100% whole wheat bread with sunflower and flax seeds',
    ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Salt', 'Sunflower Seeds', 'Flax Seeds'],
    nutritionalInfo: {
      servingSize: '2 slices (60g)',
      calories: 160,
      protein: 6,
      carbs: 30,
      fat: 2,
      fiber: 4,
      sugar: 2,
      sodium: 200,
    },
    safetyInfo: {
      riskLevel: 'Caution',
      warnings: ['Contains gluten', 'May contain traces of sesame', 'Shared facility with nuts'],
      allergens: ['Gluten', 'Sesame'],
      certifications: ['Whole Grain', 'Non-GMO'],
    },
    processingLevel: 'Processed Culinary Ingredient',
    isVerified: true,
    averageRating: 4.2,
    totalReviews: 89,
  },
  {
    barcode: '4567890123456',
    name: 'Premium Greek Yogurt',
    brand: 'DairyFresh',
    category: 'Food',
    description: 'Plain Greek yogurt, high protein, perfect for breakfast',
    ingredients: ['Cultured Pasteurized Skim Milk', 'Milk Protein Concentrate', 'Live Active Cultures'],
    nutritionalInfo: {
      servingSize: '170g',
      calories: 120,
      protein: 18,
      carbs: 5,
      fat: 1,
      fiber: 0,
      sugar: 3,
      sodium: 75,
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains dairy'],
      allergens: ['Dairy'],
      certifications: ['High Protein', 'Gluten-Free'],
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 234,
  },
  {
    barcode: '1111111111111',
    name: 'Classic Peanut Butter',
    brand: 'NuttyGood',
    category: 'Food',
    description: 'Creamy peanut butter made with roasted peanuts',
    ingredients: ['Roasted Peanuts', 'Salt'],
    nutritionalInfo: {
      servingSize: '2 tbsp (32g)',
      calories: 190,
      protein: 7,
      carbs: 6,
      fat: 16,
      fiber: 2,
      sugar: 1,
      sodium: 140,
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains peanuts'],
      allergens: ['Peanuts'],
      certifications: ['Non-GMO', 'Gluten-Free'],
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.6,
    totalReviews: 312,
  },
  {
    barcode: '2222222222222',
    name: 'Soy Milk Original',
    brand: 'GreenHarvest',
    category: 'Beverage',
    description: 'Fortified soy milk, rich in calcium and vitamin D',
    ingredients: ['Filtered Water', 'Organic Soybeans', 'Cane Sugar', 'Sea Salt', 'Calcium Carbonate', 'Vitamin D2'],
    nutritionalInfo: {
      servingSize: '240ml',
      calories: 80,
      protein: 7,
      carbs: 4,
      fat: 4,
      fiber: 1,
      sugar: 4,
      sodium: 90,
    },
    safetyInfo: {
      riskLevel: 'Unsafe',
      warnings: ['Contains soy'],
      allergens: ['Soy'],
      certifications: ['Organic', 'Non-GMO', 'Vegan'],
    },
    processingLevel: 'Processed',
    isVerified: true,
    averageRating: 4.3,
    totalReviews: 156,
  },
  {
    barcode: '3333333333333',
    name: 'Gluten-Free Oatmeal',
    brand: 'PureOats',
    category: 'Food',
    description: 'Rolled oats, certified gluten-free',
    ingredients: ['Gluten-Free Rolled Oats'],
    nutritionalInfo: {
      servingSize: '1/2 cup (40g)',
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      fiber: 4,
      sugar: 1,
      sodium: 0,
    },
    safetyInfo: {
      riskLevel: 'Safe',
      warnings: ['May contain traces of gluten from processing'],
      allergens: ['None'],
      certifications: ['Gluten-Free', 'Non-GMO', 'Vegan'],
    },
    processingLevel: 'Unprocessed',
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 198,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const deleted = await Product.deleteMany({});
    console.log(`🗑️ Cleared ${deleted.deletedCount} existing products`);

    // Insert new products
    const inserted = await Product.insertMany(demoProducts);
    console.log(`✅ Seeded ${inserted.length} demo products`);

    console.log('\n📋 Seeded Products:');
    inserted.forEach(p => {
      console.log(`  ${p.barcode} - ${p.name} (${p.safetyInfo.riskLevel})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
