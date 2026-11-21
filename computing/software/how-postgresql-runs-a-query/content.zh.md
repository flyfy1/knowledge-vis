---
lang: zh
title: PostgreSQL 如何执行一条查询 · 一篇可以动手的长文
desc: 一条普通的 SELECT ... WHERE 或 UPDATE ... WHERE 发给 PostgreSQL，经过解析器、基于统计信息的代价优化器、8 KiB 分槽页与 HOT 链、MVCC 快照、VACUUM 与 32 位 XID 回卷时钟、shared_buffers 时钟扫描、Lehman & Yao B-Tree 分裂、work_mem 哈希连接溢出，到 WAL 预写日志与全页写落盘。按 PostgreSQL 17.6 / 18.0 源码数据结构与算法重写八个可动手模型，逐项拆解每一步。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
u.pct: {v}%
u.mib: {v} MiB
u.kib: {v} KiB
u.b: {v} B
u.ms: {v} ms
u.s: {v} s
u.m: {v}M
u.min: {v} 分钟
u.rows: {v} 行
u.pages: {v} 页
u.sep: 、
:::

# PostgreSQL 如何执行一条查询 {#hero}

::: strings
kicker: 计算机 · 软件原理 · 一篇可以动手的长文
:::

把一条 `SELECT ... WHERE` 或 `UPDATE` 发给数据库，<br>PostgreSQL 在内存和 8 KiB 页里到底按什么顺序干活？ {.sub}

在应用里写一行 `UPDATE accounts SET balance = balance - 100 WHERE id = 42;`，或者紧接着跑一条 `SELECT ... WHERE tier = 'pro' AND balance &gt; 1000`，看起来像只是改了一格数、读了一段表。这篇文章只追一个问题：**从客户端发出 SQL 到结果返回、修改安全落盘，PostgreSQL 内部每一步究竟发生了什么？**为什么改一行数据从不原地覆盖旧字节，为什么并发读永远不会阻塞写，为什么表必须靠 `AUTOVACUUM` 定期清理否则会停库，以及优化器凭什么决定走全表扫描、索引还是哈希连接？ {.lead}

文中的结构、字节偏移与代价常量均对照 **PostgreSQL 17.6**（2025 年 8 月 14 日）与 **PostgreSQL 18.0**（2025 年 9 月 25 日）源码定义（`bufpage.h`、`htup_details.h`、`procarray.c`、`costsize.c`、`nbtinsert.c`、`freelist.c`、`varsup.c`、`xlog.c`、`pg_crc32c_sb8.c`）。本机未安装 `postgres` 或 `psql` 可执行文件，因此页面不依赖外部数据库：八个可动手模型在 `models.js` 里把页头打包、Castagnoli CRC-32C 校验、MVCC 快照真值表、代价公式、时钟扫描、B-Tree 分裂与 32 位模运算 XID 回卷逐行重写，再由 `tools/crosscheck.cjs` 对照源码常数与标准测试向量逐项校验。本文由 AI 编写；每章末尾写明模型略去了什么。 {.note}

## 查询流水线：从 SQL 字符串到火山迭代器 {#ch1}

::: strings
toc: 查询流水线与火山模型
:::

PostgreSQL 并不直接“执行 SQL 文本”。每条语句必须穿过五个阶段，最终变成一棵以拉取模型（`ExecProcNode`）按行吐出元组的执行器树。 {.law}

想象点餐台后的流水线：顾客递进一张手写字条，前台先看字迹合不合法，再查菜单确认菜名和价格存在，展开套餐规则，厨师长评估灶台和备料选出最省时的做法，最后传菜员每次从锅里盛一勺。PostgreSQL 执行一条查询，走的就是这五步。

::: html ch1-code
code.aria: 贯穿全文的两条 SQL 示例与执行计划摘要
code: "SELECT id, name, balance\nFROM accounts\nWHERE tier = 'pro' AND balance > 1000\nORDER BY balance DESC LIMIT 20;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 42;"
:::

客户端通过前端/后端协议把文本发给后台进程（backend）后，先由 **Parser（解析器）** 经词法与 Bison 语法规则拆成原始语法树（`ParseStmt`），此时还不知道 `accounts` 表存不存在。接着 **Analyzer（分析器）** 去系统目录表（`pg_class`、`pg_attribute`）核对表名、列类型与权限，生成带完整语义的 `Query` 树。如果查询里引用了视图或规则，**Rewriter（重写器）** 会把它们展开替换。

真正决定快慢的是第四步 **Planner / Optimizer（规划器）**：同一条 `SELECT` 可以先扫索引再排序，也可以全表扫一遍走顶层 Top-N 堆排序；规划器按统计信息估算每条物理路径的代价，挑出总代价最低的一棵 `Plan` 树。最后交给 **Executor（执行器）**：自顶向下每次调用子节点的 `ExecProcNode()`，上一层要一行，下一层才算一行——这就是经典的 **Volcano（火山）迭代器模型**，因此 `LIMIT 20` 往往不用把整张表算完就能停手。

::: diagram dg-pipeline keys=dg.pipeline
cap: 图 1　一条 SQL 从文本到结果的五个阶段：前四步把文本编译成物理执行计划树，第五步按拉取模型逐行向上吐出元组。
aria: 示意图：解析器、分析器、重写器、规划器、执行器五层流水线，以及各层之间传递的数据结构
s1: Parser（解析器）
s1d: 词法与 Bison 语法检查
s2: Analyzer（分析器）
s2d: 查 pg_class / pg_attribute 目录
s3: Rewriter（重写器）
s3d: 展开视图与重写规则
s4: Planner（规划器）
s4d: costsize.c 比较并选最小代价计划
s5: Executor（执行器）
s5d: ExecProcNode 自顶向下逐行拉取
x1: 原始 ParseStmt 树
x2: 语义 Query 树
x3: 展开后 Query 树
x4: 物理 Plan 树（Volcano）
:::

这一章先画出整条流水线的骨架。下一章走进第四层规划器内部，看看它如何用直方图和 I/O 代价常数打分；第 3 到第 9 章则沿着执行器真正碰到的存储结构一路下探到 8 KiB 页、事务快照、缓冲区和 WAL 日志。 {.take}

## 代价优化器与统计信息：索引什么时候反而不如全表扫 {#ch2}

::: strings
toc: 代价优化器与统计信息
:::

优化器不是凭空偏爱索引；只要命中的行分散在过多页面里，随机跳着读几十次 8 KiB 页就会比顺序扫完一整张表更贵。 {.law}

快递员送 500 个包裹，如果收件人集中在同一栋写字楼，按楼号找人最快；但如果这 500 个包裹散落在全城 1,000 条街的 900 条里，挨家查地址再跑腿，还不如开货车沿着街道顺序扫过去。PostgreSQL 规划器每天都在算这笔账。

`ANALYZE` 采样的统计信息保存在 `pg_statistic`（视图 `pg_stats`）中，记录每列最常见值（MCV）、等频直方图与基数 `n_distinct`。`costsize.c` 用它估算过滤条件的选择率 $p$ 和返回行数，再乘上五组代价常数：`seq_page_cost`（默认 `1.0`）、`random_page_cost`（默认 `4.0`）、`cpu_tuple_cost`（`0.01`）、`cpu_index_tuple_cost`（`0.005`）和 `cpu_operator_cost`（`0.0025`）。

::: diagram dg-costpaths keys=dg.costpaths
cap: 图 2　三种扫描路径在 10 个 8 KiB 堆表页上的读取模式：顺序扫描一次读完，索引扫描按键值顺序随机跳页，位图堆扫描先收集页号再按物理页序读取。
aria: 示意图：顺序扫描、索引扫描与位图堆扫描在十个物理数据块上的访问顺序对比
seq: Sequential Scan
seqTag: seq_page_cost=1.0
idx: Index Scan
idxTag: random_page_cost=4.0
bmp: Bitmap Heap Scan
bmpTag: 先去重页号再顺序读
:::

