---
lang: en
---

::: strings
back: ← Knowledge Index
pageTitle: Monte Carlo
tagline: Uniform points in a square estimate the circle’s area ratio π/4. Start with estimating π, then compare repeated estimates and the effect of sample count before exploring other areas, needles and higher dimensions.
foot: visual.integ.life · Monte Carlo — one interaction at a time
play: Start dropping
:::

## One bean can’t count. Ten thousand can. {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · The hook {#s0k .step-kicker i18n=text}

Scatter points uniformly over a square with a circle inscribed in it. (Points inside the circle) ÷ (points in total) is the **area ratio** of circle to square — and that ratio is exactly π/4. So there is no measuring and no formula: just count, and π surfaces on its own: **π̂ = 4 × (inside / total)**. Watch the readout — the more points fall, the closer π̂ creeps to 3.14159… {#s0e .explain}

::: html step0-1
pause: Pause
newSeed: New seed
reset: Reset
speedLab: Drop rate
spdSlow: Slow · ≈90 pts/s
spdMid: Medium · ≈1,500 pts/s
spdFast: Fast · ≈30,000 pts/s
:::

Keep an eye on π̂: at first it leaps around wildly; past ten thousand points it barely wants to move. But the speed at which it settles is eerily regular — step 2 turns that temperament into a curve, and a predictable theoretical error scale. Every random number on this page comes from a seeded pseudorandom generator (mulberry32): the same seed replays the same point sequence exactly, and step 6 proves it live. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
resume: Keep dropping
stopAuto: Stop auto
cIn: inside
cOut: outside
dash: —
s0ro: N = {n} · inside <span>{inside}</span> · π̂ = <span>{pi}</span> · |π̂ − π| = {err} · seed {seed}
s0ro0: N = 0 · no points yet, so π̂ does not exist — it is born with the first point
s0thin: (the canvas draws at most {cap} points; beyond that it only counts. The count is always the full, true count)
:::

## Give frequency enough points and it shows probability’s face {#step1 h2=s1t}

::: strings
nav1: 1 Ratio = probability
:::

Step 1 · Ratio is probability {#s1k .step-kicker i18n=text}

Slow down and watch one point at a time. Each point lands inside or outside the circle — a random event. Drop enough of them and the **frequency** of “inside” settles onto its **probability**, and the probability is an area ratio. The key cancellation hides here: circle area πr² over its bounding square (2r)² equals π/4 — **the r cancels**. Change the radius and the ratio does not blink. Points are scattered over the circle’s bounding square; switch to r = 0.3 and circle and square shrink together. Check it yourself. {#s1e .explain}

::: html step1-1
s1rLab: Circle radius r (points scatter over the bounding square)
dropOne: Drop one
autoSlow: Auto, slowly
:::

A single point proves nothing: it is either in or out — there is no such thing as “0.7854 of a point inside”. Probability is not a property of one point; it is the face that frequency reveals once points pile up. That is the law of large numbers at work, the foundation under the rest of the probability line. {#s1hint .hint}

::: strings
s1ro: r = {r} · N = {n} · inside <span>{inside}</span> · measured rate <span>{rate}</span> · theoretical π/4 ≈ 0.7854 · π̂ = <span>{pi}</span>
s1ro0: r = {r} · no points yet — press “Drop one” and watch where the first point lands
:::

## Four times the samples: does every error halve? {#step2 h2=s2t}

::: strings
nav2: 2 Error scale
:::

Step2 · Repeated-estimate variability {#s2k .step-kicker i18n=text}

At the same point count N, a different set of points gives another π̂. Choose **20 seeds at once**, then use the paused N=100, 400 and 1600 comparisons: their endpoints differ. Four times N halves the **theoretical standard error (SE)**. Neither one actual error nor the sample standard deviation of 20 estimates must halve. The pale band uses known π and model SE as a teaching reference, not a confidence interval. {#s2e .explain}

::: html step2-1
runLong: Start the long run
s2modeLab: Mode
s2single: One seed
s2multi: 20 seeds at once
:::

Legend: cyan or multicolor lines = estimate trajectories; orange dashed line = known π; pale band = known π ± 2SE reference. N uses a logarithmic axis. {#s2legend .hint i18n=text}

::: html step2-2
s2checkpointLabel: Paused comparison: points in each estimate
s2cp100: N=100 per estimate
s2cp400: N=400 per estimate
s2cp1600: N=1600 per estimate
s2prefix: Keep the current mode and seeds, pause, and replay their first N points. The 100→400 comparison uses nested prefixes, not two fresh independent batches. Use the original New seed button to change seeds.
:::

The known π ± 2SE band compares error scales; the point estimate still uses actual hits. This is not a sample-derived interval for unknown π, nor a guarantee for 20 paths or an entire trajectory. A large-N normal approximation can discuss probability at a fixed N, but no exact 95% coverage is promised here. The fixed plot window 2.62..3.66 clips the drawing, not the readouts. {#s2hint .hint}

::: html step2-3
s2statsTitle: Which variance is which? (expand)
s2statsIntro: Write an inside hit as X=1, otherwise 0; π̂ = 4 × mean(X). This teaching example knows p=π/4 for checking theory. Seeded pseudorandom streams make the display reproducible; they do not prove independence.
s2popLabel: Population variance of one 0/1 observation: p(1−p)
s2rawLabel: Sample variance sX² inside the first current run
s2varLabel: Theoretical variance of repeated same-N π estimates: Var(π̂)
s2seLabel: Standard error of that estimator: SE(π̂)
s2statsFormula: sX² = N/(N−1)·p̂(1−p̂) for N≥2; Var(π̂) = 16p(1−p)/N; SE = √Var(π̂). N counts points in one estimate, not 20 replications. The sample SD of 20 estimates approximates the SE scale of one estimate. Do not divide it again by √20: that would target the SE of their average.
s2statsLimits: At N=0 there is no estimate or SE; sample variance needs N≥2. All hits or all misses may produce observed sample variance 0 without proving zero uncertainty in an unknown model. Here SE uses known p; inference for an unknown p needs a separately constructed interval.
s2source: Source: variance and standard error of a mean
s2ciSource: Interval inference and small-sample limits
s2routeLink: Return to variance and estimation route →
:::

::: strings
docTitle: Monte Carlo · Counting Out π with Beans · One Interaction at a Time
resumeLong: Resume the long run
runDone: Run complete
s2roS: N = {n} · π̂ = <span>{pi}</span> · Known-model 2SE = {band} · Seed {seed}
s2roSdone: Run finished: N = {n} · π̂ = <span>{pi}</span> · Known-model 2SE = {band} · Seed {seed}
s2roM: N per estimate = {n} · Sample SD of 20 π̂ values = <span>{emp}</span> (denominator 19) · Theoretical SE of one estimate = {theo} · 20 seeds starting at {seed}
s2miles: Milestone |π̂ − π|:
s2milePend: pending
cBandLab: ±2SE reference
cPiLab: π = 3.14159…
cTrajLab: π̂(N)
cAxisN: N (log axis)
:::

## No formula? Just throw beans. {#step3 h2=s3t}

::: strings
nav3: 3 Areas without formulas
:::

Step 3 · Areas without formulas {#s3k .step-kicker i18n=text}

Swap in a heart: it is defined by the implicit equation on the right, and its area has no handy formula (doing it honestly means a double integral). Bean-throwing does not care whether a formula exists: scatter uniformly over the bounding box and **area estimate = box area × hit rate**. The reference in the readout is not an analytic truth — it is a numerical integral counted cell by cell on a 1600×1600 grid, with its method stated in the open. Watching the estimate settle onto it is Monte Carlo doing honest work. <a class="fourier-link" href="../../../signal/systems/convolution/#step3">Area computed another way on the convolution page: output = overlap area →</a> {#s3e .explain}

::: html step3-1
s3formulaNote: The heart’s defining equation. The inside test is nothing more than plugging a point’s coordinates in and checking the inequality — there is no second rule.
s3shapeLab: Shape
shHeart: Heart
shStar: Star
shBlob: Blob
runStart: Start dropping
:::

Integration is, at heart, “count the cells”: a grid counts them in neat rows — finer is better, but the cell count grows quadratically; Monte Carlo swaps the cells for luck and its accuracy answers only to 1/√N. The weirder the shape, the sooner formulas surrender, while the beans keep saying “just count”. In step 5 you will see dimensions where the grid does not even get to surrender. {#s3hint .hint}

::: strings
s3defHeart: Heart: the region (x²+y²−1)³ − x²y³ ≤ 0 in local coordinates (bounding box 2.5 × 2.45).
s3defStar: Star: a regular five-pointed star polygon with circumradius 1 (vertices on the unit circle, inner radius ≈ 0.382); the test is point-in-polygon.
s3defBlob: Blob: the region inside the polar curve ρ(θ) = 0.78 + 0.16·sin 3θ + 0.09·cos 5θ; the test is ρ(point) ≤ ρ(θ).
s3ro: {def}<br>N = {n} · inside <span>{inside}</span> (rate {rate}) · area estimate = <span>{est}</span> · grid reference {ref} · deviation <span>{dev}</span> · seed {seed}
s3ro0: {def}<br>Reference {ref} is ready, counted on a 1600×1600 grid (numerical integral, not an analytic truth). Seed {seed} — press “Start dropping” and watch the estimate settle onto it.
:::

## π falls out of near-misses, too {#step4 h2=s4t}

::: strings
nav4: 4 Buffon’s needle
:::

Step 4 · Buffon’s needle {#s4k .step-kicker i18n=text}

Draw equally spaced parallel lines on the floor (spacing d) and toss a needle of length L at random: its centre is uniform, its direction θ uniform on [0, π). The probability that it crosses a line is **P = 2L / (πd)** — solve for π and you get **π̂ = 2L · N / (d · crossings)**. When Buffon posed this in 1777 there were no computers; he counted real needles thrown by hand. The formula needs L ≤ d, which is why the slider stops at 1.0. {#s4e .explain}

::: html step4-1
s4lenLab: Needle length L / line spacing d
dropNeedle: Toss one
autoDrop: Auto-toss
drop100: Toss ×100
:::

Same machine as step 0, with “area ratio” swapped for “crossing probability”: the crossings sit in the denominator, so early on π̂ thrashes wildly and only calms down after many tosses. Probability does not live in formulas; it lives in repetition. {#s4hint .hint}

::: strings
s4ro: L/d = {ld} · N = {n} · crossings <span>{cross}</span> · π̂ = <span>{pi}</span> · theoretical crossing probability 2L/(πd) = {p}
s4roNoCross: L/d = {ld} · N = {n} · crossings 0 · π̂ = — (no crossings yet) · theoretical crossing probability = {p}
cCross: crossing
cMiss: no cross
:::

## The grid dies; the beans live on {#step5 h2=s5t}

::: strings
nav5: 5 High dimensions
:::

Step 5 · High dimensions {#s5k .step-kicker i18n=text}

Move the throwing into d dimensions: inside the unit hypercube [0,1]<sup>d</sup> sits an inscribed hypersphere of radius 0.5, whose true volume ratio is π<sup>d/2</sup>·(0.5)<sup>d</sup> / Γ(d/2+1) (Γ, “gamma”, is the factorial stretched beyond whole numbers: Γ(n+1) = n! at integers, and it also takes values at half-integers, e.g. Γ(1/2) = √π — the true values in the readout are computed with it; in the formula, just treat it as an ordinary number). Watch the grid die first: even a coarse 10 points per dimension needs <strong>10<sup>d</sup></strong> points in total — raise the dimension and it is over before it starts. The beans’ **absolute** error still follows ~1/√N, indifferent to dimension; the cost moves elsewhere — in high dimensions the sphere’s share of the cube is pitifully small, so hits get rare (keep an eye on the hit count). The picture shows the first two coordinates of each point; the inside test uses all d of them. {#s5e .explain}

::: html step5-1
s5dimLab: Dimension d
:::

Real high-dimensional integrals — how light bounces in a film render, how an option is priced, how particles scatter inside a reactor — run to dozens or hundreds of dimensions. There the grid cannot even begin, which is why those industries all throw beans: not because it is clever, but because there is no alternative. {#s5hint .hint}

::: strings
s5ro: d = {d} · N = {n} · hits <span>{hits}</span> · volume-ratio estimate = <span>{est}</span> · true value {tru} · relative deviation {rel} · seed {seed}
s5grid: Grid method: 10 points per dimension → 10<sup>{d}</sup> = {grid} points; at 100 million evaluations per second that takes {t10}. Refine to 100 per dimension → 10<sup>{e100}</sup> points, taking {t100}. The beans’ N does not care about d.
s5warnLow: ⚠ Only {hits} hits so far — far too few: this estimate is still wobbling (with hits this scarce the relative error is ≈ 1/√hits). Do not treat it as a conclusion yet; keep dropping until the hits pile up.
cProj: first-two-coordinates projection (test uses all dims)
cTrue: true volume ratio by d (log scale)
cEstMk: estimate
:::

## Where randomness comes from — and a challenge {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Challenge
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Every “random” number on this page is **seeded pseudorandomness** (the mulberry32 algorithm): fix the seed and the entire point sequence is determined — the same seed replays it point for point. That is not cheating; it is exactly what a scientific experiment wants: **results you can re-check**. Verify it yourself below: record the first 10 points of a seed, then press “replay with the same seed” and watch them land again, one for one. {#s6e .explain}

::: html step6-1
s6seedLab: Seed
s6first: Drop & record the first 10
s6replay: Replay with the same seed
:::

**Challenge: land π̂ inside 3.14 ± 0.005** (the band [3.135, 3.145]) **with as few points as possible**. Drop small batches, check the readout after each, and the score locks the moment you enter the band. Fair warning: entering the band at tiny N is mostly **luck**; by the σ arithmetic, squeezing even 2σ into this band takes roughly 430,000 points. What actually makes points “worth more” is variance reduction — stratified sampling, antithetic variates — signposted here, and part of the probability line’s later story. {#s6ce .explain}

::: html step6-2
s6retry: New seed, retry
s6fin: To close: Monte Carlo is not the answer to one problem, it is a **general-purpose machine** — rewrite “a quantity I cannot compute” as “the probability of some random event”, then let repetition do the rest. Path tracing in films throws light rays; option pricing throws future price paths; particle transport throws neutrons; ensemble weather forecasting throws dozens of parallel weathers. It is slow, but it dares to compute anything. The two foundations laid on this page — the law of large numbers (step 1) and the normal face of error (the bundle in step 2) — are the door into the probability line’s next two pages: <a class="fourier-link" href="../../inference/bayes-updating/#step4">Bayes</a> and the <a class="fourier-link" href="../../statistics/central-limit-theorem/#step0">central limit theorem</a>.
s6linkIdx: ← Back to the index, for the probability line’s next stop
:::

::: strings
s6roNone: Press “Drop & record the first 10”: the first 10 points of that seed’s sequence will be listed with coordinates.
s6roFirst: The first 10 points of seed {seed} are recorded (numbers on the plot match the list). Press “Replay with the same seed” to verify.
s6roMatch: Replay done: the regenerated 10 points match the first run’s coordinates **digit for digit ✓** — same seed, same sequence, not a hair different.
s6roDiff: The replay does not match the first run — that should never happen; please report it as a bug.
s6ch: Challenge · seed {seed} · N = {n} · π̂ = <span>{pi}</span> · target band [3.135, 3.145]{state}
s6chIn: " · <span class=\"good\">In the band! Score N = {n}</span>"
s6chOut: " · not in the band yet"
s6chBest: " · best score so far (fewest points) = <b>{best}</b>"
s6chBestNone: " · no successful run yet"
durS: ≈ {v} s
durM: ≈ {v} min
durH: ≈ {v} hours
durD: ≈ {v} days
durY: ≈ {v} years
durTiny: under 1 s
durHuge: ≈ {v}×10⁴ years
:::
