'use strict';
// Build the atlas from editorial sources. See atlas/graph/README.md and
// specs/atlas-search-index.md.
//   node scripts/build-atlas-data.cjs [--check] [--concept-map] [--bump-versions]
//   node scripts/build-atlas-data.cjs --graph <dir> [--check]  (default graph dir: atlas/graph;
//     output data.js is written beside the graph dir, so --graph investment/atlas/graph
//     writes investment/atlas/data.js; --concept-map/--bump-versions are main-atlas only)
//   node scripts/build-atlas-data.cjs --extra-lessons <dir> --out <dir>   (preview, writes only <dir>)
// Main atlas outputs:
//   atlas/data.js + atlas/questions.js  complete graph (galaxy, tools, tests); not loaded by the atlas page
//   atlas/atlas-index.js                up-front index of the atlas page (limit UPFRONT_LIMIT)
//   atlas/details/<region>.<kind>.js    on-demand details: nodes | edges | questions
//   (Concept search index is built independently by scripts/build-search-index.cjs -> search/.)
// --check: build in memory, compare every output with the committed files, and
//   fail on drift or on a size limit. --graph builds (e.g. investment) keep the
//   single complete data.js with questions inline.
// --bump-versions: rewrite ?v= references in atlas/index.html, atlas/galaxy.html and
//   the homepage's lazy references to <yyyymmdd>-<last commit touching that file>.
//   Run AFTER committing.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
let graphArg = null, extraLessonsArg = null, outArg = null;
const args = new Set();
for (let i = 0; i < argv.length; i++) {
  if (['--graph', '--extra-lessons', '--out'].includes(argv[i])) {
    const v = argv[i + 1];
    if (!v) { console.error(`ERROR: ${argv[i]} requires a directory argument.`); process.exit(2); }
    if (argv[i] === '--graph') graphArg = v; else if (argv[i] === '--extra-lessons') extraLessonsArg = v; else outArg = v;
    i++;
  } else args.add(argv[i]);
}
// --extra-lessons <dir>: also read fragments from <dir> (preview an import).
// --out <dir>: write every generated file into <dir> instead of beside the
//   graph (no merge-report, no CONCEPT-MAP/--bump-versions). Used by
//   atlas/tests/registry-import.cjs and for previews.
if (outArg && (args.has('--check') || args.has('--bump-versions') || args.has('--concept-map'))) {
  console.error('ERROR: --out cannot be combined with --check, --bump-versions or --concept-map.'); process.exit(2);
}
const graphDir = graphArg ? path.resolve(graphArg) : path.join(root, 'atlas', 'graph');
const lessonsDir = path.join(graphDir, 'lessons');
const pageDir = path.dirname(graphDir); // hrefs in the graph are relative to the atlas page

const STAGES = ['primary', 'junior', 'senior', 'university'];
const stageOrder = s => { const i = STAGES.indexOf(s); return i < 0 ? 4 : i; };

