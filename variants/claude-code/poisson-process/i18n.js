'use strict';
// Poisson process lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '泊松过程 · 没人约好，到达却守规矩',
    back: '← 知识索引',
    compare: '对照另一版本：泊松过程 · 随机到达的规律 →',
    navLabel: '泊松过程步骤导航',
    tagline: '一条客服热线：打电话的人互不商量，什么时候打来全凭各自的事，我们只知道平均每分钟来 λ 个。凭这一个数能预测什么？下 5 分钟来几个、离下一个还要等多久、两条线并成一条会怎样、一天里忙闲不同又怎样。八步里，先把「随机到达」做成一个能算的模型，再用模拟的来电记录逐条检验它的推论。',
    nav0: '0 切细时间', nav1: '1 窗口计数', nav2: '2 间隔', nav3: '3 无记忆', nav4: '4 等公交', nav5: '5 合并与筛选', nav6: '6 速率会变', nav7: '7 收束',

    s0k: '第 0 步 · 把时间切细',
    s0t: '「完全随机，平均每分钟 λ 个」到底是什么意思？',
    s0e: '这一步要回答：怎样把「随机到达」说成一个能算的模型？办法是把 10 分钟切成 n 个小片，每片长 Δt = 10/n 分钟；每一片<strong>独立地</strong>抛一次不公平的硬币，以概率 p = λ·Δt 来一个电话，否则没有。λ（读作 lambda）叫<strong>速率</strong>：平均每分钟来几个电话。不管切多细，10 分钟里的平均来电数都是 μ = λ × 10。10 分钟里来 k 个电话的概率服从<strong>二项分布</strong>：n 次独立尝试、每次成功概率 p，恰好成功 k 次的概率（<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ 二项分布到正态页第 0 步：k 次成功有几条路径</a>）。片切得越细，二项分布越接近一个只由 μ 决定的极限，叫<strong>泊松分布</strong>：P(k) = μᵏ e<sup>−μ</sup> / k!。片无限细时得到的到达方式就是<strong>泊松过程</strong>：速率恒定、各片互不影响、同一瞬间最多来一个。',
    sliceN: '切成 n 片', lam0: '速率 λ（次/分钟）', redraw0: '再抽一次',
    c0a: '一次抽样：10 分钟里哪些片来了电话', c0b: '来电个数 k 的概率：二项（柱）与泊松（点）', c0c: '两种分布的差距（对数刻度）',
    s0lgHit: '来了电话的片', s0lgBin: '二项分布，n 片', s0lgPoi: '泊松分布，平均 μ', s0lgTv: '总变差距离（当前 n 为青色）',
    s0readout: 'n = {n} 片，每片 {dt} 分钟，来电概率 p = λ·Δt = {p}。这次抽到 {k} 个电话（概率图里青框标出的柱），平均应为 μ = λ × 10 = {mu} 个。二项与泊松的总变差距离 = {tv}：把每个 k 处两种概率之差的绝对值加起来再除以 2，0 表示完全相同，越小越接近。',
    s0hint: '观察顺序：先保持 λ 不变，把 n 从 10 拖到 2000：「一次抽样」条带的片越切越细，每次抽到的电话数仍在 μ 附近；「来电个数 k 的概率」图里橙色柱（二项）逐渐贴上白点（泊松）；「两种分布的差距」图里青色柱随 n 变矮，n 不太小时，n 每大 10 倍，差距大约小 10 倍。再把 λ 调大：p = λ·Δt 跟着变大，切得粗时差距更明显，因为一片里最多只能算一个电话。',

    s1k: '第 1 步 · 一个窗口里有几个',
    s1t: '随便截一段 w 分钟，里面会有几个电话？',
    s1e: '这一步要回答：知道速率 λ，能不能说出「w 分钟里来 k 个电话」的概率？下面是一段 2400 分钟的模拟来电记录，造法就是第 0 步，只是切得更细：每 0.001 分钟一片，每片以概率 λ × 0.001 来一个电话。把记录从头切成 400 个首尾相接、互不重叠的<strong>窗口</strong>，每个长 w 分钟，数每个窗口里有几个电话。第 0 步的结论在这里变成一条预言：个数服从平均 μ = λw 的泊松分布 P(k) = μᵏ e<sup>−μ</sup> / k!。泊松分布还有一个特征：<strong>方差</strong>也等于 μ。方差 = 各窗口个数偏离平均的平方的平均，衡量个数散得多开（<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ 概率分布页第 2 步：方差是散布</a>）。所以<strong>离散指数</strong>（方差 ÷ 平均）对泊松计数应接近 1。',
    lam1: '速率 λ（次/分钟）', w1: '窗口长 w（分钟）', count1: '逐个窗口计数', reroll1: '换一段记录',
    c1a: '记录开头的 12 个窗口（每格 w 分钟，下方数字 = 格内个数）', c1b: '400 个窗口：个数 k 出现的比例',
    s1lgCall: '一次来电', s1lgBar: '实测比例', s1lgPoi: '泊松 P(k)，平均 λw',
    s1progress: '已数 {c}/{N} 个窗口 · ',
    s1readout: '{prog}记录 {set}/5 · 每个窗口平均 {m} 个（预言 λw = {mu}）· 方差 {v} · 离散指数 = 方差 ÷ 平均 = {r}',
    s1hint: '观察顺序：先按「逐个窗口计数」，看下图柱子随窗口数增加慢慢长成白点的形状。再分别拖 λ 和 w：只要乘积 λw 相同，分布形状就相同（试 λ = 1、w = 4 和 λ = 2、w = 2）；λw 小时分布挤在 0 附近、向右拖尾，λw 大时接近左右对称。本页 5 段记录、所有滑杆组合下，离散指数都在 0.81–1.19 之间。',

    s2k: '第 2 步 · 两个电话之间',
    s2t: '刚来过一个电话，下一个要等多久？',
    s2e: '这一步要回答：相邻两个电话之间的<strong>间隔</strong>有什么规律？数据仍是第 1 步那段记录（速率 λ 在第 1 步设定），取前 1000 个间隔。不用新假设就能推出答案：「间隔超过 t」等于「接下来 t 分钟里一个电话都没来」，而第 1 步说这件事的概率是泊松分布在 k = 0 处的值，所以 P(间隔 > t) = e<sup>−λt</sup>。这条曲线叫<strong>生存曲线</strong>：横轴是时长 t，纵轴是比 t 长的间隔所占的比例。它描述的分布叫<strong>指数分布</strong>，平均间隔是 1/λ。下图把同一批间隔画成直方图，柱高是<strong>概率密度</strong>（落在这一格的比例 ÷ 格宽），理论曲线是 λe<sup>−λt</sup>：最常见的是很短的间隔，电话会自己「扎堆」，并没有谁安排。',
    t2: '时长 t（分钟）',
    c2a: '生存曲线：比 t 长的间隔占多少', c2b: '间隔的直方图（概率密度）',
    s2lgEmp: '实测（1000 个间隔）', s2lgTh: '理论：e^(−λt)，下图 λe^(−λt)', s2lgT: '当前 t',
    s2readout: 'λ = {lam}：1000 个间隔平均 {m} 分钟（1/λ = {inv}）。比 t = {t} 分钟长的间隔占 {e}%，理论 e^(−λt) = {th}%。',
    s2hint: '观察顺序：拖 t，看上图竖线与阶梯（实测）、曲线（理论）的两个交点，读数给出两个百分比。t = 1/λ 时理论值是 e^(−1) ≈ 37%：比平均长的间隔只占三成多，大多数间隔比平均短，所以下图最高的柱总在最左边的一两格。回到第 1 步改 λ 或换记录，这里跟着更新。',

    s3k: '第 3 步 · 已经等了一会儿',
    s3t: '已经干等了 s 分钟，接下来还要等多久？',
    s3e: '这一步要回答：等过的时间会不会「攒下来」，让下一个电话来得更快？上一步确认了泊松过程的间隔服从指数分布，这里直接从指数分布抽 20000 个间隔（平均 1 分钟）；作对照，另抽 20000 个在 0 到 2 分钟之间均匀分布的间隔（平均也是 1 分钟，但不会超过 2 分钟）。只留下比 s 长的间隔，也就是「已经等了 s 分钟还没来」的那些，看它们<strong>剩下的部分</strong>（间隔 − s）。如果剩余等待的分布和从头开始等完全一样，就说这种分布有<strong>无记忆性</strong>。指数分布有：P(间隔 > s + u | 间隔 > s) = e<sup>−(s+u)</sup> / e<sup>−s</sup> = e<sup>−u</sup>，与 s 无关。',
    s3: '已经等了 s（分钟）', kindExp: '指数间隔（泊松过程）', kindUnif: '均匀间隔 0–2 分钟（对照）', clear3: '清除记录',
    c3a: '剩余等待的直方图（概率密度）', c3b: '平均剩余等待 vs 已等时长 s',
    s3lgHist: '剩余等待（实测）', s3lgFresh: '从头开始等的分布', s3lgExp: '指数：恒为 1 分钟', s3lgUnif: '均匀：(2 − s)/2 分钟',
    kindNameExp: '指数间隔', kindNameUnif: '均匀间隔',
    s3readout: '{kind}：20000 个间隔中有 {n} 个比 s = {s} 分钟长；它们的剩余等待平均 {m} 分钟（理论 {th} 分钟）。',
    s3hint: '观察顺序：先选指数间隔，把 s 从 0 拖到 1.9：留下的间隔越来越少（读数里的个数），直方图却一直贴着虚线（从头开始等的分布），「平均剩余等待」图里的点停在 1 分钟的水平线上。再换均匀间隔：s 越大剩余等待越短，那张图里的点沿斜线下降，因为间隔最长只有 2 分钟。无记忆性是指数分布独有的（离散时间里对应几何分布），不是一切「随机」等待的通性。',

    s4k: '第 4 步 · 等公交的悖论',
    s4t: '公交平均 10 分钟一班，随便什么时候去车站，平均要等多久？',
    s4e: '这一步换一个场景：一条公交线在 20 小时里平均每 10 分钟到站一班。比较两种时刻表：<strong>准点</strong>（严格每 10 分钟一班）和<strong>随机</strong>（班车按泊松过程到站，相邻两班之间的<strong>车头间隔</strong>服从平均 10 分钟的指数分布）。400 名乘客在这段时间里各自随机地来到车站，等下一班车。按班次平均，两种时刻表的车头间隔都约 10 分钟；但乘客更容易落进长的间隔，因为长间隔占的时间多。于是「乘客碰上的间隔」按乘客平均，比按班次平均更长，这叫<strong>检查悖论</strong>（也叫长度偏差）。',
    quizPrompt: '先猜：时刻表随机、平均 10 分钟一班，随机来到车站的乘客平均要等多久？',
    quizA: '约 5 分钟：间隔的一半', quizB: '约 10 分钟', quizC: '约 20 分钟', check: '核对',
    correct: '对。按第 3 步的无记忆性，乘客到站那一刻，离下一班车的时间仍服从平均 10 分钟的指数分布，和上一班走了多久无关。按下面的按钮看模拟结果。',
    wrong: '再想想第 3 步：指数间隔没有记忆，从任何时刻开始等，平均都要等满一个平均间隔。按下面的按钮让乘客来车站，读数会给出答案。',
    modeReg: '准点时刻表', modePoi: '随机时刻表（泊松）', pax4: '让 400 名乘客来车站', reroll4: '换一天',
    c4a: '前 120 分钟：班车（竖线）与乘客（点，横线是他的等待）', c4b: '乘客等待时长的分布',
    s4lgBus: '班车到站', s4lgPax: '乘客与他的等待', s4lgMean: '平均等待（实测）', s4lgTh: '长期理论',
    modeNameReg: '准点', modeNamePoi: '随机',
    s4progress: '已来 {c}/{N} 名乘客 · ',
    s4idle: '{mode}时刻表：本日 {b} 班车，按班次平均车头间隔 {h} 分钟。按「让 400 名乘客来车站」开始。',
    s4readout: '{prog}{mode}：乘客平均等 {w} 分钟（长期理论 {tw}）｜ 车头间隔按班次平均 {h} 分钟，按乘客平均 {g} 分钟（{x} 倍）｜ 长于 10 分钟的车头间隔占班次的 {hl}%，却装下了 {pl}% 的乘客。',
    s4hint: '观察顺序：先选准点，按「让乘客来车站」：等待在 0 到 10 分钟之间均匀散开，平均约 5 分钟。再选随机时刻表重复：上图出现很长和很短的车头间隔，乘客的点大多落在长间隔里；平均等待约 10 分钟，乘客碰上的间隔平均约 20 分钟，约为按班次平均的两倍（本页 5 天的模拟里是 1.76–2.05 倍）。按「换一天」看数字怎样波动；切换时刻表会直接显示当天全部乘客。',

    s5k: '第 5 步 · 合并与筛选',
    s5t: '两条热线并成一条，再只转接其中一部分，还是泊松过程吗？',
    s5e: '这一步要回答：泊松过程经过两种常见操作后还是不是泊松过程。<strong>合并</strong>：A、B 两条独立的热线（各自是速率 λ₁、λ₂ 的泊松过程）接到同一个总机，看总机收到的来电。<strong>筛选</strong>（也叫稀释）：总机上的每个电话独立地以概率 p 转给专家，看专家收到的来电。结论：总机是速率 λ₁ + λ₂ 的泊松过程，每个来电来自 A 的概率是 λ₁/(λ₁ + λ₂)；专家是速率 p(λ₁ + λ₂) 的泊松过程。原因回到第 0 步的小片：一小片 Δt 里 A 来电的概率是 λ₁Δt，B 是 λ₂Δt，两边同时来电的概率是 Δt² 量级、可以忽略，合起来就是 (λ₁ + λ₂)Δt；筛选只是把每片的概率再乘 p。下面用 1000 分钟的模拟记录检验，专家流按 1 分钟一个窗口计算<strong>离散指数</strong>（方差 ÷ 平均），泊松计数应接近 1。',
    l1: 'A 线速率 λ₁（次/分钟）', l2: 'B 线速率 λ₂（次/分钟）', p5: '转给专家的概率 p', reroll5: '换一段记录',
    c5a: '前 {m} 分钟：A、B、总机、专家四行记录', c5b: '总机来电间隔的生存曲线',
    rowA: 'A', rowB: 'B', rowM: '总机', rowK: '专家',
    s5lgA: 'A 线来电', s5lgB: 'B 线来电', s5lgK: '转给专家', s5lgEmp: '实测', s5lgTh: '理论 e^(−(λ₁+λ₂)t)',
    s5readout: '1000 分钟里：总机 {m} 次/分钟（λ₁ + λ₂ = {ms}）· 来自 A 的占 {sa}%（λ₁/(λ₁+λ₂) = {sth}%）· 总机平均间隔 {g} 分钟（1/(λ₁+λ₂) = {gth}）｜ 专家 {k} 次/分钟（p(λ₁+λ₂) = {kth}）· 专家流离散指数 {r}',
    s5none: '没有定义（专家没有收到电话）',
    s5hint: '观察顺序：先拖 λ₁、λ₂：上图总机一行的点数跟着变，两种颜色的比例跟着两条线的速率走；下图阶梯始终贴着以 λ₁ + λ₂ 为速率的曲线。再拖 p：专家一行变稀，但它的离散指数仍在 1 附近，既没有变得更规则，也没有更扎堆。p = 0 时专家收不到电话，离散指数没有定义。',

    s6k: '第 6 步 · 速率会变',
    s6t: '上午闲、中午忙，泊松模型还能用吗？',
    s6e: '这一步要回答：速率随时间变化时，计数还服从泊松分布吗？热线每天 8:00–20:00 开放，速率 λ(t)（每小时来电数）上午爬升、午后回落、傍晚再起一个高峰（上图曲线，是本页设定的模拟场景，不是实测）。只要各时刻的来电仍互不影响，这就叫<strong>非齐次泊松过程</strong>：时间窗 [a, b] 里的来电数服从泊松分布，平均 Λ 等于这一段速率曲线下的<strong>面积</strong>（速率 × 时长，逐段累加）。模拟方法：先按每小时 15 次的最高速率撒下候选来电，每个候选再以 λ(t)/15 的概率保留，得到的正是速率为 λ(t) 的过程。共模拟 500 天。',
    a6: '时间窗起点', w6: '时间窗长度（小时）', reroll6: '换 500 天',
    c6a: '速率 λ(t)（次/小时）与所选时间窗', c6b: '500 天里，这个时间窗的来电个数',
    s6lgRate: '速率 λ(t)', s6lgArea: '时间窗内面积 Λ', s6lgDay: '第 1 天的来电（细竖线）', s6lgBar: '实测比例', s6lgPoi: '泊松 P(k)，平均 Λ',
    s6readout: '时间窗 {a}–{b}：面积 Λ = {L} 个 ｜ 500 天里平均 {m} 个 · 方差 {v} · 离散指数 {r}',
    s6pooled: '反过来，如果不管速率变化，把每天 12 个整点小时的计数混在一起（共 6000 个）：平均 {m} · 方差 {v} · 离散指数 {r}（理论 {rt}）。方差大于平均，是因为各小时的 Λ 本来就不同。',
    s6hint: '观察顺序：拖时间窗起点，上图阴影面积和下图的平均一起变：移到忙时段，柱子右移、变宽。不管窗口放在哪里，柱子都贴着以 Λ 为平均的泊松点，离散指数接近 1（本页 5 组模拟、所有窗口设置下在 0.81–1.21 之间）。再看读数下面一行：把忙闲不同的小时混在一起算，离散指数明显大于 1。在实际数据里，这正是「速率并不恒定」或「到达成群」的信号。',

    s7k: '第 7 步 · 收束', s7t: '一个速率 λ，推出一整套规律',
    s7fin: '回头看这条线：<strong>第 0 步</strong>，把时间切细、每片独立地以 λΔt 的概率来一个，极限就是泊松过程；<strong>第 1 步</strong>，长 w 的窗口里的个数服从平均 λw 的泊松分布，方差等于平均；<strong>第 2 步</strong>，间隔超过 t 就是 t 内一个都没来，所以间隔服从指数分布，平均 1/λ；<strong>第 3 步</strong>，指数分布无记忆，已经等了多久不影响还要等多久；<strong>第 4 步</strong>，于是随机时刻表下乘客平均要等满一个平均间隔，碰上的间隔平均是两倍长；<strong>第 5 步</strong>，独立的泊松流合并时速率相加，独立筛选时速率乘 p；<strong>第 6 步</strong>，速率变化时计数仍是泊松，平均换成速率曲线下的面积。',
    formula: 'P(w 内 k 个) = (λw)ᵏ e^(−λw) / k!\nP(间隔 > t) = e^(−λt)，平均间隔 1/λ\n合并 λ₁ + λ₂ · 筛选 pλ · 变速率 Λ = ∫ λ(t) dt',
    boundary: '适用范围：泊松模型要求各次到达互不影响、同一瞬间最多一次、速率已知（恒定或按已知曲线变化）。真实数据常常不满足：顾客成群而来（一辆旅游大巴）会让离散指数大于 1；预约制或机器节拍会让到达比泊松更规则，离散指数小于 1；计数器每记一次后有一段「死时间」收不到信号，间隔也就不再是指数分布。本页所有数据都是种子化的伪随机模拟，用来检验推论，不是实测记录。',
    linksTitle: '接着去哪儿',
    lk1: '→ 风险池化页第 1 步：理赔次数常按泊松建模，人多了总数反而可以预算',
    lk2: '→ 二项分布到正态页第 3 步：平均很大时，计数分布长成钟形',
    lk3: '→ 蒙特卡洛页第 1 步：用模拟出的比例估计概率，本页每个直方图都是这样来的',
    lk4: '→ 马尔可夫链页第 0 步：另一种「下一步只看现在」的随机过程',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《泊松过程 · 随机到达的规律》的平行版本。'
  },
  en: {
    pageTitle: 'The Poisson Process · Nobody Coordinates, Yet Arrivals Keep the Rules',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Poisson Process · The Pattern in Random Arrivals →',
    navLabel: 'Poisson process steps',
    tagline: 'A help-desk line: callers never consult each other and ring whenever their own day dictates. All we know is that about λ calls arrive per minute. What can that one number predict? How many calls in the next five minutes, how long until the next one, what happens when two lines are merged, what changes when the day has busy and quiet hours. Over eight steps we turn “random arrivals” into a model you can calculate with, then test each consequence against simulated call logs.',
    nav0: '0 Slice time', nav1: '1 Counts', nav2: '2 Gaps', nav3: '3 No memory', nav4: '4 Bus stop', nav5: '5 Merge & thin', nav6: '6 Changing rate', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Slicing time',
    s0t: 'What does “completely random, λ per minute on average” actually mean?',
    s0e: 'This step asks: how do we turn “random arrivals” into something we can calculate? Cut ten minutes into n slices, each Δt = 10/n minutes long, and let every slice <strong>independently</strong> flip a biased coin: with probability p = λ·Δt it holds one call, otherwise none. λ (lambda) is the <strong>rate</strong>, the average number of calls per minute. However finely you slice, the average number of calls in ten minutes stays μ = λ × 10. The chance of exactly k calls is then a <strong>binomial distribution</strong>: the probability of k successes in n independent tries, each succeeding with probability p (<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ Binomial to Normal, step 0: counting the paths to k successes</a>). As the slices shrink, the binomial settles onto a limit that depends on μ alone, the <strong>Poisson distribution</strong> P(k) = μᵏ e<sup>−μ</sup> / k!. The arrival pattern you get with infinitely thin slices is the <strong>Poisson process</strong>: constant rate, slices that do not influence each other, never two arrivals at the same instant.',
    sliceN: 'Number of slices n', lam0: 'Rate λ (calls per minute)', redraw0: 'Draw again',
    c0a: 'One draw: which slices of the 10 minutes got a call', c0b: 'Chance of k calls: binomial (bars) vs Poisson (dots)', c0c: 'Gap between the two (log scale)',
    s0lgHit: 'Slice with a call', s0lgBin: 'Binomial, n slices', s0lgPoi: 'Poisson, mean μ', s0lgTv: 'Total-variation distance (current n in cyan)',
    s0readout: 'n = {n} slices of {dt} min, each holding a call with probability p = λ·Δt = {p}. This draw has {k} calls (the bar outlined in cyan); the average should be μ = λ × 10 = {mu}. Total-variation distance between binomial and Poisson = {tv}: add up the absolute differences between the two probabilities at every k and halve the result; 0 means identical, smaller is closer.',
    s0hint: 'What to try: keep λ fixed and drag n from 10 to 2000. The “One draw” strip gets finer, yet each draw still lands near μ calls; in the “Chance of k calls” chart the orange bars (binomial) close in on the white dots (Poisson); in the “Gap between the two” chart the cyan bar drops, and once n is not tiny, ten times more slices means roughly ten times less distance. Then raise λ: p = λ·Δt grows, and coarse slicing shows a bigger gap, because a slice can hold at most one call.',

    s1k: 'Step 1 · How many in a window',
    s1t: 'Pick any w-minute stretch. How many calls will be in it?',
    s1e: 'This step asks: knowing only the rate λ, can we give the probability of “k calls in w minutes”? Below is a simulated 2400-minute call log, built exactly as in step 0 but sliced finer: every 0.001 minute is a slice that holds a call with probability λ × 0.001. Cut the log from the start into 400 back-to-back, non-overlapping <strong>windows</strong> of w minutes each, and count the calls in every window. Step 0 now makes a prediction: the counts follow a Poisson distribution with mean μ = λw, P(k) = μᵏ e<sup>−μ</sup> / k!. The Poisson distribution has one more signature: its <strong>variance</strong> also equals μ. Variance is the average squared distance of the counts from their mean, a measure of how widely they spread (<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ Probability Distributions, step 2: variance as spread</a>). So the <strong>dispersion index</strong>, variance ÷ mean, should sit near 1 for Poisson counts.',
    lam1: 'Rate λ (calls per minute)', w1: 'Window length w (minutes)', count1: 'Count window by window', reroll1: 'Another log',
    c1a: 'First 12 windows of the log (each w min; number below = calls inside)', c1b: '400 windows: how often each count k occurs',
    s1lgCall: 'One call', s1lgBar: 'Observed share', s1lgPoi: 'Poisson P(k), mean λw',
    s1progress: 'Counted {c}/{N} windows · ',
    s1readout: '{prog}Log {set}/5 · mean {m} calls per window (prediction λw = {mu}) · variance {v} · dispersion index = variance ÷ mean = {r}',
    s1hint: 'What to try: press “Count window by window” and watch the bars grow into the shape of the white dots. Then move λ and w separately: whenever the product λw is the same, so is the shape (try λ = 1, w = 4 against λ = 2, w = 2). Small λw piles the counts up near 0 with a tail to the right; large λw makes them nearly symmetric. Across this page’s five logs and every slider setting, the dispersion index stays between 0.81 and 1.19.',

    s2k: 'Step 2 · Between two calls',
    s2t: 'A call just came in. How long until the next one?',
    s2e: 'This step asks: what pattern do the <strong>gaps</strong> between consecutive calls follow? The data is still the step-1 log (rate λ is set in step 1); we take its first 1000 gaps. No new assumption is needed: “the gap is longer than t” means “no call at all in the next t minutes”, and step 1 gives that probability as the Poisson chance of k = 0, so P(gap > t) = e<sup>−λt</sup>. This curve is the <strong>survival curve</strong>: across is the length t, up is the share of gaps longer than t. The distribution it describes is the <strong>exponential distribution</strong>, with mean gap 1/λ. The lower chart draws the same gaps as a histogram whose bar heights are <strong>probability density</strong> (share in the bin ÷ bin width), against the curve λe<sup>−λt</sup>. The most common gaps are the shortest ones: calls bunch up on their own, with nobody arranging it.',
    t2: 'Length t (minutes)',
    c2a: 'Survival curve: share of gaps longer than t', c2b: 'Histogram of the gaps (probability density)',
    s2lgEmp: 'Observed (1000 gaps)', s2lgTh: 'Theory: e^(−λt); lower chart λe^(−λt)', s2lgT: 'Current t',
    s2readout: 'λ = {lam}: the 1000 gaps average {m} min (1/λ = {inv}). Gaps longer than t = {t} min: {e}%; theory e^(−λt) = {th}%.',
    s2hint: 'What to try: drag t and look where the vertical line crosses the staircase (observed) and the curve (theory); the readout gives both percentages. At t = 1/λ the theory says e^(−1) ≈ 37%: only about a third of gaps are longer than average, most are shorter, which is why the tallest bar in the lower chart is always one of the first two on the left. Change λ or the log in step 1 and this step follows.',

    s3k: 'Step 3 · Already waited a while',
    s3t: 'You have already waited s minutes. How much longer?',
    s3e: 'This step asks: does time already spent waiting “build up” and make the next call come sooner? Step 2 established that Poisson gaps are exponential, so here we draw 20000 gaps straight from an exponential distribution with a mean of 1 minute. For contrast we also draw 20000 gaps spread uniformly between 0 and 2 minutes (same 1-minute mean, but never longer than 2). Keep only the gaps longer than s, the cases where “s minutes have passed and still nothing”, and look at <strong>what is left</strong> of each one (gap − s). If that leftover wait has exactly the same distribution as a fresh wait, the distribution is called <strong>memoryless</strong>. The exponential is: P(gap > s + u | gap > s) = e<sup>−(s+u)</sup> / e<sup>−s</sup> = e<sup>−u</sup>, which does not depend on s.',
    s3: 'Already waited s (minutes)', kindExp: 'Exponential gaps (Poisson)', kindUnif: 'Uniform gaps 0–2 min (contrast)', clear3: 'Clear history',
    c3a: 'Histogram of the remaining wait (probability density)', c3b: 'Mean remaining wait vs time already waited s',
    s3lgHist: 'Remaining wait (observed)', s3lgFresh: 'Distribution of a fresh wait', s3lgExp: 'Exponential: always 1 min', s3lgUnif: 'Uniform: (2 − s)/2 min',
    kindNameExp: 'Exponential gaps', kindNameUnif: 'Uniform gaps',
    s3readout: '{kind}: {n} of 20000 gaps are longer than s = {s} min; their remaining wait averages {m} min (theory {th} min).',
    s3hint: 'What to try: with exponential gaps, drag s from 0 to 1.9. Fewer and fewer gaps survive (the count in the readout), yet the histogram keeps hugging the dashed fresh-wait curve, and the dots in the “Mean remaining wait” chart stay on the 1-minute line. Switch to uniform gaps: the longer you have waited, the shorter the rest, and the dots slide down the diagonal, because no gap exceeds 2 minutes. Memorylessness belongs to the exponential alone (and to the geometric distribution in discrete time); it is not a property of “random” waits in general.',

    s4k: 'Step 4 · The bus-stop paradox',
    s4t: 'Buses come every 10 minutes on average. Turn up at a random moment: how long do you wait?',
    s4e: 'A new setting for this step: over 20 hours a bus line delivers one bus every 10 minutes on average. Two timetables are compared: <strong>regular</strong> (exactly every 10 minutes) and <strong>random</strong> (buses arrive as a Poisson process, so the <strong>headway</strong>, the time between consecutive buses, is exponential with a 10-minute mean). 400 passengers turn up at independent random moments and each waits for the next bus. Averaged over buses, both timetables have headways of about 10 minutes. But a passenger is more likely to land in a long headway, simply because long headways cover more of the clock. So the headway a passenger experiences, averaged over passengers, is longer than the average over buses. This is the <strong>inspection paradox</strong>, also called length bias.',
    quizPrompt: 'Guess first: with a random timetable averaging one bus every 10 minutes, how long does a passenger who turns up at random wait on average?',
    quizA: 'About 5 minutes: half a headway', quizB: 'About 10 minutes', quizC: 'About 20 minutes', check: 'Check',
    correct: 'Right. By step 3’s memorylessness, the moment a passenger arrives, the time to the next bus is still exponential with a 10-minute mean, whatever happened since the last one. Press the button below to see the simulation.',
    wrong: 'Think back to step 3: exponential gaps have no memory, so from any moment you wait a whole average gap. Press the button below to send passengers to the stop; the readout gives the answer.',
    modeReg: 'Regular timetable', modePoi: 'Random timetable (Poisson)', pax4: 'Send 400 passengers to the stop', reroll4: 'Another day',
    c4a: 'First 120 min: buses (lines) and passengers (dots; dash = their wait)', c4b: 'How long passengers waited',
    s4lgBus: 'Bus arrives', s4lgPax: 'Passenger and their wait', s4lgMean: 'Mean wait (observed)', s4lgTh: 'Long-run theory',
    modeNameReg: 'Regular', modeNamePoi: 'Random',
    s4progress: '{c}/{N} passengers so far · ',
    s4idle: '{mode} timetable: {b} buses today, mean headway over buses {h} min. Press “Send 400 passengers to the stop” to begin.',
    s4readout: '{prog}{mode}: passengers wait {w} min on average (long-run theory {tw}) | mean headway over buses {h} min, over passengers {g} min ({x}×) | headways longer than 10 min are {hl}% of buses but hold {pl}% of passengers.',
    s4hint: 'What to try: choose the regular timetable and press the button. Waits spread evenly between 0 and 10 minutes, about 5 on average. Repeat with the random timetable: the top chart now has very long and very short headways, and most passenger dots sit in the long ones; the mean wait is about 10 minutes, and the headway passengers experience averages about 20, roughly twice the average over buses (1.76–2.05× across this page’s five simulated days). Use “Another day” to see how the numbers wobble; switching timetables shows the whole day’s passengers at once.',

    s5k: 'Step 5 · Merging and thinning',
    s5t: 'Merge two help lines into one, then pass on only some calls. Still a Poisson process?',
    s5e: 'This step asks whether a Poisson process survives two everyday operations. <strong>Merging</strong>: two independent lines A and B (Poisson processes with rates λ₁ and λ₂) feed one switchboard; look at the calls the switchboard sees. <strong>Thinning</strong>: each switchboard call is independently passed to an expert with probability p; look at the calls the expert sees. The claims: the switchboard is a Poisson process with rate λ₁ + λ₂, and each of its calls came from A with probability λ₁/(λ₁ + λ₂); the expert is a Poisson process with rate p(λ₁ + λ₂). The reason goes back to step 0’s slices: in a slice Δt, A rings with probability λ₁Δt and B with λ₂Δt, both at once only with probability of order Δt², which vanishes, so together the chance is (λ₁ + λ₂)Δt; thinning just multiplies each slice’s chance by p. Below, a 1000-minute simulated log checks this; the expert’s stream is cut into 1-minute windows to compute its <strong>dispersion index</strong> (variance ÷ mean), which should be near 1 for Poisson counts.',
    l1: 'Line A rate λ₁ (calls per minute)', l2: 'Line B rate λ₂ (calls per minute)', p5: 'Chance p of passing a call to the expert', reroll5: 'Another log',
    c5a: 'First {m} min: lines A and B, switchboard, expert', c5b: 'Survival curve of the switchboard’s gaps',
    rowA: 'A', rowB: 'B', rowM: 'Desk', rowK: 'Expert',
    s5lgA: 'Call on line A', s5lgB: 'Call on line B', s5lgK: 'Passed to expert', s5lgEmp: 'Observed', s5lgTh: 'Theory e^(−(λ₁+λ₂)t)',
    s5readout: 'Over 1000 min: switchboard {m} calls/min (λ₁ + λ₂ = {ms}) · {sa}% from A (λ₁/(λ₁+λ₂) = {sth}%) · mean gap {g} min (1/(λ₁+λ₂) = {gth}) | expert {k} calls/min (p(λ₁+λ₂) = {kth}) · expert dispersion index {r}',
    s5none: 'undefined (the expert got no calls)',
    s5hint: 'What to try: move λ₁ and λ₂ first. The switchboard row gains or loses dots and its colour mix follows the two rates; in the lower chart the staircase keeps hugging the curve for rate λ₁ + λ₂. Then move p: the expert row thins out, yet its dispersion index stays near 1; thinning makes it neither more regular nor more bunched. At p = 0 the expert gets no calls and the index is undefined.',

    s6k: 'Step 6 · When the rate changes',
    s6t: 'Quiet mornings, busy lunchtimes: does the Poisson model still work?',
    s6e: 'This step asks: if the rate changes over the day, are counts still Poisson? The line is open 8:00–20:00. Its rate λ(t), in calls per hour, climbs through the morning, eases after lunch and peaks again in the early evening (the upper curve; a scenario set up for this page, not measured data). As long as calls at different moments still do not influence each other, this is a <strong>non-homogeneous Poisson process</strong>: the number of calls in a window [a, b] is Poisson with mean Λ equal to the <strong>area</strong> under the rate curve over that window (rate × time, added up piece by piece). How it is simulated: scatter candidate calls at the top rate of 15 per hour, then keep each candidate with probability λ(t)/15, which yields exactly a process with rate λ(t). 500 days are simulated.',
    a6: 'Window start', w6: 'Window length (hours)', reroll6: 'Another 500 days',
    c6a: 'Rate λ(t) (calls per hour) and the chosen window', c6b: 'Calls in this window across 500 days',
    s6lgRate: 'Rate λ(t)', s6lgArea: 'Area Λ inside the window', s6lgDay: 'Day 1’s calls (thin ticks)', s6lgBar: 'Observed share', s6lgPoi: 'Poisson P(k), mean Λ',
    s6readout: 'Window {a}–{b}: area Λ = {L} calls | over 500 days mean {m} · variance {v} · dispersion index {r}',
    s6pooled: 'Now ignore the changing rate and pool the counts of each day’s 12 whole hours (6000 counts in all): mean {m} · variance {v} · dispersion index {r} (theory {rt}). The variance exceeds the mean because the hours have different Λ to begin with.',
    s6hint: 'What to try: drag the window start and watch the shaded area and the lower chart’s mean move together; in the busy hours the bars shift right and widen. Wherever the window sits, the bars follow the Poisson dots with mean Λ and the dispersion index stays near 1 (between 0.81 and 1.21 across this page’s five simulations and every window setting). Then read the line under the readout: pooling busy and quiet hours pushes the index well above 1. In real data that is exactly the signal that the rate is not constant, or that arrivals come in clumps.',

    s7k: 'Step 7 · Wrap-up', s7t: 'One rate λ, a whole set of laws',
    s7fin: 'Looking back: <strong>step 0</strong>, slice time finely and let each slice independently hold a call with probability λΔt; the limit is the Poisson process. <strong>Step 1</strong>, the count in a window of length w is Poisson with mean λw, and its variance equals its mean. <strong>Step 2</strong>, a gap longer than t means no call within t, so gaps are exponential with mean 1/λ. <strong>Step 3</strong>, the exponential is memoryless: how long you have waited says nothing about how long is left. <strong>Step 4</strong>, so with a random timetable a passenger waits a whole average headway, and the headway they land in is twice as long on average. <strong>Step 5</strong>, merging independent Poisson streams adds their rates; independent thinning multiplies the rate by p. <strong>Step 6</strong>, with a changing rate the counts are still Poisson, with the mean replaced by the area under the rate curve.',
    formula: 'P(k in w) = (λw)ᵏ e^(−λw) / k!\nP(gap > t) = e^(−λt), mean gap 1/λ\nmerge λ₁ + λ₂ · thin pλ · varying rate Λ = ∫ λ(t) dt',
    boundary: 'Where this holds: the Poisson model needs arrivals that do not influence each other, never two at the same instant, and a known rate (constant, or following a known curve). Real data often breaks these: customers arriving in groups (a coach party) push the dispersion index above 1; appointments or machine cycles make arrivals more regular than Poisson, with an index below 1; a counter that goes blind for a “dead time” after every click no longer sees exponential gaps. Every data set on this page is a seeded pseudo-random simulation used to test the claims, not a real recording.',
    linksTitle: 'Where to next',
    lk1: '→ Risk Pooling, step 1: claim counts are often modelled as Poisson, and in a large pool the total becomes predictable',
    lk2: '→ Binomial to Normal, step 3: with a large mean, count distributions grow into a bell',
    lk3: '→ Monte Carlo, step 1: estimating a probability from simulated shares, which is how every histogram here was made',
    lk4: '→ Markov Chains, step 0: another random process whose next step depends only on now',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Poisson Process · The Pattern in Random Arrivals”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
