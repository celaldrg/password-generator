import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { load, save } from '../src/storage.js';

function memoryStore() {
  const data = new Map();
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

const blockedStore = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
};

describe('storage', () => {
  it('saves and loads JSON under a prefixed key', () => {
    const store = memoryStore();
    assert.equal(save('settings', { mode: 'passphrase' }, store), true);
    assert.deepEqual([...store.data.keys()], ['password-generator:settings']);
    assert.deepEqual(load('settings', null, store), { mode: 'passphrase' });
  });

  it('returns the fallback when nothing is stored or the data is broken', () => {
    const store = memoryStore();
    assert.equal(load('missing', 'fallback', store), 'fallback');
    store.data.set('password-generator:broken', '{not json');
    assert.equal(load('broken', 'fallback', store), 'fallback');
  });

  it('never throws when storage is blocked, full or missing', () => {
    assert.equal(load('settings', 'fallback', blockedStore), 'fallback');
    assert.equal(save('settings', { a: 1 }, blockedStore), false);
    assert.equal(load('settings', 'fallback', null), 'fallback');
    assert.equal(save('settings', { a: 1 }, null), false);
    assert.equal(save('settings', 10n, memoryStore()), false);
  });

  it('survives a localStorage that throws on access (private mode)', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      assert.equal(load('settings', 'fallback'), 'fallback');
      assert.equal(save('settings', { a: 1 }), false);
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else delete globalThis.localStorage;
    }
  });

  it('falls back quietly where there is no localStorage at all', () => {
    assert.equal(load('never-saved', 'fallback'), 'fallback');
  });
});
