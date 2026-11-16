---
lang: zh
---

::: strings
back: ← 知识索引
category: 数学基础
stage: 小学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 间隔与植树 · 段数和点数差一
tagline: 路边种树、锯木头、爬楼梯：数“点”和数“段”总是差一个，看清两头种不种就不会数错。
:::

## n 个点之间有几段？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 数手指缝
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 数手指缝
:::

这一步要回答：把 n 个点排成一排，相邻两点之间的空隙（叫“段”）有几个？拖动滑杆改变点数 n，图上橙色的是点，青色括号是相邻两点之间的段。数一数：点比段多一个吗？ {#s0e .explain}

::: html step0-2
s0cv: 一排点和它们之间的段
pts: 点的个数 n
:::

::: strings
s0ro: {n} 个点排成一排，一共 {g} 段（逐个相邻点数出）：段数 = 点数 − 1。
:::

## 路长 24 米，每隔一段距离种一棵，两头都种要几棵树？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 两头都种
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 两头都种
:::

这一步要回答：两头都种时，棵数和段数是什么关系？路长固定 24 米，拖动“间隔”滑杆：**间隔**是相邻两棵树之间的距离，每个间隔对应一段。图上数字标出每棵树的序号，下方青色标出每一段。 {#s1e .explain}

::: html step1-2
s1cv: 24 米长的路，两头都种树
gap: 间隔（米）
:::

::: strings
s1ro: 间隔 {d} 米：24 ÷ {d} = {seg} 段；两头都种，树 = 段数 + 1 = {trees} 棵（图上逐棵数出 {counted} 棵）。
:::

## 如果一头不种、两头都不种，或者围成一圈呢？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 端点不同
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 端点不同
:::

这一步要回答：端点种不种，棵数怎样变？选一种种法，间隔不变（滑杆调整）。路两头的位置各占一个“点”：两头都种，点 = 段 + 1；只种一头，点 = 段；两头都不种，点 = 段 − 1；首尾相接的环形，点 = 段。看图上每种情况哪个位置的树被拿掉了。 {#s2e .explain}

::: html step2-2
s2cv: 四种种法：两头种、一头种、两头不种、环形
modeLabel: 选择种法
mBoth: 两头都种
mOne: 只种一头
mNone: 两头都不种
mRing: 围成一圈
:::

::: strings
s2ro: {mode}，间隔 {d} 米：共 {seg} 段，种 {trees} 棵（图上数出 {counted} 棵），树 − 段 = {diff}。
:::

## 锯成 k 段要锯几刀？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 锯木头
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 锯木头
:::

这一步要回答：把一根木头锯成几段，要锯几刀、花多少时间？每按一次“锯一刀”，木头上多一道切口；假设每刀 3 分钟。切口是“点”，木段是“段”：这里切口数 = 段数 − 1。 {#s3e .explain}

::: html step3-2
s3cv: 一根被锯成若干段的木头
saw: 锯一刀
reset3: 重新放回一根整木
:::

::: strings
s3ro: 已锯 {c} 刀，木头变成 {p} 段；共用 {time} 分钟（不是 {p} × 3 = {wrong}）。
s3roFull: 已锯 {c} 刀，木头变成 {p} 段；共用 {time} 分钟（不是 {p} × 3 = {wrong}）。再锯的话每段会太短，此处最多展示 9 刀。
:::

## 从 1 楼到 a 楼要 30 秒，到 b 楼要多久？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 爬楼梯
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 爬楼梯
:::

这一步要回答：楼层数和爬的楼梯段数差多少？楼层是“点”，两层之间的一段楼梯是“段”：从 1 楼到 a 楼要爬 a − 1 段。已知从 1 楼到 a 楼用了 30 秒，由此算每段多久，再算到 b 楼。 {#s4e .explain}

::: html step4-2
s4cv: 一栋楼的楼层与楼梯段
fa: 已知：1 楼到几楼（a）
fb: 问：1 楼到几楼（b）
:::

::: strings
s4ro: 1 楼到 {a} 楼爬 {fa} 段用 30 秒，每段 {per} 秒；到 {b} 楼爬 {fb} 段，用 {t} 秒（不是 30 × {b} ÷ {a} = {wrong} 秒）。
:::

## 反过来：知道棵数，路有多长？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：已知树的棵数和间隔，能反推路长吗？选种法，输入棵数 T 和间隔 d（米）：先由棵数求出段数，再乘间隔。 {#s5e .explain}

::: html step5-2
s5cv: 按你的输入画出路
treesIn: 树的棵数 T
dIn: 间隔 d（米）
recapTitle: 回顾
recap1: 点数和段数差 0 或 1 或 −1，取决于两端种不种。
recap2: 先数段（总长 ÷ 间隔），再按两端情形加减 1。
recap3: 锯木头的刀数、楼梯的段数，都是“相邻点之间的段”。
modelTitle: 模型范围与局限
modelText: 这里假设间隔处处相等、树是没有宽度的点，路是直的（环形是一个整圆）；若间隔不整除路长，就不能直接用这套数法。
linkPat: → 去找规律页：点数和段数的“差一”是怎样变成公式的
linkDiv: → 去除法与余数页：路长除以间隔有余数时会怎样
linkEq: → 去方程天平页：用等量关系反推未知数
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: {mode}，{T} 棵，间隔 {d} 米：段数 = {seg}，路长 = {seg} × {d} = {len} 米。
s5roBad: 这种种法至少需要 {min} 棵树。
docTitle: 间隔与植树 · 段数和点数差一
:::
