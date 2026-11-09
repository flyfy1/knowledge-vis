'use strict';
// Linear functions lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '一次函数 · 每步抬多高，从多高出发',
    back: '← 知识索引',
    compare: '对照另一版本：一次函数 · 斜率是陡缓，截距是起点 →',
    navLabel: '一次函数步骤导航',
    tagline: '一样东西每过一步就变化同样多，把它画出来就是一条直线。这一页先看点怎样排成直线，再把「每步变多少」和「从多高出发」各用一个数说清楚，拼成 y = kx + b；然后用两个点反求出方程，最后让两条直线相遇，看交点、平行和重合。',
    nav0: '0 等量变化', nav1: '1 斜率', nav2: '2 截距', nav3: '3 写成式子', nav4: '4 两点定线', nav5: '5 两线相遇', nav6: '6 自测与收束',

    s0k: '第 0 步 · 每小时变一样多',
    s0t: '每小时变化一样多，记下来的点排成什么样？',
    s0e: '这一步要回答：<strong>一间温室 0 点时是 2 °C，之后每小时温度变化同样的 k °C。把每个整点的温度画成点，这些点排成什么形状？</strong>图里横轴 x 是过了几小时（0 到 6），纵轴 y 是温度（°C）；每个点 (x, y) 表示「第 x 小时，温度是 y」（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ 坐标页第 2 步：(x, y) 是点的地址</a>）。从一个点到下一个点，先向右 1 格（灰色：过了 1 小时），再竖直走 k 格（橙色：温度变了 k °C，k 为负就往下）。每一步都是同样的「右 1、上 k」，所以点排在一条<strong>直线</strong>上。对照：切到「变化越来越大」，每小时的变化量不再相同，点就弯成一条曲线（<a class="xlink" href="../../../math/algebra/parabola/#step1">→ 抛物线页第 1 步：弯曲的图像 y = ax²</a>）。',
    modeEq: '每小时变化一样', modeGrow: '变化越来越大（对照）',
    s0lgPt: '整点记下的温度', s0lgRun: '水平：x 的变化', s0lgRise: '竖直：y 的变化', s0lgLine: '把点连起来（虚线）',
    kSlider0: '每小时变化 k（°C）', record: '一小时一小时记录',
    c0title: '温度 y（°C）　横轴：过了 x 小时',
    r0eq: '读数：{list}。每小时变化：{diffs}——全都一样，点在同一条直线上。',
    r0grow: '读数：{list}。每小时变化：{diffs}——一次比一次大，相邻两段倾斜得不一样，点连起来是弯的。',
    r0flat: '读数：{list}。每小时变化都是 0：温度不变，点排成一条水平的直线。',
    r0prog: '已记录 {n}/7 个整点：{list}。',
    s0hint: '观察顺序：先按「一小时一小时记录」，看点一个个出现，每个新点前面都有一段灰色（右 1）和一段橙色（上 k）。再拖 k：k 越大，橙色段越长，线越陡；k 为负，线往下走；k = 0 是水平线。最后切到「变化越来越大」：橙色段一段比一段长，点不再在一条直线上。',

    s1k: '第 1 步 · 斜率',
    s1t: '线有多陡，能用一个数说清楚吗？',
    s1e: '这一步要回答：<strong>在一条直线上随便取两个点，「竖直变化 ÷ 水平变化」会不会随取的点而变？</strong>这里的直线每向右 1 格就上升 k 格（k 用滑杆调，k 为负就是下降），并且经过 (0, 1)。在线上取 A、B 两点：从 A 到 B，横坐标变了多少叫<strong>水平变化</strong>（灰色），纵坐标变了多少叫<strong>竖直变化</strong>（橙色，往下记为负）。两者相除得到的数，就叫这条直线的<strong>斜率</strong>：每向右走 1，上升多少。斜率的绝对值越大，线越陡；斜率为负，线从左往右下降；斜率为 0，线是水平的。',
    s1lgLine: '直线（每向右 1 上升 k）', s1lgOld: '之前取过的两点（同一条线上）',
    kSlider: '斜率 k', xA: '点 A 的横坐标', xB: '点 B 的横坐标',
    c1title: 'A → B：水平 {run}，竖直 {rise}',
    c1same: 'A = B：水平变化是 0，没法相除',
    r1: 'A({xA}, {yA}) → B({xB}, {yB})：竖直变化 {rise} ÷ 水平变化 {run} = {ratio}。',
    r1count: '已试过 {n} 对不同的点，比值全部是 {k}——不论 A、B 取在哪里，比值都等于每向右 1 格上升的量：这就是斜率。',
    r1same: 'A 和 B 取到同一个点了：水平变化是 0，不能相除。把其中一个挪开。',
    s1hint: '观察顺序：k 先不动，拖 A 或 B 换几对点：灰色和橙色的长度一起变，读数里的比值却不变；取过的三角形会淡淡地留在图上——大小不同，形状相同。再改 k：所有比值一起变成新的 k，旧三角形清空。',

    s2k: '第 2 步 · 截距',
    s2t: '陡度一样，从不同高度出发会怎样？',
    s2e: '这一步要回答：<strong>斜率不变，只改「出发时的高度」，整条线怎么动？</strong>还是这样的直线：每向右 1 格上升 k（k 是斜率）。现在多一个数 b：直线在 x = 0 处的高度，也就是它穿过纵轴（y 轴）的点 (0, b)。这个数叫<strong>截距</strong>（准确说是纵截距）：还没出发（x = 0）时站在多高。改 b，线上每个点都上下移动同样的距离，所以整条线平移，陡度不变。',
    s2lgNow: '当前直线', s2lgOld: '之前的位置', s2lgB: '与纵轴的交点 (0, b)', s2lgShift: '各点移动的距离（一样长）',
    bSlider: '截距 b',
    c2title: '与纵轴交于 (0, {b})　斜率 {k}',
    r2first: '直线穿过纵轴的点是 (0, {b})，斜率是 {k}。拖 b，看整条线怎么动。',
    r2: '直线穿过纵轴的点是 (0, {b})。和上一个位置比，b 变了 {db}，x = −4、0、4 三处的点都移动了 {db}，斜率 {k} 不变：整条线平移。',
    r2rot: '改了斜率：直线绕着 (0, {b}) 转到斜率 {k}，b 不变。旧位置已清空。',
    s2hint: '观察顺序：先只拖 b：旧位置淡淡地留在图上，三条橙色竖线是 x = −4、0、4 三处的点各移动的距离——一样长，所以是平移。再拖 k：线绕着 (0, b) 这一点转动，b 不变，旧位置清空。',

    s3k: '第 3 步 · 写成式子',
    s3t: '不画图，怎么算出任意一个 x 对应的 y？',
    s3e: '这一步要回答：<strong>知道斜率 k 和截距 b，能不能直接算出 x = −3 时线上那一点的高度？</strong>从 (0, b) 出发，向右走 x 格（x 为负就向左），每走 1 格上升 k（k 是斜率），一共上升 k × x，所以高度 y = kx + b。这就是这条直线的<strong>方程</strong>，b 是截距。像这样每给定一个 x、就恰好算出一个 y 的对应关系叫<strong>函数</strong>；k ≠ 0 时 y = kx + b 叫<strong>一次函数</strong>，因为 x 的最高次数是 1（没有 x² 这样的项）。k = 0 时 y = b 是水平线，叫常数函数。书写习惯：k = 1 写成 x，k = −1 写成 −x，b = 0 时省掉，b 为负写成「− 数」。',
    s3lgLine: '直线 y = kx + b', s3lgProbe: '探针点 (x, y)', s3lgVert: '竖线 x = 探针值：和直线只碰一次', s3lgHist: '算过的点',
    xProbe: '探针 x',
    r3: '代入：y = {k} × {x} + {b} = {kx} + {b} = {y}。点 ({px}, {y}) 正好在直线上。',
    r3off: '这一点超出了图的显示范围（橙色箭头指向它）。',
    r3count: '已算过 {n} 个点，全在这条线上。',
    s3hint: '观察顺序：拖「探针 x」，看读数里逐项代入的算式，图上橙点沿直线走；灰点是算过的点，它们排在同一条线上。竖直虚线（x 固定）只和直线碰一次：一个 x 只对应一个 y，这就是「函数」的意思。改 k 或 b 时，上面的方程跟着改写，灰点清空。',

    s4k: '第 4 步 · 两点定一条线',
    s4t: '只知道线上两个点，能找回 k 和 b 吗？',
    s4e: '这一步要回答：<strong>已知直线经过 P、Q 两点，它的方程 y = kx + b 是什么？</strong>先求斜率（每向右 1 上升多少）：k = 竖直变化 ÷ 水平变化 = (Q 的纵坐标 − P 的纵坐标) ÷ (Q 的横坐标 − P 的横坐标)。再求截距（x = 0 时的 y）：直线经过 P，所以 P 的纵坐标 = k × P 的横坐标 + b，移项得 b = P 的纵坐标 − k × P 的横坐标。结果常常是分数，所以 k 和 b 不一定是整数。两点横坐标相同时，线是竖直的：一个 x 对着无数个 y，它不是函数，不能写成 y = kx + b，只能写成 x = 常数。',
    px: 'P 的横坐标', py: 'P 的纵坐标', qx: 'Q 的横坐标', qy: 'Q 的纵坐标',
    s4lgPts: '已知的两点 P、Q',
    c4title: 'P({x1}, {y1})　Q({x2}, {y2})',
    r4: '斜率 k = ({y2} − {y1}) ÷ ({x2} − {x1}) = {dy} ÷ {dx} = {k}；截距 b = {y1} − {kp} × {x1} = {b}。验算：把 Q 代进去，{kp} × {x2} + {bp} = {y2v}。',
    r4vert: 'P、Q 的横坐标都是 {x}：线是竖直的，水平变化为 0，斜率不存在。它的方程是 x = {x}，不是一次函数。',
    r4same: 'P 和 Q 重合了：过一个点的直线有无数条，定不下来。把它们挪开。',
    s4hint: '观察顺序：先只拖 Q 的纵坐标：只有竖直变化在变，k 和 b 跟着变。再把 Q 的横坐标拖到和 P 一样：线变成竖直，方程变成 x = 常数。最后把 P 放到 (0, 1)、Q 放到 (2, 5)，读出 k = 2、b = 1。',

    s5k: '第 5 步 · 两条线相遇',
    s5t: '两条线在哪里相遇？会不会永远碰不上？',
    s5e: '这一步要回答：<strong>直线 ① y = 0.5x + 2 和直线 ② y = k₂x + b₂ 在哪一点相交？</strong>交点同时在两条线上，所以它的坐标同时满足两个方程（<a class="xlink" href="../../../math/algebra/simultaneous-equations/#step1">→ 方程组页第 1 步：哪个点同时满足两个方程</a>）。下图把每个整数 x 处两条线的<strong>高度差</strong>（① 的 y 减 ② 的 y）画成柱子。高度差也是均匀变化的：每向右 1 格变化 0.5 − k₂，也就是两条线斜率之差。柱子降到 0 的地方就是交点，x = (b₂ − 2) ÷ (0.5 − k₂)。斜率相等时高度差处处一样：截距也相等就是同一条线（重合）；截距不等就永远差这么多（平行，不相交）。',
    k2Slider: '直线 ② 的斜率 k₂', b2Slider: '直线 ② 的截距 b₂',
    s5lg1: '直线 ① y = 0.5x + 2', s5lg2: '直线 ②', s5lgGapPos: '高度差 > 0（① 在上）', s5lgGapNeg: '高度差 < 0（② 在上）',
    c5top: '两条直线：①　{eq1}　②　{eq2}', c5bot: '高度差 = ① 的 y − ② 的 y（每个整数 x 一根柱）',
    r5one: '交点 ({x}, {y})。代入 ①：0.5 × {xp} + 2 = {y}；代入 ②：{k2} × {xp} + {b2p} = {y}。高度差每向右 1 格变化 {step}，在 x = {x} 处降到 0。',
    r5off: '（交点不在图中显示的范围里，以读数为准。）',
    r5par: '两条线的斜率都是 0.5，高度差处处都是 {gap}，永远到不了 0：平行，不相交，两个方程没有公共解。',
    r5same: '两条线斜率都是 0.5、截距都是 2：是同一条线（重合），处处高度差为 0，公共点有无数个。',
    s5hint: '观察顺序：先拖 k₂，看下图：柱子的顶端连成一条斜线，斜率差越大越倾斜；柱子穿过 0 的位置在移动，上图的交点跟着移动。把 k₂ 拖到 0.5：柱子一样高，再也到不了 0——两线平行。这时把 b₂ 拖到 2，柱子全部消失：两条线重合。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三道题：读图、算值、找交点',
    s6e: '每题先自己想，再选答案、按「检查」。',
    qz1p: '① 下图这条直线的方程是哪一个？',
    qz2p: '② 出租车起步价 8 元，之后每公里再加 2 元（这里不扣除起步里程）。坐 5 公里要多少元？',
    qz3p: '③ 流量套餐 A：月费 10 元，每 GB 3 元；套餐 B：没有月费，每 GB 5 元。用多少 GB 时两种套餐一样贵？',
    opYuan: '{v} 元', opGB: '{v} GB',
    check: '检查', pick: '先选一个选项。',
    qz1ok: '对。直线过 (0, {b})，所以截距 b = {b}；每向右 1 格下降 1，所以斜率 k = {k}。方程是 {eq}。',
    qz1no: '再看看：先找直线和纵轴的交点（截距），再看向右 1 格是上升还是下降、变了多少（斜率）。',
    qz2ok: '对。费用 y = {k}x + {b}，x = {x} 时 y = {k} × {x} + {b} = {y}。',
    qz2no: '再想想：费用 = 每公里价钱 × 公里数 + 起步价。',
    qz3ok: '对。A：y = {k1}x + {b1}；B：y = {k2}x。两式相等：{k1}x + {b1} = {k2}x，得 x = {x}，这时都是 {y} 元。少于 {x} GB 时 B 便宜，多于 {x} GB 时 A 便宜。',
    qz3no: '再想想：两个套餐一样贵，就是两条直线的交点。0 GB 时 A 比 B 贵 {gap0} 元，之后每多 1 GB，差距缩小 {step} 元。',
    s6fin: '回头看这一路：<strong>第 0 步</strong>每步变化一样多，点就排成直线；<strong>第 1 步</strong>直线上任意两点的「竖直变化 ÷ 水平变化」都一样，这个数是斜率 k；<strong>第 2 步</strong>截距 b 是直线穿过纵轴的高度，改 b 就是平移；<strong>第 3 步</strong>合起来是 y = kx + b，每个 x 只对应一个 y；<strong>第 4 步</strong>两个点就能反求出 k 和 b；<strong>第 5 步</strong>交点同时满足两个方程，斜率相同时平行或重合。',
    formula: 'k = (y₂ − y₁) ÷ (x₂ − x₁)\ny = kx + b（b 是 x = 0 时的 y）\n交点：k₁x + b₁ = k₂x + b₂',
    boundary: '适用范围：本页讨论平面上的直线 y = kx + b，k、b 可以是任何实数（滑杆只取 0.5 的倍数，第 4 步算出的 k、b 可能是分数）。k = 0 时 y = b 是水平线（常数函数），不叫一次函数；竖直线 x = 常数 不是函数，没有斜率。第 0 步的温室是举例：真实的温度不会一直以同样的速度变化，最多在一段时间里近似如此。',
    linksTitle: '接着去看',
    lk1: '→ 坐标页第 2 步：(x, y) 是点的地址，先横后纵',
    lk2: '→ 规律页第 5 步：规律 = 起点 + 每次增加的量（就是 b 和 k）',
    lk3: '→ 方程组页第 2 步：用代入法把交点算出来',
    lk4: '→ 抛物线页第 1 步：变化量不恒定时，图像弯成抛物线',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《一次函数 · 斜率是陡缓，截距是起点》的平行版本。'
  },
  en: {
    pageTitle: 'Linear Functions · How Much per Step, Where You Start',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Linear Functions · Slope Is Steepness, Intercept Is the Start →',
    navLabel: 'Linear functions steps',
    tagline: 'When something changes by the same amount at every step, its graph is a straight line. First watch points line up; then capture “how much per step” and “where you start” with one number each and put them together as y = kx + b; then recover an equation from two points, and finally let two lines meet — crossing, parallel or one on top of the other.',
    nav0: '0 Equal steps', nav1: '1 Slope', nav2: '2 Intercept', nav3: '3 The equation', nav4: '4 Two points', nav5: '5 Two lines', nav6: '6 Quiz & wrap-up',

    s0k: 'Step 0 · The same change every hour',
    s0t: 'The same change every hour — what shape do the readings make?',
    s0e: 'This step asks: <strong>a greenhouse is at 2 °C at hour 0, and every hour after that its temperature changes by the same k °C. Plot the reading at each hour — what shape do the points make?</strong> Across, x is the number of hours gone (0 to 6); up, y is the temperature in °C. Each point (x, y) means “after x hours, the temperature is y” (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ Coordinate plane, step 2: (x, y) is a point’s address</a>). From one point to the next you go 1 to the right (grey: an hour passes), then k up or down (orange: the temperature changes by k °C; negative k goes down). Every step is the same “right 1, up k”, so the points lie on one <strong>straight line</strong>. For contrast, switch to “change keeps growing”: the hourly change is no longer the same, and the points bend into a curve (<a class="xlink" href="../../../math/algebra/parabola/#step1">→ Parabolas, step 1: the curved graph y = ax²</a>).',
    modeEq: 'Same change every hour', modeGrow: 'Change keeps growing (contrast)',
    s0lgPt: 'reading on the hour', s0lgRun: 'across: change in x', s0lgRise: 'up/down: change in y', s0lgLine: 'the points joined (dashed)',
    kSlider0: 'Change per hour k (°C)', record: 'Record hour by hour',
    c0title: 'Temperature y (°C)   across: x hours gone',
    r0eq: 'Readings: {list}. Change each hour: {diffs} — all the same, so the points sit on one straight line.',
    r0grow: 'Readings: {list}. Change each hour: {diffs} — bigger every time, so neighbouring segments tilt differently and the points bend.',
    r0flat: 'Readings: {list}. Every hourly change is 0: the temperature holds steady and the points form a flat line.',
    r0prog: '{n}/7 hours recorded: {list}.',
    s0hint: 'What to watch: press “Record hour by hour” and see the points appear one by one, each new point reached by a grey piece (right 1) and an orange piece (up k). Then drag k: a bigger k means longer orange pieces and a steeper line; negative k heads down; k = 0 is flat. Finally switch to “change keeps growing”: each orange piece is longer than the last, and the points are no longer on one line.',

    s1k: 'Step 1 · Slope',
    s1t: 'Can one number say how steep a line is?',
    s1e: 'This step asks: <strong>pick any two points on a straight line — does “vertical change ÷ horizontal change” depend on which two you pick?</strong> This line rises k for every 1 to the right (set k with the slider; negative k means it falls) and passes through (0, 1). Put points A and B on it. Going from A to B, the change in the x-coordinate is the <strong>run</strong> (grey) and the change in the y-coordinate is the <strong>rise</strong> (orange, negative when it goes down). Rise divided by run is the line’s <strong>slope</strong>: how much it climbs for each 1 to the right. The bigger the slope’s size, the steeper the line; a negative slope falls from left to right; a slope of 0 is flat.',
    s1lgLine: 'the line (up k for every 1 right)', s1lgOld: 'earlier pairs of points (same line)',
    kSlider: 'Slope k', xA: 'x-coordinate of A', xB: 'x-coordinate of B',
    c1title: 'A → B: run {run}, rise {rise}',
    c1same: 'A = B: the run is 0, nothing to divide by',
    r1: 'A({xA}, {yA}) → B({xB}, {yB}): rise {rise} ÷ run {run} = {ratio}.',
    r1count: '{n} different pairs tried, and every ratio is {k} — wherever A and B sit, the ratio equals the climb per 1 to the right. That is the slope.',
    r1same: 'A and B are the same point: the run is 0 and you can’t divide by it. Move one of them.',
    s1hint: 'What to watch: hold k still and drag A or B to try several pairs. The grey and orange pieces change length together, yet the ratio in the readout doesn’t; the triangles you’ve tried stay faintly on the grid — different sizes, same shape. Then change k: every ratio becomes the new k at once and the old triangles clear.',

    s2k: 'Step 2 · Intercept',
    s2t: 'Same steepness, different starting height — what changes?',
    s2e: 'This step asks: <strong>keep the slope, change only the “starting height” — how does the whole line move?</strong> Same kind of line: up k for every 1 to the right (k is the slope). Now add a number b: the line’s height at x = 0, i.e. where it crosses the vertical axis (the y-axis), the point (0, b). This number is the <strong>intercept</strong> (strictly, the y-intercept): how high you stand before setting off (x = 0). Change b and every point on the line moves up or down by the same amount, so the whole line slides without getting any steeper.',
    s2lgNow: 'the line now', s2lgOld: 'earlier positions', s2lgB: 'where it crosses the y-axis, (0, b)', s2lgShift: 'how far points moved (all equal)',
    bSlider: 'Intercept b',
    c2title: 'Crosses the y-axis at (0, {b})   slope {k}',
    r2first: 'The line crosses the y-axis at (0, {b}) with slope {k}. Drag b and watch the whole line.',
    r2: 'The line crosses the y-axis at (0, {b}). Compared with the last position b changed by {db}, and the points at x = −4, 0 and 4 all moved by {db} while the slope stayed {k}: the whole line slid.',
    r2rot: 'Slope changed: the line turned about (0, {b}) to slope {k}; b stayed put. Earlier positions cleared.',
    s2hint: 'What to watch: drag only b first. Earlier positions stay faintly on the grid, and three orange bars show how far the points at x = −4, 0 and 4 moved — all the same length, so it is a slide. Then drag k: the line pivots about (0, b), b doesn’t change, and the earlier positions clear.',

    s3k: 'Step 3 · The equation',
    s3t: 'Without drawing, how do you get y for any x?',
    s3e: 'This step asks: <strong>knowing the slope k and the intercept b, can you work out the height of the line at x = −3 directly?</strong> Start at (0, b) and move x to the right (left if x is negative). Each step of 1 climbs k (the slope), so the total climb is k × x and the height is y = kx + b. That is the line’s <strong>equation</strong>, with b the intercept. A rule that gives exactly one y for every x is called a <strong>function</strong>; with k ≠ 0, y = kx + b is a <strong>linear function</strong> — x appears only to the first power (no x² terms). With k = 0, y = b is a flat line, a constant function. Writing conventions: k = 1 is written x, k = −1 is −x, b = 0 is left out, and a negative b is written “− number”.',
    s3lgLine: 'the line y = kx + b', s3lgProbe: 'probe point (x, y)', s3lgVert: 'vertical line at the probe x: meets the line once', s3lgHist: 'points worked out',
    xProbe: 'Probe x',
    r3: 'Substitute: y = {k} × {x} + {b} = {kx} + {b} = {y}. The point ({px}, {y}) lies on the line.',
    r3off: 'This point is off the visible grid (the orange arrow points to it).',
    r3count: '{n} points worked out so far, all on this line.',
    s3hint: 'What to watch: drag “Probe x” and follow the substitution in the readout while the orange point runs along the line; grey dots are points you’ve worked out, and they all line up. The dashed vertical line (x held fixed) meets the line exactly once: one x, one y — that is what “function” means. Change k or b and the equation above rewrites itself; the grey dots clear.',

    s4k: 'Step 4 · Two points fix a line',
    s4t: 'Given only two points on a line, can you get k and b back?',
    s4e: 'This step asks: <strong>a line passes through P and Q — what is its equation y = kx + b?</strong> Slope first (the climb per 1 to the right): k = rise ÷ run = (Q’s y − P’s y) ÷ (Q’s x − P’s x). Then the intercept (y at x = 0): the line passes through P, so P’s y = k × P’s x + b, which rearranges to b = P’s y − k × P’s x. The answers are often fractions, which is why k and b need not be whole numbers. If both points have the same x, the line is vertical: one x goes with infinitely many y, so it is not a function and can’t be written y = kx + b — only x = a constant.',
    px: 'P’s x', py: 'P’s y', qx: 'Q’s x', qy: 'Q’s y',
    s4lgPts: 'the two known points P and Q',
    c4title: 'P({x1}, {y1})   Q({x2}, {y2})',
    r4: 'Slope k = ({y2} − {y1}) ÷ ({x2} − {x1}) = {dy} ÷ {dx} = {k}; intercept b = {y1} − {kp} × {x1} = {b}. Check with Q: {kp} × {x2} + {bp} = {y2v}.',
    r4vert: 'P and Q both have x = {x}: the line is vertical, the run is 0, and there is no slope. Its equation is x = {x}, which is not a linear function.',
    r4same: 'P and Q are the same point: infinitely many lines pass through one point, so nothing is fixed. Pull them apart.',
    s4hint: 'What to watch: first drag only Q’s y — only the rise changes, and k and b follow. Next drag Q’s x to match P’s: the line stands upright and the equation becomes x = a constant. Finally put P at (0, 1) and Q at (2, 5) and read off k = 2, b = 1.',

    s5k: 'Step 5 · Two lines meet',
    s5t: 'Where do two lines meet — and can they miss each other forever?',
    s5e: 'This step asks: <strong>where do line ① y = 0.5x + 2 and line ② y = k₂x + b₂ cross?</strong> The crossing point lies on both lines, so its coordinates satisfy both equations at once (<a class="xlink" href="../../../math/algebra/simultaneous-equations/#step1">→ Simultaneous equations, step 1: the point that satisfies both</a>). The lower panel draws the <strong>gap</strong> between the lines at each whole-number x (① ’s y minus ② ’s y) as a bar. The gap changes evenly too: by 0.5 − k₂ for each 1 to the right — the difference of the two slopes. Where the bars reach 0 is the crossing, at x = (b₂ − 2) ÷ (0.5 − k₂). With equal slopes the gap never changes: equal intercepts too means one and the same line (coincident); different intercepts means the gap stays put forever (parallel, never meeting).',
    k2Slider: 'Slope of line ②, k₂', b2Slider: 'Intercept of line ②, b₂',
    s5lg1: 'line ① y = 0.5x + 2', s5lg2: 'line ②', s5lgGapPos: 'gap > 0 (① above)', s5lgGapNeg: 'gap < 0 (② above)',
    c5top: 'Two lines: ①  {eq1}   ②  {eq2}', c5bot: 'Gap = ①’s y − ②’s y (one bar per whole-number x)',
    r5one: 'They cross at ({x}, {y}). In ①: 0.5 × {xp} + 2 = {y}; in ②: {k2} × {xp} + {b2p} = {y}. The gap changes by {step} for each 1 to the right and hits 0 at x = {x}.',
    r5off: '(The crossing is outside the part of the grid on show; trust the readout.)',
    r5par: 'Both slopes are 0.5, so the gap is {gap} everywhere and never reaches 0: parallel lines that never meet, and the two equations share no solution.',
    r5same: 'Both slopes are 0.5 and both intercepts are 2: it is the same line (coincident). The gap is 0 everywhere and they share infinitely many points.',
    s5hint: 'What to watch: drag k₂ first and watch the lower panel. The bar tops form a sloping line, steeper when the slopes differ more; the place where the bars pass through 0 moves, and the crossing in the upper panel moves with it. Set k₂ to 0.5: every bar is the same height and can never reach 0 — parallel. Now set b₂ to 2 and the bars vanish: the lines coincide.',

    s6k: 'Step 6 · Quiz & wrap-up',
    s6t: 'Three questions: read a graph, find a value, find a crossing',
    s6e: 'Think each one through, then pick an answer and press “Check”.',
    qz1p: '① Which equation belongs to the line drawn below?',
    qz2p: '② A taxi charges 8 yuan to start plus 2 yuan per kilometre (no free distance included). What does a 5 km ride cost?',
    qz3p: '③ Data plan A: 10 yuan a month plus 3 yuan per GB. Plan B: no monthly fee, 5 yuan per GB. At how many GB do they cost the same?',
    opYuan: '{v} yuan', opGB: '{v} GB',
    check: 'Check', pick: 'Pick an option first.',
    qz1ok: 'Right. The line passes through (0, {b}), so the intercept is b = {b}; it drops 1 for every 1 to the right, so the slope is k = {k}. The equation is {eq}.',
    qz1no: 'Look again: find where the line crosses the y-axis (the intercept), then see whether one step right goes up or down, and by how much (the slope).',
    qz2ok: 'Right. Cost y = {k}x + {b}; at x = {x}, y = {k} × {x} + {b} = {y}.',
    qz2no: 'Not quite: cost = price per km × kilometres + starting fare.',
    qz3ok: 'Right. A: y = {k1}x + {b1}; B: y = {k2}x. Set them equal: {k1}x + {b1} = {k2}x gives x = {x}, where both cost {y} yuan. Below {x} GB plan B is cheaper; above {x} GB plan A is.',
    qz3no: 'Not quite: “same cost” is where the two lines cross. At 0 GB plan A costs {gap0} yuan more, and every extra GB closes the gap by {step} yuan.',
    s6fin: 'Looking back. <strong>Step 0</strong>: equal change at every step lines the points up. <strong>Step 1</strong>: “rise ÷ run” is the same for any two points on a line — that number is the slope k. <strong>Step 2</strong>: the intercept b is where the line crosses the y-axis, and changing b slides the line. <strong>Step 3</strong>: together they make y = kx + b, one y for each x. <strong>Step 4</strong>: two points are enough to recover k and b. <strong>Step 5</strong>: a crossing satisfies both equations; equal slopes mean parallel or coincident lines.',
    formula: 'k = (y₂ − y₁) ÷ (x₂ − x₁)\ny = kx + b (b is y at x = 0)\ncrossing: k₁x + b₁ = k₂x + b₂',
    boundary: 'Scope: this page is about straight lines y = kx + b in the plane, where k and b can be any real numbers (the sliders move in steps of 0.5; step 4 can give fractions). With k = 0, y = b is a flat line (a constant function), not called a linear function here; a vertical line x = constant is not a function and has no slope. The greenhouse in step 0 is an illustration: real temperatures don’t change at one steady rate for long — at best roughly so over a stretch of time.',
    linksTitle: 'Where to go next',
    lk1: '→ Coordinate plane, step 2: (x, y) is a point’s address — across first, then up',
    lk2: '→ Patterns, step 5: a pattern = a start + the amount added each time (that is b and k)',
    lk3: '→ Simultaneous equations, step 2: calculate the crossing by substitution',
    lk4: '→ Parabolas, step 1: when the change isn’t constant, the graph bends into a parabola',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Linear Functions · Slope Is Steepness, Intercept Is the Start”.'
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
