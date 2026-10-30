'use strict';
// Build atlas/data.js from editorial sources. See atlas/graph/README (P0).
//   node scripts/build-atlas-data.cjs [--check] [--bump-versions]
//   node scripts/build-atlas-data.cjs --graph <dir> [--check]  (default graph dir: atlas/graph;
//     output data.js is written beside the graph dir, so --graph atlas-investment/graph
//     writes atlas-investment/data.js; --concept-map/--bump-versions are main-atlas only)
// --check: build in memory and compare with the committed atlas/data.js.
// --bump-versions: rewrite ?v= references in atlas/index.html and atlas/galaxy.html
//   to <yyyymmdd>-<last commit touching that file>. Run AFTER committing.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
let graphArg = null;
const args = new Set();
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--graph') {
    graphArg = argv[i + 1];
    if (!graphArg) { console.error('ERROR: --graph requires a directory argument.'); process.exit(2); }
    i++;
  } else args.add(argv[i]);
}
const graphDir = graphArg ? path.resolve(graphArg) : path.join(root, 'atlas', 'graph');
const lessonsDir = path.join(graphDir, 'lessons');

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
  const m = typeof href === 'string' && href.match(/^\.\.\/([^/]+)\/#step(\d+)$/);
  return m ? { slug: m[1], step: Number(m[2]) } : null;
}
function isExternal(href) { return typeof href === 'string' && /^https?:\/\//.test(href); }
function anchorExists(href) {
  // Returns true/false/null (null = cannot check, e.g. external URL).
  if (isExternal(href)) return null;
  const m = typeof href === 'string' && href.match(/^\.\.\/([^/]+)\/#(.+)$/);
  if (!m) return false;
  const file = path.join(root, m[1], 'index.html');
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
// Category -> partition defaults. Physics splits by topic, so physics defaults
// to waves and the circuits cases live in partition-overrides.json.
const CATEGORY_PARTITION = {
  math: 'math', signal: 'systems', engineering: 'systems',
  probability: 'measurement', computing: 'computing', chemistry: 'matter',
  biology: 'life', earth: 'earth', physics: 'waves',
  psychology: 'life', language: 'society',
};
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
      const slug = node.source.split('/')[1];
      if (pageBySlug.has(slug)) {
        node.lessons = [{ slug, step: null, category: pageBySlug.get(slug).category, stage: pageBySlug.get(slug).stage || 'university', primary: true }];
        node.stage = node.stage || pageBySlug.get(slug).stage || 'university';
      }
    }
  }
  nodesById.set(node.id, node);
}

// ---- fragments ------------------------------------------------------------
const fragFiles = fs.existsSync(lessonsDir)
  ? fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json')).sort() : [];
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
  const frag = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
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

// ---- sort -----------------------------------------------------------------
const nodes = [...nodesById.values()].sort((a, b) =>
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
out.push('    questions: [');
for (const q of questions) out.push(`      ${emit(q)},`);
out.push('    ],');
out.push('  };');
out.push('})();');
const dataJS = out.join('\n') + '\n';
report.sizeBytes = Buffer.byteLength(dataJS, 'utf8');

const dataPath = path.join(path.dirname(graphDir), 'data.js');
if (args.has('--check')) {
  const current = fs.readFileSync(dataPath, 'utf8');
  if (current !== dataJS) {
    console.log('DRIFT: generated atlas/data.js differs from committed file.');
    const a = current.split('\n'), b = dataJS.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) { console.log(`first diff at line ${i + 1}:\n  committed: ${(a[i] || '').slice(0, 200)}\n  generated: ${(b[i] || '').slice(0, 200)}`); break; }
    }
    process.exit(1);
  }
  console.log(`CHECK OK: ${report.counts.nodes} nodes, ${report.counts.edges} edges, ${report.counts.questions} questions, ${report.sizeBytes} bytes.`);
} else {
  fs.writeFileSync(dataPath, dataJS);
  console.log(`WROTE atlas/data.js: ${report.counts.nodes} nodes, ${report.counts.edges} edges, ${report.counts.questions} questions, ${report.sizeBytes} bytes.`);
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
  for (const htmlFile of [path.join(root, 'atlas', 'index.html'), path.join(root, 'atlas', 'galaxy.html')]) {
    if (!fs.existsSync(htmlFile)) continue;
    let html = fs.readFileSync(htmlFile, 'utf8');
    html = html.replace(/src="data\.js\?v=[^"]*"/g, `src="data.js?v=${vData}"`);
    html = html.replace(/src="app\.js\?v=[^"]*"/g, `src="app.js?v=${vApp}"`);
    html = html.replace(/src="galaxy\/app\.mjs\?v=[^"]*"/g, `src="galaxy/app.mjs?v=${vGalaxy}"`);
    fs.writeFileSync(htmlFile, html);
    console.log(`BUMPED ${path.relative(root, htmlFile)} data=${vData} app=${vApp} galaxy=${vGalaxy}`);
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
if (!args.has('--check')) fs.writeFileSync(path.join(graphDir, 'merge-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`REPORT: conflicts=${report.conflicts.length} suspendedEdges=${report.suspendedEdges.length} suspendedQuestions=${report.suspendedQuestions.length} coverageGaps=${report.coverageGaps.length} decisions=${report.decisionsApplied.length}`);
if (report.conflicts.length) console.log('CONFLICTS:', JSON.stringify(report.conflicts.slice(0, 20)));
if (report.suspendedEdges.length) console.log('SUSPENDED EDGES:', JSON.stringify(report.suspendedEdges.slice(0, 20)));
if (report.suspendedQuestions.length) console.log('SUSPENDED QUESTIONS:', JSON.stringify(report.suspendedQuestions.slice(0, 20)));
if (report.sizeBytes > 400 * 1024) console.log('WARNING: data.js exceeds the 400KB gate; split questions[] to atlas/questions.js per design §5.7.');
