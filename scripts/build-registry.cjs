#!/usr/bin/env node
'use strict';
/* The one site registry (specs/site-template.md §3b; proposal §2.2, decisions D8, D9).
 *
 *   node scripts/build-registry.cjs            write the projections below from the page.json files
 *   node scripts/build-registry.cjs --check    write nothing; exit 1 if any projection is out of date or a page.json is
 *                                              invalid (and say what to do when the KNOWLEDGE_PAGES block was hand-edited)
 *   node scripts/build-registry.cjs --adopt    move KNOWLEDGE_PAGES rows that have no page.json (pasted by hand, or every
 *                                              row on a site without the GENERATED fence) into page.json files, then write
 *   options: --root <site-root> (tests)
 *
 * Sources: every page.json with a "status" (scripts/lib/registry.cjs), the content files of template pages (title, desc,
 * anchors, [[refs]]), the hand-edited parts of pages.config.js (categories, stages, subtopics, FEATURED, ESSAYS),
 * atlas/data.js (concepts with their merged aliases, atlas edges), REGISTRY.json concepts (relatedPages), the scanned
 * links of hand-written pages, and leetcode/problems.config.js (LeetCode rows through an adapter, D5).
 *
 * Projections (each starts with a GENERATED note):
 *   pages.config.js           the KNOWLEDGE_PAGES block between the GENERATED markers (D8; the rest stays hand-edited)
 *   site-registry.json        pages, anchors, concepts, ref / seeAlso edges, backlinks
 *   CONCEPT-MAP.md            the page → concept → anchor tables between <!-- GENERATED:registry-concepts --> markers
 *   specs/atlas-edge-todo.md  linked page pairs with no atlas edge between them (D9: a to-do list, never edges)
 * site-nav-data.js and the template pages read the same registry through scripts/lib/template.cjs; rebuild them with
 * build-site-nav.cjs and build-pages.cjs --all.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const REG = require('./lib/registry.cjs');
const ED = require('./lib/editions.cjs');

const args = process.argv.slice(2);
const CHECK = args.includes('--check'), ADOPT = args.includes('--adopt');
const root = path.resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : path.join(__dirname, '..'));
if (CHECK && ADOPT) { console.error('--check and --adopt do not combine'); process.exit(2); }
const REGISTER_HELP = 'To register a page: write <category>/<subtopic>/<slug>/page.json (AGENTS.md, specs/essays.md「Registering」), then run node scripts/build-registry.cjs.';
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };
const rel = f => path.relative(root, f) || '.';
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');

/* ───────── --adopt: rows of the KNOWLEDGE_PAGES block → page.json ───────── */
const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(j => [j, x[j]])) : x);
function adopt() {
  const cfg = REG.readConfig(root);
  if (cfg.problems.length) die(cfg.problems.join('\n'));
  const rows = cfg.window.KNOWLEDGE_PAGES || [];
  const known = cfg.fenced ? REG.pagesFromJson(root, cfg.window).rows : [];
  const bySlug = new Map(known.map(e => [e.row.slug, e]));
  let next = cfg.fenced ? Math.max(0, ...known.map(e => e.meta.order || 0)) + 10 : 10;
  const problems = [], wrote = [], pending = [];
  rows.forEach(row => {
    const at = `KNOWLEDGE_PAGES row "${row.slug}"`;
    if (!row.path) { problems.push(`${at}: no path; a registered page needs a directory for its page.json`); return; }
    const dir = path.join(root, row.path), f = path.join(dir, 'page.json');
    if (!fs.existsSync(dir)) { problems.push(`${at}: ${row.path} does not exist`); return; }
    const has = bySlug.get(row.slug);
    const existing = fs.existsSync(f) ? readJson(f) : null;
    if (existing && existing.slug !== row.slug) { problems.push(`${at}: ${row.path}page.json has slug "${existing.slug}"`); return; }
    for (const k of ['title', 'desc']) for (const l of REG.LANGS) if (typeof (row[k] || {})[l] !== 'string') problems.push(`${at}: ${k}.${l} must be a string`);
    if (!Array.isArray(row.tags)) problems.push(`${at}: tags must be a list of {zh, en}`);
    if (REG.titleInContent(existing)) {
      // an essay template page: title and desc stay in the content; the row must agree with it (a lesson keeps them in page.json)
      const c = REG.contentText(dir, problems, at);
      for (const k of ['title', 'desc']) for (const l of REG.LANGS) if (c[k][l] != null && row[k] && c[k][l] !== row[k][l]) problems.push(`${at}: ${k}.${l} differs from content.${l}.md (a template page's ${k} lives there; edit the content instead)`);
    }
    const order = has ? has.meta.order : existing && existing.order != null ? existing.order : cfg.fenced ? (next += 10) - 10 : (rows.indexOf(row) + 1) * 10;
    const meta = REG.metaFromRow(root, row, existing, order);
    // same fields in another key order (a hand-written page.json) is not a change
    if (existing && canon(existing) === canon(meta)) return;
    pending.push([f, meta]);
    wrote.push(`${row.path}page.json (${existing ? (has ? 'updated from the hand-edited row' : 'registry fields added') : 'new'})`);
  });
  // Every row is checked before any page.json is written (review 2026-11-16: a failing row used to leave the rows
  // before it rewritten).
  if (problems.length) die('adopt: nothing written:\n' + problems.join('\n'));
  for (const [f, meta] of pending) writeJson(f, meta);
  console.log(`adopt: ${wrote.length} page.json file(s) written` + (wrote.length <= 20 ? (wrote.length ? ':\n  ' + wrote.join('\n  ') : '') : ` (${wrote.filter(w => w.endsWith('(new)')).length} new)`));
  // From here on the block is generated: put the fence in (or regenerate it) from the page.json files.
  const reg0 = { ...cfg, block: cfg.block };
  const r = REG.pagesFromJson(root, cfg.window);
  if (r.problems.length) die(r.problems.join('\n'));
  fs.writeFileSync(cfg.file, REG.withBlock(reg0, r.rows.map(e => e.row)));
}

