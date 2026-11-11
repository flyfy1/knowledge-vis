# Authoring helper confined to this lesson: writes ../copy.js; duplicate keys raise immediately.
import json
from pathlib import Path

R = Path(__file__).resolve().parents[1]
pairs = {}


def c(key, zh, en):
    assert key not in pairs, key
    assert zh.strip() and en.strip(), key
    pairs[key] = [zh, en]


c('docTitle', '1097 · 游戏玩法分析 V', '1097 · Game Play Analysis V')
c('title', '#1097 · 游戏玩法分析 V', '#1097 · Game Play Analysis V')
c('back', '← LeetCode 题集', '← LeetCode collection')
c('language', '语言', 'Language')
c('navLabel', '课程步骤', 'Lesson steps')
c('official', '官方题目 ↗', 'Official problem ↗')
c('badge', '困难 · 数据库 · MySQL', 'Hard · Database · MySQL')
c('intro', '一张登录记录表，问的是：每天新来的玩家里，有多少第二天又回来了？难点不在 SQL 语法，而在分清“哪一天算安装日”和“哪些行根本不用看”。',
  'A table of logins, and one question: of the players who arrived on a given day, how many came back the next day? The difficulty is not SQL syntax but deciding which day is the install day and which rows never matter.')
c('contract', '表 Activity(player_id, device_id, event_date, games_played)，(player_id, event_date) 是主键：同一玩家同一天最多一行。玩家的“安装日” install_dt 是他第一次出现的日期。对每个安装日 x，installs 是安装日为 x 的玩家数；Day1_retention 是其中在 x 的下一天也有登录记录的玩家所占比例，保留两位小数。每个出现过的安装日输出一行（install_dt, installs, Day1_retention），顺序不限。',
  'Table Activity(player_id, device_id, event_date, games_played) has primary key (player_id, event_date): at most one row per player per day. A player’s install date install_dt is the first date the player appears. For each install date x, installs is the number of players whose install date is x, and Day1_retention is the fraction of them who also have a row on the day after x, rounded to two decimals. Output one row (install_dt, installs, Day1_retention) per install date, in any order.')
c('access', '官方题面仅对订阅用户开放；上面是本页自写的转述，表格例子也是自编的。请以官方页面为准。',
  'The official statement is for subscribers only. The text above is this page’s own restatement and the example tables are our own; the official page is authoritative.')

steps = [
    ('先手算一张小表', 'Work one small table by hand'),
    ('两个诱人的错误和一个慢的正确查询', 'Two tempting mistakes and a slow correct query'),
    ('哪些行真的有用', 'Which rows actually matter'),
    ('查“第二天”而不丢人', 'Look up the next day without losing anyone'),
    ('一行一行走一遍', 'Walk the rows'),
    ('先预测再揭晓', 'Predict, then reveal'),
    ('对应到 SQL', 'Map to SQL'),
]
for i, (zh, en) in enumerate(steps, 1):
    c(f'nav{i}', f'{i} · {zh}', f'{i} · {en}')
    c(f'h{i}', f'{i}. {zh}', f'{i}. {en}')

# Step 1
c('p1', '这一步回答：两个输出数字分别数的是什么？下面是 10 行登录记录（故意没有按日期排好）。先自己找出每个玩家的安装日，再看他第二天来没来。',
  'What exactly do the two output numbers count? Below are 10 login rows, deliberately not sorted by date. First find each player’s install date yourself, then check whether the player came back the next day.')
c('handNext', '揭示下一个玩家', 'Reveal the next player')
c('handReset', '重新开始', 'Start over')
c('handIntro', '还没有揭示。玩家 1 的三行日期是 03-05、03-01、03-02——哪一天是安装日？', 'Nothing revealed yet. Player 1 has rows dated 03-05, 03-01 and 03-02 — which one is the install day?')
c('handPlayer', '玩家 {p}：安装日 {d}（最早的一行），第二天是 {next}，{status}。', 'Player {p}: install date {d} (the earliest row); the next day is {next}; {status}.')
c('handYes', '有记录——算留存', 'there is a row — retained')
c('handNo', '没有记录——不算', 'no row — not retained')
c('handDone', '汇总：03-01 安装 3 人（玩家 1、2、4），次日回来 1 人 → 1/3 = 0.33；03-02 安装 2 人（玩家 3、5），次日回来 1 人 → 1/2 = 0.50。', 'Summary: 3 players installed on 03-01 (players 1, 2, 4) and 1 came back → 1/3 = 0.33; 2 installed on 03-02 (players 3, 5) and 1 came back → 1/2 = 0.50.')
c('handNote', '注意玩家 4：他 03-03 又来了，但那是安装后第二天之后，不算“次日留存”。玩家 1 在 03-02 也有记录，但他不是 03-02 安装的。', 'Note player 4: he did return on 03-03, but that is two days after installing, so it is not day-one retention. Player 1 also has a 03-02 row, but he did not install on 03-02.')

