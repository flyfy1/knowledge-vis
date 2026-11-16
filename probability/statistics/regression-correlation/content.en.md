---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Regression & Correlation · The Best Line Through a Cloud
tagline: A cloud of points, a line and a number: the correlation r says how tightly they follow, the least-squares line says how best to fit them, and a few traps that fool people.
:::

## The more the cloud looks like a line, the closer r is to ±1 {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Correlation r
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: One number for “how tight”
:::

This step asks: how can one number say how neatly two quantities move together? The picture shows 80 points whose coordinates are standardised (centred on their own means). For each point multiply its horizontal deviation by its vertical deviation from the mean point: same direction (upper right or lower left, green) gives a positive product, opposite direction (red) a negative one. The **correlation coefficient r** is the average of these products scaled by how much each quantity varies, from −1 to +1: +1 is a perfect rising line, 0 shows no linear relation, −1 a perfect falling line. **What to do:** drag the set correlation ρ: the cloud turns from a round blob into a slanted streak, and green dots dominate when r is positive; the sample r never equals the set ρ exactly — press “New random points” to see sampling wobble. The data are simulated. {#s0e .explain}

::: html step0-2
s0cv: Scatter plot: green points deviate in the same direction, red in opposite ones; dashed lines mark the means
newPts: New random points
rhoL: Set correlation ρ
:::

::: strings
legPos: same-direction deviation (product > 0)
legNeg: opposite-direction deviation (product < 0)
s0ro: Set ρ = {rho}: sample r = {r}; {pos} same-direction points, {neg} opposite-direction points.
:::

## Which line counts as “best” through these points? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Least squares
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: The best-fitting line
:::

This step asks: for 12 points, which line y = m·x + b has the smallest total gap to them? The vertical distance from a point to the line is its **residual**; draw each residual as a square (area = residual²) and the total area is the **sum of squared errors** (SSE). The **least-squares line** is the one that makes SSE smallest. **What to do:** change the slope m and intercept b and watch the total orange area (the SSE in the readout) grow and shrink; press “Show least-squares line” to see the dashed green line, or “Snap to best” to set the sliders to the optimum (slope rounded to 0.05), where the SSE bottoms out below any other line’s. {#s1e .explain}

::: html step1-2
s1cv: 12 points, your line (cyan) with residual squares (orange); the green dashes are the least-squares line
showBest: Show/hide least-squares line
snapBest: Snap to best
slopeL: Slope m
interL: Intercept b
:::

::: strings
legSq: orange square area = residual²
s1ro: Your line y = {m}x + {b}: SSE = {sse}; least-squares line y = {bm}x + {bb}: SSE = {bsse}; yours is {gap} higher.
:::

## Add one outlier: how much does the line tilt? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One outlier
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: One point can pull everything
:::

This step asks: can a single odd point change the conclusion? Drag the red point; the cyan line is the least-squares line including it, the grey dashed line excludes it. Least squares punishes residuals by their **square**, so far-away points have outsized say, and points at the ends of the x range (very small or very large x) have extra **leverage**. **What to do:** first put the red point in the middle (x ≈ 7) and move it up and down: the line hardly moves; then put it at the far right (x = 21) and move it up and down: the slope swings widely and r moves with it. Moral: look at the plot before trusting a correlation number. {#s2e .explain}

::: html step2-2
s2cv: 12 normal points plus one movable outlier (red): fitted lines with and without it
xoL: Outlier x
yoL: Outlier y
:::

::: strings
outlier: outlier
legWithout: line without the outlier
legWith: line with the outlier
s2ro: Outlier ({xo}, {yo}): slope goes from {m0} to {m1}; r from {r0} to {r1}.
:::

## Ice-cream sales and drownings rise together — does ice cream cause drowning? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Not causation
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Correlation is not causation
:::

This step asks: if two quantities are correlated, does one cause the other? This simulates 150 days where each day’s temperature T drives both “ice-cream sales” and “drownings”, with no direct effect between them; yet pooled together, sales and drownings correlate strongly (red line). A **confounder** is a third quantity that affects both (here the temperature). Press “Split into five temperature bands”: inside each band the temperature varies little and every line flattens, with a much smaller within-band r of mixed sign. **What to do:** compare the overall r with the within-band r: the correlation comes from temperature, not from ice cream. To establish causation you usually need an experiment (random assignment) or to control the confounders. {#s3e .explain}

::: html step3-2
s3cv: Sales and drownings over 150 days: an upward trend overall, a much weaker one within each temperature band
splitBtn: Split into five temperature bands / merge
:::

::: strings
xLab3: ice-cream sales (portions)
yLab3: drownings (people)
s3ro: Overall r = {r}; within the five bands the mean r is {rmean} and the largest |r| {rmax}; temperature vs sales r = {rT}, temperature vs drownings r = {rT2}.
:::

## If r is near 0, are the two quantities unrelated? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 r misses curves
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: What r cannot see
:::

This step asks: does r detect every kind of relationship? No: r only measures **linear** association. Four data sets: a noisy line with r near +1; a parabola y = x² (a perfectly determined relation!) which is symmetric so r is about 0; a ring with r about 0; and a cloud of unrelated points plus one far point whose r comes out large (a fake correlation held up by a single point). **R²** is r squared, the share of the variation the line “explains”. **What to do:** press the four buttons in turn and compare the red dashed least-squares line with the shape of the points and with r. Moral: always draw the scatter plot first. {#s4e .explain}

::: html step4-2
s4cv: Four shapes of scatter plot with their least-squares lines
sh_line: Line with noise
sh_curve: Parabola y = x²
sh_ring: Ring
sh_outlier: Unrelated + 1 far point
:::

::: strings
note_line: r is large and a line really fits
note_curve: a perfectly determined relation that is not a line, so r is almost 0
note_ring: the two quantities constrain each other on a ring, yet the linear correlation is 0
note_outlier: there is no relation at all, but one far point props up a large r
s4ro: {shape}: r = {r}, R² = {r2}. {note}.
:::

## Do children of tall parents end up a bit shorter than their parents on average? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Regression to the mean
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Regression to the mean
:::

This step asks: why are children of “extreme” parents on average less extreme? The plot simulates 300 parent–child height pairs (mean 170 cm, standard deviation 7 cm) with correlation ρ. The grey dashes are y = x (“child as tall as parent”), the green line is the least-squares line whose slope is about ρ. For ρ &lt; 1 the fitted line is flatter than y = x, so the tallest 10% of parents (orange dots) have children closer to 170 on average — **regression to the mean**. It is not heredity “pulling back”; it is that parent height explains only part of child height. **What to do:** drag ρ: at ρ = 1 the big orange dot sits on y = x; the smaller ρ, the lower it falls toward the mean. {#s5e .explain}

::: html step5-2
s5cv: Parent and child heights: y = x (grey dashes), least-squares line (green), the average of the tallest 10% of parents (orange)
rho5L: Parent–child correlation ρ
recapTitle: Recap
recap1: r measures how tightly a relation follows a line (−1 to +1); the least-squares line minimises the sum of squared vertical residuals; R² = r² is the share of variation the line explains.
recap2: r is pulled by outliers and high-leverage points and nearly blind to curves; an overall correlation can come from a confounder and is not causation.
recap3: When ρ < 1, extreme values’ predictions “regress to the mean”: a statistical effect, not a force pulling back.
modelTitle: Scope and limits of this model
modelText: Scope: all data are simulated with seeded pseudo-random numbers, not measured; correlation assumes a bivariate normal; least squares counts only vertical errors; the “causation” in step 3 is a constructed simulation (real confounders are usually unknown); the “heredity” in step 5 is just a correlation parameter, not a genetics model.
link1: → Gradient descent: fitting the same way, by walking downhill step by step
link2: → Mean, median and mode: how one number summarises many
link3: → Statistical inference: how far a sample r can stray from the true ρ
:::

Page complete. {#done .readout .success i18n=text}

::: strings
xLab5: parent height (cm)
yLab5: child height (cm)
legId: child = parent
legFit: least-squares line
s5ro: ρ = {rho}: fitted slope {slope}; the tallest 10% of parents ({n} pairs) average {pm} cm ({gap} above the mean) and their children average {cm} cm ({cgap} above the mean).
docTitle: Regression & Correlation · The Best Line Through a Cloud
:::
