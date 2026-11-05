import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiHelpCircle } from 'react-icons/fi';
import Ring from './Ring.jsx';

export const VERDICT_STYLES = {
  SAFE: {
    stroke: '#10B981',
    text: '#065F46',
    label: 'SAFE',
    icon: FiCheckCircle,
    pct: 1
  },
  Safe: {
    stroke: '#10B981',
    text: '#065F46',
    label: 'SAFE',
    icon: FiCheckCircle,
    pct: 1
  },
  CAUTION: {
    stroke: '#F59E0B',
    text: '#92400E',
    label: 'CAUTION',
    icon: FiAlertTriangle,
    pct: 0.65
  },
  Caution: {
    stroke: '#F59E0B',
    text: '#92400E',
    label: 'CAUTION',
    icon: FiAlertTriangle,
    pct: 0.65
  },
  UNSAFE: {
    stroke: '#EF4444',
    text: '#991B1B',
    label: 'UNSAFE',
    icon: FiXCircle,
    pct: 0.25
  },
  Unsafe: {
    stroke: '#EF4444',
    text: '#991B1B',
    label: 'UNSAFE',
    icon: FiXCircle,
    pct: 0.25
  },
  UNKNOWN: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    icon: FiHelpCircle,
    pct: 0.5
  },
  Unknown: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    icon: FiHelpCircle,
    pct: 0.5
  },
  CANNOT_VERIFY: {
    stroke: '#6B7280',
    text: '#374151',
    label: 'CANNOT VERIFY',
    icon: FiHelpCircle,
    pct: 0.5
  }
};

export default function VerdictRing({ verdict = 'Unknown', size = 168, score }) {
  const v = VERDICT_STYLES[verdict] || VERDICT_STYLES.Unknown;
  const Icon = v.icon;
  const pct = score != null ? Math.max(0, Math.min(100, score)) / 100 : v.pct;

  return (
    <div
      role="status"
      aria-label={`Safety verdict: ${v.label}${score != null ? `, score ${score}` : ''}`}
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-1 rounded-full animate-pulse opacity-40 pointer-events-none"
        style={{ border: `2px solid ${v.stroke}` }}
        aria-hidden="true"
      />
      <Ring size={size} stroke={10} pct={pct} color={v.stroke}>
        <Icon size={32} style={{ color: v.stroke }} aria-hidden="true" />
        <span
          className="text-base font-bold tracking-wide dark:text-white"
          style={{ color: v.text }}
        >
          {v.label}
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
