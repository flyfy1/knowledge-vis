---
lang: zh
---

::: strings
back: ← 知识索引
category: 地球与太空
stage: 高中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 碳循环 · 大气里的碳去了哪里
tagline: 用五个“碳库”的账本，看自然流转为什么平衡、一点点人为排放为什么会累积，又为什么停止排放后降得很慢。
docTitle: 碳循环 · 大气里的碳去了哪里
:::

## 地球上的碳存在哪几个“仓库”，各有多少？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 碳库与流量
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 碳库与流量
:::

<b>这一步回答：每个碳库有多大、进出多快、碳在里面能待多久？</b>单位 GtC（十亿吨碳）。停留时间 = 库存 ÷ 每年流出量。大气只有约 590 GtC，但每年有 210 GtC 进出，所以一个碳原子平均只在空气里待几年；深海有 3.7 万 GtC，要待数百年。点按钮选择碳库，看箭头粗细（流量）和读数。 {#s0e .explain}

::: html step0-2
s0cv: 五个碳库方块（大气、陆地、表层海洋、深海、化石燃料）和之间的碳流箭头
box_A: 大气
box_L: 陆地
box_S: 表层海
box_D: 深海
box_F: 化石燃料
:::

::: strings
note_A: 工业化前约 278 ppm
note_L: 陆地植被、凋落物与土壤
note_S: 溶解的无机碳
note_D: 混合很慢
note_F: 图中箭头是今天的燃烧量，自然流量为 0
lblSize: 方块大小 = 库存（对数刻度），数字为 GtC
s0ro: {name}：库存 {stock} GtC，流入 {inn}，流出 {out} GtC/年，停留时间约 {turn} 年（{note}）。
:::

## 光合作用与呼吸只差 3%，大气会怎样？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 小失衡
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 大流量里的小失衡
:::

<b>这一步回答：大流量中的小差额有多大影响？</b>陆地每年吸收约 120 GtC、释放约 120 GtC。若二者只差 p%，每年净差 = 120×p% GtC，约 2.12 GtC 对应大气 1 ppm。橙线是这个差额造成的 50 年变化（忽略反馈，只在短期成立），红线是今天化石排放（约 10 GtC/年）的量级。 {#s1e .explain}

::: html step1-2
s1cv: 50 年内大气二氧化碳浓度：自然失衡线与排放线对比
lblImbPct: 光合比呼吸多 p（%）
:::

::: strings
lblHuman: 化石排放 10 GtC/年
lblImb: 自然失衡
axYear: 年
axPpm: CO₂（ppm）
dirDown: 大气下降
dirUp: 大气上升
dirFlat: 大气不变
s1ro: 差额 {p}%：净流量 {net} GtC/年 ≈ {ppm} ppm/年（{dir}），相当于今天化石排放量的 {share}%。
:::

## 每年多排一点碳，大气里的二氧化碳会涨多少？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 排放累积
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 排放累积
:::

<b>这一步回答：持续排放下大气浓度怎样随时间攀升？</b>模型把大气、陆地、海洋之间的交换都算进去：排放 E（GtC/年）进入大气，一部分被陆地植物（受二氧化碳施肥）和海洋吸走，剩下的留在空气里。留在空气里的比例叫“空气存留比”。拖动排放与年份，读数同时给出 ppm 与存留比。 {#s2e .explain}

::: html step2-2
s2cv: 恒定排放下大气二氧化碳（ppm）随年份上升的曲线，虚线为工业化前水平
lblE: 每年排放 E（GtC）
lblYr: 年数 t
:::

## 排出去的碳，最后分别落在大气、陆地、海洋的多少？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 碳去了哪
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 碳的去向
:::

<b>这一步回答：排放的碳到底去了哪里？</b>碳不会消失：累计排放 = 大气增量 + 陆地增量 + 海洋增量（表层加深层）。拖动年份看三段占比的变化，读数里的三项相加应等于累计排放。海洋的深层交换需要几十年到几百年，所以海洋占比随时间增大。 {#s3e .explain}

::: html step3-2
s3cv: 累计排放按去向分成大气、陆地、海洋三段的横向堆叠条
:::

## 如果现在突然停止排放，二氧化碳会立刻回落吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 停排之后
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 停止排放之后
:::

<b>这一步回答：停排后大气浓度怎样下降？</b>拖动“停排年份”，之前每年排放 10 GtC。停排后，陆地和表层海洋很快吸走一部分，剩下的要靠深海慢慢吞下去，下降先快后慢，百年后仍有相当一部分留在空气里（青点标出停排后第 100 年）。 {#s4e .explain}

::: html step4-2
s4cv: 在所选年份停止排放后，大气二氧化碳在 300 年内的曲线
lblStopYr: 停排年份
:::

::: strings
s2ro0: E = 0：第 {yr} 年大气 {ppm} ppm，保持工业化前水平。
s2ro: E = {E} GtC/年，第 {yr} 年：大气 {ppm} ppm；累计排放 {cum} GtC；空气存留比 {af}%。
lblAtm: 大气
lblLand: 陆地
lblOcean: 海洋
lblEmitted: 累计排放 {c} GtC
lblWhere: 青：留在空气里 · 绿：陆地吸收 · 蓝：海洋吸收
s3ro0: 没有排放就没有累计量。
s3ro: E = {E}，第 {yr} 年：累计排放 {cum} GtC = 大气 {a} + 陆地 {l} + 海洋 {o} = {sum} GtC。
lblStop: 停排
s4ro: 第 {ys} 年停排：此时大气 {pk} ppm；停排后第 100 年 {later} ppm，仍剩原来超出量的 {rem}%；第 300 年 {end} ppm。
:::

## 不同的排放路径，一百五十年后的大气有什么差别？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 情景比较
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 情景比较
:::

<b>这一步回答：排放路径怎样决定未来的浓度？</b>四条路径：一直排 10、第 30 年减半、五十年线性降到零、立刻停止。粗线是你选中的那条，读数给出峰值、第 150 年的浓度和累计排放。越晚减排，累计排放越多，留在大气里的也越多。 {#s5e .explain}

::: html step5-2
s5cv: 四种排放路径下大气二氧化碳 150 年的曲线，选中路径加粗
scKeep: 一直排 10
scHalve: 第 30 年减半
scNetZero: 50 年线性降到零
scStop: 立刻停止
recapTitle: 回顾
recap1: 碳在大气、陆地、海洋之间大量流动，自然状态下进出相抵。
recap2: 人为排放只是大流量里的一个小增量，但每年累积；约一半留在空气中，其余被陆地与海洋逐步吸收。
recap3: 停排后下降很慢，因为深海的吸收需要数十到数百年。
modelTitle: 模型范围与局限
modelText: 这是五库玩具模型：一阶交换、线性的“二氧化碳施肥”（β = 0.15）、海洋缓冲因子 10；参数调到工业化前平衡与今天约 45–50% 的空气存留比，只展示趋势。没有气候反馈、海洋酸化、土地利用变化、岩石风化与永久冻土；不能用于预测具体年份的浓度。
link0: → 光合作用：植物怎样把二氧化碳变成糖
link1: → 能量金字塔：碳与能量沿食物链流动
link2: → 气候能量账本：温室效应怎样改变收支
link3: → 气候反馈：变暖如何放大或减弱自己
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
s5ro: {name}：峰值 {pk} ppm，第 150 年 {end} ppm，累计排放 {cum} GtC。
:::
