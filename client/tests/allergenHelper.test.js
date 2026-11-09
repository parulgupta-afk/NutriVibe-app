import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAllergenName,
  getAllergenBadgeStyle,
  formatAllergenTitle,
} from '../src/utils/allergenHelper.js';

describe('client allergenHelper utility tests', () => {
  it('normalizes allergen names into lowercase trimmed tokens', () => {
    assert.equal(normalizeAllergenName('  Peanuts  '), 'peanuts');
    assert.equal(normalizeAllergenName(null), '');
    assert.equal(normalizeAllergenName(undefined), '');
    assert.equal(normalizeAllergenName(123), '');
    assert.equal(normalizeAllergenName({}), '');
  });

  it('maps known allergens to distinct color badge classes', () => {
    const peanutStyle = getAllergenBadgeStyle('Peanuts');
    assert.match(peanutStyle, /bg-amber-100/);

    const dairyStyle = getAllergenBadgeStyle('Milk');
    assert.match(dairyStyle, /bg-blue-100/);

    const shellfishStyle = getAllergenBadgeStyle('Shellfish');
    assert.match(shellfishStyle, /bg-red-100/);
  });

  it('falls back to neutral gray classes for custom or unknown allergens', () => {
    const customStyle = getAllergenBadgeStyle('Sesame Seeds');
    assert.match(customStyle, /bg-gray-100/);
  });

  it('formats allergen titles with capitalized first letter', () => {
    assert.equal(formatAllergenTitle('gluten'), 'Gluten');
    assert.equal(formatAllergenTitle('  dairy'), 'Dairy');
    assert.equal(formatAllergenTitle(''), '');
  });

  it('returns default styling for whitespace-only strings', () => {
    const style = getAllergenBadgeStyle('   ');
    assert.match(style, /bg-gray-100/);
  });
});

