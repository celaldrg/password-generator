import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CAPITALIZATIONS,
  DEFAULT_PASSPHRASE_OPTIONS,
  MAX_SEPARATOR_LENGTH,
  MAX_WORDS,
  MIN_WORDS,
  WORD_LISTS,
  generatePassphrase,
  normalizePassphraseOptions,
} from '../src/passphrase.js';
import { seededSource } from '../src/random.js';

const PLAIN = { words: 5, language: 'en', separator: '-', capitalization: 'lower', number: false };

/** A source that keeps returning the list index of `word`, so every pick is that word. */
function alwaysPicks(language, word) {
  const index = WORD_LISTS[language].indexOf(word);
  assert.ok(index >= 0, `${word} is not in the ${language} list`);
  return () => index;
}

describe('generatePassphrase', () => {
  it('joins the requested number of list words with the separator', () => {
    const source = seededSource(1);
    for (const language of ['en', 'tr']) {
      for (let words = MIN_WORDS; words <= MAX_WORDS; words += 1) {
        const parts = generatePassphrase({ ...PLAIN, language, words, separator: ' ' }, source).split(' ');
        assert.equal(parts.length, words);
        for (const part of parts) {
          assert.ok(WORD_LISTS[language].includes(part), `${part} is not in the ${language} list`);
        }
      }
    }
  });

  it('allows an empty or longer separator', () => {
    const source = alwaysPicks('en', 'ant');
    assert.equal(generatePassphrase({ ...PLAIN, words: 3, separator: '' }, source), 'antantant');
    assert.equal(generatePassphrase({ ...PLAIN, words: 3, separator: '::' }, source), 'ant::ant::ant');
  });

  it('capitalizes as asked', () => {
    const make = (capitalization) =>
      generatePassphrase({ ...PLAIN, words: 3, separator: ' ', capitalization }, alwaysPicks('en', 'ant'));
    assert.equal(make('lower'), 'ant ant ant');
    assert.equal(make('capitalize'), 'Ant Ant Ant');
    assert.equal(make('upper'), 'ANT ANT ANT');
  });

  it('flips a coin per word for random capitalization', () => {
    const source = seededSource(2);
    let lower = 0;
    let capitalized = 0;
    for (let run = 0; run < 50; run += 1) {
      for (const part of generatePassphrase({ ...PLAIN, capitalization: 'random' }, source).split('-')) {
        const word = part.toLowerCase();
        assert.ok(WORD_LISTS.en.includes(word), part);
        if (part === word) {
          lower += 1;
        } else {
          assert.equal(part, word[0].toUpperCase() + word.slice(1));
          capitalized += 1;
        }
      }
    }
    assert.ok(lower > 75 && capitalized > 75, `${lower} lowercase, ${capitalized} capitalized`);
  });

  it('uses Turkish rules for Turkish capitals', () => {
    const make = (word, capitalization) =>
      generatePassphrase(
        { ...PLAIN, language: 'tr', words: 3, separator: ' ', capitalization },
        alwaysPicks('tr', word),
      );
    assert.equal(make('inek', 'capitalize'), 'İnek İnek İnek');
    assert.equal(make('ıstakoz', 'capitalize'), 'Istakoz Istakoz Istakoz');
    assert.equal(make('inek', 'upper'), 'İNEK İNEK İNEK');
  });

  it('adds exactly one digit to one random word when number is on', () => {
    const source = seededSource(3);
    const digits = new Set();
    const positions = new Set();
    for (let run = 0; run < 200; run += 1) {
      const parts = generatePassphrase({ ...PLAIN, number: true }, source).split('-');
      const withDigit = parts.filter((part) => /\d/.test(part));
      assert.equal(withDigit.length, 1, parts.join('-'));
      assert.match(withDigit[0], /^[a-z]+\d$/);
      assert.ok(WORD_LISTS.en.includes(withDigit[0].slice(0, -1)));
      digits.add(withDigit[0].at(-1));
      positions.add(parts.indexOf(withDigit[0]));
    }
    assert.equal(digits.size, 10);
    assert.equal(positions.size, PLAIN.words);
  });

  it('is reproducible with a seeded source', () => {
    assert.equal(generatePassphrase({}, seededSource(4)), generatePassphrase({}, seededSource(4)));
    assert.notEqual(generatePassphrase({}, seededSource(4)), generatePassphrase({}, seededSource(5)));
  });

  it('uses the defaults and crypto.getRandomValues when nothing is passed', () => {
    const parts = generatePassphrase().split(DEFAULT_PASSPHRASE_OPTIONS.separator);
    assert.equal(parts.length, DEFAULT_PASSPHRASE_OPTIONS.words);
  });

  it('rejects invalid options', () => {
    const source = seededSource(6);
    const invalid = [
      { words: MIN_WORDS - 1 },
      { words: MAX_WORDS + 1 },
      { words: 4.5 },
      { language: 'de' },
      { language: 'toString' },
      { capitalization: 'title' },
      { separator: 7 },
    ];
    for (const options of invalid) {
      assert.throws(() => generatePassphrase(options, source), RangeError, JSON.stringify(options));
    }
  });
});

