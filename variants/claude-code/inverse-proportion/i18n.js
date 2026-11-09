'use strict';
// Inverse proportion strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '反比例函数 · 乘积不变的两个量',
    back: '← 知识索引',
    compare: '对照另一版本：反比例函数 · 此消彼长 →',
    navLabel: '反比例函数步骤导航',
    tagline: '面积是 24 的长方形，宽可以随便挑，高就跟着定了：宽 × 高始终是 24。这一页从这样的长方形出发，看「乘积不变」怎样画成一条双曲线，它为什么永远碰不到坐标轴，又怎样和正比例分清楚。',
    nav0: '0 面积不变', nav1: '1 扩大与缩小', nav2: '2 双曲线', nav3: '3 碰不到轴', nav4: '4 比值还是乘积', nav5: '5 现实里', nav6: '6 求值', nav7: '7 收束',

    s0k: '第 0 步 · 一个固定的面积',
    s0t: '面积是 24 的长方形，宽变了，高怎么变？',
    s0e: '这一步要回答：面积固定为 24 时，宽 x 和高 y 有什么关系？长方形面积 = 宽 × 高，所以无论宽取多少，都有 <strong>x × y = 24</strong>，高只能是 <strong>y = 24 ÷ x</strong>。下图把长方形的左下角钉在原点，横轴是宽、纵轴是高（单位都是长度单位），右上角的橙点坐标就是 (宽, 高)。每试一个宽，右上角会留下一个白点。',
    c0a: '左下角钉在原点、面积为 24 的长方形',
    c0title: '面积 24 的长方形（左下角钉在原点）',
    lgRect: '当前长方形', lgCorner: '右上角 (宽, 高)', lgTrail: '试过的宽留下的右上角',
    x0: '宽 x', sweep0: '从宽 1 扫到宽 12', clear0: '清掉白点',
    xWidth: '宽 x', yHeight: '高 y',
    s0readout: '宽 {x} × 高 {y} = {a}。已经留下 {n} 个右上角，它们不在一条直线上，而是排成一条向两边越来越平、越来越陡的曲线。',
    s0hint: '观察顺序：先按「从宽 1 扫到宽 12」，看长方形从又高又窄变成又矮又宽，右上角一路留下白点；再慢慢拖宽，看读数里的乘积始终是 24。宽是整数且高也是整数时，长方形里会画出单位小方格，可以数一数是不是 24 格。',

    s1k: '第 1 步 · 扩大与缩小',
    s1t: '宽扩大到 3 倍，高会变成多少？',
    s1e: '这一步要回答：乘积不变时，一个量扩大到 m 倍，另一个量怎样变？面积还是 24。宽从 x 变成 m·x，要让 (m·x) × 新高 = 24，新高只能是 24 ÷ (m·x)，正好是原来高的 <strong>1/m</strong>。这就是「此消彼长」的精确说法：<strong>一个扩大到 m 倍，另一个缩小到原来的 1/m</strong>。虚线是原长方形，青色是新长方形，淡橙色虚线是所有面积 24 的长方形右上角所在的曲线。',
    c1a: '原长方形（虚线）和宽扩大后的新长方形',
    c1title: '原来的（虚线）和宽扩大后的（青色）',
    lgBefore: '原长方形', lgAfter: '宽扩大 m 倍后的长方形',
    w1: '原来的宽', m1: '宽扩大到几倍 m',
    s1readout: '宽 {x0} → {x1}（× {m}），高 {y0} → {y1}（÷ {m}），新面积 {x1} × {y1} = {p}，没变。',
    s1hint: '观察顺序：先固定原来的宽，把 m 从 1 拖到 6：青色长方形越来越扁，右上角沿淡橙色曲线往右下滑，读数里高每次都被除以同一个 m。再换原来的宽重复一遍，规律不变。',

    s2k: '第 2 步 · 双曲线',
    s2t: 'y = k/x 的图像长什么样？k 的正负有什么影响？',
    s2e: '这一步要回答：把「乘积不变」写成函数，它的图像是什么形状？若 <strong>x · y = k</strong>（k 是不等于 0 的常数），就说 y 与 x 成<strong>反比例</strong>，<strong>y = k/x</strong> 叫<strong>反比例函数</strong>。x 不能取 0（不能除以 0）。图像叫<strong>双曲线</strong>，分成互不相连的两支。坐标平面被两条轴分成四个区域，叫<strong>象限</strong>（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step4">→ 坐标系第 4 步：四个象限里坐标的正负</a>）：k > 0 时两支在第一、三象限，k < 0 时在第二、四象限。绿色长方形以原点和曲线上的点为对角，它的面积永远是 |k|（k 的绝对值，即去掉正负号）。',
    c2a: '反比例函数 y = k/x 的两支和曲线上的一个点',
    c2title: 'y = {k}/x', c2titleZero: 'k = 0：y = 0，不是反比例函数',
    lgCurve: '曲线 y = k/x', lgPoint: '曲线上的点 (x, y)', lgSigned: '以原点和该点为对角的长方形（面积 |k|）',
    k2: '常数 k', x2: '点的横坐标 x',
    quad1: '第一象限', quad2: '第二象限', quad3: '第三象限', quad4: '第四象限',
    s2zero: 'k = 0 时 y 总是 0，乘积 x · y 也总是 0，两个量没有「一个变大另一个变小」的关系，所以不算反比例函数（粉色虚线）。',
    s2x0: 'x = 0 时 {k} ÷ 0 没有意义，曲线在这里断开（粉色虚线是 y 轴），两支永远不相连。',
    s2readout: 'k = {k}，x = {x}：y = {k} ÷ {x} = {y}，点在{q}。绿色长方形面积 = |x| × |y| = |k|。{out}',
    s2out: '这个点超出了图的范围（|y| > 8），绿色长方形只画到边框。',
    s2hint: '观察顺序：先保持 k = 8，把 x 从 0.25 拖到 8：点沿曲线往右下走，绿色长方形变扁但面积不变。再把 x 拖到负数，点跳到第三象限的另一支。最后把 k 拖成负数，两支翻到第二、四象限；拖到 0，曲线变成 x 轴本身。',

    s3k: '第 3 步 · 碰不到坐标轴',
    s3t: 'x 越来越大，曲线最后会碰到 x 轴吗？',
    s3e: '这一步要回答：y = 6/x 在 x 很大时会不会等于 0？要等于 0，就得 6 ÷ x = 0，可 6 除以任何正数都还是正数，所以 <strong>y 越来越接近 0，但永远不等于 0</strong>。同理，x 越接近 0，y 越大，曲线也碰不到 y 轴。滑杆改的是<strong>显示范围</strong>（横轴从 0 画到多远），函数本身没变；纵轴始终是 0 到 6.6。',
    c3a: 'y = 6/x 在不同显示范围下的样子',
    c3title: 'y = 6/x，横轴 0 到 {X}',
    lgCurve3: '曲线 y = 6/x', lgEdge: '横轴最右端的点',
    z3: '横轴画到',
    th3x: '最右端 x', th3y: 'y = 6 ÷ x', th3xy: 'x × y',
    s3readout: '横轴画到 {X}：最右端 y = 6 ÷ {X} = {y}，比 0 大；在图上它离 x 轴约 {px} 像素。乘积 x × y 仍是 6。',
    s3hint: '观察顺序：把滑杆从 10 一格一格拖到 10,000，看曲线越来越贴近 x 轴、橙点高度在图上几乎看不出来；但下面的表格逐行记下 y 值：0.6、0.06、0.006……每次都还有一个不是 0 的数字，最后一列都是 6。',

    s4k: '第 4 步 · 比值还是乘积',
    s4t: '给你一张表，怎样判断是正比例、反比例，还是都不是？',
    s4e: '这一步要回答：怎样用数据一眼区分？对表中每一行算两个数：<strong>比值 y ÷ x</strong> 和<strong>乘积 x × y</strong>。如果比值处处相同，y 与 x 成<strong>正比例</strong>（y = kx，一个扩大几倍另一个也扩大几倍）；如果乘积处处相同，就成<strong>反比例</strong>；两者都在变，就都不是。注意「一个变大另一个变小」不够：乘积必须真的不变。',
    scGroup: '情景', scApple: '买苹果（每千克 5 元）', scTrip: '跑 120 千米', scRope: '周长 20 厘米的长方形', scSquare: '正方形的面积',
    sc_apple: '「买苹果」', sc_trip: '「跑 120 千米」', sc_rope: '「周长 20 厘米的长方形」', sc_square: '「正方形的面积」',
    x_apple: '重量 x（千克）', y_apple: '总价 y（元）', x_trip: '速度 x（千米/时）', y_trip: '时间 y（时）', x_rope: '一边 x（厘米）', y_rope: '另一边 y（厘米）', x_square: '边长 x（厘米）', y_square: '面积 y（平方厘米）',
    th4r: '比值 y ÷ x', th4p: '乘积 x × y',
    c4a: '每一行的比值和乘积，画成两排柱子',
    c4ratio: '比值 y ÷ x（每一行）', c4prod: '乘积 x × y（每一行）',
    lgRatio: '比值 y ÷ x', lgProd: '乘积 x × y',
    s4readout_direct: '{sc}：绿色柱子（比值）一样高，橙色柱子（乘积）一路变化，所以是正比例。',
    s4readout_inverse: '{sc}：橙色柱子（乘积）一样高，绿色柱子（比值）一路变化，所以是反比例。',
    s4readout_neither: '{sc}：两排柱子都高低不齐，比值和乘积都不是定值，所以既不是正比例也不是反比例。',
    s4hint: '观察顺序：依次点四个情景，只看哪一排柱子是平的。「周长 20 厘米的长方形」里一边变长另一边变短，很像反比例，但乘积在变——它不变的是和 x + y = 10；「正方形的面积」两个量一起变大，却也不是正比例。',

    s5k: '第 5 步 · 现实里的反比例',
    s5t: '现实中的反比例，图像也是一整条曲线吗？',
    s5e: '这一步要回答：把反比例用到现实问题时，x 能取哪些值？<strong>分车费</strong>：¥120 由 n 个人平摊，每人 120 ÷ n 元，n 只能是正整数，所以图像只是曲线上一个个分开的点；钱还只能精确到分。<strong>跑路程</strong>：120 千米以速度 v 匀速行驶，用时 120 ÷ v 小时，v 可以连续变化，但现实里有范围（这里设为 20–120 千米/时），而且真实行驶不会全程匀速，所以只是近似。虚线是数学上的整条曲线，青色是现实中能取到的部分。',
    scFare: '分车费 ¥120', scTrip5: '跑 120 千米',
    c5a: '现实中能取到的部分（青色）与数学曲线（虚线）',
    c5fare: '每人付多少：¥120 ÷ 人数', c5trip: '要多少小时：120 千米 ÷ 速度',
    lgReal: '现实中能取到的值', lgMath: '数学上的整条曲线', lgNow: '当前选择',
    q5fare: '人数 n', q5trip: '速度 v', people: '{v} 人', kmh: '{v} 千米/时',
    axPeople: '人数', axYuan: '元', axKmh: '千米/时', axHours: '小时',
    s5fareExact: '{n} 人平摊：每人 120 ÷ {n} = ¥{c}，正好能付清，{n} × {c} = 120。',
    s5fareRound: '{n} 人平摊：120 ÷ {n} = {y}…元，除不尽到分，每人只能付 ¥{c} 左右，有人要多付或少付一分，乘积只近似等于 120。',
    s5trip: '速度 {v} 千米/时：用时 120 ÷ {v} = {h} 小时（约 {min} 分钟）。速度只能在 20–120 之间取，所以只用到青色那一段曲线。',
    s5hint: '观察顺序：先看「分车费」，拖人数，橙点只在一个个青点之间跳，不会落在虚线中间；留意 7 人、9 人时读数提示除不尽。再切到「跑 120 千米」，橙点在青色实线上连续滑动，实线两端外面只剩虚线。',

    s6k: '第 6 步 · 求值',
    s6t: '已知曲线经过一个点，怎样求另一个点？',
    s6e: '这一步要回答：知道 y 与 x 成反比例、图像经过点 (a, b)，怎样求 x = c 时的 y？关键是先求出那个不变的乘积 <strong>k = a × b</strong>，再算 <strong>y = k ÷ c</strong>。在框里填数并检查，与正确值相差小于 0.01 就算对；检查后图上会画出整条曲线和答案点。',
    ansLabel: '你算出的 y', check: '检查', next: '换一题',
    q6: '第 {i}/{n} 题：y 与 x 成反比例，图像经过点 ({a}, {b})。当 x = {c} 时，y 等于多少？',
    needNumber: '先在框里填一个数。',
    right6: '对。k = {a} × {b} = {k}，所以 y = {k} ÷ {c} = {y}。',
    wrong6: '还不对。先求 k = {a} × {b} = {k}，再算 y = {k} ÷ {c} = {y}。图上的橙点就是答案。',
    c6a: '已知点、要求的竖线，检查后画出整条曲线',
    c6title: '已知点（白）与要求的 x（橙色虚线）', c6titleK: '检查后：曲线 y = {k}/x',
    lgGiven: '已知的点 (a, b)', lgAsked: '要求的位置 x = c',
    s6hint: '观察顺序：先读题，看白点和橙色虚线在哪个象限；心算 k 的正负，判断答案应该是正还是负，再动笔。检查后看橙点是不是落在青色曲线上，再按「换一题」。',

    s7k: '第 7 步 · 收束', s7t: '乘积不变，就是反比例',
    s7fin: '回顾：<strong>第 0 步</strong>，面积固定的长方形，宽 × 高始终不变，右上角排成一条曲线。<strong>第 1 步</strong>，一个扩大到 m 倍，另一个就缩小到 1/m。<strong>第 2 步</strong>，y = k/x 的图像是双曲线，k > 0 在一、三象限，k < 0 在二、四象限，x 不能为 0。<strong>第 3 步</strong>，y 可以无限接近 0，却永远不等于 0。<strong>第 4 步</strong>，判断看乘积是否不变，而不是看「一个大一个小」。<strong>第 5 步</strong>，现实问题只取曲线的一部分，有时只是一些点。<strong>第 6 步</strong>，求值先求 k。',
    formula: 'x · y = k（k ≠ 0）\ny = k / x（x ≠ 0）\nx 变为 m 倍 → y 变为 1/m',
    boundary: '适用范围：反比例要求乘积严格不变。现实中的「分摊」「匀速」都是理想化：钱要取整到分，速度不会全程不变，能取的 x 也有范围。只是「一个增大另一个减小」并不足以说明成反比例（例如周长固定的长方形）。',
    linksTitle: '接着去看',
    lk1: '→ 周长与面积第 2 步：面积一样的长方形，周长差多少',
    lk2: '→ 面积模型第 4 步：知道面积，反过来找边长',
    lk3: '→ 一次函数第 0 步：每一步抬高一样多——正比例的直线',
    lk4: '→ 坐标系第 3 步：交换坐标就是沿对角线翻折（双曲线 y = k/x 关于这条线对称）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《反比例函数 · 此消彼长》的平行版本。'
  },
  en: {
    pageTitle: 'Inverse Proportion · Two Quantities with a Fixed Product',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Inverse Proportion · One Up, One Down →',
    navLabel: 'Inverse proportion steps',
    tagline: 'Pick any width for a rectangle of area 24 and its height is decided for you: width × height is always 24. Starting from such rectangles, this page shows how a fixed product draws a hyperbola, why that curve never touches the axes, and how to tell it apart from direct proportion.',
    nav0: '0 Fixed area', nav1: '1 Stretch & shrink', nav2: '2 The hyperbola', nav3: '3 Never touches', nav4: '4 Ratio or product', nav5: '5 Real life', nav6: '6 Solve', nav7: '7 Wrap-up',

    s0k: 'Step 0 · A fixed area',
    s0t: 'A rectangle of area 24: change the width, and what happens to the height?',
    s0e: 'This step asks: with the area fixed at 24, how are the width x and the height y related? Area = width × height, so whatever the width, <strong>x × y = 24</strong>, and the height has to be <strong>y = 24 ÷ x</strong>. The rectangle’s bottom-left corner is pinned to the origin; the horizontal axis is width, the vertical axis is height (both in length units), so the orange top-right corner sits at (width, height). Every width you try leaves a white dot at its corner.',
    c0a: 'A rectangle of area 24 with its corner pinned at the origin',
    c0title: 'Rectangles of area 24 (corner at the origin)',
    lgRect: 'current rectangle', lgCorner: 'top-right corner (width, height)', lgTrail: 'corners left by widths you tried',
    x0: 'Width x', sweep0: 'Sweep width 1 → 12', clear0: 'Clear the dots',
    xWidth: 'width x', yHeight: 'height y',
    s0readout: 'Width {x} × height {y} = {a}. {n} corners recorded so far: they do not lie on a straight line but on a curve that flattens out to the right and shoots up to the left.',
    s0hint: 'What to try: press “Sweep width 1 → 12” and watch the rectangle go from tall and thin to short and wide while its corner leaves a trail of dots. Then drag the width slowly and keep an eye on the product in the readout: always 24. When both sides are whole numbers the rectangle shows its unit squares, so you can count all 24.',

    s1k: 'Step 1 · Stretch and shrink',
    s1t: 'Make the width 3 times as long: what happens to the height?',
    s1e: 'This step asks: with a fixed product, if one quantity becomes m times as large, what happens to the other? The area is still 24. The width goes from x to m·x, and for (m·x) × new height = 24 the new height must be 24 ÷ (m·x), exactly <strong>1/m</strong> of the old height. That is the precise meaning of “one up, one down”: <strong>when one becomes m times as large, the other becomes 1/m as large</strong>. The dashed outline is the old rectangle, the cyan one is the new; the faint orange dashes mark where the corner of every area-24 rectangle lies.',
    c1a: 'The old rectangle (dashed) and the new one after stretching the width',
    c1title: 'Before (dashed) and after stretching the width (cyan)',
    lgBefore: 'old rectangle', lgAfter: 'rectangle with width × m',
    w1: 'Old width', m1: 'Stretch the width by m',
    s1readout: 'Width {x0} → {x1} (× {m}), height {y0} → {y1} (÷ {m}); new area {x1} × {y1} = {p}, unchanged.',
    s1hint: 'What to try: keep the old width and drag m from 1 to 6. The cyan rectangle gets flatter, its corner slides down the faint orange curve, and in the readout the height is divided by the same m every time. Pick another old width and repeat: same pattern.',

    s2k: 'Step 2 · The hyperbola',
    s2t: 'What does the graph of y = k/x look like, and what does the sign of k do?',
    s2e: 'This step asks: written as a function, what shape does a fixed product make? If <strong>x · y = k</strong> for a constant k that is not 0, we say y is <strong>inversely proportional</strong> to x, and <strong>y = k/x</strong> is an <strong>inverse proportion function</strong>. x cannot be 0 (there is no dividing by 0). Its graph is a <strong>hyperbola</strong>, made of two separate branches. The two axes cut the plane into four regions called <strong>quadrants</strong> (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step4">→ Coordinates, step 4: the signs in each quadrant</a>): for k > 0 the branches sit in quadrants I and III, for k < 0 in II and IV. The green rectangle has the origin and the point on the curve as opposite corners; its area is always |k| (k without its sign).',
    c2a: 'The two branches of y = k/x and one point on the curve',
    c2title: 'y = {k}/x', c2titleZero: 'k = 0: y = 0, not an inverse proportion',
    lgCurve: 'curve y = k/x', lgPoint: 'point (x, y) on the curve', lgSigned: 'rectangle from the origin to the point (area |k|)',
    k2: 'Constant k', x2: 'x of the point',
    quad1: 'Quadrant I', quad2: 'Quadrant II', quad3: 'Quadrant III', quad4: 'Quadrant IV',
    s2zero: 'With k = 0, y is always 0 and so is x · y; nothing goes down as the other goes up, so this is not an inverse proportion (pink dashes).',
    s2x0: 'At x = 0, {k} ÷ 0 means nothing. The curve breaks here (the pink dashes are the y-axis), and the two branches never join.',
    s2readout: 'k = {k}, x = {x}: y = {k} ÷ {x} = {y}, in {q}. Green rectangle area = |x| × |y| = |k|. {out}',
    s2out: 'The point is off the chart (|y| > 8); the green rectangle is cut at the frame.',
    s2hint: 'What to try: keep k = 8 and drag x from 0.25 to 8. The point slides down the curve and the green rectangle flattens while keeping its area. Drag x below 0 and the point jumps to the other branch in quadrant III. Finally make k negative: the branches flip into quadrants II and IV. At k = 0 the “curve” is just the x-axis.',

    s3k: 'Step 3 · Never touching the axes',
    s3t: 'As x grows, does the curve finally reach the x-axis?',
    s3e: 'This step asks: does y = 6/x ever equal 0 when x is large? For that we would need 6 ÷ x = 0, but 6 divided by any positive number is still positive. So <strong>y gets closer and closer to 0 but never equals 0</strong>. In the same way, as x gets close to 0, y grows without limit and the curve never touches the y-axis either. The slider changes only the <strong>viewing window</strong> (how far right the axis goes), not the function; the vertical axis always runs from 0 to 6.6.',
    c3a: 'y = 6/x shown over different horizontal ranges',
    c3title: 'y = 6/x, x from 0 to {X}',
    lgCurve3: 'curve y = 6/x', lgEdge: 'point at the right edge',
    z3: 'Horizontal axis runs to',
    th3x: 'x at the right edge', th3y: 'y = 6 ÷ x', th3xy: 'x × y',
    s3readout: 'Axis up to {X}: at the right edge y = 6 ÷ {X} = {y}, still above 0; on screen it is about {px} px above the axis. The product x × y is still 6.',
    s3hint: 'What to try: drag the slider one notch at a time from 10 to 10,000. The curve hugs the x-axis tighter and the orange point’s height becomes invisible, but the table logs each y: 0.6, 0.06, 0.006… there is always a non-zero digit, and the last column is 6 every time.',

    s4k: 'Step 4 · Ratio or product',
    s4t: 'Given a table, how do you tell direct, inverse, or neither?',
    s4e: 'This step asks: how can the data settle it at a glance? For every row work out two numbers, the <strong>ratio y ÷ x</strong> and the <strong>product x × y</strong>. If the ratio is the same in every row, y is <strong>directly proportional</strong> to x (y = kx: scale one up and the other scales up by the same factor). If the product is the same in every row, it is <strong>inverse proportion</strong>. If both change, it is neither. Note that “one goes up while the other goes down” is not enough: the product has to stay put.',
    scGroup: 'Situation', scApple: 'Apples at ¥5 per kg', scTrip: 'A 120 km trip', scRope: 'Rectangle, perimeter 20 cm', scSquare: 'Area of a square',
    sc_apple: '“Apples”', sc_trip: '“A 120 km trip”', sc_rope: '“Rectangle with perimeter 20 cm”', sc_square: '“Area of a square”',
    x_apple: 'weight x (kg)', y_apple: 'cost y (¥)', x_trip: 'speed x (km/h)', y_trip: 'time y (h)', x_rope: 'one side x (cm)', y_rope: 'other side y (cm)', x_square: 'side x (cm)', y_square: 'area y (cm²)',
    th4r: 'ratio y ÷ x', th4p: 'product x × y',
    c4a: 'The ratio and product of each row, as two rows of bars',
    c4ratio: 'Ratio y ÷ x (each row)', c4prod: 'Product x × y (each row)',
    lgRatio: 'ratio y ÷ x', lgProd: 'product x × y',
    s4readout_direct: '{sc}: the green bars (ratio) are all the same height while the orange bars (product) change, so this is direct proportion.',
    s4readout_inverse: '{sc}: the orange bars (product) are all the same height while the green bars (ratio) change, so this is inverse proportion.',
    s4readout_neither: '{sc}: both rows of bars are uneven; neither the ratio nor the product is constant, so it is neither direct nor inverse proportion.',
    s4hint: 'What to try: click the four situations in turn and look only for the row of bars that is flat. In “Rectangle, perimeter 20 cm” one side grows as the other shrinks, which looks inverse, but the product moves; what stays fixed is the sum x + y = 10. In “Area of a square” both grow together, yet it is not direct proportion either.',

    s5k: 'Step 5 · Inverse proportion in real life',
    s5t: 'In real situations, is the graph still a whole curve?',
    s5e: 'This step asks: when inverse proportion models a real problem, which values of x make sense? <strong>Splitting a fare</strong>: ¥120 shared by n people is 120 ÷ n each, and n must be a positive whole number, so the graph is a set of separate points on the curve; money also stops at the cent. <strong>A trip</strong>: 120 km at a steady speed v takes 120 ÷ v hours. v can vary smoothly, but only within a sensible range (here 20–120 km/h), and no real drive is perfectly steady, so this is an approximation. The dashes show the whole mathematical curve; cyan shows the part reality can use.',
    scFare: 'Split a ¥120 fare', scTrip5: 'A 120 km trip',
    c5a: 'The usable part (cyan) against the mathematical curve (dashes)',
    c5fare: 'Each person pays: ¥120 ÷ people', c5trip: 'Hours needed: 120 km ÷ speed',
    lgReal: 'values reality allows', lgMath: 'the whole mathematical curve', lgNow: 'current choice',
    q5fare: 'People n', q5trip: 'Speed v', people: '{v} people', kmh: '{v} km/h',
    axPeople: 'people', axYuan: '¥', axKmh: 'km/h', axHours: 'hours',
    s5fareExact: '{n} people share: 120 ÷ {n} = ¥{c} each, which settles exactly: {n} × {c} = 120.',
    s5fareRound: '{n} people share: 120 ÷ {n} = {y}… does not stop at the cent, so each pays about ¥{c}; someone pays a cent more or less, and the product is only close to 120.',
    s5trip: 'At {v} km/h: 120 ÷ {v} = {h} hours (about {min} minutes). Speed is limited to 20–120 here, so only the cyan stretch of the curve is used.',
    s5hint: 'What to try: start with the fare and drag the number of people. The orange point hops between separate cyan dots and never lands between them on the dashed curve; at 7 or 9 people the readout warns that the split does not come out even. Then switch to the trip: the orange point glides along the solid cyan stretch, with only dashes beyond its ends.',

    s6k: 'Step 6 · Solve for a value',
    s6t: 'Given one point on the curve, how do you find another?',
    s6e: 'This step asks: if y is inversely proportional to x and the graph passes through (a, b), what is y when x = c? The key is to find the fixed product first, <strong>k = a × b</strong>, then <strong>y = k ÷ c</strong>. Type your answer and check it; anything within 0.01 of the true value counts. After checking, the whole curve and the answer point appear on the graph.',
    ansLabel: 'Your value of y', check: 'Check', next: 'Next problem',
    q6: 'Problem {i}/{n}: y is inversely proportional to x and the graph passes through ({a}, {b}). What is y when x = {c}?',
    needNumber: 'Type a number in the box first.',
    right6: 'Right. k = {a} × {b} = {k}, so y = {k} ÷ {c} = {y}.',
    wrong6: 'Not yet. First k = {a} × {b} = {k}, then y = {k} ÷ {c} = {y}. The orange point on the graph is the answer.',
    c6a: 'The given point and the asked line; the curve appears after checking',
    c6title: 'Given point (white) and the asked x (orange dashes)', c6titleK: 'After checking: the curve y = {k}/x',
    lgGiven: 'given point (a, b)', lgAsked: 'asked position x = c',
    s6hint: 'What to try: read the problem and see which quadrants the white point and the orange line are in. Work out the sign of k in your head and decide whether the answer should be positive or negative before you calculate. After checking, see whether the orange point sits on the cyan curve, then press “Next problem”.',

    s7k: 'Step 7 · Wrap-up', s7t: 'A fixed product means inverse proportion',
    s7fin: 'Looking back. <strong>Step 0</strong>: for rectangles of fixed area, width × height never changes and the corners line up on a curve. <strong>Step 1</strong>: make one m times as large and the other becomes 1/m as large. <strong>Step 2</strong>: the graph of y = k/x is a hyperbola, in quadrants I and III for k > 0, II and IV for k < 0, with x never 0. <strong>Step 3</strong>: y can get as close to 0 as you like but never reaches it. <strong>Step 4</strong>: decide by whether the product is constant, not by “one up, one down”. <strong>Step 5</strong>: real problems use only part of the curve, sometimes just separate points. <strong>Step 6</strong>: to solve, find k first.',
    formula: 'x · y = k (k ≠ 0)\ny = k / x (x ≠ 0)\nx becomes m times → y becomes 1/m',
    boundary: 'Scope: inverse proportion needs the product to be exactly constant. Real “sharing” and “steady speed” are idealisations: money is rounded to the cent, speed is never perfectly steady, and x has a usable range. “One goes up while the other goes down” on its own does not make an inverse proportion (a rectangle of fixed perimeter is the counter-example).',
    linksTitle: 'Where to go next',
    lk1: '→ Perimeter & area, step 2: rectangles with the same area, and how far their perimeters differ',
    lk2: '→ Area model, step 4: from a known area back to the side lengths',
    lk3: '→ Linear functions, step 0: the same rise at every step, the straight line of direct proportion',
    lk4: '→ Coordinates, step 3: swapping coordinates reflects in the diagonal (y = k/x is symmetric about that line)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Inverse Proportion · One Up, One Down”.'
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
  if (typeof window.refreshInverse === 'function') window.refreshInverse();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.IP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
