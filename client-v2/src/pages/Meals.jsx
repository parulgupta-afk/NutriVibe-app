import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page, Card, CardTitle, Chip, Button, Segmented, Row, cx } from '../components/ui.jsx';
import { Icons } from '../components/icons.js';
import { todayMeals, photoItems } from '../data/mock.js';

const modes = [
  { id: 'manual', label: 'Manual', icon: 'type' },
  { id: 'photo', label: 'Photo', icon: 'camera' },
  { id: 'voice', label: 'Voice', icon: 'mic' },
];

export default function Meals() {
  const [mode, setMode] = useState('photo');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[1.4_1_480px] gap-1" delay={0.05}>
          <div className="flex items-center justify-between pb-2.5">
            <CardTitle>Today</CardTitle>
            <Chip variant="mute" className="font-mono">1,250 / 2,000 kcal</Chip>
          </div>
          {todayMeals.map((m) => (
            <div key={m.name} className="flex items-start gap-3.5 border-t border-line py-3.5">
              <span
                className={cx(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                  m.logged ? 'bg-teal text-white' : 'border-[1.5px] border-dashed border-teal text-teal-d'
                )}
              >
                {m.logged ? <Icons.check size={18} strokeWidth={2.2} aria-hidden /> : <Icons.plus size={18} strokeWidth={2.2} aria-hidden />}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[15px] font-semibold">{m.name}</span>
                <span className="text-[13px] text-mute">{m.logged ? m.items : `Planned: ${m.items.toLowerCase()}`}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-sm">{m.kcal}</span>
                <Chip variant={m.logged ? 'ok' : 'default'}>{m.logged ? 'Logged' : 'Planned'}</Chip>
              </div>
            </div>
          ))}
        </Card>

        <Card className="flex-[1_1_380px]" delay={0.12}>
          <CardTitle>Add to dinner</CardTitle>
          <Segmented label="How to add a meal" value={mode} onChange={setMode} options={modes} />

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              {mode === 'manual' && (
                <>
                  <label htmlFor="foodsearch" className="kl">Search a food</label>
                  <input
                    id="foodsearch"
                    type="text"
                    placeholder="Try oats, dal, paneer"
                    className="h-12 rounded-xl border border-line bg-white px-4 text-[15px]"
                  />
                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-panel2 px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <b className="text-sm">Oats</b>
                      <span className="text-[13px] text-mute">50 grams</span>
                    </div>
                    <span className="font-mono text-sm">190 kcal</span>
                  </div>
                </>
              )}

              {mode === 'photo' && (
                <>
                  <div className="flex items-center gap-3 rounded-[14px] border border-line bg-panel2 px-4 py-3.5 text-[13px] text-mute">
                    <Icons.camera size={20} className="shrink-0 text-ink" aria-hidden />
                    Dinner photo analysed. Check each item before logging.
                  </div>
                  {photoItems.map((p) => (
                    <div key={p.t} className="flex items-center justify-between py-1">
                      <span className="text-[15px] font-medium">{p.t}</span>
                      <Chip variant={confirmed ? 'ok' : p.c === 'High' ? 'default' : 'warn'}>
                        {confirmed ? 'Confirmed' : `${p.c} confidence`}
                      </Chip>
                    </div>
                  ))}
                  <p className="text-[13px] leading-snug text-mute">AI estimates can be off. A photo cannot confirm exact portions.</p>
                  <Button variant="primary" onClick={() => setConfirmed((c) => !c)}>
                    {confirmed ? 'Edit items' : 'Confirm items'}
                  </Button>
                </>
              )}

              {mode === 'voice' && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <button
                    aria-label="Start voice logging"
                    className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-teal text-white"
                  >
                    <span className="absolute -inset-2 animate-pulseRing rounded-full border-2 border-teal" aria-hidden="true" />
                    <Icons.mic size={30} aria-hidden />
                  </button>
                  <p className="max-w-[320px] font-serif text-[19px] leading-snug">
                    "I had two parathas and a glass of milk for breakfast."
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Chip>2 parathas</Chip>
                    <Chip>1 glass of milk</Chip>
                    <Chip variant="mute">Breakfast</Chip>
                  </div>
                  <p className="text-[13px] text-mute">Quantities are prepared as an entry for you to confirm or edit.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </Row>
    </Page>
  );
}
