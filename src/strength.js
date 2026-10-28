/**
 * Strength estimator for passwords people type themselves.
 *
 * It looks for the parts an attacker tries first (common passwords, words
 * and names, keyboard runs, sequences, repeats, dates), prices every part in
 * guesses, and finds the cheapest way to cover the whole password; parts no
 * pattern explains are priced as brute force over the character classes
 * used. Everything runs locally: the password never leaves the page.
 */

import { COMMON_PASSWORDS } from './common-passwords.js';
import { COMMON_WORDS } from './common-words.js';
import { crackTimes, strengthFromBits } from './entropy.js';
import { EN_WORDS } from './words-en.js';
import { TR_WORDS } from './words-tr.js';

/** Longer input is cut to this many characters before it is analysed. */
export const MAX_ANALYZED_LENGTH = 256;

/** Every feedback key the estimator can return, in display order. */
export const FEEDBACK_KEYS = Object.freeze([
  'feedback.empty',
  'feedback.common',
  'feedback.word',
  'feedback.keyboard',
  'feedback.sequence',
  'feedback.repeat',
  'feedback.date',
  'feedback.leet',
  'feedback.reversed',
  'feedback.capitalization',
  'feedback.short',
  'feedback.oneClass',
  'feedback.longer',
  'feedback.useGenerator',
  'feedback.strong',
]);

const MIN_MATCH_LENGTH = 3;
const MAX_SEGMENTS = 32;
const MAX_SEQUENCE_STEP = 5;
const MIN_YEAR = 1000;
const MAX_YEAR = 2099;
const MIN_YEAR_SPACE = 20;
const DAYS_PER_YEAR = 365;
const KEYBOARD_KEYS = 47;
const SHORT_LENGTH = 12;
const CLASS_SIZES = Object.freeze({ lower: 26, upper: 26, digit: 10, symbol: 33, other: 32 });

/** US and Turkish Q rows (lowercase, unshifted and shifted number rows). */
const KEYBOARD_ROWS = [
  '1234567890-=',
  '!@#$%^&*()_+',
  'qwertyuiop[]',
  "asdfghjkl;'",
  'zxcvbnm,./',
  '1234567890*-',
  "!'^+%&/()=?_",
  'qwertyuıopğü',
  'asdfghjklşi,',
  'zxcvbnmöç.',
];

const KEYBOARD_LINES = KEYBOARD_ROWS.flatMap((row) => [
  { keys: Array.from(row), reversed: false },
  { keys: Array.from(row).reverse(), reversed: true },
]);

/** Common symbol-for-letter swaps; "1" and "|" can stand for i or l. */
const LEET = Object.freeze({
  4: ['a'],
  '@': ['a'],
  8: ['b'],
  3: ['e'],
  6: ['g'],
  9: ['g'],
  1: ['i', 'l'],
  '!': ['i'],
  '|': ['i', 'l'],
  0: ['o'],
  $: ['s'],
  5: ['s'],
  7: ['t'],
  '+': ['t'],
  2: ['z'],
});

