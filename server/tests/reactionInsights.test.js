const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateReactionInsights } = require('../src/controllers/reactionController');

describe('reaction insights correlation tests', () => {
  it('returns zero counts for empty reactions list', () => {
    const result = calculateReactionInsights([]);
    assert.equal(result.totalEntries, 0);
    assert.deepEqual(result.topFoodsMentioned, []);
    assert.deepEqual(result.topSymptoms, []);
  });

  it('aggregates foods and symptoms frequencies accurately', () => {
    const reactions = [
      {
        foods: ['Milk', 'Peanuts'],
        symptoms: ['Hives', 'Nausea'],
      },
      {
        foods: ['milk', 'Cheese'],
        symptoms: ['Hives', 'Bloating'],
      },
      {
        foods: ['Almonds'],
        symptoms: ['Headache'],
      },
    ];

    const result = calculateReactionInsights(reactions);
    assert.equal(result.totalEntries, 3);

    // Food frequencies: milk (2), peanuts (1), cheese (1), almonds (1)
    const milkEntry = result.topFoodsMentioned.find((f) => f.name === 'milk');
    assert.ok(milkEntry);
    assert.equal(milkEntry.count, 2);

    // Symptoms frequencies: hives (2), nausea (1), bloating (1), headache (1)
    const hivesEntry = result.topSymptoms.find((s) => s.name === 'hives');
    assert.ok(hivesEntry);
    assert.equal(hivesEntry.count, 2);
  });

  it('handles missing foods or symptoms gracefully', () => {
    const reactions = [
      { foods: null, symptoms: ['Cough'] },
      { foods: ['Apple'], symptoms: null },
      { notes: 'Only note without fields' },
    ];

    const result = calculateReactionInsights(reactions);
    assert.equal(result.totalEntries, 3);
    assert.equal(result.topFoodsMentioned.length, 1);
    assert.equal(result.topFoodsMentioned[0].name, 'apple');
    assert.equal(result.topSymptoms.length, 1);
    assert.equal(result.topSymptoms[0].name, 'cough');
  });

  it('handles empty reaction entry objects without throwing', () => {
    const result = calculateReactionInsights([{}]);
    assert.equal(result.totalEntries, 1);
  });
});

