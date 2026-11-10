'use strict';
// Binomial-to-normal lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '二项分布到正态 · 数路径，数出一口钟',
    back: '← 知识索引',
    compare: '对照另一版本：二项分布到正态 · 钉板上长出的钟形 →',
    navLabel: '二项分布到正态步骤导航',
    tagline: '一颗小球从钉板顶上落下，每碰一颗钉子就向左或向右，最后落进底下的某一格。它落在哪一格的可能性多大？这一页先数清到每一格有多少条路，得到二项分布；再看柱状图的中心和宽度由什么决定；最后让一条钟形曲线（正态分布）去贴这些柱子，量出它贴得多准、什么时候贴不准，以及用它算概率时为什么要挪半格。',
    nav0: '0 数路径', nav1: '1 落球', nav2: '2 中心与宽度', nav3: '3 钟形曲线', nav4: '4 标准化', nav5: '5 连续性修正', nav6: '6 收束',

    s0k: '第 0 步 · 数路径',
    s0t: '落进第 k 格，一共有多少条路？',
    s0e: '这一步要回答：钉板有 n 排钉子，小球每碰一颗钉子就向左或向右走一步，最后落进底下的某一格；把格子按「一路上向右了几次」编号为 k = 0, 1, …, n。到第 k 格有多少条不同的路？图中每个方框是一个位置（最底一排就是格子），框里的数 = 从顶上走到这里的路数。到一个位置只能从它左上或右上的位置下来，所以<strong>框里的数 = 左上 + 右上</strong>，这就是<strong>杨辉三角</strong>。最底一排第 k 个数是组合数 <strong>C(n, k)</strong>：从 n 次选择里挑出哪 k 次向右（<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ 排列与组合页第 3 步：不计顺序的选法 C(n, k)</a>）。如果每次向左、向右的机会相等（各 1/2），那么全部 2ⁿ 条路每条的概率都是 (1/2)ⁿ，于是 P(落在第 k 格) = C(n, k) ÷ 2ⁿ。',
    s0lgReach: '能通到第 k 格的位置与路段', s0lgOff: '到不了第 k 格的位置', s0lgPath: '当前这条路（淡色：已看过的路）',
    rowsSlider: '钉子排数 n', binSlider: '目标格 k（向右的次数）',
    nextPath: '下一条路', allPaths: '逐条走完所有路',
    c0title: '钉板：框里的数 = 从顶上到这里的路数',
    c0axis: '格子编号 k = 一路上向右的次数',
    pathL: '左', pathR: '右',
    s0readout: '到第 {k} 格的路有 C({n}, {k}) = {c} 条（底排第 {k} 个数）；全部的路共 {tot} 条（2 的 {n} 次方）。左右各占 1/2 时每条路的概率相同，所以 P(落在第 {k} 格) = {c} ÷ {tot} ≈ {pr}。当前是第 {i} 条：{path}；已看过 {seen} 条。',
    s0hint: '观察顺序：先保持 n = 6，拖「目标格 k」：橙色框是能通到第 k 格的所有位置，底排橙框里的数就是路数；k 在中间时路最多，在两端时只有 1 条。再按「逐条走完所有路」，青色的路一条条画出、走过的留成淡色，数一数，和框里的数一样。最后拖 n，检查每一排的数都等于上一排相邻两个数之和。',

    s1k: '第 1 步 · 落球',
    s1t: '真的放很多颗球，落点会按这个比例分布吗？',
    s1e: '这一步要回答：上一步的比例是数出来的；真放很多颗球，各格球数的比例会接近它吗？这里的球是电脑模拟的：用固定种子的伪随机数决定每次向左还是向右。再推广一步：如果每次<strong>向右的概率是 p</strong>（不一定是 1/2），一条恰好向右 k 次的路，概率是 p^k·(1−p)^(n−k)；这样的路有 C(n, k) 条，所以 <strong>P(X = k) = C(n, k)·p^k·(1−p)^(n−k)</strong>。这就是<strong>二项分布</strong>：做 n 次相互独立的「是/否」试验，每次「是」的概率都是 p（这种试验叫<strong>伯努利试验</strong>），X 是「是」的次数。下方青色柱是实测比例（某格球数 ÷ 总球数），橙色轮廓是这个公式。',
    s1lgObs: '实测比例（某格球数 ÷ 总球数）', s1lgExact: '公式 C(n,k)·p^k·(1−p)^(n−k)', s1lgBall: '正在下落的球',
    pSlider: '每次向右（成功）的概率 p',
    drop1: '放 1 颗（看它的路）', drop100: '放 100 颗', drop1000: '放 1000 颗', clearBoard: '清空',
    c1board: '钉板：{n} 排，每次向右的概率 p = {p}',
    c1hist: '各格的比例',
    c1axis: '格子 k = 向右的次数',
    s1none: '还没放球（n = {n}，p = {p}）。先按「放 1 颗」看一条路，再按「放 100 颗」。',
    s1readout: '已放 {N} 颗。实测比例与公式差得最多的是第 {k} 格：实测 {o}，公式 {e}，相差 {d}。',
    s1hint: '观察顺序：先按「放 1 颗」，看球一排排向左或向右落下；再连按「放 100 颗」「放 1000 颗」，看青色柱子一步步贴上橙色轮廓，读数里的「相差」随球数增多而变小。再把 p 拖到 0.20：轮廓整体移向左边，而且左右不对称。改 n 或 p 会清空格子（旧球属于旧钉板）。',

    s2k: '第 2 步 · 中心与宽度',
    s2t: '柱状图的中心在哪、有多宽，由什么决定？',
    s2e: '这一步要回答：不再放球，直接画公式算出的柱子（每根柱宽 1、高 = 概率，所以柱子的面积也等于概率），n 可以到 100。<strong>均值</strong>（期望）<strong>μ = np</strong>：平均成功几次，也是柱子的平衡点；<strong>方差 σ² = np(1−p)</strong>：结果离 μ 的距离平方的平均；<strong>标准差 σ = √(np(1−p))</strong>：离 μ 的典型距离，单位和 k 一样是「次」（<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ 概率分布页第 2 步：方差把「散不散」变成一个数</a>）。橙线是 μ，绿带是 μ − σ 到 μ + σ。横轴固定为 0～100，不同 n 的宽度可以直接比较。',
    s2lgBars: '每个 k 的概率 P(X = k)', s2lgMu: '均值 μ = np', s2lgBand: 'μ ± σ', s2lgOld: '之前的两个设置（轮廓）',
    trialsSlider: '试验次数 n',
    c2title: '二项分布 P(X = k)（横轴固定 0～100）',
    c2axis: '成功次数 k',
    s2readout: 'n = {n}，p = {p}：μ = np = {mu}，σ² = np(1−p) = {v}，σ = {s}。绿带 {lo}～{hi} 内的柱子概率合计 {w}%。',
    s2hint: '观察顺序：先固定 p = 0.50，把 n 从 20 拖到 80（×4）：中心从 10 移到 40，σ 从 2.236 变成 4.472，正好 ×2；松开滑杆后，灰色轮廓留下之前的形状供对比。再固定 n，把 p 从 0.50 拖到 0.10：中心左移、σ 变小、形状向右拖尾。绿带内的概率在 n ≥ 30 时总在 57.1%～78.0% 之间跳动（柱子一格一格，带边稍一挪就多进或少进一根），围绕着正态分布的 68.3%。',

    s3k: '第 3 步 · 钟形曲线',
    s3t: '一条钟形曲线能代替这些柱子吗？',
    s3e: '这一步要回答：能不能用一条光滑曲线代替一根根柱子？候选是<strong>正态分布</strong>的密度曲线（钟形曲线）：f(x) = e^(−(x−μ)²/(2σ²)) ÷ (σ√(2π))，μ、σ 取上一步的 np 和 √(np(1−p))。<strong>密度</strong>的意思是：曲线下某一段的面积 = 落在那一段的概率，曲线下总面积 = 1。柱子宽 1、高 = 概率，所以在同一个整数 k 处比较柱高和曲线高度是公平的。黄色竖线标出两者差得最多的 k（只比较整数 k）。课本上的<strong>经验规则</strong>是：np ≥ 10 且 n(1−p) ≥ 10 时，可以用正态分布近似二项分布。',
    s3lgBell: '正态曲线 N(np, np(1−p))', s3lgGap: '柱高与曲线差得最多处',
    c3title: 'n = {n}，p = {p}：柱子与钟形曲线',
    c3axis: '成功次数 k（只显示 μ ± 4σ 附近）',
    s3readout: 'μ = {mu}，σ = {s}。差得最多在 k = {k}：柱高 {bar}，曲线 {bell}，差 {gap}（是最高柱的 {rel}%）。',
    s3ruleYes: 'np = {a}、n(1−p) = {b}，都 ≥ 10，经验规则满足。',
    s3ruleNo: 'np = {a}、n(1−p) = {b}，至少一个小于 10，经验规则不满足。',
    s3skewR: '柱子向右拖尾（右边长、左边被 0 挡住），对称的钟形贴不上。',
    s3skewL: '柱子向左拖尾（左边长、右边被 n 挡住），对称的钟形贴不上。',
    s3hint: '观察顺序：先保持 p = 0.20，把 n 从 10 拖到 100：一开始柱子偏向一侧，钟形的左端伸到 0 以下，黄线较长；n 到 50 时经验规则刚好满足，黄线已经很短。再把 p 拖回 0.50：同样的 n 下柱子左右对称，更早就贴得上。',

    s4k: '第 4 步 · 标准化',
    s4t: 'n 变大时，柱子为什么越来越像同一口钟？',
    s4e: '这一步要回答：上一步不同 n 画出的钟，位置和大小都不一样，没法放在一起比。办法是<strong>标准化</strong>：横轴换成 z = (k − μ)/σ，表示离均值几个标准差；纵轴把概率乘以 σ（柱宽变成 1/σ，乘 σ 后面积不变）。这样所有 n 都对准同一条<strong>标准正态曲线</strong> φ(z) = e^(−z²/2) ÷ √(2π)，顶高约 0.399。「标准化后的柱子」图里，灰色轮廓是你看过的 n。「最大差距随 n」图用对数坐标画出标准化后的最大差距（= σ × 上一步那种最大差距）：白点连线是当前 p，灰色虚线是 p = 0.5 作参照。读数里的<strong>偏度指标</strong> (1−2p)/σ 衡量左右不对称：0 表示对称，绝对值越大越歪，它随 n 按 1/√n 变小。',
    c4a: '标准化后的柱子：σ·P(X = k) 对 z', c4b: '最大差距随 n（对数坐标）',
    s4lgBars: '标准化后的柱子', s4lgBell: '标准正态曲线 φ(z)', s4lgOld: '看过的 n（轮廓）', s4lgCurve: '当前 p 的最大差距', s4lgRef: 'p = 0.5 作参照',
    grow4: '从 n = 4 长到 400',
    c4axis: 'z = (k − μ)/σ', c4baxis: '试验次数 n',
    s4readout: 'n = {n}，p = {p}，σ = {s}：标准化后的最大差距 {g}（钟顶高 0.399 的 {rel}%），偏度指标 (1−2p)/σ = {sk}。',
    s4hint: '观察顺序：先保持 p = 0.30，按「从 n = 4 长到 400」：柱子一档档收紧到粉色曲线上，灰色轮廓留下每一档；「最大差距随 n」图上的点一路下降。再比较下降的快慢：最后两档（n 从 64 到 256、从 100 到 400，都是 ×4）里，p = 0.5 的差距缩成约 1/4（大约按 1/n），p = 0.1～0.4 或 0.6～0.9 的只缩成约 1/2（大约按 1/√n），因为歪斜要慢慢才磨平；p = 0.45、0.55 介于两者之间。满足经验规则（np 和 n(1−p) 都 ≥ 10）时，本页 n ≤ 400 的所有设置里，标准化最大差距都不超过 0.026。',

    s5k: '第 5 步 · 连续性修正',
    s5t: '用钟形曲线算「至少 k 次」，为什么要从 k − 0.5 算起？',
    s5e: '这一步要回答：抛 n 次公平硬币（p = 0.5），至少 k 次正面的概率 P(X ≥ k) 是多少？精确答案是把 k 到 n 的柱子（橙色）加起来。用钟形曲线近似时要算曲线下的面积，可是从哪里算起？第 k 根柱子占的是 k − 0.5 到 k + 0.5 这一段，所以面积应从 <strong>k − 0.5</strong> 算起（绿色区域），这叫<strong>连续性修正</strong>；从 k 算起（白色虚线）就漏掉了第 k 根柱子的左半边。面积用标准正态的累积函数 Φ（曲线下 z 左边的面积）来算：P ≈ 1 − Φ((k − 0.5 − μ)/σ)，其中 μ = n/2，σ = √n/2。这种「至少/至多多少」的概率叫<strong>尾部概率</strong>（<a class="xlink" href="../../../probability/inference/hypothesis-testing/#step0">→ 假设检验页第 0 步：p 值就是一种尾部概率</a>）。',
    s5lgTail: '计入 P(X ≥ k) 的柱子', s5lgCc: '修正后：曲线下从 k − 0.5 起的面积', s5lgK: '不修正：从 k 起算',
    tossSlider: '抛硬币次数 n', atLeastSlider: '至少 k 次正面',
    c5title: '抛 {n} 次，至少 {k} 次正面',
    c5axis: '正面次数（只显示 μ ± 4.5σ 附近）',
    s5readout: 'n = {n}，μ = {mu}，σ = {s}，至少 {k} 次：精确值 {ex}；从 k 算起（z = {z1}）得 {raw}，误差 {er}；从 k − 0.5 算起（z = {z2}）得 {cc}，误差 {ec}。',
    s5hint: '观察顺序：先看默认的 n = 100、k = 60：精确值 0.0284，不修正得 0.0228（少了约五分之一），修正后 0.0287。再自己拖 k 和 n 比较。本步所有设置下（n = 10～200 的偶数），不修正时误差最大 0.123，修正后最大 0.0027；只要精确概率在 1%～99% 之间，修正后的都更准。在极远的尾部（概率小于 1%），两种近似的相对误差都会变大，那里最好直接算精确值。',

    s6k: '第 6 步 · 收束',
    s6t: '从数路径，到一口钟',
    s6fin: '钉板上每条路都是一串左右选择，数路径就得到<strong>杨辉三角</strong>和 C(n, k)（第 0 步）。让每次向右的概率为 p，就得到<strong>二项分布</strong> P(X = k) = C(n, k)·p^k·(1−p)^(n−k)（第 1 步）。它的中心是 np，宽度是 √(np(1−p))：n ×4，宽度 ×2（第 2 步）。n 够大时，柱子贴近正态曲线（第 3 步）；标准化之后所有 n 都对准同一口钟，p = 0.5 贴得快，p 偏离 0.5 时慢（第 4 步）。用曲线算整数结果的概率时，从 k − 0.5 起算（第 5 步）。',
    formula: 'P(X = k) = C(n,k)·p^k·(1−p)^(n−k)\nμ = np，σ = √(np(1−p))\nP(X ≥ k) ≈ 1 − Φ((k − 0.5 − np)/σ)',
    boundary: '适用条件：n 次试验相互独立、每次成功的概率相同。钉板上的球是电脑用固定种子的伪随机数模拟的，钉子是理想化的（真钉板上球会弹跳，左右并不严格独立、也不严格各半）。页面上的「57.1%～78.0%」「0.026」「0.123 和 0.0027」只对本页滑杆范围核验过；比较的是整数点上的概率与密度，或尾部概率，不是所有可能的误差口径。正态近似在极远尾部的相对误差会变大。',
    linksTitle: '接着去哪',
    lk1: '→ 中心极限定理页第 2 步：不只是二项分布，很多随机量的平均都会长成钟形',
    lk2: '→ 概率分布页第 2 步：方差把「散不散」变成一个数',
    lk3: '→ 假设检验页第 0 步：用尾部概率判断一个结果是否反常',
    lk4: '→ 概率与频率页第 0 步：从转一次转盘说起的概率',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《二项分布到正态 · 钉板上长出的钟形》的平行版本。'
  },
  en: {
    pageTitle: 'Binomial to Normal · Count the Paths, Find the Bell',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Binomial to Normal · The Bell Curve Growing on a Pegboard →',
    navLabel: 'Binomial to normal steps',
    tagline: 'A ball drops onto a pegboard, bounces left or right at every peg, and lands in one of the bins at the bottom. How likely is each bin? This page first counts how many paths lead to each bin, which gives the binomial distribution; then asks what sets the centre and width of the histogram; and finally lays a bell curve (the normal distribution) over the bars to measure how well it fits, when it does not, and why you shift by half a unit when using it to compute probabilities.',
    nav0: '0 Count paths', nav1: '1 Drop balls', nav2: '2 Centre & width', nav3: '3 Bell curve', nav4: '4 Standardise', nav5: '5 Half-unit fix', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Counting paths',
    s0t: 'How many paths end in bin k?',
    s0e: 'The question here: the board has n rows of pegs. At each peg the ball steps left or right, and at the bottom it lands in a bin. Number the bins by how many times the ball went right: k = 0, 1, …, n. How many different paths lead to bin k? Each box in the picture is a position (the bottom row is the bins), and the number in it counts the paths from the top to that spot. You can only reach a position from the one up-left or up-right of it, so <strong>each number = up-left + up-right</strong>: this is <strong>Pascal’s triangle</strong>. The k-th number in the bottom row is the binomial coefficient <strong>C(n, k)</strong>, the number of ways to choose which k of the n steps go right (<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ Permutations & Combinations, step 3: choosing without order, C(n, k)</a>). If left and right are equally likely (1/2 each), every one of the 2ⁿ paths has probability (1/2)ⁿ, so P(bin k) = C(n, k) ÷ 2ⁿ.',
    s0lgReach: 'positions and links that can reach bin k', s0lgOff: 'positions that cannot', s0lgPath: 'current path (faint: paths already shown)',
    rowsSlider: 'Rows of pegs n', binSlider: 'Target bin k (number of rights)',
    nextPath: 'Next path', allPaths: 'Walk every path',
    c0title: 'Pegboard: each number = paths from the top to that spot',
    c0axis: 'bin k = number of steps to the right',
    pathL: 'L', pathR: 'R',
    s0readout: 'There are C({n}, {k}) = {c} paths to bin {k} (the k-th number in the bottom row) out of {tot} paths in all (2 to the power {n}). With left and right at 1/2 each, every path is equally likely, so P(bin {k}) = {c} ÷ {tot} ≈ {pr}. Showing path {i}: {path}; {seen} paths seen so far.',
    s0hint: 'What to try: keep n = 6 and drag “Target bin k”. The orange boxes are every position that can still reach bin k, and the orange number in the bottom row is the path count; middle bins have the most paths, the two end bins only one. Press “Walk every path”: cyan paths are drawn one at a time and stay behind faintly, so you can count them against the number in the box. Then drag n and check that every number is the sum of the two above it.',

    s1k: 'Step 1 · Dropping balls',
    s1t: 'Drop lots of balls: do the bins fill in these proportions?',
    s1e: 'The question here: the last step counted proportions. If we actually drop many balls, does the share in each bin approach them? The balls here are simulated: fixed-seed pseudo-random numbers decide each left or right. Now generalise: if the ball goes <strong>right with probability p</strong> (not necessarily 1/2), a path with exactly k rights has probability p^k·(1−p)^(n−k), and there are C(n, k) such paths, so <strong>P(X = k) = C(n, k)·p^k·(1−p)^(n−k)</strong>. That is the <strong>binomial distribution</strong>: n independent yes/no trials, each a “yes” with the same probability p (a <strong>Bernoulli trial</strong>), and X counts the yeses. The cyan bars below are observed shares (balls in a bin ÷ all balls); the orange outline is the formula.',
    s1lgObs: 'observed share (balls in bin ÷ all balls)', s1lgExact: 'formula C(n,k)·p^k·(1−p)^(n−k)', s1lgBall: 'falling ball',
    pSlider: 'Probability of going right (success) p',
    drop1: 'Drop 1 (watch its path)', drop100: 'Drop 100', drop1000: 'Drop 1000', clearBoard: 'Clear',
    c1board: 'Pegboard: {n} rows, right with probability p = {p}',
    c1hist: 'Share in each bin',
    c1axis: 'bin k = number of rights',
    s1none: 'No balls yet (n = {n}, p = {p}). Press “Drop 1” to see one path, then “Drop 100”.',
    s1readout: '{N} balls dropped. The bin furthest from the formula is bin {k}: observed {o}, formula {e}, a difference of {d}.',
    s1hint: 'What to try: press “Drop 1” and watch the ball go left or right row by row. Then press “Drop 100” and “Drop 1000” a few times: the cyan bars settle onto the orange outline, and the difference in the readout shrinks as balls pile up. Now drag p to 0.20: the outline shifts left and becomes lopsided. Changing n or p empties the bins (old balls belong to the old board).',

    s2k: 'Step 2 · Centre and width',
    s2t: 'What decides where the histogram sits and how wide it is?',
    s2e: 'The question here: no more balls; we draw the bars straight from the formula (each bar is 1 wide with height = probability, so its area is that probability too), and n can go up to 100. The <strong>mean</strong> (expected value) <strong>μ = np</strong> is the average number of successes and the balance point of the bars. The <strong>variance σ² = np(1−p)</strong> is the average squared distance from μ. The <strong>standard deviation σ = √(np(1−p))</strong> is the typical distance from μ, measured in the same units as k: successes (<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ Probability distributions, step 2: variance turns spread into a number</a>). The orange line is μ; the green band runs from μ − σ to μ + σ. The axis is fixed at 0–100 so you can compare widths across n directly.',
    s2lgBars: 'probability of each k, P(X = k)', s2lgMu: 'mean μ = np', s2lgBand: 'μ ± σ', s2lgOld: 'your previous two settings (outlines)',
    trialsSlider: 'Number of trials n',
    c2title: 'Binomial P(X = k) (axis fixed at 0–100)',
    c2axis: 'number of successes k',
    s2readout: 'n = {n}, p = {p}: μ = np = {mu}, σ² = np(1−p) = {v}, σ = {s}. The bars inside the green band ({lo} to {hi}) add up to {w}%.',
    s2hint: 'What to try: fix p = 0.50 and drag n from 20 to 80 (×4). The centre moves from 10 to 40 and σ goes from 2.236 to 4.472, exactly ×2; once you release the slider, a grey outline keeps the earlier shape for comparison. Then fix n and drag p from 0.50 to 0.10: the centre moves left, σ shrinks and the shape trails off to the right. For n ≥ 30 the probability inside the green band always lies between 57.1% and 78.0%, jumping about because the bars come in whole units and a tiny shift of the band edge lets one bar in or out; it hovers around the normal distribution’s 68.3%.',

    s3k: 'Step 3 · The bell curve',
    s3t: 'Can one smooth bell curve stand in for the bars?',
    s3e: 'The question here: can a smooth curve replace the individual bars? The candidate is the density curve of the <strong>normal distribution</strong> (the bell curve): f(x) = e^(−(x−μ)²/(2σ²)) ÷ (σ√(2π)), using μ = np and σ = √(np(1−p)) from the last step. A <strong>density</strong> means the area under the curve over a stretch is the probability of landing there, with total area 1. Because each bar is 1 wide with height = probability, comparing the bar height with the curve’s height at the same whole number k is a fair test. The yellow segment marks the k where they differ most (whole numbers only). The textbook <strong>rule of thumb</strong> says the normal distribution can approximate the binomial when np ≥ 10 and n(1−p) ≥ 10.',
    s3lgBell: 'normal curve N(np, np(1−p))', s3lgGap: 'largest bar-to-curve gap',
    c3title: 'n = {n}, p = {p}: bars and the bell curve',
    c3axis: 'number of successes k (only around μ ± 4σ)',
    s3readout: 'μ = {mu}, σ = {s}. The biggest gap is at k = {k}: bar {bar}, curve {bell}, difference {gap} ({rel}% of the tallest bar). ',
    s3ruleYes: 'np = {a} and n(1−p) = {b} are both ≥ 10: the rule of thumb is met.',
    s3ruleNo: 'np = {a} and n(1−p) = {b}: at least one is below 10, so the rule of thumb is not met.',
    s3skewR: ' The bars trail off to the right (long right side, left side stopped at 0), and a symmetric bell cannot follow them.',
    s3skewL: ' The bars trail off to the left (long left side, right side stopped at n), and a symmetric bell cannot follow them.',
    s3hint: 'What to try: keep p = 0.20 and drag n from 10 to 100. At first the bars lean to one side, the bell spills below 0 on the left, and the yellow segment is long; at n = 50 the rule of thumb is just met and the segment is already short. Then drag p back to 0.50: for the same n the bars are symmetric and the fit arrives sooner.',

    s4k: 'Step 4 · Standardising',
    s4t: 'As n grows, why do the bars all turn into the same bell?',
    s4e: 'The question here: in the last step each n drew a bell in a different place and at a different size, so they could not be compared. The fix is to <strong>standardise</strong>: replace the horizontal axis by z = (k − μ)/σ, the number of standard deviations from the mean, and multiply each probability by σ (the bars become 1/σ wide, so multiplying by σ keeps the area). Then every n lines up with one <strong>standard normal curve</strong>, φ(z) = e^(−z²/2) ÷ √(2π), whose peak is about 0.399. In the “Standardised bars” chart, grey outlines are the n values you have visited. The “Largest gap by n” chart plots the standardised largest gap (σ × the largest gap from step 3) on log scales: the white dots are the current p, the dashed grey line is p = 0.5 for reference. The readout’s <strong>skewness</strong> measure (1−2p)/σ captures lopsidedness: 0 means symmetric, larger in size means more lopsided, and it shrinks like 1/√n.',
    c4a: 'Standardised bars: σ·P(X = k) against z', c4b: 'Largest gap by n (log scales)',
    s4lgBars: 'standardised bars', s4lgBell: 'standard normal curve φ(z)', s4lgOld: 'n values visited (outlines)', s4lgCurve: 'largest gap for the current p', s4lgRef: 'p = 0.5 for reference',
    grow4: 'Grow n from 4 to 400',
    c4axis: 'z = (k − μ)/σ', c4baxis: 'number of trials n',
    s4readout: 'n = {n}, p = {p}, σ = {s}: the standardised largest gap is {g} ({rel}% of the bell’s 0.399 peak); skewness (1−2p)/σ = {sk}. ',
    s4hint: 'What to try: keep p = 0.30 and press “Grow n from 4 to 400”. The bars tighten onto the pink curve notch by notch, grey outlines keep each stage, and the dots in “Largest gap by n” keep falling. Now compare how fast: over the last two notches (n from 64 to 256 and from 100 to 400, each ×4), the gap for p = 0.5 shrinks to about 1/4 (roughly like 1/n), while for p = 0.1–0.4 or 0.6–0.9 it only halves (roughly like 1/√n), because the lopsidedness wears off slowly; p = 0.45 and 0.55 fall in between. Whenever the rule of thumb holds (np and n(1−p) both ≥ 10), the standardised largest gap stays at or below 0.026 for every setting on this page up to n = 400.',

    s5k: 'Step 5 · The half-unit correction',
    s5t: 'Using the bell for “at least k”, why start at k − 0.5?',
    s5e: 'The question here: toss a fair coin n times (p = 0.5). What is the probability of at least k heads, P(X ≥ k)? The exact answer adds up the bars from k to n (orange). To approximate with the bell we take an area under the curve, but starting where? Bar k occupies the stretch from k − 0.5 to k + 0.5, so the area should start at <strong>k − 0.5</strong> (green): this is the <strong>continuity correction</strong>. Starting at k (dashed white line) leaves out the left half of bar k. The area comes from the standard normal cumulative function Φ (the area under the curve to the left of z): P ≈ 1 − Φ((k − 0.5 − μ)/σ), with μ = n/2 and σ = √n/2. A probability of “at least” or “at most” some value is called a <strong>tail probability</strong> (<a class="xlink" href="../../../probability/inference/hypothesis-testing/#step0">→ Hypothesis testing, step 0: a p-value is a tail probability</a>).',
    s5lgTail: 'bars counted in P(X ≥ k)', s5lgCc: 'corrected: area under the curve from k − 0.5', s5lgK: 'uncorrected: start at k',
    tossSlider: 'Coin tosses n', atLeastSlider: 'At least k heads',
    c5title: '{n} tosses, at least {k} heads',
    c5axis: 'number of heads (only around μ ± 4.5σ)',
    s5readout: 'n = {n}, μ = {mu}, σ = {s}, at least {k}: exact {ex}; starting at k (z = {z1}) gives {raw}, error {er}; starting at k − 0.5 (z = {z2}) gives {cc}, error {ec}.',
    s5hint: 'What to try: start with the default n = 100, k = 60. The exact value is 0.0284; without the correction you get 0.0228 (about a fifth too small), with it 0.0287. Then drag k and n yourself. Across every setting in this step (even n from 10 to 200), the uncorrected error reaches 0.123 at worst and the corrected one only 0.0027; whenever the exact probability lies between 1% and 99%, the corrected value is always the closer one. Far out in the tail (below 1%) both approximations have large relative errors, and there it is best to compute the exact value.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'From counting paths to a bell',
    s6fin: 'Every path on the pegboard is a string of left/right choices, and counting them gives <strong>Pascal’s triangle</strong> and C(n, k) (step 0). Let each step go right with probability p and you get the <strong>binomial distribution</strong>, P(X = k) = C(n, k)·p^k·(1−p)^(n−k) (step 1). Its centre is np and its width √(np(1−p)): four times n, twice the width (step 2). For large enough n the bars hug the normal curve (step 3); once standardised, every n lines up with the same bell, quickly for p = 0.5 and slowly when p is far from 0.5 (step 4). When you use the curve for probabilities of whole-number outcomes, start half a unit early (step 5).',
    formula: 'P(X = k) = C(n,k)·p^k·(1−p)^(n−k)\nμ = np, σ = √(np(1−p))\nP(X ≥ k) ≈ 1 − Φ((k − 0.5 − np)/σ)',
    boundary: 'Where this holds: the n trials are independent and each succeeds with the same probability. The balls on the board are simulated with fixed-seed pseudo-random numbers and the pegs are idealised (on a real board balls bounce, and left/right is neither strictly independent nor strictly 50/50). The figures “57.1%–78.0%”, “0.026”, and “0.123 and 0.0027” were checked only over this page’s slider ranges; they compare probability with density at whole numbers, or tail probabilities, not every possible way of measuring error. Far out in the tails the normal approximation’s relative error grows.',
    linksTitle: 'Where to go next',
    lk1: '→ Central limit theorem, step 2: not just binomials, averages of many random quantities grow into a bell',
    lk2: '→ Probability distributions, step 2: variance turns spread into a number',
    lk3: '→ Hypothesis testing, step 0: judging whether a result is unusual with a tail probability',
    lk4: '→ Probability & frequency, step 0: probability, starting from one spin',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Binomial to Normal · The Bell Curve Growing on a Pegboard”.'
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
  if (typeof window.refreshBinomial === 'function') window.refreshBinomial();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
