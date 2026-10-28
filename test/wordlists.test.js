import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COMMON_PASSWORDS } from '../src/common-passwords.js';
import { COMMON_WORDS } from '../src/common-words.js';
import { EN_WORDS } from '../src/words-en.js';
import { TR_WORDS } from '../src/words-tr.js';

const LISTS = [
  { name: 'English', words: EN_WORDS, letters: /^[a-z]+$/ },
  { name: 'Turkish', words: TR_WORDS, letters: /^[abcçdefgğhıijklmnoöprsştuüvyz]+$/u },
];

function duplicatesOf(items) {
  const seen = new Set();
  const duplicates = [];
  for (const item of items) {
    if (seen.has(item)) duplicates.push(item);
    seen.add(item);
  }
  return duplicates;
}

for (const { name, words, letters } of LISTS) {
  describe(`${name} word list`, () => {
    it('has at least 1,000 words', () => {
      assert.ok(words.length >= 1000, `only ${words.length} words`);
    });

    it('has no duplicates', () => {
      assert.deepEqual(duplicatesOf(words), []);
    });

    it('has only lowercase letters, 3 to 10 per word', () => {
      const invalid = words.filter((word) => {
        const length = Array.from(word).length;
        return !letters.test(word) || !/^\p{Ll}+$/u.test(word) || length < 3 || length > 10;
      });
      assert.deepEqual(invalid, []);
    });

    it('cannot be changed at run time', () => {
      assert.ok(Object.isFrozen(words));
    });
  });
}

describe('common password list', () => {
  it('has unique, lowercase, printable ASCII entries', () => {
    assert.ok(COMMON_PASSWORDS.length >= 100, `only ${COMMON_PASSWORDS.length} entries`);
    assert.deepEqual(duplicatesOf(COMMON_PASSWORDS), []);
    for (const entry of COMMON_PASSWORDS) {
      assert.match(entry, /^[!-~]+$/);
      assert.equal(entry, entry.toLowerCase());
    }
    assert.ok(Object.isFrozen(COMMON_PASSWORDS));
  });
});

describe('common word list', () => {
  const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  const fold = (word) => Array.from(word, (char) => FOLD[char] ?? char).join('');

  it('has at least 2,000 unique lowercase a-z words of 3 or more letters', () => {
    assert.ok(COMMON_WORDS.length >= 2000, `only ${COMMON_WORDS.length} words`);
    assert.deepEqual(duplicatesOf(COMMON_WORDS), []);
    assert.deepEqual(COMMON_WORDS.filter((word) => !/^[a-z]{3,}$/.test(word)), []);
    assert.ok(Object.isFrozen(COMMON_WORDS));
  });

  it('repeats nothing from the passphrase lists or the common passwords', () => {
    const elsewhere = new Set([...EN_WORDS, ...TR_WORDS.map(fold), ...COMMON_PASSWORDS]);
    assert.deepEqual(COMMON_WORDS.filter((word) => elsewhere.has(word)), []);
  });
});
