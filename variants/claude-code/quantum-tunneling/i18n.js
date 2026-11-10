'use strict';
// Quantum tunnelling lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '量子隧穿 · 墙后那一截没断的波',
    back: '← 知识索引',
    compare: '对照另一版本：量子隧穿 · 穿墙的是概率，不是子弹 →',
    navLabel: '量子隧穿步骤导航',
    tagline: '一个电子带着 0.5 eV 的能量，迎面是一堵 1 eV 高的能量墙。按经典力学，它必定在墙面掉头；按量子力学，墙后总会探出一截波。七步里你会看到这截波从哪里来，为什么墙每厚一点它就按同一个倍数缩小，以及它怎样让一颗铀核平均等上几十亿年才衰变。',
    nav0: '0 墙里的尾巴', nav1: '1 墙后的波', nav2: '2 墙厚与质量', nav3: '3 高过墙顶', nav4: '4 波包撞墙', nav5: '5 α 衰变', nav6: '6 收束',

    s0k: '第 0 步 · 先看一堵没有背面的墙',
    s0t: '电子的能量不够翻墙时，墙里面有没有它？',
    s0e: '这一步要回答：能量 E 低于墙高 V 的电子撞上一堵无限厚的墙，在墙里能不能找到它？这里的「墙」是<strong>势垒</strong>：一段区域，粒子待在里面要额外付出势能 V。电子的动能 = E − V，在墙里是负数，所以经典粒子根本进不去，在墙面 x = 0 处掉头。量子力学用<strong>波函数</strong> ψ 描述电子，<strong>概率密度</strong> |ψ|² 表示在某处找到它的相对可能性（<a class="xlink" href="../../../physics/modern/quantum-basics/#step1">→ 量子基础第 1 步：振幅的平方就是测量概率</a>）。本页把入射波的密度定为 1。下图的 |ψ|² 是定态薛定谔方程的解：墙面两侧 ψ 和它的斜率都连续。墙前是入射波和反射波叠出的条纹；墙里是一截按指数衰减的尾巴 e<sup>−2κx</sup>，<strong>衰减常数</strong> κ = √(2m(V − E))/ħ，V − E 越大衰减越快。',
    sE: '电子能量 E', sD: '探针深度 d', sA: '墙厚 a',
    lgWall: '墙（势能 V = 1 eV）', lgE: '电子能量 E', lgDens: '|ψ|² 概率密度', lgHist: '之前试过的能量', lgProbe: '探针深度 d',
    c0top: '能量图：墙高 V 与电子能量 E（eV）', c0bot: '|ψ|²（入射波 = 1）　横轴 x / nm，墙面在 x = 0',
    s0readout: 'E = {E} eV（墙高 {V} eV）：反射概率 R = {R}，电子最终全部弹回。墙面处的密度是 {edge}（入射波为 1）；κ = {k} nm⁻¹，每往墙里深入 δ = 1/(2κ) = {delta} nm，密度降为原来的 1/e ≈ 37%。探针深度 d = {d} nm 处的密度是 {dd}，是墙面的 {pct}%。',
    s0hint: '观察顺序：先保持探针深度不动，只把能量 E 从 0.05 拖到 0.95：上图的能量线逼近墙顶，下图墙里的尾巴越拖越长（灰线留下你试过的能量）。再固定 E，拖探针深度 d：每深入同样的距离，读数里的百分比就乘上同一个倍数，这就是指数衰减。墙无限厚，所以 R 始终是 1：尾巴只是探进墙里，没有穿过去。',

    s1k: '第 1 步 · 把墙削薄',
    s1t: '墙只有零点几纳米厚时，墙后会出现什么？',
    s1e: '这一步要回答：墙厚只有 a 时，墙后会不会出现一列向右跑的波，它有多大？墙里仍是上一步那种指数衰减的波（衰减常数 κ），但它在墙的背面还没衰减完，剩下的振幅就接成了墙后的波。墙后右侧的密度是一个常数，记作 T，它就是<strong>透射概率</strong>：电子穿到墙后的概率；回到墙前的概率是<strong>反射概率</strong> R。概率守恒，T + R = 1。经典粒子在 E &lt; V 时 T = 0，这里 T &gt; 0 就叫<strong>隧穿</strong>。',
    lgT: '墙后的平线 = 透射概率 T',
    c1top: '能量图：厚 a 的墙（eV）', c1bot: '|ψ|²（入射波 = 1）　横轴 x / nm，墙在 0 到 a',
    s1readout: 'a = {a} nm，E = {E} eV：透射概率 T = {T}（大约每 {inv} 个电子穿过 1 个），反射概率 R = {R}，T + R = {sum}。墙后的密度是一条平线，高度正是 T。',
    s1hint: '观察顺序：先把墙厚 a 从 0.1 nm 慢慢拖到 2 nm，盯住下图墙后的平线：它越压越低，但始终不是 0。墙前的条纹也在变：反射越完全，条纹的最低点越接近 0。为什么墙后是平的？那里只有一列向右跑的波，没有反射波和它叠加，所以没有条纹。灰线留下你之前的几次设置。',

    s2k: '第 2 步 · 墙厚与质量',
    s2t: '墙加厚一倍，透射概率是少一半吗？',
    s2e: '这一步要回答：T 随墙厚 a 怎样变化？换成更重的粒子又会怎样？两张图横轴都是墙厚 a，纵轴都是<strong>对数刻度</strong>：上图只画电子，每往下一格 T 缩小 100 倍；下图把电子和更重的粒子放在一起，每格 10<sup>10</sup> 倍。在对数刻度上，直线就是指数：墙够厚时（κa 大于 2 时误差不到 4%），T ≈ 16(E/V)(1 − E/V)·e<sup>−2κa</sup>，墙每多 0.1 nm，T 就乘上同一个小于 1 的数 e<sup>−0.2κ</sup>。κ = √(2m(V − E))/ħ 里含质量 m：<strong>μ 子</strong>（带电量和电子相同、质量是电子的 {mm} 倍的粒子）的 κ 是电子的 {sm} 倍，<strong>质子</strong>（{mp} 倍质量）是 {sp} 倍，直线也陡同样的倍数（<a class="xlink" href="../../../physics/modern/double-slit/#step4">→ 双缝页第 4 步：同样因为质量，棒球看不到干涉</a>）。',
    lgElec: '电子（精确）', lgApprox: '电子（厚墙近似）', lgMuon: 'μ 子', lgProton: '质子', lgTrail: '试过的墙厚',
    c2top: '电子的 T（对数刻度，每格 100 倍）　横轴 墙厚 a / nm', c2bot: '三种粒子的 T（每格 10¹⁰ 倍）　横轴 墙厚 a / nm',
    s2readout: 'a = {a} nm，E = {E} eV（墙高 1 eV）：电子 T = {Te}；μ 子 T = {Tm}；质子 T = {Tp}。电子的墙每多 0.1 nm，T 乘 {f}。',
    s2hint: '观察顺序：保持 E 不变，拖墙厚 a，先看上图：电子的 T 沿近似直线下滑；再看下图三条线上的圆点：电子（青）几乎是平的，μ 子（绿）陡得多，质子（橙）很快掉出图底（读数里仍有数值）。上图的白色虚线是厚墙近似，墙很薄时它和精确曲线不重合：墙厚趋于 0 时，精确的 T 趋于 1，近似式却趋于 16(E/V)(1 − E/V)。再换 E：E 越低，V − E 越大，κ 越大，三条线都更陡。',
    quizPrompt: '先猜再验：E = 0.5 eV，电子的墙厚从 0.5 nm 加到 1 nm，T 会变成原来的多少？',
    quizA: '一半', quizB: '约 1/{r}', quizC: '约 1/{wrong}',
    check: '核对', correct: '对：T 从 {T1} 降到 {T2}，变成约 1/{r}。墙加倍，衰减指数 e^(−2κa) 也翻倍，就不止「减半」。',
    wrong: '再看看：拖到 a = 0.5 和 a = 1 各读一次 T。T 从 {T1} 降到 {T2}，是约 1/{r}，不是一半。',

    s3k: '第 3 步 · 能量高过墙顶',
    s3t: '能量比墙还高，就一定能过去吗？',
    s3e: '这一步要回答：E 大于墙高 V 时，经典粒子必定通过（只是在墙上方走得慢些），波是否也 100% 通过？上图横轴是能量 E，纵轴是透射概率 T（0 到 1，普通刻度）；灰色阶梯是经典答案。E &gt; V 时墙里的波不再衰减，变成波长更长的正弦波，<strong>墙内波长</strong> λ = h/√(2m(E − V))。它在墙的前后两个面上都会部分反射；两束反射波互相抵消时 T = 1，这发生在墙恰好装下整数个半波长：a = n·λ/2，n = 1, 2, …（<a class="xlink" href="../../../physics/waves/standing-wave/#step3">→ 驻波页第 3 步：弦上同样的「整数个半波长」条件</a>）。绿色竖线标出这些能量。',
    lgClassic: '经典答案', lgTcurve: '透射概率 T', lgRes: 'T = 1 的能量（共振）', lgNow: '当前能量',
    c3top: 'T 随能量变化　横轴 E / eV，墙高 1 eV', c3bot: '当前能量下的 |ψ|²（入射波 = 1）　横轴 x / nm',
    s3readout: 'E = {E} eV，a = {a} nm：T = {T}，R = {R}；经典答案是 {cl}。{inside}本墙厚下 T = 1 的能量（4 eV 以内）：{list}。',
    clPass: '全部通过', clBlock: '全部弹回', resNone: '无',
    insideBelow: 'E 低于墙高，墙里是衰减的波（κ = {k} nm⁻¹）。',
    insideAbove: '墙内波长 λ = {lam} nm，墙里装下 {n} 个半波长。',
    s3hint: '观察顺序：先固定 a = 1 nm，把 E 从 0 拖到 4 eV：E 刚过墙顶时 T 仍远小于 1，之后起伏上升，在绿色竖线处碰到 1。下图是当前能量的 |ψ|²：拖到绿线上，墙前的条纹消失，因为没有反射波。再把 a 加厚：绿线变密，因为墙越宽，多装半个波长所需的能量越少。图上的小点留下你停过的能量。',

    s4k: '第 4 步 · 一个真实的电子',
    s4t: '一团波包撞上墙，电子会被劈成两半吗？',
    s4e: '这一步要回答：前几步的波无限长、能量完全确定；真实的电子是一小团<strong>波包</strong>：宽度有限的波，位置大致确定，能量有一点散布。把它朝墙发射会怎样？这里用含时薛定谔方程逐步推演（Crank–Nicolson 格式，每步 0.1 fs，总概率守恒；墙高 1 eV）。上图是 |ψ|² 的瞬时形状，下图记录墙左、墙内、墙右三处的概率随时间的变化。撞墙之后波包分成两团，一团反射、一团透射。但分开的是<strong>找到电子的概率</strong>，不是电子本身：在墙后放一个探测器，每次要么探到一个完整的电子，要么什么也没有（<a class="xlink" href="../../../physics/modern/double-slit/#step2">→ 双缝页第 2 步：一次只发一颗粒子</a>）。',
    sE0: '波包平均能量 E₀', launch: '发射波包', pause: '暂停', resume: '继续', reset4: '重置',
    detect1: '探测 1 个电子', detect100: '探测 100 个电子',
    lgLeft: '墙左概率', lgIn: '墙内概率', lgRight: '墙右概率', lgAvg: '按能量散布平均的 T',
    c4top: '|ψ|² 的瞬时形状（每 nm 的概率）　横轴 x / nm', c4bot: '三处的概率随时间变化　横轴 t / fs',
    s4ready: '还没发射。墙从 x = 50 nm 开始，厚 {a} nm；波包从 x = 30 nm 出发，平均能量 {E} eV，按平均速度要 {tEnd} fs 才走到墙后 25 nm 处。',
    s4run: 't = {t} / {tEnd} fs（{pct}%）：墙左 {L}，墙内 {W}，墙右 {R}，三者之和 {S}。',
    s4done: '推演完毕（{tEnd} fs）：墙右的概率停在 {R}。同一堵墙、单一能量 E₀ 的定态 T = {T0}；按波包的能量散布（约 ±{dE} eV）平均后 T = {Tav}，和推演结果相差 {diff}。',
    s4det: '探测：已发射 {n} 个同样的电子，墙后探到 {k} 个（比例 {f}）；推演给出的概率是 {p}。',
    s4detWait: '探测要等推演完成后才能用：先得知道墙后的概率是多少。',
    s4hint: '观察顺序：用默认参数按「发射波包」，看上图的波包撞墙后裂成两团，下图青线（墙右概率）在撞墙那段时间爬升，然后停在一个平台上：平台高度就是穿过去的概率。然后连按几次「探测 100 个电子」：每个电子只落在一边，墙后计数的比例向平台高度靠拢。改 E₀ 或 a 会清空这次推演和计数。动画是放慢的：实际全过程只有约一百飞秒。',

    s5k: '第 5 步 · 原子核里的墙',
    s5t: '为什么铀核要等几十亿年，钋核却不到一微秒？',
    s5e: '这一步要回答：同一种隧穿，能不能解释 α 衰变半衰期之间巨大的差别？<strong>α 衰变</strong>是原子核吐出一个 α 粒子（两个质子加两个中子）。α 粒子在核里带着能量 Q，核外却有一堵库仑墙：剩下的<strong>子核</strong>（电荷 Ze）推开带正电的 α 粒子，势能 V(r) = 2Ze²/(4πε₀r)，在核表面 r = R 处高达 {vlo}–{vhi} MeV，远高于这些核的 Q（{qlo}–{qhi} MeV）。经典上 α 粒子永远出不来，它要隧穿从 R 到 b 的这段墙（b 是 V(r) 降回 Q 的位置；1 fm = 10<sup>−15</sup> m）。伽莫夫（Gamow）1928 年的估算：α 粒子每秒撞墙 ν 次，每次穿过的概率 P = e<sup>−2G</sup>，G 是墙内衰减常数 κ(r) 从 R 到 b 的积分（上一步的 κa 换成积分）；<strong>半衰期</strong>（一半的核衰变掉所需的时间）≈ ln 2 /(νP)。',
    lgCoul: '库仑墙 V(r)', lgQ: 'α 粒子能量 Q', lgTunnel: '要隧穿的一段（R 到 b）', lgModel: '模型：当前子核的半衰期曲线', lgMeas: '实测半衰期', lgPred: '模型对每种核的预测',
    c5top: '势能 V(r)（MeV）　横轴 到核心的距离 r / fm', c5bot: 'log₁₀（半衰期 / 秒）　横轴 Q / MeV',
    sQ: '假想的 Q 值（MeV）',
    s5readout: '{name}（子核 Z = {Z}）：Q = {Q} MeV。墙从 R = {R} fm 延伸到 b = {b} fm，厚 {th} fm，墙顶 {top} MeV。每次撞墙穿过的概率约 {P}，每秒撞墙约 {nu} 次，模型半衰期 {pred}。{meas}',
    measSame: '实测 {meas}；模型 ÷ 实测 = {ratio}。',
    measOther: '实测 {meas} 对应的是真实的 Q = {Q0} MeV；现在是假想的 Q。',
    thIso: '核素', thQ: 'Q / MeV', thMeas: '实测半衰期', thPred: '模型半衰期',
    s5hint: '观察顺序：依次点七种核素：Q 从 {qlo} MeV 增到 {qhi} MeV，只是 {qratio} 倍，半衰期却跨了 {span} 个数量级。再选定一种核，拖 Q：b 随 Q 增大而内移，墙变薄，半衰期沿青色曲线急剧变短。七种核的模型与实测都在 {maxdiff} 个数量级以内（偏差最大的是 ²¹⁰Po）；这个估算只用了一个核半径参数。',

    u_us: '微秒', u_ms: '毫秒', u_s: '秒', u_min: '分钟', u_h: '小时', u_d: '天', u_yr: '年', u_kyr: '万年', u_myr: '亿年', u_gyr: '亿年',
    unitStyle: 'zh',

    s6k: '第 6 步 · 收束', s6t: '同一个指数，从显微镜到原子核',
    s6fin: '回顾。<strong>第 0 步</strong>：能量不够时，波在墙里不是戛然而止，而是按 e<sup>−2κx</sup> 衰减。<strong>第 1 步</strong>：墙够薄，尾巴在背面还没衰减完，就接成墙后的波，T &gt; 0。<strong>第 2 步</strong>：墙每厚一点，T 乘同一个倍数；κ 随 √m 变大，所以重粒子几乎不隧穿。<strong>第 3 步</strong>：能量高过墙顶也会反射，只有墙里装下整数个半波长时才全透。<strong>第 4 步</strong>：一个电子的波包分成两团，分开的是概率；每次探测只得到一个完整的电子。<strong>第 5 步</strong>：Q 差两倍，墙厚差两倍多，指数把它放大成二十多个数量级的半衰期。',
    stm: '<strong>扫描隧道显微镜（STM）</strong>把同一个指数变成了测量工具：针尖停在样品表面上方不到 1 nm，中间的真空缝就是墙，墙高约等于<strong>功函数</strong> φ（把电子拉出金属所需的能量，<a class="xlink" href="../../../physics/modern/photoelectric-effect/#step1">→ 光电效应页第 1 步：功函数在能量账本里的位置</a>）。按本页的厚墙近似，φ = {phi} eV 时缝每窄 0.1 nm，隧穿电流约增大到 {f1} 倍；表面起伏只有 0.02 nm，电流也会变成 {f2} 倍。所以针尖扫过表面时，电流的起伏就能画出一个个原子。',
    formula: 'κ = √(2m(V − E)) / ħ\nT ≈ 16(E/V)(1 − E/V)·e^(−2κa)\nt½ ≈ ln 2 / (ν · e^(−2G))',
    boundary: '适用范围：第 0–4 步是一维、矩形墙、非相对论电子，没有能量损耗；真实材料的墙不是矩形，κ 也会随位置变化。第 4 步是数值推演（空间格距 0.025 nm，左右两端是硬墙，推演在反射波到达端点之前结束）。第 5 步是伽莫夫估算：忽略角动量、原子核形状和 α 粒子在核内成团的概率，核半径取 R = 1.2(A<sup>1/3</sup> + 4<sup>1/3</sup>) fm；Q 值与半衰期是标准核数据，模型与实测差在两个数量级以内，只能说明数量级。STM 的倍数用的是恒定功函数的厚墙近似。',
    linksTitle: '接着去看',
    lk1: '→ 量子基础第 1 步：振幅平方怎样变成一次测量的概率',
    lk2: '→ 双缝干涉第 2 步：一次一颗粒子，概率怎样在屏上积累成图样',
    lk3: '→ 驻波第 3 步：整数个半波长的台阶，和第 3 步的共振同一个条件',
    lk4: '→ 光电效应第 1 步：功函数，也就是 STM 里那堵墙的高度',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《量子隧穿 · 穿墙的是概率，不是子弹》的平行版本。'
  },
  en: {
    pageTitle: 'Quantum Tunnelling · The Wave Doesn’t Stop at the Wall',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Quantum Tunnelling · What Passes Through the Wall Is a Probability →',
    navLabel: 'Quantum tunnelling steps',
    tagline: 'An electron carries 0.5 eV of energy towards a wall of potential energy 1 eV high. Classical mechanics says it must turn back at the wall’s face; quantum mechanics says some of its wave always shows up on the far side. In seven steps you will see where that piece of wave comes from, why each extra sliver of wall shrinks it by the same factor, and how it makes a uranium nucleus wait billions of years, on average, before it decays.',
    nav0: '0 Tail in the wall', nav1: '1 Wave behind it', nav2: '2 Width and mass', nav3: '3 Over the top', nav4: '4 A wave packet', nav5: '5 Alpha decay', nav6: '6 Wrap-up',

    s0k: 'Step 0 · A wall with no far side',
    s0t: 'If the electron can’t climb the wall, is any of it inside?',
    s0e: 'The question here: an electron with energy E below the wall height V meets an infinitely thick wall. Can it be found inside? The “wall” is a <strong>potential barrier</strong>: a region where the particle has to pay an extra potential energy V. Its kinetic energy, E − V, is negative there, so a classical particle cannot get in at all and turns round at the face, x = 0. Quantum mechanics describes the electron by a <strong>wave function</strong> ψ, and the <strong>probability density</strong> |ψ|² gives the relative chance of finding it at each place (<a class="xlink" href="../../../physics/modern/quantum-basics/#step1">→ Quantum basics, step 1: squared amplitudes are measurement probabilities</a>). The incoming wave’s density is set to 1. The |ψ|² below solves the time-independent Schrödinger equation, with ψ and its slope continuous across the face. In front of the wall the incoming and reflected waves add into fringes; inside there is a tail that dies away as e<sup>−2κx</sup>, with <strong>decay constant</strong> κ = √(2m(V − E))/ħ: the bigger V − E, the faster the decay.',
    sE: 'Electron energy E', sD: 'Probe depth d', sA: 'Wall thickness a',
    lgWall: 'Wall (potential energy V = 1 eV)', lgE: 'Electron energy E', lgDens: '|ψ|² probability density', lgHist: 'Energies you tried before', lgProbe: 'Probe depth d',
    c0top: 'Energy diagram: wall height V and electron energy E (eV)', c0bot: '|ψ|² (incoming wave = 1)   x / nm, wall face at x = 0',
    s0readout: 'E = {E} eV (wall {V} eV high): reflection probability R = {R}, so the electron always comes back. The density at the face is {edge} (incoming wave = 1); κ = {k} nm⁻¹, so every δ = 1/(2κ) = {delta} nm deeper the density drops to 1/e ≈ 37% of its value. At probe depth d = {d} nm it is {dd}, or {pct}% of the value at the face.',
    s0hint: 'What to try: leave the probe depth alone and drag the energy E from 0.05 to 0.95. In the energy diagram the energy line creeps up to the top of the wall, and in the density plot the tail inside the wall gets longer (grey lines keep the energies you tried). Then fix E and drag the probe depth d: every equal step deeper multiplies the percentage by the same factor. That is exponential decay. The wall is infinitely thick, so R stays at 1: the tail reaches into the wall but never through it.',

    s1k: 'Step 1 · Shave the wall thin',
    s1t: 'When the wall is a fraction of a nanometre thick, what appears behind it?',
    s1e: 'The question here: with a wall only a thick, is there a wave running away to the right behind it, and how big is it? Inside, the wave still decays exponentially as in step 0 (decay constant κ), but it reaches the back face before it has died out, and what is left joins on to a wave beyond the wall. The density on the far side is a constant, called T: the <strong>transmission probability</strong>, the chance that the electron ends up behind the wall. The chance it comes back is the <strong>reflection probability</strong> R. Probability is conserved, so T + R = 1. A classical particle with E &lt; V has T = 0; getting T &gt; 0 anyway is called <strong>tunnelling</strong>.',
    lgT: 'Flat line behind the wall = transmission probability T',
    c1top: 'Energy diagram: a wall of thickness a (eV)', c1bot: '|ψ|² (incoming wave = 1)   x / nm, wall from 0 to a',
    s1readout: 'a = {a} nm, E = {E} eV: transmission probability T = {T} (roughly 1 electron in {inv} gets through), reflection probability R = {R}, T + R = {sum}. Behind the wall the density is a flat line at height T.',
    s1hint: 'What to try: drag the thickness a slowly from 0.1 nm to 2 nm and watch the flat line behind the wall in the density plot: it sinks lower and lower but never reaches 0. The fringes in front change too: the more complete the reflection, the closer their minima get to 0. Why is the far side flat? Only one wave runs there, to the right, with no reflected wave to interfere with, so there are no fringes. Grey lines keep your last few settings.',

    s2k: 'Step 2 · Thickness and mass',
    s2t: 'Double the wall: does the transmission halve?',
    s2e: 'The question here: how does T depend on the thickness a, and what changes for a heavier particle? Both plots have the thickness a across and a <strong>logarithmic</strong> vertical axis: the top one shows the electron alone, each grid line down meaning T is 100 times smaller; the bottom one adds heavier particles, at 10<sup>10</sup> per grid line. On a log scale a straight line is an exponential. Once the wall is thick enough (for κa above 2 the error is under 4%), T ≈ 16(E/V)(1 − E/V)·e<sup>−2κa</sup>, so every extra 0.1 nm multiplies T by the same number below 1, e<sup>−0.2κ</sup>. The mass m sits inside κ = √(2m(V − E))/ħ. A <strong>muon</strong> (same charge as the electron, {mm} times the mass) has a κ {sm} times larger, and a <strong>proton</strong> ({mp} times the mass) {sp} times larger, so their lines are that much steeper (<a class="xlink" href="../../../physics/modern/double-slit/#step4">→ Double slit, step 4: the same mass dependence is why baseballs don’t interfere</a>).',
    lgElec: 'Electron (exact)', lgApprox: 'Electron (thick-wall estimate)', lgMuon: 'Muon', lgProton: 'Proton', lgTrail: 'Thicknesses you tried',
    c2top: 'Electron T (log scale, ×100 per grid line)   wall thickness a / nm', c2bot: 'T for three particles (×10¹⁰ per grid line)   wall thickness a / nm',
    s2readout: 'a = {a} nm, E = {E} eV (wall 1 eV high): electron T = {Te}; muon T = {Tm}; proton T = {Tp}. For the electron, each extra 0.1 nm of wall multiplies T by {f}.',
    s2hint: 'What to try: keep E fixed and drag the thickness a. First the top plot: the electron’s T slides down an almost straight line. Then the dots in the bottom plot: on this scale the electron’s line (cyan) looks almost flat, the muon’s (green) falls far more steeply, and the proton’s (orange) soon drops off the bottom of the chart (the readout still gives its value). In the top plot the white dashed line is the thick-wall estimate. For very thin walls it misses the exact curve: as the thickness goes to 0 the exact T goes to 1, while the estimate goes to 16(E/V)(1 − E/V). Then change E: the lower E, the bigger V − E and κ, and the steeper all three lines.',
    quizPrompt: 'Guess, then check: at E = 0.5 eV the electron’s wall goes from 0.5 nm to 1 nm. What fraction of T is left?',
    quizA: 'Half', quizB: 'About 1/{r}', quizC: 'About 1/{wrong}',
    check: 'Check', correct: 'Right: T drops from {T1} to {T2}, about 1/{r} of what it was. Doubling the wall doubles the exponent in e^(−2κa), which is much more than halving.',
    wrong: 'Not quite: drag to a = 0.5 and a = 1 and read T each time. It goes from {T1} to {T2}, about 1/{r}, not half.',

    s3k: 'Step 3 · Over the top',
    s3t: 'If the energy is higher than the wall, does everything get through?',
    s3e: 'The question here: with E above the wall height V a classical particle always passes (it just slows down over the wall). Does the wave pass 100% as well? The top plot has energy E across and transmission probability T up (0 to 1, ordinary scale); the grey step is the classical answer. For E &gt; V the wave inside no longer decays; it becomes a sine wave with a longer <strong>wavelength inside the wall</strong>, λ = h/√(2m(E − V)). It is partly reflected at both faces of the wall, and when the two reflections cancel, T = 1. That happens when the wall holds a whole number of half-wavelengths: a = n·λ/2, n = 1, 2, … (<a class="xlink" href="../../../physics/waves/standing-wave/#step3">→ Standing waves, step 3: the same “whole number of half-wavelengths” rule on a string</a>). The green vertical lines mark those energies.',
    lgClassic: 'Classical answer', lgTcurve: 'Transmission probability T', lgRes: 'Energies with T = 1 (resonances)', lgNow: 'Current energy',
    c3top: 'T against energy   E / eV, wall 1 eV high', c3bot: '|ψ|² at the current energy (incoming wave = 1)   x / nm',
    s3readout: 'E = {E} eV, a = {a} nm: T = {T}, R = {R}; the classical answer is {cl}. {inside}Energies with T = 1 for this wall (up to 4 eV): {list}.',
    clPass: 'everything passes', clBlock: 'everything bounces back', resNone: 'none',
    insideBelow: 'E is below the wall top, so the wave inside decays (κ = {k} nm⁻¹). ',
    insideAbove: 'The wavelength inside is λ = {lam} nm and the wall holds {n} half-wavelengths. ',
    s3hint: 'What to try: fix a = 1 nm and drag E from 0 to 4 eV. Just above the top of the wall T is still far below 1; then it climbs with wiggles and touches 1 at each green line. The lower plot shows |ψ|² at the current energy: on a green line the fringes in front of the wall vanish, because there is no reflected wave. Then make the wall thicker: the green lines crowd together, because a wider wall needs less extra energy to fit in one more half-wavelength. Small dots mark the energies you stopped at.',

    s4k: 'Step 4 · A real electron',
    s4t: 'When a wave packet hits the wall, is the electron cut in two?',
    s4e: 'The question here: the waves so far were endless and had one exact energy. A real electron is a small <strong>wave packet</strong>: a wave of limited width, so its position is roughly known and its energy is slightly spread out. What happens when we fire one at the wall? This plot steps the time-dependent Schrödinger equation forward (Crank–Nicolson scheme, 0.1 fs per step, total probability conserved; wall 1 eV high). The top plot is |ψ|² at this instant; the bottom one tracks the probability to the left of, inside and to the right of the wall over time. After the hit the packet splits into two lumps, one reflected and one transmitted. What splits is the <strong>probability of finding the electron</strong>, not the electron: a detector behind the wall either finds a whole electron or nothing (<a class="xlink" href="../../../physics/modern/double-slit/#step2">→ Double slit, step 2: one particle at a time</a>).',
    sE0: 'Mean packet energy E₀', launch: 'Fire the packet', pause: 'Pause', resume: 'Resume', reset4: 'Reset',
    detect1: 'Detect 1 electron', detect100: 'Detect 100 electrons',
    lgLeft: 'Probability left of the wall', lgIn: 'Probability inside', lgRight: 'Probability right of the wall', lgAvg: 'T averaged over the energy spread',
    c4top: '|ψ|² at this instant (probability per nm)   x / nm', c4bot: 'Probability in each region over time   t / fs',
    s4ready: 'Not fired yet. The wall starts at x = 50 nm and is {a} nm thick; the packet starts at x = 30 nm with mean energy {E} eV and, at its mean speed, needs {tEnd} fs to reach 25 nm past the wall.',
    s4run: 't = {t} / {tEnd} fs ({pct}%): left {L}, inside {W}, right {R}; the three add up to {S}.',
    s4done: 'Run complete ({tEnd} fs): the probability to the right settles at {R}. The steady-state T for one exact energy E₀ and the same wall is {T0}; averaged over the packet’s energy spread (about ±{dE} eV) it is {Tav}, which differs from the run by {diff}.',
    s4det: 'Detection: {n} identical electrons fired, {k} found behind the wall (fraction {f}); the run gave a probability of {p}.',
    s4detWait: 'Detection unlocks once the run is complete: first we need the probability behind the wall.',
    s4hint: 'What to try: with the default settings press “Fire the packet”. In the top plot the packet hits the wall and splits into two lumps; in the bottom plot the cyan line (probability to the right) climbs during the hit and then levels off. The height of that plateau is the chance of getting through. Then press “Detect 100 electrons” a few times: each electron lands on one side only, and the fraction found behind the wall closes in on the plateau. Changing E₀ or a clears the run and the counts. The animation is slowed down: the real event lasts about a hundred femtoseconds.',

    s5k: 'Step 5 · A wall inside the nucleus',
    s5t: 'Why does uranium wait billions of years while polonium goes in under a microsecond?',
    s5e: 'The question here: can the same tunnelling explain the enormous spread of alpha-decay half-lives? In <strong>alpha decay</strong> a nucleus spits out an alpha particle (two protons and two neutrons). Inside, the alpha particle has energy Q, but outside there is a Coulomb wall: the remaining <strong>daughter nucleus</strong> (charge Ze) repels the positive alpha particle with potential energy V(r) = 2Ze²/(4πε₀r), which reaches {vlo}–{vhi} MeV at the nuclear surface r = R, far above the Q of these nuclei ({qlo}–{qhi} MeV). Classically the alpha particle can never leave; it has to tunnel through the wall from R to b, where V(r) falls back to Q (1 fm = 10<sup>−15</sup> m). Gamow’s 1928 estimate: the alpha particle hits the wall ν times per second and gets through each time with probability P = e<sup>−2G</sup>, where G adds up the decay constant κ(r) across the wall from R to b (the κa of step 2, now as an integral). The <strong>half-life</strong>, the time for half the nuclei to decay, is about ln 2 /(νP).',
    lgCoul: 'Coulomb wall V(r)', lgQ: 'Alpha-particle energy Q', lgTunnel: 'Stretch to tunnel through (R to b)', lgModel: 'Model: half-life curve for the current daughter', lgMeas: 'Measured half-life', lgPred: 'Model prediction for each nucleus',
    c5top: 'Potential energy V(r) (MeV)   distance from the centre r / fm', c5bot: 'log₁₀(half-life / s)   Q / MeV',
    sQ: 'Hypothetical Q value (MeV)',
    s5readout: '{name} (daughter Z = {Z}): Q = {Q} MeV. The wall runs from R = {R} fm to b = {b} fm, {th} fm thick, peaking at {top} MeV. Chance of getting through per hit about {P}, about {nu} hits per second, model half-life {pred}. {meas}',
    measSame: 'Measured: {meas}; model ÷ measured = {ratio}.',
    measOther: 'The measured {meas} belongs to the real Q = {Q0} MeV; this Q is hypothetical.',
    thIso: 'Nucleus', thQ: 'Q / MeV', thMeas: 'Measured half-life', thPred: 'Model half-life',
    s5hint: 'What to try: click through the seven nuclei. Q rises from {qlo} MeV to {qhi} MeV, only {qratio} times larger, yet the half-life spans {span} orders of magnitude. Then pick one nucleus and drag Q: b moves inward as Q grows, the wall thins, and the half-life plunges along the cyan curve. For all seven nuclei model and measurement agree to within {maxdiff} orders of magnitude (²¹⁰Po is the worst); the estimate uses a single nuclear-radius parameter.',

    u_us: 'µs', u_ms: 'ms', u_s: 's', u_min: 'min', u_h: 'h', u_d: 'days', u_yr: 'years', u_kyr: 'thousand years', u_myr: 'million years', u_gyr: 'billion years',
    unitStyle: 'en',

    s6k: 'Step 6 · Wrap-up', s6t: 'One exponential, from microscopes to nuclei',
    s6fin: 'The thread. <strong>Step 0</strong>: without enough energy the wave doesn’t stop dead at the wall; it decays as e<sup>−2κx</sup>. <strong>Step 1</strong>: if the wall is thin, the tail reaches the back before it dies out and joins on to a wave beyond it, so T &gt; 0. <strong>Step 2</strong>: each extra sliver of wall multiplies T by the same factor, and κ grows like √m, so heavy particles hardly tunnel. <strong>Step 3</strong>: even above the wall some of the wave reflects; full transmission needs a whole number of half-wavelengths inside. <strong>Step 4</strong>: an electron’s packet splits into two lumps of probability, and each detection finds one whole electron. <strong>Step 5</strong>: a factor of two in Q makes the wall more than twice as thick, and the exponential turns that into more than twenty orders of magnitude in half-life.',
    stm: 'The <strong>scanning tunnelling microscope (STM)</strong> turns the same exponential into a measuring tool. A tip hovers less than 1 nm above a surface; the vacuum gap is the wall, and its height is roughly the <strong>work function</strong> φ, the energy needed to pull an electron out of the metal (<a class="xlink" href="../../../physics/modern/photoelectric-effect/#step1">→ Photoelectric effect, step 1: where the work function sits in the energy ledger</a>). With the thick-wall estimate of this page and φ = {phi} eV, narrowing the gap by 0.1 nm multiplies the tunnelling current by about {f1}; a bump of only 0.02 nm still changes it by a factor of {f2}. So as the tip scans, the ups and downs of the current trace out individual atoms.',
    formula: 'κ = √(2m(V − E)) / ħ\nT ≈ 16(E/V)(1 − E/V)·e^(−2κa)\nt½ ≈ ln 2 / (ν · e^(−2G))',
    boundary: 'Scope: steps 0–4 use one dimension, a rectangular wall and a non-relativistic electron with no energy loss; real barriers are not rectangular and κ changes with position. Step 4 is a numerical run (grid spacing 0.025 nm, hard walls at both ends, stopped before any reflection reaches them). Step 5 is Gamow’s estimate: it ignores angular momentum, nuclear shape and the chance that an alpha particle forms inside the nucleus, and takes R = 1.2(A<sup>1/3</sup> + 4<sup>1/3</sup>) fm. Q values and half-lives are standard nuclear data; model and measurement agree within two orders of magnitude, so it speaks to orders of magnitude only. The STM factors use the thick-wall estimate with a constant work function.',
    linksTitle: 'Where to go next',
    lk1: '→ Quantum basics, step 1: how a squared amplitude becomes the probability of one measurement',
    lk2: '→ Double slit, step 2: one particle at a time, and how probability builds a pattern on the screen',
    lk3: '→ Standing waves, step 3: the whole-number half-wavelength steps behind the resonances in step 3',
    lk4: '→ Photoelectric effect, step 1: the work function, the height of the wall in an STM',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Quantum Tunnelling · What Passes Through the Wall Is a Probability”.'
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
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshTunnelling === 'function') window.refreshTunnelling();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.QT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
