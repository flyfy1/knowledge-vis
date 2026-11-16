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
pageTitle: 条形图 · 让数字站成一排比高矮
tagline: 一排柱子把数字变成长度：读得出谁高谁矮，也看得出平均线把高出和不足补平。
:::

## 一个数字怎样变成一根柱子？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 数变成柱
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 数变成柱
:::

这一步要回答：柱子的高度表示什么？这里有 8 位同学的身高（单位 厘米）。柱子的高度就是这个数值：选一位同学，拖动他的身高，看他那根柱子怎样跟着长高或变矮，其余柱子保持不变。 {#s0e .explain}

::: html step0-2
s0cv: 8 位同学身高的条形图
who: 选同学 #
hgt: 他的身高（厘米）
:::

::: strings
unit: 厘米
s0ro: 同学 #{i} 的身高是 {v} 厘米，柱子高度 = 这个数值；8 人最高 {max}，最矮 {min}（厘米）。
:::

## 谁比谁高，高出多少？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 比高矮
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 比高矮
:::

这一步要回答：两根柱子相差多少？选同学 A 和同学 B：虚线从各自的柱顶拉平，中间的括号长度就是两人身高的差。最高的柱子标绿，最矮的标紫。 {#s1e .explain}

::: html step1-2
s1cv: 比较两根柱子的差
A: 同学 A #
B: 同学 B #
:::

::: strings
s1ro: A（#{a}）{va} 厘米，B（#{b}）{vb} 厘米：差 = {va} − {vb} = {d} 厘米。
s1roSame: A 和 B 是同一个人，差为 0。
:::

## 同样的数据，为什么有时看起来相差悬殊？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 轴从哪起
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 轴从哪起
:::

这一步要回答：纵轴的起点（基线）改变了什么？数据完全没有变，只改变纵轴从哪个数开始画。柱子的长度是「数值 − 基线」，所以起点抬高后，最高与最矮柱子的长度之比会变大，但真实身高之比没变。 {#s2e .explain}

::: html step2-2
s2cv: 同一组数据，不同的纵轴起点
base: 纵轴起点（厘米）
:::

::: strings
s2ro: 起点 {base}：最高柱长 {lmax}、最矮柱长 {lmin}，画出来像是 {vis} 倍；真实身高之比只有 {real} 倍。
s2roGone: 起点 {base} 已不低于最矮的 {min} 厘米：最矮的柱子被切没了，画面上看不出它。
:::

## 哪条横线能把「高出的」和「不足的」刚好补平？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 平均线
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 平均线
:::

这一步要回答：平均数在图上是什么？拖动横线：橙色是柱子高出横线的部分，紫色是柱子够不到横线的部分，下方把两种总长相加。当两个总和相等时，这条线的高度就是**平均数**（全部数相加再除以人数）。 {#s3e .explain}

::: html step3-2
s3cv: 移动横线，比较高出与不足
line: 横线高度（厘米）
snap: 吸附到平均数
:::

::: strings
s3ro: 横线 {L}：高出共 {up}，不足共 {down}，差 {diff}（厘米，8 根柱子合计）。
s3roBal: 补平了：这条线就是平均数 {m} 厘米。
:::

## 来一位新同学，平均数会动多少？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 多一个人
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 多一个人
:::

这一步要回答：新增一个数据后，平均数怎样变？拖动新同学的身高：灰色虚线是原来的平均线，青色实线是加入后的平均线。新同学比原平均高，平均线就上移；比它矮，就下移。 {#s4e .explain}

::: html step4-2
s4cv: 加入第 9 位同学前后的平均线
extra: 新同学身高（厘米）
:::

::: strings
s4ro: 原平均 {m0}，加入 {x} 厘米后平均 {m1}，变化 {sh}（核对：(x − 原平均) ÷ 9 = {chk}）。
:::

## 用你自己的数据画一张条形图 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：换一组数据，图和平均数还能读吗？在框里输入 2 到 12 个正数，用逗号或空格分开，页面会画出柱子和平均线。 {#s5e .explain}

::: html step5-2
s5cv: 你的数据的条形图
own: 你的数据
recapTitle: 回顾
recap1: 柱子的高度就是数据的值；相差用括号量。
recap2: 纵轴起点会改变看上去的差距，读图先看起点。
recap3: 平均数是让高出与不足互相抵消的那条线，新数据会把它拉向自己。
modelTitle: 模型范围与局限
modelText: 本页的柱子只是 8 个示意身高，不是真实调查；平均线的补平性质对任何一组数都成立，但平均数不一定是组里的某个数，也不能反映数据的分散程度。
linkPd: → 去分布与期望页：平均数作为重心的另一种看法
linkClt: → 去中心极限定理页：很多个平均数放在一起会长成什么样
linkCoord: → 去坐标系页：横轴纵轴怎样给点定位
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: 共 {n} 个数，平均 {m}，最大 {max}，最小 {min}。
s5roBad: 请输入 2 到 12 个大于 0 的数，例如 12, 15, 9。
docTitle: 条形图 · 让数字站成一排比高矮
:::
