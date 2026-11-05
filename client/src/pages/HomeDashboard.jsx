/**
 * Home / Dashboard — NutriVibe 2.0 UI (mobile home + desktop)
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mealApi } from '../api/meals';
import { hydrationApi, streakApi } from '../api/hydration';
import { productApi } from '../api/products';
import AppShell from '../components/layout/AppShell';
import SafetyBadge from '../components/common/SafetyBadge';
import { FiCheck, FiPlus, FiDroplet, FiShield } from 'react-icons/fi';

function Ring({ value, max, size = 88 }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E1E5D8" strokeWidth="8" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#3A6B63"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function HomeDashboard() {
  const { user } = useAuth();
  const [calories, setCalories] = useState(0);
  const [calGoal, setCalGoal] = useState(2000);
  const [protein, setProtein] = useState(0);
  const [proteinGoal] = useState(80);
  const [water, setWater] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [waterStreak, setWaterStreak] = useState(0);
  const [meals, setMeals] = useState([]);
  const [safetyStats, setSafetyStats] = useState({ safe: 0, caution: 0, unsafe: 0, total: 0, recentLogs: [] });
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const todayIso = new Date().toISOString().split('T')[0];
        const [mealRes, hydRes, streakRes, goalRes, scanRes] = await Promise.all([
          mealApi.getToday().catch(() => null),
          hydrationApi.getToday().catch(() => null),
          streakApi.get().catch(() => null),
          hydrationApi.getGoals().catch(() => null),
          productApi.getDailyTracking(todayIso).catch(() => null),
        ]);
        if (cancelled) return;
        const totals = mealRes?.data?.dailyTotals || {};
        setCalories(totals.calories || 0);
        setProtein(totals.protein || 0);
        setMeals(mealRes?.data?.meals || []);
        setWater(hydRes?.data?.totalMl || 0);
        setWaterGoal(hydRes?.data?.goalMl || goalRes?.data?.waterMl || 2500);
        setCalGoal(goalRes?.data?.calories || 2000);
        setWaterStreak(streakRes?.data?.hydration?.current || 0);
        if (scanRes) {
          setSafetyStats({
            safe: scanRes.safeCount || 0,
            caution: scanRes.cautionCount || 0,
            unsafe: scanRes.unsafeCount || 0,
            total: scanRes.totalScans || 0,
            recentLogs: scanRes.recentLogs || [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addWater = async () => {
    try {
      const res = await hydrationApi.log(250);
      setWater(res.todayTotalMl ?? water + 250);
    } catch { /* ignore */ }
  };

  const mealRows = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'snack', label: 'Evening snack' },
    { type: 'dinner', label: 'Dinner' },
  ].map((row) => {
    const found = meals.filter((m) => m.mealType === row.type);
    const names = found.flatMap((m) => m.items?.map((i) => i.name) || []).join(' + ');
    const kcal = found.reduce((s, m) => s + (m.totals?.calories || 0), 0);
    return { ...row, names, kcal, logged: found.length > 0 };
  });

  const left = Math.max(0, calGoal - calories);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto lg:max-w-2xl space-y-4 rise">
        <div className="mb-2">
          <h1 className="page-title serif text-[28px] sm:text-[32px]">
            {greet}, {(user?.name || 'there').split(' ')[0]}
          </h1>
          <p className="page-sub">{dateStr}</p>
        </div>

        {/* Nutrition card */}
        <div className="card-static flex items-center gap-5">
          <div className="relative shrink-0">
            <Ring value={calories} max={calGoal} />
            <div className="absolute inset-0 grid place-items-center rotate-0 text-center">
              <div>
                <div className="text-lg font-semibold leading-none">{loading ? '—' : Math.round(calories).toLocaleString()}</div>
                <div className="text-[11px] text-nv-mute">kcal</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">Today&apos;s nutrition</div>
            <p className="text-[13px] text-nv-mute leading-snug">
              {Math.round(left).toLocaleString()} kcal left of {calGoal.toLocaleString()}
            </p>
            <p className="text-[13px] text-nv-mute">
              Protein {Math.round(protein)} / {proteinGoal} g
            </p>
          </div>
        </div>

        {/* Hydration */}
        <div className="card-static flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-nv-teal-t text-nv-teal grid place-items-center shrink-0">
            <FiDroplet />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[15px]">
              {water.toLocaleString()} / {waterGoal.toLocaleString()} ml
            </div>
            <div className="text-[12px] text-nv-mute">
              {waterStreak > 0 ? `${waterStreak}-day hydration streak` : 'Log water to start a streak'}
            </div>
          </div>
          <button type="button" onClick={addWater} className="btn-primary !h-9 !px-3 !text-xs shrink-0">
            +250
          </button>
        </div>

        {/* Meals */}
        <div className="card-static">
          <h2 className="font-semibold text-[15px] mb-3">Today&apos;s meals</h2>
          <ul className="space-y-0">
            {mealRows.map((m) => (
              <li key={m.type} className="flex items-center gap-3 py-3 border-t border-nv-line first:border-0">
                <span
                  className={`w-7 h-7 rounded-full grid place-items-center shrink-0 text-sm ${
                    m.logged ? 'bg-nv-safe-t text-nv-safe' : 'bg-nv-track text-nv-mute'
                  }`}
                >
                  {m.logged ? <FiCheck /> : <FiPlus />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-[12px] text-nv-mute truncate">
                    {m.names || 'Not logged'}
                  </div>
                </div>
                {m.logged ? (
                  <span className="text-sm font-medium tabular-nums">{Math.round(m.kcal)}</span>
                ) : (
                  <Link to="/vibe-diet" className="chip chip-mute">Planned</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Safety scans summary */}
        <div className="card-static">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[15px] flex items-center gap-2">
              <FiShield className="text-nv-teal" /> Today&apos;s Safety Scans
            </h2>
            <Link to="/scanner" className="text-xs text-nv-teal hover:underline font-medium">
              Scan new
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-nv-safe-t text-center">
              <div className="text-xs text-nv-safe font-medium">Safe</div>
              <div className="text-lg font-bold text-nv-safe">{safetyStats.safe}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-nv-warn-t text-center">
              <div className="text-xs text-nv-warn font-medium">Caution</div>
              <div className="text-lg font-bold text-nv-warn">{safetyStats.caution}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-nv-bad-t text-center">
              <div className="text-xs text-nv-bad font-medium">Unsafe</div>
              <div className="text-lg font-bold text-nv-bad">{safetyStats.unsafe}</div>
            </div>
          </div>
          {safetyStats.recentLogs.length > 0 ? (
            <ul className="space-y-1">
              {safetyStats.recentLogs.slice(0, 3).map((log, idx) => (
                <li key={log._id || idx} className="flex items-center justify-between py-2 border-t border-nv-line text-sm">
                  <Link
                    to={log.barcode ? `/product/${log.barcode}` : '/scanner'}
                    className="truncate max-w-[200px] text-nv-ink font-medium hover:text-nv-teal"
                  >
                    {log.productName || 'Scanned product'}
                  </Link>
                  <SafetyBadge level={log.riskLevel} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-nv-mute text-center py-2">
              No products scanned yet today.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link to="/scanner" className="btn-primary text-center">Scan food</Link>
          <Link to="/nutrition" className="btn-secondary text-center">Log meal</Link>
        </div>
      </div>
    </AppShell>
  );
}
