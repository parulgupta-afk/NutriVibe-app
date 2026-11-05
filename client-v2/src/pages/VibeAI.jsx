import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page, Card, CardTitle, Chip, Button, Kv, Row, cx } from '../components/ui.jsx';
import { Icons } from '../components/icons.js';
import { aiContext, weeklyReport } from '../data/mock.js';

const prompts = [
  { id: 'dinner', text: 'Suggest something for dinner' },
  { id: 'week', text: 'Summarize my nutrition this week' },
];

const suggestions = [
  { name: 'Roti + paneer bhurji', why: 'Planned for tonight. Adds protein toward your 80 g target.' },
  { name: 'Khichdi', why: 'A light one-pot meal of dal and rice from your plan.' },
  { name: 'Vegetable pulao', why: 'Adds the vegetables you logged less of this week.' },
];

const Bubble = ({ me, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 320, damping: 26 }}
    className={cx(
      'max-w-[640px] rounded-[18px] px-[18px] py-3.5 text-[15px] leading-relaxed',
      me ? 'self-end rounded-br-md bg-teal text-white' : 'rounded-bl-md border border-line bg-panel2'
    )}
  >
    {children}
  </motion.div>
);

export default function VibeAI() {
  const [convo, setConvo] = useState('dinner');

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[2_1_560px]" delay={0.05} hover={false}>
          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div key={convo} initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                {convo === 'dinner' ? (
                  <>
                    <Bubble me>Suggest something for dinner.</Bubble>
                    <Bubble delay={0.15}>
                      Based on your logged meals today and your vegetarian preference, here are three dinner suggestions. Each one
                      passed your safety check.
                    </Bubble>
                    <Row className="gap-3">
                      {suggestions.map((s, i) => (
                        <motion.div
                          key={s.name}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          whileHover={{ y: -2 }}
                          className="flex flex-1 basis-[200px] flex-col gap-2.5 rounded-2xl border border-line bg-panel p-4 hover:border-teal"
                        >
                          <b className="text-[15px]">{s.name}</b>
                          <span className="text-[13px] leading-snug text-mute">{s.why}</span>
                          <span><Chip variant="ok">Safety-checked</Chip></span>
                        </motion.div>
                      ))}
                    </Row>
                  </>
                ) : (
                  <>
                    <Bubble me>Summarize my nutrition this week.</Bubble>
                    <Bubble delay={0.15}>
                      You planned {weeklyReport.planned} meals, logged {weeklyReport.logged} and followed the plan on {weeklyReport.followed}.
                      Protein averaged {weeklyReport.avgProtein} g a day against your 80 g target, so a protein-forward dinner a few
                      nights a week would help.
                    </Bubble>
                    <Row className="gap-3">
                      <Kv label="Planned"><span className="font-mono text-2xl font-medium">{weeklyReport.planned}</span></Kv>
                      <Kv label="Logged"><span className="font-mono text-2xl font-medium">{weeklyReport.logged}</span></Kv>
                      <Kv label="Followed"><span className="font-mono text-2xl font-medium">{weeklyReport.followed}</span></Kv>
                    </Row>
                    <p className="text-[13px] text-mute">Numbers come from your records. VibeAI only explains them.</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                aria-pressed={convo === p.id}
                onClick={() => setConvo(p.id)}
                className={cx(
                  'min-h-12 rounded-xl border px-3.5 py-1.5 text-left text-sm font-medium transition-colors',
                  convo === p.id ? 'border-teal bg-teal-t' : 'border-line bg-panel hover:border-teal'
                )}
              >
                {p.text}
              </button>
            ))}
          </div>

          <form className="flex flex-wrap gap-2.5" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="aiq" className="sr-only">Ask VibeAI</label>
            <input
              id="aiq"
              type="text"
              placeholder="Ask about meals, goals or a scanned product"
              className="h-12 min-w-[200px] flex-1 rounded-xl border border-line bg-white px-4 text-[15px]"
            />
            <Button type="submit" variant="primary" square aria-label="Send">
              <Icons.send size={20} aria-hidden />
            </Button>
          </form>
        </Card>

        <Card className="flex-[1_1_280px]" delay={0.12}>
          <CardTitle>VibeAI can use</CardTitle>
          <div className="flex flex-col">
            {aiContext.map((c) => (
              <div key={c} className="flex items-center gap-3.5 border-t border-line py-[11px]">
                <Icons.check size={20} className="text-teal" aria-hidden />
                <span className="text-sm">{c}</span>
              </div>
            ))}
          </div>
          <p className="flex gap-2 text-[13px] leading-snug text-mute">
            <Icons.shield size={16} className="mt-0.5 shrink-0" aria-hidden />
            VibeAI never overrides the safety engine. For allergy and medication questions it uses the verified result.
          </p>
        </Card>
      </Row>
    </Page>
  );
}
