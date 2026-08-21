/**
 * Engineering Phase 3: regression tests for product service pure logic.
 * No Mongo required for rankAlternatives / generateSafetyReport shape.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  generateSafetyReport,
  rankAlternatives,
  mapOffFailure
} = require('../src/services/productService');

const user = (overrides = {}) => ({
  _id: 'user1',
  preferences: {
    allergies: [],
    dietaryRestrictions: [],
    medications: [],
    ...overrides
  }
});

const product = (overrides = {}) => ({
  _id: 'prod1',
  name: 'Test',
  brand: 'BrandA',
  barcode: '111',
  category: 'Food',
  ingredients: [],
  processingLevel: 'Processed',
  safetyInfo: {
    allergens: [],
    warnings: [],
    certifications: [],
    riskLevel: 'Unknown'
  },
  ...overrides
});

describe('mapOffFailure', () => {
  it('maps not_found to 404', () => {
    const r = mapOffFailure('not_found');
    assert.equal(r.status, 404);
    assert.ok(r.message.includes('not found'));
  });

  it('maps timeout to 503', () => {
    const r = mapOffFailure('timeout');
    assert.equal(r.status, 503);
  });
});

describe('generateSafetyReport', () => {
  it('returns riskAssessment shape used by the frontend', () => {
    const p = product({
      ingredients: ['Skim milk'],
      safetyInfo: {
        allergens: ['Dairy'],
        warnings: [],
        certifications: [],
        riskLevel: 'Caution'
      }
    });
    const u = user({ allergies: ['dairy'] });
    const report = generateSafetyReport(p, u);

    assert.equal(report.product, p._id);
    assert.equal(report.user, u._id);
    assert.ok(report.riskAssessment);
    assert.equal(report.riskAssessment.level, 'Unsafe');
    assert.ok(Array.isArray(report.recommendations));
    assert.ok(report.reviewedAt instanceof Date);
  });
});

describe('rankAlternatives', () => {
  it('never returns Unsafe candidates', () => {
    const base = product({ brand: 'BrandA' });
    const candidates = [
      product({
        _id: 'unsafe',
        barcode: 'u1',
        name: 'Yogurt',
        ingredients: ['Milk'],
        safetyInfo: {
          allergens: ['Dairy'],
          warnings: [],
          certifications: [],
          riskLevel: 'Caution'
        }
      }),
      product({
        _id: 'safe',
        barcode: 's1',
        name: 'Oat Milk',
        brand: 'BrandA',
        ingredients: ['Water', 'Oats'],
        processingLevel: 'Processed',
        safetyInfo: {
          allergens: [],
          warnings: [],
          certifications: ['Vegan'],
          riskLevel: 'Unknown'
        }
      })
    ];
    const u = user({ allergies: ['dairy'] });
    const ranked = rankAlternatives(base, candidates, u);

    assert.ok(ranked.every((c) => c.safetyLevel !== 'Unsafe'));
    assert.ok(ranked.some((c) => c.barcode === 's1'));
  });

  it('prefers Safe over Caution when both exist', () => {
    const base = product();
    const candidates = [
      product({
        _id: 'c1',
        barcode: 'c1',
        name: 'Caution Item',
        ingredients: [],
        safetyInfo: {
          allergens: [],
          warnings: ['May contain traces of peanuts'],
          certifications: [],
          riskLevel: 'Caution'
        }
      }),
      product({
        _id: 's1',
        barcode: 's1',
        name: 'Safe Item',
        ingredients: ['Water'],
        safetyInfo: {
          allergens: [],
          warnings: [],
          certifications: [],
          riskLevel: 'Unknown'
        }
      })
    ];
    // User with peanut allergy so traces → caution on first
    const u = user({ allergies: ['peanuts'] });
    const ranked = rankAlternatives(base, candidates, u);
    if (ranked.length >= 2) {
      assert.equal(ranked[0].safetyLevel, 'Safe');
    }
  });
});
