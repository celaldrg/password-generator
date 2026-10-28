/**
 * Entry point: connects the page to the app state, the strength checker,
 * the clipboard, storage and the language toggle. Decisions live in the
 * pure modules; this file reads the DOM, calls them and writes the result.
 */

import { MODES, createApp, createDemo } from './app.js';
import { copyText } from './clipboard.js';
import { DEFAULT_LANGUAGE, LANGUAGES, formatNumber, normalizeLanguage, translate } from './i18n.js';
import { isSwipe, isTypingTarget, shortcutAction, tabAfterKey } from './input.js';
import { load, save } from './storage.js';
import { estimateStrength } from './strength.js';
import { renderCrackList, renderFeedback, renderHistory, renderMeter, renderValue } from './view.js';

const FEEDBACK_MS = 1600;
/** Quiet time after a slider step before the shown value counts as settled. */
const COMMIT_DELAY_MS = 500;
const LANGUAGE_KEY = 'lang';
const SETTINGS_KEY = 'settings';
const TRANSLATED_ATTRIBUTES = ['aria-label', 'placeholder', 'title'];

const ui = findElements();
const isDemo = new URLSearchParams(window.location.search).has('demo');
let lang = normalizeLanguage(load(LANGUAGE_KEY, DEFAULT_LANGUAGE));
let app = null;
let demoValue = null;
let shownValue = '';
let swipe = null;
let copyTimer = 0;
let toastTimer = 0;
let commitTimer = 0;
let checkFrame = 0;
/** i18n key of the toast on screen ('' once it is gone), so a language switch can translate it. */
let toastKey = '';
let copyDone = false;

const SHORTCUT_HANDLERS = {
  regenerate,
  copy: copyCurrent,
  password: () => selectMode('password'),
  passphrase: () => selectMode('passphrase'),
};

start();

function start() {
  if (isDemo) {
    const demo = createDemo();
    app = demo.app;
    demoValue = app.getState().value;
    ui.check.value = demo.checkText;
    ui.check.type = 'text';
  } else {
    app = createApp({ settings: load(SETTINGS_KEY, undefined) });
  }
  bindGenerator();
  bindOptions();
  bindPage();
  applyLanguage(true);
}

function t(key, vars) {
  return translate(lang, key, vars);
}

function findElements() {
  const byId = (id) => document.getElementById(id);
  return {
    tabList: byId('tabs'),
    tabs: Array.from(document.querySelectorAll('[role="tab"]')),
    panels: { password: byId('panel-password'), passphrase: byId('panel-passphrase') },
    outputCard: byId('generator'),
    outputLabel: byId('output-label'),
    value: byId('value'),
    valueError: byId('value-error'),
    demoBadge: byId('demo-badge'),
    pill: byId('pill'),
    pillLabel: byId('pill-label'),
    pillBits: byId('pill-bits'),
    regenerate: byId('regenerate'),
    copy: byId('copy'),
    copyLabel: byId('copy-label'),
    lengthRange: byId('length-range'),
    lengthNumber: byId('length-number'),
    sets: Array.from(document.querySelectorAll('input[data-set]')),
    lookAlikes: byId('look-alikes'),
    custom: byId('custom'),
    wordsRange: byId('words-range'),
    wordsNumber: byId('words-number'),
    wordList: byId('word-list'),
    separator: byId('separator'),
    capitalization: byId('capitalization'),
    addNumber: byId('add-number'),
    meterCard: byId('meter-card'),
    meterLabel: byId('meter-label'),
    meter: byId('meter'),
    bits: byId('bits'),
    entropySource: byId('entropy-source'),
    crackList: byId('crack-list'),
    checkForm: byId('check-form'),
    check: byId('check'),
    checkToggle: byId('check-toggle'),
    checkEmpty: byId('check-empty'),
    checkResult: byId('check-result'),
    checkLabel: byId('check-label'),
    checkBits: byId('check-bits'),
    checkMeter: byId('check-meter'),
    feedback: byId('feedback'),
    checkCrack: byId('check-crack'),
    historyList: byId('history-list'),
    historyEmpty: byId('history-empty'),
    clearHistory: byId('clear-history'),
    reset: byId('reset'),
    language: byId('language'),
    status: byId('status'),
    toast: byId('toast'),
    copyIcon: byId('copy-icon'),
  };
}

