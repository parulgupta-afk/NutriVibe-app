import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VERDICT_STYLES, getVerdictConfig } from '../src/utils/verdictStyles.js';

/**
 * Tests for VerdictRing style mappings and stroke calculations across canonical verdicts.
 */
describe('client VerdictRing logic & styles tests', () => {
  it('defines valid styling in VERDICT_STYLES for all canonical verdicts', () => {
    ['SAFE', 'Safe', 'CAUTION', 'Caution', 'UNSAFE', 'Unsafe', 'CANNOT_VERIFY', 'UNKNOWN', 'Unknown'].forEach((v) => {
      assert.ok(VERDICT_STYLES[v], `VERDICT_STYLES[${v}] should be defined`);
      assert.ok(VERDICT_STYLES[v].stroke, `stroke for ${v}`);
      assert.ok(VERDICT_STYLES[v].text, `text for ${v}`);
      assert.ok(VERDICT_STYLES[v].label, `label for ${v}`);
      assert.ok(typeof VERDICT_STYLES[v].pct === 'number', `pct for ${v}`);
    });
  });

  it('defines valid styling and labels for SAFE', () => {
    const safeUpper = VERDICT_STYLES.SAFE;
    const safeCapital = VERDICT_STYLES.Safe;
    assert.ok(safeUpper, 'SAFE should be defined');
    assert.equal(safeUpper.label, 'SAFE');
    assert.equal(safeUpper.pct, 1);
    assert.equal(safeUpper.stroke, '#10B981');
    assert.equal(safeCapital.label, 'SAFE');
  });

  it('defines valid styling and labels for CAUTION', () => {
    const caution = VERDICT_STYLES.CAUTION;
    assert.ok(caution, 'CAUTION should be defined');
    assert.equal(caution.label, 'CAUTION');
    assert.equal(caution.pct, 0.65);
    assert.equal(caution.stroke, '#F59E0B');
  });

  it('defines valid styling and labels for UNSAFE', () => {
    const unsafe = VERDICT_STYLES.UNSAFE;
    assert.ok(unsafe, 'UNSAFE should be defined');
    assert.equal(unsafe.label, 'UNSAFE');
    assert.equal(unsafe.pct, 0.25);
    assert.equal(unsafe.stroke, '#EF4444');
  });

  it('defines valid fallback styling for CANNOT_VERIFY and Unknown', () => {
    const unknown = VERDICT_STYLES.Unknown;
    const cannotVerify = VERDICT_STYLES.CANNOT_VERIFY;
    assert.ok(unknown, 'Unknown should be defined');
    assert.ok(cannotVerify, 'CANNOT_VERIFY should be defined');
    assert.equal(unknown.label, 'CANNOT VERIFY');
    assert.equal(cannotVerify.label, 'CANNOT VERIFY');
    assert.equal(unknown.pct, 0.5);
    assert.equal(unknown.stroke, '#6B7280');
  });

  it('computes correct config and ARIA label with score', () => {
    const config = getVerdictConfig('SAFE', 88);
    assert.equal(config.label, 'SAFE');
    assert.equal(config.pct, 0.88);
    assert.equal(config.ariaLabel, 'Safety verdict: SAFE, score 88');
  });

  it('computes correct config without score', () => {
    const config = getVerdictConfig('CAUTION');
    assert.equal(config.label, 'CAUTION');
    assert.equal(config.pct, 0.65);
    assert.equal(config.ariaLabel, 'Safety verdict: CAUTION');
  });

  it('clamps scores safely between 0 and 100 in getVerdictConfig', () => {
    const low = getVerdictConfig('SAFE', -20);
    assert.equal(low.pct, 0);

    const high = getVerdictConfig('SAFE', 150);
    assert.equal(high.pct, 1);

    const fallback = getVerdictConfig('CUSTOM_UNRECOGNIZED_VERDICT');
    assert.equal(fallback.label, 'CANNOT VERIFY');
    assert.equal(fallback.pct, 0.5);
  });

  it('resolves fallback config for undefined verdict input', () => {
    const result = getVerdictConfig(undefined);
    assert.equal(result.label, 'CANNOT VERIFY');
    assert.equal(result.pct, 0.5);
  });

  it('resolves fallback config for null verdict input', () => {
    const result = getVerdictConfig(null);
    assert.equal(result.label, 'CANNOT VERIFY');
  });
});
