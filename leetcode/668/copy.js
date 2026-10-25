window.LESSON_COPY = {
  "docTitle": [
    "#668 · 乘法表中第 k 小的数",
    "#668 · Kth Smallest Number in Multiplication Table"
  ],
  "title": [
    "#668 · 乘法表中第 k 小的数",
    "#668 · Kth Smallest Number in Multiplication Table"
  ],
  "back": [
    "← LeetCode 知识目录",
    "← LeetCode lessons"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "meta": [
    "算法 · 困难 · Python",
    "ALGORITHMS · HARD · PYTHON"
  ],
  "tagline": [
    "不必写出九亿个格子：先数有多少个格子不大于一个数，再缩小答案范围。",
    "You can select a cell without writing out 900 million products: count cells below a threshold, then narrow the answer range."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "1 · 先数格子",
    "1 · Count cells first"
  ],
  "s1": [
    "2 · 一行贡献多少？",
    "2 · What does one row contribute?"
  ],
  "s2": [
    "3 · 排除一半候选值",
    "3 · Eliminate half the values"
  ],
  "s3": [
    "4 · 先预测，再揭晓",
    "4 · Predict, then reveal"
  ],
  "s4": [
    "5 · 证明与 Python",
    "5 · Proof and Python"
  ],
  "statement": [
    "这一步要回答：3×3 乘法表的第 5 小格子是什么？输入 m、n 是行列数，每个格子的值是行号 i 乘列号 j，行列号都从 1 开始。k 是排序后的名次，从 1 开始；要返回该名次上的值，不是坐标。",
    "What is the fifth smallest cell in a 3×3 multiplication table? Inputs m and n give the row and column counts. The cell in row i, column j contains i×j; both indices start at 1. Input k is a rank starting at 1 in sorted order. Return the value at that rank, rather than its coordinates."
  ],
  "handCaption": [
    "m=3，n=3，k=5。表头是行号 i 与列号 j，内部数字是 i×j。",
    "m=3, n=3, k=5. Headers are row i and column j; each interior number is i×j."
  ],
  "hand": [
    "把九个格子排成一行。前四个是 1、2、2、3，所以第 5 个仍是 3。两处 2 和两处 3 来自不同格子，必须分别占据名次。",
    "Sort all nine cells into a line. The first four are 1, 2, 2, 3, so the fifth is another 3. The two 2s and two 3s come from different positions and each occupies its own rank."
  ],
  "sortedLabel": [
    "排序后的九个格子；框内是第 5 个",
    "Nine sorted cells; the outlined value is fifth"
  ],
  "officialExamples": [
    "官方例 1：(m,n,k)=(3,3,5) → 3。官方例 2：(2,3,6) → 6。约束：1≤m,n≤30000，1≤k≤m×n；没有空表输入。",
    "Official example 1: (m,n,k)=(3,3,5) → 3. Example 2: (2,3,6) → 6. Constraints: 1≤m,n≤30000 and 1≤k≤m×n; empty tables are outside the input contract."
  ],
  "baselineTitle": [
    "可靠的起点：全部生成，再排序",
    "A reliable baseline: generate, then sort"
  ],
  "baseline": [
    "下面的 baseline 返回同一个整数答案。它生成 m×n 个格子，再排序，花费 O(mn log(mn)) 时间与 O(mn) 额外空间。最大输入有 9 亿个格子；即使不排序，逐个存储也太大。我们需要保留名次信息，却避免生成所有值。",
    "The baseline below returns the same integer answer. It generates m×n cells and sorts them, costing O(mn log(mn)) time and O(mn) extra space. At the maximum input there are 900 million cells; even storing them is too much. We need rank information without generating every value."
  ],
  "wrong": [
    "两个诱人的错误：按行直接取第 5 格会得到 4，因为跨行顺序并未排好；去重后得到 [1,2,3,4,6,9]，第 5 个变成 6。丢掉重复值，就改变了问题。",
    "Two tempting mistakes: taking the fifth cell in row order gives 4, because different rows are not globally sorted. Removing duplicates gives [1,2,3,4,6,9], whose fifth item is 6. Deduplication changes the requested rank."
  ],
  "countIntro": [
    "这一步要回答：不排序，能否数出有多少格子不大于 x？x 是试探的整数上限，叫作阈值；C(x) 表示整个表中值 ≤x 的格子数，单位是格子。先固定同一个 3×3 表，取 x=3。",
    "Can we count cells at most x without sorting? A threshold x is an integer upper limit we test. C(x) is the number of cells in the whole table with value ≤x, measured in cells. Keep the same 3×3 table and start with x=3."
  ],
  "countDerive": [
    "第 1 行 1、2、3 全部符合，贡献 3；第 2 行 2、4、6 只取 2，贡献 1；第 3 行 3、6、9 只取 3，贡献 1。因此 C(3)=3+1+1=5。第 i 行从左到右是 i、2i、…、ni；ij≤x 等价于 j≤⌊x/i⌋。⌊ ⌋ 表示向下取整，Python 用 //。一行最多只有 n 格，所以贡献是 min(n, x//i)。",
    "Row 1 has 1, 2, 3: all three qualify. Row 2 has 2, 4, 6: only 2 qualifies. Row 3 has 3, 6, 9: only 3 qualifies. Thus C(3)=3+1+1=5. Row i contains i, 2i, …, ni in increasing order; ij≤x means j≤⌊x/i⌋. The floor brackets mean round down, written // in Python. A row has at most n cells, so its contribution is min(n, x//i)."
  ],
  "formula": [
    "C(x) = Σᵢ₌₁ᵐ min(n, ⌊x/i⌋)",
    "C(x) = Σᵢ₌₁ᵐ min(n, ⌊x/i⌋)"
  ],
  "formulaExplain": [
    "Σ 表示把 i=1 到 m 的每行贡献相加。m、n 是行列数，x 是阈值；每个格子只属于一行，重复值自然分别计数。",
    "Σ means add the contributions for rows i=1 through m. Here m and n are the dimensions and x is the threshold. Each cell belongs to exactly one row, so equal values are naturally counted separately."
  ],
  "countTask": [
    "实验：保持 3×3 不变，将 x 从 3 调到 4、再调到 5。观察带 ≤ 标记的格子与逐行贡献：C(4)=C(5)，说明阈值不必出现在表中。下方完整计数表用来对比变化；此实验独立于下一步。",
    "Experiment: keep the 3×3 table fixed and move x from 3 to 4, then 5. Watch the cells marked ≤ and the row contributions: C(4)=C(5), so a tested threshold need not occur in the table. The complete count ledger below lets you compare changes. This experiment is independent of the next one."
  ],
  "thresholdLabel": [
    "阈值 x（1…9）",
    "Threshold x (1…9)"
  ],
  "matrixCaption": [
    "3×3 表，≤ 标记表示该格的值不大于 x={x}",
    "3×3 table; ≤ marks a cell whose value is at most x={x}"
  ],
  "rowContribution": [
    "第 {i} 行：{count} 格",
    "Row {i}: {count} cells"
  ],
  "totalCount": [
    "当前 x={x}；C({x})={parts}={count} 格。",
    "Current x={x}; C({x})={parts}={count} cells."
  ],
  "countLedger": [
    "固定 3×3 表的阈值计数对照",
    "Threshold counts for the fixed 3×3 table"
  ],
  "thresholdHeading": [
    "阈值 x",
    "Threshold x"
  ],
  "countHeading": [
    "C(x)（格）",
    "C(x) (cells)"
  ],
  "labIntro": [
    "这一步要回答：知道 C(x)（值≤x 的格子数），能排除哪些答案？在 3×3、k=5 中，C(2)=3，只有 3 格 ≤2，所以第 5 格一定大于 2；C(3)=5，已有 5 格 ≤3，所以答案至多是 3。",
    "Which answers can we exclude using C(x), the number of cells with value ≤x? For 3×3 and k=5, C(2)=3: only three cells are ≤2, so the fifth must exceed 2. But C(3)=5: five cells are already ≤3, so the answer is at most 3."
  ],
  "monotone": [
    "把 x 增大，原来符合的格子不会消失，这叫单调不减。因而答案就是第一个满足 C(x)≥k 的整数 x。不能要求 C(x)=k：同一个 3×3 表若取 k=4，C(2)=3 而 C(3)=5，计数直接跳过 4，但第 4 格仍是 3。",
    "Increasing x never removes a qualifying cell: C is nondecreasing. The answer is therefore the first integer x with C(x)≥k. Requiring C(x)=k fails: in the same 3×3 table with k=4, C(2)=3 and C(3)=5. The count skips 4, yet the fourth cell is still 3."
  ],
  "derive": [
    "让 lo、hi 表示包含答案的闭区间端点（两端都包括），mid=⌊(lo+hi)/2⌋。若 C(mid)<k，则 mid 及更小值都不够，令 lo=mid+1；若 C(mid)≥k，则 mid 可能恰好是答案，令 hi=mid，不能用 mid−1。默认首轮 [1,9] 测 mid=5，C(5)=3+2+1=6，留下 [1,5]；下一轮测 3，C(3)=5，留下 [1,3]。 这种每轮把候选数值范围缩小约一半的方法，叫作答案二分。",
    "Let lo and hi bound an inclusive interval containing the answer, and mid=⌊(lo+hi)/2⌋. If C(mid)<k, mid and every smaller value are insufficient: set lo=mid+1. If C(mid)≥k, mid could be the answer: set hi=mid, rather than mid−1. The default first round tests mid=5 in [1,9]; C(5)=3+2+1=6, leaving [1,5]. The next round tests 3; C(3)=5, leaving [1,3]. This halving of the candidate value range is binary search on the answer."
  ],
  "invariant": [
    "从观察得到不变量（每轮后仍成立的事实）：C(lo−1)<k≤C(hi)。lo 左侧全部不够，hi 已经够，因此第一个够的值仍在 [lo,hi]。初始 lo=1、hi=m×n，因为 C(0)=0、C(m×n)=m×n。",
    "These observations give an invariant, a fact kept after every round: C(lo−1)<k≤C(hi). Every value left of lo is insufficient, while hi is sufficient, so the first sufficient value remains in [lo,hi]. Initially lo=1 and hi=m×n, since C(0)=0 and C(m×n)=m×n."
  ],
  "simulation": [
    "下方是 JavaScript 教学模拟，不是在浏览器执行 Python 提交。每帧完成一次完整计数与区间更新；初始帧尚未计数。格子标记始终对应“刚测试的 mid”，更新后的区间另行标注。没有跳过轮次。",
    "This is a JavaScript teaching simulation, not execution of the Python submission in the browser. Each frame completes one full count and interval update; the initial frame has not counted yet. Cell marks refer to the just-tested mid, while the updated interval is labeled separately. No rounds are omitted."
  ],
  "experiment": [
    "操作：保持预设不变，点“完成一轮计数”，看旧区间如何变成新区间，并在历史表对比每轮保留下来的范围。点“退回一轮”应还原所有值。换预设会重启此实验，计数滑块和预测题不受影响。",
    "Keep a preset fixed and choose “Complete one count round.” Compare the old interval with the new one, then compare retained ranges in the history. “Back one round” restores every value. Changing the preset restarts this experiment; the threshold slider and prediction stay unchanged."
  ],
  "presets": [
    "预设（切换会重启）",
    "Preset (changing restarts)"
  ],
  "p0": [
    "3×3 · k=5 · 官方例 1",
    "3×3 · k=5 · Example 1"
  ],
  "p1": [
    "2×3 · k=6 · 官方例 2",
    "2×3 · k=6 · Example 2"
  ],
  "p2": [
    "3×3 · k=4 · 跳过等号",
    "3×3 · k=4 · Skipped count"
  ],
  "p3": [
    "1×7 · k=4 · 单行",
    "1×7 · k=4 · One row"
  ],
  "p4": [
    "1×1 · k=1 · 已收敛",
    "1×1 · k=1 · Already done"
  ],
  "p5": [
    "4×5 · k=1 · 最小名次",
    "4×5 · k=1 · First rank"
  ],
  "prev": [
    "退回一轮",
    "Back one round"
  ],
  "next": [
    "完成一轮计数",
    "Complete one count round"
  ],
  "reset": [
    "重置此实验",
    "Reset this experiment"
  ],
  "end": [
    "跳到收敛",
    "Jump to convergence"
  ],
  "position": [
    "已完成的计数轮次",
    "Completed count rounds"
  ],
  "progress": [
    "m={m}，n={n}，k={k} · 已完成 {i}/{total} 轮",
    "m={m}, n={n}, k={k} · {i}/{total} rounds completed"
  ],
  "intervalLabel": [
    "当前答案区间（初始或更新后）",
    "Current interval (initial or updated)"
  ],
  "testLabel": [
    "刚测试的 mid 与 C(mid)",
    "Just-tested mid and C(mid)"
  ],
  "noTest": [
    "尚未测试",
    "No test yet"
  ],
  "initial": [
    "初始状态：[1,{hi}]。C(0)=0<k，C({hi})={hi}≥k。lo<hi 时，完成一轮会先数 mid 再更新边界。",
    "Initial state: [1,{hi}]. C(0)=0<k and C({hi})={hi}≥k. When lo<hi, completing a round counts at mid and then updates a bound."
  ],
  "enough": [
    "刚完成：旧区间 [{beforeLo},{beforeHi}]，mid={mid}，C(mid)={count}≥k={k}。mid 已够，保留 mid 并令 hi={mid}；新区间 [{lo},{hi}]。",
    "Completed: old interval [{beforeLo},{beforeHi}], mid={mid}, C(mid)={count}≥k={k}. mid is sufficient; keep it and set hi={mid}. New interval: [{lo},{hi}]."
  ],
  "few": [
    "刚完成：旧区间 [{beforeLo},{beforeHi}]，mid={mid}，C(mid)={count}<k={k}。mid 还不够，排除它与更小值，令 lo={lo}；新区间 [{lo},{hi}]。",
    "Completed: old interval [{beforeLo},{beforeHi}], mid={mid}, C(mid)={count}<k={k}. Exclude mid and every smaller value; set lo={lo}. New interval: [{lo},{hi}]."
  ],
  "terminal": [
    "已收敛：lo=hi={lo}，最终答案是 {lo}。",
    "Converged: lo=hi={lo}; the final answer is {lo}."
  ],
  "labMatrix": [
    "{m}×{n} 表；≤ 表示值不大于刚测试的 mid={mid}",
    "{m}×{n} table; ≤ marks values at most the just-tested mid={mid}"
  ],
  "initialMatrix": [
    "{m}×{n} 表；尚未测试，不标记计数格子",
    "{m}×{n} table; no test yet, so no counted cells are marked"
  ],
  "rowHeader": [
    "行 i / 列 j",
    "Row i / col j"
  ],
  "history": [
    "完整历史：每行是一轮完成后的边界",
    "Complete history: bounds after each completed round"
  ],
  "round": [
    "轮次",
    "Round"
  ],
  "before": [
    "旧 [lo,hi]",
    "Old [lo,hi]"
  ],
  "test": [
    "mid → C(mid)",
    "mid → C(mid)"
  ],
  "after": [
    "新 [lo,hi]",
    "New [lo,hi]"
  ],
  "rule": [
    "更新原因",
    "Reason"
  ],
  "keep": [
    "够：hi=mid",
    "Enough: hi=mid"
  ],
  "exclude": [
    "不足：lo=mid+1",
    "Too few: lo=mid+1"
  ],
  "emptyHistory": [
    "还没有完成的轮次。",
    "No completed rounds yet."
  ],
  "scrollHistory": [
    "历史表可横向滚动；键盘聚焦后用左右方向键。",
    "History scrolls horizontally; focus it and use the left/right arrow keys."
  ],
  "scrollMatrix": [
    "乘法表，可横向滚动",
    "Multiplication table, horizontally scrollable"
  ],
  "quiz": [
    "新场景：3×4 表，k=7。当前 lo=1、hi=12，测试 mid=6。C(x) 是值≤x 的格子数；不变量是 C(lo−1)<k≤C(hi)。这一轮应怎样更新？先数每行，再选答案。",
    "Fresh case: a 3×4 table, k=7. With lo=1 and hi=12, test mid=6. C(x) counts cells with value ≤x; the invariant is C(lo−1)<k≤C(hi). How should this round update the bounds? Count each row before choosing."
  ],
  "option0": [
    "A · C(6)=7，直接返回 6",
    "A · C(6)=7; return 6 immediately"
  ],
  "option1": [
    "B · C(6)=9，令 lo=7",
    "B · C(6)=9; set lo=7"
  ],
  "option2": [
    "C · C(6)=9，令 hi=6",
    "C · C(6)=9; set hi=6"
  ],
  "reveal": [
    "核对这轮更新",
    "Check this update"
  ],
  "correct": [
    "判断正确。",
    "Correct."
  ],
  "incorrect": [
    "再对照逐行贡献与不变量。",
    "Compare the row contributions and invariant again."
  ],
  "answer": [
    "第 1 行最多 4 格：min(4,6)=4；第 2 行取 2、4、6，共 3 格；第 3 行取 3、6，共 2 格。因此 C(6)=4+3+2=9≥7，应令 hi=6，留下 [1,6]。A 的格子总数错误，也把“够了”误当成最终答案；B 把方向反了，会排除答案。不变量仍成立：C(0)=0<7≤C(6)=9。重复值使计数可以超过 k；此刻还不能返回 mid。",
    "Row 1 has at most four cells: min(4,6)=4. Row 2 contributes 2, 4, 6: three cells. Row 3 contributes 3, 6: two cells. So C(6)=4+3+2=9≥7; set hi=6, leaving [1,6]. A gives the wrong cell count and mistakes sufficiency for a final answer. B reverses the direction and discards the answer. The invariant still holds: C(0)=0<7≤C(6)=9. Duplicates can make the count exceed k; we cannot return mid yet."
  ],
  "proof": [
    "这一步要回答：为何最终返回 lo 一定正确？C(x) 数全表中值≤x 的格子。不变量 C(lo−1)<k≤C(hi) 意味着第一个够的值在闭区间 [lo,hi]。不足时 mid 及其左侧都不足；足够时 mid 右侧不再需要，但 mid 本身要保留。lo<hi 时 mid<hi，两种更新都严格缩短区间。最终 lo=hi，C(lo−1)<k≤C(lo)，所以第 k 格的值恰是 lo；若 lo 没有出现在表里，计数不会在此增加，与这两个不等式矛盾。",
    "Why must returning lo be correct? C(x) counts cells in the whole table with value ≤x. The invariant C(lo−1)<k≤C(hi) places the first sufficient value in [lo,hi]. An insufficient mid and all smaller values can be discarded. A sufficient mid makes larger values unnecessary, but mid itself must remain. When lo<hi, mid<hi, so both updates strictly shorten the interval. At termination lo=hi and C(lo−1)<k≤C(lo), making lo exactly the kth cell value. If lo were absent from the table, the count could not increase there, contradicting these inequalities."
  ],
  "map1": [
    "for i … count += min(n, mid // i) 对应图中每行 ≤ 标记的格数。默认第二轮 mid=3，贡献 3、1、1，总数 5。",
    "The for i loop and count += min(n, mid // i) count the ≤ marks in each row. In the default second round, mid=3 gives row contributions 3, 1, 1, totaling 5."
  ],
  "map2": [
    "if count >= k: hi = mid 对应 [1,5] → [1,3]；else: lo = mid + 1 对应不足时排除 mid。开始的交换只利用乘法对称性，让 m 成为较短维度；不改变各数值及其出现次数。",
    "if count >= k: hi = mid maps [1,5] → [1,3]; the else branch excludes mid when too few cells qualify. The initial swap uses multiplication symmetry to make m the shorter dimension; it preserves every cell value and how many times it occurs."
  ],
  "cost": [
    "提交成本：每轮扫描 min(m,n) 行，最多 O(log(mn)) 轮，时间 O(min(m,n) log(mn))，额外空间 O(1)。按整数运算单位成本计；官方最大乘积仅 9×10⁸。教学模拟额外保存完整历史与小表，这些不是提交代码的空间。",
    "Submission cost: each round scans min(m,n) rows, for O(log(mn)) rounds, giving O(min(m,n) log(mn)) time and O(1) auxiliary space. This uses unit-cost integer arithmetic; the official maximum product is only 9×10⁸. The teaching simulation additionally stores history and small grids; that storage is not part of the submission."
  ],
  "boundaries": [
    "边界：1×1 初始就有 lo=hi=1，无须一轮；k=1 返回 1；k=m×n 返回 m×n；单行时第 k 个就是 k。长方形仍按行计数，min(n,…) 防止超过行宽；重复值无需特殊分支。只处理官方允许的正整数，无需约定无效 k 的返回值。",
    "Boundaries: a 1×1 table starts with lo=hi=1 and needs no round. Rank 1 returns 1; rank m×n returns m×n; in a single row the kth value is k. Rectangles still use row counts, with min(n,…) clipping to the row width. Duplicates require no special branch. The official contract supplies positive valid inputs, so no invalid-k return value is needed."
  ],
  "verify": [
    "独立检查方法：小表全部生成并排序，逐个 k 对比提交答案；另外逐格数出 C(mid)，检查每一轮不变量与区间缩短。作者测试不是独立评审，也不是 LeetCode 已通过的提交记录。",
    "Independent checking method: generate and sort small tables, then compare the submission for every k. Separately count cells at each mid and verify the invariant and shrinking range after every round. Author tests are neither an independent lesson review nor a LeetCode acceptance record."
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
    "查看完整 Python 提交代码",
    "View the complete Python submission"
  ],
  "copied": [
    "已复制完整源代码。",
    "Full source copied."
  ],
  "fallback": [
    "剪贴板不可用；完整代码已选中，请手动复制。",
    "Clipboard unavailable; the full source is selected for manual copying."
  ],
  "manualLabel": [
    "手动复制完整 Python 代码",
    "Manually copy the full Python source"
  ],
  "related": [
    "继续理解边界",
    "Explore related boundaries"
  ],
  "related0": [
    "#410 · 用可行性计数缩小答案范围",
    "#410 · Narrow an answer range with feasibility"
  ],
  "related1": [
    "#4 · 用边界比较定位有序数组的中位数",
    "#4 · Locate a median using boundary comparisons"
  ],
  "foot": [
    "本页为可复现的教学模拟与作者自查候选。独立教学评审待完成；未声称真实学习效果或官方提交通过。",
    "A reproducible teaching simulation and author-checked candidate. Independent teaching review is pending; no learner outcomes or official submission acceptance are claimed."
  ]
};
