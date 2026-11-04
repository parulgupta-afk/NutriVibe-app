/**
 * VibeDiet — personalized plan (Phase 4 scaffold)
 * Meals are always safety-checked server-side before display.
 */
import AppShell from '../components/layout/AppShell';
import React, { useState, useEffect } from 'react';
import { dietApi } from '../api/diet';
// regenerate + grocery via dietApi
import { foodApi } from '../api/foods';
import { FiRefreshCw, FiShield, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const VERDICT_STYLE = {
  SAFE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CAUTION: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  UNSAFE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  UNKNOWN: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function VibeDiet() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(1);
  const [dietType, setDietType] = useState('vegetarian');
  const [goal, setGoal] = useState('balanced nutrition');

  useEffect(() => {
    (async () => {
      try {
        // Ensure sample foods exist for fallback planner
        await foodApi.seed().catch(() => {});
        const res = await dietApi.getCurrent();
        setPlan(res.data);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      await foodApi.seed().catch(() => {});
      const res = await dietApi.generate({
        days,
        dietType,
        goal,
      });
      setPlan(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell title="VibeDiet" subtitle="Personalized meal plans">

    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VibeDiet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-assisted plans · nutrition from verified foods · safety always deterministic
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <FiRefreshCw className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating…' : plan ? 'Regenerate' : 'Generate plan'}
        </button>
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="text-gray-600 dark:text-gray-300 block mb-1">Days</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input-field"
          >
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 dark:text-gray-300 block mb-1">Diet</span>
          <select
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
            className="input-field"
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non-vegetarian">Non-vegetarian</option>
          </select>
        </label>
        <label className="text-sm flex-1 min-w-[140px]">
          <span className="text-gray-600 dark:text-gray-300 block mb-1">Goal</span>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="input-field w-full"
            placeholder="e.g. high protein"
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse h-40 bg-gray-100 dark:bg-gray-700 rounded-xl" />
      ) : !plan ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <FiShield className="mx-auto text-4xl mb-3 text-primary-500" />
          <p>No active plan yet. Generate one to get started.</p>
          <p className="text-xs mt-2">Every meal is checked against your allergies before it appears.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plan.days?.map((day) => (
            <section
              key={day.dayIndex}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <header className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Day {day.dayIndex + 1}
                </h2>
              </header>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {(day.meals || []).map((meal) => (
                  <li key={meal._id || meal.mealName + meal.mealType} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs uppercase tracking-wide text-gray-400">{meal.mealType}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            VERDICT_STYLE[meal.safety?.verdict] || VERDICT_STYLE.UNKNOWN
                          }`}
                        >
                          {meal.safety?.verdict === 'SAFE' ? <FiCheck /> : <FiAlertTriangle />}
                          {meal.safety?.verdict || 'UNKNOWN'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white mt-0.5">{meal.mealName}</p>
                      <p className="text-xs text-gray-500">
                        {meal.servingSize} · {Math.round(meal.nutrition?.calories || 0)} kcal · P{' '}
                        {meal.nutrition?.protein || 0}g · C {meal.nutrition?.carbs || 0}g · F{' '}
                        {meal.nutrition?.fat || 0}g
                      </p>
                      {meal.safety?.reasons?.length > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {meal.safety.reasons.slice(0, 2).join(' · ')}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-xs text-gray-400 text-center">
            Rules version: {plan.rulesVersion || 'n/a'} · Nutrition from verified FoodItem database
          </p>

      {plan && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            onClick={async () => {
              try {
                const res = await dietApi.groceryList(plan._id);
                const lines = (res.data?.items || []).map((i) => `• ${i.name} (${i.quantity} ${i.unit})`).join('\n');
                alert(lines || 'No items');
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Grocery list
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            onClick={async () => {
              try {
                const res = await dietApi.regenerateMeal(plan._id, { dayIndex: 0, mealType: 'lunch' });
                setPlan(res.data);
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Swap lunch (day 1)
          </button>
        </div>
      )}

        </div>
      )}
    </div>
      </AppShell>
  );
}
