// Sample data used by the UI. Replace with API responses (see src/api/index.js).
// Figures are illustrative, not medical recommendations.

export const profile = {
  name: 'Parul',
  allergies: ['Peanut'],
  medications: ['Statin'],
};

export const nutrition = {
  calories: { value: 1250, goal: 2000 },
  macros: [
    { name: 'Protein', value: 45, goal: 80, unit: 'g' },
    { name: 'Carbohydrates', value: 150, goal: 250, unit: 'g' },
    { name: 'Fat', value: 40, goal: 65, unit: 'g' },
    { name: 'Fiber', value: 18, goal: 30, unit: 'g' },
  ],
};

export const todayMeals = [
  { name: 'Breakfast', items: 'Oats + banana', kcal: '380', logged: true },
  { name: 'Lunch', items: 'Dal + rice + salad', kcal: '620', logged: true },
  { name: 'Evening snack', items: 'Almonds', kcal: '250', logged: true },
  { name: 'Dinner', items: 'Roti + paneer bhurji', kcal: '450 est.', logged: false },
];

// Thu..Tue, then today (Wed)
export const streakWeek = [
  { l: 'T', state: 'miss' },
  { l: 'F', state: 'done' },
  { l: 'S', state: 'done' },
  { l: 'S', state: 'done' },
  { l: 'M', state: 'done' },
  { l: 'T', state: 'done' },
  { l: 'W', state: 'today' },
];

export const products = [
  {
    id: 'choc',
    name: 'Dark chocolate bar',
    verdict: 'CAUTION',
    head: 'Potential allergen exposure',
    trigger: 'May contain traces of peanuts',
    confidence: 'High',
    why: 'Your profile lists a peanut allergy. Peanuts are not an ingredient, but the label carries a precautionary statement, so the rules engine flags possible exposure.',
    source: 'Label statement checked by the rules engine',
    todo: 'Choose a product without a peanut statement, or ask your clinician if you are unsure.',
    ingredients: [
      { t: 'Cocoa powder' },
      { t: 'Milk solids' },
      { t: 'Sugar' },
      { t: 'Emulsifier' },
      { t: 'May contain traces of peanuts', flag: true },
    ],
  },
  {
    id: 'juice',
    name: 'Grapefruit juice',
    verdict: 'CAUTION',
    head: 'Possible medication interaction',
    trigger: 'Grapefruit',
    confidence: 'High',
    why: 'Grapefruit can interact with certain statins. Your profile lists a statin, so this product is flagged for review.',
    source: 'Curated interaction record based on openFDA and NIH ODS',
    todo: 'Ask your pharmacist whether grapefruit is suitable with your medication.',
    ingredients: [{ t: 'Grapefruit juice', flag: true }, { t: 'Vitamin C' }],
  },
  {
    id: 'pbutter',
    name: 'Peanut butter crunch',
    verdict: 'UNSAFE',
    head: 'Contains a listed allergen',
    trigger: 'Roasted peanuts',
    confidence: 'High',
    why: 'Peanuts are listed as an ingredient and match the peanut allergy in your profile.',
    source: 'Ingredient list checked by the rules engine',
    todo: 'Avoid this product.',
    ingredients: [{ t: 'Roasted peanuts', flag: true }, { t: 'Salt' }, { t: 'Vegetable oil' }],
  },
  {
    id: 'biscuit',
    name: 'Oat and jaggery biscuits',
    verdict: 'SAFE',
    head: 'No conflicts with your profile',
    trigger: 'Nothing found',
    confidence: 'High',
    why: 'No ingredient or label statement matches your allergies, restrictions or medications.',
    source: 'Ingredient list checked by the rules engine',
    todo: 'Fine to eat. Check the serving size against your daily goals.',
    ingredients: [{ t: 'Oats' }, { t: 'Jaggery' }, { t: 'Wheat flour' }, { t: 'Butter' }, { t: 'Baking soda' }],
  },
];

export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const initialPlan = [
  ['Oats', 'Dal rice', 'Paneer roti'],
  ['Poha', 'Rajma rice', 'Vegetable pulao'],
  ['Besan chilla', 'Chole rice', 'Dal roti'],
  ['Upma', 'Paneer rice', 'Roti sabzi'],
  ['Paratha', 'Dal roti', 'Khichdi'],
  ['Idli', 'Rajma rice', 'Paneer wrap'],
  ['Dosa', 'Chole roti', 'Vegetable pulao'],
];

export const initialGrocery = [
  { n: 'Oats', q: '500 g', on: true },
  { n: 'Milk', q: '2 litres', on: true },
  { n: 'Paneer', q: '500 g', on: false },
  { n: 'Rice', q: '1 kg', on: false },
  { n: 'Dal', q: '500 g', on: false },
  { n: 'Bananas', q: '7 pieces', on: false },
  { n: 'Curd', q: '500 g', on: false },
];

export const photoItems = [
  { t: '2 chapatis', c: 'High' },
  { t: '1 bowl dal', c: 'High' },
  { t: '1 serving rice', c: 'Medium' },
  { t: '1 bowl salad', c: 'Medium' },
];

// Thu..Tue completed days (ml). Today's value comes from AppContext.
export const hydrationWeek = [
  { d: 'Thu', v: 1800 },
  { d: 'Fri', v: 2500 },
  { d: 'Sat', v: 2700 },
  { d: 'Sun', v: 2500 },
  { d: 'Mon', v: 2600 },
  { d: 'Tue', v: 2500 },
];

export const reminders = [
  { id: 'morning', name: 'Morning', time: '08:00', on: true },
  { id: 'midday', name: 'Midday', time: '13:00', on: true },
  { id: 'evening', name: 'Evening', time: '18:00', on: false },
];

export const scoreCategories = [
  { n: 'Meal logging consistency', w: 30, c: 86 },
  { n: 'Hydration consistency', w: 30, c: 83 },
  { n: 'Personal nutrition goals', w: 30, c: 70 },
  { n: 'Wellness habits', w: 10, c: 60 },
];

export const streaks = [
  { name: 'Meal streak', note: 'Consistent meal logging', days: '6 days', icon: 'utensils' },
  { name: 'Hydration streak', note: 'Meeting your own goal', days: '5 days', icon: 'drop' },
  { name: 'Wellness streak', note: 'Your selected daily habits', days: '3 days', icon: 'flame' },
];

export const achievements = [
  { name: 'First Meal Logged', note: 'Unlocked', on: true, icon: 'check' },
  { name: 'Hydration Hero', note: 'Unlocked', on: true, icon: 'drop' },
  { name: 'Healthy Habits Starter', note: 'Unlocked', on: true, icon: 'leaf' },
  { name: '7-Day Consistency', note: '5 of 7 days', on: false, icon: 'flame' },
  { name: 'Balanced Week', note: 'In progress', on: false, icon: 'type' },
  { name: '30-Day Wellness Journey', note: 'Keep going', on: false, icon: 'trophy' },
];

export const weeklyReport = { planned: 21, logged: 18, followed: 15, avgProtein: 65 };

export const aiContext = [
  'Dietary profile',
  'Allergies',
  'Medication interaction rules',
  'Meal history',
  'Nutrition goals',
  'Hydration history',
  'Previously scanned products',
];
