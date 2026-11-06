/**
 * Cross-user ownership tests.
 * Wire createUser / agents to your existing test harness before running.
 *
 * Pattern for each resource:
 * 1. User A creates resource R
 * 2. User B tries GET/PATCH/DELETE R → 404
 */

const { describe, it, before } = require('node:test'); // or jest/mocha – match project
// const { createUser, assertNoCrossUserAccess } = require('./authz.helpers');

describe('Authorization / IDOR', () => {
  // let agentA, agentB, resourceId;

  // before(async () => {
  //   agentA = await createUser(...);
  //   agentB = await createUser(...);
  //   const created = await agentA.post('/api/meals').send({ ... });
  //   resourceId = created.body.data._id;
  // });

  it('user B cannot GET user A meal', async () => {
    // await assertNoCrossUserAccess({ agentB, method: 'GET', path: `/api/meals/${resourceId}` });
  });

  it('user B cannot PATCH user A meal', async () => {
    // await assertNoCrossUserAccess({ agentB, method: 'PATCH', path: `/api/meals/${resourceId}` });
  });

  it('user B cannot DELETE user A meal', async () => {
    // await assertNoCrossUserAccess({ agentB, method: 'DELETE', path: `/api/meals/${resourceId}` });
  });

  // Repeat for: dependents, hydration, favorites, tracking, reactions, api keys
  // Admin: non-admin cannot POST /api/submissions/:id/approve
});
