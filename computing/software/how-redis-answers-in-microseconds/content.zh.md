---
lang: zh
title: Redis 如何在微秒级响应 · 一篇可以动手的长文
desc: 一条 SET user:42 "alice" 或 ZRANGEBYSCORE 请求发出去，Redis 的主事件循环几乎在微秒级把结果写回套接字。这篇按 Redis 8.0 的设计与源码规格，把这一趟往返拆开：单线程事件循环与锁竞争、RESP2/RESP3 与管道、redisObject 的 44 字节 embstr 与 listpack、渐进式双表 rehash、带跨度的 ZSET 跳表、Redis 8 多线程网络 I/O、BGSAVE 写时复制与多部分 AOF、采样过期与近似 LRU / Morris 计数器 LFU、16,384 集群槽位与逆二进制 SCAN 游标，以及 Vector Sets 与无共享前沿架构。十一个可动手模型都用页面里重写的同一套算法运行。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
u.pct: {v}%
u.ms: {v} 毫秒
u.us: {v} 微秒
u.b: {v} B
u.kops: {v} kops/s
u.x: {v}×
u.keys: {v} 个键
u.ops: {v} 次
:::

# Redis 如何在微秒级响应 {#hero}

::: strings
kicker: 计算机 · 软件原理 · 一篇可以动手的长文
:::

一条 `SET user:42 "alice"` 或 `ZRANGEBYSCORE` 发进套接字，<br>一条不加锁的主循环怎么做到每秒十万次以上的微秒级响应——又会在哪里卡住？ {.sub}

在数据库都忙着开几十个工作线程、加锁、写磁盘的年代，Redis 把所有数据结构装进内存，用**一条主线程**处理命令，却能把单次服务端执行压到微秒以内、吞吐拉到每秒几十万次。这篇文章只拆一个问题：**当你敲下 `SET user:42 "alice"` 或 `ZRANGEBYSCORE` 的那一瞬间，从套接字字节流到内存结构再到磁盘快照，Redis 8.0 内部究竟发生了什么——以及哪些动作会让微秒瞬间拖成毫秒？** {.lead}

文中的所有结构体字节数、配置默认值与常量，均对照 **Redis 8.0**（2025 年 5 月 1 日 GA 发布，tag `8.0.0`）源码与官方规范；文末前沿一章标注了截至 2026 年 11 月的后续演进（8.2–8.10、Valkey 9 与无共享引擎）。本机未安装可执行的 `redis-server`，所有模型均以纯脚本在页面里按同一算法重写，并由 `tools/crosscheck.cjs` 对照标准 RESP2/RESP3 二进制封包、SipHash-2-4 测试向量、CRC16-XMODEM 测试向量、逆二进制 `SCAN` 游标数学与 Morris 计数器期望表逐项验证。前置硬件与系统知识可参考[[how-the-os-talks-to-hardware]]、[[how-a-nic-moves-packets]]、[[how-virtual-memory-works]]和[[why-compute-waits-for-memory]]。 {.note}

## 一条主线程为什么比加锁更快 {#ch1}

::: strings
toc: 主线程与事件循环
:::

读一次内存只要百纳秒，而线程抢锁、睡眠唤醒与跨核缓存同步动辄花掉几微秒；在单机内存里，省掉锁比堆核更划算。 {.law}

