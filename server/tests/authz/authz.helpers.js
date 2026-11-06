/**
 * Shared helpers for IDOR / authorization tests.
 */
const mongoose = require('mongoose');

function generateObjectId() {
  return new mongoose.Types.ObjectId().toString();
}

function createMockUser({ id = generateObjectId(), email = 'user@example.com', role = 'user', name = 'Test User' } = {}) {
  return {
    _id: id,
    id: id,
    email,
    role,
    name,
  };
}

function createMockReqRes({ user, params = {}, body = {}, query = {}, headers = {}, method = 'GET' } = {}) {
  let statusCode = 200;
  let responseBody = null;

  const req = {
    method,
    user,
    params,
    body,
    query,
    headers,
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseBody = data;
      return res;
    },
    send(data) {
      responseBody = data;
      return res;
    },
    setHeader() {
      return res;
    },
  };

  return {
    req,
    res,
    getResponse() {
      return { status: statusCode, body: responseBody };
    },
  };
}

module.exports = {
  generateObjectId,
  createMockUser,
  createMockReqRes,
};
