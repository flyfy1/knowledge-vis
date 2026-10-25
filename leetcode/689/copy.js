window.LESSON_COPY = {
  "docTitle": [
    "#689 · 三个无重叠子数组的最大和",
    "#689 · Maximum Sum of 3 Non-Overlapping Subarrays"
  ],
  "title": [
    "#689 · 三个无重叠子数组的最大和",
    "#689 · Maximum Sum of 3 Non-Overlapping Subarrays"
  ],
  "back": [
    "← LeetCode 知识集",
    "← LeetCode collection"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "intro": [
    "把三个窗口的选择拆成：固定中间一个，再各选左右最好的一个。",
    "Turn three choices into one scan: fix the middle window, then choose the best window on each side."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "1 · 手算三个窗口",
    "1 · Three windows by hand"
  ],
  "s0t": [
    "手算三个窗口",
    "Three windows by hand"
  ],
  "nav1": [
    "2 · 固定中间",
    "2 · Fix the middle"
  ],
  "s1t": [
    "固定中间",
    "Fix the middle"
  ],
  "nav2": [
    "3 · 复用左右最优",
    "3 · Reuse side maxima"
  ],
  "s2t": [
    "复用左右最优",
    "Reuse side maxima"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "s3t": [
    "先预测",
    "Predict first"
  ],
  "nav4": [
    "5 · 对应 Python",
    "5 · Map to Python"
  ],
  "s4t": [
    "对应 Python",
    "Map to Python"
  ],
  "s0e": [
    "这一步要回答：从 [2,1,4,1,3] 选三个数，怎样总和最大？子数组是一段连续位置；每段长度 k=1，所以每个窗口只有一个数。返回三个窗口的起点，不是它们的数值。位置从 0 开始，不重叠表示不能共用元素。",
    "Which three values in [2,1,4,1,3] give the largest total? A subarray is a consecutive range. Each window has length k=1 here, so it contains one value. Return the three starting positions, rather than the values. Positions start at 0; non-overlapping windows share no element."
  ],
  "contract": [
    "一般输入：n 是数组长度，n≤20000；1≤nums[i]<65536；1≤k≤⌊n/3⌋，所以有效输入至少有三个元素。必须恰选三段，每段长 k。若总和相同，返回字典序最小的起点三元组：从左到右比较第一个不同的起点，较小者胜。",
    "In general, n is the array length, n≤20000; 1≤nums[i]<65536; 1≤k≤⌊n/3⌋, so valid inputs have at least three elements. Choose exactly three length-k windows. On equal totals, return the lexicographically smallest start triple: compare from left to right, and prefer the smaller first differing start."
  ],
  "handTask": [
    "先心算三个起点及总和，再揭晓。这里每个方块依次显示：起点、窗口内容、窗口和。",
    "Calculate three starts and their total before revealing. Each card shows its start, contents and window sum, in that order."
  ],
  "handShow": [
    "揭晓手算",
    "Reveal hand calculation"
  ],
  "handHide": [
    "隐藏手算",
    "Hide hand calculation"
  ],
  "handHidden": [
    "答案未揭晓。先选三个不同位置。",
    "Answer hidden. Choose three distinct positions first."
  ],
  "handAnswer": [
    "起点 [0,2,4]：2+4+3=9。其余数都不大于这三个数，所以无法得到更大的总和。",
    "Starts [0,2,4]: 2+4+3=9. Every remaining value is no larger than these chosen values, so no triple has a greater total."
  ],
  "s1e": [
    "这一步要回答：k 大于 1 时，怎样保证三段合法？令 W[i] 是从位置 i 开始的 k 个数之和。若中间窗口从 j 开始，左窗口起点 a 必须满足 a+k≤j，右窗口起点 c 必须满足 c≥j+k。固定 j 后，左、右可选范围互不影响。",
    "How do we keep all three windows legal when k exceeds 1? Let W[i] be the sum of the k values starting at position i. For a middle window starting at j, the left start a must satisfy a+k≤j; the right start c must satisfy c≥j+k. Once j is fixed, the left and right choices no longer constrain each other."
  ],
  "handTable": [
    "沿用 [2,1,4,1,3]，k=1：j=1 时选 [0,1,2]，和 2+1+4=7；j=2 时选 [0,2,4]，和 2+4+3=9；j=3 时选 [2,3,4]，和 4+1+3=8。最后一组不是最佳组。",
    "Keep [2,1,4,1,3], k=1: at j=1 choose [0,1,2], totaling 2+1+4=7; at j=2 choose [0,2,4], totaling 2+4+3=9; at j=3 choose [2,3,4], totaling 4+1+3=8. The last tested triple is not the best one."
  ],
  "proof": [
    "为什么能只保留左右各自的最大和？任意合法三元组都有一个中间起点 j，它的左、右和分别不超过对应范围的最大和。选择这两个最大值能达到该上界，而且仍不重叠。遍历所有合法 j 就覆盖了所有可能的最优解。每侧同和时选最早起点，再对同和候选比较完整三元组，便满足字典序规则。",
    "Why keep only the maximum on each side? Every legal triple has a middle start j. Its side sums are bounded by the respective maxima over those legal ranges. Choosing both maxima attains that bound and remains non-overlapping. Testing every legal j therefore covers a global optimum. Choose the earliest start for tied side maxima, then compare complete tied triples to satisfy the lexicographic rule."
  ],
  "wrong": [
    "诱人的错误：先选单个和最大的窗口。对 [1,2,1,2,6,7,5,1]，k=2，窗口和为 [3,3,3,8,13,12,6]。先选起点 4、和 13 的窗口，最多得到和 22，按同和规则选 [0,4,6]；但 [0,3,5] 的和是 3+8+12=23。单窗最优不能保证三窗最优。",
    "A tempting mistake is to choose the largest individual window first. For [1,2,1,2,6,7,5,1], k=2, the window sums are [3,3,3,8,13,12,6]. Choosing start 4 with sum 13 first gives at best [0,4,6], totaling 22. Yet [0,3,5] totals 3+8+12=23. One best window need not belong to the best triple."
  ],
  "baseline": [
    "正确基线：枚举 a、b、c，要求 a+k≤b 且 b+k≤c。预先计算窗口和后，逐组相加并比较完整三元组，时间 O(n³)，空间 O(n)。n=20000 时，即使 k=1，候选数量也约为 1.33 万亿。固定中间仍逐次搜索两侧需要 O(n²)；下一步把重复搜索变成两次扫描。",
    "A correct baseline enumerates a,b,c with a+k≤b and b+k≤c. Precompute window sums, then compare totals and complete tied triples: O(n³) time and O(n) space. At n=20000 and k=1, there are about 1.33 trillion triples. Fixing the middle but searching both sides afresh still costs O(n²). Next, replace those repeated searches with two scans."
  ],
  "baselineCode": [
    "展开简单基线 Python",
    "Open the simple Python baseline"
  ],
  "s2e": [
    "这一步要回答：怎样不反复扫描同一侧？W[i] 是起点 i 的 k 个数之和，m=n−k+1 是窗口数。相邻窗口只移一格：减去离开的 nums[i−1]，加上进入的 nums[i+k−1]。例如官方例子 W[2]=3，W[3]=3−nums[2]+nums[4]=3−1+6=8。下图一开始已算好全部 W，后续演示左右摘要。",
    "How can we avoid scanning the same side repeatedly? W[i] sums the k values starting at i; m=n−k+1 is the window count. Sliding one position removes nums[i−1] and adds nums[i+k−1]. In the official example, W[2]=3 and W[3]=3−nums[2]+nums[4]=3−1+6=8. All W values are already computed in the initial view; the trace then builds the side summaries."
  ],
  "invariant": [
    "从手算可见，我们只需要每侧最好的起点。定义 L[i] 为 0…i 中和最大且最早的起点：从左向右，旧摘要已覆盖 0…i−1，只需与 i 比较；同和时保留旧起点，所以用 >。定义 R[i] 为 i…m−1 中和最大且最早的起点：从右向左，同和时新起点 i 更早，所以用 ≥。这就是不变量：每填一格，已填格都准确代表各自范围内最早的最大窗口。",
    "The hand calculation only needs the best start on each side. Define L[i] as the earliest maximum-sum start in 0…i. Scanning left to right, the old summary already covers 0…i−1; compare only i with it. Keep the old, earlier start on ties, using >. Define R[i] as the earliest maximum-sum start in i…m−1. Scanning right to left, the new i is earlier on ties, so use ≥. The invariant is the fact preserved after every assignment: each filled entry names the earliest maximum over its stated range."
  ],
  "formula": [
    "j = k … m−k−1;  candidate = [L[j−k], j, R[j+k]];  total = W[L[j−k]] + W[j] + W[R[j+k]]",
    "j = k … m−k−1;  candidate = [L[j−k], j, R[j+k]];  total = W[L[j−k]] + W[j] + W[R[j+k]]"
  ],
  "traceTask": [
    "先推进 L，再推进 R，最后测试各中间起点。观察同和时 > 与 ≥ 的不同结果；切换到“全同和”更明显。每次只完成一次赋值或一次候选比较；后退恢复整个状态。表内 L/R 是起点，不是窗口和；“待算”不是 0。",
    "Build L, then R, then test middle starts. Watch how > and ≥ handle equal sums; the all-ties preset makes this clear. Each action completes one assignment or candidate comparison; Back restores the entire state. Table entries L/R are starting positions, not sums; “pending” does not mean 0."
  ],
  "presetLabel": [
    "场景（更换会重启本轨迹，不影响独立练习）",
    "Scenario (changing restarts this trace; the exercise is independent)"
  ],
  "preset0": [
    "手算小例 · k=1",
    "Tiny hand case · k=1"
  ],
  "preset1": [
    "官方例 1 · 贪心失误",
    "Official example 1 · greedy fails"
  ],
  "preset2": [
    "官方例 2 · 全同和",
    "Official example 2 · all ties"
  ],
  "preset3": [
    "最小长度 · 三个相同数",
    "Minimum length · three equal values"
  ],
  "preset4": [
    "n=3k · 唯一起点组合",
    "n=3k · only one legal triple"
  ],
  "sim": [
    "教学轨迹是 JavaScript 模拟，不是 Python 提交代码的执行。所有教学帧完整保留；没有省略扫描。",
    "This teaching trace is a JavaScript simulation, not execution of the Python submission. All teaching frames are retained; no scan steps are omitted."
  ],
  "prev": [
    "后退一次操作",
    "Back one operation"
  ],
  "next": [
    "完成下一次操作",
    "Complete next operation"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "end": [
    "完成全部操作",
    "Complete all operations"
  ],
  "windowsTitle": [
    "窗口卡片：起点 → 内容 → 和",
    "Window cards: start → contents → sum"
  ],
  "window": [
    "起点 {i}",
    "Start {i}"
  ],
  "sum": [
    "窗口和 {v}",
    "Window sum {v}"
  ],
  "activeMark": [
    "正在比较",
    "Being compared"
  ],
  "chosenMark": [
    "本次候选",
    "Current candidate"
  ],
  "tableTitle": [
    "摘要累计表（左右滚动可读全表）",
    "Accumulated summaries (scroll horizontally for the full table)"
  ],
  "thI": [
    "起点 i",
    "Start i"
  ],
  "thW": [
    "W[i]：窗口和",
    "W[i]: window sum"
  ],
  "thL": [
    "L[i]：0…i 最优起点",
    "L[i]: best start in 0…i"
  ],
  "thR": [
    "R[i]：i…m−1 最优起点",
    "R[i]: best start in i…m−1"
  ],
  "pending": [
    "待算",
    "pending"
  ],
  "init": [
    "W 已计算；L、R 尚未填入。",
    "W is computed; L and R are not filled yet."
  ],
  "seed": [
    "完成 {side}[{i}]：边界只有一个候选，直接记录起点 {i}。",
    "Completed {side}[{i}]: the boundary has one candidate; record start {i}."
  ],
  "left": [
    "完成 L[{i}]：比较新窗口 W[{i}]={v} 与旧最佳 W[{old}]={ov}。条件 {v}>{ov} 为{truth}，故记录起点 {pick}。",
    "Completed L[{i}]: compare new W[{i}]={v} with old best W[{old}]={ov}. The condition {v}>{ov} is {truth}, so record start {pick}."
  ],
  "right": [
    "完成 R[{i}]：比较新窗口 W[{i}]={v} 与旧最佳 W[{old}]={ov}。条件 {v}≥{ov} 为{truth}，故记录起点 {pick}。",
    "Completed R[{i}]: compare new W[{i}]={v} with old best W[{old}]={ov}. The condition {v}≥{ov} is {truth}, so record start {pick}."
  ],
  "true": [
    "真",
    "true"
  ],
  "false": [
    "假",
    "false"
  ],
  "middle": [
    "已测试中间起点 j={j}：左起点≤{l}，右起点≥{r}；候选 {candidate}，和 {terms}={total}。",
    "Tested middle start j={j}: left starts≤{l}, right starts≥{r}; candidate {candidate}, sum {terms}={total}."
  ],
  "progress": [
    "已完成操作 {at}/{last}。{action}",
    "Operations completed {at}/{last}. {action}"
  ],
  "best": [
    "目前最佳起点 {best}，总和 {sum}；尚未测试所有中间起点。",
    "Best starts so far {best}, total {sum}; some middle starts remain untested."
  ],
  "final": [
    "最终起点 {best}，总和 {sum}。所有合法中间起点均已测试。",
    "Final starts {best}, total {sum}. Every legal middle start has been tested."
  ],
  "noBest": [
    "尚未测试三窗口候选。",
    "No three-window candidate tested yet."
  ],
  "ledgerTitle": [
    "已测试候选的记录",
    "Ledger of tested candidates"
  ],
  "empty": [
    "尚无候选记录。",
    "No candidates recorded yet."
  ],
  "ledgerRow": [
    "j={j}：{candidate} → {terms}={total}；{decision}。此后最佳 {best}，和 {bestSum}。",
    "j={j}: {candidate} → {terms}={total}; {decision}. Best afterward {best}, total {bestSum}."
  ],
  "update": [
    "更新最佳",
    "update best"
  ],
  "keep": [
    "保留最佳",
    "keep best"
  ],
  "s3e": [
    "这一步要回答：同和时从右侧选哪个？新输入 nums=[2,1,3,1,2,2,1,3]，k=2。W=[3,4,4,3,4,3,4]。固定中间起点 j=2，只问这个中间窗口的最佳三元组，不问全局最优。左起点必须≤0；右起点必须≥4。R[4] 表示 4…6 中和最大且最早的起点。",
    "Which right window wins on a tie? Use fresh nums=[2,1,3,1,2,2,1,3], k=2, so W=[3,4,4,3,4,3,4]. Fix the middle start j=2. The question asks for the best triple with this middle window, not the global optimum. Left starts must be≤0; right starts must be≥4. R[4] means the earliest maximum-sum start in 4…6."
  ],
  "predictionLegend": [
    "先选固定 j=2 时的最佳起点，再揭晓",
    "Choose the best starts for fixed j=2 before revealing"
  ],
  "reveal": [
    "核对并揭晓原因",
    "Check and reveal why"
  ],
  "await": [
    "答案尚未揭晓。更改选择会清除反馈。",
    "Answer hidden. Changing your choice clears feedback."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还不对。",
    "Not quite."
  ],
  "answer": [
    "答案 [0,2,4]，和 3+4+4=11。右扫描先遇到起点 6（和 4），经过 5（和 3），再到 4（和 4）；≥ 会让更早的 4 替换 6。[0,2,6] 和相同但字典序较大。[1,2,4] 的前两段重叠：起点 1 的窗口覆盖位置 1、2，中间窗口覆盖 2、3。",
    "The answer is [0,2,4], totaling 3+4+4=11. The right scan sees start 6 (sum 4), then 5 (sum 3), then 4 (sum 4); ≥ replaces 6 with the earlier 4. [0,2,6] ties in sum but is lexicographically larger. [1,2,4] overlaps: the first window covers positions 1,2 and the middle covers 2,3."
  ],
  "s4e": [
    "这一步要回答：怎样把摘要规则写成可提交的 Python？w 是窗口和；left[i]（图中 L[i]）是前缀 0…i 的最早最大起点，right[i]（图中 R[i]）是后缀 i…m−1 的最早最大起点。Python 接口返回起点列表，不修改 nums。",
    "How do the summary rules become submittable Python? w stores window sums. left[i] (L[i] in the diagram) names the earliest maximum start in prefix 0…i; right[i] (R[i]) does the same for suffix i…m−1. The Python interface returns a list of starts and preserves nums."
  ],
  "map1": [
    "w.append：前一个窗口和减去离开的值、加上进入的值，一次移动只需常数次加减。",
    "w.append: subtract the outgoing value from the previous window sum and add the incoming value; each slide uses constant work."
  ],
  "map2": [
    "left 的 > 保留较早的旧起点；right 的 >= 允许更早的新起点替换同和旧起点。",
    "left uses > to keep the earlier old start; right uses >= to replace a tied old start with the earlier new start."
  ],
  "map3": [
    "range(k,m-k) 枚举所有合法中间起点；candidate 对应图中三元组；total 比较总和，同和时 candidate < answer 比较完整起点列表。",
    "range(k,m-k) visits every legal middle start; candidate is the diagram triple. Compare total first; candidate < answer compares complete start lists on ties."
  ],
  "cost": [
    "代价：n 是元素数，m=n−k+1。初始求和和切片 O(k)，其余窗口、左右扫描和中间扫描都 O(n)，每个候选只加三个数。因此总时间 O(n)，辅助空间 O(n)，返回值仅 3 个起点。教学版保存所有快照与记录，空间可达 O(n²)，只运行小预设；这不属于提交算法的空间。",
    "Cost: n is the element count and m=n−k+1. The initial slice and sum cost O(k); remaining windows, both side scans and the middle scan each cost O(n). Each candidate adds only three values. Total time is O(n), auxiliary space O(n), and the return value has three starts. The tutorial stores all snapshots and ledger entries, using up to O(n²) space on tiny presets; that is separate from submission space."
  ],
  "boundaries": [
    "边界：n=3k 时只能返回 [0,k,2k]；k=1 仍恰好选三个位置；全同和时应返回 [0,k,2k]。相邻窗口允许首尾接触而不能共用元素。有效输入总有答案，故没有“无解”返回值；空数组和 k=0 不在官方契约内。最大可能三窗总和≤20000×65535=1310700000，Python 整数可安全表示。",
    "Boundaries: at n=3k the only legal triple is [0,k,2k]. At k=1 still choose exactly three positions. All tied window sums must yield [0,k,2k]. Adjacent windows may touch at their boundaries but share no element. Valid inputs always have an answer, so no failure return is needed; empty arrays and k=0 are outside the contract. Any three-window total is≤20000×65535=1310700000, safely represented by Python integers."
  ],
  "copy": [
    "复制 Python 源码",
    "Copy Python source"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "展开完整 Python 提交源码",
    "Open complete Python submission source"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "剪贴板不可用。完整源码已选中，请使用系统复制快捷键。",
    "Clipboard unavailable. The full source is selected; use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整源码",
    "Copy the full source manually"
  ],
  "related1": [
    "关联：#239 的滑动窗口状态 →",
    "Related: #239 sliding-window state →"
  ],
  "related2": [
    "关联：#123 的顺序分段最优 →",
    "Related: #123 optimal ordered segments →"
  ],
  "foot": [
    "作者自查候选；独立评审待进行。数值测试不代表 LeetCode 已接受，也不代表真实学习者已掌握。",
    "Author self-checked candidate; independent review pending. Numerical tests do not establish LeetCode acceptance or observed learner understanding."
  ]
};