describe('normalizePassphraseOptions', () => {
  it('falls back to the defaults for missing or broken input', () => {
    for (const raw of [undefined, null, 'x', [], {}]) {
      assert.deepEqual(normalizePassphraseOptions(raw), { ...DEFAULT_PASSPHRASE_OPTIONS });
    }
    const broken = { words: 'lots', language: 'de', separator: 5, capitalization: 'title', number: 'yes' };
    assert.deepEqual(normalizePassphraseOptions(broken), { ...DEFAULT_PASSPHRASE_OPTIONS });
  });

  it('clamps the word count and cuts the separator', () => {
    assert.equal(normalizePassphraseOptions({ words: 1 }).words, MIN_WORDS);
    assert.equal(normalizePassphraseOptions({ words: 99 }).words, MAX_WORDS);
    assert.equal(normalizePassphraseOptions({ words: '8' }).words, 8);
    assert.equal(
      normalizePassphraseOptions({ separator: '-+-+-' }).separator,
      '-+-+-'.slice(0, MAX_SEPARATOR_LENGTH),
    );
    assert.equal(normalizePassphraseOptions({ separator: '' }).separator, '');
  });

  it('keeps every valid choice', () => {
    for (const capitalization of CAPITALIZATIONS) {
      assert.equal(normalizePassphraseOptions({ capitalization }).capitalization, capitalization);
    }
    assert.equal(normalizePassphraseOptions({ language: 'tr' }).language, 'tr');
    assert.equal(normalizePassphraseOptions({ number: false }).number, false);
  });
});

describe('passphrases without a separator', () => {
  const SAMPLES = 2000;

  /** Number of ways to split `text` into exactly `count` words of the list. */
  function splits(text, count, words, longest) {
    const ways = Array.from({ length: text.length + 1 }, () => new Array(count + 1).fill(0));
    ways[0][0] = 1;
    for (let i = 0; i < text.length; i += 1) {
      for (let k = 0; k < count; k += 1) {
        if (ways[i][k] === 0) continue;
        for (let end = i + 1; end <= Math.min(text.length, i + longest); end += 1) {
          if (words.has(text.slice(i, end))) ways[end][k + 1] += ways[i][k];
        }
      }
    }
    return ways[text.length][count];
  }

  it('lose well under 0.01 bits to word sequences that spell the same text', () => {
    for (const language of ['en', 'tr']) {
      const words = new Set(WORD_LISTS[language]);
      const longest = Math.max(...WORD_LISTS[language].map((word) => word.length));
      for (const count of [6, MAX_WORDS]) {
        const source = seededSource(99);
        let lost = 0;
        for (let sample = 0; sample < SAMPLES; sample += 1) {
          const text = generatePassphrase({ ...PLAIN, language, words: count, separator: '' }, source);
          const ways = splits(text, count, words, longest);
          assert.ok(ways >= 1, text);
          lost += Math.log2(ways);
        }
        assert.ok(lost / SAMPLES < 0.01, `${language}, ${count} words: ${lost / SAMPLES} bits`);
      }
    }
  });
});
