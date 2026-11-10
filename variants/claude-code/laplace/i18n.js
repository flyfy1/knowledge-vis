'use strict';
// Laplace transform & ROC lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '拉普拉斯变换 · 给每个频率配一个增长率',
    back: '← 知识索引',
    compare: '对照另一版本：拉普拉斯与 ROC · 给频率配一个寿命 →',
    navLabel: '拉普拉斯变换步骤导航',
    tagline: '傅里叶变换只用永远等幅振荡的正弦去量信号；碰上越来越大的信号，它的积分就算不出来。拉普拉斯变换给每个频率再配一个增长率 σ，把「频率」升级成复平面上的一个点 s = σ + jω。七步里你会看到这个积分什么时候收敛、收敛域（ROC）为什么必须写明，以及极点的位置怎样决定一个系统的全部性格。',
    nav0: '0 一个点 s', nav1: '1 积分何时收敛', nav2: '2 地形与切片', nav3: '3 同式两信号', nav4: '4 极点即性格', nav5: '5 从极点读频响', nav6: '6 收束',

    s0k: '第 0 步 · 基本积木',
    s0t: '一个复数 s = σ + jω，描述的是一种什么样的信号？',
    s0e: '这一步要回答：拉普拉斯变换用来「量」信号的那块积木 e<sup>st</sup> 长什么样？s 是一个复数，实部 σ、虚部 ω，j 是虚数单位（j² = −1）。按欧拉公式，e<sup>st</sup> = e<sup>σt</sup>·(cos ωt + j·sin ωt)：实部是一条余弦 cos ωt，外面套着包络 e<sup>σt</sup>。ω 是<strong>角频率</strong>（弧度/秒，一秒转过的角度，周期 = 2π/ω）；σ 是<strong>增长率</strong>（1/秒）：σ &lt; 0 时包络按指数衰减，σ &gt; 0 时按指数增长，σ = 0 就是傅里叶变换只用的等幅正弦（<a class="xlink" href="../exponents-logarithms/#step1">→ 指数与对数（Claude 版）第 1 步：指数曲线与半衰期</a>）。所以 s 平面上的每个点都是一种「带寿命的振荡」。',
    sigSlider0: '增长率 σ（1/秒）', wSlider0: '角频率 ω（弧度/秒）',
    s0lgPt: '当前的 s', s0lgTrail: '试过的 s', s0lgWave: '实部 e^(σt)·cos ωt', s0lgEnv: '包络 ±e^(σt)',
    c0a: 's 平面（横轴 σ，纵轴 ω）', c0b: 'Re e^(st) 随时间（秒）',
    s0readout: 's = {sig} + j{w}：{life}；{osc}',
    s0half: '包络每 {h} 秒减半', s0dbl: '包络每 {h} 秒翻倍', s0flat: '包络不变（σ = 0，就是傅里叶用的等幅正弦）',
    s0per: '每 {p} 秒振荡一周。', s0noosc: 'ω = 0，不振荡，只是纯指数。',
    s0hint: '观察顺序：先把 ω 停在 4，只拖 σ：σ 从 −1 拖到 0.5，包络从收紧变成张开，周期不变；再固定 σ、拖 ω，振荡变密，包络不变。「s 平面」图上留下的点就是你试过的信号：越往左衰减越快，越往上振荡越快。',

    s1k: '第 1 步 · 收敛域',
    s1t: '信号 e^(at) 一直在长，变换积分怎样才能算出一个有限的数？',
    s1e: '这一步要回答：为什么需要 σ？取信号 x(t) = e<sup>at</sup>·u(t)，u(t) 是<strong>单位阶跃</strong>（t &lt; 0 时为 0，t ≥ 0 时为 1），所以信号从 t = 0 开始按 e<sup>at</sup> 变化。<strong>拉普拉斯变换</strong>定义为 X(s) = ∫ x(t)·e<sup>−st</sup> dt。为了看清楚，先只取实数 s = σ（ω = 0）：被积函数是 e<sup>(a−σ)t</sup>。a &gt; 0 时傅里叶（σ = 0）的积分越积越大；乘上 e<sup>−σt</sup> 等于用增长率 σ 把信号「压」回去，只要 σ &gt; a，被积函数就衰减，积分收敛到 1/(σ − a)。让积分收敛的所有 s 组成的区域叫<strong>收敛域</strong>（ROC）；这里它是 Re s &gt; a（ω 不影响 |e<sup>−st</sup>|，所以对任意 ω 都一样）。',
    aSlider1: '信号的增长率 a', sigSlider1: '试探的 σ',
    s1lgInt: '被积函数 e^((a−σ)t)', s1lgRun: '从 0 积到 T 的面积 I(T)', s1lgLim: '极限 1/(σ − a)', s1lgOk: '试过且收敛的 σ', s1lgBad: '试过但发散的 σ', s1lgRoc: 'ROC：σ > a',
    c1a: '被积函数 e^((a−σ)t)（横轴 t，秒）', c1b: '积到 T 为止的面积 I(T)（横轴 T，秒）', c1c: 'σ 数轴：哪些 σ 让积分收敛',
    s1readout: 'a = {a}、σ = {sig}：σ − a = {d}。{verdict}',
    s1conv: '被积函数衰减，T = 10 秒时面积 I = {i10}，正趋向 1/(σ − a) = {lim}。', s1div: '被积函数不衰减，T = 10 秒时面积 I = {i10}，还在继续变大：积分发散，这个 σ 不在 ROC 里。', s1edge: 'σ 正好等于 a：被积函数恒为 1，面积 I(T) = T 一直线性增长，仍然发散。',
    s1hint: '观察顺序：先把 a 设为 0.5（一直增长的信号），σ 从 0 往右拖：σ = 0 就是傅里叶的情形，面积一直涨；过了 σ = 0.5，面积曲线变平，停在虚线 1/(σ − a) 上。σ 数轴上会留下你试过的点：绿色都在 a 右边，粉色都在左边——分界就是 ROC 的边。',

    s2k: '第 2 步 · 地形',
    s2t: '把 |X(s)| 画在整个 s 平面上，傅里叶变换藏在哪里？',
    s2e: '这一步要回答：X(s) 是 s 平面上每个点都有值的函数，它和傅里叶变换是什么关系？取一个衰减振荡 x(t) = (α² + β²)/β · e<sup>−αt</sup>·sin(βt)·u(t)，衰减率 α、角频率 β。按上一步同样的积分算出 X(s) = (α² + β²) / ((s + α)² + β²)，ROC 是 Re s &gt; −α。分母为 0 的点 s = −α ± jβ 叫<strong>极点</strong>，那里 |X| 无穷大；把 |X(s)| 的大小画成颜色，就像一张地形图，极点是两座尖峰。沿竖线 Re s = σ₀ 切一刀，得到 |X(σ₀ + jω)| 随 ω 的曲线；σ₀ = 0 这一刀，就是<strong>傅里叶变换</strong>的幅度 |X(jω)|（<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶页第 5 步：频谱</a>）——只要虚轴在 ROC 里，它就存在。',
    alSlider: '衰减率 α', beSlider: '振荡角频率 β', s0Slider: '切片位置 σ₀',
    s2lgMap: '颜色：|X(s)| 越亮越大（对数色阶）', s2lgPole: '极点', s2lgRoc: '暗区：不在 ROC 里', s2lgCut: '切片 Re s = σ₀ 与切出的曲线', s2lgOut: '虚线：切片在 ROC 外（只是公式的延拓）',
    c2a: '|X(s)| 地形（横轴 σ，纵轴 ω）', c2b: '切片 |X(σ₀ + jω)| 随 ω',
    s2readout: '极点在 −{al} ± j{be}，ROC：Re s > −{al}。切片 σ₀ = {s0}，{inroc}；切出的曲线在 ω = {pw} 处最高，|X| = {pk}。{fourier}',
    s2in: '在 ROC 里，离极点 {dist}', s2out: '不在 ROC 里：积分在这条线上发散，曲线只是公式的延拓，不是这个信号的变换', s2four: '这一刀就是傅里叶变换 |X(jω)|。',
    s2hint: '观察顺序：先把 σ₀ 设为 0（傅里叶那一刀），再往左拖向极点：切片离尖峰越近，切出的峰越高、越尖。拖过 −α 以后切片变成虚线，因为那条线已经出了 ROC。再拖 α：极点向虚轴靠近（α 变小）时，傅里叶那一刀上的峰也变高、变尖。',

    s3k: '第 3 步 · ROC 不能省',
    s3t: '同一个式子 1/(s − a)，为什么能对应两个不同的信号？',
    s3e: '这一步要回答：只写 X(s) 够不够？第 1 步算过，右侧信号 e<sup>at</sup>·u(t)（只在 t ≥ 0 有值，叫<strong>因果</strong>信号）的变换是 1/(s − a)，ROC 为 Re s &gt; a。换一个左侧信号 −e<sup>at</sup>·u(−t)（只在 t &lt; 0 有值，叫<strong>反因果</strong>），同样积分得到的也是 1/(s − a)，只是 ROC 变成 Re s &lt; a。式子一样，信号不同，区别全在 ROC。还有一条：信号绝对可积（∫|x|dt 有限，这里叫<strong>稳定</strong>）当且仅当 ROC 包含虚轴 Re s = 0，因为那条线上 |e<sup>−st</sup>| = 1。',
    aSlider3: '极点位置 a', rocRight: 'ROC：Re s > a（极点右边）', rocLeft: 'ROC：Re s < a（极点左边）',
    s3lgRoc: '收敛域 ROC', s3lgPole: '极点 a', s3lgAxis: '虚轴 Re s = 0', s3lgSig: '对应的信号 x(t)',
    c3a: 's 平面上的 ROC（横轴 σ，纵轴 ω）', c3b: '对应的信号 x(t)（横轴 t，秒）',
    s3readout: 'X(s) = 1/(s − ({a}))，{roc} → x(t) = {sig}，{side}。ROC {axis}虚轴 → {stab}。数值核对：在 s = {sx} + j1 处直接积分得 {num}，公式给 {form}。',
    s3sigR: 'e^({a}t)·u(t)', s3sigL: '−e^({a}t)·u(−t)', s3right: 'ROC 在极点右边', s3left: 'ROC 在极点左边',
    s3causal: '只在 t ≥ 0 有值（因果）', s3anti: '只在 t < 0 有值（反因果）', s3has: '包含', s3not: '不包含',
    s3stable: '绝对可积，稳定', s3unstable: '不绝对可积，不稳定', s3edgeA: 'a = 0：极点就在虚轴上，ROC 是开半平面，不含虚轴，不稳定（信号不衰减）',
    s3hint: '观察顺序：先把 a 设为 −0.8，在两个 ROC 按钮之间来回切：式子没变，信号从右边衰减的指数变成左边的「向过去爆炸」。再把 a 拖到 +0.8：这回是「ROC 在左边」那个信号稳定。规律始终是看 ROC 有没有盖住虚轴。读数里的数值核对是对信号直接做积分得到的，不是抄公式。',
    quizPrompt: '小测：X(s) = 1/(s + 1)，ROC 是 Re s < −1。对应的信号稳定吗？',
    quizA: '稳定：极点在左半平面就稳定', quizB: '不稳定：ROC 没有包含虚轴，信号是 −e^(−t)u(−t)，t → −∞ 时爆炸', quizC: '无法判断：要先知道初始条件',
    check: '核对', correct: '对。「极点在左半平面就稳定」只对因果信号成立；这里 ROC 在左边，信号是反因果的，往过去爆炸。把 a 拨到 −1、选「极点左边」可以核对。', wrong: '再想想：看 ROC 有没有盖住虚轴 Re s = 0。把 a 拨到 −1、选「极点左边」可以核对。',

    s4k: '第 4 步 · 极点即性格',
    s4t: '把一对极点放在 s 平面的不同位置，冲激响应会怎样变？',
    s4e: '这一步要回答：极点的位置能告诉我们信号的什么？对因果信号，每一对极点 p = σ<sub>p</sub> ± jω<sub>p</sub> 都在冲激响应（系统被敲一下后的输出，<a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ LTI 系统页第 2 步：h 是系统的指纹</a>）里留下一项 e<sup>σ<sub>p</sub>t</sup>·cos(ω<sub>p</sub>t)：极点的<strong>实部</strong>就是包络的增长率，<strong>虚部</strong>就是振荡的角频率——正是第 0 步那块积木。所以：极点在左半平面，响应衰减（稳定）；在虚轴上，等幅振荡（临界）；在右半平面，越来越大（不稳定）。离虚轴越远，衰减越快；离实轴越远，振荡越快。',
    spSlider: '极点实部 σ_p', wpSlider: '极点虚部 ω_p',
    s4lgPole: '当前极点对', s4lgSt: '试过：稳定', s4lgMg: '试过：临界', s4lgUn: '试过：不稳定', s4lgH: '冲激响应 e^(σ_p t)·cos(ω_p t)', s4lgEnv: '包络 ±e^(σ_p t)',
    c4a: '极点位置（横轴 σ，纵轴 ω）', c4b: '冲激响应（横轴 t，秒）',
    s4readout: '极点 {sp} ± j{wp}：{kind}。{decay}{osc}',
    s4stable: '在左半平面，稳定', s4marg: '在虚轴上，临界（不衰减也不增长）', s4unst: '在右半平面，不稳定',
    s4settle: '包络降到 2% 需 ln 50 / |σ_p| = {ts} 秒；', s4grow: '包络每 {tg} 秒翻倍；', s4flat: '包络恒为 1；',
    s4per: '振荡周期 2π/ω_p = {p} 秒。', s4noper: 'ω_p = 0，不振荡。',
    s4hint: '观察顺序：先保持 ω_p = 3，把 σ_p 从 −1.5 拖到 0.5：响应从很快消失，到越拖越久，到 σ_p = 0 时等幅不停，再到越来越大。再固定 σ_p = −0.3、拖 ω_p：包络不变，振荡变密。「极点位置」图上每个试过的点都按稳定性着色，三种颜色正好以虚轴为界分开。',

    s5k: '第 5 步 · 从极点读频响',
    s5t: '沿着虚轴走一遍，增益为什么在极点旁边冒尖？',
    s5e: '这一步要回答：给定极点，怎样不算积分就看出<strong>频率响应</strong>（输入角频率 ω 的正弦时，输出振幅 ÷ 输入振幅，<a class="xlink" href="../../../signal/systems/frequency-response/#step1">→ 频率响应页第 1 步：正弦进、正弦出</a>）？它就是 H(s) 在虚轴上的值 |H(jω)|。还是第 2 步的系统 H(s) = (α² + β²)/((s − p₁)(s − p₂))，p₁,₂ = −α ± jβ。分母的每个因子 s − p 的大小，就是点 s 到极点 p 的距离。所以在虚轴上：<strong>|H(jω)| = (α² + β²) / (d₁·d₂)</strong>，d₁、d₂ 是点 jω 到两个极点的距离。走到极点旁边，d₁ 变得很小，增益就冒尖；α 越小（极点越贴近虚轴），尖峰越高越窄。峰的位置在 ω = √(β² − α²)（β &gt; α 时）。',
    wSlider5: '输入角频率 ω（弧度/秒）', alSlider5: '衰减率 α（极点到虚轴的距离）',
    sweep5: '沿虚轴从 ω = 0 走到 5', s5prog: '已走过 {c}/{N} 个 ω。',
    s5lgPole: '极点 −α ± jβ（β = 2）', s5lgD1: '到上方极点的距离 d₁', s5lgD2: '到下方极点的距离 d₂', s5lgPt: '虚轴上的点 jω', s5lgCurve: '|H(jω)|（公式）', s5lgDot: '你走过的 ω',
    c5a: 's 平面：从 jω 到两个极点', c5b: '增益 |H(jω)|（横轴 ω）',
    s5readout: 'ω = {w}：d₁ = {d1}、d₂ = {d2} → (α² + β²)/(d₁d₂) = {g}（直接代入 H(jω) 也是 {h}）。峰在 ω = {pw}，高 {pk}。',
    s5hint: '观察顺序：α 保持 0.3，把 ω 从 0 慢慢拖到 5：上方那条橙线先变短再变长，增益曲线上留下的点在 ω ≈ 2 附近冒尖。再把 α 拖到 0.1 和 1.5 各走一遍：极点贴近虚轴时峰又高又窄（共振），远离时几乎平坦。',

    s6k: '第 6 步 · 收束',
    s6t: '拉普拉斯变换比傅里叶多给了什么？',
    s6fin: '拉普拉斯变换用 e<sup>st</sup> 去量信号，s = σ + jω 同时规定了增长率和角频率（第 0 步）。乘上 e<sup>−σt</sup> 能让增长的信号也积得出来，但只在一部分 s 上收敛，这个区域就是 ROC（第 1 步）。|X(s)| 是一张以极点为尖峰的地形，傅里叶变换只是 σ = 0 那一刀，而且只有虚轴在 ROC 里时才存在（第 2 步）。同一个式子配不同的 ROC 是不同的信号，稳定与否看 ROC 是否包含虚轴（第 3 步）。对因果系统，极点实部决定衰减或增长，虚部决定振荡（第 4 步），频率响应可以用到极点的距离直接读出来（第 5 步）。',
    formula: 'X(s) = ∫ x(t)·e^(−st) dt，s = σ + jω\ne^(at)u(t) ↔ 1/(s − a)，ROC：Re s > a\n−e^(at)u(−t) ↔ 1/(s − a)，ROC：Re s < a\n稳定 ⇔ ROC 包含虚轴；X(jω) = 傅里叶变换（虚轴在 ROC 里时）\n|H(jω)| = K / Π|jω − pᵢ|（只有极点、没有零点时）',
    boundary: '适用范围：本页用双边拉普拉斯变换，信号都是指数或衰减正弦；「极点在左半平面 ⇔ 稳定」只对因果系统成立；第 5 步的距离公式只适用于没有零点的 H(s)（有零点时还要乘上到零点的距离）。初值问题常用的单边变换、零点的作用、根轨迹等不在本页范围内。',
    linksTitle: '接着去看',
    lk1: '阶跃响应 · 第 4 步：二阶系统的两个旋钮，其实是复平面上的一个极点 →',
    lk2: '频率响应 · 第 2 步：把 |H(jω)| 画成波特图 →',
    lk3: 'Z 变换（Claude 版）· 第 2 步：z = e^(sT) 把左半平面卷进单位圆 →',
    lk4: 'LTI 系统 · 第 5 步：从冲激响应 h 读出系统的性格 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《拉普拉斯与 ROC · 给频率配一个寿命》的平行版本。'
  },
  en: {
    pageTitle: 'The Laplace Transform · Giving Every Frequency a Growth Rate',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Laplace Transform & ROC · Giving Frequencies a Lifespan →',
    navLabel: 'Laplace transform steps',
    tagline: 'The Fourier transform measures a signal only against sinusoids that ring forever at constant size; hand it a signal that keeps growing and its integral blows up. The Laplace transform gives every frequency a growth rate σ as well, turning "a frequency" into a point s = σ + jω in the complex plane. In seven steps you will see when that integral converges, why the region of convergence (ROC) must always be stated, and how the positions of the poles decide a system\'s whole character.',
    nav0: '0 One point s', nav1: '1 When it converges', nav2: '2 Terrain & slice', nav3: '3 One formula, two signals', nav4: '4 Poles as character', nav5: '5 Response from poles', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The building block',
    s0t: 'What kind of signal does one complex number s = σ + jω describe?',
    s0e: 'The question here: what does the building block e<sup>st</sup>, the thing the Laplace transform measures signals against, look like? s is a complex number with real part σ and imaginary part ω, and j is the imaginary unit (j² = −1). By Euler\'s formula e<sup>st</sup> = e<sup>σt</sup>·(cos ωt + j·sin ωt): the real part is a cosine cos ωt wrapped in an envelope e<sup>σt</sup>. ω is the <strong>angular frequency</strong> (radians per second, the angle turned each second; period = 2π/ω). σ is the <strong>growth rate</strong> (per second): with σ &lt; 0 the envelope decays exponentially, with σ &gt; 0 it grows, and σ = 0 is the constant-size sinusoid that the Fourier transform uses (<a class="xlink" href="../exponents-logarithms/#step1">→ Exponents & logarithms (Claude edition) step 1: exponential curves and half-lives</a>). So each point of the s-plane is an "oscillation with a lifespan".',
    sigSlider0: 'Growth rate σ (1/s)', wSlider0: 'Angular frequency ω (rad/s)',
    s0lgPt: 'Current s', s0lgTrail: 'Values of s you tried', s0lgWave: 'Real part e^(σt)·cos ωt', s0lgEnv: 'Envelope ±e^(σt)',
    c0a: 'The s-plane (σ across, ω up)', c0b: 'Re e^(st) over time (s)',
    s0readout: 's = {sig} + j{w}: {life}; {osc}',
    s0half: 'the envelope halves every {h} s', s0dbl: 'the envelope doubles every {h} s', s0flat: 'the envelope stays put (σ = 0, the constant sinusoid Fourier uses)',
    s0per: 'one oscillation every {p} s.', s0noosc: 'ω = 0, so there is no oscillation, just an exponential.',
    s0hint: 'What to watch: park ω at 4 and drag only σ, from −1 to 0.5. The envelope goes from closing in to opening out while the period stays the same. Then hold σ and drag ω: the wiggles get denser and the envelope does not change. The dots left on the s-plane are the signals you tried: further left decays faster, higher up oscillates faster.',

    s1k: 'Step 1 · Region of convergence',
    s1t: 'The signal e^(at) keeps growing. How can the transform integral still give a finite number?',
    s1e: 'The question here: why do we need σ at all? Take x(t) = e<sup>at</sup>·u(t), where u(t) is the <strong>unit step</strong> (0 for t &lt; 0, 1 for t ≥ 0), so the signal follows e<sup>at</sup> from t = 0 on. The <strong>Laplace transform</strong> is X(s) = ∫ x(t)·e<sup>−st</sup> dt. To see things clearly, first take s real, s = σ (ω = 0): the integrand is e<sup>(a−σ)t</sup>. With a &gt; 0, Fourier\'s integral (σ = 0) grows without bound. Multiplying by e<sup>−σt</sup> pushes the signal back down at rate σ, and as long as σ &gt; a the integrand decays and the integral converges to 1/(σ − a). The set of all s for which the integral converges is the <strong>region of convergence</strong> (ROC); here it is Re s &gt; a (ω does not change |e<sup>−st</sup>|, so the answer is the same for every ω).',
    aSlider1: 'Signal growth rate a', sigSlider1: 'Trial σ',
    s1lgInt: 'Integrand e^((a−σ)t)', s1lgRun: 'Area from 0 to T, I(T)', s1lgLim: 'Limit 1/(σ − a)', s1lgOk: 'Tried σ that converged', s1lgBad: 'Tried σ that diverged', s1lgRoc: 'ROC: σ > a',
    c1a: 'Integrand e^((a−σ)t) (t in seconds)', c1b: 'Area accumulated up to T, I(T) (T in seconds)', c1c: 'The σ line: which σ make the integral converge',
    s1readout: 'a = {a}, σ = {sig}: σ − a = {d}. {verdict}',
    s1conv: 'The integrand decays; by T = 10 s the area is I = {i10}, heading for 1/(σ − a) = {lim}.', s1div: 'The integrand does not decay; by T = 10 s the area is I = {i10} and still growing. The integral diverges, so this σ is outside the ROC.', s1edge: 'σ equals a exactly: the integrand is 1 everywhere and the area I(T) = T grows in a straight line, so it still diverges.',
    s1hint: 'What to watch: set a = 0.5 (a signal that keeps growing) and drag σ right from 0. σ = 0 is the Fourier case and the area keeps climbing; once σ passes 0.5 the area curve flattens onto the dashed line 1/(σ − a). Each σ you try stays on the σ line: green ones all sit right of a, pink ones left of it, and the boundary is the edge of the ROC.',

    s2k: 'Step 2 · The terrain',
    s2t: 'Paint |X(s)| over the whole s-plane. Where is the Fourier transform hiding?',
    s2e: 'The question here: X(s) has a value at every point of the s-plane, so how does it relate to the Fourier transform? Take a decaying oscillation x(t) = (α² + β²)/β · e<sup>−αt</sup>·sin(βt)·u(t) with decay rate α and angular frequency β. The same kind of integral as in the last step gives X(s) = (α² + β²) / ((s + α)² + β²) with ROC Re s &gt; −α. The points s = −α ± jβ where the denominator vanishes are the <strong>poles</strong>, and |X| is infinite there. Paint the size of |X(s)| as colour and you get a terrain map in which the poles are two spikes. Cut along the vertical line Re s = σ₀ and you get the curve |X(σ₀ + jω)| against ω. The cut at σ₀ = 0 is the magnitude of the <strong>Fourier transform</strong> |X(jω)| (<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier page step 5: the spectrum</a>), and it exists only when the imaginary axis lies in the ROC.',
    alSlider: 'Decay rate α', beSlider: 'Oscillation frequency β', s0Slider: 'Cut position σ₀',
    s2lgMap: 'Colour: brighter = larger |X(s)| (log scale)', s2lgPole: 'Pole', s2lgRoc: 'Dimmed: outside the ROC', s2lgCut: 'The cut Re s = σ₀ and the curve it gives', s2lgOut: 'Dashed: the cut lies outside the ROC (formula continuation only)',
    c2a: 'Terrain of |X(s)| (σ across, ω up)', c2b: 'Cut |X(σ₀ + jω)| against ω',
    s2readout: 'Poles at −{al} ± j{be}, ROC: Re s > −{al}. Cut at σ₀ = {s0}: {inroc}; the cut curve peaks at ω = {pw} with |X| = {pk}. {fourier}',
    s2in: 'inside the ROC, {dist} from the poles', s2out: 'outside the ROC; the integral diverges on this line, so the curve is only the formula continued, not this signal\'s transform', s2four: 'This cut is the Fourier transform |X(jω)|.',
    s2hint: 'What to watch: set σ₀ = 0 first (the Fourier cut), then drag it left towards the poles. The closer the cut runs to the spikes, the taller and sharper its peak. Past −α the cut turns dashed, because that line has left the ROC. Then drag α: as the poles move towards the imaginary axis (α smaller), the peak on the Fourier cut also grows taller and sharper.',

    s3k: 'Step 3 · The ROC is not optional',
    s3t: 'One formula, 1/(s − a). Why can it stand for two different signals?',
    s3e: 'The question here: is writing X(s) enough? Step 1 showed that the right-sided signal e<sup>at</sup>·u(t) (nonzero only for t ≥ 0, called <strong>causal</strong>) has transform 1/(s − a) with ROC Re s &gt; a. Now take the left-sided signal −e<sup>at</sup>·u(−t) (nonzero only for t &lt; 0, called <strong>anti-causal</strong>). The same integral also gives 1/(s − a), only with ROC Re s &lt; a. Same formula, different signals: the difference lives entirely in the ROC. One more rule: a signal is absolutely integrable (∫|x|dt is finite, what we call <strong>stable</strong> here) exactly when the ROC contains the imaginary axis Re s = 0, because |e<sup>−st</sup>| = 1 on that line.',
    aSlider3: 'Pole position a', rocRight: 'ROC: Re s > a (right of the pole)', rocLeft: 'ROC: Re s < a (left of the pole)',
    s3lgRoc: 'Region of convergence (ROC)', s3lgPole: 'Pole a', s3lgAxis: 'Imaginary axis Re s = 0', s3lgSig: 'The matching signal x(t)',
    c3a: 'The ROC in the s-plane (σ across, ω up)', c3b: 'The matching signal x(t) (t in seconds)',
    s3readout: 'X(s) = 1/(s − ({a})), {roc} → x(t) = {sig}, {side}. The ROC {axis} the imaginary axis → {stab}. Numerical check: integrating the signal directly at s = {sx} + j1 gives {num}; the formula gives {form}.',
    s3sigR: 'e^({a}t)·u(t)', s3sigL: '−e^({a}t)·u(−t)', s3right: 'ROC right of the pole', s3left: 'ROC left of the pole',
    s3causal: 'nonzero only for t ≥ 0 (causal)', s3anti: 'nonzero only for t < 0 (anti-causal)', s3has: 'contains', s3not: 'does not contain',
    s3stable: 'absolutely integrable, stable', s3unstable: 'not absolutely integrable, unstable', s3edgeA: 'a = 0: the pole sits on the imaginary axis; the ROC is an open half-plane that leaves the axis out, so it is unstable (the signal never decays)',
    s3hint: 'What to watch: set a = −0.8 and switch between the two ROC buttons. The formula does not change, yet the signal flips from an exponential decaying to the right into one that "explodes into the past" on the left. Then drag a to +0.8: now it is the left-ROC signal that is stable. The rule is always whether the ROC covers the imaginary axis. The numerical check in the readout integrates the signal directly; it is not copied from the formula.',
    quizPrompt: 'Quick check: X(s) = 1/(s + 1) with ROC Re s < −1. Is the matching signal stable?',
    quizA: 'Stable: a pole in the left half-plane means stable', quizB: 'Unstable: the ROC leaves out the imaginary axis; the signal is −e^(−t)u(−t), which explodes as t → −∞', quizC: 'Cannot tell without initial conditions',
    check: 'Check', correct: 'Right. "Left-half-plane poles mean stable" holds only for causal signals; here the ROC is on the left, so the signal is anti-causal and blows up towards the past. Set a to −1 and pick "left of the pole" to confirm.', wrong: 'Not quite: look at whether the ROC covers the imaginary axis Re s = 0. Set a to −1 and pick "left of the pole" to confirm.',

    s4k: 'Step 4 · Poles as character',
    s4t: 'Move a pair of poles around the s-plane. How does the impulse response change?',
    s4e: 'The question here: what does a pole\'s position tell us about the signal? For a causal signal, every pole pair p = σ<sub>p</sub> ± jω<sub>p</sub> leaves a term e<sup>σ<sub>p</sub>t</sup>·cos(ω<sub>p</sub>t) in the impulse response (the system\'s output after one sharp tap, <a class="xlink" href="../../../signal/systems/lti-systems/#step2">→ LTI systems page step 2: h is the system\'s fingerprint</a>). The pole\'s <strong>real part</strong> is the envelope\'s growth rate and its <strong>imaginary part</strong> is the angular frequency of the wiggle: exactly the building block from step 0. So poles in the left half-plane give a decaying (stable) response, poles on the imaginary axis a constant-size oscillation (marginal), and poles in the right half-plane a growing one (unstable). Further from the imaginary axis means faster decay; further from the real axis means faster oscillation.',
    spSlider: 'Pole real part σ_p', wpSlider: 'Pole imaginary part ω_p',
    s4lgPole: 'Current pole pair', s4lgSt: 'Tried: stable', s4lgMg: 'Tried: marginal', s4lgUn: 'Tried: unstable', s4lgH: 'Impulse response e^(σ_p t)·cos(ω_p t)', s4lgEnv: 'Envelope ±e^(σ_p t)',
    c4a: 'Pole positions (σ across, ω up)', c4b: 'Impulse response (t in seconds)',
    s4readout: 'Poles at {sp} ± j{wp}: {kind}. {decay}{osc}',
    s4stable: 'in the left half-plane, stable', s4marg: 'on the imaginary axis, marginal (neither decays nor grows)', s4unst: 'in the right half-plane, unstable',
    s4settle: 'the envelope falls to 2% after ln 50 / |σ_p| = {ts} s; ', s4grow: 'the envelope doubles every {tg} s; ', s4flat: 'the envelope stays at 1; ',
    s4per: 'the oscillation period 2π/ω_p = {p} s.', s4noper: 'ω_p = 0, so there is no oscillation.',
    s4hint: 'What to watch: keep ω_p = 3 and drag σ_p from −1.5 to 0.5. The response goes from dying almost at once, to lingering longer and longer, to ringing forever at σ_p = 0, to growing without bound. Then hold σ_p = −0.3 and drag ω_p: the envelope stays and the wiggles get denser. Every pole you try stays on the "pole positions" chart, coloured by stability, and the three colours split exactly at the imaginary axis.',

    s5k: 'Step 5 · Reading the response from the poles',
    s5t: 'Walk up the imaginary axis. Why does the gain spike next to a pole?',
    s5e: 'The question here: given the poles, how can you see the <strong>frequency response</strong> (with a sinusoid of angular frequency ω going in, output amplitude ÷ input amplitude; <a class="xlink" href="../../../signal/systems/frequency-response/#step1">→ Frequency response page step 1: sine in, sine out</a>) without doing any integral? It is just H(s) evaluated on the imaginary axis, |H(jω)|. Keep the system of step 2, H(s) = (α² + β²)/((s − p₁)(s − p₂)) with p₁,₂ = −α ± jβ. The size of each factor s − p is the distance from the point s to the pole p. So on the imaginary axis <strong>|H(jω)| = (α² + β²) / (d₁·d₂)</strong>, where d₁ and d₂ are the distances from jω to the two poles. Walk past a pole and d₁ becomes small, so the gain spikes; the smaller α (the closer the poles hug the axis), the taller and narrower the spike. The peak sits at ω = √(β² − α²) (when β &gt; α).',
    wSlider5: 'Input angular frequency ω (rad/s)', alSlider5: 'Decay rate α (pole distance from the axis)',
    sweep5: 'Walk the axis from ω = 0 to 5', s5prog: 'Walked {c}/{N} values of ω. ',
    s5lgPole: 'Poles −α ± jβ (β = 2)', s5lgD1: 'Distance d₁ to the upper pole', s5lgD2: 'Distance d₂ to the lower pole', s5lgPt: 'The point jω on the axis', s5lgCurve: '|H(jω)| (formula)', s5lgDot: 'Values of ω you walked through',
    c5a: 'The s-plane: from jω to both poles', c5b: 'Gain |H(jω)| (ω across)',
    s5readout: 'ω = {w}: d₁ = {d1}, d₂ = {d2} → (α² + β²)/(d₁d₂) = {g} (plugging jω straight into H also gives {h}). The peak is at ω = {pw} with height {pk}.',
    s5hint: 'What to watch: keep α = 0.3 and drag ω slowly from 0 to 5. The orange line to the upper pole shrinks and then grows again, and the dots left on the gain curve spike near ω ≈ 2. Then walk the axis again with α = 0.1 and α = 1.5: with the poles hugging the axis the peak is tall and narrow (resonance); far from it the curve is almost flat.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What does Laplace give us that Fourier does not?',
    s6fin: 'The Laplace transform measures signals against e<sup>st</sup>, where s = σ + jω fixes both a growth rate and an angular frequency (step 0). Multiplying by e<sup>−σt</sup> lets even growing signals be integrated, but only for some s; that set is the ROC (step 1). |X(s)| is a terrain with spikes at the poles, and the Fourier transform is just the σ = 0 cut, which exists only if the imaginary axis lies in the ROC (step 2). The same formula with different ROCs means different signals, and stability depends on whether the ROC contains the imaginary axis (step 3). For a causal system, a pole\'s real part sets decay or growth and its imaginary part sets the oscillation (step 4), and the frequency response can be read straight off the distances to the poles (step 5).',
    formula: 'X(s) = ∫ x(t)·e^(−st) dt, s = σ + jω\ne^(at)u(t) ↔ 1/(s − a), ROC: Re s > a\n−e^(at)u(−t) ↔ 1/(s − a), ROC: Re s < a\nstable ⇔ ROC contains the imaginary axis; X(jω) = Fourier transform (when the axis is in the ROC)\n|H(jω)| = K / Π|jω − pᵢ| (poles only, no zeros)',
    boundary: 'Scope: this page uses the two-sided Laplace transform, and every signal is an exponential or a decaying sinusoid. "Left-half-plane poles ⇔ stable" holds only for causal systems. The distance formula of step 5 applies only to an H(s) without zeros (zeros multiply in their own distances). The one-sided transform used for initial-value problems, the role of zeros and root locus are outside this page.',
    linksTitle: 'Where to go next',
    lk1: 'Step response · step 4: a second-order system\'s two knobs are really one pole in the complex plane →',
    lk2: 'Frequency response · step 2: drawing |H(jω)| as a Bode plot →',
    lk3: 'Z-transform (Claude edition) · step 2: z = e^(sT) rolls the left half-plane into the unit circle →',
    lk4: 'LTI systems · step 5: reading a system\'s character from its impulse response h →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "Laplace Transform & ROC · Giving Frequencies a Lifespan".'
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
  if (typeof window.refreshLaplace === 'function') window.refreshLaplace();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LAP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
