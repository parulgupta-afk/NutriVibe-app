import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiGrid, FiCamera, FiFeather, FiActivity, FiDroplet,
  FiAward, FiZap, FiHome, FiBell, FiMessageCircle,
} from 'react-icons/fi';

const SIDE = [
  { to: '/dashboard', label: 'Dashboard', Icon: FiGrid },
  { to: '/scanner', label: 'Food Scanner', Icon: FiCamera },
  { to: '/vibe-diet', label: 'VibeDiet', Icon: FiFeather },
  { to: '/nutrition', label: 'My Meals', Icon: FiActivity },
  { to: '/hydration', label: 'Hydration', Icon: FiDroplet },
  { to: '/reactions', label: 'Wellness Journey', Icon: FiAward },
  { to: '/vibe-ai', label: 'VibeAI', Icon: FiZap },
];

const MOBILE = [
  { to: '/dashboard', label: 'Home', Icon: FiHome },
  { to: '/nutrition', label: 'Meals', Icon: FiActivity },
  { to: '/scanner', label: 'Scan', Icon: FiCamera, center: true },
  { to: '/hydration', label: 'Water', Icon: FiDroplet },
  { to: '/vibe-ai', label: 'VibeAI', Icon: FiMessageCircle },
];

export default function AppShell({ children, title, subtitle, right }) {
  const { user } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const allergies = user?.preferences?.allergies || [];
  const meds = user?.preferences?.medications || [];

  const isOn = (to) => loc.pathname === to || loc.pathname.startsWith(to + '/');

  return (
    <div className="min-h-screen bg-nv-bg text-nv-ink flex flex-wrap lg:flex-nowrap">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col gap-7 w-[264px] shrink-0 px-5 py-7 bg-nv-panel2 border-r border-nv-line sticky top-0 h-screen">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[14px] bg-nv-teal text-white grid place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c-3 4-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-3-6-6-10z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-tight">NutriVibe</div>
            <div className="text-[11px] text-nv-mute leading-snug">Eat Smart. Stay Safe.<br />Live Better.</div>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto" aria-label="Main">
          {SIDE.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={isOn(to) ? 'nav-item-on' : 'nav-item'}>
              <Icon className="text-[18px] shrink-0" aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => nav('/profiles')}
          className="profile text-left flex flex-col gap-3 p-4 rounded-2xl bg-nv-panel border border-nv-line hover:border-nv-teal/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-nv-teal-t text-nv-teal-d grid place-items-center serif font-semibold text-base uppercase">
              {(user?.name || 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || 'You'}</div>
              <div className="text-[12px] text-nv-mute">Profile and family</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allergies.slice(0, 3).map((a) => (
              <span key={a} className="chip-allergy chip !min-h-[22px]">{a}{!/allerg/i.test(a) ? ' allergy' : ''}</span>
            ))}
            {meds.slice(0, 2).map((m) => (
              <span key={m} className="chip-med chip !min-h-[22px]">{m}</span>
            ))}
            {!allergies.length && !meds.length && (
              <span className="text-[11px] text-nv-mute">No restrictions set</span>
            )}
          </div>
          <p className="text-[10px] text-nv-mute leading-snug">
            For information only. Not medical advice. Ask your clinician or pharmacist about medical decisions.
          </p>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between bg-nv-bg/95 backdrop-blur border-b border-nv-line">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-nv-teal text-white grid place-items-center text-xs font-bold">N</div>
            <span className="font-semibold text-sm">NutriVibe</span>
          </Link>
          <button type="button" className="btn-sq !w-9 !h-9" aria-label="Notifications"><FiBell /></button>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-9 pb-28 lg:pb-10">
          {(title || right) && (
            <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
              <div>
                {title && <h1 className="page-title serif">{title}</h1>}
                {subtitle && <p className="page-sub">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                {right}
                <button type="button" className="btn-sq hidden lg:inline-flex" aria-label="Notifications"><FiBell /></button>
              </div>
            </div>
          )}
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-nv-panel/95 backdrop-blur border-t border-nv-line" aria-label="Mobile">
          <div className="flex items-end justify-around px-1 pt-2 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
            {MOBILE.map(({ to, label, Icon, center }) => {
              if (center) {
                return (
                  <Link key={to} to={to} className="-mt-6 flex flex-col items-center" aria-label={label}>
                    <span className="w-14 h-14 rounded-full bg-nv-teal text-white shadow-lg grid place-items-center text-2xl">
                      <Icon strokeWidth={2} />
                    </span>
                  </Link>
                );
              }
              const on = isOn(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${on ? 'text-nv-teal font-semibold' : 'text-nv-mute'}`}
                >
                  <Icon className="text-xl" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
