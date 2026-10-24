window.COPY = {
  "docTitle": [
    "354 · 俄罗斯套娃信封问题",
    "354 · Russian Doll Envelopes"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode lessons"
  ],
  "title": [
    "#354 · 俄罗斯套娃信封问题",
    "#354 · Russian Doll Envelopes"
  ],
  "intro": [
    "把 (2,3) 放进 (5,4)，再放进 (6,7)。三只信封如何变成一个可证明、可扩展的算法？",
    "Put (2,3) inside (5,4), then inside (6,7). How do three envelopes lead to an algorithm we can prove and scale?"
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
    "1 · 手算",
    "1 · By hand"
  ],
  "nav1": [
    "2 · 等宽陷阱",
    "2 · Width ties"
  ],
  "nav2": [
    "3 · 最小结尾",
    "3 · Minimal tails"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict"
  ],
  "nav4": [
    "5 · 实现",
    "5 · Implement"
  ],
  "h0": [
    "三只信封能套几层？",
    "How many layers can three envelopes make?"
  ],
  "p0": [
    "这一步要回答：给定宽、高，最多能选多少只依次套入？(w,h) 表示宽 w、高 h。内层的宽和高必须都严格小于外层；相等也不行。可以重新排列，不能旋转。链就是一串相邻两只都能套入的信封。",
    "Given widths and heights, how many envelopes can form a nesting chain? A pair (w,h) means width w and height h. Both dimensions of the inner envelope must be strictly smaller; equality fails. Reordering is allowed, rotation is forbidden. A chain is a sequence in which each envelope fits into the next."
  ],
  "rules": [
    "输入有 1 到 100,000 只信封，每只恰有两个整数，宽、高均为 1 到 100,000。求最大只数，不是总面积，也不是一种具体摆法。",
    "There are 1 to 100,000 envelopes, each with exactly two integers. Widths and heights are 1 to 100,000. Return the maximum count, rather than an area or a particular arrangement."
  ],
  "handTask": [
    "先手算：下面每支箭头是否合法？最多能取几只？展开后逐个比较两个坐标。",
    "Calculate first: is each arrow below legal, and how many envelopes can you take? Reveal to compare both coordinates at each arrow."
  ],
  "handShow": [
    "揭晓手算",
    "Reveal hand calculation"
  ],
  "handHide": [
    "收起手算",
    "Hide hand calculation"
  ],
  "handAnswer": [
    "2 < 5 且 3 < 4；5 < 6 且 4 < 7。因此三只都能用，答案为 3；输入只有三只，不可能更长。",
    "2 < 5 and 3 < 4; then 5 < 6 and 4 < 7. All three fit, so the answer is 3. There are only three envelopes, so no longer chain exists."
  ],
  "h1": [
    "排序后，为什么还会多算？",
    "Why can sorting still overcount?"
  ],
  "p1": [
    "这一步要回答：怎样避免逐一检查所有前驱？先按宽升序排列。定义 dp[i] 为以第 i 只信封结尾的最长链长；检查每个更早的 j，只有宽和高都更小时，才可用 dp[j]+1。没有前驱时为 1。手算例的 dp 依次为 1、2、3。",
    "How can we avoid checking every predecessor? First sort by ascending width. Let dp[i] be the longest chain ending at envelope i. For every earlier j, use dp[j]+1 only if both its dimensions are smaller. With no predecessor, use 1. The hand example gives dp values 1, 2, 3."
  ],
  "baselineCost": [
    "下面是正确基线：O(n²) 时间、O(n) 空间。它逐个检查所有更早的信封，即使大多数比较并不能延长链。n=100,000 时约有 5,000,000,000 对，不能把演示的小输入规模当作正式约束。",
    "This correct baseline uses O(n²) time and O(n) space. It checks all earlier envelopes even when most comparisons cannot extend a chain. At n=100,000 there are about 5,000,000,000 pairs; the tiny teaching input does not represent the submission limit."
  ],
  "reduction": [
    "若宽已经递增，是否只需让高递增？子序列指保持排序后的先后次序、允许跳过元素；LIS 指最长严格递增子序列。手算例的高是 3,4,7，LIS 长度为 3。但宽可能相等！",
    "Once widths are increasing, can we just require increasing heights? A subsequence keeps the sorted order while allowing items to be skipped. LIS means longest strictly increasing subsequence. The hand example has heights 3,4,7 and LIS length 3. But widths can tie!"
  ],
  "wrong": [
    "反例：(2,2),(2,3)。宽、高都升序会得到高 2→3，误算为 2；实际宽相等，最多只能取 1。只按面积排也不够：(2,6),(3,5) 面积递增但互相不能套。",
    "Counterexample: (2,2),(2,3). Sorting both dimensions ascending gives heights 2→3 and a false count of 2. Equal widths mean the real maximum is 1. Area order is also insufficient: (2,6),(3,5) have increasing areas but neither fits inside the other."
  ],
  "proofSort": [
    "修正：宽升序，同宽时高降序。(2,3),(2,2) 的高 3→2 不会被严格递增子序列同时选中。因此任何严格递增的高子序列，其宽也必定严格递增，构成合法链；反过来，任意合法链都能按此排序出现在高子序列中。两边最长长度相等。",
    "Fix: sort widths ascending, and heights descending within equal widths. Heights 3→2 from (2,3),(2,2) cannot both appear in a strictly increasing subsequence. Thus every strictly increasing height subsequence also has strictly increasing widths and is a legal chain. Conversely, any legal chain appears in this sorted order as an increasing height subsequence. Their maximum lengths are equal."
  ],
  "h2": [
    "较小的结尾，保留了什么机会？",
    "What opportunity does a smaller tail preserve?"
  ],
  "p2": [
    "这一步要回答：能否只记每种长度最小的结尾高度？tails[k−1] 表示已处理信封中，长度为 k 的严格递增高子序列能达到的最小末尾高度。下方每格标记长度 k，不是信封编号。更小的结尾更容易被未来的高延长；无需保留所有前驱。",
    "Can we keep only the smallest final height for each length? tails[k−1] is the least attainable final height of a strictly increasing height subsequence of length k among processed envelopes. Each cell below is labeled by length k, not envelope identity. A smaller ending height is easier for a future height to extend, so we need not keep every predecessor."
  ],
  "derive": [
    "在手算例中，处理高 3 后是 [3]；4 大于 3，可以延长为 [3,4]；7 大于 4，得到 [3,4,7]。再看“替换但不拼接”预设：高 3,5,6 后为 [3,5,6]，遇到 2 就变为 [2,5,6]。已有长度 3 的链仍存在；2 只改善长度 1 的结尾。这个数组本身不一定是一条链，因为 2 在 5、6 之后出现。",
    "In the hand example, processing height 3 gives [3]; 4 extends it to [3,4]; 7 extends it to [3,4,7]. Now inspect the “Replace, not splice” preset: after heights 3,5,6, tails is [3,5,6]. Height 2 changes it to [2,5,6]. The existing length-3 chain still exists; 2 only improves the length-1 ending. The tails array itself need not be one chain: 2 arrived after 5 and 6."
  ],
  "invariant": [
    "为什么这样更新正确？tails 按长度严格递增：长度 k+1 的最优子序列，去掉末项后是长度 k 的候选，其结尾更小。对于新高 h，令 p 为首个 tails[p] ≥ h 的下标，若没有则 p=len(tails)。p 左侧全都 < h，所以可把 h 接到长度 p 的子序列后（p=0 时从单只开始）。p 及右侧都 ≥ h，无法形成以 h 结尾的更长子序列。于是只替换 tails[p] 或在末尾追加；其他长度的最小结尾不变。",
    "Why is this update correct? tails strictly increases by length: remove the last item of an optimal length-(k+1) subsequence to obtain a length-k candidate with a smaller ending. For new height h, let p be the first index with tails[p] ≥ h, or len(tails) if none exists. Every entry left of p is < h, so h extends a length-p subsequence (start a singleton if p=0). Entries at p and beyond are ≥ h, so no longer subsequence can end at h. Replace only tails[p], or append at the end; the minimum endings for other lengths stay unchanged."
  ],
  "binary": [
    "这就从空数组归纳出不变量：每步之后，每个长度都保留最小可达结尾。因为 tails 有序，可以用二分查找（每次排除一半候选位置）找首个 ≥ h 的位置，称为 lower bound。必须用 ≥ 而不是 >；重复高只替换，不增加严格递增长度。",
    "Starting from an empty array, this establishes the invariant after every step: keep the least attainable ending for every length. Because tails is sorted, binary search halves the candidate positions to find the first ≥ h, called the lower bound. Use ≥ rather than >: an equal height replaces an entry without increasing a strict subsequence’s length."
  ],
  "traceTask": [
    "实验：先把手算例走到末尾；切换“等宽陷阱”，保持输入不变，只把同宽顺序改成错误的升序，比较最终长度。更改预设或排序会从零重启此实验，不影响后面的预测题。",
    "Experiment: finish the hand example. Choose “Equal-width trap”, keep its input fixed, and change only the tie order to the deliberately wrong ascending order. Compare final lengths. A preset or sort change restarts this experiment from zero and leaves the later prediction alone."
  ],
  "simulation": [
    "这是算法的浏览器模拟，不执行 Python 提交。每帧完成一只信封的二分查找与更新；无省略信封。历史保留前后值及每次二分探测。演示快照的额外存储不属于提交算法空间。",
    "This is a browser simulation, separate from executing the Python submission. Each frame completes one envelope’s binary search and update; no envelopes are skipped. History retains old/new values and every binary probe. Teaching snapshot storage is extra and is not the submission’s space usage."
  ],
  "preset": [
    "输入预设（切换会重启）",
    "Input preset (restarts trace)"
  ],
  "pre0": [
    "手算三只",
    "Three by hand"
  ],
  "pre1": [
    "官方示例 1",
    "Official example 1"
  ],
  "pre2": [
    "等宽陷阱",
    "Equal-width trap"
  ],
  "pre3": [
    "官方示例 2：重复",
    "Official 2: duplicates"
  ],
  "pre4": [
    "替换但不拼接",
    "Replace, not splice"
  ],
  "pre5": [
    "最大尺寸单只",
    "One maximum-sized envelope"
  ],
  "sort": [
    "同宽时的高度顺序",
    "Height order for equal widths"
  ],
  "validSort": [
    "降序：正确规则",
    "Descending: valid rule"
  ],
  "wrongSort": [
    "升序：故意错误",
    "Ascending: deliberately wrong"
  ],
  "inputLabel": [
    "原始输入 (宽,高)",
    "Original input (width,height)"
  ],
  "orderedLabel": [
    "排序后；✓ 已处理，○ 待处理",
    "Sorted; ✓ processed, ○ pending"
  ],
  "legend": [
    "每个方格 = 一个长度的最小结尾高度；顺序列表 = 处理信封的历史。颜色只辅助标记，数字才是数据。",
    "Each cell = minimum ending height for a length; the ordered ledger = envelope processing history. Color supports labels; numbers carry the data."
  ],
  "empty": [
    "尚无结尾：tails = []",
    "No endings yet: tails = []"
  ],
  "tailCell": [
    "长度 {k}：结尾 {v}",
    "Length {k}: ending {v}"
  ],
  "prev": [
    "← 撤回一只",
    "← Undo one envelope"
  ],
  "next": [
    "处理下一只 →",
    "Process next envelope →"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "end": [
    "处理到末尾",
    "Process to end"
  ],
  "progress": [
    "已处理 {k}/{n} 只；当前长度 {len}。",
    "Processed {k}/{n} envelopes; current length {len}."
  ],
  "final": [
    "完成：合法最大套娃数 = {len}。",
    "Complete: maximum legal nesting count = {len}."
  ],
  "inProgress": [
    "尚未完成；当前长度只针对已处理部分。",
    "Not finished; the current length covers only the processed prefix."
  ],
  "warning": [
    "故意错误的排序：显示的是高的 LIS 长度，不能保证是合法套娃数。",
    "Deliberately wrong sorting: this is a height LIS length, not a guaranteed legal nesting count."
  ],
  "logEmpty": [
    "尚未处理任何信封。下一步把第一只的高追加到空数组。",
    "No envelope processed yet. Next appends the first height to the empty array."
  ],
  "log": [
    "第 {i} 只 {pair}：旧 {before} → 新 {after}；p={p}（从 0 起）。{action}",
    "Envelope {i} {pair}: old {before} → new {after}; p={p} (zero-based). {action}"
  ],
  "append": [
    "追加：所有旧结尾都更小。",
    "Append: all old endings are smaller."
  ],
  "replace": [
    "替换：首个 ≥ 当前高度的位置。",
    "Replace: first position ≥ the current height."
  ],
  "probe": [
    "二分探测：范围 [{lo},{hi})，mid={mid}，旧值 {v}，与 h={h} 比较。",
    "Binary probe: range [{lo},{hi}), mid={mid}, old value {v}, compared with h={h}."
  ],
  "noProbe": [
    "旧数组为空，无需探测。",
    "Old array empty; no probe needed."
  ],
  "h3": [
    "新例子：相同宽度会改变你的答案吗？",
    "Fresh case: will a width tie change your answer?"
  ],
  "p3": [
    "这一步要回答：下面四只最多套几只？独立于上方实验。先按宽升序、同宽高降序，再维护 tails（每个长度的最小结尾高）。严格递增不允许相等。先选择，再揭晓。",
    "How many of the four envelopes below can nest? This exercise is independent of the trace. Sort by width ascending, height descending on ties, then maintain tails (the least ending height for each length). Strict increase excludes equality. Choose before revealing."
  ],
  "choose": [
    "预测最大只数",
    "Predict the maximum count"
  ],
  "opt4": [
    "4：四只都能用",
    "4: all four can be used"
  ],
  "opt3": [
    "3：可跳过一只",
    "3: one can be skipped"
  ],
  "opt2": [
    "2：保留 (3,4)，舍弃 (3,2)",
    "2: keep (3,4) and discard (3,2)"
  ],
  "reveal": [
    "验证预测",
    "Check prediction"
  ],
  "waiting": [
    "请选择答案，推导暂不显示。",
    "Choose an answer; the derivation stays hidden."
  ],
  "chosen": [
    "已选择；点击“验证预测”查看推导。",
    "Choice recorded; select “Check prediction” to see the derivation."
  ],
  "correct": [
    "预测正确。",
    "Your prediction is correct."
  ],
  "incorrect": [
    "再看同宽限制与最小结尾的含义。",
    "Recheck the width tie and what minimal endings mean."
  ],
  "answer": [
    "答案为 3。排序后为 (3,4),(3,2),(4,3),(5,5)。tails：[]→[4]→[2]→[2,3]→[2,3,5]。合法链 (3,2)→(4,3)→(5,5)。4 错在把同宽两只也接起来；2 错在保留较高的结尾 4，导致后来的高 3 无法接上。用 2 替换 4 仍保留长度 1，却为 3、5 留下延长的机会。",
    "The answer is 3. Sorted order: (3,4),(3,2),(4,3),(5,5). tails: []→[4]→[2]→[2,3]→[2,3,5]. A legal chain is (3,2)→(4,3)→(5,5). Count 4 illegally joins equal widths. Count 2 keeps the larger ending 4, which cannot extend to the later height 3. Replacing 4 with 2 preserves length 1 and lets heights 3 and 5 extend it."
  ],
  "h4": [
    "把推导写成可提交的 Python",
    "Turn the derivation into submittable Python"
  ],
  "p4": [
    "这一步要回答：图上的更新对应哪一行代码？官方支持 Python3 的 Solution.maxEnvelopes(envelopes)，返回整数。下面是该接口的完整实现，不是模拟器代码。",
    "Which code lines perform the visual update? The official Python3 interface is Solution.maxEnvelopes(envelopes), returning an integer. The complete implementation below uses that interface; it is separate from the simulator."
  ],
  "mapping": [
    "ordered 的键 (e[0], -e[1]) 实现宽升序、同宽高降序。for 逐只读高；bisect_left 返回首个 ≥ height 的零起点位置 pos，恰好对应历史中的 p。pos==len(tails) 时追加，否则替换；len(tails) 就是最长长度。不返回信封链本身。",
    "The ordered key (e[0], -e[1]) sorts width ascending and tied height descending. The loop reads each height. bisect_left returns the zero-based first position ≥ height, exactly p in the ledger. Append if pos==len(tails), otherwise replace. len(tails) is the maximum length; the function does not reconstruct a chain."
  ],
  "cost": [
    "n 为信封数。排序 O(n log n)，每只二分 O(log n)，追加摊销 O(1)、替换 O(1)，总时间 O(n log n)。sorted 创建副本且排序用额外内存，tails 最多 n 项，因此总额外空间 O(n)。输入不被修改。基线为 O(n²) 时间、O(n) 空间。",
    "Let n be the number of envelopes. Sorting costs O(n log n), each binary search O(log n), append amortized O(1), and replacement O(1): total O(n log n) time. sorted makes a copy and sorting needs workspace; tails has at most n entries, so total auxiliary space is O(n). Input is not mutated. The baseline uses O(n²) time and O(n) space."
  ],
  "bounds": [
    "边界：单只返回 1；全重复返回 1；同宽或同高都不能延长；宽增高减只能取 1；宽高全严格递增时返回 n。空输入不在官方约束内（此实现也返回 0）。没有旋转步骤；不能用宽高交换来“修正”输入。",
    "Boundaries: one envelope returns 1; all duplicates return 1; equal width or height cannot extend a chain. Increasing widths with decreasing heights give 1; both strictly increasing give n. Empty input is outside the official constraints (this implementation also returns 0). There is no rotation step; swapping width and height would change the problem."
  ],
  "sourceTitle": [
    "正式 Python 提交源码",
    "Canonical Python submission source"
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
    "无法访问剪贴板。已选中下面的完整源码，请手动复制。",
    "Clipboard unavailable. The complete source below is selected for manual copying."
  ],
  "related": [
    "继续连接这些概念",
    "Connect these ideas"
  ],
  "rel1": [
    "本页：为什么同宽要逆序",
    "#354: why reverse width ties"
  ],
  "rel2": [
    "本页：最小结尾不变量",
    "#354: the minimal-tail invariant"
  ],
  "rel3": [
    "#327：查看另一种有序查找与计数",
    "#327: explore another ordered-search counting problem"
  ],
  "foot": [
    "作者自查候选；独立评审待进行。模拟与离线测试不代表 LeetCode 提交通过，也不代表真实学习者测试。",
    "Author self-checked candidate; independent review pending. Simulation and offline tests do not establish LeetCode acceptance or actual learner results."
  ]
};
