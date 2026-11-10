'use strict';
// Frequency-response lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const SYMBOLS = {
  formula: 'H_LP(f) = 1 / (1 + j·f/f_c)\nH_HP(f) = (j·f/f_c) / (1 + j·f/f_c)\nH_BP(f) = (j·f/(f₀Q)) / (1 − (f/f₀)² + j·f/(f₀Q))\ndB = 20·log₁₀|H|',
  s4lgG: '|H(f)|'
};

const STRINGS = {
  zh: {
    ...SYMBOLS,
    pageTitle: '频率响应与滤波 · 给每个频率打分',
    back: '← 知识索引',
    compare: '对照另一版本：频率响应与滤波 · 按频率挑食的盒子 →',
    navLabel: '频率响应步骤导航',
    tagline: '一个电阻加一个电容，就能让低音通过、把高音挡住。它到底对每个频率做了什么？本页把电路方程一小步一小步地数值积分，给它喂一个个纯正弦，量出两样东西：振幅剩下几成、波形迟到多久。这两条曲线就是频率响应。有了它，你能读懂波特图，看懂相位为什么会让波形变样，最后亲手设计一个满足指标的滤波器并上台实测。',
    nav0: '0 逐个频率量', nav1: '1 波特图', nav2: '2 相位与形状', nav3: '3 截止与阶数', nav4: '4 高通与带通', nav5: '5 按指标设计', nav6: '6 收束',
    pass: '达标 ✓', fail: '未达标 ✗',

    s0k: '第 0 步 · 实测',
    s0t: '一个 RC 电路，对每个频率各放行多少？',
    s0e: '这一步要回答：一个 RC 低通电路，对不同频率的正弦各放行多少、各拖后多久？电路是电阻 R = 1.59 kΩ 串联电容 C = 100 nF，输出取电容两端的电压。电容充放电需要时间，乘积 RC ≈ 0.159 ms 叫<strong>时间常数</strong>。这里不套公式：把电路方程 dy/dt = (x − y)/RC 从静止开始一小步一小步地数值积分（RK4 方法），等开头的过渡消失后，拟合出输出正弦的振幅和位置。<strong>增益</strong> = 输出振幅 ÷ 输入振幅（1 表示原样通过，0 表示完全挡住）；<strong>迟到</strong> Δt = 输出波峰比输入波峰晚到的时间。频率 f 的单位 Hz 表示每秒振动几次。能这样逐个频率描述电路，是因为它是线性时不变系统：正弦进去，出来仍是同频率的正弦（<a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ 冲激与 LTI 页第 2 步：线性时不变系统由冲激响应完全决定</a>）。',
    f0: '输入频率 f', sweep0: '从 50 Hz 扫到 20 kHz', clear0: '清除记录',
    c0a: '稳态的两个周期：输入（灰）与输出（青），横轴 t/T', c0b: '实测增益 vs 频率（线性横轴，kHz）',
    s0lgIn: '输入正弦', s0lgOut: '电路输出', s0lgPeak: '对应的两个波峰（量迟到）', s0lgDot: '测过的频率',
    s0readout: 'f = {f}：实测增益 {g}（输出振幅剩 {pct}%），迟到 Δt = {lag}，相当于相位落后 {deg}°（一个周期是 360°）。已测 {n} 个频率。',
    s0hint: '观察顺序：先把 f 拖到最左（50 Hz），上图输出几乎和输入重合；再慢慢往右拖，输出越来越矮，波峰也越来越往右错开。下图记下每个测过的频率。按「扫一遍」自动测完全部 53 个频率：曲线在 1 kHz 以下大致是平的，以上一路下滑。可在线性横轴上，50 Hz 到 1 kHz 挤在最左边一小段，看不清下滑是怎样开始的——下一步换一种坐标。',

    s1k: '第 1 步 · 换坐标',
    s1t: '换成对数坐标，整条曲线为什么只剩两条直线？',
    s1e: '这一步要回答：怎样一眼读出滤波器从哪个频率开始起作用、之后衰减得多快？换两种刻度。横轴用<strong>对数频率</strong>：每往右一大格，频率乘 10，这叫一个<strong>十倍频程</strong>。纵轴用<strong>分贝</strong>：dB = 20·log₁₀(增益)，增益 1 是 0 dB，0.707 约为 −3 dB，0.1 是 −20 dB，0.01 是 −40 dB。这样画出的增益图和相位图合称<strong>波特图</strong>。对 RC 低通，电路方程给出 H(f) = 1 / (1 + j·f/f_c)，j 是虚数单位，<strong>截止频率</strong> f_c = 1/(2πRC)。复数 H 的大小 |H| 就是上一步实测的增益，角度 ∠H 是相位（负值表示落后）。远低于 f_c 时 |H| ≈ 1，是 0 dB 的水平线；远高于 f_c 时 |H| ≈ f_c/f，是每十倍频程降 20 dB 的斜线。这两条<strong>渐近线</strong>（虚线）正好交于 f_c。',
    fc1: '截止频率 f_c（相当于改变 R·C）', p1: '探测频率 f',
    c1a: '增益（dB）vs 频率（对数横轴，Hz）', c1b: '相位（度）vs 频率（对数横轴，Hz）',
    s1lgG: '|H| 曲线', s1lgAsym: '两条渐近线', s1lgProbe: '探测点', s1lgFc: '截止频率 f_c',
    s1readout: 'f_c = {fc}，探测 f = {f}（f/f_c = {ratio}）：|H| = {g}，即 {db} dB，相位 {ph}°。f_c 处恒为 {dbc} dB、{phc}°；从 10·f_c 到 100·f_c 下降 {slope} dB。',
    s1hint: '观察顺序：先只拖探测频率 f，停在 f_c 上：读数正好是 −3.01 dB、−45°，两条虚线在这里相交，真曲线比交点低 3 dB。再往右走一个十倍频程，增益约低 20 dB，相位趋近 −90°；往左走一个十倍频程，只剩 −0.04 dB、−5.7°。然后只拖 f_c：整条曲线左右平移、形状不变，因为 |H| 只取决于比值 f/f_c。',

    s2k: '第 2 步 · 相位',
    s2t: '增益合适还不够：相位为什么会让波形变样？',
    s2e: '这一步要回答：同一个 RC 低通（f_c = 1 kHz），输入换成两个频率叠成的波形 sin(2πf₁t) + ⅓·sin(2π·3f₁t)（方波的前两项），输出的形状还像输入吗？相位可以换算成<strong>迟到时间</strong>：Δt = −相位 ÷ (360°·f)，即这个频率的波峰晚到几秒。两个成分各有自己的增益和迟到。假如两者迟到一样，输出只是整体推迟、各自按增益缩放——虚线画的就是这种「两个成分都迟到 Δt₁」的参照。青线是电路真实的输出（同样由数值积分得到）。两线之差完全来自两个成分迟到不同，用<strong>形变量</strong>衡量：两线之差的均方根 ÷ 青线的均方根（均方根：先平方、再平均、再开方，衡量起伏有多大）。',
    f2: '基频 f₁',
    c2a: '两个基频周期：输入、输出与等迟到参照', c2b: '迟到时间 Δt（ms）vs 频率（对数横轴，Hz）',
    s2lgIn: '输入', s2lgOut: '电路输出', s2lgRef: '参照：两成分迟到相同', s2lgD1: '基频 f₁ 的迟到', s2lgD3: '3f₁ 的迟到',
    s2readout: 'f₁ = {f}：基频迟到 {d1}，3f₁ 迟到 {d3}（相差 {dd}）；增益分别为 {g1} 和 {g3}；形变量 {mis}%。',
    s2hint: '观察顺序：从 f₁ = 50 Hz 开始，下图两点都在曲线最左边的平台上，迟到都约为 RC = 0.159 ms，青线与虚线重合（形变量不到 0.1%）：低频成分整体推迟同样的时间，形状不变。向右拖 f₁，两点滑上曲线的下坡，3f₁ 先下坡、迟到变短，青线与虚线分开；f₁ = 1 kHz 时形变量约 16%。结论：要保住波形，不仅增益要合适，所有频率的迟到时间也要一样。',

    s3k: '第 3 步 · 截止与阶数',
    s3t: '想留下 200 Hz、去掉 5 kHz 嘶声，截止频率和阶数怎么选？',
    s3e: '这一步要回答：一段 200 Hz 的乐音（振幅 1）混着 5 kHz 的嘶声（振幅 0.5），用 RC 低通能把两者分开到什么程度？任何信号都能拆成不同频率的正弦（<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶页第 5 步：频谱</a>），而低通对每个正弦按各自的增益处理。可调两样：截止频率 f_c；以及<strong>阶数</strong> n——把 n 个相同的 RC 节串起来，节与节之间加缓冲放大器，互不影响，总增益就是单节增益的 n 次方，高于 f_c 后每十倍频程下降 20·n dB。衡量两件事：<strong>乐音损失</strong> = 200 Hz 处的增益（dB，越接近 0 越好）；<strong>选择性</strong> = 乐音增益 − 嘶声增益（dB，越大说明嘶声相对乐音被压得越低）。两个数都来自对电路方程的数值积分与拟合。',
    fc3: '截止频率 f_c', n3: '阶数 n（串联节数）',
    c3a: '输入（灰）、输出（青）、纯净乐音（虚线），横轴 ms', c3b: '增益（dB）vs 频率：橙 = 200 Hz，粉 = 5 kHz',
    s3lgIn: '混合输入', s3lgOut: '滤波输出', s3lgClean: '纯净的 200 Hz 乐音', s3lgWant: '200 Hz 乐音处', s3lgHiss: '5 kHz 嘶声处',
    s3readout: 'n = {n}，f_c = {fc}：乐音 {gw} dB，嘶声 {gh} dB，选择性 {sel} dB；高于 f_c 的斜率 {slope} dB/十倍频程。',
    s3hint: '观察顺序：先保持 n = 1，把 f_c 从高往低拖：青线上的细密毛刺变少，但 f_c 接近 200 Hz 时，乐音本身也被压矮、向右错开。再把 n 加到 4：斜线变陡（约 −20·n dB/十倍频程），同样的 f_c 下嘶声被压得多得多。如果规定乐音最多损失 1 dB，一阶最多把嘶声压低约 22 dB，二阶约 38 dB，四阶约 63 dB——阶数换来的是更陡的边。',

    s4k: '第 4 步 · 换个接法',
    s4t: '同一套数学换个接法：高通、带通与共振',
    s4e: '这一步要回答：把电阻和电容对调，或者再加一个电感，频率响应会变成什么样？<strong>高通</strong>：输出改取电阻两端，H = (j·f/f_c)/(1 + j·f/f_c)，低频被挡、高频通过，相位从 +90° 降到 0°（输出领先输入）。<strong>带通</strong>：电阻、电感、电容串联（RLC），输出取电阻两端，只在<strong>中心频率</strong> f₀ = 1/(2π√(LC)) 附近放行；在 f₀ 处电感和电容的作用正好抵消，电路发生<strong>共振</strong>（<a class="xlink" href="../../../physics/waves/resonance/#step3">→ 共振页第 3 步：振子在共振频率附近的响应</a>）。带通有多尖，用<strong>品质因数</strong> Q 描述：Q = f₀ ÷ 带宽；<strong>带宽</strong>是增益不低于峰值 −3 dB 的那段频率宽度。这里 f_c 与 f₀ 都取 1 kHz。带宽由程序在曲线上二分查找 −3 dB 点得到，再反推 Q，和你设定的 Q 对账。',
    kindLP: '低通（RC）', kindHP: '高通（CR）', kindBP: '带通（RLC）', Q4: '品质因数 Q（只对带通有效）',
    c4a: '增益（dB）vs 频率（对数横轴，Hz）', c4b: '相位（度）vs 频率（对数横轴，Hz）',
    s4lgBand: '−3 dB 带宽', s4lgRef: '截止/中心频率 1 kHz',
    s4lp: '低通：1 kHz 处 {db} dB、{ph}°；10 kHz 处 {db10} dB。',
    s4hp: '高通：1 kHz 处 {db} dB、{ph}°；100 Hz 处 {db01} dB。',
    s4bp: '带通 Q = {Q}：峰值 {peak} dB 在 1 kHz，相位 0°；−3 dB 点在 {lo} 与 {hi}，带宽 {bw}，反推 Q = f₀/带宽 = {Qm}。',
    s4hint: '观察顺序：先按「低通」再按「高通」：两条增益曲线互为镜像，都在 1 kHz 处为 −3 dB；相位一个从 0° 落到 −90°，一个从 +90° 落到 0°。再按「带通」，把 Q 从 0.5 拖到 10：峰越来越尖，阴影标出的带宽从 2 kHz 缩到 100 Hz，反推的 Q 始终等于设定值；相位在 1 kHz 处穿过 0°，Q 越大翻得越急。注意两个 −3 dB 点在线性频率上并不对称地落在 1 kHz 两侧，在对数横轴上才对称：两点的乘积正好是 f₀²。',

    s5k: '第 5 步 · 按指标设计',
    s5t: '设计挑战：留住 1 kHz，挡住 50 Hz 嗡声和 10 kHz 尖啸',
    s5e: '这一步要回答：用 n 个高通节和 n 个低通节串成带通，能否同时满足三条指标？① 通带：1 kHz 的增益不低于 −1 dB；② 50 Hz 电源嗡声至少压低 20 dB（增益 ≤ −20 dB）；③ 10 kHz 尖啸也至少压低 20 dB。可调：高通截止 f_L、低通截止 f_H、阶数 n（高通、低通各 n 节）。图上的粉色竖条是三个考核频率处曲线不许进入的区域。低频一侧和高频一侧的边越陡越好办，可每多一节，1 kHz 处也多损失一点——这就是要权衡的地方。满足后按「上台实测」：把 50 Hz、1 kHz、10 kHz 三个正弦同时送进电路方程做数值积分，再从输出里分别拟合出三者的增益，和公式核对。',
    fL5: '高通截止 f_L', fH5: '低通截止 f_H', n5: '阶数 n（每侧节数）', bench5: '上台实测',
    c5a: '设计的增益（dB）vs 频率；粉色 = 指标禁区',
    s5lgG: '设计曲线', s5lgBan: '指标禁区', s5lgPt: '三个考核频率',
    spec1: '① 1 kHz 增益 ≥ −1 dB：当前 {v} dB，{ok}', spec2: '② 50 Hz 增益 ≤ −20 dB：当前 {v} dB，{ok}', spec3: '③ 10 kHz 增益 ≤ −20 dB：当前 {v} dB，{ok}',
    s5all: '三条全部达标：这是一个合格的设计。', s5notyet: '还有 {k} 条未达标。',
    s5bench: '实测（数值积分）：50 Hz {a} dB，1 kHz {b} dB，10 kHz {c} dB；与公式相差不超过 {e} dB。',
    s5benchWait: '调好后按「上台实测」。参数一改，旧的实测结果就作废清空。',
    s5hint: '观察顺序：先试 n = 1：无论怎么拖 f_L、f_H 都满足不了三条——要把 50 Hz 和 10 kHz 压够，两侧的边就得逼近 1 kHz，通带损失便超过 1 dB。换 n = 2：只有 f_H ≈ 3.31 kHz、f_L 在 151–166 Hz 的一小块能过，滑杆上仅 3 个组合。n = 3、4 时合格区域宽得多。合格后按「上台实测」，看数值积分的结果是否与公式一致。',

    s6k: '第 6 步 · 收束',
    s6t: '两条曲线，说尽一个线性滤波器',
    s6fin: '<strong>第 0 步</strong>：给 RC 电路逐个喂正弦，量出增益和迟到；把它们对所有频率画出来，就是频率响应。<strong>第 1 步</strong>：对数频率加分贝，让 RC 低通变成两条渐近线，交于 f_c；真曲线在那里低 3 dB、相位 −45°。<strong>第 2 步</strong>：各频率迟到不同，即使增益合适，波形也会变样。<strong>第 3 步</strong>：截止频率决定在哪里下刀，阶数决定刀有多陡。<strong>第 4 步</strong>：高通、带通是同一种复数比值换了接法，带通的 Q = f₀/带宽。<strong>第 5 步</strong>：指标是三条不等式，阶数是代价，实测与公式对上才算验收。',
    boundary: '适用范围：本页是理想元件组成的连续时间线性电路，增益与输入振幅无关。多节串联假设节间有理想缓冲、互不加载；直接相连时，总响应不等于单节的 n 次方。「实测」是对电路方程的数值积分（RK4，从静止开始，等过至少 40 个最慢时间常数后再拟合），不是真实仪器测量；它与公式的相对差异来自数值误差，在 10⁻⁴ 以下。频率响应只描述稳态正弦；开头的过渡过程要看冲激响应或阶跃响应。第 5 步只考核三个频率点，真实设计还要看整个频带。',
    linksTitle: '接着去哪',
    lk1: '→ 冲激与 LTI 页第 2 步：冲激响应 h 是线性时不变系统的完整档案',
    lk2: '→ 共振页第 3 步：振子在共振频率附近怎样响应',
    lk3: '→ 采样页第 6 步：采样之前，先用低通抹掉高频',
    lk4: '→ 拉普拉斯页第 4 步：极点位置决定系统的性格',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《频率响应与滤波 · 按频率挑食的盒子》的平行版本。'
  },
  en: {
    ...SYMBOLS,
    pageTitle: 'Frequency Response & Filters · Grading Every Frequency',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Frequency Response & Filters · A Box That Eats by Frequency →',
    navLabel: 'Frequency-response lesson steps',
    tagline: 'One resistor and one capacitor are enough to let the bass through and hold the treble back. What exactly does that circuit do to each frequency? This page integrates the circuit equation in small numerical steps, feeds it one pure sine at a time and measures two things: how much of the amplitude survives, and how late the wave arrives. Those two curves are the frequency response. With them you can read a Bode plot, see why phase reshapes a waveform, and finally design a filter to spec and put it on the bench.',
    nav0: '0 Measure', nav1: '1 Bode plot', nav2: '2 Phase & shape', nav3: '3 Cutoff & order', nav4: '4 High & band', nav5: '5 Design to spec', nav6: '6 Wrap-up',
    pass: 'met ✓', fail: 'missed ✗',

    s0k: 'Step 0 · Measurement',
    s0t: 'How much of each frequency does an RC circuit let through?',
    s0e: 'This step asks: for an RC low-pass circuit, how much of a sine gets through at each frequency, and how late does it come out? The circuit is a resistor R = 1.59 kΩ in series with a capacitor C = 100 nF, with the output taken across the capacitor. Charging the capacitor takes time; the product RC ≈ 0.159 ms is the <strong>time constant</strong>. No formula here: the circuit equation dy/dt = (x − y)/RC is integrated numerically from rest in small steps (the RK4 method), and once the start-up transient has died away a sine is fitted to the output to find its size and position. <strong>Gain</strong> = output amplitude ÷ input amplitude (1 means passed untouched, 0 means fully blocked); <strong>lag</strong> Δt = how much later the output’s peak arrives than the input’s. Frequency f is in Hz, oscillations per second. Describing the circuit one frequency at a time works because it is linear and time-invariant: a sine goes in, a sine of the same frequency comes out (<a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ Impulse & LTI, step 2: an LTI system is fixed by its impulse response</a>).',
    f0: 'Input frequency f', sweep0: 'Sweep 50 Hz → 20 kHz', clear0: 'Clear record',
    c0a: 'Two settled periods: input (grey), output (cyan); axis t/T', c0b: 'Measured gain vs frequency (linear axis, kHz)',
    s0lgIn: 'Input sine', s0lgOut: 'Circuit output', s0lgPeak: 'Matching peaks (measure the lag)', s0lgDot: 'Frequencies measured',
    s0readout: 'f = {f}: measured gain {g} ({pct}% of the amplitude survives), lag Δt = {lag}, i.e. a phase delay of {deg}° (one period is 360°). {n} frequencies measured.',
    s0hint: 'What to watch: drag f all the way left (50 Hz) — the output almost sits on the input. Ease it right: the output shrinks and its peak slides further to the right. The bottom chart keeps every frequency you measure. Press the sweep button to measure all 53 frequencies: the curve is roughly flat below 1 kHz and slides down above it. But on a linear axis, 50 Hz to 1 kHz is crammed into a sliver on the far left, so you can’t see how the fall begins — the next step changes the axes.',

    s1k: 'Step 1 · New axes',
    s1t: 'On log axes, why does the whole curve collapse to two straight lines?',
    s1e: 'This step asks: how can you read off at a glance where a filter starts to act and how fast it falls after that? Change both scales. Put frequency on a <strong>log axis</strong>: each major division to the right multiplies frequency by 10, a <strong>decade</strong>. Put gain in <strong>decibels</strong>: dB = 20·log₁₀(gain), so gain 1 is 0 dB, 0.707 is about −3 dB, 0.1 is −20 dB and 0.01 is −40 dB. Gain and phase drawn this way are together called a <strong>Bode plot</strong>. For the RC low-pass the circuit equation gives H(f) = 1 / (1 + j·f/f_c), where j is the imaginary unit and the <strong>cutoff frequency</strong> is f_c = 1/(2πRC). The size of the complex number, |H|, is the gain you measured in step 0; its angle ∠H is the phase (negative means behind). Far below f_c, |H| ≈ 1, a flat line at 0 dB; far above, |H| ≈ f_c/f, a line falling 20 dB per decade. These two <strong>asymptotes</strong> (dashed) meet exactly at f_c.',
    fc1: 'Cutoff f_c (same as changing R·C)', p1: 'Probe frequency f',
    c1a: 'Gain (dB) vs frequency (log axis, Hz)', c1b: 'Phase (degrees) vs frequency (log axis, Hz)',
    s1lgG: '|H| curve', s1lgAsym: 'The two asymptotes', s1lgProbe: 'Probe', s1lgFc: 'Cutoff f_c',
    s1readout: 'f_c = {fc}, probe f = {f} (f/f_c = {ratio}): |H| = {g}, i.e. {db} dB, phase {ph}°. At f_c it is always {dbc} dB and {phc}°; from 10·f_c to 100·f_c it drops {slope} dB.',
    s1hint: 'What to watch: drag only the probe f and stop on f_c — the readout is exactly −3.01 dB and −45°, the dashed lines cross right there, and the true curve sits 3 dB below the crossing. One decade to the right the gain is about 20 dB lower and the phase heads for −90°; one decade to the left only −0.04 dB and −5.7° remain. Then drag only f_c: the whole curve slides sideways without changing shape, because |H| depends only on the ratio f/f_c.',

    s2k: 'Step 2 · Phase',
    s2t: 'The right gains aren’t enough: why does phase reshape a waveform?',
    s2e: 'This step asks: through the same RC low-pass (f_c = 1 kHz), feed a two-frequency wave sin(2πf₁t) + ⅓·sin(2π·3f₁t) — the first two terms of a square wave. Does the output still look like the input? Phase converts into a <strong>lag time</strong>: Δt = −phase ÷ (360°·f), how many seconds late that frequency’s peaks arrive. Each component has its own gain and its own lag. If both lagged by the same time, the output would just be the input shifted later, each part scaled by its gain — the dashed curve shows exactly that reference, with both parts delayed by Δt₁. The cyan curve is the circuit’s real output (again from numerical integration). Any gap between them comes purely from the two components lagging by different amounts; we measure it as the <strong>distortion</strong>: RMS of the gap ÷ RMS of the cyan curve (RMS: square, average, square-root — a measure of how big the swings are).',
    f2: 'Fundamental f₁',
    c2a: 'Two periods of f₁: input, output and equal-lag reference', c2b: 'Lag Δt (ms) vs frequency (log axis, Hz)',
    s2lgIn: 'Input', s2lgOut: 'Circuit output', s2lgRef: 'Reference: both parts lag equally', s2lgD1: 'Lag of f₁', s2lgD3: 'Lag of 3f₁',
    s2readout: 'f₁ = {f}: f₁ lags {d1}, 3f₁ lags {d3} (a difference of {dd}); gains {g1} and {g3}; distortion {mis}%.',
    s2hint: 'What to watch: start at f₁ = 50 Hz. In the bottom chart both dots sit on the flat shelf at the far left, both lagging about RC = 0.159 ms, and the cyan curve lies on the dashed one (distortion under 0.1%): low frequencies are all delayed by the same time, so the shape survives. Drag f₁ right and the dots slide onto the downhill part of the curve; 3f₁ gets there first, its lag shrinks, and cyan peels away from dashed — at f₁ = 1 kHz the distortion is about 16%. The lesson: to preserve a waveform it isn’t enough to get the gains right; every frequency in the signal must lag by the same time.',

    s3k: 'Step 3 · Cutoff & order',
    s3t: 'To keep 200 Hz and remove 5 kHz hiss, which cutoff and how many sections?',
    s3e: 'This step asks: a 200 Hz tone (amplitude 1) is mixed with 5 kHz hiss (amplitude 0.5). How well can RC low-passes pull them apart? Any signal can be split into sines of different frequencies (<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: the spectrum</a>), and a low-pass treats each sine with its own gain. Two knobs: the cutoff f_c, and the <strong>order</strong> n — n identical RC sections in a row, with buffer amplifiers between them so they don’t load each other. The total gain is the single-section gain to the n-th power, so above f_c it falls 20·n dB per decade. Two scores: the <strong>tone loss</strong> = gain at 200 Hz (dB, the closer to 0 the better); the <strong>selectivity</strong> = tone gain − hiss gain (dB, the larger, the further the hiss is pushed down relative to the tone). Both come from numerically integrating the circuit and fitting the output.',
    fc3: 'Cutoff f_c', n3: 'Order n (sections in series)',
    c3a: 'Input (grey), output (cyan), clean tone (dashed); ms', c3b: 'Gain (dB) vs frequency: orange 200 Hz, pink 5 kHz',
    s3lgIn: 'Mixed input', s3lgOut: 'Filtered output', s3lgClean: 'Clean 200 Hz tone', s3lgWant: 'At the 200 Hz tone', s3lgHiss: 'At the 5 kHz hiss',
    s3readout: 'n = {n}, f_c = {fc}: tone {gw} dB, hiss {gh} dB, selectivity {sel} dB; slope above f_c {slope} dB per decade.',
    s3hint: 'What to watch: keep n = 1 and drag f_c from high to low. The fine fuzz on the cyan curve thins out, but as f_c approaches 200 Hz the tone itself shrinks and slides right. Now raise n to 4: the slope steepens (about −20·n dB per decade), and at the same f_c the hiss is crushed far more. If the tone may lose at most 1 dB, one section can push the hiss down by about 22 dB at best, two by about 38 dB, four by about 63 dB — order buys you a steeper edge.',

    s4k: 'Step 4 · Rewired',
    s4t: 'Same maths, different wiring: high-pass, band-pass and resonance',
    s4e: 'This step asks: swap the resistor and capacitor, or add an inductor, and what happens to the frequency response? <strong>High-pass</strong>: take the output across the resistor; H = (j·f/f_c)/(1 + j·f/f_c) blocks low frequencies and passes high ones, and its phase falls from +90° to 0° (the output leads the input). <strong>Band-pass</strong>: resistor, inductor and capacitor in series (RLC) with the output across the resistor pass only frequencies near the <strong>centre frequency</strong> f₀ = 1/(2π√(LC)); at f₀ the inductor and capacitor cancel each other and the circuit <strong>resonates</strong> (<a class="xlink" href="../../../physics/waves/resonance/#step3">→ Resonance, step 3: how an oscillator responds near its resonant frequency</a>). How sharp the band-pass is is described by the <strong>quality factor</strong> Q = f₀ ÷ bandwidth, where the <strong>bandwidth</strong> is the span of frequencies whose gain is within 3 dB of the peak. Here f_c and f₀ are both 1 kHz. The bandwidth is found by bisecting the curve for its −3 dB points, and Q is worked back from it to check against the Q you set.',
    kindLP: 'Low-pass (RC)', kindHP: 'High-pass (CR)', kindBP: 'Band-pass (RLC)', Q4: 'Quality factor Q (band-pass only)',
    c4a: 'Gain (dB) vs frequency (log axis, Hz)', c4b: 'Phase (degrees) vs frequency (log axis, Hz)',
    s4lgBand: '−3 dB bandwidth', s4lgRef: 'Cutoff / centre at 1 kHz',
    s4lp: 'Low-pass: {db} dB and {ph}° at 1 kHz; {db10} dB at 10 kHz.',
    s4hp: 'High-pass: {db} dB and {ph}° at 1 kHz; {db01} dB at 100 Hz.',
    s4bp: 'Band-pass, Q = {Q}: peak {peak} dB at 1 kHz with phase 0°; −3 dB points at {lo} and {hi}, bandwidth {bw}, so Q = f₀/bandwidth = {Qm}.',
    s4hint: 'What to watch: press “Low-pass”, then “High-pass”. The two gain curves are mirror images, both −3 dB at 1 kHz; one phase falls from 0° to −90°, the other from +90° to 0°. Then press “Band-pass” and drag Q from 0.5 to 10: the peak sharpens, the shaded bandwidth shrinks from 2 kHz to 100 Hz, and the Q worked back from it always equals the Q you set; the phase crosses 0° at 1 kHz, flipping faster the higher Q is. Note that the two −3 dB points are not symmetric about 1 kHz in linear frequency, only on the log axis: their product is exactly f₀².',

    s5k: 'Step 5 · Design to spec',
    s5t: 'Design challenge: keep 1 kHz, block 50 Hz hum and a 10 kHz whine',
    s5e: 'This step asks: chaining n high-pass and n low-pass sections into a band-pass, can you meet three specs at once? ① Passband: gain at 1 kHz no lower than −1 dB. ② 50 Hz mains hum pushed down at least 20 dB (gain ≤ −20 dB). ③ A 10 kHz whine pushed down at least 20 dB too. Knobs: high-pass cutoff f_L, low-pass cutoff f_H, and order n (n sections on each side). The pink bars mark where the curve may not go at the three test frequencies. Steeper edges on the low and high sides make life easier, but each extra section also costs a little at 1 kHz — that is the trade-off. Once it passes, press “Bench test”: three sines at 50 Hz, 1 kHz and 10 kHz go into the circuit equations together, the system is integrated numerically, and each tone’s gain is fitted from the output and checked against the formula.',
    fL5: 'High-pass cutoff f_L', fH5: 'Low-pass cutoff f_H', n5: 'Order n (sections per side)', bench5: 'Bench test',
    c5a: 'Designed gain (dB) vs frequency; pink = forbidden by spec',
    s5lgG: 'Design curve', s5lgBan: 'Forbidden by spec', s5lgPt: 'The three test frequencies',
    spec1: '① Gain at 1 kHz ≥ −1 dB: now {v} dB, {ok}', spec2: '② Gain at 50 Hz ≤ −20 dB: now {v} dB, {ok}', spec3: '③ Gain at 10 kHz ≤ −20 dB: now {v} dB, {ok}',
    s5all: 'All three specs met: this design passes.', s5notyet: '{k} spec(s) still missed.',
    s5bench: 'Bench (numerical integration): 50 Hz {a} dB, 1 kHz {b} dB, 10 kHz {c} dB; within {e} dB of the formula.',
    s5benchWait: 'When the design looks right, press “Bench test”. Changing any knob discards the old bench result.',
    s5hint: 'What to watch: try n = 1 first. However you set f_L and f_H, the three specs can’t all be met — to crush 50 Hz and 10 kHz enough, both edges must creep so close to 1 kHz that the passband loses more than 1 dB. Switch to n = 2: only a sliver passes, with f_H ≈ 3.31 kHz and f_L between 151 and 166 Hz — just 3 slider combinations. With n = 3 or 4 the passing region is much wider. Once you pass, press “Bench test” and see whether the numerical integration agrees with the formula.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Two curves tell you everything about a linear filter',
    s6fin: '<strong>Step 0</strong>: feed an RC circuit one sine at a time and measure gain and lag; plotted over all frequencies, that is the frequency response. <strong>Step 1</strong>: log frequency and decibels turn the RC low-pass into two asymptotes meeting at f_c, where the true curve is 3 dB down with −45° of phase. <strong>Step 2</strong>: when frequencies lag by different times, the waveform changes shape even if the gains are right. <strong>Step 3</strong>: the cutoff decides where to cut; the order decides how sharp the knife is. <strong>Step 4</strong>: high-pass and band-pass are the same kind of complex ratio wired differently; for the band-pass, Q = f₀/bandwidth. <strong>Step 5</strong>: a spec is three inequalities, order is the price, and a design is only signed off when the bench agrees with the formula.',
    boundary: 'Scope: this page covers continuous-time linear circuits made of ideal parts, so gain does not depend on input amplitude. Cascades assume ideal buffers between sections; wired directly, the total response is not the single-section response to the n-th power. The “measurements” are numerical integrations of the circuit equations (RK4, from rest, fitted after at least 40 of the slowest time constants), not a real instrument; their relative difference from the formula is numerical error below 10⁻⁴. A frequency response describes steady sines only; the start-up transient is the job of the impulse or step response. Step 5 checks just three frequencies — a real design would check the whole band.',
    linksTitle: 'Where to go next',
    lk1: '→ Impulse & LTI, step 2: the impulse response h is an LTI system’s complete file',
    lk2: '→ Resonance, step 3: how an oscillator responds near its resonant frequency',
    lk3: '→ Sampling, step 6: low-pass first, then sample',
    lk4: '→ Laplace, step 4: pole locations set a system’s character',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Frequency Response & Filters · A Box That Eats by Frequency”.'
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
  if (typeof window.refreshFR === 'function') window.refreshFR();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, SYMBOLS };
if (typeof window !== 'undefined') window.FR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
