'use strict';
// Wavelets lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '小波 · 高音用短窗，低音用长窗',
    back: '← 知识索引',
    compare: '对照另一版本：小波 · 让窗口随频率伸缩 →',
    navLabel: '小波步骤导航',
    tagline: '一段录音里，有一直在响的低音，也有一闪而过的「咔嗒」声。我们想同时知道两件事：每个声音是什么频率，又是什么时候响的。整段做傅里叶变换只能回答前一件。这页从「加一个窗口」出发，看清固定窗口为什么总要顾此失彼，再让窗口随频率伸缩，最后看这种分析为什么能用很少的数描述突变、去掉噪声。',
    nav0: '0 频谱不知道何时', nav1: '1 加窗口', nav2: '2 伸缩的窗口', nav3: '3 尺度图', nav4: '4 Haar 小波', nav5: '5 去噪', nav6: '6 收束',

    s0k: '第 0 步 · 频谱缺了什么',
    s0t: '一声短促的音挪到别的时刻，频谱会变吗？',
    s0e: '这一步要回答：只看整段信号的频谱，能不能知道一个声音是<strong>什么时候</strong>响的？信号是 1 秒长、每秒 256 个采样点的记录，里面只有一声短促的 32 Hz 音（Hz 是每秒振动的次数），它的音量按钟形曲线起落，持续约 0.1 秒。<strong>幅度谱</strong>是傅里叶变换给出的「每个频率成分有多强」：横轴是频率，纵轴是这个频率的正弦波的振幅。拖动滑杆只改变这声音出现的时刻。傅里叶变换把「何时」藏进了每个成分的<strong>相位</strong>（那个正弦波起步的角度）里，而一个声音的相位又分散在几十个频率成分上，没法直接读出时刻（<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶第 5 步：从波形到频谱</a>）。',
    t0: '音出现的时刻（秒）',
    c0a: '波形（横轴：时间 s）', c0b: '幅度谱（横轴：频率 Hz；纵轴：振幅）',
    s0lgX: '当前信号与频谱', s0lgR: '音在 0.30 秒时的频谱（对照）',
    s0readout: '音在 {t} 秒。两条幅度谱逐点相减，最大差 {d}（只是计算舍入误差的大小），峰值都在 32 Hz、高 {p}。变的只有相位：32 Hz 成分的相位是 {ph}°。',
    s0hint: '观察顺序：只拖「音出现的时刻」，看上图的音左右移动，下图的青色柱和橙色圈始终重合。结论：幅度谱对「何时」完全失明。',

    s1k: '第 1 步 · 加一个窗口',
    s1t: '只看一小段再做频谱，能同时看清「何时」和「多少 Hz」吗？',
    s1e: '这一步要回答：把信号切成短段（<strong>窗口</strong>），每段各做一次频谱，再按时间排起来——这叫<strong>短时傅里叶变换（STFT）</strong>，画成图叫<strong>频谱图</strong>：横轴时间、纵轴频率、越亮表示这个时刻这个频率越强。测试信号长 2 秒：两个一直在响的音，12 Hz 和 20 Hz（频率很近）；外加两声 72 Hz 的「咔嗒」，在 0.97 秒和 1.03 秒（时刻很近）。窗口是钟形的，<strong>σt</strong> 是它在时间上的宽度，<strong>σf</strong> 是它的频谱在频率上的宽度（都按能量，即振幅的平方，算标准差；单位秒和 Hz）。钟形窗口的两者相乘恒为 1/(4π) ≈ 0.08，别的形状只会更大：窗口越短，σf 就越大，频率越模糊。「分得开」这样判断：两个峰之间最低点不到较矮峰的一半。',
    L1: '窗口长度（采样点，每秒 256 点）',
    c1a: '频谱图（横轴：时间 s；纵轴：频率 Hz）', c1b: '两峰之间的谷深（低于 0.5 = 分得开）',
    s1lgT: '白框：一个窗口覆盖的范围 ±σt × ±σf', s1lgA: '两个音（12、20 Hz）的谷深', s1lgB: '两声咔嗒（0.97、1.03 s）的谷深', s1lgH: '0.5 分界线',
    s1readout: '窗口 {L} 点：σt = {st} ms，σf = {sf} Hz，σt·σf = {prod}。两个音的谷深 {dt}（{vt}），两声咔嗒的谷深 {dc}（{vc}）。',
    yes: '分得开', no: '分不开',
    s1hint: '观察顺序：从 16 点逐格拖到 256 点。看频谱图：窗口短时，上方两声咔嗒是两个亮点，下方 12、20 Hz 却糊成一条宽带；窗口长时反过来。再看「两峰之间的谷深」柱状图：没有任何一档能让橙柱和青柱同时低于 0.5 的虚线。',

    s2k: '第 2 步 · 伸缩的窗口',
    s2t: '能不能让高频用短窗、低频用长窗？',
    s2e: '这一步要回答：上一步的矛盾来自所有频率共用一个窗口。高频的音一秒里振动很多次，短窗口里已有好几个周期，足以认出频率；低频的音需要长窗口才装得下几个周期。<strong>小波</strong>就是一段「带包络的短振动」：本页用 <strong>Morlet 小波</strong>，即钟形包络乘上频率为 f 的正弦。它的规则是：包络的宽度与 f 成反比，σt = ω₀/(2√2·πf)，所以无论 f 多高，包络里都装着同样多的周期；参数 <strong>ω₀</strong> 决定这个周期数。这样频率宽度 σf = f/(√2·ω₀) 与 f 成正比（σt、σf 的算法同第 1 步，乘积仍是 1/(4π)）：高频处时间准、频率粗，低频处频率准、时间粗。把信号与这样一段小波逐个位置比对相似度，得到的数叫<strong>小波系数</strong>。',
    f2: '分析频率 f（Hz，对数刻度）',
    c2a: '固定窗口（64 点）里的振动：周期数随 f 变', c2b: 'Morlet 小波（ω₀ = 8）：周期数不变', c2c: '时间–频率平面上的覆盖范围（横轴 s，纵轴 Hz）',
    s2lgS: '固定窗口：每块一样大', s2lgW: '小波：高处窄高，低处宽扁', s2lgC: '当前频率的那一块',
    s2readout: 'f = {f} Hz。小波：σt = {wt} ms，σf = {wf} Hz，±σt 内有 {wc} 个周期（= ω₀/(√2·π)，与 f 无关）。固定 64 点窗口：σt = {st} ms，σf = {sf} Hz，±σt 内有 {sc} 个周期。',
    s2hint: '观察顺序：把 f 从 4 Hz 拖到 96 Hz。看中间一行：橙色小波越来越窄，但里面的波峰数不变；上面一行的窗口宽度不变，周期数从不足一个变成好多个。最下面的平面里，青色实线块随 f 升高变得窄而高，橙色虚线块始终一样大。',

    s3k: '第 3 步 · 尺度图',
    s3t: '同一段信号，小波能把两个近音和两声咔嗒同时分开吗？',
    s3e: '这一步要回答：拿第 1 步的同一段测试信号（12 Hz、20 Hz 两个音，0.97 秒与 1.03 秒两声 72 Hz 咔嗒），换成小波分析，结果如何？把所有频率的小波系数（大小）画成一张图，叫<strong>尺度图</strong>：横轴时间，纵轴频率（对数刻度，每一格高度对应同样的频率倍数），越亮越强。旁边放一张固定窗口的频谱图对照。滑杆 <strong>ω₀</strong> 是小波包络里装多少振动：ω₀ 大，每个频率的小波更长——频率更准、时间更粗。「分得开」的判据同第 1 步：两峰之间最低点不到较矮峰的一半。两张图各自按自己的最大值归一化亮度。',
    w3: '小波参数 ω₀（包络里的振动多少）', L3: '对照用的固定窗口长度（点）',
    c3a: '固定窗口频谱图（纵轴 Hz，线性）', c3b: '小波尺度图（纵轴 Hz，对数）',
    s3readout: '固定窗口 {L} 点：两个音 {st}（谷深 {sdt}），两声咔嗒 {sc}（谷深 {sdc}）。小波 ω₀ = {w}：两个音 {wt}（谷深 {wdt}），两声咔嗒 {wc}（谷深 {wdc}）。{verdict}',
    both: '小波两件事都分开了。', notBoth: '这个 ω₀ 下小波还有一件没分开。',
    s3hint: '观察顺序：先保持 ω₀ = 8，看尺度图下部 12、20 Hz 是两条亮带，上部 0.97、1.03 秒是两个亮点；对照「固定窗口频谱图」，换哪档窗口都只能顾一头。再把 ω₀ 拖到 3（两音糊成一条）和 12（两声咔嗒开始连起来）：ω₀ 也是一种取舍，只是它在每个频率按比例分配。本页这段信号上，ω₀ 在 7–10 时两件事同时分得开。',

    s4k: '第 4 步 · Haar 小波',
    s4t: '一个突然的跳变，要用多少个数才能记下来？',
    s4e: '这一步要回答：信号在某处突然从 0 跳到 1（共 64 个采样点）。要把它完整记下来，用小波需要几个数，用余弦需要几个数？<strong>Haar 小波</strong>是最简单的小波：把相邻两点换成「和」与「差」（都除以 √2），对「和」那一半重复，直到只剩一个数。这样 64 个点变成 64 个<strong>系数</strong>：1 个总平均，加上 6 层「差」（最粗一层 1 个，最细一层 32 个）。平坦处的「差」全是 0，只有覆盖跳变的那几个不为 0。对照的是<strong>离散余弦变换（DCT）</strong>，一种傅里叶式的基：用 64 条不同频率的余弦去拼。两套基都是<strong>正交归一</strong>的（换基不改变总能量），所以只保留最大的 K 个系数时，重建的<strong>均方根误差 RMSE</strong>（逐点差的平方平均再开方）就由丢掉的系数决定。',
    j4: '跳变位置（第几个点开始为 1）', K4: '只保留最大的 K 个系数',
    c4a: '信号与只用 K 个系数的重建', c4b: 'Haar 系数，按层排列（亮色 = 被保留）', s4lgL: 'Haar 系数图的层号：0 = 总平均，1–6 由粗到细', cbar: '颜色：弱 → 强', c4c: '重建 RMSE vs 保留个数 K',
    s4lgX: '原信号', s4lgH: 'Haar 重建', s4lgD: '余弦（DCT）重建',
    s4readout: '跳变在第 {j} 点：Haar 系数中只有 {nz} 个不为 0，余弦系数有 {nzd} 个不为 0。保留 {K} 个：Haar 重建 RMSE = {eh}，余弦重建 RMSE = {ed}。余弦要把 RMSE 压到 0.05 以下需 {d5} 个，压到 0.01 以下需 {d1} 个。',
    s4hint: '观察顺序：先保持 K = 7，拖跳变位置，看「Haar 系数，按层排列」图里每层只亮一个点（跳变落在 2 的幂整数倍时更少），「信号与只用 K 个系数的重建」图里 Haar 重建（青）与原信号完全重合，余弦重建（橙）在跳变两侧起伏。再把 K 往下拖，看「重建 RMSE vs 保留个数 K」图的两条曲线：Haar 在 K 达到非零个数时一下掉到 0。',

    s5k: '第 5 步 · 去噪',
    s5t: '噪声和信号混在一起，怎样只把噪声去掉？',
    s5e: '这一步要回答：一段分块平坦的信号加上随机噪声（每点独立，标准差 σ = 0.5，这是<strong>模拟</strong>数据），能不能利用「突变只占少数系数」把噪声去掉？做 Haar 变换后，信号的能量集中在少数大的系数上，噪声则均匀摊在所有系数上，每个都不大。<strong>软阈值</strong>的做法：给定阈值 T，把每个「差」系数朝 0 收缩 T，绝对值不到 T 的直接变成 0；再反变换回来。比较用的仍是 <strong>RMSE</strong>：去噪结果与无噪声原信号逐点差的平方平均再开方，越小越好。',
    T5: '阈值 T', reroll5: '换一组噪声',
    c5a: '含噪信号与去噪结果', c5b: '去噪后 RMSE vs 阈值 T',
    s5lgY: '含噪数据', s5lgX: '无噪声原信号', s5lgD: '去噪结果', s5lgR: '不处理时的 RMSE',
    s5readout: 'T = {T}：去噪后 RMSE = {e}（不处理时 {raw}），保留了 {kept}/{total} 个「差」系数。这组噪声下 RMSE 最小在 T = {bT}（{bE}）。',
    s5hint: '观察顺序：从 T = 0（什么都不做，青线等于含噪数据）开始往右拖，看平台上的毛刺先被抹平、跳变仍然陡峭，「去噪后 RMSE vs 阈值 T」图里青点下降；T 过大时小台阶也被抹掉，RMSE 回升。「换一组噪声」看最低点的位置——本页 5 组噪声里都在 T = 0.5–0.7，约等于噪声的 σ。',

    s6k: '第 6 步 · 收束',
    s6t: '傅里叶、加窗、小波，各自回答什么？',
    s6fin: '整段傅里叶变换回答「有哪些频率」，「何时」藏在相位里读不出来（第 0 步）。加一个窗口能问「这一刻有哪些频率」，但窗口的时间宽度和频率宽度此消彼长，σt·σf 有下限，一个窗口没法同时照顾近在频率上的两个音和近在时间上的两声咔嗒（第 1 步）。小波让窗口随频率伸缩，包络里的周期数不变：高频用短窗、低频用长窗（第 2、3 步）。Haar 这样的小波基，让平坦段的系数为 0，只在突变处留下少数系数，于是能用很少的数记下突变（第 4 步），也能靠收缩小系数去掉噪声（第 5 步）。',
    formula: 'σt · σf ≥ 1/(4π)    （高斯窗口时取等号）\nMorlet：σt = ω₀/(2√2·πf)，σf = f/(√2·ω₀)，±σt 内周期数 = ω₀/(√2·π)',
    boundary: '适用范围：本页信号都是模拟，采样率 256 Hz；频谱图用截断在 ±3σ 的高斯窗，尺度图用 Morlet 小波，图像亮度各自归一化。「谷深低于一半」是本页定的判据，不是普遍定理。第 4 步只比较了一种跳变信号：对光滑、周期性的信号，余弦基往往更省。第 5 步的最佳阈值只对这段分块信号和 σ = 0.5 成立。实际应用里还有许多其他小波（Daubechies 等）和边界处理方式。',
    linksTitle: '接着去哪儿',
    lk1: '→ 傅里叶第 5 步：频谱视角——整段信号拆成频率',
    lk2: '→ 卷积第 3 步：滑动着求重叠面积——小波系数就是这样逐位置算的',
    lk3: '→ 采样第 3 步：奈奎斯特线——每秒 256 点最多能表示 128 Hz',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《小波 · 让窗口随频率伸缩》的平行版本。'
  },
  en: {
    pageTitle: 'Wavelets · Short Windows for High Notes, Long Ones for Low',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Wavelets · Windows That Stretch With Frequency →',
    navLabel: 'Wavelet steps',
    tagline: 'A recording holds a low note that keeps sounding and a click that is over in an instant. We want two things at once: what frequency each sound has, and when it happened. A Fourier transform of the whole recording answers only the first. This page starts by adding a window, sees why a fixed window always has to give something up, then lets the window stretch with frequency, and finally shows why this kind of analysis can describe sudden jumps with very few numbers and strip out noise.',
    nav0: '0 No “when”', nav1: '1 A window', nav2: '2 Stretching', nav3: '3 Scalogram', nav4: '4 Haar', nav5: '5 Denoising', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · WHAT THE SPECTRUM MISSES',
    s0t: 'Move a short tone to a different moment. Does the spectrum change?',
    s0e: 'The question here: from the spectrum of the whole signal alone, can you tell <strong>when</strong> a sound happened? The signal is a 1-second recording at 256 samples per second, holding a single short 32 Hz tone (Hz = vibrations per second) whose loudness rises and falls in a bell shape over about 0.1 s. The <strong>magnitude spectrum</strong> is what the Fourier transform reports as “how strong each frequency component is”: frequency across, the amplitude of that frequency’s sine wave up. The slider only changes when the tone happens. The Fourier transform hides the “when” in each component’s <strong>phase</strong> (the angle its sine wave starts at), and one sound’s timing is spread over the phases of dozens of components, so you cannot read the moment off directly (<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: from waveform to spectrum</a>).',
    t0: 'When the tone happens (s)',
    c0a: 'Waveform (x-axis: time, s)', c0b: 'Magnitude spectrum (x: frequency, Hz; y: amplitude)',
    s0lgX: 'Current signal and spectrum', s0lgR: 'Spectrum with the tone at 0.30 s (reference)',
    s0readout: 'Tone at {t} s. Subtracting the two magnitude spectra point by point, the largest difference is {d} (the size of rounding error); both peak at 32 Hz with height {p}. Only the phase moves: the 32 Hz component’s phase is {ph}°.',
    s0hint: 'What to try: drag only the tone time. The tone slides left and right in the waveform, while in the spectrum the cyan bars and the orange rings stay on top of each other. Conclusion: the magnitude spectrum is completely blind to “when”.',

    s1k: 'STEP 1 · ADD A WINDOW',
    s1t: 'Take the spectrum of a short slice only. Can you then see both “when” and “how many Hz”?',
    s1e: 'The question here: cut the signal into short slices (<strong>windows</strong>), take a spectrum of each, and line them up in time. That is the <strong>short-time Fourier transform (STFT)</strong>, and its picture is a <strong>spectrogram</strong>: time across, frequency up, brighter meaning stronger at that moment and frequency. The test signal lasts 2 s: two notes that sound throughout, 12 Hz and 20 Hz (close in frequency), plus two 72 Hz clicks at 0.97 s and 1.03 s (close in time). The window is bell-shaped. <strong>σt</strong> is its width in time and <strong>σf</strong> the width of its spectrum in frequency (both standard deviations of the energy, i.e. the squared amplitude; in seconds and Hz). For a bell-shaped window their product is fixed at 1/(4π) ≈ 0.08, and any other shape only does worse, so a shorter window means a larger σf and blurrier frequencies. “Separated” is judged like this: the lowest point between two peaks is under half the smaller peak.',
    L1: 'Window length (samples, 256 per second)',
    c1a: 'Spectrogram (x: time, s; y: frequency, Hz)', c1b: 'Valley depth between two peaks (below 0.5 = separated)',
    s1lgT: 'White boxes: what one window covers, ±σt × ±σf', s1lgA: 'Valley between the notes (12, 20 Hz)', s1lgB: 'Valley between the clicks (0.97, 1.03 s)', s1lgH: '0.5 cut-off',
    s1readout: 'Window of {L} samples: σt = {st} ms, σf = {sf} Hz, σt·σf = {prod}. Valley between the notes {dt} ({vt}); valley between the clicks {dc} ({vc}).',
    yes: 'separated', no: 'not separated',
    s1hint: 'What to try: step from 16 samples up to 256. In the spectrogram, a short window shows the two clicks near the top as two bright spots, while 12 and 20 Hz at the bottom melt into one wide band; a long window does the opposite. Then look at the valley-depth bar chart: no setting gets both the orange bar and the cyan bar under the dashed 0.5 line.',

    s2k: 'STEP 2 · A WINDOW THAT STRETCHES',
    s2t: 'Could high frequencies get a short window and low ones a long window?',
    s2e: 'The question here: the conflict in step 1 comes from every frequency sharing one window. A high note vibrates many times per second, so a short window already holds several cycles, enough to tell its frequency. A low note needs a long window to fit a few cycles. A <strong>wavelet</strong> is a short vibration inside an envelope; this page uses the <strong>Morlet wavelet</strong>, a bell-shaped envelope times a sine of frequency f. Its rule is that the envelope width shrinks as f grows, σt = ω₀/(2√2·πf), so the envelope always holds the same number of cycles whatever f is; the parameter <strong>ω₀</strong> sets that number. The frequency width is then σf = f/(√2·ω₀), proportional to f (σt and σf measured as in step 1, so the product is still 1/(4π)): at high frequencies timing is sharp and frequency coarse, at low frequencies the reverse. Sliding such a wavelet along the signal and measuring the similarity at each position gives the <strong>wavelet coefficients</strong>.',
    f2: 'Analysis frequency f (Hz, log scale)',
    c2a: 'Vibration inside a fixed 64-sample window: cycle count varies with f', c2b: 'Morlet wavelet (ω₀ = 8): cycle count stays put', c2c: 'Coverage on the time–frequency plane (x: s, y: Hz)',
    s2lgS: 'Fixed window: every box the same size', s2lgW: 'Wavelet: tall and thin up high, wide and flat down low', s2lgC: 'The box at the current frequency',
    s2readout: 'f = {f} Hz. Wavelet: σt = {wt} ms, σf = {wf} Hz, {wc} cycles within ±σt (= ω₀/(√2·π), independent of f). Fixed 64-sample window: σt = {st} ms, σf = {sf} Hz, {sc} cycles within ±σt.',
    s2hint: 'What to try: drag f from 4 Hz to 96 Hz. In the middle row, the orange wavelet gets narrower but the number of crests inside stays the same. In the top row the window width never changes, so the cycle count grows from less than one to many. On the plane at the bottom, the solid cyan box gets thinner and taller as f rises, while the dashed orange boxes all stay the same size.',

    s3k: 'STEP 3 · THE SCALOGRAM',
    s3t: 'Same signal: can a wavelet separate both the close notes and the close clicks?',
    s3e: 'The question here: take the same test signal from step 1 (notes at 12 Hz and 20 Hz, 72 Hz clicks at 0.97 s and 1.03 s) and analyse it with wavelets instead. Plotting the size of the wavelet coefficients at every frequency gives a <strong>scalogram</strong>: time across, frequency up (log scale, so each equal step up is the same frequency ratio), brighter meaning stronger. A fixed-window spectrogram sits beside it for comparison. The slider <strong>ω₀</strong> sets how many vibrations fit in the wavelet’s envelope: a larger ω₀ makes the wavelet at every frequency longer, so frequency gets sharper and timing coarser. “Separated” uses the step-1 test: the lowest point between two peaks is under half the smaller peak. Each picture is scaled to its own maximum brightness.',
    w3: 'Wavelet parameter ω₀ (vibrations in the envelope)', L3: 'Fixed window for comparison (samples)',
    c3a: 'Fixed-window spectrogram (y: Hz, linear)', c3b: 'Wavelet scalogram (y: Hz, log)',
    s3readout: 'Fixed window, {L} samples: notes {st} (valley {sdt}), clicks {sc} (valley {sdc}). Wavelet, ω₀ = {w}: notes {wt} (valley {wdt}), clicks {wc} (valley {wdc}). {verdict}',
    both: 'The wavelet separates both.', notBoth: 'At this ω₀ the wavelet still misses one of them.',
    s3hint: 'What to try: keep ω₀ = 8. Near the bottom of the scalogram, 12 and 20 Hz are two bright bands; near the top, 0.97 s and 1.03 s are two bright spots. In the fixed-window spectrogram, every window setting handles only one of the two. Then drag ω₀ to 3 (the notes merge) and to 12 (the clicks start to join): ω₀ is a trade-off too, just one shared out in proportion at every frequency. On this signal, ω₀ from 7 to 10 separates both at once.',

    s4k: 'STEP 4 · THE HAAR WAVELET',
    s4t: 'How many numbers does it take to write down one sudden jump?',
    s4e: 'The question here: a signal of 64 samples jumps from 0 to 1 at some point. To record it exactly, how many numbers do wavelets need, and how many do cosines need? The <strong>Haar wavelet</strong> is the simplest wavelet: replace each neighbouring pair by its “sum” and “difference” (both divided by √2), repeat on the sums, and stop when one number is left. The 64 samples become 64 <strong>coefficients</strong>: one overall average plus 6 levels of differences (1 at the coarsest level, 32 at the finest). Wherever the signal is flat the differences are 0; only the few that straddle the jump are not. The comparison is the <strong>discrete cosine transform (DCT)</strong>, a Fourier-style basis that builds the signal from 64 cosines of different frequencies. Both bases are <strong>orthonormal</strong> (changing basis keeps the total energy), so if you keep only the K largest coefficients, the <strong>root-mean-square error (RMSE)</strong> of the rebuild (square the point-by-point differences, average, take the root) depends only on what you dropped.',
    j4: 'Jump position (first sample at 1)', K4: 'Keep only the K largest coefficients',
    c4a: 'Signal and its rebuild from K coefficients', c4b: 'Haar coefficients by level (bright = kept)', s4lgL: 'Levels in the coefficient plot: 0 = overall average, 1–6 coarse to fine', cbar: 'Colour: weak → strong', c4c: 'Rebuild RMSE vs coefficients kept K',
    s4lgX: 'Original signal', s4lgH: 'Haar rebuild', s4lgD: 'Cosine (DCT) rebuild',
    s4readout: 'Jump at sample {j}: only {nz} Haar coefficients are non-zero, against {nzd} cosine coefficients. Keeping {K}: Haar rebuild RMSE = {eh}, cosine rebuild RMSE = {ed}. Cosines need {d5} coefficients to get RMSE under 0.05, and {d1} to get under 0.01.',
    s4hint: 'What to try: hold K = 7 and drag the jump. In “Haar coefficients by level” only one point per level lights up (fewer when the jump sits on a multiple of a power of 2), and in “Signal and its rebuild” the Haar rebuild (cyan) lies exactly on the signal while the cosine rebuild (orange) wobbles either side of the jump. Then lower K and watch the two curves in the RMSE plot: the Haar curve drops straight to 0 once K reaches the number of non-zero coefficients.',

    s5k: 'STEP 5 · DENOISING',
    s5t: 'Noise is mixed into the signal. How do you remove just the noise?',
    s5e: 'The question here: a blocky, piecewise-flat signal has random noise added (independent at each point, standard deviation σ = 0.5; this is <strong>simulated</strong> data). Can we use the fact that jumps occupy only a few coefficients to remove the noise? After a Haar transform, the signal’s energy sits in a few large coefficients, while the noise is spread evenly across all of them, each one small. <strong>Soft thresholding</strong>: pick a threshold T, shrink every difference coefficient towards 0 by T, setting any smaller than T to exactly 0, then transform back. The yardstick is again <strong>RMSE</strong>: the root of the mean squared point-by-point difference between the result and the noise-free signal, smaller is better.',
    T5: 'Threshold T', reroll5: 'New noise',
    c5a: 'Noisy signal and the cleaned result', c5b: 'RMSE after denoising vs threshold T',
    s5lgY: 'Noisy data', s5lgX: 'Noise-free signal', s5lgD: 'Denoised result', s5lgR: 'RMSE with no processing',
    s5readout: 'T = {T}: RMSE after denoising = {e} (untouched: {raw}); {kept}/{total} difference coefficients survive. With this noise the lowest RMSE comes at T = {bT} ({bE}).',
    s5hint: 'What to try: start at T = 0 (nothing done; the cyan line equals the noisy data) and drag right. The fuzz on the flat stretches smooths out while the jumps stay sharp, and the cyan dot in the RMSE plot drops. With T too large, small steps get flattened too and the RMSE climbs again. Use “New noise” to see where the minimum lands: across this page’s 5 noise sets it is always at T = 0.5–0.7, about the noise σ.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Fourier, windows, wavelets: what does each one answer?',
    s6fin: 'A whole-signal Fourier transform answers “which frequencies are present”; the “when” hides in the phases where you cannot read it (step 0). A window lets you ask “which frequencies right now”, but its time width and frequency width trade off, σt·σf has a floor, and one window cannot serve both two notes close in frequency and two clicks close in time (step 1). Wavelets let the window stretch with frequency while the cycle count inside stays fixed: short windows up high, long ones down low (steps 2 and 3). A wavelet basis like Haar gives zero coefficients on flat stretches and leaves only a few at a jump, so a jump can be written down with very few numbers (step 4), and noise can be removed by shrinking the small coefficients (step 5).',
    formula: 'σt · σf ≥ 1/(4π)    (equality for a Gaussian window)\nMorlet: σt = ω₀/(2√2·πf),  σf = f/(√2·ω₀),  cycles within ±σt = ω₀/(√2·π)',
    boundary: 'Scope: every signal here is simulated at 256 samples per second; the spectrogram uses a Gaussian window cut at ±3σ, the scalogram a Morlet wavelet, and each picture is scaled to its own maximum. “Valley under half” is this page’s own test, not a general theorem. Step 4 compares a single kind of jump signal; for smooth, periodic signals a cosine basis is often the thriftier one. The best threshold in step 5 holds only for this blocky signal with σ = 0.5. Real work uses many other wavelets (Daubechies and friends) and other ways of handling the edges.',
    linksTitle: 'Where to go next',
    lk1: '→ Fourier, step 5: the spectrum view, a whole signal split into frequencies',
    lk2: '→ Convolution, step 3: sliding and measuring overlap, which is how each wavelet coefficient is computed',
    lk3: '→ Sampling, step 3: the Nyquist line; 256 samples per second can carry at most 128 Hz',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Wavelets · Windows That Stretch With Frequency”.'
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
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshWavelets === 'function') window.refreshWavelets();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.WAVELET_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
