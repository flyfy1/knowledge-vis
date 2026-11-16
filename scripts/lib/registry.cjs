'use strict';
/* The site registry, base layer (specs/site-template.md §3b, specs/proposals/site-template.md §2.2).
 *
 * Every registered page is a page.json in its own directory. A page.json registers its page when it has a
 * "status" ("live" or "planned"); the hand-edited parts of pages.config.js (categories, stages, subtopics,
 * FEATURED, ESSAYS order) stay hand-edited, and the KNOWLEDGE_PAGES block between the GENERATED markers is
 * written from the page.json files by scripts/build-registry.cjs.
 *
 * Mode switch: a pages.config.js with no GENERATED fence is read the old way (rows from KNOWLEDGE_PAGES). The test
 * fixture site (tests/fixtures/site-template/) is such a site, and so was the repo before the Phase 2 seed commit.
 *
 * A page.json is a template page (built by scripts/build-pages.cjs) when it has a "layout". A metadata-only
 * page.json (no layout) only registers its hand-written page. Template pages take title and desc from the
 * content (`# … {#hero}` heading and front-matter desc); metadata-only pages carry them in page.json.
 *
 * Plain node, no dependencies. Every function takes an explicit site root.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LANGS = ['zh', 'en'];
const STAGES = ['primary', 'junior', 'senior', 'university'];
const STATUSES = ['live', 'planned'];
const KINDS = ['essay', 'lesson', 'demo', 'tool'];
// The KNOWLEDGE_PAGES fence. The banner tells whoever opens the file what to do instead of editing the block.
const FENCE_START = '/* ===== GENERATED: KNOWLEDGE_PAGES ===== written by scripts/build-registry.cjs from every page.json that has a "status".';
const FENCE_END = '/* ===== END GENERATED: KNOWLEDGE_PAGES ===== */';
const FENCE_BANNER = [
  FENCE_START,
  ' * Do not edit between this banner and the END marker: node scripts/build-registry.cjs --check fails on any hand edit.',
  ' * To register a page, write <category>/<subtopic>/<slug>/page.json (AGENTS.md, specs/essays.md「Registering」),',
  ' * then run node scripts/build-registry.cjs. A row already pasted here by hand: node scripts/build-registry.cjs --adopt',
  ' * moves it into a page.json. Categories, subtopics, FEATURED and ESSAYS above stay hand-edited. */',
].join('\n');
// Directories never scanned for page.json: tooling, scratch, fixtures and frozen copies.
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude', '.agent', '.runs', '.github', '__pycache__']);
const SKIP_PATHS = ['tests/fixtures/', 'specs/', 'variants/', 'templates/'];
// Fields of a metadata page.json that become a KNOWLEDGE_PAGES row, in row order.
const ROW_FIELDS = ['slug', 'title', 'desc', 'tags', 'languages', 'category', 'subtopic', 'stage', 'status', 'path'];

const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const nonempty = s => typeof s === 'string' && s.trim() !== '';
const bilingual = v => isObj(v) && nonempty(v.zh) && nonempty(v.en);

