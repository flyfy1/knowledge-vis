---
lang: zh
title: 移动硬盘为什么跑不满 · 一篇可以动手的长文
desc: 一块能跑 7 GB/s 的 NVMe 固态装进 USB 硬盘盒，为什么只剩几百 MB/s 到两三 GB/s？包装上的 Gen 2×2、40Gbps 说的是什么？九个可以拖动的模型：USB 2.0 的微帧、从名字到线速、Bulk-Only 的一问一答、UASP 的队列、桥接链条上的瓶颈、发热降速、雷电与 USB4 的 PCIe 隧道、U 盘里的几颗闪存。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
u.pct: {v}%
u.us: {v} 微秒
u.ms: {v} 毫秒
u.s: {v} 秒
u.min: {v} 分钟
u.MBps: {v} MB/s
u.Gbps: {v} Gb/s
u.B: {v} 字节
u.KiB: {v} KiB
u.MiB: {v} MiB
u.C: {v} °C
u.x: ×{v}
u.iops: {v} IOPS
u.none: —
:::

# 移动硬盘为什么跑不满 {#hero}

::: strings
kicker: 计算机 · 系统 · 一篇可以动手的长文
:::

一块规格书写着 7,250 MB/s 的 NVMe 固态，装进 USB 硬盘盒，<br>为什么测出来只有几百 MB/s 到两三 GB/s？ {.sub}

第二个问题跟着来：盒子上印的「USB 3.2 Gen 2×2」「40Gbps」到底说的是什么？下面把一次拷贝从电脑一路追到闪存：USB 线上谁说了算、名字和线速怎么对应、一条读命令怎样被包成 31 个字节、为什么一次只办一件事会慢、盒子里那颗芯片在翻译什么、盘为什么拷着拷着变慢、雷电和 USB4 换了一条什么路，最后看 U 盘和存储卡。**每个模型都是规范里的一条规则、规范里的一张表，或一个教科书结果**，缩小到能在网页里跑。 {.lead}

这一页由一个 AI 写成。规范里的数字（帧格式、表格、速率）直接取自 USB 2.0、USB 3.2、USB4 和大容量存储类规范的原文；**标着「调出来的参数」的地方是为了让模型能算而选的，不是测出来的**，正文会写明它变一倍时结论移动多少。这里只讲机制和规格，**不评价哪个盒子、哪块盘值得买**。 {.note}

## 在地图上的哪里 {#ch1}

::: strings
toc: 在地图上的哪里
:::

一块「USB 移动硬盘」其实是两块存储设备首尾相接：电脑看见的是一个说 SCSI 的 USB 设备，盘看见的是一个说 SATA 或 NVMe 的主机。中间那颗桥接芯片两边都要会说。 {.law}

把一块 M.2 固态装进硬盘盒，电脑不会认出「这是一块 NVMe 盘」。它看到的是一个 USB 设备，接口描述符里写着：我是大容量存储类，命令集是 SCSI，传输方式是 Bulk-Only 或 UASP。电脑的 USB 驱动把它当成一块 SCSI 磁盘来用。真正的盘在盒子另一头，接在一颗桥接芯片上；对那块盘来说，桥接芯片就是它的主机，用的是 SATA 帧或 PCIe 上的 NVMe 队列。

::: diagram dg-stack keys=dg.stack
cap: 一块 USB 移动硬盘是两块存储设备首尾相接。灰色是电脑里的软件层，青色是盒子里的桥接芯片，紫色是盘；绿线是 USB，青线是芯片到盘的 SATA 或 PCIe。括号里是接口描述符里的协议代码（MSC 概述 1.4）。示意，不按比例。
aria: 示意图：USB 移动硬盘的两半。左边是电脑里的软件层：应用和文件系统、SCSI 磁盘驱动、USB 存储驱动、USB 主机控制器；USB 线连到盒子里的桥接芯片，它的 USB 设备一侧收下 SCSI 命令，翻译成 ATA 或 NVMe，再由主机一侧经 SATA 或 PCIe 发给盘
pc: 电脑
br: 桥接芯片（在盒子里）
dr: 盘
app: 应用和文件系统
sd: SCSI 磁盘驱动
ms: USB 存储驱动：Bulk-Only（{bot}）或 UASP（{uas}）
hc: USB 主机控制器
dev: USB 设备一侧：自称大容量存储类、SCSI 命令集
xl: 翻译：SCSI → ATA 或 NVMe
host: 主机一侧：SATA 主机，或 PCIe 上的 NVMe 主机
ctl: 盘的主控：听 ATA（SATA 盘）或 NVMe（NVMe 盘）
nand: 闪存
usb: USB
link: SATA 或 PCIe
sees1: 电脑看见的：一个说 SCSI 的 USB 设备
both: 芯片两边的话都要会说
sees2: 盘看见的：一个主机
:::

姊妹篇<a href='../what-a-drive-is-made-of/'>《硬盘里到底是什么》</a><a href='../what-a-drive-is-made-of/#ch7'>第 7 章</a>画过整张存储地图：外形、接口、电信号、传输、命令集五层。USB 移动硬盘在那张图上占的不是一列，而是两列，中间用桥接芯片拼起来：

::: html ch1-html
th.layer: 层
th.what: 管什么
th.who: 谁定的
th.ch: 本文
r.cmd: 命令集
r.cmd.what: 「从第几块开始读几块」怎么写成字节：SCSI 的 CDB
r.cmd.who: T10（INCITS 下属）
r.cmd.ch: 第 4、6 章
r.tr: 传输
r.tr.what: 命令、数据、状态怎么在 USB 上排队：Bulk-Only 或 UASP
r.tr.who: USB-IF 大容量存储类工作组；UAS 也在 T10
r.tr.ch: 第 4、5 章
r.usb: USB 协议与链路
r.usb.what: 主机怎么安排每一笔传输、包怎么切、出错怎么重发
r.usb.who: USB-IF / USB 3.0 Promoter Group
r.usb.ch: 第 2 章
r.phy: 电信号
r.phy.what: 几对线、每秒多少次、0 和 1 怎么编码
r.phy.who: 同上（USB 2.0、USB 3.2、USB4 三本规范）
r.phy.ch: 第 3 章
r.br: 桥接芯片
r.br.what: 把 SCSI 命令翻成 ATA 或 NVMe，再按盘那一侧的协议发出去
r.br.who: 芯片厂家，按 T10 SAT 或 NVMe 的 SCSI 翻译参考
r.br.ch: 第 6、7 章
r.ff: 外形
r.ff.what: Type-C 或 Type-A 插头；盒子里是 M.2 或 2.5 英寸盘位
r.ff.who: USB-IF；M.2 由 PCI-SIG
r.ff.ch: —
:::

所以「移动硬盘慢」这件事，至少有五个地方可能出问题：线上本身能跑多快（第 2、3 章），一条命令要来回几趟（第 4、5 章），盒子里的芯片往盘那边开了几条路（第 6 章），盘热了会不会自己降速（第 7 章），还有盘自己有多快。雷电和 USB4 的 PCIe 隧道是另一条路，它把中间那一列整个拿掉了（第 8 章）。

这张表略去了 USB 集线器、USB 供电（PD）和盒子里可能有的加密芯片；它们会影响能不能用，很少决定能跑多快。 {.take}

## 主机说了算 {#ch2}

::: strings
toc: 主机说了算
:::

USB 上没有哪个设备能自己开口。每一笔数据都是主机先排进时间表、再去问设备要的；USB 2.0 的时间表每 125 微秒翻一页，一页最多装 {mf} 个字节。 {.law}

插上一个 U 盘，它不能主动说「我有数据给你」。USB 从一开始就是主从结构：电脑上的主机控制器是唯一的调度员，所有设备排成一棵树挂在它下面。在 USB 2.0 高速模式里，主机把时间切成 125 微秒一格的「微帧」，每一格里排几笔传输，每笔都由主机发一个令牌包开头：「3 号设备的 1 号端点，把数据给我」，设备才回数据，主机再回一个确认。设备忙不过来，只能回一句「还没好」（NAK），等主机下次再问。