在下面的模型里，一张 10,000 页（每页 40 行，共 400,000 行）的非聚簇表在默认 `random_page_cost = 4.0` 下：当选择率只有 `0.1%`（400 行）时，索引扫描总代价只需 {=ch2.idxLowCost}，远低于全表顺序扫描的 {=ch2.seqCost}；选择率升到 `5%` 时，纯索引扫描会被 Mackert–Lohman 缓存重读拖垮，**位图堆扫描（Bitmap Heap Scan）** 先在内存里把页号去重排序，代价压到 {=ch2.bmpMidCost}；而选择率跨过 **{=ch2.crossPct}** 后，全表顺序扫描反而成了赢家。把 `random_page_cost` 调低到 SSD 常见的 `1.1`，交叉点会推迟到 {=ch2.crossSsdPct}；如果再勾上“页面全部可见”，**仅索引扫描（Index-Only Scan）** 甚至不用回表读堆页。

::: lab ch2-model
model.title: 规划器代价交叉线：Seq Scan、Index Scan、Bitmap 与 Index-Only
model.how: 拖动"选择率"观察返回行数变大时四种计划的代价变化；拖动"随机读代价"模拟机械盘 (4.0) 与 NVMe SSD (1.1)；勾选"可见性映射全部可见"启用 Index-Only Scan。
ctl.sel: 查询选择率
ctl.rpc: 随机读代价 random_page_cost
ctl.vis: 可见性映射 (VM) 全部可见
cv.aria: 横轴为选择率百分比、纵轴为规划器估算总代价的四条曲线图，标记当前选择点与交叉阈值
cv.x: 选择率 (%)
cv.y: 估算总代价 (costsize.c 单位)
leg.seq: Seq Scan
leg.idx: Index Scan
leg.bmp: Bitmap Heap Scan
leg.ios: Index-Only Scan
read.win: 当前胜出计划
read.seq: Seq Scan 代价
read.bmp: Bitmap Heap 代价
read.idx: Index / IOS 代价
win.seq: Sequential Scan
win.index: Index Scan
win.bitmap: Bitmap Heap Scan
win.indexonly: Index-Only Scan
say.index: 在选择率 {sel}（约 {rows} 行）且 random_page_cost = {rpc} 时，<em>Index Scan</em> 胜出（代价 {cost}），因为命中的页数很少，不用构建位图也不用扫全表。
say.bitmap: 选择率升至 {sel} 后，<em>Bitmap Heap Scan</em> 胜出（代价 {cost}）：它先把命中页号（约 {dp} 页）去重排序再按物理块序读取，避开了 Index Scan 的反复随机跳页。Seq Scan 交叉点在 {cross}。
say.seq: 选择率达到 {sel} 已越过交叉阈值，<em>Sequential Scan</em> 以 {cost} 胜出：绝大多数页都要访问，直接按顺序扫完 10,000 页比随机寻道加位图更快。
say.indexonly: 勾选 VM 全部可见后，<em>Index-Only Scan</em>（代价 {cost}）完全跳过回表读堆页，只沿 B-Tree 叶子扫描即可返回所有结果。
:::

还有一个常见踩坑：规划器默认各列条件相互独立。假设表里 `city = 'Shanghai'` 和 `country = 'CN'` 各占 `10%`，独立相乘只会估算 `1%`（{=ch2.corrEst} 行），而实际两个条件高度相关、命中了 {=ch2.corrAct} 行——足足低估了 **{=ch2.corrRatio} 倍**，足以诱使优化器误选 Nested Loop 或小表索引而把执行器拖慢几十倍。用 `CREATE STATISTICS` 建多列扩展统计才能修掉这个偏差。

模型省掉了：多表连接基数、并行扫描工人分配（`max_parallel_workers_per_gather`）与物理聚簇度（`correlation`）对线性顺序读的折算。这里的代价单位是 `costsize.c` 的相对开销，而非具体毫秒数。 {.take}

## 8 KiB 分槽页与 HOT 更新：为什么改一行不原地覆盖 {#ch3}

::: strings
toc: 8 KiB 分槽页与 HOT 更新
:::

PostgreSQL 把表和索引都切成 8,192 字节的分槽页：行指针从头往下长，行数据从尾往上长；`UPDATE` 从不擦掉旧行，而是在空白区追加一条新版本，只有新旧版本同页且没改索引列时才能走 HOT 省掉索引写入。 {.law}

往一页空白笔记本上记账时，如果发现上一笔金额写错了，直接拿涂改液盖掉原数字会让正在对账的同事看乱；稳妥的做法是划掉旧行并在本页留白处新写一行，让旧行箭头指向新行。PostgreSQL 的堆表页（Heap Page）正是这套分槽布局（Slotted Page）。

每个数据块固定 `BLCKSZ = {=ch3.blcksz}` 字节（`pg_config_manual.h`）。最开头是固定 **{=ch3.pageHdr} 字节**的 `PageHeaderData`（`bufpage.h`）：8 字节 `pd_lsn`、2 字节校验和、2 字节标志位、指向行指针末端的 `pd_lower`、指向元组起始位置的 `pd_upper`、指向页尾特殊区的 `pd_special`（普通堆表等于 `8192`）、页版本与 `pd_prune_xid`。紧接着偏移 `24` 往下增长每个 **{=ch3.itemSz} 字节**的 `ItemIdData` 行指针；每一行数据则自带 **{=ch3.tupFixed} 字节**固定头（加 1 字节对齐后 `t_hoff = {=ch3.tupAlign}` 字节，`htup_details.h`）加上 8 字节对齐后的列载荷，从页尾往上堆叠。

::: diagram dg-pagelayout keys=dg.pagelayout
cap: 图 3　一个 8,192 字节堆表页的内部字节分布：24 B 页头之后，4 B 行指针朝高地址方向生长，行元组从页尾朝低地址方向生长，中间是空闲空间。
aria: 示意图：8192 字节分槽页结构，包含 24 字节页头、ItemId 行指针区、空闲区以及向上生长的元组数据区
top: PageHeaderData (24 B)
hdr: lsn · flags · lower · upper
items: ItemIdData (每槽 4 B)
lower: → pd_lower
free: 空闲空间 = pd_upper − pd_lower
tuples: HeapTuple (头 24 B + 载荷)
hot: t_ctid 可在同页串成 HOT 链
upper: ← pd_upper
special: pd_special: 堆表=8192 / B-Tree=8176
:::

为什么要关心页内还剩多少空隙？如果一张表建表时留了余量（例如 `fillfactor = 80`），前 3 次插入后又在同一页更新 2 次，此时页内仍剩 {=ch3.defFree} 字节可用空间。在没有改动任何索引列的前提下，PostgreSQL 执行 **HOT（Heap-Only Tuple）更新**：旧元组只把 `t_ctid` 指向页内的新槽位并打上 `HEAP_HOT_UPDATED`，整张表上的所有 B-Tree 索引一条记录都不用追加——上面 3 次插入加 2 次更新总共只产生 **{=ch3.defIdxWrites} 次**索引写入。可一旦改动了索引列，或者页被塞满被迫跨页写到新页面，哪怕只改 1 个字节，索引也必须再加一条记录（同样操作升到 {=ch3.idxChangedWrites} 次甚至更多）。

