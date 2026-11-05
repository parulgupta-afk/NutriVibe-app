/**
 * Phase 2 (E) Canonical Food Safety Engine Verification Tests.
 * Covers all 14 mandatory safety, failure, and uncertainty modes.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const {
  computeSafetyVerdict,
  CANONICAL_VERDICTS
} = require('../src/services/safetyEngine');
const { resolveEffectiveUser } = require('../src/services/profileResolver');
const { explainIngredients } = require('../src/services/geminiExplainerService');
const Dependent = require('../src/models/Dependent');

const baseUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  preferences: {
    allergies: [],
    dietaryRestrictions: [],
    medications: [],
    healthGoals: [],
    ...overrides
  }
});

const baseProduct = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  name: 'Sample Food Product',
  brand: 'NutriVibe Essentials',
  ingredients: ['Water', 'Organic Rolled Oats', 'Sea Salt'],
  safetyInfo: {
    allergens: [],
    warnings: [],
    certifications: [],
    riskLevel: 'Safe'
  },
  processingLevel: 'Processed',
  ...overrides
});

describe('Phase 2 — Canonical Food Safety Engine Verification (14 Mandatory Modes)', () => {
  // Mode 1: Complete product with no detected allergens -> SAFE
  it('Mode 1: Complete product with no detected allergens returns SAFE', () => {
    const product = baseProduct({
      ingredients: ['Organic Apples', 'Water', 'Cinnamon'],
      safetyInfo: { allergens: [], warnings: [], certifications: [] }
    });
    const user = baseUser({ allergies: ['Peanuts'] });

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.SAFE);
    assert.equal(verdict.level, 'Safe');
    assert.equal(verdict.score, 100);
  });

  // Mode 2: Missing ingredients -> CANNOT_VERIFY
  it('Mode 2: Missing ingredients list returns CANNOT_VERIFY', () => {
    const product = baseProduct({
      ingredients: [],
      safetyInfo: { allergens: [], warnings: [] }
    });
    const user = baseUser({ allergies: ['Peanuts'] });

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
    assert.ok(verdict.factors.some((f) => f.name === 'Insufficient data'));
  });

  // Mode 3: Missing allergen information with user allergies -> CANNOT_VERIFY
  it('Mode 3: Missing allergen information when user has declared allergies returns CANNOT_VERIFY', () => {
    const product = {
      name: 'Mystery Snack',
      ingredients: [],
      safetyInfo: { allergens: ['unknown'], warnings: [] }
    };
    const user = baseUser({ allergies: ['Dairy', 'Eggs'] });

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
  });

  // Mode 4: Empty product record {} -> CANNOT_VERIFY
  it('Mode 4: Empty product record {} returns CANNOT_VERIFY', () => {
    const emptyProduct = {};
    const user = baseUser({ allergies: ['Peanuts'] });

    const verdict = computeSafetyVerdict(emptyProduct, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
    assert.ok(verdict.factors.some((f) => f.name === 'Insufficient data'));
  });

  // Mode 5: OCR extraction failure -> CANNOT_VERIFY
  it('Mode 5: OCR extraction failure returns CANNOT_VERIFY', () => {
    const product = baseProduct({
      ocrStatus: 'failed',
      ingredients: ['OCR extraction failed: unreadable image']
    });
    const user = baseUser();

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
    assert.ok(verdict.factors.some((f) => f.impact.includes('OCR')));
  });

  // Mode 6: Unreadable ingredient list -> CANNOT_VERIFY
  it('Mode 6: Unreadable ingredient list returns CANNOT_VERIFY', () => {
    const product = baseProduct({
      ingredients: ['*** unreadable ***', 'blurry label text']
    });
    const user = baseUser();

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
    assert.ok(verdict.factors.some((f) => f.impact.includes('unreadable')));
  });

  // Mode 7: Known allergen match -> UNSAFE
  it('Mode 7: Known direct allergen match returns UNSAFE', () => {
    const product = baseProduct({
      name: 'Peanut Butter Cookies',
      ingredients: ['Enriched Wheat Flour', 'Roasted Peanuts', 'Cane Sugar', 'Butter']
    });
    const user = baseUser({ allergies: ['Peanuts'] });

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.UNSAFE);
    assert.equal(verdict.level, 'Unsafe');
    assert.ok(verdict.score <= 20);
    assert.ok(verdict.factors.some((f) => f.name === 'Allergen match'));
  });

  // Mode 8: Cross-contamination warning -> CAUTION
  it('Mode 8: Cross-contamination warning relevant to user allergies returns CAUTION', () => {
    const product = baseProduct({
      name: 'Granola Bar',
      ingredients: ['Rolled Oats', 'Honey', 'Dried Cranberries'],
      safetyInfo: {
        allergens: [],
        warnings: ['Manufactured in a shared facility that processes peanuts']
      }
    });
    const user = baseUser({ allergies: ['Peanuts'] });

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CAUTION);
    assert.equal(verdict.level, 'Caution');
    assert.ok(verdict.factors.some((f) => f.name === 'Cross-contamination risk'));
  });

  // Mode 9: Contradictory product information -> CAUTION or CANNOT_VERIFY
  it('Mode 9: Contradictory product packaging returns CAUTION (or UNSAFE if allergic)', () => {
    // Contradictory packaging: Claims dairy-free in name/description, but ingredients list whey
    const contradictoryProduct = baseProduct({
      name: 'Dairy-Free Energy Bar',
      description: 'Certified 100% dairy-free plant energy',
      ingredients: ['Brown rice syrup', 'Whey protein concentrate', 'Almond butter']
    });

    // Case 9a: User is allergic to Dairy -> UNSAFE due to contradiction hazard
    const allergicUser = baseUser({ allergies: ['Dairy'] });
    const verdictAllergic = computeSafetyVerdict(contradictoryProduct, allergicUser);
    assert.equal(verdictAllergic.verdict, CANONICAL_VERDICTS.UNSAFE);

    // Case 9b: User is not allergic -> CAUTION due to packaging contradiction
    const generalUser = baseUser();
    const verdictGeneral = computeSafetyVerdict(contradictoryProduct, generalUser);
    assert.equal(verdictGeneral.verdict, CANONICAL_VERDICTS.CAUTION);
    assert.ok(verdictGeneral.factors.some((f) => f.name.includes('Contradictory packaging')));
  });

  // Mode 10: Unknown risk level with empty ingredients -> CANNOT_VERIFY
  it('Mode 10: Unknown risk level with empty ingredients returns CANNOT_VERIFY', () => {
    const product = {
      name: 'Mystery Product',
      ingredients: [],
      safetyInfo: {
        riskLevel: 'Unknown',
        allergens: []
      }
    };
    const user = baseUser();

    const verdict = computeSafetyVerdict(product, user);
    assert.equal(verdict.verdict, CANONICAL_VERDICTS.CANNOT_VERIFY);
    assert.equal(verdict.level, 'Unknown');
  });

  // Mode 11: Invalid dependent profile ID -> fail-closed (reject with 404)
  it('Mode 11: Invalid or unowned dependent profile ID fails closed with 404', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId().toString() },
      query: { profileId: 'invalid-profile-id-123' }
    };

    await assert.rejects(
      async () => {
        await resolveEffectiveUser(req);
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.equal(err.message, 'Profile not found');
        return true;
      }
    );
  });

  // Mode 12: Valid dependent profile ID -> evaluate against dependent preferences
  it('Mode 12: Valid dependent profile ID evaluates safety against dependent preferences', async () => {
    const ownerId = new mongoose.Types.ObjectId().toString();
    const childId = new mongoose.Types.ObjectId();

    // Stub Dependent.findOne
    const origFindOne = Dependent.findOne;
    Dependent.findOne = async ({ _id, owner }) => {
      if (_id === childId.toString() && owner === ownerId) {
        return {
          _id: childId,
          name: 'Tommy',
          owner: ownerId,
          preferences: {
            allergies: ['Peanuts'],
            dietaryRestrictions: [],
            medications: []
          }
        };
      }
      return null;
    };

    try {
      const req = {
        user: { id: ownerId, preferences: { allergies: [] } }, // Owner has NO allergies
        query: { profileId: childId.toString() }
      };

      const { effectiveUser, profileName } = await resolveEffectiveUser(req);
      assert.equal(profileName, 'Tommy');
      assert.deepEqual(effectiveUser.preferences.allergies, ['Peanuts']);

      // A peanut product evaluated for the owner would be SAFE, but for Tommy MUST BE UNSAFE
      const peanutSnack = baseProduct({
        ingredients: ['Peanuts', 'Salt']
      });

      const ownerVerdict = computeSafetyVerdict(peanutSnack, req.user);
      assert.equal(ownerVerdict.verdict, CANONICAL_VERDICTS.SAFE);

      const dependentVerdict = computeSafetyVerdict(peanutSnack, effectiveUser);
      assert.equal(dependentVerdict.verdict, CANONICAL_VERDICTS.UNSAFE);
    } finally {
      Dependent.findOne = origFindOne;
    }
  });

  // Mode 13: Gemini API timeout / error -> safety verdict delivered without AI
  it('Mode 13: Gemini API error or missing key delivers safety verdict without failure', async () => {
    const product = baseProduct({
      ingredients: ['Organic Rolled Oats', 'Honey']
    });
    const user = baseUser({ allergies: ['Dairy'] });

    // 1. Safety verdict is computed 100% deterministically without Gemini
    const safetyVerdict = computeSafetyVerdict(product, user);
    assert.equal(safetyVerdict.verdict, CANONICAL_VERDICTS.SAFE);

    // 2. Explainer service handles missing key or network error gracefully
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const aiResult = await explainIngredients(product, user);
      assert.equal(aiResult.success, false);
      assert.ok(aiResult.error.includes('GEMINI_API_KEY'));

      // The safety verdict remains unchanged and authoritative
      assert.equal(safetyVerdict.verdict, CANONICAL_VERDICTS.SAFE);
    } finally {
      process.env.GEMINI_API_KEY = origKey;
    }
  });

  // Mode 14: Gemini API malformed response -> graceful fallback without crashing
  it('Mode 14: Gemini API malformed response falls back gracefully without crashing', async () => {
    const product = baseProduct({
      ingredients: ['Strawberries', 'Cane Sugar']
    });
    const user = baseUser();

    const origKey = process.env.GEMINI_API_KEY;
    const origFetch = global.fetch;
    process.env.GEMINI_API_KEY = 'test-dummy-key';

    // Mock fetch returning malformed body (no candidates)
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ unexpectedKey: 'malformed structure' })
    });

    try {
      const result = await explainIngredients(product, user);
      assert.equal(result.success, false);
      assert.ok(result.error.includes('unexpected response format'));
    } finally {
      process.env.GEMINI_API_KEY = origKey;
      global.fetch = origFetch;
    }
  });
});
