'use strict';
// Mandelbrot lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'Mandelbrot 集 · 一条规则划出的边界',
    back: '← 知识索引',
    compare: '对照另一版本：Mandelbrot 分形 · 无限放大 →',
    navLabel: 'Mandelbrot 集步骤导航',
    tagline: '取平面上一个点 c，从 0 出发反复做 z → z² + c。有的 c 让这串数永远待在原点附近，有的 c 让它飞向无穷。把前一种 c 全部涂黑，就得到 Mandelbrot 集。六步里你会亲手追一条轨道、证明「出了半径 2 就回不来」、数出黑色区域的面积、看清黑块内部的周期结构，再一路放大十亿倍，最后看每个 c 背后的朱利亚集。',
    nav0: '0 一条轨道', nav1: '1 半径 2', nav2: '2 涂色', nav3: '3 周期', nav4: '4 放大', nav5: '5 朱利亚集', nav6: '6 收束',
    sep: '，',

    s0k: '第 0 步 · 规则',
    s0t: '固定一个 c，从 0 开始一遍遍做 z → z² + c，会走到哪里？',
    s0e: '这一步要回答：给定一个复数 c，序列 z₀ = 0，z₁ = z₀² + c，z₂ = z₁² + c，…（这串点叫 c 的<strong>轨道</strong>）是留在原点附近，还是越走越远？复数 z = x + yi 就是平面上的点 (x, y)：横轴是实部，纵轴是虚部。平方的几何意义是「到原点的距离 |z| 平方、与正实轴的夹角翻倍」（<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ 复数页第 4 步：乘法 = 模相乘、角相加</a>），然后加 c 就是整体平移 c。注意 z₁ = c，所以橙色圈既是参数 c，也是轨道的第一站。',
    c0aria: '复平面上 c 的轨道', c0title: '复平面：c 的轨道 z₀ = 0 → z₁ → z₂ → …',
    lgC: '参数 c（可在图上拖动）', lgOrbit: '轨道（越新越亮）', lgNow: '最后显示的一步 zₙ', lgR2: '半径 2 的圆',
    cRe: 'c 的实部', cIm: 'c 的虚部', nShown: '显示前 n 步',
    play0: '一步步走（到第 100 步或逃逸为止）',
    orb_zero: 'c = 0', orb_minus1: 'c = −1', orb_i: 'c = i', orb_swirl: 'c = −0.5 + 0.5i', orb_quarter: 'c = 0.25', orb_p03: 'c = 0.3', orb_slow: 'c = −0.1 + 0.65i',
    s0readout: 'c = {c}。最后几步：{tail}。|zₙ| = {mod}。{status}',
    s0esc: '第 {k} 步 |z| 首次超过 2，此后一路变大（下一步解释为什么回不来）。',
    s0stay: '前 {n} 步都没有离开半径 2 的圆。',
    s0hint: '观察顺序：依次点这几个预设，每次按「一步步走」。c = 0 停在原点；c = −1 在 0 与 −1 之间来回跳；c = i 先走两步，再在 −1 + i 与 −i 之间来回；c = −0.5 + 0.5i 绕圈收进一个点；c = 0.25 越走越慢地靠近 0.5；c = 0.3 只多了 0.05，第 12 步就冲出圆外；c = −0.1 + 0.65i 在圆内徘徊了 74 步，第 75 步才逃走。最后一个例子说明：只看前几十步，判断不了一个 c 会不会逃走。',

    s1k: '第 1 步 · 不归点',
    s1t: '轨道走出半径 2 的圆以后，还有可能绕回来吗？',
    s1e: '这一步要回答：上一步把「|z| > 2」当作逃逸的判据，凭什么？设某一步 |z| > 2，并且 |z| ≥ |c|。三角不等式给出 |z² + c| ≥ |z|² − |c| ≥ |z|² − |z| = |z|·(|z| − 1)。因为 |z| − 1 > 1，下一步的距离至少是这一步的 (|z| − 1) 倍，严格变大；变大后条件仍然成立，于是每一步都至少乘上一个大于 1 的数，轨道一去不回。条件 |z| ≥ |c| 在第一次越过 2 时总是成立：若 |c| ≤ 2，自然有 |z| > 2 ≥ |c|；若 |c| > 2，第一步 z₁ = c 就已越过，且 |z₁| = |c|。所以<strong>判据只需检查 |zₙ| > 2</strong>；反过来，只要轨道一直留在圆内（|zₙ| ≤ 2 恰好等于 2 也算圆内），c 就属于 Mandelbrot 集。',
    c1aria: '|zₙ| 随步数 n 的柱状图', c1title: '每一步到原点的距离 |zₙ|（纵轴已压缩）',
    lgIn: '|zₙ| ≤ 2（还在圆内）', lgOut: '|zₙ| > 2（已越界）', lgBound: '不等式保证的下限 |z|·(|z| − 1)',
    p1_slow: 'c = −0.1 + 0.65i（徘徊很久）', p1_p03: 'c = 0.3', p1_edge: 'c = −2（恰好压线）', p1_far: 'c = 2.1（|c| > 2）',
    s1readoutEsc: 'c = {c}，|c| = {cm}。第 {k} 步首次越界：|z{k}| = {a}。下一步 |z| = {b}，放大了 {r} 倍，不少于不等式给的 |z| − 1 = {lb} 倍；之后每一步都这样变大。',
    s1readoutStay: 'c = {c}，|c| = {cm}。前 {N} 步 |zₙ| 最大为 {mx}，从未超过 2。这只说明「前 {N} 步没逃」，不证明永远不逃。',
    s1hint: '读图：纵轴按 log₂(1 + |z|) 压缩，刻度上标的是 |z| 本身；大数被压扁，16 到 256 与 256 到 4096 占的高度差不多。观察顺序：先看默认的 c = −0.1 + 0.65i：蓝柱在 2 以下起伏七十多步，一旦变橙，后面的柱子一根比一根高，橙色空心圈（不等式给的下限）总在柱顶或柱顶下方。再点「c = −2」：轨道 0, −2, 2, 2, …，距离恰好停在 2，不算逃逸。点「c = 2.1」：第一步就越界。',

    s2k: '第 2 步 · 给每个 c 涂色',
    s2t: '把平面上每个 c 都算一遍，留下来的 c 拼成什么形状？',
    s2e: '这一步要回答：哪些 c 的轨道永远不出圆？电脑只能算有限步，所以实际做法是：选一个<strong>迭代上限 N</strong>，对每个像素的 c 算到第 N 步；若中途 |z| > 2 就按「第几步逃逸」（<strong>逃逸时间</strong>）上色，若 N 步都没逃就涂黑。黑色区域是「N 步内没被证明逃逸」的 c，它总是包含真正的 Mandelbrot 集；N 越大，误判为黑的 c 越少，黑色只会缩小、不会变大。右图记录黑色面积随 N 的变化，面积用 300 × 300 的格点中心计数（每个格点代表一小块面积）。整个集合都落在这个画框里（实部在 −2 到 0.48 之间，虚部在 ±1.13 之内），所以面积不会被画框截掉。',
    c2aria: 'Mandelbrot 集的逃逸时间图', c2baria: '黑色面积随迭代上限 N 的变化', c2title: '每个像素一个 c：黑 = 前 {N} 步都没逃',
    c2btitle: '黑色面积（格点估计）', c2bx: '迭代上限 N（对数刻度）',
    lgInside: '前 N 步没逃逸', lgEsc: '逃逸时间：早 → 晚', lgArea: '已试过的 N 及其面积',
    nMax: '迭代上限 N', play2: '从 N = 1 加到 1000', clearHist: '清除记录',
    s2progress: '已试 {c}/{n} 个 N。',
    s2readout: 'N = {N}：黑色面积 ≈ {a}（画框面积 {fa} 的 {pct}%）。',
    s2hint: '观察顺序：按「从 N = 1 加到 1000」。N = 1 时黑色是整个半径 2 的圆盘（被画框截掉一部分）；N 每变大一次，外围就剥掉一圈，右图的面积一路下降，在 N = 100 以后几乎贴平，N = 1000 时约 1.51。更细的格点、更大的 N 给出的估计约为 1.507（测试中用 1200 × 1200 格点、N = 5000 复核）。面积收敛，但边界细节会一直多下去：第 4 步专门看这一点。',

    s3k: '第 3 步 · 黑色内部',
    s3t: '对于黑色区域里的 c，轨道最后停在哪里？',
    s3e: '这一步要回答：留在圆内的轨道，长期看是什么样子？左图仍是 c 的平面，但黑色内部按轨道最终的<strong>周期</strong>上色：周期 p 表示轨道最后在 p 个点之间循环（周期 1 就是收进一个不动点）。右图是 z 的平面：灰线是前 60 步，彩色点是最终的循环。大心形区域都是周期 1；左边的圆盘是周期 2，可以直接验证：c = −1 时 0 → −1 → 0。心形边缘挂着一串「泡」，标号 p/q 的泡里周期是 q。右图白色 × 是一个特殊的不动点 α（z = z² + c 的一个解）；轨道的 q 个点绕着 α 转，每走一步，按角度顺序向前跳 p 个位置，也就是转过约 p/q 圈。<strong>乘子 |λ|</strong> 是循环上各点 2z 的乘积的模，表示附近的点每绕一圈被拉近的倍数：小于 1 才会被吸进去。',
    c3aria: '按周期上色的参数平面', c3baria: '所选 c 的轨道与最终循环', c3title: 'c 的平面：内部按最终周期上色',
    c3btitle: 'z 的平面：轨道与最终循环',
    lg3cycle: '最终循环（颜色 = 周期）', lg3tail: '前 60 步', lg3alpha: '不动点 α',
    bulb: '{pq} 泡',
    s3readout: 'c = {c}：轨道最终在 {p} 个点之间循环（周期 {p}），乘子 |λ| = {lam}（< 1，所以附近的点被吸进这个循环）。{rot}',
    s3rot: '绕 α 每步向前跳 {r} 个位置，即每步转过约 {r}/{p} 圈。',
    s3fixed: '周期 1：轨道收进一个不动点。',
    s3esc: 'c = {c}：第 {k} 步逃逸，不在集合内。',
    s3none: 'c = {c}：4000 步后仍没稳定到周期 ≤ 32 的循环。这样的 c 通常紧贴边界，收敛极慢；这里不下结论。',
    s3hint: '观察顺序：依次按 1/2、1/3、2/5、1/4、1/5、3/7 这几个泡的中心，看右图彩色点的个数（= q）和读数里「每步跳 p 个位置」。2/5 泡的五个点不是挨个走，而是隔一个跳一个。再在左图里拖动 c：只要不离开同一个泡，周期不变；跨过边界，周期才变。',

    s4k: '第 4 步 · 放大',
    s4t: '沿着边界一路放大，细节会不会有尽头？',
    s4e: '这一步要回答：放大边界附近的一个点，看到的东西会不会越来越简单？滑杆是<strong>放大倍数</strong>的指数：10^z 倍时，视窗宽度是 3.2 × 10^−z。缩放以橙色小圈为不动点：圈在屏幕上的位置不变，周围一切向它收拢。越深的地方，轨道要走越多步才分得出逃没逃，所以迭代上限 N 随放大一起提高（图中颜色只表示逃逸早晚，每 48 步循环一次，不是新的量；黑色仍按第 2 步的口径，是「N 步内没逃」，放得越深，其中越可能混有只是逃得比 N 晚的点）。两处目标：「海马谷」是主心形与周期 2 圆盘之间的缝里的一个边界点；「迷你 Mandelbrot」的中心 c ≈ −1.75488 是一个周期 3 的点（0 走三步回到 0），放大后会出现整个集合的一份小拷贝。电脑用的是双精度浮点数，相邻两个可表示的数之间有固定的间距；读数比较了像素间距和这个间距：放到 10⁹ 倍时像素仍比它粗一万倍以上；再放大约一万倍（到 10¹³ 附近），两者就只差几十倍以内，图像会因精度不足而失真。',
    c4aria: '放大中的 Mandelbrot 集边界', c4title: '目标：{name}（橙圈为缩放中心）',
    zoomSlider: '放大倍数（10 的幂）', play4: '一路放大到 10⁹ 倍',
    tg_seahorse: '海马谷', tg_minibrot: '迷你 Mandelbrot',
    s4readout: '放大 {mag} 倍：视窗宽 {w}，迭代上限 N = {N}。像素间距约 {px}，此处双精度的最小间距约 {u}，前者是后者的 {k} 倍，所以图像仍可靠。视窗里约 {pin}% 的点 N 步内没逃（黑）。',
    s4allin: '整个视窗都在集合内部：内部是平的，细节只长在边界上。',
    s4hint: '观察顺序：先选「迷你 Mandelbrot」，拖到 10^1.5 左右，能看到一份完整的小 Mandelbrot 集；继续拖到 10^3 以上，视窗落进小拷贝的内部，画面全黑——这说明细节只在边界上。再选「海马谷」按「一路放大」，留意每放大十倍，画面里都有新的卷须和螺旋，直到 10⁹ 仍是复杂的边界。减弱动态时按钮直接跳到 10⁹ 倍。',

    s5k: '第 5 步 · 朱利亚集',
    s5t: '固定 c，换起点 z₀，哪些起点不会逃？',
    s5e: '这一步要回答：前面每个 c 只从 z₀ = 0 出发。如果固定 c、让平面上每个点都当一次起点，留下来的起点组成什么？这些起点组成的集合叫 c 的<strong>填充朱利亚集</strong>（右图黑色），它的边界就是<strong>朱利亚集</strong>。Mandelbrot 集正是给朱利亚集分类的地图：数学上已经证明（Fatou 与 Julia，1918–1919），若 0 的轨道有界（c 在 Mandelbrot 集里），填充朱利亚集连成一片；若 0 的轨道逃逸，它碎成不相连的点尘。本页只演示这个定理，不证明它。左图拖动 c，右图用同一条规则 z → z² + c、同一个判据 |z| > 2 重画，迭代上限 200。',
    c5aria: '在 Mandelbrot 集上选择 c', c5baria: '所选 c 的填充朱利亚集', c5title: 'c 的平面（Mandelbrot 集）：拖动选 c',
    c5btitle: 'z₀ 的平面：c = {c} 的填充朱利亚集',
    lgJin: '200 步内没逃的起点 z₀', lgJesc: '起点的逃逸时间：早 → 晚',
    jl_basilica: 'c = −1', jl_rabbit: '兔子 c ≈ −0.1226 + 0.7449i', jl_dendrite: 'c = i', jl_dust: 'c = 0.3 + 0.6i',
    s5in: 'c = {c}：0 的轨道 2000 步内没有逃逸，c 在（数值上的）Mandelbrot 集内，所以填充朱利亚集连成一片。',
    s5out: 'c = {c}：0 的轨道第 {k} 步逃逸，c 在 Mandelbrot 集外，所以填充朱利亚集碎成点尘（图中只剩零星的晚逃逸像素）。',
    s5hint: '观察顺序：先点 c = −1，黑色是一串相连的圆泡；再点「兔子」（周期 3 泡的中心），每个黑块都长着三只「耳朵」，对应第 3 步的 3 点循环；c = i 在集合里但没有内部，黑色细得几乎看不见，只剩枝杈；最后点 c = 0.3 + 0.6i（集合外），黑色碎掉。然后自己从黑色区域慢慢拖到外面，看连通的形状在跨过边界时崩开。',

    s6k: '第 6 步 · 收束',
    s6t: '一条规则，回答了哪些问题？',
    s6fin: '全页只用了一条规则 z → z² + c 和一个判据 |z| > 2。<strong>第 1 步</strong>证明了判据可靠：出了半径 2 就回不来。<strong>第 2 步</strong>把每个 c 涂色，黑色面积随迭代上限收敛到约 1.51。<strong>第 3 步</strong>看到黑色内部按周期分块，p/q 泡里的循环每步绕 α 跳 p 格。<strong>第 4 步</strong>放大十亿倍，边界细节没有尽头。<strong>第 5 步</strong>里，同一条规则换个问法（固定 c、变起点）得到朱利亚集，而 Mandelbrot 集告诉你它连不连通。',
    formula: 'c ∈ M  ⟺  z₀ = 0, zₙ₊₁ = zₙ² + c 对所有 n 都有 |zₙ| ≤ 2\n|z| > 2 且 |z| ≥ |c|  ⟹  |z² + c| ≥ |z|·(|z| − 1) > |z|',
    boundary: '适用范围：页面上的黑色都是「有限步内没逃」的数值结果，而不是证明；周期是在 4000 步后以 10⁻⁷ 的容差检测的，紧贴边界的点收敛太慢，会被标成「未定」。面积是格点计数的估计，不是精确值。连通性的二分法是已证明的定理，本页只演示。',
    linksTitle: '相关页面',
    lk1: '复数页第 4 步：乘法 = 模相乘、角相加（z² 为什么把角度翻倍）→',
    lk2: '牛顿法页第 4 步：起点落在哪个盆地就收敛到哪个根，盆地的边界同样是分形 →',
    lk3: '牛顿法页第 1 步：把上一步的输出当下一步的输入，这就是「迭代」→',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《Mandelbrot 分形 · 无限放大》的平行版本。',
  },
  en: {
    pageTitle: 'The Mandelbrot Set · A Border Drawn by One Rule',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Mandelbrot Set · Zoom Without End →',
    navLabel: 'Mandelbrot set step navigation',
    tagline: 'Pick a point c in the plane, start at 0 and apply z → z² + c over and over. For some c the numbers stay near the origin forever; for others they fly off to infinity. Paint the first kind black and you have the Mandelbrot set. In six steps you will follow an orbit by hand, prove that radius 2 is a point of no return, measure the black area, see the periodic structure inside it, zoom in a billion times, and finally meet the Julia set hiding behind every c.',
    nav0: '0 One orbit', nav1: '1 Radius 2', nav2: '2 Colouring', nav3: '3 Periods', nav4: '4 Zoom', nav5: '5 Julia sets', nav6: '6 Wrap-up',
    sep: ', ',

    s0k: 'Step 0 · The rule',
    s0t: 'Fix c, start at 0 and keep applying z → z² + c. Where do you end up?',
    s0e: 'This step asks: for a given complex number c, does the sequence z₀ = 0, z₁ = z₀² + c, z₂ = z₁² + c, … (the <strong>orbit</strong> of c) stay near the origin, or drift further and further away? A complex number z = x + yi is simply the point (x, y): the horizontal axis is the real part, the vertical axis the imaginary part. Squaring squares the distance |z| from the origin and doubles the angle from the positive real axis (<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ complex numbers, step 4: multiplying multiplies lengths and adds angles</a>); adding c then shifts everything by c. Note that z₁ = c, so the orange ring is both the parameter c and the first stop of the orbit.',
    c0aria: 'Orbit of c in the complex plane', c0title: 'Complex plane: the orbit z₀ = 0 → z₁ → z₂ → … of c',
    lgC: 'Parameter c (drag it on the picture)', lgOrbit: 'Orbit (newer = brighter)', lgNow: 'Last step shown, zₙ', lgR2: 'Circle of radius 2',
    cRe: 'Real part of c', cIm: 'Imaginary part of c', nShown: 'Show the first n steps',
    play0: 'Walk it step by step (to step 100 or escape)',
    orb_zero: 'c = 0', orb_minus1: 'c = −1', orb_i: 'c = i', orb_swirl: 'c = −0.5 + 0.5i', orb_quarter: 'c = 0.25', orb_p03: 'c = 0.3', orb_slow: 'c = −0.1 + 0.65i',
    s0readout: 'c = {c}. Last few steps: {tail}. |zₙ| = {mod}. {status}',
    s0esc: 'At step {k} |z| first exceeds 2 and only grows from then on (the next step explains why it cannot return).',
    s0stay: 'The first {n} steps all stay inside the circle of radius 2.',
    s0hint: 'What to try: click the presets in turn and press "Walk it step by step" each time. c = 0 sits at the origin; c = −1 hops between 0 and −1; c = i takes two steps and then hops between −1 + i and −i; c = −0.5 + 0.5i spirals into a single point; c = 0.25 creeps ever more slowly towards 0.5; c = 0.3, only 0.05 further, leaves the circle at step 12; c = −0.1 + 0.65i wanders inside for 74 steps and escapes at step 75. That last one is the warning: a few dozen steps cannot tell you whether a c will escape.',

    s1k: 'Step 1 · Point of no return',
    s1t: 'Once the orbit leaves the circle of radius 2, can it ever come back?',
    s1e: 'This step asks: the last step treated "|z| > 2" as escape. Why is that justified? Suppose at some step |z| > 2 and |z| ≥ |c|. The triangle inequality gives |z² + c| ≥ |z|² − |c| ≥ |z|² − |z| = |z|·(|z| − 1). Since |z| − 1 > 1, the next distance is at least (|z| − 1) times this one, so it strictly grows; after growing the condition still holds, so every later step multiplies the distance by a number above 1 and the orbit never returns. The condition |z| ≥ |c| always holds the first time the orbit crosses 2: if |c| ≤ 2, then |z| > 2 ≥ |c|; if |c| > 2, the first step z₁ = c already crosses, with |z₁| = |c|. So <strong>the test only needs |zₙ| > 2</strong>; conversely, if the orbit stays inside forever (|zₙ| = 2 exactly still counts as inside), c belongs to the Mandelbrot set.',
    c1aria: 'Bar chart of |zₙ| against step n', c1title: 'Distance |zₙ| from the origin (squashed axis)',
    lgIn: '|zₙ| ≤ 2 (still inside)', lgOut: '|zₙ| > 2 (outside)', lgBound: 'Lower bound |z|·(|z| − 1) from the inequality',
    p1_slow: 'c = −0.1 + 0.65i (lingers)', p1_p03: 'c = 0.3', p1_edge: 'c = −2 (exactly on the line)', p1_far: 'c = 2.1 (|c| > 2)',
    s1readoutEsc: 'c = {c}, |c| = {cm}. First outside at step {k}: |z{k}| = {a}. The next |z| = {b}, {r} times larger, at least the factor |z| − 1 = {lb} the inequality promises; every later step grows the same way.',
    s1readoutStay: 'c = {c}, |c| = {cm}. Over the first {N} steps the largest |zₙ| is {mx}, never above 2. That only says "no escape in {N} steps", not "never".',
    s1hint: 'Reading the chart: the vertical axis is squashed as log₂(1 + |z|) but labelled with |z| itself; large values are squeezed, so 16 to 256 and 256 to 4096 take up about the same height. What to try: start with the default c = −0.1 + 0.65i. The blue bars bob below 2 for more than seventy steps; once a bar turns orange, each one after it is taller, and the hollow orange ring (the promised lower bound) always sits at or below the top of the bar. Then click "c = −2": the orbit 0, −2, 2, 2, … stays at distance exactly 2, which is not an escape. Click "c = 2.1": it is outside after the very first step.',

    s2k: 'Step 2 · Colour every c',
    s2t: 'Run every c in the plane. What shape do the survivors make?',
    s2e: 'This step asks: which c have orbits that never leave the circle? A computer can only run finitely many steps, so in practice you pick an <strong>iteration cap N</strong> and run each pixel\'s c up to step N. If |z| > 2 along the way, the pixel is coloured by the step at which it escaped (its <strong>escape time</strong>); if it survives all N steps it is painted black. Black therefore means "not yet shown to escape within N steps", which always contains the true Mandelbrot set; raising N removes wrongly-black points, so the black region can only shrink, never grow. The right panel records the black area as N changes, counted on the centres of a 300 × 300 grid (each grid point stands for a small patch of area). The whole set lies inside this frame (real part between −2 and 0.48, imaginary part within ±1.13), so the frame never cuts off any of its area.',
    c2aria: 'Escape-time picture of the Mandelbrot set', c2baria: 'Black area against the iteration cap N', c2title: 'One c per pixel: black = survived the first {N} steps',
    c2btitle: 'Black area (grid estimate)', c2bx: 'Iteration cap N (log scale)',
    lgInside: 'No escape within N steps', lgEsc: 'Escape time: early → late', lgArea: 'N values tried, with their area',
    nMax: 'Iteration cap N', play2: 'Raise N from 1 to 1000', clearHist: 'Clear history',
    s2progress: 'Tried {c}/{n} values of N. ',
    s2readout: 'N = {N}: black area ≈ {a} ({pct}% of the frame area {fa}).',
    s2hint: 'What to try: press "Raise N from 1 to 1000". At N = 1 the black region is the whole disc of radius 2 (partly cut off by the frame). Each increase of N peels away another layer from the outside; the area on the right keeps falling, is nearly flat beyond N = 100, and is about 1.51 at N = 1000. Finer grids and larger N give about 1.507 (checked in the tests with a 1200 × 1200 grid and N = 5000). The area settles down, but the detail along the border never stops growing: step 4 is about exactly that.',

    s3k: 'Step 3 · Inside the black',
    s3t: 'For a c inside the black region, where does the orbit settle?',
    s3e: 'This step asks: what does an orbit that stays inside look like in the long run? The left panel is still the plane of c, but the black interior is now coloured by the orbit\'s eventual <strong>period</strong>: period p means the orbit ends up cycling through p points (period 1 means it settles on a single fixed point). The right panel is the plane of z: the grey line is the first 60 steps, the coloured dots are the final cycle. The big cardioid is all period 1; the disc to its left is period 2, which you can check by hand: for c = −1, 0 → −1 → 0. Along the cardioid hangs a string of "bulbs"; inside the bulb labelled p/q the period is q. The white × on the right is a special fixed point α (one solution of z = z² + c). The q points of the cycle surround α, and each step jumps p places forward in angular order, i.e. turns about p/q of a full turn. The <strong>multiplier |λ|</strong> is the size of the product of 2z over the cycle points: how much a nearby point is pulled in per trip round the cycle. It must be below 1 for the cycle to attract.',
    c3aria: 'Parameter plane coloured by period', c3baria: 'Orbit and final cycle for the chosen c', c3title: 'Plane of c: interior coloured by eventual period',
    c3btitle: 'Plane of z: orbit and final cycle',
    lg3cycle: 'Final cycle (colour = period)', lg3tail: 'First 60 steps', lg3alpha: 'Fixed point α',
    bulb: '{pq} bulb',
    s3readout: 'c = {c}: the orbit ends up cycling through {p} points (period {p}), multiplier |λ| = {lam} (below 1, so nearby points are pulled into this cycle). {rot}',
    s3rot: 'Each step jumps {r} places forward around α, i.e. about {r}/{p} of a turn.',
    s3fixed: 'Period 1: the orbit settles on a fixed point.',
    s3esc: 'c = {c}: escapes at step {k}; not in the set.',
    s3none: 'c = {c}: after 4000 steps the orbit has not settled into a cycle of period ≤ 32. Such c usually hug the border and converge very slowly; no verdict here.',
    s3hint: 'What to try: press the centres of the 1/2, 1/3, 2/5, 1/4, 1/5 and 3/7 bulbs in turn. Count the coloured dots on the right (= q) and read "jumps p places" in the readout. In the 2/5 bulb the five points are not visited in order: the orbit skips every other one. Then drag c on the left: as long as you stay inside one bulb the period does not change; it changes only when you cross a boundary.',

    s4k: 'Step 4 · Zoom',
    s4t: 'Zoom in along the border. Does the detail ever run out?',
    s4e: 'This step asks: if you magnify a point near the border, does what you see get simpler? The slider is the exponent of the <strong>magnification</strong>: at 10^z the view is 3.2 × 10^−z wide. The zoom is centred on the small orange ring: it keeps its place on screen while everything else closes in on it. Deeper down, orbits need more steps before you can tell whether they escape, so the iteration cap N rises with the zoom (colours only show early versus late escape, repeating every 48 steps; they are not a new quantity. Black still means what it meant in step 2, "no escape within N steps", and the deeper you go the more likely some black pixels merely escape later than N). Two targets: "Seahorse valley" is a border point in the gap between the main cardioid and the period-2 disc; the "mini Mandelbrot" centre c ≈ −1.75488 is a period-3 point (0 returns to 0 after three steps), and zooming in reveals a small copy of the whole set. The computer uses double-precision numbers, which have a fixed spacing between neighbouring representable values. The readout compares the pixel spacing with that spacing: at 10⁹ the pixels are still more than ten thousand times coarser; another factor of ten thousand (around 10¹³) brings the two within a few dozen of each other, and the picture starts to break down for lack of precision.',
    c4aria: 'Zooming into the border of the Mandelbrot set', c4title: 'Target: {name} (orange ring = zoom centre)',
    zoomSlider: 'Magnification (power of 10)', play4: 'Zoom all the way to 10⁹',
    tg_seahorse: 'Seahorse valley', tg_minibrot: 'Mini Mandelbrot',
    s4readout: 'Magnified {mag}×: view width {w}, iteration cap N = {N}. Pixel spacing ≈ {px}; the spacing of doubles here ≈ {u}; the pixels are {k} times coarser, so the picture is still trustworthy. About {pin}% of the view survives N steps (black).',
    s4allin: ' The whole view is inside the set: the interior is flat; detail grows only on the border.',
    s4hint: 'What to try: choose "Mini Mandelbrot" and drag to about 10^1.5 to see a complete small copy of the set; keep going past 10^3 and the view falls inside the copy and turns completely black: the detail lives only on the border. Then choose "Seahorse valley" and press "Zoom all the way"; every factor of ten brings new tendrils and spirals, and at 10⁹ you are still looking at border. With reduced motion the button jumps straight to 10⁹.',

    s5k: 'Step 5 · Julia sets',
    s5t: 'Fix c and vary the starting point z₀. Which starting points never escape?',
    s5e: 'This step asks: so far each c was started only from z₀ = 0. What if we fix c and let every point of the plane take a turn as the starting point? The starting points that never escape form the <strong>filled Julia set</strong> of c (black on the right); its border is the <strong>Julia set</strong>. The Mandelbrot set is exactly the map that sorts Julia sets: it has been proved (Fatou and Julia, 1918–1919) that if the orbit of 0 stays bounded (c in the Mandelbrot set), the filled Julia set is all one piece; if the orbit of 0 escapes, it shatters into disconnected dust. This page illustrates that theorem; it does not prove it. Drag c on the left; the right panel is redrawn with the same rule z → z² + c, the same test |z| > 2, and an iteration cap of 200.',
    c5aria: 'Choosing c on the Mandelbrot set', c5baria: 'Filled Julia set for the chosen c', c5title: 'Plane of c (the Mandelbrot set): drag to choose c',
    c5btitle: 'Plane of z₀: filled Julia set for c = {c}',
    lgJin: 'Starting points z₀ that survive 200 steps', lgJesc: 'Escape time of a starting point: early → late',
    jl_basilica: 'c = −1', jl_rabbit: 'Rabbit c ≈ −0.1226 + 0.7449i', jl_dendrite: 'c = i', jl_dust: 'c = 0.3 + 0.6i',
    s5in: 'c = {c}: the orbit of 0 does not escape within 2000 steps, so c is (numerically) in the Mandelbrot set and the filled Julia set is all one piece.',
    s5out: 'c = {c}: the orbit of 0 escapes at step {k}, so c is outside the Mandelbrot set and the filled Julia set shatters into dust (only scattered late-escaping pixels remain).',
    s5hint: 'What to try: click c = −1 first: the black is a chain of connected bubbles. Then the "Rabbit" (centre of the period-3 bulb): every black blob has three "ears", matching the 3-point cycle of step 3. c = i is in the set but has no interior, so the black is too thin to see and only branches remain. Finally click c = 0.3 + 0.6i (outside the set): the black falls apart. Then drag slowly from the black region out across the border and watch the connected shape break up.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What did one rule answer?',
    s6fin: 'The whole page used one rule, z → z² + c, and one test, |z| > 2. <strong>Step 1</strong> proved the test is sound: past radius 2 there is no way back. <strong>Step 2</strong> coloured every c, and the black area settled at about 1.51 as the iteration cap grew. <strong>Step 3</strong> showed the black interior split into regions by period, with the cycle in a p/q bulb jumping p places around α each step. <strong>Step 4</strong> zoomed a billion times and the border detail never ran out. In <strong>step 5</strong> the same rule, asked a different way (fix c, vary the start), gave Julia sets, and the Mandelbrot set tells you whether each one is connected.',
    formula: 'c ∈ M  ⟺  z₀ = 0, zₙ₊₁ = zₙ² + c gives |zₙ| ≤ 2 for every n\n|z| > 2 and |z| ≥ |c|  ⟹  |z² + c| ≥ |z|·(|z| − 1) > |z|',
    boundary: 'Scope: every black pixel on this page is a numerical result, "no escape within finitely many steps", not a proof. Periods are detected after 4000 steps with a tolerance of 10⁻⁷; points hugging the border converge too slowly and are marked undecided. The area is a grid-count estimate, not an exact value. The connectedness dichotomy is a proved theorem that this page only illustrates.',
    linksTitle: 'Related pages',
    lk1: 'Complex numbers, step 4: multiplication multiplies lengths and adds angles (why z² doubles the angle) →',
    lk2: 'Newton\'s method, step 4: each starting point flows to the root of its basin, and the basin borders are fractals too →',
    lk3: 'Newton\'s method, step 1: feed each output back in as the next input; that is what "iterate" means →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "The Mandelbrot Set · Zoom Without End".',
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
  if (typeof window.refreshMandel === 'function') window.refreshMandel();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MANDEL_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
