/**
 * Standardized date & timestamp formatting helpers for NutriVibe client.
 */

/**
 * Format date input to ISO YYYY-MM-DD string.
 * @param {string|Date|number} dateInput
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export function formatDate(dateInput, fallback = 'N/A') {
  if (!dateInput) return fallback;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().split('T')[0];
}

export function formatTime(dateInput, fallback = '--:--') {
  if (!dateInput) return fallback;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toTimeString().slice(0, 5);
}

export function isToday(dateInput) {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