::: diagram dg-mframe keys=dg.mframe
cap: 上：一笔批量读的三个包，每一笔都由主机开头（示意）。下：一个 {mf} 字节的微帧按字节比例画：{u2n} 笔，每笔 512 字节数据（金）加 55 字节开销（红），剩下 {u2left} 字节（灰）装不下下一笔。
aria: 示意图：上面是一笔批量读，主机发 IN 令牌，设备回数据包，主机回 ACK；设备没准备好时回 NAK。下面按比例画出一个 125 微秒的微帧：13 笔，每笔 512 字节数据加 55 字节开销，剩 129 字节
host: 主机
dev: 设备
tok: IN 令牌
data: 数据包 {pay} 字节
ack: ACK 确认
nak: NAK：还没好
nakn: 设备没准备好时回 NAK（还没好），主机过一会儿再问一遍。
mf: 一个微帧：{us} 微秒 = {mf} 字节
fill: {n} 笔 ×（{pay} + {oh}）字节，剩 {left}
lgd: 数据
lgo: 令牌、包头、校验、确认和包间间隔，每笔 {oh} 字节
lgl: 剩下的 {left} 字节装不下下一笔
:::

480 Mb/s 乘以 125 微秒是 {mf} 字节，这是一格的全部容量。每笔批量传输除了数据，还要付令牌、数据包头、校验、确认和包间间隔的钱。规范第 5 章的表 5-10 把这笔账写死成 55 个字节。下面这个模型就是那张表：

::: lab ch2-model
model.title: 模型 · 一个微帧里能装几笔批量传输（USB 2.0 表 5-10）
model.how: 拖动**每包数据**，看一格 7,500 字节里排下几笔传输、多少是数据、多少是开销、最后剩下的边角。
model.aria: USB 2.0 一个微帧的字节分配：数据、协议开销、剩余
leg.data: 数据
leg.oh: 每笔 55 字节开销
leg.left: 装不下的边角
ctl.p: 每包数据
read.n: 每个微帧几笔
read.useful: 每个微帧的数据
read.bw: 最大批量速率
read.eff: 数据占比
cv.x: 一个微帧（125 微秒，7,500 字节）
cv.n: {n} 笔
say.max: 每包 {p} 字节是高速批量端点允许的最大值：一格排 {n} 笔，装 {useful} 字节数据，剩 {left} 字节放不下下一笔。每秒 8,000 格，就是 {bw}。这是 USB 2.0 上批量传输的天花板，任何 U 盘都越不过去。
say.mid: 每包 {p} 字节时一格排 {n} 笔，数据占 {eff}，最大 {bw}。包越大，55 字节的固定开销摊得越薄。
say.small: 每包只有 {p} 字节时一格能排 {n} 笔，可数据只占 {eff}：大部分时间花在令牌、包头和确认上，最大只有 {bw}。
:::

模型给出的就是规范表 5-10 的每一行：每包 512 字节时一格 {u2n} 笔，剩 {u2left} 字节，一秒 {u2max} MB/s，数据占 {u2eff}；每包 64 字节时一格 {u2n64} 笔，只有 {u2mb64} MB/s。所以 USB 2.0 的「480 Mb/s」换成字节是 {u2raw} MB/s，批量传输最多拿到 {u2max} MB/s，再扣掉第 4 章要讲的命令来回，实际还要低：第 9 章同一个模型在 USB 2.0、Bulk-Only、每条 128 KiB 时给出 {stu2} MB/s，这还没算主机控制器排不满每一格（见本章末尾）。

USB 3 改了两件事。第一，收和发各用一对线，同时进行，不用再轮流。第二，主机不再一遍遍去问：设备没准备好就回 NRDY，准备好了自己发一个 ERDY 告诉主机「可以了」，主机再把它排进去。规范的原话是「USB 2.0 式的轮询被异步通知取代」。但那个 ERDY 只是举手，数据什么时候走仍由主机排；USB 3.2 的对比表仍把它写成「主机主导」的传输。

表 5-10 是理论上限：规范自己在表下说，主机控制器「可能做不到」每格排满这么多笔。模型也没算同一棵树上其他设备分走的时间。 {.take}

## 包装上的数字 {#ch3}

::: strings
toc: 包装上的数字
:::

「USB 3.0」「USB 3.1 Gen 1」「USB 3.2 Gen 1」是同一种 5 Gb/s 链路的三个名字。名字只说线上每秒翻多少次，不说扣掉编码、包头和协议之后还剩多少。 {.law}

同一种接口，2008 年叫 USB 3.0；2013 年 USB 3.1 出来，加了 10 Gb/s 的一档，旧的那档改叫 USB 3.1 Gen 1、新的叫 Gen 2；2017 年 USB 3.2 又加了用两对线的一档，于是名字变成 Gen 1×1、Gen 2×1、Gen 1×2、Gen 2×2。规范的修订记录里能看到这三个日期：2008 年 11 月 12 日、2013 年 7 月 26 日、2017 年 9 月 22 日。USB-IF 自己也觉得乱：2024 年 1 月的命名指南推荐包装和宣传上只用速率命名，「USB 5Gbps」「USB 10Gbps」「USB 20Gbps」「USB 40Gbps」「USB 80Gbps」，并明说 USB 3.2、USB4 这些规范名字「不打算用在产品名或包装上」。

从名字到能用的速度，要过三道。第一道是编码：5 Gb/s 一档用 8b/10b，每 10 位里只有 8 位是数据（姊妹篇<a href='../how-sata-works/#ch3'>《SATA 为什么用了二十多年》第 3 章</a>拆过这种编码）；10 Gb/s 一档换成 128b/132b，132 位里 128 位是数据。第二道是包：一个装满 1,024 字节的数据包，前面有包头，后面有校验和结束符。第三道是流量控制和协议往返，这一道规范只给了一个整数。

::: diagram dg-pkt keys=dg.pkt
cap: 上：第 3 章那笔账用的包（USB 3.2 §7.2.1）：1,024 字节数据配 32 字节开销；各段宽度是示意，不按比例。下：两种编码里数据占多少，按比例画：金色是数据，红色是编码的代价（8b/10b 是把 8 位换成一个 10 位的符号，不是在后面补 2 位）。
aria: 示意图：一个装满的 USB 3 Gen 1 数据包：20 字节的头包，然后是数据负载包：4 字节起始符、1,024 字节数据、4 字节 CRC-32、4 字节结束符；下面是两种编码：8b/10b 每 10 位里 8 位是数据，128b/132b 每 132 位里 128 位是数据
title: 一个装满的数据包（Gen 1）
hdr: 头包
start: 起始符
data: 数据
crc: CRC-32
end: 结束符
bytes: {n} 字节
dpp: 数据负载包（DPP）
note: 第一格是头包，后面四格是数据负载包（DPP）。
enc: 编码：线上的位里有多少是数据
enc8: 8b/10b（5 Gb/s 一档）
enc128: 128b/132b（10 Gb/s 一档）
lgd: 数据位
lgo: 开销
:::

