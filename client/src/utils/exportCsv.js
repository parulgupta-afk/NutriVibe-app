/**
 * Phase 5: export daily tracking logs as CSV (client-side, no backend needed).
 */
/**
 * Escapes CSV special characters (quotes, commas, newlines) according to RFC 4180.
 * @param {*} value - Cell value to escape
 * @returns {string} Sanitized CSV cell value
 */
function escapeCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * @param {Array} logs - recentLogs or filtered logs from dashboard
 * @param {string} dateLabel - e.g. 2026-08-20
 */
/**
 * Exports client tracking logs into a downloadable CSV blob.
 * @param {Array<object>} logs
 * @param {string} dateLabel
 * @returns {void}
 */
export function downloadLogsCsv(logs = [], dateLabel = 'export') {
  // Column headers for exported CSV document
  const headers = ['Time', 'Product', 'Brand', 'Safety', 'Profile', 'Barcode'];
  const rows = logs.map((log) => [
    log.createdAt ? new Date(log.createdAt).toISOString() : '',
    log.productName || '',
    log.brand || log.productBrand || '',
    log.riskLevel || '',
    log.profileName || 'Me',
    log.barcode || ''
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutrivibe-logs-${dateLabel}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
