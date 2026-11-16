---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Binomial to Normal · The Bell Curve Growing on a Pegboard
tagline: A ball goes left or right at every peg; as the rows increase, the histogram of landing bins looks more and more like the bell.
docTitle: Binomial to Normal · The Bell Curve Growing on a Pegboard
:::

## How many different paths lead to a given bin? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Paths
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Counting paths
:::

<b>This step answers: how many paths end in each bin?</b> At every row the ball goes left or right. The number of paths to bin k of row n is the sum of the two neighbours above it, which is Pascal’s triangle, C(n,k). There are 2ⁿ equally likely paths in n rows, so the chance of bin k is C(n,k)/2ⁿ. {#s0e .explain}

::: html step0-2
s0cv: Pascal’s triangle with path counts, the chosen bin highlighted in the last row
lblRows: Rows n
lblBin: Bin k
:::

## If we really drop balls one by one, what shape does the pile take? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Galton board
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Galton board
:::

<b>This step answers: how close is a random pile to what the formula predicts?</b> At each peg the ball goes right with probability p. Blue bars are the share of balls in each bin; orange dots are the formula C(n,k)pᵏ(1−p)ⁿ⁻ᵏ. With more balls the bars hug the dots; changing the rows or p starts a new board and clears the balls. {#s1e .explain}

::: html step1-2
s1cv: A pegboard, a falling ball and bars of the share of balls per bin with orange formula dots
lblPpct: Right-turn probability p (%)
drop1: Drop 1 ball (watch it)
drop100: Drop 100 balls
reset: Clear and restart
:::

::: strings
rowsLbl: Row {n}: each number = paths reaching that bin
s0ro: n = {n}, bin k = {k}: paths C(n,k) = {c}, total paths 2ⁿ = {tot}, probability {p}.
legend1: blue bars: observed share · orange dots: formula
s1ro0: n = {n}, p = {p}: no balls yet. Press “Drop 1 ball” or “Drop 100 balls”.
s1ro: {N} balls dropped (n = {n}, p = {p}): observed average bin {em}, formula np = {tm}.
lblMean: μ = {m}
s2ro: n = {n}, p = {p}: μ = np = {mu}, σ² = np(1−p) = {v}, σ = {s}; about {w}% of the probability lies within μ ± σ.
legend3: blue bars: binomial · orange line: normal
okYes: meets np ≥ 10 and n(1−p) ≥ 10
okNo: does not meet np ≥ 10 and n(1−p) ≥ 10
s3ro: n = {n}, p = {p}: μ = {mu}, σ = {s}; largest bar-to-curve gap {g} (about {gp}% of the peak); {ok}.
axN: n
axGap: relative error
s4ro: n = {n}, p = {p}: relative error about {g}%; {ok}; by the rule n should be at least about {need}.
s5ro: n = {n}, k = {k}: exact P(X ≥ k) = {ex}; normal without correction {a0} (error {e0}); with correction {a1} (error {e1}).
:::

## What decides the center and the width of the bars? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Mean and spread
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Mean and spread
:::

<b>This step answers: how do n and p set the center and width of the binomial?</b> The mean is μ = np, the variance σ² = np(1−p) and the standard deviation σ = √(np(1−p)). The orange line is μ and the pale band is μ ± σ. Quadruple n and the center moves 4 times but the width only 2 times; the width is largest near p = 0.5. {#s2e .explain}

::: html step2-2
s2cv: Binomial bars with the mean line and a ±1 standard deviation band
lblN: Trials n
:::

## Lay a normal curve with the same mean and spread on top: does it fit? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Bell curve
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Overlaying the normal curve
:::

<b>This step answers: how well does a normal curve stand in for the binomial bars?</b> The orange curve is the normal density (1/(σ√2π))·exp(−(x−μ)²/(2σ²)) built from the same μ and σ. The readout gives the largest gap between bar height and curve. With large n and p near 0.5 the fit is tight; with small n or a very lopsided p you see skew and visible gaps. {#s3e .explain}

::: html step3-2
s3cv: Binomial bars overlaid with a normal density of the same mean and standard deviation
:::

## How large must n be before the normal curve is good enough? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 How large n
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Fit error versus n
:::

<b>This step answers: how does the fit error shrink with n, and how does p slow it down?</b> The curve plots “largest gap ÷ peak height” against n and falls roughly like 1/√n. The more p departs from 0.5, the higher the curve and the slower the drop. A common rule of thumb is np ≥ 10 and n(1−p) ≥ 10; the readout tells you whether you meet it. {#s4e .explain}

::: html step4-2
s4cv: Relative fit error against n with the chosen n marked
:::

## Flip a fair coin n times: can you estimate the chance of at least k heads without summing? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Tail by normal
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · tails with the normal
:::

<b>This step answers: how can the normal curve estimate the chance of “at least k”?</b> The exact value needs many terms added up; the normal approximation needs only z = (k − 0.5 − np)/σ and a table. Subtracting 0.5 is the continuity correction: bar k starts at k − 0.5. Orange bars are the part being added and the green line is the normal curve. Compare the exact value with the uncorrected and corrected approximations. {#s5e .explain}

::: html step5-2
s5cv: Fair-coin binomial with the right tail in orange and the normal curve over it
lblFlips: Coin flips n
lblK: At least k heads
recapTitle: Recap
recap1: Binomial: n independent two-way choices; bin k has probability C(n,k)pᵏ(1−p)ⁿ⁻ᵏ, mean np, variance np(1−p).
recap2: For large n the bars hug the normal curve of the same mean and spread; the more lopsided p is, the larger n must be.
recap3: A continuity correction usually makes the normal estimate of a tail more accurate.
modelTitle: Scope and limits of the model
modelText: Model: independent two-way steps with a fixed probability p (Bernoulli trials). Balls follow a fixed-seed pseudo-random sequence, so a restart repeats exactly; a real board has collisions and bias. The normal curve is an approximation, not an identity, and the relative error is largest in far tails.
link0: → Central Limit Theorem: why averages grow the same bell
link1: → Distributions & Expectation: the mean as the balance point
link2: → Probability & Frequency: repetition pulls frequency toward probability
:::

Page complete. {#done .readout .success i18n=text}