想象你打开 `redis-cli`，依次敲下三条命令：写入一个字符串、向排行榜写入分数、再按分数区间查回前几名。每一次按回车，Redis 的核心函数 `aeMain` 都在做同一轮动作：通过操作系统多路复用接口（Linux 的 `epoll` 或 macOS/BSD 的 `kqueue`）一次领回所有可读套接字，顺着队列挨个执行命令，把回复写进客户端输出缓冲，最后在进入下一轮睡眠前（`beforeSleep`）把缓冲刷回内核。关于操作系统如何通过 `epoll` 减少系统调用边界开销，见[[how-the-os-talks-to-hardware#ch11|系统调用与 epoll]]；关于主存访问为什么也在百纳秒量级，见[[why-compute-waits-for-memory#ch1|内存延迟等级]]。

::: html ch1-code
code.aria: 一个最小的 Redis 命令往返序列
code: "SET user:42 \"alice\"\n# -> +OK\\r\\n\n\nZADD rank 100 \"alice\"\n# -> :1\\r\\n\n\nZRANGEBYSCORE rank 90 150 WITHSCORES\n# -> *2\\r\\n$5\\r\\nalice\\r\\n$3\\r\\n100\\r\\n"
:::

**为什么不用 8 个线程一起改同一张哈希表？**在多线程方案里，只要两个线程同时修改同一个热门键或全局哈希表元数据，就必须上互斥锁（mutex）：先做一次原子指令抢锁，失败就挂起做上下文切换，还要让不同 CPU 核心间的 L1/L2 缓存行反复失效（cache-line bouncing）。Redis 8.0 把命令执行死守在一条线程上，彻底消除了数据结构上的锁和原子竞争；但在同一个事件循环里，如果某一条命令耗时过长（比如扫描千万键的 `KEYS *`），排在它后面的所有客户端都会原地等待——这就是单线程的**队头阻塞（head-of-line blocking）**。

::: diagram dg-loop keys=dg.loop
cap: 图 1　Redis 主事件循环 aeMain 的一轮流转：从多路复用等待到执行命令再到刷新写缓冲。
aria: 示意图：Redis 主事件循环四个阶段依次循环，底部标注内存、系统调用与网络往返的时间量级
s1: epoll_wait / kevent
s1s: 一次唤醒收齐就绪套接字
s2: readQueryFromClient
s2s: 读入请求并解析 RESP 帧
s3: processCommand
s3s: 单线程查表并写回复缓冲
s4: beforeSleep 写回
s4s: 批量写出，无锁继续下一轮
sc: 100 ns 内存  |  ~2 µs 调用  |  ~200 µs 网络
:::

::: lab ch1-model
model.title: 单线程事件循环 vs 多线程抢锁与队头阻塞
model.how: 拖动“对比线程数”和“热点键竞争比例”，看加锁多线程何时反而跑不过无锁单线程（右侧红线是单线程无锁参考线）。再勾上“插入一条 2 毫秒 KEYS *”，观察排队的请求怎样被一并拖慢。
ctl.thr: 对比线程数
ctl.hot: 热点键竞争比例
ctl.slow: 插入一条 2 ms 阻塞命令
cv.aria: 左图展示单线程无锁与多线程互斥锁吞吐对比曲线，右图展示 20 个并发请求在主事件循环上的排队时间线
cv.x: 线程数
cv.y: kops/s
cv.loop: 单线程无锁
cv.lock: 多线程互斥
cv.tl: 20 并发请求排队时延
cv.slow: 阻塞 2 ms
read.loop: 无锁主循环吞吐
read.lock: 多线程互斥吞吐
read.p99: 队尾请求延迟
read.blk: 被拖慢的请求
say.fast: 单线程无锁循环稳定在 <em>{loop}</em>。当 {t} 个线程以 {hot}% 热点比例竞争互斥锁时，缓存行同步与锁等待把多线程压到 {lock}（若竞争降到 0%，多线程才能线性扩展）。
say.stall: 主线程无锁平常只需微秒，但第 3 号阻塞命令占用 <em>{p99}</em> 后，紧跟在后的 <em>{blk}</em> 个正常请求全部被迫等待，队尾延迟瞬间放大上千倍。
:::

图里默认的 50% 热点竞争下，无锁单循环跑出 {=ch1.loopKops} kops/s（按模型设定的单条命令 2 微秒预算），而 4 线程加锁模型反而掉到 {=ch1.lock4Kops} kops/s；一旦勾上那条 2 毫秒的阻塞命令，后续 {=ch1.blocked} 个请求被拖到 {=ch1.slowP99} 毫秒。这就是为什么 Redis 在内存操作上把锁全部砍掉，同时严禁在主循环里执行 O(N) 扫描。

模型的边界：这里用一个简化解析式表示互斥锁的缓存行抖动与串行关键区比例，真实服务器还受套接字收发（第 6 章）与操作系统调度器影响，绝对吞吐随 CPU 型号与网络环境变化。 {.take}

## RESP2 / RESP3 与管道：网络往返才是大头 {#ch2}

::: strings
toc: RESP 协议与管道
:::

解析字节流只花零点几微秒，跨越网卡的一次往返却动辄两百微秒；把多条命令打包成一次管道发送，就能把绝大部分网络等待摊薄。 {.law}

你的客户端发给 Redis 的并不是英文文本行，而是长度前缀帧（RESP，REdis Serialization Protocol）。以 `SET user:42 alice` 为例，在电线上排开的正是 `*3\r\n$3\r\nSET\r\n$7\r\nuser:42\r\n$5\r\nalice\r\n`（共 {=ch2.reqBytes} 字节）。为什么一定要在前面写 `$7` 和 `$5`？因为**二进制安全**：哪怕值里夹着 `\r\n` 或 `\0`，`readQueryFromClient` 也只需按长度指针往后跳，不需要逐字节扫描分隔符，就能直接从客户端输入缓冲区 `querybuf` 切片出参数数组 `argv[]`。关于数据包从用户态缓冲区经过内核与网卡走一次来回的全过程，见[[how-a-nic-moves-packets#ch3|数据包在网卡里的往返]]。

::: diagram dg-resp keys=dg.resp
cap: 图 2　RESP 长度前缀帧在 querybuf 中的切片，以及逐条等待（红）与管道批处理（金）的时间线对比。
aria: 示意图：上半部分是 SET user:42 alice 的长度前缀令牌进入 querybuf，下半部分对比三次往返和一次管道批处理
wire: 线上的长度前缀字节流
qbuf: querybuf 零拷贝切片出 argv[]
seq: 逐条等待：3 × (RTT + CPU)
pip: 管道批处理：1 × RTT + 3 × CPU
:::

Redis 8.0 同时支持 **RESP2**（通过 `*` 数组和 `$` 块字符串编码，客户端需要自己记住 `HGETALL` 返回的偶数数组其实代表键值对）和 **RESP3**（客户端发 `HELLO 3` 握手后启用，引入 `%` 映射、`,` 浮点数、`#` 布尔与 `_` 空值等显式类型标记）。无论是哪种版本，**真正的延迟杀手都不是解析协议，而是串行往返**：如果每发一条命令都等 `+OK\r\n` 回来再发下一条，20 条命令在 200 微秒局域网往返下要耗掉 {=ch2.seqMs} 毫秒；放进一次管道（pipeline），只需 1 次往返加上 20 次服务端解析执行，总计只要 {=ch2.pipeUs} 微秒，提速 {=ch2.speedup} 倍。

::: lab ch2-model
model.title: RESP2 / RESP3 编码与管道往返瀑布
model.how: 拖动“批量命令数”和“网络往返 RTT”，切换“RESP2 / RESP3”和“逐条等待 / 管道批处理”，直接看电线上的字节流以及总耗时被网速还是 CPU 统治。
ctl.n: 批量命令数
ctl.rtt: 网络往返 RTT
ctl.proto: 协议版本
proto.resp2: RESP2
proto.resp3: RESP3
ctl.mode: 发送方式
mode.seq: 逐条发送
mode.pipe: 管道批处理
wire.aria: 当前命令与响应的 RESP 二进制帧转义预览
cv.aria: 对比逐条往返与管道批处理的时间线瀑布图
cv.seq: 逐条发送
cv.pipe: 管道批处理
cv.x: 时间 (µs)
read.bytes: 请求总字节
read.lat: 批处理总耗时
read.qps: 有效吞吐
read.gain: 管道提速比
say.seq: 逐条发送 {n} 条命令花掉 <em>{lat}</em>，其中 CPU 解析执行只占 <em>{cpu}</em>，其余全是干等网络往返；切到管道可以把吞吐放大 {gain}。
say.pipe: 管道把 {n} 条命令打包进 {pkt} 个 TCP 段（约 {bytes}），只付一次 {rtt} 网络往返，总耗时压到 <em>{lat}</em>，吞吐跳到 <em>{qps}</em>。
:::

模型把客户端和服务端假定为单条 TCP 连接，未模拟超过滑动窗口或 1,460 字节 MSS 分片后拥塞控制引发的多轮次 ACK，也未计入客户端序列化开销。 {.take}

## redisObject 与动态编码：44 字节的分水岭 {#ch3}

::: strings
toc: 对象头与动态编码
:::

Redis 不直接把字符串裸指针扔进哈希表，而是包一层 16 字节 `redisObject` 对象头；小于等于 44 字节挤进一次分配，小集合平铺成紧凑的 `listpack`。 {.law}

在 64 位系统里，Redis 的每个值都戴着一顶 `{=ch3.robjB}` 字节的 `redisObject` 帽子：4 位 `type`（字符串/哈希/集合等）、4 位 `encoding`（底层真正怎么存）、24 位 `lru`（淘汰计时与频率，第 8 章展开）、32 位 `refcount` 引用计数，外加 8 字节 `void *ptr` 指针。正是这顶帽子让同一个 `SET` 或 `HSET` 能在底层无缝切换编码：

- **整数内联（`OBJ_ENCODING_INT`）**：如果你存的是 `"42"`，Redis 直接把整数 `42` 塞进 `ptr` 指针本身，连字符数组都省了；对于 `0` 到 `9,999` 之间的公共小整数，甚至直接共享 `shared.integers[]` 静态对象，额外内存分配为 **0 次**。 {#i1}
- **嵌入式字符串（`embstr`）与 `raw`**：当字符串长度 ≤ **{=ch3.embLimit} 字节**时，`{=ch3.robjB}` 字节的 `redisObject`、`{=ch3.sds8B}` 字节的 `sdshdr8` 头（长度、已分配容量、标志位）、字符串本身和结尾 `\0` 加起来恰好 `{=ch3.robjB} + {=ch3.sds8B} + {=ch3.embLimit} + 1 = {=ch3.emb44Alloc}` 字节——严丝合缝卡进 `jemalloc` 的 **64 字节**缓存行级别，一次 `malloc` 搞定。哪怕只多 1 字节变成 45 字节，Redis 就切到 `raw` 编码：拆成两次独立的 `malloc`，分别分配 `redisObject` 和 `SDS`，总分配跳到 {=ch3.raw45Alloc} 字节，还多了一次指针跳转。 {#i2}
- **`listpack` 替代 `ziplist`**：对于小 Hash（默认条目 ≤ `{=ch3.lpMaxEntries}` 且键值都 ≤ 64 字节）和小 ZSet（≤ 128 项且 ≤ 64 字节），Redis 早已全面用 `listpack` 取代老的 `ziplist`。旧版 `ziplist` 每个节点都存**前一项的长度 `prevlen`**，一旦前面插进一个超过 254 字节的元素，`prevlen` 从 1 字节涨成 5 字节，会引发后面所有节点连环搬迁的**级联更新（cascade update）**；`listpack` 改成在每个条目尾部只记录**自己这一项的长度 `backlen`**，逆序扫描照样找得到开头，彻底根除了级联更新。 {#i3}

::: diagram dg-robj keys=dg.robj
cap: 图 3　三种字符串编码（INT、44 字节 embstr 单块、raw 双块）与 listpack 条目结构。
aria: 示意图：从上到下对比 INT 指针内联、embstr 64 字节单次分配、raw 两次分配以及 listpack 的 encoding、data、backlen 布局
int: INT（0..9999 共享零分配）
intb: robj 16B，整数直接写进 *ptr
emb: embstr（≤ 44 字节：单次 64B jemalloc）
embd: 44B 数据 + \0
raw: raw（> 44 字节：两次 malloc 指针跳转）
rawd: sdshdr8 + 数据 + \0
lp: listpack（自记 backlen，无级联更新）
lpd: 元素载荷
:::

::: lab ch3-model
model.title: 44 字节 embstr 悬崖与 listpack 紧凑内存计算器
model.how: 先把“字符串/字段值长度”留在 44 看清 64 字节单块分配，再往右拖一格到 45 看它如何劈成两块 `raw`；勾上“值是小整数 42”看零分配共享；再把“Hash 条目数”拖过 512 或把长度拖过 64，看 `listpack` 升级成 `hashtable`。
ctl.len: 字符串 / 值长度
ctl.entries: Hash 条目数
ctl.int: 存为整数 "42"
cv.aria: 上半部分展示字符串值在 jemalloc 中的字节分块，下半部分对比同一 Hash 用 listpack 与 hashtable 各自占用的字节数
cv.str: 字符串内存块
cv.hash: 同量 Hash 对比
cv.lp: listpack
cv.ht: hashtable
cv.zero: 共享整数池（0 B 新增）
read.enc: 字符串编码
read.strb: 字符串分配 / malloc
read.henc: Hash 当前编码
read.hb: Hash 实际内存
say.int: 值是小整数 42：走 <code>OBJ_ENCODING_INT</code>，直接复用全局共享池，额外新分配 <em>0 字节 / 0 次 malloc</em>；Hash 仍按长度为 {len} 字节的值评估为 {henc}。
say.embstr: {len} 字节字符串走 <code>embstr</code>：<code>redisObject</code> + <code>sdshdr8</code> + 载荷恰好挤进 <em>1 次 malloc（{strb}）</em>；{entries} 项 Hash 占 {hb}。
say.raw: 超过 44 字节门槛后退化为 <code>raw</code>：对象头和字符串体拆成 <em>2 次 malloc（共 {strb}）</em>，既多了分配碎片又多一次指针追踪。
:::

把默认 64 项、44 字节值的 Hash 用 `listpack` 铺平只要 {=ch3.lp64Bytes} 字节；如果换成 `hashtable` 链式桶和条目指针，立刻膨胀到 {=ch3.ht64Bytes} 字节。

模型的边界：这里只按 64 位 `jemalloc` 常见分级演示，未计入键名在主键空间 `dictEntry` 里的占用，也不包含 Redis 8.2 新增的 `kvobj`（第 10 章介绍）。 {.take}

## 字典哈希表与渐进式 Rehash {#ch4}

::: strings
toc: 字典与渐进式 Rehash
:::

一口气把千万级哈希表翻倍会卡死主线程几百毫秒；Redis 同时挂两张表，靠每次命令顺手搬一个桶，把悬崖切碎成微秒级小台阶。 {.law}

无论你是 `GET` 一个字符串键，还是在大 Hash 里 `HGET` 一个字段，底层走的都是 `src/dict.c` 的字典 `dict`。Redis 启动时先按 `SipHash-1-2`（每块 1 轮压缩、2 轮收尾，带进程启动随机种子防哈希洪水攻击）算出键的 64 位哈希值，再按掩码落进初始大小为 {=ch4.htInit} 的 `ht[0]` 桶数组。为了省指针内存，Redis 甚至利用 64 位指针最低 3 位恒为 0 的对齐特性（`ENTRY_PTR_MASK`）给桶指针打标签，像纯集合这样不需要值的结构干脆省掉 `val` 字段（`dictEntryNoValue`）。

当装载率达到 1:1（或者后台正在 `fork()` 做快照时延迟到 {=ch4.forceRatio}:1，避免写时复制大量脏页，第 7 章详述），`dict` 需要把 `ht[1]` 分配为两倍大的新表。如果此时在主线程里写个循环一次性搬完千万个键，客户端会在几百毫秒内颗粒无收。Redis 的解法是**渐进式 Rehash（progressive rehashing）**：把 `rehashidx` 从 `-1` 设为 `0`，此后**每来一条增删改查命令，就调用 `_dictRehashStep` 顺带迁移 1 个非空桶**（如果后台空转，主循环定时器 `databasesCron` 还会每轮花 1 毫秒 `dictRehashMilliseconds` 帮着搬）。

::: diagram dg-rehash keys=dg.rehash
cap: 图 4　渐进式 Rehash：读先查 ht[0] 再查 ht[1]，新写入直落 ht[1]，每次命令顺手推进 rehashidx。
aria: 示意图：左侧 ht[0] 上方桶已搬空，中间桶正随 rehashidx 迁往右侧 ht[1]，下方桶等待迁移
done: 已迁空
cur: rehashidx 迁移中
wait: 待迁移
new: 已落入 ht[1]
rule: 读查双表，写只入 ht[1]，每条命令搬 1 桶
:::

::: lab ch4-model
model.title: 双表渐进式 Rehash 与尾延迟对比
model.how: 拖动“迁移推进步数”，观察键如何随 `rehashidx` 从左侧 8 桶 `ht[0]` 一桶一桶落进右侧 16 桶 `ht[1]`；把“迁移方式”切到“一次性阻塞扩容”，观察红柱刺出的巨型卡顿尖峰。
ctl.step: 迁移推进步数
ctl.keys: 演示键数量
ctl.mode: 迁移方式
mode.prog: 渐进式（每条命令 1 桶）
mode.stw: 一次性全表阻塞
cv.aria: 左侧显示 ht[0] 8 个桶、右侧显示 ht[1] 16 个桶的键迁移进度，底部显示单条命令的尾延迟对比
cv.h0: ht[0]（8 桶）
cv.h1: ht[1]（16 桶）
cv.lat: 迁移耗时对比
cv.prog: 渐进 ~1.4 µs
cv.stw: 全表阻塞 380 ms
read.idx: 当前 rehashidx
read.h0: ht[0] 剩余键
read.h1: ht[1] 已迁键
read.spike: 最坏单命令耗时
say.idle: 刚触发扩容，<code>rehashidx = 0</code>：新表 <code>ht[1]</code> 已分配好，下一条命令起开始逐桶搬迁；新插入的键会直接写进 <code>ht[1]</code>。
say.prog: 正在渐进迁移：<code>rehashidx = {idx}</code>，<code>ht[0]</code> 还剩 {h0} 个键，<code>ht[1]</code> 已接管 {h1} 个键，本条命令只多付 <em>{spike}</em> 顺手迁移成本。
say.done: 迁移完成！<code>ht[0]</code> 已清空并释放，<code>ht[1]</code> 晋升为新的 <code>ht[0]</code>，<code>rehashidx</code> 复位为 <em>-1</em>。
say.stw: 一次性全表扩容把所有搬迁塞进同一条命令：面对千万级大字典时，主线程直接卡死 <em>{spike}</em>，后续所有连接全部超时。
:::

模型用 8 到 16 桶、10 个键的真实 SipHash-1-2 分布演示搬迁过程，并用量级参数对比千万键字典的一次性阻塞耗时；真实运行时定时器 `activeRehash` 还会在无命令空闲期按 1 毫秒时间片加速搬空 `ht[0]`。 {.take}

## ZSET 与跳表：O(1) 查分与带跨度的跳跃表 {#ch5}

::: strings
toc: ZSET 与带跨度跳表
:::

有序集合把“按成员查分”交给哈希表、把“按分排名和范围查询”交给带跨度（span）的跳表；用 1/4 概率长出的多层捷径，无需平衡树旋转也能直接算出精确名次。 {.law}

回到开篇的 `ZRANGEBYSCORE rank 90 150` 和常见的 `ZSCORE` / `ZRANK`：只用一张哈希表排不了序，只用一棵平衡树又没法 O(1) 凭名字查分。Redis 的 `ZSET`（数据足够大或成员较长时，默认超过 128 项或 64 字节从 `listpack` 切换而来）干脆**两套索引并用，共享同一批成员与分数指针**：
- 一张 `dict` 哈希表：`member -&gt; score`，让 `ZSCORE` 一次哈希即得； {#i1}
- 一条双向带跨度跳表 `zskiplist`（`src/t_zset.c`）：所有节点在第 0 层按 `score` 升序（同分按成员字典序）拉成双向链表，支持范围扫；同时每个节点插入时通过 `zslRandomLevel` 掷骰子，以 **`p = {=ch5.zslP}`** 的概率逐层拔高（最高 **`{=ch5.maxLvl}` 层**），并在每条前向指针 `level[i].forward` 上顺手维护它跨越了多少个第 0 层节点，这就是 **`span`（跨度）**。 {#i2}

**为什么 antirez 选跳表而不是红黑树？**首先是区间查询简单：定位到区间起点后沿着第 0 层顺序往后走即可，而二叉树要做中序回溯；其次实现 `ZRANK` 极其直白：查找路径每向右跨过一条前向指针，就把那条指针上的 `span` 累加起来，撞到目标节点时总和就是精确名次，不必像带子树规模统计的红黑树那样在每次左旋右旋时改写多个祖先计数。

::: diagram dg-skiplist keys=dg.skiplist
cap: 图 5　ZSET 的 dict 与 zskiplist 双索引结构：每条高架指针都标注了跨过的节点数 span。
aria: 示意图：上方 dict 负责 O(1) 查分，下方五个跳表节点构成多层前向指针并标出 span=4 和 span=2
dict: dict 哈希表：O(1) 按成员查分数 ZSCORE
bot: 第 0 层按分升序双向链接（ZRANGEBYSCORE）
:::

::: lab ch5-model
model.title: ZSET 种子跳表：跨度累加与 O(log N) 查找路径
model.how: 拖动“查询目标名次”高亮从最高层一路跳到目标的真实路径，观察沿途经过的指针数和每步累加的 `span` 如何精确凑出名次；切换“随机种子”看 `p = 0.25` 掷出的不同塔高分布。
ctl.n: 集合元素数
ctl.rank: 查询目标名次
ctl.seed: 随机种子
cv.aria: 展示每个跳表节点的随机高度、各层带 span 的前向指针以及当前高亮查找路径
cv.head: HEAD
cv.lvl: 层高
cv.hops: 目标路径
read.hops: 跳表走过步数
read.span: 累加 span（精确名次）
read.lvl: 当前最大层高
read.dict: dict 查分探测
say: 沿着最高层（L{lvl}）向右跳跃再向下落，只走了 <em>{hops} 步</em> 就命中第 {rank} 名（分数 {score}）；沿途累加的 <code>span</code> 总和恰好等于 <em>{span}</em>。若只查分数，伴生 <code>dict</code> 只需 {dict} 次哈希探测。
:::

例如默认种子 3、12 个元素时，查找第 9 名沿途只跨了 {=ch5.seed3Hops} 步。真实的 `ZSET` 在 128 项以内或成员短于 64 字节时会先以更省内存的 `listpack` 编码存在，模型直接展示升级后的 `dict + zskiplist` 形态。 {.take}

## 单线程的瓶颈与 io-threads 多线程网络 I/O {#ch6}

::: strings
toc: 多线程网络 I/O
:::

在每秒十万级请求下，主线程真正耗在执行命令上的时间往往不到三成，剩下七成全卡在 read/write 系统调用、RESP 解析和 TLS 加解密里；Redis 8 把网络 I/O 拆给工作线程，执行核心依然单线程。 {.law}

很多人以为 Redis 是“全盘单线程”，其实从 Redis 6.0 开始就引入了 I/O 线程，而在 **Redis 8.0** 里，多线程网络 I/O 引擎被重新设计成事件驱动的异步工蜂模型（`io-threads` 配置，默认值为 `1` 即关闭；多核高并发下通常设为 `4` 到 `8` 核，且与 TLS 彻底兼容）。它的分工极其克制：
1. 主线程事件循环收集一批就绪套接字，把读取请求和解析 RESP 命令的工作分派给 `io-threads` 工作线程并行完成； {#i1}
2. 经过一次极轻的屏障同步后，**主线程独占核心，按顺序无锁执行这批命令**； {#i2}
3. 命令结果写进客户端回复缓冲后，再交回 `io-threads` 并行压缩/加密（若开启 TLS）并 `write` 回各自套接字。 {#i3}

由于只有纯读写和解析被并行化，**命令执行本身还是单线程串联**，受阿姆达尔定律（Amdahl's Law）限制：加到 4 个 I/O 线程后，吞吐确实大涨，但一旦单线程那段执行核心吃满 100%，再加 I/O 线程就不再提速了。

::: diagram dg-iothreads keys=dg.iothreads
cap: 图 6　Redis 8 多线程网络 I/O 分工：并行收包解析与回写，中间命令执行仍由单主线程无锁串行。
aria: 示意图：左侧三个 I/O 线程并行读取解析，汇聚到中间单线程执行命令，再由三个 I/O 线程并行写回套接字
read: 并行读包 + RESP 解析 + TLS
main: 命令执行
wr: 并行写回
cap2: 读写并行扩展，命令核心受单核上限约束
:::

::: lab ch6-model
model.title: Redis 8 io-threads 流水线与单核天花板
model.how: 拖动“io-threads 线程数”和“载荷字节数”，再勾选“开启 TLS 加密”，观察吞吐随线程数的爬升曲线，什么时候撞上“主线程执行”或“I/O 读写”天花板。
ctl.thr: io-threads 线程数
ctl.bytes: 请求/回复载荷
ctl.tls: 开启 TLS 加解密
cv.aria: 上图显示单轮批次内读解析、主线程执行、写回三段耗时占比，下图绘制 1 到 8 线程的吞吐扩展曲线
cv.read: 读+解析
cv.exec: 主核执行
cv.wr: 并行写回
cv.x: io-threads 线程数
cv.y: 吞吐 (kops/s)
cv.ceil: 单核执行上限
read.qps: 估算吞吐上限
read.share: I/O 耗时占比
read.lim: 当前瓶颈阶段
say.single: 当前 <code>io-threads = 1</code>（默认单线程）：全部读、解析、执行和写回都挤在一条核上，I/O 占去 <em>{share}</em>，吞吐停在 {qps}。
say.io: 打开 {t} 个 I/O 线程并行分担收发后，吞吐跳升到 <em>{qps}</em>；因为载荷或 TLS 依然沉重，网络 I/O（占比 {share}）仍是主要瓶颈。
say.core: 虽然 I/O 已有 {t} 个线程分摊，I/O 占比压低到 {share}，但单线程 <code>processCommand</code> 已吃满核心，吞吐撞在 <em>{qps}</em> 的阿姆达尔上限上。
:::

按模型里的默认 512 字节载荷参数，`io-threads = 1` 时吞吐为 {=ch6.kops1} kops/s，开启 `4` 个工作线程后提到 {=ch6.kops4} kops/s。模型用确定性解析参数拆解三段耗时，实际表现还会随内核网络协议栈、CPU 核间同步与连接数波动。 {.take}

## 不停服的持久化：fork() 写时复制与多部分 AOF {#ch7}

::: strings
toc: 持久化与写时复制
:::

为了在不冻结主线程的前提下拍一张一致的内存快照，Redis 靠操作系统的 `fork()` 和写时复制按 4 KiB 页分叉内存；代价是写入越分散，快照期间内存涨得越接近两倍。 {.law}

内存里跑得再快，断电也会归零。Redis 的 RDB 快照命令 `BGSAVE` 看似很神奇：一个拥有 10 GB 数据的进程调用 `fork()` 派生子进程，几毫秒内就“复制”出整棵数据树去后台刷盘，主进程继续接流量。其中的秘密在于虚拟内存的**写时复制（Copy-on-Write，CoW）**，详细页表机制见[[how-virtual-memory-works#ch9|fork() 与写时复制]]：
- `fork()` 刚结束时，父进程和子进程的页表指向**同一批只读的物理 {=ch7.pageKiB} KiB 内存页**，几乎不耗额外内存； {#i1}
- 只要主进程一直只做读请求，内存保持 `1.00×`； {#i2}
- 可一旦主进程执行 `SET` 改写某一页里的哪怕 **1 个字节**，CPU 就会触发一次缺页异常（minor page fault），内核暂停主线程微秒级时间，把这整整 {=ch7.pageKiB} KiB 物理页完整拷贝一份给父进程改写——写得越均匀越分散，被复制的脏页越多，极端情况下整机物理内存直接逼近 **2×**，引发 OOM 杀手或延迟毛刺。 {#i3}

另一条持久化路线是**只追加文件（AOF）**：把每条写命令追加到缓冲区，再按 `appendfsync` 策略落盘——`always` 每条写入都刷盘（最安全但受限于磁盘 fsync 延迟）、`everysec` 由后台线程每秒刷一次（折中，至多丢约 1 秒数据）、`no` 完全交给操作系统刷脏页。自 Redis 7.0 沿用到 Redis 8.0 的 **Multi-Part AOF** 把原先重写时容易膨胀的单一文件拆成了 `base` 全量底座、`incr` 增量日志和 `manifest` 清单三部分，重写期间不再需要主进程反复大块拼接。

::: diagram dg-cow keys=dg.cow
cap: 图 7　BGSAVE 期间的 4 KiB 页级写时复制（左共享，右写脏拷贝）以及 Multi-Part AOF 三件套。
aria: 示意图：父进程与子进程共享只读物理页，父进程写入时内核复制 4 KiB 脏页；下方画出 base.rdb、incr.aof 与 manifest
par: 主进程（读写）
chd: 子进程（RDB）
shr: 共享 4 KiB 页
cpy: 复制新 4 KiB 页
aof: Multi-Part AOF 组成
:::

::: lab ch7-model
model.title: BGSAVE 写时复制脏页网格与 AOF 刷盘权衡
model.how: 拖动“快照期间写入比例”，看 64 个物理 4 KiB 页有多少被写脏拷贝成双份；再勾上“集中热点写入（10% 热点页）”对比随机分散写入时的内存放大差距；切换 `appendfsync` 看丢数据窗口与卡顿风险。
ctl.write: 快照期间写入比例
ctl.skew: 集中热点写入（10% 热点页）
ctl.aof: appendfsync 策略
aof.everysec: everysec
aof.always: always
aof.no: no
cv.aria: 64 个 4 KiB 物理页网格，青色为父子共享页，红色为发生写时复制后的独立脏页
cv.grid: 64 × 4 KiB 物理内存页
cv.base: 共享基线 (1×)
cv.cow: 脏页拷贝
cv.ram: 内存放大倍率
read.copied: 已触发复制脏页
read.ram: 峰值内存倍率
read.loss: AOF 断电风险窗口
read.fsync: 磁盘 fsync 频率
say.idle: 快照期间无写入：父子进程共享全部 64 页，内存稳在 <em>{ram}</em>。AOF 处于 {aof} 策略（风险窗口 {loss}）。
say.uniform: 随机分散写入了 {writes} 次，命中并复制了 <em>{copied} / 64</em> 个 4 KiB 页，内存膨胀到 <em>{ram}</em>；哪怕每条只改几个字节，整页也必须翻倍。
say.skew: 同样写入 {writes} 次，但 90% 落在少数热点页上，只污染了 <em>{copied} / 64</em> 页，内存倍率压在 <em>{ram}</em>——写入越集中，CoW 越省内存。
:::

在模型里同样写入 50% 比例的操作时，均匀分散写会把内存推高到 {=ch7.cowUnif}×，而集中在 10% 热点页的写操作只涨到 {=ch7.cowSkew}×。

模型的边界：这里用 64 页固定网格演示页级复制机制，真实的 `fork()` 耗时还取决于页表本身的体积（比如大内存实例开启透明大页 THP 会将页放大到 2 MiB，一次小修改拷贝 2 MiB，引发更严重的尾延迟尖峰）。 {.take}

## 过期清理与内存淘汰：近似 LRU 与 Morris 计数器 LFU {#ch8}

::: strings
toc: 过期清理与内存淘汰
:::

给千万个键维护全局双向链表会把内存和指针开销拖垮；Redis 靠有限样本随机抽样逼近 LRU，再把 24 位字段拆出 8 位做对数 Morris 计数器来估频。 {.law}

给键设了 `EXPIRE` 过期时间后，Redis 既不能在每秒钟遍历全部千万键，也不能为每个键挂重型定时器。它采用**惰性删除（passive）＋定期随机采样（active）**双管齐下：读到键时顺便检查是否过期，过期当场删；同时定时任务里的 `activeExpireCycle`（`src/expire.c`）每轮对每个库随机抽 **`{=ch8.expKeys}` 个带 TTL 的键**删掉其中过期的——在 Redis 8.0（自 Redis 6 起引入 effort 调节，默认 `active-expire-effort = 1`），如果这一轮抽样发现过期比例仍高于 **`{=ch8.expStale}%`**（`ACTIVE_EXPIRE_ACCEPTABLE_STALE`），就原地再抽一轮直到时间预算用完或低于阈值。

**内存打满怎么办？**如果你以为 Redis 里的 LRU（最近最少使用）是把几千万个 `redisObject` 串进一条双向链表、每次访问移到表头，那每条链表光前后指针就要白烧 **16 字节/键**（100 万键就是 16 MB），而且每次 `GET` 都要改指针。Redis 的做法极端节俭：
- **近似 LRU**：借用 `redisObject` 里自带的 **24 位 `lru` 字段**存秒级时钟；真需要淘汰时，每次随机抽 **`maxmemory-samples`（默认 `{=ch8.lruSamp}`）** 个键放进一个长度 `{=ch8.lruPool}` 的候选池 `EvictionPool`，挑最老的踢出去。按这里 200 键采样模型测算，只抽 5 个样本的平均误差就只有最老 {=ch8.lru5Err}%，抽到 10 个已经极度贴近全局真 LRU，却省掉了全部链表指针。 {#i1}
- **8 位对数 Morris 计数器 LFU**：在 `allkeys-lfu` 模式下，同一个 24 位 `lru` 字段被劈成两半——高 **16 位**存分钟级衰减时间戳 `ldt`，低 **8 位**（最大值只有 255）用 **Morris 概率对数计数器**记录访问频率！新键起步给一个初始保护值 `LFU_INIT_VAL = {=ch8.lfuInit}`，此后每次访问由 `LFULogIncr` 掷硬币决定是否 `+1`，概率为 `p = 1 / ((counter - 5) × lfu_log_factor + 1)`。在默认因子 `{=ch8.lfuFactor}` 下，约 1,000 次访问期望把计数器推到 `{=ch8.lfu1k}`，10 万次推到 `{=ch8.lfu100k}`，约 100 万次才撞上 255 天花板——**只用 1 个字节就区分了从几次到百万次的热度量级**。 {#i2}

::: diagram dg-evict keys=dg.evict
cap: 图 8　同一块 24 位 lru 字段在 LRU 与 LFU 两种模式下的比特切分与 16 槽淘汰池。
aria: 示意图：上方 LRU 模式用满 24 位记录秒级访问时钟，下方 LFU 模式拆成 16 位 ldt 分钟时间戳和 8 位 Morris 计数器
lru: LRU 模式：全部 24 位记录秒级时钟
lrub: 24-bit LRU clock (seconds)
lfu: LFU 模式：高 16 位时间戳 + 低 8 位频次
ldt: 16-bit ldt (min)
cnt: 8-bit 0..255
pool: samples=5 -> 16 槽淘汰池
:::

::: lab ch8-model
model.title: 近似 LRU 采样精度与 8 位 Morris LFU 对数饱和曲线
model.how: 拖动“maxmemory-samples 抽样数”看左图淘汰误差如何随抽样迅速塌陷（默许 5 个就够接近真 LRU）；再调整右侧“访问次数”和“lfu-log-factor”，观察仅 8 位（0..255）如何靠概率递减拉长百万次跨度。
ctl.samp: maxmemory-samples
ctl.hits: 累计访问次数（10^k）
ctl.fac: lfu-log-factor
fac.0: 0
fac.1: 1
fac.10: 10
fac.100: 100
cv.aria: 左图展示样本数 1 到 20 下近似 LRU 的淘汰名次误差，右图展示不同因子下 8 位 Morris 计数器随访问量对数增长的曲线
cv.ax1: 样本数
cv.ay1: 误差 %
cv.ax2: log10(访问数)
cv.ay2: 8 位计数
read.lru: 近似 LRU 淘汰位次
read.saved: 省下的链表指针（每百万键）
read.cnt: 期望 8 位 LFU 计数
read.prob: 下一次 +1 概率
say: 抽样 {samp} 个键入 16 槽淘汰池，平均踢出最冷前 <em>{lru}</em> 的键，同时省下 {saved} 链表内存；右侧在 factor={fac}、{hits} 次访问下，Morris 计数器期望停在 <em>{cnt} / 255</em>（下一次再递增的概率只有 {prob}）。
:::

再看看后台定期删除怎么避开卡顿：

::: lab ch8e-model keys=ch8.e
model.title: activeExpireCycle 定期采样与 effort 调节
model.how: 设定库里初始已过期的键比例，再拖动 Redis 配置项 `active-expire-effort`（1 到 10），观察一轮采样什么时候停下来，以及能清空多少比例的过期死键。
ctl.pct: 初始已过期键比例
ctl.eff: active-expire-effort
cv.aria: 折线图展示 activeExpireCycle 逐轮采样过程中库内剩余过期键比例的下降轨迹
cv.x: 采样轮次
cv.y: 过期占比 (%)
cv.cut: 容忍上限
read.loops: 执行循环轮次
read.freed: 本次清理键数
read.left: 剩余过期比例
read.kpl: 每轮抽样键数
say: 在 effort = {eff} 下每轮抽 <em>{kpl}</em> 个键、容忍样本过期率 ≤ {stale}%：执行 {loops} 轮后清掉了 {freed} 个死键，库内残留比例从初始值压到 <em>{left}</em>。
:::

两个模型的边界：近似 LRU 模型假定访问分布静态排序，未模拟写多读少造成的时钟回绕（约 194 天）；Morris LFU 模型未计入 `lfu-decay-time` 随空闲分钟衰减减半的效果；定期清理未模拟主循环超 25% 慢周期时间预算硬截断。 {.take}

## 集群分片、哈希标签与逆二进制 SCAN 游标 {#ch9}

::: strings
toc: 哈希槽与 SCAN 游标
:::

单机总有核与内存的天花板，Redis 集群把键空间切进 16,384 个槽位实现分片；而在大字典扩缩容期间遍历全库而不漏键，靠的是反转比特位从高位递增的 SCAN 游标。 {.law}

要跨多台机器水平扩展，Redis Cluster 不按机器数直接取模，而是定义了一层稳定的中间编号：**`{=ch9.slots}` 个哈希槽（0 到 16,383）**。任何键进来，都先跑标准 CRC16-CCITT/XMODEM 校验再对 16,384 取模：比如规范测试键 `"123456789"` 的 CRC16 是 `0x31C3`，落进 **`{=ch9.crcTestSlot}` 号槽**。如果你希望 `user:42:cart` 和 `user:42:orders` 必须待在同一台分片上支持多键原子操作，只需用花括号包住哈希标签 `{42}`——Redis 只对第一个 `{` 和其后首个非空 `}` 之间的 `"42"` 算 CRC16，两者双双命中 **`{=ch9.tagSlot}` 号槽**。

一旦客户端问错了机器，集群用两句重定向回答它：槽位归属早已稳定在另一台节点，回 **`-MOVED`** 让客户端刷新本地槽位路由表；槽位正在热迁移中，先回 **`-ASK`** 指示客户端仅对这一次请求临时改发目标节点（前附 `ASKING` 命令），别乱改永久路由表。

::: diagram dg-slots keys=dg.slots
cap: 图 9　16,384 哈希槽路由与 {hash-tag} 绑定，以及 -MOVED（永久迁移）和 -ASK（迁移中临时重定向）。
aria: 示意图：user:{42}:cart 提取标签 42 映射到 8000 号槽归属 N2 节点，下方对比 MOVED 和 ASK 重定向
moved: -MOVED（更新路由）
ask: -ASK（仅本次）
:::

::: lab ch9-model
model.title: CRC16 哈希槽映射与 {hash-tag} 路由器
model.how: 直接输入任意键名（或点选下方预设键），拖动集群分片节点数，再勾上“槽位正在迁移中”，观察 `{...}` 标签如何锁定同槽，以及集群返回 `-MOVED` 还是 `-ASK`。
ctl.key: 输入键名
ctl.shards: 集群节点数
ctl.mig: 该槽正在迁移中
ctl.preset: 快速预设
pre.cart: user:{42}:cart
pre.orders: user:{42}:orders
pre.vec: 123456789
cv.aria: 绘制 16384 个槽位在各节点间的分布条，并标出当前键命中的槽位与重定向目标
cv.slot: 槽位
cv.shard: 分片 N
read.tag: 参与哈希的片段
read.crc: CRC16（十六进制）
read.slot: 落入槽位（0–16383）
read.route: 客户端收到响应
say.normal: 提取出 <code>{tag}</code> 算得 <code>CRC16 = {crc}</code>，模 16384 命中 <em>{slot} 号槽</em>（归属节点 {owner}）；发错节点会收到 <code>-MOVED {slot}</code> 并刷新路由表。
say.migrating: <em>{slot} 号槽</em> 正从节点 {owner} 迁往节点 {target}：老节点找不到的键会先返回 <code>-ASK {slot}</code>，客户端只能临时向目标节点发一次 <code>ASKING</code>。
:::

**为什么集群和单机上都不能乱敲 `KEYS *`？**因为 `KEYS *` 会在单线程主循环里一次扫完上千万个桶，瞬间重演第 1 章的队头阻塞。生产环境必须用分批返回的 **`SCAN cursor`**。神奇的是：如果扫码扫到一半，哈希表因为渐进式 Rehash 从 8 桶翻倍成 16 桶、或者缩容回 8 桶，`SCAN` 用常规的 `0, 1, 2, 3...` 顺序绝对会漏掉刚拆出去的键！

Redis 作者和 Pieter Noordhuis 在 `dictScan` 里写了一段极其巧妙的位运算：**逆二进制游标（reverse-binary cursor）**：每次先把游标低位以外的比特填 1，做二进制位反转，加 1，再反转回来（`v |= ~m0; v = rev(v); v++; v = rev(v);`）。它相当于在 **8 桶表里按 `0 → 4 → 2 → 6 → 1 → 5 → 3 → 7` 从最高位往低位进位遍历**。翻倍扩容时，原本已经扫完的 `0` 号桶拆成 `0` 和 `8`（二进制高位多 1 个比特），而待扫的 `1` 号桶拆成 `1` 和 `9`——逆二进制游标刚好按前缀树次序依次接上所有未扫分支，做到**扩容零漏键**！

::: lab ch9s-model keys=ch9.s
model.title: 逆二进制 SCAN 游标：扩缩容为何从不漏键
model.how: 拖动“扫描步数”观察逆二进制游标如何按高位优先顺序跳着访问 8 个桶；切换“扫描中途翻倍（8 -> 16）”或“中途缩容（16 -> 8）”，验证全部 16 个键的漏检数始终为 0。
ctl.step: 扫描步数
ctl.mode: 扫描途中表结构变化
mode.none: 保持 8 桶不变
mode.double: 第 4 步翻倍（8 → 16）
mode.shrink: 第 4 步缩容（16 → 8）
cv.aria: 画出 16 个键分布的桶数组，并用金线标出逆二进制游标迄今走过的桶顺序
cv.b8: 8 桶哈希表
cv.b16: 16 桶哈希表
cv.step: 第 {v} 步 -> 桶 {b}
read.cur: 游标 / 当前桶
read.seen: 已扫描键数
read.dup: 重复返回键
read.miss: 完整扫描漏键数
say.none: 逆二进制游标按最高位进位跳过桶，当前第 {step} 步扫到 <em>{bucket} 号桶</em>，全程无扩缩容，完整一轮漏键为 <em>{miss}</em>、重复 {dup}。
say.double: 第 4 步中途从 8 桶翻倍成 16 桶：游标按前缀顺序继续覆盖分裂出来的高位新桶，迄今拿回 {seen}/16 个键，完整扫完一轮的漏键依然是 <em>{miss}</em>。
say.shrink: 第 4 步从 16 桶缩容成 8 桶：高位分支并回低位桶后被完整覆盖，虽然合并桶会带来 <em>{dup} 次</em> 已扫描键重复返回，但漏键数仍保证为 <em>{miss}</em>。
:::

集群路由模型假设各节点均分 16,384 个槽且未展示复制从库读写分离；`SCAN` 模型未演示正在进行渐进式 Rehash 时 `dictScan` 同时扫描 `ht[0]` 与 `ht[1]` 双表的分支逻辑。Lua 脚本或 Redis Functions 同样跑在单线程执行阶段，死循环一样会卡死主事件循环。 {.take}

## 前沿在哪（2026 年 11 月）：Vector Sets、kvobj 与无共享竞品 {#ch10}

::: strings
toc: 前沿在哪
:::

Redis 8 把原生向量集合和统一模块带回核心，同时在社区分叉后与 Valkey 9 和无共享多线程引擎正面对撞：单核极限、网络并发和向量内存成为这一轮工程竞赛的主战场。 {.law}

### 已确立 {#h.est .sub3}

- <span class="tag h">已确立</span> 单线程内存结构 + I/O 复用 + 长度前缀帧的延迟优势受限于单核指令上限与 `fork()` CoW 缺页代价，这是操作系统虚拟内存和 CPU 缓存一致性物理边界决定的；只有把键空间彻底切分到互不共享状态的核上（shared-nothing），多核才能接近线性扩展。 {#e1}
- <span class="tag h">已确立</span> Redis 8.0 在 2025 年 5 月 1 日正式 GA 发布后（统一打包了 JSON、TimeSeries、查询引擎与布隆过滤器等模块，并改采 AGPLv3 / RSALv2 / SSPLv1 三重许可），后续版本持续收敛对象与字典开销：2025 年 8 月的 Redis 8.2 引入 `kvobj` 把短键名、短值和可选过期时间直接打进同一次内存分配；2026 年 5 月的 Redis 8.8 与 2026 年 7 月的 Redis 8.10 陆续推进了原生 Array 与跨键共享字段名模式的 Compact Hashes。 {#e2}

### 已经做出来的 {#h.demo .sub3}

- <span class="tag m">实测推进</span> **Vector Sets（`VADD` / `VSIM`）**：由 Redis 原作者 Salvatore Sanfilippo（antirez）亲手设计并于 Redis 8.0 引入（Beta 起步），它把高维向量嵌入直接做成类似 Sorted Set 的核心数据结构，底层内置 **HNSW** 图并支持真正的双向节点删除与磁盘持久化快照，默认开启 **`Q8`（8 位整数标量量化）**把原始 FP32 向量内存直接压到 1/4（还可选 `BIN` 1-bit 32× 压缩）。 {#d1}
- <span class="tag m">实测推进</span> **Valkey 9 路线（截至 2026 年 11 月）**：Linux 基金会接管的 BSD 3-Clause 社区分叉于 2025 年 10 月 21 日发布 Valkey 9.0（新增原子槽位迁移、Hash 字段过期与集群多 DB），并在 2026 年持续演进至 Valkey 9.2（2026 年 11 月发布）。架构上沿用“核心单线程+多线程异步 I/O”，在 8.x/9.x 里通过 **per-slot 字典**省掉槽位跟踪链表、配合 `dictPrefetch` 预取字典指针降低 CPU 缓存缺失。 {#d2}
- <span class="tag m">实测推进</span> **Dragonfly 与无共享架构**：完全放弃单线程模型，将键空间按分片绑在各核用户态纤程（fiber）上，并用异步无 `fork()` 桶级快照取代 OS Copy-on-Write，彻底消除写时复制的 2× 内存峰值。 {#d3}

### 规范、计划与各家说法 {#h.claim .sub3}

- <span class="tag l">说法与条件</span> **官方与基准声称**：Redis 官方对 Redis 8.0 宣传了 30 多项性能优化与最高 2× 吞吐提升、同步复制缓冲下降最多 35%；Dragonfly 与 Valkey 各自公布的基准测试显示多核高并发下吞吐差距显著，但所有此类数字高度依赖键长、流水线深度、是否启用 TLS 与核数，读基准报告时必须先核对工作负载参数。 {#c1}
- <span class="tag l">说法与条件</span> **还未解决的问题**：Redis 8 核心在单机多核场景依然只有一个主命令执行核，想吃满 64 核仍不得不部署多实例或集群分片；社区围绕 AGPLv3 与 BSD-3-Clause、以及无共享方案在复杂多键事务（如跨分片 Lua 锁）之间的取舍仍将长期并存。 {#c2}

本节所有版本日期、功能名称与路线对比均仅代表 **2026 年 11 月**的公开状态（参考 Redis 官方发布说明、antirez 技术博客及 Valkey 发布文档）。 {.take}

## 收尾：Redis 变慢或内存暴涨时，先问三件事 {#ch11}

::: strings
toc: 收尾：先问三件事
:::

不必背下所有结构体字节数；线上的 Redis 突然丢请求、爆延迟或者内存翻倍，先顺着主事件循环的物理路径问三个问题。 {.law}

{.qs}
- **是不是主线程在堵，还是网络往返在等？** 先看慢查询日志：如果有 `KEYS *`、大集合全删、或者重型 Lua 脚本霸占主循环几毫秒，排在后面的成千上万个微秒命令都会原地陪跑（第 1、9 章）；如果单条命令本身只要几微秒而业务端依然慢，检查是不是没用管道白付了几百次网络往返（第 2 章），或者开启 TLS 后单核系统调用被打满，需要调大 `io-threads`（第 6 章）。 {#q1}
- **内存突然翻倍或踩了大分配门槛吗？** 值从 44 字节涨到 45 字节会从 `embstr` 劈成两块 `raw`，Hash 超出 512 项或 64 字节会退出紧凑的 `listpack`（第 3 章）；如果内存是在做 RDB `BGSAVE` 或 AOF 重写那几分钟突然蹿向两倍，往往是高并发分散写入触发了 `fork()` 写时复制狂拷贝 4 KiB 页（第 7 章）。 {#q2}
- **是过期与淘汰没跟上，还是分片倾斜了？** 大量键在同一秒同时过期、或者开启淘汰后 `maxmemory-samples` 与 `lfu-log-factor` 未贴合访问分布，会导致死键滞留或误杀热键（第 8 章）；集群里如果单个节点 CPU 飙红、或者多键命令报错，查是否漏写了 `{hash-tag}` 或大热点标签把流量全锁死在一个槽位上（第 9 章）。 {#q3}

一句话：Redis 8.0 之所以能稳稳在微秒级回话，靠的不是什么魔法并发黑盒，而是用**单线程砍光锁、用长度前缀和管道避开网络等、用 `embstr`/`listpack` 讨好 CPU 缓存行、用渐进式重哈希和带跨度跳表换取确定性延迟**；几乎每一次线上惊魂，都能在这张图里找到准确的那一格。 {#sum .sum}

延伸阅读：[[how-the-os-talks-to-hardware]]（理解 `epoll` 与系统调用边界），[[how-a-nic-moves-packets]]（看懂 200 微秒网络往返都花在哪里），[[how-virtual-memory-works]]（理解 `fork()` 写时复制与 4 KiB 页表机制），[[why-compute-waits-for-memory]]（理解为什么 64 字节刚好卡住一行 CPU 缓存）。 {#links}

::: footer
**来源。**数据结构布局、常量与算法对照 **Redis 8.0**（2025 年 5 月 1 日 GA 发布，tag `8.0.0`）源码与官方规范：`src/ae.c`（事件循环）、`src/networking.c`（`readQueryFromClient`、RESP2/RESP3 解析与 `io-threads` 异步 I/O）、`src/object.c` 与 `src/sds.h`（`redisObject` 16 B、`sdshdr8` 3 B、`OBJ_ENCODING_EMBSTR_SIZE_LIMIT = 44`）、`src/listpack.c`（紧凑变长编码与 `backlen`）、`src/dict.c` 与 `src/siphash.c`（渐进式 `dictRehash`、`dictScan` 逆二进制游标、SipHash-1-2）、`src/t_zset.c`（`ZSKIPLIST_MAXLEVEL = 32`、`ZSKIPLIST_P = 0.25` 与 `span`）、`src/rdb.c` 与 `src/aof.c`（`BGSAVE` `fork()` 与 Multi-Part AOF）、`src/expire.c` 与 `src/evict.c`（`activeExpireCycle` 20 键采样与 10% 容忍率、`EVPOOL_SIZE = 16` 近似 LRU、`LFU_INIT_VAL = 5` Morris 计数器）、`src/cluster.c`（CRC16-CCITT/XMODEM 与 `{hash-tag}` 16,384 槽）。前沿一章另对照 Redis 官方发布日志（Redis 8.0 / 8.2 / 8.8 / 8.10）、antirez 关于 Vector Sets 的设计文章、Valkey 官方博客（Valkey 9.0 / 9.2）及 DragonflyDB 架构说明（均于 2026 年 11 月核对）。详细出处与未验证项见本页目录中的 `BRIEF.md`。

**模型与交叉验证。**页面不连接后台 `redis-server`（本构建环境未安装本地 `redis-server` 二进制），全部 11 个模型由 `models.js` 以零依赖脚本重现，并由 `tools/crosscheck.cjs` 核对了 RESP2/RESP3 编解码往返、SipHash-2-4 官方测试向量、CRC16 `"123456789" -&gt; 0x31C3` 规范向量、扩缩容下的逆二进制 `SCAN` 零漏键数学性质、跳表 `p=1/4` 与跨度名次恒等式、以及 `LFULogIncr` 期望对数表。本文由 Antigravity（AI）从零编写。
:::
