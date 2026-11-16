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
pageTitle: The Poisson Process · The Pattern in Random Arrivals
tagline: Radioactive counts, people joining a queue: arrivals are random yet follow exact statistics — gaps are exponential, counts per window are Poisson.
:::

## Every moment is random, yet the long-run rate is steady {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Random arrivals
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: A steady average rate
:::

This step asks: what does “events arriving randomly at a constant average rate” look like? Let the **rate λ** be the average number of arrivals per second (λ = 2 means 2 per second on average). Each arrival is a vertical line on the timeline, and the staircase below counts the running total N(t); the violet dashed line is the expected λt. A **Poisson process** means arrivals are independent, and the chance of an arrival in any short stretch depends only on λ and the length of that stretch. **What to do:** press Replay to watch the count build up, then change λ; the staircase wobbles around the dashed line but never hugs it. This is a pseudo-random simulation, not measured data. {#s0e .explain}

::: html step0-2
s0cv: Top: arrival times (ticks); bottom: running count staircase and the expected line
replay: ▶ Replay (8 s)
newrun: New random run
rateL: Average rate λ (per second)
:::

::: strings
timeline: arrival times (0–20 s)
timeAxis: time t (s)
countAxis: running count N(t)
expLine: expected λt (λ = {l})
s0ro: λ = {l} per second; at t = {tm} s there have been {n} arrivals against an expected λt = {exp}; measured average rate N/t = {rate}.
:::

## What distribution do waiting times between arrivals follow? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The gaps
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: The gaps between arrivals
:::

This step asks: what pattern do the gaps between neighbouring arrivals follow? Measure every gap and draw a histogram (bar height is “density”: the share of gaps in a bin divided by the bin width, so the areas add up to 1). The orange line is the theoretical **exponential distribution** λ·e<sup>−λt</sup>, with mean 1/λ. **What to do:** press “Add samples” repeatedly: the cyan bars settle onto the orange line. With few samples they are ragged; the shape only emerges with many. Change λ: the whole curve stretches sideways but keeps its shape, and the shortest gaps are always the most common. {#s1e .explain}

::: html step1-2
s1cv: Gap histogram (cyan bars) and the exponential curve (orange line)
addGaps: Add samples
resetData: Clear and new random run
:::

::: strings
gapAxis: gap (s)
densAxis: density
legTheory: theory λe^(−λt)
legData: data: {n} gaps
s1ro: λ = {l}: {n} gaps so far, sample mean {m} s against the theoretical 1/λ = {th} s; the rate recovered from the data is {lh} per second.
:::

## How many arrivals fall into a fixed-length window? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Counts per window
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Count what lands in a window
:::

This step asks: cut time into equal windows and count the arrivals in each; how are the counts distributed? Each window holds m = λ·w arrivals on average, and the counts follow the **Poisson distribution** P(k) = e<sup>−m</sup>·m<sup>k</sup>/k! (orange dots); the cyan bars are the actual shares over 300 windows ([[probability-distribution#step2|variance]] measures how far counts stray from the mean). The Poisson distribution has a signature: **variance = mean**, so their ratio (the “dispersion ratio”) is about 1. **What to do:** change λ or the window length and check that the bars keep hugging the dots; as the mean grows the shape turns into a symmetric bell. {#s2e .explain}

::: html step2-2
s2cv: Share of windows with k arrivals (cyan bars) against the Poisson distribution (orange dots)
winL: Window length w (s)
:::

::: strings
kAxis: arrivals in a window k
fracAxis: share
legPmf: Poisson P(k)
legWin: measured: {n} windows
s2ro: λ = {l}, window {w} s: theoretical mean m = {m}; measured mean {mu}, variance {va}, dispersion ratio {fano} (Poisson should give about 1).
:::

## Having already waited a while, is the remaining wait shorter? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 No memory
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: No memory
:::

This step asks: if you have waited s seconds with nothing arriving, how much longer must you wait? The orange bars keep only the samples whose gap exceeds s, subtract the s seconds already waited, and show the distribution of the **remaining wait**; the cyan outline is the distribution of all gaps. **Memorylessness** means the two have the same shape and the remaining wait still averages 1/λ — how long you have waited tells you nothing about the future. **What to do:** drag s: the orange sample shrinks (the readout gives the count and the theoretical survival chance e<sup>−λs</sup>) but its shape keeps tracking the cyan line. This is special to the exponential; it is not true of waiting times in general. {#s3e .explain}

::: html step3-2
s3cv: All gaps (cyan outline) and the remaining wait after s seconds (orange bars)
waitedL: Already waited s (s)
:::

::: strings
waitAxis: time (s)
legAll: all gaps: {n}
legRem: remaining wait for gaps > {s} s: {n}
s3ro: Waited {s} s: {n} samples survive ({frac} of all; theoretical survival e^(−λs) = {surv}); the remaining wait averages {m} s against 1/λ = {th} s.
:::

## Stack two Poisson streams: is the result still Poisson? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Merge and thin
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Merge and thin
:::

This step asks: what do you get by merging two independent random arrival streams? Cyan is the stream of rate λ₁, violet the stream of rate λ₂, orange their merge; green keeps each event of the merged stream with probability p (“thinning”). The results: the merged stream is again a Poisson process with rate λ₁ + λ₂; the thinned stream is again Poisson with rate p·(λ₁ + λ₂). **What to do:** change the rates and p and compare the counts at the right of each row; in the readout, “measured” is the average rate from a separate 300-second simulation. {#s4e .explain}

::: html step4-2
s4cv: Four rows of arrival times: stream A, stream B, merged, thinned
rateA: Stream A rate λ₁
rateB: Stream B rate λ₂
keepP: Keep probability p
:::

::: strings
rowA: Stream A (λ₁ = {l})
rowB: Stream B (λ₂ = {l})
rowM: Merged
rowT: Each kept with p = {p}
s4ro: Theory: merged rate λ₁ + λ₂ = {sum}, thinned rate p·(λ₁ + λ₂) = {thin}; measured merged rate in a separate 300 s simulation {meas}; the merge shows {n} events in the 30 s drawn.
:::

## Does this data look like a Poisson process? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Is it Poisson?
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Use it to judge
:::

This step asks: given a list of arrival times, how can you tell whether it is a Poisson process? Three arrival patterns share an average rate of 2 per second: **random** (Poisson), **regular** (nearly equal gaps), and **clumped** (small bursts at a time). Split 200 s into 200 windows of 1 s, count each, and compute the **dispersion ratio** = variance ÷ mean. Poisson gives about 1; regular gives below 1 (very even counts); clumped gives above 1 (some windows empty, some crowded). **What to do:** see whether the histogram hugs the orange dots and how far the ratio is from 1, pick a kind and press Check; “Next data” clears your pick. {#s5e .explain}

::: html step5-2
s5cv: Top: arrivals in the first 30 s; bottom: share of 1 s windows by count, with a Poisson of the same mean
kind_poisson: Random (Poisson)
kind_regular: Regular (even gaps)
kind_bursty: Clumped (in bursts)
chk5: Check
nx5: Next data
recapTitle: Recap
recap1: Poisson process: independent arrivals at a constant rate λ; gaps are exponential (mean 1/λ), counts per window are Poisson (mean λw, variance also λw).
recap2: No memory: how long you have waited does not change how much longer you wait; independent Poisson streams add their rates when merged, and random thinning scales the rate.
recap3: To judge data, check whether the dispersion ratio is near 1: below 1 means too regular, above 1 means clumped.
modelTitle: Scope and limits of this model
modelText: Scope: constant rate, independent arrivals, no simultaneous arrivals. Real queues and radioactive counts often have peaks and troughs (a changing rate), dead time, or clumping, and then the dispersion ratio strays from 1. Every “data set” on this page is simulated with pseudo-random numbers, not measured; “new random run” just changes the seed.
link1: → Probability distributions: how expectation and variance quantify spread
link2: → Monte Carlo: how frequencies approach probabilities
link3: → Central limit theorem: why Poisson looks like a bell when the mean is large
:::

Page complete. {#done .readout .success i18n=text}

::: strings
first30: arrivals in the first 30 s
s5ro: Data set {idx}: window count mean {mu}, variance {va}, dispersion ratio {fano}. Pick a kind, then check.
s5roOk: Correct: this is {kind}, dispersion ratio {fano}.
s5roNo: Not quite: you picked {guess}, but it is actually {kind} (dispersion ratio {fano}).
docTitle: The Poisson Process · The Pattern in Random Arrivals
:::
