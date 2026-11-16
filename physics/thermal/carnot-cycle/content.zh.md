---
lang: zh
---

::: strings
back: ← 知识索引
category: 物理与电路
stage: 大学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 卡诺循环 · 热机的效率上限
tagline: 在 p–V 图上走完四步一圈，净功就是围出的面积；效率只由热源和冷源两个温度决定。
docTitle: 卡诺循环 · 热机的效率上限
:::

## 气体膨胀时对外做了多少功？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 功是面积
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 功是面积
:::

<b>这一步回答：p–V 图上的功怎么读？</b>气体膨胀时对外做的功 W = ∫P dV，就是曲线下方的面积。恒温（等温）膨胀时 P = nRT/V，面积是 W = nRT·ln(V₂/V₁)。本页取 nR = 1 J/K、V₁ = 1，数字更好读。拖动温度和终点体积，对照公式值与对曲线逐段相加的数值面积。 {#s0e .explain}

::: html step0-2
s0cv: 等温膨胀曲线及其下方的阴影面积
lblT: 温度 T（K）
lblV2: 终点体积 V₂
:::

## 一次膨胀做的功用完了，怎样才能重复工作？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 为何要压回去
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 为什么要压回去
:::

<b>这一步回答：热机为什么必须是循环，并且要在较低温度下压缩？</b>气体必须回到起点才能再工作。若沿原路压回，压缩要还回等量的功，净功为 0。若在较低温度 T<sub>c</sub> 下压缩，同样的体积变化需要的压力更小，所耗的功更少：净功 = nR(T<sub>h</sub> − T<sub>c</sub>)·ln(V₂/V₁)，就是两条等温线围出的绿色面积。拖动 T<sub>c</sub>，面积随之变化。（两端的竖直连线只是示意，真实过程见下一步。） {#s1e .explain}

::: html step1-2
s1cv: 热等温线与冷等温线之间的绿色面积代表净功
lblTc: 冷源温度 T_c（K）
:::

## 怎样用等温和绝热两种过程围成一个闭环？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 四步一圈
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 完整的卡诺循环
:::

<b>这一步回答：卡诺循环的四步是什么？</b>①与热源接触等温膨胀（吸热 Q<sub>h</sub>）；②与外界隔热，绝热膨胀，温度降到 T<sub>c</sub>；③与冷源接触等温压缩（放热 Q<sub>c</sub>）；④隔热绝热压缩，温度回到 T<sub>h</sub>。绝热过程满足 PV<sup>γ</sup> = 常数，γ = 5/3（单原子理想气体）。点“播放”让点沿回路运动，读数显示当前步骤与全程的 Q<sub>h</sub>、Q<sub>c</sub>、W。 {#s2e .explain}

::: html step2-2
s2cv: p–V 图上的四段卡诺循环：红等温膨胀、橙绝热膨胀、青等温压缩、紫绝热压缩
lblTh: 热源温度 T_h（K）
lblR: 体积比 V₂/V₁
play: 播放
restart: 回到起点
:::

::: strings
pause: 暂停
:::

## 从热源拿到的热，去了哪里？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 能量账本
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 能量账本
:::

<b>这一步回答：吸来的热 Q<sub>h</sub> 如何分成功和废热？</b>一圈回来内能不变，所以 Q<sub>h</sub> = W + Q<sub>c</sub>。红条是吸热，绿条是输出的功，青条是排给冷源的热，二者合起来正好等于红条。因为 Q<sub>h</sub> = T<sub>h</sub>·ln r，Q<sub>c</sub> = T<sub>c</sub>·ln r，两者之比只取决于温度之比。拖动 T<sub>h</sub> 与 T<sub>c</sub>。 {#s3e .explain}

::: html step3-2
s3cv: 吸热、输出功与排热三条能量条
:::

## 热机的效率最高能到多少？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 效率上限
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 效率上限
:::

<b>这一步回答：效率能不能做到 100%？</b>η = W/Q<sub>h</sub> = 1 − T<sub>c</sub>/T<sub>h</sub>（温度用开尔文）。冷源越冷、热源越热，效率越高；要到 100%，T<sub>c</sub> 必须是绝对零度。第二定律还说：工作在同样两个温度之间的任何热机，效率都不会超过卡诺循环。点三个预设：蒸汽轮机量级、汽车发动机量级、海洋温差发电（温差很小，上限很低）。实际机器还有摩擦、散热，达不到这个上限。 {#s4e .explain}

::: html step4-2
s4cv: 卡诺效率随 T_c/T_h 下降的直线，标出所选工作点
preSteam: 蒸汽轮机量级 800→300 K
preCar: 汽车发动机量级 900→300 K
preOcean: 海洋温差 300→277 K
:::

::: strings
lblArea: 功 W
s0ro: T = {T} K，V₁ = 1 → V₂ = {V2}：公式 W = T·ln(V₂/V₁) = {w} J；对曲线下方 400 条窄条逐段相加 = {n} J。
lblHotCurve: 热等温线 {T} K
lblColdCurve: 冷等温线 {T} K
lblNet: 净功
s1ro: T_h = 500 K，T_c = {Tc} K，V₂/V₁ = 3：膨胀做功 {wo} J，压缩耗功 {wi} J，净功 {net} J（占膨胀功的 {frac}%）。T_c 等于 T_h 时净功为 0。
procIso1: ① 等温膨胀（吸热）
procAd1: ② 绝热膨胀（降温）
procIso2: ③ 等温压缩（放热）
procAd2: ④ 绝热压缩（升温）
s2ro: {proc}：T = {T} K，V = {V}，P = {P}。全程：Q_h = {qh} J，Q_c = {qc} J，净功 W = {w} J。
lblQh: 吸热 Q_h = {v} J
lblW: 功 W = {v} J
lblQc: 排热 Q_c = {v} J
lblEff: 效率 W/Q_h = {e}%
s3ro: T_h = {Th} K，T_c = {Tc} K：Q_h = {qh} J，W = {w} J，Q_c = {qc} J；W + Q_c = {sum} J。效率 W/Q_h = {eta}%，1 − T_c/T_h = {eta2}%。
axRatio: T_c / T_h
axEta: 卡诺效率
s4ro: T_h = {Th} K，T_c = {Tc} K（比值 {q}）：效率上限 {eta}%。要达到 100%，需要 T_c = 0 K。
lblReverse: 倒转：制冷
s5ro: 热侧 {Th} K，冷侧 {Tc} K：COP = T_c/(T_h − T_c) = {cop}；搬走 1000 J 的热要做功 {w} J，向热侧放出 {qh} J。
:::

## 把循环倒过来，花功就能把热从冷处搬到热处吗？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 倒着转
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 倒着转的卡诺
:::

<b>这一步回答：倒转的热机是什么？</b>箭头反向，循环就成了制冷机：外界做功 W，从冷处吸热 Q<sub>c</sub>，向热处放热 Q<sub>h</sub> = Q<sub>c</sub> + W。衡量好坏的是性能系数 COP = Q<sub>c</sub>/W = T<sub>c</sub>/(T<sub>h</sub> − T<sub>c</sub>)。冷热温差越小，搬同样多的热越省功。读数以搬走 1000 J 的热为例。冰箱、空调、热泵都是这个原理，实际机器达不到理想值。 {#s5e .explain}

::: html step5-2
s5cv: 倒转的卡诺循环，箭头方向相反，代表制冷
lblThRoom: 外界（热侧）温度 T_h（K）
lblTcFridge: 箱内（冷侧）温度 T_c（K）
recapTitle: 回顾
recap1: 功是 p–V 曲线下的面积；一圈的净功是回路围出的面积。
recap2: 卡诺循环：等温膨胀、绝热膨胀、等温压缩、绝热压缩；Q_h = W + Q_c。
recap3: 效率上限 η = 1 − T_c/T_h，倒转后的制冷机性能系数 COP = T_c/(T_h − T_c)。
modelTitle: 模型范围与局限
modelText: 模型：nR = 1 J/K 的单原子理想气体（γ = 5/3），可逆、无摩擦、无限慢；步骤 1 中两端的竖直连线只是示意。真实热机不可逆，效率低于卡诺上限；预设只取温度量级，不代表具体机器的参数。
link0: → 热力学：热机效率与第一定律
link1: → 熵：为什么热不会自己从冷处流向热处
link2: → 气体压强的微观图景：温度与平均动能
:::

本页完成。 {#done .readout .success i18n=text}
