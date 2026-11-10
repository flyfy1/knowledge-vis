'use strict';
// Carnot cycle lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '卡诺循环 · 一台理想热机能把多少热变成功',
    back: '← 知识索引',
    compare: '对照另一版本：卡诺循环 · 热机的效率上限 →',
    navLabel: '卡诺循环步骤导航',
    tagline: '热机从高温处吸热、对外做功，再把剩下的热排到低温处。卡诺循环是最理想的一种：气体只走四段可逆过程。七步里你会算出每一段的功和热，发现效率只由两个温度决定，再用熵证明任何热机都超不过它。',
    nav0: '0 功是面积', nav1: '1 绕一圈', nav2: '2 吸热与放热', nav3: '3 效率', nav4: '4 上限', nav5: '5 倒着转', nav6: '6 收束',

    s0k: '第 0 步 · 功就是面积',
    s0t: '气体等温膨胀时，对外做了多少功？',
    s0e: '这一步要回答：一份气体在温度不变的情况下从体积 V₁ 胀到 V₂，它推着活塞做了多少功？本页的工作物质始终是 <strong>1 mol 单原子理想气体</strong>，满足 pV = nRT：p 是压强，V 是体积，T 是热力学温度（单位 K），n = 1 mol，R = 8.314 J/(mol·K)（<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step2">→ 气体动理论第 2 步：压缩气体，压强为什么升高</a>）。温度保持不变的过程叫<strong>等温过程</strong>，此时 p = nRT/V，图上是一条双曲线（横轴体积 V，单位升 L；纵轴压强 p，单位千帕 kPa）。活塞移动一小段、体积增加 ΔV 时，气体做功 p·ΔV；把整段切成细条再相加，就是曲线下方的<strong>面积</strong> W = ∫p dV。等温时这块面积恰好等于 nRT·ln(V₂/V₁)。因为 1 kPa·L = 1 J，图上的面积可以直接读成焦耳。V₁ 在全页都取 10 L。',
    tempT: '温度 T（K）', ratio: '体积比 V₂/V₁', strips: '细条数 N',
    s0lgCurve: '等温线 p = nRT/V', s0lgArea: '曲线下面积 = 功 W', s0lgStrip: 'N 根细条（每条 p·ΔV，取条中点的 p）',
    c0a: 'p–V 图：压强 p（kPa）对体积 V（L）',
    s0readout: 'T = {T} K，V 从 10 L 胀到 {V2} L：精确面积 W = nRT·ln(V₂/V₁) = {W} J；{N} 根细条之和 = {S} J，相对误差 {err}%。',
    s0hint: '观察顺序：先把「细条数」从 1 拖到 40，看阶梯越来越贴住阴影，读数里的相对误差趋近 0；再固定细条数、只拖温度，曲线整体抬高，面积与 T 成正比；最后只拖体积比，面积按 ln(V₂/V₁) 增长：从 10 L 胀到 20 L 和从 20 L 胀到 40 L，做的功一样多。',

    s1k: '第 1 步 · 为什么要绕一圈',
    s1t: '气体胀完还得压回去，回程的功怎样才能少付一些？',
    s1e: '这一步要回答：热机要一遍遍重复，气体就必须回到起点。如果沿原来的高温等温线压回去，外界要付出的功正好等于刚才膨胀得到的功，净功为 0。卡诺的办法是：在高温 T_h 等温膨胀之后，先让气体<strong>绝热膨胀</strong>（与外界不交换热，气体只靠自身内能做功，温度一路降到 T_c），再在低温 T_c 等温压缩，最后绝热压缩，温度升回 T_h（<a class="xlink" href="../../../physics/thermal/thermodynamics/#step2">→ 热力学第 2 步：等温线和绝热线为什么分岔</a>）。低温时同样体积下压强小，压回去所需的功就少。上图两条虚线是两条等温线，橙线是到目前为止走过的路径；下图是到此为止气体做的<strong>累计净功</strong>（气体对外做功记正，外界压缩气体记负），横轴是循环进度。本步体积比固定为 V₂/V₁ = 2。',
    tempTh: '高温 T_h（K）', tempTc: '低温 T_c（K）', progress: '循环进度',
    s1lgA: '已走过的路径', s1lgH: '高温等温线 T_h', s1lgC: '低温等温线 T_c', s1lgW: '围出的面积 = 一圈净功（下图绿色虚线标出它的值）',
    c1a: 'p–V 图：压强 p（kPa）对体积 V（L）', c1b: '累计净功（J）对循环进度',
    s1readout: '进度 {pct}%（{leg}）：到此气体累计做功 {Wc} J。走完一圈，净功 = {W} J，与图上围出的面积 {A} J 一致。若沿 T_h 等温线原路压回，净功为 {W0} J。',
    s1hint: '观察顺序：把「循环进度」从 0 拖到 100%，看下图曲线在两段膨胀里上升、在两段压缩里下降，终点停在一个正值，它就是上图围出的面积；然后把进度留在 100%，只把 T_c 往 T_h 方向拖，看两条等温线靠拢、围出的面积变窄，终点的净功跟着变小。',

    s2k: '第 2 步 · 热从哪里进、从哪里出',
    s2t: '四段过程里，哪一段吸热、哪一段放热？',
    s2e: '这一步要回答：一圈下来，气体在哪一段从高温热源吸进热 Q_h、在哪一段向低温热源放出热 Q_c，它们和净功 W 是什么关系？<strong>热源</strong>是温度保持不变的大物体，比如锅炉和冷却水。<strong>热力学第一定律</strong>说 Q = ΔU + W：气体吸进的热 Q 等于内能变化 ΔU 加上对外做的功 W（<a class="xlink" href="../../../physics/thermal/thermodynamics/#step1">→ 热力学第 1 步：每一份能量都要对得上</a>）。理想气体的内能只取决于温度（单原子气体 U = 3/2·nRT），所以等温段 ΔU = 0，吸的热全部变成功；绝热段 Q = 0，做的功全部来自内能。标题为「T–S 图」的那张图是 <strong>T–S 图</strong>：纵轴温度 T（K），横轴是<strong>熵</strong>相对状态 1 的增量 ΔS（J/K）。可逆过程中熵的变化 ΔS = ∫dQ/T，吸热时 S 增加、放热时减少、绝热时不变，所以卡诺循环在 T–S 图上是一个矩形，矩形面积 = 净吸热 = 净功。',
    s2lgHot: '高温等温段', s2lgAdi: '绝热段', s2lgCold: '低温等温段', s2lgNet: '围出的面积 = 净功', s2lgDot: '气体当前状态',
    c2a: 'p–V 图：p（kPa）对 V（L）', c2b: 'T–S 图：T（K）对 ΔS（J/K）',
    play: '▶ 播放一圈', pause: '⏸ 暂停', nextLeg: '走下一段 →', reset: '回到状态 1',
    thLeg: '过程', thQ: '吸热 Q（J）', thW: '对外做功 W（J）', thU: '内能变化 ΔU（J）', rowSum: '整圈合计',
    leg0: '1→2 高温等温膨胀', leg1: '2→3 绝热膨胀', leg2: '3→4 低温等温压缩', leg3: '4→1 绝热压缩', legDone: '已回到状态 1',
    s2readout: '{prog}{leg}：当前 T = {T} K，V = {V} L，p = {p} kPa。整圈：吸热 Q_h = {Qh} J，放热 Q_c = {Qc} J，净功 W = Q_h − Q_c = {W} J，T–S 矩形面积 = {A} J。',
    s2progress: '已走完 {c}/4 段 · ',
    s2hint: '观察顺序：按「播放一圈」，看两张图上的白点同步移动，走过的路在图上留下轨迹；白点走在 T–S 矩形的横边上时，表中那一行的 Q 才不为 0。也可以按「走下一段」一段一段看。然后只调 V₂/V₁：T–S 矩形变宽，Q_h、Q_c、W 按同一比例变大。',

    s3k: '第 3 步 · 效率只看两个温度',
    s3t: '把卡诺热机做大一些，效率会不会变高？',
    s3e: '这一步要回答：<strong>效率</strong> η = W/Q_h（吸进的热里有几成变成了功，介于 0 和 1 之间，越大越好）由什么决定？上一步的 T–S 矩形已经给出答案：高温边吸热 Q_h = T_h·ΔS，低温边放热 Q_c = T_c·ΔS，两边的熵变 ΔS 相同，相除时约掉，于是 η = 1 − Q_c/Q_h = 1 − T_c/T_h。体积比 V₂/V₁ 只决定矩形的宽度 ΔS（机器一圈处理多少热），不影响效率。上图把一圈吸进的 Q_h 拆成净功 W 和放掉的 Q_c；下图横轴是温度比 T_c/T_h，纵轴是效率 η，你每试一组参数就留下一个点，点的位置用 W/Q_h 算出。',
    s3lgQh: '吸热 Q_h', s3lgW: '净功 W', s3lgQc: '放热 Q_c', s3lgLine: 'η = 1 − T_c/T_h', s3lgDot: '试过的循环（η = W/Q_h）',
    c3a: '一圈的能量账（J）', c3b: '效率 η 对温度比 T_c/T_h',
    clearRec: '清空记录的点',
    s3readout: 'Q_h = {Qh} J，W = {W} J，Q_c = {Qc} J → η = W/Q_h = {eta}%；而 1 − T_c/T_h = 1 − {Tc}/{Th} = {etaC}%。下图已记录 {n} 个循环。',
    s3hint: '观察顺序：先只拖 V₂/V₁，上图的两根条按同一比例伸缩，下图新点和旧点落在同一处；再拖 T_h 或 T_c，点沿粉色直线移动。无论怎么调，所有点都落在 η = 1 − T_c/T_h 这条线上。「清空记录的点」只擦掉下图的点，不改参数。',

    s4k: '第 4 步 · 任何热机都超不过它',
    s4t: '有人声称造出了效率更高的热机，能不能当场判断真假？',
    s4e: '这一步要回答：工作在同样两个热源之间的任何热机（不限于卡诺循环、不限于理想气体），效率能不能超过 1 − T_c/T_h？用熵来记账。热机自己转完一圈回到原状态，它的熵不变；高温热源放出 Q_h，熵减少 Q_h/T_h；低温热源收到 Q_c，熵增加 Q_c/T_c。<strong>热力学第二定律</strong>：孤立系统（这里是热机加两个热源）的总熵不会减少。下面设定一个「声称的效率」，每圈吸热 Q_h = 1000 J，能量守恒给出 W = η·Q_h、Q_c = Q_h − W，再看总熵变 ΔS_总 的正负：大于 0，机器可以存在但有浪费（不可逆）；等于 0，正是可逆的卡诺热机；小于 0，违反第二定律，造不出来。',
    claimEta: '声称的效率 η（%）', setCarnot: '设为卡诺效率',
    s4lgQh: '高温侧：吸热 Q_h / 热源熵变', s4lgW: '对外做功 W', s4lgQc: '低温侧：放热 Q_c / 热源熵变', s4lgTot: '总熵变 ΔS_总', s4lgMax: '卡诺上限下的最大功',
    c4a: '每圈能量流（J）', c4b: '每圈熵变（J/K）',
    s4readout: '声称 η = {eta}%（卡诺上限 {etaC}%）。每圈：W = {W} J，Q_c = {Qc} J；高温热源 ΔS = {dSh} J/K，低温热源 ΔS = {dSc} J/K，总计 ΔS_总 = {tot} J/K → {verdict}',
    vPossible: '可以存在，但不可逆（有浪费）。', vLimit: '恰为可逆极限，就是卡诺热机。', vImpossible: '不可能：总熵减少，违反第二定律。',
    s4hint: '观察顺序：先保持两个温度不动，把「声称的效率」从 0 往上拖，看下图白色的总熵柱越来越矮，越过卡诺上限的那一刻翻到零线下方，读数变成「不可能」；按「设为卡诺效率」，总熵恰好为 0。再只改 T_c，看翻转点跟着移动。',

    s5k: '第 5 步 · 倒着转',
    s5t: '把卡诺循环倒着转，花 1 J 的功能搬走多少热？',
    s5e: '这一步要回答：卡诺循环的每一段都是<strong>可逆</strong>的（无限缓慢、没有摩擦和温差传热，随时可以原路退回）。倒着转时，外界对气体做功 W，气体在低温处吸热 Q_c，在高温处放热 Q_h = Q_c + W，这就是理想的冰箱和热泵。衡量它们用<strong>性能系数 COP</strong>（得到的热 ÷ 付出的功，越大越省电）：冰箱要的是从冷端搬走的热，COP = Q_c/W = T_c/(T_h − T_c)；热泵要的是送进屋的热，COP = Q_h/W = T_h/(T_h − T_c)。COP 可以远大于 1，因为热是被搬过去的，不是用功变出来的。这里温度用摄氏度设定，计算时换成开尔文（加 273.15）。上图是每输入 1000 J 功搬运的热，白框标出当前用途真正想要的那一份；下图横轴是冷端温度，纵轴是 COP（对数刻度，每格乘 10 倍或 2 倍），热端温度固定为当前值。',
    coldSide: '冷端温度 T_c（℃）', hotSide: '热端温度 T_h（℃）', fridge: '当冰箱用', pump: '当热泵用',
    modeFridge: '冰箱', modePump: '热泵',
    s5lgW: '输入的功 W', s5lgQc: '从冷端搬走 Q_c', s5lgQh: '放到热端 Q_h', s5lgCur: '当前模式的 COP 曲线', s5lgOther: '另一种模式的 COP 曲线',
    c5a: '每输入 1000 J 功（J）', c5b: 'COP 对冷端温度（℃），热端 {th}℃',
    s5readout: '{mode}：冷端 {tc}℃ = {TcK} K，热端 {th}℃ = {ThK} K，温差 {dT} K。每输入 W = 1000 J，从冷端搬走 Q_c = {Qc} J，向热端放出 Q_h = {Qh} J，COP = {cop}。',
    s5hint: '观察顺序：先选「当冰箱用」，只把冷端温度往下拖，看上图搬走的 Q_c 变短、下图白点沿曲线下滑：温差越大越费电；再切到「当热泵用」，同样的温度下 COP 正好比冰箱多 1，因为 Q_h = Q_c + W。',

    s6k: '第 6 步 · 收束',
    s6t: '一个矩形，三条结论',
    s6fin: '<strong>回顾。</strong>功是 p–V 图上的面积；热机必须绕一圈，靠在低温下压缩少付功，一圈净功 = 围出的面积。在 T–S 图上卡诺循环是一个矩形，高温边吸热、低温边放热，所以效率只由两个温度决定。熵的账本又说明：工作在两个热源之间的热机，效率超过卡诺上限就意味着总熵减少，第二定律不允许。倒过来转，同一个矩形就是冰箱和热泵。',
    formula: 'W = ∮p dV = (T_h − T_c)·ΔS\nη = 1 − T_c/T_h\nCOP_冰箱 = T_c/(T_h − T_c)，COP_热泵 = T_h/(T_h − T_c)',
    boundary: '适用范围：效率上限对工作在两个恒温热源之间的任何循环热机都成立；具体的面积和热量数值用的是 1 mol 单原子理想气体、全程可逆（无限缓慢）的模型。真实热机有摩擦、有限温差传热、有限时间运转，效率都低于这个上限；本页没有模拟这些损耗。',
    linksTitle: '接着去哪儿',
    lk1: '→ 热力学第 2 步：同一起点出发，等温线和绝热线为什么分岔',
    lk2: '→ 热力学第 3 步：从能量守恒走到热机效率上限',
    lk3: '→ 气体动理论第 1 步：温度是分子平均动能的读数',
    lk4: '→ 信息熵第 6 步：信息熵与热力学熵是同一把秤',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《卡诺循环 · 热机的效率上限》的平行版本。'
  },
  en: {
    pageTitle: 'The Carnot Cycle · How Much Heat Can an Ideal Engine Turn into Work?',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Carnot Cycle · The Ceiling on Heat-Engine Efficiency →',
    navLabel: 'Carnot cycle steps',
    tagline: 'A heat engine takes heat from something hot, does work, and dumps what is left into something cold. The Carnot cycle is the ideal case: the gas runs through four reversible processes and nothing else. In seven steps you will work out the work and heat of each leg, find that the efficiency depends on the two temperatures alone, and then use entropy to show that no engine can beat it.',
    nav0: '0 Work is area', nav1: '1 Going round', nav2: '2 Heat in, heat out', nav3: '3 Efficiency', nav4: '4 The ceiling', nav5: '5 Run it backwards', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Work is an area',
    s0t: 'How much work does a gas do when it expands at constant temperature?',
    s0e: 'The question for this step: a gas held at a fixed temperature expands from volume V₁ to V₂. How much work does it do pushing the piston? Throughout the page the working substance is <strong>1 mol of monatomic ideal gas</strong>, obeying pV = nRT, where p is pressure, V volume, T absolute temperature in kelvin, n = 1 mol and R = 8.314 J/(mol·K) (<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step2">→ Kinetic theory, step 2: why squeezing a gas raises its pressure</a>). A process at constant temperature is called <strong>isothermal</strong>; then p = nRT/V, a hyperbola on the chart (horizontal axis: volume V in litres; vertical axis: pressure p in kilopascals). When the piston moves out by a small ΔV the gas does work p·ΔV; slice the expansion into thin strips and add them up, and you get the <strong>area</strong> under the curve, W = ∫p dV. For an isotherm that area is exactly nRT·ln(V₂/V₁). Since 1 kPa·L = 1 J, areas on the chart read directly in joules. V₁ is 10 L everywhere on the page.',
    tempT: 'Temperature T (K)', ratio: 'Volume ratio V₂/V₁', strips: 'Number of strips N',
    s0lgCurve: 'Isotherm p = nRT/V', s0lgArea: 'Area under the curve = work W', s0lgStrip: 'N strips (each p·ΔV, p taken at the strip’s midpoint)',
    c0a: 'p–V chart: pressure p (kPa) vs volume V (L)',
    s0readout: 'T = {T} K, V grows from 10 L to {V2} L: exact area W = nRT·ln(V₂/V₁) = {W} J; the {N} strips add up to {S} J, a relative error of {err}%.',
    s0hint: 'What to watch: first drag “Number of strips” from 1 to 40 and see the staircase hug the shaded area while the relative error in the readout falls towards 0. Then hold N and move only the temperature: the whole curve rises and the area grows in proportion to T. Finally move only the volume ratio: the area grows like ln(V₂/V₁), so going from 10 L to 20 L yields as much work as going from 20 L to 40 L.',

    s1k: 'Step 1 · Why go round a loop',
    s1t: 'After expanding, the gas has to be pushed back. How can the return trip cost less?',
    s1e: 'The question for this step: an engine has to repeat, so the gas must return to where it started. Push it back along the same hot isotherm and the work you spend is exactly the work you gained, so the net work is 0. Carnot’s trick: after expanding isothermally at T_h, let the gas expand <strong>adiabatically</strong> (no heat exchanged, so the gas does work out of its own internal energy and cools all the way to T_c), then compress it isothermally at T_c, and finally compress it adiabatically until it is back at T_h (<a class="xlink" href="../../../physics/thermal/thermodynamics/#step2">→ Thermodynamics, step 2: why isotherms and adiabats split apart</a>). At the low temperature the pressure is lower at any given volume, so compressing costs less. In the top chart the two dashed curves are the isotherms and the orange line is the path travelled so far; the bottom chart shows the <strong>running net work</strong> done by the gas (work done by the gas counts positive, work done on it while it is compressed counts negative) against progress round the cycle. The volume ratio is fixed at V₂/V₁ = 2 in this step.',
    tempTh: 'Hot temperature T_h (K)', tempTc: 'Cold temperature T_c (K)', progress: 'Progress round the cycle',
    s1lgA: 'Path travelled so far', s1lgH: 'Hot isotherm T_h', s1lgC: 'Cold isotherm T_c', s1lgW: 'Enclosed area = net work per cycle (green dashed line in the bottom chart)',
    c1a: 'p–V chart: pressure p (kPa) vs volume V (L)', c1b: 'Running net work (J) vs progress',
    s1readout: 'Progress {pct}% ({leg}): running work done by the gas = {Wc} J. Over a full cycle the net work is {W} J, matching the enclosed area of {A} J. Returning along the T_h isotherm instead would give a net work of {W0} J.',
    s1hint: 'What to watch: drag “Progress” from 0 to 100% and watch the bottom curve climb during the two expansions and fall during the two compressions, ending at a positive value — the area enclosed in the top chart. Then leave progress at 100% and move only T_c up towards T_h: the isotherms close in, the enclosed area narrows, and the final net work shrinks with it.',

    s2k: 'Step 2 · Where heat goes in and comes out',
    s2t: 'Which of the four legs take in heat, and which give it out?',
    s2e: 'The question for this step: over one cycle, on which leg does the gas take heat Q_h from the hot reservoir, on which does it give heat Q_c to the cold one, and how do they relate to the net work W? A <strong>reservoir</strong> is a body so large its temperature never changes — a boiler, a stream of cooling water. The <strong>first law of thermodynamics</strong> says Q = ΔU + W: heat taken in equals the change in internal energy plus the work done (<a class="xlink" href="../../../physics/thermal/thermodynamics/#step1">→ Thermodynamics, step 1: every joule must balance</a>). An ideal gas’s internal energy depends only on temperature (U = 3/2·nRT for a monatomic gas), so on an isotherm ΔU = 0 and every joule of heat becomes work, while on an adiabat Q = 0 and all the work comes out of internal energy. The chart titled “T–S diagram” is exactly that, a <strong>T–S diagram</strong>: temperature T (K) up the side, and along the bottom the change in <strong>entropy</strong> ΔS from state 1 (J/K). In a reversible process ΔS = ∫dQ/T, so entropy rises when heat comes in, falls when it goes out and stays put on an adiabat. That makes the Carnot cycle a rectangle on the T–S diagram, and its area equals the net heat taken in, which equals the net work.',
    s2lgHot: 'Hot isothermal leg', s2lgAdi: 'Adiabatic legs', s2lgCold: 'Cold isothermal leg', s2lgNet: 'Enclosed area = net work', s2lgDot: 'Current state of the gas',
    c2a: 'p–V chart: p (kPa) vs V (L)', c2b: 'T–S diagram: T (K) vs ΔS (J/K)',
    play: '▶ Play one cycle', pause: '⏸ Pause', nextLeg: 'Next leg →', reset: 'Back to state 1',
    thLeg: 'Process', thQ: 'Heat in Q (J)', thW: 'Work done W (J)', thU: 'Change in U, ΔU (J)', rowSum: 'Whole cycle',
    leg0: '1→2 hot isothermal expansion', leg1: '2→3 adiabatic expansion', leg2: '3→4 cold isothermal compression', leg3: '4→1 adiabatic compression', legDone: 'back at state 1',
    s2readout: '{prog}{leg}: now T = {T} K, V = {V} L, p = {p} kPa. Whole cycle: heat in Q_h = {Qh} J, heat out Q_c = {Qc} J, net work W = Q_h − Q_c = {W} J, area of the T–S rectangle = {A} J.',
    s2progress: '{c}/4 legs done · ',
    s2hint: 'What to watch: press “Play one cycle” and the white dots move together on both charts, leaving a trail behind them. Only while the dot runs along a horizontal edge of the T–S rectangle does that row of the table show a non-zero Q. “Next leg” walks through one leg at a time. Then change only V₂/V₁: the T–S rectangle widens, and Q_h, Q_c and W all grow in the same proportion.',

    s3k: 'Step 3 · Efficiency depends on two temperatures',
    s3t: 'Build a bigger Carnot engine: does it get more efficient?',
    s3e: 'The question for this step: what sets the <strong>efficiency</strong> η = W/Q_h, the fraction of the heat taken in that comes out as work (between 0 and 1; higher is better)? The T–S rectangle from the last step already answers it. The hot edge takes in Q_h = T_h·ΔS and the cold edge gives out Q_c = T_c·ΔS; both edges share the same entropy change ΔS, which cancels in the ratio, leaving η = 1 − Q_c/Q_h = 1 − T_c/T_h. The volume ratio V₂/V₁ only sets the rectangle’s width ΔS — how much heat the engine handles per cycle — and has no effect on efficiency. The top chart splits the heat Q_h into net work W and rejected heat Q_c; the bottom chart plots efficiency η against the temperature ratio T_c/T_h, leaving a dot, computed as W/Q_h, for every setting you try.',
    s3lgQh: 'Heat in Q_h', s3lgW: 'Net work W', s3lgQc: 'Heat out Q_c', s3lgLine: 'η = 1 − T_c/T_h', s3lgDot: 'Cycles you tried (η = W/Q_h)',
    c3a: 'Energy budget of one cycle (J)', c3b: 'Efficiency η vs temperature ratio T_c/T_h',
    clearRec: 'Clear recorded dots',
    s3readout: 'Q_h = {Qh} J, W = {W} J, Q_c = {Qc} J → η = W/Q_h = {eta}%; and 1 − T_c/T_h = 1 − {Tc}/{Th} = {etaC}%. Cycles recorded on the bottom chart: {n}.',
    s3hint: 'What to watch: first move only V₂/V₁ — both bars in the top chart stretch together and each new dot lands on top of the old one. Then move T_h or T_c and the dot slides along the pink line. Whatever you do, every dot sits on η = 1 − T_c/T_h. “Clear recorded dots” only wipes the bottom chart; it does not touch the settings.',

    s4k: 'Step 4 · No engine can beat it',
    s4t: 'Someone claims an engine with higher efficiency. Can you tell on the spot whether it is possible?',
    s4e: 'The question for this step: can any engine running between the same two reservoirs — not just a Carnot cycle, not just an ideal gas — beat 1 − T_c/T_h? Keep the books in entropy. After a full cycle the engine is back where it started, so its own entropy is unchanged; the hot reservoir gives up Q_h and loses Q_h/T_h of entropy; the cold reservoir receives Q_c and gains Q_c/T_c. The <strong>second law of thermodynamics</strong>: the total entropy of an isolated system (here, the engine plus both reservoirs) never decreases. Set a “claimed efficiency” below. Each cycle takes in Q_h = 1000 J, energy conservation gives W = η·Q_h and Q_c = Q_h − W, and the sign of the total entropy change ΔS_total decides: above 0, the machine can exist but wastes something (it is irreversible); exactly 0, it is the reversible Carnot engine; below 0, it breaks the second law and cannot be built.',
    claimEta: 'Claimed efficiency η (%)', setCarnot: 'Set to the Carnot efficiency',
    s4lgQh: 'Hot side: heat Q_h / reservoir entropy change', s4lgW: 'Work out W', s4lgQc: 'Cold side: heat Q_c / reservoir entropy change', s4lgTot: 'Total entropy change ΔS_total', s4lgMax: 'Largest work the Carnot limit allows',
    c4a: 'Energy flow per cycle (J)', c4b: 'Entropy change per cycle (J/K)',
    s4readout: 'Claimed η = {eta}% (Carnot limit {etaC}%). Per cycle: W = {W} J, Q_c = {Qc} J; hot reservoir ΔS = {dSh} J/K, cold reservoir ΔS = {dSc} J/K, total ΔS_total = {tot} J/K → {verdict}',
    vPossible: 'possible, but irreversible (something is wasted).', vLimit: 'exactly the reversible limit: a Carnot engine.', vImpossible: 'impossible: total entropy falls, breaking the second law.',
    s4hint: 'What to watch: hold both temperatures and drag “Claimed efficiency” up from 0. The white total-entropy bar in the bottom chart shrinks, and the moment you pass the Carnot limit it flips below the zero line and the readout says “impossible”. “Set to the Carnot efficiency” puts the total at exactly 0. Then change only T_c and watch the flip point move.',

    s5k: 'Step 5 · Run it backwards',
    s5t: 'Run the Carnot cycle in reverse: how much heat does 1 J of work move?',
    s5e: 'The question for this step: every leg of the Carnot cycle is <strong>reversible</strong> — infinitely slow, with no friction and no heat flowing across a temperature gap, so it can be retraced at any moment. Run backwards, the surroundings do work W on the gas, the gas takes heat Q_c at the cold end and releases Q_h = Q_c + W at the hot end: an ideal refrigerator or heat pump. They are rated by the <strong>coefficient of performance, COP</strong> (heat delivered where you want it ÷ work paid; higher means cheaper to run). A refrigerator cares about heat pulled out of the cold side, COP = Q_c/W = T_c/(T_h − T_c); a heat pump cares about heat pushed into the house, COP = Q_h/W = T_h/(T_h − T_c). COP can be far above 1, because the heat is moved, not made from the work. Temperatures are set in °C here and converted to kelvin (add 273.15) for the maths. The top chart shows the heat moved per 1000 J of work, with a white outline on the share the current use actually wants; the bottom chart plots COP (log scale, each gridline ×2 or ×10) against the cold-side temperature, with the hot side held at its current value.',
    coldSide: 'Cold side T_c (°C)', hotSide: 'Hot side T_h (°C)', fridge: 'Use as a refrigerator', pump: 'Use as a heat pump',
    modeFridge: 'Refrigerator', modePump: 'Heat pump',
    s5lgW: 'Work in W', s5lgQc: 'Heat pulled from the cold side Q_c', s5lgQh: 'Heat delivered to the hot side Q_h', s5lgCur: 'COP curve for the current use', s5lgOther: 'COP curve for the other use',
    c5a: 'Per 1000 J of work in (J)', c5b: 'COP vs cold-side temperature (°C), hot side {th} °C',
    s5readout: '{mode}: cold side {tc} °C = {TcK} K, hot side {th} °C = {ThK} K, a gap of {dT} K. For every W = 1000 J of work it pulls Q_c = {Qc} J out of the cold side and delivers Q_h = {Qh} J to the hot side; COP = {cop}.',
    s5hint: 'What to watch: choose “Use as a refrigerator” and drag only the cold side lower. The Q_c bar shortens and the white dot slides down its curve: the wider the gap, the more electricity each joule costs. Switch to “Use as a heat pump” and at the same temperatures the COP is exactly 1 higher than the refrigerator’s, because Q_h = Q_c + W.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One rectangle, three conclusions',
    s6fin: '<strong>Looking back.</strong> Work is area on the p–V chart. An engine has to go round a loop, and it comes out ahead by compressing while cold, so the net work per cycle is the enclosed area. On a T–S diagram the Carnot cycle is a rectangle that takes heat in along its hot edge and gives it out along its cold edge, so its efficiency depends on the two temperatures alone. The entropy books then show that an engine between two reservoirs beating the Carnot limit would lower the total entropy, which the second law forbids. Run the same rectangle backwards and you have a refrigerator or a heat pump.',
    formula: 'W = ∮p dV = (T_h − T_c)·ΔS\nη = 1 − T_c/T_h\nCOP_fridge = T_c/(T_h − T_c), COP_pump = T_h/(T_h − T_c)',
    boundary: 'Where this holds: the efficiency ceiling applies to any cyclic engine working between two constant-temperature reservoirs; the specific areas and heats come from a model of 1 mol of monatomic ideal gas taken through fully reversible (infinitely slow) processes. Real engines have friction, transfer heat across finite temperature gaps and run in finite time, so they all fall short of the ceiling; this page does not simulate those losses.',
    linksTitle: 'Where to go next',
    lk1: '→ Thermodynamics, step 2: from one starting point, why isotherms and adiabats split apart',
    lk2: '→ Thermodynamics, step 3: from energy conservation to the engine-efficiency limit',
    lk3: '→ Kinetic theory, step 1: temperature as a reading of mean molecular kinetic energy',
    lk4: '→ Information entropy, step 6: information entropy and thermodynamic entropy on one scale',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Carnot Cycle · The Ceiling on Heat-Engine Efficiency”.'
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
  if (typeof window.refreshCarnot === 'function') window.refreshCarnot();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CARNOT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
