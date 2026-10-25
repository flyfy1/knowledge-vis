window.LESSON_COPY = {
  "docTitle": [
    "#675 · 为高尔夫比赛砍树",
    "#675 · Cut Off Trees for Golf Event"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "title": [
    "#675 · 为高尔夫比赛砍树",
    "#675 · Cut Off Trees for Golf Event"
  ],
  "intro": [
    "先走过高树，再回来砍它：砍树顺序固定，走路顺序却不固定。",
    "Walk past a tall tree, then return to cut it: the cutting order is fixed, the visiting order is not."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "1 · 三步小路",
    "1 · A three-step walk"
  ],
  "nav1": [
    "2 · 固定的路段",
    "2 · Fixed legs"
  ],
  "nav2": [
    "3 · 距离逐层增长",
    "3 · Distance layers"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav4": [
    "5 · Python 与边界",
    "5 · Python & limits"
  ],
  "s0t": [
    "为什么必须走过一棵更高的树？",
    "Why walk past a taller tree?"
  ],
  "s0e": [
    "这一问：森林只有一行 [1,3,2] 时，最少走几步？从最左格 (0,0) 开始；坐标是从 0 开始的 (行,列)。0 是障碍，1 是可走的空地，大于 1 是可走的树，数值是高度。每步只能上下左右走一格；只有站在树上才能砍，砍树本身不计步。必须先砍 2，再砍 3。",
    "How many moves are needed for the one-row forest [1,3,2]? Start at the left cell (0,0); coordinates are zero-based (row,column). A 0 blocks movement, a 1 is open ground, and a value above 1 is a walkable tree of that height. Each move goes one cell up, down, left or right. Cut only the tree you stand on; cutting adds no walking steps. Cut 2 before 3."
  ],
  "handTask": [
    "先用手指走一遍，再展开路线。经过树不等于砍树。",
    "Trace a route with your finger before opening it. Visiting a tree does not cut it."
  ],
  "handShow": [
    "展开三步路线",
    "Show the three-move route"
  ],
  "handHide": [
    "收起路线",
    "Hide the route"
  ],
  "handHidden": [
    "已知：起点在第 0 列，树 2 在第 2 列，树 3 在第 1 列。先自己计算。",
    "Given: start at column 0, tree 2 at column 2, tree 3 at column 1. Work out the walk first."
  ],
  "handAnswer": [
    "列 0 → 1 → 2（砍 2）→ 1（砍 3）。去 2 至少走 2 步；再回 3 至少走 1 步；2 + 1 = 3 步。树 3 在第一次经过时仍然是树，但允许走过。",
    "Column 0 → 1 → 2 (cut 2) → 1 (cut 3). Reaching 2 needs at least 2 moves; returning to 3 needs at least 1. Thus 2 + 1 = 3 moves. Tree 3 remains uncut on the first visit, but is still walkable."
  ],
  "s1t": [
    "为什么各段最短路可以直接相加？",
    "Why can shortest legs simply be added?"
  ],
  "s1e": [
    "这一问：走向下一棵树时，是否需要为未来保留另一条路线？把相邻两次必须砍树的位置之间的行走叫作一段；第一段从 (0,0) 出发。高度互异，排序后目标位置完全确定。砍树把正数变成 1；两者都可走。因此所有段使用同一张地图，之前走哪条路不会改变下一段的选择。",
    "Must a route to the next tree preserve a better route for later? A leg is the walk between consecutive required cuts; the first leg starts at (0,0). Distinct heights fix the target positions after sorting. Cutting changes a positive value to 1, and both are walkable. Every leg therefore uses the same map: the path taken earlier cannot change later choices."
  ],
  "wrong": [
    "诱人的错误：只加坐标差。森林 [[1,0,2],[1,0,1],[3,1,1]] 中，起点到树 2 的行列差之和是 2，却有障碍挡路。实际必须下、下、右、右、上、上，共 6 步；再到树 3 需 4 步，总计 10。另一个错误是把未砍树当障碍：[1,3,2] 会被错误判为无解。",
    "Tempting mistake: add coordinate differences alone. In [[1,0,2],[1,0,1],[3,1,1]], the row-plus-column difference from the start to tree 2 is 2, but a wall blocks that route. The actual walk goes down, down, right, right, up, up: 6 moves. Reaching tree 3 then takes 4 more, for 10. Treating uncut trees as walls is also wrong: it falsely rejects [1,3,2]."
  ],
  "baselineCode": [
    "展开正确基线（仅用于小输入验证）",
    "Open the correct baseline (small-input checking only)"
  ],
  "fixedExample": [
    "回到 [1,3,2]：排序后目标在第 2 列、第 1 列。距离 d[0,2]=2、d[2,1]=1，故相加为 3。图中两个端点距离在砍树前后都不变。",
    "Back to [1,3,2]: sorted targets are columns 2 and 1. Distances d[0,2]=2 and d[2,1]=1 sum to 3. These endpoint distances stay unchanged after a cut."
  ],
  "baseline": [
    "正确基线：把每个正数格看作一个点，合法的一步连接两个点，这叫图。给格子编号：行×列数+列。d[a,b] 表示编号 a、b 两格的最短距离，k 是中转格。为所有点对计算最短距离：先把相邻点距离设为 1、自己到自己设为 0，其余设为无穷，再依次允许每个点作为中转点，更新 d[a,b] = min(d[a,b], d[a,k]+d[k,b])。这就是 Floyd–Warshall 基线。V = m×n 个格时，时间 O(V³)、空间 O(V²)；2500 格意味着约 156 亿次更新。我们只需要排序后相邻目标的距离，不需要所有点对。",
    "A correct baseline models each positive cell as a vertex and each legal move as a connection: this is a graph. Number a cell as row×column-count+column. d[a,b] denotes the shortest distance between cells a and b; k is an intermediate cell. Compute every pair’s shortest distance: initialize neighbors to 1, self-distance to 0, and others to infinity. Allow each vertex k as an intermediate stop and update d[a,b] = min(d[a,b], d[a,k]+d[k,b]). This is the Floyd–Warshall baseline. With V = m×n cells, it takes O(V³) time and O(V²) space: about 15.6 billion updates at 2500 cells. We only need distances between consecutive sorted targets, not every pair."
  ],
  "proof": [
    "证明从小路得出：任何合法完整行走都能在每次砍树处切成固定端点的段；每段不可能短于这两个端点之间的最短距离，这给出一个下界（所有合法答案都不能低于的值）。反过来，在不变的地图上，把这些最短路接起来，到达目标时才砍它，就得到合法行走，恰好达到下界。途中经过高树不砍即可。所以只要一段到不了就返回 -1，否则答案就是各段最短距离之和。",
    "The tiny walk suggests a proof. Split any legal complete walk at its cuts: each leg has fixed endpoints and cannot beat their shortest distance. Their sum is a lower bound, a value no legal answer can go below. Conversely, concatenate shortest routes on the unchanged map and cut each target on arrival. This legal walk attains the bound; pass taller trees without cutting them. If any leg is unreachable, return -1; otherwise sum the shortest leg distances."
  ],
  "s2t": [
    "怎样确认这一段再也不能更短？",
    "How do we know a leg cannot be shorter?"
  ],
  "s2e": [
    "这一问：从本段起点走到每格，最少需要几步？广度优先搜索（BFS）按距离一层一层向外扩张；一层是距离相同的一组格，当前要扩张的层叫前沿。先给起点距离 0，再由距离 d 的格发现未见过的正数邻格，赋值 d+1。用先入先出的队列处理格子，就能保证所有较近的格先处理。",
    "What is the fewest moves from this leg’s start to each cell? Breadth-first search (BFS) expands one distance layer at a time. A layer contains cells at the same distance; the layer being expanded is the frontier. Give the start distance 0. From distance d, discover unseen positive neighbors at d+1. A first-in, first-out queue ensures closer cells are processed first."
  ],
  "invariant": [
    "观察第一个层：它只包含一步能走到的格；第二层是尚未见过、两步可达的格。如果新发现的格有更短路线，那条路线的前一个格会在更早的层被处理，早就发现它了，矛盾。由此得到不变量：每个已标距离都是最短距离；每格只发现一次，障碍永不入队。目标第一次被发现时距离已最短；整个前沿为空仍未见到目标，就确实无路可走。",
    "Observe the first layer: it contains exactly the one-move neighbors. The second contains unseen cells reachable in two moves. If a newly discovered cell had a shorter route, its predecessor on that route would have been processed in an earlier layer and discovered it already—a contradiction. This gives the invariant, a fact retained after each layer: every assigned distance is shortest; discover each cell once and never enqueue a wall. The target’s first discovery fixes its minimum distance. An empty frontier without the target proves it unreachable."
  ],
  "legend": [
    "格内上行：原始值；下行 d：本段最短步数，·：未发现，#：障碍。F：当前前沿，T：本段目标，×：已砍。行从上到下、列从左到右，坐标从 0 开始。每格同时保留数值和状态，不只靠颜色。",
    "Cell top: original value. Bottom d: shortest moves in this leg; · means undiscovered, # a wall. F marks the frontier, T this leg’s target, × a cut tree. Rows run downward and columns rightward, both zero-based. Text markers preserve meaning alongside color."
  ],
  "gridName": [
    "森林与本段距离",
    "Forest and distances for this leg"
  ],
  "cell": [
    "格 ({r},{c})；原值 {h}；距离 {d}；{marks}",
    "Cell ({r},{c}); original {h}; distance {d}; {marks}"
  ],
  "front": [
    "前沿",
    "frontier"
  ],
  "target": [
    "目标",
    "target"
  ],
  "cutMark": [
    "已砍",
    "cut"
  ],
  "wall": [
    "障碍",
    "wall"
  ],
  "unknown": [
    "未发现",
    "undiscovered"
  ],
  "presetLabel": [
    "换森林（会重置此演示）：",
    "Change forest (restarts this trace):"
  ],
  "preset0": [
    "穿过高树 · 3 步",
    "Pass a taller tree · 3 moves"
  ],
  "preset1": [
    "绕过障碍 · 10 步",
    "Detour around a wall · 10 moves"
  ],
  "preset2": [
    "官方例 2 · 无法到达",
    "Official example 2 · unreachable"
  ],
  "preset3": [
    "起点就是树 · 0 步",
    "Tree at the start · 0 moves"
  ],
  "preset4": [
    "多段与回访 · 9 步",
    "Multiple legs & revisits · 9 moves"
  ],
  "preset5": [
    "起点被挡 · 无法到达",
    "Blocked start · unreachable"
  ],
  "sim": [
    "这是算法可视化模拟，不是运行下方的 Python。每次推进完成一整层、记录一次砍树或开始下一段；层内队列操作被合并，没有省略层。各段距离会清零，已完成账本会保留。",
    "This is an algorithm simulation, not execution of the Python below. Each advance completes a full layer, records a cut, or starts the next leg; queue operations within a layer are grouped, with no layers omitted. Distances restart for each leg; the completed ledger persists."
  ],
  "traceTask": [
    "先选“绕过障碍”，保持地图不变，逐层推进。看 d=2 时目标仍未发现，而 d=6 才到达；再后退、重放，账本与距离应一起恢复。",
    "Choose “Detour around a wall,” keep the map fixed, and advance by layers. At d=2 the target is still undiscovered; it is reached only at d=6. Rewind and replay: distances and the ledger should restore together."
  ],
  "prev": [
    "← 后退一帧",
    "← Back one frame"
  ],
  "next": [
    "推进一层 / 砍树 →",
    "Advance layer / cut →"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "end": [
    "跳到结尾",
    "Go to end"
  ],
  "frame": [
    "帧 {i}/{n} · 目标高度 {h} 在 ({r},{c}) · {action}。已完成路段的行走总数：{total} 步。",
    "Frame {i}/{n} · target height {h} at ({r},{c}) · {action}. Completed-leg walking total: {total} moves."
  ],
  "init": [
    "本段起点赋值 d=0",
    "initialized this leg’s start at d=0"
  ],
  "layer": [
    "已完成距离 {d} 层，前沿有 {count} 格",
    "completed distance layer {d}, frontier has {count} cells"
  ],
  "cut": [
    "已到达并砍掉目标，本段 {d} 步已加入账本",
    "reached and cut target; added this leg’s {d} moves to ledger"
  ],
  "done": [
    "全部砍完；最终答案 {total}",
    "all trees cut; final answer {total}"
  ],
  "unreachable": [
    "前沿耗尽，目标不可达；最终答案 -1",
    "frontier exhausted, target unreachable; final answer -1"
  ],
  "blocked": [
    "起点是障碍，无法出发；最终答案 -1",
    "start is blocked; cannot depart; final answer -1"
  ],
  "ledgerTitle": [
    "已完成的路段（只在砍树后入账）",
    "Completed legs (recorded only after cutting)"
  ],
  "empty": [
    "还没有完成路段；行走总数为 0。",
    "No completed legs yet; walking total is 0."
  ],
  "row": [
    "砍 {height}：({sr},{sc}) → ({tr},{tc})，本段 {distance} 步；累计 {before} + {distance} = {total} 步。",
    "Cut {height}: ({sr},{sc}) → ({tr},{tc}), leg {distance} moves; cumulative {before} + {distance} = {total} moves."
  ],
  "s3t": [
    "换一片森林，你会怎样走？",
    "How would you walk through a new forest?"
  ],
  "s3e": [
    "这一问：新森林 [[1,5,2],[0,0,3]] 的完整最少步数是多少？从 (0,0) 出发。树未砍也能走；按高度 2、3、5 砍。每一段只需在不变的地图上找最短路。此题独立于上方演示，先选再揭晓。",
    "What is the full minimum for a new forest [[1,5,2],[0,0,3]]? Start at (0,0). Uncut trees are walkable; cut in height order 2, 3, 5. Each leg needs a shortest route on the unchanged map. This exercise is independent of the trace above: choose before revealing."
  ],
  "predictionLegend": [
    "预测完整行走步数",
    "Predict the full walking total"
  ],
  "reveal": [
    "核对并揭晓",
    "Check and reveal"
  ],
  "await": [
    "选一个答案，再核对。改选会清除旧反馈。",
    "Choose an answer, then check it. Changing the choice clears old feedback."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还差一点。",
    "Not quite."
  ],
  "answer": [
    "答案是 5：起点 → 5 → 2，走 2 步但只砍 2；2 → 3 再走 1 步；3 → 2 → 5 再走 2 步。2+1+2=5。选 3 是把经过 5 当成已砍，漏掉最后回程；选 7 多算了不需要的往返。每段达到最短，且接起来合法，所以总数最少。",
    "The answer is 5: start → 5 → 2 takes 2 moves, cutting only 2; 2 → 3 takes 1; 3 → 2 → 5 takes 2. Thus 2+1+2=5. Choosing 3 counts the first visit to 5 as a cut and omits the return; choosing 7 adds an unnecessary round trip. Each leg is shortest and their concatenation is legal, so the total is minimal."
  ],
  "s4t": [
    "怎样把距离层写成可提交的 Python？",
    "How do the layers become submittable Python?"
  ],
  "s4e": [
    "这一问：哪些代码保证刚才看到的距离正确？下面是官方 Python3 接口 Solution.cutOffTree(forest)，返回整数步数或 -1。代码没有改动输入；因为可走性从不改变，不必真的把树改成 1。图中的 × 只是模拟记录。",
    "Which code guarantees the distances we just saw? Below is the official Python3 interface, Solution.cutOffTree(forest), returning integer moves or -1. The code preserves the input: because walkability never changes, it need not actually replace heights with 1. The diagram’s × is a simulation record."
  ],
  "map1": [
    "trees = sorted(...) 产生固定的砍树顺序；sr,sc 是本段起点，tr,tc 是目标。外层循环把每段最短步数加到 total，再把起点移到该目标。",
    "trees = sorted(...) fixes the cutting order. sr,sc is the leg’s start and tr,tc its target. The outer loop adds each shortest distance to total, then moves the start to that target."
  ],
  "map2": [
    "distance 中的 queue 是先入先出队列，保存 (行,列,步数)；seen 是已发现格的集合。popleft 取出最近的一层，邻格入队时标 seen，避免重复。模拟里起点 d=0 → 邻格 d=1 对应 queue.append(... steps + 1)。",
    "In distance, queue is first-in, first-out and stores (row,column,moves); seen is the set of discovered cells. popleft processes nearer layers first; mark neighbors seen when enqueuing to avoid repeats. The simulated transition from start d=0 to neighbors d=1 maps to queue.append(... steps + 1)."
  ],
  "map3": [
    "代码在目标出队时返回；模拟在完成目标首次发现的整层后展示，再记录砍树。两者距离相同，但帧不是逐行执行。队列耗尽返回 -1，外层立即停止，不会把失败段当成 0 步。",
    "The code returns when the target is dequeued; the simulation shows the full layer that first discovers it, then records its cut. Distances agree, but frames are not line-by-line execution. An exhausted queue returns -1 and the outer loop stops, rather than treating failure as a zero-length leg."
  ],
  "cost": [
    "令 T 为树的数量，V=m×n 为格数。排序 O(T log T)；每段 BFS 最多发现 V 格、每格检查 4 个方向，T 段共 O(TV)。总时间 O(Tmn + T log T)，额外空间 O(mn + T)，包括队列、seen 与排序列表。最坏 T≈2500：上界约 625 万次出队和 2500 万次方向检查，不是实测耗时。模拟保留所有教学快照，空间成本不代表提交代码。",
    "Let T count trees and V=m×n count cells. Sorting costs O(T log T). Each BFS discovers at most V cells and checks four directions per cell; T legs cost O(TV). Total time is O(Tmn + T log T), auxiliary space O(mn + T) for the queue, seen set and sorted list. At T≈2500 the bound is about 6.25 million dequeues and 25 million direction checks, not a measured runtime. Retained teaching snapshots have separate memory costs from the submission."
  ],
  "boundaries": [
    "边界：树就在起点时该段为 0；单行也允许回走；被障碍隔开的任一目标使答案为 -1；起点为 0 时也返回 -1。官方保证至少一棵树、高度互异，m,n≤50，格值≤10⁹；不需要处理同高树的排序选择，也不需要最少砍树动作数。官方例 1、2、3 分别是 6、-1、6。",
    "Boundaries: a tree at the start gives a zero-move leg; a single row may require backtracking; any disconnected target makes the answer -1; a blocked start also returns -1. The official contract guarantees at least one tree, distinct heights, m,n≤50 and values≤10⁹. There is no equal-height ordering decision, and the output does not count cutting actions. Official examples 1, 2 and 3 give 6, -1 and 6."
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "查看官方接口的完整解法",
    "View the complete official-interface solution"
  ],
  "copied": [
    "已复制完整 Python 源码。",
    "Copied the complete Python source."
  ],
  "fallback": [
    "剪贴板不可用。已选中完整源码；用系统复制快捷键复制。",
    "Clipboard unavailable. Full source is selected; use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "related1": [
    "继续学：单词图中的分层搜索",
    "Next: layered search in a word graph"
  ],
  "related2": [
    "继续学：二维地图上的逐层扩张",
    "Next: expanding across a two-dimensional map"
  ],
  "foot": [
    "作者自查候选；独立评审待进行。可视化是模拟，未声称 LeetCode 提交通过或真实学习者效果。",
    "Author self-checked candidate; independent review pending. The visualization is a simulation; no LeetCode acceptance or learner outcome is claimed."
  ]
};
