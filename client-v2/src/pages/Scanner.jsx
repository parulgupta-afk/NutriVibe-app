import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page, Card, Chip, Segmented, Kv, Row, cx } from '../components/ui.jsx';
import VerdictRing, { verdictStyle } from '../components/VerdictRing.jsx';
import { Icons } from '../components/icons.js';
import { products } from '../data/mock.js';

const modes = [
  { id: 'barcode', label: 'Barcode', icon: 'scan', caption: 'Align the barcode inside the frame' },
  { id: 'label', label: 'Label photo', icon: 'camera', caption: 'Photograph the ingredient list' },
  { id: 'voice', label: 'Voice', icon: 'mic', caption: 'Say: "Is this safe for me?"' },
];

function Viewfinder({ caption }) {
  const corner = 'absolute h-[30px] w-[30px] border-[3px] border-[#A9D3C6]';
  return (
    <div className="relative grid h-[272px] place-items-center overflow-hidden rounded-2xl bg-[#1D2B28]" aria-hidden="true">
      <span className={cx(corner, 'left-[22px] top-[22px] rounded-tl-lg border-b-0 border-r-0')} />
      <span className={cx(corner, 'right-[22px] top-[22px] rounded-tr-lg border-b-0 border-l-0')} />
      <span className={cx(corner, 'bottom-[22px] left-[22px] rounded-bl-lg border-r-0 border-t-0')} />
      <span className={cx(corner, 'bottom-[22px] right-[22px] rounded-br-lg border-l-0 border-t-0')} />
      <div className="flex h-[150px] w-28 flex-col justify-end gap-2.5 rounded-xl border border-[#476B63] bg-[#2C443F] p-3.5">
        <i
          className="block h-[34px]"
          style={{ background: 'repeating-linear-gradient(90deg,#9CC7BA 0 3px,transparent 3px 7px)' }}
        />
        <b className="block h-2 w-3/5 rounded bg-[#476B63]" />
      </div>
      <div className="scanline absolute inset-x-[10%] h-0.5 animate-scan bg-[#8FE3C4]" />
      <div className="absolute inset-x-0 bottom-3.5 text-center text-[13px] text-teal-t">{caption}</div>
    </div>
  );
}

export default function Scanner() {
  const [productId, setProductId] = useState('choc');
  const [mode, setMode] = useState('barcode');
  const p = products.find((x) => x.id === productId);
  const v = verdictStyle[p.verdict];

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[1_1_380px]" delay={0.05}>
          <Segmented label="Scan method" value={mode} onChange={setMode} options={modes} />
          <Viewfinder caption={modes.find((m) => m.id === mode).caption} />
          <div className="flex flex-col gap-2">
            <span className="kl">Try a sample scan</span>
            {products.map((x) => (
              <button
                key={x.id}
                aria-pressed={x.id === productId}
                onClick={() => setProductId(x.id)}
                className={cx(
                  'flex min-h-12 items-center justify-between gap-2.5 rounded-xl border px-3.5 py-1.5 text-left text-sm font-medium transition-colors',
                  x.id === productId ? 'border-teal bg-teal-t' : 'border-line bg-panel hover:border-teal'
                )}
              >
                <span>{x.name}</span>
                <Chip variant={verdictStyle[x.verdict].chip}>{x.verdict}</Chip>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex-[1.5_1_500px]" delay={0.12} hover={false}>
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-[18px]"
            >
              <div className="flex flex-wrap items-center gap-7">
                <VerdictRing verdict={p.verdict} />
                <div className="flex min-w-[240px] flex-1 flex-col gap-2.5">
                  <span className="kl">Scan result</span>
                  <h2 className="font-serif text-[30px] font-semibold leading-[1.15]">{p.name}</h2>
                  <p className="text-base font-medium" style={{ color: v.text }}>{p.head}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="kl">What the label says</span>
                <div className="flex flex-wrap gap-2">
                  {p.ingredients.map((i) => (
                    <Chip key={i.t} variant={i.flag ? v.chip : 'mute'}>{i.t}</Chip>
                  ))}
                </div>
              </div>

              <Row className="gap-3">
                <Kv label="Triggered by"><span className="text-[15px] font-semibold">{p.trigger}</span></Kv>
                <Kv label="Confidence"><span className="text-[15px] font-semibold">{p.confidence}</span></Kv>
                <Kv label="Why" className="basis-full"><span className="text-sm leading-relaxed">{p.why}</span></Kv>
                <Kv label="Source" className="basis-full"><span className="text-sm">{p.source}</span></Kv>
              </Row>

              <div className="flex items-start gap-3 rounded-[14px] p-4 text-sm leading-relaxed" style={{ background: v.tint }}>
                <Icons.shield size={20} className="mt-px shrink-0" style={{ color: v.text }} aria-hidden />
                <span><b>What to do.</b> {p.todo}</span>
              </div>

              {p.verdict !== 'SAFE' && (
                <div className="flex flex-col gap-2">
                  <span className="kl">Safer alternative for your profile</span>
                  <button
                    onClick={() => setProductId('biscuit')}
                    className="flex min-h-12 items-center justify-between rounded-xl border border-line bg-panel px-3.5 py-1.5 text-left text-sm font-medium hover:border-teal"
                  >
                    <span>Oat and jaggery biscuits</span>
                    <Chip variant="ok">SAFE</Chip>
                  </button>
                </div>
              )}

              <p className="flex items-center gap-2 text-[13px] text-mute">
                <Icons.shield size={16} aria-hidden />
                The rules engine decides the verdict. Gemini only explains it.
              </p>
            </motion.div>
          </AnimatePresence>
        </Card>
      </Row>
    </Page>
  );
}
