window.LESSON_COPY = {
  "docTitle": [
    "#864 获取所有钥匙的最短路径",
    "#864 Shortest Path to Get All Keys"
  ],
  "title": [
    "#864 · 获取所有钥匙的最短路径",
    "#864 · Shortest Path to Get All Keys"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "intro": [
    "在迷宫里先拿钥匙，再穿过对应的锁。给定地图，求收集所有钥匙的最少步数；无法收齐则返回 -1。",
    "Pick up keys in a maze to pass their matching locks. Given the map, find the fewest moves to collect every key, or return -1 if impossible."
  ],
  "nav0": [
    "1 · 先走两步",
    "1 · Walk two steps"
  ],
  "s0t": [
    "先走两步",
    "Walk two steps"
  ],
  "nav1": [
    "2 · 格子还不够",
    "2 · A square is not enough"
  ],
  "s1t": [
    "格子还不够",
    "A square is not enough"
  ],
  "nav2": [
    "3 · 带着钥匙分层",
    "3 · Layers with inventory"
  ],
  "s2t": [
    "带着钥匙分层",
    "Layers with inventory"
  ],
  "nav3": [
    "4 · 先预测再揭晓",
    "4 · Predict, then reveal"
  ],
  "s3t": [
    "先预测再揭晓",
    "Predict, then reveal"
  ],
  "nav4": [
    "5 · 对应到 Python",
    "5 · Map it to Python"
  ],
  "s4t": [
    "对应到 Python",
    "Map it to Python"
  ],
  "s0e": [
    "这一步要回答：拿到最后一把钥匙时，还要去开锁吗？看这一行 @.aA：@ 是起点，. 是空地，小写 a 是钥匙，大写 A 是锁。每次只能上下左右移动一格；# 是不可进入的墙，地图外也不能走。钥匙拿到后一直保留，不会被锁消耗。",
    "Must we still open a lock after collecting the last key? Look at the row @.aA: @ is the start, . is open floor, lowercase a is a key, and uppercase A is a lock. Each move goes one cell up, down, left or right; # is a wall, and leaving the map is forbidden. Collected keys stay with you and are never consumed by locks."
  ],
  "contract": [
    "官方范围：地图 m 行 n 列，1≤m,n≤30；恰好一个起点；1≤k≤6 把互不相同的钥匙，使用前 k 个字母，每把恰有一把对应的锁。不能穿过未持有对应钥匙的锁。输入不包含零把钥匙的情况。",
    "Official domain: m rows and n columns, 1≤m,n≤30; exactly one start; 1≤k≤6 distinct keys using the first k letters, each with exactly one matching lock. You cannot enter a lock without its key. Zero-key inputs are outside the contract."
  ],
  "handTask": [
    "按“展开手算”查看每一步。列号从 0 开始；下方记录的是走完该步之后的位置与已持有的钥匙。",
    "Select “Expand hand calculation” to inspect every move. Columns start at 0; each row records the position and inventory after that move."
  ],
  "handReveal": [
    "展开手算",
    "Expand hand calculation"
  ],
  "handHide": [
    "收起手算",
    "Hide hand calculation"
  ],
  "handAnswer": [
    "0 步：列 0，钥匙 ∅。1 步：列 1，钥匙 ∅。2 步：列 2，钥匙 {a}。现在已经收齐，所以答案是 2，不需要再去列 3 的 A。至少需要两次相邻移动才能从列 0 到列 2，因此这也是下界。",
    "0 moves: column 0, inventory ∅. 1 move: column 1, inventory ∅. 2 moves: column 2, inventory {a}. All keys are collected, so the answer is 2; visiting A at column 3 is unnecessary. At least two adjacent moves are needed to reach column 2 from column 0, proving the lower bound too."
  ],
  "s1e": [
    "这一步要回答：为什么“这个格子来过了”不能作为剪枝规则？把地图换成 b.A.@.aB（单行）。从列 4 的 @ 出发，右走两步拿 a，再左走两步回到 @：位置相同，时间从 0 变成 4，钥匙从 ∅ 变成 {a}。现在可以继续向左穿过 A，到列 0 的 b，共 8 步。若只记录格子，回到 @ 会被丢弃，导致错报 -1。",
    "Why can’t “we have visited this square” justify discarding a visit? Change the map to the single row b.A.@.aB. From @ at column 4, walk right twice to a, then left twice back to @: same position, time changes from 0 to 4, and inventory changes from ∅ to {a}. Now you can pass A to reach b at column 0, in 8 moves total. Tracking only squares discards the return to @ and incorrectly reports -1."
  ],
  "stateDef": [
    "因此一个状态必须包含（行，列，已持有的钥匙集合）。集合只关心有哪些字母，不关心拿取顺序。相同的完整状态才具有相同的后续合法选择；钥匙不同的两次访问不能直接合并。",
    "A state must therefore contain (row, column, set of collected keys). A set records which letters are present, not their collection order. Identical complete states have the same legal continuations; visits carrying different keys cannot simply be merged."
  ],
  "baseline": [
    "一个正确的慢基线：列出每个非墙格子与每种钥匙集合的组合，并画出所有合法的一步转移。起点距离为 0，其余为无穷大；反复扫描所有边，用“起点距离 +1”改善终点距离。每轮读取上一轮的距离，所以第 t 轮后涵盖所有至多 t 步的路线。",
    "A correct slow baseline lists every non-wall square paired with every key subset and creates all legal one-move edges. Set the start distance to 0 and all others to infinity. Repeatedly scan every edge, improving its destination with “source distance +1”. Each round reads the previous round’s distances, so after round t it covers all routes of at most t moves."
  ],
  "baselineCost": [
    "令 V=m·n·2^k 为状态数上界。最短路线不会重复完整状态，否则删掉环就更短；因此最多 V−1 轮足够。每个状态至多四条边，基线花 O(V²) 时间、O(V) 空间。最大 V=30·30·64=57,600，反复重扫很浪费。下一步仅扩展刚刚到达的状态。基线的可运行版本位于本课测试中。",
    "Let V=m·n·2^k bound the number of states. A shortest route never repeats a complete state, since removing that cycle makes it shorter, so V−1 rounds suffice. At most four edges leave each state: the baseline uses O(V²) time and O(V) space. V can reach 30·30·64=57,600, making repeated scans wasteful. Next, expand only newly reached states. The runnable baseline is included in this lesson’s tests."
  ],
  "s2e": [
    "这一步要回答：怎样既保留必要的回访，又最先找到最短路线？把状态（行，列，钥匙集合）按步数分层。第 0 层只有起点；扩展第 d 层的每个状态，把合法邻居第一次出现的完整状态放进第 d+1 层。这就是广度优先搜索（BFS）。队列按先加入、先取出的顺序处理，正好维持这种分层。",
    "How can we keep necessary revisits and still find the shortest route first? Group states (row, column, inventory) by moves. Layer 0 contains only the start. Expand every state at distance d and put each newly discovered legal full state in layer d+1. This is breadth-first search (BFS). A queue processes entries in the order they were inserted, preserving these layers."
  ],
  "bits": [
    "用整数 mask 编码钥匙集合：每一位（一个 0 或 1 的标记）表示一把钥匙，a 对应 1，b 对应 2。空集合是 0，{a} 是 1，{b} 是 2，{a,b} 是 3。按位或 | 把标记加入：1|2=3；按位与 & 检查标记：3&1=1、2&1=0。target 是所有钥匙标记的按位或。",
    "Encode the key set with an integer mask: each bit (a 0-or-1 flag) represents a key, a uses 1 and b uses 2. Empty is 0, {a} is 1, {b} is 2, and {a,b} is 3. Bitwise OR | adds a flag: 1|2=3. Bitwise AND & tests one: 3&1=1, but 2&1=0. target is the OR of all key flags."
  ],
  "derive": [
    "先检查边界、墙和锁，再给到达的状态加入新钥匙；最后按整个（行，列，mask）去重。例如 b.A.@.aB 回到 @ 时，(0,4,0) 与 (0,4,1) 都会保留。第一次到达相同完整状态时，任何更晚的路线都不能改善它的未来，因为钥匙永久保留且每步代价均为 1。",
    "Check bounds, walls and locks first, then add any key at the destination; finally deduplicate the whole (row, column, mask). For b.A.@.aB, both (0,4,0) and (0,4,1) survive. Once a full state has been reached, a later arrival cannot improve its future: keys are permanent and every move costs 1."
  ],
  "invariant": [
    "不变量（每层都保持的事实）：第 d 层含有所有最短距离为 d 的可达完整状态，所有已发现状态的距离都是最短距离。第 0 层显然成立；若成立，任何 d+1 步路线的前一步必在不晚于 d 的层里被扩展，所以不会漏掉新的邻居；更短路线则早已发现它。于是第一次出现 mask=target 的层就是答案；新一层为空且从未收齐时，答案为 -1。",
    "Invariant (a fact preserved at every layer): layer d contains all reachable full states whose shortest distance is d, and every discovered distance is shortest. This holds at layer 0. If it holds through d, the predecessor of any (d+1)-move route has been expanded by layer d, so no new neighbor is missed; a shorter route would already have discovered it. Thus the first layer with mask=target gives the answer. If the next layer is empty before that happens, return -1."
  ],
  "presetLabel": [
    "选择地图（切换会重置本实验）",
    "Map (changing it resets this experiment)"
  ],
  "preset0": [
    "手算行",
    "Tiny row"
  ],
  "preset1": [
    "必须回访",
    "Must revisit"
  ],
  "preset2": [
    "官方例 1",
    "Official 1"
  ],
  "preset3": [
    "官方例 2",
    "Official 2"
  ],
  "preset4": [
    "锁住钥匙",
    "Blocked key"
  ],
  "preset5": [
    "六把钥匙",
    "Six keys"
  ],
  "sim": [
    "教学模拟，不执行下面的 Python。每帧是待扩展的完整距离层；前进会扩展整层，若本层已收齐则显示终点。Python 实际逐个出队。保留所有层的快照用于回退；此额外存储不属于提交算法的空间。",
    "Teaching simulation, not execution of the Python below. Each frame is a complete distance layer ready to expand. Advancing expands that layer, or marks the endpoint if it already contains all keys. Python dequeues one state at a time. Snapshots retained for rewind use extra memory beyond the submission."
  ],
  "traceTask": [
    "先选“必须回访”，前进到第 4 层；保持地图不变，观察 @ 格子出现 mask 0:0 与 ★1:4。前者是空手在 0 步到达，后者是带 a 在 4 步到达。这两条记录为什么不能合并？再前进到终点检查 8 步。",
    "Select “Must revisit”, then advance to layer 4. Keep the map fixed and look for 0:0 and ★1:4 in the @ square: empty-handed at 0 moves, carrying a at 4 moves. Why can’t these records merge? Continue to verify the 8-move endpoint."
  ],
  "prev": [
    "退回一层",
    "Previous layer"
  ],
  "next": [
    "扩展本层",
    "Expand layer"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "end": [
    "跳到终点",
    "Go to endpoint"
  ],
  "gridLegend": [
    "行列均从 0 开始。每格先显示原地图符号，再显示 mask:最短步数。★ 标记本层状态；边框标记至少含一个本层状态的格子。旧记录一直保留，颜色不是唯一标记。",
    "Rows and columns start at 0. Each cell shows its map symbol, then mask:shortest moves. ★ marks a state in the current layer; a border marks any cell containing one. Earlier records remain visible; marks do not rely on color alone."
  ],
  "gridName": [
    "地图与所有已发现状态",
    "Map and all discovered states"
  ],
  "unseen": [
    "未到达",
    "Unreached"
  ],
  "cell": [
    "行 {r} 列 {c}，符号 {ch}",
    "Row {r} column {c}, symbol {ch}"
  ],
  "frame": [
    "帧 {i}/{n} · 当前层 d={d} · 本层 {f} 个状态 · 累计发现 {s} 个状态 · target={target} · {status}",
    "Frame {i}/{n} · Current layer d={d} · {f} states in layer · {s} states discovered total · target={target} · {status}"
  ],
  "pending": [
    "尚未判定最终答案",
    "Final answer not determined"
  ],
  "found": [
    "最终答案 {d} 步",
    "Final answer: {d} moves"
  ],
  "exhausted": [
    "无可扩展状态，最终答案 -1",
    "No states left; final answer: -1"
  ],
  "eventsTitle": [
    "上一次整层扩展：所有尝试",
    "Previous whole-layer expansion: every attempt"
  ],
  "eventsEmpty": [
    "初始帧没有移动；终点判定帧沿用上次扩展记录。",
    "No moves in the initial frame; a terminal-detection frame retains the previous expansion record."
  ],
  "event": [
    "({from}) → ({to})：{why}",
    "({from}) → ({to}): {why}"
  ],
  "reason_bounds": [
    "越界，拒绝",
    "Outside map; reject"
  ],
  "reason_wall": [
    "墙，拒绝",
    "Wall; reject"
  ],
  "reason_lock": [
    "尚无对应钥匙，拒绝",
    "Missing matching key; reject"
  ],
  "reason_duplicate": [
    "完整状态已发现，拒绝",
    "Full state already discovered; reject"
  ],
  "reason_key": [
    "拿到新钥匙，加入下一层",
    "New key; add to next layer"
  ],
  "reason_walk": [
    "合法一步，加入下一层",
    "Legal move; add to next layer"
  ],
  "s3e": [
    "这一步要回答：换一个地图，完整状态的不变量还适用吗？新地图是单行 bA@.aB，从列 2 的 @ 出发。每步相邻移动，钥匙不消耗；同一格子只有在钥匙集合也相同时才是同一状态。预测收集 a 和 b 的最少步数，再揭晓。这个题独立于上面的实验。",
    "Does the full-state invariant transfer to another map? The fresh single row is bA@.aB, starting at @ in column 2. Moves are adjacent and keys are never consumed; visits to a square are the same state only when their inventories match too. Predict the minimum moves to collect a and b, then reveal. This question is independent of the experiment above."
  ],
  "predictionLegend": [
    "最少多少步？",
    "What is the minimum?"
  ],
  "option0": [
    "-1：起点访问过，不能再回来",
    "-1: the start was visited, so returning is forbidden"
  ],
  "option1": [
    "6：带着 a 可以回访起点",
    "6: return to the start carrying a"
  ],
  "option2": [
    "11：还必须进入最后的 B",
    "11: the final B must also be entered"
  ],
  "reveal": [
    "检查并揭晓",
    "Check and reveal"
  ],
  "await": [
    "先选择一个答案；揭晓前不显示解答。",
    "Choose an answer; the explanation stays hidden until you reveal it."
  ],
  "selected": [
    "已选择；按“检查并揭晓”查看推导。",
    "Choice recorded. Select “Check and reveal” to see the reasoning."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查完整状态。",
    "Check the full state again."
  ],
  "answer": [
    "答案为 6：列 2→3→4 拿 a（2 步），再 4→3→2→1→0 拿 b（共 6 步）。回到起点时是 (0,2,1)，不同于初始 (0,2,0)，所以必须保留。a 距起点 2 步，a 到 b 距离 4；b 前的 A 强制先拿 a，因此 2+4 也是下界。-1 错在只按格子去重；11 错在要求开完锁：拿 b 后再走到列 5 的 B 还需 5 步，但目标只是收齐钥匙。",
    "The answer is 6: columns 2→3→4 collect a (2 moves), then 4→3→2→1→0 collect b (6 total). The return to the start is (0,2,1), different from initial (0,2,0), so keep it. a is 2 moves from the start and b is 4 from a; A before b forces a first, so 2+4 is also a lower bound. -1 deduplicates squares alone; 11 incorrectly requires opening locks: after b, reaching B at column 5 takes 5 extra moves, but only collecting keys is required."
  ],
  "s4e": [
    "这一步要回答：代码的哪些行维持最短距离不变量？状态是 (r,c,mask)，r、c 是从 0 开始的行列；mask 是钥匙的整数标记。deque 是双端队列，此处 append 从尾部加入，popleft 从头部取出。seen 是已经发现的完整状态集合，不是格子集合。",
    "Which lines preserve the shortest-distance invariant? A state is (r,c,mask): r and c are zero-based row and column, and mask is the integer key inventory. deque is a double-ended queue; append adds at the back and popleft removes from the front here. seen contains discovered full states, not just squares."
  ],
  "map1": [
    "target |= 1 << (ord(ch)-ord(\"a\"))：ord 得到字母编码，相减得到从 0 开始的字母编号；左移 1 生成 1、2、4…，按位或加入钥匙。",
    "target |= 1 << (ord(ch)-ord(\"a\")): ord gives a character code; subtracting gives its zero-based letter number. Shifting 1 left produces 1,2,4…; OR adds the key flag."
  ],
  "map2": [
    "先用 mask & 对应位检查锁，再更新 next_mask。锁的检查用进入前已有的钥匙；钥匙格把新标记加入。",
    "Test a lock with mask & its flag before updating next_mask. Lock entry uses the keys already held; landing on a key adds its flag."
  ],
  "map3": [
    "发现时就 seen.add(state)，并加入 distance+1；同一完整状态只入队一次。mask==target 出队时返回，队列耗尽返回 -1。",
    "Mark seen.add(state) at discovery and enqueue distance+1; each full state enters the queue once. Return on dequeuing mask==target, or return -1 when the queue empties."
  ],
  "cost": [
    "m、n 是行列数，k 是钥匙数。扫描地图 O(mn)，最多 mn·2^k 个状态，每个尝试 4 个方向。总时间 O(mn·2^k)，辅助空间 O(mn·2^k)（队列与 seen）；k≤6 时 mask 操作为常数时间。教学快照的额外存储不计入这个提交算法界限。",
    "m and n are row and column counts; k is the number of keys. Scanning costs O(mn); there are at most mn·2^k states, each trying 4 directions. Total time is O(mn·2^k), auxiliary space O(mn·2^k) for the queue and seen. With k≤6, mask operations take constant time. Extra teaching-snapshot storage is outside this submission bound."
  ],
  "boundaries": [
    "边界：@Aa 无法先穿 A 去拿 a，返回 -1；@.aA 在 a 处停止，返回 2。单行、单列同样检查四个方向；六把钥匙的目标标记是 63。钥匙不消耗，所以不需要记录开过哪些锁，也不能把大写锁当成目标。",
    "Boundaries: @Aa cannot cross A to get a, so return -1; @.aA stops at a and returns 2. Single rows and columns still check four directions. Six keys give target 63. Keys are never consumed, so opened locks need no extra state, and uppercase locks are not goals."
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
    "查看完整官方接口解法",
    "Read the full official-interface solution"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用；已选中下方全部源码，请使用系统复制快捷键。",
    "Automatic copy unavailable. The full source below is selected; use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "related1": [
    "继续：滑动谜题中的等距离层",
    "Continue: equal-distance layers in Sliding Puzzle"
  ],
  "related2": [
    "对照：单词接龙 II 如何保留多条最短路线",
    "Compare: retaining multiple shortest routes in Word Ladder II"
  ],
  "baselineSource": [
    "查看慢基线 Python（返回答案与距离表）",
    "Read baseline Python (returns answer and distance map)"
  ],
  "baselineSyntax": [
    "基线语法：frozenset 是不可修改的集合；combinations 枚举固定数量的钥匙子集；bag | {ch} 加入字母。distance.copy() 保留本轮开始时的距离，float(\"inf\") 表示尚未到达。返回值是（答案，完整距离表），供独立核对，并非提交接口。",
    "Baseline syntax: frozenset is an immutable set; combinations lists key subsets of a given size; bag | {ch} adds a letter. distance.copy() preserves distances from the start of the round; float(\"inf\") denotes unreached. It returns (answer, full distance map) for independent checking, rather than the submission interface."
  ]
};
