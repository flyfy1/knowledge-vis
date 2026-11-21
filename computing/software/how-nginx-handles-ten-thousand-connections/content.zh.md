---
lang: zh
title: Nginx 如何扛住上万并发 · 一篇可以动手的长文
desc: 十来行 nginx.conf 配置起一台服务器，紧接着上万个浏览器同时打开长连接。这篇对照 Nginx 1.28.0 稳定版的源码结构与核心算法，从 C10K 内存悬崖、Master-Worker 零停机热重载、epoll 事件循环、11 阶段 HTTP 状态机与 location 优先级、ngx_pool_t 内存池、平滑加权轮询 SWRR、limit_req 漏桶限流、红黑树定时器，一直讲到 sendfile 零拷贝与 proxy_buffering，并附上 2026 年 11 月的 HTTP/3 QUIC 与 Pingora / Envoy 前沿对照。九个可动手模型与九张结构示意图全部按同一套源码规则在页面里运行。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
:::

# Nginx 如何扛住上万并发 {#hero}

::: strings
kicker: 计算机 · 软件原理 · 一篇可以动手的长文
:::

十几行 `nginx.conf` 配置，敲下 `nginx` 启动。<br>面对上万条并发长连接，为什么按“一个连接一个线程”写的服务器会垮，Nginx 却只用几个单线程进程就稳稳接住？ {.sub}

一台现代 Web 服务器常同时挂着成千上万个客户端的 HTTP Keep-Alive 套接字，其中大部分在某个毫秒里其实什么都没发，只是安静地等下一个请求。按传统思路“来一个 TCP 连接就开一条操作系统线程”去写，并发一跨过一万（经典的 C10K 问题），服务器还没跑满网卡带宽，就先死在虚拟内存膨胀、上下文切换抖动和 `accept` 锁争用上。这篇文章只回答一个问题：**几行 Nginx 配置启动之后，几个几乎没有锁的单线程 Worker 进程怎样同时看住一万条连接、精确匹配路由、平滑分发上游、拦住突发流量并做到零停机热重载？** {.lead}

文中的数据结构、常量与核心算法全部对照 **Nginx 1.28.0 稳定版**（2025 年 4 月 23 日发布）的 `src/core/`、`src/event/`、`src/http/` 源码规格；第 10 章单列截至 2026 年 11 月的后续版本与前沿对照。由于本机未安装原生 `nginx` 二进制，页面里的全部模型都用 JavaScript 在客户端按 C 源码规则重写，并由 `tools/crosscheck.cjs` 对照 Nginx 算法不变量与数学闭式解逐项校验（详情见文末及 `BRIEF.md`）。相关背景可先读[[how-the-os-talks-to-hardware]]（系统调用与 `epoll`）、[[how-virtual-memory-works]]（虚拟地址空间与 `fork` 写时复制）、[[how-a-nic-moves-packets]]（网卡多队列与 DMA）和[[tcp-congestion]]（TCP 握手与带宽时延）。每章末尾说明模型省略了哪些现实细节。 {.note}

## C10K 悬崖：为什么“一个连接一条线程”会先塌 {#ch1}

::: strings
toc: C10K 悬崖：栈内存与上下文切换
:::

并发一万时的第一道死线不是网卡吞吐，而是“每个连接绑定一条内核线程”的内存账单与调度开销。Nginx 干脆反过来：按 CPU 核心数只起几个单线程 Worker，每条连接在平坦数组里只占几百字节。 {.law}

下面是一份最小可用的 `nginx.conf`。前几行指定起 4 个 Worker 进程、每个 Worker 最多同时握住 4,096 条连接，接着监听 80 端口。敲下 `nginx` 启动，再改配置时只需发一句 `nginx -s reload`。

::: html ch1-code
code.aria: 最小可运行的 nginx.conf 配置与热重载命令
code: "worker_processes 4;\nevents {\n    worker_connections 4096;\n}\nhttp {\n    server {\n        listen 80 reuseport;\n        location = / { return 200 \"ok\"; }\n        location /static/ { root /var/www; }\n    }\n}\n# 热重载配置：nginx -s reload"
:::

如果照“每连接一条 pthread 线程”去扛 10,000 条 Keep-Alive 连接，Linux 默认的线程虚拟栈上限是每条 `{=ch1.stackMiB} MiB`——光虚拟地址空间就要划出 `{=ch1.virtGiB} GiB`（实际触碰到的栈页、内核 `task_struct` 与线程私有堆按每线程约 128 KiB 计，即使只有 5% 的连接同时活跃，常驻内存也要吃掉约 `{=ch1.threadRss} MiB`）。更致命的是调度：当这 500 个活跃请求在套接字 I/O 上频繁阻塞唤醒，4 个 CPU 核心每秒要应付百万级次线程上下文切换，L1 指令/数据缓存与 TLB 在线程间反复冲刷，按每次切换 3.5 微秒估算，仅调度开销就能吞掉 `{=ch1.ctxPct}%` 的可用算力。

Nginx 的解法彻底断开了“连接数”和“线程数”的绑定。在 Worker 启动函数 `ngx_event_process_init` 里，进程预先按 `worker_connections` 一次性开辟好三段连续数组：`ngx_connection_t`（64 位 Linux 下约 `{=ch1.connB}` 字节）、读事件 `ngx_event_t`（`{=ch1.evtB}` 字节）和写事件 `ngx_event_t`（`{=ch1.evtB}` 字节）。一条空闲的长连接不对应任何线程，只占 `{=ch1.slotB}` 字节；只有正在解析 HTTP 的那 500 个活跃请求会额外借走约 4 KiB 内存池，总计只要 `{=ch1.nginxMiB} MiB`——常驻内存省出 `{=ch1.ramRatio}` 倍，且因为 4 个 Worker 恰好一对一绑在 4 个核心上，跨线程抢核的上下文切换趋近于零。

::: diagram dg-c10k keys=dg.c10k
cap: 图 1　一万条长连接下“一连接一线程”与“Nginx 单线程事件循环 Worker”的内存与结构对比（按 64 位 Linux 结构体字节数估算）。
aria: 示意图：上方红色框为一连接一线程模型，标出 8 MiB 栈和上下文切换悬崖；下方青色框为 Nginx 4 个 Worker 进程，每条连接仅 440 字节平坦槽位
t1: 一连接一线程（10,000 线程）
t1a: 8 MiB 虚拟栈 × 10k = 78.13 GiB
t1b: 内核态调度 + L1/TLB 缓存抖动
n1: Nginx 4 个事件循环 Worker
n1a: 440 B 连接与事件槽 × 10k = 4.20 MiB
n1b: 仅活跃请求分配 4 KiB 内存池
:::

::: lab ch1-model
model.title: C10K 内存与上下文切换账本
model.how: 拖动并发连接数与活跃请求比例，或切换线程默认栈大小，观察“一连接一线程”与 Nginx 在内存及调度开销上的分岔。
ctl.conns: 并发长连接数 N
ctl.active: 活跃请求比例
ctl.stack: 每线程虚拟栈
cv.aria: 并发连接数从 0 到 20,000 时，多线程常驻内存（红线）与 Nginx 连接及池内存（青线）的变化曲线
cv.x: 并发长连接数 N
cv.y: 常驻内存 (MiB)
leg.thread: 一连接一线程常驻内存
leg.nginx: Nginx 连接槽 + 活跃池
read.virt: 线程虚拟栈总预留
read.trss: 线程模型常驻内存
read.nrss: Nginx 连接与池内存
read.ctx: 线程上下文切换占 CPU
say.light: 在 {n} 条连接、{act} 个活跃请求下，压力尚轻：线程模型虚拟栈 {virt}、常驻约 {trss}，调度占 {ctx}；Nginx 连接与活跃池仅占 {nrss}。
say.cliff: 连接推到 {n} 条时悬崖开始显现：线程虚拟栈已达 {virt}，调度开销占去 {ctx} CPU；Nginx 只需 {nrss}（内存相差约 <em>{ratio} 倍</em>）。
say.collapse: <em>C10K 崩塌区</em>：{n} 条连接中 {act} 个活跃请求引发密集阻塞唤醒，线程上下文切换与抖动已吞噬 <em>{ctx}</em> 的核时；Nginx 只占 {nrss} 却毫无线程切换负担。
:::