::: lab ch3-model
model.title: 8,192 字节分槽页模拟器：观察 pd_lower、pd_upper 与 HOT 链
model.how: 点击"插入新行"或"更新最后一行"观察行指针与元组从两端相向生长；调低 fillfactor 或增大载荷字节看页何时装满溢出；勾选"更新了索引列"对比非 HOT 更新如何迫使索引追加写入。
ctl.ins: 插入新行
ctl.upd: 更新行
ctl.rst: 重置页面
ctl.ff: 填充因子 fillfactor
ctl.pay: 单行载荷 (B)
ctl.idx: 更新了索引列
cv.aria: 8192 字节页面内存条与槽位连接图，金色为页头、青色为存活元组、红色为旧版本与 HOT 箭头
leg.hdr: 24 B 页头与行指针
leg.live: 存活元组 (LIVE)
leg.dead: 旧版本 (DEAD / HOT 链)
read.ptr: pd_lower / pd_upper
read.free: 页内剩余字节
read.hot: 同页 HOT 更新数
read.idx: 累计索引写入次数
say.hot: 当前共触发 <em>{hot} 次同页 HOT 更新</em>，页内还剩 {free} B 空间，索引只写了 {idx} 次——因为旧行的 <code>t_ctid</code> 就在本页内接力指向新版本。
say.indexed: 虽然新旧版本还在同一页内（剩 {free} B），但你修改了索引列，PostgreSQL 无法走 HOT，被迫额外写入了索引（累计 <em>{idx} 次</em>）。
say.full: 空闲字节不足以容纳新元组，更新被迫跨页写到下一块 8 KiB 页，HOT 链断开并触发新的索引写入（累计 <em>{idx} 次</em>，溢出 {off} 次）。
:::

模型省掉了：页内行指针修剪（HOT pruning）与变长字段超过 ~2 KiB 时的 TOAST 切片外存。`PageHeaderData` 的 24 字节头打包与 `ItemIdData` 位域已在 `tools/crosscheck.cjs` 按小端序逐字节核对。 {.take}

## MVCC 与快照可见性：为什么读永远不阻塞写 {#ch4}

::: strings
toc: MVCC 与快照可见性
:::

每一行元组都带着生它的事务编号 `xmin` 和退休它的事务编号 `xmax`；查询只在开始时拍一张轻量快照 `{xmin, xmax, xip[]}`，只靠几个整数比较就决定某行可见与否——因此读写互不加锁。 {.law}

图书馆如果规定“只要有人在看第 42 页，管理员就不能往第 42 页写修订”，读者和编辑就会互相卡死。PostgreSQL 的**多版本并发控制（MVCC）**做法完全相反：上一章我们刚看到 `UPDATE` 会把旧版本留在页里；这一章看读事务如何判断众多版本里哪一条属于自己。

每个元组头（`htup_details.h`）带两个 32 位事务编号：`t_xmin` 是插入该版本的事务 ID，`t_xmax` 是更新或删除它的事务 ID（活行时为 `0`）。当一个查询需要读表时，`GetSnapshotData()`（`procarray.c`）扫描内存里的活跃事务数组，只记下三件事：当前最小未完成事务 `snap.xmin`、即将分配的下一个未来事务 `snap.xmax`，以及此刻正在跑的并发事务集合 `snap.xip[]`。

::: diagram dg-mvtline keys=dg.mvtline
cap: 图 4　SnapshotData 只记录三个边界：xmin 以下早已提交，xmax 及以上尚未开始，落在区间里的要对照 xip[] 排除当时仍在运行中的事务。
aria: 示意图：并发事务 T100 到 T103 的时间线，以及读事务在中间时刻拍摄的 xmin、xmax、xip 快照窗口
sxmin: snap.xmin=101
sxmax: snap.xmax=104
t100: T100 已提交
t100s: xmin < 101 → 可见
t101: T101 读事务
t101s: 持有快照
t102: T102 写中→提交
t102s: 在 xip[] 内则不可见
t103: T103 最终回滚
t103s: 回滚即死行
rule: 可见条件：xmin 已生效且 xmax 未生效
:::

于是 `HeapTupleSatisfiesMVCC` 只做纯布尔判断：`t_xmin` 必须已提交，且满足 `t_xmin &lt; snap.xmin` 或（`t_xmin &lt; snap.xmax` 且不在 `snap.xip[]` 中）；同时如果 `t_xmax` 非零，它不能对同一张快照可见。读完一行若确认已提交，PostgreSQL 顺手把 `t_infomask` 的 **Hint Bits**（例如 `HEAP_XMIN_COMMITTED`）置位，以后别的查询连 `pg_xact` 提交日志都不用再查。

在下方实验室切换隔离级别与时间步：在默认的 **`READ COMMITTED`（读已提交）** 下，读事务 T101 每执行一条新语句就重拍一次快照，因此第 2 步看到 T102 刚提交的余额变成 **`{=ch4.rcVal}`**；切换到 **`REPEATABLE READ`（可重复读）**，T101 从头到尾复用第 1 步拍下的那张快照，就算 T102 已经提交、T103 回滚、T104 又在修改，第 2 步和第 3 步依然稳稳看到最初的 **`{=ch4.rrVal}`**。

::: lab ch4-model
model.title: MVCC 快照与隔离级别实验室
model.how: 拖动"读事务内部时间步"观察并发事务 T102 提交、T103 回滚、T104 新开写入的过程；切换 READ COMMITTED 与 REPEATABLE READ，看四行版本各自为何可见或不可见。
ctl.iso: 隔离级别
iso.rc: READ COMMITTED
iso.rr: REPEATABLE READ
ctl.step: 读事务 T101 执行步数
cv.aria: T100 至 T104 事务时间线与 T101 当前快照窗口 [xmin, xmax) 及 xip 排除集合
col.ver: 版本 (余额)
col.xmin: t_xmin
col.xmax: t_xmax
col.vis: 可见?
col.why: HeapTupleSatisfiesMVCC 判定原因
read.snap: 当前快照 [xmin, xmax)
read.xip: 快照活跃集合 xip[]
read.val: T101 读到的余额
st.yes: 可见
st.no: 不可见
why.live_no_xmax: xmin 早于快照且无 xmax
why.xmax_in_progress_still_live: xmax 在 xip[] 内且未提交，旧行仍活
why.xmax_after_snap_still_live: xmax 在快照后才完成，对此快照旧行仍活
why.xmax_aborted_still_live: xmax 事务已回滚，删除无效
why.deleted_by_visible_xmax: xmax 已提交且对本快照可见，旧行已退休
why.xmin_in_progress: xmin 仍在运行（在 xip[] 内），不可见
why.xmin_aborted: xmin 事务已回滚，出生即无效
why.xmin_after_snap: xmin 在本快照之后，不可见
why.not_created_yet: 此时该版本尚未创建
say.rc: 在 <em>READ COMMITTED</em> 第 {step} 步，T101 重新获取了快照 [{xmin}, {xmax})，因此可见余额变为 <em>{val}</em>（版本 {ver}）。T103 的回滚行与 T104 的未提交写入均被自动屏蔽。
say.rr: 在 <em>REPEATABLE READ</em> 第 {step} 步，T101 仍复用第 1 步冻结的快照 [{xmin}, {xmax})，不管外面 T102 是否已提交，T101 读到的始终是 <em>{val}</em>（版本 {ver}）。
:::

模型省掉了：同一事务内部通过 `t_cid`（CommandId）看到自己前一条语句写入的元组，以及 `SERIALIZABLE` 下的谓词锁（SIREAD）冲突检测。另外，`REPEATABLE READ` 下如果试图 `UPDATE` 一个已被并发提交改过的行，PostgreSQL 会主动报序列化冲突错，不会静默覆盖。 {.take}

## VACUUM、FREEZE 与 32 位 XID 回卷：不清理为什么会停库 {#ch5}

::: strings
toc: VACUUM 与 32 位 XID 回卷
:::

事务 ID 是模 2³² 循环的 32 位整数，圆环前一半（2³¹）算“未来”，后一半（2³¹ − 1）算“过去”；一条活行如果超过二十亿次事务还没被 `FREEZE` 钉成永久可见，就会瞬间翻成“来自未来的行”而从数据库里隐身。 {.law}

