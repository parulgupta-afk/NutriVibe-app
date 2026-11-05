const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveEffectiveUser } = require('../src/services/profileResolver');

describe('profileResolver unit tests', () => {
  it('returns account owner when neither query nor body provides profileId', async () => {
    const user = {
      id: 'owner_123',
      preferences: {
        allergies: ['Peanuts'],
        dietaryRestrictions: ['Vegetarian'],
      },
    };

    const req = {
      user,
      query: {},
      body: {},
    };

    const result = await resolveEffectiveUser(req);
    assert.deepEqual(result.effectiveUser, user);
    assert.equal(result.profileId, null);
    assert.equal(result.profileName, null);
  });

  it('safely handles req objects with undefined query or body', async () => {
    const user = { id: 'owner_456', preferences: {} };
    const req = { user };

    const result = await resolveEffectiveUser(req);
    assert.deepEqual(result.effectiveUser, user);
    assert.equal(result.profileId, null);
  });
});


describe('profileResolver ownership (fail closed, no silent owner fallback)', () => {
  const Dependent = require('../src/models/Dependent');
  const VALID = '64b7f0c2a1b2c3d4e5f60718';
  const owner = { id: 'owner_1', preferences: { allergies: [] } };
  let original;

  const withFindOne = (impl) => {
    original = Dependent.findOne;
    Dependent.findOne = impl;
  };
  const restore = () => { Dependent.findOne = original; };

  it('throws 404 when profileId does not belong to the user', async () => {
    withFindOne(async (q) => { assert.equal(q.owner, 'owner_1'); return null; });
    try {
      await assert.rejects(
        resolveEffectiveUser({ user: owner, query: { profileId: VALID }, body: {} }),
        (e) => e.statusCode === 404 && e.code === 'NOT_FOUND'
      );
    } finally { restore(); }
  });

  it('throws 404 for malformed ids without querying the DB', async () => {
    withFindOne(async () => { throw new Error('must not query'); });
    try {
      await assert.rejects(resolveEffectiveUser({ user: owner, query: { profileId: 'abc' }, body: {} }), (e) => e.statusCode === 404);
    } finally { restore(); }
  });

  it('rejects operator-injection objects in profileId', async () => {
    withFindOne(async () => { throw new Error('must not query'); });
    try {
      await assert.rejects(resolveEffectiveUser({ user: owner, query: {}, body: { profileId: { $ne: null } } }), (e) => e.statusCode === 404);
    } finally { restore(); }
  });

  it('uses the dependent preferences (not the owner) when owned', async () => {
    const prefs = { allergies: ['Peanuts'] };
    withFindOne(async () => ({ _id: VALID, name: 'Aarav', preferences: prefs }));
    try {
      const r = await resolveEffectiveUser({ user: owner, query: { profileId: VALID }, body: {} });
      assert.deepEqual(r.effectiveUser.preferences, prefs);
      assert.equal(r.profileName, 'Aarav');
    } finally { restore(); }
  });
});
