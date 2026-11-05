import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from './icons.js';
import { Button, Chip, cx } from './ui.jsx';
import { profile } from '../data/mock.js';

export const routes = [
  { to: '/', label: 'Dashboard', icon: 'grid', title: 'Good afternoon, Parul', subtitle: 'Wednesday, 4 November' },
  { to: '/scan', label: 'Food Scanner', icon: 'scan', title: 'Food Scanner', subtitle: 'Check a product against your profile before you buy or eat it.' },
  { to: '/diet', label: 'VibeDiet', icon: 'leaf', title: 'VibeDiet', subtitle: 'Your Goals. Your Lifestyle. Your Personalized Diet.' },
  { to: '/meals', label: 'My Meals', icon: 'utensils', title: 'My Meals', subtitle: 'Wednesday, 4 November' },
  { to: '/hydration', label: 'Hydration', icon: 'drop', title: 'Hydration', subtitle: 'Water through the day, at your own pace.' },
  { to: '/wellness', label: 'Wellness Journey', icon: 'flame', title: 'Wellness Journey', subtitle: 'Habits that build up, one day at a time.' },
  { to: '/ai', label: 'VibeAI', icon: 'spark', title: 'VibeAI', subtitle: 'Your Personal Nutrition Assistant' },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-teal text-white" aria-hidden="true">
        <Icons.leaf size={22} />
      </div>
      <div>
        <div className="font-serif text-[23px] font-semibold leading-none">NutriVibe</div>
        <div className="mt-[5px] text-xs text-mute">Eat Smart. Stay Safe. Live Better.</div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col gap-7 border-r border-line bg-panel2 px-5 py-7 md:flex">
      <Logo />
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {routes.map((r) => {
          const Icon = Icons[r.icon];
          return (
            <NavLink
              key={r.to}
              to={r.to}
              end={r.to === '/'}
              className={({ isActive }) =>
                cx(
                  'relative flex h-[46px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-mute hover:bg-teal/10 hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-teal"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={1.75} className="relative" aria-hidden />
                  <span className="relative">{r.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-teal-t font-serif text-base font-semibold text-teal-d" aria-hidden="true">
            P
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">{profile.name}</span>
            <span className="text-[13px] text-mute">Profile and family</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.allergies.map((a) => (
            <Chip key={a} variant="bad">{a} allergy</Chip>
          ))}
          {profile.medications.map((m) => (
            <Chip key={m} variant="warn">{m}</Chip>
          ))}
        </div>
        <p className="text-xs leading-snug text-mute">
          For information only. Not medical advice. Ask your clinician or pharmacist about medical decisions.
        </p>
      </div>
    </aside>
  );
}

/** Bottom tab bar for phones. Uses the first five routes plus a raised Scan button. */
export function MobileNav() {
  const tab = (to, label, icon) => {
    const Icon = Icons[icon];
    return (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          cx('flex h-[60px] w-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-teal-d' : 'text-mute')
        }
      >
        <Icon size={22} strokeWidth={1.75} aria-hidden />
        {label}
      </NavLink>
    );
  };
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-20 flex h-[76px] items-start justify-around border-t border-line bg-panel px-2 pt-2 md:hidden"
    >
      {tab('/', 'Home', 'grid')}
      {tab('/meals', 'Meals', 'utensils')}
      <NavLink
        to="/scan"
        aria-label="Scan food"
        className="-mt-5 grid h-[60px] w-[60px] place-items-center rounded-full bg-teal text-white shadow-[0_8px_20px_rgba(58,107,99,.35)]"
      >
        <Icons.scan size={26} aria-hidden />
      </NavLink>
      {tab('/hydration', 'Water', 'drop')}
      {tab('/ai', 'VibeAI', 'spark')}
    </nav>
  );
}

export function PageHeader() {
  const { pathname } = useLocation();
  const r = routes.find((x) => (x.to === '/' ? pathname === '/' : pathname.startsWith(x.to))) || routes[0];
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <motion.div key={r.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-.015em] md:text-[40px]">{r.title}</h1>
        <p className="mt-2 text-[15px] text-mute">{r.subtitle}</p>
      </motion.div>
      <Button square aria-label="Notifications">
        <Icons.bell size={20} aria-hidden />
      </Button>
    </header>
  );
}
