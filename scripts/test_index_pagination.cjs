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
];
for (const [label, needle] of forbidden) if (html.includes(needle)) fail(`${label} is back: ${needle}`);

// Legacy params must be ignored on read, never restored into state.
if (/searchParams\.get\('(topic|page)'\)/.test(html)) fail('legacy topic/page params are read');
// A bare q outside LeetCode is ignored: q is only read inside the LeetCode branch.
if (!html.includes("if (activeCat === 'leetcode') searchInput.value = url.searchParams.get('q') || '';")) {
  fail('q must only be read for the LeetCode view');
}
if ((html.match(/<a class="card"/g) || []).length) fail('index contains a hard-coded card list');
console.log('index homepage contract: ok');
