import { motion } from 'framer-motion';
import { Icons } from './icons.js';

export const cx = (...a) => a.filter(Boolean).join(' ');

const ease = [0.2, 0.7, 0.2, 1];

/** Page wrapper: fades and rises in whenever a screen mounts. */
export function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="flex flex-col gap-5"
    >
      {children}
    </motion.div>
  );
}

/** Surface card with staggered entrance and a subtle hover lift. */
export function Card({ children, className = '', delay = 0, hover = true, as: _as, ...rest }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease, delay }}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 30px rgba(29,41,38,.08)' } : undefined}
      className={cx('flex flex-col gap-[18px] rounded-[20px] border border-line bg-panel p-6', className)}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

export const CardTitle = ({ children }) => (
  <h2 className="font-serif text-xl font-semibold tracking-[-.005em]">{children}</h2>
);

const chipStyles = {
  default: 'bg-teal-t text-teal-d',
  ok: 'bg-safe-t text-safe-x',
  warn: 'bg-warn-t text-warn-x',
  bad: 'bg-bad-t text-bad-x',
  mute: 'bg-track text-mute',
};

export function Chip({ variant = 'default', children, icon, className = '' }) {
  const Icon = icon ? Icons[icon] : null;
  return (
    <span
      className={cx(
        'inline-flex min-h-[26px] items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs font-semibold',
        chipStyles[variant],
        className
      )}
    >
      {Icon && <Icon size={14} strokeWidth={2.2} aria-hidden />}
      {children}
    </span>
  );
}

export function Button({ variant = 'default', square = false, className = '', children, ...props }) {
  const styles = {
    default: 'border-line bg-panel text-ink hover:border-teal hover:text-teal-d',
    primary: 'border-teal bg-teal text-white hover:border-teal-d hover:bg-teal-d',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cx(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors',
        square ? 'w-11 px-0' : 'px-[18px]',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/** Animated progress bar (width eases from 0 on mount). */
export function Bar({ pct, className = '' }) {
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-track', className)}>
      <motion.div
        className="h-full rounded-full bg-teal"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1.5 rounded-[14px] bg-track p-[5px]">
      {options.map((o) => {
        const Icon = o.icon ? Icons[o.icon] : null;
        const on = value === o.id;
        return (
          <button
            key={o.id}
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={cx(
              'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold transition-colors',
              on ? 'bg-panel text-teal-d shadow-sm' : 'text-mute hover:text-ink'
            )}
          >
            {Icon && <Icon size={18} strokeWidth={1.75} aria-hidden />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-teal' : 'bg-[#BFC8BE]')}
    >
      <motion.span
        className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

/** Small labelled value box. */
export function Kv({ label, children, className = '' }) {
  return (
    <div className={cx('flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-[14px] border border-line bg-panel2 px-4 py-3.5', className)}>
      <span className="kl">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export const Row = ({ children, className = '' }) => (
  <div className={cx('flex flex-wrap items-stretch gap-5', className)}>{children}</div>
);
