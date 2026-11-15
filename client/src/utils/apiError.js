/**
 * Phase 23: normalize API error messages for toasts / UI.
 * Gracefully resolves top-level message, nested error object, or fallback string.
 * Prefers server `message`, then `error.message`, then status text.
 */
/**
 * Normalizes HTTP or network errors into human-readable strings for UI display.
 * @param {object|Error|null} error Axios or JavaScript error instance
 * @param {string} [fallback='Something went wrong'] Fallback string when error message is unavailable
 * @returns {string} User-facing error message
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback;

  const data = error.response?.data;
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
    return data.error.message;
  }
  if (Array.isArray(data?.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  if (error.message === 'Network Error') {
    return 'Cannot reach the server. Is the API running?';
  }
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

/**
 * Evaluates whether an error object corresponds to an HTTP 401 Unauthorized response.
 * @param {object|null} error Axios error object
 * @returns {boolean} True if status is 401
 */
export function isUnauthorized(error) {
  return error?.response?.status === 401;
}
