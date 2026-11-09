'use strict';
// Thermodynamics lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '热力学 · 一只气缸的能量账',
    back: '← 知识索引',
    compare: '对照另一版本：热力学 · 一口气追踪能量 →',
    navLabel: '热力学步骤导航',
    tagline: '把 0.2 mol 理想气体关进带活塞的气缸：加热它、推活塞、让它膨胀，每一焦耳能量都去了哪里？七步里你会从状态方程出发，把「功 = 面积」「ΔU = Q − W」「等温与绝热」串成一本对得上的账，最后算出热机效率的上限从何而来。',
    nav0: '0 状态', nav1: '1 功是面积', nav2: '2 第一定律', nav3: '3 等温与绝热', nav4: '4 卡诺循环', nav5: '5 上限从何来', nav6: '6 收束',

    s0k: '第 0 步 · 气体的状态',
    s0t: '体积和温度定了，压强由什么决定？',
    s0e: '这一步要回答：气缸里有 n = 0.2 mol 理想气体，体积 V、温度 T 已知时，压强 P 是多少？<strong>状态</strong>指用几个可测的量（P、V、T）描述气体此刻的样子。<strong>理想气体</strong>假设分子本身不占体积、彼此没有吸引，它满足状态方程 <strong>PV = nRT</strong>，摩尔气体常数 R = 8.314 J/(mol·K)。压强来自分子不停地撞击器壁（<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step0">→ 气体动理论第 0 步：压强就是撞墙</a>）。本页单位：P 用 kPa，V 用 L，T 用开尔文 K；1 kPa × 1 L = 1 J，所以 PV 直接是焦耳。左图是气缸，活塞高度表示体积，气体颜色从蓝到红表示从冷到热；右图是 <strong>P–V 图</strong>，横轴体积、纵轴压强，灰线是 200–600 K 每隔 100 K 的<strong>等温线</strong>（温度相同的状态连成的曲线），亮线是当前温度的等温线。',
    volSlider: '体积 V', tempSlider: '温度 T', clearTrail: '清空轨迹',
    s0lgGas: '气体颜色：蓝 = 冷，红 = 热', s0lgIso: '200–600 K 的等温线', s0lgNow: '当前温度的等温线', s0lgTrail: '走过的状态',
    c0a: '气缸 · 体积刻度（L）', c0b: '压强 P（kPa）↑ 对 体积 V（L）→',
    c0aAria: '气缸示意图：活塞位置表示体积，颜色表示温度', c0bAria: 'P–V 图：等温线与当前状态',
    s0readout: 'P = nRT ÷ V = {n} × {R} × {T} ÷ {V} = {P} kPa。PV = {pv} J，正是 nRT：温度定了，P 与 V 的乘积就定了。',
    s0hint: '观察顺序：先只拖体积，状态点沿亮色等温线滑动，体积翻倍、压强减半。再只拖温度，状态点竖直移动，换到另一条等温线上。白点记下你走过的状态：P–V 图上的每一个点都对应唯一一组 (P, V, T)，与你怎样走到那里无关。',

    s1k: '第 1 步 · 功是面积',
    s1t: '气体推着活塞走一段，对外做了多少功？',
    s1e: '这一步要回答：气体从状态 A（2 L，250 kPa）变到状态 B，推活塞做了多少<strong>功</strong>？活塞面积为 S、气体压强为 P 时，推力是 P·S；活塞移动 dx，扫过的体积 dV = S·dx，做的功是 P·S·dx = P·dV。整段加起来 <strong>W = ∫P dV</strong>，就是 P–V 图上路径下方、到横轴为止的面积（<a class="xlink" href="../../../physics/thermal/carnot-cycle/#step0">→ 卡诺循环第 0 步：功是面积</a>）。这里假设过程是<strong>准静态</strong>的：活塞动得足够慢，气体每一刻都处在确定的状态，路径才能画成一条线。本页约定 W 是气体对外做的功：膨胀（V 变大）时 W > 0，压缩时 W < 0。从 A 到 B 有无数条路，这里比较三条：① 先<strong>等压</strong>（P 不变）膨胀，再<strong>等容</strong>（V 不变）降压；② 先等容降压，再等压膨胀；③ 直线。',
    pathPV: '① 先等压，后等容', pathVP: '② 先等容，后等压', pathLine: '③ 直线',
    pathPVShort: '①（先等压后等容）', pathVPShort: '②（先等容后等压）', pathLineShort: '③（直线）',
    vbSlider: '终态 B 的体积', pbSlider: '终态 B 的压强', play1: '沿路径走一遍',
    s1lgPath: '所选路径（亮色 = 已走过）', s1lgArea: '面积 = 气体对外做的功（正）', s1lgNeg: '负面积：外界压缩气体', s1lgOther: '另外两条路径',
    c1: '压强 P（kPa）↑ 对 体积 V（L）→ · 阴影 = W',
    s1prog: '已走 {pct}%，到此做功 {w} J。',
    s1readout: 'A（{va} L，{pa} kPa）→ B（{vb} L，{pb} kPa）。所选路径 {name}：W = ∫P dV = {w} J{dir}。三条路径的功：① {w1} J，② {w2} J，③ {w3} J。',
    dirOut: '（气体膨胀，对外做功）', dirIn: '（气体被压缩，外界对它做功）', dirZero: '（体积不变，不做功）',
    s1hint: '观察顺序：保持 B 不动，依次点三个路径按钮：阴影面积明显不同，读数里三个功也不同。按「沿路径走一遍」，看阴影随状态点一点点长出来：竖直段（等容）不增加面积。再把 B 的体积拖到 2 L 以下，变成压缩：阴影变红，功为负。',

    s2k: '第 2 步 · 第一定律',
    s2t: '同样从 A 到 B，热量和功都随路径变，哪个量不变？',
    s2e: '这一步要回答：上一步三条路径的功不同，那吸收的热量呢？有没有哪个量只看起点和终点？气体的<strong>内能</strong> U 是全部分子热运动能量的总和；理想气体的 U 只取决于温度：U = n·Cv·T。Cv 是<strong>定容摩尔热容</strong>，即体积不变时 1 mol 气体升温 1 K 要吸收的热：单原子气体（如氦、氩）Cv = 3R/2 ≈ 12.47 J/(mol·K)；双原子气体（如室温下的氮、氧）Cv = 5R/2 ≈ 20.79 J/(mol·K)。<strong>热力学第一定律</strong>就是能量守恒：外界给气体的热量 Q，一部分用来对外做功 W，其余使内能增加：<strong>ΔU = Q − W</strong>，也就是 Q = ΔU + W。本步沿用第 1 步的 A、B 和三条路径。柱状图每组是一条路径，三根柱子依次是 Q、W、ΔU（向下为负），绿色虚线标出 ΔU 的高度。',
    gasLabel: '气体：', gasMono: '单原子气体', gasDi: '双原子气体', gasMonoShort: '单原子气体', gasDiShort: '双原子气体',
    s2lgQ: '吸热 Q', s2lgW: '对外做功 W', s2lgU: '内能变化 ΔU（虚线 = 它的高度）', s2lgPaths: '① 先等压后等容 · ② 先等容后等压 · ③ 直线',
    c2: '能量（J）· {gas} · 每组一条路径',
    s2readout: '{gas}，Cv = {cv} J/(mol·K)。T_A = {ta} K，T_B = {tb} K，ΔU = n·Cv·(T_B − T_A) = {du} J，三条路径都一样。Q = ΔU + W：① W = {w1} J，Q = {q1} J；② W = {w2} J，Q = {q2} J；③ W = {w3} J，Q = {q3} J。',
    s2hint: '观察顺序：先看三组里的绿柱：一样高，正好落在绿色虚线上。ΔU 只由 A、B 两点的温度决定，这样的量叫状态量。再比橙柱和青柱：功大的路径吸热也多，两者之差始终等于 ΔU。回第 1 步拖动 B，三组一起变；切换气体只改 ΔU 和 Q，W 不动，因为功只看 P–V 路径。气体选择全页共用。',
    q2Prompt: '想一想：气体从 A 经两条不同的路径到达 B，下面哪个量一定相同？',
    q2A: '吸收的热量 Q', q2B: '对外做的功 W', q2C: '内能变化 ΔU',
    q2Right: '对。ΔU 只取决于始末状态的温度，是状态量；Q 和 W 都随路径变，是过程量。',
    q2Wrong: '看柱状图：三组的橙柱（Q）和青柱（W）高度都不同，只有绿柱（ΔU）三组一样。',
    check: '检查答案', pick: '先选一个选项。',

    s3k: '第 3 步 · 等温与绝热',
    s3t: '同样膨胀到 V₂，保持温度和隔绝热量，结果差多少？',
    s3e: '这一步要回答：同一团气体（1.5 L，400 K）膨胀到体积 V₂，有两种极端做法，压强、温度、功各会怎样？<strong>等温过程</strong>：气缸贴着 400 K 的大热源慢慢膨胀，T 不变，所以 ΔU = 0，吸多少热就对外做多少功：Q = W = nRT·ln(V₂/V₁)。<strong>绝热过程</strong>：气缸包上隔热层，Q = 0，对外做的功只能从内能里出：W = −ΔU，于是温度下降。由第一定律和 PV = nRT 可以推出，绝热过程满足 PV^γ = 常数、TV^(γ−1) = 常数，其中 <strong>γ</strong> = Cp/Cv 是定压热容与定容热容之比（单原子 5/3，双原子 7/5）。左图是 P–V 图，两块阴影分别是两种过程做的功（重叠处颜色叠加）；右图是温度随体积的变化。',
    v2Slider: '终态体积 V₂',
    s3lgIso: '等温（T 不变）', s3lgAdia: '绝热（Q = 0）', s3lgStart: '共同的起点（1.5 L，400 K）',
    c3a: '压强 P（kPa）↑ 对 体积 V（L）→', c3b: '温度 T（K）↑ 对 体积 V（L）→',
    c3aAria: 'P–V 图：等温线与绝热线', c3bAria: '温度随体积的变化',
    s3readout: '{gas}（γ = {g}），从 {v1} L、{t1} K 到 {v2} L。等温：T 保持 {t1} K，P → {pi} kPa，W = Q = {wi} J，ΔU = 0。绝热：Q = 0，T → {ta} K，P → {pa} kPa，ΔU = {du} J，W = −ΔU = {wa} J。{note}',
    s3compress: '（V₂ 小于起始体积，这是压缩，W 为负；绝热压缩时外界做的功全部变成内能，气体升温。）',
    s3same: '（体积还没变，两种过程都尚未开始。）',
    s3hint: '观察顺序：把 V₂ 从 1.5 L 往大拖：橙色绝热线比青色等温线降得快，它下方的面积（功）更小；右图橙线一路降温，青线保持水平。把 V₂ 拖到 1.5 L 以下变成压缩：绝热压缩让气体升温。再切换单原子 / 双原子：γ 越大，绝热线越陡，降温越多。',
    q3Prompt: '想一想：让一筒气体绝热地膨胀（不让热量进出），它的温度会？',
    q3A: '不变：没有热量进出，温度就不会变', q3B: '降低：对外做的功只能从内能里出', q3C: '升高：体积变大，分子更活跃',
    q3Right: '对。Q = 0 时 ΔU = −W；膨胀时 W > 0，内能减少，理想气体的温度随之下降。',
    q3Wrong: '看右图的橙线：绝热膨胀时温度一路下降。「没有热量进出」不等于「内能不变」，做功也会改变内能。',

    s4k: '第 4 步 · 卡诺循环',
    s4t: '让气体转一圈回到原状，吸进的热最多有多少能变成功？',
    s4e: '这一步要回答：热机要一圈一圈地工作，气体必须回到起点。在高温热源 Th 与低温冷源 Tc 之间，用四段可逆过程绕一圈，就是<strong>卡诺循环</strong>：① 在 Th 下等温膨胀，从热源吸热 Qh；② 绝热膨胀，降温到 Tc；③ 在 Tc 下等温压缩，向冷源放热 Qc；④ 绝热压缩，升温回到 Th。转完一圈气体回到原状，ΔU = 0，所以净功 W = Qh − Qc，也就是回路围住的面积。<strong>效率</strong> η = W ÷ Qh，表示吸进的热有多大比例变成了功（<a class="xlink" href="../../../physics/thermal/carnot-cycle/#step4">→ 卡诺循环第 4 步：效率上限</a>）。r 是第 ① 段的膨胀比（结束体积 ÷ 开始体积，开始体积为 1 L）。左图是循环的 P–V 图，坐标轴随参数自动缩放；右图是一圈中吸热、放热和净功的累计，虚线框是转完一圈后的值。',
    thSlider: '热源温度 Th', tcSlider: '冷源温度 Tc', rSlider: '等温膨胀比 r', play4: '转一圈',
    s4lgHot: '① Th 等温膨胀（吸热）', s4lgCold: '③ Tc 等温压缩（放热）', s4lgAdia: '②④ 绝热', s4lgArea: '围住的面积 = 净功 W',
    c4a: 'P（kPa）↑ 对 V（L）→', c4b: '一圈的能量账（J）· 已转 {pct}%',
    c4aAria: '卡诺循环的 P–V 图', c4bAria: '吸热、放热与净功的累计条形图',
    leg0: '① 等温膨胀', leg1: '② 绝热膨胀', leg2: '③ 等温压缩', leg3: '④ 绝热压缩',
    s4prog: '已转 {pct}%（正在 {leg}）：已吸热 {qin} J，已放热 {qout} J，累计净功 {w} J。',
    s4readout: '{gas}，Th = {th} K，Tc = {tc} K，r = {r}。Qh = nR·Th·ln r = {qh} J，Qc = nR·Tc·ln r = {qc} J，W = Qh − Qc = {w} J。η = W ÷ Qh = {eta}，正好等于 1 − Tc/Th = {etac}。（这组 Th、Tc 下已试 {k} 种 r／气体组合，效率都相同）',
    s4hint: '观察顺序：按「转一圈」：右图粉条（吸热）只在第 ① 段增长，青条（放热）只在第 ③ 段增长，绿条（净功）在膨胀段变长、压缩段变短，最后停在 Qh − Qc。然后保持 Th、Tc 不变，拖动膨胀比 r、切换气体：回路的形状和面积、Qh、W 都变了，读数里的 η 却始终等于 1 − Tc/Th。只有改 Th 或 Tc 才能改变效率。',

    s5k: '第 5 步 · 上限从何来',
    s5t: '换一种循环，效率能追上卡诺吗？',
    s5e: '这一步要回答：换一种同样在 Th、Tc 之间工作的循环，效率会怎样？<strong>斯特林循环</strong>把卡诺循环的两段绝热换成两段<strong>等容</strong>过程：① Th 等温膨胀 → ② 等容降温到 Tc → ③ Tc 等温压缩 → ④ 等容升温回到 Th。净功 W = nR(Th − Tc)·ln r。问题出在第 ④ 段：它要从外面吸热 n·Cv·(Th − Tc)，而且是在低于 Th 的温度下吸的。如果把第 ② 段放出的热先存进<strong>回热器</strong>（一块蓄热的金属网），到第 ④ 段原样还给气体，这部分热就不必从热源取。本步沿用第 4 步的 Th、Tc、r 和所选气体。左图橙色是斯特林循环，灰色虚线是同条件下的卡诺循环；右图是效率随膨胀比 r 的变化，白线是卡诺上限 1 − Tc/Th。',
    regenOff: '无回热器', regenOn: '理想回热器',
    s5lgSt: '斯特林循环', s5lgCarnot: '同条件的卡诺循环', s5lgEtaC: '卡诺上限 1 − Tc/Th', s5lgNow: '当前 r 下的效率',
    c5a: 'P（kPa）↑ 对 V（L）→', c5b: '效率 η ↑ 对 膨胀比 r →',
    c5aAria: '斯特林循环与卡诺循环的 P–V 图', c5bAria: '效率随膨胀比的变化',
    s5regenOff: '，加上等容升温 {qv} J', s5regenOn: '（等容升温要的 {qv} J 由回热器归还，不从热源取）',
    s5readout: '{gas}，Th = {th} K，Tc = {tc} K，r = {r}。W = nR(Th − Tc)·ln r = {w} J。从热源吸热：等温膨胀 {qiso} J{plus}，共 {qin} J。η = W ÷ 吸热 = {eta}，卡诺上限 {etac}，差 {gap}。',
    s5hint: '观察顺序：先比两个回路：形状不同，面积却相等，净功都是 nR(Th − Tc)·ln r，差别全在吸了多少热。再看「无回热器」：右图橙点在白线下方；回第 4 步把 r 拖大，橙点沿橙线上升，却始终够不着白线。再点「理想回热器」：等容段的热在内部循环，从热源吸的热只剩等温膨胀那一份，橙线与白线重合。结论：只有全部热量都在 Th 吸入、在 Tc 放出时，效率才能达到 1 − Tc/Th。',

    s6k: '第 6 步 · 收束',
    s6t: '一本对得上的能量账',
    s6fin: '理想气体的状态由 PV = nRT 联系；气体推活塞做的功是 P–V 图上的面积，<strong>随路径而变</strong>；内能只看温度，<strong>不随路径变</strong>；两者由第一定律 ΔU = Q − W 记成一本账。等温膨胀把吸的热全部变成功，绝热膨胀靠消耗内能做功而降温。把过程绕成循环，净功就是回路面积；在本页看到的循环里，效率都不超过 1 − Tc/Th，卡诺循环和带理想回热器的斯特林循环恰好达到它。',
    formula: 'PV = nRT\nW = ∫P dV　　ΔU = Q − W\nη = W/Qh ≤ 1 − Tc/Th',
    boundary: '适用范围：理想气体、准静态（可逆）过程、热容为常数；0.2 mol，单原子与双原子两种 γ。真实发动机有摩擦、有温差传热、过程也不是准静态的，效率比这里的数值更低。「任何热机 η ≤ 1 − Tc/Th」来自热力学第二定律，本页只展示了两种循环满足它，没有给出一般证明。',
    linksTitle: '继续探索',
    lk1: '气体动理论 · 第 1 步：温度在分子层面是什么 →',
    lk2: '卡诺循环 · 第 2 步：四步一圈，逐段拆开看 →',
    lk3: '卡诺循环 · 第 5 步：倒着转就成了冰箱和热泵 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《热力学 · 一口气追踪能量》的平行版本。'
  },
  en: {
    pageTitle: 'Thermodynamics · The Energy Books of One Cylinder',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Thermodynamics · Track Energy Through a Gas →',
    navLabel: 'Thermodynamics steps',
    tagline: 'Shut 0.2 mol of ideal gas in a cylinder with a piston. Heat it, push the piston, let it expand: where does every joule go? In seven steps you start from the equation of state, join "work is area", "ΔU = Q − W" and "isothermal versus adiabatic" into one set of books that balances, and finally see where the ceiling on engine efficiency comes from.',
    nav0: '0 State', nav1: '1 Work = area', nav2: '2 First law', nav3: '3 Isothermal vs adiabatic', nav4: '4 Carnot cycle', nav5: '5 Why a ceiling', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The state of a gas',
    s0t: 'Fix the volume and temperature: what sets the pressure?',
    s0e: 'The question here: a cylinder holds n = 0.2 mol of ideal gas. Given its volume V and temperature T, what is its pressure P? The <strong>state</strong> of the gas is its present condition described by a few measurable quantities (P, V, T). An <strong>ideal gas</strong> is one whose molecules take up no room and do not attract each other; it obeys the equation of state <strong>PV = nRT</strong>, with the gas constant R = 8.314 J/(mol·K). The pressure comes from molecules constantly hitting the walls (<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step0">→ Kinetic theory, step 0: pressure is wall hits</a>). Units on this page: P in kPa, V in litres, T in kelvin. Since 1 kPa × 1 L = 1 J, the product PV is already in joules. Left: the cylinder, where piston height shows the volume and the gas colour runs from blue (cold) to red (hot). Right: the <strong>P–V diagram</strong>, volume across and pressure up. The grey curves are <strong>isotherms</strong> (all states at one temperature) for 200–600 K in 100 K steps; the bright curve is the current temperature.',
    volSlider: 'Volume V', tempSlider: 'Temperature T', clearTrail: 'Clear trail',
    s0lgGas: 'Gas colour: blue = cold, red = hot', s0lgIso: 'Isotherms, 200–600 K', s0lgNow: 'Isotherm at the current T', s0lgTrail: 'States visited',
    c0a: 'Cylinder · volume scale (L)', c0b: 'Pressure P (kPa) ↑ vs volume V (L) →',
    c0aAria: 'Cylinder sketch: piston position shows volume, colour shows temperature', c0bAria: 'P–V diagram with isotherms and the current state',
    s0readout: 'P = nRT ÷ V = {n} × {R} × {T} ÷ {V} = {P} kPa. PV = {pv} J, which is exactly nRT: fix the temperature and the product of P and V is fixed.',
    s0hint: 'What to try: drag only the volume and the state slides along the bright isotherm; double the volume and the pressure halves. Then drag only the temperature: the state moves straight up or down onto another isotherm. White dots record where you have been. Every point on the P–V diagram corresponds to exactly one (P, V, T), whatever route you took to reach it.',

    s1k: 'Step 1 · Work is area',
    s1t: 'The gas pushes the piston along. How much work does it do?',
    s1e: 'The question here: the gas goes from state A (2 L, 250 kPa) to state B. How much <strong>work</strong> does it do on the piston? With piston area S and gas pressure P, the push is P·S; moving the piston by dx sweeps out dV = S·dx, so the work is P·S·dx = P·dV. Adding up the whole move gives <strong>W = ∫P dV</strong>, the area under the path on the P–V diagram, down to the V axis (<a class="xlink" href="../../../physics/thermal/carnot-cycle/#step0">→ Carnot cycle, step 0: work is area</a>). We assume the process is <strong>quasi-static</strong>: the piston moves slowly enough that the gas has a definite state at every moment, so the path can be drawn as a line. Here W means work done by the gas: positive when it expands (V grows), negative when it is compressed. There are endless routes from A to B; we compare three. ① <strong>Isobaric</strong> (constant P) expansion, then <strong>isochoric</strong> (constant V) pressure drop. ② Isochoric drop first, then isobaric expansion. ③ A straight line.',
    pathPV: '① Constant P, then constant V', pathVP: '② Constant V, then constant P', pathLine: '③ Straight line',
    pathPVShort: '① (constant P, then V)', pathVPShort: '② (constant V, then P)', pathLineShort: '③ (straight line)',
    vbSlider: 'Volume of end state B', pbSlider: 'Pressure of end state B', play1: 'Walk the path',
    s1lgPath: 'Chosen path (bright = walked so far)', s1lgArea: 'Area = work done by the gas (positive)', s1lgNeg: 'Negative area: the gas is compressed', s1lgOther: 'The other two paths',
    c1: 'Pressure P (kPa) ↑ vs volume V (L) → · shading = W',
    s1prog: '{pct}% of the way; work so far {w} J. ',
    s1readout: 'A ({va} L, {pa} kPa) → B ({vb} L, {pb} kPa). Chosen path {name}: W = ∫P dV = {w} J {dir}. Work on the three paths: ① {w1} J, ② {w2} J, ③ {w3} J.',
    dirOut: '(the gas expands and does work)', dirIn: '(the gas is compressed; work is done on it)', dirZero: '(no volume change, no work)',
    s1hint: 'What to try: keep B where it is and click the three path buttons in turn. The shaded areas differ visibly, and so do the three works in the readout. Press "Walk the path" and watch the shading grow behind the moving state; vertical (constant-volume) pieces add no area. Then drag B\'s volume below 2 L: now it is a compression, the shading turns red and the work is negative.',

    s2k: 'Step 2 · The first law',
    s2t: 'Heat and work both depend on the route from A to B. What does not?',
    s2e: 'The question here: the three paths in step 1 do different work. What about the heat they absorb? Is there a quantity that depends only on the start and end? The <strong>internal energy</strong> U of a gas is the total energy of its molecules\' thermal motion; for an ideal gas it depends only on temperature: U = n·Cv·T. Cv is the <strong>molar heat capacity at constant volume</strong>, the heat that raises 1 mol by 1 K when the volume is held fixed: Cv = 3R/2 ≈ 12.47 J/(mol·K) for a monatomic gas such as helium or argon, and 5R/2 ≈ 20.79 J/(mol·K) for a diatomic gas such as nitrogen or oxygen near room temperature. The <strong>first law of thermodynamics</strong> is energy conservation: of the heat Q given to the gas, part leaves as work W and the rest raises the internal energy, <strong>ΔU = Q − W</strong>, or Q = ΔU + W. This step reuses A, B and the three paths from step 1. Each group of bars is one path; the bars are Q, W and ΔU (downwards means negative), and the green dashed line marks the height of ΔU.',
    gasLabel: 'Gas:', gasMono: 'Monatomic gas', gasDi: 'Diatomic gas', gasMonoShort: 'Monatomic gas', gasDiShort: 'Diatomic gas',
    s2lgQ: 'Heat in, Q', s2lgW: 'Work by the gas, W', s2lgU: 'Change in internal energy ΔU (dashed = its level)', s2lgPaths: '① constant P then V · ② constant V then P · ③ straight line',
    c2: 'Energy (J) · {gas} · one group per path',
    s2readout: '{gas}, Cv = {cv} J/(mol·K). T_A = {ta} K, T_B = {tb} K, so ΔU = n·Cv·(T_B − T_A) = {du} J on every path. Q = ΔU + W: ① W = {w1} J, Q = {q1} J; ② W = {w2} J, Q = {q2} J; ③ W = {w3} J, Q = {q3} J.',
    s2hint: 'What to try: first look at the green bars. They are equally tall and sit right on the dashed line: ΔU is fixed by the temperatures at A and B alone, which makes it a state function. Then compare orange and cyan: the path that does more work also takes in more heat, and the difference is always ΔU. Drag B in step 1 and all three groups move together; switching gas changes ΔU and Q but not W, because work depends only on the P–V path. The gas choice applies to the whole page.',
    q2Prompt: 'Think: a gas goes from A to B along two different paths. Which quantity must be the same?',
    q2A: 'The heat absorbed, Q', q2B: 'The work done by the gas, W', q2C: 'The change in internal energy, ΔU',
    q2Right: 'Right. ΔU depends only on the temperatures at the two end states, so it is a state function; Q and W depend on the path.',
    q2Wrong: 'Look at the bars: the orange (Q) and cyan (W) bars differ between groups; only the green ΔU bars match.',
    check: 'Check answer', pick: 'Pick an option first.',

    s3k: 'Step 3 · Isothermal vs adiabatic',
    s3t: 'Expand to V₂ while holding the temperature, or while blocking heat: how different is the outcome?',
    s3e: 'The question here: the same gas (1.5 L, 400 K) expands to volume V₂ in one of two extreme ways. What happens to its pressure, temperature and work? In an <strong>isothermal process</strong> the cylinder sits against a large 400 K reservoir and expands slowly, so T is constant, ΔU = 0, and every joule of heat taken in leaves as work: Q = W = nRT·ln(V₂/V₁). In an <strong>adiabatic process</strong> the cylinder is wrapped in insulation, so Q = 0 and the work must come out of internal energy: W = −ΔU, and the gas cools. Combining the first law with PV = nRT shows that an adiabatic path obeys PV^γ = constant and TV^(γ−1) = constant, where <strong>γ</strong> = Cp/Cv is the ratio of heat capacities at constant pressure and constant volume (5/3 for a monatomic gas, 7/5 for a diatomic one). Left: the P–V diagram, with the two shaded areas showing each process\'s work (the colours mix where they overlap). Right: temperature against volume.',
    v2Slider: 'Final volume V₂',
    s3lgIso: 'Isothermal (constant T)', s3lgAdia: 'Adiabatic (Q = 0)', s3lgStart: 'Shared start (1.5 L, 400 K)',
    c3a: 'Pressure P (kPa) ↑ vs volume V (L) →', c3b: 'Temperature T (K) ↑ vs volume V (L) →',
    c3aAria: 'P–V diagram with an isotherm and an adiabat', c3bAria: 'Temperature against volume',
    s3readout: '{gas} (γ = {g}), from {v1} L at {t1} K to {v2} L. Isothermal: T stays {t1} K, P → {pi} kPa, W = Q = {wi} J, ΔU = 0. Adiabatic: Q = 0, T → {ta} K, P → {pa} kPa, ΔU = {du} J, W = −ΔU = {wa} J. {note}',
    s3compress: '(V₂ is below the starting volume, so this is a compression and W is negative; in an adiabatic compression all the work done on the gas becomes internal energy and it heats up.)',
    s3same: '(The volume has not changed yet; neither process has started.)',
    s3hint: 'What to try: drag V₂ up from 1.5 L. The orange adiabat falls faster than the cyan isotherm, so the area under it (the work) is smaller; on the right the orange line keeps cooling while the cyan one stays flat. Drag V₂ below 1.5 L to compress instead: adiabatic compression heats the gas. Then switch between monatomic and diatomic: the larger γ, the steeper the adiabat and the more the gas cools.',
    q3Prompt: 'Think: a gas expands adiabatically (no heat in or out). Its temperature…',
    q3A: 'stays the same: no heat flows, so the temperature cannot change', q3B: 'falls: the work it does has to come out of its internal energy', q3C: 'rises: more room makes the molecules livelier',
    q3Right: 'Right. With Q = 0, ΔU = −W; expanding means W > 0, so internal energy drops and an ideal gas cools.',
    q3Wrong: 'Look at the orange line on the right: the temperature keeps falling during adiabatic expansion. "No heat flow" does not mean "no change in internal energy"; doing work changes it too.',

    s4k: 'Step 4 · The Carnot cycle',
    s4t: 'Take the gas round a loop back to where it started. How much of the heat taken in can become work?',
    s4e: 'The question here: an engine works in cycles, so the gas has to return to its starting state. Between a hot reservoir at Th and a cold one at Tc, the loop of four reversible legs called the <strong>Carnot cycle</strong> runs: ① isothermal expansion at Th, taking heat Qh from the hot reservoir; ② adiabatic expansion, cooling to Tc; ③ isothermal compression at Tc, giving heat Qc to the cold reservoir; ④ adiabatic compression, warming back to Th. After one lap the gas is back where it began, so ΔU = 0 and the net work is W = Qh − Qc, the area enclosed by the loop. The <strong>efficiency</strong> η = W ÷ Qh is the share of the heat taken in that becomes work (<a class="xlink" href="../../../physics/thermal/carnot-cycle/#step4">→ Carnot cycle, step 4: the ceiling</a>). r is the expansion ratio of leg ① (end volume ÷ start volume, starting from 1 L). Left: the cycle on a P–V diagram whose axes rescale with the settings. Right: the running totals of heat in, heat out and net work over one lap; dashed outlines show the values after a full lap.',
    thSlider: 'Hot reservoir Th', tcSlider: 'Cold reservoir Tc', rSlider: 'Isothermal expansion ratio r', play4: 'Run one lap',
    s4lgHot: '① isothermal expansion at Th (heat in)', s4lgCold: '③ isothermal compression at Tc (heat out)', s4lgAdia: '②④ adiabatic legs', s4lgArea: 'Enclosed area = net work W',
    c4a: 'P (kPa) ↑ vs V (L) →', c4b: 'Energy books for one lap (J) · {pct}% done',
    c4aAria: 'Carnot cycle on a P–V diagram', c4bAria: 'Running bars for heat in, heat out and net work',
    leg0: '① isothermal expansion', leg1: '② adiabatic expansion', leg2: '③ isothermal compression', leg3: '④ adiabatic compression',
    s4prog: '{pct}% of the lap (now on {leg}): heat in so far {qin} J, heat out {qout} J, net work {w} J. ',
    s4readout: '{gas}, Th = {th} K, Tc = {tc} K, r = {r}. Qh = nR·Th·ln r = {qh} J, Qc = nR·Tc·ln r = {qc} J, W = Qh − Qc = {w} J. η = W ÷ Qh = {eta}, exactly 1 − Tc/Th = {etac}. (For this Th and Tc you have tried {k} r/gas combinations, all with the same efficiency.)',
    s4hint: 'What to try: press "Run one lap". On the right, the pink bar (heat in) grows only on leg ①, the cyan bar (heat out) only on leg ③, and the green bar (net work) lengthens while the gas expands and shrinks while it is compressed, ending at Qh − Qc. Then keep Th and Tc fixed and drag the expansion ratio r or switch the gas: the loop\'s shape and area, Qh and W all change, yet η in the readout stays equal to 1 − Tc/Th. Only Th or Tc moves the efficiency.',

    s5k: 'Step 5 · Where the ceiling comes from',
    s5t: 'Swap in a different cycle. Can its efficiency match Carnot?',
    s5e: 'The question here: what happens to the efficiency of a different cycle running between the same Th and Tc? The <strong>Stirling cycle</strong> replaces Carnot\'s two adiabatic legs with two <strong>constant-volume</strong> legs: ① isothermal expansion at Th → ② cooling at constant volume to Tc → ③ isothermal compression at Tc → ④ warming at constant volume back to Th. Its net work is W = nR(Th − Tc)·ln r. The trouble is leg ④: it needs heat n·Cv·(Th − Tc) from outside, taken in at temperatures below Th. If the heat released on leg ② is stored in a <strong>regenerator</strong> (a heat-storing metal mesh) and handed back on leg ④, that heat no longer has to come from the hot reservoir. This step reuses Th, Tc, r and the gas from step 4. Left: the Stirling cycle in orange over the Carnot cycle for the same settings in grey dashes. Right: efficiency against the expansion ratio r, with the Carnot ceiling 1 − Tc/Th in white.',
    regenOff: 'No regenerator', regenOn: 'Ideal regenerator',
    s5lgSt: 'Stirling cycle', s5lgCarnot: 'Carnot cycle, same settings', s5lgEtaC: 'Carnot ceiling 1 − Tc/Th', s5lgNow: 'Efficiency at the current r',
    c5a: 'P (kPa) ↑ vs V (L) →', c5b: 'Efficiency η ↑ vs expansion ratio r →',
    c5aAria: 'Stirling and Carnot cycles on a P–V diagram', c5bAria: 'Efficiency against expansion ratio',
    s5regenOff: ' plus {qv} J for the constant-volume warming', s5regenOn: ' (the {qv} J for constant-volume warming comes back from the regenerator, not from the reservoir)',
    s5readout: '{gas}, Th = {th} K, Tc = {tc} K, r = {r}. W = nR(Th − Tc)·ln r = {w} J. Heat from the hot reservoir: {qiso} J for the isothermal expansion{plus}, {qin} J in total. η = W ÷ heat in = {eta}; the Carnot ceiling is {etac}, a gap of {gap}.',
    s5hint: 'What to try: first compare the two loops. Their shapes differ but their areas are equal; both deliver net work nR(Th − Tc)·ln r, so the whole difference lies in how much heat is drawn in. Then look at "No regenerator". The orange dot sits below the white line; go back to step 4 and raise r, and the dot climbs along the orange curve without ever reaching the white line. Now pick "Ideal regenerator": the constant-volume heat circulates inside the engine, the only heat drawn from the reservoir is the isothermal share, and the orange curve lands on the white line. The lesson: efficiency reaches 1 − Tc/Th only when all heat enters at Th and leaves at Tc.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Energy books that balance',
    s6fin: 'PV = nRT ties together the state of an ideal gas. The work it does on a piston is an area on the P–V diagram and <strong>depends on the path</strong>; internal energy depends only on temperature and <strong>not on the path</strong>; the first law, ΔU = Q − W, keeps both in one set of books. Isothermal expansion turns all the heat taken in into work; adiabatic expansion does work by spending internal energy, so the gas cools. Close the process into a loop and the net work is the enclosed area. In every cycle on this page the efficiency stays at or below 1 − Tc/Th, reached exactly by the Carnot cycle and by a Stirling cycle with an ideal regenerator.',
    formula: 'PV = nRT\nW = ∫P dV　　ΔU = Q − W\nη = W/Qh ≤ 1 − Tc/Th',
    boundary: 'Scope: ideal gas, quasi-static (reversible) processes, constant heat capacities; 0.2 mol with monatomic or diatomic γ. Real engines have friction, heat flowing across finite temperature gaps and processes that are not quasi-static, so their efficiencies are lower than the numbers here. The general statement "no engine beats 1 − Tc/Th" comes from the second law of thermodynamics; this page only shows two cycles obeying it and does not prove it in general.',
    linksTitle: 'Keep exploring',
    lk1: 'Kinetic theory · step 1: what temperature means for molecules →',
    lk2: 'Carnot cycle · step 2: the four legs, one at a time →',
    lk3: 'Carnot cycle · step 5: run it backwards and you get a fridge or heat pump →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "Thermodynamics · Track Energy Through a Gas".'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang][key] || STRINGS.en[key] || key;
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
  if (typeof window.refreshThermo === 'function') window.refreshThermo();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.THERMO_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
