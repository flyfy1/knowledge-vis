---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Three Views · Three Shadows Rebuild a Solid
tagline: Look at a stack of blocks from the front, the left and above to get three flat pictures; line them up and you can rebuild the solid.
:::

## On a 3 × 3 grid, stack 0 to 3 blocks on each square: what do you get? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Build
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: BUILD
:::

This step answers: how do we build a solid? In the 3 × 3 grid below, the number on each button is how many blocks are stacked on that square. Click to add 1, and after 3 it goes back to 0; or pick a preset. The drawing shows the blocks in 3D: the left visible face looks to the left, the right visible face is the front. {#s0e .explain}

::: html step0-2
s0cv: A 3D picture of the blocks
presetL: Presets
gridLabel: Blocks on each square (top row is the back row)
:::

::: strings
pStairs: Stairs
pL: L-shape
pPyr: High middle
pCorner: Corner tower
pClear: Clear
s0ro: {n} blocks in all; heights by square (back row first): {rows}.
:::

## Looking from the front, the left and above: what do we see? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Three directions
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: THREE DIRECTIONS
:::

This step answers: what flat pictures does one stack give from three directions? The **front view** looks from the front: each column shows only its tallest stack. The **left view** looks from the left: each row shows its tallest. The **top view** looks from above: every square with blocks is drawn, with the number of blocks written in it. {#s1e .explain}

::: html step1-2
s1cv: The three views of the same stack
:::

::: strings
s1ro: The front view has {fv} squares, the left view {lv}, the top view {tv}; the stack itself has {n} blocks.
:::

## Which lengths must agree between the three views? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Line up
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: LINE UP
:::

This step answers: how do the three views fit together? Three rules: **length aligned** (front and top views have the same width), **height level** (front and left views have the same height) and **width equal** (the top view’s depth equals the left view’s width). Drag “highlight column”: dashed lines link that column’s place in the three pictures. {#s2e .explain}

::: html step2-2
s2cv: Front view (top left), left view (top right), top view (bottom left) lined up
col: Column to highlight
:::

::: strings
s2ro: Column {c}: its stack is {fh} high in the front view; in the top view {tn} squares in this column have blocks; the tallest row in the left view is {lh} (the greatest height agrees: front {fm}, left {lm}).
:::

## If we only know the front and left views, is the stack determined? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Are two enough
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: ARE TWO ENOUGH
:::

This step answers: do two views rebuild the solid? With only the front and left views, each square can hold at most min(its column’s front height, its row’s left height) blocks; filling them all gives the “most” case. Press “Show the largest stack”: the orange blocks are extras beyond yours, and they leave the front and left views exactly the same. Adding the top view, which rules out empty squares, is what pins it down. {#s3e .explain}

::: html step3-2
s3cv: Your stack, and the largest stack under the same two views
showMax: Show / hide the largest stack
:::

::: strings
s3ro: You built {n} blocks; with only the front and left views there could be up to {mx} (that is {extra} more, with the same front and left views); with the top view’s footprint as well, up to {mt}.
s3roNone: In your stack the front and left views already fix every block (the most possible is {mx} = the {n} you built), so there are no extras. Try the “L-shape” preset.
:::

## Given three views, which solid matches? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Pick the solid
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: PICK THE SOLID
:::

This step answers: can we recognise a solid from its three views? Above are the three views of some solid; below, A, B and C are three solids and only one has exactly the same three views. Read the column heights in the front view first, then the left view, and use the top view’s footprint to confirm; choose one and check. {#s4e .explain}

::: html step4-2
s4cv: The target three views and three candidate solids
chA: Choose A
chB: Choose B
chC: Choose C
check: Check
next: Another one
:::

::: strings
s4roAsk: Choose a solid, then press “Check”.
s4roOk: Correct: the three views of {x} match the target exactly.
s4roNo: Not right: the {what} of your {y} differs from the target. The right one is {x}.
whatF: front view
whatL: left view
whatT: top view
:::

## To paint this stack, how many faces must be painted? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how can the idea of views help count surface? Each block has 6 faces; two blocks touching hide 1 face each. So the faces showing = 6 × blocks − 2 × touching places. Change the shape with the presets above and see how the surface changes with the stacking. {#s5e .explain}

::: html step5-2
s5cv: Blocks and their surface
recapTitle: Recap
recap1: The front view shows each column’s tallest stack, the left view each row’s tallest, the top view which squares have blocks.
recap2: Length aligned, height level, width equal; two views often do not fix the solid, so a third is needed.
recap3: Counting blocks and counting surface both come from “how many blocks, how many touching places”.
modelTitle: Scope and limits of this model
modelText: Only 3 × 3 squares with up to 3 blocks each are handled, all blocks are identical cubes, and none float. The 3D picture is an isometric approximation, not a true perspective drawing.
linkSym: → Symmetry & Rotation: turning a solid shows different faces
linkPer: → Perimeter vs Area: counting faces and area
linkCoord: → Coordinate Plane: describing positions with (x, y)
:::

Page complete. {#done .readout .success i18n=text}

::: strings
front: Front view
left: Left view
top: Top view
s5ro: {n} blocks, {sh} touching places; faces showing = 6 × {n} − 2 × {sh} = {sf} (of which {bt} are bottom faces; leaving the bottom unpainted leaves {pt} to paint).
docTitle: Three Views · Three Shadows Rebuild a Solid
:::
