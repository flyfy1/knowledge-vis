window.COPY = {
  "docTitle": [
    "#52 · N 皇后 II | 知识可视化",
    "#52 · N-Queens II | Knowledge Visualization"
  ],
  "title": [
    "#52 · N 皇后 II",
    "#52 · N-Queens II"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "topic": [
    "数完整解，不数合法的半成品：沿着搜索树理解计数与撤销。",
    "Count complete solutions, not safe partial placements: follow the search and its undo operations."
  ],
  "official": [
    "LeetCode 原题 ↗",
    "View on LeetCode ↗"
  ],
  "s0": [
    "1 · 要返回什么？",
    "1 · What must we return?"
  ],
  "s1": [
    "2 · 何时停止一条分支？",
    "2 · When can a branch stop?"
  ],
  "s2": [
    "3 · 放置、拒绝与撤销",
    "3 · Place, reject, and undo"
  ],
  "s3": [
    "4 · 先预测，再验证",
    "4 · Predict, then verify"
  ],
  "s4": [
    "5 · 写成 Python",
    "5 · Transfer to Python"
  ],
  "statement": [
    "给定边长 n，怎样数出互不攻击的 n 皇后排列？棋盘有 n 行、n 列，要放 n 个皇后；同行、同列或同一对角线上的两个皇后会互相攻击。返回一个整数：不同合法棋盘的数量，不用返回棋盘本身。",
    "Given side length n, how many nonattacking arrangements of n queens exist? The board has n rows and n columns. Two queens attack if they share a row, column, or diagonal. Return one integer: the number of distinct legal boards; the boards themselves are not returned."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 9；示例 n=4 → 2，n=1 → 1。镜像只要位置不同就分别计数；不除以 2。n=0 不在题目范围内。",
    "Official range: 1 ≤ n ≤ 9; examples n=4 → 2 and n=1 → 1. Reflections with different positions count separately; do not divide by 2. n=0 is outside the contract."
  ],
  "handTitle": [
    "手算 n=4：按第一行的列分组",
    "By hand, n=4: group by the first row’s column"
  ],
  "hand": [
    "行 r、列 c 从 0 开始。n 个皇后不能同行，因此每行恰好一个。列向量 [1,3,0,2] 表示各行的列号，对应 .Q..、...Q、Q...、..Q.。按第一行选列 0、1、2、3，完整解的数量依次是 0、1、1、0：只有 [1,3,0,2] 和 [2,0,3,1]，合计 2。合法前缀 [0,2] 虽有两个皇后，但下一行无处可放，贡献 0。",
    "Rows r and columns c start at 0. With n queens and no shared rows, each row has exactly one queen. The vector [1,3,0,2] gives the column in each row, spelling .Q.., ...Q, Q..., ..Q. First-row columns 0, 1, 2, 3 contribute 0, 1, 1, 0 complete solutions: only [1,3,0,2] and [2,0,3,1], totaling 2. The safe prefix [0,2] has two queens but no legal next row, so it contributes 0."
  ],
  "baselineTitle": [
    "基线：检查每个列排列",
    "Baseline: inspect every column permutation"
  ],
  "baselineText": [
    "能否生成全部列排列后逐一计数？permutations 枚举列号 0…n−1 的排列，保证每行、每列各一个皇后。若有行对 a、b 满足 |a−b| = |p[a]−p[b]|，它们就在同一对角线上。下面只对通过全部行对检查的排列加 1，可作为独立小输入对照。",
    "Can we count after generating every column permutation? permutations enumerates orderings of 0…n−1, ensuring one queen per row and column. A pair of rows a, b attacks diagonally exactly when |a−b| = |p[a]−p[b]|. The baseline adds 1 only for permutations passing every pair check, serving as an independent small-input oracle."
  ],
  "baselineCost": [
    "基线有 n! 个排列，每个最多检查 O(n²) 对，时间上界 O(n²·n!)，生成器和当前排列占 O(n) 额外空间。浪费在于：前两行已冲突，仍生成完整排列。回溯在冲突前缀处停止，省去它所有后续排列；计数不需要构造结果棋盘。",
    "The baseline considers n! permutations with up to O(n²) pair checks each: O(n²·n!) time and O(n) auxiliary space for the iterator and current permutation. It generates full permutations even when the first two rows already attack. Backtracking stops at a conflicting prefix, skipping all its completions; counting also avoids constructing output boards."
  ],
  "derive": [
    "怎样在放下一个皇后前知道它一定冲突？“前缀”指已经填好的连续前 r 行。固定每行只选一列后，只剩三项检查：列 c、斜线键 r−c、另一斜线键 r+c。例如 (0,1) 与 (1,2) 的 r−c 都为 −1；(0,3) 与 (1,2) 的 r+c 都为 3。同行沿对角线移动一步时，两个坐标同时加 1（差不变），或一加一减（和不变）。",
    "How can we detect an attack before placing a queen? A prefix means the first r consecutive rows already filled. With exactly one column chosen per row, only three tests remain: column c, diagonal key r−c, and the other diagonal key r+c. For example, (0,1) and (1,2) both have r−c = −1; (0,3) and (1,2) both have r+c = 3. One step along a diagonal changes both coordinates by +1 (preserving the difference), or one by +1 and the other by −1 (preserving the sum)."
  ],
  "proof": [
    "把已用的三个键分别放进 cols、down、up 集合。新位置只要命中一个集合，就已有皇后攻击它，后面再放皇后也无法消除这次攻击，所以整条分支可以剪掉。“剪枝”就是不再探索这样的前缀。如果都没命中，只说明当前合法，并不保证最终有解：n=4 时前缀 [0,2] 就无法填下一行。",
    "Keep the three kinds of occupied keys in sets cols, down, and up. If a new square hits any set, an existing queen attacks it; adding later queens cannot remove that attack, so this entire branch can stop. Pruning means skipping such a prefix. Missing all three sets proves only local legality, not eventual success: for n=4, the legal prefix [0,2] leaves no possible next row."
  ],
  "invariant": [
    "不变式：进入 search(r) 时，前 r 行恰好各有一个皇后，且互不攻击；cols、down、up 恰好记录它们的 c、r−c、r+c。回溯指探索后移除该选择的三个键，恢复原状态。count 只记录已访问的完整解，撤销不减去这个计数。",
    "Invariant: at entry to search(r), the first r rows each have one queen and no attacks; cols, down, up contain exactly their c, r−c, r+c keys. Backtracking removes a choice’s three keys after exploring it, restoring the prior state. count records only completed solutions already visited; undo does not subtract from it."
  ],
  "task": [
    "什么时候计数增加，什么时候不增加？固定 n=4，逐事件前进，先看棋盘与集合，再看下方完整解记录。行向下、列向右，均从 0 开始。Q 是皇后，× 是被拒绝的空格，? 是刚撤销的空格。观察放置第 4 个皇后后，还需执行“完整解计数”事件才加 1。找到一次撤销，再后退、前进，核对棋盘、集合与累计计数全部恢复。",
    "When does the count increase, and when does it stay fixed? Keep n=4 and advance by event. Inspect the board and sets, then the complete-solution ledger below. Rows increase downward and columns rightward, both from 0. Q is a queen, × a rejected empty square, and ? an undone square. After placing the fourth queen, the next “count complete solution” event adds 1. Find an undo, then go back and forward to check that board, sets, and count all restore."
  ],
  "simulation": [
    "这是 JavaScript 对 Python 算法的确定性教学模拟，不是浏览器执行 Python。n=1…4 的所有事件均保留，没有跳步；大输入的阶乘搜索不在界面运行。教程保存快照的内存与提交解法的空间分开计算。",
    "This is a deterministic JavaScript teaching simulation of the Python algorithm, not Python execution in the browser. Every event for n=1…4 is retained with no skipped search. Larger factorial searches do not run in the UI. Snapshot memory is separate from submission space."
  ],
  "presets": [
    "棋盘边长（修改会重新开始轨迹）",
    "Board size (changing it restarts the trace)"
  ],
  "preset1": [
    "n=1 · 单个皇后",
    "n=1 · one queen"
  ],
  "preset2": [
    "n=2 · 无解",
    "n=2 · no solutions"
  ],
  "preset3": [
    "n=3 · 无解",
    "n=3 · no solutions"
  ],
  "preset4": [
    "n=4 · 计数为 2",
    "n=4 · count is 2"
  ],
  "prev": [
    "← 后退一个事件",
    "← Previous event"
  ],
  "next": [
    "执行下一个事件 →",
    "Apply next event →"
  ],
  "reset": [
    "重置轨迹",
    "Reset trace"
  ],
  "position": [
    "跳到事件（完整快照）",
    "Jump to event (complete snapshot)"
  ],
  "progress": [
    "事件 {i} / {last} · 已计入 {count} 个完整解",
    "Event {i} / {last} · {count} complete solutions counted"
  ],
  "legend": [
    "Q 已放置 · × 此次被拒绝 · ? 刚撤销 · . 空格；标记不是额外皇后。",
    "Q placed · × rejected now · ? just undone · . empty; markers are not extra queens."
  ],
  "boardLabel": [
    "当前棋盘：行、列从 0 开始",
    "Current board: zero-based rows and columns"
  ],
  "row": [
    "行",
    "Row"
  ],
  "col": [
    "列",
    "Column"
  ],
  "cell": [
    "行 {r}，列 {c}：{value}",
    "Row {r}, column {c}: {value}"
  ],
  "queen": [
    "皇后",
    "queen"
  ],
  "empty": [
    "空格",
    "empty"
  ],
  "rejectCell": [
    "拒绝的空格",
    "rejected empty square"
  ],
  "undoCell": [
    "已撤销的空格",
    "undone empty square"
  ],
  "state": [
    "当前状态（本事件完成后）",
    "Current state (after this event)"
  ],
  "placement": [
    "教学列向量 · 每行的列",
    "Teaching vector · column per row"
  ],
  "cols": [
    "cols · 已占用列 c",
    "cols · occupied columns c"
  ],
  "down": [
    "down · 已占用斜线 r−c",
    "down · occupied r−c diagonals"
  ],
  "up": [
    "up · 已占用斜线 r+c",
    "up · occupied r+c diagonals"
  ],
  "before": [
    "比较上一事件的棋盘与集合",
    "Compare previous event’s board and sets"
  ],
  "noBefore": [
    "起点：没有上一事件。",
    "At the start: no previous event."
  ],
  "ledger": [
    "完整解计数记录（仅用于教学）",
    "Complete-solution counting ledger (teaching only)"
  ],
  "none": [
    "当前计数 0：还没访问到完整解。",
    "Current count 0: no complete solution visited yet."
  ],
  "boardNumber": [
    "第 {i} 次加 1 · 完整列向量",
    "Increment {i} · complete column vector"
  ],
  "history": [
    "从起点到此刻的完整事件历史",
    "Full event history from the start to now"
  ],
  "operation": [
    "本事件对应的 Python 操作",
    "Python operation for this event"
  ],
  "start": [
    "开始：约束集合为空，count=0。教学棋盘也为空。",
    "Start: the constraint sets are empty and count=0. The teaching board is empty too."
  ],
  "place": [
    "放置 (r={r}, c={c})：加入 c={c}、r−c={d}、r+c={u}；下一步探索下一行。",
    "Place (r={r}, c={c}): add c={c}, r−c={d}, r+c={u}; next explore the following row."
  ],
  "reject": [
    "拒绝 (r={r}, c={c})：命中 {keys}。棋盘和集合保持不变。",
    "Reject (r={r}, c={c}): conflicts with {keys}. The board and sets remain unchanged."
  ],
  "undo": [
    "撤销 (r={r}, c={c})：移除皇后及三个键；已完成解的计数仍为 {count}。",
    "Undo (r={r}, c={c}): remove the queen and three keys; the count of completed solutions remains {count}."
  ],
  "solution": [
    "前 {n} 行完整且互不攻击：count += 1，现在累计 {count}。随后继续搜索。",
    "All {n} rows are complete and nonattacking: count += 1, now totaling {count}. Search continues afterward."
  ],
  "end": [
    "搜索结束：返回整数 {count}。所有选择均已撤销，工作棋盘为空；完整解记录仍保留供教学查看。",
    "Search finished: return integer {count}. All choices have been undone, leaving an empty working board; the teaching ledger retains completed leaves."
  ],
  "quizQuestion": [
    "全新例子：n=5，固定前两行列向量 [0,3]。这条分支最终给 count 贡献多少？请先检查下一行的合法列，再推到完整棋盘。此题独立于上面的 n≤4 轨迹。 每行只放一个皇后；用列 c、斜线键 r−c 和 r+c 检查冲突。只有 n 行全满且互不攻击才算一个解。",
    "Fresh case: n=5, with the first two rows fixed at columns [0,3]. How much does this branch eventually contribute to count? Check legal columns for the next row, then continue to complete boards. This is independent of the n≤4 trace. Place one queen per row; test column c and diagonal keys r−c and r+c for attacks. Only n complete, nonattacking rows form one solution."
  ],
  "option0": [
    "A · 3：剩下三行各计一次",
    "A · 3: count each remaining row once"
  ],
  "option1": [
    "B · 0：只剩一列可选，肯定走不通",
    "B · 0: only one next column means failure"
  ],
  "option2": [
    "C · 1：只有一个完整后续棋盘",
    "C · 1: exactly one complete descendant"
  ],
  "reveal": [
    "验证我的预测",
    "Check my prediction"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "还不对。",
    "Not quite."
  ],
  "explanation": [
    "已有 cols={0,3}、down={0,−2}、up={0,4}。第 2 行只有 c=1 合法：c=0、3 同列；c=2 的差为 0；c=4 的差为 −2。接着第 3 行只能 c=4，第 4 行只能 c=2，得到唯一完整解 [0,3,1,4,2]，所以贡献 1。A 把行当作解，B 把选择少误判成无解。中途合法不加分，填满才加 1。",
    "The prefix has cols={0,3}, down={0,−2}, up={0,4}. Row 2 permits only c=1: c=0 and 3 share columns; c=2 has difference 0; c=4 has difference −2. Then row 3 permits only c=4, and row 4 only c=2. The sole complete board is [0,3,1,4,2], contributing 1. A counts rows as solutions; B mistakes few choices for failure. Safe partial rows add nothing; completing the board adds 1."
  ],
  "mappingQuestion": [
    "怎样只返回计数而不保存全部棋盘？search(r) 填第 r 行；r==n 表示 n 行都合法，执行 count += 1 后返回。nonlocal count 让内部函数修改外层整数变量。Python 只存三个集合与递归状态，不存教学列向量、棋盘或记录。 这里 cols 存列 c，down 存对角线差 r−c，up 存对角线和 r+c（行列从 0 开始）。",
    "How can Python return a count without saving every board? search(r) fills row r; r==n means all n rows are legal, so count += 1 and return. nonlocal count lets the inner function update the outer integer variable. Python stores only the three sets and recursive state, not the teaching column vector, boards, or ledger. Here cols stores columns c, down stores diagonal differences r−c, and up stores diagonal sums r+c, using zero-based rows and columns."
  ],
  "correctness": [
    "为什么不漏、不重？空前缀满足不变式。三个键均未占用才放置，保持合法；递归返回后删除三个键，恢复原状态。每个合法棋盘都有唯一的逐行选列路径，路径上没有冲突，因此一定到达 r==n 并计数一次。不同路径至少一行不同，不会重复。每次递归 r 加 1，至多 n 层，每层只有 n 个候选，故终止。镜像路径不同，所以分别计数。",
    "Why are there no missing or duplicate counts? The empty prefix satisfies the invariant. Placing only when all three keys are unused preserves legality; removing the keys after recursion restores the prior state. Each legal board has one unique row-by-row column path with no conflicts, so it reaches r==n and is counted once. Different paths differ in at least one row, preventing duplicates. Each call increases r, with at most n levels and n candidates per level, ensuring termination. Reflected paths differ, so both are counted."
  ],
  "complexity": [
    "成本：设 V 为访问的未完成合法前缀数，S 为完整解数。每个前缀扫描 n 列，集合操作按平均 O(1) 计，时间 O(n·V + S)，保守上界 O(n·n!)；因为不重复列，V≤Σ(r=0…n−1) n!/(n−r)!。剪枝仍是指数/阶乘规模的搜索，不保证多项式时间。递归和三个集合的额外空间 O(n)，输出是一个整数。教程 F 个深快照连同累计叶记录另需 O(F·n + F·S·n)，不是提交空间。",
    "Cost: let V be visited incomplete legal prefixes and S complete solutions. Scanning n columns per prefix with average O(1) set operations gives O(n·V + S) time, conservatively O(n·n!). Unique columns imply V≤Σ(r=0…n−1) n!/(n−r)!. Pruning still leaves exponential/factorial-scale search, not guaranteed polynomial time. Recursion and three sets use O(n) auxiliary space; output is one integer. The tutorial’s F deep snapshots with cumulative leaf records separately use O(F·n + F·S·n), outside submission space."
  ],
  "mapping": [
    "从画面到 Python",
    "From the diagram to Python"
  ],
  "quantity": [
    "画面 / 变量",
    "View / variable"
  ],
  "meaning": [
    "对应职责",
    "Responsibility"
  ],
  "mapPlace": [
    "Q 与三个集合",
    "Q and the three sets"
  ],
  "mapPlaceText": [
    "add 三个键后 search(r+1)；Q 是这些键的教学图像",
    "Add three keys, then search(r+1); Q visualizes these keys"
  ],
  "mapUndo": [
    "? 与集合缩小",
    "? and shrinking sets"
  ],
  "mapUndoText": [
    "remove 三个键，恢复原状态；不减 count",
    "Remove three keys to restore prior state; do not reduce count"
  ],
  "mapSave": [
    "完整解记录与累计整数",
    "Complete-leaf receipts and cumulative integer"
  ],
  "mapSaveText": [
    "仅 r==n 执行 count += 1；记录不在提交代码中",
    "Only r==n executes count += 1; receipts are absent from submission code"
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
    "已复制完整代码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用；代码已选中，请手动复制。",
    "Automatic copy is unavailable; the code is selected for manual copying."
  ],
  "fullCode": [
    "展开完整 Python 提交代码",
    "Open complete Python submission code"
  ],
  "verifyTitle": [
    "边界与独立核对",
    "Boundaries and independent checks"
  ],
  "verify": [
    "边界 n=1 → 1，n=2、3 → 0，n=4 → 2。作者自查以列排列的成对距离检查对照 n=1…9 的计数（n=9 为 352），并核对每个轨迹事件的约束集合、叶计数与撤销。不能在第一次找到解时停止，不能把合法前缀计为解，不能忘记删除集合键。没有实际 LeetCode 提交或独立教学通过声明。",
    "Boundaries: n=1 → 1, n=2 and 3 → 0, n=4 → 2. Author checks compare counts for n=1…9 against pairwise-distance tests of column permutations (n=9 gives 352), and inspect every trace event’s sets, leaf count, and undo. Do not stop at the first solution, count safe prefixes, or forget to remove set keys. No actual LeetCode submission or independent teaching acceptance is claimed."
  ],
  "related": [
    "相关概念",
    "Related concepts"
  ],
  "related0": [
    "#51 · 对比保存棋盘的版本与约束搜索",
    "Compare board-producing constraint search in #51"
  ],
  "related1": [
    "#37 · 看约束集合与完整撤销",
    "Explore constraint sets and complete undo in #37"
  ],
  "foot": [
    "Python 是标准解法；交互是本地教学模拟。作者自查不等于独立评审。",
    "Python is the canonical solution; the interaction is a local teaching simulation. Author checks are not independent review."
  ],
  "meta": [
    "LEETCODE 52 · 困难 · PYTHON",
    "LEETCODE 52 · HARD · PYTHON"
  ],
  "previousBoardLabel": [
    "上一事件棋盘：行、列从 0 开始",
    "Previous event board: zero-based rows and columns"
  ]
};
