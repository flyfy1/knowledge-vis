---
lang: en
---

::: strings
docTitle: Central Limit Theorem · Averages Always Become Bell-Shaped · Step by Step
back: ← Knowledge Index
pageTitle: Central Limit Theorem
tagline: Whatever a single random variable looks like — flat, skewed, bimodal — average enough of them and the result is always bell-shaped. Roll the dice yourself, swap parent distributions, drag the sample size, and verify three things live: the center of the average never moves, its spread shrinks as σ/√n, and the shape is independent of the parent (condition: finite variance). Two symbols first: μ is the "center" (the theoretical mean) and σ is the "width" (the standard deviation — how spread out the values are); step 1 shows where both symbols come from.
foot: visual.integ.life · Central Limit Theorem CLT —— a step-by-step interactive series
:::

## The Metamorphosis of Dice Averages {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · Hook {#s0k .step-kicker i18n=text}

A dice machine. Roll **1 die**: the histogram is flat (1–6 equally likely). Switch to the **average of 2 dice**: it starts to hump; **5 dice**, **30 dice**: a bell curve rises from the ground, its center forever pinned at 3.5. A single die has nothing bell-shaped about it, yet averaging conjures the bell — the most magical theorem in all of probability. {#s0e .explain}

::: html step0-1
dice1: 1 die
dice2: Average of 2
dice5: Average of 5
dice30: Average of 30
s0run: Roll continuously (stops at 20k groups)
:::

Watch two things: ① the shape goes from flat to bell; ② the center stays 3.5 while the width keeps shrinking. Step 2 turns this into a lab; step 3 measures how fast it shrinks. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: {k} dice per group · <span>{K}</span> group means so far · empirical mean <span>{mean}</span> (theory μ = 3.5) · empirical std <span>{std}</span> · theory σ/√k = <span>{tstd}</span> · seed {seed}
cHist: Histogram of sample means
cMuLine: μ = 3.5 (center never moves)
:::

## Parents of Every Shape {#step1 h2=s1t}

::: strings
nav1: 1 Parent Gallery
:::

Step 1 · Parent Gallery {#s1k .step-kicker i18n=text}

Put the "raw material" (parent distributions) on stage one by one: flat, skewed, bimodal, discrete, heavy-tailed. Each comes with the **source formula** of its theoretical mean μ and standard deviation σ — every theory curve later is drawn from exactly these numbers, never from empirical estimates. The weirder the raw material, the better: the theorem's power is that it barely cares about the raw material. {#s1e .explain}

::: html step1-1
pUniform: Uniform U(0, 1)
pExp: Exponential Exp(1)
pBimodal: Bimodal (two-Gaussian mixture)
pDice: Die (1–6)
pPareto: Pareto(α)
alpha15: α = 1.5 (infinite variance)
alpha35: α = 3.5 (finite variance)
s1warn15: ⚠ At α = 1.5, σ = ∞: the classical central limit theorem **does not apply**. It gets its own "failure exhibit" in step 4 — presented raw, untrimmed, unprettified.
:::

Memorize these five shapes. In step 2 you will pick one, draw 10k groups of means, and watch the bell grow out of any of them. {#s1hint .hint}

::: strings
s1ro: Theory μ = <span>{mu}</span> · theory σ = <span>{sigma}</span> · formula: {formula} · histogram from 20k true draws, seed {seed}
fUniform: μ = (a+b)/2 = 0.5, σ = (b−a)/√12 ≈ 0.2887
fExp: μ = 1/λ = 1, σ = 1/λ = 1
fBimodal: mixture μ = Σwᵢμᵢ = 3.5, variance = Σwᵢ(σᵢ²+μᵢ²) − μ² = 2.61, σ ≈ 1.6155
fDice: μ = (1+2+⋯+6)/6 = 3.5, σ² = 35/12, σ ≈ 1.7078
fPareto35: μ = α/(α−1) = 1.4, variance = α/[(α−1)²(α−2)], σ ≈ 0.6110
fPareto15: μ = α/(α−1) = 3, variance = **infinite** (for α ≤ 2 the "second moment diverges" — square the distance of each value from the center and average it: the result grows beyond any finite number, so no finite variance exists)
lgPdf: Theory pdf
lgHist: True-sample histogram
:::

## The Main Arena: Pick a Parent, Drag the Sample Size {#step2 h2=s2t}

::: strings
nav2: 2 Sampling Lab
:::

Step 2 · Sampling Lab {#s2k .step-kicker i18n=text}

Fix a parent distribution, drag the sample size n (average n draws per group), and draw **K = 10,000** group means in one click: histogram + theory normal curve **N(μ, σ/√n)** overlaid. Watch three things: the center pinned at μ, the width changing as σ/√n, the bell growing out of any parent. Note especially: **at n = 1 the histogram is just the parent itself** — the bell is manufactured by the act of averaging, not inherited from the raw material. {#s2e .explain}

::: html step2-1
nLab: Sample size per group n
runLab: Draw 10,000 group means
newSeed: New seed
reset: Reset
:::

Dragging n narrows or widens the bell on the spot while the center never moves. The empirical-std-to-theory ratio fluctuates statistically around 1.00 — that is the theorem's second sentence. {#s2hint .hint}

::: strings
dash: —
s2ro: n = {n} · <span>{K}</span> groups drawn · empirical mean <span>{mean}</span> vs theory μ = {mu} · empirical std <span>{std}</span> vs theory σ/√n = <span>{tstd}</span> · ratio <span>{ratio}</span> (theory 1.00) · seed {seed}
s2n1note: n = 1: the histogram is the parent itself — the shape as-is, nothing bell-shaped.
s2infNote: σ = ∞: there is no theory normal curve to overlay (N(μ, ∞) does not exist). The histogram is accumulated from true draws — see how wild it is; that is what step 4 is about. One more word on the empirical std in the readout: it can always be computed from samples and is always a finite number, but it **does not converge** — the more you sample, the further it wanders instead of settling on any value — which is why the theory column can only say ∞.
foldR: {c} out of window · folded into right-edge bar →
foldL: ← {c} out of window · folded into left-edge bar
lgMeanHist: Histogram of group means
lgNorm: Theory normal N(μ, σ/√n)
lgMu: μ
:::

## σ/√n Is an Iron Law {#step3 h2=s3t}

::: strings
nav3: 3 Price of Precision
:::

Step 3 · Price of Precision {#s3k .step-kicker i18n=text}

Connect the empirical standard deviations at many n on a log-log plot and watch them land on the theory line σ·n^(−1/2) with slope **−1/2**. Want to halve the error? Multiply the sample size by 4. The Monte Carlo page's "one more digit costs 100× the points" is the same iron law wearing another face — <a class="fourier-link" href="../../stochastic/monte-carlo/#step2">revisit the Monte Carlo page</a>. {#s3e .explain}

::: html step3-1
s3runAll: Run n = 1 … 100 in one go (4,000 groups each)
cardHalfT: Halve the error
cardHalfD: Sample size × 4
cardTenT: 10× the precision
cardTenD: Sample size × 100
:::

The fitted slope fluctuates statistically around −0.5 — the Monte Carlo page's 1/√N iron law, in averaging form. Precision is bought, priced by the square. {#s3hint .hint}

::: strings
s3ro: Least-squares fitted slope <span>{slope}</span> (theory −0.50) · measured std ratio between n and 4n <span>{ratio}</span> (theory 0.50) · seed {seed}
cNX: Sample size n (log axis)
cStdY: Std of group means (log axis)
lgEmp: Measured std
lgTheory: Theory σ·n^(−1/2)
:::

## The Honesty Exhibit: Slow to Converge, and Failing Entirely {#step4 h2=s4t}

::: strings
nav4: 4 Slow & Broken
:::

Step 4 · Slow & Broken {#s4k .step-kicker i18n=text}

Left: the **exponential distribution**, n = 2 / 5 / 10 / 30 — skewness being ground away, live. The more skewed the parent, the larger the n needed; "n ≥ 30 suffices" is a rule of thumb, not a law. Right: **Pareto α = 1.5** — infinite variance, so the classical central limit theorem **does not apply**: at n = 100 the mean histogram is still wild, and one extreme draw can drag the whole group's average with it. It does not head for the normal — it converges to a different stable distribution (named, not unfolded). {#s4e .explain}

::: html step4-1
s4lt: Slow: exponential — skewness ground away
n2: n = 2
n5: n = 5
n10: n = 10
n30: n = 30
s4rt: Broken: Pareto α = 1.5 — infinite variance, theorem off duty
n100: n = 100
:::

⚠ Honest declaration: the **classical central limit theorem requires finite variance of the parent.** For Pareto α ≤ 2 the second moment diverges — average the squared distance from the center and the quantity grows to infinity — and the mean has no σ/√n shrinkage law. Every "tends to normal" claim on this page assumes finite variance — that sentence is part of the theorem, not a footnote. {#s4warn .warn-box tag=div}

Left, watch "slow": a skewness-2 exponential only starts looking like a bell around n = 30. Right, watch "broken": with infinite variance the histogram does not converge — untrimmed, unprettified, as-is. {#s4hint .hint}

::: strings
s4lro: Empirical skewness <span>{sk}</span> · theory skewness 2/√n = <span>{tsk}</span> · empirical std <span>{std}</span> vs σ/√n = <span>{tstd}</span> · {K} groups, seed {seed}
s4rro: Empirical mean <span>{mean}</span> (theory μ = 3) · largest single draw in batch <span>{max}</span> · mean without that extreme draw <span>{meanWo}</span> · empirical std <span>{std}</span> (theory σ = ∞ — this number is meaningless) · {K} groups, seed {seed}
:::

## Why the Bell: Ground Out by Repeated Addition {#step5 h2=s5t}

::: strings
nav5: 5 Convolution Ladder
:::

Step 5 · Convolution Ladder {#s5k .step-kicker i18n=text}

Back to the <a class="fourier-link" href="../../../signal/systems/convolution/#step3">convolution page</a>: the distribution of a sum is the **convolution** of the distributions. Watch a uniform convolve with itself: n = 1 rectangle → n = 2 triangle → n = 3 a rounded hill → n = 5, 10 approaching the bell. Every level is a true numerical convolution (piecewise-constant densities on a dx = 0.002 grid, convolved level by level; the integral stays 1); the dashed line is the same-parameter normal N(nμ, nσ²) for comparison. The bell is not assumed — it is what the act of adding grinds out. {#s5e .explain}

::: html step5-1
n3: n = 3
:::

The deeper route goes through characteristic functions (multiply, take the log, the quadratic term dominates) — left here as a signpost; anyone who has climbed the ladder will nod when they see the formula. {#s5hint .hint}

::: strings
s5ro: n = {n}: convolved sum density peak <span>{peak}</span> · max deviation from the same-parameter normal <span>{dev}</span> · spot check at n = 2: pdf(1) = <span>{p2}</span> (analytic 1.000)
lgConv: Convolved density of the sum
lgNormSum: Normal N(nμ, nσ²)
:::

## Sample-Size Calculator: Where the Polls' ±3% Comes From {#step6 h2=s6t}

::: strings
nav6: 6 Sample-Size Calculator
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Scenario: estimating a mean or a proportion, wanting error within **±E** at **95%** confidence. The formula: **n = ⌈(zσ/E)²⌉** (z = 1.96). Computing it is only half the job — we then really run K groups and read the coverage honestly (fluctuating statistically around 95%, **not** exactly 95.00%). The classic number: polls citing n ≈ 1067 come from E = 3%, σ = 0.5: (1.96×0.5/0.03)² = 1067.11 — rounds to 1067, ceilings to 1068. Different convention, off by one. {#s6e .explain}

::: html step6-1
prePoll: Preset: poll proportion (σ = 0.5, p = 0.5)
preUniform: Preset: uniform parent
preExp: Preset: exponential parent
vBern: Verification distribution: Bernoulli proportion (p = 0.5)
vUniform: Verification distribution: scaled uniform (std exactly σ)
vExp: Verification distribution: scaled exponential (std exactly σ)
sigLab: Standard deviation σ (log scale)
eLab: Target half-width E (log scale)
calcBtn: Compute n and verify by simulation
app1t: Averaging measurement error
app1d: The ruler shakes, the instrument drifts — however noisy a single reading, average 100 readings and the error shrinks as σ/√n.
app2t: Quality-control sampling
app2d: Sample a box of parts, judge the whole batch by the sample mean — the sampling distribution is this bell, with the pass line drawn on it.
app3t: A/B experiment sizing
app3d: Want to detect a 1% lift in conversion? Estimate σ, fix E, and n = (zσ/E)² tells you how much traffic you need — an underpowered experiment's conclusions are all noise.
s6fin: **To close.** First came σ/√n, then came "margin of error" — every ± in the news is this page's formula on duty. For the other face of "error shrinks as 1/√N", visit the <a class="fourier-link" href="../../stochastic/monte-carlo/#step2">Monte Carlo page</a>; for the other face of "a sum's distribution is the convolution of distributions", visit the <a class="fourier-link" href="../../../signal/systems/convolution/#step3">convolution page</a>.
s6linkIdx: ← Back to the index
:::

::: strings
s6ro: n = ⌈(1.96×{sig}/{e})²⌉ = ⌈{raw}⌉ = <span>{n}</span> · really ran <span>{K}</span> groups: <span>{hits}</span> inside μ ± E · measured coverage <span>{cov}</span> (target 95%) · seed {seed}
s6stale: Parameters changed — the verification above no longer applies. Click "Compute n and verify by simulation" to recompute and re-run with the new settings.
lgBand: μ ± E band
lgVerHist: Histogram of verification means
:::
