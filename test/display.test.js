import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  METER_FULL_BITS,
  charKinds,
  feedbackTone,
  meterPercent,
  timeTone,
  valueSize,
} from '../src/display.js';
import { STRENGTH_THRESHOLDS, strengthFromBits } from '../src/entropy.js';
import { FEEDBACK_KEYS } from '../src/strength.js';

const DAY = 24 * 60 * 60;
const CENTURY = 100 * 365.2425 * DAY;

describe('charKinds', () => {
  it('tags letters, digits and symbols, one entry per code point', () => {
    assert.deepEqual(
      charKinds('aZ9!ç ').map(({ kind }) => kind),
      ['letter', 'letter', 'digit', 'symbol', 'letter', 'symbol'],
    );
    assert.deepEqual(charKinds('€😀'), [
      { char: '€', kind: 'symbol' },
      { char: '😀', kind: 'symbol' },
    ]);
    assert.deepEqual(charKinds(''), []);
  });

  it('gives back the original text when joined', () => {
    const text = 'Gç-4!😀x';
    assert.equal(charKinds(text).map(({ char }) => char).join(''), text);
  });
});

describe('meterPercent', () => {
  it('gives each strength score a fifth of the bar', () => {
    assert.deepEqual(
      [0, ...STRENGTH_THRESHOLDS, METER_FULL_BITS].map(meterPercent),
      [0, 20, 40, 60, 80, 100],
    );
    assert.equal(meterPercent(14), 10);
    assert.equal(meterPercent(48), 50);
  });

  it('fills the band of the label it agrees with', () => {
    for (let bits = 0.5; bits < METER_FULL_BITS; bits += 0.5) {
      const { score } = strengthFromBits(bits);
      const percent = meterPercent(bits);
      assert.ok(percent >= score * 20 && percent <= (score + 1) * 20, `${bits} bits: ${percent}%`);
    }
  });

  it('grows with the bits and stays between 0 and 100', () => {
    let previous = 0;
    for (let bits = 0; bits <= 200; bits += 0.25) {
      const percent = meterPercent(bits);
      assert.ok(percent >= previous, `${bits} bits`);
      previous = percent;
    }
    for (const bits of [500, Infinity]) assert.equal(meterPercent(bits), 100);
    for (const bits of [-5, NaN, undefined]) assert.equal(meterPercent(bits), 0);
  });
});

describe('timeTone', () => {
  it('is bad under a day, fair under a century and good beyond', () => {
    assert.equal(timeTone(0), 'bad');
    assert.equal(timeTone(DAY - 1), 'bad');
    assert.equal(timeTone(DAY), 'fair');
    assert.equal(timeTone(CENTURY - 1), 'fair');
    assert.equal(timeTone(CENTURY), 'good');
    assert.equal(timeTone(Infinity), 'good');
    assert.equal(timeTone(NaN), 'bad');
  });
});

describe('feedbackTone', () => {
  it('marks praise, the two tips and the empty hint apart from warnings', () => {
    assert.equal(feedbackTone('feedback.strong'), 'good');
    assert.equal(feedbackTone('feedback.useGenerator'), 'tip');
    assert.equal(feedbackTone('feedback.longer'), 'tip');
    assert.equal(feedbackTone('feedback.empty'), 'info');
    const others = FEEDBACK_KEYS.filter(
      (key) =>
        !['feedback.strong', 'feedback.useGenerator', 'feedback.longer', 'feedback.empty'].includes(key),
    );
    assert.ok(others.length > 0);
    for (const key of others) assert.equal(feedbackTone(key), 'warn', key);
  });
});

describe('valueSize', () => {
  it('draws longer values smaller', () => {
    const cases = [
      [0, 'xl'],
      [24, 'xl'],
      [25, 'lg'],
      [40, 'lg'],
      [41, 'md'],
      [64, 'md'],
      [65, 'sm'],
      [128, 'sm'],
    ];
    for (const [length, size] of cases) assert.equal(valueSize(length), size, `length ${length}`);
  });
});
