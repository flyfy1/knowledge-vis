---
lang: en
title: Why Do a Few Companies End Up Owning Whole Markets? · An Interactive Long-form Essay
desc: Pricing power, cost structure, oligopoly, network effects, two-sided platforms, data loops, tying and self-preferencing, then how market power is measured, the market structure of the AI stack, and antitrust in the US, EU and China. Twelve industrial-organisation models you can drag, with every frontier fact dated and sourced.
---

::: strings
nav.back: ← Knowledge Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
common.replay: Replay
:::

# Why Do a Few Companies End Up Owning Whole Markets? {#hero}

::: strings
kicker: Economics · Markets & Competition · An Interactive Long-form Essay
:::

Search, mobile OS, cloud, chips, food delivery, AI models:<br>why nearly every market boils down to two or three players {.sub}

The search engine, mobile OS, cloud provider, and delivery app you use usually boil down to two or three contenders. That is neither coincidence nor pure conspiracy. This essay asks a single question: **what makes a market hold only a few firms, and when does that hurt buyers?** Below are twelve real models drawn from industrial organisation textbooks and papers, scaled down so you can drag them on a phone. By the end, you should be able to see which quantities an earnings call or antitrust ruling is really arguing over. {.lead}

This page was written by an AI: Anthropic's Claude. Anthropic itself is a participant in the AI model market discussed in Chapter 12; that chapter cites only dated, sourced numbers, with interested parties' statements tagged "Claimed"; where a source has a financial tie to Anthropic I say so and pair it with an independent one where I can. Every model is simplified, and parameters chosen merely to keep figures readable are noted beside each model. **This page explains mechanisms only; it is not investment advice and takes no view on any pending case.** Genuine disagreements exist within antitrust economics—where they come up, I lay out each school's position and sources without picking one for you. {.note}

## Pricing Power: Why a Seller Holds Back Output {#ch1}

::: strings
toc: Pricing Power: Why a Seller Holds Back Output
:::

A seller with power to set its own price sells up to the point where the extra revenue from one more unit equals the cost of making it—leaving price above cost. {.law}

