'use strict';
// Statistical inference lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '统计推断 · 从一批瓶子判断一台机器',
    back: '← 知识索引',
    compare: '对照另一版本：统计推断 · 从样本到判断 →',
    navLabel: '统计推断步骤导航',
    tagline: '一台灌装机的标签写着「每瓶 500 mL」。你不能把它灌过的每一瓶都量一遍，只能抽一批瓶子来量。量出来的平均比 500 少一点，是机器真的少灌，还是这批碰巧偏少？七步里，你会先看清「批平均」本身会晃多大，再用它造出两件工具：置信区间回答「真实平均大概在哪」，p 值回答「如果标签没说谎，这批数据有多不寻常」。',
    nav0: '0 一批瓶子', nav1: '1 批平均会晃', nav2: '2 量出偏离', nav3: '3 p 值', nav4: '4 置信区间', nav5: '5 显著≠重要', nav6: '6 收束',

    s0k: '第 0 步 · 已知什么',
    s0t: '抽一批瓶子，平均比 500 少，能说明机器少灌吗？',
    s0e: '这一步要回答：一批瓶子的平均，会不会换一批就变样？变多少？先说清楚对象。机器灌过的所有瓶子叫<strong>总体</strong>，它的平均灌装量记作 μ（读作「缪」），这是我们想知道却看不到的数。我们只能抽出一批 n 瓶来量，这一批叫<strong>样本</strong>，它的平均叫<strong>样本均值</strong>，记作 x̄（读作「x 拔」）。另外，设备说明书告诉我们：单瓶灌装量的<strong>标准差</strong> σ = 6 mL（标准差衡量数据离平均有多散，大致是一瓶「典型地」偏离平均多少；本页把 σ 当作已知）。这里的瓶子是<strong>模拟</strong>出来的：真实的 μ 已经设好，第 1 步揭晓。',
    draw0: '抽一批（16 瓶）', run0: '连抽 20 批', clear0: '清空重来',
    c0top: '最新这一批：16 瓶各自的灌装量（mL）', c0bot: '已抽的每一批的平均 x̄（每个点是一批）',
    s0lgBottle: '一瓶', s0lgMean: '这一批的平均 x̄', s0lgClaim: '标签声称的 500 mL', s0lgPast: '之前各批的平均',
    s0readout: '第 {k} 批：16 瓶里最少 {min} mL、最多 {max} mL；这一批的平均 x̄ = {m} mL。　｜　已抽 {k} 批：批平均最低 {lo} mL、最高 {hi} mL，其中 {below} 批低于 500。',
    s0progress: '正在连抽：{c}/{N} 批 · ',
    s0hint: '观察顺序：先按几次「抽一批」，对比上下两行：上面是最新一批里的单瓶，散得很开；下面每个点是一批的平均，挤得紧得多，但也在左右跳。再按「连抽 20 批」，看下面的点慢慢堆出一个小山。结论：只凭一批的 x̄ 低于 500，还说明不了什么，先得知道 x̄ 本身会晃多大。',

    s1k: '第 1 步 · 抽样分布',
    s1t: '批平均会晃多大？每批多抽几瓶，能晃得少一点吗？',
    s1e: '这一步要回答：如果反复抽很多批，每批 n 瓶，这些 x̄ 会怎样分布？揭晓模拟里的真相：真实平均 μ = 498 mL（机器确实平均少灌 2 mL），σ = 6 mL。把同一种抽法重复很多次，所有 x̄ 排出来的分布叫<strong>抽样分布</strong>。它的中心在 μ，它的标准差有个专门的名字，叫<strong>标准误</strong>（SE）：它衡量 x̄ 典型地离 μ 多远。对彼此独立的瓶子，SE = σ / √n。n 变成 4 倍，SE 只减半（<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ 中心极限定理第 3 步：σ/√n 为什么是条铁律</a>）。',
    nSlider: '每批瓶数 n', replay1: '慢放这 1000 批',
    c1a: '1000 批的批平均 x̄：落在每 0.5 mL 一格里的比例', c1b: '批平均的标准差（mL）随 n 的变化',
    s1lgHist: '模拟的 x̄', s1lgCurve: '正态曲线（中心 498，宽度 SE）', s1lgTrue: '真实平均 μ = 498', s1lgClaim: '声称的 500', s1lgDot: '实测（每个试过的 n）',
    s1readout: '{prog}n = {n} 瓶一批，共 {N} 批：批平均的平均 {mm} mL（真值 498）；批平均的标准差 实测 {s} mL · 公式 SE = 6/√{n} = {se} mL；{w} 批（{wp}%）落在 498 ± 1.96 × SE 之内。',
    s1progress: '已抽 {c}/{N} 批 · ',
    s1hint: '观察顺序：只拖 n，从 4 拖到 100。左图的小山变窄、变高，中心一直在绿色的 498；右图每试一个 n 就留下一个实测点，它们沿着 6/√n 的曲线走。在本页 7 个 n 上，实测标准差是公式的 0.96–1.05 倍，落在 498 ± 1.96 × SE 之内的批次都在 94.3%–95.6%。抽样分布的形状近似正态（钟形），所以「中心 ± 1.96 个 SE」大约框住 95% 的批平均。',

    s2k: '第 2 步 · 用 SE 当尺子',
    s2t: '这批的 x̄ 离 500 有多远？用什么单位量？',
    s2e: '这一步要回答：拿到一批的 x̄ 后，怎样判断它离 500 算远还是算近？现在暂时<strong>假设标签说的是真的</strong>：μ = 500。这个待检验的假设叫<strong>零假设</strong>。若它成立，x̄ 的抽样分布就是一座以 500 为中心、宽度为 SE 的钟形曲线（<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ 二项与正态第 3 步：钟形曲线从哪来</a>）。「差 3 mL」本身说不出远近：n = 4 时 SE = 3 mL，差 3 mL 很平常；n = 100 时 SE = 0.6 mL，差 3 mL 就离谱了。所以改用 SE 当尺子：<strong>z 分数</strong> z = (x̄ − 500) ÷ SE，意思是「x̄ 离 500 有几个标准误」，负号表示低于 500。',
    xSlider: '这批的平均 x̄（mL）',
    c2: '若 μ = 500，x̄ 的抽样分布（两排刻度：mL 与 z）',
    s2lgCurve: '零假设下 x̄ 的分布', s2lgX: '你的 x̄', s2lgBand: '500 ± 2 个 SE',
    unitML: 'mL', unitZ: 'z',
    s2readout: 'x̄ = {x} mL，n = {n}：SE = 6/√{n} = {se} mL；z = ({x} − 500) ÷ {se} = {z}，即 x̄ {dir}。',
    dirLow: '比 500 低 {d} mL，等于 {az} 个 SE', dirHigh: '比 500 高 {d} mL，等于 {az} 个 SE', dirEq: '正好等于 500',
    s2hint: '观察顺序：先保持 n = 16，把 x̄ 从 500 往左拖到 497，读数里 z 从 0 变到 −2.00，橙线走到下排刻度 −2 的位置；绿色带是 500 ± 2 个 SE，零假设成立时约 95% 的批平均落在带内。再保持 x̄ = 497 不动，拖 n：n 越大，曲线越窄，同样差 3 mL 换算成的 |z| 越大。',

    s3k: '第 3 步 · p 值',
    s3t: '如果标签没说谎，抽到这么偏的一批有多罕见？',
    s3e: '这一步要回答：怎样把「离 500 有 |z| 个 SE」换成一个概率？<strong>p 值</strong>的定义是：<strong>假设零假设成立</strong>（μ = 500），再抽一批，它的 x̄ 离 500 至少和你这批一样远（两侧都算）的概率。图上就是钟形曲线两侧尾巴的面积（粉色）。为了确认这不是凭空的公式，下面同时在一台「平均真为 500」的模拟机器上抽 4000 批，数一数有几批至少这么偏。事先约定一个门槛，叫<strong>显著性水平</strong> α（常用 0.05）：p < α 就说结果「显著」，拒绝零假设（<a class="xlink" href="../../../probability/inference/hypothesis-testing/#step0">→ 假设检验第 0 步：再看一遍 p 值</a>）。',
    replay3: '慢放这 4000 批',
    c3: '零假设世界（μ = 500）里 4000 批的 x̄',
    s3lgSim: '模拟的 x̄（不够偏）', s3lgExt: '至少和你这批一样偏', s3lgTail: '公式：两侧尾巴面积 = p', s3lgX: '你的 x̄ 和它在 500 另一侧的镜像',
    s3readout: '{prog}z = {z}；p 值（公式）= {p}　｜　模拟：{N} 批里有 {k} 批离 500 至少 {d} mL，占 {f}。{verdict}',
    s3progress: '已抽 {c}/{N} 批 · ',
    s3sig: '　p < 0.05：按 5% 的门槛，这批算「不寻常」，拒绝「μ = 500」。',
    s3ns: '　p ≥ 0.05：标签为真时，这种偏离并不罕见，不拒绝「μ = 500」（这不等于证明了它）。',
    s3hint: '观察顺序：保持 n = 16，把 x̄ 从 500 慢慢拖到 496。粉色尾巴和粉色柱子同时变少，读数里公式 p 和模拟比例一起下降；x̄ = 497（z = −2）时 p ≈ 0.046，刚好低于 0.05 的门槛。在本页所有滑杆格点上，模拟比例与公式 p 相差不超过 0.014。注意 p 是在「假设 μ = 500」的世界里算出来的。',
    quizPrompt: '想一想：n = 16、x̄ = 497 时 p ≈ 0.046。下面哪句话说对了？',
    quizA: '标签说真话（μ = 500）的概率只有 4.6%',
    quizB: '如果标签说真话，再抽一批、偏离至少 3 mL 的概率约 4.6%',
    quizC: '机器少灌的概率是 95.4%',
    check: '核对',
    correct: '对。p 值是「假设零假设为真」时算出的数据概率，不是零假设本身为真的概率。要算「μ = 500 的概率」，还需要事先对 μ 有多大把握（贝叶斯推断要的先验），p 值里没有这一项。',
    wrong: '再看看：p 值是在哪个世界里算的？图中的 4000 批全部来自「μ = 500」的机器，p 只数了其中有多少批这么偏。',

    s4k: '第 4 步 · 置信区间',
    s4t: '不问「是不是 500」，直接问「μ 大概在哪」？',
    s4e: '这一步要回答：从一批的 x̄ 出发，能给 μ 圈出一个范围吗？<strong>置信区间</strong>就是这样一个范围：x̄ ± z* × SE。z* 由<strong>置信水平</strong>决定：95% 对应 z* = 1.96，因为抽样分布里约 95% 的 x̄ 离 μ 不超过 1.96 个 SE。「95%」说的是<strong>这种做法</strong>的成功率：每批都这样圈一次，长期下来约 95% 的区间会圈住真实的 μ。具体到某一个已经算出来的区间，它要么圈住了 μ，要么没圈住，不再有概率可言。下图每一行是一批的区间，模拟里我们知道 μ = 498，所以能直接判对错。',
    level: '置信水平', lv80: '80%', lv90: '90%', lv95: '95%', lv99: '99%',
    more4: '再抽 50 批', clear4: '清除累计',
    c4a: '每行一批的置信区间（点是 x̄）', c4b: '累计：圈住真值 498 的区间占比',
    s4lgHit: '圈住了 μ = 498', s4lgMiss: '没圈住', s4lgTrue: '真实平均 498', s4lgClaim: '声称的 500', s4lgNominal: '名义置信水平',
    s4readout: '第 {s} 组：{c}/50 个区间圈住真值 498 mL，{m}/50 个包含 500 mL；区间是 x̄ ± {h} mL（{zs} × SE {se}）。　｜　累计 {S} 组共 {N} 个区间，圈住 498 的占 {cp}%（名义 {lv}%）。',
    s4hint: '观察顺序：保持 95%，按几次「再抽 50 批」：每组大约 2–3 行变粉（没圈住），累计比例在 95% 附近来回。再点 80% 和 99%：用的还是同一批批平均，只是区间变短或变长，粉色行跟着变多或变少。区间与检验是一回事的两面：某行的 95% 区间不包含 500，恰好就是那一批在 α = 0.05 下拒绝了「μ = 500」。改 n 会换一批新样本并清除累计。',

    s5k: '第 5 步 · 显著不等于重要',
    s5t: '差距一样，为什么瓶子抽得越多，p 越小？',
    s5e: '这一步要回答：「显著」到底说明差距大，还是说明证据足？这里固定一台机器的真实平均 μ，假设抽到的是一批「典型」的样本，即 x̄ 恰好等于 μ（真实抽样会在 μ 附近晃，见第 1 步），再看 n 从 4 增到 10000 时 95% 置信区间和 p 值怎样变。区间宽度 ± 1.96 × 6/√n 随 n 收窄，差距 μ − 500 却一点没变。所以只要 n 够大，再小的差距也会「显著」；反过来，n 太小时真实存在的差距也可能「不显著」。这叫检验的<strong>功效</strong>不足（功效：差距真实存在时，检验能把它查出来的概率；<a class="xlink" href="../../../probability/inference/hypothesis-testing/#step3">→ 假设检验第 3 步：漏判与功效</a>）。',
    muSlider: '机器的真实平均 μ（mL）', nSlider5: '每批瓶数 n',
    c5a: '典型一批（x̄ = μ）的 95% 区间随 n 的变化（mL）', c5b: 'p 值随 n 的变化（对数刻度）',
    s5lgBand: '95% 区间', s5lgMu: '真实平均 μ', s5lgClaim: '声称的 500', s5lgP: 'p 值', s5lgAlpha: '门槛 0.05', s5lgStar: '500 开始落在区间外的 n',
    s5readout: 'μ = {mu} mL（比 500 少 {d} mL），n = {n}：区间 [{lo}, {hi}] mL，p = {p}，{verdict}。{star}',
    s5sig: '显著（p < 0.05）', s5ns: '不显著（p ≥ 0.05）',
    s5star: '要让 500 落到区间外，n 至少要 {ns} 瓶；差距本身始终是 {d} mL。',
    s5never: '这台机器真的平均 500 mL：无论 n 多大，典型一批的区间都包含 500，p = 1。',
    s5hint: '观察顺序：先把 μ 设成 499.5（只少 0.5 mL，不到一瓶标准差的十分之一），拖 n：n 要达到 554 瓶，500 才落到区间外、p 跌破 0.05，再往后 p 越来越小，差距却一直是 0.5 mL。再把 μ 设成 498、n 设成 16：真少灌 2 mL，p ≈ 0.18，不显著。所以要一起看两件事：p 值说「证据够不够」，区间说「差多少」。',

    s6k: '第 6 步 · 收束', s6t: '一批数据，两个问题，两件工具',
    s6fin: '回顾这条线。<strong>第 0 步</strong>：一批的平均 x̄ 换一批就变，单看一个数说明不了什么。<strong>第 1 步</strong>：反复抽样，x̄ 排成以 μ 为中心、宽度为 SE = σ/√n 的钟形（抽样分布）。<strong>第 2 步</strong>：用 SE 当尺子，z 分数说 x̄ 离假设值几个 SE。<strong>第 3 步</strong>：p 值是「假设成立时，数据至少这么偏」的概率，不是假设为真的概率。<strong>第 4 步</strong>：置信区间 x̄ ± z*·SE 回答「μ 大概在哪」，95% 说的是这种做法的长期成功率。<strong>第 5 步</strong>：样本越大越容易「显著」，所以要和区间一起看差距有多大。',
    formula: 'SE = σ / √n\nz = (x̄ − μ₀) / SE\np = P(|Z| ≥ |z|)\nCI = x̄ ± z* · SE\n（95%：z* = 1.96）',
    boundary: '适用范围：本页瓶子是模拟的独立正态数据，σ = 6 mL 当作已知。真实情况里 σ 往往未知，要用样本标准差 s 代替，并把 z* 换成 t 分布的临界值（n 小时区间更宽）；数据不独立（比如同一时段灌的瓶子互相相关）时，σ/√n 会低估 x̄ 的晃动。数据明显偏斜、n 又很小时，正态近似也会失准。p < 0.05 只是约定的门槛，不是真理的分界线；同时做很多次检验，总会有几次碰巧「显著」。',
    linksTitle: '接着去哪',
    lk1: '→ 中心极限定理第 3 步：σ/√n 为什么是条铁律',
    lk2: '→ 假设检验第 5 步：同时检验很多次会怎样',
    lk3: '→ 贝叶斯更新第 6 步：「数据给定假设」和「假设给定数据」不是一回事',
    lk4: '→ 蒙特卡洛第 2 步：样本翻 4 倍，误差减半',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《统计推断 · 从样本到判断》的平行版本。'
  },
  en: {
    pageTitle: 'Statistical Inference · Judging a Machine from One Batch',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Statistical Inference · From Sample to Judgment →',
    navLabel: 'Statistical inference steps',
    tagline: 'A bottling machine’s label says “500 mL per bottle”. You can’t measure every bottle it has ever filled; you can only pull a batch and measure those. The batch average comes out a little under 500. Is the machine really short-filling, or was this batch just low by chance? Over seven steps you first see how much a batch average wobbles on its own, then build two tools from that: a confidence interval answers “where is the true average, roughly?”, and a p-value answers “if the label is honest, how unusual is this batch?”',
    nav0: '0 One batch', nav1: '1 Averages wobble', nav2: '2 Measure the gap', nav3: '3 p-value', nav4: '4 Confidence interval', nav5: '5 Significant ≠ big', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What we know',
    s0t: 'One batch averages under 500. Does that prove the machine short-fills?',
    s0e: 'This step asks: does the average of a batch change when you take another batch, and by how much? First, the objects. All the bottles the machine has filled form the <strong>population</strong>; its average fill is called μ (“mu”). That is the number we want and cannot see. We can only pull n bottles and measure them; that batch is a <strong>sample</strong>, and its average is the <strong>sample mean</strong> x̄ (“x-bar”). The machine’s spec sheet also tells us the <strong>standard deviation</strong> of a single bottle is σ = 6 mL (the standard deviation measures how spread out values are around their average, roughly how far a typical bottle sits from it; this page treats σ as known). The bottles here are <strong>simulated</strong>: the true μ is already set, and step 1 reveals it.',
    draw0: 'Pull a batch (16 bottles)', run0: 'Pull 20 batches', clear0: 'Start over',
    c0top: 'Latest batch: the fill of each of its 16 bottles (mL)', c0bot: 'Average x̄ of every batch so far (one dot per batch)',
    s0lgBottle: 'one bottle', s0lgMean: 'this batch’s average x̄', s0lgClaim: 'the label’s 500 mL', s0lgPast: 'earlier batch averages',
    s0readout: 'Batch {k}: the 16 bottles range from {min} to {max} mL; this batch averages x̄ = {m} mL.  |  {k} batches so far: averages from {lo} to {hi} mL, {below} of them under 500.',
    s0progress: 'Pulling: {c}/{N} batches · ',
    s0hint: 'What to try: press “Pull a batch” a few times and compare the two rows. The top row is the latest batch’s single bottles, widely scattered; each dot in the bottom row is a whole batch’s average, packed much tighter but still jumping around. Then press “Pull 20 batches” and watch the bottom dots pile into a small hill. Takeaway: one x̄ below 500 says little until you know how much x̄ itself wobbles.',

    s1k: 'Step 1 · The sampling distribution',
    s1t: 'How much does a batch average wobble, and do bigger batches wobble less?',
    s1e: 'This step asks: if you pulled many batches of n bottles each, how would their x̄ values spread out? Time to reveal the simulation’s truth: the real average is μ = 498 mL (the machine really does short-fill by 2 mL on average), with σ = 6 mL. Repeat the same sampling many times and line up every x̄: that spread is the <strong>sampling distribution</strong>. It is centred on μ, and its standard deviation gets its own name, the <strong>standard error</strong> (SE): how far x̄ typically lands from μ. For independent bottles, SE = σ / √n. Four times the bottles only halves the SE (<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ Central limit theorem, step 3: why σ/√n is the iron rule</a>).',
    nSlider: 'Bottles per batch n', replay1: 'Replay these 1000 batches',
    c1a: '1000 batch averages x̄: share landing in each 0.5 mL bin', c1b: 'Standard deviation of batch averages (mL) vs n',
    s1lgHist: 'simulated x̄', s1lgCurve: 'normal curve (centre 498, width SE)', s1lgTrue: 'true average μ = 498', s1lgClaim: 'claimed 500', s1lgDot: 'measured (each n you tried)',
    s1readout: '{prog}n = {n} bottles per batch, {N} batches: mean of the batch averages {mm} mL (truth 498); their standard deviation measured {s} mL · formula SE = 6/√{n} = {se} mL; {w} batches ({wp}%) land within 498 ± 1.96 × SE.',
    s1progress: '{c}/{N} batches pulled · ',
    s1hint: 'What to try: move only n, from 4 up to 100. On the left the hill gets narrower and taller while its centre stays on the green 498; on the right each n you try leaves a measured dot, and the dots follow the 6/√n curve. Across this page’s 7 values of n, the measured standard deviation is 0.96–1.05 times the formula, and the share of batches within 498 ± 1.96 × SE stays between 94.3% and 95.6%. The sampling distribution is close to normal (bell-shaped), which is why “centre ± 1.96 SE” captures about 95% of batch averages.',

    s2k: 'Step 2 · The SE as a ruler',
    s2t: 'How far is this batch’s x̄ from 500, and in what units?',
    s2e: 'This step asks: once you have one batch’s x̄, how do you decide whether it is far from 500 or close? For now, <strong>suppose the label is telling the truth</strong>: μ = 500. The claim under test is called the <strong>null hypothesis</strong>. If it holds, the sampling distribution of x̄ is a bell centred on 500 with width SE (<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ Binomial and normal, step 3: where the bell curve comes from</a>). “3 mL short” alone means nothing: with n = 4, SE = 3 mL and a 3 mL gap is routine; with n = 100, SE = 0.6 mL and a 3 mL gap is wild. So use the SE as the ruler. The <strong>z-score</strong> z = (x̄ − 500) ÷ SE says how many standard errors x̄ sits from 500; a minus sign means below 500.',
    xSlider: 'This batch’s average x̄ (mL)',
    c2: 'Sampling distribution of x̄ if μ = 500 (scales: mL and z)',
    s2lgCurve: 'distribution of x̄ under the null', s2lgX: 'your x̄', s2lgBand: '500 ± 2 SE',
    unitML: 'mL', unitZ: 'z',
    s2readout: 'x̄ = {x} mL, n = {n}: SE = 6/√{n} = {se} mL; z = ({x} − 500) ÷ {se} = {z}, so x̄ {dir}.',
    dirLow: 'is {d} mL below 500, which is {az} SE', dirHigh: 'is {d} mL above 500, which is {az} SE', dirEq: 'equals 500 exactly',
    s2hint: 'What to try: keep n = 16 and drag x̄ from 500 down to 497. In the readout z goes from 0 to −2.00, and the orange line reaches −2 on the lower scale. The green band is 500 ± 2 SE; if the null holds, about 95% of batch averages land inside it. Then hold x̄ = 497 and move n: the bigger n, the narrower the curve, and the same 3 mL gap turns into a bigger |z|.',

    s3k: 'Step 3 · The p-value',
    s3t: 'If the label is honest, how rare is a batch this far off?',
    s3e: 'This step asks: how do you turn “|z| SEs from 500” into a probability? The <strong>p-value</strong> is defined as follows: <strong>assume the null hypothesis holds</strong> (μ = 500) and pull one more batch; p is the probability that its x̄ lands at least as far from 500 as yours did, on either side. In the picture it is the area of the bell’s two tails (pink). So you don’t have to take the formula on faith, the page also pulls 4000 batches from a simulated machine whose average really is 500 and counts how many are at least as far off. You fix a threshold in advance, the <strong>significance level</strong> α (often 0.05): if p < α the result is called “significant” and the null is rejected (<a class="xlink" href="../../../probability/inference/hypothesis-testing/#step0">→ Hypothesis testing, step 0: the p-value again</a>).',
    replay3: 'Replay these 4000 batches',
    c3: 'Null world (μ = 500): 4000 batch averages x̄',
    s3lgSim: 'simulated x̄ (not as far off)', s3lgExt: 'at least as far off as yours', s3lgTail: 'formula: two tail areas = p', s3lgX: 'your x̄ and its mirror across 500',
    s3readout: '{prog}z = {z}; p-value (formula) = {p}  |  simulation: {k} of {N} batches land at least {d} mL from 500, a share of {f}.{verdict}',
    s3progress: '{c}/{N} batches pulled · ',
    s3sig: ' p < 0.05: at the 5% threshold this batch counts as unusual, so “μ = 500” is rejected.',
    s3ns: ' p ≥ 0.05: a gap like this is not rare when the label is true, so “μ = 500” is not rejected (which does not prove it).',
    s3hint: 'What to try: keep n = 16 and slowly drag x̄ from 500 to 496. The pink tails and the pink bars shrink together, and in the readout the formula p and the simulated share fall together; at x̄ = 497 (z = −2) p ≈ 0.046, just under the 0.05 threshold. At every slider position on this page the simulated share is within 0.014 of the formula p. Keep in mind that p is computed in the world where μ = 500 is assumed.',
    quizPrompt: 'Think: with n = 16 and x̄ = 497, p ≈ 0.046. Which sentence is right?',
    quizA: 'The chance that the label is true (μ = 500) is only 4.6%',
    quizB: 'If the label is true, the chance that another batch is off by at least 3 mL is about 4.6%',
    quizC: 'The chance that the machine short-fills is 95.4%',
    check: 'Check',
    correct: 'Right. A p-value is a probability about the data, computed assuming the null is true; it is not the probability that the null is true. To get “the probability that μ = 500” you would also need how confident you were about μ beforehand (the prior in Bayesian inference), and a p-value has no such ingredient.',
    wrong: 'Look again: in which world is p computed? All 4000 batches in the picture come from a machine with μ = 500, and p only counts how many of them are this far off.',

    s4k: 'Step 4 · Confidence intervals',
    s4t: 'Skip “is it 500?” and ask “where is μ, roughly?”',
    s4e: 'This step asks: starting from one batch’s x̄, can you mark out a range for μ? A <strong>confidence interval</strong> is exactly that: x̄ ± z* × SE. z* is set by the <strong>confidence level</strong>: 95% uses z* = 1.96, because about 95% of x̄ values in the sampling distribution land within 1.96 SE of μ. The “95%” describes <strong>the method</strong>: draw an interval like this for every batch, and in the long run about 95% of them capture the true μ. Any single interval already computed either contains μ or doesn’t; there is no probability left in it. Each row below is one batch’s interval; in the simulation we know μ = 498, so each can be marked right or wrong.',
    level: 'Confidence level', lv80: '80%', lv90: '90%', lv95: '95%', lv99: '99%',
    more4: 'Pull 50 more batches', clear4: 'Clear the tally',
    c4a: 'One batch per row: its confidence interval (dot = x̄)', c4b: 'Running tally: share of intervals that capture 498',
    s4lgHit: 'captures μ = 498', s4lgMiss: 'misses', s4lgTrue: 'true average 498', s4lgClaim: 'claimed 500', s4lgNominal: 'nominal confidence level',
    s4readout: 'Set {s}: {c}/50 intervals capture the true 498 mL and {m}/50 contain 500 mL; each interval is x̄ ± {h} mL ({zs} × SE {se}).  |  {S} sets, {N} intervals in all: {cp}% capture 498 (nominal {lv}%).',
    s4hint: 'What to try: stay at 95% and press “Pull 50 more batches” a few times. Each set has about 2–3 pink rows (misses), and the running share hovers around 95%. Then click 80% and 99%: the batch averages stay the same, only the intervals shrink or stretch, and the pink rows multiply or vanish. Intervals and tests are two sides of one coin: a row whose 95% interval leaves out 500 is exactly a batch that rejects “μ = 500” at α = 0.05. Changing n draws fresh batches and clears the tally.',

    s5k: 'Step 5 · Significant is not the same as big',
    s5t: 'The gap stays the same, so why does p shrink as you measure more bottles?',
    s5e: 'This step asks: does “significant” mean the gap is big, or that the evidence is strong? Fix a machine’s true average μ and assume you get a “typical” batch whose x̄ equals μ exactly (real batches wobble around μ, as in step 1). Then watch the 95% confidence interval and the p-value as n grows from 4 to 10000. The interval’s half-width 1.96 × 6/√n keeps shrinking, while the gap μ − 500 never changes. So with a big enough n even a tiny gap turns “significant”; and with a small n a real gap can come out “not significant”. That is a test with too little <strong>power</strong> (power: the chance a test detects a gap that really exists; <a class="xlink" href="../../../probability/inference/hypothesis-testing/#step3">→ Hypothesis testing, step 3: misses and power</a>).',
    muSlider: 'Machine’s true average μ (mL)', nSlider5: 'Bottles per batch n',
    c5a: 'Typical batch (x̄ = μ): 95% interval vs n (mL)', c5b: 'p-value vs n (log scale)',
    s5lgBand: '95% interval', s5lgMu: 'true average μ', s5lgClaim: 'claimed 500', s5lgP: 'p-value', s5lgAlpha: 'threshold 0.05', s5lgStar: 'n where 500 leaves the interval',
    s5readout: 'μ = {mu} mL ({d} mL under 500), n = {n}: interval [{lo}, {hi}] mL, p = {p}, {verdict}. {star}',
    s5sig: 'significant (p < 0.05)', s5ns: 'not significant (p ≥ 0.05)',
    s5star: '500 drops out of the interval only from n = {ns} bottles on; the gap itself stays {d} mL.',
    s5never: 'This machine really averages 500 mL: however big n gets, a typical batch’s interval contains 500 and p = 1.',
    s5hint: 'What to try: set μ to 499.5 first (only 0.5 mL short, under a tenth of one bottle’s standard deviation) and drag n. Not until n reaches 554 bottles does 500 leave the interval and p drop below 0.05; beyond that p keeps falling while the gap stays 0.5 mL. Then set μ = 498 and n = 16: a real 2 mL shortfall, yet p ≈ 0.18, not significant. So read the two together: the p-value says whether the evidence is enough, the interval says how big the gap is.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One batch, two questions, two tools',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: a batch average x̄ changes from batch to batch, so one number on its own says little. <strong>Step 1</strong>: over many batches, x̄ forms a bell centred on μ with width SE = σ/√n (the sampling distribution). <strong>Step 2</strong>: with the SE as a ruler, the z-score says how many SEs x̄ sits from the hypothesised value. <strong>Step 3</strong>: the p-value is the probability of data at least this far off if the hypothesis holds, not the probability that the hypothesis is true. <strong>Step 4</strong>: the confidence interval x̄ ± z*·SE answers “where is μ, roughly”, and 95% is the method’s long-run success rate. <strong>Step 5</strong>: bigger samples make “significant” easier to reach, so read the interval alongside to see how big the gap is.',
    formula: 'SE = σ / √n\nz = (x̄ − μ₀) / SE\np = P(|Z| ≥ |z|)\nCI = x̄ ± z* · SE\n(95%: z* = 1.96)',
    boundary: 'Scope: the bottles on this page are simulated independent normal data with σ = 6 mL treated as known. In practice σ is usually unknown: you plug in the sample standard deviation s and swap z* for a t-distribution critical value, which widens the interval when n is small. If the data are not independent (bottles filled in the same run can be correlated), σ/√n understates how much x̄ wobbles. With strongly skewed data and a small n, the normal approximation also breaks down. p < 0.05 is a convention, not a line between truth and falsehood; run enough tests and a few will come out “significant” by chance.',
    linksTitle: 'Where to go next',
    lk1: '→ Central limit theorem, step 3: why σ/√n is the iron rule',
    lk2: '→ Hypothesis testing, step 5: what happens when you run many tests',
    lk3: '→ Bayesian updating, step 6: “data given hypothesis” is not “hypothesis given data”',
    lk4: '→ Monte Carlo, step 2: four times the samples, half the error',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Statistical Inference · From Sample to Judgment”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang] && key in STRINGS[lang] ? STRINGS[lang][key] : key in STRINGS.en ? STRINGS.en[key] : key;
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
  if (typeof window.refreshInference === 'function') window.refreshInference();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SI_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
