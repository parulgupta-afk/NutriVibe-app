/**
 * Pure helpers for the intro splash (kept separate so they are unit-tested without a DOM).
 */

export const INTRO_STORAGE_KEY = 'nv_intro_seen';
export const COLS = 14;

/** Show once per browser session, never for reduced-motion users; `?intro` forces a replay. */
export function shouldShowIntro({ storage, search = '', prefersReducedMotion = false } = {}) {
  if (prefersReducedMotion) return false;
  if (/(^|[?&])intro(=1|=true)?(&|$)/.test(search)) return true;
  try {
    return storage?.getItem(INTRO_STORAGE_KEY) !== '1';
  } catch {
    return true; // storage blocked: showing it is harmless
  }
}

// Marks intro splash as viewed in client storage
export function markIntroSeen(storage) {
  try {
    storage?.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    /* storage blocked: the intro may show again, which is fine */
  }
}

/**
 * Piece size from stage width, clamped between 48px and 118px.
 * @param {number} width Stage viewport width in pixels.
 * @returns {number} Clamped dimension.
 */
export function pieceBaseSize(width) {
  return Math.max(48, Math.min(width * (width < 560 ? 0.22 : 0.092), 118));
}

/**
 * Top edge (y) of the resting pile in each of COLS vertical strips; `height` means empty.
 * `bodies` are { x, y, r, speed } in stage pixels.
 * @param {Array<{x: number, y: number, r: number, speed: number}>} bodies Physics bodies
 * @param {number} width Stage viewport width
 * @param {number} height Stage viewport height
 * @param {number} [cols=COLS] Number of columns
 * @returns {number[]} Array of resting vertical boundary positions per column
 */
export function columnTops(bodies, width, height, cols = COLS) {
  const tops = Array(cols).fill(height);
  for (const b of bodies) {
    if (b.speed > 2.2 || b.y < 0) continue;
    const top = b.y - b.r;
    const c0 = Math.max(0, Math.floor(((b.x - b.r) / width) * cols));
    const c1 = Math.min(cols - 1, Math.floor(((b.x + b.r) / width) * cols));
    for (let c = c0; c <= c1; c++) tops[c] = Math.min(tops[c], top);
  }
  return tops;
}

/** Full = at least 86% of the width is stacked into the top fifth of the stage. */
export function isPileFull(tops, height, cols = COLS) {
  const filled = tops.filter((t) => t < height * 0.2).length;
  return filled >= Math.ceil(cols * 0.86);
}

/** Index of the lowest part of the pile (largest top), ties broken by `rand`. */
export function lowestColumn(tops, rand = Math.random) {
  let best = 0;
  for (let c = 1; c < tops.length; c++) {
    if (tops[c] > tops[best] + 4 || (Math.abs(tops[c] - tops[best]) <= 4 && rand() < 0.5)) best = c;
  }
  return best;
}

/** Interval between pieces: starts slow, speeds up over the first 2.6 s. */
export function spawnInterval(elapsedMs) {
  return 130 - 104 * Math.min(1, elapsedMs / 2600);
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
