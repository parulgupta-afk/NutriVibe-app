import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  truncateText,
  truncateWords,
  toTitleCase,
} from '../src/utils/textTruncate.js';

describe('client textTruncate utility tests', () => {
  it('truncates strings exceeding maxLength with suffix', () => {
    const longString = 'Fresh Organic Whole Milk with Vitamin D added';
    const truncated = truncateText(longString, 20);
    assert.equal(truncated, 'Fresh Organic Whole...');
  });

  it('leaves strings within maxLength untouched', () => {
    assert.equal(truncateText('Short text', 50), 'Short text');
  });

  it('truncates based on word count boundary', () => {
    const sentence = 'One two three four five six seven eight nine ten';
    const truncated = truncateWords(sentence, 5);
    assert.equal(truncated, 'One two three four five...');
  });

  it('converts mixed-case strings to clean Title Case', () => {
    assert.equal(toTitleCase('WHOLE WHEAT BREAD'), 'Whole Wheat Bread');
    assert.equal(toTitleCase('peanut butter crunch'), 'Peanut Butter Crunch');
  });

  it('handles null, empty, and non-string inputs safely', () => {
    assert.equal(truncateText(null), '');
    assert.equal(truncateWords(undefined), '');
    assert.equal(toTitleCase(null), '');
  });
});

