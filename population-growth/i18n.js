'use strict';
/* ============================================================
   种群增长 · S 形曲线从哪来 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   ============================================================ */
const STR = {
  zh: {
    docTitle: '种群增长 · S 形曲线从哪来 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '种群增长 · S 形曲线从哪来',
    tagline: '没有天花板时，种群按倍数狂奔；有了容纳量 K，越接近 K 涨得越慢，曲线被压成 S 形。这一页的数量、增长率、翻倍时间全部由迭代与公式当场实算，没有一条曲线是手画的。细菌情境只是示意，数字都是模拟值。',
    nav0: '0 翻倍狂奔', nav1: '1 增长率 r', nav2: '2 世界装不下', nav3: '3 K 是渐近线', nav4: '4 r 调过头', nav5: '5 终章',
    foot: 'visual.integ.life · 种群增长 Population Growth —— 一步一交互系列',

    s0k: '第 0 步 · 翻倍的狂奔',
    s0t: '每一代都翻倍：先猜，再数',
    s0e: '这一步只问一件事：<strong>每代翻一倍的增长，快到什么程度？</strong>从 1 个细菌开始，一代翻一倍。先在心里押个注：第 10 代会有多少个？——然后一下一下点「下一代」，让数自己长出来。',
    s0next: '下一代 →', s0reset: '重来',
    s0ro: '第 <b>{g}</b> 代：<b>{n}</b> 个（= 2<sup>{g}</sup>，实算）。',
    s0ro10: '第 10 代揭晓：<b>1,024</b> 个。多数人第一猜会猜 20 或 100——差得远。这不是细菌特别能生，是「每代乘 2」这种方式本身就这么猛。',
    s0conc: '结论：<strong>指数增长的标志是「每过一代，乘上同一个倍数」</strong>。开头不起眼，是因为基数小；基数一大，同样的倍数就是天文数字。',
    s0gen: '代', s0count: '数量',

    s1k: '第 1 步 · 增长率 r',
    s1t: '不止翻倍：r 定陡缓',
    s1e: '真实种群不一定每代翻倍，可能每代只多 20%。把「倍数」推广成<strong>增长率 r</strong>：N(t) = N₀·e<sup>rt</sup>。拖动 r，看曲线陡缓和<strong>翻倍时间</strong>（数量翻一倍要多久，= ln2 / r）怎么变。',
    s1rLab: '增长率 r（每单位时间）',
    s1ro: 'r = {r}：翻倍时间 = ln2 / r ≈ <b>{td}</b> 个时间单位；t = {T} 时 N = 10·e<sup>{r}×{T}</sup> ≈ <b>{n}</b>。',
    s1conc: '结论：r 不必是整数倍——哪怕每代只多 20%，只要一直「按比例」涨，形状还是指数，区别只在快慢。',
    s1lk: '底图回顾：指数与对数那一页把 e<sup>x</sup> 与 ln 讲透了 →',

    s2k: '第 2 步 · 世界装不下',
    s2t: '容纳量 K 登场：曲线被压弯',
    s2e: '培养皿就这么大，食物就这么多。引入<strong>容纳量 K</strong>（环境最多养得起多少）：每一代的实际增长率变成 r·(1 − N/K)——N 越接近 K，这一项越接近 0，涨得越慢。同一组参数画两条线：青线不管 K（指数），橙线受 K 约束（逻辑斯蒂）。看它们从哪一代开始分家。',
    s2rLab: '增长率 r', s2kLab: '容纳量 K',
    s2ro: '第 {g} 代：指数线 N ≈ <b>{ne}</b>；逻辑斯蒂 N = <b>{nl}</b>，此刻实际增长率 = r·(1 − N/K) = <b>{eff}</b>（起步时约等于 r = {r}）。',
    s2conc: '结论：<strong>S 形不是画出来的，是「越挤越难生」逐代算出来的</strong>：前期像指数，中期最陡，后期被 (1 − N/K) 摁回平坦。',
    s2exp: '指数（无 K）', s2log: '逻辑斯蒂（有 K）',

    s3k: '第 3 步 · K 是渐近线',
    s3t: '从上边来，也回到 K',
    s3e: '如果一开始就超载（N₀ &gt; K）会怎样？拖动起始数量 N₀ 到 K 上方，逐代生成：数量会自己回落到 K 附近。两个方向都奔着 K 去——<strong>K 是吸引子，不是碰不得的墙</strong>。',
    s3n0Lab: '起始数量 N₀', s3kLab: '容纳量 K',
    s3next: '下一代 →', s3reset: '重来',
    s3ro: '第 <b>{g}</b> 代：N = <b>{n}</b>，距 K 还差 <b>{d}</b>（实际增长率 {eff}，可正可负）。',
    s3conc: '结论：N &lt; K 时实际增长率为正、往上爬；N &gt; K 时变负、往下落。K 两边的力都指向 K 本身。',

    s4k: '第 4 步 · r 调过头（越界实验）',
    s4t: '模型也有适用范围',
    s4e: '前面 r 一直被钳在安全区（≤ 1.9）。这一格是<strong>越界实验</strong>：把离散迭代的 r 推过 2——每代「刹车」踩得太狠，数量会冲过 K、再被甩回来，来回振荡；再大甚至算出负数——种群「崩盘」。这正是离散模型的边界：真实种群的调控是连续、平滑的，不会这样抽风。<strong>看到模型失效的样子，也是理解模型的一部分。</strong>',
    s4rLab: '增长率 r（越界区）',
    s4stable: '状态：还算稳——在 K 附近小幅晃动后趋稳。',
    s4osc: '状态：<b>振荡</b>——每代都冲过 K 再被甩回，不再趋稳（最近 6 代极差 {spread}）。',
    s4crash: '状态：<b>崩盘</b>——第 {g} 代算出 N ≤ 0，模型已失效（真实种群不会变负数，这是离散迭代的数学假象）。',
    s4conc: '结论：任何模型都有适用范围。r 的安全区来自稳定性条件（本离散形式要求 r &lt; 2），出界不是自然变了，是模型不适用了。',

    s5k: '第 5 步 · 终章',
    s5t: '把这一页收成三句话',
    s5e: '一、没有约束时，按比例增长就是指数增长，翻倍时间由 r 定。二、有了容纳量 K，实际增长率 r·(1 − N/K) 随 N 逼近 K 而减小，逐代算出 S 形（逻辑斯蒂）曲线；K 是两个方向都趋近的吸引子。三、离散迭代在 r ≥ 2 时会振荡失效——模型边界要明说。',
    s5lkExp: '上游：指数与对数（底图）→',
    s5bound: '模型边界：本页用离散迭代 N ← N + rN(1 − N/K) 与连续指数式作教学示意；细菌情境为示意，真实种群还受年龄结构、迁入迁出、时滞与随机波动影响，参数须由数据拟合，勿把模拟值当实测值。'
  },
  en: {
    docTitle: 'Population Growth · Where the S-Curve Comes From — One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Population Growth · Where the S-Curve Comes From',
    tagline: 'With no ceiling, a population multiplies wildly; with a carrying capacity K, growth slows as N nears K and the curve bends into an S. Every count, growth rate and doubling time on this page is computed live by iteration and formula — no curve is hand-drawn. The bacteria scenario is illustrative; all numbers are simulated.',
    nav0: '0 Doubling', nav1: '1 Growth Rate r', nav2: '2 A Finite World', nav3: '3 K the Attractor', nav4: '4 r Too Far', nav5: '5 Finale',
    foot: 'visual.integ.life · Population Growth — one interaction per step',

    s0k: 'Step 0 · The Doubling Sprint',
    s0t: 'Doubling every generation: guess first, then count',
    s0e: 'One question only: <strong>how fast is “times two every generation”?</strong> Start from 1 bacterium, doubling each generation. Place a mental bet: how many at generation 10? — then click “Next generation” and let the number grow itself.',
    s0next: 'Next generation →', s0reset: 'Reset',
    s0ro: 'Generation <b>{g}</b>: <b>{n}</b> (= 2<sup>{g}</sup>, computed).',
    s0ro10: 'Generation 10 revealed: <b>1,024</b>. Most first guesses say 20 or 100 — far off. The bacteria are not special; “multiply by 2 every step” is simply that violent.',
    s0conc: 'Takeaway: <strong>the signature of exponential growth is multiplying by the same factor each step</strong>. It looks tame only while the base is small.',
    s0gen: 'gen', s0count: 'count',

    s1k: 'Step 1 · Growth Rate r',
    s1t: 'Not just doubling: r sets the steepness',
    s1e: 'Real populations need not double; they might grow 20% per step. Generalise the factor into a <strong>growth rate r</strong>: N(t) = N₀·e<sup>rt</sup>. Drag r and watch the curve and the <strong>doubling time</strong> (= ln2 / r) change.',
    s1rLab: 'Growth rate r (per time unit)',
    s1ro: 'r = {r}: doubling time = ln2 / r ≈ <b>{td}</b> time units; at t = {T}, N = 10·e<sup>{r}×{T}</sup> ≈ <b>{n}</b>.',
    s1conc: 'Takeaway: r need not be a whole multiple — even +20% per step, as long as growth stays proportional, the shape is exponential; only the speed changes.',
    s1lk: 'Foundation: the Exponentials & Logarithms page works out e<sup>x</sup> and ln in full →',

    s2k: 'Step 2 · A Finite World',
    s2t: 'Enter carrying capacity K: the curve bends',
    s2e: 'The dish is only so big, the food only so much. Introduce <strong>carrying capacity K</strong>: each generation’s effective rate becomes r·(1 − N/K) — as N nears K this term nears 0 and growth stalls. Same parameters, two lines: teal ignores K (exponential), orange obeys K (logistic). Watch where they part ways.',
    s2rLab: 'Growth rate r', s2kLab: 'Carrying capacity K',
    s2ro: 'Generation {g}: exponential N ≈ <b>{ne}</b>; logistic N = <b>{nl}</b>, effective rate now = r·(1 − N/K) = <b>{eff}</b> (it started near r = {r}).',
    s2conc: 'Takeaway: <strong>the S is not drawn — it falls out of “the fuller it gets, the harder to grow”, iterated</strong>: exponential-like early, steepest midway, flattened by (1 − N/K) late.',
    s2exp: 'Exponential (no K)', s2log: 'Logistic (with K)',

    s3k: 'Step 3 · K the Attractor',
    s3t: 'Start above K — it still comes back',
    s3e: 'What if the population starts overloaded (N₀ &gt; K)? Drag N₀ above K and step generations: the count falls back toward K on its own. Both directions aim at K — <strong>K is an attractor, not a wall you crash into</strong>.',
    s3n0Lab: 'Starting count N₀', s3kLab: 'Carrying capacity K',
    s3next: 'Next generation →', s3reset: 'Reset',
    s3ro: 'Generation <b>{g}</b>: N = <b>{n}</b>, distance to K is <b>{d}</b> (effective rate {eff}, sign included).',
    s3conc: 'Takeaway: below K the effective rate is positive and N climbs; above K it turns negative and N falls. The forces on both sides point at K itself.',

    s4k: 'Step 4 · r Too Far (Out-of-Bounds Lab)',
    s4t: 'Models have a range of validity',
    s4e: 'Until now r was clamped to the safe zone (≤ 1.9). This panel is the <strong>out-of-bounds lab</strong>: push the discrete iteration past r = 2 — each generation brakes so hard that N overshoots K, gets flung back, and oscillates; push further and N goes negative — the population “crashes”. That is the boundary of the discrete model: real regulation is continuous and smooth, never this jerky. <strong>Seeing a model fail is part of understanding it.</strong>',
    s4rLab: 'Growth rate r (out-of-bounds zone)',
    s4stable: 'Status: roughly stable — small wiggles near K, then settles.',
    s4osc: 'Status: <b>oscillating</b> — overshooting K and snapping back every generation, never settling (last-6-generation spread {spread}).',
    s4crash: 'Status: <b>crashed</b> — generation {g} produced N ≤ 0; the model has left its valid range (real populations do not go negative; this is an artefact of the discrete iteration).',
    s4conc: 'Takeaway: every model has a validity range. The safe zone here comes from a stability condition (this discrete form needs r &lt; 2); outside it, the model — not nature — breaks.',

    s5k: 'Step 5 · Finale',
    s5t: 'The page in three sentences',
    s5e: 'One: unconstrained proportional growth is exponential, with doubling time set by r. Two: with carrying capacity K, the effective rate r·(1 − N/K) shrinks as N approaches K, and iterating it produces the S (logistic) curve; K attracts from both sides. Three: the discrete iteration oscillates and fails for r ≥ 2 — model boundaries must be stated, not hidden.',
    s5lkExp: 'Upstream: Exponentials & Logarithms (the foundation) →',
    s5bound: 'Model boundary: this page uses the discrete iteration N ← N + rN(1 − N/K) and the continuous exponential as teaching models. The bacteria scenario is illustrative; real populations also depend on age structure, migration, time lags and random fluctuations, and parameters must be fitted to data — never read simulated values as measurements.'
  }
};
let _lang = null;
function storedLang() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return null; } }
function saveLang(l) { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }
function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('#langToggle button').forEach(b => { b.classList.toggle('active', b.dataset.lang === lang); });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang); });
  });
  applyLang(getLang());
}
document.addEventListener('DOMContentLoaded', initLangToggle);
