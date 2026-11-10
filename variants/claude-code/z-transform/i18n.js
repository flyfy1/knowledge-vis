'use strict';
// Z-transform lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'Z 变换 · 离散信号的极点地图',
    back: '← 知识索引',
    compare: '对照另一版本：Z 变换 · 把 s 平面卷成单位圆 →',
    navLabel: 'Z 变换步骤导航',
    tagline: '数字信号是一串编了号的数 x[0], x[1], x[2], …。Z 变换把整串数压成复平面上的一个函数 X(z)，于是「这串数是衰减还是发散、振荡得多快、经过滤波器会变成什么」都能在一张平面图上读出来。七步里你会看到复数的幂怎样走出螺线、级数在哪里收敛、s 平面怎样卷进单位圆，以及怎样用一个零点精确地删掉一个频率。',
    nav0: '0 一个点 z₀', nav1: '1 级数何时收敛', nav2: '2 z = e^(sT)', nav3: '3 收敛域与稳定', nav4: '4 单位圆上的频响', nav5: '5 用零点删频率', nav6: '6 收束',

    s0k: '第 0 步 · 基本积木',
    s0t: '一个复数 z₀ 反复自乘，会给出一串什么样的数？',
    s0e: '这一步要回答：Z 变换用来「量」序列的积木是什么？离散信号是按整数编号 n 排好的一串数 x[n]（n 是第几个样本，没有单位）。取复数 z₀ = r·e<sup>jθ</sup>（r 是它到原点的距离，叫<strong>模</strong>；θ 是它的方向角，叫<strong>辐角</strong>，单位是弧度/样本），把它的幂 z₀ⁿ 一个个算出来：每乘一次，模乘上 r、方向再转 θ（<a class="xlink" href="../complex-numbers/#step5">→ 复数（Claude 版）第 5 步：一次次乘同一个复数会走出螺线</a>）。取实部就得到序列 x[n] = rⁿ·cos(θn)。所以：r &lt; 1（点在<strong>单位圆</strong>，即半径 1 的圆，之内）序列衰减；r = 1 等幅；r &gt; 1 发散。θ 决定每个样本转多少，也就是振荡多快。',
    rSlider0: '模 r', thSlider0: '辐角 θ（度/样本）',
    s0lgPt: 'z₀', s0lgPow: 'z₀⁰ … z₀²⁴（越淡越晚）', s0lgCirc: '单位圆 |z| = 1', s0lgSeq: '序列 x[n] = rⁿ cos(θn)',
    c0a: 'z 平面：z₀ 的各次幂', c0b: '序列 x[n]（横轴 n）',
    s0readout: 'z₀ = {r}·e^(j{th}°)：每一步模乘 {r}、转 {th}°。第 10 个样本的包络 r¹⁰ = {r10}；{kind}{per}',
    s0in: '点在单位圆内，序列衰减。', s0on: '点在单位圆上，序列等幅。', s0out: '点在单位圆外，序列发散。', s0per: '每 {p} 个样本转一整圈。', s0noper: 'θ = 0，不转，只是 rⁿ。', s0half: 'θ = 180°，每个样本翻一次号。',
    s0hint: '观察顺序：θ 保持 30°，把 r 从 0.8 拖到 1.1：「z 平面」上的螺线从向内卷变成向外卷，序列从衰减变成发散；r = 1 时点正好落在虚线圆上，序列等幅。再固定 r、拖 θ：螺线转得更急，序列振荡更快。',

    s1k: '第 1 步 · 收敛域',
    s1t: '把整串数加成一个 X(z)，这个无穷级数在哪些 z 上能加出有限的值？',
    s1e: '这一步要回答：Z 变换 X(z) = Σ x[n]·z<sup>−n</sup>（对所有 n 求和）在哪里有意义？取 x[n] = aⁿ·u[n]，u[n] 是<strong>单位阶跃</strong>（n &lt; 0 为 0，n ≥ 0 为 1），a 是实数。于是 X(z) = 1 + (a/z) + (a/z)² + …，是公比为 a/z 的等比级数。只有 |a/z| &lt; 1，也就是 <strong>|z| &gt; |a|</strong> 时，部分和才会收敛到 1/(1 − a/z) = z/(z − a)；否则越加越大。让级数收敛的所有 z 叫<strong>收敛域</strong>（ROC），这里它是半径 |a| 的圆的外面。z = a 处分母为 0，叫<strong>极点</strong>。试探点取 z = ρ·e<sup>j45°</sup>，你可以改它到原点的距离 ρ。',
    aSlider1: '序列的公比 a', rhoSlider1: '试探点的模 ρ = |z|',
    s1lgRoc: 'ROC：|z| > |a|', s1lgPole: '极点 z = a', s1lgZ: '试探点 z', s1lgOk: '试过且收敛的 ρ', s1lgBad: '试过但发散的 ρ', s1lgPath: '部分和 S₀, S₁, …, S₄₀ 的轨迹', s1lgTarget: '闭式 z/(z − a)',
    c1a: 'z 平面：ROC 与试探点', c1b: '部分和在复平面上的轨迹',
    s1readout: 'a = {a}、|z| = {rho}：|a/z| = {q}。{verdict}',
    s1conv: '公比小于 1，部分和绕着收拢：S₄₀ = {s40}，闭式 z/(z − a) = {cf}，两者相差 {err}。', s1div: '公比不小于 1，部分和越绕越远：|S₄₀| = {m40}，级数发散，这个 z 不在 ROC 里。', s1edge: '|a/z| 正好等于 1：每一项都一样大、不会变小，部分和一直绕圈停不下来，所以不收敛；圆周本身不在 ROC 里。', s1zero: 'a = 0：序列只有 x[0] = 1，X(z) = 1，处处收敛。',
    s1hint: '观察顺序：a 保持 0.8，把 ρ 从 2 往下拖：部分和的轨迹由紧凑的螺线变得越来越松，ρ 一过 0.8（虚线圆）就盘旋着飞出去。「z 平面」上会留下你试过的点，绿色全在虚线圆外，粉色全在圆内或圆上。再把 a 换成负数：圆的半径只看 |a|。',

    s2k: '第 2 步 · 和拉普拉斯的关系',
    s2t: '对连续信号每隔 T 秒采一次样，s 平面上的点会落到 z 平面的哪里？',
    s2e: '这一步要回答：Z 变换和拉普拉斯变换（<a class="xlink" href="../laplace/#step0">→ 拉普拉斯（Claude 版）第 0 步：s = σ + jω 是带寿命的振荡</a>）是什么关系？连续信号 e<sup>st</sup> 每隔 T 秒采样一次，得到 e<sup>s·nT</sup> = (e<sup>sT</sup>)ⁿ，正是第 0 步的 z₀ⁿ，其中 <strong>z = e<sup>sT</sup></strong>。拆开看：|z| = e<sup>σT</sup>，所以 σ &lt; 0（左半平面）落在单位圆内，σ = 0（虚轴）落在单位圆上；∠z = ωT，所以虚轴每走 2π/T 就绕单位圆一整圈。这里 T = 1 秒。于是 ω 与 ω + 2π 落在同一个 z 上——采样后它们分不开，这正是<strong>混叠</strong>（<a class="xlink" href="../sampling/#step1">→ 采样与混叠（Claude 版）第 1 步：同一组样点</a>）。',
    sgSlider2: 'σ（1/秒）', wSlider2: 'ω（弧度/秒）',
    s2lgS: '当前的 s', s2lgTwin: '孪生点 s ± j2π（落到同一个 z）', s2lgStrip: '主条带 −π < ω ≤ π', s2lgTrail: '走过的 z',
    c2a: 's 平面（横轴 σ，纵轴 ω）', c2b: 'z 平面：z = e^(sT)，T = 1',
    s2readout: 's = {sg} + j{w} → |z| = e^({sg}) = {r}，∠z = {w} 弧度，折回 (−π, π] 后是 {ang} 弧度（{deg}°）。{where}{twin}',
    s2inside: 'σ < 0，z 在单位圆内。', s2onc: 'σ = 0，z 正好在单位圆上。', s2outside: 'σ > 0，z 在单位圆外。', s2twin: 'ω 已经超出主条带：s 平面上相差 2π 的点都落在这里。',
    s2hint: '观察顺序：σ 保持 −0.3，把 ω 从 0 拖到 7：z 沿着一个半径 e^(−0.3) 的圆逆时针转，过了 ω = π（约 3.14）就从左边绕回来，继续转第二圈。孪生的橙色空心点告诉你哪些 s 会落到同一处。再拖 σ：z 只在径向上进出，σ = 0 时贴在单位圆上。',

    s3k: '第 3 步 · 收敛域与稳定',
    s3t: '两个极点把 z 平面分成三块，选哪一块当 ROC，信号就是哪一个？',
    s3e: '这一步要回答：只给 X(z) 能不能确定序列？取 X(z) = 1/((1 − p₁z<sup>−1</sup>)(1 − p₂z<sup>−1</sup>))，两个实数极点 p₁ = 0.5、p₂ 可调（|p₂| &gt; 0.5）。按<strong>部分分式</strong>拆成两项 A/(1 − p₁z<sup>−1</sup>) + B/(1 − p₂z<sup>−1</sup>)。第 1 步说，若 ROC 在 |p| 的圆外面，那一项是向右延伸的 pⁿu[n]；若在圆里面，同样的式子对应向左延伸的 −pⁿu[−n−1]。两个圆把平面分成「两圆之外」「两圆之间的环」「两圆之内」三块，就是三个不同的序列。<strong>稳定</strong>（Σ|x[n]| 有限）当且仅当 ROC 包含单位圆，因为 |z| = 1 时 |z<sup>−n</sup>| = 1。',
    p2Slider: '第二个极点 p₂（p₁ = 0.5 固定）', rocOut: 'ROC：两圆之外', rocRing: 'ROC：两圆之间', rocIn: 'ROC：两圆之内',
    s3lgRoc: '选中的 ROC', s3lgPole: '极点 p₁、p₂', s3lgUnit: '单位圆', s3lgSeq: '对应的序列 x[n]',
    c3a: 'z 平面上的三块 ROC', c3b: '对应的序列 x[n]（横轴 n）',
    s3readout: 'p₂ = {p2}，ROC {range} → {shape}。单位圆{has}在 ROC 里 → {stab}。数值核对：在 |z| = {zm} 处把序列逐项求和（n = −600…600）得 {num}，公式给 {form}。',
    s3right: '两项都向右延伸（因果序列）', s3two: '0.5ⁿ 那项向右、p₂ⁿ 那项向左（双边序列）', s3left: '两项都向左延伸（反因果序列）', s3has: '确实', s3not: '不',
    s3stable: '稳定', s3unstable: '不稳定',
    s3hint: '观察顺序：p₂ 保持 −1.25，依次点三个 ROC 按钮：同一个式子，序列从「右边发散」变成「两边都衰减」，再变成「左边才有」。只有「两圆之间」那块盖住了单位圆，所以只有它稳定。再把 p₂ 拖到 −0.8（两个极点都在圆内）：这回变成「两圆之外」稳定。',
    quizPrompt: '小测：一个因果系统（ROC 在最外面那个极点的圆外）的极点是 0.5 和 −1.25。它稳定吗？',
    quizA: '稳定：有一个极点在单位圆内就够了', quizB: '不稳定：ROC 是 |z| > 1.25，不包含单位圆', quizC: '稳定：极点的乘积小于 1',
    check: '核对', correct: '对。因果 ⇒ ROC 在最外面那个极点（|z| = 1.25）的圆外，单位圆不在里面，(−1.25)ⁿ 那一项会发散。选「两圆之外」、p₂ = −1.25 可以核对。', wrong: '再想想：因果系统的 ROC 在最外面那个极点的圆外，要看单位圆是否落在里面。选「两圆之外」、p₂ = −1.25 可以核对。',

    s4k: '第 4 步 · 单位圆上的频响',
    s4t: '沿着单位圆走一圈，滤波器对每个频率的增益是多少？',
    s4e: '这一步要回答：给定极点，数字滤波器对各频率的<strong>增益</strong>（输入 cos(Ωn) 时输出振幅 ÷ 输入振幅）怎么读？Ω 是<strong>数字角频率</strong>（弧度/样本，0 到 π，π 对应每两个样本一周，即第 2 步里的折返点）。滤波器写成<strong>差分方程</strong> y[n] = x[n] + 2r·cosΩ<sub>p</sub>·y[n−1] − r²·y[n−2]：输出由当前输入和前两个输出算出。z<sup>−1</sup> 表示「延迟一个样本」，所以它的 H(z) = 1/(1 − 2r·cosΩ<sub>p</sub>·z<sup>−1</sup> + r²z<sup>−2</sup>)，极点在 r·e<sup>±jΩ<sub>p</sub></sup>，这里 Ω<sub>p</sub> = π/3。增益就是 H 在单位圆上的值 |H(e<sup>jΩ</sup>)|，几何上等于 <strong>1/(d₁·d₂)</strong>，d₁、d₂ 是单位圆上的点 e<sup>jΩ</sup> 到两个极点的距离（<a class="xlink" href="../laplace/#step5">→ 拉普拉斯（Claude 版）第 5 步：同样的读法在虚轴上</a>）。极点越贴近单位圆（r → 1），峰越高越窄。',
    wSlider4: '数字角频率 Ω（弧度/样本）', rSlider4: '极点的模 r', walk4: '沿单位圆从 Ω = 0 走到 π',
    s4lgPole: '极点 r·e^(±jπ/3)', s4lgPt: '单位圆上的点 e^(jΩ)', s4lgD1: '到上方极点的距离 d₁', s4lgD2: '到下方极点的距离 d₂', s4lgCurve: '增益 |H|（dB，公式）', s4lgDot: '走过的 Ω',
    c4a: 'z 平面：从 e^(jΩ) 到两个极点', c4b: '增益 20·log₁₀|H(e^(jΩ))|（横轴 Ω）',
    s4readout: '{prog}Ω = {w}：d₁ = {d1}、d₂ = {d2} → 1/(d₁d₂) = {g}（{gdb} dB）。把 cos(Ωn) 真的送进差分方程、等过渡结束后量得输出振幅 {meas}。峰在 Ω = {pw}，高 {pk}，半功率宽度 {bw} 弧度/样本（约等于 2(1 − r) = {bw0}）。',
    s4prog: '已走过 {c}/{N} 个 Ω。',
    s4hint: '观察顺序：r 保持 0.9，按「沿单位圆走」或把 Ω 从 0 慢慢拖到 π：上方的橙线在 Ω ≈ 1.05（π/3）处最短，增益曲线在那里冒尖。再把 r 拖到 0.98 走一遍：峰更高、更窄；拖到 0.5：峰只有约 1.5，又矮又宽。读数里「量得」的振幅来自真实滤波，和 1/(d₁d₂) 一致。',

    s5k: '第 5 步 · 用零点删频率',
    s5t: '想从信号里精确删掉一个频率，零点该放在哪里？',
    s5e: '这一步要回答：怎样设计一个只删掉某个频率的滤波器（<strong>陷波器</strong>）？设想信号里有想要的 Ω = 0.3 的音，混进了 Ω = 1.2 的干扰（模拟设定）。H(z) 分子为 0 的点叫<strong>零点</strong>：增益公式里，到零点的距离出现在分子上。把一对零点放在单位圆上的 e<sup>±jΩ₀</sup>，在 Ω = Ω₀ 处距离为 0，增益正好为 0；再把一对极点放在同方向、稍微靠里的 ρ·e<sup>±jΩ₀</sup>，在离 Ω₀ 稍远的地方，到零点和到极点的距离几乎相等、互相抵消，增益回到约 1。对应的差分方程 y[n] = x[n] − 2cosΩ₀·x[n−1] + x[n−2] + 2ρ·cosΩ₀·y[n−1] − ρ²·y[n−2]，图上的输出就是用它逐个样本算出来的（<a class="xlink" href="../../../signal/systems/frequency-response/#step3">→ 频率响应页第 3 步：滑动平均的零点</a>）。',
    w0Slider5: '零点方向 Ω₀（弧度/样本）', rhoSlider5: '极点的模 ρ',
    s5lgZero: '零点 e^(±jΩ₀)（空心）', s5lgPole: '极点 ρ·e^(±jΩ₀)', s5lgIn: '输入：cos(0.3n) + cos(1.2n)', s5lgFreq: '单位圆上的白点、橙点：Ω = 0.3 与 1.2 的方向', s5lgOut: '输出 y[n]',
    c5a: 'z 平面：零点与极点', c5b: '输入与输出（横轴 n）',
    s5readout: 'Ω₀ = {w0}、ρ = {rho}：想要的 0.3 增益 {gw}（量得 {mw}），干扰 1.2 增益 {gh}（量得 {mh}）。过渡项 ρⁿ 要 {ns} 个样本才降到 1%。{note}',
    s5hit: '零点正好对准干扰，干扰被完全删掉。', s5miss: '零点没对准 1.2，干扰只被削弱。',
    s5hint: '观察顺序：先把 Ω₀ 拖到 1.2：输出里快速的干扰消失，只剩慢的 0.3 音，读数里干扰增益为 0。再拖 ρ：ρ 接近 1 时缺口很窄，0.3 的音几乎不受影响，但开头的过渡拖得很长（要上百个样本）；ρ = 0.5 时过渡很快结束，代价是缺口变宽，0.3 的音也被改变。',

    s6k: '第 6 步 · 收束',
    s6t: '一张 z 平面图上能读出什么？',
    s6fin: 'Z 变换用 zⁿ 这块积木去量序列：模决定衰减或发散，辐角决定每个样本转多少（第 0 步）。X(z) 是一个级数，只在 ROC 里收敛，ROC 由极点划出的圆界定（第 1 步）。采样把 s 平面通过 z = e<sup>sT</sup> 卷进来：左半平面进到圆内，虚轴卷成单位圆，相差 2π/T 的点重合（第 2 步）。同一个 X(z) 配不同的 ROC 是不同的序列，稳定看 ROC 是否包含单位圆（第 3 步）。频率响应就是 H 在单位圆上的值，可以用到极点、零点的距离直接读（第 4、5 步）。',
    formula: 'X(z) = Σₙ x[n]·z^(−n)\naⁿu[n] ↔ z/(z − a)，ROC：|z| > |a|\nz = e^(sT)：σ < 0 ⇔ |z| < 1；ω 与 ω + 2π/T 落在同一个 z\n稳定 ⇔ ROC 包含单位圆；H(e^(jΩ)) = H(z)|_(z = e^(jΩ))\n|H(e^(jΩ))| = |b₀|·Π(到零点的距离) / Π(到极点的距离)',
    boundary: '适用范围：本页用双边 Z 变换；序列都是指数或指数调制的余弦；「极点在单位圆内 ⇔ 稳定」只对因果系统成立；距离公式里的常数系数 b₀ 在本页的滤波器里等于 1。第 5 步的干扰是模拟设定；单边 Z 变换与初值、量化误差、滤波器的相位响应都不在本页范围内。',
    linksTitle: '接着去看',
    lk1: '采样与混叠（Claude 版）· 第 2 步：频率怎样被折进 0…fs/2，就是 z 平面上绕圈重合 →',
    lk2: '拉普拉斯变换（Claude 版）· 第 4 步：极点在 s 平面上的位置决定响应性格 →',
    lk3: '频率响应 · 第 3 步：滑动平均的零点落在单位圆上 →',
    lk4: '卷积（Claude 版）· 第 5 步：时域卷积，到频率上变成逐点相乘 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《Z 变换 · 把 s 平面卷成单位圆》的平行版本。'
  },
  en: {
    pageTitle: 'The Z-Transform · A Pole Map for Sequences',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Z-Transform · Rolling the s-Plane into the Unit Circle →',
    navLabel: 'Z-transform steps',
    tagline: 'A digital signal is a numbered list x[0], x[1], x[2], …. The Z-transform packs the whole list into one function X(z) on the complex plane, so whether the list decays or blows up, how fast it oscillates and what a filter will do to it can all be read off one map. In seven steps you will see powers of a complex number trace spirals, where the series converges, how the s-plane rolls into the unit circle, and how a single zero deletes one frequency exactly.',
    nav0: '0 One point z₀', nav1: '1 When it converges', nav2: '2 z = e^(sT)', nav3: '3 ROC & stability', nav4: '4 Response on the circle', nav5: '5 Deleting a frequency', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The building block',
    s0t: 'Multiply a complex number z₀ by itself again and again. What list of numbers comes out?',
    s0e: 'The question here: what is the building block the Z-transform measures sequences against? A discrete signal is a list x[n] ordered by an integer index n (which sample it is; no units). Take a complex number z₀ = r·e<sup>jθ</sup> (r is its distance from the origin, the <strong>modulus</strong>; θ is its direction, the <strong>argument</strong>, in radians per sample) and work out its powers z₀ⁿ one by one: each multiplication scales the modulus by r and turns the direction by θ (<a class="xlink" href="../complex-numbers/#step5">→ Complex numbers (Claude edition) step 5: multiplying by the same number again and again traces a spiral</a>). Taking the real part gives the sequence x[n] = rⁿ·cos(θn). So with r &lt; 1 (the point inside the <strong>unit circle</strong>, the circle of radius 1) the sequence decays, with r = 1 it keeps a constant size, and with r &gt; 1 it blows up. θ sets how far it turns per sample, that is, how fast it oscillates.',
    rSlider0: 'Modulus r', thSlider0: 'Argument θ (degrees per sample)',
    s0lgPt: 'z₀', s0lgPow: 'z₀⁰ … z₀²⁴ (fainter = later)', s0lgCirc: 'Unit circle |z| = 1', s0lgSeq: 'Sequence x[n] = rⁿ cos(θn)',
    c0a: 'The z-plane: powers of z₀', c0b: 'The sequence x[n] (n across)',
    s0readout: 'z₀ = {r}·e^(j{th}°): each step scales by {r} and turns {th}°. Envelope at sample 10, r¹⁰ = {r10}; {kind}{per}',
    s0in: 'the point is inside the unit circle, so the sequence decays. ', s0on: 'the point is on the unit circle, so the sequence keeps its size. ', s0out: 'the point is outside the unit circle, so the sequence blows up. ', s0per: 'One full turn every {p} samples.', s0noper: 'θ = 0, so it does not turn; it is just rⁿ.', s0half: 'θ = 180°, so the sign flips every sample.',
    s0hint: 'What to watch: keep θ = 30° and drag r from 0.8 to 1.1. The spiral on the z-plane goes from winding inwards to winding outwards, and the sequence from decaying to blowing up; at r = 1 the point sits right on the dashed circle and the sequence keeps its size. Then hold r and drag θ: the spiral turns more sharply and the sequence oscillates faster.',

    s1k: 'Step 1 · Region of convergence',
    s1t: 'Add the whole list up into one X(z). For which z does this infinite series give a finite value?',
    s1e: 'The question here: where does the Z-transform X(z) = Σ x[n]·z<sup>−n</sup> (summed over all n) make sense? Take x[n] = aⁿ·u[n], where u[n] is the <strong>unit step</strong> (0 for n &lt; 0, 1 for n ≥ 0) and a is real. Then X(z) = 1 + (a/z) + (a/z)² + …, a geometric series with ratio a/z. Only when |a/z| &lt; 1, that is <strong>|z| &gt; |a|</strong>, do the partial sums settle on 1/(1 − a/z) = z/(z − a); otherwise they keep growing. The set of z where the series converges is the <strong>region of convergence</strong> (ROC); here it is everything outside the circle of radius |a|. At z = a the denominator vanishes; that point is a <strong>pole</strong>. The trial point is z = ρ·e<sup>j45°</sup>, and you can change its distance ρ from the origin.',
    aSlider1: 'Sequence ratio a', rhoSlider1: 'Trial point modulus ρ = |z|',
    s1lgRoc: 'ROC: |z| > |a|', s1lgPole: 'Pole z = a', s1lgZ: 'Trial point z', s1lgOk: 'Tried ρ that converged', s1lgBad: 'Tried ρ that diverged', s1lgPath: 'Path of partial sums S₀, S₁, …, S₄₀', s1lgTarget: 'Closed form z/(z − a)',
    c1a: 'The z-plane: ROC and trial point', c1b: 'Path of the partial sums in the complex plane',
    s1readout: 'a = {a}, |z| = {rho}: |a/z| = {q}. {verdict}',
    s1conv: 'The ratio is below 1 and the partial sums spiral in: S₄₀ = {s40}, closed form z/(z − a) = {cf}, a gap of {err}.', s1div: 'The ratio is not below 1 and the partial sums spiral away: |S₄₀| = {m40}. The series diverges, so this z is outside the ROC.', s1edge: '|a/z| is exactly 1: every term has the same size and never shrinks, so the partial sums keep circling without settling; the circle itself is not in the ROC.', s1zero: 'a = 0: the only nonzero sample is x[0] = 1, so X(z) = 1 and it converges everywhere.',
    s1hint: 'What to watch: keep a = 0.8 and drag ρ down from 2. The path of partial sums goes from a tight spiral to a looser and looser one, and as soon as ρ passes 0.8 (the dashed circle) it swirls off. Each ρ you try stays on the z-plane: green ones all lie outside the dashed circle, pink ones inside or on it. Then make a negative: the circle\'s radius depends only on |a|.',

    s2k: 'Step 2 · The link to Laplace',
    s2t: 'Sample a continuous signal every T seconds. Where does each point of the s-plane land in the z-plane?',
    s2e: 'The question here: how is the Z-transform related to the Laplace transform (<a class="xlink" href="../laplace/#step0">→ Laplace (Claude edition) step 0: s = σ + jω is an oscillation with a lifespan</a>)? Sample the continuous signal e<sup>st</sup> every T seconds and you get e<sup>s·nT</sup> = (e<sup>sT</sup>)ⁿ, exactly the z₀ⁿ of step 0 with <strong>z = e<sup>sT</sup></strong>. Split it up: |z| = e<sup>σT</sup>, so σ &lt; 0 (the left half-plane) lands inside the unit circle and σ = 0 (the imaginary axis) lands on it; ∠z = ωT, so every 2π/T up the imaginary axis is one full turn round the circle. Here T = 1 s. That puts ω and ω + 2π on the same z: after sampling they cannot be told apart, which is exactly <strong>aliasing</strong> (<a class="xlink" href="../sampling/#step1">→ Sampling & aliasing (Claude edition) step 1: the same samples</a>).',
    sgSlider2: 'σ (1/s)', wSlider2: 'ω (rad/s)',
    s2lgS: 'Current s', s2lgTwin: 'Twin points s ± j2π (same z)', s2lgStrip: 'Main strip −π < ω ≤ π', s2lgTrail: 'Values of z visited',
    c2a: 'The s-plane (σ across, ω up)', c2b: 'The z-plane: z = e^(sT), T = 1',
    s2readout: 's = {sg} + j{w} → |z| = e^({sg}) = {r}, ∠z = {w} rad, which wraps into (−π, π] as {ang} rad ({deg}°). {where}{twin}',
    s2inside: 'σ < 0, so z is inside the unit circle. ', s2onc: 'σ = 0, so z sits on the unit circle. ', s2outside: 'σ > 0, so z is outside the unit circle. ', s2twin: 'ω is outside the main strip: points of the s-plane 2π apart all land here.',
    s2hint: 'What to watch: keep σ = −0.3 and drag ω from 0 to 7. z runs anticlockwise round a circle of radius e^(−0.3); past ω = π (about 3.14) it comes back round from the left and starts a second lap. The hollow orange twins show which values of s land on the same spot. Then drag σ: z only moves in and out along the radius, and at σ = 0 it sits on the unit circle.',

    s3k: 'Step 3 · ROC and stability',
    s3t: 'Two poles split the z-plane into three pieces. Pick one as the ROC and you have picked the sequence. Which one?',
    s3e: 'The question here: does X(z) alone pin down the sequence? Take X(z) = 1/((1 − p₁z<sup>−1</sup>)(1 − p₂z<sup>−1</sup>)) with two real poles, p₁ = 0.5 and an adjustable p₂ (|p₂| &gt; 0.5). <strong>Partial fractions</strong> split it into A/(1 − p₁z<sup>−1</sup>) + B/(1 − p₂z<sup>−1</sup>). Step 1 showed that if the ROC lies outside the circle |p|, that term is the right-going pⁿu[n]; if it lies inside, the same expression stands for the left-going −pⁿu[−n−1]. The two circles split the plane into "outside both", "the ring between them" and "inside both": three different sequences. The system is <strong>stable</strong> (Σ|x[n]| is finite) exactly when the ROC contains the unit circle, because |z<sup>−n</sup>| = 1 when |z| = 1.',
    p2Slider: 'Second pole p₂ (p₁ = 0.5 fixed)', rocOut: 'ROC: outside both', rocRing: 'ROC: the ring between', rocIn: 'ROC: inside both',
    s3lgRoc: 'Chosen ROC', s3lgPole: 'Poles p₁, p₂', s3lgUnit: 'Unit circle', s3lgSeq: 'Matching sequence x[n]',
    c3a: 'The three possible ROCs in the z-plane', c3b: 'Matching sequence x[n] (n across)',
    s3readout: 'p₂ = {p2}, ROC {range} → {shape}. The unit circle is {has}in the ROC → {stab}. Numerical check: summing the sequence term by term at |z| = {zm} (n = −600…600) gives {num}; the formula gives {form}.',
    s3right: 'both terms run to the right (a causal sequence)', s3two: 'the 0.5ⁿ term runs right and the p₂ⁿ term runs left (two-sided)', s3left: 'both terms run to the left (anti-causal)', s3has: ' ', s3not: 'not ',
    s3stable: 'stable', s3unstable: 'unstable',
    s3hint: 'What to watch: keep p₂ = −1.25 and press the three ROC buttons in turn. Same formula, yet the sequence goes from "blows up to the right" to "decays both ways" to "lives only on the left". Only the ring covers the unit circle, so only it is stable. Then drag p₂ to −0.8 (both poles inside the circle): now "outside both" is the stable one.',
    quizPrompt: 'Quick check: a causal system (ROC outside the circle of the outermost pole) has poles at 0.5 and −1.25. Is it stable?',
    quizA: 'Stable: one pole inside the unit circle is enough', quizB: 'Unstable: the ROC is |z| > 1.25 and leaves out the unit circle', quizC: 'Stable: the product of the poles is below 1',
    check: 'Check', correct: 'Right. Causal ⇒ the ROC lies outside the outermost pole\'s circle (|z| = 1.25), which leaves the unit circle out, and the (−1.25)ⁿ term blows up. Pick "outside both" with p₂ = −1.25 to confirm.', wrong: 'Not quite: a causal system\'s ROC lies outside the outermost pole\'s circle; check whether the unit circle falls inside it. Pick "outside both" with p₂ = −1.25 to confirm.',

    s4k: 'Step 4 · Response on the unit circle',
    s4t: 'Walk once round the unit circle. What gain does the filter give each frequency?',
    s4e: 'The question here: given the poles, how do you read a digital filter\'s <strong>gain</strong> (with cos(Ωn) going in, output amplitude ÷ input amplitude) at each frequency? Ω is the <strong>digital angular frequency</strong> (radians per sample, 0 to π; π means one cycle every two samples, the turning point of step 2). The filter is the <strong>difference equation</strong> y[n] = x[n] + 2r·cosΩ<sub>p</sub>·y[n−1] − r²·y[n−2]: each output comes from the current input and the two previous outputs. z<sup>−1</sup> means "delay by one sample", so its H(z) = 1/(1 − 2r·cosΩ<sub>p</sub>·z<sup>−1</sup> + r²z<sup>−2</sup>), with poles at r·e<sup>±jΩ<sub>p</sub></sup>; here Ω<sub>p</sub> = π/3. The gain is H on the unit circle, |H(e<sup>jΩ</sup>)|, which geometrically equals <strong>1/(d₁·d₂)</strong>, where d₁ and d₂ are the distances from the point e<sup>jΩ</sup> on the circle to the two poles (<a class="xlink" href="../laplace/#step5">→ Laplace (Claude edition) step 5: the same reading on the imaginary axis</a>). The closer the poles hug the unit circle (r → 1), the taller and narrower the peak.',
    wSlider4: 'Digital angular frequency Ω (rad/sample)', rSlider4: 'Pole modulus r', walk4: 'Walk the unit circle from Ω = 0 to π',
    s4lgPole: 'Poles r·e^(±jπ/3)', s4lgPt: 'The point e^(jΩ) on the circle', s4lgD1: 'Distance d₁ to the upper pole', s4lgD2: 'Distance d₂ to the lower pole', s4lgCurve: 'Gain |H| (dB, formula)', s4lgDot: 'Values of Ω walked',
    c4a: 'The z-plane: from e^(jΩ) to both poles', c4b: 'Gain 20·log₁₀|H(e^(jΩ))| (Ω across)',
    s4readout: '{prog}Ω = {w}: d₁ = {d1}, d₂ = {d2} → 1/(d₁d₂) = {g} ({gdb} dB). Feeding cos(Ωn) through the difference equation and waiting for the transient to die gives an output amplitude of {meas}. The peak is at Ω = {pw} with height {pk}; its half-power width is {bw} rad/sample (close to 2(1 − r) = {bw0}).',
    s4prog: 'Walked {c}/{N} values of Ω. ',
    s4hint: 'What to watch: keep r = 0.9 and press Walk, or drag Ω slowly from 0 to π. The orange line to the upper pole is shortest near Ω ≈ 1.05 (π/3), and the gain curve spikes there. Then set r = 0.98 and walk again: the peak is taller and narrower; at r = 0.5 it only reaches about 1.5, low and broad. The "measured" amplitude in the readout comes from actually running the filter, and it matches 1/(d₁d₂).',

    s5k: 'Step 5 · Deleting a frequency with a zero',
    s5t: 'To delete one frequency from a signal exactly, where should the zeros go?',
    s5e: 'The question here: how do you design a filter that removes just one frequency (a <strong>notch filter</strong>)? Suppose the signal holds a wanted tone at Ω = 0.3 plus interference at Ω = 1.2 (a simulated set-up). Points where the numerator of H(z) vanishes are <strong>zeros</strong>: in the gain formula, distances to zeros sit in the numerator. Put a pair of zeros on the unit circle at e<sup>±jΩ₀</sup> and the distance is 0 at Ω = Ω₀, so the gain is exactly 0 there. Then put a pair of poles in the same direction, slightly inside, at ρ·e<sup>±jΩ₀</sup>: a little away from Ω₀ the distances to the zeros and to the poles are nearly equal and cancel, so the gain returns to about 1. The matching difference equation is y[n] = x[n] − 2cosΩ₀·x[n−1] + x[n−2] + 2ρ·cosΩ₀·y[n−1] − ρ²·y[n−2], and the output in the chart is computed with it sample by sample (<a class="xlink" href="../../../signal/systems/frequency-response/#step3">→ Frequency response page step 3: the zeros of a moving average</a>).',
    w0Slider5: 'Zero direction Ω₀ (rad/sample)', rhoSlider5: 'Pole modulus ρ',
    s5lgZero: 'Zeros e^(±jΩ₀) (hollow)', s5lgPole: 'Poles ρ·e^(±jΩ₀)', s5lgIn: 'Input: cos(0.3n) + cos(1.2n)', s5lgFreq: 'White and orange dots on the circle: the directions Ω = 0.3 and 1.2', s5lgOut: 'Output y[n]',
    c5a: 'The z-plane: zeros and poles', c5b: 'Input and output (n across)',
    s5readout: 'Ω₀ = {w0}, ρ = {rho}: gain {gw} for the wanted 0.3 (measured {mw}) and {gh} for the interference at 1.2 (measured {mh}). The transient ρⁿ takes {ns} samples to fall below 1%. {note}',
    s5hit: 'The zeros sit right on the interference, which is deleted completely.', s5miss: 'The zeros miss 1.2, so the interference is only weakened.',
    s5hint: 'What to watch: drag Ω₀ to 1.2 first. The fast interference vanishes from the output and only the slow 0.3 tone is left; the readout shows an interference gain of 0. Then drag ρ: near 1 the notch is narrow and the 0.3 tone is barely touched, but the start-up transient drags on for a hundred samples or more; at ρ = 0.5 the transient is over quickly, at the cost of a wider notch that changes the 0.3 tone too.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What can one z-plane map tell you?',
    s6fin: 'The Z-transform measures sequences against zⁿ: the modulus decides decay or growth and the argument decides how far each sample turns (step 0). X(z) is a series that converges only in the ROC, whose edges are circles through the poles (step 1). Sampling rolls the s-plane in through z = e<sup>sT</sup>: the left half-plane goes inside the circle, the imaginary axis becomes the unit circle, and points 2π/T apart coincide (step 2). The same X(z) with different ROCs means different sequences, and stability depends on whether the ROC contains the unit circle (step 3). The frequency response is H on the unit circle and can be read straight off the distances to the poles and zeros (steps 4 and 5).',
    formula: 'X(z) = Σₙ x[n]·z^(−n)\naⁿu[n] ↔ z/(z − a), ROC: |z| > |a|\nz = e^(sT): σ < 0 ⇔ |z| < 1; ω and ω + 2π/T land on the same z\nstable ⇔ ROC contains the unit circle; H(e^(jΩ)) = H(z) at z = e^(jΩ)\n|H(e^(jΩ))| = |b₀|·Π(distances to zeros) / Π(distances to poles)',
    boundary: 'Scope: this page uses the two-sided Z-transform, and every sequence is an exponential or an exponentially scaled cosine. "Poles inside the unit circle ⇔ stable" holds only for causal systems. The constant b₀ in the distance formula equals 1 for the filters on this page. The interference in step 5 is simulated. The one-sided transform with initial conditions, quantisation error and filter phase response are outside this page.',
    linksTitle: 'Where to go next',
    lk1: 'Sampling & aliasing (Claude edition) · step 2: frequencies folding into 0…fs/2 are points lapping the z-plane circle →',
    lk2: 'Laplace transform (Claude edition) · step 4: where the poles sit in the s-plane decides the response →',
    lk3: 'Frequency response · step 3: the zeros of a moving average lie on the unit circle →',
    lk4: 'Convolution (Claude edition) · step 5: convolution in time becomes point-by-point multiplication in frequency →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "The Z-Transform · Rolling the s-Plane into the Unit Circle".'
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
  if (typeof window.refreshZ === 'function') window.refreshZ();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.Z_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
