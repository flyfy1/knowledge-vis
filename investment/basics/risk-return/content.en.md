---
lang: en
---

::: strings
back: ← Knowledge Index
category: Investment
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Educational demo: all numbers are fictional examples, not investment advice.
pageTitle: Risk & Return · Why Do Riskier Things Usually Promise More
tagline: One pays a steady 3% every year; the other jumps between −10% and +20%. Before choosing, look at their distributions.
docTitle: Risk & Return · Why Do Riskier Things Usually Promise More
:::

## A steady 3%, or a jumpy −10% to +20%? Choose first. {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Two toy choices
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Two toy choices
:::

<b>This step answers: before choosing, do you know what you are choosing?</b> Choice A: a steady +3% every year, no surprises and no shocks. Choice B: somewhere between −10% and +20% each year, uncertain, averaging about +5%. Pick one first, then look at its distribution — choosing before seeing is the rule of this step. {#s0e .explain}

::: html step0-2
s0cv: The two distributions: A is a single spike, B is a whole range
btnA: Choose A: steady 3% a year
btnB: Choose B: −10% to +20% a year
:::

::: strings
s0ro: You chose {pick}: {desc}
s0descA: 3% every year — the distribution is a single line: the outcome is fully certain.
s0descB: Each year lands between −10% and +20%: averaging about 5%, but some single year can be negative.
:::

## Two distributions with the same mean: where does the risk differ? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Variance is spread
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Variance is spread
:::

<b>This step answers: can risk be measured with one number?</b> Yes: variance measures how spread out outcomes are around the mean. Two distributions can both average 5%, one hugging 5% and the other spread from −10% to +20%; the second has far larger variance. Variance speaks of spread, not of good or bad — wider spread means possibly better and possibly worse. Drag the swing and watch the variance move. {#s1e .explain}

::: html step1-2
s1cv: Same mean of 5%; a bigger swing spreads the distribution wider
lblSpread: Swing (%)
:::

::: strings
s1ro: Mean still 5%, swing {w}%: the uniform distribution's variance is about {v} (variance = swing² ÷ 3). A bigger swing means bigger variance and a less predictable single year.
:::

## Run it one hundred times: what do the two choices look like? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One hundred toy trials
:::

::: html step2-1
s2step: "Step 2 · "
s2k: One hundred toy trials
:::

<b>This step answers: how does one lucky draw differ from the pattern over one hundred trials?</b> With a fixed seed, run 100 toy trials: A lands on 103 every time (100 principal + 3%), a single bar; B spreads from 90 to 120. Press “run again” for another seed: the shape of B's bars shifts, but the width of the spread does not — width is a property of the distribution, not of one draw. {#s2e .explain}

::: html step2-2
s2cv: Histogram of final values over 100 trials: A is one bar, B is a spread
btnAgain: Run again
:::

::: strings
s2ro: Over 100 trials: A lands on 103 every time; B lands below 100 (a loss) {neg} times and above 103 (beating A) {pos} times. B averages about {mean}, but single outcomes spread widely.
:::

## How much extra return does it take to make volatility acceptable? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 The risk premium
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The risk premium
:::

<b>This step answers: the extra return is compensation, not a guarantee.</b> Steady A pays 3%. Volatile B averages 5%; the extra 2% is the risk premium: compensation for bearing volatility. Drag B's mean return and watch the premium move — it can be 0 (then nobody would pick B) or large; but however large, it promises only an average, never any single year. {#s3e .explain}

::: html step3-2
s3cv: The gap between A's 3% and B's mean return is the risk premium
lblMeanB: B's mean return (%)
:::

::: strings
s3ro: A pays 3%, B averages {m}%: the risk premium is {p}% — compensation for bearing volatility. Remember: it compensates the average, not any single year.
lblPremium: Risk premium
:::

## If the average is 5%, why are some years still losses? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 A promise is not a delivery
:::

::: html step4-1
s4step: "Step 4 · "
s4k: A promise is not a delivery
:::

<b>This step answers: the expected value and what you actually receive are two different things.</b> Over 10 toy years B can average 5% while some of those years are negative — the expectation is a weighted average over all possible outcomes, and what you receive is the one outcome that actually happens in a given year. Press “run again”: the average stays near 5%, but red (negative) years keep showing up. {#s4e .explain}

::: html step4-2
s4cv: Ten toy years of B: red bars are losing years, the dashed line is the mean
:::

::: strings
s4ro: {neg} of the 10 years are negative, and the 10-year mean is {mean}%: what is promised is the mean; what you receive is each single year.
lblLoss: Losing year
lblGain: Gaining year
:::

## Risk, return and promise in three sentences {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Summary
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Summary
:::

<b>This step answers: when you see “high return”, which three questions come first?</b> Ask: how big is the swing (variance)? Is the extra return an average or a guarantee? Can you accept the worst single year? The riskier the thing, the higher the promised average return usually is, because nobody bears volatility for free — but what is promised is only the average. {#s5e .explain}

::: html step5-2
s5cv: A against B: certainty, swing, promised mean
recapTitle: Recap
recap1: Variance measures spread, not good or bad: with the same mean, a wider spread means a less predictable single year.
recap2: The risk premium is compensation: volatile B averages more, and the extra part pays for bearing volatility — it is not a guarantee.
recap3: Expectation ≠ delivery: years averaging 5% still include losing years; look at the distribution, not only the mean.
modelTitle: Scope and limits of the model
modelText: Model: toy distributions (uniform examples); the 100 trials use fixed seeds and are repeatable; no tax, fees or real market mechanics. This page explains mechanisms only and is not investment advice.
:::

Not investment advice: this page uses fictional examples only to explain the risk-return relation; it recommends no specific product and promises no return. {#disclaimer .disclaimer i18n=text}

::: html step5-3
licH1: Source
licH2: Note
licR1a: Definitions and explanations
licR1b: Original to this site, rewritten from concept knowledge; no textbook text copied.
licR2a: Investor.gov term alignment
licR2b: Terms checked against Investor.gov only; Chinese renderings are marked as translated from Investor.gov; no SEC endorsement is implied.
licR3a: OpenStax / Saylor / Khan Academy
licR3b: Textbook text not used; structure checked against concept lists only, zero sentences quoted.
licR4a: Wikidata
licR4b: Structured data only (items and properties); no article text quoted.
licR5a: Numbers
licR5b: All hand-set example numbers; no real quotes, companies or securities.
link0: → Distributions & Variance: how spread is measured
link1: → Risk Pooling: why averaging smooths volatility
linkSources: → Investment section sources & licences
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblSteady: Steady A
lblVolatile: Volatile B
:::
