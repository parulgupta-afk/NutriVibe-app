const { AppError } = require('../errors/AppError');

/**
 * Central error handler (Phase 5).
 * Keeps top-level `message` for existing frontend code.
 * Adds `error: { code, message }` for new clients / docs.
 * Never leaks secrets, stacks, or Mongo internals in production.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  console.error('Error:', {
    name: err.name,
    message: err.message,
    code,
    path: req.path,
    method: req.method,
    statusCode,
    ...(isDev ? { stack: err.stack } : {})
  });

  if (err.name === 'CastError') {
    message = 'Resource not found';
    code = 'NOT_FOUND';
    statusCode = 404;
  }

  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    message = `Duplicate value for ${field}. Please use a unique value.`;
    code = 'CONFLICT';
    statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ') || 'Validation failed';
    code = 'VALIDATION_ERROR';
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    code = 'UNAUTHORIZED';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    code = 'UNAUTHORIZED';
    statusCode = 401;
  }

  if (!(err instanceof AppError) && statusCode === 500) {
    code = 'INTERNAL_ERROR';
    if (!isDev) {
      message = 'Something went wrong. Please try again.';
    }
  }

  const response = {
    success: false,
    message,
    error: {
      code,
      message
    }
  };

  if (isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
