---
lang: zh
---

::: strings
back: ← 知识索引
category: 概率与统计
stage: 高中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 排列与组合 · 数清楚有多少种
tagline: 分步计数画成树，排列与组合只差一句话：顺序算不算数。
docTitle: 排列与组合 · 数清楚有多少种
:::

## 先选上衣、再选裤子、最后选鞋，一共有几种搭配？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 分步相乘
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 分步计数
:::

<b>这一步回答：连续做几件事，总方法数怎么算？</b>每一步的选择数相乘：a × b × c。树的每个分叉是一个选择，最右边的每个点是一种完整搭配。把任意一步加一个选项，所有分支都多一份，所以是相乘而不是相加。拖动三个滑杆，数一数右侧的点。 {#s0e .explain}

::: html step0-2
s0cv: 上衣、裤子、鞋三步的选择树，右侧圆点是完整搭配
lblShirtN: 上衣数
lblPantsN: 裤子数
lblShoesN: 鞋数
:::

## n 个不同的东西排成一行，有多少种排法？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 全排列
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 排成一排
:::

<b>这一步回答：全部排列有多少种？</b>第一个位置有 n 种选择，第二个位置剩 n−1 种，……最后一个位置只剩 1 种，相乘得 n! = n × (n−1) × … × 1。n ≤ 4 时下面把每一种排法都画了出来（不同颜色代表不同的东西）；n 更大时看增长：8! 已经是 40320。 {#s1e .explain}

::: html step1-2
s1cv: n 不超过 4 时画出所有排列；更大时用对数刻度柱状图显示 n!
lblN: 总数 n
:::

## 从 n 个里挑 k 个并按顺序排好，有多少种？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 排列 nPr
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 从 n 个里取 k 个排队
:::

<b>这一步回答：只排其中 k 个时怎么数？</b>只填 k 个位置：第一个位置 n 种，第二个 n−1 种，……第 k 个 n−k+1 种，相乘得 nPr = n!/(n−k)!。方块里的数字就是每个位置可选的个数。右边的横条是 k 取不同值时 nPr 的对数大小，橙色是当前 k。 {#s2e .explain}

::: html step2-2
s2cv: k 个位置各自的选择数方块与它们的乘积
lblK: 取出个数 k
:::

## 只关心挑出哪几个、不管顺序，要除掉什么？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 组合 nCr
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 顺序不算数
:::

<b>这一步回答：组合比排列少了什么？</b>挑出同一组 k 个人，排成队有 k! 种顺序，在 nPr 里被当成了不同的排法。所以一组只该算一次：nCr = nPr / k!。下面的网格每一行是一组（一种组合），行里有 k! 格，是这一组的所有顺序；格子总数是 nPr，行数是 nCr。 {#s3e .explain}

::: html step3-2
s3cv: 网格：每行是一种组合，行内每格是该组合的一种排列顺序
:::

## “从 49 个里选 6 个”，中奖概率是多少？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 大数与彩票
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 组合数有多大
:::

<b>这一步回答：组合数怎样决定“猜中”的难度？</b>在每一种组合等可能的前提下，猜中一种的概率是 1/nCr。点三个例子：49 选 6 的彩票约一千四百万分之一；一副牌 52 选 5 的手牌有两百六十万种；10 人中选 3 人的委员会只有 120 种。横条用对数刻度，每多一格是十倍。 {#s4e .explain}

::: html step4-2
s4cv: 几个组合数的对数刻度横条与所选例子
preLotto: 49 选 6 的彩票
prePoker: 52 张牌取 5 张
preCommittee: 10 人选 3 人委员会
:::

::: strings
bm1: 1
bm10: 10 选 3 = 120
bm52: 52 选 5 = 2,598,960
bm49: 49 选 6 = 13,983,816
bmEuro: 50 选 5 加 12 选 2 的大乐透 ≈ 1.4 亿
lblChosen: 当前：{n} 选 {k}
s4ro: {name}：C({n},{k}) = {c} 种；猜中一种的概率约 {p}。
axPeople: 人数 n
axPMatch: 至少两人同日的概率
s5ro: n = {n}：没有重复的概率 365Pn/365ⁿ = {no}%，至少两人同一天 = {yes}%；两两配对共 {pairs} 对。
:::

## 一个房间里要有多少人，才有半数以上的机会两人同一天生日？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 生日问题
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 用计数算概率
:::

<b>这一步回答：怎样用排列数求一个概率？</b>设一年 365 天，每天等可能。n 个人生日都不同的排法有 365Pn 种，总共 365ⁿ 种等可能的生日组合，所以“没有重复”的概率是 365Pn/365ⁿ，“至少两人同一天”是 1 减去它。拖动人数：23 人时就超过 50%，因为两两配对的数量增长得很快（n(n−1)/2）。 {#s5e .explain}

::: html step5-2
s5cv: 至少两人同一天生日的概率随人数上升的曲线
lblPeople: 人数 n
recapTitle: 回顾
recap1: 分步相乘：每步的选择数相乘；n 个全排是 n!；取 k 个排队是 nPr = n!/(n−k)!。
recap2: 顺序不算数就除以 k!：nCr = nPr/k!。
recap3: 等可能时，概率 = 符合的方法数 ÷ 总方法数；两两配对增长得很快，所以生日问题的答案出人意料地小。
modelTitle: 模型范围与局限
modelText: 模型：各个选择相互独立、每种结果等可能；生日问题假设一年 365 天、每天等可能、忽略闰年和双胞胎等。真实生日并不均匀，实际概率略高。
link0: → 数论与组合：用帕斯卡行读组合数
link1: → 概率与频率：等可能时的概率与重复试验
link2: → 贝叶斯：用计数理解条件概率
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
lblShirt: 上衣
lblPants: 裤子
lblShoes: 鞋
lblOutfits: 共 {n} 种
s0ro: {a} × {b} × {c} = {n} 种搭配（每一步的选择数相乘）。
axLogCount: n!（对数刻度）
s1ro: n = {n}：{steps} = {total} 种排法。
lblSlot: 第 {i} 位
lblEmpty: k = 0：只有 1 种（什么都不选）
lblOrdered: 共 {v} 种有序取法
axLogPerm: 横条：k 从 0 到 n 的 nPr（对数刻度）
s2ro: n = {n}，k = {k}：nPr = {f} = {v}；也等于 n!/(n−k)! = {e}。
lblGridR: {rows} 种组合（行）
lblGridC: 每组 {cols} 种顺序（列）
lblRowNote: 每一行颜色相同 = 同一组人
s3ro: n = {n}，k = {k}：nPr = {pn}，每组有 k! = {kf} 种顺序，所以 nCr = {formula} = {c}。
:::
