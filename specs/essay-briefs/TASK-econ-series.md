# Task: economics / investment knowledge graph (经济 · 投资 概念图谱与文章队列)

Requested by Yangyu on 2026-11-25: "建立非常好的 knowledge graph", this round on 经济/投资. This file is the
architect's plan: the concept map (§1), the trails (§2), reference briefs and the next queue of eight essays
beyond the eleven commissioned (§3), an ownership and cross-link addendum for each commissioned essay A–K (§4),
and what the atlas needs fixed (§5). Writers get their §4 addendum; the registrar gets §1 and §5.

Everything below was checked against the repository on 2026-11-25 (`site-registry.json`, `atlas/data.js`,
`atlas/graph/lessons/*.json`, the pages' `copy.zh.js` / `content.zh.md`). Ids marked **live** exist in the live atlas
under exactly that id. Ids marked **flight** come from an essay in flight: the two drafts (ids from their
`REGISTRY.json`) or a commissioned essay A–K (ids are proposals for the writers). Ids marked **reg** are taught on
an existing page and only need a node. Ids marked **gap** have no owner yet; the queue item N1–N8 follows.

**Numbering, after the second commission of 2026-11-25.** The first version of this plan queued nine items Q1–Q9
after A–D. While it was being written, seven more essays (E–K) were commissioned, and they cover most of that
queue. The Q-briefs in §3 are kept as the architect's reference briefs for those essays (chapter ladders, models
with equations, what to source); where a brief and the lead's commission differ, the commission wins. Wherever
this file says Qn, read it through this table.

| First plan | Now | Note |
|---|---|---|
| Q1 register `supply-demand` concepts | still Q1 | registrar job, no writer |
| Q2 `investment/portfolio/how-much-risk-is-worth-taking` | **N1** (next queue) | minus CAPM and factors, which G took |
| Q3 `economics/money/why-financial-crises-repeat` | **F** `economics/money/why-banks-run` | F takes leverage, runs, 2008, 2023, the lender of last resort; repo, fire sales and contagion go to N4 |
| Q4 `economics/macro/why-economies-boom-and-bust` | **K** `economics/macro/what-makes-prices-rise` | K takes inflation, expectations, deflation; the cycle goes to N3 |
| Q5 `investment/valuation/what-a-share-is-worth` | **G** `investment/basics/what-a-stock-is-worth` | G also takes CAPM, factors, index funds; bubbles and behaviour go to N7 |
| Q6 `economics/trade/what-moves-an-exchange-rate` | **H** `economics/money/what-sets-an-exchange-rate` | |
| Q7 `economics/growth/why-some-countries-got-rich` | **E**, same slug | |
| Q8 `economics/labour/where-wages-come-from` | **N2** (next queue) | unchanged |
| Q9 `economics/money/what-a-stablecoin-is` | **I** `economics/money/what-makes-a-stablecoin-stable` | |
| — | **J** `probability/stochastic/random-walks` | new; it changes who owns the random walk (§4.J) |

## Status (2026-11-25)

| | Page | State |
|---|---|---|
| live | `economics/macro/how-an-economy-is-measured`, `economics/money/{where-money-comes-from, why-one-rate-moves-everything, where-a-mortgage-payment-goes}`, `demos/scarcity-moves`, six `investment/{basics,rates}` lessons, `math/applied/{supply-demand, externalities, game-theory, prisoners-dilemma, auction-basics, mechanism-design}`, `probability/stochastic/risk-pooling` | registered |
| draft | `investment/derivatives/a-fair-price-for-a-bet` (12 concepts), `economics/markets/why-a-few-firms-win` (12 concepts) | being finished |
| A | `economics/public-finance/can-a-country-go-bankrupt` | in flight; ten chapters drafted (seen 2026-11-25), `REGISTRY.json` concepts still empty |
| B | `investment/rates/what-the-yield-curve-says` | in flight; first chapter (零息债券) drafted, concepts empty |
| C | `economics/trade/who-pays-a-tariff` | in flight; ten chapters drafted, concepts empty |
| D | `economics/markets/when-buyers-cant-see-quality` | in flight; models only, no prose yet |
| E–K | seven essays commissioned on 2026-11-25 (table above); no directories yet when this was written | commissioned; addenda in §4.E–§4.K |
| Q1 | register-only: three concepts on the existing `supply-demand` lesson (§3) | proposed |
| N1–N8 | the next queue, beyond A–K (§3.11) | proposed, not commissioned |

## The three findings that shape the plan

1. **The existing economics essays are in the atlas as islands.** 30 economics nodes have no edge at all: all
   12 chapters of `why-one-rate-moves-everything`, 14 of the 15 of `scarcity-moves`, plus `money-as-iou`,
   `bank-run`, `apr-irr-flat-fee` and `reading-a-loan-contract`. The graph has the nodes and none of the reasoning
   between them. Fixing this costs zero new nodes and is worth more than any single new essay (§5.1 lists 57
   edges, each checked as absent from `atlas/data.js`).
