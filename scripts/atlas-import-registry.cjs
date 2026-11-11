#!/usr/bin/env node
'use strict';
// Turn an essay page's REGISTRY.json into an atlas fragment, one concept per
// chapter, each with its own anchor and aliases. Format and workflow:
// specs/atlas-search-index.md ("Essay pages") and atlas/graph/README.md.
//
//   node scripts/atlas-import-registry.cjs <essay dir | REGISTRY.json> [--region <id>] [--out <file>] [--force]
//     Writes atlas/graph/lessons/<slug>.json (schema 2, kind "essay"). Then run
//     node scripts/build-atlas-data.cjs && node atlas/tests/data-quality.cjs
//   node scripts/atlas-import-registry.cjs --add-region <id> --zh <label> --en <label> [--categories a,b] [--mark NN]
//     Appends a region to atlas/graph/groups.json; the listed page categories
//     (e.g. tech) then map to it.
//
// The page must be registered as live in pages.config.js before the build's
// validator passes (lesson slug live, chapter anchor present in its index.html).
// relatedPages become "seeAlso" (listed as edge candidates in merge-report.json),
// never edges: an edge needs a written, sourced reason.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { categoryRegions } = require('./atlas-regions.cjs');

const root = path.resolve(__dirname, '..');
const STAGES = ['primary', 'junior', 'senior', 'university'];
const argv = process.argv.slice(2);
const opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--force') opt.force = true;
  else if (a.startsWith('--')) { opt[a.slice(2)] = argv[i + 1]; i++; }
  else pos.push(a);
}
const graphDir = path.resolve(opt.graph || path.join(root, 'atlas', 'graph'));
const groupsPath = path.join(graphDir, 'groups.json');
const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
const die = msg => { console.error('ERROR: ' + msg); process.exit(1); };

// ---- --add-region -----------------------------------------------------------
if (opt['add-region']) {
  const id = opt['add-region'];
  if (!/^[a-z][a-z0-9-]*$/.test(id)) die(`region id must be kebab-case: ${id}`);
  if (groups.some(g => g.id === id)) die(`region ${id} already exists in ${path.relative(root, groupsPath)}`);
  if (!opt.zh || !opt.en) die('--add-region needs --zh <label> and --en <label>');
  const cats = (opt.categories || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const c of cats) {
    const owner = groups.find(g => (g.categories || []).includes(c));
    if (owner) die(`category ${c} is already claimed by region ${owner.id}`);
  }
  const order = Math.max(0, ...groups.map(g => g.order || 0)) + 1;
  const g = { id, label: { en: opt.en, zh: opt.zh }, mark: opt.mark || String(order).padStart(2, '0'), order };
  if (cats.length) g.categories = cats;
  groups.push(g);
  fs.writeFileSync(groupsPath, JSON.stringify(groups) + '\n');
  console.log(`ADDED region ${id} (${opt.zh} / ${opt.en}), mark ${g.mark}${cats.length ? ', categories ' + cats.join(', ') : ''} to ${path.relative(root, groupsPath)}`);
  process.exit(0);
}

// ---- import -----------------------------------------------------------------
if (pos.length !== 1) die('usage: atlas-import-registry.cjs <essay dir | REGISTRY.json> [--region <id>] [--out <file>] [--force]\n       atlas-import-registry.cjs --add-region <id> --zh <label> --en <label> [--categories a,b]');
let regPath = path.resolve(pos[0]);
if (fs.existsSync(regPath) && fs.statSync(regPath).isDirectory()) regPath = path.join(regPath, 'REGISTRY.json');
if (!fs.existsSync(regPath)) die(`no REGISTRY.json at ${regPath}`);
const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));

const problems = [], warnings = [];
const nonempty = s => typeof s === 'string' && s.trim().length > 0;
const bilingual = (x, at) => { if (!x || !nonempty(x.zh) || !nonempty(x.en)) problems.push(`${at}: needs both zh and en`); };
if (!nonempty(reg.slug) || !/^[a-z0-9][a-z0-9-]*$/.test(reg.slug)) problems.push('slug: missing or not kebab-case');
if (!nonempty(reg.path) || !/^([a-z0-9-]+\/)+$/.test(reg.path) || !reg.path.endsWith(`/${reg.slug}/`)) problems.push('path: must be a relative directory ending in "<slug>/", e.g. "<category>/<subtopic>/<slug>/"');
if (!STAGES.includes(reg.stage)) problems.push(`stage: must be one of ${STAGES.join('/')}`);
if (!Array.isArray(reg.concepts) || !reg.concepts.length) problems.push('concepts: none');

