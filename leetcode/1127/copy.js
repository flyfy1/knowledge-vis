'use strict';
window.LESSON_COPY = {
  "docTitle": ["#1127 · 用户购买平台", "#1127 · User Purchase Platform"],
  "title": ["#1127 · 用户购买平台", "#1127 · User Purchase Platform"],
  "back": ["← LeetCode 专区", "← LeetCode collection"],
  "badge": ["困难 · 数据库 · MySQL", "Hard · Database · MySQL"],
  "official": ["官方题目 ↗", "Official problem ↗"],
  "intro": [
    "一张消费表记下了：谁、哪一天、用手机还是电脑、花了多少钱。要按天回答三个问题：这一天只用手机的有几人、花了多少？只用电脑的呢？两样都用的呢？",
    "A spending log records who spent how much, on which day, on mobile or on desktop. For each day, answer three questions: how many people used only mobile, and how much did they spend? Only desktop? Both?"
  ],
  "contract": [
    "输入表 Spending(user_id, spend_date, platform, amount)：platform 只取 desktop 或 mobile；同一用户同一天同一平台最多一行（主键）。输出：表中出现过的每个日期都要有 desktop、mobile、both 三行，列为 spend_date, platform, total_amount, total_users；没人落入的组也要输出，金额和人数都写 0。行的顺序不限。",
    "Input table Spending(user_id, spend_date, platform, amount): platform is desktop or mobile, and a user has at most one row per day and platform (primary key). Output: every date that appears in the table gets three rows — desktop, mobile, both — with columns spend_date, platform, total_amount, total_users. A group nobody fell into is still printed, with 0 and 0. Any row order is accepted."
  ],
  "premium": [
    "这是会员题，官方完整题面需要订阅才能查看。上面的复述依据公开的表结构和示例输入整理；输出列名、每个日期必须有三行（含 0 行）和“顺序不限”与公开题解网站转述的一致。措辞以官方页面为准。",
    "This is a subscriber-only problem; the full official statement needs a subscription. The restatement above was reconstructed from the public table schema and sample input; the output column names, the three rows per date (zero rows included) and “any order” agree with what public solution sites quote. The official page has the authoritative wording."
  ],
  "nav1": ["1 · 手算一天", "1 · Work a day by hand"],
  "nav2": ["2 · 直觉写法错在哪", "2 · The obvious query"],
  "nav3": ["3 · 先给人分组", "3 · Label each person-day"],
  "nav4": ["4 · 补出零行", "4 · Keep the empty rows"],
  "nav5": ["5 · 逐行走一遍", "5 · Walk the rows"],
  "nav6": ["6 · 先预测", "6 · Predict"],
  "nav7": ["7 · SQL 与成本", "7 · SQL & cost"],

  "s1t": ["一行输出到底在数什么？", "What does one output row count?"],
  "s1e": [
    "这一步要回答：输出里的“mobile”“desktop”“both”分别装的是谁？下面是一个小例子（6 行消费）。3 月 1 日，用户 1 用手机花了 40、用电脑花了 25。他是一个人、一天、两样都用——所以他属于 both 组，带着 40+25=65 进去；他既不算进 mobile，也不算进 desktop。用户 2 当天只用手机，进 mobile；用户 3 只用电脑，进 desktop。",
    "The question for this step: who goes into “mobile”, “desktop” and “both”? Below is a small example with 6 spending rows. On March 1, user 1 spent 40 on mobile and 25 on desktop. That is one person on one day using both — so user 1 belongs to the both group and brings 40+25=65 with him; he is counted in neither mobile nor desktop. User 2 used only mobile that day, so goes to mobile; user 3 used only desktop."
  ],
  "handTask": [
    "点「给下一个人归组」，一次处理一个“人-天”（同一用户在同一天的所有消费）。看右边答案表怎样被填上；问号表示还没有任何人进入这一格。最后一步之后，3 月 2 日的 both 仍然没人——它要写成 0 和 0，而不是消失。",
    "Click “Label the next person-day” to handle one person-day at a time (all of one user's purchases on one day). Watch the answer table fill in; a question mark means nobody has entered that cell yet. After the last step, March 2's both cell is still empty — it must be printed as 0 and 0, not dropped."
  ],
  "handPrev": ["← 退回一步", "← Step back"],
  "handNext": ["给下一个人归组 →", "Label the next person-day →"],
  "handReset": ["重来", "Start over"],
  "spendingCaption": ["Spending（输入：每行是一笔消费）", "Spending (input: one purchase per row)"],
  "answerCaption": ["要求的输出（逐步填上）", "Required output (filled step by step)"],
  "hand0": ["还没有处理任何人。答案表的每一格都是 ?。", "No person-day handled yet. Every answer cell is ?."],
  "handStep": [
    "第 {k}/{n} 个人-天：用户 {user} 在 {date} 用了 {platforms}，共 {amount} → 进入 {label} 组。",
    "Person-day {k} of {n}: user {user} on {date} used {platforms}, total {amount} → goes to {label}."
  ],
  "handDone": [
    "5 个人-天都归好了。仍是 ? 的格子没有任何人：写成金额 0、人数 0。3 月 2 日的 both 就是这样一行。",
    "All 5 person-days are labelled. A cell still at ? received nobody: print amount 0, users 0. March 2's both row is exactly such a row."
  ],
  "handLedgerTitle": ["已归组的人-天", "Person-days labelled so far"],

  "s2t": ["最直接的写法：按日期和平台分组。哪里错了？", "The obvious query groups by date and platform. What goes wrong?"],
  "s2e": [
    "这一步要回答：为什么不能直接 GROUP BY spend_date, platform？这条查询把每一行消费按它自己的 platform 列分组。对同一个例子，它的结果和正确答案并排如下。",
    "The question for this step: why not simply GROUP BY spend_date, platform? That query sorts every purchase row by its own platform column. For the same example, its result sits next to the required answer below."
  ],
  "naiveCaption": ["直觉查询的结果", "Result of the obvious query"],
  "rightCaption": ["要求的输出", "Required output"],
  "missingRow": ["（缺这一行）", "(row missing)"],
  "naiveCount": [
    "数一数错误：3 月 1 日 mobile 得到 70 元、2 人（应为 30、1 人），desktop 得到 75 元、2 人（应为 50、1 人）；那天只有 3 个人，却被数了 4 人次——用户 1 被数了两次。两个 both 行根本没有出现：表里没有任何一行的 platform 是 both。",
    "Count the damage: on March 1, mobile shows 70 and 2 users (should be 30 and 1), desktop shows 75 and 2 users (should be 50 and 1). Only 3 people shopped that day, yet 4 user-counts appear — user 1 is counted twice. Both both rows are absent: no row in the table has platform = both."
  ],
  "askLabel": [
    "停下来想一想：用户 1 在 3 月 1 日有两行消费。只看其中任何一行，你能判断他是“两样都用”的人吗？",
    "Pause on this: user 1 has two purchase rows on March 1. Looking at either row alone, can you tell that he is a “both” person?"
  ],
  "answerLabel": [
    "不能。mobile 那一行只说“这笔是手机”，desktop 那一行只说“这笔是电脑”。“both”不是某一行的属性，而是同一个人同一天所有行合起来的属性。所以必须先把一个人的一天收拢成一行、贴上唯一的标签，然后才能按天和标签求和。这就是本题的关键一步：先按 (spend_date, user_id) 分组，再按 (spend_date, 标签) 分组——两次分组，而不是一次。",
    "No. The mobile row only says “this purchase was on mobile”; the desktop row only says “this one was on desktop”. “Both” is not a property of any single row; it is a property of all of one person's rows on one day taken together. So we must first collapse a person's day into one row with a single label, and only then total by day and label. That is the key move: group by (spend_date, user_id) first, then by (spend_date, label) — two groupings, not one."
  ],
  "slowBaseline": [
    "还有一种“正确但笨”的做法：对每个日期、每个标签，把整张表从头扫一遍，挑出这一天的人，逐个判断他用了哪些平台。设表有 n 行、D 个不同日期，它要读 3·D·n 行。这个例子是 3×2×6=36 次读取，而数据本身只有 6 行；一年 365 天、一百万行时约 11 亿次。我们要的查询应当让每一行只被处理常数次。",
    "There is also a “correct but clumsy” approach: for every date and every label, rescan the whole table, pick that day's people and check which platforms each used. With n rows and D distinct dates it reads 3·D·n rows. Here that is 3×2×6 = 36 reads for only 6 rows of data; for 365 days and a million rows, about 1.1 billion. The query we want touches each row only a constant number of times."
  ],

  "s3t": ["第一次分组：把一个人的一天压成一行", "First grouping: collapse one person's day into one row"],
  "s3e": [
    "这一步要回答：怎样在 SQL 里得到每个人-天的唯一标签？按 (spend_date, user_id) 分组后，每组就是一个人的一天。组里有几种不同的 platform？COUNT(DISTINCT platform)=2 说明两样都用，标签为 both；否则只有一种平台，MAX(platform) 恰好取出它（一组里只有一个值时，最大值就是它本身）。金额用 SUM(amount) 把这个人当天的钱合起来。",
    "The question for this step: how do we give every person-day exactly one label in SQL? After GROUP BY (spend_date, user_id), each group is one person's day. How many different platforms does the group hold? COUNT(DISTINCT platform) = 2 means both were used, so the label is both; otherwise there is only one platform and MAX(platform) returns it (the maximum of a single value is that value). SUM(amount) adds up that person's money for the day."
  ],
  "userDayCaption": ["user_day（中间表：每个人-天一行）", "user_day (intermediate: one row per person-day)"],
  "invariant3": [
    "为什么这样一定对？不变量：每个 (日期, 用户) 恰好得到一行、恰好一个标签，而且这一天的钱一分不多一分不少地搬了过来。例子里 3 月 1 日：Spending 合计 40+25+30+50=145；user_day 合计 65+30+50=145。人数也守恒：3 月 1 日有 3 个不同用户，user_day 就有 3 行。于是第二次分组时，每个人只可能被数进一个组。",
    "Why must this be right? Invariant: every (date, user) gets exactly one row with exactly one label, and that day's money moves over without gain or loss. In the example, March 1: Spending totals 40+25+30+50 = 145; user_day totals 65+30+50 = 145. Head-count is conserved too: 3 distinct users on March 1, so 3 user_day rows. Hence in the second grouping each person can land in only one group."
  ],
  "boundary3": [
    "边界：主键保证一个人一天在同一平台最多一行，所以“两行”就等于“两种平台”；但用 COUNT(DISTINCT) 判断，即使同平台出现两行也不会误判成 both。金额为 0 的消费照样让这个人出现在那一天。",
    "Boundary: the primary key guarantees at most one row per person, day and platform, so “two rows” equals “two platforms”; but testing COUNT(DISTINCT) would not mistake two same-platform rows for both anyway. A purchase of amount 0 still makes the person present on that day."
  ],

  "s4t": ["第二次分组之前：没人的组从哪里来？", "Before the second grouping: where does an empty group come from?"],
  "s4e": [
    "这一步要回答：直接对 user_day 按 (spend_date, 标签) 分组，为什么还差一行？GROUP BY 只能为“至少有一行”的组产生输出。3 月 2 日没有任何人-天的标签是 both，所以这一组不会凭空出现——结果只有 5 行，缺的正是 (3 月 2 日, both, 0, 0)。",
    "The question for this step: grouping user_day by (spend_date, label) is still one row short — why? GROUP BY can only output a group that has at least one row. On March 2 no person-day is labelled both, so that group never appears — the result has 5 rows, and the missing one is exactly (March 2, both, 0, 0)."
  ],
  "ask4": [
    "想一想：数据里没有任何一行能“产生”这个零行。那它只能来自哪里？",
    "Think: no row of the data can “produce” this zero row. So where can it come from?"
  ],
  "answer4": [
    "来自输出的形状本身。输出的形状是事先固定的：表里出现的每个日期 × {desktop, mobile, both}。所以先单独造出这张“格子表” grid（日期去重后与三个标签做 CROSS JOIN，即两两配对），再把 user_day 用 LEFT JOIN 挂上去。LEFT JOIN 保留左表 grid 的每一行；找不到匹配的人时，右边的列填 NULL（空值）。",
    "From the shape of the output itself. That shape is fixed in advance: every date in the table × {desktop, mobile, both}. So first build this grid on its own (distinct dates CROSS JOIN the three labels, i.e. every pairing), then hang user_day onto it with a LEFT JOIN. A LEFT JOIN keeps every row of the left table, grid; where no person matches, the right-hand columns are filled with NULL (no value)."
  ],
  "joinCaption": ["grid LEFT JOIN user_day，再按格子分组", "grid LEFT JOIN user_day, then group by cell"],
  "trap4": [
    "第二个陷阱在计数上。空格子在 LEFT JOIN 之后仍然是一行（右边全是 NULL）。COUNT(*) 数的是行，所以会把它数成 1 人；COUNT(u.user_id) 只数非 NULL 的值，得到正确的 0。同理，对一组 NULL 求 SUM 得到 NULL 而不是 0，所以要用 COALESCE(…, 0) 把 NULL 换成 0。上表最后一行正是这个情况。",
    "The second trap is in the counting. After the LEFT JOIN an empty cell is still one row (with NULLs on the right). COUNT(*) counts rows, so it would report 1 user; COUNT(u.user_id) counts only non-NULL values and gives the correct 0. Likewise SUM over NULLs is NULL, not 0, so COALESCE(…, 0) replaces NULL by 0. The last row of the table above shows exactly this case."
  ],
  "dates4": [
    "哪些日期？只有在 Spending 里出现过的日期。完全没人消费的日子不在表里，查询无从知道它存在，所以不输出（下面实验里把某一天的消费全关掉就能看到）。",
    "Which dates? Only dates that appear in Spending. A day with no purchases at all is not in the table, so the query cannot know it exists and prints nothing for it (switch off every purchase of one day in the experiment below to see this)."
  ],
  "colCell": ["格子", "cell"],
  "colMatched": ["挂上的人-天", "matched person-days"],
  "colCountStar": ["COUNT(*)", "COUNT(*)"],
  "colCountUser": ["COUNT(u.user_id)", "COUNT(u.user_id)"],
  "colSum": ["COALESCE(SUM, 0)", "COALESCE(SUM, 0)"],
  "noneMatched": ["无 → 一行 NULL", "none → one NULL row"],
  "wrongMark": ["✗ 错", "✗ wrong"],

  "s5t": ["自己改数据，逐行看两次分组", "Change the data and walk both groupings row by row"],
  "s5e": [
    "这一步要回答：不变量在任何输入上都成立吗？下面每个按钮代表一笔可能的消费（金额固定）；按下表示这笔消费在表里。改动任何按钮或换预设，都会从第 0 帧重新开始。第一阶段每帧读一行 Spending，把它放进 user_day；第二阶段每帧填一个输出格子。",
    "The question for this step: does the invariant hold on any input? Each button below is one possible purchase with a fixed amount; pressed means that purchase is in the table. Changing any button or preset restarts the walk from frame 0. In the first stage each frame reads one Spending row into user_day; in the second stage each frame fills one output cell."
  ],
  "labTask": [
    "观察任务：选「讲解例子」，关掉再打开“3 月 1 日 · 用户 1 · desktop 25”。看 user_day 里用户 1 的标签在 mobile 和 both 之间切换，钱在 mobile 行和 both 行之间搬动，而“当天合计”始终不变。再关掉 3 月 2 日的全部消费，看那一天的三行一起消失。",
    "Observation task: choose “Worked example”, then switch “Mar 1 · user 1 · desktop 25” off and on. Watch user 1's label in user_day flip between mobile and both and the money move between the mobile and both rows, while “day total” never changes. Then switch off every March 2 purchase and watch that day's three rows disappear together."
  ],
  "presetLabel": ["预设（会重新开始）", "Preset (restarts the walk)"],
  "preset0": ["讲解例子", "Worked example"],
  "preset1": ["没人两样都用", "Nobody uses both"],
  "preset2": ["只有一天，人人两样都用", "One day, everyone uses both"],
  "preset3": ["混合的两天", "Two mixed days"],
  "preset4": ["空表", "Empty table"],
  "custom": ["（已手动修改）", "(edited by hand)"],
  "togglesCaption": ["哪些消费在表里？按下 = 在", "Which purchases are in the table? Pressed = present"],
  "toggleLabel": ["{platform} {amount}", "{platform} {amount}"],
  "toggleAria": ["{date} 用户 {user} {platform} 金额 {amount}", "{date} user {user} {platform} amount {amount}"],
  "restartNote": ["输入已改变：从第 0 帧重新开始。", "Input changed: restarted at frame 0."],
  "prev": ["← 上一帧", "← Previous frame"],
  "next": ["下一帧 →", "Next frame →"],
  "traceReset": ["回到第 0 帧", "Back to frame 0"],
  "end": ["跳到最后", "Jump to end"],
  "frame": ["第 {i}/{n} 帧 · {phase}", "Frame {i} of {n} · {phase}"],
  "phaseStart": ["开始前", "before start"],
  "phaseA": ["阶段一：给人-天贴标签", "stage 1: label person-days"],
  "phaseB": ["阶段二：填输出格子", "stage 2: fill output cells"],
  "phaseDone": ["完成", "finished"],
  "evStart": ["Spending 有 {n} 行、{dates} 个日期。user_day 和输出都还是空的。", "Spending has {n} rows over {dates} dates. user_day and the output are still empty."],
  "evStartEmpty": ["Spending 是空表：没有日期，所以输出也是空的（0 行）。", "Spending is empty: no dates, so the output is empty too (0 rows)."],
  "evNew": ["读第 {row} 行：用户 {user} 在 {date} 用 {platform} 花 {amount}。这是他这天的第一行 → 新建人-天，标签暂为 {label}，金额 {total}。", "Read row {row}: user {user} spent {amount} on {platform} on {date}. His first row that day → new person-day, label {label} for now, amount {total}."],
  "evUpgrade": ["读第 {row} 行：用户 {user} 在 {date} 又用 {platform} 花 {amount}。他这天已有一行 {before} → 标签升级为 {label}，金额 {total}。人数不变，只是换了组。", "Read row {row}: user {user} also spent {amount} on {platform} on {date}. He already has a {before} row that day → label upgraded to {label}, amount {total}. Same person, new group."],
  "evCell": ["填格子 ({date}, {platform})：标签为 {platform} 的人-天是用户 {users} → 金额 {amount}，人数 {count}。", "Fill cell ({date}, {platform}): person-days labelled {platform} are user {users} → amount {amount}, users {count}."],
  "evZero": ["填格子 ({date}, {platform})：没有人-天带这个标签。LEFT JOIN 仍保留这一行 → 金额 0，人数 0。", "Fill cell ({date}, {platform}): no person-day has this label. The LEFT JOIN still keeps the row → amount 0, users 0."],
  "conservation": ["当天合计（Spending 已读 → user_day）：{items}", "Day total (Spending read so far → user_day): {items}"],
  "conservationItem": ["{date}：{spent} → {kept}", "{date}: {spent} → {kept}"],
  "conservationNone": ["还没读到任何行", "no rows read yet"],
  "rowsCaption": ["Spending 行（▶ 当前行，✓ 已读）", "Spending rows (▶ current, ✓ read)"],
  "dayCaption": ["user_day（★ 本帧改动）", "user_day (★ changed this frame)"],
  "outCaption": ["输出（★ 本帧填入；— 未填）", "Output (★ filled this frame; — not yet)"],
  "colDate": ["日期", "date"],
  "colUser": ["用户", "user"],
  "colPlatform": ["平台", "platform"],
  "colAmount": ["金额", "amount"],
  "colPlatforms": ["当天的平台", "platforms that day"],
  "colLabel": ["标签", "label"],
  "colTotalAmount": ["total_amount", "total_amount"],
  "colTotalUsers": ["total_users", "total_users"],
  "emptyTable": ["（空）", "(empty)"],
  "pending": ["—", "—"],
  "markCurrent": ["▶", "▶"],
  "markDone": ["✓", "✓"],
  "markChanged": ["★", "★"],
  "and": ["、", ", "],
  "sep": ["；", "; "],
  "colMark": ["标记", "mark"],
  "showAnswer": ["想好了，看答案", "Show the answer"],
  "sim": ["这是 JavaScript 写的教学模拟，按 solution.sql 的两个阶段重演；浏览器并不执行 SQL。SQL 本身在测试里用 SQLite 执行核对（不是 MySQL，见第 7 步的方言说明）。", "This is a JavaScript teaching simulation replaying the two stages of solution.sql; the browser does not run SQL. The SQL itself is executed in SQLite in the tests (not MySQL; see the dialect note in step 7)."],

  "s6t": ["轮到你：先预测再揭晓", "Your turn: predict, then reveal"],
  "s6e": [
    "这一步要回答：你能不借助动画算出一个新日子吗？2024 年 4 月 7 日的消费如下（这不是上面的预设）。先选答案，再点「揭晓」；改选会清掉旧的反馈。",
    "The question for this step: can you work out a new day without the animation? Here are the purchases for April 7, 2024 (not one of the presets above). Choose, then press “Reveal”; changing your choice clears old feedback."
  ],
  "predictCaption": ["2024-04-07 的 Spending", "Spending for 2024-04-07"],
  "predictLegend": ["这一天的三行输出是？（平台：金额 / 人数）", "Which three output rows does this day produce? (platform: amount / users)"],
  "option0": ["desktop 28 / 2，mobile 38 / 3，没有 both 行", "desktop 28 / 2, mobile 38 / 3, no both row"],
  "option1": ["desktop 6 / 1，mobile 20 / 2，both 40 / 2", "desktop 6 / 1, mobile 20 / 2, both 40 / 2"],
  "option2": ["desktop 6 / 1，mobile 20 / 2，both 40 / 1", "desktop 6 / 1, mobile 20 / 2, both 40 / 1"],
  "reveal": ["揭晓", "Reveal"],
  "predictReset": ["清除选择", "Clear choice"],
  "await": ["先选一个答案，再揭晓。", "Choose an answer, then reveal."],
  "correct": ["正确。", "Correct."],
  "wrong0": ["这是直觉查询的结果：用户 7 的 22 被算进 desktop、18 被算进 mobile，他被数了两次，而且 both 行消失了。", "That is the obvious query's result: user 7's 22 went into desktop and his 18 into mobile, so he was counted twice, and the both row vanished."],
  "wrong1": ["金额对了，人数错了：both 组只有用户 7 一个人。他有两行消费，但第一次分组已把它们压成一个人-天，所以只数 1 人——这正是 COUNT 数“人-天”而不是数“消费行”的意义。", "The amounts are right but the head-count is not: the both group holds only user 7. He has two purchase rows, but the first grouping collapsed them into one person-day, so he counts once — that is why we count person-days, not purchase rows."],
  "answer": ["推理：用户 7 两样都用 → both 18+22=40，1 人；用户 8、9 只用手机 → mobile 9+11=20，2 人；用户 10 只用电脑 → desktop 6，1 人。当天合计 66 = 18+22+9+11+6，守恒。", "Reasoning: user 7 used both → both 18+22 = 40, 1 user; users 8 and 9 used only mobile → mobile 9+11 = 20, 2 users; user 10 used only desktop → desktop 6, 1 user. Day total 66 = 18+22+9+11+6, conserved."],

  "s7t": ["从两次分组到可提交的 SQL，以及它的成本", "From two groupings to submittable SQL, and its cost"],
  "s7e": [
    "这一步要回答：前面每一个想法落在代码的哪一行？完整查询分三块，正好对应第 3、4 步。",
    "The question for this step: where does each idea above live in the code? The query has three blocks, matching steps 3 and 4."
  ],
  "map1": ["user_day（第 3 步）：GROUP BY spend_date, user_id 把一个人的一天压成一行；CASE WHEN COUNT(DISTINCT platform) = 2 THEN 'both' ELSE MAX(platform) 给出唯一标签；SUM(amount) 搬运金额。", "user_day (step 3): GROUP BY spend_date, user_id collapses a person's day into one row; CASE WHEN COUNT(DISTINCT platform) = 2 THEN 'both' ELSE MAX(platform) gives the single label; SUM(amount) carries the money."],
  "map2": ["grid（第 4 步）：SELECT DISTINCT 日期，再 CROSS JOIN 一个三行的小表（desktop、mobile、both，用 UNION ALL 拼出），得到固定的输出形状。", "grid (step 4): SELECT DISTINCT dates, CROSS JOIN a three-row table (desktop, mobile, both, built with UNION ALL) to get the fixed output shape."],
  "map3": ["最后的 SELECT（第 4 步）：grid LEFT JOIN user_day 保留空格子；COUNT(u.user_id) 不数 NULL，所以空格子是 0；COALESCE(SUM(u.amount), 0) 把空和换成 0。GROUP BY g.spend_date, g.platform 就是第二次分组。", "The final SELECT (step 4): grid LEFT JOIN user_day keeps empty cells; COUNT(u.user_id) skips NULL, so an empty cell gives 0; COALESCE(SUM(u.amount), 0) turns an empty sum into 0. GROUP BY g.spend_date, g.platform is the second grouping."],
  "map4": ["ORDER BY 只是让结果按日期、再按 desktop、mobile、both 排列，便于阅读；题目接受任意顺序。", "ORDER BY merely lists rows by date, then desktop, mobile, both, for readability; any order is accepted."],
  "cost": [
    "成本：设 Spending 有 n 行、D 个不同日期（D ≤ n）。第一次分组让每行进入一个组：数据库用排序是 O(n log n)，用哈希是期望 O(n)；结果 user_day 最多 n 行。grid 由 3n 行配对去重而来，同样是 O(n log n) 或期望 O(n)，只剩 3D 行。LEFT JOIN 按 (日期, 标签) 匹配，再分组，O(n + D) 级别（不计排序）。总计 O(n log n) 时间（哈希时期望 O(n)），中间结果 O(n) 空间。对比第 2 步“正确但笨”的做法要读 3·D·n 行：当 D 与 n 同阶时是平方级。",
    "Cost: let Spending have n rows and D distinct dates (D ≤ n). The first grouping puts every row into one group: O(n log n) if the database sorts, expected O(n) if it hashes; user_day has at most n rows. grid de-duplicates 3n pairings, again O(n log n) or expected O(n), leaving 3D rows. The LEFT JOIN matches on (date, label) and groups again, on the order of O(n + D) excluding sorting. Overall O(n log n) time (expected O(n) with hashing) and O(n) space for intermediate results. Compare the clumsy approach from step 2, which reads 3·D·n rows: quadratic when D grows with n."
  ],
  "dialect": [
    "方言说明：这段 SQL 按 MySQL 8 写（WITH 子句需要 MySQL 8）。测试在内存 SQLite 中执行同一段文本，并与纯 Python 按定义计算的结果逐行比对；两者共同支持这里用到的全部语法。差别：MySQL 的 platform 是 ENUM 类型，SQLite 里是 TEXT；MySQL 对 ENUM 求 MAX 按字符串比较——这里每组只有一个值，所以不影响结果。本地没有 MySQL 服务器，因此没有在真正的 MySQL 上执行，也没有提交到 LeetCode。",
    "Dialect note: this SQL is written for MySQL 8 (the WITH clause needs MySQL 8). The tests run the same text in an in-memory SQLite database and compare it row by row with a plain-Python computation from the definition; both engines support every construct used. Differences: in MySQL platform is an ENUM, in SQLite it is TEXT; MySQL takes MAX of an ENUM by string value — harmless here because each group holds a single value. No MySQL server was available locally, so the query has not been run on real MySQL or submitted to LeetCode."
  ],
  "source": ["查看 MySQL 源码", "View MySQL source"],
  "copy": ["复制 SQL", "Copy SQL"],
  "download": ["下载 solution.sql", "Download solution.sql"],
  "copied": ["已复制到剪贴板。", "Copied to the clipboard."],
  "fallback": ["剪贴板不可用：全文已在下面选中，请按 Ctrl+C（Mac 上 ⌘C）。", "Clipboard unavailable: the full text is selected below; press Ctrl+C (⌘C on a Mac)."],
  "manualCopy": ["手动复制 SQL", "Copy the SQL by hand"],
  "related": ["相关概念", "Related concepts"],
  "related1": ["本页第 3 步：为什么要先按人-天分组", "Step 3 here: why group by person-day first"],
  "related2": ["本页第 4 步：LEFT JOIN 与 COUNT 的空值陷阱", "Step 4 here: LEFT JOIN and the COUNT-on-NULL trap"],
  "related3": ["#262 行程与用户 · 第 3 步：按天逐行累加计数（那题只输出有请求的日子，可与本题的零行对照）", "#262 Trips and Users · step 3: per-day counters updated row by row (that problem prints only days with requests — contrast with the zero rows here)"],
  "platformsBoth": ["mobile + desktop", "mobile + desktop"]
};
