'use strict';
// Central limit theorem lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '中心极限定理 · 平均值为什么排成钟形',
    back: '← 知识索引',
    compare: '对照另一版本：中心极限定理 · 平均值总会变成钟形 →',
    navLabel: '中心极限定理步骤导航',
    tagline: '单个骰子的点数是平的，快递件数是歪的，评分是两头高的。可只要把很多个这样的数平均起来，平均值的分布几乎总会变成同一种钟形，宽度还按 1/√n 收窄。这一页先亲手做实验，再算出精确的分布，看它离钟形还差多少，最后看看这条定理在什么时候失效。',
    nav0: '0 原料', nav1: '1 做实验', nav2: '2 精确形状', nav3: '3 √n 定价', nav4: '4 民调 ±3%', nav5: '5 失效', nav6: '6 收束',

    src_die: '骰子点数', src_skew: '每天快递件数', src_ushape: '两极评分', src_rare: '次品标记',
    srcD_die: '骰子点数：1 到 6 各占 1/6，分布是平的。',
    srcD_skew: '每天收到的快递件数：0 件最常见，件数越多越少见，分布向右拖尾。',
    srcD_ushape: '0 到 6 分的评分：大多数人打最低或最高分，分布两头高、中间低。',
    srcD_rare: '次品标记：一件产品 10% 的概率是次品（记 1），否则记 0。',

    s0k: '第 0 步 · 原料',
    s0t: '单个随机数长得千奇百怪，平均起来会怎样？',
    s0e: '这一步要回答：我们手里有一个随机源，每次产生一个数；把 n 个独立产生的数取平均，平均值本身也是随机的，它的分布长什么样？先看原料。下面四个按钮是四种随机源，图里每根柱子是一个取值的概率。描述一个随机源先看两个数：<strong>均值 μ</strong>（按概率加权的平均，长期平均下来的值）和<strong>标准差 σ</strong>（取值离 μ 的典型距离：先求各值与 μ 之差的平方按概率加权的平均，再开方）。<strong>独立</strong>指每次产生的数互不影响。',
    c0aria: '当前随机源的概率分布，标出均值与正负一个标准差',
    lg0Bar: '每个取值的概率', lg0Mu: '均值 μ', lg0Sd: 'μ ± σ',
    c0title: '单次取值的分布（纵轴：概率）',
    s0readout: '{desc} μ = {mu}，σ = {sigma}。',
    quizPrompt: '先猜一猜：掷 100 个骰子，取这 100 个点数的平均。重复很多次，平均值大多落在哪里？',
    quizA: '1 到 6 之间哪里都差不多，和单个骰子一样平', quizB: '大多在 3.2 到 3.8 之间，中间多、两边少', quizC: '大多靠近 1 或 6',
    check: '核对',
    correct: '对。100 个骰子的平均值，精确计算有 {p}% 落在 3.2 到 3.8 之间，分布是中间高的钟形。下一步亲手做这个实验。',
    wrong: '再想想：平均 100 个点数时，大的和小的会互相抵消，平均值要远离 3.5 需要大多数骰子同时偏向一边。下一步可以直接做实验看。',
    s0hint: '观察顺序：四个按钮挨个点，看柱子的形状：平的、向右拖尾的、两头高的、只有两根柱子的。橙色竖线是均值，浅色带是 μ ± σ。这四种形状都不是钟形，后面几步都会用到它们，选中的随机源在第 0 到 3 步共用。',

    s1k: '第 1 步 · 亲手做实验',
    s1t: '把 n 个数平均一次、再平均一次……平均值堆出了什么形状？',
    s1e: '这一步要回答：平均值的分布到底长什么样？做法是重复实验：每次从当前随机源独立抽 n 个数，算它们的平均值，把这个平均值记进下面的柱状图。上图是最近一次实验抽到的 n 个数（白点）和它们的平均值（橙色竖线）；下图是所有实验平均值的柱状图，纵轴是落在每个小区间里的实验占比。白色虚线是<strong>中心极限定理</strong>预言的钟形，即<strong>正态分布</strong>：中心在 μ、标准差为 σ/√n。实验是本页用随机数模拟的。',
    c1aria: '最近一次实验的 n 个值与平均值，以及所有实验平均值的柱状图',
    lg1Draw: '这次抽到的 n 个值', lg1Mean: '这次的平均值', lg1Hist: '历次平均值的柱状图', lg1Normal: '正态曲线：中心 μ、标准差 σ/√n',
    nSlider: '每次平均的个数 n',
    run1: '做 1 次实验', run100: '做 100 次', run1000: '做 1000 次', clear: '清空',
    c1top: '最近一次实验：n 个值和它们的平均', c1bot: '历次实验的平均值（纵轴：占比）',
    s1readout: '已做 {k} 次实验，每次平均 {n} 个值。这些平均值的平均 {m}（μ = {mu}），标准差 {s}（σ/√n = {t}）。',
    s1empty: '还没有实验。按「做 1 次实验」看一次抽样，再按「做 100 次」看柱状图长出来。',
    s1cleared: '（改了 n 或随机源，之前的实验已清空。）',
    s1hint: '观察顺序：先保持 n = 1，做 1000 次：柱状图就是原料本身的形状。再把 n 拖到 10 重新做 1000 次：柱子挤到 μ 附近，形状变成钟形，贴住白色虚线。改 n 或换随机源会清空记录（读数会提示）。比较读数里的两个标准差：实验值与 σ/√n 应该接近，差别来自只做了有限次实验。',

    s2k: '第 2 步 · 精确形状',
    s2t: '不做实验，能不能直接算出平均值的分布？离钟形还差多少？',
    s2e: '这一步要回答：给定随机源和 n，平均值的分布能不能精确算出来，它和正态分布差多少？能算：两个独立随机数之和的分布，是两份概率表做<strong>卷积</strong>（把每一对取值的概率相乘，按和归到一起，<a class="xlink" href="../convolution/#step1">→ 卷积页（Claude 版）第 1 步：一串拍手的回响怎样叠成卷积</a>）。把同一张概率表卷 n 次就得到 n 个数之和的分布，再除以 n 就是平均值的分布。上图青色柱是这样算出的精确分布，白色虚线是正态曲线。差多少用 <strong>KS 距离</strong>量：把两者都写成「小于等于 x 的概率」（累积分布），在所有 x 上取它们的最大竖直差；0 表示完全重合，越小越像。',
    c2aria: '平均值的精确分布与正态曲线，以及 KS 距离随 n 的变化',
    lg2Exact: '精确分布（卷积算出）', lg2Ks: '当前随机源的 KS 距离', lg2Other: '其他三种随机源',
    nSlider2: '平均的个数 n', play2: '从 n = 1 播放到 300',
    c2top: '平均值的精确分布（纵轴：概率）', c2bot: 'KS 距离随 n（横轴对数刻度，虚线 = 0.05）',
    s2readout: 'n = {n}：KS 距离 {ks}。这个随机源从 n = {first} 起 KS 距离小于 0.05。',
    s2hint: '观察顺序：选「骰子点数」，把 n 从 1 慢慢拖大，看青色柱从平台变成钟形，下图橙线往下走。再换「每天快递件数」和「次品标记」对比：下图灰线是其他随机源。KS 距离降到 0.05 以下，骰子要 n = 6，两极评分也是 6，快递件数要 18，次品标记要 284。原料越歪（越不对称、越集中在一个值上），需要的 n 越大；定理只说「n 足够大时」，没说多大算够。',

    s3k: '第 3 步 · 精度按 √n 定价',
    s3t: '平均的数越多越准，可是多 4 倍的数据换来多少精度？',
    s3e: '这一步要回答：平均值的波动随 n 怎样缩小？平均值的标准差（也叫<strong>标准误</strong>）等于 <strong>σ/√n</strong>：n 个独立数之和的方差（标准差的平方）是 nσ²，除以 n 之后方差变成 σ²/n，开方得 σ/√n。这条公式只要求独立和 σ 有限，不要求钟形。上图把 n 和 4n 的精确分布画在一起，灰色是 n = 1 的原料；下图横轴是 n（对数刻度），曲线是 σ/√n，绿色横线是你设定的目标标准差。',
    c3aria: 'n 与 4n 时平均值的精确分布，以及标准差随 n 下降的曲线',
    lg3One: 'n = 1（原料）', lg3N: 'n', lg3N4: '4n', lg3Target: '目标标准差',
    nSlider3: '平均的个数 n', target3: '目标标准差',
    c3top: '平均值的精确分布：n 与 4n（纵轴：概率密度）', c3bot: '平均值的标准差 σ/√n（横轴 n，对数刻度）',
    s3readout: 'n = {n}：标准差 {s1}；4n = {n4}：标准差 {s4}，正好是一半（比值 {r}）。要让标准差 ≤ {e}，需要 n ≥ {need}。',
    s3hint: '观察顺序：拖 n，看上图橙色（4n）总是比青色（n）窄一半，下图两个点在曲线上的距离始终相同。再拖目标：目标减半，所需的 n 变成 4 倍。例如骰子点数（σ ≈ 1.71）要把标准差降到 0.1，需要 n ≥ 292。',

    s4k: '第 4 步 · 民调的 ±3%',
    s4t: '为什么一千人左右的民调敢说误差 ±3%？',
    s4e: '这一步要回答：民调里「支持率 52%，误差 ±3%」是怎么算的、意思是什么？把每个受访者记为 1（支持）或 0（不支持），支持率就是这些 0 和 1 的平均值。单个 0/1 的标准差是 √(p(1 − p))，p 是全体的真实支持率；按上一步，n 人平均的标准差是 √(p(1 − p)/n)。中心极限定理说这个平均值近似正态，而正态分布约 95% 的概率落在中心 ± 1.96 个标准差内。于是用样本支持率 p̂ 代替未知的 p，<strong>误差范围</strong> = 1.96 × √(p̂(1 − p̂)/n)。「±3%」的意思是：如果反复做同样的民调，约 95% 次的 p̂ ± 误差会盖住真实的 p。下面是模拟的民调，每一行是一次。',
    c4aria: '多次模拟民调的支持率区间，与真实支持率比较',
    lg4Hit: '区间盖住了真值', lg4Miss: '区间没盖住', lg4True: '真实支持率 p（模拟设定，现实中未知）',
    p4: '真实支持率 p（模拟设定）', n4: '每次民调的人数 n',
    poll100: '做 100 次民调',
    c4title: '每一行是一次民调：p̂ ± 误差范围',
    s4readout: '{k} 次民调，{c} 次盖住真值（{cr}）。按公式，这个 n 的误差范围约 ±{m}；精确计算的覆盖率 {ex}。',
    s4empty: '还没有民调。当前设定下误差范围约 ±{m}，精确计算的覆盖率 {ex}。按「做 100 次民调」。',
    s4cleared: '（改了 p 或 n，之前的民调已清空。）',
    s4hint: '观察顺序：保持 p = 50%、n = 1000，做 100 次：大约每 20 行有 1 行是橙色。读数里误差范围是 ±3.1%；要正好 ±3.0%，需要约 1068 人，这就是「一千人左右」的来历。再把 n 拖到 100：每一行都变宽。最后把 p 拖到 5%、n 拖到 100：精确覆盖率降到 87.7%，橙色变多。p 靠近 0 或 1 且 n 小时，平均值还没变成钟形，这个公式就不可靠了。',

    s5k: '第 5 步 · 定理失效的时候',
    s5t: '有没有随机源，平均多少次都安定不下来？',
    s5e: '这一步要回答：中心极限定理的条件「σ 有限」去掉会怎样？<strong>柯西分布</strong>是一个反例：它的形状像一口窄钟，但两边的尾巴很厚，偶尔会冒出极大的数，大到均值和标准差都不存在（积分发散）。下面两张图画的是「前 n 个数的平均值」随 n 的变化，叫<strong>累计平均</strong>，横轴是 n（对数刻度）。上图用骰子点数，下图用柯西分布，每张图 4 条线，各用一串不同的随机数。',
    c5aria: '骰子点数与柯西分布的累计平均随 n 的变化',
    lg5Path: '第 {i} 串随机数',
    reseed5: '换 4 串新的随机数',
    c5top: '骰子点数的累计平均（虚线 = μ = 3.5）', c5bot: '柯西分布的累计平均（超出 ±10 的画在边上）',
    s5readout: '第 {set} 组。n = 5000 时，骰子的 4 条线落在 {d0} 到 {d1}（相差 {dd}）；柯西的 4 条线落在 {c0} 到 {c1}（相差 {cd}）。',
    s5hint: '观察顺序：多按几次「换 4 串新的随机数」。上图 4 条线每次都挤向 3.5，n = 5000 时相差不到 0.15。下图的线会在某一步突然跳一大截，到了 n = 5000 也不汇合。这不是运气差：n 个独立柯西数的平均值仍然服从同一个柯西分布，无论 n 多大，平均值落在 [−1, 1] 之外的概率始终是一半。σ 无限时，σ/√n 也就无从谈起。',

    s6k: '第 6 步 · 收束',
    s6t: '钟形从哪里来，到哪里为止',
    s6fin: '把 n 个独立、同分布、标准差有限的随机数平均，平均值的分布中心在 μ，宽度是 σ/√n，形状随 n 增大趋向正态分布；原料是平的、歪的还是两头高的都一样。精确分布是原料概率表的 n 次卷积，正态曲线是它在 n 大时的近似。离近似有多近取决于原料：越歪、越集中在一个值上，需要的 n 越大。',
    formula: '平均值的均值 = μ，标准差 = σ/√n\n(平均值 − μ) ÷ (σ/√n) → 标准正态（n → ∞）\n95% 误差范围 ≈ 1.96 × σ/√n',
    boundary: '适用范围：各次取值要独立（相关的数据，例如同一个家庭的几个受访者，有效样本量更小）；要来自同一个分布，或至少没有某一项独占主导；σ 必须有限（柯西分布不行）；「近似正态」需要多大的 n 因原料而异，偏斜或罕见事件要大得多。本页实验与民调都是模拟数据；精确分布是计算结果，不是模拟。',
    linksTitle: '接着去看',
    lk1: '统计推断第 0 步：样本均值也有自己的分布，用它来做推断 →',
    lk2: '二项与正态第 4 步：n 要多大，正态近似才够用 →',
    lk3: '风险分摊第 1 步：把很多人放在一起，人均损失为什么变稳 →',
    lk4: '蒙特卡洛第 2 步：样本翻四倍，误差为什么只减半 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《中心极限定理 · 平均值总会变成钟形》的平行版本。'
  },
  en: {
    pageTitle: 'Central Limit Theorem · Why Averages Line Up in a Bell',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Central Limit Theorem · Averages Always Turn Bell-Shaped →',
    navLabel: 'Central limit theorem step navigation',
    tagline: 'A single die roll is flat, parcels per day are lopsided, ratings pile up at both ends. Yet average enough of any of them and the distribution of the average almost always becomes the same bell, narrowing like 1/√n. This page runs the experiment by hand, computes the exact distribution to see how far it still is from a bell, and ends with where the theorem breaks.',
    nav0: '0 Raw material', nav1: '1 Experiment', nav2: '2 Exact shape', nav3: '3 Priced by √n', nav4: '4 Polls ±3%', nav5: '5 Breakdown', nav6: '6 Wrap-up',

    src_die: 'Die roll', src_skew: 'Parcels per day', src_ushape: 'Polarised ratings', src_rare: 'Defect flag',
    srcD_die: 'Die roll: 1 to 6, each with probability 1/6 — a flat distribution.',
    srcD_skew: 'Parcels received per day: 0 is most common, and larger counts get rarer — a long right tail.',
    srcD_ushape: 'Ratings from 0 to 6: most people give the lowest or the highest score — high at both ends, low in the middle.',
    srcD_rare: 'Defect flag: an item is defective (recorded as 1) with probability 10%, otherwise 0.',

    s0k: 'STEP 0 · RAW MATERIAL',
    s0t: 'Single random numbers come in all shapes. What happens when you average them?',
    s0e: 'This step asks: we have a random source that produces one number at a time. Average n independently produced numbers and the average is itself random — what does its distribution look like? Start with the raw material. The four buttons below are four sources; each bar is the probability of one value. Two numbers summarise a source: the <strong>mean μ</strong> (the probability-weighted average, what you get in the long run) and the <strong>standard deviation σ</strong> (the typical distance of a value from μ: take the probability-weighted average of squared differences from μ, then the square root). <strong>Independent</strong> means each number has no influence on the others.',
    c0aria: 'Probability distribution of the current source, with its mean and one standard deviation either side',
    lg0Bar: 'Probability of each value', lg0Mu: 'Mean μ', lg0Sd: 'μ ± σ',
    c0title: 'Distribution of a single value (up: probability)',
    s0readout: '{desc} μ = {mu}, σ = {sigma}.',
    quizPrompt: 'Guess first: roll 100 dice and average the 100 scores. Repeat many times. Where do most averages land?',
    quizA: 'Anywhere from 1 to 6, just as flat as one die', quizB: 'Mostly between 3.2 and 3.8, crowded in the middle', quizC: 'Mostly near 1 or 6',
    check: 'Check',
    correct: 'Right. For the average of 100 dice, the exact calculation puts {p}% of the outcomes between 3.2 and 3.8, in a bell that peaks in the middle. The next step runs this experiment.',
    wrong: 'Think again: across 100 dice, high and low rolls cancel. For the average to stray far from 3.5, most of the dice would have to lean the same way at once. The next step lets you run the experiment.',
    s0hint: 'What to try: click the four buttons in turn and look at the bars: flat, right-skewed, high at both ends, and just two bars. The orange line is the mean; the pale band is μ ± σ. None of these is a bell. The later steps use them all, and the chosen source is shared by steps 0 to 3.',

    s1k: 'STEP 1 · RUN THE EXPERIMENT',
    s1t: 'Average n numbers, then do it again, and again… what shape do the averages pile into?',
    s1e: 'This step asks: what does the distribution of the average actually look like? Repeat an experiment: each time, draw n independent numbers from the current source, take their average, and add it to the histogram below. The top chart shows the n numbers from the latest experiment (white dots) and their average (orange line). The bottom chart is the histogram of all the averages so far; the height is the share of experiments landing in each small interval. The white dashed curve is the bell predicted by the <strong>central limit theorem</strong>, the <strong>normal distribution</strong> centred at μ with standard deviation σ/√n. The experiments are simulated with random numbers.',
    c1aria: 'The n values and average of the latest experiment, and a histogram of all averages',
    lg1Draw: 'The n values drawn this time', lg1Mean: 'This average', lg1Hist: 'Histogram of averages so far', lg1Normal: 'Normal curve: centre μ, standard deviation σ/√n',
    nSlider: 'Numbers per average, n',
    run1: 'Run 1 experiment', run100: 'Run 100', run1000: 'Run 1000', clear: 'Clear',
    c1top: 'Latest experiment: n values and their average', c1bot: 'Averages from all experiments (up: share)',
    s1readout: '{k} experiments, each averaging {n} values. The mean of these averages is {m} (μ = {mu}); their standard deviation is {s} (σ/√n = {t}).',
    s1empty: 'No experiments yet. Press “Run 1 experiment” to see one draw, then “Run 100” to watch the histogram grow.',
    s1cleared: '(n or the source changed, so the earlier experiments were cleared.)',
    s1hint: 'What to try: keep n = 1 and run 1000: the histogram is just the raw material’s shape. Then drag n to 10 and run 1000 again: the bars crowd around μ and take on a bell shape that hugs the white dashed curve. Changing n or the source clears the record (the readout says so). Compare the two standard deviations in the readout: the experimental one should be close to σ/√n, differing only because you ran finitely many experiments.',

    s2k: 'STEP 2 · THE EXACT SHAPE',
    s2t: 'Can we compute the distribution of the average without experiments — and how far is it from a bell?',
    s2e: 'This step asks: for a given source and n, can the distribution of the average be computed exactly, and how far is it from normal? It can. The distribution of the sum of two independent random numbers is the <strong>convolution</strong> of their probability tables (multiply the probabilities of every pair of values and collect them by their sum; <a class="xlink" href="../convolution/#step1">→ Convolution (Claude edition), step 1: how a train of claps adds up to a convolution</a>). Convolve the same table n times to get the distribution of a sum of n numbers, then divide by n for the average. The cyan bars on top are this exact distribution; the white dashed curve is the normal one. The gap is measured by the <strong>KS distance</strong>: write both as “probability of being at most x” (the cumulative distribution) and take the largest vertical gap over all x. Zero means identical; smaller is closer.',
    c2aria: 'Exact distribution of the average with the normal curve, and the KS distance against n',
    lg2Exact: 'Exact distribution (by convolution)', lg2Ks: 'KS distance, current source', lg2Other: 'The other three sources',
    nSlider2: 'Numbers per average, n', play2: 'Play from n = 1 to 300',
    c2top: 'Exact distribution of the average (up: probability)', c2bot: 'KS distance against n (log scale; dashed = 0.05)',
    s2readout: 'n = {n}: KS distance {ks}. This source is below 0.05 from n = {first} on.',
    s2hint: 'What to try: pick “Die roll” and slowly drag n up. The cyan bars turn from a plateau into a bell while the orange line in the bottom chart falls. Then compare “Parcels per day” and “Defect flag”; the grey lines are the other sources. To get the KS distance below 0.05 takes n = 6 for the die, 6 for polarised ratings, 18 for parcels, and 284 for the defect flag. The more lopsided the raw material (less symmetric, more concentrated on one value), the larger n must be. The theorem says “for large enough n”; it does not say how large.',

    s3k: 'STEP 3 · PRECISION IS PRICED BY √n',
    s3t: 'More numbers make a better average — but how much precision does 4× the data buy?',
    s3e: 'This step asks: how does the wobble of the average shrink with n? The standard deviation of the average (also called the <strong>standard error</strong>) is <strong>σ/√n</strong>: the variance (the square of the standard deviation) of a sum of n independent numbers is nσ²; dividing by n leaves σ²/n, and the square root is σ/√n. This needs only independence and a finite σ, not a bell shape. The top chart overlays the exact distributions for n and 4n, with the raw material (n = 1) in grey; the bottom chart puts n across (log scale) with the curve σ/√n, and the green line is the target standard deviation you set.',
    c3aria: 'Exact distributions of the average for n and 4n, and the standard deviation falling with n',
    lg3One: 'n = 1 (raw material)', lg3N: 'n', lg3N4: '4n', lg3Target: 'Target standard deviation',
    nSlider3: 'Numbers per average, n', target3: 'Target standard deviation',
    c3top: 'Exact distribution of the average: n and 4n (up: density)', c3bot: 'Standard deviation of the average σ/√n (n on a log scale)',
    s3readout: 'n = {n}: standard deviation {s1}; 4n = {n4}: standard deviation {s4}, exactly half (ratio {r}). To get the standard deviation down to {e} you need n ≥ {need}.',
    s3hint: 'What to try: drag n and watch the orange curve (4n) stay exactly half as wide as the cyan one (n); in the bottom chart the two dots are always the same distance apart along the curve. Then drag the target: halve it and the required n quadruples. For a die roll (σ ≈ 1.71), getting the standard deviation down to 0.1 needs n ≥ 292.',

    s4k: 'STEP 4 · THE ±3% OF A POLL',
    s4t: 'Why does a poll of about a thousand people dare to quote ±3%?',
    s4e: 'This step asks: how is a poll’s “52% support, margin of error ±3%” computed, and what does it mean? Record each respondent as 1 (supports) or 0 (does not); the support rate is the average of these 0s and 1s. A single 0/1 has standard deviation √(p(1 − p)), where p is the true support rate in the whole population; by the previous step, the average of n respondents has standard deviation √(p(1 − p)/n). The central limit theorem says this average is roughly normal, and a normal distribution puts about 95% of its probability within ± 1.96 standard deviations of the centre. So, with the sample rate p̂ standing in for the unknown p, the <strong>margin of error</strong> = 1.96 × √(p̂(1 − p̂)/n). “±3%” means: repeat the same poll many times and about 95% of the intervals p̂ ± margin will cover the true p. Below are simulated polls, one per row.',
    c4aria: 'Support-rate intervals from many simulated polls, compared with the true rate',
    lg4Hit: 'Interval covers the truth', lg4Miss: 'Interval misses', lg4True: 'True support p (set by the simulation; unknown in reality)',
    p4: 'True support p (simulation setting)', n4: 'Respondents per poll, n',
    poll100: 'Run 100 polls',
    c4title: 'Each row is one poll: p̂ ± margin of error',
    s4readout: '{k} polls, {c} covered the truth ({cr}). By the formula this n gives a margin of about ±{m}; the exact coverage is {ex}.',
    s4empty: 'No polls yet. With these settings the margin is about ±{m} and the exact coverage is {ex}. Press “Run 100 polls”.',
    s4cleared: '(p or n changed, so the earlier polls were cleared.)',
    s4hint: 'What to try: keep p = 50% and n = 1000 and run 100: roughly one row in 20 turns orange. The readout gives a margin of ±3.1%; exactly ±3.0% needs about 1068 people — that is where “about a thousand” comes from. Then drag n to 100: every row gets wider. Finally drag p to 5% and n to 100: the exact coverage drops to 87.7% and more rows turn orange. When p is near 0 or 1 and n is small, the average has not yet become a bell, and the formula stops being reliable.',

    s5k: 'STEP 5 · WHEN THE THEOREM FAILS',
    s5t: 'Is there a source whose average never settles, however many numbers you take?',
    s5e: 'This step asks: what happens if we drop the theorem’s condition that σ is finite? The <strong>Cauchy distribution</strong> is a counterexample. It looks like a narrow bell, but its tails are so heavy that it occasionally throws out enormous numbers — so enormous that its mean and standard deviation do not exist (the integrals diverge). The two charts below plot the “average of the first n numbers” against n, called the <strong>running average</strong>, with n on a log scale. The top chart uses die rolls, the bottom one the Cauchy distribution; each has 4 lines, each from a different stream of random numbers.',
    c5aria: 'Running averages of die rolls and of Cauchy draws against n',
    lg5Path: 'Stream {i}',
    reseed5: 'New set of 4 random streams',
    c5top: 'Running average of die rolls (dashed = μ = 3.5)', c5bot: 'Running average of Cauchy draws (clipped at ±10)',
    s5readout: 'Set {set}. At n = 5000 the four die lines sit between {d0} and {d1} (spread {dd}); the four Cauchy lines between {c0} and {c1} (spread {cd}).',
    s5hint: 'What to try: press “New set of 4 random streams” a few times. In the top chart the four lines squeeze toward 3.5 every time, less than 0.15 apart at n = 5000. In the bottom chart a line will suddenly jump a long way at some step, and even at n = 5000 they do not come together. This is not bad luck: the average of n independent Cauchy numbers has exactly the same Cauchy distribution as one number, so whatever n is, the average lands outside [−1, 1] half the time. With σ infinite, σ/√n means nothing.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Where the bell comes from, and where it stops',
    s6fin: 'Average n independent, identically distributed random numbers with finite standard deviation, and the average is centred at μ with width σ/√n, its shape tending to the normal distribution as n grows — whether the raw material is flat, lopsided or high at both ends. The exact distribution is the n-fold convolution of the raw probability table; the normal curve is its large-n approximation. How close the approximation is depends on the raw material: the more lopsided, or the more concentrated on one value, the larger n has to be.',
    formula: 'mean of the average = μ, standard deviation = σ/√n\n(average − μ) ÷ (σ/√n) → standard normal (n → ∞)\n95% margin ≈ 1.96 × σ/√n',
    boundary: 'Where it holds: the draws must be independent (correlated data, such as several respondents from one household, carry a smaller effective sample); they must come from one distribution, or at least no single term may dominate; σ must be finite (Cauchy fails); how large n must be for “roughly normal” depends on the raw material, and skewed or rare events need far more. The experiments and polls on this page are simulated; the exact distributions are computed, not simulated.',
    linksTitle: 'Where to next',
    lk1: 'Statistical inference, step 0: the sample mean has a distribution of its own, and inference uses it →',
    lk2: 'Binomial and normal, step 4: how large n must be before the normal approximation is good enough →',
    lk3: 'Risk pooling, step 1: put many people together and the loss per head steadies →',
    lk4: 'Monte Carlo, step 2: four times the samples, only half the error →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Central Limit Theorem · Averages Always Turn Bell-Shaped”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
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
  if (typeof window.refreshCLT === 'function') window.refreshCLT();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CLT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
