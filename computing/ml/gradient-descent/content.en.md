---
lang: en
---

::: strings
docTitle: Gradient Descent · Downhill in the Dark · One Interaction per Step
back: ← Knowledge Index
pageTitle: Gradient Descent · Downhill in the Dark
tagline: Training a model, at bottom, is walking downhill on terrain you cannot see: the slope under your feet (the gradient) is the only information you get, and how big a step you dare to take (the learning rate) decides whether you reach the valley floor, pace in place, or get launched into orbit. Every neural network ever trained runs the loop on this page — so first, crank the step size until something explodes.
foot: visual.integ.life · Gradient Descent —— the one-interaction-per-step series
:::

## One ball, one step-size line between life and death {#step0 h2=s0t}

::: strings
nav0: 0 The Line
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

Shrink the world to a single parabola: f(x) = x², valley floor at x = 0. The ball starts at x = 2 and obeys one rule: **x ← x − η·f′(x)**, where f′(x) = 2x is the slope underfoot and η (the learning rate) is how bold a step you take. Too small, and the ball inches along; η = 0.5 lands it exactly on the floor in one step; a bit larger and it starts bouncing wall to wall as it converges; at η = 1 it bounces between ±2 forever; any larger — it launches clean off the chart. All of deep learning tuning is, at bottom, this one slider. **Play with it until it explodes.** {#s0e .explain}

xₙ₊₁ = xₙ − η·2xₙ = (1 − 2η)·xₙ {#s0formula .formula i18n=text}

::: html step0-1
s0etaLab: η · learning rate (step size)
s0step: Take a step
s0play: Play
s0reset: Back to x = 2
:::

Why do the regimes break exactly at 0.5 and 1? Because each step multiplies x by (1 − 2η): a multiplier inside (−1, 1) converges, its sign picks monotone versus bouncing, exactly −1 orbits in place, and outside ±1 it explodes. The whole fate of the 1-D problem is one multiplier. Every later step on this page is a fight with the high-dimensional version of that same number. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0pause: Pause
s0ro: step n = <span>{n}</span> · x = <span>{x}</span> · |x| = <span>{ax}</span> · per-step multiplier (1 − 2η) = <span>{ratio}</span> · state: <b>{verdict}</b>
s0vMono: monotone convergence — every step moves toward the floor
s0vOne: one-shot landing — η = 0.5 sits exactly on the line
s0vOsc: oscillating convergence — bouncing toward the floor
s0vStay: orbits in place — η = 1, multiplier = −1, bounces forever
s0vDiv: diverging — |multiplier| > 1, every step lands farther away
s0vDone: landed on the valley floor (x = 0)
s0divNote: The ball has left the chart: the true magnitude of |x| is 10<sup>{k}</sup> (the readout shows the true value). Nothing was quietly reset — divergence is divergence.
cv0clip: ball has left the chart (true value in the readout)
cv0valley: valley floor x = 0
:::

## The gradient is always perpendicular to the contour lines {#step1 h2=s1t}

::: strings
nav1: 1 2D Terrain
:::

Step 1 · 2-D Terrain {#s1k .step-kicker i18n=text}

Now the terrain is two-dimensional: a round bowl f(x, y) = ½(x² + y²) whose contours are concentric circles. **Click anywhere to drop the ball**, then step (or play) and watch it descend. The field of arrows shows −∇f at sampled points — the steepest downhill direction right there. Watch where arrows cross the circles: they pierce every contour **at a right angle**, and they shrink as the floor nears — the slope is dying. Notice how little the gradient tells you: it says how to take the steepest next step, and not one word about where the valley is. Descending means chaining local judgments into a global path. {#s1e .explain}

f(x, y) = ½(x² + y²), ∇f = (x, y), x ← x − η·∇f(x) {#s1formula .formula i18n=text}

::: html step1-1
s1etaLab: η · learning rate
s1step: Take a step
s1play: Play
s1reset: Back to (2.2, 1.6)
:::

Why must the arrows be perpendicular to the contours? Walking along a contour keeps f constant, so the gradient (the direction of fastest increase) has zero component along it — an identity in the math, a visible right angle on the chart. This bowl is isotropic: the slope is the same in every direction, so the ball rolls straight to the floor. Stretch the bowl, and the trouble starts. {#s1hint .hint}

::: strings
s1pause: Pause
s1ro: step n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span>{done}
s1done: " · <b>at the bottom</b> — |∇f| below 10⁻⁶, the slope is gone"
cv1click: click anywhere to drop the ball
cv1grad: arrows = −∇f (steepest descent)
:::

## The condition number sets the zigzag {#step2 h2=s2t}

::: strings
nav2: 2 The Canyon
:::

Step 2 · The Canyon {#s2k .step-kicker i18n=text}

Stretch the bowl along one axis: f(x, y) = ½(x² + κy²). κ is the **condition number** — the ratio of the steepest slope to the gentlest, the canyon’s aspect ratio. <a class="fourier-link" href="../../../math/linear-algebra/eigenvectors/#step4">κ’s true identity lives on the eigenvalue page: the canyon’s aspect ratio is a ratio of λ’s →</a> At κ = 1 it is still a round bowl; crank κ up and it becomes a gorge: brutally steep across, nearly flat along the floor. The trouble follows at once: η must respect the steepest direction (η < 2/λ<sub>max</sub> or it explodes), so progress along the floor crawls, and the ball zigzags wall to wall, inching forward. Every number on the board below — the stability limit, the optimal step η\*, the rate (κ−1)/(κ+1) — is computed from the terrain’s eigenvalues λ, the trajectory is iterated live, and the measured step count can be checked against theory on the spot. {#s2e .explain}

f = ½xᵀAx, A = diag(1, κ): λmin = 1, λmax = κ {#s2formula .formula i18n=text}

::: html step2-1
s2kapLab: κ · condition number (canyon aspect ratio)
s2etaLab: η · learning rate
s2etaStar: Set η to the optimal η\*
s2step: Take a step
s2play: Play
s2runAll: Run to the end
s2reset: Reset
:::

The theory count: each step multiplies the error by at most the rate (κ−1)/(κ+1), so shrinking it to 1/1000 takes about ln(1000) / ln(1/rate) steps. At η = η\* the two directions’ multipliers have exactly equal magnitude, so theory and measurement land very close — not a coincidence, but the definition of η\* at work. Remember the word eigenvalue: here it appears disguised as a terrain’s aspect ratio; on the next page it takes the lead role. {#s2hint .hint}

::: strings
s2pause: Pause
bdLam: λmin = {a} · λmax = {b}
bdEtaLim: stability limit 2/λmax = {v}
bdEtaStar: optimal η\* = 2/(λmin+λmax) = {v}
bdRate: rate (κ−1)/(κ+1) = {v}
bdTheory: theory steps at η = η\* (error → 1/1000) ≈ {v}
bdMeas: measured steps to ε = {v}
s2ro: now n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · state: <b>{status}</b>
s2stRun: descending
s2stDone: reached ε (‖x‖ ≤ ‖x₀‖/1000)
s2stDiv: diverged — η is past the stability limit, ‖x‖ blew past 10{supk}
:::

## Let the ball roll: momentum {#step3 h2=s3t}

::: strings
nav3: 3 Momentum
:::

Step 3 · Momentum {#s3k .step-kicker i18n=text}

Same canyon as step 2, same start, same η (both sides use η\*) — the only difference: the ball on the right has **inertia**. Plain gradient descent looks only at the slope underfoot; momentum keeps a fraction β of the previous velocity: **v ← βv − η∇f(x), x ← x + v**. Inside the canyon the wall-to-wall bounces flip sign every step and cancel, while the along-floor components point the same way and add up — the ball overshoots the floor, swings twice, then accelerates along it. Push β past 0.9 and watch the other face: too much inertia, huge swings across the floor, slower than no momentum at all. Momentum is medicine; overdosed, it is poison. {#s3e .explain}

v ← βv − η·∇f(x), x ← x + v (β = 0 degenerates to plain GD) {#s3formula .formula i18n=text}

::: html step3-1
s3leftLab: Plain GD (β = 0)
s3kapLab: κ · condition number
s3betaLab: β · momentum coefficient (0 = plain GD)
s3step: Take a step
s3play: Play
s3runAll: Run to the end
s3reset: Reset
:::

ε means the same as in step 2: ‖x‖ ≤ ‖x₀‖/1000. Dial β back to exactly 0 and the right trajectory coincides with the left point for point — at β = 0 the momentum update is plain GD, word for word. Real training often uses β = 0.9, but that pairs with a different step size; on this canyon, with η\*, the best β sits near 0.5 — the chart shows it plainly. {#s3hint .hint}

::: strings
s3rightLab: Momentum (β = {beta})
s3pause: Pause
s3ro: both sides use η = η\* = <span>{eta}</span> (identical) · at step <span>{n}</span> · plain GD reached ε in <span>{gd}</span> steps · momentum reached ε in <span>{mo}</span> steps
s3na: not yet
:::

## Take a step after glancing at a few data points {#step4 h2=s4t}

::: strings
nav4: 4 Stochastic
:::

Step 4 · Stochastic Gradient {#s4k .step-kicker i18n=text}

::: html step4-1
s4batchLab: batch size (points seen per step)
s4step: Take a step
s4play: Play
s4reset: Reset
:::

Both losses in the readout are the true full-data loss, so the two paths can be compared fairly: SGD races ahead early on cheap steps, then hovers near the floor, jittering without settling — which is exactly why real training schedules shrink the learning rate over time. And keep the jitter in mind for one more step: it is not all downside — it can shake you out of places you should never have stopped at. {#s4hint .hint}

::: strings
s4e: Real training data is far too large to read in full before every step. The fix: at each step, sample a small handful of points (a batch), average their gradients, and step with that — **stochastic gradient descent (SGD)**. <a class="fourier-link" href="../../../probability/stochastic/monte-carlo/#step2">A small-sample average’s error is priced at 1/√N: Monte Carlo’s ledger →</a> On the left, the seeded dataset of {N} points and the two fitted lines (kept in sync with the parameters on the right); on the right, the loss terrain’s contours: the cyan path is full-batch GD, smooth and straight; the orange path is SGD looking at only batch points per step, wobbling its way down. Above each current point sit two arrows: cyan is the full-batch gradient (the true aim), orange is this step’s batch gradient (off target) — every SGD step aims slightly wrong, yet on average it aims right, and each step is far cheaper. Shrink the batch and the wobble grows; set it to full and the wobble vanishes — the two paths coincide point for point.
s4formula: L(w, b) = (1/N)·Σᵢ (w·xᵢ + b − yᵢ)², data seed = {seed}, N = {N}
s4bFull: full {N}
s4pause: Pause
s4ro: step k = <span>{k}</span> · full-batch GD’s true loss L = <span>{lg}</span> · SGD’s true loss L = <span>{ls}</span> · angle between this step’s batch gradient and the full gradient <span>{ang}°</span>
s4lastNote: " (final step: the pink arrow is the batch that produced this last step — there is no “next step” left to preview)"
cv4gd: full-batch GD
cv4sgd: mini-batch SGD
cv4true: full gradient
cv4batch: batch gradient
cv4fitG: full-batch GD line
cv4fitS: SGD line
cv4ols: best fit (closed form)
:::

## Saddles and false floors: zero gradient ≠ the bottom {#step5 h2=s5t}

::: strings
nav5: 5 Non-Convex
:::

Step 5 · Non-Convex Terrain {#s5k .step-kicker i18n=text}

The terrain of real AI is not a bowl. This f(x, y) = (x² − 1)² + y² + 0.3x has **two valleys of different depths** (the left one is deeper) and a **saddle point**: there the gradient is also zero, yet it is a floor along one direction and a ridge along the other — stand on it and two ways lead down, one way leads up. “Zero gradient” guarantees nothing in a non-convex world. Drop the ball from the three starts and watch fate fork; then look at start C: it sits almost exactly on the saddle (a hair to its right), where |∇f| ≈ 0.002 — with no noise, the ball can only creep along the ridge on that residual slope: at the default η it needs 34 steps to slide off the ridge, and it ends up in the shallower right valley. Turn on “a little noise” (each step adds a Gaussian kick of σ = 1.0 to the gradient — a small jitter elsewhere, but hundreds of times the gradient itself near the saddle) and 11 steps shake it off the ridge, into the deeper left valley no less. The readout below records each mode’s steps-to-leave-the-ridge under one shared criterion, so the two can be checked against each other — the very jitter from the last step, wearing its other face in real training. The critical-point markers on the chart are solved from ∇f = 0 and typed by the Hessian’s signs — not drawn by hand. {#s5e .explain}

f(x, y) = (x² − 1)² + y² + 0.3x, ∇f = (4x³ − 4x + 0.3, 2y) {#s5formula .formula i18n=text}

::: html step5-1
s5pLeft: Start A · outside the left valley
s5pRight: Start B · outside the right valley
s5pSaddle: Start C · on the saddle
s5etaLab: η · learning rate
s5noiseLab: a little noise (random kick added to each step’s gradient)
s5step: Take a step
s5play: Play
s5reset: Back to the current start
:::

The depth difference comes from the +0.3x term: it tilts the whole terrain slightly leftward. Without it the valleys would tie and the saddle would sit exactly at x = 0; with it, the saddle and both depths shift — and the markers on the chart are solved from the formula, so they would move with it. You cannot draw the loss terrain of a deep network, but “initialization picks your valley, noise helps you escape saddles” happens in real training every day. {#s5hint .hint}

::: strings
s5pause: Pause
s5ro: step n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span> · state: <b>{status}</b>
s5stGo: descending
s5stWellL: settled in the left valley — the deeper one
s5stWellR: settled in the right valley — a shallower local minimum (not the global best)
s5stWellNoiseL: in the left valley — still jittering around the floor (noise is on, so it never sits still)
s5stWellNoiseR: in the right valley — still jittering around the floor (noise is on, so it never sits still)
s5stSaddle: crawling near the saddle — gradient ≈ 0, but this is not a valley floor
s5stDiv: diverged (η too large — flew off the terrain)
s5esc: steps to leave the ridge (one shared criterion: |x − x<sub>saddle</sub>| first ≥ 0.5; start C, η = {eta}; recorded automatically per run, cleared when η changes): no noise <span>{plain}</span> · noise <span>{noise}</span>
cv5minL: deep valley (local min)
cv5minR: shallow valley (local min)
cv5saddle: saddle point
cv5start: start
:::

## Train a real model, right here {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Train It
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

::: html step6-1
:::

ŷ = w₁x + w₂y + b, L = (1/N)Σ(ŷᵢ − yᵢ)², θ ← θ − η·∇L(θ), boundary ŷ = 0.5 {#s6formula .formula i18n=text}

::: html step6-2
s6etaLab: η · learning rate (yours to command)
s6step1: 1 step
s6step10: 10 steps
s6play: Train (play)
s6reset: Back to the random start
c1h: Backpropagation = gradients, computed efficiently
c1: With a billion parameters you cannot probe them one at a time. **Backpropagation** runs the chain rule backward through the computation graph once and produces every parameter’s gradient at once — still this page’s ∇f, just computed cleverly.
c2h: Adam = momentum + per-parameter step sizes
c2: Step 3’s momentum banks direction; **Adam** additionally gives every parameter its own step size: for each direction it keeps a running average of how large the gradients there have been, and divides the gradient by that average before stepping. A direction whose gradients stay large has its actual step scaled back to the order of the learning rate η; a direction whose gradients stay small is relatively boosted — so step sizes across directions end up normalized to a comparable scale, instead of being dictated by whoever shouts the largest gradient. It is the two medicines of steps 2 and 3 combined, and the default choice of most training today.
c3h: Training a giant model = this loop × 10⁹
c3: Swap in a billion parameters and the text of the whole web, on terrain no one can draw, and the loop itself does not change by a single word: **compute the gradient, take a step, compute it again**. What GPU clusters do trillions of times per second is exactly what you just did by hand on this page.
s6fin: What you just did by hand — feel the slope, take a step, fear the launch, hope for a good valley — GPU clusters do trillions of times per second. The algorithm never got harder; the terrain just grew too big to see. **Walking downhill in the dark is the whole truth of training.**
s6lkEnt: What loss it minimises: cross-entropy and KL →
s6lkEig: Why the canyon is a canyon: principal axes and diagonalisation →
:::

::: strings
s6e: The finale uses everything from the five steps before it. The dataset is two seeded blobs of points ({N} in total); the model is the simplest **linear-regression classifier**: a line scores each point, ŷ = w₁x + w₂y + b, fitted to the 0/1 labels, and the line where the score is exactly 0.5 is the decision boundary. The line turns by the same old rule — take the gradient of the loss (mean squared error) with respect to the parameters, then θ ← θ − η·gradient. Starting from a random line (initial accuracy: barely ten percent), play and watch it swing into place: the boundary rotates above while the loss curve falls below, every point of that curve honestly computed from the current parameters on the full dataset — nothing pre-recorded. The η slider is yours: this loss is a quadratic, so once η passes 2/λ<sub>max</sub> ≈ 0.56 it blows up exponentially — crank it, blow the model up on the spot, and watch the loss honestly peg off the chart. The ball you launched in step 0 and the model you blow up here die the same death.
s6pause: Pause
s6ro: step k = <span>{k}</span> · loss L = <span>{loss}</span> · training accuracy <span>{acc}%</span> · w = (<span>{w1}</span>, <span>{w2}</span>), b = <span>{b}</span>{div}
s6div: " · <b>blown up</b> — the loss pegged off the scale (η too large); shrink η, reset, and go again"
s6cardsH: This page’s loop, scaled up, is the entire AI industry
cv6a: class A
cv6b: class B
cv6bnd: decision boundary
cv6lossT: loss curve L(k) (computed live, point by point)
cv6clip: loss off the chart (true value in the readout)
:::
