---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Vectors · Quantities With a Direction
tagline: Combining forces is joining arrows head to tail; in coordinates, addition just adds the components; the dot product turns two arrows’ “projection” into a number.
:::

## How do two numbers describe one arrow? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Arrows and components
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Size plus direction
:::

This step asks: how do we describe “go this far in that direction” with numbers? A **vector** has both size and direction and is drawn as an arrow. Put its start at the origin; the coordinates (aₓ, a_y) of its tip are its **components**: go aₓ to the right and a_y up. Its length (the **magnitude**) comes from Pythagoras, |a| = √(aₓ² + a_y²), and its direction is the angle from the positive x-axis. **What to do:** drag the two components: the orange arrow changes, with cyan and green dashes for the horizontal and vertical parts; the readout gives the magnitude and direction angle. The same arrow can be moved without change as long as its size and direction stay the same. {#s0e .explain}

::: html step0-2
s0cv: The orange arrow a with its horizontal (cyan) and vertical (green) components
axL: Horizontal component aₓ of a
ayL: Vertical component a_y of a
:::

## Combine two vectors: which arrow is the result? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Adding vectors
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Head to tail
:::

This step asks: what does adding two vectors mean? Put the start of b at the end of a (**head to tail**); the arrow from the start of a to the end of b is a + b (green). It can also be drawn as a parallelogram with the same result. With coordinates it is simpler: a + b = (aₓ + bₓ, a_y + b_y), component by component. **What to do:** drag the components of a and b: the green arrow and the coordinates in the readout always agree; the triangle inequality |a+b| ≤ |a| + |b| always holds, with equality only when the arrows point the same way. This is exactly how several forces are combined (see the net force in [[newton-laws#step2|Newton’s laws]]). {#s1e .explain}

::: html step1-2
s1cv: Head to tail: a (cyan) followed by b (orange), the sum a + b (green); dashes complete the parallelogram
bxL: Horizontal component bₓ of b
byL: Vertical component b_y of b
:::

::: strings
s0ro: a = ({x}, {y}): magnitude |a| = √({x}² + {y}²) = {m}; direction angle {an}°.
yes: holds
no: fails
s1ro: a = ({ax}, {ay}), b = ({bx}, {by}): a + b = ({cx}, {cy}), |a+b| = {m}; |a| + |b| = {tri}, |a+b| ≤ |a|+|b| {cmp}.
:::

## What does it mean to multiply a vector by a number, or subtract two vectors? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Scaling and subtracting
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Stretch, reverse, subtract
:::

This step asks: what else can be done with vectors? **Scalar multiplication** k·a: the arrow’s length becomes |k| times as long; k &gt; 0 keeps the direction, k &lt; 0 reverses it, k = 0 gives the zero vector. **Subtraction** a − b is a + (−b): reverse b and add; the result is the arrow from the end of b to the end of a (the purple dashes show −b attached). Here a and b are the vectors set with the sliders in the previous step. **What to do:** drag k: the orange arrow stretches along a’s line and flips to the opposite direction when k is negative; the green a − b has components subtracted one by one. {#s2e .explain}

::: html step2-2
s2cv: a (cyan), k·a (orange), b (violet) and a − b (green)
:::

Here a and b are the vectors set with the sliders in the previous step. {#keepAB .note i18n=text}

::: html step2-3
kL: Scalar k
:::

::: strings
same: same direction as a
opposite: opposite to a
zeroV: the zero vector
s2ro: k = {k}: k·a = ({kx}, {ky}), length {m} (length of a {ma}, {dir}); a − b = ({dx}, {dy}).
:::

## Why does the dot product tell you whether the angle is acute or obtuse? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 The dot product
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: How alike two arrows are
:::

This step asks: how can two vectors be turned into one number reflecting how much they point the same way? The **dot product** a·b = |a||b|cosθ (θ is the angle between them) is aₓbₓ + a_yb_y in coordinates. It equals the length of the **projection** of b onto a (the thick green line) times |a|. It is positive for an angle below 90°, zero at 90° (**perpendicular**) and negative above 90°. Here a = (4, 0), |b| = 3 and only the angle changes. **What to do:** drag the angle: the green projection shrinks, vanishes at 90° (perpendicular) and then turns negative; the dot product computed by the two formulas in the readout is identical. {#s3e .explain}

::: html step3-2
s3cv: Fixed a (cyan), a rotating b (orange) and the projection of b onto a (green)
angL: Angle θ between a and b (°)
:::

::: strings
projLab: projection
acute: acute angle, positive dot product
perp: perpendicular, dot product 0
obtuse: obtuse angle, negative dot product
s3ro: θ = {ang}°: a·b = |a||b|cosθ = {mm}; by coordinates aₓbₓ + a_yb_y = {comp}; the projection of b on a has coordinate {p}. {kind}.
:::

## A weight hangs from two ropes: how much pull does each rope carry? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Forces on a rope
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Solving with vectors
:::

This step asks: how do we find the forces at equilibrium with vectors? The weight feels three forces: gravity W downward and the two rope tensions T₁, T₂ (each along its rope). **Equilibrium** means the net force is zero: T₁ + T₂ + W = 0, so the three arrows joined head to tail close into a triangle (small picture at top right). Horizontally the two ropes’ components cancel; vertically they add up to W, i.e. 2T·sinθ = W, so T = W/(2 sinθ). **What to do:** drag the rope angle θ from the horizontal: the flatter the rope, the larger the tension — as θ approaches 0 the tension grows without limit, which is why a rope can never be pulled perfectly horizontal; the readout checks that the horizontal and vertical net forces are 0. {#s4e .explain}

::: html step4-2
s4cv: Three forces T₁ (cyan), T₂ (orange), W (red) on one point; the small picture shows them closing into a triangle
wtL: Weight of the load W (N)
thL: Angle θ of each rope above the horizontal (°)
:::

::: strings
closed: head to tail, closed
flat: the angle is small and the tension far exceeds the weight
normal: ordinary angle
s4ro: W = {W} N, θ = {th}°: each rope carries T = W/(2 sinθ) = {T} N ({ratio} times W); horizontal net force {sx} N, vertical net force {sy} N (both should be 0). {note}.
:::

## How can a boat cross a river straight without being swept downstream? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Crossing a river
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Relative velocity
:::

This step asks: how do you work out the boat’s actual velocity? The boat’s velocity relative to the water (4 m/s, orange) plus the water’s velocity (2 m/s to the right, cyan) gives the velocity relative to the bank (green): v_actual = v_boat + v_water — vector addition. θ is the angle between the boat’s heading and the line perpendicular to the bank, positive toward upstream. The river is 60 m wide. **What to do:** drag θ: at θ = 0 (heading straight across) the green arrow leans right and the boat lands downstream; aim upstream, and when sinθ = v_water/v_boat = 0.5 (θ = 30°) the horizontal parts cancel and the boat goes straight across, though it takes longer; beyond 30° it is pushed upstream. The readout gives the crossing time and how far it is swept. {#s5e .explain}

::: html step5-2
s5cv: The river (blue), the boat’s velocity relative to the water (orange), the current (cyan) and the actual velocity over the bank (green)
hdL: Angle θ of the heading from the perpendicular (°, upstream positive)
recapTitle: Recap
recap1: A vector has size and direction, written by components (x, y); magnitude √(x²+y²); head-to-tail addition is component-wise addition.
recap2: Scaling stretches or reverses, subtraction adds the opposite; the dot product a·b = |a||b|cosθ = aₓbₓ + a_yb_y tells acute, perpendicular or obtuse.
recap3: Force balance is zero net force (a closed triangle); relative velocity is vector addition: v_actual = v_boat + v_water.
modelTitle: Scope and limits of this model
modelText: Scope: vectors in a plane with Cartesian coordinates; rope mass ignored, ropes symmetric (same angle), static equilibrium; in the river model the current is uniform and the boat speed constant; only two-dimensional pictures are drawn, without three-dimensional vectors or the cross product.
link1: → Linear transformations: a matrix reshapes vectors
link2: → Newton’s laws: net force decides acceleration
link3: → Projectiles and circles: velocity split into horizontal and vertical parts
:::

Page complete. {#done .readout .success i18n=text}

::: strings
current: current {c} m/s →
far: far bank
lblBoat: heading
lblActual: actual track
drift: drift {d} m
s5ro: Boat speed {s} m/s, water {c} m/s, θ = {hd}°: actual velocity ({vx}, {vy}) m/s, speed {sp} m/s; crossing {wd} m takes {t} s and sweeps it {d} m downstream (negative means upstream).
s5roNo: At θ = {hd}° the boat’s upward speed is zero or negative, so it never reaches the far bank.
docTitle: Vectors · Quantities With a Direction
:::