::: lab ch3-model
model.title: 模型 · 从包装上的名字到能用的字节
model.how: 点一个**印在盒子上的名字**，看它对应几对线、每对多少 Gb/s、什么编码，四根条依次扣掉编码、包头和规范说的协议开销。
model.aria: 所选 USB 名字的线速、编码后、包头后与规范给出的有效速率
ctl.label: 盒子上的名字
lab.usb20: USB 2.0
lab.usb30: USB 3.0
lab.usb31g1: USB 3.1 Gen 1
lab.usb32g1: USB 3.2 Gen 1
lab.usb5: USB 5Gbps
lab.usb31g2: USB 3.1 Gen 2
lab.usb32g2: USB 3.2 Gen 2
lab.usb10: USB 10Gbps
lab.usb32g1x2: USB 3.2 Gen 1×2
lab.usb32g2x2: USB 3.2 Gen 2×2
lab.usb20g: USB 20Gbps
lab.usb4_20: USB4 20Gbps
lab.usb4_40: USB4 40Gbps
lab.usb80: USB 80Gbps
read.mode: 规范里的名字
read.line: 线速
read.raw: 扣掉编码
read.spec: 规范给的有效值
bar.line: 线速 ÷ 8
bar.enc: 扣掉编码
bar.pkt: 扣掉包头（本页的账）
bar.spec: 规范给的有效值
bar.na: 不适用
mode.hs: USB 2.0 高速
mode.g1x1: Gen 1×1
mode.g2x1: Gen 2×1
mode.g1x2: Gen 1×2
mode.g2x2: Gen 2×2
mode.u4g2: USB4 Gen 2×2
mode.u4g3: USB4 Gen 3×2
mode.u4g4: USB4 Gen 4
modefmt: {name}（{enc}）
enc.hs: 一对线，半双工
enc.g1x1: 一对收一对发，8b/10b
enc.g2x1: 一对收一对发，128b/132b
enc.g1x2: 两条通道，8b/10b
enc.g2x2: 两条通道，128b/132b
enc.u4g2: 两条通道，64b/66b
enc.u4g3: 两条通道，128b/132b
enc.u4g4: 两条通道，三电平 PAM3
say.usb2: USB 2.0 只有一对线，480 Mb/s 合 {raw}；批量传输最多 {spec}（上一章的表 5-10）。
say.usb3: 这个名字就是 {mode}：线速 {line}，扣掉编码 {raw}，按满包算的包头再扣一点是 {framed}，规范给的有效值（算上流量控制和协议）约 {spec} 或更少。按 2024 年的指南，包装上建议印成「USB {market}Gbps」。
say.usb10: 「USB 10Gbps」按指南只说速率：最常见的是 Gen 2×1（线速 {line}，扣掉编码 {raw}，规范给的有效值约 {spec}），但两条 5 Gb/s 通道并用的 Gen 1×2 也是 10 Gb/s。光看这个名字分不出来。
say.g1x2: Gen 1×2 是两条 5 Gb/s 通道并用，合计线速 {line}，扣掉 8b/10b 是 {raw}，规范说有效值是 Gen 1 的两倍，约 {spec}。它和 Gen 2×1 都叫「USB 10Gbps」，编码却不同。
say.usb4: 这是 {mode}：两条通道合计线速 {line}，扣掉编码约 {raw}。USB4 自己不直接装存储命令，它把 USB 3、PCIe、DisplayPort 当作「隧道」装在里面，存储走哪条隧道，第 8 章再说。
:::

几个数字值得记住。5 Gb/s 扣掉 8b/10b 是 {g1raw} MB/s，规范自己写的就是「500 MB/sec」；一个满包的包头、帧界和校验再拿走一点（本页的账：1,024 字节数据配 32 字节开销，剩 {g1pe}），是 {g1fr} MB/s；规范说算上流量控制和协议，交给应用的是「450 MB/sec 或更少」。10 Gb/s 扣掉 128b/132b 是 {g2raw} MB/s（规范：约 1.2 GB/s），满包（24 字节包头，剩 {g2pe}）后 {g2fr} MB/s，规范给的有效值约 1.1 GB/s。Gen 2×2 两条通道合起来编码后是 {g22raw} MB/s。

USB4 换了一套编码：40Gbps 一档每条通道 20 Gb/s、128b/132b，两条合计编码后约 {u4g3raw} Gb/s；80Gbps 一档改用三电平信号，每秒 256 亿个符号，每 7 个符号装 11 位，一条通道约 {u4g4lane} Gb/s。但 USB4 上跑的存储命令不是直接装进这些比特的，第 8 章会回来。

「扣掉包头」那根条是本页按满 1,024 字节数据包算的账（USB 3.2 §7.2.1 的包结构），没算 SKP 等定期插入的符号和反方向的确认包；规范给的 450 MB/s 和约 1.1 GB/s 是原文的数，模型只是引用。USB4 Gen 4 的前向纠错开销没有放进模型。 {.take}

## 一次只办一件事 {#ch4}

::: strings
toc: 一次只办一件事
:::

Bulk-Only 传输像一个只有一个窗口、一次只接一个人的柜台：递单子，办事，回执，下一个。每条命令的固定往返时间不管读多少都要付，读得越少越吃亏。 {.law}

USB 大容量存储最早的规矩写在 1999 年的《Bulk-Only Transport》1.0 里（封面上印的日期是「1999 年 9 月 31 日」，这一天并不存在，原文如此）。它只用两个批量端点，一个进一个出，一条命令分三步：主机先发一个 31 字节的**命令块包装（CBW）**，里面塞一条最长 16 字节的 SCSI 命令；然后是数据；最后设备回一个 13 字节的**状态包装（CSW）**。规范要求设备回完这一条的 CSW，主机才能发下一条 CBW。

::: diagram dg-bot keys=dg.bot
cap: Bulk-Only 一次只有一条命令在路上：红色是包装（CBW、CSW）和等待，金色是数据。每次读得越少，红色占得越多。宽度示意，不按比例。
aria: 示意图：Bulk-Only 的时间线。主机在 OUT 端点发 31 字节的 CBW，等芯片和闪存准备好，数据从 IN 端点回来，接着是 13 字节的 CSW；CSW 回来以后主机才发下一条 CBW
out: 主机 → 盒子（OUT 端点）
in: 盒子 → 主机（IN 端点）
o: OUT
i: IN
data: 数据
wait: 等待：芯片处理命令，闪存吐出第一个字节
waitS: 等待
cbw: CBW {cbw} 字节
csw: CSW {csw} 字节
next: 下一条 CBW
one: 一条命令三步：CBW（里面装一条最长 {cdb} 字节的 SCSI 命令）、数据、CSW。CSW 回来之前，下一条 CBW 不能发。
:::

下面先看这两个包装的每一个字节，再看「一次一条」对速度意味着什么。

::: lab ch4-model
model.title: 模型 · 一条 READ 命令的 CBW 和 CSW（BOT 1.0 表 5.1、5.2）
model.how: 选 **READ(10) 或 READ(16)**，拖动**起始块号**和**块数**，看 31 个字节里每一段怎样变化。多字节字段是小端（低字节在前），里面的 SCSI 命令是大端。
ctl.op: SCSI 命令
op.read10: READ(10)
op.read16: READ(16)
ctl.blocks: 块数
ctl.lba: 起始块号
hex.aria: CBW 与 CSW 的十六进制字节
:::

签名 55 53 42 43 是 ASCII 的「USBC」，CSW 的 55 53 42 53 是「USBS」：规范用这四个字节让双方确认收到的确实是包装，而不是半截数据。标签由主机随意写，设备原样抄回 CSW，用来把回执和命令对上。在 Bulk-Only 里这个标签几乎用不上，因为路上永远只有一条命令。

