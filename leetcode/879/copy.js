window.LESSON_COPY = {
  "docTitle": [
    "#879 · 盈利计划",
    "#879 · Profitable Schemes"
  ],
  "title": [
    "#879 · 盈利计划",
    "#879 · Profitable Schemes"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "badge": [
    "计数 · 动态规划",
    "Counting · Dynamic programming"
  ],
  "intro": [
    "五位成员，两项行动：要数的是有多少种选择，而不是赚得最多的那一种。",
    "Five members, two crimes: count the possible choices, rather than find the most profitable one."
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
    "课程步骤",
    "Lesson steps"
  ],
  "s0": [
    "01 · 四种选择，两个答案",
    "01 · Four choices, two qualifying schemes"
  ],
  "s1": [
    "02 · 哪些信息可以合并？",
    "02 · What information can we merge?"
  ],
  "s2": [
    "03 · 一项行动，一层计数",
    "03 · One crime, one layer of counts"
  ],
  "s3": [
    "04 · 先预测，再揭晓",
    "04 · Predict before revealing"
  ],
  "s4": [
    "05 · 写成 Python",
    "05 · Implement in Python"
  ],
  "q0": [
    "哪些行动组合既不超员，又能达到利润门槛？",
    "Which combinations stay within capacity and meet the profit threshold?"
  ],
  "statement": [
    "输入 n 位可用成员，及两列对应的数组：group[i] 是第 i 项犯罪所需人数，profit[i] 是其利润。每项最多选一次，成员不能参与两项犯罪。计划就是按下标选出的子集；只要求总人数 ≤ n，总利润 ≥ minProfit。返回计划数除以 1,000,000,007 的余数，不数成员的分配方式。",
    "You have n available members and two matching arrays: group[i] is the member cost of crime i, and profit[i] is its profit. Choose each crime at most once; members cannot work on two crimes. A scheme is a subset of crime indices with total members ≤ n and total profit ≥ minProfit. Return the remainder after dividing its count by 1,000,000,007, without counting assignments of members."
  ],
  "constraints": [
    "官方范围：1 ≤ n ≤ 100；0 ≤ minProfit ≤ 100；1–100 项犯罪；每项需 1–100 人，利润 0–100。两个数组等长。",
    "Official bounds: 1 ≤ n ≤ 100; 0 ≤ minProfit ≤ 100; 1–100 crimes; each requires 1–100 members and earns 0–100. The arrays have equal length."
  ],
  "hand": [
    "手算官方例 1：n=5，minProfit=3。行动 0 需 2 人、赚 2；行动 1 需 2 人、赚 3。下表列出全部四个子集。即使两项数据相同，下标不同的选择仍然是不同计划。",
    "Work official example 1 by hand: n=5, minProfit=3. Crime 0 needs 2 members and earns 2; crime 1 needs 2 and earns 3. The table lists all four subsets. Even if two crimes have equal data, choices with different indices are distinct schemes."
  ],
  "subset": [
    "所选下标",
    "Chosen indices"
  ],
  "people": [
    "总人数",
    "Total members"
  ],
  "profit": [
    "总利润",
    "Total profit"
  ],
  "qualify": [
    "达标？",
    "Qualifies?"
  ],
  "yes": [
    "是",
    "Yes"
  ],
  "no": [
    "否：利润不足",
    "No: profit too low"
  ],
  "handEnd": [
    "所以答案是 2：{1} 和 {0,1}。不必恰好用完 5 人，也不必恰好赚 3。",
    "The answer is 2: {1} and {0,1}. You need neither exactly 5 members nor exactly 3 profit."
  ],
  "q1": [
    "不逐一列出所有子集，还需要记住什么才能处理下一项？",
    "What must we retain to process the next crime without listing every subset?"
  ],
  "baseline": [
    "这里用 P 表示利润门槛 minProfit。基线是每项都分成“不选 / 选”两支，最后检查人数与利润。下列递归函数每次处理一个下标 i；两次调用分别传入不选和选后的总量。int 将条件的真 / 假转换成 1 / 0，分别表示一个达标 / 不达标叶子；两个分支的计数相加。",
    "Here P is the profit threshold minProfit. The baseline branches into skip/take for each crime and checks totals at the end. In the recursion below, i is the next crime index. The two calls pass the totals after skipping or taking it. int converts a true/false condition to 1/0, counting a qualifying/nonqualifying leaf; add the two branch counts."
  ],
  "baselineCost": [
    "m 是犯罪数量。完整二叉选择树有 2^m 个叶子，总时间 O(2^m)，调用栈 O(m)。m=100 时约有 1.27×10^30 个叶子，无法逐一枚举。",
    "Let m be the number of crimes. The full binary choice tree has 2^m leaves, taking O(2^m) time and O(m) call-stack space. At m=100 it has about 1.27×10^30 leaves, far too many to enumerate."
  ],
  "merge": [
    "先保留准确人数：同样赚 3，已用 2 人与 4 人的剩余容量不同。再看利润：门槛 P=minProfit=3 时，赚 3 与赚 5 都已达标；以后加上非负利润，两者都会继续达标。因此只存封顶利润 p=min(P,实际利润)。p=P 表示“至少 P”，不是“恰好 P”。",
    "Keep exact members used: two schemes earning 3 but using 2 versus 4 members have different remaining capacities. For profit, let P=minProfit=3. Earning 3 or 5 already meets the threshold; adding nonnegative profit keeps both qualified. Store capped profit p=min(P, actual profit). The bucket p=P means “at least P”, rather than “exactly P”."
  ],
  "wrong": [
    "错误捷径：只存“最大利润”会丢掉方案数。例如 n=2、P=1，两项均需 1 人、赚 1；最大利润为 2，但达标计划有 {0}、{1}、{0,1} 共 3 个。合并状态时必须把计数相加，不能只保留一个计划。",
    "Tempting mistake: storing only maximum profit loses the number of schemes. With n=2, P=1 and two crimes each costing 1 and earning 1, maximum profit is 2, but {0}, {1}, {0,1} give 3 qualifying schemes. Merge states by adding counts, rather than keeping one representative scheme."
  ],
  "q2": [
    "加入一项新犯罪后，哪些计数保留，哪些计数相加？",
    "After adding one crime, which counts stay and which counts are added?"
  ],
  "derive": [
    "前缀指前 k 项犯罪。这里 P=minProfit，u 是准确已用人数，p 是封顶利润 min(P,实际利润)。动态规划表 dp[u][p] 存满足这两个条件的子集数量。先不选任何项：空子集只贡献 dp[0][0]=1，其他格全为 0。",
    "A prefix means the first k crimes. Here P=minProfit, u is exact members used, and p is profit capped at P. A dynamic programming table dp[u][p] stores the number of subsets with those two values. Before any crime, the empty subset contributes dp[0][0]=1; every other cell is 0."
  ],
  "numeric": [
    "仍看 n=5、P=3：处理行动 0 (人数 2、利润 2) 后，(0,0)=1、(2,2)=1。处理行动 1 (2,3) 时，从 (0,0) 的 1 个子集保留空集，并给 (2,3) 加 1；从 (2,2) 的 1 个子集保留 {0}，并给 (4,min(3,2+3))=(4,3) 加 1。因此达标列 p=3 的计数是 1+1=2。",
    "For n=5, P=3, after crime 0 (2 members, 2 profit), (0,0)=1 and (2,2)=1. For crime 1 (2,3), the one subset at (0,0) stays when skipped and adds 1 to (2,3) when taken. The one subset at (2,2) stays as {0} and adds 1 to (4,min(3,2+3))=(4,3). The qualifying p=3 column therefore sums to 1+1=2."
  ],
  "formula": [
    "不选：nxt[u][p] += dp[u][p]；选（若 u+g ≤ n）：nxt[u+g][min(P,p+h)] += dp[u][p]。其中 g、h 是当前犯罪的人数和利润。",
    "Skip: nxt[u][p] += dp[u][p]. Take (if u+g ≤ n): nxt[u+g][min(P,p+h)] += dp[u][p]. Here g and h are the current crime’s member cost and profit."
  ],
  "invariant": [
    "不变式：处理前 k 项后，dp[u][p] 恰好统计这些项的子集，其准确人数为 u，封顶利润为 p。每个新子集唯一地分为“不含当前项”或“含当前项”；后者移除当前项就对应旧表中的唯一子集。因此两支不重不漏。因为利润非负，min(P,min(P,x)+h)=min(P,x+h)，封顶不会改变未来可行性。",
    "Invariant: after the first k crimes, dp[u][p] counts exactly their subsets with exact member total u and capped profit p. Every new subset either excludes or includes the current crime. Removing it from an including subset yields a unique old subset, so the two branches are disjoint and complete. Since profits are nonnegative, min(P,min(P,x)+h)=min(P,x+h); capping preserves future feasibility."
  ],
  "reuse": [
    "为什么读旧表、写新表？若 n=2、P=3，只有一项 (1人,2利润)，就地从小人数往大人数更新会先写 (1,2)，再误读它写出 (2,3)，相当于选同一项两次。真实答案是 0。新表保证整轮只从尚未选择当前项的旧子集出发。",
    "Why read an old table and write a new one? With n=2, P=3 and a single crime (1 member, 2 profit), an ascending in-place update first writes (1,2), then reads it to write (2,3), taking the same crime twice. The real answer is 0. A separate new table reads only subsets formed before this crime."
  ],
  "task": [
    "操作任务：先逐项加入默认例，比较旧表和新表，再回退。切到“容量收紧”，保持犯罪与门槛不变，观察 {0,1} 为什么被拒绝。切换预设会从头开始；独立预测题不受影响。",
    "Try adding the default crimes one at a time, compare the old and new tables, then rewind. Switch to “Tighter capacity”, keeping crimes and threshold fixed, and see why {0,1} is rejected. Changing presets restarts this trace; the independent prediction is preserved."
  ],
  "simulation": [
    "教学模拟，不运行下方 Python。每帧是处理完整一项犯罪之后；无省略转移。表仅列旧表或新表中非零的 (u,p)，未列格均为 0。青色加粗表示计数改变，数值才是数据。",
    "Teaching simulation, separate from executing the Python below. Each frame follows one complete crime; no transitions are omitted. Tables list (u,p) cells nonzero in either old or new state; all unlisted cells are 0. Cyan bold marks a changed count; the numbers are the data."
  ],
  "preset": [
    "预设（更换会重置此模拟）",
    "Preset (changing restarts this simulation)"
  ],
  "p0": [
    "官方例 1",
    "Official example 1"
  ],
  "p1": [
    "官方例 2",
    "Official example 2"
  ],
  "p2": [
    "容量收紧",
    "Tighter capacity"
  ],
  "p3": [
    "零门槛与零利润",
    "Zero threshold / profit"
  ],
  "p4": [
    "单项超员",
    "One oversized crime"
  ],
  "p5": [
    "重复使用陷阱",
    "Reuse trap"
  ],
  "stats": [
    "n={n}；P={P}；group={group}；profit={profit}",
    "n={n}; P={P}; group={group}; profit={profit}"
  ],
  "prev": [
    "← 撤回一项",
    "← Undo one crime"
  ],
  "next": [
    "加入下一项 →",
    "Add next crime →"
  ],
  "reset": [
    "回到空子集",
    "Reset to empty subset"
  ],
  "end": [
    "处理全部项",
    "Process all crimes"
  ],
  "position": [
    "已处理犯罪数量",
    "Number of crimes processed"
  ],
  "progress": [
    "已处理 {k}/{m} 项；当前前缀达标子集数 = {answer}（仅最后一帧是全题答案）。",
    "Processed {k}/{m} crimes; qualifying subsets of this prefix = {answer} (only the final frame is the full answer)."
  ],
  "old": [
    "处理本项之前",
    "Before this crime"
  ],
  "new": [
    "处理本项之后",
    "After this crime"
  ],
  "initialTable": [
    "初始计数表",
    "Initial count table"
  ],
  "cell": [
    "(人数 u, 封顶利润 p)",
    "(Members u, capped profit p)"
  ],
  "count": [
    "子集数",
    "Subset count"
  ],
  "start": [
    "尚未处理犯罪：只存在空子集 (0,0)，计数 1。",
    "No crimes processed: only the empty subset at (0,0), count 1."
  ],
  "operation": [
    "刚处理下标 {i}：人数 g={g}，利润 h={h}。下列每行从旧表读取；“不选”均保留原位置，计数都写入新表。",
    "Just processed index {i}: members g={g}, profit h={h}. Each line below reads the old table; skipping keeps its original cell, and all contributions write to the new table."
  ],
  "move": [
    "旧 ({u},{p}) 有 {count} 个：不选保留；选则给 ({v},{q}) 加 {count}。",
    "Old ({u},{p}) has {count}: skip keeps it; take adds {count} to ({v},{q})."
  ],
  "reject": [
    "旧 ({u},{p}) 有 {count} 个：不选保留；选需 {v} 人 > n，拒绝。",
    "Old ({u},{p}) has {count}: skip keeps it; take needs {v} members > n, rejected."
  ],
  "history": [
    "保留的前缀计数记录",
    "Retained prefix count history"
  ],
  "historyRow": [
    "处理 {k} 项 → 达标子集 {answer} 个",
    "After {k} crimes → {answer} qualifying subsets"
  ],
  "snapshotCost": [
    "模拟保留全部快照便于回退；其内存 O(m·n·(P+1))。Python 只保留相邻两层。界面仅提供最多 3 项、n≤10、P≤5 的小例子，不是最大输入的性能演示。",
    "The simulation retains all snapshots for rewind, using O(m·n·(P+1)) storage. Python keeps only two adjacent layers. UI presets have at most 3 crimes, n≤10 and P≤5; this is not a maximum-input performance demonstration."
  ],
  "q3": [
    "不同计划合并到同一格后，容量限制如何影响总数？",
    "After different schemes merge into one cell, how does capacity affect the count?"
  ],
  "quizState": [
    "本题中 dp[u][p] 仍统计准确用了 u 人、封顶利润 p=min(minProfit,实际利润) 的子集数；同一格可包含多个不同子集。",
    "Here dp[u][p] still counts subsets using exactly u members, with profit bucket p=min(minProfit, actual profit); a cell may count several distinct subsets."
  ],
  "quiz": [
    "新例：n=3，minProfit=2，group=[1,1,2]，profit=[2,2,0]。最终达标计划有几个？先选，再揭晓。",
    "Fresh case: n=3, minProfit=2, group=[1,1,2], profit=[2,2,0]. How many qualifying schemes are there? Choose before revealing."
  ],
  "option0": [
    "1：所有利润都在同一格",
    "1: all profits share one bucket"
  ],
  "option1": [
    "5：合并计数，拒绝超员",
    "5: add merged counts, reject excess members"
  ],
  "option2": [
    "6：所有含 0 或 1 的子集",
    "6: all subsets containing 0 or 1"
  ],
  "reveal": [
    "核对推理",
    "Check reasoning"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再对照子集与计数。",
    "Compare the subsets with the counts."
  ],
  "answer": [
    "答案 5：{0}、{1}、{0,1}、{0,2}、{1,2}。最终达标列 dp[1][2]=2，dp[2][2]=1，dp[3][2]=2，总计 5。合并格仍须累加不同子集；{0,1,2} 需 4 人，超过 n=3，必须排除。空集与 {2} 的利润为 0，不达标。",
    "Answer: 5 — {0}, {1}, {0,1}, {0,2}, {1,2}. The qualifying column is dp[1][2]=2, dp[2][2]=1, dp[3][2]=2, totaling 5. Merged cells must add distinct subsets; {0,1,2} requires 4 members, exceeding n=3, so exclude it. The empty subset and {2} earn 0 and do not qualify."
  ],
  "q4": [
    "怎样把“不选 / 选”的证明逐行写进官方接口？",
    "How does the skip/take proof map into the official interface?"
  ],
  "mapping": [
    "这里 n 是人数上限，minProfit 是利润门槛。Python3 官方接口是 Solution.profitableSchemes(n, minProfit, group, profit) → int；self 是实例参数。zip(group, profit) 将同一下标的人数与利润配成一对。row[:] 复制一行；对每行复制才能让新旧表不共享可变行。",
    "Here n is member capacity and minProfit is the profit threshold. The official Python3 method is Solution.profitableSchemes(n, minProfit, group, profit) → int; self is the instance parameter. zip(group, profit) pairs member cost and profit at each index. row[:] copies a row; copying every row prevents old and new tables from sharing mutable rows."
  ],
  "map0": [
    "dp[0][0]=1：只用空子集初始化。nxt 复制旧表：一次性写入所有“不选”贡献。",
    "dp[0][0]=1 initializes just the empty subset. Copying dp into nxt writes every skip contribution once."
  ],
  "map1": [
    "used + people > n：容量不够就跳过“选”；否则 capped=min(minProfit,earned+gain) 是封顶后的新利润，把旧格计数加到新格并取余。加法取余保留最终答案的余数。",
    "used + people > n excludes infeasible takes. Otherwise capped=min(minProfit,earned+gain) is the capped new profit; add the old count to the new cell modulo mod. Reducing each sum preserves the final remainder."
  ],
  "map2": [
    "dp = nxt 完成本轮后，才让下一项读取新表。最后遍历所有人数行，累加 row[minProfit]；人数限制是“至多”，不能只返回 dp[n][minProfit]。",
    "dp = nxt exposes the new table to the next crime only after the round finishes. Finally sum row[minProfit] across every member total: the limit is “at most”, so dp[n][minProfit] alone is insufficient."
  ],
  "cost": [
    "令 m=len(group)，P=minProfit，n 为人数上限。每项复制并扫描 (n+1)(P+1) 格：时间 O(m·n·(P+1))，辅助空间 O(n·(P+1)) 个整数格（两层），不修改输入。不写 O(mnP)，因为 P=0 时仍需处理每项和人数行。",
    "Let m=len(group), P=minProfit and n be member capacity. Each crime copies and scans (n+1)(P+1) cells: O(m·n·(P+1)) time and O(n·(P+1)) auxiliary integer cells for two layers. Inputs are not mutated. Writing O(mnP) would lose the work that still occurs when P=0."
  ],
  "boundaries": [
    "边界：P=0 时空集要计入；利润为 0 的项仍可形成不同子集；某项人数超限则只能不选；相同数据的项仍按下标区分；达不到门槛就返回 0。官方例 2 的三项总人数为 10，每个非空子集都达标，答案 7。",
    "Boundaries: P=0 includes the empty subset; zero-profit crimes still form distinct subsets; an oversized crime can only be skipped; equal data at different indices remain distinct; an unreachable threshold returns 0. In official example 2 the three member costs sum to 10 and every nonempty subset qualifies, giving 7."
  ],
  "source": [
    "展开官方接口的 Python 实现",
    "Show Python implementation for the official interface"
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
  "fallback": [
    "自动复制不可用。源码已全选，请按系统复制快捷键。",
    "Automatic copy is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "verify": [
    "可复现检查使用独立的子集枚举，核对每个前缀、每个人数和封顶利润格，再单独执行 Python。浏览器模拟与正式提交代码是两个实现；通过本地检查不代表 LeetCode 提交通过。",
    "Reproducible checks use independent subset enumeration for every prefix, member total and capped-profit cell, and separately execute Python. The browser simulation and submission code are two implementations; local checks do not establish LeetCode acceptance."
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "related0": [
    "正则匹配：看前缀状态如何定义 →",
    "Regex matching: defining prefix states →"
  ],
  "related1": [
    "通配符：比较另一种二维状态转移 →",
    "Wildcard matching: another two-dimensional transition →"
  ],
  "foot": [
    "以官方题目为准；本页为教学解释，所有交互均在本地运行。",
    "The official statement is authoritative. This teaching lesson runs all interaction locally."
  ]
};
