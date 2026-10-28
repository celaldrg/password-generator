import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CHARSETS,
  DEFAULT_PASSWORD_OPTIONS,
  LOOK_ALIKES,
  MAX_CUSTOM_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  SET_IDS,
  buildCharsets,
  generatePassword,
  minimumLength,
  normalizePasswordOptions,
} from '../src/password.js';
import { seededSource } from '../src/random.js';

const BUILT_IN = ['lower', 'upper', 'digits', 'symbols'];
const NONE = { lower: false, upper: false, digits: false, symbols: false, custom: '' };

/** Every non-empty combination of the built-in sets (15 of them). */
function builtInCombinations() {
  const combinations = [];
  for (let mask = 1; mask < 2 ** BUILT_IN.length; mask += 1) {
    combinations.push(BUILT_IN.filter((_, bit) => mask & (1 << bit)));
  }
  return combinations;
}

function optionsFor(ids, extra = {}) {
  return { ...NONE, ...Object.fromEntries(ids.map((id) => [id, true])), ...extra };
}

/** The expected characters of built-in sets, worked out from CHARSETS alone. */
function builtInSets(ids, excludeLookAlikes = false) {
  return ids.map((id) =>
    Array.from(CHARSETS[id]).filter((char) => !(excludeLookAlikes && LOOK_ALIKES.includes(char))),
  );
}

function assertFollowsRules(password, length, sets) {
  const chars = Array.from(password);
  assert.equal(chars.length, length, `length of ${password}`);
  const allowed = new Set(sets.flat());
  for (const char of chars) assert.ok(allowed.has(char), `unexpected ${char} in ${password}`);
  for (const set of sets) {
    assert.ok(
      chars.some((char) => set.includes(char)),
      `${password} misses a required set`,
    );
  }
}

describe('character sets', () => {
  it('cover the 94 printable ASCII characters without overlap', () => {
    const all = Object.values(CHARSETS).join('');
    const printable = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i));
    assert.equal(all.length, 94);
    assert.deepEqual([...all].sort(), printable.sort());
  });

  it('list the custom set after the built-in ones', () => {
    assert.deepEqual(SET_IDS, [...BUILT_IN, 'custom']);
  });

  it('treat I l 1 O 0 as look-alikes', () => {
    assert.equal(LOOK_ALIKES, 'Il1O0');
  });
});

describe('generatePassword', () => {
  it('contains every selected set and nothing else, for every combination and length', () => {
    const source = seededSource(1);
    for (const ids of builtInCombinations()) {
      for (const length of [MIN_LENGTH, 5, 8, 16, MAX_LENGTH]) {
        for (let run = 0; run < 20; run += 1) {
          assertFollowsRules(generatePassword(optionsFor(ids, { length }), source), length, builtInSets(ids));
        }
      }
    }
  });

  it('treats custom characters as one more required set', () => {
    const source = seededSource(2);
    for (const ids of builtInCombinations()) {
      for (const length of [Math.max(MIN_LENGTH, ids.length + 1), 12]) {
        for (let run = 0; run < 10; run += 1) {
          const password = generatePassword(optionsFor(ids, { length, custom: 'çğ€' }), source);
          assertFollowsRules(password, length, [...builtInSets(ids), ['ç', 'ğ', '€']]);
        }
      }
    }
  });

  it('leaves out look-alike characters when asked', () => {
    const source = seededSource(3);
    const options = { ...DEFAULT_PASSWORD_OPTIONS, length: MAX_LENGTH, excludeLookAlikes: true };
    for (let run = 0; run < 100; run += 1) {
      const password = generatePassword(options, source);
      for (const char of LOOK_ALIKES) assert.ok(!password.includes(char), `${char} in ${password}`);
      assertFollowsRules(password, MAX_LENGTH, builtInSets(BUILT_IN, true));
    }
  });

  it('counts the length in characters, also outside the Basic Multilingual Plane', () => {
    const password = generatePassword({ ...NONE, digits: true, custom: '😀', length: 6 }, seededSource(4));
    assertFollowsRules(password, 6, [Array.from(CHARSETS.digits), ['😀']]);
  });

  it('works with custom characters only', () => {
    assertFollowsRules(generatePassword({ ...NONE, custom: 'ab', length: 10 }, seededSource(5)), 10, [['a', 'b']]);
  });

  it('is reproducible with a seeded source', () => {
    assert.equal(generatePassword({}, seededSource(9)), generatePassword({}, seededSource(9)));
    assert.notEqual(generatePassword({}, seededSource(9)), generatePassword({}, seededSource(10)));
  });

  it('uses the defaults and crypto.getRandomValues when nothing is passed', () => {
    assertFollowsRules(generatePassword(), DEFAULT_PASSWORD_OPTIONS.length, builtInSets(BUILT_IN));
  });

  it('rejects impossible settings', () => {
    const source = seededSource(6);
    assert.throws(() => generatePassword(NONE, source), RangeError);
    assert.throws(() => generatePassword({ ...NONE, custom: ' \t' }, source), RangeError);
    for (const length of [3, MAX_LENGTH + 1, 4.5, Number.NaN, '16']) {
      assert.throws(() => generatePassword({ length }, source), RangeError, `length ${String(length)}`);
    }
    // Five sets need at least five characters.
    assert.throws(() => generatePassword({ length: 4, custom: 'ç' }, source), RangeError);
  });
});

