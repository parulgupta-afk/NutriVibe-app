import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getApiErrorMessage, isUnauthorized } from '../src/utils/apiError.js';
import { saveLastScan, loadLastScan, clearLastScan } from '../src/utils/lastScanCache.js';

describe('client apiError utils', () => {
  it('returns fallback message when error is null or undefined', () => {
    assert.equal(getApiErrorMessage(null), 'Something went wrong');
    assert.equal(getApiErrorMessage(undefined, 'Custom fallback'), 'Custom fallback');
  });

  it('extracts top-level response.data.message', () => {
    const error = {
      response: {
        data: { message: 'User not found' },
      },
    };
    assert.equal(getApiErrorMessage(error), 'User not found');
  });

  it('extracts nested response.data.error.message', () => {
    const error = {
      response: {
        data: { error: { message: 'Invalid credentials' } },
      },
    };
    assert.equal(getApiErrorMessage(error), 'Invalid credentials');
  });

  it('extracts first item message from response.data.errors array', () => {
    const error = {
      response: {
        data: {
          errors: [{ message: 'Email is required' }, { message: 'Password is required' }],
        },
      },
    };
    assert.equal(getApiErrorMessage(error), 'Email is required');
  });

  it('identifies network errors gracefully', () => {
    const error = new Error('Network Error');
    assert.equal(getApiErrorMessage(error), 'Cannot reach the server. Is the API running?');
  });

  it('correctly checks for 401 unauthorized status', () => {
    assert.equal(isUnauthorized({ response: { status: 401 } }), true);
    assert.equal(isUnauthorized({ response: { status: 403 } }), false);
    assert.equal(isUnauthorized(null), false);
  });
});

describe('client lastScanCache utils', () => {
  // Mock localStorage for Node test runner
  const mockStorage = new Map();
  globalThis.localStorage = {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  };

  it('saves and retrieves the last scan barcode and details', () => {
    saveLastScan({
      barcode: '1234567890123',
      name: 'Organic Almond Milk',
      brand: 'NatureFresh',
      safetyLevel: 'Safe',
    });

    const loaded = loadLastScan();
    assert.ok(loaded);
    assert.equal(loaded.barcode, '1234567890123');
    assert.equal(loaded.name, 'Organic Almond Milk');
    assert.equal(loaded.brand, 'NatureFresh');
    assert.equal(loaded.safetyLevel, 'Safe');
    assert.ok(loaded.savedAt);
  });

  it('clears stored last scan correctly', () => {
    clearLastScan();
    assert.equal(loadLastScan(), null);
  });
});

