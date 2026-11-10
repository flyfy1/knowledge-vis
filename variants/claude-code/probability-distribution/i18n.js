'use strict';
// Probability distribution lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '概率分布 · 把随机性画成一排柱子',
    back: '← 知识索引',
    compare: '对照另一版本：概率分布 · 随机性也有形状 →',
    navLabel: '概率分布步骤导航',
    tagline: '掷两颗骰子，点数之和是随机的，但并不是「每个数都一样可能」：7 出现得最多，2 和 12 最少。把每个结果的概率排成一排柱子，就是这个随机量的「形状」。七步里你会从掷骰子出发，读懂分布列、期望（平衡点）、方差（散开程度）和线性变换的规律，再走到二项分布，看柱子怎样长成一条正态曲线。',
    nav0: '0 分布列', nav1: '1 期望', nav2: '2 方差', nav3: '3 aX + b', nav4: '4 二项分布', nav5: '5 正态近似', nav6: '6 收束',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《概率分布 · 随机性也有形状》的平行版本。',
    clearRecord: '清空记录',

    s0k: '第 0 步 · 随机变量与分布列',
    s0t: '两颗骰子的点数和，哪个数最常出现？',
    s0e: '这一步要回答：同时掷两颗骰子，点数之和 X 取 2 到 12 的每个值，各有多大可能？像 X 这样「每次试验得到一个数，但事先不知道是哪个」的量叫<strong>随机变量</strong>。两颗骰子一共有 6 × 6 = 36 种等可能的结果；和为 7 的有 6 种（1+6、2+5、…、6+1），和为 2 的只有 1 种（1+1）。把每个取值和它的概率列成表，就是<strong>分布列</strong>（见下表），所有概率加起来一定等于 1；画成柱状图，柱高就是概率。按按钮真的掷：青色柱是到目前为止的<strong>频率</strong>（出现次数 ÷ 投掷次数），白色横线是理论概率（<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ 频率与概率页第 2 步：投得越多，频率越稳</a>）。',
    thX: '点数和 x', thP: 'P(X = x)',
    rollOnce: '掷 1 次', roll100: '再掷 100 次',
    c0aria: '最近一次的两颗骰子，以及各点数和的频率与理论概率',
    c0dice: '最近一次：{a} + {b} = {s}', c0none: '还没有掷',
    c0bars: '{n} 次投掷中各点数和的频率（白线 = 理论概率）',
    lgFreq: '频率（实验）', lgProb: '理论概率',
    s0readout0: '还没有掷。理论上和为 7 的概率最大：6/36 ≈ {p7}；2 和 12 各只有 1/36 ≈ {p2}。',
    s0readout: '已掷 {n} 次：和为 7 出现 {n7} 次，频率 {f7}（理论 {p7}）。在所有点数和里，频率与理论概率最多相差 {gap} 个百分点。',
    s0hint: '观察顺序：先按几次「掷 1 次」，看最近一次的两颗骰子，以及柱子怎样一格一格长；再连按「再掷 100 次」，看青色柱越来越贴近白线，读数里的「最多相差」总体越来越小（中途偶尔回弹）。频率是实验结果，概率是理论值；投得越多，两者通常越接近。',

    s1k: '第 1 步 · 期望',
    s1t: '这排柱子的「中心」在哪里？',
    s1e: '这一步要回答：一个随机变量「平均」会取多大的值？把每根柱子想成挂在一根轻杆上的砝码：挂在位置 x，重量等于概率 P(X = x)。在哪一点把杆支起来刚好不倾斜，那一点就是<strong>期望</strong>（也叫均值），E(X) = Σ x · P(X = x)：每个取值乘以它的概率，再全部相加（<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ 期望页第 0 步：加权相加</a>）。支点放在 c 时，杆受到的净转动效果是 Σ (x − c) · P(X = x)，它恰好等于 E(X) − c：大于 0 往数大的一侧倾，小于 0 往数小的一侧倾，等于 0 才平衡。期望不一定是 X 能取到的值，也不一定是最可能的值；概率最大的取值叫<strong>众数</strong>（图中橙色柱）。',
    preDice2: '两颗骰子之和', preDie1: '一颗骰子', preCoins3: '抛 3 枚硬币的正面数', preParcels: '一天收到的快递件数（假想）',
    pivotLabel: '支点位置 c', findBalance: '直接移到平衡点',
    c1aria: '概率柱像砝码一样放在杆上，支点可移动，杆按净转动效果倾斜',
    c1title: '支点 c = {c}：{state}',
    stUp: '往数大的一侧倾', stDown: '往数小的一侧倾', stLevel: '平衡',
    lgWeight: '概率（砝码重量）', lgPivot: '支点', lgMode: '众数（概率最大的取值）',
    s1readout: '{name}：支点 c = {c}，Σ(x − c)·P = {tq}，{state}。期望 E(X) = {mean}，众数 = {mode}。{note}',
    noteUniform: '每个取值的概率都相同，没有单独的众数；期望在正中间。',
    noteNotAttainable: '期望 {mean} 不是 X 能取到的值：它是平衡点，不是某一次的结果。',
    noteSkew: '期望和众数不相等：分布不对称，数大一侧的长尾把平衡点拉了过去。',
    noteSym: '这个分布对称，期望恰好落在对称中心，也就是众数。',
    s1hint: '观察顺序：先选「两颗骰子之和」，把支点从 4 慢慢拖向 12：杆先往数大的一侧倾，到 7 处放平，再往另一侧倾，读数里的 Σ(x − c)·P 从正变成负。然后选「一天收到的快递件数」：橙色的众数柱在 1，杆却要到 1.74 才放平，数大一侧的长尾把平衡点拉了过去。也可以按「直接移到平衡点」核对。',
    quizPrompt: '想一想：一颗骰子的期望是 3.5。哪句话对？',
    quizA: '掷一次，最可能掷出 3.5', quizB: '掷很多次，点数的平均值会越来越接近 3.5', quizC: '掷两次，一定是一次 3、一次 4',
    check: '核对',
    correct: '对。3.5 根本掷不出来；它是这排柱子的平衡点，描述的是大量投掷后点数的平均值。',
    wrong: '再想想：骰子能掷出 3.5 吗？期望说的是某一次的结果，还是很多次的平均？',

    s2k: '第 2 步 · 方差',
    s2t: '两个分布中心一样，怎样说清谁更分散？',
    s2e: '这一步要回答：期望相同的两个分布，怎样用一个数说清它「散得多开」？这里的分布都取 1 到 9 的整数，左右对称，期望都是 5，只有散开程度在变。<strong>方差</strong> D(X) = Σ (x − E(X))² · P(X = x)：先量每个取值离中心多远，再平方（两侧都变成正数，离得远的分量更重），最后按概率加权平均。「对方差的贡献」图里，绿色柱就是每个取值贡献的 (x − 5)² · P(X = x)，它们加起来就是方差。方差的单位是 x 的单位的平方，所以再开方得到<strong>标准差</strong> σ = √D(X)，回到和 x 相同的单位；「概率 P(X = x)」图里青色带标出 E(X) ± σ。',
    spreadLabel: '分散程度（只改形状，不改中心）',
    c2aria: '概率柱与 E ± σ 区间，以及每个取值对方差的贡献',
    c2top: '概率 P(X = x)（青色带 = E(X) ± σ）', c2bot: '对方差的贡献 (x − 5)²·P(X = x)',
    lgProbBar: '概率', lgBand: 'E ± σ 区间', lgContrib: '对方差的贡献', lgGhost: '这次拖动之前的分布',
    s2readout: 'E(X) = {m}，D(X) = {v}，σ = {s}。贡献最大的是 x = {xmax}（离中心 {dist}，贡献 {cmax}）。X 落在 E ± σ 之内的概率 = {inside}。',
    s2hint: '观察顺序：只拖「分散程度」：中间的柱子变矮、两端的柱子变高，青色带变宽；「对方差的贡献」图里的绿色柱从集中在中间变成堆在两端，因为离中心 4 的 x = 1 和 9 即使概率不大，平方后贡献也很大。期望始终是 5，可见期望描述不了散开程度。虚线轮廓是这次拖动之前的分布，便于对比。',

    s3k: '第 3 步 · 线性变换',
    s3t: '每个结果都乘 a 再加 b，期望和方差怎么变？',
    s3e: '这一步要回答：已知 X 的分布，Y = aX + b 的期望和方差是多少？设想一个游戏：掷两颗骰子，点数和为 X，奖金 Y = aX + b 元（a 是每点给几元，b 是固定奖励；为负就是罚款）。X 的每个取值都按同一个规则搬到 y = ax + b，概率跟着搬过去，大小不变。于是：加 b 只是整体平移，形状和散开程度都不变；乘 a 把所有距离拉长 |a| 倍（a 为负时还会把分布翻个面）。所以 <strong>E(aX + b) = aE(X) + b</strong>，<strong>D(aX + b) = a²D(X)</strong>，标准差变为 |a| 倍。',
    aLabel: '每点奖金 a（元）', bLabel: '固定奖励 b（元）',
    c3aria: '两颗骰子之和 X 的分布，以及 Y = aX + b 的分布，共用一条数轴',
    c3top: 'X：两颗骰子之和', c3bot: '{f}（元）',
    lgX: 'X 的分布', lgY: 'Y 的分布',
    s3readout: 'E(X) = 7，D(X) = {vx}，σ(X) = {sx}。{f}：按 Y 的分布列直接算，E(Y) = {ey}，D(Y) = {vy}，σ(Y) = {sy}；按公式 aE(X) + b = {ey2}，a²D(X) = {vy2}，两者一致。',
    s3hint: '观察顺序：先只拖 b：青色柱整体平移，间距和形状都不变，D(Y) 也不变。再只拖 a：a = 2 时相邻柱子的间距变成 2，σ 翻倍、方差变成 4 倍；a = −1 时分布翻到负数一侧（把 b 调到 0 最清楚）；a = 0 时所有结果都变成 b，方差为 0。两张图共用同一条数轴，青色带的宽度可以直接比。',

    s4k: '第 4 步 · 二项分布',
    s4t: '罚球 n 次，命中次数的分布长什么样？',
    s4e: '这一步要回答：一件成功概率为 p 的事独立重复 n 次，成功次数 X 的分布是什么？例如一位球员每次罚球命中的概率是 p，各次罚球互不影响，一共罚 n 次。恰好命中 k 次的概率是 <strong>P(X = k) = C(n, k) · p^k · (1 − p)^(n − k)</strong>：C(n, k) 是「n 次里哪 k 次命中」的挑法数（<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ 排列组合页第 3 步：组合数 C(n, k)</a>），p^k · (1 − p)^(n − k) 是其中任意一种挑法的概率。这叫<strong>二项分布</strong>，记作 B(n, p)。用前两步的定义按柱子逐项算期望和方差，会得到两个很简洁的结果：E(X) = np，D(X) = np(1 − p)。',
    nLabel: '试验次数 n', pLabel: '每次成功的概率 p',
    c4aria: '二项分布 B(n, p) 的柱状图与 E ± σ 区间',
    c4title: 'B({n}, {p})：命中 k 次的概率（青色带 = E ± σ）',
    lgBinom: '二项分布的概率', lgTrail4: '这次拖动之前的分布',
    s4readout: 'B({n}, {p})：按柱子逐项算 E(X) = Σ k·P = {m1}，与 np = {m2} 一致；D(X) = {v1}，与 np(1 − p) = {v2} 一致；σ = {s}。最可能的命中次数是 {mode}。',
    s4hint: '观察顺序：先固定 n = 10，把 p 从 0.05 拖到 0.95：柱子从挤在 0 附近、向数大一侧拖尾，到中间变得对称，再挤到 n 附近。留意 p = 0.5 时青色带最宽：np(1 − p) 在 p = 0.5 时最大。再固定 p，把 n 调大：中心按 np 往后移，σ 按 √n 增长，比 n 慢。虚线轮廓是这次拖动之前的分布。',

    s5k: '第 5 步 · 正态近似',
    s5t: 'n 很大时，这排柱子为什么像一条钟形曲线？',
    s5e: '这一步要回答：试验次数很多时，能不能用一条光滑曲线近似二项分布，来算「至少 k 次」的概率？柱子宽 1、高等于概率，所以每根柱子的<strong>面积</strong>就是概率。n 较大时，这些柱子的轮廓接近<strong>正态分布</strong> N(μ, σ²) 的钟形曲线，取 μ = np、σ² = np(1 − p)。正态分布描述的是<strong>连续型随机变量</strong>（可以取一段区间里的任何值）：取某一个确切值的概率是 0，概率只由曲线下的面积给出，曲线的高度叫<strong>概率密度</strong>（<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ 二项到正态页第 3 步：钟形曲线</a>）。于是 P(X ≥ k) 既可以把橙色柱子的概率精确相加，也可以近似为曲线下从 k − 0.5 开始往后的面积。减 0.5 叫<strong>连续性修正</strong>：柱子 k 占据的是 k − 0.5 到 k + 0.5 这一段。',
    kLabel: '门槛 k：求 P(X ≥ k)',
    c5aria: '二项分布柱状图、同均值同方差的正态曲线，以及 X ≥ k 的部分',
    c5title: 'B({n}, {p}) 与 N({mu}, {v})：橙色 = X ≥ {k}',
    lgTail: 'X ≥ k 的部分', lgNormal: '正态曲线（同均值、同方差）',
    s5readout: 'P(X ≥ {k})：精确值（橙色柱相加）= {exact}；正态近似（曲线下 {kc} 往后的面积）= {approx}；相差 {diff} 个百分点。',
    s5hint: '观察顺序：保持 n = 100、p = 0.5，把门槛 k 从 50 拖到 70，看橙色部分缩小，两种算法几乎重合（k = 60 时为 2.84% 对 2.87%）。再把 n 拖到 10、p 拖到 0.1：柱子明显不对称，曲线跟不上，在 k = 2 附近误差超过 3 个百分点。经验上，np 和 n(1 − p) 都不太小时，正态近似才好用。',

    s6k: '第 6 步 · 收束',
    s6t: '描述一个随机量，需要哪几样东西？',
    s6fin: '回顾：随机变量的<strong>分布</strong>说明它能取哪些值、各有多大概率，概率加起来等于 1。<strong>期望</strong>是这排柱子的平衡点；<strong>方差</strong>是离平衡点的距离的平方按概率加权的平均，<strong>标准差</strong>把它开方回到原来的单位。Y = aX + b 只会平移、伸缩或翻转这排柱子；二项分布描述独立重复试验中的成功次数；n 很大时，它的轮廓接近正态曲线，概率改由曲线下的面积给出。期望不是「一次最可能得到的值」，而是大量重复之后平均值会接近的值。',
    formula: 'E(X) = Σ x·P(X = x)    D(X) = Σ (x − E(X))²·P(X = x)    σ = √D(X)\nE(aX + b) = aE(X) + b    D(aX + b) = a²D(X)\nX ~ B(n, p)：E(X) = np，D(X) = np(1 − p)',
    boundary: '适用范围：本页的分布都是离散的、取值有限；「快递件数」的概率是为演示偏斜而假设的，不是统计数据；掷骰子是伪随机模拟。二项分布要求各次试验相互独立、成功概率不变；正态近似在 np 和 n(1 − p) 都较大时才准确，页面上的误差读数只覆盖这里能调到的 n、p、k。',
    linksTitle: '接着去看',
    lk1: '期望 · 第 2 步：为什么期望是「多次的平均」 →',
    lk2: '二项到正态 · 第 3 步：钟形曲线从哪来 →',
    lk3: '中心极限定理 · 第 0 步：平均值自己长成钟形 →',
    lk4: '均值、中位数、众数 · 第 4 步：描述中心该选哪个 →'
  },
  en: {
    pageTitle: 'Probability Distributions · Drawing Randomness as a Row of Bars',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Probability Distributions · Randomness Has a Shape →',
    navLabel: 'Probability distribution steps',
    tagline: 'Roll two dice and the total is random, yet not every total is equally likely: 7 turns up most often, 2 and 12 least. Line up the probability of each outcome as a row of bars and you have the "shape" of that random quantity. Over seven steps you will start from dice and learn to read a distribution table, the expected value (a balance point), the variance (how spread out it is) and how linear changes act on them, then move on to the binomial distribution and watch its bars grow into a normal curve.',
    nav0: '0 Distribution', nav1: '1 Expectation', nav2: '2 Variance', nav3: '3 aX + b', nav4: '4 Binomial', nav5: '5 Normal approx.', nav6: '6 Wrap-up',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Probability Distributions · Randomness Has a Shape".',
    clearRecord: 'Clear the record',

    s0k: 'Step 0 · Random variables and distributions',
    s0t: 'Rolling two dice, which total comes up most often?',
    s0e: 'This step asks: when you roll two dice, how likely is each total X from 2 to 12? A quantity like X, which every trial turns into a number you cannot know in advance, is called a <strong>random variable</strong>. Two dice have 6 × 6 = 36 equally likely outcomes; 6 of them total 7 (1+6, 2+5, …, 6+1), but only 1 totals 2 (1+1). Listing every value next to its probability gives the <strong>probability distribution</strong> (the table below), and the probabilities always add up to 1; drawn as a bar chart, each bar\'s height is a probability. Press the buttons to really roll: the cyan bars are the <strong>relative frequencies</strong> so far (times seen ÷ rolls), and the white ticks are the theoretical probabilities (<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ Probability & Frequency, step 2: the more you roll, the steadier the frequencies</a>).',
    thX: 'total x', thP: 'P(X = x)',
    rollOnce: 'Roll once', roll100: 'Roll 100 more',
    c0aria: 'The latest pair of dice, and the frequency and theoretical probability of each total',
    c0dice: 'Latest roll: {a} + {b} = {s}', c0none: 'No rolls yet',
    c0bars: 'Frequency of each total over {n} rolls (white tick = probability)',
    lgFreq: 'frequency (experiment)', lgProb: 'theoretical probability',
    s0readout0: 'No rolls yet. In theory 7 is the likeliest total, 6/36 ≈ {p7}; 2 and 12 have only 1/36 ≈ {p2} each.',
    s0readout: '{n} rolls so far: a total of 7 appeared {n7} times, a frequency of {f7} (theory {p7}). Across all totals, frequency and probability differ by at most {gap} percentage points.',
    s0hint: 'What to try: press "Roll once" a few times and watch the latest dice and the bars growing one roll at a time. Then press "Roll 100 more" repeatedly: the cyan bars hug the white ticks ever more closely, and the "differ by at most" figure shrinks overall (with the occasional bounce). Frequency is an experimental result, probability a theoretical value; the more you roll, the closer they usually get.',

    s1k: 'Step 1 · Expected value',
    s1t: 'Where is the "centre" of this row of bars?',
    s1e: 'This step asks: what value does a random variable take "on average"? Think of each bar as a weight hung on a light rod: it hangs at position x and weighs P(X = x). The point where a support keeps the rod perfectly level is the <strong>expected value</strong> (or mean), E(X) = Σ x · P(X = x): multiply each value by its probability and add them all up (<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ Expected Value, step 0: a weighted sum</a>). With the pivot at c, the net turning effect on the rod is Σ (x − c) · P(X = x), which equals E(X) − c exactly: positive tips the rod towards larger values, negative towards smaller values, and zero balances it. The expected value need not be a value X can actually take, nor the most likely one; the value with the highest probability is called the <strong>mode</strong> (the orange bar).',
    preDice2: 'Sum of two dice', preDie1: 'One die', preCoins3: 'Heads in 3 coin tosses', preParcels: 'Parcels per day (made up)',
    pivotLabel: 'Pivot position c', findBalance: 'Jump to the balance point',
    c1aria: 'Probability bars hung like weights on a rod; the pivot moves and the rod tilts with the net turning effect',
    c1title: 'Pivot at c = {c}: {state}',
    stUp: 'tips towards larger values', stDown: 'tips towards smaller values', stLevel: 'balanced',
    lgWeight: 'probability (weight)', lgPivot: 'pivot', lgMode: 'mode (most likely value)',
    s1readout: '{name}: pivot c = {c}, Σ(x − c)·P = {tq}, so the rod {state}. Expected value E(X) = {mean}; mode = {mode}. {note}',
    noteUniform: 'Every value is equally likely, so there is no single mode; the expected value sits in the middle.',
    noteNotAttainable: 'The expected value {mean} is not a value X can take: it is a balance point, not the result of any single trial.',
    noteSkew: 'Expected value and mode differ: the distribution is lopsided, and the long tail towards larger values drags the balance point along.',
    noteSym: 'This distribution is symmetric, so the expected value sits at the centre of symmetry, which is also the mode.',
    s1hint: 'What to try: choose "Sum of two dice" and drag the pivot slowly from 4 towards 12. The rod first tips towards larger values, levels out at 7, then tips the other way, while Σ(x − c)·P in the readout goes from positive to negative. Then choose "Parcels per day": the orange mode bar is at 1, yet the rod only levels out at 1.74, because the long tail towards larger values drags the balance point along. "Jump to the balance point" lets you check.',
    quizPrompt: 'Think it through: the expected value of one die is 3.5. Which statement is true?',
    quizA: 'In one roll, 3.5 is the most likely result', quizB: 'Over many rolls, the average result gets closer and closer to 3.5', quizC: 'In two rolls you are sure to get one 3 and one 4',
    check: 'Check',
    correct: 'Right. You can never roll a 3.5; it is the balance point of the bars and describes the average of the results over a large number of rolls.',
    wrong: 'Think again: can a die ever show 3.5? Does the expected value describe a single roll, or the average of many?',

    s2k: 'Step 2 · Variance',
    s2t: 'Two distributions share a centre. How do you say which is more spread out?',
    s2e: 'This step asks: for two distributions with the same expected value, which single number says how widely they spread? Every distribution here lives on the whole numbers 1 to 9, is symmetric and has expected value 5; only the spread changes. The <strong>variance</strong> D(X) = Σ (x − E(X))² · P(X = x) measures how far each value is from the centre, squares that distance (so both sides count as positive and far values weigh more), then takes the probability-weighted average. In the "Contribution to variance" chart, the green bars are each value\'s contribution (x − 5)² · P(X = x), and together they add up to the variance. Variance is measured in squared units of x, so taking the square root gives the <strong>standard deviation</strong> σ = √D(X), back in the same units as x; in the "Probability P(X = x)" chart the cyan band marks E(X) ± σ.',
    spreadLabel: 'Spread (changes the shape, not the centre)',
    c2aria: 'Probability bars with the E ± σ band, and each value\'s contribution to the variance',
    c2top: 'Probability P(X = x) (cyan band = E(X) ± σ)', c2bot: 'Contribution to variance (x − 5)²·P(X = x)',
    lgProbBar: 'probability', lgBand: 'E ± σ band', lgContrib: 'contribution to variance', lgGhost: 'distribution before this drag',
    s2readout: 'E(X) = {m}, D(X) = {v}, σ = {s}. The largest contribution comes from x = {xmax} (distance {dist} from the centre, contribution {cmax}). The chance that X lands within E ± σ is {inside}.',
    s2hint: 'What to try: drag only the spread slider. The middle bars shrink, the outer bars grow and the cyan band widens; in the "Contribution to variance" chart the green bars move from the middle out to the ends, because x = 1 and 9 sit 4 away from the centre, and squaring makes their contribution large even when their probability is small. The expected value stays at 5 throughout, which shows that the expected value says nothing about spread. The dashed outline is the distribution before this drag, for comparison.',

    s3k: 'Step 3 · Linear transformations',
    s3t: 'Multiply every outcome by a and add b: what happens to the mean and variance?',
    s3e: 'This step asks: given the distribution of X, what are the expected value and variance of Y = aX + b? Picture a game: roll two dice, call the total X, and pay out Y = aX + b dollars (a dollars per point plus a fixed bonus b; negative means a penalty). Every value of X moves by the same rule to y = ax + b, and its probability travels with it unchanged. So adding b just shifts everything, leaving shape and spread alone, while multiplying by a stretches every distance by |a| (and flips the distribution over when a is negative). Hence <strong>E(aX + b) = aE(X) + b</strong>, <strong>D(aX + b) = a²D(X)</strong>, and the standard deviation scales by |a|.',
    aLabel: 'Dollars per point a', bLabel: 'Fixed bonus b (dollars)',
    c3aria: 'The distribution of the two-dice total X and of Y = aX + b, on a shared number line',
    c3top: 'X: sum of two dice', c3bot: '{f} (dollars)',
    lgX: 'distribution of X', lgY: 'distribution of Y',
    s3readout: 'E(X) = 7, D(X) = {vx}, σ(X) = {sx}. {f}: computed straight from the distribution of Y, E(Y) = {ey}, D(Y) = {vy}, σ(Y) = {sy}; from the formulas, aE(X) + b = {ey2} and a²D(X) = {vy2}, in agreement.',
    s3hint: 'What to try: drag only b first: the cyan bars slide as a block, spacing and shape unchanged, and D(Y) stays put. Then drag only a: at a = 2 neighbouring bars sit 2 apart, σ doubles and the variance quadruples; at a = −1 the distribution flips over to the negative side (clearest with b set to 0); at a = 0 every outcome becomes b and the variance is 0. Both charts share one number line, so the widths of the cyan bands can be compared directly.',

    s4k: 'Step 4 · The binomial distribution',
    s4t: 'Take n free throws: what does the number of hits look like?',
    s4e: 'This step asks: if something succeeds with probability p and is repeated independently n times, what is the distribution of the number of successes X? For example, a player makes each free throw with probability p, the throws do not affect one another, and she takes n of them. The chance of exactly k hits is <strong>P(X = k) = C(n, k) · p^k · (1 − p)^(n − k)</strong>: C(n, k) counts the ways to choose which k of the n throws go in (<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ Counting & Permutations, step 3: combinations C(n, k)</a>), and p^k · (1 − p)^(n − k) is the probability of any one such choice. This is the <strong>binomial distribution</strong>, written B(n, p). Working out the expected value and variance bar by bar, with the definitions from the previous two steps, gives two strikingly simple results: E(X) = np and D(X) = np(1 − p).',
    nLabel: 'Number of trials n', pLabel: 'Success probability p',
    c4aria: 'Bar chart of the binomial distribution B(n, p) with the E ± σ band',
    c4title: 'B({n}, {p}): chance of k hits (cyan band = E ± σ)',
    lgBinom: 'binomial probability', lgTrail4: 'distribution before this drag',
    s4readout: 'B({n}, {p}): adding up the bars gives E(X) = Σ k·P = {m1}, matching np = {m2}; D(X) = {v1}, matching np(1 − p) = {v2}; σ = {s}. The most likely number of hits is {mode}.',
    s4hint: 'What to try: hold n = 10 and drag p from 0.05 to 0.95. The bars start bunched near 0 with a tail towards larger values, become symmetric in the middle, then bunch up near n. Notice that the cyan band is widest at p = 0.5: np(1 − p) is largest there. Then hold p and raise n: the centre moves out as np, while σ grows as √n, more slowly than n. The dashed outline is the distribution before this drag.',

    s5k: 'Step 5 · The normal approximation',
    s5t: 'When n is large, why does the row of bars look like a bell curve?',
    s5e: 'This step asks: with many trials, can a smooth curve stand in for the binomial distribution when computing the chance of "at least k"? Each bar is 1 wide and as tall as its probability, so each bar\'s <strong>area</strong> is a probability. For larger n, the outline of the bars approaches the bell curve of a <strong>normal distribution</strong> N(μ, σ²) with μ = np and σ² = np(1 − p). A normal distribution describes a <strong>continuous random variable</strong> (one that can take any value in an interval): the chance of hitting any one exact value is 0, probabilities come only from areas under the curve, and the height of the curve is called the <strong>probability density</strong> (<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ Binomial to Normal, step 3: the bell curve</a>). So P(X ≥ k) can be found exactly by adding up the orange bars, or approximately as the area under the curve from k − 0.5 onwards. Subtracting 0.5 is the <strong>continuity correction</strong>: bar k covers the stretch from k − 0.5 to k + 0.5.',
    kLabel: 'Threshold k: find P(X ≥ k)',
    c5aria: 'Binomial bar chart, the normal curve with the same mean and variance, and the part where X ≥ k',
    c5title: 'B({n}, {p}) and N({mu}, {v}): orange = X ≥ {k}',
    lgTail: 'part where X ≥ k', lgNormal: 'normal curve (same mean and variance)',
    s5readout: 'P(X ≥ {k}): exact (adding the orange bars) = {exact}; normal approximation (area under the curve beyond {kc}) = {approx}; a difference of {diff} percentage points.',
    s5hint: 'What to try: keep n = 100 and p = 0.5, and drag the threshold k from 50 to 70. The orange part shrinks and the two methods almost coincide (2.84% versus 2.87% at k = 60). Then drag n down to 10 and p down to 0.1: the bars are clearly lopsided, the curve cannot follow them, and near k = 2 the error exceeds 3 percentage points. As a rule of thumb, the normal approximation works well only when neither np nor n(1 − p) is small.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What does it take to describe a random quantity?',
    s6fin: 'Recap: the <strong>distribution</strong> of a random variable says which values it can take and how likely each is, with the probabilities adding up to 1. The <strong>expected value</strong> is the balance point of the bars; the <strong>variance</strong> is the probability-weighted average of the squared distance from that balance point, and the <strong>standard deviation</strong> takes its square root to return to the original units. Y = aX + b only shifts, stretches or flips the bars; the binomial distribution describes the number of successes in independent repeated trials; and for large n its outline approaches a normal curve, where probabilities come from areas under the curve. The expected value is not "the most likely result of one trial" but the value the average approaches over many repetitions.',
    formula: 'E(X) = Σ x·P(X = x)    D(X) = Σ (x − E(X))²·P(X = x)    σ = √D(X)\nE(aX + b) = aE(X) + b    D(aX + b) = a²D(X)\nX ~ B(n, p): E(X) = np, D(X) = np(1 − p)',
    boundary: 'Scope: every distribution on this page is discrete with finitely many values; the "parcels" probabilities are made up to show a lopsided shape and are not survey data; the dice rolls are a pseudo-random simulation. The binomial distribution requires independent trials with an unchanging success probability; the normal approximation is accurate only when np and n(1 − p) are both reasonably large, and the error readouts on this page cover only the n, p and k you can set here.',
    linksTitle: 'Where to go next',
    lk1: 'Expected Value · step 2: why the expected value is the long-run average →',
    lk2: 'Binomial to Normal · step 3: where the bell curve comes from →',
    lk3: 'Central Limit Theorem · step 0: averages grow into a bell on their own →',
    lk4: 'Mean, Median, Mode · step 4: which measure of centre to choose →'
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
  if (typeof window.refreshDist === 'function') window.refreshDist();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.DIST_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
