'use strict';
// Graph traversal lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '图算法 · 待办表决定走法',
    back: '← 知识索引',
    compare: '对照另一版本：图算法 · 让边带你走 →',
    navLabel: '图算法步骤导航',
    tagline: '一张地图上有 8 个地点、10 条双向的路。程序看不见这张图，只拿到每个地点的邻居名单。凭这些名单，怎样不重不漏地走遍能到的地方、找出最短路，又要花多少功夫？答案几乎全落在一个小东西上：那张「还没处理」的待办表按什么顺序取。',
    nav0: '0 邻接表', nav1: '1 做记号', nav2: '2 队列 BFS', nav3: '3 栈 DFS', nav4: '4 迷宫', nav5: '5 工作量', nav6: '6 收束',

    s0k: '第 0 步 · 程序手里有什么',
    s0t: '程序看不见这张图，它到底知道什么？',
    s0e: '这一步要回答：要从 A 出发找出所有能到的地点，程序手里有什么信息？数学上把这种地图叫<strong>图</strong>：一组<strong>节点</strong>（地点，这里是 A–H）加一组<strong>边</strong>（连接两个节点的路）。本页的路都能双向走，这叫<strong>无向图</strong>。程序拿到的不是画面，而是每个节点的<strong>邻接表</strong>：和它有边直接相连的节点名单，按字母排好。下文 V 表示节点数，E 表示边数。一条边 u–v 会同时出现在 u 和 v 的名单里，所以全部名单加起来正好 2E 项。',
    s0lgOn: '开着的路（边）', s0lgOff: '关着的路（可点开）', s0lgSel: '选中节点和它的边',
    pickEdge: '选一条路', toggleEdge: '开 / 关这条路', resetEdges: '恢复默认的路',
    adjTitle: '邻接表（程序真正拿到的数据）',
    c0: '地图：点节点看它的名单，点路开关它',
    s0readout: 'V = {V}，E = {E}；所有名单合计 {sum} 项 = 2 × {E}。选中 {u}：名单是 {list}，共 {deg} 项（这个数叫 {u} 的度）。',
    s0hint: '观察顺序：先点一个节点（或用键盘 Tab 到下方名单），看图上高亮的边和下方名单里它的那一行是否一一对应；再点一条虚线路把它打开，看两个端点的名单各多出一项、合计项数加 2。这里改的路会一直带到第 1–3 步。',

    s1k: '第 1 步 · 为什么要做记号',
    s1t: '不给见过的点做记号，循环会停下来吗？',
    s1e: '这一步要回答：按「取出一个点，把它的邻居放进去」这一条规则反复走，为什么必须给放过的点做记号？先定义<strong>待办表</strong>（也叫 frontier）：已经发现、还没处理的节点。循环只有一句：从待办表取出一个点，读它的邻接表（和它有边相连的节点名单），把邻居放进待办表。本步取出的顺序是「先放进的先取出」，下一步再说为什么。<strong>记号</strong>是一个「见过」集合：节点第一次放进待办表时加进去，之后再遇到就跳过。没有记号时，A 把 B 放进来，处理 B 时又把 A 放回去，只要图里有一条边，待办表就永远不会空。',
    markOn: '放进时做记号', markOff: '不做记号',
    round: '走一轮', autoRun: '连续走', again: '重来',
    s1lgPut: '节点旁 ×n：被放进待办表的次数', s1lgNow: '当前运行', s1lgPrev: '上一次运行（另一种设置）',
    c1top: '每个节点被放进待办表几次', c1bot: '待办表里还剩几个（横轴：已走轮数）',
    s1readout: '已走 {r} 轮（每轮取出 1 个、放入它的邻居），累计放入 {total} 次，待办表还剩 {q} 个。',
    s1took: '第 {r} 轮取出 {u}，放入 {put}。',
    s1none: '（没放入新的）',
    s1doneMark: '待办表空了，循环自动停下：能到的 {n} 个点各被放入恰好 1 次。',
    s1capped: '演示在第 {r} 轮截停，但它其实永远停不下来：待办表还剩 {q} 个，而且在变长；{u} 已被放进 {c} 次。',
    s1hint: '观察顺序：先保持「不做记号」，按「连续走」，看上图 ×n 不断变大、下图曲线一路往上；再切到「放进时做记号」重新走，看每个点停在 ×1、曲线回落到 0。灰线保留上一次运行，方便对比。开关改的是算法规则，不是图。',

    s2k: '第 2 步 · 队列：广度优先',
    s2t: '先放进的先取出，节点会按什么顺序被发现？',
    s2e: '这一步要回答：待办表若是<strong>队列</strong>（先放进的先取出，英文 FIFO），节点被发现的先后有什么规律？这样走就叫<strong>广度优先搜索（BFS）</strong>。每个节点记一个<strong>距离</strong> d：从起点出发最少经过几条边。取出 u、在它的名单里发现一个没记号的 v 时，令 d[v] = d[u] + 1，并把 u–v 画成<strong>树边</strong>（v 是经由 u 被发现的）。原因在队列本身：d 小的点总排在 d 大的点前面，所以先被取出、先去发现邻居的总是更近的点；于是每个点第一次被发现时的 d，就是它到起点的最短边数（<a class="xlink" href="../../../computing/algorithms/shortest-path/#step1">→ 最短路页第 1 步：路有长短时，换成按总长取的待办表</a>）。',
    startAt: '起点', step: '走一步', play: '连续播放', pause: '暂停', reset: '重来',
    queueLabel: '队列', queueOut: '出口（先取）', queueIn: '入口（新放）', stackLabel: '栈', stackBottom: '栈底', stackTop: '栈顶（先取）', emptyBox: '空',
    s2lgTree: '树边：节点经由它被发现', s2lgScan: '正在读的名单项', s2lgCur: '正在处理的节点', s2lgLayer: '颜色 = 距离 d（同色同层）',
    c2: 'BFS：节点旁是距离 d',
    actTake: '从队列取出 {u}，开始读它的名单。', actScanNew: '读 {u} 的名单项 {v}：没有记号，记 d[{v}] = {d}，放进队列。', actScanOld: '读 {u} 的名单项 {v}：已有记号，跳过。', actDone: '队列空了，BFS 结束。', actInit: '起点 {u} 放进队列，d[{u}] = 0。',
    s2readout: '动作 {k}/{N}。{act} 发现顺序：{order}。已读名单项 {s}/{s2}。',
    s2final: '各点距离：{dists}。',
    s2hint: '观察顺序：按「走一步」，每次只做一个动作（取出一个点，或读一个名单项）；看上方队列里同色的点总是排成一段，下一段的颜色恰好深一层。走完后把起点换成别的节点重来，看颜色分层如何重新排列。',

    s3k: '第 3 步 · 栈：深度优先',
    s3t: '换成后放进的先取出，走法会怎样变？',
    s3e: '这一步要回答：同一张图、同一个起点，把待办表换成<strong>栈</strong>（后放进的先取出，英文 LIFO），走法会变成什么样？这叫<strong>深度优先搜索（DFS）</strong>：总是继续读栈顶节点（最新发现的那个）的名单，一发现没记号的邻居就把它压到栈顶、马上从它往下走；栈顶的名单读完了，就把它弹出，回到下面那个点接着读，这叫<strong>回溯</strong>。所以栈里装的恰好是从起点到当前点的那条路。DFS 也会不重不漏地走遍能到的点，但它的树边连成的路不保证最短：它先往深处钻，而不是按距离一层层推。',
    s3lgOn: '在栈里（当前路径）', s3lgDone: '已弹出（名单读完）', edgeOpen: '开着', edgeClosed: '关着',
    s3lgBfs: 'BFS 的队列长度（整次运行）', s3lgDfs: 'DFS 的栈深度（到当前动作）', s3lgTree: 'DFS 树边', s3lgOrder: '节点旁 #k：第 k 个被发现',
    c3top: 'DFS：节点旁是发现次序 #k', c3bot: '待办表里有几个点（横轴：动作序号）',
    actPush: '读 {u} 的名单项 {v}：没有记号，压入栈，往 {v} 深入。', actPop: '{u} 的名单读完，弹出，回溯。', actDoneDfs: '栈空了，DFS 结束。', actInitDfs: '起点 {u} 压入栈。',
    s3readout: '动作 {k}/{N}。{act} 发现顺序：{order}。',
    s3path: 'DFS 树上 {s} → {t} 的路：{path}（{len} 条边）；BFS 求出的最短距离是 {bfs} 条边。',
    s3same: 'DFS 树上 {s} → {t} 的路：{path}（{len} 条边），这次恰好和 BFS 的最短距离一样。',
    s3noPath: '{t} 从 {s} 到不了：两种走法都不会发现它。',
    s3hint: '观察顺序：按「连续播放」，看下图橙线（栈深度）先一路升高、再一级级降下，青线（BFS 队列）则一直很矮；再在下面开关一条路（比如 C–D），重放，看发现顺序和 DFS 树怎样变。',

    s4k: '第 4 步 · 迷宫里的最短路',
    s4t: '在迷宫里，哪种走法直接给出最短路？',
    s4e: '这一步要回答：从 S 到 T 最少要走几格？把迷宫看成图：每个空格是一个节点，上下左右相邻的两个空格之间有一条边，墙格不算节点。BFS 从 S 出发，第 1 层是 S 的邻格，第 2 层是它们的新邻格……就像水从 S 一圈圈漫开；格子里的数字就是它的层数 d，也就是从 S 走到这里的最少步数。<strong>第一次漫到 T 时的层数就是最短步数</strong>，顺着树边从 T 倒着走回 S 就是一条最短路。DFS 按固定方向顺序（右、下、左、上）一路往前，碰壁才回溯，也能碰到 T，但那条路往往绕远。',
    flood: 'BFS 一层层漫开', showDfs: '叠加 DFS 找到的路', resetWalls: '恢复默认墙', clearWalls: '拆掉所有墙',
    s4lgBfs: 'BFS 最短路', s4lgDfs: 'DFS 找到的路', s4lgWall: '墙（点格子可加 / 拆）', s4lgNum: '数字 = 层数 d（离 S 的最少步数）',
    c4: '迷宫：S 是起点，T 是终点',
    s4progress: '已漫到第 {k}/{K} 层。',
    s4readout: 'BFS：最短 {len} 步，漫完时共到达 {reach} 个格子（最远的离 S {far} 步）。',
    s4dfs: 'DFS（右、下、左、上）：找到一条 {len} 步的路，比最短路多 {extra} 步；碰到 T 前发现了 {seen} 个格子。',
    s4none: 'T 被墙隔开了：BFS 漫完能到的 {reach} 个格子也没碰到 T，说明根本不存在路。',
    s4hint: '观察顺序：先按「BFS 一层层漫开」，看数字一圈圈往外长、T 被碰到时青色最短路出现；再按「叠加 DFS 找到的路」比较两条路的长短。然后点格子加一堵墙堵住青色路，看最短步数怎样变大，或者 T 变得到不了。',

    s5k: '第 5 步 · 工作量',
    s5t: '图变大时，BFS 的工作量跟什么成正比？',
    s5e: '这一步要回答：节点和边变多时，BFS 要做多少个基本动作？基本动作两种：从待办表取出一个点（有了记号，每个点只取一次，共 V 次），和读一个邻接表项（每条边在两端名单里各读一次，共 2E 次）。所以总数恰好是 V + 2E，记作 O(V + E)：只看增长的形状，不看常数（<a class="xlink" href="../../../computing/algorithms/sorting/#step4">→ 排序页第 4 步：大 O 比的是增长形状</a>）。图也可以存成<strong>邻接矩阵</strong>：一张 V × V 的表，第 u 行第 v 格记录 u、v 之间有没有边。这时取出 u 后要扫完整整一行 V 格才知道邻居是谁，总数变成 V + V²，跟边有多少无关。这里的图是随机生成的连通图：先连成一棵树，再随机补边，直到平均每个点有 d 条边（E = V·d/2）。',
    vSlider: '节点数 V', dSlider: '平均度 d（每个点平均几条边）', clearPts: '清空记录点',
    s5lgList: '邻接表：实测动作数', s5lgMat: '邻接矩阵：实测动作数', s5lgCurve: '虚线：当前 d 下的 V + V·d 与 V + V²',
    c5: '基本动作次数（纵轴对数刻度）与节点数 V',
    s5readout: 'V = {V}，E = {E}（平均度 {d}）。邻接表：取出 {V} 次 + 读名单 {scan} 项 = {list} 次（= V + 2E）。邻接矩阵：取出 {V} 次 + 扫格子 {mat} 格 = {mtot} 次（= V + V²），是邻接表的 {ratio} 倍。',
    s5hint: '观察顺序：先固定 d = 2，把 V 从 20 拖到 400，看青点沿一条缓坡上升、橙点陡得多；再固定 V，拖 d，看青点随边数上升而橙点纹丝不动。每个试过的组合都留在图上。滑杆改的是生成的图，计数来自真的跑一遍 BFS。',

    s6k: '第 6 步 · 收束',
    s6t: '同一个循环，换一个待办表',
    s6fin: '本页从头到尾只用了一个循环：<strong>取出一个点，读它的名单，把没记号的邻居放进待办表</strong>。记号保证每个点只处理一次，循环一定停；待办表的取法决定走法：队列给出按距离分层的 BFS，第一次发现时的层数就是最短边数；栈给出一路钻到底再回溯的 DFS，能走遍，但树上的路不保证最短。工作量方面，邻接表下两者都是 V + 2E 个基本动作，邻接矩阵下是 V + V²。',
    formula: 'BFS：队列 → d[v] = d[u] + 1 = 最短边数\nDFS：栈 → 栈里是当前路径\n工作量：邻接表 V + 2E，邻接矩阵 V + V²',
    boundary: '适用范围：本页的图无向、边不带长短（每条边算 1 步）、规模很小；「BFS 给出最短路」只对这种「每条边一样长」的图成立，边有长短时要按当前总长取点（迪杰斯特拉算法）。DFS 走出的具体路线取决于名单顺序（这里按字母，迷宫按右、下、左、上），换个顺序结果会不同。工作量里的 V 指能从起点到达的点数；有到不了的点时，要从每个没记号的点重新出发才能走遍全图。',
    linksTitle: '接着看',
    lk1: '→ 最短路页第 1 步：边有长短时，用按总长排序的待办表代替队列',
    lk2: '→ 递归与分治页第 0 步：函数调用自己时，系统也用一个栈记住「回到哪」，这正是 DFS 的栈',
    lk3: '→ PageRank 页第 1 步：同样是沿着边走，这次每步随机挑一条',
    lk4: '→ 排序页第 4 步：为什么 V + 2E 记作 O(V + E)',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《图算法 · 让边带你走》的平行版本。'
  },
  en: {
    pageTitle: 'Graph Algorithms · The To-Do List Sets the Route',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Graph Algorithms · Let Edges Lead →',
    navLabel: 'Graph algorithms steps',
    tagline: 'A map has 8 places and 10 two-way roads. The program never sees the picture; it only gets a list of neighbours for each place. From those lists alone, how do you reach every reachable place exactly once, find shortest routes, and how much work does it cost? Nearly everything comes down to one small thing: the order in which you take items off the to-do list.',
    nav0: '0 Lists', nav1: '1 Marks', nav2: '2 Queue: BFS', nav3: '3 Stack: DFS', nav4: '4 Maze', nav5: '5 Work', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What the program has',
    s0t: 'The program cannot see the map. What does it actually know?',
    s0e: 'This step asks: to find every place reachable from A, what information does the program have? A map like this is a <strong>graph</strong>: a set of <strong>nodes</strong> (places, here A–H) and a set of <strong>edges</strong> (roads joining two nodes). Every road here works both ways, which makes it an <strong>undirected graph</strong>. The program does not get a picture; it gets each node’s <strong>adjacency list</strong>: the nodes joined to it by an edge, in alphabetical order. Below, V is the number of nodes and E the number of edges. An edge u–v appears in both u’s list and v’s list, so all the lists together hold exactly 2E entries.',
    s0lgOn: 'open road (edge)', s0lgOff: 'closed road (click to open)', s0lgSel: 'selected node and its edges',
    pickEdge: 'Pick a road', toggleEdge: 'Open / close this road', resetEdges: 'Restore default roads',
    adjTitle: 'Adjacency lists (the data the program really gets)',
    c0: 'Map: click a node to see its list, click a road to toggle it',
    s0readout: 'V = {V}, E = {E}; the lists hold {sum} entries in total = 2 × {E}. Selected {u}: its list is {list}, {deg} entries (that count is the degree of {u}).',
    s0hint: 'What to watch: click a node (or Tab to the lists below) and check that the highlighted edges match its row in the list one for one. Then click a dashed road to open it: each endpoint’s list grows by one entry and the total grows by 2. Roads you change here carry on into steps 1–3.',

    s1k: 'Step 1 · Why mark nodes',
    s1t: 'If you never mark a node as seen, does the loop ever stop?',
    s1e: 'This step asks: if you keep applying one rule, “take a node out, put its neighbours in”, why must you mark the nodes you have already put in? First, the <strong>to-do list</strong> (also called the frontier): nodes that have been found but not yet processed. The loop has one line: take a node off the to-do list, read its adjacency list (the nodes joined to it by an edge), put the neighbours on the to-do list. Here nodes come off in the order they went on; the next step explains why. A <strong>mark</strong> is a “seen” set: a node joins it the first time it goes on the list, and is skipped every time after that. Without marks, A puts B in, processing B puts A back, and as long as the graph has a single edge the to-do list never empties.',
    markOn: 'Mark on entry', markOff: 'No marks',
    round: 'One round', autoRun: 'Keep going', again: 'Start over',
    s1lgPut: '×n beside a node: times it went on the to-do list', s1lgNow: 'this run', s1lgPrev: 'previous run (other setting)',
    c1top: 'How many times each node went on the to-do list', c1bot: 'Nodes left on the to-do list (across: rounds done)',
    s1readout: '{r} rounds done (each takes 1 node off and puts its neighbours on), {total} insertions so far, {q} left on the to-do list.',
    s1took: 'Round {r} took {u} and put on {put}.',
    s1none: '(nothing new)',
    s1doneMark: 'The to-do list is empty and the loop stops by itself: each of the {n} reachable nodes went on exactly once.',
    s1capped: 'The demo stops at round {r}, but the loop itself would never stop: {q} nodes are still waiting and the list keeps growing; {u} has gone on {c} times.',
    s1hint: 'What to watch: with “No marks”, press “Keep going” and watch the ×n counts climb and the lower curve rise. Then switch to “Mark on entry” and run again: every node stops at ×1 and the curve falls back to 0. The grey line keeps the previous run for comparison. The switch changes the algorithm’s rule, not the graph.',

    s2k: 'Step 2 · Queue: breadth-first',
    s2t: 'First in, first out: in what order are nodes discovered?',
    s2e: 'This step asks: if the to-do list is a <strong>queue</strong> (first in, first out, or FIFO), what pattern does the discovery order follow? Walking this way is <strong>breadth-first search (BFS)</strong>. Each node gets a <strong>distance</strong> d: the fewest edges on any route from the start. When you take u off and find an unmarked v in its list, set d[v] = d[u] + 1 and draw u–v as a <strong>tree edge</strong> (v was discovered through u). The reason lies in the queue itself: nodes with smaller d always sit ahead of nodes with larger d, so the nodes that come off first and go on to discover neighbours are always the nearer ones. Hence the d a node gets when it is first discovered is its shortest edge count from the start (<a class="xlink" href="../../../computing/algorithms/shortest-path/#step1">→ Shortest Path, step 1: when roads have lengths, the to-do list is ordered by total length instead</a>).',
    startAt: 'Start', step: 'One action', play: 'Play', pause: 'Pause', reset: 'Start over',
    queueLabel: 'Queue', queueOut: 'front (taken next)', queueIn: 'back (new arrivals)', stackLabel: 'Stack', stackBottom: 'bottom', stackTop: 'top (taken next)', emptyBox: 'empty',
    s2lgTree: 'tree edge: how a node was discovered', s2lgScan: 'list entry being read', s2lgCur: 'node being processed', s2lgLayer: 'colour = distance d (one colour per layer)',
    c2: 'BFS: the number beside a node is its distance d',
    actTake: 'Take {u} off the queue and start reading its list.', actScanNew: 'Read {v} in {u}’s list: unmarked, so d[{v}] = {d} and it joins the queue.', actScanOld: 'Read {v} in {u}’s list: already marked, skip.', actDone: 'The queue is empty; BFS is finished.', actInit: 'Start {u} goes on the queue with d[{u}] = 0.',
    s2readout: 'Action {k}/{N}. {act} Discovery order: {order}. List entries read: {s}/{s2}.',
    s2final: 'Distances: {dists}.',
    s2hint: 'What to watch: press “One action”; each press does one thing (take a node off, or read one list entry). In the queue above, nodes of one colour always sit together, and the next block is exactly one layer deeper. When it finishes, pick a different start and run again to see the layers rearrange.',

    s3k: 'Step 3 · Stack: depth-first',
    s3t: 'Last in, first out: how does the walk change?',
    s3e: 'This step asks: same graph, same start, but the to-do list is now a <strong>stack</strong> (last in, first out, or LIFO). What does the walk become? This is <strong>depth-first search (DFS)</strong>: it keeps reading the list of the node on top of the stack (the newest one found); the moment it finds an unmarked neighbour it pushes it on top and carries on from there. When the top node’s list is used up it is popped and the walk returns to the node beneath and keeps reading; this is <strong>backtracking</strong>. So the stack always holds the route from the start to the current node. DFS also reaches every reachable node exactly once, but routes along its tree edges are not guaranteed to be shortest: it digs deep first instead of advancing layer by layer.',
    s3lgOn: 'on the stack (current route)', s3lgDone: 'popped (list used up)', edgeOpen: 'open', edgeClosed: 'closed',
    s3lgBfs: 'BFS queue length (whole run)', s3lgDfs: 'DFS stack depth (up to now)', s3lgTree: 'DFS tree edge', s3lgOrder: '#k beside a node: k-th to be discovered',
    c3top: 'DFS: #k beside a node is its discovery order', c3bot: 'Nodes on the to-do list (across: action number)',
    actPush: 'Read {v} in {u}’s list: unmarked, so push it and go deeper into {v}.', actPop: '{u}’s list is used up: pop it and backtrack.', actDoneDfs: 'The stack is empty; DFS is finished.', actInitDfs: 'Start {u} is pushed on the stack.',
    s3readout: 'Action {k}/{N}. {act} Discovery order: {order}.',
    s3path: 'DFS tree route {s} → {t}: {path} ({len} edges); the BFS shortest distance is {bfs} edges.',
    s3same: 'DFS tree route {s} → {t}: {path} ({len} edges), which this time happens to match the BFS shortest distance.',
    s3noPath: '{t} cannot be reached from {s}: neither walk will discover it.',
    s3hint: 'What to watch: press “Play” and see the orange line (stack depth) climb steadily, then step back down, while the cyan line (BFS queue) stays low. Then toggle a road below (try C–D), replay, and see how the discovery order and the DFS tree change.',

    s4k: 'Step 4 · Shortest route in a maze',
    s4t: 'In a maze, which walk gives the shortest route directly?',
    s4e: 'This step asks: what is the fewest number of moves from S to T? Treat the maze as a graph: each open square is a node, two open squares that touch up, down, left or right share an edge, and wall squares are not nodes. BFS starts at S: layer 1 is S’s neighbours, layer 2 their new neighbours, and so on, like water spreading out from S ring by ring. The number in each square is its layer d, the fewest moves needed to get there from S. <strong>The layer at which the flood first touches T is the shortest number of moves</strong>, and following tree edges back from T to S traces one shortest route. DFS charges ahead in a fixed direction order (right, down, left, up) and only backtracks at walls; it also reaches T, but usually by a long detour.',
    flood: 'Flood with BFS, layer by layer', showDfs: 'Overlay the DFS route', resetWalls: 'Restore default walls', clearWalls: 'Remove all walls',
    s4lgBfs: 'BFS shortest route', s4lgDfs: 'route DFS found', s4lgWall: 'wall (click a square to add / remove)', s4lgNum: 'number = layer d (fewest moves from S)',
    c4: 'Maze: S is the start, T the goal',
    s4progress: 'Flooded to layer {k}/{K}. ',
    s4readout: 'BFS: shortest route {len} moves; the finished flood reaches {reach} squares (the farthest is {far} moves from S).',
    s4dfs: 'DFS (right, down, left, up): found a route of {len} moves, {extra} more than the shortest; it discovered {seen} squares before touching T.',
    s4none: 'T is walled off: BFS floods all {reach} reachable squares without touching T, so no route exists.',
    s4hint: 'What to watch: press “Flood with BFS” and see the numbers grow outward ring by ring, with the cyan shortest route appearing once T is reached. Then press “Overlay the DFS route” and compare lengths. Finally click squares to wall off the cyan route and see the shortest count grow, or T become unreachable.',

    s5k: 'Step 5 · Amount of work',
    s5t: 'As the graph grows, what is BFS’s work proportional to?',
    s5e: 'This step asks: with more nodes and edges, how many basic actions does BFS take? There are two kinds: taking a node off the to-do list (thanks to marks, each node comes off once, V times in all) and reading one adjacency-list entry (each edge is read once from each end, 2E times in all). The total is exactly V + 2E, written O(V + E): only the shape of the growth counts, not the constants (<a class="xlink" href="../../../computing/algorithms/sorting/#step4">→ Sorting, step 4: big O compares shapes of growth</a>). A graph can also be stored as an <strong>adjacency matrix</strong>: a V × V table whose row u, column v says whether u and v share an edge. Then, after taking u, BFS must scan the whole row of V cells to learn who its neighbours are, so the total becomes V + V², no matter how few edges there are. The graphs here are random and connected: first a random tree, then random extra edges until each node has d edges on average (E = V·d/2).',
    vSlider: 'Nodes V', dSlider: 'Average degree d (edges per node)', clearPts: 'Clear recorded points',
    s5lgList: 'adjacency list: measured actions', s5lgMat: 'adjacency matrix: measured actions', s5lgCurve: 'dashed: V + V·d and V + V² at the current d',
    c5: 'Basic actions (log scale) against node count V',
    s5readout: 'V = {V}, E = {E} (average degree {d}). Adjacency list: {V} takes + {scan} list entries = {list} actions (= V + 2E). Adjacency matrix: {V} takes + {mat} cells scanned = {mtot} actions (= V + V²), {ratio} times the list.',
    s5hint: 'What to watch: hold d = 2 and drag V from 20 to 400: the cyan points climb a gentle slope while the orange ones rise far more steeply. Then hold V and drag d: the cyan points rise with the edge count while the orange ones do not move. Every combination you try stays on the chart. The sliders change the generated graph; the counts come from actually running BFS on it.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One loop, different to-do lists',
    s6fin: 'The whole page used a single loop: <strong>take a node off, read its list, put unmarked neighbours on the to-do list</strong>. Marks make sure each node is processed once, so the loop stops. How the list hands nodes back sets the walk: a queue gives BFS, which advances in layers of distance, so the layer at first discovery is the shortest edge count; a stack gives DFS, which digs to a dead end and backtracks, reaching everything but with no promise that its tree routes are shortest. As for work, with adjacency lists both take V + 2E basic actions; with an adjacency matrix, V + V².',
    formula: 'BFS: queue → d[v] = d[u] + 1 = fewest edges\nDFS: stack → the stack is the current route\nWork: lists V + 2E, matrix V + V²',
    boundary: 'Scope: the graphs here are undirected, every edge counts as one move, and they are small. “BFS gives shortest routes” holds only when every edge has the same length; with lengths, nodes must come off in order of total distance (Dijkstra’s algorithm). The exact route DFS takes depends on list order (alphabetical here, right-down-left-up in the maze); another order gives another route. V in the work count means nodes reachable from the start; if some are unreachable, covering the whole graph needs fresh starts from each unmarked node.',
    linksTitle: 'Keep going',
    lk1: '→ Shortest Path, step 1: when edges have lengths, replace the queue with a list ordered by total length',
    lk2: '→ Recursion, step 0: when a function calls itself, the system keeps a stack of where to return to, the same stack DFS uses',
    lk3: '→ PageRank, step 1: walking along edges again, but picking a random one at each step',
    lk4: '→ Sorting, step 4: why V + 2E is written O(V + E)',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Graph Algorithms · Let Edges Lead”.'
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
  if (typeof window.refreshGraphLesson === 'function') window.refreshGraphLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.GRAPH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