// ---- events ----

function bindGenerator() {
  ui.tabList.addEventListener('click', onTabClick);
  ui.tabList.addEventListener('keydown', onTabKey);
  ui.regenerate.addEventListener('click', regenerate);
  ui.copy.addEventListener('click', copyCurrent);
  ui.value.addEventListener('pointerdown', onPointerDown);
  ui.value.addEventListener('pointerup', onPointerUp);
  ui.value.addEventListener('pointercancel', () => {
    swipe = null;
  });
}

/**
 * Sliders and text fields only preview while they move or are typed in; the
 * history gets the value they settle on (on release, a short pause after a
 * key step, leaving the field or copying).
 */
function bindOptions() {
  ui.lengthRange.addEventListener('input', () => setPassword({ length: Number(ui.lengthRange.value) }, true));
  ui.lengthRange.addEventListener('change', scheduleCommit);
  ui.lengthNumber.addEventListener('change', () => commitNumber(ui.lengthNumber, (length) => setPassword({ length })));
  for (const box of ui.sets) box.addEventListener('change', () => setPassword({ [box.dataset.set]: box.checked }));
  ui.lookAlikes.addEventListener('change', () => setPassword({ excludeLookAlikes: ui.lookAlikes.checked }));
  ui.custom.addEventListener('input', () => setPassword({ custom: ui.custom.value }, true));
  ui.custom.addEventListener('change', commitPreview);
  ui.wordsRange.addEventListener('input', () => setPassphrase({ words: Number(ui.wordsRange.value) }, true));
  ui.wordsRange.addEventListener('change', scheduleCommit);
  ui.wordsNumber.addEventListener('change', () => commitNumber(ui.wordsNumber, (words) => setPassphrase({ words })));
  ui.wordList.addEventListener('change', () => setPassphrase({ language: ui.wordList.value }));
  ui.separator.addEventListener('input', () => setPassphrase({ separator: ui.separator.value }, true));
  ui.separator.addEventListener('change', commitPreview);
  ui.capitalization.addEventListener('change', () => setPassphrase({ capitalization: ui.capitalization.value }));
  ui.addNumber.addEventListener('change', () => setPassphrase({ number: ui.addNumber.checked }));
}

function bindPage() {
  ui.checkForm.addEventListener('submit', (event) => event.preventDefault());
  ui.check.addEventListener('input', scheduleChecker);
  ui.checkToggle.addEventListener('click', toggleCheckVisibility);
  ui.historyList.addEventListener('click', onHistoryClick);
  ui.clearHistory.addEventListener('click', () => show(app.clearHistory(), false));
  ui.reset.addEventListener('click', resetAll);
  ui.language.addEventListener('click', toggleLanguage);
  document.addEventListener('keydown', onShortcut);
}

function onTabClick(event) {
  const tab = event.target.closest('[role="tab"]');
  if (tab) selectMode(tab.dataset.mode);
}

function onTabKey(event) {
  const next = tabAfterKey(MODES, app.getState().mode, event.key);
  if (!next) return;
  event.preventDefault();
  selectMode(next);
  ui.tabs.find((tab) => tab.dataset.mode === next).focus();
}

function onShortcut(event) {
  const action = shortcutAction({
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    repeat: event.repeat,
    typing: isTypingTarget(event.target),
  });
  if (!action) return;
  event.preventDefault();
  SHORTCUT_HANDLERS[action]();
}

/** Touch and pen only: a mouse drag over the value keeps selecting text. */
function onPointerDown(event) {
  if (event.pointerType === 'mouse') return;
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  ui.value.setPointerCapture(event.pointerId);
}

function onPointerUp(event) {
  if (!swipe || swipe.id !== event.pointerId) return;
  const swiped = isSwipe(event.clientX - swipe.x, event.clientY - swipe.y);
  swipe = null;
  if (swiped) regenerate();
}

async function onHistoryClick(event) {
  const button = event.target.closest('button[data-index]');
  if (!button) return;
  const value = app.getState().history[Number(button.dataset.index)];
  if (value !== undefined) showToast((await copyText(value)) ? 'action.copied' : 'action.copyFailed');
}

