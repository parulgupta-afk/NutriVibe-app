import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function resolveProfileDisplayName(activeProfileId, dependents = []) {
  if (!activeProfileId) return 'Me';
  const match = dependents.find((d) => d._id === activeProfileId);
  return match?.name || 'Me';
}

function getDependentBadge(relationship) {
  const normalized = (relationship || '').toLowerCase();
  switch (normalized) {
    case 'child':
      return { label: 'Child', color: 'blue' };
    case 'parent':
      return { label: 'Parent', color: 'purple' };
    case 'spouse':
      return { label: 'Partner', color: 'pink' };
    default:
      return { label: 'Dependent', color: 'gray' };
  }
}

describe('client ProfileSelector logic tests', () => {
  const dependents = [
    { _id: 'dep_1', name: 'Alex', relationship: 'Child' },
    { _id: 'dep_2', name: 'Sam', relationship: 'Spouse' },
    { _id: 'dep_3', name: 'Pat', relationship: 'Parent' },
  ];

  it('resolves Me when activeProfileId is null, undefined, or empty', () => {
    assert.equal(resolveProfileDisplayName(null, dependents), 'Me');
    assert.equal(resolveProfileDisplayName(undefined, dependents), 'Me');
    assert.equal(resolveProfileDisplayName('', dependents), 'Me');
  });

  it('resolves matching dependent name by ID', () => {
    assert.equal(resolveProfileDisplayName('dep_1', dependents), 'Alex');
    assert.equal(resolveProfileDisplayName('dep_2', dependents), 'Sam');
    assert.equal(resolveProfileDisplayName('dep_3', dependents), 'Pat');
  });

  it('falls back to Me when activeProfileId does not exist in dependents', () => {
    assert.equal(resolveProfileDisplayName('dep_999', dependents), 'Me');
  });

  it('maps dependent relationship badges accurately', () => {
    assert.deepEqual(getDependentBadge('Child'), { label: 'Child', color: 'blue' });
    assert.deepEqual(getDependentBadge('Parent'), { label: 'Parent', color: 'purple' });
    assert.deepEqual(getDependentBadge('Spouse'), { label: 'Partner', color: 'pink' });
    assert.deepEqual(getDependentBadge('Friend'), { label: 'Dependent', color: 'gray' });
  });

  it('resolves Me when dependents array is empty', () => {
    assert.equal(resolveProfileDisplayName('dep_1', []), 'Me');
  });
});