::: lab ch4-lab
model2.title: 模型 · 一次一条命令时的速度（闭合排队的渐近界，N = 1）
model2.how: 拖动**每条命令读多少**，换**链路**，再拖**每条命令的固定往返**（调出来的参数），看曲线离链路上限有多远。
model2.aria: Bulk-Only 一次一条命令的吞吐随块大小变化
read.x: 吞吐
cv.cap: 链路有效上限
ctl.link: 链路
link.hs: USB 2.0
link.g1x1: 5 Gb/s
link.g2x1: 10 Gb/s
link.g2x2: 20 Gb/s
ctl.size: 每条命令读多少
ctl.tcmd: 每条命令的固定往返
read.iops: 每秒命令数
read.share: 链路利用率
read.wait: 每条命令里不传数据的时间
hex.cbw: CBW（31 字节，主机 → 设备）
hex.data: 数据阶段：{len} 字节，设备 → 主机
hex.csw: CSW（13 字节，设备 → 主机）
hex.sig: 签名「USBC」
hex.tag: 标签
hex.len: 要传的字节数
hex.flags: 方向：读
hex.lun: LUN
hex.cblen: 命令长度
hex.cdb: SCSI 命令（CDB）
hex.sig2: 签名「USBS」
hex.res: 差额
hex.st: 状态：0 = 成功
say.fit: 这条 {op} 从第 {lba} 块读 {blocks} 块，CBW 里「要传的字节数」写着 {len}。
say.over: 这个块号超过了 READ(10) 的 32 位地址（最多到第 4,294,967,295 块，512 字节一块约 2 TiB），主机得改用 READ(16)；上面显示的已经是 READ(16) 的写法，CDB 变成 16 字节。
cv.x: 每条命令读多少（对数刻度）
cv.y: MB/s
say.wait: 每条命令 {size}：数据只走 {tData}，等待却是 {wait}，链路一大半时间空着，只跑到 {X}（{share}）。
say.mid: 每条命令 {size}：传数据 {tData}，等待 {wait}，跑到 {X}，用上链路的 {share}。
say.full: 每条命令 {size}：数据要走 {tData}，固定等待 {wait} 摊薄了，跑到 {X}，链路用上 {share}。块越大，一次一条的毛病越看不出来。
:::

模型把一条命令的时间拆成三段：主机和桥接芯片处理 CBW、CSW 的固定往返，闪存吐出第一个字节前的等待，以及数据本身在链路上走的时间。在 10 Gb/s 链路上（规范的有效值约 1,100 MB/s），每条命令读 4 KiB 只能跑 {b4} MB/s，一秒 {b4iops} 条；读 128 KiB 是 {b128} MB/s；读 1 MiB 才到 {b1m} MB/s。要用上链路的九成，一条命令得读到约 {b90} KiB。

这是排队论里闭合系统的渐近界（Lazowska 等人 1984 年《Quantitative System Performance》第 5 章）在「同时只有一条命令」时的特例：吞吐 = 块大小 ÷ 一条命令的总时间；它和 Little 定律是同一件事，<a href='../why-nvme-is-fast/#ch2'>《NVMe 为什么这么快》第 2 章</a>讲过。UASP 规范 2009 年版开头的概述里有一组对照：Bulk-Only 的开销「约 20%」，在 5 Gb/s 上分析下来「约 250 MB/s」。模型在 5 Gb/s、每条 64 KiB 时给出 {b64g1} MB/s，量级相同；参数不是照着它调的。

调出来的参数：固定往返 50 微秒、闪存首字节等待 50 微秒。固定往返减半时 4 KiB 的速度变成 {b4h} MB/s，加倍时 {b4d} MB/s；用上九成链路所需的块从 {b90h} KiB 变到 {b90d} KiB。结论「小块读远低于链路，块越大越接近」不随它们变。模型假设桥接芯片边收边转发，不先整块存下。 {.take}

## UASP：把队列带上 USB {#ch5}

::: strings
toc: UASP：把队列带上 USB
:::

UASP 把一个窗口拆成四条专线：命令、状态、读数据、写数据各走各的，每条命令带一个标签。路上可以同时有几十条命令，等待被重叠掉，链路才能一直有活干。 {.law}

2009 年 6 月 24 日，USB-IF 发布了 USB Attached SCSI Protocol（UASP）1.0。它定义四个管道：主机在**命令管道**上发命令信息单元，设备在**状态管道**上回状态，数据走**读**或**写数据管道**。每条命令带一个标签，数据和状态都用这个标签认领。在 USB 3 上，标签直接用作批量端点的「流」编号：USB 3.2 规范说，流让一个端点可用的主机缓冲区「从 1 个扩展到最多 65,533 个」，用途之一正是「大容量存储的命令排队」。

::: diagram dg-uas keys=dg.uas
cap: UASP 把 Bulk-Only 的一个窗口拆成四条管道，路上同时有好几条命令。这里画的是 USB 3 上的读：数据按盘准备好的先后回来，用标签认领。示意，不按比例。
aria: 示意图：UASP 的四个管道。命令管道上连发四条带标签的命令 1 到 4；读数据管道上数据按 2、1、3、4 的顺序回来，每段数据之后状态管道上回一个同标签的状态；写数据管道在读的时候空着
cmd: 命令管道（OUT）
st: 状态管道（IN）
din: 读数据管道（IN）
dout: 写数据管道（OUT）
idle: 读的时候空着
tag: 每条命令带一个标签（方块里的数字），数据和状态按标签认领，顺序可以和命令不同。在 USB 3 上标签就是流编号，最多 {streams} 个。
:::

这和<a href='../why-nvme-is-fast/#ch2'>NVMe 那一篇</a>讲的队列深度是同一个道理：路上同时有 N 条命令时，一条命令在等闪存的时候，另一条的数据正在线上走。下面是上一章同一个模型，只是让 N 可以大于 1：

::: lab ch5-model
model.title: 模型 · Bulk-Only 和 UASP 在不同队列深度下（同一个渐近界）
model.how: 选**同时在路上的命令数**，拖动**每条命令读多少**，换**链路**。灰线是 Bulk-Only，金线是 UASP。
model.aria: Bulk-Only 与 UASP 在所选队列深度下的吞吐随块大小变化
read.bot: Bulk-Only
read.uas: UASP
ctl.n: 同时在路上的命令
read.gain: UASP ÷ Bulk-Only
read.knee: 填满链路需要的命令数
cv.bot: Bulk-Only（N = 1）
cv.uas: UASP（N = {n}）
say.q1: 路上只有一条命令时，UASP 和 Bulk-Only 一样：都是 {X}。四条管道帮不上忙，因为没有第二条命令可以重叠。
say.lat: {n} 条命令同时在路上，UASP 跑到 {X}，是 Bulk-Only 的 {gain} 倍；但还没填满链路，要约 {knee} 条才够。
say.link: {n} 条命令同时在路上，UASP 已经顶到链路（或盘）的上限 {X}，是 Bulk-Only 的 {gain} 倍。再加命令也不会更快。
say.cpu: {n} 条小命令同时在路上，链路还有余量，但桥接芯片每条命令要处理一会儿（调出来的参数），封顶在每秒 {iops}，即 {X}。小块随机读拼的是芯片，不是线。
:::

模型的结论：每条 128 KiB 时，只要约 {knee128} 条命令同时在路上就能填满 10 Gb/s 链路，4 条时 UASP 已是 {u128q4} MB/s；每条 4 KiB 时要约 {knee4} 条，8 条时 {u4q8} MB/s，32 条时 {u4q32} MB/s，也就是每秒约 {u4q32k} 千条，这时卡住的不是线，而是桥接芯片处理一条命令的时间。UASP 规范开头的概述说的是同一件事：它「利用 USB 3 的全双工」，可以「超过 400 MB/s」。

要用上 UASP，两头都得支持：盒子里的芯片，和电脑的驱动。以 Linux 为例，它的 uas 驱动在 USB 3 上最多申请 256 个流，把申请到的数目减 2，即 {linQd}，设为 SCSI 层的队列深度；在没有流的 USB 2.0 上退回 32。Linux 源码里还有一张名单，列出 UASP 实现有毛病、要打补丁或干脆退回 Bulk-Only 的盒子。不支持 UASP 的组合会悄悄用 Bulk-Only，盒子照样能用，只是慢在上一章那条曲线上。

调出来的参数：桥接芯片每条命令 4 微秒。减半时 4 KiB 小命令的芯片封顶变成 {cpuH} MB/s，比 10 Gb/s 链路还宽，32 条小命令就改为卡在链路上；加倍时 {cpuD} MB/s。所以「小块拼的是芯片」这一句取决于这个参数，只能当作一种可能，没有实测撑腰；「队列越深越快，直到撞上某个上限」不随它变。模型给的是上界：真实的盘内部还有自己的并行度（<a href='../why-nvme-is-fast/#ch5'>NVMe 那一篇第 5 章</a>）和自己的排队，桥接芯片也可能把队列截短。 {.take}

