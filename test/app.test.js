import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEMO_CHECK_EXAMPLE,
  HISTORY_LIMIT,
  MODES,
  createApp,
  createDemo,
  normalizeSettings,
} from '../src/app.js';
import { DEFAULT_PASSPHRASE_OPTIONS, MAX_WORDS, MIN_WORDS, WORD_LISTS } from '../src/passphrase.js';
import {
  DEFAULT_PASSWORD_OPTIONS,
  MAX_LENGTH,
  MIN_LENGTH,
  generatePassword,
  normalizePasswordOptions,
} from '../src/password.js';
import { seededSource } from '../src/random.js';
import { estimateStrength } from '../src/strength.js';

const NO_SETS = { lower: false, upper: false, digits: false, symbols: false, custom: '' };
const newApp = (settings) => createApp({ source: seededSource(1), settings });

describe('createApp', () => {
  it('starts with a 16-character password and its entropy', () => {
    const state = newApp().getState();
    assert.equal(state.mode, 'password');
    assert.deepEqual(state.password, { ...DEFAULT_PASSWORD_OPTIONS });
    assert.deepEqual(state.passphrase, { ...DEFAULT_PASSPHRASE_OPTIONS });
    assert.equal(state.value.length, 16);
    assert.equal(state.error, null);
    assert.equal(state.entropy.poolSize, 94);
    assert.equal(state.entropy.bits.toFixed(1), '104.9');
    assert.equal(state.entropy.score, 4);
    assert.equal(state.entropy.label, 'strength.veryStrong');
    assert.equal(state.entropy.crackTimes.length, 4);
    assert.deepEqual(state.history, [state.value]);
    assert.deepEqual(state.limits, {
      minLength: MIN_LENGTH,
      maxLength: MAX_LENGTH,
      minWords: MIN_WORDS,
      maxWords: MAX_WORDS,
    });
  });

  it('generates a new value when an option changes', () => {
    const app = newApp();
    const first = app.getState().value;
    const state = app.setPasswordOptions({ length: 32, symbols: false });
    assert.match(state.value, /^[A-Za-z0-9]{32}$/);
    assert.equal(state.password.length, 32);
    assert.deepEqual(state.history, [state.value, first]);
  });

  it('keeps the newest 10 values in memory, newest first', () => {
    const app = newApp();
    const values = [app.getState().value];
    for (let i = 0; i < 14; i += 1) values.unshift(app.regenerate().value);
    assert.deepEqual(app.getState().history, values.slice(0, HISTORY_LIMIT));
    assert.equal(HISTORY_LIMIT, 10);
  });

  it('reports an error instead of a value when no set is selected', () => {
    const app = newApp();
    const before = app.getState().history;
    const state = app.setPasswordOptions(NO_SETS);
    assert.equal(state.error, 'error.noCharacters');
    assert.equal(state.value, '');
    assert.equal(state.entropy, null);
    assert.deepEqual(state.history, before);
    const fixed = app.setPasswordOptions({ digits: true });
    assert.equal(fixed.error, null);
    assert.match(fixed.value, /^\d{16}$/);
  });

  it('keeps the length within the limits of the selected sets', () => {
    const app = newApp();
    assert.equal(app.setPasswordOptions({ length: 2 }).password.length, MIN_LENGTH);
    const state = app.setPasswordOptions({ length: 4, custom: 'ç' });
    assert.equal(state.password.length, 5);
    assert.equal(state.limits.minLength, 5);
    assert.equal(state.value.length, 5);
  });

  it('switches to passphrases and back', () => {
    const app = newApp();
    const state = app.setMode('passphrase');
    assert.equal(state.mode, 'passphrase');
    assert.equal(state.value.split('-').length, DEFAULT_PASSPHRASE_OPTIONS.words);
    assert.equal(state.entropy.listSize, WORD_LISTS.en.length);
    const turkish = app.setPassphraseOptions({ words: 4, separator: '_', number: false, language: 'tr' });
    assert.equal(turkish.value.split('_').length, 4);
    assert.equal(turkish.entropy.listSize, WORD_LISTS.tr.length);
    assert.equal(app.setMode('password').mode, 'password');
    assert.equal(MODES.length, 2);
  });

  it('ignores unknown and unchanged modes', () => {
    const app = newApp();
    const before = app.getState();
    assert.deepEqual(app.setMode('pin'), before);
    assert.deepEqual(app.setMode('password'), before);
  });

  it('hands out copies, so callers cannot change its state', () => {
    const app = newApp();
    const state = app.getState();
    state.history.push('changed');
    state.password.length = 99;
    assert.equal(app.getState().history.length, 1);
    assert.equal(app.getState().password.length, 16);
  });

  it('keeps previews (a dragged slider, a field being typed in) out of the history until committed', () => {
    const app = newApp();
    const first = app.getState().value;
    let state = app.getState();
    for (let length = 17; length <= 30; length += 1) state = app.setPasswordOptions({ length }, { preview: true });
    state = app.setPassphraseOptions({ separator: '+' }, { preview: true });
    assert.equal(state.value.length, 30);
    assert.deepEqual(state.history, [first]);
    const committed = app.commit();
    assert.deepEqual(committed.history, [state.value, first]);
    assert.deepEqual(app.commit().history, committed.history);
  });

  it('settles a pending preview when a regular action replaces it', () => {
    const app = newApp();
    const first = app.getState().value;
    const preview = app.setPasswordOptions({ custom: 'ç' }, { preview: true }).value;
    const next = app.regenerate();
    assert.deepEqual(next.history, [next.value, preview, first]);
    const words = app.setMode('passphrase');
    assert.deepEqual(words.history, [words.value, next.value, preview, first]);
  });

  it('drops a pending preview on clear and reset, and never keeps an error', () => {
    const app = newApp();
    app.setPasswordOptions({ length: 20 }, { preview: true });
    assert.deepEqual(app.clearHistory().history, []);
    assert.deepEqual(app.commit().history, []);
    app.setPasswordOptions({ length: 21 }, { preview: true });
    const reset = app.reset();
    assert.deepEqual(reset.history, [reset.value]);
    app.setPasswordOptions(NO_SETS, { preview: true });
    assert.deepEqual(app.commit().history, [reset.value]);
  });

  it('clears the history but keeps the current value', () => {
    const app = newApp();
    app.regenerate();
    const state = app.clearHistory();
    assert.deepEqual(state.history, []);
    assert.equal(state.value.length, 16);
  });

  it('round-trips its settings through JSON, without any generated value', () => {
    const app = newApp();
    app.setMode('passphrase');
    app.setPassphraseOptions({ words: 5, language: 'tr', capitalization: 'upper' });
    app.setPasswordOptions({ length: 24, custom: 'ç' });
    const saved = JSON.stringify(app.getSettings());
    assert.deepEqual(Object.keys(app.getSettings()), ['mode', 'password', 'passphrase']);
    assert.ok(!saved.includes(app.getState().value));
    const restored = createApp({ source: seededSource(2), settings: JSON.parse(saved) });
    assert.deepEqual(restored.getSettings(), app.getSettings());
    assert.equal(restored.getState().mode, 'passphrase');
  });

  it('resets to the default settings with a fresh history', () => {
    const app = newApp();
    app.setMode('passphrase');
    app.setPasswordOptions({ length: 40, symbols: false });
    app.regenerate();
    const state = app.reset();
    assert.equal(state.mode, 'password');
    assert.deepEqual(state.password, { ...DEFAULT_PASSWORD_OPTIONS });
    assert.deepEqual(state.passphrase, { ...DEFAULT_PASSPHRASE_OPTIONS });
    assert.equal(state.value.length, 16);
    assert.deepEqual(state.history, [state.value]);
  });

  it('uses crypto.getRandomValues by default', () => {
    assert.equal(createApp().getState().value.length, 16);
  });
});

