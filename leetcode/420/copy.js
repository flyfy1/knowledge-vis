window.COPY = {
  "docTitle": [
    "420 · 强密码检验器",
    "420 · Strong Password Checker"
  ],
  "back": [
    "← LeetCode 知识目录",
    "← LeetCode collection"
  ],
  "title": [
    "#420 强密码检验器",
    "#420 Strong Password Checker"
  ],
  "intro": [
    "aaaB1 只差一个字符，也有三个连续 a。一次插入能同时修好两处吗？",
    "aaaB1 is one character too short and has three adjacent a’s. Can one insertion fix both?"
  ],
  "hard": [
    "困难 · 贪心 · 字符串",
    "Hard · Greedy · Strings"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "01 一次改两处",
    "01 One edit, two repairs"
  ],
  "nav1": [
    "02 计算重复段",
    "02 Count runs"
  ],
  "nav2": [
    "03 删除花在哪里",
    "03 Spend deletions"
  ],
  "nav3": [
    "04 先预测",
    "04 Predict first"
  ],
  "nav4": [
    "05 Python 与证明",
    "05 Python & proof"
  ],
  "h0": [
    "一次插入能修好什么？",
    "What can one insertion repair?"
  ],
  "p0": [
    "这一步要回答：把 aaaB1 变强最少要几次修改？输入是密码字符串，输出是操作次数，不是修改后的密码。一次操作可插入、删除或替换一个字符。",
    "How many edits make aaaB1 strong? The input is a password string; the output is a count of operations, rather than the repaired string. Each insertion, deletion or replacement costs one operation."
  ],
  "rules": [
    "强密码必须同时满足：长度 6–20；至少有一个小写字母、一个大写字母和一个数字；没有三个连续相同字符。官方输入长度 1–50，只含英文字母、数字、点号和感叹号。已经强则返回 0。",
    "A strong password has 6–20 characters, at least one lowercase letter, one uppercase letter and one digit, and no three equal adjacent characters. Official inputs have length 1–50 and contain letters, digits, dot or exclamation mark. Return 0 if already strong."
  ],
  "handTask": [
    "保持原串 aaaB1 不变，切换插入位置。观察长度和连续三个 a 是否一起被修复。",
    "Keep aaaB1 fixed and switch the insertion position. Observe whether both the length and the triple-a fault disappear."
  ],
  "handLegend": [
    "选择一次插入",
    "Choose one insertion"
  ],
  "hand0": [
    "末尾插入 x → aaaB1x",
    "Append x → aaaB1x"
  ],
  "hand1": [
    "在 a 之间插入 0 → aa0aB1",
    "Insert 0 between a’s → aa0aB1"
  ],
  "handBad": [
    "长度 5 → 6；但 aaa 仍存在。这条路线还要一次替换。",
    "Length 5 → 6; aaa remains. This route still needs a replacement."
  ],
  "handGood": [
    "长度 5 → 6；三个 a 被拆开，三类字符都有。一次操作完成。",
    "Length 5 → 6; the a’s are separated and all three classes are present. One edit finishes the repair."
  ],
  "handConclusion": [
    "长度至少要增加 1，所以答案 ≥1；aa0aB1 给出一次可行修改，所以答案恰为 1。把“补长度”和“去重复”的次数相加会重复计费：这里 1+1=2 是错的。",
    "The length must increase by at least one, giving a lower bound of 1. The valid construction aa0aB1 attains it. Adding “fix length” and “fix repeats” double-counts the same edit: 1+1=2 is wrong here."
  ],
  "h1": [
    "一段连续相同字符需要几次替换？",
    "How many replacements does one run need?"
  ],
  "p1": [
    "这一步要回答：长度不变时，连续 L 个相同字符要改几个？“重复段”是不能再向左右延伸的相同字符块。每三个不相交的字符至少要改一个，否则那三个仍相同。L=7 时，aaa | aaa | a 至少要改 2 个。",
    "With length fixed, how many characters must change in a run of length L? A run is a maximal adjacent block of one character. Each disjoint triple needs a change, or that triple survives. For L=7, aaa | aaa | a needs at least two replacements."
  ],
  "runProof": [
    "每第三个字符换成不同字符就能达到这个下界，例如 aaaaaaa → aaBaa0a。因此一段的需求是 ⌊L/3⌋（向下取整）；所有段的需求之和记为 R。缺失类别数 M 是小写、大写、数字中未出现的类别数。",
    "Changing every third character attains the bound: aaaaaaa → aaBaa0a. A run therefore needs floor(L/3) replacements. Let R be their sum over all runs. Let M count the missing classes among lowercase, uppercase and digit."
  ],
  "comboQ": [
    "两种缺陷碰到一起怎么算？看 aaaaaa：长度 6 已经合法；按上面的规则 R=⌊6/3⌋=2；只有小写，缺大写和数字，所以 M=2。是不是要 2+2=4 次？先选一个方案，再看结果。",
    "What happens when both faults meet? Take aaaaaa: length 6 is already legal; by the rule above R=floor(6/3)=2; only lowercase is present, so uppercase and digit are missing and M=2. Does it need 2+2=4 edits? Choose a plan, then read the result."
  ],
  "comboLegend": [
    "aaaaaa 的修改方案",
    "A plan for aaaaaa"
  ],
  "combo0": [
    "先拆段，再补类别：aaxaax → Baxa1x（4 次）",
    "Break runs, then add classes: aaxaax → Baxa1x (4 edits)"
  ],
  "combo1": [
    "拆段时直接写入缺的类别：aaBaa1（2 次）",
    "Write the missing classes while breaking runs: aaBaa1 (2 edits)"
  ],
  "comboBad": [
    "4 次可行但浪费：两个 x 只拆段，B 和 1 只补类别，每次修改只做了一件事。",
    "Four edits work but waste effort: each x only breaks a run, and B and 1 only add classes. Every edit does one job."
  ],
  "comboGood": [
    "2 次：第 3 个字符改成 B，既拆开第一组 aaa 又补上大写；第 6 个改成 1，既拆开第二组又补上数字。每次替换同时还掉一份 R 和一份 M。",
    "Two edits: changing the 3rd character to B breaks the first aaa and adds an uppercase letter; changing the 6th to 1 breaks the second aaa and adds a digit. Each replacement pays off one unit of R and one unit of M at once."
  ],
  "overlap": [
    "所以当长度合法（6≤n≤20）时，答案是 max(M,R)。下界：一次修改最多补上一个类别，也最多拆掉一组不相交的三连（在合法长度内插入或删除也一样），所以至少要 M 次，也至少要 R 次。可以达到：若 R≥M，拆段的替换顺便写入缺的类别；若 M>R，其余 M−R 个类别另选位置替换，用与两侧邻居都不同的字符，不制造新三连。再看 aaaaaaaaa（R=3，M=2）：aaBaa1aaa 还剩一组三连，第三次替换拆掉它，得到 aaBaa1aab，共 3=max(2,3) 次。",
    "So when the length is already legal (6≤n≤20), the answer is max(M,R). Lower bound: one edit supplies at most one class and breaks at most one of the disjoint triples (an insertion or deletion at a legal length does no better), so at least M edits and at least R edits are needed. Attainable: if R≥M, the run-breaking replacements write the missing classes; if M>R, the remaining M−R classes replace other positions with characters unlike both neighbours, creating no new triple. Check aaaaaaaaa (R=3, M=2): aaBaa1aaa still has one triple, and a third replacement breaks it, giving aaBaa1aab in 3=max(2,3) edits."
  ],
  "baseline": [
    "一个正确但昂贵的基线：用动态规划求到所有“强字符串”的最短编辑距离。状态记录已读输入位置、已写长度 0–20、最后字符及连续次数 1/2、已出现的三类。转移枚举删除、插入、替换/保留；禁止连续次数到 3，最后只接收长度 6–20 且三类齐全的状态。",
    "A correct but expensive baseline computes edit distance to the set of strong strings. A dynamic program tracks input position, output length 0–20, last character and run count 1/2, and the three classes seen. Transitions delete, insert, replace or keep; reject a third repeated character, and accept only lengths 6–20 with all classes present."
  ],
  "baselineCost": [
    "设允许字符集大小为 A，基线需要 O(n·20·A²·8) 时间和 O(20·A·8) 滚动空间。测试中使用这个独立基线。扫描重复段只需记录需求及两类计数，避免枚举每个输出字符。",
    "For alphabet size A, this baseline uses O(n·20·A²·8) time and O(20·A·8) rolling space. The tests use this independent baseline. Scanning runs avoids enumerating every possible output character and retains only demand and two counts."
  ],
  "runTask": [
    "拖动 L，只改变一段的长度。每个带下划线的三字符组贡献一次必须的替换；尾部不足三个不贡献。",
    "Change only the run length L. Each underlined triple contributes one necessary replacement; a tail shorter than three contributes none."
  ],
  "runLabel": [
    "重复段长度 L",
    "Run length L"
  ],
  "runRead": [
    "L={L}；R=⌊{L}/3⌋={R}；一种构造：{fixed}",
    "L={L}; R=floor({L}/3)={R}; one construction: {fixed}"
  ],
  "h2": [
    "超长时，删哪里最划算？",
    "Where should compulsory deletions go?"
  ],
  "p2": [
    "这一步要回答：长度 n>20 时，必须删掉 D=n−20 个字符。这些删除反正要花，能不能顺便降低替换需求 R？M 仍是缺失类别数。先自己试：下面的密码有三段 aaa、BBBB、ccccc，另有 12 个不成段的字符，n=24，D=4。把 4 次删除分给这三段，让 R 尽量小。",
    "When n>20, D=n−20 deletions are compulsory. They must be paid for anyway; can they also lower the replacement demand R? M is still the missing-class count. Try it first: the password below has runs aaa, BBBB and ccccc plus 12 characters that form no run, so n=24 and D=4. Spend the four deletions on these runs and make R as small as you can."
  ],
  "allocTask": [
    "每按一次就从那一段删掉一个字符。看各段的 ⌊L/3⌋ 什么时候下降。",
    "Each press deletes one character from that run. Watch when each run’s floor(L/3) drops."
  ],
  "allocRun": [
    "从 {c}×{L} 删一个",
    "Delete one from {c}×{L}"
  ],
  "allocCard": [
    "{c} 段：长度 {L}，需求 ⌊{L}/3⌋={r}",
    "Run {c}: length {L}, demand floor({L}/3)={r}"
  ],
  "allocStatus": [
    "已删 {spent}/4 次，R={R}（起点 R=3）。",
    "Deleted {spent}/4; R={R} (it started at 3)."
  ],
  "allocLog": [
    "删 {c}：长度 {old}→{L}，R {before}→{after}",
    "Delete from {c}: length {old}→{L}, R {before}→{after}"
  ],
  "allocBest": [
    "预算用完：R=1，这已经是 4 次删除能达到的最小值。",
    "Budget spent: R=1, the smallest that any four deletions can reach."
  ],
  "allocWorse": [
    "预算用完：R={R}。还能更小，试试先删长度是 3 的倍数的段。",
    "Budget spent: R={R}. You can do better: try the run whose length is a multiple of 3 first."
  ],
  "allocUndo": [
    "撤回一次删除",
    "Undo one deletion"
  ],
  "allocReset": [
    "重新分配",
    "Start over"
  ],
  "allocReveal": [
    "花完 4 次删除后再展开：你看到了什么？",
    "Spent all four deletions? Open to compare what you saw"
  ],
  "allocSeen": [
    "你会看到：aaa 删 1 次，需求就从 1 降到 0；BBBB 要删 2 次（4→3→2）才降；ccccc 要删 3 次（5→4→3→2）。下一次节省要花几次删除，只看段长除以 3 的余数（L mod 3）：余 0 花 1，余 1 花 2，余 2 花 3。省过一次以后，段长变成 3 的倍数减 1，所以这一段以后每省一次都花 3。",
    "You will see that aaa drops from demand 1 to 0 after one deletion, BBBB needs two (4→3→2), and ccccc needs three (5→4→3→2). The price of a run’s next saving depends only on the remainder of its length after division by three (L mod 3): remainder 0 costs one, remainder 1 costs two, remainder 2 costs three. After one saving the length is one less than a multiple of three, so every later saving in that run costs three."
  ],
  "priority": [
    "所以按价格买节省：先给余数为 0 的段各花 1 次，再给余数为 1 的段各花 2 次，此后每 3 次删除再省一次。上面的例子：aaa 花 1，BBBB 花 2，最后 1 次买不到节省，R=3−2=1，答案是 4+max(0,1)=5。",
    "So buy savings in order of price: one deletion for each remainder-0 run, then two for each remainder-1 run, then three per further saving. In the example above, aaa costs one and BBBB costs two; the last deletion buys nothing, so R=3−2=1 and the answer is 4+max(0,1)=5."
  ],
  "wrong": [
    "“只删最长段”不可靠：aaaaaaaBBB + aB0aB0aB0aB（长度 21），删最长段 7→6 省 0，删 BBB→BB 省 1。决定因素是余数，不是长度。",
    "“Always delete from the longest run” fails. In aaaaaaaBBB + aB0aB0aB0aB (length 21), deleting from the longest run gives 7→6 and saves nothing; BBB→BB saves one replacement. The remainder, rather than the length, determines the next saving."
  ],
  "invariant": [
    "不变量：每完成一次最便宜的节省，花掉同样多的删除次数，不可能得到更小的 R。理由：每次节省都价值 1，把昂贵节省换成尚可用的便宜节省不会变差；每段的后续节省都要 3 次，不会藏着更便宜的后续机会。不能凑出下一次节省的剩余删除只缩短长度。",
    "Invariant: after each cheapest saving, no allocation of the same deletion budget can leave a smaller R. Each saving is worth one; exchanging an expensive saving for an available cheaper one cannot hurt. Every later saving within a run costs three, so no cheaper opportunity is hidden behind an expensive one. Leftover deletions that cannot buy another saving only shorten the string."
  ],
  "finishProof": [
    "长度下界要求至少 D 次删除。用最省的方式删完后，还至少要 max(M,R) 次替换；可以保留各类的一个代表，并在拆段替换时补类别，所以能达到 D+max(M,R)。多删一个再插回至少花两次，不能优于在合法长度上直接替换。",
    "The length bound requires at least D deletions. After the best allocation, at least max(M,R) replacements remain. Keep a representative of each existing class and supply missing classes while breaking runs, attaining D+max(M,R). Deleting extra characters and inserting them back costs at least two operations and cannot beat replacing at a legal length."
  ],
  "traceTask": [
    "下面的追踪按同一价格规则自动分配，可换其他预设。换预设会把本实验回到起点。逐步花删除预算，看每张卡的原长→当前长度、⌊L/3⌋，以及保留的操作记录。这里演示需求账本，不构造最终密码；无节省的剩余删除只记预算，不伪造字符变化。",
    "The trace below applies the same price rule automatically, and you can switch to other presets. Changing a preset restarts this experiment. Spend deletions step by step and compare original/current lengths, floor(L/3), and the retained ledger. This is a demand ledger, not a repaired password: leftover deletions with no saving consume budget without pretending to change displayed run characters."
  ],
  "simulation": [
    "浏览器是教学模拟；Python 原始提交代码由离线测试实际执行。",
    "The browser is a teaching simulation; offline tests execute the canonical Python submission."
  ],
  "preset": [
    "实验预设",
    "Experiment preset"
  ],
  "pre0": [
    "24 字符：三种余数",
    "24 characters: three remainders"
  ],
  "pre1": [
    "a：最短输入",
    "a: shortest input"
  ],
  "pre2": [
    "aA1：仅长度不足",
    "aA1: length only"
  ],
  "pre3": [
    "1337C0d3：已强",
    "1337C0d3: already strong"
  ],
  "pre4": [
    "21 个 a：删除与缺类",
    "21 a’s: deletions and missing classes"
  ],
  "pre5": [
    "50 个 !：上界与三类全缺",
    "50 !’s: upper bound, all classes missing"
  ],
  "pre6": [
    "aaaB1：插入可重叠修复",
    "aaaB1: insertion overlaps repairs"
  ],
  "input": [
    "输入：{s}；n={n}；M={M}",
    "Input: {s}; n={n}; M={M}"
  ],
  "runCard": [
    "段 {i} · 字符 {c}",
    "Run {i} · character {c}"
  ],
  "lengths": [
    "原长 {old} → 账本长度 {now}",
    "Original {old} → ledger length {now}"
  ],
  "need": [
    "替换需求 {old} → {now}",
    "Replacement demand {old} → {now}"
  ],
  "prev": [
    "← 撤回一笔",
    "← Undo allocation"
  ],
  "next": [
    "应用下一笔删除 →",
    "Apply next deletion allocation →"
  ],
  "reset": [
    "重置本实验",
    "Reset experiment"
  ],
  "end": [
    "花完删除预算",
    "Spend full deletion budget"
  ],
  "progress": [
    "已完成 {i}/{total} 笔；D={D}，已花 {spent}，剩余 {left}。当前 R={R}。\n{result}",
    "Allocations {i}/{total}; D={D}, spent={spent}, remaining={left}. Current R={R}.\n{result}"
  ],
  "pending": [
    "预算未分配完；当前 R 还不是最终需求。",
    "Budget remains; current R is not the final demand."
  ],
  "longAnswer": [
    "预算完成：最少操作 = {D}+max({M},{R}) = {answer}。",
    "Budget complete: minimum edits = {D}+max({M},{R}) = {answer}."
  ],
  "shortAnswer": [
    "无需删除：最少操作 = max(6−{n},{M}) = {answer}。",
    "No deletions: minimum edits = max(6−{n},{M}) = {answer}."
  ],
  "legalAnswer": [
    "无需删除：最少操作 = max({M},{R}) = {answer}。",
    "No deletions: minimum edits = max({M},{R}) = {answer}."
  ],
  "save": [
    "段 {index}：长度 {old}→{length}，花 {cost} 次删除；总需求 R：{before}→{after}。",
    "Run {index}: length {old}→{length}, spend {cost} deletions; total demand R: {before}→{after}."
  ],
  "neutral": [
    "剩余 {cost} 次删除不足以再买一次节省（或需求已为零）。只记长度预算，R：{before}→{after}。",
    "The remaining {cost} deletions cannot buy another saving (or demand is already zero). Record only the length budget; R: {before}→{after}."
  ],
  "h3": [
    "新密码：四次删除能省几次替换？",
    "Fresh password: how many replacements do four deletions save?"
  ],
  "p3": [
    "这一步要回答：能否用刚才的余数规则算出新例子的最优值？重复段是相邻相同字符的最大块；长度除以 3 的余数决定下一次节省要花多少删除。此题独立于预设。",
    "Can the remainder rule solve a fresh case? A run is a maximal block of equal adjacent characters; its length modulo three determines the deletion cost of its next saving. This exercise is independent of the preset."
  ],
  "transfer": [
    "密码 zzzzQQQQQQQQ + (bC7)×4，长度 24，三类齐全。最少需要多少次操作？先在纸上分配必须的四次删除，再选择。",
    "Password zzzzQQQQQQQQ + (bC7)×4 has length 24 and all three classes. How many edits are necessary? Allocate the four compulsory deletions on paper before choosing."
  ],
  "choose": [
    "选择操作次数，再揭晓",
    "Choose an edit count, then reveal"
  ],
  "opt0": [
    "4 次：删除就能修好全部重复",
    "4: deletions repair all repeats"
  ],
  "opt1": [
    "7 次：删除和替换分别计数",
    "7: count deletions and replacements separately"
  ],
  "opt2": [
    "6 次：删除后仍需两次替换",
    "6: two replacements remain after deletion"
  ],
  "reveal": [
    "检查并揭晓推导",
    "Check and reveal reasoning"
  ],
  "waiting": [
    "先选择一个答案。",
    "Choose an answer first."
  ],
  "chosen": [
    "已选择；推导仍隐藏。",
    "Choice recorded; reasoning is still hidden."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还不对。",
    "Not yet."
  ],
  "answer": [
    "答案是 6。初始 R=⌊4/3⌋+⌊8/3⌋=3，D=4。zzzz→zz 花 2 次删除才省 1；QQQQQQQQ→QQQQQ 花 3 次才省 1。买两次节省至少要 2+3=5 次删除，预算不足；同一个长段连省两次则要 3+3=6。最多省 1，故 4+max(0,2)=6。选 4 高估了删除的收益；选 7 忽略了删除也能拆段。",
    "The answer is 6. Initially R=floor(4/3)+floor(8/3)=3 and D=4. zzzz→zz costs two deletions to save one replacement; QQQQQQQQ→QQQQQ costs three. Buying both savings needs at least 2+3=5 deletions, beyond the budget; buying two in the longer run costs 3+3=6. At most one is saved, so 4+max(0,2)=6. Choosing 4 overestimates the savings; choosing 7 ignores overlap between deletion and run repair."
  ],
  "h4": [
    "把最优账本写成 Python",
    "Turn the optimal ledger into Python"
  ],
  "p4": [
    "这一步要回答：如何只扫描一次就实现？重复段是最大连续相同字符块；missing 是三类缺失数，replacements 是各段 ⌊L/3⌋ 之和。mod0、mod1 只统计长度至少 3 且余数为 0、1 的段数，不保存段数组。",
    "How can one scan implement the ledger? A run is a maximal block of equal characters; missing counts absent classes, and replacements sums floor(L/3). mod0 and mod1 count runs of length at least three with remainder zero or one. The submission stores no run array."
  ],
  "mapping": [
    "代码映射：while 扫描各段并累计 R；两个长度分支处理 n<6 和 n≤20；use=min(remaining,mod0) 对应先买 1 次删除的节省；接着用 remaining//2 买余数 1 的节省，最后每 3 次删除买一次。remaining 和 replacements 必须一起更新；每步维持“同预算无法留下更小 R”的不变量。",
    "Code map: the while loop scans runs and accumulates R. Two length branches handle n<6 and n≤20. use=min(remaining,mod0) buys one-deletion savings first, then remaining//2 buys remainder-1 savings, then each three deletions buy another. Update remaining and replacements together, preserving the invariant that the same budget cannot leave a smaller R."
  ],
  "cost": [
    "n 是输入长度。三次类别检查加一次分段扫描都是 O(n)，后续常数次计算；辅助空间 O(1)。教学模拟保存各次账本快照，最坏用 O(n²) 空间，与提交代码的空间不同。",
    "Here n is input length. Three class checks and one run scan take O(n) time, followed by constant work; auxiliary space is O(1). The teaching simulation retains ledger snapshots, using O(n²) space in the worst case, separately from submission storage."
  ],
  "boundaries": [
    "边界：a→5；aA1→3；1337C0d3→0；aaaB1→1；21 个 a→7；50 个 !→36。n=6/20 不应删除；n=21 才开始删除。点号、感叹号可拆段但不补三类。输入字符串不会被修改。",
    "Boundaries: a→5; aA1→3; 1337C0d3→0; aaaB1→1; 21 a’s→7; 50 !’s→36. No deletions at n=6 or 20; deletions begin at 21. Dot and exclamation mark may break runs but supply no required class. The input string is not mutated."
  ],
  "limits": [
    "这是按题面三条规则求最少编辑次数的算法，不是实际密码安全评分。本页没有向 LeetCode 提交代码。",
    "This algorithm minimizes edits under the three stated rules; it is not a real password security score. This page makes no LeetCode submission."
  ],
  "sourceTitle": [
    "官方 Python3 接口的完整实现",
    "Complete implementation for the official Python3 interface"
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
    "已复制完整代码。",
    "Complete source copied."
  ],
  "copyFail": [
    "剪贴板不可用；请在下方选中的文本中手动复制。",
    "Clipboard unavailable; copy the selected source below manually."
  ],
  "manual": [
    "可手动复制的完整 Python 源码",
    "Complete Python source for manual copying"
  ],
  "related": [
    "继续连接这些概念",
    "Connect these ideas"
  ],
  "rel1": [
    "分发糖果：局部约束如何推出下界",
    "Candy: derive a lower bound from local constraints"
  ],
  "rel2": [
    "分割数组：区分可行性与最优性",
    "Split Array: distinguish feasibility from optimality"
  ],
  "foot": [
    "无自动播放、无在线执行",
    "No autoplay or online execution"
  ],
  "shortRuns": [
    "其余短段（长度≤2，不产生替换需求）：{runs}",
    "Other short runs (length≤2, no replacement demand): {runs}"
  ],
  "baselineSource": [
    "独立基线 Python：枚举编辑状态（展开）",
    "Independent Python baseline: enumerate edit states (expand)"
  ],
  "shortProof": [
    "短串（n<6）呢？长度至少要补 6−n 个字符，一次修改又最多补一个类别，所以答案 ≥ max(6−n,M)。重复段不必另算：n≤4 时至少要插入 2 个字符，插在长度≤4 的段中间就把它拆开了。n=5 时最多一个段长≥3。长 3 或 4 的段，把那次必需的插入放进段中间即可（aa?a、aa?aa）。长 5 的段就是整串五个相同字符，最多含一个类别（..... 或 !!!!! 一个都不含），所以 M≥2，答案至少是 2：一次插入拆段，一次替换补完，例如 aaaaa → aaBaaa → aaBaa1；若 M=3 就再替换一个。其余缺失类别用与邻居不同的字符补齐，所以 max(6−n,M) 总能达到。",
    "And short strings (n<6)? At least 6−n characters must be added, and one edit supplies at most one class, so the answer is at least max(6−n,M). Runs need no extra charge. For n≤4 at least two insertions are required, and placing them inside a run of length ≤4 splits it. For n=5 at most one run has length ≥3. A run of length 3 or 4 is split by placing the required insertion inside it (aa?a, aa?aa). A run of length 5 is the whole string of five equal characters, which contains at most one class (none at all for ..... or !!!!!), so M≥2 and the answer is at least 2: one insertion splits the run and one replacement finishes it, e.g. aaaaa → aaBaaa → aaBaa1; when M=3, replace one more character. Remaining missing classes use characters unlike their neighbours, so max(6−n,M) is always attainable."
  ]
};
