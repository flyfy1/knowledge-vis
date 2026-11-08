'use strict';
/* ============================================================
   一次函数 · 斜率是陡缓，截距是起点 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    geometryTitle: "下一站 · 同一斜率怎样决定小孔倒像？",
    geometryIntro: "这张图用 y=kx+b 描述直线。先把 b 调为0，观察直线穿过原点。换到光路时，以孔心为原点，穿孔直线的截距就是0；物点和像点仍在同一条直线上。相似三角形把对应长度的比联系起来，像的倒转还要看坐标正负。",
    geometryLink: "到小孔课比较斜率、相似比和倒像 →",
    geometryReturn: "看完可用浏览器返回；本步斜率、截距与选中探针随本条历史记录恢复。它们是阅读情境，不是学习掌握记录。",
    docTitle: '一次函数 · 斜率是陡缓，截距是起点 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '一次函数 · 直线与它的方程',
    tagline: 'y = kx + b 不是符号游戏：k 是每走一步抬高多少（坡的陡缓），b 是还没出发就站在多高（起点）。这一页把直线和它那行方程一一对上——拖直线，方程跟着变；拖方程，直线跟着动，你会发现这本来就是同一件事的两面。',
    nav0: '0 爬坡', nav1: '1 起点', nav2: '2 方程长出来', nav3: '3 两条线相遇', nav4: '4 自测', nav5: '5 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 一次函数 Linear Functions —— 一步一交互系列',
    sep: '、',

    s0k: '第 0 步 · 爬坡',
    s0t: '爬坡：每一步抬高一样多，点就排成直线',
    s0e: '这一步要回答：一排台阶，每一级都抬高一样多，把台阶的角连起来是什么样？拖滑杆选「每向前 1 格抬高几格」，看格点一个一个落下（x 从 0 到 5），它们自己会排成什么形状。横轴是向前走的格数 x，纵轴是高度 y。',
    s0kLab: '每向前 1 格，抬高几格',
    s0play: '重新落点 ▶',
    s0roPts: '落下的点：{pts}',
    s0roNone: '点正在一个一个落下……',
    s0roKPos: 'k = {k}：每向前 1 格就抬高 {k} {unit}。这个「每走一步抬高多少」就叫<b>斜率</b>（slope）——它管坡的陡缓：k 越大坡越陡。等步长、等抬高，点必然排成一条<b>直线</b>。',
    s0roKNeg: 'k = {k}：每向前 1 格不是抬高、而是降低 {a} {unit}，坡往下走。这个「每走一步抬高多少」就叫<b>斜率</b>（slope）——斜率为负，就是下坡。等步长、等降低，点照样排成一条<b>直线</b>。',
    s0roKZero: 'k = 0：每走一步抬高 0 格，是<b>平地</b>。平地也是一条直线，它的斜率（每走一步抬高多少）就是 0。',
    s0hint: '结论的适用条件：每一级抬高<b>必须一样多</b>，点才连得成直线。要是每一步抬高得不一样多，连起来就会弯——弯成什么样，是后面抛物线那一页的故事。',

    s1k: '第 1 步 · 起点',
    s1t: '起点：换个高度出发，整条线一起平移',
    s1e: '这一步要回答：同一条坡（陡缓不变，也就是斜率固定为 1），从不同高度出发，直线会有什么不一样？拖滑杆改起点高度，看整条线怎样上下平移，并盯住它和纵轴的交点。',
    s1bLab: '起点高度 b（还没出发、x = 0 时站的高度）',
    s1ro: '直线在 x = 0 处穿过纵轴，交点是 <b>(0, {b})</b>。这个「x = 0 时的 y」就叫<b>截距</b>（intercept），记作 b = {b}：还没出发，就已经站在这个高度了。拖 b 时坡的陡缓（斜率）纹丝不动——b 只管把整条线上下平移。',
    s1hint: '读任何一条直线，先读截距：看它在纵轴上落在哪一点，那个高度就是 b。下一步会把斜率和截距拼成完整的方程。',

    s2k: '第 2 步 · 方程长出来',
    s2t: '把陡缓和起点拼起来：y = kx + b',
    s2e: '这一步要回答：能不能写出一句式子，算出这条线上的每一个点？把第 0 步的斜率 k（每走 1 格抬高多少）和第 1 步的截距 b（x = 0 时的 y）拼起来，就是 <b>y = kx + b</b>。像这样「x 定下来，y 就被唯一确定」的对应关系，叫<b>函数</b>（function）。拖两个滑杆，线和方程一起变；再点直线上的格点，逐项验算给你看。',
    s2kLab: '斜率 k（每走 1 格抬高多少）',
    s2bLab: '截距 b（x = 0 时的 y）',
    s2eqPre: '这条线的方程',
    s2probeIdle: '点直线上的圆点（或用下面两个按钮换点），看代入验算：把点的 x 代进方程，算出的 y 应该正好是这个点的 y。',
    s2probeFar: '离直线太远了——请点贴在直线上的圆点。',
    s2probe: '验算点 <b>({x}, {y})</b>：{arith} ✓ 算出的 y 正好是点的纵坐标——这个点确实在直线上；这样的点有无数个，全都满足同一个方程。',
    s2prev: '← 上一个点',
    s2next: '下一个点 →',
    s2hint: '方程是这条线的「说明书」。书写约定：k = 1 时不写系数（写 x 不写 1x）；k = −1 写 −x；b = 0 时不写出来；b 为负写成减一个数。',

    s3k: '第 3 步 · 两条线相遇',
    s3t: '两条线相遇：交点是共同的解',
    s3e: '这一步要回答：两条直线什么时候相交、交点又是什么意思？第一条线固定为 y = x + 1；拖滑杆改第二条线的斜率 k₂（陡缓）和截距 b₂（起点高度），看它们在哪里相遇——或者根本不相遇。两条线共同的那个点，叫<b>交点</b>（intersection point）。',
    s3l1: '第一条线（固定）：{eq}',
    s3k2Lab: '第二条线的斜率 k₂（陡缓）',
    s3b2Lab: '第二条线的截距 b₂（起点高度）',
    s3l2: '第二条线：{eq}',
    s3roPoint: '交点是 <b>({x}, {y})</b>：它同时在两条线上——把 x = {x} 分别代入两个方程，算出的 y 都是 {y}。所以交点就是两个方程<b>共同的解</b>。',
    s3roParallel: '两条线<b>平行</b>：斜率相同（都是 1），截距不同，怎么延长都不会相遇——两个方程没有共同的解。',
    s3roCoincident: '两条线<b>完全重合</b>：斜率、截距全都相同，其实就是同一条线——线上的每一个点都是交点，有无数个共同的解。',
    s3hint: '判断口诀：先比斜率——斜率不同，必相交于一点；斜率相同，再比截距——相同则重合，不同则平行。',

    s4k: '第 4 步 · 自测',
    s4t: '自测：看图、摆线、读价目表',
    s4e: '三道题，分别考读图、摆线和读实际价目。做错不要紧，反馈会告诉你该回头看哪一步。',
    q1t: '题 1 · 看图选方程',
    q1d: '这条直线的方程是哪一个？自己看图读一读：它和纵轴交在哪一点（那就是截距），往右走时是往上还是往下（那就是斜率的正负）。',
    q1ok: '✓ 对了：先读截距——线和纵轴交在 (0, 2)，b = 2；再读斜率——往右走往下掉，k = −1。拼起来就是 y = −x + 2。',
    q1no: '✗ 还不对。先看图：它和纵轴交在哪一点（那是截距 b）？往右走时往上还是往下（那是斜率 k 的正负）？',
    q2t: '题 2 · 把线摆出来',
    q2d: '拖两个滑杆，让实线和目标 <b>y = 2x − 1</b> 完全重合（虚线就是目标位置）。判定是精确的：斜率、截距都对上才算数。',
    q2kLab: '你的斜率 k（陡缓）',
    q2bLab: '你的截距 b（起点高度）',
    q2cur: '你现在的线：{eq}',
    q2ok: '✓ 严丝合缝！k = 2、b = −1，实线和目标完全重合。',
    q2hint: '还没对上：斜率管陡缓、截距管整条线的上下。先把陡缓调对，再平移找截距。',
    q3t: '题 3 · 出租车计价',
    q3d: '计价规则：一上车先付<b>起步价 8 元</b>（x = 0 时就付的钱，就是截距 b = 8），之后<b>每公里 3 元</b>（每多走 1 公里多付 3 元，就是斜率 k = 3）。所以车费 = 3 × 公里数 + 8。图上的每个点是一次行程：（公里数，车费）。点图上的点来回答下面两问。',
    q3aBtn: '问一：坐 3 公里多少钱？',
    q3bBtn: '问二：付 20 元能坐几公里？',
    q3aIdle: '问一：找到「3 公里」的那个点，点它。',
    q3aWrong: '这个点是 {x} 公里、车费 {fare} 元（车费 = 3 × {x} + 8 = {fare}）。题目问的是 3 公里，再找找。',
    q3aOk: '✓ 对：3 公里，车费 = 3 × 3 + 8 = <b>17 元</b>。在图上就是横坐标为 3 的那个点。',
    q3bIdle: '问二：反过来找——哪个点的车费正好是 20 元？点它。',
    q3bWrong: '这个点是 {x} 公里、车费 {fare} 元。目标是 20 元，沿着点列再找找。',
    q3bOk: '✓ 对：20 元先扣掉起步价 8 元，剩 12 元；每公里 3 元，12 ÷ 3 = <b>4 公里</b>。正着问用乘法（代入验算），反着问就用除法倒推。',
    s4hint: '三道题用的是同一件工具：斜率、截距、代入验算。哪道错了，就回到对应的那一步再拖一遍。',
    cKm: '公里数', cFare: '车费（元）',

    s5k: '第 5 步 · 终章',
    s5t: '一张说明书，管住一条线',
    s5e: '回头看这一页：一条直线之所以能用一行方程写完，是因为它只有两件事要交代——有多陡、从哪开始。剩下的每一个点，都被这两件事唯一确定。',
    c1h: '斜率 k = 陡缓',
    c1: '每向前 1 格抬高多少。大了更陡、负了下坡、0 是平地。要是每一步抬高得不一样多，点就连成曲线——那是接下来抛物线那一页的故事。',
    c2h: '截距 b = 起点',
    c2: 'x = 0 时的 y，还没出发就站在多高。改 b 不改陡缓，只把整条线上下平移。生活里到处是 b：起步价、底薪、固定月费。',
    c3h: '交点 = 共同解',
    c3: '两条线相遇的点，同时满足两个方程。斜率不同才相交；相同则平行或重合。以后解方程组，找的就是这个点。',
    s5fin: '直线是所有函数的起点：先把「一个量怎样随另一个量变」看成图，再写成式子，最后用式子去算图上没画出来的点——这条路，通向后面所有的函数。',
    s5lkPyth: '坐标的下一站：勾股定理第 5 步把坐标用来量两点之间的距离——距离公式，其实就是勾股定理穿上坐标的衣服 →'
  },
  en: {
    geometryTitle: "Next · how does the same slope determine a pinhole image?",
    geometryIntro: "This plot describes a line with y=kx+b. Set b to0 and observe the line passing through the origin. In a ray diagram, place the origin at the hole: a line through it has intercept0. Object and image points remain on that same line. Similar triangles relate corresponding length ratios, while coordinate signs explain inversion.",
    geometryLink: "Compare slope, similar ratios and inversion in the pinhole lesson →",
    geometryReturn: "Use browser Back after inspecting it. This history entry retains this step’s slope, intercept and selected probe as reading context, not a record of learning or mastery.",
    docTitle: 'Linear Functions · Slope Is Steepness, Intercept Is the Start — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Linear Functions · A Line and Its Equation',
    tagline: 'y = kx + b is not symbol juggling: k is how much you rise for each step forward (the steepness of the ramp), and b is how high you already stand before moving (the starting height). This page matches every line to its equation one-to-one — drag the line and the equation follows; drag the equation and the line follows. Two views of the same thing.',
    nav0: '0 The Ramp', nav1: '1 The Start', nav2: '2 The Equation', nav3: '3 Two Lines Meet', nav4: '4 Self-check', nav5: '5 Wrap-up',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Linear Functions 一次函数 — One Interaction at a Time series',
    sep: ', ',

    s0k: 'Step 0 · The Ramp',
    s0t: 'The ramp: rise the same at every step, and the points line up',
    s0e: 'This step answers: a flight of stairs where every step rises by the same amount — what shape do you get by joining the corners? Drag the slider to choose "how many units up per 1 unit forward" and watch the lattice points drop in one by one (x from 0 to 5). The horizontal axis is steps forward x; the vertical axis is height y.',
    s0kLab: 'Units risen per 1 unit forward',
    s0play: 'Drop the points again ▶',
    s0roPts: 'Points so far: {pts}',
    s0roNone: 'The points are dropping in, one by one…',
    s0roKPos: 'k = {k}: every 1 unit forward rises {k} {unit}. This "rise per step forward" is called the <b>slope</b> — it sets how steep the ramp is: bigger k, steeper ramp. Equal steps, equal rises: the points cannot help forming a <b>straight line</b>.',
    s0roKNeg: 'k = {k}: every 1 unit forward does not rise but drops {a} {unit} — the ramp runs downhill. This "rise per step forward" is called the <b>slope</b> — a negative slope means downhill. Equal steps, equal drops: still a <b>straight line</b>.',
    s0roKZero: 'k = 0: every step rises 0 units — flat ground. Flat ground is a straight line too, and its slope (rise per step forward) is 0.',
    s0hint: 'When this holds: the rise must be the <b>same at every step</b> for the points to form a line. If each step rises by a different amount, the points bend into a curve — what curve is the story of the parabola page, coming later.',

    s1k: 'Step 1 · The Start',
    s1t: 'The start: set off higher, and the whole line slides',
    s1e: 'This step answers: the same ramp (steepness unchanged — the slope stays 1), but starting from a different height — what changes? Drag the slider to change the starting height, watch the whole line slide up or down, and keep your eye on where it crosses the vertical axis.',
    s1bLab: 'Starting height b (how high you stand at x = 0, before moving)',
    s1ro: 'At x = 0 the line crosses the vertical axis at <b>(0, {b})</b>. This "value of y when x = 0" is called the <b>intercept</b>, written b = {b}: before you move at all, you already stand at this height. Dragging b never changes the steepness (the slope) — b only slides the whole line up or down.',
    s1hint: 'Reading any line, read the intercept first: where it lands on the vertical axis is b. In the next step, slope and intercept combine into the full equation.',

    s2k: 'Step 2 · The Equation Appears',
    s2t: 'Slope plus start, spelled out: y = kx + b',
    s2e: 'This step answers: can one formula compute every point on the line? Put together the slope k from Step 0 (rise per 1 unit forward) and the intercept b from Step 1 (the value of y at x = 0), and you get <b>y = kx + b</b>. A rule where "once x is fixed, y is uniquely determined" like this is called a <b>function</b>. Drag both sliders — line and equation move together — then click a lattice point on the line to check the arithmetic item by item.',
    s2kLab: 'Slope k (rise per 1 unit forward)',
    s2bLab: 'Intercept b (the value of y at x = 0)',
    s2eqPre: 'The equation of this line',
    s2probeIdle: 'Click a dot on the line (or step through points with the buttons below) to substitute and check: plug the point’s x into the equation, and the y that comes out should be exactly the point’s y.',
    s2probeFar: 'Too far from the line — click one of the dots sitting on the line.',
    s2probe: 'Checking point <b>({x}, {y})</b>: {arith} ✓ The computed y is exactly the point’s height — this point really is on the line, and so are infinitely many others, all satisfying the same equation.',
    s2prev: '← Previous point',
    s2next: 'Next point →',
    s2hint: 'The equation is the line’s instruction sheet. Writing conventions: k = 1 drops the coefficient (write x, not 1x); k = −1 is written −x; b = 0 is left out; a negative b is written as subtracting a number.',

    s3k: 'Step 3 · Two Lines Meet',
    s3t: 'When two lines meet: the crossing is a shared solution',
    s3e: 'This step answers: when do two lines cross, and what does the crossing mean? The first line is fixed at y = x + 1. Drag the sliders to change the second line’s slope k₂ (steepness) and intercept b₂ (starting height), and watch where they meet — or whether they never do. The point that belongs to both lines is called their <b>intersection point</b>.',
    s3l1: 'First line (fixed): {eq}',
    s3k2Lab: 'Second line’s slope k₂ (steepness)',
    s3b2Lab: 'Second line’s intercept b₂ (starting height)',
    s3l2: 'Second line: {eq}',
    s3roPoint: 'The intersection is <b>({x}, {y})</b>: it lies on both lines — plug x = {x} into both equations and both give y = {y}. So the intersection is the <b>shared solution</b> of the two equations.',
    s3roParallel: 'The lines are <b>parallel</b>: same slope (both 1), different intercepts — extend them forever and they never meet. The two equations have no shared solution.',
    s3roCoincident: 'The lines <b>coincide completely</b>: same slope, same intercept — really one and the same line. Every point on it is an intersection: infinitely many shared solutions.',
    s3hint: 'Rule of thumb: compare slopes first — different slopes always cross at exactly one point; equal slopes, compare intercepts — equal means coincident, different means parallel.',

    s4k: 'Step 4 · Self-check',
    s4t: 'Self-check: read a graph, place a line, read a fare chart',
    s4e: 'Three questions — reading a graph, placing a line, reading a real price rule. Wrong answers are fine: the feedback tells you which step to revisit.',
    q1t: 'Question 1 · Read the graph, pick the equation',
    q1d: 'Which equation is this line? Read the graph yourself: where does it cross the vertical axis (that is the intercept), and going right, does it rise or fall (that is the sign of the slope)?',
    q1ok: '✓ Correct: read the intercept first — the line meets the vertical axis at (0, 2), so b = 2; then the slope — it falls going right, so k = −1. Together: y = −x + 2.',
    q1no: '✗ Not yet. Look again: where does it cross the vertical axis (that is the intercept b)? Going right, does it rise or fall (that is the sign of the slope k)?',
    q2t: 'Question 2 · Place the line',
    q2d: 'Drag the two sliders until the solid line lies exactly on the target <b>y = 2x − 1</b> (the dashed line is the target). The check is exact: slope and intercept both have to match.',
    q2kLab: 'Your slope k (steepness)',
    q2bLab: 'Your intercept b (starting height)',
    q2cur: 'Your line right now: {eq}',
    q2ok: '✓ A perfect fit! k = 2, b = −1 — the solid line coincides with the target.',
    q2hint: 'Not there yet: slope sets the steepness, intercept slides the line up or down. Match the steepness first, then slide to the intercept.',
    q3t: 'Question 3 · Taxi fares',
    q3d: 'The fare rule: a <b>flag-fall of 8 yuan</b> the moment you get in (money paid at x = 0 — that is the intercept b = 8), then <b>3 yuan per kilometre</b> (each extra kilometre costs 3 more — that is the slope k = 3). So fare = 3 × kilometres + 8. Each dot on the graph is one trip: (kilometres, fare). Click a dot to answer the two questions.',
    q3aBtn: 'Q1: How much for 3 km?',
    q3bBtn: 'Q2: How far does 20 yuan take you?',
    q3aIdle: 'Q1: Find the "3 kilometres" dot and click it.',
    q3aWrong: 'That dot is {x} km with fare {fare} yuan (fare = 3 × {x} + 8 = {fare}). The question asks about 3 km — keep looking.',
    q3aOk: '✓ Right: 3 km → fare = 3 × 3 + 8 = <b>17 yuan</b>. On the graph it is the dot with horizontal coordinate 3.',
    q3bIdle: 'Q2: Now backwards — which dot has a fare of exactly 20 yuan? Click it.',
    q3bWrong: 'That dot is {x} km with fare {fare} yuan. The target is 20 yuan — search along the dots.',
    q3bOk: '✓ Right: 20 yuan minus the 8-yuan flag-fall leaves 12 yuan; at 3 yuan per kilometre, 12 ÷ 3 = <b>4 km</b>. Forwards is multiplication (substituting to check); backwards is division to undo it.',
    s4hint: 'All three questions use the same toolkit: slope, intercept, and substituting to check. Missed one? Go back to its step and drag it once more.',
    cKm: 'kilometres', cFare: 'Fare (yuan)',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One instruction sheet runs the whole line',
    s5e: 'Looking back: a line can be written as a single equation because it has only two things to declare — how steep it is, and where it starts. Every remaining point is then uniquely fixed by those two choices.',
    c1h: 'Slope k = steepness',
    c1: 'How much you rise per 1 unit forward. Bigger is steeper, negative is downhill, 0 is flat. If each step rose by a different amount, the points would bend into a curve — the story of the parabola page, coming next.',
    c2h: 'Intercept b = the start',
    c2: 'The value of y at x = 0 — how high you stand before moving. Changing b never changes the steepness; it only slides the whole line. Daily life is full of b: flag-falls, base salaries, fixed monthly fees.',
    c3h: 'Intersection = shared solution',
    c3: 'The point where two lines meet satisfies both equations at once. Different slopes cross; equal slopes are parallel or coincident. Later, solving simultaneous equations means hunting for exactly this point.',
    s5fin: 'The line is where all functions begin: first see "how one quantity changes with another" as a graph, then write it as a formula, then use the formula to compute points the graph never drew — the road from here leads to every function that follows.',
    s5lkPyth: 'Next stop for coordinates: Step 5 of the Pythagorean page uses coordinates to measure the distance between two points — the distance formula is the Pythagorean theorem dressed in coordinates →'
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