# Step 2
c('p2', '这一步回答：最先想到的写法错在哪里，正确但直接的写法又慢在哪里？',
  'Where do the first ideas go wrong, and why is the direct correct query slow?')
c('wrong1', '错误一：“03-02 那天登录的人就是 03-02 的安装数。”03-02 登录的有玩家 1、3、5，共 3 人；但玩家 1 是 03-01 安装的，正确的 installs 是 2。安装日必须是该玩家所有行里最早的那天。',
  'Mistake 1: “players active on 03-02 are the 03-02 installs.” Players 1, 3 and 5 are active on 03-02, which is 3; but player 1 installed on 03-01, so the correct installs value is 2. The install day must be the earliest of all the player’s rows.')
c('wrong2', '错误二：“只要以后又来过就算留存。”那样 03-01 会有玩家 1 和玩家 4 两人留存，得 0.67；但玩家 4 是第三天才来，正确值是 0.33。要查的是恰好 install_dt + 1 天的那一行。',
  'Mistake 2: “any later visit counts as retained.” Then 03-01 would have players 1 and 4 retained, giving 0.67; but player 4 came back on the third day, so the correct value is 0.33. The row to look for is exactly install_dt + 1 day.')
c('baselineText', '一个直接而正确的写法：对每一行，用子查询检查它是不是该玩家最早的一行；对保留下来的行，再用子查询检查第二天有没有记录。',
  'A direct, correct query: for every row, a subquery checks whether it is that player’s earliest row; for the rows that survive, another subquery checks for a row on the next day.')
c('baselineCost', '问题在于“对每一行”：两个子查询都依赖外层这一行的玩家和日期（称为相关子查询），逻辑上每处理一行就要再扫一遍表。10 行时约 10 × 10 + 5 × 10 = 150 次行访问；表有 10 万行时是百亿级。数据库有时能借助索引改写它，但这个写法本身没有告诉数据库：每个玩家其实只需算一次。',
  'The trouble is “for every row”: both subqueries depend on the outer row’s player and date (correlated subqueries), so logically each outer row rescans the table. With 10 rows that is about 10 × 10 + 5 × 10 = 150 row visits; with 100,000 rows it is tens of billions. A database can sometimes rewrite this using an index, but the query itself never says that each player needs to be computed only once.')

# Step 3
c('p3', '这一步回答：要算出答案，表里哪些行是必须看的？下面还是第 1 步那张表。先猜：玩家 1 的三行里，哪几行会影响任何输出数字？',
  'Which rows are actually needed to produce the answer? Below is the step-1 table again. Guess first: of player 1’s three rows, which ones affect any output number?')
c('markShow', '标出有用的行', 'Mark the rows that matter')
c('markHide', '隐藏标记', 'Hide the marks')
c('markAsk', '每个玩家最多只有两行有用。是哪两行？', 'Each player has at most two useful rows. Which two?')
c('markRead', '★ 安装行：{a} 行；↗ 次日行：{b} 行；其余 {c} 行（暗色）对答案毫无影响。', '★ install rows: {a}; ↗ next-day rows: {b}; the other {c} rows (dim) have no effect on the answer.')
c('colPlayer', 'player_id', 'player_id')
c('colDevice', 'device_id', 'device_id')
c('colDate', 'event_date', 'event_date')
c('colGames', 'games_played', 'games_played')
c('colRole', '作用', 'Role')
c('roleInstall', '★ 安装行', '★ install row')
c('roleNext', '↗ 次日行', '↗ next-day row')
c('roleNone', '无影响', 'no effect')
c('insight', '每个玩家对分母恰好贡献 1（在他的安装日那一组），对分子贡献 0 或 1（看次日行在不在）。至于他还玩了多少天、用了什么设备、玩了几局，都与答案无关。所以第一步应该把表压缩成“每个玩家一行”：(player_id, install_dt)。这在 SQL 里就是 GROUP BY player_id 加 MIN(event_date)。',
  'Each player contributes exactly 1 to a denominator (in the group of his install date) and 0 or 1 to a numerator (whether the next-day row exists). How many other days he played, on which device, how many games — none of it matters. So the first move is to shrink the table to one row per player: (player_id, install_dt). In SQL that is GROUP BY player_id with MIN(event_date).')
