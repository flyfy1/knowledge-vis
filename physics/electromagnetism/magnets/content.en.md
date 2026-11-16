---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Magnets · Iron Filings Reveal Unseen Lines
tagline: Sprinkle iron filings and the field lines show themselves: they leave the N pole and return to the S pole; like poles repel, unlike poles attract.
:::

## On a bar magnet, where is the pull strongest? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Strongest at the ends
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: STRONGEST AT THE ENDS
:::

This step answers: where is a magnet’s “field strongest”? The **magnetic field** is the region around a magnet that can push or pull on iron filings and small magnets; the stronger it is, the denser the filings. We model the magnet as having one “pole” at each end (an N pole and an S pole). Drag the probe along the side of the magnet from the left end to the right end; the curve below gives the field strength at the probe (relative value, 0.5 cm from the side). {#s0e .explain}

::: html step0-2
s0cv: Filings around a bar magnet and the field strength along its side
pos0: Probe position (0 = left end, 1 = right end)
:::

::: strings
s0ro: Probe at {x}: field strength = {b} (relative); near the ends the maximum is {bmax}, right in the middle {bmid}.
:::

## Two magnets close together: do they attract or repel, and how hard? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Pull or push
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: PULL OR PUSH
:::

This step answers: how does the force between poles depend on type and distance? The right-hand magnet can be flipped and pulled away. Each pole acts on both poles of the other magnet: unlike poles attract, like poles repel, with a strength falling as the square of the distance. The green arrow shows the net force on the right-hand magnet (relative value). {#s1e .explain}

::: html step1-2
s1cv: Two magnets and the net force on the right one
face: Facing poles
faceNS: Unlike poles facing (N to S)
faceNN: Like poles facing (N to N)
gap1: Gap between the magnets (cm)
:::

::: strings
s1ro: {face}, gap {gap} cm: net force {f} (relative), {dir}.
attract: they attract
repel: they repel
:::

## What do iron filings and field lines look like? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Filings
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: FILINGS
:::

This step answers: how can an invisible field be “drawn”? In a magnetic field each iron filing becomes a tiny magnet and lines up along the field; a **field line** joins those directions into a curve, drawn from N pole to S pole. Choose a set-up, switch between “Filings” and “Field lines”, change the number of lines, and see how lines join up for unlike poles and push apart for like poles. {#s2e .explain}

::: html step2-2
s2cv: The field shown with filings or field lines
cfgSingle: One magnet
cfgAttract: Two, unlike poles facing
cfgRepel: Two, like poles facing
showFil: Filings
showLines: Field lines
nLines: Lines per N pole
:::

::: strings
s2ro: {cfg}, showing {mode}: {note}
noteSingle: Field lines spread from the N pole and curve back to the S pole, densest at the ends.
noteAttract: With unlike poles facing, lines run straight from one magnet’s N pole to the other’s S pole.
noteRepel: With like poles facing, lines push each other apart and do not cross the middle.
:::

## A small compass next to the magnet: which way does it point? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Compass
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: COMPASS
:::

This step answers: how do we read the field’s direction? A compass needle’s red end (its N pole) turns to follow the field, pointing in the direction the field lines run. Drag the position sliders to move the compass, or switch on “Ring of compasses” and see them trace the shape of the field lines. {#s3e .explain}

::: html step3-2
s3cv: Compasses around a magnet
cx3: Compass horizontal position (cm)
cy3: Compass vertical position (cm)
:::

::: strings
ring: Ring of compasses
noring: Just one compass
s3ro: At ({x}, {y}) cm: field direction {a}° (anticlockwise from pointing right), strength {b} (relative).
:::

## If you break a magnet, do you get a lone N pole and a lone S pole? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Break a magnet
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: BREAK A MAGNET
:::

This step answers: can N and S be separated? Choose how many pieces, then pull them apart: every piece has a pole at each end. Pressed together, the N and S poles that touch cancel each other and the whole looks like the original magnet; pulled apart, each piece is a complete magnet and the filings show its own N and S. {#s4e .explain}

::: html step4-2
s4cv: A magnet broken into pieces, with filings
pieces: Number of pieces
pull: Gap pulled apart (cm)
:::

::: strings
s4ro: {n} pieces: {n} N poles and {n} S poles (always in pairs); gap {g} cm: {what}
whatTouch: pressed together, the touching poles cancel and it looks like one magnet.
whatApart: apart, each piece is a complete magnet with its own N and S.
:::

## Read the filings: how are the two magnets set? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: without labels, can you tell how the magnets are placed from the filings? The magnets here carry no N or S marks. Pick a judgement and check; the poles are revealed only after checking. {#s5e .explain}

::: html step5-2
s5cv: A filings pattern (poles hidden for now)
check: Check judgement
next: Another one
recapTitle: Recap
recap1: The field is strongest near the poles; field lines leave N and enter S.
recap2: Unlike poles attract and like poles repel, and the force drops quickly with distance.
recap3: N and S always come in pairs: every broken piece has two poles.
modelTitle: Scope and limits of this model
modelText: Here the magnet is simplified to one point pole at each end, using an inverse-square law between poles. A real magnet’s field comes from countless atomic magnets and is more complicated up close; field lines are a way of drawing, not real threads.
linkPyth: → Pythagorean Theorem: how the distance between poles comes from horizontal and vertical offsets
linkCoord: → Coordinate Plane: placing the compass with (x, y)
:::

Page complete. {#done .readout .success i18n=text}

::: strings
north: N
south: S
s5ro: Look at the filings: do the lines join up or push apart? Pick a judgement.
s5roOk: Correct: {note}
s5roNo: Not quite: {note}
docTitle: Magnets · Iron Filings Reveal Unseen Lines
:::
