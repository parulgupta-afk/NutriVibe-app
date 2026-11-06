const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const User = require('../src/models/User');
const Dependent = require('../src/models/Dependent');
const Meal = require('../src/models/Meal');
const HydrationLog = require('../src/models/HydrationLog');
const Tracking = require('../src/models/Tracking');
const Reaction = require('../src/models/Reaction');
const DietPlan = require('../src/models/DietPlan');
const NutritionGoal = require('../src/models/NutritionGoal');
const Streak = require('../src/models/Streak');
const ApiKey = require('../src/models/ApiKey');

const { exportMe, deleteMe } = require('../src/controllers/meController');

describe('meController unit tests (GDPR Account Export & Deletion)', () => {
  let mockUserId;
  let mockUser;

  let origUserFindById;
  let origUserFindByIdAndDelete;
  let origDepFind;
  let origDepDeleteMany;
  let origMealFind;
  let origMealDeleteMany;
  let origHydrationFind;
  let origHydrationDeleteMany;
  let origTrackingFind;
  let origTrackingDeleteMany;
  let origReactionFind;
  let origReactionDeleteMany;
  let origDietPlanFind;
  let origDietPlanDeleteMany;
  let origGoalFind;
  let origGoalDeleteMany;
  let origStreakFind;
  let origStreakDeleteMany;
  let origApiKeyFind;
  let origApiKeyDeleteMany;

  beforeEach(() => {
    mockUserId = 'user_abc_123';
    mockUser = {
      _id: mockUserId,
      email: 'test@example.com',
      name: 'Test Subject',
      role: 'user',
      preferences: { allergies: ['peanuts'] },
      password: 'hashed_password_sample',
      comparePassword: async (pwd) => pwd === 'CorrectPass123!',
    };

    origUserFindById = User.findById;
    origUserFindByIdAndDelete = User.findByIdAndDelete;
    origDepFind = Dependent.find;
    origDepDeleteMany = Dependent.deleteMany;
    origMealFind = Meal.find;
    origMealDeleteMany = Meal.deleteMany;
    origHydrationFind = HydrationLog.find;
    origHydrationDeleteMany = HydrationLog.deleteMany;
    origTrackingFind = Tracking.find;
    origTrackingDeleteMany = Tracking.deleteMany;
    origReactionFind = Reaction.find;
    origReactionDeleteMany = Reaction.deleteMany;
    origDietPlanFind = DietPlan.find;
    origDietPlanDeleteMany = DietPlan.deleteMany;
    origGoalFind = NutritionGoal.find;
    origGoalDeleteMany = NutritionGoal.deleteMany;
    origStreakFind = Streak.find;
    origStreakDeleteMany = Streak.deleteMany;
    origApiKeyFind = ApiKey.find;
    origApiKeyDeleteMany = ApiKey.deleteMany;
  });

  afterEach(() => {
    User.findById = origUserFindById;
    User.findByIdAndDelete = origUserFindByIdAndDelete;
    Dependent.find = origDepFind;
    Dependent.deleteMany = origDepDeleteMany;
    Meal.find = origMealFind;
    Meal.deleteMany = origMealDeleteMany;
    HydrationLog.find = origHydrationFind;
    HydrationLog.deleteMany = origHydrationDeleteMany;
    Tracking.find = origTrackingFind;
    Tracking.deleteMany = origTrackingDeleteMany;
    Reaction.find = origReactionFind;
    Reaction.deleteMany = origReactionDeleteMany;
    DietPlan.find = origDietPlanFind;
    DietPlan.deleteMany = origDietPlanDeleteMany;
    NutritionGoal.find = origGoalFind;
    NutritionGoal.deleteMany = origGoalDeleteMany;
    Streak.find = origStreakFind;
    Streak.deleteMany = origStreakDeleteMany;
    ApiKey.find = origApiKeyFind;
    ApiKey.deleteMany = origApiKeyDeleteMany;
  });

  describe('GET /api/me/export', () => {
    it('aggregates all owned records and returns structured export payload', async () => {
      User.findById = () => ({
        select: async () => ({
          _id: mockUserId,
          email: 'test@example.com',
          name: 'Test Subject',
          role: 'user',
          preferences: { allergies: ['peanuts'] },
        }),
      });

      Dependent.find = async () => [{ _id: 'dep1', name: 'Child 1' }];
      Meal.find = async () => [{ _id: 'meal1', mealType: 'lunch' }];
      HydrationLog.find = async () => [{ _id: 'hyd1', amountMl: 500 }];
      Tracking.find = async () => [{ _id: 'track1', action: 'log' }];
      Reaction.find = async () => [{ _id: 'reac1', severity: 'mild' }];
      DietPlan.find = async () => [{ _id: 'dp1', goal: 'health' }];
      NutritionGoal.find = async () => [{ _id: 'ng1', waterMl: 2500 }];
      Streak.find = async () => [{ _id: 'st1', currentStreak: 5 }];
      ApiKey.find = () => ({
        select: async () => [{ name: 'Production Key', keyPrefix: 'nv_live_123' }],
      });

      let statusCode = null;
      let responseData = null;
      const req = { user: mockUser };
      const res = {
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          responseData = data;
          return res;
        },
      };

      await exportMe(req, res, () => {});

      assert.equal(statusCode, 200);
      assert.equal(responseData.success, true);
      assert.ok(responseData.data.exportedAt);
      assert.equal(responseData.data.user.email, 'test@example.com');
      assert.equal(responseData.data.dependents.length, 1);
      assert.equal(responseData.data.meals.length, 1);
      assert.equal(responseData.data.hydration.length, 1);
      assert.equal(responseData.data.tracking.length, 1);
      assert.equal(responseData.data.reactions.length, 1);
      assert.equal(responseData.data.dietPlans.length, 1);
      assert.equal(responseData.data.nutritionGoals.length, 1);
      assert.equal(responseData.data.streaks.length, 1);
      assert.equal(responseData.data.apiKeys.length, 1);
      // Ensure password hash is not exposed
      assert.equal(responseData.data.user.password, undefined);
    });
  });

  describe('DELETE /api/me', () => {
    it('rejects with 400 when password is missing', async () => {
      let statusCode = null;
      let responseData = null;
      const req = { user: mockUser, body: {} };
      const res = {
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          responseData = data;
          return res;
        },
      };

      await deleteMe(req, res, () => {});

      assert.equal(statusCode, 400);
      assert.equal(responseData.success, false);
      assert.match(responseData.message, /password confirmation is required/i);
    });

    it('rejects with 401 when password confirmation is invalid', async () => {
      User.findById = () => ({
        select: async () => mockUser,
      });

      let statusCode = null;
      let responseData = null;
      const req = { user: mockUser, body: { password: 'WrongPassword999!' } };
      const res = {
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          responseData = data;
          return res;
        },
      };

      await deleteMe(req, res, () => {});

      assert.equal(statusCode, 401);
      assert.equal(responseData.success, false);
      assert.match(responseData.message, /invalid password/i);
    });

    it('verifies password, cascade deletes all collections, and permanently removes user account', async () => {
      User.findById = () => ({
        select: async () => mockUser,
      });

      const deletedCollections = [];
      Dependent.deleteMany = async (filter) => { deletedCollections.push('Dependent'); assert.equal(filter.owner, mockUserId); };
      Meal.deleteMany = async (filter) => { deletedCollections.push('Meal'); assert.equal(filter.userId, mockUserId); };
      HydrationLog.deleteMany = async (filter) => { deletedCollections.push('HydrationLog'); assert.equal(filter.userId, mockUserId); };
      Tracking.deleteMany = async (filter) => { deletedCollections.push('Tracking'); assert.equal(filter.user, mockUserId); };
      Reaction.deleteMany = async (filter) => { deletedCollections.push('Reaction'); assert.equal(filter.userId, mockUserId); };
      DietPlan.deleteMany = async (filter) => { deletedCollections.push('DietPlan'); assert.equal(filter.userId, mockUserId); };
      NutritionGoal.deleteMany = async (filter) => { deletedCollections.push('NutritionGoal'); assert.equal(filter.userId, mockUserId); };
      Streak.deleteMany = async (filter) => { deletedCollections.push('Streak'); assert.equal(filter.userId, mockUserId); };
      ApiKey.deleteMany = async (filter) => { deletedCollections.push('ApiKey'); assert.equal(filter.ownerId, mockUserId); };
      User.findByIdAndDelete = async (id) => { deletedCollections.push('User'); assert.equal(id, mockUserId); };

      let statusCode = null;
      let responseData = null;
      const req = { user: mockUser, body: { password: 'CorrectPass123!' } };
      const res = {
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          responseData = data;
          return res;
        },
      };

      await deleteMe(req, res, () => {});

      assert.equal(statusCode, 200);
      assert.equal(responseData.success, true);
      assert.match(responseData.message, /permanently deleted/i);

      // Verify all 9 dependent collections plus User were deleted
      assert.ok(deletedCollections.includes('Dependent'));
      assert.ok(deletedCollections.includes('Meal'));
      assert.ok(deletedCollections.includes('HydrationLog'));
      assert.ok(deletedCollections.includes('Tracking'));
      assert.ok(deletedCollections.includes('Reaction'));
      assert.ok(deletedCollections.includes('DietPlan'));
      assert.ok(deletedCollections.includes('NutritionGoal'));
      assert.ok(deletedCollections.includes('Streak'));
      assert.ok(deletedCollections.includes('ApiKey'));
      assert.ok(deletedCollections.includes('User'));
    });
  });
});

