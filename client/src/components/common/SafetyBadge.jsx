import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle } from 'react-icons/fi';

/**
 * Phase 3: consistent Safe / Caution / Unsafe / Unknown badge.
 */
const STYLES = {
  Safe: {
    wrap: 'bg-green-50 border-green-200 text-green-800',
    icon: FiCheckCircle,
    label: 'Safe'
  },
  SAFE: {
    wrap: 'bg-green-50 border-green-200 text-green-800',
    icon: FiCheckCircle,
    label: 'Safe'
  },
  Caution: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: FiAlertTriangle,
    label: 'Caution'
  },
  CAUTION: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: FiAlertTriangle,
    label: 'Caution'
  },
  Unsafe: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: FiXCircle,
    label: 'Unsafe'
  },
  UNSAFE: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: FiXCircle,
    label: 'Unsafe'
  },
  Unknown: {
    wrap: 'bg-gray-100 border-gray-300 text-gray-700',
    icon: FiHelpCircle,
    label: 'Cannot Verify'
  },
  'Cannot Verify': {
    wrap: 'bg-gray-100 border-gray-300 text-gray-700',
    icon: FiHelpCircle,
    label: 'Cannot Verify'
  },
  UNKNOWN: {
    wrap: 'bg-gray-100 border-gray-300 text-gray-700',
    icon: FiHelpCircle,
    label: 'Cannot Verify'
  },
  CANNOT_VERIFY: {
    wrap: 'bg-gray-100 border-gray-300 text-gray-700',
    icon: FiHelpCircle,
    label: 'Cannot Verify'
  }
};

const SafetyBadge = ({ level = 'Unknown', score, size = 'md', className = '' }) => {
  const key = STYLES[level] ? level : 'Unknown';
  const style = STYLES[key];
  const Icon = style.icon;
  const sizeClass =
    size === 'lg'
      ? 'px-4 py-2 text-base gap-2'
      : size === 'sm'
        ? 'px-2 py-0.5 text-xs gap-1'
        : 'px-3 py-1 text-sm gap-1.5';

  return (
    <span
      role="status"
      aria-label={`Safety level: ${style.label}${score != null ? `, score ${score}` : ''}`}
      className={`inline-flex items-center font-semibold rounded-full border ${style.wrap} ${sizeClass} ${className}`}
    >
      <Icon aria-hidden="true" className="flex-shrink-0" />
      <span>{style.label}</span>
      {score != null && (
        <span className="opacity-70 font-normal">· {score}</span>
      )}
    </span>
  );
};

export default SafetyBadge;
