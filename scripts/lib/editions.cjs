'use strict';
/* Parallel editions of a registered page and the default-edition switch (specs/claude-code-editions.md「默认版本」).
 *
 * The switch and the resolver live in the hand-edited part of pages.config.js:
 *   window.KNOWLEDGE_DEFAULT_EDITION = "claude-code" | "original";
 *   window.knowledgeEditionPath(page, edition)  -> the path a page-level link to `page` goes to
 * The browser (index.html) calls that function directly; the build calls the very same function through defaultPath()
 * below, and scripts/build-site-nav.cjs copies its source into site-nav-data.js. There is no second copy of the rule.
 *
 * What is detected here (scripts/lib/registry.cjs writes it into every generated KNOWLEDGE_PAGES row):
 *   editions        {"claude-code": "variants/claude-code/<slug>/"} when variants/claude-code/<slug>/index.html exists
 *   defaultEdition  "original" (the pin) when the page.json says so, or when page-provenance.json says the page at the
 *                   canonical address is itself by Claude Code (its variant is the same lesson, promoted 2026-11-17)
 * Plain node, no dependencies; every function takes an explicit site root.
 */
const fs = require('fs');
const path = require('path');

// Edition id -> the directory its copies live in. A page has that edition when <dir><slug>/index.html exists.
const EDITION_DIRS = { 'claude-code': 'variants/claude-code/' };
const SWITCH_VALUES = ['original', ...Object.keys(EDITION_DIRS)];
// page-provenance.json developer of each edition: a canonical page by that developer is never sent to the copy.
const EDITION_DEVELOPER = { 'claude-code': 'Claude Code' };

function detect(root, slug) {
  const out = {};
  for (const [id, dir] of Object.entries(EDITION_DIRS)) if (fs.existsSync(path.join(root, dir, slug, 'index.html'))) out[id] = dir + slug + '/';
  return Object.keys(out).length ? out : null;
}

// page-provenance.json, read once per root: slug -> entry (only entries whose path is inside a page directory).
const PROV = new Map();
function provenance(root) {
  if (PROV.has(root)) return PROV.get(root);
  const f = path.join(root, 'page-provenance.json');
  let pages = {};
  try { pages = JSON.parse(fs.readFileSync(f, 'utf8')).pages || {}; } catch (e) { pages = {}; }
  PROV.set(root, pages);
  return pages;
}

// Why a page with editions stays on its canonical address: 'page.json', 'page-provenance.json', or null (it follows the
// switch). dir is the page directory relative to the root ("cat/sub/slug/").
function pinOf(root, meta, dir, editions) {
  if (!editions) return null;
  if (meta && meta.defaultEdition === 'original') return 'page.json';
  const p = provenance(root)[meta && meta.slug];
  if (p && typeof p.path === 'string' && p.path.startsWith(dir) && Object.keys(editions).some(id => EDITION_DEVELOPER[id] === p.developer)) return 'page-provenance.json';
  return null;
}

// The page-level path of a registry row under the config's switch (config: the pages.config.js window as read by
// scripts/lib/registry.cjs). A site whose pages.config.js has no resolver (the test fixture) links canonical paths.
function defaultPath(config, page) {
  const fn = config && config.knowledgeEditionPath;
  return typeof fn === 'function' ? fn(page, config.KNOWLEDGE_DEFAULT_EDITION) : page.path;
}

// Problems with the switch itself (build errors, reported by scripts/build-registry.cjs --check).
function switchProblems(config) {
  const v = config.KNOWLEDGE_DEFAULT_EDITION, out = [];
  if (v == null) return out;
  if (!SWITCH_VALUES.includes(v)) out.push(`pages.config.js: KNOWLEDGE_DEFAULT_EDITION is ${JSON.stringify(v)}; use ${SWITCH_VALUES.map(x => JSON.stringify(x)).join(' or ')}`);
  if (typeof config.knowledgeEditionPath !== 'function') out.push('pages.config.js: KNOWLEDGE_DEFAULT_EDITION is set but window.knowledgeEditionPath (the resolver) is missing');
  return out;
}

module.exports = { EDITION_DIRS, SWITCH_VALUES, detect, pinOf, defaultPath, switchProblems };