/* ───────── pages.config.js ───────── */
function readConfig(root) {
  const file = path.join(root, 'pages.config.js');
  const text = fs.readFileSync(file, 'utf8');
  const w = {};
  vm.runInNewContext(text, { window: w });
  const a = text.indexOf(FENCE_START), b = text.indexOf(FENCE_END);
  const fenced = a !== -1 || b !== -1;
  const problems = [];
  let block = null;
  if (fenced) {
    if (a === -1 || b === -1 || b < a) problems.push('pages.config.js: the KNOWLEDGE_PAGES GENERATED markers are broken (one is missing or they are out of order); restore them from git');
    else {
      block = { start: a, end: b + FENCE_END.length, text: text.slice(a, b + FENCE_END.length) };
      const outside = text.slice(0, a) + text.slice(block.end);
      if (/KNOWLEDGE_PAGES/.test(outside.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''))) problems.push('pages.config.js: KNOWLEDGE_PAGES is assigned or changed outside the GENERATED block; register pages with page.json instead (AGENTS.md)');
      if ((text.match(new RegExp(FENCE_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length > 1) problems.push('pages.config.js: more than one KNOWLEDGE_PAGES GENERATED block');
    }
  }
  return { file, text, window: w, fenced, block, problems };
}

/* ───────── content of a template page: title and desc ───────── */
function frontMatter(text) {
  const lines = text.split('\n'), front = {};
  if (lines[0] !== '---') return front;
  for (let i = 1; i < lines.length && lines[i] !== '---'; i++) {
    const m = lines[i].match(/^([\w.-]+):\s?(.*)$/);
    if (m) front[m[1]] = /^"/.test(m[2]) ? JSON.parse(m[2]) : m[2];
  }
  return front;
}
// The registry title is plain text: the `# … {#hero}` heading as written. Markup there would render differently on the
// card than on the page, so it is an error rather than a guess (follow-up review 2026-11-16, 「Registry text」).
function contentText(dir, problems, at) {
  const out = { title: {}, desc: {} };
  for (const l of LANGS) {
    const f = path.join(dir, `content.${l}.md`);
    if (!fs.existsSync(f)) { problems.push(`${at}: template page has no content.${l}.md`); continue; }
    const text = fs.readFileSync(f, 'utf8');
    const m = text.match(/^# (.*?) \{#hero\}\s*$/m);
    if (!m) problems.push(`${at}: content.${l}.md has no "# … {#hero}" heading`);
    else if (/[*[{<&\\]/.test(m[1])) problems.push(`${at}: the title heading of content.${l}.md holds markup (${JSON.stringify(m[1])}); the registry needs plain text`);
    else out.title[l] = m[1];
    const d = frontMatter(text).desc;
    if (!nonempty(d)) problems.push(`${at}: content.${l}.md has no front-matter desc`);
    else out.desc[l] = d;
  }
  return out;
}

/* ───────── page.json files ───────── */
function scanPageJson(root) {
  const out = [];
  const walk = rel => {
    let ents;
    try { ents = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        const r = rel + e.name + '/';
        if (SKIP_PATHS.some(p => r === p)) continue;
        walk(r);
      } else if (e.name === 'page.json' && rel) out.push(rel);
    }
  };
  walk('');
  return out.sort();
}

// One row per registered page.json. Problems are build errors (build-registry --check fails on them).
function pagesFromJson(root, config) {
  const problems = [], rows = [], unregistered = [];
  const cats = new Set((config.KNOWLEDGE_CATEGORIES || []).map(c => c.id));
  const subs = config.KNOWLEDGE_SUBTOPICS || {};
  for (const rel of scanPageJson(root)) {
    const at = rel + 'page.json';
    let meta;
    try { meta = readJson(path.join(root, at)); } catch (e) { problems.push(`${at}: not valid JSON (${e.message})`); continue; }
    const template = !!meta.layout;
    if (meta.status == null) { unregistered.push({ dir: rel, meta, template }); continue; }
    const p = [];
    if (!nonempty(meta.slug) || !/^[a-z0-9][a-z0-9-]*$/.test(meta.slug)) p.push('slug: missing or not kebab-case');
    if (!STATUSES.includes(meta.status)) p.push(`status: "${meta.status}" (use ${STATUSES.join(' or ')}; leave it out while the page is a draft)`);
    if (!KINDS.includes(meta.kind)) p.push(`kind: "${meta.kind}" (use ${KINDS.join(', ')})`);
    if (meta.path !== rel) p.push(`path: "${meta.path}" must be this page.json's directory "${rel}"`);
    if (!cats.has(meta.category)) p.push(`category: "${meta.category}" is not in KNOWLEDGE_CATEGORIES (pages.config.js, hand-edited: add it there first)`);
    if (meta.subtopic != null) {
      if (!(subs[meta.category] || []).some(s => s.id === meta.subtopic)) p.push(`subtopic: "${meta.subtopic}" is not in KNOWLEDGE_SUBTOPICS["${meta.category}"] (pages.config.js, hand-edited: add it there first)`);
      else if (nonempty(meta.slug) && rel !== `${meta.category}/${meta.subtopic}/${meta.slug}/`) p.push(`path: a page with a subtopic lives at "${meta.category}/${meta.subtopic}/${meta.slug}/", not "${rel}"`);
    }
    if (!STAGES.includes(meta.stage)) p.push(`stage: "${meta.stage}" (use ${STAGES.join('/')})`);
    if (!Array.isArray(meta.tags) || meta.tags.some(t => !bilingual(t))) p.push('tags: a list of {"zh": …, "en": …}');
    if (meta.languages != null && !template && !(Array.isArray(meta.languages) && meta.languages.length && meta.languages.every(l => LANGS.includes(l)))) p.push('languages: a list such as ["zh"] (a page in one language only)');
    if (meta.order != null && !(Number.isInteger(meta.order) && meta.order > 0)) p.push('order: a positive integer (or leave it out: the page goes after every ordered page)');
    let title = meta.title, desc = meta.desc;
    if (template) {
      if (meta.title != null || meta.desc != null) p.push('title/desc: a template page takes them from content.<lang>.md (the # … {#hero} heading and the front-matter desc); remove them from page.json');
      const c = contentText(path.join(root, rel), p, 'content');
      title = c.title; desc = c.desc;
    } else {
      if (!bilingual(title)) p.push('title: {"zh": …, "en": …}');
      if (!bilingual(desc)) p.push('desc: {"zh": …, "en": …}');
    }
    for (const x of p) problems.push(`${at}: ${x}`);
    const row = {};
    for (const f of ROW_FIELDS) {
      const v = f === 'title' ? title : f === 'desc' ? desc : meta[f];
      if (f === 'languages' && (template || v == null)) continue;
      if (f === 'subtopic' && v == null) continue;
      row[f] = v;
    }
    rows.push({ row, meta, dir: rel, template, order: meta.order });
  }
  // Display order: page.json "order", then the pages without one, by path (a new registration goes last).
  rows.sort((a, b) => (a.order != null ? 0 : 1) - (b.order != null ? 0 : 1) || (a.order || 0) - (b.order || 0) || a.dir.localeCompare(b.dir));
  const seen = new Map(), seenPath = new Map();
  for (const r of rows) {
    if (seen.has(r.row.slug)) problems.push(`${r.dir}page.json: slug "${r.row.slug}" is also registered by ${seen.get(r.row.slug)}page.json`);
    seen.set(r.row.slug, r.dir);
    if (r.order != null && seenPath.has(r.order)) problems.push(`${r.dir}page.json: order ${r.order} is also used by ${seenPath.get(r.order)}page.json`);
    if (r.order != null) seenPath.set(r.order, r.dir);
  }
  return { rows, problems, unregistered };
}

/* ───────── the registry ───────── */
// Returns { mode, config (the pages.config.js window, KNOWLEDGE_PAGES replaced by the registry rows), entries, problems }.
// entries: [{ row, meta, dir, template }] in display order. In legacy mode meta is the page.json if any (or null).
function loadRegistry(root) {
  root = path.resolve(root);
  const cfg = readConfig(root);
  const w = cfg.window;
  if (!cfg.fenced) {
    const entries = (w.KNOWLEDGE_PAGES || []).map(row => {
      const dir = row.path ? row.path.replace(/\/?$/, '/') : null;
      const f = dir && path.join(root, dir, 'page.json');
      const meta = f && fs.existsSync(f) ? readJson(f) : null;
      return { row, meta, dir, template: !!(meta && meta.layout) };
    });
    return { mode: 'legacy', root, cfg, config: w, entries, problems: cfg.problems, unregistered: [] };
  }
  const r = pagesFromJson(root, w);
  const config = Object.assign({}, w, { KNOWLEDGE_PAGES: r.rows.map(e => e.row) });
  return { mode: 'pages', root, cfg, config, entries: r.rows, problems: cfg.problems.concat(r.problems), unregistered: r.unregistered };
}

/* ───────── the generated KNOWLEDGE_PAGES block ───────── */
const q = s => JSON.stringify(s);
const pair = v => `{ zh: ${q(v.zh)}, en: ${q(v.en)} }`;
function renderRow(row) {
  const lines = [`    slug: ${q(row.slug)}`, `    title: ${pair(row.title)}`, `    desc: ${pair(row.desc)}`, `    tags: [${row.tags.map(pair).join(', ')}]`];
  if (row.languages) lines.push(`    languages: [${row.languages.map(q).join(', ')}]`);
  lines.push('    ' + ['category', 'subtopic', 'stage', 'status', 'path'].filter(f => row[f] != null).map(f => `${f}: ${q(row[f])}`).join(', '));
  return '  {\n' + lines.join(',\n') + '\n  }';
}
function renderBlock(rows) {
  return FENCE_BANNER + '\nwindow.KNOWLEDGE_PAGES = [\n' + rows.map(renderRow).join(',\n') + '\n];\n' + FENCE_END;
}
// pages.config.js with the block replaced (or, in legacy mode, the whole `window.KNOWLEDGE_PAGES = [ … ];` statement).
function withBlock(cfg, rows) {
  const block = renderBlock(rows);
  if (cfg.block) return cfg.text.slice(0, cfg.block.start) + block + cfg.text.slice(cfg.block.end);
  const a = cfg.text.indexOf('window.KNOWLEDGE_PAGES = [');
  if (a === -1) throw new Error('pages.config.js has no "window.KNOWLEDGE_PAGES = [" statement to replace');
  const m = /\n\];[^\n]*/g; m.lastIndex = a;
  const e = m.exec(cfg.text);
  if (!e) throw new Error('pages.config.js: cannot find the end of KNOWLEDGE_PAGES ("\\n];")');
  return cfg.text.slice(0, a) + block + cfg.text.slice(e.index + e[0].length);
}

/* ───────── page.json written by --adopt ───────── */
// kind of a page that has no page.json yet: essays carry REGISTRY.json (specs/essays.md「Files」); the entrance pages are
// tools; a demo without a REGISTRY.json is a demo; the rest are lessons.
function guessKind(root, row) {
  if (row.path && fs.existsSync(path.join(root, row.path, 'REGISTRY.json'))) return 'essay';
  if (['atlas', 'atlas-investment', 'leetcode'].includes(row.slug)) return 'tool';
  if (row.category === 'demos') return 'demo';
  return 'lesson';
}
// Merge a KNOWLEDGE_PAGES row into a page.json (existing or new). Key order: identity and place first, then the
// template fields an existing page.json already had.
function metaFromRow(root, row, existing, order) {
  const template = !!(existing && existing.layout);
  const m = { slug: row.slug, kind: (existing && existing.kind) || guessKind(root, row) };
  if (!template) { m.title = row.title; m.desc = row.desc; }
  m.tags = row.tags;
  if (row.languages && !template) m.languages = row.languages;
  m.category = row.category;
  if (row.subtopic != null) m.subtopic = row.subtopic;
  m.stage = row.stage; m.status = row.status; m.path = row.path; m.order = order;
  for (const [k, v] of Object.entries(existing || {})) if (!(k in m) && !['title', 'desc'].includes(k)) m[k] = v;
  return m;
}

module.exports = {
  LANGS, STAGES, STATUSES, KINDS, FENCE_START, FENCE_END, FENCE_BANNER, ROW_FIELDS,
  readConfig, loadRegistry, scanPageJson, pagesFromJson, contentText, frontMatter,
  renderRow, renderBlock, withBlock, guessKind, metaFromRow,
};
