---
lang: en
---

::: strings
docTitle: Population Growth · Where the S-Curve Comes From — One Interaction per Step
back: ← Knowledge Index
pageTitle: Population Growth · Where the S-Curve Comes From
tagline: With no ceiling, a population multiplies wildly; with a carrying capacity K, growth slows as N nears K and the curve bends into an S. Every count, growth rate and doubling time on this page is computed live by iteration and formula — no curve is hand-drawn. The bacteria scenario is illustrative; all numbers are simulated.
navLabel: Step navigation
foot: visual.integ.life · Population Growth — one interaction per step
:::

## Doubling every generation: guess first, then count {#step0 h2=s0t}

::: strings
nav0: 0 Doubling
:::

Step 0 · The Doubling Sprint {#s0k .step-kicker i18n=text}

One question only: **how fast is “times two every generation”?** Start from 1 bacterium, doubling each generation. Place a mental bet: how many at generation 10? — then click “Next generation” and let the number grow itself. {#s0e .explain}

::: html step0-1
s0next: Next generation →
s0reset: Reset
:::

Takeaway: **the signature of exponential growth is multiplying by the same factor each step**. It looks tame only while the base is small. {#s0conc .readout}

::: strings
s0ro: Generation <b>{g}</b>: <b>{n}</b> (= 2<sup>{g}</sup>, computed).
s0ro10: Generation 10 revealed: <b>{n}</b>. If you bet on 20 or 100, you were far off. The bacteria are not special; “multiply by 2 every step” is simply that violent.
s0gen: gen
s0count: count
:::

## Not just doubling: r sets the steepness {#step1 h2=s1t}

::: strings
nav1: 1 Growth Rate r
:::

Step 1 · Growth Rate r {#s1k .step-kicker i18n=text}

Real populations need not double; growth may be much slower. Generalise the factor into a continuous **growth rate r**: N(t) = N₀·e<sup>rt</sup>. Drag r and watch the curve and the **doubling time** (= ln2 / r) change. {#s1e .explain}

::: html step1-1
s1rLab: Growth rate r (per time unit)
:::

Takeaway: r need not match a whole multiple — even with r = 0.2, as long as growth stays proportional, the shape is exponential; only the speed changes. {#s1conc .readout}

::: html step1-2
s1lk: Foundation: the Exponentials & Logarithms page works out e<sup>x</sup> and ln in full →
:::

::: strings
s1ro: r = {r}: doubling time = ln2 / r ≈ <b>{td}</b> time units; at t = {T}, N = 10·e<sup>{r}×{T}</sup> ≈ <b>{n}</b>.
:::

## Enter carrying capacity K: the curve bends {#step2 h2=s2t}

::: strings
nav2: 2 A Finite World
:::

Step 2 · A Finite World {#s2k .step-kicker i18n=text}

The dish is only so big, the food only so much. Introduce **carrying capacity K**: each generation’s effective rate becomes r·(1 − N/K) — as N nears K this term nears 0 and growth stalls. Same parameters, two lines: teal ignores K (exponential), orange obeys K (logistic). Watch where they part ways. {#s2e .explain}

::: html step2-1
s2rLab: Growth rate r
s2kLab: Carrying capacity K
:::

Takeaway: **the S is not drawn — it falls out of “the fuller it gets, the harder to grow”, iterated**: exponential-like early, steepest midway, flattened by (1 − N/K) late. {#s2conc .readout}

::: strings
s2ro: Generation {g}: exponential N ≈ <b>{ne}</b>; logistic N = <b>{nl}</b>, effective rate now = r·(1 − N/K) = <b>{eff}</b> (it started near r = {r}).
s2exp: Exponential (no K)
s2log: Logistic (with K)
:::

## Start above K — it still comes back {#step3 h2=s3t}

::: strings
nav3: 3 K the Attractor
:::

Step 3 · K the Attractor {#s3k .step-kicker i18n=text}

What if the population starts overloaded (N₀ &gt; K)? Drag N₀ above K and step generations: the count falls back toward K on its own. Both directions aim at K — **K is an attractor, not a wall you crash into**. Note this is a discrete model that jumps a whole generation at a time: if N₀ is far above K, one step brakes too hard and lands below K, then N climbs back from below; start even more overloaded and that single step would compute a negative number, so N₀ is capped here. {#s3e .explain}

::: html step3-1
s3n0Lab: Starting count N₀
s3kLab: Carrying capacity K
s3next: Next generation →
s3reset: Reset
:::

Takeaway: below K the effective rate is positive and N climbs; above K it turns negative and N falls. The forces on both sides point at K itself. {#s3conc .readout}

::: strings
s3ro: Generation <b>{g}</b>: N = <b>{n}</b>, distance to K is <b>{d}</b> (effective rate {eff}, sign included).
s3cap: N₀ cap = 2.5K = {m}: once N₀ &gt; K(1 + 1/r) ≈ {thr}, the very first step of this discrete model computes a negative population (the model breaks), so the slider is clamped to {m}.
:::

## Models have a range of validity {#step4 h2=s4t}

::: strings
nav4: 4 r Too Far
:::

Step 4 · r Too Far (Out-of-Bounds Lab) {#s4k .step-kicker i18n=text}

In the discrete iterations so far r never exceeded 1 (Step 2 slider max 1.0, Step 3 fixed at 0.6). The true thresholds of N ← N + rN(1 − N/K) are: **r ≤ 1 approaches K monotonically; 1 &lt; r &lt; 2 overshoots K and then settles back in damped oscillations; r &gt; 2 never settles** — first period-2, period-4… cycles, then past r ≈ 2.57 **chaos** (never repeating; a tiny change in the start gives a completely different path); past r = 3 it even computes negative numbers — a “crash”. This panel is the **out-of-bounds lab**, slider from 1 to 3.1. Caveat: for populations with overlapping generations and continuous breeding, this generation-to-generation jerkiness is mostly an artefact of the discrete model; but species with non-overlapping generations (many temperate insects) really can show such overshoot cycles and even chaos (May 1976), and real oscillations can have other causes too (e.g. the developmental time lag in Nicholson’s blowfly experiments). **Seeing a model fail is part of understanding it.** {#s4e .explain}

::: html step4-1
s4rLab: Growth rate r (r > 2 is out of bounds)
:::

Takeaway: every model has a validity range. The stable zone here comes from a stability condition (this discrete form returns to K only for r ≤ 2, with r = 2 the borderline); beyond it, oscillation, chaos and negative counts force the question: is it the discretisation talking, or does the population really behave this way? {#s4conc .readout}

::: strings
s4mono: Status: <b>monotone approach</b> — climbs toward K from below and never crosses it (the r ≤ 1 case).
s4damp: Status: <b>damped oscillation, then settles</b> — overshoots K, falls back, the wiggles shrink and N settles at K (still inside the stable zone r ≤ 2; r = 2 is the borderline case and settles very slowly).
s4osc: Status: <b>period-{p} oscillation</b> — in the long run N cycles among {p} values and never settles at K (last-6-generation spread {spread}).
s4oscLong: Status: <b>oscillating</b> — never settles at K; the cycle is longer than 64 generations (last-6-generation spread {spread}).
s4chaos: Status: <b>chaos</b> — neither settles nor cycles, never repeats; Lyapunov exponent λ ≈ {lam} &gt; 0, so tiny differences in the start grow every generation (last-6-generation spread {spread}).
s4crash: Status: <b>crashed</b> — generation {g} produced N ≤ 0; the model has left its valid range (real populations do not go negative; this is an artefact of the discrete iteration).
:::

## The page in three sentences {#step5 h2=s5t}

::: strings
nav5: 5 Finale
:::

Step 5 · Finale {#s5k .step-kicker i18n=text}

One: unconstrained proportional growth is exponential, with doubling time set by r. Two: with carrying capacity K, the effective rate r·(1 − N/K) shrinks as N approaches K, and iterating it produces the S (logistic) curve; K attracts from both sides. Three: for r &gt; 2 the discrete iteration no longer settles (oscillation, chaos, and for r &gt; 3 negative counts) — model boundaries must be stated, not hidden. {#s5e .explain}

::: html step5-1
s5lkExp: Upstream: Exponentials & Logarithms (the foundation) →
s5lkEq: Side link: Chemical Equilibrium — another self-braking system →
:::

Notation: in Step 1, r is a continuous rate (e<sup>rt</sup>; doubling time ln2/r applies only to it); in Steps 2–4, r is a per-generation discrete rate (multiply by 1 + r each generation). Same letter, different quantity. Model boundary: this page uses the discrete iteration N ← N + rN(1 − N/K) and the continuous exponential as teaching models. The bacteria scenario is illustrative; real populations also depend on age structure, migration, time lags and random fluctuations, and parameters must be fitted to data — never read simulated values as measurements. {#s5bound .hint}
