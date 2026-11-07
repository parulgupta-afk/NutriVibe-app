import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Page, Card, CardTitle, Chip, Button, Bar, Row, cx } from '../components/ui.jsx';
import Ring from '../components/Ring.jsx';
import { Icons } from '../components/icons.js';
import { useApp } from '../context/AppContext.jsx';
import { nutrition, todayMeals, streakWeek } from '../data/mock.js';

const fmt = (n) => n.toLocaleString('en-IN');

function QuickAction({ to, onClick, icon, label, primary, delay }) {
  const Icon = Icons[icon];
  const cls = cx(
    'flex h-16 flex-1 basis-[200px] items-center gap-3.5 rounded-2xl border px-5 text-[15px] font-semibold transition-shadow hover:shadow-lift',
    primary ? 'border-teal bg-teal text-white' : 'border-line bg-panel text-ink hover:border-teal'
  );
  const inner = (
    <>
      <span className={cx('grid h-9 w-9 place-items-center rounded-[10px]', primary ? 'bg-white/20 text-white' : 'bg-teal-t text-teal-d')}>
        <Icon size={20} aria-hidden />
      </span>
      {label}
    </>
  );
  const motionProps = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
    whileHover: { y: -2 },
    whileTap: { scale: 0.97 },
  };
  return to ? (
    <motion.div className="flex flex-1 basis-[200px]" {...motionProps}>
      <Link to={to} className={cx(cls, 'basis-auto')} style={{ flex: 1 }}>{inner}</Link>
    </motion.div>
  ) : (
    <motion.button type="button" onClick={onClick} className={cls} {...motionProps}>{inner}</motion.button>
  );
}

export default function Dashboard() {
  const { water, goal, addWater } = useApp();
  const waterPct = water / goal;
  const left = water >= goal ? 'Goal reached' : `${fmt(goal - water)} ml to go`;

  return (
    <Page>
      <Row className="gap-4">
        <QuickAction to="/scan" icon="scan" label="Scan food" primary delay={0.04} />
        <QuickAction to="/meals" icon="utensils" label="Log a meal" delay={0.08} />
        <QuickAction onClick={() => addWater(250)} icon="drop" label="Add water" delay={0.12} />
        <QuickAction to="/ai" icon="spark" label="Ask VibeAI" delay={0.16} />
      </Row>

      <Row>
        <Card className="flex-[2_1_520px]" delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Today's nutrition</CardTitle>
            <Chip variant="mute">Estimates. Targets are editable.</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <Ring size={168} stroke={12} pct={nutrition.calories.value / nutrition.calories.goal}>
              <span className="font-mono text-[32px] font-medium leading-none tracking-tight">{fmt(nutrition.calories.value)}</span>
              <span className="text-[13px] text-mute">of {fmt(nutrition.calories.goal)} kcal</span>
            </Ring>
            <div className="flex min-w-[260px] flex-1 flex-col gap-4">
              {nutrition.macros.map((m) => (
                <div key={m.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="font-mono text-[13px] text-mute">{m.value} / {m.goal} {m.unit}</span>
                  </div>
                  <Bar pct={(m.value / m.goal) * 100} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex-[1_1_300px]" delay={0.16}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Hydration</CardTitle>
            <Chip>{left}</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Ring size={124} stroke={10} pct={waterPct}>
              <span className="font-mono text-xl font-medium">{fmt(water)}</span>
              <span className="text-[13px] text-mute">ml</span>
            </Ring>
            <div className="flex min-w-[120px] flex-1 flex-col gap-1.5">
              <span className="font-mono text-[13px] text-mute">of {fmt(goal)} ml</span>
              <span className="text-[13px] text-mute">Reminders are on. Pause any time.</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[150, 250, 500].map((ml) => (
              <Button key={ml} className="flex-1 px-2" onClick={() => addWater(ml)}>+{ml} ml</Button>
            ))}
          </div>
        </Card>
      </Row>

      <Row>
        <Card className="flex-[2_1_520px] gap-1" delay={0.2}>
          <div className="flex items-center justify-between pb-3">
            <CardTitle>Today's meals</CardTitle>
            <Link to="/meals"><Button>Open meals</Button></Link>
          </div>
          {todayMeals.map((m) => (
            <div key={m.name} className="flex items-center gap-3.5 border-t border-line py-3.5">
              <span
                className={cx(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                  m.logged ? 'bg-teal text-white' : 'border-[1.5px] border-dashed border-teal text-teal-d'
                )}
              >
                {m.logged ? <Icons.check size={18} strokeWidth={2.2} aria-hidden /> : <Icons.plus size={18} strokeWidth={2.2} aria-hidden />}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{m.name}</span>
                <span className="text-[13px] text-mute">{m.items}</span>
              </div>
              <span className="font-mono text-sm">{m.kcal}</span>
              <Chip variant={m.logged ? 'ok' : 'default'}>{m.logged ? 'Logged' : 'Planned'}</Chip>
            </div>
          ))}
        </Card>

        <Card className="flex-[1_1_300px]" delay={0.24}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Wellness streak</CardTitle>
            <Chip>Best 12 days</Chip>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-teal-t text-teal-d">
              <Icons.flame size={26} aria-hidden />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[30px] font-medium leading-none">5 days</span>
              <span className="text-[13px] text-mute">hydration streak</span>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            {streakWeek.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 text-xs font-medium text-mute">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 400, damping: 22 }}
                  className={cx(
                    'grid h-[34px] w-[34px] place-items-center rounded-full',
                    p.state === 'done' && 'bg-teal text-white',
                    p.state === 'miss' && 'bg-track text-mute',
                    p.state === 'today' && 'border-2 border-teal text-teal-d'
                  )}
                >
                  {p.state === 'done' && <Icons.check size={16} strokeWidth={2.4} aria-hidden />}
                  {p.state === 'miss' && <Icons.minus size={16} strokeWidth={2.4} aria-hidden />}
                </motion.span>
                {p.l}
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-snug text-mute">A missed day is shown gently. Consistency matters more than perfection.</p>
          <Link to="/wellness"><Button className="w-full">View Wellness Journey</Button></Link>
        </Card>
      </Row>

      <Card className="flex-row flex-wrap items-center gap-[18px] border-[#C3D6CD] bg-teal-t" delay={0.3} hover={false}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-teal text-white">
          <Icons.spark size={22} aria-hidden />
        </span>
        <div className="flex min-w-[260px] flex-1 flex-col gap-1.5">
          <h2 className="font-serif text-lg font-semibold">Insight from your logs</h2>
          <p className="text-[15px] leading-relaxed">
            Protein is at 45 of 80 g with dinner still to come. Your planned roti and paneer is a good place to add some. Breakfast
            logging was also more consistent than last week.
          </p>
        </div>
        <Link to="/ai"><Button variant="primary">Ask VibeAI</Button></Link>
      </Card>
    </Page>
  );
}
