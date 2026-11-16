---
lang: zh
---

::: strings
languageLabel: 语言切换
back: ← 知识索引
navLabel: 步骤导航
catBadge: 化学
stageBadge: 初中
foot: pH 标度 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页
docTitle: pH 标度 · 从电池酸到肥皂水的一条刻度
pageTitle: pH 标度
tagline: 酸得多厉害、碱得多厉害，用一条 0 到 14 的刻度就能说清——pH 每差 1，酸碱的「劲」差 10 倍。
:::

## 怎么用一个数说明一杯水有多酸或多碱？ {#step0 h2=s0t}

::: strings
nav0: 0 一条刻度
:::

第 0 步 · 一条刻度 {#s0k .step-kicker i18n=text}

这一步要回答：为什么可以用一条 0–14 的数轴比较电池酸、柠檬汁和肥皂水？**pH** 是衡量溶液酸碱程度的数：pH 小于 7 是**酸性**，等于 7 是**中性**（纯水），大于 7 是**碱性**。彩条上的颜色是万能指示剂在该 pH 的颜色。选一种常见液体，或直接拖滑杆，看标记落在哪里。 {#s0e .explain}

::: html step0-1
s0stage: 横轴：pH 0–14，颜色是万能指示剂的颜色；橙色标记是当前位置，圆点是其他常见物质的典型 pH
s0canvas: pH 彩色刻度条：标记随所选物质移动，小于 7 酸、大于 7 碱
s0item: 常见液体
s0ph: 直接拖 pH
:::

结论：pH 越小越酸，越大越碱，7 为中性。条件：物质的 pH 是典型近似值（因浓度、配方而异）；数轴在 25 ℃ 的水溶液里成立。 {#s0result .readout i18n=text}

::: strings
s0ro: {name}：pH ≈ {ph}，{kind}；氢离子浓度 [H⁺] ≈ {h} mol/L。
s0custom: 自定义溶液
:::

## pH 3 和 pH 6 的酸，到底差多少倍？ {#step1 h2=s1t}

::: strings
nav1: 1 差 1 是 10 倍
:::

第 1 步 · 差 1 是 10 倍 {#s1k .step-kicker i18n=text}

这一步要回答：pH 差 3，酸的「劲」是差 3 倍吗？不是。pH = −log₁₀[H⁺]，**[H⁺]** 指每升溶液里氢离子的物质的量（mol/L，数越大越酸）。pH 每降 1，[H⁺] 变成 10 倍，所以 pH 相差 Δ，[H⁺] 相差 10^Δ 倍。拖两个滑杆，看左边柱子（pH 刻度）差多少格，右边就差多少个「10 倍」。 {#s1e .explain}

::: html step1-1
s1stage: 左：两个溶液的 pH 柱（越长越酸，长度 = 14 − pH）；右：同样两个溶液的 [H⁺] 倍数
s1canvas: A、B 两个溶液的 pH 对比：pH 差几格，氢离子浓度就差 10 的几次方倍
s1a: 溶液 A 的 pH
s1b: 溶液 B 的 pH
:::

结论：pH 是对数刻度，差 1 个单位 = 10 倍，差 3 个单位 = 1000 倍。条件：25 ℃ 水溶液；浓度很大或很小时 pH 公式只是近似。 {#s1result .readout i18n=text}

::: strings
s1ro: A：pH {a}，[H⁺] = {ha} mol/L；B：pH {b}，[H⁺] = {hb} mol/L。pH 差 {d}，[H⁺] 相差 {ratio} 倍（{who}）。
s1whoA: A 更酸
s1whoB: B 更酸
s1whoEq: 一样酸
:::

## 怎么用颜色判断一杯溶液的 pH 范围？ {#step2 h2=s2t}

::: strings
nav2: 2 指示剂变色
:::

第 2 步 · 指示剂变色 {#s2k .step-kicker i18n=text}

这一步要回答：滴几滴指示剂，颜色怎么告诉我们酸碱？**指示剂**是遇酸碱会变色的物质，每种只在自己的 pH 范围里变色：石蕊在 pH 4.5–8.3 之间由红变蓝，酚酞在 8.2–10 之间由无色变粉红，甲基橙在 3.1–4.4 之间由红变黄，万能指示剂则连续变色。选指示剂、拖样品的 pH，按「滴入并记录」，把每次的颜色累积在下面的色卡里。 {#s2e .explain}

::: html step2-1
s2stage: 上：烧杯里滴入指示剂后的颜色；中：该指示剂在 0–14 的整条颜色带；下：你记录过的样品色卡
s2canvas: 指示剂在不同 pH 下的颜色：烧杯、整条颜色带和记录的色卡
s2ind: 指示剂
s2ph: 样品的 pH
s2rec: 滴入并记录
s2clear: 清空色卡
:::

结论：指示剂只能告诉你 pH 落在哪一段，不能给出精确值；要选变色范围覆盖你关心 pH 的那一种。条件：颜色是简化的示意色，真实颜色因浓度和光线而异。 {#s2result .readout i18n=text}

::: strings
s2ro: {ind}：pH {ph} 的样品呈 {desc}；已记录 {n} 个样品。
s2d0: 该指示剂变色范围之外的颜色（酸侧）
s2d1: 变色范围内的过渡色
s2d2: 该指示剂变色范围之外的颜色（碱侧）
:::

## 往盐酸里滴氢氧化钠，pH 怎么走？ {#step3 h2=s3t}

::: strings
nav3: 3 酸碱中和
:::

第 3 步 · 酸碱中和 {#s3k .step-kicker i18n=text}

这一步要回答：往 20 mL 0.1 mol/L 盐酸里加 0.1 mol/L 氢氧化钠，pH 怎样变化，在哪一点突然跳变？酸里的 H⁺ 与碱里的 OH⁻ 结合成水，叫**中和**。加的碱刚好抵消酸时是**化学计量点**（强酸强碱时 pH = 7）。拖滴入的体积，看曲线上的点和烧杯颜色。 {#s3e .explain}

::: html step3-1
s3stage: 曲线：横轴加入的碱（mL），纵轴 pH；橙点是当前位置；右边烧杯用万能指示剂着色
s3canvas: 滴定曲线：加碱时 pH 先缓慢上升，在 20 mL 附近陡然跳到 7 以上
s3v: 加入的氢氧化钠
s3reset: 重新滴
:::

结论：中和点附近 pH 变化极陡，差一两滴就从酸性翻到碱性。条件：强酸强碱、体积可加、25 ℃；弱酸弱碱的曲线形状不同。 {#s3result .readout i18n=text}

::: strings
s3ro: 加入 {v} mL 碱：{state}；pH = {ph}。
s3before: 还剩 {x} mmol 酸没被中和
s3eq: 刚好中和（化学计量点），溶液只剩盐和水
s3after: 碱过量 {x} mmol
:::

## 不断加水稀释酸，pH 会越过 7 变成碱吗？ {#step4 h2=s4t}

::: strings
nav4: 4 稀释能变碱吗
:::

第 4 步 · 稀释能变碱吗 {#s4k .step-kicker i18n=text}

这一步要回答：把 pH 2 的酸不断稀释，pH 会一路升高到 7 以上吗？**稀释**是加水让浓度变小。酸越稀 [H⁺] 越小，pH 靠近 7，但水自己也电离出约 10⁻⁷ mol/L 的 H⁺，所以酸怎么稀也不会变成碱。拖稀释倍数（10 的几次方），看 pH 曲线贴近 7。 {#s4e .explain}

::: html step4-1
s4stage: 曲线：横轴稀释倍数的指数 e（稀释 10^e 倍），纵轴 pH；虚线是 pH = 7；右边烧杯用万能指示剂着色
s4canvas: 稀释曲线：pH 随稀释上升，趋近 7 但不越过
s4reset: 回到没稀释
:::

结论：稀释酸只会让 pH 无限趋近 7，不会越过。条件：起始 pH 2 的强酸，[H⁺] = 10⁻² / 10^e + 10⁻⁷；该近似忽略了活度与温度变化。 {#s4result .readout i18n=text}

::: strings
s4e2: 稀释倍数的指数 e
s4ro: 稀释 10^{e} 倍：[H⁺] ≈ {h} mol/L，pH = {ph}，{kind}。
:::

## 把 pH 说给别人听 {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 收束
:::

::: html step5-1
s5k: 第 5 步 · 收束
s5e: pH 把酸碱程度排成一条 0–14 的刻度：7 中性，越小越酸，越大越碱，每差 1 是 10 倍。
f1t: 刻度
f1b: pH = −log₁₀[H⁺]；小于 7 酸，等于 7 中性，大于 7 碱（第 0–1 步）。
f2t: 读法
f2b: 指示剂只告诉 pH 的范围；中和点附近 pH 极陡（第 2–3 步）。
f3t: 极限
f3b: 稀释酸只会无限趋近 7，不会变成碱（第 4 步）。
modelT: 模型实话
model1: 常见物质的 pH 是典型近似值，实际随浓度和品牌变化。
model2: 指示剂颜色是示意色；变色范围取常见教材数值。
model3: 本页只处理强酸强碱和 25 ℃ 的水溶液；弱酸、缓冲和温度对水电离的影响见其他页。
nextT: 继续看（站内）
l1: 指数与对数 · 第 2 步：对数为什么把「10 倍」变成「差 1」
l2: 缓冲溶液 · 第 2 步：加酸或加碱时 pH 怎样被稳住
l3: 酸碱平衡 · 第 0 步：弱酸里分子在两边来回走
:::

::: strings
it0: 电池酸
it1: 柠檬汁
it2: 食醋
it3: 黑咖啡
it4: 纯水
it5: 小苏打溶液
it6: 肥皂水
it7: 家用氨水
it8: 漂白水
ind0: 万能指示剂
ind1: 石蕊
ind2: 酚酞
ind3: 甲基橙
kindAcid: 酸性
kindNeutral: 中性
kindBase: 碱性
unitMol: mol/L
unitMl: mL
s1len: 长度刻度
s1lin: 线性比较
lblChart: 你记录的样品色卡
:::
