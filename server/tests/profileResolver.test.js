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

