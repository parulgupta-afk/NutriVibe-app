/**
 * Phase 8 — Pino structured logger with redaction.
 * Replace console.* and morgan with this.
 *
 * Install: npm install pino pino-http
 */

let pino;
try {
  pino = require('pino');
} catch {
  pino = null;
}

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
  'req.body.email',
  'res.headers["set-cookie"]',
];

function createLogger(opts = {}) {
  if (!pino) {
    return {
      info: (...a) => console.log('[info]', ...a),
      warn: (...a) => console.warn('[warn]', ...a),
      error: (...a) => console.error('[error]', ...a),
      child: () => createLogger(),
    };
  }
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: { paths: REDACT_PATHS, remove: true },
    ...opts,
  });
}

const logger = createLogger();

/** Express middleware – attach request id and log request/response */
function requestLogger(req, res, next) {
  const id = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  req.id = id;
  res.setHeader('x-request-id', id);
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      reqId: id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
}

module.exports = { logger, requestLogger, createLogger, REDACT_PATHS };
