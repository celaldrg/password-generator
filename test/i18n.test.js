import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DURATION_UNITS, GUESS_RATES, STRENGTH_LABELS, crackTimes } from '../src/entropy.js';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  STRINGS,
  formatDuration,
  formatNumber,
  normalizeLanguage,
  translate,
} from '../src/i18n.js';
import { FEEDBACK_KEYS } from '../src/strength.js';

/** Every key the logic modules can hand to the UI. */
const LOGIC_KEYS = [
  ...STRENGTH_LABELS,
  ...FEEDBACK_KEYS,
  ...GUESS_RATES.flatMap(({ id }) => [`rate.${id}`, `rate.${id}.note`]),
  ...DURATION_UNITS.map((unit) => `time.${unit}`),
  'error.noCharacters',
];

describe('strings', () => {
  it('have the same keys in English and Turkish', () => {
    assert.deepEqual(Object.keys(STRINGS.tr).sort(), Object.keys(STRINGS.en).sort());
  });

  it('cover every key the logic can return', () => {
    for (const language of LANGUAGES) {
      for (const key of LOGIC_KEYS) assert.ok(Object.hasOwn(STRINGS[language], key), `${language}: ${key}`);
    }
  });

  it('cannot be changed at run time', () => {
    assert.ok(Object.isFrozen(STRINGS) && Object.isFrozen(STRINGS.en) && Object.isFrozen(STRINGS.tr));
  });
});

describe('translate', () => {
  it('looks up the language, falling back to English and then to the key', () => {
    assert.equal(translate('tr', 'strength.weak'), 'Zayıf');
    assert.equal(translate('en', 'strength.weak'), 'Weak');
    assert.equal(translate('de', 'strength.weak'), 'Weak');
    assert.equal(translate('en', 'no.such.key'), 'no.such.key');
  });

  it('fills placeholders and picks plural forms', () => {
    assert.equal(translate('en', 'time.hours', { count: 1, n: '1' }), '1 hour');
    assert.equal(translate('en', 'time.hours', { count: 3, n: '3' }), '3 hours');
    assert.equal(translate('tr', 'time.hours', { count: 3, n: '3' }), '3 saat');
    assert.equal(translate('en', 'time.hours', { count: 3 }), '{n} hours');
  });
});

describe('formatNumber', () => {
  it('groups digits and places the decimal mark the way each language does', () => {
    assert.equal(formatNumber('en', 1901), '1,901');
    assert.equal(formatNumber('tr', 1901), '1.901');
    assert.equal(formatNumber('en', 104.87, 1), '104.9');
    assert.equal(formatNumber('tr', 104.87, 1), '104,9');
    assert.equal(formatNumber('en', 0, 1), '0.0');
    assert.equal(formatNumber('de', 1901), '1,901');
  });
});

describe('formatDuration', () => {
  it('writes counts with plural forms and large numbers in words', () => {
    const cases = [
      ['en', 'seconds', 1, '1 second'],
      ['en', 'seconds', 2, '2 seconds'],
      ['tr', 'seconds', 2, '2 saniye'],
      ['en', 'years', 4500, '4,500 years'],
      ['tr', 'years', 4500, '4.500 yıl'],
      ['en', 'years', 4.8e9, '4.8 billion years'],
      ['tr', 'years', 4.8e9, '4,8 milyar yıl'],
      ['en', 'instant', 0, 'instantly'],
      ['tr', 'beyondUniverse', 0, 'evrenin yaşından daha uzun'],
    ];
    for (const [language, unit, count, expected] of cases) {
      assert.equal(formatDuration(language, { unit, count }), expected);
    }
  });

  it('leaves no placeholder unfilled for any crack time', () => {
    for (let bits = 0; bits <= 128; bits += 2) {
      for (const { duration } of crackTimes(bits)) {
        for (const language of LANGUAGES) {
          assert.doesNotMatch(formatDuration(language, duration), /[{}]/);
        }
      }
    }
  });
});

describe('normalizeLanguage', () => {
  it('accepts en and tr only', () => {
    assert.equal(normalizeLanguage('tr'), 'tr');
    assert.equal(normalizeLanguage('en'), 'en');
    for (const value of ['de', 'TR', '', undefined, null, 42]) {
      assert.equal(normalizeLanguage(value), DEFAULT_LANGUAGE);
    }
  });
});