既不原地覆盖旧行，又要求读操作永远不用等写操作，代价就是旧版本和老事务编号会越积越多。`VACUUM` 干两件截然不同却同样救命的事：第一件是**回收空间与更新可见性映射（Visibility Map）**，第二件是**冻结古老事务 ID 防止 32 位时钟回卷**。

表里堆满已死亡的旧元组（Dead Tuples）不仅白占磁盘和共享缓冲区，还会让索引越扫越慢。后台 `AUTOVACUUM` 工人进程在线扫描页面，把已经对所有活跃快照都死掉的元组标为可复用，清理指向它们的死索引指针，并在页面全页只剩活行时把 **Visibility Map（VM）** 对应的两位标志里的 `all-visible` 置 1——还记得第 2 章那个不用回表的 **Index-Only Scan** 吗？它之所以敢跳过堆表读，全靠 VM 的这 1 个比特！

但比表膨胀更致命的是 **32 位 XID 回卷（Wraparound）**。`TransactionId` 只有 32 位（约 42.9 亿个号），像一块环形表盘。`varsup.c` / `transam.c` 用带符号差值 `((int32)(id1 - id2)) &lt; 0` 比较谁早谁晚：也就是说，对当前事务 `CurrentXID` 而言，逆时针背后 **{=ch5.halfLimitM} 百万**（`2³¹ − 1`）个编号算过去，顺时针前面另外半圈算未来。如果不做处理，一条在 XID = 100 万时插入的古老数据，等库跑过 21.48 亿次事务后，差值就会溢出变正，瞬间变成“未来才创建的不可见行”！为此 PostgreSQL 默认在最老未冻结年龄达到 **`autovacuum_freeze_max_age` = {=ch5.freezeAgeM}M** 时强行拉起反回卷 VACUUM，把古老活行打上 `HEAP_XMIN_FROZEN`（永远对所有快照可见），而在逼近 **{=ch5.stopAgeM}M** 危险边界（`xidStopLimit`）前若仍未冻结，数据库会宁可拒绝一切新写事务也要保住数据不丢。

::: diagram dg-xidcircle keys=dg.xidcircle
cap: 图 5　32 位事务 ID 环形表盘（模 2³²）：逆时针半圈（2³¹ − 1）被视作过去，超过此距离的未冻结活行会越过底线翻进红色未来区。
aria: 示意图：32 位 XID 圆环，顶部为当前 XID，左侧绿色半圈为过去，右侧红色半圈为未来，标注 200M 强制冻结线与 2^31 回卷边界
now: CurrentXID
freeze: 200M 冻结线
half: ±2³¹ (~21.47 亿) 边界
past: 过去 (可见)
future: 未来 (不可见)
frozen: VACUUM FREEZE 永久钉牢活行
:::

在下方模型里拖动“已流逝事务数”，对比关闭清理、常规 `AUTOVACUUM`（到 200M 自动抢修冻结）和积极冻结三种状态：当清理被长事务卡死或关闭，250M 时即越过 `200M` 警告线，2,145M 触发 `xidStopLimit` 停写，2,200M 整张表彻底翻进回卷禁区。

::: lab ch5-model
model.title: 表膨胀、可见性映射与 32 位 XID 回卷时钟
model.how: 切换"VACUUM 策略"，向右拖动"已流逝事务数 (百万 XID)"，上方看死元组占比与 VM 全可见比例的变化，下方看 XID 在 2³² 环形表盘上的年龄距离。
ctl.vac: 清理策略
vac.off: 关闭 VACUUM
vac.normal: 常规 AUTOVACUUM
vac.freeze: 积极 FREEZE
ctl.ep: 已流逝事务数 (M)
cv.aria: 上方为死元组占比与 VM 比例曲线，下方为 32 位 XID 回卷环形时钟图
cv.past: 过去
cv.future: 未来
read.age: 最老未冻结年龄
read.dead: 死元组膨胀率
read.vm: VM 全可见页比例
read.st: 数据库健康状态
st.healthy: 正常服务
st.antiwrap: 触发强制反回卷清理
st.stoplimit: 拒绝写事务 (xidStopLimit)
st.wrapped: 已越过 2³¹ 回卷禁区!
say.healthy: 最老未冻结 XID 年龄为 {age}M，远低于 200M 警戒线；死元组占比 {dead}%，可见性映射（VM）覆盖 {vm}% 页面，Index-Only Scan 可以高效跳过堆表。
say.antiwrap: 最老未冻结 XID 年龄已达 <em>{age}M</em>（超过 autovacuum_freeze_max_age = 200M），PostgreSQL 会强行启动反回卷 VACUUM；同时 VM 降到 {vm}%，Index-Only Scan 被迫大量回表。
say.stoplimit: 警报！年龄已冲到 <em>{age}M</em>，距离 2³¹ 回卷极限不足 300 万事务！PostgreSQL 进入 <code>xidStopLimit</code> 状态，拒绝一切新写事务，必须单用户或手动 VACUUM FREEZE。
say.wrapped: 灾难回卷：<code>int32(oldest - current)</code> 符号翻转，模算术把 {age}M 前的旧活行误判成“未来事务”，整张表的历史行从正常快照中凭空消失！
:::

模型省掉了：单个长事务（idle in transaction）把全库全局 `RecentXmin` 钉死导致 `VACUUM` 跑了却一条也删不掉的现实场景，以及 PostgreSQL 14+ 的紧急模式跳过索引清理与多事务 ID（`MultiXactId`）回卷。 {.take}

## 共享缓冲区与时钟扫描：PostgreSQL 与 OS 的双缓冲 {#ch6}

::: strings
toc: 共享缓冲区与时钟扫描
:::

PostgreSQL 在自己的 `shared_buffers` 里用无全局锁的时钟扫描（`usage_count` 0 到 5）管理 8 KiB 热页，同时仍绕过或穿过操作系统的 Page Cache——但如果不给全表扫描配环形缓冲区，一次大扫就会把热页全部洗出内存。 {.law}

既然磁盘慢几个数量级，数据库当然要在内存里做缓存池。默认 `shared_buffers` 把 8,192 字节页装进一组固定槽位，并用 **时钟扫描（Clock Sweep）** 算法（`src/backend/storage/buffer/freelist.c`）代替传统 LRU 链表：高并发下每次访问都要挪动全局 LRU 链表头指针会引发严重自旋锁竞争，而时钟扫描只给每个槽位记一个 `0` 到 `5`（`BM_MAX_USAGE_COUNT`）的轻量使用计数 `usage_count`。每次命中就给计数 `+1`（封顶 5）；需要腾出空闲槽位时，时钟指针扫过缓冲区，每路过一个槽位就把它的 `usage_count` 减 1，直到遇到第一个没有被固定（`pin = 0`）且 `usage_count == 0` 的槽位直接驱逐替换。

::: diagram dg-doublebuf keys=dg.doublebuf
cap: 图 6　PostgreSQL 的双缓冲结构：正常页从磁盘先后经过 OS Page Cache 与 shared_buffers 缓存池；大表顺序扫描改走 256 KiB 环形缓冲区，避免冲刷掉热页。
aria: 示意图：从磁盘存储经 OS Page Cache、shared_buffers 时钟池或 256 KiB 环形缓冲区到达执行器的数据通路
exec: Executor 后端进程
sb: shared_buffers 池
clock: Clock Sweep (usage 0..5)
ring: BulkRead 环形区
os: OS Page Cache（操作系统页缓存）
osSub: 内核异步写缓冲与冷页缓存
disk: 物理 NVMe / SSD 存储
:::

