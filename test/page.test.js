import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';

import { HISTORY_LIMIT, MODES } from '../src/app.js';
import { LANGUAGES, STRINGS } from '../src/i18n.js';
import { CAPITALIZATIONS, WORD_LISTS } from '../src/passphrase.js';
import { SET_IDS } from '../src/password.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../index.html');
const body = html.slice(html.indexOf('<body'));
const sources = Object.fromEntries(
  readdirSync(new URL('../src/', import.meta.url)).map((name) => [name, stripComments(read(`../src/${name}`))]),
);
const UI_MODULES = ['main.js', 'view.js', 'clipboard.js'];
/** Word and password lists: data, not code, so they are left out of the code scans. */
const DATA_MODULE = /^(words-|common-)/;
const code = Object.entries(sources).filter(([name]) => !DATA_MODULE.test(name));
const PAGE_URL = 'https://celaldrg.github.io/password-generator/';
const TRANSLATED_ATTRIBUTES = ['aria-label', 'placeholder', 'title'];

/** Language-neutral text that may stay untranslated: symbols, keys and samples. */
const NEUTRAL_TEXT = new Set(['MIT', '·', 'R', 'C', '1', '2', 'a–z', 'A–Z', '0–9', '!@#$%^*', 'I l 1 O 0']);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const decode = (text) => text.replace(/&(amp|lt|gt|quot|#39);/g, (_, name) => ENTITIES[name]);
const squash = (text) => decode(text).replace(/\s+/g, ' ').trim();

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** Every start tag of the page with its attributes and where its content starts. */
function startTags(source) {
  return Array.from(source.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi), (match) => ({
    name: match[1].toLowerCase(),
    attrs: Object.fromEntries(
      Array.from(match[2].matchAll(/([\w:-]+)="([^"]*)"/g), ([, name, value]) => [name, decode(value)]),
    ),
    end: match.index + match[0].length,
  }));
}

const tags = startTags(html);
const bodyTags = startTags(body);
const ids = tags.map((tag) => tag.attrs.id).filter(Boolean);
const hasKey = (key) => LANGUAGES.every((language) => Object.hasOwn(STRINGS[language], key));
const optionValues = (selectId) =>
  Array.from(
    html.match(new RegExp(`<select[^>]*id="${selectId}"[^>]*>([\\s\\S]*?)</select>`))[1].matchAll(/value="([^"]+)"/g),
    ([, value]) => value,
  );

