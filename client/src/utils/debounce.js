/**
 * Debounce helper for search inputs and rapid user interactions.
 */

/**
 * Creates a debounced function that delays invoking func until after wait ms.
 * Debounced instance maintains cancel() method to clear any pending timer.
 * @param {Function} func
 * @param {number} [wait=300] - Delay in milliseconds
 * @returns {Function & { cancel: () => void }}
 */
export function debounce(func, wait = 300) {
  let timeoutId = null;

  function debounced(...args) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