function loadWindowJS(file) {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb);
  return sb.window;
}
function bi(x) {
  return x && typeof x === 'object' && typeof x.zh === 'string' && typeof x.en === 'string'
    ? { zh: x.zh, en: x.en } : null;
}
function parseStepAnchor(href) {
  // Lesson pages live at <category>/<subtopic>/<slug>/; hrefs are relative to the
  // atlas page (e.g. ../physics/circuits/ohms-law/#step2). The slug is the last segment.
  const m = typeof href === 'string' && href.match(/^(?:\.\.\/)+(?:[^/#]+\/)*?([^/#]+)\/#step(\d+)$/);
  return m ? { slug: m[1], step: Number(m[2]) } : null;
}
function isExternal(href) { return typeof href === 'string' && /^https?:\/\//.test(href); }
function anchorExists(href) {
  // Returns true/false/null (null = cannot check, e.g. external URL).
  if (isExternal(href)) return null;
  const m = typeof href === 'string' && href.match(/^((?:\.\.\/)+(?:[^/#]+\/)*[^/#]+)\/#(.+)$/);
  if (!m) return false;
  const file = path.join(pageDir, m[1], 'index.html');
  if (!fs.existsSync(file)) return false;
  const html = fs.readFileSync(file, 'utf8');
  if (m[2].startsWith('step')) return html.includes(`id="${m[2]}"`);
  return html.includes(`id="${m[2]}"`) || html.includes(`name="${m[2]}"`);
}

// ---- inputs ---------------------------------------------------------------
const groups = JSON.parse(fs.readFileSync(path.join(graphDir, 'groups.json'), 'utf8'));
const types = JSON.parse(fs.readFileSync(path.join(graphDir, 'types.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(graphDir, 'core.json'), 'utf8'));
const decisions = JSON.parse(fs.readFileSync(path.join(graphDir, 'decisions.json'), 'utf8'));
const overrides = JSON.parse(fs.readFileSync(path.join(graphDir, 'partition-overrides.json'), 'utf8'));
const config = loadWindowJS(path.join(root, 'pages.config.js'));
const pageBySlug = new Map();
for (const p of (config.KNOWLEDGE_PAGES || [])) {
  if (p && p.slug) pageBySlug.set(p.slug, p);
}
// Category -> region: defaults plus "categories" claimed in groups.json
// (scripts/atlas-regions.cjs, shared with scripts/atlas-import-registry.cjs).
const CATEGORY_PARTITION = require('./atlas-regions.cjs').categoryRegions(groups);
// Optional search-term overlay: { "<node id>": { "zh": [..], "en": [..] } }.
// Lets an editor add what people type for an existing concept without
// touching its fragment; merged with the node's own aliases.
const aliasOverlayPath = path.join(graphDir, 'aliases.json');
const aliasOverlay = fs.existsSync(aliasOverlayPath) ? JSON.parse(fs.readFileSync(aliasOverlayPath, 'utf8')) : {};
// Canonical alias shape: { zh: string[], en: string[] } (either list may be
// empty, not both). An array of {zh,en} pairs is accepted and converted.
function normAliases(...inputs) {
  const out = { zh: [], en: [] };
  for (const a of inputs) {
    if (!a) continue;
    const pairs = Array.isArray(a) ? a : [a];
    for (const p of pairs) for (const l of ['zh', 'en']) {
      const v = p && p[l];
      for (const s of (Array.isArray(v) ? v : [v])) {
        if (typeof s !== 'string' || !s.trim()) continue;
        if (!out[l].includes(s.trim())) out[l].push(s.trim());
      }
    }
  }
  return out.zh.length || out.en.length ? out : undefined;
}
const aliasMap = {};
for (const [cid, d] of Object.entries(decisions)) {
  if (d && d.action === 'attach' && d.to) aliasMap[cid] = d.to;
}
const rewrite = id => aliasMap[id] || id;
const groupOrder = new Map(groups.map((g, i) => [g.id, i]));
const groupIds = new Set(groups.map(g => g.id));
const report = {
  counts: {}, conflicts: [], suspendedEdges: [], suspendedQuestions: [],
  reversePairs: [], unregisteredLessons: [], coverageGaps: [], decisionsApplied: [],
};

// ---- core nodes: add lessons[] / stage derived from their source ----------
const nodesById = new Map();
for (const n of core.nodes) {
  const node = JSON.parse(JSON.stringify(n));
  if (!node.lessons) {
    const a = parseStepAnchor(node.source);
    if (a && pageBySlug.has(a.slug)) {
      const p = pageBySlug.get(a.slug);
      let step = a.step;
      // Legacy pages (e.g. power-converters) cite #stepN without stepN ids in
      // the page. Do not assert an unverified step: keep the lesson on the
      // page and record the claimed step for editorial follow-up.
      if (anchorExists(node.source) === false) {
        step = null;
        (report.legacyStepAnchors = report.legacyStepAnchors || []).push({ node: node.id, slug: a.slug, claimedStep: a.step });
      }
      node.lessons = [{ slug: a.slug, step, category: p.category, stage: p.stage || 'university', primary: true }];
      node.stage = node.stage || p.stage || 'university';
    } else if (node.source && node.source.startsWith('../')) {
      const slug = node.source.split('#')[0].replace(/\/$/, '').split('/').pop();
      if (pageBySlug.has(slug)) {
        node.lessons = [{ slug, step: null, category: pageBySlug.get(slug).category, stage: pageBySlug.get(slug).stage || 'university', primary: true }];
        node.stage = node.stage || pageBySlug.get(slug).stage || 'university';
      }
    }
  }
  nodesById.set(node.id, node);
}

// ---- fragments ------------------------------------------------------------
const fragFiles = (fs.existsSync(lessonsDir)
  ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json')).sort().map(f => path.join(lessonsDir, f)) : [])
  .concat(extraLessonsArg ? fs.readdirSync(extraLessonsArg).filter(f => f.endsWith('.json')).sort().map(f => path.resolve(extraLessonsArg, f)) : []);
const newEdges = []; // {edge, owner}
const newQuestions = [];

function mapGroup(frag, page) {
  if (overrides[frag.slug]) return overrides[frag.slug];
  if (frag.group && groupIds.has(frag.group)) return frag.group;
  if (frag.group === 'optics') return 'waves';
  if (frag.group === 'uncertainty') return 'measurement';
  if (page && CATEGORY_PARTITION[page.category]) return CATEGORY_PARTITION[page.category];
  return 'society';
}

for (const file of fragFiles) {
  const frag = JSON.parse(fs.readFileSync(file, 'utf8'));
  const page = pageBySlug.get(frag.slug);
  if (!page || page.status !== 'live') {
    report.unregisteredLessons.push(frag.slug);
  }
  const stage = (page && page.stage) || frag.stage || 'university';
  const category = (page && page.category) || null;

  if (frag.schema === 2) {
    // v2 passthrough: nodes/edges/questions/attach already normalized.
    for (const n of (frag.nodes || [])) {
      if (nodesById.has(n.id)) {
        report.conflicts.push({ kind: 'node', id: n.id, from: frag.slug, action: 'skipped, existing node kept' });
        continue;
      }
      nodesById.set(n.id, { ...n, stage: n.stage || stage });
    }
    for (const at of (frag.attach || [])) {
      const target = nodesById.get(at.node);
      if (target) {
        (target.lessons = target.lessons || []).push({ slug: frag.slug, step: at.step ?? null, category, stage, primary: false });
        report.decisionsApplied.push({ slug: frag.slug, attachTo: at.node });
      }
    }
    for (const e of (frag.edges || [])) {
    const from = rewrite(e.from), to = rewrite(e.to);
    newEdges.push({ edge: { ...e, from, to, id: `${from}:${to}`, owner: frag.slug }, owner: frag.slug });
  }
    for (const q of (frag.questions || [])) newQuestions.push({ ...q, lesson: frag.slug, stage: q.stage || stage, group: q.group || mapGroup(frag, page) });
    // Essay fragments (scripts/atlas-import-registry.cjs) carry seeAlso: the
    // pages each concept relates to. They are not edges (no sourced reason);
    // the report lists the concepts those pages teach, for an editor.
    for (const [cid, slugs] of Object.entries(frag.seeAlso || {})) for (const slug of slugs) {
      (report.edgeCandidates = report.edgeCandidates || []).push({ concept: cid, page: slug });
    }
    continue;
  }

  // v1 normalization.
  const conceptId = frag.conceptId;
  const decision = decisions[conceptId];
  if (decision && decision.action === 'attach') {
    const target = nodesById.get(decision.to);
    if (!target) {
      report.conflicts.push({ kind: 'attach-target-missing', id: conceptId, from: frag.slug, to: decision.to });
    } else {
      const a = parseStepAnchor(frag.source);
      (target.lessons = target.lessons || []).push({
        slug: frag.slug, step: a ? a.step : null, category, stage, primary: false,
      });
      if (decision.switchSource && frag.source) target.source = frag.source;
      report.decisionsApplied.push({ slug: frag.slug, conceptId, attachTo: decision.to, switchSource: !!decision.switchSource });
    }
  } else {
    if (nodesById.has(conceptId)) {
      report.conflicts.push({ kind: 'node', id: conceptId, from: frag.slug, action: 'skipped, existing node kept (no decision)' });
    } else {
      const node = {
        id: conceptId,
        group: mapGroup(frag, page),
        stage,
        order: 50,
        title: bi(frag.title), description: bi(frag.description),
        ...(frag.formula ? { formula: frag.formula } : {}),
        source: frag.source,
        lessons: [{ slug: frag.slug, step: (parseStepAnchor(frag.source) || {}).step ?? null, category, stage, primary: true }],
      };
      if (frag.aliases) node.aliases = frag.aliases;
      if (frag.note) node.note = frag.note;
      nodesById.set(conceptId, node);
    }
  }
  for (const e of (frag.edges || [])) {
    const from = rewrite(e.from), to = rewrite(e.to);
    newEdges.push({
      edge: { id: `${from}:${to}`, from, to, type: e.type,
        label: bi(e.label), reason: bi(e.reason), source: e.source, owner: frag.slug },
      owner: frag.slug,
    });
  }
  (frag.routes || []).forEach((r, i) => {
    newQuestions.push({
      id: `q-${frag.slug}-${i}`, question: bi(r.title), chain: r.nodes.map(rewrite),
      target: { node: rewrite(conceptId), href: frag.source },
      ...(r.prompts ? { prompts: r.prompts.map(pr => ({ node: rewrite(pr.node), ask: bi(pr.ask) })) } : {}),
      ...(r.reveal ? { reveal: bi(r.reveal) } : {}),
      source: frag.source, lesson: frag.slug, stage, group: mapGroup(frag, page),
    });
  });
}

// ---- edges: merge with core, resolve conflicts, suspend dangling ----------
const edgesById = new Map();
for (const e of core.edges) edgesById.set(e.id, { ...e, owner: 'core' });
for (const { edge, owner } of newEdges) {
  const prev = edgesById.get(edge.id);
  if (!prev) { edgesById.set(edge.id, edge); continue; }
  const same = prev.type === edge.type && JSON.stringify(prev.label) === JSON.stringify(edge.label)
    && JSON.stringify(prev.reason) === JSON.stringify(edge.reason) && prev.source === edge.source;
  if (same) continue;
  if (owner === edge.to) {
    report.conflicts.push({ kind: 'edge', id: edge.id, kept: owner, dropped: prev.owner });
    edgesById.set(edge.id, edge);
  } else {
    report.conflicts.push({ kind: 'edge', id: edge.id, kept: prev.owner, dropped: owner });
  }
}
const edgeSet = new Set();
for (const [from, to] of [...edgesById.values()].map(e => [e.from, e.to])) {
  if (edgesById.has(`${to}:${from}`)) edgeSet.add([from, to].sort().join('<>'));
}
for (const key of edgeSet) {
  const [a, b] = key.split('<>');
  report.reversePairs.push(`${a}:${b} + ${b}:${a}`);
}
const edges = [];
for (const e of edgesById.values()) {
  if (!nodesById.has(e.from) || !nodesById.has(e.to)) {
    report.suspendedEdges.push({ id: e.id, owner: e.owner, missing: [!nodesById.has(e.from) ? e.from : null, !nodesById.has(e.to) ? e.to : null].filter(Boolean) });
    continue;
  }
  const { owner, ...rest } = e;
  edges.push(rest);
}
const adjacency = new Set();
for (const e of edges) { adjacency.add(`${e.from}|${e.to}`); adjacency.add(`${e.to}|${e.from}`); }

// ---- questions: validate chain adjacency, target membership, anchors -----
const questions = [];
for (const q of newQuestions) {
  const problems = [];
  if (!q.question || !q.question.zh || !q.question.en) problems.push('bilingual question missing');
  if (!Array.isArray(q.chain) || q.chain.length < 1) problems.push('chain empty');
  if (q.chain) {
    for (let i = 0; i + 1 < q.chain.length; i++) {
      if (!adjacency.has(`${q.chain[i]}|${q.chain[i + 1]}`)) problems.push(`no edge between ${q.chain[i]} and ${q.chain[i + 1]}`);
    }
    if (!q.chain.includes(q.target.node)) problems.push('target.node not in chain');
    for (const id of q.chain) if (!nodesById.has(id)) problems.push(`unknown chain node ${id}`);
    for (const pr of (q.prompts || [])) {
      if (!q.chain.includes(pr.node)) problems.push(`prompt node not in chain: ${pr.node}`);
      if (!pr.ask || !pr.ask.zh || !pr.ask.en) problems.push(`prompt ask not bilingual: ${pr.node}`);
    }
    if (q.reveal && (!q.reveal.zh || !q.reveal.en)) problems.push('reveal not bilingual');
  }
  const anchor = anchorExists(q.target.href);
  if (anchor === false) problems.push(`target href anchor missing: ${q.target.href}`);
  if (problems.length) { report.suspendedQuestions.push({ id: q.id, lesson: q.lesson, problems }); continue; }
  questions.push(q);
}

// ---- aliases: node's own + overlay, canonical shape ------------------------
for (const n of nodesById.values()) {
  const a = normAliases(n.aliases, aliasOverlay[n.id]);
  if (a) n.aliases = a; else delete n.aliases;
}
report.unknownAliasIds = Object.keys(aliasOverlay).filter(id => !nodesById.has(id));

// ---- sort -----------------------------------------------------------------
const nodes =[...nodesById.values()].sort((a, b) =>
  (groupOrder.get(a.group) ?? 99) - (groupOrder.get(b.group) ?? 99)
  || stageOrder(a.stage) - stageOrder(b.stage)
  || (a.order ?? 50) - (b.order ?? 50)
  || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
edges.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
questions.sort((a, b) => stageOrder(a.stage) - stageOrder(b.stage) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

// ---- coverage: live non-leetcode pages with no node lesson ----------------
const covered = new Set();
for (const n of nodes) for (const l of (n.lessons || [])) covered.add(l.slug);
if (!graphArg) for (const p of pageBySlug.values()) {
  if (p.status === 'live' && p.category !== 'leetcode' && !covered.has(p.slug)) {
    report.coverageGaps.push(p.slug);
  }
}
report.counts = {
  groups: groups.length, nodes: nodes.length, edges: edges.length,
  trails: core.trails.length, questions: questions.length,
  fragments: fragFiles.length,
};

// ---- emit data.js ----------------------------------------------------------
const emit = obj => JSON.stringify(obj);
const out = [];
out.push(`/* GENERATED by scripts/build-atlas-data.cjs from ${path.relative(root, graphDir)}/ \u2014 do not hand-edit. */`);
out.push('/* Editorial atlas data. Positions indicate regions, not inferred similarity. */');
out.push('(() => {');
out.push("  'use strict';");
out.push('  window.ATLAS = {');
out.push(`    groups: [${groups.map(g => emit({ id: g.id, label: g.label, mark: g.mark })).join(', ')}],`);
if (core.defaultNode) out.push(`    defaultNode: ${emit(core.defaultNode)},`);
out.push(`    types: ${emit(types)},`);
out.push('    nodes: [');
for (const n of nodes) out.push(`      ${emit(n)},`);
out.push('    ],');
out.push('    edges: [');
for (const e of edges) out.push(`      ${emit(e)},`);
out.push('    ],');
out.push(`    trails: [${core.trails.map(t => emit(t)).join(',\n      ')}],`);
if (!graphArg) {
  // Main atlas: questions live in atlas/questions.js; data.js keeps
  // nodes/edges/trails only.
  out.push('  };');
} else {
  out.push('    questions: [');
  for (const q of questions) out.push(`      ${emit(q)},`);
  out.push('    ],');
  out.push('  };');
}
out.push('})();');
const dataJS = out.join('\n') + '\n';
report.sizeBytes = Buffer.byteLength(dataJS, 'utf8');
let questionsJS = null;
if (!graphArg) {
  const qout = [];
  qout.push(`/* GENERATED by scripts/build-atlas-data.cjs from ${path.relative(root, graphDir)}/ \u2014 do not hand-edit. */`);
  qout.push('/* Main-atlas questions. Load after data.js, before app.js; assigns into window.ATLAS. */');
  qout.push('(() => {');
  qout.push("  'use strict';");
  qout.push('  window.ATLAS.questions = [');
  for (const q of questions) qout.push(`    ${emit(q)},`);
  qout.push('  ];');
  qout.push('})();');
  questionsJS = qout.join('\n') + '\n';
  report.questionsBytes = Buffer.byteLength(questionsJS, 'utf8');
  report.combinedBytes = report.sizeBytes + report.questionsBytes;
}

// ---- split runtime payload (main atlas) -----------------------------------
// data.js + questions.js stay the complete graph (galaxy, tools, tests). The
// atlas page itself loads only atlas-index.js up front (titles, aliases and
// structure) and fetches details/<region>.js when a concept, route, question
// or search needs that region's text. See specs/atlas-search-index.md.
const UPFRONT_LIMIT = 150000;  // atlas-index.js, enforced (exit 1) on build and --check
const crypto = require('node:crypto');
let indexJS = null, chunkJS = null;
if (!graphArg) {
  const regionOf = new Map(nodes.map(n => [n.id, n.group]));
  const chunkData = new Map(groups.map(g => [g.id, { nodes: [], edges: [], questions: [] }]));
  // Compact rows, expanded to the usual objects when atlas-index.js runs:
  // node [id, stage index|-1, title zh, title en, lesson slugs ('*' = primary)]
  // grouped by region; edges [from index, to index]; questions
  // [id, stage index, question zh, question en, chain indices, region index].
  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const idxNodes = new Map(groups.map(g => [g.id, []]));
  for (const n of nodes) {
    const { id, group, stage, title, order, ...rest } = n;
    if (!idxNodes.has(group)) { console.error(`ERROR: node ${id} has unknown region ${group}; add it to groups.json.`); process.exit(1); }
    idxNodes.get(group).push([id, STAGES.indexOf(stage), title.zh, title.en,
      (n.lessons || []).map(l => (l.primary ? '*' : '') + l.slug)]);
    chunkData.get(group).nodes.push([id, rest]);
  }
  for (const e of edges) {
    const { id, from, to, ...rest } = e;
    const a = regionOf.get(from), b = regionOf.get(to);
    chunkData.get(a).edges.push([id, rest]);
    if (b !== a) chunkData.get(b).edges.push([id, rest]); // a node's chunk holds all its relations
  }
  const idxQuestions = [];
  for (const q of questions) {
    const { id, question, stage, chain, group, ...rest } = q;
    const region = groupIds.has(group) ? group : regionOf.get(q.target.node);
    idxQuestions.push([id, STAGES.indexOf(stage), question.zh, question.en, chain.map(c => nodeIndex.get(c)), groupOrder.get(region)]);
    chunkData.get(region).questions.push([id, rest]);
  }
  // Three parts per region, each loaded only when needed:
  //   <region>.nodes.js      descriptions, aliases, formulas, sources (lists, search)
  //   <region>.edges.js      every relation touching the region (a concept's detail)
  //   <region>.questions.js  prompts, reveals, targets (an opened question)
  // Empty parts are not emitted; the app treats a missing part as loaded.
  chunkJS = new Map();
  for (const [gid, c] of chunkData) {
    for (const kind of ['nodes', 'edges', 'questions']) {
      if (!c[kind].length) continue;
      const id = `${gid}.${kind}`;
      chunkJS.set(id, [
        `/* GENERATED by scripts/build-atlas-data.cjs from ${path.relative(root, graphDir)}/ — do not hand-edit. */`,
        `/* ${kind} details for region "${gid}", loaded on demand by atlas/app.js (ATLAS.loadDetails). */`,
        `window.ATLAS.addDetails(${emit(id)},{${emit(kind)}:{\n${c[kind].map(([k, v]) => `${emit(k)}:${emit(v)}`).join(',\n')}\n}});`,
      ].join('\n') + '\n');
    }
  }
  const chunks = {};
  for (const [gid, js] of chunkJS) chunks[gid] = `details/${gid}.js?v=${crypto.createHash('sha1').update(js).digest('hex').slice(0, 10)}`;
  const ix = [];
  ix.push(`/* GENERATED by scripts/build-atlas-data.cjs from ${path.relative(root, graphDir)}/ — do not hand-edit. */`);
  ix.push('/* Up-front atlas index: structure, titles and aliases only. Descriptions, relation');
  ix.push('   reasons and question prompts live in details/<region>.js (see app.js loadDetails). */');
  ix.push('(() => {');
  ix.push("  'use strict';");
  ix.push(`  const STAGES = ${emit(STAGES)};`);
  ix.push(`  const groups = [${groups.map(g => emit({ id: g.id, label: g.label, mark: g.mark })).join(',\n    ')}];`);
  ix.push('  const N = {');
  ix.push([...idxNodes].map(([gid, rows]) => `    ${emit(gid)}: [\n${rows.map(r => '      ' + emit(r)).join(',\n')}\n    ]`).join(',\n'));
  ix.push('  };');
  ix.push(`  const E = ${emit(edges.map(e => [nodeIndex.get(e.from), nodeIndex.get(e.to)]))};`);
  ix.push('  const Q = [');
  ix.push(idxQuestions.map(q => '    ' + emit(q)).join(',\n'));
  ix.push('  ];');
  ix.push('  const nodes = [];');
  ix.push('  for (const g of groups) for (const [id, s, zh, en, ls] of (N[g.id] || [])) {');
  ix.push('    const n = { id, group: g.id, title: { zh, en } };');
  ix.push('    if (s >= 0) n.stage = STAGES[s];');
  ix.push("    if (ls.length) n.lessons = ls.map(x => ({ slug: x.replace(/^\\*/, ''), primary: x[0] === '*' }));");
  ix.push('    nodes.push(n);');
  ix.push('  }');
  ix.push('  window.ATLAS = {');
  ix.push('    partial: true,');
  ix.push(`    chunks: ${emit(chunks)},`);
  ix.push('    groups,');
  if (core.defaultNode) ix.push(`    defaultNode: ${emit(core.defaultNode)},`);
  ix.push(`    types: ${emit(types)},`);
  ix.push('    nodes,');
  ix.push("    edges: E.map(([a, b]) => ({ id: nodes[a].id + ':' + nodes[b].id, from: nodes[a].id, to: nodes[b].id })),");
  ix.push(`    trails: [${core.trails.map(t => emit(t)).join(',\n      ')}],`);
  ix.push('    questions: Q.map(([id, s, zh, en, chain, g]) => ({ id, question: { zh, en }, stage: STAGES[s], chain: chain.map(i => nodes[i].id), group: groups[g].id })),');
  ix.push('  };');
  ix.push('})();');
  indexJS = ix.join('\n') + '\n';
  report.indexBytes = Buffer.byteLength(indexJS, 'utf8');
  report.chunkBytes = Object.fromEntries([...chunkJS].map(([k, v]) => [k, Buffer.byteLength(v, 'utf8')]));
}

const outDir = outArg ? path.resolve(outArg) : path.dirname(graphDir);
if (outArg) fs.mkdirSync(outDir, { recursive: true });
const dataPath = path.join(outDir, 'data.js');
const questionsPath = path.join(outDir, 'questions.js');
function checkFile(filePath, expected, label) {
  let current;
  try { current = fs.readFileSync(filePath, 'utf8'); } catch (_) { current = null; }
  if (current !== expected) {
    console.log(`DRIFT: generated ${label} differs from committed file.`);
    if (current === null) { console.log(`  committed file missing: ${filePath}`); }
    else {
      const a = current.split('\n'), b = expected.split('\n');
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { console.log(`first diff at line ${i + 1}:\n  committed: ${(a[i] || '').slice(0, 200)}\n  generated: ${(b[i] || '').slice(0, 200)}`); break; }
      }
    }
    process.exit(1);
  }
}
const sizeLine = questionsJS !== null
  ? `data.js ${report.sizeBytes} bytes + questions.js ${report.questionsBytes} bytes = combined ${report.combinedBytes} bytes`
  : `${report.sizeBytes} bytes`;
const indexPath = path.join(outDir, 'atlas-index.js');
const detailsDir = path.join(outDir, 'details');
const staleChunks = () => (fs.existsSync(detailsDir) ? fs.readdirSync(detailsDir) : [])
  .filter(f => f.endsWith('.js') && !(chunkJS && chunkJS.has(f.slice(0, -3))));
if (args.has('--check')) {
  checkFile(dataPath, dataJS, path.relative(root, dataPath));
  if (questionsJS !== null) checkFile(questionsPath, questionsJS, path.relative(root, questionsPath));
  if (indexJS !== null) {
    checkFile(indexPath, indexJS, path.relative(root, indexPath));
    for (const [gid, js] of chunkJS) checkFile(path.join(detailsDir, gid + '.js'), js, path.relative(root, path.join(detailsDir, gid + '.js')));
    const stale = staleChunks();
    if (stale.length) { console.log(`DRIFT: stale detail chunks without a region: ${stale.join(', ')}`); process.exit(1); }
  }
  console.log(`CHECK OK: ${report.counts.nodes} nodes, ${report.counts.edges} edges, ${report.counts.questions} questions, ${sizeLine}.`);
} else {
  fs.writeFileSync(dataPath, dataJS);
  if (questionsJS !== null) fs.writeFileSync(questionsPath, questionsJS);
  if (indexJS !== null) {
    fs.writeFileSync(indexPath, indexJS);
    fs.mkdirSync(detailsDir, { recursive: true });
    for (const [gid, js] of chunkJS) fs.writeFileSync(path.join(detailsDir, gid + '.js'), js);
    for (const f of staleChunks()) fs.unlinkSync(path.join(detailsDir, f)); // generated dir only
  }
  console.log(`WROTE ${path.relative(root, dataPath)}: ${report.counts.nodes} nodes, ${report.counts.edges} edges, ${report.counts.questions} questions, ${sizeLine}.`);
}
let gateFailed = false;
if (indexJS !== null) {
  const chunkTotal = Object.values(report.chunkBytes).reduce((a, b) => a + b, 0);
  const largest = Object.entries(report.chunkBytes).sort((a, b) => b[1] - a[1])[0];
  console.log(`RUNTIME: atlas-index.js ${report.indexBytes} bytes up front (limit ${UPFRONT_LIMIT}); details/ ${chunkTotal} bytes in ${chunkJS.size} chunks (largest ${largest[0]} ${largest[1]}).`);
  if (report.indexBytes > UPFRONT_LIMIT) { console.log(`ERROR: atlas-index.js exceeds the ${UPFRONT_LIMIT}-byte up-front limit (${report.indexBytes} bytes).`); gateFailed = true; }
}
if (args.has('--bump-versions') && !graphArg) {
  // SGT date (repo convention) + per-file short sha of the last commit that
  // touched each referenced file, so re-running the bump is stable AND a
  // change to app.js alone still invalidates its cache key (a single shared
  // sha missed the P1 app.js change: data.js was untouched, so its sha did
  // not move and browsers kept the stale app.js).
  const date = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
  const lastSha = (f) => {
    try { return execSync(`git log -1 --format=%h -- ${f}`, { cwd: root }).toString().trim(); } catch (_) {}
    try { return execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch (_) {}
    return '';
  };
  const vData = `${date}-${lastSha('atlas/data.js')}`;
  const vApp = `${date}-${lastSha('atlas/app.js')}`;
  const vGalaxy = `${date}-${lastSha('atlas/galaxy/app.mjs')}`;
  const vQuestions = `${date}-${lastSha('atlas/questions.js')}`;
  const vIndex = `${date}-${lastSha('atlas/atlas-index.js')}`;
  for (const htmlFile of [path.join(root, 'atlas', 'index.html'), path.join(root, 'atlas', 'galaxy.html')]) {
    if (!fs.existsSync(htmlFile)) continue;
    let html = fs.readFileSync(htmlFile, 'utf8');
    html = html.replace(/src="data\.js\?v=[^"]*"/g, `src="data.js?v=${vData}"`);
    html = html.replace(/src="questions\.js\?v=[^"]*"/g, `src="questions.js?v=${vQuestions}"`);
    html = html.replace(/src="atlas-index\.js\?v=[^"]*"/g, `src="atlas-index.js?v=${vIndex}"`);
    html = html.replace(/src="app\.js\?v=[^"]*"/g, `src="app.js?v=${vApp}"`);
    html = html.replace(/src="galaxy\/app\.mjs\?v=[^"]*"/g, `src="galaxy/app.mjs?v=${vGalaxy}"`);
    fs.writeFileSync(htmlFile, html);
    console.log(`BUMPED ${path.relative(root, htmlFile)} data=${vData} index=${vIndex} app=${vApp} galaxy=${vGalaxy} questions=${vQuestions}`);
  }
}
if (args.has('--bump-versions') && graphArg) console.log('NOTE: --bump-versions skipped for --graph (main atlas only).');
// ---- CONCEPT-MAP appendix (P1) -------------------------------------------
if (args.has('--concept-map') && !graphArg) {
  const START = '<!-- GENERATED:atlas-nodes -->';
  const END = '<!-- /GENERATED:atlas-nodes -->';
  const groupLabel = new Map(groups.map(g => [g.id, g]));
  const lines = [];
  lines.push('## \u4e09\u3001\u56fe\u8c31\u8282\u70b9\u7d22\u5f15\uff08\u751f\u6210\uff0c\u52ff\u624b\u6539\uff09');
  lines.push('');
  lines.push(`${nodes.length} \u4e2a\u6982\u5ff5 \u00b7 ${edges.length} \u6761\u5173\u7cfb \u00b7 ${groups.length} \u4e2a\u5206\u533a \u00b7 \u7531 scripts/build-atlas-data.cjs --concept-map \u751f\u6210\u3002\u8282\u70b9\u6392\u5e8f\u4e0e data.js \u4e00\u81f4\uff08\u5206\u533a\u5e8f\u3001\u5b66\u6bb5\u5e8f\u3001order\u3001id\uff09\u3002`);
  lines.push('');
  for (const g of groups) {
    const members = nodes.filter(n => n.group === g.id);
    if (!members.length) continue;
    lines.push(`### ${g.mark} ${g.label.zh} / ${g.label.en}`);
    lines.push('');
    lines.push('| \u6982\u5ff5 | \u6765\u6e90 | \u8bfe\u7a0b |');
    lines.push('| --- | --- | --- |');
    for (const n of members) {
      const lessons = (n.lessons || []).map(l => l.step !== null && l.step !== undefined ? `${l.slug}#step${l.step}` : l.slug).join(', ') || '\u2014';
      lines.push(`| ${n.title.zh} / ${n.title.en} | ${n.source} | ${lessons} |`);
    }
    lines.push('');
  }
  const block = [START, ...lines, END].join('\n');
  const cmPath = path.join(root, 'CONCEPT-MAP.md');
  const cm = fs.readFileSync(cmPath, 'utf8');
  if (args.has('--check')) {
    const has = cm.includes(START) && cm.includes(END);
    const cur = has ? cm.slice(cm.indexOf(START), cm.indexOf(END) + END.length) : null;
    if (cur !== block) { console.log('DRIFT: CONCEPT-MAP appendix differs from generated block.'); process.exit(1); }
    console.log('CHECK OK: CONCEPT-MAP appendix matches.');
  } else {
    let next;
    if (cm.includes(START) && cm.includes(END)) {
      next = cm.slice(0, cm.indexOf(START)) + block + cm.slice(cm.indexOf(END) + END.length);
    } else {
      next = cm.replace(/\s*$/, '\n') + '\n' + block + '\n';
    }
    fs.writeFileSync(cmPath, next);
    console.log('WROTE CONCEPT-MAP appendix.');
  }
}
if (report.edgeCandidates) for (const c of report.edgeCandidates) c.taughtBy = nodes.filter(n => (n.lessons || []).some(l => l.slug === c.page)).map(n => n.id);
if (!args.has('--check') && !outArg) fs.writeFileSync(path.join(graphDir, 'merge-report.json'), JSON.stringify(report, null, 2) + '\n');
if (outArg) fs.writeFileSync(path.join(outDir, 'merge-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`REPORT: conflicts=${report.conflicts.length} suspendedEdges=${report.suspendedEdges.length} suspendedQuestions=${report.suspendedQuestions.length} coverageGaps=${report.coverageGaps.length} decisions=${report.decisionsApplied.length}`);
if (report.conflicts.length) console.log('CONFLICTS:', JSON.stringify(report.conflicts.slice(0, 20)));
if (report.suspendedEdges.length) console.log('SUSPENDED EDGES:', JSON.stringify(report.suspendedEdges.slice(0, 20)));
if (report.suspendedQuestions.length) console.log('SUSPENDED QUESTIONS:', JSON.stringify(report.suspendedQuestions.slice(0, 20)));
if (report.unknownAliasIds && report.unknownAliasIds.length) console.log('UNKNOWN ALIAS IDS (aliases.json):', JSON.stringify(report.unknownAliasIds));
// The old 450,000-byte data.js + questions.js gate is retired: the atlas page no
// longer loads those files. The up-front gate above replaces it.
if (gateFailed) process.exit(1);