## 盒子里的翻译和最窄的一段 {#ch6}

::: strings
toc: 盒子里的翻译和最窄的一段
:::

桥接芯片收到的是 SCSI，发给盘的是 ATA 或 NVMe。它决定了三件事：往盘那边开几条路，哪些命令翻得过去，以及一次拷贝最后停在哪一段。 {.law}

SCSI 命令是一串固定格式的字节，用在 SAS 盘、<a href='../storage-over-a-network/#ch3'>iSCSI</a> 和 USB 存储上（它的来历和写法见本系列的<a href='../how-sas-works/#ch2'>《服务器硬盘为什么用 SAS》第 2 章</a>）。盒子里的盘不说 SCSI：SATA 盘说 ATA，NVMe 盘说 NVMe。所以芯片得逐条翻。SATA 那一侧有 T10 的标准《SCSI/ATA 翻译》（SAT，ANSI INCITS 431-2007 起）；NVMe 那一侧有 NVM Express 组织发布的《SCSI 翻译参考》。几条最常用的命令是这样对上的：

::: html ch6-html
th.scsi: SCSI 命令
th.ata: SATA 盘收到
th.nvme: NVMe 盘收到
r.read: READ(10) / READ(16)
r.read.ata: 读命令，如 READ FPDMA QUEUED（60h）；块号、块数照搬
r.read.nvme: Read（02h）；块数要减一，NVMe 从 0 起数
r.unmap: UNMAP，或带 UNMAP 位的 WRITE SAME(16)
r.unmap.ata: DATA SET MANAGEMENT（TRIM）
r.unmap.nvme: Dataset Management（释放）
r.log: LOG SENSE（健康、温度）
r.log.ata: 读 SMART 日志
r.log.nvme: Get Log Page、Get Features
r.ata16: ATA PASS-THROUGH(16)，85h
r.ata16.ata: 原样交给盘：任何 ATA 命令，包括完整的 SMART
r.ata16.nvme: 没有标准对应；各家芯片用自己的私有命令
:::

最后一行最要紧。SATA 盘装进盒子，硬盘检测工具可以用 ATA PASS-THROUGH 把 SMART 命令原样送到盘上，开源工具 smartmontools 的手册把这叫「SAT」设备类型。NVMe 盘没有这样一条标准的路，smartmontools 只能为几家芯片分别写私有的通道。同样，「告诉盘这些块不用了」（<a href='../why-nvme-is-fast/#ch6'>NVMe 那一篇第 6 章</a>讲过它为什么要紧）要靠芯片把 UNMAP 翻成 TRIM 或 Dataset Management；本页查到的三份芯片产品简介都写了「支持 TRIM」，但翻不翻得过去、电脑会不会发，要看具体芯片、固件和系统。

::: diagram dg-chain keys=dg.chain
cap: 第 6 章模型里「20 Gb/s 的芯片配 PCIe 3.0 ×2」那种盒子。每段管子的粗细和它能跑的 MB/s 成比例，数字来自模型，最窄处约 {c20x2} MB/s；盒子和管子的长短是示意。
aria: 示意图：一次大文件拷贝的链条：NVMe 盘 7,250 MB/s，桥接芯片往盘那边是 PCIe 3.0 ×2，约 1,674 MB/s，USB 20 Gb/s 约 2,200 MB/s，最后到电脑；管子的粗细按速度比例画，最细的是芯片往盘那一段
drv: NVMe 盘
br: 桥接芯片 SCSI → NVMe
pc: 电脑
vd: 盘：{drive} MB/s
vb: 芯片往盘那边 PCIe 3.0 ×2：{bridge} MB/s
vu: USB 20 Gb/s：{usb} MB/s
x: 整条链只能跑最窄的那一段：约 {x} MB/s，卡在芯片往盘那一侧。
:::

翻译本身很快，慢在别处：芯片往盘那一边开了几条路。芯片的简介上写得很清楚：一颗 10 Gb/s 的 NVMe 桥接芯片下行是 PCIe 3.0 ×2；一颗 20 Gb/s 的芯片，下行也只是 PCIe 3.0 ×2。下面把一次大文件拷贝串成一条链：

::: lab ch6-model
model.title: 模型 · 从闪存到电脑：一条链上最窄的一段
model.how: 换**盘**、**桥接芯片的下行**、**盒子**和**电脑口**支持的 USB 档位，再换**传输方式**。最短的那根条决定上限，金色的数是协议之后实际能跑的。
model.aria: 盘、桥接下行、USB 链路三段的上限与实际吞吐
ctl.drive: 盘
drive.sata: SATA 固态
drive.nvme: NVMe 固态
ctl.proto: 传输方式
proto.bot: Bulk-Only
proto.uas: UASP
ctl.bridge: 桥接下行
br.sata: SATA 6 Gb/s
br.p3x2: PCIe 3.0 ×2
br.p3x4: PCIe 3.0 ×4
ctl.box: 盒子
usb.g1x1: 5 Gb/s
usb.g2x1: 10 Gb/s
usb.g2x2: 20 Gb/s
ctl.host: 电脑口
read.x: 实际能跑
read.neck: 最窄的一段
read.mode: 实际谈成的链路
read.share: 占盘标称的
st.drive: 盘的顺序读
st.bridge: 桥接下行
st.usb: USB 链路
st.tunnel: PCIe 隧道
st.final: 实际（协议之后）
cv.nofit: 盘和桥接芯片对不上，盘认不出来
say.nofit: 这块盘和这颗芯片对不上：SATA 盘要 SATA 下行，NVMe 盘要 PCIe 下行。插得进 M.2 槽，也认不出来（<a href='../what-a-drive-is-made-of/#ch7'>五层地图</a>的第三层不对）。
say.usb: 最窄的是 USB 那一段（{mode}，约 {cap}）：盘和芯片都还有余量，实际能跑 {X}，只是盘标称的 {share}。
say.bridge: 最窄的是桥接芯片往盘那一侧的路，约 {cap}，比 USB 那一段还窄：盒子上印的速率用不满，实际 {X}。
say.drive: 最窄的是盘自己（{cap}）：链路和芯片都比它宽，实际 {X}。换更快的盒子不会更快。
say.fallback: 盒子和电脑口谈成的是 {mode}（USB 3.2 表 7-14：取两边都支持的那一档），不是盒子上印的那档；实际 {X}。
:::

这就是开头那个问题的大半个答案。7,250 MB/s 的盘装进 10 Gb/s 的盒子，链条最窄处是 USB，用 UASP 实际 {c10} MB/s，用 Bulk-Only 是 {c10bot} MB/s；放进下行 PCIe 3.0 ×4 的 20 Gb/s 盒子，插在支持 20 Gb/s 的口上，是 {c20} MB/s；可同样的盒子插在只支持 10 Gb/s 的口上，两边按表 7-14 谈成 Gen 2×1，又回到 {c20on10} MB/s。最容易被忽略的是下行：20 Gb/s 的芯片配 PCIe 3.0 ×2，最窄处变成芯片自己那一侧，约 {c20x2} MB/s。一块 SATA 固态装进任何 10 Gb/s 的盒子，都是盘自己的 {cSata} MB/s 封顶。

PCIe 每条通道的原始速率按 128b/130b 编码算：3.0 一条约 {lane3} MB/s（SD 协会给 SD Express 标的 985 MB/s 就是这个数）；×2 和 ×4 再乘一个包头效率，得到 {p3x2} 和 {p3x4} MB/s。

调出来的参数和假设：PCIe 包头效率取 0.85；拷贝按每条 1 MiB、UASP 下同时 4 条算；USB 那一段用规范给的有效值（5 Gb/s 450、10 Gb/s 1,100、20 Gb/s 2,200 MB/s，最后一个是规范说的「加倍」）。盒子里的芯片还可能有自己的上限，这里没有数据，所以没放进模型。 {.take}

