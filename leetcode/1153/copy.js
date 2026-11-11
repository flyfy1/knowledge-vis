'use strict';
window.LESSON_COPY = {
  "docTitle": ["#1153 · 字符串转化", "#1153 · String Transforms Into Another String"],
  "title": ["#1153 · 字符串转化", "#1153 · String Transforms Into Another String"],
  "back": ["← LeetCode 专区", "← LeetCode collection"],
  "badge": ["困难 · 算法 · Python", "Hard · Algorithms · Python"],
  "official": ["官方题目 ↗", "Official problem ↗"],
  "intro": [
    "给你两个一样长的小写字符串 str1 和 str2。每次操作选 str1 里的一个字母，把它的所有出现一起改成另一个小写字母。能不能经过若干次（也可以是 0 次）操作，把 str1 变成 str2？",
    "You get two lowercase strings str1 and str2 of the same length. One conversion picks a letter in str1 and rewrites every occurrence of it to some other lowercase letter. Can some number of conversions — zero allowed — turn str1 into str2?"
  ],
  "contract": [
    "接口：canConvert(str1, str2) → bool。两串等长，只含 a–z；长度在 1 到 10⁴ 之间。一次操作必须改掉某个字母的全部出现，不能只改一部分。",
    "Interface: canConvert(str1, str2) → bool. Equal lengths, letters a–z only; length between 1 and 10⁴. A conversion must rewrite every occurrence of the chosen letter, never just some of them."
  ],
  "premium": [
    "这是会员题，官方完整题面需要订阅。上面的复述依据公开的函数签名和示例输入整理，长度范围与公开题解网站转述的一致，规则已用穷举搜索核对；措辞以官方页面为准。",
    "This is a subscriber-only problem. The restatement above was reconstructed from the public function signature and sample inputs, its length bound agrees with the one quoted by public solution sites, and its rules were checked by exhaustive search; the official page has the authoritative wording."
  ],
  "nav1": ["1 · 亲手试", "1 · Try it"],
  "nav2": ["2 · 暴力搜索", "2 · Brute force"],
  "nav3": ["3 · 什么不会变", "3 · What never changes"],
  "nav4": ["4 · 环与空闲字母", "4 · Cycles & a spare"],
  "nav5": ["5 · 26 的作用", "5 · Why 26 matters"],
  "nav6": ["6 · 逐步走一遍", "6 · Walk it"],
  "nav7": ["7 · 先预测", "7 · Predict"],
  "nav8": ["8 · Python 与成本", "8 · Python & cost"],

  "s1t": ["先亲手改一改：abbc 能变成 bccd 吗？", "Try it first: can abbc become bccd?"],
  "s1e": [
    "这一步要回答：一次操作到底改了什么？上面是当前字符串，下面是目标 str2，每一列对上了打 ✓。选一个“要改的字母”和“改成”，按「执行」。建议先试最自然的顺序：a 改成 b。",
    "The question for this step: what exactly does one conversion change? The top row is the current string, the bottom row the target str2; a column that matches gets ✓. Pick “letter to rewrite” and “rewrite to”, then press “Apply”. Start with the most natural first move: a to b."
  ],
  "sandboxTask": [
    "观察：a→b 之后，原来的 a 和原来的 b 都成了 b，从此再也分不开——可目标要求它们一个是 b、一个是 c。撤销后换个顺序：先改 c→d，再 b→c，最后 a→b。为什么从“链条的末端”开始就行？",
    "Observe: after a→b, the old a and the old b are both b and can never be told apart again — yet the target needs one to be b and the other c. Undo and try another order: c→d first, then b→c, then a→b. Why does starting from the end of the chain work?"
  ],
  "sandboxPreset": ["练习题（会清空历史）", "Exercise (clears the history)"],
  "sb0": ["abbc → bccd（一条链）", "abbc → bccd (a chain)"],
  "sb1": ["abab → baba（互换）", "abab → baba (a swap)"],
  "fromLabel": ["要改的字母", "Letter to rewrite"],
  "toLabel": ["改成", "Rewrite to"],
  "apply": ["执行", "Apply"],
  "undo": ["撤销", "Undo"],
  "sbReset": ["重来", "Start over"],
  "rowCurrent": ["当前", "current"],
  "rowTarget": ["目标", "target"],
  "sbRead": ["已做 {n} 次操作；{ok}/{len} 列对上。{status}", "{n} conversions so far; {ok}/{len} columns match. {status}"],
  "sbDone": ["完成了！", "Done!"],
  "sbStuck": ["有两列现在字母相同、目标却不同——它们已经被合并，这条路走不通了。撤销试试别的顺序。", "Two columns now share a letter but need different targets — they have been merged and this path is dead. Undo and try another order."],
  "sbGoing": ["继续。", "Keep going."],
  "sbHistory": ["操作记录", "Conversion history"],
  "sameLetter": ["要改成另一个字母", "Pick a different letter"],

  "s2t": ["暴力做法：把所有能到达的字符串都搜出来", "Brute force: search every reachable string"],
  "s2e": [
    "这一步要回答：最直接的正确做法是什么，为什么太慢？从 str1 出发做广度优先搜索（BFS）：每一步对每个出现的字母、每个其他字母各试一次，记录见过的字符串，直到找到 str2 或无路可走。它一定正确，因为它真的尝试了所有操作序列。",
    "The question for this step: what is the most direct correct method, and why is it too slow? Breadth-first search (BFS) from str1: at each step, try every letter that appears with every other letter, remember strings already seen, and stop when str2 shows up or nothing new remains. It is certainly correct — it really tries every sequence of conversions."
  ],
  "s2cost": [
    "数一数：abbc 有 3 种字母，第一步就有 3×25=75 个新字符串。能到达的字符串是“每种字母各自换成任意字母”的所有结果，最多 26³=17,576 个。字母种类为 k 时最多 26ᵏ 个；k=26 时约 6×10³⁶。长度 10⁴ 的字符串每生成一个还要复制 10⁴ 个字符。必须找一个不用搜索的判断。",
    "Count: abbc has 3 distinct letters, so the first step alone gives 3×25 = 75 new strings. Reachable strings are the results of “send each letter to any letter”, up to 26³ = 17,576. With k distinct letters it is up to 26ᵏ; for k = 26 about 6×10³⁶. Each string of length 10⁴ also costs 10⁴ characters to build. We need a test that does not search."
  ],

  "s3t": ["什么永远不会变？同一个字母的位置永远绑在一起", "What never changes? Positions sharing a letter stay tied forever"],
  "s3e": [
    "这一步要回答：哪些目标根本到不了？回想第 1 步：一次操作改的是某个字母的全部出现。所以 str1 里写着同一个字母的位置，在任何时刻都写着同一个字母——操作只会把它们一起搬走，不会把它们拆开。",
    "The question for this step: which targets can never be reached? Recall step 1: a conversion rewrites every occurrence of one letter. So positions of str1 that hold the same letter hold the same letter at every moment — a conversion moves them together and never splits them."
  ],
  "ask3": ["试一个：aab 能变成 xyz 吗？", "Try one: can aab become xyz?"],
  "answer3": [
    "不能。位置 0 和 1 都是 a，永远相同；目标却要求一个 x、一个 y。于是得到第一个必要条件：str1 的每个字母只能有一个去处。用一张表 target 记录“字母 → 去处”，从左到右扫一遍：遇到已记录的字母却要去别处，立刻返回 False。",
    "No. Positions 0 and 1 both hold a and always will; the target wants an x and a y. That gives the first necessary condition: each letter of str1 has exactly one destination. Record “letter → destination” in a table target and scan left to right: a letter that is already recorded but now needs a different destination means return False immediately."
  ],
  "note3": [
    "反过来不用担心：两个不同字母去同一个地方是允许的（比如 abcab → xxyxx 里 a 和 b 都去 x），因为把两个字母合并只需要一次操作。",
    "The reverse is fine: two different letters may share a destination (in abcab → xxyxx both a and b go to x), because merging two letters takes just one conversion."
  ],
  "wrong3": [
    "那么“每个字母只有一个去处”就够了吗？第 1 步已经给出了一个陷阱：按表照做的顺序会出错。abbc → bccd 的表是 a→b、b→c、c→d，像一条链。先做 a→b 会把 a 并进还没搬走的 b。正确做法是从链的末端开始：c→d 时 d 还不在串里，不会撞上任何字母；然后 b→c 时 c 已经空出来了；最后 a→b。规则：只有当目标字母当前不在串里（或它已经搬到最终位置），才能把一个字母改过去。",
    "So is “one destination per letter” enough? Step 1 already showed a trap: the order of carrying out the table matters. For abbc → bccd the table is a→b, b→c, c→d, like a chain. Doing a→b first merges a into the b that has not moved yet. Start from the chain's end instead: when c→d runs, d is not in the string, so nothing collides; then b→c runs after c has been vacated; finally a→b. Rule: rewrite a letter to its destination only when that destination letter is currently absent from the string (or already in its final place)."
  ],

  "s4t": ["链可以从尾部做；环怎么办？", "Chains run from the end. What about cycles?"],
  "s4e": [
    "这一步要回答：如果表里的箭头绕成一个圈，从哪里开始？abab → baba 的表是 a→b、b→a。先做 a→b 得到 bbbb，先做 b→a 得到 aaaa——两种都把两个字母合并了，再也分不开。链没有“尾部”可以先做。",
    "The question for this step: if the arrows in the table form a loop, where do we start? For abab → baba the table is a→b, b→a. Doing a→b first gives bbbb; doing b→a first gives aaaa — either way the two letters merge for good. A cycle has no end to start from."
  ],
  "ask4": ["想一想：如果能先把一方“暂存”到一个不会撞车的地方呢？", "Think: what if one side could be parked somewhere it cannot collide?"],
  "answer4": [
    "借一个当前不在串里的“空闲字母”。a→c 得到 cbcb；现在 a 空出来了，b→a 得到 caca；最后 c→b 得到 baba。环被拆成了一条链：c 暂存了 a 的那些位置。所以只要有一个空闲字母，任何环都能处理；处理完 c 又空出来，可以给下一个环再用。",
    "Borrow a “spare letter” that is not currently in the string. a→c gives cbcb; now a is vacant, so b→a gives caca; finally c→b gives baba. The cycle became a chain: c held a's positions for a while. So with one spare letter any cycle can be handled, and afterwards the spare is vacant again for the next cycle."
  ],
  "toy4": [
    "空闲字母不是一定存在的。如果把字母表缩小成只有 a 和 b 两个字母（这是教学用的变体，不是原题），abab → baba 就做不到：串里同时用着 a 和 b，任何一次操作都只能把一个并进另一个。下面第 6 步可以切换这个玩具字母表亲眼看到。",
    "A spare letter does not always exist. Shrink the alphabet to just a and b (a teaching variant, not the real problem) and abab → baba becomes impossible: the string uses both letters, so every conversion merges one into the other. Step 6 below lets you switch to this toy alphabet and watch it happen."
  ],

  "s5t": ["26 个字母什么时候不够用？", "When are 26 letters not enough?"],
  "s5e": [
    "这一步要回答：真实的 26 个字母下，什么时候找不到空闲字母？关键看 str2 用了几种字母。",
    "The question for this step: with the real 26 letters, when is there no spare letter? It all depends on how many different letters str2 uses."
  ],
  "full5": [
    "如果 str2 用满了全部 26 个字母：表里每个字母只有一个去处，要覆盖 26 个去处，str1 也必须恰好用了 26 个字母。这时任何一次操作都只能把一个字母改成另一个“已经在串里”的字母，字母种类立刻降到 25；操作永远不会把一个字母拆成两个，所以种类再也回不到 26。目标却有 26 种——到不了。唯一的例外：str1 本来就等于 str2，0 次操作即可，答案 True。这就是代码里 str1 == str2 要先判断的原因。",
    "If str2 uses all 26 letters: each letter has one destination, so covering 26 destinations needs str1 to use exactly 26 letters too. Then any conversion must rewrite a letter to another letter that is already present, and the count of distinct letters drops to 25; a conversion never splits a letter in two, so the count can never climb back to 26. The target has 26 — unreachable. The one exception: str1 already equals str2, zero conversions, answer True. That is why the code checks str1 == str2 first."
  ],
  "spare5": [
    "如果 str2 少于 26 种字母（且表一致），总能做到。先把去处相同的字母两两合并（总是安全的：它们终点相同），这时 str1 剩下的字母种数恰好等于 str2 的种数，少于 26，所以至少有一个字母不在串里——空闲字母找到了。剩下的箭头一对一，只有链和环：链从尾部做，环借空闲字母。例如 aa+bcd…z → bb+bcd…z：str1 用满 26 个，但 str2 只用 25 个，先把 a 并进 b 就行。",
    "If str2 uses fewer than 26 letters (and the table is consistent), it can always be done. First merge letters that share a destination (always safe: same final letter). Now str1 uses exactly as many letters as str2, fewer than 26, so at least one letter is absent — there is the spare. The remaining arrows are one-to-one, so only chains and cycles are left: chains from the end, cycles with the spare. Example: aa+bcd…z → bb+bcd…z: str1 uses all 26 letters but str2 only 25, so merging a into b first works."
  ],
  "rule5": [
    "完整判断（两条必要条件合起来也是充分的）：str1 == str2 → True；否则表必须一致，并且 str2 的字母种数 < 26。",
    "The full test (the two necessary conditions together are also sufficient): str1 == str2 → True; otherwise the table must be consistent and str2 must use fewer than 26 distinct letters."
  ],

  "s6t": ["自己输入，看判断与真实的操作序列", "Enter your own strings; see the test and an actual conversion sequence"],
  "s6e": [
    "这一步要回答：上面的判断在你的例子上是否成立？第一阶段逐个位置建表（这就是 solution.py 做的事）；若答案为 True，第二阶段再真的执行一串合法操作（合并 → 链 → 借空闲字母），让你亲眼看到它确实能到达 str2。更换字符串、字母表或预设都会从第 0 帧重新开始。",
    "The question for this step: does the test hold on your example? Stage one builds the table position by position (exactly what solution.py does); if the answer is True, stage two actually performs a sequence of legal conversions (merges → chains → borrowing a spare) so you can see that str2 is really reached. Changing the strings, the alphabet or the preset restarts at frame 0."
  ],
  "labTask": [
    "观察任务：选预设「abab → baba」，走到最后，看 c 被借来暂存。再选同样的串但字母表只有 a、b：第一阶段完全一样，但空闲字母检查失败。最后试「26 个字母整体右移一位」：表一致，却因 str2 用满 26 个字母而失败。",
    "Observation task: pick the preset “abab → baba” and step to the end; watch c being borrowed as a parking spot. Then pick the same strings with the alphabet {a, b}: stage one is identical, but the spare-letter check fails. Finally try “all 26 letters shifted by one”: the table is consistent, yet it fails because str2 uses all 26 letters."
  ],
  "presetLabel": ["预设（会重新开始）", "Preset (restarts the walk)"],
  "p0": ["abbc → bccd · 一条链", "abbc → bccd · a chain"],
  "p1": ["abab → baba · 环，借空闲字母", "abab → baba · a cycle, borrow a spare"],
  "p2": ["abab → baba · 玩具字母表 {a,b}", "abab → baba · toy alphabet {a,b}"],
  "p3": ["aab → xyz · 表冲突", "aab → xyz · table conflict"],
  "p4": ["abcab → xxyxx · 两个字母合并", "abcab → xxyxx · two letters merge"],
  "p5": ["abc → bca · 玩具字母表 {a,b,c}", "abc → bca · toy alphabet {a,b,c}"],
  "p6": ["abcc → bcaa · 玩具字母表 {a,b,c,d}", "abcc → bcaa · toy alphabet {a,b,c,d}"],
  "p7": ["26 个字母整体右移一位", "all 26 letters shifted by one"],
  "p8": ["26 个字母，两串相同", "26 letters, identical strings"],
  "pCustom": ["（自定义输入）", "(custom input)"],
  "str1Label": ["str1", "str1"],
  "str2Label": ["str2", "str2"],
  "alphabetLabel": ["字母表", "Alphabet"],
  "alpha26": ["真实：a–z 共 26 个", "Real: a–z, 26 letters"],
  "alpha4": ["玩具：a, b, c, d", "Toy: a, b, c, d"],
  "alpha3": ["玩具：a, b, c", "Toy: a, b, c"],
  "alpha2": ["玩具：a, b", "Toy: a, b"],
  "run": ["用这两个串重新开始", "Restart with these strings"],
  "inputHint": ["只能用所选字母表里的小写字母，两串等长，长度 1–30（页面限制，原题可到 10⁴）。", "Use lowercase letters from the chosen alphabet, equal lengths, 1–30 characters (a page limit; the real problem allows 10⁴)."],
  "errLength": ["两串长度不同（{a} 和 {b}），请改成一样长。", "The lengths differ ({a} and {b}); make them equal."],
  "errEmpty": ["请输入 1–30 个字母。", "Enter 1–30 letters."],
  "errLetters": ["含有字母表之外的字符：{bad}。", "Contains characters outside the alphabet: {bad}."],
  "restartNote": ["输入已改变：从第 0 帧重新开始。", "Input changed: restarted at frame 0."],
  "prev": ["← 上一帧", "← Previous frame"],
  "next": ["下一帧 →", "Next frame →"],
  "traceReset": ["回到第 0 帧", "Back to frame 0"],
  "end": ["跳到最后", "Jump to end"],
  "frame": ["第 {i}/{n} 帧 · {phase} · 结论：{result}", "Frame {i} of {n} · {phase} · verdict: {result}"],
  "phaseStart": ["开始前", "before start"],
  "phaseScan": ["阶段一：建表", "stage 1: build the table"],
  "phaseCheck": ["检查空闲字母", "spare-letter check"],
  "phasePlan": ["阶段二：执行操作", "stage 2: perform conversions"],
  "resPending": ["未定", "pending"],
  "resTrue": ["True（能转化）", "True (convertible)"],
  "resFalse": ["False（不能转化）", "False (not convertible)"],
  "evStart": ["长度 {n}，字母表有 {A} 个字母。表还是空的。", "Length {n}; the alphabet has {A} letters. The table is empty."],
  "evMap": ["位置 {i}：{a} 要去 {b}。{a} 第一次出现 → 记下 {a}→{b}。", "Position {i}: {a} must become {b}. First time we see {a} → record {a}→{b}."],
  "evRepeat": ["位置 {i}：{a} 要去 {b}，与表中的 {a}→{b} 一致。", "Position {i}: {a} must become {b}, consistent with {a}→{b} in the table."],
  "evConflict": ["位置 {i}：{a} 要去 {b}，可位置 {k} 的 {a} 要去 {old}。同一个字母不能分开 → False。", "Position {i}: {a} must become {b}, but the {a} at position {k} must become {old}. One letter cannot split → False."],
  "evEqual": ["表一致，而且 str1 与 str2 完全相同：0 次操作即可 → True。", "The table is consistent and str1 equals str2: zero conversions → True."],
  "evFull": ["表一致，但 str2 用了 {used} 种字母，字母表只有 {A} 个：没有任何字母能空出来当暂存，而第一次操作就会让种类降到 {used} 以下且永不恢复 → False。", "The table is consistent, but str2 uses {used} distinct letters and the alphabet has only {A}: no letter can ever be spare, and the first conversion drops the count below {used} for good → False."],
  "evSpareOk": ["表一致；str2 用了 {used} 种字母 < {A}，所以一定能找到空闲字母 → True。下面把它真的做出来。", "The table is consistent; str2 uses {used} distinct letters < {A}, so a spare letter can always be found → True. Next, actually do it."],
  "evMerge": ["操作 {k}/{total}（合并）：{from}→{to}。两者终点相同，合并安全。{before} → {after}", "Conversion {k}/{total} (merge): {from}→{to}. Both have the same destination, so merging is safe. {before} → {after}"],
  "evChain": ["操作 {k}/{total}（链）：{from}→{to}。{to} 此刻不在串里，不会撞车。{before} → {after}", "Conversion {k}/{total} (chain): {from}→{to}. {to} is absent right now, so nothing collides. {before} → {after}"],
  "evSpare": ["操作 {k}/{total}（借空闲字母）：剩下的箭头成环，没有可先做的尾部。{to} 不在串里，先把 {from} 暂存为 {to}。{before} → {after}", "Conversion {k}/{total} (borrow a spare): the remaining arrows form a cycle with no end to start from. {to} is absent, so park {from} as {to}. {before} → {after}"],
  "stripCaption": ["逐位置对照（▼ 当前位置）", "Position by position (▼ current position)"],
  "rowStr1": ["str1", "str1"],
  "rowStr2": ["str2", "str2"],
  "rowNow": ["当前串", "now"],
  "mapCaption": ["字母表 target：字母 → 去处", "Table target: letter → destination"],
  "mapEmpty": ["（空）", "(empty)"],
  "arrowsCaption": ["箭头的形状", "Shape of the arrows"],
  "shapeChain": ["链：{path}", "chain: {path}"],
  "shapeCycle": ["环：{path}", "cycle: {path}"],
  "shapeFixed": ["不动：{letters}", "already in place: {letters}"],
  "historyCaption": ["已执行的操作", "Conversions performed"],
  "historyEmpty": ["（还没有操作）", "(none yet)"],
  "kindMerge": ["合并", "merge"],
  "kindChain": ["链", "chain"],
  "kindSpare": ["借空闲字母", "spare"],
  "usedCount": ["str2 用了 {used} 种字母；字母表 {A} 个。", "str2 uses {used} distinct letters; alphabet has {A}."],
  "sim": ["这是 JavaScript 教学模拟：第一阶段与 solution.py 的判断相同；第二阶段的操作序列只是为了展示可行性，solution.py 并不需要真的去做。", "This is a JavaScript teaching simulation: stage one is the same test as solution.py; stage two's conversions only demonstrate feasibility — solution.py never has to perform them."],

  "s7t": ["轮到你：先预测再揭晓", "Your turn: predict, then reveal"],
  "s7e": [
    "这一步要回答：你能不画图就判断吗？str1 = abcdefghijklmnopqrstuvwxyz，str2 = bcdefghijklmnopqrstuvwxyza（每个字母换成下一个，z 换成 a）。先选答案再揭晓；改选会清掉旧反馈。",
    "The question for this step: can you decide without drawing? str1 = abcdefghijklmnopqrstuvwxyz, str2 = bcdefghijklmnopqrstuvwxyza (each letter becomes the next one, z becomes a). Choose, then reveal; changing your choice clears old feedback."
  ],
  "predictLegend": ["结果是？", "What is the answer?"],
  "option0": ["True：这是一个大环，借一个空闲字母就能拆开", "True: it is one big cycle; borrow a spare letter to break it"],
  "option1": ["False：str2 用满了 26 个字母，没有空闲字母", "False: str2 uses all 26 letters, so there is no spare"],
  "option2": ["False：表里有字母要去两个地方", "False: some letter needs two destinations"],
  "reveal": ["揭晓", "Reveal"],
  "predictReset": ["清除选择", "Clear choice"],
  "await": ["先选一个答案，再揭晓。", "Choose an answer, then reveal."],
  "correct": ["正确。", "Correct."],
  "wrong0": ["环的处理方法没错，但前提是有空闲字母。这里 26 个字母全在用：第一次操作必然把两个字母合并成一个，之后永远只有 ≤25 种字母，而目标要 26 种。", "The cycle method is right, but it needs a spare letter. All 26 letters are in use here: the first conversion must merge two letters, after which at most 25 distinct letters remain forever, while the target has 26."],
  "wrong2": ["表其实是一致的：每个字母都只出现一次，各有唯一去处（a→b, b→c, …, z→a）。失败的原因不在表。", "The table is actually consistent: each letter appears once and has a single destination (a→b, b→c, …, z→a). The failure is not in the table."],
  "answer": ["推理：两串不相等；表一致；str2 的字母种数是 26，不小于 26 → False。若把 z 换成 a 之外的任意已用字母，str2 就只有 25 种，答案会变成 True。", "Reasoning: the strings differ; the table is consistent; str2 uses 26 distinct letters, not fewer than 26 → False. Change the final a to any letter already used and str2 has 25 letters — the answer becomes True."],

  "s8t": ["从两个观察到 Python，以及成本", "From two observations to Python, and the cost"],
  "s8e": ["这一步要回答：每行代码来自哪个想法？", "The question for this step: which idea does each line come from?"],
  "map1": ["if str1 == str2: return True —— 第 5 步的例外：0 次操作，哪怕用满 26 个字母。必须放在最前面，否则会被最后一行误判为 False。", "if str1 == str2: return True — the exception from step 5: zero conversions, even with all 26 letters. It must come first, or the last line would wrongly say False."],
  "map2": ["target 字典与 for a, b in zip(str1, str2) —— 第 3 步：同一个字母不能分开。zip 把两个串按位置配对成 (a, b)；遇到 a 已记录但去处不是 b，就返回 False。", "The target dict and for a, b in zip(str1, str2) — step 3: one letter cannot split. zip pairs the two strings position by position as (a, b); if a is already recorded with a destination other than b, return False."],
  "map3": ["return len(set(str2)) < 26 —— 第 4、5 步：set(str2) 是 str2 用到的不同字母的集合，len 是其个数；少于 26 才保证有空闲字母拆环。", "return len(set(str2)) < 26 — steps 4 and 5: set(str2) is the set of distinct letters in str2 and len counts them; fewer than 26 guarantees a spare letter to break cycles."],
  "map4": ["代码从不真的执行操作：第 6 步里的操作序列只是证明“能做到”，判断本身只需要这两个条件。", "The code never performs a conversion: the sequence in step 6 only proves it can be done; the decision needs just these two conditions."],
  "cost": [
    "成本：设长度为 n。str1 == str2 比较最多 n 次字符；扫描一遍 n 次字典操作，每次 O(1)；set(str2) 再扫 n 个字符。总时间 O(n)。额外空间：字典最多 26 个键、集合最多 26 个元素，是 O(1)（与 n 无关）。对比第 2 步的 BFS：状态数可达 26ᵏ。",
    "Cost: let n be the length. str1 == str2 compares at most n characters; the scan does n dictionary operations of O(1) each; set(str2) reads n more characters. O(n) time overall. Extra space: the dict holds at most 26 keys and the set at most 26 letters, so O(1), independent of n. Compare the BFS of step 2, with up to 26ᵏ states."
  ],
  "source": ["查看 Python 源码", "View Python source"],
  "copy": ["复制 Python", "Copy Python"],
  "download": ["下载 solution.py", "Download solution.py"],
  "copied": ["已复制到剪贴板。", "Copied to the clipboard."],
  "fallback": ["剪贴板不可用：全文已在下面选中，请按 Ctrl+C（Mac 上 ⌘C）。", "Clipboard unavailable: the full text is selected below; press Ctrl+C (⌘C on a Mac)."],
  "manualCopy": ["手动复制 Python", "Copy the Python by hand"],
  "showAnswer": ["想好了，看答案", "Show the answer"],
  "related": ["相关概念", "Related concepts"],
  "related1": ["本页第 3 步：同一字母不能拆开（必要条件）", "Step 3 here: one letter cannot split (necessary condition)"],
  "related2": ["本页第 4 步：用空闲字母拆环", "Step 4 here: breaking a cycle with a spare letter"],
  "related3": ["本页第 5 步：为什么是 26", "Step 5 here: why 26 matters"]
};
