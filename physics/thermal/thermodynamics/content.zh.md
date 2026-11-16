---
lang: zh
---

::: strings
back: ← 知识索引
title: 热力学 · 一口气追踪能量
eyebrow: 物理 · 热力学
tagline: 把气体当成会回应你的实验对象：拖动活塞、选择过程，再看 P–V 曲线下的面积如何变成做功，最后把一条守恒链闭合。
nav: 步骤导航
footer: 热力学 visual · 每个读数都由当前参数实时计算
langLabel: 语言
choose: 选择
status: 状态
:::

## 先分清：状态是什么，路径又是什么？ {#step0 h2=s0title pre=1}

::: strings
nav0: 01 状态
:::

::: html step0-1
:::

同一团理想气体的状态由 **P、V、T** 和物质的量 **n** 描述。状态只看起点和终点；热量 Q 与做功 W 却记得“怎么走过来”，它们是路径量。拖动体积，观察压强如何立即响应。 {#s0body .explain}

::: html step0-2
stateAlt: 理想气体活塞状态图
stateFeedback: 体积增大而温度不变时，分子撞击活塞的频率降低，所以 P 按 1/V 下降。
nLabel: 物质的量 n
tLabel: 温度 T
vLabel: 体积 V
:::

试着把体积加倍：如果温度不变，压强会怎样？ {#stateTask .hint i18n=text}

::: html step0-3
misconception: 误解检查：只要状态一样，过程中的 Q 和 W 也一定一样。
mFalse: 是的，Q 和 W 只由初末状态决定
mTrue: 不是：Q、W 是路径量，只有 ΔU 由状态决定
next: 把能量记账 →
:::

::: strings
stateReadout: 状态：P = {P} kPa · V = {V} L · T = {T} K
mFeedback: 正确。第一定律把三者连起来：ΔU = Q − W（W 取系统对外做功）。
mWrong: 还差一步：同样的初末状态可以走不同路径，Q 和 W 会随路径改变。
:::

## 第一定律：每一份能量都要对得上 {#step1 h2=s1title pre=1}

::: strings
nav1: 02 守恒
:::

::: html step1-1
:::

气体吸收热量 Q，一部分改变内能 ΔU，另一部分通过推动活塞对外做功 W。我们约定 **W&gt;0** 表示系统对外做功，因此 **ΔU = Q − W**。 {#s1body .explain}

::: html step1-2
processLabel: 过程
iso: 等温膨胀
adi: 绝热膨胀
vfLabel: 终体积 Vf
gammaLabel: 绝热指数 γ
pvAlt: P-V 过程曲线与功的面积
areaNote: 曲线下的面积就是 W = ∫P dV。
firstLaw: 能量账本：Q = ΔU + W
challenge: 预测：绝热膨胀后，温度会升高还是降低？
rise: 升高
fall: 降低
next2: 比较两条路径 →
:::

::: strings
firstLawReadout: Q = {Q} kJ · ΔU = {dU} kJ · W = {W} kJ · 误差 = {err} kJ
isoExplain: 等温：T 不变，理想气体的内能不变，所以 Q 全部变成做功。
adiExplain: 绝热：没有热交换（Q=0），做功来自内能，膨胀后温度下降。
firstLawFeedback: 每次拖动都会重新计算三项；守恒不是一条口号，而是三项数字相加相减仍能闭合。
challengeCorrect: 对。气体做功又没有吸热，只能从内能中支付，T 降低。
challengeWrong: 再看能量账本：Q=0 时，ΔU = −W；膨胀 W>0，所以内能和温度下降。
:::

## 同一条起点：等温和绝热走出不同的路 {#step2 h2=s2title pre=1}

::: strings
nav2: 03 过程
:::

::: html step2-1
:::

把初始状态固定，切换过程类型。等温曲线更“平”，因为外界持续供热；绝热曲线更陡，因为气体只能消耗自身内能。 {#s2body .explain i18n=text}

::: html step2-2
legendIso: 等温 T 恒定
legendAdi: 绝热 Q=0
:::

注意：两条曲线的终点状态不同；“同一起点”不等于“同一终点”。 {#compareHint .hint i18n=text}

::: html step2-3
next3: 把路径装进热机 →
:::

::: strings
compareReadout: 起点 {Pi} kPa / {Ti} K → 终点 {Pf} kPa / {Tf} K
:::

## 热机：把守恒变成效率上限 {#step3 h2=s3title pre=1}

::: strings
nav3: 04 热机
:::

::: html step3-1
:::

热机从高温热源吸热 Q<sub>in</sub>，向低温热源放热 Q<sub>out</sub>，剩下的就是净功 W<sub>net</sub>。效率 η = W<sub>net</sub>/Q<sub>in</sub>，而卡诺上限只由两端温度决定。 {#s3body .explain}

::: html step3-2
engineAlt: 热机能量流图
hotLabel: 高温热源 Th
coldLabel: 低温热源 Tc
ratioLabel: 体积比 r
:::

增大温差会抬高上限，但任何真实循环都不能超过卡诺效率。 {#engineHint .hint i18n=text}

::: html step3-3
engineQuestion: 如果把冷源温度降到 0 K，效率能达到 100% 吗？
engineYes: 可以，效率就是 100%
engineNo: 只能逼近；0 K 是不可达到的极限
finish: 回到索引
:::

::: strings
engineReadout: Qin = {qin} kJ · Qout = {qout} kJ · Wnet = {w} kJ
effReadout: 效率 η = {eff}% · 卡诺上限 ηC = {carnot}%
engineCorrect: 正确。卡诺公式给出数学上的极限，但第三定律告诉我们 0 K 无法通过有限步骤达到。
engineWrong: 再看 ηC = 1 − Tc/Th：只有 Tc=0 才是 100%，而绝对零度不可达到。
:::
