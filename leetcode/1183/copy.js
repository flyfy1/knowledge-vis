'use strict';
window.LESSON_COPY = {
  "docTitle": ["#1183 · 矩阵中 1 的最大数量", "#1183 · Maximum Number of Ones"],
  "title": ["#1183 · 矩阵中 1 的最大数量", "#1183 · Maximum Number of Ones"],
  "back": ["← LeetCode 专区", "← LeetCode collection"],
  "badge": ["困难 · 算法 · Python", "Hard · Algorithms · Python"],
  "official": ["官方题目 ↗", "Official problem ↗"],
  "intro": [
    "一个宽 width、高 height 的网格，每格填 0 或 1。规则：任何一个 sideLength×sideLength 的正方形子网格里，1 的个数都不能超过 maxOnes。整个网格最多能放多少个 1？",
    "A grid width cells wide and height cells tall holds a 0 or a 1 in each cell. Rule: every sideLength × sideLength square sub-grid may contain at most maxOnes ones. What is the largest number of ones the whole grid can hold?"
  ],
  "contract": [
    "接口：maximumNumberOfOnes(width, height, sideLength, maxOnes) → int。1 ≤ width, height ≤ 100；1 ≤ sideLength ≤ width, height；0 ≤ maxOnes ≤ sideLength²。“正方形子网格”指任何位置上完整的 s×s 块，下文把它叫作“窗口”，把 sideLength 简写为 s、maxOnes 简写为 k。本页把 width 当作列数、height 当作行数；交换两者答案不变。",
    "Interface: maximumNumberOfOnes(width, height, sideLength, maxOnes) → int. 1 ≤ width, height ≤ 100; 1 ≤ sideLength ≤ width, height; 0 ≤ maxOnes ≤ sideLength². A “square sub-grid” is any complete s×s block at any position; below we call it a window and abbreviate sideLength to s and maxOnes to k. This page treats width as the number of columns and height as the number of rows; swapping the two does not change the answer."
  ],
  "premium": [
    "这是会员题，官方完整题面需要订阅。上面的复述依据公开的参数顺序、示例输入和提示整理，范围与公开题解网站转述的一致，结论已用穷举搜索核对；措辞以官方页面为准。",
    "This is a subscriber-only problem. The restatement above was reconstructed from the public parameter order, sample inputs and hints, its bounds agree with those quoted by public solution sites, and the answers were checked by exhaustive search; the official page has the authoritative wording."
  ],
  "nav1": ["1 · 亲手放", "1 · Place by hand"],
  "nav2": ["2 · 暴力与贪心", "2 · Brute force & greedy"],
  "nav3": ["3 · 窗口里看见什么", "3 · What a window sees"],
  "nav4": ["4 · 挑最大的类", "4 · Pick the biggest classes"],
  "nav5": ["5 · 为什么不能更多", "5 · Why no more"],
  "nav6": ["6 · 改参数走一遍", "6 · Change the inputs"],
  "nav7": ["7 · 先预测", "7 · Predict"],
  "nav8": ["8 · Python 与成本", "8 · Python & cost"],

  "s1t": ["先亲手放：5×4 的网格，每个 2×2 窗口最多 2 个 1", "Place by hand: a 5×4 grid, at most 2 ones in every 2×2 window"],
  "s1e": [
    "这一步要回答：规则到底卡住了什么？下面是 width=5、height=4、s=2、k=2。点格子在 0 和 1 之间切换。窗口共有 (5−2+1)×(4−2+1)=12 个，它们互相重叠：一个格子可能同时属于最多 4 个窗口。超标的窗口里的格子会标红。",
    "The question for this step: what exactly does the rule restrict? Below, width=5, height=4, s=2, k=2. Click a cell to switch it between 0 and 1. There are (5−2+1)×(4−2+1) = 12 windows and they overlap: one cell can sit in up to 4 windows at once. Cells inside an over-full window turn red."
  ],
  "sandboxTask": [
    "试着放尽可能多的 1，同时不让任何格子变红。能放到几个？然后按「载入逐行贪心」，看最自然的策略得到多少。",
    "Place as many ones as you can without any red cell. How many can you get? Then press “Load row-by-row greedy” to see what the most natural strategy achieves."
  ],
  "clear": ["清空", "Clear"],
  "loadGreedy": ["载入逐行贪心", "Load row-by-row greedy"],
  "sbRead": ["1 的个数：{ones}。最满的窗口有 {max} 个 1（上限 {k}）。超标窗口：{over} 个。", "Ones: {ones}. The fullest window holds {max} (limit {k}). Over-full windows: {over}."],
  "sbValid": ["合法。", "Valid."],
  "sbInvalid": ["不合法：红色格子所在的窗口超过了 {k}。", "Not valid: the red cells sit in a window holding more than {k}."],
  "cellAria": ["第 {r} 行第 {c} 列，当前为 {v}", "row {r}, column {c}, currently {v}"],

  "s2t": ["暴力搜索太慢，逐行贪心又不对", "Brute force is too slow, and row-by-row greedy is wrong"],
  "s2e": [
    "这一步要回答：直接的方法为什么不行？暴力法：每格 0 或 1 都试一遍，检查每个窗口，取合法网格里 1 最多的。5×4 网格有 2²⁰≈100 万种填法，每种检查 12 个窗口、每个 4 格。100×100 的网格有 2¹⁰⁰⁰⁰ 种——不可能。",
    "The question for this step: why do the direct methods fail? Brute force: try 0 or 1 in every cell, check every window, keep the valid grid with most ones. A 5×4 grid has 2²⁰ ≈ 1 million fillings, each needing 12 windows of 4 cells checked. A 100×100 grid has 2¹⁰⁰⁰⁰ — hopeless."
  ],
  "greedyText": [
    "那么贪心：从左上角开始一行一行扫，只要放下这个 1 不会让任何窗口超标就放。第 0 行 5 格全放上了——每个窗口从这一行各得到 2 个 1，已经满了；于是第 1 行一个也放不进。第 2 行又全放，第 3 行又空着：共 10 个。可是 12 个是做得到的：把第 0、2、4 列整列填满，每个窗口仍然只含 2 个 1。两种摆法的差别在哪里？逐行贪心让“行”占满了窗口的名额，而整列的摆法利用了最右边那一列——它只属于少数窗口。要说清楚哪些格子“划算”，需要一个新的观察。",
    "So try greedy: scan row by row from the top-left and place a 1 whenever no window would exceed the limit. All 5 cells of row 0 go in — every window now gets 2 ones from that row and is full — so row 1 gets nothing. Row 2 fills again, row 3 stays empty: 10 ones. Yet 12 are possible: fill columns 0, 2 and 4 entirely, and every window still holds only 2. What is the difference? Greedy lets whole rows use up each window's quota, while the column layout also uses the rightmost column, which belongs to only a few windows. Saying which cells are “cheap” needs a new observation."
  ],
  "greedyCaption": ["逐行贪心的结果（10 个）", "Row-by-row greedy result (10 ones)"],

  "s3t": ["一个窗口里到底能看见哪些格子？", "Which cells can one window actually see?"],
  "s3e": [
    "这一步要回答：放了一个 1 之后，还有哪些格子可以“免费”跟着放？回头看第 2 步那张 12 个 1 的网格：1 在第 0、2、4 列，彼此隔 2 列。把 2×2 窗口向右挪 2 格、或向下挪 2 格，它看到的图案和原来一模一样。也就是说，相隔 s 行或 s 列的两个格子，在任何窗口眼里都是“同一个位置”。于是按“在 s 的周期里排第几”给每个格子贴标签：行号 r 和列号 c 除以 s 的余数，即 (r mod s, c mod s)。s=2 时只有 4 种标签，下面写成 A=(0,0)、B=(0,1)、C=(1,0)、D=(1,1)。同标签的格子构成一个“类”。",
    "The question for this step: after placing one 1, which other cells can come along “for free”? Look again at step 2's grid with 12 ones: its ones sit in columns 0, 2 and 4, two apart. Move the 2×2 window 2 cells right or 2 cells down and it sees exactly the same pattern as before. In other words, two cells s rows or s columns apart occupy “the same spot” as far as any window is concerned. So label each cell by its place within the period s: the remainders of its row r and column c divided by s, (r mod s, c mod s). With s=2 there are just 4 labels, written A=(0,0), B=(0,1), C=(1,0), D=(1,1) below. Cells with the same label form a class."
  ],
  "explorerTask": [
    "用方向键按钮移动窗口（橙色框），每到一个位置都读一读框里的标签。会不会出现两个 A？会不会缺 D？",
    "Move the window (orange frame) with the arrow buttons and read the labels inside at every position. Do you ever see two A's? Is a D ever missing?"
  ],
  "up": ["↑ 上移", "↑ Up"],
  "down": ["↓ 下移", "↓ Down"],
  "left": ["← 左移", "← Left"],
  "right": ["→ 右移", "→ Right"],
  "fillA": ["把整个 A 类填成 1", "Fill the whole class A with ones"],
  "unfillA": ["取消填充 A 类", "Clear class A"],
  "explorerRead": ["窗口左上角在 (行 {r}, 列 {c})。框里的标签：{labels}。框里 1 的个数：{ones}。", "Window's top-left corner at (row {r}, column {c}). Labels inside: {labels}. Ones inside: {ones}."],
  "aha3": [
    "每个位置都恰好是 A、B、C、D 各一个。原因：窗口覆盖连续的 s 行，它们除以 s 的余数恰好是 0…s−1 各一次；列也一样。所以任何窗口都恰好包含每个类的一个格子。",
    "Every position shows exactly one A, one B, one C and one D. Reason: a window covers s consecutive rows, whose remainders mod s are 0…s−1, each exactly once; the same holds for columns. So every window contains exactly one cell of every class."
  ],
  "consequence3": [
    "推论：如果把整个类填成 1，每个窗口里正好多出 1 个 1——不管这个类有多少格。填满 k 个类，每个窗口恰好有 k 个 1，一定合法。试试上面的按钮：填满 A 类后，移动窗口，1 的个数始终是 1。这样问题变成：选哪 k 个类？",
    "Consequence: filling an entire class with ones adds exactly one 1 to every window — however many cells the class has. Fill k whole classes and every window holds exactly k ones, so the grid is valid. Try the button above: after filling class A, move the window — it always holds exactly one 1. The question becomes: which k classes?"
  ],

  "s4t": ["选哪 k 个类？格子最多的那些", "Which k classes? The ones with the most cells"],
  "s4e": [
    "这一步要回答：每个类有多少格？类 (a, b) 的格子数 = 行号余数为 a 的行数 × 列号余数为 b 的列数。在 0…n−1 中，除以 s 余 a 的数有 ⌈(n−a)/s⌉ 个，Python 写作 (n − a + s − 1) // s。",
    "The question for this step: how many cells does each class have? Class (a, b) has (number of rows with remainder a) × (number of columns with remainder b) cells. Among 0…n−1, the numbers with remainder a mod s number ⌈(n−a)/s⌉, written (n − a + s − 1) // s in Python."
  ],
  "example4": [
    "例子：width=5 的列是 0,1,2,3,4。余 0 的有 0,2,4 共 3 列；余 1 的有 1,3 共 2 列。height=4 的行，余 0、余 1 各 2 行。所以 A=2×3=6，B=2×2=4，C=2×3=6，D=2×2=4。k=2 时选两个 6，共 12——比贪心的 10 多。边上“多出来”的那一列（第 4 列）属于余 0 的类，所以余数小的类会大一些。",
    "Example: width 5 has columns 0,1,2,3,4. Remainder 0: columns 0, 2, 4 — 3 of them; remainder 1: columns 1, 3 — 2. Height 4 has 2 rows of each remainder. So A = 2×3 = 6, B = 2×2 = 4, C = 2×3 = 6, D = 2×2 = 4. With k = 2, choose both 6's: 12 — more than greedy's 10. The extra column at the edge (column 4) has remainder 0, which is why classes with small remainders can be larger."
  ],

  "s5t": ["为什么没有别的摆法能超过它？", "Why can no other arrangement beat it?"],
  "s5e": [
    "这一步要回答：第 4 步给出了一个合法的摆法；可是任意合法的网格，1 会不会更多？“整类整类地填”只是我们的选择，别的网格可以只填某个类的一部分。需要一个上界。",
    "The question for this step: step 4 gives one valid arrangement, but could some other valid grid hold more ones? Filling whole classes was our choice; another grid might fill just part of a class. We need an upper bound."
  ],
  "proof5a": [
    "思路：给窗口的位置设计一个随机抽法，让每个格子被抽中的窗口盖住的概率，恰好等于 1 ÷（它所在类的格子数）。先看一维：宽 5、s=2，窗口起点 0,1,2,3 的概率取 1/3, 1/6, 1/6, 1/3。第 0 列只被起点 0 盖住：1/3；第 1 列被起点 0、1 盖住：1/3+1/6=1/2；第 2 列：1/6+1/6=1/3；第 3 列：1/2；第 4 列：1/3。余 0 的列有 3 个，各 1/3；余 1 的列有 2 个，各 1/2——正好是 1 ÷ 类大小。高 4 那一维取 1/2, 0, 1/2。二维时行、列起点独立地抽，盖住格子的概率相乘，仍然是 1 ÷ 类大小。（一般地，令“起点 ≤ x”的概率 = (⌊x/s⌋+1) ÷（与 x 同余的位置个数）：它随 x 不减，在最后一个起点 n−s 处正好等于 1，所以是一个合法的抽法；相邻两项之差就是上面的表。测试里对 n ≤ 100 全部精确核对过。）",
    "Idea: design a random way to choose the window's position so that each cell is covered by the chosen window with probability exactly 1 ÷ (the size of its class). One dimension first: width 5, s = 2, window starts 0, 1, 2, 3 with probabilities 1/3, 1/6, 1/6, 1/3. Column 0 is covered only by start 0: 1/3; column 1 by starts 0 and 1: 1/3 + 1/6 = 1/2; column 2: 1/6 + 1/6 = 1/3; column 3: 1/2; column 4: 1/3. The 3 columns with remainder 0 get 1/3 each, the 2 with remainder 1 get 1/2 each — exactly 1 ÷ class size. For height 4 use 1/2, 0, 1/2. In two dimensions pick row and column starts independently; probabilities multiply and are still 1 ÷ class size. (In general, let P(start ≤ x) = (⌊x/s⌋ + 1) ÷ (the number of positions with the same remainder as x): it never decreases as x grows and equals exactly 1 at the last start n − s, so it is a valid distribution; the differences of consecutive values give the table above. The tests check this exactly for all n ≤ 100.)"
  ],
  "proof5b": [
    "现在取任意合法网格，设类 X 里有 m_X 个 1、共 size_X 格，比例 f_X = m_X ÷ size_X（在 0 到 1 之间）。抽中的窗口里 1 的期望个数 = 每个 1 被盖住的概率之和 = Σ m_X ÷ size_X = Σ f_X。每个窗口最多 k 个 1，所以期望也 ≤ k：Σ f_X ≤ k。而 1 的总数 = Σ f_X × size_X。在“每个 f 不超过 1、总和不超过 k”的限制下，这个和最大就是把 1 分给最大的 k 个类——正好是第 4 步的答案。所以没有任何摆法能超过它。",
    "Now take any valid grid. Let class X contain m_X ones out of size_X cells, a fraction f_X = m_X ÷ size_X between 0 and 1. The expected number of ones in the chosen window = the sum of each 1's coverage probability = Σ m_X ÷ size_X = Σ f_X. Every window holds at most k ones, so the expectation is ≤ k too: Σ f_X ≤ k. The total number of ones is Σ f_X × size_X. With each f at most 1 and their sum at most k, this is largest when the budget goes to the k largest classes — exactly step 4's answer. So no arrangement can beat it."
  ],
  "boundary5": [
    "边界：k=0 时答案为 0；k=s² 时所有类都选上，整个网格全是 1（每个窗口恰好 s² 个，合法）；s 能整除宽和高时所有类一样大，选哪 k 个都行；s=1 时只有一个类，即整个网格。",
    "Boundaries: k = 0 gives 0; k = s² selects every class and the whole grid is ones (each window holds exactly s², which is allowed); when s divides both width and height all classes are equal and any k of them work; s = 1 has a single class, the whole grid."
  ],
  "weightsCaption": ["一维例子（宽 5，s=2）：窗口起点的概率", "1-D example (width 5, s = 2): window-start probabilities"],
  "coverCaption": ["每一列被窗口盖住的概率 = 1 ÷ 同余列数", "Each column's coverage = 1 ÷ columns with the same remainder"],
  "formula4": ["类 (a,b) 的格子数 = ⌈(height − a)/s⌉ × ⌈(width − b)/s⌉；答案 = 最大的 k 个格子数之和", "size(a,b) = ⌈(height − a)/s⌉ × ⌈(width − b)/s⌉;  answer = sum of the k largest sizes"],
  "formula5": ["E[窗口里 1 的个数] = Σ f_X ≤ k  ⇒  1 的总数 = Σ f_X · size_X ≤ 最大的 k 个类大小之和", "E[ones in window] = Σ f_X ≤ k  ⇒  total = Σ f_X · size_X ≤ sum of the k largest class sizes"],
  "bestCaption": ["第 0、2、4 列整列为 1（12 个）", "Columns 0, 2, 4 filled (12 ones)"],
  "showAnswer": ["移动几次后，看答案", "After a few moves, show the answer"],
  "colStart": ["窗口起点", "window start"],
  "colProb": ["概率", "probability"],
  "colColumn": ["列", "column"],
  "colCover": ["被盖住的概率", "coverage"],
  "colClassSize": ["同余列数", "columns with same remainder"],

  "s6t": ["改参数，看每一类被数出来、排序、被选中", "Change the inputs: count each class, sort, pick"],
  "s6e": [
    "这一步要回答：这个算法在别的参数上也成立吗？用 ± 按钮改宽、高、s、k（页面限制宽高 ≤ 12，原题可到 100）或选预设；任何改动都会从第 0 帧重新开始。前 s² 帧逐个数出每个类的格子数，然后排序，再一帧选一个最大的类，网格上同时填上它的所有格子。走到最后可以移动窗口，确认每个窗口恰好有 k 个 1。",
    "The question for this step: does the algorithm hold for other inputs? Change width, height, s and k with the ± buttons (page limit 12 for width and height; the real problem allows 100) or pick a preset; any change restarts at frame 0. The first s² frames count each class, then the sizes are sorted, then each frame picks the largest remaining class and fills all its cells in the grid. At the end, move the window to confirm every window holds exactly k ones."
  ],
  "presetLabel": ["预设（会重新开始）", "Preset (restarts the walk)"],
  "pr0": ["5×4，s=2，k=2（讲解例子）", "5×4, s=2, k=2 (worked example)"],
  "pr1": ["5×4，s=2，k=1", "5×4, s=2, k=1"],
  "pr2": ["3×2，s=2，k=2（贪心只得 3）", "3×2, s=2, k=2 (greedy gets only 3)"],
  "pr3": ["7×5，s=3，k=2", "7×5, s=3, k=2"],
  "pr4": ["6×6，s=3，k=4（能整除，类一样大）", "6×6, s=3, k=4 (divisible: equal classes)"],
  "pr5": ["4×4，s=4，k=0", "4×4, s=4, k=0"],
  "pr6": ["1×1，s=1，k=1", "1×1, s=1, k=1"],
  "pr7": ["9×7，s=4，k=16（全选）", "9×7, s=4, k=16 (all classes)"],
  "prCustom": ["（自定义）", "(custom)"],
  "paramW": ["宽 width", "width"],
  "paramH": ["高 height", "height"],
  "paramS": ["边长 s", "side s"],
  "paramK": ["上限 k", "limit k"],
  "dec": ["减少 {name}", "decrease {name}"],
  "inc": ["增加 {name}", "increase {name}"],
  "restartNote": ["输入已改变：从第 0 帧重新开始。", "Input changed: restarted at frame 0."],
  "clampNote": ["为保持 s ≤ 宽、高 且 k ≤ s²，其他参数已被同步调整。", "Other inputs were adjusted to keep s ≤ width, height and k ≤ s²."],
  "prev": ["← 上一帧", "← Previous frame"],
  "next": ["下一帧 →", "Next frame →"],
  "traceReset": ["回到第 0 帧", "Back to frame 0"],
  "end": ["跳到最后", "Jump to end"],
  "frame": ["第 {i}/{n} 帧 · {phase} · 已选 1 的个数：{total}", "Frame {i} of {n} · {phase} · ones chosen so far: {total}"],
  "phaseStart": ["开始前", "before start"],
  "phaseCount": ["数类的大小", "count class sizes"],
  "phaseSort": ["排序", "sort"],
  "phasePick": ["选类", "pick classes"],
  "phaseDone": ["完成", "finished"],
  "evStart": ["宽 {w}、高 {h}、s={s}、k={k}：共有 s²={classes} 个类，还没数。", "Width {w}, height {h}, s={s}, k={k}: there are s² = {classes} classes, none counted yet."],
  "evCount": ["类 ({a},{b})：余 {a} 的行有 {rows} 行，余 {b} 的列有 {cols} 列 → {rows}×{cols} = {size} 格。", "Class ({a},{b}): {rows} rows with remainder {a}, {cols} columns with remainder {b} → {rows}×{cols} = {size} cells."],
  "evSort": ["按格子数从大到小排序：{order}。", "Sort by size, largest first: {order}."],
  "evPick": ["第 {i}/{k} 次选择：类 ({a},{b})，{size} 格全部填 1。累计 {before} + {size} = {total}。", "Pick {i} of {k}: class ({a},{b}), all {size} cells become 1. Running total {before} + {size} = {total}."],
  "evDone": ["答案 {total}。最满的窗口有 {max} 个 1，没有超过 k={k}。", "Answer {total}. The fullest window holds {max} ones, not more than k = {k}."],
  "evDoneZero": ["k=0：一个类也不能选，答案 0。", "k = 0: no class may be chosen; the answer is 0."],
  "classesCaption": ["类的账本（★ 本帧；✓ 已选）", "Class ledger (★ this frame; ✓ chosen)"],
  "colClass": ["类 (a,b)", "class (a,b)"],
  "colRows": ["行数", "rows"],
  "colCols": ["列数", "columns"],
  "colSize": ["格子数", "cells"],
  "colRank": ["排名", "rank"],
  "colState": ["状态", "state"],
  "stChosen": ["✓ 已选", "✓ chosen"],
  "stCurrent": ["★", "★"],
  "stWaiting": ["—", "—"],
  "gridCaption": ["网格（格内是类的标签 a,b；亮色 = 1；橙框 = 窗口）", "Grid (cell text is the class label a,b; bright = 1; orange frame = window)"],
  "windowRead": ["窗口在 (行 {r}, 列 {c})：框里 {ones} 个 1（k = {k}）。", "Window at (row {r}, column {c}): {ones} ones inside (k = {k})."],
  "sim": ["这是 JavaScript 教学模拟，按 solution.py 的步骤数类、排序、选类；浏览器并不执行 Python。", "This is a JavaScript teaching simulation following solution.py's steps: count, sort, pick; the browser does not run Python."],

  "s7t": ["轮到你：先预测再揭晓", "Your turn: predict, then reveal"],
  "s7e": [
    "这一步要回答：你能直接算出答案吗？width=7、height=4、s=3、k=2（不是上面的预设）。先选答案再揭晓；改选会清掉旧反馈。",
    "The question for this step: can you compute the answer directly? width = 7, height = 4, s = 3, k = 2 (not one of the presets above). Choose, then reveal; changing your choice clears old feedback."
  ],
  "predictLegend": ["最多能放几个 1？", "How many ones at most?"],
  "option0": ["12：网格被切成 3×2=6 块，每块放 2 个", "12: the grid splits into 3×2 = 6 blocks with 2 ones each"],
  "option1": ["10", "10"],
  "option2": ["4：只有 2 个完整的 3×3 块，每块 2 个", "4: there are only 2 complete 3×3 blocks, 2 ones each"],
  "reveal": ["揭晓", "Reveal"],
  "predictReset": ["清除选择", "Clear choice"],
  "await": ["先选一个答案，再揭晓。", "Choose an answer, then reveal."],
  "correct": ["正确。", "Correct."],
  "wrong0": ["边角的不完整块不能各自独立地放 2 个：它们和相邻的完整块合起来仍构成窗口。按类计算会更小。", "The incomplete edge blocks cannot each take 2 on their own: together with neighbouring blocks they still form windows. Counting by classes gives less."],
  "wrong2": ["只数完整块太保守：边上多出来的那一列和那一行里的格子，也属于某些类，选大类时它们会一起被填上。", "Counting only complete blocks is too cautious: the cells in the extra column and row at the edges also belong to classes, and choosing large classes fills them too."],
  "answer": ["推理：列 0…6 按余数分：余 0 有 0,3,6 共 3 列，余 1、余 2 各 2 列；行 0…3：余 0 有 0,3 共 2 行，余 1、余 2 各 1 行。最大的类是 2×3=6，其次是 2×2=4（有两个），再次是 1×3=3。选两个最大的：6+4=10。", "Reasoning: columns 0…6 by remainder: remainder 0 has 0, 3, 6 (3 columns), remainders 1 and 2 have 2 each; rows 0…3: remainder 0 has 0 and 3 (2 rows), remainders 1 and 2 have 1 each. The largest class is 2×3 = 6, next 2×2 = 4 (two of them), then 1×3 = 3. Take the two largest: 6 + 4 = 10."],

  "s8t": ["从观察到 Python，以及成本", "From the observation to Python, and the cost"],
  "s8e": ["这一步要回答：每行代码来自哪个想法？", "The question for this step: which idea does each line come from?"],
  "map1": ["两层 for a, for b —— 第 3 步：类由余数对 (a, b) 决定，共 s² 个。", "The two loops over a and b — step 3: a class is the remainder pair (a, b); there are s² of them."],
  "map2": ["rows = (height − a + s − 1) // s 与 cols = …，sizes.append(rows * cols) —— 第 4 步：类的格子数是行数乘列数。// 是整除（向下取整）；加 s−1 再整除就是向上取整。", "rows = (height − a + s − 1) // s and cols = …, sizes.append(rows * cols) — step 4: a class's size is rows × columns. // is floor division; adding s−1 before dividing rounds up."],
  "map3": ["sizes.sort(reverse=True) 和 sum(sizes[:maxOnes]) —— 第 4、5 步：填满最大的 k 个类可行，且第 5 步证明不可能更多。切片 sizes[:k] 取前 k 个，k=0 时为空，和为 0。", "sizes.sort(reverse=True) and sum(sizes[:maxOnes]) — steps 4 and 5: filling the k largest classes is valid, and step 5 proves nothing does better. The slice sizes[:k] takes the first k; for k = 0 it is empty and sums to 0."],
  "cost": [
    "成本：一共 s² 个类，每个 O(1) 算出大小；排序 O(s² log s²) = O(s² log s)；求和 O(k) ≤ O(s²)。总时间 O(s² log s)，与网格面积无关；s ≤ 100 时至多 10⁴ 个数。额外空间 O(s²) 存放 sizes。对比第 2 步的暴力法：2^(宽×高) 种填法。",
    "Cost: there are s² classes, each sized in O(1); sorting costs O(s² log s²) = O(s² log s); the sum is O(k) ≤ O(s²). Total O(s² log s) time, independent of the grid's area; with s ≤ 100 that is at most 10⁴ numbers. Extra space O(s²) for sizes. Compare step 2's brute force: 2^(width × height) fillings."
  ],
  "source": ["查看 Python 源码", "View Python source"],
  "copy": ["复制 Python", "Copy Python"],
  "download": ["下载 solution.py", "Download solution.py"],
  "copied": ["已复制到剪贴板。", "Copied to the clipboard."],
  "fallback": ["剪贴板不可用：全文已在下面选中，请按 Ctrl+C（Mac 上 ⌘C）。", "Clipboard unavailable: the full text is selected below; press Ctrl+C (⌘C on a Mac)."],
  "manualCopy": ["手动复制 Python", "Copy the Python by hand"],
  "related": ["相关概念", "Related concepts"],
  "related1": ["本页第 3 步：每个窗口恰好含每类一个格子", "Step 3 here: every window holds exactly one cell of each class"],
  "related2": ["本页第 5 步：用“随机窗口”证明上界", "Step 5 here: an upper bound from a random window"],
  "related3": ["本页第 2 步：逐行贪心的反例", "Step 2 here: the row-by-row greedy counterexample"]
};
