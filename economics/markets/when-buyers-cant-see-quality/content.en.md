---
lang: en
title: When Buyers Can't See Quality: Lemons and Insurance · A Hands-On Essay
desc: Why are used-car lots full of lemons? Why does insurance come with deductibles and medical exams? Why should everyone join public health insurance, and why will a bank refuse a loan rather than raise the rate? Starting from expected value and risk aversion: risk pooling, the market for lemons, the insurance death spiral, deductible menus, signalling, moral hazard, credit rationing and credit scores, with eight hands-on models, ending at the frontier of data-driven pricing, genetic information and enrolment rules.
---

::: strings
nav.back: ← Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.wan: ¥{v}k
u.yuan: ¥{v}
u.x: {v}×
u.yr: {v} yr
u.pp: {v} pts
ui.step: Next round
ui.run: Play
ui.reset: Reset
:::

# When Buyers Can't See Quality: Lemons and Insurance {#hero}

::: strings
kicker: Economics · Markets · A hands-on essay
:::

The seller knows whether the car is any good; the buyer doesn't. The person buying insurance knows how healthy they are; the insurer doesn't.<br>When one side can't see, how does a market break, and what have people invented to fix it? {.sub}

Used-car lots are full of bad cars; insurers want a medical exam and make you pay a deductible first; public health insurance wants everyone in; banks would rather refuse a loan than charge a little more interest. These rules look unrelated, but they answer one question: **when one side of a trade knows more than the other, how does the market break, and how do people fix it?** Chapters 1–2 explain why insurance exists at all: why people pay more than their average loss to swap it for a certainty. Chapters 3–4 watch hidden information take a market apart, layer by layer, from used cars to an insurance pool. Chapters 5–7 are the repairs: let people pick their own contract, let the informed side pay to send a signal, and the other half of the problem, that insured people grow careless. Chapters 8–9 carry the same logic over to lending: interest rates, credit rationing and credit scores. Chapter 10 is the frontier, and chapter 11 gives you three questions to ask of any market where someone can't see. {.lead}

This essay was written by an AI. Every model is a small toy: its numbers come from the code on this page, not from real market data, but the logic matches the original textbook models (Akerlof 1970, Rothschild and Stiglitz 1976, Spence 1973, Stiglitz and Weiss 1981). The last paragraph of each chapter says what the model leaves out. This is about mechanisms, not financial, insurance or lending advice. Money is in Chinese yuan. {.note}

## Why buy insurance that loses money on average {#ch1}

::: strings
toc: Why buy a losing bet
:::

To someone who dislikes risk, a sure 99 can be worth more than "100 on average". Insurance swaps a lottery ticket with wins and losses for one certain number, and the difference is what that person will pay for certainty. {.law}

Say you have ¥200k in savings and a 2% chance this year of an illness that costs ¥100k. On average this risk costs you ¥{=ch1.ev} a year. If someone charges you ¥3,000 to carry that ¥100k for you, you lose ¥1,000 on average. Many people buy anyway, and gladly.

::: diagram dg-gamble keys=dg.gamble
cap: Figure 1. Without insurance you hold a lottery ticket; with it you hold one certain number. The numbers match the model's defaults (¥200k saved, a 2% chance of losing ¥100k).
aria: Diagram: without insurance, 98% chance of keeping ¥200k and 2% chance of ¥100k; with insurance, ¥200k minus the premium either way
h1: Uninsured
h2: Insured
a1: 2% chance
a2: ¥100k left
b1: 98% chance
b2: ¥200k left
c1: Either way
c2: ¥200k − premium
f: The extra over the average buys certainty
:::

The reason is that money's usefulness is not even. Falling from ¥200k to ¥100k costs the school fees and the rent; rising from ¥200k to ¥300k buys a nicer holiday. The first yuan matters more than the last, and economists describe this with a **utility curve** that bends downward. The model below uses the most common such curve (constant relative risk aversion, CRRA), whose bend is set by one number, the **coefficient of risk aversion**: 0 means you care only about the average; the larger it is, the more you dislike risk.

::: lab ch1-model
model.title: The most you would pay for this insurance
model.how: Drag the chance of a loss, its size and your risk aversion. Watch the gold dot: the sure amount that is exactly as good as the gamble, called the certainty equivalent. Its distance from ¥200k is the most you would pay.
ctl.p: Chance of a loss
ctl.L: Loss
ctl.g: Risk aversion
cv.aria: Utility curve: savings across, utility up; red dot after a loss, cyan dot no loss, gold dot the certainty equivalent
cv.x: Savings (¥10k)
cv.y: Utility
cv.loss: After a loss
cv.no: No loss
cv.ev: Average savings
cv.ce: Certainty equivalent
read.ev: Average loss
read.max: Most you'd pay
read.rp: Paid for certainty
read.ratio: Times the average loss
say.averse: The average loss is only {ev}, yet you would pay up to <em>{max}</em>: the extra {rp} buys "no sudden big drop".
say.neutral: Risk aversion 0: you look only at the average and would pay at most the average loss, {ev}; any loading by the insurer and you don't buy.
:::

