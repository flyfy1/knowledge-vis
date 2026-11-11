window.COPY = {
  "docTitle": [
    "1000 · 合并石头的最低成本",
    "1000 · Minimum Cost to Merge Stones"
  ],
  "title": [
    "#1000 · 合并石头的最低成本",
    "#1000 · Minimum Cost to Merge Stones"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "一排石头，合并时再付一次钱。同一块石头可能被重复计费；我们要决定先合并哪一段。",
    "A row of stone piles. Each merge charges again for every stone it contains. Which adjacent piles should you combine first?"
  ],
  "contract": [
    "输入 stones 是每堆的石头数；一次必须合并恰好 k 个当前相邻堆，费用等于它们的总石头数。求变成一堆的最低总费用；不可能则返回 −1。1 ≤ n ≤ 30，1 ≤ stones[i] ≤ 100，2 ≤ k ≤ 30。",
    "Input stones gives the size of each pile. A move combines exactly k currently adjacent piles and charges their total size. Return the minimum total cost to reach one pile, or −1 if impossible. 1 ≤ n ≤ 30, 1 ≤ stones[i] ≤ 100, 2 ≤ k ≤ 30."
  ],
  "nav1": [
    "1 · 先算两笔钱",
    "1 · Two payments"
  ],
  "h1": [
    "1. 先算两笔钱",
    "1. Two payments"
  ],
  "nav2": [
    "2 · 为什么要记堆数",
    "2 · Why count piles?"
  ],
  "h2": [
    "2. 为什么要记堆数",
    "2. Why count piles?"
  ],
  "nav3": [
    "3 · 逐格构造答案",
    "3 · Build the answers"
  ],
  "h3": [
    "3. 逐格构造答案",
    "3. Build the answers"
  ],
  "nav4": [
    "4 · 先预测再揭晓",
    "4 · Predict, then reveal"
  ],
  "h4": [
    "4. 先预测再揭晓",
    "4. Predict, then reveal"
  ],
  "nav5": [
    "5 · 对应到 Python",
    "5 · Map to Python"
  ],
  "h5": [
    "5. 对应到 Python",
    "5. Map to Python"
  ],
  "p1": [
    "这一步要回答：为什么 [3,2,4]、k=2 的总费用是 14？“堆”是当前放在一起的一组石头。先合并相邻的 3 和 2，付 5；再合并 5 和 4，付 9。5 里的石头被付费两次，所以总费用不是原数组总和 9。",
    "What makes the total cost 14 for [3,2,4] with k=2? A pile is a group of stones currently kept together. Combine adjacent 3 and 2 for 5, then 5 and 4 for 9. The stones inside 5 are charged twice, so the answer is not the original sum of 9."
  ],
  "handHint": [
    "按“合并一次”，保持 k=2 不变。看堆的数量减少，同时下方保留每笔费用。后退可以复原。",
    "Keep k=2 fixed and press “Merge once.” Watch the pile count fall while the payment history stays visible. Go back to restore the previous state."
  ],
  "handPrev": [
    "撤回一次合并",
    "Undo one merge"
  ],
  "handNext": [
    "合并一次",
    "Merge once"
  ],
  "hand0": [
    "还没有操作。当前 3 堆；已付 0。",
    "No moves yet. 3 current piles; paid 0."
  ],
  "hand1": [
    "[3,2] → 5，当前 2 堆；已付 5。",
    "[3,2] → 5. 2 current piles; paid 5."
  ],
  "hand2": [
    "[5,4] → 9，当前 1 堆；总费用 5 + 9 = 14。",
    "[5,4] → 9. 1 current pile; total cost 5 + 9 = 14."
  ],
  "pay1": [
    "第一笔：3 + 2 = 5",
    "Payment 1: 3 + 2 = 5"
  ],
  "pay2": [
    "第二笔：5 + 4 = 9",
    "Payment 2: 5 + 4 = 9"
  ],
  "alternate": [
    "另一种顺序先合并 [2,4]，付 6，再付 9，总计 15。k=2 且只有 3 堆时，第一步只有这两个选择，故最低是 14。",
    "The other order combines [2,4] first for 6, then pays 9, totaling 15. With three piles and k=2 these are the only two first moves, so 14 is the minimum."
  ],
  "p2": [
    "这一步要回答：能否总是先合并最便宜的一组？不能。[6,4,4,6]、k=2 先选中间的 8，随后只能付 14，再付 20，总计 42；先分别合并左右两对，费用是 10 + 10 + 20 = 40。眼前便宜的合并会让中间的石头被多付一次。",
    "Can we always choose the cheapest available merge? No. For [6,4,4,6], k=2, merging the middle pair for 8 forces payments of 14 and 20: total 42. Combining the two end pairs costs 10 + 10 + 20 = 40. A cheap early merge can charge its stones one extra time later."
  ],
  "baselineTitle": [
    "可靠的起点：枚举所有合法顺序",
    "A correct baseline: enumerate every legal order"
  ],
  "baselineText": [
    "下面的函数返回当前堆列表的最低剩余费用。一次选一个长为 k 的连续片段，求和并用一堆替换它；递归返回子问题费用后加上这次费用，再尝试下一个片段。只有一堆时返回 0；少于 k 堆且不止一堆时返回无穷大（表示无法完成）。例如 [3,2,4] 的第一条分支调用 [5,4]，得到 9，父调用加 5 得 14；原列表未被修改，返回后仍可尝试 [3,6] 得 15。",
    "The function below returns the minimum remaining cost for the current list of piles. Choose each consecutive block of k, replace it by its sum, and add that payment to the recursive result. One pile needs zero more cost. Between two and k−1 piles cannot finish, represented by infinity. For [3,2,4], the first child [5,4] returns 9; its parent adds 5 to get 14. The original list is unchanged, so the sibling [3,6] can still be tried, yielding 15."
  ],
  "baselineCost": [
    "不缓存时分支数可指数增长：k=2 的有序第一步选择共有 (n−1)! 条完整路径，每个分支还要复制列表。每个分支 O(n) 工作，保守时间上界 O(n·n!)；递归深度 O(n)、每层保留 O(n) 列表，额外空间 O(n²)。n=30 时不能逐一枚举。相同原始连续区间会被反复求解。",
    "Without caching, branching grows rapidly: for k=2 there are (n−1)! complete sequences of first-move choices, and each branch copies lists. Each branch takes O(n) work; a conservative time bound is O(n·n!). Depth O(n) with O(n) retained list data per level uses O(n²) auxiliary space. Enumerating these paths is unsuitable for n=30. Many orders solve the same original contiguous intervals repeatedly."
  ],
  "count": [
    "每次合并用 k 堆替换成 1 堆，堆数减少 k−1。因此，从 L 堆到 p 堆必须满足 L≥p 且 (L−p) 能被 k−1 整除。例如 k=3 时，4→2 后不能继续，不能得到 1；5→3→1 则可行。对连续的一段，这个条件也足够：只要堆数大于 p，就至少有 k 堆，继续合并相邻 k 堆即可。",
    "Each merge replaces k piles by one, reducing the count by k−1. Going from L piles to p requires L≥p and (L−p) divisible by k−1. For k=3, 4→2 gets stuck, while 5→3→1 can finish. For a contiguous segment this is also sufficient: whenever its count exceeds p, it has at least k piles, so another adjacent merge is possible."
  ],
  "state": [
    "“区间”指原数组中连续的位置，编号从 0 开始。定义状态 D(i,j,p)：把原始 i..j（两端都含）变成恰好 p 堆的最低费用。“动态规划”就是存下这些较小问题的答案来复用。仅记 D(i,j) 不够：k=3 时两堆不能进行最后一次三堆合并，三堆却可以。",
    "An interval is a consecutive range of original positions, indexed from 0. Define state D(i,j,p) as the minimum cost to turn original positions i..j, inclusive, into exactly p piles. Dynamic programming stores answers to these smaller problems for reuse. An interval alone is insufficient: for k=3, two remaining piles cannot undergo the final three-pile merge, but three can."
  ],
  "p3": [
    "这一步要回答：一个状态的费用从哪些已完成状态而来？这里再次定义 D(i,j,p)：原始闭区间 i..j 变成 p 堆的最低费用。每个堆始终来自原数组的连续区间。若 p≥2，最终最左边的一堆结束于某个 m；它右边必须留下 p−1 堆。切口 m 表示在原始位置 m 后断开，两侧没有跨切口的合并。",
    "Which completed states supply the cost of a new state? Here D(i,j,p) means the minimum cost to reduce original inclusive interval i..j to p piles. Every pile always contains a contiguous original interval. For p≥2, its leftmost final pile ends at some m, leaving p−1 piles to the right. A cut m falls after original position m; neither side merges across it."
  ],
  "formula": [
    "p ≥ 2: D(i,j,p) = min over i ≤ m < j of [D(i,m,1) + D(m+1,j,p−1)]\np = 1, i < j: D(i,j,1) = D(i,j,k) + sum(stones[i..j])",
    "p ≥ 2: D(i,j,p) = min over i ≤ m < j of [D(i,m,1) + D(m+1,j,p−1)]\np = 1, i < j: D(i,j,1) = D(i,j,k) + sum(stones[i..j])"
  ],
  "derive": [
    "为什么第二行要加区间总和？变成一堆的最后一步必须恰好合并 k 堆，不管之前如何合并，石头总数没变。例如 [3,2,4] 的 D(0,2,2) 比较切口 m=0：0+6=6，m=1：5+0=5；故先花 5 得到两堆，再加原区间总和 9，得到 14。p≥2 的拆分本身不发生合并，所以那一行不加区间总和。",
    "Why add the interval sum in the second line? The final operation must combine exactly k piles, and earlier merges preserve their total stones. For [3,2,4], D(0,2,2) compares m=0: 0+6=6, and m=1: 5+0=5. Spend 5 to reach two piles, then add the original interval sum 9 to get 14. Splitting a p≥2 state is bookkeeping, not a merge, so that line adds no interval sum."
  ],
  "proof": [
    "为什么是最低费用？任意合法的 p≥2 堆结果都有一个最左堆的边界 m。它两侧的实际费用分别不低于对应状态的最低值，所以整条方案不会低于所有切口候选中的最小值。反过来，把某个切口两侧的最低费用方案拼起来就能达到它的候选值。p=1 时拆掉最后一次合并，必然得到 k 堆；再把这次合并接回去，就达到第二行。因此两行既不漏合法方案，也不会凭空构造不合法方案。",
    "Why is this the minimum? Every legal p≥2-pile result has a boundary m after its first pile. Each side’s actual cost is at least its state’s minimum, so no full construction beats the smallest cut candidate. Conversely, joining the optimal constructions on either side attains each candidate. For p=1, removing the last merge necessarily leaves k piles; appending it again attains the second line. These arguments cover every legal construction and make each selected bound attainable."
  ],
  "order": [
    "不变量：完成长度 L 后，所有长度不超过 L 的可行状态都已是最低费用。初始化 D(i,i,1)=0，其他状态为 ∞（不可能）；长度从短到长。拆分两侧都更短；同一区间先算 p≥2，再算 p=1，因此依赖已完成。下方每帧完成一个可行状态；所有有限候选都列出。不可行状态不逐帧展示，始终为 ∞；单堆初值已经完成。",
    "Invariant: after length L is completed, all feasible states of length at most L hold their minimum costs. Initialize D(i,i,1)=0 and other states to ∞ (impossible); process increasing lengths. Both sides of a cut are shorter. For the same interval compute p≥2 before p=1, so dependencies are ready. Each frame below completes one feasible state and lists every finite candidate. Infeasible states stay ∞ and have no separate frame; singleton bases are already complete."
  ],
  "simulation": [
    "教学模拟，不执行下方 Python。预设仅含 ≤5 堆；保存完整历史便于回退，额外演示存储不属于提交代码的空间复杂度。",
    "Teaching simulation; it does not execute the Python below. Presets contain at most five piles. Full history supports rewind; that extra tutorial storage is outside the submission’s space bound."
  ],
  "presetLabel": [
    "选择输入（更换会重启本实验）",
    "Choose input (changing restarts this experiment)"
  ],
  "pre0": [
    "A",
    "A"
  ],
  "pre1": [
    "B",
    "B"
  ],
  "pre2": [
    "C",
    "C"
  ],
  "pre3": [
    "D",
    "D"
  ],
  "pre4": [
    "E",
    "E"
  ],
  "pre5": [
    "F",
    "F"
  ],
  "pre6": [
    "G",
    "G"
  ],
  "pre7": [
    "H",
    "H"
  ],
  "inputReadout": [
    "输入：stones = {a}，k = {k}。",
    "Input: stones = {a}, k = {k}."
  ],
  "traceHint": [
    "保持预设不变，逐个完成状态；看本次切口的左右费用，再看下方累积表。★ 表示刚完成的行，所有显示行均已完成；并列最优都会标记。可以后退或重置；练习题不受影响。",
    "Keep the preset fixed and complete states one at a time. Inspect each cut’s left and right costs, then the accumulated table. ★ marks the just-completed row; every displayed row is complete. All tied best cuts are marked. Rewind or reset freely; the prediction exercise is separate."
  ],
  "prev": [
    "退回一个状态",
    "Previous state"
  ],
  "next": [
    "完成下个状态",
    "Complete next state"
  ],
  "reset": [
    "重置状态表",
    "Reset state table"
  ],
  "end": [
    "完成所有状态",
    "Complete all states"
  ],
  "init": [
    "已初始化每个单堆 D(i,i,1)=0；尚未合并。",
    "Initialized every singleton D(i,i,1)=0; no merges yet."
  ],
  "impossible": [
    "堆数检查：(n−1) 不能被 (k−1) 整除。无需计算区间，返回 −1。",
    "Pile-count guard: (n−1) is not divisible by (k−1). No interval computation is needed; return −1."
  ],
  "splitEvent": [
    "刚完成 D({i},{j},{p}) = {value}。比较下表所有有限切口；未列切口含 ∞，无法形成目标堆数。",
    "Just completed D({i},{j},{p}) = {value}. Compare every finite cut below; omitted cuts include ∞ and cannot form the target pile counts."
  ],
  "mergeEvent": [
    "刚完成 D({i},{j},1) = D({i},{j},k) + 区间总和 = {before} + {sum} = {value}。这笔费用对应实际最后一次合并。",
    "Just completed D({i},{j},1) = D({i},{j},k) + interval sum = {before} + {sum} = {value}. The added payment is the actual final merge."
  ],
  "progress": [
    "状态进度 {done}/{total}（不含初值）；{result}",
    "State progress {done}/{total} (excluding bases); {result}"
  ],
  "pending": [
    "最终答案尚未完成。",
    "Final answer pending."
  ],
  "result": [
    "最终返回值：{v}。",
    "Final return value: {v}."
  ],
  "candidates": [
    "本次完成状态的全部有限候选",
    "All finite candidates for the current completed state"
  ],
  "noCandidates": [
    "此帧不是切口比较；请查看上方的操作说明。",
    "This frame is not a cut comparison; see the operation above."
  ],
  "cut": [
    "原始切口 m",
    "Original cut m"
  ],
  "left": [
    "左侧最低费用",
    "Left minimum"
  ],
  "right": [
    "右侧最低费用",
    "Right minimum"
  ],
  "total": [
    "候选总费用",
    "Candidate cost"
  ],
  "mark": [
    "比较结果",
    "Comparison"
  ],
  "best": [
    "✓ 最低（可并列）",
    "✓ Minimum (ties allowed)"
  ],
  "other": [
    "较高",
    "Higher"
  ],
  "ledger": [
    "已完成状态（i,j 是原始闭区间，p 是剩余堆数）",
    "Completed states (i,j are original inclusive bounds; p is remaining piles)"
  ],
  "stateCol": [
    "状态 (i,j,p)",
    "State (i,j,p)"
  ],
  "valueCol": [
    "最低费用",
    "Minimum cost"
  ],
  "statusCol": [
    "状态标记",
    "Status"
  ],
  "complete": [
    "已完成",
    "Complete"
  ],
  "current": [
    "★ 刚完成",
    "★ Just completed"
  ],
  "p4": [
    "这一步要回答：[2,1,4,3,2]、k=3 的最低总费用是多少？每次堆数减少 k−1=2，所以需要 5→3→1。选一个答案，再揭晓第一笔与最后一笔费用。此输入与上方实验独立。",
    "What is the minimum total cost for [2,1,4,3,2], k=3? Each move reduces the pile count by k−1=2, so the path is 5→3→1. Choose a total, then reveal the first and final payments. This input is independent of the experiment above."
  ],
  "choose": [
    "预测最低总费用",
    "Predict the minimum total cost"
  ],
  "opt0": [
    "12",
    "12"
  ],
  "opt1": [
    "19",
    "19"
  ],
  "opt2": [
    "−1",
    "−1"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "wrong0": [
    "少算了第一笔合并费用。",
    "That omits the first merge payment."
  ],
  "wrong2": [
    "相邻是针对当前堆；第一步后还会有三堆。",
    "Adjacency refers to current piles; three piles remain after the first merge."
  ],
  "answer": [
    "第一步三种相邻组的费用分别为 7、8、9；最低 7。选 [2,1,4] 后得到 [7,3,2]，最后付 12，总计 19。堆数条件 (5−1) % (3−1)=0 成立；第一步留下三堆，而不是两堆。",
    "The three possible first blocks cost 7, 8, and 9; the minimum is 7. Merging [2,1,4] leaves [7,3,2]; the final merge costs 12, totaling 19. The count condition (5−1) % (3−1)=0 holds. The first move leaves three piles, not two."
  ],
  "p5": [
    "这一步要回答：公式如何落到官方 Python 接口？dp[i][j][p] 就是原始区间 i..j 留 p 堆的最低费用。length 按原始区间长度递增；m 遍历切口；inf 使不可能的子问题不能成为有限最优解。对照实验 D(0,2,2) 的切口 m=1：dp[0][1][1]+dp[2][2][1]=5+0，然后在 p=1 的分支加 9。",
    "How does the recurrence become the official Python interface? dp[i][j][p] is the minimum cost to leave p piles from original interval i..j. length increases by interval size; m scans cuts. inf prevents impossible subproblems from winning a finite minimum. Match the experiment’s cut m=1 for D(0,2,2): dp[0][1][1]+dp[2][2][1]=5+0, then add 9 in the p=1 branch."
  ],
  "prefix": [
    "prefix[t] 是前 t 个原始堆的总石头数，prefix[0]=0。因此闭区间 i..j 的总和是 prefix[j+1]−prefix[i]，O(1) 得到；例如 [3,2,4] 的 prefix=[0,3,5,9]。这避免每个最后合并都重新遍历区间。",
    "prefix[t] is the total stones in the first t original piles, with prefix[0]=0. Thus inclusive interval i..j sums to prefix[j+1]−prefix[i] in O(1). For [3,2,4], prefix=[0,3,5,9]. This avoids rescanning an interval for each final merge."
  ],
  "costs": [
    "n 是初始堆数。至多 O(n²k) 个状态，每个枚举 O(n) 个切口：O(n³k) 时间；三维表占 O(n²k) 额外空间，前缀和 O(n)。这里选择显式堆数，未使用更紧凑的二维优化。代码不修改 stones；浏览器的历史快照不计入这些提交成本。",
    "Let n be the original pile count. At most O(n²k) states each scan O(n) cuts: O(n³k) time. The three-dimensional table uses O(n²k) auxiliary space and prefix sums use O(n). This solution keeps pile counts explicit instead of using a more compact two-dimensional optimization. It leaves stones unchanged; browser history snapshots are outside these submission costs."
  ],
  "boundaries": [
    "边界：n=1 已经完成，费用 0，即使 k>n；n>1 且 k>n 时无法操作，堆数检查返回 −1。全局能完成时，D(0,n−1,1) 一定有限。正数堆、n≤30、2≤k≤30 是官方范围；不支持空输入。",
    "Boundaries: n=1 already needs cost 0, even when k>n. For n>1 and k>n no move is possible; the count guard returns −1. When the global count is feasible, D(0,n−1,1) is finite. Positive piles, n≤30, and 2≤k≤30 are the official domain; empty input is outside it."
  ],
  "source": [
    "查看完整 Python 提交代码",
    "Read the complete Python submission"
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
  "manual": [
    "自动复制不可用。完整代码已选中，请按系统复制快捷键。",
    "Automatic copy is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 代码",
    "Manually copy the complete Python source"
  ],
  "related": [
    "继续探索",
    "Explore further"
  ],
  "link1": [
    "回看：堆数与切口",
    "Revisit pile counts and cuts"
  ],
  "link2": [
    "戳气球：最后一步与区间",
    "Burst Balloons: last operations and intervals"
  ],
  "link3": [
    "移除盒子：为什么要多记一个状态",
    "Remove Boxes: why an extra state matters"
  ]
};
