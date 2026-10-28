/**
 * Passphrases: random words from the built-in English or Turkish lists.
 */

import { cryptoSource, pick, randomInt } from './random.js';
import { asRecord, clamp, toBoolean, toInteger, toShortString } from './validate.js';
import { EN_WORDS } from './words-en.js';
import { TR_WORDS } from './words-tr.js';

export const MIN_WORDS = 3;
export const MAX_WORDS = 12;
export const MAX_SEPARATOR_LENGTH = 3;

/** Word lists by language code. */
export const WORD_LISTS = Object.freeze({ en: EN_WORDS, tr: TR_WORDS });

/**
 * lower: all lowercase; capitalize: First letter of each word;
 * upper: ALL CAPS; random: each word lowercase or capitalized by coin flip.
 */
export const CAPITALIZATIONS = Object.freeze(['lower', 'capitalize', 'upper', 'random']);

/**
 * @typedef {Object} PassphraseOptions
 * @property {number} words Number of words.
 * @property {'en'|'tr'} language Word list to draw from.
 * @property {string} separator Placed between words (may be empty).
 * @property {'lower'|'capitalize'|'upper'|'random'} capitalization
 * @property {boolean} number Append one random digit to one random word.
 */

/** @type {Readonly<PassphraseOptions>} */
export const DEFAULT_PASSPHRASE_OPTIONS = Object.freeze({
  words: 6,
  language: 'en',
  separator: '-',
  capitalization: 'capitalize',
  number: true,
});

const LOCALES = Object.freeze({ en: 'en-US', tr: 'tr-TR' });

/**
 * Turns untrusted input (UI fields, stored settings) into valid options.
 * @param {unknown} raw
 * @returns {PassphraseOptions}
 */
export function normalizePassphraseOptions(raw) {
  const input = asRecord(raw);
  const defaults = DEFAULT_PASSPHRASE_OPTIONS;
  return {
    words: clamp(toInteger(input.words, defaults.words), MIN_WORDS, MAX_WORDS),
    language: isLanguage(input.language) ? input.language : defaults.language,
    separator: toShortString(input.separator, MAX_SEPARATOR_LENGTH, defaults.separator),
    capitalization: CAPITALIZATIONS.includes(input.capitalization)
      ? input.capitalization
      : defaults.capitalization,
    number: toBoolean(input.number, defaults.number),
  };
}

/**
 * Generates a passphrase. Turkish words are capitalized with Turkish rules
 * (i becomes İ, ı becomes I).
 * @param {Partial<PassphraseOptions>} [options] Merged over the defaults.
 * @param {import('./random.js').RandomSource} [source]
 * @returns {string}
 * @throws {RangeError} When an option is out of range.
 */
export function generatePassphrase(options = {}, source = cryptoSource()) {
  const opts = { ...DEFAULT_PASSPHRASE_OPTIONS, ...options };
  assertValid(opts);
  const locale = LOCALES[opts.language];
  const list = WORD_LISTS[opts.language];
  const words = Array.from({ length: opts.words }, () =>
    styleWord(pick(source, list), opts.capitalization, locale, source),
  );
  if (opts.number) {
    words[randomInt(source, words.length)] += String(randomInt(source, 10));
  }
  return words.join(opts.separator);
}

/**
 * Entropy of the passphrase settings: words * log2(list size), plus one bit
 * per word for random capitalization and log2(10 * words) for the digit
 * (which digit, on which word). With an empty separator two different word
 * sequences can, rarely, spell the same text (sunflower or sun + flower).
 * For the built-in lists that costs well under 0.01 bits, below the precision
 * shown, so it is left out (test/passphrase.test.js measures it).
 * @param {Partial<PassphraseOptions>} [options] Merged over the defaults.
 * @returns {{ bits: number, listSize: number, words: number }}
 */
export function passphraseEntropy(options = {}) {
  const opts = { ...DEFAULT_PASSPHRASE_OPTIONS, ...options };
  assertValid(opts);
  const listSize = WORD_LISTS[opts.language].length;
  let bits = opts.words * Math.log2(listSize);
  if (opts.capitalization === 'random') bits += opts.words;
  if (opts.number) bits += Math.log2(10 * opts.words);
  return { bits, listSize, words: opts.words };
}

function isLanguage(value) {
  return typeof value === 'string' && Object.hasOwn(WORD_LISTS, value);
}

function assertValid(opts) {
  if (!Number.isInteger(opts.words) || opts.words < MIN_WORDS || opts.words > MAX_WORDS) {
    throw new RangeError(`passphrase: words must be ${MIN_WORDS}-${MAX_WORDS}`);
  }
  if (!isLanguage(opts.language)) throw new RangeError('passphrase: unknown language');
  if (!CAPITALIZATIONS.includes(opts.capitalization)) {
    throw new RangeError('passphrase: unknown capitalization');
  }
  if (typeof opts.separator !== 'string') throw new RangeError('passphrase: separator must be a string');
}

function styleWord(word, capitalization, locale, source) {
  switch (capitalization) {
    case 'capitalize':
      return capitalize(word, locale);
    case 'upper':
      return word.toLocaleUpperCase(locale);
    case 'random':
      return randomInt(source, 2) === 1 ? capitalize(word, locale) : word;
    default:
      return word;
  }
}

function capitalize(word, locale) {
  return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
}