c('insightWhy', '为什么 MIN 是对的：日期按时间先后比较，最早的日期就是第一次出现的日期。与行在表中的顺序无关——玩家 1 的 03-05 行排在最前面，也不会被当成安装日。',
  'Why MIN is right: dates compare in time order, so the smallest date is the first appearance. Row order in the table is irrelevant — player 1’s 03-05 row comes first in the table but is not the install day.')

# Step 4
c('p4', '这一步回答：有了每个玩家的安装日，怎样检查“第二天来没来”，同时让没回来的玩家仍然留在分母里？',
  'With each player’s install date in hand, how do we check “came back the next day” while keeping non-returning players in the denominator?')
c('joinText', '把每个安装行和 Activity 中“同一玩家、日期 = install_dt + 1 天”的那一行配对。因为 (player_id, event_date) 是主键，这样的行最多一行，所以配对不会把一个玩家变成两行。',
  'Pair each install row with the Activity row having the same player and date = install_dt + 1 day. Because (player_id, event_date) is the primary key, there is at most one such row, so pairing never turns one player into two rows.')
c('leftText', '关键选择：用 LEFT JOIN。它保留左边每个安装行；找不到次日行时，右边的列填 NULL。于是每个玩家恰好一行：COUNT(*) 数的是安装人数，COUNT(a.player_id) 只数非 NULL，也就是回来的人数。',
  'The key choice is LEFT JOIN. It keeps every install row on the left; when no next-day row exists, the right-hand columns become NULL. So each player is exactly one row: COUNT(*) counts installs, and COUNT(a.player_id) counts only non-NULL values, i.e. returning players.')
c('innerText', '错误三：用普通的 JOIN（INNER JOIN）。没回来的玩家整行消失：03-01 只剩玩家 1，留存变成 1/1 = 1.00；nobody 例子里 05-05 这一天干脆从输出里消失。下一步可以切换到 INNER JOIN 亲眼看到。',
  'Mistake 3: a plain JOIN (INNER JOIN). Non-returning players vanish entirely: 03-01 keeps only player 1 and retention becomes 1/1 = 1.00; in the “nobody returns” example, 05-05 disappears from the output altogether. The next step lets you switch to INNER JOIN and watch it happen.')
c('dateText', '“加一天”要用日期运算，不能把字符串最后两位加 1：2024-02-28 的下一天是 02-29（闰年），02-29 的下一天是 03-01，12-31 的下一天是下一年的 01-01。MySQL 写作 DATE_ADD(install_dt, INTERVAL 1 DAY)。',
  '“Add one day” needs date arithmetic, not adding 1 to the last two characters: the day after 2024-02-28 is 02-29 (a leap year), after 02-29 comes 03-01, and after 12-31 comes 01-01 of the next year. MySQL writes it DATE_ADD(install_dt, INTERVAL 1 DAY).')

# Step 5
c('p5', '这一步回答：整个查询在一张具体的表上，每一行是怎样被处理的？左边（上方）是 Activity，右边（下方）是正在形成的中间表。三个阶段：扫描求每个玩家的最早日期；为每个玩家查次日行；按安装日分组算比例。',
  'How is every row handled when the whole query runs on a concrete table? Activity is shown first, then the intermediate tables as they form. Three phases: scan for each player’s earliest date; look up each player’s next-day row; group by install date and compute the ratio.')
