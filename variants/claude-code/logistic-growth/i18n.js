'use strict';
// Population Growth (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '种群增长 · S 形曲线从哪来',
    back: '← 知识索引',
    compare: '对照另一版本：种群增长 · S 形曲线从哪来 →',
    navLabel: '种群增长步骤导航',
    tagline: '一个细菌每 20 分钟分裂一次，两天不到，后代的总质量就会超过地球。现实里当然不会这样。是什么把增长刹住的？刹车装在哪里？八步里你会从「每个个体平均长多快」这个量出发，推出 S 形曲线，找到它最陡的位置，验证容纳量 K 是吸引子而不是一堵墙，用一组真实的酵母数据拟合模型，最后看离散模型在增长率过大时怎样振荡、失控。',
    nav0: '0 翻倍', nav1: '1 增长率 r', nav2: '2 越挤越慢', nav3: '3 最陡的一刻', nav4: '4 K 是吸引子', nav5: '5 真实数据', nav6: '6 r 过大', nav7: '7 收束',

    s0k: '第 0 步 · 没有刹车会怎样',
    s0t: '一个细菌不停地分裂，一天后它的后代有多重？',
    s0e: '这一步要回答：如果什么都不限制，种群能长多快？大肠杆菌在营养充足、温度合适的培养液里大约每 20 分钟分裂一次，一个变两个。每分裂一次叫一<strong>代</strong>，于是第 g 代有 2<sup>g</sup> 个细菌：1、2、4、8……这是公比为 2 的<a class="xlink" href="../../../math/algebra/sequences-series/#step2">等比数列（→ 数列与求和第 2 步）</a>。一个大肠杆菌约重 1 皮克（10<sup>−12</sup> 克）。先押一个答案，再拖下面的「代数」滑杆。',
    q0: '先押：从 1 个细菌开始，一天（72 代）以后，后代总共大约多重？',
    q0a: '约 1 克', q0b: '约 1 吨', q0c: '约 5000 吨',
    check: '检查',
    fb0right: '对。2⁷² ≈ {N} 个，乘以 1 皮克约 {mass}。',
    fb0wrong: '比你押的重得多：2⁷² ≈ {N} 个，乘以 1 皮克约 {mass}。',
    fb0none: '先选一个答案。',
    c0a: '细菌数随代数增长的柱状图',
    c0lin: '细菌数（线性纵轴）· 横轴：代数', c0log: '细菌数（对数纵轴：等高差 = 等倍数）· 横轴：代数',
    gens: '代数 g（每代 20 分钟）',
    logScale: '纵轴改成对数', play0: '从第 0 代播放到第 144 代',
    s0readout: '第 {g} 代（{h} 小时）：{N} 个细菌，总重约 {mass}。{cmp}',
    cmpObj: '已经比{obj}还重。', cmpEarth: '已经是地球质量的 {x} 倍。',
    o_human: '一个成年人（约 60 kg）', o_whale: '一头蓝鲸（约 150 吨）', o_pyramid: '胡夫金字塔（约 600 万吨）', o_earth: '地球',
    unit_g: '{v} 克', unit_kg: '{v} 千克', unit_t: '{v} 吨',
    s0hint: '观察顺序：先用线性纵轴拖滑杆：不管拖到第几代，图上都只有最后几根柱子看得见，前面的全贴在地上，因为每一根都是前一根的 2 倍。再按「纵轴改成对数」：对数纵轴上同样的高度差代表同样的倍数（相邻两条刻度线之间的倍数都相同），所以每代 ×2 的柱子排成一条斜直线。读数里的质量对照会依次越过一个人、一头蓝鲸、一座金字塔，第 {earthGen} 代（约 {earthH} 小时）越过地球。所以真实种群一定会在某处被刹住。',

    s1k: '第 1 步 · 增长率 r',
    s1t: '世代交叠时，怎样用一个数描述「长得多快」？',
    s1e: '这一步要回答：多数种群不会整齐地一代一代翻倍，而是随时都有出生和死亡；这时用什么描述增长？用<strong>内禀增长率 r</strong>：在资源不受限时，平均每个个体每小时带来的净增数（出生率减死亡率）。于是整个种群每小时增加 r·N，写成 dN/dt = rN，解是 N(t) = N₀e<sup>rt</sup>，叫<strong>指数增长</strong>。它翻一倍需要的时间固定为 ln2 ÷ r，与此刻有多少个体无关（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ 指数与对数第 2 步：用对数求翻倍时间</a>）。本页最关键的一个量是<strong>个体平均增长率</strong>（dN/dt）÷ N，也就是平均每个个体每小时带来几个新增；在指数模型里它恒等于 r。下面两张图：标题为「个体数 N」的图画出 N₀ = 10 时的增长，标题为「个体平均增长率」的图画出这个量与 N 的关系。',
    c1a: '指数增长曲线', c1b: '个体平均增长率与个体数的关系',
    c1title: '个体数 N · 横轴：时间（小时）', c1btitle: '个体平均增长率（每小时）· 横轴：N',
    lgExp: '指数增长 N₀e^(rt)', lgDoubling: '每翻一倍的时刻', lgPrevR: '你之前试过的 r',
    rSlider: '内禀增长率 r（每小时）',
    s1readout: 'r = {r}：翻倍时间 ln2 ÷ r = {td} 小时；从 10 涨到 1000（100 倍）要 ln100 ÷ r = {t100} 小时。不管 N 是 10 还是 1000，个体平均增长率都是 {r}。',
    s1hint: '观察顺序：拖 r，看标题为「个体数 N」的图里白点（每翻一倍的时刻）的间距：r 加倍，间距减半，而间距在整条曲线上处处相等。再看「个体平均增长率」那张图：不管 N 多大，它都是一条水平线，这就是指数增长停不下来的原因。灰色虚线留着你之前试过的 r，方便对比。',

    s2k: '第 2 步 · 越挤越慢',
    s2t: '资源有限时，增长的刹车装在哪里？',
    s2e: '这一步要回答：食物和空间有限时，增长是怎样慢下来的？最简单的假设是：个体越多、越拥挤，每个个体能贡献的净增越少；个体平均增长率从 N 很小时的 r，随 N 直线下降，到 N = <strong>K</strong> 时降为 0。K 叫<strong>环境容纳量</strong>：这个环境长期能维持的最大个体数。写成式子，个体平均增长率 = r(1 − N/K)，于是 dN/dt = rN(1 − N/K)，这叫<strong>逻辑斯蒂方程</strong>。标题为「个体数 N」的图把它和同一个 r、同一个起点 N₀ = 10 的指数增长画在一起；标题为「个体平均增长率」的图画出刹车本身：一条从 r 降到 0 的斜线。',
    c2a: '逻辑斯蒂增长与指数增长对照', c2b: '两种模型的个体平均增长率随 N 的变化',
    c2title: '个体数 N · 横轴：时间（小时）', c2btitle: '个体平均增长率（每小时）· 横轴：N',
    lgLog: '逻辑斯蒂增长', lgExpSame: '同 r、同起点的指数增长', lgK: '容纳量 K',
    kSlider: '容纳量 K', tSlider: '时刻 t（小时）', play2: '从 t = 0 播放到 24 小时',
    s2readout: 't = {t} 小时：逻辑斯蒂模型 N = {nl}，同 r 的指数模型 N = {ne}。此刻个体平均增长率 r(1 − N/K) = {pc}，只剩 r 的 {pct}%。',
    s2hint: '观察顺序：按「播放」，同时看两张图。开始时 N 远小于 K，「个体平均增长率」图上的点几乎停在 r 的高度，两条增长曲线重合；N 到 K 的一半时，个体平均增长率只剩一半，青色曲线明显落到橙色虚线下面；接近 K 时个体平均增长率趋于 0，曲线走平。所以 S 形不是额外画上去的，而是个体平均增长率逐渐降到 0 的直接结果。再拖 K：K 只改变曲线最终停在哪，早期那一段几乎不变。',

    s3k: '第 3 步 · 最陡的一刻',
    s3t: '整个种群什么时候长得最快？',
    s3e: '这一步要回答：S 形曲线上，每小时新增个数最多是在什么时候？注意区分两个量：个体平均增长率 r(1 − N/K) 一开始最大；但整个种群每小时的新增数 dN/dt = rN(1 − N/K) 还要乘上 N。N 小时每个个体贡献多但个体少，N 接近 K 时个体多但每个几乎不贡献，两头都慢。dN/dt 关于 N 是一条开口向下的抛物线，最高点在 <strong>N = K/2</strong>，最大值为 rK/4；这时 S 形曲线最陡，这个点叫<strong>拐点</strong>。本步固定 r = 0.5/小时、K = 600、N₀ = 10。',
    c3a: 'S 形曲线及其切线', c3b: '增长速度 dN/dt 与 N 的关系（抛物线）',
    c3title: '个体数 N · 横轴：时间（小时）', c3btitle: '每小时新增数 dN/dt · 横轴：N',
    lgTangent: '此刻的切线（斜率 = dN/dt）', lgParab: 'dN/dt = rN(1 − N/K)',
    play3: '沿曲线播放',
    s3readout: 't = {t} 小时：N = {n}，每小时新增 dN/dt = {g}（切线斜率）。最快的时刻在 N = K/2 = {half}，t ≈ {ts} 小时，每小时新增 rK/4 = {pk}。',
    s3hint: '观察顺序：按「沿曲线播放」，看标题为「个体数 N」的图里橙色切线怎样先变陡、再变平；同时看另一张图里的点沿抛物线爬到顶、再滑下来。两张图上的点在同一刻到达「最陡」和「最高」，竖虚线标出这个时刻。应用：渔业里「最大可持续产量」的想法就是把鱼群维持在 K/2 附近，每年最多捕走 rK/4。但 r 和 K 很难估准、环境也在变，历史上按这种思路管理的渔业仍有崩溃的，比如 1992 年加拿大纽芬兰的鳕鱼渔业被迫关闭。',

    s4k: '第 4 步 · K 是吸引子',
    s4t: '从 K 上方出发会怎样？K 是一堵墙，还是一个会被拉回去的位置？',
    s4e: '这一步要回答：如果起点就超过 K（比如一群鹿被迁到一块更小的草场），种群会怎样变化？N > K 时 1 − N/K 为负，个体平均增长率是负的，种群会减少。所以 K 不是一堵挡住增长的墙，而是一个<strong>平衡点</strong>（dN/dt = 0 的位置），并且从两侧都会被拉回来，这样的平衡点叫<strong>稳定平衡点</strong>，也叫吸引子。N = 0 也是平衡点，但它<strong>不稳定</strong>：只要有一个个体，种群就会离开 0。标题为「方向」的图把 dN/dt 画成 N 的函数：曲线在横轴上方，N 增大（箭头向右）；在下方，N 减小（箭头向左）。本步沿用 r = 0.5、K = 600。',
    c4a: '不同起点的增长轨迹', c4b: 'dN/dt 与 N 的关系以及运动方向',
    c4title: '个体数 N · 横轴：时间（小时）', c4btitle: '方向：dN/dt · 横轴：N',
    lgBelow: '起点低于 K 的轨迹', lgAbove: '起点高于 K 的轨迹', lgStart: '当前起点', lgStable: '稳定平衡点 K', lgUnstable: '不稳定平衡点 0',
    n0Slider: '起点 N₀', add4: '从这个起点出发', clear4: '清掉所有轨迹',
    s4readout: '{list}。', s4empty: '还没有轨迹：选一个起点，按「从这个起点出发」。',
    s4item: '起点 {n0} → 24 小时后 {n}', s4sep: '；',
    s4zero: '起点 0 → 一直是 0（没有个体就不会有增长）',
    s4hint: '观察顺序：默认已从 1000 出发（高于 K）。再把起点拖到 50、300、600、900，各按一次「从这个起点出发」。所有轨迹都向 K = 600 靠拢：低于 K 的往上、高于 K 的往下，而起点恰为 600 的那条是水平线。再试起点 0：它不动。在「方向」图里，每条轨迹的起点都对应横轴上的一个位置，箭头告诉你它往哪走。',

    s5k: '第 5 步 · 真实数据',
    s5t: '真实的种群，真的长成 S 形吗？',
    s5e: '这一步要回答：一组真实的测量数据，能不能被逻辑斯蒂曲线描述，r 和 K 各是多少？下面的白点是 Carlson 1913 年发表、Pearl 1927 年整理的酵母培养实验：每小时测一次培养液里的酵母量（原文的相对单位），共 18 小时。曲线固定起点为第一次测量值 9.6，你来调 r 和 K。衡量拟合好坏用<strong>残差</strong>（测量值减模型值，图上的粉色竖线）：把所有残差平方后加起来叫<strong>残差平方和</strong>，越小越好；使它最小的 r、K 叫<strong>最小二乘</strong>估计。',
    c5a: '酵母数据与逻辑斯蒂拟合',
    c5title: '酵母量（相对单位）· 横轴：时间（小时）',
    lgData: 'Carlson 的测量值', lgModel: '你的逻辑斯蒂曲线', lgResid: '残差', lgExpFit: '只拟合前 7 小时的指数曲线',
    fit5: '自动拟合（最小二乘）', exp5: '对照：指数模型',
    s5readout: 'r = {r}/小时，K = {K}：残差平方和 {sse}，均方根误差 {rms}（相当于每个点平均偏离这么多）。{best}',
    s5best: '这是滑杆能取到的、离最小二乘最优最近的位置。', s5notbest: '最小二乘最优在 r ≈ {rb}、K ≈ {kb}，均方根误差 {rmsb}。',
    s5exp: '指数曲线用前 7 小时拟合出 r = {re}，到第 18 小时预测 {pe}，而实测只有 {obs}。',
    s5hint: '观察顺序：先只拖 K，让曲线最后走平的高度对上最后几个白点；再拖 r，让中间最陡那一段对齐。看粉色竖线变短、残差平方和变小。然后按「自动拟合」对照你的结果。最后打开「对照：指数模型」：它把前几小时描得很好，但之后一路冲出图外。拟合得好只说明这组数据可以用这条曲线描述；酵母停长的原因（养分耗尽、酒精积累）不在模型里。',

    s6k: '第 6 步 · r 过大',
    s6t: '如果繁殖是一年一次、一代一代地发生，r 太大会怎样？',
    s6e: '这一步要回答：前面的曲线都是连续变化的；如果种群一年只繁殖一次（很多昆虫就是这样），模型变成按代计算：N<sub>t+1</sub> = N<sub>t</sub> + rN<sub>t</sub>(1 − N<sub>t</sub>/K)。差别在于反应有<strong>滞后</strong>：这一代的增量由上一代的拥挤程度决定，增量一次加上去，可能直接越过 K。下面把 N 用 K 作单位（纵轴 1 就是 K），起点 0.05K。标题为「蛛网图」的图横轴是这一代、纵轴是下一代：绿色抛物线是递推规则，从对角线弹到抛物线、再弹回对角线，就是一代一代往下算。1976 年生态学家 May 指出，这个简单的规则在 r 足够大时会出现<a class="xlink" href="../../../physics/mechanics/chaos-threebody/#step0">混沌（→ 混沌与三体第 0 步：差一丝，结果天壤）</a>。',
    c6a: '按代计算的种群数量', c6b: '蛛网图：这一代 → 下一代',
    c6title: 'N / K · 横轴：代数', c6btitle: '蛛网图 · 横轴 Nₜ/K，纵轴 Nₜ₊₁/K',
    lgSeries: '每代的 N/K', lgMap: '递推规则', lgDiag: '对角线 Nₜ₊₁ = Nₜ', lgCobweb: '一代一代的路径',
    rDisc: '每代增长率 r',
    p6a: 'r = 0.8', p6b: 'r = 1.8', p6c: 'r = 2.2', p6d: 'r = 2.8',
    s6readout: 'r = {r}：{kind}',
    k_monotone: '单调地逼近 K，不越过（r ≤ 1 时都是这样）。',
    k_damped: '先越过 K，再来回摆动，摆幅越来越小，最后停在 K（1 < r ≤ 2）。',
    k_cycle: '不再停在 K，而是在 {p} 个数值之间循环往复。',
    k_chaos: '没有规律地跳动，永不重复：这就是混沌。起点差一丝，几十代后就完全不同。',
    s6hint: '观察顺序：依次按 r = 0.8、1.8、2.2、2.8 四个按钮，再自己慢慢拖。看蛛网图：r ≤ 1 时路径像楼梯一样爬到交点；1 到 2 之间绕着交点转圈、越转越小；超过 2 以后转圈不再收缩，先在 2 个值之间跳，约 2.45 起变成 4 个值，约 2.57 以后变成混沌。读数里的分类是对 3000 代以后的尾部实际计算得到的。这说明「离散模型 + 大 r」本身就能产生剧烈波动；但真实种群的波动还可能来自天敌、气候等，本页不能区分。',

    s7k: '第 7 步 · 收束',
    s7t: '把八步连成一句话',
    s7fin: '没有限制时，个体平均增长率恒为 r，种群指数增长，翻倍时间 ln2 ÷ r 固定不变（第 0、1 步）。资源有限时，个体平均增长率随 N 直线降到 0，dN/dt = rN(1 − N/K) 给出 S 形曲线（第 2 步）；整个种群在 N = K/2 时长得最快，每小时 rK/4（第 3 步）；K 是从两侧都会被拉回去的稳定平衡点（第 4 步）。酵母的真实数据可以用 r ≈ 0.54/小时、K ≈ 664 很好地描述（第 5 步）。按代计算时，r 超过 1 会越过 K，超过 2 会持续振荡，再大会变成混沌（第 6 步）。',
    formula: 'dN/dt = rN(1 − N/K)　　N(t) = K / (1 + ((K − N₀)/N₀)·e^(−rt))',
    boundary: '模型边界：逻辑斯蒂方程假设个体平均增长率随 N 直线下降、立刻对拥挤作出反应、r 和 K 不随时间变化，并且只有一个物种。真实种群有年龄结构、天敌和竞争者、季节和随机波动，K 也会随环境改变。第 0 步的细菌是理想化的计算；第 5 步的拟合只说明曲线能描述这组数据，不能说明停长的机制；第 6 步的振荡来自离散模型本身的滞后。',
    linksTitle: '接着看',
    lk1: '→ 指数与对数 · 第 2 步：为什么翻倍时间是 ln2 ÷ r',
    lk2: '→ 数列与求和 · 第 2 步：等比数列，翻倍增长的离散版本',
    lk3: '→ 种群生态学 · 第 2 步：加上捕食者，曲线为什么会起伏',
    lk4: '→ 混沌与三体 · 第 0 步：初始差一丝，结果天壤',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《种群增长 · S 形曲线从哪来》的平行版本。'
  },
  en: {
    pageTitle: 'Population Growth · Where the S-Curve Comes From',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Population Growth · Where the S-Curve Comes From →',
    navLabel: 'Population growth lesson steps',
    tagline: 'A bacterium that divides every 20 minutes would, in under two days, leave descendants heavier than the Earth. Obviously that never happens. What puts the brakes on growth, and where do the brakes sit? In eight steps you will start from one quantity, how fast each individual adds to the population on average, derive the S-curve from it, find where it is steepest, check that the carrying capacity K is an attractor rather than a wall, fit the model to a real yeast dataset, and watch a generation-by-generation model oscillate and lose control when the growth rate is too high.',
    nav0: '0 Doubling', nav1: '1 Growth rate r', nav2: '2 Crowding slows it', nav3: '3 The steepest moment', nav4: '4 K attracts', nav5: '5 Real data', nav6: '6 r too high', nav7: '7 Wrap-up',

    s0k: 'Step 0 · No brakes',
    s0t: 'A bacterium keeps dividing. How heavy are its descendants a day later?',
    s0e: 'The question here: with nothing holding it back, how fast can a population grow? In warm, nutrient-rich broth E. coli divides about every 20 minutes, one cell becoming two. Each round of division is a <strong>generation</strong>, so generation g holds 2<sup>g</sup> cells: 1, 2, 4, 8, … a <a class="xlink" href="../../../math/algebra/sequences-series/#step2">geometric sequence with ratio 2 (→ Sequences & Series, step 2)</a>. One E. coli cell weighs about 1 picogram (10<sup>−12</sup> g). Place a bet, then drag the generations slider below.',
    q0: 'Your bet: starting from one bacterium, about how much do its descendants weigh after one day (72 generations)?',
    q0a: 'about 1 gram', q0b: 'about 1 tonne', q0c: 'about 5000 tonnes',
    check: 'Check',
    fb0right: 'Right. 2⁷² ≈ {N} cells; at 1 picogram each that is about {mass}.',
    fb0wrong: 'Far heavier than your bet: 2⁷² ≈ {N} cells; at 1 picogram each that is about {mass}.',
    fb0none: 'Choose an answer first.',
    c0a: 'Bar chart of bacteria count by generation',
    c0lin: 'Bacteria (linear axis) · across: generation', c0log: 'Bacteria (log axis: equal steps = equal factors) · across: generation',
    gens: 'Generations g (20 minutes each)',
    logScale: 'Switch to a log axis', play0: 'Play from generation 0 to 144',
    s0readout: 'Generation {g} ({h} h): {N} bacteria weighing about {mass}. {cmp}',
    cmpObj: 'Already heavier than {obj}.', cmpEarth: 'Already {x} times the mass of the Earth.',
    o_human: 'an adult human (about 60 kg)', o_whale: 'a blue whale (about 150 t)', o_pyramid: 'the Great Pyramid (about 6 million t)', o_earth: 'the Earth',
    unit_g: '{v} g', unit_kg: '{v} kg', unit_t: '{v} t',
    s0hint: 'What to try: drag the slider on the linear axis first. Whichever generation you pick, only the last few bars are visible and the rest hug the floor, because each bar is twice the one before. Then switch to the log axis, where equal heights mean equal factors (every gap between neighbouring ticks is the same factor), so bars that ×2 every generation line up along a straight slope. The mass comparison in the readout passes a person, a blue whale and a pyramid, and overtakes the Earth at generation {earthGen} (about {earthH} hours). Real populations must therefore be braked somewhere.',

    s1k: 'Step 1 · The growth rate r',
    s1t: 'When generations overlap, how do you sum up "how fast" with one number?',
    s1e: 'The question here: most populations do not double in neat generations; births and deaths happen all the time. What describes growth then? The <strong>intrinsic growth rate r</strong>: with unlimited resources, the average net number of newcomers each individual adds per hour (birth rate minus death rate). The whole population then gains r·N per hour, written dN/dt = rN, whose solution N(t) = N₀e<sup>rt</sup> is called <strong>exponential growth</strong>. The time to double is always ln2 ÷ r, however many individuals there are (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ Exponents & Logarithms, step 2: logarithms give the doubling time</a>). The key quantity for this whole page is the <strong>per-capita growth rate</strong> (dN/dt) ÷ N, the average number of newcomers per individual per hour; in the exponential model it always equals r. In the two charts below, the one titled "Population N" shows growth from N₀ = 10, and the one titled "Per-capita growth rate" plots that quantity against N.',
    c1a: 'Exponential growth curve', c1b: 'Per-capita growth rate against population size',
    c1title: 'Population N · across: time (hours)', c1btitle: 'Per-capita growth rate (per hour) · across: N',
    lgExp: 'exponential growth N₀e^(rt)', lgDoubling: 'each doubling', lgPrevR: 'r values you tried before',
    rSlider: 'Intrinsic growth rate r (per hour)',
    s1readout: 'r = {r}: doubling time ln2 ÷ r = {td} h; growing from 10 to 1000 (×100) takes ln100 ÷ r = {t100} h. Whether N is 10 or 1000, the per-capita growth rate is {r}.',
    s1hint: 'What to try: drag r and watch the spacing of the white dots (each doubling) in the chart titled "Population N": doubling r halves the spacing, and the spacing is the same all along the curve. Then look at the "Per-capita growth rate" chart: whatever N is, it is a flat line, which is exactly why exponential growth never stops. The grey dashed curves keep the r values you tried earlier, for comparison.',

    s2k: 'Step 2 · Crowding slows it',
    s2t: 'With limited resources, where do the brakes on growth sit?',
    s2e: 'The question here: when food and space run short, how does growth slow down? The simplest assumption is that the more crowded it gets, the less each individual adds: the per-capita growth rate starts at r when N is small and falls in a straight line, reaching 0 at N = <strong>K</strong>. K is the <strong>carrying capacity</strong>, the largest population the environment can sustain in the long run. As a formula, per-capita growth rate = r(1 − N/K), so dN/dt = rN(1 − N/K), the <strong>logistic equation</strong>. The chart titled "Population N" draws it alongside exponential growth with the same r and the same start N₀ = 10; the chart titled "Per-capita growth rate" shows the brake itself: a straight line falling from r to 0.',
    c2a: 'Logistic and exponential growth compared', c2b: 'Per-capita growth rate of both models against N',
    c2title: 'Population N · across: time (hours)', c2btitle: 'Per-capita growth rate (per hour) · across: N',
    lgLog: 'logistic growth', lgExpSame: 'exponential growth, same r and start', lgK: 'carrying capacity K',
    kSlider: 'Carrying capacity K', tSlider: 'Time t (hours)', play2: 'Play from t = 0 to 24 hours',
    s2readout: 't = {t} h: logistic model N = {nl}; exponential model with the same r N = {ne}. Per-capita growth rate now r(1 − N/K) = {pc}, only {pct}% of r.',
    s2hint: 'What to try: press "Play" and watch both charts together. Early on N is far below K, the dot in the per-capita chart sits almost at height r, and the two growth curves coincide. When N reaches half of K the per-capita rate is down to half, and the cyan curve falls visibly below the orange dashed one. Near K the per-capita rate approaches 0 and the curve levels off. So the S shape is not drawn on separately; it follows directly from the per-capita rate sinking to 0. Then drag K: it only changes where the curve finally levels off, while the early stretch barely moves.',

    s3k: 'Step 3 · The steepest moment',
    s3t: 'When is the population as a whole growing fastest?',
    s3e: 'The question here: on the S-curve, when is the number of newcomers per hour largest? Keep two quantities apart. The per-capita rate r(1 − N/K) is largest at the start, but the whole population\'s gain per hour, dN/dt = rN(1 − N/K), multiplies it by N. When N is small each individual adds a lot but there are few of them; near K there are many, but each adds almost nothing. Both ends are slow. As a function of N, dN/dt is a downward parabola with its peak at <strong>N = K/2</strong> and maximum rK/4; that is where the S-curve is steepest, a point called the <strong>inflection point</strong>. This step fixes r = 0.5 per hour, K = 600, N₀ = 10.',
    c3a: 'S-curve with its tangent', c3b: 'Growth speed dN/dt against N (a parabola)',
    c3title: 'Population N · across: time (hours)', c3btitle: 'Newcomers per hour dN/dt · across: N',
    lgTangent: 'tangent now (slope = dN/dt)', lgParab: 'dN/dt = rN(1 − N/K)',
    play3: 'Play along the curve',
    s3readout: 't = {t} h: N = {n}, newcomers per hour dN/dt = {g} (the tangent\'s slope). Fastest at N = K/2 = {half}, t ≈ {ts} h, with rK/4 = {pk} newcomers per hour.',
    s3hint: 'What to try: press "Play along the curve" and watch the orange tangent in the chart titled "Population N" steepen and then flatten, while the dot in the other chart climbs the parabola to its top and slides back down. The two dots reach "steepest" and "highest" at the same moment, marked by the vertical dashed line. Application: the fisheries idea of "maximum sustainable yield" keeps a fish stock near K/2 and takes at most rK/4 a year. But r and K are hard to estimate and conditions change, and fisheries managed along these lines have still collapsed; Canada\'s Newfoundland cod fishery, for example, was shut down in 1992.',

    s4k: 'Step 4 · K attracts',
    s4t: 'What happens if you start above K? Is K a wall, or a level the population is pulled back to?',
    s4e: 'The question here: if the population starts above K (say, a herd of deer moved onto a smaller range), how does it change? When N > K, 1 − N/K is negative, so the per-capita growth rate is negative and the population shrinks. So K is not a wall that blocks growth but an <strong>equilibrium</strong> (a value where dN/dt = 0), and one that pulls the population back from either side: a <strong>stable equilibrium</strong>, or attractor. N = 0 is also an equilibrium, but an <strong>unstable</strong> one: a single individual is enough for the population to move away from 0. The chart titled "Direction" plots dN/dt against N: where the curve is above the axis N increases (arrows point right); where it is below, N decreases (arrows point left). This step keeps r = 0.5 and K = 600.',
    c4a: 'Growth paths from different starting sizes', c4b: 'dN/dt against N with the direction of change',
    c4title: 'Population N · across: time (hours)', c4btitle: 'Direction: dN/dt · across: N',
    lgBelow: 'path starting below K', lgAbove: 'path starting above K', lgStart: 'current start', lgStable: 'stable equilibrium K', lgUnstable: 'unstable equilibrium 0',
    n0Slider: 'Starting size N₀', add4: 'Start from here', clear4: 'Clear all paths',
    s4readout: '{list}.', s4empty: 'No paths yet: pick a start and press “Start from here”.',
    s4item: 'start {n0} → {n} after 24 h', s4sep: '; ',
    s4zero: 'start 0 → stays 0 (no individuals, no growth)',
    s4hint: 'What to try: one path already starts at 1000 (above K). Drag the start to 50, 300, 600 and 900 and press "Start from here" each time. Every path heads for K = 600: those below rise, those above fall, and the one starting exactly at 600 is a flat line. Then try a start of 0: it does not move. In the "Direction" chart each path\'s start corresponds to a point on the axis, and the arrows tell you which way it will go.',

    s5k: 'Step 5 · Real data',
    s5t: 'Do real populations actually grow in an S shape?',
    s5e: 'The question here: can a set of real measurements be described by the logistic curve, and what are r and K? The white dots below are a yeast culture experiment published by Carlson in 1913 and tabulated by Pearl in 1927: the amount of yeast in the culture, measured every hour for 18 hours (in the original\'s relative units). The curve\'s starting value is fixed at the first measurement, 9.6; you set r and K. Fit quality is judged by the <strong>residuals</strong> (measurement minus model, the pink vertical lines). Squaring all the residuals and adding them up gives the <strong>sum of squared residuals</strong>, and smaller is better; the r and K that make it smallest are the <strong>least-squares</strong> estimates.',
    c5a: 'Yeast data with a logistic fit',
    c5title: 'Yeast (relative units) · across: time (hours)',
    lgData: 'Carlson\'s measurements', lgModel: 'your logistic curve', lgResid: 'residual', lgExpFit: 'exponential fitted to the first 7 hours',
    fit5: 'Fit automatically (least squares)', exp5: 'Compare: exponential model',
    s5readout: 'r = {r} per hour, K = {K}: sum of squared residuals {sse}, root-mean-square error {rms} (roughly how far a typical point is off). {best}',
    s5best: 'This is the slider setting closest to the least-squares optimum.', s5notbest: 'The least-squares optimum is r ≈ {rb}, K ≈ {kb}, with RMS error {rmsb}.',
    s5exp: ' Fitted to the first 7 hours, the exponential gives r = {re} and predicts {pe} at hour 18, against {obs} measured.',
    s5hint: 'What to try: drag only K first, so the level where the curve flattens matches the last few dots; then drag r to line up the steep middle stretch. Watch the pink lines shrink and the sum of squares drop. Then press "Fit automatically" and compare with your attempt. Finally switch on "Compare: exponential model": it tracks the first few hours well, then shoots off the chart. A good fit only shows that this curve describes these data; why the yeast stopped growing (nutrients used up, alcohol building up) is not in the model.',

    s6k: 'Step 6 · r too high',
    s6t: 'If breeding happens once a year, generation by generation, what goes wrong when r is too large?',
    s6e: 'The question here: so far everything changed smoothly; if a population breeds only once a year (as many insects do), the model works generation by generation: N<sub>t+1</sub> = N<sub>t</sub> + rN<sub>t</sub>(1 − N<sub>t</sub>/K). The difference is a <strong>lag</strong>: each generation\'s increase is set by how crowded the previous one was, and it is added all at once, so it can jump straight past K. Below, N is measured in units of K (1 on the vertical axis means K), starting at 0.05K. The chart titled "Cobweb" has this generation across and the next one up: the green parabola is the rule, and bouncing from the diagonal to the parabola and back to the diagonal steps through the generations one by one. In 1976 the ecologist Robert May showed that this simple rule turns <a class="xlink" href="../../../physics/mechanics/chaos-threebody/#step0">chaotic (→ Chaos and the Three-Body Problem, step 0: tiny differences, huge outcomes)</a> once r is large enough.',
    c6a: 'Population computed generation by generation', c6b: 'Cobweb: this generation → next',
    c6title: 'N / K · across: generation', c6btitle: 'Cobweb · across Nₜ/K, up Nₜ₊₁/K',
    lgSeries: 'N/K each generation', lgMap: 'the rule', lgDiag: 'diagonal Nₜ₊₁ = Nₜ', lgCobweb: 'generation-by-generation path',
    rDisc: 'Growth rate per generation r',
    p6a: 'r = 0.8', p6b: 'r = 1.8', p6c: 'r = 2.2', p6d: 'r = 2.8',
    s6readout: 'r = {r}: {kind}',
    k_monotone: 'it approaches K steadily without overshooting (true for all r ≤ 1).',
    k_damped: 'it overshoots K, then swings back and forth with shrinking swings and settles at K (1 < r ≤ 2).',
    k_cycle: 'it no longer settles at K but cycles among {p} values.',
    k_chaos: 'it jumps irregularly and never repeats: this is chaos. Start a hair\'s breadth away and within a few dozen generations the path is completely different.',
    s6hint: 'What to try: press the four buttons r = 0.8, 1.8, 2.2 and 2.8 in turn, then drag slowly yourself. In the cobweb, for r ≤ 1 the path climbs like a staircase to the crossing point; between 1 and 2 it spirals around the crossing and closes in; beyond 2 the spiral no longer closes, first hopping between 2 values, from about 2.45 between 4, and beyond about 2.57 turning chaotic. The classification in the readout is computed from the tail of the run after 3000 generations. This shows that "a generation-by-generation model with large r" can produce wild swings all by itself; real population swings may also come from predators or weather, and this page cannot tell those apart.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'The eight steps in one paragraph',
    s7fin: 'With no limits the per-capita growth rate stays at r, the population grows exponentially, and the doubling time ln2 ÷ r never changes (steps 0 and 1). With limited resources the per-capita rate falls in a straight line to 0, and dN/dt = rN(1 − N/K) gives the S-curve (step 2); the population as a whole grows fastest at N = K/2, adding rK/4 per hour (step 3); K is a stable equilibrium that pulls the population back from both sides (step 4). Real yeast data are described well with r ≈ 0.54 per hour and K ≈ 664 (step 5). Counted generation by generation, r above 1 overshoots K, above 2 keeps oscillating, and larger still turns chaotic (step 6).',
    formula: 'dN/dt = rN(1 − N/K)    N(t) = K / (1 + ((K − N₀)/N₀)·e^(−rt))',
    boundary: 'Model limits: the logistic equation assumes the per-capita rate falls in a straight line with N, reacts to crowding instantly, keeps r and K fixed over time, and involves a single species. Real populations have age structure, predators and competitors, seasons and random swings, and K itself shifts with the environment. The bacteria of step 0 are an idealised calculation; the fit in step 5 shows only that the curve describes these data, not why growth stopped; the oscillations of step 6 come from the lag built into the generation-by-generation model.',
    linksTitle: 'Where to go next',
    lk1: '→ Exponents & Logarithms, step 2: why the doubling time is ln2 ÷ r',
    lk2: '→ Sequences & Series, step 2: geometric sequences, the discrete form of doubling',
    lk3: '→ Population Ecology, step 2: add a predator and the curves start to swing',
    lk4: '→ Chaos and the Three-Body Problem, step 0: tiny differences, huge outcomes',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Population Growth · Where the S-Curve Comes From".'
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
  const P = window.POP_I18N_PARAMS || {};
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, P); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, P); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshPop === 'function') window.refreshPop();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.POP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
