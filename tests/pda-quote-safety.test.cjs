'use strict';
const { readFileSync } = require('node:fs');
const { Script } = require('node:vm');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = readFileSync(path.join(__dirname, '..', 'Torn-Company-Helper.user.js'), 'utf8');

test('Torn PDA source begins with a valid userscript metadata block', () => {
  assert.ok(source.startsWith('// ==UserScript==\n'));
  assert.match(source.slice(0, 1500), /^\/\/ @version\s+\d+\.\d+\.\d+/m);
  assert.match(source.slice(0, 2000), /^\/\/ @match\s+https:\/\/www\.torn\.com\/\*/m);
  assert.ok(source.indexOf('// ==/UserScript==') > 0);
});

test('Reject smart quotes that may be straightened by Torn PDA injection', () => {
  assert.doesNotMatch(source, /[\u2018\u2019\u201c\u201d]/u,
    'Smart quotes can turn otherwise valid single-quoted strings into pre-execution SyntaxError');
});

test('Exact full source parses after typographic quote normalisation', () => {
  assert.doesNotThrow(() => new Script(source, { filename: 'userscript.original.js' }));
  const normalised = source.replace(/[\u2018\u2019]/gu, "'").replace(/[\u201c\u201d]/gu, '"');
  assert.doesNotThrow(() => new Script(normalised, { filename: 'userscript.normalised.js' }));
});

