/**
 * Scan result UI — exact CAUTION design from NutriVibe 2.0 PDF
 * Demo + reusable pattern for live product verdicts
 */
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { FiArrowLeft, FiAlertTriangle, FiShield } from 'react-icons/fi';

export default function ScanResultDemo() {
  const nav = useNavigate();
  const loc = useLocation();
  const data = loc.state || {
    name: 'Dark chocolate bar',
    subtitle: 'Potential allergen exposure',
    verdict: 'CAUTION',
    ingredients: ['Cocoa powder', 'Milk solids', 'Sugar', 'Emulsifier'],
    warningChip: 'May contain traces of peanuts',
    explanation:
      'Your profile lists a peanut allergy. The label carries a precautionary statement, so possible exposure is flagged.',
    action: 'Choose a product without a peanut statement, or ask your clinician if you are unsure.',
  };

  const isCaution = /caution|warn/i.test(data.verdict);
  const isUnsafe = /unsafe|bad/i.test(data.verdict);

  const ring = isUnsafe
    ? 'border-nv-bad text-nv-bad'
    : isCaution
      ? 'border-nv-warn text-nv-warn'
      : 'border-nv-safe text-nv-safe';

  return (
    <AppShell>
      <div className="max-w-md mx-auto rise">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="flex items-center gap-2 text-sm text-nv-mute mb-6 hover:text-nv-ink"
        >
          <FiArrowLeft /> Scan result
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-36 h-36 rounded-full border-[3px] grid place-items-center mb-5 pop ${ring}`}>
            <div>
              <FiAlertTriangle className="mx-auto text-2xl mb-1" />
              <div className="font-semibold tracking-wide text-sm">{(data.verdict || 'CAUTION').toUpperCase()}</div>
            </div>
          </div>
          <h1 className="serif text-2xl font-semibold text-nv-ink">{data.name}</h1>
          <p className="text-sm text-nv-warn mt-1">{data.subtitle}</p>
        </div>

        <div className="mb-5">
          <div className="text-[11px] font-semibold tracking-wider text-nv-mute mb-2">WHAT THE LABEL SAYS</div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {(data.ingredients || []).map((ing) => (
              <span key={ing} className="chip chip-mute">{ing}</span>
            ))}
            {data.warningChip && (
              <span className="chip chip-warn">{data.warningChip}</span>
            )}
          </div>
        </div>

        <p className="text-sm text-nv-ink leading-relaxed mb-4">{data.explanation}</p>

        <div className="rounded-2xl bg-nv-warn-t border border-nv-warn/20 px-4 py-3.5 mb-6 text-sm text-nv-warn-x leading-snug flex gap-2.5">
          <FiShield className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">What to do. </span>
            {data.action}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link to="/favorites" className="btn-primary flex-1 text-center">Safer alternatives</Link>
          <Link to="/scanner" className="btn-secondary flex-1 text-center">Scan another</Link>
        </div>

        <p className="text-[12px] text-nv-mute text-center leading-snug">
          The rules engine decides the verdict. Gemini only explains it. Not medical advice.
        </p>
      </div>
    </AppShell>
  );
}
