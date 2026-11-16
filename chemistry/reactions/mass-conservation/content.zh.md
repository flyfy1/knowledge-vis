---
lang: zh
---

::: strings
docTitle: 质量守恒 · 原子一个都不丢
back: ← 知识索引
pageTitle: 质量守恒 · 原子一个都不丢
tagline: 化学反应不是把原子变没，而是把它们重新排队。密闭时总质量相等；看起来变轻或变重，是有物质进出系统。
foot: 质量守恒 · 原子一个都不丢
navLabel: 步骤导航
:::

## 反应之后，天平会怎么变？ {#step0 h2=s0t}

::: strings
nav0: 0 先称一称
:::

第 0 步 · 先押注 {#s0k .step-kicker i18n=text}

这一步要回答：一瓶**密封**的反应物放在天平上，点火后再称，读数会变重、变轻，还是不变？先选一个预测，再开始反应。密封表示气体也留在系统里。 {#s0e .explain}

::: html step0-1
canvasLabel: 本步化学反应示意图；读数见正文
s0pickHeavy: 变重
s0pickLight: 变轻
s0pickSame: 不变
start: 点火 / 开始反应
reset: 重置本步
:::

先押注，再点火；看瓶内原子如何重新组合，再比较反应前后两根读数条。 {#s0hint .hint i18n=text}

单位约定：每个系数代表 1 mol（一份）分子，所以读数可以写成 g——1 份 C 记 12 g、1 份 O₂ 记 32 g；单个原子当然轻得多。 {#unitNote .hint i18n=text}

::: html step0-2
:::

::: strings
before: 反应前
after: 反应后
sealed: 密闭瓶
selected: 已选择
choose: 选择
observe: 观察顺序
s0ro: 预测：<b>{pick}</b>。反应前 {before} g；反应后 {after} g；差值 {delta} g。{result}
s0pending: 还没有开始反应。
s0same: 密闭系统里，读数不变：原子只是重新组合。
s0wrong: 这个预测与模型结果不符；下一步会把账拆开。
s0noPick: 先在上面三个选项里押一个，才能点火（点火后押注锁定）。
:::

## 左右两边，元素的原子数一样吗？ {#step1 h2=s1t}

::: strings
nav1: 1 数原子
:::

第 1 步 · 拆开数原子 {#s1k .step-kicker i18n=text}

这一步要回答：把分子拆成原子后，每种元素分别有多少个？改换反应，保持系数不动，先看左边和右边的计数表。 {#s1e .explain}

先看分子式，再把每种元素逐个数出来：换了组合，元素的原子总数仍要逐项对上。 {#s1bridge .hint i18n=text}

::: html step1-1
reactionBurn: 燃烧：C + O₂ → CO₂
reactionLimestone: 石灰石 + 盐酸：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂
left: 反应物一侧
right: 生成物一侧
:::

::: strings
countLine: {el}：左边 {left} 个 · 右边 {right} 个
balanced: 原子数相等
unbalanced: 原子数不相等
s1ro: 当前反应：{name}。{status} 结论：原子没有消失，只是换了组合。
:::

## 每个原子的质量都留下来了吗？ {#step2 h2=s2t}

::: strings
nav2: 2 对上质量
:::

第 2 步 · 质量从哪来 {#s2k .step-kicker i18n=text}

这一步要回答：如果给每种原子查一个相对质量，左右两边的总和能否对上？用系数旁的 − / + 改分子数量；故意配不平时，计数和天平都会报警。 {#s2e .explain}

先故意改坏一个系数，观察原子计数和天平同时报警；修回配平后，两种读数一起对上。 {#s2bridge .hint i18n=text}

::: html step2-1
:::

::: strings
coeff: 系数
massLabel: 总质量
tiltLabel: 天平倾斜
alarm: 未配平：先数原子，再修系数
balancedMass: 已配平：原子数与质量都对上
s2ro: 左边 {lm} g；右边 {rm} g；{status}。{tilt}<br>{counts}
:::

## 为什么敞口反应会“变轻”？ {#step3 h2=s3t}

::: strings
nav3: 3 敞口陷阱
:::

第 3 步 · 敞口陷阱 {#s3k .step-kicker i18n=text}

这一步要回答：把第 1 步的石灰石 + 盐酸放在敞口杯里，生成的 CO₂ 逸出后还算不算在天平系统内？切换密闭 / 敞口；敞口时再接上气球收集气体，观察读数如何恢复。 {#s3e .explain}

::: html step3-1
closed: 密闭
open: 敞口
balloonOn: 接上收集气球
:::

先切到敞口，看 CO₂ 离开系统后读数少掉；再接上收集气球，把同一份气体收回系统，读数随之恢复。 {#s3bridge .hint i18n=text}

::: html step3-2
:::

::: strings
balloonOff: 不收集
escaped: 逸出气体
systemMass: 系统总质量
s3ro: 状态：{state}；{balloon}。系统读数 {mass} g = 总质量 {total} g − 逸出 {escape} g。{result}
s3closed: 气体仍在系统内，读数守恒。
s3open: 气体离开系统，天平少了它的质量。
s3balloon: 气体被收回系统，总质量回来了。
:::

## 铁生锈或镁燃烧，重量从哪里增加？ {#step4 h2=s4t}

::: strings
nav4: 4 变重之谜
:::

第 4 步 · 反过来：变重之谜 {#s4k .step-kicker i18n=text}

这一步要回答：固体变重时，是否有空气里的氧原子加入？切换材料和空气参与开关；比较“只称固体”和“把进入的氧也算进系统”。 {#s4e .explain}

先关掉空气观察固体不变，再打开空气看氧进入后固体增重；把进入的氧也算进系统，账仍然相等。 {#s4bridge .hint i18n=text}

::: html step4-1
iron: 铁生锈
magnesium: 镁燃烧
airOn: 空气参与：开
:::

::: strings
airOff: 空气参与：关
solidMass: 原固体质量
addedOxygen: 加入的氧质量
s4ro: {name}：原固体 {base} g；从空气加入氧 {oxygen} g；反应后固体 {after} g（只称固体：增加 {gain} g）。整个系统（固体 + 加入的氧）：反应前 {sysBefore} g → 反应后 {sysAfter} g。{result}
s4on: 氧气从空气进入，所以固体变重；把它算进系统后仍守恒。
s4off: 空气关掉：没有氧气，金属不反应、不生成产物，固体仍是原来的 {base} g——不变重，也没有新物质。
:::

## 把质量守恒说给别人听 {#step5 h2=s5t}

::: strings
nav5: 5 一句话带走
:::

第 5 步 · 收束 {#s5k .step-kicker i18n=text}

一句话复述：化学反应里，原子一个不多、一个不少，只是重新排队；密闭系统总质量相等。看到变轻或变重，先问：有什么气体跑走了，或从空气进来了？ {#s5e .explain}

收束时只问一个边界问题：有什么气体跑走了，或从空气进来了？这解释了读数为什么变轻或变重。 {#s5bridge .hint i18n=text}

::: html step5-1
modelTitle: 模型假设
modelBody: 本页用简化反应式和相对原子质量算账；天平读数是示意值，不等于真实粉末称量的实验结果。
boundaryTitle: 模型边界
boundary: 真实实验会有称量误差、漏气和未反应物；本页守恒的是原子层面的账，示意天平只在模型设定内精确。
linkParticles: → 粒子状态第 0 步：看见粒子一直在动
linkAtoms: → 原子结构第 1 步：质子数决定元素身份
linkRates: → 反应速率：反应快慢不改变原子账
:::

::: strings
elC: 碳 C
elO: 氧 O
elCa: 钙 Ca
elCl: 氯 Cl
elH: 氢 H
resultSame: 不变
resultDiff: 变化
deltaZero: 0
s4betWrong: 押注揭晓：你在第 0 步押了「{pick}」，而密闭瓶的答案是「不变」。读数“变重 / 变轻”只在有气体进出系统时出现——正如这里从空气进来的氧。
s4betRight: 押注揭晓：你在第 0 步押了「{pick}」——押对了。密闭瓶里读数不变；这里固体变重也没有打破守恒，因为从空气进来的氧被算进了系统。
s4betNone: 押注揭晓：你在第 0 步还没有押注——回到第 0 步先押一次再来对账。
rustNote: 注：真实的铁生锈还需要水，铁锈是含水的 Fe₂O₃·xH₂O；这里只算铁和氧的账。
s4noReaction: 无氧 → 不反应
solidAfter: 反应后固体质量
:::
