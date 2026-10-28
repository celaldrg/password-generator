import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cryptoSource, pick, randomInt, seededSource } from '../src/random.js';

const UINT32_RANGE = 2 ** 32;

/** A source that replays the given values and counts how many were used. */
function scriptedSource(values) {
  let index = 0;
  const source = () => {
    if (index >= values.length) throw new Error('scripted source ran out of values');
    index += 1;
    return values[index - 1];
  };
  source.used = () => index;
  return source;
}

function take(source, count) {
  return Array.from({ length: count }, () => source());
}

describe('seededSource', () => {
  it('repeats the same sequence for the same seed', () => {
    assert.deepEqual(take(seededSource(42), 8), take(seededSource(42), 8));
  });

  it('gives a different sequence for a different seed', () => {
    assert.notDeepEqual(take(seededSource(42), 8), take(seededSource(43), 8));
  });

  it('returns unsigned 32-bit integers', () => {
    for (const value of take(seededSource(7), 1000)) {
      assert.ok(Number.isInteger(value) && value >= 0 && value < UINT32_RANGE, `bad value ${value}`);
    }
  });

  it('reduces any seed to 32 bits', () => {
    assert.deepEqual(take(seededSource(-1), 4), take(seededSource(UINT32_RANGE - 1), 4));
  });
});

describe('randomInt', () => {
  it('stays in [0, n)', () => {
    const source = seededSource(1);
    for (const n of [1, 2, 3, 6, 62, 94, 1000, 2 ** 31 + 1]) {
      for (let i = 0; i < 200; i += 1) {
        const value = randomInt(source, n);
        assert.ok(Number.isInteger(value) && value >= 0 && value < n, `${value} for n = ${n}`);
      }
    }
  });

  it('returns the raw draw for n = 2^32', () => {
    assert.equal(randomInt(scriptedSource([123_456_789]), UINT32_RANGE), 123_456_789);
  });

  it('throws away draws from the incomplete last block instead of wrapping them', () => {
    // 2^32 = n + 2^30, so plain modulo would map these two draws onto 0 and 2^30 - 1.
    const n = 3 * 2 ** 30;
    const source = scriptedSource([n, UINT32_RANGE - 1, 7]);
    assert.equal(randomInt(source, n), 7);
    assert.equal(source.used(), 3);
  });

  it('keeps values below 2^30 at 1/3 of the draws (plain modulo would give 1/2)', () => {
    const n = 3 * 2 ** 30;
    const source = seededSource(5);
    const draws = 30_000;
    let low = 0;
    for (let i = 0; i < draws; i += 1) {
      if (randomInt(source, n) < 2 ** 30) low += 1;
    }
    assert.ok(Math.abs(low / draws - 1 / 3) < 0.02, `share ${low / draws}`);
  });

  it('rejects invalid ranges', () => {
    const source = seededSource(1);
    for (const n of [0, -1, 1.5, UINT32_RANGE + 1, Number.NaN, Infinity, '6']) {
      assert.throws(() => randomInt(source, n), RangeError, `n = ${String(n)}`);
    }
  });

  it('rejects sources that do not return unsigned 32-bit integers', () => {
    for (const bad of [-1, 0.5, UINT32_RANGE, Number.NaN, '1']) {
      assert.throws(() => randomInt(() => bad, 10), TypeError, `draw = ${String(bad)}`);
    }
  });
});

describe('pick', () => {
  it('returns every element about equally often', () => {
    const source = seededSource(3);
    const counts = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 30_000; i += 1) counts[pick(source, ['a', 'b', 'c'])] += 1;
    for (const count of Object.values(counts)) {
      assert.ok(Math.abs(count - 10_000) < 600, `count ${count}`);
    }
  });
});

describe('cryptoSource', () => {
  it('reads from crypto.getRandomValues', () => {
    const fake = {
      getRandomValues(array) {
        array[0] = 4_000_000_000;
        return array;
      },
    };
    assert.equal(cryptoSource(fake)(), 4_000_000_000);
  });

  it('works with the built-in Web Crypto API', () => {
    const value = cryptoSource()();
    assert.ok(Number.isInteger(value) && value >= 0 && value < UINT32_RANGE);
  });

  it('fails loudly when getRandomValues is missing', () => {
    assert.throws(() => cryptoSource({}), /getRandomValues/);
    assert.throws(() => cryptoSource(null), /getRandomValues/);
  });
});
