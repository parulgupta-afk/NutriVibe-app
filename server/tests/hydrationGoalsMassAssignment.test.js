const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { updateGoalsSchema } = require('../src/validators/hydration.validator');
const { getOrUpdateGoals } = require('../src/controllers/hydrationController');
const NutritionGoal = require('../src/models/NutritionGoal');

describe('Hydration Goals Mass Assignment Protection', () => {
  describe('Zod updateGoalsSchema validation', () => {
    it('strips userId, _id, and arbitrary unknown fields', () => {
      const input = {
        userId: 'attacker_id_12345',
        _id: 'mongo_object_id_54321',
        role: 'admin',
        hacked: true,
        waterMl: 3000,
        calories: 2200,
        protein: 75,
        carbs: 200,
        fat: 60,
        fiber: 30,
        timezone: 'Asia/Kolkata',
      };

      const result = updateGoalsSchema.safeParse(input);
      assert.equal(result.success, true);
      assert.equal(result.data.userId, undefined);
      assert.equal(result.data._id, undefined);
      assert.equal(result.data.role, undefined);
      assert.equal(result.data.hacked, undefined);
      assert.equal(result.data.waterMl, 3000);
      assert.equal(result.data.calories, 2200);
      assert.equal(result.data.timezone, 'Asia/Kolkata');
    });

    it('rejects calories outside 500-10000 range', () => {
      assert.equal(updateGoalsSchema.safeParse({ calories: 499 }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ calories: 10001 }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ calories: 2500 }).success, true);
    });

    it('rejects waterMl outside 250-10000 range', () => {
      assert.equal(updateGoalsSchema.safeParse({ waterMl: 249 }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ waterMl: 10001 }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ waterMl: 2500 }).success, true);
    });

    it('rejects unsafe timezone values containing suspicious characters', () => {
      assert.equal(updateGoalsSchema.safeParse({ timezone: 'UTC; rm -rf /' }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ timezone: 'Asia/Kolkata$ne' }).success, false);
      assert.equal(updateGoalsSchema.safeParse({ timezone: 'America/New_York' }).success, true);
      assert.equal(updateGoalsSchema.safeParse({ timezone: 'Europe/London' }).success, true);
    });
  });

  describe('getOrUpdateGoals controller execution', () => {
    it('leaves document ownership unchanged when body contains foreign userId or _id', async () => {
      let capturedFilter = null;
      let capturedUpdate = null;
      const origFindOneAndUpdate = NutritionGoal.findOneAndUpdate;

      NutritionGoal.findOneAndUpdate = async (filter, update) => {
        capturedFilter = filter;
        capturedUpdate = update;
        return {
          userId: filter.userId,
          waterMl: update.$set.waterMl,
          calories: update.$set.calories || 2000,
        };
      };

      try {
        const req = {
          method: 'PUT',
          user: { _id: 'legitimate_owner_456' },
          body: {
            userId: 'malicious_user_999',
            _id: 'fake_doc_id',
            admin: true,
            waterMl: 3200,
            calories: 2400,
          },
        };

        let responseData = null;
        const res = {
          json: (data) => {
            responseData = data;
            return res;
          },
        };

        await getOrUpdateGoals(req, res, () => {});

        // Ownership remains bound to req.user._id
        assert.deepEqual(capturedFilter, { userId: 'legitimate_owner_456' });

        // Update $set must NEVER contain userId, _id, or unwhitelisted keys
        assert.equal(capturedUpdate.$set.userId, undefined);
        assert.equal(capturedUpdate.$set._id, undefined);
        assert.equal(capturedUpdate.$set.admin, undefined);
        assert.equal(capturedUpdate.$set.waterMl, 3200);
        assert.equal(capturedUpdate.$set.calories, 2400);

        // Response reflects unchanged owner
        assert.equal(responseData.success, true);
        assert.equal(responseData.data.userId, 'legitimate_owner_456');
      } finally {
        NutritionGoal.findOneAndUpdate = origFindOneAndUpdate;
      }
    });
  });
});
