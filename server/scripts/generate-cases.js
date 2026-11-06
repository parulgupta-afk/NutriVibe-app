const fs = require('fs');
const path = require('path');

const cases = [
  // ==========================================
  // 1. ALLERGEN DIRECT (All 14 major allergens)
  // ==========================================
  {
    id: 'allergen-milk-01',
    category: 'allergen',
    allergen: 'milk',
    product: { name: 'Milk Chocolate', ingredients: ['whole milk', 'sugar', 'cocoa butter'], safetyInfo: { allergens: ['Milk'] } },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Direct milk allergen match'
  },
  {
    id: 'allergen-milk-02',
    category: 'allergen',
    allergen: 'milk',
    product: { name: 'Cheddar Cheese', ingredients: ['pasteurized milk', 'cheese cultures', 'salt', 'enzymes'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Direct dairy/cheese match'
  },
  {
    id: 'allergen-milk-03',
    category: 'allergen',
    allergen: 'milk',
    product: { name: 'Dairy Yogurt', ingredients: ['cultured grade A milk', 'sugar', 'strawberries'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Direct yogurt milk match'
  },
  {
    id: 'allergen-peanut-01',
    category: 'allergen',
    allergen: 'peanut',
    product: { name: 'Peanut Butter Cups', ingredients: ['roasted peanuts', 'sugar', 'cocoa', 'salt'] },
    profile: { allergies: ['peanut'] },
    expected: 'UNSAFE',
    notes: 'Direct roasted peanuts'
  },
  {
    id: 'allergen-peanut-02',
    category: 'allergen',
    allergen: 'peanut',
    product: { name: 'Snack Mix', ingredients: ['peanuts', 'raisins', 'sunflower oil'] },
    profile: { allergies: ['peanuts'] },
    expected: 'UNSAFE',
    notes: 'Plural peanuts match'
  },
  {
    id: 'allergen-peanut-03',
    category: 'allergen',
    allergen: 'peanut',
    product: { name: 'Arachis Oil Dressing', ingredients: ['arachis hypogaea oil', 'vinegar', 'herbs'] },
    profile: { allergies: ['peanuts'] },
    expected: 'UNSAFE',
    notes: 'Scientific arachis hypogaea match'
  },
  {
    id: 'allergen-tree-nuts-almond',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Almond Granola', ingredients: ['rolled oats', 'sliced almonds', 'honey'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Almonds in granola'
  },
  {
    id: 'allergen-tree-nuts-cashew',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Cashew Butter', ingredients: ['roasted cashews', 'sea salt'] },
    profile: { allergies: ['cashews'] },
    expected: 'UNSAFE',
    notes: 'Cashew butter match'
  },
  {
    id: 'allergen-tree-nuts-walnut',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Walnut Brownie', ingredients: ['flour', 'sugar', 'walnuts', 'cocoa'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Walnuts match'
  },
  {
    id: 'allergen-tree-nuts-pecan',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Pecan Pie', ingredients: ['pecans', 'corn syrup', 'eggs', 'flour'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Pecans match'
  },
  {
    id: 'allergen-tree-nuts-pistachio',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Pistachio Gelato', ingredients: ['cream', 'sugar', 'pistachios'] },
    profile: { allergies: ['pistachio'] },
    expected: 'UNSAFE',
    notes: 'Pistachios match'
  },
  {
    id: 'allergen-tree-nuts-hazelnut',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Hazelnut Spread', ingredients: ['sugar', 'hazelnuts', 'cocoa', 'palm oil'] },
    profile: { allergies: ['hazelnut'] },
    expected: 'UNSAFE',
    notes: 'Hazelnut match'
  },
  {
    id: 'allergen-tree-nuts-brazilnut',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Mixed Nuts', ingredients: ['brazil nuts', 'cashews', 'salt'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Brazil nuts match'
  },
  {
    id: 'allergen-tree-nuts-macadamia',
    category: 'allergen',
    allergen: 'tree nuts',
    product: { name: 'Macadamia Cookies', ingredients: ['flour', 'sugar', 'macadamia nuts', 'butter'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Macadamia nuts match'
  },
  {
    id: 'allergen-egg-01',
    category: 'allergen',
    allergen: 'egg',
    product: { name: 'Egg Noodles', ingredients: ['semolina', 'whole eggs', 'salt'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Direct whole eggs'
  },
  {
    id: 'allergen-egg-02',
    category: 'allergen',
    allergen: 'egg',
    product: { name: 'Mayonnaise', ingredients: ['soybean oil', 'egg yolks', 'vinegar', 'mustard'] },
    profile: { allergies: ['eggs'] },
    expected: 'UNSAFE',
    notes: 'Egg yolks in mayonnaise'
  },
  {
    id: 'allergen-egg-03',
    category: 'allergen',
    allergen: 'egg',
    product: { name: 'Meringue Cookies', ingredients: ['egg whites', 'sugar', 'vanilla'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Egg whites match'
  },
  {
    id: 'allergen-soy-01',
    category: 'allergen',
    allergen: 'soy',
    product: { name: 'Organic Tofu', ingredients: ['water', 'organic soybeans', 'calcium sulfate'] },
    profile: { allergies: ['soy'] },
    expected: 'UNSAFE',
    notes: 'Soybeans in tofu'
  },
  {
    id: 'allergen-soy-02',
    category: 'allergen',
    allergen: 'soy',
    product: { name: 'Edamame Snack', ingredients: ['shelled edamame', 'sea salt'] },
    profile: { allergies: ['soya'] },
    expected: 'UNSAFE',
    notes: 'Edamame match for soya'
  },
  {
    id: 'allergen-soy-03',
    category: 'allergen',
    allergen: 'soy',
    product: { name: 'Soy Milk Drink', ingredients: ['filtered water', 'organic soy base', 'cane sugar'] },
    profile: { allergies: ['soy'] },
    expected: 'UNSAFE',
    notes: 'Soy base in soy drink'
  },
  {
    id: 'allergen-gluten-wheat',
    category: 'allergen',
    allergen: 'gluten',
    product: { name: 'Sourdough Bread', ingredients: ['wheat flour', 'water', 'salt', 'sourdough starter'] },
    profile: { allergies: ['wheat'] },
    expected: 'UNSAFE',
    notes: 'Wheat flour direct match'
  },
  {
    id: 'allergen-gluten-barley',
    category: 'allergen',
    allergen: 'gluten',
    product: { name: 'Malt Beverage', ingredients: ['carbonated water', 'barley malt extract', 'sugar'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Barley malt extract'
  },
  {
    id: 'allergen-gluten-rye',
    category: 'allergen',
    allergen: 'gluten',
    product: { name: 'Rye Crispbread', ingredients: ['whole grain rye flour', 'water', 'salt'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Rye flour'
  },
  {
    id: 'allergen-fish-01',
    category: 'allergen',
    allergen: 'fish',
    product: { name: 'Canned Tuna', ingredients: ['chunk light tuna', 'water', 'vegetable broth', 'salt'] },
    profile: { allergies: ['fish'] },
    expected: 'UNSAFE',
    notes: 'Tuna fish direct match'
  },
  {
    id: 'allergen-fish-02',
    category: 'allergen',
    allergen: 'fish',
    product: { name: 'Caesar Dressing', ingredients: ['canola oil', 'egg yolks', 'anchovy paste', 'garlic'] },
    profile: { allergies: ['fish'] },
    expected: 'UNSAFE',
    notes: 'Anchovy in dressing'
  },
  {
    id: 'allergen-fish-03',
    category: 'allergen',
    allergen: 'fish',
    product: { name: 'Asian Dipping Sauce', ingredients: ['water', 'fish sauce', 'sugar', 'lime juice'] },
    profile: { allergies: ['fish'] },
    expected: 'UNSAFE',
    notes: 'Fish sauce match'
  },
  {
    id: 'allergen-shellfish-shrimp',
    category: 'allergen',
    allergen: 'shellfish',
    product: { name: 'Shrimp Dumplings', ingredients: ['shrimp', 'wheat starch', 'tapioca starch', 'sesame oil'] },
    profile: { allergies: ['shellfish'] },
    expected: 'UNSAFE',
    notes: 'Shrimp match for shellfish'
  },
  {
    id: 'allergen-shellfish-prawn',
    category: 'allergen',
    allergen: 'shellfish',
    product: { name: 'Prawn Crackers', ingredients: ['tapioca flour', 'fresh prawn', 'garlic', 'salt'] },
    profile: { allergies: ['shellfish'] },
    expected: 'UNSAFE',
    notes: 'Prawn match'
  },
  {
    id: 'allergen-shellfish-crab',
    category: 'allergen',
    allergen: 'shellfish',
    product: { name: 'Crab Cakes', ingredients: ['crab meat', 'breadcrumbs', 'mayonnaise', 'mustard'] },
    profile: { allergies: ['crustaceans'] },
    expected: 'UNSAFE',
    notes: 'Crab meat for crustaceans'
  },
  {
    id: 'allergen-shellfish-lobster',
    category: 'allergen',
    allergen: 'shellfish',
    product: { name: 'Lobster Bisque', ingredients: ['lobster stock', 'cream', 'lobster meat', 'white wine'] },
    profile: { allergies: ['shellfish'] },
    expected: 'UNSAFE',
    notes: 'Lobster meat'
  },
  {
    id: 'allergen-molluscs-clam',
    category: 'allergen',
    allergen: 'molluscs',
    product: { name: 'Clam Chowder', ingredients: ['potatoes', 'clam broth', 'clams', 'cream'] },
    profile: { allergies: ['molluscs'] },
    expected: 'UNSAFE',
    notes: 'Clams match for molluscs'
  },
  {
    id: 'allergen-molluscs-squid',
    category: 'allergen',
    allergen: 'molluscs',
    product: { name: 'Calamari Rings', ingredients: ['squid rings', 'wheat flour', 'cornstarch', 'salt'] },
    profile: { allergies: ['molluscs'] },
    expected: 'UNSAFE',
    notes: 'Squid for molluscs'
  },
  {
    id: 'allergen-molluscs-mussel',
    category: 'allergen',
    allergen: 'molluscs',
    product: { name: 'Smoked Mussels', ingredients: ['mussels', 'olive oil', 'salt'] },
    profile: { allergies: ['molluscs'] },
    expected: 'UNSAFE',
    notes: 'Mussels match'
  },
  {
    id: 'allergen-sesame-01',
    category: 'allergen',
    allergen: 'sesame',
    product: { name: 'Sesame Bagels', ingredients: ['flour', 'water', 'sesame seeds', 'yeast'] },
    profile: { allergies: ['sesame'] },
    expected: 'UNSAFE',
    notes: 'Sesame seeds on bagel'
  },
  {
    id: 'allergen-sesame-tahini',
    category: 'allergen',
    allergen: 'sesame',
    product: { name: 'Classic Hummus', ingredients: ['chickpeas', 'water', 'tahini', 'garlic', 'lemon juice'] },
    profile: { allergies: ['sesame'] },
    expected: 'UNSAFE',
    notes: 'Tahini is 100% sesame'
  },
  {
    id: 'allergen-mustard-01',
    category: 'allergen',
    allergen: 'mustard',
    product: { name: 'Dijon Mustard', ingredients: ['water', 'mustard seed', 'distilled vinegar', 'salt'] },
    profile: { allergies: ['mustard'] },
    expected: 'UNSAFE',
    notes: 'Mustard seed match'
  },
  {
    id: 'allergen-celery-01',
    category: 'allergen',
    allergen: 'celery',
    product: { name: 'Vegetable Broth', ingredients: ['water', 'carrots', 'celery', 'onions', 'sea salt'] },
    profile: { allergies: ['celery'] },
    expected: 'UNSAFE',
    notes: 'Celery in vegetable broth'
  },
  {
    id: 'allergen-lupin-01',
    category: 'allergen',
    allergen: 'lupin',
    product: { name: 'High Protein Pasta', ingredients: ['lupin flour', 'durum wheat semolina'] },
    profile: { allergies: ['lupin'] },
    expected: 'UNSAFE',
    notes: 'Lupin flour match'
  },
  {
    id: 'allergen-sulphites-01',
    category: 'allergen',
    allergen: 'sulphites',
    product: { name: 'Dried Apricots', ingredients: ['apricots', 'sulphur dioxide'], safetyInfo: { allergens: ['sulphites'] } },
    profile: { allergies: ['sulphites'] },
    expected: 'UNSAFE',
    notes: 'Sulphur dioxide preservative'
  },
  {
    id: 'allergen-sulphites-e220',
    category: 'allergen',
    allergen: 'sulphites',
    product: { name: 'White Wine Vinegar', ingredients: ['wine vinegar', 'preservative e220'] },
    profile: { allergies: ['sulphites'] },
    expected: 'UNSAFE',
    notes: 'E220 is sulfur dioxide'
  },
  {
    id: 'allergen-corn-01',
    category: 'allergen',
    allergen: 'corn',
    product: { name: 'Tortilla Chips', ingredients: ['whole grain corn', 'sunflower oil', 'sea salt'] },
    profile: { allergies: ['corn'] },
    expected: 'UNSAFE',
    notes: 'Corn tortilla chips'
  },

  // ==========================================
  // 2. HIDDEN ALLERGEN NAMES & DERIVATIVES
  // ==========================================
  {
    id: 'hidden-dairy-casein',
    category: 'hidden',
    allergen: 'milk',
    product: { name: 'Energy Bar', ingredients: ['isolated soy protein', 'sodium caseinate', 'dates', 'oats'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Caseinate is a milk protein'
  },
  {
    id: 'hidden-dairy-whey',
    category: 'hidden',
    allergen: 'milk',
    product: { name: 'Protein Shake', ingredients: ['water', 'whey protein concentrate', 'cocoa', 'sucralose'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Whey protein is dairy'
  },
  {
    id: 'hidden-dairy-solids',
    category: 'hidden',
    allergen: 'milk',
    product: { name: 'Dark Chocolate Cookie', ingredients: ['flour', 'sugar', 'cocoa', 'milk solids'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Milk solids in chocolate cookie'
  },
  {
    id: 'hidden-dairy-lactalbumin',
    category: 'hidden',
    allergen: 'milk',
    product: { name: 'Nutritional Shake', ingredients: ['water', 'lactalbumin', 'maltodextrin', 'vanilla'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Lactalbumin is milk albumin'
  },
  {
    id: 'hidden-dairy-ghee',
    category: 'hidden',
    allergen: 'milk',
    product: { name: 'Indian Sweets', ingredients: ['chickpea flour', 'sugar', 'pure desi ghee', 'cardamom'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Ghee is clarified butter / dairy'
  },
  {
    id: 'hidden-egg-albumin',
    category: 'hidden',
    allergen: 'egg',
    product: { name: 'Glaze Pastry', ingredients: ['flour', 'sugar', 'albumin', 'butter'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Albumin is egg protein'
  },
  {
    id: 'hidden-egg-lysozyme',
    category: 'hidden',
    allergen: 'egg',
    product: { name: 'Artisan Hard Cheese', ingredients: ['milk', 'salt', 'rennet', 'preservative lysozyme'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Lysozyme derived from egg whites'
  },
  {
    id: 'hidden-egg-ovalbumin',
    category: 'hidden',
    allergen: 'egg',
    product: { name: 'Protein Bar', ingredients: ['dates', 'almonds', 'ovalbumin', 'cacao'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Ovalbumin is main egg white protein'
  },
  {
    id: 'hidden-soy-lecithin',
    category: 'hidden',
    allergen: 'soy',
    product: { name: 'Premium Chocolate', ingredients: ['cocoa mass', 'sugar', 'cocoa butter', 'soy lecithin'] },
    profile: { allergies: ['soy'] },
    expected: 'UNSAFE',
    notes: 'Soy lecithin is a soy derivative'
  },
  {
    id: 'hidden-sunflower-lecithin-safe-soy',
    category: 'hidden',
    allergen: 'soy',
    product: { name: 'Soy-Free Chocolate', ingredients: ['cocoa mass', 'cane sugar', 'cocoa butter', 'sunflower lecithin'] },
    profile: { allergies: ['soy'] },
    expected: 'SAFE',
    notes: 'Sunflower lecithin does NOT contain soy'
  },
  {
    id: 'hidden-gluten-semolina',
    category: 'hidden',
    allergen: 'gluten',
    product: { name: 'Italian Pasta', ingredients: ['durum wheat semolina', 'water'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Semolina is wheat gluten'
  },
  {
    id: 'hidden-gluten-spelt',
    category: 'hidden',
    allergen: 'gluten',
    product: { name: 'Spelt Crackers', ingredients: ['organic spelt flour', 'olive oil', 'salt'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Spelt is an ancient wheat with gluten'
  },
  {
    id: 'hidden-gluten-seitan',
    category: 'hidden',
    allergen: 'gluten',
    product: { name: 'Vegan Roast', ingredients: ['vital wheat gluten', 'seitan', 'soy sauce', 'garlic'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Seitan is pure wheat gluten'
  },
  {
    id: 'hidden-gluten-farina',
    category: 'hidden',
    allergen: 'gluten',
    product: { name: 'Hot Breakfast Cereal', ingredients: ['wheat farina', 'calcium carbonate', 'iron'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Farina is milled wheat'
  },
  {
    id: 'hidden-fish-isinglass',
    category: 'hidden',
    allergen: 'fish',
    product: { name: 'Fined Cask Ale', ingredients: ['water', 'malted barley', 'hops', 'yeast', 'isinglass'] },
    profile: { allergies: ['fish'] },
    expected: 'UNSAFE',
    notes: 'Isinglass is fish bladder fining agent'
  },
  {
    id: 'hidden-sesame-benne',
    category: 'hidden',
    allergen: 'sesame',
    product: { name: 'Southern Benne Wafers', ingredients: ['brown sugar', 'flour', 'benne seeds', 'butter'] },
    profile: { allergies: ['sesame'] },
    expected: 'UNSAFE',
    notes: 'Benne is heirloom sesame'
  },
  {
    id: 'hidden-mustard-rai',
    category: 'hidden',
    allergen: 'mustard',
    product: { name: 'Mango Pickle', ingredients: ['raw mango', 'mustard oil', 'rai', 'chili', 'salt'] },
    profile: { allergies: ['mustard'] },
    expected: 'UNSAFE',
    notes: 'Rai is small brown mustard seeds'
  },

  // ==========================================
  // 3. CROSS-CONTAMINATION & MAY-CONTAIN
  // ==========================================
  {
    id: 'cross-contam-may-contain-peanut',
    category: 'cross-contamination',
    allergen: 'peanut',
    product: { name: 'Plain Oat Granola', ingredients: ['whole grain oats', 'brown sugar', 'canola oil'], safetyInfo: { warnings: ['May contain peanuts and tree nuts'] } },
    profile: { allergies: ['peanut'] },
    expected: 'CAUTION',
    notes: 'May contain peanuts warning flags CAUTION'
  },
  {
    id: 'cross-contam-facility-milk',
    category: 'cross-contamination',
    allergen: 'milk',
    product: { name: 'Dark Chocolate Chips', ingredients: ['cocoa mass', 'sugar', 'cocoa butter'], safetyInfo: { warnings: ['Manufactured in a shared facility that processes milk'] } },
    profile: { allergies: ['milk'] },
    expected: 'CAUTION',
    notes: 'Shared facility with milk'
  },
  {
    id: 'cross-contam-shared-equipment-tree-nuts',
    category: 'cross-contamination',
    allergen: 'tree nuts',
    product: { name: 'Sunflower Seed Butter', ingredients: ['roasted sunflower seeds', 'sugar', 'salt'], safetyInfo: { warnings: ['Made on shared equipment with almond and cashews'] } },
    profile: { allergies: ['tree nuts'] },
    expected: 'CAUTION',
    notes: 'Shared equipment with tree nuts'
  },
  {
    id: 'cross-contam-traces-egg',
    category: 'cross-contamination',
    allergen: 'egg',
    product: { name: 'Durum Wheat Pasta', ingredients: ['durum wheat semolina', 'water'], safetyInfo: { warnings: ['May contain traces of egg'] } },
    profile: { allergies: ['egg'] },
    expected: 'CAUTION',
    notes: 'Traces of egg warning'
  },
  {
    id: 'cross-contam-traces-shellfish',
    category: 'cross-contamination',
    allergen: 'shellfish',
    product: { name: 'Seaweed Snack', ingredients: ['roasted seaweed', 'sesame oil', 'salt'], safetyInfo: { warnings: ['Harvested in waters that may contain traces of crustacean shellfish'] } },
    profile: { allergies: ['shellfish'] },
    expected: 'CAUTION',
    notes: 'Harvested with potential crustacean traces'
  },
  {
    id: 'cross-contam-unrelated-warning-safe',
    category: 'cross-contamination',
    allergen: 'none',
    product: { name: 'Rice Cakes', ingredients: ['brown rice', 'sea salt'], safetyInfo: { warnings: ['May contain traces of peanuts'] } },
    profile: { allergies: ['milk'] },
    expected: 'SAFE',
    notes: 'User has milk allergy; peanut warning is not their allergen'
  },

  // ==========================================
  // 4. CONTRADICTORY PACKAGING CLAIMS
  // ==========================================
  {
    id: 'contradictory-dairy-free-has-whey',
    category: 'contradictory',
    allergen: 'milk',
    product: { name: 'Dairy-Free Energy Bar', description: 'Certified dairy-free', ingredients: ['oats', 'whey protein', 'honey', 'cocoa'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Claims dairy-free but lists whey'
  },
  {
    id: 'contradictory-gluten-free-has-wheat',
    category: 'contradictory',
    allergen: 'gluten',
    product: { name: 'Gluten-Free Cracker', description: 'Crispy gluten-free snacks', ingredients: ['wheat flour', 'rice flour', 'salt', 'oil'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Claims gluten-free but lists wheat flour'
  },
  {
    id: 'contradictory-peanut-free-has-peanuts',
    category: 'contradictory',
    allergen: 'peanut',
    product: { name: 'Peanut-Free Trail Bar', description: '100% peanut-free facility', ingredients: ['oats', 'peanuts', 'cranberries', 'sugar'] },
    profile: { allergies: ['peanut'] },
    expected: 'UNSAFE',
    notes: 'Claims peanut-free but contains peanuts'
  },
  {
    id: 'contradictory-egg-free-has-albumin',
    category: 'contradictory',
    allergen: 'egg',
    product: { name: 'Egg-Free Cookies', description: 'Pure egg-free recipe', ingredients: ['flour', 'sugar', 'albumin', 'butter'] },
    profile: { allergies: ['egg'] },
    expected: 'UNSAFE',
    notes: 'Claims egg-free but lists albumin'
  },
  {
    id: 'contradictory-vegan-has-gelatin',
    category: 'contradictory',
    allergen: 'animal products',
    product: { name: 'Vegan Gummies', description: 'Plant-based fruit snacks', ingredients: ['glucose syrup', 'sugar', 'gelatin', 'citric acid'] },
    profile: { dietaryRestrictions: ['vegan'] },
    expected: 'CAUTION',
    notes: 'Claims vegan but contains gelatin'
  },
  {
    id: 'contradictory-vegan-has-milk',
    category: 'contradictory',
    allergen: 'dairy',
    product: { name: 'Vegan Truffles', description: 'Artisan vegan treat', ingredients: ['cocoa', 'cane sugar', 'whole milk', 'vanilla'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Claims vegan but lists milk for dairy allergic user'
  },

  // ==========================================
  // 5. PLANT-BASED MILK EXCLUSIONS (Safe for Dairy)
  // ==========================================
  {
    id: 'plant-milk-almond',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Pure Almond Milk', ingredients: ['filtered water', 'almond milk', 'calcium carbonate', 'sea salt'] },
    profile: { allergies: ['dairy'] },
    expected: 'SAFE',
    notes: 'Almond milk is plant-based, safe for dairy allergic user'
  },
  {
    id: 'plant-milk-oat',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Barista Oat Milk', ingredients: ['oat milk base', 'water', 'rapeseed oil', 'dipotassium phosphate'] },
    profile: { allergies: ['milk'] },
    expected: 'SAFE',
    notes: 'Oat milk is plant-based, safe for dairy'
  },
  {
    id: 'plant-milk-coconut',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Organic Coconut Milk', ingredients: ['coconut milk', 'water', 'guar gum'] },
    profile: { allergies: ['dairy'] },
    expected: 'SAFE',
    notes: 'Coconut milk is plant-based, safe for dairy'
  },
  {
    id: 'plant-milk-soy',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Soy Milk Original', ingredients: ['filtered water', 'organic whole soybeans', 'sea salt'] },
    profile: { allergies: ['dairy'] },
    expected: 'SAFE',
    notes: 'Soy milk does not contain cow dairy'
  },
  {
    id: 'plant-milk-cashew',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Creamy Cashew Milk', ingredients: ['cashew milk', 'sea salt', 'sunflower lecithin'] },
    profile: { allergies: ['dairy'] },
    expected: 'SAFE',
    notes: 'Cashew milk is dairy-free'
  },
  {
    id: 'plant-milk-mixed-with-real-dairy',
    category: 'plant-milk',
    allergen: 'milk',
    product: { name: 'Almond Milk Latte Blend', ingredients: ['almond milk', 'nonfat milk', 'sugar', 'coffee'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Contains almond milk AND real nonfat milk'
  },

  // ==========================================
  // 6. VEGAN & VEGETARIAN DIETARY RESTRICTIONS
  // ==========================================
  {
    id: 'diet-vegetarian-meat-pork',
    category: 'diet',
    product: { name: 'Pork Sausage Roll', ingredients: ['pork', 'wheat flour', 'water', 'salt', 'pepper'] },
    profile: { dietaryRestrictions: ['vegetarian'] },
    expected: 'CAUTION',
    notes: 'Pork violates vegetarian diet'
  },
  {
    id: 'diet-vegetarian-gelatin',
    category: 'diet',
    product: { name: 'Fruit Jelly Candy', ingredients: ['sugar', 'water', 'gelatin', 'natural flavours'] },
    profile: { dietaryRestrictions: ['vegetarian'] },
    expected: 'CAUTION',
    notes: 'Animal gelatin violates vegetarian'
  },
  {
    id: 'diet-vegetarian-rennet',
    category: 'diet',
    product: { name: 'Parmigiano Reggiano', ingredients: ['cow milk', 'salt', 'animal rennet'] },
    profile: { dietaryRestrictions: ['vegetarian'] },
    expected: 'CAUTION',
    notes: 'Animal rennet conflicts with vegetarian'
  },
  {
    id: 'diet-vegetarian-microbial-rennet-safe',
    category: 'diet',
    product: { name: 'Vegetarian Cheddar', ingredients: ['pasteurized milk', 'salt', 'microbial rennet', 'cultures'] },
    profile: { dietaryRestrictions: ['vegetarian'] },
    expected: 'SAFE',
    notes: 'Microbial rennet is vegetarian safe'
  },
  {
    id: 'diet-vegan-dairy-cream',
    category: 'diet',
    product: { name: 'Cream of Mushroom Soup', ingredients: ['water', 'mushrooms', 'heavy cream', 'butter', 'salt'] },
    profile: { dietaryRestrictions: ['vegan'] },
    expected: 'CAUTION',
    notes: 'Heavy cream and butter violate vegan diet'
  },
  {
    id: 'diet-vegan-honey',
    category: 'diet',
    product: { name: 'Honey Roasted Nuts', ingredients: ['almonds', 'pure honey', 'sugar', 'sea salt'] },
    profile: { dietaryRestrictions: ['vegan'] },
    expected: 'CAUTION',
    notes: 'Honey conflicts with strict vegan diet'
  },
  {
    id: 'diet-vegan-tofu-stir-fry-safe',
    category: 'diet',
    product: { name: 'Tofu Veggie Bowl', ingredients: ['brown rice', 'organic tofu', 'broccoli', 'tamari', 'sesame oil'] },
    profile: { dietaryRestrictions: ['vegan'] },
    expected: 'SAFE',
    notes: 'Pure plant ingredients fit vegan diet'
  },

  // ==========================================
  // 7. HALAL & JAIN RESTRICTIONS
  // ==========================================
  {
    id: 'diet-halal-pork',
    category: 'halal',
    product: { name: 'Bacon Wrapped Dates', ingredients: ['dates', 'pork bacon', 'brown sugar'] },
    profile: { dietaryRestrictions: ['halal'] },
    expected: 'CAUTION',
    notes: 'Pork conflicts with halal diet'
  },
  {
    id: 'diet-halal-alcohol',
    category: 'halal',
    product: { name: 'White Wine Marinade', ingredients: ['white wine', 'olive oil', 'garlic', 'oregano'] },
    profile: { dietaryRestrictions: ['halal'] },
    expected: 'CAUTION',
    notes: 'Alcohol conflicts with halal diet'
  },
  {
    id: 'diet-halal-chicken-safe',
    category: 'halal',
    product: { name: 'Halal Certified Grilled Chicken', ingredients: ['chicken breast', 'water', 'salt', 'spices'], safetyInfo: { certifications: ['Halal'] } },
    profile: { dietaryRestrictions: ['halal'] },
    expected: 'SAFE',
    notes: 'Halal certified chicken'
  },
  {
    id: 'diet-jain-root-onion',
    category: 'jain',
    product: { name: 'Tomato Onion Curry', ingredients: ['tomatoes', 'diced onion', 'cumin', 'turmeric', 'salt'] },
    profile: { dietaryRestrictions: ['jain'] },
    expected: 'CAUTION',
    notes: 'Onion is a root vegetable, strictly prohibited in Jain diet'
  },
  {
    id: 'diet-jain-root-garlic',
    category: 'jain',
    product: { name: 'Garlic Bread Spread', ingredients: ['butter', 'crushed garlic', 'parsley', 'salt'] },
    profile: { dietaryRestrictions: ['jain'] },
    expected: 'CAUTION',
    notes: 'Garlic is prohibited in Jain diet'
  },
  {
    id: 'diet-jain-root-potato',
    category: 'jain',
    product: { name: 'Aloo Bhujia Snack', ingredients: ['gram flour', 'potatoes', 'spices', 'peanut oil'] },
    profile: { dietaryRestrictions: ['jain'] },
    expected: 'CAUTION',
    notes: 'Potatoes (aloo) violate Jain diet'
  },
  {
    id: 'diet-jain-safe-paneer-curry',
    category: 'jain',
    product: { name: 'Jain Paneer Curry', ingredients: ['paneer', 'tomato puree', 'spices', 'coriander', 'cream'], safetyInfo: { certifications: ['Jain'] } },
    profile: { dietaryRestrictions: ['jain'] },
    expected: 'SAFE',
    notes: 'No root vegetables; certified Jain'
  },

  // ==========================================
  // 8. MEDICATION INTERACTIONS
  // ==========================================
  {
    id: 'med-warfarin-vitamin-k-spinach',
    category: 'medication',
    product: { name: 'Spinach Pasta Salad', ingredients: ['pasta', 'fresh spinach', 'olive oil', 'cherry tomatoes'] },
    profile: { medications: ['warfarin'] },
    expected: 'CAUTION',
    notes: 'Spinach is high in vitamin K, interacting with blood-thinners'
  },
  {
    id: 'med-warfarin-vitamin-k-kale',
    category: 'medication',
    product: { name: 'Green Smoothie', ingredients: ['apple juice', 'kale', 'banana', 'chia seeds'] },
    profile: { medications: ['coumadin'] },
    expected: 'CAUTION',
    notes: 'Kale is high vitamin K for Coumadin user'
  },
  {
    id: 'med-warfarin-broccoli',
    category: 'medication',
    product: { name: 'Steamed Broccoli Bowl', ingredients: ['broccoli', 'olive oil', 'garlic', 'sea salt'] },
    profile: { medications: ['warfarin'] },
    expected: 'CAUTION',
    notes: 'Broccoli contains significant vitamin K'
  },
  {
    id: 'med-maoi-aged-cheese',
    category: 'medication',
    product: { name: 'Aged Gouda Board', ingredients: ['aged cheese', 'salt', 'cultures'] },
    profile: { medications: ['selegiline'] },
    expected: 'UNSAFE',
    notes: 'Aged cheese contains high tyramine, hypertensive crisis risk with MAOIs'
  },
  {
    id: 'med-maoi-salami',
    category: 'medication',
    product: { name: 'Cured Italian Salami', ingredients: ['pork', 'salt', 'cured meat cultures', 'spices'] },
    profile: { medications: ['phenelzine'] },
    expected: 'UNSAFE',
    notes: 'Cured meat high in tyramine with MAOI'
  },
  {
    id: 'med-maoi-tyramine',
    category: 'medication',
    product: { name: 'Traditional Kimchi', ingredients: ['cabbage', 'radish', 'fermented seasoning', 'tyramine', 'chili'] },
    profile: { medications: ['isocarboxazid'] },
    expected: 'UNSAFE',
    notes: 'Fermented foods and tyramine with MAOI'
  },
  {
    id: 'med-statin-grapefruit',
    category: 'medication',
    product: { name: 'Ruby Red Grapefruit Juice', ingredients: ['100% pure grapefruit juice'] },
    profile: { medications: ['atorvastatin'] },
    expected: 'UNSAFE',
    notes: 'Grapefruit dangerously elevates statin blood levels'
  },
  {
    id: 'med-statin-pomelo',
    category: 'medication',
    product: { name: 'Citrus Medley Salad', ingredients: ['pomelo segments', 'lettuce', 'lime dressing'] },
    profile: { medications: ['lipitor'] },
    expected: 'UNSAFE',
    notes: 'Pomelo contains furanocoumarins like grapefruit'
  },
  {
    id: 'med-statin-orange-juice-safe',
    category: 'medication',
    product: { name: 'Pure Orange Juice', ingredients: ['100% pasteurized orange juice'] },
    profile: { medications: ['atorvastatin'] },
    expected: 'SAFE',
    notes: 'Orange juice does not inhibit CYP3A4 like grapefruit'
  },

  // ==========================================
  // 9. MISSING, EMPTY & UNREADABLE DATA (FAIL-CLOSED)
  // ==========================================
  {
    id: 'missing-data-empty-object',
    category: 'missing',
    product: {},
    profile: { allergies: ['peanut'] },
    expected: 'CANNOT_VERIFY',
    notes: 'Empty product record must fail-closed'
  },
  {
    id: 'missing-data-no-ingredients-with-allergy',
    category: 'missing',
    product: { name: 'Mystery Baked Good', barcode: '8901234567890', ingredients: [] },
    profile: { allergies: ['dairy'] },
    expected: 'CANNOT_VERIFY',
    notes: 'No ingredient list present when user has declared allergy'
  },
  {
    id: 'missing-data-unavailable-phrase',
    category: 'missing',
    product: { name: 'Imported Snack Box', ingredients: ['ingredients unavailable at this time'] },
    profile: { allergies: ['gluten'] },
    expected: 'CANNOT_VERIFY',
    notes: 'Explicit ingredients unavailable phrase'
  },
  {
    id: 'ocr-failed-status-flag',
    category: 'ocr',
    product: { name: 'Cereal Package', ocrStatus: 'failed', ingredients: [] },
    profile: { allergies: ['wheat'] },
    expected: 'CANNOT_VERIFY',
    notes: 'ocrStatus failed must yield CANNOT_VERIFY'
  },
  {
    id: 'ocr-low-confidence',
    category: 'ocr',
    product: { name: 'Faded Label Sauce', extractionConfidence: 0.25, ingredients: ['w?ter', 's?lt'] },
    profile: { allergies: ['soy'] },
    expected: 'CANNOT_VERIFY',
    notes: 'Extraction confidence below 0.4 threshold'
  },
  {
    id: 'ocr-blurry-image-tag',
    category: 'ocr',
    product: { name: 'Photo Scan', description: 'blurry label image captured in low light', ingredients: [] },
    profile: { allergies: ['egg'] },
    expected: 'CANNOT_VERIFY',
    notes: 'Blurry label text tag'
  },
  {
    id: 'ocr-unreadable-pattern',
    category: 'ocr',
    product: { name: 'Damaged Packaging', ingredients: ['*** unreadable ***'] },
    profile: { allergies: ['peanut'] },
    expected: 'CANNOT_VERIFY',
    notes: 'Unreadable ingredient token'
  },

  // ==========================================
  // 10. INDIAN INGREDIENTS
  // ==========================================
  {
    id: 'indian-dairy-paneer',
    category: 'indian',
    allergen: 'dairy',
    product: { name: 'Matar Paneer', ingredients: ['green peas', 'fresh paneer', 'tomatoes', 'spices'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Paneer is Indian cottage cheese (dairy)'
  },
  {
    id: 'indian-dairy-dahi',
    category: 'indian',
    allergen: 'dairy',
    product: { name: 'Boondi Raita', ingredients: ['dahi', 'chickpea pearls', 'cumin', 'black salt'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Dahi is Indian curd/yogurt (dairy)'
  },
  {
    id: 'indian-dairy-khoa',
    category: 'indian',
    allergen: 'dairy',
    product: { name: 'Gulab Jamun', ingredients: ['khoa', 'maida', 'sugar syrup', 'rose water', 'ghee'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'Khoa/khoya is dried evaporated milk solids'
  },
  {
    id: 'indian-dairy-malai',
    category: 'indian',
    allergen: 'dairy',
    product: { name: 'Malai Kofta', ingredients: ['potatoes', 'paneer', 'cashews', 'malai', 'gravy'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'Malai is clotted milk cream'
  },
  {
    id: 'indian-peanuts-moongphali',
    category: 'indian',
    allergen: 'peanut',
    product: { name: 'Chana Moongphali Chikki', ingredients: ['jaggery', 'roasted moongphali', 'cardamom'] },
    profile: { allergies: ['peanuts'] },
    expected: 'UNSAFE',
    notes: 'Moongphali is Hindi for peanuts'
  },
  {
    id: 'indian-tree-nut-kaju',
    category: 'indian',
    allergen: 'tree nuts',
    product: { name: 'Kaju Katli Sweet', ingredients: ['kaju', 'sugar', 'silver leaf', 'water'] },
    profile: { allergies: ['cashews'] },
    expected: 'UNSAFE',
    notes: 'Kaju is Hindi for cashew nuts'
  },
  {
    id: 'indian-tree-nut-badam',
    category: 'indian',
    allergen: 'tree nuts',
    product: { name: 'Badam Milk Beverage', ingredients: ['water', 'badam', 'sugar', 'saffron'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Badam is Hindi for almond'
  },
  {
    id: 'indian-tree-nut-pista',
    category: 'indian',
    allergen: 'tree nuts',
    product: { name: 'Pista Kulfi', ingredients: ['milk', 'sugar', 'pista', 'cardamom'] },
    profile: { allergies: ['tree nuts'] },
    expected: 'UNSAFE',
    notes: 'Pista is Hindi for pistachio'
  },
  {
    id: 'indian-gluten-atta',
    category: 'indian',
    allergen: 'gluten',
    product: { name: 'Chakki Fresh Atta', ingredients: ['whole wheat atta'] },
    profile: { allergies: ['wheat'] },
    expected: 'UNSAFE',
    notes: 'Atta is stone-ground whole wheat flour'
  },
  {
    id: 'indian-gluten-maida',
    category: 'indian',
    allergen: 'gluten',
    product: { name: 'Naan Bread', ingredients: ['refined maida', 'yeast', 'yogurt', 'butter'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Maida is refined wheat flour'
  },
  {
    id: 'indian-gluten-suji',
    category: 'indian',
    allergen: 'gluten',
    product: { name: 'Rava Upma Mix', ingredients: ['wheat suji', 'oil', 'mustard seeds', 'curry leaves'] },
    profile: { allergies: ['gluten'] },
    expected: 'UNSAFE',
    notes: 'Suji / rava is granulated wheat semolina'
  },
  {
    id: 'indian-mustard-sarson',
    category: 'indian',
    allergen: 'mustard',
    product: { name: 'Sarson ka Saag', ingredients: ['sarson leaves', 'spinach', 'cornmeal', 'ginger', 'ghee'] },
    profile: { allergies: ['mustard'] },
    expected: 'UNSAFE',
    notes: 'Sarson is mustard greens / mustard plant'
  },
  {
    id: 'indian-sesame-til',
    category: 'indian',
    allergen: 'sesame',
    product: { name: 'Til Gud Ladoo', ingredients: ['white til', 'jaggery', 'ghee'] },
    profile: { allergies: ['sesame'] },
    expected: 'UNSAFE',
    notes: 'Til is Hindi for sesame seeds'
  },

  // ==========================================
  // 11. INS ADDITIVES (E-Numbers)
  // ==========================================
  {
    id: 'ins-220-sulphites',
    category: 'ins',
    allergen: 'sulphites',
    product: { name: 'Canned Fruit Cocktail', ingredients: ['peaches', 'pears', 'water', 'sugar', 'preservative (ins 220)'] },
    profile: { allergies: ['sulphites'] },
    expected: 'UNSAFE',
    notes: 'INS 220 is sulfur dioxide / sulphites'
  },
  {
    id: 'ins-223-metabisulphite',
    category: 'ins',
    allergen: 'sulphites',
    product: { name: 'Potato Crisps', ingredients: ['potatoes', 'palm oil', 'preservative (ins 223)', 'salt'] },
    profile: { allergies: ['sulphites'] },
    expected: 'UNSAFE',
    notes: 'INS 223 is sodium metabisulphite'
  },
  {
    id: 'ins-102-tartrazine-clean',
    category: 'ins',
    product: { name: 'Carbonated Lemon Soda', ingredients: ['carbonated water', 'sugar', 'citric acid', 'colour (ins 102)'] },
    profile: { allergies: ['peanuts'] },
    expected: 'SAFE',
    notes: 'Tartrazine colour does not trigger peanut allergy'
  },
  {
    id: 'ins-330-citric-acid-clean',
    category: 'ins',
    product: { name: 'Sparkling Water', ingredients: ['purified water', 'citric acid (ins 330)', 'natural lemon flavor'] },
    profile: { allergies: ['dairy'] },
    expected: 'SAFE',
    notes: 'INS 330 is standard citric acid'
  },
  {
    id: 'ins-300-ascorbic-acid-clean',
    category: 'ins',
    product: { name: 'Apple Juice Blend', ingredients: ['apple juice concentrate', 'water', 'antioxidant (ins 300)'] },
    profile: { allergies: ['soy'] },
    expected: 'SAFE',
    notes: 'INS 300 is vitamin C'
  },

  // ==========================================
  // 12. OCR NOISE & CHARACTER SUBSTITUTIONS
  // ==========================================
  {
    id: 'ocr-noise-milk-m1lk',
    category: 'ocr-noise',
    allergen: 'milk',
    product: { name: 'Noisy Label Cookie', ingredients: ['wh3at flour', 'm1lk solids', 'sugar', 'canola oil'] },
    profile: { allergies: ['milk'] },
    expected: 'UNSAFE',
    notes: 'm1lk OCR noise normalized to milk'
  },
  {
    id: 'ocr-noise-whey-wh3y',
    category: 'ocr-noise',
    allergen: 'milk',
    product: { name: 'OCR Workout Protein', ingredients: ['wh3y isolate', 'natural cocoa', 'stevia'] },
    profile: { allergies: ['dairy'] },
    expected: 'UNSAFE',
    notes: 'wh3y OCR noise normalized to whey'
  },
  {
    id: 'ocr-noise-peanut-pe@nut',
    category: 'ocr-noise',
    allergen: 'peanut',
    product: { name: 'Roasted Nut Bar', ingredients: ['pe@nuts', 'honey', 'oats', 'sea salt'] },
    profile: { allergies: ['peanuts'] },
    expected: 'UNSAFE',
    notes: 'pe@nuts normalized to peanuts'
  },
  {
    id: 'ocr-noise-soy-$oy',
    category: 'ocr-noise',
    allergen: 'soy',
    product: { name: 'Vegetable Dumpling', ingredients: ['$oybean oil', 'cabbage', 'flour', 'ginger'] },
    profile: { allergies: ['soy'] },
    expected: 'UNSAFE',
    notes: '$oybean normalized to soybean'
  },

  // ==========================================
  // 13. BENCHMARK CLEAN CONTROLS (SAFE)
  // ==========================================
  {
    id: 'safe-benchmark-jasmine-rice',
    category: 'safe-control',
    product: { name: 'Organic Jasmine Rice', ingredients: ['100% whole grain jasmine brown rice'], safetyInfo: { allergens: [] } },
    profile: { allergies: ['peanut', 'tree nuts', 'dairy', 'egg'] },
    expected: 'SAFE',
    notes: 'Plain jasmine rice has zero allergens'
  },
  {
    id: 'safe-benchmark-rolled-oats',
    category: 'safe-control',
    product: { name: 'Pure Rolled Oats', ingredients: ['100% whole grain rolled oats'], safetyInfo: { allergens: [] } },
    profile: { allergies: ['dairy', 'peanuts', 'shellfish'] },
    expected: 'SAFE',
    notes: 'Pure rolled oats for non-gluten allergic user'
  },
  {
    id: 'safe-benchmark-olive-oil',
    category: 'safe-control',
    product: { name: 'Extra Virgin Olive Oil', ingredients: ['cold pressed extra virgin olive oil'] },
    profile: { allergies: ['milk', 'egg', 'soy', 'peanut'] },
    expected: 'SAFE',
    notes: 'Pure olive oil is allergen free'
  },
  {
    id: 'safe-benchmark-bottled-water',
    category: 'safe-control',
    product: { name: 'Natural Spring Water', ingredients: ['natural spring water'] },
    profile: { allergies: ['peanut', 'tree nuts', 'dairy', 'egg', 'fish', 'shellfish', 'gluten', 'soy'] },
    expected: 'SAFE',
    notes: 'Pure spring water'
  },
  {
    id: 'safe-benchmark-fresh-apple',
    category: 'safe-control',
    product: { name: 'Crisp Red Apples', ingredients: ['fresh apples'] },
    profile: { allergies: ['dairy', 'peanut'] },
    expected: 'SAFE',
    notes: 'Fresh fruit'
  },
  {
    id: 'safe-benchmark-sea-salt',
    category: 'safe-control',
    product: { name: 'Pure Sea Salt', ingredients: ['coarse sea salt'] },
    profile: { allergies: ['dairy', 'peanut', 'gluten'] },
    expected: 'SAFE',
    notes: 'Pure sea salt'
  },
  {
    id: 'safe-benchmark-black-pepper',
    category: 'safe-control',
    product: { name: 'Ground Black Pepper', ingredients: ['pure ground black peppercorns'] },
    profile: { allergies: ['peanuts', 'tree nuts'] },
    expected: 'SAFE',
    notes: 'Pure black pepper'
  },
  {
    id: 'safe-benchmark-green-tea',
    category: 'safe-control',
    product: { name: 'Organic Green Tea', ingredients: ['organic green tea leaves'] },
    profile: { allergies: ['dairy', 'eggs', 'soy'] },
    expected: 'SAFE',
    notes: 'Pure green tea'
  }
];

// Replicate systematic variants to reach > 160 comprehensive cases
const additionalCases = [];

// Expand across all major tree nuts individually
const treeNuts = [
  { name: 'Walnut', id: 'walnut', term: 'walnuts' },
  { name: 'Pecan', id: 'pecan', term: 'pecans' },
  { name: 'Cashew', id: 'cashew', term: 'cashew nuts' },
  { name: 'Pistachio', id: 'pistachio', term: 'pistachios' },
  { name: 'Hazelnut', id: 'hazelnut', term: 'roasted hazelnuts' },
  { name: 'Macadamia', id: 'macadamia', term: 'macadamia nuts' },
  { name: 'Brazil Nut', id: 'brazilnut', term: 'brazil nuts' },
  { name: 'Pine Nut', id: 'pinenut', term: 'pine nuts' },
  { name: 'Chestnut', id: 'chestnut', term: 'water chestnuts' }
];

treeNuts.forEach((nut, i) => {
  additionalCases.push({
    id: `allergen-tree-nut-variant-${nut.id}`,
    category: 'allergen',
    allergen: 'tree nuts',
    product: {
      name: nut.id === 'chestnut' ? 'Water Chestnut Snack Bar' : `${nut.name} Snack Bar`,
      ingredients: ['oats', nut.term, 'brown rice syrup', 'sea salt']
    },
    profile: { allergies: ['tree nuts'] },
    expected: nut.id === 'chestnut' ? 'SAFE' : 'UNSAFE', // water chestnuts are aquatic tubers, not true nuts
    notes: `Variant test for ${nut.name}`
  });
});

// Expand seafood & fish
const fishSpecies = ['Salmon', 'Cod', 'Halibut', 'Trout', 'Mackerel', 'Sardines', 'Haddock'];
fishSpecies.forEach((fish) => {
  additionalCases.push({
    id: `allergen-fish-species-${fish.toLowerCase()}`,
    category: 'allergen',
    allergen: 'fish',
    product: { name: `Pan-Seared ${fish}`, ingredients: [`wild ${fish.toLowerCase()}`, 'olive oil', 'lemon', 'salt'] },
    profile: { allergies: ['fish'] },
    expected: 'UNSAFE',
    notes: `Fish species match: ${fish}`
  });
});

// Expand Shellfish & Molluscs
const shellfishSpecies = ['Lobster', 'Prawn', 'King Crab', 'Crawfish', 'Scallops', 'Oysters', 'Mussels'];
shellfishSpecies.forEach((sh) => {
  additionalCases.push({
    id: `allergen-shellfish-species-${sh.toLowerCase().replace(/\s+/g, '-')}`,
    category: 'allergen',
    allergen: 'shellfish',
    product: { name: `Gourmet ${sh} Stew`, ingredients: [sh.toLowerCase(), 'fish broth', 'onions', 'garlic', 'salt'] },
    profile: { allergies: ['shellfish'] },
    expected: 'UNSAFE',
    notes: `Shellfish species match: ${sh}`
  });
});

// Add diverse combinations to reach 170+ total cases
const combined = [...cases, ...additionalCases];

// Add 50 systematic realistic pantry benchmark products
const basicPantry = [
  { name: 'Basmati Rice', ing: ['aged basmati rice'], userAllergy: ['peanuts', 'milk'], exp: 'SAFE' },
  { name: 'Brown Lentils', ing: ['whole brown lentils'], userAllergy: ['peanuts', 'dairy'], exp: 'SAFE' },
  { name: 'Chickpeas', ing: ['chickpeas', 'water', 'salt'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Kidney Beans', ing: ['red kidney beans', 'water', 'salt'], userAllergy: ['eggs'], exp: 'SAFE' },
  { name: 'Black Beans', ing: ['black beans', 'sea salt'], userAllergy: ['soy'], exp: 'SAFE' },
  { name: 'Quinoa', ing: ['organic white quinoa'], userAllergy: ['gluten'], exp: 'SAFE' },
  { name: 'Chia Seeds', ing: ['raw chia seeds'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Flax Seeds', ing: ['ground golden flaxseed'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Pumpkin Seeds', ing: ['pepitas pumpkin seeds', 'sea salt'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Sunflower Seeds', ing: ['roasted sunflower seeds'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Canola Oil', ing: ['expeller pressed canola oil'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Coconut Oil', ing: ['virgin coconut oil'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Avocado Oil', ing: ['pure avocado oil'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Balsamic Vinegar', ing: ['grape must', 'wine vinegar'], userAllergy: ['milk'], exp: 'SAFE' },
  { name: 'Apple Cider Vinegar', ing: ['raw unfiltered apple cider vinegar'], userAllergy: ['soy'], exp: 'SAFE' },
  { name: 'Maple Syrup', ing: ['100% pure grade A maple syrup'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Cane Sugar', ing: ['pure cane sugar'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Cocoa Powder', ing: ['unsweetened 100% cocoa powder'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Ground Cinnamon', ing: ['pure ceylon cinnamon'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Turmeric Powder', ing: ['ground turmeric root'], userAllergy: ['eggs'], exp: 'SAFE' },
  { name: 'Cumin Seeds', ing: ['whole cumin seeds'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Coriander Seeds', ing: ['whole coriander seeds'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Cardamom Pods', ing: ['green cardamom pods'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Cloves', ing: ['whole cloves'], userAllergy: ['milk'], exp: 'SAFE' },
  { name: 'Nutmeg', ing: ['ground nutmeg'], userAllergy: ['peanuts'], exp: 'SAFE' }, // nutmeg is a seed, not a tree nut
  { name: 'Bay Leaves', ing: ['dried bay leaves'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Rosemary', ing: ['dried rosemary leaves'], userAllergy: ['soy'], exp: 'SAFE' },
  { name: 'Thyme', ing: ['dried thyme'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Oregano', ing: ['dried oregano'], userAllergy: ['eggs'], exp: 'SAFE' },
  { name: 'Basil', ing: ['dried sweet basil'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Ginger Root', ing: ['fresh ginger root'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Garlic Cloves', ing: ['fresh peeled garlic'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Yellow Onion', ing: ['fresh yellow onions'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Red Tomatoes', ing: ['fresh vine ripened tomatoes'], userAllergy: ['milk'], exp: 'SAFE' },
  { name: 'Carrots', ing: ['organic baby carrots'], userAllergy: ['soy'], exp: 'SAFE' },
  { name: 'Cucumbers', ing: ['english cucumbers'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Zucchini', ing: ['fresh green zucchini'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Bell Peppers', ing: ['sweet red bell peppers'], userAllergy: ['eggs'], exp: 'SAFE' },
  { name: 'Cauliflower', ing: ['fresh cauliflower florets'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Green Beans', ing: ['fresh stringless green beans'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Sweet Potatoes', ing: ['fresh sweet potatoes'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Russet Potatoes', ing: ['fresh russet potatoes'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Bananas', ing: ['fresh yellow bananas'], userAllergy: ['milk'], exp: 'SAFE' },
  { name: 'Strawberries', ing: ['fresh organic strawberries'], userAllergy: ['tree nuts'], exp: 'SAFE' },
  { name: 'Blueberries', ing: ['fresh wild blueberries'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Raspberries', ing: ['fresh red raspberries'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Oranges', ing: ['fresh valencia oranges'], userAllergy: ['soy'], exp: 'SAFE' },
  { name: 'Lemons', ing: ['fresh yellow lemons'], userAllergy: ['peanuts'], exp: 'SAFE' },
  { name: 'Limes', ing: ['fresh green limes'], userAllergy: ['dairy'], exp: 'SAFE' },
  { name: 'Pineapple', ing: ['fresh golden pineapple'], userAllergy: ['tree nuts'], exp: 'SAFE' }
];

basicPantry.forEach((p, idx) => {
  combined.push({
    id: `safe-pantry-benchmark-${idx + 1}`,
    category: 'safe-control',
    product: { name: p.name, ingredients: p.ing },
    profile: { allergies: p.userAllergy },
    expected: p.exp,
    notes: `Pantry benchmark item ${p.name}`
  });
});

console.log(`Generated ${combined.length} cases.`);
const targetPath = path.join(__dirname, '..', 'tests', 'eval', 'cases.json');
fs.writeFileSync(targetPath, JSON.stringify(combined, null, 2), 'utf8');
console.log(`Wrote to ${targetPath}`);
