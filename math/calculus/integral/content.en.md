---
lang: en
---

::: strings
docTitle: The Definite Integral · Slice Thin, Add Up — One Interaction at a Time
back: ← Knowledge Index
pageTitle: The Definite Integral
tagline: The area under a curve has no ready-made formula — so how can its exact value be computed? Slice the region into ever thinner rectangles and add them up: the thinner the slices, the closer the sum, and the number it closes in on is the definite integral. It is the exact inverse of the derivative.
foot: The Definite Integral · One Interaction at a Time
navLabel: Step navigation
nav0: 0 No Formula for a Curved Edge
nav1: 1 Riemann Sums: Slice and Add
nav2: 2 Integration Is Accumulation
nav3: 3 Meeting the Derivative
nav4: 4 Quiz
nav5: 5 Finale
:::

## No formula for a curved edge: estimates only, and they disagree {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: Question: what exactly is the area of the curved region under y = x² on [0, 1]? The horizontal axis is x (0 to 1), the vertical axis is y, and the region's top edge is a bending parabola, not a straight line. You know the formulas for rectangles, triangles and trapezoids, but all of them have straight top edges, so on a curved edge they can only estimate. Open the four crude estimates below one by one and look at the numbers they give: different method, different answer. Which one is exact? Not revealed yet — what we need is a method that sharpens itself.
canvasLabel: Interactive figure for this step; instructions appear above
estRight: Big rectangle (right-end height)
estTrap: Trapezoid (join the endpoints)
estTri: Triangle (base × height ÷ 2)
estLeft: Big rectangle (left-end height)
:::

::: strings
s0ro: The current estimate “{name}” gives area ≈ {v}.
s0note: The four methods give four different numbers — 1, 0.5, 0.5 and 0: some clearly too big, some clearly too small, and none can say where the true value sits. What is missing is not a cleverer formula but a way to get sharper by slicing — next step.
:::

## Riemann sums: slice thin, add them up {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: Question: how can an estimate sharpen itself? Split [0, 1] into n equal thin rectangles (this “slice and sum” is called a Riemann sum). Each strip has width 1/n, and its height is the function value at one chosen point of the strip: left endpoint, right endpoint, or midpoint — three sampling rules. Drag n from 1 to 32 and watch the total as the strips thin out; then switch the sampling rule and compare how fast each closes in. Every sum in the readouts is computed strip by strip as height × width and checked against the closed-form formula.
nLab: Number of strips n (each slider notch doubles it)
modeL: Left endpoints
modeM: Midpoints
modeR: Right endpoints
reset: Reset this step
bracketTitle: Squeezed from both sides: the gap narrows with n (axis = area value)
s1conc: Push n to 32: left and right sums both hug 1/3 ≈ 0.3333. The number both sides close in on in the limit is the exact area, written as the definite integral ∫₀¹ x² dx = 1/3. In the notation, ∫ is an elongated S (for sum), dx is the width of one strip as it shrinks toward 0, and a, b at the bottom and top of ∫ say “accumulate from a to b”. The sampling rule only changes how fast you close in (midpoints are usually fastest), never the number you close in on.
:::

::: strings
s1ro: n = {n}, {mode}: strip-by-strip total = {sum} (closed-form check: {closed} — match).
s1bracket: At the same n: left sum L = {L} < true value 1/3 < right sum R = {R} — the two trap the truth between them; the gap R − L = {gap}, exactly 1/n. Each doubling of n roughly halves the gap.
s1zero: Note: with n = 1 and the left-endpoint rule, the single strip takes its height at the left end, f(0) = 0, so it has no height and hugs the axis, invisible — the figure is not broken. Its area is exactly the left sum L = 0; switch to the right-endpoint rule, or look at the R end of the squeeze bar below, to see the strip from the other side.
:::

## Same machine, a v–t story: an integral accumulates {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Question: what else can integration accumulate? Use velocity v=t (vertical axis m/s, horizontal time t in s; 0≤t≤2). Velocity is nonnegative here, so displacement and distance coincide. Each sampled velocity times its strip width gives an approximate contribution; the sum approaches2m. A sampled height need not equal the exact average velocity on that strip. <a class="fourier-link" href="../../../physics/mechanics/velocity-vt/#step2">Revisit the existing v–t slicing example →</a> Change n and the sampling rule to compare approximations.
s2bridge: Watch the same slicing rule change units: height × width gives area, while velocity × time-width gives distance; the accumulation is the same.
s2conc: In general, for a≤b, ∫v dt gives displacement x(b)−x(a); ∫|v| dt gives distance. They coincide here because v≥0. With negative velocities, signed contributions can cancel. <a class="fourier-link" href="../../../atlas/?trail=travel&node=integral">Try a return trip: back at the start with nonzero distance →</a>
:::

::: strings
s2ro: n = {n}, {mode}: summing “speed × time” strip by strip ≈ {sum} m. The exact value is 2 m (the whole triangle ½ × 2 × 2 = 2).
:::

