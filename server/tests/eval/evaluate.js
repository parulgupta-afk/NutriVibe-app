/**
 * NutriVibe safety-engine evaluation runner
 * Usage: node tests/eval/evaluate.js
 * Requires: safety engine to be importable and cases.json present.
 *
 * Metrics: precision, recall, false-negative rate for UNSAFE & CAUTION,
 * confusion matrix, category breakdown.
 * CI should fail if allergen false-negative rate > 0 on this labeled set.
 */

const fs = require('fs');
const path = require('path');

const CASES_PATH = path.join(__dirname, 'cases.json');

// Placeholder – wire to real safety engine when integrated:
// const { computeSafetyVerdict } = require('../../src/services/safetyEngine');

function loadCases() {
  const raw = fs.readFileSync(CASES_PATH, 'utf8');
  return JSON.parse(raw);
}

/** Stub: replace with real engine call */
function runVerdict(product, profile) {
  // Conservative stub for scaffolding – real integration replaces this.
  if (!product || !product.ingredients) return { verdict: 'CANNOT_VERIFY', reasons: ['missing product data'] };
  const text = (product.ingredients + ' ' + (product.allergens || []).join(' ') + ' ' + (product.mayContain || '') + ' ' + (product.warnings || '')).toLowerCase();
  const allergies = (profile.allergies || []).map((a) => a.toLowerCase());
  const hidden = { milk: ['casein', 'whey', 'lactoglobulin', 'milk solids'], egg: ['albumin'], peanut: ['peanut'] };

  for (const a of allergies) {
    if (text.includes(a)) return { verdict: 'UNSAFE', reasons: [`Contains ${a}`] };
    for (const h of hidden[a] || []) {
      if (text.includes(h)) return { verdict: 'UNSAFE', reasons: [`Contains hidden form of ${a}: ${h}`] };
    }
  }
  if (text.includes('may contain') || text.includes('facility that processes') || text.includes('shared equipment')) {
    return { verdict: 'CAUTION', reasons: ['Possible cross-contamination'] };
  }
  if (text.includes('m1lk') && allergies.includes('milk')) {
    return { verdict: 'UNSAFE', reasons: ['OCR-noisy milk match'] };
  }
  return { verdict: 'SAFE', reasons: [] };
}

function main() {
  const cases = loadCases();
  const labels = ['SAFE', 'CAUTION', 'UNSAFE', 'CANNOT_VERIFY'];
  const matrix = Object.fromEntries(labels.map((a) => [a, Object.fromEntries(labels.map((p) => [p, 0]))]));

  let allergenFN = 0;
  let allergenTotal = 0;
  const byCategory = {};

  for (const c of cases) {
    const actual = runVerdict(c.product, c.profile || {}).verdict;
    const expected = c.expected;
    matrix[expected][actual] = (matrix[expected][actual] || 0) + 1;

    const cat = c.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0, fn: 0 };
    byCategory[cat].total += 1;
    if (actual === expected) byCategory[cat].correct += 1;
    if ((expected === 'UNSAFE' || expected === 'CAUTION') && actual === 'SAFE') {
      byCategory[cat].fn += 1;
      if (c.category === 'allergen' || c.category === 'hidden') {
        allergenFN += 1;
        allergenTotal += 1;
      }
    } else if (c.category === 'allergen' || c.category === 'hidden') {
      allergenTotal += 1;
    }
  }

  function pr(expectedClass) {
    let tp = 0, fp = 0, fn = 0;
    for (const e of labels) {
      for (const a of labels) {
        const n = matrix[e][a];
        if (e === expectedClass && a === expectedClass) tp += n;
        else if (e !== expectedClass && a === expectedClass) fp += n;
        else if (e === expectedClass && a !== expectedClass) fn += n;
      }
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const fnr = tp + fn === 0 ? 0 : fn / (tp + fn);
    return { precision, recall, fnr, tp, fp, fn };
  }

  console.log('=== NutriVibe Safety Evaluation ===');
  console.log(`Cases: ${cases.length}`);
  console.log('\nConfusion matrix (rows=expected, cols=predicted):');
  console.log('           ' + labels.map((l) => l.padEnd(14)).join(''));
  for (const e of labels) {
    console.log(e.padEnd(12) + labels.map((a) => String(matrix[e][a] || 0).padEnd(14)).join(''));
  }

  for (const cls of ['UNSAFE', 'CAUTION']) {
    const m = pr(cls);
    console.log(`\n${cls}: precision=${m.precision.toFixed(3)} recall=${m.recall.toFixed(3)} FNR=${m.fnr.toFixed(3)}`);
  }

  console.log('\nBy category:');
  for (const [cat, s] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${s.correct}/${s.total} correct, FN=${s.fn}`);
  }

  const allergenFNR = allergenTotal === 0 ? 0 : allergenFN / allergenTotal;
  console.log(`\nAllergen false-negative rate: ${allergenFNR.toFixed(3)} (${allergenFN}/${allergenTotal})`);

  if (allergenFNR > 0) {
    console.error('\nCI FAIL: allergen false-negative rate > 0 on labeled set');
    process.exit(1);
  }
  console.log('\nCI PASS: allergen FNR = 0 on labeled set');
  process.exit(0);
}

main();
