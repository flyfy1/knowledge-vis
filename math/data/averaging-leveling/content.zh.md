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
pageTitle: 平均数 · 移多补少
tagline: 高低不齐的水杯互相倒一倒，水位齐平的那个高度就是平均数。
:::

## 5 个杯子里的水，在杯子间倒来倒去，总量会变吗？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 倒水不丢水
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 倒水不丢水
:::

这一步要回答：把水从一个杯子倒进另一个，什么变了、什么没变？图上每个格子代表 1 份水。选“倒出的杯”和“倒入的杯”，按“倒 1 份”：两个杯子的水位变了，但所有杯子的水加起来（总量）保持不变。 {#s0e .explain}

::: html step0-2
s0cv: 5 个杯子里的水
from: 倒出的杯 #
to: 倒入的杯 #
pour1: 倒 1 份
reset0: 恢复原样
:::

::: strings
s0ro: 水位 {levels}；总量 = {total} 份（开始时 {total0} 份），已倒 {k} 次。
s0roBad: 这一步倒不了：{why}。
whyEmpty: 倒出的杯是空的
whySame: 倒出和倒入是同一个杯
whyFull: 倒入的杯已满
:::

## 怎样倒最少的次数，让 5 个杯子一样高？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 移多补少
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 移多补少
:::

这一步要回答：把高的杯子多出的水倒给低的杯子，要倒几份才齐平？按“倒 1 份（最高 → 最低）”，每次从最高杯倒 1 份给最低杯；也可以“一直倒到齐平”。**平均数**就是齐平后每个杯子里的水位。 {#s1e .explain}

::: html step1-2
s1cv: 把最高杯的水倒给最低杯，直到齐平
move: 倒 1 份（最高 → 最低）
auto: 一直倒到齐平
reset1: 重新开始
:::

::: strings
s1ro: 已倒 {k} 份；现在水位 {levels}，最高 {mx}、最低 {mn}。
s1roDone: 齐平了：每杯 {m} 份，共倒 {k} 份——正好等于一开始“高出平均的部分”之和 {ex}。
:::

## 不倒水，怎样直接算出齐平后的水位？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 总数÷杯数
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 总数 ÷ 杯数
:::

这一步要回答：齐平后每杯多少份？倒水不改变总量，齐平后每杯一样多，所以每杯 = 总量 ÷ 杯数。拖动“杯数”：上排是原来的水位，下排是同样总量平均分到这些杯子后的水位。 {#s2e .explain}

::: html step2-2
s2cv: 原来的水位与平均分之后的水位
cups: 参与的杯数 k
:::

::: strings
s2ro: 前 {k} 个杯子总量 {total} 份，平均每杯 {total} ÷ {k} = {m} 份。
:::

## 总量不能被杯数整除时，怎样才算“齐平”？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 除不尽
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 除不尽
:::

这一步要回答：如果水量不能平均分成整份，齐平后是什么样？5 个杯子共有 T 份水。选“只能倒整份”：最后有的杯子多 1 份，最多差 1；选“可以倒半份”（任意量）：能完全齐平，每杯正好是 T ÷ 5。拖动总量 T，对照两种结果。 {#s3e .explain}

::: html step3-2
s3cv: 整份与任意量两种齐平结果
whole: 只能倒整份
any: 可以倒任意量
tot: 水的总量 T（份）
:::

::: strings
s3ro: T = {T}：T ÷ 5 = {m}；整份时有 {n1} 个杯子是 {hi} 份、{n0} 个杯子是 {lo} 份。
s3roAny: T = {T}：每杯正好 {m} 份（任意量可以完全齐平）。
s3roEven: T = {T} 能被 5 整除：整份也能完全齐平，每杯 {m} 份。
:::

## 有一个杯子特别满，平均数会怎样？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 极端值
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 极端值
:::

这一步要回答：平均数一定在“中间”吗？拖动第 3 个杯子的水量，看平均线怎样被它拉高；数一数有几个杯子在平均线下面、几个在上面。平均数是总量 ÷ 杯数，一个很大的数会把它整体抬高，但不会让别的杯子多出水。 {#s4e .explain}

::: html step4-2
s4cv: 一个特别满的杯子与平均线
big: 第 3 个杯子的水量
:::

::: strings
s4ro: 水位 {levels}，平均 {m}；比平均少的有 {lo} 个杯子，比平均多的有 {hi} 个。
:::

## 自己设四个杯子，看平均数 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：任意四个杯子的平均水位是多少、要倒几份？拖动四个滑杆，页面算出平均线，以及把高出平均线的水倒给不足的杯子要倒的总量（可以不是整数）。 {#s5e .explain}

::: html step5-2
s5cv: 你设的四个杯子
a: 杯 A
b: 杯 B
c: 杯 C
d: 杯 D
recapTitle: 回顾
recap1: 倒水不改变总量：总量不变，水位变。
recap2: 平均数 = 总量 ÷ 个数，也是移多补少后每个都一样的数。
recap3: 平均数不一定是某个杯子的水位，也容易被极端值拉动。
modelTitle: 模型范围与局限
modelText: 把平均数看成“倒水齐平”要求水能在杯间自由倒、没有损耗，且每份可以分割；整数份时平均数可能无法精确达到。平均数只概括总量，不显示每个杯子的差别。
linkBar: → 去条形图页：在柱状图上看“高出”与“不足”怎样互相抵消
linkPd: → 去分布与期望页：平均数的另一种读法，重心
linkEq: → 去方程天平页：两边同做一件事保持平衡
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: 平均 = {total} ÷ 4 = {m}；高出平均的部分共 {ex} 份，要倒给低于平均的杯子。
docTitle: 平均数 · 移多补少
:::