## 拷着拷着变慢 {#ch7}

::: strings
toc: 拷着拷着变慢
:::

盘和芯片产生的热要从一个小盒子里散出去。温度按指数爬向一个平衡点；平衡点高过盘的保护温度，盘就会在几分钟后自己降速，平均速度跟着掉。 {.law}

拷一个大文件，开头几分钟很快，后面忽然慢下来，盒子摸上去发烫。这多半是盘在保护自己：温度到了某个门槛，固件降低速度，凉一点再恢复。盘的规格书只给了工作温度范围，比如这块 PCIe 4.0 盘写着 0–70 °C，读的时候 4 TB 版本耗电 5.5 W；装进盒子之后，热往哪里走，就看盒子了。

最简单的热模型是一块有热容的东西挂在一个热阻上（传热学里的「集总热容」，Newton 冷却定律）：C·dT/dt = P − (T − T环境)/R。不降速时温度按指数逼近 T环境 + R·P，时间常数是 R·C。

::: diagram dg-heat keys=dg.heat
cap: 第 7 章的模型就是其中的电路图：盘和芯片的热先把热容 C 加热，再经外壳的热阻 R 散到空气里。热阻越大，平衡温度越高。示意，不按比例。
aria: 示意图：左边是硬盘盒的剖面，盘和芯片发热，热经外壳散到空气里；右边是对应的集总热容模型：功率 P 流进温度为 T 的节点，节点上挂着热容 C，经热阻 R 连到环境温度
air: 空气（环境温度）
drv: 盘
chip: 芯片
p: 热：盘和芯片的功率 P
case: 外壳：热经它散到空气里，塑料比金属难散
src: 功率 P
t: 温度 T
c: 热容 C
ta: 环境温度
r: 热阻 R
rv: R：塑料壳 {rp} K/W，金属壳 {ra} K/W（调出来的参数）
eq: C·dT/dt = P − (T − T环境)/R；平衡时 T = T环境 + R·P
:::

::: lab ch7-model
model.title: 模型 · 一次长拷贝里的温度和速度（集总热容 + 带回差的降速）
model.how: 选**盒子**（它决定盘跑多快，即上一章的结果）、**外壳**（决定热阻，调出来的参数）、拖动**环境温度**。按**播放**看 {durMin} 分钟的拷贝加速演完。
model.aria: 长拷贝中盘温和速度随时间变化
cv.t: 温度 °C
cv.r: 速度 MB/s
ctl.box: 盒子
box.g2x1: 10 Gb/s
box.g2x2: 20 Gb/s
box.tb5: 雷电 5
ctl.shell: 外壳
shell.al: 金属，带导热垫
shell.plastic: 塑料，无导热垫
ctl.ta: 环境温度
btn.play: 播放
btn.reset: 从头
read.tinf: 不降速时的平衡温度
read.tfirst: 第一次降速
read.avg: 整段平均速度
read.slow: 降速时间占比
btn.pause: 暂停
cv.x: 时间（分钟）
cv.thr: 降速门槛 {v} °C
never: 不会
say.cool: 这个组合的平衡温度是 {Tinf}，低于 {thr} 的门槛，整段一直跑 {rate}。
say.throttle: 平衡温度会到 {Tinf}，高过 {thr}：约 {tFirst}后第一次降速，之后在门槛附近忽快忽慢，{slow} 的时间在慢档，整段平均 {avg}，标称是 {rate}。
:::

模型里一个有意思的结果：链路越慢，盘越凉。10 Gb/s 的盒子里盘只跑 {avg10p} MB/s，盘和芯片合计约 {P10} W，塑料壳里平衡在约 {T10p} °C，不降速；同样的盘满速时要 {Pfull} W。20 Gb/s 的塑料盒平衡温度 {T20p} °C，约 {ts20p} 分钟后开始降速，{durMin} 分钟平均 {avg20p} MB/s。雷电 5 的塑料盒平衡温度会到 {T5p} °C，约 {ts5p} 秒后就降速，平均只剩 {avg5p} MB/s；换成金属壳，平衡在 {T5a} °C，一直跑 {avg5a} MB/s。

所以评测里「前 30 秒很快」和「连续拷 {durMin} 分钟的平均速度」可以差很多，两者都是真的。模型的时间常数是塑料壳 R·C ≈ {tau} 分钟：几分钟内看不出问题的盒子，十几分钟后才露出来。

全是调出来的参数：热阻（金属 6、塑料 14 K/W）、热容 25 J/K、芯片 1 W、盘的活动底功耗 1.5 W、降速后跑 30%、门槛借用规格书的 70 °C 工作上限、回差 5 °C。热阻是最敏感的一项：20 Gb/s 塑料盒的平衡温度在热阻减半时是 {T20lo} °C，加倍时 {T20hi} °C，降不降速整个翻过来。热容只移动时间，不移动平衡温度：热容减半时这个盒子约 {ts20h} 分钟开始降速，加倍时要 {ts20d} 分钟，比 {durMin} 分钟的拷贝还长，但再拷下去还是会降。能站得住的只有方向：跑得越快越热，散热越差越早降速。 {.take}

## 雷电与 USB4：不翻译的路 {#ch8}

::: strings
toc: 雷电与 USB4：不翻译的路
:::

雷电和支持 PCIe 隧道的 USB4 不把盘当 SCSI 设备：它们把一段 PCIe 链路装在线里，盘直接接到电脑的 NVMe 驱动上。没有翻译，也没有 Bulk-Only，上限变成隧道分到的 PCIe 带宽。 {.law}

USB4 规范把自己描述成一个「<a href='../how-thunderbolt-works/#ch2'>多协议隧道</a>」：一根线里同时装 USB 3、DisplayPort 和 PCIe，各占一份带宽。盒子里如果是一颗 <a href='../how-pcie-works/#ch1'>PCIe 交换芯片</a>而不是 USB 桥接芯片，电脑看到的就是一块真正的 NVMe 盘，用的是和主板上那块一样的驱动、一样的队列（<a href='../why-nvme-is-fast/#ch2'>NVMe 那一篇</a>）。SMART、释放命令、固件更新都原样通过。

::: diagram dg-tunnel keys=dg.tunnel
cap: 同一块 NVMe 盘的两条路。左边经过桥接芯片的翻译，盘在电脑眼里是 SCSI 设备；右边线里装的是一段 PCIe 链路，盒子里没有翻译。绿色是线，青色是盒子里的芯片和它往盘那边的 PCIe，紫色是盘。示意。
aria: 示意图：两种硬盘盒并排。左边 USB 桥接盒：SCSI 磁盘驱动和 USB 存储驱动、USB 主机控制器、USB 线、桥接芯片把 SCSI 翻成 NVMe、PCIe、NVMe 盘。右边 PCIe 隧道盒：NVMe 驱动、PCIe 根端口和主机路由器、雷电或 USB4 线上的隧道包、设备路由器和 PCIe 交换芯片、PCIe、NVMe 盘
at: USB 桥接盒
a1: SCSI 磁盘驱动、USB 存储驱动
a2: USB 主机控制器
al: USB 线：SCSI 命令装在 Bulk-Only 或 UASP 里
a3: 桥接芯片：SCSI → NVMe
bt: 雷电 / USB4 的 PCIe 隧道盒
b1: NVMe 驱动（和主板上那块盘的一样）
b2: PCIe 根端口 → 主机路由器
bl: 雷电或 USB4 线：PCIe 装进隧道的包
b3: 设备路由器 → PCIe 交换芯片
pcie: PCIe
drv: NVMe 盘
an: 电脑把盘当成 SCSI 设备，每条命令都要翻译。
bn: 电脑直接看到一块 NVMe 盘，不翻译；前提是两头都打开了 PCIe 隧道。
:::

