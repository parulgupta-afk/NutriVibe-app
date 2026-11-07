import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTRO_STORAGE_KEY, COLS, shouldShowIntro, markIntroSeen, pieceBaseSize,
  columnTops, isPileFull, lowestColumn, spawnInterval, easeOutCubic,
} from '../src/components/intro/introLogic.js';

const memStorage = (init = {}) => {
  const d = { ...init };
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, d };
};

describe('intro: when to show', () => {
  it('shows on the first visit of a session, then never again', () => {
    const st = memStorage();
    assert.equal(shouldShowIntro({ storage: st }), true);
    markIntroSeen(st);
    assert.equal(st.d[INTRO_STORAGE_KEY], '1');
    assert.equal(shouldShowIntro({ storage: st }), false);
  });
  it('never shows for reduced-motion users, even when forced', () => {
    assert.equal(shouldShowIntro({ storage: memStorage(), prefersReducedMotion: true }), false);
    assert.equal(shouldShowIntro({ storage: memStorage(), search: '?intro', prefersReducedMotion: true }), false);
  });
  it('?intro replays it even after it was seen', () => {
    const st = memStorage({ [INTRO_STORAGE_KEY]: '1' });
    assert.equal(shouldShowIntro({ storage: st, search: '?intro' }), true);
    assert.equal(shouldShowIntro({ storage: st, search: '?a=1&intro=1' }), true);
    assert.equal(shouldShowIntro({ storage: st, search: '?introduction=1' }), false);
  });
  it('survives blocked storage', () => {
    const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    assert.equal(shouldShowIntro({ storage: broken }), true);
    assert.doesNotThrow(() => markIntroSeen(broken));
  });
});

describe('intro: piece sizing and spawn pacing', () => {
  it('clamps piece size for phones and big screens', () => {
    assert.equal(pieceBaseSize(320), 70.4);
    assert.equal(pieceBaseSize(400) > 48, true);
    assert.equal(pieceBaseSize(4000), 118);
    assert.equal(pieceBaseSize(10), 48);
  });
  it('speeds up from 130 ms to 26 ms and holds there', () => {
    assert.equal(spawnInterval(0), 130);
    assert.equal(spawnInterval(2600), 26);
    assert.equal(spawnInterval(99999), 26);
    assert.ok(spawnInterval(1300) < spawnInterval(500));
  });
  it('easing stays in 0..1', () => {
    assert.equal(easeOutCubic(-5), 0);
    assert.equal(easeOutCubic(5), 1);
    assert.ok(easeOutCubic(0.5) > 0.5);
  });
});

describe('intro: pile fill detection', () => {
  const W = 1000, H = 600;
  it('an empty stage is not full', () => {
    const tops = columnTops([], W, H);
    assert.equal(tops.length, COLS);
    assert.equal(isPileFull(tops, H), false);
  });
  it('ignores pieces that are still moving or above the stage', () => {
    const tops = columnTops([{ x: 500, y: 300, r: 40, speed: 9 }, { x: 500, y: -50, r: 40, speed: 0 }], W, H);
    assert.ok(tops.every((t) => t === H));
  });
  it('records the top edge of resting pieces in every strip they cover', () => {
    const tops = columnTops([{ x: 500, y: 560, r: 40, speed: 0 }], W, H);
    assert.equal(Math.min(...tops), 520);
    assert.ok(tops.filter((t) => t === 520).length >= 1);
  });
  it('is full only once most of the width is stacked to the top fifth', () => {
    const row = (n) => Array.from({ length: n }, (_, i) => ({ x: ((i + 0.5) / n) * W, y: 60, r: 40, speed: 0 }));
    assert.equal(isPileFull(columnTops(row(4), W, H), H), false);
    assert.equal(isPileFull(columnTops(row(30), W, H), H), true);
  });
  it('lowestColumn picks the emptiest strip', () => {
    const tops = Array(COLS).fill(100); tops[6] = 590;
    assert.equal(lowestColumn(tops, () => 0.9), 6);
  });
});
