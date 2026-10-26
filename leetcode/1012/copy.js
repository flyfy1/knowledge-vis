window.COPY = {
  "docTitle": [
    "1012 · 至少有 1 位重复的数字",
    "1012 · Numbers With Repeated Digits"
  ],
  "title": [
    "#1012 · 至少有 1 位重复的数字",
    "#1012 · Numbers With Repeated Digits"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "tagline": [
    "给 1 到 20 的号码贴标签：只有 11 的数字重复。怎样把这个手算方法扩展到十亿？",
    "Label the numbers from 1 to 20: only 11 repeats a digit. How can we scale this hand count to a billion?"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "nav1": [
    "1 · 数什么",
    "1 · What counts"
  ],
  "nav2": [
    "2 · 分组",
    "2 · Group"
  ],
  "nav3": [
    "3 · 前缀实验",
    "3 · Prefix lab"
  ],
  "nav4": [
    "4 · 先预测",
    "4 · Predict"
  ],
  "nav5": [
    "5 · Python",
    "5 · Python"
  ],
  "h1": [
    "1 · 11 为什么算一次？",
    "1 · Why does 11 count once?"
  ],
  "p1": [
    "这一步要回答：1 到 20 中，哪些正整数至少有一个数字出现两次？“重复”可以不相邻，例如 101；同一个数无论重复几次都只计一次。输入是整数 n，输出是闭区间 [1,n] 中这样的数的个数。",
    "Which positive integers from 1 to 20 contain a digit at least twice? Repeated occurrences need not be adjacent: 101 qualifies. Count each number once, however many repeats it has. Given integer n, return this count in the inclusive range [1,n]."
  ],
  "handHelp": [
    "先自己列出答案，再点按钮。这里固定 n=20；揭晓会同时列出两类数，不会改变后面的实验。",
    "Make your own list, then reveal it. This hand example fixes n=20; revealing both classes does not change the later experiment."
  ],
  "handShow": [
    "揭晓 1…20 的分类",
    "Reveal the 1…20 classification"
  ],
  "handHide": [
    "收起手算分类",
    "Hide the hand classification"
  ],
  "handUnique": [
    "不重复（19 个）：1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20。",
    "Unique digits (19 numbers): 1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20."
  ],
  "handRepeat": [
    "重复（1 个）：11。20 个数分成两类，所以 20 − 19 = 1。0 不是正整数，不在范围内；01 不是新的号码。",
    "Repeated digits (1 number): 11. The 20 numbers split into two classes, so 20 − 19 = 1. Zero is not positive; 01 is not a separate number."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 10⁹。例子：20 → 1；100 → 10；1000 → 262。没有取模。",
    "Official range: 1 ≤ n ≤ 10⁹. Examples: 20 → 1; 100 → 10; 1000 → 262. No modulus."
  ],
  "h2": [
    "2 · 先数没有重复的号码",
    "2 · Count the opposite class"
  ],
  "p2": [
    "这一步要回答：能否跳过逐个检查？基线方法把每个数转为十进制文本，再用集合（只保留每种数字一次）检查是否变短。n 最大十亿，逐个检查最多十亿个数；每次还要读各位数字。",
    "Can we avoid inspecting every integer? A baseline converts each number to decimal text, then uses a set, a collection keeping one copy of each digit, to detect a shorter digit count. At the limit it visits a billion numbers and reads their digits each time."
  ],
  "baselineTitle": [
    "正确但慢的 Python 基线",
    "Correct but slow Python baseline"
  ],
  "baselineCost": [
    "str(x) 产生十进制文本；set(s) 合并相同字符。D 是 n 的十进制位数：基线用 O(nD) 时间和 O(D) 临时空间。",
    "str(x) produces decimal text; set(s) merges equal characters. With D decimal digits in n, this baseline uses O(nD) time and O(D) temporary space."
  ],
  "complement": [
    "重复个数 = n − unique；unique 是 [1,n] 中各位互不相同的正整数个数。",
    "Repeated count = n − unique; unique counts positive integers in [1,n] whose digits are all different."
  ],
  "groups": [
    "仍看 n=20：一位数 1…9 有 9 个。两位数先取首位 1，末位可取 0,2,3,4,5,6,7,8,9，共 9 个；11 被排除。首位取 2 后，只有末位 0 不超过上界，所以再加 20。于是 unique=9+9+1=19。组内不逐个访问也能数完。",
    "Keep n=20. The one-digit numbers 1…9 contribute 9. With first digit 1, the last digit can be 0,2,3,4,5,6,7,8,9: another 9, excluding 11. With first digit 2, only last digit 0 stays within the bound, adding 20 itself. Thus unique=9+9+1=19, without visiting every member of each group."
  ],
  "wrongRule": [
    "诱人但错误：按“相同数字对”计数。111 中有三对相同位置，但只应算一个数；各重复条件会重叠。改数各位互异的数，再取补集（总数减相反类别），就不会重复计数。",
    "Tempting mistake: count matching digit pairs. The three matching position pairs in 111 still represent only one qualifying number. Repeat conditions overlap. Counting the opposite class of all-different numbers, then subtracting from the total, avoids that overlap."
  ],
  "h3": [
    "3 · 何时可以一次加一整组？",
    "3 · When can we add a whole block?"
  ],
  "p3": [
    "这一步要回答：首位之外也能这样分组吗？前缀指左边已经固定的数字；used 是这个前缀用过的数字集合。先计比 n 位数少的组；同位数时，逐位尝试比 n 当前位小、且未用过的数字。一旦这位更小，后面无论怎样合法填入都小于 n。",
    "Can we group beyond the first digit? A prefix is the digits already fixed on the left; used is the set of digits in that prefix. Count shorter lengths first. For equal-length numbers, try each unused digit smaller than the current digit of n. Once this digit is smaller, every legal suffix stays below n."
  ],
  "permIntro": [
    "后面还有 k 个位置、a 个可用数字时，第一个位置有 a 种，第二个只剩 a−1 种，依次相乘。记为 P(a,k)；没有位置要填时 P(a,0)=1。例如 n=321，在首位选 1 后，剩下 9 种、再 8 种，共 72 个号码。首位不能为 0，后面的 0 则是真实数字。",
    "With k positions left and a available digits, the first has a choices, the next a−1, and so on: multiply these counts. Call this P(a,k); P(a,0)=1 because an empty suffix has one completion. For n=321, choosing first digit 1 leaves 9 then 8 choices, giving 72 numbers. A first digit cannot be 0; later zeros are real digits."
  ],
  "formula": [
    "短长度 s：9 × P(9,s−1)；在从 0 开始的第 i 位选小数字：P(9−i,D−i−1)。",
    "Shorter length s: 9 × P(9,s−1); choose a smaller digit at zero-based position i: P(9−i,D−i−1)."
  ],
  "causal": [
    "公式中的 D 是 n 的位数。选小数字之前，i 个前缀数字互不相同；再选一个未用数字，总共用掉 i+1 个，所以十个数字剩 9−i 个。若选择与 n 相等的位，则仍不能自由填后缀，必须继续比较。若相等位已在 used 中，这条相等路径无法再生成各位互异的数，立即停止。",
    "Here D is the digit count of n. Before a smaller choice, i distinct prefix digits are used. Choosing one more unused digit consumes i+1 of the ten digits, leaving 9−i. Choosing the equal digit does not free the suffix: it must still be compared. If that equal digit is already in used, this remaining path can never produce an all-different number, so stop."
  ],
  "preset": [
    "选择上界 n",
    "Choose upper bound n"
  ],
  "presetsHelp": [
    "换预设会从头开始本实验。保持 n 不变，逐步看“本次新增”和累计账本；返回应恢复同一计数。",
    "Changing a preset restarts this experiment. Keep n fixed and watch each addition and the cumulative ledger; stepping back restores the same counts."
  ],
  "prev": [
    "← 返回一步",
    "← Previous operation"
  ],
  "next": [
    "执行下一操作 →",
    "Apply next operation →"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "end": [
    "到计数终点",
    "Go to count endpoint"
  ],
  "prefixLabel": [
    "仍与 n 相等的前缀",
    "Prefix still equal to n"
  ],
  "usedLabel": [
    "used：该前缀已用的数字",
    "used: digits in that prefix"
  ],
  "uniqueLabel": [
    "已计入的互异正整数",
    "Unique-digit integers counted so far"
  ],
  "resultLabel": [
    "最终重复个数",
    "Final repeated-digit count"
  ],
  "pending": [
    "尚未完成",
    "Not finished"
  ],
  "empty": [
    "空",
    "Empty"
  ],
  "initial": [
    "尚未计数。先按位数分组，再比较同位数前缀。",
    "Nothing counted yet. Group shorter lengths before comparing equal-length prefixes."
  ],
  "short": [
    "完成长度 {size} 的组：9 × P({a},{k}) = {amount}。首位有 9 种，后面依次减少。",
    "Completed length {size}: 9 × P({a},{k}) = {amount}. There are 9 first-digit choices, then fewer choices at each position."
  ],
  "block": [
    "完成前缀 {branch} 的组：P({a},{k}) = {amount}。本位 {digit} 小于 n 对应位；后缀可自由选未用数字。",
    "Completed block with prefix {branch}: P({a},{k}) = {amount}. Digit {digit} is below the corresponding bound digit; the suffix may use any remaining digits."
  ],
  "equal": [
    "检查第 {i} 位的 {digit}：未用过，保留相等前缀 {prefix}。本次新增 0；后缀仍受 n 约束。",
    "Checked digit {digit} at position {i}: unused, so retain equal prefix {prefix}. Added 0; the suffix remains bounded by n."
  ],
  "stop": [
    "第 {i} 位的 {digit} 已用过；相等路径停止，不能再加 n。最终 {n} − {unique} = {answer}。",
    "Digit {digit} at position {i} was already used. Stop the equal path without adding n. Final: {n} − {unique} = {answer}."
  ],
  "include": [
    "相等前缀完整且无重复：n 本身合法，新增 1。",
    "The full equal prefix has no repeat: n itself qualifies for unique, adding 1."
  ],
  "done": [
    "所有组已计完。最终 {n} − {unique} = {answer}。",
    "All groups are counted. Final: {n} − {unique} = {answer}."
  ],
  "progress": [
    "完成操作 {i}/{total}；当前上界 n={n}。账本只保留已完成的新增组。",
    "Operations completed: {i}/{total}; current upper bound n={n}. The ledger retains completed additions only."
  ],
  "ledgerTitle": [
    "累计账本：每张卡是一组互不相同的正整数",
    "Cumulative ledger: each card is a disjoint group of positive integers"
  ],
  "noLedger": [
    "尚未加入任何组。",
    "No groups added yet."
  ],
  "ledgerCount": [
    "本组 +{amount}；计入后累计 {total} 个",
    "This group +{amount}; cumulative after addition: {total} numbers"
  ],
  "current": [
    "← 刚完成的新增组",
    "← Just-completed addition"
  ],
  "invariant": [
    "不变式（每一步保持的事实）：成功保留一个相等位后，used 恰好等于相等前缀的各位；unique 包含所有更短的合法数，以及同长度中“首次变小的位置”已处理的数。长度不同不会重叠；相同长度的数有唯一的首次变小位置及该位数字，也不会跨组重复。剩下的数只能沿相等路径走。重复时这条路径全被排除；走到末尾则只剩 n，补加一次。这也证明不漏数。",
    "Invariant, a fact preserved by each step: after retaining an equal digit, used contains exactly the distinct equal-prefix digits. unique contains every valid shorter number and all equal-length numbers whose first smaller position has been processed. Different lengths cannot overlap. An equal-length number has exactly one first smaller position and digit, so its block is unique. All remaining numbers must follow the equal path. A repeat excludes that entire path; reaching its end leaves only n, added once. Thus nothing is missed."
  ],
  "simulation": [
    "这是组合计数的浏览器模拟，不执行下面的 Python 提交代码。所有分组操作均展示；账本和快照是教学存储，不属于提交代码的辅助空间。",
    "This browser simulation illustrates combinatorial counting; it does not execute the Python submission below. Every grouping operation is shown. Ledger and snapshots are teaching storage, separate from submission auxiliary space."
  ],
  "h4": [
    "4 · 新号码，先预测再揭晓",
    "4 · A fresh bound: predict before revealing"
  ],
  "p4": [
    "这一步要回答：n=121 时，重复数字的正整数有多少个？用“先数互异”的规则：先数更短的，再试小于上界的前缀。遇到相等位已经用过时该怎么办？这是独立题，不随实验预设变化。",
    "For n=121, how many positive integers have repeated digits? Count all-different numbers first: shorter lengths, then prefixes below the bound. What happens when an equal digit was already used? This exercise is independent of the lab preset."
  ],
  "choose": [
    "选择重复数字的个数",
    "Choose the repeated-digit count"
  ],
  "opt0": [
    "21 个",
    "21 numbers"
  ],
  "opt1": [
    "22 个",
    "22 numbers"
  ],
  "opt2": [
    "23 个",
    "23 numbers"
  ],
  "reveal": [
    "验证预测",
    "Check prediction"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "wrong0": [
    "21 把前缀 10 的组计成 9 个，误收了 101；数字 1 已用过。",
    "21 counts 9 numbers under prefix 10, incorrectly including 101; digit 1 was already used."
  ],
  "wrong2": [
    "23 漏掉了互异数 120；末位 0 没用过且小于 1。",
    "23 misses the all-different number 120; its 0 is unused and below 1."
  ],
  "answer": [
    "互异数：短长度 9+81=90；前缀 10 的组有 8 个（100…109 中排除 100 和 101）；前缀 11 不合法；前缀 12 后小于末位 1 的数字只有 0，得到 120。最后的相等 1 已用过，停止。unique=90+8+1=99，重复个数=121−99=22。",
    "Unique-digit count: shorter lengths give 9+81=90. Prefix 10 contributes 8 (100…109 excluding 100 and 101); prefix 11 is invalid. After prefix 12, only unused 0 is below the final 1, adding 120. The equal final 1 is already used, so stop. unique=90+8+1=99; repeated count=121−99=22."
  ],
  "h5": [
    "5 · 把分组变成 Python",
    "5 · Turn the groups into Python"
  ],
  "p5": [
    "这一步要回答：怎样实现“各组只算一次”？官方 Python 接口返回一个整数。perm(a,k) 从 1 开始乘 k 次，每次可选数字少一个；k=0 时循环不运行，所以返回 1。digits 把 n 转成从左到右的数字列表；enumerate 同时给出从 0 开始的位置 i 和对应的上界数字 limit。",
    "How do we implement counting each group once? The official Python interface returns an integer. perm(a,k) starts at 1 and multiplies k times, reducing available choices each time. For k=0 the loop does nothing and returns 1. digits converts n to a left-to-right digit list; enumerate supplies each zero-based position i and its bound digit limit."
  ],
  "mapping": [
    "代码映射：第一个 size 循环计短长度；digit 循环计“首次变小”的组；limit in used 在相等路径重复时立刻返回；used.add(limit) 记录本次相等位。range(start,limit) 不含 limit，所以相等位不会混入小数字组。最后 unique+1 只在所有位互异时加入 n。",
    "Code mapping: the size loop counts shorter lengths; the digit loop counts first-smaller blocks. limit in used returns immediately when the equal path repeats; used.add(limit) records a successful equal digit. range(start,limit) excludes limit, keeping equal and smaller cases separate. The final unique+1 adds n only when all its digits are distinct."
  ],
  "costs": [
    "成本：D=len(str(n))，十进制下 D≤10。每个位最多试 10 个数字，每次 perm 至多乘 D 次；短长度循环也至多 O(D²)，所以此实现 O(D²) 时间。数字列表占 O(D) 空间，used 至多 10 个元素，故辅助空间 O(D)。这里分析实际的乘法循环，不把 perm 当常数时间。",
    "Cost: D=len(str(n)), at most 10 in this decimal domain. Each position tries at most 10 digits and each perm multiplies at most D times. Shorter-length counting also takes at most O(D²), so this implementation uses O(D²) time. The digit list uses O(D) space; used holds at most 10 elements, giving O(D) auxiliary space. This counts the actual multiplication loops rather than treating perm as constant time."
  ],
  "boundaries": [
    "边界：n=1…9 返回 0；n=10 仍返回 0（0 可以出现在非首位）；n=11 返回 1；100 因第二个 0 停止。10⁹ 的自身重复，不加相等端点；每个正整数最多使用十个不同数字。",
    "Boundaries: n=1…9 returns 0. n=10 still returns 0 because a nonleading zero is allowed. n=11 returns 1; 100 stops at its second zero. The bound 10⁹ repeats digits, so its equal endpoint is excluded from unique. A positive integer can use at most ten distinct digits."
  ],
  "source": [
    "查看官方接口的 Python 源码",
    "View Python source for the official interface"
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
  "manual": [
    "自动复制不可用。完整源码已选中，请用系统复制快捷键。",
    "Automatic copy is unavailable. Full source selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "prefixLink": [
    "对照第 902 题：首个不同位为什么决定大小",
    "Compare problem 902: why the first differing digit decides the order"
  ],
  "blocksLink": [
    "对照第 60 题：固定下一位后怎样计整块",
    "Compare problem 60: count a whole block after fixing a digit"
  ],
  "related": [
    "继续理解这些机制",
    "Explore these mechanisms"
  ],
  "link1": [
    "回看本页的前缀不变式",
    "Revisit this lesson’s prefix invariant"
  ],
  "link2": [
    "第 60 题：排列的等大分组",
    "Problem 60: equal-size permutation blocks"
  ],
  "link3": [
    "第 902 题：上界内的数位计数",
    "Problem 902: counting digits under a bound"
  ]
};
