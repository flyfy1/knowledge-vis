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
    "不变量：处理完任意前缀后，每个日期的 (numerator, denominator) 都正好描述该前缀中合资格行；下一行只会把 denominator 加 1，并在取消时把 numerator 加 1。",
    "Invariant: after any processed prefix, each day’s (numerator, denominator) exactly describes eligible rows in that prefix; the next row adds one to denominator and adds one to numerator only when cancelled."
  ],
  "baseline": [
    "基线做法可以逐日扫描所有 trip，再查两张 Users 表。它是正确的，但重复扫描和连接会让大输入变慢；一次筛选连接后再 groupby，仍保留同一计数逻辑。",
    "A correct baseline scans every trip by day and looks up both Users rows repeatedly. It preserves the rule but repeats work; one eligibility join followed by groupby keeps the same counts with less repeated scanning."
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
    "代码逐句对应",
    "Line-by-line mapping"
  ],
  "map1": [
    "`active` 只保留 Users 中 banned == \"No\" 的 users_id。",
    "`active` keeps only users_id values with banned == \"No\"."
  ],
  "map2": [
    "两次 merge 分别约束 client_id 与 driver_id；这是“两端都合资格”的连接。",
    "The two merges constrain client_id and driver_id separately: both endpoints must be eligible."
  ],
  "map3": [
    "`groupby(\"request_at\")` 汇总 cancelled 的 sum/count，再 round(2) 得到 Cancellation Rate。",
    "`groupby(\"request_at\")` aggregates sum/count of cancelled, then round(2) produces Cancellation Rate."
  ],
  "complexity": [
    "成本：一次连接与一次分组，期望 O(T + U) 时间、O(T + U) 空间（哈希连接/分组）。",
    "Cost: one join and one grouping, expected O(T + U) time and O(T + U) space (hash join/grouping)."
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
    "去 #41 学 Pandas 连接 →",
    "Learn Pandas joins in #41 →"
  ],
  "related1": [
    "去 #135 学按条件聚合 →",
    "Learn conditional aggregation in #135 →"
  ],
  "foot": [
    "作者自检页面；不代表 LeetCode 接受或独立评审通过。",
    "Author self-check page; it does not claim LeetCode acceptance or independent review."
  ]
};
