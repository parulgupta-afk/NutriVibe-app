/**
 * Phase 21: structured request logging.
 * Fields: requestId, method, path, status, durationMs, userId (if auth).
 * Never logs passwords, tokens, API keys, or full bodies.
 */
const crypto = require('crypto');

/**
 * Express middleware for structured JSON HTTP request/response logging.
 * Injects or preserves X-Request-Id header and logs elapsed time on response finish.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const requestId =
    req.get('X-Request-Id') || crypto.randomBytes(8).toString('hex');
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const entry = {
      type: 'http',
      requestId,
      method: req.method,
      path: req.originalUrl?.split('?')[0] || req.path,
      status: res.statusCode,
      durationMs: Math.round(ms * 10) / 10,
      userId: req.user?.id || req.user?._id || undefined
    };
    // Single-line JSON for log aggregators
    console.log(JSON.stringify(entry));
  });

  next();
}

module.exports = { requestLogger };
