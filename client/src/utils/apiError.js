/**
 * Phase 23: normalize API error messages for toasts / UI.
 * Prefers server `message`, then `error.message`, then status text.
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

export function isUnauthorized(error) {
  return error?.response?.status === 401;
}
