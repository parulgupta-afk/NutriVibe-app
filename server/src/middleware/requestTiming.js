/**
 * Phase 10: lightweight request duration logger.
 * Does not change responses. Helps establish a performance baseline.
 */
function requestTiming(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    // Skip noisy static/health spam optional: always log API
    if (req.originalUrl?.startsWith('/api')) {
      console.log(
        JSON.stringify({
          type: 'request_timing',
          method: req.method,
          path: req.route?.path || req.path,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: Math.round(ms * 10) / 10
        })
      );
    }
  });

  next();
}

module.exports = { requestTiming };
