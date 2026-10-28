/**
 * Coercion helpers for options that come from the UI or from storage,
 * where any value can be missing, mistyped or out of range.
 */

/**
 * Returns the value when it is a plain object, otherwise an empty object.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
export function asRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

/**
 * Converts a number or numeric string to a rounded integer.
 * @param {unknown} value
 * @param {number} fallback Returned when the value is not a finite number.
 * @returns {number}
 */
export function toInteger(value, fallback) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? Math.round(number) : fallback;
}

/**
 * Returns the value when it is a boolean, otherwise the fallback.
 * @param {unknown} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
export function toBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Limits a number to [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Returns a string cut to at most `max` code points, or the fallback when
 * the value is not a string.
 * @param {unknown} value
 * @param {number} max
 * @param {string} fallback
 * @returns {string}
 */
export function toShortString(value, max, fallback) {
  return typeof value === 'string' ? Array.from(value).slice(0, max).join('') : fallback;
}
