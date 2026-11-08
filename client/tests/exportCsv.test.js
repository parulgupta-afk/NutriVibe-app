import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper mirroring client export formatting
function escapeCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatCsvRow(log) {
  const values = [
    log.createdAt ? new Date(log.createdAt).toISOString() : '',
    log.productName || '',
    log.brand || log.productBrand || '',
    log.riskLevel || '',
    log.profileName || 'Me',
    log.barcode || '',
  ];
  return values.map(escapeCell).join(',');
}

describe('client exportCsv utility tests', () => {
  it('escapes commas, double quotes, and newlines correctly', () => {
    assert.equal(escapeCell('Plain text'), 'Plain text');
    assert.equal(escapeCell('Text, with comma'), '"Text, with comma"');
    assert.equal(escapeCell('Text with "quotes"'), '"Text with ""quotes"""');
    assert.equal(escapeCell('Text\nwith newline'), '"Text\nwith newline"');
    assert.equal(escapeCell(null), '');
    assert.equal(escapeCell(undefined), '');
  });

  it('preserves clean numeric and alphabetical characters without quotes', () => {
    assert.equal(escapeCell('NutriVibe'), 'NutriVibe');
    assert.equal(escapeCell(12345), '12345');
  });

  it('formats log entries into a sanitized CSV row', () => {
    const log = {
      createdAt: '2026-11-03T12:00:00.000Z',
      productName: 'Oat Milk, Organic',
      brand: 'Nature"s Best',
      riskLevel: 'Safe',
      profileName: 'Child Profile',
      barcode: '1234567890123',
    };

    const row = formatCsvRow(log);
    assert.equal(
      row,
      '2026-11-03T12:00:00.000Z,"Oat Milk, Organic","Nature""s Best",Safe,Child Profile,1234567890123'
    );
  });

  it('defaults missing profile to Me and missing dates to empty string', () => {
    const log = {
      productName: 'Apple',
      barcode: '999',
    };

    const row = formatCsvRow(log);
    assert.equal(row, ',Apple,,,Me,999');
  });
});

