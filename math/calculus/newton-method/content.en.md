---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Newton’s Method · Leap to the Root Along a Tangent
tagline: Replace the curve by its tangent and jump to where the tangent hits zero; each jump roughly doubles the correct digits. The ways it fails are drawn too.
:::

## Can’t see the curve? Use its tangent instead {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One tangent jump
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Where the tangent hits zero
:::

This step asks: how can one tangent line take a guess and give a better guess for where the curve crosses zero? A **root** is an x with f(x) = 0 (where the curve meets the x-axis). Here f(x) = x² − 2, with root √2 ≈ 1.41421. Draw the [[derivative#step1|tangent]] at the start x₀ (its slope is the derivative f′(x₀)); where it meets the x-axis is x₁ = x₀ − f(x₀)/f′(x₀). **What to do:** drag the start x₀. Orange is the tangent and vertical drop, green is x₁, violet is the true root. Check whether x₁ is always closer to violet than x₀. The slider changes the starting guess, not the function. {#s0e .explain}

::: html step0-2
s0cv: The curve y = x² − 2, the tangent at the start, and where it meets the x-axis
startL: Start x₀
:::

::: strings
trueRoot: true root √2
x1Label: x₁
x0Label: x₀
s0ro: x₀ = {x0}: f = {f}, f′ = {d} → x₁ = x₀ − f/f′ = {x1}; the error |x − √2| goes from {e0} to {e1}.
:::

## Make each landing point the next start {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Iterate
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Repeat the jump
:::

This step asks: if one jump is not enough, what happens when you keep going? **Iteration** means feeding each output back in as the next input: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). Press “Step” to go one jump at a time, or “Run” to keep going (up to 12 steps, pausable). Grey tangents are old jumps; orange is the newest. The **error** is the distance from xₙ to the true root, and “correct digits” ≈ −log₁₀(error). Try other functions; changing function or start clears the history. {#s1e .explain}

::: html step1-2
s1cv: Successive tangent jumps: each landing point becomes the next start
stepBtn: Step
run: Run
resetBtn: Back to start (clear history)
:::

::: strings
pause: Pause
iterCount: {n} steps so far
s1ro: Step {n}: x = {x}, error {e}, about {dg} correct digits (true root {r}).
:::

## Each step roughly doubles the correct digits {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Digits double
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: How fast it converges
:::

This step asks: how much faster is Newton than “halve the bracket” bisection? Orange bars show the correct digits after k Newton steps; violet bars show the digits after k bisections on [1, 2] (each adds only about 0.3 digits). When the start is near enough, Newton’s error obeys eₙ₊₁ ≈ C·eₙ², and squaring doubles the digits; bars stop at 15 because floating point holds about 16 significant digits. **What to do:** change the start x₀ and check that the orange bars still shoot to the top in a few steps; a start farther from the root makes the first steps slower. {#s2e .explain}

::: html step2-2
s2cv: Correct digits: orange Newton, violet bisection
:::

::: strings
digitsAxis: correct digits
stepAxis: step k
legNewton: Newton
legBisect: Bisection (bracket [1,2])
s2ro: Start x₀ = {x0}: Newton has {d1} / {d2} / {d3} / {d4} correct digits after steps 1–4; bisection has only {b4} after 4 halvings.
:::

## A tangent doesn’t always lead you home {#step3 h2=s3t pre=1}

::: strings
nav3: 3 When it fails
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: It can fail
:::

This step asks: when does Newton’s method get lost? The function f(x) = x³ − 2x + 2 has a single real root (about −1.77). When the **tangent is horizontal** (f′ = 0) it never meets the x-axis, so there is no next step; a **cycle** means the iterates hop between a few points forever; **lost** means the root was not reached within 60 steps. Try the presets: x₀ = 0 bounces between 0 and 1 for ever; near x₀ = 0.8165 the tangent is almost flat and one step throws you far away. The first jumps are drawn red. **What to do:** read the path in the readout to see which kind of start you chose. {#s3e .explain}

::: html step3-2
s3cv: f(x) = x³−2x+2: the first tangent jumps, shown in red
pre0: x₀ = 0 (cycles)
pre1: x₀ = −2
pre2: x₀ = 0.8165 (nearly flat tangent)
pre3: x₀ = 1.5
:::

::: strings
kRoot: converges to the root
kCycle: stuck in a cycle
kFlat: flat tangent, cannot continue
kLost: no root within 60 steps
s3ro: Start {x0}, f′(x₀) = {fd}; path {seq} … → {kind}.
:::

## Three roots: whichever basin you start in sends you there {#step4 h2=s4t pre=1}

::: strings
nav4: 4 The start decides
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: The start decides the end
:::

This step asks: with several roots, how does the start choose which one Newton’s method finds? f(x) = x³ − x has roots −1, 0 and 1. The strip below colours each starting point by the root it ends at (violet → −1, orange → 0, cyan → 1, grey = never arrived); the white bar marks the current start. A stretch of one colour is a **basin of attraction**. **What to do:** use the presets or drag, and watch how the colours interleave near ±0.577, where the tangent is flat: a tiny shift of the start can change the destination completely. {#s4e .explain}

::: html step4-2
s4cv: f(x) = x³−x and the strip coloured by destination root
:::

::: strings
basinAxis: start x₀ from −2 to 2; colour = root finally reached
s4ro: Start {x0} → reaches root {r} after {n} steps.
s4roNo: Start {x0} → {kind}.
:::

## Square roots: Newton versus bisection {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Versus bisection
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Wrap up with a calculation
:::

This step asks: for the same √a, where does Newton beat [[binary-search#step1|bisection]]? Computing √a means solving f(x) = x² − a = 0, and one Newton step is x → (x + a/x)/2. The orange line is Newton’s error; violet is the error of bisection on [0, a] (log scale: each grid line down is ten times smaller); the green dashed line is the 10⁻¹⁰ tolerance. **What to do:** drag a and watch orange cross green in a handful of steps while violet takes dozens; the readout counts both. {#s5e .explain}

::: html step5-2
s5cv: Error against steps (log axis): Newton versus bisection
aL: Number under the root, a
recapTitle: Recap
recap1: One Newton step: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ), the tangent’s x-axis crossing; near a simple root the error is squared each step, roughly doubling the correct digits.
recap2: It can fail: f′ = 0, cycles, or a start too far away; with several roots, the basin you start in picks the answer.
recap3: The price: you need the derivative and a decent start. Bisection is slower but safe: it only needs the root bracketed.
modelTitle: Scope and limits of this model
modelText: Scope: one variable, smooth function, real roots; the bisection comparison uses brackets [1,2] and [0,a]; errors use double-precision floats, so digits cap near 15. “Digits double” holds only for a start near enough and f′(root) ≠ 0; at a repeated root the convergence is only linear, which this page does not show.
link1: → Derivatives: where the tangent slope comes from
link2: → Gradient descent: another iteration, this time hunting a minimum
link3: → Binary search: the safe “halve it” idea
:::

Page complete. {#done .readout .success i18n=text}

::: strings
errAxis: error (log scale)
tolLine: tolerance 10⁻¹⁰
s5ro: √{a} ≈ {r}: Newton reaches error < 10⁻¹⁰ in {nN} steps, bisection needs {nB}.
docTitle: Newton’s Method · Leap to the Root Along a Tangent
:::
