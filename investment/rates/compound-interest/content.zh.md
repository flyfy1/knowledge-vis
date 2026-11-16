---
lang: zh
---

::: strings
back: ← 知识索引
category: 数学基础
stage: 高中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 复利与贴现 · 时间是钱的形状
tagline: 利息也生利息，钱就按倍数生长；反过来，未来的钱折成今天的价值，就是贴现。
docTitle: 复利与贴现 · 时间是钱的形状
:::

## 利息只算本金，和连利息一起算，差多少？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 单利与复利
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 单利与复利
:::

<b>这一步回答：复利比单利多出的部分有多大？</b>本金 1000，年利率 r。单利每年只加 1000·r，是直线：A = P(1 + r·t)。复利把利息并入本金再生利息：A = P(1 + r)ᵗ，是上翘的曲线。开头几年两条线几乎重合，时间越长差距越大。拖动利率和年数。 {#s0e .explain}

::: html step0-2
s0cv: 单利直线与复利曲线随年数的变化
lblRate: 年利率 r（%）
lblYears: 年数 t
:::

## 一年算一次、一天算一次、不停地算，结果会无限增大吗？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 计息频率
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 计息频率
:::

<b>这一步回答：把计息拆得越细，结果有没有上限？</b>每年计 m 次，每次利率 r/m：A = P(1 + r/m)^{m·t}。m 越大，A 越大，但增速越来越小，趋近一个上限 P·e^{r·t}（连续复利）。年、半年、季、月、日的差别很小，日与连续几乎一样。点按钮选频率，看柱高与读数。 {#s1e .explain}

::: html step1-2
s1cv: 不同计息频率下终值的柱状图，向连续复利上限靠拢
freq0: 每年
freq1: 每半年
freq2: 每季
freq3: 每月
freq4: 每日
freq5: 连续
:::

::: strings
lblBarBase: 柱高从 {v} 起算
s1ro: {m}计息，r = {r}%，{t} 年：终值 {v}，比按年计息多 {gain}；连续复利上限 {limit}。
lblExact: 精确 ln2/ln(1+r)
lblRule: 72 ÷ r
axRate: 年利率
axDouble: 翻倍所需年数
s2ro: r = {r}%：精确翻倍 {e} 年，72 法则 {a} 年（偏差 {err}%）；1000 经 {e} 年复利后是 {g}。
s3ro: {t} 年后的 {fv}，r = {r}% 时现值 {pv}；把 {pv} 再复利 {t} 年 = {back}。
lblDeposits: 累计存入
lblInterest: 利息
s4ro: 每年末存 {C}，r = {r}%，{n} 年：总额 {fv}，其中存入 {dep}，利息 {int}（占 {share}%）。
lblHalfTime: 过半期限时仍剩 {b}%
s5ro: 借 {P}，年利率 {r}%，{y} 年：月供 {pay}，共还 {tot}，其中利息 {int}；到期限一半时剩余本金仍有 {half}%。
:::

## 本金翻倍要多久，能不能心算？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 七十二法则
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 翻倍与七十二法则
:::

<b>这一步回答：翻倍时间怎样估？</b>精确翻倍时间 t = ln2 / ln(1 + r)。口诀：用 72 除以利率的百分数，得到近似年数，如 6% → 12 年。利率在 4%–12% 附近很准，利率很高或很低时偏差变大。橙线是精确值，青线是 72/r，竖线是你选的利率。 {#s2e .explain}

::: html step2-2
s2cv: 精确翻倍时间与 72/r 近似随利率变化的两条曲线
:::

## 二十年后的一万元，今天值多少？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 贴现
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 贴现 · 未来的钱值多少
:::

<b>这一步回答：怎样把未来的钱折成今天的价值？</b>把复利倒过来：现值 PV = FV / (1 + r)ᵗ。利率越高、年数越长，今天的价值越小。读数里的“再复利回去”一行把现值按同样利率放 t 年，正好回到终值——说明两个方向是同一个公式。 {#s3e .explain}

::: html step3-2
s3cv: 一万元终值的现值随等待年数下降的曲线
:::

## 每年存同样的钱，利息在总数里占多大份额？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 定期存入
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 定期存入
:::

<b>这一步回答：长期定投，钱主要来自本金还是利息？</b>每年末存 C，n 年后总额 FV = C·((1 + r)ⁿ − 1)/r。柱子的青色是累计存入，橙色是利息。开头几年利息很少，越往后橙色越高：雪球效应。拖动存入额、利率、年数。 {#s4e .explain}

::: html step4-2
s4cv: 逐年累积的柱子：青色为累计存入，橙色为利息
lblDeposit: 每年存入 C
:::

## 同样的利息规则，借钱时为什么前期几乎还不动本金？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 贷款
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 贷款是反方向的复利
:::

<b>这一步回答：等额还款的贷款里，本金下降得有多慢？</b>月利率 i = r/12，每月还款 M = P·i/(1 − (1 + i)^{−n})。每月利息按剩余本金算，所以前期还款大部分是利息，剩余本金曲线先平后陡。青点标出还款一半时间时的剩余本金比例。时间在储蓄上帮你，在贷款上帮对方。 {#s5e .explain}

::: html step5-2
s5cv: 等额还款贷款的剩余本金随时间下降，先平后陡
lblLoan: 贷款额（千）
lblTerm: 期限（年）
recapTitle: 回顾
recap1: 复利：A = P(1 + r)ᵗ，利息也生利息；单利是直线，复利是上翘的曲线。
recap2: 计息再细也有上限 P·e^{rt}；翻倍时间约 72/r 年；贴现是复利的倒过来：PV = FV/(1 + r)ᵗ。
recap3: 定期存入的雪球靠时间滚大；贷款则是同一规则反向，前期多数在还利息。
modelTitle: 模型范围与局限
modelText: 模型：固定年利率、每期计息规则不变；没有通胀、税、手续费、利率变化与违约风险。数字仅用于理解复利机制，不是投资、贷款或税务建议。
link0: → 指数与对数：复利就是指数增长，翻倍时间用对数求
link1: → 种群增长：同一个“每期乘一个倍数”
link2: → 分布与期望：平均值是加权的平衡点
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
lblSimple: 单利
lblCompound: 复利
axYears: 年
s0ro: 本金 1000，r = {r}%，{t} 年：单利 {a}，复利 {b}，差 {d}（复利是单利的 {x} 倍）。
:::
