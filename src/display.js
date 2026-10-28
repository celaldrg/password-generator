/**
 * Display decisions that do not need the DOM: how to colour characters,
 * how full the meter is and which tone a crack time or a feedback key gets.
 */

import { STRENGTH_THRESHOLDS } from './entropy.js';

/** Bits at which the strength meter is full. */
export const METER_FULL_BITS = 128;

const METER_EDGES = Object.freeze([0, ...STRENGTH_THRESHOLDS, METER_FULL_BITS]);
const DAY = 24 * 60 * 60;
const CENTURY = 100 * 365.2425 * DAY;
const SIZE_LIMITS = Object.freeze([
  ['xl', 24],
  ['lg', 40],
  ['md', 64],
]);

/**
 * Splits text into characters (code points) tagged as letter, digit or
 * symbol, so the UI can colour digits and symbols.
 * @param {string} text
 * @returns {{ char: string, kind: 'letter'|'digit'|'symbol' }[]}
 */
export function charKinds(text) {
  return Array.from(String(text), (char) => ({ char, kind: kindOf(char) }));
}

/**
 * Fill of the strength meter in percent. Each score owns a fifth of the bar,
 * so the fill always agrees with the label: 28 bits is 20 %, 80 bits is 80 %
 * and METER_FULL_BITS or more is 100 %.
 * @param {number} bits
 * @returns {number} 0 to 100, rounded to one decimal.
 */
export function meterPercent(bits) {
  if (!(bits > 0)) return 0;
  if (bits >= METER_FULL_BITS) return 100;
  const band = METER_EDGES.findIndex((edge, i) => bits < METER_EDGES[i + 1]);
  const share = (bits - METER_EDGES[band]) / (METER_EDGES[band + 1] - METER_EDGES[band]);
  const percent = ((band + share) * 100) / (METER_EDGES.length - 1);
  return Math.round(percent * 10) / 10;
}

/**
 * Tone of a crack time: under a day is bad, under a century is fair,
 * anything longer is good.
 * @param {number} seconds
 * @returns {'bad'|'fair'|'good'}
 */
export function timeTone(seconds) {
  if (!(seconds >= DAY)) return 'bad';
  return seconds < CENTURY ? 'fair' : 'good';
}

/**
 * Tone of a strength feedback key: praise, a tip, a neutral hint or a warning.
 * @param {string} key
 * @returns {'good'|'tip'|'info'|'warn'}
 */
export function feedbackTone(key) {
  if (key === 'feedback.strong') return 'good';
  if (key === 'feedback.useGenerator' || key === 'feedback.longer') return 'tip';
  if (key === 'feedback.empty') return 'info';
  return 'warn';
}

/**
 * Text size for a generated value: the longer it is, the smaller it is
 * drawn, so long values do not fill the screen.
 * @param {number} length Number of characters.
 * @returns {'xl'|'lg'|'md'|'sm'}
 */
export function valueSize(length) {
  const fit = SIZE_LIMITS.find(([, limit]) => length <= limit);
  return fit ? fit[0] : 'sm';
}

function kindOf(char) {
  if (/\p{L}/u.test(char)) return 'letter';
  if (/\p{Nd}/u.test(char)) return 'digit';
  return 'symbol';
}