不过普通时钟扫描有一个经典漏洞：如果突然来了一条全表顺序扫描，一次性读入几万个冷页，时钟指针转上两三圈就会把核心业务的热页 `usage_count` 全部减到 `0` 并踢出门外（缓存污染）。为此 PostgreSQL 专门给大扫和 `VACUUM` 配了 **环形缓冲区（Buffer Access Strategy）**：顺序大扫默认只借用 **{=ch6.ringFrames} 个槽位（{=ch6.ringKiB} KiB 的 `BAS_BULKREAD`）** 在环内自己替换自己。看看下面模型里的第 36 步对比：没有环形区保护时，大扫之后紧接着回来的 4 次热页访问命中率直接跌到 **{=ch6.unprotPost}**；打开 `BAS_BULKREAD` 环形区后，大扫后再查热页全部命中（**{=ch6.ringPost}**）！

::: lab ch6-model
model.title: shared_buffers 时钟扫描与环形缓冲区保护
model.how: 切换工作负载对比"纯热页"、"无保护顺序大扫"和"BAS_BULKREAD 环形缓冲区保护"；拖动步数滑杆回放时钟指针扫过各槽位、扣减 usage_count 与驱逐热页的瞬间。
ctl.wl: 访问负载
wl.oltp: 纯热页 OLTP
wl.unprot: 热页 + 无保护大扫
wl.ring: 热页 + 环形缓冲区
ctl.step: 访问步数
ctl.fr: 缓冲槽位数
cv.aria: shared_buffers 环形槽位时钟图，显示每个槽位当前页号、usage_count (0..5)、环形区标记与时钟指针位置
read.hit: 累计缓存命中率
read.post: 扫表后热页命中
read.evict: 累计驱逐次数
read.hand: 时钟指针位置
say.oltp: 纯热页负载反复命中 H1–H4，<code>usage_count</code> 稳步升至上限 5，总命中率 <em>{hit}</em>，没有任何页面被驱逐。
say.unprot: 24 个顺序扫表页直接闯入主时钟池，把热页的 <code>usage_count</code> 一路减到 0 并全部踢出！扫表刚结束后的热页访问只命中 <em>{post}</em>。
say.ring: 开启 <code>BAS_BULKREAD</code> 后，顺序扫表页被限制在右上角的紫色环形槽位里自己循环淘汰，主池里的 4 个热页完好无损，扫表后热页命中率保住 <em>{post}</em>。
:::

另外注意图 6 底部那一层：在 `shared_buffers` 和磁盘之间还横着一层操作系统的 **OS Page Cache**（[[how-the-os-talks-to-hardware]]），导致同一份 8 KiB 热页同时在两处各占一份内存——这正是 PostgreSQL 社区常建议把 `shared_buffers` 设在物理内存 25% 左右而不是 80% 的原因，剩余内存要留给 OS 缓存写缓冲与不常进主池的冷页。模型省掉了脏页刷盘标记与后台写进程（Background Writer）。 {.take}

## B-Tree 索引（Lehman & Yao）：并发不加锁的秘诀与页分裂代价 {#ch7}

::: strings
toc: B-Tree 索引与并发页分裂
:::

PostgreSQL 的默认 B-Tree（`nbtree`）在每个页尾存了上界高键（High Key）和右兄弟指针；读者下探时随时放开父页锁，就算子页刚巧在脚下分裂，比对高键后顺着右链横移一步就能接着找——但随机主键会让页平均只装六七成满并倍增写放大。 {.law}

传统教科书 B-Tree 的最大麻烦在于并发：一个写入线程把叶子页装满要一分为二并往上更新父节点，要是读线程正在顺着旧父指针往下走，难道整棵树上层都要加锁拦着读者？PostgreSQL 沿用 **Lehman & Yao（1981）B-link 树** 改写了游戏规则。

每一个 B-Tree 索引页都在页尾 `pd_special` 里划出 **{=ch7.btOpaque} 字节**存放 `BTPageOpaqueData`（`nbtree.h`），记录左右兄弟块号 `btpo_prev` / `btpo_next`、树层级与标志位；除最右端页面外，每个页第一条槽位 `P_HIKEY` 存着本页允许的最大上界（High Key）。这样一来，读线程离开父页时立刻释放父页锁（Latch）；如果中途某个并发写入把子页劈成左右两半、把大键搬去了右兄弟并缩紧了左页的 High Key，读线程抵达左页后只要发现 `查找键 &gt;= P_HIKEY`，就能原地顺着 `btpo_next` 指针**向右跳一页**，一次重试都不用回退到根节点！

::: diagram dg-nbtreesplit keys=dg.nbtreesplit
cap: 图 7　Lehman &amp; Yao 并发分裂：左页分裂出右兄弟后更新自己的 High Key 并连上 btpo_next；拿着旧父指针落到左页的读者只需向右跨一步即可找到目标键。
aria: 示意图：父页指向已分裂的左叶页，左叶页标注 HIKEY 并通过 btpo_next 箭头连向右叶页
parent: 父页（旧下行指针）
p1: 左叶页 P1
hikey: HIKEY = 30
p2: 新右叶页 P2
inf: 右端无上界
next: btpo_next
walk: 若 key ≥ 30 → 沿 btpo_next 右移一步
opaque: 尾区 BTPageOpaqueData = 16 B
:::

但这种自由分裂是有空间代价的。对比下面两种键写入顺序：如果主键单调递增（如自增序列或 PostgreSQL 18 新增的 `uuidv7()`），`nbtsplitloc.c` 的最右页追加分裂策略会把旧页塞满再切出新页，24 个键只用 **{=ch7.seqLeaves} 个叶页**、填充率高达 **{=ch7.seqFill}**；换作随机散列的 UUIDv4，新键不断打散进中间旧页，提前劈出 **{=ch7.randLeaves} 个叶页**、平均填充率掉到 **{=ch7.randFill}**——大规模索引下随机键长期停在 50%–70% 填充率，不仅索引体积几乎翻倍，还会让随机 I/O 和缓冲驱逐成倍恶化。

::: lab ch7-model
model.title: nbtree 写入顺序、页分裂与 High-Key 右移跳数
model.how: 切换"自增/UUIDv7 顺序插入"与"UUIDv4 随机插入"，拖动插入键数量观察叶页数量、分裂次数与填充率差距；勾选"模拟并发分裂"看读者如何利用 HIKEY 和 btpo_next 右跳。
ctl.ord: 主键到达顺序
ord.seq: 顺序 (自增 / UUIDv7)
ord.rand: 随机 (UUIDv4)
ctl.cnt: 插入键数量
ctl.split: 模拟并发分裂读
cv.aria: 两层 B-Tree 叶页链接图，显示每页装入键值、HIKEY 上界、btpo_next 右链箭头与读者跳页路径
cv.stat: 平均填充率 {fill}% · 累计分裂 {splits} 次
read.leaves: 叶子页数量
read.splits: 累计页分裂次数
read.fill: 平均页填充率
read.hops: 右链跳步次数
say.seq: 顺序追加让最右分裂把旧页几乎填满，{cnt} 个键只占 {leaves} 页（分裂 {splits} 次，填充率 <em>{fill}%</em>）。
say.rand: 随机键不断击穿中间页引发 {splits} 次分裂，共占 {leaves} 页、平均填充率降至 <em>{fill}%</em>——索引膨胀直接稀释了 shared_buffers 缓存效率。
say.hop: 开启并发分裂时，读者带着旧父指针落到刚分裂完的页面上，比对 <code>P_HIKEY</code> 后顺着 <code>btpo_next</code> 安全向右跳了 <em>{hops} 步</em> 找到目标键。
:::

模型省掉了：页内相同键值去重（PostgreSQL 13+ deduplication）与 `VACUUM` 删空页时的 `BTP_HALF_DEAD` 两阶段摘除状态。生产上往索引里多 `INCLUDE` 一两个查询列组成覆盖索引，就能配合第 5 章的 VM 标志触发更快的 Index-Only Scan。 {.take}

## 连接算法与工作内存：`work_mem` 溢出磁盘那一刻发生了什么 {#ch8}