/* ───────── the registry and its projections ───────── */
function loadWindow(file) {
  const w = {};
  if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window: w });
  return w;
}
function build() {
  const T = require('./lib/template.cjs');
  const site = T.createSite(root);
  const reg = site.registry;
  if (reg.mode !== 'pages') die(`pages.config.js has no GENERATED KNOWLEDGE_PAGES block yet; run node scripts/build-registry.cjs --adopt once (it writes a page.json for every row).`);
  const errors = [...reg.problems];
  // an invalid page.json cannot be projected; report every problem first
  if (errors.length) die(errors.map(e => 'ERROR ' + e).join('\n') + '\n' + REGISTER_HELP);
  const anchorOf = l => l.anchor || (l.step != null ? 'step' + l.step : null);

  // pages
  const pages = {};
  for (const e of reg.entries) {
    const r = e.row;
    const p = { path: r.path, kind: e.meta.kind, category: r.category };
    if (r.subtopic) p.subtopic = r.subtopic;
    Object.assign(p, { stage: r.stage, status: r.status, template: e.template, title: r.title, desc: r.desc });
    if (r.created) p.created = r.created;
    // parallel editions and the pin (specs/claude-code-editions.md「默认版本」); href = where a page-level link goes now
    if (r.editions) {
      p.editions = r.editions;
      if (e.pin) Object.assign(p, { defaultEdition: 'original', pinnedBy: e.pin });
      p.href = ED.defaultPath(reg.config, r);
    }
    if (r.status === 'live' && site.bySlug.get(r.slug) === r) p.anchors = [...site.anchors(r)];
    p.concepts = [];
    pages[r.slug] = p;
  }
  // concepts: atlas nodes whose primary lesson is a registered page (titles and aliases as search has them)
  const concepts = {};
  for (const n of site.nodes.values()) {
    const ls = n.lessons || [], l = ls.find(x => x.primary) || ls[0];
    if (!l || !pages[l.slug]) continue;
    const c = { page: l.slug, anchor: anchorOf(l), title: n.title };
    if (n.aliases) c.aliases = n.aliases;
    concepts[n.id] = c;
    pages[l.slug].concepts.push(n.id);
  }
  // edges: every scanned link between live pages, and REGISTRY.json relatedPages (seeAlso)
  const edges = [], seenEdge = new Set();
  for (const L of T.scanLinks(site)) {
    const from = L.src.slug + (L.from ? '#' + L.from : ''), to = L.dst.slug + (L.to ? '#' + L.to : '');
    if (seenEdge.has(from + '>' + to)) continue;
    seenEdge.add(from + '>' + to);
    edges.push({ type: 'ref', from, to });
  }
  for (const e of reg.entries) {
    const files = [path.join(root, e.dir, 'REGISTRY.json')];
    const src = e.meta.concepts ? e.meta : fs.existsSync(files[0]) ? readJson(files[0]) : null;
    for (const c of (src && src.concepts) || []) for (const s of c.relatedPages || []) if (pages[s] && s !== e.row.slug) edges.push({ type: 'seeAlso', from: c.id, to: s });
  }
  // backlinks: as the template pages render them (same scan, same order)
  const backlinks = {};
  for (const p of site.pages) {
    const bl = T.scanBacklinks(site, p);
    if (bl.length) backlinks[p.slug] = bl.map(r => ({ from: r.p.slug, links: r.links.map(x => ({ from: x.from, to: x.to })) }));
  }
  // LeetCode lessons keep their pipeline (D5): registry rows only, through this adapter. Not site pages for refs or
  // backlinks (their links are not scanned), so they change no template page.
  const adapters = {};
  const lc = loadWindow(path.join(root, 'leetcode', 'problems.config.js')).LEETCODE_PROBLEMS;
  if (Array.isArray(lc)) adapters.leetcode = { source: 'leetcode/problems.config.js', pages: lc.map(x => ({ id: x.id, path: 'leetcode/' + x.path, title: x.title })) };

  const registry = {
    _generated: 'by scripts/build-registry.cjs from page.json files, template content, pages.config.js (hand-edited parts), atlas/data.js and scanned links; do not edit, rerun the script',
    pages, adapters, concepts, edges, backlinks,
  };
  const outputs = new Map();
  outputs.set(reg.cfg.file, REG.withBlock(reg.cfg, reg.entries.map(e => e.row)));
  outputs.set(path.join(root, 'site-registry.json'), registryJson(registry));
  const cm = path.join(root, 'CONCEPT-MAP.md');
  if (fs.existsSync(cm)) outputs.set(cm, conceptMap(fs.readFileSync(cm, 'utf8'), reg, pages, concepts));
  outputs.set(path.join(root, 'specs', 'atlas-edge-todo.md'), edgeTodo(site, pages, edges));
  return { outputs, errors, reg, stats: { pages: Object.keys(pages).length, live: site.pages.length, concepts: Object.keys(concepts).length, refs: edges.filter(e => e.type === 'ref').length, seeAlso: edges.filter(e => e.type === 'seeAlso').length, leetcode: adapters.leetcode ? adapters.leetcode.pages.length : 0 } };
}

