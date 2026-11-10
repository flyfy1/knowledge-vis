'use strict';
// Backpropagation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '反向传播 · 一次回扫算出每个权重的责任',
    back: '← 知识索引',
    compare: '对照另一版本：反向传播 · 误差沿网络回流 →',
    navLabel: '反向传播步骤导航',
    tagline: '一个小网络读入两个数、给出两个输出，和目标差了一截。12 个参数各该往哪边调、调多少？挨个试一遍能算出来，但参数一多就试不起。反向传播只用一次前向、一次反向，就把每个参数的斜率全部算出。八步里你会先亲手试，再看清链式法则怎样把乘积和路径之和组织成一次回扫。',
    nav0: '0 前向', nav1: '1 挨个试', nav2: '2 一条路', nav3: '3 两条路', nav4: '4 回扫', nav5: '5 为什么快', nav6: '6 训练', nav7: '7 收束',

    s0k: '第 0 步 · 网络和损失',
    s0t: '改动一个参数，输出和损失会跟着怎么变？',
    s0e: '这一步要回答：网络从输入算到损失的每一层是什么，单独改一个参数时损失怎样变化？网络读入 x = (x₁, x₂) = (1, 0.5)，目标是 y = (1, 0)。中间层两个节点先算加权和 z₁、z₂（例如 z₁ = w₁₁·x₁ + w₁₂·x₂ + b₁），再经过 <strong>σ 函数</strong>得到 h₁、h₂：σ(z) = 1/(1 + e^(−z))，把任何数压到 0 和 1 之间。输出层再做一次加权和：ŷ₁ = v₁₁·h₁ + v₁₂·h₂ + c₁，ŷ₂ 同理。下标约定：w<sub>jk</sub> 是从输入 k 进入节点 j 的权重，v<sub>oj</sub> 是从 h<sub>j</sub> 进入输出 o 的权重；b、c 是加在节点上的常数（偏置）。<strong>损失</strong> L = ½·[(ŷ₁ − y₁)² + (ŷ₂ − y₂)²] 衡量输出离目标多远，越小越好。这样从输入一层层算到 L，叫<strong>前向传播</strong>。',
    pickParam: '要改的参数', paramVal: '参数值',
    c0net: '网络：节点下方是当前值；连线粗细 = |权重|',
    c0curve: '损失 L 随所选参数变化（其余 11 个不动）',
    s0lgPos: '正权重', s0lgNeg: '负权重', s0lgSel: '所选参数', s0lgCur: '当前值', s0lgDef: '初始值',
    s0readout: '前向结果：z = ({z1}, {z2})，h = ({h1}, {h2})，ŷ = ({y1}, {y2})，目标 (1, 0)。损失 L = {L}（初始参数下为 {L0}）。',
    s0hint: '观察顺序：先保持「w₁₁」，拖参数值，看上图 h₁ 和两个输出的数字一起变、下图橙点沿曲线走；再换成「v₂₂」或「c₂」拖一拖。每条曲线都是「其余参数不动、只改这一个」时的损失；最低点各不相同，说明每个参数单独看都有自己该去的方向。',

    s1k: '第 1 步 · 最笨的办法',
    s1t: '不会求导，能不能靠「推一下、看损失变多少」量出每个参数的斜率？',
    s1e: '这一步要回答：损失对某个参数的<strong>斜率</strong>（参数增加一点点时，损失每单位增加多少）能不能直接量出来？办法是：把这个参数推大 ε（一个小量），重新做一次前向传播，用 (L(推后) − L(原来)) ÷ ε 当斜率。这叫<strong>有限差分</strong>，就是割线斜率（<a class="xlink" href="../../../math/calculus/derivative/#step1">→ 导数页第 1 步：割线怎样逼近切线</a>）。每个参数都要单独推一次，所以 12 个参数要做 12 + 1 次前向传播。橙色柱是推出来的斜率，白色短线是精确值（第 4 步的回扫算出，这里先拿来对照）。',
    epsSlider: '推动量 ε', nudgeAll: '逐个推 12 个参数', clearNudge: '清空',
    c1bars: '各参数的斜率 ∂L/∂参数：推出来的 vs 精确值',
    s1lgEst: '有限差分估计', s1lgTrue: '精确斜率（第 4 步）',
    s1progress: '已推 {c}/12 个参数，用了 {p} 次前向传播。',
    s1done: '12 个参数全部推完，共 {p} 次前向传播。',
    s1readout: '{prog} ε = {eps} 时，估计与精确值的最大偏差 {err}（只算已推的参数）。',
    s1hint: '观察顺序：先按「逐个推 12 个参数」，看橙色柱一根根出现、前向传播计数一次次加一；再把 ε 从 1 往左拖到 0.001，看橙色柱缩向白线、最大偏差大致按 ε 的比例变小。代价不随 ε 变：P 个参数永远要 P + 1 次前向传播。一个有一亿个参数的模型，每走一步训练就要一亿次前向传播。',

    s2k: '第 2 步 · 沿一条路相乘',
    s2t: '不推动参数，能不能把 w₁₁ 的影响拆成几段「局部斜率」再乘起来？',
    s2e: '这一步要回答：w₁₁ 影响损失要经过哪几段，每段各放大多少？跟着一条路走：w₁₁ 先改变 z₁，z₁ 改变 h₁，h₁ 改变 ŷ₁，ŷ₁ 改变 L。每一段的<strong>局部斜率</strong>只看相邻两个量：上游变 1 个单位，下游变多少。四个局部斜率分别是 x₁、σ′(z₁)、v₁₁、ŷ₁ − y₁（σ′(z) = σ(z)·(1 − σ(z)) 是 σ 曲线在 z 处的斜率；最后一段把 ŷ₂ 当作不动）。<strong>链式法则</strong>说：沿一条路，总斜率等于各段局部斜率相乘。四个小图各画一段，青色短线就是那一段的切线。',
    w11Slider: 'w₁₁',
    p2a: '① z₁ 对 w₁₁　斜率 {s}', p2b: '② h₁ 对 z₁　斜率 {s}', p2c: '③ ŷ₁ 对 h₁　斜率 {s}', p2d: '④ L 对 ŷ₁　斜率 {s}',
    s2lgCurve: '这一段的函数', s2lgTan: '当前点的切线（局部斜率）',
    s2readout: '这条路的乘积：{a} × {b} × {c} × {d} = {p}。而推一下 w₁₁ 量出的真实斜率是 {n}。两者{verdict}。',
    s2match: '相等（此时 ŷ₂ 那一路贡献为 0）', s2nomatch: '不相等：差了 {gap}，还有一部分没算进来',
    s2hint: '观察顺序：拖 w₁₁，看四个小图里的点同时移动；② 号图的切线在 z₁ 远离 0 时变平（σ 饱和，局部斜率趋近 0），乘积随之变小。注意读数：这条路的乘积和真实斜率对不上，连正负号都可能相反。原因在下一步。',

    s3k: '第 3 步 · 两条路相加',
    s3t: 'h₁ 同时连着两个输出，w₁₁ 的总斜率该怎样合起来？',
    s3e: '这一步要回答：上一步的乘积缺了什么？h₁ 不只进入 ŷ₁，也经过 v₂₁ 进入 ŷ₂，所以 w₁₁ 有两条路到达 L：路 1 经过 ŷ₁（橙色），路 2 经过 ŷ₂（绿色）。每条路的贡献是沿路局部斜率之积；推一下 w₁₁ 时两条路同时起作用，所以<strong>总斜率是各条路贡献之和</strong>。这是多变量的链式法则：一个量从几条路影响结果，就把几条路的乘积相加。',
    v21Slider: 'v₂₁（路 2 的出口强度）',
    c3net: '从 w₁₁ 到 L 的两条路',
    c3bars: '各路贡献、它们的和、推一下量出的斜率',
    b3r1: '路 1', b3r2: '路 2', b3sum: '路 1 + 路 2', b3num: '推一下量出',
    s3lgR1: '路 1：w₁₁→z₁→h₁→ŷ₁→L', s3lgR2: '路 2：w₁₁→z₁→h₁→ŷ₂→L', s3lgSum: '两路之和', s3lgNum: '推一下（中心差分，ε = 10⁻⁵）',
    s3readout: '路 1 = {r1}，路 2 = {r2}，和 = {s}；推一下量出 {n}，差 {d}。{note}',
    s3zero: 'v₂₁ = 0：路 2 断了，单条路的乘积就是全部斜率。',
    s3cancel: '两条路方向相反，大部分互相抵消。',
    s3same: '两条路同向，互相加强。',
    s3hint: '观察顺序：保持 w₁₁ 不动，把 v₂₁ 拖到 0，看绿色路变细、绿柱消失、「和」与「推一下」都等于橙柱；再把 v₂₁ 拖向负值，看绿柱翻到另一边、和随之改变。无论怎么拖，「和」与「推一下」始终相等（差在 10⁻⁹ 以下）。',

    s4k: '第 4 步 · 一次回扫',
    s4t: '能不能从损失出发往回走一遍，就把 12 个斜率全部算出？',
    s4e: '这一步要回答：路一多，逐条列出来很麻烦；怎样不列路，也把每条路都算进去？办法是从后往前，给每个节点记一个数 δ = ∂L/∂(该节点)，叫它的<strong>误差信号</strong>：损失对这个节点的值有多敏感。输出节点的 δ 直接是 ŷ − y。往回走一层时，节点的 δ = 它的局部斜率 × (它通往的各个下游节点的 δ × 连线权重)<strong>之和</strong>，上一步的「两路相加」就藏在这个和里。有了 δ，任何一条连线上权重的斜率 = 下游节点的 δ × 上游节点的值。这样从损失往回扫一遍，叫<strong>反向传播</strong>。',
    stepBack: '往回走一层', autoBack: '自动回扫', resetBack: '重来',
    c4net: '网络上的误差信号 δ（橙色数字）',
    c4bars: '12 个斜率：回扫得到 vs 推一下量出',
    s4lgDelta: '已算出 δ 的节点', s4lgGrad: '已算出斜率的连线', s4lgBack: '回扫得到的斜率', s4lgNum: '推一下（中心差分）',
    s4stage0: '回扫进度 0/4：只做了前向传播，还没有任何 δ。按「往回走一层」开始。',
    s4stage1: '回扫进度 1/4：输出节点 δ = ŷ − y = ({d1}, {d2})。',
    s4stage2: '回扫进度 2/4：输出层 6 个参数的斜率 = 输出 δ × 上游值，例如 ∂L/∂v₁₁ = δ(ŷ₁) × h₁ = {g}。',
    s4stage3: '回扫进度 3/4：h₁ 的 δ = σ′(z₁) × (v₁₁·δ(ŷ₁) + v₂₁·δ(ŷ₂)) = {d1}，h₂ 的 δ = {d2}。两条路的和就在括号里。',
    s4stage4: '回扫进度 4/4：中间层 6 个参数的斜率 = h 的 δ × 上游值，例如 ∂L/∂w₁₁ = δ(h₁) × x₁ = {g}，与第 3 步两路之和相同。12 个斜率与推一下量出的最大差 {err}。总共只用了 1 次前向 + 1 次回扫。',
    s4hint: '观察顺序：按「往回走一层」四次，看橙色 δ 从右往左一层层出现，下图对应的青色柱随之补齐；每根青柱都落在白线（推一下量出的值）上。这和第 1 步要 13 次前向传播得到的是同一组斜率。',

    s5k: '第 5 步 · 为什么快',
    s5t: '网络加深时，三种算法的工作量各涨多快？',
    s5e: '这一步要回答：「一次回扫」到底省了什么？换一个更大的全连接网络来数工作量：输入 n 个数，D 层中间层每层 n 个节点，1 个输出，只算权重不算偏置。工作量的单位是「一次乘加」，经过一条连线算一次。三种算法：<strong>挨个推</strong>，每个参数一次前向（第 1 步）；<strong>逐条列路</strong>，每个权重把它通往损失的每条路都乘一遍（第 3 步的做法）；<strong>回扫</strong>，一次前向加一次反向（第 4 步）。回扫快，是因为每个节点的 δ 只算一次，所有经过它的路都共用这一份，不必重复相乘。纵轴是对数刻度：每上一格，工作量乘 10。',
    depthSlider: '中间层层数 D', widthSlider: '每层宽度 n',
    c5: '一次求全部斜率的工作量（乘加次数，对数刻度）对层数 D',
    s5lgNudge: '挨个推', s5lgPath: '逐条列路', s5lgBack: '回扫',
    s5readout: 'D = {D}、n = {n}：共 {P} 个权重。挨个推 {a} 次乘加；逐条列路 {b} 次（第一层每个权重有 {r} 条路）；回扫 {c} 次，约为一次前向的 {k} 倍。',
    s5hint: '观察顺序：保持 n = 4，把 D 从 1 拖到 12。粉色线是直线往上走（路数每加一层乘 n，在对数轴上就是直线）；橙色线弯得慢（参数数的平方）；青色线几乎贴着底（和参数数成正比）。D = 1 时逐条列路反而略省，因为几乎没有可共用的部分；D ≥ 2 起回扫就最少。再把 n 调大，粉色线变陡。',

    s6k: '第 6 步 · 拿斜率去训练',
    s6t: '有了每个参数的斜率，网络能学会异或吗？',
    s6e: '这一步要回答：斜率怎样变成学习？换一个任务：异或（XOR），输入 (0,0)、(1,1) 时输出应为 0，(0,1)、(1,0) 时应为 1。一条直线分不开这两类，所以要有中间层：这里是 2 个输入、3 个 σ 中间节点、1 个输出。每个<strong>轮次</strong>对 4 个样本各做一次前向和回扫，把斜率取平均，再让每个参数沿斜率的反方向走一步：新值 = 旧值 − η × 斜率（<a class="xlink" href="../../../computing/ml/gradient-descent/#step1">→ 梯度下降页第 1 步：沿斜坡往下走</a>）。<strong>学习率</strong> η 决定一步迈多大。损失是 4 个样本 ½(ŷ − y)² 的平均。',
    etaSlider: '学习率 η', train: '开始训练', pause: '暂停', oneEpoch: '+1 轮', resetTrain: '回到初始权重', newInit: '换一组初始权重',
    c6map: '网络输出 ŷ(x₁, x₂)：越亮越接近 1',
    c6loss: '损失 L 随轮次（对数刻度）',
    s6lgOne: '目标为 1 的样本', s6lgZero: '目标为 0 的样本', s6lgLoss: '损失历史', s6lgTol: 'L = 0.01',
    s6readout: '初始权重 #{seed}，第 {ep}/{max} 轮，η = {eta}：L = {L}。四个样本输出 (0,0)→{o00}、(0,1)→{o01}、(1,0)→{o10}、(1,1)→{o11}。{status}',
    s6ok: 'L 在第 {k} 轮首次低于 0.01：此时每个输出离目标都不到 0.3，四个样本都分对了。',
    s6diverge: '损失比开始时大得多：步子太大，越过了谷底。',
    s6slow: '还没降到 0.01。',
    s6hint: '观察顺序：先用默认 η = 1 按「开始训练」，看「损失 L 随轮次」那条曲线下降，「网络输出」那张图从一片均匀的颜色逐渐变成「对角两亮、另外两角暗」；读数会报告 L 首次低于 0.01 的轮次。再按「回到初始权重」，把 η 调到 2 重来：损失几轮内就猛涨并停在高处。改 η 不清空历史，会接着当前权重训练；按「换一组初始权重」看同一 η 下不同起点的差别（#2 在 η = 0.5 时会卡在一个把两个点都输出 0.5 的位置）。',

    s7k: '第 7 步 · 收束', s7t: '一次前向、一次回扫，每个参数的责任都清楚了',
    s7fin: '回顾。<strong>第 0 步</strong>：前向传播从输入一层层算到损失。<strong>第 1 步</strong>：推一下能量出斜率，但 P 个参数要 P + 1 次前向。<strong>第 2 步</strong>：沿一条路，斜率是局部斜率的乘积。<strong>第 3 步</strong>：一个量从几条路影响损失，就把几条路相加。<strong>第 4 步</strong>：从后往前给每个节点记 δ，一次回扫得到全部斜率。<strong>第 5 步</strong>：δ 让所有路共用中间结果，工作量只和参数数成正比。<strong>第 6 步</strong>：斜率乘以学习率往反方向走，网络就学会了异或。',
    formula: 'δ(输出) = ŷ − y\nδ(节点) = σ′(z) · Σ 下游 (权重 × δ)\n∂L/∂权重 = δ(下游) × 上游值',
    boundary: '适用范围：本页的网络都是全连接、σ 中间层、线性输出、平方损失，前四步只用一个样本。反向传播本身不限于此：任何由可求导的小运算拼成的计算都能这样回扫，框架里的「自动求导」就是这么做的。它只负责算斜率，怎样用斜率更新参数（学习率、动量、Adam 等）是另一回事。本页没有展示梯度在很深的网络里逐层变小或变大的问题（梯度消失/爆炸），也没有展示小批量训练。第 5 步的工作量是粗略计数（每条连线一次乘加），不是实测运行时间。',
    linksTitle: '接着去哪',
    lk1: '→ 导数，第 1 步：割线斜率怎样逼近切线斜率',
    lk2: '→ 梯度下降，第 1 步：在二维地形上沿梯度往下走',
    lk3: '→ 卷积神经网络，第 5 步：用同样的斜率让机器自己学卷积核',
    lk4: '→ 过拟合，第 1 步：训练损失降低不等于对新数据更准',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《反向传播 · 误差沿网络回流》的平行版本。'
  },
  en: {
    pageTitle: 'Backpropagation · One Backward Sweep Assigns Every Weight Its Share',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Backpropagation · Error Flows Back Through the Network →',
    navLabel: 'Backpropagation steps',
    tagline: 'A small network reads two numbers, produces two outputs, and misses its targets. Which way should each of its 12 parameters move, and by how much? Trying them one by one works, but it stops being affordable as the parameter count grows. Backpropagation gets every slope from one forward pass and one backward pass. In eight steps you will measure slopes by hand first, then see how the chain rule turns products and sums over paths into a single backward sweep.',
    nav0: '0 Forward', nav1: '1 Nudge each', nav2: '2 One path', nav3: '3 Two paths', nav4: '4 The sweep', nav5: '5 Why it’s fast', nav6: '6 Training', nav7: '7 Wrap-up',

    s0k: 'Step 0 · The network and its loss',
    s0t: 'Change one parameter: how do the outputs and the loss respond?',
    s0e: 'This step answers: what does each layer compute on the way from input to loss, and how does the loss move when a single parameter changes? The network reads x = (x₁, x₂) = (1, 0.5) and should produce y = (1, 0). Each of the two middle nodes first forms a weighted sum, e.g. z₁ = w₁₁·x₁ + w₁₂·x₂ + b₁, then passes it through the <strong>σ function</strong> to get h₁ or h₂: σ(z) = 1/(1 + e^(−z)) squeezes any number into the range 0 to 1. The output layer takes another weighted sum: ŷ₁ = v₁₁·h₁ + v₁₂·h₂ + c₁, and likewise ŷ₂. Index convention: w<sub>jk</sub> runs from input k into node j, v<sub>oj</sub> from h<sub>j</sub> into output o; b and c are constants added at a node (biases). The <strong>loss</strong> L = ½·[(ŷ₁ − y₁)² + (ŷ₂ − y₂)²] measures how far the outputs are from the targets; smaller is better. Computing layer by layer from input to L is the <strong>forward pass</strong>.',
    pickParam: 'Parameter to change', paramVal: 'Value',
    c0net: 'Network: value under each node; line width = |weight|',
    c0curve: 'Loss L as the chosen parameter varies (the other 11 fixed)',
    s0lgPos: 'positive weight', s0lgNeg: 'negative weight', s0lgSel: 'chosen parameter', s0lgCur: 'current value', s0lgDef: 'initial value',
    s0readout: 'Forward pass: z = ({z1}, {z2}), h = ({h1}, {h2}), ŷ = ({y1}, {y2}), target (1, 0). Loss L = {L} ({L0} with the initial parameters).',
    s0hint: 'What to try: keep “w₁₁” and drag the value; in the network, h₁ and both outputs change together, and the orange dot rides along the loss curve. Then switch to “v₂₂” or “c₂” and drag again. Each curve is the loss with only that one parameter moving; their minima sit in different places, so every parameter has its own preferred direction.',

    s1k: 'Step 1 · The brute-force way',
    s1t: 'Without any calculus, can we measure each slope by nudging the parameter and watching the loss?',
    s1e: 'This step answers: can the <strong>slope</strong> of the loss with respect to a parameter (how much the loss rises per unit increase of that parameter) be measured directly? Push the parameter up by a small amount ε, redo the forward pass, and take (L after − L before) ÷ ε as the slope. This is a <strong>finite difference</strong>, the slope of a secant line (<a class="xlink" href="../../../math/calculus/derivative/#step1">→ Derivative, step 1: how secants approach the tangent</a>). Each parameter needs its own nudge, so 12 parameters cost 12 + 1 forward passes. Orange bars are the measured slopes; white ticks are the exact values (from the backward sweep of step 4, borrowed here for comparison).',
    epsSlider: 'Nudge size ε', nudgeAll: 'Nudge all 12 parameters', clearNudge: 'Clear',
    c1bars: 'Slope ∂L/∂parameter for each parameter: measured vs exact',
    s1lgEst: 'finite-difference estimate', s1lgTrue: 'exact slope (step 4)',
    s1progress: '{c}/12 parameters nudged, {p} forward passes used.',
    s1done: 'All 12 parameters nudged: {p} forward passes in total.',
    s1readout: '{prog} At ε = {eps} the largest gap between estimate and exact value is {err} (nudged parameters only).',
    s1hint: 'What to try: press “Nudge all 12 parameters” and watch the bars appear one at a time while the pass count ticks up. Then drag ε from 1 down to 0.001: the orange bars close in on the white ticks and the largest gap shrinks roughly in proportion to ε. The cost does not depend on ε: P parameters always take P + 1 forward passes. A model with a hundred million parameters would need a hundred million passes for every single training step.',

    s2k: 'Step 2 · Multiply along one path',
    s2t: 'Without nudging, can w₁₁’s effect be split into “local slopes” and multiplied back together?',
    s2e: 'This step answers: which links does w₁₁ act through on its way to the loss, and how much does each link amplify? Follow one path: w₁₁ changes z₁, z₁ changes h₁, h₁ changes ŷ₁, ŷ₁ changes L. Each link has a <strong>local slope</strong> that involves only two neighbours: if the upstream quantity rises by 1, how much does the downstream one rise? The four local slopes are x₁, σ′(z₁), v₁₁ and ŷ₁ − y₁ (σ′(z) = σ(z)·(1 − σ(z)) is the slope of the σ curve at z; the last link holds ŷ₂ fixed). The <strong>chain rule</strong> says: along one path, the overall slope is the product of the local slopes. Each small plot shows one link; the cyan segment is its tangent.',
    w11Slider: 'w₁₁',
    p2a: '① z₁ vs w₁₁   slope {s}', p2b: '② h₁ vs z₁   slope {s}', p2c: '③ ŷ₁ vs h₁   slope {s}', p2d: '④ L vs ŷ₁   slope {s}',
    s2lgCurve: 'the function on this link', s2lgTan: 'tangent at the current point (local slope)',
    s2readout: 'Product along this path: {a} × {b} × {c} × {d} = {p}. Nudging w₁₁ gives the true slope {n}. The two are {verdict}.',
    s2match: 'equal (the route through ŷ₂ contributes 0 right now)', s2nomatch: 'not equal: {gap} is missing, so something has not been counted',
    s2hint: 'What to try: drag w₁₁ and watch the dots move in all four plots at once. In plot ② the tangent flattens when z₁ is far from 0 (σ saturates, its local slope goes towards 0), and the product shrinks with it. Now check the readout: the product along this path does not match the true slope, and can even have the opposite sign. The next step explains why.',

    s3k: 'Step 3 · Add the paths',
    s3t: 'h₁ feeds both outputs. How do the pieces of w₁₁’s slope combine?',
    s3e: 'This step answers: what was missing from the last product? h₁ does not only feed ŷ₁; through v₂₁ it also feeds ŷ₂. So w₁₁ reaches L along two paths: path 1 through ŷ₁ (orange) and path 2 through ŷ₂ (green). Each path contributes the product of its local slopes. When w₁₁ is nudged, both paths act at once, so <strong>the total slope is the sum of the path contributions</strong>. This is the multivariable chain rule: when a quantity affects the result along several paths, add the products of all of them.',
    v21Slider: 'v₂₁ (strength of path 2’s exit)',
    c3net: 'The two paths from w₁₁ to L',
    c3bars: 'Each path’s contribution, their sum, and the nudged slope',
    b3r1: 'path 1', b3r2: 'path 2', b3sum: 'path 1 + 2', b3num: 'nudged',
    s3lgR1: 'path 1: w₁₁→z₁→h₁→ŷ₁→L', s3lgR2: 'path 2: w₁₁→z₁→h₁→ŷ₂→L', s3lgSum: 'sum of both', s3lgNum: 'nudge (central difference, ε = 10⁻⁵)',
    s3readout: 'Path 1 = {r1}, path 2 = {r2}, sum = {s}; the nudge measures {n}, a difference of {d}. {note}',
    s3zero: 'v₂₁ = 0: path 2 is cut, and the single-path product is the whole slope.',
    s3cancel: 'The two paths pull in opposite directions and largely cancel.',
    s3same: 'The two paths pull the same way and reinforce each other.',
    s3hint: 'What to try: keep w₁₁ where it is and drag v₂₁ to 0; the green path thins out, the green bar disappears, and both the sum and the nudge equal the orange bar. Then drag v₂₁ negative; the green bar flips to the other side and the sum follows. However you drag, the sum and the nudge agree (difference below 10⁻⁹).',

    s4k: 'Step 4 · One backward sweep',
    s4t: 'Can a single pass from the loss backwards produce all 12 slopes?',
    s4e: 'This step answers: listing every path gets tedious fast; how can all paths be counted without listing them? Walk from the end to the start and give every node one number, δ = ∂L/∂(that node), its <strong>error signal</strong>: how sensitive the loss is to that node’s value. For an output node δ is simply ŷ − y. One layer further back, a node’s δ = its local slope × the <strong>sum</strong> over the nodes it feeds of (connecting weight × their δ); the “add the paths” of step 3 lives inside this sum. Once the δs are known, the slope for the weight on any connection = δ of the downstream node × value of the upstream node. One sweep like this from the loss backwards is <strong>backpropagation</strong>.',
    stepBack: 'Go back one layer', autoBack: 'Run the sweep', resetBack: 'Start over',
    c4net: 'Error signals δ on the network (orange numbers)',
    c4bars: 'All 12 slopes: from the sweep vs nudged',
    s4lgDelta: 'node with δ computed', s4lgGrad: 'connection with slope computed', s4lgBack: 'slope from the sweep', s4lgNum: 'nudge (central difference)',
    s4stage0: 'Sweep progress 0/4: only the forward pass is done, no δ yet. Press “Go back one layer” to start.',
    s4stage1: 'Sweep progress 1/4: output δ = ŷ − y = ({d1}, {d2}).',
    s4stage2: 'Sweep progress 2/4: the 6 output-layer slopes are output δ × upstream value, e.g. ∂L/∂v₁₁ = δ(ŷ₁) × h₁ = {g}.',
    s4stage3: 'Sweep progress 3/4: δ of h₁ = σ′(z₁) × (v₁₁·δ(ŷ₁) + v₂₁·δ(ŷ₂)) = {d1}; δ of h₂ = {d2}. The sum over both paths is the bracket.',
    s4stage4: 'Sweep progress 4/4: the 6 middle-layer slopes are δ of h × upstream value, e.g. ∂L/∂w₁₁ = δ(h₁) × x₁ = {g}, the same as the two-path sum of step 3. Largest gap between the 12 slopes and the nudged ones: {err}. Total cost: 1 forward pass + 1 backward sweep.',
    s4hint: 'What to try: press “Go back one layer” four times. The orange δs appear layer by layer from right to left, and the matching cyan bars fill in below; every cyan bar lands on its white tick (the nudged value). These are the same slopes that took 13 forward passes in step 1.',

    s5k: 'Step 5 · Why it is fast',
    s5t: 'As the network gets deeper, how fast does each method’s work grow?',
    s5e: 'This step answers: what exactly does “one backward sweep” save? Count the work on a larger fully connected network: n inputs, D middle layers of n nodes each, 1 output, weights only (no biases). The unit of work is one multiply-add, counted once per connection used. Three methods: <strong>nudge each</strong>, one forward pass per parameter (step 1); <strong>enumerate paths</strong>, multiply along every path from each weight to the loss (the approach of step 3); <strong>sweep</strong>, one forward pass plus one backward pass (step 4). The sweep is cheap because each node’s δ is computed once and shared by every path through that node, instead of being multiplied out again for each path. The vertical axis is logarithmic: each gridline up means ten times more work.',
    depthSlider: 'Middle layers D', widthSlider: 'Width n',
    c5: 'Work to get every slope once (multiply-adds, log scale) vs depth D',
    s5lgNudge: 'nudge each', s5lgPath: 'enumerate paths', s5lgBack: 'sweep',
    s5readout: 'D = {D}, n = {n}: {P} weights. Nudging: {a} multiply-adds; enumerating paths: {b} (each first-layer weight has {r} paths); sweep: {c}, about {k} times one forward pass.',
    s5hint: 'What to try: keep n = 4 and drag D from 1 to 12. The pink line climbs straight (each extra layer multiplies the path count by n, which is a straight line on a log axis); orange bends up slowly (the square of the parameter count); cyan stays near the floor (proportional to the parameter count). At D = 1 enumerating paths is slightly cheaper, since there is almost nothing to share; from D = 2 on the sweep is the cheapest. Then raise n and the pink line gets steeper.',

    s6k: 'Step 6 · Put the slopes to work',
    s6t: 'With every parameter’s slope in hand, can a network learn XOR?',
    s6e: 'This step answers: how do slopes turn into learning? A new task: XOR, where inputs (0,0) and (1,1) should give 0 and (0,1), (1,0) should give 1. No single straight line separates the two groups, so a middle layer is needed: here 2 inputs, 3 σ middle nodes and 1 output. Each <strong>epoch</strong> runs a forward pass and a backward sweep on each of the 4 examples, averages the slopes, and moves every parameter one step against its slope: new value = old value − η × slope (<a class="xlink" href="../../../computing/ml/gradient-descent/#step1">→ Gradient descent, step 1: walking downhill on a surface</a>). The <strong>learning rate</strong> η sets the step size. The loss is the average of ½(ŷ − y)² over the 4 examples.',
    etaSlider: 'Learning rate η', train: 'Train', pause: 'Pause', oneEpoch: '+1 epoch', resetTrain: 'Back to initial weights', newInit: 'New initial weights',
    c6map: 'Network output ŷ(x₁, x₂): brighter = closer to 1',
    c6loss: 'Loss L per epoch (log scale)',
    s6lgOne: 'example with target 1', s6lgZero: 'example with target 0', s6lgLoss: 'loss history', s6lgTol: 'L = 0.01',
    s6readout: 'Initial weights #{seed}, epoch {ep}/{max}, η = {eta}: L = {L}. Outputs (0,0)→{o00}, (0,1)→{o01}, (1,0)→{o10}, (1,1)→{o11}. {status}',
    s6ok: 'L first dropped below 0.01 at epoch {k}: from then on every output is within 0.3 of its target, so all four examples are right.',
    s6diverge: 'The loss is far above where it started: the steps are too big and overshoot the valley.',
    s6slow: 'Not below 0.01 yet.',
    s6hint: 'What to try: with the default η = 1, press “Train”. The “Loss L per epoch” curve drops, and the “Network output” map turns from one even colour into “two opposite corners bright, the other two dark”; the readout reports the first epoch with L below 0.01. Then press “Back to initial weights”, set η = 2 and train again: within a few epochs the loss jumps up and stays high. Changing η keeps the history and continues from the current weights. Press “New initial weights” to compare starting points at the same η (#2 at η = 0.5 gets stuck with two examples at an output of 0.5).',

    s7k: 'Step 7 · Wrap-up', s7t: 'One forward pass, one backward sweep, and every parameter’s share is known',
    s7fin: 'The thread. <strong>Step 0</strong>: the forward pass computes layer by layer from input to loss. <strong>Step 1</strong>: nudging measures slopes, but P parameters cost P + 1 forward passes. <strong>Step 2</strong>: along one path, the slope is the product of local slopes. <strong>Step 3</strong>: when a quantity reaches the loss along several paths, add the paths. <strong>Step 4</strong>: give every node a δ from the end backwards, and one sweep yields every slope. <strong>Step 5</strong>: δ lets all paths share intermediate results, so the work grows only in proportion to the parameter count. <strong>Step 6</strong>: step each parameter against its slope, scaled by the learning rate, and the network learns XOR.',
    formula: 'δ(output) = ŷ − y\nδ(node) = σ′(z) · Σ downstream (weight × δ)\n∂L/∂weight = δ(downstream) × upstream value',
    boundary: 'Scope: every network on this page is fully connected, with σ middle layers, a linear output and squared-error loss; steps 0–4 use a single example. Backpropagation itself is far more general: any computation built from small differentiable operations can be swept backwards this way, which is what “automatic differentiation” in ML frameworks does. It only computes slopes; how to use them to update parameters (learning rate, momentum, Adam and so on) is a separate choice. This page does not show gradients shrinking or blowing up layer by layer in very deep networks (vanishing/exploding gradients), nor mini-batch training. The work in step 5 is a rough count (one multiply-add per connection), not a measured running time.',
    linksTitle: 'Where to go next',
    lk1: '→ Derivative, step 1: how a secant slope approaches the tangent slope',
    lk2: '→ Gradient descent, step 1: following the gradient downhill on a 2-D surface',
    lk3: '→ CNN feature maps, step 5: the same slopes let a machine learn its own kernel',
    lk4: '→ Overfitting, step 1: lower training loss is not the same as better accuracy on new data',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Backpropagation · Error Flows Back Through the Network”.'
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
