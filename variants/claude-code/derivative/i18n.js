'use strict';
// Derivative lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '导数 · 把一段压成一刻',
    back: '← 知识索引',
    compare: '对照另一版本：导数 · 把平均压成此刻 →',
    navLabel: '导数步骤导航',
    tagline: '平均速度人人会算：路程除以时间。可「第 2 秒这一刻」的速度，用一段时间去除，答案总跟着你选的那一段变。七步里，你会把区间一点点压向一刻，看割线怎样转成切线，放大曲线看它怎样变直，再把每一点的斜率收集成一条新曲线。',
    nav0: '0 平均速度', nav1: '1 压缩区间', nav2: '2 放大看', nav3: '3 导函数', nav4: '4 导数说什么', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 问题从哪来',
    s0t: '第 2 秒这一刻，车有多快？平均速度答得了吗？',
    s0e: '这一步要回答：用「平均速度 = 路程 ÷ 时间」去问某一刻的速度，会得到什么？一辆车从起跑线出发，t 秒后离起跑线 s = t² 米（越开越快）。图中横轴是时间 t（秒），纵轴是离起跑线的距离 s（米）。在曲线上取 t₁、t₂ 两个时刻，连起来的直线叫<strong>割线</strong>；它的斜率 Δs ÷ Δt 就是这段时间的<strong>平均速度</strong>，也叫<strong>平均变化率</strong>（Δ 读作「改变量」，Δt = t₂ − t₁）。',
    t1Slider: '起点 t₁（秒）', t2Slider: '终点 t₂（秒）',
    c0: '距离 s（米）随时间 t（秒）：s = t²',
    lg0Curve: 's = t²', lg0Sec: '割线（斜率 = 平均速度）', lg0D: 'Δt 与 Δs', lg0Now: 't = 2 这一刻',
    s0readout: '[{a}, {b}] 秒：Δs = {sb} − {sa} = {ds} m，Δt = {dt} s，平均速度 = {ds} ÷ {dt} = {v} m/s。',
    s0same: 't₁ = t₂：Δt = 0，路程 ÷ 时间成了 0 ÷ 0，平均速度没有定义。这正是问题所在：一刻没有长度。',
    s0hist: '试过的区间（含 t = 2 的）：{list}。同样包含第 2 秒，答案却随区间变：平均速度说的是「这一段」，不是「这一刻」。',
    s0histNone: '还没试过包含 t = 2 的区间。',
    s0hint: '观察顺序：保持区间包住 t = 2（橙色竖线），先试 [1, 3]，再试 [2, 3]、[1, 2]、[1.9, 2.1]，看割线怎么转、平均速度怎么变。读数下方记下你试过的区间。',

    s1k: '第 1 步 · 压缩区间',
    s1t: '让第二个点贴近 t = 2，割线斜率会靠向哪个数？',
    s1e: '这一步要回答：把区间 [2, 2 + Δt] 越压越短，平均速度会不会停在某个数上？固定 P = (2, 4)，Q 在 t = 2 + Δt 处；Δt 可正可负（负数表示 Q 在 P 左边）。割线 PQ 的斜率是 (s(2 + Δt) − 4) ÷ Δt，展开后正好等于 4 + Δt。左图是曲线和割线；右图横轴是 Δt、纵轴是割线斜率，你试过的每个 Δt 都留一个点。Δt 不能取 0，但可以取得任意小：Δt 无限接近 0 时斜率无限接近的那个数，叫<strong>极限</strong>（<a class="xlink" href="../../../math/calculus/limits-epsilon/#step0">→ 极限页第 0 步：「越来越靠近」到底是什么意思</a>）。',
    dtSlider: 'Δt（秒）', dt1: 'Δt = 1', dt01: 'Δt = 0.1', dt001: 'Δt = 0.01', flip1: '换到 P 的另一侧', sweep1: '从 Δt = 1 自动压到 0.01',
    c1a: '割线 PQ（P 固定在 t = 2）', c1b: '割线斜率 · 横轴是 Δt',
    lg1Curve: 's = t²', lg1Sec: '割线 PQ', lg1Tan: '切线（Δt 足够小后点亮）', lg1Dots: '试过的 Δt 对应的斜率',
    s1readout: '{prog}Δt = {dt}：Q = ({tq}, {sq})，割线斜率 = ({sq} − 4) ÷ {dt} = {m} m/s，与 4 相差 {gap}。',
    s1zero: 'Δt = 0：P 和 Q 重合，两点定不出一条直线，斜率是 0 ÷ 0。把 Δt 拖离 0 一点点再看。',
    s1progress: '自动压缩 {c}/{N}。',
    s1concl: '两侧都靠向同一个数 4：这就是 s 在 t = 2 处的<strong>导数</strong>，记作 s′(2) = 4，单位 m/s，也就是那一刻的<strong>瞬时速度</strong>（瞬时变化率）。割线的极限位置叫<strong>切线</strong>，斜率正好是 4。',
    s1hint: '观察顺序：按 Δt = 1、0.1、0.01，看割线绕着 P 转、斜率 5 → 4.1 → 4.01；再按「换到另一侧」，从左边逼近：3 → 3.9 → 3.99。右图的点都落在一条斜线上，左右两边往同一个空心圈（Δt = 0 处）挤。',

    s2k: '第 2 步 · 放大看',
    s2t: '为什么切线叫「贴着」曲线？放大 P 附近看看。',
    s2e: '这一步要回答：切线和曲线到底有多贴？把 P = (2, 4) 附近放大：窗口横向宽 2w 秒、纵向高 10w 米（w = 2 ÷ 放大倍数），窗口形状不变，只是越看越近。在这个窗口里，曲线 s = t² 和切线 s = 4 + 4(t − 2) 的最大竖直差距正好是 w²（因为两者之差是 (t − 2)²）。窗口高度按 w 缩小，差距按 w² 缩小，所以越放大，曲线在窗口里越像那条切线。',
    zoomSlider: '放大倍数',
    c2: '放大 {z} 倍：t ∈ [{lo}, {hi}] 秒',
    lg2Curve: 's = t²', lg2Tan: '切线：s = 4 + 4(t − 2)', lg2Gap: '曲线与切线的最大差距',
    s2readout: '放大 {z} 倍：窗口宽 {wd} s、高 {ht} m；曲线与切线最大相差 {gap} m，只占窗口高度的 {pct}%。',
    s2hint: '观察顺序：从 1 倍开始一档档加大，盯住窗口两端曲线和切线之间的粉色竖线：它相对窗口越来越短，到 100 倍时已经看不出弯。这就是「导数 = 放大后曲线看起来那条直线的斜率」。',

    s3k: '第 3 步 · 每一点都有导数',
    s3t: '换一个点，导数还是 4 吗？把每一点的斜率收集起来是什么？',
    s3e: '这一步要回答：沿着曲线逐点量斜率，这些斜率本身排成什么？下面改用数学里的字母：横轴 x、纵轴 y，曲线 y = x²（或 y = x³）。每一点的斜率用很小的 Δx = 0.001 去「测」：(f(x + 0.001) − f(x)) ÷ 0.001，这是近似值，所以读数写 ≈。上图是曲线和该点的切线；下图横轴还是 x，纵轴是测到的斜率，每测一个点留一个点。把每个 x 对应的导数收集成一个新函数，叫<strong>导函数</strong>，记作 f′(x)。',
    xSlider: '位置 x', fnSq: 'y = x²', fnCube: 'y = x³', sweep3: '从 x = −2 扫到 2', rule3: '叠上规则曲线',
    c3a: '{fn} 与 x 处的切线', c3b: '测到的斜率 · 横轴是 x',
    lg3Curve: '曲线', lg3Tan: '切线', lg3Dots: '测到的斜率', lg3Rule: '规则曲线（按下按钮后出现）',
    s3readout: '{prog}x = {x}：测得斜率 ≈ {m}（Δx = 0.001），规则 {rule} 给出 {r}，两者相差 {d}。{sign}',
    s3progress: '已扫 {c}/{N} 个点。',
    pos: '斜率为正：这里曲线在上升。', neg: '斜率为负：这里曲线在下降。', zero: '斜率为 0：切线是水平的。',
    s3hint: '观察顺序：先按「扫一遍」，看下图的点排成一条直线（y = x²）；再按「叠上规则曲线」，对照 2x。换成 y = x³ 再扫：点排成开口向上的抛物线，规则是 3x²。注意 x³ 在 x = 0 处斜率为 0，但曲线并没有掉头。',
    ruleSq: '2x', ruleCube: '3x²',

    s4k: '第 4 步 · 导数说什么',
    s4t: '导数的正负和大小，翻回实景是什么意思？',
    s4e: '这一步要回答：导数的符号和大小在真实问题里对应什么？回到<a class="xlink" href="../../../math/algebra/parabola/#step0">抛物线页</a>那种投篮：t 秒后球离地 h(t) = 2 + 7t − 4.9t² 米（模拟，不计空气阻力）。上图横轴 t（秒）、纵轴高度（米），画出 t 时刻的切线；下图纵轴是导数 h′(t)，单位 m/s，它就是球竖直方向的瞬时速度：用前三步的办法逐点测斜率，得到 h′(t) = 7 − 9.8t。',
    t4Slider: '时刻 t（秒）', top4: '跳到导数为 0 的时刻',
    c4a: '高度 h（米）随时间 t（秒）', c4b: '导数 h′(t)（m/s）：竖直速度',
    lg4Up: '上升段（h′ > 0）', lg4Down: '下降段（h′ < 0）', lg4Tan: 't 时刻的切线', lg4Now: '当前时刻',
    s4readout: 't = {t} s：离地 {h} m，h′(t) = {v} m/s。{meaning}',
    s4up: '导数为正：球正在上升，这一刻每秒约升 {a} m；|h′| 越大，曲线越陡。',
    s4down: '导数为负：球正在下降，这一刻每秒约降 {a} m；|h′| 越大，曲线越陡。',
    s4top: '导数为 0：切线水平，球在最高点 {h} m，上升刚好转为下降（t = {tt} s）。',
    s4hint: '观察顺序：从 t = 0 慢慢拖到 1.6，同时看两张图：上图切线由陡变平再变陡（朝下），下图的点沿直线从 7 降到负数；穿过 0 的那一刻，正好是上图的最高点。',

    s5k: '第 5 步 · 自测',
    s5t: '不看提示，能用导数回答问题吗？',
    s5e: '这一步要回答：用割线逼近、测斜率、读符号这三件工具，能不能自己求出导数并说清它是什么？三题分别对应第 1、3、2 步。',
    q1Prompt: '① 曲线 y = x² 在 x = 3 处，割线斜率随 Δx 变化如下：{table}。x = 3 处的导数是多少？',
    q1A: '7', q1B: '6.01', q1C: '6',
    q2Prompt: '② y = x³ 在 x = 1 处的导数是多少？可以回到第 3 步，选 y = x³、把 x 拖到 1 测一测。',
    q2A: '1', q2B: '2', q2C: '3', q2D: '4',
    q3Prompt: '③ 「导数就是切线本身。」这句话对吗？',
    q3A: '对', q3B: '不对：导数是一个数，是切线的斜率',
    check: '检查', pick: '先选一个答案。', sep: '；',
    q1ok: '对。斜率 = 6 + Δx：Δx 越小越靠近 6，但任何正的 Δx 都给出比 6 大的数；导数是它们靠向的那个数 6，不是表里任何一个。',
    q1no: '再看：7、6.1、6.01 是三条割线的斜率，每条都还差一个 Δx。导数是 Δx 无限靠近 0 时斜率无限靠近的那个数。',
    q2ok: '对。在 x = 1 处测得 ≈ {m}（Δx = 0.001），规则 3x² 给出 3。',
    q2no: '回第 3 步试一试：选 y = x³，x = 1 时测得 ≈ {m}，不是这个选项。',
    q3ok: '对。切线是一条直线，导数是它的斜率，一个带单位的数（比如 4 m/s）。',
    q3no: '再想想：切线是直线，导数是这条直线的斜率，是一个数。说「导数是 4」，不会说「导数是一条线」。',

    s6k: '第 6 步 · 收束', s6t: '导数：把一段的平均压成一刻的变化率',
    s6fin: '<strong>第 0 步</strong>：平均速度是割线的斜率，答的是「一段」，随区间变。<strong>第 1 步</strong>：把区间从两侧压向一点，割线斜率靠向同一个数，这个极限就是导数，割线的极限位置是切线。<strong>第 2 步</strong>：放大看，曲线越来越像切线，误差比窗口缩得更快。<strong>第 3 步</strong>：每一点都有自己的导数，收集起来就是导函数：x² 的是 2x，x³ 的是 3x²。<strong>第 4 步</strong>：导数为正在上升、为负在下降、为 0 时切线水平；它的大小是变化有多快。',
    formula: 'f′(x) = lim (f(x + Δx) − f(x)) / Δx　（Δx → 0）\n(x²)′ = 2x　(x³)′ = 3x²',
    boundary: '适用范围：本页的函数都是光滑曲线，两侧逼近得到同一个数。曲线有尖角（例如 y = |x| 在 x = 0 处）时，左右两侧靠向不同的数，那一点没有导数。第 3 步的读数是 Δx = 0.001 的近似测量，精确值来自规则 2x、3x²；规则本页只验证、没有证明。第 4 步的投篮是不计空气阻力的模拟。把导数反过来，从变化率累加回总量，就是定积分。',
    linksTitle: '接着去哪',
    lk1: '→ 速度与 v-t 图第 1 步：画出每一刻的速度',
    lk2: '→ 极限与 ε–δ 第 0 步：「无限靠近」的严格说法',
    lk3: '→ 牛顿法第 0 步：用切线代替曲线去找根',
    lk4: '→ 定积分第 1 步：切条求和，把变化率加回总量',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《导数 · 把平均压成此刻》的平行版本。'
  },
  en: {
    pageTitle: 'The Derivative · Squeezing a Stretch into an Instant',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Derivative · Squeezing the Average into the Instant →',
    navLabel: 'Derivative steps',
    tagline: 'Average speed is easy: distance divided by time. But ask how fast something is going at exactly the 2-second mark, and any stretch of time you divide by changes the answer. In seven steps you will squeeze the interval down to an instant, watch a secant swing into a tangent, zoom in until the curve goes straight, and collect the slope at every point into a new curve.',
    nav0: '0 Average speed', nav1: '1 Squeeze', nav2: '2 Zoom in', nav3: '3 Derivative function', nav4: '4 What it says', nav5: '5 Quiz', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Where the question comes from',
    s0t: 'How fast is the car at exactly t = 2? Can average speed tell you?',
    s0e: 'The question: what do you get if you use “average speed = distance ÷ time” to ask about a single instant? A car leaves the start line and after t seconds it is s = t² metres away (it keeps speeding up). Across is time t (seconds), up is the distance s from the start line (metres). Pick two moments t₁ and t₂ on the curve; the straight line joining them is a <strong>secant</strong>. Its slope Δs ÷ Δt is the <strong>average speed</strong> over that stretch, also called the <strong>average rate of change</strong> (Δ means “change in”, so Δt = t₂ − t₁).',
    t1Slider: 'Start t₁ (s)', t2Slider: 'End t₂ (s)',
    c0: 'Distance s (m) against time t (s): s = t²',
    lg0Curve: 's = t²', lg0Sec: 'Secant (slope = average speed)', lg0D: 'Δt and Δs', lg0Now: 'The instant t = 2',
    s0readout: '[{a}, {b}] s: Δs = {sb} − {sa} = {ds} m, Δt = {dt} s, average speed = {ds} ÷ {dt} = {v} m/s.',
    s0same: 't₁ = t₂: Δt = 0, so distance ÷ time becomes 0 ÷ 0 and the average speed is undefined. That is exactly the problem: an instant has no length.',
    s0hist: 'Intervals you tried that contain t = 2: {list}. All of them include the 2-second mark, yet the answer moves with the interval. Average speed describes a stretch, not an instant.',
    s0histNone: 'No interval containing t = 2 tried yet.',
    s0hint: 'What to try: keep the interval around t = 2 (the orange line). Try [1, 3], then [2, 3], [1, 2] and [1.9, 2.1], and watch how the secant tilts and the average changes. The intervals you try are listed under the readout.',

    s1k: 'Step 1 · Squeeze the interval',
    s1t: 'Slide the second point towards t = 2. What number does the secant’s slope head for?',
    s1e: 'The question: if you make the interval [2, 2 + Δt] shorter and shorter, does the average speed settle on a number? Fix P = (2, 4) and put Q at t = 2 + Δt; Δt can be positive or negative (negative puts Q to the left of P). The secant PQ has slope (s(2 + Δt) − 4) ÷ Δt, which works out to exactly 4 + Δt. The left plot shows the curve and the secant; in the right plot, across is Δt and up is the secant’s slope, with a dot for every Δt you try. Δt cannot be 0, but it can be as small as you like. The number the slope gets arbitrarily close to as Δt gets arbitrarily close to 0 is called the <strong>limit</strong> (<a class="xlink" href="../../../math/calculus/limits-epsilon/#step0">→ Limits, step 0: what “getting closer and closer” really means</a>).',
    dtSlider: 'Δt (s)', dt1: 'Δt = 1', dt01: 'Δt = 0.1', dt001: 'Δt = 0.01', flip1: 'Switch to the other side of P', sweep1: 'Squeeze from Δt = 1 to 0.01',
    c1a: 'Secant PQ (P fixed at t = 2)', c1b: 'Secant slope · across: Δt',
    lg1Curve: 's = t²', lg1Sec: 'Secant PQ', lg1Tan: 'Tangent (appears once Δt is small)', lg1Dots: 'Slope for each Δt tried',
    s1readout: '{prog}Δt = {dt}: Q = ({tq}, {sq}), secant slope = ({sq} − 4) ÷ {dt} = {m} m/s, {gap} away from 4.',
    s1zero: 'Δt = 0: P and Q coincide, two equal points do not pin down a line, and the slope is 0 ÷ 0. Move Δt a little away from 0.',
    s1progress: 'Squeezing {c}/{N}. ',
    s1concl: 'Both sides head for the same number, 4. That is the <strong>derivative</strong> of s at t = 2, written s′(2) = 4, in m/s: the <strong>instantaneous speed</strong> (instantaneous rate of change) at that moment. The line the secant settles into is the <strong>tangent</strong>, and its slope is exactly 4.',
    s1hint: 'What to try: press Δt = 1, 0.1, 0.01 and watch the secant pivot about P while the slope goes 5 → 4.1 → 4.01. Then switch sides and close in from the left: 3 → 3.9 → 3.99. In the right plot the dots all sit on one sloping line and squeeze towards the same hollow circle at Δt = 0 from both sides.',

    s2k: 'Step 2 · Zoom in',
    s2t: 'Why is a tangent said to “hug” the curve? Zoom in around P.',
    s2e: 'The question: how closely does the tangent follow the curve? Zoom in around P = (2, 4). The window is 2w seconds wide and 10w metres tall (w = 2 ÷ zoom), so it keeps its shape and simply moves closer. Inside it, the largest vertical gap between the curve s = t² and the tangent s = 4 + 4(t − 2) is exactly w², because the two differ by (t − 2)². The window shrinks like w but the gap shrinks like w², so the further you zoom, the more the curve looks like that tangent line.',
    zoomSlider: 'Zoom',
    c2: 'Zoom ×{z}: t ∈ [{lo}, {hi}] s',
    lg2Curve: 's = t²', lg2Tan: 'Tangent: s = 4 + 4(t − 2)', lg2Gap: 'Largest gap between curve and tangent',
    s2readout: 'Zoom ×{z}: the window is {wd} s wide and {ht} m tall; curve and tangent are at most {gap} m apart, only {pct}% of the window height.',
    s2hint: 'What to try: start at ×1 and step up, keeping an eye on the pink bars at the window edges between the curve and the tangent. Relative to the window they keep shrinking, and by ×100 the bend is gone. That is the derivative seen another way: the slope of the line the curve turns into when you zoom in.',

    s3k: 'Step 3 · Every point has a derivative',
    s3t: 'Move to another point: is the derivative still 4? What do the slopes make when you collect them?',
    s3e: 'The question: if you measure the slope point by point along the curve, what do those slopes form? From here on we use the usual letters: across is x, up is y, and the curve is y = x² (or y = x³). Each slope is “measured” with a small Δx = 0.001: (f(x + 0.001) − f(x)) ÷ 0.001. That is an approximation, so the readout uses ≈. The top plot shows the curve and the tangent at x; in the bottom plot, across is still x and up is the measured slope, one dot per point measured. Collect the derivative at every x into a new function and you get the <strong>derivative function</strong>, written f′(x).',
    xSlider: 'Position x', fnSq: 'y = x²', fnCube: 'y = x³', sweep3: 'Sweep x from −2 to 2', rule3: 'Overlay the rule',
    c3a: '{fn} and its tangent at x', c3b: 'Measured slope · across: x',
    lg3Curve: 'Curve', lg3Tan: 'Tangent', lg3Dots: 'Measured slopes', lg3Rule: 'Rule curve (after you press the button)',
    s3readout: '{prog}x = {x}: measured slope ≈ {m} (Δx = 0.001); the rule {rule} gives {r}, a difference of {d}. {sign}',
    s3progress: '{c}/{N} points swept. ',
    pos: 'Positive slope: the curve is rising here.', neg: 'Negative slope: the curve is falling here.', zero: 'Zero slope: the tangent is flat.',
    s3hint: 'What to try: press the sweep and watch the bottom dots line up along a straight line (for y = x²); then overlay the rule and compare with 2x. Switch to y = x³ and sweep again: the dots trace an upward parabola, and the rule is 3x². Note that x³ has slope 0 at x = 0 even though the curve does not turn back there.',
    ruleSq: '2x', ruleCube: '3x²',

    s4k: 'Step 4 · What a derivative says',
    s4t: 'What do the sign and size of a derivative mean back in the real situation?',
    s4e: 'The question: what do the sign and size of a derivative correspond to in a real problem? Go back to a shot like the one in the <a class="xlink" href="../../../math/algebra/parabola/#step0">parabola lesson</a>: after t seconds the ball is h(t) = 2 + 7t − 4.9t² metres up (a simulation, no air resistance). In the top plot, across is t (seconds) and up is height (metres), with the tangent at time t. The bottom plot shows the derivative h′(t) in m/s, which is the ball’s upward speed at that instant. Measuring slopes point by point as in the first three steps gives h′(t) = 7 − 9.8t.',
    t4Slider: 'Time t (s)', top4: 'Jump to where the derivative is 0',
    c4a: 'Height h (m) against time t (s)', c4b: 'Derivative h′(t) (m/s): upward speed',
    lg4Up: 'Rising (h′ > 0)', lg4Down: 'Falling (h′ < 0)', lg4Tan: 'Tangent at time t', lg4Now: 'Current time',
    s4readout: 't = {t} s: {h} m up, h′(t) = {v} m/s. {meaning}',
    s4up: 'Positive derivative: the ball is rising, at this instant by about {a} m per second; the bigger |h′|, the steeper the curve.',
    s4down: 'Negative derivative: the ball is falling, at this instant by about {a} m per second; the bigger |h′|, the steeper the curve.',
    s4top: 'Zero derivative: the tangent is flat and the ball is at its peak, {h} m, where rising turns into falling (t = {tt} s).',
    s4hint: 'What to try: drag t slowly from 0 to 1.6 and watch both plots. On top the tangent goes from steep to flat to steep downward; below, the dot slides along a straight line from 7 down into negative values. The moment it crosses 0 is exactly the top of the arc.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Without the hints, can you answer with derivatives?',
    s5e: 'The question: with three tools — closing in with secants, measuring slopes, reading signs — can you find a derivative yourself and say what it is? The questions go back to steps 1, 3 and 2.',
    q1Prompt: '① For y = x² at x = 3, the secant slopes for shrinking Δx are: {table}. What is the derivative at x = 3?',
    q1A: '7', q1B: '6.01', q1C: '6',
    q2Prompt: '② What is the derivative of y = x³ at x = 1? You can go back to step 3, pick y = x³ and drag x to 1 to measure it.',
    q2A: '1', q2B: '2', q2C: '3', q2D: '4',
    q3Prompt: '③ “The derivative is the tangent line.” True?',
    q3A: 'True', q3B: 'False: the derivative is a number, the tangent’s slope',
    check: 'Check', pick: 'Pick an answer first.', sep: '; ',
    q1ok: 'Right. The slope is 6 + Δx: the smaller Δx, the closer to 6, but every positive Δx gives more than 6. The derivative is the number they head for, 6, not any entry in the list.',
    q1no: 'Look again: 7, 6.1 and 6.01 are slopes of three secants, each still off by Δx. The derivative is the number the slope gets arbitrarily close to as Δx gets arbitrarily close to 0.',
    q2ok: 'Right. At x = 1 the measured slope is ≈ {m} (Δx = 0.001), and the rule 3x² gives 3.',
    q2no: 'Try it in step 3: with y = x³ at x = 1 the measured slope is ≈ {m}, which is not this option.',
    q3ok: 'Right. The tangent is a line; the derivative is its slope, a number with units (such as 4 m/s).',
    q3no: 'Think again: the tangent is a line and the derivative is that line’s slope, a number. You say “the derivative is 4”, never “the derivative is a line”.',

    s6k: 'Step 6 · Wrap-up', s6t: 'The derivative: an average over a stretch, squeezed into a rate at an instant',
    s6fin: '<strong>Step 0</strong>: average speed is the slope of a secant; it describes a stretch and changes with the interval. <strong>Step 1</strong>: squeeze the interval from both sides and the secant slope heads for one number; that limit is the derivative, and the secant’s limiting position is the tangent. <strong>Step 2</strong>: zoom in and the curve looks more and more like its tangent, with the gap shrinking faster than the window. <strong>Step 3</strong>: every point has its own derivative, and together they form the derivative function: 2x for x², 3x² for x³. <strong>Step 4</strong>: a positive derivative means rising, negative means falling, zero means a flat tangent; its size says how fast.',
    formula: 'f′(x) = lim (f(x + Δx) − f(x)) / Δx   (Δx → 0)\n(x²)′ = 2x   (x³)′ = 3x²',
    boundary: 'Scope: every function here is a smooth curve, so closing in from either side gives the same number. Where a curve has a corner (y = |x| at x = 0, say), the two sides head for different numbers and there is no derivative. The step-3 readout is an approximate measurement with Δx = 0.001; the exact values come from the rules 2x and 3x², which this page checks but does not prove. The step-4 shot is a simulation without air resistance. Run the derivative backwards, adding rates of change back up into a total, and you get the definite integral.',
    linksTitle: 'Where to go next',
    lk1: '→ Speed and the v–t graph, step 1: draw the speed at every instant',
    lk2: '→ Limits and ε–δ, step 0: the precise version of “arbitrarily close”',
    lk3: '→ Newton’s method, step 0: swap the curve for its tangent to find a root',
    lk4: '→ The definite integral, step 1: add up strips to turn rates back into totals',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Derivative · Squeezing the Average into the Instant”.'
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
