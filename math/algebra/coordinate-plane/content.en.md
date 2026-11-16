---
lang: en
---

::: strings
docTitle: The Coordinate Plane · x First, Then y — Every Point Has an Address — One Interaction at a Time
back: ← Knowledge Index
pageTitle: The Coordinate Plane · An Address for Every Position
tagline: A position can be pinned down by numbers: one number for a position on a line, a pair of numbers for a position on a plane. And the pair has an order — across first, then up; swap them and you land at a different address. Starting from the number line, this page lays out the coordinate grid one cell at a time.
foot: visual.integ.life · Coordinate Plane 坐标系与点的位置 — One Interaction at a Time series
:::

## On a line, one number is enough {#step0 h2=s0t}

::: strings
nav0: 0 One Number
:::

Step 0 · A One-Dimensional Address {#s0k .step-kicker i18n=text}

This step answers: can a single number pin down a position on a line? This is a **number line**: first fix a starting point called the **origin** (marked O) — every position is spoken of relative to it; then fix a positive direction (to the right, here). Drag the point along the axis (or click any tick to place it) and watch the readout state its position with one signed number. {#s0e .explain}

::: html step0-1
s0shift: Move the origin to +2 and see
:::

The conclusion: a one-dimensional position ⇔ one signed number, provided the **origin and positive direction are agreed first**. But that only works on a line — what happens when the point jumps off into a plane? The next step runs straight into it. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0unshift: Put the origin back
s0roPos: The point is **{n} units to the right** of the origin, written <b>+{n}</b> — direction (right) plus distance ({n} units): one number pins the position down.
s0roNeg: The point is **{n} units to the left** of the origin, written <b>−{n}</b> — the minus sign carries the direction (left), the digit carries the distance ({n} units).
s0roZero: The point sits exactly on the **origin**, written <b>0</b> — neither left nor right, and distance 0.
s0shiftNote: Notice: <b>the point did not move, but its address changed</b>. With the origin moved to {o}, the same point now reads {r}. An address is always relative to the origin — move the origin and every address shifts with it.
s0blocked: Hold on — if the origin really moved, this point would read <b>{r}</b>, outside the −6…+6 marked on this axis. Nudge the point toward the middle, then try again.
s0oldOrigin: old origin
:::

## On a plane, it takes a pair of numbers {#step1 h2=s1t}

::: strings
nav1: 1 One Is Not Enough
:::

Step 1 · One Number Is Not Enough {#s1k .step-kicker i18n=text}

This step answers: put the point on a plane and report only one number — what happens? This is a block of seats: **7 columns × 5 rows**, with one target seat hidden among them. Try reporting a single number first — choose a column or row number with the sliders, then press a button to call it out, and see how much of the block lights up. {#s1e .explain}

::: html step1-1
s1colLab: Column number (counting from the left)
s1rowLab: Row number (counting from the bottom)
s1btnCol: Report the column only
s1btnRow: Report the row only
s1btnBoth: Report both
:::

The conclusion: a position on a plane needs **a pair of numbers** — one for across, one for up. Seats, chessboards and map grids all work this way. The next step sets the worldwide rule for writing the pair. {#s1hint .hint}

::: strings
s1roIdle: Nothing reported yet. Think first: given only a column number, could you pin down exactly which seat it is?
s1roCol: Column <b>{c}</b> only: column {c} lights up in full — it holds <b>{n} seats</b>, and the target could be any of them. **One number fixes a line, never a point.**
s1roRow: Row <b>{r}</b> only: row {r} lights up in full — it holds <b>{n} seats</b>, and the target could be any of them. **One number fixes a line, never a point.**
s1roBothHit: Column <b>{c}</b> and row <b>{r}</b> together: the two lit bands cross, and exactly <b>1 seat</b> remains — the target appears! **Two numbers crossing pin the point down.**
s1roBothMiss: Column <b>{c}</b> and row <b>{r}</b> together: exactly <b>1 seat</b> remains at the crossing — the pair does pin down one seat, just not the target one. Try another column and row.
s1target: target
s1colsCap: columns →
s1rowsCap: rows ↑
:::

## Across first, then up: (x, y) is the point’s address {#step2 h2=s2t}

::: strings
nav2: 2 The Grid Arrives
:::

Step 2 · The Coordinate System Arrives {#s2k .step-kicker i18n=text}

This step answers: what single rule for writing the pair keeps everyone in the world from misreading it? Stand a second number line upright: the horizontal one is the **x-axis**, the upright one is the **y-axis**; two number lines crossing at right angles, sharing one origin — the "address net" they weave is the **Cartesian coordinate system**. Give the seat grid an origin and signs, and seat numbers graduate into coordinates. Click a cyan point to watch its coordinates walked out from the origin; then drag the orange point all over the plane. {#s2e .explain}

::: html step2-1
s2build: ▶ Build the system once
s2pickLab: Click a cyan point to see the walk, or drag the orange point anywhere:
:::

The conclusion: coordinates are the record of a walk from the origin, written as an **ordered pair** (x, y) — a pair with an order, across first then up, the same rule worldwide. This page practises integer lattice points only; points between the lattice lines have coordinates too — fractions or decimals — read in exactly the same way (the function pages ahead will use them). {#s2hint .hint}

::: strings
s2bPh1: 1/3: the x-axis lies down — the number line from Step 0
s2bPh2: 2/3: the y-axis stands up — the same line, upright
s2bPh3: 3/3: origins aligned — the address net is ready
s2ro: Walk <b>{xs}</b> across first, then <b>{ys}</b> up → the coordinates of this point are <b>{coord}</b>. The first number, {xs}, is the **x-coordinate**; the second, {ys}, is the **y-coordinate**.
:::

## (3, 2) and (2, 3) are not the same address {#step3 h2=s3t}

::: strings
nav3: 3 Order Matters
:::

Step 3 · Order Cannot Be Swapped {#s3k .step-kicker i18n=text}

This step answers: write the two numbers of a coordinate in the wrong order — is it still the same point? The cyan point is A; the orange point A′ is its "swap twin", made by **exchanging** A’s coordinates. Press "Swap A’s coordinates" and watch where A moves; then drag A around (or use the sliders) and watch A′ follow. The slanted line is called the **diagonal** — the line of points whose two coordinates are equal; in this step it serves only as a mirror for the swap experiment. {#s3e .explain}

Change only the horizontal coordinate x: A′ changes its vertical coordinate with it. Then change only y: A′ changes its horizontal coordinate. Only when x=y do both points stay on the same grid square. {#s3bridge .hint i18n=text}

::: html step3-1
s3xLab: A’s x-coordinate
s3yLab: A’s y-coordinate
s3swapBtn: Swap A’s coordinates ⇄
:::

The conclusion: (a, b) and (b, a) are generally two different points, coinciding only when **a = b** — which is why a coordinate must be an ordered pair: the order itself is part of the address. This holds for all coordinates, not just integer lattice points. {#s3hint .hint}

::: strings
s3diag: diagonal: points on this line have equal coordinates
s3roDiff: A is <b>{a}</b> and its swap twin A′ is <b>{b}</b>: the x-coordinates differ by <b>{dx}</b>, the y-coordinates by <b>{dy}</b> — **two different points**. Writing the pair backwards moves the point.
s3roSame: A is <b>{a}</b>: its two coordinates are equal, so swapping changes nothing — A and A′ **coincide** here. Only points on the diagonal survive being written backwards.
:::

## Quadrants: the signs are assembled, not memorised {#step4 h2=s4t}

::: strings
nav4: 4 Four Quadrants
:::

Step 4 · The Four Quadrants {#s4k .step-kicker i18n=text}

This step answers: the two axes cut the plane into four regions — what sign pattern do the points in each region carry? The four regions are called **quadrants**, counted counterclockwise from the top right: first, second, third, fourth. Drag the point all over the plane (or click any lattice point to place it there); the readout reports its coordinates, its signs and its region together. The first time you enter a new region, it lights up and hangs out its sign badge. {#s4e .explain}

::: html step4-1
s4prac: **Reverse practice (not scored)**: given only the signs, can you point at the region? Look at the sign combination below and click the region on the diagram that you think matches (clicking any lattice point counts as an answer; dragging the point around to explore does not).
s4new: Another combination
:::

The conclusion: which quadrant a point is in depends only on the signs of x and y, **never on their sizes**; points on the axes belong to no quadrant, because one of their coordinates is 0 and has no sign. This is a definition — no exceptions. {#s4hint .hint}

::: strings
s4ro: Point {coord}: x is <b>{sx}</b>, y is <b>{sy}</b> → the **{region}**.
s4roXAxis: Point {coord} is on the **x-axis**: y = 0 — no sign at all, so it **belongs to no quadrant**.
s4roYAxis: Point {coord} is on the **y-axis**: x = 0 — no sign at all, so it **belongs to no quadrant**.
s4roOrigin: Point {coord} is the **origin**: both coordinates are 0, and it **belongs to no quadrant**.
s4ro2: All four regions visited: their signs are nothing but a **jigsaw of the two axes’ signs** — the sign of x reads left vs right, the sign of y reads down vs up. Assembled, not memorised.
qname1: first quadrant
qname2: second quadrant
qname3: third quadrant
qname4: fourth quadrant
s4pCombo: Find this combination: <b>{signs}</b> — click a region on the diagram to answer.
s4pOk: ✓ Correct: {signs} is the sign pattern of the **{region}**.
s4pNo: ✗ Not this one: you clicked the **{got}**. Remember the assembly — the sign of x picks left vs right, the sign of y picks down vs up. Click again.
s4pAxis: ✗ You clicked on an axis — points on an axis belong to no quadrant. Try inside one of the four regions.
:::

## Quiz: read it, place it, never swap it {#step5 h2=s5t}

::: strings
nav5: 5 Quiz & Wrap-up
:::

Step 5 · Quiz & Wrap-up {#s5k .step-kicker i18n=text}

Three questions — reading coordinates, placing a point by its coordinates, and the classic trap of writing the pair backwards. Wrong answers are fine: the feedback tells you which step to revisit, and a correct answer locks the question. {#s5e .explain}

Question 1 · Read the coordinates {#q1t .quiz-t tag=h3 i18n=text}

What are the coordinates of the point in the diagram? Read it yourself: from the origin, walk across first, then up. Beware — one of the options is the same pair written backwards. {#q1d .explain}

::: html step5-1
:::

Question 2 · Place the point by its coordinates {#q2t .quiz-t tag=h3 i18n=text}

Place the point at <b>(−2, 3)</b>: click a lattice cell in the diagram to drop the point there. Across first, then up — where do −2 across and 3 up land? {#q2d .explain}

::: html step5-2
:::

Question 3 · The swap trap {#q3t .quiz-t tag=h3 i18n=text}

Are <b>(4, 1)</b> and <b>(1, 4)</b> the same point? Pick an answer first — afterwards the diagram will light up both points as evidence. {#q3d .explain}

::: html step5-3
q3yes: The same point
q3no: Not the same point
:::

The three questions map to Step 2 (reading and writing coordinates), Steps 2 and 4 (placing a point, and signs), and Step 3 (order cannot be swapped). Missed one? Go back to its step and drag it once more. {#s5hint .hint}

::: html step5-4
c1h: The address grows with the world
c1: A position on a line is pinned by one (signed) number; a position on a plane takes a pair. Add a dimension to the world and the address gains a number — in three-dimensional space there will be one more still.
c2h: (x, y) is an ordered pair
c2: Across first, then up — the same rule worldwide. (a, b) and (b, a) are two different addresses, coinciding only when a = b: the order itself is part of the address.
c3h: Quadrants are a jigsaw of signs
c3: The sign of x picks left vs right, the sign of y picks down vs up; assemble them and you have the sign pattern of all four quadrants — nothing to memorise. A point on an axis has a coordinate of 0, no sign, and belongs to no quadrant.
s5fin: The coordinate system is the foundation under every function page that follows: linear functions line points up into a straight line, parabolas into an arc — all of them reading the addresses you practised here. Onwards —
s5neg: One more thing: the left half of the number line, the part left of 0, has a whole page of its own story — how negative numbers moved into the number line. That page is on its way.
s5lkLf0: Coordinates in motion: points line up into a straight line — the linear-function ramp starts from coordinates you can read →
s5lkLf2: Coordinates at work: plug (x, y) into an equation and check it — an address you can also compute with →
s5lkPyth: Measuring with coordinates: the distance between two points feeds the coordinate differences into the Pythagorean theorem →
:::

::: strings
q1ok: ✓ Correct: walk −4 across (4 units left), then −3 up (3 units down) — the coordinates are <b>(−4, −3)</b>. The swapped (−3, −4) is a different point. The reading craft is Step 2.
q1no: ✗ Not yet. Read it again: the point is down-left of the origin — how many units across (and what sign?), then how many up? Drag through Step 2 once more and it will be clear.
q2idle: No point placed yet. Click a lattice cell in the diagram to try.
q2ok: ✓ A perfect landing: your point is exactly <b>(−2, 3)</b> — x-coordinate −2 is left of the origin, y-coordinate 3 is above it, in the second quadrant.
q2no: ✗ The point you placed actually has coordinates <b>{placed}</b>; the target is <b>{target}</b>. Check the signs and the order of the two numbers, then click again. (Placing and reading are inverse operations — both live in Step 2; signs and regions are Step 4.)
q3ok: ✓ Right: one point sits at (4, 1) and the other at (1, 4), facing each other across the diagonal — **not the same point**. That is exactly Step 3’s conclusion: swapping the coordinates moves the point, unless the two numbers are equal.
q3noMsg: ✗ The diagram has lit up both points: (4, 1) and (1, 4) are plainly in two different places. Recall Step 3 — exchanging the coordinates really does move the point. Choose again.
s5done: 🎉 All three correct: you can now issue an address to any lattice point on the plane — read it, place it, and never write it backwards.
:::

## Split a segment into direction, length and midpoint {#step6 h2=s6t}

::: strings
nav6: 6 Midpoint & Distance
:::

Step 6 · Midpoint & Distance {#s6k .step-kicker i18n=text}

This step answers: how can one straight segment reveal its direction, length and exact centre at the same time? Drag A or B, or use the sliders. The cyan arrow is the vector from A to B; the orange dashed path splits it into horizontal Δx and vertical Δy; the green point M is the midpoint, found by averaging the two endpoint coordinates component by component. The distance combines the two components with the Pythagorean theorem; slope is Δy/Δx, while a vertical line has no finite slope. {#s6e .explain}

::: html step6-1
s6canvasLabel: Draggable endpoints with vector components and midpoint; readout below
s6AxLab: A x-coordinate
s6AyLab: A y-coordinate
s6BxLab: B x-coordinate
s6ByLab: B y-coordinate
s6components: Show horizontal and vertical components
reset: Reset this step
:::

Conclusion: a segment carries more than a single length; it also carries direction components. Swap A and B and Δx, Δy and slope change sign, while the distance and midpoint stay fixed. Integer lattice points are only the entry ramp — the same formulas work for fractional coordinates. {#s6hint .hint}

::: strings
s6ro: A = <b>{a}</b>, B = <b>{b}</b>; Δx = <b>{dx}</b>, Δy = <b>{dy}</b>; distance |AB| = <b>{dist}</b>; midpoint M = <b>{mid}</b>; slope = <b>{slope}</b>.
s6vertical: undefined (vertical line)
s6check: Square check: |AB|² = <b>{lhs}</b>; component squares {rhs}.
:::
