window.COPY = {
  "docTitle": [
    "#828 · 统计所有子串中的唯一字符",
    "#828 · Count Unique Characters of All Substrings of a Given String"
  ],
  "title": [
    "#828 · 统计所有子串中的唯一字符",
    "#828 · Count Unique Characters of All Substrings of a Given String"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "intro": [
    "在 ABA 中，A 出现两次，因此整个 ABA 只有 B 是唯一字符。把每个连续片段都这样计数，再相加。",
    "In ABA, A appears twice, so only B is unique in the whole string. Count this way for every contiguous piece, then add."
  ],
  "nav0": [
    "1 · 手算",
    "1 · Count by hand"
  ],
  "nav1": [
    "2 · 基线",
    "2 · Baseline"
  ],
  "nav2": [
    "3 · 位置贡献",
    "3 · Contributions"
  ],
  "nav3": [
    "4 · 预测",
    "4 · Predict"
  ],
  "nav4": [
    "5 · Python",
    "5 · Python"
  ],
  "s0t": [
    "ABA 的答案为什么是 8？",
    "Why does ABA give 8?"
  ],
  "s0e": [
    "这一步要回答：每个子串贡献多少？子串是原串的一段连续位置；唯一字符指在这一段中恰好出现一次的字母。点选下方六个子串，检查字母频次。两个 A 虽然内容相同，位置不同，必须分别计入。",
    "How much does each substring contribute? A substring is a contiguous range of positions. A unique character occurs exactly once in that range. Select each of the six substrings below and check its frequencies. The two A substrings have equal text but different positions, so both count."
  ],
  "contract": [
    "输入为 1 到 100,000 个大写英文字母。求所有位置子串的唯一字符数之和；答案保证适合 32 位整数，不取模。官方例子：ABC → 10，ABA → 8，LEETCODE → 92。",
    "Input contains 1 to 100,000 uppercase English letters. Sum the unique-character counts of all positional substrings. The answer fits a 32-bit integer; there is no modulus. Official examples: ABC → 10, ABA → 8, LEETCODE → 92."
  ],
  "handTask": [
    "保持 ABA 不变，点选各片段，比较 ABA 与 AB；看下方计数。六项之和：1 + 2 + 1 + 1 + 2 + 1 = 8。",
    "Keep ABA fixed. Select the pieces and compare ABA with AB using the count below. All six scores sum to 1 + 2 + 1 + 1 + 2 + 1 = 8."
  ],
  "handLabel": [
    "子串 [{l},{r}]：{s}，唯一字符数 {v}",
    "Substring [{l},{r}]: {s}, unique-character count {v}"
  ],
  "handRead": [
    "范围 [{l},{r}]，文本 {s}；频次 {counts}；恰好一次的字母：{letters}；贡献 {v}。",
    "Range [{l},{r}], text {s}; frequencies {counts}; letters occurring once: {letters}; contribution {v}."
  ],
  "none": [
    "无",
    "none"
  ],
  "s1t": [
    "先把所有片段数一遍，哪里贵？",
    "What makes enumerating every piece costly?"
  ],
  "s1e": [
    "这一步要回答：一个直接正确的方法要做多少工作？固定左端 l，逐个延长右端 r，并更新频次字典。每次统计频次等于 1 的字母。ABA 在 r=0、1、2 时依次贡献 1、2、1；左端换到 1 后得到 1、2；最后一个 A 得 1。 基线中的 v == 1 得到真假值；sum 把真视为 1、假视为 0，因此统计恰好出现一次的字母种数。",
    "How much work does a straightforward correct method do? Fix the left endpoint l, extend the right endpoint r, and update a frequency dictionary. Count entries equal to 1 each time. For ABA with l=0, the scores are 1, 2, 1; with l=1 they are 1, 2; the last A gives 1. In the baseline, v == 1 produces a Boolean; sum treats True as 1 and False as 0, counting letters whose frequency is exactly one."
  ],
  "wrong": [
    "诱人的错法：把不同字母数当作唯一字符数。ABA 有 A、B 两种字母，但 A 不唯一，因此本段应得 1 而不是 2。若对所有子串都数不同字母，会错得 9，而非 8。",
    "Tempting mistake: count distinct letters instead of unique letters. ABA contains two distinct letters, A and B, but A is repeated, so this piece scores 1, not 2. Summing distinct counts over all substrings incorrectly gives 9 rather than 8."
  ],
  "baselineCode": [
    "查看基线 Python（返回同一个整数）",
    "Baseline Python (returns the same integer)"
  ],
  "baselineCost": [
    "令 n 为字符串长度。共有 n(n+1)/2 个片段；n=100,000 时有 5,000,050,000 个。每次最多检查 26 个频次，所以固定字母表下时间 O(n²)，辅助空间 O(26)。不必逐个访问这些片段，试着改数每个字母位置能贡献几次。",
    "Let n be the string length. There are n(n+1)/2 pieces: 5,000,050,000 when n=100,000. At most 26 frequencies are checked per piece, so time is O(n²) for this fixed alphabet and auxiliary space is O(26). Instead of visiting every piece, count how often each letter position contributes."
  ],
  "s2t": [
    "固定一个字母位置，哪些片段只包含它一次？",
    "Which pieces contain one occurrence exactly once?"
  ],
  "s2e": [
    "这一步要回答：ABA 中位置 i=1 的 B 能贡献几次？位置从 0 开始。一次出现指一个具体位置上的字母。要包含 B，左端 l 可为 0 或 1，右端 r 可为 1 或 2；组合成 AB、ABA、B、BA，共 2×2=4 次。位置 0 的 A 则不能把右端伸到 2，否则包含两个 A；它只有 A、AB 两次。位置 2 的 A 同理有 BA、A 两次。合计 2+4+2=8。",
    "How often does B at i=1 contribute in ABA? Indices start at 0. An occurrence is a letter at one specific position. To include B, l can be 0 or 1 and r can be 1 or 2: AB, ABA, B, BA give 2×2=4 contributions. A at index 0 cannot extend to index 2, which would include another A; it counts only in A and AB. A at index 2 counts in BA and A. Total: 2+4+2=8."
  ],
  "derive": [
    "若同字母之前最近的位置为 p、之后最近的位置为 q，要让位置 i 的字母恰好出现一次，必须 p < l ≤ i ≤ r < q。l=p 或 r=q 会引入第二次出现，必须排除；更近的位置之间没有同字母，因此其余组合全都合法。无前一个时用 p=-1，无后一个时用 q=n；它们是边界标记，不是实际字符。",
    "Let p and q be the nearest equal-letter positions before and after i. For the letter at i to occur exactly once, we need p < l ≤ i ≤ r < q. Including p or q introduces a second occurrence, so both boundaries are excluded. There is no equal letter between these neighbors, so every remaining combination is valid. Use p=-1 or q=n when a neighbor is missing; these are boundary markers, not characters."
  ],
  "formula": [
    "位置 i 的贡献 = (i − p) × (q − i)",
    "Contribution of position i = (i − p) × (q − i)"
  ],
  "invariant": [
    "为什么相乘再相加？每个左端都能配每个右端，所以有 (i-p)(q-i) 对。一个子串中每个唯一字母对应且仅对应一个位置；反过来，每个合法的位置与子串配对都应得 1 分。故处理前 k 个位置后，累计值恰好是这些位置在所有子串中的贡献，不会漏计或重复计算同一项。处理完 n 个位置便得到所求总和。",
    "Why multiply, then sum? Every left endpoint pairs with every right endpoint, giving (i-p)(q-i) pairs. Each unique letter in a substring corresponds to exactly one position; conversely, each valid position–substring pair earns one point. After k positions, the running total is exactly those positions’ contributions across all substrings. No such pair is missing or counted twice. After n positions, this is the requested sum."
  ],
  "traceTask": [
    "选择预设会从头开始。保持字符串不变，逐次结算一个位置；先看 p、q，再看合法端点对，最后看历史累计。后退会完整还原。",
    "Changing the preset restarts the trace. Keep the string fixed and settle one position at a time: inspect p and q, then the legal endpoint pairs, then the accumulated ledger. Back restores the whole state."
  ],
  "sim": [
    "教学模拟：提前求出全部相邻同字母边界，再按位置展示贡献，并不执行下方 Python。所有步骤均展示，无省略；短预设的快照与子串列表占用额外教学空间，不属于提交代码的 O(n) 辅助空间。",
    "Teaching simulation: equal-letter neighbors are computed first, then contributions are shown by position. This does not execute the Python below. No steps are omitted. Snapshots and substring lists for these short presets use additional teaching storage, separate from the submission’s O(n) auxiliary space."
  ],
  "presetLabel": [
    "字符串预设（切换重启）",
    "String preset (change restarts)"
  ],
  "prev": [
    "后退一个位置",
    "Back one position"
  ],
  "next": [
    "结算下一个位置",
    "Settle next position"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "end": [
    "结算全部位置",
    "Settle all positions"
  ],
  "frame": [
    "已结算 {k}/{n} 个位置；累计贡献 {total}{final}",
    "Settled {k}/{n} positions; cumulative contribution {total}{final}"
  ],
  "final": [
    "（最终答案）",
    " (final answer)"
  ],
  "start": [
    "尚未结算任何位置。点“结算下一个位置”查看位置 0 的贡献。",
    "No positions settled yet. Choose “Settle next position” to inspect index 0."
  ],
  "position": [
    "位置 {i}：{ch}",
    "Index {i}: {ch}"
  ],
  "current": [
    "刚结算",
    "Just settled"
  ],
  "settled": [
    "已结算",
    "Settled"
  ],
  "pending": [
    "待结算",
    "Pending"
  ],
  "arrayLabel": [
    "输入位置与结算状态",
    "Input positions and settlement states"
  ],
  "event": [
    "刚结算 i={i} 的 {ch}：p={p}，q={q}。左端 {l0}…{i}，共 {left} 种；右端 {i}…{r1}，共 {right} 种。本次贡献 {left} × {right} = {value}。",
    "Just settled {ch} at i={i}: p={p}, q={q}. Left endpoints {l0}…{i}: {left} choices; right endpoints {i}…{r1}: {right} choices. This contribution: {left} × {right} = {value}."
  ],
  "pairs": [
    "合法端点对 [l,r] 与对应子串（只数当前字母位置）",
    "Legal [l,r] pairs and substrings (counting only the current occurrence)"
  ],
  "ledgerTitle": [
    "累计贡献记录（按原串位置）",
    "Contribution ledger (by original position)"
  ],
  "ledgerLine": [
    "i={i}，{ch}：({i}−{p})×({q}−{i})={value}；累计 {total}",
    "i={i}, {ch}: ({i}−{p})×({q}−{i})={value}; running total {total}"
  ],
  "s3t": [
    "换成 ABACA，你能找到正确边界吗？",
    "Can you find the boundaries in ABACA?"
  ],
  "s3e": [
    "这一步要回答：ABACA 中位置 i=2 的 A，在多少个子串中恰好出现一次？这只问该位置的贡献，不是整个字符串的答案。位置从 0 开始。回忆：一段必须包含 i，但不能包含相邻的同字母。先选择，再揭晓。此练习与上面的预设独立。",
    "In ABACA, in how many substrings is the A at i=2 present exactly once? This asks only for that occurrence’s contribution, not the whole string’s answer. Indices start at 0. Recall: include i while excluding neighboring equal letters. Choose before revealing. This exercise is independent of the preset above."
  ],
  "predictionLegend": [
    "位置 2 的 A 贡献多少次？",
    "How many contributions come from A at index 2?"
  ],
  "option0": [
    "9 次：只要片段包含位置 2",
    "9: any piece containing index 2"
  ],
  "option1": [
    "6 次：只排除左侧的 A",
    "6: exclude only the A on the left"
  ],
  "option2": [
    "4 次：两侧相邻 A 都排除",
    "4: exclude both neighboring As"
  ],
  "reveal": [
    "核对预测",
    "Check prediction"
  ],
  "quizPending": [
    "选择答案后再核对；推导尚未揭晓。",
    "Choose an answer, then check; the derivation is still hidden."
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "再检查同字母边界。",
    "Check the equal-letter boundaries again."
  ],
  "answer": [
    "p=0，q=4。左端为 1 或 2，右端为 2 或 3，共 2×2=4：BA、BAC、A、AC。9 次把两端 A 也允许包含；6 次仅去掉左端 A，却仍允许右端 A。两者都会让当前 A 重复，不再唯一。这正是贡献记录必须保持的计数规则。",
    "p=0, q=4. Left endpoints are 1 or 2; right endpoints are 2 or 3. There are 2×2=4: BA, BAC, A, AC. The answer 9 allows both neighboring As; 6 excludes the left A but still allows the right one. Either can repeat A and destroy uniqueness. Excluding both is the counting rule maintained by the ledger."
  ],
  "s4t": [
    "Python 如何找到这些边界？",
    "How does Python find these boundaries?"
  ],
  "s4e": [
    "这一步要回答：如何在线性时间求出每个位置的贡献？prev[i] 存前一个同字母位置，nxt[i] 存后一个。last 是字母到最近位置的字典。正向扫描时先读 last 再更新，因此不会把 i 自己当作前一个；反向扫描同理找后一个。最后按位置累加乘积。 enumerate(s) 依次给出索引和字母；last.get(ch, 默认值) 在找不到字母时返回默认边界。比如 ABA 正向扫描到 i=2 时，last[A]=0，所以 prev[2]=0，然后把 last[A] 改为 2。",
    "How can every position’s contribution be found in linear time? prev[i] stores the previous equal-letter index and nxt[i] the next one. last maps a letter to its most recent index. The forward scan reads last before updating it, so i cannot become its own previous neighbor. The reverse scan finds next neighbors the same way. Finally, sum the products by position. enumerate(s) yields each index and letter; last.get(ch, default) returns the default boundary when the letter is absent. For example, at i=2 in the forward scan of ABA, last[A]=0, so prev[2]=0 before last[A] becomes 2."
  ],
  "map1": [
    "prev 初始化 -1、nxt 初始化 n：缺少邻居时，仍允许片段伸到字符串边缘。",
    "Initialize prev to -1 and nxt to n: a missing neighbor allows the piece to reach the string’s edge."
  ],
  "map2": [
    "两次扫描各访问 n 个字母，last 最多含 26 项；乘积循环对应模拟中的每次结算。",
    "Each of the two scans visits n letters; last has at most 26 entries. Each iteration of the product loop corresponds to one simulated settlement."
  ],
  "map3": [
    "基线枚举子串再数字母；提交代码枚举字母位置再数端点对。两者统计的是同一批“唯一位置与子串”配对。",
    "The baseline enumerates substrings then letters; the submission enumerates positions then endpoint pairs. Both count the same unique-position–substring pairs."
  ],
  "cost": [
    "时间 O(n)，辅助空间 O(n)：prev、nxt 各 n 项，字典最多 26 项。Python 整数可容纳结果；官方保证返回值适合 32 位整数，无需取模。这里的空间声明对应展示的代码，不是能进一步压缩空间的其他算法。",
    "Time O(n), auxiliary space O(n): prev and nxt each have n entries, and the dictionary has at most 26. Python integers hold the result; the official contract guarantees a 32-bit answer, with no modulus. This space claim describes the displayed code, rather than a different algorithm that could reduce storage."
  ],
  "boundaries": [
    "边界：A → 1；AAAA → 4，因为只有单字符片段得分，每个位置乘积为 1。ABC → 3+4+3=10。若两侧同字母紧邻 i，则两边都只能选 i。空串不在官方输入范围内。",
    "Boundaries: A → 1; AAAA → 4 because only single-letter pieces score and every position contributes 1. ABC → 3+4+3=10. If equal letters touch i on both sides, both endpoints must be i. Empty strings are outside the official input domain."
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
    "查看完整官方接口 Python 源码",
    "Complete Python source for the official interface"
  ],
  "copied": [
    "已复制完整源码。",
    "Complete source copied."
  ],
  "fallback": [
    "自动复制不可用；完整源码已选中，请按系统复制快捷键。",
    "Automatic copy unavailable. The full source is selected; use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "related1": [
    "#2916：按右端点累加子数组贡献",
    "#2916: accumulate subarray contributions by right endpoint"
  ],
  "related2": [
    "#76：为什么字符集合不能替代频次",
    "#76: why a letter set cannot replace frequencies"
  ],
  "foot": [
    "可逆模拟用于观察计数；源码可离线查看、复制与下载。",
    "Use the reversible simulation to inspect counting; source is available offline to view, copy and download."
  ]
};
