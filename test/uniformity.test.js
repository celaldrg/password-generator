/**
 * Statistical checks behind the main promise of the generator: characters
 * are uniform (no modulo bias) and the "every selected set appears" rule
 * does not make some valid passwords more likely than others.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { generatePassword } from '../src/password.js';
import { seededSource } from '../src/random.js';

const ALPHANUMERIC = {
  lower: true,
  upper: true,
  digits: true,
  symbols: false,
  custom: '',
  excludeLookAlikes: false,
};
const ALPHANUMERIC_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SAMPLE_SIZE = 200_000;
const SIGNIFICANCE = 0.001;

// ---- chi-square p-value = regularized upper incomplete gamma Q(df / 2, x / 2) ----

const LANCZOS_G = 7;
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** ln Γ(z) for z >= 0.5 (Lanczos approximation). */
function logGamma(z) {
  const x = z - 1;
  let sum = LANCZOS[0];
  for (let i = 1; i < LANCZOS.length; i += 1) sum += LANCZOS[i] / (x + i);
  const t = x + LANCZOS_G + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}

/** Q(a, x): a power series below a + 1, a continued fraction (Lentz) above. */
function upperGamma(a, x) {
  if (x <= 0) return 1;
  const prefix = Math.exp(a * Math.log(x) - x - logGamma(a));
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < 10_000 && term > sum * 1e-15; n += 1) {
      term *= x / (a + n);
      sum += term;
    }
    return 1 - prefix * sum;
  }
  const tiny = 1e-300;
  let b = x + 1 - a;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 10_000; i += 1) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return prefix * h;
}

function chiSquarePValue(statistic, degreesOfFreedom) {
  return upperGamma(degreesOfFreedom / 2, statistic / 2);
}

function chiSquare(observed, expected) {
  return observed.reduce((sum, count, i) => sum + (count - expected[i]) ** 2 / expected[i], 0);
}

describe('chi-square helper', () => {
  it('matches known critical values', () => {
    assert.ok(Math.abs(chiSquarePValue(2 * Math.log(1000), 2) - 0.001) < 1e-9);
    assert.ok(Math.abs(chiSquarePValue(3.841458820694124, 1) - 0.05) < 1e-9);
    assert.ok(Math.abs(chiSquarePValue(79.082, 60) - 0.05) < 1e-4);
    assert.ok(Math.abs(chiSquarePValue(99.607, 60) - 0.001) < 1e-5);
  });
});

describe('character uniformity (DONE criterion)', () => {
  // A chi-square test of this size only finds coarse bias, like the byte
  // sampler below. Plain modulo of a 32-bit draw by 62 would favour 4 of the
  // 62 characters by about 1.4e-8 (1 in 69 million), far too little for any
  // sample to show; random.test.js checks the rejection boundary that removes
  // that bias directly.
  it('200,000 characters from the 62-character set pass chi-square at p > 0.001 (no modulo bias)', () => {
    const source = seededSource(2026);
    const counts = new Map(Array.from(ALPHANUMERIC_CHARS, (char) => [char, 0]));
    let total = 0;
    while (total < SAMPLE_SIZE) {
      const length = Math.min(128, SAMPLE_SIZE - total);
      for (const char of generatePassword({ ...ALPHANUMERIC, length }, source)) {
        assert.ok(counts.has(char), `unexpected character ${char}`);
        counts.set(char, counts.get(char) + 1);
      }
      total += length;
    }
    const observed = [...counts.values()];
    assert.equal(observed.length, 62);
    assert.equal(observed.reduce((sum, count) => sum + count, 0), SAMPLE_SIZE);
    const expected = observed.map(() => SAMPLE_SIZE / 62);
    const p = chiSquarePValue(chiSquare(observed, expected), 61);
    assert.ok(p > SIGNIFICANCE, `p = ${p}`);
  });

  it('the same test catches a naive byte % 62 sampler', () => {
    const source = seededSource(2026);
    const observed = new Array(62).fill(0);
    for (let i = 0; i < SAMPLE_SIZE; i += 1) observed[(source() & 0xff) % 62] += 1;
    const expected = observed.map(() => SAMPLE_SIZE / 62);
    const p = chiSquarePValue(chiSquare(observed, expected), 61);
    assert.ok(p < SIGNIFICANCE, `p = ${p}`);
  });
});

describe('required sets without bias', () => {
  // Length 4 from digits (10) plus custom "xy" (2). The valid passwords with
  // k custom characters number C(4, k) * 2^k * 10^(4 - k): 8000, 2400 and 320
  // for k = 1, 2, 3 (10,720 in all).
  const options = { length: 4, lower: false, upper: false, digits: true, symbols: false, custom: 'xy' };
  const uniform = [8000, 2400, 320].map((count) => count / 10_720);
  // Forcing one digit and one custom character, then filling and shuffling.
  const forcedThenShuffled = [25 / 36, 10 / 36, 1 / 36];
  const samples = 20_000;

  function customCharacterCounts(seed) {
    const source = seededSource(seed);
    const observed = [0, 0, 0];
    for (let i = 0; i < samples; i += 1) {
      const password = generatePassword(options, source);
      const custom = Array.from(password).filter((char) => char === 'x' || char === 'y').length;
      assert.ok(custom >= 1 && custom <= 3, `${password} breaks the required-set rule`);
      observed[custom - 1] += 1;
    }
    return observed;
  }

  it('makes every valid password equally likely', () => {
    const observed = customCharacterCounts(11);
    const p = chiSquarePValue(chiSquare(observed, uniform.map((share) => share * samples)), 2);
    assert.ok(p > SIGNIFICANCE, `p = ${p}`);
  });

  it('differs measurably from forcing one character per set and shuffling', () => {
    const observed = customCharacterCounts(11);
    const p = chiSquarePValue(chiSquare(observed, forcedThenShuffled.map((share) => share * samples)), 2);
    assert.ok(p < 1e-6, `p = ${p}`);
  });
});
