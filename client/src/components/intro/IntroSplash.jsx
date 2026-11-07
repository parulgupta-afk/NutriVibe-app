import { useCallback, useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import './intro.css';
import {
  COLS,
  columnTops,
  easeOutCubic,
  isPileFull,
  lowestColumn,
  markIntroSeen,
  pieceBaseSize,
  shouldShowIntro,
  spawnInterval,
} from './introLogic.js';

// Bundled food artwork (Microsoft Fluent Emoji 3D, MIT). Vite resolves each file to a hashed URL.
const ART = import.meta.glob('../../assets/intro/*.webp', { eager: true, query: '?url', import: 'default' });
const SOURCES = Object.values(ART);

const rnd = (a, b) => a + Math.random() * (b - a);
const LOGO_HOLD_MS = 3600; // time the finished logo stays before the intro closes itself

export default function IntroSplash() {
  const [visible, setVisible] = useState(() =>
    typeof window === 'undefined'
      ? false
      : shouldShowIntro({
          storage: window.sessionStorage,
          search: window.location.search,
          prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
        })
  );
  const [revealed, setRevealed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const dimRef = useRef(null);
  const flashRef = useRef(null);
  const finishRef = useRef(() => {});

  const finish = useCallback(() => {
    markIntroSeen(window.sessionStorage);
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 450);
  }, []);
  finishRef.current = finish;

  useEffect(() => {
    if (!visible) return undefined;
    const { Engine, Bodies, Body, Composite } = Matter;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = rootRef.current.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const images = [];
    SOURCES.forEach((src) => {
      const im = new Image();
      im.src = src;
      images.push(im);
    });

    const engine = Engine.create();
    engine.gravity.y = 1.15;
    const T = 200;
    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W + 2 * T, T, { isStatic: true, friction: 0.6 }),
      Bodies.rectangle(-T / 2, H / 2 - H, T, H * 3, { isStatic: true, friction: 0.2 }),
      Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 3, { isStatic: true, friction: 0.2 }),
    ];
    Composite.add(engine.world, walls);

    const base = pieceBaseSize(W);
    const s = { bodies: [], phase: 'rain', t: 0, pt: 0, spawnIn: 250, acc: 0, revealed: false };
    let raf = 0;
    let last = null;
    let holdTimer = 0;

    const restingInfo = () =>
      s.bodies.map((b) => ({ x: b.position.x, y: b.position.y, r: b.circleRadius, speed: b.speed }));

    const spawn = () => {
      const idx = Math.floor(Math.random() * images.length);
      const size = base * rnd(0.82, 1.18);
      const r = size * 0.44;
      let x;
      if (Math.random() < 0.7 && s.t > 600) {
        // aim at the lowest part of the pile so it fills evenly
        x = ((lowestColumn(columnTops(restingInfo(), W, H)) + Math.random()) / COLS) * W;
      } else {
        x = rnd(r, W - r);
      }
      x = Math.max(r, Math.min(W - r, x));
      const b = Bodies.circle(x, -size * rnd(0.6, 1.6), r, {
        restitution: 0.22,
        friction: 0.4,
        frictionAir: 0.004,
        density: 0.0012,
      });
      Body.setAngularVelocity(b, rnd(-0.12, 0.12));
      Body.setVelocity(b, { x: rnd(-0.8, 0.8), y: rnd(3, 7) });
      b.nvImg = images[idx];
      b.nvSize = size;
      Composite.add(engine.world, b);
      s.bodies.push(b);
    };

    const burst = () => {
      s.phase = 'burst';
      s.pt = 0;
      engine.gravity.y = 0;
      Composite.remove(engine.world, walls);
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.hypot(cx, cy);
      s.bodies.forEach((b) => {
        const dx = b.position.x - cx;
        const dy = b.position.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const sp = rnd(16, 30) * (W < 560 ? 0.7 : 1) * (1 + (1 - Math.min(len / maxR, 1)) * 0.5);
        b.isSensor = true;
        Body.setVelocity(b, { x: (dx / len) * sp, y: (dy / len) * sp });
        Body.setAngularVelocity(b, rnd(-0.3, 0.3));
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const burstAlpha = s.phase === 'burst' ? Math.max(0, 1 - easeOutCubic(s.pt / 950)) : 1;
      if (burstAlpha > 0) {
        const z = s.phase === 'burst' ? 1 + easeOutCubic(s.pt / 900) * 0.5 : 1;
        s.bodies.forEach((b) => {
          if (!b.nvImg.complete) return;
          ctx.save();
          ctx.globalAlpha = burstAlpha;
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          ctx.shadowColor = 'rgba(2,12,10,.45)';
          ctx.shadowBlur = b.nvSize * 0.16;
          ctx.shadowOffsetY = b.nvSize * 0.07;
          const d = b.nvSize * z;
          ctx.drawImage(b.nvImg, -d / 2, -d / 2, d, d);
          ctx.restore();
        });
      }
      if (s.phase === 'burst') {
        const cx = W / 2;
        const cy = H / 2;
        const R = Math.hypot(cx, cy);
        [0, 140].forEach((delay, k) => {
          const t = (s.pt - delay) / 950;
          if (t <= 0 || t >= 1) return;
          ctx.beginPath();
          ctx.arc(cx, cy, easeOutCubic(t) * R * 1.05, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(143,211,182,${(0.85 * (1 - t) * (k ? 0.6 : 1)).toFixed(3)})`;
          ctx.lineWidth = (k ? 2 : 5) * (1 - t) + 1;
          ctx.stroke();
        });
      }
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (last === null) last = now;
      const dt = Math.min(now - last, 50);
      last = now;
      s.t += dt;
      s.pt += dt;
      s.acc += dt;
      while (s.acc >= 1000 / 60) {
        Engine.update(engine, 1000 / 60);
        s.acc -= 1000 / 60;
      }

      if (s.phase === 'rain') {
        s.spawnIn -= dt;
        while (s.spawnIn <= 0) {
          spawn();
          s.spawnIn += spawnInterval(s.t);
        }
        const full = s.t > 1800 && isPileFull(columnTops(restingInfo(), W, H), H);
        if (full || s.t > 9000) {
          s.phase = 'hold';
          s.pt = 0;
        }
      } else if (s.phase === 'hold') {
        canvas.style.transform = `scale(${(1 + 0.028 * Math.sin(Math.min(1, s.pt / 450) * Math.PI)).toFixed(4)})`;
        if (s.pt > 450) {
          canvas.style.transform = '';
          burst();
        }
      } else if (s.phase === 'burst') {
        const p = s.pt / 1000;
        dimRef.current.style.opacity = String(Math.min(1, easeOutCubic(p / 0.9)));
        flashRef.current.style.opacity = String(p < 0.25 ? p / 0.25 : Math.max(0, 1 - (p - 0.25) / 0.6));
        if (p > 0.35 && !s.revealed) {
          s.revealed = true;
          setRevealed(true);
          holdTimer = window.setTimeout(() => finishRef.current(), LOGO_HOLD_MS);
        }
        if (p > 1.15) {
          draw();
          cancelAnimationFrame(raf);
          raf = 0;
          return;
        }
      }
      draw();
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e) => {
      if (e.key === 'Escape') finishRef.current();
    };
    const onResize = () => finishRef.current();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevOverflow;
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [visible]);

  if (!visible) return null;

  const letters = [
    ...'Nutri'.split('').map((c) => ({ c, cls: 'nvi-a' })),
    ...'Vibe'.split('').map((c) => ({ c, cls: 'nvi-b' })),
  ];

  return (
    <div
      ref={rootRef}
      className={`nvi${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="NutriVibe. Eat smart. Stay safe. Live better."
      onClick={finish}
    >
      <canvas ref={canvasRef} className="nvi-canvas" aria-hidden="true" />
      <div className="nvi-vignette" aria-hidden="true" />
      <div ref={dimRef} className="nvi-dim" aria-hidden="true" />
      <div ref={flashRef} className="nvi-flash" aria-hidden="true" />

      <div className={`nvi-logo${revealed ? ' is-reveal' : ''}`} aria-hidden="true">
        <div className="nvi-glow" />
        <div className="nvi-mark">
          <svg viewBox="0 0 100 100">
            <circle className="nvi-ring-bg" cx="50" cy="50" r="46" />
            <circle className="nvi-ring" cx="50" cy="50" r="46" />
            <path className="nvi-tick" d="M30 52 L44 66 L72 36" />
          </svg>
        </div>
        <div className="nvi-word">
          {letters.map((l, i) => (
            <span key={`${l.c}-${i}`} className={l.cls} style={{ '--i': i }}>
              {l.c}
            </span>
          ))}
        </div>
        <div className="nvi-tag">
          <span>Eat Smart</span>
          <i>/</i>
          <span>Stay Safe</span>
          <i>/</i>
          <span>Live Better</span>
        </div>
        <div className="nvi-chips">
          <span className="nvi-chip" style={{ '--c': '#4CAF7A' }}>Safe</span>
          <span className="nvi-chip" style={{ '--c': '#E8B04A' }}>Caution</span>
          <span className="nvi-chip" style={{ '--c': '#D9604F' }}>Unsafe</span>
        </div>
      </div>

      <button
        type="button"
        className="nvi-skip"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
      >
        Skip intro
      </button>
    </div>
  );
}
