'use strict';
// Shortest-path lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '最短路 · 一圈一圈往外确认',
    back: '← 知识索引',
    compare: '对照另一版本：最短路 · 从起点像洪水一样漫开 →',
    navLabel: '最短路步骤导航',
    tagline: '地图上从 S 到 T 有很多条路，每段路标着要花的时间。哪条最省？把所有路线都列出来比一比，路口一多就列不完。迪杰斯特拉算法换了个问法：先确定离起点最近的地方，再往外一圈一圈推。七步里你会亲手走一遍它，看它在什么条件下不会出错、在网格地图上怎样绕开泥地，以及怎样借「终点在哪边」少算很多格。',
    nav0: '0 路线的代价', nav1: '1 一圈圈确认', nav2: '2 负权会骗人', nav3: '3 网格地图', nav4: '4 A* 少看几格', nav5: '5 你来当算法', nav6: '6 收束',

    s0k: '第 0 步 · 什么叫最短',
    s0t: '从 S 到 T，哪条路线最省时间？',
    s0e: '这一步要回答：在一张标了数的地图上，「最短」到底比的是什么？图由<strong>节点</strong>（圆圈，代表地点）和<strong>边</strong>（连线，代表能直接走的路）组成；边上的数叫<strong>权重</strong>，这里是走这段路要花的分钟数。一条<strong>路径</strong>是一串首尾相接的边，它的<strong>代价</strong>是沿途权重之和。最短路径就是代价最小的那条，跟经过几段路、看起来直不直无关。用下面的按钮从 S 出发一段段走到 T；下图把从 S 到 T 不重复经过节点的全部路线按代价排开，你走的那条会标出来。',
    s0lgYou: '你走的路线', s0lgAll: '一条路线（按代价排列）', s0lgBest: '代价最小的路线',
    c0a: '道路图：边上的数 = 走这段的分钟数', c0b: '全部 {N} 条路线的代价（分钟）',
    moveTo: '走到 {v}（+{w}）', undo0: '退一步', reset0: '回到 S',
    s0at: '你在 {u}，已走 {path}，花了 {cost} 分钟。可以走的下一段见上面的按钮。',
    s0stuck: '你在 {u}，已走 {path}，花了 {cost} 分钟，但相邻的地方都已经走过了。退一步换条路吧。',
    s0done: '到达 T！路线 {path} 共 {cost} 分钟。全部 {N} 条路线中最省的是 {best}，{bc} 分钟。{verdict}',
    s0best: '你找到的就是最短的。', s0worse: '比最短的多 {d} 分钟。',
    s0facts: '对照：段数最少的路线 {hop} 要 {hc} 分钟；每次挑眼前最便宜的一段（贪心）会走成 {gr}，{gc} 分钟。',
    s0hint: '观察顺序：先试「段数最少」的走法 S → A → D → T，再试每到一个路口都挑最便宜的一段，看下图里你的橙点分别落在哪儿。两种直觉都不是最省的。这张图只有 8 个节点就有 21 条路线；节点再多，列举全部路线会多到算不完。',

    s1k: '第 1 步 · 迪杰斯特拉',
    s1t: '不列举路线，怎样一个一个地确定最短距离？',
    s1e: '这一步要回答：能不能不试遍所有路线，就得到 S 到每个节点的最短代价？迪杰斯特拉算法给每个节点记一个<strong>暂定距离</strong>：到目前为止找到的、从 S 到它的最好代价（还没找到路就记 ∞）。每一轮做两件事：① 在还没确认的节点里，挑暂定距离最小的那个，把它<strong>确认</strong>（它的最短距离就此定下，以后不再改）；② 从它出发看每条边，如果「它的距离 + 边权」比邻居的暂定距离小，就把邻居改成这个更小的数（这一步叫<strong>松弛</strong>）。被确认的节点按距离从小到大排成一串，就像从 S 往外一圈圈推。为什么确认了就不会再变？别的路线要绕到它，得先从已确认的区域走到某个还没确认的节点，而那里的暂定距离已经不比它小；边权不为负，越走只会越贵。如果每条边的权重都是 1，这个过程就是逐层推进的广度优先搜索（<a class="xlink" href="../../../computing/algorithms/graph-algorithms/#step1">→ 图算法第 1 步：队列让 BFS 一层一层推</a>）。',
    next1: '确认下一个', auto1: '自动走完', restart1: '从头开始',
    s1lgDone: '已确认', s1lgOpen: '已有暂定距离', s1lgNew: '刚确认的', s1lgTree: '最短路线所用的边',
    c1a: '道路图：节点下方是暂定距离', c1b: '确认顺序（横轴：从 S 出发的最短距离）',
    s1start: '还没确认任何节点。只有 S 的暂定距离是 0，其余都是 ∞。按「确认下一个」。',
    s1step: '第 {k}/{N} 轮：确认 {u}，最短距离 {d}。{relax}',
    s1relax: '松弛：{list}。', s1norelax: '没有邻居的暂定距离被改小。',
    s1end: '全部确认。确认顺序 {order}，距离依次为 {dists}，从不减小。S 到 T 的最短路线 {path}，{dT} 分钟，与第 0 步的列举结果一致。',
    s1hint: '观察顺序：一轮一轮按「确认下一个」，每次先猜会确认哪个点（橙色里数最小的），再看对不对；同时看下图：新确认的点总落在已有点的右边或同一位置，这就是「一圈圈往外」。留意 E：它先拿到 11，确认 C 后被改成 10。D 和 F 都是 12，这时按字母先确认 D，结果一样。',

    s2k: '第 2 步 · 条件',
    s2t: '如果有一条边的权重是负数，「确认了就不会变」还成立吗？',
    s2e: '这一步要回答：上一步的论证用到了「边权不为负」，去掉它会怎样？这张小图的边是<strong>有向</strong>的（只能顺箭头走），B → A 的权重 w 可以调成<strong>负权</strong>（比如走这段能拿回时间、或者赚到钱）。迪杰斯特拉在 A 的暂定距离最小时就把 A 确认了，此后再发现「经 B 到 A 更便宜」也不会回头改。作为对照，<strong>贝尔曼-福特算法</strong>不做「确认」：它把所有边反复松弛很多轮（节点数 − 1 轮），因此允许负权（只要没有总和为负的环）。',
    wSlider: 'B → A 的权重 w',
    s2lgDij: '迪杰斯特拉的结果', s2lgBf: '贝尔曼-福特（正确答案）', s2lgBad: '确认之后才出现的更短路',
    c2a: '有向图：S 到 T',
    s2ok: 'w = {w}：两种算法都给出 A = {a}、T = {t}。确认顺序 {order}；等确认 B 时，经 B 到 A 的代价 {via} 不比已确认的 A = {a} 小，所以没有遗漏。',
    s2bad: 'w = {w}：迪杰斯特拉给出 A = {a}、T = {t}，贝尔曼-福特给出 A = {ba}、T = {bt}。确认顺序 {order}；A 在距离 {a} 时就被确认，之后才看到 B → A，经 B 到 A 只要 {via}，可是 A 已经不会再改了。',
    s2hint: '观察顺序：从 w = 4 往左拖。w ≥ −2 时两种算法的数一样；拖到 −3，粉色的 B → A 亮起来，迪杰斯特拉的 T 停在 5 不动，而正确答案变小了。问题不出在计算失误，而是「先确认、不回头」的规则本身依赖边权非负。',

    s3k: '第 3 步 · 网格地图',
    s3t: '泥地多难走时，穿过去就不划算、该绕路了？',
    s3e: '这一步要回答：同一个算法搬到网格地图上会怎样？把每个格子当节点，上下左右相邻的格子之间有边；进入一个格子要花它的代价：普通地 1，泥地 m（可调），岩石不能走。这样「路线长短」变成「沿途格子代价之和」。迪杰斯特拉从起点一圈圈确认格子；按「播放搜索」，被确认的格子会按确认顺序染色，颜色越亮说明离起点越远（暂定距离越大）。橙线是最后找到的最短路线。泥地代价是<strong>模型参数</strong>：拖它改的是地图的权重，然后整张图重新搜索。',
    mudSlider: '泥地代价 m（每格）', play3: '播放搜索',
    s3lgOpen: '普通地（1）', s3lgMud: '泥地（m）', s3lgRock: '岩石', s3lgDone: '已确认（越亮越远）', s3lgPath: '最短路线',
    c3a: '地图：起点 S → 终点 T',
    s3readout: '{prog}m = {m}：最短路线代价 {cost}，经过 {mud} 格泥地、共 {len} 步；算法确认了 {done} 个格子才确认到终点。{note}',
    s3through: '（穿过泥地更省：绕路要 {det}。）', s3around: '（绕开泥地：穿过去至少要 {thr}。）',
    s3prog: '已确认 {c}/{N} 格 · ',
    s3hint: '观察顺序：先保持 m = 1（泥地和普通地一样），播放一次，看染色从起点向四周近似均匀地扩成一个菱形，路线是一条直线。再把 m 调到 2：路线仍穿过泥地，代价 18；调到 3：路线改为从上方或下方绕过泥地，代价 21，以后 m 再大也不变。注意每次都要确认 100 多个格子，连远离终点的左边也被确认了。',

    s4k: '第 4 步 · A* 搜索',
    s4t: '告诉算法终点在哪个方向，能少确认多少格？',
    s4e: '这一步要回答：上一步的迪杰斯特拉把背向终点的格子也一一确认，能不能省掉？<strong>A*</strong> 给每个格子再算一个<strong>启发值</strong> h：从它到终点的横向步数 + 纵向步数（曼哈顿距离），即「最乐观的剩余代价」。每轮不再挑暂定距离 g 最小的格子，而是挑 g + w·h 最小的。w = 0 就是迪杰斯特拉；w = 1 是标准 A*：因为每格代价至少 1，h 从不高估真实剩余代价，找到的路线仍然最短。w &gt; 1 叫<strong>加权 A*</strong>：更急着朝终点冲，确认的格子更少，但可能错过真正最短的路线。泥地代价沿用第 3 步的 m。',
    wtSlider: '启发值权重 w', play4: '播放搜索',
    s4lgDone: '已确认', s4lgPath: '找到的路线', s4lgOpt: '虚线：真正的最短代价', s4lgHist: '每个试过的 w',
    c4a: '地图（g + w·h 最小的先确认）', c4b: '确认的格子数', c4c: '找到的路线代价',
    s4readout: '{prog}m = {m}，w = {w}：确认 {done} 格（迪杰斯特拉要 {dij} 格），路线代价 {cost}，真正最短是 {opt}。{verdict}',
    s4opt: '仍是最短路线。', s4sub: '比最短多 {d}：权重太大，h 被放大后高估了剩余代价。',
    s4prog: '已确认 {c}/{N} 格 · ',
    s4hint: '观察顺序：保持第 3 步的 m = 3，把 w 从 0 拖到 1：确认的格子从 128 降到 64，代价仍是 21；再拖到 2、3：格子更少，但代价变成 23，橙点离开了下面那条虚线。再回第 3 步换几个 m 看看：w ≤ 1 的点始终在虚线上。换 m 会清空记录的点。',

    s5k: '第 5 步 · 你来当算法',
    s5t: '这次从 T 出发，下一个该确认谁？',
    s5e: '这一步要回答：你能不能按迪杰斯特拉的规则手算？同一张道路图，这次从 T 出发，求 T 到每个节点的最短距离。图中每个节点下方是当前的暂定距离（到目前为止找到的最好代价，∞ 表示还没找到路）。规则只有一条：在还没确认的节点里，确认暂定距离最小的那个，再用它松弛邻居。用下面的按钮选择你要确认的节点；选对了，算法替你松弛并进入下一轮，选错了会告诉你哪个更小。',
    s5pick: '确认 {v}', restart5: '重新开始',
    s5lgDone: '已确认', s5lgOpen: '已有暂定距离', s5lgNew: '刚确认的',
    c5a: '道路图，起点 T：节点下方是暂定距离',
    s5ask: '第 {k}/{N} 轮：还没确认的节点里，谁的暂定距离最小？（已答对 {ok} 次，答错 {bad} 次）',
    s5right: '对：{v} 的暂定距离 {d} 最小，确认它。{relax}',
    s5wrong: '不是 {v}：它的暂定距离是 {dv}，而 {best} 只有 {d}。先确认最小的。',
    s5inf: '不是 {v}：它的暂定距离还是 ∞（还没有路通到它），而 {best} 只有 {d}。',
    s5end: '全部确认！从 T 出发的确认顺序 {order}；S 的最短距离 {dS}，和第 1 步从 S 出发求得的 S → T 距离相同（这张图的路是双向的）。共答错 {bad} 次。',
    s5hint: '观察顺序：每轮先看所有橙色节点下方的数，选最小的；不要被「离 T 近」或「边权小」干扰。选对后留意哪些数被改小了，那就是松弛。',
    quizPrompt: '想一想：迪杰斯特拉刚确认了一个节点 X，距离 10。下面哪种情况会让 X 的真实最短距离其实小于 10？',
    quizA: '另一个还没确认的节点 Y 暂定距离 12，Y → X 的边权是 1',
    quizB: '图里所有边权都不为负，但 X 还有一条没看过的边',
    quizC: '有一条边的权重是 −5，可以从 Y 走到 X',
    check: '核对', correct: '对。只有负权能让「从更远的 Y 绕回来」反而更近：12 − 5 = 7 < 10。边权都不为负时，经任何未确认节点绕到 X 都至少要 10。', wrong: '再想想：Y 的暂定距离已经 ≥ 10，再加一条不为负的边只会更大。能让绕路变便宜的只有负权，比如 12 + (−5) = 7。',

    s6k: '第 6 步 · 收束', s6t: '先确认最近的，一圈圈往外',
    s6fin: '回头串一遍。<strong>第 0 步</strong>：最短路比的是权重之和，路线数会随节点数暴涨，不能靠列举。<strong>第 1 步</strong>：迪杰斯特拉每轮确认暂定距离最小的节点，再松弛邻居；确认顺序按距离从小到大。<strong>第 2 步</strong>：这条规则依赖边权非负，出现负权时要改用贝尔曼-福特。<strong>第 3 步</strong>：在网格地图上，权重的变化会让路线从穿过泥地切换成绕路。<strong>第 4 步</strong>：A* 用不高估的启发值，少确认很多格，路线仍最短；把启发值放大则更快但可能不是最短。<strong>第 5 步</strong>：你自己按规则从 T 算了一遍。',
    formula: '每轮：u = 未确认节点中 dist 最小者，确认 u\n对每条边 u→v：dist[v] = min(dist[v], dist[u] + w(u,v))\nA*：按 g + w·h 选；w = 1 且 h 不高估 ⇒ 仍最短',
    boundary: '适用范围：本页的图都很小，迪杰斯特拉每轮用「扫一遍找最小」实现，总共约 V² 次比较（V 是节点数）；大图通常用优先队列（堆），约 (V + E)·log V 次操作（E 是边数）。正确性要求所有边权非负；负权要用贝尔曼-福特，而图中若有总和为负的环，「最短」本身就没有定义（无向图里一条负权边就构成这样的环）。网格只允许上下左右四个方向移动、进入格子才计代价；曼哈顿距离不高估是因为每格代价至少 1。确认顺序遇到相等距离时，本页按字母或加入先后打破平局，换一种打破方式结果距离相同、路线可能不同。',
    linksTitle: '接着去哪儿',
    lk1: '→ 图算法第 1 步：队列让 BFS 一层一层推，所有边权为 1 时它就是最短路',
    lk2: '→ 图算法第 3 步：复杂度来自每个节点、每条边被看几次',
    lk3: '→ LeetCode 778 第 2 步：把「代价相加」换成「取最大」，仍然先确认最小的',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《最短路 · 从起点像洪水一样漫开》的平行版本。'
  },
  en: {
    pageTitle: 'Shortest Paths · Settling the World Ring by Ring',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Shortest Path · Flooding Out From the Start →',
    navLabel: 'Shortest-path steps',
    tagline: 'A map offers many routes from S to T, each road marked with the minutes it takes. Which route is cheapest? Listing every route and comparing them stops working as soon as there are many junctions. Dijkstra’s algorithm asks a different question: settle the place nearest the start first, then push outward ring by ring. Over seven steps you will run it by hand, see when it cannot be fooled, watch it detour around mud on a grid map, and see how knowing “which way the goal lies” saves most of the work.',
    nav0: '0 Cost of a route', nav1: '1 Ring by ring', nav2: '2 Negative edges', nav3: '3 Grid map', nav4: '4 A*', nav5: '5 You run it', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What “shortest” means',
    s0t: 'From S to T, which route takes the least time?',
    s0e: 'This step asks: on a map with numbers on it, what exactly does “shortest” compare? A graph is made of <strong>nodes</strong> (circles, the places) and <strong>edges</strong> (lines, roads you can take directly). The number on an edge is its <strong>weight</strong>, here the minutes that road takes. A <strong>path</strong> is a chain of connected edges, and its <strong>cost</strong> is the sum of the weights along it. The shortest path is the one with the smallest cost, regardless of how many roads it uses or how straight it looks. Use the buttons to walk from S to T one road at a time; the lower chart lines up every route from S to T that never revisits a node, ordered by cost, and marks yours.',
    s0lgYou: 'your route', s0lgAll: 'one route (ordered by cost)', s0lgBest: 'the cheapest route',
    c0a: 'Road map: number on a road = minutes it takes', c0b: 'Cost of all {N} routes (minutes)',
    moveTo: 'Go to {v} (+{w})', undo0: 'Step back', reset0: 'Back to S',
    s0at: 'You are at {u}, having walked {path} for {cost} minutes. The roads you can take next are on the buttons above.',
    s0stuck: 'You are at {u}, having walked {path} for {cost} minutes, but every neighbour has already been visited. Step back and try another way.',
    s0done: 'Arrived at T! Route {path} took {cost} minutes. Of all {N} routes the cheapest is {best} at {bc} minutes. {verdict}',
    s0best: 'You found the shortest one.', s0worse: 'That is {d} minutes more than the shortest.',
    s0facts: 'For comparison: the route with the fewest roads, {hop}, takes {hc} minutes; always taking the cheapest road in front of you (greedy) gives {gr}, {gc} minutes.',
    s0hint: 'What to try: first walk the route with the fewest roads, S → A → D → T, then a walk that always picks the cheapest next road, and see where your orange dot lands in the lower chart each time. Neither instinct finds the cheapest route. This map has only 8 nodes and already 21 routes; with more nodes, listing every route becomes hopeless.',

    s1k: 'Step 1 · Dijkstra’s algorithm',
    s1t: 'Without listing routes, how can the shortest distances be pinned down one at a time?',
    s1e: 'This step asks: can we get the cheapest cost from S to every node without trying every route? Dijkstra’s algorithm keeps a <strong>tentative distance</strong> for each node: the best cost from S found so far (∞ if no route has been found yet). Each round does two things. ① Among the nodes not yet settled, take the one with the smallest tentative distance and <strong>settle</strong> it: its shortest distance is now final. ② Look along each of its edges; if “its distance + the edge weight” beats a neighbour’s tentative distance, lower the neighbour to that value (this is called <strong>relaxing</strong> the edge). Settled nodes come out in order of increasing distance, as if pushing outward from S ring by ring. Why can a settled distance never improve later? Any other route to it must first leave the settled region through some unsettled node whose tentative distance is already no smaller, and with no negative weights, every further road only adds cost. If every edge weighs 1, this process is exactly layer-by-layer breadth-first search (<a class="xlink" href="../../../computing/algorithms/graph-algorithms/#step1">→ Graph algorithms, step 1: a queue makes BFS go layer by layer</a>).',
    next1: 'Settle the next node', auto1: 'Run to the end', restart1: 'Start over',
    s1lgDone: 'settled', s1lgOpen: 'has a tentative distance', s1lgNew: 'just settled', s1lgTree: 'roads used by shortest routes',
    c1a: 'Road map: tentative distance under each node', c1b: 'Settling order (across: shortest distance from S)',
    s1start: 'Nothing settled yet. Only S has a tentative distance, 0; the rest are ∞. Press “Settle the next node”.',
    s1step: 'Round {k}/{N}: settle {u} at distance {d}. {relax}',
    s1relax: 'Relaxed: {list}.', s1norelax: 'No neighbour’s tentative distance went down.',
    s1end: 'Everything settled. Order {order}, at distances {dists}, never decreasing. The shortest route from S to T is {path}, {dT} minutes, matching the full listing in step 0.',
    s1hint: 'What to try: press “Settle the next node” one round at a time, guessing first which node will be settled (the orange one with the smallest number), then checking. Watch the lower chart: each newly settled node lands to the right of, or level with, the ones before. That is “ring by ring”. Keep an eye on E: it first gets 11, then drops to 10 once C is settled. D and F both reach 12; the tie is broken alphabetically, which does not change any distance.',

    s2k: 'Step 2 · The fine print',
    s2t: 'If one edge has a negative weight, does “settled means final” still hold?',
    s2e: 'This step asks: the argument in step 1 relied on “no negative weights”; what happens without it? The edges in this small graph are <strong>directed</strong> (you can only follow the arrows), and the weight w of B → A can be made a <strong>negative weight</strong> (taking that road gives time back, or earns money). Dijkstra settles A as soon as A has the smallest tentative distance, and never revisits it, even if it later finds that going through B would be cheaper. For comparison, the <strong>Bellman–Ford algorithm</strong> settles nothing: it relaxes every edge over and over (number of nodes − 1 rounds), so negative weights are fine as long as no loop adds up to a negative total.',
    wSlider: 'Weight w of B → A',
    s2lgDij: 'Dijkstra’s answer', s2lgBf: 'Bellman–Ford (correct answer)', s2lgBad: 'a cheaper road found after settling',
    c2a: 'Directed graph: S to T',
    s2ok: 'w = {w}: both algorithms give A = {a}, T = {t}. Settling order {order}; when B is settled, reaching A through B costs {via}, which is no less than the settled A = {a}, so nothing was missed.',
    s2bad: 'w = {w}: Dijkstra gives A = {a}, T = {t}; Bellman–Ford gives A = {ba}, T = {bt}. Settling order {order}; A was settled at {a} before B → A was ever looked at. Through B, A costs only {via}, but A is no longer allowed to change.',
    s2hint: 'What to try: drag w left from 4. While w ≥ −2 both algorithms agree; at −3 the pink B → A lights up, Dijkstra’s T stays stuck at 5 and the correct answer drops below it. Nothing was miscalculated: the rule “settle and never look back” itself depends on non-negative weights.',

    s3k: 'Step 3 · A grid map',
    s3t: 'How bad must the mud be before going around beats going through?',
    s3e: 'This step asks: what does the same algorithm do on a grid map? Each square is a node, with edges to its neighbours up, down, left and right. Entering a square costs that square’s price: 1 for open ground, m for mud (adjustable), and rock cannot be entered. The length of a route becomes the sum of the prices of the squares along it. Dijkstra settles squares ring by ring from the start; press “Play the search” and the settled squares are coloured in the order they are settled, brighter meaning farther from the start (larger distance). The orange line is the shortest route it ends up with. The mud price is a <strong>model parameter</strong>: dragging it changes the map’s weights, and the whole map is searched again.',
    mudSlider: 'Mud price m (per square)', play3: 'Play the search',
    s3lgOpen: 'open ground (1)', s3lgMud: 'mud (m)', s3lgRock: 'rock', s3lgDone: 'settled (brighter = farther)', s3lgPath: 'shortest route',
    c3a: 'Map: start S → goal T',
    s3readout: '{prog}m = {m}: shortest route costs {cost}, crossing {mud} mud squares in {len} moves; the algorithm settled {done} squares before reaching the goal. {note}',
    s3through: '(Going through the mud is cheaper: going around costs {det}.)', s3around: '(Going around the mud: going through would cost at least {thr}.)',
    s3prog: '{c}/{N} squares settled · ',
    s3hint: 'What to try: start with m = 1 (mud costs the same as open ground) and play the search once. The colour spreads from the start almost evenly into a diamond, and the route is a straight line. Set m to 2: the route still crosses the mud, cost 18. At 3 it switches to going round above or below, cost 21, and stays there however large m gets. Notice that each search settles over a hundred squares, even far to the left, away from the goal.',

    s4k: 'Step 4 · A* search',
    s4t: 'Tell the search which way the goal lies. How many squares does that save?',
    s4e: 'This step asks: step 3’s Dijkstra settled squares pointing away from the goal one by one; can that be avoided? <strong>A*</strong> gives each square a <strong>heuristic</strong> h: the horizontal plus vertical steps from it to the goal (the Manhattan distance), an optimistic guess of the remaining cost. Each round it picks the square with the smallest g + w·h instead of the smallest tentative distance g. w = 0 is Dijkstra; w = 1 is standard A*: since every square costs at least 1, h never overestimates the true remaining cost, and the route found is still the shortest. w &gt; 1 is <strong>weighted A*</strong>: it rushes towards the goal and settles fewer squares, but may miss the truly shortest route. The mud price is the m from step 3.',
    wtSlider: 'Heuristic weight w', play4: 'Play the search',
    s4lgDone: 'settled', s4lgPath: 'route found', s4lgOpt: 'dashed: true shortest cost', s4lgHist: 'each w you tried',
    c4a: 'Map (smallest g + w·h settled first)', c4b: 'Squares settled', c4c: 'Cost of the route found',
    s4readout: '{prog}m = {m}, w = {w}: settled {done} squares (Dijkstra needs {dij}); route cost {cost}, true shortest {opt}. {verdict}',
    s4opt: 'Still the shortest route.', s4sub: '{d} more than the shortest: with too large a weight, the inflated h overestimates the remaining cost.',
    s4prog: '{c}/{N} squares settled · ',
    s4hint: 'What to try: keep step 3 at m = 3 and drag w from 0 to 1: the settled squares drop from 128 to 64 while the cost stays 21. Drag on to 2 and 3: fewer squares still, but the cost rises to 23 and the orange dot leaves the dashed line below. Then try other m in step 3: points with w ≤ 1 always sit on the dashed line. Changing m clears the recorded points.',

    s5k: 'Step 5 · You run it',
    s5t: 'Starting from T this time: which node should be settled next?',
    s5e: 'This step asks: can you follow Dijkstra’s rule by hand? Same road map, but now start from T and find the shortest distance from T to every node. Under each node is its current tentative distance (the best cost found so far; ∞ means no route yet). There is only one rule: among the unsettled nodes, settle the one with the smallest tentative distance, then relax its neighbours. Use the buttons to choose the node to settle; if you are right, the algorithm relaxes for you and moves to the next round; if not, it tells you which node is smaller.',
    s5pick: 'Settle {v}', restart5: 'Start again',
    s5lgDone: 'settled', s5lgOpen: 'has a tentative distance', s5lgNew: 'just settled',
    c5a: 'Road map from T: tentative distance under each node',
    s5ask: 'Round {k}/{N}: among the unsettled nodes, whose tentative distance is smallest? ({ok} right, {bad} wrong so far)',
    s5right: 'Right: {v} has the smallest tentative distance, {d}; settle it. {relax}',
    s5wrong: 'Not {v}: its tentative distance is {dv}, while {best} has only {d}. Settle the smallest first.',
    s5inf: 'Not {v}: its tentative distance is still ∞ (no route reaches it yet), while {best} has only {d}.',
    s5end: 'All settled! Order from T: {order}. S ends at {dS}, the same as the S → T distance found from S in step 1 (the roads here go both ways). Wrong picks: {bad}.',
    s5hint: 'What to try: each round, read the numbers under all the orange nodes and pick the smallest; don’t be swayed by “close to T on the page” or “cheap edge”. After a right pick, notice which numbers went down: that is relaxation.',
    quizPrompt: 'Think it through: Dijkstra has just settled node X at distance 10. Which situation would make X’s true shortest distance smaller than 10?',
    quizA: 'Another unsettled node Y has tentative distance 12, and the edge Y → X weighs 1',
    quizB: 'All weights are non-negative, but X has an edge nobody has looked at yet',
    quizC: 'Some edge from Y to X has weight −5',
    check: 'Check', correct: 'Right. Only a negative weight lets a detour through the farther Y come out cheaper: 12 − 5 = 7 < 10. With non-negative weights, any detour through an unsettled node reaches X at 10 or more.', wrong: 'Not quite: Y’s tentative distance is already ≥ 10, and adding a non-negative edge only makes it larger. Only a negative weight can make the detour cheaper, e.g. 12 + (−5) = 7.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Settle the nearest first, ring by ring',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: shortest means smallest total weight, and the number of routes explodes with the number of nodes, so listing them is no way forward. <strong>Step 1</strong>: Dijkstra settles the node with the smallest tentative distance each round and relaxes its neighbours; nodes are settled in order of increasing distance. <strong>Step 2</strong>: the rule relies on non-negative weights; with negative weights, use Bellman–Ford. <strong>Step 3</strong>: on a grid map, changing a weight flips the route from crossing the mud to going around it. <strong>Step 4</strong>: A* with a heuristic that never overestimates settles far fewer squares and still finds the shortest route; inflating the heuristic is faster but may not be shortest. <strong>Step 5</strong>: you ran the rule yourself from T.',
    formula: 'each round: u = unsettled node with the smallest dist; settle u\nfor each edge u→v: dist[v] = min(dist[v], dist[u] + w(u,v))\nA*: pick by g + w·h; w = 1 and h never overestimates ⇒ still shortest',
    boundary: 'Scope: the graphs here are small, and each Dijkstra round finds the minimum by scanning, about V² comparisons in total (V is the number of nodes); large graphs normally use a priority queue (a heap), about (V + E)·log V operations (E is the number of edges). Correctness needs every weight to be non-negative; negative weights call for Bellman–Ford, and if the graph has a loop whose weights add up to a negative total, “shortest” is not even defined (in an undirected graph a single negative edge is such a loop). The grid allows only up, down, left and right moves, and charges for entering a square; the Manhattan distance never overestimates because every square costs at least 1. When distances tie, this page breaks the tie alphabetically or by arrival order; a different tie-break gives the same distances, possibly a different route.',
    linksTitle: 'Where to go next',
    lk1: '→ Graph algorithms, step 1: a queue makes BFS go layer by layer, which is shortest paths when every weight is 1',
    lk2: '→ Graph algorithms, step 3: cost comes from how often each node and edge is looked at',
    lk3: '→ LeetCode 778, step 2: replace “add the costs” with “take the maximum” and still settle the smallest first',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Shortest Path · Flooding Out From the Start”.'
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
  if (typeof window.refreshShortestPath === 'function') window.refreshShortestPath();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
