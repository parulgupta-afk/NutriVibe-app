import Ring from './Ring.jsx';
import { Icons } from './icons.js';

export const verdictStyle = {
  SAFE: { stroke: '#2F7D4F', text: '#1F5A37', tint: '#DCEBDD', icon: 'check', chip: 'ok' },
  CAUTION: { stroke: '#B7791F', text: '#7A4E08', tint: '#F4E7C8', icon: 'alert', chip: 'warn' },
  UNSAFE: { stroke: '#B3382C', text: '#8C2A20', tint: '#F2D9D4', icon: 'x', chip: 'bad' },
  CANNOT_VERIFY: { stroke: '#6B7280', text: '#374151', tint: '#E5E7EB', icon: 'alert', chip: 'mute' },
  UNKNOWN: { stroke: '#6B7280', text: '#374151', tint: '#E5E7EB', icon: 'alert', chip: 'mute' },
};

/**
 * The signature Verdict Ring: a full-circle sweep in the verdict colour,
 * a status icon and word (never colour alone) and a soft pulsing halo.
 */
export default function VerdictRing({ verdict, size = 184 }) {
  const v = verdictStyle[verdict] || verdictStyle.CANNOT_VERIFY;
  const Icon = Icons[v.icon] || Icons.alert;
  const displayLabel = verdict === 'CANNOT_VERIFY' ? 'CANNOT VERIFY' : (verdict || 'UNKNOWN');
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-1.5 animate-pulseRing rounded-full"
        style={{ border: `2px solid ${v.stroke}` }}
        aria-hidden="true"
      />
      <Ring size={size} stroke={12} pct={1} color={v.stroke}>
        <Icon size={36} strokeWidth={2} style={{ color: v.text }} aria-hidden />
        <span className="font-serif text-[22px] font-semibold tracking-[.02em]" style={{ color: v.text }}>
          {displayLabel}
        </span>
      </Ring>
    </div>
  );
}
