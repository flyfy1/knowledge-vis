window.COPY = {
  "docTitle": [
    "#920 · 播放列表的数量",
    "#920 · Number of Music Playlists"
  ],
  "title": [
    "#920 · 播放列表的数量",
    "#920 · Number of Music Playlists"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "collection": [
    "LeetCode 交互题解集",
    "LeetCode interactive lessons"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "两首歌，播放三次：为什么只能是 ABA 或 BAB？从这个小计数推导不必保存整张歌单的方法。",
    "Two songs, three plays: why only ABA or BAB? Use that tiny count to discover what we can remember instead of a whole playlist."
  ],
  "badge": [
    "Hard · Python · 组合计数",
    "Hard · Python · Counting"
  ],
  "nav0": [
    "0 · 手算",
    "0 · By hand"
  ],
  "nav1": [
    "1 · 枚举",
    "1 · Enumerate"
  ],
  "nav2": [
    "2 · 合并状态",
    "2 · Group states"
  ],
  "nav3": [
    "3 · 先预测",
    "3 · Predict"
  ],
  "nav4": [
    "4 · Python",
    "4 · Python"
  ],
  "s0": [
    "0 · 三次播放，有几张合格歌单？",
    "0 · How many three-play lists work?"
  ],
  "p0": [
    "这一步要回答：A、B 两首不同的歌，恰好播放三次，且重播前至少隔一首歌，有几种顺序？歌单是有顺序的序列；n=2 是可选歌曲数，goal=3 是播放次数，k=1 是重播前必须隔开的播放次数。每首歌至少出现一次。先自己列出候选，再展开筛选。",
    "Which orders work with songs A and B, exactly three plays, and at least one intervening play before a repeat? A playlist is an ordered sequence. Here n=2 counts available songs, goal=3 counts plays, and k=1 counts required intervening plays. Both songs must appear. Try listing the candidates before opening the filter."
  ],
  "handBtn": [
    "展开 / 收起八个候选",
    "Show / hide all eight candidates"
  ],
  "hand": [
    "AAA、BBB：缺少一首歌，且相邻重复。AAB、ABB、BAA、BBA：都有相邻重复。ABA、BAB：两首都出现，重复之间有一首别的歌。因此答案是 2，顺序不同要分别计数。",
    "AAA and BBB miss a song and repeat immediately. AAB, ABB, BAA and BBA repeat immediately. ABA and BAB use both songs and separate the repeat by another song. So the count is 2; different orders count separately."
  ],
  "constraints": [
    "官方范围：0 ≤ k < n ≤ goal ≤ 100。返回答案除以 1,000,000,007 的余数（取模）。输入非空；不要求每首只播放一次。",
    "Official bounds: 0 ≤ k < n ≤ goal ≤ 100. Return the remainder on division by 1,000,000,007 (the modulus). Inputs are nonempty; songs need not appear exactly once."
  ],
  "s1": [
    "1 · 枚举能算对，为什么还要换方法？",
    "1 · Why move beyond enumeration?"
  ],
  "p1": [
    "这一步要回答：怎样用一个简单、可信的方法得到小输入的答案？枚举所有 n^goal 个有序序列，检查是否每首都出现，再检查每次播放是否在最近 k 次中出现过。下面的基线（直接筛选法）返回准确整数，不取模，只用于小输入核对。",
    "How can a simple method give a trustworthy answer on small inputs? Enumerate all n^goal ordered sequences, check coverage, then reject any play found among the last k plays. This baseline returns the exact integer count without a modulus; use it only for tiny checks."
  ],
  "baselineCost": [
    "product 逐个生成长度 goal 的元组；每个候选用集合检查，时间 O(goal · n^goal)，辅助空间 O(goal+n)。n=100、goal=100 时，候选数已达 100^100。我们想复用计数，避免逐张保存和检查歌单。",
    "product streams length-goal tuples. Set-based checks cost O(goal · n^goal) time and O(goal+n) auxiliary space. At n=100, goal=100 there are 100^100 candidates. We want to reuse counts instead of inspecting playlists individually."
  ],
  "wrong": [
    "诱人的错法：每个位置总有 n−k 个选择，所以乘起来即可。但 k=0、n=2、goal=3 时，2^3=8 还包括 AAA 和 BBB，它们没有覆盖所有歌曲；正确答案是 6。只把同一个例子的 k 从 1 改为 0，六张混合歌单都合法了。冷却限制与全部覆盖必须同时计数。",
    "Tempting rule: each position has n−k choices, so just multiply. But with k=0, n=2, goal=3, 2^3=8 includes AAA and BBB, which fail coverage; the answer is 6. Changing only k from 1 to 0 in our example makes all six mixed lists legal. Both cooldown and coverage must be counted."
  ],
  "s2": [
    "2 · 不记歌名，为什么仍然能正确扩展？",
    "2 · Why can we group different histories?"
  ],
  "p2": [
    "这一步要回答：长度相同、用过的不同歌曲数也相同的合法前缀，下一步选择数是否一样？前缀指歌单开头的一段，暂时允许没用全歌曲。定义 dp[i][j]：从全部 n 首有名字的歌中，构成长度 i、恰好用过 j 首不同歌曲的合法前缀数。动态规划就是复用这些小问题的计数。",
    "Do legal prefixes of the same length and used-song count have the same number of next choices? A prefix is an initial part of a playlist; it may still omit songs. Define dp[i][j] as the number of legal length-i prefixes using exactly j distinct labeled songs out of all n. Dynamic programming reuses these smaller counts."
  ],
  "derive": [
    "仍看 n=2、k=1：第一首有 A 或 B，dp[1][1]=2。再放一首，不能立即重播，所以 dp[2][1]=0，dp[2][2]=2（AB、BA）。第三首若是新歌，必须来自 dp[2][1]，贡献 0×1；若是旧歌，来自 AB 或 BA，每个都只有一首不在末尾，贡献 2×1。合计 dp[3][2]=2。",
    "Keep n=2, k=1. The first play is A or B, so dp[1][1]=2. No immediate replay is allowed, so dp[2][1]=0 and dp[2][2]=2 (AB, BA). A new song at play three must extend dp[2][1], contributing 0×1. A replay extends AB or BA; each has one used song outside its last position, contributing 2×1. Thus dp[3][2]=2."
  ],
  "branches": [
    "对目标 (i,j)，按最后一首是否首次出现分两类：新歌来自 (i−1,j−1)，还有 n−j+1 首未用；重播来自 (i−1,j)，用过 j 首，但最近 k 首被禁用。合法前缀的最近 k 次（若不够则取全部）一定互不相同，否则早已违反规则。因此旧歌可选 max(j−k,0) 首；当 j<k 时没有可重播歌曲。不同历史的歌名虽不同，可选数量却相同。",
    "For target (i,j), partition by whether the last song is new. A new song extends (i−1,j−1), leaving n−j+1 unused identities. A replay extends (i−1,j). Of its j used songs, the last k are blocked. The last k plays of a legal prefix (or all plays if shorter) are distinct, since a repeat there would already violate the rule. Hence max(j−k,0) used songs are eligible; when j<k there are none. Histories may have different identities, yet identical numbers of choices."
  ],
  "formula": [
    "dp[i][j] = dp[i−1][j−1] × (n−j+1) + dp[i−1][j] × max(j−k, 0)",
    "dp[i][j] = dp[i−1][j−1] × (n−j+1) + dp[i−1][j] × max(j−k, 0)"
  ],
  "proof": [
    "为什么不漏不重？删掉任何合法前缀的最后一首，就唯一确定了上一前缀及“新歌 / 重播”类别。反过来，按上述可选数追加一定合法。两类互斥，所以相加，且每张歌单恰好计一次。这给出不变量：每个完成的格子都准确计数该长度、该已用种数的合法前缀。空前缀只有一个，dp[0][0]=1；不可能的状态为 0；最终只取 dp[goal][n]，确保用全 n 首。",
    "Why no omissions or duplicates? Deleting a legal prefix’s last song uniquely determines its predecessor and its new-song/replay class. Conversely, each counted append is legal. The classes are disjoint, so we add them and count every playlist once. This establishes the invariant: each completed cell counts exactly the legal prefixes with its length and used count. There is one empty prefix, dp[0][0]=1; impossible states are 0. Taking only dp[goal][n] enforces full coverage."
  ],
  "presets": [
    "实验输入（切换会重置表格）",
    "Experiment input (changing resets the table)"
  ],
  "preset0": [
    "2 首 · 3 次 · k=1",
    "2 songs · 3 plays · k=1"
  ],
  "preset1": [
    "2 首 · 3 次 · k=0",
    "2 songs · 3 plays · k=0"
  ],
  "preset2": [
    "3 首 · 3 次 · k=1",
    "3 songs · 3 plays · k=1"
  ],
  "preset3": [
    "3 首 · 5 次 · k=2",
    "3 songs · 5 plays · k=2"
  ],
  "preset4": [
    "1 首 · 4 次 · k=0",
    "1 song · 4 plays · k=0"
  ],
  "preset5": [
    "4 首 · 4 次 · k=0",
    "4 songs · 4 plays · k=0"
  ],
  "prev": [
    "← 撤回一格",
    "← Undo one cell"
  ],
  "next": [
    "计算下一格 →",
    "Compute next cell →"
  ],
  "reset": [
    "回到初始表",
    "Reset table"
  ],
  "end": [
    "计算到末格",
    "Complete table"
  ],
  "guide": [
    "先前进到 (2,2)，看两个来源格与乘数，再前进到 (3,2)。保持 n=2、goal=3，改 k=0 后比较同一格。每帧是一个格子算完后，之前的计数保留；当前格标为 ◆，新歌来源标为 N，重播来源标为 R；? 表示尚未计算，0 表示已知不可能。",
    "Advance to (2,2) and inspect both source cells and multipliers, then advance to (3,2). Keep n=2, goal=3 and change k to 0 to compare the same cell. Each frame follows one completed cell; earlier counts remain. ◆ marks the current cell, N the new-song source, R the replay source. ? means not computed; 0 means known impossible."
  ],
  "sim": [
    "教学模拟：JavaScript 生成完整小表，不执行下方 Python。行 i=播放次数，列 j=用过的不同歌曲数；每格单位为前缀张数。这些小实验展示准确整数，无需取模；没有省略转移。",
    "Teaching simulation: JavaScript builds the tiny full table; it does not execute the Python below. Row i counts plays; column j counts distinct used songs. Each cell counts prefixes. These tiny cases show exact integers without a modulus; no transitions are omitted."
  ],
  "caption": [
    "前缀计数 dp[i][j] · n={n}, goal={goal}, k={k}",
    "Prefix counts dp[i][j] · n={n}, goal={goal}, k={k}"
  ],
  "progress": [
    "已计算 {index}/{total} 个格子 · 当前 (i,j)=({i},{j})",
    "Computed {index}/{total} cells · current (i,j)=({i},{j})"
  ],
  "initial": [
    "初始：空前缀 1 张。长度为 0 却用过歌曲，或长度为正却用过 0 首，均为 0。",
    "Initial: one empty prefix. Using songs in zero plays, or using zero songs in positive plays, is impossible and counts as 0."
  ],
  "calc": [
    "目标 dp[{i}][{j}]：新歌 N = dp[{prev}][{jm}] 的 {a} × {x} 个选择 = {newCount}；重播 R = dp[{prev}][{j}] 的 {b} × {y} 个选择 = {replayCount}。合计 {value} 张前缀。",
    "Target dp[{i}][{j}]: new N = {a} from dp[{prev}][{jm}] × {x} choices = {newCount}; replay R = {b} from dp[{prev}][{j}] × {y} choices = {replayCount}. Total: {value} prefixes."
  ],
  "result": [
    "最终歌单数 dp[{goal}][{n}] = {value}（全部歌曲均已出现）。",
    "Final playlist count dp[{goal}][{n}] = {value} (all songs covered)."
  ],
  "notFinal": [
    "还未到最终格；当前格计数不是完整答案。",
    "Not at the final cell yet; the current cell is not the full answer."
  ],
  "s3": [
    "3 · 换一个输入，先预测再揭晓",
    "3 · Transfer: predict before revealing"
  ],
  "p3": [
    "这一步要回答：n=3、goal=4、k=1 时，有多少张完整歌单？这里 dp[i][j] 仍表示长度 i、用了 j 首不同歌曲的合法前缀数；重播前要隔一首。独立思考：dp[3][2]=6（选两首并交替），dp[3][3]=6（三首各一次）。第四首分别能有多少选择？本题不跟随上面的实验控件。",
    "How many full playlists have n=3, goal=4, k=1? Here dp[i][j] still counts legal length-i prefixes using j distinct songs; a repeat needs one intervening play. Use dp[3][2]=6 (choose two songs and alternate) and dp[3][3]=6 (each song once). How many choices extend each class at play four? This question is independent of the experiment controls."
  ],
  "legend": [
    "选择完整歌单数量",
    "Choose the full-playlist count"
  ],
  "opt0": [
    "12 张",
    "12 playlists"
  ],
  "opt1": [
    "24 张",
    "24 playlists"
  ],
  "opt2": [
    "18 张",
    "18 playlists"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "pending": [
    "先选一个数量；答案暂不显示。",
    "Choose a count first; the answer stays hidden."
  ],
  "chosen": [
    "已选择。点击核对后显示解释。",
    "Choice recorded. Check to see the explanation."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "这个数量不符合两类扩展的合计。",
    "That count does not match the two extension classes."
  ],
  "explanation": [
    "答案是 18：新歌贡献 6×(3−3+1)=6，重播贡献 6×(3−1)=12。12 漏掉了此前只用过两首的前缀；24 把刚播放的一首也当作可重播。每个前缀的可选旧歌数都是 j−k，而不是 n 或 1。",
    "The answer is 18: new songs contribute 6×(3−3+1)=6; replays contribute 6×(3−1)=12. The count 12 omits prefixes that had used only two songs. The count 24 also allows the just-played song to repeat. Each source prefix has j−k eligible used songs, rather than n or always one."
  ],
  "s4": [
    "4 · 把同一个计数交给 Python",
    "4 · Turn the count into Python"
  ],
  "p4": [
    "这一步要回答：怎样只保留必要的内存并提交？官方 Python3 接口是 Solution.numMusicPlaylists(n, goal, k)，返回整数；这里 n 为歌曲数，goal 为播放次数，k 为重播间隔。下方是可提交的规范源文件；浏览器只展示它，不运行它。",
    "How can we submit this while keeping only necessary memory? The official Python3 interface is Solution.numMusicPlaylists(n, goal, k), returning an integer: n songs, goal plays, k intervening plays before a replay. Below is the canonical submission source; the browser displays it without executing it."
  ],
  "mapping": [
    "循环 i 固定当前长度，j 固定已用种数。dp 是上一行 i−1，nxt 是本行 i；new 对应 N，replay 对应 R。例如 n=2、k=1、i=3、j=2：new=0×1，replay=2×1，nxt[2]=2。整行算完才 dp=nxt，避免把本行误当成上一行。只算 j≤min(i,n)，因为 i 次不可能用过更多首。",
    "Loop i fixes the current length; j fixes the used-song count. dp is row i−1; nxt is row i. new maps to N and replay maps to R. For n=2, k=1, i=3, j=2: new=0×1, replay=2×1, nxt[2]=2. Assign dp=nxt only after the row is complete, keeping current and previous rows separate. Only j≤min(i,n) is needed: i plays cannot use more than i songs."
  ],
  "cost": [
    "令 n 为歌曲数，goal 为播放次数。提交代码时间 O(goal·n) 次模数算术操作，辅助空间 O(n) 个整数格；模数固定，Python 整数不会溢出。取模保留加法与乘法的余数。教学完整表与深拷贝快照最多 O((goal·n)^2) 个整数格，仅用于小实验，不属于提交内存。",
    "With n songs and goal plays, submission time is O(goal·n) modular arithmetic operations and auxiliary space is O(n) integer cells. The modulus is fixed and Python integers do not overflow. Remainders preserve addition and multiplication. The teaching table and deep snapshots use up to O((goal·n)^2) integer cells for tiny experiments only; they are not submission memory."
  ],
  "boundaries": [
    "边界：goal=n 时每首只能出现一次，答案 n!；k=0 允许相邻重播，但仍需全部覆盖；k=n−1 时前 n 首排好后，每次只剩一首可选，答案仍是 n!；n=1 必有 k=0，任何合法长度答案都是 1。空前缀是内部基例，不是合法输入。",
    "Boundaries: when goal=n, every song appears exactly once, giving n!. With k=0, immediate repeats are allowed, but full coverage is still required. With k=n−1, after ordering the first n songs there is only one choice per play, again giving n!. When n=1, k must be 0 and every legal length has answer 1. The empty prefix is an internal base case, not a legal input."
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
    "已复制完整源文件。",
    "Full source copied."
  ],
  "copyFallback": [
    "自动复制不可用；已选中完整源文件，请按系统复制快捷键。",
    "Automatic copy unavailable. Full source selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the full Python source"
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "rel1": [
    "#629 · 用计数状态汇总排列",
    " #629 · Count permutations by state"
  ],
  "rel2": [
    "#552 · 按有限状态统计合法序列",
    "#552 · Count sequences with finite states"
  ],
  "dpLink": [
    "延伸：用有限状态统计序列（#552）",
    "More: count sequences with finite states (#552)"
  ]
};
