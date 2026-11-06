/**
 * NutriVibe safety-engine evaluation runner
 * Usage: node tests/eval/evaluate.js
 *
 * Evaluates the real production deterministic safety engine against
 * labeled real-world test cases covering allergens, derivatives,
 * cross-contamination, dietary rules, drug interactions, Indian foods,
 * INS additives, OCR noise, and fail-closed uncertainty modes.
 *
 * Metrics:
 * - Accuracy, Precision, Recall, False-Negative Rate (FNR) for UNSAFE & CAUTION
 * - Complete 4x4 Confusion Matrix (SAFE, CAUTION, UNSAFE, CANNOT_VERIFY)
 * - Category-by-category breakdown
 * - Fails with exit code 1 if allergen FNR > 0 on labeled dataset.
 */

const fs = require('fs');
const path = require('path');
const { computeSafetyVerdict } = require('../../src/services/safetyEngine');

const CASES_PATH = path.join(__dirname, 'cases.json');

function loadCases() {
  const raw = fs.readFileSync(CASES_PATH, 'utf8');
  return JSON.parse(raw);
}

function runEngineVerdict(product, profile) {
  // Execute through the real production safety engine
  const user = {
    preferences: {
      allergies: profile.allergies || [],
      dietaryRestrictions: profile.dietaryRestrictions || [],
      medications: profile.medications || []
    }
  };
  return computeSafetyVerdict(product, user);
}

function main() {
  const cases = loadCases();
  const labels = ['SAFE', 'CAUTION', 'UNSAFE', 'CANNOT_VERIFY'];
  const matrix = Object.fromEntries(labels.map((e) => [e, Object.fromEntries(labels.map((p) => [p, 0]))]));

  let totalCases = cases.length;
  let correctPredictions = 0;
  let allergenUnsafeTotal = 0;
  let allergenUnsafeFalseNegatives = 0; // UNSAFE predicted as SAFE
  const byCategory = {};

  for (const c of cases) {
    const result = runEngineVerdict(c.product, c.profile || {});
    const actual = result.verdict;
    const expected = c.expected;

    matrix[expected][actual] = (matrix[expected][actual] || 0) + 1;
    if (actual === expected) {
      correctPredictions += 1;
    }

    const cat = c.category || 'other';
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, correct: 0, fn: 0 };
    }
    byCategory[cat].total += 1;
    if (actual === expected) {
      byCategory[cat].correct += 1;
    }

    // False negatives: expected UNSAFE or CAUTION, but predicted SAFE
    const isFalseNegative = (expected === 'UNSAFE' || expected === 'CAUTION') && actual === 'SAFE';
    if (isFalseNegative) {
      byCategory[cat].fn += 1;
    }

    // Safety-critical allergen tracking
    if (expected === 'UNSAFE' && (cat === 'allergen' || cat === 'hidden' || cat === 'indian' || cat === 'ocr-noise')) {
      allergenUnsafeTotal += 1;
      if (actual === 'SAFE') {
        allergenUnsafeFalseNegatives += 1;
        console.error(`CRITICAL ALLERGEN FALSE NEGATIVE: Case ${c.id} expected UNSAFE but predicted SAFE!`);
      }
    }
  }

  function classMetrics(targetClass) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;

    for (const e of labels) {
      for (const a of labels) {
        const count = matrix[e][a] || 0;
        if (e === targetClass && a === targetClass) tp += count;
        else if (e !== targetClass && a === targetClass) fp += count;
        else if (e === targetClass && a !== targetClass) fn += count;
        else tn += count;
      }
    }

    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const fnr = tp + fn === 0 ? 0 : fn / (tp + fn);
    return { tp, fp, fn, tn, precision, recall, fnr };
  }

  const overallAccuracy = totalCases === 0 ? 0 : correctPredictions / totalCases;

  console.log('=== NutriVibe Production Safety Evaluation ===');
  console.log(`Evaluated ${totalCases} test cases using production safety engine (computeSafetyVerdict).\n`);
  console.log(`Overall Accuracy: ${(overallAccuracy * 100).toFixed(2)}% (${correctPredictions}/${totalCases})\n`);

  console.log('Confusion Matrix (Rows = Expected, Columns = Predicted):');
  console.log('             ' + labels.map((l) => l.padEnd(15)).join(''));
  for (const e of labels) {
    console.log(e.padEnd(13) + labels.map((a) => String(matrix[e][a] || 0).padEnd(15)).join(''));
  }
  console.log('');

  console.log('Per-Class Metrics:');
  for (const cls of ['UNSAFE', 'CAUTION', 'CANNOT_VERIFY', 'SAFE']) {
    const m = classMetrics(cls);
    console.log(
      `  ${cls.padEnd(14)}: Precision=${(m.precision * 100).toFixed(1)}% | Recall=${(m.recall * 100).toFixed(1)}% | FNR=${(m.fnr * 100).toFixed(1)}% | TP=${m.tp} FP=${m.fp} FN=${m.fn}`
    );
  }
  console.log('');

  console.log('Category Breakdown:');
  for (const [cat, data] of Object.entries(byCategory)) {
    const pct = data.total === 0 ? 0 : (data.correct / data.total) * 100;
    console.log(`  ${cat.padEnd(20)}: ${data.correct}/${data.total} correct (${pct.toFixed(1)}%), FN=${data.fn}`);
  }
  console.log('');

  const allergenFNR = allergenUnsafeTotal === 0 ? 0 : allergenUnsafeFalseNegatives / allergenUnsafeTotal;
  console.log(`Allergen UNSAFE Cases: ${allergenUnsafeTotal}`);
  console.log(`Allergen False-Negative Count: ${allergenUnsafeFalseNegatives}`);
  console.log(`Allergen False-Negative Rate: ${allergenFNR.toFixed(4)} (${(allergenFNR * 100).toFixed(2)}%)`);

  if (allergenUnsafeFalseNegatives > 0) {
    console.error('\n❌ CI FAIL: Known allergen cases were incorrectly classified as SAFE!');
    process.exit(1);
  }

  console.log('\n✅ CI PASS: Zero allergen false negatives on labeled evaluation dataset.');
}

if (require.main === module) {
  main();
}

module.exports = { runEngineVerdict, main };
