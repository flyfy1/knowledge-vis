---
lang: en
---

::: strings
docTitle: The Derivative · Squeezing an Interval into a Point — One Interaction per Step
back: ← Knowledge index
pageTitle: The Derivative · Squeezing an Interval into a Point
tagline: Everyone can compute an average velocity — but how fast is it at this very instant? Shrink the interval toward a single point: the two ends of a secant line close in, its slope is forced toward the tangent slope — and the number it is forced to is the derivative.
foot: visual.integ.life · The Derivative —— one interaction per step
cT: Time t (s)
cS: Displacement s (m)
cSec: secant
cTan: tangent
cDerivY: Derivative f′(x)
cCollT: Collected derivative points (x axis, measured f′ vertical)
:::

## Average velocity is not enough: it answers for an interval, not for an instant {#step0 h2=s0t}

::: strings
nav0: 0 Average velocity
:::

Step 0 · Average velocity is not enough {#s0k .step-kicker i18n=text}

A car moves along a line with displacement s = t² (after t seconds it has gone t² metres). Average velocity is easy: displacement over a stretch divided by the time that stretch took. But the coach asks something else — “<b>at the instant t = 1 s</b>, exactly how fast is it?” Drag the time probe to see where it is at each moment, then try the three intervals: the right end pulls in from 3 s to 1.5 s — watch what the average velocity does. {#s0e .explain}

::: html step0-1
s0play: Play ▶
s0tLab: Time probe t (seconds)
s0intLab: Pick an interval and compute its average velocity:
:::

Two terms to fix in place: displacement over a stretch of time is called the <b>average rate of change</b> over that stretch (here: the average velocity); the rate “at one instant” is the <b>instantaneous rate of change</b>. The average depends on the interval and cannot answer for an instant; to ask about an instant, the interval must shrink to a point — the next step does exactly that, in geometric clothes. {#s0conc .readout}

The Play button walks the probe from t = 0 to t = 3 along the curve: the later it gets, the farther it travels in the same 0.1 s — the speed itself is changing, which is exactly why an “average” cannot answer for “this instant”. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0pause: Pause ❚❚
s0replay: Replay ⟳
s0prog: Playing: t = {t} s (small step {n} / 30)
s0progIdle: Not started: t = {t} s (small step {n} / 30)
s0progDone: Finished: t = {t} s (small step {n} / 30)
s0probe: Time probe: at t = <span>{t}</span> s the displacement is s = t² = <b>{s} m</b>. That is “where it is at each moment” — not yet “how fast at this moment”.
s0roA: On <span>[1, 3]</span>: s(1) = {sa} m, s(3) = {sb} m, Δs = {ds} m, Δt = {dt} s, average velocity = Δs ÷ Δt = <b>{v} m/s</b>. That is an average over a full two seconds — it answers “how fast on average over this stretch”, not the instant t = 1. Narrow the interval and try again.
s0roB: On <span>[1, 2]</span>: s(1) = {sa} m, s(2) = {sb} m, Δs = {ds} m, Δt = {dt} s, average velocity = <b>{v} m/s</b>. Narrow it just by half and the reading drops from 4 to 3 — it changes with the interval you choose, so none of these can be the answer for “this instant”. Narrow it once more.
s0roC: On <span>[1, 1.5]</span>: s(1) = {sa} m, s(1.5) = {sb} m, Δs = {ds} m, Δt = {dt} s, average velocity = <b>{v} m/s</b>. The narrower the interval, the closer this number settles toward one fixed value — and that value is the speed at the instant t = 1. The next step goes and catches it.
:::

## The secant approaches the tangent: two points close in, the slope is forced to one number {#step1 h2=s1t}

::: strings
nav1: 1 Secant → tangent
:::

Step 1 · The secant approaches the tangent {#s1k .step-kicker i18n=text}

Same idea, geometric clothes: the curve y = x², a fixed point P = (1, 1), and a second point Q sliding on the curve. The line PQ is called a <b>secant</b> — a line through two points of the curve; its slope Δy ÷ Δx is exactly the average rate of change over that small stretch. Drag Q (or use the Δx presets and the slider) to bring Q toward P, and watch the secant turn and the slope reading settle. {#s1e .explain}

::: html step1-1
s1preLab: Pick a Δx:
s1dxLab: Δx (difference of the x-coordinates of Q and P; may be negative)
:::

The negative-Δx side matters just as much: wherever the two sides cannot be forced to the same number, there is no derivative — for instance at a sharp corner of the curve. The wrap-up returns to this. {#s1hint .hint}

::: strings
s1ro: Q = (<span>{qx}</span>, <span>{qy}</span>): Δx = {dx}, Δy = {dy}, secant slope = Δy ÷ Δx = <b>{slope}</b>. For y = x² this slope works out to exactly 2 + Δx — whatever Δx remains is exactly how far it still is from 2.
s1ro2: Δx is now small enough that secant and tangent are indistinguishable to the eye. The key is the two sides: with Δx shrinking from the positive side, the slope comes down toward 2 from above; from the negative side it climbs toward 2 from below — <b>both sides are forced to the same number, 2</b>. That forced number is the <b>derivative</b> of f at x = 1, written f′(1) = 2; the line the secant settles onto is the <b>tangent</b> to the curve at P. “Limit” here means precisely this: the number the slope is forced to as the two points close in without bound.
s1roIdle: Keep shrinking Δx (try 0.1 and 0.01), then try the negative side too, until the secant turns into the position where it just touches the curve at P — the limiting line will appear.
:::

## Every point has its own derivative: collecting slopes into a new function {#step2 h2=s2t}

::: strings
nav2: 2 A derivative at every point
:::

Step 2 · A derivative at every point {#s2k .step-kicker i18n=text}

Move P and the derivative at that point changes: near x = 0 the curve is almost flat, and the tangent steepens as you move out to either side. Drag P along y = x² (x from −2 to 2); at each stop, measure the same way as before — the secant slope with Δ = 0.001 as an approximation — and check it against the pattern value 2x. The second plot below records the derivative of every point you visit as a scatter — watch what shape they form. {#s2e .explain}

Put P at x=0 first, then move to x=1 or x=-1: the measured slope changes with position but keeps approaching the rule value 2x. {#s2bridge .hint i18n=text}

::: html step2-1
s2xLab: x-coordinate of P (drag P or the slider)
s2reset: Clear collected points
:::

To wrap up: the new function that collects the derivative at every point is called the <b>derived function</b> — the derivative function — written f′(x). For f(x) = x², f′(x) = 2x. One seed for later: x³ → 3x² (not proved here; in check question 2 you will verify it by hand at x = 1); the other differentiation rules are all this same squeezing procedure, wrapped up. {#s2conc .readout}

Mind the measurement wording: a reading always carries “≈” and the size of Δ; only when Δ can keep shrinking and the reading keeps settling toward one number do we judge that number to be the derivative. {#s2hint .hint}

::: strings
s2ro: At x = <span>{x}</span>: measured (secant slope with Δ = 0.001) ≈ <b>{meas}</b>; pattern value 2x = <span>{exact}</span>. The measured value exceeds 2x by only 0.001 — precisely the tail left by Δ not being fully shrunk; a smaller Δ would shrink it further. So the derivative at this point is judged to be <b>{exact}</b>: the measurement approaches it, it does not impersonate the exact value.
s2count: {n} derivative points collected
s2ro2a: Each dot below = “the derivative at some x”. Visit more positions (do not forget the negative half: derivatives there are negative; at x = 0 the derivative is 0) and watch what shape the dots line up into.
s2ro2b: <span>{n}</span> points collected: they line up on a straight line — exactly y = 2x (the dashed line is the check). Plotting the derivative at every x produces a graph that is itself a straight line: the slopes form a new function.
:::

## What the derivative says: three faces of one number {#step3 h2=s3t}

::: strings
nav3: 3 What it says
:::

Step 3 · What the derivative says {#s3k .step-kicker i18n=text}

The derivative comes out as a number — what does the number say? One thing, three faces: its <b>sign</b> tells rising from falling, its size (its <b>absolute value</b>) tells steep from gentle, and back in a physics setting it is the <b>instantaneous velocity</b>. Switch between the three readings and drag the probe to check each one. {#s3e .explain}

::: html step3-1
s3m1: Reading 1 · Rising / falling
s3m2: Reading 2 · Steep / gentle
s3m3: Reading 3 · Instantaneous velocity
s3xLab: Probe point x
s3tLab: Time t (seconds)
:::

The three faces are one number: the sign fixes rising vs falling, the absolute value fixes steepness, and with units attached (m/s) it is a velocity. The 2.5 computed on step 0 over [1, 1.5] was only an average; the speed at the instant t = 1, by reading 3, is 2 × 1 = 2 m/s. {#s3hint .hint}

::: strings
s3roIncPos: Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, which is positive — the curve is <b>rising</b> here (the green stretch). A positive derivative means the function climbs.
s3roIncNeg: Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, which is negative — the curve is <b>falling</b> here (the pink stretch). A negative derivative means the function descends.
s3roIncZero: Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, exactly 0 — the vertex: neither rising nor falling. This is the very vertex of the <a class="fourier-link" href="../../algebra/parabola/#step2">parabola page, step 2 “moving the vertex”</a>; on this page it gains a new name: a point where the derivative is 0.
s3roSteep: Reading 2: at x = <span>{x}</span>, |f′(x)| = <b>{abs}</b>. Look at the dashed triangle: run 1 horizontally and you must climb {abs} — the larger |derivative|, the steeper the tangent and the harder the curve climbs; near x = 0, |f′| is close to 0 and the curve almost lies flat.
s3roVel: Reading 3: put the physics clothes back on — the horizontal axis is time t, the vertical axis displacement s, and the curve is still s = t². At the instant t = <span>{t}</span> s the instantaneous velocity is v = s′(t) = 2t = <b>{v} m/s</b>. This is exactly “the velocity at each moment” of <a class="fourier-link" href="../../../physics/mechanics/velocity-vt/#step1">velocity-vt, step 1</a> — that page recognises it on a v–t graph; this page gives it a definition you can compute: shrink the interval to a point.
:::

## Check yourself: squeeze at x = 3, try x³, one judgement call {#step4 h2=s4t}

::: strings
nav4: 4 Check yourself
:::

Step 4 · Check yourself {#s4k .step-kicker i18n=text}

Three questions, three phrasings of one idea: the derivative is the number the rate of change is forced to as the interval shrinks to a point. Measure with the tools first, then answer. {#s4e .explain}

Question 1 · Squeezing at x = 3 {#q1t .quiz-t tag=h3 i18n=text}

Still y = x², but now look at the point x = 3 (step 1 used x = 1). Click the three Δx presets in turn, watch where the secant-slope readings settle, then answer f′(3). {#q1d .explain}

::: html step4-1
q1dxLab: Click a Δx to see the secant slope:
:::

Question 2 · Try x³ {#q2t .quiz-t tag=h3 i18n=text}

Now take f(x) = x³ and look at x = 1. Measure a few presets with the same squeezing tool as step 1, and watch which whole number the readings keep closing in on — then answer: what is f′(1)? Remember every reading is an approximation with the tail not fully shrunk: you are choosing the number they converge to, not any single reading itself. {#q2d .explain}

::: html step4-2
q2dxLab: Click a Δx to measure the secant slope:
:::

Question 3 · Judgement {#q3t .quiz-t tag=h3 i18n=text}

“The derivative is the tangent line itself.” Is that right? {#q3d .explain}

::: html step4-3
q3true: Right
q3false: Wrong
:::

::: strings
q1ro: Δx = <span>{dx}</span>: secant slope = ((3 + {dx})² − 9) ÷ {dx} = <b>{slope}</b>. It works out to exactly 6 + Δx — whatever Δx remains is exactly how far is left to the limit.
q1ok: ✓ Correct: f′(3) = <b>6</b>. The readings 7, 6.1, 6.01 are secant slopes (quantities along the way); the 6 they are all forced toward is the derivative — and 6 = 2 × 3 matches the derivative function f′(x) = 2x.
q1no: ✗ {v} is a secant slope at one particular Δx, not the derivative. Watch where the three readings 7 → 6.1 → 6.01 are heading: the number they converge to as Δx keeps shrinking is f′(3).
q2ro: Δx = <span>{dx}</span>: secant slope = ((1 + {dx})³ − 1) ÷ {dx} ≈ <b>{slope}</b>. The smaller Δx, the closer this “measured” value gets to a whole number.
q2ok: ✓ Correct: f′(1) = <b>3</b>. The readings 7, 4.75, 3.31, 3.0301 march straight toward 3; the 3.0301 at Δx = 0.01 is just the un-shrunk tail — the limit is 3, matching “the value of 3x² at x = 1”.
q2no: ✗ Look again at where the tool readings are heading: as Δx shrinks from 1 to 0.01 the slopes run 7 → 4.75 → 3.31 → 3.0301 — which whole number are they closing in on?
q3ok: ✓ Correct judgement: the derivative is <b>not</b> the tangent itself. The derivative is the <b>slope</b> of the tangent — a number; the tangent is a line. “f′(1) = 2” says the slope equals 2, not that the derivative is a line.
q3no: ✗ Think about what the 2 squeezed out in step 1 was: a <b>number</b> the secant slopes converged to. The derivative is a number (the slope of the tangent); the tangent is the line itself — a number and a line are not the same thing. Choose “Wrong”.
s4hint: The three answers are 6, 3 and “Wrong” — all the same sentence: the derivative is the number the rate of change is forced to as the interval shrinks to a point.
:::

## From an interval to an instant: wrapping up the derivative {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

Step 5 · Wrap-up {#s5k .step-kicker i18n=text}

Five steps done — the whole page folds into three sentences, and they are three stops on one line shared with the physics page and the parabola page. {#s5e .explain}

::: html step5-1
c1h: Average → instantaneous, by shrinking
c1: An average rate of change needs an interval, and the answer changes with the interval (4, 3, 2.5 are all correct, and none answers the question); shrink the interval toward a point without bound, and the number the secant slope is forced to is the instantaneous rate of change at that point.
c2h: The derivative is the slope of the tangent
c2: Geometrically, f′(x) is the slope of the tangent to the curve at that point: its sign says rising or falling, its size says steep or gentle. It is a number, not the line itself.
c3h: The derivative function collects every point’s slope
c3: Do the same squeeze at every x and the resulting new function is the derivative function f′. On this page you did x² → 2x by hand, and verified x³ → 3x² at x = 1.
s5fin: Two parting notes: ① <b>Smoothness is the standing assumption</b>: if the curve has a sharp corner at some point (like |x| at 0), the secant slopes from the two sides cannot be forced to the same number, and there is no derivative at that point — everything on this page rests on “the two sides can meet”. ② <b>Run it backwards</b>: if you know the rate of change at every instant, can you accumulate the original quantity back? Accumulating a rate of change back is the definite integral — the next page (not yet published; planted here in one sentence).
s5lkVel: The physics face: velocity-vt step 1 — “the velocity at each moment” and the v–t graph →
s5lkPar: The geometry face: parabola step 2 — the vertex is a point where the derivative is 0 →
:::
