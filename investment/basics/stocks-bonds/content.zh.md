---
lang: zh
---

::: strings
back: ← 知识索引
category: 投资
stage: 初中
langLabel: 语言
navLabel: 步骤导航
foot: 教学演示：所有数字均为虚构示例，非投资建议。
pageTitle: 股票与债券 · 买到的到底是什么
tagline: 借钱开店还是分股合资？一张凭证背后，是两种完全不同的权利。
docTitle: 股票与债券 · 买到的到底是什么
:::

## 一家虚构的小店要筹 1000，有哪两种办法？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 筹钱的两条路
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 筹钱的两条路
:::

<b>这一步回答：公司筹钱时，给出的是什么？</b>虚构小店要买一台新烤箱，需要 1000。办法一：把店切成 100 份卖掉，每份 10，买到的人成为股东；办法二：向别人借 1000，写下借条，约定每年付利息、到期还本。点两个按钮，看两种凭证长什么样。 {#s0e .explain}

::: html step0-2
s0cv: 两种筹钱方式的凭证示意
btnStock: 发股票 · 切分所有权
btnBond: 发债券 · 写下借条
:::

::: strings
s0roStock: 卖出 100 份，每份 10：小店拿到 1000，买家成为股东，按份分享利润、共担亏损。
s0roBond: 借入 1000：小店拿到 1000，写下借条，承诺每年付息、到期还本；出借人不是股东。
:::

## 持有 10 份，到底意味着什么？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 股票是所有权
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 股票是所有权
:::

<b>这一步回答：股东的钱从哪里来？</b>店被切成 100 份，你持有 n 份，就是 n% 的主人。店赚了钱，可以拿一部分分红；店的价值涨了，你的份也跟着涨；店亏了，你的份也缩水。拖动份数和每份价格，看你的份额、应得分红和持仓价值。 {#s1e .explain}

::: html step1-2
s1cv: 100 份里你的份额：青色是你的份
lblShares: 持有份数
lblPrice: 每份价格
:::

::: strings
s1ro: 持有 {sh} 份（{pct}%）：店今年利润 1000，分出一半作分红，每份得 5，你得 {div}；按每份 {pr} 算，你的持仓值 {val}。
lblYourSlice: 你的份
lblRest: 其余股东
:::

## 借条上的利息和本金，怎么算？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 债券是借条
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 债券是借条
:::

<b>这一步回答：出借人稳稳拿到的是什么？</b>你借出 1000，借条写明：每年付票息（本金 × 票息率），到期一次性还 1000 本金。只要店不倒，你的现金流就是确定的；但店赚再多，分红也没有你的份。拖动票息率和年数。 {#s2e .explain}

::: html step2-2
s2cv: 借条的时间线：第 0 年借出 1000，之后每年收票息，到期收回本金
lblCouponR: 票息率（%）
lblYears: 年数
:::

::: strings
s2ro: 借出 1000，票息 {cp}%：每年收 {c}，{y} 年共收票息 {tot}，到期再收回本金 1000，合计 {all}（假设店按时付息还本）。
lblLend: 借出
lblCoupon: 票息
lblPrincipal: 本金
:::

## 店只剩一点资产，股东和债主谁先拿？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 店出事了，谁先拿钱？
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 清偿顺序
:::

<b>这一步回答：清偿顺序为什么决定风险？</b>店出事变卖资产，先还债主（借条 1000），剩下的才归股东。资产够还债主还有剩，股东拿剩下的；资产连债主都还不上，股东拿零，债主也只能拿一部分。拖动剩余资产，看这条分界线。 {#s3e .explain}

::: html step3-2
s3cv: 变卖资产的分配：先还债主 1000，剩下的归股东
lblAssets: 剩余资产
:::

::: strings
s3ro: 剩余资产 {a}：债主拿 {b}（借条 1000），股东拿 {s}。{msg}
s3msgFull: 债主全额拿回，剩下的归股东。
s3msgPart: 债主只能拿回一部分，股东拿零。
s3msgZero: 什么都不剩，两边都拿零。
lblLenders: 债主
lblHolders: 股东
lblClaim: 债主应得 1000
:::

## 没有人规定价格，价格是谁定的？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 价格为什么动？
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 价格为什么动
:::

<b>这一步回答：买卖意愿怎样定出价格？</b>价格不是店贴的标签，是买卖双方谈出来的：想买的人多、想卖的人少，价格就被抬上去；反过来就压下来。拖动买家和卖家人数，看玩具价格怎么走——这就是供求那一页讲的机制。 {#s4e .explain}

::: html step4-2
s4cv: 买家与卖家人数对比，玩具价随之上下
lblBuyers: 想买的人数
lblSellers: 想卖的人数
:::

::: strings
s4ro: 买家 {b}，卖家 {s}：买方多 {d} 人，玩具价从 100 走到 {p}。{dir}
s4dirUp: 买的人多，价格被抬上去。
s4dirDown: 卖的人多，价格被压下来。
s4dirFlat: 买卖相当，价格不动。
lblToyPrice: 玩具价
:::

## 一张表，分清股票和债券 {#step5 h2=s5t pre=1}

::: strings
nav5: 5 总结
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 总结
:::

<b>这一步回答：以后看到“股”和“债”，先问哪三个问题？</b>问：买到的是所有权还是债权？出事时排第几？回报从哪里来？股票：所有权、最后拿钱、靠分红和价格涨；债券：债权、先拿钱、靠票息和还本。价格涨跌本身不创造价值，它只是买卖意愿的温度计。 {#s5e .explain}

::: html step5-2
s5cv: 股票与债券对照：身份、清偿顺序、回报来源
recapTitle: 回顾
recap1: 股票 = 所有权凭证：按份当主人，分红、涨跌都按份来；出事时最后拿钱。
recap2: 债券 = 借条：出借人不是主人，按约定收票息、到期收回本金；出事时先于股东拿钱。
recap3: 价格由买卖意愿定：买家多就涨，卖家多就跌；价格本身不是店的价值，只是交易的温度计。
modelTitle: 模型范围与局限
modelText: 模型：虚构小店、虚构金额单位；不含税、手续费、交易成本与破产法律细节；股票价格与分红、债券票息均为示例数字。内容只讲机制，不构成投资建议。
:::

非投资建议：本页只用虚构示例讲清股票与债券的区别，不推荐任何具体产品，也不预测任何价格涨跌。 {#disclaimer .disclaimer i18n=text}

::: html step5-3
licH1: 内容来源
licH2: 说明
licR1a: 定义与讲解
licR1b: 本站原创，依据概念知识重写，未复制任何教材原文。
licR2a: Investor.gov 术语对照
licR2b: 仅对照股票、债券等术语含义，译文标注为译自 Investor.gov；不代表美国证监会认可。
licR3a: OpenStax / Saylor / Khan Academy
licR3b: 教材原文未使用；仅按概念清单对照结构，零句子引用。
licR4a: Wikidata
licR4b: 仅使用结构化数据（条目与属性），未引用文章文本。
licR5a: 数字
licR5b: 全部为手设示例数字，无真实行情、公司与票据。
link0: → 供求：价格怎样由买卖意愿定出来
link1: → 复利与贴现：利息怎样随时间滚大
linkSources: → 投资分册来源与许可总表
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
lblIdentity: 身份
lblOrder: 出事时
lblReturn: 回报来源
lblStockId: 股东 · 按份当主人
lblBondId: 债主 · 出借人
lblStockOrder: 最后拿钱
lblBondOrder: 先于股东拿钱
lblStockRet: 分红 + 价格涨
lblBondRet: 票息 + 到期还本
:::
