---
lang: zh
---

::: strings
docTitle: 找规律 · 不画也能报出第 100 个
back: ← 知识索引
pageTitle: 找规律 · 不画也能报出第 100 个
tagline: 用火柴棒摆图形：数出前几个，找到“每次多几根”，就能直接算出任意第 n 个。
navLabel: 步骤导航
category: 数学基础
stage: 小学
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
langLabel: 语言
:::

## 第 n 个图要用几根火柴？ {#step0 h2=s0t}

::: strings
nav0: 0 数一数
:::

第 0 步 · 数一数 {#s0k .step-kicker i18n=text}

这一步要回答：把 n 个正方形排成一排，一共要几根火柴？“第 n 个图”就是由 n 个正方形连成的那一排；相邻的正方形共用中间那根火柴。拖动滑杆改变 n，再按“逐根数一遍”，看数到的根数怎样随 n 增长。 {#s0e .explain}

::: html step0-1
s0cv: 火柴棒摆成的一排正方形
s0n: 正方形个数 n
s0count: 逐根数一遍
s0reset: 重置计数
:::

::: strings
s0ro: 第 {n} 个图：共 {total} 根火柴（按图上每根线段逐根数出）。
s0roCount: 正在数：已数 {k} / {total} 根
s0roDone: 数完了：{total} 根。
:::

## 每多摆一个正方形，多用几根？ {#step1 h2=s1t}

::: strings
nav1: 1 找增量
:::

第 1 步 · 找增量 {#s1k .step-kicker i18n=text}

这一步要回答：相邻两个图相比，火柴多了几根？这个“多出来的根数”叫**增量**（后一个图的总数减前一个图的总数）。反复点“再摆一个”，橙色线段是这次新加的，上面的数列把每次的总数和增量都记下来。 {#s1e .explain}

::: html step1-1
s1cv: 逐个添加正方形，并记录总数与增量
s1add: 再摆一个
s1reset: 重置为第 1 个图
:::

::: strings
s1ro: 现在是第 {n} 个图，共 {total} 根；这次新加 {d} 根（{total} − {prev}）。
s1ro1: 第 1 个图：4 根，还没有“上一个图”可比，再摆一个试试。
s1roSame: 增量一直是 {d}：每次新加的形状完全一样，所以每次都多这么多根。
:::

## 不用画，怎样直接算出第 100 个图？ {#step2 h2=s2t}

::: strings
nav2: 2 拆成组
:::

第 2 步 · 拆成组 {#s2k .step-kicker i18n=text}

这一步要回答：能不能不摆图，直接得到第 n 个的火柴数？看颜色：灰色的 1 根是最左边的“起头”，其余每个正方形各带 3 根同色的新火柴（上、右、下）。所以总数 = 1 + 3 × n。滑杆改变 n，数字框直接试很大的 n，只算不画。 {#s2e .explain}

::: html step2-1
s2cv: 把火柴按“起头 1 根 + 每格 3 根”染色
s2n: 正方形个数 n
s2big: 试大数 n（只算不画）
:::

::: strings
s2ro: 第 {n} 个图：1 + 3 × {n} = {total} 根。
s2roBig: n = {n}：1 + 3 × {n} = {total} 根；与逐根构造计数 {check} 一致。
s2roMore: （图中只画出前 {shown} 格，其余用省略号表示）
:::

## 换成三角形或六边形，同样的办法还管用吗？ {#step3 h2=s3t}

::: strings
nav3: 3 换图形
:::

第 3 步 · 换图形 {#s3k .step-kicker i18n=text}

这一步要回答：规律的“每次多几根”由什么决定？选一种图形链，相邻两个图形共用一条边。下方折线图的横轴是 n，纵轴是火柴总数，点是真实数出来的。点排成一条直线，说明增量不变；这个不变的增量就是直线上升的“台阶高度”。 {#s3e .explain i18n=text}

::: html step3-1
s3kind: 选择图形
kSq: 正方形
kTri: 三角形
kHex: 六边形
s3cv: 图形链和火柴总数折线图
s3n: 图形个数 n
:::

::: strings
axisN: 个数 n
axisSticks: 火柴总数
s3ro: {kind}链：第 {n} 个图共 {total} 根；增量恒为 {d}，起头 1 根，所以总数 = {d} × n + 1。
:::

## 如果每次多出来的根数不一样呢？ {#step4 h2=s4t}

::: strings
nav4: 4 增量会变
:::

第 4 步 · 增量会变 {#s4k .step-kicker i18n=text}

这一步要回答：增量不是常数时，总数还排成直线吗？下面是点阵台阶：第 1 行 1 个点，第 2 行 2 个点……每多一行，新加的点数比上一次多 1。滑杆改变行数 n，看总数和增量两行数列，以及下方的柱子怎样越长越快。 {#s4e .explain i18n=text}

::: html step4-1
s4cv: 点阵台阶与总数、增量数列
s4n: 行数 n
:::

::: strings
s4ro: {n} 行台阶共 {total} 个点；刚加的第 {n} 行有 {d} 个点。增量 {list} 一次比一次大 1，不再是常数。
s4roLine: 总数会越涨越快，所以不再排成直线；仍有规律：把台阶拼成两份能得到 n(n+1)/2。
:::

## 规律 = 起点 + 每次增加的量 {#step5 h2=s5t}

::: strings
nav5: 5 终章
:::

第 5 步 · 终章 {#s5k .step-kicker i18n=text}

这一步要回答：学会找规律之后，能反过来用吗？输入一个火柴总数 S，页面按正方形链的规则 S = 3n + 1 反推 n，并检查它是不是整数。 {#s5e .explain i18n=text}

::: html step5-1
s5in: 火柴总数 S
recapTitle: 回顾
recap1: 数前几个，算出相邻总数的增量。
recap2: 增量不变时，总数 = 增量 × n + 起头；增量逐次变大时，总数增长越来越快。
recap3: 用公式算出的数，要和真实摆出来数出的数对上，才算规律成立。
modelTitle: 模型范围与局限
modelText: 本页的“规律”只对这里规定的摆法成立：一排图形，相邻两个只共用一条边。换一种摆法（比如摆成两行）得到的是另一条规律；而且从前几项看出的规律，没有验证到第 n 项之前，只是猜想。
linkLin: → 去一次函数页：增量不变的点为什么排成一条直线
linkArea: → 去乘法是面积页：把一块拆成两块好算的
linkEq: → 去方程天平页：已知总数反推 n 是怎么一步步解出来的
:::

本页完成：你能数、找增量、写出规律并反推。 {#done .readout .success i18n=text}

::: strings
s5roLow: S = {s}：只摆 1 个正方形就要 4 根，所以 S 至少是 4。
s5roOk: S = {s}：3n + 1 = {s}，n = {n}。所以第 {n} 个图正好用 {s} 根。
s5roNo: S = {s}：没有哪个正方形链正好用 {s} 根（(S − 1) ÷ 3 = {q} 不是整数）。
:::
