window.COPY = {
  "docTitle": [
    "980 · 不同路径 III",
    "980 · Unique Paths III"
  ],
  "title": [
    "#980 · 不同路径 III",
    "#980 · Unique Paths III"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "intro": [
    "四个格子，走到终点还不够：你必须把每个可走格恰好踩一次。",
    "Four squares. Reaching the finish is only enough if you have stepped on every usable square exactly once."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "0 · 到达，不等于完成",
    "0 · Arrival is not completion"
  ],
  "s1": [
    "1 · 先尝试，再撤销",
    "1 · Try, explore, restore"
  ],
  "s2": [
    "2 · 看一条分支如何返回",
    "2 · Watch a branch return"
  ],
  "s3": [
    "3 · 先预测新的棋盘",
    "3 · Predict a fresh board"
  ],
  "s4": [
    "4 · 对照 Python 实现",
    "4 · Reconstruct the Python"
  ],
  "q0": [
    "这一步要回答：下面的四格棋盘有几条合格路线？输入 1 是起点 S，2 是终点 E，0 是空格，−1 是不可走的墙。每步只能上下左右走；路线是按顺序经过的一串相邻格，不能重复任何格。目标是数出从 S 到 E 且覆盖所有非墙格的路线。",
    "How many valid walks does this four-square board have? Input 1 marks start S, 2 marks end E, 0 is empty, and −1 is a wall. Each move goes up, down, left, or right. A walk is an ordered sequence of adjacent squares without repeats. Count walks from S to E covering every non-wall square."
  ],
  "hand": [
    "输入 [[1,2],[0,0]]。坐标 (行,列) 从 0 开始。先看 S(0,0) → E(0,1)：只踩了 2 格，还剩 2 格，所以贡献 0。再看 S → (1,0) → (1,1) → E：踩完 4 格，所以贡献 1。S 只有右、下两种第一步，两条分支已穷尽，答案 0 + 1 = 1。",
    "Input [[1,2],[0,0]]. Coordinates (row,column) start at zero. First try S(0,0) → E(0,1): only 2 squares visited, 2 remain, so it contributes 0. Then S → (1,0) → (1,1) → E: all 4 visited, so it contributes 1. S has only right and down as first moves. These exhaust its branches: 0 + 1 = 1."
  ],
  "constraints": [
    "官方范围：1 ≤ m,n ≤ 20，m×n ≤ 20；恰有一个起点和一个终点。起终点都算必须覆盖的格子。返回整数条数，无取模。",
    "Official bounds: 1 ≤ m,n ≤ 20 and m×n ≤ 20, with exactly one start and one end. Both endpoints must be covered. Return an integer count, with no modulus."
  ],
  "q1": [
    "这一步要回答：怎样数全路线，又不重复计数？基线（简单正确的比较方法）是把除 S、E 外的所有可走格排列成每一种顺序，在两端放上 S、E，再检查每对相邻格是否上下左右相连。排列就是把这些格全部排一次序。每条合格路线恰好对应一种排列，但大量排列的第一步就已经不相连。",
    "How can we count every walk exactly once? A baseline, meaning a simple correct comparison method, orders all usable squares other than S and E in every possible way, places S and E at the ends, and checks whether each consecutive pair shares an edge. Each valid walk corresponds to exactly one ordering, but many orderings fail at their first move."
  ],
  "baseline": [
    "V 表示非墙格数。排列基线最多检查 (V−2)! 种顺序，每种花 O(V) 时间，另用 O(V) 空间。下面的可执行测试用它独立核对小棋盘。正式方法不生成已知不相邻的后缀，而是只接上合法的下一格；这叫回溯：尝试一步，探索其后续，再撤销这一步。",
    "Let V be the number of non-wall squares. The permutation baseline checks up to (V−2)! orderings in O(V) time each, using O(V) extra space. The executable tests use it independently on small boards. The submission instead extends only to legal neighbors, avoiding suffixes whose prefix already fails. This is backtracking: try a move, explore its continuations, then undo the move."
  ],
  "derive": [
    "回到四格棋盘：进入 S 后，path=[(0,0)]，remaining=3；进入右边 E 后，path 长度为 2，remaining=2，必须返回 0。撤销 E 后，父分支仍停在 S，remaining 又是 3。接着进入下格时，remaining=2，右格为 1，最后 E 为 0，此时才返回 1。",
    "On the four-square board, entering S gives path=[(0,0)] and remaining=3. Entering E on the right gives path length 2 and remaining=2, so return 0. Undoing E leaves the parent at S with remaining=3. The down branch then has remaining=2, the bottom-right square has 1, and E finally has 0: this time return 1."
  ],
  "invariant": [
    "由此得到不变量（每次操作都保持的事实）：path 是从 S 出发、互不重复且相邻的当前路线；已标记的格恰好是 path 中的格；remaining = V − len(path)，即进入当前格之后仍未使用的格数。进入新格时标记它并减 1；返回时还原它。remaining 是每次调用自己的整数，父调用的值不会被子调用改动。",
    "This gives an invariant, a fact maintained at each operation: path is the current adjacent, non-repeating walk from S; marked squares are exactly those in path; remaining = V − len(path) is the number still unused after entering the current square. Entering marks a square and subtracts 1; returning restores it. Each call owns its integer remaining, so a child does not change its parent’s value."
  ],
  "proof": [
    "为什么计数正确？每条合格后续都有唯一的下一格，因此不同下一格的分支互不重叠，分支计数可以相加。算法尝试每个未使用的合法邻格，所以不会漏掉路线。到 E 就停止，只有 remaining=0 才计 1；不能穿过 E 后继续走。每次深入至少少一格，因此一定终止。还原标记后，兄弟分支面对与父调用相同的可用格。",
    "Why does the count work? Every valid continuation has one specific next square. Different next-square branches are disjoint, so their counts add. Trying every unused legal neighbor misses no walk. Stop at E and count 1 only when remaining=0; a walk cannot pass through E and continue. Every deeper call consumes a square, so recursion terminates. Restoring the mark gives siblings the same available squares their parent had."
  ],
  "wrong": [
    "诱人的错误：只要碰到 E 就加 1。四格例子的 S → E 会被误计，使答案从 1 变成 2。另一个错误是把访问标记永久保留：第一条失败分支踩过的 E 必须还原，否则绕一圈的成功路线无法再使用 E。",
    "Tempting mistake: count 1 whenever E is reached. That incorrectly counts S → E on the four-square board, changing 1 to 2. Another mistake is keeping visit marks forever: E from the first failed branch must be restored, or the successful route around the board cannot use E."
  ],
  "q2": [
    "这一步要回答：一次进入、返回和兄弟分支，究竟改变了什么？这是 JavaScript 教学模拟，不是在执行下方 Python。图中行从上往下、列从左往右，坐标从 0 开始；S/1、E/2、·/0、×/−1 表示原始输入，#k 表示当前路线的第 k 格，双线框表示当前格。",
    "What changes during entry, return, and a sibling branch? This is a JavaScript teaching simulation, not execution of the Python below. Rows run downward, columns rightward, starting at zero. S/1, E/2, ·/0, ×/−1 show original input; #k shows visit order in the current path; a double outline marks its current square."
  ],
  "hint": [
    "先保持四格预设不变，逐事件前进：看 E 提前到达时还剩 2 格，再看撤销后 E 的路线编号消失，最后看绕行路线计入累计数。回退恢复整个快照。每帧是所述操作刚完成的状态；不跳过分支。下方保留最近 8 个事件，所有事件均可逐个导航。",
    "Keep the four-square preset first. Advance event by event: see 2 squares remaining at early E, watch E’s visit number disappear on undo, then see the long route added to the cumulative count. Back restores the whole snapshot. Each frame is just after its named operation; no branches are skipped. The ledger shows the last 8 events; all events remain individually navigable."
  ],
  "preset": [
    "棋盘预设（更换会重置本实验）",
    "Board preset (changing restarts this experiment)"
  ],
  "p0": [
    "四格 · 1 条",
    "Four squares · 1 walk"
  ],
  "p1": [
    "官方示例 1 · 2 条",
    "Official example 1 · 2 walks"
  ],
  "p2": [
    "官方示例 2 · 4 条",
    "Official example 2 · 4 walks"
  ],
  "p3": [
    "官方示例 3 · 0 条",
    "Official example 3 · 0 walks"
  ],
  "p4": [
    "相邻起终点 · 1 条",
    "Adjacent S/E · 1 walk"
  ],
  "p5": [
    "墙隔开两端 · 0 条",
    "Wall-separated · 0 walks"
  ],
  "prev": [
    "← 上一事件",
    "← Previous event"
  ],
  "next": [
    "下一事件 →",
    "Next event →"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "end": [
    "到搜索结束",
    "Go to search end"
  ],
  "progress": [
    "事件 {i}/{n} · {event}",
    "Event {i}/{n} · {event}"
  ],
  "ready": [
    "尚未进入起点",
    "Before entering start"
  ],
  "enter": [
    "进入 {at} 并标记",
    "Enter and mark {at}"
  ],
  "early": [
    "在 {at} 提前到达 E：本分支贡献 0",
    "Early E at {at}: branch contributes 0"
  ],
  "accept": [
    "在 {at} 覆盖完所有格：本分支贡献 1",
    "All squares covered at {at}: branch contributes 1"
  ],
  "dead": [
    "{at} 无合法下一格：本分支贡献 0",
    "No legal next square at {at}: branch contributes 0"
  ],
  "undo": [
    "撤销 {at} 的标记，返回父调用",
    "Restore {at} and return to parent"
  ],
  "done": [
    "搜索结束，所有标记已还原",
    "Search complete; all marks restored"
  ],
  "read": [
    "当前路线 {path}；未用格 remaining={r}；截至本事件已找到的合格路线={n}。",
    "Current path {path}; unused squares remaining={r}; valid walks found through this event={n}."
  ],
  "empty": [
    "空",
    "empty"
  ],
  "routes": [
    "已找到的完整路线（累计，不是当前分支）：",
    "Complete walks found so far (cumulative, not the current branch):"
  ],
  "none": [
    "尚未找到",
    "None found yet"
  ],
  "recent": [
    "最近事件（最多 8 个）",
    "Recent events (up to 8)"
  ],
  "boardLabel": [
    "当前搜索棋盘，行列坐标从零开始",
    "Current search board with zero-based row and column coordinates"
  ],
  "q3": [
    "这一步要回答：新棋盘 [[1,0,2],[0,−1,0]] 有几条合格路线？中间下格是墙。先在脑中按四方向行走：终点是停止点，每个非墙格必须恰好使用一次。此题独立于上方预设，先选择再揭晓。",
    "How many valid walks does the fresh board [[1,0,2],[0,−1,0]] have? The bottom-middle square is a wall. Walk through it mentally using four directions: E is a stopping point, and every non-wall square must be used exactly once. This exercise is independent of the presets. Choose before revealing."
  ],
  "choose": [
    "预测完整路线条数",
    "Predict the number of complete walks"
  ],
  "option0": [
    "1 条：沿上边到达终点",
    "1: follow the top edge to E"
  ],
  "option1": [
    "0 条：无法同时覆盖两侧的末端",
    "0: cannot cover both dangling squares"
  ],
  "option2": [
    "2 条：起点有两个方向",
    "2: S has two possible first moves"
  ],
  "reveal": [
    "核对并揭晓",
    "Check and reveal"
  ],
  "feedback": [
    "{verdict} 正确数目是 0。从 S 向下到 (1,0) 后无路可走，贡献 0；向右再到 E 时还漏掉 (1,0) 与 (1,2)，也贡献 0。不能到达 E 后再向下走。两个第一步并不等于两条完整路线。",
    "{verdict} The answer is 0. Down from S reaches (1,0) with no legal continuation, contributing 0. Right and then E leaves (1,0) and (1,2) unused, also contributing 0. You cannot continue downward after reaching E. Two first moves do not imply two complete walks."
  ],
  "correct": [
    "预测正确。",
    "Your prediction is correct."
  ],
  "incorrect": [
    "这次预测多计了失败分支。",
    "This prediction counts failed branches."
  ],
  "q4": [
    "这一步要回答：怎样把上述规则写成官方 Python 接口？Solution.uniquePathsIII(grid) 返回整数。dfs 是递归函数，即函数调用自身，处理剩余格更少的子任务。网格中的 −1 同时代表墙和当前路线已用格；只有在返回前恢复，才能安全共用网格。",
    "How do these rules become the official Python interface? Solution.uniquePathsIII(grid) returns an integer. dfs is recursive: it calls itself on a task with fewer remaining squares. In the working grid, −1 means either a wall or a square used by the current path. Restoring cells before returning makes this shared grid safe."
  ],
  "map": [
    "代码对应：双循环数出 remaining 并找到 S。dfs 保存原值 saved，标 −1，再把 remaining 减 1。saved==2 检查终点；int(remaining==0) 把真/假变为 1/0。否则逐个尝试合法邻格，把子调用的条数加到本调用的 total。最后恢复 saved 并返回 total。total 是当前调用的后续总数；模拟的“累计已找到”是整段搜索进度，两者不是同一个变量。",
    "Code map: the two loops count remaining and locate S. dfs saves the original value in saved, marks −1, and subtracts 1 from remaining. saved==2 tests E; int(remaining==0) converts true/false to 1/0. Otherwise, legal neighbors are tried and child counts added to this call’s total. Finally restore saved and return total. total counts continuations for one call; the simulation’s cumulative count tracks the whole search. They are different quantities."
  ],
  "call": [
    "具体调用：dfs(S,4) 进入后剩 3；其右子调用 dfs(E,3) 进入后剩 2，返回 0 并恢复 E。父调用的 remaining 仍为 3，向下的兄弟调用依次消耗到 0，返回 1。起点 total=0+1=1，恢复 S 后返回。",
    "Concrete calls: dfs(S,4) enters with 3 left. Its right child dfs(E,3) enters with 2 left, returns 0 and restores E. The parent still has remaining=3. The down sibling eventually consumes the remainder to 0 and returns 1. The start’s total is 0+1=1; it restores S and returns."
  ],
  "cost": [
    "成本：V 为非墙格数。扫描 O(mn)；第一步最多 4 个方向，此后至少来路已被标记，最多 3 个新方向，深度至多 V，故时间上界 O(mn + 3^V)，并非多项式算法。递归栈 O(V)，原网格被临时改写后完整还原。教学模拟另存每事件的路径快照与成功路线，空间远大于提交代码，不能算作提交空间。",
    "Cost: V is the number of non-wall squares. Scanning costs O(mn). The first move has at most 4 directions; later the preceding square is marked, leaving at most 3 new directions. Depth is at most V, giving an O(mn + 3^V) upper bound, still exponential. The recursive stack uses O(V) space; the temporarily modified input is fully restored. The simulation additionally stores per-event paths and successful walks; its snapshot space is not the submission’s space."
  ],
  "bounds": [
    "边界：[[1,2]] 返回 1；[[1,−1,2]] 返回 0；[[0,1],[2,0]] 返回 0，即使可以到终点也无法踩完四格。所有可走格连通也不保证有完整路线；起终点可能在任意位置。恰有两种端点意味着单格网格不是合法输入。",
    "Boundaries: [[1,2]] returns 1; [[1,−1,2]] returns 0; [[0,1],[2,0]] returns 0 even though E is reachable. Connectivity alone does not guarantee a complete walk. S and E can be anywhere. A one-square board cannot satisfy the requirement for two distinct endpoints."
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
    "展开官方接口 Python 源码",
    "Open Python source for the official interface"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用。完整源码已选中，请按系统复制快捷键。",
    "Automatic copying is unavailable. Full source is selected; use your system copy shortcut."
  ],
  "related": [
    "相关概念",
    "Related concepts"
  ],
  "related0": [
    "N 皇后：约束与撤销 →",
    "N-Queens: constraints and undo →"
  ],
  "related1": [
    "不同子序列：把互斥分支计数相加 →",
    "Distinct Subsequences: add disjoint branch counts →"
  ],
  "foot": [
    "本页图示为有限预设的教学模拟；Python 文件可单独运行验证。",
    "The diagrams simulate finite presets for teaching; the Python file can be validated separately."
  ],
  "langLabel": [
    "语言选择",
    "Language selection"
  ],
  "navLabel": [
    "学习步骤",
    "Lesson steps"
  ],
  "baselineCode": [
    "查看排列基线的 Python 核心",
    "Inspect the permutation baseline in Python"
  ],
  "baselineApi": [
    "cells 是所有非墙格的坐标列表，start、end 是起终点坐标。permutations(middle) 逐个产生全部顺序；list(order) 把一个顺序转为列表。相邻坐标的行差绝对值与列差绝对值之和必须为 1。answer 是最终条数。",
    "cells lists all non-wall coordinates; start and end are endpoint coordinates. permutations(middle) generates every ordering; list(order) converts one ordering to a list. Adjacent coordinates must have absolute row difference plus absolute column difference equal to 1. answer is the final count."
  ]
};