## The area function A(x): integrating means finding an antiderivative {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Question: at n = 32 the sum is still slightly off — how is the exact 1/3 “computed” without counting strips? Write A(x) for “the area accumulated from 0 to x”, the area function: the shaded region in the left figure is A(x), and the right figure is the curve it traces as x grows. A function whose derivative is exactly x² is called an antiderivative of x² (the inverse problem of differentiating). Drag the x probe and compare the two readouts: the value of A, and how fast A is growing at that point, A′(x). The A curve on the right is traced by accumulating 400 fine strips — a schematic sketch; the readouts use the exact values from the antiderivative, and the two are labelled separately.
s3bridge: Drag x while watching both: A(x) is how much has accumulated, A′(x) is how fast it accumulates now; the latter should match x².
aCurveNote: Right: the A(x) curve (fine-strip traced sketch)
xLab: Accumulation endpoint x
s3conc: Since A(x) = x³/3 has derivative exactly x², no infinite counting is needed: ∫₀¹ x² dx = A(1) − A(0) = 1/3 − 0 = 1/3. This formula is the Newton–Leibniz formula, the Fundamental Theorem of Calculus: a definite integral = the difference of an antiderivative at the two endpoints; integration and differentiation undo each other.
:::

::: strings
s3roA: x = {x}: the antiderivative A(x) = x³/3 gives the exact area A = {A}. The traced curve on the right is a fine-strip schematic and may sit slightly off the exact curve; the readouts follow the antiderivative.
s3roB: A grows at the rate A′(x) ≈ {Ap} at this point; the original curve's height there is x² = {f}. They are equal: the accumulation grows exactly at the rate of the height being accumulated.
:::

## Quiz: three questions {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: Question: can you use the three moves — geometry, squeezing, and the inverse operation? Answer each question; a wrong pick can be re-picked, and changing parameters in other steps will not wipe your answers here.
s4bridge: Recall the three routes: geometry estimates, squeezing narrows the error, and an antiderivative computes the same accumulation exactly.
q1t: Q1: ∫₀² x dx = ? (Hint: the region under y = x on [0, 2] is exactly a triangle of base 2 and height 2.)
q2t: Q2: Slicing y = x² on [0, 1] into n = 4 strips gives left sum L₄ = 0.21875 and right sum R₄ = 0.46875. Which is bigger, and where is the true value?
q2a: The left sum is bigger
q2b: The right sum is bigger, and the true value 1/3 is trapped between them
q2c: The two sums are equal
q3t: Q3: True or false — “A definite integral always computes an area.”
judgeT: True
judgeF: False
:::

::: strings
q1ok: ✓ Correct. Triangle area ½ × 2 × 2 = 2: a definite integral can sometimes be read straight off the geometry, no slicing needed.
q1no: ✗ Think again: under the line is a triangle of base 2 and height 2; its area = ½ × base × height.
q2ok: ✓ Correct. The curve keeps rising, so every strip's right end is higher than its left end and the right sum stays on top; the true value 1/3 is trapped between the two, and the trap narrows as n grows.
q2no: ✗ Look back at the n = 4 readout in step 1: on a rising curve each strip's right end beats its left end, so the right sum is bigger and the truth is trapped in between.
q3ok: ✓ The statement is false: a definite integral accumulates signed contributions. Over forward time, ∫v dt gives displacement; ∫|v| dt gives distance. Contributions below the axis count negatively in the signed integral.
q3no: ✗ A definite integral is a signed accumulation. Over forward time, ∫v dt gives displacement and ∫|v| dt gives distance. Negative contributions cannot all be treated as positive area.
score: Answered {n}; correct {k}.
:::

## Finale: adding countless small pieces back into a whole {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Step 5 · Finale
s5e: Question: what are this page's three moves, and where do they lead? The skeleton of the definite integral is just three sentences: slice and add, squeeze to the limit from both sides, and integrate by finding an antiderivative. It is the other face of the derivative: the derivative shrinks a whole down to a point to read change; the integral accumulates points back into a whole.
c1t: Slice and add
c1b: A quantity with no formula is first cut into many regular small pieces (rectangular strips); each piece is height × width, and the pieces are added one by one — that is a Riemann sum.
c2t: Squeeze to the limit
c2b: The left sum traps the true value from below, the right sum from above; the gap is exactly 1/n and narrows as n grows. The single number both sides close in on in the limit is the definite integral.
c3t: Integrate = find an antiderivative
c3b: No infinite counting needed: find an antiderivative A whose derivative is the integrand, and the definite integral is A(b) − A(a). Integration and differentiation undo each other (the Fundamental Theorem of Calculus).
linkDeriv: Step 2 of the derivative page: every point has its own derivative — there, the slope at every point is collected into a derivative function; the antiderivative this page hunts for is exactly its inverse problem →
linkVt: v–t step2: this nonnegative-velocity example has equal displacement and distance →
s5fore: Two more directions are queued beyond this page (no dedicated page yet): spin a plane region around an axis and accumulate thin cylindrical shells into a volume (solids of revolution); accumulate the area under a probability density curve into a probability. The skeleton stays the same sentence: slice thin, compute each piece, add them up.
:::
