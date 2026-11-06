/**
 * Shared helpers for IDOR / ownership tests.
 * Requires a test app bootstrap that creates two users and returns
 * authenticated request agents (or tokens).
 *
 * Adapt to your existing test setup (supertest + mongoose memory server, etc.).
 */

async function createUser(app, { email, password = 'TestPass1234!', name = 'Test' }) {
  // POST /api/auth/register then return { user, token } or agent
  throw new Error('Wire to your test register helper');
}

async function createOwnedResource(agent, path, body) {
  // e.g. agent.post('/api/meals').send(body)
  throw new Error('Wire to create resource');
}

/**
 * Assert user B cannot read/update/delete user A's resource.
 * Expect 404 (preferred) or 403 consistently.
 */
async function assertNoCrossUserAccess({ agentB, method, path }) {
  const res = await agentB[method.toLowerCase()](path);
  if (![403, 404].includes(res.status)) {
    throw new Error(`Expected 403/404 for ${method} ${path}, got ${res.status}`);
  }
  return res;
}

module.exports = { createUser, createOwnedResource, assertNoCrossUserAccess };
