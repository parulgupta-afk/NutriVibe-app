const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeInput, sanitizeObject } = require('../src/middleware/sanitizeInput');
const { forgotPassword, login, resetPassword } = require('../src/controllers/authController');
const User = require('../src/models/User');

describe('NoSQL Operator Injection Protection', () => {
  describe('sanitizeObject & sanitizeInput middleware', () => {
    it('deletes keys starting with "$" recursively in place', () => {
      const payload = {
        email: { $ne: null },
        nested: {
          valid: 'yes',
          $where: 'sleep(1000)',
          list: [{ $gt: 5 }, { clean: true }]
        }
      };

      sanitizeObject(payload);
      assert.deepEqual(payload, {
        email: {},
        nested: {
          valid: 'yes',
          list: [{}, { clean: true }]
        }
      });
    });

    it('deletes keys containing "." in place', () => {
      const payload = {
        'profile.role': 'admin',
        validKey: 'normal'
      };

      sanitizeObject(payload);
      assert.deepEqual(payload, { validKey: 'normal' });
    });

    it('mutates req.body, req.query, and req.params in place', () => {
      const req = {
        body: { $regex: '.*', user: 'alice' },
        query: { $ne: '1', filter: 'active' },
        params: { id: '123', $bad: 'val' }
      };
      let nextCalled = false;

      sanitizeInput(req, {}, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.deepEqual(req.body, { user: 'alice' });
      assert.deepEqual(req.query, { filter: 'active' });
      assert.deepEqual(req.params, { id: '123' });
    });

    it('preserves clean inputs without modification', () => {
      const req = {
        body: { email: 'user@example.com', password: 'password123', count: 42 },
        query: { page: '1', sort: 'desc' },
        params: { id: 'abc-123' }
      };

      sanitizeInput(req, {}, () => {});
      assert.deepEqual(req.body, { email: 'user@example.com', password: 'password123', count: 42 });
      assert.deepEqual(req.query, { page: '1', sort: 'desc' });
      assert.deepEqual(req.params, { id: 'abc-123' });
    });
  });

  describe('authController string checks and query protection', () => {
    it('forgotPassword rejects operator/object payloads and never calls User.findOne with operator', async () => {
      let findOneCalledWith = null;
      const origFindOne = User.findOne;
      User.findOne = async (q) => {
        findOneCalledWith = q;
        return null;
      };

      try {
        const req = { body: { email: { $ne: null } } };
        sanitizeInput(req, {}, () => {});

        let statusCode = null;
        let responseBody = null;
        const res = {
          status: (code) => {
            statusCode = code;
            return res;
          },
          json: (data) => {
            responseBody = data;
            return res;
          }
        };

        await forgotPassword(req, res, () => {});

        assert.equal(statusCode, 400);
        assert.equal(responseBody.success, false);
        assert.equal(findOneCalledWith, null, 'User.findOne must never be called on operator payload');
      } finally {
        User.findOne = origFindOne;
      }
    });

    it('forgotPassword normalizes valid string email before querying User.findOne', async () => {
      let findOneCalledWith = null;
      const origFindOne = User.findOne;
      User.findOne = async (q) => {
        findOneCalledWith = q;
        return null;
      };

      try {
        const req = { body: { email: '  Test.User@Example.COM  ' } };
        sanitizeInput(req, {}, () => {});

        let statusCode = null;
        const res = {
          status: (code) => {
            statusCode = code;
            return res;
          },
          json: () => res
        };

        await forgotPassword(req, res, () => {});

        assert.equal(statusCode, 200);
        assert.deepEqual(findOneCalledWith, { email: 'test.user@example.com' });
      } finally {
        User.findOne = origFindOne;
      }
    });

    it('login rejects operator payloads and non-string passwords without querying DB', async () => {
      let findOneCalled = false;
      const origFindOne = User.findOne;
      User.findOne = () => {
        findOneCalled = true;
        return { select: () => null };
      };

      try {
        const req = { body: { email: { $gt: '' }, password: 'password123' } };
        sanitizeInput(req, {}, () => {});

        let statusCode = null;
        const res = {
          status: (code) => {
            statusCode = code;
            return res;
          },
          json: () => res
        };

        await login(req, res, () => {});

        assert.equal(statusCode, 400);
        assert.equal(findOneCalled, false, 'User.findOne must not be called when email is invalid');
      } finally {
        User.findOne = origFindOne;
      }
    });

    it('resetPassword rejects non-string or operator token parameters without querying DB', async () => {
      let findOneCalled = false;
      const origFindOne = User.findOne;
      User.findOne = () => {
        findOneCalled = true;
        return { select: () => null };
      };

      try {
        const req = {
          params: { token: { $ne: '' } },
          body: { password: 'validPassword123' }
        };
        sanitizeInput(req, {}, () => {});

        let statusCode = null;
        const res = {
          status: (code) => {
            statusCode = code;
            return res;
          },
          json: () => res
        };

        await resetPassword(req, res, () => {});

        assert.equal(statusCode, 400);
        assert.equal(findOneCalled, false, 'User.findOne must not be called on invalid token');
      } finally {
        User.findOne = origFindOne;
      }
    });
  });
});
