import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DURATION_UNITS,
  GUESS_RATES,
  STRENGTH_LABELS,
  STRENGTH_THRESHOLDS,
  crackTimes,
  humanizeSeconds,
  poolEntropyBits,
  strengthFromBits,
} from '../src/entropy.js';
import { DEFAULT_PASSPHRASE_OPTIONS, WORD_LISTS, passphraseEntropy } from '../src/passphrase.js';
import { DEFAULT_PASSWORD_OPTIONS, passwordEntropy } from '../src/password.js';

const YEAR = 365.2425 * 86_400;

describe('password entropy', () => {
  it('16 characters from 94 give 104.9 bits', () => {
    assert.equal(poolEntropyBits(16, 94).toFixed(1), '104.9');
    const { bits, poolSize, length } = passwordEntropy({ ...DEFAULT_PASSWORD_OPTIONS, length: 16 });
    assert.equal(poolSize, 94);
    assert.equal(length, 16);
    assert.equal(bits.toFixed(1), '104.9');
  });

  it('follows the selected sets', () => {
    assert.equal(passwordEntropy({ excludeLookAlikes: true }).poolSize, 89);
    assert.equal(passwordEntropy({ symbols: false }).poolSize, 62);
    assert.equal(passwordEntropy({ symbols: false, custom: 'çğ' }).poolSize, 64);
    assert.equal(
      passwordEntropy({ lower: false, upper: false, symbols: false, length: 6 }).bits,
      6 * Math.log2(10),
    );
  });

  it('is zero when no set is selected', () => {
    assert.deepEqual(passwordEntropy({ lower: false, upper: false, digits: false, symbols: false }), {
      bits: 0,
      poolSize: 0,
      length: 16,
    });
  });

  it('rejects impossible inputs', () => {
    assert.throws(() => poolEntropyBits(-1, 10), RangeError);
    assert.throws(() => poolEntropyBits(8, 0), RangeError);
    assert.throws(() => poolEntropyBits(Number.NaN, 10), RangeError);
  });
});

describe('passphrase entropy', () => {
  const base = { ...DEFAULT_PASSPHRASE_OPTIONS, words: 6, capitalization: 'capitalize', number: false };
  const wordBits = 6 * Math.log2(WORD_LISTS.en.length);

  it('is words * log2(list size)', () => {
    assert.deepEqual(passphraseEntropy(base), { bits: wordBits, listSize: WORD_LISTS.en.length, words: 6 });
    assert.equal(passphraseEntropy({ ...base, language: 'tr' }).listSize, WORD_LISTS.tr.length);
  });

  it('adds one bit per word for random capitalization', () => {
    assert.equal(passphraseEntropy({ ...base, capitalization: 'random' }).bits, wordBits + 6);
  });

  it('adds log2(10 * words) for the digit', () => {
    assert.equal(passphraseEntropy({ ...base, number: true }).bits, wordBits + Math.log2(60));
  });

  it('rejects invalid options', () => {
    assert.throws(() => passphraseEntropy({ words: 2 }), RangeError);
    assert.throws(() => passphraseEntropy({ language: 'de' }), RangeError);
  });
});

describe('strengthFromBits', () => {
  it('maps bits to scores 0-4 at the thresholds', () => {
    assert.deepEqual(STRENGTH_THRESHOLDS, [28, 36, 60, 80]);
    const cases = [
      [0, 0],
      [27.9, 0],
      [28, 1],
      [35.9, 1],
      [36, 2],
      [59.9, 2],
      [60, 3],
      [79.9, 3],
      [80, 4],
      [128, 4],
    ];
    for (const [bits, score] of cases) {
      assert.deepEqual(strengthFromBits(bits), { score, label: STRENGTH_LABELS[score] }, `${bits} bits`);
    }
  });
});

describe('crackTimes', () => {
  it('covers every attack scenario, slowest first', () => {
    const times = crackTimes(40);
    assert.deepEqual(
      times.map((time) => time.id),
      GUESS_RATES.map((rate) => rate.id),
    );
    for (let i = 1; i < times.length; i += 1) assert.ok(times[i].seconds < times[i - 1].seconds);
  });

  it('divides the number of guesses by the guess rate', () => {
    const [online, slowHash] = crackTimes(Math.log2(1e4));
    assert.ok(Math.abs(slowHash.seconds - 1) < 1e-9);
    assert.deepEqual(slowHash.duration, { unit: 'seconds', count: 1 });
    // 10,000 guesses at 100 per hour take 100 hours.
    assert.ok(Math.abs(online.seconds - 360_000) < 1e-3);
    assert.deepEqual(online.duration, { unit: 'days', count: 4 });
  });
});

describe('humanizeSeconds', () => {
  it('picks the largest unit that fits', () => {
    const cases = [
      [0, 'instant', 0],
      [0.99, 'instant', 0],
      [1, 'seconds', 1],
      [59, 'seconds', 59],
      [60, 'minutes', 1],
      [3_600, 'hours', 1],
      [86_400, 'days', 1],
      [YEAR / 12, 'months', 1],
      [YEAR, 'years', 1],
      [4.8e9 * YEAR, 'years', 4.8e9],
      [13.8e9 * YEAR, 'beyondUniverse', 0],
      [Infinity, 'beyondUniverse', 0],
      [Number.NaN, 'instant', 0],
    ];
    for (const [seconds, unit, count] of cases) {
      assert.deepEqual(humanizeSeconds(seconds), { unit, count }, `${seconds} s`);
    }
  });

  it('rounds before it picks the unit, so it never shows "60 seconds" or "24 hours"', () => {
    const cases = [
      [59.4, 'seconds', 59],
      [59.6, 'minutes', 1],
      [3_569, 'minutes', 59],
      [3_599, 'hours', 1],
      [86_399, 'days', 1],
      [YEAR - 1, 'years', 1],
    ];
    for (const [seconds, unit, count] of cases) {
      assert.deepEqual(humanizeSeconds(seconds), { unit, count }, `${seconds} s`);
    }
    const limits = { seconds: 60, minutes: 60, hours: 24, months: 12 };
    for (let exponent = 0; exponent <= 9; exponent += 0.001) {
      const { unit, count } = humanizeSeconds(10 ** exponent);
      if (unit in limits) assert.ok(count < limits[unit], `${10 ** exponent} s gave ${count} ${unit}`);
    }
  });

  it('only returns listed units', () => {
    for (let exponent = -3; exponent <= 20; exponent += 0.25) {
      assert.ok(DURATION_UNITS.includes(humanizeSeconds(10 ** exponent).unit));
    }
  });
});
