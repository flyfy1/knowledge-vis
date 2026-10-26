window.LESSON_COPY = {
  "docTitle": [
    "#1036 · 逃离大迷宫",
    "#1036 · Escape a Large Maze"
  ],
  "title": [
    "#1036 · 逃离大迷宫",
    "#1036 · Escape a Large Maze"
  ],
  "back": [
    "← LeetCode 知识目录",
    "← LeetCode collection"
  ],
  "intro": [
    "不必走遍一万亿个格子。用少量障碍能围住多少格，来决定何时停止搜索。",
    "A trillion cells need not be explored. Bound how many cells a few obstacles can isolate, then stop searching with a proof."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "学习步骤",
    "Lesson steps"
  ],
  "nav1": [
    "1 · 角落能走吗？",
    "1 · Can the corner move?"
  ],
  "h1": [
    "1 · 角落能走吗？",
    "1 · Can the corner move?"
  ],
  "nav2": [
    "2 · 证明搜索上界",
    "2 · Prove a search budget"
  ],
  "h2": [
    "2 · 证明搜索上界",
    "2 · Prove a search budget"
  ],
  "nav3": [
    "3 · 从两端搜索",
    "3 · Search both endpoints"
  ],
  "h3": [
    "3 · 从两端搜索",
    "3 · Search both endpoints"
  ],
  "nav4": [
    "4 · 先预测再揭晓",
    "4 · Predict before revealing"
  ],
  "h4": [
    "4 · 先预测再揭晓",
    "4 · Predict before revealing"
  ],
  "nav5": [
    "5 · 落实到 Python",
    "5 · Implement in Python"
  ],
  "h5": [
    "5 · 落实到 Python",
    "5 · Implement in Python"
  ],
  "p1": [
    "这一步要回答：从 (0,0) 能到 (0,2) 吗？障碍只有 (1,0)、(0,1)。向右、向上都被挡住；向左、向下会出界。所以能到达的格子只有起点，答案是 false。斜走到 (1,1) 不合法。",
    "Can (0,0) reach (0,2)? Only (1,0) and (0,1) are blocked. Right and up hit obstacles; left and down leave the grid. The only reachable cell is the start, so the answer is false. A diagonal move to (1,1) is illegal."
  ],
  "rules": [
    "原题：坐标 x、y 都在 0…999999，最多 200 个障碍；每次只向上下左右走一格。起终点不同且都无障碍。只返回能否到达，不求路径长度。下面图中 x 向右，y 向上。",
    "Official rules: x and y range from 0 to 999999, with at most 200 blocked cells. Move one cell horizontally or vertically. The distinct endpoints are unblocked. Return reachability, not path length. In the diagram, x increases rightward and y upward."
  ],
  "hand": [
    "手算核对：起点已计入 1 格；合法新邻居 0 格；待处理格子耗尽 → false。第 3 步选择 A，逐次展开来核对。",
    "Hand check: count the start as 1 reached cell; there are 0 legal new neighbors; pending cells run out → false. Select A in step 3 and expand to check this."
  ],
  "p2": [
    "这一步要回答：怎样证明“不用再搜了”？基线是广度优先搜索（BFS）：用先进先出队列保存待展开的格子，每次取最早加入的一格，把未见过的合法邻居加入队列。队列空且没遇到目标才返回 false。",
    "How can we prove that further exploration is unnecessary? The baseline is breadth-first search (BFS): a first-in, first-out queue holds cells awaiting expansion. Remove the earliest cell and add its unseen legal neighbors. An empty queue without the target means false."
  ],
  "baselineCost": [
    "代码中 tuple 将坐标变成可放入集合的不可变二元组，set 用于去重；deque 是先进先出队列，popleft() 取走最早加入的元素。基线正确，但网格边长 W=10⁶，最坏需要 O(W²) 时间和空间，即可能记录 10¹² 格。下面保留相同的搜索顺序，只改变停止条件。",
    "In the code, tuple turns coordinates into immutable pairs for set membership; set deduplicates cells. A deque is the FIFO queue, and popleft() removes its earliest entry. The baseline is correct, but a side length W=10⁶ gives O(W²) worst-case time and space: up to 10¹² cells. Keep the same search order and improve the stopping rule."
  ],
  "derive": [
    "令 b 为不同障碍格数。“干净行/列”指整行/列没有障碍。最多 b 行、b 列含障碍。因为 b≤200<W，必有干净行和干净列。每条干净行与每条干净列交叉，所以它们连成一个共同区域 C（区域指互相可达的所有格子）。",
    "Let b count distinct blocked cells. A clear row or column has no blocked cell anywhere on it. At most b rows and b columns contain blockers. Since b≤200<W, clear rows and columns exist. Every clear row intersects every clear column, so all these lines belong to one connected component C (a component is a set of mutually reachable cells)."
  ],
  "bound": [
    "C 外的格子不能在任何干净行或干净列上。因此它的行和列必须都含障碍：这样的行列交点最多 b×b 个。任何不属于 C 的区域最多 L=b² 格。搜索发现 L+1 个不同格子，就已证明起点属于 C；这不是已找到去目标的路径。",
    "A cell outside C cannot lie on any clear row or clear column. Its row AND column must contain blockers, giving at most b×b intersections. Any component other than C therefore has at most L=b² cells. Discovering L+1 distinct cells certifies that the start belongs to C; it does not mean a path to the target has been found."
  ],
  "formula": [
    "b = 不同障碍数；L = b²；已发现格数 > L ⇒ 属于 C",
    "b = distinct blockers; L = b²; discovered cells > L ⇒ membership in C"
  ],
  "conservative": [
    "这是保守上界，不是能围住面积的精确最大值。它已将每端搜索限制为 O((b+1)²)，不需要更紧的三角形界。",
    "This is a conservative bound, not the exact largest enclosure. It already limits each endpoint search to O((b+1)²), without requiring the tighter triangular bound."
  ],
  "wrong": [
    "诱人的错误：“起点搜出了超过 L 格就能返回 true”。即使起点属于 C，目标也可能被困在角落。场景 B 中起点 (4,4) 很自由，但目标 (0,0) 被两个障碍锁住，实际答案 false。",
    "Tempting mistake: “Return true once the source discovers more than L cells.” Even if the source belongs to C, the target can be trapped. In preset B, (4,4) is free to roam, but two blockers lock target (0,0) in a corner: the actual answer is false."
  ],
  "p3": [
    "这一步要回答：两端各需要什么证据？每端维护 seen（已发现的不同格子）与 queue（已发现但尚未展开的格子）。发现时立刻加入 seen，避免重复入队。遇到另一端直接成功；发现数超过 L=b² 则本端属于共同区域 C；否则队列耗尽就是被困。两端都成功才返回 true。",
    "What evidence is needed at each endpoint? Maintain seen (distinct discovered cells) and queue (discovered cells not yet expanded). Mark a cell seen when enqueuing it to avoid duplicates. Reaching the other endpoint succeeds directly; exceeding L=b² certifies membership in the common component C; otherwise an exhausted queue means trapped. Both checks must succeed to return true."
  ],
  "preset": [
    "场景（切换将重置此搜索）",
    "Preset (changing restarts this search)"
  ],
  "preset0": [
    "A · 起点被困",
    "A · Trapped source"
  ],
  "preset1": [
    "B · 目标被困",
    "B · Trapped target"
  ],
  "preset2": [
    "C · 同一小区域内到达",
    "C · Reach within one pocket"
  ],
  "preset3": [
    "D · 绕过短墙",
    "D · Detour around a short wall"
  ],
  "preset4": [
    "E · 无障碍，远目标",
    "E · No blockers, far target"
  ],
  "preset5": [
    "F · 另一角落的边界",
    "F · Opposite-corner boundary"
  ],
  "traceHint": [
    "先保持场景 A，点“展开下一格”观察已发现集合如何累积，再到末帧。换 B，看起点通过后为何仍要反向搜索。回退恢复完整快照。每帧是初始化、完整展开一格、或停止判断后的状态。",
    "Keep A fixed, expand the next cell, and watch the discovered set accumulate; then go to the end. Switch to B to see why the reverse check is still needed. Back restores full snapshots. Each frame follows initialization, one complete cell expansion, or a stop decision."
  ],
  "legend": [
    "标记：S 起点；T 目标；# 障碍；· 未发现；v 已发现；Q 待展开；[ ] 刚展开。一个格子可同时带多个标记。",
    "Markers: S source; T target; # blocked; · undiscovered; v discovered; Q pending; [ ] just expanded. A cell may carry multiple markers."
  ],
  "crop": [
    "图只显示标注坐标的 8×8 窗口；窗口边缘不是墙。每格坐标分两行显示 x, 然后 y。窄屏可横向滚动，键盘聚焦图后用方向键滚动。完整已发现集合与队列列在下方，远处目标可能不在窗口内。",
    "The drawing shows only the labeled 8×8 window; its edges are not walls. Each coordinate shows x, then y on separate lines. On narrow screens, scroll horizontally or focus the diagram and use arrow keys. The full discovered set and queue appear below. A distant target may be outside the window."
  ],
  "input": [
    "障碍={walls}；S={s}；T={target}",
    "blocked={walls}; S={s}; T={target}"
  ],
  "state": [
    "第 {phase}/2 端；L={limit} 格；已发现={n} 格；待展开={q} 格",
    "Endpoint {phase}/2; L={limit} cells; discovered={n} cells; pending={q} cells"
  ],
  "set": [
    "完整已发现集合：{cells}",
    "Full discovered set: {cells}"
  ],
  "queue": [
    "待展开队列（左侧最先）：{cells}",
    "Pending queue (earliest on left): {cells}"
  ],
  "empty": [
    "空",
    "empty"
  ],
  "start": [
    "初始化本端：只发现起始格。",
    "Initialize this endpoint: only its start is discovered."
  ],
  "expand": [
    "刚展开 {cell}；新增 {added}。只加入界内、无障碍且未见过的四方向邻居。",
    "Just expanded {cell}; added {added}. Add only in-bounds, unblocked, unseen orthogonal neighbors."
  ],
  "escaped": [
    "已发现 {n} > L={limit} 格：本端属于共同区域 C。",
    "Discovered {n} > L={limit} cells: this endpoint belongs to the common component C."
  ],
  "reached": [
    "取出 {cell} 正是另一端：已找到连通路径，不必超过上界。",
    "Removed {cell}, the other endpoint: a connecting path exists without needing to exceed the budget."
  ],
  "trapped": [
    "队列耗尽且未遇到另一端：本端被困。",
    "Queue exhausted without reaching the other endpoint: this endpoint is trapped."
  ],
  "progress": [
    "事件 {index}/{total}；{status}",
    "Event {index}/{total}; {status}"
  ],
  "ongoing": [
    "搜索未结束",
    "search not finished"
  ],
  "result": [
    "最终返回 {result}",
    "final return {result}"
  ],
  "prev": [
    "← 回退事件",
    "← Previous event"
  ],
  "next": [
    "展开下一格 / 下一判断 →",
    "Expand next cell / next decision →"
  ],
  "reset": [
    "重置搜索",
    "Reset search"
  ],
  "end": [
    "到最终结果",
    "Go to final result"
  ],
  "simulation": [
    "教学模拟，不执行下方 Python。预设的有界搜索事件全部保留，没有省略跳步。完整快照历史是教学额外空间，不计入提交代码的空间。",
    "Teaching simulation; it does not execute the Python below. Every bounded-search event for these presets is retained, with no omitted steps. Full snapshot history uses extra teaching memory excluded from submission space."
  ],
  "proof": [
    "不变量：seen 中每格都能从本端到达；queue 恰含尚未展开的已发现格。每个新邻居有一条来自当前格的合法边，所以此性质保持。队列空则整个可达区域已枚举。若提前超过 L，则本端只能属于 C。两个端点都属于 C 时互相可达；直接遇到另一端同样足够。反向检查不会把“仅起点自由”误当成整体可达。",
    "Invariant: every seen cell is reachable from this endpoint; queue contains exactly the discovered cells awaiting expansion. Each new neighbor has a legal edge from the current cell, preserving this property. An empty queue means the whole reachable component has been enumerated. Exceeding L instead places the endpoint in C. Two endpoints in C are connected; directly reaching the other endpoint also suffices. The reverse check prevents mistaking a free source for overall connectivity."
  ],
  "p4": [
    "这一步要回答：必须超过上界才算成功吗？新场景：障碍 (0,3)、(1,2)、(2,1)、(3,0)，起点 (0,0)，目标 (1,1)。L=b²=16，起点所在区域恰有 6 格。预测最终返回值与理由，再揭晓。",
    "Must a search exceed the budget to succeed? Fresh case: blockers (0,3), (1,2), (2,1), (3,0), source (0,0), target (1,1). The budget L=b²=16, and the source component has exactly 6 cells. Predict the return value and reason, then reveal."
  ],
  "choose": [
    "选择一个解释",
    "Choose an explanation"
  ],
  "opt0": [
    "false：6≤16，所以无法逃离",
    "false: 6≤16, so escape is impossible"
  ],
  "opt1": [
    "true：虽在小区域内，仍能直接到目标",
    "true: the target is reachable inside the small pocket"
  ],
  "opt2": [
    "true：只要起点没有被单格锁死",
    "true: the source is not locked into a single cell"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "correct": [
    "判断正确。",
    "Correct."
  ],
  "incorrect": [
    "这个理由不成立。",
    "That reasoning does not hold."
  ],
  "answer": [
    "路径 (0,0)→(1,0)→(1,1) 全部合法，两个搜索都能直接遇到另一端。超过 L 只是足够证据，不是必要条件。6 格不够证明属于 C，却不妨碍区域内部连通；“能走一步”也不保证能到任意目标。",
    "The path (0,0)→(1,0)→(1,1) is legal, and each search can directly reach the other endpoint. Exceeding L is sufficient evidence, not necessary. Six cells do not certify membership in C, but connectivity inside the pocket still holds. Merely being able to move once does not guarantee reaching an arbitrary target."
  ],
  "p5": [
    "这一步要回答：怎样让证明对应到可提交的代码？Python 的元组 (x,y) 可以放入 set 去重；deque 是两端操作高效的队列，popleft() 取最早加入的格子。集合查询按期望 O(1) 计。函数返回 bool，不修改输入。",
    "How does the proof become a valid submission? Python tuples (x,y) can be stored in a set to deduplicate cells. A deque supports efficient queue operations; popleft() removes the earliest entry. Set lookup has expected O(1) cost. The function returns bool and leaves inputs unchanged."
  ],
  "mapping": [
    "对应关系：walls 是障碍集合，limit=b² 对应保守上界；seen 在入队时更新；while 同时要求有待处理格且未超过上界。一次展开最多增加 4 格，因此停止时最多 L+4 格。return escapes(source,target) and escapes(target,source) 要求两端成功，and 会在首端失败时跳过第二端。",
    "Mapping: walls is the blocker set; limit=b² is the conservative budget. Update seen when enqueuing. The while guard requires pending cells and a count within budget. One expansion adds at most 4 cells, so the stopping count is at most L+4. The final and requires both checks to succeed and skips the second check if the first fails."
  ],
  "cost": [
    "成本：输入障碍条目数为 n，不同障碍数为 b。期望时间 O(n+(b+1)²)、空间 O((b+1)²)，包含扫描 n 条建集合与每端至多 O(b²+1) 个格子。b=200 时 L=40000；这不是计时结果。队列不用存整张网格；b=0 时只需初始化便超过 L=0。",
    "Costs for n input blocker entries and b distinct blockers: expected O(n+(b+1)²) time and O((b+1)²) space, including scanning n entries to build the set and O(b²+1) cells per endpoint. At b=200, L=40000; this is not a timing measurement. No full-grid storage is needed. With b=0, initialization already exceeds L=0."
  ],
  "boundaries": [
    "边界：不能越过 0 或 999999；本证明使用严格 >L 作为停止条件；同一小区域内可以直接到达；目标被困必须返回 false。最紧三角形上界能少搜一些，但不会改变这个保守版本的正确性。",
    "Boundaries: never cross 0 or 999999; this proof uses a strict >L stopping condition; direct reach inside one pocket succeeds; a trapped target must return false. A tighter triangular bound could save exploration but does not change the correctness of this conservative version."
  ],
  "source": [
    "查看官方接口的 Python 解法",
    "Read the Python solution for the official interface"
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "manual": [
    "自动复制不可用。源码已全选，请按系统复制快捷键。",
    "Automatic copy unavailable. Full source selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the full Python source"
  ],
  "related": [
    "回看关键推理",
    "Revisit the reasoning"
  ],
  "link1": [
    "用干净行列推导上界 → 第 2 步",
    "Derive the budget from clear lines → step 2"
  ],
  "link2": [
    "已发现集合与两端检查 → 第 3 步",
    "Discovered set and both endpoint checks → step 3"
  ]
};
