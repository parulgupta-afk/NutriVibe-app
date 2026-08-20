/**
 * Phase 5: remember the last successful scan on this device
 * so the Scanner can offer a one-tap re-open if the network is slow.
 */
const KEY = 'nutrivibe_last_scan';

export function saveLastScan({ barcode, name, brand, safetyLevel }) {
  try {
    const payload = {
      barcode,
      name: name || '',
      brand: brand || '',
      safetyLevel: safetyLevel || 'Unknown',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // private mode / quota — ignore
  }
}

export function loadLastScan() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastScan() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
