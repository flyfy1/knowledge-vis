window.LESSON_COPY = {
  "docTitle": [
    "#493 · 翻转对",
    "#493 · Reverse Pairs"
  ],
  "title": [
    "#493 · 翻转对",
    "#493 · Reverse Pairs"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "collection": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "hard": [
    "困难",
    "Hard"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "4、2、1 中，4 恰好是 2 的两倍，却只有 (4,1) 算一个翻转对。为什么等于不算？从三个比较走到一次批量计数。",
    "In 4, 2, 1, the 4 is exactly twice the 2, yet only (4,1) counts as a reverse pair. Why does equality fail? Go from three comparisons to counting a whole group at once."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 50000；−2³¹ ≤ nums[i] ≤ 2³¹−1。返回数量，不返回数对列表。",
    "Official bounds: 1 ≤ n ≤ 50000; −2³¹ ≤ nums[i] ≤ 2³¹−1. Return a count, not a list of pairs."
  ],
  "nav0": [
    "0 · 手算",
    "0 · Hand count"
  ],
  "nav1": [
    "1 · 前缀边界",
    "1 · Prefix boundary"
  ],
  "nav2": [
    "2 · 分治计数",
    "2 · Split and count"
  ],
  "nav3": [
    "3 · 先预测",
    "3 · Predict first"
  ],
  "nav4": [
    "4 · Python",
    "4 · Python"
  ],
  "s0t": [
    "三个比较，哪些计入？",
    "Which of three comparisons count?"
  ],
  "s0e": [
    "这一步要回答：nums=[4,2,1] 的翻转对是什么？下标是从 0 开始的位置；一个翻转对是原数组中 i<j 且 nums[i]>2×nums[j] 的两个位置。严格大于意味着等于不算；相同数值的不同位置仍是不同候选。",
    "What is a reverse pair in nums=[4,2,1]? An index is a position starting at 0. A reverse pair consists of original positions i<j with nums[i]>2×nums[j]. Strictly greater means equality fails. Different positions remain different candidates even when their values match."
  ],
  "s0task": [
    "每次检查下一对，先心算，再看比较和累计数量；后退撤销最后一行。",
    "Check one pair at a time: calculate first, then read the comparison and running count. Back removes the last row."
  ],
  "prev": [
    "← 撤回一步",
    "← Back one step"
  ],
  "baseNext": [
    "检查下一对 →",
    "Check next pair →"
  ],
  "next": [
    "下一操作 →",
    "Next operation →"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "last": [
    "跳到完成",
    "Go to end"
  ],
  "range": [
    "原下标 (i,j)",
    "Original indices (i,j)"
  ],
  "elements": [
    "值 (x,y)",
    "Values (x,y)"
  ],
  "sum": [
    "严格倍数比较",
    "Strict doubled test"
  ],
  "decision": [
    "判断",
    "Decision"
  ],
  "yes": [
    "计入",
    "Count"
  ],
  "no": [
    "排除",
    "Exclude"
  ],
  "baseStatus": [
    "已检查 {n}/3 对；累计计入 {count} 对。",
    "Checked {n}/3 pairs; running count = {count}."
  ],
  "baseline": [
    "基线：两层循环枚举所有 i<j，每次直接判断 nums[i]>2*nums[j]。这里 4>4 为假，4>2 为真，2>2 为假，所以答案为 1。时间 O(n²)，额外空间 O(1)；n=50000 时需 1,249,975,000 次比较。",
    "Baseline: use two loops over all i<j and test nums[i]>2*nums[j] directly. Here 4>4 is false, 4>2 true, and 2>2 false, giving 1. Time O(n²), auxiliary space O(1); n=50000 requires 1,249,975,000 comparisons."
  ],
  "s1t": [
    "怎样一次计入右边的一整段？",
    "How can one boundary count a whole group?"
  ],
  "s1e": [
    "这一步要回答：左半值 x 能与多少右半值配对？假设原数组左块全部早于右块，且块内已经排序。取 L=[3,5,8]，R=[1,2,4]。对 x=3，3>2×1 成立而 3>2×2 不成立，后面的 4 更不可能成立。合格的值正好是右边开头的一段，叫前缀。 在手算的 [4,2,1] 中，按原下标切为 [4] 与 [2,1]，右块排成 [1,2]；4 只与 1 合格，正是长为 1 的前缀。下面换一个有多个左值的实验，观察边界的变化。",
    "How many right-half values can pair with one left value x? Assume every original left position precedes every right position, and both blocks are sorted. Take L=[3,5,8], R=[1,2,4]. For x=3, 3>2×1 holds but 3>2×2 fails; the later 4 also fails. The qualifying values form a prefix: a stretch starting at the beginning. In our hand example [4,2,1], split by original index into [4] and [2,1], then sort the right block to [1,2]. Only 1 qualifies for 4: a prefix of length 1. The experiment below uses several left values to expose how that boundary changes."
  ],
  "derive": [
    "x=5 时，5>2 和 5>4 成立，5>8 失败，贡献 2。x=8 时，8>8 仍失败，贡献仍为 2。跨半总数是 1+2+2=5。边界 q 表示右边第一个失败的位置；没有失败则 q=R 的长度。前 q 项全部合格，所以一次加 q。",
    "For x=5, 5>2 and 5>4 hold while 5>8 fails: add 2. For x=8, 8>8 still fails: add 2 again. The cross count is 1+2+2=5. Boundary q is the first failing right position, or R.length if none fails. All first q entries qualify, so add q at once."
  ],
  "s1task": [
    "切换 x，保持 R 不变。观察每个真实比较、前缀标签与 q；等于 2×y 的格子必须留在前缀外。",
    "Change x while keeping R fixed. Inspect each actual comparison, prefix label, and q. A cell with x=2×y must remain outside the prefix."
  ],
  "pairLabel": [
    "选择左半值 x",
    "Select left value x"
  ],
  "pairRead": [
    "x={x}；边界 q={q}；跨半贡献 +{q} 对。",
    "x={x}; boundary q={q}; cross contribution +{q} pairs."
  ],
  "cell": [
    "R[{i}]={y}；{x}>{double}：{decision}",
    "R[{i}]={y}; {x}>{double}: {decision}"
  ],
  "pointerRule": [
    "为什么 q 不必回退？左值按不减顺序走，下一个 x 不会更小。之前成立的 x>2y 仍成立，因此第一个失败位置只会右移或不动。这就是单调边界（不会向左移动）。这个推理对负数也成立，因为乘以正数 2 保持大小顺序。",
    "Why never move q backwards? Left values are nondecreasing, so the next x is no smaller. Every previously true x>2y stays true. The first failure can only stay put or move right. This is a monotone boundary: it never moves left. Negative numbers obey the same reasoning because multiplying by positive 2 preserves order."
  ],
  "s2t": [
    "怎样排序又不破坏 i<j？",
    "How can sorting preserve i<j?"
  ],
  "wrong": [
    "这一步要回答：能把整个数组先排序吗？[3,1] 原本有 3>2×1，答案 1；排序成 [1,3] 再按新下标枚举会得到 0。另一诱惑是数普通逆序（只比较 x>y）：[2,1] 中 2>1 成立，但 2>2 不成立，翻转对为 0。",
    "Can we sort the entire input first? [3,1] has 3>2×1, so the answer is 1. Sorting to [1,3] and using the new positions gives 0. Another temptation is ordinary inversions, testing only x>y: [2,1] satisfies 2>1 but fails 2>2, so its reverse-pair count is 0."
  ],
  "splitReason": [
    "先按原下标把块 [lo,hi) 分为 [lo,mid) 与 [mid,hi)，右端不包含。每对 i<j 恰好属于左内、右内或跨半之一。递归就是先对更小的块做同样的事；长度 ≤1 时没有数对。两半内部数完后，各自返回排好序的值。跨半时任何左位置都早于任何右位置，所以块内排序不会改变跨半的下标合法性。 对 [4,2,1]，右块 [2,1] 内部的 2>2 为假，先返回 [1,2] 和 0；左块 [4] 返回 0。父块中 4>2 成立、4>4 失败，跨半加 1，合计 0+0+1=1。",
    "Split an original index block [lo,hi) into [lo,mid) and [mid,hi), excluding each right endpoint. Every i<j pair is uniquely within the left half, within the right half, or across the split. Recursion means doing the same job on smaller blocks; length ≤1 has no pairs. Each half returns sorted values after counting its internal pairs. For cross pairs, every original left position precedes every right position, so sorting within each half preserves index validity. For [4,2,1], the right block [2,1] fails 2>2 and returns [1,2] with count 0; [4] returns 0. In the parent, 4>2 holds and 4>4 fails, adding 1 cross pair: 0+0+1=1."
  ],
  "partition": [
    "跨半按上一实验扫描前缀，再归并：反复取两半尚未取出的较小值，生成整个块的有序值。先计数再归并，不能把已混合的块当成原来的两半。图中 L/R 下标是排序后的局部位置，不是原下标。",
    "Count cross pairs with the prefix scan, then merge: repeatedly take the smaller unused value from the two sorted halves to produce one sorted block. Count before merging; a mixed block no longer represents the two original halves. L/R offsets in the view are sorted local positions, not original indices."
  ],
  "invariant": [
    "因此得到每次调用的保持条件（不变量）：返回时，该原下标块内所有合法数对恰好计数一次，并且块内值已排序。长度 0/1 满足；两子块满足时，三类互不重叠且覆盖全部，前缀扫描正好补上跨半类，归并提供父调用需要的顺序。这也证明整个答案正确。",
    "This derives the invariant, a condition maintained by each completed call: every qualifying pair inside that original block has been counted exactly once, and its values are sorted. Length 0/1 satisfies it. Given the two child results, the three disjoint classes cover every pair; prefix scanning adds exactly the cross class, and merging supplies the order needed by the parent. This proves the full result."
  ],
  "traceTask": [
    "先逐步走，再撤回并重放。每个计数帧都在一个左值的前缀扫描完成之后；下面记录保留此前每次贡献。归并帧只改顺序、不加数量。",
    "Advance, rewind, then replay. Each counting frame is after completing the prefix scan for one left value. The ledger retains every contribution so far. Merge frames change value order without adding pairs."
  ],
  "presetLabel": [
    "预设输入（切换会重置此轨迹）",
    "Preset input (changing it resets this trace)"
  ],
  "preset0": [
    "官方例 1",
    "Official example 1"
  ],
  "preset1": [
    "官方例 2",
    "Official example 2"
  ],
  "preset2": [
    "等号边界",
    "Equality boundary"
  ],
  "preset3": [
    "重复负数",
    "Duplicate negatives"
  ],
  "preset4": [
    "单元素",
    "Singleton"
  ],
  "preset5": [
    "32 位极值",
    "32-bit extremes"
  ],
  "sim": [
    "这是完整的小输入 JavaScript 教学模拟，不是执行下方 Python 提交；没有省略帧。",
    "This is a complete small-input JavaScript teaching simulation, not execution of the Python submission below. No frames are omitted."
  ],
  "inputRead": [
    "原输入 nums=[{nums}]",
    "Original nums=[{nums}]"
  ],
  "frameRead": [
    "操作进度 {n}/{max}；已累计计入 {total} 对（仅完成时才是最终答案）。",
    "Operation progress {n}/{max}; cumulative counted pairs = {total} (final only at completion)."
  ],
  "countRead": [
    "原块 [{lo},{hi})，切点 {mid}。x={x} 扫描完毕；q 从 {before} 到 {q}，本次 +{q} 对。右前缀 [0,q) 全满足 x>2y；q 处若存在则失败。",
    "Original block [{lo},{hi}), split {mid}. Finished scanning x={x}; q moved from {before} to {q}, cross contribution +{q}. Right prefix [0,q) satisfies x>2y; position q fails if it exists."
  ],
  "mergeRead": [
    "原块 [{lo},{hi}) 归并完成 → [{merged}]；本次 +0 对。",
    "Merged original block [{lo},{hi}) → [{merged}]; adds 0 pairs."
  ],
  "startRead": [
    "初始：还未比较或归并。",
    "Initial state: no comparisons or merges yet."
  ],
  "doneRead": [
    "全部完成，排序副本=[{sorted}]；累计数量就是最终答案。",
    "Complete. Sorted copy=[{sorted}]; the cumulative count is now the final answer."
  ],
  "leftLabel": [
    "L · 已排序左半值",
    "L · Sorted left values"
  ],
  "rightLabel": [
    "R · 已排序右半值",
    "R · Sorted right values"
  ],
  "ledgerTitle": [
    "累计贡献记录（计数帧）",
    "Cumulative contributions (count frames)"
  ],
  "emptyLedger": [
    "尚未完成任何计数帧。",
    "No counting frame completed yet."
  ],
  "ledgerRow": [
    "原块 [{lo},{hi})，切点 {mid}，x={x}：前缀长 {q}，+{add} 对。",
    "Original block [{lo},{hi}), split {mid}, x={x}: prefix length {q}, pair contribution +{add}."
  ],
  "s3t": [
    "负数会让边界倒退吗？",
    "Do negative values move the boundary backwards?"
  ],
  "s3e": [
    "这一步要回答：原左块排好序为 L=[−3,0,4]，原右块排好序为 R=[−2,0,2]，只数跨半翻转对有多少？跨半保证原下标 i<j；边界 q 是首个不满足 x>2y 的右位置。先为每个左值推导 q，再作答；两半内部不在本题计数内。",
    "The original left block sorts to L=[−3,0,4], and the right block to R=[−2,0,2]. How many cross-half reverse pairs are there? Across the split, original i<j is guaranteed. Boundary q is the first right position failing x>2y. Derive q for each left value before answering; internal pairs are excluded from this question."
  ],
  "predictionLegend": [
    "预测跨半数对总数",
    "Predict the total cross-pair count"
  ],
  "reveal": [
    "验证预测",
    "Check prediction"
  ],
  "await": [
    "先选择，再验证；修改选择会隐藏旧反馈。",
    "Choose, then check. Changing the choice hides old feedback."
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "再看严格比较。",
    "Revisit the strict test."
  ],
  "answer": [
    "q 依次为 1、1、2：−3>−4；0>−4 但 0>0 为假；4>−4、4>0，但 4>4 为假。共 4 对。负数不破坏边界不回退的条件。3 漏掉一对，6 把等号也计入。",
    "The q values are 1,1,2: −3>−4; 0>−4 but 0>0 fails; 4>−4 and 4>0 but 4>4 fails. Total 4. Negatives preserve the nondecreasing boundary. 3 misses a pair; 6 includes equalities."
  ],
  "s4t": [
    "把证明变成可提交 Python",
    "Turn the proof into submittable Python"
  ],
  "s4e": [
    "这一步要回答：代码哪里兑现了不变量？官方 Python3 接口是 Solution.reversePairs(self, nums: list[int]) -> int。返回数量；代码先复制 nums，保留调用者的原数组。下方为完整原始提交源码。",
    "Where does the code fulfill the invariant? The official Python3 interface is Solution.reversePairs(self, nums: list[int]) -> int. Return the count; this implementation copies nums to preserve the caller’s input. The full canonical submission source is below."
  ],
  "mappingTitle": [
    "轨迹与代码的对应",
    "Mapping the trace to code"
  ],
  "mapping1": [
    "sort_count(lo,hi)：先求左右内部数量；长度 ≤1 返回 0。",
    "sort_count(lo,hi) first counts the two internal classes; length ≤1 returns 0."
  ],
  "mapping2": [
    "q=mid 在每个块只初始化一次；while 严格比较 a[i]>2*a[q]，q-mid 是图中局部前缀长。",
    "q=mid is initialized once per block. The while uses strict a[i]>2*a[q]; q-mid is the local prefix length in the view."
  ],
  "mapping3": [
    "temp 归并两半；写回 a[lo:hi]，再返回内部数加跨半数。",
    "temp merges the halves; write back a[lo:hi], then return internal plus cross counts."
  ],
  "cost": [
    "成本：每层所有块共扫描和归并 O(n) 个元素，递归有 O(log n) 层，所以时间 O(n log n)。a、temp 和切片临时空间的峰值 O(n)，调用栈 O(log n)，合计额外空间 O(n)。教学帧另存完整历史，不能当成提交空间；预设长度最多 5。",
    "Cost: scanning and merging across a level takes O(n), with O(log n) recursion levels, giving O(n log n) time. a, temp, and temporary slices peak at O(n); the call stack is O(log n), so total auxiliary space is O(n). Teaching frames retain history separately and are not submission space; presets have at most 5 elements."
  ],
  "boundaries": [
    "边界：单元素返回 0；[2,1] 返回 0（严格等号）；[−5,−5] 返回 1，因为 −5>−10。官方例分别返回 2、3。最大可能数量 n(n−1)/2 可由全 −1 达到。Python 整数不会在 2*y 时溢出；固定 32 位语言必须先扩宽再乘 2，不能截断或用整数除法代替。",
    "Boundaries: a singleton returns 0; [2,1] returns 0 (strict equality); [−5,−5] returns 1 since −5>−10. Official examples return 2 and 3. All −1 values attain the maximum n(n−1)/2 pairs. Python integers do not overflow at 2*y. Fixed 32-bit languages must widen before doubling; truncation or integer division changes the test."
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
    "展开完整 Python 源码",
    "Show full Python source"
  ],
  "manualCopy": [
    "手动复制完整源码",
    "Manually copy the full source"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "剪贴板不可用：源码已选中，请手动复制。",
    "Clipboard unavailable: source selected for manual copying."
  ],
  "related1": [
    "区间和：为何先保留原下标块 →",
    "Range sums: preserve original index blocks →"
  ],
  "related2": [
    "右侧较小元素：比较另一种计数量 →",
    "Count smaller: compare another counting target →"
  ],
  "foot": [
    "作者自查候选；独立评审待进行。模拟不等于提交执行；不声称 LeetCode 已通过。",
    "Author self-checked candidate; independent review pending. Simulation is distinct from submission execution; no LeetCode acceptance claimed."
  ]
};
