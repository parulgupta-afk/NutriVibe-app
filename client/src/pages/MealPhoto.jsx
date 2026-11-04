/**
 * AI meal photo logging (Phase 5) — user must confirm
 */
import AppShell from '../components/layout/AppShell';
import React, { useState } from 'react';
import { aiApi } from '../api/ai';
import { FiCamera, FiCheck } from 'react-icons/fi';

export default function MealPhoto() {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mealType, setMealType] = useState('lunch');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setBase64(String(dataUrl).split(',')[1] || '');
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!base64) return;
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await aiApi.analyzeImage(base64);
      setSuggestions(res.data?.suggestions || []);
      if (res.offline) setMsg('Offline demo suggestions — set GEMINI_API_KEY for real vision.');
      else setMsg('Review items, then confirm to save.');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!suggestions.length) return;
    setLoading(true);
    try {
      await aiApi.confirmMeal({ mealType, items: suggestions, source: 'photo' });
      setMsg('Meal saved. Nutrition from database where items matched.');
      setSuggestions([]);
      setPreview(null);
      setBase64('');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Meal photo" subtitle="AI suggestions — you confirm">

    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
        <FiCamera /> Meal photo
      </h1>
      <p className="text-sm text-gray-500 mb-6">AI suggests foods. You confirm. Calories come from the verified database.</p>

      <input type="file" accept="image/*" capture="environment" onChange={onFile} className="mb-4 text-sm" />
      {preview && (
        <img src={preview} alt="Meal preview" className="w-full rounded-xl mb-4 max-h-64 object-cover" />
      )}

      <div className="flex gap-2 mb-4">
        <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        <button type="button" className="btn-primary" disabled={!base64 || loading} onClick={analyze}>
          {loading ? '…' : 'Analyze'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {msg && <p className="text-green-700 dark:text-green-400 text-sm mb-2">{msg}</p>}

      {suggestions.length > 0 && (
        <div className="space-y-2 mb-4">
          {suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{s.name}</span>
              <span className="text-gray-500"> · {s.grams}g · conf {(s.confidence * 100).toFixed(0)}%</span>
            </div>
          ))}
          <button type="button" className="btn-primary w-full flex items-center justify-center gap-2" onClick={confirm} disabled={loading}>
            <FiCheck /> Confirm & log meal
          </button>
        </div>
      )}
    </div>
      </AppShell>
  );
}
