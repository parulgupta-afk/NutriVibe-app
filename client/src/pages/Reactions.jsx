/**
 * Reaction Journal (Phase 7) — patterns only, never diagnosis
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';

export default function Reactions() {
  const [list, setList] = useState([]);
  const [insights, setInsights] = useState(null);
  const [foods, setFoods] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [r, i] = await Promise.all([
        axios.get('/api/reactions'),
        axios.get('/api/reactions/insights'),
      ]);
      setList(r.data.data || []);
      setInsights(i.data.data || null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.post('/api/reactions', {
        foods: foods.split(',').map((s) => s.trim()).filter(Boolean),
        symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        severity,
        notes,
      });
      setFoods('');
      setSymptoms('');
      setNotes('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reaction Journal</h1>
      <p className="text-sm text-amber-700 dark:text-amber-300 mb-6 flex items-start gap-2">
        <FiAlertCircle className="mt-0.5 shrink-0" />
        Log symptoms near foods to notice patterns. This is not a diagnosis or allergy test.
      </p>

      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 space-y-3">
        <input
          className="input-field w-full"
          placeholder="Foods (comma-separated)"
          value={foods}
          onChange={(e) => setFoods(e.target.value)}
        />
        <input
          className="input-field w-full"
          placeholder="Symptoms (comma-separated)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
        />
        <select className="input-field" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
        <textarea
          className="input-field w-full"
          rows={2}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <FiPlus /> {saving ? 'Saving…' : 'Log entry'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {insights && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-sm">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            Observational summary ({insights.totalEntries} entries)
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Top foods mentioned:{' '}
            {(insights.topFoodsMentioned || []).map((f) => f.name).join(', ') || '—'}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Top symptoms:{' '}
            {(insights.topSymptoms || []).map((s) => s.name).join(', ') || '—'}
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r._id} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              {(r.symptoms || []).join(', ')} · <span className="capitalize text-gray-500">{r.severity}</span>
            </p>
            <p className="text-gray-500">{(r.foods || []).join(', ') || 'No foods listed'}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(r.occurredAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
