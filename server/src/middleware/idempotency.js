/**
 * Phase 15: optional Idempotency-Key support.
 *
 * Client may send header: Idempotency-Key: <opaque string>
 * For the same authenticated user + key within TTL, the first successful
 * response is replayed (no second side effect).
 *
 * In-memory store — fine for single-instance dev/small deploy.
 * If Redis is available later, this can be swapped without changing the API.
 *
 * Only apply to mutation routes that need it (e.g. POST /tracking/log).
 */

const crypto = require('crypto');

const STORE = new Map(); // key → { status, body, expiresAt }
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_KEYS = 5000;

function cleanup() {
  const now = Date.now();
  for (const [k, v] of STORE.entries()) {
    if (v.expiresAt <= now) STORE.delete(k);
  }
  // rough cap
  if (STORE.size > MAX_KEYS) {
    const entries = [...STORE.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    for (let i = 0; i < entries.length - MAX_KEYS; i++) {
      STORE.delete(entries[i][0]);
    }
  }
}

function buildStoreKey(userId, rawKey) {
  const hash = crypto.createHash('sha256').update(String(rawKey)).digest('hex').slice(0, 32);
  return `${userId}:${hash}`;
}

/**
 * Express middleware. Safe no-op when header is absent.
 */
function idempotency(req, res, next) {
  const rawKey = req.get('Idempotency-Key') || req.get('idempotency-key');
  if (!rawKey || !req.user?.id) {
    return next();
  }

  if (String(rawKey).length > 128) {
    return res.status(400).json({
      success: false,
      message: 'Idempotency-Key too long (max 128 characters)',
      error: { code: 'VALIDATION_ERROR', message: 'Idempotency-Key too long' }
    });
  }

  cleanup();
  const storeKey = buildStoreKey(req.user.id, rawKey);
  const existing = STORE.get(storeKey);
  if (existing && existing.expiresAt > Date.now()) {
    res.set('Idempotency-Replayed', 'true');
    return res.status(existing.status).json(existing.body);
  }

  // Capture JSON responses
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const status = res.statusCode || 200;
    // Only cache successful create/ok responses
    if (status >= 200 && status < 300) {
      STORE.set(storeKey, {
        status,
        body,
        expiresAt: Date.now() + TTL_MS
      });
    }
    res.set('Idempotency-Key', String(rawKey).slice(0, 128));
    return originalJson(body);
  };

  next();
}

/** Test helper */
function _resetIdempotencyStore() {
  STORE.clear();
}

module.exports = {
  idempotency,
  buildStoreKey,
  _resetIdempotencyStore
};
