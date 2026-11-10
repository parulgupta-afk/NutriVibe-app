import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { debounce } from '../src/utils/debounce.js';

describe('client debounce utility tests', () => {
  it('delays execution and merges rapid successive calls', async () => {
    let callCount = 0;
    let lastValue = '';

    const fn = (val) => {
      callCount++;
      lastValue = val;
    };

    const debounced = debounce(fn, 50);

    debounced('a');
    debounced('ab');
    debounced('abc');

    assert.equal(callCount, 0);

    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(callCount, 1);
    assert.equal(lastValue, 'abc');
  });

  it('cancels pending executions when cancel() is invoked', async () => {
    let executed = false;
    const debounced = debounce(() => {
      executed = true;
    }, 50);

    debounced();
    debounced.cancel();

    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.equal(executed, false);
  });

  it('returns a callable debounced function equipped with cancel method', () => {
    const fn = debounce(() => {}, 100);
    assert.equal(typeof fn, 'function');
    assert.equal(typeof fn.cancel, 'function');
  });

  it('safely invokes debounced function with multiple arguments', async () => {
    let received = [];
    const debounced = debounce((...args) => {
      received = args;
    }, 20);
    debounced('alpha', 42, true);
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.deepEqual(received, ['alpha', 42, true]);
  });
});

