import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Page, Card, Chip, Segmented, Kv, Row, cx } from '../components/ui.jsx';
import VerdictRing, { verdictStyle } from '../components/VerdictRing.jsx';
import { Icons } from '../components/icons.js';
import { products as sampleProducts } from '../data/mock.js';
import { api } from '../api/index.js';

const modes = [
  { id: 'barcode', label: 'Barcode', icon: 'scan', caption: 'Align the barcode inside the frame or enter number' },
  { id: 'label', label: 'Label photo', icon: 'camera', caption: 'Photograph or paste the ingredient list' },
  { id: 'voice', label: 'Voice', icon: 'mic', caption: 'Say: "Is this safe for me?"' },
];

function Viewfinder({ caption, mode, onBarcodeSubmit, onLabelSubmit, loading }) {
  const corner = 'absolute h-[30px] w-[30px] border-[3px] border-[#A9D3C6]';
  const [barcodeInput, setBarcodeInput] = useState('');
  const [labelTextInput, setLabelTextInput] = useState('');

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#1D2B28] p-5 text-white" style={{ minHeight: 280 }}>
      <span className={cx(corner, 'left-[16px] top-[16px] rounded-tl-lg border-b-0 border-r-0 pointer-events-none')} />
      <span className={cx(corner, 'right-[16px] top-[16px] rounded-tr-lg border-b-0 border-l-0 pointer-events-none')} />
      <span className={cx(corner, 'bottom-[16px] left-[16px] rounded-bl-lg border-r-0 border-t-0 pointer-events-none')} />
      <span className={cx(corner, 'bottom-[16px] right-[16px] rounded-br-lg border-l-0 border-t-0 pointer-events-none')} />

      <div className="scanline absolute inset-x-[10%] top-1/4 h-0.5 animate-scan bg-[#8FE3C4] pointer-events-none" />

      <div className="my-auto flex flex-col items-center justify-center gap-3 z-10">
        {mode === 'barcode' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (barcodeInput.trim()) onBarcodeSubmit(barcodeInput.trim());
            }}
            className="flex w-full max-w-xs flex-col items-center gap-2.5"
          >
            <div className="flex h-20 w-32 flex-col justify-end gap-1.5 rounded-xl border border-[#476B63] bg-[#2C443F] p-2.5">
              <i
                className="block h-7"
                style={{ background: 'repeating-linear-gradient(90deg,#9CC7BA 0 3px,transparent 3px 7px)' }}
              />
              <b className="block h-1.5 w-3/5 rounded bg-[#476B63]" />
            </div>
            <div className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Barcode (e.g. 8901234567890)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full rounded-lg border border-[#476B63] bg-[#121B19] px-3 py-1.5 text-xs text-white placeholder-mute focus:border-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-[#121B19] hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '...' : 'Scan'}
              </button>
            </div>
          </form>
        )}

        {mode === 'label' && (
          <div className="flex w-full max-w-xs flex-col items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-teal bg-teal-t px-3 py-2 text-xs font-semibold text-teal hover:bg-teal hover:text-[#121B19] transition-colors">
              <Icons.camera size={16} />
              <span>Upload Label Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) onLabelSubmit(e.target.files[0]);
                }}
              />
            </label>
            <span className="text-[11px] text-mute">or enter text directly</span>
            <div className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Ingredients list..."
                value={labelTextInput}
                onChange={(e) => setLabelTextInput(e.target.value)}
                className="w-full rounded-lg border border-[#476B63] bg-[#121B19] px-3 py-1.5 text-xs text-white placeholder-mute focus:border-teal focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (labelTextInput.trim()) onLabelSubmit(labelTextInput.trim());
                }}
                disabled={loading}
                className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-[#121B19] hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '...' : 'Analyze'}
              </button>
            </div>
          </div>
        )}

        {mode === 'voice' && (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-teal-t text-teal">
              <Icons.mic size={24} />
            </div>
            <p className="text-xs text-mute">Voice scanning requires microphone permission in browser</p>
          </div>
        )}
      </div>

      <div className="text-center text-[12px] text-teal-t z-10">{caption}</div>
    </div>
  );
}

