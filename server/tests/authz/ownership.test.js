/**
 * Comprehensive Authorization and IDOR Integration Tests
 * Validates cross-user isolation and RBAC protections across NutriVibe.
 */
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const Meal = require('../../src/models/Meal');
const Dependent = require('../../src/models/Dependent');
const ApiKey = require('../../src/models/ApiKey');
const User = require('../../src/models/User');

const { updateMeal, deleteMeal } = require('../../src/controllers/mealController');
const { updateDependent, deleteDependent } = require('../../src/controllers/dependentController');
const { revokeKey } = require('../../src/controllers/publicApiController');
const { adminList, adminReview } = require('../../src/controllers/submissionController');
const authMiddleware = require('../../src/middleware/auth');

const {
  generateObjectId,
  createMockUser,
  createMockReqRes,
} = require('./authz.helpers');

describe('Authorization & Cross-User IDOR Protection', () => {
  let userA;
  let userB;
  let adminUser;
  let origMealFindOne;
  let origMealFindOneAndDelete;
  let origDepFindOne;
  let origDepFindByIdAndUpdate;
  let origDepFindOneAndDelete;
  let origApiKeyFindOneAndUpdate;
  let origUserFindById;

  beforeEach(() => {
    userA = createMockUser({ email: 'alice@example.com', name: 'Alice' });
    userB = createMockUser({ email: 'bob@example.com', name: 'Bob' });
    adminUser = createMockUser({ email: 'admin@example.com', role: 'admin', name: 'Admin' });

    origMealFindOne = Meal.findOne;
    origMealFindOneAndDelete = Meal.findOneAndDelete;
    origDepFindOne = Dependent.findOne;
    origDepFindByIdAndUpdate = Dependent.findByIdAndUpdate;
    origDepFindOneAndDelete = Dependent.findOneAndDelete;
    origApiKeyFindOneAndUpdate = ApiKey.findOneAndUpdate;
    origUserFindById = User.findById;
  });

  afterEach(() => {
    Meal.findOne = origMealFindOne;
    Meal.findOneAndDelete = origMealFindOneAndDelete;
    Dependent.findOne = origDepFindOne;
    Dependent.findByIdAndUpdate = origDepFindByIdAndUpdate;
    Dependent.findOneAndDelete = origDepFindOneAndDelete;
    ApiKey.findOneAndUpdate = origApiKeyFindOneAndUpdate;
    User.findById = origUserFindById;
  });

  describe('Meals Ownership (IDOR)', () => {
    it('user B cannot update user A meal (returns 404)', async () => {
      const mealAId = generateObjectId();
      Meal.findOne = async (query) => {
        // Query must match both _id and userId
        if (query._id === mealAId && String(query.userId) === String(userA._id)) {
          return { _id: mealAId, userId: userA._id, notes: 'Alice lunch', save: async () => {} };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: mealAId },
        body: { notes: 'Bob malicious update' },
      });

      await updateMeal(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 404);
      assert.match(response.body.message, /not found/i);
    });

    it('user B cannot delete user A meal (returns 404)', async () => {
      const mealAId = generateObjectId();
      Meal.findOneAndDelete = async (query) => {
        if (query._id === mealAId && String(query.userId) === String(userA._id)) {
          return { _id: mealAId, userId: userA._id };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: mealAId },
      });

      await deleteMeal(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 404);
      assert.match(response.body.message, /not found/i);
    });

    it('user A can update own meal (returns 200)', async () => {
      const mealAId = generateObjectId();
      Meal.findOne = async (query) => {
        if (query._id === mealAId && String(query.userId) === String(userA._id)) {
          return { _id: mealAId, userId: userA._id, notes: 'Original', save: async () => {} };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userA,
        params: { id: mealAId },
        body: { notes: 'Alice updated notes' },
      });

      await updateMeal(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });
  });

  describe('Dependents Ownership (IDOR)', () => {
    it('user B cannot update user A dependent profile (returns 404)', async () => {
      const depAId = generateObjectId();
      Dependent.findOne = async (query) => {
        if (query._id === depAId && String(query.owner) === String(userA.id)) {
          return { _id: depAId, owner: userA.id, name: 'Alice Child', preferences: {} };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: depAId },
        body: { name: 'Bob hijacked profile' },
      });

      await updateDependent(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 404);
      assert.match(response.body.message, /not found/i);
    });

    it('user B cannot delete user A dependent profile (returns 404)', async () => {
      const depAId = generateObjectId();
      Dependent.findOneAndDelete = async (query) => {
        if (query._id === depAId && String(query.owner) === String(userA.id)) {
          return { _id: depAId, owner: userA.id };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: depAId },
      });

      await deleteDependent(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 404);
      assert.match(response.body.message, /not found/i);
    });
  });

  describe('API Key Revocation Ownership (IDOR)', () => {
    it('user B cannot revoke user A API key (returns 404)', async () => {
      const keyAId = generateObjectId();
      ApiKey.findOneAndUpdate = async (filter, update) => {
        if (String(filter._id) === keyAId && String(filter.ownerId) === String(userA._id)) {
          return { _id: keyAId, ownerId: userA._id, active: false };
        }
        return null;
      };

      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: keyAId },
      });

      await revokeKey(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 404);
      assert.match(response.body.message, /not found/i);
    });
  });

  describe('Role-Based Access Control (Admin Routes)', () => {
    it('non-admin user B is rejected with 403 on GET /api/submissions/admin', async () => {
      const { req, res, getResponse } = createMockReqRes({
        user: userB,
      });

      await adminList(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 403);
      assert.match(response.body.message, /admin only/i);
    });

    it('non-admin user B is rejected with 403 on PATCH /api/submissions/admin/:id', async () => {
      const submissionId = generateObjectId();
      const { req, res, getResponse } = createMockReqRes({
        user: userB,
        params: { id: submissionId },
        body: { status: 'approved' },
      });

      await adminReview(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 403);
      assert.match(response.body.message, /admin only/i);
    });

    it('admin user is permitted on GET /api/submissions/admin', async () => {
      const Submission = require('../../src/models/ProductSubmission');
      const origFind = Submission.find;
      Submission.find = () => ({
        sort: () => ({
          limit: () => ({
            populate: async () => [{ _id: 'sub1', name: 'Oat Milk' }],
          }),
        }),
      });

      const { req, res, getResponse } = createMockReqRes({
        user: adminUser,
        query: {},
      });

      await adminList(req, res, () => {});
      const response = getResponse();
      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);

      Submission.find = origFind;
    });
  });

  describe('JWT Authentication Middleware Hardening', () => {
    const testSecret = 'test_secret_for_jwt_unit_tests_32chars!!';

    beforeEach(() => {
      process.env.JWT_SECRET = testSecret;
    });

    it('rejects unauthenticated requests with missing token (401)', async () => {
      const { req, res, getResponse } = createMockReqRes({
        headers: {},
      });

      let nextCalled = false;
      await authMiddleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      const response = getResponse();
      assert.equal(response.status, 401);
      assert.match(response.body.message, /no token/i);
    });

    it('rejects requests with malformed Authorization header (401)', async () => {
      const { req, res, getResponse } = createMockReqRes({
        headers: { authorization: 'Basic dXNlcjpwYXNz' },
      });

      let nextCalled = false;
      await authMiddleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      const response = getResponse();
      assert.equal(response.status, 401);
    });

    it('rejects tokens signed with unauthorized algorithm (e.g. none)', async () => {
      // Craft an unverified token with none algorithm
      const fakeToken = jwt.sign({ id: userA._id }, '', { algorithm: 'none' });
      const { req, res, getResponse } = createMockReqRes({
        headers: { authorization: `Bearer ${fakeToken}` },
      });

      let nextCalled = false;
      await authMiddleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, false);
      const response = getResponse();
      assert.equal(response.status, 401);
    });

    it('accepts valid HS256 signed token for existing user', async () => {
      const validToken = jwt.sign({ id: userA._id }, testSecret, { algorithm: 'HS256', expiresIn: '1h' });

      User.findById = (id) => ({
        select: async () => ({ _id: id, email: userA.email, name: userA.name }),
      });

      const { req, res } = createMockReqRes({
        headers: { authorization: `Bearer ${validToken}` },
      });

      let nextCalled = false;
      await authMiddleware(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.equal(req.user._id, userA._id);
    });
  });
});
