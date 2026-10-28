import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GUESS_RATES, STRENGTH_LABELS } from '../src/entropy.js';
import { generatePassword } from '../src/password.js';
import { seededSource } from '../src/random.js';
import { FEEDBACK_KEYS, MAX_ANALYZED_LENGTH, estimateStrength } from '../src/strength.js';

const check = (password) => estimateStrength(password, { referenceYear: 2026 });
const RANDOM_20 = generatePassword({ length: 20 }, seededSource(7));

/** Each example and feedback keys it must get. */
const PATTERNS = [
  ['password', ['feedback.common', 'feedback.oneClass', 'feedback.short']],
  ['qwerty123', ['feedback.common']],
  ['11111111', ['feedback.repeat', 'feedback.oneClass']],
  ['Ankara1923', ['feedback.word', 'feedback.date', 'feedback.capitalization']],
  ['abcdefgh', ['feedback.sequence']],
  ['98765432', ['feedback.sequence']],
  ['asdfghjk', ['feedback.keyboard']],
  ['poiuytre', ['feedback.keyboard']],
  ['19.05.1919', ['feedback.date']],
  ['19051919', ['feedback.date']],
  ['2024-03-15', ['feedback.date']],
  ['P@ssw0rd', ['feedback.leet']],
  ['drowssap', ['feedback.reversed']],
  ['abcabcabc', ['feedback.repeat']],
  ['Xk9#', ['feedback.short']],
];

/** Passwords made famous by comics, films and security guides. */
const FAMOUS = ['correcthorsebatterystaple', 'CorrectHorseBatteryStaple', 'Tr0ub4dor&3', 'hunter2', 'swordfish', 'opensesame'];

describe('estimateStrength', () => {
  it('rates a random 20-character password as very strong', () => {
    const result = check(RANDOM_20);
    assert.equal(result.score, 4);
    assert.equal(result.label, STRENGTH_LABELS[4]);
    assert.ok(result.bits > 100, `${result.bits} bits`);
    assert.deepEqual(result.feedback, ['feedback.strong']);
  });

  for (const weak of ['password', 'qwerty123', '11111111', 'Ankara1923']) {
    it(`rates "${weak}" below a random 20-character string`, () => {
      const result = check(weak);
      const random = check(RANDOM_20);
      assert.ok(result.score < random.score, `score ${result.score}`);
      assert.ok(result.score <= 1, `score ${result.score}`);
      assert.ok(result.bits < random.bits - 50, `${result.bits} bits`);
      assert.ok(!result.feedback.includes('feedback.strong'));
    });
  }

  for (const [password, keys] of PATTERNS) {
    it(`explains "${password}"`, () => {
      const { feedback } = check(password);
      for (const key of keys) assert.ok(feedback.includes(key), `${key} missing in [${feedback}]`);
    });
  }

  for (const famous of FAMOUS) {
    it(`knows the famous example "${famous}"`, () => {
      const result = check(famous);
      assert.ok(result.score <= 1, `score ${result.score}`);
      assert.ok(result.feedback.includes('feedback.common'), `[${result.feedback}]`);
    });
  }

  it('finds common words and first names, English and Turkish', () => {
    for (const password of ['michael1', 'Jennifer88', 'mehmet1985', 'Ayse2010!', 'London2024']) {
      const result = check(password);
      assert.ok(result.feedback.includes('feedback.word'), `${password}: [${result.feedback}]`);
      assert.ok(result.score <= 1, `${password}: score ${result.score}`);
    }
    const spaced = check('correct horse battery staple');
    assert.ok(spaced.feedback.includes('feedback.word'), `[${spaced.feedback}]`);
    assert.ok(spaced.score < 4, `score ${spaced.score}`);
  });

  it('always gives feedback, and a score-3 password a way to reach 4', () => {
    const source = seededSource(31);
    const scores = new Set();
    for (let i = 0; i < 2000; i += 1) {
      const sets = {
        lower: source() % 2 === 0,
        upper: source() % 2 === 0,
        digits: source() % 2 === 0,
        symbols: source() % 2 === 0,
      };
      if (!Object.values(sets).some(Boolean)) sets.lower = true;
      const password = generatePassword({ ...sets, custom: '', length: 4 + (source() % 21) }, source);
      const { score, feedback } = check(password);
      scores.add(score);
      assert.ok(feedback.length > 0, password);
      if (score === 4) assert.deepEqual(feedback, ['feedback.strong'], password);
      if (score === 3) {
        // One hint shows the way to 4: a short password gets only the length one.
        const hints = ['feedback.short', 'feedback.longer'].filter((key) => feedback.includes(key));
        assert.equal(hints.length, 1, `${password}: [${feedback}]`);
      }
      if (score <= 2) assert.ok(feedback.includes('feedback.useGenerator'), `${password}: [${feedback}]`);
    }
    assert.equal(scores.size, 5);
    assert.deepEqual(check('F4JSWQ4WC847B').feedback, ['feedback.longer']);
    assert.deepEqual(check('xK9#mQ2$vL').feedback, ['feedback.short']);
  });

  it('returns only known feedback keys, in display order', () => {
    for (const password of [...PATTERNS.map(([text]) => text), RANDOM_20, '', 'Summer2024!']) {
      const positions = check(password).feedback.map((key) => FEEDBACK_KEYS.indexOf(key));
      assert.ok(
        positions.every((position) => position >= 0),
        password,
      );
      assert.deepEqual(
        positions,
        [...positions].sort((a, b) => a - b),
        password,
      );
    }
  });

  it('handles empty input', () => {
    const result = check('');
    assert.equal(result.score, 0);
    assert.equal(result.bits, 0);
    assert.equal(result.length, 0);
    assert.equal(result.label, STRENGTH_LABELS[0]);
    assert.deepEqual(result.feedback, ['feedback.empty']);
    assert.deepEqual(estimateStrength(undefined).feedback, ['feedback.empty']);
  });

  it('folds Turkish letters and letter case', () => {
    for (const password of ['şifre', 'Şifre', 'ŞİFRE', 'sifre', 'PAROLA']) {
      const result = check(password);
      assert.ok(result.feedback.includes('feedback.common'), password);
      assert.equal(result.score, 0, password);
    }
  });

  it('prices years near the reference year lower', () => {
    const near = estimateStrength('2025', { referenceYear: 2026 }).bits;
    const far = estimateStrength('2025', { referenceYear: 1900 }).bits;
    assert.ok(near < far, `${near} vs ${far}`);
  });

  it('scores longer random passwords higher', () => {
    const short = check(generatePassword({ length: 6 }, seededSource(8)));
    const long = check(generatePassword({ length: 14 }, seededSource(8)));
    assert.ok(short.bits < long.bits);
    assert.ok(short.score < long.score);
  });

  it('returns crack times for every attack scenario', () => {
    assert.deepEqual(
      check('password').crackTimes.map((time) => time.id),
      GUESS_RATES.map((rate) => rate.id),
    );
  });

  it('analyses at most 256 characters, quickly', () => {
    const started = performance.now();
    assert.equal(check('x'.repeat(1000)).length, MAX_ANALYZED_LENGTH);
    check('ab'.repeat(200));
    check(generatePassword({ length: 128 }, seededSource(9)).repeat(2));
    check(generatePassword({ length: 128 }, seededSource(10)) + generatePassword({ length: 128 }, seededSource(11)));
    assert.ok(performance.now() - started < 5000);
  });
});
