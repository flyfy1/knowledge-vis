'use strict';
// Fourier lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '傅里叶变换 · 派探针去问每一个频率',
    back: '← 知识索引',
    compare: '对照另一版本：傅里叶变换 · 一步一交互 →',
    navLabel: '傅里叶变换步骤导航',
    tagline: '手里只有一条弯弯曲曲的信号曲线，想知道它由哪些频率、各多强的正弦波叠成。傅里叶变换的做法很朴素：给每个频率派一个同频的正弦当探针，乘起来求平均，读数就是答案。六步里你会亲手做这件事，看它怎样处理相位、怎样受录音长度限制、怎样把信号拼回来，以及只剩 N 个采样点时会发生什么。',
    nav0: '0 凑一凑', nav1: '1 探针', nav2: '2 相位', nav3: '3 分辨率', nav4: '4 拼回去', nav5: '5 采样之后', nav6: '6 收束',

    s0k: '第 0 步 · 问题',
    s0t: '只看这条和曲线，能说出里面三段正弦各有多强吗？',
    s0e: '这一步要回答：一段信号是由哪些频率、各多强的成分叠成的？白线是 1 秒长的信号 x(t)，横轴是时间（s），纵轴是信号值。先透露一半答案：它恰好是三个<strong>正弦波</strong> a·sin(2πft) 相加（f 是<strong>频率</strong>，每秒振动几次，单位 Hz；a 是<strong>振幅</strong>，即波峰高度；<a class="xlink" href="../../../math/geometry/trigonometry/#step3">→ 三角函数第 3 步：正弦与余弦从哪来</a>），三个频率是 2、5、9 Hz。你要找的是三个振幅。拖三个滑杆凑出你的猜测（青线），红线是信号减去猜测的差。<strong>均方根误差</strong>（把差逐点平方、对 1 秒求平均、再开方；0 表示完全吻合）告诉你离答案还有多远。',
    guess: '{f} Hz 的振幅',
    reveal: '揭晓三个成分', hide: '藏起成分',
    c0a: '信号 x(t) 与你的猜测（横轴：时间，单位 s）',
    lg0X: '白线：信号 x(t)', lg0G: '青线：你的猜测', lg0R: '红线：两者之差', lg0C: '虚线：三个成分（揭晓后显示）',
    s0readout: '你的猜测：{g}。均方根误差 {e}（0 表示完全吻合）。{ans}',
    s0ans: '答案：{a}。',
    s0hint: '观察顺序：先只拖 2 Hz 的滑杆，看红线里最慢的那层起伏变小；再拖 5 Hz 和 9 Hz。三层混在一起时，某一段鼓包该算在谁头上很难判断——凑得出来，也说不清为什么对。下一步给一个不用凑的办法。',

    s1k: '第 1 步 · 正弦探针',
    s1t: '怎样只把 k Hz 那一层问出来，又不受其他层干扰？',
    s1e: '这一步要回答：有没有一种运算，输入整条 x(t)，输出「x 里含多少 k Hz 的正弦」？办法是派一个 k Hz 的正弦 sin(2πkt) 当<strong>探针</strong>：把 x(t) 和探针逐点相乘，对 1 秒求平均，再乘 2，记作 b_k。如果 x 里有同频的 a·sin(2πkt)，这一层与探针的乘积是 a·sin²(2πkt)，处处不为负，平均是 a/2，乘 2 正好得 a。频率不同的层和探针相乘，乘积在 1 秒里正负面积相等，平均恰为 0——两者叫<strong>正交</strong>（条件：两个频率都是整数 Hz，在 1 秒里都走完整数个周期）。第一张图是 x(t)（灰）和探针（橙）；第二张图是逐点乘积，零线上方涂绿、下方涂红，b_k 就是净面积的 2 倍；第三张图把你问过的每个 k 的读数画成一根柱子。',
    kLabel: '探针频率 k（Hz）', sweep1: '从 k = 1 扫到 12', clearBars: '清空柱子',
    c1a: 'x(t)（灰）与探针 sin(2πkt)（橙）（横轴：时间 s）', c1b: '逐点乘积 x(t)·sin(2πkt)', c1c: '问过的读数 b_k（横轴：k，单位 Hz）',
    lg1X: '灰线：信号 x(t)', lg1P: '橙线：探针', lg1Pos: '绿：乘积为正', lg1Neg: '红：乘积为负', lg1Bar: '柱子：读数 b_k',
    s1progress: '已问 {c}/{N} 个频率 · ',
    s1readout: '{prog}k = {k} Hz：乘积的平均 = {m}，b_k = 2 × {m} = {b}。{why}',
    s1hit: '和 x 里 {k} Hz 那一层的振幅一样。',
    s1miss: 'x 里没有 {k} Hz 的成分：正负面积抵消，读数为 0。',
    s1hint: '观察顺序：把 k 拖到 5，第二张图几乎全绿——同频相乘处处不为负（个别红块来自其他两层，它们自己的平均是 0）；拖到 6，绿红交替，净面积为 0。再按「从 k = 1 扫到 12」，第三张图一根根长出柱子：只有 2、5、9 处有柱，高度正是第 0 步的答案。',

    s2k: '第 2 步 · 相位',
    s2t: '如果某一层起步时提前了一个角度，正弦探针还读得准吗？',
    s2e: '这一步要回答：5 Hz 那一层若不从 0 开始，而是写成 0.5·sin(2π·5t + φ)，第 1 步的方法会怎样？φ 叫<strong>相位</strong>，表示这一层提前了多少角度起步。展开得 0.5·cos φ·sin(2π·5t) + 0.5·sin φ·cos(2π·5t)：它其实是一段正弦和一段余弦的混合。正弦探针只读到前一部分 0.5·cos φ；φ = 90° 时读数为 0，好像这一层消失了。补救是再派一个<strong>余弦探针</strong> cos(2π·5t)，同样乘、平均、乘 2，读到后一部分 0.5·sin φ。把两个读数当作平面上一个点的横、纵坐标：点到原点的距离（叫<strong>模</strong>）就是振幅 0.5，点的方向角就是 φ。用复数写，两个探针合成一个 e^(−i2πkt) = cos(2πkt) − i·sin(2πkt)，这就是傅里叶变换用的探针（<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ 复数第 4 步：复数乘法就是模相乘、角相加</a>）。',
    phLabel: '5 Hz 那一层的相位 φ（度）', clearTrail: '清空白点',
    c2a: 'x(t)（白）与其中的 5 Hz 层（青）（横轴：时间 s）', c2b: '5 Hz 的两个读数（横：正弦探针；纵：余弦探针）',
    lg2X: '白线：x(t)', lg2C: '青线：5 Hz 那一层', lg2Pt: '橙点：当前两个读数', lg2Trail: '白点：试过的相位', lg2Circle: '虚线圆：半径 0.5',
    s2readout: 'φ = {ph}°：正弦探针读数 {s}（= 0.5·cos φ），余弦探针读数 {c}（= 0.5·sin φ）。模 √({s}² + {c}²) = {m}，方向角 {ang}°。{warn}',
    s2warn: '只看正弦探针，会以为 5 Hz 这一层几乎不存在。',
    s2hint: '观察顺序：把 φ 从 0 慢慢拖到 90°，看第二张图里橙点沿虚线圆走了四分之一圈：横坐标（正弦探针）降到 0，纵坐标（余弦探针）升到 0.5，到原点的距离一直是 0.5。2 Hz 和 9 Hz 两层与两个 5 Hz 探针都正交，所以不管 φ 怎么变，它们都不进这个读数。',

    s3k: '第 3 步 · 分辨率',
    s3t: '两个频率靠得很近时，要录多长才分得开？',
    s3e: '这一步要回答：前几步的窗口都是 1 秒、频率都是整数，读数要么是振幅、要么是 0；真实信号不会这么凑巧。把探针频率 f 连续地扫，每个 f 都做一次第 2 步的「正弦 + 余弦」读数并取模，得到一条曲线，叫长度为 T 的窗口里的<strong>频谱</strong>（横轴是探针频率 f，纵轴是读数的模）。一个单独的正弦在频谱上不是一根细线，而是一个宽 2/T 的鼓包（零点到零点），两边还拖着一串小鼓包，叫<strong>泄漏</strong>——窗口把波形截断了。这里放两个等强（振幅都是 1）、都从相位 0 起步的正弦：5 Hz 和 5 + Δ Hz。我们规定：两个真实频率之间的谷底低于两处读数中较小者的 80%，才算「分得开」。',
    TLabel: '窗口长度 T（s）', dLabel: '频率差 Δ（Hz）', clearMap: '清空点阵',
    c3a: '长度 T 的窗口里的频谱（横轴：f，单位 Hz）', c3b: '分得开吗？（横轴：T，单位 s；纵轴：Δ，单位 Hz）',
    lg3Spec: '青线：频谱', lg3Tones: '橙色竖线：两个真实频率', lg3Yes: '绿点：分得开', lg3No: '红点：分不开', lg3Line: '虚线：本页判据的分界 Δ·T ≈ 0.72–0.75',
    s3readout: 'T = {T} s，Δ = {d} Hz，Δ·T = {dT}。单个鼓包宽 2/T = {w} Hz。谷底 / 较矮峰 = {ratio}：{res}',
    s3yes: '低于 80%，分得开。', s3no: '不低于 80%，两个峰糊成了一个，分不开。',
    s3hint: '观察顺序：先把 Δ 定在 0.5 Hz，把 T 从 0.5 s 慢慢拖长，看两个鼓包从糊成一团到分开；每试一个组合，第二张图留一个点。点阵的绿红分界贴着虚线 Δ·T ≈ 0.72–0.75：在本页的判据下，频率差要超过约 0.72/T 到 0.75/T 才分得开（常见的粗略说法是「约 1/T」）。分界的具体数随判据和两个正弦的相位而变，但「窗口越长、分辨越细」不变。',

    s4k: '第 4 步 · 拼回去',
    s4t: '把读数乘回各自的正弦再加起来，能拼出带棱角的方波吗？',
    s4e: '这一步要回答：知道了每个频率的读数，能不能反过来把信号拼回来？拿一个 1 Hz 的<strong>方波</strong>：前半秒 +1，后半秒 −1。用第 1 步的正弦探针去问，它只含奇数频率 1、3、5…… Hz，读数 b_k = 4/(πk)。把前 N 项 b_k·sin(2πkt) 加起来，叫第 N 个<strong>部分和</strong>。N 越大，部分和越贴近方波；但跳变旁边总有一个冲过头的尖角，这叫<strong>吉布斯现象</strong>。第一张图是部分和（青）和方波（灰虚线）；第二张图记录你试过的每个 N：橙点是部分和的最高点超出 1 的量，青点是部分和与方波之差的<strong>均方根误差</strong>（逐点平方、平均、开方，越小越像）。',
    nLabel: '加入的项数 N', clearN: '清空记录',
    c4a: '部分和与方波（横轴：时间 s）', c4b: '超出 1 的量（橙）与均方根误差（青）（横轴：N）',
    lg4Sum: '青线：前 N 项之和', lg4Sq: '灰色虚线：方波', lg4Os: '橙点：最高点超出 1 的量', lg4Rms: '青点：均方根误差',
    nOut: '{n}（最高 {k} Hz）',
    s4readout: 'N = {n}（用到 1、3、…、{k} Hz）：最高点 {peak}，超出 1 的量 {os}，是跳变高度 2 的 {pct}%；均方根误差 {rms}。',
    s4hint: '观察顺序：把 N 从 1 拖到 40，看第二张图：青点（均方根误差）一路降向 0，橙点却停在约 0.18（跳变高度的约 9%）不再下降——尖角只是越来越窄、越来越贴近跳变。所以「项数越多越像」在均方根意义上成立，但跳变旁的最大误差不会趋于 0。',

    s5k: '第 5 步 · 采样之后',
    s5t: '只剩 N 个采样点时，频谱为什么左右对称，又会在哪里折回来？',
    s5e: '这一步要回答：计算机里没有连续的 x(t)，只有每隔 1/N 秒取一次的 N 个数 x[0], …, x[N−1]。对它们做同样的探针读数，只是把积分换成求和，就是<strong>离散傅里叶变换（DFT）</strong>：X[k] = Σₙ x[n]·e^(−i2πkn/N)，k = 0, 1, …, N−1。这里取 x[n] = cos(2πfn/N)，即频率 f Hz 的余弦在 1 秒里采 N 个点。第二张图的柱高是 |X[k]|/N。实数信号的读数总是成对出现：第 k 根和第 N−k 根一样高，所以只有前一半（到 k = N/2）是新信息。当 f 超过 N/2，采样点和频率 N−f 的余弦一模一样，峰就落到 N−f 去了——这叫<strong>混叠</strong>（<a class="xlink" href="../../../signal/sampling/sampling/#step3">→ 采样与混叠第 3 步：采样率至少要是信号频率的两倍</a>）。',
    f5Label: '余弦频率 f（Hz，整数）', n16: 'N = 16 个采样点', n32: 'N = 32 个采样点',
    c5a: '采样点（白）与两条连续余弦：f（橙）、N−f（青虚线）', c5b: 'DFT：|X[k]|/N（横轴：k）',
    lg5S: '白点：采样点', lg5F: '橙线：频率 f 的余弦', lg5A: '青色虚线：频率 N−f 的余弦', lg5Bar: '柱子：|X[k]|/N',
    s5readout: 'N = {N}，f = {f} Hz：峰在 k = {peaks}，高 {h}。{al}',
    s5alias: 'f 超过 N/2 = {half}：这些采样点与 {a} Hz 的余弦完全相同，DFT 分不出二者。',
    s5edge: 'f = 0、N/2 或 N：两根峰重合成一根，高度是 1（f = N 时样点全是 1，和 0 Hz 分不出）。',
    s5hint: '观察顺序：把 f 从 0 慢慢拖到 N，看第二张图里两根峰从两端向中间靠拢，在 k = N/2 处会合后又分开；同时第一张图里的白色采样点始终同时落在橙线和青色虚线上。换成 N = 32，会合点移到 16。',

    s6k: '第 6 步 · 收束',
    s6t: '傅里叶变换：每个频率一个探针',
    s6fin: '给每个频率派一个同频的正弦当探针，乘起来、求平均，读数就是那一层的振幅，其他频率的层因为正交而读成 0（第 1 步）。正弦和余弦两个探针合成一个复数探针 e^(−i2πft)，读数的模是振幅、角是相位（第 2 步）。窗口有限时，每个频率是一个宽约 2/T 的鼓包，想分开两个靠近的频率，就得录得足够长（第 3 步）。把读数乘回各自的正弦加起来可以拼回信号，均方根误差趋于 0，但跳变旁的尖角不消失（第 4 步）。只有 N 个采样点时，DFT 给出 N 个读数，前一半是新信息，高于 N/2 的频率会折回来（第 5 步）。',
    formula: 'X(f) = (2/T) ∫₀ᵀ x(t)·e^(−i2πft) dt\nX[k] = Σₙ x[n]·e^(−i2πkn/N)\nx(t) ≈ Σₖ bₖ·sin(2πkt)',
    boundary: '适用范围：第 1、2、4 步的「读数恰为振幅或 0」要求频率是 1/T 的整数倍；第 3 步的 0.72/T–0.75/T 来自本页的 80% 谷底判据和两个正弦同相的设定；第 4 步的吉布斯尖角出现在任何有跳变的信号上；第 5 步假设采样等间隔、恰好覆盖 1 秒。页面上的信号全部是模拟数据。',
    linksTitle: '接着去哪儿',
    lk1: '→ 卷积第 6 步：时域里的卷积，到了频域变成逐点相乘',
    lk2: '→ 采样与混叠第 4 步：采样让整张频谱周期性地复制',
    lk3: '→ 拉普拉斯变换第 2 步：傅里叶是 s 平面上 σ = 0 的那一刀',
    lk4: '→ 泰勒级数第 2 步：另一种逼近——在一点附近逐项贴合',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《傅里叶变换 · 一步一交互》的平行版本。'
  },
  en: {
    pageTitle: 'The Fourier Transform · Send a Probe to Ask Each Frequency',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Fourier Transform · One Interaction at a Time →',
    navLabel: 'Fourier transform steps',
    tagline: 'All you have is one wiggly signal, and you want to know which sine waves, at which strengths, were added to make it. The Fourier transform does something plain: for every frequency it sends a sine of that frequency as a probe, multiplies, averages, and reads off the answer. Over six steps you will do this yourself, then see how it copes with phase, how recording length limits it, how it rebuilds a signal, and what changes when only N samples are left.',
    nav0: '0 Guess', nav1: '1 Probe', nav2: '2 Phase', nav3: '3 Resolution', nav4: '4 Rebuild', nav5: '5 Samples', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The problem',
    s0t: 'Looking only at the sum, can you tell how strong each of its three sines is?',
    s0e: 'The question here: which frequencies, at which strengths, add up to a given signal? The white line is a 1-second signal x(t); across is time (s), up is the signal value. Half the answer comes for free: it is exactly three <strong>sine waves</strong> a·sin(2πft) added together (f is the <strong>frequency</strong>, vibrations per second, in Hz; a is the <strong>amplitude</strong>, the height of a crest; <a class="xlink" href="../../../math/geometry/trigonometry/#step3">→ Trigonometry, step 3: where sine and cosine come from</a>), at 2, 5 and 9 Hz. What you need are the three amplitudes. Drag the three sliders to build a guess (cyan); the red line is the signal minus your guess. The <strong>RMS error</strong> (square the difference at every instant, average over the second, take the square root; 0 means a perfect match) tells you how far off you are.',
    guess: 'Amplitude at {f} Hz',
    reveal: 'Reveal the three parts', hide: 'Hide the parts',
    c0a: 'Signal x(t) and your guess (across: time in s)',
    lg0X: 'White: signal x(t)', lg0G: 'Cyan: your guess', lg0R: 'Red: the difference', lg0C: 'Dashed: the three parts (once revealed)',
    s0readout: 'Your guess: {g}. RMS error {e} (0 means a perfect match). {ans}',
    s0ans: 'Answer: {a}.',
    s0hint: 'What to watch: drag only the 2 Hz slider first and watch the slowest swell in the red line shrink; then try 5 Hz and 9 Hz. With three layers tangled together it is hard to say which bump belongs to whom — you can get close, but not explain why you are right. The next step gives a way that needs no guessing.',

    s1k: 'Step 1 · The sine probe',
    s1t: 'How do you pull out just the k Hz layer without the others getting in the way?',
    s1e: 'The question here: is there an operation that takes the whole of x(t) and returns “how much k Hz sine is in it”? Send a k Hz sine, sin(2πkt), as a <strong>probe</strong>: multiply x(t) by the probe at every instant, average over the second, double it, and call the result b_k. If x contains a matching a·sin(2πkt), that layer times the probe is a·sin²(2πkt), never negative, averaging a/2 — doubled, exactly a. A layer at a different frequency times the probe has equal positive and negative area over the second and averages to exactly 0; the two are <strong>orthogonal</strong> (provided both frequencies are whole numbers of Hz, so each completes whole cycles in the second). The first plot shows x(t) (grey) and the probe (orange). The second shows their product, green above zero and red below; b_k is twice the net area. The third plots every k you have asked as a bar.',
    kLabel: 'Probe frequency k (Hz)', sweep1: 'Sweep k from 1 to 12', clearBars: 'Clear the bars',
    c1a: 'x(t) (grey) and probe sin(2πkt) (orange); across: s', c1b: 'Product x(t)·sin(2πkt) at every instant', c1c: 'Readings b_k asked so far (across: k in Hz)',
    lg1X: 'Grey: signal x(t)', lg1P: 'Orange: the probe', lg1Pos: 'Green: product positive', lg1Neg: 'Red: product negative', lg1Bar: 'Bars: reading b_k',
    s1progress: '{c}/{N} frequencies asked · ',
    s1readout: '{prog}k = {k} Hz: average of the product = {m}, b_k = 2 × {m} = {b}. {why}',
    s1hit: 'That is the amplitude of the {k} Hz layer in x.',
    s1miss: 'x has no {k} Hz part: positive and negative areas cancel and the reading is 0.',
    s1hint: 'What to watch: set k to 5 and the second plot turns almost all green — a layer times a matching probe is never negative (the few red patches come from the other two layers, whose own averages are 0). At 6, green and red alternate and the net area is 0. Then press “Sweep k from 1 to 12”: bars grow one by one in the third plot, only at 2, 5 and 9, and their heights are the answer to step 0.',

    s2k: 'Step 2 · Phase',
    s2t: 'If one layer starts a little ahead, does the sine probe still read it correctly?',
    s2e: 'The question here: what happens to the step 1 method if the 5 Hz layer does not start at 0 but is 0.5·sin(2π·5t + φ)? φ is the <strong>phase</strong>: how far ahead, as an angle, the layer starts. Expand it and you get 0.5·cos φ·sin(2π·5t) + 0.5·sin φ·cos(2π·5t) — a mix of a sine and a cosine. The sine probe only sees the first part, 0.5·cos φ; at φ = 90° it reads 0, as if the layer had vanished. The fix is a second probe, a <strong>cosine probe</strong> cos(2π·5t): multiply, average, double, and it reads the second part, 0.5·sin φ. Treat the two readings as the coordinates of a point in a plane: its distance from the origin (the <strong>magnitude</strong>) is the amplitude 0.5, and its direction is φ. In complex numbers the two probes merge into one, e^(−i2πkt) = cos(2πkt) − i·sin(2πkt) — the probe the Fourier transform uses (<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ Complex numbers, step 4: multiplying means magnitudes multiply and angles add</a>).',
    phLabel: 'Phase φ of the 5 Hz layer (degrees)', clearTrail: 'Clear the white dots',
    c2a: 'x(t) (white) and its 5 Hz layer (cyan) (across: time in s)', c2b: 'Two readings at 5 Hz (across: sine probe; up: cosine probe)',
    lg2X: 'White: x(t)', lg2C: 'Cyan: the 5 Hz layer', lg2Pt: 'Orange dot: the two readings now', lg2Trail: 'White dots: phases tried', lg2Circle: 'Dashed circle: radius 0.5',
    s2readout: 'φ = {ph}°: sine-probe reading {s} (= 0.5·cos φ), cosine-probe reading {c} (= 0.5·sin φ). Magnitude √({s}² + {c}²) = {m}, direction {ang}°. {warn}',
    s2warn: 'With the sine probe alone you would think the 5 Hz layer was almost gone.',
    s2hint: 'What to watch: drag φ slowly from 0 to 90° and watch the orange dot in the second plot travel a quarter of the dashed circle: across (sine probe) falls to 0, up (cosine probe) rises to 0.5, and the distance from the origin stays 0.5 the whole way. The 2 Hz and 9 Hz layers are orthogonal to both 5 Hz probes, so whatever φ is, they never enter this reading.',

    s3k: 'Step 3 · Resolution',
    s3t: 'Two frequencies close together — how long must you record to tell them apart?',
    s3e: 'The question here: so far the window was 1 second and every frequency a whole number, so a reading was either the amplitude or 0. Real signals are never that tidy. Slide the probe frequency f continuously, take the step 2 sine-plus-cosine reading at every f and its magnitude, and you get a curve: the <strong>spectrum</strong> seen through a window of length T (across: probe frequency f; up: magnitude of the reading). A single sine does not show up as a thin line but as a bump 2/T wide (zero to zero), trailing a row of small bumps on each side — <strong>leakage</strong>, because the window chops the wave off. Here we use two equally strong sines (amplitude 1), both starting at phase 0: 5 Hz and 5 + Δ Hz. Our rule: they count as resolved when the lowest point between the two true frequencies drops below 80% of the smaller of the two readings there.',
    TLabel: 'Window length T (s)', dLabel: 'Frequency gap Δ (Hz)', clearMap: 'Clear the dot map',
    c3a: 'Spectrum through a window of length T (across: f in Hz)', c3b: 'Resolved? (across: T in s; up: Δ in Hz)',
    lg3Spec: 'Cyan: spectrum', lg3Tones: 'Orange lines: the two true frequencies', lg3Yes: 'Green dot: resolved', lg3No: 'Red dot: not resolved', lg3Line: 'Dashed: this page’s boundary, Δ·T ≈ 0.72–0.75',
    s3readout: 'T = {T} s, Δ = {d} Hz, Δ·T = {dT}. One bump is 2/T = {w} Hz wide. Valley ÷ smaller reading = {ratio}: {res}',
    s3yes: 'below 80%, resolved.', s3no: 'not below 80%; the two peaks have merged into one.',
    s3hint: 'What to watch: fix Δ at 0.5 Hz and stretch T slowly from 0.5 s; the two bumps go from one blur to two separate peaks. Every combination you try leaves a dot in the second plot. The green/red border hugs the dashed line Δ·T ≈ 0.72–0.75: with this page’s rule, the gap must exceed about 0.72/T to 0.75/T (the usual rough statement is “about 1/T”). The exact number shifts with the rule and with the two sines’ phases, but “longer window, finer resolution” does not.',

    s4k: 'Step 4 · Rebuild',
    s4t: 'Multiply each reading back onto its sine and add them up — do you get a sharp-cornered square wave?',
    s4e: 'The question here: once you know every frequency’s reading, can you run it backwards and rebuild the signal? Take a 1 Hz <strong>square wave</strong>: +1 for the first half second, −1 for the second. Ask it with the step 1 sine probe and it contains only odd frequencies 1, 3, 5, … Hz, with readings b_k = 4/(πk). Adding the first N terms b_k·sin(2πkt) gives the Nth <strong>partial sum</strong>. The larger N, the closer it hugs the square wave — yet next to each jump there is always a horn that overshoots: the <strong>Gibbs phenomenon</strong>. The first plot shows the partial sum (cyan) and the square wave (grey dashed). The second records each N you try: orange is how far the partial sum’s highest point rises above 1, cyan is the <strong>RMS error</strong> between partial sum and square wave (square, average, square root; smaller is closer).',
    nLabel: 'Number of terms N', clearN: 'Clear the record',
    c4a: 'Partial sum and square wave (across: time in s)', c4b: 'Rise above 1 (orange) and RMS error (cyan) (across: N)',
    lg4Sum: 'Cyan: sum of the first N terms', lg4Sq: 'Grey dashed: square wave', lg4Os: 'Orange dots: highest point minus 1', lg4Rms: 'Cyan dots: RMS error',
    nOut: '{n} (up to {k} Hz)',
    s4readout: 'N = {n} (using 1, 3, …, {k} Hz): highest point {peak}, rising {os} above 1 — {pct}% of the jump height 2; RMS error {rms}.',
    s4hint: 'What to watch: drag N from 1 to 40 and watch the second plot. The cyan dots (RMS error) keep falling towards 0, but the orange dots level off at about 0.18 (about 9% of the jump) and stop — the horn only gets narrower and hugs the jump more tightly. So “more terms, better match” holds in the RMS sense, but the largest error next to a jump never goes to 0.',

    s5k: 'Step 5 · After sampling',
    s5t: 'With only N samples, why is the spectrum mirror-symmetric, and where does it fold back?',
    s5e: 'The question here: a computer never holds a continuous x(t), only N numbers x[0], …, x[N−1] taken every 1/N seconds. Do the same probe readings with a sum in place of the integral and you have the <strong>discrete Fourier transform (DFT)</strong>: X[k] = Σₙ x[n]·e^(−i2πkn/N), k = 0, 1, …, N−1. Here x[n] = cos(2πfn/N): an f Hz cosine sampled N times in one second. Bar heights in the second plot are |X[k]|/N. A real signal’s readings always come in pairs — bar k and bar N−k are equally tall — so only the first half (up to k = N/2) is new information. Once f passes N/2, the samples are identical to those of an (N−f) Hz cosine, and the peak lands at N−f: that is <strong>aliasing</strong> (<a class="xlink" href="../../../signal/sampling/sampling/#step3">→ Sampling and aliasing, step 3: sample at least twice as fast as the signal</a>).',
    f5Label: 'Cosine frequency f (Hz, whole number)', n16: 'N = 16 samples', n32: 'N = 32 samples',
    c5a: 'Samples (white); cosines at f (orange), N−f (cyan dashed)', c5b: 'DFT: |X[k]|/N (across: k)',
    lg5S: 'White dots: samples', lg5F: 'Orange: cosine at f', lg5A: 'Cyan dashed: cosine at N−f', lg5Bar: 'Bars: |X[k]|/N',
    s5readout: 'N = {N}, f = {f} Hz: peaks at k = {peaks}, height {h}. {al}',
    s5alias: 'f is above N/2 = {half}: these samples are exactly those of a {a} Hz cosine, and the DFT cannot tell the two apart.',
    s5edge: 'f = 0, N/2 or N: the two peaks coincide in one bar of height 1 (at f = N every sample is 1, indistinguishable from 0 Hz).',
    s5hint: 'What to watch: drag f slowly from 0 to N. In the second plot the two peaks move in from both ends, meet at k = N/2 and part again, while in the first plot every white sample sits on both the orange line and the cyan dashed one. Switch to N = 32 and the meeting point moves to 16.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'The Fourier transform: one probe per frequency',
    s6fin: 'Send each frequency a matching sine as a probe, multiply, average: the reading is that layer’s amplitude, and layers at other frequencies read 0 because they are orthogonal (step 1). A sine probe and a cosine probe merge into one complex probe e^(−i2πft), whose reading has the amplitude as its magnitude and the phase as its angle (step 2). Through a finite window each frequency becomes a bump about 2/T wide, so separating two close frequencies takes a long enough recording (step 3). Multiplying the readings back onto their sines and adding rebuilds the signal; the RMS error goes to 0, but the horn beside a jump stays (step 4). With only N samples the DFT gives N readings, the first half new, and frequencies above N/2 fold back (step 5).',
    formula: 'X(f) = (2/T) ∫₀ᵀ x(t)·e^(−i2πft) dt\nX[k] = Σₙ x[n]·e^(−i2πkn/N)\nx(t) ≈ Σₖ bₖ·sin(2πkt)',
    boundary: 'Where this holds: “the reading is exactly the amplitude or 0” in steps 1, 2 and 4 needs frequencies that are whole multiples of 1/T; the 0.72/T–0.75/T of step 3 comes from this page’s 80% valley rule with both sines in phase; the Gibbs horn of step 4 appears for any signal with a jump; step 5 assumes evenly spaced samples covering exactly one second. Every signal on the page is simulated.',
    linksTitle: 'Where to go next',
    lk1: '→ Convolution, step 6: convolution in time becomes pointwise multiplication in frequency',
    lk2: '→ Sampling and aliasing, step 4: sampling copies the whole spectrum periodically',
    lk3: '→ The Laplace transform, step 2: Fourier is the σ = 0 slice of the s-plane',
    lk4: '→ Taylor series, step 2: another kind of approximation — matching term by term around one point',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Fourier Transform · One Interaction at a Time”.'
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
