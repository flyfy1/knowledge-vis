---
lang: zh
---

::: strings
docTitle: 网络流 · 一封消息的旅程
back: ← 知识索引
pageTitle: 网络流 · 一封消息的旅程
tagline: 一封消息不会“直接飞过去”：它被切成包，排进链路，交给路由器转发，再由 TCP 用确认与重传把不可靠的网络拼成可靠的字节流。拖动每个旋钮，看因果链如何改变。
foot: 网络流 · 一封消息的旅程
:::

## 一封大消息，先被切成小包 {#step0 h2=s0t}

::: strings
nav0: 0 分包
:::

第 0 步 · 分包 {#s0k .step-kicker i18n=text}

发送 4 MB 文件时，网络不会搬一个巨型箱子；它按 MTU 切成许多带编号的包。**包越小，单包等待越短；包越多，头部开销越大。**点击发送，观察包如何逐个穿过链路。 {#s0e .explain}

::: html step0-1
sizeLab: 消息大小（MB）
mtuLab: MTU 档位
send: 发送一轮
reset: 重置
:::

真实网络还会丢包、乱序；序号让接收端能重排，校验和让它发现损坏。分包不是免费魔法，而是把“大失败”拆成可重试的小失败。 {#s0hint .hint}

::: strings
sizeVal: {v} MB
mtuVal: {v} KB
s0ro: 包数 {n} · 头部开销 {h}% · 已到达 {a}/{n}
:::

## 带宽是水管粗细，延迟是水从哪儿来 {#step1 h2=s1t}

::: strings
nav1: 1 延迟与带宽
:::

第 1 步 · 延迟与带宽 {#s1k .step-kicker i18n=text}

总时间约等于**往返延迟 + 数据量 ÷ 带宽**。把延迟拉高，短消息立刻变慢；把带宽拉高，长消息才明显受益。两个旋钮控制的是不同瓶颈。 {#s1e .explain}

::: html step1-1
latLab: 往返延迟 RTT（ms）
bwLab: 带宽（MB/s）
:::

延迟决定“第一口水什么时候到”，带宽决定“后面每秒能灌多少”。视频缓冲和网页首屏因此会有不同的优化方向。 {#s1hint .hint}

::: strings
s1formula: 总时间 = RTT + 消息大小 ÷ 带宽
s1ro: 当前 4 MB：RTT {l} ms · 带宽 {b} MB/s · 总时间 {t} ms
:::

## 路由器只看下一跳，不看完整旅程 {#step2 h2=s2t}

::: strings
nav2: 2 路由
:::

第 2 步 · 路由 {#s2k .step-kicker i18n=text}

每个路由器根据目标地址查表，选择一个**下一跳**。换路由可能绕远，但避开拥塞；路径不是地图上最短的直线，而是当下策略与状态的结果。 {#s2e .explain}

::: html step2-1
routeLab: 路径策略
:::

IP 层尽力转发，不保证到达、不保证顺序；可靠性由更上层协议补上。 {#s2hint .hint}

::: strings
routeVal: {v}
s2ro: 路径 {p} · 跳数 {h} · 传播延迟 {d} ms · 队列等待 {q} ms
:::

## 三次握手：双方先确认“我能听见你” {#step3 h2=s3t}

::: strings
nav3: 3 TCP 握手
:::

第 3 步 · TCP 握手 {#s3k .step-kicker i18n=text}

客户端先发 SYN，服务器回 SYN-ACK，客户端再 ACK。第三步不是礼节：它让双方都确认**自己的发送能力和对方的接收能力**，并同步初始序号。 {#s3e .explain}

::: html step3-1
syn: 发送 SYN
synAck: 发送 SYN-ACK
ack: 发送 ACK
:::

握手只建立连接，不承载你的文件。连接建立后，数据段才沿着同一套序号、确认号与窗口规则流动。 {#s3hint .hint}

::: strings
s3ro: 状态：{st} · 已发送 {n} 个控制包 · 连接序号 {seq}
:::

## 路由器的队列满了，发送端要学会慢下来 {#step4 h2=s4t}

::: strings
nav4: 4 拥塞
:::

第 4 步 · 拥塞控制 {#s4k .step-kicker i18n=text}

当网络负载升高，队列等待会暴涨，丢包也会增多。TCP 通过拥塞窗口逐步探测容量：成功确认就加一点，超时或重复 ACK 就退让。**稳定吞吐来自试探与退让的闭环。** {#s4e .explain}

::: html step4-1
loadLab: 网络负载
:::

“加大带宽”不是所有拥塞的答案：若瓶颈在 RTT 或队列，窗口与排队策略同样关键。 {#s4hint .hint}

::: strings
loadVal: {v}/10
s4formula: 吞吐 ≈ min(带宽, 拥塞窗口 ÷ RTT)
s4ro: 负载 {l}/10 · 丢包率 {p}% · 平均等待 {q} ms · 当前窗口 {w} KB
:::

## 把一封消息读成五层因果链 {#step5 h2=s5t}

::: strings
nav5: 5 收束
:::

第 5 步 · 收束 {#s5k .step-kicker i18n=text}

应用写下字节 → TCP 编号、确认、重传 → IP 选择下一跳 → 链路按带宽发送 → 队列把拥塞变成等待。每层只解决自己的问题，组合起来才像“可靠网络”。 {#s5e .explain}

::: html step5-1
s5formula: 可靠性 = 分包 + 序号 + 确认 + 重传；速度 = 带宽、延迟与队列共同决定
:::

继续探索：改变一个旋钮，先预测哪一层会变，再观察读数是否支持你的预测。 {#s5ro .readout}
