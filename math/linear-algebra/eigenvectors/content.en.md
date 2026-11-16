---
lang: en
---

::: strings
docTitle: Eigenvalues & Eigenvectors · The Directions a Matrix Won’t Turn · One Interaction per Step
back: ← Knowledge Index
pageTitle: Eigenvalues & Eigenvectors · The Directions a Matrix Won’t Turn
tagline: A matrix is a stretching machine: applied to space, it turns almost every arrow — except a few special directions that only get stretched, shrunk, or flipped, their line never bending. Those directions are eigenvectors; the stretch factors are eigenvalues. We start with a circle squeezed into an ellipse, drag the unturned directions out by hand, and end at the λ = 1 hiding behind Google’s ranking.
foot: visual.integ.life · Eigenvalues & Eigenvectors — one interaction per step
:::

## A circle squeezed into an ellipse — two directions refuse to turn {#step0 h2=s0t}

::: strings
nav0: 0 Circle → Ellipse
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

Twenty arrows stand evenly on the unit circle. Apply the matrix A once: the circle is squeezed into an ellipse and the arrows are, almost all of them, **turned**. But watch the orange and pink pairs: they only grow or shrink — **their line does not bend at all**. Drag the slider to push the deformation back and forth between “circle” and “ellipse”. The whole plane is being twisted, so why do exactly these two directions stay put? This page investigates them. {#s0e .explain}

::: html step0-1
s0formula: A = \[[2.2, 0.6], [0.6, 1.0]] (fixed for this step; every matrix on this page is 2×2 like this)
s0tLab: Morph t (0 = untouched, 1 = A fully applied)
s0play: Play the morph
:::

Memorize the test: v is an eigenvector exactly when **Av is collinear with v** (same or opposite direction); the signed multiple is the eigenvalue λ. Next step, you drag an arrow yourself until it lines up. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0pause: Pause
s0ro: Symbols first: **λ (lambda) is the symbol for the eigenvalue** — the orange direction: stretched by <span class="lam1">λ₁ ≈ {l1}</span> · Pink direction: shrunk to <span class="lam2">λ₂ ≈ {l2}</span> · Every other arrow: stretched **and turned**
cv0unit: unit circle
cv0eig1: eigendirection 1 (stretch only)
cv0eig2: eigendirection 2 (stretch only)
s1exact: The remainder is within floating-point tolerance: numerically collinear, λ ≈ {lam}. This finite-precision check is not an exact proof; a negative sign means opposite direction.
:::

## Turn the input arrow: which directions stay on their line? {#step1 h2=s1t}

::: strings
nav1: 1 Find a Direction
:::

Step 1 · Hands On {#s1k .step-kicker i18n=text}

Cyan v is the input arrow; orange Av is the matrix output. Drag the arrow or change its direction below. Does the orange tip leave the dashed line through v? The pink segment joins that line to the tip: it shows **the part off the original line**. Make it smaller, then check collinearity. **Opposite directions still count**: a negative eigenvalue flips the output along the same line. This is geometry, not a trajectory; direction angle is not time. {#s1e .explain}

::: html step1-1
s1formula: Av = λv — v is an eigenvector, λ its eigenvalue
s1presetLab: Matrix preset:
s1p1: A classic symmetric \[[2,1],[1,2]]
s1p2: A · another symmetric matrix \[[3,0.5],[0.5,1]]
s1p3: A with a negative λ \[[0.5,1.5],[1.5,0.5]]
s1angleLabel: Input arrow direction θ (0°–360°)
s1reset: Reset this experiment
s1legend: Cyan v: input; orange Av: output; dashed line: the line through v; pink segment: the part off that line. Below one screen pixel, use the readout and tolerance criterion instead.
s1keyboard: Drag or point at the arrow, or use the slider. On the slider and canvas, arrow keys move 0.1°; Shift + arrow moves 1°; Home selects 0° and End 360°. Display rounds to 0.1° while dragging retains finer precision. 0° and 360° are the same direction.
:::

These three presets are symmetric matrices with two distinct real eigenvalues, so each has two different eigenlines. The lower curve covers undirected lines once over 0°–180°; the input arrow uses a full 0°–360° turn. A general matrix need not have two real eigendirections; the next step shows counterexamples. {#s1hint .hint}

::: html step1-2
s1check: Predict, then try: what changes at 135° with the negative-eigenvalue preset? (Reveal explanation)
s1answer: Choose the classic matrix at 135°: for v = (−1,1), Av = (−1,1), so λ = 1. Hold that direction and choose the negative-λ preset: Av = (1,−1) = −v, so λ = −1. Orange flips but stays on the same line; the pink remainder is zero within floating-point tolerance. Normalizing v does not change these results.
s1algebra: Check the algebra: projection coefficient, remainder and tolerance
s1derivation: For nonzero v, p = (v·Av)/(v·v), r = Av − pv, and v·r = 0. p is an eigenvalue only if r = 0. We call it numerically collinear when ‖r‖ ≤ 64ε‖A‖F‖v‖: ε is floating-point relative precision and ‖A‖F is the square root of the sum of squared entries. Below 1° is merely near. Av = 0 has no direction angle but can give λ = 0; none of this step’s presets has that case. The pink length is a mathematical remainder, not measurement error.
s1sourceEigen: Principle: nonzero eigenvectors and signed eigenvalues ↗
s1sourceProjection: Principle: orthogonal projection onto a line ↗
s1continue: Optional next question: can a data cloud have a principal direction? → Step 5
:::

::: strings
s1angleValue: Direction approximately {th} degrees
s1canvas: Input v, matrix output Av, and a pink remainder joining the projection point to the output. Use arrow keys or the direction slider below.
s1ro: θ ≈ <span>{th}°</span> · angle between lines ≈ <span>{ang}°</span> · length ratio ≈ <span>{sc}</span><br>Projection coefficient p ≈ <span>{lam}</span> · off-line amount ‖r‖ ≈ <span>{res}</span> (dimensionless; p is not always an eigenvalue)
s1found: Near an eigendirection: the line angle is below 1°, but the remainder exceeds floating-point tolerance. p ≈ {lam} is a projection coefficient; this does not establish Av = λv.
s1flip: " (negative: Av points opposite to v — flipped, but still collinear)"
s1near: The orange arrow still leaves the input line. Change direction and watch the pink segment shrink, or hold direction and compare matrices.
cv1v: v (drag me)
cv1av: Av
cv1curveT: Line angle versus direction θ (0°–180° covers each line once)
cv1zero: zeros = eigendirections
:::

## All four entries are yours — watch λ change its fate {#step2 h2=s2t}

::: strings
nav2: 2 The Character of λ
:::

Step 2 · The Character of λ {#s2k .step-kicker i18n=text}

This step hands you all four entries a, b, c, d. λ₁, λ₂ and the two eigendirection lines are recomputed live, next to two **identities**: λ₁ + λ₂ must equal the trace tr A = a + d, and λ₁λ₂ must equal the determinant — the residuals hover around 10⁻¹⁵, floating point’s last stand. Tour the presets: a **negative eigenvalue** flips its arrow; **both λ below 1** shrink the whole circle; the **shear** has only one eigendirection (a repeated, defective root — the page honestly draws just one line); the **rotation–scaling** has discriminant below zero, so real eigendirections **do not exist** — λ is a complex-conjugate pair, and the page will not fake a direction for you; it shows the true behavior instead: a spiral. {#s2e .explain}

::: html step2-1
s2formula: λ = (tr A ± √( (a−d)² + 4bc )) / 2, discriminant Δ = (a−d)² + 4bc
s2spiralLab: One vector multiplied by A 12 times (small window, auto-scaled axes)
s2spiralStep: Next step
s2aLab: a (top-left)
s2bLab: b (top-right)
s2cLab: c (bottom-left)
s2dLab: d (bottom-right)
s2presetLab: Preset tour:
s2qNeg: Negative λ: the flip
s2qShrink: Both λ < 1: shrink
s2qShear: Shear: defective double root
s2qRot: Rotation–scaling: complex λ
s2qFree: Back to default \[[2.2,0.6],[0.6,1.0]]
s2spiralBtn: Watch the iteration spiral
:::

How to read a negative λ: λ = −1 does not mean “shrunk by −1×”; it means flip the direction, then scale by |λ|. You already dragged one in Step 1’s third preset. Complex λ is not broken math either: it honestly reports a rotation hiding inside the transformation — bridges, AC circuits and quantum mechanics are full of complex eigenvalues. {#s2hint .hint}

::: strings
bdL1: λ₁ = <b class="l1">{v}</b>
bdL2: λ₂ = <b class="l2">{v}</b>
bdSum: λ₁+λ₂ = {s} · tr A = {tr} · residual {e}
bdProd: λ₁λ₂ = {p} · det A = {det} · residual {e}
bdDelta: discriminant Δ = {v}
s2double: Repeated root λ₁ = λ₂ = {lam}, but A is not λI — there is only ONE eigendirection. Such a matrix is called **defective**: it cannot muster a full set of eigenvectors.
s2scalar: This is λI (a scalar matrix): every direction is an eigendirection with λ = {lam} — nothing turns, everyone is an eigenvector.
s2complex: Δ < 0: the eigenvalues are a complex-conjugate pair λ = α ± βi = <b>{alpha} ± {beta}i</b>, and there is **no real eigendirection at all**. The true behavior is rotation + scaling: each application turns vectors by <span>{ang}°</span> and multiplies lengths by <span>{rho}</span>.
s2spiralPlay: Play
s2spiralPause: Pause
s2spiralReplay: Replay
s2spiralRo: step <span>{k}</span> / 12 · current length = <span>{len}</span> · turned <span>{turn}°</span> in total
cv2line1: λ₁ direction
cv2line2: λ₂ direction
cv2noline: no real eigendirection
:::

## Multiply a hundred times — the main direction surfaces on its own {#step3 h2=s3t}

::: strings
nav3: 3 Power Iteration
:::

Step 3 · Power Iteration {#s3k .step-kicker i18n=text}

No idea where the eigenvector hides? Use the blunt method: multiply any vector by A, over and over. Each multiplication nudges the result **closer to the dominant eigendirection** (the one with largest |λ|), because the component along it grows by |λ₁| per step while the rest grows only by |λ₂| — the relative gap widens by a factor **|λ₂/λ₁|** each step. Push the ratio slider from 0.33 to 0.95: the closer the two eigenvalues, the slower the crawl, and the error curve grows a long tail. Then try the **equal-modulus counterexample**: with λ₂ = −λ₁ neither component can dominate, the vector **hops between two directions forever and never converges** — power iteration’s failure mode, labeled as such, never faked. {#s3e .explain}

::: html step3-1
s3formula: x ← Ax / |Ax|, repeat — x creeps toward the eigenvector of largest |λ|
s3chartT: angle error vs step (log scale)
s3rLab: ratio r = λ₂/λ₁ (λ₁ = 2, direction fixed at 35°)
s3pFast: r = 0.33 fast
s3pSlow: r = 0.90 slow
s3pSlower: r = 0.95 slower
s3pFail: Counterexample λ₂ = −λ₁
s3rand: Random start
s3step: Multiply once
s3play: Play
s3run: Run 60 steps
s3reset: Reset
:::

The error is multiplied by roughly |λ₂/λ₁| each step — which is why r = 0.95 has such a long tail: 0.95¹⁰⁰ is still 0.006. Numerical libraries and Google’s PageRank find their eigenvectors with exactly this iteration (plus acceleration tricks). You will meet it once more in the finale. {#s3hint .hint}

::: strings
s3rNA: n/a
s3pause: Pause
s3ro: step k = <span>{k}</span> · angle error to dominant eigenvector = <span>{err}°</span> · |λ₂/λ₁| = <span>{r}</span>
s3conv: <span class="good">Converged</span> — error below 0.01°. This direction is the dominant eigenvector (λ₁ = {lam}), obtained by multiplication, not by solving any equation.
s3failNote: <b class="bad">No convergence (failure mode):</b> when |λ₁| = |λ₂| the error does not decay and the direction hops back and forth. Power iteration is honest: when its condition fails, it fails in plain sight.
cv3main: dominant eigendirection
cv3traj: iteration path
:::

## Principal axes, orthogonality, diagonalization — the canyon’s true form {#step4 h2=s4t}

::: strings
nav4: 4 Axes & Diagonalization
:::

Step 4 · Symmetric Matrices {#s4k .step-kicker i18n=text}

Symmetric matrices (b = c) enjoy a privilege: **you can always choose a perpendicular pair of eigenvectors** (when the two eigenvalues differ, the eigenvectors are perpendicular automatically — no choice involved; when an eigenvalue repeats, its eigenspace is a whole plane, and a perpendicular pair can still be picked from it). Overlaid are the contour ellipses of the quadratic form xᵀAx — remember the canyon from Step 2 of the Gradient Descent page? The ellipse’s long and short axes are exactly the two eigendirections, and the condition number κ = λmax/λmin is the canyon’s aspect ratio; here the eigenvalues appear in their true form. Press “Rotate into the eigenbasis”: the whole picture turns by θ until the eigendirections line up with the axes, and the matrix readout changes — **the cross term vanishes**, A becomes the diagonal Λ in the new coordinates, and QΛQᵀ reconstructs A with max entry error around 10⁻¹⁶: diagonalization is an identity, not an approximation. {#s4e .explain}

::: html step4-1
s4formula: A = QΛQᵀ, columns of Q = unit eigenvectors, Λ = diag(λ₁, λ₂)
s4aLab: a
s4mLab: b = c (symmetric)
s4dLab: d
s4rotBtn: Rotate into the eigenbasis
:::

Gradient descent zigzags in the canyon essentially because the coordinate axes are misaligned with the eigendirections: in the eigenbasis each direction takes its own step size and the zigzag vanishes. “Change the basis until the matrix is diagonal” is linear algebra’s most productive move — Step 5’s data compression and Step 6’s steady state both run on it. Link: <a class="fourier-link" href="../../../computing/ml/gradient-descent/#step2">see the zig-zag itself in the canyon →</a>. {#s4hint .hint}

::: strings
s4unrotBtn: Rotate back
bdDot: v₁·v₂ = {v} (orthogonal)
bdKappa: κ = λmax/λmin = {v} (canyon aspect ratio)
bdRecon: max entry error of ‖QΛQᵀ − A‖ = {v}
s4matA: A in the original basis:
s4matA2: A′ = QᵀAQ in the eigenbasis:
s4cross: Cross term A′₁₂ = {v} ≈ 0 — in the new coordinates xᵀAx = λ₁u² + λ₂v²: the two directions are fully decoupled, each minding its own business.
s4notpd: Note: the current parameters make A non-positive-definite (λmin ≤ 0), so the contours become hyperbolas; only the eigendirection lines are drawn. Raise a and d to return to ellipses.
cv4axis1: v₁ (λ₁)
cv4axis2: v₂ (λ₂)
:::

## The direction of maximum variance is the top eigenvector {#step5 h2=s5t}

::: strings
nav5: 5 Principal Components
:::

Step 5 · Principal Components of Data {#s5k .step-kicker i18n=text}

An elongated cloud of 60 points (fixed random seed, already mean-centered). Drag the axis through the origin and read the **sample variance** of the data projected onto it (covariance convention: divide by n − 1, used consistently throughout this step) — the variance rises and falls as you turn, and its maximum is attained exactly at the **top eigenvector of the covariance matrix**. Press “Show principal components” and let it align itself: PC1 captures the share λ₁/(λ₁ + λ₂) of the total variance, PC2 is perpendicular to it and governed by λ₂. Rotate the data into this new basis and throw away the small axis, and the data is compressed — that is the whole of PCA (principal component analysis). <a class="fourier-link" href="../../../signal/control/kalman/#step5">How this principal direction is used in Kalman: velocity from position alone →</a> {#s5e .explain}

::: html step5-1
s5formula: Covariance C = (1/(n−1)) Σ pᵢpᵢᵀ; eigenvectors of C = principal directions, eigenvalues = variance along them
s5show: Show principal components
:::

Why does the max-variance direction deserve to be “principal”? Because the data spreads widest along it and carries the most information there; discarding the small perpendicular variance loses the least. Photo compression, face recognition (eigenfaces), financial risk factors — all run on this step’s covariance eigendecomposition. {#s5hint .hint}

::: strings
s5hide: Hide principal components
s5ro: Axis angle = <span>{th}°</span> · sample variance along axis = <span>{v}</span> (the ceiling is λ₁ = <span>{l1}</span>)
s5pc: Principal components: λ₁ = <b>{l1}</b> (variance share <b>{share}%</b>) · λ₂ = <b>{l2}</b> · projection variance along PC1 (computed from the data) = <b>{pv}</b>, matching λ₁ to floating-point precision
cv5pc1: PC1 (λ₁)
cv5pc2: PC2 (λ₂)
cv5axis: your axis
:::

## The steady state: the λ = 1 eigenvector, and Google’s starting point {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Steady State
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Final stop: a tiny four-node web — A, B, C, D pointing arrows at each other. Imagine a crowd standing on the nodes; at every step each person walks along an outgoing arrow, **chosen uniformly at random**. That is a Markov chain. Its transition matrix M has, in each column, the probabilities of leaving that column’s node for each row — so **every column sums to exactly 1** (nobody vanishes). Start from any distribution and keep multiplying by M: the distribution shifts, then **freezes** — and a frozen distribution π satisfies Mπ = π: it is an eigenvector of M with eigenvalue exactly λ = 1. Switch the initial distribution and run again: wildly different starts, identical finish. Google’s PageRank treats the whole web as this graph, and the steady distribution is the ranking (real PageRank adds damping: at each step a 0.15 chance of teleporting to a random page, π ← 0.85·Mπ + 0.15/N, to guarantee convergence; this little web is reachable and aperiodic, so it converges undamped). {#s6e .explain}

::: html step6-1
s6formula: π ← Mπ, steady state Mπ\* = π\* — the eigenvector for λ = 1
s6initLab: Initial distribution:
s6iUni: Uniform
s6iA: All on A
s6iD: All on D
s6iRand: Random
s6step: One step
s6play: Play
s6run: Run 80 steps
s6reset: Back to uniform
s6cardsH: One λ, three faces
c1h: PageRank: the steady state is the ranking
c1: Treat pages as nodes and links as arrows, and PageRank is the λ = 1 eigenvector of that giant graph: the page with the largest steady-state share is the most important. It is computed by Step 3’s power iteration — multiply until nothing moves.
c2h: Vibration modes: eigenfrequencies
c2: In the vibration equations of bridges and buildings, eigenvectors are the **mode shapes** (relative sway of each part) and eigenvalues give the **natural frequencies**. Resonance avoidance and seismic design are, at bottom, eigenvalue problems.
c3h: Stability: back to the unit circle
c3: A discrete system x ← Ax is stable ⟺ every eigenvalue satisfies |λ| < 1 — the same sentence as the Z-Transform page’s “poles inside the unit circle”: the system matrix’s eigenvalues ARE the poles. Link: <a class="fourier-link" href="../../../signal/transforms/z-transform/#step3">The Z-Transform</a>.
s6fin: From the circle-squeezing machine to Google’s ranking, there is only one question in between: **“which direction refuses to be turned?”** Eigenvectors are a matrix’s skeleton — once you see the skeleton, stretching, rotation, vibration, the shape of data and the steady state of a network are all the same story told in different accents.
s6lkGd: The canyon itself: the condition number sets the zig-zag →
s6lkKal: Covariance’s principal directions: Kalman’s 2-D step →
:::

::: strings
s6pause: Pause
s6ro: step k = <span>{k}</span> · distribution (A, B, C, D) = <span>{dist}</span> · L1 distance to steady state = <span>{d}</span>
s6steady: Steady state π\* = ({dist}) — in theory exactly (2/9, 1/9, 4/9, 2/9): C, pointed to from three places, is the most popular, matching the independent linear-system solve (error < 10⁻¹²). From any start, power iteration returns here.
s6colsum: Column sums of M: {sums} (each exactly 1 — total mass is conserved, so an invariant distribution with λ = 1 must exist)
cv6from: weights shown as node sizes
:::
