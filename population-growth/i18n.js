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
    navLabel: '步骤导航',
    nav0: '0 翻倍狂奔', nav1: '1 增长率 r', nav2: '2 世界装不下', nav3: '3 K 是渐近线', nav4: '4 r 调过头', nav5: '5 终章',
    foot: 'visual.integ.life · 种群增长 Population Growth —— 一步一交互系列',

    s0k: '第 0 步 · 翻倍的狂奔',
    s0t: '每一代都翻倍：先猜，再数',
    s0e: '这一步只问一件事：<strong>每代翻一倍的增长，快到什么程度？</strong>从 1 个细菌开始，一代翻一倍。先在心里押个注：第 10 代会有多少个？——然后一下一下点「下一代」，让数自己长出来。',
    s0next: '下一代 →', s0reset: '重来',
    s0ro: '第 <b>{g}</b> 代：<b>{n}</b> 个（= 2<sup>{g}</sup>，实算）。',
    s0ro10: '第 10 代揭晓：<b>{n}</b> 个。如果你押的是 20 或 100，那就差得远了。这不是细菌特别能生，是「每代乘 2」这种方式本身就这么猛。',
    s0conc: '结论：<strong>指数增长的标志是「每过一代，乘上同一个倍数」</strong>。开头不起眼，是因为基数小；基数一大，同样的倍数就是天文数字。',
    s0gen: '代', s0count: '数量',

    s1k: '第 1 步 · 增长率 r',
    s1t: '不止翻倍：r 定陡缓',
    s1e: '真实种群不一定每代翻倍，增长可能慢得多。把「倍数」推广成连续的<strong>增长率 r</strong>：N(t) = N₀·e<sup>rt</sup>。拖动 r，看曲线陡缓和<strong>翻倍时间</strong>（数量翻一倍要多久，= ln2 / r）怎么变。',
    s1rLab: '增长率 r（每单位时间）',
    s1ro: 'r = {r}：翻倍时间 = ln2 / r ≈ <b>{td}</b> 个时间单位；t = {T} 时 N = 10·e<sup>{r}×{T}</sup> ≈ <b>{n}</b>。',
    s1conc: '结论：r 不必对应整数倍——哪怕 r 只有 0.2，只要一直「按比例」涨，形状还是指数，区别只在快慢。',
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
    s3e: '如果一开始就超载（N₀ &gt; K）会怎样？拖动起始数量 N₀ 到 K 上方，逐代生成：数量会自己回落到 K 附近。两个方向都奔着 K 去——<strong>K 是吸引子，不是碰不得的墙</strong>。注意这是逐代跳的离散模型：N₀ 离 K 太远时，一步的回落会「刹过头」落到 K 下方，再从下边爬回 K；超载得更离谱时这一步甚至会算出负数，所以本步给 N₀ 设了上限。',
    s3n0Lab: '起始数量 N₀', s3kLab: '容纳量 K',
    s3next: '下一代 →', s3reset: '重来',
    s3ro: '第 <b>{g}</b> 代：N = <b>{n}</b>，距 K <b>{d}</b>（实际增长率 {eff}，可正可负）。',
    s3cap: 'N₀ 上限 = 2.5K = {m}：当 N₀ &gt; K(1 + 1/r) ≈ {thr} 时，这个离散模型的第一步就会把种群算成负数（模型失效），所以滑杆被钳在 {m} 以内。',
    s3conc: '结论：N &lt; K 时实际增长率为正、往上爬；N &gt; K 时变负、往下落。K 两边的力都指向 K 本身。',

    s4k: '第 4 步 · r 调过头（越界实验）',
    s4t: '模型也有适用范围',
    s4e: '前面的离散迭代里 r 都不超过 1（第 2 步滑杆上限 1.0，第 3 步固定 0.6）。离散迭代 N ← N + rN(1 − N/K) 的真实分界是：<strong>r ≤ 1 单调趋近 K；1 &lt; r &lt; 2 先冲过 K、再衰减振荡回到 K；r &gt; 2 不再趋稳</strong>——先是 2 周期、4 周期……来回振荡，r 过了约 2.57 进入<strong>混沌</strong>（永不重复，初值差一点结果就天差地别）；r 过了 3 甚至算出负数——「崩盘」。这一格就是<strong>越界实验</strong>，滑杆从 1 到 3.1。要注意：对世代重叠、连续繁殖的种群，这种逐代剧烈跳动多半是离散化带来的假象；但世代不重叠的种群（如许多温带昆虫）确实可能出现这类过冲振荡乃至混沌（May 1976），真实种群的振荡也可能另有成因（如 Nicholson 绿头苍蝇实验中的发育时滞）。<strong>看到模型失效的样子，也是理解模型的一部分。</strong>',
    s4rLab: '增长率 r（r > 2 为越界区）',
    s4mono: '状态：<b>单调趋近</b>——从下方一路爬向 K，从不越过（r ≤ 1 的情形）。',
    s4damp: '状态：<b>阻尼振荡后趋稳</b>——冲过 K 又回落，晃动越来越小，最终停在 K（仍在 r ≤ 2 的稳定区内；r = 2 恰在临界，回落极慢）。',
    s4osc: '状态：<b>{p} 周期振荡</b>——长期在 {p} 个数值之间循环，不再趋稳到 K（最近 6 代极差 {spread}）。',
    s4oscLong: '状态：<b>振荡</b>——不再趋稳到 K，周期超过 64 代（最近 6 代极差 {spread}）。',
    s4chaos: '状态：<b>混沌</b>——不再趋稳也不循环，永不重复；李雅普诺夫指数 λ ≈ {lam} &gt; 0，初值的微小差别会被逐代放大（最近 6 代极差 {spread}）。',
    s4crash: '状态：<b>崩盘</b>——第 {g} 代算出 N ≤ 0，模型已失效（真实种群不会变负数，这是离散迭代的数学假象）。',
    s4conc: '结论：任何模型都有适用范围。r 的稳定区来自稳定性条件（本离散形式只在 r ≤ 2 时回到 K，r = 2 是临界点）；出界后的振荡、混沌、负数，先要问是模型的离散化在作怪，还是种群真有这种动态。',

    s5k: '第 5 步 · 终章',
    s5t: '把这一页收成三句话',
    s5e: '一、没有约束时，按比例增长就是指数增长，翻倍时间由 r 定。二、有了容纳量 K，实际增长率 r·(1 − N/K) 随 N 逼近 K 而减小，逐代算出 S 形（逻辑斯蒂）曲线；K 是两个方向都趋近的吸引子。三、离散迭代在 r &gt; 2 时不再趋稳（振荡、混沌，r &gt; 3 还会算出负数）——模型边界要明说。',
    s5lkExp: '上游：指数与对数（底图）→',
    s5lkEq: '旁支：化学平衡——同样是「自我刹车」的系统 →',
    s5bound: '符号提醒：第 1 步的 r 是连续增长率（e<sup>rt</sup>，翻倍时间 ln2/r 只对它成立）；第 2–4 步的 r 是每代的离散增长率（每代乘 1 + r），两者同名但不是同一个数。模型边界：本页用离散迭代 N ← N + rN(1 − N/K) 与连续指数式作教学示意；细菌情境为示意，真实种群还受年龄结构、迁入迁出、时滞与随机波动影响，参数须由数据拟合，勿把模拟值当实测值。'
  },
  en: {
    docTitle: 'Population Growth · Where the S-Curve Comes From — One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Population Growth · Where the S-Curve Comes From',
    tagline: 'With no ceiling, a population multiplies wildly; with a carrying capacity K, growth slows as N nears K and the curve bends into an S. Every count, growth rate and doubling time on this page is computed live by iteration and formula — no curve is hand-drawn. The bacteria scenario is illustrative; all numbers are simulated.',
    navLabel: 'Step navigation',
    nav0: '0 Doubling', nav1: '1 Growth Rate r', nav2: '2 A Finite World', nav3: '3 K the Attractor', nav4: '4 r Too Far', nav5: '5 Finale',
    foot: 'visual.integ.life · Population Growth — one interaction per step',

    s0k: 'Step 0 · The Doubling Sprint',
    s0t: 'Doubling every generation: guess first, then count',
    s0e: 'One question only: <strong>how fast is “times two every generation”?</strong> Start from 1 bacterium, doubling each generation. Place a mental bet: how many at generation 10? — then click “Next generation” and let the number grow itself.',
    s0next: 'Next generation →', s0reset: 'Reset',
    s0ro: 'Generation <b>{g}</b>: <b>{n}</b> (= 2<sup>{g}</sup>, computed).',
    s0ro10: 'Generation 10 revealed: <b>{n}</b>. If you bet on 20 or 100, you were far off. The bacteria are not special; “multiply by 2 every step” is simply that violent.',
    s0conc: 'Takeaway: <strong>the signature of exponential growth is multiplying by the same factor each step</strong>. It looks tame only while the base is small.',
    s0gen: 'gen', s0count: 'count',

    s1k: 'Step 1 · Growth Rate r',
    s1t: 'Not just doubling: r sets the steepness',
    s1e: 'Real populations need not double; growth may be much slower. Generalise the factor into a continuous <strong>growth rate r</strong>: N(t) = N₀·e<sup>rt</sup>. Drag r and watch the curve and the <strong>doubling time</strong> (= ln2 / r) change.',
    s1rLab: 'Growth rate r (per time unit)',
    s1ro: 'r = {r}: doubling time = ln2 / r ≈ <b>{td}</b> time units; at t = {T}, N = 10·e<sup>{r}×{T}</sup> ≈ <b>{n}</b>.',
    s1conc: 'Takeaway: r need not match a whole multiple — even with r = 0.2, as long as growth stays proportional, the shape is exponential; only the speed changes.',
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
    s3e: 'What if the population starts overloaded (N₀ &gt; K)? Drag N₀ above K and step generations: the count falls back toward K on its own. Both directions aim at K — <strong>K is an attractor, not a wall you crash into</strong>. Note this is a discrete model that jumps a whole generation at a time: if N₀ is far above K, one step brakes too hard and lands below K, then N climbs back from below; start even more overloaded and that single step would compute a negative number, so N₀ is capped here.',
    s3n0Lab: 'Starting count N₀', s3kLab: 'Carrying capacity K',
    s3next: 'Next generation →', s3reset: 'Reset',
    s3ro: 'Generation <b>{g}</b>: N = <b>{n}</b>, distance to K is <b>{d}</b> (effective rate {eff}, sign included).',
    s3cap: 'N₀ cap = 2.5K = {m}: once N₀ &gt; K(1 + 1/r) ≈ {thr}, the very first step of this discrete model computes a negative population (the model breaks), so the slider is clamped to {m}.',
    s3conc: 'Takeaway: below K the effective rate is positive and N climbs; above K it turns negative and N falls. The forces on both sides point at K itself.',

    s4k: 'Step 4 · r Too Far (Out-of-Bounds Lab)',
    s4t: 'Models have a range of validity',
    s4e: 'In the discrete iterations so far r never exceeded 1 (Step 2 slider max 1.0, Step 3 fixed at 0.6). The true thresholds of N ← N + rN(1 − N/K) are: <strong>r ≤ 1 approaches K monotonically; 1 &lt; r &lt; 2 overshoots K and then settles back in damped oscillations; r &gt; 2 never settles</strong> — first period-2, period-4… cycles, then past r ≈ 2.57 <strong>chaos</strong> (never repeating; a tiny change in the start gives a completely different path); past r = 3 it even computes negative numbers — a “crash”. This panel is the <strong>out-of-bounds lab</strong>, slider from 1 to 3.1. Caveat: for populations with overlapping generations and continuous breeding, this generation-to-generation jerkiness is mostly an artefact of the discrete model; but species with non-overlapping generations (many temperate insects) really can show such overshoot cycles and even chaos (May 1976), and real oscillations can have other causes too (e.g. the developmental time lag in Nicholson’s blowfly experiments). <strong>Seeing a model fail is part of understanding it.</strong>',
    s4rLab: 'Growth rate r (r > 2 is out of bounds)',
    s4mono: 'Status: <b>monotone approach</b> — climbs toward K from below and never crosses it (the r ≤ 1 case).',
    s4damp: 'Status: <b>damped oscillation, then settles</b> — overshoots K, falls back, the wiggles shrink and N settles at K (still inside the stable zone r ≤ 2; r = 2 is the borderline case and settles very slowly).',
    s4osc: 'Status: <b>period-{p} oscillation</b> — in the long run N cycles among {p} values and never settles at K (last-6-generation spread {spread}).',
    s4oscLong: 'Status: <b>oscillating</b> — never settles at K; the cycle is longer than 64 generations (last-6-generation spread {spread}).',
    s4chaos: 'Status: <b>chaos</b> — neither settles nor cycles, never repeats; Lyapunov exponent λ ≈ {lam} &gt; 0, so tiny differences in the start grow every generation (last-6-generation spread {spread}).',
    s4crash: 'Status: <b>crashed</b> — generation {g} produced N ≤ 0; the model has left its valid range (real populations do not go negative; this is an artefact of the discrete iteration).',
    s4conc: 'Takeaway: every model has a validity range. The stable zone here comes from a stability condition (this discrete form returns to K only for r ≤ 2, with r = 2 the borderline); beyond it, oscillation, chaos and negative counts force the question: is it the discretisation talking, or does the population really behave this way?',

    s5k: 'Step 5 · Finale',
    s5t: 'The page in three sentences',
    s5e: 'One: unconstrained proportional growth is exponential, with doubling time set by r. Two: with carrying capacity K, the effective rate r·(1 − N/K) shrinks as N approaches K, and iterating it produces the S (logistic) curve; K attracts from both sides. Three: for r &gt; 2 the discrete iteration no longer settles (oscillation, chaos, and for r &gt; 3 negative counts) — model boundaries must be stated, not hidden.',
    s5lkExp: 'Upstream: Exponentials & Logarithms (the foundation) →',
    s5lkEq: 'Side link: Chemical Equilibrium — another self-braking system →',
    s5bound: 'Notation: in Step 1, r is a continuous rate (e<sup>rt</sup>; doubling time ln2/r applies only to it); in Steps 2–4, r is a per-generation discrete rate (multiply by 1 + r each generation). Same letter, different quantity. Model boundary: this page uses the discrete iteration N ← N + rN(1 − N/K) and the continuous exponential as teaching models. The bacteria scenario is illustrative; real populations also depend on age structure, migration, time lags and random fluctuations, and parameters must be fitted to data — never read simulated values as measurements.'
  }
};
let _lang = null;
function storedLang() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return null; } }
function saveLang(l) { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s === 'zh' || s === 'en') { _lang = s; return s; }
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
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