// One line per page, concept, edge and backlink list: small diffs, a readable file (about 0.7 MB).
function registryJson(r) {
  const J = JSON.stringify;
  const obj = o => '{\n' + Object.entries(o).map(([k, v]) => J(k) + ': ' + J(v)).join(',\n') + '\n}';
  const arr = a => '[\n' + a.map(v => J(v)).join(',\n') + '\n]';
  const adapters = '{\n' + Object.entries(r.adapters).map(([k, v]) => J(k) + ': {"source": ' + J(v.source) + ', "pages": ' + arr(v.pages) + '}').join(',\n') + '\n}';
  return '{\n"_generated": ' + J(r._generated) + ',\n"pages": ' + obj(r.pages) + ',\n"adapters": ' + adapters + ',\n"concepts": ' + obj(r.concepts) +
    ',\n"edges": ' + arr(r.edges) + ',\n"backlinks": ' + obj(r.backlinks) + '\n}\n';
}

/* CONCEPT-MAP.md: page → concept → anchor, between markers; the hand-written parts of the file stay as they are. */
const CM_START = '<!-- GENERATED:registry-concepts -->', CM_END = '<!-- /GENERATED:registry-concepts -->';
function conceptMap(text, reg, pages, concepts) {
  const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const L = [CM_START, '## 页面 → 概念 → 锚点（生成，勿手改）', ''];
  const owners = reg.entries.filter(e => pages[e.row.slug].concepts.length);
  L.push(`${owners.length} 个页面拥有 ${Object.keys(concepts).length} 个图谱概念 · 由 scripts/build-registry.cjs 从 site-registry.json 生成（概念 = atlas/data.js 里 primary 课程是该页的节点；顺序同首页登记顺序）。` +
    '登记或改动页面后重跑 `node scripts/build-registry.cjs`；不要再在本文件里手写逐页概念表（2026-11-16 起，上面的手写表保留为历史记录）。', '');
  for (const e of owners) {
    const r = e.row;
    L.push(`### ${cell(r.title.zh)} / ${cell(r.title.en)}`, '', `\`${r.path}\` · ${e.meta.kind}`, '', '| 概念 | 深链 |', '| --- | --- |');
    for (const id of pages[r.slug].concepts) {
      const c = concepts[id];
      L.push(`| ${cell(c.title.zh)} / ${cell(c.title.en)} | \`${r.path}${c.anchor ? '#' + c.anchor : ''}\` |`);
    }
    L.push('');
  }
  L.push(CM_END);
  const block = L.join('\n');
  const a = text.indexOf(CM_START), b = text.indexOf(CM_END);
  if (a !== -1 && b !== -1) return text.slice(0, a) + block + text.slice(b + CM_END.length);
  const atlasEnd = '<!-- /GENERATED:atlas-nodes -->', i = text.indexOf(atlasEnd);
  if (i !== -1) return text.slice(0, i + atlasEnd.length) + '\n\n' + block + text.slice(i + atlasEnd.length);
  return text.replace(/\s*$/, '\n') + '\n' + block + '\n';
}