但这条路有两个条件。第一，USB4 规范写明：USB4 主机「可以选择支持」PCIe 隧道，不是必须。不支持的电脑上，盒子如果还带一个 USB 3 桥接（有的芯片两种都做），就退回 USB 3 那一侧；只做 PCIe 的雷电盒子在这样的口上根本用不了。第二，隧道分给 PCIe 多少，由<a href='../how-thunderbolt-works/#ch9'>雷电的规格</a>定：英特尔的雷电 5 技术简介列出对电脑的数据要求，雷电 4 是 PCIe 32 Gb/s，雷电 5 是 PCIe 64 Gb/s（PCIe 4.0）。下面是第 6 章同一条链，只是把 USB 那一段换成隧道：

::: lab ch8-model
model.title: 模型 · 同一条链，换成 PCIe 隧道
model.how: 选**电脑口**，拖动**包头效率**（调出来的参数），看最窄的一段从哪里移到哪里。盒子里是 PCIe 4.0 ×4 下行，盘还是那块 7,250 MB/s 的。
model.aria: PCIe 隧道路径下盘、下行、隧道三段的上限
ctl.host: 电脑口
host.usb4np: USB4，不支持 PCIe 隧道
host.tb4: 雷电 4 / 带 PCIe 的 USB4
host.tb5: 雷电 5
ctl.eta: 包头效率
read.x: 模型上限
read.neck: 最窄的一段
read.rep: 评测里报告的
rep.none: —
say.nopcie: 这台电脑的 USB4 口不开 PCIe 隧道；假设盒子还带 USB 3 桥接，它就退回 USB 3 那一侧（雷电 4、5 对电脑的最低要求里 USB 3 是 10 Gb/s，雷电 5 注明可到 20 Gb/s；这里按 10 Gb/s 算），又变成第 6 章的链条：约 {X}。
say.tunnel: 最窄的是隧道分给 PCIe 的那一份：约 {X}。盘和下行都还有余量。
say.bridge: 隧道已经比盒子里的 PCIe 4.0 ×4 下行宽了，最窄处回到盒子自己：约 {X}。
:::

模型给出：雷电 4 的 32 Gb/s 换成字节是 {tunRaw4} MB/s，乘上包头效率约 {t4} MB/s（效率在 0.80 到 0.92 之间时是 {t4lo} 到 {t4hi} MB/s）。可评测和用户实测里雷电 3、4 的 NVMe 盒子常见的是约 {rep34} MB/s，比模型低一截；差在哪里，我没有找到第一手的解释，所以这里只说「模型是上限，实测更低」。雷电 5 的隧道是 64 Gb/s，最窄处回到盒子里的 PCIe 4.0 ×4，约 {t5} MB/s；已发表的评测报告的顺序读在 {rep5lo} 到 {rep5hi} MB/s 之间，取决于电脑和盘。不支持 PCIe 隧道的 USB4 口上，同一个盒子约 {tnp} MB/s。

所以同一个 40Gbps 的盒子，插在开了 PCIe 隧道的口上，模型上限约 {t4} MB/s；插在不开隧道的 USB4 口上，退回 USB 3 只有约 {tnp} MB/s，差三倍。盒子上印的数字一样，看的是两头有没有打开 PCIe 隧道。

调出来的参数：包头效率默认 0.85，和第 6 章相同。雷电 3、4 的约 {rep34} MB/s 和雷电 5 的 {rep5lo}–{rep5hi} MB/s 来自评测和论坛，不是厂家的规格，BRIEF.md 里列了出处。隧道的调度、PCIe 交换芯片的延迟没有放进模型。 {.take}

## U 盘和存储卡 {#ch9}

::: strings
toc: U 盘和存储卡
:::

U 盘和存储卡里是一颗控制器加一两颗闪存。写入速度是颗数乘以每颗能写多快，再和总线比谁小；颗数太少，什么接口都救不了。 {.law}

一块 NVMe 固态能快，是因为主控同时指挥几十颗闪存一起干活（<a href='../why-nvme-is-fast/#ch5'>NVMe 那一篇第 5 章</a>）。U 盘没有这个空间：一个指甲盖大的控制器，旁边一两颗闪存，很多还走 Bulk-Only。每颗闪存写入的速度是有上限的。2023 年国际固态电路会议上，SK 海力士发表的一颗 1 Tb 三比特 300 多层闪存，标题里写着「194 MB/s 写入吞吐」；IEEE Spectrum 的报道引述 SK 海力士的说法，称这是当时三比特闪存公布过的最高写入吞吐。便宜 U 盘里的闪存是哪一代、多快，厂家一般不公布。

::: diagram dg-stick keys=dg.stick
cap: 写入速度是颗数乘以每颗多快，再和总线比谁小。U 盘里只有一两颗，NVMe 固态里有几十颗一起干活。右边的路数和颗数是示意。
aria: 示意图：左边是 U 盘：USB 插头、一个控制器、一两颗闪存，已发表的最快一颗写 194 MB/s；右边是 NVMe 固态：一个主控分几路连着许多颗闪存（图里画成四路、每路八颗）
at: U 盘：一个控制器，一两颗闪存
usb: USB
ctl: 控制器
die: 闪存
die2: 第二颗闪存
per: 已发表的最快一颗：写 {die} MB/s
bus: 总线这一头：5 Gb/s、Bulk-Only、每条 128 KiB 时约 {bus} MB/s
bt: NVMe 固态：主控同时指挥几十颗闪存
ctl2: 主控
many: 几十颗闪存分几路同时写（路数和颗数因盘而异）
:::

::: lab ch9-model
model.title: 模型 · 一根 U 盘或一张卡的顺序写（第 4 章的模型 + 颗数）
model.how: 选**闪存颗数**，拖动**每颗写多快**，换**总线**。U 盘的总线用第 4、5 章的模型按每条 128 KiB 算；存储卡用 SD 协会给的总线最大值。
model.aria: 闪存总写入能力与总线能力的比较
st.flash: 闪存合计
st.bus: 总线与协议
ctl.dies: 闪存颗数
ctl.die: 每颗写多快
ctl.bus: 总线
bus.u2bot: USB 2.0，Bulk-Only
bus.u5bot: 5 Gb/s，Bulk-Only
bus.u5uas: 5 Gb/s，UASP
bus.uhs1: SD UHS-I
bus.uhs2: SD UHS-II
bus.ex7: SD Express 7.0
read.x: 顺序写
read.flash: 闪存合计
read.bus: 总线能带
read.need: 填满总线要几颗
say.flash: 闪存合计只能写 {flash}，总线能带 {bus}：卡在闪存，写入 {X}。要约 {need} 颗这样的闪存才能用满这条总线。
say.bus: 闪存合计能写 {flash}，总线和协议只带得动 {bus}：卡在总线，写入 {X}。
:::

模型给出：一颗 194 MB/s 的闪存接在 5 Gb/s、Bulk-Only 的 U 盘里，写入 {st1} MB/s，卡在闪存；换成两颗，卡在总线和 Bulk-Only，{st2} MB/s；同样两颗接 USB 2.0，只有 {stu2} MB/s。也就是说，在 5 Gb/s 的 Bulk-Only 上，每条 128 KiB 能带 {stBus} MB/s，约 {stDies} 颗最快的闪存就够喂饱它；再多颗，就得换协议和总线。

存储卡是另一套总线，不走 USB。SD 协会的规格里，UHS-I 总线最高 104 MB/s，UHS-II 半双工 312 MB/s；SD Express 把 PCIe 和 NVMe 接到卡上，7.0 版是 PCIe 3.0 ×1、985 MB/s，8.0 版到 PCIe 4.0 ×2、3,940 MB/s。读卡器如果是 USB 的，卡后面又接上第 6 章那条链：卡、读卡器芯片、USB，谁窄谁说了算。

