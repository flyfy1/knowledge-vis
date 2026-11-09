'use strict';
// Convolution lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '卷积 · 从一次回响推出全部输出',
    back: '← 知识索引',
    compare: '对照另一版本：卷积 · 一步一交互 →',
    navLabel: '卷积步骤导航',
    tagline: '对一个系统拍一下手，记下它的回响 h。只凭这一条记录，能不能算出它对任何输入的反应？能，算法就叫卷积。七步里你会亲手拼出这条规则，再看它怎样把噪声抹平，又怎样在频率上变成一次乘法。',
    nav0: '0 一次拍手', nav1: '1 叠加回响', nav2: '2 读一个输出', nav3: '3 平滑', nav4: '4 连续卷积', nav5: '5 频率', nav6: '6 收束',

    s0k: '第 0 步 · 已知什么',
    s0t: '换个时刻、换个力度再拍一下，回响会变成什么样？',
    s0e: '这一步要回答：已经知道系统对「一次标准拍手」的回应，能不能直接写出它对「晚一点、重一点的拍手」的回应？本页的信号都是<strong>离散序列</strong>：每隔固定时间取一个数，第 n 个记作 x[n]。<strong>单位冲激</strong> δ[n] 就是那次标准拍手：只在 n = 0 处等于 1，其余处都是 0。系统对它的输出叫<strong>冲激响应</strong>，记作 h[n]（<a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ LTI 系统页第 2 步：怎样录下 h，再用它拼出输出</a>）。这里的 h 是一段衰减的回响：h = [1, 0.6, 0.3]，n ≥ 3 以后为 0。我们假设系统满足两条：<strong>线性</strong>（输入放大 a 倍，输出也放大 a 倍）和<strong>时不变</strong>（输入晚 k 步，输出只是整体晚 k 步，形状不变）。',
    clickPos: '拍手时刻 k', clickAmp: '拍手力度 a',
    s0lgIn: '输入 a·δ[n−k]', s0lgOut: '输出 y[n]', s0lgRef: '已知的 h[n]（k = 0、a = 1）',
    c0top: '输入：一次拍手', c0bot: '输出：回响 y[n]',
    s0readout: '输入 = {a} · δ[n − {k}]　→　输出在 n = {n0}、{n1}、{n2} 处为 {y0}、{y1}、{y2}，其余为 0。这正是 {a} · h[n − {k}]：回响整体右移 {k} 步、每根都乘 {a}。',
    s0hint: '观察顺序：先只拖「拍手时刻」，看下图青色回响整体平移、形状不变；再只拖「拍手力度」，看三根竖线按同一比例一起伸缩（a 为负时整体翻到零线下方）。灰色虚线是已知的 h，留作对照。',

    s1k: '第 1 步 · 不止一次拍手',
    s1t: '连拍好几下，几条回响是怎样合成输出的？',
    s1e: '这一步要回答：输入不再是一次拍手，而是一串数 x[0], …, x[4]，输出是什么？任何这样的序列都能看成<strong>五次拍手</strong>：第 k 次发生在时刻 k，力度是 x[k]。按上一步，每次拍手各自留下一条回响 x[k] · h[n − k]（h 是冲激响应，即标准拍手的回响）；线性保证这几条回响可以直接相加。所以输出是它们的和：<strong>y[n] = Σₖ x[k] · h[n − k]</strong>。这个运算叫<strong>卷积</strong>，写作 y = x ∗ h。下图每种颜色是一次拍手和它留下的回响；同一列里正的往上叠、负的往下叠，白色圆点是这一列的净和 y[n]。',
    xk: 'x[{k}]',
    addCopies: '逐条叠加回响', showAll: '全部显示',
    c1top: '输入 x[k]：每种颜色是一次拍手', c1bot: '输出：各条回响叠在一起',
    s1lgNet: '白点 = 这一列的净和 y[n]',
    s1progress: '已叠加 {c}/{N} 条回响。',
    s1readout: '{prog}输出 y = [{y}]，n = 0 到 {last}，共 {L} 个样本。',
    s1hint: '观察顺序：先按「逐条叠加回响」，看每种新颜色落在它那次拍手之后的三格里，白点随之改变；再拖某一个 x[k]，只有那一种颜色的三段跟着变。下一步用的就是你在这里设好的输入。',

    s2k: '第 2 步 · 按列读',
    s2t: '只想要某一个输出 y[n]，该把哪几对数相乘？',
    s2e: '这一步要回答：不画出全部回响，怎样直接算出某一时刻的输出 y[n]？回到上一步的那一列：时刻 n 收到的是「k 时刻拍手、已经过去 n − k 步」的那一份回响 x[k] · h[n − k]。h（冲激响应）只在 0、1、2 处不为 0，所以只有 k = n、n − 1、n − 2 三次拍手有贡献。把 h[n − k] 当作 k 的函数画出来，就是 h <strong>左右翻转</strong>再<strong>平移到 n</strong>：h[0] 落在 k = n，h[1] 落在 k = n − 1，h[2] 落在 k = n − 2。所以「翻转、滑动、对齐相乘、求和」不是另一条规则，只是按列去读同一个求和。序列范围以外的 x、h 都按 0 处理（<strong>零延拓</strong>）。',
    nSlider: '输出时刻 n', sweepN: '从 n = −2 扫到 8',
    c2a: 'x[k]，以及翻转平移后的 h[n−k]', c2b: '逐格乘积 x[k]·h[n−k]', c2c: '已经算过的 y[n]',
    s2lgX: 'x[k]（你在第 1 步设的输入）', s2lgH: '翻转后的 h[n−k]', s2lgP: '乘积', s2lgY: 'y[n]',
    s2readout: 'y[{n}] = {terms} = {y}',
    s2none: 'y[{n}]：翻转后的 h 和 x 没有重叠，所有乘积都是 0，y[{n}] = 0',
    s2progress: '已算 {c}/{N} 个时刻 · ',
    quizPrompt: '想一想：x 有 5 个样本、h 有 3 个样本，y = x ∗ h 最多有几个非零样本？',
    quizA: '5 个：和 x 一样长', quizB: '7 个：5 + 3 − 1', quizC: '15 个：5 × 3',
    check: '核对', correct: '对。翻转的 h 从刚碰到 x 的第一个样本（n = 0）滑到刚离开最后一个样本（n = 6），一共 5 + 3 − 1 = 7 个位置有重叠。把 n 拖到 −1 和 7，可以看到两端都已没有重叠。',
    wrong: '再看看：数一数翻转的 h 和 x 至少有一格重叠的 n 有几个。把 n 拖到两端试试。',
    s2hint: '观察顺序：拖 n，看橙色空心圈（翻转后的 h）在 x 上滑动；中图绿色是逐格乘积，下图记下每个已经算过的 y[n]。对照第 1 步：同一个 n 那一列的彩色段，正是这里的几个乘积。按扫描按钮会从 n = −2 自动走到 8。',

    s3k: '第 3 步 · 第一个用途',
    s3t: '把核加宽，噪声变小了，边缘为什么也变钝了？',
    s3e: '这一步要回答：用卷积平滑带噪声的数据时，核的宽度换来了什么、又付出了什么？这里把 h 换成<strong>滑动平均核</strong>：w 个样本，每个都等于 1/w，并以 0 为中心（所以输出不会整体延迟）。和它做卷积，就是把每个点换成它周围 w 个点的平均。数据是模拟的：一段干净的台阶（灰色虚线，在 n = 60 升到 1，n = 180 落回 0）加上彼此独立的随机噪声（标准差 0.3）。卷积是线性的，所以输出可以拆成「平滑后的台阶」与「平滑后的噪声」两部分分开量：<strong>噪声残余</strong> = 平滑后噪声的均方根 ÷ 原噪声的均方根（均方根：先平方、再平均、再开方，衡量起伏有多大；越小越平滑）；<strong>边缘斜坡</strong> = 平滑后的台阶在上升沿处，偏离 0 和 1 都超过 0.02 的样本个数（越少越陡）。',
    width: '核宽 w（样本数）', reroll: '换一组噪声', clearHist: '清除记录',
    c3a: '原始数据、干净台阶与平滑输出', c3b: '噪声残余（实测点、1/√w 曲线）', c3c: '边缘斜坡长度（样本）',
    s3lgRaw: '原始数据', s3lgClean: '干净台阶', s3lgOut: '平滑输出', s3lgTheory: '1/√w',
    s3readout: '第 {set}/5 组噪声 · w = {w}：噪声残余 实测 {r} · 估算 1/√w = {rt}　｜　边缘斜坡 {e} 个样本（w − 1 = {wm1}）',
    s3hint: '观察顺序：只拖 w，从 1 拖到 15。左图看青色输出：平的地方越来越平，两条台阶边越来越斜。右图记下每个试过的 w：上半是噪声残余（点为实测，曲线为 1/√w），下半是斜坡长度。斜坡恰好是 w − 1 个样本：窗口跨在台阶上的位置正好有 w − 1 个。1/√w 来自「w 个独立噪声取平均，标准差缩小到 1/√w」，只对独立噪声成立，而且说的是平均意义；单次模拟会在曲线附近上下散开。按「换一组噪声」对比：在本页这 5 组噪声、w = 3 到 15 下，实测是估算的 0.91–1.21 倍。',

    s4k: '第 4 步 · 从求和到积分',
    s4t: '信号是连续曲线时，y(t) 是什么？',
    s4e: '这一步要回答：时间不再一格一格，而是连续的 t，卷积怎么算？求和变成积分：<strong>y(t) = ∫ f(τ) · g(t − τ) dτ</strong>。τ（读作 tau）是积分用的时间变量，扮演第 2 步里 k 的角色；g(t − τ) 作为 τ 的函数，同样是 g 左右翻转、再平移到 t。这里 f 是高 1、宽 1 的矩形（青色，0 ≤ τ ≤ 1）；g 可选矩形或斜坡，宽为 b。f 在自己的范围内处处等于 1，所以乘积 f(τ)·g(t − τ) 就是翻转后的 g 落在 0 到 1 之间的那一段，y(t) 就是这一段的<strong>面积</strong>（绿色阴影）。',
    tSlider: '平移量 t', bSlider: 'g 的宽度 b', shapeBox: 'g = 矩形', shapeRamp: 'g = 斜坡（起点高、终点 0）', sweepT: '从左到右扫一遍 t',
    c4a: 'f(τ) 与翻转平移后的 g(t−τ)', c4b: 'y(t) = 重叠面积',
    s4lgF: 'f(τ)', s4lgG: 'g(t−τ)', s4lgA: '重叠部分（面积 = y(t)）', s4lgY: '已描出的 y(t)',
    s4ov: '重叠区间 τ ∈ [{lo}, {hi}]，面积 y(t) = {y}', s4nov: '翻转后的 g 和 f 没有重叠，y(t) = 0',
    s4readout: 't = {t}：{ov}　｜　整条 y(t)：非零范围 0 < t < {end}（= 1 + b）· 最高 {peak} · 顶部平台长 {flat} · 曲线下总面积 {total}（= f 的面积 1 × g 的面积 {ga}）',
    s4hint: '观察顺序：先选矩形、b = 1，拖 t 从左到右：重叠面积先线性增大再线性减小，下图描出一个三角形。再把 b 改成 0.5 或 2：顶部变成一段平台，长度是 |1 − b|，高度是两个宽度里较小的那个。最后换成斜坡：翻转后斜坡的高端在右边，下图曲线不再左右对称，翻转的效果在这里看得见。改 b 或换形状会清掉已描的曲线。',

    s5k: '第 5 步 · 换到频率',
    s5t: '同一个平均核，为什么能把某些频率完全抹掉？',
    s5e: '这一步要回答：把一条纯余弦波送进第 3 步的滑动平均核（w 个样本、每个 1/w），出来的是什么？<strong>频率 f</strong> 在这里按「每个样本走过几个周期」计，单位是周期/样本，范围 0 到 0.5（0.5 表示两个样本一个周期，是离散序列能表示的最快振荡）。结果：出来的仍是同一频率的余弦，只是振幅乘了一个随频率变化的系数 H(f)，这个系数叫<strong>频率响应</strong>（<a class="xlink" href="../../../signal/systems/frequency-response/#step0">→ 频率响应页第 0 步：系统怎样按频率挑选</a>）。对宽 w 的平均核，H(f) = sin(πfw) / (w·sin(πf))：f 正好是 1/w 的整数倍时，窗口里恰好装下整数个周期，正负相抵，平均为 0。任何信号都能拆成许多余弦之和（<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶页第 5 步：从波形到频谱</a>），每个成分各自乘上自己的 H(f)。所以<strong>时域里的卷积，到了频域就是逐个频率相乘</strong>：Y(f) = X(f) · H(f)，这就是卷积定理。',
    fSlider: '输入频率 f（周期/样本）', wSlider5: '核宽 w（样本数）',
    c5a: '输入与输出（取长输入中段 n = 100–163）', c5b: '增益：输出振幅 ÷ 输入振幅',
    s5lgIn: '输入 cos(2πfn)', s5lgOut: '输出', s5lgCurve: '公式 |H(f)|', s5lgDot: '实测（每个试过的 f）',
    s5readout: 'w = {w}，f = {f}：输出振幅 ÷ 输入振幅 实测 {m} · 公式 |H(f)| = {h}{note}',
    flipNote: ' · H(f) < 0：输出与输入反相（波峰对波谷）',
    zeroNote: ' · 输出振幅不到输入的 0.1%：这个频率几乎被完全抹掉',
    s5hint: '观察顺序：保持 w = 5，把 f 从 0 慢慢拖到 0.5。左图灰色是输入，青色是输出（取一段很长输入的中段，避开两端补零的影响）；右图每个试过的 f 留下一个实测点，曲线是公式。f = 0.2 和 0.4 时输出变成一条平线。再换 w，零点移到 1/w 的整数倍（换 w 会清掉实测点）。实测振幅是对输出做余弦、正弦拟合得到的，没有用到公式。',

    s6k: '第 6 步 · 收束', s6t: '知道 h，就知道这个系统对一切输入的回答',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，线性 + 时不变让一次拍手的回响可以平移、缩放；<strong>第 1 步</strong>，任何输入都是一串拍手，输出是各条回响之和，这就是卷积；<strong>第 2 步</strong>，按列读同一个和，就是「翻转、滑动、相乘、求和」，输出长度是 N + M − 1；<strong>第 3 步</strong>，平均核用边缘变钝换噪声变小；<strong>第 4 步</strong>，连续时间里求和变积分，输出是重叠面积；<strong>第 5 步</strong>，到了频域，卷积变成逐个频率相乘。',
    formula: 'y[n] = Σₖ x[k]·h[n−k]\ny(t) = ∫ f(τ)·g(t−τ) dτ\nY(f) = X(f)·H(f)',
    boundary: '适用范围：本页的卷积是有限长实数序列的完整线性卷积，序列以外按 0 处理；「知道 h 就知道一切」只对线性时不变系统成立。用 DFT 做的是循环卷积，两端会绕回来相加，补足零以后才和线性卷积相同。相关运算不翻转核；卷积神经网络里的「卷积」按惯例也不翻转（严格说是相关）。第 3 步的噪声是模拟的独立高斯噪声，1/√w 只对独立噪声、在平均意义上成立。',
    linksTitle: '接着去哪儿',
    lk1: '→ LTI 系统页第 2 步：录下冲激响应，再用它拼出输出',
    lk2: '→ 中心极限定理页第 5 步：随机变量之和的分布，就是分布的卷积',
    lk3: '→ 卷积神经网络页第 0 步：二维小窗口在图像上做加权和',
    lk4: '→ 傅里叶页第 5 步：从波形到频谱',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《卷积 · 一步一交互》的平行版本。'
  },
  en: {
    pageTitle: 'Convolution · From One Echo to Every Output',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Convolution · One Interaction at a Time →',
    navLabel: 'Convolution steps',
    tagline: 'Clap once at a system and record its echo, h. From that single recording, can you predict how it answers any input at all? You can, and the recipe is called convolution. Over seven steps you will assemble the rule by hand, watch it smooth away noise, and see it turn into plain multiplication once you think in frequencies.',
    nav0: '0 One clap', nav1: '1 Echoes add', nav2: '2 One output', nav3: '3 Smoothing', nav4: '4 Continuous', nav5: '5 Frequency', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What we know',
    s0t: 'Clap later, or harder: what happens to the echo?',
    s0e: 'This step asks: if we know how the system answers one standard clap, can we write down its answer to a clap that comes later and louder? Every signal on this page is a <strong>discrete sequence</strong>: one number per fixed time tick, the n-th written x[n]. The <strong>unit impulse</strong> δ[n] is the standard clap: 1 at n = 0 and 0 everywhere else. The system’s output to it is the <strong>impulse response</strong>, h[n] (<a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ LTI systems, step 2: record h, then build outputs from it</a>). Here h is a fading echo: h = [1, 0.6, 0.3], and 0 from n = 3 on. We assume two properties. <strong>Linear</strong>: scale the input by a and the output scales by a. <strong>Time-invariant</strong>: delay the input by k ticks and the output is the same shape, just k ticks later.',
    clickPos: 'Clap time k', clickAmp: 'Clap strength a',
    s0lgIn: 'input a·δ[n−k]', s0lgOut: 'output y[n]', s0lgRef: 'known h[n] (k = 0, a = 1)',
    c0top: 'Input: one clap', c0bot: 'Output: the echo y[n]',
    s0readout: 'Input = {a} · δ[n − {k}]  →  output is {y0}, {y1}, {y2} at n = {n0}, {n1}, {n2} and 0 elsewhere. That is exactly {a} · h[n − {k}]: the whole echo moved right by {k} and every stem multiplied by {a}.',
    s0hint: 'What to try: drag only the clap time and watch the cyan echo slide without changing shape; then drag only the strength and watch all three stems stretch by the same factor (a negative a flips them below zero). The grey dashed stems are the known h, kept for comparison.',

    s1k: 'Step 1 · More than one clap',
    s1t: 'Clap several times: how do the echoes combine into the output?',
    s1e: 'This step asks: when the input is a whole sequence x[0], …, x[4] instead of one clap, what comes out? Any such sequence can be read as <strong>five claps</strong>: clap k happens at time k with strength x[k]. By step 0 each clap leaves its own echo x[k] · h[n − k] (h is the impulse response, the echo of the standard clap), and linearity lets those echoes simply add. So the output is their sum: <strong>y[n] = Σₖ x[k] · h[n − k]</strong>. That operation is <strong>convolution</strong>, written y = x ∗ h. In the picture each colour is one clap and the echo it leaves; within a column, positive pieces stack upward, negative ones downward, and the white dot is the column’s net total y[n].',
    xk: 'x[{k}]',
    addCopies: 'Add echoes one by one', showAll: 'Show all',
    c1top: 'Input x[k]: one colour per clap', c1bot: 'Output: the echoes stacked',
    s1lgNet: 'white dot = net total y[n] of that column',
    s1progress: '{c}/{N} echoes added. ',
    s1readout: '{prog}Output y = [{y}], n = 0 to {last}, {L} samples.',
    s1hint: 'What to try: press “Add echoes one by one” and watch each new colour land in the three slots right after its own clap, moving the white dots as it goes. Then drag a single x[k]: only that colour’s three pieces change. The next step uses the input you set here.',

    s2k: 'Step 2 · Read one column',
    s2t: 'If you want just one output y[n], which pairs do you multiply?',
    s2e: 'This step asks: how do we get the output at one moment directly, without drawing every echo? Go back to one column of step 1. At time n the output collects, from the clap at time k, the part of its echo that is n − k ticks old: x[k] · h[n − k]. The impulse response h is non-zero only at 0, 1 and 2, so only the claps at k = n, n − 1 and n − 2 contribute. Plot h[n − k] as a function of k and you get h <strong>flipped</strong> left-to-right and <strong>slid to n</strong>: h[0] sits at k = n, h[1] at k = n − 1, h[2] at k = n − 2. So “flip, slide, multiply, add” is not a second rule; it is the same sum read one column at a time. Values of x or h outside their ranges count as 0 (<strong>zero extension</strong>).',
    nSlider: 'Output time n', sweepN: 'Sweep n from −2 to 8',
    c2a: 'x[k] and the flipped, slid h[n−k]', c2b: 'Products x[k]·h[n−k]', c2c: 'y[n] computed so far',
    s2lgX: 'x[k] (the input you set in step 1)', s2lgH: 'flipped h[n−k]', s2lgP: 'products', s2lgY: 'y[n]',
    s2readout: 'y[{n}] = {terms} = {y}',
    s2none: 'y[{n}]: the flipped h does not overlap x, every product is 0, so y[{n}] = 0',
    s2progress: '{c}/{N} times computed · ',
    quizPrompt: 'Think first: x has 5 samples and h has 3. At most how many non-zero samples can y = x ∗ h have?',
    quizA: '5: as long as x', quizB: '7: 5 + 3 − 1', quizC: '15: 5 × 3',
    check: 'Check', correct: 'Right. The flipped h first touches x’s first sample at n = 0 and last touches its final sample at n = 6: 5 + 3 − 1 = 7 positions with any overlap. Drag n to −1 and to 7 to see that both ends have no overlap left.',
    wrong: 'Look again: count the values of n where the flipped h overlaps x in at least one slot. Try dragging n to both ends.',
    s2hint: 'What to try: drag n and watch the hollow orange rings (the flipped h) slide along x; the green stems in the middle are the slot-by-slot products, and the bottom panel keeps every y[n] you have computed. Compare with step 1: the coloured pieces in column n there are exactly the products here. The sweep button walks n from −2 to 8 for you.',

    s3k: 'Step 3 · A first use',
    s3t: 'A wider kernel removes more noise. Why does it also blunt the edges?',
    s3e: 'This step asks: when we smooth noisy data by convolution, what does the kernel width buy us, and what does it cost? Here h becomes a <strong>moving-average kernel</strong>: w samples of 1/w each, centred on 0 so the output is not delayed. Convolving with it replaces every point by the average of the w points around it. The data are simulated: a clean step (grey dashes, up to 1 at n = 60 and back to 0 at n = 180) plus independent random noise with standard deviation 0.3. Convolution is linear, so the output splits into “smoothed step” plus “smoothed noise”, and we measure them separately. <strong>Noise left</strong> = RMS of the smoothed noise ÷ RMS of the original noise (RMS, root mean square: square, average, take the root; it measures how big the wiggles are; smaller is smoother). <strong>Edge ramp</strong> = how many samples of the smoothed step, at the rising edge, are more than 0.02 away from both 0 and 1 (fewer is sharper).',
    width: 'Kernel width w (samples)', reroll: 'New noise', clearHist: 'Clear history',
    c3a: 'Raw data, clean step and smoothed output', c3b: 'Noise left (dots measured, curve 1/√w)', c3c: 'Edge ramp length (samples)',
    s3lgRaw: 'raw data', s3lgClean: 'clean step', s3lgOut: 'smoothed output', s3lgTheory: '1/√w',
    s3readout: 'Noise set {set}/5 · w = {w}: noise left measured {r} · estimate 1/√w = {rt}  |  edge ramp {e} samples (w − 1 = {wm1})',
    s3hint: 'What to try: drag only w, from 1 to 15. On the left, watch the cyan output: flat stretches get flatter while both step edges lean over. The right chart keeps every w you try: noise left on top (dots measured, curve 1/√w), ramp length below. The ramp is exactly w − 1 samples long, because the window straddles the jump at exactly w − 1 positions. The 1/√w comes from “averaging w independent noise values shrinks their standard deviation to 1/√w”; it holds only for independent noise, and only on average, so a single run scatters around the curve. Press “New noise” to compare: over this page’s 5 noise sets and w = 3 to 15, the measured value is 0.91–1.21 times the estimate.',

    s4k: 'Step 4 · From sums to integrals',
    s4t: 'When signals are continuous curves, what is y(t)?',
    s4e: 'This step asks: once time is a continuous t rather than ticks, how is convolution computed? The sum becomes an integral: <strong>y(t) = ∫ f(τ) · g(t − τ) dτ</strong>. τ (tau) is the integration time variable, playing the part k played in step 2; as a function of τ, g(t − τ) is again g flipped left-to-right and slid to t. Here f is a rectangle of height 1 and width 1 (cyan, 0 ≤ τ ≤ 1); g is a rectangle or a ramp, of width b. Since f equals 1 everywhere on its range, the product f(τ)·g(t − τ) is just the part of the flipped g that lies between 0 and 1, and y(t) is that part’s <strong>area</strong> (green shading).',
    tSlider: 'Shift t', bSlider: 'Width of g, b', shapeBox: 'g = rectangle', shapeRamp: 'g = ramp (high start, falls to 0)', sweepT: 'Sweep t left to right',
    c4a: 'f(τ) and the flipped, slid g(t−τ)', c4b: 'y(t) = overlap area',
    s4lgF: 'f(τ)', s4lgG: 'g(t−τ)', s4lgA: 'overlap (area = y(t))', s4lgY: 'y(t) traced so far',
    s4ov: 'overlap τ ∈ [{lo}, {hi}], area y(t) = {y}', s4nov: 'the flipped g does not overlap f, so y(t) = 0',
    s4readout: 't = {t}: {ov}  |  whole y(t): non-zero for 0 < t < {end} (= 1 + b) · peak {peak} · flat top {flat} long · total area {total} (= area of f, 1, × area of g, {ga})',
    s4hint: 'What to try: pick the rectangle with b = 1 and drag t from left to right: the overlap area grows linearly, then shrinks linearly, tracing a triangle. Now set b to 0.5 or 2: the top becomes a plateau of length |1 − b| whose height is the smaller of the two widths. Finally switch to the ramp: after flipping, its tall end is on the right and the traced curve is no longer symmetric, so here you can see the flip matter. Changing b or the shape clears the traced curve.',

    s5k: 'Step 5 · Into frequency',
    s5t: 'Why does the same averaging kernel wipe out some frequencies completely?',
    s5e: 'This step asks: feed a pure cosine into step 3’s moving-average kernel (w samples of 1/w each); what comes out? <strong>Frequency f</strong> is counted here in cycles per sample, from 0 to 0.5 (0.5 means one cycle every two samples, the fastest wiggle a sequence can hold). The result: a cosine of the same frequency comes out, with its amplitude multiplied by a factor H(f) that depends on frequency, called the <strong>frequency response</strong> (<a class="xlink" href="../../../signal/systems/frequency-response/#step0">→ Frequency response, step 0: how a system picks by frequency</a>). For a width-w average, H(f) = sin(πfw) / (w·sin(πf)). When f is a whole multiple of 1/w, the window holds a whole number of cycles, the ups cancel the downs and the average is 0. Any signal can be split into many cosines (<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: from waveform to spectrum</a>), and each one is multiplied by its own H(f). So <strong>convolution in time is frequency-by-frequency multiplication</strong>: Y(f) = X(f) · H(f). That is the convolution theorem.',
    fSlider: 'Input frequency f (cycles/sample)', wSlider5: 'Kernel width w (samples)',
    c5a: 'Input and output (middle of a long input, n = 100–163)', c5b: 'Gain: output amplitude ÷ input amplitude',
    s5lgIn: 'input cos(2πfn)', s5lgOut: 'output', s5lgCurve: 'formula |H(f)|', s5lgDot: 'measured (each f you tried)',
    s5readout: 'w = {w}, f = {f}: output ÷ input amplitude measured {m} · formula |H(f)| = {h}{note}',
    flipNote: ' · H(f) < 0: the output is inverted (peaks line up with troughs)',
    zeroNote: ' · output amplitude below 0.1% of the input: this frequency is almost entirely wiped out',
    s5hint: 'What to try: keep w = 5 and drag f slowly from 0 to 0.5. On the left, grey is the input and cyan the output (taken from the middle of a long input, away from the zero-padded ends); on the right every f you try leaves a measured dot, and the curve is the formula. At f = 0.2 and 0.4 the output goes flat. Then change w: the zeros move to whole multiples of 1/w (changing w clears the dots). The measured amplitude comes from fitting a cosine and a sine to the output; the formula is not used.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Know h, and you know the system’s answer to everything',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: linearity and time invariance let one clap’s echo be shifted and scaled. <strong>Step 1</strong>: any input is a train of claps and the output is the sum of their echoes; that sum is convolution. <strong>Step 2</strong>: reading the same sum one column at a time is “flip, slide, multiply, add”, and the output is N + M − 1 long. <strong>Step 3</strong>: an averaging kernel trades sharp edges for less noise. <strong>Step 4</strong>: in continuous time the sum becomes an integral and the output is an overlap area. <strong>Step 5</strong>: in the frequency domain convolution becomes multiplication, one frequency at a time.',
    formula: 'y[n] = Σₖ x[k]·h[n−k]\ny(t) = ∫ f(τ)·g(t−τ) dτ\nY(f) = X(f)·H(f)',
    boundary: 'Scope: convolution on this page is full linear convolution of finite real sequences, with zeros outside their ranges; “know h, know everything” holds only for linear time-invariant systems. A DFT computes circular convolution, where the ends wrap around and add; it matches linear convolution only after enough zero padding. Correlation does not flip the kernel, and by convention neither does the “convolution” in convolutional neural networks (strictly, it is correlation). The noise in step 3 is simulated independent Gaussian noise; 1/√w holds only for independent noise and only on average.',
    linksTitle: 'Where to go next',
    lk1: '→ LTI systems, step 2: record the impulse response, then build outputs from it',
    lk2: '→ Central limit theorem, step 5: the distribution of a sum is a convolution of distributions',
    lk3: '→ CNN feature maps, step 0: a small 2-D window taking weighted sums over an image',
    lk4: '→ Fourier, step 5: from waveform to spectrum',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Convolution · One Interaction at a Time”.'
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
  if (typeof window.refreshConvolution === 'function') window.refreshConvolution();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CONV_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
