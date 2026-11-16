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
pageTitle: Solid Geometry · Turn It, Then Cut It
tagline: View a cube from different angles, then slice it with a plane and watch the cross-section go from triangle to hexagon; see how surface area and volume scale and whether a net folds back into a cube.
:::

## Count vertices, edges and faces: what do you notice? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Points, lines, faces
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: The skeleton of a solid
:::

This step asks: is there a common pattern in a solid’s “skeleton”? A **vertex** (V) is a point where edges meet, an **edge** (E) is a segment where two faces meet, and a **face** (F) is a flat piece. Pick a solid and drag the two sliders to view it from different directions (left–right, up–down, so you can see its “back”). **What to do:** a cube has V = 8, E = 12, F = 6; a square pyramid 5, 8, 5; a triangular prism 6, 9, 5. The readout computes V − E + F, which is 2 for all three — **Euler’s formula**, true for convex polyhedra without holes. {#s0e .explain}

::: html step0-2
s0cv: A translucent solid: cyan lines are edges, the sliders change the viewing direction
n_cube: Cube
n_pyr: Square pyramid
n_prism: Triangular prism
yawL: Turn left–right (°)
pitchL: Tilt up–down (°)
:::

::: strings
s0ro: {name}: V = {V}, E = {E}, F = {F}; V − E + F = {euler}.
:::

## Scale length, width and height by k: what happens to surface area and volume? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Surface area and volume
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Doubling the size
:::

This step asks: how do area and volume change when a solid is scaled up? A cuboid’s **volume** is V = length × width × height and its **surface area** is S = 2(lw + lh + wh). If every dimension is scaled by k, each area is a product of two lengths so S grows by k²; the volume is a product of three lengths so V grows by k³. In the chart on the right, violet and orange bars are the original and scaled surface areas S and S′, and cyan and green are the original and scaled volumes V and V′. **What to do:** change the dimensions, then drag the scale factor k: at k = 2, S′ = 4S and V′ = 8V. This is why big animals shed heat less easily than small ones: volume grows faster than surface. {#s1e .explain}

::: html step1-2
s1cv: Left: the cuboid; right: surface area (violet → orange) and volume (cyan → green) before and after scaling by k
lL: Length
wL: Width
hL: Height
kL: Scale factor k
:::

::: strings
boxTitle: length {l} × width {w} × height {h}
s1ro: {l}×{w}×{h}: S = {A0}, V = {V0}; scaled by k = {k}, S′ = {A} ({ra} times, k² = {k2}) and V′ = {V} ({rv} times, k³ = {k3}).
:::

## Cut once: what shape is the cut face? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One slice
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Slicing a cube with a plane
:::

This step asks: what shapes can a plane cut out of a cube? A **cross-section** is the flat figure where a plane meets a solid. Three ways to cut: parallel to a face (always a square), slanting through along an edge (a rectangle), and perpendicular to a space diagonal (a small triangle at a corner, growing larger and becoming a **regular hexagon** in the middle, then shrinking back to a small triangle at the far end). The orange region is the section and the “position” slider pushes the plane along its normal from one end to the other. **What to do:** pick the space-diagonal cut and move the position slowly: the number of sides goes 3 → 6 → 3, and the area peaks at the midpoint (about 1.299). {#s2e .explain}

::: html step2-2
s2cv: The cube and the section made by a plane (orange): drag the position and the shape changes
plF: Parallel to a face
plD: Slanted along an edge (normal (1,1,0))
plB: Perpendicular to the space diagonal (normal (1,1,1))
posL: Position of the plane (0 to 1)
:::

::: strings
sideName: {n} sides: {name}
noSec: the plane just grazes the cube, no area
sh_none: none
sh_tri: triangle
sh_square: square
sh_rect: rectangle
sh_quad: general quadrilateral
sh_pent: pentagon
sh_hex: hexagon
sh_hexReg: regular hexagon
sh_other: other
s2ro: Normal ({nx}, {ny}, {nz}), position {pos}: the section has {sides} sides ({name}) and area {area}.
:::

## How many sides can a section of a cube have, and which counts occur? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 How many sides can it have
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: More ways to cut
:::

This step asks: how many sides can a plane section of a cube have? A cube has 6 faces and each face contributes at most one edge to the section, so at most 6 sides. Two sliders turn the plane’s direction (normal (nₓ, n_y, 1)) and a third pushes its position. **What to do:** try to find a **triangle, quadrilateral, pentagon and hexagon**: the four boxes at the bottom light up as you find each (only positions away from the two ends count). The pentagon is the hardest to meet: the plane must be tilted but not too near any corner. “Clear” starts the search again. {#s3e .explain}

::: html step3-2
s3cv: Cutting a cube with a tilted plane: the four boxes below record the side counts you have found
clearFound: Clear the record
nxL: x component of the normal
nyL: y component of the normal
:::

::: strings
sidesK: {k} sides
s3ro: Normal ({nx}, {ny}, 1), position {pos}: {sides} sides ({name}); found {got}/{tot}: {list}.
:::

## Why is a pyramid’s volume one third of base area times height? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Volume of a pyramid
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Where volume comes from
:::

This step asks: how do we get the volume of a pyramid? Cut the pyramid into k thin slices along its height and treat each slice as a thin block: the farther from the tip (the closer to the base) the larger the cross-section; at height y the section is a square of side (1 − y/H), area (1 − y/H)² (a 1×1 square base and height H). Adding “area × thickness” over the slices estimates the volume. **What to do:** raise the number of slices k: the blue staircase hugs the orange curve ever more closely and the estimate approaches H/3; at k = 50 it is almost exact. So a pyramid holds a third of the prism with the same base and height. {#s4e .explain}

::: html step4-2
s4cv: Left: cross-section area of each slice (blue staircase) and the exact curve (orange); right: sketch of the pyramid
slicesL: Number of slices k
heightL: Pyramid height H
:::

::: strings
areaAxis: cross-section area
heightAxis: height
pyrLab: base 1×1, height H
s4ro: k = {k} slices, H = {H}: estimated volume {est}; exact H/3 = {exact}; error {err}; the prism of the same base and height has volume {box}, the estimate is {ratio} of it.
:::

## Does this net fold into a cube? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Nets
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Nets
:::

This step asks: how can you tell whether a flat figure is a net of a cube? A cube net is six connected squares. A test: imagine rolling a cube across the grid; whenever it lands on a new cell its bottom face is printed on that cell. If the six cells receive six different faces the net folds into a cube; if two cells get the same face (or a face is never printed) it does not. A cube has exactly 11 different nets. **What to do:** look at the net, choose “folds” or “does not fold” and press Check; “Next net” shows another and “Start over” zeroes the score. {#s5e .explain}

::: html step5-2
s5cv: A figure of six squares: does it fold into a cube?
foldYes: Folds into a cube
foldNo: Does not fold
chk5: Check
nx5: Next net
rs5: Start over
recapTitle: Recap
recap1: A solid is made of vertices, edges and faces, and convex polyhedra satisfy V − E + F = 2; scaling by k multiplies surface area by k² and volume by k³.
recap2: A plane section of a cube has 3, 4, 5 or 6 sides; perpendicular to the space diagonal it goes triangle → regular hexagon → triangle from end to end.
recap3: A pyramid’s volume is one third of the prism with the same base and height (visible by adding slices); whether a net folds into a cube can be tested by “rolling and printing”.
modelTitle: Scope and limits of this model
modelText: Scope: convex solids, orthographic projection (no perspective), exact intersection points for the plane section of a cube; the volume estimate is a midpoint slicing approximation; the net test is rolling and only applies to six-square figures; Euler’s formula is shown only for convex polyhedra without holes. The 3D on screen is a 2D projection and the translucency is only a sketch.
link1: → Three views: looking at a solid from front, side and top
link2: → Pythagoras: how the space diagonal’s length is found
link3: → Perimeter and area: how two dimensions “square up”
:::

Page complete. {#done .readout .success i18n=text}

::: strings
whyYes: after rolling, the six cells received six different faces, so it folds into a cube
whyNo: after rolling some cell got a face that was already printed (or the cells form a 2×3 block or too long a row), so it does not fold into a cube
s5ro: Net {n}: choose an answer, then check. Score {score}/{tot}.
s5roOk: Correct: {why}. Score {score}/{tot}.
s5roNo: Not quite: {why}. Score {score}/{tot}.
docTitle: Solid Geometry · Turn It, Then Cut It
:::
