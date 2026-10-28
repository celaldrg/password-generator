import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MODES } from '../src/app.js';
import { SWIPE_DISTANCE, isSwipe, isTypingTarget, shortcutAction, tabAfterKey } from '../src/input.js';

describe('shortcutAction', () => {
  it('maps R, C, 1 and 2 to their actions, in either case', () => {
    assert.equal(shortcutAction({ key: 'r' }), 'regenerate');
    assert.equal(shortcutAction({ key: 'R' }), 'regenerate');
    assert.equal(shortcutAction({ key: 'c' }), 'copy');
    assert.equal(shortcutAction({ key: '1' }), 'password');
    assert.equal(shortcutAction({ key: '2' }), 'passphrase');
  });

  it('ignores other keys, including names inherited from Object', () => {
    for (const key of ['x', 'Enter', ' ', '3', 'constructor', 'toString', '__proto__', '']) {
      assert.equal(shortcutAction({ key }), null, key);
    }
    assert.equal(shortcutAction({ key: undefined }), null);
  });

  it('leaves modifier keys, auto-repeat and typing alone', () => {
    for (const flag of ['ctrlKey', 'metaKey', 'altKey', 'repeat', 'typing']) {
      assert.equal(shortcutAction({ key: 'c', [flag]: true }), null, flag);
    }
    assert.equal(shortcutAction({ key: 'R', ctrlKey: false, repeat: false, typing: false }), 'regenerate');
  });
});

describe('isTypingTarget', () => {
  it('is true for text-like inputs, textareas, selects and editable elements', () => {
    const targets = [
      { tagName: 'INPUT', type: 'text' },
      { tagName: 'INPUT', type: 'password' },
      { tagName: 'input', type: 'number' },
      { tagName: 'INPUT', type: 'Search' },
      { tagName: 'INPUT' },
      { tagName: 'TEXTAREA' },
      { tagName: 'SELECT' },
      { tagName: 'DIV', isContentEditable: true },
    ];
    for (const target of targets) assert.equal(isTypingTarget(target), true, JSON.stringify(target));
  });

  it('is false for buttons, checkboxes, sliders and the page itself', () => {
    const targets = [
      null,
      undefined,
      {},
      { tagName: 'BUTTON' },
      { tagName: 'BODY' },
      { tagName: 'INPUT', type: 'checkbox' },
      { tagName: 'INPUT', type: 'range' },
    ];
    for (const target of targets) assert.equal(isTypingTarget(target), false, JSON.stringify(target));
  });
});

describe('isSwipe', () => {
  it('needs enough sideways travel in either direction', () => {
    assert.equal(isSwipe(SWIPE_DISTANCE, 0), true);
    assert.equal(isSwipe(-SWIPE_DISTANCE, 0), true);
    assert.equal(isSwipe(SWIPE_DISTANCE - 1, 0), false);
    assert.equal(isSwipe(0, 0), false);
  });

  it('ignores movements that are mostly vertical, like scrolling', () => {
    assert.equal(isSwipe(60, 29), true);
    assert.equal(isSwipe(60, 30), false);
    assert.equal(isSwipe(10, 200), false);
    assert.equal(isSwipe(-80, -50), false);
  });
});

describe('tabAfterKey', () => {
  it('moves with the arrow keys and wraps around', () => {
    assert.equal(tabAfterKey(MODES, 'password', 'ArrowRight'), 'passphrase');
    assert.equal(tabAfterKey(MODES, 'passphrase', 'ArrowRight'), 'password');
    assert.equal(tabAfterKey(MODES, 'password', 'ArrowLeft'), 'passphrase');
    assert.equal(tabAfterKey(MODES, 'passphrase', 'ArrowLeft'), 'password');
  });

  it('jumps to the ends with Home and End and ignores other keys', () => {
    assert.equal(tabAfterKey(MODES, 'passphrase', 'Home'), 'password');
    assert.equal(tabAfterKey(MODES, 'password', 'End'), 'passphrase');
    for (const key of ['Enter', ' ', 'ArrowDown', 'Tab']) assert.equal(tabAfterKey(MODES, 'password', key), null);
  });

  it('treats an unknown current tab as the first one', () => {
    assert.equal(tabAfterKey(MODES, 'pin', 'ArrowRight'), 'passphrase');
  });
});
