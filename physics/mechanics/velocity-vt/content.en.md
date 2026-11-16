---
lang: en
---

::: strings
docTitle: Velocity & v–t Graphs · The Area Under the Line Is the Distance — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Velocity & v–t Graphs · Area Is Distance
tagline: When the speed keeps changing, how far have you actually gone? This page starts with a race, then draws the same race two ways: an x–t graph and a v–t graph. By the end you will see that the area under a v–t graph is not decoration — slice the region into thin strips, add them up, and the distance computes itself. This is the first seed of integration in senior school; here we plant the intuition.
foot: visual.integ.life · Velocity & v–t Graphs —— one interaction at a time
:::

## A Race: The Track and the Graph Tell the Same Story {#step0 h2=s0t}

::: strings
nav0: 0 The Race
:::

Step 0 · The Race {#s0k .step-kicker i18n=text}

This step answers: **who is faster, who finishes first — and how do the lines on a graph say it?** Two cars set off from 0 m together: car A covers 4 m every second, car B covers 2 m every second. Covering the same distance each second is called **uniform motion**. Above is the track; below is the **x–t graph** (time t on the horizontal axis, position x on the vertical axis): the lines grow exactly as far as the race has run — both panels always show the same race. {#s0e .explain}

::: html step0-1
play: Play ▶
restart: Restart
s0probeLab: Time probe t (shares one clock with the animation)
:::

Takeaway: on an x–t graph, **the steeper the line, the faster the motion** — A’s line is steeper, so A is faster. Reading an x–t graph means reading **steepness**. {#s0hint .hint}

::: html step0-2
s0lkLf: “Steepness” is the slope from the Linear Functions page: see how slope grows out of climbing a hill →
start: Start exploring ↓
:::

::: strings
pause: Pause ❚❚
s0roStart: Not started yet: both cars are at 0 m. Press “Play” to watch the race, or drag the time probe directly.
s0ro: At t = {t} s: car A is at <span>{xa} m</span>, car B at <span>{xb} m</span> — A leads by <b>{gap} m</b>. At any moment, the vertical gap between the two lines is exactly the gap on the track.
s0roEnd: Race over (t = 10 s): car A has covered the full <b>40 m</b>, car B only <span>20 m</span> — half the speed, so exactly half the distance.
cCarA: Car A · 4 m/s
cCarB: Car B · 2 m/s
cCarC: Car C · speeding up
cFinish: Finish 40 m
cStart: Start 0 m
cTimeS: time t / s
cPosM: position x / m
cVelV: velocity v / (m/s)
:::

## The Same Race, a New Graph: the Speed at Every Moment {#step1 h2=s1t}

::: strings
nav1: 1 The v–t Graph
:::

Step 1 · The v–t Graph Appears {#s1k .step-kicker i18n=text}

This step answers: **what does it look like to graph “the speed at each moment”?** Same cars A and B, plus a car C: C starts slowly, its speed rises from 0 to 4 m/s over the first 4 seconds, then stays at 4 m/s. Use the buttons to switch between the **x–t graph** and the **v–t graph** (time t horizontally, the speed v at that moment vertically) — one race, two drawings, side by side whenever you flip. {#s1e .explain}

::: html step1-1
s1mXt: x–t graph (position)
s1mVt: v–t graph (velocity)
s1probeLab: Time probe t (same clock as the animation)
:::

Do not mix them up: uniform motion is a **slanted line** on an x–t graph but a **flat line** on a v–t graph. On a v–t graph, ignore steepness and look at **how high** the line sits above the time axis — that height is the speed at that moment. Exactly the opposite of an x–t graph, and Step 3 drills it. {#s1hint .hint}

::: strings
s1roX: At t = {t} s, positions: A <span>{xa} m</span>, B <span>{xb} m</span>, C <span>{xc} m</span>. This is the x–t graph — it shows who is ahead: the higher the line, the further along.
s1roV: At t = {t} s, speeds: A <span>{va} m/s</span>, B <span>{vb} m/s</span>, C <span>{vc} m/s</span>. This is the v–t graph — it shows who is faster: the higher the line, the greater the speed.
s1roVEnd: Race over: on the v–t graph, A and B are **flat lines** from start to finish (their speeds never changed); C’s line climbs first, then flattens — slowest at the start, as fast as A by the end.
:::

## Why Should the Area Under the Graph Be the Distance? {#step2 h2=s2t}

::: strings
nav2: 2 Area Is Distance
:::

Step 2 · Area Is Distance {#s2k .step-kicker i18n=text}

This step answers: **why does the area under a v–t graph equal the distance travelled?** Start with the honest case: speed never changes, the region is one whole rectangle, and one multiplication balances the books. Then a speed that grows steadily: the region is a triangle — computable whole, but also reachable by slicing it into thin rectangles and adding them up. The finer the slices, the closer the sum. {#s2e .explain}

::: html step2-1
s2aT: First, uniform: a steady 4 m/s for 3 s
s2aBtn: Work out this area
s2bT: Then, changing speed: v grows steadily from 0 to 4 m/s (over 2 s)
s2bTri: Whole (triangle)
s2b4: Slice into 4
s2b8: Slice into 8
s2b16: Slice into 16
:::

All velocities on this page are nonnegative, so **v–t area = displacement = distance**. For motion that reverses direction, signed area ∫v dt gives displacement; distance is ∫|v| dt. Adding narrow time strips is the basic idea of integration. {#s2hint .hint}

::: strings
s2aIdle: Under the line sits one whole rectangle. Press the button to compute its area item by item and check it against the distance really travelled.
s2aDone: Area = speed × time = <span>4 m/s × 3 s</span> = <b>12</b>, and the unit works out: m/s × s = m. The car really did travel <b>12 m</b> in those 3 s — look at the road strip below: counting area on the graph counts the distance.
s2bIdle: Press “Whole (triangle)” to compute it at once, or slice it into strips and watch the staircase close in on the slanted line.
s2bTriRo: The whole region is a triangle: area = ½ × base × height = ½ × <span>2 s × 4 m/s</span> = <b>4 m</b>. The distance covered in these 2 s is exactly 4 m.
s2bCutRo: Sliced into {n} thin rectangles (each {dt} s wide, height taken at its left edge): the staircase sums to <b>{sum} m</b>; the exact value is 4 m, so it is still <b>{diff} m</b> short. The finer the slices, the tighter the staircase hugs the line, and the smaller the gap.
cRoad: distance really travelled
:::

## A Trip-Like Graph: Speeding Up, Cruising, Slowing Down {#step3 h2=s3t}

::: strings
nav3: 3 Reading a Real Trip
:::

Step 3 · Reading a Real Trip {#s3k .step-kicker i18n=text}

This step answers: **given a trip-like v–t graph, how much can you read off it?** This car speeds up from 0 to 4 m/s during 0–2 s, holds 4 m/s during 2–5 s, then slows to 0 by 7 s. Drag the probe to any moment: what it reads is **the speed at that very moment** — it has a name, **instantaneous velocity**. Then light up the area segment by segment and see how much distance each part contributes. {#s3e .explain}

::: html step3-1
s3probeLab: Moment probe t
s3segLab: Light up the area, segment by segment (multi-select):
s3seg1: Segment 1 · 0–2 s
s3seg2: Segment 2 · 2–5 s
s3seg3: Segment 3 · 5–7 s
s3qLab: Decide what each segment is doing (watch whether its line rises, stays flat, or falls):
s3qSeg1: Segment 1 (0–2 s)
optAcc: Speeding up
optUni: Constant speed
optDec: Slowing down
s3qSeg2: Segment 2 (2–5 s)
s3qSeg3: Segment 3 (5–7 s)
:::

Reading a v–t graph takes three moves: **check the height** (how high the line is = how fast), **check the trend** (rising = speeding up, flat = constant, falling = slowing down), **measure the area** (the area under a segment is the distance of that segment). {#s3hint .hint}

::: strings
s3ro: At t = {t} s: instantaneous velocity <span>{v} m/s</span>; from the start until this moment it has travelled <b>{d} m</b> (= the area under the graph from 0 to {t} s).
s3areaIdle: Press the buttons above to light up the area under each segment and see how much distance each contributes.
s3segA1: Segment 1 (triangle): ½ × 2 s × 4 m/s = <b>4 m</b>
s3segA2: Segment 2 (rectangle): 3 s × 4 m/s = <b>12 m</b>
s3segA3: Segment 3 (triangle): ½ × 2 s × 4 m/s = <b>4 m</b>
s3areaSum: Lit area so far: <b>{sum} m</b>.
s3areaAll: All three lit: 4 + 12 + 4 = <b>20 m</b> — the distance for the whole trip. Add the areas of the segments and you get the total distance.
qOk: ✓ Correct
qNo: ✗ Not quite — is the line rising, flat, or falling?
:::

## A New Trip — Read It Yourself {#step4 h2=s4t}

::: strings
nav4: 4 Quiz
:::

Step 4 · Quiz {#s4k .step-kicker i18n=text}

A fresh trip: from 0 to 6 m/s during 0–3 s, holding 6 m/s during 3–6 s, then slowing to 0 by 8 s. All three questions are read off this one graph — no memorising, just reading. {#s4e .explain}

::: html step4-1
s4q1: Question 1: drag the probe to the moment <b>t = 7 s</b>, then press “Answer with the probe here”: what is the speed at that moment? (The probe reads the height of the line for you.)
s4probeLab: Probe t
s4q1Btn: Answer with the probe here
s4q2: Question 2: how many metres did this trip cover in total? (Hint: compute the area of each of the three segments, then add.)
s4q3: Question 3 (true or false): “On a v–t graph, the steeper the line, the greater the speed.” Is that right?
judgeT: True
judgeF: False
:::

::: strings
s4probeRo: Probe: t = {t} s, the speed at this moment is <span>{v} m/s</span>.
s4q1Ok: ✓ Correct: at t = 7 s the speed is <b>3 m/s</b>. Segment 3 is slowing down, the speed falling steadily from 6 m/s; 7 s is exactly the midpoint of that segment, and the speed has fallen to exactly half.
s4q1NoT: ✗ The probe is not at t = 7 s yet (it was at t = {t} s). Drag it to that moment first, then answer.
s4q2Ok: ✓ Correct: ½ × 3 s × 6 m/s + 3 s × 6 m/s + ½ × 2 s × 6 m/s = 9 + 18 + 6 = <b>33 m</b>. Triangles at both ends, a rectangle in the middle.
s4q2No: ✗ Not quite. Go segment by segment: triangles at both ends (½ × base × height), a rectangle in the middle (base × height), then add them up.
s4q3Ok: ✓ Correct judgement: the statement is **false**. A steep line only means the speed is **changing fast**; how large the speed is at a moment depends on **how high** the line is then (the reading on the vertical axis), not on steepness. Remember Step 1: car C’s line was steepest right at the start — when its speed was smallest.
s4q3No: ✗ Think again: right when car C set off, its line was the steepest — yet its speed at that moment was nearly 0. Steepness tells you the speed is changing fast, not that the speed is large.
s4score: Quiz progress: <b>{n} / 3</b> answered correctly.
s4scoreDone: Quiz progress: <b>3 / 3</b> — all three right, done!
:::

## Two Graphs, One Ledger {#step5 h2=s5t}

::: strings
nav5: 5 Finale
:::

Step 5 · Finale {#s5k .step-kicker i18n=text}

One motion can be drawn two ways, and the two readings complement each other. Take these three sentences with you and this page is yours. {#s5e .explain}

::: html step5-1
c1h: x–t graphs: read the steepness
c1: Position against time: the steeper the line, the faster the motion; a flat line means standing still. Steepness answers “how fast”.
c2h: v–t graphs: read the height
c2: Velocity against time: what matters is not steepness but **how high** the line sits above the time axis — that height is the speed at that moment. Rising means speeding up, falling means slowing down, flat means constant speed.
c3h: Area is distance
c3: Here v≥0, so v–t area equals both displacement and distance. In general, signed area ∫v dt is displacement, while distance is ∫|v| dt; they differ for a return trip.
s5fin: Coming attraction (senior school): slicing a region into infinitely thin strips and adding them up has a formal name — **integration** — and when you meet it, you will find that the area under a v–t graph is the very first account it settles. The seed is planted here today.
s5lkLf: Slope was the steepness of a climb there; here it becomes velocity: back to Linear Functions, Step 0 →
s5lkArea: Where does area = length × width come from? The Area Model page draws multiplication as a plot of land →
:::
