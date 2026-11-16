---
lang: zh
---

::: strings
docTitle: 二分查找 · 每次砍掉一半
back: ← 知识索引
pageTitle: 二分查找 · 每次砍掉一半
tagline: 在有序数组里找一个数，不必逐个试。每次看中间值，根据一次比较把不可能的半边整段丢掉。
foot: 二分查找 · 把“排除一半”变成可复算的每一步
linearLab: 线性查找 O(n)
binaryLab: 二分查找 O(log₂ n)
targetFound: 找到目标
targetMiss: 目标不存在
dirL: 左
dirR: 右
dirEq: 命中
rangeNone: 空区间
startReady: 准备好了：目标是 {target}。点击“走一步”从中间开始。
stepMsg: 比较 a[{mid}] = {value}：{action}，下一个区间 [{lo}, {hi}]。
doneFound: 在第 {count} 次比较命中 {target}。
doneMiss: 区间被排空：{target} 不在数组里。共比较 {count} 次。
metricN: 候选数 n
metricLinear: 线性最坏
metricBinary: 二分最坏
stepsUnit: 次比较
pathEmpty: —
pathText: {path}
resultText: {result}
:::

## 先看中间：一次比较，砍掉半张表 {#step0 h2=s0t}

::: strings
nav0: 0 先看中间
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

数组已经排好序。点击**走一步**，只看一次中间值：目标更大就把左半边划掉，目标更小就把右半边划掉。灰掉的格子代表已经不可能。 {#s0e .explain}

::: html step0-1
targetLab: 目标值
stepOnce: 走一步
play: 连续播放
reset: 重置
rangeLab: 仍可能的范围
probeLab: 本次探测
cmpLab: 已比较
:::

注意因果顺序：**比较中间值 → 保留一半 → 下一次中间值改变**。算法快，不是因为猜得准，而是每次都能安全丢掉一半。 {#s0hint .hint}

::: strings
pause: 暂停
:::

## 左右指针把“还没排除的区间”圈出来 {#step1 h2=s1t}

::: strings
nav1: 1 每次砍半
:::

第 1 步 · 核心动作 {#s1k .step-kicker i18n=text}

把搜索写成三个数：**lo**、**mid**、**hi**。每一步只更新 lo 或 hi，循环不变量始终是“如果答案存在，它就在 [lo, hi] 里”。 {#s1e .explain}

::: html step1-1
presetLow: 目标偏小
presetHigh: 目标偏大
presetMiss: 不存在
traceLab: 轨迹
formulaNote: 每次循环只做一次相等/大小比较，再把区间缩短。
:::

把“排除”写进代码的边界更新里：<code>target &lt; a[mid]</code> 时令 <code>hi = mid − 1</code>，否则令 <code>lo = mid + 1</code>。边界比口诀更重要。 {#s1hint .hint}

## 只改目标，轨迹就从另一侧分叉 {#step2 h2=s2t}

::: strings
nav2: 2 改目标
:::

第 2 步 · 因果实验 {#s2k .step-kicker i18n=text}

同一副牌、同一个算法，换一个目标值。比较“每一步中间值”和“被排除的区间”，你会看到目标的位置如何决定分叉方向。 {#s2e .explain}

::: html step2-1
pathLab: 方向序列
resultLab: 结果
replay: 重放轨迹
:::

二分查找的“快”建立在前提上：数组必须有序。若数据还没排序，先排序的成本会改变总账，算法选择永远要连着输入条件一起看。 {#s2hint .hint}

## n 翻倍，二分只多问一个问题 {#step3 h2=s3t}

::: strings
nav3: 3 复杂度
:::

第 3 步 · 记账 {#s3k .step-kicker i18n=text}

用滑杆改变 n，实时比较线性查找最坏需要问多少次、二分最坏需要问多少次。柱高不是秒表，而是比较次数。 {#s3e .explain}

::: html step3-1
nLab: 数组长度 n
formulaNote3: 二分最坏比较次数 = ⌊log₂ n⌋ + 1（对本页的闭区间写法）。
:::

复杂度说的是规模增长：n=32 时差距还像几格柱子，n=1024 时已经是数量级差异。每次砍半，就是对数从哪里来的地方。 {#s3hint .hint}

## 把二分查找写成三个前提 {#step4 h2=s4t}

::: strings
nav4: 4 收束
:::

第 4 步 · 收束 {#s4k .step-kicker i18n=text}

记住三句话：数组**有序**；区间边界保持正确；每次比较后**排除一半**。满足它们，查找就从“逐个试”变成 O(log n)。 {#s4e .explain}

::: html step4-1
finalRule: 可迁移规则：
finalText: 先问输入有没有顺序，再看一次比较能排除多少候选；算法的复杂度来自你敢删掉的那部分。
:::
