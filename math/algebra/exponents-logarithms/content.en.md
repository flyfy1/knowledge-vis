---
lang: en
---

::: strings
docTitle: Exponentials & Logarithms · Multiply It Out, Ask It Back — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Exponentials & Logarithms · Multiply Out, Ask Back
tagline: Some growth is not “add a bit each time” but “multiply by the same factor each time” — unremarkable at first, explosive later. That is the exponential. And the logarithm, for all its intimidating notation, is just the exponential question turned around: if 2 raised to some power gives 8, the logarithm is that power. Every number on this page is computed on the spot with Math.pow / Math.log: values that come out exact are stated exactly, values that do not are always marked ≈ — never dressed up as exact.
foot: visual.integ.life · Exponentials & Logarithms —— one interaction at a time
:::

## The Doubling World: It Is Multiply, Not Add {#step0 h2=s0t}

::: strings
nav0: 0 Doubling World
:::

Step 0 · The Doubling World {#s0k .step-kicker i18n=text}

This step answers one question: **what does growth look like when each step multiplies by the same factor instead of adding the same amount?** A bacterium doubles every hour (×2): 1 becomes 2, 2 becomes 4… The cyan curve is the bacterium; the orange line lives differently: starting at 1, it adds +2 every hour (1, 3, 5, 7…). Same axes, same scale — play the animation or drag the probe and compare the two columns of numbers all the way to hour 10. And here is the opening question, stated plainly: **starting from a single bacterium that doubles every hour, how many are there after 24 hours?** By the end of this step you will be able to finish that count. {#s0e .explain}

::: html step0-1
s0play: Play ▶
s0tLab: Time probe t (hours)
:::

Read the table aloud and the pattern says itself: <b>each hour, the doubling column multiplies by 2; the line column adds 2</b>. Early on the two stay close; later the doubling column runs away — because multiplication keeps amplifying a number that has already grown, while addition always adds the same small amount. Growth of the form “add the same time, multiply by the same factor” is called **exponential growth** (the “exponent” is the little t in the top-right corner: it counts how many multiplications have happened). {#s0conc .readout}

And the opening question, finished: after 24 hours there are 2<sup>24</sup> = 16,777,216 bacteria — from a single cell to over sixteen million in a day. The bacterium is not especially fertile; doubling itself is just that fierce. {#s0hint .hint}

::: html step0-2
s0lkLin: Contrast: the straight-line world of “add the same, grow the same” — why the slope of a linear function never changes →
start: Start exploring ↓
:::

::: strings
s0pause: Pause ⏸
s0replay: Play again ↻
s0prog: Animation progress: sub-step {n} / 100
s0probe: At t = {t} h: doubling column 2<sup>{t}</sup> = <b>{d}</b>; straight-line column 1 + 2×{t} = <b>{l}</b>.
s0thT: time t (hours)
s0thDbl: doubling: 2^t
s0thLin: line: 1 + 2t
cNum: count
cDbl: doubling 2^t
cLin: line 1 + 2t
:::

## The Base Decides: the y = aˣ Family {#step1 h2=s1t}

::: strings
nav1: 1 The Base Decides
:::

Step 1 · The Exponential Function and Its Base {#s1k .step-kicker i18n=text}

This step answers: **what does the curve look like when the factor is not 2, and time is not a whole number?** Generalise doubling: the base (the factor a that gets multiplied over and over) can change, and the exponent x can be a fraction like 0.5. Drag the base slider from 0.3 to 3 and watch the moment it crosses 1; then drag the probe along the curve and read a<sup>x</sup> at any point — every value is computed live by Math.pow. {#s1e .explain}

::: html step1-1
s1aLab: Base a (the factor multiplied over and over)
s1xLab: Probe point x (or drag the point on the curve)
:::

Whatever a is, every a<sup>x</sup> passes through **(0, 1)** (a<sup>0</sup> = 1 — the orange point never moves), and every value is **positive**: the curve hugs the x-axis but never touches it. Conclusion: a function of the form <b>y = a<sup>x</sup> (a &gt; 0, a ≠ 1)</b> is an **exponential function**; the single number a decides whether it grows or decays, and how steeply. {#s1conc .readout}

Suggested order: park a at 2 and read the probe (non-integer powers like 2<sup>0.5</sup> ≈ 1.414 have definite values too); then drag a slowly across 1 — the conclusion flips from “rises” to “flat” to “falls”, and the picture and the sentence must flip together. {#s1hint .hint}

::: strings
s1roGrow: a = <span>{a}</span> &gt; 1: the curve <b>rises</b> — each +1 in x multiplies y by {a}; the larger a is, the steeper the climb. This is Step 0’s doubling in general form.
s1roFlat: a = <span>1</span>: y = 1<sup>x</sup> = <b>1</b>, always 1 — neither rising nor falling, just a flat line. That is why the definition of an exponential function excludes a = 1: it is neither growth nor decay.
s1roDecay: 0 &lt; a = <span>{a}</span> &lt; 1: the curve <b>falls</b> — each +1 in x multiplies y by a factor below 1, so it shrinks and shrinks. This is decay: the amount of a drug left in the body, or the mass of a radioactive sample, each multiplies by one fixed factor below 1 per fixed time interval (halving is just the special case where that factor works out to 0.5 — not expanded here).
s1probe: Probe at x = {x}: {a}<sup>{x}</sup> = <b>{v}</b> (computed by Math.pow).
cOrigin: (0, 1)
cOff: ↑ off-chart
:::

## Ask It Backwards: the Logarithm Is the Exponential Question, Inverted {#step2 h2=s2t}

::: strings
nav2: 2 Logarithms Arrive
:::

Step 2 · Logarithms Arrive {#s2k .step-kicker i18n=text}

This step answers: <strong>given 2<sup>x</sup> = 32, how do you “ask out” the x?</strong> The dashed orange line is a target height y\*: drag it (or use the preset buttons) and the x-coordinate of its intersection with the curve is the answer. Park the target on 8 and 32 first, then on 6 — and watch what changes in the readout. The base can be switched too (2 / 3 / 10): same question, different base. {#s2e .explain}

::: html step2-1
s2baseLab: Base:
s2tgtLab: Target height y\* (presets, or drag the orange line on the graph):
:::

The Q&A, tabulated: questions on the left, logarithm notation on the right {#s2qaT .stage-title i18n=text}

::: html step2-2
:::

Notation revealed: the answer to “a raised to what power gives b” is written <b>log<sub>a</sub>b</b>, read “the logarithm of b to base a” — it asks exactly “to what power must a be raised to give b”. Here a is the **base** (the same factor as in Step 1) and b is called the **argument** — the resulting number being asked about. The conditions, stated plainly: **a &gt; 0, a ≠ 1, b &gt; 0** — the argument must be positive, because every power of a is positive (the curve stays above the x-axis), so 0 and negative numbers simply have no logarithm to ask for. {#s2conc .readout}

Try target 0.5 with base 2: the intersection jumps to the left of the y-axis and x = −1 — when the argument is below 1, the logarithm is negative. Quiz question 1 comes straight from here. {#s2hint .hint}

::: strings
s2ro: Target height {tgt}: walk along the curve to that height and the intersection has x-coordinate <b>x {sol}</b> — the solution of {base}<sup>x</sup> = {tgt}. As a question: “{base} raised to what power gives {tgt}?” — this x is the answer.
s2roApprox: Notice this stop: x cannot be written out fully, so {sol} is only an approximation. But it has an <b>exact name</b>: log<sub>{base}</sub>{tgt}. That is the whole reason logarithms exist — an answer that cannot be written out still deserves exact notation.
s2qaH1: Question: base to what power gives the number?
s2qaH2: Answer (the power)
s2qaH3: Logarithm notation
cTarget: target y\*
:::

## Three Rulers: Logarithms Translate Multiplication into Addition {#step3 h2=s3t}

::: strings
nav3: 3 Three Rulers
:::

Step 3 · The Laws of Logarithms {#s3k .step-kicker i18n=text}

This step answers: **why can logarithms “make big numbers small”?** Below is a measuring bench: the graph shows y = 2<sup>x</sup> with four points marked. Click through the three rulers; every law is computed live with Math.log and checked in three columns — the laws are measured, not memorised (proofs are not expanded on this page, and that is said out loud). {#s3e .explain}

::: html step3-1
s3r1: Ruler 1 · Product → sum
s3r2: Ruler 2 · Power → product
s3r3: Ruler 3 · Change the ruler
:::

The three laws together say one thing: **logarithms translate the multiplication world back into the addition world** — products become sums, powers become products. The bigger the multiplication you were facing, the more that translation is worth. {#s3conc .readout}

Historically this translation saved real labour: before calculators, astronomers and navigators used logarithm tables to turn painful big multiplications into table lookups and additions — the “slide rule” era lasted three centuries. One more notation to meet: base-10 logarithms are called **common logarithms**, written lg — Step 2’s log₁₀1000 = 3 is the same as lg 1000 = 3. {#s3hint .hint}

::: strings
s3ro1: Product → sum: log₂8 = <b>{l8}</b>, log₂4 = <b>{l4}</b>; multiply the arguments, 8 × 4 = 32, and log₂32 = <b>{l32}</b>. Check: {l8} + {l4} = <b>{l32}</b> ✓ — <b>arguments multiply, logarithms add</b>: log<sub>a</sub>(M×N) = log<sub>a</sub>M + log<sub>a</sub>N.
s3ro2: Power → product: 4³ = <b>64</b>, and log₂64 = <b>{l64}</b>; on the other side, 3 × log₂4 = 3 × {l4} = <b>{p}</b>. Check: both sides are <b>{l64}</b> ✓ — <b>an argument raised to a power, the logarithm multiplied by that power</b>: log<sub>a</sub>(M<sup>k</sup>) = k × log<sub>a</sub>M.
s3ro3: Change the ruler: the same number 32, measured with base 2, gives log₂32 = <b>{a}</b>; measured with base 10, log₁₀32 = <b>{b}</b>. The number did not change — the ruler did, so the reading did. The two rulers can be converted into each other (this page shows this one example; the conversion formula is not expanded).
:::

## Self-Test: Can You Ask It Backwards? {#step4 h2=s4t}

::: strings
nav4: 4 Self-Test
:::

Step 4 · Self-Test {#s4k .step-kicker i18n=text}

All three questions test one skill: turning the exponential question around. Wrong answers can be retried, and your verdicts are not wiped by fiddling elsewhere on the page. {#s4e .explain}

Question 1 · An argument below 1 {#q1t .quiz-t tag=h3 i18n=text}

What is log₂(1/8)? Recall <a href="#step2">the graph in Step 2</a>: 2 raised to what power gives 1/8 — and on which side of the y-axis does an argument below 1 live? {#q1d .explain}

::: html step4-1
:::

Question 2 · How many multiplications {#q2t .quiz-t tag=h3 i18n=text}

A quantity triples every hour (×3 per hour). Starting from 1×, after how many hours is it 81×? Set it up first: 3<sup>t</sup> = 81, i.e. t = log₃81. {#q2d .explain}

::: html step4-2
:::

Question 3 · True or false {#q3t .quiz-t tag=h3 i18n=text}

Judge this claim: “The difference between log₂8 and log₂32 is 24.” {#q3d .explain}

::: html step4-3
q3true: True
q3false: False
:::

Common thread: translate every logarithm back into a “to what power” question before computing. If the translation stalls, go back to the graph in Step 2 and drag — the answer lives in the x-coordinate of the intersection. {#s4hint .hint}

::: strings
q1ok: ✓ Correct: 2<sup>−3</sup> = 1/2³ = <b>1/8</b>, so log₂(1/8) = <b>−3</b>. An argument below 1 makes the logarithm negative — the same thing you saw dragging the target to 0.5 in Step 2.
q1no: ✗ Not yet. Hint: positive powers of 2 are all above 1, so they cannot reach 1/8. Try a negative power: what is 2<sup>−3</sup> = 1/2³?
q2ok: ✓ Correct: 3⁴ = 81, so t = log₃81 = <b>4</b> hours. Exponentials ask “what does it multiply out to”, logarithms ask “how many times did it multiply” — the same fact, asked forwards and backwards.
q2no: ✗ Count the powers of 3 again: 3¹ = 3, 3² = 9, 3³ = 27, 3⁴ = … — which one is 81?
q3ok: ✓ Correct judgment — the claim is <b>false</b>: log₂8 = 3 and log₂32 = 5, so their difference is 5 − 3 = <b>2</b>. 24 is the difference of the arguments (32 − 8), not of the logarithms. A logarithm difference of 2 encodes a ratio: 32 = 8 × 4, and 4 = 2² — the 2 says exactly “two more multiplications by 2”.
q3no: ✗ The claim is actually false. 24 is 32 − 8 — the arguments subtracted. Logarithms must be computed first, then subtracted: log₂8 = 3 and log₂32 = 5. What is the difference of 3 and 5?
:::

## Multiply It Out: Exponential. Ask It Back: Logarithm. {#step5 h2=s5t}

::: strings
nav5: 5 Finale
:::

Step 5 · Finale {#s5k .step-kicker i18n=text}

Exponentials and logarithms are not two topics — they are the two directions of one question. Three closing cards: {#s5e .explain}

::: html step5-1
c1h: Multiply it out: the exponential
c1: The exponential y = a<sup>x</sup> answers “what does it multiply out to”: given the base (the per-step factor) and the exponent (how many multiplications), it computes the result. It captures growth of the form “add the same time, multiply by the same factor” — slow at the start, fierce later on.
c2h: Ask it back: the logarithm
c2: The logarithm log<sub>a</sub>b answers “how many times did it multiply”: given the base and the result (the argument), it asks the exponent back. It is not a new operation — just the exponential question written in reverse, and the notation that gives un-writable answers (like log₂6) an exact name.
c3h: Logarithms turn products into sums
c3: In the logarithm world: arguments multiplied → logarithms added; arguments raised to a power → logarithms multiplied by that power. That is why logarithms shrink big numbers and turn multiplication into addition — and why they served as a computing tool for three centuries.
s5fin: This multiply-and-ask pair is everywhere: **compound interest** is money growing by a factor (exponential); **decibels** and the **Richter scale** squeeze quantities spanning huge ranges onto small scales (logarithms). Spot “multiply by the same factor each step” and you have spotted an exponential; ask “how many multiplications to get this big” and you are asking for a logarithm.
s5eLine: One special base is planted here for later: e ≈ 2.71828…. The function y = e<sup>x</sup> has an astonishing property — at every point, its derivative is exactly equal to its own value at that point. That thread is picked up when derivatives arrive.
s5lkLin: Look back and contrast: the slope of a linear function — the “add the same, grow the same” world is the exact counterpart of this page’s multiplication →
:::
