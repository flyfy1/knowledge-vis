'use strict';
// Diversification lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '分散投资 · 篮子要选不一起摔的',
    back: '← 知识索引',
    compare: '对照另一版本：分散投资 · 为什么不把鸡蛋放一个篮子里 →',
    navLabel: '分散投资步骤导航',
    tagline: '「别把鸡蛋放一个篮子里」人人都听过，可多放几个篮子，为什么就更稳？放十个一定比放两个稳吗？这一页从一个小镇上的两家店说起：雨伞店和冰淇淋店。你会看到，起作用的不是篮子的个数，而是这些篮子会不会一起摔。',
    nav0: '0 一个篮子', nav1: '1 雨伞配冰淇淋', nav2: '2 关键是一起不一起', nav3: '3 数量不是关键', nav4: '4 分散不掉的那一份', nav5: '5 收束',

    s0k: '第 0 步 · 只放一个篮子',
    s0t: '只买一家店，每年的回报会摇多大？',
    s0e: '这一步要回答：把钱全放进一家店，一年一年的结果有多不稳？小镇上有两家虚构的店。每年的天气像掷硬币：一半年份<strong>多雨</strong>，一半年份<strong>晴热</strong>；每家店另外还有自己的小运气（另一枚硬币）。<strong>雨伞店</strong>的回报率（一年钱多了百分之几）= 6% + 15%（多雨）或 − 15%（晴热）+ 8%（好运）或 − 8%（坏运）；<strong>冰淇淋店</strong>反过来，晴热年份 +15%、多雨年份 −15%，同样再加减自己的 8%。每根柱子是一年（模拟，固定种子），蓝柱是多雨年、橙柱是晴热年。我们用<strong>波动</strong>（标准差）衡量摇得多厉害：把每年离平均的距离平方、取平均、再开方，可以看成「典型的偏离」（<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ 概率分布第 2 步：方差怎样量出散布</a>）。灰色带是「平均 ± 波动」。',
    shopU: '只买雨伞店', shopI: '只买冰淇淋店', seed0: '换 20 年（新种子）',
    c0a: '每年回报率（%）：第几年',
    lgRain: '多雨年', lgHot: '晴热年', lgAvg: '平均（虚线）', lgBand: '平均 ± 波动',
    nameU: '雨伞店', nameI: '冰淇淋店',
    s0readout: '{shop}：长期来看平均 +6%、波动 17 个百分点（四种结果 +29%、+13%、−1%、−17% 各占四分之一）。这 20 年（第 {set} 组）实测：平均 {avg}%、波动 {sd} 个百分点，{loss} 年亏钱，最差一年 {worst}%。',
    s0hint: '观察顺序：先看「只买雨伞店」：蓝柱（多雨年）全在零线上方，橙柱（晴热年）全在下方，同一种天气里柱子的高低差 16 个百分点，那是店自己的运气；再切到「只买冰淇淋店」，正好倒过来。两家店长期的平均和波动完全一样，差别只在「哪种天气赚钱」。灰色带是长期的「平均 ± 波动」，不随年份变；换几组年份，读数里的实测波动都在 13 到 20 之间，围着 17 打转。',

    s1k: '第 1 步 · 两家店各买一点',
    s1t: '雨伞店和冰淇淋店按什么比例搭配，波动最小？',
    s1e: '这一步要回答：把钱分到两家店，组合的波动怎样随比例变化？<strong>组合</strong>就是同时持有几样东西，它的回报率 = 各部分回报率按钱数比例的加权平均：雨伞店占 w，冰淇淋店占 1 − w。天气一来，一家赚钱、另一家亏钱，两边互相抵消，只剩下各自的小运气。「20 年回报」一图用同一组年份画出两家店（细柱）和组合（白线）；「组合波动」一图画出每个比例下组合的长期波动（绿线，由模型公式算出），白点是你试过的比例。',
    weight: '雨伞店占的比例 w',
    c1a: '20 年回报（%）：两家店与组合', c1b: '组合波动（百分点）随雨伞店比例变化',
    lgU: '雨伞店', lgI: '冰淇淋店', lgMix: '组合', lgCurve: '组合的长期波动（公式）', lgTried: '试过的比例',
    s1readout: '雨伞店 {w}%、冰淇淋店 {iw}%：组合平均仍是 +6%，长期波动 {sd} 个百分点（单买一家是 17）。这 20 年实测波动 {sample}，最差一年 {worst}%。',
    s1hint: '观察顺序：从 w = 100%（只买雨伞店）开始，每次拖一格往 0% 走。看「20 年回报」：白线从贴着青柱，慢慢变平，到 50% 时最平，再往下又贴近粉柱；看「组合波动」：白点画出一个 U 形，底在 50%，约 5.7 个百分点，大约是单买一家的三分之一。平均一直是 6%：分散没让回报变少，只让它不那么摇。',

    s2k: '第 2 步 · 真正起作用的是什么',
    s2t: '两样东西「一起涨跌」的程度，怎样决定组合稳不稳？',
    s2e: '这一步要回答：上一步组合变稳，靠的是什么？换成两样一般的资产（虚构），每样平均 +6%、波动 20 个百分点，钱各放一半。它们一起涨跌的程度用<strong>相关系数 ρ</strong>（读作 rho）表示：ρ = 1 是完全同涨同跌，ρ = 0 是互不相干，ρ = −1 是一个涨另一个就跌同样多（雨伞店和冰淇淋店约为 −0.78）。「40 年的成对回报」一图每个点是一年：横坐标是第一样的回报，纵坐标是第二样的（模拟，固定种子；每个 ρ 用同一组运气，只改两样怎样配对）。「组合波动」一图是两样各半时的长期波动：20 × √((1 + ρ) ÷ 2)。',
    rho: '相关系数 ρ',
    c2a: '40 年的成对回报（%）：横＝第一样，纵＝第二样', c2b: '两样各半的组合波动（百分点）随 ρ 变化',
    lgYear: '一年', lgCurve2: '组合的长期波动（公式）', lgNow: '当前设置', lgTriedR2: '试过的 ρ',
    s2readout: 'ρ = {rho}：组合长期波动 {sd} 个百分点（单买一样是 20）。这 40 年的点实测相关系数 {sr}，组合实测波动 {ss}。{note}',
    s2noteOne: 'ρ = 1 时两样完全同步，分了也白分。',
    s2noteMinus: 'ρ = −1 时一个涨多少另一个就跌多少，各半的组合每年都正好是平均 +6%。',
    s2noteMid: '',
    s2hint: '观察顺序：从 ρ = 0 开始。往右拖到 1：点挤成一条向右上的斜线，组合波动升到 20，和只买一样没区别；往左拖到 −1：点排成向右下的斜线，组合波动降到 0。看「组合波动」一图的白点：越往左越低。资产个数一直是 2，变的只是它们是否一起涨跌。',

    s3k: '第 3 步 · 篮子越多越好吗',
    s3t: '十只总是一起涨跌的资产放在一起，比一只稳多少？',
    s3e: '这一步要回答：分散靠的是「个数多」，还是「不一起涨跌」？现在买 N 样资产，每样钱一样多，每样都是平均 +6%、波动 20 个百分点，任意两样的相关系数都是 ρ（一起涨跌的程度，1 = 完全同步，0 = 互不相干）。组合的长期波动 = 20 × √(ρ + (1 − ρ) ÷ N)。N 越大，后面那一项越小，但前面的 ρ 不会变小：波动最低只能降到 20 × √ρ，这条线叫<strong>分散的地板</strong>。先猜一下再拖。',
    quizPrompt: '先猜：10 样资产，两两相关系数 0.9（差不多同涨同跌），每样波动 20。组合波动大约是多少？',
    quizA: '约 6 个百分点：十样分摊，波动降到三分之一以下',
    quizB: '约 13 个百分点：降了三分之一',
    quizC: '约 19 个百分点：几乎没降',
    check: '核对', correct: '对。20 × √(0.9 + 0.1 ÷ 10) ≈ 19.1：十样一起涨跌的资产，几乎就是一样。', wrong: '再想想：它们几乎同涨同跌，坏年份会一起来。把下面的滑杆拖到 N = 10、ρ = 0.9 看看。',
    count: '资产个数 N',
    c3a: '组合波动（百分点）随资产个数 N 变化',
    lgCurve3: '当前 ρ 的曲线', lgTriedRho: '试过的 ρ', lgFloor: '分散的地板 20 × √ρ',
    s3readout: 'N = {n}、ρ = {rho}：组合波动 {sd} 个百分点（一只是 20）。地板是 {floor}，现在离地板还差 {gap}。同样 N 样、但互不相干（ρ = 0）时会是 {indep}。',
    s3hint: '观察顺序：先把 ρ 拖到 0.9，再把 N 从 1 拖到 40：曲线几乎是平的，贴在地板上。再把 ρ 一格格拖到 0：每个试过的 ρ 留下一条灰线，地板一路下降，曲线也越来越陡，ρ = 0 时 N = 40 能降到约 3.2。同一个 N，决定能降多少的是 ρ。',

    s4k: '第 4 步 · 拆开看',
    s4t: '为什么一起涨跌的那一份，买多少样都分散不掉？',
    s4e: '这一步要回答：上一步的「地板」从哪里来？把每样资产的回报拆成两份：<strong>共同的一份</strong>，来自所有资产都受的影响（比如整体经济好坏），每样资产这一份都一样；<strong>自己的一份</strong>，只和这一样有关，各样之间互不相干。这里每样资产 = 6% + 共同部分（波动 10）+ 自己部分（波动约 17.3），合起来波动正好 20，两两相关系数 0.25。买 N 样各一份：自己的那份有涨有跌、互相抵消，<strong>方差</strong>（波动的平方）变成原来的 1/N；共同的那份每样都一样，平均以后还是它自己。这和保险里「一万人各摊一点」是同一个道理，也有同一个限制：大家同时遇上的那场灾难分摊不掉（<a class="xlink" href="../../../probability/stochastic/risk-pooling/#step3">→ 风险池化第 3 步：同一场灾难</a>）。',
    grow4: '从 1 样加到 50 样', seed4: '换 30 年（新种子）',
    c4a: '30 年回报（%）：一样、组合与共同部分', c4b: '组合方差（波动²）的两份随 N 变化',
    lgOne: '只买第 1 样', lgPort: 'N 样的组合', lgMarket: '共同部分（白线）', lgShared: '共同的一份（分散不掉）', lgOwn: '自己的一份（÷ N）', lgMeas: '加过的 N：这 30 年的实测方差', lgModelNow: '当前 N 的模型方差',
    s4progress: '已加到 {n}/50 样。',
    s4readout: '{prog}N = {n}：组合方差 = 共同 100 + 自己 {own} = {tot}，波动 {sd} 个百分点（地板 10）。这 30 年（第 {set} 组）实测：组合波动 {ss}，组合最差一年 {pw}%，共同部分最差一年 {mw}%。',
    s4hint: '观察顺序：按「从 1 样加到 50 样」。看「30 年回报」：青线（组合）一开始和灰线（单买一样）一样乱跳，越加越贴近白线（共同部分），最后几乎和白线重合，白线的坏年份它也躲不掉。看「组合方差」一图：绿色那份一路变薄，粉色那份一点不少。',

    s5k: '第 5 步 · 收束',
    s5t: '一句话：分散看的是「会不会一起摔」，不是篮子个数',
    s5fin: '把六步连起来：只买一家店，回报随天气大起大落（第 0 步）；配上一家「天气反着来」的店，平均不变，波动降到约三分之一（第 1 步）；起作用的是<strong>相关系数</strong>：越不一起涨跌，组合越稳；完全同涨同跌时分了也白分（第 2 步）；个数只能把「自己的那份」摊薄，所以一起涨跌的资产买再多也只能降到<strong>地板</strong> 20 × √ρ（第 3 步）；地板就是大家共同的那一份，分散不掉（第 4 步）。',
    formula: '两样各占 w、1 − w：方差 = w²σ₁² + (1 − w)²σ₂² + 2w(1 − w)ρσ₁σ₂\nN 样等额、两两相关 ρ：波动 = σ × √(ρ + (1 − ρ) ÷ N)\n地板 = σ × √ρ',
    assume: '模型假设：本页全部数字都是虚构的教学例子，没有真实公司、行情或产品。第 0–1 步每年天气和各店运气都是公平硬币、年年独立；第 2–4 步用正态分布模拟，所有资产平均和波动相同、两两相关系数相同。现实中相关系数会变，坏年份里往往一起变大；资产的平均回报也各不相同。没有费用和税。',
    notAdvice: '这不是投资建议。本页只讲分散为什么能降低波动、又在哪里停住，不推荐任何资产或比例。',
    linksTitle: '接着去哪里',
    lk1: '→ 风险池化第 3 步：同一场灾难为什么分摊不掉',
    lk2: '→ 风险与回报第 1 步：风险为什么指的是「散开」',
    lk3: '→ 概率分布第 2 步：方差怎样量出散布',
    lk4: '→ 股票与债券第 1 步：买一只股票，买到的是什么',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分散投资 · 为什么不把鸡蛋放一个篮子里》的平行版本。'
  },
  en: {
    pageTitle: 'Diversification · Pick Baskets That Don’t Fall Together',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Diversification · Why Not Put All Eggs in One Basket →',
    navLabel: 'Diversification steps',
    tagline: 'Everyone has heard “don’t put all your eggs in one basket”. But why does using more baskets make things steadier — and are ten baskets always better than two? This page starts with two shops in one small town, an umbrella shop and an ice-cream shop. What matters, you will see, is not how many baskets you have but whether they tend to fall together.',
    nav0: '0 One basket', nav1: '1 Umbrellas + ice cream', nav2: '2 Together or not', nav3: '3 Count is not the point', nav4: '4 The part you can’t spread', nav5: '5 Wrap-up',

    s0k: 'Step 0 · All eggs in one basket',
    s0t: 'Own just one shop — how much does the yearly return swing?',
    s0e: 'The question here: put all your money into one shop, and how unsteady are the years? The town has two invented shops. Each year the weather is a coin toss: half the years are <strong>rainy</strong>, half are <strong>hot</strong>. On top of that, each shop has its own luck (a second coin). The <strong>umbrella shop’s</strong> return (how many percent the money grew that year) = 6% + 15% (rainy) or − 15% (hot), + 8% (good luck) or − 8% (bad luck). The <strong>ice-cream shop</strong> is the mirror image: +15% in hot years, −15% in rainy ones, plus or minus its own 8%. Each bar is one year (simulated, fixed seed); blue bars are rainy years, orange bars hot ones. We measure how hard a return swings with its <strong>volatility</strong> (standard deviation): square each year’s distance from the average, average those, take the square root — think of it as the typical distance from the average (<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ Probability distributions, step 2: how variance measures spread</a>). The grey band is “average ± volatility”.',
    shopU: 'Umbrella shop only', shopI: 'Ice-cream shop only', seed0: 'Another 20 years (new seed)',
    c0a: 'Yearly return (%) by year',
    lgRain: 'Rainy year', lgHot: 'Hot year', lgAvg: 'Average (dashed)', lgBand: 'Average ± volatility',
    nameU: 'Umbrella shop', nameI: 'Ice-cream shop',
    s0readout: '{shop}: in the long run, average +6% and volatility 17 points (four outcomes, +29%, +13%, −1% and −17%, a quarter of the time each). These 20 years (set {set}) measured: average {avg}%, volatility {sd} points, {loss} losing years, worst year {worst}%.',
    s0hint: 'What to watch: start with “Umbrella shop only” — every blue (rainy) bar stands above zero and every orange (hot) bar hangs below it; within one kind of weather the bars differ by 16 points, which is the shop’s own luck. Switch to “Ice-cream shop only” and it flips. In the long run both shops have exactly the same average and volatility; the only difference is which weather pays. The grey band is the long-run “average ± volatility” and does not depend on the years drawn; try a few sets and the measured volatility in the readout stays between 13 and 20, circling 17.',

    s1k: 'Step 1 · A bit of each shop',
    s1t: 'In what mix of umbrellas and ice cream is the swing smallest?',
    s1e: 'The question here: split your money between the two shops — how does the mix’s volatility depend on the split? A <strong>portfolio</strong> is simply holding several things at once; its return is the money-weighted average of the parts: w in the umbrella shop, 1 − w in ice cream. When the weather turns, one shop gains while the other loses, so the two cancel and only each shop’s own luck is left. The “20 years of returns” chart draws both shops (thin bars) and the portfolio (white line) over the same years; the “portfolio volatility” chart shows the long-run volatility for every split (green line, from the model formula), with a white dot for each split you have tried.',
    weight: 'Share in the umbrella shop, w',
    c1a: '20 years of returns (%): both shops and the mix', c1b: 'Portfolio volatility (pts) by umbrella share',
    lgU: 'Umbrella shop', lgI: 'Ice-cream shop', lgMix: 'Portfolio', lgCurve: 'Portfolio’s long-run volatility (formula)', lgTried: 'Splits you tried',
    s1readout: 'Umbrella {w}%, ice cream {iw}%: the portfolio still averages +6%, with long-run volatility {sd} points (one shop alone: 17). Measured over these 20 years: volatility {sample}, worst year {worst}%.',
    s1hint: 'What to watch: start at w = 100% (umbrellas only) and step toward 0%. In “20 years of returns” the white line starts glued to the cyan bars, flattens out, is flattest at 50%, then drifts toward the pink bars. In “portfolio volatility” the white dots trace a U whose bottom sits at 50%, about 5.7 points — roughly a third of one shop alone. The average stays at 6% throughout: spreading out did not cost any return, it only took out the swing.',

    s2k: 'Step 2 · What actually does the work',
    s2t: 'How does “moving together” decide whether a portfolio is steady?',
    s2e: 'The question here: what made the mix steadier in step 1? Swap in two ordinary (invented) assets, each averaging +6% with a volatility of 20 points, half your money in each. How much they move together is the <strong>correlation ρ</strong> (“rho”): ρ = 1 means they rise and fall in lockstep, ρ = 0 means they ignore each other, ρ = −1 means whenever one gains the other loses the same amount (the umbrella and ice-cream shops sit near −0.78). In the “40 years of paired returns” chart each dot is one year: across is the first asset’s return, up is the second’s (simulated, fixed seed; every ρ reuses the same luck and only changes how the two are paired). The “portfolio volatility” chart shows the half-and-half mix’s long-run volatility: 20 × √((1 + ρ) ÷ 2).',
    rho: 'Correlation ρ',
    c2a: '40 years of paired returns (%): across = first, up = second', c2b: 'Half-and-half volatility (pts) by ρ',
    lgYear: 'One year', lgCurve2: 'Portfolio’s long-run volatility (formula)', lgNow: 'Current setting', lgTriedR2: 'ρ values you tried',
    s2readout: 'ρ = {rho}: long-run portfolio volatility {sd} points (one asset alone: 20). Measured on these 40 dots: correlation {sr}, portfolio volatility {ss}. {note}',
    s2noteOne: 'At ρ = 1 the two are in lockstep, so splitting does nothing.',
    s2noteMinus: 'At ρ = −1 every gain in one is matched by a loss in the other, so the half-and-half mix earns exactly the +6% average every year.',
    s2noteMid: '',
    s2hint: 'What to watch: start at ρ = 0. Drag right to 1: the dots squeeze into a line rising to the right and the volatility climbs to 20 — no better than owning one. Drag left to −1: the dots line up falling to the right and the volatility drops to 0. Follow the white dots in “portfolio volatility”: the further left, the lower. There are always exactly two assets; only whether they move together changes.',

    s3k: 'Step 3 · Are more baskets always better?',
    s3t: 'Ten assets that always move together — how much steadier than one?',
    s3e: 'The question here: does diversification come from owning many things, or from owning things that don’t move together? Now buy N assets with equal money in each; each averages +6% with volatility 20 points, and every pair has correlation ρ (how much they move together: 1 = lockstep, 0 = unrelated). The portfolio’s long-run volatility is 20 × √(ρ + (1 − ρ) ÷ N). As N grows the second term shrinks, but ρ does not: the volatility can only fall to 20 × √ρ, the <strong>diversification floor</strong>. Make a guess first, then drag.',
    quizPrompt: 'Guess first: 10 assets, each pair with correlation 0.9 (almost lockstep), each with volatility 20. Roughly what is the portfolio’s volatility?',
    quizA: 'About 6 points — ten-way sharing cuts it below a third',
    quizB: 'About 13 points — down by a third',
    quizC: 'About 19 points — barely lower',
    check: 'Check', correct: 'Right. 20 × √(0.9 + 0.1 ÷ 10) ≈ 19.1: ten assets that move together are nearly one asset.', wrong: 'Think again: they rise and fall almost together, so the bad years arrive together too. Set the sliders below to N = 10, ρ = 0.9 and see.',
    count: 'Number of assets N',
    c3a: 'Portfolio volatility (pts) by number of assets N',
    lgCurve3: 'Curve for the current ρ', lgTriedRho: 'ρ values you tried', lgFloor: 'Diversification floor 20 × √ρ',
    s3readout: 'N = {n}, ρ = {rho}: portfolio volatility {sd} points (one asset: 20). The floor is {floor}, so it is still {gap} above it. With the same N but unrelated assets (ρ = 0) it would be {indep}.',
    s3hint: 'What to watch: set ρ to 0.9, then drag N from 1 to 40 — the curve is nearly flat, lying on its floor. Then step ρ down to 0: each ρ you try leaves a grey curve, the floor sinks and the curves get steeper; at ρ = 0, N = 40 brings it down to about 3.2. For the same N, ρ decides how far it can fall.',

    s4k: 'Step 4 · Take it apart',
    s4t: 'Why can’t the shared part be spread away, however many assets you own?',
    s4e: 'The question here: where does step 3’s floor come from? Split each asset’s return into two parts. The <strong>shared part</strong> comes from what hits every asset at once (say, how the whole economy is doing) and is identical across assets. The <strong>own part</strong> belongs to that one asset alone and is unrelated to the others. Here every asset = 6% + shared part (volatility 10) + own part (volatility about 17.3); together that is a volatility of exactly 20, and each pair has correlation 0.25. Own one slice of each of N assets: the own parts go up and down and cancel, so their <strong>variance</strong> (volatility squared) shrinks to 1/N; the shared part is the same in every asset, so averaging leaves it untouched. It is the same idea as insurance, where ten thousand people each chip in — with the same limit: a disaster that hits everyone at once cannot be shared away (<a class="xlink" href="../../../probability/stochastic/risk-pooling/#step3">→ Risk pooling, step 3: one shared disaster</a>).',
    grow4: 'Add assets from 1 to 50', seed4: 'Another 30 years (new seed)',
    c4a: '30 years of returns (%): one asset, the mix, the shared part', c4b: 'Portfolio variance (volatility²) in two parts, by N',
    lgOne: 'Asset 1 alone', lgPort: 'Mix of N assets', lgMarket: 'Shared part (white line)', lgShared: 'Shared part (can’t be spread)', lgOwn: 'Own part (÷ N)', lgMeas: 'Each N added: variance measured over these 30 years', lgModelNow: 'Model variance at the current N',
    s4progress: 'Added {n}/50 assets. ',
    s4readout: '{prog}N = {n}: portfolio variance = shared 100 + own {own} = {tot}, volatility {sd} points (floor 10). Measured over these 30 years (set {set}): portfolio volatility {ss}, portfolio’s worst year {pw}%, shared part’s worst year {mw}%.',
    s4hint: 'What to watch: press “Add assets from 1 to 50”. In “30 years of returns” the cyan mix starts out jumping just like the grey single asset, then hugs the white shared line more and more until it almost sits on it — and it cannot dodge the white line’s bad years. In the “portfolio variance” chart the green slice keeps thinning while the pink slice stays exactly as thick.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'In one line: diversification is about whether baskets fall together, not how many',
    s5fin: 'Put the six steps together. One shop alone rides the weather up and down (step 0). Pair it with a shop that loves the opposite weather and the average stays put while the volatility drops to about a third (step 1). What does the work is <strong>correlation</strong>: the less two things move together, the steadier the mix; in lockstep, splitting does nothing (step 2). Owning more only thins out each asset’s own part, so assets that move together bottom out at the <strong>floor</strong> 20 × √ρ however many you buy (step 3). That floor is the part everyone shares, and it can’t be spread away (step 4).',
    formula: 'Two assets, shares w and 1 − w: variance = w²σ₁² + (1 − w)²σ₂² + 2w(1 − w)ρσ₁σ₂\nN equal slices, pairwise correlation ρ: volatility = σ × √(ρ + (1 − ρ) ÷ N)\nfloor = σ × √ρ',
    assume: 'Model assumptions: every number on this page is an invented teaching example — no real company, market or product. In steps 0–1 the weather and each shop’s luck are fair coins, independent from year to year; steps 2–4 simulate with normal distributions in which every asset has the same average and volatility and every pair the same correlation. Real correlations change over time and tend to rise in bad years, and real assets have different average returns. No fees or taxes.',
    notAdvice: 'This is not investment advice. The page explains why spreading out lowers volatility and where that stops; it recommends no asset or mix.',
    linksTitle: 'Where to go next',
    lk1: '→ Risk pooling, step 3: why one shared disaster can’t be pooled away',
    lk2: '→ Risk & return, step 1: why “risk” means spread',
    lk3: '→ Probability distributions, step 2: how variance measures spread',
    lk4: '→ Stocks & bonds, step 1: what you actually own when you buy a share',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Diversification · Why Not Put All Eggs in One Basket”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]);
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.DV_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
