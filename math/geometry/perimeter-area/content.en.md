---
lang: en
---

::: strings
docTitle: Perimeter vs Area · The Rope and the Tiles — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Perimeter vs Area · The Rope and the Tiles
tagline: A 24-metre rope fences a garden plot. Reshape it — does the land inside stay the same size? This page untangles the most common mix-up in primary maths: perimeter and area are not the same thing. Perimeter is the rope around the edge; area is the tiles covering the inside. The same rope, pulled flatter, encloses far less — and the same area can need a rope more than twice as long.
foot: visual.integ.life · Perimeter & Area —— one interaction at a time
:::

## One Rope: the Perimeter Stays, the Area Moves {#step0 h2=s0t}

::: strings
nav0: 0 One Rope
:::

Step 0 · One Rope {#s0k .step-kicker i18n=text}

This step answers: **if the perimeter is the same, is the area the same?** A rope **24 metres** long fences a rectangular garden. Two words, kept apart from the start: the **perimeter** is the distance around the shape — the length of this rope; the **area** is the size of the inside — counted in 1 m × 1 m square tiles, as many as it takes to cover the plot. Drag the round handle at the corner (or use the slider) to change the length and width, and watch which ledger moves and which does not. {#s0e .explain}

::: html step0-1
s0lenLab: Length (m)
:::

Look closely: while you drag, the **rope ledger never moves** (perimeter only measures the way around), while the **tile ledger jumps up and down** (area measures the inside). Each measures its own thing — that is the whole secret of this page. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0rope: Rope ledger (perimeter): {l} + {w} + {l} + {w} = <b>{p} m</b> — reshape it any way you like, the four sides always add up to this rope’s {p} m.
s0area: Tile ledger (area): {l} × {w} = <b>{a} m²</b> — exactly {a} one-metre square tiles fit inside.
s0explore: Could it get bigger? Nudge it toward a square and watch the area climb — find the top yourself first.
s0vs: This shape is {d} m² short of the maximum {max} m². Nudge it toward a square and watch the area climb.
s0square: A square! With length = width = 6 m, the area reaches <b>{max} m²</b> — the most land this rope can enclose.
c0title: Area {a} m²
cLen: length {v} m
cWid: width {v} m
cDrag: drag
:::

## All 11 Ways in a Row: Area Rises, Then Falls {#step1 h2=s1t}

::: strings
nav1: 1 The Ledger
:::

Step 1 · The Ledger {#s1k .step-kicker i18n=text}

This step answers: **of all the ways to spend a 24 m rope, which gives the most land?** With whole-metre sides there are exactly 11 ways, all listed in the ledger: the perimeter column (the rope around) never changes, while the area column (the tiles inside) rises and then falls. Click any row — or any bar above — and the garden in Step 0 follows. {#s1e .explain}

::: html step1-1
thL: Length (m)
thW: Width (m)
thP: Perimeter (m)
thA: Area (m²)
:::

The pattern is spoken by the ledger itself: **the closer the length and width, the larger the area**, peaking when they are equal (a square). Scope note: this page lists whole-metre rectangles as its evidence; the conclusion in fact holds for all rectangles. {#s1hint .hint}

::: strings
s1ro: Selected: length {l} m, width {w} m — perimeter {p} m, area <b>{a} m²</b>.
s1roPeak: Length 6 m, width 6 m — a square! Perimeter still {p} m, area <b>{a} m²</b>, the largest of all 11 ways.
c1title: Area of each way (m²)
:::

## Same Area — Same Perimeter? {#step2 h2=s2t}

::: strings
nav2: 2 Same Area · New Perimeter
:::

Step 2 · Flip It Around {#s2k .step-kicker i18n=text}

This step answers: **if the area is the same, is the perimeter the same?** Now pin the other quantity down: the area (the tiles inside) is fixed at **24 m²**, and whole-metre sides allow exactly four shapes. Switch between them and watch the four “rope bars” below — each is drawn in proportion to its perimeter (the distance around); the one you pick lights up. {#s2e .explain}

::: html step2-1
s2lab: Choose a shape:
:::

Why does flatter mean longer around? With the area pinned, squashing one side stretches the other — and the **perimeter counts two lengths plus two widths**, so the stretched side is billed twice. Each quantity keeps its own ledger; neither can stand in for the other. {#s2hint .hint}

::: strings
s2ro: Area: {l} × {w} = <b>24 m²</b> (the same for all four); perimeter: 2 × ({l} + {w}) = <b>{p} m</b>.
s2roDiff: All four shapes have area 24 m², yet their perimeters run from {min} m to {max} m — the flattest plot makes you walk {d} m more to get around it. Same area, very different perimeters.
c2area: Area 24 m²
c2rope: Perimeter {p} m
:::

## First Ask: Around, or Inside? {#step3 h2=s3t}

::: strings
nav3: 3 Quiz
:::

Step 3 · Quiz {#s3k .step-kicker i18n=text}

This step answers: **can you keep perimeter and area apart?** Two questions, no calculator needed — the pictures and ledgers from the earlier steps are all the evidence required. {#s3e .explain}

::: html step3-1
s3q1: True or false: if two shapes have equal perimeters, their areas must be equal.
s3q1a: Must be equal
s3q1b: Not necessarily
s3counterShow: Show the counterexample
s3q2: Word problem: a 20 m fence encloses a rectangular flower bed on all four sides. Which shape gives the largest area?
s3q2o1: 9 m × 1 m
s3q2o2: 6 m × 4 m
s3q2o3: 5 m × 5 m
s3q2o4: 7 m × 3 m
s3q2wall: Challenge scope (read after answering): if one side of the flower bed is a wall, the fence covers only three sides and the ledger becomes length + 2 × width = 20 — a different scope from the earlier steps, and a different answer. That is another problem, not covered on this page.
:::

Both questions turn on the same key: **ask first whether it is the way around (perimeter) or the inside (area)**, then find the evidence in the ledger — never let one quantity impersonate the other. {#s3hint .hint}

::: strings
s3counterAgain: Show it again
s3q1win: Correct — <b>not necessarily</b>! Look at the counterexample below: the same 24 m rope (equal perimeters), yet 11 × 1 gives only 11 m² while 6 × 6 gives 36 m² — the areas differ by 25 m².
s3q1winFixed: That’s the fix — <b>not necessarily</b>! Look at the counterexample below: the same 24 m rope (equal perimeters), yet 11 × 1 gives only 11 m² while 6 × 6 gives 36 m² — the areas differ by 25 m².
s3q1lose: The answer is <b>not necessarily</b>. Look at the counterexample below: two plots fenced by the same 24 m rope have areas 11 m² and 36 m² — equal perimeters, unequal areas.
c3idle: The counterexample appears here: two equal-perimeter plots, side by side
c3a: 11 × 1: perimeter 24 m · area 11 m²
c3b: 6 × 6: perimeter 24 m · area 36 m²
s3q2win: Correct: <b>5 m × 5 m</b>, area 25 m². A 20 m fence means length + width = 10 m; the four areas work out to 9, 24, 25 and 21 m² — and Step 1’s ledger said it plainly: the closer the two numbers, the larger the product — largest when they are equal.
s3q2lose: Not quite. All four shapes have perimeter 20 m (length + width = 10 m in each) and their areas are 9, 24, 25 and 21 m²; they differ only in how close the length and width are — closer means larger area. Try again.
:::

## Around, or Inside {#step4 h2=s4t}

::: strings
nav4: 4 Finale
:::

Step 4 · Finale {#s4k .step-kicker i18n=text}

It all compresses into one sentence: **perimeter measures the way around; area measures the inside.** The three plots below are all fenced by the same 24 m rope, yet their areas keep growing — everything on this page is in this one picture. {#s4e .explain}

::: html step4-1
c1h: Perimeter = the Way Around
c1: Perimeter is the distance around a shape, in metres — like a rope or a fence. It only cares how long the boundary is, never what is inside it.
c2h: Area = the Inside
c2: Area is the size of the inside, in square metres — like tiling a floor or painting a wall. It only counts how many 1 m squares fit, never how far the boundary runs.
c3h: Same Rope, New Area · Same Area, New Rope
c3: Fix the perimeter and the squarer shape wins (Steps 0–1); fix the area and the flatter shape runs longer around (Step 2). Both directions say the same thing: neither quantity can be deduced from the other.
s4fin: Next time a problem says “fence it in” or “cover it up”, ask first: is it asking about the way around, or the inside? Ask the right question and the ledger cannot go wrong.
lkArea: Where does area = length × width come from? See Multiplication Is Area: dots grow into tiles →
lkFrac: Why does one grid cell count as a unit? See Fractions: cutting a whole into equal parts →
:::

::: strings
c4p: Perimeter 24 m
c4a: Area {a} m²
:::
