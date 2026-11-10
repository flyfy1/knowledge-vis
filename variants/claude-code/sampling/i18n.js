'use strict';
// Sampling & aliasing lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '采样与混叠 · 样点分不清的那些频率',
    back: '← 知识索引',
    compare: '对照另一版本：采样与混叠 · 偷看得太懒，就会看错 →',
    navLabel: '采样与混叠步骤导航',
    tagline: '数字设备不连续地看世界，只每隔一小段时间记下一个数。这一页回答：只凭这些数，什么样的信号能认对，什么样的会被认成另一个？七步里你会看到车轮倒转的原因、一条折线式的「频率换算表」、理想重建的边界，以及为什么录音前要先滤一刀。',
    nav0: '0 倒转的车轮', nav1: '1 同一组样点', nav2: '2 折叠', nav3: '3 重建', nav4: '4 频谱复制', nav5: '5 抗混叠', nav6: '6 收束',

    s0k: '第 0 步 · 现象',
    s0t: '车轮每秒转 23 圈，用每秒 24 帧的摄像机拍下来，视频里它往哪边转？',
    s0e: '这一步要回答：如果只能每隔固定时间看一眼，我们会把转动看成什么样？每隔固定时间记录一次，叫<strong>采样</strong>；每秒记录几次叫<strong>采样率</strong> f<sub>s</sub>（这里是电影的 24 帧/秒），相邻两次之间的时间 1/f<sub>s</sub> 叫采样间隔。车轮上只画一根辐条，真实转速 f（圈/秒，顺时针为正）。两帧之间辐条真实转过 360°·f/f<sub>s</sub>，可照片里看不出中间多转了几整圈，眼睛只会用<strong>最短</strong>的那段转动把两帧连起来：扣掉整圈后落在 −180°…180° 之间的那个角度。',
    fSlider0: '真实转速 f（圈/秒）',
    play0: '播放 1 秒视频（24 帧，慢放）', reset0: '清除试过的转速',
    s0lgSpoke: '当前帧的辐条', s0lgTrail: '前几帧（越淡越早）', s0lgLine: '视频里的转速（模型）', s0lgDot: '你试过的转速',
    c0a: '视频画面：辐条在各帧的位置', c0b: '视频里的转速 vs 真实转速（圈/秒）',
    dirCW: '顺时针转', dirCCW: '逆时针转（倒转）', dirStill: '静止不动', dirEdge: '正好半圈，方向分不出',
    s0readout: '真实 {f} 圈/秒 → 每帧真实转过 {step}°；扣掉 {k} 整圈，剩 {app}° → 视频里看到{dir}，{fa} 圈/秒。',
    s0play: '第 {m}/24 帧：真实累计转了 {tr} 圈，视频里看起来转了 {ap} 圈。',
    s0hint: '观察顺序：先把 f 拖到 24，每一帧辐条都回到原位，视频里车轮静止；再拖到 23 和 25，一个慢慢倒转、一个慢慢正转。按「播放」看一秒钟的 24 帧：真实转了 23 圈，画面里只倒退了 1 圈。「视频里的转速」图上的白点是你试过的转速，它们都落在同一条锯齿线上：每隔 24 圈/秒，视频里的转速回到 0。',

    s1k: '第 1 步 · 为什么会认错',
    s1t: '这 9 个样点，究竟是哪一条余弦波留下的？',
    s1e: '这一步要回答：只拿到样点，能不能唯一认出原来的波？原信号是 cos(2πft)，t 是秒；采样率 f<sub>s</sub> = 8 Hz（赫兹 = 每秒周期数），所以样点是 x[n] = cos(2πf·n/f<sub>s</sub>)，n 是整数编号，第 n 个样点在 t = n/f<sub>s</sub> 秒。把频率换成 f + k·f<sub>s</sub>（k 是任意整数），在每个采样时刻相位多出 2π·k·n，正好是整数圈，所以样点一个不差。这些频率叫彼此的<strong>别名</strong>（alias）。余弦对负频率对称，cos(−θ) = cos θ，所以写成 |f + k·f<sub>s</sub>|。',
    fSlider1: '原信号频率 f（Hz）', kSlider1: '候选的 k（候选频率 |f + k·8|）',
    all1: '叠加全部 5 个候选（k = −2…2）', one1: '只看一个候选',
    s1lgOrig: '原信号 cos(2πft)', s1lgCand: '候选 cos(2π|f + k·8|t)', s1lgAll: '其他候选', s1lgDot: '样点（每 1/8 秒一个）',
    c1: '1 秒内的原信号、候选与 9 个样点（f_s = 8 Hz，横轴为秒）',
    s1readout: '候选频率 |{f} + ({k})×8| = {g} Hz。9 个样点处两条曲线的最大差 = {d0}；整条曲线上（样点之间）的最大差 = {d1}。这组样点的所有别名里最低的是 {low} Hz。',
    s1self: '（k = 0 就是原信号自己。）',
    s1hint: '观察顺序：先固定 f = 3 Hz，把 k 从 −2 拖到 2：橙色候选越来越密，却每次都恰好穿过同样的白点；样点处的差一直是 0，曲线上的最大差却很大，说明它们确实是不同的信号。再按「叠加全部候选」，5 条曲线在白点处汇成一点。',

    s2k: '第 2 步 · 折叠',
    s2t: '用 44.1 kHz 采样，一个 30 kHz 的音会被当成多少赫兹？',
    s2e: '这一步要回答：给定真实频率 f 和采样率 f<sub>s</sub>，样点看起来像多高的频率？上一步说 f 和所有 |f − k·f<sub>s</sub>| 留下同一组样点。数字系统只能按其中最低的那个来理解（第 3 步的理想重建给出的也正是它），叫<strong>表观频率</strong> f<sub>a</sub>：先找离 f 最近的 f<sub>s</sub> 整数倍，再取差的绝对值，所以 f<sub>a</sub> 总在 0 到 <strong>f<sub>s</sub>/2</strong> 之间。f<sub>s</sub>/2 叫<strong>奈奎斯特频率</strong>：只有低于它的频率才能被如实记下。把频率轴当成纸带，每隔 f<sub>s</sub>/2 来回折一次，f 落在哪里，就看它叠到第一段的哪个位置。',
    rateSlider: '采样率 f_s（kHz）', fSlider2: '真实频率 f（kHz）',
    s2lgLine: '表观频率 f_a（模型）', s2lgBand: '0…f_s/2：能如实记下的范围', s2lgDot: '你试过的频率',
    c2: '表观频率 f_a 随真实频率 f 的变化（kHz）',
    s2readout: 'f = {f} kHz、f_s = {fs} kHz：最近的整数倍是 {k} × {fs} = {kfs} kHz，相差 {g} kHz → 表观频率 f_a = {fa} kHz。奈奎斯特频率 {ny} kHz，{state}',
    s2below: 'f 在它以下，样点如实记下了 f。', s2above: 'f 在它以上，被折成了一个假频率。', s2at: 'f 正好等于它：处在边界上（第 3 步会看到这里振幅和相位分不开）。',
    s2hint: '观察顺序：先保持 f_s = 44.1 kHz，把 f 从 0 慢慢拖到 60：f_a 先跟着涨，到 22.05 kHz 掉头往下，到 44.1 kHz 回到 0，再往上爬。拖过的每个 f 都留下一个点。再换一个 f_s：拐点跟着 f_s/2 移动，折线的形状不变。',
    quizPrompt: '小测：用 48 kHz 采样，一个 40 kHz 的超声干扰会变成多少赫兹？',
    quizA: '40 kHz：超声频率高，原样保留', quizB: '8 kHz：变成一个听得见的音', quizC: '24 kHz：落在奈奎斯特频率上',
    check: '核对', correct: '对。|40 − 48| = 8 kHz，正好在听得见的范围里。可以把 f_s 拨到 48、f 拨到 40 核对。', wrong: '再想想：先找离 40 kHz 最近的 48 kHz 整数倍，再取差。可以把 f_s 拨到 48、f 拨到 40 核对。',

    s3k: '第 3 步 · 重建',
    s3t: '把样点重新连成连续的波，能连回原来那条吗？',
    s3e: '这一步要回答：手里只有样点，<strong>理想重建</strong>会给出什么？理想重建（香农插值）在第 n 个样点处放一个 sinc 脉冲 sinc(f<sub>s</sub>t − n)，乘上样点的值，再全部相加。sinc(u) = sin(πu)/(πu)：它在自己的样点处等于 1，在其他样点处都等于 0，所以重建曲线一定穿过每个样点；它只含低于 f<sub>s</sub>/2 的频率。于是：若事先知道原信号的频率都低于 f<sub>s</sub>/2（这叫已知<strong>带限</strong>），重建就是原信号；否则重建出来的是最低的那个别名。这里 f<sub>s</sub> = 10 Hz，原信号 cos(2πft + φ)，φ 是相位；只用 n = −200…219 共 420 个样点，所以会有一点截断误差。',
    fSlider3: '原信号频率 f（Hz）', phSlider3: '相位 φ（度）',
    s3lgOrig: '原信号', s3lgRec: '理想重建（420 个样点）', s3lgDot: '样点（每 0.1 秒一个）',
    c3: '原信号、样点与理想重建（0–2 秒，f_s = 10 Hz）',
    s3readout: 'f = {f} Hz，φ = {ph}° → 重建出 {fa} Hz 的余弦，振幅 {amp}、相位 {rph}°。重建与原信号的均方根差 {e0}；与按折叠预测的那条波的均方根差 {e1}（只剩截断误差）。{note}',
    s3below: 'f 低于 5 Hz：重建就是原信号。', s3above: 'f 高于 5 Hz：重建给出的是别名，不是原信号；频率被折过来时相位也跟着变号。', s3edge: 'f 正好是 5 Hz 的奇数倍：样点只是 cos φ·(−1)ⁿ，振幅和相位搅在一起，重建振幅只剩 cos φ。', s3zero: 'f 是 10 Hz 的整数倍：每个样点都一样，重建是一条高度为 cos φ 的直线。',
    s3hint: '观察顺序：φ 保持 0，先把 f 停在 3 Hz，青色重建盖住灰色原信号；拖到 7 Hz，青色变成 3 Hz 的慢波（重建与原信号差很大，与预测的别名几乎重合）；拖到 5 Hz，再拖 φ：φ = 90° 时样点全是 0，重建成了一条直线。整个滑杆范围内，重建与预测之差不超过 0.013，在 5 Hz 边界处最大。',

    s4k: '第 4 步 · 频谱',
    s4t: '换到频谱上看，采样对一整段频率做了什么？',
    s4e: '这一步要回答：真实信号含有很多频率，采样后它的<strong>频谱</strong>（各频率成分的大小；<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶页第 5 步：频谱视角</a>）变成什么样？第 1 步说频率 f 与 f + k·f<sub>s</sub> 的样点相同，所以采样后的频谱是原频谱每隔 f<sub>s</sub> 复制一份、再全部相加。这里原信号的<strong>带宽</strong> B 是它的最高频率，频谱画成 −B…B 上的三角形（负频率与正频率对称，是同一组余弦的两半）。若 f<sub>s</sub> ≥ 2B，副本之间留有空隙，−f<sub>s</sub>/2…f<sub>s</sub>/2 里只有原件；若 f<sub>s</sub> &lt; 2B，邻居副本的尾巴伸进来叠在原件上，这就是频谱上的<strong>混叠</strong>：叠上去以后，加数再也拆不开。',
    bSlider: '原信号带宽 B（kHz）', fsSlider4: '采样率 f_s（kHz）',
    s4lgOrig: '原频谱（k = 0）', s4lgCopy: '副本（k ≠ 0）', s4lgSum: '所有副本之和', s4lgOver: '副本重叠处', s4lgBand: '−f_s/2…f_s/2 区间',
    c4a: '原信号的频谱（横轴 kHz，纵轴为相对大小）', c4b: '采样后：每隔 f_s 复制一份，再相加',
    s4readout: 'f_s = {fs} kHz，2B = {tb} kHz：{state}。伸进 −f_s/2…f_s/2 的副本面积占原频谱面积的 {pct}%{theory}。',
    s4gap: '副本之间空出 {gap} kHz，没有重叠', s4touch: '副本首尾正好相接，没有重叠', s4lack: '比 2B 少 {lack} kHz，副本重叠',
    s4theory: '（三角形频谱在 B ≤ f_s ≤ 2B 时按 (1 − f_s/2B)² 算，也是 {th}%）',
    s4hint: '观察顺序：B 保持 6 kHz，把 f_s 从 24 往下拖：副本彼此靠近，f_s = 12 kHz（= 2B）时首尾正好相接；再往下，粉色重叠区出现，百分比开始上涨。再固定 f_s、拖 B，看到的是同一件事：要紧的只是 f_s 和 2B 谁大。',

    s5k: '第 5 步 · 抗混叠',
    s5t: '采样之前先用低通滤波器压一下，要压多狠才够？',
    s5e: '这一步要回答：折进来的成分一旦叠上就拆不开，所以只能在采样<strong>之前</strong>把 f<sub>s</sub>/2 以上的东西压低，这叫<strong>抗混叠滤波</strong>。设想一个录音场景（模拟设定）：想要的 5 kHz 音，加上开关电源漏进来的 30 kHz 超声，f<sub>s</sub> = 44.1 kHz。按第 2 步，30 kHz 会落到 |30 − 44.1| = 14.1 kHz，正在人耳大约 20 Hz–20 kHz 的范围里。滤波器用 N 阶<strong>巴特沃斯低通</strong>：增益（输出振幅 ÷ 输入振幅）|H(f)| = 1/√(1 + (f/f<sub>c</sub>)<sup>2N</sup>)，f<sub>c</sub> 是<strong>截止频率</strong>，N 越大，过了 f<sub>c</sub> 之后下降得越陡（<a class="xlink" href="../../../signal/systems/frequency-response/#step2">→ 频率响应页第 2 步：怎样读增益曲线</a>）。增益用 <strong>dB</strong> 表示：20·log₁₀|H|，0 dB 是原样通过，−20 dB 是振幅剩 1/10，−40 dB 是剩 1/100。',
    fcSlider: '截止频率 f_c（kHz）', nSlider: '滤波器阶数 N',
    s5lgGain: '滤波器增益（dB）', s5lgHear: '人耳范围 0–20 kHz', s5lgWant: '想要的 5 kHz 音', s5lgHum: '30 kHz 干扰 / 它折成的 14.1 kHz 假音', s5lgLine: '虚线：f_s/2 = 22.05 kHz 与 24.1 kHz',
    c5a: '滤波器增益（dB）与要紧的频率（kHz）', c5b: '采样后 0–22.05 kHz 内剩下的成分（dB）',
    s5readout: 'f_c = {fc} kHz、N = {N}：5 kHz 的音剩 {w} dB；30 kHz 干扰被压到 {h} dB，然后折到 14.1 kHz。20 kHz 处（听觉上限）衰减 {e} dB；24.1 kHz 处只衰减了 {s} dB——任何高于 24.1 kHz 的成分都会折进 0–20 kHz。',
    s5hint: '观察顺序：f_c 留在 20 kHz，把 N 从 1 拖到 10：增益曲线越来越陡，30 kHz 处的粉点沉下去，「采样后剩下的成分」图里的假音变矮；想要的 5 kHz 几乎不受影响。再看 24.1 kHz 那条虚线：从 20 到 24.1 kHz 只有 4.1 kHz 的过渡带，N = 10 时那里也只压了约 16 dB。f_c 往下拖能多压一些，代价是 20 kHz 附近的高音也被削弱。这道窄缝就是 44.1 kHz 留给滤波器的余量（这里只是带宽算账，不讲它的历史来历）。',

    s6k: '第 6 步 · 收束',
    s6t: '样点能告诉我们什么，不能告诉我们什么？',
    s6fin: '均匀采样只在 t = n/f<sub>s</sub> 处看信号。在这些时刻，f 与 f + k·f<sub>s</sub> 的相位只差整圈，所以它们留下同一组样点（第 1 步）；数字系统按最低的那个来理解，表观频率被折进 0…f<sub>s</sub>/2（第 2 步）。若事先知道信号的频率都严格低于 f<sub>s</sub>/2，理想重建能把它原样还原；否则还原出的是别名（第 3 步）。换到频谱上，采样就是每隔 f<sub>s</sub> 复制一份频谱再相加，f<sub>s</sub> &lt; 2B 时副本重叠（第 4 步）。叠上就拆不开，所以要在采样之前用低通滤波器压掉 f<sub>s</sub>/2 以上的成分（第 5 步）。',
    formula: 'x[n] = x(n / f_s)\nf 与 f + k·f_s 的样点相同 → f_a = |f − k·f_s|（取最近的整数倍）∈ [0, f_s/2]\n已知 f < f_s/2 ⇒ x(t) = Σₙ x[n]·sinc(f_s·t − n)\n采样后的频谱 = Σₖ X(f − k·f_s)',
    boundary: '适用范围：理想的瞬时、等间隔采样，没有量化误差和时钟抖动；理想重建要求无穷多个样点和已知带限，本页用 420 个样点，有截断误差；f 正好等于 f_s/2 时不够，需要严格小于。带通采样（有意利用折叠）、视频的滚动快门、真实 ADC 的过采样与数字滤波都不在本页范围内。第 5 步的 30 kHz 干扰是模拟设定。',
    linksTitle: '接着去看',
    lk1: '傅里叶变换 · 第 5 步：把一个信号拆成各频率的大小，就是本页第 4 步复制的那张频谱 →',
    lk2: 'Z 变换（Claude 版）· 第 2 步：z = e^(sT) 把 s 平面上相隔 2π/T 的点卷到同一处，正是混叠 →',
    lk3: '卷积（Claude 版）· 第 5 步：滑动平均是一个低通滤波器，会抹掉某些频率 →',
    lk4: '调制 · 第 1 步：乘上一个余弦会把频谱整体搬家，采样的复制是同一类事 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《采样与混叠 · 偷看得太懒，就会看错》的平行版本。'
  },
  en: {
    pageTitle: 'Sampling & Aliasing · The Frequencies Samples Cannot Tell Apart',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Sampling & Aliasing · Peek Too Lazily and You\'ll See It Wrong →',
    navLabel: 'Sampling and aliasing steps',
    tagline: 'A digital device does not watch the world continuously; it writes down one number every so often. This page asks: from those numbers alone, which signals can be identified correctly, and which get mistaken for something else? In seven steps you will see why wheels spin backwards on film, a zigzag "frequency conversion chart", where ideal reconstruction stops working, and why recordings are filtered before they are sampled.',
    nav0: '0 Backward wheel', nav1: '1 Same samples', nav2: '2 Folding', nav3: '3 Reconstruction', nav4: '4 Spectral copies', nav5: '5 Anti-aliasing', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The puzzle',
    s0t: 'A wheel turns 23 times a second and a camera films it at 24 frames a second. Which way does it turn on screen?',
    s0e: 'The question here: if you can only look at fixed intervals, how does a rotation appear? Recording at fixed intervals is <strong>sampling</strong>; the number of records per second is the <strong>sampling rate</strong> f<sub>s</sub> (24 frames per second for film), and the time between two records, 1/f<sub>s</sub>, is the sampling interval. The wheel has a single spoke and turns at f revolutions per second (clockwise is positive). Between two frames the spoke really moves 360°·f/f<sub>s</sub>, but a photo cannot show how many whole turns happened in between, so the eye joins two frames by the <strong>shortest</strong> rotation: the angle left after removing whole turns, between −180° and 180°.',
    fSlider0: 'True speed f (rev/s)',
    play0: 'Play 1 second of film (24 frames, slowed)', reset0: 'Clear tried speeds',
    s0lgSpoke: 'Spoke in the current frame', s0lgTrail: 'Earlier frames (fainter = older)', s0lgLine: 'Speed seen on film (model)', s0lgDot: 'Speeds you tried',
    c0a: 'Film frames: where the spoke is in each frame', c0b: 'Speed seen on film vs true speed (rev/s)',
    dirCW: 'clockwise', dirCCW: 'anticlockwise (backwards)', dirStill: 'standing still', dirEdge: 'exactly half a turn, so no direction can be told',
    s0readout: 'True {f} rev/s → the spoke really turns {step}° per frame; after removing whole turns ({k}), {app}° remain → on film it looks {dir} at {fa} rev/s.',
    s0play: 'Frame {m}/24: the wheel has really turned {tr} revolutions; on film it seems to have turned {ap}.',
    s0hint: 'What to watch: drag f to 24 first. The spoke is back in the same place every frame, so the wheel stands still on film. Then try 23 and 25: one creeps backwards, the other creeps forwards. Press Play to see one second of 24 frames: the wheel really turns 23 times, yet the picture slips back by one turn. The white dots in the "speed seen on film" chart are the speeds you tried; they all lie on the same sawtooth, and the on-film speed returns to 0 every 24 rev/s.',

    s1k: 'Step 1 · Why the mistake happens',
    s1t: 'Which cosine wave left these 9 samples behind?',
    s1e: 'The question here: from the samples alone, can the original wave be identified uniquely? The signal is cos(2πft) with t in seconds. The sampling rate is f<sub>s</sub> = 8 Hz (hertz = cycles per second), so the samples are x[n] = cos(2πf·n/f<sub>s</sub>), where n is an integer index and sample n sits at t = n/f<sub>s</sub> seconds. Replace f by f + k·f<sub>s</sub> for any integer k: at each sampling instant the phase gains 2π·k·n, a whole number of turns, so every sample is unchanged. Such frequencies are <strong>aliases</strong> of each other. Cosine does not care about the sign of its argument, cos(−θ) = cos θ, so we write |f + k·f<sub>s</sub>|.',
    fSlider1: 'Signal frequency f (Hz)', kSlider1: 'Candidate k (candidate frequency |f + k·8|)',
    all1: 'Overlay all 5 candidates (k = −2…2)', one1: 'Show one candidate',
    s1lgOrig: 'Signal cos(2πft)', s1lgCand: 'Candidate cos(2π|f + k·8|t)', s1lgAll: 'Other candidates', s1lgDot: 'Samples (one every 1/8 s)',
    c1: 'Signal, candidate and samples over 1 s (f_s = 8 Hz)',
    s1readout: 'Candidate frequency |{f} + ({k})×8| = {g} Hz. Largest gap between the curves at the 9 samples = {d0}; largest gap anywhere along the curves (between the samples) = {d1}. The lowest alias of this set of samples is {low} Hz.',
    s1self: ' (k = 0 is the signal itself.)',
    s1hint: 'What to watch: keep f = 3 Hz and drag k from −2 to 2. The orange candidate gets busier and busier, yet it passes through exactly the same white dots every time; the gap at the samples stays 0 while the largest gap along the curves is big, so these really are different signals. Then press Overlay: all 5 curves meet at each white dot.',

    s2k: 'Step 2 · Folding',
    s2t: 'Sampling at 44.1 kHz, what frequency does a 30 kHz tone turn into?',
    s2e: 'The question here: given a true frequency f and a sampling rate f<sub>s</sub>, what frequency do the samples look like? The last step showed that f and every |f − k·f<sub>s</sub>| leave the same samples. A digital system can only read them as the lowest one (which is also what the ideal reconstruction of step 3 produces), called the <strong>apparent frequency</strong> f<sub>a</sub>: find the multiple of f<sub>s</sub> nearest to f and take the size of the difference. That puts f<sub>a</sub> between 0 and <strong>f<sub>s</sub>/2</strong>, the <strong>Nyquist frequency</strong>: only frequencies below it are recorded faithfully. Think of the frequency axis as a paper strip folded back and forth every f<sub>s</sub>/2; wherever f lands, read off where it sits on the first panel.',
    rateSlider: 'Sampling rate f_s (kHz)', fSlider2: 'True frequency f (kHz)',
    s2lgLine: 'Apparent frequency f_a (model)', s2lgBand: '0…f_s/2: the faithfully recorded range', s2lgDot: 'Frequencies you tried',
    c2: 'Apparent frequency f_a against true frequency f (kHz)',
    s2readout: 'f = {f} kHz, f_s = {fs} kHz: the nearest multiple is {k} × {fs} = {kfs} kHz, a difference of {g} kHz → apparent frequency f_a = {fa} kHz. The Nyquist frequency is {ny} kHz; {state}',
    s2below: 'f is below it, so the samples record f faithfully.', s2above: 'f is above it, so it is folded into a false frequency.', s2at: 'f sits exactly on it, the boundary (step 3 shows amplitude and phase getting mixed up there).',
    s2hint: 'What to watch: keep f_s = 44.1 kHz and drag f slowly from 0 to 60. f_a rises with it, turns back down at 22.05 kHz, reaches 0 at 44.1 kHz and climbs again. Each f you visit leaves a dot. Then pick another f_s: the turning points move with f_s/2 while the zigzag keeps its shape.',
    quizPrompt: 'Quick check: sampling at 48 kHz, what does a 40 kHz ultrasonic interference turn into?',
    quizA: '40 kHz: ultrasound is high, so it stays as it is', quizB: '8 kHz: it becomes an audible tone', quizC: '24 kHz: it lands on the Nyquist frequency',
    check: 'Check', correct: 'Right. |40 − 48| = 8 kHz, squarely in the audible range. Set f_s to 48 and f to 40 to confirm.', wrong: 'Not quite: find the multiple of 48 kHz closest to 40 kHz, then take the difference. Set f_s to 48 and f to 40 to confirm.',

    s3k: 'Step 3 · Reconstruction',
    s3t: 'Join the samples back into a continuous wave. Do you get the original back?',
    s3e: 'The question here: holding only the samples, what does <strong>ideal reconstruction</strong> give? Ideal (Shannon) reconstruction places a sinc pulse sinc(f<sub>s</sub>t − n) at sample n, scales it by the sample value and adds them all up. sinc(u) = sin(πu)/(πu) equals 1 at its own sample and 0 at every other sample, so the result passes through every sample, and it contains only frequencies below f<sub>s</sub>/2. Hence: if you know in advance that the signal has no frequencies at or above f<sub>s</sub>/2 (a known <strong>bandlimit</strong>), the reconstruction is the original; otherwise it is the lowest alias. Here f<sub>s</sub> = 10 Hz, the signal is cos(2πft + φ) with phase φ, and only the 420 samples n = −200…219 are used, so a small truncation error remains.',
    fSlider3: 'Signal frequency f (Hz)', phSlider3: 'Phase φ (degrees)',
    s3lgOrig: 'Original signal', s3lgRec: 'Ideal reconstruction (420 samples)', s3lgDot: 'Samples (one every 0.1 s)',
    c3: 'Original, samples and ideal reconstruction (0–2 s, f_s = 10 Hz)',
    s3readout: 'f = {f} Hz, φ = {ph}° → the reconstruction is a {fa} Hz cosine with amplitude {amp} and phase {rph}°. RMS gap to the original: {e0}; RMS gap to the wave predicted by folding: {e1} (truncation error only). {note}',
    s3below: 'f is below 5 Hz: the reconstruction is the original.', s3above: 'f is above 5 Hz: the reconstruction is an alias, not the original, and folding flips the sign of the phase.', s3edge: 'f is an odd multiple of 5 Hz: the samples are just cos φ·(−1)ⁿ, amplitude and phase are mixed together, and only cos φ of the amplitude comes back.', s3zero: 'f is a multiple of 10 Hz: every sample is the same, so the reconstruction is a flat line at height cos φ.',
    s3hint: 'What to watch: keep φ = 0. Park f at 3 Hz and the cyan reconstruction covers the grey original. Drag to 7 Hz: the cyan curve becomes a slow 3 Hz wave (far from the original, almost on top of the predicted alias). Drag to 5 Hz and then move φ: at φ = 90° every sample is 0 and the reconstruction is a flat line. Over the whole slider range the gap to the prediction stays below 0.013, largest at the 5 Hz boundary.',

    s4k: 'Step 4 · The spectrum',
    s4t: 'Seen as a spectrum, what does sampling do to a whole band of frequencies?',
    s4e: 'The question here: a real signal holds many frequencies, so what happens to its <strong>spectrum</strong> (the size of each frequency component; <a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier page step 5: the spectrum view</a>) when it is sampled? Step 1 said f and f + k·f<sub>s</sub> leave the same samples, so the sampled spectrum is the original spectrum copied every f<sub>s</sub> and summed. The <strong>bandwidth</strong> B is the signal\'s highest frequency, and the spectrum is drawn as a triangle on −B…B (negative and positive frequencies mirror each other; they are two halves of the same cosines). If f<sub>s</sub> ≥ 2B there are gaps between copies and only the original lives in −f<sub>s</sub>/2…f<sub>s</sub>/2. If f<sub>s</sub> &lt; 2B, the tails of the neighbouring copies reach in and pile onto the original. That is <strong>aliasing</strong> in the spectrum: once added, the pieces can no longer be told apart.',
    bSlider: 'Signal bandwidth B (kHz)', fsSlider4: 'Sampling rate f_s (kHz)',
    s4lgOrig: 'Original spectrum (k = 0)', s4lgCopy: 'Copies (k ≠ 0)', s4lgSum: 'Sum of all copies', s4lgOver: 'Where copies overlap', s4lgBand: 'The band −f_s/2…f_s/2',
    c4a: 'Spectrum of the signal (frequency in kHz, relative size)', c4b: 'After sampling: a copy every f_s, all added up',
    s4readout: 'f_s = {fs} kHz, 2B = {tb} kHz: {state}. Copy area reaching into −f_s/2…f_s/2 is {pct}% of the original spectrum\'s area{theory}.',
    s4gap: 'a gap of {gap} kHz between copies, no overlap', s4touch: 'the copies just touch, no overlap', s4lack: '{lack} kHz short of 2B, so the copies overlap',
    s4theory: ' (for a triangular spectrum with B ≤ f_s ≤ 2B this is (1 − f_s/2B)², also {th}%)',
    s4hint: 'What to watch: keep B = 6 kHz and drag f_s down from 24. The copies close in, touch end to end at f_s = 12 kHz (= 2B), and below that a pink overlap appears and the percentage starts climbing. Then hold f_s and drag B: it is the same story, because all that matters is whether f_s or 2B is larger.',

    s5k: 'Step 5 · Anti-aliasing',
    s5t: 'Squash the high frequencies with a low-pass filter before sampling. How hard do you have to squash?',
    s5e: 'The question here: folded components cannot be separated once they have landed, so the content above f<sub>s</sub>/2 has to be pushed down <strong>before</strong> sampling. This is <strong>anti-aliasing filtering</strong>. Picture a recording (a simulated set-up): the wanted 5 kHz tone plus 30 kHz ultrasound leaking from a switching power supply, sampled at f<sub>s</sub> = 44.1 kHz. By step 2 the 30 kHz lands at |30 − 44.1| = 14.1 kHz, right inside human hearing (roughly 20 Hz–20 kHz). The filter is an N-th order <strong>Butterworth low-pass</strong>: its gain (output amplitude ÷ input amplitude) is |H(f)| = 1/√(1 + (f/f<sub>c</sub>)<sup>2N</sup>), where f<sub>c</sub> is the <strong>cutoff frequency</strong>, and a larger N falls more steeply beyond f<sub>c</sub> (<a class="xlink" href="../../../signal/systems/frequency-response/#step2">→ Frequency response page step 2: reading a gain curve</a>). Gain is shown in <strong>dB</strong>: 20·log₁₀|H|, where 0 dB passes unchanged, −20 dB leaves 1/10 of the amplitude and −40 dB leaves 1/100.',
    fcSlider: 'Cutoff frequency f_c (kHz)', nSlider: 'Filter order N',
    s5lgGain: 'Filter gain (dB)', s5lgHear: 'Hearing range 0–20 kHz', s5lgWant: 'Wanted 5 kHz tone', s5lgHum: '30 kHz interference / the 14.1 kHz ghost it folds into', s5lgLine: 'Dashed: f_s/2 = 22.05 kHz and 24.1 kHz',
    c5a: 'Filter gain (dB) and the frequencies that matter (kHz)', c5b: 'What is left in 0–22.05 kHz after sampling (dB)',
    s5readout: 'f_c = {fc} kHz, N = {N}: the 5 kHz tone keeps {w} dB; the 30 kHz interference is pushed to {h} dB and then folds to 14.1 kHz. At 20 kHz (the top of hearing) the loss is {e} dB; at 24.1 kHz the filter manages only {s} dB, and anything above 24.1 kHz folds into 0–20 kHz.',
    s5hint: 'What to watch: leave f_c at 20 kHz and drag N from 1 to 10. The gain curve steepens, the pink dot at 30 kHz sinks and the ghost in the "what is left after sampling" chart shrinks, while the wanted 5 kHz tone barely changes. Now look at the dashed line at 24.1 kHz: between 20 and 24.1 kHz there is only a 4.1 kHz transition band, and even N = 10 pushes it down by only about 16 dB. Lowering f_c buys more attenuation at the cost of dulling the treble near 20 kHz. That narrow gap is the room 44.1 kHz leaves for the filter (this is a bandwidth budget, not the history of the number).',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What can samples tell us, and what can they not?',
    s6fin: 'Uniform sampling looks at a signal only at t = n/f<sub>s</sub>. At those instants f and f + k·f<sub>s</sub> differ by whole turns of phase, so they leave the same samples (step 1); a digital system reads them as the lowest one, folding the apparent frequency into 0…f<sub>s</sub>/2 (step 2). If you know beforehand that every frequency is strictly below f<sub>s</sub>/2, ideal reconstruction returns the original; otherwise it returns an alias (step 3). In the spectrum, sampling copies the whole spectrum every f<sub>s</sub> and adds the copies, which overlap when f<sub>s</sub> &lt; 2B (step 4). Overlaps cannot be undone, so content above f<sub>s</sub>/2 must be filtered out before sampling (step 5).',
    formula: 'x[n] = x(n / f_s)\nf and f + k·f_s give the same samples → f_a = |f − k·f_s| (nearest multiple) ∈ [0, f_s/2]\nknown f < f_s/2 ⇒ x(t) = Σₙ x[n]·sinc(f_s·t − n)\nsampled spectrum = Σₖ X(f − k·f_s)',
    boundary: 'Scope: ideal, instantaneous, evenly spaced samples with no quantisation error or clock jitter. Ideal reconstruction needs infinitely many samples and a known bandlimit; this page uses 420 samples, so there is truncation error. f exactly at f_s/2 is not enough; it must be strictly below. Bandpass sampling (folding on purpose), rolling-shutter video, and the oversampling plus digital filtering of real converters are outside this page. The 30 kHz interference in step 5 is simulated.',
    linksTitle: 'Where to go next',
    lk1: 'Fourier transform · step 5: splitting a signal into the size of each frequency, the spectrum copied in step 4 here →',
    lk2: 'Z-transform (Claude edition) · step 2: z = e^(sT) rolls s-plane points 2π/T apart onto the same spot, which is aliasing →',
    lk3: 'Convolution (Claude edition) · step 5: a moving average is a low-pass filter that wipes out some frequencies →',
    lk4: 'Modulation · step 1: multiplying by a cosine shifts the whole spectrum, the same kind of move as sampling\'s copies →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "Sampling & Aliasing · Peek Too Lazily and You\'ll See It Wrong".'
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
  if (typeof window.refreshSampling === 'function') window.refreshSampling();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SAMP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