c('presetLabel', '选一张表（选择后从头开始）：', 'Choose a table (restarts the walk):')
c('preset_main', '第 1 步的表', 'Step 1 table')
c('preset_calendar', '跨月、跨年、闰日', 'Month, year, leap day')
c('preset_nobody', '没人次日回来', 'Nobody returns')
c('preset_random', '换一张随机表', 'New random table')
c('joinLabel', '连接方式（切换后从头开始）：', 'Join type (switching restarts the walk):')
c('joinLeft', 'LEFT JOIN（正确）', 'LEFT JOIN (correct)')
c('joinInner', 'INNER JOIN（错误，看看会怎样）', 'INNER JOIN (wrong — see what happens)')
c('toggleHint', '每行左边的按钮可以把这一行从表中拿掉或放回（会从头开始）。试试拿掉玩家 1 的 03-02 行：03-01 的留存会变成多少？', 'The button at the left of each row removes it from the table or puts it back (restarting the walk). Try removing player 1’s 03-02 row: what does 03-01’s retention become?')
c('rowOn', '在表中', 'in table')
c('rowOff', '已拿掉', 'removed')
c('rowToggleLabel', '切换第 {i} 行（玩家 {p}，{d}）', 'Toggle row {i} (player {p}, {d})')
c('sim', '这是用 JavaScript 写的教学模拟，按下方 SQL 的逻辑逐行演示，并不在浏览器里执行 SQL。为了能后退，它保存每一步的快照。',
  'This is a teaching simulation in JavaScript that follows the logic of the SQL below row by row; it does not run SQL in the browser. To allow going back it keeps a snapshot of every action.')
c('prev', '退回一步', 'Previous action')
c('next', '完成下一步', 'Complete next action')
c('reset', '回到开头', 'Back to start')
c('end', '完成全部', 'Complete all')
c('progress', '已完成 {i}/{total} 步。', '{i}/{total} actions completed.')
c('activityTitle', 'Activity（当前表）', 'Activity (current table)')
c('installsTitle', 'installs：每个玩家一行（阶段 1、2 形成）', 'installs: one row per player (built in phases 1 and 2)')
c('outputTitle', '输出（阶段 3 形成）', 'Output (built in phase 3)')
c('colInstall', 'install_dt', 'install_dt')
c('colTarget', '要找的次日', 'Next day sought')
c('colMatch', 'a.player_id', 'a.player_id')
c('colInstalls', 'installs', 'installs')
c('colReturned', 'COUNT(a.player_id)', 'COUNT(a.player_id)')
c('colRet', 'Day1_retention', 'Day1_retention')
c('colInclude', '行', 'Row')
c('notYet', '尚未查', 'not looked up yet')
c('nullCell', 'NULL', 'NULL')
c('dropped', '被 INNER JOIN 丢掉', 'dropped by INNER JOIN')
c('emptyTable', '（空）', '(empty)')
c('evStart', '开始：表中有 {rows} 行。阶段 1 将逐行扫描，记下每个玩家目前见到的最早日期。', 'Start: the table has {rows} rows. Phase 1 scans them one by one, keeping each player’s earliest date seen so far.')
c('evScanNew', '阶段 1 · 第 {i} 行：玩家 {p} 第一次出现，记下 {d}。', 'Phase 1 · row {i}: player {p} appears for the first time; record {d}.')
c('evScanEarlier', '阶段 1 · 第 {i} 行：玩家 {p} 的 {d} 早于之前记下的 {old}，替换为 {d}。', 'Phase 1 · row {i}: player {p}’s {d} is earlier than the recorded {old}; replace it with {d}.')
c('evScanLater', '阶段 1 · 第 {i} 行：玩家 {p} 的 {d} 不早于已记下的 {old}，保持不变。', 'Phase 1 · row {i}: player {p}’s {d} is not earlier than the recorded {old}; keep it.')
c('evLookupHit', '阶段 2 · 玩家 {p}：安装日 {d}，找 {t} 的行——找到了（第 {row} 行），a.player_id = {p}。', 'Phase 2 · player {p}: install date {d}; look for a row on {t} — found (row {row}), so a.player_id = {p}.')
c('evLookupMiss', '阶段 2 · 玩家 {p}：安装日 {d}，找 {t} 的行——没有。LEFT JOIN 保留这一行，a.player_id = NULL。', 'Phase 2 · player {p}: install date {d}; look for a row on {t} — none. LEFT JOIN keeps the row with a.player_id = NULL.')
c('evLookupDrop', '阶段 2 · 玩家 {p}：安装日 {d}，找 {t} 的行——没有。INNER JOIN 把这个玩家整行丢掉了。', 'Phase 2 · player {p}: install date {d}; look for a row on {t} — none. INNER JOIN drops this player entirely.')
c('evGroup', '阶段 3 · 安装日 {d}：COUNT(*) = {m} 人，COUNT(a.player_id) = {k} 人，ROUND({k} / {m}, 2) = {v}。', 'Phase 3 · install date {d}: COUNT(*) = {m} players, COUNT(a.player_id) = {k}, ROUND({k} / {m}, 2) = {v}.')
c('evFinal', '完成：输出 {n} 行，每个安装日一行。', 'Done: {n} output rows, one per install date.')
c('evFinalEmpty', '完成：表是空的，输出也没有行。', 'Done: the table is empty, so the output has no rows.')
c('proofTitle', '为什么正确', 'Why it is correct')
c('proof1', '安装行：GROUP BY player_id 让每个玩家恰好一组，MIN(event_date) 取其最早日期，正是定义里的安装日。',
  'Install rows: GROUP BY player_id gives every player exactly one group, and MIN(event_date) takes its earliest date — the install date by definition.')
