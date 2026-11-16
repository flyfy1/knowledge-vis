---
lang: zh
---

::: strings
back: ← 知识索引
category: 数学基础
stage: 初中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 不等式 · 天平倾斜，答案是一整段
tagline: 天平不平的时候，答案不是一个数而是一段范围：在数轴上涂阴影，乘负数时要把不等号翻过来。
:::

## 左边放 x 加 2，右边放 5，天平会往哪边倾？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 天平倾斜
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 天平倾斜
:::

这一步要回答：天平不平时，能说明什么？左盘有一盒 x 千克的东西和 2 千克砝码，右盘是 5 千克。拖动 x：左边更重，天平向左倾（**x + 2 &gt; 5**）；左边更轻，向右倾（x + 2 &lt; 5）；一样重才平衡。不等号表示的是“谁比谁大”。 {#s0e .explain}

::: html step0-2
s0cv: 天平：左盘 x + 2，右盘 5
xw: 盒子的重量 x（千克）
:::

::: strings
s0ro: x = {x}：左盘 {l} 千克，右盘 5 千克，{res}。
lHeavy: 左边重，x + 2 > 5
lLight: 左边轻，x + 2 < 5
lEq: 一样重，x + 2 = 5
:::

## 哪些 x 能让 x + 2 < 5 成立？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 解集是一段
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 解集是一段
:::

这一步要回答：满足不等式的 x 有哪些？**解集**是所有让不等式成立的数。拖动 x，按“试这个 x”：绿点代表成立，红点代表不成立。试得多了，绿点和红点在数轴上分成两段，分界点是 3。按“显示解集”看涂色：x < 3（3 处是空心圆，因为 3 本身不满足 < ）。 {#s1e .explain}

::: html step1-2
s1cv: 数轴上试过的点与解集
xt: 要试的 x
tryX: 试这个 x
showSol: 显示/隐藏解集
clearX: 清除试点
:::

::: strings
s1ro: 已试 {n} 个点，其中 {g} 个成立（绿）、{r} 个不成立（红）；刚试的 x = {x}：{x} + 2 = {l}，{res}。
s1roNone: 还没有试点。拖动 x，按“试这个 x”。
holdsYes: {l} < 5 成立
holdsNo: {l} < 5 不成立
:::

## 不等式两边同时加（减）一个数，大小关系变吗？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 同加同减
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 同加同减
:::

这一步要回答：两边做同样的加减，不等号会变吗？起点 2 < 5。拖动要加的数 c：数轴上两个数一起平移，距离不变，所以 2 + c 仍然小于 5 + c。解 x + 2 < 5，就是两边同时减去 2，得 x < 3。 {#s2e .explain}

::: html step2-2
s2cv: 两个数同时平移 c，先后次序不变
cc: 两边同时加的数 c
:::

::: strings
s2ro: 2 + {c} = {a}，5 + {c} = {b}：{a} {op} {b}，距离仍是 {d}。
:::

## 两边同时乘一个负数，不等号会怎样？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 乘负数翻口
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 乘负数翻口
:::

这一步要回答：两边乘同一个数，大小关系什么时候保持、什么时候颠倒？起点 2 < 5。拖动乘数 m：乘正数，两点按比例拉伸，先后次序不变；乘负数，它们移到原点的另一侧，大的变成更靠左，**次序颠倒，不等号要翻过来**；乘 0，两个都变成 0。 {#s3e .explain}

::: html step3-2
s3cv: 2 和 5 乘以 m 之后的位置
mm: 乘数 m
:::

::: strings
s3ro: 2 × {m} = {a}，5 × {m} = {b}：{a} {op} {b}（原来 2 < 5）。{note}
nPos: 乘正数，不等号方向不变。
nNeg: 乘负数，不等号翻转。
nZero: 乘 0，两边都变成 0。
:::

## 怎样解 a·x + b < c 这类不等式？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 解不等式
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 解不等式
:::

这一步要回答：解不等式的步骤是什么？先两边同减 b，再两边同除以 a：**a 是负数时要翻转不等号**。拖动 a、b、c，切换 < 和 ≤：数轴上涂出解集，边界点 (c − b) ÷ a 的圆圈在 < 时是空心、≤ 时是实心。再拖“检验点”，看它在不在阴影里，是否与直接代入一致。 {#s4e .explain}

::: html step4-2
s4cv: 数轴上的解集和检验点
opLt: <（小于）
opLe: ≤（小于或等于）
aa: 系数 a
bb: 常数 b
c4: 右边 c
tp: 检验点 x
:::

::: strings
s4ro: {lhs} {op} {c}：解得 x {op2} {bd}；检验点 x = {x}：代入得 {v} {op} {c} {res}，{in}。
s4roZero: a = 0 时 x 消失了：不等式要么永远成立，要么永远不成立，请选 a ≠ 0。
yes: 成立
no: 不成立
inShade: 在阴影里
outShade: 不在阴影里
:::

## 有 M 元，每本 p 元，最多买几本？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：不等式怎样用在生活里？设买 n 本，要满足 p × n ≤ M，解得 n ≤ M ÷ p；但 n 必须是整数，所以取不超过 M ÷ p 的最大整数。拖动钱数和单价，看数轴上可行的整数点。 {#s5e .explain}

::: html step5-2
s5cv: 能买的本数（整数点）
mon: 钱数 M（元）
pr: 每本单价 p（元）
recapTitle: 回顾
recap1: 不等式的解是一段范围，数轴上涂阴影；< 用空心圆，≤ 用实心圆。
recap2: 两边加减同一个数，不等号不变；乘除正数不变；乘除负数要翻转。
recap3: 实际问题还要看变量能不能取小数（如本数必须是整数）。
modelTitle: 模型范围与局限
modelText: 这里只讲一元一次不等式 a·x + b < c（或 ≤）。边界点用 (c − b) ÷ a 精确计算；滑杆的步长使数值落在方便读数的格点上。不等式组、绝对值不等式不在本页范围。
linkEq: → 去方程天平页：两边同做一件事，保持平衡
linkNeg: → 去负数页：数轴上谁比谁大
linkLin: → 去一次函数页：y = kx + b 的图像，不等式的另一种看法
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: {p} × n ≤ {M}：n ≤ {q}，n 取整数，最多买 {n} 本，花 {cost} 元，剩 {left} 元。
docTitle: 不等式 · 天平倾斜，答案是一整段
:::
