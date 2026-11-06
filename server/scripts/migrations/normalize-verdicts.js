/**
 * One-time migration: normalize legacy verdict strings to canonical set.
 * Canonical: SAFE | CAUTION | UNSAFE | CANNOT_VERIFY
 *
 * Usage:
 *   node scripts/migrations/normalize-verdicts.js --dry-run
 *   node scripts/migrations/normalize-verdicts.js
 */
const MAP = {
  Safe: 'SAFE',
  safe: 'SAFE',
  SAFE: 'SAFE',
  Caution: 'CAUTION',
  caution: 'CAUTION',
  CAUTION: 'CAUTION',
  Unsafe: 'UNSAFE',
  unsafe: 'UNSAFE',
  UNSAFE: 'UNSAFE',
  'Cannot Verify': 'CANNOT_VERIFY',
  'cannot verify': 'CANNOT_VERIFY',
  CannotVerify: 'CANNOT_VERIFY',
  CANNOT_VERIFY: 'CANNOT_VERIFY',
};

async function run({ dryRun = true } = {}) {
  // Wire to mongoose models that store verdict fields.
  // Example:
  // const Report = require('../../src/models/ScanReport');
  // const docs = await Report.find({ verdict: { $exists: true } });
  // for (const d of docs) {
  //   const next = MAP[d.verdict];
  //   if (next && next !== d.verdict) {
  //     if (!dryRun) { d.verdict = next; await d.save(); }
  //     console.log(d._id, d.verdict, '->', next);
  //   }
  // }
  console.log(dryRun ? 'DRY RUN only – no writes' : 'Applying migration');
  console.log('Map:', MAP);
  console.log('TODO: connect models and run update.');
}

const dryRun = !process.argv.includes('--apply');
run({ dryRun }).catch((e) => {
  console.error(e);
  process.exit(1);
});
