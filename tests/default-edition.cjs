#!/usr/bin/env node
'use strict';
// The default-edition switch (specs/claude-code-editions.md「默认版本」):
//   1. the resolver in pages.config.js: truth table switch × has-edition × pinned;
//   2. the registry: build-registry.cjs detects variants/claude-code/<slug>/ and writes editions / the pin into the
//      generated rows and site-registry.json; a page.json pin and a page-provenance.json pin; --check catches drift;
//      bad values are build errors (scratch copies of tests/fixtures/site-template/, removed at the end);
//   3. the template build: [[slug]] follows the switch, [[slug#anchor]] stays canonical, links to an edition still count
//      as links to the page (backlinks, registry edges);
//   4. site-nav-data.js: the resolver copied from pages.config.js, and every page's auto-link target agrees with the
//      build helper, under the switch and under "original";
//   5. the real registry: which pages have an edition, which are pinned and why.
//   node tests/default-edition.cjs
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const ED = require(path.join(repo, 'scripts', 'lib', 'editions.cjs'));
const REG = require(path.join(repo, 'scripts', 'lib', 'registry.cjs'));
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };
const read = (root, f) => fs.readFileSync(path.join(root, f), 'utf8');
const write = (root, f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };
const json = (root, f) => JSON.parse(read(root, f));

/* 1. The resolver, as pages.config.js defines it. */
const cfg = REG.readConfig(repo).window;
const resolve = cfg.knowledgeEditionPath;
ok(typeof resolve === 'function', 'pages.config.js defines window.knowledgeEditionPath');
ok(ED.SWITCH_VALUES.includes(cfg.KNOWLEDGE_DEFAULT_EDITION), 'KNOWLEDGE_DEFAULT_EDITION is a known value: ' + cfg.KNOWLEDGE_DEFAULT_EDITION);
{
  const canon = 'cat/sub/x/', alt = 'variants/claude-code/x/';
  const row = (has, pinned) => Object.assign({ slug: 'x', path: canon }, has ? { editions: { 'claude-code': alt } } : {}, pinned ? { defaultEdition: 'original' } : {});
  for (const sw of ['claude-code', 'original', undefined, null, 'unknown-edition']) for (const has of [true, false]) for (const pinned of [true, false]) {
    const want = sw === 'claude-code' && has && !pinned ? alt : canon;
    eq(resolve(row(has, pinned), sw), want, `switch ${sw} · edition ${has} · pinned ${pinned}`);
  }
  eq(resolve({ path: canon, editions: { 'claude-code': alt }, defaultEdition: 'claude-code' }, 'claude-code'), alt, 'only "original" pins');
  eq(ED.defaultPath(cfg, row(true, false)), cfg.KNOWLEDGE_DEFAULT_EDITION === 'claude-code' ? alt : canon, 'the build helper calls the same function with the configured switch');
  eq(ED.defaultPath({}, row(true, false)), canon, 'a site without a resolver (the fixture) links canonical paths');
}

