/**
 * Strips MongoDB operator injection from user input.
 * Removes any object key that starts with "$" or contains "." (recursively) from
 * req.body, req.query and req.params, so payloads like {"email":{"$ne":null}}
 * can never reach a query as an operator. Mutates in place (Express 5 req.query
 * is a getter, so we edit the returned object rather than reassign it).
 */
function clean(value, depth = 0) {
  if (depth > 20 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = clean(value[i], depth + 1);
    return value;
  }
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
    } else {
      value[key] = clean(value[key], depth + 1);
    }
  }
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
}

module.exports = { sanitizeInput, clean };
