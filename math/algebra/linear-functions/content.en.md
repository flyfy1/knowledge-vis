---
lang: en
---

::: strings
docTitle: Linear Functions · Slope Is Steepness, Intercept Is the Start — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Linear Functions · A Line and Its Equation
tagline: y = kx + b is not symbol juggling: k is how much you rise for each step forward (the steepness of the ramp), and b is how high you already stand before moving (the starting height). This page matches every line to its equation one-to-one — drag the line and the equation follows; drag the equation and the line follows. Two views of the same thing.
foot: visual.integ.life · Linear Functions 一次函数 — One Interaction at a Time series
sep: ", "
:::

## The ramp: rise the same at every step, and the points line up {#step0 h2=s0t}

::: strings
nav0: 0 The Ramp
:::

Step 0 · The Ramp {#s0k .step-kicker i18n=text}

This step answers: a flight of stairs where every step rises by the same amount — what shape do you get by joining the corners? Drag the slider to choose "how many units up per 1 unit forward" and watch the lattice points drop in one by one (x from 0 to 5). The horizontal axis is steps forward x; the vertical axis is height y. {#s0e .explain}

::: html step0-1
s0kLab: Units risen per 1 unit forward
s0play: Drop the points again ▶
:::

When this holds: the rise must be the <b>same at every step</b> for the points to form a line. If each step rises by a different amount, the points bend into a curve — what curve is the story of the parabola page, coming later. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0roPts: Points so far: {pts}
s0roNone: The points are dropping in, one by one…
s0roKPos: k = {k}: every 1 unit forward rises {k} {unit}. This "rise per step forward" is called the <b>slope</b> — it sets how steep the ramp is: bigger k, steeper ramp. Equal steps, equal rises: the points cannot help forming a <b>straight line</b>.
s0roKNeg: k = {k}: every 1 unit forward does not rise but drops {a} {unit} — the ramp runs downhill. This "rise per step forward" is called the <b>slope</b> — a negative slope means downhill. Equal steps, equal drops: still a <b>straight line</b>.
s0roKZero: k = 0: every step rises 0 units — flat ground. Flat ground is a straight line too, and its slope (rise per step forward) is 0.
:::

## The start: set off higher, and the whole line slides {#step1 h2=s1t}

::: strings
nav1: 1 The Start
:::

Step 1 · The Start {#s1k .step-kicker i18n=text}

This step answers: the same ramp (steepness unchanged — the slope stays 1), but starting from a different height — what changes? Drag the slider to change the starting height, watch the whole line slide up or down, and keep your eye on where it crosses the vertical axis. {#s1e .explain}

::: html step1-1
s1bLab: Starting height b (how high you stand at x = 0, before moving)
:::

Reading any line, read the intercept first: where it lands on the vertical axis is b. In the next step, slope and intercept combine into the full equation. {#s1hint .hint}

::: strings
s1ro: At x = 0 the line crosses the vertical axis at <b>(0, {b})</b>. This "value of y when x = 0" is called the <b>intercept</b>, written b = {b}: before you move at all, you already stand at this height. Dragging b never changes the steepness (the slope) — b only slides the whole line up or down.
:::

## Slope plus start, spelled out: y = kx + b {#step2 h2=s2t}

::: strings
nav2: 2 The Equation
:::

Step 2 · The Equation Appears {#s2k .step-kicker i18n=text}

This step answers: can one formula compute every point on the line? Put together the slope k from Step 0 (rise per 1 unit forward) and the intercept b from Step 1 (the value of y at x = 0), and you get <b>y = kx + b</b>. A rule where "once x is fixed, y is uniquely determined" like this is called a <b>function</b>. Drag both sliders — line and equation move together — then click a lattice point on the line to check the arithmetic item by item. {#s2e .explain}

::: html step2-1
s2kLab: Slope k (rise per 1 unit forward)
s2bLab: Intercept b (the value of y at x = 0)
s2eqPre: The equation of this line
s2prev: ← Previous point
s2next: Next point →
:::

The equation is the line’s instruction sheet. Writing conventions: k = 1 drops the coefficient (write x, not 1x); k = −1 is written −x; b = 0 is left out; a negative b is written as subtracting a number. {#s2hint .hint}

::: html step2-2
geometryTitle: Next · how does the same slope determine a pinhole image?
geometryIntro: This plot describes a line with y=kx+b. Set b to0 and observe the line passing through the origin. In a ray diagram, place the origin at the hole: a line through it has intercept0. Object and image points remain on that same line. Similar triangles relate corresponding length ratios, while coordinate signs explain inversion.
geometryLink: Compare slope, similar ratios and inversion in the pinhole lesson →
geometryReturn: Use browser Back after inspecting it. This history entry retains this step’s slope, intercept and selected probe as reading context, not a record of learning or mastery.
:::

::: strings
s2probeIdle: Click a dot on the line (or step through points with the buttons below) to substitute and check: plug the point’s x into the equation, and the y that comes out should be exactly the point’s y.
s2probeFar: Too far from the line — click one of the dots sitting on the line.
s2probe: Checking point <b>({x}, {y})</b>: {arith} ✓ The computed y is exactly the point’s height — this point really is on the line, and so are infinitely many others, all satisfying the same equation.
:::

## When two lines meet: the crossing is a shared solution {#step3 h2=s3t}

::: strings
nav3: 3 Two Lines Meet
:::

Step 3 · Two Lines Meet {#s3k .step-kicker i18n=text}

This step answers: when do two lines cross, and what does the crossing mean? The first line is fixed at y = x + 1. Drag the sliders to change the second line’s slope k₂ (steepness) and intercept b₂ (starting height), and watch where they meet — or whether they never do. The point that belongs to both lines is called their <b>intersection point</b>. {#s3e .explain}

::: html step3-1
s3k2Lab: Second line’s slope k₂ (steepness)
s3b2Lab: Second line’s intercept b₂ (starting height)
:::

Rule of thumb: compare slopes first — different slopes always cross at exactly one point; equal slopes, compare intercepts — equal means coincident, different means parallel. {#s3hint .hint}

::: strings
s3l1: First line (fixed): {eq}
s3l2: Second line: {eq}
s3roPoint: The intersection is <b>({x}, {y})</b>: it lies on both lines — plug x = {x} into both equations and both give y = {y}. So the intersection is the <b>shared solution</b> of the two equations.
s3roParallel: The lines are <b>parallel</b>: same slope (both 1), different intercepts — extend them forever and they never meet. The two equations have no shared solution.
s3roCoincident: The lines <b>coincide completely</b>: same slope, same intercept — really one and the same line. Every point on it is an intersection: infinitely many shared solutions.
:::

## Self-check: read a graph, place a line, read a fare chart {#step4 h2=s4t}

::: strings
nav4: 4 Self-check
:::

Step 4 · Self-check {#s4k .step-kicker i18n=text}

Three questions — reading a graph, placing a line, reading a real price rule. Wrong answers are fine: the feedback tells you which step to revisit. {#s4e .explain}

Question 1 · Read the graph, pick the equation {#q1t .quiz-t tag=h3 i18n=text}

Which equation is this line? Read the graph yourself: where does it cross the vertical axis (that is the intercept), and going right, does it rise or fall (that is the sign of the slope)? {#q1d .explain}

::: html step4-1
:::

Question 2 · Place the line {#q2t .quiz-t tag=h3 i18n=text}

Drag the two sliders until the solid line lies exactly on the target <b>y = 2x − 1</b> (the dashed line is the target). The check is exact: slope and intercept both have to match. {#q2d .explain}

::: html step4-2
q2kLab: Your slope k (steepness)
q2bLab: Your intercept b (starting height)
:::

Question 3 · Taxi fares {#q3t .quiz-t tag=h3 i18n=text}

The fare rule: a <b>flag-fall of 8 yuan</b> the moment you get in (money paid at x = 0 — that is the intercept b = 8), then <b>3 yuan per kilometre</b> (each extra kilometre costs 3 more — that is the slope k = 3). So fare = 3 × kilometres + 8. Each dot on the graph is one trip: (kilometres, fare). Click a dot to answer the two questions. {#q3d .explain}

::: html step4-3
q3aBtn: Q1: How much for 3 km?
q3bBtn: Q2: How far does 20 yuan take you?
:::

All three questions use the same toolkit: slope, intercept, and substituting to check. Missed one? Go back to its step and drag it once more. {#s4hint .hint}

::: strings
q1ok: ✓ Correct: read the intercept first — the line meets the vertical axis at (0, 2), so b = 2; then the slope — it falls going right, so k = −1. Together: y = −x + 2.
q1no: ✗ Not yet. Look again: where does it cross the vertical axis (that is the intercept b)? Going right, does it rise or fall (that is the sign of the slope k)?
q2cur: Your line right now: {eq}
q2ok: ✓ A perfect fit! k = 2, b = −1 — the solid line coincides with the target.
q2hint: Not there yet: slope sets the steepness, intercept slides the line up or down. Match the steepness first, then slide to the intercept.
q3aIdle: Q1: Find the "3 kilometres" dot and click it.
q3aWrong: That dot is {x} km with fare {fare} yuan (fare = 3 × {x} + 8 = {fare}). The question asks about 3 km — keep looking.
q3aOk: ✓ Right: 3 km → fare = 3 × 3 + 8 = <b>17 yuan</b>. On the graph it is the dot with horizontal coordinate 3.
q3bIdle: Q2: Now backwards — which dot has a fare of exactly 20 yuan? Click it.
q3bWrong: That dot is {x} km with fare {fare} yuan. The target is 20 yuan — search along the dots.
q3bOk: ✓ Right: 20 yuan minus the 8-yuan flag-fall leaves 12 yuan; at 3 yuan per kilometre, 12 ÷ 3 = <b>4 km</b>. Forwards is multiplication (substituting to check); backwards is division to undo it.
cKm: kilometres
cFare: Fare (yuan)
:::

## One instruction sheet runs the whole line {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

Step 5 · Wrap-up {#s5k .step-kicker i18n=text}

Looking back: a line can be written as a single equation because it has only two things to declare — how steep it is, and where it starts. Every remaining point is then uniquely fixed by those two choices. {#s5e .explain}

::: html step5-1
c1h: Slope k = steepness
c1: How much you rise per 1 unit forward. Bigger is steeper, negative is downhill, 0 is flat. If each step rose by a different amount, the points would bend into a curve — the story of the parabola page, coming next.
c2h: Intercept b = the start
c2: The value of y at x = 0 — how high you stand before moving. Changing b never changes the steepness; it only slides the whole line. Daily life is full of b: flag-falls, base salaries, fixed monthly fees.
c3h: Intersection = shared solution
c3: The point where two lines meet satisfies both equations at once. Different slopes cross; equal slopes are parallel or coincident. Later, solving simultaneous equations means hunting for exactly this point.
s5fin: The line is where all functions begin: first see "how one quantity changes with another" as a graph, then write it as a formula, then use the formula to compute points the graph never drew — the road from here leads to every function that follows.
s5lkPyth: Next stop for coordinates: Step 5 of the Pythagorean page uses coordinates to measure the distance between two points — the distance formula is the Pythagorean theorem dressed in coordinates →
:::
