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
pageTitle: 浮与沉 · 排开的水托住了谁
tagline: 同一块橡皮泥，捏成球会沉、捏成船会浮：决定浮沉的，是它排开了多少水。
:::

## 同样大小（40 立方厘米）的东西，哪些浮、哪些沉？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 谁会浮
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 谁会浮
:::

这一步要回答：浮和沉由什么比较决定？每种东西体积都是 40 cm³，水的密度是 1 克/立方厘米（**密度**：每立方厘米多少克）。物体放进水里，水给它向上的**浮力**，大小等于它排开的水的重量；它自己的重量向下。选一种东西，看两个箭头谁长。 {#s0e .explain}

::: html step0-2
s0cv: 水槽里的物体，重力（向下）与浮力（向上）
obj: 选择物体
oCork: 软木
oWood: 木块
oIce: 冰块
oClay: 橡皮泥
oIron: 铁块
:::

::: strings
s0ro: {name}：密度 {rho} 克/厘米³，重 {w} gf（克力）；{state}，排开 {v} 厘米³ 水，浮力 {b} gf。
floats: 它浮着（密度比水小）
sinks: 它沉底（密度比水大）
:::

## 把木块按进水里，浮力怎样随深度变化？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 排开的水
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 排开的水
:::

这一步要回答：浮力和排开的水有什么关系？木块（体积 40 cm³、密度 0.6）被你一点点按进水里：浸入的体积越大，排开的水越多，水面上升，浮力 = 排开水的重量（1 cm³ 水重 1 gf）。图右侧曲线横轴是浸入比例，纵轴是浮力，横线是木块自身重量 24 gf，两线相交处就是自己浮着的位置。 {#s1e .explain}

::: html step1-2
s1cv: 左：按入木块时的水面；右：浮力随浸入比例
sub: 浸入比例（0 = 刚碰到水，1 = 全部在水下）
:::

::: strings
s1ro: 浸入 {pct}%：排开 {v} cm³ 水，浮力 = {b} gf；木块重 {w} gf，{cmp}。
cmpUp: 浮力更大，木块会被托起
cmpDown: 浮力更小，松手会下沉
cmpEq: 浮力等于重力，正好平衡：这就是它自己浮着的位置
:::

## 同一块橡皮泥，为什么捏成船就能浮？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 球变成船
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 球变成船
:::

这一步要回答：为什么形状能改变浮沉？橡皮泥重 50 g，本身体积约 31 cm³（密度 1.6）。**船的外形体积**是船壳外轮廓包围的体积，包括里面的空气。拖动滑杆把它捏得更“空”：外形体积越大，能排开的水越多，浮力上限 = 外形体积 × 1 gf/cm³；达到 50 g 就能托住自己。 {#s2e .explain}

::: html step2-2
s2cv: 同一块橡皮泥：外形体积变大，排开的水
env: 船的外形体积（cm³）
:::

::: strings
s2ro: 外形体积 {env} cm³：全部沉下去最多排开 {env} cm³，浮力上限 {bmax} gf，橡皮泥重 {w} gf：{res}；实际排开 {v} cm³ 水。
s2roSink: 沉底
s2roFloat: 浮起，只需浸入 {frac}%
:::

## 船上最多还能装多少货才会沉？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 装货
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 装货
:::

这一步要回答：浮着的船，载重上限怎么算？外形体积 100 cm³ 的船（自重 50 g），每颗弹珠 5 g。每加一颗，总重增加，船下沉一点；总重等于浮力上限（100 gf）时，水线到达船沿，再多就沉。按“加一颗”观察水线怎样一格一格升高。 {#s3e .explain}

::: html step3-2
s3cv: 船与弹珠，水线逐渐升高
add: 加一颗弹珠
rem: 拿走一颗
reset3: 清空货物
:::

::: strings
s3ro: {n} 颗弹珠，总重 {mass} gf；浮力上限 {cap} gf，{res}。
s3roOk: 水线在船高的 {pct}%，还能再装 {left} 颗
s3roFull: 刚好满载，再加一颗就沉
s3roSunk: 超载，船沉了
:::

## 同一只鸡蛋，为什么在盐水里能浮？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 盐水
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 盐水
:::

这一步要回答：水的密度变了，浮沉怎么变？鸡蛋密度 1.08 克/厘米³，比清水（1.00）大，所以沉；往水里加盐，水的密度变大。拖动水的密度，看鸡蛋在哪个密度开始上浮；浮着时，浸入比例 = 鸡蛋密度 ÷ 水的密度。 {#s4e .explain}

::: html step4-2
s4cv: 鸡蛋在不同密度的水里
rw: 水的密度（克/厘米³）
:::

::: strings
s4ro: 水的密度 {rw}：鸡蛋密度 1.08，{res}。
s4roSink: 比水大，鸡蛋沉底
s4roFloat: 比水小，鸡蛋浮起，浸入 {frac}%
:::

## 设计一只能浮的船 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：给定自重，船至少要多大才能浮？选自重和外形体积。能浮的条件是：外形体积 ≥ 自重 ÷ 水的密度（1 克/厘米³）。 {#s5e .explain}

::: html step5-2
s5cv: 你设计的船
m5: 船的自重（克）
v5: 船的外形体积（cm³）
recapTitle: 回顾
recap1: 浮力 = 排开的水的重量；物体自身重量向下。
recap2: 密度比水小的东西浮；密度比水大的东西做成空心，让平均密度小于水，也能浮。
recap3: 水的密度变大（加盐），同一个物体更容易浮。
modelTitle: 模型范围与局限
modelText: 这里的水是不可压缩的理想流体，密度固定为 1 克/厘米³（第 4 步除外）；忽略水的波动、表面张力和物体的转动稳定性。gf（克力）是“一克质量受到的重力”，与国际单位牛顿相差约 9.8 倍的系数，本页只比较大小。
linkLev: → 去杠杆与滑轮页：力和力的平衡
linkEq: → 去方程天平页：两边相等才平衡
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: 自重 {m} g，至少需要外形体积 {need} cm³ 才能浮；你的是 {env} cm³：{res}。
s5roYes: 能浮
s5roNo: 会沉，还差 {gap} cm³
docTitle: 浮与沉 · 排开的水托住了谁
:::
