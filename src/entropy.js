/**
 * Entropy, strength levels and crack-time estimates.
 *
 * "Bits" always means log2 of a number of possibilities: for a generated
 * value it is the size of the space it was drawn from, for a typed password
 * it is the estimated number of guesses (see strength.js).
 */

/** Lower bounds (in bits) of the scores 1, 2, 3 and 4. */
export const STRENGTH_THRESHOLDS = Object.freeze([28, 36, 60, 80]);

/** i18n keys of the scores 0 to 4. */
export const STRENGTH_LABELS = Object.freeze([
  'strength.veryWeak',
  'strength.weak',
  'strength.fair',
  'strength.strong',
  'strength.veryStrong',
]);

/**
 * Attack scenarios used for the crack-time table, slowest first.
 * The UI explains each one through the i18n keys rate.<id> and rate.<id>.note.
 */
export const GUESS_RATES = Object.freeze([
  Object.freeze({ id: 'online', perSecond: 100 / 3600 }),
  Object.freeze({ id: 'slowHash', perSecond: 1e4 }),
  Object.freeze({ id: 'fastHash', perSecond: 1e11 }),
  Object.freeze({ id: 'cluster', perSecond: 1e14 }),
]);

/** Every unit humanizeSeconds can return (i18n keys time.<unit>). */
export const DURATION_UNITS = Object.freeze([
  'instant',
  'seconds',
  'minutes',
  'hours',
  'days',
  'months',
  'years',
  'beyondUniverse',
]);

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.2425 * DAY;
const MONTH = YEAR / 12;
const UNIVERSE_AGE = 13.8e9 * YEAR;
const UNIT_SIZES = [
  ['years', YEAR],
  ['months', MONTH],
  ['days', DAY],
  ['hours', HOUR],
  ['minutes', MINUTE],
  ['seconds', 1],
];

/**
 * Entropy of `length` symbols drawn independently and uniformly from a pool:
 * length * log2(poolSize). 16 characters from 94 give 104.9 bits.
 * @param {number} length
 * @param {number} poolSize
 * @returns {number}
 */
export function poolEntropyBits(length, poolSize) {
  if (!(length >= 0) || !(poolSize >= 1)) {
    throw new RangeError('poolEntropyBits: length must be >= 0 and poolSize >= 1');
  }
  return length * Math.log2(poolSize);
}

/**
 * Maps bits to a score from 0 (very weak) to 4 (very strong).
 * @param {number} bits
 * @returns {{ score: number, label: string }}
 */
export function strengthFromBits(bits) {
  const score = STRENGTH_THRESHOLDS.filter((threshold) => bits >= threshold).length;
  return { score, label: STRENGTH_LABELS[score] };
}

/**
 * Time needed for 2^guessesLog2 guesses in every attack scenario.
 * For a generated value pass bits - 1: on average an attacker searches half
 * of the space before hitting it.
 * @param {number} guessesLog2
 * @returns {{ id: string, perSecond: number, seconds: number,
 *   duration: { unit: string, count: number } }[]}
 */
export function crackTimes(guessesLog2) {
  return GUESS_RATES.map(({ id, perSecond }) => {
    const seconds = 2 ** (guessesLog2 - Math.log2(perSecond));
    return { id, perSecond, seconds, duration: humanizeSeconds(seconds) };
  });
}

/**
 * Turns seconds into the largest fitting unit and a rounded count.
 * Under one second is "instant"; past the age of the universe (and for
 * Infinity) it is "beyondUniverse". Both have count 0.
 * @param {number} seconds
 * @returns {{ unit: string, count: number }}
 */
export function humanizeSeconds(seconds) {
  if (!(seconds >= 1)) return { unit: 'instant', count: 0 };
  if (seconds >= UNIVERSE_AGE) return { unit: 'beyondUniverse', count: 0 };
  const index = UNIT_SIZES.findIndex(([, unitSize]) => seconds >= unitSize);
  const [unit, size] = UNIT_SIZES[index];
  const count = Math.round(seconds / size);
  // Rounding can reach the next unit: 59.6 s is "1 minute", not "60 seconds".
  if (index > 0 && count * size >= UNIT_SIZES[index - 1][1]) return { unit: UNIT_SIZES[index - 1][0], count: 1 };
  return { unit, count };
}
