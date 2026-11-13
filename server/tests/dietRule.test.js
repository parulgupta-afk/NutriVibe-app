const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { applyDietRules } = require('../src/safety/rules/dietRule');

describe('dietRule unit tests', () => {
  it('returns state untouched when user has no dietary restrictions', () => {
    const product = { name: 'Beef Jerky', ingredients_text: 'Beef, salt, smoke' };
    const initialState = {
      level: 'Safe',
      score: 100,
      factors: [],
      recommendations: []
    };

    const state = applyDietRules(product, [], initialState);
    assert.equal(state.level, 'Safe');
    assert.equal(state.score, 100);
    assert.equal(state.factors.length, 0);
  });

  it('adds dietary conflict factors for vegetarian user eating non-vegetarian food', () => {
    const product = { name: 'Chicken Soup', ingredients_text: 'Chicken broth, chicken meat, carrots' };
    const initialState = {
      level: 'Safe',
      score: 95,
      factors: [],
      recommendations: []
    };

    const state = applyDietRules(product, ['Vegetarian'], initialState);
    assert.ok(state.factors.length > 0);
    assert.equal(state.factors[0].name, 'Dietary restriction concern');
    assert.ok(state.recommendations.length > 0);
    assert.equal(state.level, 'Caution');
    assert.ok(state.score <= 65);
  });

  it('does not downgrade an existing Unsafe level to Caution', () => {
    const product = { name: 'Beef Stew', ingredients_text: 'Beef, carrots, celery' };
    const initialState = {
      level: 'Unsafe',
      score: 10,
      factors: [{ name: 'Peanut allergy match', severity: 100 }],
      recommendations: ['Avoid: contains peanuts']
    };

    const state = applyDietRules(product, ['Vegetarian'], initialState);
    assert.equal(state.level, 'Unsafe');
    assert.equal(state.score, 10);
  });

  it('handles null userRestrictions safely by evaluating to empty array', () => {
    const product = { name: 'Apple', ingredients_text: 'Apple' };
    const initialState = { level: 'Safe', score: 100, factors: [], recommendations: [] };
    const state = applyDietRules(product, null, initialState);
    assert.equal(state.level, 'Safe');
    assert.equal(state.score, 100);
  });

  it('handles empty product object returning safe state with caution recommendation', () => {
    const initialState = { level: 'Safe', score: 100, factors: [], recommendations: [] };
    const state = applyDietRules({}, ['Vegetarian'], initialState);
    assert.equal(state.level, 'Safe');
  });
});

