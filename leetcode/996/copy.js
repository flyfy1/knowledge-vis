window.LESSON_COPY = {
  "docTitle": [
    "#996 · 正方形数组的数目",
    "#996 · Number of Squareful Arrays"
  ],
  "title": [
    "#996 · 正方形数组的数目",
    "#996 · Number of Squareful Arrays"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "collection": [
    "LeetCode 题解集",
    "LeetCode lessons"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "把 1、17、8 排成一行：哪些相邻和能开出整数平方根？再想想有重复数字时怎样只数一次。",
    "Line up 1, 17 and 8. Which neighboring sums have integer square roots? Then count fairly when values repeat."
  ],
  "badge": [
    "困难 · Python · 回溯",
    "Hard · Python · Backtracking"
  ],
  "nav0": [
    "0 · 手算",
    "0 · Hand calculation"
  ],
  "nav1": [
    "1 · 重复",
    "1 · Duplicates"
  ],
  "nav2": [
    "2 · 试与还原",
    "2 · Try and restore"
  ],
  "nav3": [
    "3 · 预测",
    "3 · Predict"
  ],
  "nav4": [
    "4 · 实现",
    "4 · Implement"
  ],
  "s0": [
    "哪些排列满足条件？",
    "Which reorderings qualify?"
  ],
  "p0": [
    "排列是把全部元素重新排序。若每对相邻元素的和都是完全平方数（某个非负整数的平方），这个数组就叫平方数组。对 [1,17,8]，1+8=9=3²，8+17=25=5²，而 1+17=18 不是平方数。先找出 8 必须放在哪里，再展开全部六种排列。",
    "A permutation reorders all entries. An array is squareful when every neighboring pair sums to a perfect square, the square of a nonnegative integer. For [1,17,8], 1+8=9=3² and 8+17=25=5², but 1+17=18 is not square. Decide where 8 must go, then inspect all six orders."
  ],
  "handBtn": [
    "展开六种排列与相邻和",
    "Reveal all six orders and sums"
  ],
  "hand": [
    "[1,8,17]：9、25 ✓；[17,8,1]：25、9 ✓。其余 [1,17,8]：18、25；[17,1,8]：18、9；[8,1,17]：9、18；[8,17,1]：25、18，均含 18，失败。答案 2；反向排列也算不同。",
    "[1,8,17]: 9,25 ✓; [17,8,1]: 25,9 ✓. The others are [1,17,8]: 18,25; [17,1,8]: 18,9; [8,1,17]: 9,18; [8,17,1]: 25,18. Each contains 18 and fails. Answer: 2. Reversing an order can give a different permutation."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 12，0 ≤ nums[i] ≤ 10⁹。按每个位置的值区分排列；相同副本互换不算新排列。不取模；单个元素没有相邻对，答案为 1。",
    "Official bounds: 1 ≤ n ≤ 12, 0 ≤ nums[i] ≤ 10⁹. Orders differ by values at positions; swapping equal copies creates no new order. No modulus. A singleton has no neighboring pair and counts once."
  ],
  "s1": [
    "为什么不能直接数副本的排列？",
    "Why not count permutations of copies?"
  ],
  "p1": [
    "正确基线：枚举所有位置的排列，用集合去掉相同的值序列，再逐一检查相邻和。下面 permutations 产生所有重排的元组（不可变序列），set 只保留不同元组，all 要求每对都通过。zip(order, order[1:]) 把序列与去掉首项的序列配对，恰好得到每个相邻对。单元素的空检查也通过。",
    "A correct baseline permutes positions, puts the resulting value sequences in a set to remove duplicates, then checks each neighboring sum. Here permutations produces tuples (immutable sequences), set retains unique tuples, and all requires every pair to pass. zip(order, order[1:]) pairs the sequence with its suffix starting at the second entry, giving each neighboring pair. The empty pair check for a singleton also passes."
  ],
  "baselineCost": [
    "n 是元素数。生成 n! 个长度为 n 的元组需要 O(n·n!) 时间；集合最坏存 O(n·n!) 个元素位置。n=12 时有 479001600 个带副本身份的排列。可以在出现第一个坏相邻和时就停止该分支，并且从一开始只按不同的值选择。",
    "With n entries, generating n! tuples of length n takes O(n·n!) time; the set uses O(n·n!) space in the worst case. At n=12 there are 479001600 permutations of labeled copies. We can stop a branch at its first bad sum and choose by distinct value from the start."
  ],
  "wrong": [
    "诱人但错误：让每个副本各选一次，然后直接计数。[2,2,2] 的六种副本排列都满足 2+2=4，却是同一个值序列，答案只能是 1。另一个错误是用集合表示“未用值”：它会忘记三个 2 的次数。",
    "Tempting mistake: choose each labeled copy once and count directly. All six copy permutations of [2,2,2] pass 2+2=4, yet they are one value sequence, so the answer is 1. A set of unused values also fails: it forgets that three copies of 2 remain."
  ],
  "s2": [
    "怎样试出每个合法序列且不重复？",
    "How do we build every legal order once?"
  ],
  "p2": [
    "前缀是已经选好的开头；剩余次数是每个值还有多少副本未用。对 [1,17,8] 选 1 后，次数从 (1:1,8:1,17:1) 变为 (1:0,8:1,17:1)。只能接 8，因为 1+17=18 失败。再接 17 得到完整序列，计数加一。",
    "A prefix is the beginning already chosen; remaining counts say how many unused copies of each value remain. For [1,17,8], choosing 1 changes (1:1,8:1,17:1) to (1:0,8:1,17:1). Only 8 may follow: 1+17=18 fails. Appending 17 then completes one order."
  ],
  "derive": [
    "回溯就是试一个选择，探索完后还原。子调用选 17 后，返回要撤销 17，再撤销 8，回到 [1] 及次数 (0,1,1)，才能试兄弟选择 17（会被拒绝）。最终撤销 1，回到空前缀再试 8。完整序列返回 1，走不通的调用返回 0，父调用把各子调用结果相加。",
    "Backtracking means trying a choice, exploring it, then restoring it. After the child chooses 17, return and undo 17, then undo 8, restoring prefix [1] and counts (0,1,1). Now try its sibling 17, which is rejected. Eventually undo 1 and try 8 from the empty prefix. A complete order returns 1; a dead end returns 0; each parent adds its child results."
  ],
  "formula": [
    "每次调用：剩余次数 = 原次数 − 前缀中使用次数；前缀所有相邻和均为平方数。",
    "At every call: remaining counts = original counts − prefix usage; every neighboring sum in the prefix is square."
  ],
  "proof": [
    "这就是不变量：每次调用都成立的条件。只有次数大于零且与末尾兼容的值才能接入，故不会造出非法序列。每个不同的下一值只有一个分支，故不会重复；任意合法序列的下一值一定在这些分支中，故不会漏掉。撤销恢复次数，使兄弟分支仍满足同一个条件。次数全为零时恰好接收一个完整排列。",
    "This is the invariant: a condition true at every call. Append only a value with a positive count and a square sum with the last value, so every prefix stays legal. Each distinct next value has one branch, preventing duplicates. Every legal order has its next value among those branches, preventing omissions. Undo restores counts for siblings. All counts zero accepts exactly one complete order."
  ],
  "guide": [
    "操作任务：保持一组输入不变，逐事件前进，观察“选择→接收→撤销”后次数如何恢复；再后退一步核对账本也恢复。换预设会重启本实验，不改预测题。",
    "Task: keep one input fixed and advance event by event. Watch counts recover through choose → accept → undo. Step back to check the ledger also rewinds. A preset restarts this experiment and leaves the prediction exercise unchanged."
  ],
  "presets": [
    "输入预设（更换将重启）",
    "Input preset (changing restarts trace)"
  ],
  "preset0": [
    "[1,17,8] · 两个方向",
    "[1,17,8] · Two directions"
  ],
  "preset1": [
    "[2,2,2] · 重复副本",
    "[2,2,2] · Equal copies"
  ],
  "preset2": [
    "[0,0,1] · 零也是平方数",
    "[0,0,1] · Zero is square"
  ],
  "preset3": [
    "[1,1,8,8] · 重复且剪枝",
    "[1,1,8,8] · Repeats and pruning"
  ],
  "preset4": [
    "[3] · 没有相邻对",
    "[3] · No adjacent pair"
  ],
  "preset5": [
    "[1,2] · 无解",
    "[1,2] · No valid order"
  ],
  "sim": [
    "这是 JavaScript 教学模拟，不执行下方 Python。展示所选小输入的完整搜索，无省略事件。每帧是所标操作完成后的快照；彩色方块只是当前前缀中的值。账本仅含截至此帧接收的完整值序列。",
    "This JavaScript teaching simulation does not execute the Python below. It shows the full search for each small preset, with no omitted events. Frames are snapshots after the labeled operation; tiles are values in the current prefix. The ledger contains only complete value sequences accepted by this frame."
  ],
  "prev": [
    "上一个事件",
    "Previous event"
  ],
  "next": [
    "下一个事件",
    "Next event"
  ],
  "reset": [
    "重置搜索",
    "Reset search"
  ],
  "end": [
    "到搜索结束",
    "Finish search"
  ],
  "progress": [
    "事件 {i}/{n} · 已接收完整序列 {count} 个",
    "Event {i}/{n} · Complete orders accepted so far: {count}"
  ],
  "pathLabel": [
    "当前前缀（从左到右）",
    "Current prefix (left to right)"
  ],
  "empty": [
    "空前缀 ∅",
    "Empty prefix ∅"
  ],
  "countsLabel": [
    "剩余次数：值 → 未用副本数",
    "Remaining counts: value → unused copies"
  ],
  "ledgerLabel": [
    "已接收序列账本（截至当前事件）",
    "Accepted-order ledger (through current event)"
  ],
  "none": [
    "尚未接收完整序列。",
    "No complete order accepted yet."
  ],
  "start": [
    "初始状态：尚未选择，所有副本均可用。",
    "Initial state: nothing chosen; every copy is available."
  ],
  "choose": [
    "选择值 {x}；消耗一个副本。{reason}",
    "Choose value {x}; consume one copy. {reason}"
  ],
  "first": [
    "它是首项，没有相邻对需要检查。",
    "It is the first entry, so there is no pair to check."
  ],
  "pair": [
    "刚形成的相邻和 {sum} 是平方数。",
    "The new adjacent sum {sum} is square."
  ],
  "reject": [
    "拒绝值 {x}：相邻和 {sum} 不是平方数。前缀与次数保持不变。",
    "Reject value {x}: adjacent sum {sum} is not square. Prefix and counts stay unchanged."
  ],
  "accept": [
    "所有副本都已用完：接收当前序列，账本增加一项；接着返回父调用。",
    "All copies are used: accept this order, add one ledger entry, then return to the parent call."
  ],
  "undo": [
    "撤销值 {x}：归还一个副本，恢复父调用的前缀和次数，继续试兄弟分支。",
    "Undo value {x}: return one copy, restoring the parent prefix and counts before trying siblings."
  ],
  "done": [
    "搜索结束，最终答案为 {count}。次数已恢复到初始值。",
    "Search finished. Final answer: {count}. Counts are restored to their initial values."
  ],
  "s3": [
    "新例子：两个 1 可以分开使用吗？",
    "New case: can the two 1s be separated?"
  ],
  "p3": [
    "独立预测：[0,1,1] 有多少个不同的平方数组排列？0+1=1，而 1+1=2。不要标记两个 1 的身份；每次选 1 只消耗一个副本。先选择，再揭晓。",
    "Independent prediction: how many distinct squareful orders does [0,1,1] have? 0+1=1, but 1+1=2. Give the two 1s no separate identities; each choice of 1 consumes just one copy. Choose before revealing."
  ],
  "legend": [
    "预测不同的合法值序列数",
    "Predict the number of distinct legal value sequences"
  ],
  "opt0": [
    "0 · 相同值不能再次使用",
    "0 · A repeated value cannot be reused"
  ],
  "opt1": [
    "2 · 两个 1 可互换",
    "2 · The two 1s may swap"
  ],
  "opt2": [
    "1 · 只要次数够就可再选",
    "1 · Reuse is allowed while a copy remains"
  ],
  "reveal": [
    "核对预测",
    "Check prediction"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "需要修正。",
    "Revise this prediction."
  ],
  "answer": [
    "答案 1：[1,0,1] 的相邻和为 1、1。两个 1 可重复取用，因为次数从 2 降到 1 再到 0；交换其身份不产生新序列。[0,1,1] 和 [1,1,0] 都含和 2。选 0 会漏掉合法重复使用；选 2 会重复计算同一个值序列。",
    "Answer: 1. [1,0,1] has sums 1 and 1. The value 1 can be reused: its count falls from 2 to 1 to 0. Swapping copy identities creates no new order. [0,1,1] and [1,1,0] contain sum 2. Choosing 0 misses valid reuse; choosing 2 double-counts the same value sequence."
  ],
  "s4": [
    "怎样把选择与还原写成 Python？",
    "How do choose and restore become Python?"
  ],
  "p4": [
    "提交接口是 Solution.numSquarefulPerms(nums)，返回整数。Counter 统计各值次数；values 是不同值的排序列表；counts[j] 是 values[j] 的剩余次数。compatible[i][j] 预先记录两值之和是否为平方数；isqrt 返回精确整数平方根，避免浮点误差。",
    "The submission interface is Solution.numSquarefulPerms(nums), returning an integer. Counter counts copies. values lists distinct values in sorted order; counts[j] is the remaining count for values[j]. compatible[i][j] stores whether their sum is square. isqrt gives the exact integer square root, avoiding floating-point error."
  ],
  "mapping": [
    "对应模拟：dfs(last,left) 的 last 是上一个值在 values 的索引，−1 表示空前缀；left 是未用元素总数。counts[j] -= 1 对应“选择”；dfs(j,left−1) 探索子调用；counts[j] += 1 对应“撤销”。left==0 返回 1 对应“接收”。循环把所有孩子的结果相加；次数为零或相邻和不合法就跳过。代码不保存前缀，前缀仅用于教学显示。",
    "Mapping: in dfs(last,left), last is the index of the previous value in values; −1 means an empty prefix. left counts all unused entries. counts[j] -= 1 is choose; dfs(j,left−1) explores the child; counts[j] += 1 is undo. left==0 returns 1 for accept. The loop adds all child results, skipping exhausted or incompatible values. Submission code does not store the prefix; the diagram uses it for teaching."
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
    "已复制完整 Python 源码。",
    "Full Python source copied."
  ],
  "fallback": [
    "自动复制不可用。完整源码已选中；请使用系统复制快捷键。",
    "Automatic copy unavailable. Full source selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整源码",
    "Copy full source manually"
  ],
  "cost": [
    "成本：n 是元素数，k 是不同值数。预处理 O(k²)；搜索的保守上界是 O(n·n!) 时间，仍可能是阶乘级。递归深度 n，次数 O(k)，兼容矩阵 O(k²)，合计辅助空间 O(n+k²)。模拟还保存全部快照与账本，这些不计入提交空间。",
    "Costs: n is the entry count, k the distinct-value count. Preprocessing takes O(k²); a conservative search bound is O(n·n!) time, still factorial. Depth n, O(k) counts and an O(k²) compatibility matrix give O(n+k²) auxiliary space. The simulation additionally stores every snapshot and ledger; those are not submission memory."
  ],
  "boundaries": [
    "边界：0+0=0 通过；单个大数仍有 1 种；重复值可多次接入但不能超过次数；所有对都失败时答案为 0。不改变 nums。用独立的排列去重基线核对小规模结果；不意味着已在线提交。",
    "Boundaries: 0+0=0 passes; even a large singleton counts once. Repeated values may recur up to their counts. If every pair fails, the answer is 0. nums is unchanged. Small results can be checked against an independent deduplicated-permutation baseline; this does not imply an online submission."
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "rel1": [
    "#51：观察回溯中的撤销",
    "#51: inspect undo in backtracking"
  ],
  "rel2": [
    "#940：区分相同值与不同选择",
    "#940: distinguish equal values from different choices"
  ],
  "foot": [
    "手算 → 按值选择 → 保持次数不变量 → Python。",
    "Calculate → choose by value → preserve remaining counts → Python."
  ]
};
