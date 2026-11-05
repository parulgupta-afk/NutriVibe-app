import { useState } from 'react';
import { Bar as RBar, BarChart, Cell, ReferenceLine, ResponsiveContainer, XAxis, YAxis, LabelList } from 'recharts';
import { Page, Card, CardTitle, Chip, Button, Kv, Toggle, Row } from '../components/ui.jsx';
import Ring from '../components/Ring.jsx';
import { Icons } from '../components/icons.js';
import { useApp } from '../context/AppContext.jsx';
import { hydrationWeek, reminders as initialReminders } from '../data/mock.js';

const fmt = (n) => n.toLocaleString('en-IN');

export default function Hydration() {
  const { water, goal, addWater, goalUp, goalDown } = useApp();
  const [rem, setRem] = useState(initialReminders);
  const [paused, setPaused] = useState(false);

  const data = [...hydrationWeek, { d: 'Wed', v: water, today: true }];
  const completed = hydrationWeek;
  const met = completed.filter((x) => x.v >= goal).length;
  const avg = Math.round(completed.reduce((a, x) => a + x.v, 0) / completed.length);
  const note = water >= goal ? 'Goal reached' : `${fmt(goal - water)} ml to go`;

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[1_1_380px] items-center text-center" delay={0.05}>
          <div className="flex w-full items-center justify-between">
            <CardTitle>Today</CardTitle>
            <Chip>{note}</Chip>
          </div>
          <Ring size={220} stroke={14} pct={water / goal}>
            <span className="font-mono text-[40px] font-medium leading-none tracking-tight">{fmt(water)}</span>
            <span className="text-[13px] text-mute">of {fmt(goal)} ml</span>
          </Ring>
          <div className="flex w-full gap-2">
            {[150, 250, 500].map((ml) => (
              <Button key={ml} variant="primary" className="flex-1 px-2" onClick={() => addWater(ml)}>+{ml} ml</Button>
            ))}
          </div>
          <div className="flex w-full items-center justify-between pt-1">
            <span className="text-[13px] text-mute">Daily goal</span>
            <div className="flex items-center gap-2.5">
              <Button square onClick={goalDown} aria-label="Lower goal by 250 ml"><Icons.minus size={20} aria-hidden /></Button>
              <span className="min-w-[84px] font-mono text-[15px]">{fmt(goal)} ml</span>
              <Button square onClick={goalUp} aria-label="Raise goal by 250 ml"><Icons.plus size={20} aria-hidden /></Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-[1.5_1_500px] flex-col gap-5">
          <Card delay={0.12}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Last 7 days</CardTitle>
              <Chip variant="mute">Dashed line is your goal</Chip>
            </div>
            <div className="h-[220px]" role="img" aria-label={`Daily water intake in millilitres for the last seven days. Today ${water} of ${goal}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 22, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#56655F' }} />
                  <YAxis hide domain={[0, 3200]} />
                  <ReferenceLine y={goal} stroke="#7C8E85" strokeDasharray="5 4" strokeWidth={2} />
                  <RBar dataKey="v" radius={[10, 10, 4, 4]} maxBarSize={44} animationDuration={900}>
                    {data.map((x) => (
                      <Cell key={x.d} fill={x.today ? '#2B514B' : x.v >= goal ? '#3A6B63' : '#B5C4BA'} />
                    ))}
                    <LabelList dataKey="v" position="top" formatter={fmt} style={{ fontSize: 11, fill: '#56655F', fontFamily: 'IBM Plex Mono' }} />
                  </RBar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Row className="gap-3">
              <Kv label="Average"><span className="font-mono text-lg font-medium">{fmt(avg)} ml</span></Kv>
              <Kv label="Days at goal"><span className="font-mono text-lg font-medium">{met} of {completed.length}</span></Kv>
              <Kv label="Best streak"><span className="font-mono text-lg font-medium">12 days</span></Kv>
            </Row>
          </Card>

          <Card className="gap-1.5" delay={0.18}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <CardTitle>Reminders</CardTitle>
              <span className="text-[13px] text-mute">Few and gentle. Pause any time.</span>
            </div>
            {rem.map((r) => (
              <div key={r.id} className="flex items-center gap-3.5 border-t border-line py-3.5">
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{r.name}</span>
                  <span className="font-mono text-[13px] text-mute">{r.time}</span>
                </div>
                <Toggle label={`${r.name} reminder`} on={r.on && !paused} onChange={(v) => setRem((all) => all.map((x) => (x.id === r.id ? { ...x, on: v } : x)))} />
              </div>
            ))}
            <div className="flex items-center gap-3.5 border-t border-line py-3.5">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-medium">Pause all reminders</span>
                <span className="font-mono text-[13px] text-mute">Resume when you are ready</span>
              </div>
              <Toggle label="Pause all reminders" on={paused} onChange={setPaused} />
            </div>
          </Card>
        </div>
      </Row>
    </Page>
  );
}
