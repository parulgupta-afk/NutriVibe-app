/**
 * Phase 5: export daily tracking logs as CSV (client-side, no backend needed).
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
export function downloadLogsCsv(logs = [], dateLabel = 'export') {
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
