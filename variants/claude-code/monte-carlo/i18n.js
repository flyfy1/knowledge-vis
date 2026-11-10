'use strict';
// Monte Carlo lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '蒙特卡洛 · 用随机点去量面积',
    back: '← 知识索引',
    compare: '对照另一版本：蒙特卡洛 · 撒豆子算 π →',
    navLabel: '蒙特卡洛步骤导航',
    tagline: '有些量用公式算不出来，或者算起来太费事，但可以「试」出来：往一块已知面积的区域里随机撒点，数一数落进目标的比例。这页从 π 出发，看清这种估计会差多少、差值怎样随点数缩小，再看它为什么在高维问题里不可替代，怎样让它更准，以及它所依赖的「随机数」从哪里来。',
    nav0: '0 撒点估 π', nav1: '1 会差多少', nav2: '2 估积分', nav3: '3 高维', nav4: '4 分层撒点', nav5: '5 随机数', nav6: '6 收束',

    s0k: '第 0 步 · 撒点',
    s0t: '往正方形里随机撒点，怎么从中数出 π？',
    s0e: '这一步要回答：不用任何几何公式，能不能靠随机点估出 π？取边长为 1 的正方形，以一个角为圆心画半径为 1 的四分之一圆。四分之一圆面积是 π/4，正方形面积是 1。往正方形里<strong>均匀随机</strong>地撒点（每一处被落到的机会一样），点落在圆内的机会就等于面积之比 π/4。所以：数出圆内点占的比例，乘以 4，就是 π 的一个<strong>估计</strong>。点越多，比例一般越接近 π/4——这是<strong>大数定律</strong>：独立重复多次，频率会趋近概率（<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ 频率与概率第 2 步：转得越多越稳</a>）。',
    add1: '撒 1 个', add100: '撒 100 个', add1000: '撒 1000 个', play0: '连续撒到 10000 个', reset0: '清空', reroll0: '换一组随机数',
    c0a: '正方形与四分之一圆', c0b: '4 × 圆内比例，随点数 N 变化（横轴对数）',
    s0lgIn: '落在圆内', s0lgOut: '落在圆外', s0lgPi: '真值 π', s0lgBand: 'π ± 2 个标准误差（下一步解释）',
    s0none: '还没有点。按任意「撒」按钮开始。',
    s0readout: '已撒 N = {n} 个点，圆内 {k} 个，比例 {r}。估计 4 × {r} = {est}，与 π 差 {err}。',
    s0hint: '观察顺序：先按几次「撒 1 个」和「撒 100 个」，看「4 × 圆内比例」图里的折线早期大起大落；再按「连续撒到 10000 个」，看折线越来越贴近虚线 π，但并不是每多撒一批都更近。「换一组随机数」再撒一遍，会走出另一条路，终点附近却同样贴近 π。',

    s1k: '第 1 步 · 误差的尺度',
    s1t: '只撒 N 个点，估计一般会差多少？点数翻 4 倍呢？',
    s1e: '这一步要回答：一次估计的误差是随机的，那它的「典型大小」是多少，怎样随 N 变化？办法是把同一个实验（撒 N 个点得一个估计）独立重复 500 次，看 500 个估计散得多开。散开程度用<strong>标准差</strong>衡量：各估计与平均值之差平方后平均再开方。理论上，每个点落进圆内是概率 p = π/4 的独立事件，所以这个标准差——叫估计的<strong>标准误差 SE</strong>——等于 4·√(p(1 − p)/N) ≈ 1.64/√N。<strong>它与 1/√N 成正比</strong>：N 翻 4 倍，误差减半；想多准一位小数（误差缩到 1/10），点数要多 100 倍（<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ 中心极限定理第 3 步：σ/√n 是条铁律</a>）。直方图上的钟形曲线是正态分布，平均值 π、标准差 SE：N 大时，估计的分布接近它。',
    N1: '每次估计用的点数 N',
    c1a: '500 次估计的分布（横轴：估计值）', c1b: '估计的散布 vs N（双对数坐标）',
    s1lgH: '500 次估计的直方图', s1lgN: '正态曲线：均值 π、标准差 SE', s1lgM: '实测标准差（已看过的 N）', s1lgT: '理论 SE = 1.64/√N',
    s1readout: 'N = {N}：500 次估计的标准差 {sd}，理论 SE {se}；{w}% 的估计落在 π ± 1.96·SE 内（正态时应约 95%）。{prev}',
    s1prev: '与 N = {pN} 时相比，标准差变为 {ratio} 倍。',
    s1hint: '观察顺序：把 N 从 100 一格格拖到 6400（每格 ×4）。看直方图每次大约窄一半，橙色正态曲线始终贴着它；「估计的散布 vs N」图里每看过一档就留下一个白点，白点沿着斜率 −1/2 的虚线排下来。注意横轴范围固定，变窄是真的变窄。',

    s2k: '第 2 步 · 估积分',
    s2t: '没有公式的面积，怎么估？两种撒法哪种更省？',
    s2e: '这一步要回答：曲线 y = f(x) 在 0 到 1 之间与 x 轴围成的面积（即<strong>积分</strong> ∫₀¹ f(x) dx）没有现成公式时，怎样用随机数估它，又有哪种办法更准？<strong>投点法</strong>：在单位正方形里撒点，数落在曲线下方的比例（第 0 步就是它，f 是四分之一圆）。<strong>平均值法</strong>：只随机取 x，直接算 f(x)，再把这些值平均——因为区间长度是 1，f 的平均高度就是面积。两者误差都按 1/√N 缩小，但前面的系数不同：每个样本的标准差，投点法是 √(I(1 − I))（只记 0 或 1），平均值法是 f(x) 本身的标准差，通常小得多。',
    N2: '点数 N', fGauss: 'f(x) = e^(−x²)', fCircle: 'f(x) = √(1 − x²)（四分之一圆）', reroll2: '换一组随机数',
    c2a: '曲线与撒下的点', c2b: '两种估计随点数变化（横轴：已用点数）',
    s2lgHit: '投点：落在曲线下', s2lgMiss: '投点：落在曲线上方', s2lgH: '投点法的估计', s2lgM: '平均值法的估计', s2lgI: '精确值',
    s2readout: '精确值 I = {I}。用 N = {N} 个点：投点法 {h}（差 {eh}），平均值法 {m}（差 {em}）。每个样本的理论标准差：投点法 {sh}，平均值法 {sm}，所以要同样准，投点法需要约 {x} 倍的点。重复 400 次、每次 400 点的实测标准差：投点法 {rh}，平均值法 {rm}。',
    s2hint: '观察顺序：先保持 f = e^(−x²)，把 N 拖到最大，看「两种估计随点数变化」图里青线（平均值法）比橙线（投点法）更早贴近白色虚线；再按「换一组随机数」几次，比较两条线的晃动幅度。换成四分之一圆，投点法就是第 0 步的 π/4，平均值法依然更稳。',

    s3k: '第 3 步 · 维度灾难',
    s3t: '算高维体积时，规则网格为什么会败给随机点？',
    s3e: '这一步要回答：在 d 维空间里，单位球占立方体 [−1, 1]^d 的比例 p 是多少？同样只给 4096 个点，规则网格和随机撒点谁估得准？<strong>网格法</strong>：每条轴等分成 m 格、取格子中心，共 m^d 个点；预算 4096 个点时，m 是 4096 的 d 次方根取整——d = 2 时每轴 64 格，d = 8 时每轴只剩 2 格。<strong>随机法</strong>：4096 个点都独立均匀地撒在立方体里。比较的指标是<strong>相对误差</strong>：|估计 − 真值| ÷ 真值。随机法的标准误差 √(p(1 − p)/N) 与维数无关；但 p 本身随 d 急剧变小，所以它的相对误差 √((1 − p)/(Np)) 也会增长——随机法同样吃力，只是不会像网格那样一下子失效。',
    d3: '维数 d',
    c3a: '相对误差 vs 维数（纵轴对数）', c3b: '球占立方体的比例 p（纵轴对数）',
    s3lgG: '网格法（m^d 个格点）', s3lgR: '随机法（一次实测）', s3lgS: '随机法的理论相对标准误差', s3lgP: '真值 p',
    s3readout: 'd = {d}：真值 p = {p}。网格每轴 {m} 格、实际用 {used} 个点，估计 {g}，相对误差 {ge}。随机 4096 点估计 {r}，相对误差 {re}（理论相对标准误差 {rs}）。',
    s3hint: '观察顺序：从 d = 2 拖到 10。看上图橙线：d ≤ 4 时网格还不错，d = 8 起每轴只有 2 格，格点全落在球外，估计变成 0、相对误差 100%；青点（随机法）一路增长但没有崩掉，大体贴着白色虚线。下图说明原因：球在立方体里的占比越来越小。',

    s4k: '第 4 步 · 分层撒点',
    s4t: '同样撒 N 个点，能不能撒得更均匀、误差更小？',
    s4e: '这一步要回答：纯随机撒点难免有的地方挤、有的地方空。若把正方形切成 k × k 个小格，每格里随机撒 1 个点（共 N = k² 个），估计 π 的误差会怎样？这叫<strong>分层抽样</strong>：每个点仍在自己格子里随机，但每个格子都分到恰好一个点。只有被圆周穿过的那些格子里，「落在圆内还是圆外」才是不确定的；完全在圆内或圆外的格子贡献的是确定的数。比较用的是第 1 步的办法：每个 N 重复 300 次，看估计的<strong>标准差</strong>。双对数图上，直线的斜率就是误差随 N 缩小的幂次。',
    k4: '每边格数 k（N = k²）',
    c4a: '一次分层撒点', c4b: '估计的标准差 vs N（双对数）',
    s4lgP: '纯随机：实测', s4lgS: '分层：实测', s4lgT: '纯随机理论 SE ∝ N^(−1/2)',
    s4readout: 'k = {k}，N = {N}：纯随机标准差 {sp}，分层标准差 {ss}，分层只有纯随机的 {ratio} 倍。按 5 档拟合的斜率：纯随机 {a}，分层 {b}（越负，缩得越快）。',
    s4hint: '观察顺序：把 k 从 4 拖到 64。「一次分层撒点」图里每个小格恰好一个点，看不到成团和空洞；「估计的标准差 vs N」图里青点（分层）比白点（纯随机）低，而且越往右差距越大——它的斜率更陡。本页 5 档里，纯随机斜率约 −0.5，分层约 −0.73（理论上对这种光滑边界是 −3/4）。',

    s5k: '第 5 步 · 随机数从哪来',
    s5t: '计算机里的「随机数」靠得住吗？',
    s5e: '这一步要回答：前面每一步都用到成千上万个随机数，它们是怎么来的，坏了会怎样？计算机用确定的公式生成<strong>伪随机数</strong>：给定一个起始值（<strong>种子</strong>），每次按规则算出下一个数。同一个种子总给出同一串数，所以本页每张图都能原样重现。好的生成器（本页用 mulberry32）在统计上难以和真随机区分。坏的例子是这个<strong>线性同余生成器</strong>：x ← (5·x + 1) mod 256，再除以 256。它只有 256 个可能值，绕一圈就重复；把相邻两个数当成一个点 (u₁, u₂)，所有点都排在几条平行斜线上，最多只有 128 个不同的点。',
    genGood: '好的生成器（mulberry32）', genBad: '坏的生成器（mod 256 的线性同余）', seed5: '种子',
    c5a: '相邻两数组成的点 (u₁, u₂)，前 2000 对', c5b: '两种生成器估 π（横轴：点数，对数）',
    s5lgG: '好的生成器', s5lgB: '坏的生成器', s5lgPi: '真值 π',
    s5readout: '当前显示：{name}，种子 {seed}，开头四个数 {first}。5000 对里不同的点：好的 {dg} 个，坏的 {db} 个。撒 10000 个点：好的估计 {eg}（差 {erg}），坏的估计 {eb}（差 {erb}）。',
    s5hint: '观察顺序：先点「坏的生成器」，「相邻两数组成的点」图里的点排成几条斜线，大片空白永远没有点；「两种生成器估 π」图里橙线在几百个点后就不再变化，停在离 π 约 0.05–0.08 的地方，撒再多也没用。再点「好的生成器」，看点铺满整格。拖「种子」：同一种子下读数里的开头四个数每次都一样——这就是可重现。',

    s6k: '第 6 步 · 收束',
    s6t: '蒙特卡洛方法做了什么，代价是什么？',
    s6fin: '把要算的量写成某个随机实验的平均值（落进圆内的比例、f(x) 的平均高度、落进球内的比例），然后真的去做很多次这个实验，取平均（第 0、2、3 步）。大数定律保证它趋近真值；误差的典型大小是标准误差 σ/√N，σ 是单个样本的标准差（第 1 步）。所以想多准一位要多 100 倍的点；降低误差的两条路是减小 σ（换更好的估计方式，第 2 步）或让样本更均匀（分层，第 4 步）。它的长处是 σ/√N 不显含维数，高维时规则网格反而撑不住（第 3 步）。而这一切都建立在随机数足够好的前提上（第 5 步）。',
    formula: '估计 = (1/N) Σ g(Xᵢ)，标准误差 = σ_g / √N\nπ：g = 4·[点在圆内]，σ_g = 4·√(p(1 − p)) ≈ 1.64',
    boundary: '适用条件：样本相互独立、来自正确的分布，且单个样本的方差有限；「误差约 SE」是典型值，不是保证——任何一次都可能偏离 2 个 SE 以上（约 5% 的机会）。π ± 2·SE 的虚线带是围着已知真值画的参照，不是从数据算出的置信区间。分层抽样的斜率 −3/4 只对边界光滑的二维问题成立。本页所有随机数都是伪随机、带固定种子。',
    linksTitle: '接着去哪儿',
    lk1: '→ 频率与概率第 2 步：转得越多越稳——大数定律',
    lk2: '→ 中心极限定理第 3 步：σ/√n 是条铁律',
    lk3: '→ 二项与正态第 3 步：钟形曲线——为什么估计的分布像正态',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《蒙特卡洛 · 撒豆子算 π》的平行版本。'
  },
  en: {
    pageTitle: 'Monte Carlo · Measuring Area With Random Points',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Monte Carlo · Counting π with Scattered Beans →',
    navLabel: 'Monte Carlo steps',
    tagline: 'Some quantities have no formula, or one that is too costly to evaluate, yet they can be found by trial: scatter random points over a region of known area and count the fraction that lands on the target. Starting from π, this page works out how far off such an estimate tends to be and how that shrinks with more points, then why it is irreplaceable in high dimensions, how to make it sharper, and where its “random numbers” come from.',
    nav0: '0 π from points', nav1: '1 How far off', nav2: '2 Integrals', nav3: '3 High dimensions', nav4: '4 Stratified', nav5: '5 Random numbers', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · SCATTER',
    s0t: 'Scatter random points in a square. How do you count π out of them?',
    s0e: 'The question here: with no geometry formula at all, can random points estimate π? Take a square of side 1 and draw a quarter circle of radius 1 centred on one corner. The quarter circle has area π/4; the square has area 1. Scatter points <strong>uniformly at random</strong> over the square (every spot equally likely), and the chance a point lands inside the circle equals the area ratio π/4. So the fraction of points inside, times 4, is an <strong>estimate</strong> of π. With more points the fraction usually gets closer to π/4. That is the <strong>law of large numbers</strong>: over many independent repeats, a frequency approaches its probability (<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ Probability and frequency, step 2: more spins, steadier results</a>).',
    add1: 'Drop 1', add100: 'Drop 100', add1000: 'Drop 1000', play0: 'Keep dropping to 10,000', reset0: 'Clear', reroll0: 'New random numbers',
    c0a: 'Square and quarter circle', c0b: '4 × fraction inside, as N grows (log x-axis)',
    s0lgIn: 'Inside the circle', s0lgOut: 'Outside the circle', s0lgPi: 'True π', s0lgBand: 'π ± 2 standard errors (explained next step)',
    s0none: 'No points yet. Press any “Drop” button to start.',
    s0readout: 'N = {n} points dropped, {k} inside, fraction {r}. Estimate 4 × {r} = {est}, off from π by {err}.',
    s0hint: 'What to try: press “Drop 1” and “Drop 100” a few times and watch the line in the estimate plot swing wildly at first. Then press “Keep dropping to 10,000”: the line hugs the dashed π more and more closely, though not every new batch brings it closer. Press “New random numbers” and drop again: you get a different path, but it ends just as close to π.',

    s1k: 'STEP 1 · THE SIZE OF THE ERROR',
    s1t: 'With N points, how far off is an estimate typically? And with 4 times as many?',
    s1e: 'The question here: one estimate’s error is random, so what is its typical size, and how does it change with N? Repeat the same experiment (drop N points, get one estimate) 500 times independently and see how widely the 500 estimates spread. Measure the spread by the <strong>standard deviation</strong>: square each estimate’s distance from the average, average those, take the root. In theory each point lands inside with probability p = π/4, independently, so this standard deviation, called the estimate’s <strong>standard error (SE)</strong>, is 4·√(p(1 − p)/N) ≈ 1.64/√N. <strong>It scales as 1/√N</strong>: four times the points halves the error, and one more correct decimal place (error down to a tenth) costs a hundred times the points (<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ Central limit theorem, step 3: σ/√n is an iron law</a>). The bell curve in the histogram is a normal distribution with mean π and standard deviation SE; for large N the estimates follow it closely.',
    N1: 'Points per estimate N',
    c1a: 'Spread of 500 estimates (x-axis: estimate)', c1b: 'Spread of the estimate vs N (log–log)',
    s1lgH: 'Histogram of 500 estimates', s1lgN: 'Normal curve: mean π, sd SE', s1lgM: 'Measured sd (values of N seen)', s1lgT: 'Theory SE = 1.64/√N',
    s1readout: 'N = {N}: the 500 estimates have standard deviation {sd}, theory SE {se}; {w}% of them fall within π ± 1.96·SE (about 95% if normal). {prev}',
    s1prev: 'Compared with N = {pN}, the standard deviation changed by a factor of {ratio}.',
    s1hint: 'What to try: step N from 100 up to 6400 (×4 per notch). The histogram gets about half as wide each time, and the orange normal curve keeps hugging it. In the log–log plot each N you visit leaves a white dot, and the dots line up along the dashed line of slope −1/2. The x-axis range is fixed, so the narrowing is real.',

    s2k: 'STEP 2 · INTEGRALS',
    s2t: 'An area with no formula: how do you estimate it, and which way is cheaper?',
    s2e: 'The question here: the area under a curve y = f(x) between 0 and 1 (the <strong>integral</strong> ∫₀¹ f(x) dx) may have no ready formula. How can random numbers estimate it, and which way is more accurate? <strong>Hit-or-miss</strong>: scatter points in the unit square and count the fraction under the curve (step 0 did exactly this with a quarter circle). <strong>Sample mean</strong>: draw only random x values, evaluate f(x) directly, and average them; since the interval has length 1, the average height of f is the area. Both errors shrink like 1/√N, but with different constants. The per-sample standard deviation is √(I(1 − I)) for hit-or-miss (it only records 0 or 1) and the standard deviation of f(x) itself for the sample mean, which is usually much smaller.',
    N2: 'Points N', fGauss: 'f(x) = e^(−x²)', fCircle: 'f(x) = √(1 − x²) (quarter circle)', reroll2: 'New random numbers',
    c2a: 'The curve and the points', c2b: 'Both estimates as points are used (x-axis: points used)',
    s2lgHit: 'Hit-or-miss: under the curve', s2lgMiss: 'Hit-or-miss: above the curve', s2lgH: 'Hit-or-miss estimate', s2lgM: 'Sample-mean estimate', s2lgI: 'Exact value',
    s2readout: 'Exact I = {I}. With N = {N} points: hit-or-miss {h} (off by {eh}), sample mean {m} (off by {em}). Theoretical per-sample standard deviation: hit-or-miss {sh}, sample mean {sm}, so hit-or-miss needs about {x} times the points for the same accuracy. Measured over 400 repeats of 400 points: hit-or-miss {rh}, sample mean {rm}.',
    s2hint: 'What to try: keep f = e^(−x²) and push N to the maximum. In the estimates plot the cyan line (sample mean) settles onto the dashed white line sooner than the orange one (hit-or-miss). Press “New random numbers” a few times and compare how much each line wobbles. Switch to the quarter circle: hit-or-miss becomes step 0’s π/4, and the sample mean is still steadier.',

    s3k: 'STEP 3 · THE CURSE OF DIMENSIONALITY',
    s3t: 'For volumes in many dimensions, why does a regular grid lose to random points?',
    s3e: 'The question here: in d dimensions, what fraction p of the cube [−1, 1]^d does the unit ball fill? With the same budget of 4096 points, which estimates it better, a regular grid or random points? <strong>Grid</strong>: split each axis into m cells and take the cell centres, m^d points in all. With a budget of 4096, m is the d-th root of 4096 rounded down: 64 cells per axis at d = 2, only 2 at d = 8. <strong>Random</strong>: all 4096 points scattered independently and uniformly in the cube. The yardstick is <strong>relative error</strong>: |estimate − truth| ÷ truth. The random method’s standard error √(p(1 − p)/N) does not depend on the dimension; but p itself shrinks fast as d grows, so its relative error √((1 − p)/(Np)) grows too. Random points struggle as well; they just do not collapse the way the grid does.',
    d3: 'Dimension d',
    c3a: 'Relative error vs dimension (log y-axis)', c3b: 'Fraction p of the cube inside the ball (log y-axis)',
    s3lgG: 'Grid (m^d grid points)', s3lgR: 'Random (one actual run)', s3lgS: 'Random: theoretical relative standard error', s3lgP: 'True p',
    s3readout: 'd = {d}: true p = {p}. Grid with {m} cells per axis, {used} points actually used: estimate {g}, relative error {ge}. Random, 4096 points: estimate {r}, relative error {re} (theoretical relative standard error {rs}).',
    s3hint: 'What to try: drag d from 2 to 10. In the upper plot the orange line shows the grid doing fine up to d = 4; from d = 8 there are only 2 cells per axis, every grid point lies outside the ball, the estimate is 0 and the relative error 100%. The cyan dots (random) climb steadily but never collapse, roughly following the dashed white line. The lower plot shows why: the ball fills an ever smaller share of the cube.',

    s4k: 'STEP 4 · STRATIFIED SCATTERING',
    s4t: 'With the same N points, can you scatter more evenly and cut the error?',
    s4e: 'The question here: purely random points inevitably bunch up in some places and leave gaps in others. Cut the square into k × k small cells and drop one random point in each (N = k² in all). What happens to the error of the π estimate? This is <strong>stratified sampling</strong>: each point is still random within its own cell, but every cell gets exactly one. Only in cells the circle’s edge passes through is “inside or outside” uncertain; cells entirely inside or outside contribute a fixed amount. The comparison uses step 1’s method: repeat 300 times at each N and look at the estimates’ <strong>standard deviation</strong>. On a log–log plot, the slope of a line is the power at which the error shrinks with N.',
    k4: 'Cells per side k (N = k²)',
    c4a: 'One stratified scatter', c4b: 'Standard deviation of the estimate vs N (log–log)',
    s4lgP: 'Plain random: measured', s4lgS: 'Stratified: measured', s4lgT: 'Plain random theory SE ∝ N^(−1/2)',
    s4readout: 'k = {k}, N = {N}: plain random sd {sp}, stratified sd {ss}, so stratified is {ratio}× the plain value. Slopes fitted over the 5 settings: plain {a}, stratified {b} (more negative = shrinks faster).',
    s4hint: 'What to try: drag k from 4 to 64. In the scatter, every cell holds exactly one point, with no clumps or holes. In the log–log plot the cyan dots (stratified) sit below the white ones (plain random), and the gap widens to the right: their slope is steeper. Across this page’s 5 settings, plain random has slope about −0.5 and stratified about −0.73 (theory for a smooth boundary like this says −3/4).',

    s5k: 'STEP 5 · WHERE RANDOM NUMBERS COME FROM',
    s5t: 'Can you trust a computer’s “random” numbers?',
    s5e: 'The question here: every step so far used thousands of random numbers. Where do they come from, and what goes wrong if they are bad? Computers produce <strong>pseudo-random numbers</strong> with a fixed formula: start from a value (the <strong>seed</strong>) and compute each next number by rule. The same seed always gives the same sequence, which is why every picture on this page can be reproduced exactly. A good generator (this page uses mulberry32) is statistically hard to tell from true randomness. The bad example is this <strong>linear congruential generator</strong>: x ← (5·x + 1) mod 256, then divide by 256. It has only 256 possible values and repeats after one lap. Take neighbouring numbers as a point (u₁, u₂) and every point falls on a few parallel slanted lines, with at most 128 distinct points.',
    genGood: 'Good generator (mulberry32)', genBad: 'Bad generator (mod-256 linear congruential)', seed5: 'Seed',
    c5a: 'Neighbouring pairs (u₁, u₂), first 2000 pairs', c5b: 'π from both generators (x-axis: points, log)',
    s5lgG: 'Good generator', s5lgB: 'Bad generator', s5lgPi: 'True π',
    s5readout: 'Showing: {name}, seed {seed}, first four numbers {first}. Distinct points among 5000 pairs: good {dg}, bad {db}. With 10,000 points: good estimate {eg} (off by {erg}), bad estimate {eb} (off by {erb}).',
    s5hint: 'What to try: click “Bad generator” first. In the pairs plot the points line up on a few slanted lines, and large regions never get a point; in the estimate plot the orange line stops changing after a few hundred points, stuck about 0.05–0.08 away from π, and more points do not help. Then click “Good generator” and watch the square fill evenly. Drag the seed: for a given seed the first four numbers in the readout are always the same. That is reproducibility.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'What does the Monte Carlo method do, and what does it cost?',
    s6fin: 'Write the quantity you want as the average outcome of some random experiment (the fraction inside a circle, the average height of f(x), the fraction inside a ball), then actually run the experiment many times and average (steps 0, 2, 3). The law of large numbers guarantees this approaches the truth; the typical error is the standard error σ/√N, where σ is the standard deviation of a single sample (step 1). So each extra digit costs 100 times the points, and the two ways to cut the error are a smaller σ (a better estimator, step 2) or more even samples (stratification, step 4). Its strength is that σ/√N does not mention the dimension explicitly, so in high dimensions a regular grid gives out first (step 3). All of this rests on the random numbers being good enough (step 5).',
    formula: 'estimate = (1/N) Σ g(Xᵢ),  standard error = σ_g / √N\nπ: g = 4·[point inside],  σ_g = 4·√(p(1 − p)) ≈ 1.64',
    boundary: 'When this holds: samples are independent, drawn from the right distribution, and a single sample has finite variance. “Error about SE” is typical, not guaranteed: any one run can miss by more than 2 SE (about a 5% chance). The dashed π ± 2·SE band is a reference drawn around the known truth, not a confidence interval computed from the data. The −3/4 slope for stratified sampling holds only for two-dimensional problems with a smooth boundary. Every random number on this page is pseudo-random with a fixed seed.',
    linksTitle: 'Where to go next',
    lk1: '→ Probability and frequency, step 2: more spins, steadier results (the law of large numbers)',
    lk2: '→ Central limit theorem, step 3: σ/√n is an iron law',
    lk3: '→ Binomial and normal, step 3: the bell curve, and why the estimates look normal',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Monte Carlo · Counting π with Scattered Beans”.'
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
  if (typeof window.refreshMonteCarlo === 'function') window.refreshMonteCarlo();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
