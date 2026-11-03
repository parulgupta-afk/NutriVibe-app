/**
 * VibeAI nutrition assistant (Phase 5)
 */
import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/ai';
import { FiSend, FiMessageCircle } from 'react-icons/fi';

export default function VibeAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm VibeAI. I use your real meal, hydration, and profile data. Ask about today's nutrition, dinner ideas, or general food questions. Safety verdicts always come from the rules engine — not from me inventing them.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const history = next
        .filter((m) => m.role !== 'system')
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await aiApi.chat(text, history);
      const reply = res.data?.reply || res.message || 'No reply';
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
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiMessageCircle className="text-primary-600" /> VibeAI
        </h1>
        <p className="text-sm text-gray-500">Grounded in your NutriVibe data · not medical advice</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              {m.content}
              {m.offline && (
                <span className="block text-xs mt-1 opacity-70">(offline mode — set GEMINI_API_KEY for full AI)</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="How was my nutrition today? What should I eat for dinner?"
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white"
        />
        <button type="button" onClick={send} disabled={loading} className="btn-primary px-4 disabled:opacity-50">
          <FiSend />
        </button>
      </div>
    </div>
  );
}
