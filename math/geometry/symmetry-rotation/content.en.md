---
lang: en
---

::: strings
docTitle: Symmetry & Rotation · Flip It, Spin It — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Symmetry & Rotation · Flip It, Spin It
tagline: Fold some shapes and the two halves match exactly; spin others by just the right angle and they land back on themselves. This page asks one question: in how many ways can a shape “move and become itself again”? Way one is a flip — folding along an axis of symmetry. Way two is a turn — rotating around a centre. At the end the two combine: you draw one small piece and a kaleidoscope grows the whole pattern.
foot: visual.integ.life · Symmetry & Rotation —— one interaction at a time
:::

## Along Which Line Does It Fold Onto Itself? {#step0 h2=s0t}

::: strings
nav0: 0 Try a Fold
:::

Step 0 · Try a Fold {#s0k .step-kicker i18n=text}

This step answers: **what earns a line the name “axis of symmetry”?** The words first: fold a shape along a line; if the two halves **coincide** — land exactly on each other, no corner sticking out, nothing missing — that line is an **axis of symmetry**, and the shape has **axial symmetry**. Each shape below offers several candidate lines, real ones mixed with fakes. Pick one and watch the half fold over: matching counts, almost-matching does not. {#s0e .explain}

::: html step0-1
s0shapeLab: Choose a shape:
s0lineLab: Click a candidate fold line to try it:
:::

There is only one test: **fold and coincide**. A line that merely looks central proves nothing until the fold is tried — worth checking every candidate on the square by hand. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
shIso: Isosceles triangle
shSquare: Square
shRect: Rectangle
shScalene: Ordinary triangle
lnV: Vertical centre line
lnH: Horizontal centre line
lnD1: Diagonal ↘
lnD2: Diagonal ↙
lnVOff: Off-centre vertical
lnHOff: Off-centre horizontal
lnMed: Vertex to midpoint line
s0idle: No fold tried yet. Click any candidate line above and watch whether the flipped half lines up.
s0folding: Folding along “{line}”… watch the moving half: do its edges land exactly on the original?
s0yes: “{line}”: <b>the two halves match exactly — this IS an axis of symmetry!</b> The folded half landed precisely on the original.
s0no: “{line}”: <b>not an axis.</b> Look at the folded half — the edges that stick out past the original give it away. Close is not a match.
s0prog: Tried {tried}/{total} lines · axes found: <b>{found}</b>
s0done0: All candidate lines for this shape are tried: it has no axis of symmetry at all — not every shape does.
s0doneN: All candidate lines for this shape are tried: it has <b>{found}</b> axes of symmetry in total. Try another shape.
s0done1: All candidate lines for this shape are tried: it has <b>{found}</b> axis of symmetry in total. Try another shape.
:::

## How Many Axes? The Shape Decides {#step1 h2=s1t}

::: strings
nav1: 1 Count the Axes
:::

Step 1 · Count the Axes {#s1k .step-kicker i18n=text}

This step answers: **how many axes of symmetry does each common shape have?** Guess first, then check: on each card, pick your guess, then hit “Reveal all axes” and count the dashed lines drawn on the shape. Beware the **parallelogram** in the gallery — it looks like the safest bet and folds to nothing. Two letter Easter eggs wait at the end. {#s1e .explain}

::: html step1-1
:::

The ledger’s verdict: the square’s 4 axes are the most of any shape here (the circle, with countless, stands apart); the count is decided by the shape, not by how symmetric it feels. {#s1hint .hint}

::: strings
s1predLab: Guess first: how many axes does it have?
p0: 0
p1: 1
p2: 2
p3: 3
p4: 4
pInf: Countless
s1reveal: Reveal all axes
cnt0: 0 axes
cnt1: 1 axis
cnt2: 2 axes
cnt3: 3 axes
cnt4: 4 axes
cntInf: countless axes
s1right: Correct! The {name} has <b>{n}</b> of symmetry.
s1wrong: You guessed {guess}; the {name} actually has <b>{n}</b> — count the dashed lines on the picture.
s1paraNote: The parallelogram has none at all — but it hides a secret: **turn it half a turn (180°) and it lands on itself**. The next step reveals how.
s1circleNote: A circle has countless axes: every line through its centre is one. Only 4 are drawn here as a sample.
s1norev: Pick a guess, then reveal the axes to check.
gSquare: square
:::

## No Flipping, Just Turning: How Far Until It Matches? {#step2 h2=s2t}

::: strings
nav2: 2 Give It a Spin
:::

Step 2 · Give It a Spin {#s2k .step-kicker i18n=text}

This step answers: **how far must a shape turn around its centre to coincide with itself?** The dot in the middle is the **centre of rotation** — the one point that never moves. Drag the slider to spin the shape; the pale dashed outline is where it started. At certain angles the two land exactly on each other: that is **rotational symmetry** — becoming yourself again by turning, not flipping. {#s2e .explain}

::: html step2-1
s2shapeLab: Choose a shape:
s2angLab: Rotation angle (degrees)
s2find: Spin to the nearest matching angle
:::

How to watch: turn slowly and keep your eyes on the solid shape against its dashed outline — the moment they merge is a coincidence. More blades, more frequent coincidences. {#s2hint .hint}

::: strings
rFan2: 2-blade pinwheel
rFan3: 3-blade pinwheel
rFan4: 4-blade pinwheel
rLeaf: A leaf
rPara: Parallelogram
s2roYes: Now at <b>{deg}°</b>: it <b>coincides exactly</b> with the original!
s2roNo: Now at {deg}°: not yet — the shape still sits off its dashed outline.
s2roZero: Currently 0°, not turned yet. Drag the slider, or press “Spin to the nearest matching angle”.
s2ledger: Ledger: the {name} coincides every <b>{min}°</b>, <b>{n}</b> times in a full 360° turn (360 ÷ {n} = {min}). That count {n} is its order of rotational symmetry.
s2ledgerLeaf: Ledger: a leaf never coincides at any angle — only a full 360° turn brings it back. It has **no rotational symmetry**; its order counts as 1.
s2paraBack: The Step 1 secret, revealed: the parallelogram has no axis at all, yet a 180° turn lands it exactly on itself — **no axial symmetry, but rotational symmetry. Flipping and turning are different things.**
c2center: centre of rotation
:::

## Draw One Small Piece — the Pattern Grows Itself {#step3 h2=s3t}

::: strings
nav3: 3 Kaleidoscope
:::

Step 3 · Kaleidoscope {#s3k .step-kicker i18n=text}

This step answers: **a kaleidoscope holds one tiny piece of coloured glass, so why is the pattern huge?** Two tricks conspire: a **mirror image** (a mirror copy is a flipped twin, exactly the fold from Step 0) adds a flipped copy inside every sector, and rotation then carries the sectors around the full circle. The glowing sector below is the “original zone”: put a motif in it and watch it grow across the whole disc. {#s3e .explain}

::: html step3-1
s3secLab: Number of sectors:
sec4: 4 sectors
sec6: 6 sectors
sec8: 8 sectors
s3mirLab: Mirror (a flipped copy in each sector):
mirOn: On
mirOff: Off
s3motifLab: Put into the glowing sector:
mDot: A dot
mSeg: A short line
mTri: A small triangle
s3clear: Clear
:::

You can also click any sector: the click is folded back into the original zone, and a dot appears at the matching spot there. {#s3clickHint .hint i18n=text}

Compare by hand: with the same originals, switching the mirror off instantly halves the pattern — the missing half is what mirroring (folding) contributes. {#s3hint .hint}

::: strings
s3empty: The original zone is still empty — add a motif and watch it fill the disc.
s3ro: Originals: <b>{m}</b>. Each original appears <b>{c}</b> times in the full pattern, so the pattern holds <b>{tot}</b> copies in all.
s3roWhyOn: Mirror on: every sector holds a straight and a flipped copy, so each original appears 2 × {n} = {c} times.
s3roWhyOff: Mirror off: rotation alone is copying, so each original appears {n} times. Switch the mirror on and compare what the pattern gains.
:::

## Flip or Turn? Tell the Two “Becoming Yourself” Apart {#step4 h2=s4t}

::: strings
nav4: 4 Quiz · Finale
:::

Step 4 · Quiz {#s4k .step-kicker i18n=text}

This step answers: **can you tell the two tricks from the first three steps apart?** Three questions — one true/false, one multiple choice, one hands-on spin. Judge from the pictures and ledgers, not from memorised definitions. {#s4e .explain}

::: html step4-1
s4q1: True or false: a rectangle turned by 90° lands exactly on itself.
qTrue: True
qFalse: False
s4q2: Multiple choice: which shape has **rotational symmetry but no axis of symmetry**?
gPara: parallelogram
gRect: rectangle
gEqui: equilateral triangle
s4q3: Hands-on: here is a 3-blade pinwheel. Drag the slider — at how many degrees does it coincide with the original **for the first time**? Set it, then submit.
s4q3angLab: Angle (degrees)
s4q3submit: That’s my angle
s4fk: Finale · Two Ways to Become Yourself
s4ft: Flip, and Turn
f1h: Fold = Axial Symmetry
f1: Fold along an axis and the halves coincide exactly (Steps 0–1). The test is the fold, not the look. The square leads with 4 axes; the circle has countless.
f2h: Turn = Rotational Symmetry
f2: Turn by 360° ÷ order around the centre and the shape coincides with itself (Step 2). The parallelogram has no axis at all, yet coincides at 180° — rotational symmetry only.
f3h: Kaleidoscope = Both Together
f3: Mirror (fold) a copy into every sector, then rotate around the full circle (Step 3): one original grows into 2n copies. Snowflakes, paper cuttings and wheel hubs are all built from these same two tricks.
s4fin: Next time you meet a pattern, ask it two questions: can it fold onto itself? By what angle does it turn onto itself? Answer both, and you have seen through its symmetry.
lkPeri: Why is the square special everywhere? It has the most axes (4) — and with a fixed perimeter it also encloses the largest area. See the ledger in Perimeter vs Area →
lkArea: Beautiful patterns are often symmetry at work: see how a grid of dots grows into a whole tiled floor in Multiplication Is Area →
:::

::: strings
gIso: isosceles triangle
gCircle: circle
gA: Letter A
gH: Letter H
s4q1win: Correct — it is <b>false</b>. Turn a rectangle 90° and its long sides stand vertical: no match. It needs <b>180°</b> (the same ledger as the 2-blade pinwheel).
s4q1lose: Think again: after a 90° turn the rectangle’s long sides point up and down — does it sit on its original outline? Which angle did its ledger in Step 2 call for?
s4q2win: Correct: the <b>parallelogram</b>. No fold ever matches it (0 axes), yet a 180° turn lands it exactly on itself.
s4q2lose: Not that one: the {name} does have axes of symmetry (you counted them in Step 1). Think of the gallery’s trap shape — the one that looks most likely and has none.
s4q3win: Correct: <b>120°</b>. A 3-blade pinwheel coincides 3 times per turn, 360 ÷ 3 = 120, so the first coincidence is at 120°.
s4q3again: {deg}° does coincide, but it is not the **first** time — the first one comes earlier. Nudge it smaller.
s4q3zero: 0° is the starting point — nothing has turned yet, so it doesn’t count. Drag the slider, turn it, and find where the first coincidence appears.
s4q3no: At {deg}° the blades still sit off the dashed outline — no coincidence yet. Drag slowly and watch for the moment they merge.
:::
