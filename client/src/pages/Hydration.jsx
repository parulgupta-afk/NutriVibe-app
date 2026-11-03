/**
 * Hydration Tracker (Phase 3)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { hydrationApi, streakApi } from '../api/hydration';
import { FiDroplet, FiPlus } from 'react-icons/fi';

const QUICK_AMOUNTS = [150, 250, 500];

export default function Hydration() {
  const [totalMl, setTotalMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, streakRes] = await Promise.all([
        hydrationApi.getToday(),
        streakApi.get().catch(() => null),
      ]);
      setTotalMl(todayRes.data?.totalMl || 0);
      setGoalMl(todayRes.data?.goalMl || 2000);
      setLogs(todayRes.data?.logs || []);
      if (streakRes?.data) setStreak(streakRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addWater = async (amountMl, source = 'quick') => {
    if (!amountMl || amountMl < 1) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await hydrationApi.log(amountMl, source);
      setTotalMl(res.todayTotalMl ?? totalMl + amountMl);
      setGoalMl(res.goalMl || goalMl);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to log');
    } finally {
      setSubmitting(false);
      setCustom('');
    }
  };

  const progress = Math.min(100, Math.round((totalMl / (goalMl || 1)) * 100));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Hydration</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Stay consistent — no guilt, just progress</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Progress ring-ish card */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 text-center">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${progress * 2.64} 264`}
              strokeLinecap="round"
              className="text-sky-500 transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <FiDroplet className="text-sky-500 text-xl mb-0.5" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {totalMl} <span className="text-lg font-normal text-gray-500">/ {goalMl} ml</span>
        </p>
        {streak?.hydration?.current > 0 && (
          <p className="mt-2 text-sm text-sky-600 dark:text-sky-400">
            🔥 {streak.hydration.current}-day hydration streak
          </p>
        )}
      </section>

      {/* Quick add */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            type="button"
            disabled={submitting}
            onClick={() => addWater(ml)}
            className="py-4 rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/40 disabled:opacity-50 transition"
          >
            +{ml} ml
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="number"
          min="1"
          max="2000"
          placeholder="Custom ml"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          disabled={submitting || !custom}
          onClick={() => addWater(Number(custom), 'custom')}
          className="btn-primary px-5 flex items-center gap-1 disabled:opacity-50"
        >
          <FiPlus /> Add
        </button>
      </div>

      {/* Today log */}
      <section>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Today&apos;s log</h2>
        {loading ? (
          <div className="animate-pulse h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400">No water logged yet. Start with a quick add above.</p>
        ) : (
          <ul className="space-y-2">
            {[...logs].reverse().map((log) => (
              <li
                key={log._id}
                className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-200">+{log.amountMl} ml</span>
                <span className="text-gray-400 text-xs">
                  {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