::: strings
toc: 连接算法与 work_mem 溢出
:::

两张表做连接时，执行器要在 Nested Loop、Merge Join 和 Hash Join 之间选路；一旦哈希连接要建表的尺寸越过 `work_mem`，PostgreSQL 就按 Grace Hash 把桶拆成多批临时文件写进 `pgsql_tmp` 落盘重读。 {.law}

把 80,000 张订单和 400,000 条账户记录按 `account_id` 拼在一起，先想好拿哪张表建索引表：Nested Loop 每拿一条左表行就去右表里查一遍（如果右表正好有 B-Tree 索引且左表只有几十行，这最省事，否则是 $O(N \cdot M)$ 灾难）；Merge Join 先把两边都排好序再拉链式扫一遍（如果本来就有索引序，甚至免去排序）；而面对两个没排序的大表，**Hash Join** 往往最快——挑小一点的表在内存建起哈希表，大表流式扫过一次就能逐行匹配。

关键瓶颈在于**每个哈希或排序算子独享的 `work_mem` 上限（默认只有 `4 MiB`）**。注意这是**按算子、不是按连接**算的：一条复杂查询如果有 3 个 Hash Join 和 2 个 Sort，就可能同时申请 5 份 `work_mem`；100 个并发连接就能吃掉几百倍内存。为了保住进程不 OOM，`nodeHash.c` 会在预估哈希表尺寸超过 `work_mem` 时触发 **Multi-Batch Grace Hash Join**：把哈希空间切成 $2, 4, 8 \dots$ 个批次（`nbatch` 总是 2 的幂），内存里只保留第 0 批，其余批次连同大表的探测流一起刷进磁盘临时目录 `base/pgsql_tmp/`，等第 0 批处理完再一批批读回内存完成匹配。

::: diagram dg-joinspill keys=dg.joinspill
cap: 图 8　work_mem 临界点前后：1 批内存哈希连接只需流式读一遍大表；一旦越过 work_mem，多批 Grace Hash 被迫先把两张表按桶写入临时文件再读回。
aria: 示意图：上半部分展示 1 批纯内存哈希连接，下半部分展示超出 work_mem 后拆成 Batch 0 留内存、Batch 1..k 落盘 pgsql_tmp
inMem: 未超 work_mem（nbatch = 1）
ramBox: 整张小表哈希表驻留 RAM
ramSub: 大表流式探测一次即结束
spill: 超出 work_mem（nbatch = 2, 4, ...）
b0: Batch 0 留内存
b0Sub: 仅匹配第 0 批
bDisk: pgsql_tmp
bDiskSub: Batch 1..k 落盘重读
note: 调大 work_mem 消除落盘（按算子计）
:::

在下方模型里，80,000 行建表数据需要 **{=ch8.hashSizeMiB} MiB** 哈希空间。保持默认的 `work_mem = 4 MiB` 时，哈希连接被迫拆成 **{=ch8.hash4Batch} 批**，额外向临时磁盘读写 **{=ch8.hash4Spill} MiB**；把 `work_mem` 拉高到 `16 MiB` 跨过这个台阶，批次数立刻掉回 **{=ch8.hash16Batch}**，临时文件归零。

::: lab ch8-model
model.title: 三种连接策略代价与 work_mem 溢出悬崖
model.how: 拖动"work_mem (MiB)"滑杆看哈希连接在跨越 8 MiB、16 MiB 台阶时临时盘读写归零的代价跳水；调整"外表行数"并勾选"内表有索引"观察 Nested Loop 何时反超。
ctl.wm: 算子内存 work_mem (MiB)
ctl.out: 外表/建表行数
ctl.idx: 内表有 B-Tree 索引
cv.aria: 横轴为三种连接算法或 work_mem 变化、纵轴为估算代价与溢出批数的对比图
leg.hash: Hash Join
leg.merge: Merge Join
leg.nest: Nested Loop
read.win: 胜出连接方式
read.mem: 建表哈希所需内存
read.bat: Hash 批次数 nbatch
read.spill: 临时盘写入量
join.hash: Hash Join
join.merge: Merge Join
join.nest: Nested Loop
say.inmem: 当前哈希表需 {mem}，小于 work_mem = {wm} MiB：Hash Join 只用 <em>1 批（全内存）</em>，胜出且没有任何临时文件写入。
say.spill: 哈希表（{mem}）已超出 work_mem = {wm} MiB！Hash Join 被迫拆成 <em>{bat} 批</em>，向 <code>pgsql_tmp</code> 读写 <em>{spill} MiB</em> 临时数据；调大当前会话的 work_mem 可瞬间消除这笔磁盘开销。
say.nestwin: 当外表只有 {rows} 行且内表存在索引时，<em>Nested Loop</em> 直接走索引点查胜出，省去了读整张大表和建哈希表的开销。
:::

模型省掉了：并行哈希（Parallel Shared Hash）在多进程间共享哈希表与高度倾斜键（Skew）触发的动态批增倍逻辑。另外，`CREATE INDEX` 和 `VACUUM` 看的是 `maintenance_work_mem`，而不是 `work_mem`。 {.take}

## WAL 预写日志、LSN 与全页写：断电时 8 KiB 页撕裂怎么救 {#ch9}

::: strings
toc: WAL 与全页写防页撕裂
:::

修改发生时，8 KiB 数据页可以先留在共享缓冲区里慢慢刷，但描述这次改动的顺序日志（WAL）必须先刷盘 `COMMIT` 才算成功；而且每个检查点后第一次改任何一页，都必须把整整 8 KiB 原像写进日志，才能在断电撕裂半页时救回现场。 {.law}

如果每次 `UPDATE` 都要把散落在表和索引里的十几个 8 KiB 随机块立刻刷进硬盘，机械盘和普通 SSD 早就卡死了（参见 [[what-a-drive-is-made-of]]）。PostgreSQL 采用经典**预写日志（Write-Ahead Logging, WAL）**：只要把改动顺序追加到 `pg_wal/` 目录下每段 **{=ch9.walSegMiB} MiB** 的日志文件里并 `fsync` 落盘，每条记录打上 64 位递增偏移 **`XLogRecPtr`（LSN）** 和 **Castagnoli CRC-32C** 校验码（`pg_crc32c_sb8.c`，标准 `"123456789"` 向量输出 `{=ch9.crcTest}`），事务就可以放心返回提交成功——脏页留在 `shared_buffers` 里留给后台慢慢写回数据文件。

可一旦断电呢？这就撞上了硬件层的 **8 KiB 页撕裂（Torn Page）**：操作系统文件系统块与存储扇区通常是 4 KiB 或 512 B（[[what-a-drive-is-made-of]]）。如果后台正在刷一块 8 KiB 数据页，刚写完前 4 KiB 突然断电，磁盘上就留下一半是新字节、一半是旧字节的残废块！崩溃恢复时如果只有几十字节的增量日志（Delta），拿它往半新半旧的残废页上重放只会算出一锅乱码。PostgreSQL 的解法叫 **全页写（`full_page_writes = on`）**：每次 Checkpoint（检查点）之后，**只要某个页面第一次被修改，WAL 里先原封不动塞进整整一帧 8 KiB 页面镜像（FPW）**；同一检查点周期里后续对同一页的修改，才退回几十字节的紧凑增量。恢复时只要先用 FPW 整页覆盖掉撕裂块，再按 LSN 顺序重放后续增量即可完美复原。

