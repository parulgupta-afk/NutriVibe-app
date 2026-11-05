import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/api/index.js';

describe('client-v2 api tests', () => {
  it('exports all expected API methods', () => {
    assert.equal(typeof api.scanBarcode, 'function');
    assert.equal(typeof api.scanLabel, 'function');
    assert.equal(typeof api.getTodayMeals, 'function');
    assert.equal(typeof api.getDailyNutrition, 'function');
    assert.equal(typeof api.logWater, 'function');
    assert.equal(typeof api.getHydrationWeekly, 'function');
    assert.equal(typeof api.getStreaks, 'function');
    assert.equal(typeof api.generatePlan, 'function');
    assert.equal(typeof api.swapMeal, 'function');
    assert.equal(typeof api.createGroceryList, 'function');
    assert.equal(typeof api.chat, 'function');
  });

  it('resolves mock products when in mock mode', async () => {
    const product = await api.scanBarcode('123456');
    assert.ok(product);
    assert.ok(product.name);
    assert.ok(product.verdict);
  });

  it('resolves mock meals when in mock mode', async () => {
    const meals = await api.getTodayMeals();
    assert.ok(Array.isArray(meals));
    assert.ok(meals.length > 0);
  });
});
