/**
 * Random password generation from character sets.
 *
 * Every selected set must appear at least once. Instead of forcing one
 * character per set and shuffling (which over-represents some passwords),
 * whole candidates are drawn uniformly from the combined alphabet and
 * rejected until one contains every set. The result is exactly uniform over
 * all valid passwords, and each character uses rejection sampling too.
 */

import { poolEntropyBits } from './entropy.js';
import { cryptoSource, pick } from './random.js';
import { asRecord, clamp, toBoolean, toInteger, toShortString } from './validate.js';

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;
export const MAX_CUSTOM_LENGTH = 64;

/** Characters that are easy to confuse in many fonts. */
export const LOOK_ALIKES = 'Il1O0';

/** The built-in sets; lower + upper + digits + symbols = 94 characters. */
export const CHARSETS = Object.freeze({
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
});

/** Set ids in display order; "custom" holds the user's extra characters. */
export const SET_IDS = Object.freeze(['lower', 'upper', 'digits', 'symbols', 'custom']);

/**
 * @typedef {Object} PasswordOptions
 * @property {number} length Number of characters (code points).
 * @property {boolean} lower
 * @property {boolean} upper
 * @property {boolean} digits
 * @property {boolean} symbols
 * @property {string} custom Extra characters; empty means no custom set.
 * @property {boolean} excludeLookAlikes Drop the characters in LOOK_ALIKES.
 */

/** @type {Readonly<PasswordOptions>} */
export const DEFAULT_PASSWORD_OPTIONS = Object.freeze({
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  custom: '',
  excludeLookAlikes: false,
});

const BUILT_IN_IDS = ['lower', 'upper', 'digits', 'symbols'];
const CUSTOM_CHAR = /^[\p{L}\p{N}\p{P}\p{S}]$/u;
const MAX_ATTEMPTS = 100_000;

/**
 * Turns untrusted input (UI fields, stored settings) into valid options.
 * Missing or invalid fields fall back to the defaults and the length is
 * clamped to [minimumLength(options), MAX_LENGTH].
 * @param {unknown} raw
 * @returns {PasswordOptions}
 */
export function normalizePasswordOptions(raw) {
  const input = asRecord(raw);
  const defaults = DEFAULT_PASSWORD_OPTIONS;
  const options = {
    length: toInteger(input.length, defaults.length),
    lower: toBoolean(input.lower, defaults.lower),
    upper: toBoolean(input.upper, defaults.upper),
    digits: toBoolean(input.digits, defaults.digits),
    symbols: toBoolean(input.symbols, defaults.symbols),
    custom: toShortString(input.custom, MAX_CUSTOM_LENGTH, defaults.custom),
    excludeLookAlikes: toBoolean(input.excludeLookAlikes, defaults.excludeLookAlikes),
  };
  options.length = clamp(options.length, minimumLength(options), MAX_LENGTH);
  return options;
}

/**
 * Builds the selected, non-empty character sets. Look-alikes are removed when
 * requested; custom characters are de-duplicated, stripped of spaces and
 * control characters, and left out when a selected built-in set has them,
 * so the sets never overlap.
 * @param {Partial<PasswordOptions>} options
 * @returns {{ id: string, chars: string[] }[]}
 */
export function buildCharsets(options) {
  const excluded = new Set(options.excludeLookAlikes ? LOOK_ALIKES : '');
  const used = new Set();
  const sets = [];
  for (const id of BUILT_IN_IDS) {
    if (!options[id]) continue;
    const chars = Array.from(CHARSETS[id]).filter((char) => !excluded.has(char));
    chars.forEach((char) => used.add(char));
    sets.push({ id, chars });
  }
  const custom = [...new Set(Array.from(String(options.custom ?? '')))].filter(
    (char) => CUSTOM_CHAR.test(char) && !excluded.has(char) && !used.has(char),
  );
  if (custom.length > 0) sets.push({ id: 'custom', chars: custom });
  return sets;
}

/**
 * Shortest allowed length: MIN_LENGTH, or more when more sets are selected
 * (each set needs at least one character).
 * @param {Partial<PasswordOptions>} options
 * @returns {number}
 */
export function minimumLength(options) {
  return Math.max(MIN_LENGTH, buildCharsets(options).length);
}

/**
 * Generates a password that contains at least one character of every
 * selected set, uniformly at random among all such passwords.
 * @param {Partial<PasswordOptions>} [options] Merged over the defaults.
 * @param {import('./random.js').RandomSource} [source]
 * @returns {string}
 * @throws {RangeError} When no set is selected or the length is invalid.
 */
export function generatePassword(options = {}, source = cryptoSource()) {
  const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
  const sets = buildCharsets(opts);
  if (sets.length === 0) {
    throw new RangeError('generatePassword: select at least one character set');
  }
  if (!Number.isInteger(opts.length) || opts.length < minimumLength(opts) || opts.length > MAX_LENGTH) {
    throw new RangeError(`generatePassword: length must be ${minimumLength(opts)}-${MAX_LENGTH}`);
  }
  const alphabet = sets.flatMap((set) => set.chars);
  const required = sets.map((set) => new Set(set.chars));
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const chars = Array.from({ length: opts.length }, () => pick(source, alphabet));
    if (required.every((set) => chars.some((char) => set.has(char)))) return chars.join('');
  }
  throw new Error('generatePassword: could not satisfy the character set rules');
}

/**
 * Entropy of the generator settings: length * log2(pool size). The rule
 * that every set appears removes only a small share of the combinations,
 * so this is the usual (slightly generous) figure.
 * @param {Partial<PasswordOptions>} [options] Merged over the defaults.
 * @returns {{ bits: number, poolSize: number, length: number }}
 */
export function passwordEntropy(options = {}) {
  const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
  const poolSize = buildCharsets(opts).reduce((sum, set) => sum + set.chars.length, 0);
  const bits = poolSize > 0 ? poolEntropyBits(opts.length, poolSize) : 0;
  return { bits, poolSize, length: opts.length };
}
