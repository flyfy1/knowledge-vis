---
lang: zh
---

::: strings
back: ← 知识索引
category: 物理与电路
stage: 高中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 黑体辐射 · 热的物体为什么发光
tagline: 温度越高，颜色从红变白再变蓝；经典理论在紫外一端失败，普朗克的“能量一份一份”把它救了回来。
docTitle: 黑体辐射 · 热的物体为什么发光
:::

## 烧红的铁为什么随温度升高变橙、变白？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 颜色与温度
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 颜色与温度
:::

<b>这一步回答：发光颜色由什么决定？</b>任何有温度的物体都在发出连续的电磁波。温度越高，最强的那一段波长越短：峰值波长 λ<sub>max</sub> = b/T（b ≈ 2.898×10⁻³ m·K）。拖动温度，看光球的颜色、亮度和下方光谱条上的白线（峰位）一起移动。颜色是常用近似公式的显示色，不是精确测色。 {#s0e .explain}

::: html step0-2
s0cv: 发光球随温度变色，下方对数波长轴上标出峰值波长与可见光区
lblT: 温度 T（K）
:::

## 每个波长各发出多少能量？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 光谱曲线
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 普朗克光谱
:::

<b>这一步回答：温度怎样改变整条光谱曲线？</b>普朗克公式给出每个波长的辐出度 M(λ) = 2πhc²/λ⁵ · 1/(e^{hc/(λkT)} − 1)。拖动温度：曲线整体升高，峰向短波移动，彩色带是可见光。灰线是 3000 K 与 6000 K 的参照。红色和蓝色两端都不会突然截止——光谱是连续的。 {#s1e .explain}

::: html step1-2
s1cv: 不同温度下普朗克光谱曲线，彩色带为可见光
:::

## 人体、灯丝、太阳各在哪个波段最亮？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 维恩位移
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 维恩位移
:::

<b>这一步回答：峰值波长与温度是什么关系？</b>λ<sub>max</sub>·T = b 是常数，所以温度翻倍，峰值波长减半（双对数图上是一条斜线）。人体约 310 K，峰在红外约 9.3 µm；钨丝约 2800 K，峰仍在红外；太阳表面约 5772 K，峰在可见光中部。读数同时给出公式值和在普朗克曲线上逐点找到的最大值，二者相符。 {#s2e .explain}

::: html step2-2
s2cv: 峰值波长随温度变化的双对数曲线，标出人体、灯丝、太阳
pBody: 人体 310 K
pBulb: 灯丝 2800 K
pSun: 太阳 5772 K
pStar: 蓝白星 9940 K
:::

::: strings
lblPeak: 峰 {p} nm
lblVis: 可见光
reg_uv: 紫外
reg_vis: 可见光
reg_ir: 红外
s0ro: T = {T} K：峰值波长 λmax = b/T ≈ {p} nm（{reg}）；显示色约 RGB({c})。
axLam: 波长 λ（nm）
axLogM: 纵轴：对数刻度
axM: 每 nm 辐出度 M
axT: 温度 T（K）
s1ro: T = {T} K：峰在 {pk} nm，峰值 M = {m} W/m²/nm；总功率 σT⁴ = {tot} W/m²，其中可见光约占 {vis}%。
objBody: 人体
objBulb: 灯丝
objSun: 太阳
s2ro: T = {T} K：公式 b/T = {f} nm；在普朗克曲线上找到的最大值在 {n} nm（{reg}）；λmax·T = {prod} mm·K。
lblHalf: T 翻倍 → 功率 ×{r}
s3ro: T = {T} K：σT⁴ = {p} W/m²；对普朗克曲线数值积分 {num} W/m²（偏差 {err}%）；温度减半功率差 {r} 倍；相对 300 K 为 {rs} 倍。
lblRJ: 瑞利—金斯（经典）
lblPlanck: 普朗克
s4ro: T = {T} K，λ = {lam} nm：普朗克 {pm} W/m²/nm，经典 {rj} W/m²/nm，经典÷普朗克 = {r}；hc/(kT) ≈ {hk} nm。
lblClassic: 经典 1/x
lblQuantum: 量子 1/(eˣ−1)
axX: x = hc/(λkT)
vSuppress: 一份能量大于热能，被压低
vClassical: 一份能量小于热能，经典近似可用
s5ro: T = {T} K，λ = {lam} nm：x = {x}；量子平均份数 {q}，经典 {c}，量子÷经典 = {r}；{v}。
:::

## 温度翻倍，总辐射功率变成几倍？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 T⁴ 定律
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 斯特藩—玻尔兹曼
:::

<b>这一步回答：总辐射功率怎样随温度增长？</b>把整条光谱曲线下的面积加起来，每平方米辐射功率 P = σT⁴（σ ≈ 5.670×10⁻⁸ W·m⁻²·K⁻⁴）。温度翻倍，功率变成 2⁴ = 16 倍。读数里的“数值积分”是把上一步的普朗克曲线逐段相加得到的，与 σT⁴ 对照，误差应接近 0。 {#s3e .explain}

::: html step3-2
s3cv: 总辐射功率随温度的四次方增长曲线，标出所选温度
:::

## 经典理论预言的光谱，为什么在短波处失控？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 紫外灾难
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 紫外灾难
:::

<b>这一步回答：经典公式错在哪里？</b>经典的瑞利—金斯公式 M = 2πckT/λ⁴ 在长波处与实测符合，但波长越短越大，趋于无穷：总能量发散，这就是“紫外灾难”。红线是经典预言，橙线是普朗克。纵轴是对数刻度。拖动探针波长，读数给出两者比值：当 λ 远大于 hc/(kT) 时比值趋近 1，波长越短比值越大（读数同时给出 hc/(kT) 这个长度）。 {#s4e .explain}

::: html step4-2
s4cv: 对数纵轴上，瑞利—金斯曲线（红）在短波发散，普朗克曲线（橙）收敛
lblLam: 探针波长 λ（对数滑杆）
:::

## “能量一份一份”怎样压住了紫外端？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 能量一份份
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 能量量子
:::

<b>这一步回答：量子假设为什么能避免发散？</b>普朗克假设：频率 ν 的光，能量只能以 hν = hc/λ 的整份出现。令 x = hc/(λkT)，即一份能量与热能 kT 之比。x 小时（长波）一份很小，经典均分 1/x 成立；x 大时（短波）一份比热能还大，很难被激发，平均份数 1/(e^x − 1) 被指数压下去。红线是经典，橙线是量子，竖线是你选的 λ 与 T。 {#s5e .explain}

::: html step5-2
s5cv: 平均激发份数随 x 的经典曲线（红）与量子曲线（橙）
recapTitle: 回顾
recap1: 温度越高，峰值波长越短（λmax·T = b），光谱整体抬高，总功率按 T⁴ 增长。
recap2: 经典的瑞利—金斯公式在短波处发散（紫外灾难）。
recap3: 普朗克的能量份 hν 在 hν ≫ kT 时被指数压低，使光谱收敛——这是量子概念的起点。
modelTitle: 模型范围与局限
modelText: 模型：理想黑体，只看发出的热辐射。真实物体的发射率小于 1 且随波长变化，太阳也不是严格的黑体；颜色是常用近似公式的显示色；数值积分用对数网格，包含 10 nm 到 5 mm 的波长。
link0: → 光电效应：光也是一份份的能量
link1: → 量子基础：概率幅与测量
link2: → 气体压强的微观图景：温度就是平均动能
:::

本页完成。 {#done .readout .success i18n=text}
