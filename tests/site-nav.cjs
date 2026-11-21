#!/usr/bin/env node
/* Site navigation, node part (specs/site-navigation.md):
 * generator drift (--check), data, subtopic stubs, the include in every live page,
 * the auto-link matcher, and the home page's subtopic contract (source needles).
 * Browser behaviour: tests/site-nav-browser.cjs. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const assert = require('assert/strict');

const root = path.resolve(__dirname, '..');
const gen = require('../scripts/build-site-nav.cjs');
const core = require('../site-nav.js');
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };

// 1. Generated files are current.
cp.execFileSync('node', [path.join(root, 'scripts/build-site-nav.cjs'), '--check'], { stdio: 'pipe' });
ok(true, 'build-site-nav --check');

// 2. Data matches the registry.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'site-nav-data.js'), 'utf8'), sandbox);
const data = JSON.parse(JSON.stringify(sandbox.window.SITE_NAV_DATA)); // out of the vm realm for deepEqual
const w = gen.loadRegistry();
const live = w.KNOWLEDGE_PAGES.filter((p) => p.status === 'live');
ok(data.pages.length === live.length, 'one data row per live page');
for (const p of live) {
  const row = data.pages.find((r) => r[1] === p.path);
  ok(row, 'data has ' + p.path);
  ok(row[2] === p.title.zh && row[3] === p.title.en, 'titles of ' + p.path);
  ok(row[4] === p.category && data.cats[p.category], 'category of ' + p.path);
  const registered = (w.KNOWLEDGE_SUBTOPICS[p.category] || []).some((s) => s.id === p.subtopic);
  ok(row[5] === (registered ? p.subtopic : ''), 'subtopic of ' + p.path + ' (empty when unregistered)');
}
// Pages without a registered subtopic (entrance pages, demos) get a two-level breadcrumb.
ok(data.pages.filter((r) => !r[5]).every((r) => r[1].split('/').filter(Boolean).length < 3), 'only entrance pages lack a subtopic');

// 3. One redirect stub per subtopic with live pages, same shape as computing/index.html.
for (const key of Object.keys(data.subs)) {
  const [cat, sub] = key.split('/');
  const html = fs.readFileSync(path.join(root, key, 'index.html'), 'utf8');
  const target = '../../?category=' + cat + '&subtopic=' + sub;
  ok(html.includes('<meta name="robots" content="noindex">'), key + ' stub is noindex');
  ok(html.includes('content="0; url=' + target.replace('&', '&amp;') + '"'), key + ' meta refresh');
  ok(html.includes('location.replace("' + target + '"'), key + ' location.replace');
  ok(!html.includes('page-provenance') && !html.includes('site-nav.js'), key + ' stub is not a page');
  ok(data.pages.some((r) => r[4] === cat && r[5] === sub), key + ' has live pages');
}
for (const r of data.pages) if (r[5]) ok(data.subs[r[4] + '/' + r[5]], 'stub listed for ' + r[1]);
ok(fs.readFileSync(path.join(root, 'computing/systems/index.html'), 'utf8').includes('?category=computing&subtopic=systems'), 'computing/systems stub');

// 4. Every live page includes the stylesheet and the deferred script exactly once, at the right depth.
for (const p of live) {
  const html = fs.readFileSync(path.join(root, p.path, 'index.html'), 'utf8');
  const up = '../'.repeat(p.path.split('/').filter(Boolean).length);
  const link = '<link rel="stylesheet" href="' + up + 'site-nav.css?v=' + gen.VERSION + '">';
  const script = '<script defer src="' + up + 'site-nav.js?v=' + gen.VERSION + '"></script>';
  ok(html.split(link).length === 2, p.path + ' links site-nav.css once');
  ok(html.split(script).length === 2, p.path + ' loads site-nav.js once');
  ok(html.lastIndexOf('<script') === html.indexOf(script), p.path + ' site-nav.js is the last script');
}
ok(!fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('site-nav.js'), 'home page does not load site-nav.js');

// 5. withInclude is idempotent and refuses ambiguous pages.
const sample = '<html><head><title>x</title></head><body><p>x</p></body></html>';
const once = gen.withInclude(sample, 'a/b/c/', 't');
ok(gen.withInclude(once, 'a/b/c/', 't') === once, 'include is idempotent');
ok(once.includes('href="../../../site-nav.css') && once.includes('src="../../../site-nav.js'), 'depth 3');
ok(gen.withInclude(sample, 'atlas/', 't').includes('src="../site-nav.js'), 'depth 1');
assert.throws(() => gen.withInclude('<body></body><body></body>', 'a/', 't')); n++;
ok(gen.withInclude('<head><body>x</body>', 'a/', 't').includes('site-nav.css?v=' + gen.VERSION + '">\n<body>'), 'no </head>: before <body>');

// 6. Matcher: exact full titles only, both languages, self-reference and exclusions skipped.
const fixture = {
  pages: [
    ['', 'computing/systems/what-a-drive-is-made-of/', '硬盘里到底是什么', 'What a Drive Is Made Of', 'computing', 'systems'],
    ['', 'computing/systems/switches-that-compute/', '一堆开关是怎么学会算数的', 'How a Pile of Switches Learned to Do Arithmetic', 'computing', 'systems'],
    ['', 'computing/graphics/graphics/', '计算机图形学 · 从坐标到画面', 'Computer Graphics · From Coordinates to Pixels', 'computing', 'graphics'],
    ['', 'computing/systems/how-cpu-caches-work/', 'CPU 的三级缓存是怎么工作的', "How a CPU's Three Levels of Cache Work", 'computing', 'systems'],
    ['', 'x/y/short/', '缓存', 'Cache', 'computing', 'systems'],
  ],
};
const m = core.buildMatcher(fixture);
const find = (text, self, ex) => core.findMatches(text, m, self, ex).map((r) => [text.substr(r.index, r.length), r.page.path]);
assert.deepEqual(find('姊妹篇《硬盘里到底是什么》第 7 章'), [['硬盘里到底是什么', 'computing/systems/what-a-drive-is-made-of/']]); n++;
assert.deepEqual(find('see “What a Drive Is Made Of”, chapter 7'), [['What a Drive Is Made Of', 'computing/systems/what-a-drive-is-made-of/']]); n++;
assert.deepEqual(find('the sister essay “What a Drive Is Made Of,” places'), [['What a Drive Is Made Of', 'computing/systems/what-a-drive-is-made-of/']]); n++;
assert.deepEqual(find('“How a CPU’s Three Levels of Cache Work” explained'), [['How a CPU’s Three Levels of Cache Work', 'computing/systems/how-cpu-caches-work/']]); n++;
assert.deepEqual(find('《一堆开关》第 9 章'), [], 'a shortened title does not link'); n++;
assert.deepEqual(find('教科书《计算机图形学》第三版'), [], 'a book title that is only part of a page title does not link'); n++;
assert.deepEqual(find('《硬盘里到底是什么呢》'), [], 'longer text does not link'); n++;
assert.deepEqual(find('硬盘里到底是什么，以及 What a Drive Is Made Of'), [], 'unquoted titles do not link'); n++;
assert.deepEqual(find("'What a Drive Is Made Of' and \"What a Drive Is Made Of\""), [], 'straight quotes do not link'); n++;
assert.deepEqual(find('“what a drive is made of”'), [], 'case must match'); n++;
assert.deepEqual(find('《缓存》和《CPU 的三级缓存是怎么工作的》'), [['缓存', 'x/y/short/'], ['CPU 的三级缓存是怎么工作的', 'computing/systems/how-cpu-caches-work/']]); n++;
assert.deepEqual(find('《硬盘里到底是什么》', 'computing/systems/what-a-drive-is-made-of/'), [], 'self-reference skipped'); n++;
assert.deepEqual(find('《硬盘里到底是什么》与《一堆开关是怎么学会算数的》', null, ['硬盘里到底是什么']).map((r) => r[0]), ['一堆开关是怎么学会算数的'], 'excluded title skipped'); n++;
ok(core.citeMatch(' What a Drive Is Made Of ', m, null, []).path === 'computing/systems/what-a-drive-is-made-of/', 'cite with exact title');
ok(core.citeMatch('What a Drive', m, null, []) === null, 'cite with partial title');
ok(core.citeMatch('硬盘里到底是什么', m, 'computing/systems/what-a-drive-is-made-of/', []) === null, 'cite self-reference');

// 7. Elements whose text is never linked (the DOM side is exercised by tests/site-nav-browser.cjs).
const src = fs.readFileSync(path.join(root, 'site-nav.js'), 'utf8');
const skip = (src.match(/var SKIP = ([^;]+);/) || [])[1] || '';
for (const sel of ['a,', 'h1,h2,h3,h4,h5,h6', 'button', 'input', 'select', 'textarea', 'svg', 'canvas', '.page-provenance', '[data-no-autolink]', '.site-nav']) {
  ok(skip.includes(sel), 'skip list has ' + sel);
}
ok(/observer\.disconnect\(\)[\s\S]*observer\.takeRecords\(\)/.test(src), 'own writes happen with the observer disconnected');
ok(/setTimeout\(function \(\) \{[\s\S]*run\(roots\);[\s\S]*\}, 60\)/.test(src), 're-runs are debounced');
for (const e of data.noAutolink) ok(data.pages.some((r) => r[1] === e[0]), 'noAutolink page exists: ' + e[0]);

// 8. Home page subtopic contract (specs/index-pagination.md).
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const needle of [
  "var sub = url.searchParams.get('subtopic');",
  "if (activeCat !== 'all' && activeSub !== 'all') url.searchParams.set('subtopic', activeSub);",
  '<nav id="crumbs" class="crumbs" hidden>',
  "var showHeads = activeSub === 'all' && Object.keys(used).length > 1;",
  'inlineSubtopicLink(link, activeCat, sub);',
  'return inView(c.page);',
  "crumbAll: '全部'", "crumbAll: 'All'",
]) ok(home.includes(needle), 'home: ' + needle);
ok(!home.includes('page-provenance'), 'home has no provenance label');

// 9. Floating chapter rail pure helpers and CSS/markup contract.
const mkAnchor = (href, text, spanText, bText, siblingText) => ({
  getAttribute: (k) => (k === 'href' ? href : null),
  textContent: text,
  querySelector: (sel) => {
    if (sel === 'span') return spanText != null ? { textContent: spanText, nextElementSibling: siblingText != null ? { textContent: siblingText } : null } : null;
    if (sel === 'b') return bText != null ? { textContent: bText } : null;
    return null;
  },
});
const mkDoc = ({ toc = [], step = [], ids = [] }) => {
  const idSet = new Set(ids);
  return {
    querySelectorAll: (sel) => (sel === 'nav.toc a[href^="#"]' ? toc : sel === 'nav.step-nav a[href^="#"]' ? step : []),
    getElementById: (id) => (idSet.has(id) ? { id } : null),
  };
};

assert.deepEqual(core.extractChapterSpecs(null), []); n++;
assert.deepEqual(core.extractChapterSpecs(mkDoc({ toc: [mkAnchor('#ch1', '01 One', '01', 'One')], ids: ['ch1'] })), [], '< 2 valid targets returns []'); n++;
assert.deepEqual(
  core.extractChapterSpecs(mkDoc({
    toc: [
      mkAnchor('#ch1', '01 场景图', '01', '场景图'),
      mkAnchor('#missing', '02 Missing', '02', 'Missing'),
      mkAnchor('#ch2', '02GPS', '02', null, 'GPS'),
      mkAnchor('#ch3', '03 Plain Text', '03', null, null),
      mkAnchor('#ch3', '03 Dup', '03', 'Dup'),
      mkAnchor('#', 'Empty', '', ''),
    ],
    step: [mkAnchor('#step0', '0 Hook')],
    ids: ['ch1', 'ch2', 'ch3', 'step0'],
  })),
  [
    { id: 'ch1', num: '01', text: '场景图' },
    { id: 'ch2', num: '02', text: 'GPS' },
    { id: 'ch3', num: '03', text: 'Plain Text' },
  ],
  'extractChapterSpecs prefers nav.toc, supports b / sibling span / text stripping, deduplicates, filters missing'
); n++;
assert.deepEqual(
  core.extractChapterSpecs(mkDoc({
    step: [
      mkAnchor('#step0', '0 钩子'),
      mkAnchor('#step1', '01  What Is a Wave? '),
      mkAnchor('#step2', 'Summary'),
    ],
    ids: ['step0', 'step1', 'step2'],
  })),
  [
    { id: 'step0', num: '0', text: '钩子' },
    { id: 'step1', num: '01', text: 'What Is a Wave?' },
    { id: 'step2', num: '3', text: 'Summary' },
  ],
  'extractChapterSpecs parses nav.step-nav digits and falls back cleanly'
); n++;

assert.equal(core.pickActiveChapter([], 0, 800, 3000), -1); n++;
assert.equal(core.pickActiveChapter([500], 0, 800, 3000), 0); n++;
assert.equal(core.pickActiveChapter([600, 1200, 1900], 0, 900, 3000), 0, 'top of page selects 0'); n++;
assert.equal(core.pickActiveChapter([100, 300, 500], 0, 900, 850), 0, 'short page at scrollY=0 still selects 0'); n++;
assert.equal(core.pickActiveChapter([-2000, -1000, 400], 2180, 800, 3000), 2, 'within 24px of bottom selects last'); n++;
assert.equal(core.pickActiveChapter([-600, 180, 900], 500, 900, 3000), 1, 'threshold clamps to 240 on 900px viewport'); n++;
assert.equal(core.pickActiveChapter([-600, 230, 900], 500, 900, 3000), 1, '230 <= 240 selects index 1'); n++;
assert.equal(core.pickActiveChapter([-600, 250, 900], 500, 900, 3000), 0, '250 > 240 keeps index 0'); n++;
assert.equal(core.pickActiveChapter([-400, 110, 500], 500, 320, 2000), 0, 'on 320px height viewport min threshold is 96 (110 > 96)'); n++;

assert.equal(core.formatRailLabel({ num: '03', text: '相机与投影' }, 'zh'), '03 · 相机与投影'); n++;
assert.equal(core.formatRailLabel({ num: '', text: 'Overview' }, 'en'), 'Overview'); n++;
assert.equal(core.formatRailLabel({ num: '01', text: '' }, 'zh'), '01'); n++;
assert.equal(core.formatRailLabel(null, 'en'), 'Chapters'); n++;
assert.equal(core.formatRailLabel(null, 'zh'), '目录'); n++;

const navCss = fs.readFileSync(path.join(root, 'site-nav.css'), 'utf8');
for (const needle of [
  'body.site-has-rail',
  'padding-left: 240px;',
  'body.site-has-rail.site-rail-collapsed',
  'body.site-has-rail .step-nav',
  'calc((100% - 920px)/2)',
  '.site-chapter-rail',
  '.site-chapter-fab',
  '.site-chapter-backdrop',
  '--rail-progress',
  'min-width: 48px;',
  'min-height: 48px;',
  '@media (min-width: 1180px)',
  '@media (max-width: 1179.98px)',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
  '@media print',
]) ok(navCss.includes(needle), 'site-nav.css has ' + needle);
ok(!navCss.includes('color-mix('), 'site-nav.css avoids color-mix for contrast check compatibility');
ok(src.indexOf('bootChapterRail();') < src.indexOf("hasAttribute('data-template')"), 'chapter rail boots before data-template early return');
ok(src.includes('aria-current') && src.includes('location') && src.includes('data-no-autolink'), 'rail sets aria-current="location" and data-no-autolink');

console.log(`PASS: site navigation (${n} checks; ${data.pages.length} pages, ${Object.keys(data.subs).length} subtopic stubs, ${data.noAutolink.length} auto-link exclusions)`);
