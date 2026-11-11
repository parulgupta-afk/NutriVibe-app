import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEanChecksum,
  isValidBarcode,
} from '../src/utils/barcodeValidator.js';

describe('client barcodeValidator utility tests', () => {
  it('calculates correct check digit for standard EAN-13', () => {
    // 4006381333931 -> payload 400638133393 -> check digit 1
    const check = calculateEanChecksum('400638133393');
    assert.equal(check, 1);
  });

  it('validates a genuine EAN-13 barcode as true', () => {
    assert.equal(isValidBarcode('4006381333931'), true);
  });

  it('detects corrupted or mismatched checksum digits', () => {
    // Check digit modified to 9
    assert.equal(isValidBarcode('4006381333939'), false);
  });

  it('rejects invalid barcode lengths or non-numeric strings', () => {
    assert.equal(isValidBarcode('123'), false);
    assert.equal(isValidBarcode('abc4006381333931'), false);
    assert.equal(isValidBarcode(''), false);
    assert.equal(isValidBarcode(null), false);
    assert.equal(isValidBarcode(undefined), false);
    assert.equal(calculateEanChecksum(null), null);
    assert.equal(calculateEanChecksum(undefined), null);
    assert.equal(calculateEanChecksum(''), null);
  });

  it('rejects 13-character string containing alphabetic characters', () => {
    assert.equal(isValidBarcode('400638133393A'), false);
  });

  it('returns false for barcode containing spaces within digits', () => {
    assert.equal(isValidBarcode('40063813339 31'), false);
  });
});

