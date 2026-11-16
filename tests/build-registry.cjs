#!/usr/bin/env node
'use strict';
// The site registry (scripts/build-registry.cjs, scripts/lib/registry.cjs; specs/site-template.md §3b):
// --adopt on a site without the GENERATED fence, byte-identical regeneration, the projections, and the failure modes an
// agent meets when it registers a page the old way (a row pasted into pages.config.js). Scratch copies of
// tests/fixtures/site-template/ under /tmp/agent-tasks/, removed at the end even when an assertion fails.
//   node tests/build-registry.cjs
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const fixture = path.join(__dirname, 'fixtures', 'site-template');
const base = fs.existsSync('/tmp/agent-tasks') ? '/tmp/agent-tasks' : os.tmpdir();
const scratch = fs.mkdtempSync(path.join(base, 'build-registry-test-'));
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const run = (script, ...args) => {
  const r = spawnSync('node', [path.join(repo, 'scripts', script), ...args], { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};
const reg = (root, ...a) => run('build-registry.cjs', '--root', root, ...a);
const read = (root, f) => fs.readFileSync(path.join(root, f), 'utf8');
const write = (root, f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };
const json = (root, f) => JSON.parse(read(root, f));
const pagesOf = root => { const w = {}; vm.runInNewContext(read(root, 'pages.config.js'), { window: w }); return JSON.parse(JSON.stringify(w)); };

// A fixture site in the pre-Phase-2 form: hand-written KNOWLEDGE_PAGES rows (in two formatting styles), a template page,
// a hand-written page, an entrance page without subtopic, a LeetCode list and a CONCEPT-MAP with the atlas appendix.
const CONFIG = `/* header comment, hand-edited */
window.KNOWLEDGE_CATEGORIES = [{ id: "demo", name: { zh: "演示", en: "Demo" } }, { id: "tools", name: { zh: "工具", en: "Tools" } }];
window.KNOWLEDGE_STAGES = [{ id: "university", name: { zh: "大学", en: "University" } }];
window.KNOWLEDGE_SUBTOPICS = { demo: [{ id: "basics", name: { zh: "基础", en: "Basics" } }] };
/* FEATURED mentions KNOWLEDGE_PAGES in a comment only */
window.KNOWLEDGE_FEATURED = ["fixture-target"];
window.KNOWLEDGE_ESSAYS = ["fixture-essay"];

window.KNOWLEDGE_PAGES = [
  {
    slug: "fixture-target",
    title: { zh: "被引用的页面", en: "The Page Being Cited" },
    desc: {
      zh: "一页手写的课。",
      en: "A hand-written lesson."
    },
    tags: [
      { zh: "演示", en: "Demo" }
    ],
    category: "demo", subtopic: "basics",
    stage: "university",
    status: "live",
    path: "demo/basics/fixture-target/"
  },
  {
    slug: "fixture-essay",
    title: { zh: "样例长文", en: "A Sample Essay" },
    desc: { zh: "模板构建的测试夹具。", en: "A fixture for the template build." },
    tags: [{ zh: "长文", en: "Long-form Essay" }],
    category: "demo", subtopic: "basics", stage: "university", status: "live", path: "demo/basics/fixture-essay/"
  },
  {
    slug: "fixture-tool",
    title: { zh: "工具入口", en: "A Tool" },
    desc: { zh: "入口页。", en: "An entrance page." },
    tags: [{ zh: "工具", en: "Tool" }],
    languages: ["zh"],
    category: "tools", stage: "university", status: "live", path: "tool/"
  }

];
`;
function freshSite() {
  const d = fs.mkdtempSync(path.join(scratch, 'site-'));
  fs.cpSync(fixture, d, { recursive: true });
  write(d, 'pages.config.js', CONFIG);
  write(d, 'tool/index.html', '<!doctype html><title>tool</title><p id="top"><a href="../demo/basics/fixture-target/#ch1">x</a></p>\n');
  write(d, 'leetcode/problems.config.js', 'window.LEETCODE_PROBLEMS = [{ "id": 4, "title": { "zh": "中位数", "en": "Median" }, "path": "4/" }];\n');
  // the fixture atlas plus a concept on the essay and on the tool, and one atlas edge (tool -> target)
  write(d, 'atlas/data.js', read(d, 'atlas/data.js').replace('  ] };', `    { id: 'fixture-layers', title: { zh: '分层', en: 'layers' }, lessons: [{ slug: 'fixture-essay', anchor: 'ch1', primary: true }] },
    { id: 'fixture-tool-node', title: { zh: '工具', en: 'tool' }, lessons: [{ slug: 'fixture-tool', anchor: 'top', primary: true }] },
  ], edges: [{ from: 'fixture-tool-node', to: 'fixture-cache-line' }] };`));
  write(d, 'CONCEPT-MAP.md', '# map\n\nhand-written prose\n\n<!-- GENERATED:atlas-nodes -->\natlas table\n<!-- /GENERATED:atlas-nodes -->\n\nhand-written tail\n');
  return d;
}

try {
  // 1. Before the fence: --check refuses and says what to do; --adopt writes a page.json per row and the fenced block.
  const root = freshSite();
  const before = pagesOf(root);
  {
    const r = reg(root, '--check');
    ok(r.code === 1 && /run node scripts\/build-registry\.cjs --adopt once/.test(r.out), 'an unfenced site asks for --adopt:\n' + r.out);
    const a = reg(root, '--adopt');
    ok(a.code === 0 && /adopt: 3 page\.json file\(s\) written/.test(a.out), '--adopt writes three page.json files:\n' + a.out);
    const after = pagesOf(root);
    assert.deepEqual(after, before); n++;
    const text = read(root, 'pages.config.js');
    ok(text.startsWith('/* header comment, hand-edited */\nwindow.KNOWLEDGE_CATEGORIES') && text.includes('window.KNOWLEDGE_ESSAYS = ["fixture-essay"];\n\n/* ===== GENERATED: KNOWLEDGE_PAGES'), 'the hand-edited part of pages.config.js is untouched');
    ok(text.includes('then run node scripts/build-registry.cjs. A row already pasted here by hand: node scripts/build-registry.cjs --adopt') && /\/\* ===== END GENERATED: KNOWLEDGE_PAGES ===== \*\/\n$/.test(text), 'the block carries the banner with the instructions and the END marker');
    ok(text.includes('    tags: [{ zh: "演示", en: "Demo" }],\n    category: "demo", subtopic: "basics", stage: "university", status: "live", path: "demo/basics/fixture-target/"'), 'rows are written in one canonical shape');
    ok(text.includes('    languages: ["zh"],\n    category: "tools", stage: "university", status: "live", path: "tool/"'), 'languages and a missing subtopic survive');
    const t = json(root, 'demo/basics/fixture-target/page.json');
    ok(t.kind === 'lesson' && t.title.en === 'The Page Being Cited' && t.order === 10 && t.path === 'demo/basics/fixture-target/' && !t.layout, 'a hand-written page gets a metadata-only page.json');
    const e = json(root, 'demo/basics/fixture-essay/page.json');
    ok(e.layout === 'essay' && e.status === 'live' && e.order === 20 && !('title' in e) && !('desc' in e) && e.generators && e.version === '20261116', 'a template page.json gains the registry fields, keeps its own, and takes no title or desc');
    ok(json(root, 'tool/page.json').kind === 'tool' || json(root, 'tool/page.json').kind === 'lesson', 'the entrance page gets a page.json');
    const again = reg(root);
    ok(again.code === 0 && /^up to date/.test(again.out), 'regeneration from the page.json files is byte-identical:\n' + again.out);
    ok(reg(root, '--check').code === 0, '--check passes after --adopt');
  }

  // 2. The projections.
  {
    const R = json(root, 'site-registry.json');
    ok(/^by scripts\/build-registry\.cjs/.test(R._generated), 'site-registry.json says it is generated');
    ok(R.pages['fixture-target'].anchors.includes('ch2') && R.pages['fixture-essay'].anchors.includes('ch2') && R.pages['fixture-essay'].template === true, 'pages carry anchors (index.html ids, content headings) and the template flag');
    ok(R.pages['fixture-essay'].title.zh === '样例长文' && R.pages['fixture-essay'].desc.en === 'A fixture for the template build.', 'a template page\'s title and desc come from its content');
    ok(R.concepts['fixture-cache-line'].page === 'fixture-target' && R.concepts['fixture-cache-line'].anchor === 'ch2' && R.pages['fixture-target'].concepts.includes('fixture-cache-line'), 'concepts come from the atlas, owned by their primary page');
    ok(R.edges.some(x => x.type === 'ref' && x.from === 'fixture-essay#ch1' && x.to === 'fixture-target#ch2'), 'a [[ref]] in template content is a ref edge');
    ok(R.edges.some(x => x.type === 'ref' && x.from === 'fixture-target#ch1' && x.to === 'fixture-essay#ch2'), 'an href in a hand-written copy file is a ref edge, credited to its chapter');
    ok(R.edges.some(x => x.type === 'ref' && x.from === 'fixture-tool' && x.to === 'fixture-target#ch1'), 'an href in a hand-written index.html is a ref edge without a source chapter');
    ok(JSON.stringify(R.backlinks['fixture-essay']) === JSON.stringify([{ from: 'fixture-target', links: [{ from: 'ch1', to: 'ch2' }] }]), 'backlinks for every page, in the template\'s shape');
    ok(R.adapters.leetcode.pages.length === 1 && R.adapters.leetcode.pages[0].path === 'leetcode/4/' && !R.pages['4'], 'LeetCode rows come through the adapter and are not site pages');
    const cm = read(root, 'CONCEPT-MAP.md');
    ok(cm.startsWith('# map\n\nhand-written prose\n\n<!-- GENERATED:atlas-nodes -->\natlas table\n<!-- /GENERATED:atlas-nodes -->\n\n<!-- GENERATED:registry-concepts -->') && cm.endsWith('<!-- /GENERATED:registry-concepts -->\n\nhand-written tail\n'), 'the CONCEPT-MAP section goes after the atlas appendix; hand-written text stays');
    ok(cm.includes('| 缓存行 / cache line | `demo/basics/fixture-target/#ch2` |'), 'the CONCEPT-MAP table maps concept to page and anchor');
    const todo = read(root, 'specs/atlas-edge-todo.md');
    ok(todo.startsWith('<!-- GENERATED by scripts/build-registry.cjs') && /The pair is covered when atlas\/data\.js has an edge, in either direction/.test(todo), 'the D9 to-do states its rule');
    ok(/3 linked page pairs · 1 covered by an atlas edge · 0 with no concept on one side · \*\*2 to do\*\*/.test(todo), 'the to-do counts pairs (tool -> target is covered by its atlas edge):\n' + todo);
    ok(todo.includes('- `fixture-essay#ch1` → `fixture-target#ch2`: fixture-layers → fixture-cache-line, fixture-dup-b') && todo.includes('- `fixture-target#ch1` → `fixture-essay#ch2`: fixture-dup-a → ?') && !todo.includes('`fixture-tool`'), 'the to-do lists uncovered links with the concepts at both ends:\n' + todo);
  }

  // 3. The old habit: a row pasted into the block by hand. --check names it and says what to do; --adopt moves it.
  {
    const text = read(root, 'pages.config.js');
    const pasted = '  {\n    slug: "fixture-new",\n    title: { zh: "新页", en: "New Page" },\n    desc: { zh: "新。", en: "New." },\n    tags: [],\n    category: "demo", subtopic: "basics", stage: "university", status: "live", path: "demo/basics/fixture-new/"\n  },\n';
    write(root, 'pages.config.js', text.replace('window.KNOWLEDGE_PAGES = [\n', 'window.KNOWLEDGE_PAGES = [\n' + pasted));
    write(root, 'demo/basics/fixture-new/index.html', '<!doctype html><title>new</title>\n');
    const r = reg(root, '--check');
    ok(r.code === 1 && /"fixture-new" is in the KNOWLEDGE_PAGES block but no page\.json registers it/.test(r.out) && /run node scripts\/build-registry\.cjs --adopt/.test(r.out) && /specs\/essays\.md「Registering」/.test(r.out), 'a hand-added row fails --check with the way out:\n' + r.out);
    const a = reg(root, '--adopt');
    ok(a.code === 0, '--adopt takes the pasted row:\n' + a.out);
    const pj = json(root, 'demo/basics/fixture-new/page.json');
    ok(pj.order === 40 && pj.status === 'live', 'an adopted row is ordered after every registered page');
    ok(reg(root, '--check').code === 0, '--check passes after adopting');
    const rows = pagesOf(root).KNOWLEDGE_PAGES.map(p => p.slug);
    ok(rows.join() === 'fixture-target,fixture-essay,fixture-tool,fixture-new', 'the adopted page comes last: ' + rows);
  }
  {
    const text = read(root, 'pages.config.js');
    write(root, 'pages.config.js', text.replace('title: { zh: "被引用的页面", en: "The Page Being Cited" }', 'title: { zh: "改过的标题", en: "The Page Being Cited" }'));
    const r = reg(root, '--check');
    ok(r.code === 1 && /"fixture-target": the block differs from demo\/basics\/fixture-target\/page\.json in title\. Edit page\.json/.test(r.out), 'a hand edit of a row names the field and the page.json:\n' + r.out);
    ok(reg(root).code === 0 && read(root, 'pages.config.js').includes('"被引用的页面"'), 'regenerating drops the hand edit');
    write(root, 'pages.config.js', read(root, 'pages.config.js') + 'window.KNOWLEDGE_PAGES.push({ slug: "x" });\n');
    const o = reg(root, '--check');
    ok(o.code === 1 && /KNOWLEDGE_PAGES is assigned or changed outside the GENERATED block/.test(o.out), 'a change to KNOWLEDGE_PAGES outside the fence is an error:\n' + o.out);
    write(root, 'pages.config.js', read(root, 'pages.config.js').replace('window.KNOWLEDGE_PAGES.push({ slug: "x" });\n', ''));
    ok(reg(root, '--check').code === 0, 'and passes again once removed');
  }

  // 4. Registering the new way: a page.json with "status"; one without is a draft and stays out.
  {
    write(root, 'demo/basics/fixture-late/index.html', '<!doctype html><title>late</title>\n');
    const meta = { slug: 'fixture-late', kind: 'lesson', title: { zh: '后来的页', en: 'A Later Page' }, desc: { zh: '后来。', en: 'Later.' }, tags: [], category: 'demo', subtopic: 'basics', stage: 'university', path: 'demo/basics/fixture-late/' };
    write(root, 'demo/basics/fixture-late/page.json', JSON.stringify(meta));
    ok(reg(root, '--check').code === 0, 'a page.json without status is a draft: not registered, nothing stale');
    write(root, 'demo/basics/fixture-late/page.json', JSON.stringify({ ...meta, status: 'live' }));
    const c = reg(root, '--check');
    ok(c.code === 1 && /"fixture-late" is registered by demo\/basics\/fixture-late\/page\.json but not in the block yet/.test(c.out), 'a new page.json makes the block stale until the script runs:\n' + c.out);
    ok(reg(root).code === 0 && pagesOf(root).KNOWLEDGE_PAGES.slice(-1)[0].slug === 'fixture-late', 'a page without "order" goes last');
    ok(json(root, 'site-registry.json').pages['fixture-late'].status === 'live', 'and is in site-registry.json');
    const bp = run('build-pages.cjs', '--all', '--check', '--root', root);
    ok(bp.code === 1 && /DRIFT demo\/basics\/fixture-essay/.test(bp.out), 'build-pages reads the same registry (the template page is stale: it was last built before the fence)');
    ok(run('build-pages.cjs', '--all', '--root', root).code === 0 && run('build-pages.cjs', '--all', '--check', '--root', root).code === 0, 'and builds from it');
  }

  // 5. Invalid page.json files are build errors that name the file.
  const bad = (name, change, re) => {
    const r2 = freshSite();
    assert.equal(reg(r2, '--adopt').code, 0);
    change(r2);
    const r = reg(r2, '--check');
    ok(r.code === 1 && re.test(r.out), `${name}: expected ${re}, got:\n${r.out}`);
  };
  const edit = (f, fn) => r => { const p = path.join(r, f, 'page.json'), d = JSON.parse(fs.readFileSync(p, 'utf8')); fn(d); fs.writeFileSync(p, JSON.stringify(d)); };
  bad('unknown category', edit('demo/basics/fixture-target/', d => { d.category = 'nope'; }), /fixture-target\/page\.json: category: "nope" is not in KNOWLEDGE_CATEGORIES \(pages\.config\.js, hand-edited: add it there first\)/);
  bad('unknown subtopic', edit('demo/basics/fixture-target/', d => { d.subtopic = 'nope'; }), /subtopic: "nope" is not in KNOWLEDGE_SUBTOPICS\["demo"\]/);
  bad('path is not the directory', edit('demo/basics/fixture-target/', d => { d.path = 'demo/basics/elsewhere/'; }), /path: "demo\/basics\/elsewhere\/" must be this page\.json's directory "demo\/basics\/fixture-target\/"/);
  bad('duplicate slug', edit('tool/', d => { d.slug = 'fixture-target'; }), /slug "fixture-target" is also registered by/);
  bad('duplicate order', edit('tool/', d => { d.order = 10; }), /order 10 is also used by/);
  bad('bad status', edit('tool/', d => { d.status = 'draft'; }), /status: "draft" \(use live or planned; leave it out while the page is a draft\)/);
  bad('template page with a title', edit('demo/basics/fixture-essay/', d => { d.title = { zh: 'x', en: 'x' }; }), /a template page takes them from content\.<lang>\.md/);
  bad('metadata page without desc', edit('demo/basics/fixture-target/', d => { delete d.desc; }), /desc: \{"zh": …, "en": …\}/);
  bad('markup in a template title', r => { const f = path.join(r, 'demo/basics/fixture-essay/content.en.md'); fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('# A Sample Essay {#hero}', '# A *Sample* Essay {#hero}')); }, /the title heading of content\.en\.md holds markup/);

  // 6. The converter merges into a metadata-only page.json instead of refusing it.
  {
    const r3 = freshSite();
    assert.equal(reg(r3, '--adopt').code, 0);
    const d = path.join(r3, 'demo/basics/fixture-essay');
    assert.equal(run('build-pages.cjs', d, '--root', r3, '--no-chrome', '--no-prefill').code, 0);
    const pj = JSON.parse(fs.readFileSync(path.join(d, 'page.json'), 'utf8'));
    const keep = path.join(r3, 'kept');
    fs.mkdirSync(keep);
    for (const f of ['content.zh.md', 'content.en.md', 'page.css', 'bindings.cjs', 'figures']) fs.renameSync(path.join(d, f), path.join(keep, f));
    const reg0 = { slug: pj.slug, kind: pj.kind, title: { zh: '样例长文', en: 'A Sample Essay' }, desc: { zh: '模板构建的测试夹具。', en: 'A fixture for the template build.' }, tags: pj.tags, category: pj.category, subtopic: pj.subtopic, stage: pj.stage, status: pj.status, path: pj.path, order: pj.order };
    fs.writeFileSync(path.join(d, 'page.json'), JSON.stringify(reg0, null, 2) + '\n');
    const c = run('convert-essay.cjs', d, '--root', r3);
    ok(c.code === 0 && /index\.html byte-identical/.test(c.out), 'the converter runs on a registered (metadata-only) page:\n' + c.out);
    ok(!/index\.html -> .*page\.json/.test(c.out), 'it prints no Derived-From for page.json, which it did not create');
    const m = JSON.parse(fs.readFileSync(path.join(d, 'page.json'), 'utf8'));
    ok(m.layout === 'essay' && m.status === 'live' && m.order === pj.order && !('title' in m) && !('desc' in m), 'page.json keeps the registry fields, gains the template ones, and drops title and desc');
    { const k = reg(r3, '--check'); ok(!/pages\.config\.js/.test(k.out) && !/ERROR/.test(k.out), 'the conversion leaves the registry rows alone (only anchors in site-registry.json move, from the no-chrome rebuild):\n' + k.out); }
  }
  console.log(`PASS: build-registry (${n} checks)`);
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
