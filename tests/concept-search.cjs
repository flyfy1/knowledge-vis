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

// Question scaffolding (2026-11-11 gap audit): leftover predicates after the question words.
for (const [q, rest] of [['导数是什么意思', '导数'], ['四季是怎么形成的', '四季'], ['催化剂是怎么起作用的', '催化剂'],
  ['利率上升有什么影响', '利率上升'], ['质数有什么用', '质数'], ['电池是怎么工作的', '电池'], ['为什么有白天黑夜', '白天黑夜'],
  ['元素周期表怎么看', '元素周期表'], ['酒精对身体的影响', '酒精'], ['what causes earthquakes', 'earthquakes'],
  ['why do we get a fever', 'fever'], ['how to calculate probability', 'probability'], ['how to read the periodic table', 'periodic table'],
  ['what is an atom made of', 'atom'], ['how are proteins made', 'proteins'], ['what are prime numbers used for', 'prime numbers'],
  ['what happens when interest rates rise', 'interest rates rise'], ['how does alcohol affect the body', 'alcohol'],
  ['where do musical scales come from', 'musical scales']]) {
  ok(CS.unscaffold(q) === rest, `scaffolding dropped: "${q}" -> "${rest}" (got "${CS.unscaffold(q)}")`);
}
for (const q of ['work and energy', '功', '杠杆原理', '有机化学', 'loss function', 'wave function', 'entropy'])
  ok(CS.unscaffold(q) === '', `content word kept: "${q}" has no scaffolding form (got "${CS.unscaffold(q)}")`);
