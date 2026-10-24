window.LESSON_COPY = {
  "docTitle": [
    "#446 · 等差数列划分 II — 子序列",
    "#446 · Arithmetic Slices II — Subsequence"
  ],
  "title": [
    "#446 · 等差数列划分 II — 子序列",
    "#446 · Arithmetic Slices II — Subsequence"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
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
    "把两张数字卡留到下一轮：它们还不是答案，却是未来三项等差子序列的起点。",
    "Keep a pair of numbered cards for the next round: it is not an answer yet, but it can start a three-term arithmetic subsequence."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "01 · 哪些选择算一次？",
    "01 · Which choices count?"
  ],
  "s1": [
    "02 · 为什么记住两项？",
    "02 · Why remember pairs?"
  ],
  "s2": [
    "03 · 逐对扩展实验",
    "03 · Extend one pair at a time"
  ],
  "s3": [
    "04 · 先预测，再揭晓",
    "04 · Predict, then reveal"
  ],
  "s4": [
    "05 · 证明与 Python",
    "05 · Proof and Python"
  ],
  "statement": [
    "从三张卡 [2,4,6] 中，哪些选择能构成答案？输入 nums 是按位置排列的整数。子序列可以删去一些位置，但必须保留原顺序；等差子序列至少有三项，且相邻所选数之差相同。我们求选择方式的数量，不是最长长度。",
    "Which choices from three cards [2,4,6] count? The input nums is an ordered integer array. A subsequence may skip positions but keeps their order. An arithmetic subsequence has at least three terms and equal differences between consecutive chosen terms. We count choices, not the longest length."
  ],
  "handCaption": [
    "卡片上方是从 0 开始的位置，下方是数值。",
    "Each card shows its zero-based position above its value."
  ],
  "hand": [
    "只有选位置 (0,1,2) 得到 [2,4,6]：4−2=2，6−4=2，所以答案是 1。[2,4] 虽然有差值 2，却只有两项，不能计入。",
    "Only positions (0,1,2) give [2,4,6]: 4−2=2 and 6−4=2, so the answer is 1. The pair [2,4] has difference 2 but is too short to count."
  ],
  "examples": [
    "官方例子：[2,4,6,8,10] → 7；[7,7,7,7,7] → 16（仍只计长度至少为 3 的选择）。",
    "Official examples: [2,4,6,8,10] → 7; [7,7,7,7,7] → 16 (counting only choices of length at least 3)."
  ],
  "baselineTitle": [
    "基线：把所有位置组合试一遍",
    "Baseline: try every choice of positions"
  ],
  "baseline": [
    "最直接的方法枚举每个位置子集，按原顺序取值，再检验所有相邻差。n 是输入长度：共 2ⁿ 个子集，每个最多检查 n 项，因此时间 O(n·2ⁿ)，额外空间 O(n)。n 可达 1000，不能把每条子序列都生成出来。下面是正确的小输入基线，也可用于独立核对。",
    "Enumerate every subset of positions, read its values in original order, and check all adjacent differences. With n input items there are 2ⁿ subsets, each needing up to n checks: O(n·2ⁿ) time and O(n) auxiliary space. At n=1000 we cannot generate every subsequence. This correct small-input baseline also provides an independent check."
  ],
  "wrong": [
    "容易误用：只数连续片段。[2,9,4,6] 没有三项连续等差片段，却有跳过 9 的 [2,4,6]，答案为 1。按数值去重也错：[7,7,7,7] 的四种三位置选择和一种四位置选择共 5 个，即使数值相同，位置不同仍分别计数。",
    "Tempting mistake: count only contiguous slices. [2,9,4,6] has no contiguous arithmetic triple, yet skipping 9 gives [2,4,6], so its answer is 1. Deduplicating values also fails: [7,7,7,7] has four choices of three positions and one choice of four, totaling 5. Equal values at different positions still count separately."
  ],
  "derive": [
    "处理 [2,4,6] 的最后一张卡 6 时，我们需要知道什么？差值 d 是后一个数减前一个数。已有的 [2,4] 以位置 j=1 结尾、差值为 2；接上位置 i=2 的 6，差值仍为 2，于是产生一个合法的三项答案。只记“已有答案”会丢掉这个还没达标的两项起点。",
    "What must we know when processing the final card 6 in [2,4,6]? The difference d is the later value minus the earlier one. The saved [2,4] ends at position j=1 with difference 2. Appending the 6 at i=2 keeps that difference and creates one valid triple. Storing only completed answers would lose this two-term starting point."
  ],
  "stateDefinition": [
    "因此定义 dp[i][d]：以位置 i 结尾、差值为 d、长度至少为 2 的子序列数量。未存的键表示 0。对每个 j<i，取 d=nums[i]−nums[j]，c=dp[j][d]。这 c 条旧序列各自接上 i，都会从至少两项变成至少三项；另外 (j,i) 本身提供一条新的两项起点。",
    "Define dp[i][d] as the number of subsequences of length at least 2 ending at position i with difference d. A missing key means 0. For each j<i, take d=nums[i]−nums[j] and c=dp[j][d]. Appending i to each of those c sequences makes a valid sequence of length at least 3. The pair (j,i) also creates one new two-term starting point."
  ],
  "oldPair": [
    "已存起点：位置 (0,1)，数值 [2,4]；dp[1][2]=1。",
    "Saved starting point: positions (0,1), values [2,4]; dp[1][2]=1."
  ],
  "extension": [
    "扩展得到答案：位置 (0,1,2)，数值 [2,4,6]；答案增加 1。",
    "Extension creates an answer: positions (0,1,2), values [2,4,6]; add 1 to the answer."
  ],
  "newPair": [
    "同时存新起点：位置 (1,2)，数值 [4,6]；dp[2][2] 从 0 变成 2（起点和三项序列各一条）。",
    "Also save a new pair: positions (1,2), values [4,6]; dp[2][2] grows from 0 to 2 (one pair and one triple)."
  ],
  "rule": [
    "所以 answer 只加 c，而 dp[i][d] 加 c+1。已有 dp[i][d] 不能覆盖，因为更早的 j 可能已贡献同一差值。我们把“相同结尾位置与差值”的重复检查合并成一个计数，无需再次展开每条旧序列。",
    "Thus answer increases by c, while dp[i][d] increases by c+1. Keep the previous dp[i][d] too: earlier j values may already have contributed this difference. One count summarizes all sequences with the same endpoint and difference, avoiding repeated checks of each old sequence."
  ],
  "labIntro": [
    "每次处理一对位置后，究竟哪些数改变？这里 dp[k][d] 计以位置 k 结尾、差值 d、长度至少为 2 的子序列。i 是新结尾，j 是倒数第二个位置，c 是源 dp[j][d] 的旧计数。每帧显示一次 (j,i) 更新完成之后的状态；总答案只含已处理的长度至少为 3 的序列。",
    "What changes after processing one pair of positions? Here dp[k][d] counts subsequences of length at least 2 ending at k with difference d. Position i is the new endpoint, j is the penultimate position, and c is the old source count dp[j][d]. Each frame shows the state after one completed (j,i) update; the running answer contains only processed sequences of length at least 3."
  ],
  "invariant": [
    "逐对处理时，dp[i][d] 精确保存倒数第二个位置已处理的所有序列；一行处理结束后，就包含该结尾的全部序列。因为 j<i，读取的源行 j 已经完成。相同差值但结尾不同不能合并：它们能接上的后续位置不同。",
    "During a row, dp[i][d] counts exactly the sequences whose penultimate positions have been processed. At row completion it includes every sequence at that endpoint. Since j<i, source row j is already complete. Equal differences at different endpoints cannot be merged: they have different later positions available to append."
  ],
  "simulation": [
    "这是 JavaScript 可视化模拟，不是执行 Python 提交。小预设保留全部更新，没有跳步；快照和历史表是教学额外开销，正式解法只存 n 个字典。",
    "This is a JavaScript visual simulation, not execution of the Python submission. Small presets retain every update without omissions. Snapshots and the history table are teaching overhead; the submission keeps only n dictionaries."
  ],
  "experiment": [
    "保持预设不变，点击“处理下一对”，先看源计数 c，再比较目标旧值/新值和历史中的答案增量。退回再前进应恢复相同状态。改预设仅重启本实验，不清除下面的预测题。",
    "Keep the preset fixed and process the next pair. Inspect source count c, compare the target before/after, then inspect the answer increment in the history. Back then forward restores the same state. Changing preset restarts only this experiment, preserving the prediction below."
  ],
  "presets": [
    "选择预设（会重启本实验）",
    "Preset (restarts this experiment)"
  ],
  "p0": [
    "手算 · [2,4,6]",
    "Hand calculation · [2,4,6]"
  ],
  "p1": [
    "官方 · [2,4,6,8,10]",
    "Official · [2,4,6,8,10]"
  ],
  "p2": [
    "重复 · [7,7,7,7,7]",
    "Duplicates · [7,7,7,7,7]"
  ],
  "p3": [
    "负差 · [3,1,−1,−3]",
    "Negative gap · [3,1,−1,−3]"
  ],
  "p4": [
    "单项 · [9]",
    "Singleton · [9]"
  ],
  "p5": [
    "宽差 · [−2³¹,0,2³¹−1]",
    "Wide gaps · [−2³¹,0,2³¹−1]"
  ],
  "p6": [
    "无解 · [1,2,4]",
    "No match · [1,2,4]"
  ],
  "p7": [
    "跳过 · [2,9,4,6]",
    "Skip a position · [2,9,4,6]"
  ],
  "prev": [
    "退回一对",
    "Previous pair"
  ],
  "next": [
    "处理下一对",
    "Process next pair"
  ],
  "reset": [
    "回到初始状态",
    "Reset trace"
  ],
  "end": [
    "查看全部处理结果",
    "Show all updates"
  ],
  "position": [
    "已完成的位置对数量",
    "Number of completed position pairs"
  ],
  "progress": [
    "已处理 {i}/{total} 对 · 当前累计答案 {answer}",
    "Processed {i}/{total} pairs · Running answer {answer}"
  ],
  "initial": [
    "初始状态：尚未处理任何位置对，所有字典为空，累计答案为 0。",
    "Initial state: no position pairs processed, all dictionaries empty, running answer 0."
  ],
  "transition": [
    "刚处理 j={j} → i={i}：d={right}−({left})={d}；c=dp[{j}][{d}]={c}。目标 dp[{i}][{d}]：{before} + {c} + 1 = {after}；累计答案：{oldAnswer} + {c} = {answer}。",
    "Just processed j={j} → i={i}: d={right}−({left})={d}; c=dp[{j}][{d}]={c}. Target dp[{i}][{d}]: {before} + {c} + 1 = {after}; running answer: {oldAnswer} + {c} = {answer}."
  ],
  "index": [
    "位置 {i}",
    "Position {i}"
  ],
  "sourceTag": [
    "源 j",
    "Source j"
  ],
  "targetTag": [
    "目标 i",
    "Target i"
  ],
  "unusedTag": [
    "其他位置",
    "Other position"
  ],
  "mapGuide": [
    "下列每行对应一个结尾位置；条目写作 差值 d : 数量。空行表示尚无长度至少为 2 的序列；不表示该位置的数值为零。",
    "Each row below is one endpoint; entries read difference d : count. An empty row means no saved sequences of length at least 2, not a zero input value."
  ],
  "mapTitle": [
    "全部已存状态（含两项起点）",
    "All saved states (including two-term starting points)"
  ],
  "empty": [
    "空",
    "Empty"
  ],
  "history": [
    "已完成的更新历史",
    "Completed update history"
  ],
  "scrollHistory": [
    "历史表可左右滚动；每行是一对位置的完整更新。",
    "Scroll the history table horizontally; each row is one complete pair update."
  ],
  "pair": [
    "位置对 (j,i)",
    "Position pair (j,i)"
  ],
  "gap": [
    "差值 d",
    "Difference d"
  ],
  "sourceCount": [
    "源计数 c",
    "Source count c"
  ],
  "targetCount": [
    "目标 旧 → 新",
    "Target before → after"
  ],
  "added": [
    "新增答案",
    "New answers"
  ],
  "total": [
    "累计答案",
    "Running answer"
  ],
  "noHistory": [
    "尚无更新",
    "No updates yet"
  ],
  "quiz": [
    "新例子 [1,3,5,7]：已处理完结尾 i=2。现在在结尾 i=3 这一轮处理 j=2（值 5）到 i=3（值 7），差值为 2。这一对会给 answer 新增多少？只问这一对，不是总答案。dp 仍存长度至少为 2 的序列。",
    "Fresh case [1,3,5,7]: row i=2 is complete. In row i=3, now process j=2 (value 5) to i=3 (value 7), with difference 2. How much does this pair add to answer? We ask for this pair’s increment, not the total. The dp state still includes sequences of length at least 2."
  ],
  "option0": [
    "A · 新增 3",
    "A · Add 3"
  ],
  "option1": [
    "B · 新增 1",
    "B · Add 1"
  ],
  "option2": [
    "C · 新增 2",
    "C · Add 2"
  ],
  "reveal": [
    "检查预测并揭晓",
    "Check prediction and reveal"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "再看源状态的含义。",
    "Revisit what the source state counts."
  ],
  "answer": [
    "源 dp[2][2]=2，分别是 [3,5] 和 [1,3,5]；接上 7 得到 [3,5,7] 与 [1,3,5,7]，所以新增 2。A 多算了只有两项的 [5,7]；B 漏掉四项序列。目标 dp[3][2] 原来为 0，现在为 0+2+1=3；累计答案从 1 变成 3。",
    "Source dp[2][2]=2 represents [3,5] and [1,3,5]. Append 7 to obtain [3,5,7] and [1,3,5,7], adding 2. A also counts the too-short [5,7]; B misses the four-term sequence. Target dp[3][2] was 0 and becomes 0+2+1=3; the running answer grows from 1 to 3."
  ],
  "proof": [
    "为什么不会漏算或重算？dp[i][d] 保存以位置 i 结尾、差值 d、长度至少为 2 的序列数。初始全空正确。每条新序列唯一地分为一个起点对 (j,i)，或一条以 j 结尾的旧序列再接 i；两类长度不同且不重叠。任意长度至少为 3 的答案有唯一的最后两个位置 (j,i)，删去 i 后一定在 dp[j][d] 中，因此恰好在这一对的 answer += c 被计一次。有限的两层循环结束时，全部答案都已计入。",
    "Why are there no omissions or duplicates? State dp[i][d] counts sequences of length at least 2 ending at i with difference d. Initially every state is correctly empty. Each new sequence uniquely consists of either the starting pair (j,i), or an old sequence ending at j with i appended; the two classes have different lengths and cannot overlap. Every answer of length at least 3 has unique last two positions (j,i). Removing i leaves a sequence in dp[j][d], so answer += c counts it exactly once. The finite nested loops cover all pairs and therefore all answers."
  ],
  "map1": [
    "代码 d 与 c：先用 nums[i]−nums[j] 确定唯一可延续的差值，再读已经完成的源行。get(d,0) 对应图中空条目的零计数。",
    "Code d and c: nums[i]−nums[j] selects the only compatible difference; then read the completed source row. get(d,0) supplies zero for entries absent from the diagram."
  ],
  "map2": [
    "代码 answer += c 与 dp[i][d] 更新：前者只数延长后的合法答案，后者还加 1 保存 (j,i) 起点。输入 nums 不会修改。",
    "Code answer += c and the dp[i][d] update: the former counts valid extensions; the latter also adds 1 to save starting pair (j,i). The input nums is not modified."
  ],
  "cost": [
    "n 为输入长度。恰有 n(n−1)/2 次配对；字典操作按平均 O(1) 计，时间 O(n²)，最坏额外空间 O(n²) 个字典条目。不是 O(n)：不同结尾可各有许多差值。可视化保存完整快照的成本不包含在这个提交复杂度中。",
    "For input length n there are exactly n(n−1)/2 pairs. With expected O(1) dictionary operations, time is O(n²) and worst-case auxiliary space is O(n²) dictionary entries. Space is not O(n): each endpoint can have many differences. Full visual snapshots are extra teaching storage, excluded from submission complexity."
  ],
  "boundaries": [
    "边界：长度 1 或 2 返回 0；重复值的差为 0，同样延续；递减序列允许负差。全相等时答案是 2ⁿ−1−n−n(n−1)/2；例如 n=5 得 16，但任意大的全相等数组可能违反官方“答案在 32 位内”的保证。值范围为 [−2³¹,2³¹−1]，差值可达 2³²−1；Python 整数不会溢出，不应把差值强制截成 32 位。",
    "Boundaries: lengths 1 and 2 return 0. Repeated values use difference 0; decreasing sequences use negative differences. For all-equal values the answer is 2ⁿ−1−n−n(n−1)/2, giving 16 at n=5. Larger all-equal arrays can violate the official 32-bit answer guarantee. Values range from −2³¹ to 2³¹−1, so a difference can reach 2³²−1. Python integers do not overflow; do not truncate differences to 32 bits."
  ],
  "verify": [
    "自查方法：独立枚举小输入的位置子集，与正式 Python 和每一步模拟状态比较；最大长度另用可推导的期望值检查。浏览器仅展示模拟，测试脚本才实际执行 Python。没有宣称 LeetCode 提交通过，也没有真实学习者成效证据。",
    "Self-check method: independently enumerate position subsets on small inputs, comparing both the Python solution and every simulated state. Maximum-length checks use separately derived expectations. The browser shows a simulation; test scripts execute Python. This is not a claim of LeetCode acceptance or measured learner outcomes."
  ],
  "source": [
    "查看正式 Python 提交代码",
    "View canonical Python submission"
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
    "已复制。",
    "Copied."
  ],
  "fallback": [
    "剪贴板不可用。请在下方选中文本手动复制。",
    "Clipboard unavailable. Select the text below and copy manually."
  ],
  "manualLabel": [
    "手动复制正式 Python 源码",
    "Manually copy canonical Python source"
  ],
  "related": [
    "继续比较这些状态定义",
    "Compare these state definitions"
  ],
  "related0": [
    "不同子序列：按位置组合计数",
    "Distinct subsequences: count position choices"
  ],
  "related1": [
    "最长递增路径：记住结尾的状态",
    "Longest increasing path: remember endpoint states"
  ],
  "foot": [
    "作者自查候选 · 独立评审待完成 · 无外部资源",
    "Author self-checked candidate · Independent review pending · No external assets"
  ]
};
