import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { safeStorage } from '../src/utils/storage.js';

describe('client safeStorage utility tests', () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  it('stores and retrieves primitive values via memory fallback', () => {
    safeStorage.setItem('token', 'jwt_test_123');
    assert.equal(safeStorage.getItem('token'), 'jwt_test_123');
  });

  it('stores and retrieves complex JSON objects and arrays', () => {
    const userProfile = { id: 'u1', name: 'Alex', allergies: ['Peanuts'] };
    safeStorage.setItem('profile', userProfile);
    assert.deepEqual(safeStorage.getItem('profile'), userProfile);
  });

  it('returns specified defaultValue when item does not exist', () => {
    assert.equal(safeStorage.getItem('nonexistent'), null);
    assert.equal(safeStorage.getItem('nonexistent', 'fallback'), 'fallback');
  });

  it('removes stored item cleanly', () => {
    safeStorage.setItem('key_to_delete', 42);
    assert.equal(safeStorage.getItem('key_to_delete'), 42);
    safeStorage.removeItem('key_to_delete');
    assert.equal(safeStorage.getItem('key_to_delete'), null);
  });

  it('clears all memory store entries when clear is invoked', () => {
    safeStorage.setItem('item_a', 1);
    safeStorage.setItem('item_b', 2);
    assert.equal(safeStorage.getItem('item_a'), 1);
    safeStorage.clear();
    assert.equal(safeStorage.getItem('item_a'), null);
    assert.equal(safeStorage.getItem('item_b'), null);
  });

  it('handles empty string key gracefully with defaultValue', () => {
    assert.equal(safeStorage.getItem('', 'defaultVal'), 'defaultVal');
  });
});

