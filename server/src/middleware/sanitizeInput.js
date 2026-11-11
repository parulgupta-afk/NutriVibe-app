/**
 * Global input sanitizer to mitigate NoSQL operator injection and path traversal keys.
 * Recursively deletes any object key starting with "$" or containing "."
 * from req.body, req.query, and req.params in place.
 */

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeObject(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    // Strip NoSQL operators and dot-notation property path traversals
    if (key.startsWith('
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }

  return obj;
}

/**
 * Express middleware to strip NoSQL operator injection keys from request objects.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

module.exports = {
  sanitizeInput,
  sanitizeObject,
};

) || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }

  return obj;
}

/**
 * Express middleware to strip NoSQL operator injection keys from request objects.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

module.exports = {
  sanitizeInput,
  sanitizeObject,
};

