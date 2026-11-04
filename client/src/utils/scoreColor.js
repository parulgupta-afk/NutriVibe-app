/**
 * Health & safety score (0-100) color mapping utility for UI progress bars and badges.
 */

export function getScoreColor(score) {
  if (score == null || Number.isNaN(Number(score))) {
    return {
      text: 'text-gray-500',
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      bar: 'bg-gray-400',
      label: 'Unknown',
    };
  }

  const num = Number(score);

  if (num >= 80) {
    return {
      text: 'text-green-700 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/40',
      border: 'border-green-300 dark:border-green-800',
      bar: 'bg-green-500',
      label: 'Excellent',
    };
  }

  if (num >= 60) {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-300 dark:border-emerald-800',
      bar: 'bg-emerald-500',
      label: 'Good',
    };
  }

  if (num >= 40) {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-800',
      bar: 'bg-amber-500',
      label: 'Fair',
    };
  }

  return {
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-800',
    bar: 'bg-red-500',
    label: 'Poor',
  };
}

