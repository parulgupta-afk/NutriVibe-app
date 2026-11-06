import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page, Card, CardTitle, Chip, Button, Kv, Row, cx } from '../components/ui.jsx';
import { Icons } from '../components/icons.js';
import { days, initialPlan, initialGrocery } from '../data/mock.js';

const slots = ['Breakfast', 'Lunch', 'Dinner'];

export default function VibeDiet() {
  const [plan, setPlan] = useState(initialPlan);
  const [grocery, setGrocery] = useState(initialGrocery);
  const [open, setOpen] = useState(false);

  // Swap a meal with the same slot on the next day.
  const swap = (i, k) => {
    const next = plan.map((r) => r.slice());
    const j = (i + 1) % 7;
    [next[i][k], next[j][k]] = [next[j][k], next[i][k]];
    setPlan(next);
  };
  const toggle = (i) => setGrocery((g) => g.map((x, j) => (j === i ? { ...x, on: !x.on } : x)));
  const bought = grocery.filter((g) => g.on).length;

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[2.2_1_620px] overflow-x-auto" delay={0.05}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Weekly plan</CardTitle>
            <Chip variant="ok" icon="check">Every meal safety-checked</Chip>
          </div>
          <div className="grid min-w-[560px] grid-cols-[64px_repeat(3,minmax(0,1fr))] gap-2">
            <span />
            {slots.map((s) => (
              <span key={s} className="kl px-1 pb-1">{s}</span>
            ))}
            {plan.map((row, i) => (
              <div key={days[i]} className="contents">
                <span className={cx('flex items-center pl-1 text-[13px] font-semibold', i === 2 ? 'text-teal-d' : 'text-mute')}>{days[i]}</span>
                {row.map((meal, k) => (
                  <motion.button
                    key={`${i}-${k}-${meal}`}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => swap(i, k)}
                    aria-label={`Swap ${meal} with the next day`}
                    className="flex min-h-[52px] items-center justify-between gap-2 rounded-xl border border-line bg-panel2 px-3 py-2 text-left text-sm font-medium transition-colors hover:border-teal hover:bg-teal-t"
                  >
                    <span>{meal}</span>
                    <Icons.swap size={16} className="text-teal opacity-75" aria-hidden />
                  </motion.button>
                ))}
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-snug text-mute">
            Select a meal to swap it with the same meal on the next day. Nutrition is calculated from a food table, not by the AI.
          </p>
        </Card>

        <div className="flex flex-[1_1_300px] flex-col gap-5">
          <Card delay={0.1}>
            <CardTitle>Your plan</CardTitle>
            <div className="flex flex-col">
              {[
                ['Goal', 'Weight maintenance'],
                ['Diet', 'Vegetarian, Indian'],
                ['Budget', '₹200 per day', true],
                ['Daily target', '2,000 kcal', true],
                ['Protein target', '80 g', true],
              ].map(([k, v, mono], i) => (
                <div key={k} className={cx('flex items-center gap-3 py-3.5', i > 0 && 'border-t border-line', i === 0 && 'pt-0', i === 4 && 'pb-0')}>
                  <span className="flex-1 text-[13px] text-mute">{k}</span>
                  <b className={cx('text-sm', mono && 'font-mono')}>{v}</b>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-mute">Targets are estimates, not a prescription.</p>
          </Card>

          <Card delay={0.15}>
            <CardTitle>This week</CardTitle>
            <div className="flex flex-wrap gap-3">
              <Kv label="Planned" className="min-w-[80px]"><span className="font-mono text-[26px] font-medium leading-none">21</span></Kv>
              <Kv label="Logged" className="min-w-[80px]"><span className="font-mono text-[26px] font-medium leading-none">18</span></Kv>
              <Kv label="Followed" className="min-w-[80px]"><span className="font-mono text-[26px] font-medium leading-none">15</span></Kv>
            </div>
            <Button variant="primary" onClick={() => setOpen((o) => !o)}>
              <Icons.cart size={20} aria-hidden />
              {open ? 'Hide grocery list' : 'Generate grocery list'}
            </Button>
          </Card>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.94, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <Card className="gap-2" hover={false}>
                  <div className="flex items-center justify-between">
                    <CardTitle>Grocery list</CardTitle>
                    <Chip>{bought} of {grocery.length} bought</Chip>
                  </div>
                  {grocery.map((g, i) => (
                    <button
                      key={g.n}
                      aria-pressed={g.on}
                      onClick={() => toggle(i)}
                      className={cx('flex min-h-12 w-full items-center gap-3 border-t border-line px-1 py-1.5 text-left text-sm font-medium', g.on && 'text-mute')}
                    >
                      <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-lg border-[1.5px] border-teal text-white transition-colors', g.on && 'bg-teal')}>
                        <Icons.check size={14} strokeWidth={2.6} className={cx('transition-opacity', g.on ? 'opacity-100' : 'opacity-0')} aria-hidden />
                      </span>
                      <span className={cx('flex-1', g.on && 'line-through')}>{g.n}</span>
                      <span className="font-mono text-[13px] text-mute">{g.q}</span>
                    </button>
                  ))}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Row>
    </Page>
  );
}