function normalizeProduct(item) {
  if (!item) return sampleProducts[0];
  if (item.head && item.todo) return item;

  const product = item.data || item;
  const report = item.safetyReport || product.safetyReport || {};
  const verdictRaw = (report.verdict || report.overallVerdict || report.level || product.safetyInfo?.riskLevel || 'SAFE').toUpperCase();
  const verdict = ['SAFE', 'CAUTION', 'UNSAFE', 'CANNOT_VERIFY'].includes(verdictRaw)
    ? verdictRaw
    : (verdictRaw === 'UNKNOWN' ? 'CANNOT_VERIFY' : 'SAFE');

  const ingredientsList = Array.isArray(product.ingredients)
    ? product.ingredients.map((i) => {
        const text = typeof i === 'string' ? i : (i.name || i.t || '');
        const flag = (report.factors || []).some((f) => (f.impact || '').toLowerCase().includes(text.toLowerCase()));
        return { t: text, flag };
      })
    : [{ t: 'Ingredients on label', flag: false }];

  return {
    id: product._id || product.barcode || String(Date.now()),
    name: product.name || 'Scanned Product',
    verdict,
    head: report.recommendations?.[0] || (verdict === 'SAFE' ? 'Safe for your profile' : 'Check ingredient declarations'),
    ingredients: ingredientsList,
    trigger: (report.factors || [])[0]?.name || (report.factors || [])[0]?.impact || 'Deterministic Safety Rules',
    confidence: report.ruleVersion ? `Rules v${report.ruleVersion}` : 'Deterministic Engine',
    why: (report.factors || []).map((f) => f.impact).join('. ') || (verdict === 'SAFE' ? 'No allergens or dietary conflicts detected for your active profile.' : 'Potential conflict identified with your declared health profile.'),
    source: product.brand ? `${product.brand} · NutriVibe Verified` : 'NutriVibe Food Intelligence',
    todo: (report.recommendations || []).join('. ') || (verdict === 'SAFE' ? 'Safe to consume according to your active dietary profile.' : 'Verify packaging or choose a recommended alternative.')
  };
}

export default function Scanner() {
  const [currentProduct, setCurrentProduct] = useState(sampleProducts[0]);
  const [mode, setMode] = useState('barcode');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const p = normalizeProduct(currentProduct);
  const v = verdictStyle[p.verdict] || verdictStyle.CANNOT_VERIFY;

  const handleBarcodeSubmit = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.scanBarcode(barcode);
      if (res && (res.data || res.success)) {
        setCurrentProduct(res.data ? res : res);
      } else {
        setError('Product not found for barcode: ' + barcode);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to scan barcode. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLabelSubmit = async (fileOrText) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.scanLabel(fileOrText);
      if (res && (res.data || res.success)) {
        setCurrentProduct(res.data ? res : res);
      } else {
        setError('Label scan could not extract readable ingredients.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Label extraction failed. Please try again with clear lighting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Row className="items-start">
        <Card className="flex-[1_1_380px]" delay={0.05}>
          <Segmented label="Scan method" value={mode} onChange={setMode} options={modes} />
          <Viewfinder
            caption={modes.find((m) => m.id === mode).caption}
            mode={mode}
            onBarcodeSubmit={handleBarcodeSubmit}
            onLabelSubmit={handleLabelSubmit}
            loading={loading}
          />
          {error && (
            <div role="alert" aria-live="polite" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <span className="kl">Sample scans</span>
            {sampleProducts.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={x.id === p.id}
                aria-label={`Select sample product ${x.name}, verdict ${x.verdict}`}
                onClick={() => {
                  setError(null);
                  setCurrentProduct(x);
                }}
                className={cx(
                  'flex min-h-12 items-center justify-between gap-2.5 rounded-xl border px-3.5 py-1.5 text-left text-sm font-medium transition-colors',
                  x.id === p.id ? 'border-teal bg-teal-t' : 'border-line bg-panel hover:border-teal'
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
                  {p.ingredients.map((i, idx) => (
                    <Chip key={i.t + idx} variant={i.flag ? v.chip : 'mute'}>{i.t}</Chip>
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
                    type="button"
                    aria-label="Switch to safer alternative: Oat and jaggery biscuits"
                    onClick={() => {
                      const safeSample = sampleProducts.find((s) => s.verdict === 'SAFE');
                      if (safeSample) setCurrentProduct(safeSample);
                    }}
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
