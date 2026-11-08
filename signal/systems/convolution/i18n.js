'use strict';
/* ============================================================
   卷积讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '卷积 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '卷积',
    tagline: '把照片磨皮、给声音加回声、让 AI 认出一只猫——背后都是同一个运算。这一页从「加权平均着往前挪」开始，一步步把它算个明白。',
    nav0: '0 钩子', nav1: '1 滑动平均', nav2: '2 拆开算账', nav3: '3 重叠面积',
    nav4: '4 图像卷积核', nav5: '5 三个马甲', nav6: '6 遇见傅里叶',
    start: '开始探索 ↓',
    s0split: '对比位置',
    foot: 'knowledge.integ.life · 卷积 Convolution —— 一步一交互系列',

    s0k: '第 0 步 · 先看结论',
    s0t: '同一个运算，两副面孔',
    s0e: '下面是一张照片。拖动中间的对比滑杆：右边是被「揉糊」的版本，切到「边缘」再看——轮廓被单独描了出来。两个效果看起来毫不相干，却是<strong>同一个运算</strong>，区别只在于它用的一组数字（叫做<strong>核</strong>）。这一页就讲清这件事：<strong>卷积</strong>。',
    s0blur: '模糊核', s0edge: '边缘核',
    s0hint: '模糊核是 3×3 的平均（还带一点中间重）；边缘核是「中心减掉周围」。后面第 4 步你能亲手改这些数字。先记住这个画面：<strong>换核 = 换效果，运算本身不变。</strong>',
    cOrig: '原图', cAfter: '卷积后',

    s1k: '第 1 步 · 先看它干活',
    s1t: '滑动平均：卷积最朴素的样子',
    s1e: '这是一条带噪声的曲线（像气温或股价）。让一个<strong>窗口</strong>沿着曲线滑动，每到一处就把窗口里的数<strong>取平均</strong>，输出曲线立刻平滑了。窗口越宽越平滑——但峰谷也被磨钝、位置还往后拖。记住这个动作：<strong>一个权重窗口，一边滑一边算加权和</strong>，这就是卷积的全部骨架。',
    s1win: '窗口宽度 W',
    s1play: '▶ 播放', s1pause: '⏸ 暂停',
    s1ro: '窗口宽度 W = {w} · 当前窗口平均 = {avg} · 输出相对输入滞后约 {lag} 个采样点',
    s1note: '这里每个点的权重都是 1/W（核 = [1,1,…,1]/W）。把权重换成别的分布，就是一般的卷积——下一步就把这个「滑着算」的过程拆开，一步一步算给你看。',
    cRaw: '原始（带噪）', cSmooth: '滑动平均', cWin: '窗口',

    s2k: '第 2 步 · 拆开算账',
    s2t: '翻转、滑动、相乘、求和',
    s2e: "离散卷积把核<strong>翻转</strong>成 g[−k]，再按输出索引 n <strong>平移</strong>，列 k 上就成了 g[n−k]。只把重叠处<strong>逐项相乘并求和</strong>，得到 y[n]。这里 f 从 k=0 到4，g 从 j=0 到2，范围外都补0。改任意数字，或直接选择输出 n 检查边缘；也可用原来的「单步」看对齐、乘积、求和三阶段。",
    s2f: '输入序列 f', s2g: '核 g',
    s2flip: "g[{n}−k]", s2prod: '逐项乘积', s2out: '输出 y = f * g',
    s2step: '单步 →', s2play: '▶ 播放', s2reset: '重置',
    s2idle: '点「单步」开始：先把核翻转，再逐格滑动算账。',
    s2align: '第 {n} 个输出：核已翻转并对齐到位置 {n}。',
    s2prods: '重叠处逐项相乘（灰色 = 没有重叠，不参与）：',
    s2sum: 'y[{n}] = {terms} = {sum}',
    s2done: '算完了：y = [{vals}]。改一改上面的数字，再算一遍试试。',
    s2formulaNote: '公式 (f * g)[n] = Σ<sub>k</sub> f[k] · g[n − k] 里 g[n − k] 的减号，就是「翻转」的来源：n 固定时，k 增大、n−k 减小，核是倒着和 f 对齐的。动画里核的左右顺序与输入框相反，正是这一翻。',

    s3k: '第 3 步 · 连续版',
    s3t: '滑动着求重叠面积',
    s3e: '把序列换成连续的脉冲，同一套动作变成：让一个脉冲滑过另一个，<strong>重叠部分的面积</strong>就是该位移下的输出。拖动位移 τ，看下方输出曲线如何被逐点「长」出来。矩形 × 矩形会卷出一个<strong>三角形</strong>：底宽 = 两个脉冲宽度之和，峰值 = 完全重合时的重叠面积。',
    s3rr: '矩形 × 矩形', s3rt: '矩形 × 三角',
    s3shift: '位移 τ',
    s3ro: 'τ = {tau} · 重叠面积（= 输出值）= {area}',
    s3note: '连续卷积写作 (f * g)(τ) = ∫ f(t) · g(τ − t) dt：对每个位移 τ，把两条曲线逐点相乘再积分——积分的正是重叠部分的面积。换成三角脉冲，输出的边会变圆润：形状相乘再累加，棱角总被磨掉一些。',
    cFixedF: 'f（固定）', cSlideG: 'g（滑动）', cOverlap: '重叠', cOut: '输出 (f * g)(τ)',

    s4k: '第 4 步 · 本页高潮',
    s4t: '图像卷积核：一张照片的每个像素都在算账',
    s4e: '把「窗口」缩小到 3×3、把「滑动」铺满整张照片，就是图像卷积：每个输出像素 = 它 3×3 邻域与核的<strong>加权和</strong>。逐格改核里的数字，或点预设，右图会立刻按新核重算（真算每一个像素）。把鼠标悬停（或点按）在右图任意像素上，下方会把这个像素的算账过程完整摊开。<strong>CNN 的「卷积层」做的就是这件事</strong>，只不过它的核不是人写的，是从数据里学出来的。',
    s4src: '原图', s4out: '卷积结果',
    s4div: '除数', s4off: '偏移',
    pIdentity: '原图（单位核）', pBlur: '模糊', pSharpen: '锐化', pEdge: '边缘检测', pEmboss: '浮雕',
    s4accT: '这个像素是怎么算出来的',
    s4idle: '还没有选中像素——把鼠标移到右图上（手机上点按），这里会显示该像素 3×3 邻域逐格相乘求和的全过程。',
    s4accHead: '输出像素 ({x}, {y})，以红色通道为例（绿、蓝通道同理）：',
    s4accSum: '红色通道合计 = {sum} → ÷{div} {off}→ 钳制到 0–255 得 {val}；同理 G = {g}，B = {b}。',
    s4offTxt: '+ 偏移 {off} ',

    s5k: '第 5 步 · 换个场景',
    s5t: '同一个运算，三个马甲',
    s5e: '认出骨架之后，你会发现卷积到处都是：声音的回声、照片的虚化、数据的平滑——全都是「输出的每一点 = 输入邻域的加权和，权重来自核」。逐个点开看看。',
    tabAudio: '① 音频回声', tabPhoto: '② 照片虚化', tabData: '③ 平滑数据',
    s5aNote: '回声 = 原声与一串「冲激」（延迟点上放几个尖峰）做卷积：每个尖峰把原声复制一份、按衰减缩小、延迟播放。点「播放带回声」，再拖延迟、衰减和重复次数听区别。下面画的就是这个冲激串（核）。<a class="fourier-link" href="../lti/#step1">冲激本人：怎样把任何信号拆成一串尖峰 →</a>',
    aDry: '▶ 播放原声', aEcho: '▶ 播放带回声',
    aDelay: '延迟（秒）', aDecay: '衰减', aReps: '重复次数',
    cIR: '冲激响应（核）',
    s5pNote: '虚化就是第 4 步的盒式模糊，只是核更大。用可分离的两遍一维盒式卷积实现，半径越大糊得越狠——试着把半径拉满，看细节如何消失。',
    pRadius: '虚化半径',
    s5dNote: '回到一维：灰色是窗口宽 5 的滑动平均（盒式核），青色是把 [1,2,1]/4 这个「小山丘核」反复卷几遍的结果——遍数越多，核越接近钟形（高斯），曲线也越顺。',
    dPass: '[1,2,1]/4 遍数',
    legRaw: '原始（带噪）', legBox: '盒式平均（宽 5）', legGauss: '[1,2,1]/4 多遍',

    s6k: '第 6 步 · 终章',
    s6t: '与傅里叶相遇：卷积 = 频域里逐点相乘',
    s6e: '最后一件事，也是卷积和上一页的接头暗号：<strong>时域里老老实实算的卷积，恰好等于把两者做傅里叶变换、逐个频率相乘、再变回来。</strong>下面这张图里叠着两条曲线：青色实线是逐点苦算的结果，橙色虚线走的是频域捷径——两者叠画在同一张图里，下方给出两者的最大误差。换信号、换核，随便试，误差都应该近乎为零。',
    s6sig: '信号 f', s6ker: '核 g',
    sigRect: '矩形脉冲', sigTri: '三角脉冲', sigSine: '正弦波包', sigSteps: '随机台阶',
    kerSmooth: '平滑核 [1,2,3,2,1]', kerDiff: '差分核 [−1, 1]', kerEcho: '回声核（冲激串）',
    s6ro: '两条路算出的结果最大相差 {err}（双精度浮点下应为 1e-13 量级）',
    cTime: '时域卷积（逐点算）', cFreq: '频域相乘（FFT）', cSpec: '频谱 |F|、|G| 与乘积 |F·G|',
    s6fin: '所以傅里叶页那一串旋转的圆不只是好看——<strong>它把卷积从「逐点苦算」变成「逐频相乘」</strong>：长卷积用 FFT 算能快多少，取决于序列长度与实现——序列越长优势越大，长到一定程度能快上成百上千倍，短序列则未必划算。今天你已经在四种场景里见过同一个骨架了：滑动平均、离散求和、重叠面积、图像核。音频均衡、图像处理、CNN、乃至概率里「两个独立随机变量之和的分布」，都是它。',
    s6link: '回傅里叶页再看看那些圆 →',
    s6linkH: 'h[n]：系统对一记冲激的全部回答 →',
    convSelect: "检查输出索引 n（方向键 ±1）",
    convSelected: "当前 n =",
    convSeekNote: "直接选 n 会暂停、清除播放计时积累并显示本项的计算结果。图中先前已填的输出格按当前数组重算，不代表做过哪些学习步骤。n、k、j 都是离散索引，不是秒。",
    convSupport: "当前 y[{n}]：有效 k 从 {lo} 到 {hi}，共 {count} 对；对应 j={n}−k。完整线性卷积长度 N+M−1={length}。",
    convTermPair: "k={k} → j={j}：f[{k}]≈{f} 与 g[{j}]≈{g} 对齐。",
    convTermProduct: "k={k} → j={j}：f[{k}]≈{f} × g[{j}]≈{g}，乘积≈{p}。",
    convBounds: "零延拓：f[k] 只在 0…4、g[j] 只在 0…2 存储值，其他索引视为0。要求 0≤k≤4 且 0≤n−k≤2，得到 k∈[max(0,n−2),min(4,n)]。这是索引重叠，不保证乘积或和非零；n=3 就可能正负抵消。输出可能非零的范围为0…6，外面没有重叠，y[n]=0；这里不循环绕回，也不裁成 same/valid。",
    convPrecision: "输入实际值限定在−99…99；清空或非有限输入按0计算，提交时显示实际存储值。图格沿用概览舍入（约至两位小数，极小值可能显示0）；算式与索引列表最多9位有效数字，极小值用科学记数，含浮点舍入误差。请用下方列表核对小屏或小数细节。",
    convInput: "{name}[{index}] 的数值（−99 到99）",
    convQuestion: "用默认数组检查 n=0、2、3、6：边缘为什么只有1对，中段有3对？n=3 明明重叠却为何输出0？把一项改成小数，再逐项对账；重置会恢复默认数组并暂停。",
    convSourceTitle: "卷积、相关与边界依据",
    convCorrelation: "本步是实数、从索引0开始的完整线性卷积 y[n]=Σₖ f[k]g[n−k]。NumPy 官方文档给出同一定义与 N+M−1 长度。作比较，相关的一种滞后约定是 r[ℓ]=Σₖ f[k]g[k−ℓ]：随 k 增加，第二下标增加，而卷积中 n−k 减少；两种公式通常不同，特殊输入也可能算出相同值。相关还有相反滞后约定，这里不做第二套实验。连续卷积另在第3步用积分说明；本步不是连续时间近似。",
  },
  en: {
    docTitle: 'Convolution · One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Convolution',
    tagline: 'Blurring a photo, adding echo to a sound, teaching an AI to recognise a cat — one operation sits behind all of them. This page starts from “a weighted average on the move” and builds it up until you can compute it yourself.',
    nav0: '0 Hook', nav1: '1 Moving average', nav2: '2 Step by step', nav3: '3 Overlap area',
    nav4: '4 Image kernels', nav5: '5 Three disguises', nav6: '6 Meet Fourier',
    start: 'Start exploring ↓',
    s0split: 'Split position',
    foot: 'knowledge.integ.life · Convolution — one interaction at a time',

    s0k: 'Step 0 · The punchline first',
    s0t: 'One operation, two faces',
    s0e: 'Here is a photo. Drag the comparison slider: on the right it is blurred soft; switch to “Edge” and the same picture turns into a bare outline. The two effects look unrelated, yet they are <strong>the same operation</strong> — the only difference is a small grid of numbers it uses, called a <strong>kernel</strong>. That operation is <strong>convolution</strong>, and this page takes it apart.',
    s0blur: 'Blur kernel', s0edge: 'Edge kernel',
    s0hint: 'The blur kernel is a 3×3 average with a heavier centre; the edge kernel is “centre minus surroundings”. In step 4 you will edit these numbers yourself. For now, keep the picture in mind: <strong>change the kernel and you change the effect — the operation never changes.</strong>',
    cOrig: 'Original', cAfter: 'After convolution',

    s1k: 'Step 1 · See it work first',
    s1t: 'Moving average: convolution in its simplest clothes',
    s1e: 'This is a noisy curve (think temperature or a stock price). Slide a <strong>window</strong> along it and <strong>average</strong> whatever falls inside: the output is instantly smoother. A wider window smooths more — but it also flattens the peaks and drags everything later. Remember this motion: <strong>a window of weights, sliding along and taking weighted sums</strong>. That is the whole skeleton of convolution.',
    s1win: 'Window width W',
    s1play: '▶ Play', s1pause: '⏸ Pause',
    s1ro: 'Window width W = {w} · current window average = {avg} · output lags the input by about {lag} samples',
    s1note: 'Here every weight is 1/W (kernel = [1,1,…,1]/W). Swap in a different weight profile and you get convolution in general — the next step takes this “slide and sum” apart and does the arithmetic in the open.',
    cRaw: 'Raw (noisy)', cSmooth: 'Moving average', cWin: 'Window',

    s2k: 'Step 2 · Taking it apart',
    s2t: 'Flip, slide, multiply, add',
    s2e: "Discrete convolution <strong>reverses</strong> the kernel to g[−k], then <strong>shifts</strong> it by output index n, giving g[n−k] in column k. <strong>Multiply overlapping pairs and sum</strong> to obtain y[n]. Here f stores k=0…4 and g stores j=0…2; values outside are zero. Edit any value or select output n to inspect an edge. The original Step button still walks alignment, multiplication and summation.",
    s2f: 'Input sequence f', s2g: 'Kernel g',
    s2flip: "g[{n}−k]", s2prod: 'Products', s2out: 'Output y = f * g',
    s2step: 'Step →', s2play: '▶ Play', s2reset: 'Reset',
    s2idle: 'Press “Step” to begin: first the kernel flips, then it slides and settles accounts position by position.',
    s2align: 'Output #{n}: kernel flipped and aligned at position {n}.',
    s2prods: 'Multiply the overlapping pairs (grey = no overlap, does not count):',
    s2sum: 'y[{n}] = {terms} = {sum}',
    s2done: 'Done: y = [{vals}]. Change the numbers above and run it again.',
    s2formulaNote: 'In the formula (f * g)[n] = Σ<sub>k</sub> f[k] · g[n − k], the minus sign in g[n − k] is exactly where the flip comes from: with n fixed, as k grows, n−k shrinks — the kernel meets f in reverse order. The animation shows the kernel reversed relative to the input boxes for precisely this reason.',

    s3k: 'Step 3 · The continuous version',
    s3t: 'Slide, and measure the overlap',
    s3e: 'Swap the sequences for continuous pulses and the same moves become: slide one pulse across the other — <strong>the area of overlap</strong> is the output at that shift. Drag the shift τ and watch the output curve below grow point by point. Rectangle × rectangle convolves into a <strong>triangle</strong>: its base is the sum of the two widths, its peak the overlap area at perfect alignment.',
    s3rr: 'Rect × Rect', s3rt: 'Rect × Triangle',
    s3shift: 'Shift τ',
    s3ro: 'τ = {tau} · overlap area (= output value) = {area}',
    s3note: 'Continuous convolution is written (f * g)(τ) = ∫ f(t) · g(τ − t) dt: for each shift τ, multiply the two curves pointwise and integrate — which is precisely the overlapping area. Switch to the triangle pulse and the output rounds off: multiply-and-accumulate always files down some of the corners.',
    cFixedF: 'f (fixed)', cSlideG: 'g (sliding)', cOverlap: 'Overlap', cOut: 'Output (f * g)(τ)',

    s4k: 'Step 4 · The main event',
    s4t: 'Image kernels: every pixel settles its own account',
    s4e: 'Shrink the window to 3×3 and slide it across a whole photo and you get image convolution: every output pixel is the <strong>weighted sum</strong> of its 3×3 neighbourhood under the kernel. Edit the kernel cell by cell, or pick a preset — the right image is recomputed immediately, pixel by pixel, for real. Hover (or tap) any pixel in the output and its full arithmetic is laid out below. <strong>A CNN “convolutional layer” is exactly this</strong>, except its kernel is not hand-written — it is learned from data.',
    s4src: 'Source', s4out: 'Convolved',
    s4div: 'Divisor', s4off: 'Offset',
    pIdentity: 'Identity (original)', pBlur: 'Blur', pSharpen: 'Sharpen', pEdge: 'Edge detect', pEmboss: 'Emboss',
    s4accT: 'How this pixel is computed',
    s4idle: 'No pixel selected yet — hover over the output image (tap on mobile) and the full 3×3 multiply-and-add for that pixel appears here.',
    s4accHead: 'Output pixel ({x}, {y}) — red channel shown (green and blue work identically):',
    s4accSum: 'Red total = {sum} → ÷{div} {off}→ clamped to 0–255 gives {val}; likewise G = {g}, B = {b}.',
    s4offTxt: '+ offset {off} ',

    s5k: 'Step 5 · Same skeleton, new scene',
    s5t: 'One operation, three disguises',
    s5e: 'Once you can see the skeleton, convolution turns up everywhere: echoes in audio, blur in photos, smoothing in data — always “each output point is a weighted sum of a neighbourhood of the input, with weights from a kernel”. Open each disguise in turn.',
    tabAudio: '① Audio echo', tabPhoto: '② Photo blur', tabData: '③ Smoothing data',
    s5aNote: 'An echo is the original sound convolved with a train of impulses (spikes at delayed instants): each spike plays a copy of the sound, scaled down by the decay, later in time. Play the echo version, then drag delay, decay and the echo count and listen again. The spikes drawn below are that kernel. <a class="fourier-link" href="../lti/#step1">The impulse itself: how any signal splits into a train of spikes →</a>',
    aDry: '▶ Play dry', aEcho: '▶ Play with echo',
    aDelay: 'Delay (s)', aDecay: 'Decay', aReps: 'Echo count',
    cIR: 'Impulse response (the kernel)',
    s5pNote: 'Blur is step 4’s box kernel grown larger, computed as two separable 1-D box convolutions. The bigger the radius, the harder it blurs — drag it up and watch detail disappear.',
    pRadius: 'Blur radius',
    s5dNote: 'Back to 1-D: grey is a width-5 moving average (box kernel); cyan applies the little hill kernel [1,2,1]/4 over and over — with each pass the kernel gets closer to a bell (Gaussian) shape and the curve gets smoother.',
    dPass: 'Passes of [1,2,1]/4',
    legRaw: 'Raw (noisy)', legBox: 'Box average (width 5)', legGauss: '[1,2,1]/4, several passes',

    s6k: 'Step 6 · Finale',
    s6t: 'Meeting Fourier: convolution becomes pointwise multiplication',
    s6e: 'One last thing — the handshake with the previous page: <strong>honest time-domain convolution gives exactly the same answer as Fourier-transforming both, multiplying frequency by frequency, and transforming back.</strong> The plot below overlays the two routes in the same axes: the cyan solid curve is computed point by point, the orange dashed one takes the frequency shortcut. The maximum error between them is stated below. Swap signals and kernels freely — the error should stay essentially zero.',
    s6sig: 'Signal f', s6ker: 'Kernel g',
    sigRect: 'Rectangular pulse', sigTri: 'Triangular pulse', sigSine: 'Sine burst', sigSteps: 'Random steps',
    kerSmooth: 'Smoothing kernel [1,2,3,2,1]', kerDiff: 'Difference kernel [−1, 1]', kerEcho: 'Echo kernel (impulse train)',
    s6ro: 'Maximum error between the two routes = {err} (in double precision, expect around 1e-13)',
    cTime: 'Time-domain convolution (point by point)', cFreq: 'Frequency-domain product (FFT)', cSpec: 'Spectra |F|, |G| and product |F·G|',
    s6fin: 'So the spinning circles on the Fourier page are not just pretty — <strong>they turn convolution from “multiply everything out” into “multiply frequency by frequency”</strong>: with FFT, how much faster depends on the sequence length and the implementation — the longer the convolution, the bigger the win, up to hundreds or thousands of times faster for long ones; for short sequences it may not pay off at all. By now you have met the same skeleton four times: moving average, discrete sum, overlap area, image kernel. Audio EQ, image processing, CNNs — even the distribution of a sum of two independent random variables in probability — all run on it.',
    s6link: 'Back to the Fourier page and its circles →',
    s6linkH: "h[n]: a system's complete answer to one impulse →",
    convSelect: "Inspect output index n (arrows ±1)",
    convSelected: "Current n =",
    convSeekNote: "Selecting n pauses, clears accumulated playback time and reveals this computed output. Earlier filled cells are recomputed from the current arrays, not a record of completed learning steps. n, k and j are discrete indices, not seconds.",
    convSupport: "For y[{n}]: valid k runs from {lo} to {hi}, {count} pairs; j={n}−k. Full linear-convolution length N+M−1={length}.",
    convTermPair: "k={k} → j={j}: align f[{k}]≈{f} with g[{j}]≈{g}.",
    convTermProduct: "k={k} → j={j}: f[{k}]≈{f} × g[{j}]≈{g}, product≈{p}.",
    convBounds: "Zero extension: f[k] is stored at0…4 and g[j] at0…2; all other indices mean0. Requiring0≤k≤4 and0≤n−k≤2 gives k∈[max(0,n−2),min(4,n)]. This is INDEX overlap, not a guarantee of nonzero products or sum: n=3 can cancel. Potentially nonzero outputs span0…6; outside, no pairs overlap and y[n]=0. No circular wrap or same/valid crop is used.",
    convPrecision: "Actual inputs are bounded to−99…99; empty/nonfinite inputs mean0, and a committed field mirrors its stored value. Diagram boxes retain overview rounding (about2 decimals; tiny values may display0). Equations and the index list show up to9 significant digits, scientific notation for tiny values and floating-point roundoff. Use the list for readable small-screen or decimal detail.",
    convInput: "Value of {name}[{index}] (−99 to99)",
    convQuestion: "With the default arrays inspect n=0,2,3,6. Why does an edge have1 pair and the middle3? How can n=3 overlap yet give0? Edit one value to a decimal and check the pairs. Reset restores the default arrays and pauses.",
    convSourceTitle: "Convolution, correlation and boundaries",
    convCorrelation: "This is full linear convolution of real sequences indexed from0: y[n]=Σₖ f[k]g[n−k]. NumPy’s official documentation uses this definition and N+M−1 length. For comparison, one correlation lag convention is r[ℓ]=Σₖ f[k]g[k−ℓ]. As k grows its second index grows; convolution’s n−k decreases. The formulas generally differ, though special inputs can give the same values. Opposite lag conventions also exist; no second experiment is introduced here. Step3 separately explains a continuous integral; this step is not a continuous-time approximation.",
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
