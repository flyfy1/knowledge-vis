---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Sequences & Series · Stacked Bricks and Chessboard Grains
tagline: Bricks with one more per layer are arithmetic, grains that double per square are geometric; add a row backwards to build the sum formula on the spot, and see whether infinitely many terms can add up.
:::

## Each layer has d more bricks — how many does layer n have? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Arithmetic sequences
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Adding the same amount each time
:::

This step asks: when we add the same amount each time, how do we write the n-th term? A **sequence** is a list of numbers in order, with a₁ the first term. An **arithmetic sequence** has a constant difference d between neighbours (the **common difference**). The n-th term: aₙ = a₁ + (n−1)·d. Each bar below is a layer’s brick count and the orange tick marks each step of d. **What to do:** change the first term a₁ and the common difference d: with d &gt; 0 the bars climb like stairs, d = 0 makes them equal, d &lt; 0 makes them descend (negative counts are labelled but not drawn tall). The formula in the readout updates. {#s0e .explain}

::: html step0-2
s0cv: The first 10 terms: each bar is a term, neighbours differ by d
a1L: First term a₁
dL: Common difference d
:::

## Is there a shortcut for 1+2+…+n? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Add it backwards
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Add it backwards
:::

This step asks: how can the sum Sₙ of the first n terms of an arithmetic sequence be found in one go? Write the sequence forwards (cyan), then backwards (orange), line them up and add: every pair sums to a₁ + aₙ and there are n pairs, so twice Sₙ is the area of a rectangle of width a₁+aₙ and height n: **Sₙ = n(a₁ + aₙ)/2**. Legend has it that Gauss did 1+2+…+100 = 5050 this way as a child. **What to do:** change a₁, d and n: in every row the cyan plus orange width is a₁+aₙ; the readout compares half the rectangle’s area with adding the terms one by one — they agree. {#s1e .explain}

::: html step1-2
s1cv: The forward (cyan) and backward (orange) rows stacked into a rectangle: each row has width a₁ + aₙ
nL: Number of terms n
:::

::: strings
s0ro: a₁ = {a1}, d = {d}: aₙ = {form}; a₅ = {a5}, a₁₀ = {a10}.
rectTitle: rectangle: width {w} × height {n}
legFwd: the terms forwards
legRev: the backward complement
s1ro: n = {n}, a₁ = {a1}, aₙ = {an}: the rectangle has area {rect} and half of it is Sₙ = {half}; adding term by term gives {chk} (the same).
:::

## How many grains go on square 64 of the chessboard? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Geometric sequences
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Multiplying by the same factor each time
:::

This step asks: when each step multiplies by the same factor, how fast does it grow? A **geometric sequence** has a constant ratio r between neighbours (the **common ratio**). The n-th term: aₙ = a₁·rⁿ⁻¹. The legend puts 1 grain on square 1 of an 8×8 chessboard and doubles it on every square (r = 2). The top shows the 64 squares (darker = more grains on a log scale) and the bottom the log curve of grains per square. **What to do:** drag the ratio r and the square count n: with r = 2, the first 12 squares hold only 2048 grains yet square 64 holds 9.2×10¹⁸; compare the readout’s case of one more grain per square (arithmetic, only 64 on square 64). Whether growth is “multiplied” decides whether it is slow or explosive. {#s2e .explain}

::: html step2-2
s2cv: Top: the chessboard (lit up to square n); bottom: log curve of grains per square
rL: Common ratio r
sqL: Count up to square n
:::

::: strings
logAxis: grains (log scale)
squareAxis: square number 1–64
s2ro: r = {r}, square {n}: {term} grains; the first {n} squares hold {sum}; all 64 hold {s64}; for comparison, one more grain per square gives only {lin} on square 64.
:::

## Keep adding for ever: does the total become infinite? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Geometric sums and limits
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Can infinitely many terms add up?
:::

This step asks: what happens when a geometric sequence is added for ever? The sum of the first n terms is **Sₙ = a₁(1 − rⁿ)/(1 − r)** (r ≠ 1). When |r| &lt; 1, rⁿ keeps shrinking and Sₙ approaches a₁/(1 − r), called the **limit** (green dashes); when |r| ≥ 1, Sₙ approaches no number and is said to **diverge**. The bars are the partial sums Sₙ at each step (a₁ = 1). At r = 1/2 the sum 1 + 1/2 + 1/4 + … creeps up to 2. **What to do:** drag r: the closer |r| is to 1 the slower the convergence; for negative r the bars leap above and below the limit as they approach; beyond 1 they shoot up. Increase the number of terms n and watch whether the gap (last item in the readout) shrinks. {#s3e .explain}

::: html step3-2
s3cv: Partial sums Sₙ of a geometric sequence (cyan bars) and the limit (green dashes)
:::

::: strings
limLine: limit = {v}
stepAxis: number of terms n
diverges: none (diverges)
s3ro: r = {r}, n = {n}: Sₙ = {sn}; limit {lim}; it differs from the limit by {gap}.
:::

## Save a bit more each month, or a tenth more each month: which wins? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Arithmetic vs geometric
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Linear vs exponential
:::

This step asks: between arithmetic and geometric growth, which accumulates more? Two saving plans both deposit 100 in month 1: plan A (cyan) deposits d more each month than the last (arithmetic); plan B (orange) deposits r times last month’s, i.e. g% more each month (geometric). The chart shows cumulative savings. **What to do:** drag d and g: even with g only 3%, B starts behind A but eventually overtakes it (the green dashes mark the month); with g = 0, B deposits a flat 100 and never catches A (if d &gt; 0). This is a pure maths model: real incomes do not grow by a fixed percentage for ever. {#s4e .explain}

::: html step4-2
s4cv: Cumulative savings: arithmetic plan A (cyan) and geometric plan B (orange)
d4L: A: deposits d more each month (units)
g4L: B: deposits g% more each month
:::

::: strings
monthAxis: month
legArith: A: arithmetic, +{d} a month
legGeo: B: geometric, +{r}% a month
crossLab: B overtakes in month {n}
crossAt: B overtakes A in month {n}
noCross: B does not overtake A within 40 months
s4ro: d = {d}, g = {g}%: after 40 months A has saved {a40} and B {b40}; {cross}.
:::

## Arithmetic, geometric, or neither? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recognise the sequence
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Put it to use
:::

This step asks: given a list of numbers, how do you tell which kind it is? Check whether the **differences** of neighbours are constant (arithmetic) or the **ratios** are constant (geometric). For example 3, 7, 11, 15 has a constant difference 4; 2, 6, 18, 54 a constant ratio 3; 1, 4, 9, 16 has differences 3, 5, 7 and changing ratios, so it is neither (these are the squares). The first 4 terms are shown: choose a type and press Check to see the general term and the next numbers filled in; “Next list” clears your choice. {#s5e .explain}

::: html step5-2
s5cv: The first 4 terms are known, the next 2 are question marks
k_arith: Arithmetic
k_geo: Geometric
k_neither: Neither
chk5: Check
nx5: Next list
recapTitle: Recap
recap1: Arithmetic: aₙ = a₁ + (n−1)d; adding backwards gives Sₙ = n(a₁ + aₙ)/2.
recap2: Geometric: aₙ = a₁rⁿ⁻¹; Sₙ = a₁(1 − rⁿ)/(1 − r), and for |r| < 1 the infinite sum has the limit a₁/(1 − r), otherwise it diverges.
recap3: Growth by multiplying eventually beats growth by adding; to classify a list, check differences then ratios.
modelTitle: Scope and limits of this model
modelText: Scope: real-number sequences; the chessboard grains and saving plans are purely mathematical examples (no interest compounding schedule, inflation or ceilings); the limit holds for |r| < 1 and this page only shows partial sums up to 20 terms with the limit given by formula, not a rigorous proof of the limit.
link1: → Finding patterns: spotting a sequence in a picture first
link2: → Exponentials and logarithms: why multiplicative growth is so fast
link3: → Limits and ε: the rigorous version of “getting closer and closer”
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: List {n}: look at the differences and the ratios of neighbours, then choose a type.
s5roOk: Correct: it is {kind}, general term {form}, next term {next}.
s5roNo: Not quite: it is actually {kind}, general term {form}, next term {next}.
docTitle: Sequences & Series · Stacked Bricks and Chessboard Grains
:::
