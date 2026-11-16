---
lang: en
---

::: strings
pageTitle: Signal Detection Theory · Telling Apart vs. Willing to Say “Yes”
back: ← Knowledge index
navLabel: Signal detection steps
tagline: When you judge “is it there or not?”, your accuracy mixes two things: how well you can tell signal from noise, and how willing you are to say “yes”. Signal detection theory separates them as d' and the criterion c.
nav0: 0 Both 80%
nav1: 1 Evidence
nav2: 2 Criterion c
nav3: 3 Sensitivity d'
nav4: 4 ROC curve
nav5: 5 Best criterion
nav6: 6 Wrap-up
foot: visual.integ.life · Signal Detection Theory
:::

## Two detectors are both 80% correct — which one discriminates better? {#step0 h2=s0t}

Step 0 · A question {#s0k .step-kicker i18n=text}

This step asks: can you compare two detectors by accuracy alone? Below is a **hypothetical teaching example** (from M. Georgeson’s University of Birmingham handout): each reads 100 X-rays with a tumour and 100 without. Each answer is “yes” or “no”, so there are only four outcomes: tumour + “yes” is a **hit**, tumour + “no” a **miss**, no tumour + “yes” a **false alarm**, no tumour + “no” a **correct rejection**. Both are 80% correct overall. {#s0e .explain}

::: html step0-1
predictPrompt: Make a gut call first (revealed in step 4):
predA: The doctors discriminate better
predB: The machine discriminates better
predC: Equal — both are 80%
:::

Notice the machine almost never misses but raises many false alarms; the doctors make equal numbers of both errors. Accuracy simply adds the two kinds of error together. {#s0hint .hint i18n=text}

::: strings
docs: Doctors
machine: Machine
present: Tumour, 100 plates
absent: No tumour, 100 plates
hit: hit
miss: miss
fa: false alarm
cr: correct rejection
predSaved: Your guess is recorded: {p}. See step 4 for the answer.
:::

## Behind every judgement is an invisible “evidence strength” {#step1 h2=s1t}

Step 1 · The model {#s1k .step-kicker i18n=text}

This step asks: why is the same kind of plate sometimes judged right and sometimes wrong? Signal detection theory assumes that each look produces an **evidence strength x** (in a brain or a machine) that fluctuates randomly. Without a signal, x comes from the **noise distribution** (grey, mean 0); with a signal, from the **signal distribution** (cyan, higher mean). Both are normal curves of the same width (<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ Binomial & normal, step 3: what the normal curve looks like</a>). The observer sets one line, the **criterion**: if x is beyond it, say “yes”. {#s1e .explain}

::: html step1-1
runTrials: Run 20 more trials
resetTrials: Clear
:::

This step fixes the distributions 1.5 standard deviations apart, with the criterion exactly in the middle. **Hit rate H** = share of signal trials answered “yes”; **false-alarm rate F** = share of noise trials answered “yes”. Run a few rounds and watch the measured shares approach the model’s areas (shaded). {#s1hint .hint}

::: strings
s1readout: {n} trials (half with signal) · hits {hit} · misses {miss} · false alarms {fa} · correct rejections {cr}　|　hit rate H measured {H} · model {Hm}　false-alarm rate F measured {F} · model {Fm}
s1empty: Press the button to run trials: each dot is one trial’s evidence x — top row with signal, bottom row without. A dot right of the criterion line means the answer was “yes”.
:::

## Criterion c: change how willing you are to say yes, not how well you see {#step2 h2=s2t}

Step 2 · The first measure {#s2k .step-kicker i18n=text}

This step asks: what happens when the criterion line slides? The **criterion c** measures how far the line sits from the midpoint between the two distributions, in standard deviations: c &lt; 0 is **lax** (more “yes”), c &gt; 0 is **strict**, c = 0 is **unbiased**. Slide left and the **hit rate H** (share of signal trials answered “yes”) and the **false-alarm rate F** (share of noise trials answered “yes”) rise *together*: fewer misses cost more false alarms. The distance between the distributions does not change. {#s2e .explain}

::: html step2-1
cLabel: Criterion c (negative = lax, positive = strict)
:::

What to do: drag from c = 1 to c = −1 and watch both shaded areas grow; when you let go, the old criterion line stays faded on the chart. The recovered c uses z(·): it turns a proportion into “the position on a standard normal with that much area to its left”, in standard deviations. {#s2hint .hint i18n=text}

::: strings
s2readout: c = {c} · H = {H} · F = {F} · per 100 signal trials {miss} misses; per 100 noise trials {fa} false alarms · c recovered from H, F: −[z(H)+z(F)]/2 = {cBack}
:::

## Sensitivity d': how far apart the distributions are {#step3 h2=s3t}

Step 3 · The second measure {#s3k .step-kicker i18n=text}

This step asks: what is real “discrimination ability”? **Sensitivity d'** (“d-prime”) is the distance between the means of the signal and noise distributions, measured in their common standard deviation. At d' = 0 the curves coincide and every judgement is a guess; the larger d', the less they overlap. Experiments never show the distributions, only H (hit rate: share of signal trials answered “yes”) and F (false-alarm rate: share of noise trials answered “yes”), so d' is recovered as **d' = z(H) − z(F)**, where z(p) converts a proportion p to its position on a standard normal (in standard deviations). {#s3e .explain}

::: html step3-1
dLabel: Sensitivity d'
:::

What to do: hold c (the criterion: how many standard deviations the line sits from the midpoint) and move only d' — H rises, F falls, accuracy improves. Then hold d' and move c (step 2) — the recovered d' stays put. That invariance holds only in this page’s equal-variance normal model. {#s3hint .hint i18n=text}

::: strings
s3readout: d' = {d} · c = {c} · H = {H} · F = {F} · recovered z(H) − z(F) = {dBack} · accuracy {pc}%
:::

## The ROC curve: one d', every criterion, one arc {#step4 h2=s4t}

Step 4 · One picture {#s4k .step-kicker i18n=text}

This step asks: how can you see at a glance who discriminates better? Sweep the criterion from strict to lax; each criterion gives a pair (false-alarm rate F, hit rate H). Joined up, they form the **ROC curve** (receiver operating characteristic). Points on one curve share the same d' (sensitivity: how many standard deviations apart the two means are) and differ only in criterion c; the more a curve bows toward the top-left, the larger d'. The diagonal is d' = 0 (guessing). The doctors and the machine from step 0 are marked. {#s4e .explain}

::: html step4-1
:::

What to do: move only c and the point slides along one curve; move only d' and it jumps to another curve. These arcs assume equal-width normal distributions; if real ROC data are asymmetric, that assumption fails and d' changes with the criterion. {#s4hint .hint i18n=text}

::: strings
s4readout: Current point: F = {F}, H = {H} (d' = {d}, c = {c})　|　Doctors: d' = {dDoc}, c = {cDoc}　Machine: d' = {dMac}, c = {cMac}
reveal: Answer: the machine sits on the more bowed curve (d' ≈ 2.36 &gt; 1.68), so it discriminates better. Its accuracy is no higher because its criterion is very lax (c ≈ −0.87): it buys very few misses with many false alarms. {you}
youRight: You guessed right.
youWrong: In step 0 you guessed “{p}”.
rocF: false-alarm rate F
rocH: hit rate H
:::

## The best criterion depends on what errors cost and how common the signal is {#step5 h2=s5t}

Step 5 · Put it to work {#s5k .step-kicker i18n=text}

This step asks: where should the criterion go? Not necessarily in the middle. Let the **base rate** (share of trials that really contain a signal) be p, the cost of one **miss** m, and of one **false alarm** f. The **expected cost** per trial is p·(1−H)·m + (1−p)·F·f, where H is the hit rate (share of signal trials answered “yes”) and F the false-alarm rate (share of noise trials answered “yes”). The chart plots it against the criterion c (the line’s distance from the midpoint; negative = lax); the green dot is the minimum. The costlier a miss and the more common the signal, the laxer (further left) the best criterion. This is the same bookkeeping as Bayes’ “prior × likelihood ratio” (<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ Bayes updating, step 2: posterior = prior × likelihood ratio</a>). {#s5e .explain}

::: html step5-1
baseRate: Base rate p (share with a signal)
costRatio: Miss cost ÷ false-alarm cost
yourC: Your criterion c
:::

Expected cost uses this page’s model (d' = 1.5), in units of “one false alarm = 1”. Try raising the miss cost to 10 (say, a missed diagnosis is serious) and see where the best criterion moves; then set the base rate to 0.05. {#s5hint .hint i18n=text}

::: strings
s5readout: best c = {best} (expected cost {bestCost}) · your c = {c} (expected cost {cost}){verdict}
near: " · already close to the best"
far: " · can go lower"
offChart: " (outside the plotted range −2.5…2.5; the green dot sits at the edge)"
costAxis: expected cost / trial
cAxis: criterion c
:::

## Separate first, then compare {#step6 h2=s6t}

Wrap-up {#s6k .step-kicker i18n=text}

::: html step6-1
s6fin: Every yes/no judgement contains two things at once: **d'** (how clearly you tell them apart) and **c** (how willing you are to say yes). Accuracy alone, or hit rate alone, mixes them up. Separate them with H and F first, then choose the criterion by what the errors cost.
formula: H = P(yes | signal)　F = P(yes | noise)　d' = z(H) − z(F)　c = −[z(H) + z(F)]/2
boundary: Model limits: this page assumes the evidence on both kinds of trial is normal with equal width (the equal-variance model); trial data come from a fixed-seed random generator — simulated, not measured. When H or F is 0 or 1, z is infinite and real analyses need a correction. The doctors and machine are the handout’s hypothetical example, not real diagnostic performance.
quizPrompt: A radar operator adopts a stricter criterion and says “yes” less often. In this page’s model, what happens to their d'?
quizA: It rises: they make fewer false alarms.
quizB: It stays the same: the criterion moves H and F, not the distance between the distributions.
quizC: It falls: they also get fewer hits.
check: Check
lk1: ↗ Memory & attention, step 1: more distractors, fewer hits
lk2: ↗ Hypothesis testing, step 2: “convicting a fair coin” is a false alarm
lk3: ↗ Hypothesis testing, step 3: catching a truly biased coin is a hit
lk4: ↗ Bayes updating, step 2: prior × likelihood ratio
:::

::: strings
correct: Right: H and F fall together, so z(H) − z(F) is unchanged (in the equal-variance model).
wrong: Look at step 3 again: when only c moved, did the recovered d' change?
:::