/* D9: linked page pairs without an atlas edge. Never written as edges; a human writes the edge with its reason. */
function edgeTodo(site, pages, edges) {
  const A = site.atlas || {};
  const anchorOf = l => l.anchor || (l.step != null ? 'step' + l.step : null);
  const taught = new Map();     // page slug -> Set(node id): any lessons[] entry, primary or not
  const at = new Map();         // "slug#anchor" -> [node id]
  for (const n of site.nodes.values()) for (const l of n.lessons || []) {
    if (!taught.has(l.slug)) taught.set(l.slug, new Set());
    taught.get(l.slug).add(n.id);
    const k = l.slug + '#' + anchorOf(l);
    if (!at.has(k)) at.set(k, []);
    if (!at.get(k).includes(n.id)) at.get(k).push(n.id);
  }
  const linked = new Set();
  for (const e of A.edges || []) { linked.add(e.from + '>' + e.to); linked.add(e.to + '>' + e.from); }
  const pairs = new Map();
  for (const e of edges) {
    if (e.type !== 'ref') continue;
    const [a] = e.from.split('#'), [b] = e.to.split('#');
    const k = a + '>' + b;
    if (!pairs.has(k)) pairs.set(k, { a, b, refs: [] });
    pairs.get(k).refs.push(e);
  }
  let covered = 0, noConcept = 0;
  const todo = [];
  for (const P of pairs.values()) {
    const ca = taught.get(P.a) || new Set(), cb = taught.get(P.b) || new Set();
    if (!ca.size || !cb.size) { noConcept++; continue; }
    if ([...ca].some(x => [...cb].some(y => linked.has(x + '>' + y)))) { covered++; continue; }
    todo.push(P);
  }
  const t = s => pages[s] ? `${pages[s].title.zh} / ${pages[s].title.en}` : s;
  const L = [
    '<!-- GENERATED by scripts/build-registry.cjs; do not edit. Rerun the script after adding links or atlas edges. -->',
    '# Atlas edge to-do: linked pages with no atlas edge (D9)',
    '',
    'Decision D9 (specs/site-template.md §1): a prose link from one page to another never becomes an atlas edge by itself. An edge',
    'needs a written, sourced reason (specs/atlas-search-index.md), so this file only lists candidates for a human to write up in',
    'the page\'s atlas fragment (atlas/graph/lessons/<slug>.json `edges`, kept on re-import) or atlas/graph/core.json.',
    '',
    'Rule: page A links to page B (any scanned link: `[[…]]` in template content, `href` in hand-written copy, i18n.js or',
    'index.html). The pair is covered when atlas/data.js has an edge, in either direction, between a concept taught on A and one',
    'taught on B (any `lessons[]` entry). Pairs where either page teaches no atlas concept cannot have an edge and are only',
    'counted. Under each pair: every link, with the concepts anchored at its two ends where there are any (`?` = none at that',
    'anchor; a link to the page top has no anchor).',
    '',
    `${pairs.size} linked page pairs · ${covered} covered by an atlas edge · ${noConcept} with no concept on one side · **${todo.length} to do**.`,
    '',
  ];
  for (const P of todo) {
    L.push(`## ${t(P.a)} → ${t(P.b)}`, '');
    for (const e of P.refs) {
      const ea = e.from.includes('#') ? at.get(e.from) : null, eb = e.to.includes('#') ? at.get(e.to) : null;
      L.push(`- \`${e.from}\` → \`${e.to}\`` + (ea || eb ? `: ${(ea || ['?']).join(', ')} → ${(eb || ['?']).join(', ')}` : ''));
    }
    L.push('');
  }
  return L.join('\n');
}

