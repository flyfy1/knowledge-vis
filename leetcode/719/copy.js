window.LESSON_COPY = {
  "docTitle": [
    "#719 · 找出第 K 小的数对距离",
    "#719 · Find K-th Smallest Pair Distance"
  ],
  "back": [
    "← LeetCode 知识集",
    "← LeetCode collection"
  ],
  "title": [
    "#719 · 找出第 K 小的数对距离",
    "#719 · Find K-th Smallest Pair Distance"
  ],
  "tagline": [
    "三个位置，三个数对。先数清重复距离，再找第一个“足够大”的距离上限。",
    "Three positions, three pairs. Count repeated distances, then find the first distance limit that includes enough pairs."
  ],
  "hard": [
    "困难 · 算法",
    "Hard · Algorithms"
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
    "课程步骤",
    "Lesson steps"
  ],
  "s0": [
    "1 · 手算数对",
    "1 · Count pairs by hand"
  ],
  "s1": [
    "2 · 一个右端贡献多少？",
    "2 · Count by right endpoint"
  ],
  "s2": [
    "3 · 缩小答案范围",
    "3 · Narrow the answer range"
  ],
  "s3": [
    "4 · 先预测再揭晓",
    "4 · Predict before revealing"
  ],
  "s4": [
    "5 · 证明与 Python",
    "5 · Proof and Python"
  ],
  "intro": [
    "[1,3,1] 中，第 2 小的数对距离是什么？数对选两个不同位置 i<j；距离是 |nums[i]−nums[j]|，即两值之差的绝对值。k 从 1 开始计数，相同距离也占各自的名次。",
    "What is the second smallest pair distance in [1,3,1]? A pair uses two different positions i<j. Its distance is |nums[i]−nums[j]|, the absolute difference of their values. Rank k starts at 1; repeated distances each occupy a rank."
  ],
  "hand": [
    "原位置 (0,1)：|1−3|=2；(0,2)：|1−1|=0；(1,2)：|3−1|=2。排序后为 [0,2,2]，所以 k=2 的答案为 2，不是第 2 个不同距离。",
    "Original positions (0,1): |1−3|=2; (0,2): |1−1|=0; (1,2): |3−1|=2. Sorting gives [0,2,2], so rank k=2 is 2. We are ranking pairs, rather than distinct distance values."
  ],
  "contract": [
    "官方例子：[1,3,1], k=1 → 0；[1,1,1], k=2 → 0；[1,6,1], k=3 → 5。约束：2≤n≤10000，0≤nums[i]≤1000000，1≤k≤n(n−1)/2。不要求处理空数组或非法 k。",
    "Official examples: [1,3,1], k=1 → 0; [1,1,1], k=2 → 0; [1,6,1], k=3 → 5. Constraints: 2≤n≤10000, 0≤nums[i]≤1000000, 1≤k≤n(n−1)/2. Empty arrays and invalid k are outside the contract."
  ],
  "baselineTitle": [
    "可靠基线：列举全部距离",
    "A reliable baseline: enumerate every distance"
  ],
  "baseline": [
    "直接列举 i<j 的所有距离并排序，返回下标 k−1 的值。设 P=n(n−1)/2，这需要 O(P log P) 时间和 O(P) 空间。n=10000 时有 49,995,000 个距离；不保存它们也能知道一个上限够不够吗？",
    "Enumerate all distances with i<j, sort, and return index k−1. With P=n(n−1)/2 pairs, this costs O(P log P) time and O(P) space. At n=10000 there are 49,995,000 distances. Can we tell whether a limit includes enough pairs without storing them?"
  ],
  "wrong": [
    "只计算排序后的相邻差会怎样？[1,2,4] 的相邻差为 [1,2]，却遗漏 (1,4) 的距离 3。k=3 时答案正是 3。排序有用，但必须计入所有数对。",
    "Why not use only adjacent gaps after sorting? For [1,2,4], adjacent gaps [1,2] omit the distance 3 from (1,4). That missing distance is exactly the answer for k=3. Sorting helps, but every pair still matters."
  ],
  "countIntro": [
    "固定 [1,1,3,6]，有多少个数对的距离 ≤d？d 是试验的距离上限，C(d) 是满足条件的数对总数。先用 d=2。排序后的数组记为 a；l、r 是从 0 开始的排序后位置，不是原位置编号。 排序只重排位置，不改变数对距离及其重复次数；排序后左值≤右值，距离就是 a[r]−a[l]。",
    "For the fixed array [1,1,3,6], how many pairs have distance ≤d? The threshold d is a tested distance limit; C(d) counts all qualifying pairs. Start with d=2. Write the sorted array as a; l and r are zero-based positions in that sorted copy, rather than original position IDs. Sorting only permutes positions: it preserves the multiset of pair distances, including repetitions. Since the left value is at most the right value, distance becomes a[r]−a[l]."
  ],
  "countDerive": [
    "逐个固定右端 r。r=0 没有更早位置，贡献 0；r=1 的值为 1，前面的 1 距离为 0，贡献 1；r=2 的值为 3，前面两个 1 的距离都为 2，贡献 2；r=3 的值为 6，前面的距离为 5、5、3，都大于 2，贡献 0。因此 C(2)=0+1+2+0=3。",
    "Fix the right endpoint r in turn. At r=0 there is no earlier position: add 0. At r=1, the earlier 1 has distance 0: add 1. At r=2, both earlier 1s have distance 2 from 3: add 2. At r=3, earlier distances from 6 are 5,5,3, all above 2: add 0. Thus C(2)=0+1+2+0=3."
  ],
  "window": [
    "为何能一次加 r−l？在有序数组中，从左边跳过距离太大的位置，停在第一个距离 ≤d 的 l。后面的 l…r−1 值更接近 a[r]，全都合格；l 之前全不合格。r 增大时，曾经太远的左端只会更远，因此 l 不用后退。这就是每次完成右端扫描后保持的事实（不变量）。每个数对有唯一右端，因此不重不漏。 若没有更早的有效位置，就令 l=r，贡献为 0；不会把自己与自己配对。",
    "Why add r−l at once? In sorted order, skip left positions whose distance is too large, stopping at the first valid l. Every position l…r−1 is closer to a[r] and qualifies; every earlier position fails. As r advances, a previously distant left value only gets farther away, so l never needs to retreat. This is the invariant: the fact preserved after each completed right endpoint. Every pair has one right endpoint, so nothing is missed or counted twice. If no earlier position qualifies, l=r and the contribution is 0; a position is never paired with itself."
  ],
  "countTask": [
    "操作：保持数组不变，先把“已完成的右端数量”调到 3，再把 d 从 2 改到 1。观察贡献表和带 ✓ 的数对如何改变；然后回到 d=2 并完成 4 个右端。图中方框是排序后位置和值；✓ 表示已扫描且距离合格，· 表示未计入。此实验与后面的搜索独立。",
    "Try this: keep the array fixed, set completed right endpoints to 3, then change d from 2 to 1. Watch the contribution ledger and pairs marked ✓ change. Restore d=2 and complete all 4 endpoints. Boxes show sorted positions and values; ✓ marks scanned qualifying pairs, and · marks pairs not counted. This experiment is independent of the search below."
  ],
  "threshold": [
    "距离上限 d（0…5）",
    "Distance limit d (0…5)"
  ],
  "scanned": [
    "已完成的右端数量（0…4）",
    "Completed right endpoints (0…4)"
  ],
  "arrayCaption": [
    "排序后位置 : 值",
    "Sorted position : value"
  ],
  "pairCaption": [
    "所有六个数对（按排序后位置标记）",
    "All six pairs (sorted position IDs)"
  ],
  "ledgerCaption": [
    "每个已完成右端的贡献",
    "Contribution of each completed right endpoint"
  ],
  "rHead": [
    "右端 r",
    "Right r"
  ],
  "lHead": [
    "最早有效 l",
    "First valid l"
  ],
  "addHead": [
    "本次增加 r−l",
    "Add r−l"
  ],
  "sumHead": [
    "累计数对",
    "Cumulative pairs"
  ],
  "countRead": [
    "d={d}；已完成 {s}/4 个右端，累计 {count} 个数对。{tail}",
    "d={d}; completed {s}/4 right endpoints, counting {count} pairs. {tail}"
  ],
  "fullCount": [
    "这就是完整 C(d)。",
    "This is the complete C(d)."
  ],
  "partialCount": [
    "尚不是完整 C(d)。",
    "This is not yet the complete C(d)."
  ],
  "noneRows": [
    "尚未扫描右端。",
    "No right endpoints scanned yet."
  ],
  "searchIntro": [
    "怎样用数对计数排除答案？C(d) 统计距离 ≤d 的所有数对。对 [1,3,1]、k=2，C(0)=1 不足 2，所以答案大于 0；C(1)=1 仍不足；C(2)=3 已足够，所以答案为 2。要求 C(d)=k 会失败：这里计数从 1 跳到 3，根本没有等于 2 的情况。",
    "How can pair counts eliminate possible answers? C(d) counts all pairs with distance ≤d. For [1,3,1], k=2, C(0)=1 is too few, so the answer exceeds 0. C(1)=1 is still too few; C(2)=3 is enough, so the answer is 2. Requiring C(d)=k fails: the count jumps from 1 to 3 and never equals 2."
  ],
  "monotone": [
    "增加 d 不会让任何已合格数对失效，所以 C(d) 只会不变或增加。答案是第一个使 C(d)≥k 的整数 d。令 lo、hi 是包含答案的闭区间端点，mid=⌊(lo+hi)/2⌋（向下取整）。若 C(mid)<k，mid 及更小值都不足，令 lo=mid+1；否则 mid 仍可能是答案，令 hi=mid。",
    "Increasing d never removes a qualifying pair, so C(d) cannot decrease. The answer is the first integer d with C(d)≥k. Let lo and hi be inclusive bounds containing the answer, and mid=⌊(lo+hi)/2⌋, rounded down. If C(mid)<k, mid and every smaller value are insufficient: set lo=mid+1. Otherwise mid may still be the answer: set hi=mid."
  ],
  "invariant": [
    "不变量（每轮都保留的事实）：C(lo−1)<k≤C(hi)。lo 左侧全不足，hi 足够。a 表示排序后的输入。初始 lo=0、hi=max(a)−min(a)，并约定 C(−1)=0；最大距离包含所有数对。以 [1,3,1]、k=2 开始，[0,2] 测 mid=1，C(1)=1，因此更新为 [2,2]。",
    "Invariant, the fact preserved by each round: C(lo−1)<k≤C(hi). Everything left of lo is insufficient, while hi is sufficient. Here a is the sorted input. Initially lo=0 and hi=max(a)−min(a), with C(−1)=0; the maximum distance includes every pair. For [1,3,1], k=2, testing mid=1 in [0,2] gives C(1)=1, leaving [2,2]."
  ],
  "simulation": [
    "这是 JavaScript 教学模拟，不是在浏览器执行 Python 提交。每帧完成一次完整计数与区间更新；初始帧未计数。不省略搜索轮次。最后测试的 mid 与更新后的区间分别标明。",
    "This is a JavaScript teaching simulation, not execution of the Python submission in the browser. Each frame completes one full count and interval update; the initial frame has no count. No search rounds are omitted. The last tested mid and updated interval are labeled separately."
  ],
  "searchTask": [
    "选定预设后，点击“完成一轮计数”，比较旧区间、计数与新区间。回退会恢复完整状态；历史表保留已完成的轮次。切换预设会重启本搜索，不影响上面的实验或预测题。",
    "Choose a preset and complete one count round. Compare the old interval, count, and new interval. Back restores the full state; the ledger retains completed rounds. Changing a preset restarts this search without changing the earlier experiment or prediction."
  ],
  "preset": [
    "搜索预设（切换会重启）",
    "Search preset (changing restarts)"
  ],
  "p0": [
    "[1,3,1] · k=2",
    "[1,3,1] · k=2"
  ],
  "p1": [
    "[1,3,1] · k=1",
    "[1,3,1] · k=1"
  ],
  "p2": [
    "[1,1,1] · k=2",
    "[1,1,1] · k=2"
  ],
  "p3": [
    "[1,6,1] · k=3",
    "[1,6,1] · k=3"
  ],
  "p4": [
    "[0,1000000] · k=1",
    "[0,1000000] · k=1"
  ],
  "p5": [
    "[1,2,4] · k=3",
    "[1,2,4] · k=3"
  ],
  "p6": [
    "[1,1,3,6] · k=6",
    "[1,1,3,6] · k=6"
  ],
  "prev": [
    "回退一轮",
    "Back one round"
  ],
  "next": [
    "完成一轮计数",
    "Complete one count round"
  ],
  "reset": [
    "重置本搜索",
    "Reset this search"
  ],
  "end": [
    "跳到收敛",
    "Jump to convergence"
  ],
  "position": [
    "已完成的搜索轮次",
    "Completed search rounds"
  ],
  "interval": [
    "当前区间（初始或更新后）",
    "Current interval (initial or updated)"
  ],
  "tested": [
    "最后测试 mid → C(mid)",
    "Last tested mid → C(mid)"
  ],
  "noTest": [
    "尚未测试",
    "Not tested yet"
  ],
  "history": [
    "完整搜索历史（可横向滚动）",
    "Complete search history (scroll horizontally)"
  ],
  "round": [
    "轮次",
    "Round"
  ],
  "before": [
    "旧 [lo,hi]",
    "Old [lo,hi]"
  ],
  "after": [
    "新 [lo,hi]",
    "New [lo,hi]"
  ],
  "reason": [
    "保留理由",
    "Reason"
  ],
  "enough": [
    "足够；保留 mid",
    "Enough; retain mid"
  ],
  "few": [
    "不足；排除 mid",
    "Too few; exclude mid"
  ],
  "empty": [
    "尚未完成任何轮次。",
    "No rounds completed yet."
  ],
  "progress": [
    "数组 [{a}]，k={k}；已完成 {i}/{total} 轮。",
    "Array [{a}], k={k}; completed {i}/{total} rounds."
  ],
  "initial": [
    "初始区间；尚未计算中点计数。",
    "Initial bounds; no midpoint count yet."
  ],
  "decision": [
    "在旧区间 [{before}] 测 d={mid}，C(d)={count}；{reason}，得到 [{lo},{hi}]。",
    "Tested d={mid} in old bounds [{before}]: C(d)={count}; {reason}, leaving [{lo},{hi}]."
  ],
  "terminal": [
    "已收敛：第 k 小距离 = {lo}。",
    "Converged: kth smallest distance = {lo}."
  ],
  "quiz": [
    "新输入 [0,2,2,7]，k=3。当前 lo=0、hi=7，测试 mid=3。C(d) 是距离 ≤d 的数对数量，不变量是 C(lo−1)<k≤C(hi)。这一轮应如何更新？先计算数对，再选择。",
    "Fresh input [0,2,2,7], k=3. Current bounds are lo=0, hi=7; test mid=3. C(d) counts pairs with distance ≤d, and the invariant is C(lo−1)<k≤C(hi). What update should this round make? Count the pairs before choosing."
  ],
  "option0": [
    "A · C(3)=3，令 hi=3",
    "A · C(3)=3; set hi=3"
  ],
  "option1": [
    "B · C(3)=3，直接返回 3",
    "B · C(3)=3; return 3 immediately"
  ],
  "option2": [
    "C · C(3)=2，令 lo=4",
    "C · C(3)=2; set lo=4"
  ],
  "reveal": [
    "检查这次更新",
    "Check this update"
  ],
  "correct": [
    "选择正确。",
    "Correct choice."
  ],
  "incorrect": [
    "再看不变量。",
    "Revisit the invariant."
  ],
  "answer": [
    "六个距离为 2、2、7、0、5、5，≤3 的有 3 个。因此 hi=3，保留可能的答案。相等也不能直接返回：C(2) 也是 3，而第 3 小距离实际为 2。选 B 过早停止；选 C 漏算了两个不同位置的 2 与 0 形成的两个数对之一。",
    "The six distances are 2,2,7,0,5,5; three are ≤3. Thus hi=3, retaining a possible answer. Even equality does not justify returning: C(2) is also 3, and the third smallest distance is actually 2. B stops too early; C misses one of the two pairs formed by 0 and the two separate positions holding 2."
  ],
  "proof": [
    "为何最后返回 lo？C(d) 是距离 ≤d 的数对数。排序扫描中，left 是当前 right 的第一个有效左端，所以 right−left 精确计数。lo 和 hi 是当前包含答案的距离边界。搜索保持 C(lo−1)<k≤C(hi)，即第一个足够的距离在 [lo,hi] 中。只要 lo<hi，就有 mid<hi，两种更新都会严格缩短区间；终止时 lo=hi，C(lo−1)<k≤C(lo)，恰好确定第 k 小距离。若这个值不是某个数对的距离，计数就不可能在此增加，与不等式矛盾。",
    "Why return lo? C(d) counts pairs with distance ≤d. In the sorted scan, left is the first valid left endpoint for the current right, so right−left counts exactly. lo and hi are current distance bounds containing the answer. Search preserves C(lo−1)<k≤C(hi), keeping the first sufficient distance in [lo,hi]. When lo<hi, mid<hi, so either update strictly shortens the interval. At termination lo=hi and C(lo−1)<k≤C(lo), identifying the kth smallest distance. If no pair had this distance, the count could not increase there, contradicting those inequalities."
  ],
  "mapping": [
    "代码对应：a=sorted(nums) 保留原输入。内层 while 跳过太远的左端；count += right-left 汇总各右端贡献。[1,1,3,6]、mid=2 时，right=2 加 2，right=3 把 left 从 0 推到 3 后加 0。if count>=k 保留 mid；否则 lo=mid+1 排除不足的中点。",
    "Code mapping: a=sorted(nums) preserves the original input. The inner while skips left endpoints that are too far away; count += right-left sums contributions. With [1,1,3,6], mid=2, right=2 adds 2; right=3 moves left from 0 to 3 and adds 0. The count>=k branch retains mid; otherwise lo=mid+1 excludes an insufficient midpoint."
  ],
  "cost": [
    "提交成本：令 W=max(nums)−min(nums)。排序 O(n log n)，每轮两个指针各只前进至多 n 次，故计数 O(n)，搜索 O(log(W+1)) 轮。总时间 O(n log n+n log(W+1))，Python 排序副本及排序工作空间 O(n)。即使值全相同也要排序。教学图的数对列表和历史快照是额外演示存储，不计入提交复杂度。",
    "Submission cost: let W=max(nums)−min(nums). Sorting costs O(n log n). Each pointer advances at most n times per round, so counting is O(n), for O(log(W+1)) search rounds. Total time is O(n log n+n log(W+1)); the sorted copy and Python sorting workspace use O(n) space. Sorting still occurs when all values are equal. The teaching pair list and snapshots are additional simulation storage, outside submission complexity."
  ],
  "bounds": [
    "边界：全相等时 W=0，直接返回 0；只有两个元素时返回它们的差。k=1 找最小距离；k=P 找最大距离；重复值自然产生 0 距离。最大 P=49,995,000，Python 整数可精确表示。不需修改原数组；官方没有额外异常返回约定。",
    "Boundaries: if all values are equal, W=0 and the loop returns 0 immediately. Two elements return their difference. k=1 selects the minimum distance; k=P selects the maximum. Duplicates naturally create zero distances. The largest P is 49,995,000, exact in Python integers. No input mutation is needed; the official contract specifies no extra exception return value."
  ],
  "verify": [
    "自查方法：独立列举所有数对距离作为小输入基线，对每个 k 比较实际 Python 结果；逐轮检查计数、不变量和区间缩短。计算测试与浏览器自查不代表独立教学评审或 LeetCode 提交通过。",
    "Checking method: independently enumerate every pair distance for small inputs and compare actual Python results for every k. Check counts, invariants, and shrinking bounds at each round. Computational tests and browser self-checks do not establish independent teaching review or LeetCode submission acceptance."
  ],
  "copy": [
    "复制 Python 提交",
    "Copy Python submission"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "查看完整 Python 提交",
    "View complete Python submission"
  ],
  "manualLabel": [
    "手动复制完整 Python 代码",
    "Manually copy the full Python source"
  ],
  "copied": [
    "已复制完整代码。",
    "Complete source copied."
  ],
  "fallback": [
    "剪贴板不可用；已选中完整代码，请手动复制。",
    "Clipboard unavailable; full source selected for manual copying."
  ],
  "related": [
    "继续探索",
    "Explore further"
  ],
  "rel0": [
    "#668 · 通过计数定位名次",
    "#668 · Locate a rank by counting"
  ],
  "rel1": [
    "#410 · 用可行性缩小答案范围",
    "#410 · Narrow answer bounds using feasibility"
  ],
  "foot": [
    "教学模拟与作者自查候选。独立评审待完成；不声称学习效果或官方提交通过。",
    "Teaching simulation and author-checked candidate. Independent review pending; no learner outcomes or official submission acceptance claimed."
  ]
};