::: diagram dg-walfpw keys=dg.walfpw
cap: 图 9　8 KiB 页撕裂与全页写恢复：断电导致磁盘上前后两个 4 KiB 扇区新旧混合，WAL 检查点后的首条 FPW 整页镜像能在重放增量前先覆写残块。
aria: 示意图：左侧磁盘 8 KiB 数据块在 4 KiB 边界断电撕裂，右侧 WAL 日志先存 FPW 整页镜像再接紧凑增量记录，底部恢复出完整数据页
diskTitle: 磁盘上被撕裂的 8 KiB 页
sec1: 前 4 KiB（新）
sec2: 后 4 KiB（旧）
walTitle: WAL 日志流
fpw: FPW 整页 (8 KiB)
delta: 76 B 紧凑增量
fix1: 崩溃恢复：先用 FPW 整页覆盖撕裂页
fix2: 再按 LSN 重放后续增量 → CRC-32C 校验通过
:::

代价也一目了然：如果业务是随机分散修改 8,000 个冷页、又把 `checkpoint_timeout` 设得很短（默认 5 分钟），检查点刚过不久几乎每次更新都在写整整 8 KiB 的 FPW——下面模型里，5 分钟窗口随机写下 FPW 居然占走 WAL 总流量的 **{=ch9.randFpwPct}**，而在集中在少数热页上的更新里只占 **{=ch9.seqFpwPct}**。拉长 `checkpoint_timeout` 能砍掉大量 FPW 写放大，但代价是崩溃后需要重放更长一段 WAL，恢复时间跟着拉长。

::: lab ch9-model
model.title: WAL 全页写写放大与崩溃恢复时间权衡
model.how: 拖动"checkpoint_timeout (分钟)"观察恢复耗时与 WAL 写速率的反比拉锯；切换"分散随机更新"与"热点集中更新"看 FPW 占比如何剧变；取消勾选 full_page_writes 观察断电撕裂的 CRC-32C 校验后果。
ctl.wl: 写入页分布
wl.rand: 分散随机页更新
wl.seq: 集中热页更新
ctl.ckpt: 检查点间隔 checkpoint_timeout
ctl.fpw: 开启全页写 full_page_writes
cv.aria: 横轴为 checkpoint_timeout 分钟数、纵轴为 WAL 写放大流量与崩溃恢复秒数的双曲线权衡图
cv.x: checkpoint_timeout (分钟)
cv.y: WAL 速率 (MiB/s) / 恢复秒数
leg.wal: WAL 写入速率 (MiB/s)
leg.rec: 崩溃恢复耗时 (s)
read.wal: WAL 总写入速率
read.fpw: FPW 占 WAL 比例
read.rec: 预计崩溃恢复耗时
read.torn: 8 KiB 半页撕裂校验
torn.ok: FPW 整页覆盖 · 安全
torn.bad: CRC-32C 错配! 块损坏
say.safe: <code>full_page_writes = on</code> 下，{ckpt} 分钟间隔在 {wl} 模式里产生 <em>{rate} MiB/s</em> WAL（其中 FPW 整页镜像占 {fpw}%），平均崩溃恢复约 <em>{rec} 秒</em>；遇到 4 KiB 断电撕裂可先覆写整页再重放，校验值 {crc} 完整还原。
say.unsafe: 注意！关闭 <code>full_page_writes</code> 虽把 WAL 压到了 {rate} MiB/s，但一旦刷盘中途断电留下 4 KiB 半新半旧块，CRC-32C（变为 {tornCrc} ≠ {crc}）立刻报错且没有整页镜像可救，除非底层硬件/文件系统本身保证 8 KiB 原子写。
:::

模型省掉了：WAL 全页写开启 `wal_compression = lz4/zstd` 后对空闲间隙的高倍压缩率，以及 `checkpoint_completion_target = 0.9` 把刷脏页平滑分摊到整个间隔以防止 I/O 毛刺的调度。 {.take}

## 前沿在哪（2026 年 11 月） {#ch10}

::: strings
toc: 前沿在哪（2026 年 11 月）
:::

传统同步阻塞 I/O、强制最左前缀索引与阻塞式全表重建正在被改写：PostgreSQL 18 引进了原生异步 I/O 与跳跃扫描，刚发布的 PostgreSQL 19 带来在线 `REPACK`，而 `pgvector` 直接把高维向量图塞进了 Postgres 的 8 KiB 共享缓冲区与 WAL。 {.law}

这一章把**已经确立的基础机制**、**有明确发布日期与版本源码的工程成果**，以及**依赖负载条件的基准说法和尚未解决的边界**分开摆放。

### 已确立的机制 {#h.est .sub3}

