import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatTime, isToday } from '../src/utils/dateFormatter.js';

describe('client dateFormatter utility tests', () => {
  it('formats valid ISO dates into YYYY-MM-DD', () => {
    assert.equal(formatDate('2026-11-04T12:00:00Z'), '2026-11-04');
    assert.equal(formatDate(new Date('2026-05-15T00:00:00Z')), '2026-05-15');
  });

  it('handles null, undefined, and invalid date inputs with fallback', () => {
    assert.equal(formatDate(null), 'N/A');
    assert.equal(formatDate(undefined, 'Unknown'), 'Unknown');
    assert.equal(formatDate('invalid-date-string'), 'N/A');
  });

  it('formats time component into HH:MM format', () => {
    const fixedDate = new Date('2026-11-04T14:30:00');
    assert.match(formatTime(fixedDate), /^\d{2}:\d{2}$/);
    assert.equal(formatTime(null), '--:--');
    assert.equal(formatTime('invalid-time', 'None'), 'None');
  });

  it('identifies today correctly', () => {
    assert.equal(isToday(new Date()), true);
    assert.equal(isToday(new Date('2020-01-01')), false);
    assert.equal(isToday(null), false);
    assert.equal(isToday('not-a-date'), false);
  });
});

