'use strict';
window.LESSON_COPY = {
  "docTitle": [
    "#992 · K 个不同整数的子数组",
    "#992 · Subarrays with K Different Integers"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "langLabel": [
    "选择语言",
    "Choose language"
  ],
  "navLabel": [
    "课程步骤",
    "Lesson steps"
  ],
  "title": [
    "#992 · K 个不同整数的子数组",
    "#992 · Subarrays with K Different Integers"
  ],
  "intro": [
    "一排数字 [1,2,1]，只要包含两种不同数字的连续片段。为什么答案是 3，而最后一个位置就贡献了 2？",
    "Take the row [1,2,1]. We want contiguous pieces containing exactly two different values. Why is the answer 3, with 2 coming from the last position?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "01 · 先把三个片段找出来",
    "01 · Find the three pieces"
  ],
  "q0": [
    "这一步要回答：给定整数数组 nums 和整数 k，哪些连续片段算一次？子数组是原数组中非空、连续的一段；“不同整数个数”只数不同的值，不数重复次数。",
    "Which pieces count? Given an integer array nums and an integer k, a subarray is a nonempty contiguous piece. Its distinct count is the number of different values, ignoring repetitions."
  ],
  "rules": [
    "固定 nums=[1,2,1]、k=2。位置从 0 开始，区间 [l,r] 包含两端。依次检查六个区间：两个 1 可以同时出现，但依然只贡献一种值。不同位置的区间分别计数，即使内容一样。",
    "Fix nums=[1,2,1] and k=2. Positions start at 0; [l,r] includes both ends. Inspect the six intervals in order. Two occurrences of 1 still give only one distinct value. Intervals at different positions count separately, even if their contents match."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 20,000；1 ≤ nums[i], k ≤ n（n 是数组长度）。返回区间数量，无需取模。官方例：[1,2,1,2,3], k=2 → 7；[1,2,1,3,4], k=3 → 3。",
    "Official bounds: 1 ≤ n ≤ 20,000; 1 ≤ nums[i], k ≤ n, where n is the array length. Return an interval count, with no modulus. Official examples: [1,2,1,2,3], k=2 → 7; [1,2,1,3,4], k=3 → 3."
  ],
  "handTask": [
    "先猜每段有几种值，再按“检查下个区间”。看 ✓ 的累计数量；用“撤回”恢复上一状态。这一小实验与第 3 节的预设互不影响。",
    "Predict the distinct count, then inspect the next interval. Watch the running count of ✓ marks. Undo restores the previous state. This experiment is independent of the presets in section 3."
  ],
  "undo": [
    "撤回一个区间",
    "Undo one interval"
  ],
  "add": [
    "检查下个区间",
    "Inspect next interval"
  ],
  "handReset": [
    "重新手算",
    "Restart hand count"
  ],
  "handRow": [
    "[{l},{r}] = {values}；不同值 {d} 种 → {mark}",
    "[{l},{r}] = {values}; {d} distinct → {mark}"
  ],
  "handRead": [
    "已检查 {n}/6 个区间；目前计入 {sum} 个。",
    "Inspected {n}/6 intervals; {sum} counted so far."
  ],
  "yes": [
    "✓ 计入",
    "✓ count"
  ],
  "no": [
    "× 不计入",
    "× exclude"
  ],
  "s1": [
    "02 · 先放宽条件，再做减法",
    "02 · Relax the rule, then subtract"
  ],
  "q1": [
    "这一步要回答：如何避免为每个起点重新向右扫描？下面的基线是一个正确但较慢的方法：固定左端 l，逐个加入右端 r，用集合 seen 保存已经出现的不同值。 seen.add(nums[r]) 把值加入集合；len(seen) 读取集合中不同值的个数。",
    "How can we avoid scanning rightward again for every start? The baseline below is correct but slow: fix a left endpoint l, extend the right endpoint r, and keep distinct values in the set seen. seen.add(nums[r]) inserts a value; len(seen) reads the number of distinct values in the set."
  ],
  "baselineNote": [
    "每个区间都被检查一次，至多 n(n+1)/2 次；n=20,000 时是 200,010,000 次扩展。平均集合操作 O(1) 下，耗时 O(n²)，辅助空间 O(n)。目标是复用相邻右端点之间的信息。",
    "It checks every interval once: up to n(n+1)/2 extensions, or 200,010,000 when n=20,000. With average O(1) set operations, it takes O(n²) time and O(n) extra space. We want to reuse information between adjacent right endpoints."
  ],
  "wrong": [
    "诱人的错误：只保留一个“恰好 k 种”的窗口，然后每个右端点加 1。[1,2,1]、k=2 的末端 r=2 同时有 [0,2] 和 [1,2] 合法，这个规则会漏掉一个。也不能直接加窗口长度 3，因为 [2,2] 只有一种值。",
    "Tempting mistake: keep one window with exactly k values, then add 1 per right endpoint. At r=2 in [1,2,1], k=2, both [0,2] and [1,2] qualify, so this misses one. Adding its full length 3 also fails: [2,2] has just one distinct value."
  ],
  "derive": [
    "改问“至多 t 种”：at_most(t) 表示不同值不超过 t 种的非空区间总数。每个恰好 k 种的区间会被 at_most(k) 计入，却不会被 at_most(k−1) 计入；少于 k 种的区间在两边各出现一次，正好抵消；多于 k 种的两边都没有。",
    "Instead ask for “at most t”: at_most(t) counts nonempty intervals with no more than t distinct values. An interval with exactly k appears in at_most(k) but not at_most(k−1). An interval with fewer appears in both and cancels. An interval with more appears in neither."
  ],
  "handSubtract": [
    "在 [1,2,1] 中，六个区间都至多两种；至多一种的只有三个单元素区间。因此答案 = 6−3 = 3。下面保持这个例子，观察这两个计数如何增长。",
    "In [1,2,1], all six intervals have at most two distinct values. Only the three singletons have at most one. So the answer is 6−3=3. Keep this example below and watch the two counts grow."
  ],
  "s2": [
    "03 · 看见两个左边界",
    "03 · See the two left boundaries"
  ],
  "q2": [
    "这一步要回答：固定右端 r 时，哪些起点能留下？窗口是连续区间 [left,r]，频次 freq 是每种值在窗口中出现的次数。加入 nums[r]；若种类太多，就从左侧依次移出，直到符合上限。移出一次不一定少一种：次数降到 0 才删除该值。",
    "For a fixed right endpoint r, which starts survive? A window is [left,r]; freq records how many times each value occurs in it. Append nums[r]. If there are too many distinct values, remove from the left until the limit holds. Removing an occurrence removes a distinct value only when its frequency reaches 0."
  ],
  "observe": [
    "仍看 [1,2,1]，追加至 r=2：上限 2 的窗口是 [0,2]，频次 {1:2,2:1}，起点 0、1、2 都满足；上限 1 的窗口从 [1,2] 移出索引 1 的值 2，留下 [2,2]。相减留下起点 0、1，贡献 2。先观察下方移出记录，再对照起点标记与累计表。",
    "Stay with [1,2,1] and append through r=2. The limit-2 window is [0,2], with frequencies {1:2,2:1}; starts 0,1,2 all qualify. The limit-1 window removes value 2 at index 1 from [1,2], leaving [2,2]. Subtraction retains starts 0 and 1, contributing 2. Read the removal log first, then compare the start labels and cumulative ledger."
  ],
  "invariant": [
    "为什么一条边界足够？对任意非负上限 t，每轮结束时 left_t 是最早合法起点。上一轮 left_t 之前的起点已超限，追加后仍超限；向右移出只能让种类不增，第一次达标就是最早合法处。再往右的所有起点也合法。因此合法起点恰好为 left_t…r，共 r−left_t+1 个。这就是每轮保持不变的性质（不变式）。",
    "Why is one boundary enough? For each nonnegative limit t, left_t is the earliest valid start after every round. Starts before the old boundary were already over the limit and stay invalid after appending. Removing from the left cannot increase distinct count, so the first valid start is the earliest one. Every later start is valid too. Thus precisely left_t…r qualify, giving r−left_t+1 intervals. This maintained property is the invariant."
  ],
  "formula": [
    "本轮恰好 k 种 = (r−left_k+1) − (r−left_(k−1)+1) = left_(k−1)−left_k",
    "Exactly k this round = (r−left_k+1) − (r−left_(k−1)+1) = left_(k−1)−left_k"
  ],
  "proof": [
    "小上限更严格，所以 left_(k−1) ≥ left_k；恰好 k 种的起点是 [left_k, left_(k−1)−1]。每个区间只有一个右端点，把每轮贡献相加既不重计也不漏计。当 t=0 时，left_t=r+1，窗口为空，贡献 0 个非空区间。",
    "The smaller limit is stricter, so left_(k−1) ≥ left_k. Exactly-k starts occupy [left_k, left_(k−1)−1]. Every interval has one right endpoint, so summing rounds counts each once. For t=0, left_t=r+1: the window is empty and contributes no nonempty interval."
  ],
  "simLimit": [
    "教学模拟：每次追加并完成两个窗口的全部收缩后才显示一帧，无省略端点。并排对齐两个扫描，不执行 Python；Python 实际先后调用两次 helper。完整快照只用于回放，预设最多 5 项，其存储成本不等于提交解的辅助空间。",
    "Teaching simulation: each frame is after appending and fully repairing both windows; no endpoints are omitted. It aligns two scans without executing Python, whose helper actually runs twice in sequence. Full snapshots support rewind on presets of at most 5 items; their storage is separate from submission space."
  ],
  "preset": [
    "选择数据（会重新开始此模拟）",
    "Choose input (restarts this simulation)"
  ],
  "p0": [
    "手算例",
    "Hand example"
  ],
  "p1": [
    "官方例 1",
    "Official 1"
  ],
  "p2": [
    "官方例 2",
    "Official 2"
  ],
  "p3": [
    "重复值，k=1",
    "Repeated, k=1"
  ],
  "p4": [
    "各不相同",
    "All distinct"
  ],
  "p5": [
    "单元素",
    "Singleton"
  ],
  "p6": [
    "种类不够",
    "Too few types"
  ],
  "prev": [
    "撤回一个右端点",
    "Undo one endpoint"
  ],
  "next": [
    "追加下个右端点",
    "Append next endpoint"
  ],
  "reset": [
    "重置此模拟",
    "Reset simulation"
  ],
  "progress": [
    "已完成 {n}/{size} 个右端点；nums={nums}，k={k}",
    "Completed {n}/{size} right endpoints; nums={nums}, k={k}"
  ],
  "initial": [
    "尚未加入元素。两个 left 都是 0，累计答案 0。",
    "No elements appended. Both left boundaries are 0; running answer is 0."
  ],
  "event": [
    "刚完成 r={r}，加入值 {value}，再修复两个窗口。当前高亮标记右端点 r，不改变数组值。",
    "Just completed r={r}: appended {value}, then repaired both windows. The highlighted r marks the current endpoint; it does not change the data."
  ],
  "index": [
    "位置 {i}",
    "index {i}"
  ],
  "current": [
    "当前 r",
    "current r"
  ],
  "pending": [
    "未处理",
    "pending"
  ],
  "window": [
    "上限 t={t}：窗口 {range}",
    "Limit t={t}: window {range}"
  ],
  "empty": [
    "空窗口",
    "empty window"
  ],
  "boundary": [
    "left：{before} → {after}；加入后、收缩前 {d} 种。",
    "left: {before} → {after}; {d} distinct after append, before shrinking."
  ],
  "freq": [
    "收缩后的 freq：{freq}；本轮至多 {t} 种有 {count} 个区间。",
    "freq after shrinking: {freq}; intervals with at most {t} distinct this round: {count}."
  ],
  "noRemoval": [
    "无需移出。",
    "No removals needed."
  ],
  "removal": [
    "移出索引 {i} 的 {x} → 该值余 {n} 次{deleted}。",
    "Remove {x} at index {i} → remaining frequency: {n}{deleted}."
  ],
  "deleted": [
    "，删除该键",
    ", delete its key"
  ],
  "startsTitle": [
    "当前右端点的所有起点：",
    "All starts for this endpoint:"
  ],
  "start": [
    "l={l}：{label}",
    "l={l}: {label}"
  ],
  "exact": [
    "恰好 k 种 ✓",
    "exactly k ✓"
  ],
  "tooFew": [
    "少于 k 种（抵消）",
    "fewer than k (cancels)"
  ],
  "tooMany": [
    "多于 k 种（排除）",
    "more than k (excluded)"
  ],
  "ledgerTitle": [
    "每轮贡献账本（全部已完成的右端点）",
    "Contribution ledger (all completed endpoints)"
  ],
  "scrollHint": [
    "窄屏可聚焦表格后用方向键横向查看；每列标题随表保留。",
    "On narrow screens, focus the table region and use arrow keys to scroll horizontally. Column headings remain with the table."
  ],
  "rHeader": [
    "右端 r",
    "endpoint r"
  ],
  "kHeader": [
    "至多 k（本轮）",
    "at most k (round)"
  ],
  "kmHeader": [
    "至多 k−1（本轮）",
    "at most k−1 (round)"
  ],
  "deltaHeader": [
    "恰好 k（本轮）",
    "exactly k (round)"
  ],
  "sumHeader": [
    "累计恰好 k",
    "running exactly k"
  ],
  "result": [
    "本轮新增 {delta} 个；已完成前缀的答案 = {total}。",
    "This round adds {delta}; answer for the completed prefix = {total}."
  ],
  "s3": [
    "04 · 换个例子，先预测",
    "04 · Transfer: predict first"
  ],
  "q3": [
    "这一步要回答：在新数组 [1,2,2,3,1]、k=2 中，只看右端 r=3（值 3），有几个起点使区间恰好两种？用“最早满足至多 2 种”和“最早满足至多 1 种”两个边界推断，不要计算整个数组的总数。",
    "For the fresh array [1,2,2,3,1], k=2, look only at r=3 (value 3). How many starts give exactly two distinct values? Use the earliest starts for limits 2 and 1. Do not count the whole array."
  ],
  "choose": [
    "先选择，再揭晓推理",
    "Choose before revealing the reasoning"
  ],
  "option0": [
    "1 个：只取最长合法窗口",
    "1: only the longest valid window"
  ],
  "option1": [
    "2 个：一个边界区间内的起点",
    "2: starts between the boundaries"
  ],
  "option2": [
    "3 个：整个合法窗口的长度",
    "3: the full valid window length"
  ],
  "reveal": [
    "揭晓并核对",
    "Reveal and check"
  ],
  "correct": [
    "选择正确。",
    "Your prediction is correct."
  ],
  "incorrect": [
    "再对照漏计或多计的区间。",
    "Compare the missing or extra intervals."
  ],
  "answer": [
    "left_2=1（起点 0 含 1、2、3 三种），left_1=3（两个 2 都要移出才能只剩 3）。所以 3−1=2：区间 [1,3]=[2,2,3] 与 [2,3]=[2,3]。选 1 漏掉第二个；选 3 把只有一种值的 [3,3] 也算进去了。",
    "left_2=1 (start 0 includes three values: 1,2,3), and left_1=3 (both occurrences of 2 must leave to retain only 3). Thus 3−1=2: [1,3]=[2,2,3] and [2,3]=[2,3]. Choosing 1 misses the second interval; choosing 3 also counts the singleton [3,3]."
  ],
  "s4": [
    "05 · 把边界写成 Python",
    "05 · Turn the boundaries into Python"
  ],
  "q4": [
    "这一步要回答：如何把“最早合法起点”变成官方提交接口？subarraysWithKDistinct 返回整数；内部 at_most(limit) 返回整个数组中至多 limit 种值的区间总数，不改变 nums。",
    "How does the earliest-valid-start invariant become a submission? subarraysWithKDistinct returns an integer. Its helper at_most(limit) returns the whole-array count for that limit, without changing nums."
  ],
  "map": [
    "enumerate(nums) 给出位置 right 和值 value；freq.get(value,0) 在缺失时从 0 开始。len(freq) 是不同值个数，因为次数为 0 的键会被 del 删除。while 完成后，total += right−left+1 正对应图中的“至多”贡献。最后两次返回值相减。",
    "enumerate(nums) supplies position right and value value; freq.get(value,0) starts missing values at 0. len(freq) is the distinct count because del removes zero-frequency keys. After the while loop, total += right−left+1 is the diagram’s at-most contribution. Finally subtract the two helper results."
  ],
  "cost": [
    "成本：每次扫描 right 前进 n 次，left 只前进、最多 n 次；两次扫描仍是 O(n) 次操作。Python 字典平均 O(1) 操作下，期望时间 O(n)，辅助空间 O(n)，最坏保存 n 种值。不是每个 right 都从头收缩。",
    "Cost: each scan advances right n times and left at most n times, always forward. Two scans still perform O(n) operations. With average O(1) Python dictionary operations, expected time is O(n), with O(n) auxiliary space for up to n distinct values. Shrinking does not restart from 0 for each right."
  ],
  "bounds": [
    "边界：k=1 时减去 at_most(0)=0；所有值相同且 k=1 时答案为 n(n+1)/2，n=20,000 时是 200,010,000；实际种类少于 k 时两个总数相等，答案 0。官方不含空数组。模拟不是性能测试，页面不执行显示的 Python；可下载后在本地运行。",
    "Boundaries: for k=1, subtract at_most(0)=0. If all values match and k=1, the answer is n(n+1)/2, or 200,010,000 for n=20,000. If the array has fewer than k distinct values, the two totals match and the answer is 0. Official inputs are nonempty. The simulation is not a benchmark and does not execute the displayed Python; download it to run locally."
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
    "查看完整提交源码",
    "Inspect full submission source"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用。下方源码已全选，请按系统复制快捷键。",
    "Automatic copy is unavailable. The complete source below is selected; use your system copy shortcut."
  ],
  "related": [
    "继续探索",
    "Explore next"
  ],
  "related0": [
    "本页：为什么“至多”可以相减",
    "#992: why at-most counts subtract"
  ],
  "related1": [
    "#76：用频次维持覆盖全部字符的窗口",
    "#76: maintain a window covering all required characters"
  ],
  "foot": [
    "连续片段 · 两个边界 · 一次不重不漏的计数",
    "Contiguous intervals · two boundaries · count every interval once"
  ],
  "initialWindow": [
    "初始化：left=0，窗口为空，尚未加入任何值。",
    "Initial state: left=0, empty window; no values appended yet."
  ],
  "related2": [
    "#2916：按右端点分组，累计不同值个数的平方",
    "#2916: group by right endpoint to sum squared distinct counts"
  ]
};
