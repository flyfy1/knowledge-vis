---
lang: zh
---

::: strings
back: ← 知识索引
category: 物理与电路
stage: 小学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 磁铁 · 铁屑显出看不见的线
tagline: 撒一层铁屑，磁感线自己显形：它们从 N 极出发、回到 S 极，同极相斥、异极相吸。
:::

## 一块条形磁铁，哪里吸力最强？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 两端最强
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 两端最强
:::

这一步要回答：磁铁的哪个位置“磁场最强”？**磁场**是磁铁周围能对铁屑、小磁针施加力的区域，越强铁屑越密。这里把磁铁看成两端各有一个“磁极”（N 极和 S 极）。拖动探头沿磁铁侧面从左端走到右端，下面曲线给出探头位置的磁场强度（相对值，离侧面 0.5 厘米）。 {#s0e .explain}

::: html step0-2
s0cv: 条形磁铁周围的铁屑和沿侧面的磁场强度
pos0: 探头位置（0 = 左端，1 = 右端）
:::

::: strings
s0ro: 探头在 {x} 处：磁场强度 = {b}（相对值）；两端附近最大 {bmax}，正中间 {bmid}。
:::

## 两块磁铁靠近，是吸还是推？力有多大？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 吸还是斥
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 吸还是斥
:::

这一步要回答：同极、异极之间的力怎样随距离变化？右边的磁铁可以翻转并拉远。每个磁极都对另一块磁铁的两个磁极施加力：异极相吸、同极相斥，大小与距离平方成反比。图中的绿色箭头是右边磁铁受到的合力（相对值）。 {#s1e .explain}

::: html step1-2
s1cv: 两块磁铁与右边磁铁受到的合力
face: 相对的两极
faceNS: 异极相对（N 对 S）
faceNN: 同极相对（N 对 N）
gap1: 两块磁铁的间距（厘米）
:::

::: strings
s1ro: {face}，间距 {gap} 厘米：合力 {f}（相对值），{dir}。
attract: 互相吸引
repel: 互相排斥
:::

## 铁屑和磁感线，长什么样？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 铁屑显形
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 铁屑显形
:::

这一步要回答：看不见的磁场怎样被“画”出来？铁屑在磁场里会变成小磁针，沿磁场方向排开；**磁感线**就是沿这些方向连起来的线，规定从 N 极出来、进入 S 极。选一种摆法，切换“铁屑”和“磁感线”，调线条数量，看异极相对时线怎样连通、同极相对时线怎样互相避开。 {#s2e .explain}

::: html step2-2
s2cv: 铁屑或磁感线显示的磁场
cfgSingle: 单块磁铁
cfgAttract: 两块，异极相对
cfgRepel: 两块，同极相对
showFil: 铁屑
showLines: 磁感线
nLines: 每个 N 极的线数
:::

::: strings
s2ro: {cfg}，显示{mode}：{note}
noteSingle: 磁感线从 N 极散出、绕回 S 极，两端线最密。
noteAttract: 异极相对时，线从一块的 N 极直接连到另一块的 S 极。
noteRepel: 同极相对时，线在中间互相顶开，不穿过中线。
:::

## 小磁针放在磁铁旁，会指向哪？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 指南针
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 指南针
:::

这一步要回答：磁场的方向怎样读出来？小磁针的红色一端（N 极）会顺着磁场方向转，指向“磁感线的前进方向”。拖动位置滑杆移动指南针，或打开“一圈指南针”，看它们怎样连成磁感线的形状。 {#s3e .explain}

::: html step3-2
s3cv: 磁铁周围的指南针
cx3: 指南针水平位置（厘米）
cy3: 指南针竖直位置（厘米）
:::

::: strings
ring: 一圈指南针
noring: 只看一个指南针
s3ro: 位置 ({x}, {y}) 厘米：磁场方向 {a}°（从向右的方向逆时针量起），强度 {b}（相对值）。
:::

## 把磁铁掰断，会得到单独的 N 极和 S 极吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 掰断磁铁
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 掰断磁铁
:::

这一步要回答：能不能把 N 极和 S 极分开？选断成几段，再拉开间距：每一段的两端各有一个磁极。贴在一起时，相邻两段接触处的 N 极和 S 极互相抵消，整体看起来像原来那块；拉开后每段都是一块完整磁铁，铁屑显示出各自的 N 和 S。 {#s4e .explain}

::: html step4-2
s4cv: 断成几段的磁铁和铁屑图样
pieces: 断成几段
pull: 拉开的间距（厘米）
:::

::: strings
s4ro: {n} 段：共 {n} 个 N 极、{n} 个 S 极（成对出现）；间距 {g} 厘米：{what}
whatTouch: 贴在一起时，接触处的磁极互相抵消，看上去像一整块。
whatApart: 拉开后每段都是有 N 有 S 的完整磁铁。
:::

## 看铁屑，判断两块磁铁怎么摆的 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：不看标记，能从铁屑图样判断磁铁怎么摆吗？图里的磁铁没有标 N、S。选一种判断，检查；检查后才揭示磁极。 {#s5e .explain}

::: html step5-2
s5cv: 铁屑图样（磁极暂时隐藏）
check: 检查判断
next: 换一题
recapTitle: 回顾
recap1: 磁场在磁极附近最强；磁感线从 N 极出、进 S 极。
recap2: 异极相吸、同极相斥，力随距离增大而迅速减小。
recap3: 磁铁总是成对出现 N 和 S：掰断后每段都有两个极。
modelTitle: 模型范围与局限
modelText: 这里把磁铁简化成两端各一个点状磁极，计算采用“磁极之间的平方反比定律”。真实磁铁的磁场由内部大量原子磁矩产生，近处更复杂；磁感线是帮助想象的画法，不是真有线存在。
linkPyth: → 去勾股定理页：磁极间的距离怎样由横纵距离算出来
linkCoord: → 去坐标系页：用 (x, y) 给指南针定位
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
north: N
south: S
s5ro: 观察铁屑：线是互相连通，还是互相顶开？选一个判断。
s5roOk: 正确：{note}
s5roNo: 不对：{note}
docTitle: 磁铁 · 铁屑显出看不见的线
:::
