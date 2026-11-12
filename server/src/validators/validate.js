/**
 * Shared validate middleware.
 * Usage: router.post('/x', validate({ body: schema }), handler)
 */
// Configures validation middleware for request body, query, and params schemas
function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    const details = [];
    try {
      if (body) {
        const r = body.safeParse(req.body);
        if (!r.success) {
          r.error.issues.forEach((i) => details.push({ field: i.path.join('.') || 'body', message: i.message }));
        } else {
          req.body = r.data;
        }
      }
      if (query) {
        const r = query.safeParse(req.query);
        if (!r.success) {
          r.error.issues.forEach((i) => details.push({ field: i.path.join('.') || 'query', message: i.message }));
        } else {
          req.query = r.data;
        }
      }
      if (params) {
        const r = params.safeParse(req.params);
        if (!r.success) {
          r.error.issues.forEach((i) => details.push({ field: i.path.join('.') || 'params', message: i.message }));
        } else {
          req.params = r.data;
        }
      }
      if (details.length) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: { details },
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { validate };
