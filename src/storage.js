/**
 * Tiny localStorage wrapper. Every access is wrapped in try/catch because
 * storage can be missing or throw (private mode, blocked site data, full
 * quota); the app then simply forgets preferences instead of crashing.
 * Keys are prefixed because all github.io pages of an account share storage.
 * Generated or checked passwords are never stored.
 */

const PREFIX = 'password-generator:';

/**
 * Reads a JSON value.
 * @template T
 * @param {string} key
 * @param {T} fallback Returned when nothing is stored or reading fails.
 * @param {Storage | null} [store] Defaults to window.localStorage.
 * @returns {T}
 */
export function load(key, fallback, store = defaultStore()) {
  try {
    const raw = store?.getItem(PREFIX + key);
    return raw === null || raw === undefined ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Writes a JSON value.
 * @param {string} key
 * @param {unknown} value
 * @param {Storage | null} [store] Defaults to window.localStorage.
 * @returns {boolean} Whether the value was saved.
 */
export function save(key, value, store = defaultStore()) {
  try {
    if (!store) return false;
    store.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function defaultStore() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
