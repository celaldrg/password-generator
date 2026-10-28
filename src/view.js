/**
 * DOM rendering helpers. Nodes are built with textContent only (never
 * innerHTML), so a generated or typed value can never turn into markup.
 */

import { charKinds, feedbackTone, meterPercent, timeTone, valueSize } from './display.js';
import { formatDuration } from './i18n.js';

const STAGGER_MS = 12;
const MAX_STAGGER_MS = 240;

/**
 * Creates an element with an optional class name and text.
 * @param {string} tag
 * @param {string} [className]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

/**
 * Shows a generated value with digits and symbols in their own colours.
 * With `animate`, the characters fade in one after another.
 * @param {HTMLElement} container
 * @param {string} value
 * @param {boolean} animate
 */
export function renderValue(container, value, animate) {
  const spans = charKinds(value).map(({ char, kind }, index) => {
    const span = createElement('span', `ch ch-${kind}`, char);
    if (animate) span.style.animationDelay = `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms`;
    return span;
  });
  container.dataset.size = valueSize(spans.length);
  container.classList.toggle('is-animated', animate);
  container.replaceChildren(...spans);
}

/**
 * Sets a strength meter: its fill (through the --fill custom property)
 * and the value a screen reader announces.
 * @param {HTMLElement} meter Element with role="meter".
 * @param {number} bits
 * @param {string} label Translated strength label.
 */
export function renderMeter(meter, bits, label) {
  const percent = meterPercent(bits);
  meter.style.setProperty('--fill', `${percent}%`);
  meter.setAttribute('aria-valuenow', String(percent));
  meter.setAttribute('aria-valuetext', label);
}

/**
 * Lists crack times, one row per attack scenario, optionally with the note
 * that explains the guessing speed.
 * @param {HTMLElement} list
 * @param {{ id: string, seconds: number, duration: { unit: string, count: number } }[]} times
 * @param {{ lang: string, t: (key: string) => string, notes: boolean }} options
 */
export function renderCrackList(list, times, { lang, t, notes }) {
  const rows = times.map(({ id, seconds, duration }) => {
    const row = createElement('li', 'crack-row');
    const main = createElement('div', 'crack-main');
    main.append(
      createElement('span', 'crack-name', t(`rate.${id}`)),
      createElement('span', `crack-time time-${timeTone(seconds)}`, formatDuration(lang, duration)),
    );
    row.append(main);
    if (notes) row.append(createElement('p', 'crack-note', t(`rate.${id}.note`)));
    return row;
  });
  list.replaceChildren(...rows);
}

/**
 * Lists strength feedback, each item marked with its tone.
 * @param {HTMLElement} list
 * @param {string[]} keys Feedback i18n keys.
 * @param {(key: string) => string} t
 */
export function renderFeedback(list, keys, t) {
  list.replaceChildren(...keys.map((key) => createElement('li', `feedback-item fb-${feedbackTone(key)}`, t(key))));
}

/**
 * Lists the recent values, newest first, each with a copy button that
 * carries its index in data-index.
 * @param {HTMLElement} list
 * @param {string[]} values
 * @param {{ t: (key: string, vars?: object) => string, icon: HTMLTemplateElement }} options
 */
export function renderHistory(list, values, { t, icon }) {
  const items = values.map((value, index) => {
    const item = createElement('li', 'history-item');
    const button = createElement('button', 'icon-btn');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', t('history.copy', { n: index + 1 }));
    button.append(icon.content.firstElementChild.cloneNode(true));
    item.append(createElement('span', 'history-value', value), button);
    return item;
  });
  list.replaceChildren(...items);
}
