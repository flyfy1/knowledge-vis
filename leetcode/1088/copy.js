window.COPY = {
  "docTitle": [
    "1088 · 易混淆数 II",
    "1088 · Confusing Number II"
  ],
  "title": [
    "#1088 · 易混淆数 II",
    "#1088 · Confusing Number II"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navLabel": [
    "课程步骤",
    "Lesson steps"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "badge": [
    "困难 · 计数",
    "Hard · Counting"
  ],
  "intro": [
    "把一个数倒过来看（旋转 180°）：有的变成另一个数，有的变回自己，有的根本不是数了。1 到 10 亿里有多少个“变成另一个数”的？不用一个个看也能数出来。",
    "Turn a number upside down (rotate it 180°): some become a different number, some come back unchanged, some stop being a number at all. How many of 1 to a billion become a different number? You can count them without looking at each one."
  ],
  "contract": [
    "规则：数字 0、1、8 旋转后不变，6 和 9 互换，2、3、4、5、7 旋转后不是数字。旋转整个数时，每一位各自旋转，而且顺序倒过来（原来的最后一位到了最前面），结果的前导 0 去掉。如果一个数每一位都能旋转，且旋转结果与原数不同，就叫“易混淆数”。给定 n（1 ≤ n ≤ 10⁹），返回 1 到 n（含 n）中易混淆数的个数。",
    "Rules: digits 0, 1 and 8 turn into themselves, 6 and 9 swap, and 2, 3, 4, 5, 7 are not digits after turning. Turning a whole number turns every digit and reverses their order (the last digit comes first); leading zeros of the result are dropped. A number is confusing when every digit can turn and the result differs from the original. Given n (1 ≤ n ≤ 10⁹), return how many confusing numbers lie in 1..n, including n."
  ],
  "access": [
    "官方题面仅对订阅用户开放；上面是本页自写的转述，例子也都是自编的。请以官方页面为准。",
    "The official statement is for subscribers only. The text above is this page’s own restatement, and all examples are our own; the official page is authoritative."
  ],
  "nav1": [
    "1 · 旋转是什么意思",
    "1 · What turning does"
  ],
  "h1": [
    "1. 旋转是什么意思",
    "1. What turning does"
  ],
  "nav2": [
    "2 · 逐个检查为什么不行",
    "2 · Why not check each number"
  ],
  "h2": [
    "2. 逐个检查为什么不行",
    "2. Why not check each number"
  ],
  "nav3": [
    "3 · 把可转数分成两堆",
    "3 · Split the turnable numbers"
  ],
  "h3": [
    "3. 把可转数分成两堆",
    "3. Split the turnable numbers"
  ],
  "nav4": [
    "4 · 不列举也能数出可转数",
    "4 · Count turnable numbers without listing"
  ],
  "h4": [
    "4. 不列举也能数出可转数",
    "4. Count turnable numbers without listing"
  ],
  "nav5": [
    "5 · 从两端造出不变数",
    "5 · Build unchanged numbers from both ends"
  ],
  "h5": [
    "5. 从两端造出不变数",
    "5. Build unchanged numbers from both ends"
  ],
  "nav6": [
    "6 · 在你的 n 上走一遍",
    "6 · Run it on your own n"
  ],
  "h6": [
    "6. 在你的 n 上走一遍",
    "6. Run it on your own n"
  ],
  "nav7": [
    "7 · 先预测再揭晓",
    "7 · Predict, then reveal"
  ],
  "h7": [
    "7. 先预测再揭晓",
    "7. Predict, then reveal"
  ],
  "nav8": [
    "8 · 对应到 Python",
    "8 · Map to Python"
  ],
  "h8": [
    "8. 对应到 Python",
    "8. Map to Python"
  ],
  "p1": [
    "这一步回答：一个数旋转后变成什么？以 16 为例：倒过来读是 6、1，再把每位转一下，6 变 9，1 还是 1，得到 91。91 ≠ 16，所以 16 是易混淆数。再看 10：倒过来是 0、1，转完仍是 0、1，去掉前导 0 得到 1 ≠ 10，所以 10 也是。69 倒过来是 9、6，转完是 6、9——正好回到 69，所以它不是。25 里有 2，根本转不了，也不是。",
    "What does a number become after turning? Take 16: read backwards it is 6, 1; turn each digit and 6 becomes 9 while 1 stays 1, giving 91. Since 91 ≠ 16, 16 is confusing. Now 10: backwards it is 0, 1; turned it is still 0, 1, and dropping the leading zero gives 1 ≠ 10, so 10 is confusing too. 69 backwards is 9, 6; turned it is 6, 9 — exactly 69 again, so it is not confusing. 25 contains a 2, which cannot turn, so it is not confusing either."
  ],
  "turnLabel": [
    "输入一个数（1 到 1000000000）",
    "Enter a number (1 to 1000000000)"
  ],
  "turnHint": [
    "上面的按钮会直接填入例子。下面第一行是原数；第二行是从右往左逐位旋转后的结果。✕ 表示这一位转不了。",
    "The buttons above fill in examples. Below, the first row is the number and the second row is each digit turned, read from the right. ✕ marks a digit that cannot turn."
  ],
  "rowFrom": [
    "原数",
    "Number"
  ],
  "rowTo": [
    "从右往左逐位旋转",
    "Turned, read from the right"
  ],
  "vInvalid": [
    "{x} 含有转不了的数字，旋转后不是一个数：不是易混淆数。",
    "{x} has a digit that cannot turn, so it is not a number after turning: not confusing."
  ],
  "vSelf": [
    "{x} 旋转后得到 {r}，与原数相同：不是易混淆数。",
    "{x} turns into {r}, the same number: not confusing."
  ],
  "vConfusing": [
    "{x} 旋转后得到 {r}，与原数不同：是易混淆数。",
    "{x} turns into {r}, a different number: confusing."
  ],
  "vZero": [
    "（{raw} 去掉前导 0 后是 {r}。）",
    "({raw} without its leading zeros is {r}.)"
  ],
  "badInput": [
    "请输入 1 到 1000000000 之间的整数；显示内容保持不变。",
    "Enter a whole number from 1 to 1000000000; the display is unchanged."
  ],
  "handTitle": [
    "亲手数一次：n = 70",
    "Count once by hand: n = 70"
  ],
  "handQ": [
    "1 到 70 中有多少个易混淆数？先自己在纸上数，再展开答案。提示：大多数数一出现 2、3、4、5、7 就可以划掉。",
    "How many confusing numbers lie in 1..70? Count on paper first, then open the answer. Hint: most numbers can be crossed out as soon as they contain a 2, 3, 4, 5 or 7."
  ],
  "handSummary": [
    "展开答案",
    "Show the answer"
  ],
  "handAnswer": [
    "共 10 个：6, 9, 10, 16, 18, 19, 60, 61, 66, 68。注意 10、60 靠的是“去掉前导 0”，而 66 会变成 99。",
    "There are 10: 6, 9, 10, 16, 18, 19, 60, 61, 66, 68. Note that 10 and 60 count because of the dropped leading zero, and that 66 turns into 99."
  ],
  "p2": [
    "这一步回答：最直接的做法要做多少工作？把 1 到 n 每个数都旋转一遍，比较结果：",
    "How much work does the direct approach do? Turn every number from 1 to n and compare:"
  ],
  "bruteCost": [
    "对 n = 70，它检查了 70 个数，但其中 56 个第一眼就含有转不了的数字，白查了。对 n = 10⁹，要检查 10 亿个数，每个最多 10 位，约 10¹⁰ 次逐位操作；Python 每秒大约只能做千万级这样的操作，要跑一刻钟以上。",
    "For n = 70 it checks 70 numbers, yet 56 of them contain a digit that cannot turn and were checked for nothing. For n = 10⁹ it checks a billion numbers of up to 10 digits each: about 10¹⁰ digit operations. Python manages roughly ten million such operations per second, so this runs for a quarter of an hour or more."
  ],
  "dfsIdea": [
    "自然的第一次改进：只生成每位都在 {0,1,6,8,9} 里的数（下文叫“可转数”）。从 1、6、8、9 出发，每次在末尾追加 0、1、6、8、9 之一，超过 n 就停。n = 70 时只生成 14 个，而不是 70 个。",
    "A natural first improvement: only generate numbers whose digits all lie in {0,1,6,8,9} (we call them turnable numbers). Start from 1, 6, 8, 9 and keep appending one of 0, 1, 6, 8, 9, stopping once past n. For n = 70 that generates 14 numbers instead of 70."
  ],
  "dfsCost": [
    "但对 n = 10⁹，可转数有 1 953 125 个（每位 5 种选择，约 5⁹ 个），每个还要旋转比较。快多了，却仍是“一个个列出来”。",
    "But for n = 10⁹ there are 1,953,125 turnable numbers (5 choices per digit, about 5⁹), each still turned and compared. Much faster, yet still listing them one by one."
  ],
  "q2": [
    "问题：能不能连这两百万个也不列，直接“数”出易混淆数有多少个？要数，就得知道易混淆数有什么能被数的结构。下一步先看看 n = 70 里的 14 个可转数。",
    "Question: can we skip even those two million and simply count the confusing numbers? To count, we need a structure that can be counted. The next step looks at the 14 turnable numbers below 70."
  ],
  "p3": [
    "这一步回答：可转数里，哪些不是易混淆数？下面的方格是 1 到 N 的每个数：暗格含有转不了的数字，亮格是可转数。",
    "Which turnable numbers are not confusing? Each square below is one number from 1 to N: dim squares contain a digit that cannot turn, bright squares are turnable."
  ],
  "gridLabel": [
    "N（1 到 300，改动会重画方格）",
    "N (1 to 300; changing it redraws the grid)"
  ],
  "gridQ": [
    "当 N = 70 时有 14 个可转数，但只有 10 个是易混淆数。另外 4 个是哪几个？它们有什么共同点？先想，再按按钮。",
    "With N = 70 there are 14 turnable numbers, yet only 10 are confusing. Which are the other 4, and what do they have in common? Think first, then press the button."
  ],
  "gridShow": [
    "标出转后不变的数",
    "Mark the numbers that turn into themselves"
  ],
  "gridHide": [
    "隐藏标记",
    "Hide the marks"
  ],
  "gridCount": [
    "1 到 {N}：转不了 {bad} 个，可转数 {s} 个。",
    "1 to {N}: {bad} cannot turn, {s} are turnable."
  ],
  "gridCountShown": [
    "1 到 {N}：转不了 {bad} 个，可转数 {s} 个 = 转后不变 {t} 个 + 易混淆 {c} 个。",
    "1 to {N}: {bad} cannot turn, {s} turnable = {t} unchanged + {c} confusing."
  ],
  "legendBad": [
    "暗格：转不了",
    "Dim: cannot turn"
  ],
  "legendTurn": [
    "亮格：可转数",
    "Bright: turnable"
  ],
  "legendSelf": [
    "↺ 橙框：转后不变",
    "↺ orange: unchanged after turning"
  ],
  "splitText": [
    "答案是 1、8、11、69：它们转后还是自己（下文叫“不变数”）。共同点是两端配对：第一位转过来必须等于最后一位，第二位对倒数第二位……69 的 6 转成 9、9 转成 6，正好对上。这样的数很少：1 到 70 里只有 4 个，1 到 300 里也只有 9 个。",
    "They are 1, 8, 11 and 69: each turns into itself (we call them unchanged numbers). What they share is pairing from both ends: the first digit, once turned, must equal the last digit, the second must match the second-to-last, and so on. In 69, 6 turns into 9 and 9 into 6, so the ends match. Such numbers are rare: only 4 up to 70, and only 9 up to 300."
  ],
  "formula3": [
    "易混淆数的个数 = 可转数的个数 − 不变数的个数",
    "confusing count = turnable count − unchanged count"
  ],
  "splitWhy": [
    "这个等式把难数的东西换成了两个好数的东西：每个可转数要么转后不变，要么是易混淆数，二者必居其一。这种“先数全体、再减去反面”的做法叫补集计数。接下来分别数这两项，而且都不逐个列举。",
    "This identity trades one hard count for two easy ones: every turnable number is either unchanged or confusing, never both. Counting a whole set and subtracting the opposite case is called complement counting. Next we count each term, neither by listing."
  ],
  "wrongTurn": [
    "诱人的捷径：“不变数就是回文数”？不对。66 是回文，但它转成 99，是易混淆数；69 不是回文，却转回 69。配对规则是 6 对 9，不是 6 对 6。在 N = 70 的方格里对比 66 和 69 就能看到。",
    "Tempting shortcut: “unchanged numbers are just palindromes”? No. 66 is a palindrome but turns into 99, so it is confusing; 69 is not a palindrome yet turns into 69. The pairing rule is 6 with 9, not 6 with 6. Compare 66 and 69 in the N = 70 grid."
  ],
  "p4": [
    "这一步回答：不列出它们，怎样知道 1 到 n 有多少个可转数？分两种长度来数。",
    "How many turnable numbers lie in 1..n, without listing them? Count them by length in two groups."
  ],
  "shorterRule": [
    "比 n 短的：长度为 l 的可转数，第一位有 4 种（1、6、8、9，不能是 0），其余每位 5 种，共 4 × 5^(l−1) 个。它们都小于 n。",
    "Shorter than n: a turnable number of length l has 4 choices for its first digit (1, 6, 8, 9; not 0) and 5 for each other digit, giving 4 × 5^(l−1). All of them are below n."
  ],
  "walkRule": [
    "和 n 一样长的：任取一个这样的可转数 m < n，从左往右与 n 比较，一定有第一个不同的位置 i。在 i 之前 m 与 n 完全相同；在 i 处 m 的数字更小；i 之后每一位随便取（5 种）。所以按“第一个不同的位置”分组：位置 i 贡献（比 n[i] 小的可转数字个数）× 5^(之后的位数)。每个 m 只有一个第一个不同的位置，因此不会重复也不会漏。",
    "As long as n: take any such turnable m < n and compare it with n from the left. There is a first position i where they differ. Before i, m equals n; at i, m has a smaller digit; after i, every digit is free (5 choices). So group by that first differing position: position i contributes (turnable digits below n[i]) × 5^(digits after i). Each m has exactly one first differing position, so nothing is counted twice or missed."
  ],
  "stopRule": [
    "关键的停止条件：要让 i 之后的位置继续“与 n 相同”，n 的前缀本身必须都可转。一旦 n 的某一位转不了，就不会有可转数和 n 共享更长的前缀，计数立刻结束。如果 n 每一位都可转，最后再加 1，算上 n 自己。",
    "The key stopping rule: to keep agreeing with n beyond position i, n’s own prefix must be turnable. As soon as one of n’s digits cannot turn, no turnable number can share a longer prefix with n, and counting stops. If every digit of n can turn, add 1 at the end for n itself."
  ],
  "walk70": [
    "先看 n = 70 的 14 个可转数（第 3 步的亮格）：一位数 4 个，比 n 短，都算。两位数 10 个：10, 11, 16, 18, 19, 60, 61, 66, 68, 69。注意它们的第一位只有 1 和 6——正是比 7 小、又能转的非零数字——而第二位 0、1、6、8、9 全都出现：2 × 5 = 10。第一位能不能取 7？那样就要和 n 的前缀一样，但 7 转不了，所以没有了。合计 4 + 10 = 14。",
    "Look first at the 14 turnable numbers up to 70 (the bright squares of step 3). The 4 one-digit ones are shorter than n and all count. The 10 two-digit ones are 10, 11, 16, 18, 19, 60, 61, 66, 68, 69. Notice that their first digit is only ever 1 or 6 — exactly the nonzero turnable digits below 7 — while the second digit takes all of 0, 1, 6, 8, 9: 2 × 5 = 10. Could the first digit be 7? That would copy n’s prefix, but 7 cannot turn, so nothing more. Total 4 + 10 = 14."
  ],
  "walk6189": [
    "例 n = 6189（每位都可转）：短的有 4 + 20 + 100 = 124。位置 0 是 6：可取 1 → 1 × 125；位置 1 是 1：可取 0 → 1 × 25；位置 2 是 8：可取 0、1、6 → 3 × 5；位置 3 是 9：可取 0、1、6、8 → 4 × 1；再加 n 自己 1。合计 124 + 125 + 25 + 15 + 4 + 1 = 294。",
    "Example n = 6189 (every digit turns): the shorter ones give 4 + 20 + 100 = 124. Position 0 holds 6: choose 1 → 1 × 125; position 1 holds 1: choose 0 → 1 × 25; position 2 holds 8: choose 0, 1, 6 → 3 × 5; position 3 holds 9: choose 0, 1, 6, 8 → 4 × 1; then 1 for n itself. Total 124 + 125 + 25 + 15 + 4 + 1 = 294."
  ],
  "base5": [
    "另一种看法：把 0、1、6、8、9 依次看作五进制的 0、1、2、3、4，可转数就是换了字形的五进制数。6189 对应五进制 2134，其值 2·125 + 1·25 + 3·5 + 4 = 294，正是上面的答案。",
    "Another view: read 0, 1, 6, 8, 9 as the base-5 digits 0, 1, 2, 3, 4, and turnable numbers are base-5 numerals in disguise. 6189 corresponds to base-5 2134, whose value 2·125 + 1·25 + 3·5 + 4 = 294 is exactly the count above."
  ],
  "p5": [
    "这一步回答：怎样只列出不变数，而不去碰其他可转数？",
    "How can we list only the unchanged numbers, without touching the other turnable numbers?"
  ],
  "mirrorRule": [
    "旋转会把顺序倒过来，所以旋转后的第一位来自原来的最后一位。要转后不变，位置 i 和位置 L−1−i（从两端数第 i 个）必须是一对“旋转对”：(0,0)、(1,1)、(6,9)、(8,8)、(9,6)。长度为奇数时，正中间那一位要转成自己，只能是 0、1、8。",
    "Turning reverses the order, so the first digit after turning comes from the last digit before. To stay unchanged, position i and position L−1−i (the i-th from each end) must form a turning pair: (0,0), (1,1), (6,9), (8,8), (9,6). With an odd length, the middle digit must turn into itself, so it is 0, 1 or 8."
  ],
  "buildRule": [
    "于是从外往里造：先选最外层的一对，再在里面放一个短 2 位的不变串。长度 3 的不变数：最外层不能以 0 开头，有 4 种；中间 3 种；共 12 个：101, 111, 181, 609, 619, 689, 808, 818, 888, 906, 916, 986。",
    "So build from the outside in: choose the outer pair, then place a two-shorter unchanged string inside. Length 3: the outer pair cannot start with 0, so 4 choices; the middle has 3; 12 in total: 101, 111, 181, 609, 619, 689, 808, 818, 888, 906, 916, 986."
  ],
  "sizeRule": [
    "它们有多少？长度 L 只需选前一半，最多约 5^(L/2) 个。n ≤ 10⁹ 时最长 10 位：长度 9 有 1500 个，长度 10 有 2500 个，全部加起来不到 5000 个——相比两百万个可转数，少得多。比 n 短的全都 ≤ n；只有和 n 一样长的那一组需要逐个与 n 比较。",
    "How many are there? Length L only chooses its first half, so at most about 5^(L/2). With n ≤ 10⁹ the longest length is 10: length 9 has 1500 and length 10 has 2500; fewer than 5000 overall, compared with two million turnable numbers. Every shorter one is ≤ n; only the group as long as n needs comparing against n."
  ],
  "stroboName": [
    "这类数常被称为“中心对称数”（strobogrammatic numbers）。",
    "These are often called strobogrammatic numbers."
  ],
  "p6": [
    "这一步回答：两部分合起来，在任意 n 上是怎样一步步得到答案的？输入一个 n，按“完成下一步”。上方是 n 的各位数字，中间是本步做了什么，下面的表保留每一步加了多少。",
    "How do the two parts combine, step by step, on any n? Enter an n and press “Complete next action”. The digits of n are on top, the current action in the middle, and the table below keeps what every action added."
  ],
  "nLabel": [
    "n（1 到 1000000000，应用后从头开始）",
    "n (1 to 1000000000; applying restarts the trace)"
  ],
  "apply": [
    "应用这个 n",
    "Use this n"
  ],
  "presetLabel": [
    "或选一个例子（选择后从头开始）：",
    "Or choose an example (restarts the trace):"
  ],
  "sim": [
    "这是用 JavaScript 写的教学模拟，与下方 Python 的计算步骤相同，但不执行 Python。为了能后退，它保存每一步的快照；这部分存储不属于提交代码的空间开销。",
    "This is a teaching simulation in JavaScript that follows the same steps as the Python below, without executing it. To allow going back it keeps a snapshot of every action; that storage is not part of the submission’s space cost."
  ],
  "prev": [
    "退回一步",
    "Previous action"
  ],
  "next": [
    "完成下一步",
    "Complete next action"
  ],
  "reset": [
    "回到开头",
    "Back to start"
  ],
  "end": [
    "完成全部",
    "Complete all"
  ],
  "progress": [
    "已完成 {i}/{total} 步。",
    "{i}/{total} actions completed."
  ],
  "evStart": [
    "开始：n = {n} 有 {L} 位。还没有计数。先数可转数，再数不变数。",
    "Start: n = {n} is a {L}-digit number. Nothing counted yet. First count turnable numbers, then unchanged ones."
  ],
  "evShorter": [
    "比 n 短、长度为 {length} 的可转数：4 × 5^{e} = {add} 个，全都 ≤ n。",
    "Turnable numbers of length {length}, shorter than n: 4 × 5^{e} = {add}, all ≤ n."
  ],
  "evPrefix": [
    "位置 {pos}（数字 {digit}）：前面与 n 相同，这里取比 {digit} 小的可转数字 {lower}，共 {k} 种，之后 {rest} 位任意：{k} × 5^{rest} = {add}。",
    "Position {pos} (digit {digit}): agree with n before it, pick a turnable digit below {digit} here — {lower}, {k} choices — and any {rest} digits after: {k} × 5^{rest} = {add}."
  ],
  "evPrefixStop": [
    "{digit} 转不了，所以没有可转数能与 n 共享到这一位为止的前缀：可转数计数到此结束。",
    "{digit} cannot turn, so no turnable number shares n’s prefix through this digit: the turnable count stops here."
  ],
  "evItself": [
    "n 的每一位都能转，n 自己也是可转数：+1。",
    "Every digit of n can turn, so n itself is turnable: +1."
  ],
  "evSelf": [
    "长度 {length} 的不变数共 {total} 个，其中 ≤ n 的有 {kept} 个。",
    "Length {length} has {total} unchanged numbers; {kept} of them are ≤ n."
  ],
  "evFinal": [
    "完成：易混淆数 = 可转数 {s} − 不变数 {t} = {answer}。",
    "Done: confusing = turnable {s} − unchanged {t} = {answer}."
  ],
  "none": [
    "无",
    "none"
  ],
  "mTurn": [
    "可转数（到目前为止）",
    "Turnable so far"
  ],
  "mSame": [
    "不变数（到目前为止）",
    "Unchanged so far"
  ],
  "mAnswer": [
    "答案",
    "Answer"
  ],
  "pending": [
    "尚未完成",
    "not finished"
  ],
  "digitsLabel": [
    "n 的各位（▲ 当前位置，✓ 已与 n 相同的前缀，✕ 转不了）",
    "Digits of n (▲ current position, ✓ prefix already matched, ✕ cannot turn)"
  ],
  "sampleLabel": [
    "本组不变数（✓ ≤ n 计入，✗ > n 不计）",
    "This group of unchanged numbers (✓ ≤ n counted, ✗ > n not counted)"
  ],
  "sampleBefore": [
    "前面还有 {k} 个未显示（都 ≤ n）",
    "{k} smaller ones not shown (all ≤ n)"
  ],
  "sampleAfter": [
    "后面还有 {k} 个未显示（都 > n）",
    "{k} larger ones not shown (all > n)"
  ],
  "ledgerTitle": [
    "每一步的贡献",
    "What each action added"
  ],
  "colStep": [
    "步骤",
    "Action"
  ],
  "colAdd": [
    "本步增加",
    "Added now"
  ],
  "colTurn": [
    "可转数累计",
    "Turnable total"
  ],
  "colSame": [
    "不变数累计",
    "Unchanged total"
  ],
  "rowShorter": [
    "长度 {length} 的可转数",
    "Turnable, length {length}"
  ],
  "rowPrefix": [
    "位置 {pos}：低于 {digit}",
    "Position {pos}: below {digit}"
  ],
  "rowItself": [
    "n 自己",
    "n itself"
  ],
  "rowSelf": [
    "长度 {length} 的不变数",
    "Unchanged, length {length}"
  ],
  "ledgerEmpty": [
    "还没有完成任何步骤。",
    "No action completed yet."
  ],
  "proofTitle": [
    "为什么正确",
    "Why it is correct"
  ],
  "proof1": [
    "分类不重不漏：1 到 n 的每个数恰好属于三类之一——转不了、转后不变、易混淆。所以易混淆数 = 可转数 − 不变数，没有例外。",
    "A clean split: every number in 1..n falls into exactly one of three classes — cannot turn, unchanged, confusing. So confusing = turnable − unchanged, with no exceptions."
  ],
  "proof2": [
    "可转数的计数：较短的按长度数；一样长且小于 n 的，按第一个不同位置归入唯一一组；n 自己只在每一位都可转时加 1。前缀里出现转不了的数字就停，因为之后的组需要与这个前缀相同。",
    "Turnable count: shorter numbers are counted by length; same-length numbers below n fall into exactly one group by their first differing position; n itself adds 1 only when all its digits turn. We stop at a digit that cannot turn because every later group would have to copy it."
  ],
  "proof3": [
    "不变数的计数：不变数由它的前一半唯一决定，从外往里造恰好产生每个不变串一次；以 0 开头的不是正整数，要去掉。",
    "Unchanged count: an unchanged number is determined by its first half, so building from the outside in yields each unchanged string exactly once; strings starting with 0 are not positive integers and are dropped."
  ],
  "boundaries": [
    "容易出错的边界：n = 1 时 1 转后不变，答案 0；n = 10 时 10 是易混淆数（前导 0 被去掉），答案 3；n = 69 时 69 既被算进可转数也被算进不变数，两边抵消，答案 10（和 n = 70 相同）；n = 10⁹ 有 10 位，自己也是易混淆数（转后为 1），答案 1 950 627。",
    "Boundaries that usually break: n = 1 turns into itself, so the answer is 0; n = 10 includes 10, confusing because its leading zero is dropped, so the answer is 3; n = 69 is counted both as turnable and as unchanged, which cancels, giving 10 (the same as n = 70); n = 10⁹ has 10 digits and is itself confusing (it turns into 1), giving 1,950,627."
  ],
  "p7": [
    "这一步检验：不用模拟，你能算出 n = 200 的答案吗？可以先用第 4、5 步的方法分别算两项。",
    "Check yourself: without the simulation, can you work out the answer for n = 200? Use steps 4 and 5 to compute the two terms separately."
  ],
  "choose": [
    "n = 200 时有多少个易混淆数？",
    "How many confusing numbers lie in 1..200?"
  ],
  "opt0": [
    "49",
    "49"
  ],
  "opt1": [
    "36",
    "36"
  ],
  "opt2": [
    "40",
    "40"
  ],
  "opt3": [
    "41",
    "41"
  ],
  "reveal": [
    "揭晓",
    "Reveal"
  ],
  "await": [
    "先选一个答案，再按“揭晓”。",
    "Choose an answer, then press Reveal."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "wrong0": [
    "49 是可转数的个数：忘了减去转后不变的数。",
    "49 is the turnable count: the unchanged numbers were not subtracted."
  ],
  "wrong1": [
    "36 减去的是 13 个可转回文数（1, 6, 8, 9, 11, 66, 88, 99, 101, 111, 161, 181, 191）。但 6、9、66、99、161、191 转后会变，而 69、96 转后不变。",
    "36 subtracts the 13 turnable palindromes (1, 6, 8, 9, 11, 66, 88, 99, 101, 111, 161, 181, 191). But 6, 9, 66, 99, 161 and 191 change when turned, while 69 and 96 do not."
  ],
  "wrong3": [
    "41 少减了一个：大概漏了 69 或 96 这样首尾数字不同的不变数。",
    "41 subtracts one too few: probably a missed unchanged number whose ends differ, such as 69 or 96."
  ],
  "answer": [
    "可转数：4 + 20 + 1 × 25 = 49（位置 0 是 2，只能取 1；2 转不了，停止）。不变数：1, 8, 11, 69, 88, 96, 101, 111, 181 共 9 个。49 − 9 = 40。",
    "Turnable: 4 + 20 + 1 × 25 = 49 (position 0 holds 2, so only 1 fits below it; 2 cannot turn, so stop). Unchanged: 1, 8, 11, 69, 88, 96, 101, 111, 181, which is 9. 49 − 9 = 40."
  ],
  "p8": [
    "这一步回答：每段代码来自哪一步，花费多少？Python 的接口是 Solution.confusingNumberII(n) -> int。",
    "Which step does each part of the code come from, and what does it cost? The Python interface is Solution.confusingNumberII(n) -> int."
  ],
  "map1": [
    "第一个 for：第 4 步“比 n 短的”，每个长度 4 × 5^(l−1)。",
    "First for loop: step 4, the shorter lengths, 4 × 5^(l−1) each."
  ],
  "map2": [
    "第二个 for：第 4 步按第一个不同位置分组（enumerate(s) 同时给出位置 i 和该位字符 ch；5 ** k 是 5 的 k 次方）。ok_digits 是能转的数字，lower 是其中比 n[i] 小的（首位排除 0）；break 就是“遇到转不了的数字就停”；prefix_all_turnable 决定是否给 n 自己加 1。",
    "Second for loop: step 4’s grouping by first differing position (enumerate(s) yields each position i with its character ch; 5 ** k is 5 to the power k). ok_digits are the digits that can turn and lower holds those below n[i] (excluding 0 at the first position); break is “stop at a digit that cannot turn”; prefix_all_turnable decides whether n itself adds 1."
  ],
  "map3": [
    "build(length)：第 5 步从外往里造不变串；pairs 是旋转对，长度 1 的中心是 \"0\"、\"1\"、\"8\"。inner 只造一次，再用 5 个旋转对各包一层（若把 build(length - 2) 直接写进列表推导式，它会被重复调用 5 次）。t[0] != \"0\" 去掉以 0 开头的串，int(t) <= n 只对最长的一组真正起作用。",
    "build(length): step 5, building unchanged strings from the outside in; pairs are the turning pairs and a length-1 centre is \"0\", \"1\" or \"8\". inner is built once and then wrapped by each of the 5 pairs (written directly inside the comprehension, build(length - 2) would be called 5 times over). t[0] != \"0\" drops strings starting with 0; int(t) <= n only matters for the longest group."
  ],
  "map4": [
    "return turnable - unchanged：第 3 步的补集等式。",
    "return turnable - unchanged: step 3’s complement identity."
  ],
  "cost": [
    "代价：设 d 为 n 的位数（d ≤ 10）。可转数部分每位最多看 5 个数字，O(d)。不变数部分生成每个长度 ≤ d 的不变串，共 O(5^(d/2)) 个，每个长 ≤ d，所以时间和空间都是 O(d · 5^(d/2))；d = 10 时各长度的最终列表共 6248 个串（含以 0 开头、随后被丢掉的），连同递归里造出的内层短串（含最内层的空串）也只有 7805 个。对比：逐个检查是 O(n·d)，约 10¹⁰；只生成可转数是 O(5^d)，约两百万。",
    "Cost: let d be the number of digits of n (d ≤ 10). The turnable part looks at up to 5 digits per position: O(d). The unchanged part generates every unchanged string of length ≤ d, O(5^(d/2)) of them, each of length ≤ d, so time and space are O(d · 5^(d/2)); at d = 10 the final lists hold 6248 strings (including those starting with 0, which are then dropped), and even counting the shorter inner lists built by the recursion (including the empty innermost string) only 7805. Compare: checking every number is O(n·d), about 10¹⁰; generating only turnable numbers is O(5^d), about two million."
  ],
  "source": [
    "查看 Python 源码",
    "View Python source"
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
  "manual": [
    "无法写入剪贴板；已在下面选中全文，请按 Ctrl/Cmd+C。",
    "Clipboard unavailable; the full source is selected below — press Ctrl/Cmd+C."
  ],
  "manualLabel": [
    "完整源码（手动复制）",
    "Full source (copy manually)"
  ],
  "related": [
    "相关概念",
    "Related concepts"
  ],
  "link1": [
    "用补集等式拆分 → 本页第 3 步",
    "The complement identity → step 3 here"
  ],
  "link2": [
    "按第一个不同数位分组计数 → #902 第 2 步",
    "Counting by first differing digit → #902 step 2"
  ]
};