With ten pancake stalls down a street, anyone who raises prices loses every customer, keeping price pinned near cost. If one stall owns the whole street, the owner has to ask: raise the price by one dollar and lose a few sales—does the lost profit on those forgone sales outweigh the extra dollar on every pancake still sold? This entire chapter is that arithmetic. For what "the margin" means, see [[scarcity-moves#c2|"Scarcity Moves" Chapter 2 ("The Margin")]]. What **demand elasticity** is, why some goods have more of it than others and how it is estimated from data is taught in Chapter 1 ("Elasticity") of the site's essay <a href="../../trade/who-pays-a-tariff/#elasticity">on who pays a tariff</a> (a short version is [[supply-demand#step2|Supply & Demand, Step 2 ("Elasticity")]]); here we only use its definition and its results.

The key number is demand elasticity ε: by what percent quantity drops when price rises 1%. The extra revenue from selling one more unit is **marginal revenue**, MR. To sell an extra unit, the seller must cut the price on all units already sold, so MR sits below price. Three equations form the backbone of the chapter:

MR = P·(1 − 1/ε)<br>Profit max: MR = MC<br>⇒ Lerner index L = (P − MC)/P = 1/ε {#eq .eq tag=div}

::: lab ch1-model
model.title: How one seller sets a price
model.how: Drag elasticity to watch price, quantity, and the three shaded areas move. Gold is seller profit, cyan is buyer surplus, and red is trades that would create value yet never happen because price is too high (deadweight loss). Then switch to "Individual price" to see what happens under perfect price discrimination.
model.aria: Monopoly pricing: demand curve, marginal revenue, marginal cost, and profit, consumer surplus, and deadweight loss
leg.d: Demand
leg.mr: Marginal revenue MR
leg.mc: Marginal cost MC
leg.profit: Profit
leg.dwl: Deadweight loss
leg.cs: Buyer surplus
ctl.eps: Demand elasticity ε
ctl.mode: Pricing rule
mode.one: Uniform price
mode.pd: Individual price (perfect price discrimination)
read.p: Price (cost = 10)
read.l: Lerner index (P − MC)/P
read.q: Quantity sold (100 at cost)
read.dwl: Deadweight loss as share of total surplus
cv.p: Price
cv.q: Quantity →
unit.pct: {v}%
unit.none: —
say.one: Elasticity {eps}: the seller sets price at *{p}* ({x}× cost), giving a Lerner index of {l} = 1/{eps}. At cost, 100 units would trade; only {q} sell now, leaving {gap} mutually beneficial trades (red) unrealised.
say.steep: Elasticity {eps}, near 1: buyers can barely walk away, so the seller pushes price to *{p}* ({x}× cost) and sells only {q} units. As elasticity approaches 1, markup explodes; below 1, the model seller would raise price without bound, so a monopolist always operates on the elastic part of demand.
say.pd: Each buyer pays their personal maximum willingness to pay: all 100 units sell and the red deadweight loss disappears, yet buyer surplus drops to zero—every dollar becomes seller profit (gold). Efficiency returns, completely one-sided in distribution.
:::

Three patterns stand out. First, at the default elasticity of 2, price is 20—exactly double cost, Lerner index 0.5; raise elasticity to 5 and price falls to 12.5, Lerner index 0.2. **Markup is dictated entirely by buyer elasticity**—a seller cannot simply charge "whatever it wants". Second, the seller sells only 25% of the competitive quantity. Third, notice the red wedge: across the whole slider from 1.25 to 8, deadweight loss stays between 20% and 26% of available value—a quirk of constant-elasticity demand that shifts under other demand shapes.

The ratio (P − MC)/P = 1/ε is the **Lerner index** (Lerner 1934), industrial organisation's standard measure of market power: how far price stands above marginal cost. Every later chapter asks what shrinks the ε facing a single seller. Crucially, ε is the elasticity facing **this individual firm**, not the industry: when rivals exist, raising your price sends buyers to them, making your own demand highly elastic. Which brings us to the next question: why do some markets lack rivals?

"Individual pricing" is **price discrimination**. What Chinese internet users call "big-data swindling of regulars" (dà shùjù shā shú: a platform quoting a higher price for the same thing to loyal customers or to people who rarely compare prices, based on their profile) is one form of it. The model yields a counter-intuitive result: perfect price discrimination beats uniform pricing on pure efficiency (output returns to 100), while its harm is distributional, capturing all buyer surplus. Real-world price discrimination is always partial, landing somewhere in between depending on the setting. The law does not treat it as a pure efficiency question: Article 24 of China's Personal Information Protection Law (in force 1 Nov 2021) forbids automated decision-making on personal data from applying unreasonable differential treatment in transaction prices and other terms, and the platform compliance guidelines of Feb 2026 mentioned in Chapter 12 list price discrimination as a risk. Which differences are "unreasonable" is decided case by case.

This model has a single seller, one good, a fixed demand curve, and constant marginal cost. It does not explain **why** this seller lacks rivals—that comes in the chapters ahead. {.take}

## Cost Structure Sets How Many Firms Fit {#ch2}

::: strings
toc: Cost Structure Sets How Many Firms Fit
:::

How many firms fit in a market depends on the ratio between total market size and the output one firm needs to reach minimum average cost (minimum efficient scale). {.law}

Opening a bakery requires fixed costs—ovens and rent—plus marginal costs of flour and electricity for each loaf. Baking more spreads rent over more loaves, until the ovens max out and overtime and spoilage push costs back up. Average cost falls, hits a trough, and rises. A city supports hundreds of bakeries because that trough arrives at tiny output.

Now swap bread for an operating system, a leading-edge chip fab, or a new drug. Bringing a new drug to market took a median R&D investment of about $1.14 billion in one study of 63 drugs approved in 2009–2018 (2018 dollars, counting failed trials and the cost of capital; Wouters et al., *JAMA* 2020, figure as corrected in 2022); TSMC's 2026 capex guidance is $60 billion to $64 billion; and training costs for frontier AI models have grown roughly 2.4× per year since 2016 (Cottier et al., 2024). Meanwhile, shipping one more copy of software, fabricating one more chip from an existing mask, or pressing one more box of an approved pill carries tiny marginal cost. The model below puts that on a chart.

::: diagram dg-cost keys=dg.cost
cap: Figure 1. Where the cost sits in a bakery and in a leading-edge chip design (schematic, not to scale). Gold is the fixed cost paid before anything is sold; cyan is what one more unit adds. The larger the fixed cost relative to the market, the larger the minimum efficient scale and the fewer firms the market holds.
aria: Schematic: a bakery has a small fixed cost and a visible cost per loaf; a chip design has a huge fixed cost and almost no cost per extra chip
at: A bakery
af1: Fixed cost
af2: oven, shop
am1: Each extra unit
am2: flour, power, labour
ames: Lowest cost at a few hundred loaves a day
bt: A leading-edge chip design
bf1: Fixed cost
bf2: R&D, tape-out, software
bm1: Each extra unit
bm2: a sliver of one wafer
bmes: Lowest cost at a big slice of the market
:::

::: lab ch2-model
model.title: Minimum efficient scale vs market size
model.how: Top: one firm's average cost curve (log output axis), with gold dashed at minimum efficient scale and red dashed at total market size. Bottom: unit cost when k identical firms split the market equally. Drag fixed cost and market size to watch the cheapest firm count move, or turn off "Capacity strain" to mimic software where extra copies cost practically nothing.
model.aria: Average cost curve, minimum efficient scale, market size, and unit cost across firm counts
leg.ac: One firm's average cost
leg.mes: Minimum efficient scale
leg.s: Market size
leg.k: Unit cost with k equal firms
ctl.f: Fixed cost
ctl.s: Market size
ctl.d: Capacity strain (rising MC at high output)
d.on: On
d.off: Virtually none
read.mes: Minimum efficient scale
read.ac: Minimum average cost (MC = 10)
read.k: Cost-minimising firm count
read.pen: Single-firm cost penalty
cv.ac: Average cost
cv.q: Firm output (log) →
cv.k: Firms k →
cv.u: Unit cost
unit.k: {v}
unit.inf: Unbounded
unit.pct: {v}%
say.many: Minimum efficient scale is {mes} units in a market of {s}, fitting roughly *{k}* efficient firms. Leaving just one firm raises unit cost by {pen}%: scale economies cannot justify monopoly.
say.few: Minimum efficient scale of {mes} units already takes a hefty slice of the {s}-unit market, so *{k}* firms is cheapest. A lone firm costs only {pen}% extra: cost alone leaves room for just a few.
say.natural: A market of {s} units is under 1.41× the minimum efficient scale of {mes}: *one firm serving everything is cheapest*, whereas splitting across two raises unit cost by {pen2}%. That is **natural monopoly**.
say.nod: Without capacity strain, average cost falls forever with scale and has no bottom: at any market size, *one firm is cheapest*, and two firms raise unit cost by {pen2}%.
:::

At the defaults (fixed cost 1 million, market 1 million units), minimum efficient scale is 100,000 units and the market fits 10 firms; forcing one firm raises unit cost by 270%. Push fixed cost to 10 million and the optimal count drops to 3. Shrink the market to 100,000 units and 1 firm suffices. Turn capacity strain off and unit cost rises monotonically with k: one firm wins at every scale.

When average cost falls across the entire range of demand so one firm produces cheaper than two or more, economics calls it a **natural monopoly** (subadditivity of the cost function, Baumol 1977). Water mains and power grids are classic examples, typically regulated directly. Software, chip design, pharmaceuticals, and foundation models are modern counterparts: massive fixed costs, small marginal costs, and large minimum efficient scale relative to market size. That is the first reason chips, software, and drugs concentrate—no malice required.

Cost alone, however, only states how many firms are cheapest—not how many actually survive or what prices they charge. Costs define the stage; how firms compete decides the play. The next two chapters model that.

The cost curve C(q) = F + 10q + d·q² (with d = 0.0001) is chosen to illustrate the U-shape rather than measured from a specific industry, and all firms share the same technology. In practice, fixed costs can also be amortised globally, expanding effective market size through exports. {.take}

## Among a Few Firms: Quantity, Price, and Differentiation {#ch3}

::: strings
toc: Among a Few Firms: Quantity, Price, and Differentiation
:::

With the exact same two firms, prices can stay near monopoly or collapse all the way to cost. What decides is not headcount, but how they compete: setting quantities, undercutting on identical prices, or selling differentiated products. {.law}

Two petrol stations sit across the street selling identical fuel. A one-cent cut sends every car to the cheaper pump, so they slash prices straight down to cost. Two cement plants, by contrast, commit capacity first and let the market clear, keeping margins alive. Two bubble-tea shops sell different recipes—if loyal fans stick to one shop, price never drops to cost either.

Those three cases are three classic models: **Cournot** (1838, quantity competition), **Bertrand** (1883, identical-goods price competition), and **differentiated Bertrand** (shown here with logit demand, the workhorse of modern empirical merger analysis). Every equilibrium below is a Nash equilibrium—no firm wants to deviate given rivals' choices; see [[game-theory#step2|Game Theory, Step 2 ("Nash Equilibrium")]].

::: lab ch3-model
model.title: Headcount and price: three ways to compete
model.how: Horizontal axis is firm count N; the three curves trace equilibrium price under each mode of competition. Drag N to read all three prices; drag "Taste differentiation" to shift the purple curve—the monetary spread in buyers' preferences across products. Demand is P = 60 − Q, marginal cost 10.
model.aria: Equilibrium price vs firm count under Cournot, homogeneous Bertrand, and logit differentiated Bertrand
leg.c: Cournot (quantities)
leg.b: Bertrand (identical prices)
leg.l: Differentiated (logit)
leg.mc: Marginal cost
ctl.n: Firms N
ctl.sigma: Taste differentiation σ
read.c: Cournot price · Lerner
read.b: Homogeneous Bertrand price
read.l: Differentiated price · Lerner
read.h: HHI (equal shares)
cv.p: Equilibrium price
cv.n: Firms →
unit.pl: {p} · {l}
say.one: With a single firm there is no rivalry (aside from the logit curve, whose demand shape differs): both Cournot and Bertrand give the monopoly price {c}.
say.many: {n} firms: price is *{c}* under quantity competition, collapses to cost {b} under homogeneous price competition, and sits at *{l}* with product differentiation. Every case has the exact same HHI of {h}, yet wildly different prices: **equal concentration can hide very different competition**. Under differentiation, no matter how many firms enter, price never drops below {floor} (cost plus σ).
:::

With two firms, Cournot sets price at 26.67, homogeneous Bertrand at 10 (marginal cost), and logit with σ = 8 at 23.87. At ten firms, Cournot drops to 14.55 while logit still holds 18.87. In Cournot, each firm's Lerner index equals its market share divided by industry elasticity, summing cleanly to

Share-weighted Lerner index = HHI / ε<br>HHI = Σ (100 × share)², between 0 and 10,000 {#eq .eq tag=div}

**HHI** (the Herfindahl–Hirschman Index) is the first number antitrust agencies compute in a merger review: square each firm's percentage share and sum. The 2023 US Merger Guidelines treat markets above HHI 1,800 as highly concentrated and presume mergers raising HHI by over 100 may harm competition—guidelines reaffirmed in February 2025 by the sitting agency leadership. Cournot gives HHI theoretical grounding (higher HHI means higher average markups), yet Bertrand simultaneously warns that even two firms can have zero pricing power. HHI is a screening tool, not a verdict.

When modern empirical industrial organisation simulates how much a merger will raise prices, the main tool is differentiated Bertrand along the purple curve (the Berry–Levinsohn–Pakes 1995 framework): estimate cross-product substitution from data, then recompute post-merger best-response prices. The chart shows why: most real goods are differentiated, pure Bertrand is too extreme, and few industries literally choose quantities in one shot like Cournot.

All three models are one-shot with identical costs, no capacity limits, and no tacit collusion (for cooperation in repeated play, see <a href="../../../math/applied/prisoners-dilemma/">The Prisoner's Dilemma & Evolutionary Games</a>). The logit baseline attractiveness parameter is chosen for scale. {.take}

## Entry: How Many Firms a Market Can Support {#ch4}

::: strings
toc: Entry: How Many Firms a Market Can Support
:::

Entering requires paying an unrecoverable upfront cost. The fiercer post-entry competition is, the less an entrant earns and the fewer enter—so industries with brutal price wars actually end up more concentrated. {.law}

Chapters 2 and 3 each told half the story. Cost says how many firms are cheapest; competition sets prices given who entered. Put them together: a challenger enters only if post-entry profits cover its **sunk cost** (factories, R&D, brand building that cannot be recovered on exit). Firm count is no longer an input—it is an equilibrium outcome.

This two-stage game (first decide whether to enter, then compete) lies at the heart of Sutton's "Sunk Costs and Market Structure" (1991). It yields a sharp prediction: under Cournot competition, equilibrium firm count grows only with the square root of market size divided by entry cost.

::: lab ch4-model
model.title: Free entry: how firm count moves with market size
model.how: Horizontal axis is market size (log scale); solid lines show equilibrium firm counts under free entry for the three modes of competition, and dashed grey marks the welfare-maximising Cournot count. Drag market size and entry cost. The last readout gives the "contestable market" price—what a lone incumbent can charge if entry costs are fully recoverable.
model.aria: Equilibrium firm counts under free entry across market sizes for three modes of competition
leg.c: Cournot
leg.l: Differentiated (logit)
leg.b: Homogeneous Bertrand
leg.opt: Welfare optimum (Cournot)
ctl.s: Market size
ctl.f: Entry cost
read.nc: Cournot: firms
read.nl: Differentiated: firms
read.nb: Homogeneous Bertrand: firms
read.opt: Welfare-optimal firms (Cournot)
read.pc: Cournot price
read.pk: Contestable-market price
cv.n: Firms
cv.s: Market size (log) →
unit.n: {v}
unit.none: None enter
say.normal: Market size {s}, entry cost {f}: Cournot draws *{nc}* firms at price {pc}; differentiated draws {nl}; homogeneous Bertrand supports just *{nb}* firm charging the monopoly price {pb}, because a second entrant knows price would crash to cost and never recover its entry bill. Welfare optimum is {opt}, so free Cournot entry overshoots: **excess entry**.
say.none: Market too small or entry too costly: no firm enters under any mode of competition.
say.cournotonly: Market size {s}, entry cost {f}: Cournot supports {nc} firms at price {pc} and homogeneous Bertrand supports {nb}, while nobody enters under differentiated demand (total logit demand mass is too small here).
:::

At the defaults (market size 4, entry cost 100), Cournot supports 9 firms at price 15; differentiated supports 4; homogeneous Bertrand stops at 1 firm charging 35—the full monopoly price. Quadruple market size from 4 to 16 and Cournot grows from 9 firms to 19—roughly doubling rather than quadrupling, tracing out the square-root law.

Two counter-intuitive lessons follow. First, **the fiercest price competition (Bertrand) produces the most concentrated market**—Sutton's central insight: high concentration can reflect how brutal competition would be after entry. Second, Cournot free entry (9 firms) overshoots the social optimum (4): each entrant counts its own profit without counting the profit it steals from rivals, leading to **excess entry** (Mankiw & Whinston 1986). "More firms" is not always better.

The last readout shows Baumol, Panzar, and Willig's (1982) **contestable market**: if entry costs are 100% recoverable (hit-and-run entry), even a single monopolist can charge no more than average cost without inviting instant entry. At defaults that price is 10.51, barely above marginal cost 10. Huge in the 1980s, contestability later drew criticism because real entry costs—R&D, brands, specialised gear—are mostly sunk, making it a benchmark rather than a description of typical markets. Notice that both have HHI 10,000, yet price can be 35 or 10.51.

Firms decide entry simultaneously with identical entry costs and no strategic deterrence (such as pre-building excess capacity). The logit demand-mass parameter is tuned so all three curves share one readable scale. {.take}

## Network Effects: More Valuable as More People Use It {#ch5}

::: strings
toc: Network Effects: More Valuable as More People Use It
:::

When a product's worth depends on how many others use it, demand forms a hump: below critical mass it collapses to zero; above critical mass it grows on its own. {.law}

The first telephone on Earth was useless—nobody else had one to call. Each new subscriber adds value to every person already connected. Messaging apps, email, and fax machines all work this way. When others' adoption makes a product more valuable to you, that is a **direct network effect**.

Suppose individuals' valuations θ for connecting to everyone are spread uniformly from 0 to 1, and a share n already uses the network, making membership worth θ·n. At price p, anyone with θ ≥ p/n wants in. When expectations about network size match reality, price and share obey (Rohlfs 1974; Economides 1996):

p = n·(1 − n) {#eq .eq tag=div}

::: diagram dg-links keys=dg.links
cap: Figure 2. Each new member adds a batch of possible links: n people form n(n − 1)/2 pairs. Two people make 1 pair; eight make 28. That is the geometry behind "the more people use it, the more it is worth".
aria: Schematic: 2, 3, 5 and 8 people all linked to each other, with 1, 3, 10 and 28 links
people: people
pairs: pairs
:::

::: lab ch5-model
model.title: Hump-shaped demand, critical mass, and takeoff
model.how: Top: the hump-shaped demand curve and horizontal price line intersect at two candidate equilibria—red dot for unstable critical mass, gold dot for stable high adoption. Bottom: starting from your "Initial users" slider, watch adoption evolve over time. Drag price and initial share, then click "Start".
model.aria: Hump-shaped network demand curve, price line, critical mass, and user share over time
leg.hump: Demand p = n(1 − n)
leg.p: Price
leg.crit: Critical mass
leg.path: Share over time
ctl.p: Price
ctl.n0: Initial users
btn.go: Start
read.crit: Critical mass
read.high: Stable high share
read.now: Current user share
read.t: Time
cv.p: Price
cv.n: User share n →
cv.share: User share
cv.t: Time →
unit.pct: {v}%
unit.none: None
say.none: Price {p} sits above the hump peak of 0.25: no network size justifies this price, so adoption collapses to zero from any start.
say.up: Initial share {n0} clears critical mass {c}: each newcomer makes membership worth more to the next, driving growth towards *{h}*.
say.down: Initial share {n0} falls short of critical mass {c}: the network is too thin even for current members, bleeding users down towards *zero*.
say.edge: Initial share {n0} sits right on the knife-edge of critical mass {c}: one more user triggers takeoff, one fewer triggers collapse.
say.doneup: Settled at *{h}*: once past critical mass, the network grew on its own to the stable high equilibrium.
say.donedown: Collapsed to *zero*: starting below critical mass {c} doomed an identical product at the exact same price.
:::

At the default price of 0.16, critical mass is 20% and the stable high share is 80%. Start at 25% and the network climbs to 80%; start at 15% and the very same product at the very same price collapses to zero. Raise price above 0.25—clearing the hump's peak—and no positive share can survive. That is why young platforms burn cash on subsidies: subsidies buy users across critical mass (the startup "cold start" problem), not immediate margin.

A system that feeds on itself past a threshold is called **positive feedback** or **tipping**. For a single network, it explains "scale or die". Next, put two rival networks side by side.

The model assumes users care only about total headcount, hold uniform valuations, fulfil expectations, and get zero standalone value without other users (real phones still take photos even if nobody calls). Adjustment speed τ is chosen for the animation. {.take}

## Two Standards Racing: Small Events Decide Big Outcomes {#ch6}

::: strings
toc: Two Standards Racing: Small Events Decide Big Outcomes
:::

When users choose not only a product but "how many others use the same one", early luck can decide the winner—and once a lead crosses a threshold, rivals can never catch up. {.law}

VHS vs Betamax, QWERTY keyboards, two mobile operating systems: two incompatible standards launch together while each arriving user watches which side has more adopters. Economist Brian Arthur (1989) captured the logic in a bare-bones model.

Adopters arrive one by one at random—half inherently prefer A, half prefer B, with preference strength g. Whoever they pick also yields network value r per existing user on that side. So an A-lover switches to B as soon as B leads A by more than g/r users. Once either side pulls ahead by g/r, every future user picks it forever: **lock-in**.

::: lab ch6-model
model.title: Arthur's model: 1,000 adopters choosing between two standards
model.how: Top: one sample history showing A's share as users arrive; the shaded red band is the unlocked zone. Bottom: distribution of the eventual leader's share across 200 simulated histories. Drag network-effect strength r or click "New history".
model.aria: Standard A's share over 1,000 adopters in a single simulated history
model.aria2: Distribution of the leading standard's final share across 200 histories
leg.a: Share of A
leg.lock: Unlocked zone
leg.hist: Outcomes of 200 histories
ctl.r: Network effect strength r
btn.go: New history
read.thr: Lock-in threshold (lead required)
read.at: Locked in at adopter
read.lead: Winner's final share this run
read.tip: Runs where one side reaches ≥ 90%
cv.share: Share of A
cv.users: Adopters →
cv.lead: Leader's final share →
cv.runs: Runs
unit.people: {v} users
unit.never: No lock-in
unit.inf: Never
unit.runs: {v} ({p}%)
unit.who: {w} · {v}%
say.none: With zero network effect, everyone simply follows their own taste: A and B split near 50/50, and none of the 200 runs tips.
say.locked: In this run, *{w}* pulled ahead by {thr} users at adopter {at}, capturing every user thereafter to finish at {lead}%. Across 200 histories, {tip} tipped past 90% and A won {aw} times: **who wins is nearly a coin toss, yet someone winning is almost certain**.
say.open: Across 1,000 users, neither side pulled ahead by {thr} users, so both survived. With weak network effects the threshold is high and 1,000 users may not suffice; {tip} of 200 runs still tipped.
:::

At the default r = 0.1, a lead of 10 users locks the market in. Across 200 histories, 177 end with one side taking over 90%, while A and B win roughly half the time each. That is Arthur's core insight: **under increasing returns, it is predictable that a winner will emerge, and unpredictable which one**. Tiny early accidents—landing one flagship customer or shipping a week sooner—shape decades, with no guarantee the better standard wins (here both are identical).

Why do users never switch after lock-in? The model bans switching; in real markets the barrier is **switching costs**—relearning tools, migrating data, old files breaking, contacts sitting on the other network (Klemperer 1987). Switching costs let the locked-in winner raise prices and block late challengers.

Chapter 10 reuses this exact model with interoperability, multi-homing, and stronger taste differences to test when lock-in breaks.

Adopters choose once on arrival and never switch; both preference types split 50/50; r and g are illustrative values. Arthur's paper also examined diminishing and constant returns; only increasing returns are shown here. {.take}

## Two-Sided Platforms: Why One Side Is Free {#ch7}

::: strings
toc: Two-Sided Platforms: Why One Side Is Free
:::

A platform connecting two groups prices each side minus "the value that side brings to the other". Whichever side is wanted more gets a discount—sometimes even a subsidy. {.law}

Searching the web costs you nothing, ride-hailing apps hand riders coupons, and credit cards pay cardholders cash back. Where does the money come from? The other side: advertisers, driver commissions, merchant fees. Businesses linking two distinct groups are **two-sided markets** (Rochet & Tirole 2003; Armstrong 2006). Unlike Chapter 5's direct network effects, these are **cross-side** network effects: riders care how many drivers exist, and drivers care how many riders exist.

Let each user on Side 1 (say riders, readers, cardholders) gain α₁ per member on Side 2 (drivers, advertisers, merchants), while each member on Side 2 gains α₂ per member on Side 1; serving any user costs f, and the two sides differ in baseline appeal. Below is the linear version of Armstrong (2006) where a platform sets both prices jointly to maximise total profit.

::: diagram dg-platform keys=dg.platform
cap: Figure 3. How money and value flow on a two-sided platform, with prices from the Chapter 7 model at its defaults (α₁ = 0.1, α₂ = 0.8). Green arrows are money paid to the platform; the thick violet line is the value side 2 gets from side 1. Side 1 pays 0.14, below the service cost of 0.2; side 2 pays 0.74.
aria: Schematic: side 1 (readers, riders) pays a very low price and side 2 (advertisers, merchants) a higher one, because side 2 values the size of side 1
s1: Side 1
s1e: readers, riders
pf: Platform
s2: Side 2
s2e: advertisers, merchants
p1: below cost 0.2
p2: above cost
a2: α₂ = 0.8: side 2 needs side 1 a lot
a1: α₁ = 0.1: side 1 barely cares how big side 2 is
:::

::: lab ch7-model
model.title: What each side pays: platform pricing
model.how: Cyan bars show prices on each side against the dashed gold service cost of 0.2; purple bars show participation. Drag both cross-side effects to see which side gets subsidised, or switch to "Duopoly" to see how platform competition splits the margin.
model.aria: Prices, service cost, and participation on both sides of a two-sided platform
leg.p: Price
leg.f: Service cost
leg.n: Participation
ctl.a1: Value Side 1 gets from Side 2 (α₁)
ctl.a2: Value Side 2 gets from Side 1 (α₂)
ctl.mode: Market structure
mode.mono: Monopoly platform
mode.duo: Duopoly (single-homing on both sides)
read.p1: Price on Side 1
read.p2: Price on Side 2
read.n: Participation (Side 1 · Side 2)
read.pr: Platform profit (ignoring cross-effects)
cv.side1: Side 1
cv.side2: Side 2
cv.price: Price
cv.n: Users
unit.pair: {a} · {b}
unit.prof: {a} ({b})
unit.half: 50% each
say.below: Side 1's price *{p1}* sits below service cost {f}: the platform **loses money** on Side 1 and recoups it from Side 2 at {p2}, because Side 2 badly needs Side 1 (α₂ = {a2}) while Side 1 barely cares about Side 2 (α₁ = {a1}).
say.cheaper: Both sides pay above service cost: {p1} on Side 1 and {p2} on Side 2. Neither cross-side effect is strong enough to make below-cost pricing pay off.
say.duo: Competing platforms, each side using only one: price = cost + differentiation markup − value brought to the opposite side. Side 1 pays *{p1}*, Side 2 pays *{p2}*. {note}
note.none: Across the slider range, each cross-side effect stays below differentiation parameter t = {t}, keeping both prices above cost; once a side's value to the other exceeds t, its price drops below cost.
:::

Monopoly: p₁ = f₁ + n₁ − α₂·n₂ , p₂ = f₂ + n₂ − α₁·n₁<br>Duopoly (single-homing): p₁ = f₁ + t₁ − α₂ , p₂ = f₂ + t₂ − α₁ {#eq .eq tag=div}

At defaults α₁ = 0.1 and α₂ = 0.8, Side 1 pays 0.14—below service cost 0.2—while Side 2 pays 0.74. If the platform ignored cross-effects and priced each side as a separate market, Side 1 would pay 0.35 and Side 2 0.6; the cross-effects are still there, so those prices earn only 0.26, against 0.30 when the platform prices with them in mind. Armstrong's equations say why: **each side's price = cost + standard markup − external value brought to the other side**. Who gets subsidised depends on who is needed more—not who is "more important" or "poorer".

Antitrust faces an immediate consequence: **looking at one side's price alone misleads**. "Free" does not imply zero market power, and "below cost" does not prove predatory pricing. In 2018 (Ohio v. American Express), the US Supreme Court required evaluating both sides together for transaction platforms—a ruling whose scope remains contested among economists.

Armstrong also analysed a widespread pattern called a **competitive bottleneck**: one side single-homes (most people keep one delivery app) while the other multi-homes (restaurants list on every app). Platforms fight tooth and nail—even subsidising—to win single-homing users, then act as sole gatekeepers to those users when pricing the multi-homing side, extracting near-monopoly commissions. High merchant fees alongside consumer coupons follow straight from that logic (omitted from the chart to keep formulas tidy).

Participation is linear in price with illustrative standalone values (0.5 and 1) and service cost 0.2; duopoly uses Armstrong's Hotelling setup with differentiation t = 1 and an equal split. Real platforms also price-discriminate within each side. {.take}

## Data and Learning: Does Getting Better Always Make You Bigger? {#ch8}

::: strings
toc: Data and Learning: Does Getting Better Always Make You Bigger?
:::

Users bring data, data improves the product, and a better product attracts more users. Whether that loop snowballs into winner-take-all depends on how fast returns to data diminish and how fast data goes stale. {.law}

More search users tell a search engine which links people click and skip, improving rankings and pulling in still more users. On the cost side, the older version is the **learning curve** (Wright 1936): every doubling of aircraft output trimmed unit labour hours by roughly 20%. Both obey the same power-law maths—error or cost declines as cumulative experience raised to a negative power.

Modern AI "scaling laws" give the data term an empirical exponent: in the Chinchilla fit, the data component of loss scales as dataset size to the −0.28 power (Hoffmann et al. 2022), while Epoch AI researchers refitting the same data in 2024 (Besiroglu et al.) found about −0.37. Amazon economists studying retail demand forecasting found longer product histories improve accuracy with diminishing returns, while adding data from more similar products stops helping quite early (Bajari et al. 2019; authored while at Amazon, disclosed in the paper). Below, two rival firms race inside that loop.

::: diagram dg-loop keys=dg.loop
cap: Figure 4. The data loop: users bring data, data cuts the error, a better product draws more users. Whether one firm takes all depends on two brakes: how fast the returns to data fall (β), and how fast data goes stale and must be refilled by current users (δ). Schematic.
aria: Schematic: users, data and quality joined head to tail in a loop, with the two brakes, diminishing returns and stale data, marked beside it
users: Users
data: Data
quality: Quality (lower error)
e1: more use, more data
e2: more data, lower error
e3: better, more users
e3n: back to users: better, more users
stale: δ: data goes stale
beta: β: returns to data diminish
:::

::: lab ch8-model
model.title: A data feedback loop between two firms
model.how: Firm 1 begins with twice Firm 2's data. Gold shows Firm 1's user share; cyan and purple show each firm's error. Drag "Data return exponent β" (higher means faster early improvement and sharper diminishing returns) and "Data decay rate δ", then click "Replay".
model.aria: User shares and model errors of two competing firms over time
leg.s: Firm 1 share
leg.e1: Firm 1 error
leg.e2: Firm 2 error
ctl.beta: Data return exponent β
ctl.delta: Data decay rate δ
read.s0: Starting share
read.s: Firm 1 current share
read.dc: Tipping threshold δc (even 50/50 turns unstable)
read.t: Period
cv.y: Share / error
cv.t: Time →
unit.pct: {v}%
unit.t: Period {v}
unit.inf: None
say.running: Period {t}: Firm 1 share is {s}.
say.fade: Starting ahead, Firm 1 drops from {s0} down to *{s}*. Both piles of data keep growing under diminishing returns, so the leader's error edge shrinks until users nearly split 50/50. **A pure data lead erodes on its own.**
say.tip: Data decay {d} exceeds threshold {dc}: both firms survive only on fresh user flow, so whoever holds more users holds more current data—the loop feeds itself and sends Firm 1 to *{s}*.
say.tipstart: Data decay {d} sits below threshold {dc}, so an even 50/50 split would still hold—yet Firm 1's 2× starting lead is already large enough to tip the market to *{s}*. Below δc, history decides.
say.hold: Firm 1 holds {s}—neither back at half nor at 100%: decay (δ = {d}) slows convergence yet lies below threshold {dc}, so shares drift slowly back towards equal.
:::

At the defaults (β = 0.3, zero decay), Firm 1 opens at 72% share and slides to ~52% by period 300; at β = 0.1 it fades even faster. Push data decay δ past ~0.11, however, and the loop tips Firm 1 to the whole market. Push δ past ~0.13 and even an exact 50/50 split becomes unstable, magnifying any tiny lead: linearising around 50/50 gives a closed-form instability threshold λ·β·δ^β·2^β > 1 (with quality sensitivity λ = 5). Between 0.11 and 0.13 lies a bistable band where 50/50 is locally stable yet a 2× head start still tips the market.

So "data is the new oil—whoever has the most data wins" comes with conditions: **returns to data must fade slowly, or data must go stale fast enough that only live users can replenish it** (fresh search queries, news, fashion). Which regime dominates real tech markets remains actively debated empirically: against the diminishing-returns studies above, a study of real Yahoo! search logs found that result quality improves with more data on past searches, and that personal data speeds the learning up greatly (Schäfer, Sapi and Lorincz 2018). Each of these findings is specific to its setting.

Cost-side learning curves obey the same rule: if rivals can copy what you learnt (knowledge spillovers), leads fade; if learning stays proprietary, the leader's cost gap widens over time. This is one firm's edge over its rivals; the cost curve of a whole industry or economy as a source of growth (Wright's law, why solar got cheap) is Chapter 7 ("Learning curves") of the essay <a href="../../growth/why-some-countries-got-rich/#ch7">on why some countries got rich</a>.

Users pick via logit choice over quality difference with sensitivity λ = 5 and a 2× initial data lead chosen for display; error keeps only the Chinchilla data term. Both firms share identical algorithms, whereas real data value depends heavily on how well a model uses it. {.take}

## Tying, Vertical Integration, and Self-Preferencing {#ch9}

::: strings
toc: Tying, Vertical Integration, and Self-Preferencing
:::

Bundling a monopolised product with a second product usually fails to earn a second monopoly profit—unless the second product has independent buyers and rivals need scale to survive, in which case tying can push rivals out. {.law}

Suppose a company owns a mobile OS and also builds maps, a browser, or an app store. It can require phone makers to preload its apps or put its own listings at the top of search results. Is that leveraging a monopoly, or simply offering a convenient package?

The Chicago school (Director, Bork, and others) offered an elegant argument called the **one-monopoly-profit theorem**: if buyers care only about the "OS + app" bundle, the OS owner already extracts the full monopoly profit through the OS price—monopolising the app adds zero dollars. Better yet, if a rival's app is superior, letting the rival in increases total value, which the OS owner can capture via a higher OS price. Whinston (1990) pinpointed when that argument breaks down. Below is a stripped-down version of his model.

::: diagram dg-tie keys=dg.tie
cap: Figure 5. Open against tied, as in the Chapter 9 model. When open, buyers of A can pair it with M's B or with the rival's better B; when tied, A works only with M's B, and the rival keeps only the buyers who do not need A.
aria: Schematic: when open, users choose between M's B and the rival's B; when tied, the path to the rival's B is cut
open: Open
tied: Tied
rival: Rival · B
users: Buyers of A
opennote: users pick the better B
tiednote: rival keeps only buyers without A
:::

::: lab ch9-model
model.title: When the one-monopoly-profit argument fails
model.how: Firm M monopolises good A and also sells B; a rival sells only B and beats M's version by Δ, yet must pay fixed cost K to stay viable. A fraction m of B buyers do not need A. Bars compare two regimes: Open (either B works with A) vs Tying (A works only with M's B). Drag all three sliders.
model.aria: Comparison of monopolist profit, rival profit, and total welfare under open compatibility vs tying
leg.m: M's profit
leg.r: Rival's profit
leg.t: Total welfare
ctl.m: Share of B buyers not needing A (m)
ctl.d: Rival B's quality edge Δ
ctl.k: Rival's fixed cost K
read.gain: M's extra profit from tying
read.riv: Rival under tying
read.loss: Welfare lost to tying
cv.open: Open
cv.tie: Tied
unit.alive: Survives
unit.dead: Exits
unit.deadopen: Cannot survive open
say.deadopen: The rival's edge is too thin to cover fixed cost K = {k} even under open access: with no rival to exclude, tying changes nothing.
say.profit: Tying confines the rival to buyers who do not need A, leaving {rt}—too little to pay fixed cost, so *the rival exits*. M captures those standalone buyers and gains *{gain}* extra profit, while total welfare drops by {loss} as the superior B vanishes. **One-monopoly-profit fails here** because B has independent demand (m = {m}).
say.nogain: At m = 0, every B buyer also needs A: tying drives the rival out, yet M earns zero extra profit ({gain}) while total welfare falls by {loss}. That is the Chicago benchmark: here the monopolist has **no incentive** to tie, so if tying happens, look elsewhere for the motive.
say.survive: Independent B buyers alone keep the rival afloat ({rt}): tying fails to exclude it, M earns no extra profit ({gain}), yet A users lose access to the better B, cutting welfare by {loss}.
:::

At the defaults (m = 0.3, Δ = 1, K = 0.5), the rival earns 0.8 when open and −0.2 when tied, forcing exit; M gains 0.6 while total welfare drops 0.8. Drag m to 0 and M's tying gain drops to 0: Chicago is right under its own assumptions. Whinston's failure conditions are right on the sliders: **the tied product has standalone buyers, and the rival needs scale to cover fixed costs**. Carlton & Waldman (2002) added a dynamic twist: knocking a rival out of B today can prevent it from growing into a challenger to A tomorrow.

**Self-preferencing**—ranking your own service above rivals in search or a feed—acts like partial tying: instead of blocking rivals outright, it makes them harder to reach, and the same logic applies. In July 2026 the European Commission ruled under the Digital Markets Act that Google favoured its own shopping, hotel, transport, and sports services in search results and fined it €460 million; Google argued the finding would worsen products and announced an appeal (see Chapter 12).

Vertical integration also has an unambiguous efficiency side. When separate upstream and downstream monopolists each add a markup, buyers get double-charged—**double marginalisation** (Spengler 1950). With demand P = 60 − Q and cost 10, separate pricing puts retail price at 47.5 and combined profit at 468.75; integrating into one firm drops retail price to 35 while lifting profit to 625. Both buyers and the firm come out ahead. Vertical mergers are therefore neither inherently harmful nor benign: the question is whether elimination of double marginalisation outweighs rival foreclosure.

Pure bundling can also raise welfare in another setting: when consumers' valuations for two goods are negatively correlated, a bundle lets more people buy both (Adams & Yellen 1976)—left aside here.

All marginal costs are zero, competition in B is Bertrand, the rival's edge Δ is identical for all buyers, and V = 10, w = 2 are illustrative. The model clarifies when foreclosure is possible, not how any real case should be decided. {.take}

## Winner-Take-All Is Not Inevitable {#ch10}

::: strings
toc: Winner-Take-All Is Not Inevitable
:::

Network effects tip a market to one firm only when users are trapped on one side. Interoperability, multi-homing, and genuine differences in taste can each undo Chapter 6's lock-in. {.law}

Email has strong network effects, yet any provider can message anyone else because the protocols interoperate. Most riders and drivers keep two or three ride-hailing or delivery apps active at once. People genuinely differ in what music, video, or social feeds they enjoy. None of those three forces appeared in Chapter 6's model—let us put them in now.

We take Chapter 6's Arthur model with network strength fixed at r = 0.1. Now the users you connect with equal single-homers on your side + multi-homers on both sides + φ × single-homers on the other side: φ is **interoperability** (0 = walled gardens, 1 = seamless bridge), h is the share of **multi-homing** users, and g is **taste differentiation**.

::: diagram dg-interop keys=dg.interop
cap: Figure 6. Three ways lock-in goes away (schematic). Without interoperability, users reach only their own side; interoperability (φ) lets the two sides reach each other; multi-homers (h) use both. The model below turns these three into sliders.
aria: Schematic: two user networks, first walled off, then joined by an interoperability link, then with some users on both
none: Walled off
phi: Interoperable φ
h: Multi-homing h
nonen: reach your own side only
phin: reach the other side too
hn: some use both
:::

::: lab ch10-model
model.title: What breaks lock-in
model.how: Bars show the distribution of the leader's final share across 200 histories; red bars mark runs where one side tipped past 90%. Drag interoperability, multi-homing, and taste differentiation.
model.aria: Distribution of the leader's final share across 200 histories with interoperability, multi-homing, and taste differentiation
leg.hist: Leader's final share
leg.tip: One side ≥ 90%
ctl.phi: Interoperability φ
ctl.h: Multi-homing share h
ctl.g: Taste differentiation g
read.tip: Tipped runs out of 200 (≥ 90%)
read.mean: Leader's average final share
read.thr: Lock-in threshold (lead needed)
cv.lead: Leader's final share →
cv.runs: Runs
unit.pct: {v}%
unit.people: {v} users
unit.inf: Never locks in
say.high: *{tip}%* of 200 histories still tip: a winner-take-all market.
say.mid: Tipping drops to *{tip}%* of 200 runs (average leader share {mean}%): sometimes one dominates, often two coexist.
say.none: *Zero* of 200 histories tip (average leader share {mean}%): both standards survive side by side. {why}
why.phi: Interoperability lets users reach people across the aisle, erasing the size edge of the leader.
why.other: The lock-in threshold ({thr} users) is too steep for 1,000 adopters to reach.
:::

Starting from the default 88.5% tipping rate across 200 runs: raise interoperability φ to 0.5 and tipping drops to 32%; at 0.8, zero runs tip. Make half of users multi-home and tipping falls to 69.5%. Raise taste spread g from 1 to 2 and tipping drops to 32.5%; at 4, only 2% tip. Interoperability bites sharpest because the lock-in threshold is g / (r(1 − φ)), shooting towards infinity as φ approaches 1.

That is why modern platform regulation targets these exact levers. The EU Digital Markets Act requires designated "gatekeepers" to permit third-party app stores and sideloading (reducing single-homing), basic messaging interoperability, and data portability (cutting switching costs). In AI, an open debate pits cheap API multi-homing—switching providers takes a few lines of code—against sticky chat histories, personal memory, and deep tool integrations that raise switching costs again. Which force wins has no reliable measurement yet.

Interoperability carries costs too: frozen technical standards can slow innovation, mandatory sharing can weaken incentives to build networks, and open bridges raise privacy and security concerns. How large those trade-offs are depends on implementation and sits at the heart of policy debates.

Retains Arthur's simplifications: one-time choice, two standards only, and multi-homers indifferent at the margin between sides. 1,000 users, 200 runs, and r = 0.1 are illustrative. {.take}

## How Market Power Is Measured {#ch11}

::: strings
toc: How Market Power Is Measured
:::

Market power means price above marginal cost—yet marginal cost never appears on an income statement. Every measurement is indirect, and high concentration does not automatically mean weak competition. {.law}

Chapter 1's Lerner index requires marginal cost, which company accounts do not report. One route is Chapter 3's demand estimation—inferring markups from elasticities industry by industry. In 2020, De Loecker, Eeckhout, and Unger took a macro route across US public firms and estimated average markups rose from 21% above marginal cost in 1980 to 61% in 2016, sparking a fierce debate over whether market power surged across the economy.

Their estimator comes from production theory (Hall 1988; De Loecker & Warzynski 2012): any cost-minimising firm adjusting a variable input satisfies the identity below, where θ is that input's output elasticity (how much output rises for 1% more input), estimated from production data. For variable input spend, they used "cost of goods sold" (COGS).

Markup μ = P/MC = θ_V × Revenue / Variable input spend {#eq .eq tag=div}

::: diagram dg-cogs keys=dg.cogs
cap: Figure 7. The same variable cost, booked in a different place. This is the toy economy of the model below, whose true markup is always 1.2: variable cost is 83% of sales and the margin 17% in both years; only the part of variable cost booked as cost of goods sold falls from 71% to 54% of sales. Counting COGS alone, the estimated markup rises from 1.20 to 1.57.
aria: Schematic: what sales are made of in 1980 and 2016. COGS shrinks, variable cost booked as SG&A grows, the margin is unchanged; the COGS-only markup estimate rises from 1.20 to 1.57
y0: 1980
y1: 2016
cogs: COGS
sga: variable cost in SG&A
margin: margin
est: COGS-only markup estimate
truth: true markup 1.2 in both years
:::

::: lab ch11-model
model.title: One constant-markup economy measured two ways
model.how: In this synthetic economy, true markup stays fixed at 1.2 from 1980 to 2016, yet the share of variable costs booked under COGS steadily falls while the rest sits in SG&A (software, marketing, admin). Drag 2016's COGS share, then tick "Include SG&A as variable cost".
model.aria: Estimated markup using COGS alone vs true constant markup over time in a synthetic economy
leg.est: Estimated markup
leg.true: True markup
ctl.cogs: 2016 COGS share of variable cost
ctl.sga: Include SG&A as variable cost
read.est: Estimated 2016 markup
read.true: True markup (constant)
:::

In this toy economy, simply shifting the COGS share from 0.85 down to 0.65 drives the COGS-only estimate from 1.2 up to 1.57 while truth never budges. That is Traina's (2018) critique: once SG&A expenses are included, the apparent US markup climb shrinks dramatically. De Loecker, Eeckhout, and Unger replied that much of SG&A is fixed overhead rather than variable input, and that their industry-year output elasticities absorb cost shifts. A deeper critique by Bond, Hashemi, Kaplan, and Zoch (*Journal of Monetary Economics* 2021) argued that most firm datasets record revenue rather than physical output, so revenue-based elasticity regressions cannot identify markups in theory. **The debate remains open**: the safest finding is that most of the measured rise sits in the upper tail—which the original authors themselves report—while the median moved little.

A second common trap is equating **concentration** with **market power**. Chapter 4 already showed HHI = 10,000 paired with price 35 or 10.51. The next model makes the point even more directly: three Cournot rivals where one becomes more efficient.

::: lab ch11-lab
model2.title: One firm improves: concentration rises, price falls
model2.how: Three firms compete in Cournot quantities under demand P = 60 − Q, starting with identical marginal cost 10. Drag Firm 1's cost down and watch market share, HHI, and price.
model2.aria: Market shares of three Cournot firms as Firm 1 lowers its marginal cost
leg.f1: Firm 1 share
leg.oth: Other two shares
ctl.c1: Firm 1 marginal cost
read.p: Price
read.h: HHI
read.cs: Consumer surplus
read.l: Firm 1 Lerner index
cv.mu: Markup P/MC
cv.y: Year →
say.cogs: Using COGS alone, estimated 2016 markup reads *{est}* while truth stays {mu}: shifting variable expenses into SG&A shrinks the denominator and inflates the estimate by {pct}%.
say.flat: With an unchanged COGS share, both definitions recover the exact truth of {mu}.
say.sga: Including SG&A in variable cost puts the estimate right back on truth at *{mu}*—a completely flat line.
cv.share: Market share
cv.f1: Firm 1
cv.f2: Firm 2
cv.f3: Firm 3
say2.same: All three share cost 10 and split the market in thirds: HHI {h}, price {p}.
say2.better: Firm 1 cuts cost to {c}: its share climbs to {s1}%, lifting HHI from 3,333 to *{h}*, yet price falls from 22.5 to *{p}* and consumer surplus rises from 703.1 to {cs}. Higher concentration leaves buyers better off.
schools.h1: School
schools.h2: Core premise
schools.h3: View on free platforms & tying
schools.h4: Key texts
schools.r1.1: Chicago School
schools.r1.2: Antitrust serves consumer welfare (chiefly price and output); markets usually self-correct; many exclusionary-looking practices reflect efficiencies.
schools.r1.3: Sceptical of tying or vertical harm (one-monopoly-profit); worries over-enforcement punishes successful firms.
schools.r1.4: Bork, *The Antitrust Paradox* (1978); Posner, *Antitrust Law* (1976)
schools.r2.1: Post-Chicago School
schools.r2.2: Keeps the consumer-welfare standard, yet uses game theory to prove exclusion can harm competition under concrete conditions; favours case-by-case proof.
schools.r2.3: Accepts Chapter 9's mechanisms: tying with standalone buyers can foreclose rivals needing scale; "raising rivals' costs".
schools.r2.4: Salop & Scheffman, *AER* 1983; Whinston, *AER* 1990; Shapiro, *IJIO* 2018
schools.r3.1: Neo-Brandeisian
schools.r3.2: Focusing on short-term prices misses platform harms; law should watch market structure, gatekeeper power, suppliers, labour, and concentrated power.
schools.r3.3: Treats "free" or below-cost pricing as tools to entrench dominance; favours structural remedies (breakups, bans on self-competition) and ex-ante rules.
schools.r3.4: Khan, "Amazon's Antitrust Paradox", *Yale LJ* 2017; Wu, *The Curse of Bigness* (2018)
:::

Cutting Firm 1's cost from 10 to 0 lifts HHI from 3,333 to 3,750 while dropping price from 22.5 to 20 and lifting consumer surplus from 703.1 to 800. That is Demsetz's (1973) point: concentration can arise because one firm is better, not because it suppresses rivals. The exact same numbers—rising concentration and rising leader margins—can tell an "efficiency" story or a "market power" story. Separating them demands looking at price, output, quality, and entry, not shares alone.

So what standard should antitrust enforce? Here economists and legal scholars genuinely disagree. The table sets out three main schools without choosing among them.

::: html ch11-html
:::

The split is not merely over facts—it is over goals: should antitrust guard only buyer prices and quality, or also market structure, suppliers, workers, and dispersed economic power? Economic models show when a practice raises prices; deciding what law ought to protect is a value judgement.

The markup simulation uses synthetic numbers purely to illustrate an accounting wedge and makes no claim about US data. The Cournot model varies only cost, omitting quality differences and entry. {.take}

## Where the Frontier Is: The AI Stack {#ch12}

::: strings
toc: Where the Frontier Is: The AI Stack
:::

AI is not one market—it is a stack of four: chips, cloud, models, and apps. Because each earlier mechanism varies in strength across layers, concentration varies layer by layer too. {.law}

Each card below tracks one layer. Every number carries its period and source. They were first checked on 11 November 2026, and the model-layer shares and the case statuses were rechecked on 25 November 2026 (sources in the footer). HHI bounds use reported top shares: the lower bound assumes the remaining share is split among tiny firms, while the upper bound splits it into firms no larger than the smallest named firm—computed by Chapter 3's model here, not given by the sources.

Badges: <span class="tag e">Established</span> an economic or mathematical result, or a law in force; <span class="tag d">Demonstrated</span> a dated, sourced fact that has been measured or has happened (a measurement, a ruling, a fine); <span class="tag c">Claimed</span> a figure or position from an interested party. {#legend}

How AI companies make money fits the same stack (Figure 8). Money flows down from the users at the top: users pay apps a subscription or by usage; apps pay model makers per token (the unit in which models meter text) for API access, and model makers' own chat products also charge users subscriptions directly; model makers rent compute from clouds; clouds buy chips and systems from chip firms. The earlier chapters supply the tools for how much each layer can mark up. Free, standard and premium subscription tiers are price discrimination in which buyers sort themselves by what they will pay (Chapter 1; for why a menu makes people sort themselves, see Chapter 5 of the essay <a href="../when-buyers-cant-see-quality/#ch5">on when buyers can't see quality</a>). Similar APIs, where switching often takes a few lines of code, push the model layer toward Chapter 3's price competition. And the fixed costs of chips and frontier models (Chapters 2 and 4) mean those two layers hold only a few firms. Which layer ends up with most of the profit depends on which has the fewest substitutes. That can be watched over time; this page makes no forecast. {#money}

::: diagram dg-stack keys=dg.stack
cap: Figure 8. How money flows down the AI stack (schematic, not to scale, and not any one company's actual revenue mix). Each layer buys inputs from the layer below; how much it can mark up depends on the elasticity it faces (Chapter 1) and how many suppliers the layer below offers (Chapters 3 and 10).
aria: Schematic: five layers from top to bottom, users, apps, foundation models, cloud and chips, with money flowing down the arrows and each layer's main way of charging written beside it
u: People and businesses
upay: subscription, per seat or usage
uhow: where the money starts
app: Apps (coding, support, search)
apppay: per-token API fees
apphow: subscriptions, seats, or bundled
model: Foundation models
modelpay: rented compute (GPU hours)
modelhow: tiered chat subscriptions + per-token API
cloud: Cloud and data centres
cloudpay: chips, systems, networking
cloudhow: compute by the hour; resold model APIs
chip: Chip design and foundry
chiphow: chips and systems; foundries per wafer
:::

::: lab ch12-lab
card.chips.title: Chips: design & foundry
card.chips.f1: <span class="tag d">Demonstrated</span>In {asOf}, TSMC took **{s1}%** of top-10 global foundry revenue, Samsung {s2}%, and SMIC {s3}% ({src}). From those three shares alone, HHI lies between {lo} and {hi}.
card.chips.f2: <span class="tag d">Demonstrated</span>TSMC guided 2026 capex to {lo}–{hi} (15 Oct 2026 earnings call, per trade press).
card.chips.f3: <span class="tag d">Demonstrated</span>NVIDIA quarter ended 26 July 2026: revenue {rev} ({dc} data centre), gross margin {gm}% (company release). Gross margin is not the Lerner index—it omits R&D and fixed costs—yet shows price far above unit manufacturing cost.
card.chips.mech: <span class="tag e">Established</span>Mechanisms: immense fixed costs and minimum efficient scale (Ch 2) plus manufacturing learning curves (Ch 8). <span class="tag c">Claimed</span>How tightly software-ecosystem switching costs (Ch 6) bind buyers remains debated.
card.cloud.title: Cloud computing
card.cloud.f1: <span class="tag d">Demonstrated</span>In {asOf}, global cloud infrastructure revenue hit roughly {size} (+{g}% y/y): Amazon **{s1}%**, Microsoft {s2}%, Google {s3}% ({src}). HHI lies between {lo} and {hi}: whether it crosses the US 1,800 "highly concentrated" line depends on how the remaining {rest}% is split.
card.cloud.f2: <span class="tag d">Demonstrated</span>In Nov 2025 the European Commission opened three cloud market investigations, reaching a preliminary view on 25 June 2026 that AWS and Azure should be designated gatekeepers under the DMA; no final decision seen as of 25 Nov 2026. <span class="tag c">Claimed</span>Microsoft argued the Commission ignored Google Cloud's growth; Amazon warned red tape hurts European competitiveness.
card.cloud.mech: <span class="tag e">Established</span>Mechanisms: data-centre scale economies (Ch 2) and switching costs from egress fees and integration (Ch 6), tempered by large buyers multi-homing across clouds (Ch 10).
card.models.title: Foundation models
card.models.f1: <span class="tag d">Demonstrated</span>Amortised training cost of the largest models has grown ~{g}× per year since 2016 (90% CI {lo}–{hi}×; Cottier et al. 2024): fixed costs are surging.
card.models.f2: <span class="tag d">Demonstrated</span>Inference prices for a fixed capability level have fallen by {lo}× to {hi}× per year depending on task (Epoch AI, Mar 2025): marginal costs are plunging—mirroring Chapter 2's high-fixed, low-marginal shape.
card.models.f3: <span class="tag d">Demonstrated</span>In 2026, top open-weight models trail top closed models by roughly {m} months on average (Epoch AI Capability Index, May 2026).
card.models.f4: <span class="tag c">Claimed</span>A 3 Nov 2026 report by the investment firm Menlo Ventures (a Sept 2026 survey of about 400 US enterprises) put US enterprise LLM API spend at Anthropic {s1}%, OpenAI {s2}%, Google {s3}% (implying HHI {lo}–{hi}), with open-source models taking {os}% of spend yet {ot}% of tokens. **Menlo is an investor in Anthropic**, and survey answers are not invoices, so it is tagged as a party's claim. This essay's author, Claude, is built by Anthropic.
card.models.f5: <span class="tag d">Demonstrated</span>A source with no known investment in any model maker: the AI Index of the payments company Ramp, built from the corporate-card and bill-pay records of more than 85,000 US businesses. In October 2026, {all}% of those businesses paid for some AI; {a}% paid Anthropic and {o}% paid OpenAI (a business can pay both). In the week to 15 Nov 2026 their token spend went {k1}% to Anthropic, {k2}% to OpenAI, {k3}% to xAI and {k4}% to Google (HHI about {h}). It sees only direct payments by Ramp customers: models bought through cloud bills or large contracts (a common way to buy Google's) are invisible to it, so Google's share is probably understated. The two measures rank the firms the same way; their shares differ a lot.
card.models.mech: <span class="tag e">Established</span>Mechanisms: fixed-to-marginal cost ratio (Ch 2, 4) limits how many frontier labs fit; uniform APIs make multi-homing cheap (Ch 10); open weights act as a price ceiling raising closed models' demand elasticity (Ch 1). How strong data feedback loops (Ch 8) are remains contested.
card.apps.title: Apps & distribution
card.apps.f1: <span class="tag d">Demonstrated</span>The EU's April 2026 first DMA review did not add generative AI as a core platform service, instead opening specification proceedings on how Google must grant third-party AI services Android access (Art. 6(7)).
card.apps.f2: <span class="tag d">Demonstrated</span>The US Google search remedies ruling barred exclusive distribution contracts for Google Search, Chrome, Assistant, and the Gemini app (2 Sept 2025).
card.apps.mech: <span class="tag e">Established</span>Mechanisms: owners of OSes, browsers, or search entry points can preload or rank their own AI first (Ch 9 tying and self-preferencing), while app development itself has low fixed costs and easy entry (Ch 4).
unit.usd: ${v} billion
unit.bnScale: 1
unit.quarter: Q{q} {y}
cases.h1: Jurisdiction · Matter
cases.h2: What happened
cases.h3: Status
case.us1.a: US · US v. Google (Search)
case.us1.b: Aug 2024: court ruled Google illegally maintained a search monopoly. Sept 2025 remedies order declined to force a Chrome sale, barred exclusive distribution deals, and ordered sharing of certain search index/user-interaction data plus search syndication. Final judgment entered 5 Dec 2025.
case.us1.c: Google appealed 16 Jan 2026; DOJ and states cross-appealed for tougher remedies 3 Feb 2026; pending in the D.C. Circuit.
case.us2.a: US · US v. Google (Ad Tech)
case.us2.b: Apr 2025: court found illegal monopoly in publisher ad servers and ad exchanges. Sept 2026 remedies order refused to force an AdX divestiture, imposing instead a six-year global behavioural decree (untying DFP from AdX, data portability).
case.us2.c: Parties ordered to submit final judgment drafts; appeals likely.
case.us3.a: US · FTC v. Meta
case.us3.b: 18 Nov 2025: judge ruled Meta's acquisitions of Instagram and WhatsApp did not constitute unlawful monopolisation, finding TikTok and YouTube compete in the same market. <span class="tag c">Claimed</span>Meta said the ruling reflects fierce rivalry; FTC argued the market should be assessed as of filing.
case.us3.c: FTC appealed in Jan 2026; appeal pending.
case.us4.a: US · FTC v. Amazon; DOJ v. Apple
case.us4.b: FTC accuses Amazon of illegally maintaining monopoly power in online retail markets. DOJ accuses Apple of monopolising smartphones; court denied Apple's motion to dismiss on 30 June 2025.
case.us4.c: Amazon trial set for 29 Mar 2027. Apple case in discovery; July 2026 press reports mentioned preliminary settlement talks (unconfirmed by either party).
case.us5.a: US · Epic v. Apple (external links)
case.us5.b: District court held Apple in contempt for charging 12%–27% commissions on external link purchases and barred any commission. Dec 2025: Ninth Circuit affirmed contempt while vacating the total ban on commissions.
case.us5.c: Supreme Court granted certiorari on Apple's petition 30 June 2026 (No. 25-1311), limited to the contempt question; on 2 Nov 2026 it set argument for 11 Jan 2027.
case.eu1.a: EU · Digital Markets Act fines
case.eu1.b: 23 Apr 2025 first fines: Apple €500m (anti-steering) and Meta €200m ("pay or consent"). 23 July 2026 Google fined €890m total: €460m for search self-preferencing and €430m for Play anti-steering. <span class="tag c">Claimed</span>Google said the ruling harms products and vowed to appeal.
case.eu1.c: Apple appealed to the EU General Court; Google given 60 days to comply.
case.eu2.a: EU · Cloud & AI
case.eu2.b: Three cloud investigations opened Nov 2025. Apr 2026 first DMA review called the law "effective", added no AI category yet prioritised AI and cloud, opening Android third-party AI access proceedings against Google. June 2026: preliminary view that AWS and Azure qualify as gatekeepers.
case.eu2.c: Final cloud gatekeeper decisions had been expected around Nov 2026; none published as of 25 Nov 2026. Third probe (whether current obligations fit cloud) due May 2027.
case.cn1.a: China · Platform exclusivity fines
case.cn1.b: SAMR fined Alibaba RMB 18.228bn on 10 Apr 2021 (4% of 2019 domestic revenue) for "pick one of two" exclusivity, and fined Meituan RMB 3.442bn on 8 Oct 2021 alongside returning RMB 1.289bn in exclusivity deposits.
case.cn1.c: Closed; both firms ordered to file three years of compliance reports.
case.cn2.a: China · New rules & delivery probe
case.cn2.b: Revised Anti-Unfair Competition Law took effect 15 Oct 2025, barring platforms from forcing merchants to sell below cost. Jan 2026: State Council anti-monopoly committee announced a food-delivery competition probe (subsidy wars); Feb 2026: SAMR issued platform antitrust compliance guidelines flagging algorithmic collusion, forced exclusivity, price discrimination, and below-cost pricing.
case.cn2.c: No findings published on the delivery probe (announced 9 Jan 2026) as of 25 Nov 2026.
case.cn3.a: China · NVIDIA / Mellanox conditions
case.cn3.b: On 15 Sept 2025, SAMR announced a preliminary finding that NVIDIA violated the Anti-Monopoly Law and conditions attached to its 2020 conditional clearance of the Mellanox acquisition.
case.cn3.c: SAMR stated further investigation is underway; no final penalty decision as of the 11 Nov 2026 check (not rechecked on 25 Nov).
:::

Putting all four layers together clarifies what is mechanism and what is still guesswork in "will a few firms monopolise AI?". **High confidence**: leading-edge chipmaking and frontier training carry steep fixed costs that—by Chapters 2 and 4—leave room for only a handful of firms. **Up in the air**: whether frontier model labs hold big markups turns on how closely open weights trail and how easy switching stays—both currently favour buyers, yet can shift. **Speculation**: whether data loops or personal memory turn a lead into lock-in has no solid measurement yet. {#p2}

What observable shifts could change that outlook? If training-cost growth slows or small models catch up, the fixed-cost moat shrinks; if strong interoperability standards (say universal agent and tool protocols) lock in, multi-homing stays cheap; if distribution owners bundle their own models into OSes and browsers, Chapter 9's foreclosure conditions appear. {#p3}

### Antitrust cases and rules in the US, EU and China (as of 11 November 2026, some rechecked 25 November) {#reg.title .sub3}

The table records facts and party claims only, predicting no outcomes. "Status" reflects what could be verified on the check date, and entries dated 25 Nov were rechecked; active dockets change—check court and agency releases for updates. {#reg.p}

::: html ch12-html
:::

Three jurisdictions take distinct paths. The US relies primarily on court litigation under Sherman Act Section 2 monopolisation, favouring behavioural remedies—both Google judges declined breakups. The EU adds an ex-ante layer alongside case enforcement: the Digital Markets Act lists flat prohibitions for gatekeepers (self-preferencing, anti-steering, forced tying) without proving harm case by case. China combines its Anti-Monopoly Law with the revised Anti-Unfair Competition Law (effective Oct 2025), targeting both exclusivity ("pick one of two") and cut-throat subsidy wars—a focus rarely seen in US or EU enforcement. {#p4}

Which route works best extends Chapter 11's schools table: ex-ante rules act faster and give clarity at the risk of banning efficiencies; case-by-case trials probe deeper yet move slowly—sometimes after markets shift beneath them (as in Meta, where the court held TikTok and YouTube reshaped the market). {#p5}

Numbers here will age and sit together in models.js's FRONTIER block for easy updates; shares come from analyst estimates that can differ sharply across methodologies. {.take}

## How to Read an Antitrust Headline {#ch13}

::: strings
toc: How to Read an Antitrust Headline
:::

"Only a few firms" is never the full answer. Ask how many firms costs allow, how fiercely they compete, whether buyers can multi-home or switch, and whether the leader is blocking rivals from catching up. {.law}

Next time you see "Platform X accused of monopoly" or "Concentration surges in industry Y", walk through these five questions—one for each step of the essay:

{.plain .qs}
1. **How big are fixed costs and minimum efficient scale relative to market size?** If one efficient firm fills a huge slice of the market, concentration comes from cost (Ch 2, 4). {#q1}
2. **How do firms compete?** Identical goods or differentiated? Price wars or capacity? Identical HHIs hide vastly different prices (Ch 3). {#q2}
3. **Does value come from others using it, and can users multi-home or switch easily?** Network effects create lock-in only alongside single-homing and switching costs (Ch 5, 6, 10). {#q3}
4. **On a platform, what does each side pay?** Free on one side does not mean zero market power; both sides belong in the analysis (Ch 7). {#q4}
5. **Is an incumbent using power in one market to hobble rivals in another?** Check whether the tied product has standalone buyers and whether rivals need scale to survive (Ch 9). {#q5}

Almost every clash in an earnings transcript or court opinion reduces to estimating one of these six quantities:

::: html ch13-html
:::

When a market leaves only a few winners, the commonest driver is *cost*: high fixed costs and low marginal costs only fit a few firms. Next comes *demand-side scale*: network effects and data loops make a lead self-reinforcing, provided users single-home and returns fade slowly. Few firms do not automatically mean high prices: prices depend on *how firms compete* and *how easy entry is*. Real buyer harms are concrete—prices held far above cost, better rivals excluded via tying or ranking, users trapped by switching costs—and each has a quantity to measure, even when the measurements themselves are contested. {#sum .sum tag=div}

Related pages: <a href="../../../demos/scarcity-moves/">Scarcity Moves</a> · <a href="../../../math/applied/supply-demand/">Supply & Demand</a> · <a href="../../../math/applied/game-theory/">Game Theory</a> · <a href="../../../math/applied/prisoners-dilemma/">The Prisoner's Dilemma & Evolutionary Games</a> · <a href="../../../math/applied/externalities/">Externalities & the Tragedy of the Commons</a> · <a href="../../../math/applied/auction-basics/">Auctions</a> {#links style="margin-top:2em"}

::: strings
merit.h1: Quantity
merit.h2: What it captures
merit.h3: Where in this essay
merit.r1.1: Price–cost margin (Lerner index)
merit.r1.2: How far price sits above marginal cost; the definition of market power
merit.r1.3: Ch 1, 11
merit.r2.1: Demand elasticity ε
merit.r2.2: How many buyers one firm loses if it raises price; sets maximum markup
merit.r2.3: Ch 1, 3
merit.r3.1: Concentration (HHI)
merit.r3.2: Distribution of market shares; a screening indicator, not power itself
merit.r3.3: Ch 3, 4, 11, 12
merit.r4.1: MES ÷ market size
merit.r4.2: How many efficient firms costs leave room for
merit.r4.3: Ch 2, 4
merit.r5.1: Network-effect strength (r, α)
merit.r5.2: Value gained per other user; sets critical mass and tipping threshold
merit.r5.3: Ch 5, 6, 7
merit.r6.1: Switching cost, multi-homing cost, interoperability
merit.r6.2: Whether buyers can use two rivals at once or walk away
merit.r6.3: Ch 6, 10
:::

::: footer
**Model sources**: Ch 1 Lerner (1934), Tirole "The Theory of Industrial Organization" (1988) Ch 1; Ch 2 Baumol (1977) natural monopoly and subadditivity, Panzar (1989) "Handbook of Industrial Organization" Ch 1, Wouters, McKee & Luyten (*JAMA* 2020; corrected 2022); Ch 3 Cournot (1838), Bertrand (1883), Anderson, de Palma & Thisse (1992) logit differentiation, Berry, Levinsohn & Pakes (1995); Ch 4 Sutton (1991) "Sunk Costs and Market Structure", Mankiw & Whinston (1986), Baumol, Panzar & Willig (1982); Ch 5 Rohlfs (1974), Economides (1996); Ch 6 & 10 Arthur (1989), Klemperer (1987); Ch 7 Rochet & Tirole (2003), Armstrong (2006); Ch 8 Wright (1936), Hoffmann et al. (2022), Besiroglu et al. (2024), Bajari et al. (2019), Schäfer, Sapi & Lorincz (2018); Ch 9 Whinston (1990), Carlton & Waldman (2002), Spengler (1950), Adams & Yellen (1976); Ch 11 De Loecker, Eeckhout & Unger (2020), Traina (2018), Bond et al. (2021), Demsetz (1973).

**Chapter 12 fact sources** (first checked 11 Nov 2026, some rechecked 25 Nov 2026): Synergy Research Group / TechInsights 2026-10-30; TrendForce 2026-09-09; NVIDIA 2026-08-26 press release; Cottier et al. arXiv:2405.21015; Epoch AI Data Insights 2025-03-12 and 2026-05-29; Menlo Ventures "2026: The State of Enterprise AI" 2026-11-03 (Menlo is an Anthropic investor); Ramp AI Index (data to Oct 2026, token spend for the week to 2026-11-15, read 2026-11-25); European Commission cloud press release 2026-06-25; Supreme Court Docket No. 25-1311 (argument set 2026-11-02); US DOJ 2025-09-02 press release; European Commission 2025-04-23 and 2026-07-23 press releases; SAMR announcements. Full links live in BRIEF.md in this directory.

Written by Claude (Anthropic); every model is an illustrative simplification. Nothing here is investment, legal, or business advice.
:::
