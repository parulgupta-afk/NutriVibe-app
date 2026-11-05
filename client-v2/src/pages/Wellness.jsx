import { Page, Card, CardTitle, Chip, Bar, Kv, Row, cx } from '../components/ui.jsx';
import Ring from '../components/Ring.jsx';
import { Icons } from '../components/icons.js';
import { scoreCategories, streaks, achievements, weeklyReport } from '../data/mock.js';

export default function Wellness() {
  // Habit consistency score = weighted completion. Not a medical score.
  const score = Math.round(scoreCategories.reduce((a, c) => a + (c.w * c.c) / 100, 0));

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[1.3_1_460px]" delay={0.05}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Weekly habit score</CardTitle>
            <Chip variant="mute">Consistency, not a medical score</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <Ring size={168} stroke={12} pct={score / 100}>
              <span className="font-mono text-[44px] font-medium leading-none tracking-tight">{score}</span>
              <span className="text-[13px] text-mute">out of 100</span>
            </Ring>
            <div className="flex min-w-[240px] flex-1 flex-col gap-3.5">
              {scoreCategories.map((c) => (
                <div key={c.n} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c.n}</span>
                    <span className="font-mono text-[13px] text-mute">{c.w}% weight · {c.c}%</span>
                  </div>
                  <Bar pct={c.c} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex-[1_1_300px]" delay={0.1}>
          <CardTitle>Streaks</CardTitle>
          {streaks.map((s) => {
            const Icon = Icons[s.icon];
            return (
              <div key={s.name} className="flex items-center gap-3.5 border-t border-line py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-t text-teal-d">
                  <Icon size={20} aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{s.name}</span>
                  <span className="text-[13px] text-mute">{s.note}</span>
                </div>
                <span className="font-mono text-lg font-medium">{s.days}</span>
              </div>
            );
          })}
        </Card>
      </Row>

      <Card delay={0.15}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Weekly nutrition report</CardTitle>
          <Chip>Calculated from your logs</Chip>
        </div>
        <Row className="gap-3">
          <Kv label="Planned meals"><span className="font-mono text-[26px] font-medium leading-none">{weeklyReport.planned}</span></Kv>
          <Kv label="Logged meals"><span className="font-mono text-[26px] font-medium leading-none">{weeklyReport.logged}</span></Kv>
          <Kv label="Plan followed"><span className="font-mono text-[26px] font-medium leading-none">{weeklyReport.followed}</span></Kv>
          <Kv label="Avg daily protein"><span className="font-mono text-[26px] font-medium leading-none">{weeklyReport.avgProtein} g</span></Kv>
        </Row>
      </Card>

      <Card delay={0.2}>
        <CardTitle>Achievements</CardTitle>
        <Row className="gap-3">
          {achievements.map((a) => {
            const Icon = Icons[a.icon];
            return (
              <div key={a.name} className={cx('flex flex-1 basis-[200px] items-center gap-3.5 rounded-2xl border border-line bg-panel2 p-3.5', !a.on && 'opacity-60')}>
                <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[14px]', a.on ? 'bg-teal text-white' : 'bg-track text-mute')}>
                  <Icon size={20} aria-hidden />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{a.name}</span>
                  <span className="text-[13px] text-mute">{a.note}</span>
                </div>
              </div>
            );
          })}
        </Row>
      </Card>
    </Page>
  );
}