c('proof2', '不重：主键保证同一玩家在 install_dt + 1 天最多一行，LEFT JOIN 后每个玩家仍是一行，所以 COUNT(*) 等于安装人数，不会被重复计数。不漏：LEFT JOIN 不丢左边的行，没回来的玩家以 NULL 留下，仍在分母中。',
  'No double counting: the primary key allows at most one row per player on install_dt + 1, so each player is still one row after the LEFT JOIN and COUNT(*) equals the number of installs. Nothing lost: LEFT JOIN never drops a left row, so non-returning players stay in the denominator as NULLs.')
c('proof3', '分子：COUNT(a.player_id) 跳过 NULL，只数找到次日行的玩家。比值再 ROUND(…, 2)。每个安装日至少有 1 个玩家，分母不会是 0。',
  'Numerator: COUNT(a.player_id) skips NULLs and counts exactly the players with a next-day row. The ratio is then ROUND(…, 2). Every install date has at least one player, so the denominator is never 0.')
c('boundaries', '容易出错的边界：只登录过一次的玩家（留存 0，但仍要计入 installs）；第三天才回来的玩家（不算）；跨月、跨年、闰日的“下一天”；没有任何人回来的安装日（输出 0.00，而不是消失）；表中行的顺序与日期无关。',
  'Boundaries that usually break: a player with a single login (retention 0, yet still counted in installs); a player who returns on the third day (does not count); “next day” across months, years and a leap day; an install date where nobody returns (output 0.00, not a missing row); row order unrelated to dates.')

# Step 6
c('p6', '这一步检验：下面是一张新表（不在上面的演示里）。2024-06-10 这一安装日的 Day1_retention 是多少？',
  'Check yourself on a new table (not in the walk above). What is Day1_retention for install date 2024-06-10?')
c('choose', '2024-06-10 的 Day1_retention 是：', 'Day1_retention for 2024-06-10 is:')
c('opt0', '0.33', '0.33')
c('opt1', '1.00', '1.00')
c('opt2', '0.50', '0.50')
c('reveal', '揭晓', 'Reveal')
c('await', '先选一个答案，再按“揭晓”。', 'Choose an answer, then press Reveal.')
c('correct', '正确。', 'Correct.')
c('wrongA', '0.33 把 06-10 当天登录的玩家 1、2、4 都当成了安装者；玩家 4 是 06-09 安装的。', '0.33 treats everyone active on 06-10 (players 1, 2, 4) as installers; player 4 installed on 06-09.')
c('wrongB', '1.00 来自 INNER JOIN：没回来的玩家 2 被丢掉，只剩回来的玩家 1。', '1.00 comes from an INNER JOIN: player 2, who did not return, was dropped, leaving only player 1.')
c('answer', '06-10 安装的是玩家 1 和 2（玩家 4 最早出现在 06-09，玩家 3 在 06-11）。玩家 1 在 06-11 有记录，玩家 2 下一次是 06-12。所以 1 / 2 = 0.50。',
  'Players 1 and 2 installed on 06-10 (player 4 first appears on 06-09, player 3 on 06-11). Player 1 has a row on 06-11; player 2’s next visit is 06-12. So 1 / 2 = 0.50.')

# Step 7
c('p7', '这一步回答：SQL 的每一段来自哪一步，代价多大，在不同数据库里要注意什么？',
  'Which step does each part of the SQL come from, what does it cost, and what differs between databases?')
c('map1', 'WITH installs AS (… MIN(event_date) … GROUP BY player_id)：第 3 步，把表压成每个玩家一行。WITH 只是给中间表起名字，方便后面引用。',
  'WITH installs AS (… MIN(event_date) … GROUP BY player_id): step 3, shrinking the table to one row per player. WITH just names the intermediate table so it can be used below.')
