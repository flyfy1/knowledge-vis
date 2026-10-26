window.LESSON_COPY = {
  "docTitle": [
    "#1096 · 花括号展开 II",
    "#1096 · Brace Expansion II"
  ],
  "title": [
    "#1096 · 花括号展开 II",
    "#1096 · Brace Expansion II"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "difficulty": [
    "困难 · 集合与递归解析 · Python",
    "Hard · Sets and recursive parsing · Python"
  ],
  "intro": [
    "a{b,c} 可以拼出哪些词？先手算两个结果，再让嵌套花括号各自守住自己的选择。",
    "Which words can a{b,c} spell? Calculate two results by hand, then keep each nested group’s choices in its own scope."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "学习步骤",
    "Lesson steps"
  ],
  "nav1": [
    "01 手算",
    "01 By hand"
  ],
  "nav2": [
    "02 保留什么",
    "02 What to keep"
  ],
  "nav3": [
    "03 逐步解析",
    "03 Parse step by step"
  ],
  "nav4": [
    "04 先预测",
    "04 Predict first"
  ],
  "nav5": [
    "05 Python",
    "05 Python"
  ],
  "h1": [
    "一个前缀，两种结尾",
    "One prefix, two endings"
  ],
  "p1": [
    "问题：输入字符串 a{b,c} 表示哪些不同的词？花括号内逗号表示“任选其一”，所以 {b,c} 提供 b 和 c。相邻部分要拼接，也就是把左词接在右词前面。a+b=ab，a+c=ac，返回 [\"ab\",\"ac\"]。集合只保留每个词一次；最终列表按字典序（字母比较顺序）排序。",
    "Question: which distinct words does the input a{b,c} represent? A comma inside braces means alternatives, so {b,c} offers b and c. Adjacent parts concatenate: join a left word before a right word. Thus a+b=ab and a+c=ac, returning [\"ab\",\"ac\"]. A set keeps each word once; the final list is sorted lexicographically, by letter order."
  ],
  "constraints": [
    "官方保证输入合法，长度 1–60，只含小写英文字母、花括号和逗号。单个字母表示一个词；并集收集所有备选词且去重；拼接要取左右集合的每一种配对。输出所有不同的词，不只输出数量。",
    "The official input is valid, length 1–60, with lowercase English letters, braces and commas only. A letter represents one word. Union collects alternatives without duplicates. Concatenation takes every pairing from the left and right sets. Return all distinct words, not merely their count."
  ],
  "handTask": [
    "按“揭示下一次配对”，看同一个 a 如何用于两个结尾。重置只清除此处的手算记录。",
    "Reveal the next pairing and watch the same a serve both endings. Reset clears only this hand calculation."
  ],
  "handNext": [
    "揭示下一次配对",
    "Reveal next pairing"
  ],
  "resetHand": [
    "重置手算",
    "Reset hand calculation"
  ],
  "handInitial": [
    "尚未配对：左集合 {\"a\"}，右集合 {\"b\",\"c\"}。",
    "No pairings yet: left set {\"a\"}, right set {\"b\",\"c\"}."
  ],
  "hand0": [
    "取左 a、右 b：a+b=ab，已有 {\"ab\"}。",
    "Take left a and right b: a+b=ab, collected {\"ab\"}."
  ],
  "hand1": [
    "取左 a、右 c：a+c=ac，已有 {\"ab\",\"ac\"}。两个配对已全部完成。",
    "Take left a and right c: a+c=ac, collected {\"ab\",\"ac\"}. Both pairings are complete."
  ],
  "h2": [
    "逗号分支与连续拼接，不能混在一起",
    "Separate alternatives from concatenation"
  ],
  "p2": [
    "问题：能否先把花括号替换掉？一个正确的基线（直接方法）找最先出现的 } 及其最近的 {，此时组内没有嵌套；按逗号枚举替换，继续直到没有花括号，再去重、排序。a{b,c} 分成 ab、ac。下面的 visit 是递归调用：函数调用自身处理较小的字符串；没有 } 时，把完整词加入集合并返回。",
    "Question: could we replace the braces first? A correct baseline, or direct method, finds the first } and nearest preceding {; that group has no nesting. Branch over its comma-separated replacements, repeat until no braces remain, then deduplicate and sort. For a{b,c}, the branches are ab and ac. Below, visit calls itself recursively on a smaller string. With no } left, it adds a complete word to the set and returns."
  ],
  "baseSource": [
    "查看小输入基线 Python",
    "Inspect small-input baseline Python"
  ],
  "baseWhy": [
    "但 {a,a}{b,c} 会走 ab、ac、ab、ac 四条终端分支，只有两个不同词。若每一层先用集合去重，第一个 {a,a} 就变成 {\"a\"}，后面只需两次配对。这里节省的是重复分支；若每个结果都不同，仍必须生成全部结果。",
    "But {a,a}{b,c} produces four terminal branches: ab, ac, ab, ac, with only two distinct words. Deduplicating each group turns {a,a} into {\"a\"} first, so only two later pairings are needed. This saves duplicate branches. When every result differs, all results must still be generated."
  ],
  "state": [
    "在 a{b,c} 中，先读 a：当前连续拼接的词是 T={\"a\"}，已结束的逗号分支 U=∅。子组从 U=∅、T={\"\"} 开始；\"\" 是空词，拼接后不改变另一词。读 b 后 T={\"b\"}；逗号把它放入 U，再把 T 重置为 {\"\"}；读 c 得 T={\"c\"}。子组返回 U∪T={\"b\",\"c\"}，父层把自己的 {\"a\"} 与它配对，得到 {\"ab\",\"ac\"}。∪ 表示收集双方词并去重。",
    "In a{b,c}, first read a: the current concatenation is T={\"a\"} and completed comma alternatives are U=∅. The child starts with U=∅, T={\"\"}. Here \"\" is the empty word: joining it leaves the other word unchanged. Reading b gives T={\"b\"}; the comma moves it into U and resets T to {\"\"}; reading c gives T={\"c\"}. The child returns U∪T={\"b\",\"c\"}. The parent pairs its own {\"a\"} with that result to get {\"ab\",\"ac\"}. The symbol ∪ collects words from both sets without repeats."
  ],
  "formula": [
    "原子 A = 一个字母或完整子组的词集合。接入 A：T ← {x+y | x∈T, y∈A}；逗号：U ← U∪T，T ← {\"\"}；本层结束：返回 U∪T。",
    "An atom A is the word set of one letter or a complete child group. Append A: T ← {x+y | x∈T, y∈A}; comma: U ← U∪T, T ← {\"\"}; end of this level: return U∪T."
  ],
  "invariant": [
    "这些变化给出不变量，即每步保持的事实：U 恰好包含本层已结束的逗号分支；T 恰好包含本层当前分支中已完成部分的所有拼接。初始没有备选分支，且空词不会漏掉第一个字母；配对列出且只列出合法延续；逗号只提交当前分支。因此到 } 或输入末尾时，U∪T 恰好覆盖本层全部词。子组依同一规则正确返回，按嵌套层数归纳，最外层也正确。",
    "These changes give an invariant, a fact preserved after each step: U contains exactly the completed comma alternatives at this level; T contains exactly all concatenations of completed parts in the current alternative. Initially there are no alternatives, and the empty word preserves the first letter. Pairing generates all and only legal continuations; a comma commits just the current alternative. At } or the input’s end, U∪T therefore contains exactly this level’s words. Applying the same argument to children proves correctness outward through the nesting."
  ],
  "wrong": [
    "诱人的错误：按所有逗号切开，再把字母集合全部合并。a{b,c} 会被错当成 a{b 与 c}，丢掉 ac 的前缀 a；{a,b}c 的正确结果是 ac、bc，不是 a、bc。逗号只属于自己的花括号层，拼接必须在该层分支内完成。",
    "Tempting mistake: split at every comma, or union all letter sets. Splitting a{b,c} gives broken pieces a{b and c}, losing the prefix a on ac. Likewise {a,b}c means ac and bc, not a and bc. A comma belongs to its own brace level; concatenation must finish within that level’s alternative."
  ],
  "h3": [
    "看子调用如何把集合交还父层",
    "Watch a child return its set"
  ],
  "p3": [
    "问题：为什么子组里的逗号不会清掉父层前缀？每次 parse 调用都有自己的 U（已结束的备选词）和 T（当前分支的拼接词）；最下方是当前调用，其他调用等待它。i 是下一个未读字符的零起始位置。父层的 T 保持不变，子调用返回完整集合后才参与配对；共享的 i 继续向右，不需要撤销父层集合。",
    "Question: why can a child’s comma never erase the parent prefix? Each parse call has its own U, the completed alternatives, and T, the current concatenation. The bottom card is the current call; others wait. The cursor i is the zero-based position of the next unread character. The parent’s T stays unchanged until the child returns a complete set for pairing. The shared i moves right; no undo of parent sets is needed."
  ],
  "simulation": [
    "教学状态模拟：JavaScript 模型呈现 Python 的规则，并未执行下方提交代码。每帧对应一个已标明的操作或调用边界；本页预设保留所有帧，无跳步。集合按字典序显示方便核对，提交仅在最后排序。历史快照的存储不是提交空间。",
    "Teaching-state simulation: a JavaScript model illustrates the Python rules; it does not execute the submission below. Each frame marks an operation or call boundary. All frames for these presets are retained. Sets are displayed sorted for inspection; the submission sorts only at the end. History storage is separate from submission space."
  ],
  "preset": [
    "示例编号（改选会重启本轨迹）",
    "Example number (change restarts this trace)"
  ],
  "selectedExpression": [
    "当前输入：{s}",
    "Current input: {s}"
  ],
  "task": [
    "保持表达式不变，逐步前进：先看 i 的下一个字符，再比较操作中的旧 T、子集合和新 T。遇到子组返回时，先核对子层 U∪T，再前进一步看父层配对。后退恢复完整快照；手算与预测题独立保留。",
    "Keep the expression fixed and advance. First inspect the next character at i, then compare old T, the atom set, and new T in the operation. At a child return, check its U∪T; advance once more to see the parent’s pairing. Back restores a full snapshot. The hand calculation and prediction stay independent."
  ],
  "tokenHelp": [
    "字符下面是零起始位置；橙色下边框及“下一项”标记 i，蓝色字形表示已读前缀；它们都不是输出词。",
    "Numbers under characters are zero-based positions. An orange underline and “next” mark i; cyan characters mark the consumed prefix. These are input characters, not output words."
  ],
  "nextToken": [
    "下一项",
    "next"
  ],
  "endToken": [
    "输入末尾",
    "end of input"
  ],
  "progress": [
    "操作 {k}/{n} · 已读字符 {i}/{len}",
    "Operation {k}/{n} · consumed characters {i}/{len}"
  ],
  "callTitle": [
    "调用 {d} · 起始位置 {start} · {role}",
    "Call {d} · starts at {start} · {role}"
  ],
  "active": [
    "当前层",
    "current level"
  ],
  "waiting": [
    "等待子层返回",
    "waiting for child"
  ],
  "uLabel": [
    "U · 本层已结束的备选词",
    "U · prior words"
  ],
  "tLabel": [
    "T · 本层当前分支的词",
    "T · current words"
  ],
  "enter": [
    "开启本层：U=∅，T={\"\"}，尚未读取本层字符。",
    "Enter this level: U=∅, T={\"\"}; no character at this level read yet."
  ],
  "descend": [
    "读入 {，i 前移；父层 U、T 不变，接下来开启独立子调用。",
    "Read { and advance i. Parent U and T stay unchanged; next enter an independent child call."
  ],
  "product": [
    "拼接：旧 T={before}，原子 A={atom}；列出每种左右配对，得到新 T={after}。",
    "Concatenate: old T={before}, atom A={atom}. Every left/right pairing gives new T={after}."
  ],
  "comma": [
    "读入逗号：旧 U={before}，提交 T={term}，得到 U={after}；T 重置为 {\"\"}。",
    "Read comma: old U={before}; commit T={term} to get U={after}; reset T to {\"\"}."
  ],
  "returnEvent": [
    "本层遇到 } 或输入末尾：返回 U∪T={result}。本帧仍显示即将返回的子层；下帧由父层消费 } 并配对（最外层则输出）。",
    "This level reaches } or end of input: return U∪T={result}. This frame still shows the returning level. Next the parent consumes } and pairs it (or the outermost call emits the answer)."
  ],
  "done": [
    "最外层返回，排序后的最终答案：{result}。",
    "Outermost call returned. Sorted final answer: {result}."
  ],
  "pending": [
    "最终答案：尚未输出。",
    "Final answer: not emitted yet."
  ],
  "emptyStack": [
    "全部调用已返回。",
    "All calls have returned."
  ],
  "prev": [
    "← 后退一个操作",
    "← Previous operation"
  ],
  "next": [
    "前进一个操作 →",
    "Next operation →"
  ],
  "end": [
    "跳至最终答案",
    "Go to final answer"
  ],
  "reset": [
    "重置轨迹",
    "Reset trace"
  ],
  "history": [
    "已完成操作记录",
    "Completed operation history"
  ],
  "h4": [
    "新的外部前缀与重复分支",
    "A fresh prefix with duplicate alternatives"
  ],
  "p4": [
    "问题：x{a,{a,b}}y 的不同词按字典序是什么？并集表示收集备选且去重，拼接表示取每一种左右配对。用本层 U、T 的含义判断：内层重复的 a 是否会让外层的 x 或 y 丢失？先选再核对。",
    "Question: what is the sorted list of distinct words for x{a,{a,b}}y? Union collects alternatives once; concatenation takes every left/right pairing. Use the meaning of U and T: can a repeated inner a remove the outer x or y? Choose before checking."
  ],
  "legend": [
    "预测输出",
    "Predict the output"
  ],
  "q0": [
    "A · [\"xay\",\"xay\",\"xby\"]",
    "A · [\"xay\",\"xay\",\"xby\"]"
  ],
  "q1": [
    "B · [\"xay\",\"xby\"]",
    "B · [\"xay\",\"xby\"]"
  ],
  "q2": [
    "C · [\"a\",\"b\",\"xy\"]",
    "C · [\"a\",\"b\",\"xy\"]"
  ],
  "reveal": [
    "核对并揭示原因",
    "Check and reveal why"
  ],
  "chosen": [
    "已选择；答案仍隐藏。",
    "Choice saved; answer is still hidden."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查集合与拼接。",
    "Recheck union and concatenation."
  ],
  "answer": [
    "内层 {a,b} 返回 {\"a\",\"b\"}；外组把单独的 a 与它取并集，仍是 {\"a\",\"b\"}。父层 T={\"x\"} 先配成 {\"xa\",\"xb\"}，再与 {\"y\"} 配成 [\"xay\",\"xby\"]。A 保留了重复推导，C 把相邻拼接误做并集。",
    "The inner {a,b} returns {\"a\",\"b\"}; union with the separate a still gives {\"a\",\"b\"}. Parent T={\"x\"} first becomes {\"xa\",\"xb\"}, then pairs with {\"y\"} to give [\"xay\",\"xby\"]. A retains duplicate derivations. C mistakes adjacent concatenation for union."
  ],
  "h5": [
    "把集合规则写成 Python",
    "Turn set rules into Python"
  ],
  "p5": [
    "问题：哪一行对应刚才的集合配对？官方接口是 Solution.braceExpansionII(self, expression: str) -> list[str]。parse 的局部 union、term 就是 U、T；nonlocal i 让子调用与父调用共享读取位置。遇 { 先前移 i 再调用 parse；子调用停在 } 前，由父调用跳过它。到输入末尾时，最外层返回。每轮消费一个字符或完成一个子组，合法输入保证调用最终结束，输入字符串不变。",
    "Question: which line implements the pairing? The official interface is Solution.braceExpansionII(self, expression: str) -> list[str]. Locals union and term are U and T; nonlocal i shares the read position across calls. At {, advance i before calling parse. The child stops before }, which the parent skips. The outermost call returns at end of input. Every iteration consumes a character or completes a child group, so valid input terminates. The input string is unchanged."
  ],
  "mapping": [
    "term = {left + right for left in term for right in atom} 是集合推导式：两个 for 枚举左右全部配对，花括号自动去重。例如 {\"a\"} 配 {\"b\",\"c\"} 得 {\"ab\",\"ac\"}。union.update(term) 将当前词加入已结束分支；union | term 是并集，set() 是空集合，{\"\"} 却含一个空词，两者不能互换。sorted 把集合转成有序列表。",
    "term = {left + right for left in term for right in atom} is a set comprehension: the two for clauses enumerate every left/right pair, and braces remove duplicates. Pairing {\"a\"} with {\"b\",\"c\"} gives {\"ab\",\"ac\"}. union.update(term) adds current words to completed alternatives; union | term is union. set() is empty, whereas {\"\"} contains one empty word: they are not interchangeable. sorted converts a set to an ordered list."
  ],
  "boundaries": [
    "边界：z 返回 [\"z\"]；abc 返回 [\"abc\"]，不是三个单词；{a,a} 返回 [\"a\"]；{{a,b},c}d 返回 [\"ad\",\"bd\",\"cd\"]。官方例一输出 ac、ad、ae、bc、bd、be，例二输出 a、ab、ac、z。空输入、空分支和不匹配括号不在保证范围；空词只用作内部拼接起点。",
    "Boundaries: z returns [\"z\"]; abc returns [\"abc\"], not three words; {a,a} returns [\"a\"]; {{a,b},c}d returns [\"ad\",\"bd\",\"cd\"]. Official example one yields ac,ad,ae,bc,bd,be; example two yields a,ab,ac,z. Empty input, empty alternatives and unmatched braces are outside the guaranteed grammar. The empty word is only an internal concatenation seed."
  ],
  "costs": [
    "成本不是 O(n)：令 n 为输入字符数，K 为不同最终词数，W≥1 为解析中任一集合的最大词数（含内部 {\"\"}）。至多 n 次配对，每次至多 W² 对；每次拼接及散列至多处理 n 个字符。保守上界为 O(n²W²+nK log K) 期望时间、O(n²W) 空间（含结果）：至多 n 层，每层存 O(W) 个长至 n 的词。最后排序的比较每次至多 O(n)。{a,b} 连续 t 组有 2^t 个不同词，任何输出它们的解法都不能只花 O(n) 时间。",
    "Costs are not O(n). Let n be input length, K the distinct final word count, and W≥1 the largest set size anywhere during parsing, including {\"\"}. At most n product steps each examine at most W² pairs; concatenation and hashing each handle up to n characters. A conservative bound is O(n²W²+nK log K) expected time and O(n²W) space including results: at most n levels each keep O(W) words of length up to n. Each final sort comparison costs up to O(n). Repeating {a,b} for t groups yields 2^t distinct words; emitting them cannot take only O(n) time."
  ],
  "baseCosts": [
    "基线中，B 是包括重复推导的终端分支数。深度优先替换至多 n 层，每次查找和重写 O(n)，给出 O(n²B+nK log K) 期望时间上界；保留递归字符串和不同结果，空间 O(n²+nK)。没有花括号的长串也要读取，单字母 n=1、W=1 也满足这些上界。这里的保守界不是实测耗时。",
    "For the baseline, B counts terminal branches including duplicate derivations. Depth-first substitution has at most n levels with O(n) scanning and rewriting per step, giving an upper bound of O(n²B+nK log K) expected time. Retained recursive strings and distinct results use O(n²+nK) space. Even a long brace-free string must be read; n=1,W=1 also fits these bounds. These conservative bounds are not runtime measurements."
  ],
  "source": [
    "查看官方接口的完整 Python 解法",
    "Read the full Python solution for the official interface"
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
    "自动复制不可用；完整源码已选中，请使用系统复制快捷键。",
    "Automatic copy is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "fallback": [
    "手动复制完整 Python 源码",
    "Manually copy the full Python source"
  ],
  "related": [
    "继续理解分层解析",
    "Explore scoped parsing"
  ],
  "rel726": [
    "#726：每层保留自己的表，再合并子组（计数规则不同）",
    "#726: keep a table per level, then merge a child (different counting rules)"
  ],
  "rel224": [
    "#224：保存父层上下文，闭括号时合并（算术规则不同）",
    "#224: preserve parent context and merge at a close (different arithmetic rules)"
  ],
  "foot": [
    "本页交互为教学模拟；Python 源码可离线查看。",
    "Interactions are teaching simulations; Python source is available offline."
  ]
};
