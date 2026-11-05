import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle } from 'react-icons/fi';
import Ring from './Ring.jsx';
import { VERDICT_STYLES, getVerdictConfig } from '../../utils/verdictStyles.js';

export { VERDICT_STYLES, getVerdictConfig };

const ICONS = {
  SAFE: FiCheckCircle,
  Safe: FiCheckCircle,
  CAUTION: FiAlertTriangle,
  Caution: FiAlertTriangle,
  UNSAFE: FiXCircle,
  Unsafe: FiXCircle,
  UNKNOWN: FiHelpCircle,
  Unknown: FiHelpCircle,
  CANNOT_VERIFY: FiHelpCircle
};

export default function VerdictRing({ verdict = 'Unknown', size = 168, score }) {
  const config = getVerdictConfig(verdict, score);
  const Icon = ICONS[verdict] || FiHelpCircle;

  return (
    <div
      role="status"
      aria-label={config.ariaLabel}
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-1 rounded-full animate-pulse opacity-40 pointer-events-none"
        style={{ border: `2px solid ${config.stroke}` }}
        aria-hidden="true"
      />
      <Ring size={size} stroke={10} pct={config.pct} color={config.stroke}>
        <Icon size={32} style={{ color: config.stroke }} aria-hidden="true" />
        <span
          className="text-base font-bold tracking-wide dark:text-white"
          style={{ color: config.text }}
        >
          {config.label}
        </span>
        {score != null && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Score: {score}/100
          </span>
        )}
      </Ring>
    </div>
  );
}