describe('index.html', () => {
  it('has the required head', () => {
    const meta = (attr, value) => tags.find((tag) => tag.name === 'meta' && tag.attrs[attr] === value)?.attrs.content;
    assert.match(html, /^<!doctype html>/i);
    assert.ok(tags.some((tag) => tag.name === 'html' && tag.attrs.lang === 'en'));
    assert.ok(tags.some((tag) => tag.name === 'meta' && tag.attrs.charset === 'utf-8'));
    assert.equal(meta('name', 'viewport'), 'width=device-width, initial-scale=1');
    assert.equal(html.match(/<title>([^<]*)<\/title>/)[1], STRINGS.en['app.title']);
    assert.ok(meta('name', 'description').length > 50);
    assert.equal(meta('property', 'og:title'), STRINGS.en['app.title']);
    assert.ok(meta('property', 'og:description').length > 50);
    assert.equal(meta('property', 'og:url'), PAGE_URL);
    assert.equal(meta('property', 'og:image'), `${PAGE_URL}docs/screenshot.png`);
    const icon = tags.find((tag) => tag.name === 'link' && tag.attrs.rel === 'icon');
    assert.ok(icon.attrs.href.startsWith('data:image/svg+xml,'));
    const scripts = tags.filter((tag) => tag.name === 'script');
    assert.deepEqual(scripts.map((tag) => tag.attrs), [{ type: 'module', src: 'src/main.js' }]);
  });

  it('loads nothing from other sites and has no inline code or styles', () => {
    for (const tag of tags) {
      for (const attr of ['src', 'href']) {
        const url = tag.attrs[attr];
        if (url === undefined || (tag.name === 'a' && attr === 'href')) continue;
        assert.ok(!/^(https?:)?\/\//.test(url), `<${tag.name} ${attr}="${url}">`);
      }
      assert.ok(!Object.hasOwn(tag.attrs, 'style'), `<${tag.name}> has a style attribute`);
      for (const attr of Object.keys(tag.attrs)) assert.doesNotMatch(attr, /^on/, `<${tag.name} ${attr}>`);
    }
    assert.doesNotMatch(html, /<style/);
    assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/);
  });

  it('has unique ids, and every id reference points at one', () => {
    assert.equal(new Set(ids).size, ids.length);
    for (const tag of tags) {
      for (const attr of ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby']) {
        for (const id of tag.attrs[attr]?.split(/\s+/) ?? []) assert.ok(ids.includes(id), `${attr}="${id}"`);
      }
    }
  });

  it('has an element for every id the UI looks up', () => {
    const wanted = Array.from(sources['main.js'].matchAll(/byId\('([^']+)'\)/g), ([, id]) => id);
    assert.ok(wanted.length > 30);
    for (const id of wanted) assert.ok(ids.includes(id), id);
  });

  it('offers exactly the modes, sets and options the logic knows', () => {
    const tabs = tags.filter((tag) => tag.attrs.role === 'tab').map((tag) => tag.attrs['data-mode']);
    assert.deepEqual(tabs, [...MODES]);
    const sets = tags.filter((tag) => tag.attrs['data-set']).map((tag) => tag.attrs['data-set']);
    assert.deepEqual(sets, SET_IDS.filter((id) => id !== 'custom'));
    assert.deepEqual(optionValues('capitalization'), [...CAPITALIZATIONS]);
    assert.deepEqual(optionValues('word-list'), Object.keys(WORD_LISTS));
  });

  it('keeps every password field in a form that never submits', () => {
    const passwords = tags.filter((tag) => tag.name === 'input' && tag.attrs.type === 'password');
    assert.ok(passwords.length > 0);
    for (const field of passwords) {
      const before = html.slice(0, field.end);
      assert.ok(before.lastIndexOf('<form') > before.lastIndexOf('</form>'), field.attrs.id);
    }
    assert.ok(sources['main.js'].includes("addEventListener('submit', (event) => event.preventDefault())"));
  });

  it('links to the source code', () => {
    assert.ok(tags.some((tag) => tag.name === 'a' && tag.attrs.href === 'https://github.com/celaldrg/password-generator'));
  });
});

describe('page translations', () => {
  it('have both languages for every key the page uses', () => {
    const keys = bodyTags.flatMap((tag) =>
      ['data-i18n', ...TRANSLATED_ATTRIBUTES.map((attr) => `data-i18n-${attr}`)]
        .map((attr) => tag.attrs[attr])
        .filter(Boolean),
    );
    assert.ok(keys.length > 50, `${keys.length} keys`);
    for (const key of keys) assert.ok(hasKey(key), key);
  });

  it('use the English text as the fallback in the HTML', () => {
    for (const tag of bodyTags) {
      const key = tag.attrs['data-i18n'];
      if (key) {
        const next = body.indexOf('<', tag.end);
        assert.ok(body.startsWith(`</${tag.name}>`, next), `${key}: text only, no child elements`);
        assert.equal(squash(body.slice(tag.end, next)), STRINGS.en[key], key);
      }
      for (const attr of TRANSLATED_ATTRIBUTES) {
        const attrKey = tag.attrs[`data-i18n-${attr}`];
        if (attrKey) assert.equal(tag.attrs[attr], STRINGS.en[attrKey], `${attr}: ${attrKey}`);
      }
    }
  });

  it('leave no visible text untranslated', () => {
    const leftovers = body
      .replace(/<(svg|template|noscript|script)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<([a-z0-9]+)\b[^>]*\sdata-i18n="[^"]*"[^>]*>[^<]*<\/\1>/gi, ' ')
      .split(/<[^>]*>/)
      .map(squash)
      .filter(Boolean);
    for (const text of leftovers) assert.ok(NEUTRAL_TEXT.has(text), `untranslated: "${text}"`);
  });

  it('cover every key the UI modules ask for', () => {
    const keys = UI_MODULES.flatMap((name) =>
      Array.from(sources[name].matchAll(/'([a-z]+(?:\.[a-zA-Z]+)+)'/g), ([, key]) => key),
    ).filter((key) => !key.endsWith('.js'));
    assert.ok(keys.length > 10);
    for (const key of keys) assert.ok(hasKey(key), key);
    for (const mode of MODES) assert.ok(hasKey(`output.${mode}`) && hasKey(`tab.${mode}`), mode);
  });

  it('describe the history with its real size', () => {
    for (const language of LANGUAGES) assert.match(STRINGS[language]['history.note'], new RegExp(`\\b${HISTORY_LIMIT}\\b`));
  });
});

describe('source code', () => {
  it('never sends anything over the network', () => {
    for (const [name, text] of code) {
      assert.doesNotMatch(text, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/, name);
    }
  });

  it('never builds markup from strings, evaluates code or logs', () => {
    for (const [name, text] of code) {
      assert.doesNotMatch(text, /\b(innerHTML|outerHTML|insertAdjacentHTML|eval|document\.write)\b/, name);
      assert.doesNotMatch(text, /\bnew Function\b|\bconsole\./, name);
    }
  });

  it('touches localStorage only through the storage module', () => {
    for (const [name, text] of code) {
      if (name !== 'storage.js') assert.doesNotMatch(text, /localStorage|sessionStorage|indexedDB/, name);
    }
  });
});