/* 2–3. The registry and the template build on scratch copies of the fixture site. */
const fixture = path.join(__dirname, 'fixtures', 'site-template');
const base = fs.existsSync('/tmp/agent-tasks') ? '/tmp/agent-tasks' : os.tmpdir();
const scratch = fs.mkdtempSync(path.join(base, 'default-edition-test-'));
const reg = (root, ...a) => {
  const r = spawnSync('node', [path.join(repo, 'scripts', 'build-registry.cjs'), '--root', root, ...a], { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};
const SWITCH = sw => `window.KNOWLEDGE_DEFAULT_EDITION = ${JSON.stringify(sw)};\nwindow.knowledgeEditionPath = ${String(resolve)};\n`;
function site(sw) {
  const d = fs.mkdtempSync(path.join(scratch, 'site-'));
  fs.cpSync(fixture, d, { recursive: true });
  // the fixture's rows, made registry rows (desc, tags) so --adopt can move them into page.json files
  const w = {}; vm.runInNewContext(read(d, 'pages.config.js'), { window: w });
  const rows = w.KNOWLEDGE_PAGES.map(r => {
    // a template essay's title and desc live in its content; the row must agree with them
    const c = fs.existsSync(path.join(d, r.path, 'content.zh.md')) ? REG.contentText(path.join(d, r.path), [], r.slug) : null;
    return Object.assign({}, r, { desc: c ? c.desc : { zh: '说明', en: 'About' }, tags: [] }, c ? { title: c.title } : {});
  });
  write(d, 'pages.config.js', 'window.KNOWLEDGE_CATEGORIES = ' + JSON.stringify(w.KNOWLEDGE_CATEGORIES) + ';\n' +
    'window.KNOWLEDGE_STAGES = [{ id: "university", name: { zh: "大学", en: "University" } }];\n' +
    'window.KNOWLEDGE_SUBTOPICS = ' + JSON.stringify(w.KNOWLEDGE_SUBTOPICS) + ';\n' + (sw === null ? '' : SWITCH(sw)) +
    'window.KNOWLEDGE_PAGES = ' + JSON.stringify(rows, null, 2) + ';\n');
  const a = reg(d, '--adopt');
  assert.equal(a.code, 0, a.out);
  return d;
}
const rowsOf = root => { const w = {}; vm.runInNewContext(read(root, 'pages.config.js'), { window: w }); return Object.fromEntries(JSON.parse(JSON.stringify(w.KNOWLEDGE_PAGES)).map(r => [r.slug, r])); };
const VARIANT = 'variants/claude-code/fixture-target/index.html';

try {
  const root = site('claude-code');
  {
    let rows = rowsOf(root);
    ok(!('editions' in rows['fixture-target']), 'no variant directory: no editions in the row');
    write(root, VARIANT, '<!doctype html><title>variant</title><p><a href="../../../demo/basics/fixture-target/">original</a></p>\n');
    const c = reg(root, '--check');
    ok(c.code === 1 && /site registry is out of date: .*pages\.config\.js/.test(c.out) && /fixture-target.*differs.*editions/.test(c.out), '--check catches a new variant directory:\n' + c.out);
    ok(reg(root).code === 0 && reg(root, '--check').code === 0, 'regenerating takes it in');
    rows = rowsOf(root);
    eq(rows['fixture-target'].editions, { 'claude-code': 'variants/claude-code/fixture-target/' }, 'the row carries the detected edition');
    ok(!('defaultEdition' in rows['fixture-target']) && !('editions' in rows['fixture-essay']), 'not pinned; a page without a variant has no editions');
    ok(read(root, 'pages.config.js').includes('path: "demo/basics/fixture-target/",\n    editions: { "claude-code": "variants/claude-code/fixture-target/" }\n  }'), 'the editions line in the generated block');
    const R = json(root, 'site-registry.json').pages['fixture-target'];
    ok(R.href === 'variants/claude-code/fixture-target/' && R.editions['claude-code'] && !R.pinnedBy, 'site-registry.json: editions and where page links go');

    // 3. the template build of the essay on this site
    const T = require(path.join(repo, 'scripts', 'lib', 'template.cjs'));
    const S = T.createSite(root);
    const ctx = { site: S, page: S.bySlug.get('fixture-essay'), lang: 'zh', ownAnchors: new Set(['ch2']) };
    eq(T.renderInline('[[fixture-target]]', ctx), '<a href="../../../variants/claude-code/fixture-target/">被引用的页面</a>', '[[slug]] follows the switch');
    eq(T.renderInline('[[fixture-target#ch2|x]]', ctx), '<a href="../fixture-target/#ch2">x</a>', '[[slug#anchor]] stays on the canonical edition');
    eq(T.resolveHref(S, 'demo/basics/fixture-essay/', '../../../variants/claude-code/fixture-target/'), [S.bySlug.get('fixture-target'), null], 'a link to the edition resolves to the page (backlinks, registry edges)');
    eq(T.unrenderInline('<a href="../../../variants/claude-code/fixture-target/">被引用的页面</a>', ctx), '[[fixture-target]]', 'the converter turns the rendered link back into [[slug]]');
    const before = JSON.stringify(json(root, 'site-registry.json').edges);
    write(root, 'demo/basics/fixture-essay/content.zh.md', read(root, 'demo/basics/fixture-essay/content.zh.md').replace('本页第 2 章见[[#ch2|下一章]]。', '本页第 2 章见[[#ch2|下一章]]，另见[[fixture-target]]。'));
    reg(root);
    const edges = json(root, 'site-registry.json').edges;
    ok(edges.some(e => e.type === 'ref' && e.to === 'fixture-target' && /^fixture-essay/.test(e.from)) && JSON.stringify(edges) !== before, 'a page-level [[ref]] rendered to the edition is still a ref edge to the page');

    // pins: page.json, then page-provenance.json
    const pj = 'demo/basics/fixture-target/page.json', meta = json(root, pj);
    write(root, pj, JSON.stringify(Object.assign({}, meta, { defaultEdition: 'original' }), null, 2) + '\n');
    ok(reg(root, '--check').code === 1, '--check catches a new pin');
    reg(root);
    eq(rowsOf(root)['fixture-target'].defaultEdition, 'original', 'a page.json pin reaches the row');
    ok(json(root, 'site-registry.json').pages['fixture-target'].pinnedBy === 'page.json' && json(root, 'site-registry.json').pages['fixture-target'].href === 'demo/basics/fixture-target/', 'site-registry.json names the pin and the canonical href');
    write(root, pj, JSON.stringify(Object.assign({}, meta, { defaultEdition: 'claude-code' }), null, 2) + '\n');
    const bad = reg(root, '--check');
    ok(bad.code === 1 && /defaultEdition: "claude-code" \(the only value is "original"/.test(bad.out), 'any other defaultEdition is an error:\n' + bad.out);
    write(root, pj, JSON.stringify(meta, null, 2) + '\n');
    write(root, 'page-provenance.json', JSON.stringify({ pages: { 'fixture-target': { developer: 'Claude Code', path: 'demo/basics/fixture-target/index.html' } } }));
    reg(root);
    ok(rowsOf(root)['fixture-target'].defaultEdition === 'original' && json(root, 'site-registry.json').pages['fixture-target'].pinnedBy === 'page-provenance.json', 'a canonical page by Claude Code is pinned without a page.json field');
    write(root, 'page-provenance.json', JSON.stringify({ pages: { 'fixture-target': { developer: 'Codex', path: 'demo/basics/fixture-target/index.html' } } }));
    reg(root);
    ok(!('defaultEdition' in rowsOf(root)['fixture-target']), 'a canonical page by another developer follows the switch');
    write(root, 'page-provenance.json', JSON.stringify({ pages: { 'fixture-target': { developer: 'Claude Code', path: 'variants/claude-code/fixture-target/index.html' } } }));
    reg(root);
    ok(!('defaultEdition' in rowsOf(root)['fixture-target']), 'a provenance entry for the variant itself does not pin the canonical page');
  }
  {
    const off = site('original');
    write(off, VARIANT, '<!doctype html><title>variant</title>\n');
    reg(off);
    const R = json(off, 'site-registry.json').pages['fixture-target'];
    ok(R.editions && R.href === 'demo/basics/fixture-target/', '"original": editions are still recorded, links stay canonical');
    const T = require(path.join(repo, 'scripts', 'lib', 'template.cjs'));
    const S = T.createSite(off);
    eq(T.renderInline('[[fixture-target]]', { site: S, page: S.bySlug.get('fixture-essay'), lang: 'en', ownAnchors: new Set() }), '<a href="../fixture-target/">The Page Being Cited</a>', '"original": [[slug]] stays canonical');
  }
  {
    const bad = site('original');
    write(bad, 'pages.config.js', read(bad, 'pages.config.js').replace('window.KNOWLEDGE_DEFAULT_EDITION = "original";', 'window.KNOWLEDGE_DEFAULT_EDITION = "codex";'));
    const r = reg(bad, '--check');
    ok(r.code === 1 && /KNOWLEDGE_DEFAULT_EDITION is "codex"; use "original" or "claude-code"/.test(r.out), 'an unknown switch value is an error:\n' + r.out);
    const none = site(null);
    write(none, VARIANT, '<!doctype html><title>variant</title>\n');
    reg(none);
    ok(json(none, 'site-registry.json').pages['fixture-target'].href === 'demo/basics/fixture-target/', 'no switch at all: canonical links');
  }
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

/* 4. site-nav-data.js: the copied resolver and every auto-link target. */
{
  const sb = { window: {} };
  vm.runInNewContext(read(repo, 'site-nav-data.js'), sb);
  const data = sb.window.SITE_NAV_DATA;
  ok(typeof data.editionPath === 'function' && String(data.editionPath) === String(resolve), 'site-nav-data.js carries the resolver from pages.config.js, verbatim');
  eq(data.edition, cfg.KNOWLEDGE_DEFAULT_EDITION, 'site-nav-data.js carries the switch');
  const core = require(path.join(repo, 'site-nav.js'));
  const live = REG.loadRegistry(repo).config.KNOWLEDGE_PAGES.filter(p => p.status === 'live' && p.path);
  const byPath = new Map(live.map(p => [p.path, p]));
  for (const sw of ['claude-code', 'original']) {
    const m = core.buildMatcher(data, sw);
    let bad = [];
    for (const p of data.pages) {
      const row = byPath.get(p[1]);
      const page = m.zh[p[2]] && m.zh[p[2]].path === p[1] ? m.zh[p[2]] : { target: core.pageTarget(p, data, sw) };
      if (page.target !== resolve(row, sw)) bad.push(p[1] + ' -> ' + page.target);
    }
    eq(bad, [], `${sw}: every auto-link target equals the resolver's result`);
  }
  eq(core.buildMatcher(data).zh[data.pages.find(p => p[6] && !p[7])[2]].target.startsWith('variants/claude-code/'), cfg.KNOWLEDGE_DEFAULT_EDITION === 'claude-code', 'without an override the generated switch decides');
}

/* 5. The real registry. */
{
  const entries = REG.loadRegistry(repo).entries;
  const variants = fs.readdirSync(path.join(repo, 'variants', 'claude-code')).filter(d => fs.existsSync(path.join(repo, 'variants', 'claude-code', d, 'index.html')));
  const withEd = entries.filter(e => e.row.editions);
  eq(withEd.map(e => e.row.slug).sort(), variants.sort(), 'every variant directory is the edition of a registered page, and only those pages have editions');
  const pinned = Object.fromEntries(withEd.filter(e => e.row.defaultEdition === 'original').map(e => [e.row.slug, e.pin]));
  eq(pinned, { 'power-converters': 'page.json', 'kepler-orbits': 'page.json', 'acid-base-equilibrium': 'page.json', 'bayes-diagnostics': 'page.json', photosynthesis: 'page.json' }, 'the five pinned pages');
  for (const s of ['kepler-orbits', 'acid-base-equilibrium', 'bayes-diagnostics', 'photosynthesis']) {
    const e = entries.find(x => x.row.slug === s), meta = Object.assign({}, e.meta);
    delete meta.defaultEdition;
    eq(ED.pinOf(repo, meta, e.dir, e.row.editions), 'page-provenance.json', s + ': pinned by its provenance even without the page.json field');
  }
  const e = entries.find(x => x.row.slug === 'power-converters'), meta = Object.assign({}, e.meta);
  delete meta.defaultEdition;
  eq(ED.pinOf(repo, meta, e.dir, e.row.editions), null, 'power-converters is pinned only by its page.json (a Codex edition kept on purpose)');
}

console.log(`PASS: default edition (${n} checks)`);
