---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Probability & Frequency · The More Spins, the Closer to the Probability
tagline: One spin cannot be predicted, but with more spins the frequency of red settles ever more steadily around its probability.
:::

## How likely is the spinner to stop on red? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One spin
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: ONE SPIN
:::

This step answers: how is a probability worked out? Where the pointer stops is random each spin. **Probability** is how likely an outcome is, and here it equals red’s share of the whole circle. Drag the share of red, then press “Spin once”: each result is random and cannot be predicted, only its probability can be stated. {#s0e .explain}

::: html step0-2
s0cv: The spinner and its pointer
pr0: Red’s share of the circle (%)
spin0: Spin once
:::

::: strings
s0ro: Probability of red = {p}% (it covers {a}° ÷ 360°); this spin the pointer is at {th}°, landing on {c}. {n} spins so far.
s0roIdle: Probability of red = {p}% (it covers {a}° ÷ 360°). Press “Spin once” to try.
:::

## After dozens or hundreds of spins, how does red’s frequency behave? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Many spins
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: MANY SPINS
:::

This step answers: how are frequency and probability related? **Frequency** = number of reds ÷ total spins. Each button spins 1, 10, 100 or 500 times and the curve records “red’s frequency so far”. It swings widely at first, then, as spins pile up, settles toward the dashed line (red’s probability, 30%). {#s1e .explain}

::: html step1-2
s1cv: Red’s frequency as the number of spins grows
spin1: Spin 1 time
spin10: Spin 10 times
spin100: Spin 100 times
spin500: Spin 500 times
reset1: Reset
:::

::: strings
s1ro: {n} spins, {r} red: frequency {r} ÷ {n} = {f}%; probability {p}%, {d} percentage points apart.
s1roIdle: No spins yet. Press “Spin 1 time” to begin; the probability is {p}%.
:::

## If each experiment uses more spins, do the results swing less? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Steadier
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: STEADIER
:::

This step answers: why is “more spins” more reliable? Choose n spins per experiment and press “Run 20 experiments”: each experiment gives one frequency of red, drawn as a dot, one row per n. How wide the 20 dots of one n spread shows how much the frequency swings at that n. The larger n is, the more tightly its row clusters around the probability, 30%. {#s2e .explain}

::: html step2-2
s2cv: Each dot is one experiment’s frequency of red
n10: 10 spins each
n100: 100 spins each
n1000: 1000 spins each
doExp: Run 20 experiments
reset2: Reset
:::

::: strings
s2ro: {n} spins each, {m} experiments in all: lowest {lo}%, highest {hi}%, a range of {rg} percentage points; theory says a typical swing of about ±{se}%.
s2roIdle: Choose the number of spins each, and press “Run 20 experiments”.
:::

## What do the probabilities of all possible results add up to? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Sum is one
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: SUM IS ONE
:::

This step answers: what limits do probabilities obey? A spin must stop on some colour, so the probabilities of all colours add up to 1 (100%). Drag the red and blue shares and green gets what is left: each probability is between 0 and 1; and the probability of “not red” = 1 − the probability of red. {#s3e .explain}

::: html step3-2
s3cv: A three-colour spinner
rr: Red share (%)
bb: Blue share (%)
:::

::: strings
s3ro: Red {r}%, blue {b}%, green {g}%, adding up to {s}%; the probability of “not red” = 100% − {r}% = {nr}% (blue + green = {nr2}%).
:::

## After several reds in a row, is blue more likely next? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 After a streak
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: AFTER A STREAK
:::

This step answers: does the past change the next result? Use a coin instead of the spinner (heads 50%). Choose “heads in a row” and press “Simulate”: the page makes 20 000 sequences of tosses, keeps only those that began with exactly that many heads, and counts how often the next toss is heads. If “tails is due” were true, this fraction would be well below 50%. {#s4e .explain}

::: html step4-2
s4cv: The frequency of heads right after a streak of heads
kk: Heads in a row
sim4: Simulate 20 000 sequences
reset4: Reset
:::

::: strings
s4ro: 20 000 sequences: {sn} began with {k} heads; of those, the next toss was heads in {f}% (heads overall: {all}%).
s4roIdle: Choose the streak length and press “Simulate 20 000 sequences”.
:::

## With n spins, roughly where will the frequency of red fall? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how do we predict the range of a frequency? With probability p and n spins per experiment, the frequency lands within p ± 1.96 × √(p(1 − p) ÷ n) about 95% of the time (a common approximation, good for larger n). Choose p and n and press “Run one experiment”: each dot is one experiment’s frequency and the orange band is the predicted range. Run several and see whether about 95% land inside. {#s5e .explain}

::: html step5-2
s5cv: The predicted range and the experiments’ results
pp: Probability p (%)
nn: Spins per experiment n
run1: Run one experiment
run50: Run 50 experiments
reset5: Reset
recapTitle: Recap
recap1: Probability is how likely one result is; frequency is the share you actually get after many trials.
recap2: With more trials the frequency settles ever closer to the probability, while each single result stays random.
recap3: The past does not “make up” for itself: after a streak of reds, the chance of red next is unchanged.
modelTitle: Scope and limits of this model
modelText: The random numbers come from a pseudo-random generator on your computer (fixed seed, a reproducible sequence), simulating an ideal spinner and coin, not a real experiment. The 95% range uses a normal approximation, which is poor for very few trials or for probabilities close to 0 or 1.
linkMc: → Monte Carlo: using random dots to get a definite number
linkPd: → Distributions & Expectation: drawing the probability of every outcome
linkClt: → Central Limit Theorem: the distribution of many averages
:::

Page complete. {#done .readout .success i18n=text}

::: strings
cRed: red
cBlue: blue
cGreen: green
s5ro: Predicted range [{lo}%, {hi}%]; {m} experiments run, {in} landed inside ({pct}%).
s5roIdle: Predicted range [{lo}%, {hi}%]. Press “Run one experiment”.
docTitle: Probability & Frequency · The More Spins, the Closer to the Probability
:::
