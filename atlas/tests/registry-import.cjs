'use strict';
// Essay REGISTRY.json -> atlas fragment -> build (specs/atlas-search-index.md, "Essay pages").
// Self-contained: writes a sample registry for the existing essay demos/scarcity-moves
// (chapters article#c1..c14) into a temp dir, imports it, previews a build with
// --extra-lessons/--out, and checks the result. Nothing in the repository is written.
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'),
  vm = require('node:vm'), { execFileSync, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-registry-'));
const importer = path.join(root, 'scripts/atlas-import-registry.cjs'), build = path.join(root, 'scripts/build-atlas-data.cjs'), buildSearch = path.join(root, 'scripts/build-search-index.cjs');
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
let checks = 0; const ok = (v, m) => { assert.ok(v, m); checks++; };
try {
  const registry = {
    slug: 'scarcity-moves', path: 'demos/scarcity-moves/', category: 'demos', subtopic: 'essays', stage: 'senior',
    title: { zh: '稀缺会搬家', en: 'Scarcity Moves' }, desc: { zh: '样例', en: 'Sample' }, tags: [],
    concepts: [
      { id: 'sample-scarcity', title: { zh: '稀缺', en: 'Scarcity' }, desc: { zh: '想要的总比有的多。', en: 'Wants exceed what there is.' },
        aliases: { zh: ['东西不够'], en: ['not enough to go around'] }, anchor: '#c1', relatedPages: ['compound-interest'] },
      { id: 'sample-opportunity-cost', title: { zh: '机会成本', en: 'Opportunity cost' }, desc: { zh: '放弃的最好的另一件事。', en: 'The best thing you gave up.' },
        aliases: { zh: ['选这个就没那个'], en: ['what you give up'] }, anchor: '#c3', relatedPages: [] },
    ],
  };
  const write = (name, value) => { const d = path.join(tmp, name); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'REGISTRY.json'), JSON.stringify(value)); return d; };
  const good = write('good', registry), frags = path.join(tmp, 'frags'), out = path.join(tmp, 'out');

  // 1. Import: one schema-2 node per concept, chapter anchor, aliases, seeAlso (not edges).
  let r = run(importer, [good, '--region', 'society', '--out', path.join(frags, 'scarcity-moves.json')]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const frag = JSON.parse(fs.readFileSync(path.join(frags, 'scarcity-moves.json'), 'utf8'));
  ok(frag.schema === 2 && frag.kind === 'essay' && frag.nodes.length === 2 && frag.edges.length === 0, 'schema-2 essay fragment');
  const n0 = frag.nodes[0];
  ok(n0.source === '../demos/scarcity-moves/#c1' && n0.lessons[0].anchor === 'c1' && n0.lessons[0].step === null && n0.lessons[0].primary, 'chapter anchor as lesson anchor');
  assert.deepEqual(n0.aliases, { zh: ['东西不够'], en: ['not enough to go around'] }); checks++;
  assert.deepEqual(frag.seeAlso, { 'sample-scarcity': ['compound-interest'] }); checks++;
  ok(n0.group === 'society' && n0.stage === 'senior', 'region and stage');

  // 1b. Re-import keeps hand-written edges and questions; an edge whose concept is gone is dropped (2026-11-11).
  const again = path.join(tmp, 'again.json');
  fs.writeFileSync(again, JSON.stringify(Object.assign({}, frag, { edges: [
    { from: 'sample-scarcity', to: 'sample-opportunity-cost', type: 'foundation' },
    { from: 'sample-gone', to: 'fourier', type: 'connection' }], questions: [{ id: 'q-sample' }] })));
  r = run(importer, [good, '--region', 'society', '--out', again]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const re = JSON.parse(fs.readFileSync(again, 'utf8'));
  ok(re.edges.length === 1 && re.edges[0].from === 'sample-scarcity' && re.questions.length === 1 && /KEPT 1 hand-written edges/.test(r.stdout), 're-import keeps hand-written edges');

  // 2. Refusals: unknown anchor, id already in the atlas, missing English, unknown region.
  const bad = (name, mutate, flags, needle) => {
    const reg = JSON.parse(JSON.stringify(registry)); mutate(reg);
    const res = run(importer, [write(name, reg), '--out', path.join(tmp, name + '.json'), ...flags]);
    ok(res.status === 1 && res.stderr.includes(needle), `refuses ${name}: ${needle}`);
    ok(!fs.existsSync(path.join(tmp, name + '.json')), `nothing written for ${name}`);
  };
  bad('bad-anchor', reg => { reg.concepts[0].anchor = '#c99'; }, ['--region', 'society'], '#c99 not found');
  bad('taken-id', reg => { reg.concepts[0].id = 'fourier'; }, ['--region', 'society'], 'already used by');
  bad('no-english', reg => { delete reg.concepts[1].title.en; }, ['--region', 'society'], 'needs both zh and en');
  bad('no-region', () => {}, [], 'no region for category "demos"');

  // 3. Preview build: concepts reach the atlas index, the independent sharded search index (deep link + aliases) and pass the validator.
  r = run(build, ['--extra-lessons', frags, '--out', out]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const searchOut = path.join(out, 'search');
  r = run(buildSearch, ['--data', path.join(out, 'data.js'), '--out', searchOut]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(searchOut, 'manifest.js'), 'utf8'), box);
  for (const ref of box.window.KNOWLEDGE_CONCEPTS.chunks) {
    vm.runInNewContext(fs.readFileSync(path.join(searchOut, ref.replace(/^search\//, '').split('?')[0]), 'utf8'), box);
  }
  const row = box.window.KNOWLEDGE_CONCEPTS.concepts.find(c => c[0] === 'sample-opportunity-cost');
  ok(row && row[2] === 'demos/scarcity-moves/#c3', 'search index deep-links the chapter');
  assert.deepEqual(JSON.parse(JSON.stringify([row[5], row[6]])), [['选这个就没那个'], ['what you give up']]); checks++;
  const CS = require(path.join(root, 'search/concept-search.js'));
  const items = box.window.KNOWLEDGE_CONCEPTS.concepts.map(c => ({ id: c[0], record: CS.prepare({ titles: [c[3], c[4]], aliases: [...c[5], ...c[6]], texts: [c[7], c[8]] }) }));
  ok(CS.rank(items, '选这个就没那个')[0].id === 'sample-opportunity-cost', 'an everyday alias finds the chapter');
  const atlas = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(out, 'data.js'), 'utf8'), atlas);
  vm.runInNewContext(fs.readFileSync(path.join(out, 'questions.js'), 'utf8'), atlas);
  const { validate } = require('./data-quality.cjs');
  assert.deepEqual(validate(JSON.parse(JSON.stringify(atlas.window.ATLAS))).errors, []); checks++;
  const report = JSON.parse(fs.readFileSync(path.join(out, 'merge-report.json'), 'utf8'));
  // only the fixture's own candidates: the real graph's essays list theirs too (2026-11-11)
  assert.deepEqual(report.edgeCandidates.filter(c => c.concept.startsWith('sample-')), [{ concept: 'sample-scarcity', page: 'compound-interest', taughtBy: ['compound-interest'] }]); checks++;

  // 4. --add-region on a copy of the graph: new region claims a new category; importing into it works.
  // The real graph already has a tech region (2026-11-11), so the fixture uses a region id of its own.
  const graph = path.join(tmp, 'graph');
  fs.mkdirSync(path.join(graph, 'lessons'), { recursive: true });
  for (const f of ['groups.json', 'core.json']) fs.copyFileSync(path.join(root, 'atlas/graph', f), path.join(graph, f));
  r = run(importer, ['--add-region', 'sample-region', '--zh', '样例分区', '--en', 'Sample region', '--categories', 'sample-cat', '--graph', graph]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const groups = JSON.parse(fs.readFileSync(path.join(graph, 'groups.json'), 'utf8')), added = groups[groups.length - 1];
  ok(added.id === 'sample-region' && added.mark === String(groups.length).padStart(2, '0') && added.categories[0] === 'sample-cat', 'region appended with category');
  ok(run(importer, ['--add-region', 'sample-region', '--zh', 'x', '--en', 'x', '--graph', graph]).status === 1, 'duplicate region refused');
  const techReg = JSON.parse(JSON.stringify(registry)); techReg.category = 'sample-cat';
  r = run(importer, [write('tech', techReg), '--graph', graph, '--out', path.join(tmp, 'tech.json')]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  ok(JSON.parse(fs.readFileSync(path.join(tmp, 'tech.json'), 'utf8')).nodes.every(n => n.group === 'sample-region'), 'category maps to the new region');
  console.log(JSON.stringify({ pass: true, checks, scope: 'REGISTRY import, refusals, preview build, search deep links, add-region; repository untouched' }));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