// ---- actions ----

function regenerate() {
  show(app.regenerate(), true);
  announce(t('status.generated'));
}

function selectMode(mode) {
  if (mode !== app.getState().mode) show(app.setMode(mode), true);
}

/** Applies password options; a preview stays out of the history until it settles. */
function setPassword(patch, preview = false) {
  clearTimeout(commitTimer);
  show(app.setPasswordOptions(patch, { preview }), false);
}

/** Applies passphrase options; a preview stays out of the history until it settles. */
function setPassphrase(patch, preview = false) {
  clearTimeout(commitTimer);
  show(app.setPassphraseOptions(patch, { preview }), false);
}

/** Settles a slider preview after a pause, so holding an arrow key adds one value, not dozens. */
function scheduleCommit() {
  clearTimeout(commitTimer);
  commitTimer = setTimeout(commitPreview, COMMIT_DELAY_MS);
}

function commitPreview() {
  clearTimeout(commitTimer);
  show(app.commit(), false);
}

/** Applies a typed number on change; an empty or invalid field gets its value back. */
function commitNumber(input, apply) {
  const text = input.value.trim();
  if (text === '' || !Number.isFinite(Number(text))) renderState(app.getState(), false);
  else apply(Number(text));
}

async function copyCurrent() {
  commitPreview();
  const { value, error } = app.getState();
  if (error) return;
  const copied = await copyText(value);
  showToast(copied ? 'action.copied' : 'action.copyFailed');
  if (!copied) return;
  setCopyDone(true);
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => setCopyDone(false), FEEDBACK_MS);
}

function resetAll() {
  ui.check.value = '';
  ui.check.type = 'password';
  show(app.reset(), true);
  renderChecker();
}

function toggleLanguage() {
  lang = LANGUAGES.find((code) => code !== lang);
  save(LANGUAGE_KEY, lang);
  applyLanguage(false);
}

function toggleCheckVisibility() {
  ui.check.type = ui.check.type === 'password' ? 'text' : 'password';
  renderCheckToggle();
}

/** Shows the state after a user action and remembers the options (not in the demo). */
function show(state, animate) {
  if (!isDemo) save(SETTINGS_KEY, app.getSettings());
  renderState(state, animate);
}

/** Shows a short message by its i18n key. */
function showToast(key) {
  toastKey = key;
  ui.toast.textContent = t(key);
  ui.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, FEEDBACK_MS);
}

function hideToast() {
  toastKey = '';
  ui.toast.classList.remove('is-visible');
}

/** Shows or clears the "Copied!" state of the copy button. */
function setCopyDone(done) {
  copyDone = done;
  ui.copy.classList.toggle('is-done', done);
  ui.copyLabel.textContent = t(done ? 'action.copied' : 'action.copy');
}

function announce(message) {
  ui.status.textContent = '';
  requestAnimationFrame(() => {
    ui.status.textContent = message;
  });
}

// ---- rendering ----

function applyLanguage(animate) {
  document.documentElement.lang = lang;
  document.title = t('app.title');
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    for (const element of document.querySelectorAll(`[data-i18n-${attribute}]`)) {
      element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
    }
  }
  setCopyDone(copyDone);
  ui.toast.textContent = toastKey ? t(toastKey) : '';
  ui.status.textContent = '';
  renderState(app.getState(), animate);
  renderChecker();
}

function renderState(state, animate) {
  renderMode(state.mode);
  renderOutput(state, animate);
  renderPasswordOptions(state);
  renderPassphraseOptions(state);
  renderEntropy(state);
  renderHistory(ui.historyList, state.history, { t, icon: ui.copyIcon });
  ui.historyEmpty.hidden = state.history.length > 0;
  ui.clearHistory.disabled = state.history.length === 0;
}

function renderMode(mode) {
  for (const tab of ui.tabs) {
    const selected = tab.dataset.mode === mode;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const name of MODES) ui.panels[name].hidden = name !== mode;
  ui.outputCard.dataset.mode = mode;
  ui.outputLabel.textContent = t(`output.${mode}`);
}

