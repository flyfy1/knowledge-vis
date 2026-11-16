---
lang: zh
---

::: strings
back: ← 知识索引
category: 地球与太空
stage: 大学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 引力透镜 · 宇宙里的凸透镜
tagline: 大质量天体弯曲时空，路过的光跟着偏折：遥远光源被放大、分成两个像，甚至拉成一个光环。
docTitle: 引力透镜 · 宇宙里的凸透镜
:::

## 光擦着太阳边缘飞过，会偏折多少？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 光的偏折
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 光线怎么弯
:::

<b>这一步回答：质量怎样让光偏折、偏折多大？</b>广义相对论给出偏折角 α = 4GM/(c²b)，b 是光线离质量中心的最近距离。对太阳（M = 1 M☉）擦边（b = R☉）α ≈ 1.75 角秒，是只按牛顿引力估算的两倍。偏折角和质量成正比、和距离成反比。下图为了看得见，把角度夸大了；读数才是真实的角秒数。 {#s0e .explain}

::: html step0-2
s0cv: 光线从质量旁路过并被偏折（角度夸大）
lblLogM: 质量（M☉，对数）
lblImpact: 最近距离 b（R☉）
:::

## 背景光源在透镜后面稍微偏一点，我们会看到什么？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 两个像
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 透镜方程与两个像
:::

<b>这一步回答：为什么会看到两个像？</b>用爱因斯坦半径 θ<sub>E</sub> 作单位，光源位置 β 与像位置 θ 满足 β = θ − 1/θ，解得两个像 θ<sub>±</sub> = (β ± √(β² + 4))/2：一个在光源同侧、更远，一个在另一侧、更靠近透镜。光源正好在连线上（β = 0）时两个像连成一个圆环——爱因斯坦环。拖动 β。 {#s1e .explain}

::: html step1-2
s1cv: 天空平面图：透镜在中心，绿点为光源，橙点为两个像，虚线圆为爱因斯坦环
lblBeta: 光源偏离 β（θE）
:::

## 环有多大，能不能看见？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 环有多大
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 爱因斯坦半径
:::

<b>这一步回答：爱因斯坦环的角半径由什么决定？</b>θ<sub>E</sub> = √(4GM/c² · D<sub>ls</sub>/(D<sub>l</sub>D<sub>s</sub>))，随质量的平方根增大，也与透镜、光源的相对距离有关。银河系里一颗恒星当透镜，θ<sub>E</sub> 约毫角秒，现有望远镜分不开两个像（只能看到变亮）；星系或星系团当透镜，θ<sub>E</sub> 是角秒级，像能被分开，拉成环和弧。选情景，拖动质量和透镜位置。 {#s2e .explain}

::: html step2-2
s2cv: 爱因斯坦角半径在角尺度（对数刻度）上的位置，与望远镜分辨能力对照
sStar: 银河系里一颗恒星
sGalaxy: 一个大星系
sCluster: 一个星系团
lblDlFrac: 透镜位置 D_l/D_s（%）
:::

::: strings
lblMass: 质量 M
lblExag: 偏折角被夸大，仅示意
s0ro: M = {M} M☉，b = {b} R☉：偏折角 α = 4GM/(c²b) = {a}″；只按牛顿引力估算的一半是 {n}″。
lblSource: 光源
lblImgP: 像 +
lblImgM: 像 −
lblRing: 爱因斯坦环 θE
s1roRing: β ≈ 0：光源正在连线上，两个像连成完整的爱因斯坦环（半径 1 θE）。
s1ro: β = {b}：像 θ₊ = {p}，θ₋ = {m}（θE 为单位）；放大倍率 μ₊ = {mp}，μ₋ = {mm}，合计 {tot}。
lblMas: 1 毫角秒
lblAsec: 1 角秒
lblHst: 空间望远镜分辨率 ≈ 0.05″
lblSeeing: 地面视宁度
lblEin: θE = {v}
axAng: 角尺度（对数刻度，从 1 微角秒到 300 角秒）
vResolved: 像可以被分开
vUnresolved: 像分不开，只能看到变亮
s2ro: {sc}：M = {M}，D_l = {Dl}，D_s = {Ds}：θE = {th}；{res}。
axTimeE: 时间（tE）
axAmp: 总放大倍率 A
s3ro: u₀ = {u0}：峰值放大 A = {peak}；此刻 t = {t} tE：u = {u}，A = {A}。
lblSourceExt: 光源
kRingLike: 接近环
kArc: 拉长的弧
kTwo: 两个分开的像
s4ro: β = {b}，光源半径 ρ = {r}：{kind}。
lblObs: 观察者
lblLensG: 透镜星系
lblSrc: 背景光源
lblDlDs: D_l = {dl} Mpc，D_s = {ds} Mpc
lblInferred: 环内总质量 ≈ {m}
s5ro: θE = {th}″，D_l = {Dl} Mpc，D_s = {Ds} Mpc：M = c²θE²D_lD_s/(4G·D_ls) ≈ {m}。
:::

## 一颗恒星从另一颗恒星前面经过，亮度会怎么变？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 微引力透镜
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 微引力透镜光变曲线
:::

<b>这一步回答：看不见两个像时，怎么发现透镜？</b>两个像合起来的总放大倍率 A(u) = (u² + 2)/(u√(u² + 4))，u 是光源离透镜的距离（以 θ<sub>E</sub> 为单位）。光源相对透镜移动 u(t) = √(u₀² + (t/t<sub>E</sub>)²)，亮度先升后降，峰值约 1/u₀（u₀ 小时）。最近距离越小，峰越高。拖动 u₀ 和时间。 {#s3e .explain}

::: html step3-2
s3cv: 上：光源路径与两个像；下：总放大倍率随时间的光变曲线
lblU0: 最近距离 u₀
lblT: 时间 t（tE）
:::

## 有大小的星系被透镜成像，为什么会被拉成弧？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 弧与环
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 弧与环
:::

<b>这一步回答：真实的星系是面光源，像是什么形状？</b>把绿色虚线圆里的每个点都按透镜方程映射成两个像，就得到橙色的两个像：外侧一个被拉长成弧，内侧一个小而暗。光源越靠近中心连线（β 小），弧越长，β → 0 时连成完整的环；光源越大，弧越粗。拖动光源位置和大小。 {#s4e .explain}

::: html step4-2
s4cv: 绿色虚线圆（光源）与橙色的两个像（弧或环）
lblRho: 光源半径 ρ（θE）
:::

## 量出环的大小，能算出透镜的质量吗？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 称星系
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 用透镜称质量
:::

<b>这一步回答：怎样把偏折变成质量？</b>把爱因斯坦半径公式反过来：M = c²/(4G) · θ<sub>E</sub>² · D<sub>l</sub>D<sub>s</sub>/D<sub>ls</sub>。量出环的角半径，再知道两段距离，就能算出环内的总质量，不管它发光还是不发光——引力透镜“称”的是全部物质。拖动环半径、透镜距离和光源距离倍数。 {#s5e .explain}

::: html step5-2
s5cv: 观察者、透镜星系和背景光源的示意图，光线被偏折
lblTheta: 环的角半径 θE（″）
lblDl: 透镜距离 D_l（Mpc）
lblFac: 光源距离 / 透镜距离
recapTitle: 回顾
recap1: 光在质量旁偏折 α = 4GM/(c²b)；透镜方程 β = θ − 1/θ 给出两个像，光源在连线上时成环。
recap2: θE 随质量平方根增大：恒星是毫角秒（只看到变亮，微引力透镜），星系和星系团是角秒（可见弧与环）。
recap3: 反过来，量出环的大小就能称出透镜的总质量，不论发光与否。
modelTitle: 模型范围与局限
modelText: 模型：点质量透镜、弱场、小角度、薄透镜，距离按欧氏几何相减（对宇宙学距离是近似，实际要用角直径距离）。真实星系透镜是延展的质量分布，会产生更多的像和椭圆形的环；这里的数值用于说明量级与机制。
link0: → 凸透镜成像：普通透镜怎样成像、成环
link1: → 宇宙膨胀：距离与红移的关系
link2: → 反射与折射：光在介质界面为什么拐弯
:::

本页完成。 {#done .readout .success i18n=text}
