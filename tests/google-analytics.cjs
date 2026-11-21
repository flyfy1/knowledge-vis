'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {inject} = require('../scripts/inject-google-analytics.cjs');
const code = fs.readFileSync(path.join(__dirname, '../google-analytics.js'), 'utf8');
function browser(host = 'visual.integ.life', route = '/computing/systems/example/', embedded = false) {
  const scripts = [];
  const window = {location: {hostname: host, search: '?s=PRIVATE', hash: '#PRIVATE'}, dataLayer: []};
  window.self = window; window.top = embedded ? {} : window;
  const document = {currentScript: {getAttribute: () => route}, title: 'PRIVATE', referrer: 'PRIVATE', createElement: () => ({}), head: {appendChild: s => scripts.push(s)}};
  const ctx = vm.createContext({window, document});
  vm.runInContext(code, ctx); vm.runInContext(code, ctx);
  return {commands: window.dataLayer.map(c => Array.from(c)), scripts};
}
const production = browser();
assert.equal(production.scripts.length, 1);
assert.equal(production.commands.filter(c => c[1] === 'page_view').length, 1);
assert.equal(production.commands.find(c => c[0] === 'config')[2].send_page_view, false);
assert.equal(production.commands.find(c => c[0] === 'config')[2].allow_google_signals, false);
assert.equal(production.commands.find(c => c[1] === 'page_view')[2].page_location, 'https://visual.integ.life/computing/systems/example/');
assert.ok(!JSON.stringify(production).includes('PRIVATE'));
for (const host of ['localhost', 'preview.integ.life', 'visual.integ.life.evil.example']) assert.equal(browser(host).scripts.length, 0);
assert.equal(browser('visual.integ.life', '/', true).scripts.length, 0);
assert.equal(browser('visual.integ.life', '/?secret=x').scripts.length, 0);
fs.mkdirSync('/tmp/agent-tasks', {recursive: true});
const root = fs.mkdtempSync('/tmp/agent-tasks/visual-ga-test-');
try {
  fs.writeFileSync(path.join(root, 'google-analytics.js'), code);
  const pages = ['index.html', 'lesson/index.html', 'variants/claude-code/lesson/index.html', 'atlas/galaxy.html'];
  for (const file of pages) { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true}); fs.writeFileSync(path.join(root, file), '<html><head><title>Test</title></head><body>Same</body></html>'); }
  fs.writeFileSync(path.join(root, 'redirect.html'), '<head><meta http-equiv="refresh" content="0;url=/"></head>');
  fs.mkdirSync(path.join(root, 'tests')); fs.writeFileSync(path.join(root, 'tests/fixture.html'), '<head></head>');
  const first = inject(root); assert.equal(first.count, pages.length);
  const html = fs.readFileSync(path.join(root, 'lesson/index.html'), 'utf8');
  assert.ok(html.includes('data-page="/lesson/"'));
  inject(root); assert.equal(fs.readFileSync(path.join(root, 'lesson/index.html'), 'utf8'), html);
  assert.ok(!fs.readFileSync(path.join(root, 'redirect.html'), 'utf8').includes('google-analytics'));
  assert.ok(!fs.readFileSync(path.join(root, 'tests/fixture.html'), 'utf8').includes('google-analytics'));
  fs.writeFileSync(path.join(root, '.git'), 'gitdir: somewhere'); assert.throws(() => inject(root), /Git checkout/);
} finally { fs.rmSync(root, {recursive: true, force: true}); }
console.log('GA privacy, host/frame guards, deduplication and publication coverage passed.');
