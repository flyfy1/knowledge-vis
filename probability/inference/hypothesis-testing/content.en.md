---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Hypothesis Testing & p-Values · A Courtroom for a Coin
tagline: Presume the coin is fair (innocent until proven guilty), then ask how rare a result this extreme would be if it were; the significance level is the budget for convicting an innocent coin.
docTitle: Hypothesis Testing & p-Values · A Courtroom for a Coin
:::

## Twenty flips give 15 heads: is the coin still plausibly fair? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 The p-value
:::

::: html step0-1
s0step: "Step 0 · "
s0k: The p-value
:::

<b>This step answers: what exactly is a p-value?</b> The null hypothesis H₀: the coin is fair, heads with probability 0.5 on each flip. The bars are the probabilities of each head count under H₀. The p-value is the total probability, assuming H₀ is true, of a result as rare as the one observed or rarer (orange bars, two-sided). The smaller p is, the harder this would be to explain if the coin were fair, and the more we doubt H₀. Note that p is not “the probability that the coin is fair”. Drag the number of flips and the number of heads. {#s0e .explain}

::: html step0-2
s0cv: Probabilities of each head count for a fair coin, orange for outcomes no more likely than the observed one and a cyan dashed line at the observation
lblFlips: Number of flips n
lblHeads: Observed heads k
:::

## If the same experiment is run many times, what do the p-values look like? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Many experiments
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Repeating the experiment
:::

<b>This step answers: the p-value is itself random.</b> Set the coin’s true bias q and the number of flips per experiment and press “Run 100 experiments”: each experiment gives one p-value and they pile up in a histogram. With q = 0.5 (the null is true) the p-values spread roughly evenly and about 5% fall below 0.05: false alarms (the exact binomial test is discrete, so it is slightly conservative); with q away from 0.5 the p-values crowd near 0, since small p’s are common only when there is a real effect. {#s1e .explain}

::: html step1-2
s1cv: A histogram of p-values from repeated experiments with a dashed line at the uniform expectation
lblQ: True head probability q (%)
run10: Run 10 experiments
run100: Run 100 experiments
run1000: Run 1000 experiments
reset: Reset
:::

::: strings
axP: p-value
axCount: experiments
lblUniform: uniform expectation
kNull: null is true: about 5% of experiments are false alarms
kAlt: a real bias exists: small p’s are common
s1ro0: q = {q}, {n} flips each: press a Run button to start.
s1ro: {runs} experiments ({n} flips each, q = {q}): {sig} had p ≤ 0.05 ({pc}%); {kind}.
lblRegion: orange: rejection region
none: (none)
regTxt: heads ≤ {lo} or ≥ {hi}
s2ro: α = {a}%, n = {n}: the rejection region is {reg}; a fair coin is actually convicted with probability {act}% (never above α).
lblNullBar: blue: fair coin
lblAltBar: green/red: biased coin (green inside the region)
s3ro: q = {q}, n = {n}, α = {a}%: miss rate β = {beta}%, power 1 − β = {pw}%; the false-conviction rate for a fair coin {act}%.
axN: number of flips n
axPower: power
s4ro: q = {q}, α = {a}%: {n} flips give {pw}% power; the first n reaching 80% power is {need}.
axTests: number of coins tested m
axFam: P(at least one false alarm)
lblNoCorr: no correction
lblWithCorr: with Bonferroni correction
:::

## “Convict when p ≤ 0.05”: how often does that wrongly convict a fair coin? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Significance level
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The significance level α
:::

<b>This step answers: what does α control?</b> Fix α in advance and reject H₀ when p ≤ α. Then a fair coin is wrongly convicted (a type I error) with probability at most α: the orange bars form the “rejection region” and their probabilities add up to the actual type I error rate. Because head counts are whole numbers, the actual value is often a little below α. α is the budget of wrongful convictions you accept; shrinking it narrows the rejection region. Drag α and the number of flips. {#s2e .explain}

::: html step2-2
s2cv: The distribution for a fair coin with the rejection region as orange bars
lblAlpha: Significance level α (%)
:::

## If the coin really is biased, will the test catch it? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Power
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Type II error and power
:::

<b>This step answers: when something really is wrong, how likely is the test to notice?</b> Blue bars show the fair coin; the bars on the right belong to a real coin with bias q. The part of them inside the rejection region (green) is the probability of correctly rejecting H₀, the power = 1 − β; the part outside (red) is a miss, the type II error β. The further q is from 0.5 and the more flips, the higher the power; tightening α lowers it. Drag q, the number of flips and α. {#s3e .explain}

::: html step3-2
s3cv: The distribution for a fair coin (blue) and a biased one (green/red) with green inside the rejection region
:::

## For a slightly biased coin, how many flips give an 80% chance to detect it? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Sample size
:::

::: html step4-1
s4step: "Step 4 · "
s4k: How many flips
:::

<b>This step answers: how is the sample size chosen?</b> The curve is the power against the number of flips and the dashed line is the common 80% target. The smaller the bias, the faster the required number grows: q = 0.55 needs nearly 800 flips (this page computes up to 400 and shows “> 400”), q = 0.6 about 200, q = 0.7 only dozens. The curve has small teeth because head counts are whole numbers and the rejection region changes in steps. The readout gives the first number of flips that reaches 80% power. Drag q, α and the number of flips. {#s4e .explain}

::: html step4-2
s4cv: The power curve rising with the number of flips and the 80% target line
:::

## Test many fair coins at once: will some always look “significant”? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Many tests
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · running many tests
:::

<b>This step answers: why does “finding one p &lt; 0.05” not mean a discovery?</b> Each fair coin tested alone has a false-alarm rate of about α_actual (about 4.1% with 20 flips). Test m coins at once and the chance of at least one false alarm is 1 − (1 − α_actual)ᵐ: about 57% for 20 coins and nearly certain for 100. Press “Test m coins”: the red dots are the “significant” coins, all of them fair. Turn on “Correction” to tighten each test to 0.05/m (Bonferroni): false alarms almost vanish, at the cost of power. {#s5e .explain}

::: html step5-2
s5cv: Top: the probability of at least one false alarm rising with the number of tests; bottom: one dot per coin with the “significant” ones in red
lblM: Number of coins tested m
runTests: Test m coins
bonfOff: Correction: off (α = 0.05)
recapTitle: Recap
recap1: The p-value is the probability, if the null is true, of a result at least as extreme as the one observed; it is not “the probability the hypothesis is true”.
recap2: α is the budget for type I errors (convicting the innocent); β is the type II error (missing a real effect) and the power 1 − β grows with effect size and sample size.
recap3: Run many tests and some will always be “significant”; correct for it, and tell “significant” apart from “important” or “true”.
modelTitle: Scope and limits of the model
modelText: Model: an exact binomial test, H₀: q = 0.5, with the two-sided p-value adding the probabilities of outcomes no more likely than the observed one; coins are independent. Being discrete, the actual false-alarm rate is often below the nominal α. Real studies bring effect sizes, priors, design and repeated testing; and a p-value is no substitute for the Bayesian “probability the hypothesis is true given the data”.
link0: → Statistical Inference: sampling distributions, intervals and tests
link1: → Bayes: the probability a hypothesis is true given the data
link2: → Binomial to Normal: the counting distribution of coin flips
:::

Page complete. {#done .readout .success i18n=text}

::: strings
axHeads: number of heads
lblObserved: observed {k}
vReject: p ≤ 0.05: reject “fair”
vKeep: p > 0.05: not enough evidence against “fair”
s0ro: n = {n}, k = {k}: two-sided p = {p} ({verdict}). p is not “the probability the coin is fair”.
bonfOn: Correction: on (α = 0.05/m)
s5ro: m = {m} fair coins with 20 flips each: single-coin false-alarm rate {a0}%; probability of at least one false alarm {fam}%. Press “Test m coins”.
s5roRun: This run: {hits} of {m} fair coins were declared “significant” (threshold {a}); without correction the theoretical probability of at least one false alarm is {fam}%.
:::