function renderOutput(state, animate) {
  const failed = state.error !== null;
  ui.value.hidden = failed;
  ui.valueError.hidden = !failed;
  ui.valueError.textContent = failed ? t(state.error) : '';
  ui.copy.disabled = failed;
  ui.pill.hidden = failed;
  ui.demoBadge.hidden = state.value !== demoValue;
  if (!failed && (animate || state.value !== shownValue)) renderValue(ui.value, state.value, animate);
  shownValue = state.value;
  if (failed) return;
  ui.outputCard.dataset.score = String(state.entropy.score);
  ui.pillLabel.textContent = t(state.entropy.label);
  ui.pillBits.textContent = t('meter.bitsShort', { bits: formatNumber(lang, state.entropy.bits, 1) });
}

function renderPasswordOptions({ password, limits }) {
  setRange(ui.lengthRange, ui.lengthNumber, password.length, limits.minLength, limits.maxLength);
  for (const box of ui.sets) box.checked = password[box.dataset.set];
  ui.lookAlikes.checked = password.excludeLookAlikes;
  setText(ui.custom, password.custom);
}

function renderPassphraseOptions({ passphrase, limits }) {
  setRange(ui.wordsRange, ui.wordsNumber, passphrase.words, limits.minWords, limits.maxWords);
  ui.wordList.value = passphrase.language;
  setText(ui.separator, passphrase.separator);
  ui.capitalization.value = passphrase.capitalization;
  ui.addNumber.checked = passphrase.number;
}

function renderEntropy(state) {
  const { entropy } = state;
  const bits = entropy ? entropy.bits : 0;
  ui.meterCard.dataset.score = String(entropy ? entropy.score : 0);
  ui.meterLabel.hidden = !entropy;
  ui.meterLabel.textContent = entropy ? t(entropy.label) : '';
  ui.bits.textContent = formatNumber(lang, bits, 1);
  ui.entropySource.textContent = entropy ? describeSource(state) : t(state.error);
  renderMeter(ui.meter, bits, entropy ? t(entropy.label) : t(state.error));
  renderCrackList(ui.crackList, entropy ? entropy.crackTimes : [], { lang, t, notes: true });
}

/** "16 characters from a pool of 94" or "6 words from a list of 1,901 + a random digit". */
function describeSource({ mode, entropy, passphrase }) {
  if (mode === 'password') {
    return t('entropy.passwordSource', {
      length: formatNumber(lang, entropy.length),
      pool: formatNumber(lang, entropy.poolSize),
    });
  }
  const parts = [
    t('entropy.passphraseSource', {
      words: formatNumber(lang, entropy.words),
      list: formatNumber(lang, entropy.listSize),
    }),
  ];
  if (passphrase.capitalization === 'random') parts.push(t('entropy.plusCaps'));
  if (passphrase.number) parts.push(t('entropy.plusDigit'));
  return parts.join(' + ');
}

/** Analyses at most once per frame, so long pastes do not stall typing. */
function scheduleChecker() {
  cancelAnimationFrame(checkFrame);
  checkFrame = requestAnimationFrame(renderChecker);
}

function renderChecker() {
  checkFrame = 0;
  const text = ui.check.value;
  ui.checkEmpty.hidden = text !== '';
  ui.checkResult.hidden = text === '';
  renderCheckToggle();
  if (text === '') return;
  const result = estimateStrength(text);
  ui.checkResult.dataset.score = String(result.score);
  ui.checkLabel.textContent = t(result.label);
  ui.checkBits.textContent = t('checker.bits', { bits: formatNumber(lang, result.bits, 1) });
  renderMeter(ui.checkMeter, result.bits, t(result.label));
  renderFeedback(ui.feedback, result.feedback, t);
  renderCrackList(ui.checkCrack, result.crackTimes, { lang, t, notes: false });
}

function renderCheckToggle() {
  const visible = ui.check.type === 'text';
  ui.checkToggle.setAttribute('aria-pressed', String(visible));
  ui.checkToggle.textContent = t(visible ? 'checker.hide' : 'checker.show');
}

function setRange(range, number, value, min, max) {
  for (const input of [range, number]) {
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
  }
}

/** Updates a text field only when needed, so the caret does not jump while typing. */
function setText(input, value) {
  if (input.value !== value) input.value = value;
}