模型只看顺序写的稳态，没算闪存里的单比特缓存（写满前很快、写满后掉速）、垃圾回收和小块随机写；194 MB/s 是论文标题里的最好值，不是 U 盘里常见的值，所以做成了可以拖的参数。SD 总线没有协议模型，用的是 SD 协会给的总线上限。 {.take}

## 前沿在哪（截至 2026 年 11 月） {#ch10}

::: strings
toc: 前沿在哪
:::

线越来越快，80 Gb/s 已经写进规范、做进产品；可存储走的那一段，取决于两头有没有打开 PCIe 隧道，以及盒子里那颗芯片往盘那边开了几条路。 {.law}

下面分三类：规范里定死的、已经有人做出来并测过的、还只是某一方的说法。日期是我查证的时间，出处在 BRIEF.md。

### 规范里已经定下的 {#h.est .sub3}

- <span class='tag h'>规范</span>USB4 2.0 版于 2022 年 10 月 18 日发布（USB-IF 新闻稿），加了 80 Gb/s（三电平信号）和 120/40 Gb/s 的不对称模式；USB-IF 文档库里最新的整合版收录到 2025 年 11 月 19 日的勘误。 {#e1}
- <span class='tag h'>规范</span>USB 3.2 的最新修订是 2022 年 6 月的 1.1 版；2024 年 1 月的命名指南推荐的消费者名称只有五个：USB 5Gbps、10Gbps、20Gbps、40Gbps、80Gbps。 {#e2}
- <span class='tag h'>规范</span>USB4 主机的 PCIe 隧道是可选项；雷电 4 要求 PCIe 32 Gb/s，雷电 5 要求 64 Gb/s（英特尔 2023 年 9 月的技术简介）。SD Express 8.0 定义到 3,940 MB/s。 {#e3}

### 已经做出来、有人测过的 {#h.demo .sub3}

- <span class='tag m'>已实现</span>雷电 5 的 NVMe 硬盘盒在已发表的评测里报告了约 {rep5lo}–{rep5hi} MB/s 的顺序读，高的那头要配支持雷电 5 的电脑和 PCIe 4.0 以上的盘。 {#d1}
- <span class='tag m'>已实现</span>雷电 3、4 的 NVMe 盒子在实测里多停在约 {rep34} MB/s，低于 32 Gb/s 隧道算出来的上限（第 8 章）。 {#d2}
- <span class='tag m'>已实现</span>20 Gb/s（Gen 2×2）的桥接芯片早已量产，但芯片简介显示有的下行只有 PCIe 3.0 ×2（第 6 章）；电脑一侧支持 Gen 2×2 的口也不普遍，插不上时按表 7-14 退回 10 Gb/s。 {#d3}

### 某一方的说法，我没能核实 {#h.claim .sub3}

- <span class='tag l'>未核实</span>有厂商网页说，USB-IF 自 2026 年起强制包装只用「USB 80Gbps」这类速率名；我只在第三方网站上看到，没找到 USB-IF 的原文，所以只当传闻。 {#c1}
- <span class='tag l'>未核实</span>雷电 3、4 实测比隧道上限低的原因，论坛里常说是控制器给 PCIe 数据分的带宽只有约 22 Gb/s；我没有找到英特尔的原始说法。 {#c2}
- <span class='tag l'>说法</span>评测里「最快」的数字都是在特定电脑、特定盘、短时间内测的；换一台电脑或拷得更久（第 7 章），数字会变。 {#c3}

下一步要看的不是线速，而是三件事：更多电脑默认打开 PCIe 隧道；USB 桥接芯片的下行跟上上行；以及小盒子能不能把 6–7 W 的热散出去。

这一章的事实会过时。它们都放在 models.js 的 FRONTIER 数据块里，日期写在旁边，方便以后更新。 {.take}

## 看包装时问三件事 {#ch11}

::: strings
toc: 看包装时问三件事
:::

一个移动硬盘能跑多快，是一条链上最窄的那一段；包装上的数字只说其中一段。 {.law}

{.plain .qs}
1. **这个名字的线速是多少，两头谈得成吗？**把「Gen 2×2」「USB 3.1 Gen 1」换成 5、10、20、40、80 Gb/s（第 3 章），再看电脑口支持哪一档：两头取都支持的那档（第 6 章）。 {#q1}
2. **最窄的是哪一段？**盘的顺序读、桥接芯片的下行（PCIe 几乘几）、USB 的有效值、Bulk-Only 还是 UASP（第 4–6 章），逐段比，取最小的。拷很久的话，再加上热（第 7 章）。 {#q2}
3. **它走 USB 桥接，还是 PCIe 隧道？**前者要翻译 SCSI，SMART 和释放命令看芯片（第 6 章）；后者没有翻译，但要电脑打开 PCIe 隧道（第 8 章）。 {#q3}

回到开头：7,250 MB/s 的盘装进 USB 盒子只剩几百到两三千 MB/s，是因为它一路要过好几道窄门。*名字*说的是线速，扣掉编码、包头和协议，规范给的有效值在 5 Gb/s 上只剩 {g1share}，10 Gb/s 上剩 {g2share}；*Bulk-Only*一次只办一件事，小块读远低于线速；*UASP*用队列把等待叠起来；*桥接芯片*往盘那边常常只开两条 PCIe 通道；*热*会让长拷贝越拷越慢。雷电和 USB4 的 PCIe 隧道拿掉了翻译，上限才从 USB 的一两千 MB/s 跳到几千 MB/s。 {#sum .sum tag=div}

接着读：<a href='../what-a-drive-is-made-of/'>《硬盘里到底是什么》</a>画了整张存储地图，<a href='../how-sata-works/'>《SATA 为什么用了二十多年》</a>讲盒子里那块 SATA 盘的另一侧，<a href='../why-nvme-is-fast/'>《NVMe 为什么这么快》</a>讲 PCIe 和 NVMe 队列。SCSI 命令本身见本系列的<a href='../how-sas-works/#ch2'>《服务器硬盘为什么用 SAS》</a>第 2 章。同一套 SCSI 命令隔着网络走，见<a href='../storage-over-a-network/#ch3'>《隔着网线的硬盘》第 3 章</a>。 {#links style="margin-top:2em"}

::: footer
**来源。**Universal Serial Bus Specification Revision 2.0（USB-IF，2023-02-24 文件包）：§5.3.3，表 5-10。Universal Serial Bus 3.2 Specification Revision 1.1（2022 年 6 月）：修订记录，表 3-1，§4.3.1.1，§4.4.6.4，§4.4.11，§7.2.1，表 7-14、7-15。USB4 Specification Version 2.0（2025 年 11 月整合版）：修订记录，§2.2.10.3，§3.1.1.2，§3.2，§4.3.1，§11。USB-IF：USB 80Gbps 新闻稿（2022-10-18），USB Data Performance Language Usage Guidelines（2024 年 1 月）。USB Mass Storage Class Bulk-Only Transport Revision 1.0（1999）；Mass Storage Specification Overview 1.4（2010-02-19）；USB Attached SCSI Protocol Revision 1.0（2009-06-24）。NVM Express: SCSI Translation Reference 1.1。smartmontools 的 smartctl(8) 手册（SAT 与 NVMe 桥接设备类型）。Linux 内核 drivers/usb/storage/uas.c、unusual_uas.h，drivers/ata/libata-scsi.c，include/scsi/scsi_proto.h（2026-11-14 读）。JMicron JMS583、JMS581D、JMS586A 产品简介。英特尔雷电 5 技术简介（2023 年 9 月）。SD 协会总线速度页面。三星 990 EVO Plus 数据表 1.0 版、870 EVO 数据表 1.1 版。E. D. Lazowska 等，Quantitative System Performance（1984），第 5 章。Incropera 与 DeWitt，Fundamentals of Heat and Mass Transfer，§5.2。SK hynix，ISSCC 2023 论文 28.2。前沿一章用到的评测与新闻见 BRIEF.md。

由 AI 写成。模型是简化的，文中标出了哪些参数是调出来的。这不是购买建议。
:::