2. **The commissioned essays land on ground that is already owned, and the drafts show it.**
   `why-one-rate-moves-everything` owns duration and convexity (#ch2), bootstrapping the curve (#ch3), the
   expectations hypothesis, term premium and inversion (#ch4), and r − g (#ch11). `scarcity-moves` owns
   comparative advantage (#c3). The lesson `math/applied/supply-demand` teaches the tax wedge with its deadweight
   loss (#step1), point elasticity (#step2) and surplus (#step3). `risk-pooling` #step4 already asks
   "为什么只有高风险的人留在保险里". As drafted on 2026-11-25, A's #ch3 restates the r − g equation, B opens on
   zero-coupon bonds, and C's first chapter is elasticity and its #ch4 is comparative advantage. None of that
   needs deleting. Each such chapter should shrink to what the essay needs, link the owner, and **not** become a
   second concept node: the registrar attaches it to the existing node as an additional lesson. §4 says which
   chapters.
3. **Concept count needs a cap even though the index now has room.** When this plan was started,
   `atlas-index.js` was 152,887 bytes for 891 nodes against a 160,000 limit. The compression agent's working tree
   now has it at 115,425 bytes (about 130 bytes a node, measured 2026-11-25, not yet committed): room for roughly
   340 more nodes. This plan adds about 110 (§5.3), which fits. The cap of 8–9 registered concepts per essay
   stays, because a region of 200 nodes is only readable if each node is a concept someone would look up.

Both items the 2026-11-11 audit listed as missing prerequisites are taught on the site and are missing only
from the graph. 通胀怎么测量 is owned by `how-an-economy-is-measured` #ch2–#ch3 (`price-indexes-chain-fisher`,
`cpi-oer-hedonic-core`); it needs aliases. 弹性与边际收益: elasticity is `supply-demand` #step2, marginal revenue
and MR = MC are the draft `why-a-few-firms-win` #ch1 (written there as 边际收入). Neither has a concept node or an
alias, which is why search does not find them. Q1 is therefore a registration job, not an essay.

---

## 1. The concept map

181 concepts in 12 clusters, which is more than the 60–120 asked for, because the map lists every existing node
the new ones depend on. 61 exist today and only need edges. 24 arrive with the two drafts. 3 are registered on an
existing lesson (Q1). 70 belong to the eleven commissioned essays (A 7, B 8, C 6, D 8, E 6, F 6, G 7, H 7, I 5,
J 4, K 6; frontier concepts not counted; B's and D's are the writers' own ids). 23 are gaps: 19 owned by the
next queue and 4 that B's and D's drafts turned out not to cover. N3, N5, N6 and N8 name further ids in their
briefs only. Clusters are an editorial
grouping for this plan; in the atlas every one of these sits in the single region `society` (see §5.4).

Edge notation is the importer's: `prerequisite>node:type`, types `foundation` (F), `application` (A),
`connection` (C), `representation` (R). The "needs first" column lists the prerequisite side only; an entry such
as `supply-demand:F` in the row of `price-elasticity` means the edge `supply-demand>price-elasticity:foundation`.

### 1.1 Micro and markets (微观与市场)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `opportunity-cost` | 稀缺与机会成本 / Scarcity and opportunity cost | — | **live** scarcity-moves #c1 |
| `marginal-thinking` | 边际 / Thinking at the margin | `opportunity-cost:F` | **live** scarcity-moves #c2 |
| `sunk-cost` | 沉没成本 / Sunk cost | `marginal-thinking:C` | **live** scarcity-moves #c2 |
| `price-signal` | 价格是一条信息 / Prices as information | `opportunity-cost:F` | **live** scarcity-moves #c4 |
| `incentives` | 激励 / Incentives | `price-signal:C` | **live** scarcity-moves #c5 |
| `supply-demand` | 供需均衡 / Supply and demand | `price-signal:R`, `marginal-thinking:F`, `slope:F` | **live** math/applied/supply-demand #step0 |
| `price-elasticity` | 价格弹性 / Price elasticity | `supply-demand:F`, `derivative:C`, `exp-log:C` | **reg** Q1: new node on the existing lesson, math/applied/supply-demand #step2; C's #elasticity chapter attaches as a second lesson |
| `consumer-producer-surplus` | 消费者剩余与生产者剩余 / Consumer and producer surplus | `supply-demand:F`, `integral:C` | **reg** Q1: math/applied/supply-demand #step3 |
| `tax-wedge-deadweight-loss` | 税的楔子与无谓损失 / The tax wedge and deadweight loss | `supply-demand:F`, `consumer-producer-surplus:C` | **reg** Q1: math/applied/supply-demand #step1 |
| `price-controls-shortage` | 限价、短缺与排队 / Price controls and shortages | `consumer-producer-surplus:F`, `price-elasticity:F` | **gap** N5 |
| `market-failure` | 市场会失灵 / Market failure | `incentives:F` | **live** scarcity-moves #c6 |
| `externalities` | 外部性与公地悲剧 / Externalities | `market-failure:A`, `supply-demand:F` (exists) | **live** math/applied/externalities #step3 |
| `game-theory` | 博弈论 / Game theory | — | **live** math/applied/game-theory #step0 |
| `prisoners-dilemma` | 囚徒困境 / Prisoner's dilemma | `game-theory:F` (exists) | **live** math/applied/prisoners-dilemma #step3 |
| `auctions`, `mechanism-auction` | 拍卖、机制设计 / Auctions, mechanism design | `game-theory:F` | **live** math/applied/auction-basics, mechanism-design |
| `monopoly-pricing-lerner` | 垄断定价、边际收入与勒纳指数 / Monopoly pricing, marginal revenue | `price-elasticity:F`, `marginal-thinking:F`, `supply-demand:F` | **flight** why-a-few-firms-win #ch1 (owns 边际收入 / 边际收益 / MR = MC as aliases) |
| `minimum-efficient-scale-natural-monopoly` | 最小有效规模与自然垄断 | `monopoly-pricing-lerner:C` | **flight** why-a-few-firms-win #ch2 |
| `cournot-bertrand-hhi` | 寡头：古诺、伯特兰与 HHI | `monopoly-pricing-lerner:F`, `game-theory:F` | **flight** why-a-few-firms-win #ch3 |
| `network-effects-critical-mass` | 网络效应与临界规模 | `logistic-growth:C` | **flight** why-a-few-firms-win #ch5 |
| `lock-in-switching-costs` | 锁定与转换成本 | `network-effects-critical-mass:F`, `sunk-cost:C` | **flight** why-a-few-firms-win #ch6 |
| `two-sided-platforms` | 双边平台定价 | `network-effects-critical-mass:F`, `price-elasticity:C` | **flight** why-a-few-firms-win #ch7 |
| `data-feedback-loops` | 数据回路与学习曲线 | `network-effects-critical-mass:C` | **flight** why-a-few-firms-win #ch8 |
| `measuring-market-power` | 测量市场势力 | `monopoly-pricing-lerner:A`, `cournot-bertrand-hhi:A` | **flight** why-a-few-firms-win #ch11 |
| `lemons-market` | 逆向选择与柠檬市场 / Adverse selection | `risk-pooling:F`, `expected-value:F`, `market-failure:A` | **flight** D |
| `insurance-death-spiral` | 保险的死亡螺旋 / The insurance death spiral | `lemons-market:A`, `risk-pooling:F` | **flight** D |
| `signaling` | 信号：昂贵才可信 / Signalling | `lemons-market:F`, `bayes:C` | **flight** D |
| `deductible-screening` | 甄别：用一张菜单让人自己分开 / Screening | `lemons-market:F`, `mechanism-auction:C` | **flight** D |
| `moral-hazard` | 道德风险 / Moral hazard | `incentives:F`, `risk-pooling:C` | **flight** D |
| `principal-agent-contract` | 委托代理与激励合同 / Principal and agent | `moral-hazard:F`, `goodharts-law:C` | **gap**: not in D's draft; D if it adds a section (§4.D), otherwise unowned |
| `certainty-equivalent-insurance` | 风险厌恶与确定性等价：为什么买"平均亏钱"的保险 / Risk aversion and the certainty equivalent | `expected-value:F`, `risk-return:C` | **flight** D #ch1 |
| `credit-score` | 信用分是怎么来的 / How a credit score is built | `credit-rationing:F`, `bayes:F`, `goodharts-law:C` | **flight** D #ch9 |
| `credit-rationing` | 信贷配给 / Credit rationing | `lemons-market:A`, `moral-hazard:A`, `interest-price-of-time:F` | **flight** D |
| `reputation-ratings-certification` | 声誉、评级与认证 / Reputation and certification | `signaling:C`, `prisoners-dilemma:C` | **gap**: not in D's draft; D if it adds a section, otherwise unowned |

The remaining four draft concepts of `why-a-few-firms-win` (`free-entry-contestability`, `tying-self-preferencing`,
`interoperability-multihoming`, `ai-stack-antitrust`) are in the map by reference; nothing else depends on them.

### 1.2 Money and banking (货币与银行)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `money-as-iou` | 钱是一张人人都收的欠条 | `institutions-trust:C` | **live** where-money-comes-from #ch1 |
| `loans-create-deposits` | 贷款创造存款 | `money-as-iou:F`, `spending-is-income:C` | **live** #ch2 |
| `bank-run` | 银行挤兑与存款保险 | `loans-create-deposits:F`, `game-theory:C` | **live** #ch3 |
| `quantity-theory-inflation` | 货币数量与通胀 | `loans-create-deposits:F` | **live** #ch4 |
| `inflation-winners-losers` | 通胀的赢家和输家 | `quantity-theory-inflation:F` (exists) | **live** #ch5 |
| `interest-price-of-time` | 利息是时间的价格 | `compound-interest:F` (exists), `opportunity-cost:C` | **live** #ch6 |
| `monetary-transmission` | 利率传导与时滞 | (exists) | **live** #ch8 |
| `reserves-floor-system` | 准备金、利率走廊与地板体系 | `loans-create-deposits:F` | **live** why-one-rate #ch5 |
| `taylor-rule-neutral-rate` | 泰勒规则与 r* | `reserves-floor-system:C`, `business-cycle-sahm-potential:F`, `cpi-oer-hedonic-core:F` | **live** why-one-rate #ch6 |
| `new-keynesian-model` | 新凯恩斯模型与菲利普斯曲线 | `taylor-rule-neutral-rate:F`, `monetary-transmission:C`, `labour-u3-u6-beveridge-okun:C` | **live** why-one-rate #ch7 |
| `zero-lower-bound-qe` | 零利率下限、前瞻指引与 QE | `new-keynesian-model:F`, `term-premium-curve-inversion:C` | **live** why-one-rate #ch10 |
| `central-banks-2026` | 2026 年底的主要央行 | `taylor-rule-neutral-rate:A`, `zero-lower-bound-qe:A` | **live** why-one-rate #ch12 |
| `money-hierarchy-settlement` | 钱的层级与结算 / The hierarchy of money | `money-as-iou:F`, `reserves-floor-system:F` | **flight** I |

### 1.3 Macro and policy (宏观与政策)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `spending-is-income` | 你的支出是别人的收入 | — | **live** scarcity-moves #c8 |
| `gdp-three-ways` | GDP 三面等价与增加值 | `spending-is-income:F` | **live** how-an-economy-is-measured #ch1 |
| `price-indexes-chain-fisher` | 名义与实际、链式指数 | (exists) | **live** #ch2 |
| `cpi-oer-hedonic-core` | CPI 权重、OER 与质量调整 | (exists) | **live** #ch3 |
| `labour-u3-u6-beveridge-okun` | 失业率、贝弗里奇曲线与奥肯定律 | (exists) | **live** #ch6 |
| `business-cycle-sahm-potential` | 经济周期、潜在产出与萨姆规则 | (exists) | **live** #ch7 |
| `aggregate-demand-supply-shocks` | 需求冲击与供给冲击 / Demand and supply shocks | `supply-demand:C`, `business-cycle-sahm-potential:F` | **flight** K (as the two kinds of inflation; N3 reuses it for the cycle and links) |
| `inflation-expectations-anchoring` | 通胀预期与锚定 / Inflation expectations | `new-keynesian-model:F`, `quantity-theory-inflation:C` | **flight** K |
| `phillips-curve-slope-evidence` | 菲利普斯曲线有多陡：证据 / The Phillips curve in the data | `new-keynesian-model:F`, `labour-u3-u6-beveridge-okun:F` | **flight** K |
| `wage-price-spiral-disinflation` | 工资–物价螺旋与降通胀的代价 / Wage–price spiral, sacrifice ratio | `inflation-expectations-anchoring:F`, `labour-u3-u6-beveridge-okun:F` | **flight** K |
| `deflation-debt-deflation` | 通缩与债务通缩 / Deflation and debt deflation | `inflation-winners-losers:F`, `zero-lower-bound-qe:C` | **flight** K |
| `hyperinflation-seigniorage` | 恶性通胀与铸币税 / Hyperinflation and seigniorage | `quantity-theory-inflation:F`, `inflation-expectations-anchoring:F` | **flight** K |
| `multiplier-accelerator-cycle` | 乘数–加速数：周期为什么会自己摆 / Why cycles oscillate | `fiscal-multiplier:F`, `poles:C`, `feedback:C` | **gap** N3 |

### 1.4 Public finance (公共财政)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `debt-dynamics-r-minus-g` | 政府债务动态与 r − g | `compound-interest:F`, `gdp-three-ways:F` | **live** why-one-rate #ch11 |
| `deficit-primary-balance` | 赤字是流量，债务是存量；基本赤字 / Deficit, debt, primary balance | `gdp-three-ways:F`, `debt-dynamics-r-minus-g:C` | **flight** A #ch2 (and #ch1's household comparison) |
| `public-debt-holders-currency` | 欠谁的，用什么钱欠 / Who holds the debt, in which currency | `deficit-primary-balance:F`, `inflation-winners-losers:F`, `zero-lower-bound-qe:C` | **flight** A #ch4 |
| `sovereign-default-restructuring` | 主权违约长什么样 / What a sovereign default looks like | `public-debt-holders-currency:F`, `debt-dynamics-r-minus-g:F`, `bank-run:C` | **flight** A #ch5 |
| `pension-paygo-dependency` | 现收现付养老金与抚养比 / Pay-as-you-go pensions | `deficit-primary-balance:C`, `risk-pooling:C` | **flight** A #ch6 |
| `retirement-age-levers` | 延迟退休动的是哪根杠杆 / What raising the retirement age changes | `pension-paygo-dependency:F` | **flight** A #ch7 |
| `fiscal-multiplier` | 财政乘数 / The fiscal multiplier | `spending-is-income:F`, `gdp-three-ways:F`, `debt-dynamics-r-minus-g:C` | **flight** A #ch8 |
| `debt-sustainability-fan-chart` | 债务可持续性是一把扇子 / Debt sustainability under uncertainty | `debt-dynamics-r-minus-g:F`, `montecarlo:F` | **flight** A, only if A adds it to #ch3 (recommended, §4.A) |

A's #ch3 (r − g) is not a new concept: it attaches to `debt-dynamics-r-minus-g` as a second lesson.

### 1.5 Trade and international (贸易与国际)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `comparative-advantage` | 交换与比较优势 | `opportunity-cost:F` | **live** scarcity-moves #c3; C #ch4 attaches as a second lesson |
| `purchasing-power-parity` | 购买力平价与汇率 | (exists) | **live** where-money-comes-from #ch9 |
| `ppp-balassa-samuelson-gini` | PPP、巴拉萨–萨缪尔森与基尼 | (exists) | **live** how-an-economy-is-measured #ch5 |
| `interest-parity-carry-trade` | 利率平价与套利交易 | `purchasing-power-parity:C`, `yield-curve-bootstrapping:C` | **live** why-one-rate #ch9 |
| `tariff-incidence-pass-through` | 关税是一道楔子：归宿与传导 / Tariff incidence and pass-through | `price-elasticity:F`, `tax-wedge-deadweight-loss:F`, `supply-demand:F` | **flight** C #ch2 (with #elasticity as its lead-in) |
| `tariff-welfare-accounting` | 关税的全国账本：谁得、谁失、谁白白消失 / The welfare accounting of a tariff | `tariff-incidence-pass-through:F`, `consumer-producer-surplus:F` | **flight** C #ch3 |
| `saving-investment-current-account` | 储蓄 − 投资 = 经常账户 / S − I = CA | `gdp-three-ways:F` | **flight** C #ch5 |
| `tariff-offsets-currency-retaliation-diversion` | 三个抵消：汇率、报复和改道 / Currency offset, retaliation, diversion | `tariff-incidence-pass-through:F`, `purchasing-power-parity:C`, `prisoners-dilemma:C` | **flight** C #ch6 |
| `export-controls-chokepoints` | 出口管制与卡脖子点 / Export controls and chokepoints | `tariff-welfare-accounting:C`, `monopoly-pricing-lerner:C`, `euv-lithography:C` | **flight** C #ch7 |
| `measuring-tariff-pass-through` | 怎么量出"谁付的" / Measuring who paid | `tariff-incidence-pass-through:A`, `regression-correlation:F` | **flight** C #ch8 |
| `balance-of-payments` | 国际收支 / Balance of payments | `saving-investment-current-account:F` | **flight** H |
| `exchange-rate-overshooting` | 汇率为什么反应过度 / Overshooting | `interest-parity-carry-trade:F`, `purchasing-power-parity:F` | **flight** H |
| `trilemma-exchange-rate-regimes` | 不可能三角与汇率制度 / The trilemma | `interest-parity-carry-trade:F`, `reserves-floor-system:C` | **flight** H |
| `currency-crisis-speculative-attack` | 货币危机与投机攻击 / Currency crises | `trilemma-exchange-rate-regimes:F`, `bank-run:C` | **flight** H |
| `foreign-currency-debt-balance-sheet` | 外币债与资产负债表效应 / Foreign-currency debt | `currency-crisis-speculative-attack:C`, `public-debt-holders-currency:F` | **flight** H |
| `rmb-fixing-managed-float` | 人民币中间价与有管理的浮动 / The RMB fixing | `trilemma-exchange-rate-regimes:A` | **flight** H |
| `reserve-currency-dollar` | 储备货币与美元 / Reserve currencies | `balance-of-payments:F`, `money-hierarchy-settlement:C` | **flight** H |

### 1.6 Growth (增长)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `growth-from-ideas` | 增长来自思想 | — | **live** scarcity-moves #c7 |
| `solow-growth-accounting-tfp` | 增长核算与 TFP | `growth-from-ideas:C`, `price-indexes-chain-fisher:F` (exists) | **live** how-an-economy-is-measured #ch8 |
| `institutions-trust` | 制度与信任 | — | **live** scarcity-moves #c10 |
| `solow-steady-state-convergence` | 索洛稳态与追赶 / Steady state and convergence | `solow-growth-accounting-tfp:F`, `compound-interest:C`, `ode-phase-portraits:C` | **flight** E |
| `ideas-nonrival-increasing-returns` | 思想的非竞争性与规模报酬递增 / Non-rival ideas | `growth-from-ideas:F`, `solow-steady-state-convergence:F` | **flight** E |
| `wrights-law-cost-curve` | 莱特定律：累计产量翻倍，成本降一截 / Wright's law | `exp-log:F`, `data-feedback-loops:C` | **flight** E |
| `demographics-dependency-growth` | 人口结构与增长 / Demographics and growth | `solow-steady-state-convergence:C`, `pension-paygo-dependency:C`, `retirement-age-levers:C` | **flight** E |
| `institutions-growth-evidence` | 制度与增长的证据 / Institutions and growth | `institutions-trust:F`, `regression-correlation:F` | **flight** E |
| `ai-productivity-frontier` | AI 会不会抬高增长率 / Will AI raise growth | `ideas-nonrival-increasing-returns:A`, `ai-cheap-thinking:C` | **flight** E |

### 1.7 Labour and the economics of AI (劳动与 AI 经济学)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `income-to-the-scarce` | 收入流向稀缺的一方 | `opportunity-cost:F` | **live** scarcity-moves #c9 |
| `ai-cheap-thinking` | AI：思考的价格崩塌 | `income-to-the-scarce:C` | **live** scarcity-moves #c11 |
| `ai-tasks-wages` | AI 替代的是任务 | `income-to-the-scarce:F` | **live** scarcity-moves #c12 |
| `relative-prices-after-ai` | 什么变便宜，什么变贵 | `ai-cheap-thinking:F` | **live** scarcity-moves #c13 |
| `wage-marginal-product` | 工资与边际产出 / Wages and marginal product | `supply-demand:F`, `marginal-thinking:F`, `income-to-the-scarce:C` | **gap** N2 |
| `monopsony-minimum-wage` | 买方垄断与最低工资 / Monopsony and the minimum wage | `wage-marginal-product:F`, `tax-wedge-deadweight-loss:C`, `monopoly-pricing-lerner:C` | **gap** N2 |
| `skill-premium-education-race` | 技能溢价：教育与技术的赛跑 / The skill premium | `wage-marginal-product:F` | **gap** N2 |
| `task-displacement-reinstatement` | 任务模型：替代效应与生产率效应 / The task model | `ai-tasks-wages:F`, `wage-marginal-product:F` | **gap** N2 |
| `baumol-cost-disease` | 鲍莫尔成本病 / Baumol's cost disease | `relative-prices-after-ai:F`, `wage-marginal-product:F` | **gap** N2 |
| `ai-labour-evidence-frontier` | AI 与就业的证据 / Evidence on AI and jobs | `task-displacement-reinstatement:A`, `hypothesis-testing:C` | **gap** N2 |

### 1.8 Finance foundations and personal finance (金融基础与个人理财)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `compound-interest` | 复利与贴现 | `exp-log:F` | **live** investment/rates/compound-interest #step1 |
| `fees-compounding` | 费率与复利 | `compound-interest:F` (exists) | **live** investment/rates/fees-compounding |
| `present-value-discounting` | 折现 | `compound-interest:F`, `interest-price-of-time:F` | **live** why-one-rate #ch1 |
| `stocks-bonds` | 股票与债券 | — | **live** investment/basics/stocks-bonds |
| `risk-return` | 风险与回报 | `stocks-bonds:F`, `variance:F`, `expected-value:F` (exist) | **live** investment/basics/risk-return |
| `diversification` | 分散投资 | `risk-return:F`, `regression-correlation:F` (exists) | **live** investment/basics/diversification |
| `interest-rates-bonds` | 利率升，债价跌 | `compound-interest:F`, `stocks-bonds:F` (exist) | **live** investment/rates/interest-rates-bonds |
| `nominal-vs-effective-rate` | 名义与实际年利率 | `compound-interest:F` (exists), `exp-log:F` | **live** where-a-mortgage-payment-goes #ch1 |
| `annuity-payment-formula`, `amortisation-schedule`, `mortgage-prepayment`, `floating-rate-reset` | 月供、还款表、提前还款、浮动利率 | (exist) | **live** where-a-mortgage-payment-goes #ch2–#ch6 |
| `apr-irr-flat-fee` | 真实年利率：IRR | `annuity-payment-formula:F`, `fees-compounding:C` | **live** where-a-mortgage-payment-goes #ch7 |
| `inflation-opportunity-cost-loan` | 通胀、实际利率与提前还贷的机会成本 | (exists) | **live** where-a-mortgage-payment-goes #ch8 |
| `risk-pooling` | 风险池化与保险 | `expected-value:F`, `variance:F` (exists) | **live** probability/stochastic/risk-pooling |

Personal finance has no essay in the queue below. Its missing concepts (生命周期储蓄, 收益顺序风险, 年金与长寿风险, 应急金)
belong to N6 (§3.11), which comes after N1 because every one of them rests on N1 and on A's pension chapter.

### 1.9 Rates and credit (利率与信用)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `bond-duration-convexity` | 久期与凸性 | `present-value-discounting:F`, `interest-rates-bonds:F`, `derivative:C` | **live** why-one-rate #ch2 |
| `yield-curve-bootstrapping` | 收益率曲线、即期与远期利率 | `bond-duration-convexity:F` | **live** why-one-rate #ch3 |
| `term-premium-curve-inversion` | 预期假说、期限溢价与倒挂 | `yield-curve-bootstrapping:F`, `risk-return:C` | **live** why-one-rate #ch4 |
| `equity-duration-house-affordability` | 股票久期与房贷可负担性 | `present-value-discounting:A`, `stocks-bonds:F`, `annuity-payment-formula:C` | **live** why-one-rate #ch8 |
| `level-slope-curvature` | 曲线的三种动法：水平、斜率、曲度 / Level, slope, curvature | `yield-curve-bootstrapping:F`, `eigen:C` | **flight** B |
| `inversion-decomposition` | 倒挂预测衰退：记录、误报与基础比率 / Inversion as a recession signal | `term-premium-curve-inversion:F`, `business-cycle-sahm-potential:F`, `base-rate-neglect:C` | **flight** B |
| `term-premium-acm-kim-wright` | 期限溢价量不出来，只能估 / Estimating the term premium | `term-premium-curve-inversion:F`, `regression-correlation:C` | **flight** B |
| `real-yield-breakeven-inflation` | 实际收益率与盈亏平衡通胀 / Real yields, breakeven inflation | `yield-curve-bootstrapping:F`, `cpi-oer-hedonic-core:F` | **gap**: not in B's draft; B if it adds it (§4.B), otherwise K |
| `duration-supply-demand` | 谁在买长债：久期的供给与需求 / Supply and demand for duration | `term-premium-curve-inversion:F`, `zero-lower-bound-qe:C`, `public-debt-holders-currency:C` | **gap**: not in B's draft; B if it adds it, otherwise unowned |
| `curve-builder-observational-equivalence` | 同一条曲线，两种讲法：预期还是溢价 / One curve, two stories | `term-premium-curve-inversion:F` | **flight** B #ch3 |
| `holding-period-return-rolldown` | 远期不是预报：持有期回报与骑乘 / Holding-period return and roll-down | `yield-curve-bootstrapping:F` | **flight** B #ch4 |
| `immunisation-barbell-bullet` | 免疫、哑铃与子弹 / Immunisation, barbell and bullet | `bond-duration-convexity:F` | **flight** B #ch7 |
| `credit-spread-triangle` | 信用利差 = 违约概率 × 损失 + 补偿 / Credit spreads | `yield-curve-bootstrapping:F`, `expected-value:F`, `risk-return:C` | **flight** B |
| `junk-bonds-default-clustering` | 评级、垃圾债和扎堆的违约 / Ratings, junk bonds, clustered defaults | `credit-spread-triangle:F`, `markov-chains:C` | **flight** B #ch11 |

### 1.10 Asset pricing (资产定价)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `mean-variance-efficient-frontier` | 均值–方差与有效前沿 / The efficient frontier | `diversification:F`, `variance:F`, `vectors:C` | **gap** N1 |
| `sharpe-ratio-capital-market-line` | 夏普比率与资本市场线 / Sharpe ratio | `mean-variance-efficient-frontier:F`, `risk-return:F` | **gap** N1 |
| `capm-beta` | CAPM 与贝塔 / CAPM and beta | `risk-return:F`, `diversification:F`, `regression-correlation:F` | **flight** G |
| `factor-models-alpha` | 因子模型与阿尔法 / Factors and alpha | `capm-beta:F`, `multiple-comparisons:C` | **flight** G |
| `estimation-error-portfolio` | 估计误差：最优组合为什么不稳 / Estimation error | `mean-variance-efficient-frontier:A`, `small-sample-variability:F` | **gap** N1 |
| `volatility-drag-geometric-return` | 波动拖累：算术平均与几何平均 / Volatility drag | `compound-interest:F`, `variance:F` | **gap** N1 |
| `kelly-criterion` | 凯利公式：下多大注 / The Kelly criterion | `volatility-drag-geometric-return:F`, `expected-value:F`, `exp-log:C` | **gap** N1 |
| `dcf-valuation` | 现金流折现估值 / Discounted cash flow | `present-value-discounting:F`, `equity-duration-house-affordability:F` | **flight** G |
| `valuation-multiples-pe` | 市盈率到底在说什么 / What a P/E says | `dcf-valuation:F` | **flight** G |
| `equity-risk-premium` | 股权风险溢价 / The equity risk premium | `dcf-valuation:F`, `risk-return:F` | **flight** G |
| `efficient-markets-random-walk` | 有效市场 / Efficient markets | `random-walk-sqrt-t:F`, `dcf-valuation:C` | **flight** G |
| `random-walk-sqrt-t` | 随机游走与 √t / The random walk and √t | `variance:F`, `binomial-normal:F`, `markov-chains:C` | **flight** J |
| `brownian-motion-diffusion` | 布朗运动与扩散 / Brownian motion | `random-walk-sqrt-t:F`, `gaussian:F` | **flight** J |
| `gamblers-ruin-first-passage` | 赌徒破产与首次到达 / Gambler's ruin, first passage | `random-walk-sqrt-t:F`, `expected-value:F` | **flight** J |
| `fat-tails-levy-stable` | 肥尾：方差不够用的时候 / Fat tails | `brownian-motion-diffusion:F`, `mean-vs-median-long-tail:C` | **flight** J |
| `active-management-arithmetic` | 主动管理的算术 / The arithmetic of active management | `efficient-markets-random-walk:A`, `fees-compounding:F`, `survivorship-bias:F` | **flight** G |
| `bubbles-limits-to-arbitrage` | 泡沫与套利的限度 / Bubbles and limits to arbitrage | `efficient-markets-random-walk:F`, `dcf-valuation:F` | **gap** N7 |
| `prospect-theory-loss-aversion` | 前景理论与损失厌恶 / Prospect theory | `expected-value:F`, `risk-return:C` | **gap** N7 |

### 1.11 Derivatives and risk transfer (衍生品)

All twelve are **F**, owned by `a-fair-price-for-a-bet` under the ids in its `REGISTRY.json`: `forward-price-cost-of-carry`
(#ch1), `option-payoffs-put-call-parity` (#ch2), `binomial-replication-risk-neutral` (#ch3), `crr-binomial-tree`
(#ch4), `geometric-brownian-motion` (#ch5), `black-scholes-formula-pde` (#ch6), `greeks-delta-hedging` (#ch7),
`implied-volatility-smile-fat-tails` (#ch8), `heston-stochastic-volatility` and `margin-leverage-central-clearing`
(#ch9), `hedging-basis-risk-notional` (#ch10), `derivatives-frontier-2026` (#ch11). Edges into the cluster:
`present-value-discounting>forward-price-cost-of-carry:F`, `stocks-bonds>option-payoffs-put-call-parity:F`,
`expected-value>binomial-replication-risk-neutral:C`, `binomial-normal>crr-binomial-tree:C`,
`gaussian>geometric-brownian-motion:F`, `markov-chains>geometric-brownian-motion:C`,
`derivative>greeks-delta-hedging:F`, `risk-pooling>hedging-basis-risk-notional:C`. No new derivatives essay is
proposed: swaps and credit derivatives appear inside B (credit spreads) and Q3 (securitisation).

### 1.12 Financial stability and digital money (金融稳定与数字货币)

| id | zh / en | needs first | owner |
|---|---|---|---|
| `leverage-balance-sheet` | 杠杆：自有资金撬动多大一张表 / Leverage | `stocks-bonds:F`, `risk-return:F`, `margin-leverage-central-clearing:C` | **flight** F |
| `maturity-liquidity-transformation` | 期限错配与流动性转换 / Maturity transformation | `bank-run:F`, `yield-curve-bootstrapping:C` | **flight** F |
| `bank-run-diamond-dybvig` | 挤兑的两种均衡：戴蒙德–迪布维格 / Diamond–Dybvig | `bank-run:F`, `game-theory:F` | **flight** F |
| `interest-rate-risk-banking-book` | 没亏在贷款上，亏在利率上 / Rate risk on a bank's book | `bond-duration-convexity:F`, `leverage-balance-sheet:F` | **flight** F |
| `collateral-haircut-repo` | 抵押品、折扣率与回购 / Collateral, haircuts, repo | `leverage-balance-sheet:F`, `margin-leverage-central-clearing:F` | **gap** N4 |
| `fire-sales-liquidity-spiral` | 甩卖与流动性螺旋 / Fire sales | `collateral-haircut-repo:F`, `feedback:C`, `supply-demand:C` | **gap** N4 |
| `securitisation-shadow-banking` | 证券化与影子银行 / Securitisation | `maturity-liquidity-transformation:F`, `diversification:F`, `lemons-market:C` | **flight** F if its 2008 chapter builds the tranche model; otherwise **gap** N4 |
| `credit-cycle-minsky` | 信贷周期与明斯基时刻 / The credit cycle | `leverage-balance-sheet:F`, `loans-create-deposits:F` | **gap** N4 |
| `contagion-financial-network` | 传染：一家倒下怎么带倒别家 / Contagion | `fire-sales-liquidity-spiral:F`, `graph-algorithms:C` | **gap** N4 |
| `capital-requirements-lender-of-last-resort` | 资本要求、最后贷款人与救助的代价 / Capital rules and the lender of last resort | `leverage-balance-sheet:F`, `bank-run:F`, `moral-hazard:F` | **flight** F |
| `stablecoin-peg-reserves` | 稳定币怎么守住 1 块钱 / How a stablecoin holds its peg | `money-hierarchy-settlement:F`, `bank-run:F` | **flight** I |
| `stablecoin-run-depeg` | 脱锚与挤兑 / Depegs and runs | `stablecoin-peg-reserves:F`, `fire-sales-liquidity-spiral:C`, `maturity-liquidity-transformation:C` | **flight** I |
| `cbdc-design` | 央行数字货币的设计选择 / CBDC design | `money-hierarchy-settlement:F`, `loans-create-deposits:F` | **flight** I |
| `payment-rails-settlement-finality` | 一笔付款怎么结清 / How a payment settles | `money-hierarchy-settlement:F` | **flight** I |

### 1.13 Cross-domain edges (to pages that exist today)

These are the edges that tie economics into the rest of the site. All target ids are live.

| from (exists) | to | type | why |
|---|---|---|---|
| `exp-log` (math/algebra/exponents-logarithms) | `compound-interest`, `nominal-vs-effective-rate`, `price-elasticity`, `wrights-law-cost-curve`, `kelly-criterion` | F / C | doubling time, log-log slopes, log utility |
| `derivative` (math/calculus/derivative) | `price-elasticity`, `bond-duration-convexity`, `greeks-delta-hedging` | F | each is a derivative with a unit attached |
| `integral` | `consumer-producer-surplus` | C | surplus is an area |
| `ode-phase-portraits` | `solow-steady-state-convergence`, `multiplier-accelerator-cycle` | C | steady states, spirals |
| `poles`, `feedback` (engineering/control) | `multiplier-accelerator-cycle`, `fire-sales-liquidity-spiral`, `taylor-rule-neutral-rate` | C | a damped or unstable second-order loop; policy as a feedback rule |
| `eigen` | `level-slope-curvature` | C | the three curve factors are principal components |
| `vectors` | `mean-variance-efficient-frontier` | C | portfolio weights as a vector, risk as a quadratic form |
| `expected-value` | `risk-pooling`, `lemons-market`, `credit-spread-triangle`, `kelly-criterion`, `binomial-replication-risk-neutral`, `prospect-theory-loss-aversion` | F | |
| `variance`, `gaussian` (central-limit-theorem) | `risk-return` (exists), `volatility-drag-geometric-return`, `geometric-brownian-motion` | F | |
| `regression-correlation` | `capm-beta`, `term-premium-acm-kim-wright`, `institutions-growth-evidence` | F | beta is a regression slope |
| `markov-chains` | `junk-bonds-default-clustering`, `efficient-markets-random-walk`, `geometric-brownian-motion` | F / C | a migration matrix is a Markov chain |
| `montecarlo` | `debt-sustainability-fan-chart` (if A adds it), `estimation-error-portfolio`, `crr-binomial-tree` | F / C | |
| `binomial-normal` | `crr-binomial-tree` | C | the tree converges to the lognormal |
| `bayes` | `signaling`, `inflation-expectations-anchoring` | C | updating on a signal |
| `bandit-arms` | `prospect-theory-loss-aversion` | C | explore or exploit under uncertainty |
| `numbers-lie`: `survivorship-bias`, `multiple-comparisons`, `small-sample-variability`, `base-rate-neglect`, `goodharts-law`, `mean-vs-median-long-tail` | `active-management-arithmetic`, `factor-models-alpha`, `estimation-error-portfolio`, `inversion-decomposition`, `principal-agent-contract`, `ppp-balassa-samuelson-gini` | F / C | finance is where these traps cost money |
| `game-theory`, `prisoners-dilemma` | `bank-run`, `cournot-bertrand-hhi`, `tariff-offsets-currency-retaliation-diversion`, `reputation-ratings-certification`, `currency-crisis-speculative-attack` | F / C | coordination games and repeated games |
| `mechanism-auction`, `auctions` | `deductible-screening`, `duration-supply-demand` (Treasury auctions) | C | |
| `logistic-growth` | `network-effects-critical-mass` | C | adoption S-curves |
| `graph-algorithms` | `contagion-financial-network` | C | default cascades are a traversal |
| `hashing`, `rsa-encryption` | `stablecoin-peg-reserves`, `payment-rails-settlement-finality` | C | link only; Q9 does not teach blockchains |
| `veil-of-ignorance` | `pension-paygo-dependency`, `risk-pooling` | C | insurance chosen before you know who you are |
| `median-voter` (same-votes-different-winner #ch3) | `retirement-age-levers`, `tariff-welfare-accounting` | C | why concentrated losers and ageing electorates matter |
| `die-yield-cost`, `euv-lithography` (why-chips-are-hard) | `wrights-law-cost-curve`, `export-controls-chokepoints` | C | cost curves in chips; export-control chokepoints |
| `llm-sampling` | `ai-cheap-thinking`, `ai-productivity-frontier` | C | what a token is, for the price-per-token chapters |

---

## 2. Learning trails

A trail is suspended by the generator unless every adjacent pair has an edge and every station is live. Each hop
is marked ✓ (edge exists today), + (edge to add, both ends live today; all are in §5.1) or ⧗ (waits for the named
page). T3 can ship today.

**T1 · 从存钱到期权 / From a savings account to an option.** 一份"将来才知道值多少"的合同，为什么今天就有公道价？
Ships when `a-fair-price-for-a-bet` goes live. The draft's chapter-to-chapter edges (hops 3→9) are its own
argument and must be written into its fragment at registration; they are listed in §5.1a.

1. `compound-interest`
2. + `present-value-discounting`
3. ⧗ `forward-price-cost-of-carry`
4. ⧗ `option-payoffs-put-call-parity`
5. ⧗ `binomial-replication-risk-neutral`
6. ⧗ `crr-binomial-tree`
7. ⧗ `geometric-brownian-motion`
8. ⧗ `black-scholes-formula-pde`
9. ⧗ `greeks-delta-hedging`

A side branch for readers who have not met risk: `stocks-bonds` ✓ `risk-return` + `diversification`, joining at
station 4 through `stocks-bonds>option-payoffs-put-call-parity`. N1 later adds
`diversification` → `mean-variance-efficient-frontier` → `sharpe-ratio-capital-market-line` to that branch.

**T2 · 从印钱到金融危机 / From money creation to a financial crisis.** 每家都没做错，为什么会一起倒？
The first three stations ship today; stations 4–7 arrive with F; the system-wide leg waits for N4.

1. `money-as-iou`
2. + `loans-create-deposits`
3. + `bank-run`
4. ⧗ `bank-run-diamond-dybvig` (F)
5. ⧗ `maturity-liquidity-transformation` (F; needs `bank-run-diamond-dybvig>maturity-liquidity-transformation:connection`, or reach it from station 3, where the edge is listed in §4.F)
6. ⧗ `interest-rate-risk-banking-book` (F; needs `maturity-liquidity-transformation>interest-rate-risk-banking-book:foundation`)
7. ⧗ `capital-requirements-lender-of-last-resort` (F; needs `interest-rate-risk-banking-book>capital-requirements-lender-of-last-resort:application`)

Second leg after N4: `leverage-balance-sheet` → `collateral-haircut-repo` → `fire-sales-liquidity-spiral` →
`contagion-financial-network` (all three edges are in the "needs first" column of §1.12).

Interim ending until F exists: `bond-duration-convexity` + `bank-run` as a second way into station 3
(没亏在贷款上，亏在利率上).

**T3 · 一条加息新闻怎么走到你的月供 / From a rate decision to your mortgage payment.** Every station is live;
three edges to add, three exist.

1. `cpi-oer-hedonic-core`
2. + `taylor-rule-neutral-rate`
3. + `monetary-transmission` (`taylor-rule-neutral-rate>monetary-transmission:application`)
4. ✓ `floating-rate-reset`
5. + `amortisation-schedule` (`floating-rate-reset>amortisation-schedule:connection`: a reset re-runs the schedule)
6. ✓ `mortgage-prepayment`
7. ✓ `inflation-opportunity-cost-loan`

**T4 · 从一张价签到一场贸易战 / From a price tag to a trade war.** Waits for C; stations 1–4 can be made live now
by the Q1 registration.

1. `opportunity-cost`
2. + `price-signal`
3. + `supply-demand`
4. ⧗ `price-elasticity` (Q1: register on supply-demand #step2)
5. ⧗ `tariff-incidence-pass-through` (C)
6. ⧗ `tariff-welfare-accounting` (C)
7. ⧗ `export-controls-chokepoints` (C)

A second leg from station 5: `tariff-incidence-pass-through` ⧗ `tariff-offsets-currency-retaliation-diversion`
(C), and once H is live on to `trilemma-exchange-rate-regimes` (H adds
`tariff-offsets-currency-retaliation-diversion>trilemma-exchange-rate-regimes:connection`).

**T5 · 国家的账本 / A country's books.** Waits for A.

1. `spending-is-income`
2. + `gdp-three-ways`
3. + `debt-dynamics-r-minus-g`
4. ⧗ `deficit-primary-balance` (A; edge `debt-dynamics-r-minus-g>deficit-primary-balance:connection`)
5. ⧗ `public-debt-holders-currency` (A)
6. ⧗ `sovereign-default-restructuring` (A)

Two more endings from station 4: `deficit-primary-balance` ⧗ `pension-paygo-dependency` ⧗ `retirement-age-levers`,
and from station 2: `gdp-three-ways` ⧗ `fiscal-multiplier`.

A sixth trail, **AI 之后谁更富 / Who gets richer after AI**, becomes possible after E and N2:
`growth-from-ideas` → `ideas-nonrival-increasing-returns` → `ai-productivity-frontier` (E), then
`ai-cheap-thinking` → `relative-prices-after-ai` → `baumol-cost-disease` (N2). The two halves meet only through
`ai-cheap-thinking>ai-productivity-frontier:connection`, which points the wrong way for a single path, so this is
two short trails until N2 exists; decide the join then.

A seventh, **价格为什么像醉汉走路 / Why prices walk like a drunk**, arrives with J, G and the derivatives draft:
`binomial-normal` → `random-walk-sqrt-t` (J) → `brownian-motion-diffusion` (J) → `geometric-brownian-motion`
(draft) → `black-scholes-formula-pde` (draft; needs the draft's own chain, §5.1a), with a branch
`random-walk-sqrt-t` → `efficient-markets-random-walk` → `active-management-arithmetic` (G).

---

## 3. Gaps, reference briefs for the commissioned essays, and the next queue

### 3.0 Gap list, by what it blocks

The last column uses the first plan's numbers; the numbering table at the top of this file says which are now
commissioned (Q3 = F, Q4 = K, Q5 = G, Q6 = H, Q7 = E, Q9 = I) and which moved to the next queue (Q2 = N1, Q8 = N2).

| Gap | Blocks | Queue |
|---|---|---|
| Elasticity, surplus, the tax wedge and deadweight loss are taught (supply-demand #step1–#step3) but are not concepts, so nothing can link to them and search cannot find them. Price controls and the long-run response are not taught anywhere | C's incidence, the draft's monopoly chapter, Q8's minimum wage, an energy-markets essay | Q1 (registration only); price controls later |
| Everything between 分散投资 and 期权: frontier, Sharpe, CAPM, factors, Kelly. None of the words appears on the site | T1's middle, every "how should risk be priced" question | Q2 |
| Leverage and the mechanics of a crisis. 杠杆 appears only in the derivatives draft, as margin | T2, the audit's financial-stability ladder (0.38), Q9's run chapter | Q3 |
| The dynamics of inflation and the cycle: demand against supply shocks, expectations (blocks 4 ladders in the audit), deflation, hyperinflation, the multiplier | the audit's deflation (0.25) and business-cycle (0.29) ladders; A's #ch8 gives the multiplier but not the cycle | Q4 |
| What a share is worth; efficient markets; bubbles; behavioural finance. The investment atlas has an empty 行为 region | the "is the market expensive" questions, the investment atlas's fifth region | Q5 |
| Exchange-rate regimes, balance of payments, currency crises, reserve currencies | the audit's exchange-rate ladder (0.38), C's exchange-rate chapter, Q9's dollarisation | Q6 |
| Growth beyond accounting: Solow dynamics, ideas, Wright's law, demographics | the audit's growth ladder; "为什么中国增速放缓" | Q7 |
| Wages, minimum wage, the task model as a model, Baumol as a model; the audit's worst ladder (AI economics, 0.10) | "AI 会不会抢工作" beyond what `scarcity-moves` sketches | Q8 |
| Stablecoins, CBDC, payment rails | the owner's frontier list; "稳定币是什么" has no answer on the site | Q9 |
| Personal finance beyond a mortgage; taxes; housing; energy markets; behavioural economics outside finance | lower priority; §3.10 | later |

### 3.0a Order, and why

This paragraph describes the first plan; the second commission overtook it, and the current order is in §3.11.
Q1 first because it costs no writing and three essays in flight lean on it. Q2 and Q3 next because they complete
the two trails the owner named. Q4 before Q6 because exchange rates need expectations. Q5 can run in parallel with
anything after Q2. Q9 after Q3 (it needs the run and fire-sale nodes). Q7 and Q8 are independent of the rest;
they share a frontier, so each writer gets the other's brief.

Rules for every essay briefed here (the reference briefs and N1–N8), on top of COMMON.md, STANDARD.md, BRIEF-COMMON.md, BRIEF-DEEP.md and `specs/essays.md`:

- **Template essays** (`content.zh.md` + `page.json` with `"layout": "essay"`, `"status": "draft"`), at least six
  static SVG diagrams, `models.js` importable from node, `tests/models.cjs` pinning every number the prose states.
- **Ownership is exclusive.** An essay registers concepts only for the ids listed under "owns". Anything under
  "links, never re-teaches" gets at most a three-sentence recap and a deep link to the owning chapter. Check
  `site-registry.json` → `concepts` and every sibling's `REGISTRY.json` before choosing ids and aliases.
- **Register 8–9 concepts**, not one per chapter. The closing checklist chapter is not a concept. The frontier
  chapter is one concept.
- **Frontier chapters**: every figure dated and sourced from a primary document the writer opened in November
  2026; 已确立 / 已演示 / 某方声称 kept apart. The "what to source" lines below name where to look. They are not
  facts to copy; nothing in this file about 2025–2026 may be written into an essay without being checked.
- **No advice.** No essay says what to buy, hold, borrow or vote for. Models show the cost of each choice.
- Ports are assigned by the team lead.

---

### Q1 · no new essay: register what `math/applied/supply-demand` already teaches

The first version of this plan proposed an essay on elasticity and surplus. Reading the pages changed that. The
lesson `math/applied/supply-demand` already has a tax and subsidy wedge with its deadweight loss (#step1), point
elasticity with the "slope is not elasticity" distinction (#step2) and consumer and producer surplus as areas
(#step3). The draft `why-a-few-firms-win` #ch1 has marginal revenue, MR = MC and the Lerner index. C's first
chapter explains elasticity again for tariffs. `math/applied/externalities` #step2 has a deadweight loss. A new
essay would be the fourth explanation of the same thing. What is missing is that none of it is a concept.

Registrar actions (three nodes, no writing):

| New node | Points at | Aliases to carry |
|---|---|---|
| `price-elasticity` | math/applied/supply-demand #step2; add C's `#elasticity` chapter as a second lesson when C is live | 弹性, 需求弹性, 价格弹性, 弹性怎么算, 薄利多销, price elasticity, elastic vs inelastic demand |
| `consumer-producer-surplus` | math/applied/supply-demand #step3 | 消费者剩余, 生产者剩余, 总剩余, consumer surplus, producer surplus |
| `tax-wedge-deadweight-loss` | math/applied/supply-demand #step1 | 税负归宿, 税到底谁出, 无谓损失, 补贴给了谁, tax incidence, deadweight loss, who pays a sales tax |

Plus aliases on the draft's `monopoly-pricing-lerner`: 边际收入, 边际收益, MR = MC, marginal revenue. Edges:
`supply-demand>price-elasticity:foundation`, `supply-demand>consumer-producer-surplus:foundation`,
`supply-demand>tax-wedge-deadweight-loss:foundation`, `consumer-producer-surplus>tax-wedge-deadweight-loss:connection`,
`price-elasticity>monopoly-pricing-lerner:foundation`, `tax-wedge-deadweight-loss>externalities:connection`,
`price-elasticity>tariff-incidence-pass-through:foundation`.

The lesson fragment `atlas/graph/lessons/supply-demand.json` is v1 format with one concept; the registrar should
confirm it can carry three more concepts on one page (the `numbers-lie` and essay fragments do) before adding.

What stays genuinely untaught, and where it goes: price ceilings and floors (shortage, queues, the long-run supply
response), why deadweight loss grows with the square of the tax rate, the revenue hump, short-run against long-run
elasticity. That is half an essay. It goes into the later tax page (§3.10, `where-taxes-fall`), which becomes
"税和限价" and owns `price-controls-shortage`. The minimum wage, a price floor, is Q8's.

---

### Q2 = N1 · `investment/portfolio/how-much-risk-is-worth-taking/` (next queue, first)

Changed by the second commission: G (`what-a-stock-is-worth`) now owns `capm-beta` and `factor-models-alpha`.
This essay drops chapters 4–6 and the "beta by regression" and "factor zoo" models below to a recap with links to
G, and spends the room on what G will not have: the frontier itself, estimation error, the many-period problem
(volatility drag, Kelly), and rebalancing. Its owned list is then `mean-variance-efficient-frontier`,
`sharpe-ratio-capital-market-line`, `estimation-error-portfolio`, `volatility-drag-geometric-return`,
`kelly-criterion` and one frontier concept. It links J for the random walk and √t.

**风险该卖多少钱 / What Is Risk Worth? From Diversification to CAPM.** New subtopic `investment/portfolio`
(组合与定价 / Portfolios and Pricing). Stage: university.

One question: 分散可以消掉一部分风险。消不掉的那部分，市场凭什么要付钱给承担它的人，付多少？

Reader questions: 夏普比率是什么 · 夏普比率多少算好 · 有效前沿是什么 · 贝塔是什么意思 · 阿尔法是什么 · CAPM 模型 · 资产配置怎么算 ·
为什么杠杆 ETF 长期会亏 · 凯利公式 · 风险平价是什么 · 因子投资是什么 · 再平衡有什么用 · what is the Sharpe ratio · what is beta in
stocks · what is the efficient frontier · why do leveraged ETFs decay · Kelly criterion explained · what is alpha ·
does rebalancing increase returns.

Chapter ladder:
1. 两只资产之后：N 只。Risk as wᵀΣw; with equal weights σ_p² = σ̄²/N + (1 − 1/N)·cov̄, so risk falls to a floor that is the average covariance.
2. 有效前沿：同样的风险，最多能有多少预期回报。
3. 加进一个无风险资产：所有人都该拿同一个风险组合，只是比例不同。Capital market line, Sharpe ratio.
4. CAPM：只有和市场一起动的那部分风险才有价钱。Beta as a regression slope; the security market line.
5. 它对不对：贝塔之外还有什么。Size, value, momentum; factor models; alpha as what is left.
6. 因子动物园：几百个"显著"的因子为什么大多数是假的。
7. 最优组合为什么不稳：输入差一点，答案差很多。
8. 一期和很多期不一样：波动拖累。
9. 下多大注：凯利公式，和为什么没人敢用满。
10. 前沿在哪。
11. 收尾：看到一个"高夏普策略"时问的五件事。

Models:
- **Risk floor.** σ_p²(N) = σ̄²/N + (1 − 1/N)·ρ̄σ̄²; sliders for ρ̄ and N.
- **Frontier and tangency.** Three to five assets with editable μ and Σ. Minimum-variance frontier from
  min wᵀΣw s.t. wᵀμ = m, wᵀ1 = 1 (closed form with A = 1ᵀΣ⁻¹1, B = 1ᵀΣ⁻¹μ, C = μᵀΣ⁻¹μ); tangency weights
  w* ∝ Σ⁻¹(μ − r_f·1); Sharpe S = (μ_p − r_f)/σ_p.
- **Beta by regression.** Simulated returns R_i − r_f = α + β(R_m − r_f) + ε; the reader sees β̂ = Cov/Var and
  its standard error shrink with sample length; then E[R_i] = r_f + β(E[R_m] − r_f).
- **Estimation error.** Resample T months from the true parameters, re-solve the frontier each time, and overlay
  the clouds of "optimal" weights; SE of a mean return is σ/√T, so 10 years of monthly data pin μ to about ±5%
  a year for a 16% volatility asset (the model produces the number).
- **Volatility drag and Kelly.** Growth rate g(f) = r + f(μ − r) − ½f²σ²; maximum at f* = (μ − r)/σ²; at 2f* the
  growth rate is back to r. A 2× and 3× daily-rebalanced product on the same path shows the drag.
- **Factor zoo.** Generate K factors with no true premium; count how many pass t > 2; raise the bar and watch
  them go (links `multiple-comparisons`).

Owns: `mean-variance-efficient-frontier`, `sharpe-ratio-capital-market-line`, `capm-beta`, `factor-models-alpha`,
`estimation-error-portfolio`, `volatility-drag-geometric-return`, `kelly-criterion`, plus one frontier concept.
Links, never re-teaches: `diversification` (the two-asset formula and the correlation slider live there; open on
its result), `risk-return` (what a risk premium is), `variance`, `regression-correlation`, `expected-value`,
`montecarlo`, `fees-compounding`, `multiple-comparisons` and `small-sample-variability` (numbers-lie #c4, #c2),
`geometric-brownian-motion` and `margin-leverage-central-clearing` (the draft: the continuous-time path and what
leverage does at the margin desk), `term-premium-curve-inversion` (a risk premium in bonds),
`equity-risk-premium` (Q5 estimates the size; this essay takes it as a parameter).

Frontier, and what to source: replication of published factors (Harvey, Liu and Zhu; Hou, Xue and Zhang; Jensen,
Kelly and Pedersen — read the papers, state what each found and that they disagree); how inelastic the aggregate
market is to flows (Gabaix and Koijen) and what a growing passive share would then imply (index-fund share from
the fund industry's own yearbook, dated); machine learning in return prediction (Gu, Kelly and Xiu, and what
survives transaction costs). Label each 已确立 / 已演示 / 声称.

Risk: high (money-adjacent). No allocation is recommended, no asset class is ranked, every return figure is a
labelled parameter or a dated historical statistic with its source and period. Kelly is presented with its
sensitivity to a mis-estimated μ, not as a rule to follow.

---

### Q3 → commissioned as F (`economics/money/why-banks-run`): reference brief

Read with §4.F. F owns the first half of this brief (leverage, the run, rate risk on the book, capital and the
lender of last resort); chapters 4, 5 and 8 and the haircut, leverage-targeting and network models belong to N4.

Original heading: `economics/money/why-financial-crises-repeat/`

**金融危机为什么隔些年就来一次 / Why Financial Crises Keep Happening.** Stage: university. Stays in
`economics/money` (货币与金融); no new subtopic.

One question: 每一家机构都在做对自己合理的事，整个系统为什么会一起倒？

Reader questions: 杠杆是什么意思 · 加杠杆为什么危险 · 什么是系统性风险 · 2008 年金融危机是怎么发生的 · 次贷危机通俗解释 · 硅谷银行为什么倒 ·
什么是影子银行 · 回购是什么 · 什么是明斯基时刻 · 资本充足率是什么 · 大而不能倒 · 为什么要救银行 · what is leverage · what caused the
2008 financial crisis · why did SVB fail · what is shadow banking · what is a repo · what is a Minsky moment · what
is a bank stress test · why do governments bail out banks.

Chapter ladder:
1. 杠杆：一个数同时放大回报和缩短距离。
2. 银行本来就是一台高杠杆、借短贷长的机器。(Recap of `bank-run` in three sentences, then what that chapter left out: market funding.)
3. 没亏在贷款上，亏在利率上：2023 年的那一类倒法。
4. 抵押品与折扣率：没有存款人的挤兑。
5. 甩卖：卖得越多跌得越多，跌得越多卖得越多。
6. 证券化：把风险切片，和把风险藏起来。
7. 信贷周期：平静本身会制造不稳定。
8. 传染：一张互相欠钱的网。
9. 防线：资本、流动性、最后贷款人，以及每一条防线的副作用。
10. 历史上的几次，套进同一个模型：1907、1929–33、1997、2008、2020 年 3 月、2023 年 3 月。
11. 前沿在哪。
12. 收尾：听到"风险可控"时问的五件事。

Models:
- **Leverage.** ROE = L·ROA − (L − 1)·r_d; equity is wiped out by an asset fall of 1/L; sliders for L and r_d.
- **Rate risk on a balance sheet.** Hold-to-maturity bonds with duration D against uninsured deposits:
  unrealised loss ≈ D·Δy·A (using `bond-duration-convexity`), compared with equity E; run threshold when
  loss/E crosses 1 and the share of uninsured deposits is high.
- **Haircut spiral.** With haircut h, maximum leverage is 1/h. A dealer holding assets A on equity E faces h
  rising from 2% to 4%: required sales = A − E/h. Price impact P = P₀·e^(−κ·sales); the fall in P cuts E and
  forces a second round. Iterate to the fixed point; show the κ above which there is none.
- **Leverage targeting.** Intermediaries that keep L constant buy when prices rise and sell when they fall
  (demand curve slopes up): ΔA = L·ΔE. The reader toggles "target leverage" against "passive" and compares the
  amplification.
- **Network contagion.** Ten to twenty banks with interbank claims; clearing payments p = min(p̄, Πᵀp + e)
  (Eisenberg–Noe) solved by iteration; the reader fails one bank and varies connectivity to find the
  "robust-yet-fragile" region.
- **Capital rule.** Required equity = k × risk-weighted assets; show how the same shock is absorbed or not as k
  moves, and the lending that a higher k removes in the model.

Owns: `leverage-balance-sheet`, `maturity-liquidity-transformation`, `interest-rate-risk-banking-book`,
`collateral-haircut-repo`, `fire-sales-liquidity-spiral`, `securitisation-shadow-banking`, `credit-cycle-minsky`,
`contagion-financial-network`, `capital-requirements-lender-of-last-resort` (nine; the frontier chapter folds into
the last one or takes a tenth).
Links, never re-teaches: `bank-run` and deposit insurance (where-money-comes-from #ch3: the Diamond–Dybvig logic is
there; do not rebuild a deposit-run model), `loans-create-deposits`, `bond-duration-convexity` (why-one-rate #ch2),
`reserves-floor-system` and `zero-lower-bound-qe` (what central banks did in 2008 and 2020),
`margin-leverage-central-clearing` (the draft #ch9: margin calls and clearing houses; this essay covers repo and
bank balance sheets, not exchange margin), `moral-hazard` and `lemons-market` (D),
`credit-spread-triangle` (B), `diversification` (why pooling mortgages does not remove a common shock),
`game-theory`, `feedback`, `graph-algorithms`, `sovereign-default-restructuring` (A: the sovereign version),
`currency-crisis-speculative-attack` (Q6).

Frontier, and what to source: the size and growth of non-bank intermediation (FSB's annual global monitoring
report); private credit; hedge-fund leverage in the Treasury basis trade (Fed and BIS notes); where the Basel III
final rules stand in each jurisdiction (the regulators' own releases); the official post-mortems of the 2023
failures (Fed, FDIC, Swiss expert group); commercial property and local-government financing in China (IMF GFSR and
Article IV, PBoC financial stability report). For each: what is established, what a stress test demonstrated, and
what one party claims.

Risk: medium. Bail-outs and regulation are politically contested: show each tool's benefit and cost in the model.
No named institution is described as unsafe unless a regulator's document says so.

---

### Q4 → commissioned in part as K (`economics/macro/what-makes-prices-rise`): reference brief

Read with §4.K. K owns chapters 5–9 of this brief (expectations, anchoring, disinflation, deflation,
hyperinflation) and their models. Chapters 1–4 (thrift, the accelerator, demand against supply shocks as a model
of the cycle) go to N3.

Original heading: `economics/macro/why-economies-boom-and-bust/`

**经济为什么会过热，又为什么会衰退 / Why Economies Overheat and Stall.** Stage: university.

One question: 工厂、工人和技术都还在，为什么产出会突然少一截？物价又为什么有时自己涨起来停不下？

Reader questions: 通货膨胀的原因 · 通胀是怎么产生的 · 通缩为什么比通胀可怕 · 什么是滞胀 · 什么是通胀预期 · 工资物价螺旋 · 经济衰退是怎么发生的 ·
什么是乘数效应 · 财政刺激有用吗 · 软着陆是什么 · 恶性通胀是怎么回事 · 津巴布韦为什么通胀 · what causes inflation · demand-pull vs
cost-push inflation · why is deflation bad · what is stagflation · what are inflation expectations · what is the
multiplier effect · what causes a recession · what is a soft landing · how does hyperinflation start.

Chapter ladder:
1. 一个人省钱是美德，所有人同时省钱是衰退。From `spending-is-income` to the paradox of thrift.
2. 乘数，三句话。(A's #ch8 derives the multiplier with its leaks and discusses its size. Recap, deep link, move on.)
3. 周期为什么会自己摆：乘数加上加速数。
4. 需求冲击和供给冲击：物价和产出同向动还是反向动。
5. 预期：大家以为会涨多少，本身就是涨价的一部分。
6. 锚住和脱锚：同一个冲击，两种结局。
7. 把通胀压下来要付多少失业。
8. 通缩：便宜为什么不是好事。
9. 恶性通胀：印钱收入的上限。
10. 前沿在哪：2021–2023 年那一轮通胀到底是什么；当下的低通胀经济体。
11. 收尾：读到"通胀回落""经济软着陆"时问的五件事。

Models:
- **Paradox of thrift.** Y = C₀ + cY + I: every household raises its saving rate (c falls); income falls until
  total saving equals unchanged investment. The multiplier formula itself is A's (#ch8) and is used here, not
  re-derived.
- **Multiplier–accelerator.** Y_t = c·Y_{t−1} + v·c·(Y_{t−1} − Y_{t−2}) + G (Samuelson 1939). The (c, v) plane
  is divided into monotone, damped-oscillating and explosive regions by the roots of λ² − c(1 + v)λ + cv = 0;
  the reader clicks a point and watches the path.
- **Demand against supply shocks.** A reduced three-line system (the page uses the equations of
  `new-keynesian-model`, deep-linked, and does not re-derive them): the reader applies a demand shock and a
  supply shock and reads the sign of the co-movement of π and y.
- **Expectations.** π_t = π^e_t + κ·(y_t − y*) + s_t, with π^e_t = θ·π* + (1 − θ)·π_{t−1}. θ is the anchoring
  slider; the same one-period supply shock dies in two periods at θ = 1 and persists at θ = 0. Sacrifice ratio
  read off a disinflation path.
- **Debt deflation.** A borrower with nominal debt D and income falling with the price level: real burden
  D/P; with the nominal rate floored at zero, r = −π rises as prices fall (links `zero-lower-bound-qe`).
- **Seigniorage hump.** Cagan money demand m − p = −α·π^e; steady-state seigniorage S(π) = π·e^(−απ), maximum at
  π = 1/α; a government that needs more than the maximum gets accelerating inflation.

Owns: `multiplier-accelerator-cycle`, `aggregate-demand-supply-shocks`, `inflation-expectations-anchoring`,
`wage-price-spiral-disinflation`, `deflation-debt-deflation`, `hyperinflation-seigniorage`, plus one frontier
concept.
Links, never re-teaches: `spending-is-income` (scarcity-moves #c8), `quantity-theory-inflation` and
`inflation-winners-losers` (where-money-comes-from #ch4, #ch5: MV = PY and who loses are done),
`price-indexes-chain-fisher` and `cpi-oer-hedonic-core` (how inflation is measured: never re-explained),
`business-cycle-sahm-potential` and `labour-u3-u6-beveridge-okun` (output gap, Okun, who dates recessions),
`taylor-rule-neutral-rate`, `new-keynesian-model`, `zero-lower-bound-qe` (why-one-rate #ch6, #ch7, #ch10: the
central bank's side is done; this essay is the economy's side), `fiscal-multiplier` and
`deficit-primary-balance` (A #ch8, #ch2: the multiplier, its leaks, its measured size and what it means for a
government's budget are all there),
`tariff-incidence-pass-through` (C: a tariff as a supply shock), `poles` and `feedback`, `ode-phase-portraits`.

Frontier, and what to source: decompositions of 2021–2023 inflation into supply, demand and labour-market parts
(Bernanke and Blanchard 2023 and the central-bank replications for other economies; the non-linear Phillips
curve of Benigno and Eggertsson) and where they disagree; survey and market measures of expectations (central
banks' own surveys, breakevens via B); the state of prices in economies with very low inflation in 2025–2026 (statistical agencies, IMF WEO
of October 2026).

Risk: medium to high. Fiscal stimulus is contested, and A carries the multiplier evidence: do not open a second
front on it here. The causes of 2021–2023 inflation are argued over by serious people; present
the decompositions side by side.

---

### Q5 → commissioned as G (`investment/basics/what-a-stock-is-worth`): reference brief

Read with §4.G. G owns chapters 1–8 of this brief and adds CAPM and factors from the Q2 brief (its chapters 4–6
and the beta and factor-zoo models). Chapters 9–10 (bubbles, prospect theory) go to N7.

Original heading: `investment/valuation/what-a-share-is-worth/`

**一只股票到底值多少钱 / What Is a Share Worth?** New subtopic `investment/valuation` (估值与市场 / Valuation and
Markets). Stage: university. This fills the investment atlas's 估值 region and its empty 行为 region.

One question: 股价每天在变。它是在猜一个真实存在的"价值"，还是只在猜别人会出多少？

Reader questions: 市盈率是什么意思 · 市盈率多少合理 · 股票估值怎么算 · DCF 是什么 · 什么是股权风险溢价 · 有效市场假说 · 主动基金能跑赢指数吗 ·
指数基金为什么便宜 · 股市泡沫怎么判断 · 什么是损失厌恶 · 为什么散户总是追涨杀跌 · 回购和分红有什么区别 · what is a P/E ratio · how to
value a stock · what is discounted cash flow · is the stock market efficient · do active funds beat the index ·
what is the equity risk premium · how do you spot a bubble · what is loss aversion.

Chapter ladder:
1. 一只股票是一串还没发生的现金。From the one-line Gordon formula (deep link to why-one-rate #ch8) to a two-stage DCF.
2. 估值为什么对两个数这么敏感：r 和 g。
3. 市盈率是折现公式换了个写法。
4. 反过来用：现在的价格在假设什么。
5. 股权风险溢价：一个谁也看不见、所有估值都要用的数。
6. 如果价格已经反映了所有消息：随机游走与有效市场的三种说法。
7. 主动管理的算术：平均而言，跑赢是不可能的。
8. 技术还是运气：一千个不会选股的经理里，有多少连赢五年。
9. 价格可以离谱多久：泡沫与套利的限度。
10. 人怎么算账：前景理论，损失厌恶，处置效应。
11. 前沿在哪。
12. 收尾：看到"估值很高""估值很低"时问的五件事。

Models:
- **Two-stage DCF.** V = Σ_{t=1..n} CF₀(1 + g₁)^t/(1 + r)^t + [CF_n(1 + g₂)/(r − g₂)]/(1 + r)^n; a tornado of
  ∂V/∂r, ∂V/∂g₂; the share of value that sits in the terminal term.
- **P/E from fundamentals.** P/E = payout·(1 + g)/(r − g); a heat map over (r, g); earnings yield E/P beside a
  real bond yield.
- **Reverse DCF.** Solve for the g₁ that makes V equal a chosen price; output is "the growth this price assumes".
- **Active arithmetic and luck.** Before costs the average actively managed unit of money earns the market
  return; after a fee f it earns market − f (Sharpe 1991). Simulate N managers with zero skill and volatility
  σ_α: the count with k winning years in a row is N·2^(−k); add a small true skill and show how many years it
  takes for the t-statistic α/(σ_α/√T) to reach 2.
- **Bubble.** Price = fundamental + b_t with E[b_{t+1}] = (1 + r)·b_t and a per-period burst probability p, so
  surviving bubbles must grow at (1 + r)/(1 − p). An arbitrageur with limited capital who is right about value
  can still be forced out before the burst.
- **Prospect-theory value.** v(x) = x^α for gains, −λ(−x)^β for losses, with the Tversky–Kahneman 1992 estimates
  as defaults (check them in the paper); the reader compares choices under expected value and under v.

Owns: `dcf-valuation`, `valuation-multiples-pe`, `equity-risk-premium`, `efficient-markets-random-walk`,
`active-management-arithmetic`, `bubbles-limits-to-arbitrage`, `prospect-theory-loss-aversion`, plus one frontier
concept.
Links, never re-teaches: `present-value-discounting` and `equity-duration-house-affordability` (why-one-rate #ch1,
#ch8), `stocks-bonds` (what a share is), `risk-return`, `fees-compounding` (what a 1% fee does over 30 years:
done), `capm-beta` and `factor-models-alpha` (Q2: this essay uses "risk-adjusted" and links), `survivorship-bias`,
`regression-to-the-mean`, `multiple-comparisons` (numbers-lie), `geometric-brownian-motion` and
`implied-volatility-smile-fat-tails` (the draft), `markov-chains`, `hypothesis-testing`, `expected-value`,
`bandit-arms`.

Frontier, and what to source: the range of equity-risk-premium estimates in 2026 and why methods disagree
(published estimates with their method stated); index concentration and the passive share, dated (index
providers' factsheets, the fund industry yearbook); the scorecards of active funds against benchmarks (the
published scorecards, with their survivorship treatment); the 2025–2026 argument over AI-related valuations,
presented as a reverse DCF with both sides' assumptions and no verdict; retail options volume (link the draft's
frontier chapter rather than repeat it).

Risk: highest in the queue. It must not read as a call on any market, sector or company. Use invented companies
in the models; real ones appear only in dated, sourced statements of fact. The bubble chapter states plainly that
the model cannot tell a bubble from a justified re-rating in real time.

---

### Q6 → commissioned as H (`economics/money/what-sets-an-exchange-rate`): reference brief

Read with §4.H. Original heading: `economics/trade/what-moves-an-exchange-rate/`

**汇率是谁定的 / What Moves an Exchange Rate?** Stage: university. Sits beside C in `economics/trade`
(贸易与国际 / Trade and International).

One question: 一种货币换另一种货币的价格，一天能动 1%，十年能动一倍。它到底跟着什么走？一个国家为什么不能想定在哪就定在哪？

Reader questions: 汇率是怎么决定的 · 人民币汇率为什么涨跌 · 为什么加息货币会升值 · 固定汇率和浮动汇率 · 不可能三角 · 外汇储备有什么用 · 货币贬值是好是坏 ·
亚洲金融危机是怎么回事 · 美元为什么是世界货币 · 去美元化 · 港币为什么盯住美元 · what determines exchange rates · why does raising
rates strengthen a currency · fixed vs floating exchange rate · what is the impossible trinity · why is the dollar
the reserve currency · what caused the Asian financial crisis · is a weak currency good for exports.

Chapter ladder:
1. 三个时间尺度，三个答案：一天看利差，几年看收支，几十年看物价。(Recaps and links PPP and interest parity; teaches neither.)
2. 国际收支：每一笔流出都有一笔对应的流入。
3. 汇率为什么反应过度。
4. 实际汇率：名义汇率不动，竞争力也会变。
5. 不可能三角：固定汇率、资本自由流动、自己定利率，只能要两个。
6. 守住一个汇率要用什么：储备、利率、管制。
7. 守不住的那一天：投机攻击为什么来得突然。
8. 借外币的代价：贬值没帮上出口，先压垮了资产负债表。
9. 储备货币：美元的位置是怎么来的，有什么好处和代价。
10. 前沿在哪。
11. 收尾：读到"汇率破几"时问的五件事。

Models:
- **Balance of payments.** CA + FA + ΔR = 0 with the reader posting transactions into double-entry rows; the
  current account side links C's S − I = CA.
- **Overshooting.** Dornbusch 1976 in reduced form: sticky prices, uncovered parity i − i* = E[Δe], and the gap
  to the long-run rate closing at rate θ. After a permanent monetary expansion of size Δm, e jumps by
  Δm·(1 + 1/(λθ)) and then appreciates back; sliders for θ and the interest semi-elasticity of money demand λ.
- **Trilemma.** A peg with open capital: any gap i − i* drains reserves at a rate proportional to the gap and
  capital mobility k: dR/dt = −k·(i* − i) − CA deficit. The reader picks two corners and sees the third go.
- **Speculative attack.** Krugman 1979 / Flood–Garber: domestic credit grows at μ, reserves fall, the shadow
  floating rate ẽ_t rises; the attack happens at the T where ẽ_T equals the peg, with reserves still positive,
  and takes all of them at once. T = (R₀ − α·μ)/μ in the linear version (derive and pin it in the test).
- **Foreign-currency debt.** Debt/GDP in local terms = (D_local + e·D_fx)/Y; a depreciation that raises exports
  by ε_x·Δe against a debt ratio that jumps immediately.

Owns: `balance-of-payments`, `exchange-rate-overshooting`, `trilemma-exchange-rate-regimes`,
`currency-crisis-speculative-attack`, `foreign-currency-debt-balance-sheet`, `reserve-currency-dollar`, plus a
real-exchange-rate chapter that attaches to the existing `ppp-balassa-samuelson-gini` as a second lesson, and one
frontier concept.
Links, never re-teaches: `purchasing-power-parity` (where-money-comes-from #ch9), `ppp-balassa-samuelson-gini`
(how-an-economy-is-measured #ch5), `interest-parity-carry-trade` (why-one-rate #ch9: covered and uncovered parity
and the carry trade are done), `saving-investment-current-account` and `tariff-offsets-currency-retaliation-diversion` (C),
`public-debt-holders-currency` and `sovereign-default-restructuring` (A), `bank-run` (the same coordination
game), `reserves-floor-system`, `taylor-rule-neutral-rate`, `inflation-expectations-anchoring` (Q4),
`fire-sales-liquidity-spiral` (Q3), `stablecoin-peg-reserves` (Q9: a private peg with the same arithmetic).

Frontier, and what to source: the currency composition of official reserves and of trade invoicing (IMF COFER,
the BIS Triennial Survey of 2025, published invoicing datasets); cross-border payment systems outside the dollar
and their measured volumes (operators' own statistics); the August 2024 yen carry unwind as a worked case (BIS
Quarterly Review); stablecoins as a channel of dollarisation (BIS and IMF papers, via Q9); how the RMB regime is
described by the PBoC and by the IMF's classification. Dated, with the three labels.

Risk: politically contested (reserve-currency status, capital controls, "currency manipulation"). Present the
identities and the trade-offs; quote official classifications instead of adjectives. No currency forecasts.

---

### Q7 → commissioned as E (`economics/growth/why-some-countries-got-rich`): reference brief

Read with §4.E.

**为什么有的国家富了，有的没有 / Why Some Countries Got Rich.** New subtopic `economics/growth`
(增长 / Growth). Stage: university.

One question: 多盖厂房、多修路，为什么不能让一个国家一直增长下去？能一直增长的那部分是什么，AI 会改变它吗？

Reader questions: 为什么有的国家富有的国家穷 · 中国经济增速为什么放缓 · 什么是中等收入陷阱 · 人口红利是什么 · 全要素生产率怎么提高 · 索洛模型 ·
为什么光伏越来越便宜 · 莱特定律 · 人口老龄化对经济的影响 · AI 能提高生产率吗 · why are some countries rich and others poor · why is
China's growth slowing · what is the middle income trap · Solow model explained · why did solar get so cheap ·
will AI increase productivity · why has productivity growth slowed.

Chapter ladder:
1. 1% 和 3% 的差别：七十年后是两倍和八倍。(One line and a link to `compound-interest`.)
2. 靠攒资本能走多远：报酬递减与稳态。
3. 追赶：离前沿越远，本来可以跑得越快。为什么有的追上了，有的没有。
4. 稳态之后只剩一样东西在长：思想。它和别的东西不同在哪。
5. 思想越来越难找吗。
6. 做得越多越便宜：莱特定律。
7. 人：抚养比、教育和工作年限。
8. 制度：证据有多强，争论在哪。
9. 把一个国家的减速拆开看。(Uses the accounting of how-an-economy-is-measured #ch8 on published data; does not re-teach it.)
10. 前沿在哪：AI 会不会抬高增长率。
11. 收尾：听到"潜在增速"时问的四件事。

Models:
- **Solow.** k̇ = s·k^α − (n + δ + g)·k; steady state k* = [s/(n + δ + g)]^(1/(1−α)); speed of convergence
  ≈ (1 − α)(n + δ + g) per year. The reader raises s and sees a level effect with no change in long-run growth.
- **Convergence.** Two economies with the same parameters and different k₀; growth against distance from the
  frontier; then different s or institutions-as-a-parameter A to show conditional convergence.
- **Ideas.** Ȧ = θ·L_A^λ·A^φ. With φ = 1 growth scales with the number of researchers (and the data refuse it);
  with φ < 1 long-run growth is g_A = λ·n/(1 − φ) (Jones 1995), so it needs a growing research effort. The reader
  sets φ and the growth of L_A.
- **Wright's law.** C(x) = C₁·x^(−b), learning rate LR = 1 − 2^(−b); log-log plot with the reader fitting b to a
  small published series (solar modules; state the series, source and period); beside it a time-based curve
  C(t) = C₀·e^(−mt) to show why the two are hard to tell apart when output grows exponentially.
- **Demographic arithmetic.** Growth of GDP per person = growth of output per worker + growth of
  (workers/population); a population pyramid stepped forward with fixed age-specific participation.

Owns: `solow-steady-state-convergence`, `ideas-nonrival-increasing-returns`, `wrights-law-cost-curve`,
`demographics-dependency-growth`, `institutions-growth-evidence`, `ai-productivity-frontier` (the frontier
concept).
Links, never re-teaches: `solow-growth-accounting-tfp` (how-an-economy-is-measured #ch8: growth accounting and the
TFP residual are done; chapter 9 applies them), `growth-from-ideas` and `institutions-trust` (scarcity-moves #c7,
#c10: the intuition; this essay supplies the models), `compound-interest`, `exp-log`, `ode-phase-portraits`,
`data-feedback-loops` (why-a-few-firms-win #ch8 treats learning curves as a firm's advantage; this essay treats
them as an economy-wide cost curve, and the two link each other), `die-yield-cost` (why-chips-are-hard #ch10),
`pension-paygo-dependency` and `retirement-age-levers` (A #ch6, #ch7), `regression-correlation`,
`ai-cheap-thinking` (scarcity-moves #c11),
`task-displacement-reinstatement` and `baumol-cost-disease` (Q8: growth with a bottleneck sector).

Frontier, and what to source: published estimates of AI's effect on aggregate productivity, low to high
(Acemoglu's task-based estimate; the higher bank and consultancy forecasts; the "explosive growth" models), each
with the assumption that produces it; "ideas are getting harder to find" (Bloom, Jones, Van Reenen and Webb) and
its critics; measured productivity growth through 2026 (BLS, OECD, the Conference Board's Total Economy
Database, Penn World Table); learning rates for solar, batteries and wind (IRENA, published series). Forecasts
are 声称; a measured productivity series is 已确立; a firm-level trial is 已演示.

Risk: medium. "Institutions cause growth" and any account of one country's slowdown are contested: show the
decomposition and the competing explanations, not a diagnosis. AI forecasts are labelled as forecasts with their
date and author.

---

### Q8 = N2 · `economics/labour/where-wages-come-from/` (next queue, second)

Unchanged by the second commission, except that E now owns `ai-productivity-frontier` (the growth side of AI);
this essay owns the labour side and the two frontier chapters must be written against each other.

**工资是怎么定出来的，AI 会改什么 / Where Wages Come From, and What AI Changes.** New subtopic
`economics/labour` (劳动 / Labour). Stage: university. This is the deep version of `scarcity-moves` #c11–#c14;
it must be written with that page open.

One question: 同样干八小时，为什么不同的活工资差几十倍？一种能做很多脑力任务的机器出现以后，这笔账怎么变？

Reader questions: 工资是由什么决定的 · 为什么工资涨得慢 · 最低工资会导致失业吗 · AI 会取代哪些工作 · AI 会让人失业吗 · 为什么医疗教育越来越贵 ·
鲍莫尔病是什么 · 学历溢价 · 劳动收入份额为什么下降 · 机器换人 · 35 岁以后怎么办 (the mechanism only) · what determines wages · does
the minimum wage cause unemployment · will AI take my job · which jobs are most exposed to AI · why are healthcare
and education so expensive · what is Baumol's cost disease · why has the labor share fallen.

Chapter ladder:
1. 工资不是对辛苦的补偿，是对"多你一个人多出多少"的出价。
2. 这笔出价什么时候不成立：雇主只有一家的时候。
3. 最低工资：同一条规定，在两种市场里效果相反。
4. 技能溢价：教育和技术的赛跑。
5. 机器替代的是任务，不是职业。(Three-sentence recap of scarcity-moves #c12, then the model.)
6. 替代效应、生产率效应、新任务：工资是涨是跌取决于三者谁大。
7. 瓶颈：最慢的那一环决定整体。
8. 鲍莫尔成本病：没进步的行业为什么越来越贵、雇的人越来越多。
9. 劳动份额：蛋糕变大，和分到多少，是两件事。
10. 前沿在哪：到 2026 年 11 月为止，关于 AI 与就业量到了什么。
11. 收尾：读到"AI 将取代 X% 的工作"时问的五件事。

Models:
- **Marginal product.** Y = A·K^α·L^(1−α); w = (1 − α)·Y/L; labour share = 1 − α. The reader adds workers or
  capital and reads the wage.
- **Monopsony.** Labour supply to the firm w(L) = w₀·L^(1/ε); marginal cost of labour = w·(1 + 1/ε); employment
  where MRP = MCL. A minimum wage between the monopsony wage and the competitive wage raises employment; above
  the competitive wage it lowers it. One slider (ε) moves the market from one regime to the other.
- **Race between education and technology.** ln(w_H/w_L) = [(σ − 1)/σ]·ln(A_H/A_L) − (1/σ)·ln(H/L)
  (Katz–Murphy); the reader moves relative supply and relative technology.
- **Task model.** Tasks on [N − 1, N]; machines do the tasks below I, labour the rest; new tasks raise N. In
  the Cobb–Douglas-over-tasks case the labour share is N − I. Use the Acemoglu–Restrepo 2019 formulation exactly
  and cite it; show the wage change split into a displacement term and a productivity term as I moves, and what
  a rise in N restores.
- **Bottleneck.** CES over two tasks with elasticity σ < 1: speed one up a thousandfold and output rises by a
  bounded factor; the slow task's share of cost goes to one. (Same mathematics as the model in scarcity-moves
  #c11; link it and extend to wages.)
- **Baumol.** Two sectors, productivity growing at g in one and 0 in the other, a common wage: the relative
  price of the stagnant sector rises at g, and its share of employment rises when demand is price-inelastic.

Owns: `wage-marginal-product`, `monopsony-minimum-wage`, `skill-premium-education-race`,
`task-displacement-reinstatement`, `baumol-cost-disease`, `ai-labour-evidence-frontier` (the frontier concept).
Links, never re-teaches: `income-to-the-scarce`, `ai-cheap-thinking`, `ai-tasks-wages`,
`relative-prices-after-ai`, `ai-forecast` (scarcity-moves #c9, #c11–#c14: recap in three sentences each, deep
link, then go further), `labour-u3-u6-beveridge-okun` (how unemployment is measured; the Beveridge curve),
`supply-demand`, `price-elasticity` and `tax-wedge-deadweight-loss` (supply-demand #step2, #step1), `monopoly-pricing-lerner` (the mirror
image of monopsony), `solow-growth-accounting-tfp`, `ai-productivity-frontier` (Q7), `ai-stack-antitrust`
(why-a-few-firms-win #ch12: who captures the surplus), `hypothesis-testing` and `regression-correlation` (reading
a field experiment), `llm-sampling`.

Frontier, and what to source: exposure measures and what they do and do not predict (Eloundou et al. and
successors); randomised or staggered-rollout studies of AI assistance at work (customer support, writing,
software) with effect sizes and who gained most; employment and wage data for exposed occupations and for
entry-level workers through 2026 (the published studies using payroll data; national statistics); usage data
published by model providers (state who published it and what it can show); the price of a unit of model output
over time (provider price lists, dated). Sorted strictly into 已确立 (measured in official data), 已演示 (a trial
in one setting) and 声称 (forecasts, vendor statements).

Risk: high for two reasons. The minimum wage is politically contested: the model shows both regimes and the
empirical range. AI-and-jobs forecasts are contested and fast-moving: no number about the future is stated
without author, date and assumption, and the essay gives no career advice.

---

### Q9 → commissioned as I (`economics/money/what-makes-a-stablecoin-stable`): reference brief

Read with §4.I. Original heading: `economics/money/what-a-stablecoin-is/`

**稳定币、数字人民币和银行存款，有什么不一样 / What Is a Stablecoin, and How Is It Different from a Bank Deposit?**
Stage: university. Commission after Q3.

One question: 手机里的三个"1 块钱"（银行存款、支付账户余额、稳定币），背后各是谁的欠条？哪一个在哪种情况下会不值 1 块？

Reader questions: 稳定币是什么 · 稳定币怎么赚钱 · USDT 安全吗 (the mechanism, not a rating) · 稳定币为什么会脱锚 · 数字人民币和支付宝有什么区别 ·
央行数字货币是什么 · 稳定币和比特币的区别 · 跨境汇款为什么又慢又贵 · 什么是代币化存款 · what is a stablecoin · how do stablecoins
keep their peg · how do stablecoin issuers make money · what is a CBDC · why did Terra collapse · stablecoin vs
bank deposit · why are international transfers slow.

Chapter ladder:
1. 钱是分层的：央行的欠条、银行的欠条、别的机构的欠条。
2. 一笔付款是怎么结清的：记账、净额、最终性。
3. 稳定币的资产负债表：它更像货币基金，还是更像银行。
4. 1 块钱是怎么守住的：铸造、赎回和套利区间。
5. 守不住的时候：储备有问题的脱锚，和储备没问题也会发生的脱锚。
6. 没有储备的那一种：算法稳定币为什么会螺旋归零。
7. 这门生意赚的是什么钱。
8. 央行自己发：数字货币的几个设计旋钮，和它对银行的影响。
9. 跨境：代理行链条贵在哪，几种新办法各省掉了哪一环。
10. 前沿在哪：各地的法规、规模、和还没回答的问题。
11. 收尾：看到一种新的"数字美元"时问的五件事。

Models:
- **T-accounts.** The reader moves 100 from a bank deposit into a stablecoin, into a money fund and into a CBDC
  and watches the four balance sheets (central bank, bank, issuer, holder); the bank's funding changes
  differently in each case.
- **Peg band.** With redemption cost c and delay, arbitrage bounds the market price to [1 − c, 1 + c]; when
  redemption is gated or the reserve's market value is v < 1, the bound becomes v. The reader marks a share of
  reserves as illiquid or impaired.
- **Run.** Reserves: fraction ℓ liquid at par, the rest sold at a discount d(q) rising in the quantity sold.
  Redemptions ρ are met in full iff ρ ≤ ℓ + (1 − ℓ)(1 − d). Holders who expect others to redeem redeem
  themselves: two equilibria between two thresholds (deep link `bank-run`; do not rebuild Diamond–Dybvig).
- **Algorithmic spiral.** A stable token redeemable for 1 unit of value of a sister token with supply S and
  market value M: each redemption mints 1/(M/S) new sister tokens; with demand for the sister token falling as
  S rises, find the redemption volume beyond which M → 0.
- **Issuer income.** Income = reserves × short rate − costs; the holder's forgone interest is the same number.
  Link to why-one-rate #ch5 for where the short rate comes from.
- **CBDC and bank funding.** A share x of deposits moves to a CBDC with holding cap H: bank funding gap =
  min(x·D, N·H), replaced at a wholesale rate; the reader sets the cap and whether the CBDC pays interest.

Owns: `money-hierarchy-settlement`, `payment-rails-settlement-finality`, `stablecoin-peg-reserves`,
`stablecoin-run-depeg`, `cbdc-design`, plus one frontier concept.
Links, never re-teaches: `money-as-iou`, `loans-create-deposits`, `bank-run` (where-money-comes-from #ch1–#ch3),
`reserves-floor-system` (why-one-rate #ch5), `maturity-liquidity-transformation`, `fire-sales-liquidity-spiral`,
`collateral-haircut-repo` (Q3), `trilemma-exchange-rate-regimes` and `reserve-currency-dollar` (Q6: a currency
board is the same arithmetic; dollarisation), `duration-supply-demand` (B: issuers as buyers of bills),
`hashing`, `rsa-encryption` (signatures and ledgers: one paragraph and links; this essay does not teach
blockchains or consensus, and does not discuss the price of any crypto-asset).

Frontier, and what to source: the stablecoin laws and their implementation dates (the US federal statute of 2025
and its rulemakings, the EU's MiCA, Hong Kong's ordinance, others) from the official texts; supply and reserve
composition from issuers' attestations, with what an attestation does and does not verify; measured effects on
Treasury-bill yields (BIS working papers); the status of e-CNY, the digital euro and other CBDC projects from the
central banks' own progress reports; tokenised-deposit and wholesale projects (BIS Innovation Hub); the measured
cost of remittances (World Bank). Everything dated.

Risk: high. Money-adjacent and fast-moving. No product is called safe or unsafe; the page shows which balance
sheet stands behind each kind of money and under what condition it breaks. The audit of 2026-11-11 marked a crypto
essay as commissioned, and no such page is in the registry: the team lead should confirm whether one exists on a
branch before commissioning Q9, and if it does, Q9 links it for everything on-chain.

---

### 3.11 The next queue, beyond A–K

Eight essays, in order. N1 and N2 are the Q2 and Q8 briefs above, with the changes noted under their headings.
N3–N8 are briefed here. The ids N5, N6 and N8 own are new and appear only in their briefs, not in §1 (except
`price-controls-shortage`); they are created at registration. The common rules in §3.0a apply to all eight.

| | Slug | Why this position |
|---|---|---|
| N1 | `investment/portfolio/how-much-risk-is-worth-taking` | completes 从存钱到期权 between `diversification` and the derivatives draft; G and J both need something to point at for "how much risk" |
| N2 | `economics/labour/where-wages-come-from` | the audit's worst ladder (AI economics, 0.10); pairs with E's frontier chapter while both are fresh |
| N3 | `economics/macro/why-recessions-happen` | K explains prices; nothing explains output. Closes the business-cycle ladder (0.29) |
| N4 | `economics/money/how-a-crisis-spreads` | F explains one bank; this explains the system. Completes 从印钱到金融危机 |
| N5 | `economics/public-finance/where-taxes-fall` | what was left of Q1; A, C and the supply-demand lesson all stop where it starts |
| N6 | `investment/planning/how-long-will-the-money-last` | the personal-finance cluster has only a mortgage page |
| N7 | `investment/basics/why-markets-go-mad` | fills the investment atlas's empty 行为 region; what G leaves out |
| N8 | `economics/markets/how-electricity-is-priced` | audit item 27; the cleanest real market for marginal pricing; links the site's physics |

Also wanted, not briefed: `economics/markets/why-housing-costs-so-much` (needs N5 and why-one-rate #ch8);
inequality and distribution (基尼系数 is buried in `ppp-balassa-samuelson-gini`; Pareto tails link J's
`fat-tails-levy-stable`); behavioural economics outside finance (belongs in `psychology`); the economics of
compute and tokens as its own page if N2 and E's frontier chapters outgrow it.

#### N3 · `economics/macro/why-recessions-happen/`

**经济为什么会突然少生产一截 / Why Do Recessions Happen?** Stage: university.

One question: 工厂、工人和技术都还在，订单为什么会一起消失，又为什么过一两年自己回来？

Reader questions: 经济衰退是怎么发生的 · 经济周期是什么 · 为什么会有经济危机 · 节约悖论 · 库存周期 · 朱格拉周期 康波周期 靠谱吗 ·
衰退和萧条的区别 · 软着陆是什么 · 自动稳定器 · 资产负债表衰退 · what causes a recession · what is the business cycle ·
paradox of thrift · what is an inventory cycle · what is a soft landing · recession vs depression · are economic
cycles predictable.

Chapter ladder:
1. 一个人省钱是美德，所有人同时省钱是衰退。(From `spending-is-income`; the multiplier is A's #ch8, linked.)
2. 加速数：投资跟着销售的变化走，所以比销售抖得厉害。
3. 两样合起来，经济会自己摆。
4. 库存：零售少卖一成，工厂为什么少产三成。
5. 冲击从哪里来：需求、供给、金融、政策。(K's `aggregate-demand-supply-shocks`, linked, applied to output.)
6. 信贷：好的时候借得多，坏的时候一起还。(Balance-sheet recessions; N4 and F own the financial mechanics.)
7. 自动稳定器与逆周期政策：谁在踩刹车，踩得准不准。
8. 周期能预测吗：领先指标的记录，和"规律周期"的证据。
9. 前沿在哪：2020 年以来的几次"该来没来"和"来了很短"。
10. 收尾：听到"衰退风险上升"时问的五件事。

Models:
- **Paradox of thrift.** Y = C₀ + cY + I: lower c for everyone and income falls until saving again equals I.
- **Multiplier–accelerator.** Y_t = c·Y_{t−1} + v·c·(Y_{t−1} − Y_{t−2}) + G; the (c, v) plane split into monotone,
  damped, explosive regions by the roots of λ² − c(1 + v)λ + cv = 0 (Samuelson 1939).
- **Inventory bullwhip.** Three-stage chain; each stage orders O_t = D̂_t + (S* − S_t)/T with a forecast
  D̂_t = αD_t + (1 − α)D̂_{t−1} and a delivery lag L; a 10% step in final demand gives an amplified, oscillating
  order stream upstream (Metzler 1941; Forrester's beer game).
- **Automatic stabiliser.** The same shock with a tax-and-transfer share τ: multiplier 1/(1 − c(1 − τ)); reader
  compares the depth of the trough at τ = 0 and τ = 0.4.
- **Leading indicator as a classifier.** A noisy signal of recessions with base rate p: hit rate, false alarms and
  the probability of recession given a signal (Bayes), using the published record of one named indicator.

Owns: `multiplier-accelerator-cycle`, `inventory-bullwhip-cycle`, `paradox-of-thrift`,
`automatic-stabilisers-countercyclical-policy`, `balance-sheet-recession`, `leading-indicators-forecasting-record`,
one frontier concept.
Links, never re-teaches: `spending-is-income`; `fiscal-multiplier` (A #ch8); `aggregate-demand-supply-shocks`,
`inflation-expectations-anchoring`, `deflation-debt-deflation` (K); `business-cycle-sahm-potential` and
`labour-u3-u6-beveridge-okun` (who dates a recession, Okun, the Sahm rule: done); `taylor-rule-neutral-rate`,
`new-keynesian-model`, `zero-lower-bound-qe`; `inversion-decomposition` (B: the yield curve as an
indicator); `leverage-balance-sheet` (F) and `credit-cycle-minsky`, `fire-sales-liquidity-spiral` (N4); `poles`,
`feedback`, `ode-phase-portraits` (the oscillator is a second-order system: say so and link); `bayes`,
`base-rate-neglect`; `tcp-congestion` if its model shows delay-induced oscillation.

Frontier, and what to source: the forecasting record of professional forecasters and of named indicators around
2022–2026 (central-bank and survey-of-forecasters archives); nowcasting methods (link how-an-economy-is-measured
#ch10); evidence on whether expansions "die of old age"; the inventory and supply-chain episode of 2021–2023
(published studies). Long-wave "cycles" (Kondratiev and similar): state what evidence exists and label the rest
某方声称.

Risk: medium. Stimulus is contested and A carries that evidence. No forecast of any economy.

#### N4 · `economics/money/how-a-crisis-spreads/`

**一家出事，为什么全市场一起缺钱 / How a Crisis Spreads.** Stage: university. Commission after F is live.

One question: 没有储户排队的地方，挤兑是怎么发生的？一家机构的损失，怎么变成所有人的损失？

Reader questions: 什么是系统性风险 · 什么是影子银行 · 回购是什么 · 流动性危机是什么意思 · 钱荒是怎么回事 · 为什么大家同时抛售 ·
雷曼倒闭为什么影响全世界 · 明斯基时刻 · 2020 年 3 月美债为什么也跌 · 保证金追缴 · what is systemic risk · what is the repo
market · what is a liquidity crisis · what is shadow banking · what is a fire sale · what is a Minsky moment · why
did Treasuries sell off in March 2020.

Chapter ladder: (1) F's bank in three sentences, then the same balance sheet without deposits; (2) repo: a loan
with collateral and a haircut; (3) haircuts set leverage, so a rise in haircuts is a run; (4) fire sales; (5)
why intermediaries buy high and sell low: leverage targets; (6) margin spirals in derivatives (link the draft
#ch9); (7) the network: who owes whom; (8) the credit cycle: calm breeds leverage; (9) securitisation, if F left
it; (10) the dash for cash of March 2020 as the worked case; (11) frontier; (12) five questions.

Models: the haircut spiral, leverage targeting and Eisenberg–Noe clearing models from the Q3 reference brief,
with their equations (max leverage 1/h; required sales A − E/h; P = P₀e^(−κ·sales); ΔA = L·ΔE;
p = min(p̄, Πᵀp + e)); plus a **Minsky classifier** (a borrower's income against interest and principal: hedge,
speculative, Ponzi, and how a rate rise moves the population between classes) and a **common-holdings** model
(N funds holding overlapping portfolios; one fund's sales mark down the others).

Owns: `collateral-haircut-repo`, `fire-sales-liquidity-spiral`, `contagion-financial-network`,
`credit-cycle-minsky`, `securitisation-shadow-banking` (if F did not register it),
`non-bank-intermediation-leverage` (the frontier concept).
Links, never re-teaches: everything F owns (`leverage-balance-sheet`, `maturity-liquidity-transformation`,
`bank-run-diamond-dybvig`, `capital-requirements-lender-of-last-resort`); `bank-run`;
`margin-leverage-central-clearing`; `bond-duration-convexity`; `credit-spread-triangle` and
`duration-supply-demand` (B); `stablecoin-run-depeg` (I); `currency-crisis-speculative-attack` (H);
`lemons-market` (D: why trading stops when nobody knows who holds the losses); `diversification`;
`graph-algorithms`; `feedback`; `supply-demand` (a demand curve that slopes the wrong way).

Frontier, and what to source: FSB's annual non-bank report; IMF GFSR; BIS Quarterly Review on the Treasury basis
trade and on private credit; central banks' own accounts of March 2020 and of the UK gilt episode of 2022; where
central clearing of Treasuries stands. Dated; the three labels.

Risk: medium. No named institution or fund type is called unsafe beyond what an official document says.

#### N5 · `economics/public-finance/where-taxes-fall/`

**税和限价：写在谁头上，落在谁头上 / Where Taxes and Price Caps Really Fall.** Stage: senior to university.

One question: 一笔税写在卖家头上，为什么最后可能是买家付？把价格压住，东西为什么反而买不到？

Reader questions: 消费税到底谁出 · 增值税是怎么回事 · 个税累进是怎么算的 · 边际税率和平均税率 · 拉弗曲线 · 税率越高税收越多吗 · 为什么限价会缺货 ·
房租管制有用吗 · 补贴到底补给了谁 · 房产税会让房价跌吗 · who really pays a sales tax · marginal vs average tax rate · how
does VAT work · what is the Laffer curve · why do price caps cause shortages · does rent control work · who
benefits from a subsidy.

Chapter ladder: (1) the wedge, recapped from supply-demand #step1 in three sentences; (2) incidence shares from
elasticities; (3) why the loss grows with the square of the rate; (4) the revenue hump; (5) marginal and average
rates, brackets, and the notches that make people worse off for earning more; (6) VAT against a sales tax
against an income tax: the same wedge in different places; (7) subsidies run the wedge backwards; (8) price
ceilings: shortage, queues, quality; (9) the long run: the same cap after ten years; (10) taxing land and other
things that cannot move; (11) frontier; (12) four questions.

Models:
- **Incidence.** Buyers' share = ε_s/(ε_s − ε_d), sellers' share = −ε_d/(ε_s − ε_d); a toggle moves the legal
  payer and nothing changes.
- **Deadweight loss and revenue.** DWL ≈ ½·t²·[ε_s|ε_d|/(ε_s + |ε_d|)]·Q/P; revenue R(t) = t·Q(t); both on one
  axis, so the reader finds the hump and sees the loss overtake the revenue.
- **Brackets.** A schedule the reader edits; marginal rate, average rate and take-home against income; add a
  benefit that is withdrawn at a threshold and read the implied marginal rate above 100%.
- **VAT chain.** Three firms; tax collected at each stage on value added (uses `gdp-three-ways`); break the chain
  with one firm outside the system and see the cascade.
- **Price cap over time.** Shortage Q_d(P̄) − Q_s(P̄) with supply adjusting by
  Q_s,t = Q_s,t−1 + λ(Q_s*(P̄) − Q_s,t−1).

Owns: `tax-incidence-elasticity-shares`, `deadweight-loss-revenue-hump`, `marginal-average-tax-rate`,
`vat-value-added-chain`, `price-controls-shortage`, `land-tax-inelastic-base`, one frontier concept.
Links, never re-teaches: `supply-demand`, `price-elasticity`, `tax-wedge-deadweight-loss`,
`consumer-producer-surplus` (the Q1 registration: the wedge, the areas and elasticity are that lesson's);
`tariff-incidence-pass-through` and `tariff-welfare-accounting` (C: a tariff is this essay's wedge at the border);
`externalities` (a tax that removes a loss instead of creating one); `deficit-primary-balance` (A: what the
revenue is for); `gdp-three-ways` (value added); `monopoly-pricing-lerner` (pass-through under market power);
`monopsony-minimum-wage` (N2: the price floor that is the minimum wage); `incentives`; `median-voter`;
`veil-of-ignorance` (progressivity as insurance); `derivative`, `integral`.

Frontier, and what to source: measured pass-through of recent VAT and excise changes; elasticity of taxable
income estimates and their range; rent-control studies (short-run transfer, long-run supply) with city and date;
the OECD global minimum tax's implementation status; property-tax pilots where they exist. Official texts and
published studies only.

Risk: politically contested throughout. One model, two outputs (who gains now, what changes later), measured
ranges, no recommended rate.

#### N6 · `investment/planning/how-long-will-the-money-last/`

**存的钱够花多少年 / How Long Will the Money Last?** New subtopic `investment/planning` (一生的钱 / Money over a
Lifetime). Stage: senior to university.

One question: 工作四十年，退休三十年。中间那笔账，最怕的到底是收益低、活得长，还是坏年份来得早？

Reader questions: 存多少钱才能退休 · 4% 法则是什么 · 应急金留多少 · 年金险划算吗 · 定投真的能摊低成本吗 · 通胀会吃掉多少养老钱 ·
先还房贷还是先存钱 · 养老金替代率 · 目标日期基金是什么 · how much do I need to retire · what is the 4% rule · what is
sequence of returns risk · are annuities worth it · does dollar-cost averaging work · how big should an emergency
fund be.

Chapter ladder: (1) the lifetime budget as one present-value identity; (2) the saving rate decides the years to
a target more than the return does; (3) real against nominal; (4) the withdrawal problem; (5) sequence risk: the
same returns in a different order; (6) longevity: you do not know the horizon; (7) annuities as pooling; (8) the
three pillars and what a replacement rate is (A's #ch6, linked); (9) an emergency fund as self-insurance; (10)
regular investing: what it does and does not do; (11) frontier; (12) five questions.

Models:
- **Years to a target.** Wealth W_t = W_{t−1}(1 + r) + s·Y; with spending (1 − s)·Y and a withdrawal rate w,
  years to reach (1 − s)·Y/w as a function of s; the curve is steep in s and shallow in r.
- **Withdrawal.** W_t = W_{t−1}(1 + r_t) − c with real spending c fixed; deterministic depletion time
  n = −ln(1 − rW₀/c)/ln(1 + r); then the same with random r_t.
- **Sequence risk.** One set of 30 annual returns, shuffled: identical average, depletion year ranging over
  decades. Monte Carlo fan with the probability of running out.
- **Longevity pooling.** N retirees with a survival curve; self-insuring to age 100 against a pooled annuity
  paying W₀/ä(x): the mortality credit as a number, and what adverse selection does to the price.
- **Regular investing.** Lump sum against equal instalments on the same random paths: distribution of outcomes,
  not a winner.

Owns: `lifetime-budget-saving-rate`, `withdrawal-rate-depletion`, `sequence-of-returns-risk`,
`longevity-risk-annuity`, `emergency-fund-self-insurance`, one frontier concept.
Links, never re-teaches: `compound-interest`, `present-value-discounting`, `annuity-payment-formula` (the same
formula run backwards), `fees-compounding`, `inflation-opportunity-cost-loan`, `mortgage-prepayment`,
`risk-return`, `diversification`, `volatility-drag-geometric-return` and `kelly-criterion` (N1), J's
`random-walk-sqrt-t` and `gamblers-ruin-first-passage` (running out is a first-passage problem), `montecarlo`,
`risk-pooling`, `lemons-market` (D: why annuities are priced for the long-lived),
`pension-paygo-dependency` and `retirement-age-levers` (A), `expected-value`, `survivorship-bias`.

Frontier, and what to source: published studies of safe withdrawal rates outside the United States and their
dependence on the sample; actuarial life tables (national statistics, dated); annuity pricing and money's-worth
studies; pension replacement rates (OECD Pensions at a Glance); evidence on target-date glide paths.

Risk: the highest advice risk in the queue. Every output is "what this model gives under these assumptions";
no rule of thumb is endorsed, including the 4% rule, which is presented with the sample it came from; no product
type is recommended. State once that this is not financial advice and that tax and pension rules differ by
country and are not modelled.

#### N7 · `investment/basics/why-markets-go-mad/`

**价格可以离谱多久 / How Long Can a Price Stay Wrong?** Stage: university. Commission after G.

One question: 如果很多聪明人都看得出价格不对，它为什么还能不对好几年？

Reader questions: 股市泡沫是怎么形成的 · 怎么判断是不是泡沫 · 郁金香泡沫是真的吗 · 什么是损失厌恶 · 为什么散户追涨杀跌 · 处置效应 ·
羊群效应 · 做空为什么危险 · 逼空是什么 · 反身性 · how do bubbles form · how to spot a bubble · what is loss aversion ·
why do investors sell winners and hold losers · what is a short squeeze · what is herding · limits to arbitrage.

Chapter ladder: (1) G's fundamental value in three sentences, and a price that leaves it; (2) a bubble that
rational people hold; (3) why betting against it can ruin you first; (4) short selling and the squeeze; (5)
herding: copying can be rational; (6) how people weigh gains and losses; (7) the disposition effect and
overtrading in data; (8) experiments: bubbles in a laboratory where everyone knows the value; (9) feedback from
prices to fundamentals; (10) history, sorted by how good the evidence is; (11) frontier; (12) five questions.

Models:
- **Rational bubble.** P_t = F_t + b_t, E[b_{t+1}] = (1 + r)b_t, burst probability p per period, so a surviving
  bubble grows at (1 + r)/(1 − p) (Blanchard and Watson 1982).
- **Limits to arbitrage.** An arbitrageur with capital K and leverage limit L shorts a mispricing m_t that
  follows a random walk before reverting; losses trigger withdrawals proportional to the loss (Shleifer and
  Vishny 1997): the probability of being forced out before reversion, against L.
- **Information cascade.** Agents with private signals of accuracy q act in sequence and see earlier actions
  (Bikhchandani, Hirshleifer and Welch 1992): after two matching actions everyone copies; the reader counts wrong
  cascades over many runs.
- **Prospect-theory value.** v(x) = x^α for gains, −λ(−x)^β for losses, with decision weights; defaults from
  Tversky and Kahneman 1992 (check in the paper); choices compared under expected value.
- **Laboratory market.** A Smith–Suchanek–Williams asset with known declining dividend value and a mix of
  fundamental and momentum traders: the hump and crash, and what experience does to it.

Owns: `bubbles-limits-to-arbitrage`, `short-selling-squeeze`, `information-cascade-herding`,
`prospect-theory-loss-aversion`, `disposition-effect-overtrading`, one frontier concept.
Links, never re-teaches: `dcf-valuation`, `valuation-multiples-pe`, `efficient-markets-random-walk`,
`active-management-arithmetic` (G); J's `random-walk-sqrt-t` and `gamblers-ruin-first-passage` (the arbitrageur's
ruin); `leverage-balance-sheet` (F) and `fire-sales-liquidity-spiral` (N4); `margin-leverage-central-clearing`
and `implied-volatility-smile-fat-tails` (the draft); `kelly-criterion` (N1); `expected-value`, `bayes` (a
cascade is Bayes with public actions), `bandit-arms`, `base-rate-neglect`, `survivorship-bias`,
`regression-to-the-mean`; `network-effects-critical-mass` (the draft: adoption cascades);
`credit-cycle-minsky` (N4); `signal-detection-theory`, `memory-attention` (psychology).

Frontier, and what to source: replication status of the main behavioural findings (loss aversion's size across
studies; the disposition effect in brokerage data); retail trading and short-dated options since 2020 (exchange
statistics, published studies); the 2025–2026 valuation debate, linked to G and not repeated; laboratory-bubble
results with experienced and AI traders if published. The three labels.

Risk: high. The essay must say plainly that no model here identifies a bubble in real time, and it names no
current asset as one. Historical episodes carry their sources; popular accounts of early bubbles are checked
against the economic-history literature and labelled where the story outruns the evidence.

#### N8 · `economics/markets/how-electricity-is-priced/`

**电价是怎么定出来的，为什么会出现负电价 / How Electricity Is Priced.** Stage: university.

One question: 同一度电，中午值负的，傍晚值平时的十倍。一个不能存的商品，价格是怎么每几分钟定一次的？

Reader questions: 电价是怎么定的 · 为什么会有负电价 · 峰谷电价 · 现货市场是什么 · 边际定价 · 为什么气价涨电价也涨 · 虚拟电厂是什么 ·
储能怎么赚钱 · 容量电价 · 度电成本 LCOE · 新能源为什么压低电价 · how are electricity prices set · why are power prices
negative · what is marginal pricing · what is the merit order · how does battery storage make money · what is a
capacity market · what is LCOE.

Chapter ladder: (1) a good that must balance every second; (2) the merit order: plants ranked by marginal cost;
(3) the last plant sets the price for all: why, and who gains; (4) demand barely responds, so small shortages
are large prices; (5) wind and sun at zero marginal cost: the curve shifts and the midday price collapses; (6)
negative prices; (7) storage: buying the trough, selling the peak, and flattening its own profit; (8) the
missing money: who pays for a plant that runs fifty hours a year; (9) the wires: location, congestion; (10)
LCOE and why it is not the value of a plant; (11) frontier: data-centre load, market reforms; (12) five questions.

Models:
- **Merit order.** Plants (capacity, marginal cost) sorted into a supply stack; clearing price = marginal cost of
  the last unit dispatched; the reader moves demand, the gas price and the renewable output and reads price and
  each plant's inframarginal rent.
- **Scarcity.** Demand with elasticity ε near −0.1: a 5% shortfall of capacity as a price multiple, P₁/P₀ =
  (Q₁/Q₀)^(1/ε).
- **Storage arbitrage.** A battery with power P, energy E and round-trip efficiency η against a daily price
  curve: profit = Σ(p_sell·η − p_buy)·q; as installed storage grows the spread closes and marginal profit falls
  to zero.
- **Missing money.** A peaker's annual margin = hours at scarcity × (price cap − marginal cost) against its
  fixed cost: the cap below which it is never built, and the capacity payment that replaces the gap.
- **LCOE against value.** LCOE = Σ(costs_t/(1 + r)^t)/Σ(energy_t/(1 + r)^t), beside the plant's capture price
  (output-weighted market price): the gap widens as its own technology's share grows.

Owns: `merit-order-marginal-pricing`, `scarcity-pricing-inelastic-demand`, `negative-prices-renewables`,
`storage-arbitrage`, `missing-money-capacity-payment`, `lcoe-capture-price`, one frontier concept.
Links, never re-teaches: `supply-demand`, `price-elasticity`, `consumer-producer-surplus`;
`marginal-thinking` and `price-signal` (scarcity-moves #c2, #c4); `monopoly-pricing-lerner` and
`minimum-efficient-scale-natural-monopoly` (the draft: withholding capacity; the wires as a natural monopoly);
`externalities` (carbon pricing shifts the stack); `price-controls-shortage` (N5: a price cap is one);
`present-value-discounting` (LCOE is a present-value ratio); `wrights-law-cost-curve` (E: why solar and
batteries got cheap); `auctions` and `mechanism-auction` (a power exchange is a uniform-price auction);
`forward-price-cost-of-carry` and `hedging-basis-risk-notional` (the draft: power forwards; why a non-storable
good breaks cost-of-carry); `power`, the site's circuits and power-converter pages, and
`how-power-reaches-the-cpu` for the physical side; `climate-energy`.

Frontier, and what to source: hours of negative prices by market and year (exchange and system-operator data);
installed storage and its revenue mix; China's power-market reform documents and spot-market pilots (NDRC and NEA
texts); the EU's market-design reform; data-centre demand forecasts with their authors and ranges; capacity
market outcomes. Dated; forecasts labelled 声称.

Risk: data-heavy and jurisdiction-specific. Pick two or three named markets, state the rules as of a date, and
do not generalise beyond them. Marginal pricing against pay-as-bid is contested: show both in the model.

### 3.10 Later candidates from the first plan (the first three are now N6, N5 and N8 above)

- **`investment/planning/how-long-will-the-money-last`** 存的钱够花多少年: saving rate and time to a target, real
  returns, sequence-of-returns risk, the withdrawal-rate problem as a Monte Carlo, annuities as longevity pooling.
  Needs Q2 (`volatility-drag-geometric-return`) and A (`pension-paygo-dependency`). Highest advice risk on the list.
- **`economics/public-finance/where-taxes-fall`** 税和限价: marginal against average rates, progressivity, why
  deadweight loss grows with the square of the rate, the revenue hump, VAT against income tax, and price ceilings
  and floors with the long-run supply response. Owns `price-controls-shortage`. First in line after Q9; it is
  what is left of the original Q1.
- **`economics/energy/how-electricity-is-priced`** (audit item 27): merit order, marginal pricing, negative
  prices, storage arbitrage. Pair with the physical-grid essay if it exists.
- **`economics/markets/why-housing-costs-so-much`**: supply elasticity by city, land, user cost of housing,
  price-to-rent. Needs the tax-and-price-controls page and why-one-rate #ch8.
- **Behavioural economics outside finance** (anchoring, present bias, defaults): belongs in `psychology`, with
  edges to `prospect-theory-loss-aversion`.
- **Aliases only, no page**: 通胀怎么测量 / how is inflation measured → `price-indexes-chain-fisher`,
  `cpi-oer-hedonic-core`; 国债收益率倒挂 → `term-premium-curve-inversion` until B is live.

---

## 4. Ownership and cross-link addenda for the essays in flight

Each addendum is self-contained so it can be forwarded as is. A and C were written against the chapter lists in
their directories on 2026-11-25 (their `REGISTRY.json` concept lists were still empty). B and D were written
against their drafts' chapter lists and `REGISTRY.json` ids as they stood later the same day, and use the
writers' own ids. E–K had only `models.js` and no prose, so theirs are written against the one-line commission
and every id in them is a proposal. What matters is that no id duplicates an existing concept and that each
essay registers 7–9 concepts.

How ownership reaches the graph: the importer creates one node per entry in the essay's `REGISTRY.json`
`concepts` array, so a chapter that should not be a node is simply left out of that array. Edges are not read
from `REGISTRY.json`: they are written by hand into `atlas/graph/lessons/<slug>.json` → `edges` after the import
(the importer keeps them on re-import). So each writer lists the edges below in their final report, and the
registrar types them in.

"Attach the chapter to the existing concept as a second lesson" is a **proposed** mechanism. `decisions.json`
today holds two entries, both of which attach a whole lesson page to an existing node (`action: "attach"`, keyed
by lesson slug). Nothing in it yet points one essay chapter at another page's node. The registrar or the atlas
agent needs to confirm the generator can add an essay `#chN` anchor to an existing node's `lessons[]`. If it
cannot, the fallback is weaker but still correct: the chapter stays out of `concepts`, links the owning page in
its first lines, and takes none of the owner's aliases.

### 4.A · `economics/public-finance/can-a-country-go-bankrupt`

**What already exists.** `why-one-rate-moves-everything` #ch11 is the concept `debt-dynamics-r-minus-g`: it
states and models d′ = d(1 + r)/(1 + g) − pb. Your #ch3 states the same equation. Keep #ch3 (the essay cannot
work without it), but:

- Do not list #ch3 in `REGISTRY.json` `concepts`. The registrar will attach it to `debt-dynamics-r-minus-g` as a
  second lesson. Do not take the aliases r − g, 债务动态, 债务可持续性.
- Add one line at the top of #ch3 linking why-one-rate #ch11 (it shows the same equation from the bond market's
  side: where r comes from).
- Make #ch3 go past #ch11 in one specific way, so it earns its place: the debt-stabilising primary balance
  pb* = d·(r − g)/(1 + g), and, recommended, a fan chart. r and g are not known in advance; draw them from a
  distribution and show the path as a band, not a line (link `montecarlo`). If you add the fan chart, register
  it as `debt-sustainability-fan-chart` with anchor on that model.

**Owns (list these in `concepts`), by your chapters:**
- `deficit-primary-balance` — #ch2 赤字是水龙头，债务是浴缸 (fold #ch1's household comparison into this concept's aliases: 国家和家庭的账有什么不同).
- `public-debt-holders-currency` — #ch4 欠谁的，用什么钱欠.
- `sovereign-default-restructuring` — #ch5 违约长什么样.
- `pension-paygo-dependency` — #ch6 养老金：一道乘法.
- `retirement-age-levers` — #ch7 延迟退休.
- `fiscal-multiplier` — #ch8 财政乘数. You own this for the site: the rounds, the leaks, the measured range and
  what it depends on. Essay K and the later recession essay will link here and not re-derive it.
- one frontier concept — #ch9. #ch10 (the five questions) is not a concept.

**Must link (one line each, no re-teaching):** `debt-dynamics-r-minus-g` (why-one-rate #ch11);
`spending-is-income` (scarcity-moves #c8: #ch8's first round is this idea; link it where the multiplier starts);
`gdp-three-ways` and `price-indexes-chain-fisher` (how-an-economy-is-measured #ch1, #ch2: the denominator is
nominal GDP); `inflation-winners-losers` (where-money-comes-from #ch5: inflation as a transfer from creditors, for
#ch4); `quantity-theory-inflation` and `loans-create-deposits` (what "印钱还债" does mechanically);
`zero-lower-bound-qe` (why-one-rate #ch10: central-bank holdings of government debt, for #ch4);
`term-premium-curve-inversion` (why-one-rate #ch4) and essay B for what sets the borrowing rate;
`bank-run` (where-money-comes-from #ch3: a refinancing crisis in #ch5 is the same coordination game);
`risk-pooling` (#ch6: a pension is longevity insurance); `compound-interest`;
`labour-u3-u6-beveridge-okun` (#ch7: participation is measured there); `median-voter`
(same-votes-different-winner #ch3) if #ch7 discusses why reform is slow; `business-cycle-sahm-potential`
(#ch8: the multiplier depends on slack).

**Overlaps to avoid:**
- Yield-curve mechanics, duration, and the split of a sovereign spread into default probability × loss: B owns
  the new parts, why-one-rate the old ones. Show a spread as an input and link.
- Currency crises, pegs and the trilemma in #ch4–#ch5: essay H (`economics/money/what-sets-an-exchange-rate`, now
  commissioned) owns them. You own the own-currency against foreign-currency distinction and the anatomy of a
  default; one line on the rest, and a link once H is live.
- Inflating debt away as an inflation question, and inflation dynamics in #ch8: essay K
  (`economics/macro/what-makes-prices-rise`) owns expectations and deflation. Stop at the multiplier.
- Bank and sovereign feeding each other in #ch5: essay F (`economics/money/why-banks-run`) owns the bank side.
- Sides. On "modern monetary theory", austerity, and any country's pension reform, show the identity, the
  parameter values each camp assumes and what the model gives for each. Every 2025–2026 debt, deficit or pension
  figure carries its date and source (IMF Fiscal Monitor, national budget offices, OECD Pensions at a Glance).

**Edges to list in your report (registrar enters them):**
`debt-dynamics-r-minus-g>deficit-primary-balance:connection`, `gdp-three-ways>deficit-primary-balance:foundation`,
`deficit-primary-balance>public-debt-holders-currency:foundation`,
`inflation-winners-losers>public-debt-holders-currency:foundation`,
`zero-lower-bound-qe>public-debt-holders-currency:connection`,
`public-debt-holders-currency>sovereign-default-restructuring:foundation`,
`debt-dynamics-r-minus-g>sovereign-default-restructuring:foundation`,
`bank-run>sovereign-default-restructuring:connection`,
`deficit-primary-balance>pension-paygo-dependency:connection`, `risk-pooling>pension-paygo-dependency:connection`,
`pension-paygo-dependency>retirement-age-levers:foundation`,
`spending-is-income>fiscal-multiplier:foundation`, `gdp-three-ways>fiscal-multiplier:foundation`,
`debt-dynamics-r-minus-g>fiscal-multiplier:connection`; and if the fan chart is added,
`debt-dynamics-r-minus-g>debt-sustainability-fan-chart:foundation`, `montecarlo>debt-sustainability-fan-chart:foundation`.

### 4.B · `investment/rates/what-the-yield-curve-says`

**What already exists**, against your thirteen chapters and twelve registered ids of 2026-11-25. Three concepts
of `why-one-rate-moves-everything` cover the ground of five of your chapters:

| Your chapter and id | Existing owner | What to do |
|---|---|---|
| #ch1 `zero-coupon-bonds-coupon-effect` | `present-value-discounting` (why-one-rate #ch1), `yield-curve-bootstrapping` (#ch3) | keep the chapter, link both in its first lines, remove from `concepts` |
| #ch2 `forward-rate-lock-in` | `yield-curve-bootstrapping` (#ch3: spot and forward rates) | same |
| #ch3 `curve-builder-observational-equivalence` | `term-premium-curve-inversion` (#ch4: expectations plus a premium) | keep in `concepts` only if the chapter's point is the new one its id names (two different stories give the same curve); then say so in the title and link #ch4 |
| #ch6 `dv01-price-shock` | `bond-duration-convexity` (#ch2) | keep the chapter, link, remove from `concepts` |
| #ch7 `immunisation-barbell-bullet` | `bond-duration-convexity` covers convexity; immunisation and barbell against bullet are new | keep in `concepts`; recap convexity in three sentences and link |
| #ch9 `inversion-decomposition` | `term-premium-curve-inversion` (#ch4) explains why a curve inverts | keep in `concepts`: the decomposition of an inversion into expected rates and premium, and its record as a recession signal, are yours; link #ch4 |

The lesson `investment/rates/interest-rates-bonds` is the gentle start; link it in the hero. Do not take the
aliases 久期, 修正久期, 凸性, 即期利率, 远期利率, 期限溢价, 预期假说, 收益率曲线倒挂, 为什么长期国债跌得多: they are registered to
why-one-rate. Yours are the ones nobody owns: DV01, 骑乘收益/滚动收益, 免疫策略, 哑铃和子弹, 曲线变陡/变平, 倒挂一定衰退吗,
信用利差, 垃圾债, 高收益债, 违约率, 评级下调.

**Owns (keep in `concepts`; nine):** `curve-builder-observational-equivalence` (#ch3, on the condition above),
`holding-period-return-rolldown` (#ch4), `term-premium-acm-kim-wright` (#ch5), `immunisation-barbell-bullet`
(#ch7), `level-slope-curvature` (#ch8), `inversion-decomposition` (#ch9), `credit-spread-triangle` (#ch10),
`junk-bonds-default-clustering` (#ch11), `yield-curve-2022-2026` (#ch12).

Two things the plan wanted from this essay that your chapter list does not show; add them if there is room, and
say in your report if not, so they go back to the gap list:
- **Real yields and breakeven inflation** (名义 = 实际 + 盈亏平衡通胀; a breakeven is not a forecast). Essay K
  (`what-makes-prices-rise`) will need to link it. Natural home: #ch5 or #ch12. Id if registered:
  `real-yield-breakeven-inflation`.
- **Who issues and who buys duration** (issuance, QE and QT, pension and insurance demand). Essays A and I both
  point at it. Natural home: #ch5 or #ch12. Id if registered: `duration-supply-demand`.

**Must link:** the three existing concepts above; `present-value-discounting` (why-one-rate #ch1);
`interest-rates-bonds` (lesson); `taylor-rule-neutral-rate` and `zero-lower-bound-qe` (why-one-rate #ch6, #ch10:
the short end and QE are the central bank's and are done); `business-cycle-sahm-potential`
(how-an-economy-is-measured #ch7: what a recession is and who dates it); `cpi-oer-hedonic-core` (which index
inflation-linked bonds follow); `base-rate-neglect` and `small-sample-variability` (numbers-lie #c6, #c2: for the
inversion evidence); `markov-chains` (the migration matrix); `eigen` (principal components of curve moves);
`regression-correlation`; `expected-value`; `risk-return`; `stocks-bonds` (seniority: why bondholders recover
something); `floating-rate-reset` and `equity-duration-house-affordability` (what the long end does to mortgages);
essay A (`public-debt-holders-currency`, its #ch4) for who holds government debt and A's #ch5 for sovereign
default; the draft `a-fair-price-for-a-bet` for swaps, futures and anything priced by replication.

**Overlaps to avoid:**
- Registering second nodes for discounting, forward rates and duration (#ch1, #ch2, #ch6): see the table. The
  chapters stay; the nodes do not.
- How a central bank sets the overnight rate, QE mechanics, r*: why-one-rate #ch5–#ch7, #ch10.
- Debt sustainability and sovereign default as a fiscal question: A owns it. B treats a sovereign spread like any
  other credit spread and links A.
- Credit default swaps as derivatives pricing: at most one paragraph, link the draft.
- Bank failures from rate risk (2023): essay F (`economics/money/why-banks-run`) owns that; one line and a link.
- Breakeven inflation against expected inflation: you own the market measure; essay K
  (`economics/macro/what-makes-prices-rise`) owns expectations and will link you.
- The equity risk premium and CAPM: essay G (`investment/basics/what-a-stock-is-worth`). Your term premium is the
  bond-market cousin; link each other.
- Anything that reads as a trading recommendation (steepeners, "when the curve inverts, do X"). The inversion
  chapter reports the record and its uncertainty and stops.

**Edges to list in your report (registrar enters them):**
`term-premium-curve-inversion>curve-builder-observational-equivalence:foundation`,
`yield-curve-bootstrapping>holding-period-return-rolldown:foundation`,
`curve-builder-observational-equivalence>holding-period-return-rolldown:foundation`,
`term-premium-curve-inversion>term-premium-acm-kim-wright:foundation`,
`regression-correlation>term-premium-acm-kim-wright:connection`,
`bond-duration-convexity>immunisation-barbell-bullet:foundation`,
`yield-curve-bootstrapping>level-slope-curvature:foundation`, `eigen>level-slope-curvature:connection`,
`term-premium-curve-inversion>inversion-decomposition:foundation`,
`term-premium-acm-kim-wright>inversion-decomposition:foundation`,
`business-cycle-sahm-potential>inversion-decomposition:foundation`,
`base-rate-neglect>inversion-decomposition:connection`,
`yield-curve-bootstrapping>credit-spread-triangle:foundation`, `expected-value>credit-spread-triangle:foundation`,
`credit-spread-triangle>junk-bonds-default-clustering:foundation`,
`markov-chains>junk-bonds-default-clustering:connection` (if #ch11 uses a rating-migration matrix),
`level-slope-curvature>yield-curve-2022-2026:application`,
`zero-lower-bound-qe>yield-curve-2022-2026:connection`.

### 4.C · `economics/trade/who-pays-a-tariff`

**What already exists**, against your chapter list of 2026-11-25:

- Your first chapter (`#elasticity`) explains elasticity. The lesson `math/applied/supply-demand` #step2 already
  teaches point elasticity with a model, and its #step1 teaches a tax wedge with its deadweight loss. Keep your
  chapter, since the essay needs the idea in its own words, but add one line linking supply-demand #step2 and
  #step1, and leave the chapter **out of** `REGISTRY.json` `concepts`. The registrar is creating
  `price-elasticity` on the lesson and will attach your chapter to it as a second lesson. Do not take the aliases
  弹性, 需求弹性, 无谓损失, 税负归宿, 消费者剩余.
- Your #ch4 (比较优势) explains what `scarcity-moves` #c3 owns as `comparative-advantage`. Same treatment: link
  #c3 in one line, leave #ch4 out of `concepts`, and it attaches to the existing node. If you want #ch4 to own
  something new, the gap on the site is distribution: trade raises the total and moves income between groups
  inside a country (the evidence on import competition and local labour markets). A model of that would be
  registered as `trade-winners-losers`.
- `purchasing-power-parity` (where-money-comes-from #ch9) and `interest-parity-carry-trade` (why-one-rate #ch9)
  own how exchange rates relate to prices and to interest rates; #ch6's currency offset links them.

**Owns (list these in `concepts`), by your chapters:**
- `tariff-incidence-pass-through` — #ch2 关税是一道楔子.
- `tariff-welfare-accounting` — #ch3 全国的账本：消费者、生产者、财政，和白白消失的那块；大国压低进口价的情形如果写了也归这里.
- `saving-investment-current-account` — #ch5 逆差不是"亏钱"：S − I = CA.
- `tariff-offsets-currency-retaliation-diversion` — #ch6 三个抵消.
- `export-controls-chokepoints` — #ch7 出口管制.
- `measuring-tariff-pass-through` — #ch8 怎么量出"谁付的".
- one frontier concept — #ch9. #ch10 is not a concept.

Aliases that are yours: 关税谁出, 关税是谁付的, 关税转嫁, 贸易逆差是坏事吗, 贸易逆差是亏钱吗, 贸易战, 出口管制, 卡脖子, 转口贸易,
who pays tariffs, tariff pass-through, is a trade deficit bad, export controls.

**Must link:** `supply-demand`, and after registration `price-elasticity`, `tax-wedge-deadweight-loss`,
`consumer-producer-surplus` (math/applied/supply-demand #step0–#step3: #ch2 and #ch3 are that lesson's wedge and
areas with a foreign supplier); `comparative-advantage` and `opportunity-cost` (scarcity-moves #c3, #c1);
`gdp-three-ways` (how-an-economy-is-measured #ch1: the expenditure identity S − I = CA comes from);
`purchasing-power-parity`; `interest-parity-carry-trade`; `monopoly-pricing-lerner` (why-a-few-firms-win #ch1:
a chokepoint in #ch7 is market power, and a large country's tariff is a buyer's market power);
`prisoners-dilemma` and `game-theory` (retaliation in #ch6); `income-to-the-scarce` (scarcity-moves #c9);
`externalities` (a tariff argued on security or pollution grounds is an externality argument: label it as one);
`euv-lithography` and `die-yield-cost` (why-chips-are-hard #ch6, #ch10, for #ch7);
`regression-correlation` and `hypothesis-testing` (#ch8: reading a pass-through estimate);
`inflation-winners-losers` and `cpi-oer-hedonic-core` where tariffs meet the price level; essay A
(`deficit-primary-balance`) for tariff revenue as a budget item.

**Overlaps to avoid:**
- Exchange-rate regimes, the trilemma, reserve currencies, the full balance of payments: essay H
  (`economics/money/what-sets-an-exchange-rate`, now commissioned). You own S − I = CA and the currency-offset
  argument and stop there; H will build its balance of payments on your identity and link #ch5 and #ch6.
- Tariffs as an inflation question: one paragraph, link `new-keynesian-model` (why-one-rate #ch7); essay K
  (`economics/macro/what-makes-prices-rise`) treats a tariff as a one-off price-level shock and will link #ch2.
- Learning curves and industrial policy as a growth question in #ch7: essay E
  (`economics/growth/why-some-countries-got-rich`).
- Market structure in #ch7 beyond what a chokepoint needs: the draft `why-a-few-firms-win` owns monopoly, lock-in
  and its own AI-stack chapter (#ch12).
- Positions. Tariffs, industrial policy and export controls are contested: give incidence estimates with their
  study, sample and date; state the security and distributional arguments as arguments; keep 已确立 / 已演示 /
  某方声称 apart. Every 2025–2026 tariff rate carries a date and the legal instrument it comes from.

**Edges to list in your report (registrar enters them):**
`supply-demand>tariff-incidence-pass-through:foundation`, `price-elasticity>tariff-incidence-pass-through:foundation`,
`tax-wedge-deadweight-loss>tariff-incidence-pass-through:foundation`,
`tariff-incidence-pass-through>tariff-welfare-accounting:foundation`,
`consumer-producer-surplus>tariff-welfare-accounting:foundation`,
`gdp-three-ways>saving-investment-current-account:foundation`,
`tariff-incidence-pass-through>tariff-offsets-currency-retaliation-diversion:foundation`,
`purchasing-power-parity>tariff-offsets-currency-retaliation-diversion:connection`,
`prisoners-dilemma>tariff-offsets-currency-retaliation-diversion:connection`,
`tariff-welfare-accounting>export-controls-chokepoints:connection`,
`euv-lithography>export-controls-chokepoints:connection`,
`tariff-incidence-pass-through>measuring-tariff-pass-through:application`,
`regression-correlation>measuring-tariff-pass-through:foundation`,
`saving-investment-current-account>tariff-offsets-currency-retaliation-diversion:connection`.

### 4.D · `economics/markets/when-buyers-cant-see-quality`

**What already exists.** `probability/stochastic/risk-pooling` already carries the insurance arithmetic
(pooling, the premium, correlated losses) and its #step4 asks "为什么只有高风险的人留在保险里". `scarcity-moves`
#c5 and #c6 own `incentives` and `market-failure`; `where-money-comes-from` #ch3 owns `bank-run` and deposit
insurance; `math/applied/mechanism-design` owns `mechanism-auction`; `probability/basics/expected-value` owns
`expected-value` (its title already puts 彩票、骰子、保险 on one scale).

Against your eleven chapters and nine registered ids of 2026-11-25: the split is already right in the main.
#ch2 (风险池化) is not in your `concepts`, which is correct: it is `risk-pooling`'s. Make sure #ch2 opens with a
link to that lesson (#step1 pooling, #step3 correlated losses) and that #ch3 or #ch4 links its #step4, where the
reader first met the selection question.

**Owns (your ids, keep all nine):** `certainty-equivalent-insurance` (#ch1), `lemons-market` (#ch3),
`insurance-death-spiral` (#ch4), `deductible-screening` (#ch5), `signaling` (#ch6), `moral-hazard` (#ch7),
`credit-rationing` (#ch8), `credit-score` (#ch9), `information-pricing-frontier` (#ch10).

Three notes on them:
- `certainty-equivalent-insurance` (#ch1) sits next to `expected-value` and `risk-return`. It is new only if the
  chapter is about risk aversion (a concave utility, the certainty equivalent, the premium someone will pay above
  the expected loss). Give it those aliases (风险厌恶, 确定性等价, 为什么要买保险) and leave 期望 and 保费怎么算 alone.
- `signaling` and `moral-hazard` are very general ids. They are free today; other essays (F, I, N4) will link
  them as the site's nodes for those ideas, so their descriptions should be written generally, not only about
  insurance.
- Aliases 逆向选择 / adverse selection belong on `lemons-market`, with 柠檬市场, 劣币驱逐良币(二手车). The words 逆向选择
  also appear in risk-pooling #step4; that is a mention, not ownership.

Two things the plan wanted that your chapter list does not show; add a section if there is room, and say in your
report if not, so they return to the gap list:
- **Principal and agent** (paying for effort you cannot see: the trade-off between incentive and insurance).
  Natural home: the end of #ch7. Essays F and N2 would link it.
- **Reputation, ratings and certification** as the market's own repairs, and when they fail (fake reviews,
  rating shopping). Natural home: #ch6 or #ch9.

**Must link:** `risk-pooling` (#step1 pooling, #step3 correlated losses, #step4 the selection question);
`expected-value` (the fair premium); `incentives` and `market-failure` (scarcity-moves #c5, #c6);
`externalities` (a different market failure; say how it differs); `bank-run` (where-money-comes-from #ch3:
deposit insurance as the textbook moral-hazard case, linked not re-modelled); `mechanism-auction` and `auctions`
(screening is mechanism design); `bayes` and `base-rate-neglect` (updating on a signal; what a credit score or a
test result can tell you); `signal-detection-theory` (psychology/cognition/signal-detection: thresholds and false alarms in underwriting);
`goodharts-law` (numbers-lie #c9: a score that is targeted stops measuring); `prisoners-dilemma` (reputation as a
repeated game); `two-sided-platforms` and `data-feedback-loops` (the draft why-a-few-firms-win #ch7, #ch8:
platform ratings); `interest-price-of-time` and `apr-irr-flat-fee` (what a loan rate is); `veil-of-ignorance`
(insurance chosen before types are known); `stocks-bonds` if the essay touches why outside equity is costly.

**Overlaps to avoid:**
- Why banks fail and financial crises. The audit listed "why banks fail" under this essay; drop it. A later
  essay F (`economics/money/why-banks-run`, now commissioned) owns leverage, runs, 2008 and bail-outs and will
  link D for moral hazard and for lemons in securitised debt. D owns the mechanism; F owns the banking system.
- The law of large numbers and premium loading: risk-pooling owns them.
- Monopoly and platform economics: the draft owns them; D uses ratings only as an information device.
- Health-policy positions. Mandates, community rating and public insurance are contested: show what each does in
  the unravelling model and cite measured take-up and cost effects with dates; no recommendation.
- Advice on buying insurance or borrowing.

**Edges to list in your report (registrar enters them):**
`expected-value>certainty-equivalent-insurance:foundation`, `risk-return>certainty-equivalent-insurance:connection`,
`certainty-equivalent-insurance>lemons-market:connection`, `risk-pooling>lemons-market:foundation`,
`market-failure>lemons-market:application`, `lemons-market>insurance-death-spiral:application`,
`risk-pooling>insurance-death-spiral:foundation`, `lemons-market>deductible-screening:foundation`,
`mechanism-auction>deductible-screening:connection`, `lemons-market>signaling:foundation`,
`bayes>signaling:connection`, `incentives>moral-hazard:foundation`, `risk-pooling>moral-hazard:connection`,
`lemons-market>credit-rationing:application`, `moral-hazard>credit-rationing:application`,
`interest-price-of-time>credit-rationing:foundation`, `credit-rationing>credit-score:foundation`,
`bayes>credit-score:foundation`, `goodharts-law>credit-score:connection`,
`signaling>information-pricing-frontier:application`.

### 4.E · `economics/growth/why-some-countries-got-rich`

**What already exists.** `how-an-economy-is-measured` #ch8 is the concept `solow-growth-accounting-tfp`: growth
accounting and TFP as the residual, with a model. The commission lists TFP; do not teach the accounting again and
do not register a TFP concept or take the aliases 全要素生产率, TFP, 增长核算. `scarcity-moves` #c7
(`growth-from-ideas`) and #c10 (`institutions-trust`) give the intuitions with small models; #c11–#c14 cover AI.
The draft `why-a-few-firms-win` #ch8 (`data-feedback-loops`) explains the learning curve as one firm's advantage
and cites Wright 1936. `why-chips-are-hard` #ch10 (`die-yield-cost`) has a cost curve for chips. A's #ch6–#ch7
own pensions and the retirement age.

**Owns (list in `concepts`):** `solow-steady-state-convergence` (capital accumulation, diminishing returns, the
steady state, catch-up), `ideas-nonrival-increasing-returns` (why ideas differ from capital; semi-endogenous
growth; are ideas getting harder to find), `wrights-law-cost-curve` (cost against cumulative output, economy-wide;
solar, batteries), `demographics-dependency-growth`, `institutions-growth-evidence`, `ai-productivity-frontier`
(the frontier concept). The reference brief is §3 Q7: its ladder and five models with equations stand.

**Must link:** `solow-growth-accounting-tfp` (open your accounting chapter on its result and apply it to
published data); `growth-from-ideas`, `institutions-trust`; `compound-interest` and `exp-log` (growth rates,
log-log plots: one line); `ode-phase-portraits` (the steady state as a fixed point); `data-feedback-loops` (link
both ways with the draft); `die-yield-cost`; `regression-correlation` and `simpsons-paradox` or
`survivorship-bias` (numbers-lie, for cross-country evidence); `pension-paygo-dependency` and
`retirement-age-levers` (A); `ai-cheap-thinking` and `relative-prices-after-ai` (scarcity-moves #c11, #c13);
`gdp-three-ways` and `ppp-balassa-samuelson-gini` (how incomes are compared across countries: done there).

**Overlaps to avoid:** AI and jobs, wages, Baumol as a labour-market model (next queue, N2; you own what AI does
to the growth rate, not to employment). Trade as a growth story beyond one paragraph (C). Verdicts on one
country's slowdown or on "institutions cause growth": show the decomposition and the competing readings.

**Edges for your report:** `solow-growth-accounting-tfp>solow-steady-state-convergence:foundation`,
`ode-phase-portraits>solow-steady-state-convergence:connection`,
`growth-from-ideas>ideas-nonrival-increasing-returns:foundation`,
`solow-steady-state-convergence>ideas-nonrival-increasing-returns:foundation`,
`exp-log>wrights-law-cost-curve:foundation`, `data-feedback-loops>wrights-law-cost-curve:connection`,
`solow-steady-state-convergence>demographics-dependency-growth:connection`,
`institutions-trust>institutions-growth-evidence:foundation`,
`regression-correlation>institutions-growth-evidence:foundation`,
`ideas-nonrival-increasing-returns>ai-productivity-frontier:application`,
`ai-cheap-thinking>ai-productivity-frontier:connection`.

### 4.F · `economics/money/why-banks-run`

**What already exists, and it is the essay's title.** `where-money-comes-from` #ch3 is the concept `bank-run`
(银行挤兑与存款保险, "银行没亏钱，也会倒"), with a run model. `loans-create-deposits` (#ch2) is how a bank's balance
sheet comes to exist. `why-one-rate-moves-everything` #ch2 (`bond-duration-convexity`) already tells the 2023
story from the bond side and currently holds the aliases 硅谷银行为什么倒闭 / why did silicon valley bank fail.
The derivatives draft #ch9 (`margin-leverage-central-clearing`) is leverage at an exchange. D owns
`moral-hazard`.

You are the deep page for a concept the site introduces elsewhere, so the split has to be explicit:

- `bank-run` stays where it is as the introduction. Do not register a second `bank-run`. Your formal chapter
  registers as `bank-run-diamond-dybvig` (two equilibria, why a sound bank can fail, what suspension and deposit
  insurance each do to the game), with `bank-run>bank-run-diamond-dybvig:foundation`. Ask the registrar to move the
  search aliases 银行为什么会倒, 挤兑是怎么发生的 to your node and leave 银行挤兑 on the introduction, and to move the
  SVB aliases from `bond-duration-convexity` to your rate-risk concept.
- **Owns (list in `concepts`):** `leverage-balance-sheet`, `maturity-liquidity-transformation`,
  `bank-run-diamond-dybvig`, `interest-rate-risk-banking-book` (2023: unrealised losses against equity, uninsured
  deposits), `securitisation-shadow-banking` (2008: only if you build the tranche model; otherwise tell 2008 as a
  case and leave the id for N4), `capital-requirements-lender-of-last-resort` (capital, deposit insurance design,
  Bagehot, bail-outs and their cost), one frontier concept. Reference brief: §3 Q3, chapters 1–3, 6, 9–10 and the
  leverage, rate-risk and capital models.

**Must link:** `bank-run`, `loans-create-deposits`, `money-as-iou`; `bond-duration-convexity` (do not re-derive
duration: use loss ≈ D·Δy·A and link); `reserves-floor-system` and `zero-lower-bound-qe` (what central banks did
in 2008 and 2020); `moral-hazard` and `lemons-market` (D: deposit insurance and
too-big-to-fail are its textbook cases; lemons in securitised debt); `game-theory` and `prisoners-dilemma` (a
run is a coordination game, which is not a prisoner's dilemma: say so); `diversification` (why pooling mortgages
did not remove a common shock); `stocks-bonds` (who is paid first); `credit-spread-triangle` (B);
`sovereign-default-restructuring` (A: the sovereign version of a rollover); `margin-leverage-central-clearing`.

**Overlaps to avoid:** repo, haircuts, fire sales, network contagion and Minsky's credit cycle as models: one
paragraph each at most, they are the next queue's N4 and need their own models. Stablecoin and money-fund runs: I
owns them and will link your run model. Currency crises: H. How money is created: done in #ch2 of
where-money-comes-from. No named institution is called unsafe unless a regulator's document says so; every
2023–2026 figure is dated and sourced from the official post-mortems.

**Edges for your report:** `stocks-bonds>leverage-balance-sheet:foundation`,
`risk-return>leverage-balance-sheet:foundation`, `loans-create-deposits>maturity-liquidity-transformation:foundation`,
`bank-run>maturity-liquidity-transformation:foundation`, `bank-run>bank-run-diamond-dybvig:foundation`,
`game-theory>bank-run-diamond-dybvig:foundation`, `bond-duration-convexity>interest-rate-risk-banking-book:foundation`,
`leverage-balance-sheet>interest-rate-risk-banking-book:foundation`,
`leverage-balance-sheet>capital-requirements-lender-of-last-resort:foundation`,
`bank-run-diamond-dybvig>capital-requirements-lender-of-last-resort:foundation`,
`moral-hazard>capital-requirements-lender-of-last-resort:foundation`; and three that the trail 从印钱到金融危机
(§2, T2) walks along: `bank-run-diamond-dybvig>maturity-liquidity-transformation:connection`,
`maturity-liquidity-transformation>interest-rate-risk-banking-book:foundation`,
`interest-rate-risk-banking-book>capital-requirements-lender-of-last-resort:application`.

### 4.G · `investment/basics/what-a-stock-is-worth`

**What already exists.** `why-one-rate-moves-everything` #ch1 (`present-value-discounting`) and #ch8
(`equity-duration-house-affordability`: a share as a long stream of cash, and why long-duration shares react to
rates). The lessons `stocks-bonds` (what a share is), `risk-return` (what a risk premium is), `diversification`
(two assets, the correlation slider), `fees-compounding` (what a 1% fee does over 30 years).
`regression-correlation` is where a slope is taught. Nothing on the site has P/E, DCF, CAPM, factors, efficient
markets or index funds: those are yours.

**Owns (list in `concepts`):** `dcf-valuation` (multi-stage DCF, terminal value, sensitivity to r and g; Gordon
as its limit), `valuation-multiples-pe` (P/E as the DCF rewritten; reverse DCF), `equity-risk-premium`,
`capm-beta`, `factor-models-alpha`, `efficient-markets-random-walk` (the three forms and the tests),
`active-management-arithmetic` (index funds: why the average active investor cannot beat the market after
costs; skill against luck), one frontier concept. Reference briefs: §3 Q5 chapters 1–8 with its DCF, P/E, reverse
DCF and luck models; §3 Q2 chapters 4–6 with the beta-by-regression and factor-zoo models.

**Must link:** the six pages above; `expected-value`, `variance`; `survivorship-bias`, `multiple-comparisons`,
`regression-to-the-mean`, `small-sample-variability` (numbers-lie #c3, #c4, #c1, #c2: fund track records and the
factor zoo are these traps); `hypothesis-testing`; J for the random walk and √t (state the efficient-markets
claim in J's terms and link; do not build a random-walk simulator); `geometric-brownian-motion` and
`implied-volatility-smile-fat-tails` (the derivatives draft); `term-premium-curve-inversion` and B (the bond
risk premium and the real yield you compare an earnings yield with); `inflation-opportunity-cost-loan` (real
against nominal returns).

**Overlaps to avoid:** building the efficient frontier, the tangency portfolio, estimation error, Kelly: next
queue N1. Reach CAPM by the argument "diversifiable risk earns nothing, so only co-movement with the market is
paid" plus a regression, and link `diversification`. Bubbles and behavioural finance beyond one chapter: next
queue N7 owns `bubbles-limits-to-arbitrage` and `prospect-theory-loss-aversion`. Fee arithmetic: done. Options:
the draft. A note on placement: `investment/basics` holds junior-stage lessons and this is a university-stage
essay; set the stage in `page.json` accordingly. Highest advice risk of the eleven: invented companies in the
models, real ones only in dated sourced statements, no view on any market's level, and the AI-valuation debate of
2025–2026 presented as a reverse DCF with both sides' assumptions.

**Edges for your report:** `present-value-discounting>dcf-valuation:foundation`,
`equity-duration-house-affordability>dcf-valuation:foundation`, `stocks-bonds>dcf-valuation:foundation`,
`dcf-valuation>valuation-multiples-pe:foundation`, `dcf-valuation>equity-risk-premium:foundation`,
`risk-return>equity-risk-premium:foundation`, `risk-return>capm-beta:foundation`,
`diversification>capm-beta:foundation`, `regression-correlation>capm-beta:foundation`,
`capm-beta>factor-models-alpha:foundation`, `multiple-comparisons>factor-models-alpha:connection`,
`random-walk-sqrt-t>efficient-markets-random-walk:foundation` (once J is live),
`efficient-markets-random-walk>active-management-arithmetic:application`,
`fees-compounding>active-management-arithmetic:foundation`,
`survivorship-bias>active-management-arithmetic:foundation`.

### 4.H · `economics/money/what-sets-an-exchange-rate`

**What already exists: three of the six topics in the commission.** `where-money-comes-from` #ch9 is
`purchasing-power-parity` (同一个汉堡，不同的价钱). `how-an-economy-is-measured` #ch5 is
`ppp-balassa-samuelson-gini` (why rich countries look expensive). `why-one-rate-moves-everything` #ch9 is
`interest-parity-carry-trade` (covered and uncovered parity, forwards, the carry trade, with a model). Do not
register concepts for PPP, interest parity or the carry trade, and do not take their aliases. Open with one
chapter that puts the three on one time axis (days: rate differentials; years: flows; decades: prices), each
recapped in a few sentences with its deep link. If you write fuller chapters on them, leave those chapters out of
`REGISTRY.json` `concepts`; the registrar attaches them to the existing nodes.

**Owns (list in `concepts`):** `balance-of-payments`, `exchange-rate-overshooting`,
`trilemma-exchange-rate-regimes`, `currency-crisis-speculative-attack`, `foreign-currency-debt-balance-sheet`,
`rmb-fixing-managed-float` (中间价怎么定：收盘价、一篮子货币、逆周期因子；在岸与离岸), `reserve-currency-dollar`,
one frontier concept. Reference brief: §3 Q6, whose five models with equations stand.

**Must link:** the three existing concepts; `saving-investment-current-account` and
`tariff-offsets-currency-retaliation-diversion` (C: the current account identity and the currency offset are
C's); `public-debt-holders-currency` and `sovereign-default-restructuring` (A: debt in someone else's currency);
`bank-run` and F's `bank-run-diamond-dybvig` (a speculative attack is the same coordination game);
`reserves-floor-system`, `taylor-rule-neutral-rate`, `zero-lower-bound-qe` (how the home interest rate is set);
`inflation-expectations-anchoring` (K); `stablecoin-peg-reserves` (I: a currency board and a reserve-backed
stablecoin are the same arithmetic; link both ways); `game-theory`.

**Overlaps to avoid:** S − I = CA and trade deficits (C). Stablecoins as dollarisation beyond a paragraph (I).
Sovereign default (A). Central-bank operations (why-one-rate #ch5–#ch7). Positions on "currency manipulation",
capital controls and de-dollarisation: quote the IMF's regime classification and the PBoC's own description of
the fixing; state reserve and invoicing shares with source and date (IMF COFER, BIS Triennial Survey); no
forecasts of any exchange rate. Placement note: the commission puts this under `economics/money`; C is in
`economics/trade`. Either is fine; the two essays must link each other in their first screens.

**Edges for your report:** `saving-investment-current-account>balance-of-payments:foundation`,
`interest-parity-carry-trade>exchange-rate-overshooting:foundation`,
`purchasing-power-parity>exchange-rate-overshooting:foundation`,
`interest-parity-carry-trade>trilemma-exchange-rate-regimes:foundation`,
`reserves-floor-system>trilemma-exchange-rate-regimes:connection`,
`trilemma-exchange-rate-regimes>currency-crisis-speculative-attack:foundation`,
`bank-run>currency-crisis-speculative-attack:connection`,
`currency-crisis-speculative-attack>foreign-currency-debt-balance-sheet:connection`,
`public-debt-holders-currency>foreign-currency-debt-balance-sheet:foundation`,
`trilemma-exchange-rate-regimes>rmb-fixing-managed-float:application`,
`balance-of-payments>reserve-currency-dollar:foundation`,
`tariff-offsets-currency-retaliation-diversion>trilemma-exchange-rate-regimes:connection` (joins C's trail to
yours).

### 4.I · `economics/money/what-makes-a-stablecoin-stable`

**What already exists.** `where-money-comes-from` #ch1–#ch3: `money-as-iou`, `loans-create-deposits`, `bank-run`.
`why-one-rate-moves-everything` #ch5: `reserves-floor-system` (what central-bank money is and where the short
rate comes from). `computing/algorithms/hashing` and `computing/systems/rsa-encryption` for hashes and
signatures. In flight beside you: F (the run model, the lender of last resort), H (pegs, currency boards, the
dollar), B (who buys Treasury bills).

**Owns (list in `concepts`):** `money-hierarchy-settlement` (whose IOU each kind of money is),
`payment-rails-settlement-finality`, `stablecoin-peg-reserves` (mint, redeem, the arbitrage band, the issuer's
balance sheet and income), `stablecoin-run-depeg` (reserve-quality depegs, liquidity depegs, and the algorithmic
spiral), `cbdc-design` (e-CNY and the others: retail or wholesale, caps, interest, what it does to bank funding),
one frontier concept (the laws and their dates). Reference brief: §3 Q9, whose six models stand.

**Must link:** the four existing concepts; F's `bank-run-diamond-dybvig` and `maturity-liquidity-transformation`
(do not rebuild a run model from scratch: parameterise F's for a reserve pool, and link);
`capital-requirements-lender-of-last-resort` (F: what an issuer does and does not have behind it);
`trilemma-exchange-rate-regimes` and `reserve-currency-dollar` (H); `duration-supply-demand` (B);
`interest-price-of-time` (who earns the float); `hashing`, `rsa-encryption` (one paragraph and links);
`moral-hazard` (D); `network-effects-critical-mass` and `two-sided-platforms` (the draft: why
payment networks tip).

**Overlaps to avoid:** how blockchains reach consensus, and the price of any crypto-asset: out of scope, by
design. Monetary policy. Bank runs in general (F). For the frontier chapter read the legal texts themselves (the
US federal stablecoin statute and its rulemakings, MiCA, Hong Kong's ordinance, the PBoC's e-CNY reports, the
ECB's digital-euro progress reports) and issuers' attestations; say what an attestation does and does not verify;
date every supply figure. No product is called safe or unsafe. The 2026-11-11 audit marked a crypto essay as
commissioned and none is registered: if one exists on a branch, link it for everything on-chain.

**Edges for your report:** `money-as-iou>money-hierarchy-settlement:foundation`,
`reserves-floor-system>money-hierarchy-settlement:foundation`,
`money-hierarchy-settlement>payment-rails-settlement-finality:foundation`,
`money-hierarchy-settlement>stablecoin-peg-reserves:foundation`, `bank-run>stablecoin-peg-reserves:foundation`,
`stablecoin-peg-reserves>stablecoin-run-depeg:foundation`,
`maturity-liquidity-transformation>stablecoin-run-depeg:connection`,
`money-hierarchy-settlement>cbdc-design:foundation`, `loans-create-deposits>cbdc-design:foundation`,
`trilemma-exchange-rate-regimes>stablecoin-peg-reserves:connection`.

### 4.J · `probability/stochastic/random-walks`

**What already exists.** `probability/basics/binomial-normal` (#step3, `binomial-normal`): the Galton board, which
is the distribution of a random walk's endpoint. `probability/statistics/central-limit-theorem` (`gaussian`,
`variance`): why sums become normal and why the spread of a sum grows as √n. `probability/stochastic/markov-chains`
(`markov-chains`): a walk on a graph, with the phrase 随机游走 in its text. `montecarlo`. `poisson-process`. The
derivatives draft `a-fair-price-for-a-bet` #ch5 owns the id `geometric-brownian-motion` (GBM as a model of a
share price, volatility, the −σ²/2 term) and #ch8 owns `implied-volatility-smile-fat-tails` (fat tails as the
option market shows them). `numbers-lie` #c8 owns `mean-vs-median-long-tail`.

This essay is the hub that six economics pages will point at, so its ids matter more than most.

**Owns (list in `concepts`):** `random-walk-sqrt-t` (the walk, why distance grows as √t, not t; time scaling of
risk), `gamblers-ruin-first-passage` (ruin probabilities, hitting times, why a fair game still ruins the smaller
bankroll), `brownian-motion-diffusion` (the limit; the diffusion equation; Einstein 1905 and Bachelier 1900 as
the same mathematics), `fat-tails-levy-stable` (when variance is not enough: power-law tails, what breaks in the
√t rule and in the central limit theorem), optionally `random-walk-recurrence-dimension` (Pólya: returns in 1D
and 2D, not in 3D), one frontier concept.

**GBM.** The commission lists it. Write the section, since a reader of this page needs to see a walk in log
price and where −σ²/2 comes from, but leave it out of `REGISTRY.json` `concepts`: the id exists in the draft's
registry and the registrar will attach your section to it as a second lesson. Link the draft's #ch5 from that
section, and the team lead will add the reverse link.

**Must link:** `binomial-normal`, `gaussian`, `variance` (open on their results; do not re-prove the CLT),
`markov-chains`, `expected-value`, `montecarlo`, `probability-distribution`, `exp-log`;
`geometric-brownian-motion`, `crr-binomial-tree`, `black-scholes-formula-pde`,
`implied-volatility-smile-fat-tails` (the draft: where the walk becomes a price); `risk-return` and
`diversification` (risk over time against risk across assets); `risk-pooling` (ruin as an insurer's problem);
`mean-vs-median-long-tail`; G's `efficient-markets-random-walk` (G owns the economic claim that prices are
unpredictable and its tests; you own the mathematics and say in one paragraph what the claim is and is not).
Outside finance, link any diffusion, heat or molecular-motion page the site has, so the essay is not read as a
finance page.

**Overlaps to avoid:** option pricing (the draft). Whether markets are efficient (G). Volatility drag and Kelly
(next queue N1: you may show that the median of a multiplicative walk grows more slowly than its mean, and stop).
Since the page sits in `probability`, examples should be half non-financial; where they are financial, nothing
reads as advice and no return figure appears without source and period.

**Edges for your report:** `binomial-normal>random-walk-sqrt-t:foundation`, `variance>random-walk-sqrt-t:foundation`,
`markov-chains>random-walk-sqrt-t:connection`, `random-walk-sqrt-t>gamblers-ruin-first-passage:foundation`,
`expected-value>gamblers-ruin-first-passage:foundation`, `random-walk-sqrt-t>brownian-motion-diffusion:foundation`,
`gaussian>brownian-motion-diffusion:foundation`, `brownian-motion-diffusion>geometric-brownian-motion:foundation`,
`brownian-motion-diffusion>fat-tails-levy-stable:foundation`,
`mean-vs-median-long-tail>fat-tails-levy-stable:connection`,
`fat-tails-levy-stable>implied-volatility-smile-fat-tails:connection`,
`random-walk-sqrt-t>crr-binomial-tree:connection`.

### 4.K · `economics/macro/what-makes-prices-rise`

**What already exists: two of the commission's topics and all of the measurement.** `where-money-comes-from`
#ch4 is `quantity-theory-inflation` (MV = PY, with a model: 钱多了，东西就贵吗) and #ch5 is
`inflation-winners-losers`. `why-one-rate-moves-everything` #ch7 is `new-keynesian-model` (the three equations
including the Phillips curve), #ch6 `taylor-rule-neutral-rate`, #ch10 `zero-lower-bound-qe`, #ch12 the central
banks at the end of 2026. `how-an-economy-is-measured` #ch2–#ch3 own how inflation is measured
(`price-indexes-chain-fisher`, `cpi-oer-hedonic-core`) and #ch6–#ch7 unemployment, Okun and the output gap. A's
#ch8 owns `fiscal-multiplier`. Do not register MV = PY or a second Phillips-curve concept, and do not explain
again how CPI is built: recap, link, go past.

Going past, concretely: #ch4 of where-money-comes-from shows when MV = PY works; you show why it stopped
predicting (velocity, 2008–2019 against 2020–2022). Why-one-rate #ch7 gives the Phillips curve as an equation in
a model the central bank uses; you own what the data say about its slope and shape.

**Owns (list in `concepts`):** `aggregate-demand-supply-shocks` (the two kinds of inflation: prices and output
moving together or apart), `inflation-expectations-anchoring`, `phillips-curve-slope-evidence` (flat, steep,
non-linear: what was measured before and after 2021), `wage-price-spiral-disinflation` (and the cost of bringing
inflation down), `deflation-debt-deflation` (with Japan since the 1990s and China in the 2020s as the worked
cases), `hyperinflation-seigniorage`, one frontier concept. Reference brief: §3 Q4, chapters 4–10 and the
expectations, debt-deflation and seigniorage models.

**Must link:** every concept named above; `monetary-transmission` and `loans-create-deposits`
(where-money-comes-from #ch8, #ch2); `business-cycle-sahm-potential` and `labour-u3-u6-beveridge-okun`;
`real-yield-breakeven-inflation` (B: market measures of expected inflation); `tariff-incidence-pass-through` (C:
a tariff as a one-off price-level shock); `public-debt-holders-currency` (A: inflating debt away) and
`fiscal-multiplier`; `floating-rate-reset` and `inflation-opportunity-cost-loan` (what inflation does to a
borrower); `supply-demand` (a relative price change is not inflation: say it with that page);
`trilemma-exchange-rate-regimes` (H: imported inflation); `bayes` (how expectations update); `feedback`.

**Overlaps to avoid:** the business cycle itself (why output oscillates, recessions as such): next queue N3. How
central banks set and transmit rates: why-one-rate. Measurement. Fiscal sustainability (A). On Japan and China:
official series with dates (statistics bureaus, BoJ, PBoC, IMF Article IV), competing explanations side by side
(balance-sheet repair, demographics, overcapacity, expectations), no verdict. On 2021–2023: present the published
decompositions (Bernanke and Blanchard and the central-bank replications; Benigno and Eggertsson) and where they
disagree.

**Edges for your report:** `quantity-theory-inflation>aggregate-demand-supply-shocks:foundation`,
`supply-demand>aggregate-demand-supply-shocks:connection`,
`business-cycle-sahm-potential>aggregate-demand-supply-shocks:foundation`,
`new-keynesian-model>inflation-expectations-anchoring:foundation`,
`new-keynesian-model>phillips-curve-slope-evidence:foundation`,
`labour-u3-u6-beveridge-okun>phillips-curve-slope-evidence:foundation`,
`inflation-expectations-anchoring>wage-price-spiral-disinflation:foundation`,
`inflation-winners-losers>deflation-debt-deflation:foundation`,
`zero-lower-bound-qe>deflation-debt-deflation:connection`,
`quantity-theory-inflation>hyperinflation-seigniorage:foundation`,
`inflation-expectations-anchoring>hyperinflation-seigniorage:foundation`.

### 4.0 · The two drafts

- **`a-fair-price-for-a-bet`**: its twelve ids collide with nothing. Edges into it are listed in §1.11, its own
  chapter-to-chapter chain in §5.1a.
  Two ownership lines to hold: `margin-leverage-central-clearing` is leverage at an exchange (margin, clearing);
  balance-sheet leverage goes to F, repo and haircuts to N4. `geometric-brownian-motion` (#ch5) stays the owner of GBM
  as a model of a price, with Itô's −σ²/2 term; J (`random-walks`) owns the random walk, √t and Brownian motion
  underneath it. Once J is live, #ch5 opens with a link to J and J's GBM section links #ch5 (§4.J). Fat tails:
  #ch8 owns the smile as evidence of them; J owns the distributions.
- **`why-a-few-firms-win`**: #ch1 uses elasticity to reach the Lerner index. Keep its three-sentence definition
  and add a link to supply-demand #step2 (`price-elasticity` once the Q1 registration is done). Take the aliases
  边际收入, 边际收益, MR = MC onto `monopoly-pricing-lerner`: no other page teaches marginal revenue. `data-feedback-loops`
  (数据回路与学习曲线) is the firm-level learning curve; the economy-wide cost curve (Wright's law) goes to E and
  the two should link each other. Its `page.json` is the only one in the two trees with status `draft` set; the
  derivatives draft's `page.json` should be checked for the same.

---

## 5. Graph quality

### 5.1 Missing edges among existing nodes (all verified absent from `atlas/data.js` on 2026-11-25)

`atlas/graph/lessons/why-one-rate-moves-everything.json` and `scarcity-moves.json` carry **zero** edges; 27
economics nodes are isolated. The 57 edges below need no new node. Where `specs/atlas-edge-todo.md` already lists
the pair with a `?` endpoint, its line number is given: these fill those in.

Inside `why-one-rate-moves-everything` (the essay's own argument, chapter to chapter):
```
present-value-discounting>bond-duration-convexity:foundation
bond-duration-convexity>yield-curve-bootstrapping:foundation
yield-curve-bootstrapping>term-premium-curve-inversion:foundation
reserves-floor-system>taylor-rule-neutral-rate:connection
taylor-rule-neutral-rate>new-keynesian-model:foundation
new-keynesian-model>zero-lower-bound-qe:foundation
term-premium-curve-inversion>zero-lower-bound-qe:connection        (QE works on the term premium)
present-value-discounting>equity-duration-house-affordability:application
yield-curve-bootstrapping>interest-parity-carry-trade:connection   (forward rates, forward exchange rates)
taylor-rule-neutral-rate>central-banks-2026:application
zero-lower-bound-qe>central-banks-2026:application
term-premium-curve-inversion>debt-dynamics-r-minus-g:connection    (r in r − g is a market rate)
```
From other pages into it:
```
compound-interest>present-value-discounting:foundation             (todo 1817)
interest-price-of-time>present-value-discounting:foundation
interest-rates-bonds>bond-duration-convexity:foundation            (todo 1832)
loans-create-deposits>reserves-floor-system:foundation             (todo 1823)
monetary-transmission>new-keynesian-model:connection               (todo 1824)
purchasing-power-parity>interest-parity-carry-trade:connection     (todo 1826)
bond-duration-convexity>bank-run:application                       (todo 1822)
business-cycle-sahm-potential>taylor-rule-neutral-rate:foundation  (todo 410)
cpi-oer-hedonic-core>taylor-rule-neutral-rate:foundation
labour-u3-u6-beveridge-okun>new-keynesian-model:connection
stocks-bonds>equity-duration-house-affordability:foundation        (todo 1841)
annuity-payment-formula>equity-duration-house-affordability:connection (todo 1825, 1837)
risk-return>term-premium-curve-inversion:connection                (todo 1845)
compound-interest>debt-dynamics-r-minus-g:foundation
gdp-three-ways>debt-dynamics-r-minus-g:foundation
taylor-rule-neutral-rate>monetary-transmission:application         (needed by trail T3)
```
Inside `scarcity-moves`, and from it outward:
```
opportunity-cost>marginal-thinking:foundation
marginal-thinking>sunk-cost:connection
opportunity-cost>comparative-advantage:foundation
opportunity-cost>price-signal:foundation
price-signal>supply-demand:representation                          (the model of the idea; seeAlso exists, edge does not)
marginal-thinking>supply-demand:foundation
price-signal>incentives:connection
incentives>market-failure:foundation
market-failure>externalities:application
opportunity-cost>income-to-the-scarce:foundation
income-to-the-scarce>ai-tasks-wages:foundation
ai-cheap-thinking>relative-prices-after-ai:foundation
ai-tasks-wages>ai-forecast:application
growth-from-ideas>solow-growth-accounting-tfp:connection
spending-is-income>gdp-three-ways:foundation                       (expenditure = income is this identity)
spending-is-income>loans-create-deposits:connection                (todo 31)
institutions-trust>money-as-iou:connection
opportunity-cost>interest-price-of-time:connection
incentives>goodharts-law:connection
```
Inside `where-money-comes-from` and the lessons:
```
money-as-iou>loans-create-deposits:foundation
loans-create-deposits>bank-run:foundation
loans-create-deposits>quantity-theory-inflation:foundation
game-theory>bank-run:connection
risk-return>diversification:foundation
expected-value>risk-pooling:foundation
exp-log>compound-interest:foundation                               (todo 1214)
exp-log>nominal-vs-effective-rate:foundation                       (todo 81)
fees-compounding>apr-irr-flat-fee:connection
floating-rate-reset>amortisation-schedule:connection               (needed by trail T3)
```
All 57 were checked on 2026-11-25: both endpoints are live ids and neither direction of the pair is in
`atlas/data.js`. After they are added, every economics node except the two checklist chapters has an edge.

One existing edge to re-examine: `income-to-the-scarce>solow-growth-accounting-tfp:connection` is the only edge
from scarcity-moves into the growth chapter. `growth-from-ideas` is the natural source; keep both or replace.

### 5.1a Where edges are entered, and the drafts' own chains

The importer (`scripts/atlas-import-registry.cjs`) builds nodes from an essay's `REGISTRY.json` and reads no edges
from it. Edges are written by hand into `atlas/graph/lessons/<slug>.json` → `edges` after the import, and a
re-import keeps them. That is why `how-an-economy-is-measured` has 14 edges and `why-one-rate-moves-everything`
has none: nobody wrote them. The lists in §5.1 go into the fragments of the essay that owns the `to` end. For
every new essay the registrar should refuse to finish registration with an empty `edges` array.

The two drafts need their internal chains at registration (proposed; the writers should confirm the order of
their own argument):

```
forward-price-cost-of-carry>option-payoffs-put-call-parity:foundation
option-payoffs-put-call-parity>binomial-replication-risk-neutral:foundation
binomial-replication-risk-neutral>crr-binomial-tree:foundation
crr-binomial-tree>geometric-brownian-motion:connection
geometric-brownian-motion>black-scholes-formula-pde:foundation
crr-binomial-tree>black-scholes-formula-pde:connection
black-scholes-formula-pde>greeks-delta-hedging:foundation
black-scholes-formula-pde>implied-volatility-smile-fat-tails:application
implied-volatility-smile-fat-tails>heston-stochastic-volatility:foundation
forward-price-cost-of-carry>margin-leverage-central-clearing:connection
greeks-delta-hedging>hedging-basis-risk-notional:application

monopoly-pricing-lerner>minimum-efficient-scale-natural-monopoly:connection
monopoly-pricing-lerner>cournot-bertrand-hhi:foundation
cournot-bertrand-hhi>free-entry-contestability:foundation
network-effects-critical-mass>lock-in-switching-costs:foundation
network-effects-critical-mass>two-sided-platforms:foundation
network-effects-critical-mass>data-feedback-loops:connection
two-sided-platforms>tying-self-preferencing:connection
lock-in-switching-costs>interoperability-multihoming:foundation
cournot-bertrand-hhi>measuring-market-power:application
measuring-market-power>ai-stack-antitrust:application
```

### 5.2 Duplicated or mislabelled concepts

| Issue | Evidence | Recommendation |
|---|---|---|
| Loan amortisation taught twice | `loan-amortisation` (where-money-comes-from #ch7, 等额本息与提前还款) and `annuity-payment-formula` + `amortisation-schedule` + `mortgage-prepayment` (where-a-mortgage-payment-goes #ch2, #ch3, #ch5). One `connection` edge joins them. | Keep both nodes; make the mortgage essay the owner of the search terms 等额本息 / 月供怎么算 / 提前还款 in `aliases.json`, change the edge to `loan-amortisation>annuity-payment-formula:foundation`, and add `loan-amortisation` to `decisions.json` as the introductory lesson of the mortgage concepts. |
| PPP twice | `purchasing-power-parity` (where-money-comes-from #ch9) and `ppp-balassa-samuelson-gini` (how-an-economy-is-measured #ch5), joined by one edge. | Retitle the second to lead with what is new there: 跨国比较：巴拉萨–萨缪尔森与基尼 / Cross-country comparison. The alias 购买力平价 belongs to the first only. |
| Discounting three times | `compound-interest` (复利与贴现), `interest-price-of-time`, `present-value-discounting`. No edges between the first and third. | Not duplicates (lesson, intuition, formal), but they must be a chain: the two `foundation` edges in §5.1. |
| A concept that packs three | `ppp-balassa-samuelson-gini` holds PPP, mean-against-median and the Gini coefficient; 基尼系数 cannot be found as its own concept. | Add aliases 基尼系数 / Gini to it now; split out an inequality node when a page on distribution exists. |
| Checklist chapters as concepts | `reading-a-loan-contract`, `questions-to-ask-of-a-number` are isolated nodes that teach nothing on their own. | Stop registering closing chapters (rule in §3). Leave the existing ones; do not add edges to fake connectivity. |
| Regions disagree | `compound-interest` is in `math`; `risk-pooling` in `measurement`; the other investment lessons in `society`. | Leave `risk-pooling` (it is a probability page). Move `compound-interest` to `society` only if the region work in §5.4 happens; otherwise leave it and rely on edges. |
| Two atlases, one overlap | The investment atlas (12 nodes, 22 edges) has its own `risk-return`, `diversification`, `stocks-bonds`, `fees-compounding`, `interest-rates-bonds` plus step-level nodes (`stock`, `bond`, `fee`, `risk`, `return`, `bond-price`, `interest-rate`); the main atlas has the five lesson nodes too. Its 行为 region is empty. | Keep the investment atlas as the beginner's map. When Q2 and Q5 register, add their concepts to it as well (估值 gets `dcf-valuation`, `valuation-multiples-pe`; 风险 gets `sharpe-ratio-capital-market-line`, `capm-beta`; 行为 gets `prospect-theory-loss-aversion`, `bubbles-limits-to-arbitrage`), by cross-atlas deep link as CONCEPT-MAP.md already prescribes for main-atlas nodes. |
| `investment` has no region | `scripts/atlas-regions.cjs` maps no region for category `investment`, and `groups.json` gives `society` only `["economics","society"]`. The importer will stop with "no region for category investment" on `a-fair-price-for-a-bet`, B, Q2 and Q5. | Add `investment` to the `society` region's `categories` (registrar or the atlas-compression agent; it is one line in `groups.json`). |
| Vocabulary gaps with an owner | 通胀怎么测量, CPI 怎么算, 收益率曲线倒挂, 期限溢价, 久期 all have owning chapters and may lack aliases. | Check `aliases.json` for each; add where missing. No new nodes. |

### 5.3 How many nodes this adds, and the index budget

Two measurements, both of `atlas/atlas-index.js` for 891 nodes and 1,029 edges, limit 160,000 bytes:

- Before compression (the committed file when this plan was started): 152,887 bytes, about 172 bytes a node with
  its share of edges and aliases; headroom 7,113 bytes, about 40 nodes.
- The compression agent's working tree on 2026-11-25 (not committed when measured): 115,425 bytes, about 130 bytes
  a node; headroom 44,575 bytes, about 340 nodes.

Essay concepts carry more aliases than the average node, so both per-node figures are low for them. The byte
column below uses 130 and is an estimate.

| Batch | New nodes | Approx. bytes at 130 B | Fits in 44,575? |
|---|---|---|---|
| §5.1 edges (57) and the Q1 registration (3 nodes, 7 edges) | 3 | ~3,000 | yes |
| Two drafts (as their `REGISTRY.json` stand) | 24 | ~3,100 | yes |
| A, B, C, D (7 + 9 + 7 + 9, frontier concepts included; B and D from their `REGISTRY.json` after §4's trims) | 32 | ~4,200 | yes |
| E–K (7 essays at 7–9; J at 5) | about 52 | ~6,800 | yes |
| N1–N8 (8 essays at 6–8) | about 55 | ~7,200 | yes |
| **Total new** | **about 165** | **about 24,000** | yes, with about 20,000 to spare |

So the economy region goes from 79 nodes to about 245, and the graph from 891 to about 1,055. On the committed
(uncompressed) index, at 172 bytes a node, the first two rows alone come to roughly 7,000 bytes against 7,113 of
headroom: too tight to rely on, and nothing after them fits. Recommendations, in order:

1. **Edges first.** Ship §5.1 and Q1 before any new essay registers. It is the largest quality gain per byte.
2. **Cap registered concepts at 8–9 per essay** (rule in §3). At one node per chapter the same 21 essays would
   add about 250, and the region would be a list of chapter titles.
3. **Land the compressed index before wave (ii).** If it is not committed, nothing after the two drafts fits.
4. **Register in waves**: (i) §5.1 edges, Q1 and the two drafts; (ii) A–D; (iii) E–K; (iv) the next queue, one
   essay at a time. Each essay's edges go in with its nodes, never later.
5. **Do not add nodes for concepts with no page.** Every **gap** id in §1 is created by its essay's
   registration, not before.
6. **One registrar pass for collisions among A–K.** Eleven writers are choosing ids and aliases in parallel. Before
   wave (ii), diff every `REGISTRY.json` against `site-registry.json` → `concepts` and against each other; the
   likely collisions are listed in §4 (PPP, interest parity, bank run, r − g, the Phillips curve, CAPM, GBM,
   learning curves, TFP).

### 5.4 One structural suggestion

`society` will hold about 200 nodes, more than any region except `computing`. Splitting it into 经济 and 金融与投资
(and leaving 社会 for civics and language) would make the map readable and give `investment` a home; it also
costs a region entry and re-partitioning. Not urgent: do it when the region passes about 150 nodes, which is
after wave (ii).

## Report (architect, 2026-11-25)

Verified from files: existing concept ids and anchors; the zero-edge fragments and the 30 isolated nodes; that
each of the 57 edges in §5.1 has two live endpoints and is absent from `atlas/data.js` in both directions; both
index sizes; the missing `investment` region mapping; the drafts' concept ids; A's and C's chapter lists as they
stood on 2026-11-25; that `supply-demand` #step1–#step3 teach the wedge, elasticity and surplus.

Not verified: B's chapters beyond the first and all of D's (no prose yet); anything about E–K beyond the
one-line commission (no directories existed), so every id in §4.E–§4.K is a proposal; the byte cost per node for
essay concepts specifically; whether a crypto essay exists on another branch; any 2025–2026 fact named under
"what to source"; that the generator can attach one essay chapter to another page's node (§4 intro). Trail hops
were checked by hand against §5.1, §5.1a, the "needs first" columns and the addenda, not by script.

A correction made while writing: the first draft of this plan said no page taught elasticity and proposed an
essay for it. A term sweep that covered only `copy.zh.js`, `content.zh.md` and `i18n.js` missed lessons whose
strings live in `app.js`. `supply-demand` teaches it. The other "appears nowhere" claims were then re-run over
every file type under economics, investment, demos, math, probability, psychology, society and engineering
(excluding A–D's directories): 夏普, CAPM, 有效前沿, 凯利, 信用利差, 经常账户, 稳定币, 影子银行, 损失厌恶, 泡沫, 最低工资, 市盈率,
指数基金, 有效市场, 不可能三角 return nothing. 随机游走 appears in why-one-rate, the derivatives draft and
`markov-chains`; 布朗运动 only in the derivatives draft; 杠杆 only in the derivatives draft and, as a statistics
term, in `regression-correlation`.