/** Turkish letters folded to ASCII, so "Şifre" and "sifre" match alike. */
const FOLD = Object.freeze({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' });

let dictionaryCache = null;

/**
 * @typedef {Object} StrengthResult
 * @property {number} score 0 (very weak) to 4 (very strong).
 * @property {string} label i18n key of the score.
 * @property {number} bits log2 of the estimated number of guesses.
 * @property {number} length Number of characters analysed.
 * @property {string[]} feedback i18n keys, most important first.
 * @property {ReturnType<typeof crackTimes>} crackTimes
 */

/**
 * Estimates how hard a typed password is to guess.
 * @param {string} password
 * @param {{ referenceYear?: number }} [options] Year that dates are compared
 *   with (defaults to the current year).
 * @returns {StrengthResult}
 */
export function estimateStrength(password, { referenceYear = new Date().getFullYear() } = {}) {
  const chars = Array.from(String(password ?? '')).slice(0, MAX_ANALYZED_LENGTH);
  if (chars.length === 0) return describe(chars, 0, ['feedback.empty']);
  const { bits, matches } = analyze(chars, { referenceYear, memo: new Map() });
  const { score } = strengthFromBits(bits);
  return describe(chars, bits, feedbackFor(chars, matches, score));
}

function describe(chars, bits, feedback) {
  const { score, label } = strengthFromBits(bits);
  return { score, label, bits, length: chars.length, feedback, crackTimes: crackTimes(bits) };
}

function analyze(chars, context) {
  const lower = chars.map(lowerChar);
  const folded = lower.map(foldChar);
  const matches = [
    ...dictionaryMatches(chars, folded),
    ...sequenceMatches(chars),
    ...repeatMatches(chars, context),
    ...keyboardMatches(chars, lower),
    ...dateMatches(chars, context.referenceYear),
  ];
  return cheapestCover(chars.length, matches, Math.log2(bruteForcePool(chars)));
}

// ---- dictionary: common passwords, common words and names, passphrase lists ----

function dictionary() {
  if (dictionaryCache) return dictionaryCache;
  const entries = new Map();
  const add = (word, guesses, common) => {
    const key = Array.from(word, (char) => foldChar(lowerChar(char))).join('');
    const known = entries.get(key);
    if (!known || guesses < known.guesses) entries.set(key, { guesses, common });
  };
  EN_WORDS.forEach((word) => add(word, EN_WORDS.length, false));
  TR_WORDS.forEach((word) => add(word, TR_WORDS.length, false));
  COMMON_WORDS.forEach((word) => add(word, COMMON_WORDS.length, false));
  COMMON_PASSWORDS.forEach((word, index) => add(word, index + 1, true));
  const maxLength = Math.max(...Array.from(entries.keys(), (key) => Array.from(key).length));
  dictionaryCache = { entries, maxLength };
  return dictionaryCache;
}

function dictionaryMatches(chars, folded) {
  const { entries, maxLength } = dictionary();
  const matches = [];
  for (let i = 0; i < folded.length; i += 1) {
    const end = Math.min(folded.length, i + maxLength);
    for (let j = i + MIN_MATCH_LENGTH; j <= end; j += 1) {
      for (const variant of variantsOf(folded.slice(i, j))) {
        const entry = entries.get(variant.word);
        if (entry) matches.push(dictionaryMatch(chars.slice(i, j), i, j, entry, variant));
      }
    }
  }
  return matches;
}

function variantsOf(token) {
  const word = token.join('');
  const variants = [{ word, leet: 0, reversed: false }];
  const reversed = [...token].reverse().join('');
  if (reversed !== word) variants.push({ word: reversed, leet: 0, reversed: true });
  for (const choice of [0, 1]) {
    const { text, swaps } = unleet(token, choice);
    if (swaps > 0 && !variants.some((variant) => variant.word === text)) {
      variants.push({ word: text, leet: swaps, reversed: false });
    }
  }
  return variants;
}

function unleet(token, choice) {
  const swapped = new Set();
  const text = token
    .map((char) => {
      const letters = LEET[char];
      if (!letters) return char;
      swapped.add(char);
      return letters[choice] ?? letters[0];
    })
    .join('');
  return { text, swaps: swapped.size };
}

function dictionaryMatch(token, i, j, entry, variant) {
  const caseVariations = capitalizationVariations(token);
  let guesses = entry.guesses * caseVariations * 2 ** variant.leet;
  if (variant.reversed) guesses *= 2;
  return {
    type: 'dictionary',
    i,
    j,
    bits: Math.log2(guesses),
    common: entry.common,
    leet: variant.leet > 0,
    reversed: variant.reversed,
    capitalized: caseVariations === 2,
  };
}

function capitalizationVariations(token) {
  const upper = token.filter(isUpper).length;
  const lower = token.filter(isLower).length;
  if (upper === 0) return 1;
  if (lower === 0) return 2;
  if (upper === 1 && (isUpper(token[0]) || isUpper(token.at(-1)))) return 2;
  let variations = 0;
  for (let k = 1; k <= Math.min(upper, lower); k += 1) variations += binomial(upper + lower, k);
  return variations;
}

// ---- sequences: abc, 1234, zyx, 13579 ----

function sequenceMatches(chars) {
  const matches = [];
  const codes = chars.map((char) => char.codePointAt(0));
  let i = 0;
  while (i < chars.length - 2) {
    const step = codes[i + 1] - codes[i];
    let j = i + 1;
    if (isSequenceStep(chars, codes, i, step)) {
      while (j + 1 < chars.length && isSequenceStep(chars, codes, j, step)) j += 1;
    }
    if (j - i >= 2) {
      matches.push(sequenceMatch(chars, i, j + 1, step));
      i = j;
    } else {
      i += 1;
    }
  }
  return matches;
}

function isSequenceStep(chars, codes, i, step) {
  const kind = sequenceClass(chars[i]);
  return (
    codes[i + 1] - codes[i] === step &&
    step !== 0 &&
    Math.abs(step) <= MAX_SEQUENCE_STEP &&
    kind !== null &&
    kind === sequenceClass(chars[i + 1])
  );
}

function sequenceClass(char) {
  if (char >= 'a' && char <= 'z') return 'lower';
  if (char >= 'A' && char <= 'Z') return 'upper';
  if (char >= '0' && char <= '9') return 'digit';
  return null;
}

function sequenceMatch(chars, i, j, step) {
  const first = chars[i];
  let base = 26;
  if ('aAzZ019'.includes(first)) base = 4;
  else if (sequenceClass(first) === 'digit') base = 10;
  const guesses = base * (j - i) * (step < 0 ? 2 : 1);
  return { type: 'sequence', i, j, bits: Math.log2(guesses) };
}

// ---- repeats: aaa, 1111, abcabc ----

function repeatMatches(chars, context) {
  const matches = [];
  for (let i = 0; i < chars.length; i += 1) {
    for (let size = 1; i + 2 * size <= chars.length; size += 1) {
      let count = 1;
      while (i + (count + 1) * size <= chars.length && sameBlock(chars, i, i + count * size, size)) {
        count += 1;
      }
      if (count < 2 || (size === 1 && count < 3)) continue;
      const unit = chars.slice(i, i + size);
      if (!isPrimitive(unit)) continue;
      const bits = unitBits(unit, context) + Math.log2(count);
      matches.push({ type: 'repeat', i, j: i + count * size, bits });
    }
  }
  return matches;
}

function sameBlock(chars, a, b, size) {
  for (let k = 0; k < size; k += 1) {
    if (chars[a + k] !== chars[b + k]) return false;
  }
  return true;
}

function isPrimitive(unit) {
  const text = unit.join('');
  return (text + text).indexOf(text, 1) === text.length;
}

function unitBits(unit, context) {
  if (unit.length === 1) return Math.log2(bruteForcePool(unit));
  const key = unit.join('');
  if (!context.memo.has(key)) context.memo.set(key, analyze(unit, context).bits);
  return context.memo.get(key);
}

// ---- keyboard rows: qwerty, asdf, poiuy ----

function keyboardMatches(chars, lower) {
  const matches = [];
  for (const line of KEYBOARD_LINES) {
    for (let i = 0; i < lower.length; i += 1) {
      const start = line.keys.indexOf(lower[i]);
      if (start < 0) continue;
      let j = i + 1;
      while (j < lower.length && line.keys[start + (j - i)] === lower[j]) j += 1;
      if (j - i >= MIN_MATCH_LENGTH) matches.push(keyboardMatch(chars, i, j, line.reversed));
    }
  }
  return matches;
}

function keyboardMatch(chars, i, j, reversed) {
  const shifted = chars.slice(i, j).some(isUpper);
  const guesses = KEYBOARD_KEYS * (j - i) * (reversed ? 2 : 1) * (shifted ? 2 : 1);
  return { type: 'keyboard', i, j, bits: Math.log2(guesses) };
}

// ---- dates and years: 1923, 19051919, 19.05.1919, 2024-03-15 ----

function dateMatches(chars, referenceYear) {
  const matches = [];
  for (let i = 0; i < chars.length; i += 1) {
    for (let j = i + 4; j <= Math.min(chars.length, i + 10); j += 1) {
      const guesses = dateGuesses(chars.slice(i, j).join(''), referenceYear);
      if (guesses > 0) matches.push({ type: 'date', i, j, bits: Math.log2(guesses) });
    }
  }
  return matches;
}

function dateGuesses(token, referenceYear) {
  if (/^\d{4}$/.test(token)) return yearSpace(Number(token), referenceYear);
  if (/^(\d{6}|\d{8})$/.test(token)) return cheapestDate(digitDates(token), referenceYear, 1);
  const parts = /^(\d{1,4})([\s/\\._-])(\d{1,2})\2(\d{1,4})$/.exec(token);
  if (parts) return cheapestDate(separatedDates(parts[1], parts[3], parts[4]), referenceYear, 4);
  return 0;
}

function digitDates(token) {
  const year = token.length === 8 ? token.slice(4) : token.slice(4, 6);
  const leadingYear = token.length === 8 ? token.slice(0, 4) : token.slice(0, 2);
  const tail = token.slice(leadingYear.length);
  return [
    { day: token.slice(0, 2), month: token.slice(2, 4), year },
    { month: token.slice(0, 2), day: token.slice(2, 4), year },
    { year: leadingYear, month: tail.slice(0, 2), day: tail.slice(2, 4) },
  ];
}

function separatedDates(first, middle, last) {
  if (first.length === 4) return [{ year: first, month: middle, day: last }];
  if (first.length > 2 || (last.length !== 2 && last.length !== 4)) return [];
  return [
    { day: first, month: middle, year: last },
    { month: first, day: middle, year: last },
  ];
}

function cheapestDate(candidates, referenceYear, factor) {
  let best = 0;
  for (const candidate of candidates) {
    const day = Number(candidate.day);
    const month = Number(candidate.month);
    const space = yearSpace(fullYear(candidate.year), referenceYear);
    if (day < 1 || day > 31 || month < 1 || month > 12 || space === 0) continue;
    const guesses = space * DAYS_PER_YEAR * factor;
    if (best === 0 || guesses < best) best = guesses;
  }
  return best;
}

function fullYear(text) {
  const year = Number(text);
  if (text.length !== 2) return year;
  return year > 50 ? 1900 + year : 2000 + year;
}

function yearSpace(year, referenceYear) {
  if (year < MIN_YEAR || year > MAX_YEAR) return 0;
  return Math.max(Math.abs(year - referenceYear), MIN_YEAR_SPACE);
}

// ---- cheapest cover: dynamic programming over positions ----

/**
 * Finds the segmentation with the fewest total guesses: the product of the
 * parts' guesses times segments! (the attacker must also guess the order of
 * the pattern kinds). Unmatched characters form brute-force runs.
 */
function cheapestCover(length, matches, bruteBits) {
  const maxSegments = Math.min(length, MAX_SEGMENTS);
  const width = maxSegments + 1;
  const states = (length + 1) * width * 2;
  const cost = new Float64Array(states).fill(Infinity);
  const from = new Int32Array(states).fill(-1);
  const via = new Array(states).fill(null);
  const index = (position, segments, brute) => (position * width + segments) * 2 + brute;
  const relax = (target, value, source, match) => {
    if (value < cost[target]) {
      cost[target] = value;
      from[target] = source;
      via[target] = match;
    }
  };
  const byStart = Array.from({ length }, () => []);
  matches.forEach((match) => byStart[match.i].push(match));

  cost[index(0, 0, 0)] = 0;
  for (let position = 0; position < length; position += 1) {
    for (let segments = 0; segments <= maxSegments; segments += 1) {
      for (let brute = 0; brute <= 1; brute += 1) {
        const state = index(position, segments, brute);
        const value = cost[state];
        if (value === Infinity) continue;
        if (brute === 1) relax(index(position + 1, segments, 1), value + bruteBits, state, null);
        if (segments === maxSegments) continue;
        relax(index(position + 1, segments + 1, 1), value + bruteBits, state, null);
        for (const match of byStart[position]) {
          relax(index(match.j, segments + 1, 0), value + match.bits, state, match);
        }
      }
    }
  }
  return bestCover(length, maxSegments, index, cost, from, via);
}

function bestCover(length, maxSegments, index, cost, from, via) {
  let bits = Infinity;
  let state = -1;
  for (let segments = 1; segments <= maxSegments; segments += 1) {
    for (let brute = 0; brute <= 1; brute += 1) {
      const candidate = index(length, segments, brute);
      const total = cost[candidate] + log2Factorial(segments);
      if (total < bits) {
        bits = total;
        state = candidate;
      }
    }
  }
  const chosen = [];
  for (; state >= 0; state = from[state]) {
    if (via[state]) chosen.push(via[state]);
  }
  return { bits, matches: chosen.reverse() };
}

// ---- feedback ----

/** Never empty: score 4 gets praise, 3 a nudge to go longer, 0-2 the generator tip. */
function feedbackFor(chars, matches, score) {
  if (score >= 4) return ['feedback.strong'];
  const keys = new Set();
  for (const match of matches) {
    if (match.type !== 'dictionary') {
      keys.add(`feedback.${match.type}`);
      continue;
    }
    const whole = match.common && match.i === 0 && match.j === chars.length;
    keys.add(whole ? 'feedback.common' : 'feedback.word');
    if (match.leet) keys.add('feedback.leet');
    if (match.reversed) keys.add('feedback.reversed');
    if (match.capitalized) keys.add('feedback.capitalization');
  }
  if (chars.length < SHORT_LENGTH) keys.add('feedback.short');
  if (characterClasses(chars).size < 2) keys.add('feedback.oneClass');
  // A short password already has the length hint; a second "add more" line says the same.
  if (score === 3 && !keys.has('feedback.short')) keys.add('feedback.longer');
  if (score <= 2) keys.add('feedback.useGenerator');
  return FEEDBACK_KEYS.filter((key) => keys.has(key));
}

// ---- small helpers ----

function characterClasses(chars) {
  const classes = new Set();
  for (const char of chars) {
    if (char >= 'a' && char <= 'z') classes.add('lower');
    else if (char >= 'A' && char <= 'Z') classes.add('upper');
    else if (char >= '0' && char <= '9') classes.add('digit');
    else if (char >= ' ' && char <= '~') classes.add('symbol');
    else classes.add('other');
  }
  return classes;
}

function bruteForcePool(chars) {
  let pool = 0;
  for (const kind of characterClasses(chars)) pool += CLASS_SIZES[kind];
  return pool;
}

function lowerChar(char) {
  return Array.from(char.toLowerCase())[0];
}

function foldChar(char) {
  return FOLD[char] ?? char;
}

function isUpper(char) {
  return char !== char.toLowerCase();
}

function isLower(char) {
  return char !== char.toUpperCase();
}

function binomial(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i;
  return result;
}

function log2Factorial(n) {
  let sum = 0;
  for (let i = 2; i <= n; i += 1) sum += Math.log2(i);
  return sum;
}
