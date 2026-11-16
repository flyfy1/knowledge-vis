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
pageTitle: 鸡兔同笼 · 先假设，差额会说话
tagline: 知道头数和脚数，先假设“全是鸡”，多出来的脚恰好暴露了兔子有几只。
:::

## 笼里有 35 个头、94 只脚，兔子有几只？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 头和脚
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 头和脚
:::

这一步要回答：怎样试出兔子的只数？笼里共有 35 只动物（每只 1 个头），鸡 2 只脚、兔 4 只脚。拖动滑杆改变兔子的只数 r，其余都是鸡：图上逐只画出腿，脚的总数由逐只腿数出来，看它在哪里等于 94。 {#s0e .explain}

::: html step0-2
s0cv: 35 只动物，鸡 2 腿、兔 4 腿
rab: 兔子只数 r
:::

::: strings
s0ro: 兔 {r} 只、鸡 {c} 只：脚共 {f}（目标 94），{cmp}。
cmpEq: 正好等于目标
cmpLess: 比目标少 {d} 只
cmpMore: 比目标多 {d} 只
:::

## 先假设全是鸡，要换几只成兔子？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 假设全是鸡
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 假设全是鸡
:::

这一步要回答：怎样不乱试、一步步逼近？先假设 35 只全是鸡，脚共 2 × 35 = 70。每把一只鸡换成兔子，脚多 4 − 2 = 2 只。按“换一只”看脚数一级一级往上爬，爬到目标 94 就停；也可按“一直换到够”。 {#s1e .explain}

::: html step1-2
s1cv: 每换一只，脚数上升两只
swap: 换一只
auto: 一直换到够
reset1: 重来（全是鸡）
:::

::: strings
s1ro: 已换 {k} 只：脚 {f}；还差 {gap} 只脚，每换一只加 2，还需换 {need} 只。
s1roDone: 已换 {k} 只，脚 {f} 正好是 94：兔 {k} 只，鸡 {c} 只。
:::

## 头数和脚数换成别的数，怎样直接算？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 任意头脚数
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 任意头脚数
:::

这一步要回答：能不能一步算出兔子数？设头 H、脚 F：全是鸡时脚是 2H，多出 F − 2H，每只兔子多 2，所以兔 = (F − 2H) ÷ 2，鸡 = H − 兔。图上的斜线是“兔子数 r 对应的脚数”，横线是你选的脚数 F，交点横坐标就是兔数 r。 {#s2e .explain}

::: html step2-2
s2cv: 脚数随兔子只数上升，与目标脚数相交
H: 头数 H
F: 脚数 F
:::

::: strings
s2ro: H = {H}，F = {F}：兔 = ({F} − 2 × {H}) ÷ 2 = {r}，鸡 = {c}；核对 2 × {c} + 4 × {r} = {chk}。
bad1: 脚数 {F} 是奇数：鸡、兔的脚都是偶数，凑不出奇数。
bad2: 脚数 {F} 少于全是鸡的 {min}：至少也要 {min} 只脚。
bad3: 脚数 {F} 多于全是兔的 {max}：最多只有 {max} 只脚。
:::

## 从“全是兔”开始假设，会得到同一个答案吗？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 反过来假设
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 反过来假设
:::

这一步要回答：换一个起点假设，结论一样吗？选“全是兔”，脚数从 4H 起，每把一只兔换成鸡脚少 2；选“全是鸡”，从 2H 起往上。拖动滑杆改变“换了几只”，两个方向都在脚数轴上走向同一个目标 F（用第 2 步的 H、F）。 {#s3e .explain}

::: html step3-2
s3cv: 脚数轴上从两端走向目标
hypC: 假设全是鸡（脚从少往上）
hypR: 假设全是兔（脚从多往下）
swaps: 换了几只
:::

::: strings
s3ro: {hyp}：起点 {start}，每换一只 {dir}，目标 {F}；需要换 {need} 只。现在换了 {k} 只，脚 {f}。
dirUp: 加 2
dirDown: 减 2
startC: 全是鸡
startR: 全是兔
s3roBad: 第 2 步当前的头脚数无解，请先回到第 2 步选一组有解的 H、F。
s3roDone: 走到目标了：脚 {f}，换了 {k} 只；两种假设得到的兔数都是 {r}。
:::

## 自行车和三轮车、大船和小船，也是同一个套路吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 换个故事
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 换个故事
:::

这一步要回答：什么样的题能用这套办法？只要“两种东西，每个带的数量不同，知道总个数和总数量”就行。选一个故事，拖动总个数与总量：先假设全是第一种，算出差额，再除以两种的差。 {#s4e .explain}

::: html step4-2
s4cv: 两种东西的总量随换成第二种而上升
scen: 选择故事
sc0: 鸡与兔（脚）
sc1: 自行车与三轮车（轮子）
sc2: 小船与大船（座位）
cnt: 总个数
tot: 总量
:::

::: strings
sc0a: 鸡
sc0b: 兔
sc0u: 脚
sc1a: 自行车
sc1b: 三轮车
sc1u: 轮子
sc2a: 小船
sc2b: 大船
sc2u: 座位
s4ro: 共 {H} 个，{u}共 {F}：假设全是{na}，{u}应有 {allA}，多出 {sur}；每把一个{na}换成{nb}，{u}多 {per}，所以{nb} = {sur} ÷ {per} = {r} 个，{na} {c} 个。
s4roBad: 这组数没有整数解：{na}每个 {a}、{nb}每个 {b}，{u}总量在 {lo} 到 {hi} 之间，并且要能被凑出来。
:::

## 自己出题，再用假设法解回去 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：能不能出一道题并验证解法？拖动鸡和兔的只数，页面算出头数和脚数（这就是一道题），再用“假设全是鸡”的办法解回去，看解出的兔数是否等于你设的。 {#s5e .explain}

::: html step5-2
s5cv: 你设的鸡与兔
cc: 鸡的只数
rr: 兔的只数
recapTitle: 回顾
recap1: 假设全是一种，差额 ÷ 每换一个多出（或少）的量 = 另一种的个数。
recap2: 答案要代回去核对：2 × 鸡 + 4 × 兔 应当等于脚数。
recap3: 从“全是鸡”或“全是兔”出发都能得到同一个答案。
modelTitle: 模型范围与局限
modelText: 这里假设每只鸡正好 2 脚、每只兔正好 4 脚，且个体数是整数；真实动物不一定如此。“假设全是一种”只是在算差额的办法，不是说笼里真有那种情况。
linkEq: → 去方程天平页：把同样的算法写成方程
linkLin: → 去一次函数页：两条线的交点就是答案
linkPat: → 去找规律页：每次增加相同的量，总数怎样变化
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: 题目：{H} 个头、{F} 只脚。假设全是鸡 → {allA} 只脚，多出 {sur}，÷ 2 = {r} 只兔；与你设的 {r0} 只{ok}。
same: 一致
docTitle: 鸡兔同笼 · 先假设，差额会说话
:::
