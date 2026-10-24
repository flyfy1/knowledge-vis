window.LESSON_COPY = {
  "docTitle": [
    "#466 · 统计重复个数",
    "#466 · Count The Repetitions"
  ],
  "title": [
    "#466 · 统计重复个数",
    "#466 · Count The Repetitions"
  ],
  "meta": [
    "LeetCode Hard · 子序列 × 循环检测",
    "LeetCode Hard · Subsequences × Cycle detection"
  ],
  "tagline": [
    "把 acb 写两遍，删去两个 c，便得到 abab。字符顺序不能改变；未完成的匹配也不能在块边界丢失。",
    "Write acb twice and delete both c characters: abab remains. Order must stay intact, and unfinished matches must survive block boundaries."
  ],
  "s0": [
    "从两条 ab 算起",
    "Start with two copies of ab"
  ],
  "s1": [
    "边界要记住什么？",
    "What survives a boundary?"
  ],
  "s2": [
    "重复状态，跳过整圈",
    "Skip a repeated cycle"
  ],
  "s3": [
    "先预测，再揭晓",
    "Predict before revealing"
  ],
  "s4": [
    "把理由写进 Python",
    "Turn the reason into Python"
  ],
  "statement": [
    "这一步要回答：答案的一份究竟是什么？[s,n] 表示把字符串 s 连写 n 次。子序列指只删字符、不改顺序得到的字符串。给定 s1、n1、s2、n2，求最大 m，使 s1 连写 n1 次后能留下 s2 连写 n2×m 次。",
    "What counts as one answer unit? [s,n] means n concatenated copies of string s. A subsequence is obtained by deleting characters without changing their order. Given s1, n1, s2, n2, find the largest m such that n1 copies of s1 can retain n2×m copies of s2."
  ],
  "hand": [
    "小例：s1=\"acb\", n1=2, s2=\"ab\", n2=1。依次保留第 1、3、4、6 个字符：a c b | a c b → a b | a b。每遇 a 等待 b，遇 c 跳过，遇 b 完成一份 ab。共 C=2 份 s2；一组需要 n2=1 份，所以 m=⌊2/1⌋=2。若只把 n2 改成 2，答案就变成 1。",
    "Tiny case: s1=\"acb\", n1=2, s2=\"ab\", n2=1. Keep characters 1, 3, 4, 6: a c b | a c b → a b | a b. Each a makes us wait for b; skip c; each b finishes one ab. We finish C=2 copies of s2. A group needs n2=1 copies, so m=⌊2/1⌋=2. Change only n2 to 2 and the answer becomes 1."
  ],
  "examples": [
    "官方例：(acb,4,ab,2) → 2；(acb,1,acb,1) → 1。约束：两个字符串长度均为 1…100，仅含小写英文字母；n1、n2 均为 1…10⁶。",
    "Official examples: (acb,4,ab,2) → 2; (acb,1,acb,1) → 1. Constraints: both string lengths are 1…100, lowercase English letters only; n1 and n2 are both 1…10⁶."
  ],
  "baselineTitle": [
    "正确但可能很慢的逐字符扫描",
    "A correct scan that may do too much work"
  ],
  "baseline": [
    "从左到右扫描 n1 份 s1，只在字符恰好等于下一个所需字符时接收它。下面的 j 是 s2 中下一个需要的位置（从 0 开始），C 是已完成的 s2 份数。无需构造大字符串，时间 O(n1·|s1|)、额外空间 O(1)；最大仍需检查 10⁸ 个字符。最后才除以 n2，不能把未满的一组算入答案。",
    "Scan n1 copies of s1 from left to right, taking a character only when it is the next needed one. Below, j is the zero-based index of the next needed character in s2; C counts finished copies of s2. No expanded string is needed. Time is O(n1·|s1|), extra space O(1), but the maximum still requires 10⁸ character checks. Divide by n2 only at the end: an incomplete group cannot count."
  ],
  "state": [
    "这一步要回答：一个 s1 块（即一整份 s1）读完以后，需要把什么带到下一块？仍用 acb / ab：从 (j,C)=(0,0)，a 使 j:0→1；c 不匹配，仍为 1；b 使 j:1→0，C:0→1。下一块又从 j=0 开始，经历完全相同的变化。C 增加了，但下一个要找的字符没变。",
    "What must one s1 block (one whole copy of s1) carry into the next block? Keep acb / ab: from (j,C)=(0,0), a moves j:0→1; c mismatches, leaving 1; b moves j:1→0 and C:0→1. The next block starts at j=0 again and makes exactly the same transitions. C increased, but the next needed character stayed the same."
  ],
  "complication": [
    "只改一个条件，令 s1=\"ab\", s2=\"aba\"。第一个块匹配 a、b 后，j=2，正在等最后的 a；下一块开头的 a 完成 aba，随后的 b 因正在等 a 而跳过。边界依次是 (j,C)=(0,0)→(2,0)→(0,1)→(2,1)→(0,2)。所以两个块带来一份 aba。",
    "Change one condition: s1=\"ab\", s2=\"aba\". After matching a and b in the first block, j=2 waits for the final a. The next block’s opening a finishes aba; its b is then skipped because we need a. Boundaries are (j,C)=(0,0)→(2,0)→(0,1)→(2,1)→(0,2). Two blocks produce one aba."
  ],
  "wrong": [
    "诱人的错误：先算一个 s1 里有几份 s2，再乘 n1。ab 中没有完整 aba，但 abab 中有一份（保留前 3 个字符）。块尾的 j=2 不能清零。另一种错误是只比字符数量：ab 与 ba 字母数量相同，却无法互为子序列，顺序才决定合法性。",
    "Tempting mistake: count complete s2 copies inside one s1, then multiply by n1. There is no aba in ab, yet abab contains one (keep the first 3 characters). The unfinished j=2 cannot be reset at a boundary. Counting letters alone also fails: ab and ba have equal letter counts but neither is a subsequence of the other. Order decides legality."
  ],
  "proof": [
    "为什么总是取最早的可用字符？任何合法匹配的第一个字符都能换成更早的同字符，且不会减少后面可用的字符。对每个后续字符重复这个替换，因此这种贪心扫描完成的前缀最长。边界的 j 就是这条最长匹配里下一份 s2 尚缺的位置；C 记录已经完整完成的份数。",
    "Why take the earliest available match? The first character of any valid match can be replaced by an earlier equal character without reducing the remaining suffix. Repeat this exchange for every next character: the greedy scan matches the longest target prefix. At a boundary, j records the unfinished position of its next s2 copy; C counts the fully finished copies."
  ],
  "lab": [
    "这一步要回答：相同的 j 再次出现在块边界时，为什么能少读字符？j 是 s2 中下一个所需位置，C 是完成的 s2 份数。接下来输入总是相同的 s1；因此同一个 j 必定产生相同的下一个 j 和同样的 C 增量。C 的绝对大小不会参与字符比较。",
    "Why can a repeated boundary j save character scans? Here j is the next needed index in s2 and C is the number of finished s2 copies. The next input is always the same s1, so the same j must produce the same next j and the same increase in C. The absolute value of C never participates in character comparisons."
  ],
  "derive": [
    "设两个相同 j 的边界分别在 old_block 和 block。它们之间读了 L=block−old_block 个块，完成 G=C−old_count 份 s2，这就是一个循环。剩余 n1−block 个块中能放 q=⌊(n1−block)/L⌋ 个完整循环，于是同时加 q·L 个块和 q·G 份。剩下不足 L 个块必须照常扫描；j 保持不变。G=0 也可以安全跳过。",
    "Suppose equal j values occur at boundaries old_block and block. Between them we read L=block−old_block blocks and finish G=C−old_count copies of s2: a cycle. The remaining n1−block blocks fit q=⌊(n1−block)/L⌋ whole cycles. Add q·L blocks and q·G copies together. Scan the remaining fewer than L blocks normally; j stays unchanged by whole cycles. A gain G=0 is safe too."
  ],
  "invariant": [
    "不变量（每次操作都保持的事实）：已读前缀的最长匹配长度为 C·|s2|+j；j 指向下一所需字符。只在块边界比较 j；块中间即使 j 相同，后续输入也可能不同，不能据此跳过。跳过完整循环后，前缀长度和计数同步推进，不变量继续成立。",
    "Invariant (a fact preserved by every operation): the longest matched target prefix of the consumed input has length C·|s2|+j; j points to the next needed character. Compare j only at block boundaries. Equal j inside a block may face different next input, so it does not justify a skip. A whole-cycle jump advances the input prefix and counts together, preserving this fact."
  ],
  "simulation": [
    "下面是独立的浏览器模拟，并非执行 Python。每帧发生在一个字符、一个块边界或一次明确标出的整圈跳跃之后。历史保留实际演示的全部事件；跳跃行写明省略的块数与新增份数。教学历史的内存不属于提交算法的额外空间。",
    "This is a separate browser simulation, not execution of Python. Each frame follows a character, a block boundary, or an explicitly labeled whole-cycle jump. History retains every demonstrated event; a jump states how many scans were omitted and how many copies were gained. Teaching-history storage is separate from submission auxiliary space."
  ],
  "experiment": [
    "先选“跨块匹配”，逐字符前进，观察边界 j:0→2→0；再选“百万块”，找到跳跃行，比较跳跃前后的 C。换预设会重置本实验；不会清除独立预测题。后退会恢复所有读数。",
    "Select “Across blocks” and step through characters, watching boundary j:0→2→0. Then select “Million blocks” and compare C before and after the jump. Changing presets restarts this experiment; it leaves the independent prediction alone. Back restores every readout."
  ],
  "presets": [
    "实验输入（切换会重新开始）",
    "Experiment input (changing it restarts)"
  ],
  "p0": [
    "手算：acb × 2 / ab × 1",
    "Hand case: acb × 2 / ab × 1"
  ],
  "p1": [
    "跨块：ab × 4 / aba × 1",
    "Across blocks: ab × 4 / aba × 1"
  ],
  "p2": [
    "官方例 1：acb × 4 / ab × 2",
    "Official 1: acb × 4 / ab × 2"
  ],
  "p3": [
    "百万块：ab × 1000000 / aba × 2",
    "Million blocks: ab × 1000000 / aba × 2"
  ],
  "p4": [
    "缺字母：abc × 5 / d × 1",
    "Missing letter: abc × 5 / d × 1"
  ],
  "p5": [
    "分组余数：a × 3 / a × 2",
    "Grouping remainder: a × 3 / a × 2"
  ],
  "p6": [
    "官方例 2：acb × 1 / acb × 1",
    "Official 2: acb × 1 / acb × 1"
  ],
  "prev": [
    "后退一帧",
    "Back one frame"
  ],
  "next": [
    "前进一帧",
    "Advance one frame"
  ],
  "reset": [
    "回到起点",
    "Return to start"
  ],
  "end": [
    "查看终点",
    "Go to final frame"
  ],
  "position": [
    "模拟帧位置",
    "Simulation frame"
  ],
  "progress": [
    "帧 {i}/{total} · s1=\"{s1}\", n1={n1}; s2=\"{s2}\", n2={n2}",
    "Frame {i}/{total} · s1=\"{s1}\", n1={n1}; s2=\"{s2}\", n2={n2}"
  ],
  "blockLabel": [
    "已完成的 s1 块数",
    "Completed s1 blocks"
  ],
  "jLabel": [
    "j：下一个所需位置",
    "j: next needed index"
  ],
  "countLabel": [
    "C：已完成 s2 份数",
    "C: finished s2 copies"
  ],
  "needed": [
    "下一所需字符：s2[{j}] = {ch}",
    "Next needed character: s2[{j}] = {ch}"
  ],
  "start": [
    "尚未读取字符；初始边界 j=0, C=0。",
    "No characters read; initial boundary j=0, C=0."
  ],
  "charMatch": [
    "第 {b} 块、位置 {pos}：{ch} 等于所需的 {need}，接收。j: {before}→{j}；C: {oldCount}→{count}。",
    "Block {b}, index {pos}: {ch} equals the needed {need}; take it. j: {before}→{j}; C: {oldCount}→{count}."
  ],
  "charSkip": [
    "第 {b} 块、位置 {pos}：{ch} 不等于所需的 {need}，跳过。j={j}、C={count} 均不变。",
    "Block {b}, index {pos}: {ch} differs from the needed {need}; skip it. j={j} and C={count} stay unchanged."
  ],
  "boundary": [
    "第 {block} 块已完成：j={j}, C={count}。现在下一输入又是 s1 的开头，可以比较边界状态。",
    "Block {block} completed: j={j}, C={count}. Input now returns to the start of s1, so boundary states can be compared."
  ],
  "jump": [
    "边界 {oldBlock} 和 {from} 都有 j={j}。L={L}, G={G}；q={q}。省略 {skip} 个块，C: {fromCount}→{count}，块数: {from}→{block}。j 不变。",
    "Boundaries {oldBlock} and {from} both have j={j}. L={L}, G={G}; q={q}. Omit {skip} blocks, C: {fromCount}→{count}, blocks: {from}→{block}. j stays unchanged."
  ],
  "done": [
    "全部 {block} 个块已处理。C={count} 份 s2，答案 ⌊{count}/{n2}⌋={answer} 组。",
    "All {block} blocks processed. C={count} s2 copies; answer ⌊{count}/{n2}⌋={answer} groups."
  ],
  "history": [
    "累积事件历史：行号是模拟事件，不是输入索引",
    "Accumulated history: row numbers are simulation events, not input indices"
  ],
  "scroll": [
    "事件表可横向滚动；聚焦后用方向键查看。",
    "The event table scrolls horizontally; focus it and use arrow keys."
  ],
  "event": [
    "事件",
    "Event"
  ],
  "action": [
    "刚完成的操作",
    "Operation just completed"
  ],
  "stateHead": [
    "操作后 (块数, j, C)",
    "After (blocks, j, C)"
  ],
  "initial": [
    "起点",
    "Start"
  ],
  "take": [
    "接收",
    "Take"
  ],
  "skip": [
    "跳过",
    "Skip"
  ],
  "blockEvent": [
    "块边界",
    "Block boundary"
  ],
  "jumpEvent": [
    "整圈跳跃",
    "Whole-cycle jump"
  ],
  "doneEvent": [
    "最终分组",
    "Final grouping"
  ],
  "quiz": [
    "新问题：s1=\"ba\", n1=7, s2=\"aba\", n2=2。在块边界，j 是下一个所需字符的位置，C 是已完成的 aba 份数。最终能留下几组（每组两份 aba）？先选，再揭晓。",
    "Fresh case: s1=\"ba\", n1=7, s2=\"aba\", n2=2. At a block boundary, j is the next needed index and C counts finished aba copies. How many groups can remain, with two aba copies per group? Choose before revealing."
  ],
  "option0": [
    "2 组：按 a 和 b 的数量算",
    "2 groups: count the a and b letters"
  ],
  "option1": [
    "0 组：一个 ba 里没有 aba",
    "0 groups: one ba contains no aba"
  ],
  "option2": [
    "1 组：带着未完成的位置跨块",
    "1 group: carry unfinished progress across blocks"
  ],
  "reveal": [
    "核对预测",
    "Check prediction"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "这次预测漏掉了顺序或跨块状态。",
    "This prediction misses order or progress across blocks."
  ],
  "answer": [
    "边界 (j,C)：(0,0)→(1,0)→(0,1)，所以 L=2、G=1。第 2 块后还剩 5 块，只能再跳 2 圈（4 块）达到 C=3；最后一块留下 j=1，不能凑出第四份。共 3 份 aba，⌊3/2⌋=1 组。数量法忽略了开头多余的 b 和末尾未完成的 a；逐块独算则丢掉了跨块匹配。",
    "Boundary (j,C): (0,0)→(1,0)→(0,1), so L=2, G=1. After block 2, five blocks remain: skip two more cycles (4 blocks) to reach C=3. The last block leaves j=1, not a fourth copy. Thus 3 aba copies give ⌊3/2⌋=1 group. Letter counting ignores the unused opening b and unfinished closing a; independent per-block counting loses matches across boundaries."
  ],
  "codeIntro": [
    "这一步要回答：怎样让代码只扫描少量块？j 是下一个所需位置，count 对应 C，block 是已完成块数。seen[j] 保存第一次遇到该边界的 (block,count)。字符匹配分支对应“接收”；块末的重复检查对应“整圈跳跃”。jumped 让跳跃公式只计算一次，之后直接扫不足一圈的尾部。",
    "How does the code scan only a few blocks? j is the next needed index, count corresponds to C, and block counts completed blocks. seen[j] saves the first boundary’s (block,count). The character branch maps to “Take”; the repeated-boundary check maps to “Whole-cycle jump”. jumped computes that jump only once, then scans the tail of less than one cycle."
  ],
  "cost": [
    "令 a=|s1|、b=|s2|。j 只有 b 个可能值，连同初始边界，在至多 b 个块内就会重复；若 n1 更小则直接结束。首次跳跃后剩余少于 L≤b 个块。因此时间 O(a·min(n1,b))，字典额外空间 O(min(n1,b))，按整数为机器字计。浏览器存储的逐字符历史不在此成本内。",
    "Let a=|s1| and b=|s2|. There are only b possible j values. Including the initial boundary, a state repeats within at most b blocks; if n1 is smaller, scanning simply ends. After the first jump fewer than L≤b blocks remain. Time is O(a·min(n1,b)); the dictionary uses O(min(n1,b)) auxiliary space, treating integers as machine words. The browser’s character history is extra teaching storage."
  ],
  "bounds": [
    "边界：缺少所需字母时可能得到 G=0，循环仍能跳过，答案为 0；n1=1 也可直接扫描；C<n2 时答案为 0；不完整的 s2 或不满 n2 份的一组都被丢弃。输入字符串不被修改。n1、n2 不能为 0，空字符串不在官方范围内。",
    "Boundaries: a missing required letter can give G=0; skipping remains valid and the answer is 0. n1=1 can be scanned directly. C<n2 gives answer 0. An unfinished s2 or a group with fewer than n2 copies is discarded. Input strings are unchanged. Zero repetition counts and empty strings are outside the official domain."
  ],
  "verify": [
    "验证方式：用保留所有可达到目标前缀长度的动态规划作独立小规模预言机，检查原始 Python 的返回值；另对浏览器每个字符状态及跳跃前后逐一对账。测试证据是作者自查，不是独立评审、学习成效或 LeetCode 提交通过的证明。",
    "Verification uses an independent small-input dynamic program retaining all reachable target-prefix lengths to check original Python results. Browser character states and both sides of jumps are checked separately. This evidence is an author self-check, not independent review, measured learner comprehension, or a LeetCode acceptance result."
  ],
  "related": [
    "继续比较状态为什么足够",
    "Compare why a state is sufficient"
  ],
  "related0": [
    "正则匹配：前缀状态与字符条件",
    "Regex matching: prefix states and character guards"
  ],
  "related1": [
    "通配符匹配：空前缀与状态转移",
    "Wildcard matching: empty prefixes and transitions"
  ],
  "foot": [
    "作者候选 · 浏览器模拟与 Python 执行分别验证 · 独立评审待进行",
    "Author candidate · Browser simulation and Python tested separately · Independent review pending"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
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
    "查看完整 Python 提交源码",
    "Inspect complete Python submission"
  ],
  "copied": [
    "已复制完整源码。",
    "Complete source copied."
  ],
  "fallback": [
    "剪贴板不可用，请在下方手动复制。",
    "Clipboard unavailable. Copy manually below."
  ]
};
