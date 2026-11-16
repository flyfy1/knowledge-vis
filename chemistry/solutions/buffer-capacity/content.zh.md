---
lang: zh
---

::: strings
docTitle: 缓冲溶液 · 抵抗酸碱扰动
back: ← 知识索引
pageTitle: 缓冲溶液 · 抵抗酸碱扰动
tagline: 弱酸和共轭碱一起工作：先中和外来酸碱，再让 pH 小幅改变。
navLabel: 步骤导航
foot: 缓冲溶液 · 抵抗酸碱扰动
acid: 酸
base: 碱
:::

## 先看谁接住了外来的 H⁺ / OH⁻ {#step0 h2=s0t}

::: strings
nav0: 0 看见抵抗
:::

第 0 步 · 动态缓冲 {#s0k .step-kicker i18n=text}

缓冲液含有 **HA ⇌ H⁺ + A⁻**。加入少量酸时，A⁻ 先接住 H⁺ 变回 HA；加入少量碱时，HA 先把 H⁺ 给出去。按钮每次加入 0.01 mol/L，观察 pH 与两种形态的变化。 {#s0e .explain}

::: html step0-1
canvasLabel: 缓冲溶液粒子和 pH 可视化
addAcid: 加入酸 H⁺
addBase: 加入碱 OH⁻
reset: 重置本步
:::

::: strings
s0ro: pH {pH} · HA {ha}% · A⁻ {a}% · 已中和酸 {acid} · 已中和碱 {base}
s0acid: 酸被 A⁻ 接住；pH 只移动了一点。
s0base: 碱被 HA 接住；pH 只移动了一点。
:::

## pH 看的是比值，不是“酸有多强” {#step1 h2=s1t}

::: strings
nav1: 1 比值决定 pH
:::

第 1 步 · Henderson–Hasselbalch {#s1k .step-kicker i18n=text}

在固定温度下，**pH = pKa + log([A⁻]/[HA])**。pKa 是酸的身份；比值决定当前 pH。拖动两个旋钮，观察同一个 pKa 下只改比值会怎样。 {#s1e .explain}

::: html step1-1
pKaLab: pKa
ratioLab: [A⁻]/[HA] 比值
:::

::: strings
s1ro: pH {pH} · pKa {pka} · A⁻/HA = {ratio} · HA {ha}% / A⁻ {a}%
s1feedback: 误解反馈：稀释会同时改变 HA 和 A⁻，若比值不变，pH 近似不变；它主要改变的是可抵抗多少外来酸碱。
:::

## 缓冲区是“平”，不是“永远不变” {#step2 h2=s2t}

::: strings
nav2: 2 加酸或碱
:::

第 2 步 · 滴定曲线 {#s2k .step-kicker i18n=text}

沿横轴加入强酸或强碱，比较相同初始 pH 的缓冲液与纯水。曲线由每个当量的中和与平衡计算得到：缓冲液会延迟 pH 的剧烈变化，但加得太多仍会耗尽。 {#s2e .explain}

::: html step2-1
curveLabel: 缓冲液与纯水的滴定曲线
acidLab: 累计外加酸（mol/L）
baseLab: 累计外加碱（mol/L）
:::

::: strings
s2ro: 外加净当量 {net} · 缓冲液 pH {buffer} · 纯水近似 pH {water}
s2feedback: 误解反馈：缓冲液不是把 pH 锁死；当 HA 或 A⁻ 快耗尽，曲线会离开缓冲区并变陡。
:::

## 同样的比值，浓度越高越能“扛” {#step3 h2=s3t}

::: strings
nav3: 3 容量不是浓度
:::

第 3 步 · 缓冲容量 {#s3k .step-kicker i18n=text}

把总浓度 C 从稀到浓。两杯的 pKa 和初始比值相同，因此初始 pH 相同；浓的那杯有更多 HA / A⁻ 储备，面对同一扰动，pH 改变更小。 {#s3e .explain}

::: html step3-1
capacityLabel: 缓冲容量对比
concLab: 总缓冲浓度 C（mol/L）
:::

::: strings
s3ro: C = {c} mol/L · 加入 {dose} mol/L 酸后 pH {pH} · 初始 pH {initial} · ΔpH {delta}
s3feedback: 误解反馈：缓冲容量不是 pH 数字；它是抵抗外来酸碱、让 pH 少移动的“库存”。
:::

## 把三件事分开，缓冲就不神秘 {#step4 h2=s4t}

::: strings
nav4: 4 收束
:::

第 4 步 · 收束 {#s4k .step-kicker i18n=text}

**比值**决定当前 pH；**pKa**描述酸的身份；**总浓度**决定能中和多少外来酸碱。缓冲区通常围绕 pH ≈ pKa，且 HA 与 A⁻ 都要有可观的库存。 {#s4e .explain}

::: html step4-1
modelTitle: 模型假设
modelBody: 本页用理想浓度、固定温度与 Henderson–Hasselbalch 近似建立直觉；忽略活度、水的自解离和体积变化。真实滴定中应使用完整平衡和体积修正。
linkAcid: → 回到酸碱平衡：看 Ka、稀释与共同离子
linkEq: → 去化学平衡：看扰动后的新平衡
:::
