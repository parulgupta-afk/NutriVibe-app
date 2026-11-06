const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const healthRoutes = require('../src/routes/healthRoutes');

function invokeHandler(path, method = 'GET') {
  return new Promise((resolve) => {
    let statusCode = 200;
    let responseData = null;

    const req = { method, url: path, path };
    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      json(data) {
        responseData = data;
        resolve({ status: statusCode, body: responseData });
      },
    };

    // Route matching from Express router stack
    const route = healthRoutes.stack.find(
      (layer) => layer.route && layer.route.path === path && layer.route.methods[method.toLowerCase()]
    );

    if (route) {
      route.handle(req, res, () => {});
    } else {
      resolve({ status: 404, body: null });
    }
  });
}

describe('Health and Readiness Endpoints', () => {
  let origReadyState;

  beforeEach(() => {
    origReadyState = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
  });

  afterEach(() => {
    if (origReadyState) {
      Object.defineProperty(mongoose.connection, 'readyState', origReadyState);
    }
  });

  describe('GET /health (Liveness)', () => {
    it('returns 200 OK and liveness message', async () => {
      const response = await invokeHandler('/health');
      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ok');
      assert.ok(response.body.timestamp);
    });
  });

  describe('GET /ready (Readiness)', () => {
    it('returns 503 not_ready when MongoDB is disconnected', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 0,
        configurable: true,
      });

      const response = await invokeHandler('/ready');
      assert.equal(response.status, 503);
      assert.equal(response.body.status, 'not_ready');
      assert.equal(response.body.checks.mongo.connected, false);
    });

    it('returns 200 ready when MongoDB is connected (readyState === 1)', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 1,
        configurable: true,
      });
      delete process.env.REDIS_URL;

      const response = await invokeHandler('/ready');
      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ready');
      assert.equal(response.body.checks.mongo.connected, true);
    });
  });
});
