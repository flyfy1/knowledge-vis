---
lang: zh
---

::: strings
docTitle: 密度 · 同样大小，谁「密」
languageLabel: 语言切换
back: ← 知识索引
catBadge: 物理与电路
stageBadge: 初中
pageTitle: 密度
tagline: 同样大的铁块和木块，天平一称就分出高下——「每立方厘米里装了多少质量」就是密度。
navLabel: 步骤导航
foot: 密度 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页
unitG: g
unitCm3: cm³
unitDens: g/cm³
matCork: 软木
matWood: 松木
matIce: 冰
matWater: 水
matAl: 铝
matFe: 铁
matAu: 金
matSalt: 盐水
matOil: 植物油
:::

## 体积一样的两块，哪边装的质量多？ {#step0 h2=s0t}

::: strings
nav0: 0 称一称
:::

第 0 步 · 称一称 {#s0k .step-kicker i18n=text}

这一步要回答：两块**体积相同**的材料放上天平，哪一边更重，重多少倍？**质量**指物体里含有多少物质，用天平称，单位克（g）；**体积**指它占多大空间，单位立方厘米（cm³）。改两边的材料或共同的体积，看横梁怎么倾斜。 {#s0e .explain}

::: html step0-1
s0stage: 天平：左右托盘里的方块体积相同，横梁倾斜角由两边质量之差决定
s0canvas: 天平示意图：左右两个体积相同的方块，横梁向质量大的一边倾斜
s0left: 左盘材料
s0right: 右盘材料
s0vol: 共同体积 V
:::

结论：体积相同时，质量不同，说明「每立方厘米里装的物质」不同。这个数叫密度。条件：材料均匀、实心。 {#s0result .readout i18n=text}

::: strings
s0ro: 左：{ml} g　右：{mr} g　{verdict}
s0heavL: 左边重，是右边的 {r} 倍。
s0heavR: 右边重，是左边的 {r} 倍。
s0eq: 两边一样重（同种材料或密度相同）。
:::

## 同一种材料，块越大，密度也越大吗？ {#step1 h2=s1t}

::: strings
nav1: 1 越大越密？
:::

第 1 步 · 越大越密？ {#s1k .step-kicker i18n=text}

这一步要回答：同一种材料切大切小，质量与体积的比值会变吗？选材料，拖体积，按「记录这个点」把 (V, m) 画成点，点越多越能看出排成什么线。质量读数带约 ±2% 的模拟称量误差。 {#s1e .explain}

::: html step1-1
s1stage: 横轴：体积 V（cm³）；纵轴：质量 m（g）；每个点是一次称量
s1canvas: 质量对体积的散点图：记录的点沿过原点的直线排列
s1mat: 材料
s1vol: 体积 V
s1rec: 记录这个点 (V, m)
s1clear: 清空所有点
:::

结论：m 与 V 成正比，比值（斜率）不随块的大小变，只由材料决定——这就是密度。条件：均匀材料；称量有误差，所以用多个点平均。 {#s1result .readout i18n=text}

::: strings
s1now: 现在：V = {v} cm³，称得 m = {m} g，m/V = {r} g/cm³
s1fit: 已记录 {n} 个点，拟合斜率 = {k} g/cm³（理论值 {rho} g/cm³）
s1none: 还没有记录点；按「记录这个点」开始。
:::

## 密度 ρ = m/V 里，m 和 V 怎么算、单位是什么？ {#step2 h2=s2t}

::: strings
nav2: 2 每格装多少
:::

第 2 步 · 每格装多少 {#s2k .step-kicker i18n=text}

这一步要回答：把 **密度**写成公式 ρ = m ÷ V，一块材料的质量怎么由体积算出来？每个方格是 1 cm³ 的小格，格里每个小点代表 0.25 g 质量（只是记账，不是真原子）；密度越大，每格点越多。选材料，拖块的格数。 {#s2e .explain}

::: html step2-1
s2stage: 每个方格 = 1 cm³；每个点 = 0.25 g 的物质（示意记账）
s2canvas: 方格阵列：每格点数代表密度，格数代表体积
s2mat: 材料
s2cells: 体积 V（格数，每格 1 cm³）
:::

换算：1 g/cm³ = 1000 kg/m³。每格点数（取整后）只为画图，读数用精确密度。 {#s2note .model-note i18n=text}

结论：同一材料每格点数相同（ρ 不变），格数翻倍质量翻倍。公式 m = ρ·V 与 ρ = m/V 是同一件事。 {#s2result .readout i18n=text}

::: strings
s2ro: ρ = {rho} g/cm³ = {rhoSi} kg/m³；V = {v} cm³ → m = ρ·V = {m} g；画图用 {dots} 个点（每点 0.25 g，取整）
:::

## 把物体放进液体，凭什么判断它浮还是沉？ {#step3 h2=s3t}

::: strings
nav3: 3 浮还是沉
:::

第 3 步 · 浮还是沉 {#s3k .step-kicker i18n=text}

这一步要回答：物体放进液体后，浮或沉由什么决定？比较物体的密度 ρ物 与液体的密度 ρ液：ρ物 小于 ρ液 就浮，大于就沉。选液体，拖物体密度，按「松手」看它停在哪。浮着时浸入液面下的比例 = ρ物 ÷ ρ液（原理见浮力页）。 {#s3e .explain}

::: html step3-1
s3stage: 水槽：灰色方块是物体；虚线是液面
s3canvas: 水槽示意图：物体在液体里浮起或沉底，浸入深度随密度比变化
s3liq: 液体
s3obj: 物体密度 ρ物
s3drop: 松手，看它停在哪
s3lift: 拿起来重放
:::

结论：看密度比。条件：实心均匀物体、静止液体；空心物体（如轮船）要用整体平均密度。 {#s3result .readout i18n=text}

::: strings
s3ro: ρ物 = {ro} g/cm³，ρ液 = {rl} g/cm³ → {verdict}
s3float: 浮在液面，约 {p}% 浸入液体。
s3sink: 下沉到底（ρ物 > ρ液）。
s3neutral: 刚好悬浮（ρ物 = ρ液）。
s3ready: 物体还在液面上方；按「松手」。
:::

## 形状不规则的小物体，体积怎么量？ {#step4 h2=s4t}

::: strings
nav4: 4 测石头
:::

第 4 步 · 测石头 {#s4k .step-kicker i18n=text}

这一步要回答：不规则物体没法用尺量体积，怎么办？把它浸入量筒的水里，**液面升高的体积**就是它的体积（排水法）。选一个物体（质量已用天平称好），按「放入水中」，读出升高的体积，再算 ρ = m ÷ V。 {#s4e .explain}

::: html step4-1
s4stage: 量筒：水面刻度单位 mL（1 mL = 1 cm³）
s4canvas: 量筒示意图：放入物体后水面上升，升高的体积等于物体体积
s4obj: 物体
s4go: 放入水中
s4out: 取出
:::

结论：排水法把形状问题变成读刻度。条件：物体沉入水中且不吸水、不溶于水；量筒刻度有读数误差。 {#s4result .readout i18n=text}

::: strings
s4o0: 小块 A（m = 13.5 g）
s4o1: 小块 B（m = 39.5 g）
s4o2: 小块 C（m = 96.5 g）
s4ro0: 物体质量 {m} g；放入前水面 {v0} mL。按「放入水中」读升高量。
s4ro1: 水面 {v0} mL → {v1} mL，升高 {dv} mL = 物体体积；ρ = {m} ÷ {dv} = {rho} g/cm³，最接近 {name}。
:::

## 把「密度」说给别人听 {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 收束
:::

::: html step5-1
s5k: 第 5 步 · 收束
s5e: 密度是物质的一种特性：每单位体积里有多少质量。
f1t: 定义
f1b: ρ = m ÷ V，单位 g/cm³ 或 kg/m³；1 g/cm³ = 1000 kg/m³。
f2t: 特性
f2b: 同种均匀材料，m 与 V 成正比，比值不随块的大小变（第 1 步）。
f3t: 用途
f3b: 比密度判浮沉（第 3 步）；排水法测体积，再求 ρ 认材料（第 4 步）。
modelT: 模型实话
model1: 表中密度取常温常压（约 20 ℃、1 atm）的典型值；温度变了，同一材料的密度会略变，水在 4 ℃ 最密，冰比水轻。
model2: 本页天平、量筒都是理想示意，质量读数带模拟的 ±2% 误差；真实材料有杂质、气孔，密度会偏离表值。
model3: 方格里的点只是记账（每点 0.25 g），不是原子；原子质量与排列疏密共同决定真实材料的密度。
nextT: 继续看（站内）
l1: 粒子与物态 · 第 0 步：固体里的粒子排得多紧，为什么密度大
l2: 粒子与物态 · 第 2 步：熔化时队形散开，体积与密度怎么变
l3: 质量守恒 · 第 0 步：质量是怎么称、怎么守恒的
:::
