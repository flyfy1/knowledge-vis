'use strict';
// Parabola lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '抛物线 · 抬高量在变的曲线',
    back: '← 知识索引',
    compare: '对照另一版本：抛物线 · 投篮的弧线 →',
    navLabel: '抛物线步骤导航',
    tagline: '直线每走一步抬高一样多。要是抬高量本身在一格一格地变，点会连成什么？从一次投篮的轨迹出发，七步里你会认出抛物线，读懂 y = a(x − h)² + k 里的每个字母，再回到球场算出球落在哪里。',
    nav0: '0 投篮的点', nav1: '1 a 管什么', nav2: '2 顶点搬家', nav3: '3 碰不碰 x 轴', nav4: '4 回到球场', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 先看现象',
    s0t: '球每 0.1 秒的位置连起来，是什么形状？',
    s0e: '这一步要回答：把一次投篮里球每隔 0.1 秒的位置描成点，这些点排成什么形状？设定（模拟，不计空气阻力）：球在离地 2 m 处出手，水平方向每秒走 4 m；竖直方向刚出手时每秒上升 7 m，之后被重力越拖越慢。<strong>上图</strong>横轴是离出手点的水平距离（米），纵轴是离地高度（米），每个点就是某一时刻球的位置。<strong>下图</strong>把每个 0.1 秒里球抬高了多少画成一根竖条，向上为正、向下为负。在<a class="xlink" href="../../../math/algebra/linear-functions/#step0">一次函数页第 0 步</a>，每一步抬高一样多，点排成直线；这里的抬高量不再恒定。',
    tSlider: '时间 t（秒）', play0: '从出手开始逐点投出',
    c0a: '球的位置：每 0.1 秒一个点', c0b: '每 0.1 秒抬高了多少（米）',
    lg0Dot: '球的位置', lg0Up: '这 0.1 秒在上升', lg0Down: '这 0.1 秒在下降', lg0Peak: '顶点（最高点）',
    s0progress: '已落下 {c}/{N} 个点。',
    s0readout: '{prog}t = {t} s：球离出手点 {x} m，离地 {y} m。{last}',
    s0last: '最近 0.1 s 抬高了 {r} m，比上一格少 {d} m。',
    s0first: '刚出手，还没有抬高量可比。',
    s0last1: '最近 0.1 s 抬高了 {r} m。',
    s0lastDown: '最近 0.1 s 下降了 {r} m（抬高量为负），比上一格又少了 {d} m。',
    s0rule: '规律：每过 0.1 s，抬高量都比上一格少 {d} m，从 +{r0} m 一路减到负数。抬高量不是恒定的，而是在按固定的量减少。',
    s0peak: '这样先升后降、左右对称、只有一个最高点的弧线叫<strong>抛物线</strong>；最高点叫<strong>顶点</strong>。这一投的顶点：t ≈ {pt} s，离出手点 {px} m，离地 {py} m，正好落在两个点之间。',
    s0hint: '观察顺序：先按「逐点投出」，看上图的点一个个落下、下图的竖条一根根长出来；再拖时间滑杆回看任一时刻。看两件事：下图竖条的顶端排成一条斜直线（每格少同样多）；竖条由正变负的那一格，就是上图弧线越过最高点的地方。',

    s1k: '第 1 步 · 最简单的式子',
    s1t: 'y = a·x² 里的 a 改一改，弧线怎么变？',
    s1e: '这一步要回答：最简单的抛物线式子 y = a·x² 中，数 a 决定了弧线的什么？形如 y = ax² + bx + c（a ≠ 0）的函数叫<strong>二次函数</strong>，它的图像都是抛物线；这一步先看 b、c 都为 0 的情形，此时顶点在原点 (0, 0)。图中横轴是 x、纵轴是 y；灰色虚线 y = x² 一直留在图上，胖瘦就跟它比。橙色台阶画的是：从顶点往右每横走 1 格，y 变了多少。',
    a1Slider: '系数 a',
    c1: '{eq}　（虚线：y = x²）',
    lg1Cur: '当前曲线', lg1Ref: 'y = x²，作对照', lg1Step: '每横走 1 格的抬高', lg1Hist: '刚才试过的 a',
    s1readout: '{eq}：离顶点横走 1、2、3 格，y 依次是 {y1}、{y2}、{y3}（= a、4a、9a）。每格的抬高是 {r1}、{r2}、{r3}，每格比上一格多 {dd}（= 2a），和第 0 步的球一样按固定的量变化。{shape}',
    up: '开口向上', down: '开口向下',
    fatter: '{open}，比 y = x² 胖（|a| < 1，同样横走，抬得少）。',
    thinner: '{open}，比 y = x² 瘦（|a| > 1，同样横走，抬得多）。',
    same: '{open}，和 y = x² 一样胖瘦（|a| = 1）。',
    s1zero: 'a = 0：y = 0·x² 处处为 0，只剩 x 轴这条直线；没有弯，就不是抛物线。所以二次函数要求 a ≠ 0。',
    s1hint: '观察顺序：先把 a 从 1 慢慢拖到 2，再拖到 0.25，只看曲线比虚线 y = x² 瘦了还是胖了；然后拖到负数，看开口翻到向下、台阶改为向下走。淡色曲线是你试过的 a，留下来对比。',

    s2k: '第 2 步 · 顶点式',
    s2t: '式子写成 y = a(x − h)² + k，图怎样搬家？',
    s2e: '这一步要回答：把 y = a·x² 整条搬走后，式子怎么写？写法是 y = a(x − h)² + k，叫<strong>顶点式</strong>：当 x = h 时括号为 0，y 恰好等于 k，所以顶点就在 (h, k)。<strong>对称轴</strong>是穿过顶点的那条竖线 x = h：在它左右等距的两点，高度一样。注意书写：h 为负时，x − (−1) 写成 x + 1。图中虚线是没搬家的 y = a·x²，箭头是从原点到顶点的搬移。',
    hSlider: '左右搬 h', kSlider: '上下搬 k', aSlider: '系数 a',
    c2: '{eq}',
    lg2Cur: '搬家后的曲线', lg2Ghost: '原来的 y = a·x²', lg2Axis: '对称轴 x = h', lg2Pair: '左右各 2 格的一对点', lg2Trail: '顶点走过的位置',
    s2readout: '{eq}：顶点 ({h}, {k})，对称轴 x = {h}。在 x = {xl} 和 x = {xr}（顶点左右各 2 格）处，y 都等于 {ym}。{open}，所以顶点是曲线的{ext}点。',
    lowest: '最低', highest: '最高',
    s2hint: '观察顺序：只拖 h，曲线左右平移，形状不变，括号里的数跟着变（注意加减号）；只拖 k，曲线上下平移；最后改 a，顶点不动，只有胖瘦和开口方向变。绿色两点始终一样高，说明左右对称。淡点记下顶点走过的位置。',

    s3k: '第 3 步 · 与 x 轴的交点',
    s3t: '曲线会碰到 x 轴几次？由什么决定？',
    s3e: '这一步要回答：抛物线和 x 轴有几个交点、在哪里？交点就是 y = 0 的点。用顶点式最好看：顶点在 x 轴上方（k > 0）而开口向上，曲线整个在轴上方，碰不到；开口向下就一定穿过去两次。把 y = 0 代入，a(x − h)² = −k，x = h ± √(−k/a)：根号里是负数就无解。右图横轴是 k、纵轴是交点个数，记录当前 a 下每个 k 的结果。',
    h3Slider: '左右搬 h', k3Slider: '顶点高度 k', a3Slider: '系数 a',
    c3a: '{eq} 与 x 轴', c3b: '交点个数 · 横轴是 k',
    lg3Cur: '曲线', lg3Hit: '与 x 轴的交点', lg3Vertex: '顶点', lg3Tried: '试过的 k',
    s3two: '两个交点：x {x1} 和 x {x2}。顶点在 x 轴{side}（k = {k}）、{open}，曲线必然穿过 x 轴两次，两个交点关于对称轴 x = {h} 对称。',
    s3one: '恰好一个交点：x = {x1}。顶点就在 x 轴上（k = 0），曲线只碰一下就折回去，叫<strong>相切</strong>。',
    s3zero: '没有交点：顶点在 x 轴{side}（k = {k}）、{open}，整条曲线都在 x 轴{side}，碰不到。',
    above: '上方', below: '下方',
    s3hint: '观察顺序：保持 a 不变，把 k 从 −4 慢慢拖到 4，看交点从两个并成一个再消失；右图记下每个 k 的结果，台阶正好在 k = 0 处跳变。再把 a 换成负数重拖一次：台阶翻过来了。最后只拖 h：交点个数不变，只是一起左右挪。',

    s4k: '第 4 步 · 回到球场',
    s4t: '换一种出手，最高几米、落在哪里、进不进？',
    s4e: '这一步要回答：用前三步的工具，把一次投篮写成顶点式，读出它的最高点和落地点。设定同第 0 步（模拟，不计空气阻力，出手高 2 m）；篮筐高 3.05 m，放在第 0 步那一投正好下落穿过 3.05 m 的位置。这时 y 是离地高度（米），x 是离出手点的水平距离（米），所以 y = 0 就是地面，与 x 轴的交点就是<strong>落地点</strong>。式子是由出手速度算出的：顶点 = 最高点，a = −4.9 ÷（水平速度²）。',
    vxSlider: '水平速度（m/s）', vySlider: '竖直出手速度（m/s）', reset4: '恢复第 0 步那一投',
    c4: '水平距离 x（米）· 高度 y（米）',
    lg4Cur: '这一投', lg4Old: '之前几投', lg4Math: '式子在出手前、落地后的延伸', lg4Vertex: '顶点', lg4Land: '落地点', lg4Hoop: '篮筐',
    s4readout: '这一投 ≈ {eq}。最高点：离地 {py} m，在离出手点 {px} m 处。令 y = 0，得 x ≈ {land} m，这就是落地点；另一个解 x ≈ {back} m 在出手点身后，那时球还没出手：式子算得出，球却不在那里。{verdict}',
    made: '经过篮筐所在的竖线（x ≈ {hx} m）时，球离地 {y} m、正在下落，与篮筐高度相差不到 0.1 m：进了！',
    high: '经过篮筐所在的竖线时离地 {y} m，比篮筐高 {d} m：偏高，会打板或飞过。',
    low: '经过篮筐所在的竖线时离地 {y} m，比篮筐低 {d} m：偏短。',
    rising: '经过篮筐所在的竖线时球还在上升（离地 {y} m），只会撞到篮筐下面。',
    s4hint: '观察顺序：先只加大竖直速度，顶点升高、也往右移，落地点变远；再只加大水平速度，弧线被拉长、变胖（|a| 变小）。每一投都会留下淡色轨迹，方便比较。试着找出一组进球的速度：不止一组。',

    s5k: '第 5 步 · 自测',
    s5t: '不看提示，能读懂一条抛物线吗？',
    s5e: '这一步要回答：不靠提示，你能从图读出式子、按式子摆出图、算出与 x 轴的交点吗？三道题各对应第 2、2、3 步；答错会告诉你该回看哪里。',
    q1Prompt: '① 下图这条抛物线的式子是哪一个？',
    q1A: 'y = −(x − 2)² + 1', q1B: 'y = −(x + 2)² + 1', q1C: 'y = (x − 2)² + 1',
    c5a: '第 ① 题的图', c5b: '第 ② 题：你摆出的曲线',
    q2Prompt: '② 用下面的控件摆出一条顶点在 (−1, 3)、开口向下的抛物线，再按「检查」。',
    h5Slider: 'h', k5Slider: 'k', open5Up: '开口向上', open5Down: '开口向下',
    q3Prompt: '③ y = −(x − 1)² + 4 与 x 轴交在哪里？',
    q3A: 'x = 1 和 x = 4', q3B: 'x = −1 和 x = 3', q3C: '没有交点',
    check: '检查',
    q1ok: '对。顶点 (2, 1) 写进括号要变号成 x − 2；开口向下，前面是负号。',
    q1no: '再看看：顶点横坐标是 2，括号里该是 x − 2（x = 2 时为 0）；开口向下，a 要是负数。',
    q2ok: '对。你的式子 {eq}：顶点 (−1, 3)，开口向下。',
    q2no: '还差一点：现在是 {eq}，顶点 ({h}, {k})、{open}。目标是顶点 (−1, 3)、开口向下。',
    q3ok: '对。令 y = 0：(x − 1)² = 4，x − 1 = ±2，所以 x = −1 或 x = 3，关于对称轴 x = 1 对称。',
    q3no: '再算一遍：令 y = 0，得 (x − 1)² = 4，x − 1 = 2 或 −2。顶点 (1, 4) 在 x 轴上方、开口向下，所以一定有两个交点。',
    pick: '先选一个答案。',

    s6k: '第 6 步 · 收束', s6t: '一个式子，三样东西写在脸上',
    s6fin: '<strong>第 0 步</strong>：投篮的点每 0.1 秒的抬高量按固定的量减少，连起来是一条先升后降、左右对称的弧线：抛物线。<strong>第 1 步</strong>：y = a·x² 里 a 的符号定开口方向，|a| 定胖瘦；a = 0 时退化成直线。<strong>第 2 步</strong>：顶点式 y = a(x − h)² + k 直接写出顶点 (h, k) 和对称轴 x = h。<strong>第 3 步</strong>：与 x 轴的交点个数（2、1、0）由顶点在轴的哪一侧、开口朝哪边决定。<strong>第 4 步</strong>：把投篮写成顶点式，最高点是顶点，落地点是与地面的交点。',
    formula: 'y = a(x − h)² + k　(a ≠ 0)\n顶点 (h, k)　对称轴 x = h\n交点：x = h ± √(−k/a)（−k/a ≥ 0 时）',
    boundary: '适用范围：本页的投篮是不计空气阻力的模拟，真实的球会受空气阻力和旋转影响，轨迹只是近似抛物线。顶点式和一般式 y = ax² + bx + c 可以互相改写（配方），本页没有展开；判断交点个数的另一个工具「判别式」会在高中学到。式子在出手前、落地后照样有值，但只有中间那一段描述了真的球。',
    linksTitle: '接着去哪',
    lk1: '→ 一次函数第 0 步：每步抬高一样多，点为什么排成直线',
    lk2: '→ 一次函数第 2 步：y = kx + b 里 k 和 b 各管什么，对照本页的 a、h、k',
    lk3: '→ 抛体与圆周第 1 步：同样的出手速度，抛多高射得最远',
    lk4: '→ 导数第 1 步：割线变切线，顶点处切线是水平的',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《抛物线 · 投篮的弧线》的平行版本。'
  },
  en: {
    pageTitle: 'Parabolas · When the Rise Keeps Changing',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Parabolas · The Arc of a Shot →',
    navLabel: 'Parabola steps',
    tagline: 'A straight line climbs the same amount at every step. What do the points trace when the climb itself changes step by step? Starting from the path of one basketball shot, seven steps take you to recognise the parabola, read every letter of y = a(x − h)² + k, and go back to the court to work out where the ball comes down.',
    nav0: '0 Dots of a shot', nav1: '1 What a does', nav2: '2 Moving the vertex', nav3: '3 Meeting the x-axis', nav4: '4 Back to the court', nav5: '5 Quiz', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Look first',
    s0t: 'Mark the ball every 0.1 s. What shape do the marks make?',
    s0e: 'The question: if you mark where a basketball is every 0.1 seconds, what shape do the marks line up in? The set-up (a simulation, no air resistance): the ball leaves the hand 2 m above the floor and travels 4 m per second sideways; upward it starts at 7 m per second and gravity slows it more and more. In the <strong>top plot</strong>, across is the sideways distance from the release point (metres) and up is the height above the floor (metres); each dot is where the ball is at one moment. The <strong>bottom plot</strong> draws, for every 0.1 s, how much the ball climbed: bars above zero are gains, below zero are drops. In <a class="xlink" href="../../../math/algebra/linear-functions/#step0">step 0 of the linear-functions lesson</a> every step climbs the same amount and the dots form a straight line. Here the climb is no longer constant.',
    tSlider: 'Time t (seconds)', play0: 'Throw it, one dot at a time',
    c0a: 'Ball position: one dot every 0.1 s', c0b: 'Height gained in each 0.1 s (m)',
    lg0Dot: 'Ball position', lg0Up: 'Rising in this 0.1 s', lg0Down: 'Falling in this 0.1 s', lg0Peak: 'Vertex (highest point)',
    s0progress: '{c}/{N} dots placed. ',
    s0readout: '{prog}t = {t} s: the ball is {x} m from the release point and {y} m above the floor. {last}',
    s0last: 'In the last 0.1 s it climbed {r} m, {d} m less than in the 0.1 s before.',
    s0first: 'Just released; no climb to compare yet.',
    s0last1: 'In the last 0.1 s it climbed {r} m.',
    s0lastDown: 'In the last 0.1 s it dropped {r} m (a negative climb), {d} m less than the 0.1 s before.',
    s0rule: 'The pattern: every 0.1 s the climb is {d} m smaller than the one before, starting at +{r0} m and going negative. The climb is not constant; it shrinks by a fixed amount.',
    s0peak: 'An arc that rises then falls, is mirror-symmetric and has a single highest point is called a <strong>parabola</strong>; the highest point is its <strong>vertex</strong>. For this shot the vertex is at t ≈ {pt} s, {px} m out and {py} m up, which falls between two dots.',
    s0hint: 'What to try: press “Throw it” and watch dots land in the top plot while bars grow in the bottom one; then drag the time slider back to any moment. Look for two things: the tops of the bars sit on a straight sloping line (each one is smaller by the same amount), and the bar where gains turn into drops is exactly where the arc passes its top.',

    s1k: 'Step 1 · The simplest formula',
    s1t: 'In y = a·x², what happens to the arc when you change a?',
    s1e: 'The question: in the simplest parabola formula, y = a·x², what does the number a control? A function of the form y = ax² + bx + c (with a ≠ 0) is called a <strong>quadratic function</strong>, and its graph is always a parabola. This step keeps b and c at 0, which puts the vertex at the origin (0, 0). Across is x and up is y; the grey dashed y = x² stays on the plot as the yardstick for width. The orange staircase shows how much y changes for each unit you move right from the vertex.',
    a1Slider: 'Coefficient a',
    c1: '{eq}   (dashed: y = x²)',
    lg1Cur: 'Current curve', lg1Ref: 'y = x² for reference', lg1Step: 'Climb per unit step', lg1Hist: 'Values of a you tried',
    s1readout: '{eq}: one, two and three units from the vertex, y is {y1}, {y2}, {y3} (that is a, 4a, 9a). The climbs per unit are {r1}, {r2}, {r3}, each {dd} more than the last (that is 2a), the same fixed-change pattern as the ball in step 0. {shape}',
    up: 'opens upward', down: 'opens downward',
    fatter: 'It {open} and is wider than y = x² (|a| < 1: same step sideways, smaller climb).',
    thinner: 'It {open} and is narrower than y = x² (|a| > 1: same step sideways, bigger climb).',
    same: 'It {open} and is exactly as wide as y = x² (|a| = 1).',
    s1zero: 'a = 0: y = 0·x² is zero everywhere, leaving just the x-axis, a straight line. No bend, no parabola, which is why a quadratic needs a ≠ 0.',
    s1hint: 'What to try: drag a slowly from 1 up to 2, then down to 0.25, and only ask whether the curve is narrower or wider than the dashed y = x². Then go negative and watch the opening flip downward and the staircase turn to steps down. Faint curves keep the values you tried, for comparison.',

    s2k: 'Step 2 · Vertex form',
    s2t: 'Write it as y = a(x − h)² + k. How does the graph move?',
    s2e: 'The question: once you slide y = a·x² somewhere else, how do you write it? As y = a(x − h)² + k, called <strong>vertex form</strong>: at x = h the bracket is 0, so y is exactly k, and the vertex sits at (h, k). The <strong>axis of symmetry</strong> is the vertical line through the vertex, x = h: two points the same distance either side of it are at the same height. Watch the signs: with h negative, x − (−1) is written x + 1. The dashed curve is the unmoved y = a·x², and the arrow runs from the origin to the vertex.',
    hSlider: 'Slide sideways h', kSlider: 'Slide up/down k', aSlider: 'Coefficient a',
    c2: '{eq}',
    lg2Cur: 'Moved curve', lg2Ghost: 'Original y = a·x²', lg2Axis: 'Axis of symmetry x = h', lg2Pair: 'Points 2 units either side', lg2Trail: 'Where the vertex has been',
    s2readout: '{eq}: vertex ({h}, {k}), axis of symmetry x = {h}. At x = {xl} and x = {xr} (two units either side) y is {ym} both times. It {open}, so the vertex is the curve’s {ext} point.',
    lowest: 'lowest', highest: 'highest',
    s2hint: 'What to try: drag only h and the curve slides sideways without changing shape, while the number in the bracket follows (mind the sign). Drag only k and it slides up and down. Change a last: the vertex stays put and only the width and direction change. The two green dots always match in height, which is the symmetry. Faint dots record where the vertex has been.',

    s3k: 'Step 3 · Crossing the x-axis',
    s3t: 'How many times does the curve meet the x-axis, and what decides it?',
    s3e: 'The question: how many points does a parabola share with the x-axis, and where? Those are the points where y = 0. Vertex form makes it easy to see: if the vertex is above the axis (k > 0) and the curve opens upward, the whole curve stays above and never touches; open it downward and it must cross twice. Setting y = 0 gives a(x − h)² = −k, so x = h ± √(−k/a), with no solution when the number under the root is negative. In the right-hand plot, across is k and up is the number of crossings, recorded for each k you try with the current a.',
    h3Slider: 'Slide sideways h', k3Slider: 'Vertex height k', a3Slider: 'Coefficient a',
    c3a: '{eq} and the x-axis', c3b: 'Crossings · across: k',
    lg3Cur: 'Curve', lg3Hit: 'Crossings with the x-axis', lg3Vertex: 'Vertex', lg3Tried: 'Values of k tried',
    s3two: 'Two crossings: x {x1} and x {x2}. The vertex is {side} the x-axis (k = {k}) and the curve {open}, so it has to cut the axis twice, at points mirrored about x = {h}.',
    s3one: 'Exactly one crossing: x = {x1}. The vertex sits on the axis (k = 0), so the curve touches once and turns back. This is called being <strong>tangent</strong> to the axis.',
    s3zero: 'No crossings: the vertex is {side} the x-axis (k = {k}) and the curve {open}, so all of it stays {side} the axis.',
    above: 'above', below: 'below',
    s3hint: 'What to try: keep a fixed and drag k slowly from −4 to 4. Two crossings merge into one, then vanish; the right-hand plot keeps every k you tried, and the step happens exactly at k = 0. Make a negative and sweep again: the step flips. Finally drag only h: the count stays the same and the crossings just move sideways together.',

    s4k: 'Step 4 · Back to the court',
    s4t: 'Change the release: how high, where does it land, does it go in?',
    s4e: 'The question: with the tools from the first three steps, write a shot in vertex form and read off its peak and where it lands. Same set-up as step 0 (a simulation, no air resistance, released 2 m up). The rim is 3.05 m high, placed where the step-0 shot comes down through 3.05 m. Here y is the height above the floor (metres) and x the sideways distance from the release point (metres), so y = 0 is the floor and a crossing with the x-axis is the <strong>landing point</strong>. The formula is computed from the release speeds: the vertex is the peak, and a = −4.9 ÷ (sideways speed)².',
    vxSlider: 'Sideways speed (m/s)', vySlider: 'Upward release speed (m/s)', reset4: 'Back to the step-0 shot',
    c4: 'Sideways distance x (m) · height y (m)',
    lg4Cur: 'This shot', lg4Old: 'Earlier shots', lg4Math: 'Formula before release and after landing', lg4Vertex: 'Vertex', lg4Land: 'Landing point', lg4Hoop: 'Rim',
    s4readout: 'This shot ≈ {eq}. Peak: {py} m up, {px} m from the release point. Setting y = 0 gives x ≈ {land} m, the landing point. The other solution, x ≈ {back} m, lies behind the shooter, before the ball was released: the formula has a value there, but the ball does not. {verdict}',
    made: 'Passing the rim line (x ≈ {hx} m) it is {y} m up and falling, within 0.1 m of rim height: it goes in!',
    high: 'Passing the rim line it is {y} m up, {d} m above the rim: too high, off the backboard or over.',
    low: 'Passing the rim line it is {y} m up, {d} m below the rim: short.',
    rising: 'Passing the rim line the ball is still rising ({y} m up), so it can only hit the rim from below.',
    s4hint: 'What to try: raise only the upward speed: the vertex climbs and moves right, and the landing point moves out. Then raise only the sideways speed: the arc stretches and gets wider (|a| shrinks). Each shot leaves a faint trace for comparison. Try to find a pair of speeds that scores; there is more than one.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Without the hints, can you read a parabola?',
    s5e: 'The question: without the hints, can you read a formula off a graph, build a graph from a formula, and work out where it meets the x-axis? The three questions go back to steps 2, 2 and 3; a wrong answer tells you what to look at again.',
    q1Prompt: '① Which formula draws the parabola below?',
    q1A: 'y = −(x − 2)² + 1', q1B: 'y = −(x + 2)² + 1', q1C: 'y = (x − 2)² + 1',
    c5a: 'Graph for question ①', c5b: 'Question ②: your curve',
    q2Prompt: '② Use the controls below to build a parabola with vertex (−1, 3) that opens downward, then press “Check”.',
    h5Slider: 'h', k5Slider: 'k', open5Up: 'Opens upward', open5Down: 'Opens downward',
    q3Prompt: '③ Where does y = −(x − 1)² + 4 meet the x-axis?',
    q3A: 'x = 1 and x = 4', q3B: 'x = −1 and x = 3', q3C: 'It never does',
    check: 'Check',
    q1ok: 'Right. A vertex at (2, 1) goes into the bracket with the sign flipped, x − 2; opening downward means a minus in front.',
    q1no: 'Look again: the vertex is at x = 2, so the bracket must be x − 2 (zero when x = 2), and opening downward needs a negative a.',
    q2ok: 'Right. Your formula {eq} has vertex (−1, 3) and opens downward.',
    q2no: 'Not yet: you have {eq}, with vertex ({h}, {k}), and it {open}. The target is vertex (−1, 3), opening downward.',
    q3ok: 'Right. Set y = 0: (x − 1)² = 4, so x − 1 = ±2, giving x = −1 or x = 3, mirrored about the axis x = 1.',
    q3no: 'Work it through: set y = 0 to get (x − 1)² = 4, so x − 1 is 2 or −2. The vertex (1, 4) is above the axis and the curve opens downward, so there must be two crossings.',
    pick: 'Pick an answer first.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One formula with three things written on its face',
    s6fin: '<strong>Step 0</strong>: the shot’s climb per 0.1 s shrinks by a fixed amount, and the dots trace an arc that rises, falls and mirrors itself: a parabola. <strong>Step 1</strong>: in y = a·x², the sign of a sets the direction it opens and |a| sets the width; a = 0 collapses to a line. <strong>Step 2</strong>: vertex form y = a(x − h)² + k shows the vertex (h, k) and the axis of symmetry x = h at a glance. <strong>Step 3</strong>: the number of x-axis crossings (2, 1 or 0) depends on which side of the axis the vertex sits and which way the curve opens. <strong>Step 4</strong>: written in vertex form, a shot’s peak is the vertex and its landing point is where it meets the floor.',
    formula: 'y = a(x − h)² + k   (a ≠ 0)\nvertex (h, k)   axis x = h\ncrossings: x = h ± √(−k/a)  (when −k/a ≥ 0)',
    boundary: 'Scope: the shots here are simulated without air resistance; a real ball is also pushed by the air and its spin, so its path is only close to a parabola. Vertex form and the general form y = ax² + bx + c can be rewritten into each other (by completing the square), which this page does not cover; another tool for counting crossings, the discriminant, comes later in school. The formula has values before release and after landing too, but only the middle stretch describes a real ball.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear functions, step 0: why the same climb per step makes a straight line',
    lk2: '→ Linear functions, step 2: what k and b do in y = kx + b, next to this page’s a, h and k',
    lk3: '→ Projectiles, step 1: with the same launch speed, which angle goes farthest',
    lk4: '→ Derivatives, step 1: a secant turns into a tangent, and at the vertex the tangent is flat',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Parabolas · The Arc of a Shot”.'
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
