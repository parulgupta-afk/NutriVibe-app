const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const requireRole = require('../src/middleware/requireRole');
const { seedFoods } = require('../src/controllers/foodController');
const FoodItem = require('../src/models/FoodItem');

describe('requireRole Middleware & Seed Route Authorization', () => {
  describe('requireRole middleware', () => {
    it('returns 401 when req.user is absent', () => {
      const middleware = requireRole('admin');
      const req = {};
      let statusCode = null;
      let body = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          body = data;
          return res;
        },
      };

      middleware(req, res, () => {
        assert.fail('next should not be called');
      });

      assert.equal(statusCode, 401);
      assert.equal(body.success, false);
      assert.match(body.message, /authentication required/i);
    });

    it('returns 403 when user does not have required admin role', () => {
      const middleware = requireRole('admin');
      const req = { user: { id: 'u1', role: 'user' } };
      let statusCode = null;
      let body = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          body = data;
          return res;
        },
      };

      middleware(req, res, () => {
        assert.fail('next should not be called');
      });

      assert.equal(statusCode, 403);
      assert.equal(body.success, false);
      assert.match(body.message, /Admin only/i);
    });

    it('calls next() when user has the required admin role', () => {
      const middleware = requireRole('admin');
      const req = { user: { id: 'admin1', role: 'admin' } };
      const res = {};
      let nextCalled = false;

      middleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
    });

    it('handles undefined user property returning 401', () => {
      const middleware = requireRole('admin');
      const req = { user: undefined };
      let statusCode = null;
      const res = { status: (c) => { statusCode = c; return res; }, json: () => res };
      middleware(req, res, () => {});
      assert.equal(statusCode, 401);
    });
  });

  describe('foodController seedFoods controller authorization', () => {
    it('rejects normal user with 403', async () => {
      const req = { user: { id: 'u1', role: 'user' } };
      let statusCode = null;
      let body = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          body = data;
          return res;
        },
      };

      await seedFoods(req, res, () => {});

      assert.equal(statusCode, 403);
      assert.equal(body.success, false);
      assert.match(body.message, /Admin only/i);
    });

    it('allows admin user to seed foods and succeeds', async () => {
      const origFindOne = FoodItem.findOne;
      const origCreate = FoodItem.create;
      const origCount = FoodItem.countDocuments;

      FoodItem.findOne = async () => null;
      FoodItem.create = async () => ({});
      FoodItem.countDocuments = async () => 15;

      try {
        const req = { user: { id: 'admin1', role: 'admin' } };
        let responseData = null;
        const res = {
          json: (data) => {
            responseData = data;
            return res;
          },
        };

        await seedFoods(req, res, () => {});

        assert.equal(responseData.success, true);
        assert.equal(responseData.data.total, 15);
      } finally {
        FoodItem.findOne = origFindOne;
        FoodItem.create = origCreate;
        FoodItem.countDocuments = origCount;
      }
    });
  });
});
