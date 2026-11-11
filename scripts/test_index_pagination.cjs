#!/usr/bin/env node
/* Source contract for the root homepage (index.html), see specs/index-pagination.md.
 * The file name is historical: pagination and topic chips were removed on 2026-11-11.
 * Browser behaviour is covered by tests/leetcode-home-section.cjs. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'pages.config.js'), 'utf8');
const fail = (msg) => { throw new Error(msg); };

// Registry: featured array exists, is ordered as decided, and every slug resolves.
const sandbox = { window: {} };
vm.runInNewContext(config, sandbox);
const w = sandbox.window;
for (const key of ['KNOWLEDGE_CATEGORIES', 'KNOWLEDGE_STAGES', 'KNOWLEDGE_SUBTOPICS', 'KNOWLEDGE_PAGES', 'KNOWLEDGE_FEATURED']) {
  if (!w[key]) fail(`pages.config.js does not define window.${key}`);
}
const expectedFeatured = ['fractions', 'day-night-rotation', 'pinhole-camera', 'pythagoras', 'lens',
  'complex-numbers', 'interference', 'fourier', 'sampling', 'gradient-descent', 'bayes-updating', 'mandelbrot'];
if (JSON.stringify(Array.from(w.KNOWLEDGE_FEATURED)) !== JSON.stringify(expectedFeatured)) {
  fail('KNOWLEDGE_FEATURED differs from the decided list: ' + JSON.stringify(w.KNOWLEDGE_FEATURED));
}
const slugs = new Set(w.KNOWLEDGE_PAGES.map((p) => p.slug));
for (const s of w.KNOWLEDGE_FEATURED) if (!slugs.has(s)) fail(`featured slug not registered: ${s}`);

// The homepage reads the featured list and groups category views by registered subtopic.
const required = [
  ['featured list is read from the registry', 'window.KNOWLEDGE_FEATURED'],
  ['unknown featured slugs are skipped', '.filter(Boolean)'],
  ['category view groups by registered subtopic', 'window.KNOWLEDGE_SUBTOPICS'],
  ['unregistered subtopics fall into Other', "t('otherSubtopic')"],
  ['site search persists in ?s=', "url.searchParams.set('s'"],
  ['site search is IME-safe', "siteInput.addEventListener('compositionstart'"],
  ['site search uses NFKC lowercase', "normalize('NFKC').toLowerCase()"],
  ['legacy topic param dropped on write', "url.searchParams.delete('topic')"],
  ['legacy page param dropped on write', "url.searchParams.delete('page')"],
  ['LeetCode query stays LeetCode-only', "if (activeCat === 'leetcode' && query) url.searchParams.set('q', query);"],
  ['LeetCode build rewrite target', 'problems.config.js'],
  ['atlas entrance', "href: 'atlas/'"],
  ['Claude Code editions entrance', "href: 'variants/claude-code/'"],
  ['LeetCode entrance', "cat: 'leetcode'"],
  ['Demos entrance', "cat: 'demos'"],
  ['home chip keeps data-cat=all', "var defs = [{ id: 'all' }];"],
  ['site search input', 'id="siteSearch"'],
  // Concept search (2026-11-11): the atlas concept index is loaded lazily and merged into the results.
  ['concept matcher loaded lazily', "'atlas/concept-search.js?v="],
  ['concept index loaded lazily', "'atlas/search-index.js?v="],
  ['index loads on first focus', "siteInput.addEventListener('focus', loadConcepts);"],
  ['index loads on first typing', "siteInput.addEventListener('input',function(event) { loadConcepts();"],
  ['index loads for a ?s= URL', 'if (siteInput.value) loadConcepts();'],
  ['concept result card', 'function makeConceptCard(c)'],
  ['concept card names its page', "fill(t('conceptIn'), { page: pick(c.page.title) })"],
  ['concept without anchor or with the page name is folded into its page', 'var keep = c.anchored && !names(c.title)'],
  ['folded concept lends its score to the page', 'seen[c.page.path].score = Math.max(seen[c.page.path].score, c.score);'],
  ['pages and concepts ranked together', 'return b.score - a.score || (a.page ? 0 : 1) - (b.page ? 0 : 1) || a.order - b.order;'],
  ['concept results capped', 'var MAX_CONCEPTS = 8;'],
  ['failure keeps page search', "conceptState = 'error'; return;"],
];
for (const [label, needle] of required) if (!html.includes(needle)) fail(`missing ${label}: ${needle}`);

// Removed on purpose; their return would bring back the 293-chip header or the pager.
const forbidden = [
  ['topic chip row', 'topicChips'],
  ['topic chip renderer', 'renderTopicChips'],
  ['pagination', 'id="pagination"'],
  ['page size', 'pageSize'],
  ['live badge', 'badgeLive'],
  ['per-card open line', 'goOpen'],
  ['maintainer footer', '<b>pages.config.js</b>'],
  ['provenance label (root page has no provenance entry)', 'page-provenance'],
  // The first paint must not pay for the concept index.
  ['concept index as a blocking script', '<script src="atlas/search-index.js'],
  ['concept matcher as a blocking script', '<script src="atlas/concept-search.js'],
];
for (const [label, needle] of forbidden) if (html.includes(needle)) fail(`${label} is back: ${needle}`);

// Legacy params must be ignored on read, never restored into state.
if (/searchParams\.get\('(topic|page)'\)/.test(html)) fail('legacy topic/page params are read');
// A bare q outside LeetCode is ignored: q is only read inside the LeetCode branch.
if (!html.includes("if (activeCat === 'leetcode') searchInput.value = url.searchParams.get('q') || '';")) {
  fail('q must only be read for the LeetCode view');
}
if ((html.match(/<a class="card"/g) || []).length) fail('index contains a hard-coded card list');
// Both lazily loaded files exist and the strings the concept cards use are in both languages.
for (const f of ['atlas/concept-search.js', 'atlas/search-index.js']) if (!fs.existsSync(path.join(root, f))) fail(`missing ${f}`);
for (const key of ['siteSearchBoth', 'conceptBadge', 'conceptIn', 'conceptInAtlas']) {
  if ((html.match(new RegExp(key + ':', 'g')) || []).length < 2) fail(`string ${key} must exist in zh and en`);
}
console.log('index homepage contract: ok');