At the default coefficient of 2 you would pay up to ¥{=ch1.max}, {=ch1.ratio} times the average loss; the extra ¥{=ch1.rp} is the **risk premium**. At a coefficient of 1 you would pay up to ¥{=ch1.max1}. Push the chance to 20%: the average loss is ¥{=ch1.ev20}, the most you would pay ¥{=ch1.max20}, only {=ch1.ratio20} times as much. One pattern is worth remembering: **the rarer and larger the loss, the bigger the share people pay for certainty**, which is exactly where insurance sells best. How expected value works, and why people "knowingly lose" on insurance, is told more simply in [[expected-value#step4|Expected Value, step 4]]; the general link between risk and return is in [[risk-return]].

The model assumes you know your own chance exactly and face one risk in one period. Real people misjudge small chances: some overrate plane crashes, some underrate their own illness. Chapter 4 reuses this model: the "most you'd pay" it computes is each person's bid for insurance. {.take}

## Ten thousand people carry it together: risk pooling {#ch2}

::: strings
toc: Carrying it together
:::

One person faces a gamble of 0 or ¥100k; ten thousand people together face an average loss that can be worked out in advance. An insurer sells not luck but the law of large numbers. {.law}

This chapter summarises another lesson on this site: why a pool can be priced is in [[risk-pooling#step1|Risk Pooling & Insurance, step 1]]; why no pool is big enough when one flood drowns everyone is in [[risk-pooling#step3|step 3]].

The insurer dislikes risk too, so why will it take yours for only a little more than the average loss? Because it doesn't take only yours. If ten thousand people each have a 2% chance of losing ¥100k, about 200 of them suffer a loss in a year, give or take a dozen or so. The more people, the closer the average loss stays to its mean; the spread shrinks with the square root of the number.

::: diagram dg-pool keys=dg.pool
cap: Figure 2. Risk pooling: each person pays a certain premium, and the pool pays the few who suffer a loss. Schematic, not to scale.
aria: Diagram: six people pay premiums into one pool, which pays those who suffer a loss while the rest have nothing happen
top: Each pays a certain premium
mid: The pool
mid2: More people, steadier payouts
l: A few lose: paid
r: Most are fine
f: The spread shrinks as √N
:::

That lesson has the full model: drag the number of people and watch the distribution of the average loss narrow, and see how much margin the premium needs so the pool never runs dry. Here you need only one premise: **a pool can be priced because the insurer roughly knows who is in it.** If people decide for themselves whether to join, and they know their own risk better than the insurer, the pool changes. [[risk-pooling#step4|Step 4]] of that lesson already asks "why do only the high risks stay insured?"; the next three chapters widen that question from insurance to every market where one side can't see.

There is no new model here, because that lesson covers it. It leaves out the same things as chapter 1: one period, and every loss the same size. {.take}

## The market for lemons: why the good cars left {#ch3}

::: strings
toc: The market for lemons
:::

If buyers can't tell good from bad, they offer only the average price; that price is too low for owners of good cars, so the good cars leave; what remains is worse, and the offer falls again. Hidden quality can shrink a market everyone wanted to trade in until only bad cars are left. {.law}

On a used-car lot the seller has driven this car for three years and knows where it leaks oil; the buyer can only walk around it once. Americans call a defective used car a lemon. In 1970 the economist George Akerlof wrote a 13-page paper, "The Market for 'Lemons'", asking a simple question: what happens if buyers can't tell which cars are lemons?

::: diagram dg-lemon keys=dg.lemon
cap: Figure 3. The lemons loop: only sellers know quality, so price follows the average; good cars leave first and the average falls.
aria: Diagram: sellers know quality, buyers see only the average; buyers offer by the average, owners of good cars find it too low and leave, the average quality on sale falls, the offer falls again
s1: Sellers know
s2: what each car is worth
b1: Buyers can't see
b2: only the average
p1: Offer the average
p2: average × premium
x1: Good cars leave
x2: average on sale falls
f: Each turn, price and quality on sale both fall
f2: Where it stops depends on the worst car
:::

The model has 200 cars, each worth between ¥20k and ¥100k to its owner, spread evenly. Every buyer needs a car more than its owner: for the same car a buyer would pay a fixed multiple more (1.5× by default), so if everyone could see, every car should change hands and both sides would gain. But buyers can't see, so they offer 1.5× "the average worth of the cars on sale"; any owner who values the car above the offer doesn't sell.

::: lab ch3-model
model.title: A used-car market with hidden quality
model.how: Press "Next round" to watch buyers make an offer, owners decide whether to sell and the offer adjust; or press "Play". Drag "Buyers value cars" (how many times more a buyer will pay than the owner) and "Worst car worth". Each dot above is a car, lit if still on sale; below is the offer in each round, and the dashed line is the price where theory says it stops.
ctl.b: Buyers value cars
ctl.lo: Worst car worth
cv.aria: Top: 200 cars laid out by quality, lit ones on sale; bottom: the offer round by round
cv.cars: Each dot is a car (lit: still on sale)
cv.x: What the owner thinks it's worth (¥10k)
cv.offer: Offer {p}
cv.round: Round
cv.price: Offer (¥10k)
read.round: Round
read.price: Buyers' offer
read.on: Cars on sale
read.onv: {k} of {n}
read.gain: Gains from trade realised
say.run: This round buyers offer {p}; the {k} cars worth less than that are still for sale, averaging {avg}. Press "Next round" and buyers re-offer on that average.
say.part: It has settled: an offer of {p} and only {k} cars on sale. Every car better than {p} has left, and only {g} of the gains both sides could have had are realised.
say.full: It has settled: the offer is high enough that even the best car sells, and all {n} change hands. When buyers need cars enough and quality varies little, hidden quality does no harm.
say.dead: The market has all but vanished: {k} cars left and the offer down to {p}. Every round the best batch leaves first, until no cars remain.
:::

By default (all values in units of ¥10k), buyers first offer {=ch3.p0}, the average of all cars, and the {=ch3.k0} cars worth less are put up for sale; their average is lower, so the second offer falls to {=ch3.p1} with only {=ch3.k1} cars left. After {=ch3.rounds} rounds the market settles at an offer of {=ch3.pf} and {=ch3.kf} cars, realising only {=ch3.gf}% of the gains from trade that were all available. Drag "Worst car worth" to 0: after {=ch3.r0lo0} rounds {=ch3.k0lo0} car is left, and the market has collapsed.

The process has a clean formula. With car values spread evenly between lo and hi, the average car on sale at offer p is (lo + p)/2, buyers offer b times that, so the price settles where p = b(lo + p)/2, that is **p* = b·lo/(2 − b)**. At the defaults b = 1.5 and lo = ¥20k, p* = ¥{=ch3.fix}0k, matching where the simulation stops (it has 200 actual cars, so it is a little off). The formula also says that with b ≥ 2 nothing unravels, and with a worst car worth 0, p* = 0 and nothing is left. This is **adverse selection**: the price itself screens out the good side.

It is a kind of **market failure** ([[scarcity-moves#c6]], chapter 6): everyone does what is sensible for themselves, and trades everyone wanted end up not happening. It differs from the other common failure, [[externalities#step3|externalities]]: there both sides of the trade know everything and someone is simply not at the table (the factory's smoke drifting next door); in a lemons market everyone is at the table but one side can't see. So externalities are treated by pricing or regulating the cost no one counted, and lemons by getting information across, which is what the following chapters are about.

By Akerlof's own account (his 2001 Nobel essay), three journals turned the paper down first: the American Economic Review and the Review of Economic Studies found the subject too trivial, while referees at the Journal of Political Economy argued it was wrong, since if it were right nothing could be traded at all. It finally appeared in the Quarterly Journal of Economics; in 2001 it won him the Nobel prize in economics, shared with Spence and Stiglitz. The model leaves out what matters most in real used-car markets: inspection reports, warranties, platform reputations, introductions through friends. Those are exactly the repairs in chapters 5–6, which is why real used-car markets have not collapsed; good cars just tend to travel by other routes (friends, certified pre-owned dealers). {.take}

## The insurance death spiral, and why "everyone in" {#ch4}

::: strings
toc: The death spiral
:::

People in an insurance pool know their own risk. A premium set at the average is too dear for the healthiest, so they leave; those left are sicker on average and the premium rises again. This is the insurance version of the lemons market, called the death spiral. To stop it, either keep everyone in (mandates, subsidies, penalties for lapsing) or let the insurer see risk (exams, classes). {.law}

Replace chapter 3's cars with people: each faces chapter 1's gamble (¥200k saved, a possible ¥100k loss), only with different chances. Some have a one-in-a-thousand chance a year, some over one in five. In the model's 1,000 people the median chance is about {=ch4.med}%, and the average expected loss is ¥{=ch4.mean} a person a year. Each person's bid for insurance is the "most you'd pay" from chapter 1's model: someone with a 1% chance would pay up to ¥{=ch4.wtp1}. The insurer can't tell who is who, so it charges the average loss of those who remain, plus 15%.

::: diagram dg-spiral keys=dg.spiral
cap: Figure 4. The death spiral. The loop is the spiral itself; the line below names the two kinds of cure.
aria: Diagram: the premium rises, the healthiest leave, the pool's average risk rises, the insurer computes a higher premium, and around again
a: Premium rises
b: Healthiest leave
c: Pool gets sicker
d: Reprice at average
mid: Spiral
f: Break it: keep people in, or let the insurer see
:::

::: lab ch4-model
model.title: An insurance pool of 1,000 people
model.how: Press "Next round" or "Play" to watch the insurer reprice on those who stay and anyone whose bid is below the premium leave. People are lined up from lowest to highest risk; the gold line is the most each would pay, the cyan line their average loss, the red line the premium, and the lit strip along the bottom those still in the pool. Drag risk aversion, how much risks differ, a reward for joining (or a penalty for staying out) and the number of underwriting classes.
ctl.g: Risk aversion
ctl.sig: How much risks differ
ctl.inc: Reward to join / penalty to stay out
ctl.K: Underwriting classes
cv.aria: 1,000 people lined up by risk: the price each would pay, their average loss and the premium, on a log scale
cv.x: People, lowest to highest risk
cv.y: Yuan (log scale)
cv.in: {s} still in the pool
lg.wtp: Most they'd pay
lg.cost: Average loss
lg.prem: Premium
read.round: Round
read.prem: Premium
read.range: ¥{a}–{b}
read.share: Still in the pool
read.avg: Average loss of those in
say.run: This round the premium is {p} and {s} of people still want in. Press "Next round" and the insurer reprices on those who stay.
say.spiral: The spiral has run its course: after {r} rounds the premium went from {p0} to {p} and only {s} of people remain. The average person's loss is just {mean}, but only the sickest can still face this price.
say.part: It has settled: {s} of people stay in the pool (top class premium {p}). Those screened out are mostly low risks, who would have bought; they just can't buy at a price set by their own risk.
say.full: It has settled: nearly everyone stays ({s}). Everyone's bid is above the premium set at the overall average, so the spiral never starts.
:::

By default nothing intervenes. In round 0 the premium is ¥{=ch4.p0} and only {=ch4.n0} people find it worth it; they are sicker on average, so in round 1 it rises to ¥{=ch4.p1}. After {=ch4.rounds} rounds the premium is ¥{=ch4.pf} and only {=ch4.nf} people remain. No one did anything wrong: each person simply judged whether it was worth it at their own risk.

**The first cure: keep everyone in.** Drag "Reward to join". It could be a government subsidy to those who enrol, or a penalty for staying out: for each person's decision the effect is the same, staying in is worth a bit more. At ¥1,000 only {=ch4.s1000}% stay; at ¥1,500, {=ch4.s1500}% stay and the premium is only ¥{=ch4.pr1500}. In between, things don't improve gradually but tip over at some point: once low risks stay, the average improves, the premium falls, and still more stay. The spiral runs in reverse. Mandates, subsidies and waiting periods after a lapse all push this one lever.

**The second cure: let the insurer see.** Drag "Underwriting classes" to 3: the insurer uses a medical exam to sort people into three classes and charges each its own average. {=ch4.s3}% stay in, and the healthiest class pays only ¥{=ch4.lo3}; with 5 classes, {=ch4.s5}% stay and the cheapest class pays ¥{=ch4.lo5}. This is **why premiums differ after a medical exam**: the finer the classes, the cheaper and more willing the low risks. But look at the far right: the highest-risk class spirals on its own, up to a price almost no one can pay. Underwriting fixes the market for low risks at the cost of pushing those who most need insurance out of the pool. That is why many countries' basic health insurance does not price by health and holds the pool together by having everyone join; many other markets price by risk instead. What each road does in the model you have just seen; which to take depends on whether you care more about the low risks' price or about the high risks being able to buy at all, a value judgement the model does not make for you.

One more angle: if you had to choose the rules of insurance **before** knowing whether you are healthy, say before you were born, a risk-averse person, by chapter 1's logic, would be willing to choose "everyone in at one price", because then anyone could end up in the rightmost class: it amounts to insuring against being born a high risk. That is the idea of the [[veil-of-ignorance#step0|veil of ignorance]]. Adverse selection arises precisely because people have stepped out from behind the veil and know which type they are.

The model treats underwriting as seeing perfectly; a real exam sees only part of a person's risk, so small spirals remain inside each class. There is no competition between insurers and no government backstop. [[risk-pooling#step4|Risk Pooling & Insurance, step 4]] has a simpler version with only two kinds of people. Real spirals rarely run to the end: subsidies often rise with premiums (chapter 10), and people know their own risk less precisely than in the model. {.take}

## A deductible menu: letting people reveal their risk {#ch5}

::: strings
toc: A deductible menu
:::

An insurer that can't tell who is risky lays out two contracts: full cover at a high price, and a cheap one where you bear the first part of any loss yourself. High risks know they claim often and pay more for full cover; low risks accept the deductible for the lower price. People reveal their type by what they choose. {.law}

When you buy car insurance the salesperson asks whether you want a deductible of 0 or 2,000. It is not an idle question. Suppose seven in ten people are low risks (a 5% chance of a claim a year) and three in ten are high risks (20%), losses are ¥100k, savings ¥200k and risk aversion 2, as in chapter 1. An insurer that sells only full cover at the average price heads down chapter 4's road.

::: diagram dg-menu keys=dg.menu
cap: Figure 5. A deductible menu. A is priced at the high risks' claim rate; B at the low risks' rate, but on a loss you pay the first D yourself.
aria: Diagram: contract A, full cover priced for high risks; contract B, a deductible D priced for low risks; high risks pick A and low risks pick B
a1: Plan A: full cover
a2: priced at 20% claims
a3: pay nothing on a loss
a4: high risks pick it
b1: Plan B: deductible D
b2: priced at 5% claims
b3: pay D first on a loss
b4: low risks pick it
f1: D big enough that high risks won't pose
f2: D too small: high risks buy B, B loses
f3: D too large: low risks bear too much
f4: Just big enough: the separating point
:::

In 1976 Rothschild and Stiglitz showed the key condition: B's deductible must be large enough that high risks would **rather** buy A at the high price. A high risk has a 20% chance of a loss each year, so the deductible is a bill they often pay; a low risk has 5%, so it scares them less. The same D weighs differently on the two types, and that is why screening works. Designing a menu so that each person, by picking what is best for them, tells the truth is called [[mechanism-design#s1|mechanism design]]; auction rules are its best-known example ([[auction-basics#step2|auction basics]]).

::: lab ch5-model
model.title: Design a deductible menu
model.how: Drag plan B's deductible D and see which plan each type picks and whether the insurer gains or loses. The red line is a high risk's certainty equivalent with B, the red dashed line with A; where they cross is the separating point (gold dashed). Then drag "Share of high risks" and watch the violet dashed line: the best a low risk could get if everyone bought freely at the average price.
ctl.D: Plan B's deductible
ctl.lam: Share of high risks
cv.aria: Deductible across, certainty equivalent up: a high risk with A and with B, a low risk with B, and the best at the average price
cv.x: Plan B's deductible (¥10k)
cv.y: Certainty equivalent (¥10k)
cv.ha: High risk buys A
cv.ds: Separating point
lg.h: High risk
lg.l: Low risk
lg.pool: Best a low risk gets at the average price
read.h: High risks pick
read.l: Low risks pick
read.profit: Insurer's gain per person
read.dstar: Separating point
plan.A: Plan A (full)
plan.B: Plan B (deductible)
plan.none: Neither
say.sep: A deductible of {d} is past the separating point {ds}: high risks pick A, low risks pick B, each pays for its own risk, and the insurer doesn't lose.
say.leak: A deductible of {d} is too small: high risks buy the cheap B too, and the insurer loses {pf} per person. D must go above {ds} before only low risks buy B.
say.breaks: The menu separates the types, but high risks are only {lam}, too few: a rival could sell a richer contract at the average price and take every low risk. With high risks below {lb}, the competitive market in the Rothschild–Stiglitz model has no stable outcome.
say.other: A deductible of {d}: at least one type buys neither, or both pick the same plan. The separating point is {ds}.
:::

The default deductible of ¥30k is too small: high risks buy B as well, and the insurer loses ¥{=ch5.loss3} per person. Drag right; at {=ch5.ds} (×¥10k) high risks finally prefer A (premium ¥{=ch5.aprem}), and B costs only ¥{=ch5.bprem}. This point isn't arbitrary: it is where a high risk is exactly indifferent between A and B, and the model finds it by bisection.

Notice who pays. If the insurer could see, a low risk could buy full cover at the 5% rate, a certainty equivalent of {=ch5.cefull} (×¥10k); on the menu they can only buy B with its deductible of {=ch5.ds}, worth {=ch5.cesep}. The gap is **the risk a low risk carries to prove they are low risk**: the cost of hidden information falls on the "good" side, just like the owners of good cars in chapter 3.

Now drag "Share of high risks" below {=ch5.lb}% and the readout warns that the menu breaks. With few high risks, insurance at the average price is only a little dearer than the low-risk price, and low risks would rather buy it; but once everyone buys it, it no longer pays. Rothschild and Stiglitz concluded that a competitive insurance market then **may have no stable outcome at all**. It is a famous difficulty of the model, and one that much later theory (and regulation) has had to deal with. The model has two types, one loss and no administrative costs; it does not really simulate competition between insurers, it only checks whether one contract at the average price could lure the low risks away; real car-insurance deductibles do a second job too, in chapter 7. {.take}

## Signals: paying to prove yourself {#ch6}

::: strings
toc: Signals: paying for proof
:::

The informed side can prove itself by doing something too expensive for an imitator. The act itself can be useless; as long as it costs the two types differently, it carries information. {.law}

In chapter 5 the side that can't see (the insurer) sets the test and lets the informed side choose; here it is the other way round: the informed side offers the evidence. The owner of a good car can give the buyer a three-year warranty: if the car really is good, the warranty costs almost nothing; if it's a lemon, it will ruin him. So "dares to offer a warranty" itself says the car is good.

::: diagram dg-signal keys=dg.signal
cap: Figure 6. Signalling and screening differ in who moves first: in signalling the informed side pays first; in screening the uninformed side offers a menu first.
aria: Diagram: left, signalling, the informed side acts first, for example offering a warranty; right, screening, the uninformed side offers a menu of contracts and the informed side picks
h1: Signalling (ch. 6)
h2: Screening (ch. 5)
a1: Informed side moves
a2: Uninformed believes
a3: warranty, degree
b1: Uninformed sets test
b2: Informed side picks
b3: deductible, plan
f: Both need the cost to differ between types
:::

In 1973 Michael Spence gave a starker example with job seekers. An employer can't tell whether you are able, so it looks at your diploma. Suppose schooling does nothing for productivity at all, it just comes easier to able people (each extra year costs them ¥20k in effort) and harder to the less able (¥40k). The employer announces: with at least e* years, a high wage of ¥140k; otherwise ¥80k.

::: lab ch6-model
model.title: A diploma that teaches nothing
model.how: Drag the years the employer requires, e*, and how hard schooling is for the less able. Cyan is the able, red the less able: years of schooling across, wage minus the cost of schooling up. The gold band is the requirement that separates the two.
ctl.e: Years required
ctl.cL: Yearly cost to the less able
cv.aria: Two step lines: at the required years the wage jumps to the high wage, minus the cost of schooling; the gold band is the range of requirements that separates the types
cv.x: Years of schooling
cv.y: Wage minus cost (¥10k)
cv.wl: No school: low wage
cv.band: Separating requirements
read.state: Outcome
read.high: Able, after schooling
read.low: Less able, if they copy
read.range: Separating range
read.rangev: {a}–{b} yr
state.sep: Separated
state.all: Everyone studies
state.none: Nobody studies
say.sep: With {e} years required, the able net {hi} after schooling, more than the low wage, so it pays; the less able would keep only {lo}, worse than not studying. The diploma has become a signal of ability, though it taught nothing.
say.all: Requiring {e} years is too little: the less able still keep {lo}, more than the low wage, so everyone studies and the diploma says nothing. The requirement must exceed {a} years to separate them.
say.none: Requiring {e} years is too much: the able keep only {hi}, worse than taking the low wage, so nobody studies and the employer is blind again. The requirement must stay below {b} years.
:::

At the default of 2 years the able net ¥{=ch6.hi}0k, while the less able would keep only ¥{=ch6.lo}0k by copying, so only the able study. Requirements from {=ch6.a} to {=ch6.b} years separate the two. This is a **separating equilibrium**: the signal is believable because imitation is too dear. From the employer's side it is a [[bayes-updating#step1|Bayesian update]]: before seeing the diploma, he knows only that half of applicants are able; after, he is sure. The harder a signal is to fake, the bigger the update.

Now do the sums. If the two types are half each, an employer who can't tell pays everyone the average wage of ¥{=ch6.avg}0k. The able who study 2 years net ¥{=ch6.hi}0k, less than if nobody studied and everyone got the average; at a requirement of 1.5 years they get ¥{=ch6.hi15}0k, just breaking even. In this extreme model the signal creates no wealth for anyone; it only "allocates" the high wage to those who can prove themselves, and burns the cost of schooling. Real education of course raises ability; economists argue about how much of its effect is which, and this model doesn't settle that. It shows only that **a certificate can be useful without teaching anything.**

The same logic appears elsewhere: warranties, brand advertising, no-questions-asked returns, a restaurant's open kitchen. Each is "something only the genuine article dares to do".

Markets also grow three repairs of their own that rest not on a signal in one trade but on "we'll meet again". **Reputation**: a shop that lives on repeat customers sells one lemon today and has no customers tomorrow. This turns a one-shot [[prisoners-dilemma#step3|prisoner's dilemma]] into a repeated game: the gain from cheating once is smaller than the loss on every later trade. **Ratings**: a platform pools the experience of millions of buyers into a star rating and spares each new buyer the walk around the car. **Certification**: a third party (an inspection firm, a rating agency) stakes its own name on someone else's quality. All three fail the same way: when good reviews can be bought (fake reviews), when the rated can choose their rater (going to whoever scores highest), and when the certifier is paid by the certified, the number stops saying anything about quality. How platform ratings in turn shape market structure is the subject of this site's essay on platforms and the few firms that win (in draft).

The model has two types and one threshold, and the employer's beliefs are given; Spence's model actually has many equilibria, and choosing among them needs extra assumptions. {.take}

## Insured people grow careless: moral hazard {#ch7}

::: strings
toc: Moral hazard and co-pay
:::

The insurer can't see how careful you are. Once someone else pays for every loss, care has only costs and no benefits, so people take a little less, losses rise and premiums too. Making the insured bear part of the loss strikes a balance between protection and care. {.law}

The earlier chapters' problem lies **before** the contract: what kind of person you are. This chapter's lies **after** it: what you will do. With full car cover you glance once less when parking; with free medical care you take a minor illness to a big hospital. This is **moral hazard**. The "moral" in the name is historical; it is about incentives, not character.

::: diagram dg-hazard keys=dg.hazard
cap: Figure 7. Moral hazard comes in two kinds: taking less care before a loss, and spending more after it. Deductibles and co-pays help with both.
aria: Timeline: contract, loss, claim; between contract and loss is ex-ante moral hazard, between loss and claim ex-post moral hazard
t1: Contract
t2: Loss
t3: Claim
e1: Before
e2: a little less care
e3: sharing → care
p1: After
p2: more visits, more use
p3: co-pay → restraint
f1: The insurer can't see what you did
f2: It sees only outcomes and contracts on them
f3: The share you bear yourself is the co-pay rate
:::

In the model you have a 10% chance a year of losing ¥100k. You can take care (lock the car, get check-ups, sleep more), cutting the chance to 3% at most, but care costs effort, more and more as you go. The insurer can't see your care and prices at the claim rate people actually have. You choose a **co-pay rate**: how much of a loss you bear yourself.

::: lab ch7-model
model.title: The co-pay rate: between protection and care
model.how: Drag the co-pay rate and see how careful you become, your chance of a loss, the premium, and what it all adds up to for you (the certainty equivalent; higher is better). Top: certainty equivalent, with the green dashed line the best possible if the insurer could see your care. Bottom: the chance of a loss.
ctl.s: Share of a loss you bear
cv.aria: Top: certainty equivalent against the co-pay rate, peaking at the best rate; bottom: the chance of a loss falling as the co-pay rises
cv.ce: Certainty equivalent (¥10k)
cv.p: Chance of a loss
cv.x: Co-pay rate
cv.fb: Best result if care were visible
lg.ce: Certainty equivalent
lg.p: Chance of a loss
read.e: Your care
read.p: Chance of a loss
read.prem: Premium
read.ce: Worth to you
say.zero: Fully covered: care does you no good, so you take none; the chance of a loss is {p} and the premium the highest ({pr}).
say.low: Bearing {s}: you start to take care ({e}), the chance of a loss falls to {p} and the premium to {pr}. Bearing a bit more would leave you better off still.
say.best: Bearing {s}, close to the best {bs}: you care just enough, without too much risk landing on you.
say.high: Bearing {s}: you are very careful and the chance of a loss is {p}, but cover is thin and you would swallow most of a loss yourself. The best is around {bs}.
:::

Fully covered (a 0% co-pay) you take no care: the chance of a loss is {=ch7.p0}%, the premium ¥{=ch7.prem0} and the certainty equivalent {=ch7.ce0} (×¥10k). Raise the co-pay to {=ch7.bs}% and your care rises to {=ch7.be}%, the chance of a loss falls to {=ch7.bp}%, the premium is only ¥{=ch7.bprem}, and the certainty equivalent rises to {=ch7.ceb}, the top of the curve. Beyond that, care keeps rising but you carry too much risk, and it no longer pays. **The best co-pay lies in between**, which is the second reason nearly all insurance has deductibles and co-pays (the first is in chapter 5).

Compare with "visible": if the insurer could see and require care of {=ch7.efb}%, then give you full cover, the certainty equivalent would reach {=ch7.cefb}. The difference is the cost of actions no one can see.

Moral hazard after a loss has a famous experiment. Between 1974 and 1981 the RAND Corporation randomly assigned about two thousand American households to health plans with different co-pays: compared with free care, families paying 95% of costs spent about 39% less on medical care on average (2011 dollars, as re-tabulated by Aron-Dine, Einav and Finkelstein in 2013). People respond to prices, even for medical care.

Take this chapter one step further and you reach economics' **principal–agent problem**: one party (the principal) wants another (the agent) to work on their behalf but cannot see how hard the agent works, only the result. Employer and employee, shareholders and managers, patient and doctor, depositors and their bank all fit. Contracts can be written only on visible results, so there is always a trade-off: make the agent bear more of the result and they work harder ([[scarcity-moves#c5|incentives]]), but they also pay for bad luck; make them bear less and they feel safer, but slack more. The co-pay curve above is that trade-off in insurance; commissions, bonuses and stock options are its shape at work. Deposit insurance is another textbook case: depositors stop worrying about their bank, and so stop watching it take risks ([[where-money-comes-from#ch3]], chapter 3, covers runs and deposit insurance).

The model has one loss and one period, with care continuously adjustable; some "care" is impossible (an inherited disease), and then a co-pay only means less cover, with no extra care in return. {.take}

## Why a bank would rather refuse than raise the rate {#ch8}

::: strings
toc: Credit rationing
:::

An interest rate is not only a price but also a sieve. The higher it goes, the sooner the safest borrowers find it too dear and leave, and the riskier those who remain. Beyond some point, raising the rate lowers the bank's expected return. So the bank stops at that rate and tells the rest of the queue "no". {.law}

If something is in short supply, raise the price: that is lesson one. Yet small business owners often find that the rate isn't high, the bank just won't lend, and offering more doesn't help. In 1981 Stiglitz and Weiss explained why: borrowers know better than the bank how risky their projects are, and under "if it fails, you can't pay", the riskier borrower fears a high rate less.

::: diagram dg-bank keys=dg.bank
cap: Figure 8. The highest rate each of four borrower groups will accept (drawn from the model's defaults). As the rate rises, the safest group leaves first.
aria: Bar chart: four borrower groups, from safest to riskiest, accept ever higher maximum rates
h: Highest rate each group accepts
g1: Safest
g2: Safe
g3: Risky
g4: Riskiest
x0: 0%
x1: 80%
f: The higher the rate, the riskier who stays
:::

The model has four groups of borrowers, each borrowing ¥10k. The safest group repays 97% of the time, the riskiest only 60%. A successful project pays well; a failed one leaves nothing, and the bank recovers nothing. A group borrows as long as borrowing still pays, so each group has a highest acceptable rate: {=ch8.r1}% for the safest, {=ch8.r4}% for the riskiest. The risky will pay high rates because they know they often won't pay at all.

::: lab ch8-model
model.title: The bank's expected return and the interest rate
model.how: Top: the bank's expected return on each yuan lent as the rate changes; the gold dot is the bank's best choice. Bottom: the cyan line is how many want to borrow, the violet dashed line the money the bank has to lend. Drag "Risky projects worse by" and "Bank's loanable funds", then tick "Credit scores".
ctl.gap: Risky projects worse by
ctl.F: Bank's loanable funds (share of demand)
ctl.info: Credit scores: the bank can tell the groups apart
cv.aria: Top: the bank's saw-toothed expected return against the rate; bottom: loan demand falling in steps as the rate rises, and the loanable funds
cv.ret: Bank's expected return
cv.cf: Cost of deposits
cv.x: Loan rate
cv.dem: Want to borrow
cv.F: Loanable funds
g1: Safest group
g2: Safe group
g3: Risky group
g4: Riskiest group
notserved: No loan
read.r: Bank's best rate
read.ret: Expected return there
read.dem: Wanting to borrow there
read.rat: Turned away
say.ration: The bank's best rate is {r}, for an expected return of {ret}. Any higher and the safest group leaves and the return drops. But at this rate {d} want to borrow, there isn't enough money, and {q} are refused even though they would pay more. This is credit rationing.
say.enough: The bank's best rate is {r}, for an expected return of {ret}; it has enough money for everyone who wants to borrow ({d}), and no one is refused.
say.top: When risky projects are not much worse on average than safe ones, the bank's best move in this model becomes raising the rate to {top} and lending only to the riskiest group, for an expected return of {ret}. The saw-tooth remains, but the peak has moved to the far right, so rationing need not happen.
say.info: With the groups told apart, the bank prices each by its own risk: the riskier the group, the higher its rate, each earning the bank its cost of deposits. If a group is left out, it is one that would walk away before the rate reached the bank's break-even. No one is refused because others are risky.
:::

By default (risky projects also return less on average) the bank's best rate is {=ch8.best}%, exactly the safest group's limit, for an expected return of {=ch8.ret}%. Go a little higher and that safest 40% leaves, and the return drops at once. The bank has money for only half the borrowers, so {=ch8.rat}% of those who want a loan can't get one, even though they would pay more. **The bank hasn't miscalculated; it has calculated exactly.**

Drag "Risky projects worse by" to 0, Stiglitz and Weiss's own assumption: every project has the same average return and differs only in risk. The curve is still saw-toothed, but its peak moves to the far right: a rate of {=ch8.top0}%, lending only to the riskiest group, for an expected return of {=ch8.ret0}%. In this four-group toy, whether rationing happens depends on whether risky projects are also bad ones, and on whether the bank can tell borrowers apart. The original paper uses a continuous spread of borrowers and concludes that the expected return **can** fail to rise with the rate, so rationing **may** occur, not that it must.

Tick "Credit scores": the bank can tell the four groups apart and prices them separately: {=ch8.pr1}% for the safest, then {=ch8.pr2}% and {=ch8.pr3}%, while the riskiest group would need {=ch8.pr4}% for the bank to break even but walks away above {=ch8.r4}%, so it gets no loan. That is chapter 9's subject: a credit score splits a blurred pool apart. In the model every loan is the same size, there is no collateral, and none of the other half, borrowers taking bigger risks after they get the loan (which Stiglitz and Weiss also discuss). Why an interest rate is "the price of time" is in [[where-money-comes-from#ch6]], chapter 6; how a loan's annual rate is worked out is in [[where-a-mortgage-payment-goes#ch7]], chapter 7; how the central bank's rate reaches loans is in [[why-one-rate-moves-everything]]. {.take}

## Where a credit score comes from {#ch9}

::: strings
toc: Where a credit score comes from
:::

A credit score squeezes "how you have repaid before" into one number, an estimate of your chance of defaulting in future. It lets a bank split chapter 8's blurred pool apart; the finer the split, the cheaper good borrowers become, and the worse off those with no record. {.law}

The bank doesn't know you, but it can see your past accounts: late payments, how much you owe, how long your record is. The most widely used US score, FICO, runs from 300 to 850 in its base versions (industry versions for car loans and cards run from 250 to 900), and FICO publishes its weights: payment history 35%, amounts owed 30%, length of credit history 15%, new credit 10%, credit mix 10%. The exact formula is a trade secret. China has the personal credit report of the People's Bank of China Credit Reference Center, plus licensed market credit bureaus; their scoring methods are not public either.

::: diagram dg-score keys=dg.score
cap: Figure 9. How a scorecard works: features become a default probability, the probability becomes a score, and the score is compared with a cutoff. Schematic.
aria: Flow chart: features such as past repayment go into a model that estimates a default probability, which is converted to a score and compared with the bank's cutoff to approve or decline
a1: Your past accounts
a2: late payments, debt, record length
b1: Model: estimate default chance
c1: Score: +20 points per doubling of odds
y: Above: approve
n: Below: decline
f: The cutoff is the bank's choice
:::

Below is a toy scorecard. Logistic regression turns three features into a default probability, which a common industry convention turns into a score: 600 points at good-to-bad odds of 50 : 1, plus 20 points each time the odds double. 4,000 fictional borrowers are generated by the same rule, and some of them later default (at random, with a fixed seed).

::: lab ch9-model
model.title: A toy scorecard
model.how: Drag the first three sliders to see one applicant's default probability and score (the gold triangle at the bottom); drag the bank's cutoff to see how many of the 4,000 fictional borrowers are approved and how many bad loans slip in. Cyan are those who later repaid, red those who later defaulted (drawn 5× larger, or you couldn't see them).
ctl.late: Past late payments
ctl.dti: Debt to income
ctl.years: Length of credit record
ctl.cut: Bank's cutoff score
cv.aria: Histogram of scores: borrowers who repaid and who defaulted, a cutoff line, and the applicant's position
cv.x: Credit score
cv.y: People
cv.cut: Cutoff
cv.bad5: Defaulters ×5
lg.good: Repaid
lg.bad: Defaulted later
lg.you: This applicant
read.pd: Applicant's default chance
read.score: Score
read.ap: Bank approves
read.bad: Bad loans among approved
say.yes: A score of {s} (default chance {q}) clears the cutoff: approved. At this cutoff the bank approves {ap} of applicants, with {bad} bad loans among them against {all} overall: {caught} of defaulters are kept out.
say.no: A score of {s} (default chance {q}) is below the cutoff: declined. At this cutoff the bank approves {ap} of applicants, with {bad} bad loans among them against {all} overall.
:::

The default applicant has no late payments, debt at 30% of income and a 5-year record: a default chance of {=ch9.q0}% and a score of {=ch9.s0}. The same person with a 15-year record scores {=ch9.s15}; with no record at all, only {=ch9.sthin}; with two late payments, {=ch9.slate}, a default chance of {=ch9.qlate}%. With the cutoff at 580 the bank approves {=ch9.ap}% of applicants, with {=ch9.bad}% bad loans among them against {=ch9.all}% overall, and {=ch9.caught}% of defaulters are kept out.

Two things are worth seeing clearly. First, **the score only ranks; the cutoff is the bank's choice**: drag it and approval and bad-loan rates move together, just like the positive threshold of a medical test or the alarm threshold on a radar ([[signal-detection#step3|signal detection theory]]): lower it and fewer bad borrowers slip through, but more good ones are turned away. What a score can tell you also depends on the base rate: bad loans are rare to begin with, so most of those declined would in fact have repaid ([[numbers-lie#c6|base rates]], [[bayes-diagnostics]]). Second, **having no record is information too**: new graduates and people who always paid cash score low by default, not because they don't repay but because the model can't see them. That is chapter 3's structure: the batch nobody can see is treated as average or worse. Pushes around the world to use "alternative data" (utility and rent payment records) aim to split that batch apart too.

A chapter 6 problem returns here too: once people know how the score is computed, they "farm" it, opening a card they never use to lengthen their record, or paying down debt just before the reporting date. Once a score becomes a target, it measures less well what it was meant to measure ([[numbers-lie#c9|Goodhart's law]]). That is one reason scorers keep changing their formulas and keep them secret.

This scorecard's coefficients were chosen for the model, not taken from any bureau; it also assumes the link between past features and future default never changes. Real scoring has to deal with business cycles, fraud and chapter 10's problem: the finer the split, the more likely it lands on things that should not be grounds for treating people differently. {.take}

## Where the frontier is (November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

The more data insurers and banks have, the more they can see, and the harder it is for chapters 3–4's spirals to start; but the more they see, the harder it is for chapter 4's rightmost class to buy insurance at all. Almost every argument at the frontier asks which things may be used to price differently, which may not, and how to keep everyone in the pool. {.law}

Each item below gives its date and source, sorted into three groups: established facts or law, things already being done, and claims or plans of one party.

### Established {#h.est .sub3}

- Theory: Akerlof's "The Market for 'Lemons'" (1970), Spence's signalling model (1973), Rothschild and Stiglitz's screening model (1976), Stiglitz and Weiss's credit rationing (1981). Akerlof, Spence and Stiglitz shared the 2001 Nobel prize in economics "for their analyses of markets with asymmetric information". {#e1}
- The US Genetic Information Nondiscrimination Act of 2008 (GINA) bars health insurers and employers from using genetic information in their decisions, but does not cover life, disability or long-term care insurance. Under the UK government and Association of British Insurers' Code on Genetic Testing and Insurance (from 2018), the only predictive genetic test whose result insurers may currently ask for is Huntington's disease, and only for life cover totalling over £500,000. {#e2}
- China's Personal Information Protection Law (in force 1 November 2021), article 24: automated decisions using personal information must not impose unreasonable differential treatment on individuals in trading conditions such as price, the clause often cited against "big-data price discrimination against loyal customers". The same algorithms can screen reasonably, as in chapter 5, or raise prices on those "unlikely to compare"; the latter is treated separately in this site's essay on platforms and the few firms that win. {#e3}
- The EU Artificial Intelligence Act (Regulation 2024/1689), Annex III, lists two uses as high-risk: assessing natural persons' creditworthiness or establishing their credit score, and risk assessment and pricing of natural persons in life and health insurance. The 2026 "digital omnibus" amendment moved the date these Annex III high-risk obligations apply from 2 August 2026 to 2 December 2027 (final Council approval on 29 June 2026; published in the Official Journal on 24 July 2026 as Regulation (EU) 2026/1744, in force from 27 July 2026; according to summaries by law firms including Gibson Dunn, Orrick and Lewis Silkin, the Official Journal text itself not opened). {#e4}
- The US Affordable Care Act (ACA) bars insurers from refusing cover for pre-existing conditions and lets premiums vary only by age, area, family size and tobacco use, not by health (federal rule 45 CFR 147.102), while an individual mandate penalty and income-based premium subsidies hold the pool together. The 2017 tax law cut the federal penalty to 0 from 2019; California, Massachusetts, New Jersey, Rhode Island and Washington DC have mandates of their own (KFF, updated September 2025). {#e5}

### Being done {#h.demo .sub3}

- China's urban and rural resident health insurance is voluntary and mostly funded by government subsidy: in 2025, funding of ¥1,100 per person, of which ¥700 is government subsidy and ¥400 individual contribution (National Healthcare Security Administration material, Xinhua, 17 December 2025). For the individual, that ¥700 is chapter 4's "reward to join". {#d1}
- State Council General Office document No. 38 of 2024 (26 July 2024), from 2025: people who miss the enrolment period or do not enrol continuously face a fixed 3-month waiting period after enrolling; each further year without cover adds, in principle, another month (which back-payments can shorten); after 4 years of continuous enrolment, each further continuous year, and each year with no claim, can raise the cap on major-illness cover, by at most 20% of the original cap in total. It is a textbook anti-adverse-selection design: no "buy only once sick", and a reward for healthy people who stay. {#d2}
- At the end of 2024, 1,326,620,800 people were enrolled in basic medical insurance, a coverage rate held at 95%, of whom 947,137,300 were in resident medical insurance (2024 National Healthcare Security Statistical Bulletin, July 2025). {#d3}
- The RAND Health Insurance Experiment (1974–1981): compared with free care, the 95% co-pay plan spent about 39% less on medical care on average (Aron-Dine, Einav and Finkelstein, Journal of Economic Perspectives 27(1), 2013, re-tabulation in 2011 dollars). {#d4}

### Claims and contested readings {#h.claim .sub3}

- Enrolment in resident medical insurance fell from 1,008.66 million in 2021 to 983.49 million in 2022 and 962.94 million in 2023. The National Healthcare Security Administration attributes this to removing duplicate records, less double enrolment and some people moving to employee insurance; some media reports say it includes residents choosing to drop out (Sina Finance, The Paper and others, 2023–2024). I found no verifiable split between the two explanations. {#c1}
- Did the US individual market spiral after the federal penalty was removed? From insurers' 2019 rate filings, KFF estimated that the zero penalty made 2019 premiums about 6% higher, with the effect falling mainly on buyers outside the exchanges who get no subsidy; subsidies on the exchanges track the benchmark premium and absorbed most of the rise. That is an advance estimate, not a full after-the-fact evaluation. {#c2}
- Insurers and lenders widely claim more data (driving behaviour, wearables, spending records) makes pricing "fairer", because low risks no longer pay for high risks; critics reply that it pushes chapter 4's rightmost class out of the market and may bring things correlated with race or income into prices indirectly. Both sides describe the two ends of the same model: the more is seen, the less a spiral can start and the less cross-subsidy remains. Which end matters more is a value judgement the model cannot make. {#c3}

## Closing: three questions for any market where someone can't see {#ch11}

::: strings
toc: Closing: three questions
:::

{.qs}
- **Who knows more, and what?** Does the seller know quality (used cars, a doctor's skill), or the buyer know risk (the insured, the borrower)? Is it known before the contract (adverse selection, chapters 3–5), or is behaviour after it hidden (moral hazard, chapter 7)? {#q1}
- **Priced at the average, who leaves first?** If those driven out are the "good" side (good cars, healthy people, safe borrowers), watch for a spiral (chapters 3, 4, 8). Look for forces that keep people in: mandates, subsidies, penalties for lapsing, long-term contracts. {#q2}
- **Which repair is used here, and who pays for it?** A menu (deductibles, chapter 5) makes the good side bear risk; a signal (diplomas, warranties, chapter 6) makes the good side spend; data (exams, credit scores, chapters 4 and 9) leaves those nobody can see worse off. No repair is free; there is only a choice of who pays. {#q3}

In one sentence: hidden information is not one side being bad but price having to follow the average; every repair is a way for people to say, prove or be seen to be what type they are, and a decision about who pays for that. {#sum .sum}

::: footer
**Sources.** G. A. Akerlof, The Market for "Lemons": Quality Uncertainty and the Market Mechanism, Quarterly Journal of Economics 84(3), 1970. M. Spence, Job Market Signaling, QJE 87(3), 1973. M. Rothschild, J. Stiglitz, Equilibrium in Competitive Insurance Markets, QJE 90(4), 1976. J. Stiglitz, A. Weiss, Credit Rationing in Markets with Imperfect Information, American Economic Review 71(3), 1981. K. Arrow, Uncertainty and the Welfare Economics of Medical Care, AER 53(5), 1963. M. Pauly, The Economics of Moral Hazard, AER 58(3), 1968. L. Einav, A. Finkelstein, Selection in Insurance Markets: Theory and Empirics in Pictures, Journal of Economic Perspectives 25(1), 2011. A. Aron-Dine, L. Einav, A. Finkelstein, The RAND Health Insurance Experiment, Three Decades Later, JEP 27(1), 2013.

State Council General Office, Guiding Opinions on a Long-Term Mechanism for Basic Medical Insurance Enrolment (Guobanfa [2024] No. 38). National Healthcare Security Administration, 2024 National Healthcare Security Statistical Bulletin. Xinhua report of 17 December 2025 on 2025 resident insurance funding. Personal Information Protection Law of the PRC, article 24. Regulation (EU) 2024/1689 (AI Act), Annex III; law-firm summaries of the digital omnibus amendment (Gibson Dunn, Orrick, 2026). Genetic Information Nondiscrimination Act of 2008. UK government and ABI, Code on Genetic Testing and Insurance (2018). KFF, individual mandate FAQ (updated September 2025); KFF, How Repeal of the Individual Mandate and Expansion of Loosely Regulated Plans are Affecting 2019 Premiums (2018). myFICO on what makes up a FICO score.

**Models.** Chapter 1: the certainty equivalent under constant relative risk aversion. Chapter 3: a stratified random sample of 200 cars, the offer updated round by round, checked against the continuum fixed point p* = b·lo/(2 − b). Chapter 4: 1,000 people with lognormal loss chances (fixed seed), bids from chapter 1's model, premium the average loss of those who stay plus 15%. Chapter 5: two risk types and two contracts, the separating point found by bisection, and the menu judged broken if a low risk's best cover at the average price beats it. Chapter 6: Spence's model with two types and one threshold. Chapter 7: care chosen continuously, the premium priced at the care actually taken (a fixed point), the best co-pay found by grid search. Chapter 8: a Stiglitz–Weiss model with four borrower groups, limited liability and zero recovery on failure. Chapter 9: a three-feature logistic scorecard over 4,000 fictional borrowers. Every parameter was chosen for the model, not taken from a real market; random numbers use fixed seeds. This essay was written by Claude (Anthropic's AI) and reviewed once independently on 25 November 2026 by a separate Claude session, which re-derived every model number.
:::
