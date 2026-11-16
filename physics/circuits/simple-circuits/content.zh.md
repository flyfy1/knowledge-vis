---
lang: zh
---

::: strings
back: ← 知识索引
category: 物理与电路
stage: 小学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 简单电路 · 电流要走一圈
tagline: 电池、开关和灯泡连成一个完整的圈，灯才会亮；断开一处，整圈的电流同时停下。
:::

## 灯泡要亮，电路必须满足什么条件？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 一个回路
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 一个回路
:::

这一步要回答：灯为什么有时亮、有时不亮？电池左侧提供推动电荷的“电压”，导线把电池、开关、灯泡连成一圈。只有这一圈**完整闭合**时，电荷才能一直绕行，形成**电流**；按下开关看灯。图上的小点只是示意电荷流动的方向（从电池正极出发），不代表真实速度。 {#s0e .explain}

::: html step0-2
s0cv: 电池、开关、灯泡组成的回路
:::

::: strings
sw: 开关
swOn: 合上开关
swOff: 断开开关
pause: 暂停流动动画
resume: 继续流动动画
s0ro: 开关{sw}：回路{loop}，灯泡{bulb}，电流 {i} A。
swClosed: 合上
swOpen: 断开
loopYes: 完整闭合
loopNo: 断开了
bulbOn: 亮着
bulbOff: 不亮
:::

## 导线断在不同位置，灯会怎样？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 断在哪里
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 断在哪里
:::

这一步要回答：回路断在哪里才会让灯灭？图中有四段导线 A、B、C、D，开关已合上。按钮可以在对应位置剪断一段导线（再按一次接上）：不管剪哪一段，所有小点都会同时停下，因为一个回路里各处的电流一样。 {#s1e .explain}

::: html step1-2
s1cv: 剪断回路中的某一段导线
cutA: 剪断 A（左上）
cutB: 剪断 B（右上）
cutC: 剪断 C（右下）
cutD: 剪断 D（左下）
restore: 全部接好
:::

::: strings
s1ro: 断开的导线：{list}。回路{loop}，灯泡{bulb}。
none: 无
:::

## 把不同的东西接进回路的缺口，灯会亮吗？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 导体绝缘体
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 导体绝缘体
:::

这一步要回答：哪些材料能让电流通过？回路底部留了一个缺口，把一件东西接进去：**导体**（如铜、铁）让电荷通过，灯亮；**绝缘体**（如橡胶、塑料）不让电荷通过，灯灭。选择材料，看灯和小点。 {#s2e .explain}

::: html step2-2
s2cv: 缺口里的材料决定灯是否亮
matLabel: 选择接入缺口的材料
:::

::: strings
mCopper: 铜线
mIron: 铁钉
mFoil: 铝箔
mGraphite: 铅笔芯
mSalt: 盐水
mRubber: 橡皮
mPlastic: 塑料尺
mWood: 干木棍
mGlass: 玻璃
s2ro: 接入{mat}：{kind}，灯泡{bulb}。
kindCond: 它是导体
kindIns: 它是绝缘体
:::

## 用导线直接连住灯泡两端，会发生什么？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 短路
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 短路
:::

这一步要回答：为什么短路危险？两节电池（3 V），电池自身有 1 Ω 的内阻，灯泡电阻 6 Ω。接上一根“短路线”后，电流有了一条几乎没有阻碍的近路，不再经过灯泡：灯灭了，但电流变得非常大，电池和导线发热得更厉害。图中导线越粗表示电流越大。 {#s3e .explain}

::: html step3-2
s3cv: 短路线让电流绕过灯泡
:::

::: strings
shortOn: 接上短路线
shortOff: 拆掉短路线
s3ro: {state}：电流 {i} A，灯泡功率 {pb} W，电池内部发热功率 {pr} W。
stNormal: 正常
stShort: 短路
s3roCmp: 短路时电流是正常的 {x} 倍，电池内部发热是 {h} 倍。
:::

## 串联更多电池，灯泡会更亮吗？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 几节电池
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 几节电池
:::

这一步要回答：电压变大对灯泡有什么影响？每节电池 1.5 V、内阻 0.5 Ω，串联后电压相加，内阻也相加；灯泡电阻 6 Ω、额定功率 2.5 W。电流 = 总电压 ÷ 总电阻，灯泡功率 = 电流² × 6。功率越大越亮；超过额定值灯丝会烧断。 {#s4e .explain}

::: html step4-2
s4cv: 串联电池数与灯泡亮度
cells: 串联电池节数
:::

::: strings
s4ro: {n} 节：电压 {v} V，电流 {i} A，灯泡功率 {p} W（额定 {pr} W）{res}。
resOk: ，亮度 {pct}%
resBurn: ，超过额定值，灯丝烧断了，回路断开
:::

## 看图诊断：这个电路出了什么问题？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：看一个电路的状态，能说出原因吗？每道题的电路状态不同，选择你的诊断，再检查。 {#s5e .explain}

::: html step5-2
s5cv: 待诊断的电路
dgNormal: 一切正常，通路
dgSwitch: 开关断开
dgCut: 导线断了
dgShort: 短路
check: 检查诊断
next: 下一题
recapTitle: 回顾
recap1: 电流要在完整的回路里走一圈：电源、导线、用电器首尾相连。
recap2: 单一回路里各处电流相同，任何一处断开，整圈电流同时停止。
recap3: 导体让电荷通过，绝缘体不让；短路使电流远大于正常值，很危险。
modelTitle: 模型范围与局限
modelText: 这里的电路是理想化的：导线电阻很小（短路线按 0.05 Ω），灯泡电阻按恒定 6 Ω 计算（真实灯丝发热后电阻会变大），小点只示意方向。导体与绝缘体是粗略分类，潮湿的木头也能导电。
linkAtom: → 去原子结构页：导体里能自由移动的电荷从哪来
linkPart: → 去粒子与物态页：物质是由什么组成的
linkEq: → 去方程天平页：两边相等的平衡关系
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
parts: 电池 + 开关 + 灯泡 + 导线
s5ro: 请观察电路，选一个诊断。
s5roOk: 正确：{why}
s5roNo: 再看看：{why}
whyNormal: 回路完整，灯亮，电流绕一圈。
whySwitch: 开关是断开的，回路在开关处断开。
whyCut: 开关合着，但有一段导线断了，回路不完整。
whyShort: 灯泡被导线并联短接，灯灭但电流很大。
docTitle: 简单电路 · 电流要走一圈
:::
