---
lang: en
---

::: strings
docTitle: Kalman Filter · Combining Predictions and Measurements · One Interaction per Step
back: ← Knowledge Index
pageTitle: Kalman Filter · Correcting Predictions with Measurements
tagline: A phone reports a jittery location. How can we estimate where its user actually is? A Kalman filter predicts a position using a motion model, then corrects it with a new sensor reading. The model is a simplified description of how motion works. The correction depends on how uncertain the prediction and the reading are. This page uses reproducible simulated data.
foot: visual.integ.life · Kalman Filter — one interaction per step
lgTruth: True position
lgMeas: Measurements (crosses)
lgEst: Kalman estimate
lgMa: Moving average
lgRaw: Raw measurements
:::

## The readings jitter. Where is the object? {#step0 h2=s0t}

::: strings
nav0: 0 Estimate a Position
:::

Step 0 · Estimate a Position {#s0k .step-kicker i18n=text}

The question: **can noisy readings give us a better estimate of position?** An object moves along a straight line. The horizontal axis shows time steps; the vertical axis shows position. Each cross is a sensor reading. Readings differ randomly from the true position; this random error is called noise. Guess how the position changes, then press “Run the Kalman filter”. Reveal the true position to check the estimate. Phone navigation faces a similar, more complex problem. {#s0e .explain}

::: html step0-1
s0run: Run the Kalman filter
s0reveal: Reveal the true position
s0reset: Reset
:::

For this scene, each true position is the previous one plus a random change (σ = 0.25): a random walk. At step 45, an extra +3 jump is added. Each measurement is truth plus Gaussian noise (σ = 1.0): small errors are more common than large ones, with positive and negative errors equally likely. Seed 7 fixes the random generator’s starting point so the data can be reproduced. The step-0 filter uses Q = 0.0625 and R = 1. Q is the variance of the change the model cannot predict; R is the measurement-error variance. Variance is standard deviation squared. These settings match the random noise, but do not anticipate the jump. Step 3 uses a different scene to explore tuning. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro0: Not run yet. The crosses are position readings; the true positions are hidden. Noise σ = 1.0. Here σ is the standard deviation: a measure of typical error size, not a maximum error.
s0roRun: The cyan estimate is ready. Reveal the true position to compare RMSE (root mean square error): square each error, average the squares, then take the square root. It has the same units as position; smaller is better.
s0roDone: RMSE over the same 90 points: raw readings = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>. The estimate has about {pct}% of the raw readings’ RMSE. This result applies to this dataset. Step 2 shows how the estimate is calculated.
:::

## Why can an average lag behind? {#step1 h2=s1t}

::: strings
nav1: 1 Readings vs. Averages
:::

Step 1 · Compare Two Simple Methods {#s1k .step-kicker i18n=text}

The question: **what do we gain and lose by averaging the readings?** Use the same data as before. A raw reading responds immediately to a change, but includes all the sensor noise. A moving average takes the mean of the latest W readings. Some random errors cancel, but older positions remain in the result. After the jump at step 45, it takes W steps for the window to contain only readings from after the jump. Once the window is full, each reading has weight 1/W; at the start, we average the readings available. {#s1e .explain}

::: html step1-1
s1wLab: W · number of recent readings to average
s1showRaw: Raw measurements (connected)
s1showMa: Moving average
s1showKf: Kalman estimate
:::

Increase W and look for less jitter and a slower response after step 45. Then reduce W and compare the RMSE values. Judge smoothness and accuracy separately; changing W can change which method ranks best. A Kalman filter calculates the new reading’s weight from prediction and measurement uncertainty. We unpack that calculation next. The weight can also settle to a constant. {#s1hint .hint}

::: strings
s1ro: Position RMSE (root mean square error: square each error, average them, then take the square root — same units as position, smaller is better) on the same data: raw readings = <span>{rr}</span> · moving average (W = {w}) = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>
:::

## How much should a new reading change the prediction? {#step2 h2=s2t}

::: strings
nav2: 2 Predict–Update
:::

Step 2 · Predict–Update {#s2k .step-kicker i18n=text}

The question: **how much should a new reading change our position estimate?** The filter stores an estimate x̂ and an error variance P. A larger P means the filter considers its estimate less certain. Each Gaussian curve is bell-shaped: its horizontal axis is possible position, and a higher curve means nearby positions are more likely. Its centre is x̂ and its width is set by the standard deviation √P. **Predict:** this model assumes no average change in position, so x̂⁻ stays at x̂ while P grows by the disturbance variance Q. The superscript ⁻ means “before using the new reading”. **Update:** z is the new reading and R its error variance. The Kalman gain K is the fraction of the gap to z that we correct. The updated estimate, called the posterior, feeds the next prediction — the same rhythm as Bayesian updating: <a class="fourier-link" href="../../../probability/inference/bayes-updating/#step3">yesterday’s posterior is today’s prior →</a>. We use Q = 0.0625 and R = 1, as in step 0. The formulas give the prediction, the correction fraction, and the updated result, in that order. {#s2e .explain}

Predict: x̂⁻ = x̂ , P⁻ = P + Q ｜ Gain: K = P⁻ / (P⁻ + R) ｜ Update: x̂ = x̂⁻ + K·(z − x̂⁻) , P = (1 − K)·P⁻ {#s2formula .formula}

::: html step2-1
s2trajTitle: Accumulated trajectory: one more point below for every reading processed (x-axis = step k, y-axis = position)
s2nextPred: Predict one step →
s2play: Play 10 steps
s2reset: Reset
:::

Order to try: press “Predict one step” — the curve above widens, and the end of the trajectory band below flares open (that is P growing). Then press “Update with the measurement” — the band narrows and the new estimate point lands on the trajectory. For the long-run effect, press “Play 10 steps”: the filter swallows ten readings at once, and the thing to watch is the trajectory below — estimate points appear one after another, the band keeps narrowing, and once P reaches its steady state it barely falls further. Note that P is uncertainty computed from the model, not a live measurement of the actual error: when the true position jumps at step 45, P does not grow on its own — the estimate has to catch up through the readings that follow. With R fixed, a larger P⁻ gives a larger K; with P⁻ fixed, a larger R gives a smaller K. Next, adjust Q and R to see how the settings affect the result. {#s2hint .hint}

::: strings
s2nextUpd: Update with the measurement →
s2stop: Stop
s2roInit: Start with the first reading as the position estimate: x̂ = z[0] = <span>{x0}</span>. The initial error variance is P₀ = 1; the subscript ₀ marks the starting value. Press “Predict one step” to begin step 1.
s2roPred: Prediction for step {k}: the position estimate stays at x̂⁻ = <span>{xp}</span>. Error variance grows to P⁻ = P + Q = <span>{pp}</span>, giving standard deviation √P⁻ = {sp}. Cyan is the prediction; grey is the previous updated estimate. Press “Update with the measurement” to use z[{k}].
s2roUpd: How far do we correct? K = P⁻ / (P⁻ + R) = <span>{K}</span>. The measurement minus the prediction, called the innovation, is z − x̂⁻ = <span>{res}</span>. The corrected estimate is x̂ = <span>{x}</span>. Error variance falls to P = (1 − K)·P⁻ = <span>{p}</span>. Green is the updated distribution. The estimate moves about {kpct}% of the gap from prediction to reading. Orange is centred on the reading z = {z}: it shows how well each possible position explains this reading, with width set by R.
s2roDone: Last step reached (k = {k}). Press “Reset” to inspect prediction and update again.
cvPost: Previous updated estimate
cvPred: Predicted distribution
cvMeasBell: Measurement likelihood (R)
cvPostNew: Updated estimate
s2tjBand: Uncertainty band x̂ ± √P
s2tjPred: Prediction: band widens first
s2tjWiden: Band widens: √P → √P⁻
s2tjExagg: Scale pair exaggerated, same scale
s2tjSqrtP: √P = {v}
s2tjSqrtPm: √P⁻ = {v}
s2prog: Progress: <span>{done}</span> / {total} readings processed (the 1st reading serves as the starting estimate) · error variance P: {p0} → <span>{p}</span> (steady state ≈ {ps}; once close, P barely falls further)
:::

## How do Q and R change the correction? {#step3 h2=s3t}

::: strings
nav3: 3 Adjust Q and R
:::

Step 3 · Adjust Q and R {#s3k .step-kicker i18n=text}

The question: **how can we follow a change without following every bit of noise?** This is a new simulated scene. The true position drifts slowly (per-step disturbance σ = 0.05), then jumps by +4 at step 40, marked by the grey dashed line. Measurement noise is σ = 1. The sliders leave the data unchanged; they change the filter’s assumptions. **Q** is the variance of changes the model cannot predict; **R** is the measurement-error variance. Alongside RMSE, compare two recovery measures. **Entry steps** counts elapsed steps from the jump until the estimate first lies within ±0.5 of the truth. **In-band share** is the fraction of steps, starting with the jump itself, that stay in that range. A smaller entry count means a faster response; a larger share means more time close to the truth. {#s3e .explain}

::: html step3-1
s3qLab: Q · variance of unpredicted changes
s3rLab: R · measurement-error variance
s3kLab: Steady-state gain K: the fraction of the gap from prediction to new reading that the estimate moves.<br>With Q and R fixed, this fraction settles over time: its steady state. This run starts at P₀ = 1, so its early gains differ slightly from the steady value shown here. Step 4 explains why.
s3pModel: Favour the prediction
s3pBalanced: Middle setting
s3pMeas: Favour new readings
:::

Select each preset and compare the fixed examples below. The left setting has a small K and corrects slowly; on these data, its RMSE exceeds the raw readings’ RMSE. The right setting enters the error band in 1 step but stays there only about half the time: it responds quickly and follows more sensor noise. The middle setting enters more slowly, but spends the most time in the band and has the lowest RMSE. Now change only Q or only R and watch the main plot and K. **This ranking belongs to this scene.** Estimate the parameters from unmodelled motion and sensor errors, then check them against data. {#s3hint .hint}

::: strings
s3ro: Results for the current Q and R: position RMSE (root mean square error, smaller is better) = <span>{rk}</span> · entry steps = <span>{entry}</span> · in-band share = <span>{share}</span> · raw-reading RMSE = <span>{rr}</span>
s3roNever: never entered
s3miniK: steady K = {K}
s3roFmt: entry steps: {entry} · in-band {share}
s3miniRo: Q = {q}, R = {r} · steady K = <b>{k}</b> · position RMSE <b>{rmse}</b> · entry steps <b>{entry}</b> · in-band share <b>{share}</b>
cvJump: Position jump (step 40)
:::

## Why does the correction fraction settle? {#step4 h2=s4t}

::: strings
nav4: 4 When Weights Settle
:::

Step 4 · Steady State {#s4k .step-kicker i18n=text}

The question: **what happens to K when Q and R stay fixed?** Run this example for 300 steps with Q = 0.04 and R = 2. The upper plot compares different initial variances P₀. Both approach the same value: they converge to a fixed point. In this model, each P is calculated from the previous P, Q and R, without using the reading itself. At the fixed point, P = (P + Q)·R / (P + Q + R): another update leaves P unchanged. This is the algebraic Riccati equation for this example; the dashed line marks its solution. The vertical axis uses a logarithmic scale: equal distances represent equal ratios, not equal differences. {#s4e .explain}

::: html step4-1
:::

Compare the plots. Above, P and K settle; below, updating position with a fixed K is exponential smoothing. Q and R determine the settled α. This equivalence applies to the one-dimensional random-walk model on this page; other motion models need not reduce to this smoother. **A sudden change in real motion does not automatically change P or K here.** Those change when the model, Q, R or available measurements change. Next we use a model that predicts both position and velocity. {#s4hint .hint}

::: strings
s4ro1: Steady values (\* marks steady state): P\* = <span>{pss}</span>, K\* = <span>{kss}</span>. After 300 steps, P₀ = 10 gives <span>{p1}</span> and P₀ = 0.01 gives <span>{p2}</span>; the difference is <span>{dp}</span>. Substituting P\* into the equation leaves a difference of <span>{res}</span> between the two sides. Tiny differences reflect finite computer precision.
s4ro2: The lower plot asks: can a fixed correction fraction reproduce the settled Kalman estimate? Exponential smoothing always corrects by the same fraction α: y ← y + α(z − y), where y is the smoothed estimate. At step 250, start it from the Kalman estimate and set α = K\*. The largest pointwise difference over the next 50 steps is <span>{md}</span>. Both methods start together and receive the same readings. In this run, K has settled to K\* at computer precision, so the curves overlap. This does not make the methods identical from arbitrary starting points.
cvP10: P[k] (P₀ = 10)
cvP001: P[k] (P₀ = 0.01)
cvPss: Steady error variance P\*
cvEqK: Kalman (recursion continues)
cvEqS: Exponential smoother (α = K\*)
:::

## How can we estimate velocity from position readings alone? {#step5 h2=s5t}

::: strings
nav5: 5 Position and Velocity
:::

Step 5 · Estimate Position and Velocity {#s5k .step-kicker i18n=text}

::: html step5-1
s5e: The question: **can we estimate velocity when the sensor measures only position?** The cart still moves along a straight line. “Two-dimensional” means a state with two components, [position, velocity], rather than motion across a plane. A state is the set of quantities we want to track. The sensor **measures position only** (crosses; noise standard deviation σ = 1.2). The model predicts constant velocity: next position is current position plus velocity times elapsed time. Successive position readings constrain velocity, so a position correction can also correct the velocity estimate. Here dt = 1 is the time between steps. The cart starts at constant velocity, reverses at step 60, then speeds up later. The shading marks the changed-motion interval. The matrices below are tables that encode the prediction and measurement rules; you can follow the plots without knowing matrix arithmetic; to read the principal directions of the covariance matrix P, see <a class="fourier-link" href="../../../math/linear-algebra/eigenvectors/#step5">step 5 of the eigenvalues page: the direction of largest variance</a>.
s5manOn: Velocity changes: on (reverse + speed up)
s5manOff: Velocity changes: off (constant velocity)
s5qLab: q · strength of unmodelled disturbances
s5pSmall: q = 0.0005 · expect little velocity change
s5pMid: q = 0.02 · moderate disturbance strength
s5pBig: q = 0.2 · allow more velocity change
s5hint: Compare the three q presets, then turn velocity changes off and check whether their ranking changes. With changes on in this dataset, a small q makes velocity corrections slow; after the reversal, position error can exceed 2. A large q makes the estimate respond more strongly to sensor noise. The middle preset has lower overall error. q does not change the cart’s motion. It changes how much error the filter allows in its motion model. Estimate it from departures from constant velocity, then check against data.
:::

::: strings
s5matNote: Reading the matrices: F predicts the next state from position and velocity. H selects position, matching the sensor. Q describes disturbances the model cannot predict, with strength set by q; R is the position-reading error variance. P is now a covariance matrix: its diagonal entries are the position- and velocity-error variances, and its off-diagonal entries describe how those errors vary together.
s5symNote: Implementation note: after each update, P is replaced by (P + Pᵀ)/2 to remove asymmetry from computer rounding; Pᵀ swaps rows and columns. Before this correction, the asymmetry stays at or below 1.7e-16 throughout the run. This tiny numerical discrepancy is not an error in position or velocity.
s5eOff: The question: **can we estimate velocity from position readings alone?** The cart moves along a line. Its state [position, velocity] contains the two quantities we track; this is the sense of “two-dimensional” here. The sensor **measures position only** (noise standard deviation σ = 1.2). The constant-velocity model predicts next position as current position plus velocity times elapsed time. Successive position readings also constrain velocity. **Velocity changes are off:** the cart travels at 0.35 throughout, matching the model’s assumption. Sensor noise is the same seeded sequence used with changes on; only the true motion differs. Toggle the buttons to compare when the model fits the motion and when it does not. The matrices below encode prediction and measurement; dt = 1 is the time between steps.
s5roOff: Position RMSE (root mean square error, smaller is better) over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Final error covariance P = \[[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.
s5hintOff: With constant velocity throughout, the small-q preset is the most accurate here because its assumption fits the motion. Turn velocity changes back on: the true velocity changes at steps 60 and 110. The constant-velocity model cannot anticipate these changes and must catch up using later position readings. Both modes use the same noise, making them a useful comparison of model mismatch: the gap between assumed and actual motion.
s5ro: Position RMSE (root mean square error, smaller is better) over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Largest position error during steps 60–80 = <span>{mx}</span>. Final error covariance P = \[[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model, rather than the actual errors above. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.
cvPos: Position
cvVel: Velocity
lgPosTrue: True position
lgPosEst: Estimated position
cvMan: Changed-motion interval (steps 60–110)
lgVelTrue: True velocity
lgVelEst: Estimated velocity
:::

## Why does this update work, and where is it useful? {#step6 h2=s6t}

::: strings
nav6: 6 Principles and Uses
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The question: **what justifies this weighting, and how does it connect to real applications?** Bayesian updating means revising an existing judgment using new evidence. The prediction distribution is the prior. The likelihood describes how well each possible true position explains the reading. Combining them gives the posterior. With a Gaussian prior and independent Gaussian measurement error, the updated mean in step 2 is a precision-weighted average. Precision is 1/variance, so a smaller variance gives more weight. The site’s Bayes page illustrates the same idea with discrete, binary hypotheses; no prior reading is needed here. For control, imagine using estimated cart position and velocity to decide when to accelerate or brake. With a linear model, quadratic costs and Gaussian noise, among other conditions, Kalman estimation can be combined with optimal control as LQG: linear-quadratic-Gaussian control. A quadratic cost penalises squared errors and control effort. {#s6e .explain}

::: html step6-1
s6card1T: Apollo navigation
s6card1: In Apollo navigation in the 1960s, an extended form of Kalman filtering helped estimate spacecraft motion. The idea is the one explored here: predict position and velocity with a motion model, then correct the estimate with noisy observations. Spacecraft motion requires a more detailed model.
s6card2T: Phones & sensor fusion
s6card2: Phone navigation can combine GPS positions with inertial sensors: accelerometers measure acceleration, and gyroscopes measure rotation. Combining information from different sensors is called sensor fusion. Kalman-based methods can predict motion, correct it with position readings, and weight the information by its uncertainty. A map dot may also be adjusted to match nearby roads. Its smoothness alone does not reveal which algorithm produced it.
s6card3T: The nonlinear world
s6card3: A turning vehicle may need more than the simple linear relationships used here. A linear relationship expresses an output as a weighted sum of inputs; a curved relationship may be nonlinear. Common extensions include the extended Kalman filter (EKF), which uses a local linear approximation; the unscented Kalman filter (UKF), which passes representative points through the nonlinear model; and particle filters, which approximate a distribution with many candidate states and adjust their weights using observations. Each has approximation errors and computational costs. For a linear Gaussian system with correct model and noise assumptions, the standard Kalman filter gives the minimum mean-square-error estimate. Bad readings or a wrong model can still produce poor practical results.
s6fin: Return to the location problem: **predict a position, correct it with a reading according to uncertainty, and repeat.** Here, simulated truth lets us check accuracy. Real navigation rarely offers that answer key. P reports uncertainty calculated from the model; a poor model or poor parameters can make it overconfident. A phone location jumping between tall buildings may involve signal reflections or other problems. It does not tell us that P is growing. When reading an estimate, ask what it says, what it assumes, and how its error can be checked.
s6lkB: Bayesian updating: revise an estimate with evidence →
s6lkC: Feedback and control: act on an estimate →
s6lkE: Eigenvalues: the principal directions of covariance →
s6lkL: Impulse and LTI: linear time-invariant systems →
:::
