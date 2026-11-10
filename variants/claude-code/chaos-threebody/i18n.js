'use strict';
// Chaos and the three-body problem — lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '混沌与三体 · 规则写死了，未来却算不远',
    back: '← 知识索引',
    compare: '对照另一版本：混沌与三体 · 初始差一丝，结果天壤 →',
    navLabel: '混沌与三体步骤导航',
    tagline: '没有骰子、没有噪声，规则一字不差地写好，结果却在几十步之后完全无法预言。六步里你会量出「差一丝」被放大的速度，看到计算机自己的舍入就足以让结果分岔，算出每多测准一位数字能多看多远，最后让三颗星在同一条规则下分道扬镳。',
    nav0: '0 差一丝', nav1: '1 增长率 λ', nav2: '2 舍入也是一丝', nav3: '3 洛伦兹', nav4: '4 预报期限', nav5: '5 三颗星', nav6: '6 收束',
    rLabel: '参数 r', kLabel: '起点相差 δ = 10^−k，k =', rhoLabel: '参数 ρ', digitsLabel: '起点测准的位数 k（相差 10^−k）', epsLabel: '中间那颗星的横向偏移 ε',
    play: '▶ 播放', pause: '⏸ 暂停', showAll: '直接看完整过程',

    s0k: '第 0 步 · 差一丝',
    s0t: '同一条规则、几乎相同的起点，结果能差多远？',
    s0e: '这一步要回答：规则完全确定时，起点上一点点差别，过些步之后会怎样？用最简单的规则做实验：<strong>逻辑斯谛映射</strong> xₙ₊₁ = r·xₙ(1 − xₙ)，x 在 0 到 1 之间，r 是固定的参数，给定 x₀ 后每一步都唯一确定，这叫<strong>确定性</strong>系统。同时从 x₀ = 0.4 和 x₀ = 0.4 + δ 出发各算 60 步。上图横轴是步数 n，纵轴是 xₙ；下图纵轴是两条序列之差的绝对值 |Δₙ|，取以 10 为底的对数刻度（每格相差 10 倍），粉色虚线是 0.1，我们约定差到 0.1 就算「完全不同」。在对数刻度上，按固定倍数增长（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ 指数与对数第 0 步：按倍数增长</a>）就是一条直线。',
    s0lgA: '起点 0.4', s0lgB: '起点 0.4 + δ', s0lgD: '两者之差 |Δₙ|（对数刻度）', s0lgTol: '0.1：算作完全不同',
    c0a: 'xₙ 对步数 n', c0b: 'log₁₀|Δₙ| 对步数 n',
    s0readout: 'r = {r}，起点相差 δ = {d}：第 {n} 步两条序列首次相差超过 0.1。从 {d} 长到 0.1，平均每步差距放大 {g} 倍。',
    s0none: 'r = {r}，起点相差 δ = {d}：60 步内两条序列始终相差不到 0.1（第 60 步相差 {dd}）。',
    s0hint: '观察顺序：先保持 r = 3.9，把 k 从 2 拖到 12：起点差缩小了 10 个数量级，下图的直线只是整体下移，分岔的步数大约只往后推了几十步。再把 r 拖到 3.2 附近：两条序列很快重合成同一个来回，下图的差距一路往下掉。',

    s1k: '第 1 步 · 增长率 λ',
    s1t: '能不能用一个数说清楚差距放大得多快？',
    s1e: '这一步要回答：上一步下图那条直线有多陡，能否不做两次模拟就直接算出来？差距很小时，走一步后它被乘上规则在该点的斜率 |f′(x)| = |r(1 − 2x)|。把一长串 ln|f′(x)| 取平均，就得到<strong>李雅普诺夫指数</strong> λ：差距平均每步乘 e^λ 倍。λ > 0 时小差距按指数放大，这就是<strong>混沌</strong>（对起点敏感）；λ < 0 时差距缩小，系统最终有规律地重复。本页先丢掉前 300 步，再对 3000 步取平均。上图是<strong>分岔图</strong>：横轴 r，纵轴是丢掉前 500 步后 x 取到的 128 个长期值；只有一个点说明停在一个值上，两个点说明在两个值之间来回，一片模糊说明长期不重复。下图是同一横轴上的 λ(r)。',
    s1lgBif: '长期取到的 x 值（分岔图）', s1lgLam: '李雅普诺夫指数 λ(r)', s1lgNow: '当前 r',
    c1a: '分岔图：长期 x 值对 r', c1b: 'λ 对 r（0 以上为混沌）',
    s1chaos: 'r = {r}：λ = {lam}，每步差距平均乘 {mult} 倍；长期不重复（混沌）。按 λ 估计，起点相差 10⁻¹⁰ 要约 {pred} 步才差到 0.1；实际模拟为 {sim} 步。',
    s1reg: 'r = {r}：λ = {lam} ≤ 0，差距每步平均乘 {mult} 倍，越来越小；长期在 {p} 个值之间循环。',
    s1regNoP: 'r = {r}：λ = {lam}，接近 0；处在两种行为的交界附近，长期值还没有在 32 步以内重复。',
    s1hint: '观察顺序：从 r = 2.8 往右拖。分岔图上一条线先分成 2 条、4 条、8 条……；与此同时下图 λ 一次次碰到 0 又落回去；约 r = 3.57 以后 λ 大多跑到 0 以上、分岔图糊成一片。再在 3.83 附近慢慢拖：糊的区域里突然出现 3 条清楚的线，λ 也跳回 0 以下，这是混沌中的「周期窗口」。',

    s2k: '第 2 步 · 舍入也是一丝',
    s2t: '起点完全相同，换一台精度不同的计算机，结果会一样吗？',
    s2e: '这一步要回答：起点一字不差时，计算本身会不会制造出那「一丝」差别？计算机存小数只能保留有限位：常用的 64 位浮点数约 16 位有效数字，32 位浮点数约 7 位。每做一次乘法都要把结果舍入到能存的位数，32 位在 0.5 附近一次舍入的误差约 3×10⁻⁸。图中两条序列用同一个起点 0.4、同一条规则，只是一条每步用 64 位、一条每步用 32 位存结果。下图是两者之差（对数刻度）；绿色虚线从 3×10⁻⁸ 出发，按上一步的 λ 每步乘 e^λ，是理论上的增长线。',
    s2lg64: '64 位浮点（约 16 位有效数字）', s2lg32: '32 位浮点（约 7 位有效数字）', s2lgD: '两者之差（对数刻度）', s2lgPred: '3×10⁻⁸ 按 λ 增长的估计',
    c2a: 'xₙ 对步数 n（同一起点 0.4）', c2b: 'log₁₀|64 位 − 32 位| 对步数 n',
    s2readout: 'r = {r}：λ = {lam}。第 {n} 步时两种精度的结果相差超过 0.1；按 λ 估计，从 3×10⁻⁸ 长到 0.1 约需 {pred} 步。',
    s2trans: 'r = {r}：λ = {lam}，接近 0 或为负，长期平均几乎不放大差距；但从 0.4 出发要先不规则地乱跳很长一段，这段过渡里舍入差照样被放大，第 {n} 步两种精度已相差超过 0.1。这里用 λ 估算分岔步数不适用。',
    s2none: 'r = {r}：λ = {lam} ≤ 0，舍入误差不会被放大；80 步内两种精度始终相差不到 0.1（最大 {dd}）。',
    s2hint: '观察顺序：先在 r = 4 看：前十几步两条线看上去完全重合，到二十来步时突然各走各的，下图的差距沿着绿色虚线爬升。再把 r 拖到 3.5：差距停在很小的数上不再长大。混沌系统里，长时间的数值模拟只是「许多可能结果之一」，而不是唯一正确的答案。',

    s3k: '第 3 步 · 洛伦兹',
    s3t: '连续变化的系统，也会这样吗？',
    s3e: '这一步要回答：上面是一步一步跳的规则，随时间连续变化的系统会不会也对起点敏感？1963 年洛伦兹研究大气对流时，把方程简化成三条：dx/dt = σ(y − x)，dy/dt = x(ρ − z) − y，dz/dt = xy − βz。x、y、z 是描述对流状态的三个量，σ = 10、β = 8/3 固定，ρ 大致代表上下温差有多大。本页用四阶龙格–库塔法（RK4）、步长 0.005 一步步数值积分，从 (1, 1, 1) 和 (1 + δ, 1, 1) 同时出发。上图不画时间，只画 (x, z) 两个量走出的轨迹，这种图叫<strong>相图</strong>（<a class="xlink" href="../../../math/calculus/ode-phase-portraits/#step1">→ 常微分方程相图第 1 步：把时间藏起来</a>）；轨迹最后被吸过去并在其上一直运动的那个形状叫<strong>吸引子</strong>。下图是两次运行的距离（对数刻度）对时间。对 σ = 10、β = 8/3，常用的分界是：ρ < 1 一切回到原点；1 < ρ < 24.06 最终停在两个定点之一（ρ 超过约 13.93 后，轨迹可能先乱转一阵才停下，ρ = 24 时 50 个时间单位还没停稳）；24.06 到 24.74 之间，停下还是一直乱转取决于起点；ρ > 24.74 进入混沌。',
    s3lgA: '从 (1, 1, 1) 出发', s3lgB: '从 (1 + δ, 1, 1) 出发', s3lgSep: '两次运行的距离（对数刻度）', s3lgSlope: '斜率 λ ≈ 0.906 的参考线（ρ = 28 时的公认值；画成过首次超过 1 的那一点，只比较斜率）',
    c3a: '相图：z 对 x', c3b: 'log₁₀(距离) 对时间 t',
    s3readout: 'ρ = {rho}（{regime}）：t = {t}，两次运行相距 {sep}。{split}',
    rgOrigin: '回到原点，静止', rgSteady: '最终停在一个定点', rgMixed: '过渡区：停下还是一直乱转取决于起点', rgChaos: '混沌，在两只「翅膀」间不规则跳动',
    splitAt: '在 t = {ts} 首次相距超过 1。', splitNone: '到 t = 50 都没有相距超过 1。',
    s3hint: '观察顺序：先在 ρ = 28 按「播放」：两条轨迹描出蝴蝶形的吸引子，一开始叠在一起，大约 t = 25 以后橙色突然跑到另一只翅膀；下图距离起初几乎不变，之后的爬升大致与绿色参考线平行。再把 ρ 拖到 20：轨迹绕几圈后停到一个点，下图距离一路下降。播放会保留走过的轨迹。',

    s4k: '第 4 步 · 预报期限',
    s4t: '把起点多测准一位数字，能多看多远？',
    s4e: '这一步要回答：如果差距按 e^(λt) 增长，起点测准到 10^−k，能可靠预报多久？把「两次运行相距超过 1」的时刻叫<strong>预报期限</strong>。若差距从 10^−k 按 e^(λt) 长到 1，需要 t ≈ k·ln10/λ，也就是说每多测准一位数字，期限只增加 ln10/λ ≈ 2.54 个时间单位（λ ≈ 0.906）。本步在 ρ = 28 的吸引子上取一个固定起点（从 (1, 1, 1) 先跑 20 个时间单位），把 x 加上 10^−k。图的横轴是 k，纵轴是模拟得到的预报期限；白线是对你算过的点做最小二乘直线拟合，绿色虚线是斜率 ln10/λ 的参考线（截距与白线相同，只比较斜率）。',
    s4lgPts: '模拟得到的预报期限', s4lgFit: '对这些点的直线拟合', s4lgTheory: '斜率 ln10/λ = 2.54 的参考线',
    c4a: '预报期限 t 对测准位数 k',
    allDigits: '把 k = 2…14 都算一遍', clearPts: '清空点',
    s4readout: 'k = {k}：起点相差 10^−{k}，在 t = {h} 首次相距超过 1。已算 {n} 个点，拟合斜率：每多一位数字，期限多约 {sl} 个时间单位；理论值 ln10/λ = {th}。',
    s4one: 'k = {k}：起点相差 10^−{k}，在 t = {h} 首次相距超过 1。再算一个点就能拟合斜率。',
    s4hint: '观察顺序：按「把 k = 2…14 都算一遍」，点大致排成一条直线，但上下有起伏（差距的增长率沿轨迹忽快忽慢）；看拟合斜率和 2.54 有多接近。把起点测准 12 位（比 2 位精确一百亿倍）也只多出二十多个时间单位。',

    s5k: '第 5 步 · 三颗星',
    s5t: '三颗同样重的星互相吸引，未来能算多远？',
    s5e: '这一步要回答：两颗星互相绕转时轨道是椭圆，可以一直准确预言（<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step2">→ 引力与轨道第 2 步：轨道为什么在两个半径之间来回</a>）；第三颗星加进来会怎样？这就是<strong>三体问题</strong>：没有一般的公式解，只能数值积分。这里三颗星质量相同，取引力常量和质量都为 1，在平面上运动。起点用 Chenciner 与 Montgomery（2000）找到的<strong>8 字形轨道</strong>（初值取 8 位小数）：三颗星沿同一条 8 字形曲线互相追逐。滑杆 ε 把中间那颗星往右推一点。每次同时算两次：一次从 ε 出发，一次从 ε + 10⁻⁸ 出发（下文叫「双胞胎运行」，在上图用灰色虚线画出）。积分用自适应步长的 RK4：平时步长 0.002，两星靠得很近时自动缩小；两星距离小于约 0.01 时引力做了软化（距离² 加上 0.01²），这是模型设定。能量在真实运动中守恒，所以读数里的「能量漂移」可以检验数值误差。下图是两次运行的最大坐标差（对数刻度）对时间。',
    s5lg1: '星 1', s5lg2: '星 2', s5lg3: '星 3（中间那颗）', s5lgTwin: '双胞胎运行（起点多推 10⁻⁸）', s5lgGap: '两次运行的差（对数刻度）',
    c5a: '三颗星的轨迹（坐标 −2…2 的方框）', c5b: 'log₁₀(两次运行之差) 对时间 t',
    s5readout: 'ε = {e}：t = {t}。三颗星离中心最远 {rmax}，至今最近两星相距 {rmin}。此刻两次运行相差 {gap}；{split} 能量相对漂移 {drift}（越小说明数值积分越可信）。{off}',
    gapAt: '在 t = {ts} 首次相差超过 0.1。', gapNone: '到 t = 60 都没有相差超过 0.1。', off: '有星已飞出画面。',
    s5hint: '观察顺序：先在 ε = 0 按「播放」：三颗星沿 8 字形追逐，双胞胎运行和它重合，下图的差一直很小。把 ε 拖到 0.1 再播放：轨道变胖但仍是 8 字形，这个轨道对小扰动是稳定的。再拖到 0.2：三颗星近距离交会、轨道乱成一团，下图的差在几十个时间单位里涨到 0.1 以上，有时一颗星还会被甩向远处。',

    s6k: '第 6 步 · 收束',
    s6t: '确定，却不可预报',
    s6fin: '<strong>回顾。</strong>混沌不是规则里有随机性，而是规则把起点上的微小差别按指数放大。李雅普诺夫指数 λ 给出放大的速度；计算机的舍入、测量的误差都是这样的「一丝」，所以混沌系统的长时间模拟只是许多可能结果之一。预报期限只随测准的位数线性增长：多一位数字只多 ln10/λ 的时间。三体问题里，8 字形这样的稳定轨道也存在，但稍大的扰动就把三颗星推进混沌。',
    formula: '|Δ(t)| ≈ |Δ(0)|·e^(λt)\n预报期限 ≈ ln(容差 / |Δ(0)|) / λ\n每多测准一位数字 → 多 ln10 / λ',
    boundary: '适用范围：e^(λt) 的增长只在差距还很小时成立，差距长到吸引子的尺寸就饱和；λ 是长时间平均，局部增长忽快忽慢。本页的数值都是模拟：逻辑斯谛映射与洛伦兹方程用双精度计算，洛伦兹和三体用 RK4 积分，三体在极近距离做了引力软化；真实天气与真实星系还有更多变量和噪声。',
    linksTitle: '接着去哪儿',
    lk1: '→ 指数与对数第 0 步：按倍数增长为什么快得吓人',
    lk2: '→ 常微分方程相图第 1 步：把时间藏起来，看轨线的形状',
    lk3: '→ 牛顿法第 4 步：起点落在哪个「盆地」就去哪个根',
    lk4: '→ 引力与轨道第 2 步：两体轨道为什么规规矩矩',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《混沌与三体 · 初始差一丝，结果天壤》的平行版本。'
  },
  en: {
    pageTitle: 'Chaos and Three Bodies · Fixed Rules, Short Forecasts',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Chaos and the Three-Body Problem · Tiny Differences, Huge Outcomes →',
    navLabel: 'Chaos and three-body steps',
    tagline: 'No dice, no noise, the rules written down to the last symbol — and yet after a few dozen steps the outcome is beyond prediction. In six steps you will measure how fast a tiny difference grows, watch a computer’s own rounding split a calculation in two, work out how much further each extra digit of precision lets you see, and finally send three stars on separate paths under one set of rules.',
    nav0: '0 A hair apart', nav1: '1 Growth rate λ', nav2: '2 Rounding is a hair too', nav3: '3 Lorenz', nav4: '4 Forecast horizon', nav5: '5 Three stars', nav6: '6 Wrap-up',
    rLabel: 'Parameter r', kLabel: 'Starts differ by δ = 10^−k, k =', rhoLabel: 'Parameter ρ', digitsLabel: 'Digits of the start known, k (difference 10^−k)', epsLabel: 'Sideways nudge ε of the middle star',
    play: '▶ Play', pause: '⏸ Pause', showAll: 'Show the whole run',

    s0k: 'Step 0 · A hair apart',
    s0t: 'Same rule, almost the same start: how far apart can the results end up?',
    s0e: 'The question for this step: when a rule is completely fixed, what becomes of a tiny difference in the starting point after a number of steps? Experiment with the simplest rule there is, the <strong>logistic map</strong> xₙ₊₁ = r·xₙ(1 − xₙ), with x between 0 and 1 and r a fixed parameter. Once x₀ is given, every step is settled exactly; such a system is called <strong>deterministic</strong>. Run it for 60 steps from x₀ = 0.4 and from x₀ = 0.4 + δ side by side. The top chart has step number n across and xₙ up the side. The bottom chart shows the size of the difference |Δₙ| on a base-10 logarithmic scale (each gridline is ten times the one below); the pink dashed line is 0.1, which we take to mean “completely different”. On a log scale, growth by a fixed factor per step (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ Exponents and logarithms, step 0: growing by multiplication</a>) is a straight line.',
    s0lgA: 'Start 0.4', s0lgB: 'Start 0.4 + δ', s0lgD: 'Difference |Δₙ| (log scale)', s0lgTol: '0.1: counts as completely different',
    c0a: 'xₙ vs step n', c0b: 'log₁₀|Δₙ| vs step n',
    s0readout: 'r = {r}, starts differing by δ = {d}: at step {n} the two sequences first differ by more than 0.1. Going from {d} to 0.1, the gap grew by a factor of {g} per step on average.',
    s0none: 'r = {r}, starts differing by δ = {d}: within 60 steps the sequences never differ by 0.1 (at step 60 they differ by {dd}).',
    s0hint: 'What to watch: keep r = 3.9 and drag k from 2 to 12. The starting gap shrinks by ten orders of magnitude, yet the straight line in the bottom chart just slides down, and the split comes only a few dozen steps later. Then drag r to about 3.2: the two sequences soon merge into the same back-and-forth and the gap in the bottom chart keeps falling.',

    s1k: 'Step 1 · The growth rate λ',
    s1t: 'Can one number say how fast the gap grows?',
    s1e: 'The question for this step: can you get the steepness of that straight line without running two simulations? While the gap is tiny, one step multiplies it by the slope of the rule at that point, |f′(x)| = |r(1 − 2x)|. Average ln|f′(x)| over a long run and you get the <strong>Lyapunov exponent</strong> λ: on average the gap is multiplied by e^λ each step. When λ > 0 small gaps grow exponentially — that is <strong>chaos</strong>, sensitive dependence on the start; when λ < 0 gaps shrink and the system settles into a repeating pattern. Here the first 300 steps are discarded and the next 3000 averaged. The top chart is a <strong>bifurcation diagram</strong>: r across, and up the side the 128 long-run values of x after 500 steps are thrown away. One dot means x settles on a single value, two dots mean it alternates between two, and a smear means it never repeats. The bottom chart shows λ(r) on the same horizontal axis.',
    s1lgBif: 'Long-run values of x (bifurcation diagram)', s1lgLam: 'Lyapunov exponent λ(r)', s1lgNow: 'Current r',
    c1a: 'Bifurcation diagram: long-run x vs r', c1b: 'λ vs r (above 0 = chaos)',
    s1chaos: 'r = {r}: λ = {lam}, so the gap is multiplied by {mult} per step on average; the long run never repeats (chaos). From λ, starts 10⁻¹⁰ apart should take about {pred} steps to differ by 0.1; the simulation takes {sim}.',
    s1reg: 'r = {r}: λ = {lam} ≤ 0, so the gap is multiplied by {mult} per step and keeps shrinking; the long run cycles through {p} values.',
    s1regNoP: 'r = {r}: λ = {lam}, close to 0; this is near the border between the two behaviours, and the long-run values do not repeat within 32 steps yet.',
    s1hint: 'What to watch: drag r rightward from 2.8. In the bifurcation diagram one line splits into 2, then 4, then 8…, while λ in the bottom chart touches 0 at each split and drops back. Beyond about r = 3.57 λ is mostly above 0 and the diagram smears out. Then move slowly near 3.83: three sharp lines suddenly appear inside the smear and λ dips below 0 — a “periodic window” inside chaos.',

    s2k: 'Step 2 · Rounding is a hair too',
    s2t: 'Identical start, but a computer with different precision: same result?',
    s2e: 'The question for this step: if the start is exactly the same, can the arithmetic itself create that hair’s-breadth difference? Computers keep only so many digits: the usual 64-bit floating-point numbers hold about 16 significant digits, 32-bit ones about 7. Every multiplication is rounded to what can be stored, and one 32-bit rounding near 0.5 is off by about 3×10⁻⁸. Both sequences in the chart use the same start 0.4 and the same rule; one stores each step in 64 bits, the other in 32 bits. The bottom chart shows their difference on a log scale; the green dashed line starts at 3×10⁻⁸ and is multiplied by e^λ each step, using λ from the last step — the growth theory predicts.',
    s2lg64: '64-bit floats (about 16 significant digits)', s2lg32: '32-bit floats (about 7 significant digits)', s2lgD: 'Their difference (log scale)', s2lgPred: '3×10⁻⁸ grown at rate λ',
    c2a: 'xₙ vs step n (same start 0.4)', c2b: 'log₁₀|64-bit − 32-bit| vs step n',
    s2readout: 'r = {r}: λ = {lam}. At step {n} the two precisions first differ by more than 0.1; from λ, growing from 3×10⁻⁸ to 0.1 should take about {pred} steps.',
    s2trans: 'r = {r}: λ = {lam}, near zero or negative, so on average gaps barely grow in the long run; but starting from 0.4 the sequence wanders irregularly for a long stretch first, and during that stretch the rounding gap still grows — by step {n} the two precisions differ by more than 0.1. Estimating the split from λ does not work here.',
    s2none: 'r = {r}: λ = {lam} ≤ 0, so rounding errors are not amplified; within 80 steps the two precisions never differ by 0.1 (largest difference {dd}).',
    s2hint: 'What to watch: start at r = 4. For the first dozen or so steps the two lines look identical, then around step twenty they suddenly go their own ways, and the gap in the bottom chart climbs along the green dashed line. Then drag r to 3.5: the gap stays tiny and never grows. In a chaotic system a long simulation is one of many possible outcomes, not the single correct answer.',

    s3k: 'Step 3 · Lorenz',
    s3t: 'Does a system that changes smoothly in time behave the same way?',
    s3e: 'The question for this step: the rule above jumps in steps; can a system that changes continuously in time also be sensitive to its start? In 1963 Edward Lorenz boiled a model of atmospheric convection down to three equations: dx/dt = σ(y − x), dy/dt = x(ρ − z) − y, dz/dt = xy − βz. Here x, y and z describe the state of the convection, σ = 10 and β = 8/3 are fixed, and ρ roughly measures how strongly the layer is heated from below. The page integrates step by step with the fourth-order Runge–Kutta method (RK4) at a step of 0.005, starting from (1, 1, 1) and (1 + δ, 1, 1) together. The top chart leaves time out and draws only the path traced by (x, z) — a <strong>phase portrait</strong> (<a class="xlink" href="../../../math/calculus/ode-phase-portraits/#step1">→ ODE phase portraits, step 1: hide time and look at the path</a>); the shape the path is drawn onto and then keeps moving on is an <strong>attractor</strong>. The bottom chart shows the distance between the two runs (log scale) against time. For σ = 10 and β = 8/3 the standard thresholds are: for ρ < 1 everything returns to the origin; for 1 < ρ < 24.06 it ends up on one of two fixed points (above about 13.93 the path may wander chaotically for a while first — at ρ = 24 it has not settled after 50 time units); between 24.06 and 24.74 whether it settles or keeps wandering depends on the start; above 24.74 it is chaotic.',
    s3lgA: 'Starting from (1, 1, 1)', s3lgB: 'Starting from (1 + δ, 1, 1)', s3lgSep: 'Distance between the runs (log scale)', s3lgSlope: 'Reference slope λ ≈ 0.906 (the accepted value for ρ = 28; drawn through the first point above 1, so only slopes are compared)',
    c3a: 'Phase portrait: z vs x', c3b: 'log₁₀(distance) vs time t',
    s3readout: 'ρ = {rho} ({regime}): t = {t}, the runs are {sep} apart. {split}',
    rgOrigin: 'returns to the origin and stops', rgSteady: 'ends up on a fixed point', rgMixed: 'border zone: settling or wandering depends on the start', rgChaos: 'chaotic, flipping irregularly between two “wings”',
    splitAt: 'They first get more than 1 apart at t = {ts}.', splitNone: 'They are still less than 1 apart at t = 50.',
    s3hint: 'What to watch: at ρ = 28 press “Play”. The two paths trace the butterfly-shaped attractor, lying on top of each other at first; after about t = 25 the orange one suddenly jumps to the other wing, and in the bottom chart the distance first hardly changes, then climbs roughly parallel to the green reference line. Then drag ρ to 20: the path circles a few times and settles on a point, and the distance falls all the way down. Playing keeps the path drawn so far.',

    s4k: 'Step 4 · The forecast horizon',
    s4t: 'Measure the start one digit more precisely: how much further can you see?',
    s4e: 'The question for this step: if the gap grows like e^(λt) and the start is known to 10^−k, how long can you forecast reliably? Call the moment the two runs first get more than 1 apart the <strong>forecast horizon</strong>. A gap growing like e^(λt) from 10^−k reaches 1 after t ≈ k·ln10/λ, so each extra digit of precision adds only ln10/λ ≈ 2.54 time units (λ ≈ 0.906). This step uses a fixed start on the ρ = 28 attractor (run from (1, 1, 1) for 20 time units first) and adds 10^−k to x. The chart has k across and the simulated horizon up the side; the white line is a least-squares straight-line fit to the points you have computed, and the green dashed line has slope ln10/λ (same intercept as the white line, so only the slopes are compared).',
    s4lgPts: 'Simulated forecast horizon', s4lgFit: 'Straight-line fit to the points', s4lgTheory: 'Reference slope ln10/λ = 2.54',
    c4a: 'Forecast horizon t vs digits k',
    allDigits: 'Compute k = 2…14', clearPts: 'Clear points',
    s4readout: 'k = {k}: starts 10^−{k} apart first get more than 1 apart at t = {h}. With {n} points, the fitted slope says each extra digit buys about {sl} time units; theory gives ln10/λ = {th}.',
    s4one: 'k = {k}: starts 10^−{k} apart first get more than 1 apart at t = {h}. One more point and a slope can be fitted.',
    s4hint: 'What to watch: press “Compute k = 2…14”. The points roughly line up but wobble (the growth rate speeds up and slows down along the path); compare the fitted slope with 2.54. Knowing the start to 12 digits rather than 2 — ten billion times more precisely — buys only twenty-odd more time units.',

    s5k: 'Step 5 · Three stars',
    s5t: 'Three equal stars pulling on each other: how far ahead can we compute?',
    s5e: 'The question for this step: two stars circling each other follow ellipses that can be predicted indefinitely (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step2">→ Gravity and orbits, step 2: why an orbit swings between two radii</a>). What happens when a third joins in? That is the <strong>three-body problem</strong>: there is no general formula, only numerical integration. Here the three stars have equal mass, the gravitational constant and masses are set to 1, and everything moves in a plane. The start is the <strong>figure-eight orbit</strong> found by Chenciner and Montgomery (2000), with initial values to 8 decimals: the three stars chase each other round one figure-eight curve. The slider ε pushes the middle star a little to the right. Each setting is computed twice: once from ε and once from ε + 10⁻⁸ (the “twin run”, drawn as grey dashes in the top chart). Integration is RK4 with an adaptive step — 0.002 normally, shrinking automatically during close passes — and gravity is softened when two stars come within about 0.01 (distance² plus 0.01²), a modelling choice. Energy is conserved in the real motion, so the “energy drift” in the readout checks the numerical error. The bottom chart shows the largest coordinate difference between the two runs (log scale) against time.',
    s5lg1: 'Star 1', s5lg2: 'Star 2', s5lg3: 'Star 3 (the middle one)', s5lgTwin: 'Twin run (start pushed a further 10⁻⁸)', s5lgGap: 'Difference between the runs (log scale)',
    c5a: 'Paths of the three stars (box from −2 to 2)', c5b: 'log₁₀(difference between runs) vs time t',
    s5readout: 'ε = {e}: t = {t}. Farthest any star has been from the centre: {rmax}; closest two stars have come: {rmin}. Right now the runs differ by {gap}; {split} Relative energy drift {drift} (smaller means the integration is more trustworthy). {off}',
    gapAt: 'they first differed by more than 0.1 at t = {ts}.', gapNone: 'they still differ by less than 0.1 at t = 60.', off: 'A star has left the picture.',
    s5hint: 'What to watch: at ε = 0 press “Play”. The three stars chase round the figure-eight, the twin run sits on top of them, and the difference below stays tiny. Set ε to 0.1 and play again: the orbit fattens but stays a figure-eight — this orbit is stable against small nudges. Now try 0.2: the stars make close passes, the orbit turns into a tangle, the difference grows past 0.1 within a few dozen time units, and sometimes a star is flung far away.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Deterministic, yet unpredictable',
    s6fin: '<strong>Looking back.</strong> Chaos is not randomness hidden in the rules; it is rules that blow up tiny differences in the start exponentially. The Lyapunov exponent λ says how fast. A computer’s rounding and a measurement’s error are both such hairs, so a long simulation of a chaotic system is one possible outcome among many. The forecast horizon grows only in proportion to the number of digits you know: each digit adds ln10/λ of time. In the three-body problem stable orbits like the figure-eight exist, but a bigger nudge sends the three stars into chaos.',
    formula: '|Δ(t)| ≈ |Δ(0)|·e^(λt)\nhorizon ≈ ln(tolerance / |Δ(0)|) / λ\none more digit known → ln10 / λ more time',
    boundary: 'Where this holds: growth like e^(λt) applies only while the gap is small; once it reaches the size of the attractor it saturates, and λ is a long-run average, with local growth faster and slower. Everything on this page is simulated: the logistic map and Lorenz equations in double precision, Lorenz and three bodies integrated with RK4, and the three-body gravity softened at very close range. Real weather and real star systems have many more variables and noise.',
    linksTitle: 'Where to go next',
    lk1: '→ Exponents and logarithms, step 0: why growth by multiplication is so startling',
    lk2: '→ ODE phase portraits, step 1: hide time and look at the shape of the path',
    lk3: '→ Newton’s method, step 4: which root you reach depends on the “basin” you start in',
    lk4: '→ Gravity and orbits, step 2: why two-body orbits are so well behaved',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Chaos and the Three-Body Problem · Tiny Differences, Huge Outcomes”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key] !== undefined) ? STRINGS[lang][key] : (STRINGS.en[key] !== undefined ? STRINGS.en[key] : key);
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
  if (typeof window.refreshChaos === 'function') window.refreshChaos();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CHAOS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
