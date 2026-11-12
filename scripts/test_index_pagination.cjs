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

// Long reads (2026-11-11 + 2026-11-12 food essays): the six essays of the batch, the five of the second batch,
// two food essays, then scarcity-moves, which set their standard.
const expectedEssays = ['numbers-lie', 'body-in-balance', 'inside-a-phone', 'where-money-comes-from',
  'same-votes-different-winner', 'switches-that-compute',
  'what-is-a-black-hole', 'how-vaccines-work', 'why-the-planet-warms', 'why-the-sky-is-blue',
  'where-a-mortgage-payment-goes', 'why-fermented-tofu-tastes-good', 'how-soy-sauce-gets-its-flavor', 'scarcity-moves'];
if (JSON.stringify(Array.from(w.KNOWLEDGE_ESSAYS || [])) !== JSON.stringify(expectedEssays)) {
  fail('KNOWLEDGE_ESSAYS differs from the decided list: ' + JSON.stringify(w.KNOWLEDGE_ESSAYS));
}
for (const s of w.KNOWLEDGE_ESSAYS) {
  const pg = w.KNOWLEDGE_PAGES.find((p) => p.slug === s);
  if (!pg) fail(`essay slug not registered: ${s}`);
  if (pg.status !== 'live') fail(`essay is not live: ${s}`);
}
// scarcity-moves has had an English edition since 8c6cff39, so no essay is single-language now.
if (!fs.existsSync(path.join(__dirname, '..', 'demos/scarcity-moves/copy.en.js'))) fail('scarcity-moves has no copy.en.js');
if (w.KNOWLEDGE_PAGES.find((p) => p.slug === 'scarcity-moves').languages) {
  fail('scarcity-moves has an English edition and must not be marked languages: ["zh"]');
}

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
  // Long reads section, between the featured grid and the entrances, same card component.
  ['essay list is read from the registry', 'window.KNOWLEDGE_ESSAYS'],
  ['essay section', "var reads = node('section', 'essays');"],
  ['essay section is labelled', "reads.setAttribute('aria-labelledby', 'essaysTitle');"],
  ['essay cards use the page card', "readsList.appendChild(makeCard(pg, { cat: true, stage: true }));"],
  ['Chinese-only badge in English mode', "if (lang === 'en' && pg.languages && pg.languages.indexOf('en') === -1)"],
  ['home chip keeps data-cat=all', "var defs = [{ id: 'all' }];"],
  ['site search input', 'id="siteSearch"'],
  // Concept search (2026-11-11, decoupled into search/ 2026-11-13): the sharded concept index is loaded lazily and merged into the results.
  ['concept matcher loaded lazily', "'search/concept-search.js?v="],
  ['concept manifest loaded lazily', "'search/manifest.js?v="],
  ['index loads on first focus', "siteInput.addEventListener('focus', loadConcepts);"],
  ['index loads on first typing', "siteInput.addEventListener('input',function(event) { loadConcepts();"],
  ['index loads for a ?s= URL', 'if (siteInput.value) loadConcepts();'],
  ['concept result card', 'function makeConceptCard(c)'],
  ['concept card names its page', "fill(t('conceptIn'), { page: pick(c.page.title) })"],
  ['concept without anchor or with the page name is folded into its page', 'var keep = c.anchored && !names(c.title)'],
  ['folded concept lends its score to the page', 'seen[c.page.path].score = Math.max(seen[c.page.path].score, c.score);'],
  // On equal scores: lesson pages, then concepts (an essay chapter is a concept), then whole essays,
  // so a word that names both an essay and one of its chapters lands on the chapter (2026-11-11).
  ['pages and concepts ranked together', 'return b.score - a.score || tieRank(a) - tieRank(b) || a.order - b.order;'],
  ['essays rank after concepts on a tie', 'function tieRank(x) { return x.page ? (essaySlugs[x.page.slug] ? 2 : 0) : 1; }'],
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
  ['concept index as a blocking script', '<script src="search/manifest.js'],
  ['concept matcher as a blocking script', '<script src="search/concept-search.js'],
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
for (const f of ['search/concept-search.js', 'search/manifest.js']) if (!fs.existsSync(path.join(root, f))) fail(`missing ${f}`);
// Order inside renderHome: featured cards, then the long reads, then the entrances.
const home = html.slice(html.indexOf('function renderHome(frag)'), html.indexOf('function renderCategory('));
const at = (needle) => { const i = home.indexOf(needle); if (i < 0) fail(`renderHome lacks ${needle}`); return i; };
if (!(at('featured.forEach') < at("node('section', 'essays')") && at("node('section', 'essays')") < at("node('section', 'entrances')"))) {
  fail('long reads must sit between the featured grid and the entrances');
}
for (const key of ['siteSearchBoth', 'conceptBadge', 'conceptIn', 'conceptInAtlas', 'essaysTitle', 'essaysSub', 'onlyZh']) {
  if ((html.match(new RegExp(key + ':', 'g')) || []).length < 2) fail(`string ${key} must exist in zh and en`);
}
console.log('index homepage contract: ok');
