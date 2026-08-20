/**
 * Phase 4: never leak stacks, internal details, or tokens in production.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  const isDev = process.env.NODE_ENV === 'development';

  // Safe log — no Authorization headers, no body dumps
  console.error('Error:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode,
    ...(isDev ? { stack: err.stack } : {})
  });

  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    message = `Duplicate value for ${field}. Please use a unique value.`;
    statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ') || 'Validation failed';
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  const response = {
    success: false,
    message: statusCode === 500 && !isDev ? 'Something went wrong. Please try again.' : message
  };

  if (isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
