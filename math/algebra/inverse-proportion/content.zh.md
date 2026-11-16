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
pageTitle: 反比例函数 · 此消彼长
tagline: 长方形面积不变，长越长宽越矮；乘积不变的两个量，图像是一条永远碰不到坐标轴的双曲线。
:::

## 长方形面积固定为 12，长变长，宽怎么变？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 面积不变
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 面积不变
:::

这一步要回答：两个量乘积固定时，一个变大另一个怎样变？长方形的**面积** = 长 × 宽，这里固定为 12。拖动长，宽由 12 ÷ 长 算出：长变长时宽变矮，面积始终是 12 个方格。 {#s0e .explain}

::: html step0-2
s0cv: 面积固定的长方形：长变化，宽跟着变
len0: 长 L
:::

::: strings
s0ro: 长 {L}，宽 = 12 ÷ {L} = {W}；面积 {L} × {W} = {A}，始终是 12。
:::

## 长扩大到原来的 m 倍，宽会怎样？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 此消彼长
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 此消彼长
:::

这一步要回答：一个量扩大几倍，另一个量怎样变？起点：长 2、宽 6，面积 12。拖动倍数 m，把长乘以 m：因为面积不变，宽就要除以 m。橙色条是长，青色条是宽，两条一个变长一个变短，乘积一直是 12。 {#s1e .explain}

::: html step1-2
s1cv: 长乘以 m，宽就除以 m
mm: 长扩大的倍数 m
:::

::: strings
s1ro: 长 2 × {m} = {L}，宽 6 ÷ {m} = {W}，乘积 {L} × {W} = {A}。
:::

## 把所有 (x, y) 画出来，是什么形状？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 双曲线
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 双曲线
:::

这一步要回答：乘积不变的关系，图像长什么样？反比例函数是 y = k ÷ x（k 是不为 0 的常数，这里取正数）。图中橙色点的 x、y 是长方形的长和宽，阴影长方形的面积是 k。拖动 x：点沿曲线移动，阴影的形状变化但面积不变；曲线越靠近坐标轴越贴近但永远碰不到。 {#s2e .explain}

::: html step2-2
s2cv: y = k/x 的曲线与阴影长方形（面积 k）
kk: 常数 k（乘积）
xx: x 的值
:::

::: strings
s2ro: k = {k}，x = {x}：y = {k} ÷ {x} = {y}；阴影面积 x × y = {A}。
s2roOff: （y 超出图上范围 10，点在图外）
:::

## 反比例和正比例，怎样一眼分开？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 对比正比例
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 对比正比例
:::

这一步要回答：怎样判断两个量是正比例还是反比例？正比例 y = 2x 里，y ÷ x 永远是 2（**比值**不变）；反比例 y = 12 ÷ x 里，x × y 永远是 12（**乘积**不变）。下面四组柱子，在 x = 1 到 6 上分别算比值和乘积：哪一组是平的，就是那种关系。 {#s3e .explain}

::: html step3-2
s3cv: 正比例与反比例：比值与乘积
tx: 选一个 x
:::

::: strings
s3ro: x = {x}：正比例 y = {yd}，比值 {rd}，乘积 {pd}；反比例 y = {yi}，比值 {ri}，乘积 {pi}。
dirRatio: 正比例：y ÷ x
dirProd: 正比例：x × y
invRatio: 反比例：y ÷ x
invProd: 反比例：x × y
:::

## 路程固定时速度和时间，是反比例吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 现实里的反比例
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 现实里的反比例
:::

这一步要回答：哪些现实量是反比例？只要“总量不变”，两个量的乘积就是总量：路程固定 120 公里，速度 × 时间 = 120；工程总量 60 人·天，人数 × 天数 = 60。选一个情景拖动，看曲线上的点。 {#s4e .explain}

::: html step4-2
s4cv: 现实情景的反比例曲线
scTrip: 路程 120 公里
scWork: 工程量 60 人·天
val4: 数值
:::

这只在总量固定时成立：真实路上会堵车、人多了还要协调，实际并不完全反比。 {#s4note .note i18n=text}

::: strings
s4roTrip: 速度 {v} 公里/小时，需要 {t} 小时；速度 × 时间 = {p}（公里）。
s4roWork: {v} 个人干，需要 {t} 天；人数 × 天数 = {p}（人·天）。
:::

## 已知一个点，求另一个点 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：知道 y 与 x 成反比，还知道一个点，怎样求别的点？先用已知点算 k = x × y，再用 y = k ÷ x。每题已知一个点 (x₀, y₀)，求 x = x₁ 时的 y。 {#s5e .explain}

::: html step5-2
s5cv: 过已知点的反比例曲线
ans: 你的答案 y
check: 检查
nextQ: 换一题
recapTitle: 回顾
recap1: 乘积不变：一个变大几倍，另一个就缩小几倍。
recap2: 图像是 y = k ÷ x 的双曲线，不与坐标轴相交。
recap3: 判别：x × y 为常数是反比例，y ÷ x 为常数是正比例。
modelTitle: 模型范围与局限
modelText: 这里取 k > 0、x > 0 的一支曲线；k < 0 时曲线在另外两个象限。现实中的反比例只在总量固定时才近似成立，并不是所有“此消彼长”都严格是反比例。
linkArea: → 去乘法是面积页：面积 = 长 × 宽，从方格数起
linkLin: → 去一次函数页：另一种变化方式，每步增加一样多
linkPar: → 去二次函数与抛物线页：第三种常见的函数图像
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5roAsk: 已知 ({x0}, {y0})，求 x = {x1} 时的 y。先算 k = {x0} × {y0}。
s5roOk: 正确：k = {k}，y = {k} ÷ {x1} = {y1}。
s5roNo: 不对：k = {x0} × {y0} = {k}，所以 y = {k} ÷ {x1} = {y1}。你填的是 {g}。
docTitle: 反比例函数 · 此消彼长
:::