想理解为什么虚拟栈 `{=ch1.virtGiB} GiB` 不会瞬间把 16 GiB 物理内存撑爆，直到线程真的触碰栈页才分配物理页框，可以看[[how-virtual-memory-works#ch1|「虚拟内存是怎么工作的」第 1 章与第 7 章]]。

模型省掉了：每个 Worker 自身二进制与共享库约数 MiB 的固定底噪、TLS 会话上下文内存，以及线程模型可通过协程/线程池缓解但仍需用户态栈切换的折中方案。调度开销按 4 核、每次切换 3.5 微秒的参数化估算，只作数量级对比。 {.take}

## Master 与 Worker：零停机热重载是怎么接力的 {#ch2}

::: strings
toc: Master-Worker 与热重载
:::

Nginx 的进程分工只有一句话：Master 只负责管配置、绑定端口与发信号，永远不接客户端字节；热重载时新旧两代 Worker 同时握着同一个监听套接字做无损交接。 {.law}

生产环境改一行路由规则不想断掉正在下载大文件的用户，靠的正是 Master–Worker 两层结构。Master 在启动时以特权绑定 `:80` / `:443` 的监听套接字（比如文件描述符 `fd=6`），再通过 `fork()` 生出 Worker 进程。根据操作系统进程继承规则，所有子进程天然共享同一份指向内核监听套接字的表项。

当你执行 `nginx -s reload`（等价于向 Master 发 `SIGHUP` 信号）时，Master 按固定顺序完成五步接力：检查新配置语法、打开新日志文件、用新配置 `fork()` 出一批**新 Worker（v2）**、让 v2 立刻继承监听 `fd=6` 开始 `accept()` 新来的 TCP 握手，最后向**旧 Worker（v1）**发送优雅关闭命令（`NGX_CMD_QUIT`）。旧 Worker 收到指令后立刻把监听套接字从自己的事件循环里摘掉，不再接任何新连接，但把手头正在发响应的存量连接一直服务到彻底发完，才逐个退出；如果是整包升级二进制，流程则是 `USR2` 拉起新 Master、`WINCH` 让旧 Worker 优雅排空、`QUIT` 退出旧 Master。

::: diagram dg-reload keys=dg.reload
cap: 图 2　SIGHUP 热重载时 Master、旧代 Worker（排空存量）与新代 Worker（接管新握手）对同一监听套接字 FD=6 的无缝交接。
aria: 示意图：上方金色 Master 进程向左侧红色虚线旧 Worker 发送 QUIT 信号排空存量，同时向右侧绿色新 Worker 传递 FD=6 接管新握手，底部注明 0 丢包
m1: Master 主进程 (管配置与端口)
m2: 持有监听套接字 FD=6 · 转发 SIGHUP
o1: 旧代 Worker v1
o2: 停接新连接
o3: 把存量响应发完
n1: 新代 Worker v2
n2: 继承 FD=6
n3: 立即接新握手
foot: 交接全程零毫秒中断 · 0 个连接被 RST
:::

::: lab ch2-model
model.title: nginx -s reload 热重载时间轴
model.how: 拖动“时间 t”走完从发信号到旧代排空的全程，调整最长存量响应尾巴；切换“硬重启”模式，对比粗暴 stop/start 会断掉多少连接。
ctl.time: 当前时刻 t
ctl.tail: 旧连接最长排空尾巴
ctl.mode: 重载方式
mode.graceful: 优雅热重载 (SIGHUP)
mode.hard: 硬重启 (stop + start)
cv.aria: 4 个旧 Worker 进程逐个排空退出与新代 4 个 Worker 立即接管的时间轴泳道图
cv.x: 时刻 t (ms)
leg.old: 旧代 v1 进程存续
leg.new: 新代 v2 接管流量
leg.drop: 监听空窗 / RST 断连
read.old: 仍在排空的旧 Worker
read.new: 正在接客的新 Worker
read.inflight: v1 剩余在途连接
read.drop: 累计被断掉的连接
say.pre: t = {t} ms（重载尚未触发）：4 个旧代 Worker（v1）正常接管全部流量，新代尚未出生。
say.draining: t = {t} ms（排空交接中）：新代 {newW} 个 Worker 已继承监听端口接下全部新请求；旧代仍有 {oldW} 个进程在把最后 {inf} 条存量响应发完，<em>0 条连接被中断</em>。
say.done: t = {t} ms（交接完成）：全部旧代 Worker 已干净退出，只剩新代 {newW} 个 Worker 跑着新配置，整个热重载期间共丢弃 <em>0</em> 条连接。
say.hard: <em>硬重启断流</em>（t = {t} ms）：先杀旧进程再重开监听，正在处理的 20 条连接当场收到 RST，叠加重启窗口内新来的握手，共丢弃 <em>{drop}</em> 条连接。
:::

如果把默认设定代入模型：在 `t = 1,200 ms`、最长排空尾巴 `1,200 ms` 时，4 个旧 Worker 中较快发完的 2 个已经退出，只剩 `{=ch2.oldAlive}` 个旧 Worker 还在排空，而 `{=ch2.newAlive}` 个新 Worker 早已从第 500 ms 起无缝接满全部新握手；换成硬重启，同样时刻已经丢掉了 `{=ch2.hardDrop}` 条连接。`fork()` 为什么能在一瞬间拉起新 Worker 而不用把主进程内存全量拷贝一份，底层靠[[how-virtual-memory-works#ch9|「虚拟内存是怎么工作的」第 9 章写时复制]]。

模型省掉了：`worker_shutdown_timeout` 强制超时兜底、`USR2` 新旧双 Master 并行时的环境变量 `NGINX` 传 FD 细节，以及每个旧 Worker 在关闭阶段可能继续维持长响应流式传输的时间长尾。 {.take}

## 非阻塞事件循环：`epoll` 与 `SO_REUSEPORT` 如何用 O(活跃) 盯住一万条套接字 {#ch3}

::: strings
toc: epoll 事件循环与惊群
:::

一万条连接在同一个毫秒里真正在收发数据的往往只有几十条。`select` / `poll` 每次循环都把一万个格子从头扫到尾，而 `epoll_wait` 只把内核红黑树里真正就绪的那几十条塞进就绪链表端给你。 {.law}

把所有描述符设为非阻塞（`O_NONBLOCK`）之后，Nginx 每个 Worker 的核心循环 `ngx_process_events_and_timers` 极其简短：算出下一次定时器还要等多久，调用一次 `epoll_wait`（FreeBSD/macOS 上是 `kqueue`）睡在内核里；一旦网卡收包中断通过协议栈唤醒对应的套接字内核结构，内核回调函数就把它的 `epitem` 挂进双向就绪链表 `rdllist`。`epoll_wait` 返回时只交付这 `k` 个真正有字节可读或可写的连接，Worker 顺序处理完它们就回到下一轮等待。

对照模型算一笔账：面对 10,000 条 Keep-Alive 连接，假定这一毫秒只有 40 条真正有包到达。用 `select`/`poll` 每次必须把整张 10,000 位的位图在用户态与内核态之间来回拷贝并逐位扫描 `O(N)`，一次事件等待开销约 `{=ch3.selectUs}` 微秒；而 `epoll` 只需把就绪链表里的 40 条取出处理 `O(k)`，耗时仅 `{=ch3.epollUs}` 微秒——检查的描述符数量足足差了 `{=ch3.scanRatio}` 倍。

多 Worker 抢同一张监听端口还有第二重陷阱：**惊群（Thundering Herd）**。早期内核里，一个新 TCP 握手进来会同时唤醒等在同一个监听套接字上的所有 4 个 Worker，结果只有 1 个能 `accept()` 成功，其余 3 个白白被唤醒又睡回去。Nginx 早期靠共享内存里的 `accept_mutex` 轮流抢锁解决；从 1.11.3 版起，由于现代 Linux 提供了内核级单唤醒标志 `EPOLLEXCLUSIVE`（Nginx 代码里的 `NGX_EXCLUSIVE_EVENT`），`accept_mutex` 的默认值直接改成了 `off`。而在配置里加上 `listen 80 reuseport;` 之后，Linux 内核会给每个 Worker 单独建一条独立的监听套接字与半连接/全连接队列，网卡握手包由内核按五元组哈希直接投递到目标 Worker，连同一把监听队列自旋锁都省掉了。

::: diagram dg-epoll keys=dg.epoll
cap: 图 3　select/poll 每轮 O(N) 扫描全表，对比 epoll 只返回 O(活跃) 就绪链表及 SO_REUSEPORT 为每个 Worker 拆出独立监听队列。
aria: 示意图：上方红色 select/poll 每次复制扫描一万个描述符；中间青色 epoll/kqueue 内核 rdllist 只吐出 40 个活跃连接；下方金色 SO_REUSEPORT 每个 Worker 拥有独立监听队列
s1: select / poll：每轮 O(N) 全表扫描
s2: 10,000 比特位图每次在用户/内核间拷贝
e1: epoll / kqueue：每轮 O(活跃) 就绪链表
e2: epoll_ctl 只注册一次，就绪节点入 rdllist
e3: 10,000 条连接只吐出 40 个活跃事件
r1: SO_REUSEPORT（listen ... reuseport）
r2: 每个 Worker 独立监听队列，内核哈希直投
:::

::: lab ch3-model
model.title: select O(N) 与 epoll O(k) 及多核派发实验
model.how: 拖动长连接总数 N 与每轮活跃数 k，再切换三种多 Worker 监听派发方式，观察检查耗时如何从随 N 暴涨变成只跟 k 相关。
ctl.conns: 挂着的总连接数 N
ctl.active: 本毫秒活跃数 k
ctl.dispatch: 多 Worker 派发策略
disp.shared: 共享队列 (无互斥)
disp.mutex: accept_mutex / EPOLLEXCLUSIVE
disp.reuseport: SO_REUSEPORT
cv.aria: 随总连接数 N 增加，select/poll（红线）线性攀升而 epoll/kqueue（青线）保持水平对照曲线
cv.x: 总连接数 N
cv.y: 单轮事件检查估算耗时 (µs)
leg.select: select / poll O(N)
leg.epoll: epoll / kqueue O(k)
read.sel: select 估算耗时
read.ep: epoll 估算耗时
read.ratio: 扫描描述符倍数
read.wake: 每次 SYN 唤醒 / 队列数
say.shared: 共享监听队列（无单唤醒）：{n} 条连接里只有 {k} 条活跃时，epoll 把时间从 {sel} 压到 {ep}（少扫 {ratio} 倍）；但新握手一来会同时惊醒 <em>{wake} 个 Worker</em> 抢同一把锁。
say.mutex: 开启 accept_mutex 或内核 EPOLLEXCLUSIVE：epoll 只扫 {k} 条（{ep} 对 {sel}），新握手每次只唤醒 <em>1 个 Worker</em>，消除了惊群，但仍共用 1 条内核监听队列。
say.reuseport: 开启 <em>SO_REUSEPORT</em>：epoll 只处理 {k} 条活跃事件（{ep}），同时内核为 4 个 Worker 各建一条独立监听队列并直接哈希派发，单次只唤醒 1 个 Worker 且无队列锁争用。
:::

内核如何借助 `epoll` 的就绪链表以及网卡接收端缩放（RSS）在多核间分流中断，可以参考[[how-the-os-talks-to-hardware#ch11|「操作系统是怎么和硬件说话的」第 11 章]]和[[how-a-nic-moves-packets#ch5|「网卡是怎么搬运数据包的」第 5 章]]。

模型省掉了：边缘触发（ET，Nginx 默认在 `epoll` 上使用 `EPOLLET`）要求必须把缓冲区读到 `EAGAIN` 的循环、真实内核调度唤醒延迟，以及 `reuseport` 在热重载与老连接哈希漂移时的连接分发不均问题（第 10 章详述）。 {.take}

## 11 阶段状态机与 `location` 匹配优先级 {#ch4}

::: strings
toc: 11 阶段状态机与 location 路由
:::

一个 HTTP 请求进入 Nginx，不是把配置文件从第一行顺着念到最后一行，而是穿过 `ngx_http_phases` 定义的 `{=ch4.phases}` 个固定阶段；其中第 3 阶段找 `location` 块的胜负全由修饰符的硬优先级决定，而不是书写顺序。 {.law}

在 `src/http/ngx_http_core_module.h` 中，Nginx 把每个请求拆成 `{=ch4.phases}` 个阶段依次推进：`POST_READ`（刚读完请求头）、`SERVER_REWRITE`（server 级 `rewrite`）、`FIND_CONFIG`（查 `location`）、`REWRITE`（location 级 `rewrite`）、`POST_REWRITE`（若 URI 被改写则跳回 `FIND_CONFIG` 重配）、`PREACCESS`（`limit_req` 和 `limit_conn` 就插在这里）、`ACCESS`（IP 黑白名单 `allow`/`deny` 与鉴权）、`POST_ACCESS`、`PRECONTENT`（`try_files` 与镜像）、`CONTENT`（真正吐出静态文件或 `proxy_pass` 转发上游），以及收尾的 `LOG`。正因如此，哪怕你在 `nginx.conf` 里把 `allow 10.0.0.1;` 写在 `limit_req` 上面，请求依然会先过 `PREACCESS` 的限流模块，再到 `ACCESS` 鉴权模块。

而在 `FIND_CONFIG` 阶段（`ngx_http_core_find_location`），Nginx 已经提前把所有静态前缀 `location` 编进一棵静态二叉查找树，按死规则分四步裁决：

1. **精确匹配（`=`）**：先比完全相等。一旦命中（如 `location = /`），当场锁定并跳过后面所有前缀和正则。 {#s1}
2. **前缀树找最长前缀（含 `^~`）**：在普通前缀与 `^~` 前缀里挑出**匹配长度最长**的那一条。如果胜出的这条最长前缀恰好带着 `^~` 修饰符（即内部标志 `noregexp`），Nginx 立刻锁死它并**彻底跳过所有正则**；如果不带 `^~`，先记下它作保底候选，继续往下走。 {#s2}
3. **按配置文件顺序逐条跑正则（`~` 区分大小写 / `~*` 不区分）**：只要第一条正则匹配成功，立刻赢下路由；只有在正则之间，书写先后才算数。 {#s3}
4. **正则全军覆没时兜底**：回到第 2 步记下的那条最长前缀。 {#s4}

最容易踩的坑就在第 2 步：假如你写了 `location ^~ /static/`（长度 8）的同时，又写了 `location /static/images/`（长度 15，但忘了加 `^~`），一个请求 `/static/images/pic.jpg` 进来时，前缀树会选出更长的 `/static/images/`；因为这棵树只看**最长胜出节点自己**有没有 `^~`，它没有，于是 Nginx 依然会去跑后面的图片正则！

::: diagram dg-phases keys=dg.phases
cap: 图 4　ngx_http_phases 定义的 11 个 HTTP 处理阶段，以及 REWRITE 改写 URI 后回跳 FIND_CONFIG 的循环路径。
aria: 示意图：从上到下六个阶段分组，包含 0 POST_READ 到 10 LOG，其中第 2 阶段标出 location 优先级顺序，第 3-4 阶段有紫色箭头跳回第 2 阶段
p1: 0 POST_READ · 1 SERVER_REWRITE
p1s: 读完请求头 · 服务级 rewrite
p2: 2 FIND_CONFIG (匹配 location)
p2s: = 精确 > ^~ 前缀停正则 > ~/~* > 最长前缀
p3: 3 REWRITE · 4 POST_REWRITE
p3s: location 内改写 URI 会跳回阶段 2
p4: 5 PREACCESS · 6 ACCESS · 7 POST
p4s: limit_req 限流先于 allow/deny 鉴权
p5: 8 PRECONTENT · 9 CONTENT
p5s: try_files 与静态文件 / proxy_pass 上游
p6: 10 LOG
p6s: 请求结束写访问日志与释放内存池
:::

::: lab ch4-model
model.title: location 优先级判定器 (ngx_http_core_find_location)
model.how: 点选不同的请求 URI，并开关 <code>^~ /static/</code> 与两条正则的书写顺序，观察每条规则在什么阶段胜出或被跳过。
ctl.uri: 请求 URI
ctl.hat: /static/ 带 ^~ (跳过正则)
ctl.order: 正则先后顺序
ord.cs: ~ (区分大小写) 在前
ord.ci: ~* (不区分) 在前
cv.aria: 六条 location 规则按 Nginx 实际求值路径逐条点亮胜出、候选、跳过或未命中的决策图
read.winner: 最终胜出的 location
read.kind: 胜出机制
read.checked: 本次排查的规则数
kindExact: 精确匹配 (=)
kindHalt: 最长前缀 ^~ 阻断正则
kindRegex: 正则首匹配胜出
kindFallback: 最长前缀兜底
st.win: 胜出
st.cand: 候选兜底
st.skip: 已跳过
st.miss: 未命中
say.exact: 请求 <code>{uri}</code> 在第 1 步直接命中精确规则 <em>{win}</em>，只查了 {checked} 条规则就立即锁定，后面的前缀与正则全被跳过。
say.prefix_halt: 请求 <code>{uri}</code> 在第 2 步前缀树里匹配到最长前缀 <em>{win}</em>；因为它带有 <code>^~</code> 标志，Nginx 直接阻断并跳过全部正则规则。
say.regex: 请求 <code>{uri}</code> 的最长前缀没有带 <code>^~</code>，于是进入第 3 步按配置文件顺序试跑正则，第一条命中的 <em>{win}</em> 胜出。
say.prefix_fallback: 请求 <code>{uri}</code> 经过精确与正则测试全部未命中，最后由第 2 步暂存的最长前缀 <em>{win}</em> 兜底接手。
:::

试着先选 `/static/logo.png` 并勾上 `^~ /static/`（`^~` 阻断正则胜出），再改选 `/static/images/pic.jpg`：你会亲眼看到即使 `^~ /static/` 还开着，更长的普通前缀 `/static/images/` 抢走了前缀树冠军，却因为自己没有 `^~` 而把控制权交回给了后面的正则！这就是无数线上图片缓存规则莫名失效的真正原因。

模型省掉了：目录结尾自动补斜杠的 301 跳转（`NGX_DONE`）、命名 location（`@fallback`）的内部重定向，以及最多 10 次的内部重跳上限保护（`limit_internal_redirects`）。 {.take}

## 按请求分配的内存池与零散缓冲区链 {#ch5}

::: strings
toc: ngx_pool_t 内存池与缓冲区链
:::

为了避免每来一个请求就调几十次 `malloc()` / `free()` 把堆切得支离破碎，Nginx 给每个请求单独建一个连续内存池 `ngx_pool_t`，小对象用指针往前推着分，请求结束时整块一起释放。 {.law}

一个 HTTP 请求从解析 URI、切分十几个请求头到拼装上游请求，随手就要分配几十块几十到几百字节的小内存。在通用 `malloc` 堆里高频申请释放尺寸参差不齐的小块，不仅要走堆锁或线程本地缓存，更容易在长跑几周后留下一堆外部碎片。

Nginx 在 `src/core/ngx_palloc.h` 里把这件事缩成了极其朴素的指针加法。创建内存池时先划一整块内存（默认池 `NGX_DEFAULT_POOL_SIZE` 是 `{=ch5.defPool} KiB`，单个 HTTP 请求通常按 4 KiB 划出），最前面 `{=ch5.hdrB}` 字节留给 `ngx_pool_t` 控制头，记下两个指针：`d.last` 指向空闲区起点，`d.end` 指向本块末尾；同时定死小块上限 `pool->max`（在 4 KiB 内存池里为 `4096 - 80 = {=ch5.maxSmall}` 字节，上限不超过 `NGX_MAX_ALLOC_FROM_POOL = 4095` 字节）。每次申请小内存，只需把 `d.last` 按 16 字节对齐后往后推 `size` 字节，零系统调用、O(1) 完成。

装不下了怎么办？Nginx 再申请一块同规格的新内存块串在 `d.next` 链表后面（续块只带 32 字节小头 `ngx_pool_data_t`）；而且某个老块连续失败 4 次之后，`pool->current` 指针就干脆往后挪一格，以后不再回头白白试探前面装满的老块。要是遇到超过 `pool->max` 的大块，就直接走系统 `malloc` 挂到 `pool->large` 链表。等请求进入 `LOG` 阶段收尾时，一次 `ngx_destroy_pool()` 顺着两条短链表把所有块和清理回调（比如关闭打开的文件句柄）一锅端掉。在默认模型参数下，12 次各 512 字节的小分配只用了 `{=ch5.blocks}` 个池块，销毁时只需 `{=ch5.frees}` 次释放，而不是 12 次 `free()`。而在写响应体时，Nginx 用链表 `ngx_chain_t` 把分布在不同池块和内核文件描述符上的 `ngx_buf_t` 串起来发给内核 `writev`，连拼大字符串的内存拷贝也一并省掉。

::: diagram dg-pool keys=dg.pool
cap: 图 5　ngx_pool_t 的结构：头部占 80 B，小对象在块内按 16 B 对齐顺着 d.last 推指针分配；装不下时挂 d.next 续块，超限大块单挂 pool->large。
aria: 示意图：第一条 4 KiB 内存块由 80 B 头部、金色已分配小对象和空闲区组成；通过 d.next 链向带 32 B 头的第二块；超限大块单独挂在红色 pool->large 链表上
b0: ngx_pool_t 块 0 (4 KiB)
used: d.last 指针推进
free: 剩余空间
used2: 续块内分配
lg1: size > maxSmall (4,016 B)
lg2: 直接 malloc() 并挂入 pool->large
end: 请求结束时 ngx_destroy_pool() 整块回收
:::

::: lab ch5-model
model.title: ngx_pool_t 指针推进分配器
model.how: 拖动每次分配的对象大小与次数，观察小对象如何在块内挨个紧贴、装满后连出 d.next 续块，以及一旦越过 pool->max 阈值如何立刻退化成 pool->large 的逐个 malloc。
ctl.size: 单次分配大小
ctl.count: 分配次数
ctl.pool: 池块大小
cv.aria: 每个池块内部头部、已分配小对象与空闲区字节占比，以及越界大块列表的可视化布局
leg.hdr: 池控制头 (80 B / 32 B)
leg.small: 池内对齐分配
leg.large: pool->large 独立 malloc
read.blocks: 使用的内存池块数
read.large: 独立 malloc 大块数
read.waste: 尾部与对齐余量
read.frees: 销毁时 free 次数 vs 对象数
cv.blk: 块 {i}: 已用 {used} / {cap} B ({items} 个对象)
cv.more: + 还有 {n} 个 {ps} 池块…
say.small_one: {n} 次各 {sz} B 的分配全被塞进 <em>1 个 {ps} 池块</em>（上限 {max} B）；销毁请求时 1 次 <code>ngx_destroy_pool</code> 就全部释放。
say.small_multi: 1 个池块装不下 {n} 次 × {sz} B，于是 <code>ngx_palloc_block</code> 顺着 <code>d.next</code> 挂出了 <em>{blk} 个 {ps} 块</em>；请求结束一共只需 <em>{frees} 次</em>释放。
say.large: <em>越过大块阈值</em>：{sz} B 超过了 <code>pool->max</code>（{max} B），{n} 次分配全部退化成直接调用系统 <code>malloc</code> 挂入 <code>pool->large</code>，请求结束得逐一释放 {frees} 次。
:::

模型省掉了：请求体内大缓存复用机制、共享内存里使用的 slab 分配器（`ngx_slab_pool_t`，第 7 章 `limit_req` 用它存限流状态），以及小块对齐后剩在末尾那点无法再分配的内部碎片在不同工作负载下的统计分布。 {.take}

## 平滑加权轮询：为什么 `{5, 1, 1}` 不是连打五次 A {#ch6}

::: strings
toc: 平滑加权轮询 SWRR
:::

朴素加权轮询会把权重 5 的后端连打 5 次才换人，瞬间砸出毛刺；Nginx 在 `ngx_http_upstream_get_peer` 里用加有效权重再减总权重的方式，把 `{5, 1, 1}` 摊成 `{=ch6.seq}`。 {.law}

假设你给三台后端服务器配了权重：`A = 5`、`B = 1`、`C = 1`，总权重是 7。最省事的“朴素加权轮询”是展开成一个数组 `[A, A, A, A, A, B, C]` 轮着取。按比例算 A 确实拿了 5/7 的流量，但在每个周期的开头，A 要被**连续暴击 `{=ch6.naiveMax}` 次**，随后歇整整两拍，而 B 和 C 每次都紧挨着收到冷启动或排空压力。

Nginx 在 `src/http/ngx_http_upstream_round_robin.c` 里的写法只多了一行减法，效果却完全不同。每个后端多记一个动态变量 `current_weight`（初始为 0）和一个恢复变量 `effective_weight`（正常时等于静态 `weight`）。每来一个请求：

1. 把每台后端的 `current_weight` 各自加上它的 `effective_weight`，同时算出当前所有有效权重之和 `total`； {#s1}
2. 挑出 `current_weight` **最高**的那台作为本轮赢家； {#s2}
3. 把**赢家**的 `current_weight` 减去刚才算出的总权重 `total`。 {#s3}

就靠这一加一减，整个数组在每一步结束时永远满足一条漂亮的数学不变量：**所有后端的 `current_weight` 之和恒等于 0**，所以一轮（7 个请求）跑完，`current_weight` 必然一丝不差地归零 `[0, 0, 0]` 回到起点。对 `{5, 1, 1}` 来说，7 步吐出的序列恰好是 `{=ch6.seq}`——原本连打 `{=ch6.naiveMax}` 次的 A 被切开插入了 B 和 C，最大连续命中降到 `{=ch6.swrrMax}` 次。要是 A 途中失败一次，Nginx 会把它的 `effective_weight` 往下扣一截暂避锋芒，随后每过一轮悄悄加 1（`if (effective_weight &lt; weight) effective_weight++`）让它平滑爬坡恢复，避免刚恢复健康的节点一瞬间被全量流量压垮。

::: diagram dg-swrr keys=dg.swrr
cap: 图 6　{A:5, B:1, C:1} 权重下 Nginx 平滑加权轮询的 7 步周期，以及每步结束后 current_weight 总和恒为零的不变量。
aria: 示意图：上方七个方格按序排列 A、A、B、A、C、A、A，下方列出每轮累加有效权重、挑最高者减去总权重 7、周期结束归零的不变量
head: {A:5, B:1, C:1} 的 7 步周期（总权重 = 7）
r1: cw += eff -> 挑最大 -> 赢家 cw -= 7
r2: 连续连击 A 的最大次数从 5 次降到 2 次
inv1: 守恒不变量：sum(current_weight) ≡ 0
inv2: 第 7 步结束后，三台权重精确回到 [0, 0, 0]
:::

::: lab ch6-model
model.title: 平滑加权轮询 (ngx_http_upstream_get_peer) 步进器
model.how: 调节三台后端的静态权重，在“平滑加权轮询”和“朴素顺序展开”间切换；勾上“模拟 A 刚发生 1 次失败”，看 <code>effective_weight</code> 如何扣减又每轮 +1 缓慢回血。
ctl.wa: 后端 A 权重
ctl.wb: 后端 B 权重
ctl.wc: 后端 C 权重
ctl.algo: 调度算法
algo.swrr: Nginx SWRR (平滑)
algo.naive: 朴素加权 (顺序连发)
ctl.fail: 模拟 A 刚失败 1 次 (慢恢复)
cv.aria: 上方为单周期内的请求分配色条，下方为三台后端在每一步结束后的 current_weight 锯齿变化轨迹
cv.seq: 请求派发序列
cv.x: 请求序号
cv.y: current_weight
leg.a: 后端 A
leg.b: 后端 B
leg.c: 后端 C
read.seq: 前几轮调度序列
read.streak: 最大连续命中 A
read.period: 完整周期长度
read.sum: 末尾 cw 总和守恒
say.smooth: 权重 ({wa}, {wb}, {wc}) 的周期为 {per}：Nginx SWRR 产出 <code>{seq}</code>，对 A 的最大连续连击压到 <em>{streak} 次</em>（朴素算法要连打 {naiveStreak} 次），每步结束后权重和恒为 0。
say.naive: <em>朴素加权对比</em>：在 {per} 个请求里先把 A 连打 <em>{streak} 次</em> 再发 B、C，后端瞬间承受高并发毛刺。
say.recover: <em>故障慢恢复模式</em>：A 的有效权重先被削半暂避，每过一轮只向上加 1 爬坡回 {wa}；前两轮序列为 <code>{seq}</code>，防止刚活过来的节点被瞬间压死。
:::

模型省掉了：`max_fails` / `fail_timeout` 熔断踢除整台机器的计时器、`backup` 备用服务器池、以及当上游启用长连接保活池时“同一个 Worker 单独维护各自 SWRR 状态”导致的多 Worker 各自独立的局部序列。 {.take}

## 漏桶限流（`limit_req`）：`rate`、`burst` 和 `nodelay` 怎么算放行与排队 {#ch7}

::: strings
toc: limit_req 漏桶限流
:::

`limit_req` 不是按整秒清零的简单计数器，而是放在所有 Worker 共享内存红黑树里按毫秒匀速漏水的漏桶：`excess` 算到毫请求级，超 `burst` 当场返 `503`。 {.law}

如果限流器只在整数秒边界上计数清零，恶意请求卡在 `0.99 秒` 和 `1.01 秒` 各打满一轮，瞬间就能把后端砸出两倍脉冲。Nginx 在 `src/http/modules/ngx_http_limit_req_module.c` 的 `ngx_http_limit_req_lookup` 里用的是一条毫秒级连续漏水的公式，而且为了在内核态和无浮点环境下算得又快又准，把“1 个请求”放大成整数 `{=ch7.scale}`：

`excess = lr->excess - ctx->rate * ms / 1000 + 1000`

这里 `lr->excess` 是上一次通过的请求留下的桶内余量（首条请求新建节点时记为 `0`），`ms` 是这次离上次通过隔了多少毫秒，`rate` 同样预先乘以 `{=ch7.scale}`。只要算出来的 `excess` 大于 `burst * 1000`，当场判定溢出返 `503`（`NGX_BUSY`），而且**一个关键细节是此时绝不覆盖 `lr->excess` 和 `lr->last`**——被拦在门外的洪水不会把原本的桶水漫得更高。只有放行时才更新桶水位：没加 `nodelay` 时，多余水位必须排队休眠 `excess / rate` 毫秒才往后端放行，把尖峰彻底拉平；加了 `nodelay` 时，只要桶装得下（`excess &lt;= burst * 1000`）就零延迟立即放行，同时把桶先占满，靠后面按 `rate` 慢慢漏空。

拿默认值算一笔账：限速 `rate = 5 r/s`（每 200 ms 漏掉 1 个请求），`burst = 4`，每 20 ms 连续冲进来 8 个请求。第 1 个（水位 `0`）立刻放行；第 2 到第 5 个把水位一路推到 `3,600`（相当于 3.6 个请求），在不加 `nodelay` 时这 `{=ch7.qDelay}` 个请求分别排队最多 `{=ch7.qMaxMs}` ms，后面第 6–8 个全算超 `4,000` 直接拒掉 `{=ch7.qDrop}` 个；勾上 `nodelay` 后，前 `{=ch7.nImm}` 个当场零延迟通过，同样保住了第 6–8 个的拦截红线。因为这个红黑树和 LRU 淘汰链放在 `ngx_shm_zone_t` 共享内存里，由一把轻量原子自旋锁保护，所以 4 个 Worker 共享同一口水桶，不会让单机限流变成“乘以 Worker 数”。

::: diagram dg-limit keys=dg.limit
cap: 图 7　ngx_http_limit_req_module 的跨 Worker 共享内存漏桶：超过 burst 虚线的请求被拒为 503 且不增加水位，桶内水位以恒定速率 rate 向下漏水。
aria: 示意图：青色漏桶内有水位 excess，上方金色虚线标出 burst 上限，超限向右分流到红色 503 框，底部绿色箭头按 rate 匀速漏水，下方紫色框说明位于跨进程共享内存红黑树内
burst: burst × 1000 上限
excess: 桶内余量 lr->excess
leak: 匀速漏出 rate*ms/1000
shm: 跨 Worker 共享内存红黑树 (ngx_shm_zone_t)
eq: new = old - rate*ms/1000 + 1000
:::

::: lab ch7-model
model.title: limit_req 漏桶推演仪 (ngx_http_limit_req_lookup)
model.how: 调节稳态漏速 <code>rate</code>、桶容 <code>burst</code> 与短脉冲请求数，再开关 <code>nodelay</code>，看水位如何按毫秒抬升、排队延时或触发 503 溢出拒绝。
ctl.rate: 稳态速率 rate (r/s)
ctl.burst: 桶容量 burst
ctl.spike: 20ms 间隔突发请求数
ctl.nodelay: 开启 nodelay (桶内零延迟直通)
cv.aria: 连续突发请求逐个进入漏桶时的候选水位高度柱状图，绿色为立即放行，金色为延迟排队，红色为超 burst 拒绝 503
cv.x: 突发请求序号 (每 20 ms 到达 1 次)
cv.y: 候选桶水位 (请求单位)
leg.imm: 立即放行 (200)
leg.del: 桶内延迟排队 (200)
leg.rej: 超 burst 溢出拒收 (503)
read.imm: 立即放行数
read.del: 排队延迟放行数
read.rej: 被拒 503 数
read.wait: 最大排队延迟
say.zero_burst: <em>严格平滑（burst = 0）</em>：第 1 个请求立即通过后，间隔小于 {rate} r/s 步长的其余突发全部吃 503（共拒收 {rej} 个），没有任何缓冲余地。
say.queued: <em>排队整形模式（无 nodelay）</em>：除首请求外，{del} 个请求被桶接住并按漏速匀速推迟（最长等 <em>{wait} ms</em>），超限的 {rej} 个直接 503 拒收。
say.nodelay: <em>突发直通模式（nodelay）</em>：只要桶装得下，前 <em>{imm} 个</em>请求零等待直接放行同时占满桶额度，之后超限的 {rej} 个一样吃 503 拦截。
say.clean: 在 {rate} r/s 漏速与 burst={burst} 下，这 {spike} 个请求全数通过且桶未产生任何排队积压。
:::

模型省掉了：`limit_req` 的 `delay N` 半排队半直通参数、共享内存耗尽时顺着 LRU 链淘汰最老键的逻辑（`ngx_http_limit_req_expire`），以及客户端跨越多毫秒后的完整长窗口恢复曲线。 {.take}

## 红黑树定时器：一万个超时怎么只靠一次 `epoll_wait` 睡眠参数看住 {#ch8}

::: strings
toc: 红黑树定时器与懒更新
:::

Nginx 不给一万条连接开后台定时线程或每秒扫一万次大数组；它把全部读、写和 Keep-Alive 超时塞进一棵红黑树，每次 `epoll_wait` 前只看最左边最小的那个节点来决定最多睡几毫秒。 {.law}

如果每条连接都要精确在 60 秒后断开闲置 Keep-Alive、在 30 秒没收到包时掐掉慢读客户端，传统做法往往要么起一个扫描线程每秒遍历一万条连接 `O(N)`，要么按时间轮精度分桶。Nginx 在 `src/event/ngx_event_timer.h` 和 `src/core/ngx_rbtree.c` 里用的是非常经典的一棵红黑树 `ngx_event_timer_rbtree`（全局每 Worker 一棵，完全无锁）：

1. **只挑最小节点算睡眠**：事件循环调用 `ngx_event_find_timer()` 沿着左孩子一路到底找出到期毫秒数最小的那一个节点，算出 `timer = min_key - ngx_current_msec` 传给 `epoll_wait(epfd, events, max, timer)`。如果树里最早一个超时还有 `{=ch8.timeout}` ms，内核就乖乖最多睡 `{=ch8.timeout}` ms；要是中途有新包进来，立即提前醒来干活。 {#s1}
2. **醒来按序摘掉已到期节点**：每次从 `epoll_wait` 醒来，循环看最左节点是不是小于等于当前毫秒数；是就摘除并把事件的 `timedout = 1` 交给回调处理，直到最左节点还没到期为止——平摊代价只跟真正超时的数量成正比。 {#s2}
3. **300 毫秒懒更新（`NGX_TIMER_LAZY_DELAY`）**：这才是工程上的点睛之笔。高速收发包时，如果每读到一个 TCP 分片就立刻从红黑树删掉旧定时器、再重新插回新超时（触发左右旋与变色），白白浪费 CPU。Nginx 定义了常量 `NGX_TIMER_LAZY_DELAY = {=ch8.lazyMs} ms`：只要新老到期时间之差不到 300 毫秒，就**直接跳过红黑树修改**，等满 300 毫秒再顺手更新一次。在模拟高频小包流里，这一句 `if` 直接省掉了 `{=ch8.lazySkip}%` 的红黑树增删与旋转！而且红黑树本身保证任一路径深度不超过 `2 × log₂(N + 1)`——哪怕整整 **10,000 条**定时连接同时挂在树上，最大树高也绝不超过 `{=ch8.c10kDepth}` 层。 {#s3}

::: diagram dg-rbtree keys=dg.rbtree
cap: 图 8　ngx_event_timer_rbtree 红黑定时器树：最左侧最小节点（金色）直接决定 epoll_wait 最长睡多久，300 ms 懒更新跳过高频重插。
aria: 示意图：一棵 7 个节点的红黑二叉树，最左下角金色节点 355 直接箭头指向 epoll_wait 的超时参数，底部注明 300 毫秒内不触发重插
min: 最左最小节点决定休眠上限
t1: epoll_wait(..., 355 - now)
t2: 若 |新期限 - 旧期限| < 300 ms 则跳过删插
:::

::: lab ch8-model
model.title: 红黑树定时器与 300 ms 懒更新实验
model.how: 拖动“当前时钟 now”往前走，看最左侧到期节点如何被立刻摘除、最左最小节点如何自动递补并改写下一次 <code>epoll_wait</code> 超时；再开关 <code>NGX_TIMER_LAZY_DELAY</code> 看省掉多少次树旋转。
ctl.count: 初始定时器数量
ctl.now: 当前时钟 (ms)
ctl.lazy: 启用 300ms 懒更新
cv.aria: 实时维持红黑性质（根黑、无连续红节点、黑高一致）的剩余定时器二叉树，金色标出当前最小节点
cv.empty: 全部定时器均已到期：epoll_wait 可传 -1 无限休眠等待网络包
cv.lazy: 懒更新省下删插
leg.red: 红节点
leg.blk: 黑节点
leg.min: 最左最小节点 (决定 timeout)
read.act: 树内剩余未到期数
read.exp: 本轮已摘除过期数
read.wait: 下次 epoll_wait 超时
read.depth: 树深 / 红黑上界
say.waiting: 时钟在 {now} ms（尚无节点过期）：红黑树里共 {act} 个定时器（树深 {depth}），最左最小节点 {minK} ms 让 <code>epoll_wait</code> 最多再睡 <em>{wait} ms</em>；懒更新可省掉 {skip}% 的高频树操作。
say.expired: 时钟走到 {now} ms，已顺着最左端一气摘掉 <em>{exp} 个</em>过期定时器；树内还剩 {act} 个（深 {depth}），新的最左节点 {minK} ms 将下次睡眠设为 <em>{wait} ms</em>（懒更新省 {skip}%）。
say.empty: 时钟走到 {now} ms，全部定时器已清空：树空了，<code>epoll_wait</code> 可以传超时 -1 一直安心睡到下一颗数据包抵达（懒更新省 {skip}%）。
:::

模型省掉了：Nginx 为避免多线程读系统时间系统调用开销而设的时间缓存更新机制（`ngx_time_update` / `timer_resolution`），以及高并发下海量定时器同时过期时如何靠非阻塞连接关闭慢慢消化回调队列的细节。 {.take}

## 零拷贝 `sendfile()` 与反向代理 `proxy_buffering` {#ch9}

::: strings
toc: sendfile 零拷贝与反向代理缓冲
:::

送静态文件时，Nginx 用 `sendfile()` 把字节从内核页缓存直接 DMA 交给网卡，跳过用户态；但当做反向代理遇到 3G 慢客户端时，Nginx 却会故意把响应吃进自己的用户态内存和临时文件里，不让慢连接拖死昂贵的后端进程。 {.law}

这两件事看似一正一反，背后的算账却完全相同：**把慢的留在外头，别让 CPU 和后端工作进程白白干等或白搬数据**。

**1. 静态文件：`sendfile` + `TCP_CORK`（跳掉用户态拷贝）**。如果用传统的 `read()` 加 `write()` 按 32 KiB 块循环发一个 16 MiB 的大静态文件，每次读入再写出要穿插 `{=ch9.rwSys}` 次系统调用、`{=ch9.rwCtx}` 次用户/内核态切换，CPU 还得硬生生把这 `{=ch9.rwCopy} MiB` 数据从内核页缓存拷到用户态缓冲区，再拷回内核套接字发送缓冲区。打开 `sendfile on;`（配合 `tcp_nopush on;` 在 Linux 上挂 `TCP_CORK` 攒满整帧 MSS 再发包）后，Nginx 按块（比如 `sendfile_max_chunk 2m`）只需 `{=ch9.sfSys}` 次 `sendfile()` 调用，支持分散聚集（Scatter-Gather）的网卡直接通过 DMA 把内核页缓存里的页地址拼成帧发上线路——**用户态零拷贝**。但这里有一个生产级大坑：在没有启用内核 TLS（kTLS `SSL_sendfile`）的普通用户态 OpenSSL HTTPS 连接上，密文必须由用户态加密后写入套接字，`sendfile()` 会被静默旁路退回用户态拷贝循环！

**2. 反向代理：`proxy_buffering on`（故意兜住慢客户端）**。假如你的上游应用服务器（比如 Python/Java/Go 业务进程）以 1,000 Mbps 内网速度吐出一个 16 MiB 大响应，只需 `{=ch9.upMs}` ms；但外面的手机用户在 2 Mbps 弱网下要整整 `{=ch9.cliSec}` 秒才收得完。如果关掉 `proxy_buffering off;`，Nginx 必须一边从上游读几 KB、一边等手机确认 ACK，把一个宝贵的上游并发工作线程硬生生钉死整整 `{=ch9.cliSec}` 秒！打开 `proxy_buffering on;` 之后，Nginx 趁着 `{=ch9.upMs}` ms 一口气把 16 MiB 全抽干放进 `proxy_buffers` 内存与临时文件里，当场释放上游去接下一位客人，然后自己凭几十字节的连接结构在事件循环里慢慢喂给那位手机用户——后端释放速度足足快了 `{=ch9.speedup}` 倍。

::: diagram dg-sendfile keys=dg.sendfile
cap: 图 9　read()+write() 经过用户态的 4 次切换与 2 次 CPU 拷贝，对比 sendfile() 直接由页缓存 DMA 到网卡的零用户态路径（及 HTTPS 无 kTLS 时的回退）。
aria: 示意图：上方红色 read+write 路径经过 Disk、Page、User、NIC 四跳；下方绿色 sendfile 路径从 Page 直接经绿色箭头送往 NIC，跳过 User；最下方金色文字提示普通用户态 TLS 会退回上路
rw1: read() + write()：4 次切换 · 2 次 CPU 拷贝
rw2: 数据被 CPU 搬进用户态再搬回内核 Socket
sf1: sendfile() + TCP_CORK：0 次 CPU 拷贝
sf2: 页缓存物理页直接 DMA 上网卡
tls: 注意：无 kTLS 的 HTTPS 会退回用户态拷贝
:::

::: lab ch9-model
model.title: sendfile 零拷贝与反向代理缓冲对比台
model.how: 在“静态文件零拷贝”和“反向代理慢客户端解耦”两个场景间切换，勾掉优化开关，对比 CPU 拷贝量、系统调用次数与后端进程被拖死的时间。
ctl.scen: 工作场景
scen.static: 静态文件下载 (sendfile)
scen.proxy: 反向代理 (proxy_buffering)
ctl.opt: 启用优化
opt.static: 开启 sendfile + TCP_CORK (纯 HTTP / kTLS)
opt.proxy: 开启 proxy_buffering (内存+临时文件接管)
ctl.size: 响应文件体积
ctl.mbps: 客户端下行网速
cv.aria: 静态模式下 CPU 拷贝量与系统调用次数对比条形图，或反向代理模式下后端被占时间与客户端总传输时间对比条形图
cv.rwCopy: read+write CPU拷贝
cv.sfCopy: sendfile CPU拷贝
cv.rwSys: read+write 系统调用
cv.sfSys: sendfile 系统调用
cv.cliTime: 慢客户端总耗时
cv.upOff: 关缓冲占住后端
cv.upOn: 开缓冲占住后端
read.copy: CPU 跨越用户态拷贝量
read.sys: 静态模式系统调用次数
read.up: 后端工作进程被占时长
read.cli: 慢客户端收完耗时
say.sendfile: <em>零拷贝生效</em>：发完 {sz} MiB 文件只需 {sys} 次 <code>sendfile</code>（{ctx} 次切换），CPU 搬运量为 <em>0 MiB</em>，内核页缓存直接 DMA 上网卡（注：未启 kTLS 的 HTTPS 会回退）。
say.rw: <em>用户态拷贝路径</em>（未启 sendfile 或普通 HTTPS）：发送 {sz} MiB 文件要发 <em>{sys} 次</em> <code>read/write</code>，触发 {ctx} 次上下文切换，CPU 硬搬了 <em>{copy} MiB</em> 数据。
say.proxy_on: <em>反向代理成功解耦</em>：上游 1 Gbps 内网只需 <em>{upMs} ms</em> 就把 {sz} MiB 全部吐给 Nginx 缓冲并释放干别的活；Nginx 用极小内存独自陪 {mbps} Mbps 慢客户端磨完 <em>{cliSec} s</em>（后端解放速度提升 {speed}×）。
say.proxy_off: <em>关掉缓冲拖死上游</em>：Nginx 只能卡着节拍器同步转发，让昂贵的后端应用线程陪 {mbps} Mbps 慢客户端白白挂机 <em>{cliSec} s</em>。
:::

内核如何借助页缓存（Page Cache）以及网卡 DMA 描述符环把数据直接从内核内存送上网卡，可参考[[how-the-os-talks-to-hardware#ch7|「操作系统是怎么和硬件说话的」第 7 章与第 10 章]]；网络链路带宽与迟滞对慢客户端的影响见[[tcp-congestion#step1|「网络流 · 一封消息的旅程」第 1 步]]。

模型省掉了：文件未命中 Linux 页缓存时还得从磁盘先 DMA 读入页缓存的那一跳、Nginx `aio threads` 线程池卸载阻塞磁盘读、`proxy_busy_buffers_size` 等内存阈值细项，以及大文件开启缓冲时写本地临时盘带来的额外磁盘 I/O。 {.take}

## 前沿在哪（2026 年 11 月）：HTTP/3 QUIC、`io_uring` 与 Pingora / Envoy {#ch10}

::: strings
toc: 前沿在哪
:::

当网络底层从单条 TCP 换成基于 UDP 的 HTTP/3 QUIC，或者当边缘代理机器长到上百核心、多进程隔离的后端连接池再也无法共享时，Nginx 这套沿用了二十年的多进程 `epoll` 架构也来到了演进的路口。 {.law}

### 已确立 {#h.est .sub3}

- Kegel 在 1999 年系统归纳的 C10K 问题与非阻塞事件驱动解法、FreeBSD `kqueue`（Lemon，2001）、Linux `epoll`（2002 年合入 2.5.44 / 2.6 内核）以及 `sendfile(2)` 零拷贝机制，构成了现代高并发网络服务的共同地基。 {#e1}
- HTTP/3（RFC 9114）与底层传输协议 QUIC（RFC 9000）于 2021–2022 年正式成为 IETF 标准，将多路复用与流控从内核 TCP 栈迁出到用户态基于 UDP 的加密连接上，以消除 TCP 队头阻塞。 {#e2}

### 已经做出来的 {#h.demo .sub3}

- **Nginx 1.28.0 稳定版（2025 年 4 月 23 日发布）**把 1.25/1.27 周期打磨的原生 `ngx_quic` HTTP/3 支持带入稳定线，为 QUIC 增加了 CUBIC 拥塞控制（RFC 9438）、默认禁用老旧不安全的 TLSv1 / TLSv1.1，并在 `upstream` 里加入了动态域名解析 `resolve`、流模块 OCSP 装订以及 `keepalive_min_timeout`。 {#d1}
- **Nginx 1.30.0 稳定版（2026 年 4 月 14 日发布）与 1.31.x 主线（2026 年 5 月起）**：按官方 2026 年更新记录，1.30.0 把后台代理默认升级为开启保活的 `HTTP/1.1`、新增后端 HTTP/2 上游、TLS Encrypted ClientHello（ECH）、`103 Early Hints` 与原生 MPTCP 支持；随后在 **1.31.7+ 主线（2026 年）**里解决了长期困扰 HTTP/3 多 Worker 的痛点——重新设计 `quic_bpf` eBPF 套接字分流机制，使 `nginx -s reload` 与二进制热升级不再丢弃或折断正在运行的 QUIC 会话。 {#d2}
- **Cloudflare Pingora（2024 年开源的 Rust 代理框架）**：Cloudflare 因长期运行超大规模 Nginx/OpenResty 遇到多进程架构瓶颈（各 Worker 进程内存隔离，导致各自维护独立的上游连接池无法复用、跨核冷热不均且频繁做冗余 TLS 握手），改用多线程异步 Rust 重写边缘代理。据 Cloudflare 工程报告（截至 2024–2026 年公开资料），全网承载每日逾万亿次请求的 Pingora 比其原有的旧 Nginx/OpenResty 栈少消耗约 **70% CPU** 与约 **67% 内存**（注：对比基线是 Cloudflare 自身重度定制的旧堆栈与超大规模连接场景）。 {#d3}
- **Envoy（C++ 云原生服务网格数据面）**：同样采用“每核心一条多线程事件循环”模型（worker thread-per-core），将连接池与路由状态保持线程本地无锁（thread-local），换取极低的锁竞争，通过动态 xDS API（而非静态 `nginx.conf`）适配频繁漂移的 Kubernetes 微服务拓扑。 {#d4}

### 实验、未定与声明 {#h.claim .sub3}

- **Linux `io_uring` 与主线 Nginx**：尽管社区和外部补丁长期请求用异步提交/完成环 `io_uring` 统一取代 `epoll` 与磁盘阻塞读，截至 2026 年 11 月，官方开源 Nginx 主线（1.30 / 1.31）仍以成熟的 `epoll` / `kqueue` + 线程池 `aio` 作为默认核心事件循环，`io_uring` 尚未成为默认替换路径。 {#c1}
- **内核 TLS（kTLS `SSL_sendfile`）**：只有当系统内核、OpenSSL 与编译选项同时支持 kTLS 时，HTTPS 加密流量才能把对称加解密卸载给内核并恢复 `sendfile()` 零拷贝；在常规发行版默认配置下，大量 HTTPS 部署仍需显式启用并压测兼容性。 {#c2}
- **框架 vs 配置文件**：Pingora 官方将其定位为用 Rust 编程构建定制网关的基础框架/库，而非直接拿一份静态 `nginx.conf` 就能替代的通用开箱配置服务器——多进程强隔离与简单运维在中小规模站点上依然是 Nginx 难被替代的原因。 {#c3}

版本时间线与第三方基准数据会随时间变化；本节每条日期、版本号与工程数据均仅代表截至 2026 年 11 月的公开状态。 {.take}

## 收尾：接口卡顿、502 或限流误杀时，先问三件事 {#ch11}

::: strings
toc: 收尾：先问三件事
:::

不必背下全部 C 结构体名字。Nginx 线上掉链子、报 502 或路由莫名错掉时，顺着这篇长文依次问三件事就够了。 {.law}

{.qs}
- **是连接与进程上限卡住了，还是事件分发不均？**看 `worker_connections` 与系统 `ulimit -n`（第 1 章）：哪怕每条空闲连接在 Nginx 里只要 440 字节，10,000 并发下（含上游代理连接，每个代理客户端往往同时占 2 个 FD）若文件描述符上限没放开也会立刻拒收；多核压测发现某几个核吃满而另几个核空转，检查是否开了 `reuseport` 分散了接收队列（第 3 章）。 {#q1}
- **请求到底走进了哪条 `location` 和哪一阶段？**规则配了却像没生效，先用第 4 章四步优先级过一遍：是不是被更上面的 `=` 或 `^~` 半路截胡，还是另一条更长的普通前缀（自己却没写 `^~`）把正则又放了出来；限流与鉴权同时存在时，记住 `PREACCESS`（`limit_req`）永远早于 `ACCESS`（`allow`/`deny`）。 {#q2}
- **是漏桶参数太死、还是慢客户端拖死了上游？**突发流量报大量 503，看第 7 章是不是忘了设 `burst` 或 `nodelay`；如果上游偶尔被偶发抖动打成 502，查第 6 章 SWRR 权重与 `fail_timeout`；如果后端明明很快却大量超时堵死，检查第 9 章是不是被人顺手关掉了 `proxy_buffering`，让几百 kbps 的弱网手机硬拖住了后台业务线程。 {#q3}

一句话：`nginx` 启动后并不靠魔法扛住一万并发——它把“连接”从昂贵的操作系统线程贬值成数组里 440 字节的槽位，只靠每核一个进程在 `epoll` 就绪链表与红黑树定时器之间无锁轮转，再用按请求生灭的内存池、平滑权重算法与零拷贝缓冲，把每一毫秒 CPU 都留给真正有字节要搬运的活跃请求。 {#sum .sum}

相关的文章：[[how-the-os-talks-to-hardware]]（系统调用、`epoll` 与内核页缓存）、[[how-virtual-memory-works]]（虚拟地址、`fork` 写时复制与页表）、[[how-a-nic-moves-packets]]（多队列网卡 RSS 与 DMA 搬运）和[[tcp-congestion]]（TCP 握手、带宽时延与队列拥塞）。 {#links}

::: footer
**来源。**核心数据结构与算法规则对照 Nginx `1.28.0` 稳定版源码规格（2025 年 4 月 23 日发布）：`src/core/ngx_connection.h`、`ngx_palloc.h`、`ngx_rbtree.h`、`ngx_cycle.c`；`src/os/unix/ngx_process_cycle.c`、`ngx_linux_sendfile_chain.c`；`src/event/ngx_event.c`、`ngx_event_timer.h`、`modules/ngx_epoll_module.c`；`src/http/ngx_http_core_module.h`、`ngx_http_core_module.c`、`ngx_http_request.c`、`ngx_http_upstream_round_robin.c`、`modules/ngx_http_limit_req_module.c`。

延伸规范与工程文献：D. Kegel，The C10K Problem（1999）；J. Lemon，Kqueue: A Generic and Scalable Event Notification Facility（USENIX 2001）；RFC 9000（QUIC）与 RFC 9114（HTTP/3）；nginx.org 1.28.0 / 1.30.0 / 1.31.x 更新记录（截至 2026 年 11 月查证）；Cloudflare 工程博客 "How we built Pingora, the proxy that connects Cloudflare to the Internet"（2022/2024 公开 CPU/内存对比数据）。

**模型说明。**本构建主机未安装原生 `nginx` 可执行文件，因此页面不直接调用 Nginx 二进制，而是按源码规则重写了全部 9 个核心算法，并由 `tools/crosscheck.cjs` 对照数学闭式解、SWRR 守恒不变量、漏桶定点公式、`location` 边界规则与红黑树性质逐项校验（细节见目录内 `BRIEF.md`）。第 1 章多线程上下文切换耗时与第 3 章微秒级曲线斜率均为可调参数化估算，仅用于数量级演示。本文由 Antigravity 编写。
:::
