window.COPY = {
  "docTitle": [
    "#488 祖玛游戏 · 完整状态搜索",
    "#488 Zuma Game · Complete-state search"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
  ],
  "title": [
    "#488 · 祖玛游戏",
    "#488 · Zuma Game"
  ],
  "tagline": [
    "把一颗蓝球放进 RRBBRR：为什么整排都能消失？从这次连锁反应，推导一个不遗漏准备动作的精确搜索。",
    "Insert one blue ball into RRBBRR: why can the whole row disappear? Use that chain reaction to build an exact search that keeps setup moves."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "badge": [
    "困难 · Python · 记忆化搜索",
    "Hard · Python · Memoized search"
  ],
  "nav0": [
    "1 · 一球连锁",
    "1 · One-ball cascade"
  ],
  "nav1": [
    "2 · 记录什么",
    "2 · What to remember"
  ],
  "nav2": [
    "3 · 逐次观察",
    "3 · Inspect each event"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav4": [
    "5 · 写成 Python",
    "5 · Write the Python"
  ],
  "h0": [
    "一颗球，如何清空一整排？",
    "How can one ball clear the whole row?"
  ],
  "p0": [
    "这一步要回答：已知棋盘 RRBBRR、手中只有 B，最少插入几颗球才能清空？字母表示颜色：R 红、Y 黄、B 蓝、G 绿、W 白。一个连续段是相邻且颜色相同的一组球。插入 B 到中间的 BB 旁边，先自己算一遍。",
    "Question: with board RRBBRR and only B in hand, what is the fewest insertions needed to clear it? Letters name colors: R red, Y yellow, B blue, G green, W white. A run is a consecutive group of one color. Insert B beside the middle BB and calculate the result yourself."
  ],
  "rules": [
    "每回合选手中任意一球，插到任意相邻两球之间或两端。出现至少 3 颗同色连续球时，整段一起消失；新相邻的同色球也可能继续消失，这叫连锁反应。必须等消除全部结束再插下一球。目标是最少插球数；无法清空返回 −1。",
    "Each turn, take any ball from your hand and insert it between neighbors or at either end. A run of at least 3 equal colors disappears in full. Newly adjacent balls can trigger another removal: a chain reaction. Finish all removals before the next insertion. Return the fewest insertions, or −1 if clearing is impossible."
  ],
  "constraints": [
    "官方输入：棋盘长 1–16，手牌长 1–5，只含 R/Y/B/G/W；起始棋盘没有长度 ≥3 的同色连续段。空棋盘只会在搜索中出现。",
    "Official inputs: board length 1–16, hand length 1–5, alphabet R/Y/B/G/W. The initial board has no same-color run of length ≥3. An empty board arises inside the search."
  ],
  "handTask": [
    "保持 RRBBRR / B 不变。先预测，再展开；注意删除 BBB 后两侧的 RR 会相接。",
    "Keep RRBBRR / B fixed. Predict, then expand; watch the two RR groups meet after BBB disappears."
  ],
  "handShow": [
    "展开手算链",
    "Show the hand calculation"
  ],
  "handHide": [
    "收起手算链",
    "Hide the hand calculation"
  ],
  "handAnswer": [
    "RRBBRR → 插 B → RRBBBRR → 删除 BBB → RRRR → 删除整段 RRRR → 空。用了 1 球；起始非空至少要插 1 球，因此最优值正好是 1。不是每次只删除 3 颗。",
    "RRBBRR → insert B → RRBBBRR → remove BBB → RRRR → remove the whole RRRR → empty. We spent 1 ball. A nonempty initial board needs at least 1 insertion, so the optimum is exactly 1. Removal is not limited to exactly 3 balls."
  ],
  "h1": [
    "下一步的选择，由什么决定？",
    "What determines the next choices?"
  ],
  "p1": [
    "这一步要回答：如果记录搜索进度，只记棋盘够吗？状态就是继续游戏所需的全部信息。固定棋盘 RR，切换剩余手牌，看下面的最少剩余插球数。手牌是多重集合：每种颜色有几颗很重要，排列顺序不重要。",
    "Question: can a search remember only the board? A state contains all information needed to continue. Keep board RR fixed and change the remaining hand; inspect the minimum additional insertions below. The hand is a multiset: each color's count matters, but its order does not."
  ],
  "handLabel": [
    "RR 的剩余手牌",
    "Remaining hand for RR"
  ],
  "handR": [
    "R · 一颗红球",
    "R · One red ball"
  ],
  "handB": [
    "B · 一颗蓝球",
    "B · One blue ball"
  ],
  "stateR": [
    "状态 (RR, R)：插 R 得 RRR，再消除，剩余最小代价 = 1 球。",
    "State (RR, R): insert R to get RRR, then remove it. Minimum remaining cost = 1 ball."
  ],
  "stateB": [
    "状态 (RR, B)：总共只有两颗 R，没有办法组成三颗，剩余最小代价 = −1（不可能）。相同棋盘，答案却不同。",
    "State (RR, B): there are only two R balls in total, so no triple can ever form. Minimum remaining cost = −1 (impossible). The same board has a different answer."
  ],
  "baseline": [
    "正确的基线：按已插球数一层层枚举。每个状态，试手中每一颗球和棋盘的每一个空隙，再完成全部消除。空隙编号 0…n，表示当前长度 n 的棋盘中，插在第几个字符前；n 表示末尾。每层恰好多用 1 球，所以第一次发现空棋盘时层数就是最优答案。",
    "A correct baseline enumerates layers by balls spent. From every state, try each hand ball in every board gap, then finish the cascade. Gaps are numbered 0…n for a row of current length n: gap i is before character i, and gap n is the end. Each layer spends exactly 1 ball, so the first empty board appears at the optimal depth."
  ],
  "baselineCost": [
    "但很多分支会重复：RRBBGG / RBG，先消 R 再消 B，或先消 B 再消 R，都会到达 (GG, G)。不保存结果就会重新搜索相同后续。原始树深度至多 h=手牌长度，每层最多 5(n+h+1) 个选择；这是指数搜索，不是多项式算法。",
    "Many branches repeat work: from RRBBGG / RBG, removing R then B or B then R both reach (GG, G). Without saved answers, the same future is searched again. The raw tree has depth at most h, the hand length, and at most 5(n+h+1) choices per level. This is exponential search, not a polynomial algorithm."
  ],
  "wrong": [
    "诱人的错误规则：“只试立即消球的插法。”反例是棋盘 G、手牌 GG。第一球只能得到 GG，不消球；第二球才得到 GGG 并清空。丢弃第一步就会错误返回 −1。下面的第 2 个预设会把这个准备动作保留下来。",
    "Tempting wrong rule: try only insertions that remove balls immediately. Counterexample: board G, hand GG. The first insertion makes GG and removes nothing; only the second makes GGG and clears it. Discarding the first move incorrectly returns −1. The second preset below retains this setup move."
  ],
  "h2": [
    "一球花掉后，状态怎样变化？",
    "How does spending one ball change the state?"
  ],
  "p2": [
    "这一步要回答：插入与消除是否已经全部完成？稳定状态指没有长度 ≥3 的同色连续段。要保持的不变量（每步后仍成立的条件）是：在两次插球之间，棋盘稳定，剩余手牌恰好扣除了已用的球。插入帧和部分消除帧可能尚不稳定，不能把它们当作下次决策的状态。",
    "Question: have insertion and all removals finished? A stable state has no same-color run of length ≥3. The invariant, a condition preserved between moves, is that the board is stable and the remaining hand excludes exactly the balls spent. Insertion and partial-removal frames may still be unstable; they are not states for the next player decision."
  ],
  "traceTask": [
    "先选预设（会重启本实验），再逐事件推进。上方左右两图表示同一事件之前与之后；窄屏上下排列。字母顺序就是棋盘顺序，手牌按字母排序。查看历史，确认一次插球可引发多次消除，再回退核对。 棋盘始终画成一行，窄屏可在行内横向滚动（也可聚焦后按方向键）；图下保留完整字符串。",
    "Choose a preset (this restarts this experiment), then advance one event at a time. The two diagrams show before and after the same event; they stack on narrow screens. Letter order is board order; the hand is sorted alphabetically. Inspect the history to see several removals follow one insertion, then rewind to check. Board rows stay on one line; scroll within a row on narrow screens (or focus it and use arrow keys). The complete string remains below each board."
  ],
  "simulation": [
    "教学模拟：只展示所选的一条合法路径，不展示完整搜索树，也不执行下方 Python。终点会单独说明该输入的精确答案及理由；路径所用球数不是不可能状态的答案。",
    "Teaching simulation: this shows one selected legal path, not the entire search tree or execution of the Python below. At the endpoint, a separate explanation gives the exact answer for the input. Balls spent along a failed path are not its problem answer."
  ],
  "preset": [
    "预设（更换会从头开始）",
    "Preset (changing restarts the trace)"
  ],
  "pre0": [
    "RRBBRR / B · 一球连锁",
    "RRBBRR / B · One-ball cascade"
  ],
  "pre1": [
    "G / GGGGG · 保留准备动作",
    "G / GGGGG · Keep a setup move"
  ],
  "pre2": [
    "WWRRBBWW / WRBRW · 官方例 2",
    "WWRRBBWW / WRBRW · Official example 2"
  ],
  "pre3": [
    "WRRBBW / RB · 官方例 1",
    "WRRBBW / RB · Official example 1"
  ],
  "prev": [
    "← 上一事件",
    "← Previous event"
  ],
  "next": [
    "执行下一事件 →",
    "Apply next event →"
  ],
  "reset": [
    "回到初始状态",
    "Reset to initial state"
  ],
  "end": [
    "到路径终点",
    "Go to path endpoint"
  ],
  "before": [
    "本事件之前的棋盘",
    "Board before this event"
  ],
  "after": [
    "本事件之后的棋盘",
    "Board after this event"
  ],
  "handNow": [
    "事件后的剩余手牌",
    "Remaining hand after event"
  ],
  "empty": [
    "空 ∅",
    "Empty ∅"
  ],
  "progress": [
    "事件 {i}/{n} · 此路径已用 {u} 球 · {phase}",
    "Event {i}/{n} · Balls spent on this path: {u} · {phase}"
  ],
  "stable": [
    "稳定，可作决策状态",
    "Stable: ready for a player decision"
  ],
  "unstable": [
    "待继续消除，不可插下一球",
    "Removal pending: do not insert another ball yet"
  ],
  "initial": [
    "初始状态：还没有插球。",
    "Initial state: no ball has been inserted."
  ],
  "insert": [
    "在空隙 {g} 插入 {c}，手牌扣除一颗 {c}；随后检查连续段。",
    "Insert {c} at gap {g}; spend one {c} from the hand, then check for runs."
  ],
  "remove": [
    "删除整段 {n} 颗 {c}；这不消耗手牌。再检查新相邻的球。",
    "Remove the whole run of {n} {c} balls; this spends no hand ball. Check the newly adjacent balls again."
  ],
  "ledger": [
    "已完成事件（保留连锁历史）",
    "Completed events (cascade history retained)"
  ],
  "historyEmpty": [
    "尚无已完成事件。",
    "No completed events yet."
  ],
  "endpoint": [
    "本输入的精确答案 = {r}。{why}",
    "Exact answer for this input = {r}. {why}"
  ],
  "why0": [
    "一球清空；非空棋盘不能用零球清空。",
    "One ball clears it; zero cannot clear a nonempty board."
  ],
  "why1": [
    "单个 G 需要再补两颗才能成三；手里够用。多余三颗不必使用。",
    "A lone G needs two more to form a triple; the hand has enough. The other three need not be used."
  ],
  "why2": [
    "先补 R 再补 B，最后四颗 W 连锁消除。零球不行；任意一球都无法同时清掉两种被隔开的 RR 和 BB，因此至少两球。",
    "Add R, then B; the four W balls finally disappear in a cascade. Zero cannot work, and no single insertion clears both separated RR and BB groups, so at least two are needed."
  ],
  "why3": [
    "W 在棋盘与手牌中一共只有两颗，永远无法组成三颗；所以任何路径都不能清空。",
    "There are only two W balls across board and hand, so they can never form a triple. No path can clear the board."
  ],
  "h3": [
    "换一个状态，先作预测",
    "Transfer to a fresh state"
  ],
  "p3": [
    "这一步要回答：棋盘 RBBR，剩余手牌 BR 与 RB，后续最少插球数是否相同？这里后续代价只计算还要用的球。回忆完整状态：稳定棋盘（没有长度 ≥3 的同色连续段）的顺序要保留，手牌只保留每种颜色的数量。先选再揭晓；这里不受上方预设或重置影响。",
    "Question: for board RBBR, do remaining hands BR and RB have the same minimum future cost? Future cost counts only balls still to be spent. Recall the complete state: preserve stable board order (with no same-color run of length ≥3), but only each hand color's count. Choose before revealing; trace presets and reset do not affect this question."
  ],
  "choose": [
    "选择一个结论",
    "Choose a conclusion"
  ],
  "opt0": [
    "不同：手牌必须按书写顺序使用",
    "Different: balls must be used in written order"
  ],
  "opt1": [
    "相同：都只需要 1 球",
    "Equal: both need only 1 ball"
  ],
  "opt2": [
    "相同：都需要 2 球",
    "Equal: both need 2 balls"
  ],
  "reveal": [
    "检查预测并解释",
    "Check prediction and explain"
  ],
  "waiting": [
    "答案尚未揭晓，请先选择。",
    "Answer hidden. Make a choice first."
  ],
  "chosen": [
    "已选择；点击检查才显示推导。",
    "Choice recorded; check it to see the reasoning."
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "这个结论需要修正。",
    "Revise this conclusion."
  ],
  "answer": [
    "两手牌的颜色计数相同，所以都是同一状态。插 B：RBBBR → RR；再插 R：RRR → 空，共 2 球。一球 B 只剩 RR；一球 R 不会消掉 BB；因此 1 球不够。手牌顺序不限制选择，棋盘顺序却决定哪些球相邻。",
    "The hands have identical color counts, so these are the same state. Insert B: RBBBR → RR. Then insert R: RRR → empty, for 2 balls. A single B leaves RR; a single R cannot remove BB, so 1 is insufficient. Hand order does not restrict choices; board order determines adjacency."
  ],
  "h4": [
    "把完整状态变成可复用的答案",
    "Turn a complete state into a reusable answer"
  ],
  "p4": [
    "这一步要回答：怎样避免重复求同一个剩余最小代价？记忆化就是把某状态的答案存起来，再次遇到直接复用。排序手牌让 BR 与 RB 变成同一个键；棋盘不能排序。令 F(b,H) 表示稳定棋盘 b（没有可消除的连续段）、剩余手牌 H 的最少后续插球数，失败记为 ∞。",
    "Question: how can we avoid recomputing the same minimum future cost? Memoization saves a state's answer and reuses it on later visits. Sorting the hand gives BR and RB the same key; never sort the board. Let F(b,H) be the minimum future insertions for stable board b (with no removable run) and remaining hand H, with ∞ for failure."
  ],
  "formula": [
    "F(空,H)=0；F(b,H)=min[1+F(collapse(插入(b,c,i)), H−{c})]，枚举手中颜色 c 与所有空隙 i；无成功分支为 ∞。",
    "F(empty,H)=0; F(b,H)=min[1+F(collapse(insert(b,c,i)), H−{c})] over every available color c and gap i; no successful branch means ∞."
  ],
  "proof": [
    "为什么精确？任意解都必须先选某颗手球和某个空隙，代码把这些首步全部覆盖；消除不再消耗球，所以首步费用正好为 1。随后只依赖稳定棋盘与剩余手牌，取最小后续代价即可。每次递归手牌少 1，最终到空棋盘或无球可用；按手牌长度归纳，所有返回值都正确。",
    "Why is it exact? Every solution starts with some hand ball at some gap; the code covers every such first move. Removal spends no additional balls, so the first move costs exactly 1. The future depends only on the stable board and remaining hand; take its minimum. Each recursive call has one fewer hand ball and eventually reaches an empty board or an exhausted hand. Induction on hand size proves the returned costs."
  ],
  "safeSkips": [
    "只跳过有证明的重复：同色手球可互换；如果空隙左边已经是颜色 c，把 c 插在这段的不同位置会得到完全相同的字符串，保留最左插法即可。若某个仍在棋盘上的颜色在棋盘加手牌总共不足 3 颗，它永远不能被消除，可立即判失败。数量够 3 只是必要条件，不能反过来保证可解。",
    "Skip only proven duplicates: equal hand balls are interchangeable. If a gap's left neighbor already has color c, inserting c at different positions within that run makes the identical string; keep its leftmost insertion. If a color still on the board has fewer than 3 balls in board plus hand, it can never disappear, so reject the state. Having 3 is necessary, not sufficient for solvability."
  ],
  "mapping": [
    "对应代码：collapse 完成上方所有消除帧；solve(row, remaining) 只接收稳定棋盘与排序手牌；@cache 保存完整二元组的答案。gap 循环包含两端，也保留不消球的动作。常数 6 代表不可能，因为手牌最多 5 颗；非空棋盘答案为 1 时可提前返回。",
    "Code mapping: collapse performs all the removal frames above. solve(row, remaining) receives only a stable row and sorted hand; @cache saves the answer for that complete pair. The gap loop includes both ends and keeps moves that remove nothing. Constant 6 represents failure because at most 5 balls can be spent. A result of 1 for a nonempty board can return early."
  ],
  "cost": [
    "成本：设初始长度 n、手牌长 h，L=n+h≤21，S 为实际访问的不同状态数（最坏指数级）。每状态最多尝试 5(L+1) 次插球；反复扫描和切片的 collapse 保守计 O(L²)。因此时间 O(5SL³)，缓存与递归空间 O(S(L+h)+hL)。记忆化减少重复，并没有消除指数增长。上方教学快照另占空间，不算作提交算法空间。",
    "Cost: let n be initial row length, h hand length, L=n+h≤21, and S the number of distinct states visited (exponential in the worst case). Each state tries at most 5(L+1) insertions. Repeated scans and slices make collapse O(L²) conservatively. Time is O(5SL³); cache plus recursion space is O(S(L+h)+hL). Memoization removes repetition, not exponential growth. Tutorial snapshots consume separate space, outside the submitted algorithm."
  ],
  "bounds": [
    "边界：空棋盘返回 0，即使手中还剩球；手空且棋盘非空则失败；消除四颗、五颗等整段都合法。官方样例答案依次为 −1、2、2。测试用独立逐层枚举核对 Python，并检查中间稳定状态。下列代码可按官方 Python3 接口提交；此处没有运行在线评测。",
    "Boundaries: an empty board returns 0 even with balls left; an exhausted hand with a nonempty board fails. Entire runs of four, five or more are removed. Official sample answers are −1, 2, 2. Tests compare Python against an independent layer-by-layer oracle and inspect intermediate stable states. The code follows the official Python3 interface; no online judging has been performed here."
  ],
  "sourceTitle": [
    "官方 Python3 接口 · 可离线查看",
    "Official Python3 interface · Available offline"
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
    "Complete source copied."
  ],
  "copyFail": [
    "剪贴板不可用。下方已选中完整源码，请手动复制。",
    "Clipboard unavailable. The full source is selected below; copy it manually."
  ],
  "manual": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "sourceLabel": [
    "完整 Python 源码",
    "Complete Python source"
  ],
  "related": [
    "继续连接概念",
    "Connect the ideas"
  ],
  "rel0": [
    "本页：稳定状态与手牌守恒",
    "Here: stable states and hand conservation"
  ],
  "rel1": [
    "#301：搜索状态与最少删除",
    "#301: search states and minimum removals"
  ],
  "rel2": [
    "#37：回溯时恢复完整约束",
    "#37: restoring complete constraints in backtracking"
  ],
  "foot": [
    "作者自查候选 · 独立评审待进行。交互为教学模拟；未声称 LeetCode 接受、真实学习者效果或生产发布。",
    "Author self-checked candidate · Independent review pending. Interactions are teaching simulations; no LeetCode acceptance, learner outcomes, or production release is claimed."
  ],
  "baselineTitle": [
    "展开正确但重复工作的基线 Python",
    "Expand the correct but repetitive baseline Python"
  ],
  "baselineBounds": [
    "仅用于小输入：队列逐层试所有球与空隙，没有去重或剪枝。设 T 为原始树的总节点数，L 为棋盘长加手牌长，则保守时间 O(TL²)，队列空间 O(TL)；T 随手牌长度指数增长。re.sub 删除同色连续段，反复执行直到稳定。",
    "For small inputs only: the queue tries every ball and gap layer by layer, without deduplication or pruning. Let T be the raw tree node count and L be board length plus hand length. Conservative time is O(TL²), queue space O(TL); T grows exponentially with hand size. re.sub removes same-color runs repeatedly until stable."
  ],
  "stepNavigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "returnTitle": [
    "跟着一次调用返回，再试相邻分支",
    "Follow a call back, then try its sibling"
  ],
  "returnFailure": [
    "用刚才的状态跟踪 solve(\"RBBR\", \"BR\")：父调用要返回最少还需几球，先设 best=6。这里 6 表示失败，不是花了六球，因为手牌最多只有五球。先取 B，rest=\"R\"；在空隙 0 插入后得到 BRBBR，没有消除。子调用 solve(\"BRBBR\", \"R\") 只剩一颗 R：所有 R 插法都凑不出连续三颗，棋盘又不空，所以各分支失败，子调用返回 6。回到父调用，best=min(6,1+6)=6；这个失败分支没有改善答案。",
    "Trace the state from the exercise: solve(\"RBBR\", \"BR\") must return the fewest balls still needed. The parent starts with best=6. Here 6 means failure, not six balls spent, because the hand holds at most five. Take B, making rest=\"R\". Inserting at gap 0 makes BRBBR without removal. The child solve(\"BRBBR\", \"R\") has only one R: no R insertion forms a consecutive triple, and the board stays nonempty, so every branch fails and the child returns 6. Back in the parent, best=min(6,1+6)=6; this failed branch does not improve the answer."
  ],
  "returnSibling": [
    "返回后，父调用仍持有 row=\"RBBR\"、remaining=\"BR\"。切片与拼接创建了新的字符串，子调用中的 row 和 remaining 是子调用自己的参数；它没有就地改掉父调用的字符串，因此不用撤销。父调用的 gap 循环接着试同一颗 B 的空隙 1：RBBBR 消除 BBB 后变成 RR，仍用 rest=\"R\"。子调用 solve(\"RR\", \"R\") 插 R 得到 RRR，消除后调用 solve(\"\", \"\")，空棋盘返回 0。因此这个子调用的 best=min(6,1+0)=1，并返回 1。",
    "After the return, the parent still holds row=\"RBBR\" and remaining=\"BR\". Slicing and concatenation created new strings; the child has its own row and remaining arguments. It did not modify the parent strings in place, so no undo is needed. The parent gap loop next tries the same B at gap 1: RBBBR loses BBB and becomes RR, still with rest=\"R\". The child solve(\"RR\", \"R\") inserts R to make RRR, removes it, then calls solve(\"\", \"\"). The empty board returns 0. That child therefore sets best=min(6,1+0)=1 and returns 1."
  ],
  "returnMinimum": [
    "现在回到原父调用，best=min(6,1+1)=2：外面的 1 是父调用插入的 B，子调用返回的 1 是以后插入的 R，消除都免费。父调用不能因为找到 2 就提前返回；代码只在非空棋盘找到 1 时提前返回。它还会检查其余未跳过的 B 空隙与 R 插法，最后返回最小值 2。一球 B 最多留下 RR，一球 R 消不掉 BB，所以没有分支能低于 2。这只手算了两个相邻分支，不是完整搜索树；缓存保存的是未来最少球数 2，不是走到这里已经用掉的球数。",
    "Back in the original parent, best=min(6,1+1)=2: the outer 1 pays for its B insertion, and the returned 1 pays for the later R. All removals are free. Finding 2 does not end this parent call; the code returns early only on finding 1 for a nonempty board. It checks the other unskipped B gaps and R insertions, then returns the minimum, 2. A single B leaves at least RR; a single R cannot remove BB, so no branch can beat 2. We have hand-worked just two neighboring branches, not the whole search tree. The cache saves the future minimum 2, not the balls already spent reaching this state."
  ]
};
