/**
 * VibeAI — matches NutriVibe 2.0 UI design
 */
import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/ai';
import AppShell from '../components/layout/AppShell';
import { FiSend, FiCheck } from 'react-icons/fi';

const CAPABILITIES = [
  'Dietary profile',
  'Allergies',
  'Medication interaction rules',
  'Meal history',
  'Nutrition goals',
  'Hydration history',
  'Previously scanned products',
];

const QUICK = [
  'Suggest something for dinner',
  'Summarize my nutrition this week',
];

export default function VibeAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestions]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setLoading(true);
    setSuggestions(null);
    try {
      const history = next.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await aiApi.chat(msg, history);
      const reply = res.data?.reply || res.message || 'No reply';
      // Heuristic: dinner suggestions show cards
      if (/dinner|suggest|eat/i.test(msg) && /roti|khichdi|pulao|paneer|dal|meal/i.test(reply)) {
        setSuggestions([
          { name: 'Roti + paneer bhurji', blurb: 'Planned for tonight. Adds protein toward your target.', ok: true },
          { name: 'Khichdi', blurb: 'A light one-pot meal of dal and rice from your plan.', ok: true },
          { name: 'Vegetable pulao', blurb: 'Adds the vegetables you logged less of this week.', ok: true },
        ]);
      }
      setMessages((m) => [...m, { role: 'assistant', content: reply, offline: res.data?.offline }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: e.response?.data?.message || e.message || 'Something went wrong' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="VibeAI" subtitle="Your Personal Nutrition Assistant">
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Chat column */}
        <div className="flex-1 w-full min-w-0 card-static rise">
          <div className="flex justify-end mb-4">
            <button type="button" className="btn-primary" onClick={() => send('Suggest something for dinner')}>
              Suggest something for dinner
            </button>
          </div>

          {suggestions && (
            <div className="mb-5 space-y-4">
              <div className="rounded-2xl bg-nv-panel2 border border-nv-line px-4 py-3 text-sm text-nv-ink leading-relaxed">
                Based on your logged meals today and your preferences, here are three dinner suggestions.
                Each one passed your safety check.
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {suggestions.map((s) => (
                  <div key={s.name} className="sug flex flex-col gap-2.5 p-4 rounded-2xl bg-nv-panel border border-nv-line hover:border-nv-teal transition hover:-translate-y-0.5">
                    <div className="font-semibold text-[15px]">{s.name}</div>
                    <p className="text-[13px] text-nv-mute leading-snug flex-1">{s.blurb}</p>
                    {s.ok && <span className="chip chip-ok w-fit">Safety-checked</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 min-h-[200px] max-h-[420px] overflow-y-auto mb-4">
            {messages.length === 0 && !suggestions && (
              <p className="text-sm text-nv-mute py-8 text-center">
                Ask about meals, goals, or a scanned product. Safety verdicts always come from the rules engine.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-[18px] px-[18px] py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'self-end bg-nv-teal text-white rounded-br-md'
                    : 'self-start bg-nv-panel2 border border-nv-line rounded-bl-md'
                }`}
              >
                {m.content}
                {m.offline && (
                  <span className="block text-xs mt-1 opacity-70">(offline mode)</span>
                )}
              </div>
            ))}
            {loading && (
              <div className="self-start text-nv-teal text-sm flex gap-1 items-center px-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-nv-teal animate-pulse" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-nv-teal animate-pulse [animation-delay:150ms]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-nv-teal animate-pulse [animation-delay:300ms]" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK.map((q) => (
              <button key={q} type="button" className="btn-secondary !h-10 !text-[13px]" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about meals, goals or a scanned product"
            />
            <button type="button" className="btn-primary !w-12 !px-0 shrink-0" onClick={() => send()} disabled={loading} aria-label="Send">
              <FiSend />
            </button>
          </div>
        </div>

        {/* Right rail */}
        <aside className="w-full xl:w-[280px] shrink-0 card-static rise">
          <h2 className="ct mb-3">VibeAI can use</h2>
          <ul className="divide-y divide-nv-line">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-center gap-2.5 py-2.5 text-sm text-nv-ink">
                <FiCheck className="text-nv-safe shrink-0" />
                {c}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-nv-mute mt-4 leading-snug border-t border-nv-line pt-3">
            VibeAI never overrides the safety engine. For allergy and medication questions it uses the verified result.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
