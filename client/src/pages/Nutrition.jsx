/**
 * My Nutrition — Meal Tracker + Daily Dashboard (Phase 2)
 */
import AppShell from '../components/layout/AppShell';
import React, { useState, useEffect, useCallback } from 'react';
import { mealApi } from '../api/meals';
import { hydrationApi } from '../api/hydration';
import { foodApi } from '../api/foods';
import { FiPlus, FiTrash2, FiCoffee, FiSun, FiMoon, FiZap, FiSearch } from 'react-icons/fi';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: FiCoffee },
  { id: 'lunch', label: 'Lunch', icon: FiSun },
  { id: 'dinner', label: 'Dinner', icon: FiMoon },
  { id: 'snack', label: 'Snack', icon: FiZap },
];

const QUICK_FOODS = [
  { name: 'Paneer', grams: 50, nutrition: { calories: 132, protein: 9.2, carbs: 0.6, fat: 10.4, fiber: 0 } },
  { name: 'Roti', grams: 40, nutrition: { calories: 119, protein: 4.4, carbs: 18.4, fat: 3, fiber: 3.2 } },
  { name: 'Dal (cooked)', grams: 150, nutrition: { calories: 174, protein: 11.3, carbs: 24, fat: 2.3, fiber: 6 } },
  { name: 'Rice (cooked)', grams: 150, nutrition: { calories: 195, protein: 4.1, carbs: 42, fat: 0.5, fiber: 0.6 } },
  { name: 'Banana', grams: 120, nutrition: { calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4, fiber: 3.1 } },
  { name: 'Greek Yogurt', grams: 100, nutrition: { calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 } },
  { name: 'Egg (boiled)', grams: 50, nutrition: { calories: 78, protein: 6.5, carbs: 0.6, fat: 5.5, fiber: 0 } },
  { name: 'Oats (dry)', grams: 40, nutrition: { calories: 156, protein: 6.8, carbs: 26.4, fat: 2.8, fiber: 4.4 } },
];

function ProgressBar({ value, max, color = 'bg-primary-500', label }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <AppShell title="My Meals" subtitle="Track meals and macros">

    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {Math.round(value)} / {max}
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [goals, setGoals] = useState({ calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [mealRes, goalRes] = await Promise.all([
        mealApi.getToday(),
        hydrationApi.getGoals().catch(() => ({ data: null })),
      ]);
      setMeals(mealRes.data?.meals || []);
      setDailyTotals(mealRes.data?.dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      if (goalRes?.data) {
        setGoals((g) => ({ ...g, ...goalRes.data }));
      }
    } catch (e) {
      setError(e.message || 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFood = (food) => {
    setSelectedFoods((prev) => {
      const key = food.foodItemId || food.name;
      const exists = prev.find((f) => (f.foodItemId || f.name) === key);
      if (exists) return prev.filter((f) => (f.foodItemId || f.name) !== key);
      const grams = food.grams || food.servings?.[0]?.grams || 100;
      return [
        ...prev,
        {
          foodItemId: food._id || food.foodItemId,
          name: food.name,
          quantity: grams,
          unit: 'g',
          grams,
          nutrition: food.nutrition || undefined,
          isEstimated: !food._id,
        },
      ];
    });
  };

  const runSearch = async (q) => {
    setSearchQ(q);
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await foodApi.search(q, 12);
      setSearchResults(res.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedFoods.length === 0) return;
    setSubmitting(true);
    try {
      await mealApi.create({
        mealType,
        items: selectedFoods,
        source: 'manual',
      });
      setShowAdd(false);
      setSelectedFoods([]);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this meal?')) return;
    try {
      await mealApi.remove(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const mealsByType = MEAL_TYPES.map((t) => ({
    ...t,
    items: meals.filter((m) => m.mealType === t.id),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Nutrition</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track meals & daily macros</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Log Meal
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Daily progress */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s Progress</h2>
        {loading ? (
          <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-700 rounded" />
        ) : (
          <div className="space-y-4">
            <ProgressBar value={dailyTotals.calories} max={goals.calories} label="Calories (kcal)" color="bg-orange-500" />
            <ProgressBar value={dailyTotals.protein} max={goals.protein} label="Protein (g)" color="bg-blue-500" />
            <ProgressBar value={dailyTotals.carbs} max={goals.carbs} label="Carbs (g)" color="bg-amber-500" />
            <ProgressBar value={dailyTotals.fat} max={goals.fat} label="Fat (g)" color="bg-purple-500" />
            <ProgressBar value={dailyTotals.fiber} max={goals.fiber} label="Fiber (g)" color="bg-green-500" />
          </div>
        )}
      </section>

      {/* Meals by type */}
      <div className="space-y-4">
        {mealsByType.map(({ id, label, icon: Icon, items }) => (
          <section
            key={id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="text-primary-600" />
              <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
              <span className="text-xs text-gray-400 ml-auto">{items.length} entr{items.length === 1 ? 'y' : 'ies'}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400">No meals logged yet</p>
            ) : (
              <ul className="space-y-2">
                {items.map((meal) => (
                  <li
                    key={meal._id}
                    className="flex items-start justify-between gap-3 py-2 border-t border-gray-50 dark:border-gray-700 first:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {meal.items.map((i) => i.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(meal.totals.calories)} kcal · P {meal.totals.protein}g · C {meal.totals.carbs}g · F {meal.totals.fat}g
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(meal._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                      aria-label="Delete meal"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Add meal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Log a meal</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meal type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMealType(t.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        mealType === t.id
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <FiSearch /> Search food database
                </label>
                <input
                  type="search"
                  placeholder="e.g. paneer, roti, banana…"
                  value={searchQ}
                  onChange={(e) => runSearch(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
                {searching && <p className="text-xs text-gray-400 mt-1">Searching…</p>}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                    {searchResults.map((f) => {
                      const selected = selectedFoods.some((s) => (s.foodItemId || s.name) === (f._id || f.name));
                      const cal = f.per100g?.calories ?? '—';
                      return (
                        <button
                          key={f._id || f.name}
                          type="button"
                          onClick={() =>
                            toggleFood({
                              ...f,
                              grams: f.servings?.[0]?.grams || 100,
                              nutrition: undefined,
                            })
                          }
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                            selected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{f.name}</span>
                          <span className="block text-xs text-gray-500">
                            {cal} kcal / 100g {f.region ? `· ${f.region}` : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick add (offline demo)</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {QUICK_FOODS.map((f) => {
                    const selected = selectedFoods.some((s) => s.name === f.name && !s.foodItemId);
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => toggleFood(f)}
                        className={`text-left p-2.5 rounded-lg border text-sm ${
                          selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{f.name}</span>
                        <span className="block text-xs text-gray-500">{f.grams}g · {f.nutrition.calories} kcal</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                disabled={selectedFoods.length === 0 || submitting}
                onClick={handleSubmit}
                className="w-full btn-primary disabled:opacity-50"
              >
                {submitting ? 'Saving…' : `Add ${selectedFoods.length} item${selectedFoods.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </AppShell>
  );
}
