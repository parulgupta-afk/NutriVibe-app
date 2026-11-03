const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isSafetyQuestion } = require('../src/services/vibeAIService');

describe('vibeAIService unit tests', () => {
  describe('isSafetyQuestion pattern matching', () => {
    it('detects allergen related questions', () => {
      assert.equal(isSafetyQuestion('Is this safe with a peanut allergy?'), true);
      assert.equal(isSafetyQuestion('Does this trigger allergic reactions?'), true);
    });

    it('detects medication and drug interaction queries', () => {
      assert.equal(isSafetyQuestion('Does grapefruit interact with atorvastatin meds?'), true);
      assert.equal(isSafetyQuestion('Can I take this medication with dairy?'), true);
    });

    it('detects safety and avoid queries', () => {
      assert.equal(isSafetyQuestion('Can I eat this?'), true);
      assert.equal(isSafetyQuestion('Should I avoid this cereal?'), true);
      assert.equal(isSafetyQuestion('Why is this flagged unsafe?'), true);
    });

    it('returns false for general nutrition queries', () => {
      assert.equal(isSafetyQuestion('How many calories did I eat today?'), false);
      assert.equal(isSafetyQuestion('What is my current meal logging streak?'), false);
      assert.equal(isSafetyQuestion('Suggest a high protein breakfast.'), false);
    });
  });
});

