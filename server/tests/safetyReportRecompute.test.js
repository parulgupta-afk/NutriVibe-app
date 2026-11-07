const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const SafetyReport = require('../src/models/SafetyReport');
const Product = require('../src/models/Product');
const Dependent = require('../src/models/Dependent');
const { getSafetyReport } = require('../src/controllers/safetyController');

describe('Safety Report Dynamic Recomputation & Profile Isolation', () => {
  it('same product: user without allergy gets SAFE, then with Peanuts allergy gets UNSAFE, and findOne on SafetyReport is NEVER called', async () => {
    let findOneCalled = false;
    const origFindOne = SafetyReport.findOne;
    const origFindById = Product.findById;
    const origFindOneAndUpdate = SafetyReport.findOneAndUpdate;

    SafetyReport.findOne = () => {
      findOneCalled = true;
      throw new Error('SafetyReport.findOne must never be called when fetching a safety report');
    };

    const mockProduct = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Peanut Butter Cookies',
      ingredients: ['Wheat flour', 'Peanuts', 'Sugar'],
      safetyInfo: { allergens: ['peanuts'] },
      processingLevel: 'Processed',
    };

    Product.findById = async () => mockProduct;

    let upsertedDoc = null;
    SafetyReport.findOneAndUpdate = (filter, update) => {
      upsertedDoc = {
        _id: '507f1f77bcf86cd799439099',
        product: mockProduct,
        user: filter.user,
        riskAssessment: update.riskAssessment,
        recommendations: update.recommendations,
      };
      return {
        populate: async () => upsertedDoc,
        then: (resolve) => resolve(upsertedDoc),
      };
    };

    try {
      // Step 1: User has no allergies -> should get SAFE verdict
      const req1 = {
        params: { productId: '507f1f77bcf86cd799439011' },
        user: { id: '507f1f77bcf86cd799439001', _id: '507f1f77bcf86cd799439001', preferences: { allergies: [] } },
        query: {},
      };

      let response1 = null;
      const res1 = {
        status: (code) => {
          assert.equal(code, 200);
          return res1;
        },
        json: (data) => {
          response1 = data;
          return res1;
        },
      };

      await getSafetyReport(req1, res1, () => {});

      assert.equal(response1.success, true);
      assert.equal(response1.data.riskAssessment.verdict, 'SAFE');
      assert.equal(response1.data.riskAssessment.ruleVersion, '2.2.0');
      assert.equal(response1.data.riskAssessment.dataCompleteness, 'COMPLETE');
      assert.equal(findOneCalled, false, 'findOne must not be called on first request');

      // Step 2: Same product, but user profile now has "Peanuts" allergy -> must recompute to UNSAFE!
      const req2 = {
        params: { productId: '507f1f77bcf86cd799439011' },
        user: { id: '507f1f77bcf86cd799439001', _id: '507f1f77bcf86cd799439001', preferences: { allergies: ['Peanuts'] } },
        query: {},
      };

      let response2 = null;
      const res2 = {
        status: (code) => {
          assert.equal(code, 200);
          return res2;
        },
        json: (data) => {
          response2 = data;
          return res2;
        },
      };

      await getSafetyReport(req2, res2, () => {});

      assert.equal(response2.success, true);
      assert.equal(response2.data.riskAssessment.verdict, 'UNSAFE');
      assert.equal(response2.data.riskAssessment.ruleVersion, '2.2.0');
      assert.equal(response2.data.riskAssessment.dataCompleteness, 'COMPLETE');
      assert.equal(findOneCalled, false, 'findOne must not be called on second request');
    } finally {
      SafetyReport.findOne = origFindOne;
      Product.findById = origFindById;
      SafetyReport.findOneAndUpdate = origFindOneAndUpdate;
    }
  });

  it('rejects foreign or unknown profileId with 404 without falling back to owner preferences', async () => {
    const origDependentFindOne = Dependent.findOne;
    Dependent.findOne = async () => null;

    try {
      const req = {
        params: { productId: '507f1f77bcf86cd799439011' },
        user: { id: '507f1f77bcf86cd799439001', _id: '507f1f77bcf86cd799439001', preferences: { allergies: [] } },
        query: { profileId: '507f1f77bcf86cd799439099' },
      };

      let statusCode = null;
      let errorBody = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          errorBody = data;
          return res;
        },
      };

      await getSafetyReport(req, res, () => {});

      assert.equal(statusCode, 404);
      assert.equal(errorBody.success, false);
      assert.match(errorBody.message, /Profile not found/i);
    } finally {
      Dependent.findOne = origDependentFindOne;
    }
  });

  it('evaluates dependent profile correctly and does NOT upsert stored report for dependent', async () => {
    const origDependentFindOne = Dependent.findOne;
    const origFindById = Product.findById;
    let findOneAndUpdateCalled = false;
    const origFindOneAndUpdate = SafetyReport.findOneAndUpdate;

    SafetyReport.findOneAndUpdate = async () => {
      findOneAndUpdateCalled = true;
    };

    const mockProduct = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Milk Chocolate',
      ingredients: ['Milk', 'Cocoa', 'Sugar'],
      safetyInfo: { allergens: ['dairy'] },
      processingLevel: 'Processed',
    };

    Product.findById = async () => mockProduct;

    Dependent.findOne = async () => ({
      _id: '507f1f77bcf86cd799439022',
      name: 'Baby John',
      owner: '507f1f77bcf86cd799439001',
      preferences: { allergies: ['dairy'] },
    });

    try {
      const req = {
        params: { productId: '507f1f77bcf86cd799439011' },
        user: { id: '507f1f77bcf86cd799439001', _id: '507f1f77bcf86cd799439001', preferences: { allergies: [] } }, // owner has no allergies
        query: { profileId: '507f1f77bcf86cd799439022' },
      };

      let responseData = null;
      const res = {
        status: (code) => {
          assert.equal(code, 200);
          return res;
        },
        json: (data) => {
          responseData = data;
          return res;
        },
      };

      await getSafetyReport(req, res, () => {});

      assert.equal(responseData.success, true);
      assert.equal(responseData.data.riskAssessment.verdict, 'UNSAFE');
      assert.equal(responseData.data.profileName, 'Baby John');
      assert.equal(findOneAndUpdateCalled, false, 'Reports for dependents must not be upserted into stored owner reports');
    } finally {
      Dependent.findOne = origDependentFindOne;
      Product.findById = origFindById;
      SafetyReport.findOneAndUpdate = origFindOneAndUpdate;
    }
  });
});
