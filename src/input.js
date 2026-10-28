/**
 * Turns keyboard and touch input into app actions. Plain functions over
 * plain values, so they work without a DOM and can be tested in Node.
 */

/** Single-key shortcuts that work anywhere outside text fields. */
export const SHORTCUTS = Object.freeze({
  r: 'regenerate',
  c: 'copy',
  1: 'password',
  2: 'passphrase',
});

/** Sideways travel, in CSS pixels, that counts as a swipe. */
export const SWIPE_DISTANCE = 48;

const TYPING_INPUTS = new Set(['text', 'password', 'number', 'search', 'email', 'url', 'tel']);

/**
 * Returns the action of a key press, or null. Presses with Ctrl, Cmd or
 * Alt, auto-repeats and presses while typing in a field are ignored, so
 * typing and the usual copy and paste keys keep working.
 * @param {{ key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean,
 *   repeat?: boolean, typing?: boolean }} press
 * @returns {'regenerate'|'copy'|'password'|'passphrase'|null}
 */
export function shortcutAction({ key, ctrlKey, metaKey, altKey, repeat, typing }) {
  if (ctrlKey || metaKey || altKey || repeat || typing || typeof key !== 'string') return null;
  const name = key.toLowerCase();
  return Object.hasOwn(SHORTCUTS, name) ? SHORTCUTS[name] : null;
}

/**
 * Whether a key press lands in something the user types into: a text-like
 * input, a textarea, a select or an editable element.
 * @param {{ tagName?: string, type?: string, isContentEditable?: boolean } | null} target
 * @returns {boolean}
 */
export function isTypingTarget(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = String(target.tagName ?? '').toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return tag === 'INPUT' && TYPING_INPUTS.has(String(target.type ?? 'text').toLowerCase());
}

/**
 * Whether a pointer movement is a sideways swipe: long enough and clearly
 * more horizontal than vertical, so scrolling the page never counts.
 * @param {number} dx Horizontal travel in CSS pixels.
 * @param {number} dy Vertical travel in CSS pixels.
 * @returns {boolean}
 */
export function isSwipe(dx, dy) {
  return Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > 2 * Math.abs(dy);
}

/**
 * The tab to select after a key press in a horizontal tab list: arrows
 * move and wrap around, Home and End jump to the ends. Other keys give null.
 * @param {readonly string[]} tabs
 * @param {string} current
 * @param {string} key
 * @returns {string|null}
 */
export function tabAfterKey(tabs, current, key) {
  const index = Math.max(0, tabs.indexOf(current));
  switch (key) {
    case 'ArrowRight':
      return tabs[(index + 1) % tabs.length];
    case 'ArrowLeft':
      return tabs[(index - 1 + tabs.length) % tabs.length];
    case 'Home':
      return tabs[0];
    case 'End':
      return tabs[tabs.length - 1];
    default:
      return null;
  }
}
