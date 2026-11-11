window.LESSON_COPY = {
  "docTitle": [
    "#798 · 得分最高的最小轮调",
    "#798 · Smallest Rotation with Highest Score"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "title": [
    "#798 · 得分最高的最小轮调",
    "#798 · Smallest Rotation with Highest Score"
  ],
  "intro": [
    "把 [1,0,2] 的第一个数移到末尾：[0,2,1]。三个位置中有几个能得分？从这张小账单开始。",
    "Move the first entry of [1,0,2] to the end: [0,2,1]. How many of its three positions earn a point? Start with this tiny ledger."
  ],
  "constraints": [
    "输入长度 n 为 1 到 100000；每个整数满足 0 ≤ nums[i] < n。返回最高分对应的最小 k，而不是分数。",
    "Input length n is 1 to 100000; each integer satisfies 0 ≤ nums[i] < n. Return the smallest k attaining the highest score, rather than the score."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "nav0": [
    "01 手算",
    "01 Score"
  ],
  "nav1": [
    "02 基线",
    "02 Baseline"
  ],
  "nav2": [
    "03 失分区间",
    "03 Losing intervals"
  ],
  "nav3": [
    "04 扫描与预测",
    "04 Scan & predict"
  ],
  "nav4": [
    "05 实现",
    "05 Implement"
  ],
  "s0t": [
    "哪些数获得一分？",
    "Which entries earn a point?"
  ],
  "s0e": [
    "这一步要回答：左移 k 位后，分数如何算？左移指把前 k 个数放到末尾；下标从 0 开始。每个值 ≤ 它的新下标时得 1 分，否则得 0 分。保持数组不变，逐次增加 k，核对下面每一项比较；等于也得分。",
    "How do we score a left rotation by k? A left rotation moves the first k entries to the end; indices start at 0. Each value earns 1 point if it is at most its new index, otherwise 0. Keep the input fixed, increase k, and check every comparison below; equality earns a point too."
  ],
  "presetLabel": [
    "共享输入（更换会重置轮调、所选元素和扫描）",
    "Shared input (changing resets rotation, selected entry and scan)"
  ],
  "sim": [
    "教学模拟：下表由浏览器数值模型生成，不是运行 Python 提交代码。第 1、3、4 节共享输入。",
    "Teaching simulation: the browser model generates these tables; it does not execute the Python submission. Sections 1, 3 and 4 share the input."
  ],
  "prev": [
    "上一个 k",
    "Previous k"
  ],
  "next": [
    "检查下一个 k",
    "Inspect next k"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "end": [
    "到最后一个 k",
    "Go to last k"
  ],
  "handRead": [
    "当前 k={k}；轮调后 [{a}]；得分 {score}。下方历史只列已检查的轮调。",
    "Current k={k}; rotated [{a}]; score {score}. History below contains only rotations inspected so far."
  ],
  "position": [
    "新下标",
    "New index"
  ],
  "value": [
    "值",
    "Value"
  ],
  "point": [
    "所得分",
    "Points earned"
  ],
  "history": [
    "已检查的轮调历史（k : 分数）",
    "Inspected rotation history (k : score)"
  ],
  "s1t": [
    "为什么逐个轮调打分太贵？",
    "Why is scoring every rotation expensive?"
  ],
  "s1e": [
    "这一步要回答：直接做会重复多少工作？长度为 n 的数组有 n 个不同的轮调 k=0…n−1。基线逐个检查 n 个值，做 n² 次比较；n=100000 时是 100 亿次。它正确且适合小输入核对，但不适合最大输入。以下通过下标访问，不复制数组，额外空间 O(1)，时间 O(n²)。",
    "How much work does the direct method repeat? An array of length n has n distinct rotations k=0…n−1. The baseline checks n values for each, making n² comparisons: 10 billion at n=100000. It is correct and useful for checking small inputs. Direct indexing below avoids array copies: O(1) extra space and O(n²) time."
  ],
  "baseSource": [
    "独立基线 Python",
    "Independent baseline Python"
  ],
  "wrong": [
    "诱人的错误：分数一旦不再上升就停止。[2,3,1,4,0]（官方例 1）的分数为 2、3、3、4、3；在 k=2 的平台停下会漏掉 k=3 的 4 分。另一个错误是遇到相同最优分也覆盖答案：[1,3,0,2,4]（官方例 2）每次都是 3 分，答案仍须是 0。",
    "Tempting mistake: stop as soon as the score stops rising. [2,3,1,4,0] (official example 1) scores 2,3,3,4,3; stopping at the plateau k=2 misses score 4 at k=3. Also, replacing the answer on an equal best score breaks ties: [1,3,0,2,4] (official example 2) always scores 3, yet its answer must be 0."
  ],
  "s2t": [
    "一个值在哪些轮调中失分？",
    "When does one value lose its point?"
  ],
  "s2e": [
    "这一步要回答：能否一次找出一个值的所有失分轮调？原下标 i 的值 v 在左移 k 后到达 j=(i−k+n)%n；%n 表示绕回 0…n−1。失分就是 j<v，即 j 只能是 0…v−1。当 j=0 时 k=i；继续左移，j 变为 n−1，又开始得分。反过来枚举 j=v−1 到 0，失分的 k 就从 i−v+1 到 i（按圆环绕回）。",
    "Can we locate all losing rotations for one value at once? Value v originally at index i moves to j=(i−k+n)%n after rotation k; %n wraps into 0…n−1. It loses exactly when j<v, so j is one of 0…v−1. At j=0, k=i; one more left shift wraps j to n−1 and it scores again. Reading j from v−1 down to 0 gives losing k from i−v+1 through i, wrapping around the circle."
  ],
  "derive": [
    "先核对 [1,0,2]：i=2,v=2 在 k=1 时到下标 1，在 k=2 时到下标 0，两次都失分；k=0 时下标 2，等于 v，得分。v=0 时没有小于 0 的下标，因此不应添加任何区间。",
    "Check [1,0,2] first: i=2,v=2 lands at index 1 for k=1 and index 0 for k=2, losing both times. At k=0 its index is 2, equal to v, so it scores. For v=0 no index is below 0, so add no interval."
  ],
  "intervalRule": [
    "v>0：l=(i−v+1+n)%n，r=i。l≤r 时用闭区间 [l,r]；否则拆成 [l,n−1] 和 [0,r]。闭区间包括两端。",
    "For v>0: l=(i−v+1+n)%n, r=i. If l≤r use inclusive interval [l,r]; otherwise split into [l,n−1] and [0,r]. Inclusive means both endpoints count."
  ],
  "itemLabel": [
    "选择原下标 i（只改变观察对象）",
    "Select original index i (changes only the inspected entry)"
  ],
  "itemRead": [
    "原下标 i={i}，值 v={v}；失分闭区间：{ranges}。",
    "Original index i={i}, value v={v}; inclusive losing intervals: {ranges}."
  ],
  "none": [
    "无",
    "none"
  ],
  "maskHint": [
    "横向按轮调 k 排列。每格显示该值的新下标 j、所得分；“失分”表示 j<v。切到官方例 1 的 i=0，观察区间跨越末尾。",
    "Cells run across rotation k. Each shows this value’s new index j and points; “loses” means j<v. Select i=0 in official example 1 to see an interval crossing the end."
  ],
  "maskCell": [
    "k={k} · j={j} · {p} 分 · {state}",
    "k={k} · j={j} · {p} pt · {state}"
  ],
  "loses": [
    "失分",
    "loses"
  ],
  "scores": [
    "得分",
    "scores"
  ],
  "eventsExplain": [
    "怎样避免遍历整个区间？差分数组 diff 只记录失分人数的变化：每段 [l,r] 在 diff[l] 加 1，在 diff[r+1] 减 1。起点开始计入，过了终点就移除。下面是所有元素合并后的事件；diff[n] 是结束哨兵，不是合法轮调。只求端点后仍逐格加 1 依然可能是 O(n²)。",
    "How do we avoid visiting every rotation in an interval? A difference array diff stores changes in the number of losing entries: for each [l,r], add 1 at diff[l] and subtract 1 at diff[r+1]. Count it at its start and remove it just past its end. Below are events combined across all entries; diff[n] is an end sentinel, not a valid rotation. Finding endpoints but incrementing every covered cell can still cost O(n²)."
  ],
  "events": [
    "所有元素的合并 diff（下标 : 变化量）",
    "Combined diff for all entries (index : change)"
  ],
  "s3t": [
    "怎样用事件恢复每个轮调的分数？",
    "How do events recover every score?"
  ],
  "s3e": [
    "这一步要回答：扫描到 k 时，哪些失分区间仍有效？前缀和就是从 0 到 k 的 diff 之和。每个覆盖 k 的闭区间已经贡献 +1，而它的 −1 尚未发生；不覆盖 k 的区间要么未开始，要么已抵消。因此 bad 等于该轮调失分的元素数，分数就是 n−bad。这是不变量：每次处理完 diff[k] 后，这个等式仍成立。",
    "Which losing intervals are active at rotation k? The prefix sum adds diff from 0 through k. Every interval covering k has contributed +1 but has not yet contributed −1. Other intervals have either not started or have canceled out. Thus bad equals the number of losing entries, and score is n−bad. This is the invariant: after processing diff[k], that equality holds."
  ],
  "scanTask": [
    "固定输入，逐步应用 diff[k]，看 bad 如何变化。账本每行表示处理完该 k；最优只覆盖已扫描的轮调，尚未扫描的最终答案不会提前出现。",
    "Keep the input fixed and apply diff[k] one at a time. Watch bad change. Each ledger row is after processing that k; best-so-far covers only scanned rotations, and the final answer stays hidden until the scan ends."
  ],
  "scanNext": [
    "应用下一个 diff[k]",
    "Apply next diff[k]"
  ],
  "scanEnd": [
    "完成扫描",
    "Complete scan"
  ],
  "scanPrev": [
    "撤回一次扫描",
    "Undo one scan"
  ],
  "scanStart": [
    "已处理 0/{n} 个轮调；bad=0；尚无候选答案。",
    "Processed 0/{n} rotations; bad=0; no candidate answer yet."
  ],
  "scanRead": [
    "已处理 {done}/{n} 个轮调；当前 k={k}：bad={bad}，分数={score}；已扫描最优 k={answer}，分数={best}。",
    "Processed {done}/{n} rotations; current k={k}: bad={bad}, score={score}; best scanned k={answer}, score={best}."
  ],
  "final": [
    "扫描完成：返回 k={answer}。相同分数不替换更早答案。",
    "Scan complete: return k={answer}. Equal scores never replace an earlier answer."
  ],
  "k": [
    "轮调 k",
    "k"
  ],
  "event": [
    "diff[k]",
    "diff[k]"
  ],
  "bad": [
    "失分 bad",
    "bad"
  ],
  "score": [
    "得分",
    "score"
  ],
  "best": [
    "最优 k",
    "best k"
  ],
  "quizTitle": [
    "迁移练习：先预测，再揭晓",
    "Transfer: predict before revealing"
  ],
  "quizPrompt": [
    "独立新场景：n=5，原下标 i=0 的值 v=3。只考虑这个值，它在哪些 k 失分？用 j<3 或圆环区间推导；不要把 k 当成新下标。",
    "Fresh independent case: n=5, value v=3 at original index i=0. Considering only this value, at which k does it lose? Use j<3 or the circular interval; k is not the new index."
  ],
  "legend": [
    "选择失分的 k 集合",
    "Choose the losing k set"
  ],
  "option0": [
    "{0,1,2}",
    "{0,1,2}"
  ],
  "option1": [
    "{0,3,4}",
    "{0,3,4}"
  ],
  "option2": [
    "{3,4}",
    "{3,4}"
  ],
  "reveal": [
    "核对并揭晓",
    "Check and reveal"
  ],
  "await": [
    "先选择，再揭晓；更改选项会清除旧反馈。",
    "Choose before revealing; changing an option clears old feedback."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还不对。",
    "Not quite."
  ],
  "quizAnswer": [
    "l=(0−3+1+5)%5=3，r=0，所以拆成 [3,4] 与 [0,0]：{0,3,4}。k=0,1,2,3,4 的新下标依次为 0,4,3,2,1；只有 0,2,1 小于 3。{0,1,2} 混淆了新下标与轮调；{3,4} 漏掉跨越边界的 k=0。",
    "l=(0−3+1+5)%5=3, r=0, so split into [3,4] and [0,0]: {0,3,4}. For k=0,1,2,3,4 the new indices are 0,4,3,2,1; only 0,2,1 are below 3. {0,1,2} confuses new indices with rotations; {3,4} misses k=0 across the boundary."
  ],
  "s4t": [
    "把不变量写成可提交的 Python",
    "Turn the invariant into submittable Python"
  ],
  "s4e": [
    "这一步要回答：代码的每一段维护什么？官方 Python3 接口是 Solution.bestRotation(self, nums: list[int]) -> int。输入是整数列表，返回最小最优轮调下标，不改变输入。",
    "What does each part of the implementation maintain? The official Python3 interface is Solution.bestRotation(self, nums: list[int]) -> int. It takes a list of integers, returns the smallest optimal rotation index, and leaves the input unchanged."
  ],
  "map1": [
    "for i,value 与 left/right：找每个值的失分圆环；value==0 跳过。add 的两次写入对应区间开始和结束。",
    "for i,value and left/right locate each value’s losing arc; value==0 skips it. The two writes in add mark its start and end."
  ],
  "map2": [
    "bad += diff[k] 维护有效区间数；最小化 bad 等价于最大化 n−bad。least_bad 初始为 n+1，保证 k=0 会建立候选。",
    "bad += diff[k] maintains the active interval count. Minimizing bad maximizes n−bad. Initial least_bad=n+1 ensures k=0 establishes a candidate."
  ],
  "map3": [
    "按 k 递增扫描，只在 bad 严格变小时更新 answer；因此相同最优分保留最小 k。每个区间的加入与移除证明 bad 正确，穷举所有合法 k 则保证全局最优。",
    "Scan k in increasing order and update answer only when bad strictly decreases, preserving the smallest tied k. Interval starts and ends prove bad is correct; visiting all legal k proves global optimality."
  ],
  "cost": [
    "n 是输入长度。每个值最多两段、每段两次写入，随后扫描 n 次：提交代码 O(n) 时间、O(n) 额外空间。不构造轮调数组。教学表格为 tiny 预设保留完整历史，最多 O(n²) 展示数据，不代表提交的内存。",
    "Here n is the input length. Each entry produces at most two intervals with two writes each, followed by n scan steps: O(n) time and O(n) extra space for the submission. It constructs no rotated arrays. Teaching tables retain full history for tiny presets, using up to O(n²) display data; that is separate from submission memory."
  ],
  "bounds": [
    "边界：n=1 只能是 [0]，返回 0；全零时每个 k 都得 n 分，返回 0；v=n−1 只有新下标 n−1 得分。官方两例分别返回 3 与 0。输入为空或值越界不在官方合同内。",
    "Boundaries: n=1 permits only [0] and returns 0; all zeros score n for every k and return 0; v=n−1 scores only at new index n−1. Official examples return 3 and 0. Empty arrays and out-of-range values are outside the official contract."
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
    "查看完整 Python 提交代码",
    "View complete Python submission"
  ],
  "copying": [
    "正在复制…",
    "Copying…"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用；源码已全选，请使用系统复制快捷键。",
    "Automatic copy unavailable; full source selected. Use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整源码",
    "Manually copy the complete source"
  ],
  "related1": [
    "#689：同分时保留更早候选",
    "#689: preserve the earlier candidate on ties"
  ],
  "related2": [
    "#732：用端点事件计数重叠区间",
    "#732: count overlapping intervals with endpoint events"
  ]
};
