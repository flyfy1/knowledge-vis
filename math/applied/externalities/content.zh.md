---
lang: zh
---

::: strings
back: ← 知识索引
category: 数学基础
stage: 大学
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 外部性与公地悲剧 · 账记在谁头上
tagline: 工厂排污的代价落在别人身上，市场就会多生产；庇古税、产权与协商是把这笔账拉回价格里的几种办法。
docTitle: 外部性与公地悲剧 · 账记在谁头上
:::

## 如果所有成本和好处都由买卖双方自己承担，市场会停在哪里？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 私人市场
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 成本全由自己承担
:::

<b>这一步回答：没有外部性时市场均衡在哪、谁得到多少剩余？</b>需求线（青）表示买者愿意付的价格，供给线（橙）是卖者的边际成本，两线相交处 Q = (a − c)/(b + d)。青色三角是消费者剩余，橙色三角是生产者剩余，二者之和就是社会总剩余——这时市场把它做到了最大。拖动需求（a）和成本（c）。 {#s0e .explain}

::: html step0-2
s0cv: 需求线、供给线和两块剩余三角形
lblA: 需求截距 a
lblC: 成本截距 c
:::

## 生产带来的伤害落在第三方身上，社会成本比私人成本高多少？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 外部成本
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 外部成本
:::

<b>这一步回答：没人付的那部分成本会造成什么？</b>每多生产一件，第三方（邻居、环境）承受 e 的损害，不计入企业成本。红色虚线是“社会边际成本” = 私人成本 + e，红色带是每个产量上的外部损害。市场仍按私人成本决策，停在橙点；社会最优在绿点，更少。拖动外部损害 e。 {#s1e .explain}

::: html step1-2
s1cv: 私人供给线之上的社会边际成本线与外部损害带，标出市场与最优产量
lblE: 每件外部损害 e
:::

## 多生产出来的那一部分，社会损失了多少？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 无谓损失
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 无谓损失
:::

<b>这一步回答：多生产的部分为什么不值得？</b>在最优产量 Q\* 与市场产量 Q<sub>m</sub> 之间，每多一件的社会成本（红线）都高于买者愿付的价格（青线），红色三角就是无谓损失 = ½·e·(Q<sub>m</sub> − Q\*)。其中 Q<sub>m</sub> − Q\* = e/(b + d)：供给线越陡，多生产的越少。拖动 e 与供给斜率 d。 {#s2e .explain}

::: html step2-2
s2cv: 市场产量与最优产量之间的红色无谓损失三角形
lblSlope: 供给斜率 d（×0.1）
:::

## 每件产品征多少税，才能让市场自己停在最优产量？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 庇古税
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 庇古税
:::

<b>这一步回答：税应该定多高？</b>向企业征每件 t 的税，供给线上移 t（绿线），产量降到 Q = (a − c − t)/(b + d)。社会福利 = 总剩余 + 税收 − 外部损害，是 t 的一条抛物线，最高点恰在 t = e——税等于边际外部损害。下面的曲线就是福利随税率的变化；税太低没治够，太高又过头。 {#s3e .explain}

::: html step3-2
s3cv: 上：加税后的供给线与产量；下：社会福利随税率变化，最高点在 t = e
lblTax: 每件税 t
:::

## 人人都能免费用的牧场，会被放牧到什么程度？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 公地悲剧
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 公地悲剧
:::

<b>这一步回答：谁都能用的资源为什么被过度使用？</b>牧场上共 N 头牛，每头牛的收入是 100 − N，成本 20，总利润 N(80 − N)，在 N = 40 最大。m 个牧民各自决定养多少头（每人把别人的数量当作已定）时，总数是 N = 80·m/(m + 1)：m = 1 恰好是最优 40，m 越大越逼近 80，此时总利润降为 0。每多养一头，别人的牛都变瘦，这笔代价他自己不付。拖动牧民人数。 {#s4e .explain}

::: html step4-2
s4cv: 上：总利润随牛数的曲线与均衡点；下：均衡牛数随牧民数增加
lblHerders: 牧民人数 m
:::

## 不用税，当事人自己谈判能解决外部性吗？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 科斯协商
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章 · 科斯协商
:::

<b>这一步回答：谈判能否得出有效结果，权利归谁有关系吗？</b>设工厂排污获利 G，邻居受损 D。若谈判没有成本，无论权利归谁，结果都是“G > D 才排污”，只是谁付钱给谁不同（科斯定理）。选择权利归属、拖动 G 和 D；再把谈判成本 T 拉大：当 |G − D| ≤ T 时谈不成，结果由初始权利决定，可能无效率。 {#s5e .explain}

::: html step5-2
s5cv: 工厂获利 G 与邻居损害 D 的柱形，及协商后的结果和支付
rtNeighbor: 权利归邻居（有权要求不排污）
rtFactory: 权利归工厂（有权排污）
lblG: 工厂获利 G
lblD: 邻居损害 D
lblT: 谈判成本 T
recapTitle: 回顾
recap1: 外部性：一部分成本落在第三方身上，市场按私人成本决策，产量高于社会最优，多出的部分是无谓损失 ½·e·(Q_m − Q\*)。
recap2: 庇古税让税率等于边际外部损害（t = e），把外部成本拉回价格里；公地资源因“人人使用而无人付代价”被过度使用。
recap3: 科斯：谈判无成本时，权利归谁不影响效率，只影响谁付钱；谈判成本高时，初始权利和政策才重要。
modelTitle: 模型范围与局限
modelText: 模型：线性需求与供给、每件外部损害为常数、竞争市场；牧场是 m 个对称牧民的古诺式博弈；科斯例子只有两个当事人且信息完全。真实外部损害很难测量，收入效应、市场势力、信息不对称都被忽略。本页不是环境政策建议。
link0: → 供给与需求：税与补贴的楔子和无谓损失
link1: → 博弈论：各自最优的选择为何合起来不好
link2: → 气候反馈：排放的代价通过气候传给所有人
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
rt_neighbor: 邻居
rt_factory: 工厂
axQ: 产量 Q
axP: 价格 / 成本
lblCS: 消费者剩余
lblPS: 生产者剩余
lblDemand: 需求
lblSupply: 私人供给
s0ro: 均衡 Q = {Q}，P = {P}；消费者剩余 {cs}，生产者剩余 {ps}，总剩余 {tot}。
lblMarket: 市场
lblOptimum: 社会最优
lblSocial: 社会成本
s1ro: e = {e}：市场产量 {Q}（价格 {P}），社会最优 {qs}；多生产 {over}，市场产量上的外部损害总额 e·Q = {dmg}。
lblDwl: 无谓损失
s2ro: e = {e}，d = {d}：多生产 Q_m − Q\* = {over}；无谓损失 = {formula} = {dwl}。
lblTaxSupply: 含税供给 +{t}
axTax: 税率 t
axWelfare: 社会福利
vExact: 税 = 边际外部损害：最优
vUnder: 税偏低
vOver: 税偏高
s3ro: t = {t}，e = {e}：产量 {Q}，社会福利 {W}（最优 {Wopt}，差 {loss}），税收 {rev}；{verdict}。
lblSocialOpt: 社会最优
lblHerd: {n} 位牧民的均衡
axCows: 牛的总数 N
axProfitAll: 总利润
axHerders: 牧民人数 m
axTotalCows: 均衡总牛数
s4ro: m = {m}：均衡总牛数 {N}（最优 {Ns}）；总利润 {pr}（最优 {ps}）。
lblGain: 工厂获利 G
lblDamage: 邻居损害 D
lblPollutes: 结果：排污
lblNoPoll: 结果：不排污
lblPayN: 工厂付给邻居 {v}
lblPayF: 邻居付给工厂 {v}
lblNoPay: 没有付款
bYes: 谈判可行
bNo: 谈判不成
s5ro: G = {G}，D = {D}，权利归{right}，谈判成本 T = {T}（{bargain}）：{out}，社会净得 {total}（最大可能 {best}）。
:::
