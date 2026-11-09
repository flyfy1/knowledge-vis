'use strict';
// Velocity–time lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '速度—时间图 · 高低是快慢，面积是路程',
    back: '← 知识索引',
    compare: '对照另一版本：速度与 v-t 图 · 面积就是路 →',
    navLabel: '速度—时间图步骤导航',
    tagline: '一辆公交车从一站开到下一站，先加速、再匀速、最后刹车。只给你一张「每一刻速度是多少」的图，你能算出两站相距多远吗？能——数一数图线下面的面积。八步里，我们从最简单的匀速走起，一直走到这张公交车的图。',
    nav0: '0 匀速', nav1: '1 位置—时间图', nav2: '2 速度—时间图', nav3: '3 面积 = 路程', nav4: '4 速度在变', nav5: '5 一段行程', nav6: '6 自测', nav7: '7 收束',

    s0k: '第 0 步 · 已知什么',
    s0t: '速度不变时，走了多远怎么算？',
    s0e: '这一步要回答：一个人保持同样的快慢往前走，已知速度和时间，走过的路程是多少？<strong>速度</strong>说的是「每秒走多少米」，单位 m/s。速度不变的直线运动叫<strong>匀速直线运动</strong>：每一秒走的路一样长。所以路程 = 速度 × 时间（单位：m/s × s = m）。下图是一条直跑道，左端是起点，竖短线是每过 1 秒留下的记号。',
    c0a: '跑道：起点在左，竖短线是每秒的位置记号',
    c0title: '跑道（距离 / m）',
    s0lgNow: '此刻的位置', s0lgMark: '每过 1 秒的位置记号',
    speedV: '速度 v（m/s）', timeT: '已走时间 t（s）', durT: '持续时间 t（s）',
    s0readout: '速度 {v} m/s，走了 {t} s：路程 = {v} m/s × {t} s = {s} m。相邻两个记号都相距 {v} m——每秒走的一样多，这就是「匀速」。',
    s0hint: '观察顺序：先只拖「已走时间」，看青点往前走、身后每秒多一个记号，记号间距不变；再只拖「速度」，看记号间距整体变宽或变窄。',

    s1k: '第 1 步 · 把位置画成图',
    s1t: '两人同时起跑，图上哪里看得出谁快？',
    s1e: '这一步要回答：把「每个时刻在哪儿」画成一张图，快和慢会变成什么样子？上半部分是两条并排的跑道；下半部分是<strong>位置—时间图（x-t 图）</strong>：横轴是时间 t（s），纵轴是离起点的距离 x（m），每过一刻就在图上点一个点，点连成线。匀速时 x = v·t，所以这条线是过原点的直线，它的<strong>陡缓</strong>（每过 1 s 往上爬几米，即 Δx ÷ Δt）正好就是速度——爬得越陡，跑得越快（<a class="xlink" href="../../../math/algebra/linear-functions/#step0">→ 一次函数页第 0 步：斜率就是「每走一步升多高」</a>）。',
    c1a: '上：两条跑道；下：两人的位置—时间图',
    c1track: '跑道（距离 / m）', c1xt: '位置—时间图：纵轴 x / m，横轴 t / s',
    runA: '甲', runB: '乙', laneA: '甲', laneB: '乙',
    s1lgGap: '同一时刻两人的距离差',
    speedA: '甲的速度（m/s）', speedB: '乙的速度（m/s）', clockT: '时钟 t（s）',
    play: '▶ 播放（1 秒 = 2 示意秒）', pause: '❚❚ 暂停', replay: '↺ 从 0 重播',
    s1readout: 't = {t} s：甲在 {xa} m，乙在 {xb} m，相距 {gap} m。x-t 图上甲线每秒爬 {ka} m、乙线每秒爬 {kb} m——这两个「陡缓」就是两人的速度。',
    s1hint: '观察顺序：先按播放，看跑道上的两点和下图的两条线同时长出来；暂停后拖时钟，看虚线标出的距离差就是两条线的上下差。再把两人速度调成一样：两条线重合，距离差始终为 0。',

    s2k: '第 2 步 · 换一种画法',
    s2t: '纵轴换成速度，同一场跑步长什么样？',
    s2e: '这一步要回答：同样三个人跑同样 8 秒，如果纵轴画的不是「在哪儿」而是「此刻多快」，图会变成什么样？这种图叫<strong>速度—时间图（v-t 图）</strong>：横轴还是时间 t（s），纵轴是这一刻的速度 v（m/s）。甲 4 m/s、乙 2 m/s 都是匀速；丙从静止出发，每秒快 1 m/s，4 s 后保持 4 m/s。左图是熟悉的 x-t 图，右图是 v-t 图，两图共用一个时钟。读 v-t 图要看<strong>线有多高</strong>（高 = 此刻快），不要看陡缓——这一点和 x-t 图正好相反。',
    c2aA: '左：三人的位置—时间图', c2bA: '右：三人的速度—时间图',
    c2aT: 'x-t 图：x / m 对 t / s', c2bT: 'v-t 图：v / (m/s) 对 t / s',
    runA4: '甲：4 m/s 匀速', runB2: '乙：2 m/s 匀速', runC: '丙：起步每秒快 1 m/s，4 s 后保持 4 m/s',
    s2readout: 't = {t} s：甲 {va} m/s、已走 {xa} m；乙 {vb} m/s、已走 {xb} m；丙 {vc} m/s、已走 {xc} m。{note}',
    s2noteUp: '丙还在加速：v-t 图上他的线在往上斜，x-t 图上他的线越来越陡。',
    s2noteFlat: '丙已和甲一样快（4 m/s）：v-t 图上两线并成一条水平线，但 x-t 图上丙仍落后 {lag} m——起步慢掉的那段路追不回来。',
    s2hint: '观察顺序：拖时钟从 0 到 8 s。匀速的甲、乙：左图是斜直线，右图是水平线（高度就是速度）。丙：右图前 4 s 是一段斜线，左图是一段越来越陡的弯线；4 s 后两图里丙都和甲平行。',
    q2prompt: '左边 x-t 图里，丙的线在前 4 s 越来越陡。这说明什么？',
    q2a: '丙正在爬坡',
    q2b: '丙越跑越快',
    q2c: '丙走过的路越来越少',
    check: '核对',
    q2right: '对。x-t 图的陡缓是速度，越来越陡就是越跑越快——对应右边 v-t 图里那段向上的斜线。',
    q2wrong: '再想想：x-t 图的纵轴是离起点的距离，不是地面高度。线越陡，说明每秒多走的路越多。',

    s3k: '第 3 步 · 面积 = 路程（匀速）',
    s3t: 'v-t 图下面那块长方形，为什么就是路程？',
    s3e: '这一步要回答：匀速时，v-t 图是一条高为 v 的水平线；从 t = 0 到 t 秒，这条线下面围成一个长方形。它的面积和走过的路程有什么关系？长方形的高是速度（m/s），宽是时间（s），面积 = 高 × 宽，单位正是 m/s × s = m。图里每个小格高 1 m/s、宽 1 s，代表「以 1 m/s 走 1 秒」= <strong>1 m 路</strong>。数格子，就是在数路程。',
    c3a: '上：速度—时间图，线下的格子；下：跑道上的路程',
    c3top: 'v-t 图：v / (m/s) 对 t / s（每格 = 1 m）', c3track: '跑道（距离 / m）：每数一格前进 1 m',
    s3lgCell: '已数的格子（每格 1 m）', s3lgLine: '速度线 v', s3lgTrack: '跑道上已走的路',
    countCells: '▶ 一格一格数', counting: '数格中…',
    s3readout: '长方形：高 {v} m/s × 宽 {t} s = {area} 格 = {area} m。已数 {n} / {area} 格，跑道上对应走了 {n} m。',
    s3hint: '观察顺序：按「一格一格数」，看上图格子逐个点亮、下图跑道同步前进 1 m；数完时格子总数 = v × t。再改速度或时间，长方形的高或宽变了，格子数跟着变。',

    s4k: '第 4 步 · 速度在变时',
    s4t: '速度一直在涨，没有长方形可用，路程怎么算？',
    s4e: '这一步要回答：一辆车从静止出发，每秒快 1 m/s，开了 6 s（最后速度 6 m/s）。它的 v-t 图是一条斜线，线下是三角形。三角形的面积 ½ × 6 s × 6 m/s = <strong>18 m</strong> 真的是路程吗？办法是把 6 s 切成 N 段窄条，假装每段里速度不变：<strong>偏小的估计</strong>每条取这段<em>开头</em>的速度（台阶在斜线下方），<strong>偏大的估计</strong>取这段<em>结尾</em>的速度（台阶在斜线上方）。真路程一定夹在两者之间。条切得越细，两个台阶越贴近斜线（<a class="xlink" href="../../../math/calculus/integral/#step2">→ 定积分页第 2 步：同一招在 v-t 图上叫积分</a>）。',
    c4aA: '左：速度斜线和两种台阶', c4bA: '右：每次切条得到的两个估计',
    c4aT: 'v-t 图：v / (m/s) 对 t / s', c4bT: '估计的路程 / m 对条数 N',
    s4lgLow: '偏小估计（取开头速度）', s4lgHigh: '偏大估计（取结尾速度）', s4lgLine: '真实速度线', s4lgExact: '三角形面积 18 m',
    strips: '条数 N', refine: '▶ 一路切细（1 → 24 条）',
    s4readout: 'N = {n} 条，每条宽 {dt} s：偏小估计 {low} m，偏大估计 {high} m，真路程夹在中间；两者相差 {gap} m。三角形面积 = {exact} m。',
    s4hint: '观察顺序：从 1 条开始，一格一格加大条数。左图看蓝色台阶和橙色框越来越贴近白色斜线；右图每试一次 N 就留下一对点，看两串点从上下两边一起收向绿色的 18 m 线。',

    s5k: '第 5 步 · 读一段真实的行程',
    s5t: '一张公交车的 v-t 图，能读出多少件事？',
    s5e: '这一步要回答：公交车在两站之间开了 15 s——0–4 s 从静止加速到 10 m/s，4–12 s 保持 10 m/s，12–15 s 刹车到停——两站相距多远？这一刻的速度叫<strong>瞬时速度</strong>，就是 v-t 图上这一刻的高度。从出发到此刻，线下已扫过的面积就是已走的路程：加速段是三角形，匀速段是长方形，刹车段又是三角形。最下面那张 x-t 图，每一刻的高度就等于上面已扫过的面积。',
    c5a: '上：跑道上的公交车；中：速度—时间图和已扫过的面积；下：由面积累出的位置—时间图',
    c5track: '跑道（距离 / m）', c5vt: 'v-t 图：v / (m/s) 对 t / s', c5xt: 'x-t 图：x / m 对 t / s（高度 = 上图已扫面积）',
    s5lgV: '速度线', s5lgArea: '已扫过的面积 = 已走的路', s5lgX: '位置（由面积累出）', s5lgAvg: '平均速度',
    showAvg: '显示平均速度线',
    s5readout: 't = {t} s · {kind} · 瞬时速度 {v} m/s · 已走 {x} m（= 已扫面积）',
    kindUp: '加速段（线往上斜）', kindFlat: '匀速段（线水平）', kindDown: '刹车段（线往下斜）', kindStop: '停车',
    s5segs: '三段面积：加速 ½×{d1}×{v} = {a1} m；匀速 {d2}×{v} = {a2} m；刹车 ½×{d3}×{v} = {a3} m；合计 {total} m。{avg}',
    s5avgNote: '平均速度 = 总路程 ÷ 总时间 = {total} m ÷ {T} s ≈ {avg} m/s：粉色虚线下的长方形和公交车的梯形面积一样大。',
    s5hint: '观察顺序：按播放，看跑道上的车、中图扫过的蓝色面积、下图的 x-t 线三者同步前进；加速段 x-t 线越来越陡，匀速段是直线，刹车段越来越平。打开「平均速度线」，比较它下面的长方形和蓝色梯形。',

    s6k: '第 6 步 · 自测',
    s6t: '换一张新图，三件事你都能读出来吗？',
    s6e: '这一步要回答：下面是另一段行程的 v-t 图（数值和第 5 步不同），请用前面学的三招——看高低读速度、看升降判断加速还是减速、算面积求路程——回答三道题。答完按「全部核对」，需要时再看算式。',
    c6a: '自测用的速度—时间图', c6T: 'v-t 图：v / (m/s) 对 t / s',
    q6aP: '① t = {t} s 时，这辆车的速度是多少？', q6bP: '② 0 到 {T} s，它一共走了多远？',
    q6cP: '③ 判断：「v-t 图上的线越陡，说明速度越大。」',
    optV: '{v} m/s', optM: '{d} m', optTrue: '对', optFalse: '不对',
    checkAll: '全部核对', showWork: '看算式',
    fbRight: '{n} / 3 正确。', fbMiss: '还没选完：请三道题都选一个答案。',
    fb1ok: '① 对：t = {t} s 时线高 {v} m/s。', fb1no: '① 不对：读线在 t = {t} s 处有多高，不是读横轴，也不是最高点。',
    fb2ok: '② 对：三段面积加起来是 {d} m。', fb2no: '② 不对：要把三段（两个三角形、一个长方形）的面积分别算出再相加。',
    fb3ok: '③ 对，这句话是错的：线陡只说明速度变得快（加得急或减得急），速度大小要看线有多高。', fb3no: '③ 再想想：v-t 图上，速度是线的高度。线陡只说明速度变化得急。',
    work: '算式：t = {t} s 在加速段，速度 = {v} m/s。路程 = ½×{d1}×{vm} + {d2}×{vm} + ½×{d3}×{vm} = {a1} + {a2} + {a3} = {d} m。',

    s7k: '第 7 步 · 收束',
    s7t: '两张图，三种读法',
    card1h: 'x-t 图看陡缓', card1: '纵轴是位置。线越陡，每秒走的路越多，速度越大；水平线表示停着不动。',
    card2h: 'v-t 图看高低', card2: '纵轴是速度。线越高越快；线往上斜是在加速，往下斜是在减速，水平是匀速。',
    card3h: '面积就是路程', card3: 'v-t 图线下的面积 = 走过的路。匀速是长方形，匀加速是三角形，其余靠切窄条再相加。',
    boundary: '适用范围：本页只讲沿一条直线、一直向前的运动（速度不为负）；所有数据都是为讲解设定的示意数值，不是实测。如果车倒退，速度取负，「面积」要算成有正有负，那是以后的内容。',
    linksTitle: '接着去哪儿',
    lk1: '→ 一次函数第 0 步：斜率就是「每走一格升多高」，x-t 图的陡缓正是它',
    lk2: '→ 导数第 0 步：从平均速度出发，逼近「这一刻」的速度',
    lk3: '→ 定积分第 2 步：在 v-t 图上把小条加回整体',
    lk4: '→ 牛顿定律第 0 步：是什么让速度变化——推力与加速',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《速度与 v-t 图 · 面积就是路》的平行版本。'
  },
  en: {
    pageTitle: 'Velocity–Time Graphs · Height Is Speed, Area Is Distance',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Speed and the v–t Graph · Area Is Distance →',
    navLabel: 'Velocity–time graph steps',
    tagline: 'A bus pulls away from a stop, cruises, then brakes at the next one. If all you had was a graph of its speed at every moment, could you work out how far apart the stops are? Yes — count the area under the line. Over eight steps we build up from steady walking to that bus graph.',
    nav0: '0 Steady speed', nav1: '1 Position–time', nav2: '2 Velocity–time', nav3: '3 Area = distance', nav4: '4 Changing speed', nav5: '5 A real trip', nav6: '6 Self-check', nav7: '7 Wrap-up',

    s0k: 'Step 0 · What we already know',
    s0t: 'At a steady speed, how far do you get?',
    s0e: 'The question for this step: someone walks forward without speeding up or slowing down. Given their speed and the time, how far have they gone? <strong>Speed</strong> means “metres covered each second”, measured in m/s. Moving in a straight line at an unchanging speed is called <strong>uniform motion</strong>: every second covers the same distance. So distance = speed × time (units: m/s × s = m). Below is a straight track starting at the left; each short tick marks where the walker was after another whole second.',
    c0a: 'Track: start on the left; ticks mark the position after each second',
    c0title: 'Track (distance / m)',
    s0lgNow: 'Position now', s0lgMark: 'Mark left after each second',
    speedV: 'Speed v (m/s)', timeT: 'Time so far t (s)', durT: 'Duration t (s)',
    s0readout: '{v} m/s for {t} s: distance = {v} m/s × {t} s = {s} m. Every pair of neighbouring marks is {v} m apart — the same distance each second, which is what “uniform” means.',
    s0hint: 'What to try: drag only the time slider and watch the dot move on, leaving one more mark each second, always the same gap apart. Then drag only the speed and watch every gap widen or shrink together.',

    s1k: 'Step 1 · Plot the position',
    s1t: 'Two runners start together — where on a graph do you see who is faster?',
    s1e: 'The question for this step: if we plot “where am I at each moment”, what do fast and slow look like? The top half shows two side-by-side lanes. The bottom half is a <strong>position–time graph (x–t graph)</strong>: time t (s) across, distance from the start x (m) up. Each moment adds a point; the points join into a line. At a steady speed x = v·t, so the line is straight through the origin, and its <strong>steepness</strong> — metres climbed per second, Δx ÷ Δt — is exactly the speed. Steeper means faster (<a class="xlink" href="../../../math/algebra/linear-functions/#step0">→ Linear functions, step 0: slope is “how far up per step across”</a>).',
    c1a: 'Top: two lanes; bottom: both runners on a position–time graph',
    c1track: 'Track (distance / m)', c1xt: 'Position–time: x / m up, t / s across',
    runA: 'Ana', runB: 'Ben', laneA: 'A', laneB: 'B',
    s1lgGap: 'Gap between them at the same moment',
    speedA: 'Ana’s speed (m/s)', speedB: 'Ben’s speed (m/s)', clockT: 'Clock t (s)',
    play: '▶ Play (1 s = 2 demo seconds)', pause: '❚❚ Pause', replay: '↺ Replay from 0',
    s1readout: 't = {t} s: Ana is at {xa} m, Ben at {xb} m, {gap} m apart. On the x–t graph Ana’s line climbs {ka} m per second and Ben’s {kb} m — those steepnesses are their speeds.',
    s1hint: 'What to try: press Play and watch the two dots on the track grow the two lines below in step. Pause, then drag the clock: the dashed gap on the track equals the vertical gap between the lines. Now give them the same speed — the lines coincide and the gap stays 0.',

    s2k: 'Step 2 · A different kind of graph',
    s2t: 'Put speed on the vertical axis — what does the same race look like?',
    s2e: 'The question for this step: three runners, the same 8 seconds — what happens to the picture if the vertical axis shows not “where” but “how fast right now”? That is a <strong>velocity–time graph (v–t graph)</strong>: time t (s) across, current speed v (m/s) up. Ana (4 m/s) and Ben (2 m/s) run steadily; Cai starts from rest, gains 1 m/s every second, and holds 4 m/s after 4 s. The left graph is the familiar x–t graph, the right one is the v–t graph, and both run on one clock. On a v–t graph you read <strong>how high</strong> the line is (higher = faster now), not how steep — the opposite of the x–t graph.',
    c2aA: 'Left: position–time graph of all three', c2bA: 'Right: velocity–time graph of all three',
    c2aT: 'x–t: x / m vs t / s', c2bT: 'v–t: v / (m/s) vs t / s',
    runA4: 'Ana: steady 4 m/s', runB2: 'Ben: steady 2 m/s', runC: 'Cai: +1 m/s each second, then 4 m/s from 4 s',
    s2readout: 't = {t} s: Ana {va} m/s, {xa} m covered; Ben {vb} m/s, {xb} m; Cai {vc} m/s, {xc} m. {note}',
    s2noteUp: 'Cai is still speeding up: his v–t line slopes upward and his x–t line keeps getting steeper.',
    s2noteFlat: 'Cai now matches Ana at 4 m/s: their v–t lines merge into one flat line, yet on the x–t graph Cai is still {lag} m behind — the distance lost during his slow start never comes back.',
    s2hint: 'What to try: drag the clock from 0 to 8 s. Ana and Ben run steadily: sloped straight lines on the left, flat lines on the right (the height is the speed). Cai: for the first 4 s a slanted line on the right and an ever-steeper curve on the left; after 4 s he runs parallel to Ana in both.',
    q2prompt: 'On the left x–t graph, Cai’s line gets steeper during the first 4 s. What does that tell you?',
    q2a: 'Cai is running uphill',
    q2b: 'Cai is getting faster',
    q2c: 'Cai is covering less and less ground',
    check: 'Check',
    q2right: 'Right. Steepness on an x–t graph is speed, so ever steeper means ever faster — matching the rising slanted line on the v–t graph.',
    q2wrong: 'Not quite: the vertical axis is distance from the start, not height above ground. A steeper line means more metres covered each second.',

    s3k: 'Step 3 · Area = distance (steady speed)',
    s3t: 'Why is the rectangle under a v–t graph the distance?',
    s3e: 'The question for this step: at a steady speed the v–t graph is a flat line at height v. From t = 0 to t seconds, it encloses a rectangle. How does its area relate to the distance covered? The rectangle is a speed (m/s) tall and a time (s) wide, so its area = height × width has units m/s × s = m. Each small cell here is 1 m/s tall and 1 s wide — “1 m/s for one second”, which is <strong>1 m of travel</strong>. Counting cells is counting metres.',
    c3a: 'Top: velocity–time graph with cells under the line; bottom: distance on a track',
    c3top: 'v–t: v / (m/s) vs t / s (each cell = 1 m)', c3track: 'Track (distance / m): +1 m for every cell counted',
    s3lgCell: 'Cells counted (1 m each)', s3lgLine: 'Speed line v', s3lgTrack: 'Distance covered on the track',
    countCells: '▶ Count cell by cell', counting: 'Counting…',
    s3readout: 'Rectangle: {v} m/s tall × {t} s wide = {area} cells = {area} m. Counted {n} of {area}; the track has advanced {n} m.',
    s3hint: 'What to try: press “Count cell by cell” and watch each cell light up while the track below moves on 1 m; when it finishes, the number of cells is v × t. Change the speed or the time: the rectangle gets taller or wider and the count follows.',

    s4k: 'Step 4 · When the speed changes',
    s4t: 'The speed keeps rising — no rectangle fits. How do we get the distance?',
    s4e: 'The question for this step: a car starts from rest, gains 1 m/s every second and drives for 6 s (ending at 6 m/s). Its v–t graph is a slanted line with a triangle beneath it. Is the triangle’s area, ½ × 6 s × 6 m/s = <strong>18 m</strong>, really the distance? Cut the 6 s into N narrow strips and pretend the speed is constant within each one. The <strong>low estimate</strong> uses the speed at the <em>start</em> of each strip (steps under the line); the <strong>high estimate</strong> uses the speed at the <em>end</em> (steps above it). The true distance is squeezed between them, and the thinner the strips, the closer both staircases hug the line (<a class="xlink" href="../../../math/calculus/integral/#step2">→ The definite integral, step 2: the same trick on a v–t graph is called integration</a>).',
    c4aA: 'Left: the slanted speed line and two staircases', c4bA: 'Right: the two estimates for every strip count tried',
    c4aT: 'v–t: v / (m/s) vs t / s', c4bT: 'Estimated distance / m vs strips N',
    s4lgLow: 'Low estimate (speed at start)', s4lgHigh: 'High estimate (speed at end)', s4lgLine: 'True speed line', s4lgExact: 'Triangle area 18 m',
    strips: 'Strips N', refine: '▶ Keep slicing (1 → 24 strips)',
    s4readout: 'N = {n} strips, each {dt} s wide: low estimate {low} m, high estimate {high} m, the true distance lies between; they differ by {gap} m. Triangle area = {exact} m.',
    s4hint: 'What to try: start at 1 strip and raise the count one notch at a time. On the left, the blue steps and orange outlines close in on the white line. On the right, each N you try leaves a pair of dots; watch the two rows converge on the green 18 m line from above and below.',

    s5k: 'Step 5 · Read a real trip',
    s5t: 'How much can one bus v–t graph tell you?',
    s5e: 'The question for this step: a bus takes 15 s between stops — from rest up to 10 m/s over 0–4 s, a steady 10 m/s over 4–12 s, braking to a stop over 12–15 s. How far apart are the stops? The speed at one particular moment is the <strong>instantaneous speed</strong>: the height of the v–t line at that moment. The area swept under the line from the start to now is the distance so far — a triangle while speeding up, a rectangle while cruising, another triangle while braking. In the bottom x–t graph, the height at each moment equals the area swept in the graph above it.',
    c5a: 'Top: the bus on its track; middle: velocity–time graph with the area swept so far; bottom: position–time graph built from that area',
    c5track: 'Track (distance / m)', c5vt: 'v–t: v / (m/s) vs t / s', c5xt: 'x–t: x / m vs t / s (height = area swept above)',
    s5lgV: 'Speed line', s5lgArea: 'Area swept = distance so far', s5lgX: 'Position (built from the area)', s5lgAvg: 'Average speed',
    showAvg: 'Show the average-speed line',
    s5readout: 't = {t} s · {kind} · instantaneous speed {v} m/s · covered {x} m (= area swept)',
    kindUp: 'speeding up (line slopes up)', kindFlat: 'cruising (line flat)', kindDown: 'braking (line slopes down)', kindStop: 'stopped',
    s5segs: 'The three areas: speeding up ½×{d1}×{v} = {a1} m; cruising {d2}×{v} = {a2} m; braking ½×{d3}×{v} = {a3} m; total {total} m. {avg}',
    s5avgNote: 'Average speed = total distance ÷ total time = {total} m ÷ {T} s ≈ {avg} m/s: the rectangle under the pink dashed line has the same area as the bus’s trapezium.',
    s5hint: 'What to try: press Play and watch the bus, the blue area in the middle and the x–t line below advance together. While speeding up the x–t line gets steeper, while cruising it is straight, while braking it flattens out. Turn on the average-speed line and compare its rectangle with the blue trapezium.',

    s6k: 'Step 6 · Self-check',
    s6t: 'A new graph — can you read all three things?',
    s6e: 'The question for this step: below is the v–t graph of a different trip (new numbers, not step 5’s). Use the three skills — height for speed, rise or fall for speeding up or slowing down, area for distance — to answer three questions. Press “Check all” when done, and “Show working” if you want the sums.',
    c6a: 'Velocity–time graph for the self-check', c6T: 'v–t: v / (m/s) vs t / s',
    q6aP: '① How fast is the car going at t = {t} s?', q6bP: '② How far does it travel from 0 to {T} s?',
    q6cP: '③ True or false: “The steeper the line on a v–t graph, the higher the speed.”',
    optV: '{v} m/s', optM: '{d} m', optTrue: 'True', optFalse: 'False',
    checkAll: 'Check all', showWork: 'Show working',
    fbRight: '{n} of 3 correct.', fbMiss: 'Not finished yet: pick an answer for all three questions.',
    fb1ok: '① Right: at t = {t} s the line is {v} m/s high.', fb1no: '① Not quite: read how high the line is at t = {t} s — not the time axis, and not the peak.',
    fb2ok: '② Right: the three areas add up to {d} m.', fb2no: '② Not quite: work out the area of each piece (two triangles and a rectangle) and add them.',
    fb3ok: '③ Right, the statement is false: a steep line only means the speed is changing quickly (rising or falling fast); how fast you are going is the height.', fb3no: '③ Think again: on a v–t graph the speed is the height. Steepness only says how quickly the speed changes.',
    work: 'Working: t = {t} s falls in the speeding-up part, speed = {v} m/s. Distance = ½×{d1}×{vm} + {d2}×{vm} + ½×{d3}×{vm} = {a1} + {a2} + {a3} = {d} m.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'Two graphs, three ways to read them',
    card1h: 'x–t: read the steepness', card1: 'The vertical axis is position. Steeper means more metres per second, so faster; a flat line means standing still.',
    card2h: 'v–t: read the height', card2: 'The vertical axis is speed. Higher is faster; rising means speeding up, falling means slowing down, flat means steady.',
    card3h: 'Area is distance', card3: 'The area under a v–t line is the distance covered: a rectangle at steady speed, a triangle for steady speeding up, thin strips added up for anything else.',
    boundary: 'Scope: this page covers motion along one straight line, always forward (speed never negative). All numbers are illustrative values chosen for teaching, not measurements. If the vehicle reverses, its velocity goes negative and the “area” has to be counted with signs — a later topic.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear functions, step 0: slope is “how far up per step across” — exactly the steepness of an x–t line',
    lk2: '→ Derivatives, step 0: start from average speed and close in on the speed at an instant',
    lk3: '→ The definite integral, step 2: adding strips back up on a v–t graph',
    lk4: '→ Newton’s laws, step 0: what makes speed change — pushing and acceleration',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Speed and the v–t Graph · Area Is Distance”.'
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
  if (typeof window.refreshVelocity === 'function') window.refreshVelocity();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.VT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