ok(CS.score(rec(['导数']), '导数是什么意思') === 95, 'scaffolding ranks 5 below the plain word');
ok(CS.score(rec(['Work and energy changes']), 'work and energy') > 0, '"work" as content still matches literally');
ok(CS.score(rec(['Voltage, current & power']), 'what causes rent') === 0, 'fallbacks are strict: "rent" does not match inside "current"');
ok(CS.score(rec(['Plate'], ['plate motion']), 'where do emotions come from') === 0, 'fallbacks are strict: no match across a word break');
ok(CS.score(rec(['Battery']), 'batteries') > 0 && CS.score(rec(['Process']), 'processes') > 0, '-ies and -es plurals');
// Comparison queries (2026-11-11).
for (const [q, pair] of [['mean vs median', ['mean', 'median']], ['molecule vs atom', ['molecule', 'atom']],
  ['difference between mitosis and meiosis', ['mitosis', 'meiosis']], ['平均数和中位数有什么区别', ['平均数', '中位数']],
  ['分子和原子的区别', ['分子', '原子']], ['均值vs中位数', ['均值', '中位数']]]) {
  assert.deepEqual(CS.compare(q), pair, q); checks++;
}
for (const q of ['canvas', '酸和碱', '和弦', 'rock and roll', '排列组合怎么区分', 'entropy']) ok(CS.compare(q) === null, `not a comparison: "${q}"`);
{
  const both = rec(['Mean, median, mode']), onlyA = rec(['Mean']), onlyB = rec(['Median household income']);
  const items = [{ n: 'A', record: onlyA }, { n: 'B', record: onlyB }, { n: 'both', record: both }];
  ok(CS.rank(items, 'mean vs median')[0].n === 'both', 'a record covering both sides comes first');
  ok(CS.rank([items[0], items[1]], 'mean vs median').map(x => x.n).join() === 'A,B', 'otherwise the best of each side');
  ok(CS.rank(items, 'mean').map(x => x.n)[0] === 'A', 'a plain query is not rearranged');
}

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
const first = q => CS.arrange(CS.rank(items, q).sort((x, y) => y.score - x.score || tie(x) - tie(y)), q, x => x.record)[0];
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
  // 2026-11-11 gap audit: CNN kernels was a false hit for "neural network"; the backpropagation
  // page opens on the smallest network (forward pass and loss), tagged in pages.config.js.
  ['神经网络', 'neural network', 'computing/ml/backpropagation/'],
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
  // 疫苗 / vaccines moved to the vaccine essay (2026-11-11 second batch); herd immunity stays on body-in-balance.
  ['疫苗', 'vaccines', 'biology/body/how-vaccines-work/#ch2'],
  ['GPS 怎么定位', 'how does GPS work', 'tech/devices/inside-a-phone/#gps'],
  ['电池为什么冬天掉电快', 'why does my phone die in the cold', 'tech/devices/inside-a-phone/#battery'],
  ['屏幕为什么只有三种颜色', 'why do screens use only three colours', 'tech/devices/inside-a-phone/#screen'],
  ['钱是怎么来的', 'where does money come from', 'economics/money/where-money-comes-from/#ch1'],
  ['银行挤兑', 'bank run', 'economics/money/where-money-comes-from/#ch3'],
  ['通货膨胀', 'inflation', 'economics/money/where-money-comes-from/#ch4'],
  // Mortgage words moved to the mortgage essay (2026-11-11 second batch); its page top answers the broad question.
  ['房贷怎么还', 'how does a mortgage work', 'economics/money/where-a-mortgage-payment-goes/'],
  ['为什么投票结果不一样', 'why do voting methods give different winners', 'society/civics/same-votes-different-winner/#ch1'],
  ['阿罗不可能定理', "Arrow's impossibility theorem", 'society/civics/same-votes-different-winner/#ch6'],
  ['选区划分', 'gerrymandering', 'society/civics/same-votes-different-winner/#ch8'],
  ['逻辑门', 'logic gates', 'computing/systems/switches-that-compute/#ch1'],
  ['补码', "two's complement", 'computing/systems/switches-that-compute/#ch5'],
  ['0.1+0.2', '0.1 + 0.2', 'computing/systems/switches-that-compute/#ch10'],
];
// Gap audit 2026-11-11: a natural phrasing reaches the page or chapter that answers it
// (aliases, scaffolding, comparisons, scarcity-moves concepts, and the corrected landings).
chapters.push(
  ['导数是什么意思', 'what is a derivative', 'math/calculus/derivative/'],
  ['圆周率', 'pi', 'math/geometry/circle-intro/'],
  ['虚数', 'imaginary number', 'math/algebra/complex-numbers/'],
  ['期望值', 'expected value', 'probability/basics/expected-value/'],
  ['食物链', 'food chain', 'biology/ecology/food-web/'],
  ['水循环', 'how does rain form', 'earth/climate/water-cycle/'],
  ['线性回归', 'linear regression', 'probability/statistics/regression-correlation/'],
  ['哈希表', 'hash function', 'computing/algorithms/hashing/'],
  ['量子力学是什么', 'what is quantum mechanics', 'physics/modern/quantum-basics/'],
  ['蛋白质是怎么合成的', 'how are proteins made', 'biology/cells/dna-replication/'],
  ['电池是怎么工作的', 'how do batteries work', 'chemistry/reactions/electrochemistry/'],
  ['地震是怎么发生的', 'what causes earthquakes', 'earth/geo/plate-tectonics/'],
  ['平均数和中位数有什么区别', 'mean vs median', 'probability/'],
  ['分子和原子的区别', 'molecule vs atom', 'chemistry/matter/molecules-atoms/'],
  ['排列组合怎么区分', 'permutations vs combinations', 'probability/basics/counting-permutations/'],
  ['机会成本', 'opportunity cost', 'demos/scarcity-moves/#c1'],
  ['边际成本', 'marginal cost', 'demos/scarcity-moves/#c2'],
  ['沉没成本', 'sunk cost', 'demos/scarcity-moves/#c2'],
  ['比较优势', 'comparative advantage', 'demos/scarcity-moves/#c3'],
  ['经济衰退', 'recession', 'demos/scarcity-moves/#c8'],
  ['正态分布', 'normal distribution', 'probability/basics/binomial-normal/#step3'],
  ['算法', 'what is an algorithm', 'computing/algorithms/sorting/'],
  ['手机是怎么工作的', 'how do cell phones work', 'tech/devices/inside-a-phone/'],
  ['心脏是怎么工作的', 'how does the heart work', 'biology/body/blood-circulation/'],
  ['音阶', 'where do scales come from', 'math/applied/music-theory/#step0'],
  ['酸和碱', 'acids and bases', 'chemistry/solutions/ph-scale/'],
);
// Second essay batch (2026-11-11): black hole, vaccines, climate, sky, mortgage.
chapters.push(
  ['黑洞', 'black hole', 'earth/astronomy/what-is-a-black-hole/#ch1'],
  ['史瓦西半径', 'Schwarzschild radius', 'earth/astronomy/what-is-a-black-hole/#ch1'],
  ['天为什么是蓝的', 'why is the sky blue', 'physics/optics/why-the-sky-is-blue/'],
  ['瑞利散射', 'Rayleigh scattering', 'physics/optics/why-the-sky-is-blue/#ch1'],
  ['打疫苗', 'vaccination', 'biology/body/how-vaccines-work/#ch2'],
  ['疫苗有效率', 'vaccine efficacy', 'biology/body/how-vaccines-work/#ch4'],
  ['温室效应', 'greenhouse effect', 'earth/climate/why-the-planet-warms/#ch2'],
  ['气候敏感度', 'climate sensitivity', 'earth/climate/why-the-planet-warms/#ch5'],
  ['二氧化碳饱和', 'CO2 saturation', 'earth/climate/why-the-planet-warms/#ch4'],
  ['房贷', 'mortgage', 'economics/money/where-a-mortgage-payment-goes/'],
  ['等额本息', 'equal payment repayment', 'economics/money/where-a-mortgage-payment-goes/#ch4'],
  ['等额本金', 'equal principal repayment', 'economics/money/where-a-mortgage-payment-goes/#ch4'],
  ['提前还款', 'mortgage prepayment', 'economics/money/where-a-mortgage-payment-goes/#ch5'],
  ['还款计划表', 'amortization', 'economics/money/where-a-mortgage-payment-goes/#ch3'],
  ['年化利率', 'APR', 'economics/money/where-a-mortgage-payment-goes/#ch7'],
);
// Food section (2026-11-12): fermented tofu and century egg.
const TOFU = 'food/flavor/why-fermented-tofu-tastes-good/';
chapters.push(
  ['酱豆腐', 'fermented tofu', TOFU],
  ['腐乳为什么好吃', 'why does fermented tofu taste good', TOFU],
  ['豆腐乳', 'sufu', TOFU + '#ch1'],
  ['鲜味', 'umami', TOFU + '#ch3'],
  ['味精', 'MSG', TOFU + '#ch3'],
  ['水分活度', 'water activity', TOFU + '#ch4'],
  ['松花蛋', 'century egg', TOFU + '#ch6'],
  ['皮蛋为什么是黑的', 'why is century egg black', TOFU + '#ch6'],
  ['臭豆腐为什么臭', 'why does stinky tofu smell', TOFU + '#ch8'],
  ['皮蛋有铅吗', 'does century egg contain lead', TOFU + '#ch9'],
);
for (const [zh, en, href] of chapters) for (const q of [zh, en]) {
  const hit = first(q);
  ok(hit && (hit.href === href || (href.endsWith('/') && hit.href.startsWith(href))), `"${q}" opens ${href} (got ${hit && hit.href})`);
  landed[q] = `${hit.kind} ${hit.href}`;
}
console.log(JSON.stringify({ pass: true, checks, concepts: K.concepts.length, landed }));
