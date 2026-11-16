---
lang: zh
---

::: strings
back: ← 知识索引
category: 物理与电路
stage: 初中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 机械能守恒 · 过山车的能量账本
tagline: 动能和重力势能此消彼长、总数不变；一旦有摩擦，少掉的机械能变成热，账本照样是平的。
docTitle: 机械能守恒 · 过山车的能量账本
:::

## 小球从高处落下的过程中，能量去了哪里？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 此消彼长
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 动能与势能此消彼长
:::

<b>这一步回答：下落时势能和动能怎样变化？</b>质量 1 kg 的小球从 h₀ 处自由下落。重力势能 E<sub>p</sub> = mgh（g = 9.8 m/s²），动能 E<sub>k</sub> = ½mv²。没有空气阻力时，E<sub>p</sub> 减少多少，E<sub>k</sub> 就增加多少，总和 E<sub>p</sub> + E<sub>k</sub> 始终等于一开始的 mgh₀。落到地面时速度 v = √(2gh₀)，与质量无关。拖动下落的进度和起始高度。 {#s0e .explain}

::: html step0-2
s0cv: 小球在不同高度的位置，以及势能、动能、总能量三根柱
lblDrop: 起始高度 h₀
lblProgress: 下落进度（0 = 起点，10 = 落地）
:::

## 光滑轨道上，小车能爬到比出发点更高的地方吗？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 过山车轨道
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 光滑轨道上的能量
:::

<b>这一步回答：机械能守恒对小车能去哪里有什么限制？</b>小车从高度 h₀ 无初速出发，没有摩擦时 E<sub>p</sub> + E<sub>k</sub> 不变，所以任何位置的速度由高度差决定：v = √(2g(h₀ − h))。高度超过 h₀ 的地方，动能会变成负数，小车根本到不了（红色区域）。拖动小车的位置和出发高度，看两根柱子此消彼长、虚线（总能量）不动。 {#s1e .explain}

::: html step1-2
s1cv: 过山车轨道、出发高度虚线、小车和两根能量柱，红色为到不了的区域
lblStartHeight: 出发高度 h₀
lblPos: 小车位置 x
:::

## 有摩擦时，机械能“丢”到哪里去了？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 摩擦
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 有摩擦的账本
:::

<b>这一步回答：摩擦怎样改变能量账本？</b>滑动摩擦力做功，把机械能变成内能（热）。小车来回滑动，每次爬到的最高点都越来越低，直到停在谷底。红色柱 Q 是累计产生的热，E<sub>p</sub> + E<sub>k</sub> + Q 始终等于出发时的总能量——能量没有消失，只是转移了。这里摩擦力 = μ × 正压力，拖动 μ 看小车多快停下。点“播放”。 {#s2e .explain}

::: html step2-2
s2cv: 小车在轨道上来回滑动的轨迹与势能、动能、热三根柱
lblMu: 摩擦系数 μ
play: 播放
reset: 重置
:::

::: strings
pause: 暂停
:::

## 要从多高滑下，小车才能安全翻过竖直圆环？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 竖直圆环
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 过竖直圆环
:::

<b>这一步回答：翻过圆环的最低高度怎么算？</b>在圆环最高点，小车需要足够的速度让轨道仍然压着它：重力提供的向心力 mg 不够时它会掉下来，条件是 v² ≥ gR。由能量守恒 mgh₀ = mg·2R + ½mv²，得 h₀ ≥ 2.5R。柱子是轨道对小车的支持力（单位 mg）：变成负值就是小车脱轨。拖动圆环半径、出发高度和小车所在的角度。 {#s3e .explain}

::: html step3-2
s3cv: 圆环、小车位置、出发高度线和最低出发高度线，以及支持力柱
lblRadius: 圆环半径 R
lblAngle: 小车在圆环上的角度（从底部起）
:::

## 压缩的弹簧能把小球弹多高？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 弹簧弹射
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 弹性势能
:::

<b>这一步回答：弹性势能怎样变成高度？</b>弹簧压缩 x 时储存弹性势能 E = ½kx²（k 是劲度系数）。松手后全部变成小球的动能 ½mv²，上升到最高点时又全部变成重力势能 mgh，所以 h = kx²/(2mg)，起飞速度 v = x√(k/m)。三根柱子的高度相同，就是能量守恒的账。拖动劲度、质量和压缩量。 {#s4e .explain}

::: html step4-2
s4cv: 被压缩的弹簧、小球及上升高度，以及弹性势能、动能、重力势能三根柱
lblK: 劲度系数 k
lblMass: 小球质量 m
lblCompress: 压缩量 x
:::

::: strings
lblCompressTag: 压缩 {x} m
:::

## 车速翻倍，刹车距离为什么变成四倍？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 刹车距离
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 刹车距离
:::

<b>这一步回答：能量账本在生活中的一个应用。</b>汽车刹车时，摩擦力 μmg 在距离 d 上做功，把动能 ½mv² 全部变成热：½mv² = μmg·d，得 d = v²/(2μg)。质量被约掉了，距离与速度的平方成正比：速度翻倍，距离变四倍。路面越滑（μ 越小）越长。选干燥、湿滑或结冰的路面，拖动车速，看白线沿曲线上升。 {#s5e .explain}

::: html step5-2
s5cv: 刹车距离随车速平方增长的曲线，三条细线为干、湿、冰路面，粗线为所选
lblCarSpeed: 车速
lblMuRoad: 摩擦系数 μ（×0.01）
roadDry: 干燥路面 μ=0.8
roadWet: 湿滑路面 μ=0.4
roadIce: 结冰路面 μ=0.1
recapTitle: 回顾
recap1: 无摩擦时，E<sub>p</sub> + E<sub>k</sub> 守恒：下降一段，动能就多一段；速度由高度差决定 v = √(2gΔh)。
recap2: 有摩擦时机械能减少，减少的部分变成热，E<sub>p</sub> + E<sub>k</sub> + Q 仍然守恒。
recap3: 同一本账可以算圆环的最低高度 2.5R、弹簧弹起的高度 kx²/(2mg)，以及刹车距离 v²/(2μg)。
modelTitle: 模型范围与局限
modelText: 模型：质点、质量 1 kg（除非另说明）、g = 9.8 m/s²，无空气阻力；摩擦用恒定系数的库仑摩擦；轨道上的圆环假定小车紧贴轨道并忽略滚动。真实过山车要考虑车轮的转动动能、空气阻力、轨道形变；本页数值用于说明原理，不是安全设计依据。
link0: → 杠杆与滑轮：功的账本，省力必费距离
link1: → 动量与碰撞：另一条守恒的账
link2: → 速度与 v–t 图：下坡为什么越来越快
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
bEp: 势能
bEk: 动能
bTot: 总和
bQ: 热
bElastic: 弹性势能
bKin: 动能
bEpPeak: 最高点势能
lblHeight: 高度 {y} m
lblStartH: 出发高度 {h} m
lblUnreach: 到不了
s0ro: h₀ = {h0} m，现在高度 {y} m：Eₚ = mgh = {Ep} J，Eₖ = {Ek} J，总和 {tot} J（= mgh₀）；速度 {v} m/s，落地速度 √(2gh₀) = {vg} m/s。（质量 1 kg）
s1ro: 位置 x = {x}（高度 {hh} m）：速度 {v} m/s，Eₚ = {Ep} J，Eₖ = {Ek} J，总和 {tot} J；能到的最高处是 {hmax} m。（质量 1 kg）
s2ro: μ = {mu}，t = {t} s：Eₚ = {Ep} J，Eₖ = {Ek} J，热 Q = {Q} J；三者之和 {tot} J，出发时的总能量 {E0} J。（质量 1 kg）
lblMinH: 最低出发高度 2.5R = {h} m
lblNormal: 支持力 N/mg
vLoopOk: 能安全翻过整个圆环
vLoopFail: 会在某处脱轨
s3ro: R = {R} m，h₀ = {h0} m，角度 {phi}°：速度 {v} m/s，支持力 N = {N} mg；最低出发高度 2.5R = {hmin} m：{verdict}。
s3roNo: R = {R} m，h₀ = {h0} m：小车根本爬不到这个角度（动能会变成负）；翻过整个圆环至少要 2.5R = {hmin} m。
lblPeak: 上升 {h} m
s4ro: k = {k} N/m，m = {m} kg，压缩 {x} m：弹性势能 ½kx² = {E} J；起飞速度 x√(k/m) = {v} m/s；上升高度 h = kx²/(2mg) = {h} m。
axSpeed: 车速（km/h）
axDist: 刹车距离（m）
lblCurves: 细线：干 / 湿 / 冰
s5ro: {v} km/h，μ = {mu}：刹车距离 d = v²/(2μg) = {d} m；1000 kg 的车动能约 {ek} kJ 全变成热；车速翻倍到 {v2} km/h 时距离 {d2} m。
:::
