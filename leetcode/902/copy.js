window.LESSON_COPY = {
  "docTitle": [
    "#902 · 最大为 N 的数字组合",
    "#902 · Numbers At Most N Given Digit Set"
  ],
  "title": [
    "#902 · 最大为 N 的数字组合",
    "#902 · Numbers At Most N Given Digit Set"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "intro": [
    "用数字 1 和 3 写门牌号：不超过 31 的有几个？从亲手列出五个数，到一次数完一整组。",
    "Make house numbers using 1 and 3: how many are at most 31? Start with five numbers you can list, then count whole groups at once."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "badge": [
    "Hard · 组合计数",
    "Hard · Combinatorial counting"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "s0": [
    "亲手数五个",
    "Count five by hand"
  ],
  "s1": [
    "找到首个不同位",
    "Find the first difference"
  ],
  "s2": [
    "走完计数过程",
    "Walk the count"
  ],
  "s3": [
    "先预测再揭晓",
    "Predict, then reveal"
  ],
  "s4": [
    "对应 Python",
    "Connect to Python"
  ],
  "q0": [
    "这一步要回答：哪些正整数符合规则？",
    "Which positive integers obey the rules?"
  ],
  "statement": [
    "输入是可用数字列表 digits 和上界 n。每个数字可以重复使用，返回能写出的、≤ n 的正整数个数，不是这些整数的和。下文用 D 表示可用数字集合。",
    "The inputs are an allowed digit list digits and an upper bound n. Reuse any digit any number of times. Return the count of positive integers you can write that are ≤ n, rather than their sum. We write D for the allowed digit set."
  ],
  "constraints": [
    "官方范围：digits 含 1–9 个不同的单字符，按升序排列，字符只能为 1–9；1 ≤ n ≤ 10⁹。没有 0，因此不需要处理前导零；空数也不是正整数。",
    "Official bounds: digits has 1–9 distinct single characters in sorted order, all from 1–9; 1 ≤ n ≤ 10⁹. There is no zero, so there are no leading zeros. An empty number is not a positive integer."
  ],
  "hand": [
    "固定 D={1,3}, n=31。一位数有 1、3。两位数有 11、13、31；33 太大。三位数最小也是 111，已经超过 31。因此答案是 2+3=5。重复的 11 合法；n 本身 31 也要算。",
    "Fix D={1,3}, n=31. The one-digit numbers are 1 and 3. The two-digit numbers are 11, 13 and 31; 33 is too large. Even the smallest three-digit number, 111, exceeds 31. So the answer is 2+3=5. Repeating 1 in 11 is legal, and the bound 31 itself counts."
  ],
  "examples": [
    "官方示例：[1,3,5,7], n=100 → 20；[1,4,9], n=10⁹ → 29523；[7], n=8 → 1。",
    "Official examples: [1,3,5,7], n=100 → 20; [1,4,9], n=10⁹ → 29523; [7], n=8 → 1."
  ],
  "q1": [
    "这一步要回答：哪些整数可以不逐个生成，就确定全部合法？",
    "Which numbers can we certify without generating each one?"
  ],
  "baseline": [
    "基线方法：从 1 检查到 n，把每个整数转成字符串，逐位检查是否属于 D。它正确，因为每个候选数恰好检查一次，且只接受所有数位都合法的数。",
    "A baseline scans integers from 1 through n, converts each to a string, and checks whether every digit belongs to D. It is correct: it visits each candidate once and accepts exactly those using allowed digits."
  ],
  "baselineCost": [
    "设 L 是 n 的十进制位数。用集合查询，基线最坏需要 O(nL) 时间、O(L+m) 临时空间，其中 m 是可用数字个数。n 可到十亿；重复构造和检查每个整数太昂贵。下面用乘法代替枚举。",
    "Let L be the decimal length of n and m the number of allowed digits. With set membership, the baseline takes O(nL) worst-case time and O(L+m) temporary space. n can be a billion: constructing and checking every integer repeats too much work. Multiplication can replace enumeration."
  ],
  "shorter": [
    "先按长度分组。比 n 短的数全部更小。长度为 k 时，每个位置都有 m 个独立选择，因此有 mᵏ 个数。对于 {1,3},31，较短的只有一位：2¹=2。",
    "Group by length first. Every shorter number is smaller than n. For length k, each position has m independent choices, giving mᵏ numbers. For {1,3},31, the only shorter length is one: 2¹=2."
  ],
  "prefix": [
    "再看同长度数。前缀就是开头已经固定的数位，后缀是剩下的数位。把两位数写成 1_ 或 3_：1<3，所以 11、13 都比 31 小，个位无需再比较。若第一位是 3，它和上界相等，才需要比较个位：1=1 可以继续，3>1 必须排除。",
    "Now consider equal lengths. A prefix is the fixed beginning; a suffix is the remaining digits. Write the two-digit numbers as 1_ or 3_. Since 1<3, both 11 and 13 are below 31, regardless of the last digit. Starting with 3 ties the bound, so the last digit matters: 1=1 continues, while 3>1 is excluded."
  ],
  "rule": [
    "一般地，已匹配的前缀固定后，当前位选一个比上界小的数字，剩余 r 位每位都有 m 个选择，因此增加 mʳ。若有 c 个较小数字，则增加 c×mʳ。当前位相等时不立即加数，只继续比较下一位；当前位更大时没有合法后缀。r=0 时 m⁰=1，代表一种空后缀。",
    "In general, keep the earlier prefix equal to the bound. One smaller digit here permits mʳ suffixes, where r positions remain and m digits are available. With c smaller choices, add c×mʳ. An equal digit adds nothing yet: continue to the next position. A greater digit permits no valid suffix. When r=0, m⁰=1 counts the one empty suffix."
  ],
  "invariant": [
    "为什么不会重复或漏算？任何合法数要么更短，要么与 n 等长。在等长数中，找到首个不同位：它必须更小，而且这一个位置唯一。于是每一步之后，已计数的是较短数以及首个更小位置已处理的数；尚未决定的只剩与上界前缀完全相等的一条路径。若当前上界数字不在 D 中，这条路径消失，立即返回。若所有位置都相等，最后单独加 1，计入 n。",
    "Why is the count complete and disjoint? Any valid number is shorter or has the same length as n. For an equal-length number, its first differing digit must be smaller, and that position is unique. After each step, the counted blocks are shorter numbers and numbers whose first smaller position has been processed. Only the path matching the bound prefix remains undecided. If the current bound digit is absent from D, that path ends: return immediately. If all positions match, add 1 once for n itself."
  ],
  "wrong": [
    "两个诱惑：直接加 mᴸ 会把 33>31 也算进去；要求每一位都 ≤ 上界对应位则会漏掉 13≤31，因为个位 3>1。必须只看首个不同位！",
    "Two tempting shortcuts fail: adding all mᴸ words includes 33>31. Requiring every digit to be ≤ the corresponding bound digit rejects 13≤31 because 3>1 in the last position. Only the first difference decides!"
  ],
  "q2": [
    "这一步要回答：每次加了哪一组数，为什么还能继续或必须停止？",
    "Which block did we just add, and why can we continue or must we stop?"
  ],
  "task": [
    "先保持默认输入，点击“处理下一组”，观察累计记录里的 0→2→4→4→5。再改为“遇到 0”：前缀 3 匹配后，0 不可用，答案停在 4。更换案例会从零重启本实验；下面的预测题独立保留。",
    "Keep the default input and process the next group. Watch the retained ledger grow 0→2→4→4→5. Then choose “Missing 0”: after matching prefix 3, digit 0 is unavailable, so the answer stops at 4. Changing the case restarts this experiment at zero; the prediction exercise below is independent."
  ],
  "simulation": [
    "教学模拟：按位置完整展示计数操作，每组后缀以乘法汇总，不逐个列数；不执行下方 Python。历史快照用于教学，不属于提交代码的空间。",
    "Teaching simulation: all position-level counting operations are shown; suffixes are grouped by multiplication rather than enumerated. It does not execute the Python below. Retained teaching snapshots are separate from submission memory."
  ],
  "preset": [
    "案例（更换后从零重启）",
    "Case (changing restarts at zero)"
  ],
  "p0": [
    "手算 31",
    "Hand count 31"
  ],
  "p1": [
    "遇到 0",
    "Missing 0"
  ],
  "p2": [
    "官方 100",
    "Official 100"
  ],
  "p3": [
    "官方 10⁹",
    "Official 10⁹"
  ],
  "p4": [
    "单个 7",
    "Single 7"
  ],
  "p5": [
    "无合法数",
    "No valid number"
  ],
  "p6": [
    "全部数字",
    "All digits"
  ],
  "prev": [
    "退回上一组",
    "Previous group"
  ],
  "next": [
    "处理下一组",
    "Process next group"
  ],
  "reset": [
    "归零重置",
    "Reset to zero"
  ],
  "end": [
    "完成所有组",
    "Finish all groups"
  ],
  "position": [
    "已完成的操作数（可拖回）",
    "Completed operations (rewind here)"
  ],
  "progress": [
    "D={digits}；n={n} · 已完成 {i}/{last} 次操作",
    "D={digits}; n={n} · {i}/{last} operations completed"
  ],
  "legend": [
    "前缀是已经固定的开头数位，后缀是剩下的数位。下方每行是“此前前缀等于上界”时的一个数字选择；“继续”不是新加的数。位置从左到右，从 1 开始。历史中的“当前”仅标记最近完成的操作。",
    "A prefix is the already-fixed beginning; a suffix is the remaining digits. Each row below is one digit choice while the earlier prefix equals the bound. “Continue” adds no number yet. Positions run left to right from 1. “Current” in the history marks only the most recently completed operation."
  ],
  "initial": [
    "尚未计数。先处理所有更短的长度。",
    "Nothing counted yet. Process all shorter lengths first."
  ],
  "short": [
    "长度 {size}：每位 {m} 种选择，增加 {m}^{size} = {delta} 个。",
    "Length {size}: {m} choices per position; add {m}^{size} = {delta} numbers."
  ],
  "atPosition": [
    "位置 {p}：此前相等前缀为「{prefix}」，上界当前位 {current}；剩余 {r} 位。",
    "Position {p}: earlier equal prefix is “{prefix}”, bound digit {current}; remaining positions: {r}."
  ],
  "empty": [
    "空",
    "empty"
  ],
  "continue": [
    "上界数字可用，相等路径继续；这一行没有另加一个数。",
    "The bound digit is available: continue the equal path; this does not add another number."
  ],
  "cannotContinue": [
    "上界数字不可用，没有相等路径；本位置的较小分支仍全部计入。",
    "The bound digit is unavailable: there is no equal path; smaller branches at this position still count."
  ],
  "stop": [
    "停止：上界位 {current} 不在 D 中；不存在后续相等路径，计数已完成。",
    "Stop: bound digit {current} is absent from D; no equal path remains, so counting is complete."
  ],
  "exact": [
    "全部数位都匹配：把 n={n} 本身计入，增加 1。",
    "All digits matched: count n={n} itself, adding 1."
  ],
  "less": [
    "{prefix} + {r} 位任意后缀：{m}^{r} = {ways} 个",
    "{prefix} + any {r}-digit suffix: {m}^{r} = {ways} numbers"
  ],
  "equal": [
    "{prefix}：相等，继续（本行 +0）",
    "{prefix}: equal, continue (+0 here)"
  ],
  "greater": [
    "{prefix}：已经更大，排除（+0）",
    "{prefix}: already greater, exclude (+0)"
  ],
  "accounting": [
    "本次操作：此前 {before} 个 + 新增 {delta} 个 = 累计 {total} 个。",
    "This operation: {before} previously counted + {delta} added = {total} counted so far."
  ],
  "final": [
    "最终答案：{total} 个正整数。",
    "Final answer: {total} positive integers."
  ],
  "pending": [
    "计数尚未完成；当前累计 {total} 个。",
    "Counting is not finished; {total} counted so far."
  ],
  "history": [
    "已完成操作的累计记录",
    "Retained contribution ledger"
  ],
  "current": [
    " ← 当前",
    " ← current"
  ],
  "q3": [
    "这一步要回答：换一组数字，还能靠首个不同位计数吗？",
    "Can you transfer the first-difference rule to new digits?"
  ],
  "quiz": [
    "独立预测：D={2,5,8}, n=526。共有多少个合法正整数？先选答案，再揭晓。",
    "Independent prediction: D={2,5,8}, n=526. How many valid positive integers are there? Choose before revealing."
  ],
  "option0": [
    "24 个",
    "24 numbers"
  ],
  "option1": [
    "23 个",
    "23 numbers"
  ],
  "option2": [
    "22 个",
    "22 numbers"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还需调整。",
    "Try revising your count."
  ],
  "answer": [
    "答案 23。短长度给出 3+9=12。百位选 2<5，增加 3²=9；百位等于 5 时，十位只能取 2 继续。个位 2、5 小于 6，各增加 1，合计 12+9+2=23。6 不在 D 中，不能再加 n。24 多算了一个（例如把 526 计入）；22 漏掉了 522、525 中的一个。",
    "The answer is 23. Shorter lengths give 3+9=12. Hundreds digit 2<5 adds 3²=9. Matching 5, the tens digit must be 2 to continue. At the last position, 2 and 5 are below 6, adding one each: 12+9+2=23. Since 6 is unavailable, do not add n. A count of 24 adds an extra number (for example 526); 22 misses one of 522 and 525."
  ],
  "q4": [
    "这一步要回答：哪几行代码实现了分组、停止和最后的 +1？",
    "Which lines implement grouping, stopping, and the final +1?"
  ],
  "map0": [
    "powers[r] 保存 mʳ：r 个自由位置的填法数。powers[0]=1 表示一种空后缀；length 即 L，m=len(digits)。先累加 powers[size]，只包含比 n 短的长度。",
    "powers[r] stores mʳ, the ways to fill r free positions. powers[0]=1 represents the empty suffix; length is L and m=len(digits). Summing powers[size] first counts only shorter lengths."
  ],
  "map1": [
    "在每一位，smaller 统计严格更小的可用数字，matched 表示相等数字是否可用。total += smaller * powers[remaining] 对应模拟的当前位新增值。例如 {1,3},31 的首位新增 1×2¹=2。",
    "At each position, smaller counts strictly smaller allowed digits; matched says whether equality is possible. total += smaller * powers[remaining] is the simulated position contribution. For {1,3},31, the first position adds 1×2¹=2."
  ],
  "map2": [
    "not matched 立即返回，所有较小分支已计入；否则继续相等前缀（已经固定的开头数位）。只有整个循环走完，return total + 1 才计入 n。方法不改变 digits。",
    "If not matched, return immediately: all smaller branches are already counted. Otherwise continue the equal prefix (the already-fixed beginning). Only after the whole loop does return total + 1 count n. The method does not mutate digits."
  ],
  "cost": [
    "成本：L=len(str(n))，m=len(digits)。预计算幂 O(L)，每位扫描 m 个数字，总时间 O(Lm)，辅助空间 O(L)（上界字符串和幂表）。在官方范围 L≤10，整数可放入固定机器字；这里不推广到任意大整数。",
    "Cost: L=len(str(n)), m=len(digits). Precomputing powers costs O(L); scanning m digits at each position gives O(Lm) total time and O(L) auxiliary space for the bound string and powers. Under the official bounds L≤10, integers fit in fixed machine words; this is not a claim about arbitrary-size integers."
  ],
  "boundaries": [
    "边界：D={9},n=1 → 0；D={7},n=8 → 1；D={1,3},n=31 → 5（包含相等）；n=10⁹ 只有 10 位，第二位 0 不可用；全部 1–9 可写出的 ≤10⁹ 的数为 9+9²+…+9⁹=435848049。零、重复输入数字和空 D 不在官方输入范围。",
    "Boundaries: D={9},n=1 → 0; D={7},n=8 → 1; D={1,3},n=31 → 5 including equality. At n=10⁹ there are ten positions, but the second digit 0 is unavailable. With all digits 1–9, the count up to 10⁹ is 9+9²+…+9⁹=435848049. Zero, duplicate input digits, and an empty D are outside the official contract."
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
    "查看可提交的 Python3 源码",
    "Inspect the submittable Python3 source"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用。完整源码已选中，请使用系统复制快捷键。",
    "Automatic copy is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "verify": [
    "离线检查思路：对小 n 逐个检查整数，和分组算法对照；再检查每一步新增量的互斥性。浏览器模拟帮助理解这些分组，实际提交接口是下方的 Solution.atMostNGivenDigitSet。",
    "To check locally, scan integers for small n and compare with grouped counting, then verify that each contribution is disjoint. The browser simulation explains those groups; the actual submission interface is Solution.atMostNGivenDigitSet."
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "related0": [
    "整数分组与边界 → 缺失的第一个正数",
    "Integer bounds → First Missing Positive"
  ],
  "related1": [
    "按选择分块计数 → 第 k 个排列",
    "Count blocks of choices → Permutation Sequence"
  ],
  "foot": [
    "图中是分组计数的教学模拟。源码可离线查看；不包含在线提交服务。",
    "The diagram is a teaching simulation of grouped counting. Source viewing works offline; there is no online submission service."
  ]
};
