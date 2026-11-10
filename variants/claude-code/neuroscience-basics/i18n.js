'use strict';
// Neuroscience basics (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en; every number written here is pinned by tests/core.cjs.

const STRINGS = {
  zh: {
    pageTitle: '神经信号 · 从离子浓度差到一串脉冲',
    back: '← 知识索引',
    compare: '对照另一版本：神经科学基础 · 从静息到脉冲 →',
    navLabel: '神经信号步骤导航',
    tagline: '神经元靠膜电压传递信息，可细胞里并没有电池。这个电压从哪来？神经元怎样决定「发」还是「不发」，一秒最多又能发几次？七步里，你先从膜两侧的离子浓度差算出静息电位，再在一个经典的神经元模型上亲手加刺激，看它放电、休息、再放电。',
    nav0: '0 一种离子', nav1: '1 静息电位', nav2: '2 总和', nav3: '3 全或无', nav4: '4 不应期', nav5: '5 频率上限', nav6: '6 收束',

    s0k: '第 0 步 · 一种离子',
    s0t: '膜两侧离子浓度不同，为什么就有了电压？',
    s0e: '这一步要回答：某种离子在膜内外浓度不同，会产生多大的电压？神经元的<strong>细胞膜</strong>把细胞内外隔开，膜上的<strong>离子通道</strong>是只放特定离子通过的小孔。先假设膜只让 K⁺ 通过：膜内 K⁺ 多（140 mM；mM 即毫摩尔每升），膜外少（5 mM）。K⁺ 顺着浓度差往外漏，每漏出一个就带走一份正电荷，膜内因此变负；膜内越负，就越把带正电的 K⁺ 往回拉。两股作用相等时，净流动停止，此时膜内相对膜外的电压叫这种离子的<strong>平衡电位</strong> E。它由<strong>能斯特方程</strong>给出（37 °C、一价离子）：E = 61.5 mV × log₁₀(膜外浓度 ÷ 膜内浓度)。浓度比每差 10 倍，E 就差 61.5 mV（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ 指数与对数页第 3 步：对数怎样把「乘 10」变成「加一格」</a>）。建立这个电压只需极少量离子越过膜，内外浓度几乎不变。',
    ionPick: '选择离子', ionK: 'K⁺（钾离子）', ionNa: 'Na⁺（钠离子）',
    outConc: '膜外浓度（mM）', inConc: '膜内浓度（mM）',
    s0lgNow: '当前组合', s0lgTried: '试过的组合', lgIonK: 'K⁺ 离子（圆点数 ∝ 浓度）', lgIonNa: 'Na⁺ 离子（圆点数 ∝ 浓度）',
    c0top: '膜两侧的离子（上：膜外，下：膜内）', c0bot: '平衡电位 E（mV）与浓度比（膜外 ÷ 膜内，对数刻度）',
    outside: '膜外', inside: '膜内',
    s0readout: '{ion}：膜外 {o} mM，膜内 {i} mM，浓度比 {r}。平衡电位 E = 61.5 × log₁₀({r}) = {E} mV，意思是：膜内比膜外{dir} {abs} mV 时，这种离子进出正好抵消。',
    dirNeg: '低', dirPos: '高',
    s0zero: '{ion}：膜外 {o} mM，膜内 {i} mM，浓度比 1。两侧浓度相同，没有浓度差要平衡，所以 E = 0 mV。',
    s0hint: '观察顺序：先保持 K⁺，只拖「膜外浓度」，看下图白点沿斜线移动：浓度比每乘 10，E 升高 61.5 mV；比值为 1 时 E = 0。再点 Na⁺：它膜外多、膜内少，平衡电位变成正的（默认 +66.6 mV）。上图圆点数表示浓度，膜两侧的 + 与 − 表示电压方向。灰点是你试过的组合。',

    s1k: '第 1 步 · 静息电位',
    s1t: 'K⁺ 和 Na⁺ 都会漏一点，不受刺激时电压停在哪？',
    s1e: '这一步要回答：真实的膜不只让 K⁺ 通过，静息时 Na⁺ 也会漏进来一点，那么不受刺激时的膜电压——<strong>静息电位</strong>——停在哪里？上一步算出：K⁺ 把电压往它的平衡电位 E<sub>K</sub>（−89.1 mV）拉，Na⁺ 往 E<sub>Na</sub>（+66.6 mV）拉。谁的<strong>通透性</strong>（膜让这种离子通过的难易）大，谁的作用就大。<strong>Goldman 方程</strong>把两者合在一起：V = 61.5 mV × log₁₀[(K⁺外 + p·Na⁺外) ÷ (K⁺内 + p·Na⁺内)]，其中 p = Na⁺ 通透性 ÷ K⁺ 通透性。静息神经元的 p 约为 0.04，算得 V = −68.6 mV，离 E<sub>K</sub> 近得多，因为静息时开着的 K⁺ 通道远比 Na⁺ 通道多。浓度差本身由<strong>钠钾泵</strong>耗能维持；本页把浓度当作固定不变。',
    pSlider: '通透性比 p = P_Na ÷ P_K（对数滑杆）', koSlider: '膜外 K⁺ 浓度（mM）', reset1: '回到默认（p = 0.04，K⁺外 = 5 mM）',
    c1: '静息电位 V（mV）随通透性比 p 的变化（对数横轴）',
    s1lgCurve: '当前膜外 K⁺ 下的曲线与当前点', s1lgOld: '试过的其他膜外 K⁺', s1lgEK: 'E_K（当前膜外 K⁺）', s1lgENa: 'E_Na',
    s1readout: 'p = {p}，膜外 K⁺ = {ko} mM → E_K = {ek} mV，E_Na = {ena} mV，静息电位 V = {v} mV。按电压算，V 位于 E_K 到 E_Na 之间 {pct}% 处（0% 就是 E_K，100% 就是 E_Na）。',
    s1hint: '观察顺序：先保持膜外 K⁺ = 5 mM，从左往右拖 p：白点沿曲线从 E_K 附近升向 E_Na，p = 1（两种离子一样容易通过）时 V 接近 0。再把 p 放回 0.04，拖膜外 K⁺：E_K 线和整条曲线一起上移——膜外 K⁺ 从 5 mM 升到 10 mM，静息电位从 −68.6 mV 升到 −58.4 mV（变得不那么负）。每个试过的膜外 K⁺ 会留下一条淡色曲线。',

    s2k: '第 2 步 · 分级电位与总和',
    s2t: '一次小输入不够，两次挨得多近才能叠出一个脉冲？',
    s2e: '这一步要回答：一次小输入不足以让神经元放电，两次同样的小输入相隔多近，才能一起触发放电？从这一步起换用<strong>霍奇金–赫胥黎（HH）模型</strong>：1952 年根据乌贼巨轴突实测写出的方程组，静息电位约 −65 mV（与上一步的哺乳动物数值不同）。我们向膜注入 1 ms 长的电流脉冲（单位 µA/cm²：每平方厘米膜上的微安）。小输入只让电压鼓起一点再回落，输入越大鼓得越高，这叫<strong>分级电位</strong>。本模型里单个脉冲至少要 6.92 µA/cm² 才会引发尖峰，这个值叫<strong>阈值刺激</strong>，下面的输入强度都以它为单位。本页把电压向上越过 −20 mV 判定线算作一次尖峰。第二次输入若在第一次的鼓包退去前到达，就能叠得更高，这叫<strong>时间总和</strong>。',
    fracSlider: '每次输入的强度（× 阈值刺激）', gapSlider: '两次输入的间隔 Δt（ms）',
    c2top: '膜电压 V（mV）与时间（ms）', c2topZoom: '膜电压 V（mV）与时间（ms）· 纵轴放大', zoom2: '放大阈下部分（纵轴 −68 至 −52 mV）', c2bot: '能放电的区域：间隔 Δt（横轴，ms）与每次强度（纵轴）',
    s2lgBoth: '两次输入一起的电压 / 当前组合', s2lgAlone: '每次输入单独时的电压', lgLevel: '−20 mV 尖峰判定线', s2lgEdge: '临界间隔（线左侧放电）',
    fired: '放电了', notFired: '没有放电',
    s2readout: '每次输入 = {f} × 阈值刺激（{a} µA/cm²），间隔 {g} ms：单独一次的最高电压 {p1} mV；两次一起的最高电压 {p2} mV → {res}。{edge}',
    s2edge: '这个强度下，间隔不超过 {mg} ms 才能放电。',
    s2never: '这个强度下即使两次同时到达（合起来 {sum} × 阈值）也不够放电。',
    s2hint: '观察顺序：先保持强度 0.70，从 0 往右拖「间隔」：上图两个虚线鼓包分开，绿色实线的峰值降低，超过 2.04 ms 后不再放电（鼓包只有几 mV 高，可按「放大阈下部分」看清；这只改显示范围，不改模型）。再换强度重复：下图白线就是各强度的临界间隔，强度越大，允许的间隔越长；每次不到 0.5 倍时，两次同时到达也不够。灰点是你试过的组合（实心 = 放电）。',

    s3k: '第 3 步 · 全或无',
    s3t: '刺激加大一倍，尖峰也会高一倍吗？',
    s3e: '这一步要回答：输入越过阈值之后再加大，尖峰会不会更高？膜上有<strong>电压门控钠通道</strong>：电压升高时打开的 Na⁺ 通道。电压一旦被推过临界点，打开的钠通道让 Na⁺ 涌入，电压更高，又打开更多钠通道——一个自我加强的循环把电压一路推到约 +40 mV，这就是<strong>动作电位</strong>（尖峰）。尖峰多高由这个循环决定，不由刺激决定，所以叫<strong>全或无</strong>：要么不发，要么发一个几乎同样高的尖峰。下图横轴是刺激强度，纵轴是这次的最高电压。',
    ampSlider: '刺激强度（µA/cm²，脉冲 1 ms）', sweep3: '从 0 扫到 20', clearTried: '清除试过的点',
    c3top: '膜电压 V（mV）与时间（ms）', c3bot: '最高电压（mV）与刺激强度（µA/cm²）',
    s3lgNow: '当前刺激的电压 / 当前点', s3lgOld: '之前试过的波形与点', s3lgCurve: '完整的「最高电压—刺激」曲线', s3lgThr: '阈值刺激 6.92 µA/cm²',
    s3readout: '刺激 {a} µA/cm² = {f} × 阈值刺激 → 最高电压 {p} mV，{res}。',
    s3progress: '扫描中：{a} / 20 µA/cm²。',
    s3hint: '观察顺序：从 0 往右慢慢拖「刺激强度」，盯着下图：阈值以下，最高电压只缓慢升高（分级）；越过 6.92 µA/cm²，突然跳上去。再往右加：刺激从 1.05 倍加到 3 倍阈值，最高电压只从 36.5 mV 升到 40.6 mV。紧贴阈值（±1% 以内）时尖峰会推迟出现、峰值略低。上图保留最近几次的波形作对照。',
    quizPrompt: '小测：一个刺激已经越过阈值，把它再加大一倍，会怎样？',
    quizA: '尖峰高度也大约加倍', quizB: '尖峰高度几乎不变', quizC: '神经元不再放电',
    check: '检查答案',
    correct: '对。尖峰高度由钠通道的自我加强循环决定：从 2 倍到 3 倍阈值，最高电压只变了约 0.6 mV。更强的刺激在别处起作用：下一步你会看到它能在不应期里更早触发尖峰，第 5 步会看到持续更强的输入让尖峰更密。',
    wrong: '再看一下图：把滑杆从 14 拖到 20（约 2 倍到 3 倍阈值），下图白线几乎是平的。尖峰高度由钠通道的自我加强循环决定，不随刺激成比例变化。',

    s4k: '第 4 步 · 不应期',
    s4t: '刚发完一个尖峰，马上再刺激，还能再发吗？',
    s4e: '这一步要回答：一个尖峰之后，要等多久才能发下一个？尖峰顶端，钠通道会自己进入<strong>失活</strong>状态：关上之后暂时打不开，要等电压回到静息附近一段时间才复原。与此同时<strong>钾通道</strong>打开，K⁺ 外流把电压拉回来。中图的 h 是「还能被打开的钠通道比例」，n 是「钾通道的开放程度」（都在 0 到 1 之间）。实验：5 ms 时先用 2 倍阈值刺激打出一个尖峰，再隔 Δt 给第二次 1 ms 刺激。h 很低时，刺激再强也打不出尖峰，这段叫<strong>绝对不应期</strong>；h 逐渐恢复、但还需要比平时更强刺激的那段叫<strong>相对不应期</strong>。本页在 10 倍阈值以内找第二次刺激的最低强度。',
    gap4Slider: '两次刺激的间隔 Δt（ms）', mult4Slider: '第二次刺激强度（× 阈值刺激）',
    c4top: '膜电压 V（mV）与时间（ms）', c4mid: '钠通道可用比例 h、钾通道开放程度 n', c4bot: '第二次放电所需强度（× 阈值）与间隔 Δt（ms）',
    s4lgV: '膜电压 / 当前组合', s4lgH: 'h：可用钠通道', s4lgN: 'n：钾通道开放', s4lgCurve: '所需最低强度（线以上放电）', s4lgAbs: '绝对不应期（10 倍也不行）',
    s4readout: '间隔 {g} ms，第二次刺激 {m} × 阈值：第二个尖峰{res}。第二次刺激开始时 h = {h}，n = {n}。这个间隔下，第二次至少需要 {need}。',
    s4yes: '出现了（最高 {pk} mV）', s4no: '没有出现',
    needX: '{x} × 阈值', needInf: '超过 10 倍阈值（绝对不应期内）', needWait: '（正在计算…）',
    s4hint: '观察顺序：先把强度放在 10，从右往左拖「间隔」：短于 7.2 ms 后，即使 10 倍阈值也打不出第二个尖峰（下图粉色区）。再把间隔放在 10 ms，拖强度：需要约 3.76 倍才放电，这就是相对不应期。间隔到 15.8 ms 左右，所需强度才回到 1.05 倍以内；约 19 ms 时它甚至略低于平时（0.84 倍），这是 HH 模型在尖峰后的短暂「超常期」。看中图：所需强度随 h 回升而下降。',

    s5k: '第 5 步 · 频率上限',
    s5t: '持续推它，一秒最多能发多少个尖峰？',
    s5e: '这一步要回答：持续注入恒定电流，神经元会一个接一个地放电；电流越大，发得越快吗？有没有上限？每个尖峰之后都要过不应期，所以两个尖峰的间隔不可能比它短很多。下图纵轴是<strong>发放频率</strong>：每秒的尖峰数（Hz），只数电流接通后 100–400 ms 这段稳定期，用平均间隔换算。',
    iSlider: '恒定电流（µA/cm²）', sweep5: '从 0 扫到 200',
    c5top: '膜电压 V（mV），前 150 ms', c5bot: '发放频率（次/秒）与电流（µA/cm²）',
    s5lgV: '当前电流下的膜电压 / 当前点', s5lgCurve: '频率—电流曲线（算到哪画到哪）', s5lgRef: '1000 ÷ 绝对不应期 7.2 ms',
    s5none: '电流 {I} µA/cm² → 不能持续放电（开头发了 {n} 个尖峰），膜停在约 {v} mV。',
    s5fire: '电流 {I} µA/cm² → 稳定发放 {hz} 次/秒，相邻尖峰间隔 {isi} ms，尖峰顶点约 {pk} mV。',
    s5small: '电流 {I} µA/cm² → 电压仍在 {lo} 到 {hi} mV 之间振荡，但顶点达不到 −20 mV 判定线，不算尖峰：钠通道大多处于失活状态。',
    s5block: '电流 {I} µA/cm² → 去极化阻滞：膜停在约 {v} mV，不再放电。',
    s5pending: '（曲线还在计算：{c}/{N}）',
    s5hint: '观察顺序：从 0 往右拖电流：6 µA/cm² 还不能持续放电，7 µA/cm² 就以 58 次/秒起跳——这个模型没有「从很慢开始」的低频段。继续加大，频率上升但越来越慢，上图的尖峰越来越矮；99 µA/cm² 时最快，147 次/秒，间隔 6.8 ms，和第 4 步的绝对不应期 7.2 ms 相当（持续电流下的尖峰更矮，不必等钠通道完全恢复，所以可以略短）。再往上，振荡越不过判定线；到约 160 µA/cm² 振荡完全消失，膜停在去极化状态，这叫去极化阻滞。',

    s6k: '第 6 步 · 收束',
    s6t: '用三句话把神经信号串起来',
    s6fin: '<strong>电压从哪来</strong>：离子浓度差加上只放某种离子通过的通道，产生平衡电位；静息电位是 K⁺ 和 Na⁺ 两股作用按通透性加权后的停靠点，因为 K⁺ 通道开得多，它停在 E<sub>K</sub> 附近。<strong>发不发</strong>：小输入产生会叠加、会消退的分级电位；叠过阈值，钠通道的自我加强循环接管，产生高度几乎固定的尖峰（全或无）。<strong>能发多快</strong>：钠通道失活与钾通道开放带来不应期，它决定了相邻尖峰的最短间隔，于是频率有上限；推得太狠，反而因钠通道一直失活而停止放电。',
    boundary: '模型边界：第 0–1 步用 37 °C 的哺乳动物教科书浓度，只考虑 K⁺ 和 Na⁺，忽略 Cl⁻ 和钠钾泵的直接电流；第 2–5 步用 1952 年乌贼巨轴突的 HH 方程（6.3 °C），它比哺乳动物神经元慢得多（真实的绝对不应期常在 1–2 ms），只模拟一小片均匀的膜，不含树突形状、突触和信号沿轴突的传播。阈值、不应期都依赖本页约定的 1 ms 脉冲、−20 mV 判定线和 10 倍阈值上限。这是教学模型，不用于任何医学判断。',
    formula: 'E = 61.5 mV × log₁₀(膜外 ÷ 膜内)\nV静息 = 61.5 mV × log₁₀[(K⁺外 + p·Na⁺外) ÷ (K⁺内 + p·Na⁺内)]\n越过阈值 → 全或无尖峰 → 不应期 → 频率上限',
    linksTitle: '接着去哪',
    lk1: '→ 神经动作电位页第 1 步：Na⁺ 内流和 K⁺ 外流怎样一前一后画出尖峰',
    lk2: '→ 神经动作电位页第 2 步：换一种方式数一秒最多能发几次',
    lk3: '→ 指数与对数页第 3 步：为什么能斯特方程里每 10 倍浓度比只加 61.5 mV',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《神经科学基础 · 从静息到脉冲》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Neuroscience Basics · From Rest to Spike”.',
  },
  en: {
    pageTitle: 'Nerve Signals · From Ion Gradients to Spike Trains',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Neuroscience Basics · From Rest to Spike →',
    navLabel: 'Nerve signal steps',
    tagline: 'Neurons talk with the voltage across their membrane, yet there is no battery inside a cell. Where does that voltage come from? How does a neuron decide whether to fire, and how fast can it fire? In seven steps you will compute the resting potential from the ion concentrations on either side of the membrane, then stimulate a classic neuron model yourself and watch it fire, recover and fire again.',
    nav0: '0 One ion', nav1: '1 Resting potential', nav2: '2 Summation', nav3: '3 All-or-none', nav4: '4 Refractory period', nav5: '5 Rate ceiling', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · ONE ION',
    s0t: 'Why does a concentration difference across a membrane create a voltage?',
    s0e: 'This step answers: if an ion is more concentrated on one side of the membrane, how large a voltage does that produce? A neuron’s <strong>cell membrane</strong> separates inside from outside, and <strong>ion channels</strong> are pores that let only particular ions through. Suppose the membrane passes only K⁺. There is a lot of K⁺ inside (140 mM, millimoles per litre) and little outside (5 mM). K⁺ leaks outward down its concentration gradient, and every ion that leaves carries away one positive charge, so the inside turns negative. The more negative the inside, the harder it pulls the positive K⁺ back. When the two effects balance, the net flow stops; the inside-minus-outside voltage at that point is the ion’s <strong>equilibrium potential</strong> E. The <strong>Nernst equation</strong> gives it (37 °C, singly charged ion): E = 61.5 mV × log₁₀(outside concentration ÷ inside concentration). Every tenfold change in the ratio shifts E by 61.5 mV (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ Exponents & Logarithms, step 3: how a logarithm turns “times 10” into “one more notch”</a>). Only a tiny number of ions has to cross to build this voltage, so the concentrations barely change.',
    ionPick: 'Choose an ion', ionK: 'K⁺ (potassium)', ionNa: 'Na⁺ (sodium)',
    outConc: 'Outside concentration (mM)', inConc: 'Inside concentration (mM)',
    s0lgNow: 'Current setting', s0lgTried: 'Settings you tried', lgIonK: 'K⁺ ions (dot count ∝ concentration)', lgIonNa: 'Na⁺ ions (dot count ∝ concentration)',
    c0top: 'Ions on each side (top: outside, bottom: inside)', c0bot: 'Equilibrium potential E (mV) vs ratio outside ÷ inside (log scale)',
    outside: 'Outside', inside: 'Inside',
    s0readout: '{ion}: {o} mM outside, {i} mM inside, ratio {r}. Equilibrium potential E = 61.5 × log₁₀({r}) = {E} mV, meaning that when the inside sits {abs} mV {dir} the outside, this ion’s inward and outward flows cancel.',
    dirNeg: 'below', dirPos: 'above',
    s0zero: '{ion}: {o} mM outside, {i} mM inside, ratio 1. With equal concentrations there is no gradient to balance, so E = 0 mV.',
    s0hint: 'What to watch: keep K⁺ and drag only “Outside concentration”. In the lower chart the white dot slides along a straight line: every tenfold increase in the ratio raises E by 61.5 mV, and a ratio of 1 gives E = 0. Then switch to Na⁺: it is concentrated outside rather than inside, so its equilibrium potential is positive (+66.6 mV by default). In the upper picture the dot count shows concentration and the + and − signs along the membrane show which way the voltage points. Grey dots are settings you have tried.',

    s1k: 'STEP 1 · RESTING POTENTIAL',
    s1t: 'K⁺ and Na⁺ both leak a little. Where does the voltage settle at rest?',
    s1e: 'This step answers: a real membrane does not pass K⁺ alone; at rest a little Na⁺ leaks in as well. So where does the unstimulated voltage, the <strong>resting potential</strong>, settle? From the last step, K⁺ pulls the voltage toward its equilibrium potential E<sub>K</sub> (−89.1 mV) and Na⁺ pulls toward E<sub>Na</sub> (+66.6 mV). Whichever ion has the larger <strong>permeability</strong> (how easily the membrane lets it through) pulls harder. The <strong>Goldman equation</strong> combines the two: V = 61.5 mV × log₁₀[(K⁺out + p·Na⁺out) ÷ (K⁺in + p·Na⁺in)], where p = Na⁺ permeability ÷ K⁺ permeability. A resting neuron has p ≈ 0.04, which gives V = −68.6 mV: much closer to E<sub>K</sub>, because far more K⁺ channels than Na⁺ channels are open at rest. The concentration differences themselves are maintained by the energy-consuming <strong>sodium–potassium pump</strong>; this page treats the concentrations as fixed.',
    pSlider: 'Permeability ratio p = P_Na ÷ P_K (log slider)', koSlider: 'Outside K⁺ concentration (mM)', reset1: 'Back to default (p = 0.04, K⁺out = 5 mM)',
    c1: 'Resting potential V (mV) vs permeability ratio p (log axis)',
    s1lgCurve: 'Curve and point for the current outside K⁺', s1lgOld: 'Other outside K⁺ values you tried', s1lgEK: 'E_K (current outside K⁺)', s1lgENa: 'E_Na',
    s1readout: 'p = {p}, outside K⁺ = {ko} mM → E_K = {ek} mV, E_Na = {ena} mV, resting potential V = {v} mV. On the voltage scale, V sits {pct}% of the way from E_K to E_Na (0% is E_K, 100% is E_Na).',
    s1hint: 'What to watch: keep outside K⁺ at 5 mM and drag p from left to right. The white dot climbs the curve from near E_K toward E_Na; at p = 1 (both ions pass equally easily) V is close to 0. Then put p back at 0.04 and drag outside K⁺: the E_K line and the whole curve shift up together. Raising outside K⁺ from 5 to 10 mM moves the resting potential from −68.6 mV to −58.4 mV (less negative). Every outside K⁺ value you try leaves a faint curve behind.',

    s2k: 'STEP 2 · GRADED POTENTIALS AND SUMMATION',
    s2t: 'One small input is not enough. How close must two be to add up to a spike?',
    s2e: 'This step answers: one small input cannot make the neuron fire, so how close together must two identical small inputs arrive to trigger a spike between them? From here on we use the <strong>Hodgkin–Huxley (HH) model</strong>, a set of equations written in 1952 from measurements on the squid giant axon. It rests near −65 mV (not the mammalian numbers of the last step). We inject 1-ms pulses of current into the membrane (units µA/cm²: microamps per square centimetre of membrane). A small input only makes the voltage bulge up and sag back, and a bigger input makes a bigger bulge; this is a <strong>graded potential</strong>. In this model a single pulse needs at least 6.92 µA/cm² to trigger a spike. We call that the <strong>threshold stimulus</strong> and measure input strength in units of it. A spike here means the voltage crossing −20 mV on its way up. If the second input arrives before the first bulge has faded, it stacks on top; this is <strong>temporal summation</strong>.',
    fracSlider: 'Strength of each input (× threshold stimulus)', gapSlider: 'Gap between the inputs Δt (ms)',
    c2top: 'Membrane voltage V (mV) vs time (ms)', c2topZoom: 'Voltage V (mV) vs time (ms), zoomed to −68…−52 mV', zoom2: 'Zoom into the sub-threshold range (−68 to −52 mV)', c2bot: 'Where it fires: gap Δt (ms, across) vs strength (up)',
    s2lgBoth: 'Voltage with both inputs / current setting', s2lgAlone: 'Voltage from each input alone', lgLevel: '−20 mV spike line', s2lgEdge: 'Critical gap (fires left of the line)',
    fired: 'it fires', notFired: 'no spike',
    s2readout: 'Each input = {f} × threshold stimulus ({a} µA/cm²), gap {g} ms: one input alone peaks at {p1} mV; both together peak at {p2} mV → {res}. {edge}',
    s2edge: 'At this strength the gap must be {mg} ms or less to fire.',
    s2never: 'At this strength even simultaneous inputs ({sum} × threshold combined) are not enough.',
    s2hint: 'What to watch: keep the strength at 0.70 and drag the gap up from 0. In the upper chart the two dashed bulges separate, the peak of the solid green trace drops, and beyond 2.04 ms there is no spike (the bulges are only a few mV tall; “Zoom into the sub-threshold range” makes them visible and changes only the display, not the model). Repeat at other strengths: the white line in the lower chart is the critical gap for each strength, and stronger inputs tolerate longer gaps. Below 0.5 × threshold each, even simultaneous inputs fail. Grey dots are settings you tried (filled = fired).',

    s3k: 'STEP 3 · ALL-OR-NONE',
    s3t: 'Double the stimulus. Does the spike double too?',
    s3e: 'This step answers: once an input is past threshold, does making it bigger make the spike taller? The membrane carries <strong>voltage-gated sodium channels</strong>, Na⁺ channels that open when the voltage rises. Push the voltage past a tipping point and the opened channels let Na⁺ rush in, which raises the voltage further, which opens more channels. That self-reinforcing loop drives the voltage to about +40 mV: an <strong>action potential</strong>, or spike. The loop, not the stimulus, sets the height, so the response is <strong>all-or-none</strong>: no spike, or a spike of almost the same size. In the lower chart the horizontal axis is stimulus strength and the vertical axis is the highest voltage reached.',
    ampSlider: 'Stimulus strength (µA/cm², 1-ms pulse)', sweep3: 'Sweep from 0 to 20', clearTried: 'Clear tried points',
    c3top: 'Membrane voltage V (mV) vs time (ms)', c3bot: 'Highest voltage (mV) vs stimulus strength (µA/cm²)',
    s3lgNow: 'Voltage for the current stimulus / current point', s3lgOld: 'Earlier traces and points', s3lgCurve: 'Full “highest voltage vs stimulus” curve', s3lgThr: 'Threshold stimulus 6.92 µA/cm²',
    s3readout: 'Stimulus {a} µA/cm² = {f} × threshold stimulus → highest voltage {p} mV, {res}.',
    s3progress: 'Sweeping: {a} / 20 µA/cm².',
    s3hint: 'What to watch: drag “Stimulus strength” slowly up from 0 and keep your eyes on the lower chart. Below threshold the highest voltage creeps up (graded). Past 6.92 µA/cm² it jumps. Keep going: from 1.05 to 3 times threshold the highest voltage only rises from 36.5 mV to 40.6 mV. Within ±1% of threshold the spike comes late and a little lower. The upper chart keeps the last few traces for comparison.',
    quizPrompt: 'Quick check: a stimulus is already past threshold. What happens if you double it?',
    quizA: 'The spike gets roughly twice as tall', quizB: 'The spike height barely changes', quizC: 'The neuron stops firing',
    check: 'Check answer',
    correct: 'Right. The sodium-channel feedback loop sets the spike height: from 2 to 3 times threshold the highest voltage changes by only about 0.6 mV. A stronger stimulus matters elsewhere: in the next step it can trigger a spike earlier during the refractory period, and in step 5 a stronger sustained input packs spikes closer together.',
    wrong: 'Look at the chart again: drag the slider from 14 to 20 (about 2 to 3 times threshold) and the white curve is nearly flat. The sodium-channel feedback loop sets the spike height; it does not scale with the stimulus.',

    s4k: 'STEP 4 · REFRACTORY PERIOD',
    s4t: 'Right after a spike, can a second stimulus fire another?',
    s4e: 'This step answers: after one spike, how long until the next one is possible? At the top of a spike the sodium channels enter an <strong>inactivated</strong> state: shut and temporarily unable to reopen until the voltage has spent some time near rest. Meanwhile <strong>potassium channels</strong> open, and K⁺ flowing out pulls the voltage back down. In the middle chart, h is the fraction of sodium channels that are available to open and n is how far the potassium channels are open (both between 0 and 1). The experiment: at 5 ms a stimulus of 2 × threshold fires a spike, then a second 1-ms stimulus follows Δt later. While h is very low no stimulus, however strong, can fire a spike: the <strong>absolute refractory period</strong>. While h recovers but a stronger-than-usual stimulus is still needed, we are in the <strong>relative refractory period</strong>. The page searches for the weakest second stimulus up to 10 × threshold.',
    gap4Slider: 'Gap between stimuli Δt (ms)', mult4Slider: 'Second stimulus strength (× threshold)',
    c4top: 'Membrane voltage V (mV) vs time (ms)', c4mid: 'Available sodium channels h, potassium opening n', c4bot: 'Strength for a 2nd spike (× threshold) vs gap Δt (ms)',
    s4lgV: 'Membrane voltage / current setting', s4lgH: 'h: available Na⁺ channels', s4lgN: 'n: K⁺ channel opening', s4lgCurve: 'Weakest strength that fires (fires above the line)', s4lgAbs: 'Absolute refractory (even 10× fails)',
    s4readout: 'Gap {g} ms, second stimulus {m} × threshold: the second spike {res}. When the second stimulus starts, h = {h} and n = {n}. At this gap the second stimulus needs at least {need}.',
    s4yes: 'appears (peak {pk} mV)', s4no: 'does not appear',
    needX: '{x} × threshold', needInf: 'more than 10 × threshold (absolute refractory)', needWait: '(computing…)',
    s4hint: 'What to watch: set the strength to 10 and drag the gap down from the right. Below 7.2 ms even 10 × threshold cannot fire a second spike (pink zone in the lower chart). Then set the gap to 10 ms and drag the strength: it takes about 3.76 × threshold, which is the relative refractory period. Only around 15.8 ms is the required strength back within 1.05 × threshold, and near 19 ms it even dips below normal (0.84 ×), a brief “supernormal” phase of the HH model after a spike. Watch the middle chart: the required strength falls as h recovers.',

    s5k: 'STEP 5 · RATE CEILING',
    s5t: 'Keep pushing. How many spikes per second at most?',
    s5e: 'This step answers: under a steady injected current the neuron fires spike after spike. Does more current mean faster firing, and is there a limit? Every spike is followed by a refractory period, so two spikes cannot be much closer together than that. The lower chart shows the <strong>firing rate</strong>, spikes per second (Hz), counted only in the steady stretch from 100 to 400 ms after the current switches on and converted from the average interval.',
    iSlider: 'Steady current (µA/cm²)', sweep5: 'Sweep from 0 to 200',
    c5top: 'Membrane voltage V (mV), first 150 ms', c5bot: 'Firing rate (spikes/s) vs current (µA/cm²)',
    s5lgV: 'Voltage at the current setting / current point', s5lgCurve: 'Rate–current curve (drawn as it is computed)', s5lgRef: '1000 ÷ absolute refractory 7.2 ms',
    s5none: 'Current {I} µA/cm² → no sustained firing ({n} spikes at the start), the membrane settles near {v} mV.',
    s5fire: 'Current {I} µA/cm² → steady firing at {hz} spikes/s, {isi} ms between spikes, spike tops near {pk} mV.',
    s5small: 'Current {I} µA/cm² → the voltage still oscillates between {lo} and {hi} mV, but the tops never reach the −20 mV line, so these are not spikes: most sodium channels stay inactivated.',
    s5block: 'Current {I} µA/cm² → depolarization block: the membrane sits near {v} mV and stops firing.',
    s5pending: '(curve still computing: {c}/{N})',
    s5hint: 'What to watch: drag the current up from 0. At 6 µA/cm² there is no sustained firing; at 7 µA/cm² it starts straight at 58 spikes/s, so this model has no “start slowly” range. Push further and the rate climbs ever more slowly while the spikes in the upper chart shrink. The fastest is 147 spikes/s at 99 µA/cm², an interval of 6.8 ms, comparable to the 7.2 ms absolute refractory period from step 4 (under a steady current the spikes are smaller and need not wait for full sodium-channel recovery, so the interval can be slightly shorter). Beyond that the oscillation no longer crosses the spike line, and by about 160 µA/cm² it dies out completely, leaving the membrane stuck depolarized: depolarization block.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Nerve signals in three sentences',
    s6fin: '<strong>Where the voltage comes from</strong>: a concentration difference plus channels that pass only one ion give an equilibrium potential; the resting potential is where the K⁺ and Na⁺ pulls balance once weighted by permeability, and because far more K⁺ channels are open it sits near E<sub>K</sub>. <strong>Whether it fires</strong>: small inputs make graded potentials that add up and fade; once they sum past threshold the sodium-channel feedback loop takes over and fires a spike of nearly fixed height (all-or-none). <strong>How fast it can fire</strong>: sodium-channel inactivation and potassium-channel opening create a refractory period that sets the shortest gap between spikes, so the rate has a ceiling; push too hard and the neuron stops firing altogether because its sodium channels stay inactivated.',
    boundary: 'Model limits: steps 0–1 use textbook mammalian concentrations at 37 °C with only K⁺ and Na⁺, ignoring Cl⁻ and the pump’s own current. Steps 2–5 use the 1952 HH equations for the squid giant axon at 6.3 °C, which are much slower than mammalian neurons (real absolute refractory periods are often 1–2 ms), and they simulate one small uniform patch of membrane: no dendrite shape, no synapses, no propagation along the axon. Threshold and refractory numbers depend on this page’s choices of a 1-ms pulse, a −20 mV spike line and a 10 × threshold cap. This is a teaching model, not a basis for any medical judgement.',
    formula: 'E = 61.5 mV × log₁₀(out ÷ in)\nV_rest = 61.5 mV × log₁₀[(K⁺out + p·Na⁺out) ÷ (K⁺in + p·Na⁺in)]\npast threshold → all-or-none spike → refractory period → rate ceiling',
    linksTitle: 'Where next',
    lk1: '→ Action Potentials, step 1: how Na⁺ rushing in and K⁺ flowing out draw the spike one after the other',
    lk2: '→ Action Potentials, step 2: another way to count the maximum spikes per second',
    lk3: '→ Exponents & Logarithms, step 3: why each tenfold ratio adds just 61.5 mV in the Nernst equation',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《神经科学基础 · 从静息到脉冲》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Neuroscience Basics · From Rest to Spike”.',
  },
};

let lang = 'zh';
try { if (typeof window !== 'undefined') lang = localStorage.getItem('knowledge-lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch (_) { /* storage unavailable */ }
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
  if (typeof window.refreshNeuro === 'function') window.refreshNeuro();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.NEURO_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
