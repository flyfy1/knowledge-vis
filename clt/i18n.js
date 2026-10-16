'use strict';
/* ============================================================
   中心极限定理讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值；
     动态状态只存数据，文本由状态现算，切语言按 i18n 键重渲染、不丢状态。
   ============================================================ */
const STR = {
  zh: {
    docTitle: '中心极限定理 · 平均值总会变成钟形 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '中心极限定理',
    tagline: '不管单个随机变量长什么样——平的、歪的、双峰的——只要把足够多个平均起来，结果总是钟形。这一页让你亲手摇骰子、换母分布、拉样本量，现场验三件事：平均的中心纹丝不动、散布按 σ/√n 缩小、形状与母分布无关（条件：方差有限）。',
    nav0: '0 钩子', nav1: '1 母分布画廊', nav2: '2 抽样实验室', nav3: '3 精度代价',
    nav4: '4 慢与坏', nav5: '5 卷积阶梯', nav6: '6 样本量计算器',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 中心极限定理 CLT —— 一步一交互系列',
    reset: '重置', newSeed: '换一颗种子', dash: '—',

    s0k: '第 0 步 · 钩子',
    s0t: '骰子平均值的变形记',
    s0e: '一台骰子机。先掷 <strong>1 颗</strong>：直方图是平的（1–6 等高）。切换到<strong>掷 2 颗取平均</strong>：开始隆起；<strong>5 颗</strong>、<strong>30 颗</strong>：钟形拔地而起，中心始终钉在 3.5。单颗骰子毫无钟形可言，平均却把钟形变了出来——这是全概率论最像魔法的一条定理。',
    dice1: '掷 1 颗', dice2: '掷 2 颗取平均', dice5: '掷 5 颗取平均', dice30: '掷 30 颗取平均',
    s0run: '连掷采样（到 2 万组自动停）',
    s0ro: '每组 {k} 颗 · 已累积 <span>{K}</span> 组均值 · 经验均值 <span>{mean}</span>（理论 μ = 3.5）· 经验标准差 <span>{std}</span> · 理论 σ/√k = <span>{tstd}</span> · 种子 {seed}',
    cHist: '样本均值的直方图', cMuLine: 'μ = 3.5（中心不动）',
    s0hint: '看两件事：① 形状从平变钟；② 中心始终 3.5，宽度越变越窄。第 2 步我们把这个实验做成实验室，第 3 步测量它变窄的速度。',

    s1k: '第 1 步 · 母分布画廊',
    s1t: '原料什么样都有',
    s1e: '把「原料」（母分布）轮流摆上台：平的、歪的、双峰的、离散的、长尾的。每种旁边都写明理论均值 μ、标准差 σ 的<strong>来源公式</strong>——后面所有理论曲线都只用这些值画，不许拿经验值冒充。原料越怪越好：定理的威力就在于对原料几乎不挑。',
    pUniform: '均匀 U(0, 1)', pExp: '指数 Exp(1)', pBimodal: '双峰（两个高斯混合）',
    pDice: '骰子（1–6）', pPareto: '帕累托 Pareto(α)',
    alpha15: 'α = 1.5（方差无穷）', alpha35: 'α = 3.5（方差有限）',
    s1ro: '理论 μ = <span>{mu}</span> · 理论 σ = <span>{sigma}</span> · 公式：{formula} · 采样 2 万点绘直方图，种子 {seed}',
    fUniform: 'μ = (a+b)/2 = 0.5，σ = (b−a)/√12 ≈ 0.2887',
    fExp: 'μ = 1/λ = 1，σ = 1/λ = 1',
    fBimodal: '混合 μ = Σwᵢμᵢ = 3.5，方差 = Σwᵢ(σᵢ²+μᵢ²) − μ² = 2.61，σ ≈ 1.6155',
    fDice: 'μ = (1+2+⋯+6)/6 = 3.5，σ² = 35/12，σ ≈ 1.7078',
    fPareto35: 'μ = α/(α−1) = 1.4，方差 = α/[(α−1)²(α−2)]，σ ≈ 0.6110',
    fPareto15: 'μ = α/(α−1) = 3，方差 = <strong>无穷</strong>（α ≤ 2 时二阶矩发散）',
    lgPdf: '理论密度 pdf', lgHist: '真采样直方图',
    s1warn15: '⚠ α = 1.5 时 σ = ∞：经典的中心极限定理<strong>不适用</strong>。它在第 4 步有一场专门的「失效展览」——不美化、不截尾，原样呈现。',
    s1hint: '记住这五个原料的形状。第 2 步你会选一种、把它的均值抽 1 万组，看钟形怎么从任意一种原料里长出来。',

    s2k: '第 2 步 · 抽样分布实验室',
    s2t: '主战场：选原料、拉样本量',
    s2e: '选定一种母分布，拖样本量 n（每组取 n 个求平均），一键抽 <strong>K = 10,000</strong> 组样本均值：直方图 + 理论正态曲线 <strong>N(μ, σ/√n)</strong> 叠画。看三件事：中心钉在 μ、宽度按 σ/√n 变、钟形从任意原料里长出来。特别地，<strong>n = 1 时直方图就是母分布本身</strong>——钟形是「平均」这个动作造出来的，不是原料自带的。',
    nLab: '每组样本量 n',
    runLab: '一键抽 10,000 组样本均值',
    s2ro: 'n = {n} · 已抽 <span>{K}</span> 组 · 经验均值 <span>{mean}</span> vs 理论 μ = {mu} · 经验标准差 <span>{std}</span> vs 理论 σ/√n = <span>{tstd}</span> · 比值 <span>{ratio}</span>（理论 1.00）· 种子 {seed}',
    s2n1note: 'n = 1：直方图就是母分布本身——形状原样，没有任何钟形。',
    s2infNote: 'σ = ∞：没有理论正态曲线可叠（N(μ, ∞) 不存在）。直方图由真采样累积——看它有多野，这正是第 4 步要讲的。再说一句读数里的经验标准差：它有样本就能算、永远是个有限的数，但它<strong>不收敛</strong>——样本越多，它只会飘得越远、不会稳定到任何值上，所以理论那一栏只能写 ∞。',
    foldR: '{c} 个出窗 · 折入右缘柱 →',
    foldL: '← {c} 个出窗 · 折入左缘柱',
    lgMeanHist: '样本均值的直方图', lgNorm: '理论正态 N(μ, σ/√n)', lgMu: 'μ',
    s2hint: '切 n 时钟形当场变窄/变宽，中心纹丝不动。经验标准差与理论 σ/√n 的比值，在 1.00 附近统计波动——这正是定理的第二句话。',

    s3k: '第 3 步 · 精度的代价',
    s3t: 'σ/√n 是条铁律',
    s3e: '把多档 n 的经验标准差连成 log-log 图，看它落在斜率 <strong>−1/2</strong> 的理论线 σ·n^(−1/2) 上。想误差减半？样本量要 ×4。蒙特卡洛页的「想多准一位、撒 100 倍点」是同一条铁律的另一张脸——<a class="fourier-link" href="../montecarlo/#step2">回蒙特卡洛页看看</a>。',
    s3runAll: '一次跑完 n = 1 … 100（每档 4000 组）',
    s3ro: '最小二乘拟合斜率 <span>{slope}</span>（理论 −0.50）· n 与 4n 实测标准差之比 <span>{ratio}</span>（理论 0.50）· 种子 {seed}',
    cardHalfT: '误差减半', cardHalfD: '样本量 × 4',
    cardTenT: '精度 × 10', cardTenD: '样本量 × 100',
    cNX: '样本量 n（对数轴）', cStdY: '样本均值的标准差（对数轴）',
    lgEmp: '实测标准差', lgTheory: '理论 σ·n^(−1/2)',
    s3hint: '拟合斜率在 −0.5 附近统计波动——这是蒙特卡洛页 1/√N 铁律在「平均」上的版本。精度是买来的，按平方定价。',

    s4k: '第 4 步 · 慢的与坏的',
    s4t: '诚实展览角：磨得慢的，和磨不出来的',
    s4e: '左：<strong>指数分布</strong>，n = 2 / 5 / 10 / 30——偏态被一点点磨平的现场。偏态越重、需要的 n 越大，「n ≥ 30 就够」只是经验法则、不是定律。右：<strong>帕累托 α = 1.5</strong>——方差无穷，经典的中心极限定理<strong>不适用</strong>：n 拉到 100，均值直方图依然野，单个极端值能把整组平均拽走。它不趋向正态——会收敛到另一种稳定分布（点名而已，不展开）。',
    s4lt: '慢：指数分布——偏态被磨平',
    n2: 'n = 2', n5: 'n = 5', n10: 'n = 10', n30: 'n = 30', n100: 'n = 100',
    s4lro: '经验偏度 <span>{sk}</span> · 理论偏度 2/√n = <span>{tsk}</span> · 经验标准差 <span>{std}</span> vs σ/√n = <span>{tstd}</span> · {K} 组，种子 {seed}',
    s4rt: '坏：帕累托 α = 1.5——方差无穷，定理下班',
    s4rro: '经验均值 <span>{mean}</span>（理论 μ = 3）· 本批最大单值 <span>{max}</span> · 去掉这一个极端值后均值 <span>{meanWo}</span> · 经验标准差 <span>{std}</span>（理论 σ = ∞——这个数字没有意义）· {K} 组，种子 {seed}',
    s4warn: '⚠ 诚实声明：<strong>经典中心极限定理要求母分布方差有限。</strong>帕累托 α ≤ 2 时二阶矩发散，均值没有「σ/√n」的收缩律。本页所有「趋向正态」的表述，都默认方差有限——这句话是定理的一部分，不是脚注。',
    s4hint: '左图看「慢」：偏态 2 的指数分布，n = 30 才勉强像钟。右图看「坏」：方差无穷时，直方图不收敛、不美化、不截尾——原样呈现。',

    s5k: '第 5 步 · 为什么是钟形',
    s5t: '卷积阶梯：加法一遍遍磨出来的',
    s5e: '回链<a class="fourier-link" href="../convolution/#step3">卷积页</a>：和的分布 = 分布的<strong>卷积</strong>。看均匀分布自己和自己卷：n = 1 矩形 → n = 2 三角形 → n = 3 圆润小山 → n = 5、10 逼近钟形。每级都是数值卷积真算（网格 dx = 0.002 的分段常数密度逐级离散卷积，积分恒为 1），虚线是同参数正态 N(nμ, nσ²) 对照。钟形不是被假设出来的，是「加法」这个动作一遍遍磨出来的。',
    n3: 'n = 3',
    s5ro: 'n = {n}：卷积得到的和的密度峰值 <span>{peak}</span> · 与同参数正态虚线的最大偏差 <span>{dev}</span> · n = 2 时抽点：pdf(1) = <span>{p2}</span>（解析 1.000）',
    lgConv: '卷积得到的和的密度', lgNormSum: '正态 N(nμ, nσ²)',
    s5hint: '更深的解释走特征函数/矩母函数路线（每个分布的特征函数相乘、取对数后二次项主导），这里只留个路标——动手摸过阶梯的人，看到公式时会点头。',

    s6k: '第 6 步 · 终章',
    s6t: '样本量计算器：民调 ±3% 的出身',
    s6e: '场景：想估计一个均值/比例，要求误差不超过 <strong>±E</strong>、<strong>95%</strong> 置信。公式：<strong>n = ⌈(zσ/E)²⌉</strong>（z = 1.96）。算完不算完——当场真跑 K 组验证覆盖率，实测比例如实呈现（约在 95% 上下统计波动，<strong>不是</strong>恰好 95.00%）。经典数字：民调里常说的 n ≈ 1067，来自 E = 3%、σ = 0.5：(1.96×0.5/0.03)² = 1067.11，按四舍五入得 1067、向上取整得 1068——口径不同，差的只是这一个。',
    prePoll: '预置：民调比例（σ = 0.5，p = 0.5）',
    preUniform: '预置：均匀原料', preExp: '预置：指数原料',
    vBern: '验证分布：伯努利比例（p = 0.5）', vUniform: '验证分布：缩放均匀（标准差恰为 σ）', vExp: '验证分布：缩放指数（标准差恰为 σ）',
    sigLab: '标准差 σ（对数刻度）', eLab: '目标半宽 E（对数刻度）',
    calcBtn: '算样本量并真跑验证',
    s6ro: 'n = ⌈(1.96×{sig}/{e})²⌉ = ⌈{raw}⌉ = <span>{n}</span> · 真跑 <span>{K}</span> 组：落在 μ ± E 内的 <span>{hits}</span> 组 · 实测覆盖率 <span>{cov}</span>（目标 95%）· 种子 {seed}',
    s6stale: '参数已变，刚才的验证已作废——点「算样本量并真跑验证」，按新参数重新算、重新跑。',
    lgBand: 'μ ± E 区间', lgVerHist: '验证样本均值的直方图',
    app1t: '测量误差平均', app1d: '尺子抖、仪器漂——单次测量误差再大，平均 100 次，误差按 σ/√n 缩小。',
    app2t: '质控抽检', app2d: '抽一箱零件测均值判整批是否合格——抽样分布就是这张钟形图，合格线画在钟上。',
    app3t: 'A/B 实验样本量', app3d: '想测出 1% 的转化提升？先算 σ、定 E，n = (zσ/E)² 告诉你得跑多少流量——跑不够的实验，结论全是噪音。',
    s6fin: '<strong>收束。</strong>先有 σ/√n，后有「误差范围」——新闻里的每一个 ±，都是这一页的公式在上班。想回看「误差按 1/√N 收缩」的另一面，去<a class="fourier-link" href="../montecarlo/#step2">蒙特卡洛页</a>；想看「和的分布 = 分布的卷积」的另一面，去<a class="fourier-link" href="../convolution/#step3">卷积页</a>。',
    s6linkIdx: '← 回知识索引'
  },
  en: {
    docTitle: 'Central Limit Theorem · Averages Always Become Bell-Shaped · Step by Step',
    back: '← Knowledge Index',
    pageTitle: 'Central Limit Theorem',
    tagline: 'Whatever a single random variable looks like — flat, skewed, bimodal — average enough of them and the result is always bell-shaped. Roll the dice yourself, swap parent distributions, drag the sample size, and verify three things live: the center of the average never moves, its spread shrinks as σ/√n, and the shape is independent of the parent (condition: finite variance).',
    nav0: '0 Hook', nav1: '1 Parent Gallery', nav2: '2 Sampling Lab', nav3: '3 Price of Precision',
    nav4: '4 Slow & Broken', nav5: '5 Convolution Ladder', nav6: '6 Sample-Size Calculator',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Central Limit Theorem CLT —— a step-by-step interactive series',
    reset: 'Reset', newSeed: 'New seed', dash: '—',

    s0k: 'Step 0 · Hook',
    s0t: 'The Metamorphosis of Dice Averages',
    s0e: 'A dice machine. Roll <strong>1 die</strong>: the histogram is flat (1–6 equally likely). Switch to the <strong>average of 2 dice</strong>: it starts to hump; <strong>5 dice</strong>, <strong>30 dice</strong>: a bell curve rises from the ground, its center forever pinned at 3.5. A single die has nothing bell-shaped about it, yet averaging conjures the bell — the most magical theorem in all of probability.',
    dice1: '1 die', dice2: 'Average of 2', dice5: 'Average of 5', dice30: 'Average of 30',
    s0run: 'Roll continuously (stops at 20k groups)',
    s0ro: '{k} dice per group · <span>{K}</span> group means so far · empirical mean <span>{mean}</span> (theory μ = 3.5) · empirical std <span>{std}</span> · theory σ/√k = <span>{tstd}</span> · seed {seed}',
    cHist: 'Histogram of sample means', cMuLine: 'μ = 3.5 (center never moves)',
    s0hint: 'Watch two things: ① the shape goes from flat to bell; ② the center stays 3.5 while the width keeps shrinking. Step 2 turns this into a lab; step 3 measures how fast it shrinks.',

    s1k: 'Step 1 · Parent Gallery',
    s1t: 'Parents of Every Shape',
    s1e: 'Put the "raw material" (parent distributions) on stage one by one: flat, skewed, bimodal, discrete, heavy-tailed. Each comes with the <strong>source formula</strong> of its theoretical mean μ and standard deviation σ — every theory curve later is drawn from exactly these numbers, never from empirical estimates. The weirder the raw material, the better: the theorem\'s power is that it barely cares about the raw material.',
    pUniform: 'Uniform U(0, 1)', pExp: 'Exponential Exp(1)', pBimodal: 'Bimodal (two-Gaussian mixture)',
    pDice: 'Die (1–6)', pPareto: 'Pareto(α)',
    alpha15: 'α = 1.5 (infinite variance)', alpha35: 'α = 3.5 (finite variance)',
    s1ro: 'Theory μ = <span>{mu}</span> · theory σ = <span>{sigma}</span> · formula: {formula} · histogram from 20k true draws, seed {seed}',
    fUniform: 'μ = (a+b)/2 = 0.5, σ = (b−a)/√12 ≈ 0.2887',
    fExp: 'μ = 1/λ = 1, σ = 1/λ = 1',
    fBimodal: 'mixture μ = Σwᵢμᵢ = 3.5, variance = Σwᵢ(σᵢ²+μᵢ²) − μ² = 2.61, σ ≈ 1.6155',
    fDice: 'μ = (1+2+⋯+6)/6 = 3.5, σ² = 35/12, σ ≈ 1.7078',
    fPareto35: 'μ = α/(α−1) = 1.4, variance = α/[(α−1)²(α−2)], σ ≈ 0.6110',
    fPareto15: 'μ = α/(α−1) = 3, variance = <strong>infinite</strong> (second moment diverges for α ≤ 2)',
    lgPdf: 'Theory pdf', lgHist: 'True-sample histogram',
    s1warn15: '⚠ At α = 1.5, σ = ∞: the classical central limit theorem <strong>does not apply</strong>. It gets its own "failure exhibit" in step 4 — presented raw, untrimmed, unprettified.',
    s1hint: 'Memorize these five shapes. In step 2 you will pick one, draw 10k groups of means, and watch the bell grow out of any of them.',

    s2k: 'Step 2 · Sampling Lab',
    s2t: 'The Main Arena: Pick a Parent, Drag the Sample Size',
    s2e: 'Fix a parent distribution, drag the sample size n (average n draws per group), and draw <strong>K = 10,000</strong> group means in one click: histogram + theory normal curve <strong>N(μ, σ/√n)</strong> overlaid. Watch three things: the center pinned at μ, the width changing as σ/√n, the bell growing out of any parent. Note especially: <strong>at n = 1 the histogram is just the parent itself</strong> — the bell is manufactured by the act of averaging, not inherited from the raw material.',
    nLab: 'Sample size per group n',
    runLab: 'Draw 10,000 group means',
    s2ro: 'n = {n} · <span>{K}</span> groups drawn · empirical mean <span>{mean}</span> vs theory μ = {mu} · empirical std <span>{std}</span> vs theory σ/√n = <span>{tstd}</span> · ratio <span>{ratio}</span> (theory 1.00) · seed {seed}',
    s2n1note: 'n = 1: the histogram is the parent itself — the shape as-is, nothing bell-shaped.',
    s2infNote: 'σ = ∞: there is no theory normal curve to overlay (N(μ, ∞) does not exist). The histogram is accumulated from true draws — see how wild it is; that is what step 4 is about. One more word on the empirical std in the readout: it can always be computed from samples and is always a finite number, but it <strong>does not converge</strong> — the more you sample, the further it wanders instead of settling on any value — which is why the theory column can only say ∞.',
    foldR: '{c} out of window · folded into right-edge bar →',
    foldL: '← {c} out of window · folded into left-edge bar',
    lgMeanHist: 'Histogram of group means', lgNorm: 'Theory normal N(μ, σ/√n)', lgMu: 'μ',
    s2hint: 'Dragging n narrows or widens the bell on the spot while the center never moves. The empirical-std-to-theory ratio fluctuates statistically around 1.00 — that is the theorem\'s second sentence.',

    s3k: 'Step 3 · Price of Precision',
    s3t: 'σ/√n Is an Iron Law',
    s3e: 'Connect the empirical standard deviations at many n on a log-log plot and watch them land on the theory line σ·n^(−1/2) with slope <strong>−1/2</strong>. Want to halve the error? Multiply the sample size by 4. The Monte Carlo page\'s "one more digit costs 100× the points" is the same iron law wearing another face — <a class="fourier-link" href="../montecarlo/#step2">revisit the Monte Carlo page</a>.',
    s3runAll: 'Run n = 1 … 100 in one go (4,000 groups each)',
    s3ro: 'Least-squares fitted slope <span>{slope}</span> (theory −0.50) · measured std ratio between n and 4n <span>{ratio}</span> (theory 0.50) · seed {seed}',
    cardHalfT: 'Halve the error', cardHalfD: 'Sample size × 4',
    cardTenT: '10× the precision', cardTenD: 'Sample size × 100',
    cNX: 'Sample size n (log axis)', cStdY: 'Std of group means (log axis)',
    lgEmp: 'Measured std', lgTheory: 'Theory σ·n^(−1/2)',
    s3hint: 'The fitted slope fluctuates statistically around −0.5 — the Monte Carlo page\'s 1/√N iron law, in averaging form. Precision is bought, priced by the square.',

    s4k: 'Step 4 · Slow & Broken',
    s4t: 'The Honesty Exhibit: Slow to Converge, and Failing Entirely',
    s4e: 'Left: the <strong>exponential distribution</strong>, n = 2 / 5 / 10 / 30 — skewness being ground away, live. The more skewed the parent, the larger the n needed; "n ≥ 30 suffices" is a rule of thumb, not a law. Right: <strong>Pareto α = 1.5</strong> — infinite variance, so the classical central limit theorem <strong>does not apply</strong>: at n = 100 the mean histogram is still wild, and one extreme draw can drag the whole group\'s average with it. It does not head for the normal — it converges to a different stable distribution (named, not unfolded).',
    s4lt: 'Slow: exponential — skewness ground away',
    n2: 'n = 2', n5: 'n = 5', n10: 'n = 10', n30: 'n = 30', n100: 'n = 100',
    s4lro: 'Empirical skewness <span>{sk}</span> · theory skewness 2/√n = <span>{tsk}</span> · empirical std <span>{std}</span> vs σ/√n = <span>{tstd}</span> · {K} groups, seed {seed}',
    s4rt: 'Broken: Pareto α = 1.5 — infinite variance, theorem off duty',
    s4rro: 'Empirical mean <span>{mean}</span> (theory μ = 3) · largest single draw in batch <span>{max}</span> · mean without that extreme draw <span>{meanWo}</span> · empirical std <span>{std}</span> (theory σ = ∞ — this number is meaningless) · {K} groups, seed {seed}',
    s4warn: '⚠ Honest declaration: the <strong>classical central limit theorem requires finite variance of the parent.</strong> For Pareto α ≤ 2 the second moment diverges and the mean has no σ/√n shrinkage law. Every "tends to normal" claim on this page assumes finite variance — that sentence is part of the theorem, not a footnote.',
    s4hint: 'Left, watch "slow": a skewness-2 exponential only starts looking like a bell around n = 30. Right, watch "broken": with infinite variance the histogram does not converge — untrimmed, unprettified, as-is.',

    s5k: 'Step 5 · Convolution Ladder',
    s5t: 'Why the Bell: Ground Out by Repeated Addition',
    s5e: 'Back to the <a class="fourier-link" href="../convolution/#step3">convolution page</a>: the distribution of a sum is the <strong>convolution</strong> of the distributions. Watch a uniform convolve with itself: n = 1 rectangle → n = 2 triangle → n = 3 a rounded hill → n = 5, 10 approaching the bell. Every level is a true numerical convolution (piecewise-constant densities on a dx = 0.002 grid, convolved level by level; the integral stays 1); the dashed line is the same-parameter normal N(nμ, nσ²) for comparison. The bell is not assumed — it is what the act of adding grinds out.',
    n3: 'n = 3',
    s5ro: 'n = {n}: convolved sum density peak <span>{peak}</span> · max deviation from the same-parameter normal <span>{dev}</span> · spot check at n = 2: pdf(1) = <span>{p2}</span> (analytic 1.000)',
    lgConv: 'Convolved density of the sum', lgNormSum: 'Normal N(nμ, nσ²)',
    s5hint: 'The deeper route goes through characteristic functions (multiply, take the log, the quadratic term dominates) — left here as a signpost; anyone who has climbed the ladder will nod when they see the formula.',

    s6k: 'Step 6 · Finale',
    s6t: 'Sample-Size Calculator: Where the Polls\' ±3% Comes From',
    s6e: 'Scenario: estimating a mean or a proportion, wanting error within <strong>±E</strong> at <strong>95%</strong> confidence. The formula: <strong>n = ⌈(zσ/E)²⌉</strong> (z = 1.96). Computing it is only half the job — we then really run K groups and read the coverage honestly (fluctuating statistically around 95%, <strong>not</strong> exactly 95.00%). The classic number: polls citing n ≈ 1067 come from E = 3%, σ = 0.5: (1.96×0.5/0.03)² = 1067.11 — rounds to 1067, ceilings to 1068. Different convention, off by one.',
    prePoll: 'Preset: poll proportion (σ = 0.5, p = 0.5)',
    preUniform: 'Preset: uniform parent', preExp: 'Preset: exponential parent',
    vBern: 'Verification distribution: Bernoulli proportion (p = 0.5)', vUniform: 'Verification distribution: scaled uniform (std exactly σ)', vExp: 'Verification distribution: scaled exponential (std exactly σ)',
    sigLab: 'Standard deviation σ (log scale)', eLab: 'Target half-width E (log scale)',
    calcBtn: 'Compute n and verify by simulation',
    s6ro: 'n = ⌈(1.96×{sig}/{e})²⌉ = ⌈{raw}⌉ = <span>{n}</span> · really ran <span>{K}</span> groups: <span>{hits}</span> inside μ ± E · measured coverage <span>{cov}</span> (target 95%) · seed {seed}',
    s6stale: 'Parameters changed — the verification above no longer applies. Click "Compute n and verify by simulation" to recompute and re-run with the new settings.',
    lgBand: 'μ ± E band', lgVerHist: 'Histogram of verification means',
    app1t: 'Averaging measurement error', app1d: 'The ruler shakes, the instrument drifts — however noisy a single reading, average 100 readings and the error shrinks as σ/√n.',
    app2t: 'Quality-control sampling', app2d: 'Sample a box of parts, judge the whole batch by the sample mean — the sampling distribution is this bell, with the pass line drawn on it.',
    app3t: 'A/B experiment sizing', app3d: 'Want to detect a 1% lift in conversion? Estimate σ, fix E, and n = (zσ/E)² tells you how much traffic you need — an underpowered experiment\'s conclusions are all noise.',
    s6fin: '<strong>To close.</strong> First came σ/√n, then came "margin of error" — every ± in the news is this page\'s formula on duty. For the other face of "error shrinks as 1/√N", visit the <a class="fourier-link" href="../montecarlo/#step2">Monte Carlo page</a>; for the other face of "a sum\'s distribution is the convolution of distributions", visit the <a class="fourier-link" href="../convolution/#step3">convolution page</a>.',
    s6linkIdx: '← Back to the index'
  }
};

/* ---------- 语言状态 ---------- */
let _lang = null;
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v; // 只认 zh/en 枚举，非法值（如 fr）回退默认推断
  } catch (e) { /* 忽略 */ }
  return null;
}
function saveLang(v) {
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
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
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