/* ───────── main ───────── */
if (ADOPT) adopt();
const { outputs, errors, reg, stats } = build();
if (errors.length) die(errors.map(e => 'ERROR ' + e).join('\n') + '\n' + REGISTER_HELP);
// A row in the block that no page.json registers was pasted by hand (or its page.json lost its "status"). Writing would
// drop it without a word, and the --check hint says to run this very command, so refuse and say what to do (review
// 2026-11-16, specs/reviews/site-template-phase2-review-20261116.md). Hand edits of existing rows are still overwritten:
// there page.json is the source, and --check names them first.
if (!CHECK) {
  const inJson = new Set(reg.entries.map(e => e.row.slug));
  const orphans = (reg.cfg.window.KNOWLEDGE_PAGES || []).filter(r => !inJson.has(r.slug));
  if (orphans.length) die(['nothing written: the KNOWLEDGE_PAGES block has ' + orphans.length + ' row(s) that no page.json registers, and regenerating would drop them:',
    ...orphans.map(r => `  "${r.slug}" (${r.path || 'no path'}): run node scripts/build-registry.cjs --adopt to move the row into ${r.path || '<dir>/'}page.json, or write that page.json yourself.`),
    '  If the page is being unregistered on purpose, delete its row from the block as well.', REGISTER_HELP].join('\n'));
}
const stale = [];
for (const [f, s] of outputs) {
  const cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  if (cur === s) continue;
  stale.push(f);
  if (!CHECK) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); }
}
if (CHECK && stale.length) {
  const lines = ['site registry is out of date: ' + stale.map(rel).join(', ')];
  if (stale.includes(reg.cfg.file)) lines.push(...diagnose(reg));
  const inJson = new Set(reg.entries.map(e => e.row.slug));
  const pasted = (reg.cfg.window.KNOWLEDGE_PAGES || []).some(r => !inJson.has(r.slug));
  lines.push((pasted ? 'Fix: node scripts/build-registry.cjs --adopt for the pasted row(s) above (a plain run refuses while they are there), then commit what it writes. '
    : 'Fix: node scripts/build-registry.cjs (then commit what it writes). ') + REGISTER_HELP);
  die(lines.join('\n'));
}
console.log(`${CHECK ? 'PASS' : stale.length ? 'wrote ' + stale.map(rel).join(', ') : 'up to date'}: ${stats.pages} registered pages (${stats.live} live), ${stats.concepts} concepts, ${stats.refs} ref and ${stats.seeAlso} seeAlso edges, ${stats.leetcode} LeetCode adapter rows`);

// What the KNOWLEDGE_PAGES block holds that the page.json files do not (the usual cause: a row pasted by hand).
function diagnose(reg) {
  const out = [];
  const inFile = new Map((reg.cfg.window.KNOWLEDGE_PAGES || []).map(r => [r.slug, r]));
  const inJson = new Map(reg.entries.map(e => [e.row.slug, e]));
  for (const [s, r] of inFile) {
    if (!inJson.has(s)) { out.push(`  "${s}" is in the KNOWLEDGE_PAGES block but no page.json registers it: the block is generated, so a hand-added row is lost on the next run. Write ${r.path || '<dir>/'}page.json instead, or run node scripts/build-registry.cjs --adopt to move the row there.`); continue; }
    const want = inJson.get(s).row, diff = Object.keys({ ...r, ...want }).filter(k => JSON.stringify(r[k]) !== JSON.stringify(want[k]));
    if (diff.length) out.push(`  "${s}": the block differs from ${inJson.get(s).dir}page.json in ${diff.join(', ')}${REG.titleInContent(inJson.get(s).meta) ? ' (an essay template page: title and desc come from content.<lang>.md)' : ''}. Edit page.json (or run --adopt to take the hand edit), not the block.`);
  }
  for (const s of inJson.keys()) if (!inFile.has(s)) out.push(`  "${s}" is registered by ${inJson.get(s).dir}page.json but not in the block yet.`);
  const order = [...inFile.keys()].filter(s => inJson.has(s)), want = [...inJson.keys()].filter(s => inFile.has(s));
  if (!out.length && order.join() !== want.join()) out.push('  the rows are in a different order than page.json "order" gives.');
  if (!out.length) out.push('  the block\'s text differs from what the generator writes (formatting or the banner).');
  return out;
}
