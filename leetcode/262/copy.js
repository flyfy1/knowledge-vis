'use strict';
const COPY={
  "docTitle": [
    "#262 · 行程与用户",
    "#262 · Trips and Users"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "meta": [
    "#262 · Hard · 数据库 / Pandas",
    "#262 · Hard · Database / Pandas"
  ],
  "title": [
    "#262 · 行程与用户",
    "#262 · Trips and Users"
  ],
  "tagline": [
    "把“取消率”拆成资格筛选、按天计数和一个可验证的不变量。",
    "Turn cancellation rate into eligibility, daily counts, and a checkable invariant."
  ],
  "official": [
    "打开官方题面 ↗",
    "Open official statement ↗"
  ],
  "s0": [
    "1. 先决定哪一行有资格",
    "1. Decide which row is eligible"
  ],
  "s1": [
    "2. 手算一个日期窗口",
    "2. Calculate the date window by hand"
  ],
  "s2": [
    "3. 从观察得到不变量",
    "3. Derive the invariant"
  ],
  "s3": [
    "4. 迁移练习：先预测",
    "4. Transfer exercise: predict first"
  ],
  "s4": [
    "5. 映射到 Pandas 提交",
    "5. Map it to the Pandas submission"
  ],
  "statement": [
    "这一步要回答：一条 trip 什么时候进入统计？Trip 记录客户、司机、状态和日期；Users 告诉我们两端是否 banned。eligible request（合资格请求）指 client 与 driver 都是 No。",
    "Question for this step: when does one trip enter the statistic? A Trip has a client, driver, status, and date; Users supplies both ban flags. An eligible request is one whose client and driver are both No."
  ],
  "hand": [
    "小例子：#1 的客户 1 和司机 10 都是 No，所以留下；#2 的客户 2 是 Yes，即使司机 11 是 No，整行也排除。先手算一天：2013-10-01 的 #1、#3、#4 共 3 条合资格请求，其中 #4 被取消，所以取消率 = 1 ÷ 3 = 0.33。最终每个有合资格请求的日期输出一行，列名是 Day 和 Cancellation Rate。",
    "Tiny example: #1 has client 1 and driver 10, both No, so it stays. #2 has client 2 = Yes; even with driver 11 = No, the whole row is excluded. Work one day before tracing: on 2013-10-01, #1, #3, and #4 are 3 eligible requests; #4 is cancelled, so the cancellation rate is 1 ÷ 3 = 0.33. The final output has one row per day with at least one eligible request, with columns Day and Cancellation Rate."
  ],
  "wrong": [
    "容易错的做法：只检查 client。若 driver 10 被封、client 1 未被封，仍会把这条取消算进率；题目要求两端都未封。",
    "Tempting mistake: check only the client. If driver 10 is banned while client 1 is not, counting that cancellation violates the two-endpoint rule."
  ],
  "constraints": [
    "官方条件：日期为 2013-10-01 到 2013-10-03（含首尾）；只显示至少一条合资格请求的日期；结果保留两位小数。",
    "Official conditions: dates 2013-10-01 through 2013-10-03 inclusive; show only days with at least one eligible request; round to two decimals."
  ],
  "task": [
    "这一步要回答：每天的两个计数怎样组成一个率？分母 denominator 是当天所有合资格请求；分子 numerator 是其中 status 为 cancelled_by_client 或 cancelled_by_driver 的行。按日期逐行处理后，每个有合资格请求的日期会得到一行 Day、Cancellation Rate；例如刚才的 2013-10-01 就是 0.33。",
    "Question for this step: how do two daily counts become a rate? The denominator is every eligible request that day; the numerator is the subset cancelled by client or driver. Processing rows by date produces one Day and Cancellation Rate row for every day with an eligible request; for the worked 2013-10-01 example, that value is 0.33."
  ],
  "advance": [
    "下一行",
    "Next row"
  ],
  "prev": [
    "上一行",
    "Previous row"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "preset": [
    "数据组",
    "Dataset"
  ],
  "progress": [
    "已处理 {i}/{n} 行",
    "Processed {i}/{n} rows"
  ],
  "traceHint": [
    "这是模拟的逐行追踪，不是执行官方提交。观察顺序：按下一行，先看 eligibility，再看该日的分子/分母。",
    "This is a deterministic trace, not execution of the official submission. Press Next: inspect eligibility, then that day’s numerator/denominator."
  ],
  "row": [
    "行",
    "Row"
  ],
  "endpoint": [
    "客户 → 司机",
    "client → driver"
  ],
  "date": [
    "日期",
    "Day"
  ],
  "status": [
    "状态",
    "Status"
  ],
  "elig": [
    "资格",
    "Eligible"
  ],
  "num": [
    "取消数",
    "Cancelled"
  ],
  "den": [
    "请求数",
    "Requests"
  ],
  "rate": [
    "当前率",
    "Current rate"
  ],
  "yes": [
    "保留",
    "keep"
  ],
  "no": [
    "排除",
    "drop"
  ],
  "done": [
    "完成：每个日期的分子和分母都已累计。",
    "Done: every day’s numerator and denominator are accumulated."
  ],
  "invariant": [
    "这一步要回答：为什么处理下一行后，计数仍然正确？不变量是每一步都成立的事实；前缀就是从开头到当前已处理的这些行。对每个日期，(numerator, denominator) 分别是前缀内合资格的取消数与请求数。初始都是 (0, 0)。窗口外或任一端被封的排除行不改变任何计数；合资格且 completed 的行只给 denominator 加 1；合资格且取消的行给两个计数各加 1。每一步只计入新行应有的贡献，所以事实继续成立。处理完所有行，就得到整个窗口的计数。",
    "Question: why are the counts still correct after the next row? An invariant is a fact that stays true after each step; a prefix means the rows processed so far, starting at the beginning. For each day, (numerator, denominator) counts eligible cancellations and requests in that prefix. Initially both are (0, 0). An out-of-window or banned-endpoint excluded row changes neither count; an eligible completed row adds 1 only to denominator; an eligible cancelled row adds 1 to both. Each step adds exactly the new row’s contribution, preserving the fact. After all rows, the counts cover the whole window."
  ],
  "baseline": [
    "正确基线：对窗口内的每一天，循环检查所有 trip 的日期；对当天每条 trip，完整扫描 Users 一次找客户、再完整扫描一次找司机的 banned 标志，然后才计数。令 T 为 Trips 行数、U 为 Users 行数。只取示例的前四条 trip 和全部八条 Users：三天检查 3 × 4 = 12 次 trip 日期；四条当天请求各做两遍八行扫描，共 4 × 2 × 8 = 64 次用户行检查。一般至多 3T 次日期检查和 2TU 次用户行检查，时间 O(T + TU)、额外空间 O(1)（最多三天的计数，不含输入）。三天是固定常数；真正可避免的增长是每条 trip 都重新寻找同一批用户。",
    "A correct baseline loops over every trip for each of the three days. For each trip on that day, scan all Users once for its client’s ban flag and again for its driver’s flag, then count. Let T be the number of Trips rows and U the number of Users rows. Using just the first four sample trips and all eight users: three days require 3 × 4 = 12 trip-date checks; four matching trips each make two full eight-row user scans, totaling 4 × 2 × 8 = 64 user-row checks. In general this is at most 3T date checks plus 2TU user-row checks: O(T + TU) time and O(1) extra space for at most three daily counters, excluding inputs. Three days is a fixed constant; the avoidable growing cost is searching the same users again for every trip."
  ],
  "quiz": [
    "新场景：10-02 有两行：client 1 / driver 10 / completed；client 1 / driver 11 / cancelled_by_driver。若 driver 11 banned=Yes，10-02 的率是多少？",
    "Fresh case: on 10-02, two rows are client 1 / driver 10 / completed and client 1 / driver 11 / cancelled_by_driver. If driver 11 is banned, what is the rate?"
  ],
  "option0": [
    "0.00（分母 1，取消数 0）",
    "0.00 (denominator 1, cancelled 0)"
  ],
  "option1": [
    "0.50（两行都进入分母）",
    "0.50 (both rows enter)"
  ],
  "option2": [
    "没有该日输出（两行都不合资格）",
    "No row for that day (both are ineligible)"
  ],
  "reveal": [
    "揭晓答案",
    "Reveal answer"
  ],
  "correct": [
    "正确：0.00。",
    "Correct: 0.00."
  ],
  "incorrect": [
    "再看资格条件：",
    "Check the eligibility rule again:"
  ],
  "explain": [
    "第二行司机被封，不能进入分母；第一行是 completed，所以 0/1。改变选项可再次检查。",
    "The second row has a banned driver, so it never enters the denominator; the first is completed, giving 0/1. Change the choice to test again."
  ],
  "mapping": [
    "这一步要回答：Pandas 怎样代替手动找用户和逐日计数？DataFrame 是带列名的表。沿用示例前四条行程，先构造可匹配的用户 ID 表，再保留两端都匹配的行，最后把同一天的行收进一组。以下是固定的手算中间值，不随上方追踪位置改变。",
    "Question: how does Pandas replace manual user lookup and daily counting? A DataFrame is a table with named columns. Keep the first four sample trips: build a table of allowed user IDs, keep trips matching at both endpoints, then collect rows sharing a day. The following are fixed worked values, independent of the trace position above."
  ],
  "map1": [
    "构造 active：users[\"banned\"] == \"No\" 为每个用户产生真/假；.loc[条件, [\"users_id\"]] 只取条件为真的行和 users_id 列。八条 Users 中只有 2 被封，所以 active 是单列表 users_id = [1, 3, 4, 10, 11, 12, 13]。",
    "Build active: users[\"banned\"] == \"No\" produces true/false for each user; .loc[condition, [\"users_id\"]] keeps the true rows and just the users_id column. Only user 2 of the eight users is banned, so active is a one-column table: users_id = [1, 3, 4, 10, 11, 12, 13]."
  ],
  "map2": [
    "第一次 merge：rename 把 active 的列名改成 client_id（ID 值不变）。merge(..., on=\"client_id\") 按相等的 client_id 配对行，默认 inner 表示只保留有匹配的行。#1 的 1 匹配 1，#2 的 2 没有匹配，#3 的 3 和 #4 的 4 都能匹配。中间表留下 #1, #3, #4，仍带着各自的 driver_id、status、request_at。",
    "First merge: rename changes active’s column name to client_id, keeping the ID values. merge(..., on=\"client_id\") pairs rows with equal client_id; its default inner behavior keeps only matched rows. #1’s 1 matches 1; #2’s 2 has no match; #3’s 3 and #4’s 4 match. The intermediate table contains #1, #3, #4, still carrying their driver_id, status and request_at."
  ],
  "map3": [
    "分组与汇总：groupby(\"request_at\", as_index=False)[\"cancelled\"] 把日期相同的 cancelled 值放在一起，并将日期保留为普通列。10-01 这一组是 [0, 0, 1]。.agg([\"sum\", \"count\"]) 对每组求和并数值的个数：sum = 1，count = 3。rename 把它们命名为 cancelled 和 requests；相除并 round(2) 得 0.33。最后把 request_at 改名 Day，只返回 Day 与 Cancellation Rate 两列。没有合资格行的日期没有组，所以不会产生 0/0。",
    "Group and aggregate: groupby(\"request_at\", as_index=False)[\"cancelled\"] collects cancelled values with the same date, keeping the date as an ordinary column. The 10-01 group is [0, 0, 1]. .agg([\"sum\", \"count\"]) adds the values and counts them: sum = 1, count = 3. rename calls these cancelled and requests; dividing and round(2) gives 0.33. Finally rename request_at to Day and return only Day and Cancellation Rate. A day with no eligible rows has no group, so no 0/0 is produced."
  ],
  "complexity": [
    "成本：T = Trips 行数，U = Users 行数。一次筛选 Users 建立 active，随后两次 merge 用按 ID 查找的哈希表（由 ID 快速定位匹配行），避免每条 trip 都扫描 U 行；哈希查找平均为常数时间。再筛日期、建 cancelled 列和按日期分组。每阶段期望 O(T + U) 时间；即使分组排序，日期最多三组。因此总期望 O(T + U) 时间。哈希表、两次连接的中间表和工作列最多占 O(T + U) 额外空间。这是提交成本，不是上方教学追踪的存储成本。",
    "Cost: T = Trips rows, U = Users rows. Filter Users once to build active, then two merges use hash tables (ID-based lookup tables) to find matches without scanning U users per trip; hash lookup takes constant time on average. Next filter dates, build cancelled and group by day. Each stage takes expected O(T + U) time; even if grouping sorts keys, at most three dates remain. Total expected time is O(T + U). Lookup tables, intermediate merge tables and working columns require O(T + U) extra space. This is submission cost, separate from the teaching trace’s storage."
  ],
  "code": [
    "官方 Python/Pandas 源码",
    "Official Python/Pandas source"
  ],
  "copy": [
    "复制源码",
    "Copy source"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "copied": [
    "已复制",
    "Copied"
  ],
  "fallback": [
    "浏览器拒绝剪贴板；请从下方文本框复制。",
    "Clipboard access was denied; copy from the text area below."
  ],
  "verify": [
    "可执行提交接口是 `trips_and_users(trips: pd.DataFrame, users: pd.DataFrame) -> pd.DataFrame`。下方代码展示的是官方接口的离线镜像；动画只是教学模拟。",
    "The executable submission interface is `trips_and_users(trips: pd.DataFrame, users: pd.DataFrame) -> pd.DataFrame`. The code below is an offline mirror of that interface; the animation is only a teaching simulation."
  ],
  "related": [
    "相关概念",
    "Related concepts"
  ],
  "related0": [
    "去 #41 看原地索引放置（另一种算法） →",
    "See index placement in #41 (a different algorithm) →"
  ],
  "related1": [
    "去 #135 看相邻约束扫描（另一种算法） →",
    "See neighbor-constraint scans in #135 (a different algorithm) →"
  ],
  "foot": [
    "作者自检页面；不代表 LeetCode 接受或独立评审通过。",
    "Author self-check page; it does not claim LeetCode acceptance or independent review."
  ],
  "transition": [
    "对照示例：#1 completed 后是 (0, 1)。#2 虽然取消，但客户 2 被封，因此仍是 (0, 1)，不是 (1, 2)。#3 completed 后变成 (0, 2)，#4 合资格且取消后变成 (1, 3)。点上一行再重放 #2，两个计数都应不变。",
    "Check the sample: after completed #1 the pair is (0, 1). Although #2 is cancelled, client 2 is banned, so it stays (0, 1), rather than (1, 2). Completed #3 makes (0, 2); eligible cancelled #4 makes (1, 3). Rewind and replay #2: neither count should change."
  ],
  "formula": [
    "排除行 → 两个计数不变\n合资格行 → denominator += 1\n合资格且取消的行 → numerator += 1\n有合资格请求的日期：rate = numerator / denominator",
    "excluded row → both counts unchanged\neligible row → denominator += 1\neligible cancelled row → numerator += 1\nfor days with eligible requests: rate = numerator / denominator"
  ],
  "mapDriver": [
    "第二次 merge：再把 active 的列名改成 driver_id，按司机匹配中间表。#1→10、#3→12、#4→13 都匹配，因此结果仍是 #1, #3, #4。若把司机 13 封禁，active 不再有 13：#4 会通过客户检查，却在第二次 merge 被排除。Users 的 users_id 唯一，所以一次匹配不会复制一条 trip；不同 trip 即使内容相同也分别计数。",
    "Second merge: rename active’s column to driver_id and match the intermediate rows by driver. #1→10, #3→12 and #4→13 all match, leaving #1, #3, #4. If driver 13 were banned, active would lack 13: #4 would pass the client check but disappear in the second merge. Unique users_id values ensure a match never multiplies one trip; distinct trips with identical payloads still count separately."
  ],
  "mapWindow": [
    "构造 window：between(\"2013-10-01\", \"2013-10-03\") 保留含首尾的日期，.copy() 创建工作表，避免给输入添加列。三条都在 10-01。status.ne(\"completed\") 判断不等于 completed，得到 [False, False, True]；.astype(int) 将其转成 cancelled 列 [0, 0, 1]。官方三种状态保证不等于 completed 就是取消。",
    "Build window: between(\"2013-10-01\", \"2013-10-03\") keeps dates including both endpoints; .copy() creates a working table so adding a column does not alter the input. All three rows are on 10-01. status.ne(\"completed\") tests for inequality, giving [False, False, True]; .astype(int) converts these into the cancelled column [0, 0, 1]. The official three-status enum guarantees that non-completed means cancelled."
  ],
  "fresh": [
    "再迁移一次：客户 7、司机 70 未封，司机 71 被封。10-01 有 7→70 的 completed 与 cancelled_by_client；10-02 只有 7→71 的 cancelled_by_driver；另有一条 09-30 的取消。两次 merge 后保留司机 70 的行，日期筛选再排除 09-30。10-01 组为 [0, 1]，输出 0.50；10-02 没有组，不输出。只查客户会错误地给 10-02 输出 1.00。",
    "One more transfer: client 7 and driver 70 are unbanned; driver 71 is banned. On 10-01, 7→70 has a completed and a cancelled_by_client trip; 10-02 has only a cancelled_by_driver trip 7→71; there is also a cancellation on 09-30. The two merges keep the driver-70 trips; the date filter then excludes 09-30. The 10-01 group is [0, 1], giving 0.50; 10-02 has no group and no output. Client-only filtering would incorrectly emit 10-02 at 1.00."
  ]
};