// Registry state and existing node ids (core + other fragments) for collisions.
const cfg = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'pages.config.js'), 'utf8'), cfg);
const pages = cfg.window.KNOWLEDGE_PAGES || [];
const page = pages.find(p => p.slug === reg.slug);
if (!page) warnings.push(`page ${reg.slug} is not registered in pages.config.js yet; the build reports it as unregistered and data-quality fails until it is live`);
else if (page.status !== 'live') warnings.push(`page ${reg.slug} is registered but not live`);
else if (page.path !== reg.path) problems.push(`path ${reg.path} differs from pages.config.js (${page.path})`);
const category = reg.category || (page && page.category);
const regionMap = categoryRegions(groups);
const region = opt.region || regionMap[category];
if (!region) problems.push(`no region for category "${category}": pass --region <id>, or add one with --add-region <id> --zh .. --en .. --categories ${category}`);
else if (!groups.some(g => g.id === region)) problems.push(`region "${region}" is not in groups.json: add it with --add-region`);
const lessonsDir = path.join(graphDir, 'lessons');
const outFile = path.resolve(opt.out || path.join(lessonsDir, `${reg.slug}.json`));
const existing = new Map();
for (const n of JSON.parse(fs.readFileSync(path.join(graphDir, 'core.json'), 'utf8')).nodes) existing.set(n.id, 'core.json');
for (const f of fs.existsSync(lessonsDir) ? fs.readdirSync(lessonsDir) : []) {
  if (!f.endsWith('.json') || path.join(lessonsDir, f) === outFile) continue;
  const fr = JSON.parse(fs.readFileSync(path.join(lessonsDir, f), 'utf8'));
  if (fr.schema === 2) for (const n of fr.nodes || []) existing.set(n.id, f); else if (fr.conceptId) existing.set(fr.conceptId, f);
}
const html = fs.existsSync(path.join(root, reg.path || '', 'index.html')) ? fs.readFileSync(path.join(root, reg.path, 'index.html'), 'utf8') : null;
if (!html) warnings.push(`${reg.path}index.html not found; chapter anchors not checked here (the build validator checks them)`);
const knownSlugs = new Set(pages.map(p => p.slug));

const seen = new Set(), nodes = [], seeAlso = {};
(reg.concepts || []).forEach((c, i) => {
  const at = `concepts[${i}]${c && c.id ? ' (' + c.id + ')' : ''}`;
  if (!c || !nonempty(c.id) || !/^[a-z0-9][a-z0-9-]*$/.test(c.id)) { problems.push(`${at}: id missing or not kebab-case`); return; }
  if (seen.has(c.id)) problems.push(`${at}: duplicate id in this registry`);
  seen.add(c.id);
  if (existing.has(c.id)) problems.push(`${at}: id already used by ${existing.get(c.id)}; rename it (e.g. ${reg.slug}-${c.id})`);
  bilingual(c.title, `${at}.title`);
  bilingual(c.desc, `${at}.desc`);
  const anchor = typeof c.anchor === 'string' ? c.anchor.replace(/^#/, '') : '';
  if (!/^[A-Za-z][\w-]*$/.test(anchor)) problems.push(`${at}.anchor: expected "#chN"`);
  else if (html && !html.includes(`id="${anchor}"`)) problems.push(`${at}.anchor: #${anchor} not found in ${reg.path}index.html`);
  const aliases = { zh: [], en: [] };
  for (const l of ['zh', 'en']) for (const a of ((c.aliases || {})[l] || [])) if (nonempty(a) && !aliases[l].includes(a.trim())) aliases[l].push(a.trim());
  if (!aliases.zh.length && !aliases.en.length) warnings.push(`${at}: no aliases; search will only find its title and description`);
  const related = (c.relatedPages || []).filter(s => { if (!knownSlugs.has(s)) { warnings.push(`${at}.relatedPages: ${s} is not a registered page`); return false; } return true; });
  if (related.length) seeAlso[c.id] = related;
  const node = {
    id: c.id, group: region, stage: reg.stage, order: 50 + i,
    title: { zh: c.title && c.title.zh, en: c.title && c.title.en },
    description: { zh: c.desc && c.desc.zh, en: c.desc && c.desc.en },
    source: `../${reg.path}#${anchor}`,
    lessons: [{ slug: reg.slug, step: null, anchor, category, stage: reg.stage, primary: true }],
  };
  if (aliases.zh.length || aliases.en.length) node.aliases = aliases;
  nodes.push(node);
});
for (const w of warnings) console.log('WARN: ' + w);
if (problems.length) { for (const p of problems) console.error('ERROR: ' + p); process.exit(1); }
let prev = null;
if (fs.existsSync(outFile)) {
  prev = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  if (prev.kind !== 'essay' && !opt.force) die(`${path.relative(root, outFile)} exists and was not generated from a REGISTRY.json; pass --force to replace it`);
}
// Edges and questions are written by hand after the import (they need a sourced reason); a
// re-import of the same essay keeps them, dropping any whose endpoint is no longer a concept here.
const keep = (prev && prev.kind === 'essay') ? prev : { edges: [], questions: [] };
const ownIds = new Set(nodes.map(n => n.id));
const keptEdges = (keep.edges || []).filter(e => ownIds.has(e.from) || ownIds.has(e.to));
const keptQuestions = keep.questions || [];
if (keptEdges.length || keptQuestions.length) console.log(`KEPT ${keptEdges.length} hand-written edges and ${keptQuestions.length} questions from the previous ${path.basename(outFile)}`);
const frag = {
  schema: 2, kind: 'essay', slug: reg.slug,
  generatedFrom: path.relative(root, regPath).startsWith('..') ? path.basename(path.dirname(regPath)) + '/REGISTRY.json' : path.relative(root, regPath),
  note: 'Generated by scripts/atlas-import-registry.cjs. Edit the REGISTRY.json and re-run, or hand-edit and drop "kind" to stop regeneration.',
  nodes, edges: keptEdges, questions: keptQuestions,
  ...(Object.keys(seeAlso).length ? { seeAlso } : {}),
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(frag, null, 2) + '\n');
console.log(`WROTE ${path.relative(root, outFile).startsWith('..') ? outFile : path.relative(root, outFile)}: ${nodes.length} concepts in region ${region} for ${reg.path}`);
console.log('NEXT: node scripts/build-atlas-data.cjs && node atlas/tests/data-quality.cjs');
