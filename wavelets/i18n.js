const STR = {
  zh: {
    docTitle: '小波 · 让窗口随频率伸缩', back: '← 知识索引', pageTitle: '小波 · 让窗口随频率伸缩',
    tagline: '傅里叶谱说得出「有哪些频率」，说不出「何时」。从加窗口、到让窗口随频率伸缩，再到用最少的数描述突变。',
    navLabel: '步骤导航', languageLabel: '语言', category: '信号与系统 / Signals', stage: '大学 / University',
    nav0: '0 频谱的盲区', nav1: '1 加窗的代价', nav2: '2 伸缩的小波', nav3: '3 尺度图', nav4: '4 Haar 与稀疏', nav5: '5 终章',
    unitSamp: '点', timeAxis: '时间 (s)', freqAxis: '频率 (Hz)',
    s0k: '第 0 步 · 频谱的盲区', s0t: '傅里叶谱能告诉你「何时」吗？',
    s0e: '这一步要回答：只看傅里叶频谱，能分辨「先低音后高音」和「先高音后低音」吗？<strong>傅里叶频谱</strong>把整段信号拆成各个频率（单位 Hz，即每秒振动次数）的正弦分量，并给出每个分量的强度。下图 A 是先 12 Hz、后 40 Hz 的信号，B 是把 A 在时间上整段倒放。拖动「换音时刻」：两条波形随之改变，而下方频谱里青色柱（A）与橙色点（B）始终重合。',
    s0uL: '换音时刻（占整段 1 s 的比例）', s0reset: '重置换音时刻', cv0: '信号 A、倒放信号 B 及两者的幅度谱',
    s0A: 'A：先 12 Hz 后 40 Hz', s0B: 'B：A 倒放（先 40 Hz 后 12 Hz）', s0Spec: '幅度谱（0–64 Hz）', s0LegA: '青色柱 = A 的谱', s0LegB: '橙色点 = B 的谱',
    s0ro: '换音时刻 {u}：A 的 12 Hz 分量强度 <b>{lo}</b>，40 Hz 分量强度 <b>{hi}</b>（1 表示整段都是单位振幅正弦）。A、B 两谱的最大差异 <b>{d}</b>（只剩舍入误差），而两条波形的均方根差是 <b>{r}</b>（明显不同）。',
    s0term: '幅度谱 = 各频率分量的大小。把实信号在时间上整段倒放，幅度谱不变，只有各分量的相位变——所以幅度谱本身分不出先后。',
    s1k: '第 1 步 · 加窗的代价', s1t: '给傅里叶装一个滑动的小窗口',
    s1e: '这一步要回答：只分析一小段信号，能同时看清「何时」和「多少 Hz」吗？<strong>短时傅里叶变换（STFT）</strong>每次只对窗口内的信号做傅里叶分析，窗口沿时间滑动，结果画成<strong>谱图</strong>：横轴时间、纵轴频率、越亮表示该频率分量越强。窗口是高斯形，长度 L 个采样点（采样率 256 点/秒）。拖动「窗口长度」，信号保持不变：观察亮带是变粗还是变细，以及 12 Hz 亮带在 0.5 s 换音处消失得多快。',
    s1LL: '窗口长度 L', s1reset: '重置窗口长度', cv1: '信号的谱图与窗口形状',
    s1Guide: '虚线 = 真实音调 12 / 40 Hz 与换音时刻', s1Win: '窗口形状（按真实时长）',
    s1ro: '窗口长 <b>{T} ms</b>。频率方向：12 Hz 亮带在 t = 0.25 s 处的半高全宽约 <b>{w} Hz</b>；时间方向：窗口的时间宽度 σt = <b>{st} ms</b>（按 L 算出）。窗口变长，频率更准、时间更糊；变短则相反。',
    s1term: '半高全宽 = 亮带高于峰值一半处的整个宽度，越小说明频率定位越准（在图上量出）。σt = 高斯窗的标准差，用来度量窗口在时间上有多宽（由 L 算出，不是从图上量的）。',
    s2k: '第 2 步 · 伸缩的小波', s2t: '小波：窗口随频率伸缩',
    s2e: '这一步要回答：小波怎样做到「高频窗口窄、低频窗口宽」？<strong>小波</strong>是一小段会衰减的振荡（这里是 Morlet 小波：高斯包络乘以余弦）。选定分析频率 f，小波就被拉伸或压缩，使包络内始终含约 2 个周期；把它沿信号滑动，每个位置算一次「相似度」，即<strong>小波系数</strong>（取幅度，1 = 与单位正弦完全吻合）。拖动「分析频率」，位置不变：看橙色小波变胖还是变瘦、青色曲线的凸起落在哪半段；再拖「小波位置」或按「扫描」：亮线是小波已经扫过的部分。',
    s2fL: '分析频率 f', s2tL: '小波位置', s2play: '▶ 扫描', s2pause: '⏸ 暂停', s2reset: '重置并停止', cv2: '信号、滑动的小波和小波系数曲线',
    s2Sig: '信号（先 12 Hz 后 40 Hz）与橙色小波', s2Wav: '橙色 = 当前位置的小波', s2Coef: '小波系数幅度（亮线 = 已扫过）',
    s2ro: '分析频率 <b>{f} Hz</b> → 包络标准差 <b>{s} ms</b>（有效窗口约 {d} ms，f 越大越短）。当前位置系数 <b>{c}</b>；已扫过 {k} / {n} 个采样点。',
    s2term: '本页统一用 ω₀ = 6 的 Morlet 小波：窗口宽度正比于 1/f，所以每个频率下小波「形状」相同，只有大小不同。',
    s3k: '第 3 步 · 尺度图', s3t: '固定窗口 vs 伸缩窗口',
    s3e: '这一步要回答：一个长而低的音加两下短而高的点击，两种窗口都能看清吗？信号是 8 Hz 的长音（约 0.1–0.5 s）加相隔 80 ms 的两次 48 Hz 点击（约 0.66 s 与 0.74 s）。上图是固定窗口的谱图（STFT），下图是小波的<strong>尺度图</strong>（把每个频率的小波系数排成图，频率轴为对数）。分别拖动「STFT 窗口长度」和「小波周期参数 ω₀」（ω₀ 越大，小波包络内的周期越多），保持另一项不变：观察 8 Hz 亮带是否变细、两次点击能否分成两团。每张图按自己最亮的格子归一，图间不比较亮度。',
    s3LL: 'STFT 窗口长度 L', s3WL: '小波周期参数 ω₀', s3reset: '重置两个参数', cv3: '同一信号的谱图与尺度图',
    s3Stft: '上：固定窗口谱图 (STFT)', s3Cwt: '下：小波尺度图 (ω₀ 可调)',
    s3ro: 'σ 是窗口幅度包络的标准差，用来度量窗口宽度。STFT：所有频率同一窗口，σt = <b>{st} ms</b>、σf = <b>{sf} Hz</b>。小波：8 Hz 处 σt = <b>{t1} ms</b>、σf = <b>{f1} Hz</b>；48 Hz 处 σt = <b>{t2} ms</b>、σf = <b>{f2} Hz</b>。经验判断：窗口 σt 小于两事件间隔（80 ms）的一半时，两次点击才较易分成两团。',
    s3term: 'σt（时间宽度）与 σf（频率宽度）的乘积对高斯窗固定为 1/(2π)：改变窗口只是在两者之间挪动精度，不能同时变小。',
    s4k: '第 4 步 · Haar 与稀疏', s4t: '用最少的数描述突变',
    s4e: '这一步要回答：一条带尖锐跳变的信号，要保留多少个系数才够？把信号展开成一组正交基的系数（Haar 小波基，或傅里叶余弦/正弦基，各 128 个系数），只保留绝对值最大的 K 个，其余置零再还原。<strong>RMSE（均方根误差）</strong>：还原信号与无噪声原信号逐点差的平方取平均再开方，越小越好。拖动「保留数 K」：看橙色（Haar）与青色（傅里叶）在脉冲边缘的差别，以及哪个 RMSE 先降下去；再拖「噪声」：灰线变毛，但只留少量大系数的还原会滤掉一部分。',
    s4KL: '保留系数个数 K', s4NL: '噪声标准差', s4reset: '重置 K 与噪声', cv4: '原信号与两种基的稀疏还原',
    s4In: '输入（灰 = 含噪声，绿 = 无噪声原信号）', s4H: 'Haar 还原（RMSE {e}，绿线 = 原信号）', s4F: '傅里叶还原（RMSE {e}，绿线 = 原信号）', s4Leg: '横轴：128 个采样点；两者都只保留 K 个系数。',
    s4ro: '保留 <b>{K} / {n}</b> 个系数，噪声标准差 {sd}。输入本身与原信号的 RMSE <b>{ri}</b>；Haar 还原 <b>{rh}</b>；傅里叶还原 <b>{rf}</b>；当前较小者：<b>{who}</b>。这个比较只对本页这条信号成立：换成纯正弦，傅里叶只需 1 个系数就会胜出。',
    s4w_h: 'Haar', s4w_f: '傅里叶', s4w_e: '相同',
    s4term: '信号 = 弱正弦 + 第 45–76 点的宽脉冲 + 第 100–103 点的窄脉冲；宽脉冲边界在奇数位置（45、77），避免 Haar 因对齐占便宜。K 很小时傅里叶略占优，K 增大后 Haar 反超（噪声大时差距缩小）。',
    s5k: '第 5 步 · 终章', s5t: '收束：频率、时间与窗口',
    s5e: '回顾这条线：傅里叶谱回答「有什么」，加窗和小波让它同时回答「什么时候有」，稀疏表示则回答「最少用多少个数描述它」。',
    c1t: '谱不含先后', c1b: '幅度谱对时间倒放不变，先低后高与先高后低同谱（第 0 步，适用于实信号的幅度谱）。',
    c2t: '窗口的取舍', c2b: '窗口越长频率越准、时间越糊；对高斯窗 σt·σf = 1/(2π) 固定（第 1、3 步）。',
    c3t: '窗口随频率伸缩', c3b: '小波使 σf/f = 1/ω₀ 不变：高频给出细的时间定位，低频给出细的频率定位（第 2、3 步）。',
    c4t: '稀疏取决于信号', c4b: '在本页这条无噪声信号上，含突变的部分让 Haar 更省系数；平滑周期信号则傅里叶更省，没有通用赢家（第 4 步）。',
    modelT: '模型与局限',
    modelB: '全页是离散教学计算：采样率 256 Hz、256 点（第 4 步 128 点）；窗口为高斯窗或 Morlet 小波（ω₀ 默认 6）；信号边界外补零，所以边缘处的系数偏小；谱图和尺度图是示意，不是仪器测量。Haar 对比只覆盖一条人工构造的信号。',
    linksT: '想从别处继续',
    link1: '傅里叶 · 频谱视角：看正弦分量如何合成任意信号', link2: '卷积 · 滑动平均：小波系数本质上是信号与小波滑动相乘求和', link3: '采样 · 奈奎斯特线：本页 256 Hz 采样能分辨多高的频率',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是科研结论'
  },
  en: {
    docTitle: 'Wavelets · Windows That Stretch With Frequency', back: '← Knowledge Index', pageTitle: 'Wavelets · Windows That Stretch With Frequency',
    tagline: 'A Fourier spectrum says which frequencies are present, but not when. Add a window, let the window stretch with frequency, then describe sharp changes with very few numbers.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Signals & Systems', stage: 'University',
    nav0: '0 The blind spot', nav1: '1 Windowing cost', nav2: '2 Stretching wavelet', nav3: '3 Scalogram', nav4: '4 Haar & sparsity', nav5: '5 Finale',
    unitSamp: 'samples', timeAxis: 'time (s)', freqAxis: 'frequency (Hz)',
    s0k: 'Step 0 · The blind spot', s0t: 'Can a Fourier spectrum tell you when?',
    s0e: 'This step answers: can the Fourier spectrum alone tell “low tone, then high tone” from “high tone, then low tone”? A <strong>Fourier spectrum</strong> splits a whole signal into sine components at each frequency (in Hz, vibrations per second) and reports how strong each one is. Signal A below plays 12 Hz and then 40 Hz; B is A played backwards in time. Drag “switch time”: both waveforms change, yet in the spectrum the cyan bars (A) and orange dots (B) stay on top of each other.',
    s0uL: 'Switch time (fraction of the 1 s record)', s0reset: 'Reset switch time', cv0: 'Signal A, reversed signal B, and their magnitude spectra',
    s0A: 'A: 12 Hz first, then 40 Hz', s0B: 'B: A reversed (40 Hz first, then 12 Hz)', s0Spec: 'Magnitude spectrum (0–64 Hz)', s0LegA: 'cyan bars = spectrum of A', s0LegB: 'orange dots = spectrum of B',
    s0ro: 'Switch time {u}: A’s 12 Hz component has strength <b>{lo}</b> and its 40 Hz component <b>{hi}</b> (1 means a unit sine over the whole record). The largest difference between the A and B spectra is <b>{d}</b> (rounding error only), while the RMS difference of the two waveforms is <b>{r}</b> (clearly different).',
    s0term: 'Magnitude spectrum = how large each frequency component is. Playing a real signal backwards leaves the magnitude spectrum unchanged and only alters the phases, so the magnitude spectrum alone cannot tell the order.',
    s1k: 'Step 1 · The cost of windowing', s1t: 'Give Fourier a sliding window',
    s1e: 'This step answers: if we analyse only a short piece of the signal, can we see both when and how many Hz? The <strong>short-time Fourier transform (STFT)</strong> runs a Fourier analysis on just the part inside a window and slides that window along time. The result is a <strong>spectrogram</strong>: time across, frequency up, brighter meaning a stronger component. The window is Gaussian with length L samples (sampling rate 256 samples/s). Drag “window length” with the signal fixed: watch whether the bright band gets thicker or thinner, and how quickly the 12 Hz band fades at the switch at 0.5 s.',
    s1LL: 'Window length L', s1reset: 'Reset window length', cv1: 'Spectrogram of the signal and the window shape',
    s1Guide: 'dashed = true tones 12 / 40 Hz and the switch time', s1Win: 'window shape (true duration)',
    s1ro: 'Window length <b>{T} ms</b>. Frequency direction: the 12 Hz band at t = 0.25 s has a full width at half maximum of about <b>{w} Hz</b>. Time direction: the window’s time width is σt = <b>{st} ms</b> (computed from L). A longer window pins down frequency better but blurs time; a shorter one does the opposite.',
    s1term: 'Full width at half maximum = the total width of the band where it is above half its peak brightness; smaller means the frequency is located more precisely (measured on the map). σt = the standard deviation of the Gaussian window, a measure of how wide the window is in time (computed from L, not measured on the map).',
    s2k: 'Step 2 · The stretching wavelet', s2t: 'Wavelets: the window scales with frequency',
    s2e: 'This step answers: how does a wavelet get a narrow window at high frequency and a wide one at low frequency? A <strong>wavelet</strong> is a short, fading oscillation (here a Morlet wavelet: a Gaussian envelope times a cosine). Pick an analysis frequency f and the wavelet is stretched or squeezed so its envelope always holds about 2 cycles. Slide it along the signal and, at each position, compute a similarity score: the <strong>wavelet coefficient</strong> (shown as a magnitude; 1 = a perfect match to a unit sine). Drag “analysis frequency” with the position fixed: does the orange wavelet get fatter or thinner, and which half does the cyan bump land in? Then drag “wavelet position” or press “Sweep”: the bright line is the part the wavelet has already passed.',
    s2fL: 'Analysis frequency f', s2tL: 'Wavelet position', s2play: '▶ Sweep', s2pause: '⏸ Pause', s2reset: 'Reset and stop', cv2: 'Signal, sliding wavelet and wavelet coefficient curve',
    s2Sig: 'Signal (12 Hz, then 40 Hz) with the orange wavelet', s2Wav: 'orange = wavelet at the current position', s2Coef: 'Wavelet coefficient (bright = swept)',
    s2ro: 'Analysis frequency <b>{f} Hz</b> → envelope standard deviation <b>{s} ms</b> (effective window about {d} ms, shorter as f grows). Coefficient at this position: <b>{c}</b>; swept {k} / {n} samples.',
    s2term: 'This page always uses a Morlet wavelet with ω₀ = 6: the window width is proportional to 1/f, so the wavelet has the same shape at every frequency and differs only in size.',
    s3k: 'Step 3 · The scalogram', s3t: 'Fixed window vs stretching window',
    s3e: 'This step answers: given one long low tone and two short high clicks, can both kinds of window show them clearly? The signal is an 8 Hz tone (about 0.1–0.5 s) plus two 48 Hz clicks 80 ms apart (near 0.66 s and 0.74 s). The upper map is the fixed-window spectrogram (STFT); the lower is the wavelet <strong>scalogram</strong> (the wavelet coefficients of every frequency laid out as an image, frequency on a log axis). Drag “STFT window length” and “wavelet cycles ω₀” (a bigger ω₀ puts more cycles inside the envelope) one at a time: does the 8 Hz band get thinner, and do the two clicks separate into two blobs? Each map is scaled to its own brightest cell, so brightness is not compared between maps.',
    s3LL: 'STFT window length L', s3WL: 'Wavelet cycles ω₀', s3reset: 'Reset both parameters', cv3: 'Spectrogram and scalogram of the same signal',
    s3Stft: 'Top: fixed-window spectrogram (STFT)', s3Cwt: 'Bottom: wavelet scalogram (ω₀ adjustable)',
    s3ro: 'σ is the standard deviation of a window’s amplitude envelope, a measure of its width. STFT: one window for all frequencies, σt = <b>{st} ms</b>, σf = <b>{sf} Hz</b>. Wavelet: at 8 Hz σt = <b>{t1} ms</b>, σf = <b>{f1} Hz</b>; at 48 Hz σt = <b>{t2} ms</b>, σf = <b>{f2} Hz</b>. Rule of thumb: the two clicks separate fairly easily once the window’s σt is below about half their 80 ms gap.',
    s3term: 'For a Gaussian window the product σt·σf is fixed at 1/(2π): changing the window only moves precision between time and frequency; you cannot shrink both.',
    s4k: 'Step 4 · Haar and sparsity', s4t: 'Describe a sharp change with the fewest numbers',
    s4e: 'This step answers: how many coefficients does a signal with sharp jumps really need? Expand the signal in an orthonormal basis (the Haar wavelet basis, or the Fourier cosine/sine basis, 128 coefficients each), keep only the K coefficients with the largest magnitude, set the rest to zero, and rebuild. <strong>RMSE (root-mean-square error)</strong>: square the point-by-point difference between the rebuilt signal and the noise-free original, average, take the square root; smaller is better. Drag “kept coefficients K”: compare orange (Haar) with cyan (Fourier) at the pulse edges and see which RMSE falls first. Then drag “noise”: the grey line gets rough, but keeping only a few large coefficients filters part of it out.',
    s4KL: 'Kept coefficients K', s4NL: 'Noise standard deviation', s4reset: 'Reset K and noise', cv4: 'Original signal and sparse rebuilds in two bases',
    s4In: 'Input (grey = noisy, green = noise-free original)', s4H: 'Haar rebuild (RMSE {e}, green = original)', s4F: 'Fourier rebuild (RMSE {e}, green = original)', s4Leg: 'Horizontal axis: 128 samples; both rebuilds keep exactly K coefficients.',
    s4ro: 'Keeping <b>{K} / {n}</b> coefficients, noise standard deviation {sd}. The input itself has RMSE <b>{ri}</b> against the original; Haar rebuild <b>{rh}</b>; Fourier rebuild <b>{rf}</b>; currently smaller: <b>{who}</b>. This holds only for this page’s signal: for a pure sine, Fourier would win with just 1 coefficient.',
    s4w_h: 'Haar', s4w_f: 'Fourier', s4w_e: 'tie',
    s4term: 'The signal is a weak sine plus a wide pulse over samples 45–76 and a narrow pulse over samples 100–103; the wide pulse has odd-numbered edges (45, 77), so Haar gets no alignment advantage. For very small K Fourier is slightly ahead; as K grows Haar overtakes it (the gap narrows when noise is large).',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: frequency, time and windows',
    s5e: 'The thread of this page: a Fourier spectrum answers “what is in the signal”; windows and wavelets let it also answer “when”; sparse representation asks “what is the fewest numbers that describe it”.',
    c1t: 'Spectra carry no order', c1b: 'The magnitude spectrum is unchanged by time reversal, so low-then-high and high-then-low share a spectrum (step 0; real signals, magnitude only).',
    c2t: 'The window trade-off', c2b: 'A longer window sharpens frequency and blurs time; for a Gaussian window σt·σf stays at 1/(2π) (steps 1 and 3).',
    c3t: 'A window that scales', c3b: 'A wavelet keeps σf/f = 1/ω₀ fixed: high frequencies get fine time location, low frequencies get fine frequency location (steps 2 and 3).',
    c4t: 'Sparsity depends on the signal', c4b: 'For this page’s noise-free signal the jumps cost fewer Haar coefficients; a smooth periodic signal costs fewer Fourier coefficients. There is no universal winner (step 4).',
    modelT: 'Model and limits',
    modelB: 'Everything here is a discrete teaching calculation: 256 Hz sampling, 256 points (128 in step 4); a Gaussian window or a Morlet wavelet (ω₀ = 6 by default); zeros are assumed outside the record, so coefficients near the edges are too small. The maps are illustrations, not instrument measurements, and the Haar comparison covers one hand-built signal.',
    linksT: 'Continue elsewhere',
    link1: 'Fourier · spectrum view: see how sine components build any signal', link2: 'Convolution · moving average: a wavelet coefficient is a slide-multiply-sum of signal and wavelet', link3: 'Sampling · the Nyquist line: how high a frequency 256 Hz sampling can resolve',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result'
  }
};
let currentLang = 'en';
function t(key, vars = {}) { let out = (STR[currentLang] && STR[currentLang][key]) || key; return out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (_) {}
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('active', b.dataset.lang === currentLang); b.setAttribute('aria-pressed', b.dataset.lang === currentLang ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (_) {}
  setLang(saved === 'zh' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
