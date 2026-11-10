'use strict';
// Hypothesis-testing lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '假设检验与 p 值 · 法庭模型判硬币冤不冤',
    back: '← 知识索引',
    compare: '对照另一版本：假设检验与 p 值 · 法庭模型判硬币冤不冤 →',
    navLabel: '假设检验步骤导航',
    tagline: '有人说这枚硬币做了手脚。我们能拿到的只有证据：抛 n 次，数出正面次数。想知道的是：它到底公不公平？假设检验像一场审判：先推定无罪，再看证据罕见到什么程度才定罪。六步里你会算出 p 值，定下定罪标准，量一量会冤枉多少好硬币、放过多少坏硬币，最后看清「被定罪」和「真有问题」之间差多远。',
    nav0: '0 p 值', nav1: '1 p 值的分布', nav2: '2 定罪标准 α', nav3: '3 功效', nav4: '4 抛几次', nav5: '5 冤案比例', nav6: '6 收束',

    s0k: '第 0 步 · 证据有多罕见',
    s0t: '抛 20 次出了 15 次正面，这够不够说明硬币不公平？',
    s0e: '这一步要回答：拿到一组抛硬币的结果后，怎样衡量它「对公平硬币来说有多反常」？先立一个<strong>原假设</strong> H₀：硬币公平，正面概率 0.5（相当于法庭上的无罪推定）。在 H₀ 下，n 次里出现 j 次正面的概率是 C(n, j)/2ⁿ（<strong>二项分布</strong>，柱子的高度；<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ 二项与正态第 0 步：这些概率从哪来</a>）。然后问：如果硬币真的公平，出现<strong>至少和这次一样偏离一半</strong>的结果（正面太多或太少都算，叫<strong>双侧</strong>）的概率有多大？这个概率就是 <strong>p 值</strong>。p 越小，这份证据对「公平」越不利。注意：p 值是「假定公平时看到这种证据的概率」，不是「硬币公平的概率」，第 5 步会看到两者能差很远。',
    c0title: '公平硬币抛 {n} 次，正面次数的概率',
    s0lgX: '至少这么偏的结果（加起来 = p 值）', s0lgC: '没这么偏的结果', s0lgK: '这次的正面次数 k',
    n0: '抛的次数 n', k0: '正面次数 k',
    s0readout: '抛 {n} 次、{k} 次正面，离一半（{half}）偏了 {dev} 次。至少这么偏的结果是 {set}；如果硬币公平，它们的总概率 p = {p}：{verdict}。',
    s0set: '正面 ≤ {lo} 或 ≥ {hi} 次', s0all: '所有结果（这次恰好是一半）',
    s0rare: 'p ≤ 0.05，按常用标准算罕见', s0notRare: 'p > 0.05，公平硬币也不难抛出这样的结果',
    s0hint: '观察顺序：保持 n = 20，把 k 从 10 拖到 15，粉色从全部收缩到两端，p 从 1 降到 0.041。再比较同样六成正面的两组证据：n = 20、k = 12 时 p ≈ 0.50；n = 100、k = 60 时 p ≈ 0.057。比例一样，抛得越多，偏离就越难用运气解释。',

    s1k: '第 1 步 · p 值自己也是随机的',
    s1t: '如果硬币真的公平，p 值通常有多大？',
    s1e: '这一步要回答：同一枚硬币再抛一轮，p 值会变；它在公平硬币和偏硬币上分别会落在哪里？这里用电脑反复模拟「抛 50 次、算一次 p 值」，每个 p 值落进宽 0.05 的一格。滑杆设的是模拟里硬币的<strong>真实正面概率 q</strong>：模拟器知道真相，现实中的你不知道。青色柱是模拟出的比例，橙色虚线是精确计算的比例。粉色是第一格 p ≤ 0.05。',
    c1title: 'p 值落在各区间的比例（每轮抛 {n} 次）',
    s1lgLow: 'p ≤ 0.05 的比例', s1lgSim: '模拟出的比例', s1lgEx: '精确比例',
    q1: '模拟用的真实正面概率 q',
    run100: '再做 100 轮', run1000: '再做 1000 轮', reset1: '换一串随机数重来',
    s1h0: '硬币公平（q = 0.5，H₀ 为真）', s1h1: '硬币偏了（q = {q}，H₀ 为假）',
    s1empty: '{truth}。还没开始，精确计算 p ≤ 0.05 的比例为 {ex}。按「再做 100 轮」。',
    s1readout: '{truth}：已做 {n}/{N} 轮，其中 {low} 轮 p ≤ 0.05，占 {share}（精确值 {ex}）。',
    s1hint: '观察顺序：q = 0.5 时连按几次「再做 1000 轮」：柱子散布在 0 到 1 之间，中间有空格，因为抛 50 次时 p 值只能取二十几种值；粉色那格稳定在约 3.3%，低于 5%。再把 q 调到 0.65（会清空重来）：p 值大量挤进第一格，约 51%。小 p 值是偏硬币的常见产物，但公平硬币也会以约 3.3% 的比例产出它。',

    s2k: '第 2 步 · 定罪标准',
    s2t: 'p 多小才定罪？这条线该在看证据之前还是之后画？',
    s2e: '这一步要回答：怎样定一条事先公开、又能控制冤案率的定罪标准？<strong>显著性水平 α</strong> 是我们愿意承担的冤案率：在硬币公平时把它定罪的概率上限。看数据<strong>之前</strong>就从最偏的结果开始往里圈，只要圈住的结果在 H₀ 下的总概率不超过 α 就继续，得到的集合叫<strong>拒绝域</strong>：结果落进去就拒绝 H₀（定罪），否则不拒绝（证据不足，不等于证明清白）。公平硬币被定罪叫<strong>第一类错误</strong>，它的实际概率就是拒绝域在 H₀ 下的总概率。这与「p ≤ α 就拒绝」是同一条规则。正面次数只能取整数，所以实际概率通常小于 α。',
    c2title: '公平硬币抛 {n} 次：拒绝域（粉色）',
    s2lgR: '拒绝域：落进来就定罪', s2lgA: '不拒绝', s2lgB: '拒绝域的边界',
    a2: '显著性水平 α', n2: '抛的次数 n',
    s2readout: 'α = {a}，抛 {n} 次：{reg}。公平硬币被冤枉（第一类错误）的实际概率 {s}，比 α 低 {gap}。',
    s2region: '正面 ≤ {lo} 或 ≥ {hi} 次就定罪', s2never: '无论结果如何都不定罪（抛得太少，最极端的结果也不够罕见）',
    s2hint: '观察顺序：n = 50 时把 α 从 1% 慢慢拖到 20%：拒绝域一格一格向中间扩，实际冤案率呈台阶状上升，始终不超过 α（例如 α = 5% 到 6% 时都是 3.28%，到 7% 才跳到 6.49%）。再把 n 拖到 10、α 设回 5%：只有 ≤ 1 或 ≥ 9 次正面才定罪，实际冤案率只有 2.15%；证据少时，规则只好很保守。',

    s3k: '第 3 步 · 功效',
    s3t: '如果硬币真偏了，这场审判有多大机会把它定罪？',
    s3e: '这一步要回答：拒绝域是按「公平硬币」画的，对一枚真偏的硬币，它能抓住多少？设真实正面概率为 q（只在模拟里知道）。上图是公平硬币的正面次数分布，下图是这枚偏硬币的分布，两图共用同一个拒绝域（橙色虚线）。偏硬币落进拒绝域的概率叫<strong>功效</strong>（被正确定罪的机会）；落在外面、被无罪放走，叫<strong>第二类错误</strong>，概率记作 β，功效 = 1 − β。α 由我们设定，β 却取决于硬币偏多少（q）和证据多少（n）。',
    c3a: 'H₀：公平硬币的正面次数', c3b: '真相：正面概率 q = {q} 的硬币',
    s3lgI: '公平硬币被定罪（第一类错误）', s3lgP: '偏硬币被定罪（功效）', s3lgII: '偏硬币被放走（第二类错误 β）',
    q3: '真实正面概率 q', n3: '抛的次数 n', a3: '显著性水平 α',
    s3readout: '抛 {n} 次、α = {a}：公平硬币被冤枉的概率 {s}；q = {q} 的硬币被定罪的概率（功效）{pw}，被放走的概率 β = {b}。',
    s3hint: '观察顺序：先把 q 拖回 0.50：下图和上图一模一样，功效就等于冤案率，审判分不出好坏。再把 q 拖到 0.65，然后把 n 从 50 拖到 150：下图整体右移、变窄，绿色越来越多。最后把 α 拨到 1%：拒绝域向两端收缩，粉色变少，同时绿色也变少：少冤枉好人，就会多放走坏人。',

    s4k: '第 4 步 · 要抛几次',
    s4t: '想有 80% 的把握抓住正面概率 0.7 的硬币，至少要抛多少次？',
    s4e: '这一步要回答：实验之前，怎样决定收集多少证据？把上一步的功效当成抛的次数 n 的函数画出来，叫<strong>功效曲线</strong>（横轴 n，纵轴功效，固定 q 和 α）。常用的目标是功效 ≥ 80%（偏硬币至少八成会被抓住）。曲线第一次达到 80% 的 n 就是所需的<strong>样本量</strong>。因为正面次数是整数，拒绝域随 n 跳着变，曲线是锯齿形的，不是光滑上升。灰色点线是常用的正态近似公式 n ≈ [(z<sub>1−α/2</sub>·0.5 + z<sub>0.8</sub>·√(q(1−q)))/(q − 0.5)]²，只作对照。',
    c4title: '功效随抛的次数变化（q = {q}，α = {a}）',
    s4lgC: '精确功效', s4lg80: '80% 目标线', s4lgN: '第一次达到 80% 的 n', s4lgApx: '正态近似公式给出的 n',
    q4: '真实正面概率 q', n4: '查看某个 n（白点）',
    s4readout: '抛 {n} 次时功效为 {pw}。{need}{dips}',
    s4need: '第一次达到 80% 是 n = {need}（正态近似公式给 {apx}）。',
    s4none: '在 n ≤ {max} 内达不到 80%（正态近似公式给 {apx}）。',
    s4dips: '锯齿：在它之后，n = {first} 等 {cnt} 个次数的功效又跌回 80% 以下。',
    s4nodips: '在它之后（到 300 次）功效不再跌回 80% 以下。',
    s4hint: '观察顺序：默认 q = 0.70、α = 5%：49 次第一次达到 80%，把白点拖到 50，功效反而是 78.2%。这就是锯齿：多抛一次，拒绝域可能要往外挪一格才能守住 α。再把 q 拖到 0.60：所需次数涨到约 200；偏得越少越难抓。点线落在绿点左边一点或几乎与它重合（近似公式往往略低估所需次数），可以用来粗估，但要以精确曲线为准。',

    s5k: '第 5 步 · 被定罪的硬币里有多少冤案',
    s5t: '一枚硬币被定罪了，它真的偏的可能有多大？',
    s5e: '这一步要回答：「p ≤ 0.05，被定罪」之后，这枚硬币真有问题的概率是多少？它不等于 1 − 0.05。设想一批 1000 枚硬币，其中占比 π 的硬币真偏（正面概率 q），其余公平；每枚都抛 n 次、按 α = 5% 审判。下图每个点是一枚硬币，按「真相 × 判决」分组上色。冤案在定罪中的占比取决于<strong>真偏硬币本来有多少</strong>（π），这是 p 值本身不包含的信息（<a class="xlink" href="../../../probability/inference/bayes-updating/#step1">→ 贝叶斯更新第 1 步：亮灯的卡片里，有多少真的带星标</a>）。π = 0 时，被定罪的全是冤案；同时测很多枚公平硬币（<strong>多重检验</strong>），几乎一定会冤枉几枚。',
    c5title: '1000 枚硬币：真相 × 判决（每点一枚）',
    lg5_fairAcq: '公平、放走：{c}', lg5_fairConv: '公平、被定罪（冤案）：{c}', lg5_biasConv: '偏、被定罪：{c}', lg5_biasAcq: '偏、被放走：{c}',
    pi5: '真偏硬币的占比 π', q5: '偏硬币的正面概率 q', n5: '每枚抛的次数 n',
    new5: '换一批硬币',
    s5readout: '这一批被定罪 {conv} 枚，其中 {wrong} 枚其实公平，冤案占 {share}。理论值：冤案占定罪的 {fdr}（公平硬币被冤的概率 {s}，偏硬币被抓的概率 {pw}）。{fair} 枚公平硬币里至少冤枉一枚的概率是 {fw}。',
    s5hint: '观察顺序：默认 π = 10%、q = 0.70、n = 50：冤案约占定罪的 27%，远高于 5%。把 π 拖到 0：粉色点照样出现（约 3% 的硬币），绿色消失，定罪的全是冤案。把 π 拖到 50%：冤案降到约 4%。最后把 π 设回 10%、n 拉到 200：紫色几乎消失，冤案占比却仍约 26%。功效到顶以后，冤案占比主要由 π 和实际冤案率决定，多抛也压不下去。',

    s6k: '第 6 步 · 收束',
    s6t: '一场审判能保证什么，不能保证什么',
    s6fin: '假设检验先推定 H₀（硬币公平），再用 <strong>p 值</strong>衡量证据对它有多不利：假定公平时，看到至少这么偏的结果的概率。事先定好的 <strong>α</strong> 控制的是冤案率：公平硬币被定罪的概率不超过 α。它不控制放走坏硬币的概率 β；β 取决于硬币偏多少和抛多少次，要靠<strong>样本量</strong>规划去压低。最后，「被定罪」不等于「真有问题」：冤案在定罪中的占比还取决于真有问题的硬币本来有多少，同时检验很多枚时冤案几乎必然出现。',
    formula: 'p = P(结果至少这么偏 | H₀)\n拒绝域：P(落入 | H₀) ≤ α\n功效 = P(落入 | 真相) = 1 − β',
    boundary: '适用范围：本页只讲公平硬币的精确双侧二项检验，「至少这么偏」按离 n/2 的距离计；各次抛掷独立；模拟用固定种子的伪随机数；「一批硬币」和其中偏硬币的比例是教学设定。p 值与贝叶斯后验回答的是不同的问题；页面不涉及任何具体研究的结论。',
    linksTitle: '接着去哪',
    lk1: '→ 统计推断第 2 步：p 值衡量「在原假设下有多意外」',
    lk2: '→ 贝叶斯更新第 1 步：亮灯的卡片里，有多少真的带星标',
    lk3: '→ 二项与正态第 0 步：正面次数的概率从哪来',
    lk4: '→ 贝叶斯更新第 4 步：换个问法，这枚硬币偏多少',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《假设检验与 p 值 · 法庭模型判硬币冤不冤》的平行版本。'
  },
  en: {
    pageTitle: 'Hypothesis Testing & p-Values · A Courtroom for a Coin',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Hypothesis Testing & p-Values · A Courtroom for a Coin →',
    navLabel: 'Hypothesis testing steps',
    tagline: 'Someone claims this coin has been tampered with. All we can get is evidence: toss it n times and count the heads. What we want to know is whether it is fair. A hypothesis test works like a trial: presume innocence, then ask how unusual the evidence must be before you convict. In six steps you will compute a p-value, set a standard for conviction, measure how many good coins get convicted and how many bad ones walk free, and finally see how far “convicted” can be from “actually guilty”.',
    nav0: '0 p-value', nav1: '1 p-values vary', nav2: '2 Standard α', nav3: '3 Power', nav4: '4 How many tosses', nav5: '5 Wrongful share', nav6: '6 Wrap-up',

    s0k: 'Step 0 · How unusual is the evidence?',
    s0t: '15 heads in 20 tosses: is that enough to call the coin unfair?',
    s0e: 'This step answers: given a set of tosses, how do you measure how strange it would be for a fair coin? Start from a <strong>null hypothesis</strong> H₀: the coin is fair, heads with probability 0.5 (the courtroom’s presumption of innocence). Under H₀ the chance of j heads in n tosses is C(n, j)/2ⁿ (the <strong>binomial distribution</strong>, the bar heights; <a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ Binomial and normal, step 0: where these probabilities come from</a>). Then ask: if the coin really were fair, how likely is a result <strong>at least as far from half</strong> as this one (too many heads or too few both count, which makes the test <strong>two-sided</strong>)? That probability is the <strong>p-value</strong>. The smaller p is, the worse the evidence looks for “fair”. Note that p is the probability of evidence like this assuming the coin is fair, not the probability that the coin is fair; step 5 shows how far apart those can be.',
    c0title: 'A fair coin tossed {n} times: probability of each head count',
    s0lgX: 'results at least this extreme (they add up to p)', s0lgC: 'less extreme results', s0lgK: 'this head count k',
    n0: 'Number of tosses n', k0: 'Number of heads k',
    s0readout: '{k} heads in {n} tosses, {dev} away from half ({half}). Results at least this extreme are {set}; if the coin is fair they have total probability p = {p}: {verdict}.',
    s0set: '≤ {lo} or ≥ {hi} heads', s0all: 'every result (this one is exactly half)',
    s0rare: 'p ≤ 0.05, rare by the usual standard', s0notRare: 'p > 0.05, a fair coin produces this kind of result without much trouble',
    s0hint: 'What to try: keep n = 20 and drag k from 10 to 15. The pink shrinks from everything to the two ends and p falls from 1 to 0.041. Then compare two sets of evidence with the same 60% heads: n = 20, k = 12 gives p ≈ 0.50; n = 100, k = 60 gives p ≈ 0.057. Same proportion, but the more tosses, the harder the deviation is to put down to luck.',

    s1k: 'Step 1 · The p-value is random too',
    s1t: 'If the coin really is fair, how large is the p-value usually?',
    s1e: 'This step answers: toss the same coin again and the p-value changes; where does it tend to land for a fair coin, and for a biased one? The computer repeats “toss 50 times, compute one p-value” many times and drops each p-value into a bin of width 0.05. The slider sets the coin’s <strong>true heads probability q</strong> in the simulation: the simulator knows the truth, you in real life do not. Cyan bars are simulated shares; orange dashes are the exact shares. Pink is the first bin, p ≤ 0.05.',
    c1title: 'Share of p-values in each bin ({n} tosses per run)',
    s1lgLow: 'share with p ≤ 0.05', s1lgSim: 'simulated share', s1lgEx: 'exact share',
    q1: 'True heads probability q in the simulation',
    run100: 'Run 100 more', run1000: 'Run 1000 more', reset1: 'Restart with new random numbers',
    s1h0: 'Fair coin (q = 0.5, H₀ true)', s1h1: 'Biased coin (q = {q}, H₀ false)',
    s1empty: '{truth}. Nothing run yet; the exact share with p ≤ 0.05 is {ex}. Press “Run 100 more”.',
    s1readout: '{truth}: {n}/{N} runs, {low} of them with p ≤ 0.05, a share of {share} (exact value {ex}).',
    s1hint: 'What to try: with q = 0.5 press “Run 1000 more” a few times. The bars spread from 0 to 1 with gaps, because with 50 tosses the p-value can take only twenty-odd values; the pink bin settles near 3.3%, below 5%. Now set q to 0.65 (this starts over): p-values crowd into the first bin, about 51% of them. Small p-values are what biased coins tend to produce, but a fair coin also produces them about 3.3% of the time.',

    s2k: 'Step 2 · The standard for conviction',
    s2t: 'How small must p be to convict, and should that line be drawn before or after seeing the evidence?',
    s2e: 'This step answers: how do you set a rule for conviction that is public in advance and keeps wrongful convictions under control? The <strong>significance level α</strong> is the wrongful-conviction rate we are willing to accept: an upper limit on the chance of convicting a fair coin. <strong>Before</strong> seeing data, start from the most extreme results and work inwards for as long as the results enclosed have total probability under H₀ of at most α. The set you end with is the <strong>rejection region</strong>: land in it and H₀ is rejected (conviction); otherwise it is not rejected (not enough evidence, which is not proof of innocence). Convicting a fair coin is a <strong>type I error</strong>, and its actual probability is the region’s total probability under H₀. This is the same rule as “reject when p ≤ α”. Head counts are whole numbers, so the actual probability is usually below α.',
    c2title: 'A fair coin tossed {n} times: the rejection region (pink)',
    s2lgR: 'rejection region: convict if the result lands here', s2lgA: 'do not reject', s2lgB: 'edge of the rejection region',
    a2: 'Significance level α', n2: 'Number of tosses n',
    s2readout: 'α = {a}, {n} tosses: {reg}. The actual chance of convicting a fair coin (type I error) is {s}, {gap} below α.',
    s2region: 'convict at ≤ {lo} or ≥ {hi} heads', s2never: 'never convict, whatever happens (too few tosses: even the most extreme results are not rare enough)',
    s2hint: 'What to try: at n = 50 drag α slowly from 1% to 20%. The rejection region grows inwards one bar at a time, and the actual wrongful-conviction rate rises in steps without ever exceeding α (for α = 5% and 6% it is 3.28%; only at 7% does it jump to 6.49%). Then set n = 10 with α back at 5%: only ≤ 1 or ≥ 9 heads convicts, and the actual rate is just 2.15%; with little evidence the rule has to be very cautious.',

    s3k: 'Step 3 · Power',
    s3t: 'If the coin really is biased, how likely is this trial to convict it?',
    s3e: 'This step answers: the rejection region was drawn for a fair coin; how much of a truly biased coin does it catch? Let the true heads probability be q (known only in the simulation). The top chart is the head-count distribution of a fair coin, the bottom chart that of the biased coin, and both share the same rejection region (orange dashes). The chance that the biased coin lands in the region is the test’s <strong>power</strong> (its chance of a correct conviction); landing outside and walking free is a <strong>type II error</strong>, with probability β, so power = 1 − β. We choose α, but β depends on how biased the coin is (q) and how much evidence we collect (n).',
    c3a: 'H₀: head counts of a fair coin', c3b: 'The truth: a coin with heads probability q = {q}',
    s3lgI: 'fair coin convicted (type I error)', s3lgP: 'biased coin convicted (power)', s3lgII: 'biased coin set free (type II error β)',
    q3: 'True heads probability q', n3: 'Number of tosses n', a3: 'Significance level α',
    s3readout: '{n} tosses, α = {a}: a fair coin is convicted with probability {s}; a coin with q = {q} is convicted (power) with probability {pw} and set free with probability β = {b}.',
    s3hint: 'What to try: first drag q back to 0.50. The bottom chart is identical to the top one and the power equals the wrongful-conviction rate: the trial cannot tell good from bad. Then set q = 0.65 and drag n from 50 to 150: the bottom chart moves right and narrows, and more of it turns green. Finally switch α to 1%: the region shrinks towards the ends, less pink, but also less green. Convict fewer innocent coins and you let more guilty ones go.',

    s4k: 'Step 4 · How many tosses?',
    s4t: 'To catch a coin with heads probability 0.7 with 80% certainty, how many tosses do you need?',
    s4e: 'This step answers: before the experiment, how do you decide how much evidence to collect? Plot the power from the last step as a function of the number of tosses n, with q and α fixed: that is the <strong>power curve</strong> (n across, power up). A common target is power ≥ 80% (a biased coin is caught at least eight times in ten). The first n where the curve reaches 80% is the required <strong>sample size</strong>. Because head counts are whole numbers, the rejection region changes in jumps as n grows, so the curve is a sawtooth rather than a smooth climb. The grey dotted line is the usual normal-approximation formula n ≈ [(z<sub>1−α/2</sub>·0.5 + z<sub>0.8</sub>·√(q(1−q)))/(q − 0.5)]², shown for comparison only.',
    c4title: 'Power against number of tosses (q = {q}, α = {a})',
    s4lgC: 'exact power', s4lg80: '80% target', s4lgN: 'first n reaching 80%', s4lgApx: 'n from the normal-approximation formula',
    q4: 'True heads probability q', n4: 'Inspect one n (white dot)',
    s4readout: 'With {n} tosses the power is {pw}. {need}{dips}',
    s4need: 'It first reaches 80% at n = {need} (the normal-approximation formula gives {apx}). ',
    s4none: 'It does not reach 80% for n ≤ {max} (the normal-approximation formula gives {apx}). ',
    s4dips: 'Sawtooth: after that, {cnt} values of n, starting with n = {first}, drop back below 80%.',
    s4nodips: 'After that (up to 300 tosses) the power never drops back below 80%.',
    s4hint: 'What to try: with the defaults q = 0.70, α = 5%, 49 tosses first reach 80%; drag the white dot to 50 and the power is only 78.2%. That is the sawtooth: one more toss can force the region one bar outwards to keep the error rate within α. Then drag q to 0.60: the required number climbs to about 200, because a smaller bias is harder to catch. The dotted line sits a little left of the green dot or almost on it (the approximation tends to underestimate the tosses needed): good enough for a rough plan, but the exact curve is what counts.',

    s5k: 'Step 5 · How many convicted coins are innocent?',
    s5t: 'A coin has been convicted. How likely is it to be truly biased?',
    s5e: 'This step answers: after “p ≤ 0.05, convicted”, what is the chance that this coin really is biased? It is not 1 − 0.05. Picture a batch of 1000 coins, a share π of them truly biased (heads probability q) and the rest fair; each is tossed n times and tried at α = 5%. Each dot below is one coin, grouped and coloured by truth × verdict. The share of wrongful convictions among all convictions depends on <strong>how many biased coins there were to begin with</strong> (π), information the p-value itself does not contain (<a class="xlink" href="../../../probability/inference/bayes-updating/#step1">→ Bayesian updating, step 1: of the cards that light up, how many really carry a star</a>). With π = 0 every conviction is wrongful, and if you test many fair coins at once (<strong>multiple testing</strong>) you will almost certainly convict a few.',
    c5title: '1000 coins: truth × verdict (one dot per coin)',
    lg5_fairAcq: 'fair, set free: {c}', lg5_fairConv: 'fair, convicted (wrongful): {c}', lg5_biasConv: 'biased, convicted: {c}', lg5_biasAcq: 'biased, set free: {c}',
    pi5: 'Share of truly biased coins π', q5: 'Heads probability q of a biased coin', n5: 'Tosses per coin n',
    new5: 'New batch of coins',
    s5readout: '{conv} coins in this batch were convicted, {wrong} of them actually fair: a wrongful share of {share}. In theory the wrongful share of convictions is {fdr} (a fair coin is convicted with probability {s}, a biased one caught with probability {pw}). The chance of convicting at least one of the {fair} fair coins is {fw}.',
    s5hint: 'What to try: with the defaults π = 10%, q = 0.70, n = 50, about 27% of convictions are wrongful, far more than 5%. Drag π to 0: pink dots still appear (about 3% of the coins), green vanishes, and every conviction is wrongful. Drag π to 50%: the wrongful share falls to about 4%. Finally set π back to 10% and raise n to 200: violet all but disappears, yet the wrongful share is still about 26%. Once power is near its ceiling, the wrongful share is set mainly by π and the actual false-conviction rate, and more tosses cannot push it down.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What a trial can guarantee, and what it cannot',
    s6fin: 'A hypothesis test presumes H₀ (the coin is fair) and uses the <strong>p-value</strong> to measure how badly the evidence fits it: the probability, assuming fairness, of a result at least this extreme. A level <strong>α</strong> fixed in advance controls wrongful convictions: a fair coin is convicted with probability at most α. It does not control β, the chance of letting a biased coin go; β depends on how biased the coin is and how many tosses you make, and you push it down by planning the <strong>sample size</strong>. Finally, “convicted” is not “guilty”: the share of wrongful convictions also depends on how many guilty coins there were to begin with, and when you test many coins, wrongful convictions are all but certain.',
    formula: 'p = P(a result at least this extreme | H₀)\nrejection region: P(landing in it | H₀) ≤ α\npower = P(landing in it | the truth) = 1 − β',
    boundary: 'Scope: this page covers only the exact two-sided binomial test for a fair coin, with “at least as extreme” measured by distance from n/2; tosses are independent; simulations use a seeded pseudo-random generator; the batch of coins and its share of biased ones are teaching assumptions. p-values and Bayesian posteriors answer different questions, and nothing here describes the findings of any particular study.',
    linksTitle: 'Where to go next',
    lk1: '→ Statistical inference, step 2: a p-value measures surprise under the null',
    lk2: '→ Bayesian updating, step 1: of the cards that light up, how many really carry a star',
    lk3: '→ Binomial and normal, step 0: where the head-count probabilities come from',
    lk4: '→ Bayesian updating, step 4: ask instead how biased this coin is',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Hypothesis Testing & p-Values · A Courtroom for a Coin”.'
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
  if (typeof window.refreshHypothesis === 'function') window.refreshHypothesis();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.HT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
