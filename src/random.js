/**
 * Random sources and unbiased sampling.
 *
 * A random source is a function that returns a uniformly distributed
 * integer in [0, 2^32). The app uses crypto.getRandomValues; tests and the
 * ?demo screen inject a seeded source so their output is reproducible.
 *
 * @typedef {() => number} RandomSource
 */

const UINT32_RANGE = 2 ** 32;

/**
 * Creates a cryptographically secure source backed by crypto.getRandomValues.
 * @param {{ getRandomValues(array: Uint32Array): Uint32Array }} [cryptoImpl]
 * @returns {RandomSource}
 */
export function cryptoSource(cryptoImpl = globalThis.crypto) {
  if (typeof cryptoImpl?.getRandomValues !== 'function') {
    throw new Error('crypto.getRandomValues is not available');
  }
  const buffer = new Uint32Array(1);
  return () => {
    cryptoImpl.getRandomValues(buffer);
    return buffer[0];
  };
}

/**
 * Creates a deterministic source (sfc32 seeded through splitmix32).
 * Only for tests and the demo screen, never for real passwords.
 * @param {number} seed Any number; it is reduced to 32 bits.
 * @returns {RandomSource}
 */
export function seededSource(seed) {
  const init = splitmix32(seed >>> 0);
  let a = init();
  let b = init();
  let c = init();
  let d = init();
  const next = () => {
    const t = (((a + b) >>> 0) + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = ((c << 21) | (c >>> 11)) >>> 0;
    c = (c + t) >>> 0;
    return t;
  };
  for (let i = 0; i < 12; i += 1) next();
  return next;
}

/**
 * Returns an unbiased integer in [0, n) by rejection sampling: draws that
 * fall into the incomplete last block of 2^32 are thrown away, so every
 * result has exactly the same number of preimages (no modulo bias).
 * @param {RandomSource} source
 * @param {number} n Range size, an integer in [1, 2^32].
 * @returns {number}
 */
export function randomInt(source, n) {
  if (!Number.isInteger(n) || n < 1 || n > UINT32_RANGE) {
    throw new RangeError(`randomInt: range must be an integer in [1, 2^32], got ${n}`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % n);
  for (;;) {
    const x = source();
    if (!Number.isInteger(x) || x < 0 || x >= UINT32_RANGE) {
      throw new TypeError('randomInt: the random source must return 32-bit unsigned integers');
    }
    if (x < limit) return x % n;
  }
}

/**
 * Picks a uniformly random element of a non-empty array.
 * @template T
 * @param {RandomSource} source
 * @param {readonly T[]} items
 * @returns {T}
 */
export function pick(source, items) {
  return items[randomInt(source, items.length)];
}

function splitmix32(seed) {
  let state = seed;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
    return (z ^ (z >>> 15)) >>> 0;
  };
}
