import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  convertToMetricGrams,
  parseServingString,
} from '../src/utils/servingUnit.js';

describe('client servingUnit utility tests', () => {
  it('converts ounces to metric grams accurately', () => {
    // 2 oz = ~56.7 grams
    const grams = convertToMetricGrams(2, 'oz');
    assert.equal(grams, 56.7);
  });

  it('converts tablespoons to milliliters / grams', () => {
    // 2 tbsp = 30 grams
    assert.equal(convertToMetricGrams(2, 'tbsp'), 30);
  });

  it('keeps grams as 1:1 conversion', () => {
    assert.equal(convertToMetricGrams(150, 'g'), 150);
  });

  it('parses formatted serving size strings into quantity and unit', () => {
    const parsed1 = parseServingString('250 ml');
    assert.deepEqual(parsed1, { quantity: 250, unit: 'ml' });

    const parsed2 = parseServingString('1.5 cups');
    assert.deepEqual(parsed2, { quantity: 1.5, unit: 'cups' });
  });

  it('defaults to 100g on unparseable or empty serving strings', () => {
    assert.deepEqual(parseServingString(''), { quantity: 100, unit: 'g' });
    assert.deepEqual(parseServingString(null), { quantity: 100, unit: 'g' });
  });

  it('parses fluid ounces string correctly', () => {
    const parsed = parseServingString('8 fl oz');
    assert.deepEqual(parsed, { quantity: 8, unit: 'fl oz' });
  });
});

