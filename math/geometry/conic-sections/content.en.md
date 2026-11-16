---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Mathematical Foundations
stageBadge: Senior High
foot: Conic Sections · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Conic Sections · One Cone, Four Cuts
pageTitle: Conic Sections
tagline: Circle, ellipse, parabola and hyperbola look unrelated, yet they are one family cut from the same cone by planes at different angles — and a single number, the eccentricity e, strings them on one line.
:::

## Cut one cone with a plane: what shape is the cut edge? {#step0 h2=s0t}

::: strings
nav0: 0 Four cuts
:::

Step 0 · Four cuts {#s0k .step-kicker i18n=text}

This step asks: when a plane cuts a cone, what is the cut curve and what decides it? The picture shows the cone from the side (axis vertical, half-angle α = 30°) and a plane (a line seen edge-on). Let φ be the angle between plane and axis: φ = 90° gives a **circle**; φ between α and 90° gives an **ellipse**; φ = α (the plane parallel to a generating line of the cone) gives a **parabola**; φ below α gives a **hyperbola** (it cuts both halves of the double cone). Drag “angle φ between plane and axis” and watch the plane turn on the left and the cut shape change on the right. {#s0e .explain}

::: html step0-1
s0stage: Left: the cone from the side (dashed line is the axis) and the cutting plane (orange line); right: the curve this plane cuts out (drawn from e = cos φ ÷ cos α; its size does not reflect the real position)
s0canvas: A cone and a cutting plane: as the plane turns, the cut is a circle, ellipse, parabola, then hyperbola
s0phi: Angle φ between plane and axis
:::

Takeaway: the shape depends only on the angle — as φ falls from 90°: circle (e = 0), ellipse (0 < e < 1), parabola (e = 1), hyperbola (e > 1). Holds for a plane that misses the apex; through the apex it degenerates to a point or lines. The cut’s size depends on the plane’s position, which is not simulated here. {#s0result .readout i18n=text}

::: strings
s0ro: φ = {phi}°, cone half-angle α = 30°: the cut is a {kind}, eccentricity e = cos φ ÷ cos α = {e}.
:::

## Is there one number that tells these curves apart? {#step1 h2=s1t}

::: strings
nav1: 1 Eccentricity e
:::

Step 1 · Eccentricity e {#s1k .step-kicker i18n=text}

This step asks: can one rule define circle, ellipse, parabola and hyperbola together? The rule: the curve is the set of points whose distance to a fixed point (the **focus** F) divided by their distance to a fixed line (the **directrix**) equals a constant e, called the **eccentricity**. Drag e and watch the curve go from circle to ellipse, parabola, hyperbola; drag “position of P” and read the ratio of the two distances to confirm it always equals e. {#s1e .explain}

::: html step1-1
s1stage: Plane: the red dot is the focus F, the vertical dashed line is the directrix, the orange dot P is on the curve; the length of cyan PF divided by pink PD (the perpendicular to the directrix) is e
s1canvas: A focus, a directrix and a point on the curve: the ratio of distance to focus over distance to directrix always equals the eccentricity
s1elab: Eccentricity e
s1p: Position of P
:::

Takeaway: e = 0 is a circle, 0 < e < 1 an ellipse, e = 1 a parabola, e > 1 a hyperbola; the ratio is the same at every point. Holds with the semi-latus rectum fixed at ℓ = 1 for scale; at e = 0 the directrix is at infinity and the curve is a circle around the focus. {#s1result .readout i18n=text}

::: strings
s1ro: e = {e}: {kind}; right now |PF| = {pf}, |PD| = {pd}, |PF| ÷ |PD| = {ratio}.
:::

## With a loop of string and two pins, how do you draw an ellipse? {#step2 h2=s2t}

::: strings
nav2: 2 Two foci
:::

Step 2 · Two foci {#s2k .step-kicker i18n=text}

This step asks: why do ellipses and hyperbolas have two foci, and how are they defined? An **ellipse** is the set of points whose distances to two foci F₁, F₂ add up to a constant 2a; a **hyperbola** is the set where the distances differ by a constant 2a in absolute value. With half the focal distance c, c < a gives an ellipse and c > a a hyperbola, with b² = |a² − c²|. Drag a and c, then drag “position of P” and read the sum (or difference); the trail of P’s visited positions traces the curve bit by bit. {#s2e .explain}

::: html step2-1
s2stage: Plane: the two red dots are foci, the orange dot P moves along the curve, cyan is PF₁ and pink is PF₂; the small yellow dots are the positions P has visited (a trail), the faint line is the whole curve
s2canvas: Two foci and a point on the curve: on an ellipse PF₁ + PF₂ stays 2a, on a hyperbola |PF₁ − PF₂| stays 2a
s2a: Semi-major a (half the constant)
s2c: Half the focal distance c
s2tlab: Position of P
s2clear: Clear the trail
:::

Takeaway: an ellipse is “two distances add to a constant”, a hyperbola “two distances differ by a constant”; at c = 0 the foci merge and the ellipse is a circle. Only the ellipse and the hyperbola’s right branch are drawn (the left branch mirrors it); near c = a the curve degenerates. {#s2result .readout i18n=text}

::: strings
s2ro: {kind}: a = {a}, c = {c}, b = {b}; |PF₁| = {d1}, |PF₂| = {d2}, {op} = {val} (2a = {a2}).
s2sum: sum of distances
s2diff: absolute difference of distances
s2deg: Degenerate: c is almost equal to a, so the curve collapses to a segment or rays.
:::

## Why is a satellite dish parabolic, and why can a whisper at one focus of an elliptical room be heard at the other? {#step3 h2=s3t}

::: strings
nav3: 3 Reflection secret
:::

Step 3 · Reflection secret {#s3k .step-kicker i18n=text}

This step asks: when light hits a mirror shaped like a conic, where does it go? The rule of **reflection** is that the angle of incidence equals the angle of reflection (measured from the tangent at that point). A parabola has a remarkable property: rays parallel to its axis all reflect through the focus; for an ellipse, rays leaving one focus reflect through the other. Pick a mirror, drag the “ray”, switch on “draw many rays” and watch them gather at the focus. {#s3e .explain}

::: html step3-1
s3stage: Mirror (thick line) and rays: green is incoming, orange is reflected; red dots are foci; the readout gives how far the reflected ray passes from the focus
s3canvas: A parabolic mirror gathers parallel light at its focus, an elliptical mirror carries light from one focus to the other
s3mode: Mirror shape
s3r: Ray
s3many: Draw many rays
:::

Takeaway: a parabolic mirror gathers parallel light at its focus (and turns a source at the focus into a parallel beam, like a torch or headlamp); an ellipse sends light from one focus to the other. Holds for ideal mirrors in a 2D cross-section; the numbers come from the normal of the curve’s implicit equation, not a coincidence of drawing. {#s3result .readout i18n=text}

::: strings
s3ro: {mode}: the ray reflects at ({x}, {y}); the reflected ray passes {miss} from the focus (should be near 0); incident and reflected angles differ by {dang}°.
:::

## Given a quadratic equation, how can you tell which curve it is without drawing? {#step4 h2=s4t}

::: strings
nav4: 4 Name it from the equation
:::

Step 4 · Name it from the equation {#s4k .step-kicker i18n=text}

This step asks: which curve does Ax² + Bxy + Cy² + Ey = 1 describe? Look at the **discriminant** Δ = B² − 4AC: Δ < 0 is an ellipse (a circle if A = C and B = 0), Δ = 0 a parabola, Δ > 0 a hyperbola; sometimes it is degenerate (two parallel lines or nothing). Drag A, B, C, E and compare the Δ in the readout with the curve actually drawn. {#s4e .explain}

::: html step4-1
s4stage: The graph of A·x² + B·xy + C·y² + E·y = 1 (inside the square −4 to 4); the readout gives the discriminant Δ and the type
s4canvas: The graph of a quadratic equation: the sign of the discriminant decides ellipse, parabola or hyperbola
s4a: Coefficient A
s4b: Coefficient B (xy term)
s4c: Coefficient C
s4elab: Coefficient E (linear in y)
s4reset: Reset (the circle x² + y² = 1)
:::

Takeaway: the discriminant B² − 4AC of the quadratic part Ax² + Bxy + Cy² picks the family; B ≠ 0 means the curve’s axes are not parallel to the coordinate axes. Holds here with only a linear term E in y; the general equation also has an x term, and after shifting it classifies the same way. A parabola needs the quadratic part to be a perfect square and the linear term not to point along it. {#s4result .readout i18n=text}

::: strings
s4ro: A = {a}, B = {b}, C = {c}, E = {e}: Δ = B² − 4AC = {d}, verdict: {kind}. {note}
s4noReal: No curve is drawn: the equation has no real solutions in this range (for example when A and C are both negative).
s4rot: The xy term has rotated the curve.
s4none: ""
:::

## Explain conic sections to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Circle, ellipse, parabola and hyperbola are one family cut from a cone by planes; the eccentricity e puts them on one line, the foci give their reflecting property, and the discriminant of a quadratic equation names them at a glance.
f1t: One family
f1b: The angle between plane and axis sets the cut: circle → ellipse → parabola → hyperbola (step 0), all measured by e (step 1).
f2t: Foci
f2b: An ellipse has a constant distance sum, a hyperbola a constant difference; foci give the reflecting property (steps 2–3).
f3t: Algebra
f3b: The sign of B² − 4AC in Ax² + Bxy + Cy² + ⋯ = 0 separates ellipse, parabola and hyperbola (step 4).
modelT: Honest model notes
model1: Step 0 draws only the cut’s shape (from e = cos φ ÷ cos α); its size depends on the plane’s position, which is not simulated; a plane through the apex degenerates.
model2: Reflection uses an ideal mirror in a 2D cross-section with numbers from the implicit equation’s normal; a real dish is a 3D paraboloid with manufacturing errors.
model3: Step 4 has only a linear term in y, a special case of the general quadratic; degenerate cases (parallel lines, a point, empty) are only hinted at.
nextT: Keep going (on this site)
l1: Quadratics & Parabolas · step 0: a basketball shot’s path is a parabola
l2: Eigenvectors · step 4: principal axes remove the xy term and “straighten” the ellipse
l3: Inscribed Angles · step 0: the circle is the e = 0 conic
:::

::: strings
kCircle: circle
kEllipse: ellipse
kParabola: parabola
kHyperbola: hyperbola
kDegenerate: degenerate (lines or nothing)
mParabola: Parabolic mirror
mEllipse: Elliptical mirror
unitDeg: °
:::