describe('normalizeSettings', () => {
  it('turns broken stored settings into the defaults', () => {
    const defaults = {
      mode: 'password',
      password: { ...DEFAULT_PASSWORD_OPTIONS },
      passphrase: { ...DEFAULT_PASSPHRASE_OPTIONS },
    };
    for (const raw of [undefined, null, 'x', [], { mode: 'pin', password: 5, passphrase: 'y' }]) {
      assert.deepEqual(normalizeSettings(raw), defaults);
    }
  });
});

describe('createDemo', () => {
  it('shows the same 20-character password every time, with some history', () => {
    const state = createDemo().app.getState();
    assert.equal(state.value, createDemo().app.getState().value);
    assert.equal(state.value.length, 20);
    assert.equal(state.history.length, 4);
    assert.equal(state.history[0], state.value);
    assert.equal(state.entropy.label, 'strength.veryStrong');
  });

  it('takes every later value from the live source, never from the demo seed', () => {
    const { app } = createDemo({ liveSource: seededSource(5) });
    const expected = generatePassword(normalizePasswordOptions({ length: 20 }), seededSource(5));
    assert.equal(app.regenerate().value, expected);
    assert.equal(createDemo().app.regenerate().value.length, 20);
  });

  it('comes with a weak example for the checker', () => {
    const { checkText } = createDemo();
    assert.equal(checkText, DEMO_CHECK_EXAMPLE);
    const result = estimateStrength(checkText, { referenceYear: 2026 });
    assert.ok(result.score <= 1, `score ${result.score}`);
    assert.ok(result.feedback.length >= 2, `[${result.feedback}]`);
    assert.ok(!result.feedback.includes('feedback.strong'));
  });
});
