'use strict';
/* ============================================================
   二次函数与抛物线 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '二次函数与抛物线 · 投篮的弧线 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '二次函数与抛物线 · 投篮的弧线',
    tagline: '投篮的弧线就是抛物线：y = ax² 里的 a 管开口方向和胖瘦，把整条弧线平移，顶点（最高点或最低点）跟着走——式子写成顶点式，顶点、对称轴、和地面的交点，全都能直接从式子里读出来。',
    nav0: '0 投篮', nav1: '1 a 管胖瘦', nav2: '2 顶点搬家', nav3: '3 落点与交点', nav4: '4 自测', nav5: '5 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 二次函数与抛物线 Quadratic Functions & the Parabola —— 一步一交互系列',

    s0k: '第 0 步 · 投篮',
    s0t: '投篮：把球每 0.1 秒的位置连起来',
    s0e: '这一步要回答：球投出去以后，每 0.1 秒它在哪里？把这些位置一个一个落成点、再连起来，是什么形状？先按下「投篮」，看点列落下：横轴是时间（秒），纵轴是高度（米）。落完后可以切换横轴口径，把横轴换成水平距离，再看同一批点。',
    s0modeT: '横轴：时间',
    s0modeD: '横轴：水平距离',
    s0play: '投篮 ▶',
    s0pause: '暂停 ⏸',
    s0resume: '继续 ▶',
    s0replay: '再投一次 ↻',
    s0prog: '已落点 {n} / 14',
    s0ptT: '落点 {n}：时间 {x} 秒，高度 <b>{y}</b> 米',
    s0ptD: '落点 {n}：水平距离 {x} 米，高度 <b>{y}</b> 米',
    s0roIdle: '按下「投篮」，球会出手，位置点每 0.1 秒落一个。随时可以暂停，停在任意一刻细看。',
    s0roDoneT: '14 个点全落下，连起来是一条先升后降的弧线，最高点只有一个：在 0.5 秒处、高 3.25 米。这种只有一个顶的弧线叫<b>抛物线</b>（parabola），最高点（或最低点）叫<b>顶点</b>（vertex）。',
    s0roDoneD: '14 个点全落下，连起来是一条先升后降的弧线，最高点只有一个：在水平距离 2 米处、高 3.25 米。这种只有一个顶的弧线叫<b>抛物线</b>（parabola），最高点（或最低点）叫<b>顶点</b>（vertex）。',
    s0hint: '两种横轴画的是同一次投篮：球的水平速度不变，水平距离和时间成正比。横轴换成距离，点列横着拉长——还是同一次投篮的弧线、仍是一条抛物线，但图被横向拉宽，看起来就比时间口径时胖（横向拉伸相当于把式子里的 a 换了一个数，这正是第 1 步要讲的）；顶点高度、每个点对应投篮的哪一刻，这些事实都没变。看点列的顺序：<strong>先看落点一个个出现（现象），再看它们连成的形状</strong>。',
    cTime: '时间（秒）',
    cDist: '水平距离（米）',
    cHeight: '高度（米）',
    cVertex: '顶点',

    s1k: '第 1 步 · a 管胖瘦',
    s1t: 'y = ax²：a 管开口方向和胖瘦',
    s1e: '这一步要回答：最简单的抛物线 y = ax² 里，把 a 改一改，弧线会怎么变？拖滑杆换 a，看实线和虚线原型 y = x² 的对比——胖了还是瘦了、开口朝上还是朝下。顶点先钉在原点不动。',
    s1aLab: 'a 的取值（顶点固定在原点）',
    s1eqPre: '当前方程',
    s1zeroBtn: 'a = 0 会怎样？',
    s1zeroBack: '回到 a ≠ 0',
    s1roThin: 'a = {a}（比 1 大）：开口向上，比原型<b>瘦</b>——同样的 x，y 是原型的 {a} 倍，窜得更快。',
    s1roFat: 'a = {a}（在 0 和 1 之间）：开口向上，比原型<b>胖</b>——同样的 x，y 只有原型的 {a} 倍，涨得慢。',
    s1roOne: 'a = 1：这就是原型 y = x² 本人，虚线和实线完全重合。',
    s1roNegThin: 'a = {a}（比 −1 还小）：开口翻到<b>向下</b>；胖瘦看 |a| = {abs}（比 1 大），比原型瘦。',
    s1roNegFat: 'a = {a}（在 −1 和 0 之间）：开口翻到<b>向下</b>；胖瘦看 |a| = {abs}（比 1 小），比原型胖。',
    s1roNegOne: 'a = −1：开口向下的原型——像把 y = x² 关于 x 轴翻了个个儿。',
    s1roZero: 'a = 0：x² 项被乘成了 0，y 恒等于 0，图象就是 x 轴这条<b>直线</b>——不再是抛物线。所以二次函数立下规矩：<b>a 必须不为 0</b>。',
    s1conc: '形如 y = ax²（a ≠ 0）这样、最高次是 2 次的函数，叫<b>二次函数</b>（quadratic function）；它的图象就是一条抛物线。',
    s1hint: '规律收口：a 的<b>符号</b>定开口方向（正向上、负向下），<b>|a|</b> 定胖瘦（|a| 越大越瘦、越小越胖）。判断胖瘦永远拿虚线原型 y = x² 当尺子比。',

    s2k: '第 2 步 · 顶点搬家',
    s2t: '顶点式：让抛物线搬家，顶点写在脸上',
    s2e: '这一步要回答：把整条抛物线搬个家，式子怎么跟着改？式子写成 <b>y = a(x − h)² + k</b> 的样子，叫<b>顶点式</b>：h 管左右搬、k 管上下搬，搬到哪，顶点 (h, k) 就跟到哪。顶点所在的竖线 x = h 是整条弧线的<b>对称轴</b>——让左右两边镜像对称的那条线。拖 h、k 两个滑杆，看顶点、对称轴和式子一起动。',
    s2aLab: '开口方向 a',
    s2aUp: 'a = 1（开口向上）',
    s2aDown: 'a = −1（开口向下）',
    s2hLab: 'h（顶点左右搬）',
    s2kLab: 'k（顶点上下搬）',
    s2eqPre: '顶点式',
    s2ro: '顶点 <b>({h}, {k})</b> 就写在式子里：括号里的 h 是顶点的横坐标，末尾的 k 是纵坐标。对称轴是竖线 <b>x = {h}</b>，顶点正好在这条线上。图上标出的一对点 ({lx}, {y}) 与 ({rx}, {y})：离对称轴一样远（都是 2 格），高度也一样——这就是「左右对称」看得见的样子。',
    s2hint: '书写约定（和一次函数页同一套）：h 是负数时，(x − h) 写成 (x + |h|)，比如 h = −1 写 (x + 1)²——读式子时顶点的横坐标是 <b>−1</b>，别被加号骗了。顶点式适用于任何抛物线：只要知道顶点和开口，式子就定下来了。',
    cAxisLab: '对称轴 x = {h}',

    s3k: '第 3 步 · 落点与交点',
    s3t: '落点与交点：弧线在哪里碰到地面',
    s3e: '这一步要回答：抛物线和 x 轴（地面）交在哪里、有几个交点？交点就是 y = 0 的地方——投篮情境里，球落地的那一刻。拖 h、k 滑杆或切换开口方向，把弧线摆出两交点、一交点、无交点三种情形；再点（或拖动）弧线放一面探针旗，逐点看高度。',
    s3aLab: '开口方向 a',
    s3aUp: 'a = 1（开口向上）',
    s3aDown: 'a = −1（开口向下）',
    s3hLab: 'h（顶点左右）',
    s3kLab: 'k（顶点上下）',
    s3eqPre: '这条抛物线',
    s3roTwo: '与 x 轴有 <b>两个交点</b>：({x1}, 0) 和 ({x2}, 0)。交点就是 y = 0 的地方——放到投篮情境里，右边的那个就是球的<b>落点</b>。',
    s3roOne: '与 x 轴只有 <b>一个交点</b>：({x}, 0)——顶点正好压在轴上，弧线只和轴碰一下（相切），不多也不少。',
    s3roNoneAbove: '与 x 轴<b>没有交点</b>：整条弧线都在轴的上方，y 永远大于 0，落不了地。',
    s3roNoneBelow: '与 x 轴<b>没有交点</b>：整条弧线都在轴的下方，y 永远小于 0，碰不到轴。',
    s3probeIdle: '点（或拖动）图上的弧线放一面探针旗：看任意 x 处弧线有多高，旗子插到 y = 0 处就是交点。',
    s3probe: '探针在 x = {x}：弧线高 y = <b>{y}</b>。{tail}',
    s3tailZero: '正好为 0——旗子正插在交点上！',
    s3tailPos: '还在 x 轴上方，没有落地。',
    s3tailNeg: '已经在 x 轴下方了——真实投篮不会钻到地面以下，这里只是把图画全给你看。',
    s3hint: '交点个数只看弧线和轴的相对位置：穿过去 = 2 个，顶点压轴 = 1 个，够不着 = 0 个。以后会学到一个专门判断交点个数的式子，到时候回头看这一页的图就全明白了。这一页先练读图：交点是读出来的，不用背判法。',
    cGround: '地面（y = 0）',
    cGroundS: '地面',

    s4k: '第 4 步 · 自测',
    s4t: '自测：选式子、摆弧线、读投篮图',
    s4e: '三道题，分别考读顶点、摆顶点式、读交点。做错不要紧，反馈会告诉你该回头看哪一步。',
    q1t: '题 1 · 看图选式子',
    q1d: '图上这条抛物线：顶点在 (2, 1)，开口向下。它的顶点式是哪一个？先读顶点，再读开口方向。',
    q1ok: '✓ 对了：顶点 (2, 1) → 式子里是 (x − 2)² + 1；开口向下 → a 取负。拼起来就是 y = −(x − 2)² + 1。',
    q1no: '✗ 还不对。先读顶点：括号里是 (x − 2) 还是 (x + 2)？再读开口：向下时 a 是正还是负？',
    q2t: '题 2 · 把弧线摆出来',
    q2d: '用开口方向按钮和两个滑杆，让实线和目标完全重合：顶点 (−1, 3)、开口向下（虚线是目标位置）。判定是精确的：a 的符号、h、k 全对上才算数。',
    q2aLab: '你的开口方向 a',
    q2aUp: 'a = 1（开口向上）',
    q2aDown: 'a = −1（开口向下）',
    q2hLab: '你的 h（顶点横坐标）',
    q2kLab: '你的 k（顶点纵坐标）',
    q2cur: '你现在的式子：{eq}',
    q2ok: '✓ 严丝合缝！a = −1、h = −1、k = 3，实线和目标完全重合。',
    q2hintA: '还没对上：第一处差在<b>开口方向</b>——目标开口向下，先把 a 切到 −1，开口对了再调顶点位置。',
    q2hintH: '还没对上：开口方向已对，差在<b>顶点左右位置 h</b>——目标顶点在 h = −1 处，拖 h 滑杆把顶点左右对位。',
    q2hintK: '还没对上：开口和左右都对了，只差<b>顶点高度 k</b>——目标顶点在 k = 3 处，拖 k 滑杆把顶点上下对位。',
    q3t: '题 3 · 投篮读图',
    q3d: '这条弧线是 y = −½(x − 4)² + 8：球从地面 (0, 0) 投出，弧线上的圆点是整数横坐标处的高度。点一个圆点当探针，回答下面两问。',
    q3aBtn: '问一：最高点几米？',
    q3bBtn: '问二：球在几米处落地？',
    q3aIdle: '问一：把探针点到弧线的最高处。',
    q3aWrong: '探针在 ({x}, {y})：这还不是最高点——沿着弧线往最高处（顶点）走。',
    q3aOk: '✓ 对：最高点就是顶点 (4, 8)，最高 <b>8 米</b>。',
    q3bIdle: '问二：把探针点到球落地的地方——y 回到 0，而且不是出发点。',
    q3bStart: '这是出发点 (0, 0)：球从这里投出。落地是另一头同样 y = 0 的地方。',
    q3bWrong: '探针在 ({x}, {y})：还没落地——落地时 y 应该正好等于 0。',
    q3bOk: '✓ 对：球在水平距离 <b>8 米</b>处落地——(8, 0) 是弧线与 x 轴的另一个交点。',
    s4hint: '三道题用的是同一套工具：从图上读顶点、开口和交点，再和式子对上号。哪道错了，就回到对应的那一步再拖一遍。',

    s5k: '第 5 步 · 终章',
    s5t: '一条弧线，全写在式子里',
    s5e: '回头看这一页：抛物线之所以能用一行顶点式写完，是因为它要交代的事也不多——开口的方向和胖瘦、顶点在哪里。剩下的每一点，都被这几件事唯一确定。',
    c1h: 'a 管方向与胖瘦',
    c1: 'a 的符号定开口（正向上、负向下），|a| 定胖瘦（越大越瘦）。a = 0 时弧线塌成直线，所以二次函数要求 a ≠ 0。',
    c2h: '顶点式把顶点写在脸上',
    c2: 'y = a(x − h)² + k：顶点 (h, k) 直接读，对称轴就是 x = h。一般的抛物线都能写成顶点式——先找到顶点，式子就有了骨架。',
    c3h: '交点是落点',
    c3: '抛物线与 x 轴的交点就是 y = 0 的地方，个数只有 2、1、0 三种：穿过、相切、够不着。投篮的落点、喷泉的落水点，都是交点。',
    s5fin: '补一句课本口径：常见的一般式 y = ax² + bx + c 和顶点式是同一条抛物线的两种写法——把顶点式展开、合并同类项就是一般式；反过来把一般式改写回顶点式（配方）是后面的功夫，这一页先把图象和顶点式对上号。',
    s5lkLin: '回看直线：一次函数第 0 步里，每步抬高恒定，点排成直线；这里抬高量一步一变，点就弯成了抛物线——去对照着看 →',
    s5lkPyth: '坐标的另一件本事：勾股定理第 5 步用坐标量两点之间的距离——顶点、交点都读出来以后，还能算它们彼此隔多远 →'
  },
  en: {
    docTitle: 'Quadratic Functions & the Parabola · The Arc of a Shot — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Quadratic Functions & the Parabola · The Arc of a Shot',
    tagline: 'The arc of a basketball shot is a parabola: in y = ax², a sets which way it opens and how fat it is; slide the whole arc around and its vertex (the highest or lowest point) travels with it. Written in vertex form, the equation shows you the vertex, the axis of symmetry, and the ground crossings — all readable straight off the formula.',
    nav0: '0 The Shot', nav1: '1 What a Does', nav2: '2 Moving the Vertex', nav3: '3 Landings & Crossings', nav4: '4 Self-check', nav5: '5 Wrap-up',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Quadratic Functions & the Parabola 二次函数与抛物线 — One Interaction at a Time series',

    s0k: 'Step 0 · The Shot',
    s0t: 'The shot: join the ball’s position every 0.1 seconds',
    s0e: 'This step answers: once the ball leaves the hand, where is it every 0.1 seconds? Drop those positions as points, one by one, and join them — what shape appears? Press “Shoot” and watch the points land: the horizontal axis is time (seconds), the vertical axis is height (metres). Afterwards you can switch the horizontal axis to horizontal distance and look at the same points again.',
    s0modeT: 'Horizontal axis: time',
    s0modeD: 'Horizontal axis: distance',
    s0play: 'Shoot ▶',
    s0pause: 'Pause ⏸',
    s0resume: 'Resume ▶',
    s0replay: 'Shoot again ↻',
    s0prog: 'Points down: {n} / 14',
    s0ptT: 'Point {n}: time {x} s, height <b>{y}</b> m',
    s0ptD: 'Point {n}: horizontal distance {x} m, height <b>{y}</b> m',
    s0roIdle: 'Press “Shoot”: the ball leaves the hand and a position point drops every 0.1 seconds. Pause any time to inspect a moment.',
    s0roDoneT: 'All 14 points are down, and joined up they form an arc that rises, then falls, with exactly one highest point: at 0.5 s, 3.25 m high. An arc with a single peak (or a single lowest point) like this is called a <b>parabola</b>; the highest (or lowest) point is its <b>vertex</b>.',
    s0roDoneD: 'All 14 points are down, and joined up they form an arc that rises, then falls, with exactly one highest point: at a horizontal distance of 2 m, 3.25 m high. An arc with a single peak (or a single lowest point) like this is called a <b>parabola</b>; the highest (or lowest) point is its <b>vertex</b>.',
    s0hint: 'Both horizontal axes draw the same single shot: the ball’s horizontal speed is constant, so horizontal distance is proportional to time. Switching the axis to distance stretches the points sideways — still the arc of the same shot, still a parabola, but the picture is pulled wider, so it looks fatter than in the time view (a sideways stretch effectively swaps in a different a in the equation — exactly what Step 1 is about). The facts do not change: the vertex height, and which moment of the shot each point stands for. Watch the order of events: <strong>first the points appearing one by one (the phenomenon), then the shape they join into</strong>.',
    cTime: 'Time (s)',
    cDist: 'Horizontal distance (m)',
    cHeight: 'Height (m)',
    cVertex: 'Vertex',

    s1k: 'Step 1 · What a Does',
    s1t: 'y = ax²: a sets the opening and the fatness',
    s1e: 'This step answers: in the simplest parabola, y = ax², what changes when you change a? Drag the slider and compare the solid curve with the dashed prototype y = x² — fatter or thinner, opening up or down. For now the vertex stays pinned at the origin.',
    s1aLab: 'Values of a (vertex pinned at the origin)',
    s1eqPre: 'Current equation',
    s1zeroBtn: 'What if a = 0?',
    s1zeroBack: 'Back to a ≠ 0',
    s1roThin: 'a = {a} (bigger than 1): opens upward, and <b>thinner</b> than the prototype — at the same x, y is {a} times the prototype’s, so it climbs faster.',
    s1roFat: 'a = {a} (between 0 and 1): opens upward, and <b>fatter</b> than the prototype — at the same x, y is only {a} times the prototype’s, so it climbs slowly.',
    s1roOne: 'a = 1: this is the prototype y = x² itself — dashed and solid curves coincide exactly.',
    s1roNegThin: 'a = {a} (below −1): the opening flips <b>downward</b>; fatness is read from |a| = {abs} (bigger than 1), so it is thinner than the prototype.',
    s1roNegFat: 'a = {a} (between −1 and 0): the opening flips <b>downward</b>; fatness is read from |a| = {abs} (smaller than 1), so it is fatter than the prototype.',
    s1roNegOne: 'a = −1: the prototype flipped downward — like y = x² reflected in the x-axis.',
    s1roZero: 'a = 0: the x² term is multiplied away to 0, y is constantly 0, and the graph is the x-axis — a <b>straight line</b>, not a parabola. So quadratic functions lay down a rule: <b>a must not be 0</b>.',
    s1conc: 'A function whose highest power is 2, like y = ax² with a ≠ 0, is called a <b>quadratic function</b>; its graph is a parabola.',
    s1hint: 'The rule, wrapped up: the <b>sign</b> of a sets the opening (positive up, negative down), and <b>|a|</b> sets the fatness (bigger |a|, thinner; smaller |a|, fatter). Always judge fatness against the dashed prototype y = x².',

    s2k: 'Step 2 · Moving the Vertex',
    s2t: 'Vertex form: move the parabola, the vertex is written on its face',
    s2e: 'This step answers: move the whole parabola somewhere else — how does the equation change? Written as <b>y = a(x − h)² + k</b>, the equation is in <b>vertex form</b>: h slides it left and right, k slides it up and down, and the vertex (h, k) follows. The vertical line x = h through the vertex is the arc’s <b>axis of symmetry</b> — the line the two sides mirror across. Drag the h and k sliders and watch vertex, axis and equation move together.',
    s2aLab: 'Opening direction a',
    s2aUp: 'a = 1 (opens up)',
    s2aDown: 'a = −1 (opens down)',
    s2hLab: 'h (slide the vertex left/right)',
    s2kLab: 'k (slide the vertex up/down)',
    s2eqPre: 'Vertex form',
    s2ro: 'The vertex <b>({h}, {k})</b> is written right in the equation: the h inside the brackets is the vertex’s horizontal coordinate, the k at the end is its vertical coordinate. The axis of symmetry is the vertical line <b>x = {h}</b>, and the vertex sits exactly on it. The marked pair of points ({lx}, {y}) and ({rx}, {y}) are the same distance from the axis (2 units each) and at the same height — symmetry you can see.',
    s2hint: 'Writing convention (the same set as on the linear-functions page): when h is negative, (x − h) is written (x + |h|) — for example h = −1 is written (x + 1)². When reading the equation, the vertex’s horizontal coordinate is then <b>−1</b>; do not let the plus sign fool you. Vertex form works for any parabola: know the vertex and the opening, and the equation is fixed.',
    cAxisLab: 'Axis x = {h}',

    s3k: 'Step 3 · Landings & Crossings',
    s3t: 'Landings & crossings: where the arc meets the ground',
    s3e: 'This step answers: where does a parabola cross the x-axis (the ground), and how many crossings are there? A crossing is a place where y = 0 — in the shot story, the moment the ball lands. Drag the h and k sliders or switch the opening direction to produce all three cases — two crossings, one crossing, none — then click (or drag along) the arc to plant a probe flag and read heights point by point.',
    s3aLab: 'Opening direction a',
    s3aUp: 'a = 1 (opens up)',
    s3aDown: 'a = −1 (opens down)',
    s3hLab: 'h (vertex left/right)',
    s3kLab: 'k (vertex up/down)',
    s3eqPre: 'This parabola',
    s3roTwo: 'It crosses the x-axis at <b>two points</b>: ({x1}, 0) and ({x2}, 0). A crossing is where y = 0 — in the shot story, the right-hand one is the ball’s <b>landing point</b>.',
    s3roOne: 'It touches the x-axis at exactly <b>one point</b>: ({x}, 0) — the vertex sits right on the axis, and the arc just grazes it (tangent), no more, no less.',
    s3roNoneAbove: 'It <b>never crosses</b> the x-axis: the whole arc stays above the axis, y is always greater than 0, and there is no landing.',
    s3roNoneBelow: 'It <b>never crosses</b> the x-axis: the whole arc stays below the axis, y is always less than 0, and it never reaches the axis.',
    s3probeIdle: 'Click (or drag along) the arc to plant a probe flag: read how high the arc is at any x — where the flag lands on y = 0, that is a crossing.',
    s3probe: 'Probe at x = {x}: the arc is at height y = <b>{y}</b>. {tail}',
    s3tailZero: 'Exactly 0 — the flag is planted right on a crossing!',
    s3tailPos: 'Still above the x-axis; it has not landed.',
    s3tailNeg: 'Already below the x-axis — a real shot never sinks underground; the graph is drawn in full here just so you can see it.',
    s3hint: 'The number of crossings depends only on how the arc sits relative to the axis: passing through = 2, vertex on the axis = 1, out of reach = 0. Later you will meet a formula that decides the count for you; come back to this picture then and it will all make sense. On this page, crossings are read off the graph — no test to memorise.',
    cGround: 'Ground (y = 0)',
    cGroundS: 'Ground',

    s4k: 'Step 4 · Self-check',
    s4t: 'Self-check: pick the equation, place the arc, read a shot graph',
    s4e: 'Three questions — reading a vertex, placing a vertex-form equation, reading crossings. Wrong answers are fine: the feedback tells you which step to revisit.',
    q1t: 'Question 1 · Read the graph, pick the equation',
    q1d: 'The parabola in the picture has its vertex at (2, 1) and opens downward. Which vertex-form equation is it? Read the vertex first, then the opening.',
    q1ok: '✓ Correct: vertex (2, 1) → the equation contains (x − 2)² + 1; opening downward → a is negative. Together: y = −(x − 2)² + 1.',
    q1no: '✗ Not yet. Read the vertex first: is it (x − 2) or (x + 2) in the brackets? Then the opening: downward means a is positive or negative?',
    q2t: 'Question 2 · Place the arc',
    q2d: 'Use the opening buttons and the two sliders until the solid arc lies exactly on the target: vertex (−1, 3), opening downward (the dashed arc is the target). The check is exact: the sign of a, h and k all have to match.',
    q2aLab: 'Your opening direction a',
    q2aUp: 'a = 1 (opens up)',
    q2aDown: 'a = −1 (opens down)',
    q2hLab: 'Your h (vertex’s horizontal coordinate)',
    q2kLab: 'Your k (vertex’s vertical coordinate)',
    q2cur: 'Your equation right now: {eq}',
    q2ok: '✓ A perfect fit! a = −1, h = −1, k = 3 — the solid arc coincides with the target.',
    q2hintA: 'Not there yet: the first mismatch is the <b>opening</b> — the target opens downward, so switch a to −1 first, then adjust the vertex position.',
    q2hintH: 'Not there yet: the opening is right, and the mismatch is <b>h, the vertex’s left-right position</b> — the target vertex sits at h = −1, so slide h to line the vertex up.',
    q2hintK: 'Not there yet: the opening and the left-right position are both right, and only <b>k, the vertex’s height</b>, is off — the target vertex sits at k = 3, so slide k to finish.',
    q3t: 'Question 3 · Read a shot graph',
    q3d: 'This arc is y = −½(x − 4)² + 8: the ball is shot from the ground at (0, 0), and the dots on the arc are its heights at whole-number horizontal positions. Click a dot as a probe and answer the two questions.',
    q3aBtn: 'Q1: How high is the highest point?',
    q3bBtn: 'Q2: Where does the ball land?',
    q3aIdle: 'Q1: Put the probe on the highest point of the arc.',
    q3aWrong: 'The probe is at ({x}, {y}): not the highest point yet — walk along the arc towards the top (the vertex).',
    q3aOk: '✓ Right: the highest point is the vertex (4, 8) — <b>8 m</b> high.',
    q3bIdle: 'Q2: Put the probe where the ball lands — where y is back to 0, and not at the launch point.',
    q3bStart: 'That is the launch point (0, 0): the ball leaves from here. The landing is the other place where y = 0.',
    q3bWrong: 'The probe is at ({x}, {y}): not landed yet — at the landing, y should be exactly 0.',
    q3bOk: '✓ Right: the ball lands <b>8 m</b> away — (8, 0) is the arc’s other crossing with the x-axis.',
    s4hint: 'All three questions use the same toolkit: read the vertex, the opening and the crossings off the graph, then match them to the equation. Missed one? Go back to its step and drag it once more.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One arc, fully written in one equation',
    s5e: 'Looking back: a parabola can be written as a single vertex-form equation because it has only a few things to declare — which way it opens and how fat it is, and where its vertex sits. Every other point is then uniquely fixed by those choices.',
    c1h: 'a sets direction and fatness',
    c1: 'The sign of a sets the opening (positive up, negative down); |a| sets the fatness (bigger, thinner). At a = 0 the arc collapses into a straight line — which is why quadratic functions require a ≠ 0.',
    c2h: 'Vertex form wears the vertex on its face',
    c2: 'y = a(x − h)² + k: read the vertex (h, k) straight off, and the axis of symmetry is x = h. Any parabola can be written in vertex form — find the vertex, and the equation has its skeleton.',
    c3h: 'Crossings are landings',
    c3: 'Where a parabola crosses the x-axis is where y = 0, and the count is only ever 2, 1 or 0: passing through, grazing, out of reach. A shot’s landing point, a fountain’s splash-down point — all crossings.',
    s5fin: 'A note on textbook forms: the common general form y = ax² + bx + c and vertex form are two writings of the same parabola — expand the vertex form and collect like terms and you get the general form; rewriting the general form back into vertex form (completing the square) is a skill for later. This page first matches the graph to the vertex form.',
    s5lkLin: 'Look back at lines: in Step 0 of the linear-functions page, a constant rise per step lined the points up straight; here the rise changes from step to step, and the points bend into a parabola — go compare →',
    s5lkPyth: 'Another coordinate skill: Step 5 of the Pythagorean page measures the distance between two points with coordinates — once you can read off vertices and crossings, you can also measure how far apart they are →'
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
    el.textContent = t(el.getAttribute('data-i18n'));
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