c('map2', 'LEFT JOIN … ON 同一玩家 AND 日期 = DATE_ADD(install_dt, INTERVAL 1 DAY)：第 4 步，找次日行且不丢人。',
  'LEFT JOIN … ON same player AND date = DATE_ADD(install_dt, INTERVAL 1 DAY): step 4, finding the next-day row without losing anyone.')
c('map3', 'GROUP BY i.install_dt 与 COUNT(*)、COUNT(a.player_id)、ROUND(…, 2)：第 4、5 步的分组与比值。ORDER BY 只是让输出好读，题目不要求顺序。',
  'GROUP BY i.install_dt with COUNT(*), COUNT(a.player_id) and ROUND(…, 2): the grouping and ratio of steps 4 and 5. ORDER BY only makes the output easier to read; any order is accepted.')
c('cost', '代价：设 Activity 有 n 行、p 个玩家。第一次分组扫描 n 行（哈希分组 O(n)，排序分组 O(n log n)）；连接对每个玩家查一次，主键 (player_id, event_date) 上有索引时每次 O(log n)，共 O(p log n)；最后按安装日分组 O(p)。总计约 O(n log n) 时间，中间表 O(p) 空间。对比相关子查询的逻辑代价 O(n²)。',
  'Cost: let Activity have n rows and p players. The first grouping scans n rows (O(n) with hashing, O(n log n) by sorting); the join looks up once per player, O(log n) each with the index on the primary key (player_id, event_date), O(p log n) in total; the final grouping is O(p). Roughly O(n log n) time and O(p) space for the intermediate table, versus the O(n²) logical cost of the correlated subqueries.')
c('dialect', '方言说明：这是 MySQL 写法。SQLite 没有 DATE_ADD，要写 DATE(install_dt, \'+1 day\')；SQLite 中两个整数相除是整除，要先乘 1.0；而且 SQLite 对二进制浮点数做 ROUND，0.475 这类恰好在中间的值可能被舍成 0.47。MySQL 中两个整数相除得到 DECIMAL：单独显示时保留 4 位小数，但交给外层 ROUND 的是内部按 9 位小数算出的值（MySQL 开发者在 bug #103145 中的说明），所以 ROUND(…, 2) 与精确的四舍五入一致——除非同一安装日的人数达到千万级。若先 CAST 成 4 位小数再 ROUND，1 / 201 会变成 0.01 而不是 0.00。本页没有可用的 MySQL：这段 SQL 是按上述替换在 SQLite 上运行、并与独立的 Python 计算逐行核对的。',
  'Dialect notes: this is MySQL. SQLite has no DATE_ADD and needs DATE(install_dt, \'+1 day\'); in SQLite dividing two integers truncates, so multiply by 1.0 first, and SQLite rounds a binary float, so an exact tie such as 0.475 may come out as 0.47. In MySQL, dividing two integers gives a DECIMAL that is displayed with 4 decimals, but an enclosing ROUND receives the internal value, which carries 9 decimals (a MySQL developer’s explanation in bug #103145); so ROUND(…, 2) matches exact rounding unless a single install date has around ten million players. Casting to 4 decimals before ROUND would instead turn 1 / 201 into 0.01 rather than 0.00. No MySQL server was available for this page: the SQL was run on SQLite with the substitutions above and checked row by row against an independent Python computation.')
c('source', '查看 MySQL 源码', 'View MySQL source')
c('copy', '复制 SQL', 'Copy SQL')
c('download', '下载 solution.sql', 'Download solution.sql')
c('copied', '已复制。', 'Copied.')
c('manual', '无法写入剪贴板；已在下面选中全文，请按 Ctrl/Cmd+C。', 'Clipboard unavailable; the full source is selected below — press Ctrl/Cmd+C.')
c('manualLabel', '完整源码（手动复制）', 'Full source (copy manually)')
c('related', '相关概念', 'Related concepts')
c('link1', '为什么用 LEFT JOIN 保留没有匹配的行 → 本页第 4 步', 'Why LEFT JOIN keeps unmatched rows → step 4 here')
c('link2', '按天累计分子与分母、再取两位小数的比率 → #262 第 2 步', 'Per-day numerator and denominator, then a two-decimal rate → #262 step 2')

out = 'window.COPY = ' + json.dumps(pairs, ensure_ascii=False, indent=2) + ';\n'
(R / 'copy.js').write_text(out)
print(len(pairs), 'keys')
