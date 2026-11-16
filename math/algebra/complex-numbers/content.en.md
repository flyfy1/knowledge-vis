---
lang: en
---

::: strings
docTitle: Complex Numbers · Multiplying by i Is a 90° Turn — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Complex Numbers · Multiplication Is Rotation Plus Scaling
tagline: In the textbook, i drops out of the sky: “define i² = −1”. You memorise it, you can compute with it, but you never learn what it is. This page tells it differently: first bring numbers back from a line onto a plane — a complex number (a number of the form a + bi, with a and b real) is a point on the plane, an arrow; addition slides the arrow, multiplication rotates and scales it. Then i² = −1 needs no memorising: multiplying by i is a 90° turn, and two turns point you exactly at −1. Every modulus, argument, sum and product on this page is computed on the spot from (a, b) alone — picture and readout share one source.
foot: visual.integ.life · Complex Numbers —— one interaction at a time
:::

## The Number Line Is Not Enough: Where Does the Solution of x² = −1 Stand? {#step0 h2=s0t}

::: strings
nav0: 0 The Line Is Not Enough
:::

Step 0 · The Number Line Is Not Enough {#s0k .step-kicker i18n=text}

This step answers one question: **the solution of x² = −1 — where does it stand?** You already know: the real numbers fill a single line, and every real square is ≥ 0 — positive squared is positive, negative squared is positive, 0 squared is 0. The probe below lets you check by hand: drag x along the line and the trace above draws every value x² can take; it hugs the region above the line yet never reaches the −1 line. It is not hiding — there is simply no room for it on this line. {#s0e .explain}

::: html step0-1
s0xLab: Square probe x (drag along the line)
s0open: Stand the line up as one edge: unfold the plane ⤢
:::

Conclusion: x² = −1 has no real solution — what is missing is not a number but a **dimension**. Add a perpendicular axis to the line and numbers graduate from “points on a line” to “points on a plane”; the unit on the new axis is written **i**. For now just one promise: on this page i² = −1 becomes something you can see, not something you memorise. {#s0conc .readout}

Why a whole new axis, and not just one extra point? Because numbers must stay computable: the new point added to, and multiplied by, the old reals must have somewhere to land — only a whole plane holds the entire new number system. Next stop: learn to read “a point on the plane” fluently. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0close: Fold the plane away ↩
s0ro: Probe x = {x}: x² = <b>{sq}</b> ≥ 0. Drag x from negative to positive and the square traces a parabola whose lowest point is 0 — a whole unreachable gap away from −1.
s0roB: The plane is unfolded: the horizontal axis is still the original **real axis**; the newly raised one is the **imaginary axis**, and together they span the **complex plane**. The point one unit above the origin is the candidate to be claimed: this page now adopts it as i, and verifies step by step that its square really is −1 (the reveal is in Step 3).
cSq: the trace of y = x²
cNeg: −1: squares never reach it
cClaim: ? the point to be claimed
cAxisX: number line (reals)
cRe: real axis Re
cIm: imag axis Im
:::

## A Complex Number Is a Point: Pin It by (a, b), or by (Modulus, Argument) {#step1 h2=s1t}

::: strings
nav1: 1 Points & Arrows
:::

Step 1 · A Point on the Complex Plane {#s1k .step-kicker i18n=text}

This step answers: **how many numbers does it take to pin down one complex number?** The picture is a complex plane: horizontal real axis, vertical imaginary axis. Drag the point z and all four readouts are computed live from its coordinates (a, b): a is the **real part**, b is the **imaginary part** (mind this: the imaginary part is the real number b itself, without the i), written z = a + bi; the arrow from the origin to z has length called the **modulus** |z| — the hypotenuse of Pythagoras’ theorem; the angle from the positive real axis, measured counter-clockwise, is the **argument** θ. Arguments have many equivalent writings; this page always uses the **principal value**: the one normalised into (−180°, 180°]. {#s1e .explain}

Try three presets in order: see 3+4i produce length 5 from its coordinates; then see a pure real number keep only direction 0°/180°; finally see a unit-circle point keep length 1 while its direction changes. This connects coordinate form with length-plus-direction form. {#s1bridge .hint i18n=text}

::: html step1-1
editTitle: Coordinate entry · keyboard or numbers
editHelp: Enter finite coordinates. Tab moves between controls; ↑/↓ changes only the draft by0.1. Enter or Apply updates the plot. As with dragging, coordinates snap to a0.1 grid before the drawing limit below is applied. The readouts show the actual applied values.
editRange1: Drawing range: each component is clipped to−5…5. This limits the drawing, not complex numbers themselves.
editReal: Real part Re
editImag: Imaginary part Im (without i)
editApply: Apply coordinates
s1preLab: Preset tour:
s1pA: 3 + 4i
s1pB: −4 (pure real)
s1pC: 3i (pure imaginary)
s1pD: On the unit circle · 50°
:::

Conclusion: there are two ways to pin the point — coordinates (a, b), or (modulus, argument). They are **two readings of the same arrow**: one says “how far right, how far up”, the other says “how long, pointing which way”. Addition next door reads most naturally in the first; multiplication will need the second — get fluent in both. {#s1conc .readout}

Check the boundaries one by one: drag the point onto the negative real axis and the argument reads +180°, not −180° — the right end of the principal interval is closed. On the unit circle (the dashed ring) the modulus stays 1 and only the angle moves; there the arrow tip’s coordinates are exactly (cos θ, sin θ) — that reading is established in [[trigonometry#step1|Step 1 of the trigonometry page]]. {#s1hint .hint}

::: strings
s1ro: z ≈ <b>{z}</b>: real part a ≈ <span>{a}</span>, imaginary part b ≈ <span>{b}</span>; modulus |z| = √(a² + b²) ≈ <b>{m}</b> (computed by Pythagoras); argument θ ≈ <b>{ang}</b> (counter-clockwise from the positive real axis). Displayed numbers are rounded after calculation from unrounded coordinates.
s1roOrigin: z = <b>0</b>: real part a = 0, imaginary part b = 0; modulus |z| = <b>0</b>; argument <b>— (the origin has no argument)</b> — the arrow has shrunk to a point and there is no direction to measure. Anywhere on this page, a point of modulus 0 is read this way.
cUnit: unit circle
:::

## Addition = Sliding: the Sum’s Coordinates Are the Two Sides Added Separately {#step2 h2=s2t}

::: strings
nav2: 2 Addition Slides
:::

Step 2 · Addition {#s2k .step-kicker i18n=text}

This step answers: **when two complex numbers are added, what actually moves in the picture?** Two draggable arrows z₁ and z₂ are on stage; the green arrow is their sum z₁ + z₂, drawn by the **parallelogram rule** (span a parallelogram with z₁, z₂ as adjacent sides and the diagonal is the sum; equivalently, attach z₂’s arrow head-to-tail at z₁’s tip — same landing point). Drag either arrow and the three check rows below verify, row by row, that the sum’s real and imaginary parts are exactly the two sides added separately. {#s2e .explain}

::: html step2-1
editRange2: Drawing range: each input component is clipped to−4.2…4.2; their sum is still calculated from the two numbers. This is a drawing limit only.
editTarget: Complex number to edit
editFirst: z₁ · first number
editSecond: z₂ · second number
:::

Conclusion: adding z₂ **slides** the whole picture along z₂’s arrow by exactly that much; the sum’s horizontal and vertical coordinates are the two sides added separately. It is the same thing as vector addition — complex addition = component-wise addition = translation, and it holds for addition only. {#s2conc .readout}

Plant a contrast: multiplication is **not** component-wise. If (1 + i) × (1 + i) were multiplied component-wise you would get something odd like 1 + 1i; the true answer appears on the bench in Step 4 — multiplication moves modulus and angle, not components. {#s2hint .hint}

::: strings
editStepRange: A0.1 step cannot reliably adjust this value. Enter smaller coordinates, or apply finite coordinates directly.
s2roSum: z₁ = <span>{z1}</span>, z₂ = <span>{z2}</span>, z₁ + z₂ = <b>{sum}</b>
s2roRe: Real-part check: {a1} + {a2} = <b>{s}</b> ✓ (exactly the sum’s real part)
s2roIm: Imaginary-part check: {b1} + {b2} = <b>{s}</b> ✓ (exactly the sum’s imaginary part)
:::

## Multiply by i: Nothing Changes Except a 90° Turn {#step3 h2=s3t}

::: strings
nav3: 3 ×i Turns 90°
:::

Step 3 · Multiply by i {#s3k .step-kicker i18n=text}

This step answers: **what is i, itself?** Pick a starting point and keep pressing “× i”: each press turns the arrow 90° counter-clockwise — watch the readout: the modulus does not budge, the argument gains exactly +90° each time (wrapping back by the principal value past 180°). Landing points and arcs stay on stage the whole time; press four times and the arrow faces its original direction again. Below runs the unit-point tour: 1 → i → −1 → −i → 1, landings pinned one by one on the axes. {#s3e .explain}

::: html step3-1
s3startLab: Starting point z:
s3p1: 1 (the unit point)
s3p2: 3 + 2i
s3mul: × i (turn 90°)
s3reset: Reset ↺
:::

The verdict: **×i = a 90° counter-clockwise rotation**, so i² = two turns = an about-face = −1. **i² = −1 is turned into existence, not memorised into it.** “i is the notation for √−1” and “i is the action of turning 90°” are two faces of the same i: the first is its name, the second is its behaviour. {#s3conc .readout}

Switch the start to 3 + 2i and press four more times: the landings are off-axis, yet the modulus stays √13 throughout, the argument gains 90° each press, and the fourth press lands exactly back on (3, 2) — period 4 holds for every start, because four turns are one full turn. {#s3hint .hint}

::: strings
s3prog: Multiplied by i {k} times (every 4 turns restore the direction)
s3ro: Current z = <b>{z}</b>: modulus = <b>{m}</b> (identical before and after ×i); argument = <b>{ang}</b>.
s3back: A full turn: four 90° turns make 360°, and the arrow faces its starting direction again — the powers of i cycle with period 4.
s3pow: The unit-point tour (all computed by repeated multiplication): i¹ = <b>{p1}</b>, i² = <b>{p2}</b>, i³ = <b>{p3}</b>, i⁴ = <b>{p4}</b>. Watch where i² lands: two 90° turns from 1 are a 180° about-face, landing on −1.
:::

## General Multiplication = Moduli Multiply, Arguments Add: the Checking Bench {#step4 h2=s4t}

::: strings
nav4: 4 Multiplication Bench
:::

Step 4 · General Multiplication {#s4k .step-kicker i18n=text}

This step answers: **multiplying by an arbitrary complex number — what happens to modulus and to angle?** First verify the two halves separately: multiplying by a positive real (preset 2 below) only scales and never turns; multiplying by a number of modulus 1 only turns and never scales. An arbitrary multiplier z₂ stacks the two. Drag z₁ (the multiplicand) and z₂ (the multiplier); the green arrow is the product z₁·z₂. The bench below checks three groups, all computed live: the modulus check, the angle check, and an algebraic route (a₁a₂ − b₁b₂, a₁b₂ + b₁a₂) — two roads, one source, cross-verified. {#s4e .explain}

::: html step4-1
editRange4: Drawing range: each input number has modulus at most2.6. After snapping, a point outside the disk is scaled toward the origin to the boundary without changing its angle; the resulting components need not remain on the0.1 grid. This is a drawing limit only.
editTask4: Try setting both numbers to1+i using coordinates. Predict the product’s modulus and angle, then apply and compare the plot with the readouts.
s4z2Lab: Set the multiplier z₂ to a preset:
s4pA: 2 (pure real · scale only)
s4pB: Modulus 1 · 60° (rotate only)
s4pC: 1 + i (turn 45°, scale by √2)
:::

The symbolic identities are exact. Displayed components and moduli use up to2 decimal places; angles use up to1. Do not treat rounded operands as exact when recomputing. {#s4rounding .hint i18n=text}

::: html step4-2
:::

Conclusion: **the multiplication law — moduli multiply, arguments add**. Multiplying by a number scales you by its modulus and rotates you by its argument. Conditions, stated: after adding, angles must be normalised into the principal interval (340° and −20° are the same direction; this page writes −20°); if either factor is 0, the product is the origin and has no argument. {#s4conc .readout}

This bench keeps both points inside the disc of modulus ≤ 2.6 so the product stays in frame — the law itself holds for complex numbers of any size. Verify a group with preset 1 + i: with z₁ = 2 + i, the product’s argument should be exactly 45° more than before and its modulus exactly √2 times — the bench ticks both on the spot. {#s4hint .hint}

::: strings
editFinite: Enter a finite number in both fields. Empty or incomplete numbers do not change the plot.
editRange: These coordinates exceed this page’s numerical calculation range. Use smaller finite coordinates. The plot is unchanged.
editApplied: Updated {target} = {z}; the existing plot and readouts now agree.
editAdjusted: Applied snapping and drawing limits: {target} = {z}. The fields now show the actual coordinates.
editUnchanged: {target} is unchanged; its current exact coordinates are preserved.
s4roProd: z₁ ≈ <span>{z1}</span>, z₂ ≈ <span>{z2}</span> ⟹ z₁·z₂ ≈ <b>{prod}</b>
s4roMod: Modulus identity: |z₁z₂| = |z₁| × |z₂|. Displayed factor moduli: |z₁| ≈ {a}, |z₂| ≈ {b}. Multiplying unrounded values gives |z₁|·|z₂| ≈ <b>{p}</b>; computing the product’s modulus directly gives |z₁z₂| ≈ <b>{q}</b>.
s4roArg: Angle check: displayed θ₁ ≈ {a}, θ₂ ≈ {b}. Adding unrounded angles and normalising to the principal interval gives ≈ <b>{s}</b>; the product’s argument calculated directly is ≈ <b>{t}</b>.
s4roArgOrigin: Angle check: one side is the origin (modulus 0, no argument) — this row checks the modulus only, not the angle.
s4roAlg: Algebraic identity: (a₁a₂ − b₁b₂, a₁b₂ + b₁a₂). Displayed coordinates: a₁ ≈ {a1}, b₁ ≈ {b1}, a₂ ≈ {a2}, b₂ ≈ {b2}. Calculating from unrounded coordinates gives the product ≈ <b>{alg}</b>; the plot uses that same result.
:::

## Self-Test: Turn It Right, Checked on the Spot {#step5 h2=s5t}

::: strings
nav5: 5 Self-Test
:::

Step 5 · Self-Test {#s5k .step-kicker i18n=text}

All three verdicts come from the same live computation as the main text: landings from repeated multiplication, moduli from Pythagoras — no pre-written answer table. Get one right and it locks (dragging points in the main text afterwards will not wash the verdict away); get one wrong and the feedback diagnoses your exact wrong turn, and you may retry. {#s5e .explain}

Question 1 · Multiply by i twice {#q1t .quiz-t tag=h3 i18n=text}

z = 3 + 2i. Multiply by i twice (that is, z·i²) — where does it land? Turn it in your head first: 90° once, then 90° again. {#q1d .explain}

::: html step5-1
:::

Question 2 · Whose modulus is bigger {#q2t .quiz-t tag=h3 i18n=text}

|3 + 4i| versus |−4 + 3i| — which is bigger? Do not rush: both moduli are computed by Pythagoras; compute first, then compare. {#q2d .explain}

::: html step5-2
q2oA: 3 + 4i is bigger
q2oB: −4 + 3i is bigger
q2oC: They are equal
:::

Question 3 · True or false {#q3t .quiz-t tag=h3 i18n=text}

Judge this claim: “The modulus of a product equals the sum of the two moduli.” {#q3d .explain}

::: html step5-3
q3true: True
q3false: False
:::

::: strings
q1ok: ✓ Correct: two multiplications by i are a 180° about-face, and (3, 2) lands on <b>{z}</b>. Incidentally, this is exactly what z·i² = −z looks like geometrically.
q1noA: ✗ (−3, 2) only flips the sign of the real part — it is not the landing of any 90° turn: one turn sends (a, b) → (−b, a), landing on (−2, 3) with the two coordinates swapped; two turns are a 180° about-face, so both coordinates of (3, 2) flip sign together.
q1noB: ✗ (3, −2) only flips the sign of the imaginary part (a mirror flip across the real axis) — it is not a wrong-way turn either: one clockwise turn lands on (2, −3), and two clockwise turns give the same (−3, −2) as two counter-clockwise ones. ×i turns **counter-clockwise** by 90°: the coordinates swap and the new real part flips sign.
q1noC: ✗ That is the starting point itself: multiplying by i twice is not staying put — it is a 180° about-face, and both coordinates flip sign.
q2ok: ✓ Correct: |3 + 4i| = <b>{a}</b> and |−4 + 3i| = <b>{b}</b> — equal. The two points point in different directions yet sit at the same distance from the origin: the modulus sees length only, never direction.
q2no: ✗ Compute once more: |3 + 4i| = √(3² + 4²) = <b>{a}</b>; |−4 + 3i| = √((−4)² + 3²) = <b>{b}</b>. The minus sign vanishes inside the square — the modulus sees length only, never direction.
q3ok: ✓ Correct judgment — the claim is <b>false</b>: test it on the spot with a ready-made set of numbers — with z₁ = z₂ = 1 + i, |z₁|·|z₂| = <b>{prod}</b>, exactly |(1 + i)²| = |2i| = <b>{val}</b>; the “sum of moduli” would give <b>{sum}</b>, which does not match. The modulus of a product is the **product** of the moduli, not the sum. You can also drag your own group on the Step 4 bench to re-verify.
q3no: ✗ The claim is actually false. Test it with numbers on the spot: with z₁ = z₂ = 1 + i, the product’s modulus is <b>{val}</b>; the product of the moduli is <b>{prod}</b> and the sum of the moduli is <b>{sum}</b> — which one does the product’s modulus equal? Dragging a group on the Step 4 bench proves it yourself, too.
s5hint: The three, wrapped up: (1) multiplying by i twice is an about-face — both coordinates flip sign; (2) the modulus recognises length only: (3, 4) and (−4, 3) are the same Pythagorean pair, swapped and sign-flipped, both of modulus 5; (3) moduli multiply, arguments add — the “sum” lives on the angle side only; on the modulus side it is always a product.
:::

## Finale: One Plane, Two Operations {#step6 h2=s6t}

::: strings
nav6: 6 Finale
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Complex numbers are not a rule to memorise — they are the arithmetic that grows naturally once numbers are put back on the plane. Three closing cards: {#s6e .explain}

::: html step6-1
c1h: A complex number is a point on the plane
c1: z = a + bi corresponds one-to-one with a point of the plane and with an arrow from the origin. Pin it two ways: coordinates (a, b), or (modulus, argument) — the modulus is the arrow’s length, the argument its direction (principal value (−180°, 180°] on this page).
c2h: Addition is sliding
c2: The sum’s coordinates are the two sides’ coordinates added separately; in the picture it is one slide along the added number’s arrow — the diagonal of the parallelogram. Addition moves position only.
c3h: Multiplication is rotation + scaling
c3: Moduli multiply, arguments add: multiplying by a number scales you by its modulus and rotates you by its argument. Multiplying by i is the purest case — modulus 1, angle 90°, rotation with no scaling; and i² = −1 is simply “two turns make an about-face”.
s6fin: One sentence each for two roads ahead: **division** is the inverse of multiplication — arguments subtract, moduli divide — not expanded on this page. And one planted thread: if this point starts turning on its own, its angle growing uniformly with time, its position is e<sup>iθ</sup> running on the unit circle — the doorway to **Euler’s formula**, named here only.
s6lkTrig: The very point at angle θ, set turning and with its height unrolled, is the sine wave — watch it move on the trigonometry page →
s6lkEigen: On the eigenvalues page, choose the “Rotation–scaling: complex λ” preset: this example has two non-real eigenvalues and no real eigen-direction. Explore how rotation and scaling combine in a matrix →
s6lkFourier: Phase is a starting angle: where each circle starts on the Fourier page is exactly what this page’s argument is for — see it on the Fourier page →
:::
