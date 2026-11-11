'use strict';
// Shared matcher (atlas/concept-search.js) and the generated concept index (atlas/search-index.js).
// Contract: specs/atlas-search-index.md. Ranks pages + concepts the way the homepage does
// (one list, score first, a page before a concept on ties) and pins where ten everyday
// terms land, in both languages: the first result must open a visualization of that idea.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const CS = require(path.join(root, 'atlas/concept-search.js'));
let checks = 0; const ok = (v, m) => { assert.ok(v, m); checks++; };

// Matcher rules.
const rec = (titles, aliases = [], texts = []) => CS.prepare({ titles, aliases, texts });
ok(CS.score(rec(['Eigenvectors']), 'eigen vector') > 0 && CS.score(rec(['Eigenvectors']), 'Eigen-Vector') > 0, 'spaces and hyphens ignored');
ok(CS.score(rec(['eigenvector']), 'eigenvectors') > 0, 'plural falls back to singular');
ok(CS.score(rec(['ＦＯＵＲＩＥＲ']), 'fourier') > 0, 'NFKC + lowercase');
const t = rec(['Resonance']), a = rec(['Driven oscillator'], ['resonance']), d = rec(['Bandpass'], [], ['peaks near resonance']);
ok(CS.score(t, 'resonance') > CS.score(a, 'resonance') && CS.score(a, 'resonance') > CS.score(d, 'resonance'), 'title > alias > description');
ok(CS.score(rec(['共振', 'Resonance']), 'resonance') === CS.score(rec(['共振', 'Resonance']), '共振'), 'both languages searched');
ok(CS.score(rec(['Normal distribution'], [], ['the bell curve']), 'normal bell') > 0, 'every word may match a different field');
ok(CS.score(rec(['Normal distribution']), 'normal zebra') === 0, 'every word must match');
ok(CS.score(rec(['鸡兔同笼 · 先假设，差额会说话']), '鸡兔同笼') >= 95, 'title head before " · " counts as exact');

// Generated index shape.
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'atlas/search-index.js'), 'utf8'), box);
vm.runInNewContext(fs.readFileSync(path.join(root, 'pages.config.js'), 'utf8'), box);
const K = box.window.KNOWLEDGE_CONCEPTS;
assert.deepEqual([...K.fields], ['id', 'region', 'href', 'titleZh', 'titleEn', 'aliasesZh', 'aliasesEn', 'summaryZh', 'summaryEn']); checks++;
const pages = box.window.KNOWLEDGE_PAGES.filter(p => p.status === 'live' && p.category !== 'leetcode');
const paths = new Set(pages.map(p => p.path));
for (const r of K.concepts) {
  const where = r[2].split('#')[0];
  ok(paths.has(where) || where.startsWith(K.atlas), `concept ${r[0]} links to a live page or the atlas: ${r[2]}`);
}
ok(Buffer.byteLength(fs.readFileSync(path.join(root, 'atlas/search-index.js'))) <= 200000, 'search index within its limit');

// Ten everyday terms, both languages: first result's destination.
const tx = v => v == null ? [] : typeof v === 'string' ? [v] : [v.zh, v.en].filter(Boolean);
const items = [
  ...pages.map(p => ({ kind: 'page', href: p.path, record: CS.prepare({ titles: tx(p.title), aliases: (p.tags || []).flatMap(tx), texts: tx(p.desc) }) })),
  ...K.concepts.map(r => ({ kind: 'concept', href: r[2], record: CS.prepare({ titles: [r[3], r[4]], aliases: [...r[5], ...r[6]], texts: [r[7], r[8]] }) })),
];
const first = q => CS.rank(items, q).sort((x, y) => y.score - x.score || (x.kind === 'page' ? 0 : 1) - (y.kind === 'page' ? 0 : 1))[0];
const expected = [
  ['傅里叶', 'Fourier', 'signal/transforms/fourier/'],
  ['利息', 'interest', 'investment/rates/'],
  ['概率', 'probability', 'probability/'],
  ['熵', 'entropy', 'probability/stochastic/entropy/'],
  ['特征向量', 'eigenvector', 'math/linear-algebra/eigenvectors/'],
  ['光合作用', 'photosynthesis', 'biology/cells/photosynthesis/'],
  ['共振', 'resonance', 'physics/waves/resonance/'],
  ['正态分布', 'bell curve', 'probability/'],
  ['导数', 'derivative', 'math/calculus/derivative/'],
  ['神经网络', 'neural network', 'computing/ml/cnn-feature-maps/'],
];
const landed = {};
for (const [zh, en, prefix] of expected) for (const q of [zh, en]) {
  const hit = first(q);
  ok(hit && hit.href.startsWith(prefix), `"${q}" opens ${prefix} (got ${hit && hit.href})`);
  landed[q] = `${hit.kind} ${hit.href}`;
}
console.log(JSON.stringify({ pass: true, checks, concepts: K.concepts.length, landed }));