describe('buildCharsets', () => {
  it('de-duplicates custom characters and drops the ones a selected set has', () => {
    const sets = buildCharsets({ ...NONE, lower: true, symbols: true, custom: 'aa!çç€' });
    assert.deepEqual(
      sets.map((set) => set.id),
      ['lower', 'symbols', 'custom'],
    );
    assert.deepEqual(sets.at(-1).chars, ['ç', '€']);
  });

  it('keeps custom characters that only unselected sets have', () => {
    assert.deepEqual(buildCharsets({ ...NONE, lower: true, custom: 'aA1' }).at(-1), {
      id: 'custom',
      chars: ['A', '1'],
    });
  });

  it('drops spaces and control characters from the custom set', () => {
    assert.deepEqual(buildCharsets({ ...NONE, custom: ' \t\n\u0000ç ' }), [{ id: 'custom', chars: ['ç'] }]);
  });

  it('drops a custom set that ends up empty', () => {
    assert.deepEqual(
      buildCharsets({ ...NONE, digits: true, custom: '123' }).map((set) => set.id),
      ['digits'],
    );
  });

  it('removes look-alikes from the custom set too', () => {
    assert.deepEqual(buildCharsets({ ...NONE, custom: 'Il1O0x', excludeLookAlikes: true }), [
      { id: 'custom', chars: ['x'] },
    ]);
  });
});

describe('minimumLength', () => {
  it('is 4, or one character per selected set when that is more', () => {
    assert.equal(minimumLength(DEFAULT_PASSWORD_OPTIONS), 4);
    assert.equal(minimumLength({ ...DEFAULT_PASSWORD_OPTIONS, custom: 'ç' }), 5);
    assert.equal(minimumLength(NONE), 4);
  });
});

describe('normalizePasswordOptions', () => {
  it('falls back to the defaults for missing or broken input', () => {
    for (const raw of [undefined, null, 'x', 42, [], {}]) {
      assert.deepEqual(normalizePasswordOptions(raw), { ...DEFAULT_PASSWORD_OPTIONS });
    }
    assert.deepEqual(normalizePasswordOptions({ length: 'many', lower: 'yes', custom: 7 }), {
      ...DEFAULT_PASSWORD_OPTIONS,
    });
  });

  it('clamps the length to the allowed range', () => {
    const lengthOf = (raw) => normalizePasswordOptions(raw).length;
    assert.equal(lengthOf({ length: 2 }), MIN_LENGTH);
    assert.equal(lengthOf({ length: 500 }), MAX_LENGTH);
    assert.equal(lengthOf({ length: '20' }), 20);
    assert.equal(lengthOf({ length: 12.6 }), 13);
    assert.equal(lengthOf({ length: 4, custom: 'ç' }), 5);
  });

  it('cuts long custom input', () => {
    const custom = 'ç'.repeat(MAX_CUSTOM_LENGTH + 10);
    assert.equal(Array.from(normalizePasswordOptions({ custom }).custom).length, MAX_CUSTOM_LENGTH);
  });
});
