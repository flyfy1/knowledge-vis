---
lang: en
---

::: strings
pageTitle: Limits and ε–δ · Name How Close, and I Can Get That Close
tagline: Turn "gets arbitrarily close" into a game with rules: the opponent gives ε (the allowed error) and you must find δ (how close x must be to a).
:::

## As x gets ever closer to a, where does f(x) go? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 What approaching means
:::

::: html step0-1
:::

This step answers: what does a **limit** actually say? A limit cares only about the trend of f(x) as x approaches a, not about the value at x = a (the function need not even be defined there, drawn as an open circle). Pick a function and shrink the closeness δ (x = a ± δ, δ = 10^(−k)): the readout lists the function values at x = a − δ and x = a + δ and the largest spread of values across the whole window. If the values on both sides home in on one number L, the limit is L; otherwise the limit does not exist. The vertical axis is fixed, so the smaller the window the closer the curve hugs a horizontal line (if there is a limit). {#s0e .explain}

::: html step0-2
s0o: Pick the four functions in turn and slide k slowly from 0.2 to 4: for the first two the values on both sides get closer to one number (the limit exists, 2 and 1); for the third they settle at −1 on one side and +1 on the other; the fourth keeps oscillating between −1 and 1 and never settles.
lK: Closeness δ = 10^(−k)
gHole: f(x) = (x²−1)/(x−1), x → 1
gSinc: f(x) = sin x / x, x → 0
gJump: f(x) = |x|/x, x → 0
gOsc: f(x) = sin(1/x), x → 0
:::

::: strings
r0: x = a − δ → {fl}; x = a + δ → {fr}; δ = {d}; largest spread of values in the window {range}; {verdict}
vLim: both sides approach {L}: the limit exists and equals {L}.
vNo: the window is already small, yet the two sides do not approach one number, or the values keep swinging widely: no limit here.
vMid: the window is still fairly large; shrink δ further and look again.
:::

## The ε–δ game: the opponent gives ε, you find δ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The ε–δ game
:::

::: html step1-1
:::

This step answers: how can "arbitrarily close" be stated rigorously? The **ε–δ definition**: lim(x→a) f(x) = L means that for every error ε &gt; 0 there is a δ &gt; 0 such that whenever 0 &lt; |x − a| &lt; δ we have |f(x) − L| &lt; ε. In the figure the orange horizontal band is L ± ε (the opponent's demand) and the vertical cyan window is a ± δ (your choice); wherever the curve leaves the band inside the window it is drawn red, meaning that δ fails. The readout checks the whole window and tells you the largest workable δ. {#s1e .explain}

::: html step1-2
s1o: Choose f(x) = 3x + 1 and set ε to 0.5: slide δ from large to small and find the threshold where the red part vanishes (it should be ε/3); then try f(x) = x² and 1/x and find their thresholds; press "find the largest δ" to check.
lEps: The error ε you are given
lDelta: The δ you choose
fLin: f(x) = 3x + 1, x → 2
fSq: f(x) = x², x → 2
fInv: f(x) = 1/x, x → 1
bBest: Find the largest δ for me
:::

::: strings
r1: Function {fn}: L = {L}, ε = {eps}, your δ = {d}: the largest deviation from L in the window is {dev}, {res}; largest workable δ ≈ {best}.
ok: below ε, so this δ works
bad: above ε, so this δ fails
:::

## How small must δ be? It depends on ε and on the position {#step2 h2=s2t pre=1}

::: strings
nav2: 2 δ vs ε and position
:::

::: html step2-1
:::

This step answers: how are δ and ε related? Take f(x) = x² at the point a: for each ε the largest workable δ is δ(ε) = √(a² + ε) − a (the right side is stricter, so it is the smaller of the two sides). The smaller ε, the smaller δ: for small ε, δ ≈ ε/(2a), where 2a is the slope of x² at a; the steeper the slope, the smaller the δ needed for the same error demand. The left plot shows δ against ε and the right plot (for fixed ε) shows δ against the position a; the dot is the current setting. {#s2e .explain}

::: html step2-2
s2o: Move a from 0.5 to 5: the same ε demands an ever smaller δ (the curve gets steeper); at a fixed a, halve ε and δ roughly halves too; compare with the ε/(2a) approximation in the readout.
lA: Position a (function f(x) = x²)
:::

::: strings
r2: a = {a}, ε = {eps}: largest workable δ = {d} (exact formula √(a²+ε) − a); approximation ε/(2a) = {ap}; slope 2a = {sl}.
:::

## No limit: no L passes the test {#step3 h2=s3t pre=1}

::: strings
nav3: 3 No limit
:::

::: html step3-1
:::

This step answers: how does ε–δ show that a limit does not exist? Take ε = 0.5, guess a limit value L (slider) and look for δ: if no δ keeps all the function values in the window within L ± 0.5, that L is rejected. The jump |x|/x is −1 on one side and +1 on the other, so any L is at least 1 away from one side and 0.5 is less than half of that, so no guess works; sin(1/x) oscillates endlessly near 0 covering −1 to 1, so it fails as well; 1/x² goes to infinity and has no finite L. The readout also sweeps L from −3 to 3 and counts how many L pass. {#s3e .explain}

::: html step3-2
s3o: Choose the jump function and drag the guessed L from −2 to 2: you always get "no δ found"; the readout's count of passing L should be 0; then try the other two functions.
lCand: Guessed limit L
gBlow: f(x) = 1/x², x → 0
:::

::: strings
r3: Function {fn}, ε = 0.5, guessed L = {L}: {res}; sweeping {n} values of L over [−3, 3] (step 0.01), {pass} of them have a workable δ.
noDelta: no δ found (however small the window, some values stray from L by more than ε)
hasDelta: largest workable δ ≈ {d}
:::

## The sequence version: ε–N {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Sequences: ε–N
:::

::: html step4-1
:::

This step answers: how is the limit of a sequence defined? **Limit of a sequence**: aₙ → L means that for every ε &gt; 0 there is an N such that for n &gt; N **all** the terms satisfy |aₙ − L| &lt; ε. The dots are the terms and the orange band is L ± ε (this page takes L = 0 for all three sequences). The readout uses the first 20000 terms to find the last one outside the band; N is that position. For 1/n all terms are inside from some point on; (−1)ⁿ/n swings either side of 0 but with shrinking size and also gets inside; (−1)ⁿ keeps flipping between ±1, so for ε &lt; 1 there are always terms outside the band and no N exists. {#s4e .explain}

::: html step4-2
s4o: Reduce ε slowly from 1 to 0.02: the N needed for 1/n and (−1)ⁿ/n grows (about 1/ε), while (−1)ⁿ has no N for ε &lt; 1.
sInv: sequence 1/n
sAlt: sequence (−1)ⁿ/n
sNoLim: sequence (−1)ⁿ
:::

::: strings
r4: Sequence {sn}, L = 0, ε = {eps}: {res}
nFound: N = {N}: from term {N1} on (n &gt; {N}) all terms are within L ± ε (checked up to n = 20000)
nNone: no N found: among the first 20000 terms there are always terms outside the band
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) a limit is about the trend of f(x) as x → a, whether or not f(a) exists; (2) ε–δ: for every ε there is a δ such that 0 &lt; |x − a| &lt; δ ⟹ |f(x) − L| &lt; ε; (3) δ shrinks as ε shrinks, and the steeper the slope the smaller δ must be; (4) no limit: for every L some ε has no δ (jump, oscillation, blow-up); (5) sequence version: beyond N all terms are within L ± ε. {#s5e .explain}

::: html step5-2
qq: You know δ = 0.03 works for ε = 0.1 (0 < |x − a| < 0.03 ⟹ |f(x) − L| < 0.1). For ε = 0.5, does the same δ = 0.03 work?
qo0: Certainly not
qo1: Certainly yes
qo2: Not necessarily, you must look again
s5m: This page checks "all points in the window" by finite sampling (2000 points per side), enough for well-behaved continuous functions but not a proof; the "no limit" conclusion in step 3 holds for ε = 0.5 and the functions shown, found by sweeping L over [−3, 3]; N for sequences is checked only up to n = 20000; the largest workable δ is found numerically by bisection and compared with the analytic formulas in steps 1 and 2; one-sided limits, infinite limits and other extensions are not covered.
lk0: Derivative: secants approaching the tangent, where the slope is itself a limit
lk1: Derivative: every point has its own derivative, an ε–δ at each x
:::

::: strings
qwhy: Relaxing the demand to ε = 0.5 is easier: the values in the window were already within the tighter 0.1, so they are within 0.5; the converse need not hold for a smaller ε such as 0.01 (step 1: shrink ε and red parts appear).
:::