- <span class="tag h">已确立</span> **页格式与并发索引基石**：`PageHeaderData`（24 B）、`ItemIdData`（4 B）、`HeapTupleHeaderData`（23 B 固定头 + 对齐）和基于 High Key + 右指针的 Lehman &amp; Yao B-link 并发遍历算法自 PostgreSQL 早期一路沿用至今；Castagnoli CRC-32C（多项式 `0x82F63B78`）则是保护 WAL 记录和页面校验和的标准检验方法。 {#e1}
- <span class="tag h">已确立</span> **32 位 XID 模算术约束**：只要 `t_xmin` 与 `t_xmax` 保持在每个元组头占 4 字节的设计里，`2³¹` 半圈可见性限制与周期性 `VACUUM FREEZE` 就是数学上的硬约束，而不是某个参数调不好。 {#e2}

### 已经做出来的（截至 2026 年 11 月） {#h.demo .sub3}

- <span class="tag m">实测推进</span> **PostgreSQL 18 原生异步 I/O 与 B-Tree 跳跃扫描**（18.0 于 2025 年 9 月 25 日发布；18.1 于 2025 年 11 月 13 日、18.2 于 2026 年 2 月 12 日、18.3 于 2026 年 2 月 26 日发布）：几十年来 Postgres 读磁盘依赖同步系统调用加操作系统预读；PG 18 新增配置参数 `io_method`（支持 `sync`、后台进程池 `worker` 与 Linux 内核 5.1+ 原生 `io_uring`，参见 [[how-the-os-talks-to-hardware#ch11]]），让顺序扫描、位图堆扫描和 `VACUUM` 能同时把多批 I/O 请求交出去重叠等待。同时新增 **B-Tree Skip Scan**：多列联合索引哪怕 `WHERE` 漏写了最左引导列，当引导列基数有限时也能跳过重复前缀直接复用原有索引；`initdb` 亦改为默认开启数据页校验和，并内置了按时间有序的 `uuidv7()`（直接缓解第 7 章随机 UUIDv4 页分裂问题）。 {#d1}
- <span class="tag m">实测推进</span> **PostgreSQL 19 在线重构与执行计划固定**（2026 年 11 月 19 日正式发布）：PG 19 引入原生 **`REPACK (CONCURRENTLY)`**，用不阻塞并发读写的方式在线回收表膨胀并按索引重组物理顺序，取代过去动辄加排他表锁的 `VACUUM FULL` / `CLUSTER`；同步新增 `pg_plan_advice` 与 `pg_stash_advice` 扩展，让 DBA 可以按固定语法锁定易抖动的执行计划而不必改应用 SQL，并为从库补上用于读己所写的 `WAIT` 命令。 {#d2}
- <span class="tag m">实测推进</span> **`pgvector` 把 HNSW 向量图直接塞进 8 KiB 页**（v0.8.0 于 2024 年 10 月 30 日发布，v0.8.1 于 2025 年 9 月 4 日发布）：不同于外挂独立向量库，`pgvector` 的 HNSW 索引直接把邻接图存进 PostgreSQL 自己的 8 KiB 页、经过 `shared_buffers` 缓存并写入同一条 WAL 流，天然享有 MVCC 事务一致性与崩溃恢复；v0.8.0 重点新增 **迭代索引扫描（`hnsw.iterative_scan`）**，解决了向量检索叠加高选择性 `WHERE` 过滤时候选集被滤空（返回不够 `LIMIT` 行数）的老大难问题。 {#d3}
- <span class="tag m">实测推进</span> **分布式扩展与高可用形态**：横向分片如 **Citus** 把大表拆成多台工作节点上的本地分片与本地索引（含分片本地 HNSW），由协调节点下发汇聚；主从高可用如 **Patroni** 依托 etcd 共识选主并靠 WAL 流复制接管故障（背后的共识与副本一致性原理见 [[distributed-systems]]）。 {#d4}

### 声明、负载依赖与尚未解决的边界 {#h.claim .sub3}

- <span class="tag l">说法与条件</span> **AIO 加速比高度依赖缓存温度**：官方与社区测得 PostgreSQL 18 的 `io_method = io_uring` / `worker` 在冷缓存、高延迟云盘或顺序大扫与 `VACUUM` 场景下可带来约 2 至 3 倍吞吐提升，但这是特定冷读与高并发队列深度负载下的测试结果——如果热点数据全在 `shared_buffers` 或 OS Page Cache 里命中，异步系统调用不会凭空变出更快速度。 {#c1}
- <span class="tag l">说法与条件</span> **HNSW 内存震荡与规模边界**：由于 HNSW 检索本质上是在多层图上随机跳点读取 8 KiB 页面，一旦向量索引超过 `shared_buffers` 与可用物理内存，磁盘随机 IOPS 会触发剧烈的缓冲区颠簸（thrashing）；社区也出现了诸如 `pgvectorscale` 借助 DiskANN 与量化压缩把导航图压进内存的方案，而 `pgvector` 本身针对索引异步 I/O 与清理进度的后续版本仍在持续演进。 {#c2}
- <span class="tag l">说法与条件</span> **三个尚未彻底消解的结构代价**：第一，PG 17/18/19 的 64 位扩展（`FullTransactionId`）仍仅用于进程内与监控层，行头里的 `t_xmin`/`t_xmax` 依然是 32 位，反回卷监控依然不能松懈；第二，`UPDATE` 即使只改 1 个字节依然要写一整条新元组，热点长链对全表膨胀和写放大仍是硬伤；第三，除非未来全面引入并普及 Direct I/O，否则 `shared_buffers` 与 OS Page Cache 的双份内存占用仍会长期并存。 {#c3}

版本、发布日期与特性状态随上游推进而变化：这一章的所有事实与版本号均按 **2026 年 11 月** 的已知发行记录整理。 {.take}

## 收尾：查询慢了、锁住了或库膨胀了，先问三件事 {#ch11}

::: strings
toc: 收尾：先问三件事
:::

不必死背每一个 C 结构体。数据库发脾气时，只问三个问题：规划器的行数估算在哪里和现实差了数量级？这趟操作多读或弄脏了多少块 8 KiB 页？是谁卡住了 `xmin` 或把算子挤出了 `work_mem`？ {.law}

{.qs}
- **行估算歪了，还是内存不够用了？** 打开 `EXPLAIN (ANALYZE, BUFFERS)` 看两处数字：如果 `actual rows` 比估算 `rows` 大几十上百倍，优先跑 `ANALYZE` 或给相关联的多列加 `CREATE STATISTICS`（第 2 章）；如果算子里出现 `Buffers: shared read` 远高于命中或 `Batches: &gt; 1`、`Disk:` 外部排序，说明该调大会话级 `work_mem`、检查 `shared_buffers` 命中或把 SSD 环境的 `random_page_cost` 从 4.0 调近 1.1（第 2、6、8 章）。 {#q1}
- **表是不是被死行或非 HOT 更新拖垮了？** 查 `pg_stat_user_tables` 里的 `n_dead_tup`、`n_tup_hot_upd` 与冻结年龄：一个挂在旁边几小时不提交的空闲事务（idle in transaction）会把全局快照的 `xmin` 死死钉在原地，导致 `AUTOVACUUM` 既清不掉死元组、又铺不满 Visibility Map 拖慢 Index-Only Scan，甚至逼近 2 亿事务反回卷警戒线（第 3、4、5 章）。 {#q2}
- **写延迟暴涨，是不是卡在随机键页分裂或检查点后 FPW 尖峰？** 如果主键用了随机 UUIDv4 导致 B-Tree 填充率卡在六七成并频繁分裂，改用单调有序键或 PG 18 的 `uuidv7()`（第 7 章）；如果每个检查点刚过就出现磁盘带宽飙升，往往是冷页分散更新触发了大量 8 KiB 全页写（FPW），需要权衡拉长 `checkpoint_timeout` 或微调 `fillfactor`（第 3、9 章）。 {#q3}

一句话：PostgreSQL 执行一条查询的秘密不在黑魔法里，而在 **8 KiB 分槽页、MVCC 快照算术、带代价标尺的规划器、以及先顺序写 WAL 再异步落数据盘** 这四条咬合在一起的工程铁律上。 {#sum .sum}

下探到操作系统与硬件层的相关文章：[[what-a-drive-is-made-of]]（块擦写、4 KiB 扇区与 `fsync` 为什么慢）、[[how-the-os-talks-to-hardware]]（系统调用开销、OS Page Cache 与 `io_uring` 机制）、[[how-cores-share-memory]]（多核间缓存一致性与缓冲槽位自旋锁代价），以及 [[distributed-systems]]（主从副本流复制与高可用背后的共识规则）。 {#links}

::: footer
**来源与版本说明。**本文内部数据结构、位域宽度与默认常数对照 **PostgreSQL 17.6**（2025-08-14 发布）与 **PostgreSQL 18.0**（2025-09-25 发布）源码头文件及实现文件：`src/include/pg_config_manual.h`（`BLCKSZ = 8192`）、`src/include/storage/bufpage.h`（24 B `PageHeaderData`）、`src/include/storage/itemid.h`（4 B `ItemIdData`）、`src/include/access/htup_details.h`（23 B 固定头与 `t_hoff` 8 B 对齐）、`src/backend/optimizer/path/costsize.c`（`seq_page_cost = 1.0`、`random_page_cost = 4.0`、`cpu_tuple_cost = 0.01`、`cpu_index_tuple_cost = 0.005`、`cpu_operator_cost = 0.0025` 与 `index_pages_fetched` Mackert–Lohman 估算）、`src/backend/storage/ipc/procarray.c` 与 `heapam_visibility.c`（`SnapshotData` 与 `HeapTupleSatisfiesMVCC`）、`src/backend/access/transam/varsup.c` / `transam.c`（32 位 XID 模 2³² 比较、`autovacuum_freeze_max_age = 200M`）、`src/backend/storage/buffer/freelist.c`（`usage_count` 0..5 时钟扫描与 `BAS_BULKREAD` 256 KiB 环形缓冲区）、`src/backend/access/nbtree/`（Lehman &amp; Yao 16 B `BTPageOpaqueData`、`P_HIKEY` 与最右分裂）、`src/backend/executor/nodeHash.c`（Grace 多批哈希落盘）、`src/backend/access/transam/xlog.c` 与 `src/port/pg_crc32c_sb8.c`（16 MiB WAL 段、FPW 全页写与反射多项式 `0x82F63B78` Castagnoli CRC-32C）。前沿章节发布时间按 PostgreSQL 官方发布公告（17.6、18.0–18.3、19.0 于 2026-11-19）及 pgvector 官方变更日志（v0.8.0 于 2024-10-30、v0.8.1 于 2025-09-04）核实。逐项源码映射与限制记于本页目录 `BRIEF.md`。

**模型与核对声明。**本机未安装 `postgres` 或 `psql` 二进制，页面也不加载外部数据库；`models.js` 按上述源码定义重写全部八个模型，目录内 `tools/crosscheck.cjs` 已独立验证 8,192 字节页头与 `ItemIdData` 位域打包、Castagnoli CRC-32C 测试向量（`"123456789"` → `{=ch9.crcTest}`）、MVCC 快照真值矩阵、32 位模运算回卷边界、`costsize.c` 代价公式、时钟扫描与多批哈希连接算法。本文由 Antigravity AI 从零编写。
:::
