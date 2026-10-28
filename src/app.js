/**
 * App state without any DOM: the current mode and options, the generated
 * value, its entropy and the in-memory history. The UI calls the actions,
 * then renders getState().
 */

import { crackTimes, strengthFromBits } from './entropy.js';
import {
  MIN_WORDS,
  MAX_WORDS,
  generatePassphrase,
  normalizePassphraseOptions,
  passphraseEntropy,
} from './passphrase.js';
import {
  MAX_LENGTH,
  buildCharsets,
  generatePassword,
  minimumLength,
  normalizePasswordOptions,
  passwordEntropy,
} from './password.js';
import { cryptoSource, seededSource } from './random.js';
import { asRecord } from './validate.js';

export const MODES = Object.freeze(['password', 'passphrase']);

/** How many generated values are kept (in memory only). */
export const HISTORY_LIMIT = 10;

/** Seed of the ?demo screen. */
export const DEMO_SEED = 20261028;

/** Weak example shown in the checker on the ?demo screen. */
export const DEMO_CHECK_EXAMPLE = 'Summer2024!';

/**
 * @typedef {Object} Settings
 * @property {'password'|'passphrase'} mode
 * @property {import('./password.js').PasswordOptions} password
 * @property {import('./passphrase.js').PassphraseOptions} passphrase
 */

/**
 * Turns untrusted input (for example settings loaded from storage) into
 * valid settings.
 * @param {unknown} raw
 * @returns {Settings}
 */
export function normalizeSettings(raw) {
  const input = asRecord(raw);
  return {
    mode: MODES.includes(input.mode) ? input.mode : 'password',
    password: normalizePasswordOptions(input.password),
    passphrase: normalizePassphraseOptions(input.passphrase),
  };
}

/**
 * Creates the app and generates the first value. Every generated value goes
 * to the front of the history (newest first, at most HISTORY_LIMIT), except
 * a preview: the value shown while a slider is dragged or a field is typed
 * in reaches the history only when commit() settles it or the next regular
 * action replaces it, and a newer preview simply takes its place.
 * @param {{ source?: import('./random.js').RandomSource, settings?: unknown }} [init]
 */
export function createApp({ source = cryptoSource(), settings } = {}) {
  let current = normalizeSettings(settings);
  let value = '';
  let error = null;
  let history = [];
  let pending = false;

  function remember(entry) {
    history = [entry, ...history].slice(0, HISTORY_LIMIT);
  }

  function settle() {
    if (pending) remember(value);
    pending = false;
  }

  function generate({ preview = false } = {}) {
    if (!preview) settle();
    pending = false;
    if (current.mode === 'password' && buildCharsets(current.password).length === 0) {
      value = '';
      error = 'error.noCharacters';
      return;
    }
    value =
      current.mode === 'password'
        ? generatePassword(current.password, source)
        : generatePassphrase(current.passphrase, source);
    error = null;
    if (preview) pending = true;
    else remember(value);
  }

  function update(next, preview) {
    current = normalizeSettings(next);
    generate({ preview });
    return getState();
  }

  function getState() {
    return {
      mode: current.mode,
      password: { ...current.password },
      passphrase: { ...current.passphrase },
      value,
      error,
      entropy: error ? null : describeEntropy(current),
      history: [...history],
      limits: {
        minLength: minimumLength(current.password),
        maxLength: MAX_LENGTH,
        minWords: MIN_WORDS,
        maxWords: MAX_WORDS,
      },
    };
  }

  generate();

  return {
    getState,
    /** @returns {Settings} A copy that is safe to store. */
    getSettings: () => normalizeSettings(current),
    /** Generates a new value with the current settings. */
    regenerate() {
      generate();
      return getState();
    },
    /** Switches mode and generates; unknown or unchanged modes are ignored. */
    setMode(mode) {
      if (!MODES.includes(mode) || mode === current.mode) return getState();
      return update({ ...current, mode });
    },
    /**
     * @param {Partial<import('./password.js').PasswordOptions>} patch
     * @param {{ preview?: boolean }} [options] preview: keep the new value
     *   out of the history until it is committed.
     */
    setPasswordOptions: (patch, { preview = false } = {}) =>
      update({ ...current, password: { ...current.password, ...patch } }, preview),
    /**
     * @param {Partial<import('./passphrase.js').PassphraseOptions>} patch
     * @param {{ preview?: boolean }} [options] Same as for setPasswordOptions.
     */
    setPassphraseOptions: (patch, { preview = false } = {}) =>
      update({ ...current, passphrase: { ...current.passphrase, ...patch } }, preview),
    /** Puts a previewed value into the history (once); otherwise changes nothing. */
    commit() {
      settle();
      return getState();
    },
    /** Forgets the history, including a preview that was not committed yet. */
    clearHistory() {
      history = [];
      pending = false;
      return getState();
    },
    /** Restores the default settings, forgets the history and generates. */
    reset() {
      current = normalizeSettings(undefined);
      history = [];
      pending = false;
      generate();
      return getState();
    },
  };
}

/**
 * Builds the deterministic ?demo screen: a 20-character password with a few
 * earlier values in the history, plus a weak example for the checker.
 * Only those first values are fixed: everything generated afterwards comes
 * from `liveSource`, so a demo visitor never gets a predictable password.
 * @param {{ liveSource?: import('./random.js').RandomSource }} [options]
 * @returns {{ app: ReturnType<typeof createApp>, checkText: string }}
 */
export function createDemo({ liveSource = cryptoSource() } = {}) {
  let active = seededSource(DEMO_SEED);
  const app = createApp({ source: () => active(), settings: { password: { length: 20 } } });
  for (let i = 0; i < 3; i += 1) app.regenerate();
  active = liveSource;
  return { app, checkText: DEMO_CHECK_EXAMPLE };
}

function describeEntropy(settings) {
  const details =
    settings.mode === 'password'
      ? passwordEntropy(settings.password)
      : passphraseEntropy(settings.passphrase);
  return {
    ...details,
    ...strengthFromBits(details.bits),
    crackTimes: crackTimes(details.bits - 1),
  };
}
