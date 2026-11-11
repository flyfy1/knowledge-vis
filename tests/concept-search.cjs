'use strict';
// Shared matcher (atlas/concept-search.js) and the generated concept index (atlas/search-index.js).
// Contract: specs/atlas-search-index.md. Ranks pages + concepts the way the homepage does
// (one list, score first, a page before a concept on ties, an essay's chapters before the essay)
// and pins where ten everyday
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
// Question phrasing (2026-11-11): tried only when the query as typed matches nothing.
for (const [q, rest] of [['什么是熵', '熵'], ['熵是什么', '熵'], ['为什么会共振', '共振'], ['光合作用是怎么回事', '光合作用'], ['能量是什么', '能量'],
  ['房贷怎么还', '房贷'], ['what is entropy', 'entropy'], ["what's inflation", 'inflation'], ['how does photosynthesis work', 'photosynthesis'],
  ['why does resonance happen', 'resonance'], ['what does entropy mean', 'entropy']]) {
  ok(CS.unquestion(q) === rest, `question words dropped: "${q}" -> "${rest}" (got "${CS.unquestion(q)}")`);
}
ok(CS.unquestion('entropy') === '' && CS.unquestion('共振') === '', 'a plain query has no question form');
ok(CS.unquestion('为什么') === '' && CS.unquestion('what is it') === '', 'a query of question words only stays empty');
ok(CS.unquestion('work done by a force') === '' || CS.unquestion('work done by a force').includes('work'), '"work" is kept unless it ends a how-question');
const ent = rec(['熵', 'Entropy']);
ok(CS.score(ent, '什么是熵') === CS.score(ent, '熵') - 5 && CS.score(ent, 'what is entropy') === CS.score(ent, 'entropy') - 5, 'a question ranks 5 below the plain words');
ok(CS.score(rec(['能量守恒']), '能量是什么') > 0 && CS.score(rec(['数量']), '能量是什么') === 0, '能量是什么 keeps 能量, does not become 量');
ok(CS.score(rec(['What is life']), 'what is life') === 100, 'a title that is itself a question still matches literally first');

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
// Ties as on the homepage: a page before a concept, except an essay page (KNOWLEDGE_ESSAYS), whose chapters go first.
const essays = new Set(box.window.KNOWLEDGE_ESSAYS || []);
const essayPaths = new Set(pages.filter(p => essays.has(p.slug)).map(p => p.path));
const tie = x => x.kind === 'page' ? (essayPaths.has(x.href) ? 2 : 0) : 1;
const first = q => CS.rank(items, q).sort((x, y) => y.score - x.score || tie(x) - tie(y))[0];
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
// Essay chapters (2026-11-11): a confused person's words reach the chapter, not just the essay.
// "half-life", "inflation" and "herd immunity" were topics with no page before these essays.
const chapters = [
  ['辛普森悖论', "Simpson's paradox", 'probability/everyday/numbers-lie/#c5'],
  ['为什么平均数会骗人', 'why is the average misleading', 'probability/everyday/numbers-lie/#c8'],
  ['幸存者偏差', 'survivorship bias', 'probability/everyday/numbers-lie/#c3'],
  ['半衰期', 'half-life', 'biology/body/body-in-balance/#ch2'],
  ['吃药为什么要按时', 'why take medicine at regular times', 'biology/body/body-in-balance/#ch2'],
  ['发烧', 'fever', 'biology/body/body-in-balance/#ch5'],
  ['群体免疫', 'herd immunity', 'biology/body/body-in-balance/#ch9'],
  ['疫苗', 'vaccines', 'biology/body/body-in-balance/#ch9'],
  ['GPS 怎么定位', 'how does GPS work', 'tech/devices/inside-a-phone/#gps'],
  ['电池为什么冬天掉电快', 'why does my phone die in the cold', 'tech/devices/inside-a-phone/#battery'],
  ['屏幕为什么只有三种颜色', 'why do screens use only three colours', 'tech/devices/inside-a-phone/#screen'],
  ['钱是怎么来的', 'where does money come from', 'economics/money/where-money-comes-from/#ch1'],
  ['银行挤兑', 'bank run', 'economics/money/where-money-comes-from/#ch3'],
  ['通货膨胀', 'inflation', 'economics/money/where-money-comes-from/#ch4'],
  ['房贷怎么还', 'how does a mortgage work', 'economics/money/where-money-comes-from/#ch7'],
  ['为什么投票结果不一样', 'why do voting methods give different winners', 'society/civics/same-votes-different-winner/#ch1'],
  ['阿罗不可能定理', "Arrow's impossibility theorem", 'society/civics/same-votes-different-winner/#ch6'],
  ['选区划分', 'gerrymandering', 'society/civics/same-votes-different-winner/#ch8'],
  ['逻辑门', 'logic gates', 'computing/systems/switches-that-compute/#ch1'],
  ['补码', "two's complement", 'computing/systems/switches-that-compute/#ch5'],
  ['0.1+0.2', '0.1 + 0.2', 'computing/systems/switches-that-compute/#ch10'],
];
for (const [zh, en, href] of chapters) for (const q of [zh, en]) {
  const hit = first(q);
  ok(hit && hit.href === href, `"${q}" opens ${href} (got ${hit && hit.href})`);
  landed[q] = `${hit.kind} ${hit.href}`;
}
console.log(JSON.stringify({ pass: true, checks, concepts: K.concepts.length, landed }));
