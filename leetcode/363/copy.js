window.COPY = {
  "docTitle": [
    "363 · 矩形区域不超过 K 的最大数值和",
    "363 · Max Sum of Rectangle No Larger Than K"
  ],
  "title": [
    "#363 · 矩形区域不超过 K 的最大数值和",
    "#363 · Max Sum of Rectangle No Larger Than K"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "intro": [
    "四个格子的和恰好是 2：如何在含负数的矩阵中找到不超过上限的最大矩形和？",
    "Four cells sum to exactly 2. How do we find the largest rectangle sum under a cap when cells can be negative?"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "1 · 手算矩形",
    "1 · Hand calculation"
  ],
  "h0": [
    "手算矩形",
    "Hand calculation"
  ],
  "nav1": [
    "2 · 压缩行带",
    "2 · Compress a band"
  ],
  "h1": [
    "压缩行带",
    "Compress a band"
  ],
  "nav2": [
    "3 · 寻找历史前缀",
    "3 · Find a prefix"
  ],
  "h2": [
    "寻找历史前缀",
    "Find a prefix"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "h3": [
    "先预测",
    "Predict first"
  ],
  "nav4": [
    "5 · 实现与边界",
    "5 · Code and limits"
  ],
  "h4": [
    "实现与边界",
    "Code and limits"
  ],
  "p0": [
    "这一步要回答：在 [[1,0,1],[0,−2,3]] 中，哪个矩形的和最接近但不超过 k=2？矩形必须选择连续的行和连续的列，且至少包含一个格子。",
    "Which rectangle in [[1,0,1],[0,−2,3]] gets closest to k=2 without exceeding it? A rectangle uses consecutive rows and consecutive columns and contains at least one cell."
  ],
  "rules": [
    "输入 m×n 整数矩阵和上限 k，返回最大合法和。1≤m,n≤100；格子值 −100…100；k 为 −100000…100000。题目保证至少存在一个和≤k 的非空矩形。",
    "Given an m×n integer matrix and cap k, return the largest legal sum. Dimensions are 1…100, cells −100…100, and k −100000…100000. A nonempty rectangle with sum ≤k is guaranteed to exist."
  ],
  "handTask": [
    "只选第 0…1 行、第 1…2 列。先把这四格相加，再揭晓。坐标从 0 开始；不是任选四个格子。",
    "Select rows 0…1 and columns 1…2. Add these four cells before revealing. Coordinates start at 0; you cannot choose four arbitrary cells."
  ],
  "handShow": [
    "揭晓四格之和",
    "Reveal the four-cell sum"
  ],
  "handHide": [
    "收起手算结果",
    "Hide the hand calculation"
  ],
  "handAnswer": [
    "0+1+(−2)+3=2。没有合法和能大于上限 2，所以此矩形已达最优。",
    "0+1+(−2)+3=2. No legal sum can exceed the cap 2, so this rectangle is optimal."
  ],
  "p1": [
    "这一步要回答：逐个矩形重新加格子，哪些计算重复了？基线枚举上下左右边界，再逐格求和，仅保留≤k 的最大值。",
    "Which additions repeat if we recompute every rectangle? The baseline enumerates top, bottom, left and right boundaries, sums the enclosed cells, and keeps the largest sum ≤k."
  ],
  "baselineCost": [
    "以下基线时间 O(m³n³)，额外空间 O(1)；100×100 时仅矩形就有 25,502,500 个。二维前缀和能把每次查询变成 O(1)，但仍要枚举 O(m²n²) 个矩形。",
    "This baseline costs O(m³n³) time and O(1) auxiliary space. A 100×100 grid has 25,502,500 rectangles. A two-dimensional prefix table makes each query O(1), but still enumerates O(m²n²) rectangles."
  ],
  "reduction": [
    "固定上、下边界叫作一个行带。把带内每列相加：两行 [1,0,1] 与 [0,−2,3] 得到 [1,−2,4]。矩形列 1…2 的和变成 −2+4=2。固定行带内，每个矩形与一个连续区间一一对应。bottom 下移一行时只需把新行加进 sums；无需重算带内旧行。",
    "A row band fixes top and bottom boundaries. Add each column inside it: [1,0,1] and [0,−2,3] become [1,−2,4]. Rectangle columns 1…2 now sum to −2+4=2. In a fixed band, rectangles correspond exactly to contiguous intervals. Moving bottom down adds just the new row to sums."
  ],
  "wrong": [
    "为什么不能超限就缩左边界？在 [2,2,−1]、k=3 中，看到 2+2=4 就丢掉第一个 2，会错过完整区间 2+2−1=3。负数使“扩展必增大”不再成立。",
    "Why not shrink the left edge whenever the sum exceeds k? In [2,2,−1] with k=3, discarding the first 2 when 2+2=4 loses the full interval 2+2−1=3. With negatives, extending an interval need not increase its sum."
  ],
  "p2": [
    "这一步要回答：固定行带后，怎样选择当前列结尾的区间？前缀 P 是从第 0 列加到当前列的和；更早的前缀 q 是区间开始前的和，初始 0 代表从第 0 列开始。区间和就是 P−q。",
    "For a fixed band, which interval ending at the current column should we choose? Prefix P is the sum from column 0 through this column. An earlier prefix q is the sum before the interval starts; initial 0 permits starting at column 0. The interval sum is P−q."
  ],
  "derive": [
    "在 [1,−2,4] 中：先 P=1，q=0 得 1；再 P=−1，q=0 得 −1；最后 P=3，要求 3−q≤2，即 q≥1。此前只有 [−1,0,1]，选择 1 得到 2。选择 0 会超限，选择 −1 会更大、更不合法。",
    "For [1,−2,4]: first P=1 and q=0 give 1; next P=−1 and q=0 give −1; finally P=3 requires 3−q≤2, hence q≥1. Earlier prefixes are [−1,0,1], so choose 1 to get 2. Choosing 0 exceeds the cap; choosing −1 exceeds it further."
  ],
  "invariant": [
    "由此得到不变量：处理当前列前，seen 恰好包含所有更早的前缀，按数值排序并保留重复值。P−q≤k 等价于 q≥P−k；在这些合法 q 中，最小 q 让 P−q 最大。查询后才插入 P，否则可能选到空区间；所有列结尾与所有行带合起来覆盖所有非空矩形。",
    "This gives the invariant: before processing the current column, seen contains exactly all earlier prefixes, sorted by value with duplicates retained. P−q≤k means q≥P−k. The smallest eligible q maximizes P−q. Insert P only after querying, to exclude empty intervals. All endpoints across all bands cover every nonempty rectangle."
  ],
  "binary": [
    "bisect_left 寻找第一个≥阈值 P−k 的位置；若没有，当前结尾没有合法区间，不能用 0 代替答案。历史中已有合法值时仍保留它。",
    "bisect_left locates the first value ≥ threshold P−k. If none exists, this endpoint has no legal interval; do not substitute 0. Keep any legal best found at earlier endpoints."
  ],
  "traceTask": [
    "保持预设不变，逐列处理，再退回一步对比。青色边框标记所选行带；格子数字是真实输入。下方保留每次查询前的历史、合法候选及查询后的最优值。换预设或行带会重置此实验。",
    "Keep the preset fixed, process columns, then step back to compare. Cyan borders mark the selected band; cell numbers are input data. The ledger retains earlier prefixes before each query, eligible choices, and the updated best. Changing preset or band restarts this experiment."
  ],
  "simulation": [
    "教学模拟：仅展示所选行带的全部事件；不是执行 Python，也不是整个矩阵的最终答案。Python 会遍历所有行带，达到 k 可提前返回；此模拟继续列出各结尾。历史快照额外占用教学内存。",
    "Teaching simulation: all events for one selected band, not Python execution or the whole-matrix answer. Python visits all bands and may return early at k; this trace continues through every endpoint. History snapshots use extra teaching memory."
  ],
  "preset": [
    "预设（切换会重置）",
    "Preset (changing resets trace)"
  ],
  "pre0": [
    "官方二维示例",
    "Official 2D example"
  ],
  "pre1": [
    "负数补救超限",
    "Negative rescues excess"
  ],
  "pre2": [
    "全负数与负上限",
    "All negative, negative cap"
  ],
  "pre3": [
    "零与重复前缀",
    "Zeros and duplicate prefixes"
  ],
  "pre4": [
    "高矩阵",
    "Tall matrix"
  ],
  "band": [
    "行带（含两端）",
    "Row band (inclusive)"
  ],
  "bandOption": [
    "第 {top}…{bottom} 行",
    "Rows {top}…{bottom}"
  ],
  "inputLabel": [
    "原矩阵与上限",
    "Input matrix and cap"
  ],
  "sumsLabel": [
    "所选行带的列和 sums",
    "Column sums of the selected band"
  ],
  "prev": [
    "← 撤回一列",
    "← Undo one column"
  ],
  "next": [
    "处理下一列 →",
    "Process next column →"
  ],
  "reset": [
    "重置到未处理",
    "Reset to unprocessed"
  ],
  "end": [
    "处理到末列",
    "Process through last column"
  ],
  "none": [
    "无合法值",
    "No legal value"
  ],
  "progress": [
    "已处理 {i}/{n} 列；P={p}；查询后 seen={seen}；本行带当前最优={best}。{phase}",
    "Processed {i}/{n} columns; P={p}; seen after query={seen}; current band best={best}. {phase}"
  ],
  "partial": [
    "行带尚未处理完。",
    "Band processing is incomplete."
  ],
  "final": [
    "此行带已完成。",
    "This band is complete."
  ],
  "logEmpty": [
    "尚未处理列；seen=[0]，没有选中空矩形。",
    "No column processed; seen=[0]. No empty rectangle is selected."
  ],
  "log": [
    "列 {col}：加入 {v} → P={p}；查询前 seen={before}；阈值 P−k={th}；合法 q={eligible}；选择 q={q}；区间和={candidate}；更新最优={best}。",
    "Column {col}: add {v} → P={p}; seen before query={before}; threshold P−k={th}; eligible q={eligible}; chosen q={q}; interval sum={candidate}; updated best={best}."
  ],
  "p3": [
    "这一步要回答：新行带 [3,−2,4]，k=4，处理到最后一列时 P=5，更早的前缀按值排序为 [0,1,3]。为了得到以此列结尾的最大合法区间和，应选哪个 q？前缀 q 是区间开始前的累计和。",
    "For a fresh band [3,−2,4], k=4, the final column has P=5 and sorted earlier prefixes [0,1,3]. Which q gives the largest legal interval sum ending here? Prefix q is the accumulated sum before the interval begins."
  ],
  "choose": [
    "先选一个历史前缀，再验证",
    "Choose an earlier prefix, then verify"
  ],
  "opt0": [
    "q=0：从第一列开始",
    "q=0: start at the first column"
  ],
  "opt1": [
    "q=1：从最后一列开始",
    "q=1: start at the last column"
  ],
  "opt3": [
    "q=3：从第二列开始",
    "q=3: start at the second column"
  ],
  "reveal": [
    "验证预测",
    "Check prediction"
  ],
  "waiting": [
    "答案尚未揭晓。",
    "Answer not revealed."
  ],
  "chosen": [
    "已选择；点击验证查看推导。",
    "Choice recorded; check it to see the reasoning."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再比较合法性和大小。",
    "Compare both legality and size."
  ],
  "answer": [
    "阈值 5−4=1。最小合法前缀 q=1，得到 5−1=4。q=0 得 5，超限；q=3 得 2，合法却较小。阈值是下界，不是要寻找更小的 q。",
    "The threshold is 5−4=1. The smallest eligible prefix is q=1, giving 5−1=4. q=0 gives 5, over the cap; q=3 gives 2, legal but smaller. The threshold is a lower bound on q."
  ],
  "p4": [
    "这一步要回答：如何把推导写成可提交的 Python？下面是官方 Python 接口的实现，返回整数最大和；浏览器图示是另一份教学模拟。",
    "How does the derivation become a submittable Python solution? Below is the official Python interface implementation, returning the integer maximum sum. The browser diagram is a separate teaching simulation."
  ],
  "mapping": [
    "top/bottom 固定行带；sums 累加列和；prefix 就是 P；seen 存更早前缀；pos 找最小合法 q；best 汇总所有行带。若 m>n，通过交换读取坐标沿较短维枚举行带，不复制矩阵。所有矩形在这个转置视图下都有对应；best==k 时已达到上限，可以立即返回。",
    "top/bottom fix a band; sums accumulates column sums; prefix is P; seen stores earlier prefixes; pos finds the smallest legal q; best combines all bands. When m>n, swapping read coordinates enumerates bands along the shorter dimension without copying the matrix. Every rectangle has a counterpart in this transposed view. best==k reaches the upper bound, allowing immediate return."
  ],
  "cost": [
    "令 a=min(m,n)，b=max(m,n)。共有 O(a²) 个行带，每带 b 次查询。二分查询 O(log b)，但 insort 在 Python 列表中搬移元素最坏 O(b)，故总时间 O(a²b²)，额外空间 O(b)，不含输入。它减少逐格重算，但不比二维前缀和枚举的最坏渐进时间更好。支持对数插入的有序树可达 O(a²b log b)；这里没有使用这样的树。",
    "Let a=min(m,n), b=max(m,n). There are O(a²) bands and b queries per band. Binary search takes O(log b), but insort shifts Python list entries in O(b) worst-case time. Total time is O(a²b²), auxiliary space O(b), excluding input. This removes repeated cell sums but does not improve the worst-case asymptotic time over 2D-prefix rectangle enumeration. A balanced ordered tree could achieve O(a²b log b); this implementation does not use one."
  ],
  "bounds": [
    "边界：单格也必须非空；全负数时 best 不能从 0 开始；重复前缀合法；某行带可能没有合法值，继续搜索其他行带。保证有解使最后 int(best) 有意义。测试用直接枚举格子的独立基线核对，覆盖最大尺寸与负上限；没有声称 LeetCode 已接受。",
    "Boundaries: even a single-cell rectangle must be nonempty. With all negatives, best cannot start at 0. Duplicate prefixes are legal. A band may have no legal value, so continue to other bands. The feasibility guarantee makes the final int(best) meaningful. Tests compare against independent direct cell enumeration and cover maximum dimensions and negative caps. No LeetCode acceptance is claimed."
  ],
  "sourceTitle": [
    "官方接口 Python 源码",
    "Python source for the official interface"
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
  "copyFail": [
    "剪贴板不可用；请在下方手动复制已选中的完整源码。",
    "Clipboard unavailable; manually copy the selected full source below."
  ],
  "related": [
    "继续连接概念",
    "Connect the ideas"
  ],
  "rel1": [
    "回看行带与基线",
    "Revisit bands and the baseline"
  ],
  "rel2": [
    "回看合法前缀不变量",
    "Revisit the eligible-prefix invariant"
  ],
  "rel3": [
    "区间和计数中的前缀边界",
    "Prefix boundaries in range-sum counting"
  ],
  "foot": [
    "作者自查候选；独立评审待进行。无实际学习者结果或上线声明。",
    "Author self-checked candidate; independent review pending. No learner outcomes or publication claimed."
  ],
  "cellLabel": [
    "第 {r} 行，第 {c} 列：{v}；{mark}",
    "Row {r}, column {c}: {v}; {mark}"
  ],
  "selectedBand": [
    "在所选行带中",
    "inside selected band"
  ],
  "outsideBand": [
    "在所选行带外",
    "outside selected band"
  ],
  "columnValue": [
    "第 {c} 列：{v}",
    "Column {c}: {v}"
  ]
};
