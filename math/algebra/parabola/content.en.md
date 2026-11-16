---
lang: en
---

::: strings
docTitle: Quadratic Functions & the Parabola · The Arc of a Shot — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Quadratic Functions & the Parabola · The Arc of a Shot
tagline: The arc of a basketball shot is a parabola: in y = ax², a sets which way it opens and how fat it is; slide the whole arc around and its vertex (the highest or lowest point) travels with it. Written in vertex form, the equation shows you the vertex, the axis of symmetry, and the ground crossings — all readable straight off the formula.
foot: visual.integ.life · Quadratic Functions & the Parabola 二次函数与抛物线 — One Interaction at a Time series
:::

## The shot: join the ball’s position every 0.1 seconds {#step0 h2=s0t}

::: strings
nav0: 0 The Shot
:::

Step 0 · The Shot {#s0k .step-kicker i18n=text}

This step answers: once the ball leaves the hand, where is it every 0.1 seconds? Drop those positions as points, one by one, and join them — what shape appears? Press “Shoot” and watch the points land: the horizontal axis is time (seconds), the vertical axis is height (metres). Afterwards you can switch the horizontal axis to horizontal distance and look at the same points again. {#s0e .explain}

::: html step0-1
s0play: Shoot ▶
s0modeT: Horizontal axis: time
s0modeD: Horizontal axis: distance
:::

Both horizontal axes draw the same single shot: the ball’s horizontal speed is constant, so horizontal distance is proportional to time. Switching the axis to distance stretches the points sideways — still the arc of the same shot, still a parabola, but the picture is pulled wider, so it looks fatter than in the time view (a sideways stretch effectively swaps in a different a in the equation — exactly what Step 1 is about). The facts do not change: the vertex height, and which moment of the shot each point stands for. Watch the order of events: **first the points appearing one by one (the phenomenon), then the shape they join into**. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0pause: Pause ⏸
s0resume: Resume ▶
s0replay: Shoot again ↻
s0prog: Points down: {n} / 14
s0ptT: Point {n}: time {x} s, height <b>{y}</b> m
s0ptD: Point {n}: horizontal distance {x} m, height <b>{y}</b> m
s0roIdle: Press “Shoot”: the ball leaves the hand and a position point drops every 0.1 seconds. Pause any time to inspect a moment.
s0roDoneT: All 14 points are down, and joined up they form an arc that rises, then falls, with exactly one highest point: at 0.5 s, 3.25 m high. An arc with a single peak (or a single lowest point) like this is called a <b>parabola</b>; the highest (or lowest) point is its <b>vertex</b>.
s0roDoneD: All 14 points are down, and joined up they form an arc that rises, then falls, with exactly one highest point: at a horizontal distance of 2 m, 3.25 m high. An arc with a single peak (or a single lowest point) like this is called a <b>parabola</b>; the highest (or lowest) point is its <b>vertex</b>.
cTime: Time (s)
cDist: Horizontal distance (m)
cHeight: Height (m)
cVertex: Vertex
:::

## y = ax²: a sets the opening and the fatness {#step1 h2=s1t}

::: strings
nav1: 1 What a Does
:::

Step 1 · What a Does {#s1k .step-kicker i18n=text}

This step answers: in the simplest parabola, y = ax², what changes when you change a? Drag the slider and compare the solid curve with the dashed prototype y = x² — fatter or thinner, opening up or down. For now the vertex stays pinned at the origin. {#s1e .explain}

::: html step1-1
s1aLab: Values of a (vertex pinned at the origin)
s1eqPre: Current equation
s1zeroBtn: What if a = 0?
:::

A function whose highest power is 2, like y = ax² with a ≠ 0, is called a <b>quadratic function</b>; its graph is a parabola. {#s1conc .readout}

The rule, wrapped up: the <b>sign</b> of a sets the opening (positive up, negative down), and <b>|a|</b> sets the fatness (bigger |a|, thinner; smaller |a|, fatter). Always judge fatness against the dashed prototype y = x². {#s1hint .hint}

::: strings
s1zeroBack: Back to a ≠ 0
s1roThin: a = {a} (bigger than 1): opens upward, and <b>thinner</b> than the prototype — at the same x, y is {a} times the prototype’s, so it climbs faster.
s1roFat: a = {a} (between 0 and 1): opens upward, and <b>fatter</b> than the prototype — at the same x, y is only {a} times the prototype’s, so it climbs slowly.
s1roOne: a = 1: this is the prototype y = x² itself — dashed and solid curves coincide exactly.
s1roNegThin: a = {a} (below −1): the opening flips <b>downward</b>; fatness is read from |a| = {abs} (bigger than 1), so it is thinner than the prototype.
s1roNegFat: a = {a} (between −1 and 0): the opening flips <b>downward</b>; fatness is read from |a| = {abs} (smaller than 1), so it is fatter than the prototype.
s1roNegOne: a = −1: the prototype flipped downward — like y = x² reflected in the x-axis.
s1roZero: a = 0: the x² term is multiplied away to 0, y is constantly 0, and the graph is the x-axis — a <b>straight line</b>, not a parabola. So quadratic functions lay down a rule: <b>a must not be 0</b>.
:::

## Vertex form: move the parabola, the vertex is written on its face {#step2 h2=s2t}

::: strings
nav2: 2 Moving the Vertex
:::

Step 2 · Moving the Vertex {#s2k .step-kicker i18n=text}

This step answers: move the whole parabola somewhere else — how does the equation change? Written as <b>y = a(x − h)² + k</b>, the equation is in <b>vertex form</b>: h slides it left and right, k slides it up and down, and the vertex (h, k) follows. The vertical line x = h through the vertex is the arc’s <b>axis of symmetry</b> — the line the two sides mirror across. Drag the h and k sliders and watch vertex, axis and equation move together. {#s2e .explain}

::: html step2-1
s2aLab: Opening direction a
s2aUp: a = 1 (opens up)
s2aDown: a = −1 (opens down)
s2hLab: h (slide the vertex left/right)
s2kLab: k (slide the vertex up/down)
s2eqPre: Vertex form
:::

Writing convention (the same set as on the linear-functions page): when h is negative, (x − h) is written (x + |h|) — for example h = −1 is written (x + 1)². When reading the equation, the vertex’s horizontal coordinate is then <b>−1</b>; do not let the plus sign fool you. Vertex form works for any parabola: know the vertex and the opening, and the equation is fixed. {#s2hint .hint}

::: strings
s2ro: The vertex <b>({h}, {k})</b> is written right in the equation: the h inside the brackets is the vertex’s horizontal coordinate, the k at the end is its vertical coordinate. The axis of symmetry is the vertical line <b>x = {h}</b>, and the vertex sits exactly on it. The marked pair of points ({lx}, {y}) and ({rx}, {y}) are the same distance from the axis (2 units each) and at the same height — symmetry you can see.
cAxisLab: Axis x = {h}
:::

## Landings & crossings: where the arc meets the ground {#step3 h2=s3t}

::: strings
nav3: 3 Landings & Crossings
:::

Step 3 · Landings & Crossings {#s3k .step-kicker i18n=text}

This step answers: where does a parabola cross the x-axis (the ground), and how many crossings are there? A crossing is a place where y = 0 — in the shot story, the moment the ball lands. Drag the h and k sliders or switch the opening direction to produce all three cases — two crossings, one crossing, none — then click (or drag along) the arc to plant a probe flag and read heights point by point. {#s3e .explain}

Check the vertex against the x-axis, then move h/k: crossing gives two landing points, touching gives one, and staying on one side gives none. {#s3bridge .hint i18n=text}

::: html step3-1
s3aLab: Opening direction a
s3aUp: a = 1 (opens up)
s3aDown: a = −1 (opens down)
s3hLab: h (vertex left/right)
s3kLab: k (vertex up/down)
s3eqPre: This parabola
:::

The number of crossings depends only on how the arc sits relative to the axis: passing through = 2, vertex on the axis = 1, out of reach = 0. Later you will meet a formula that decides the count for you; come back to this picture then and it will all make sense. On this page, crossings are read off the graph — no test to memorise. {#s3hint .hint}

::: strings
s3roTwo: It crosses the x-axis at <b>two points</b>: ({x1}, 0) and ({x2}, 0). A crossing is where y = 0 — in the shot story, the right-hand one is the ball’s <b>landing point</b>.
s3roOne: It touches the x-axis at exactly <b>one point</b>: ({x}, 0) — the vertex sits right on the axis, and the arc just grazes it (tangent), no more, no less.
s3roNoneAbove: It <b>never crosses</b> the x-axis: the whole arc stays above the axis, y is always greater than 0, and there is no landing.
s3roNoneBelow: It <b>never crosses</b> the x-axis: the whole arc stays below the axis, y is always less than 0, and it never reaches the axis.
s3probeIdle: Click (or drag along) the arc to plant a probe flag: read how high the arc is at any x — where the flag lands on y = 0, that is a crossing.
s3probe: Probe at x = {x}: the arc is at height y = <b>{y}</b>. {tail}
s3tailZero: Exactly 0 — the flag is planted right on a crossing!
s3tailPos: Still above the x-axis; it has not landed.
s3tailNeg: Already below the x-axis — a real shot never sinks underground; the graph is drawn in full here just so you can see it.
cGround: Ground (y = 0)
cGroundS: Ground
:::

## Self-check: pick the equation, place the arc, read a shot graph {#step4 h2=s4t}

::: strings
nav4: 4 Self-check
:::

Step 4 · Self-check {#s4k .step-kicker i18n=text}

Three questions — reading a vertex, placing a vertex-form equation, reading crossings. Wrong answers are fine: the feedback tells you which step to revisit. {#s4e .explain}

Question 1 · Read the graph, pick the equation {#q1t .quiz-t tag=h3 i18n=text}

The parabola in the picture has its vertex at (2, 1) and opens downward. Which vertex-form equation is it? Read the vertex first, then the opening. {#q1d .explain}

::: html step4-1
:::

Question 2 · Place the arc {#q2t .quiz-t tag=h3 i18n=text}

Use the opening buttons and the two sliders until the solid arc lies exactly on the target: vertex (−1, 3), opening downward (the dashed arc is the target). The check is exact: the sign of a, h and k all have to match. {#q2d .explain}

::: html step4-2
q2aLab: Your opening direction a
q2aUp: a = 1 (opens up)
q2aDown: a = −1 (opens down)
q2hLab: Your h (vertex’s horizontal coordinate)
q2kLab: Your k (vertex’s vertical coordinate)
:::

Question 3 · Read a shot graph {#q3t .quiz-t tag=h3 i18n=text}

This arc is y = −½(x − 4)² + 8: the ball is shot from the ground at (0, 0), and the dots on the arc are its heights at whole-number horizontal positions. Click a dot as a probe and answer the two questions. {#q3d .explain}

::: html step4-3
q3aBtn: Q1: How high is the highest point?
q3bBtn: Q2: Where does the ball land?
:::

All three questions use the same toolkit: read the vertex, the opening and the crossings off the graph, then match them to the equation. Missed one? Go back to its step and drag it once more. {#s4hint .hint}

::: strings
q1ok: ✓ Correct: vertex (2, 1) → the equation contains (x − 2)² + 1; opening downward → a is negative. Together: y = −(x − 2)² + 1.
q1no: ✗ Not yet. Read the vertex first: is it (x − 2) or (x + 2) in the brackets? Then the opening: downward means a is positive or negative?
q2cur: Your equation right now: {eq}
q2ok: ✓ A perfect fit! a = −1, h = −1, k = 3 — the solid arc coincides with the target.
q2hintA: Not there yet: the first mismatch is the <b>opening</b> — the target opens downward, so switch a to −1 first, then adjust the vertex position.
q2hintH: Not there yet: the opening is right, and the mismatch is <b>h, the vertex’s left-right position</b> — the target vertex sits at h = −1, so slide h to line the vertex up.
q2hintK: Not there yet: the opening and the left-right position are both right, and only <b>k, the vertex’s height</b>, is off — the target vertex sits at k = 3, so slide k to finish.
q3aIdle: Q1: Put the probe on the highest point of the arc.
q3aWrong: The probe is at ({x}, {y}): not the highest point yet — walk along the arc towards the top (the vertex).
q3aOk: ✓ Right: the highest point is the vertex (4, 8) — <b>8 m</b> high.
q3bIdle: Q2: Put the probe where the ball lands — where y is back to 0, and not at the launch point.
q3bStart: That is the launch point (0, 0): the ball leaves from here. The landing is the other place where y = 0.
q3bWrong: The probe is at ({x}, {y}): not landed yet — at the landing, y should be exactly 0.
q3bOk: ✓ Right: the ball lands <b>8 m</b> away — (8, 0) is the arc’s other crossing with the x-axis.
:::

## One arc, fully written in one equation {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

Step 5 · Wrap-up {#s5k .step-kicker i18n=text}

Looking back: a parabola can be written as a single vertex-form equation because it has only a few things to declare — which way it opens and how fat it is, and where its vertex sits. Every other point is then uniquely fixed by those choices. {#s5e .explain}

::: html step5-1
c1h: a sets direction and fatness
c1: The sign of a sets the opening (positive up, negative down); |a| sets the fatness (bigger, thinner). At a = 0 the arc collapses into a straight line — which is why quadratic functions require a ≠ 0.
c2h: Vertex form wears the vertex on its face
c2: y = a(x − h)² + k: read the vertex (h, k) straight off, and the axis of symmetry is x = h. Any parabola can be written in vertex form — find the vertex, and the equation has its skeleton.
c3h: Crossings are landings
c3: Where a parabola crosses the x-axis is where y = 0, and the count is only ever 2, 1 or 0: passing through, grazing, out of reach. A shot’s landing point, a fountain’s splash-down point — all crossings.
s5fin: A note on textbook forms: the common general form y = ax² + bx + c and vertex form are two writings of the same parabola — expand the vertex form and collect like terms and you get the general form; rewriting the general form back into vertex form (completing the square) is a skill for later. This page first matches the graph to the vertex form.
s5lkLin: Look back at lines: in Step 0 of the linear-functions page, a constant rise per step lined the points up straight; here the rise changes from step to step, and the points bend into a parabola — go compare →
s5lkPyth: Another coordinate skill: Step 5 of the Pythagorean page measures the distance between two points with coordinates — once you can read off vertices and crossings, you can also measure how far apart they are →
:::
