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

  it('setItem returns true on successful storage', () => {
    assert.equal(safeStorage.setItem('key_flag', 'val'), true);
  });

  it('handles removeItem on non-existent key without error', () => {
    assert.doesNotThrow(() => safeStorage.removeItem('missing_key_xyz'));
  });

  it('stores and retrieves boolean values accurately', () => {
    safeStorage.setItem('is_active', false);
    assert.equal(safeStorage.getItem('is_active'), false);
  });

  it('stores and retrieves numeric zero without converting to falsy fallback', () => {
    safeStorage.setItem('zero_val', 0);
    assert.equal(safeStorage.getItem('zero_val'), 0);
  });

  it('stores and retrieves empty string without converting to fallback', () => {
    safeStorage.setItem('empty_str', '');
    assert.equal(safeStorage.getItem('empty_str'), '');
  });

  it('safeStorage.getItem returns custom default value when key does not exist', () => {
    assert.equal(safeStorage.getItem('missing_custom', 'custom_default'), 'custom_default');
  });

  it('safeStorage.getItem returns null by default when key is missing and no fallback provided', () => {
    assert.equal(safeStorage.getItem('nonexistent_key_xyz'), null);
  });

  it('safeStorage.removeItem removes stored key cleanly', () => {
    safeStorage.setItem('temp_remove_key', 'abc');
    safeStorage.removeItem('temp_remove_key');
    assert.equal(safeStorage.getItem('temp_remove_key'), null);
  });
});

