---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Externalities & the Tragedy of the Commons · Who Pays the Bill
tagline: When a factory’s pollution costs fall on others, the market produces too much; a Pigouvian tax, property rights and bargaining are ways to pull that bill back into the price.
docTitle: Externalities & the Tragedy of the Commons · Who Pays the Bill
:::

## If buyers and sellers bear all the costs and benefits themselves, where does the market settle? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Private market
:::

::: html step0-1
s0step: "Step 0 · "
s0k: All costs are private
:::

<b>This step answers: where does a market with no externalities settle, and who gets how much surplus?</b> The demand line (cyan) is what buyers are willing to pay, the supply line (orange) is sellers’ marginal cost, and they cross at Q = (a − c)/(b + d). The cyan triangle is consumer surplus, the orange triangle is producer surplus, and together they are the total surplus, which the market maximises here. Drag the demand (a) and the cost (c). {#s0e .explain}

::: html step0-2
s0cv: Demand and supply lines with the two surplus triangles
lblA: Demand intercept a
lblC: Cost intercept c
:::

## When production harms a third party, how far above private cost is the social cost? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 External cost
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The external cost
:::

<b>This step answers: what happens to the part of the cost nobody pays?</b> Each extra unit harms a third party (neighbours, the environment) by e, which does not enter the firm’s cost. The red dashed line is the social marginal cost = private cost + e, and the red band is the external damage at each quantity. The market still decides on private cost and stops at the orange dot; the social optimum, with less output, is the green dot. Drag the external damage e. {#s1e .explain}

::: html step1-2
s1cv: The social marginal cost line above private supply with the damage band and the market and optimal quantities marked
lblE: External damage per unit e
:::

## How much does society lose on the extra units that get produced? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Deadweight loss
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The deadweight loss
:::

<b>This step answers: why are the extra units not worth producing?</b> Between the optimal quantity Q\* and the market quantity Q<sub>m</sub>, each extra unit costs society more (red line) than buyers are willing to pay (cyan line); the red triangle is the deadweight loss = ½·e·(Q<sub>m</sub> − Q\*). Here Q<sub>m</sub> − Q\* = e/(b + d): the steeper the supply line, the smaller the over-production. Drag e and the supply slope d. {#s2e .explain}

::: html step2-2
s2cv: The red deadweight-loss triangle between the market quantity and the optimal quantity
lblSlope: Supply slope d (×0.1)
:::

## How large a per-unit tax makes the market stop at the optimal quantity by itself? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Pigouvian tax
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The Pigouvian tax
:::

<b>This step answers: how high should the tax be?</b> A per-unit tax t on the firm lifts the supply line by t (green line) and cuts output to Q = (a − c − t)/(b + d). Social welfare = total surplus + tax revenue − external damage is a parabola in t whose peak is exactly at t = e: the tax equals the marginal external damage. The lower plot is welfare against the tax rate; too low does not cure enough and too high overshoots. {#s3e .explain}

::: html step3-2
s3cv: Top: the supply line with the tax and the new quantity; bottom: welfare against the tax rate, peaking at t = e
lblTax: Tax per unit t
:::

## How far will a pasture that anyone can use for free be grazed? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Commons
:::

::: html step4-1
s4step: "Step 4 · "
s4k: The tragedy of the commons
:::

<b>This step answers: why is a resource anyone can use overused?</b> There are N cows on the pasture; each earns 100 − N at a cost of 20, so total profit is N(80 − N), maximal at N = 40. When m herders each choose their own number taking the others as given, the total is N = 80·m/(m + 1): m = 1 is exactly the optimal 40 and larger m approaches 80, where total profit falls to 0. Each extra cow makes everyone else’s cows thinner, a cost the owner does not pay. Drag the number of herders. {#s4e .explain}

::: html step4-2
s4cv: Top: total profit against the number of cows with the equilibrium marked; bottom: the equilibrium herd growing with the number of herders
lblHerders: Number of herders m
:::

## Without a tax, can the parties solve the externality by bargaining? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Bargaining
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · Coase bargaining
:::

<b>This step answers: can bargaining reach an efficient result, and does it matter who holds the right?</b> Let the factory gain G from polluting and the neighbour suffer D. With costless bargaining the outcome is “pollute only if G > D” whoever holds the right; only who pays whom differs (the Coase theorem). Pick who holds the right and drag G and D; then raise the bargaining cost T: when |G − D| ≤ T the talks fail and the initial right decides, which may be inefficient. {#s5e .explain}

::: html step5-2
s5cv: Bars for the factory’s gain G and the neighbour’s damage D, with the bargaining outcome and payment
rtNeighbor: Neighbour holds the right (can demand no pollution)
rtFactory: Factory holds the right (may pollute)
lblG: Factory gain G
lblD: Neighbour damage D
lblT: Bargaining cost T
recapTitle: Recap
recap1: An externality puts part of the cost on a third party; the market decides on private cost and over-produces, and the excess is the deadweight loss ½·e·(Q_m − Q\*).
recap2: A Pigouvian tax equal to the marginal damage (t = e) pulls the external cost back into the price; commons are overused because everyone uses them and nobody pays.
recap3: Coase: with costless bargaining the holder of the right does not change efficiency, only who pays; with high bargaining costs the initial right and policy matter.
modelTitle: Scope and limits of the model
modelText: Model: linear demand and supply, a constant external damage per unit, a competitive market; the pasture is a Cournot-style game among m symmetric herders; the Coase example has two parties and complete information. Real external damage is hard to measure, and income effects, market power and asymmetric information are ignored. This page is not environmental-policy advice.
link0: → Supply & Demand: the tax wedge and deadweight loss
link1: → Game Theory: why individually best choices can add up badly
link2: → Climate Feedback: how the cost of emissions reaches everyone through the climate
:::

Page complete. {#done .readout .success i18n=text}

::: strings
rt_neighbor: the neighbour
rt_factory: the factory
axQ: quantity Q
axP: price / cost
lblCS: consumer surplus
lblPS: producer surplus
lblDemand: demand
lblSupply: private supply
s0ro: Equilibrium Q = {Q}, P = {P}; consumer surplus {cs}, producer surplus {ps}, total surplus {tot}.
lblMarket: market
lblOptimum: social optimum
lblSocial: social cost
s1ro: e = {e}: market quantity {Q} (price {P}), social optimum {qs}; {over} too much is produced, and the total external damage at the market quantity e·Q = {dmg}.
lblDwl: deadweight loss
s2ro: e = {e}, d = {d}: over-production Q_m − Q\* = {over}; deadweight loss = {formula} = {dwl}.
lblTaxSupply: supply with tax +{t}
axTax: tax rate t
axWelfare: social welfare
vExact: tax = marginal damage: optimal
vUnder: tax too low
vOver: tax too high
s3ro: t = {t}, e = {e}: quantity {Q}, social welfare {W} (optimum {Wopt}, short by {loss}), tax revenue {rev}; {verdict}.
lblSocialOpt: social optimum
lblHerd: equilibrium with {n} herder(s)
axCows: total cows N
axProfitAll: total profit
axHerders: herders m
axTotalCows: equilibrium cows
s4ro: m = {m}: equilibrium herd {N} (optimum {Ns}); total profit {pr} (optimum {ps}).
lblGain: factory gain G
lblDamage: neighbour damage D
lblPollutes: outcome: pollution happens
lblNoPoll: outcome: no pollution
lblPayN: factory pays neighbour {v}
lblPayF: neighbour pays factory {v}
lblNoPay: no payment
bYes: bargaining works
bNo: bargaining fails
s5ro: G = {G}, D = {D}, right held by {right}, bargaining cost T = {T} ({bargain}): {out}, net social gain {total} (best possible {best}).
:::
