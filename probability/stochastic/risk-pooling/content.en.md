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
pageTitle: Risk Pooling & Insurance · Ten Thousand People Each Chip In
tagline: One person faces a gamble of $0 or $10,000; ten thousand together face an account that can be worked out ahead of time — the law of large numbers as a business, and where it fails.
:::

## The average loss is $200 a year, but the real outcome is $0 or $10,000 {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One person’s risk
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: The gamble one person faces
:::

This step asks: why is one person’s risk so hard to budget for? Suppose each person has a chance p each year of one $10,000 loss (serious illness, a crash), otherwise nothing. The **expected loss** is the long-run average p × $10,000. But in any one year the outcome is only $0 or $10,000 — never the average. Each bar below is one year, red when a loss happened; the cyan line is the average yearly loss so far and the green dashes the expectation. **What to do:** press Replay to watch 100 years build up; the cyan line swings wildly and is still clearly off the green even after a hundred years. Drag the probability p. This is one simulated person using pseudo-random numbers. {#s0e .explain}

::: html step0-2
s0cv: One person over 100 years: red bars are years with a loss, the cyan line is the running average yearly loss
replay: ▶ Replay 100 years
newRun: New random run
probL: Yearly loss probability per person p (%)
:::

::: strings
yearAxis: year
lossAxis: loss that year
expLine: expected = {e}/year
runAvg: average yearly loss so far
s0ro: p = {p}, loss {L}: expected {e}/year; in the first {n} years there were {hits} losses, an actual average of {avg}/year; any single year is only $0 or {worst}; the chance of at least one loss in {n} years is {nonzero}.
:::

## Put many people together: what happens to the average loss per person? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 More people, steadier
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: The power of large numbers
:::

This step asks: when N people share the risk, how steady is the average loss per person? Each person independently loses $10,000 with probability p. Divide the year’s total loss by N to get the **loss per person**; its expectation is still p × $10,000, but its spread shrinks: standard deviation = 10000·√(p(1−p)/N), inversely proportional to √N. The chart divides loss per person by the expectation and repeats 400 years as a histogram: at N = 1 nearly everything sits at 0 or beyond 4×; at N = 10000 it clusters tightly around 1×. **What to do:** raise N (seven levels, 10 to 10000) and watch the histogram narrow; a hundred times more people only cut the spread to a tenth. This is [[central-limit-theorem#step3|σ/√n]] as it appears in insurance. {#s1e .explain}

::: html step1-2
s1cv: Distribution of the loss per person over 400 years (expectation = 1)
poolL: People in the pool N
:::

::: strings
multAxis: loss per person ÷ expectation (red bar = 4× or more)
shareAxis: share of years
expMark: expectation = 1×
s1ro: N = {n}, p = {p}: expected loss per person {e}; theoretical standard deviation {sd} ({rel} times the expectation); at N = 1 it is {sd1}; you need {ratio} times more people to shrink the spread by 1/√N.
:::

## How much premium keeps the insurer from being unable to pay? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Premium and ruin
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Pricing and solvency
:::

This step asks: how large must the premium be so claims don’t exceed income? The insurer collects a premium π from each of N people, income N·π; if the number of claimants K times $10,000 exceeds that, it cannot pay (**ruin**). With p = 2%, the **loading** is the percentage charged above the expected loss p·$10,000, π = p·10000·(1 + loading). K follows a binomial distribution (the bars: blue = can pay, red = cannot). **What to do:** fix the loading at 20% and raise N from a few hundred to ten thousand: the red tail keeps shrinking and the ruin probability falls from over 30% to a few tenths of a percent (it wobbles at small N because claimants come in whole numbers); fix N = 10 and push the loading to 60% — still not safe. Ruin probabilities are computed exactly from the binomial. Moral: scale lowers risk more than a bigger markup does, and a small pool cannot be rescued by pricing. {#s2e .explain}

::: html step2-2
s2cv: Distribution of the number of claimants: red bars right of the green dashes are cases the insurer cannot pay
loadL: Loading (%)
:::

::: strings
claimsAxis: number of claimants K
probAxis: probability
premLine: premiums cover ≤ {k} claimants
ruinArea: red = cannot pay
s2ro: N = {n}, loading {load}%: premium per person {prem}; expected claimants {exp}; income covers {thr} claimants; ruin probability {ruin}; if no ruin, the year’s expected surplus is {profit}.
:::

## If one flood hits everyone, can the cost still be shared? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 One shared disaster
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Where the law of large numbers fails
:::

This step asks: when risks are not independent, does a bigger pool still make things steadier? Suppose each year there is a chance q of a shared disaster (a big earthquake); when it happens everyone’s loss probability rises from 1% to p<sub>c</sub>. Losses are no longer independent but pushed up together by one cause. The cyan line is the spread of independent risk (same mean) and keeps falling with N; the orange line is the spread with the shared disaster, which falls to a **floor** (red dashes = 10000·(p<sub>c</sub> − 1%)·√(q(1−q))) and stops. **What to do:** raise q or p<sub>c</sub> to lift the floor, then push N to 10000: the orange line is still stuck at the floor. That is why insurers buy reinsurance and exclude war and mass disasters. {#s3e .explain}

::: html step3-2
s3cv: Spread of loss per person against pool size N (log axes): independent risk (cyan) keeps falling, with a shared disaster (orange) it stops at a floor
qL: Yearly chance of a shared disaster q (%)
pcL: Individual loss chance in a disaster p_c (%)
:::

::: strings
nAxis: people N (log)
sdAxis: std. dev. of loss per person (log)
floorLine: floor {v}
legInd: independent risk
legCorr: with a shared disaster
s3ro: N = {n}, mean loss probability {mean}: independent spread {ind}; spread with the shared disaster {cor}; floor as N → ∞: {floor}.
:::

## Why do only the high-risk people stay in the insurance? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Adverse selection
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: The premium spiral
:::

This step asks: what happens if everyone pays according to the average risk? The population has two kinds: low-risk (70%, loss probability 1%) and high-risk (30%, probability 5%). The premium is the current buyers’ average expected loss plus a 10% loading. Each person’s maximum willingness to pay is (1 + risk aversion m) times their own expected loss: a low-risk person’s ceiling is (1+m)×$100. If the premium exceeds the ceiling they drop out. When low-risk people leave, the buyers’ average risk rises, the premium goes up and more leave… this is **adverse selection**. **What to do:** with m = 120%: round 0 premium is $242, the low-risk ceiling of $220 is below it so they leave, round 1 raises the premium to $550 and only the high-risk remain; set m above 150% and everyone stays. Press “Next round” to step through. {#s4e .explain}

::: html step4-2
s4cv: Premium each round (orange line) and whether each kind of person buys
nextRound: Next round
runAll: Run until stable
resetRounds: Reset
mL: Risk aversion m (willing to pay (1+m) × expected loss, %)
:::

::: strings
premiumRow: premium
buyersRow: who buys (top: low-risk, bottom: high-risk)
in: in
out: out
roundLab: round {r}
lowRisk: low-risk {p}
finAll: everyone stays
finHigh: only high-risk people remain
s4ro: m = {m}%: round {r} premium {prem}, low-risk {low}, high-risk {high}; when stable: {fin}, premium {fprem} (expected loss of a low-risk person {lowC}, high-risk {highC}).
:::

## To push the chance of being unable to pay down to 1%, how much must each person’s share of reserves be? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Reserves
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: How much to keep in reserve
:::

This step asks: beyond premiums, how large a **reserve** is needed so that the chance of being unable to pay stays below 1%? Reserve = the payout at the 99th percentile of the number of claimants − total premium income. The orange line is the **reserve per person** against N (log–log): a hundred times more people shrinks the per-person reserve to about a tenth. **What to do:** drag p and the loading: a larger p or lower loading needs more reserve; with a high enough loading the reserve drops to zero at large N, meaning the premium alone covers it. The reserve is computed exactly from the binomial and excludes shared disasters. {#s5e .explain}

::: html step5-2
s5cv: Reserve per person so that the chance of ruin ≤ 1%, against N (log–log)
recapTitle: Recap
recap1: One person’s risk is a $0-or-L gamble that is hard to budget; N independent people sharing it see the spread of the loss per person shrink as 1/√N, so a premium can be set at the expectation plus a loading.
recap2: A small pool is unsafe even with a markup, a large pool is safe; a shared disaster stops the spread at a floor, hence reinsurance and exclusions.
recap3: Pricing at the average risk invites adverse selection: low-risk people leave, the premium rises and the pool ends with only high-risk people.
modelTitle: Scope and limits of this model
modelText: Scope: homogeneous or two-type risks, a fixed $10,000 loss, one-year periods, no claims cost or investment income, no regulation or reinsurance; steps 0 and 1 are seeded Monte Carlo simulations (not real insurance data), steps 2 and 5 use the exact binomial; step 3 uses a two-state “shared disaster” model; step 4’s adverse selection is a minimal “willing to pay = (1+m) × expected loss”, not a real utility theory.
link1: → Central limit theorem: why an average’s spread is σ/√n
link2: → Probability distributions: how expectation and variance are computed
link3: → Monte Carlo: error shrinks as 1/√N with more samples
:::

Page complete. {#done .readout .success i18n=text}

::: strings
resAxis: reserve per person (log)
legRes: per-person reserve for 99% confidence
s5ro: p = {p}, loading {load}%: at N = 100 the reserve per person is {r1}; at N = 1000 {r2}; at N = 10000 {r3} (from 100 to 10000 people the reserve per person shrinks by a factor of {ratio}).
docTitle: Risk Pooling & Insurance · Ten Thousand People Each Chip In
:::
