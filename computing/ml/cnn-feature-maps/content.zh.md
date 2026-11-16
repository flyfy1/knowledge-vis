---
lang: zh
---

::: strings
back: ← 知识索引
category: 计算与智能
stage: 大学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 卷积神经网络的特征图 · 小窗口怎样“看”图
tagline: 一个 3×3 的小窗口在图上滑动，边缘、模糊、锐化各是一组数字；把它们堆起来，再让机器自己学出这组数字。
docTitle: 卷积神经网络的特征图 · 小窗口怎样“看”图
:::

## 小窗口在某个位置，怎样算出一个输出像素？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 滑动窗口
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 滑动窗口
:::

<b>这一步回答：卷积核怎样把一小块像素变成一个数？</b>把 3×3 的核盖在图像上，对应格子相乘，再把九个乘积加起来，得到输出图在这个位置的一个像素。橙框是当前窗口，右图是已经算出的部分。这里的“卷积”按 CNN 惯例不翻转核（严格说是互相关）。拖动位置，或点“扫描”让窗口自动走一遍。 {#s0e .explain}

::: html step0-2
s0cv: 左：12×12 小图与窗口框；中：核与九个乘积；右：已算出的输出图
lblRow: 窗口行位置 i
lblCol: 窗口列位置 j
kn_edgeV: 竖直边缘
kn_edgeH: 水平边缘
kn_blur: 模糊
kn_sharpen: 锐化
scan: 扫描
:::

::: strings
pause: 暂停
:::

## 同一张图，换一个核，输出图为什么完全不同？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 不同的核
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 不同的核看见不同的东西
:::

<b>这一步回答：核的九个数怎样决定它“关心”什么？</b>竖直边缘核（左负右正）只对左右亮度不同的地方有响应；水平边缘核（上负下正）看上下的差别；模糊核把邻居取平均；锐化核突出中心。输出图中橙色是正响应，青色是负响应。换图片，数一数每个边缘核在多少个位置响应强烈：条纹图只有竖直边缘。 {#s1e .explain}

::: html step1-2
s1cv: 原图与四个核的输出特征图
im_square: 方块
im_circle: 圆
im_stripes: 竖条纹
im_diag: 对角线
im_scene: 组合图
:::

## 九个数怎么改，输出就怎么变？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 自己调核
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 自己调核
:::

<b>这一步回答：核的数值与输出之间是什么关系？</b>在方格里直接输入权重（−5 到 5），输出图实时改变。权重之和为 1 时整体亮度不变（模糊、锐化）；权重之和为 0 时平坦区域输出 0，只留下变化（边缘检测）。点预设加载常见的核，再改改看。 {#s2e .explain}

::: html step2-2
s2cv: 左：输入图；右：用你输入的核算出的输出图
lblCell: 核的一个权重
kn_id: 原样（恒等）
:::

## 输出图的大小怎么算，ReLU 和池化又做了什么？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 ReLU 与池化
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 填充、步长、ReLU 与池化
:::

<b>这一步回答：一层卷积之后，数据的尺寸和内容怎样变？</b>输出边长 = ⌊(n + 2·填充 − 3)/步长⌋ + 1：填充 1 让尺寸保持不变，步长 2 让尺寸近似减半。ReLU 把负响应变成 0，只留“有这种边缘”的位置。最大池化把每 2×2 取最大值，图缩小一半，保留最强响应、对位置的小偏移不那么敏感。切换各个选项。 {#s3e .explain}

::: html step3-2
s3cv: 左：输入图；右：经过卷积（及可选 ReLU、池化）后的输出图
lblPad: 填充（0 或 1）
lblStride: 步长（1 或 2）
btnRelu: ReLU（负值置 0）
btnPool: 2×2 最大池化
:::

::: strings
on: 开
off: 关
:::

## 把边缘组合起来，能找到“角”吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 层层叠加
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 层层叠加
:::

<b>这一步回答：第二层怎样用第一层的结果拼出更复杂的特征？</b>第一层给出竖直边缘图 |Gx| 和水平边缘图 |Gy|。第二层的一个神经元对两者各做 3×3 平均，再加权求和减去阈值：out = ReLU(a·V + b·H − c)。当 a、b 都足够大而阈值 c 又刚好卡住，只有“竖边和横边同时出现”的地方才亮——方块的四个角。把 c 调小，整条边都会亮；调大，什么都不亮。 {#s4e .explain}

::: html step4-2
s4cv: 方块图的竖直边缘图、水平边缘图与第二层输出
lblA: 竖边权重 a
lblB: 横边权重 b
lblC: 阈值 c
:::

## 不告诉机器答案，它能自己学出边缘核吗？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 让机器学核
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 让机器学出核
:::

<b>这一步回答：CNN 里的核是怎样来的？</b>我们不手写核，而是从“什么都不做”的核出发，给机器一张图和一张目标特征图，用梯度下降反复调整九个权重，使输出与目标的均方误差越来越小。结果和手写的竖直边缘核几乎一样：学出的核与目标逐格对比。点“训练”，调学习率，再看误差曲线（对数刻度）。学习率太大会发散。 {#s5e .explain}

::: html step5-2
s5cv: 学出的核与目标核的对比，以及训练误差随步数下降的曲线
lblLr: 学习率
train1: 训练 1 步
train10: 训练 10 步
train100: 训练 100 步
reset: 重置
recapTitle: 回顾
recap1: 卷积核是九个数：滑到哪里就把附近像素加权求和，得到特征图的一个像素。
recap2: 不同的核看不同的东西；ReLU 与池化保留强响应并缩小尺寸；第二层能把边缘拼成角。
recap3: 核可以由梯度下降学出来，不必手写。
modelTitle: 模型范围与局限
modelText: 模型：12×12 的合成灰度图，3×3 的核，无偏置、单通道；第 4 步的第二层神经元是手工设定的玩具。真实 CNN 有成百上千个通道、很多层，核是在大量真实图片上学出来的，并不是简单的“边缘”和“角”。
link0: → 卷积：一维“翻转、滑动、相乘、求和”
link1: → 梯度下降：怎样一步步调参数
link2: → 反向传播：误差怎样回传给每个权重
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
lblInput: 输入 12×12
lblOutput: 输出 10×10
lblKernel: 核
lblProducts: 对应相乘
s0ro: {name}核，窗口位置 ({i}, {j})：九个乘积之和 = {sum}；整张输出图是 {n}×{n}。
s1ro: {img}：竖直边缘图中有 {v} 个位置响应超过 0.5，水平边缘图中有 {hh} 个（共 {n} 个位置）。
kindZero: 和为 0：平坦处输出 0，只留变化
kindOne: 和为 1：整体亮度保持
kindOther: 和既不是 0 也不是 1：整体亮度会被缩放
s2ro: 权重之和 {sum}（{kind}）；输出最大 {mx}，最小 {mn}。
lblInputSize: 输入 {n}×{n}
lblOutSize: 输出 {n}×{n}
s3ro: 填充 {pad}，步长 {st}：卷积输出 {n1}×{n1}（{formula}）；ReLU {relu}，池化 {pool}；最终 {n2}×{n2}。
lblV: 竖边 |Gx|
lblH: 横边 |Gy|
lblL2: 第二层输出
s4roNone: a = {a}，b = {b}，c = {c}：没有任何位置超过阈值，输出全 0。
s4ro: a = {a}，b = {b}，c = {c}：输出最大 {mx}；超过最大值一半的位置有 {act} 个。
lblLearned: 学出的核
lblTarget: 目标（竖直边缘）
axLoss: 均方误差（对数）
axTrain: 训练步数
s5ro: 训练 {n} 步，学习率 {lr}：误差 {loss}；学出的核与目标的最大差 {gap}。
:::
